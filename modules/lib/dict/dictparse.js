/**
 * Возвращает множества, которые нужно перемножать.
 */

function parse (source) {
	var ast, scope = new Map;
	
	source
		.replace(/,\s+/gm, ',')
		.replace(/\s+=\s+/gm, '=')
		.match(/(%[^%]+?%|\?|\n|=|!|,|return\s+|[^%\n?=!,]+)/gm)
		.split('\n')
		.find(function(line) {
			var parts = line.split('=');
			if (parts.length == 2) {
				scope[parts[0]] = (parts[1]
					.map(function(token) {
						if (token.charAt(0) == '%' && token.charAt(token.length-1) == '%') {
							var varname = token.substr(1, token.length-2);
							if (typeof scope[varname] === 'undefined') {
								console.log('Переменная', varname, 'не определена');
								console.log('Определены:', scope);
								return process.exit(1);
							}
							//console.log(varname, scope[varname])
							return scope[varname];
						} else {
							return token;
						}
					})
					.reduce(function(data, token) {

						// 1.
						// first = a, b?e, c
						// second = a, b, c
						// third = brain!fuck?
						// all = %first%%second%c
						//
						// 1.1
						// [Set(a, [Set(b, ''), e], c)]
						// 
						// 1.2
						// [Set(a, b, c)]
						// 
						// 1.3
						// [brain, Set(fuck, '')]
						// 
						// 1.4
						// [Set(a, [Set(b, ''), e], c), Set(a, b, c), c]
						//
						// 
						


						switch (token) {
							case ",":
								if (data.accumulator) {
									data.top.push(data.accumulator);
									data.accumulator = null;
								}
								//if (false) {
								if (data.top.length == 1) {
									data.ast.add(data.top.pop());
								} else {
									data.ast.add(data.top);
									data.top = [];
								}
								
								break;
							case "!":
								data.top.push(data.accumulator);
								data.accumulator = null;
								break;
							case "?":
								if (! (data.top.last() instanceof Set)) {
									data.top.push(new Set(['']));
								}
								data.top.last().add(data.accumulator);
								data.accumulator = null;
								break;
							default:
								if (data.accumulator) {
									if (Array.isArray(data.accumulator)) {
										data.accumulator.push(token);
									} else {
										data.accumulator = [data.accumulator, token];
									}
								} else {
									data.accumulator = token;
								}
						}

						data.end = function () {
							if (data.accumulator) {
								data.top.push(data.accumulator);
							}
							if (data.top.length) {
								if (data.top.length == 1) {
									data.ast.add(data.top.pop());
								} else {
									data.ast.add(data.top);
								}
							}
							return data.ast;
						}

						return data;
					}, {
						ast: new Set(),
						accumulator: null,
						top: []
					}).end())
			} else {
				if (line[0].substr(0, 6) == 'return') {
					if (typeof scope[line[1]] === "undefined") {
						return false;
					} else {
						//console.log(scope);
						ast = scope[line[1]];
						return true;
					}
				}
			}
		});
	//console.log(require('util').inspect(ast, false, 10));
	return ast;
};

Array.prototype.split = function (delimeter) {
	var array = [], accumulator = [];
	for (var i=0,l=this.length;i<l;i++) {
		if (this[i] === delimeter) {
			array.push(accumulator);
			accumulator = [];
		} else {
			accumulator.push(this[i]);
		}
	}
	if (accumulator.length) {
		array.push(accumulator);
	}
	return array;
};

Array.prototype.last = function () {
	return this[this.length - 1];
};

Array.prototype.top = function () {
	var top = this.last();
	if (Array.isArray(top)) {
		if (Array.isArray(top.top())) {
			return top.top();
		} else {
			return top.top.top();
		}
	} else {
		return top;
	}
};

Set.prototype.toJSON = function () {
	return {
		v: Array.from(this)
	};
};

Object.prototype.debug = function () {
	console.log(this);
	return this;
};

module.exports = parse;

/**

process.stdin.setEncoding('utf8');

var buffer = '';
process.stdin.on('data', function (chunk) {
	buffer += chunk;
});
process.stdin.on('end', function () {
	process.stdout.write(JSON.stringify(parse(buffer)))
})

var code = "first = a, b?e!, c\n\
second = a, b, c\n\
third = brain!fuck?\n\
all = %first% %second% c\n\
return all";

//console.log(require('util').inspect(parse(code), false, 10));

**/