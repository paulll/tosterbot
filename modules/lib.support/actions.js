"use strict";

var throws = api.debug.throws,
	assert = api.debug.assert,
	NotImplementedError = api.debug.errors.NotImplementedError,
	actions = new Map();

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

/**
 * Выполнить действие с заданным ID.
 */
api.do = function (aid, params, callback) {
	return actions[aid](params, callback);
};

/**
 * Зарегистрировать действие.
 */
api.registerAction = function (action, callback) {
	if (assert.type(action, Action, callback)) {
		actions[action.name] = action;
	}
};

api.support.Action = Action;
api.actions = actions;
