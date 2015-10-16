"use strict";

var throws = api.debug.throws,
	NotImplementedError = api.debug.errors.NotImplementedError,
	EventEmitter = require('events').EventEmitter;

/**
 * Базовый класс сообщений из диалогов.
 */
class Message {

	/**
	 * Устанавливается при вызове Session.appendMessage(Message)
	 */
	get session () {
		return throws(new NotImplementedError);
	}

	/**
	 * Возвращает строковое представление сообщения.
	 */
	get text () {
		return throws(new NotImplementedError);
	}
}

/**
 * Класс входящих сообщений.
 */
class RequestMessage extends Message {
	constructor (text) {
		super();
		this.string = text;
	}	
}

/**
 * Класс исходящих сообщений.
 * Не может быть создан напрямую, т.к. пока что типы исходящих
 * сообщений не специфицированы.
 */
class ResponseMessage extends Message {
	constructor () {
		super();
		// Бросает ошибку, если конструктор не определён.
		if (Object.getPrototypeOf(this) === ResponseMessage.prototype) {
			return throws(new NotImplementedError); 
		}
	}
}

/**
 * Класс сессии общения.
 * Сессия - одиночный разговор, его не стоит восстанавливать
 * при перезапуске Системы, но имеет смысл сохранять историю
 * куда-нибудь в персональную память Системы.
 */
class Session extends EventEmitter {
	
	constructor (provider) {
		super();
		this.provider = provider;
		this.history = [];
	}

	/**
	 * Привязывает сообщение к данной сессии,
	 * а так же создает событие нового сообщения
	 */
	appendMessage(message) {
		message.session = this;
		this.history.push(message);
		this.emit('message', message);
		api.io.emit('message', message);
		api.bus.emit('io.message', message);
	}

	/**
	 * Отправляет сообщение
	 */
	send (message, callback) {
		return throws(new NotImplementedError, callback); 
	};

	/**
	 * @todo: (secure.*, memory.*)
	 * - параметры безопасности сессии.
	 * 	 - идентификация собеседника
	 *   - установка k доверия
	 */	
}

/**
 * Класс системы ввода-вывода.
 * Позволяет Системе открывать сессии общения с кем-либо
 */
class IoProvider extends EventEmitter { 
	
	/**
	 * Привязывает сессию к этому провайдеру,
	 * а так же создает событие новой сессии.
	 */
	appendSession(session) {
		api.io.sessions.add(session);
		this.emit('session', session);
		api.io.emit('session', session);
		api.bus.emit('io.session', message);
	}
}

api.support.Message = Message;
api.support.RequestMessage = RequestMessage;
api.support.ResponseMessage = ResponseMessage;
api.support.Session = Session;
api.support.IoProvider = IoProvider;
