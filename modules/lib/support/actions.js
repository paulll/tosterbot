"use strict";

var throws = api.lib.debug.throws,
	NotImplementedError = api.lib.debug.errors.NotImplementedError;

/**
 * Действие.
 */
class Action {
	
	// name

	/**
	 * Функция действия (асинхронна).
	 */
	do (parameters, callback) {
		throws(new NotImplementedError, callback);
	}
}

api.lib.support.Action = Action;