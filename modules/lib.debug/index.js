/*

Подлежит реализации
[
	fn:boolean		api.debug.handleError(Error, [Enum api.debug.level]),
	fn:undefined	api.debug.log(message, [level])
	fn:undefined	api.debug.warn(message)
	enum			api.debug.level
	fn:(error)		api.debug.throws(Error, [callback])
	object			api.debug.errors
		* NotImplementedError
]

*/

"use strict";

const fatal_prefix	=	'[FATAL!] '.red;
const error_prefix	=	'[ERROR] '.red;
const warn_prefix	=	'[WARN] '.yellow;
const info_prefix	=	'[INFO] '.cyan;
const debug_prefix	=	'[DEBUG] '.gray;

api.debug = {};

api.debug.handleError = function (error, level) {
	if (!level) {
		level = api.debug.level.error;
	}

	if (error) {
		switch(level) {
			case api.debug.level.fatal:
				throw error;
				break;
			case api.debug.level.error:
				console.log(error_prefix, error);
				break;
			case api.debug.level.warn:
			case api.debug.level.warning:
				console.log(warn_prefix, error);
				break;
			case api.debug.level.info:
				console.log(info_prefix, error);
				break;
			case api.debug.level.debug:
				console.log(debug_prefix, error);
				break;
		}
		return false;
	} else {
		return true;
	}
};

api.debug.log = function (message, level) {
	if (!level) {
		level = api.debug.level.info;
	}
	switch(level) {
		case api.debug.level.fatal:
			console.log(fatal_prefix, message);
			break;
		case api.debug.level.error:
		case api.debug.level.err:
			console.log(error_prefix, message);
			break;
		case api.debug.level.warn:
		case api.debug.level.warning:
			console.log(warn_prefix, message);
			break;
		case api.debug.level.info:
			console.log(info_prefix, message);
			break;
		case api.debug.level.debug:
			console.log(debug_prefix, message);
			break;
	}
};

api.debug.warn = function (message) {
	api.debug.log(message, api.debug.level.warn);
}

api.debug.info = function (message) {
	api.debug.log(message, api.debug.level.info);
}

api.debug.debug = function (message) {
	api.debug.log(message, api.debug.level.debug);
}

api.debug.error = function (message) {
	api.debug.log(message, api.debug.level.error);
}

api.debug.level = {
	fatal: {},
	error: {},
	warn: {},
	warning: {},
	info: {},
	debug: {}
};

api.debug.throws = function (error, callback) {
	if (error) {
		if (callback) {
			callback(error);
		} else {
			throw error;
		}
		return false;
	} else {
		return true;
	}
}

api.debug.errors = {
	NotImplementedError: class NotImplementedError extends Error {}
}