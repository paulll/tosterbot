"use strict";

var throws = api.lib.debug.throws,
	NotImplementedError = api.lib.debug.errors.NotImplementedError,
	bus = api.bus;

/**
 * Обработчик системных событий.
 */
class Brain {
	constructor (event) {
		bus.on(event, this.handler);
	}

	/**
	 * Функция-обработчик.
	 */
	handler (event) {
		throws(new NotImplementedError);
	}
}

api.support.Brain = Brain;