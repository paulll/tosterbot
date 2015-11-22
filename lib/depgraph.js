"use strict";
let toposort = require('toposort')

// Hard Link (default)  -  if target unreachable, then source set to unreachable
// Soft Link 			-  if target unreachable, then ignore it
// 
// #addNode({name: name})
// #addLink({from: from, to:to, hard: hard})
// #solve({}) -> [module1, module2]

class DependencyGraph  {
	constructor () {
		this.nodes = new Set;
		this.links = new Array;
		this.required = new Set;
	}

	/**
	 * name: str
	 */
	addNode(options) {
		this.nodes.add(options.name);
	}

	/**
	 * from: str
	 * to: str
	 * hard: bool
	 */
	addLink(options) {
		this.links.push([
			options.from,
			options.to
		]);

		if (options.hard !== false) {
			this.required.add(options.to);
		}
	}

	/**
	 * (empty)
	 */
	solve() {
		let order = toposort.array(Array.from(this.nodes), this.links).reverse(),
			errors = [];

		for (let item of order) {
			if (!this.nodes.has(item) && this.required.has(item)) {
				errors.push(`[Ошибочка]: Необходим модуль ${item}, но его нет.`);
			}
		}

		return {
			errors: errors,
			order: order
		}
	}
}

exports.DependencyGraph = DependencyGraph;
