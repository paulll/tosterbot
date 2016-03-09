"use strict";

function final (set) {
	let final = true;
	for (let item of set) {
		if (typeof item !== 'string') {
			final = false;
		}
	}
	return final;
}

function uneval (deph, expr) {

	let tabs = Array(deph).fill('\t').join('');

	if (expr instanceof Set) {
		if (expr.name) {
			if (final(expr)) {
				return `${tabs}new NamedSet('${expr.name}', [${Array.from(expr).map(uneval.bind(null, 0)).join(',')}])`;
			} else {
				return `${tabs}new NamedSet('${expr.name}', [\n${Array.from(expr).map(uneval.bind(null, deph+1)).join(',\n')}\n${tabs}])`;
			}
		} else {
			if (final(expr)) {
				return `${tabs}new Set([${Array.from(expr).map(uneval.bind(null, 0)).join(',')}])`;
			} else {
				return `${tabs}new Set([\n${Array.from(expr).map(uneval.bind(null, deph+1)).join(',\n')}\n${tabs}])`;
			}
		}
	} else if (Array.isArray(expr)) {
		if (final(expr)) {
			return `${tabs}[${Array.from(expr).map(uneval.bind(null, 0)).join(',')}]`;
		} else {
			return `${tabs}[\n${Array.from(expr).map(uneval.bind(null, deph+1)).join(',\n')}\n${tabs}]`;
		}
	} else if (typeof expr == 'string') {
		return `${tabs}'${expr}'`;
	} else {
		console.log(deph, expr, typeof expr);
		throw new Error('Wat?');
	}
}


exports.uneval = uneval;