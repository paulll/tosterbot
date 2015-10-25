"use strict";

var EventEmitter = require('events').EventEmitter;
global.api = new EventEmitter;

api.notify = {};
api.action = {};
api.lib = {};
api.core = {};
api.data = {};
api.security = {};

api.sense = new Map;

api.memory = {};
api.memory.providers = new Set;

api.parser = {};

api.io = new EventEmitter;
api.io.providers = new Set;
api.io.sessions = new Set;

api.lang = {};
api.lang.generators = new Set;
api.lang.parsers = new Set;

api.actions = new Map;

/**
 * Выполнить действие с заданным ID.
 */
api.do = function (aid, params, callback) {
	let action = api.actions.get(aid);
	if (action) {
		action.do(params, callback);
		return true;
	}
};

/**
 * Зарегистрировать действие.
 */
api.registerAction = function (action) {
	//if (assert.type(action, Action, callback)) {
		api.actions.set(action.name, action);
	//}
};

api.bus = new EventEmitter;