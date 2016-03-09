"use strict";

var warn = api.lib.debug.warn,
	ResponseMessage = api.lib.support.ResponseMessage,
	RequestMessage = api.lib.support.RequestMessage,
	generateSimle = api.lang.generateSimle;


api.lib.dict.loadRules('./dict/ru/input/confirm.dict', function(error) {});
api.lib.dict.loadDict('./dict/ru/output/confirm.dict', function(error) {});

api.lib.confirm = function (message, whatToConfirm, callback) {

	let locker = {};
	let confirmation = new RequestMessage();
	confirmation.answer = 'confirm.ask';
	confirmation.answerVariables = [whatToConfirm];

	message.session.locks.push(locker);

	generateSimle(confirmation, function (error, resultMessage) {
		if (handleError(error, level.warn)) {
			if (resultMessage.confidence) {
				message.session.send(resultMessage);
				message.session.on('message.in', function (confirmation) {
					if (message.session.locks.top == locker) {
						message.session.locks.pop();

						/**
						 * Прогоняем сообщение по всем парсерам.
						 * результат с наибольшим confidence будет
						 * считаться окончательным.
						 */
						reduce(api.lang.parsers.values(), {confidence: 0}, function (current, parser, callback) {
							parser.parse(message, function (error, probablyParsedMessage) {
								if (handleError(error, level.warn, callback)) {
									if (current.confidence > probablyParsedMessage.confidence) {
										callback(error, current);
									} else {
										callback(error, probablyParsedMessage);	
									}
								}
							});
						}, function (error, resultMessageIn) {

							if (error) {
								return callback(error);
							}

							if (resultMessageIn.name == 'confirm.confirm') {
								
								let ok = new RequestMessage();
								ok.answer = 'confirm.ok';

								generateSimle(ok, function (error, okMessage) {
									message.session.send(okMessage);
									callback(null, true);
								});
							} else {

								let ok = new RequestMessage();
								ok.answer = 'confirm.cancel';

								generateSimle(ok, function (error, okMessage) {
									message.session.send(okMessage);
									callback(null, false);
								});
							}
						});
					}
				});
			} else {
				return callback(new Error('WTF exception'));
			}
		};
	});
};