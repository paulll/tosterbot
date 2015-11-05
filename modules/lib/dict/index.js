"use strict";

var check = require('./dictcheck.js'),
	Parser = require('./dictparser.js'),
	rand = require('./dictrandom.js'),
	meta = require('./dictmeta.js'),
	args = require('./dictargs.js'),
	fs = require('fs');

api.lib.dict = {};
api.lib.dict.rules = [];
api.lib.dict.dict = new Map();

api.lib.dict.loadRules = function (file, callback) {
	fs.readFile(file, {encoding: 'utf8'}, function (error, data) {
		if (error) {
			callback(error);
		} else {
			let dicts = meta(data).map(function (data) {
				return {
					params: data.params,
					ast: (new Parser(data.code)).optimized
					//ast: JSON.parse(JSON.stringify(parse(data.code)), restore)
				}
			});

			api.lib.dict.rules = api.lib.dict.rules.concat(dicts);
			callback(null, dicts);
		}
	});
};

api.lib.dict.loadDict = function (file, callback) {
	fs.readFile(file, {encoding: 'utf8'}, function (error, data) {
		if (error) {
			callback(error);
		} else {
			meta(data).forEach(function (data) {
				api.lib.dict.dict.set(data.params.name, data.params);
				data.params.text = (new Parser(data.code)).optimized
			});
			callback(null);
		}
	});
};


api.lib.dict.parse = function (string) {
	var simple = string // api.lib.simplify(string);
	for (let rule of api.lib.dict.rules) {
		let checkResult;
		if (checkResult = check(rule.ast, simple)) {
			let response = Object.create(rule.params);
			response.scope = checkResult.scope;
			return response;
		}
	}
};

api.lib.dict.generate = function (id, arg) {
	if (typeof api.lib.dict.dict.get(id) === 'undefined') {
		return false;
	}
	var response = Object.create(api.lib.dict.dict.get(id));
	response.text = args(rand(response.text), arg);
	return response;
};


function restore(k, v) {
	if (typeof v === 'string') {
		if (~v.indexOf('__raw__! ')) {
			return v.substr('__raw__! '.length);
		}
		return v //api.lib.simplify(v);
	}
	if (v.hasOwnProperty('v')) {
		let e = new Set(v.v);
		for (let i in v) {
			if (v.hasOwnProperty(i)) {
				e[i] = v[i];
			}
		}
		return e;
	}
	return v;
}