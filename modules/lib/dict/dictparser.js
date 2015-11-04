"use strict";

class Parser {
	constructor(source) {
		this.ast = new Set();
		this.scope = new Map();
		this.context = new Map();
		this.handers = new Map();

		let tokens = source
			.replace(/,\s+/gm, ',')
			.replace(/\s+=\s+/gm, '=')
			.replace(/^([^\n])/gm, 'LINE_START$1')
			.match(/(%[^%]+?%|\?|LINE_START|\n|=|!|,|&\(|\)|return\s+|[^%\n?=!,&()]+)/gm);

		this.handers
			.set('LineStart', /^LINE_START$/)
			.set('LineVariableName', /^(?!return\s+)[^%\n?=!,&()]+$/)
			.set('EqualSign', /^=$/)
			.set('NotStrict', /^\?$/)
			.set('Strict', /^!$/)
			.set('DelimeterComma', /^,$/)
			.set('NamerStart', /^&\($/)
			.set('NamerName', /^[^%\n?=!,&()]+$/)
			.set('NamerComma', /^,$/)
			.set('NamerVariable', /^%[^%]+?%$/)
			.set('NamerEnd', /^\)$/)
			.set('Variable', /^%[^%]+?%$/)
			.set('Text', /^[^%\n?=!,&()]+$/)
			.set('LineEnd', /^\n$/)
			.set('Return', /^return\s+$/)
			.set('ReturnValue', /^[^%\n?=!,&()]$/);

		this.wait = ['LineStart'];

		//
		// Run this.
		//

		for (let token of tokens) {
			let found = false;
			for (let expected of this.wait) {
				if (this.handers.get(expected).test(token)) {
					found = true;
					this[expected](token);
					break;
				}
			}
			if (!found) {
				throw new SyntaxError(`Expected ${this.wait.join(', or ')} got "${token}" instead`);
			}
		}

		if (!~this.wait.indexOf('END')) {
			throw new SyntaxError(`Expected ${this.wait.join(', or ')} got <END> instead`);
		}

	}

	LineStart() {
		this.wait = ['LineVariableName', 'Return'];
	}

	LineVariableName(token) {
		this.wait = ['EqualSign'];
		this.context.set('lineVariable', token);
	}

	EqualSign() {
		this.wait = ['Variable', 'NamerStart', 'Text'];
		this.context.set('fragment', []);
		this.context.set('item', []);
		this.context.set('line', new Set);
	}

	NotStrict () {
		this.wait = ['Variable', 'NamerStart', 'Text', 'DelimeterComma', 'LineEnd'];
		this.context.get('item').push(new Set([ // OPTIMIZE -> check if empty
			this.context.get('fragment'),
			''
		]));
		this.context.set('fragment', []);
	}

	Strict () {
		this.wait = ['Variable', 'NamerStart', 'Text', 'DelimeterComma', 'LineEnd'];
		this.context.get('item').push(this.context.get('fragment')); // OPTIMIZE -> concat
		this.context.set('fragment', []);
	}

	DelimeterComma() {
		this.wait = ['Variable', 'NamerStart', 'Text'];

		if (this.context.get('fragment')) {
			// COPY from this.Strict
			this.context.get('item').push(this.context.get('fragment')); // OPTIMIZE -> concat
			this.context.set('fragment', []);
		}

		this.context.get('line').add(this.context.get('item'));
		this.context.set('item', []);
	}

	NamerStart () {
		this.wait = ['NamerName'];
	}

	NamerName (token) {
		this.wait = ['NamerComma'];
		this.context.set('namer.name', token);
	}

	NamerComma () {
		this.wait = ['NamerVariable'];
	}

	NamerVariable (token) {
		this.wait = ['NamerEnd'];
		token.name = this.context.get('namer.name')
		this.context.get('fragment').push(token);
	}

	NamerEnd () {
		this.wait = ['Variable', 'NamerStart', 'Text', 'DelimeterComma', 'NotStrict', 'Strict', 'LineEnd'];
	}

	Variable(token) {
		this.wait = ['Variable', 'NamerStart', 'Text', 'DelimeterComma', 'NotStrict', 'Strict', 'LineEnd'];
		
		let name = token.substr(1, token.length - 2);
		this.context.get('fragment').push(this.scope.get(name));
	}

	Text (token) {
		this.wait = ['Variable', 'NamerStart', 'Text', 'DelimeterComma', 'NotStrict', 'Strict', 'LineEnd'];
		this.context.get('fragment').push(token);
	}

	Return () {
		this.wait = ['ReturnValue'];
	}

	ReturnValue (token) {
		this.wait = ['END'];
		this.ast = this.scope.get(token);
	}

	LineEnd(token) {
		this.wait = ['LineStart'];
		
		if (this.context.get('fragment')) {
			// COPY from this.Strict
			this.context.get('item').push(this.context.get('fragment')); // OPTIMIZE -> concat
			this.context.set('fragment', []);
		}

		this.context.get('line').add(this.context.get('item'));
		this.context.set('item', []);

		this.scope.set(
			this.context.get('lineVariable'),
			this.context.get('line')
		);
	}

	/**
	 *  - flatten arrays
	 *  - remove empty sets and arrays
	 * DOES NOT optimize Sets because it may break NamedSets
	 */
	optimize (object) { 
		if (Array.isArray(object)) {
			if (object.length == 0) {
				return null;
			}
			if (object.length == 1) {
				return this.optimize(object[0]);
			}

			return this._flatten(object, true).map(this.optimize.bind(this)).filter(x => x !== null);
		} else if (typeof object === 'string') {
			return object;
		} else { // Set
			if (object.size == 0) {
				return null;
			}

			let newSet = new Set;

			for (let item of object) {
				let newItem = this.optimize(item);

				if (newItem !== null) {
					newSet.add(newItem);
				}
			}

			return newSet;
		} 
	}

	_flatten(array, mutable) {

	    var result = [], 
	    	nodes = (mutable && array) || array.slice(),
	    	node;

	    if (!array.length) {
	        return result;
	    }

	    node = nodes.pop();

	    do {
	        if (Array.isArray(node)) {
	            nodes.push.apply(nodes, node);
	        } else {
	            result.push(node);
	        }
	    } while (nodes.length && (node = nodes.pop()) !== undefined);

	    result.reverse();
	    return result;
	}
}

let e = new Parser('a = a, b, c, d, e, f\nf = %a% d\nreturn f');

let i = require('util').inspect.bind(require('util')),	
	l = console.log.bind(console);

l(i(e.ast, false, null));
//console.log(e.scope);
l(i(e.optimize(e.ast), false, null));