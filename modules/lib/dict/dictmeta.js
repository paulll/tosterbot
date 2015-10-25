"use strict";

function meta (source) {
	return splitByFunction(source.replace(/\n+/gm, '\n').split('\n'), -1, function (value) {
		return (value.indexOf('return') == 0);
	})
		.map(function (part) {
			var splitted, params = {},
				parts = splitByFunction(part, 1, function (value) {
				if (splitted) {
					return false;
				} else {
					if (value.charAt(0) !== '@') {
						return splitted = true;
					}
				}
			});

			parts[0].forEach(function(param) {
				
				param = param.substr(1);

				if (~param.split(/\s+/g)[0].indexOf('.')) {
					var val = param.split(/\s+/g),
						path = val.shift().split('.'),
						top = path.reduce(function(prev, cur, i, arr){
							if (i + 1 == arr.length) {
								return [prev, cur];
							}
							return prev[cur] = prev[cur] || {}; 
						}, params);

					top[0][top[1]] = isNaN(parseFloat(val.join(''))) ? val.join(' ') : parseFloat(val.join(''));
				} else {
					var val = param.split(/\s+/g);
					params[val.shift()] = isNaN(parseFloat(val.join(''))) ? val.join(' ') : parseFloat(val.join(''));
				}
			});

			return {
				params: params,
				code: parts[1].join('\n')
			}
		});
}


function splitByFunction (object, md, fn) {
	var array = [],
		accumulator = []

	for (let value of object) {
		if (fn(value)) {
			if (md === -1) {
				accumulator.push(value);
			}
			array.push(accumulator);
			accumulator = [];
			if (md === 1) {
				accumulator.push(value);
			}

		} else {
			accumulator.push(value);
		}
	}

	if (accumulator.length) {
		array.push(accumulator);
	}

	return array;
}


module.exports = meta;