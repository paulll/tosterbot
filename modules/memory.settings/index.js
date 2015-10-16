"use strict";

var fs = require('fs'),
	merge = require('merge'),
	settingsJson = fs.readFileSync('./settings.json', {encoding: "utf-8"}),
	settings = JSON.parse(settingsJson),
	MemoryProvider = api.lib.support.MemoryProvider,
	Triplet = api.lib.support.Triplet,
	NotFoundError = api.lib.debug.errors.NotFoundError;

// Читает и парсит json-файлы
function include (files) {
	return files.map(function (file) {
		let contentJson = fs.readFileSync(file, {encoding: "utf-8"}),
			content = JSON.parse(contentJson);
		return content;
	});
}

// Поддержка импортов
!(function recursiveImports(tree) {
	if (Array.isArray(tree)) {
		return tree.forEach(recursiveImports);
	}
	for (let leaf in tree) {
		if (tree.hasOwnProperty(leaf)) {
			if (leaf == '@include') {
				for (let inclusion of include(tree[leaf])) {
					merge.recursive(tree, inclusion);
				}
			} else if (typeof tree[leaf] == 'object') {
				recursiveImports(tree[leaf]);
			}
		}
	}
})(settings);

function getItem(root, string) {
	if (!root) {return undefined};

	let parts = string.split('.');
	if (parts.length === 1) {
		return root[string];
	} else {
		return getItem(root[parts.shift()], parts.join('.'));
	}
}

class SettingsTriplet extends Triplet {
	constructor (subject, object) {
		super();
		this.subject = subject;
		this.object = object;
		this.predicate = 'equals';
	}
}

class SettingsProvider extends MemoryProvider {
	get (subject, predicate, object, callback) {
		let item = getItem(settings, subject);
		if (item) {
			callback(null, new SettingsTriplet(subject, object));
		} else {
			callback(new NotFoundError);
		}
	}
}

api.memory.providers.add(new SettingsProvider);