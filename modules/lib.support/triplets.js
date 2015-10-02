"use strict";

var throws = api.debug.throws,
	NotImplementedError = api.debug.errors.NotImplementedError;

/**
 * RDF-триплет.
 * Используется для обозначения семантических связей между
 * вершинами графа базы знаний Системы.
 */
class Triplet {
	get subject() {
		throws(new NotImplementedError);
	}
	get predicate() {
		throws(new NotImplementedError);
	}
	get object() {
		throws(new NotImplementedError);
	}
}

api.support.Triplet = Triplet;