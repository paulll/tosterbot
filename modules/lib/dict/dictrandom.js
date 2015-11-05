"use strict";

function random(a) {
	if (Array.isArray(a)) {
		var string = '';

		for (let element of a) {
			string += (Array.isArray(element) || element instanceof Set) ? random(element) : element;
		}

		return string;
	} else {
		if (a instanceof Set) {
			var i = 0,
				index = Math.floor(Math.random() * a.size);
			for (let value of a) {
				if (i++ == index) {
					return (Array.isArray(value) || value instanceof Set) ? random(value) : value;
				}
			}
		}
	}
}

module.exports = random;