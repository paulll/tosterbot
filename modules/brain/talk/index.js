"use strict";

var Brain = api.lib.support.Brain,
	handleError = api.lib.debug.handleError,
	log = api.lib.debug.log,
	level = api.lib.debug.level,
	reduce = api.lib.iterate.reduce,
	ResponseMessage = api.lib.support.ResponseMessage;

class TalkController extends Brain {
	handler (message) {

		if (message.session.locks.length) {
			return false;
		}

		/**
		 * Прогоняем сообщение по всем парсерам.
		 * результат с наибольшим confidence будет
		 * считаться окончательным.
		 */
		api.lang.parseSimple(message, function (error, parsedMessage) {
			if (handleError(error, level.warn)) {
				if (typeof parsedMessage.action !== 'undefined') {
					if (!api.do(parsedMessage.action, parsedMessage, handleError)) {
						let reply = `Не умею выполнять это действие (${parsedMessage.action})`;
						log(reply, level.warn);
						message.session.send(new ResponseMessage(reply));
					}
				}
				/**
				 * Прогоняем сообщение по всем генераторам.
				 * результат с наибольшим confidence будет
				 * считаться окончательным.
				 */
				api.lang.generateSimple(parsedMessage, function (error, resultMessage) {
					if (handleError(error, level.warn)) {
						if (resultMessage.confidence) {
							message.session.send(resultMessage);
						}
					};
				});
			}
		});
	}
}

new TalkController('io.message.in');