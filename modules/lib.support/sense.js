"use strict";

var throws = api.debug.throws,
	NotImplementedError = api.debug.errors.NotImplementedError;

/**
 * Действие.
 */
class Sense {
	readState (params, callback) {
		throws(new NotImplementedError);
	}
}

api.support.Sense = Sense;