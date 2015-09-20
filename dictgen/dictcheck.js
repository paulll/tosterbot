"use strict";

function* check (string, tree, stack) {
	if (tree instanceof Set) {
		setloop:
		for (let value of tree) {
			if (typeof value === 'string') {
				if (string == value) {
					yield '';
					break;
				} else {
					if (string.indexOf(value) === 0) {
						yield string.substr(value.length);
					} else {
						continue;
					}
				}
			} else {
				steploop:
				for (let step of check(string, value)) {
					if (step[1] == '') {
						yield step;
						break setloop;
					} else {
						yield step;
					}
				}
			}
		}
	} else {
		if (typeof tree[0] === 'string') {
			if (string == tree[0]) {
				yield '';
			} else {
				if (string.indexOf(tree[0]) === 0) {
					if (tree.length - 1) {
						yield* check(string.substr(tree[0].length), tree.slice(1));
					} else {
						yield string.substr(tree[0].length);
					}
				}
			}
		} else {
			for (let str of check(string, tree[0])) {
				if (tree.length - 1) {
					yield* check(str, tree.slice(1));
				} else {
					yield str;
				}
			}
		}
	}
}


function restore(k, v) {
	if (v.hasOwnProperty('v')) {
		return new Set(v.v);
	}
	return v;
}


module.exports = function (ast, string) {
	return check(string, ast).next().value == '';
}