"use strict";

/**
 * Если множество
 *   Для каждого значения
 *     Если значение - строка
 *       Если она подходит
 *         Вернуть остаток строки
 *     Если не строка
 *       Возвращать результаты рекурсии
 * Если массив
 *   Если первый элемент - строка
 *     Если она подходит
 *       Если остались еще элементы массива
 *         Возвращаем рекурсию от оставшихся элементов
 *       Если массив остался пустым
 *         Вернуть остаток строки
 *   Если не строка
 *     Для каждого варианта остатка строки
 *       Если остались еще элементы
 *         Возвращаем рекурсию от оставшихся элементов
 *       Если массив остался пустым
 *         Вернуть остаток строки
 */

function TokenList (rest, part) {
	this.rest = rest.rest.substr(part.length);
	this.stack = rest.stack.concat([part]);
	this.substr = String.prototype.substr.bind(this.rest);
	this.indexOf = String.prototype.indexOf.bind(this.rest);
}

function Input (start) {
	this.rest = start;
	this.stack = [];
	this.substr = String.prototype.substr.bind(this.rest);
	this.indexOf = String.prototype.indexOf.bind(this.rest);
}

function* check (rest, tree) {
	if (tree instanceof Set) {
		for (let value of tree) {
			if (typeof value === 'string') {
				if (rest.indexOf(value) === 0) {
					yield new TokenList(rest, value);
				}
			} else {
				yield* check(rest, value);
			}
		}
	} else {
		if (typeof tree[0] === 'string') {
			if (rest.indexOf(tree[0]) === 0) {
				if (tree.length - 1) {
					yield* check(new TokenList(rest, tree[0]), tree.slice(1));
				} else {
					yield new TokenList(rest, tree[0]);
				}
			}
		} else {
			for (let str of check(rest, tree[0])) {
				if (tree.length - 1) {
					yield* check(str, tree.slice(1));
				} else {
					yield str;
				}
			}
		}
	}
}

var tests = [
	[
		'Should support single Sets',
		new Set(['a', 'b', 'c']),
		'b'
	],
	[
		'Should support nested Sets',
		new Set([new Set(['a', 'b', 'c'])]),
		'b'
	],
	[
		'Should support concat (Arrays)',
		new Set([[new Set(['a', 'b', 'c']), new Set(['a', 'b', 'c'])]]),
		'ac'
	],
	[
		'Should handle wrong ways',
		new Set([[new Set(['ab', 'cb', 'c']), new Set(['c', 'a', 'bR'])]]),
		'cbR'
	],
	[
		'Should handle nested arrays',
		new Set([[['a', 'b'], 'c']]),
		'abc'
	],
	[
		'Should just work',
		new Set([
		    new Set([["прив", new Set(["", "ет"])], "приветик", "l"]),
		    new Set(["здраствуй", "здарова", "здорова", "здраствуйте", "здравия желаю", "здаров"]),
		    new Set(["хай", "хей", "хелло", "хеллоу", "хело", "хелоу"]),
		    new Set(["зд", "првт", "хлло", "здрствй", "здрствуй", "приветь", "приветъ"]),
		]),
		'прив'
	],
	[
		'Should support something more',
		new Set([[
			'flag-',
			new Set(["{pref-1}", "{pref-2}", "{pref-3}"]),
			new Set(["{root-1}", "{root-2}", "{root-3}"]),
			new Set(["{suff-1}", "{suff-2}", "{suff-3}"]),
			new Set(["{wro", "{wrong-1}", "{wrong"]),
			new Set(["ng", "-"]),
			new Set(["{end-1}", "{end-2}", "{end-3}"]),
		]]),
		'flag-{pref-1}{root-3}{suff-1}{wrong-1}-{end-2}'
	]
];


function restore(k, v) {
	if (v.hasOwnProperty('v')) {
		return new Set(v.v);
	}
	return v;
}


module.exports = function (ast, string) {
	var success = false;
	let generator = check(new Input(string), ast);

	for (var value of generator) {
		console.log(value);
		if (value.rest == '') {
			success = true;
			break;
		}
	}

	return success ? value.stack : success;
}

tests.forEach(function (test) {
	if (module.exports(test[1], test[2])) {
		console.log('[SUCC]', test[0])
	} else {
		console.log('[FAIL]', test[0]);
	}
})