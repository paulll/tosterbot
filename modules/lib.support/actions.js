"use strict";

var throws = api.debug.throws,
	NotImplementedError = api.debug.errors.NotImplementedError;

/**
 * Действие.
 */
class Action {
	get name() {
		throws(new NotImplementedError);
	}

	/**
	 * Функция действия (асинхронна).
	 */
	do (parameters, callback) {
		throws(new NotImplementedError, callback);
	}
}



api.support.Action = Action;
api.actions = actions;
