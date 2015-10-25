"use strict";

var check = require('./dictcheck.js'),
	parse = require('./dictparse.js'),
	rand = require('./dictrandom.js'),
	meta = require('./dictmeta.js'),
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
					ast: JSON.parse(JSON.stringify(parse(data.code)), restore)
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
				api.lib.dict.dict[data.params.name] = data.params;
				api.lib.dict.dict[data.params.name].text = parse(data.code);
			});
			callback(null);
		}
	});
};


api.lib.dict.parse = function (string) {

	console.log(string);

	var simple = api.lib.simplify(string);
	for (let rule of api.lib.dict.rules) {
		let tokens;
		if (tokens = check(rule.ast, simple)) {
			let response = Object.create(rule.params);
			response.tokens = tokens;
			return response;
		}
	}
};

api.lib.dict.generate = function (id) {
	if (typeof api.lib.dict.dict[id] === 'undefined') {
		return false;
	}
	var response = Object.create(api.lib.dict.dict[id]);
	response.text = rand(response.text);
	return response;
};


function restore(k, v) {
	if (typeof v === 'string') {
		return api.lib.simplify(v);
	}
	if (v.hasOwnProperty('v')) {
		return new Set(v.v);
	}
	return v;
}