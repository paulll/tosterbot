"use strict";

api.lib.iterate = {};

api.lib.iterate.reduce = function reduce (iterator, accumulator, funct, callback) {
	let item = iterator.next();
	if (item.done) {
		return callback(null, accumulator);
	}
	funct (accumulator, item.value, function (error, data) {
		if (error) {
			return cb(error);
		}
		setTimeout(function() {
			reduce(iterator, data, funct, callback);
		}, 0);
	});
};