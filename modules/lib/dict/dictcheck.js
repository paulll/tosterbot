"use strict";

class Scope extends Map {
	constructor (root, name) {

		super(root);

		if (root && root.name) {
			if (name) {
				this.name = `${root.name}.${name}`;
				this.roots = root.roots.concat([this.name]);
			} else {
				this.name = root.name; 
				this.roots = root.roots;
			}
		} else {
			if (name) {
				this.name = name;
				if (root) {
					this.roots = root.roots.concat([this.name]);
				} else {
					this.roots = [name];
				}
			} else {
				this.name = '';
				this.roots = (root&&root.roots) || [];
			}
		}
	}

	inherit (name) {
		if (name) return new Scope(this, name)
		return this;
	}

	append (namespace) {
		if (namespace) {
			for (let i of namespace.entries()) {
				if (!this.get(i[0])) {
					this.set(i[0], i[1]);
				}
			}
		}
		return this;
	}

	write (string) {
		for (let name of this.roots) {
			let prop = this.get(name) || new Set;
			prop.value = ((prop&&prop.value) || '') + string;
			this.set(name, prop);
		}
		return this;
	}

	setGroup (groupName) {
		if (groupName) {
			for (let name of this.roots) {
				let prop = this.get(name) || new Set;
				prop.add(groupName);
				this.set(name, prop);
			}
		}
		return this;
	}
}

function* recursionString(state, string, namespace) {
	if (string == '*') {
		for (let i=0,l=state.rest.length+1; i<l; i++) {
			yield {
				rest: state.rest.substr(i),
				scope: namespace.append(state.scope).write(state.rest.substr(0, i))
			}
		}
	} else {
		if (state.rest.indexOf(string) === 0) {
			yield {
				rest: state.rest.substr(string.length),
				scope: namespace.append(state.scope).write(string)
			}
		}
	}
}

function* recursionArray(state, array, namespace) {
	if (array.length) {
		let firstItem = array[0];

		for (let version of recursionUnknown(state, firstItem, namespace)) {
			if (array.length == 1) {
				yield version;
			} else {
				yield* recursionUnknown(version, array.slice(1), namespace);
			}
		}
	}
}

function* recursionSet(state, set, namespace) {

	for (let subset of set) {
		for (let d of recursionUnknown(state, subset, namespace.inherit(set.name).setGroup(set.group))) {
			yield d;
		}
	}
}

function* recursionUnknown(state, o, namespace) {
	if (Array.isArray(o)) {
		yield* recursionArray(state, o, namespace)
	} else if (o instanceof Set) {
		yield* recursionSet(state, o, namespace)
	} else if (typeof o === 'string') {
		yield* recursionString(state, o, namespace);
	} else {
		throw new TypeError('What teh fuck?');
	}
}


// main

module.exports = function (ast, string) {

	var success = false;
	let generator = recursionUnknown({rest: string}, ast, new Scope);

	for (var value of generator) {
		if (value.rest == '') {
			success = true;
			break;
		}
	}

	return success ? value : success;
}

// util



function ns (last, add) {
	if (!add) return last;
	return last 
		? last + '.' + add 
		: add;
}