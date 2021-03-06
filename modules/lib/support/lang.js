"use strict";

var throws = api.lib.debug.throws,
	NotImplementedError = api.lib.debug.errors.NotImplementedError;

/**
 * Класс обработчика сообщений.
 * Преобразует сообщения в понятный для brain.talk вид.
 * Если нет возможности подстроиться под brain.talk, то следует его же расширить.
 */
class MessageParser {
	parse (request_message, callback) {
		throws(new NotImplementedError, callback);
	}
}

/**
 * Класс генератора сообщений.
 * Создает пригодное для отправки сообщение из сообщения, полученного от brain.talk
 * Если brain.talk не может дать сообщение в нужном виде, то можно его поправить.
 */
class MessageGenerator {
	generate (response_message, callback) {
		throws(new NotImplementedError, callback);
	}
}

api.lib.support.MessageParser = MessageParser;
api.lib.support.MessageGenerator = MessageGenerator;