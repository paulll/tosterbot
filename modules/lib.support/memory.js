"use strict";

var throws = api.lib.debug.throws,
	NotImplementedError = api.lib.debug.errors.NotImplementedError;

/**
 * Интерфейс базы знаний Системы.
 * Позволяет делать запросы для получения RDF-триплетов.
 */
class MemoryProvider {
	get (subject, predicate, object, callback) {
		throws(new NotImplementedError, callback);
	}
}

api.support.MemoryProvider = MemoryProvider;