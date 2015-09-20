var EventEmitter = require('events').EventEmitter;

global.api = new EventEmitter;
global.api.io = new EventEmitter;
global.api.notify = {};
global.api.action = {};
global.api.lib = {};
global.api.sense = {};
global.api.lang = {
	parsers: {},
	generators: {}
};
global.api.core = {};
global.api.data = {};
global.api.security = {};
global.api.memory = {};
global.api.parser = {};

global.api.io.sessions = [];

global.Message = function (value, session) {
	var self = this;

	self.value = value;
	self.session = session;

	this.toString = function () {
		return self.value;
	};
};

global.Triplet = function (subject, predicate, object, id) {
	this.subject = subject;
	this.predicate = predicate;
	this.object = object;

	this.id = id || null;
};

global.api.action.actions = new Map();
global.api.action.register = function (name, fn) {
	api.action.actions[name] = fn;
};
global.api.action.run = function (name, params, callback) {
	typeof params == 'function'
		? global.api.action.actions[name]({}, params)
		: global.api.action.actions[name](params, callback);
};

global.api.action.exists = function (name) {
	return (typeof api.action.actions[name] !== 'undefined');
};