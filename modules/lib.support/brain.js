"use strict";

var throws = api.debug.throws,
	NotImplementedError = api.debug.errors.NotImplementedError,
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