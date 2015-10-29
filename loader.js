#!/usr/bin/env node
"use strict";
/* @flow */

let fs = require('fs'),
	path = require('path'),
	assert = require('assert'),
	os = require('os');


/**
 * Для отладочных нужд
 */
console.log(
	"OS:",
	os.platform(),
	os.release(),
	os.arch()
);

/**
 * Тестируем наличие модулей
 */
let depsOk = checkRequired({
	'async': 'npm',
	'dependency-graph': 'npm',
	'./lib/modulesDetect.js': 'file',
	'modules/': 'folder'
});

assert.ok(depsOk, "Обнаружены неразрешенные зависимости ядра Системы.");

/**
 * Начинаем загружать другие модули
 */
let async = require('async'),
	graph = new (require('dependency-graph').DepGraph),
	detect = require('./lib/modulesDetect');


console.log('Обнаружение модулей');
detect('modules/', function (error, modules) {
	assert.ifError(error);

	console.log('Обнаружено', modules.length, 'модулей.');
	let modulesMap = new Map(),
		success = true;

	modules = modules.filter ( module => !module.manifest.disabled );

	// register module
	for (let module of modules) {
		graph.addNode(module.manifest.name);
		modulesMap.set(module.manifest.name, module);
	}

	// check module deps
	for (let module of modules) {

		let manifest = module.manifest;
		
		// (aliases) manifests, that should be loaded before this. 
		if (typeof manifest.after !== 'undefined') {
			manifest.after.forEach(function (dep) {
				graph.addDependency(manifest.name, dep);
			});
		}
		if (typeof manifest.deps !== 'undefined') {
			manifest.deps.forEach(function (dep) {
				graph.addDependency(manifest.name, dep);
			});
		}
		if (typeof manifest.dependences !== 'undefined') {
			manifest.dependences.forEach(function (dep) {
				graph.addDependency(manifest.name, dep);
			});
		}
		
		// (aliases) manifests, that should be loaded after this.
		if (typeof manifest.before !=='undefined') {
			manifest.before.forEach(function (dep) {
				graph.addDependency(dep, manifest.name);
			});
		}

		// npm dependences
		if (typeof manifest.deps_npm !== 'undefined') {
			manifest.deps_npm.forEach(function(dep) {
				
				// TODO: check versions
				// TODO: autoinstall deps

				if (dep.shared) {
					if (!require.resolve(dep.name)) {
						success = false;
						console.log('[Ошибочка]: Необходим npm-модуль', dep.name, '\n', 'Пожалуйста выполните $ npm i', dep.name);
					}
				} else {
					let name = path.join(module.directory, 'node_modules', dep.name);
					if (fs.existsSync(name)) {
						if (!fs.statSync(name).isDirectory()){
							success = false;
							console.log('[Ошибочка]: Для модуля', manifest.name, 'необходим отдельно установленый npm-модуль', name, 'но по данному пути файл или что-то еще.');
						}
					} else {
						success = false;
						console.log('[Ошибочка]: Для модуля', manifest.name, 'необходим отдельно установленый npm-модуль', name);
					}
				}
			});
		}

		// file dependences
		if (typeof module.deps_files !== 'undefined') {
			module.deps_files.forEach(function(name) {
				if (fs.existsSync(name)) {
					if (!fs.statSync(name).isFile()){
						success = false;
						console.log('[Ошибочка]: Необходим файл', name, 'но по данному пути папка или что-то еще.');
					}
				} else {
					success = false;
					console.log('[Ошибочка]: Необходим файл', name, 'но его тут нет.');
				}
			});
		}
	}

	if (!success) {
		console.log('В ходе инициализации возникли ошибки и программа не может быть корректно запущена');
		process.exit(1);
	}

	console.log('Составлен граф зависимости модулей');

	let order = graph.overallOrder();

	async.mapSeries(order, function (moduleName, callback) {

		let module = modulesMap.get(moduleName);

		// запускает модуль
		let run = function (callback) {
			let mod = require('./' + path.join(module.directory, module.manifest.main));

			if (typeof module.manifest.async !== 'undefined') {
				mod[module.manifest.async](function (error) {
					if (error) {
						console.log('Один из модулей сообщил об ошибке. Выполнение завершено');
						console.error(error);
						process.exit(1);
					}

					callback();
				});
			} else {
				callback();
			}
		}

		// запускает тесты, если они есть
		if (typeof module.manifest.tests !== 'undefined') {
			if (typeof module.manifest.tests.before !== 'undefined') {
				let tests = require('./' + path.join(module.directory, module.manifest.tests.before));
			
				tests.run(function (success) {
					if (success) {
						run(function () {
							if (typeof module.manifest.tests.after !== 'undefined') {
								let tests = require('./' + path.join(module.directory, module.manifest.tests.after));

								tests.run(function (success) {
									if (success) {
										callback();
									} else {
										console.log('В ходе самотестирования обнаружена неполадка. Выполнение завершено.');
										process.exit(1);
									}
								});
							}
						});						
					} else {
						console.log('В ходе самотестирования обнаружена неполадка. Выполнение завершено.');
						process.exit(1);
					}
				});
			} else {
				run(function () {
					if (typeof module.manifest.tests.after !== 'undefined') {
						let tests = require('./' + path.join(module.directory, module.manifest.tests.after));

						tests.run(function (success) {
							if (success) {
								callback();
							} else {
								console.log('В ходе самотестирования обнаружена неполадка. Выполнение завершено.');
								process.exit(1);
							}
						});
					} else {
						callback();
					}
				});
			}
		} else {
			run(callback);
		}
	}, function () {
		console.log('Модули успешно загружены');
	});
});

function checkRequired(object) {
	let	success = true;

	for (let name in object) {
		if (!object.hasOwnProperty(name)) {
			continue;
		}

		switch (object[name]) {
			case 'npm':
				if (!require.resolve(name)) {
					success = false;
					console.log('[Ошибочка]: Необходим npm-модуль', name, '\n', 'Пожалуйста выполните $ npm i', name);
				}
				break;
			case 'file':
				if (fs.existsSync(name)) {
					if (!fs.statSync(name).isFile()){
						success = false;
						console.log('[Ошибочка]: Необходим файл', name, 'но по данному пути папка или что-то еще.');
					}
				} else {
					success = false;
					console.log('[Ошибочка]: Необходим файл', name, 'но его тут нет.');
				}
				break;
			case 'folder':
				if (fs.existsSync(name)) {
					if (!fs.statSync(name).isDirectory()){
						success = false;
						console.log('[Ошибочка]: Необходима папка', name, 'но по данному пути файл или что-то еще.');
					}
				} else {
					success = false;
					console.log('[Ошибочка]: Необходима папка', name, 'но её тут нет.');
				}
				break;
			default:
				success = false;
				console.log('[Ошибочка]: Разработчик, возможно, ошибся, и я не могу определить, что именно он подразумевает под', name, 'но оно явно необходимо для запуска');
		}
	}

	return success;
} 