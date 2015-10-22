"use strict";

var Brain = api.lib.support.Brain,
	handleError = api.lib.debug.handleError,
	log = api.lib.debug.log,
	level = api.lib.debug.level,
	reduce = api.lib.iterate.reduce,
	ResponseMessage = api.lib.support.ResponseMessage;

class TalkController extends Brain {
	handler (message) {

		/**
		 * Прогоняем сообщение по всем парсерам.
		 * результат с наибольшим confidence будет
		 * считаться окончательным.
		 */
		reduce(api.lang.parsers.values(), {confidence: 0}, function (current, parser, callback) {
			parser.parse(message, function (error, probablyParsedMessage) {

				console.log(probablyParsedMessage);

				if (handleError(error, level.warn, callback)) {
					if (current.confidence > probablyParsedMessage.confidence) {
						callback(error, current);
					} else {
						callback(error, probablyParsedMessage);	
					}
				}
			});
		}, function (error, parsedMessage) {

			console.log(parsedMessage);

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
				reduce(api.lang.generators.entries(), {confidence: 0}, function (current, generator, callback) {
					generator.generate(parsedMessage, function (error, probablyGeneratedMessage) {
						if (handleError(error, level.warn, callback)) {
							if (current.confidence > probablyGeneratedMessage.confidence) {
								callback(error, current);
							} else {
								callback(error, probablyGeneratedMessage);
							}
						}
					});
				}, function (error, resultMessage) {
					if (handleError(error, level.warn)) {
						if (message.confidence) {
							message.session.send(resultMessage);
						}
					};
				});
			}
		});
	}
}

new TalkController('io.message.in');