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

function* check (rest, tree) {

}

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
		if (value.rest == '') {
			success = true;
			break;
		}
	}

	return success ? value.stack : success;
}