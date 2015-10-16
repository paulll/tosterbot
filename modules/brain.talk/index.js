"use strict";

var Brain = api.lib.support.Brain,
	handleError = api.lib.debug.handleError,
	log = api.lib.debug.log,
	level = api.lib.debug.level,
	reduce = api.lib.iterate.reduce;

class TalkController extends Brain {
	handler (message) {

		/**
		 * Прогоняем сообщение по всем парсерам.
		 * результат с наибольшим confidence будет
		 * считаться окончательным.
		 */
		reduce(api.lang.parsers.entries(), {confidence: 0}, function (current, parser, callback) {
			parser.parse(message, function (error, probablyParsedMessage) {
				if (handleError(error, level.warn, callback)) {
					if (current.confidence > probablyParsedMessage.confidence) {
						callback(error, current);
					} else {
						callback(error, probablyParsedMessage);	
					}
				}
			});
		}, function (error, parsedMessage) {
			if (handleError(error, level.warn)) {
				if (typeof parsedMessage.action !== 'undefined') {
					if (!api.do(parsedMessage.action, parsedMessage, handleError)) {
							let reply = `Не умею выполнять это действие (${parsedMessage.action})`;
							log(reply, level.warn);
							message.session.send(reply)
						}
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
					if (handleError(error, level.warn) {
						message.session.send(resultMessage);
					};
				});
			}
		});
	}
}

new TalkController('io.message');