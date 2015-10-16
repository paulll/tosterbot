"use strict";

var throws = api.lib.debug.throws,
	NotImplementedError = api.lib.debug.errors.NotImplementedError;

/**
 * Действие.
 */
class Sense {
	readState (params, callback) {
		throws(new NotImplementedError);
	}
}

api.support.Sense = Sense;