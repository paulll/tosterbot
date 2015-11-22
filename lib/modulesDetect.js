'use strict';

var fs = require('fs'),
	path = require('path'),
	async = require('async');

module.exports = function detectModules(modulesDirectory, callback) {
	fs.readdir(modulesDirectory, function (error, types) {
		if (error) {
			callback(error)
		} else {
			async.map(types, function (type, callback) {
				let currentTypeDirectory = path.join(modulesDirectory, type);
				fs.readdir(currentTypeDirectory, function (error, currentModuleArray) {
					if (error) {
						callback(error);
					} else {
						async.map(currentModuleArray, function (currentModuleDirName, callback) {
							let currentModuleDirectory = path.join(currentTypeDirectory, currentModuleDirName);
							fs.readFile(path.join(currentModuleDirectory, 'module.json'), function (error, data) {
								if (error) {
									callback(error);
								} else {
									try {
										var parsed = JSON.parse(data);
									} catch (error) {
										return callback(error);
									}

									callback(error, {
										directory: currentModuleDirectory,
										manifest: parsed
									});
								}
							});
						}, function (error, modules) {
							if (error) {
								callback(error);
							} else {
								callback(error, modules);
							}
						});
					}
				});
			}, function (error, raw_modules) {
				if (error) {
					callback(error);
				} else {
					let modules = Array.prototype.concat.apply([], raw_modules);
					callback(error, modules)
				} 
			});
		}
	});
}