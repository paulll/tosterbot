"use strict";

api.lib.iterate = {};

api.lib.iterate.reduce = function reduce (iter, ac, fn, cb) {
	let item = iter.next();
	if (item.done) {
		return cb(null, ac);
	}
	fn (ac, item.value, function (error, data) {
		if (error) {
			return cb(error);
		}
		setTimeout(function() {
			reduce(iter, data, fn, cb);
		}, 0);
	});
};