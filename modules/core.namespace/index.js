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

api.actions = new Set;

/**
 * Выполнить действие с заданным ID.
 */
api.do = function (aid, params, callback) {
	return api.actions[aid](params, callback);
};

/**
 * Зарегистрировать действие.
 */
api.registerAction = function (action) {
	//if (assert.type(action, Action, callback)) {
		api.actions[action.name] = action;
	//}
};

api.bus = new EventEmitter;