// Язык для получения всех вариантов строк, подходящих под условие.
// Конструкции языка:
// список = элемент 1, элемент 2				 			-	 создание списка
// иной список = %список%статичная_строка 			 		-	 создание измененного списка (включает каждый элемент переменной "список", конкатентированный со строкой "статичная_строка")
// и еще один список = что-то | %список% | %иной список%	-	 сложение списков (все значения, по сути, списки)
// очередной список = %список%а!бв?г?						-	 от ! до ? или от ? до ? является необязательным (яб!ло?ко? -> яб, ябло, ябко, яблоко)
// return список											- 	 вывод данных, ага
// 
// 1. разбить на токены
// 2. обрабатывать их.. 
// да ну в жопу, давненько я не говнокодил 

var fs = require('fs'),
	path = require('path'),
	executable = process.argv.pop();

function run (input) {
	var scope = {};
	
	function include (_, __, file, as) {
		scope[as] = fs.readFileSync(path.join(path.dirname(executable), file), {encoding: 'utf8'}).split('\n');	
		return '';
	}

	input = input.replace(/(include|import)\s+(.*)\s+as\s+(.*)\n/gm, include).replace(/\n{2,}/gm, '\n');

	return input.split('\n').map(function(line){
		if (line.substr(0, ('return ').length) == 'return ') {
			console.log(scope[line.substr(('return ').length)].join('\n'));
			process.exit(0);
		} else {
			var pair = line.split('=');
			scope[pair[0].trim()] = operation(scope, pair[1].trim().match(/%[^%]+?%|[a-z0-9A-Zа-яА-Я ,\-_ĥŭĵĝĉŝ']+|\||[?]|!/g).map(function(t){return t.trim()}));
		}
	});
}



function operation(scope, tokens) {
	var list = [];
	tokens.split('|').forEach(function (part) {
		var variants = [''];
		presplit(part, function (tokens) {
			var values = [''];
			tokens.forEach(function (token) {
				if (token.charAt(0) == '%') {
					values = cartesian(values, scope[token.substr(1, token.length - 2)]).map(function (arr){
						return arr.join('');
					});
				} else {
					values = cartesian(values, token.split(/,\s*/g)).map(function (arr){
						return arr.join('');
					});
				}
			});
			return values;
		}).forEach(function (value) {
			variants = cartesian(variants, value).map(function (arr) {
				return arr.join('');
			}); // cartesian works like map (variant+=v.value), but supports arrays;
		});
		list = list.concat(variants);
	});
	//console.log(list);
	return list;
}

function presplit(array, callback) {
	var parts = [], temp = [];
	array.forEach(function (token) {
		if (token == '?' || token == '!') {
			var val = callback(temp);
			if (token == '?') {
				val.push('');
			}
			parts.push(val);
			temp = [];
		} else {
			temp.push(token);
		}
	});
	parts.push(callback(temp));
	return parts;
}

function cartesian(paramArray) {

	function addTo(curr, args) {

		var i, copy, 
				rest = args.slice(1),
				last = !rest.length,
				result = [];

		for (i = 0; i < args[0].length; i++) {

			copy = curr.slice();
			copy.push(args[0][i]);

			if (last) {
				result.push(copy);

			} else {
				result = result.concat(addTo(copy, rest));
			}
		}

		return result;
	}


	return addTo([], Array.prototype.slice.call(arguments));
}

Array.prototype.split = function (what) {
	var newArray = [], temp = [];
	for (var i=0,l=this.length;i<l;i++) {
		if (this[i] == what) {
			newArray.push(temp);
			temp = [];
		} else {
			temp.push(this[i]);
		}
	}
	if (temp.length) {
		newArray.push(temp);
	}
	return newArray;
}

run(fs.readFileSync(executable, { encoding: 'utf8' }));