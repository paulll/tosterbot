"use strict";

var EventEmitter = require('events').EventEmitter,
	settings = api.memory.settingProvider,
	fs = require('fs'),
	persist = require('./overrides.json');

class ConfigEditor extends EventEmitter {
	constructor () {
		super();
	}

	set (name, value, persistent) {
		if (persistent) {
			settings._injrec(persist, name.split('.'), value);
			fs.writeFile(__dirname+'/overrides.json', JSON.stringify(persist, null, '\t'));
		}

		settings.inject(name, value);

		api.lib.configedit.emit('change', {
			name: name,
			value: value
		});
	}
}

api.lib.configedit = new ConfigEditor;