"use strict";

var throws = api.debug.throws,
	NotImplementedError = api.debug.errors.NotImplementedError;

/**
 * Действие.
 */
class Sense {
	readState () {
		throws(new NotImplementedError);
	}
}

api.support.Action = Action;
api.actions = actions;
