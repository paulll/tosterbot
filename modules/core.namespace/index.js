var EventEmitter = require('events').EventEmitter;

global.api = new EventEmitter;
global.api.notify = {};
global.api.action = {};
global.api.lib = {};
global.api.sense = {};
global.api.lang = {};
global.api.core = {};
global.api.data = {};
global.api.security = {};
global.api.memory = {};
global.api.parser = {};

global.api.io = new EventEmitter;
global.api.io.providers = new Set;
global.api.io.sessions = new Set;

global.api.bus = new EventEmitter;