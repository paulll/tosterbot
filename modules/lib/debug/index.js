/*
	fn:boolean		api.lib.debug.handleError(Error, [Enum api.lib.debug.level]),
	fn:undefined	api.lib.debug.log(message, [level])
	fn:undefined	api.lib.debug.warn(message)
	enum			api.lib.debug.level
	fn:(error)		api.lib.debug.throws(Error, [callback])
	object			api.lib.debug.errors
		* NotImplementedError
*/

"use strict";
require('colors');

const fatal_prefix	=	'[FATAL!]'.red;
const error_prefix	=	'[ERROR]'.red;
const warn_prefix	=	'[WARN]'.yellow;
const info_prefix	=	'[INFO]'.cyan;
const debug_prefix	=	'[DEBUG]'.gray;

api.lib.debug = {};

api.lib.debug.handleError = function (error, level, callback) {
	if (!level || typeof level !== 'object') {
		level = api.lib.debug.level.error;

		if (typeof level === 'function') {
			callback = level;
		}
	}

	if (error) {

		console.trace();
		throw error;

		switch(level) {
			case api.lib.debug.level.fatal:
				throw error;
				break;
			case api.lib.debug.level.error:
				console.log(error_prefix, error);
				break;
			case api.lib.debug.level.warn:
			case api.lib.debug.level.warning:
				console.log(warn_prefix, error);
				break;
			case api.lib.debug.level.info:
				console.log(info_prefix, error);
				break;
			case api.lib.debug.level.debug:
				console.log(debug_prefix, error);
				break;
		}
		if (callback) {
			callback(error)
		}
		return false;
	} else {
		return true;
	}
};

api.lib.debug.log = function (message, level) {
	if (!level) {
		level = api.lib.debug.level.info;
	}
	switch(level) {
		case api.lib.debug.level.fatal:
			console.log(fatal_prefix, message);
			break;
		case api.lib.debug.level.error:
		case api.lib.debug.level.err:
			console.log(error_prefix, message);
			break;
		case api.lib.debug.level.warn:
		case api.lib.debug.level.warning:
			console.log(warn_prefix, message);
			break;
		case api.lib.debug.level.info:
			console.log(info_prefix, message);
			break;
		case api.lib.debug.level.debug:
			console.log(debug_prefix, message);
			break;
	}
};

api.lib.debug.warn = function (message) {
	api.lib.debug.log(message, api.lib.debug.level.warn);
}

api.lib.debug.info = function (message) {
	api.lib.debug.log(message, api.lib.debug.level.info);
}

api.lib.debug.debug = function (message) {
	api.lib.debug.log(message, api.lib.debug.level.debug);
}

api.lib.debug.error = function (message) {
	api.lib.debug.log(message, api.lib.debug.level.error);
}

api.lib.debug.level = {
	// Фатальное исключение, угроза работы системы
	fatal: {},

	// Непредвиденное поведение, но не критично
	error: {},

	// Незначительная ошибка, которая ровным счетом ни на что не влияет
	warn: {},
	warning: {},

	// Отладочная информация
	debug: {},

	// Важная информация
	info: {}
};

api.lib.debug.throws = function (error, callback) {
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

api.lib.debug.errors = {
	NotImplementedError: class NotImplementedError extends Error {},
	NotFoundError: class NotFoundError extends Error {}
}