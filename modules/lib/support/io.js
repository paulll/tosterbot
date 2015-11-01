"use strict";

var throws = api.lib.debug.throws,
	NotImplementedError = api.lib.debug.errors.NotImplementedError,
	SocketClosedError = api.lib.debug.errors.SocketClosedError,
	EventEmitter = require('events').EventEmitter;

/**
 * Базовый класс сообщений из диалогов.
 */
class Message {

	/**
	 * Устанавливается при вызове Session.appendMessage(Message)
	 */
	// session

	/**
	 * Возвращает строковое представление сообщения.
	 */
	// text
}

/**
 * Класс входящих сообщений.
 */
class RequestMessage extends Message {
	constructor (text) {
		super();
		this.text = text;
	}
}

/**
 * Класс исходящих сообщений.
 * Не может быть создан напрямую, т.к. пока что типы исходящих
 * сообщений не специфицированы.
 */
class ResponseMessage extends Message {
	constructor (text) {
		super();
		this.text = text;
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
		this.locks = [];
		this.closed = false;
	}

	/**
	 * Привязывает сообщение к данной сессии,
	 * а так же создает событие нового сообщения
	 */
	appendMessage(message) {

		if (this.closed) {
			return throws(new SocketClosedError);
		}

		message.session = this;
		this.history.push(message);

		if (message instanceof RequestMessage) {
			this.emit('message.in');
			api.io.emit('message.in');
			api.bus.emit('io.message.in', message);
		} else {
			this.emit('message.out');
			api.io.emit('message.out');
			api.bus.emit('io.message.out', message);
		}
	}

	/**
	 * Отправляет сообщение
	 */
	send (message, callback) {
		return throws(new NotImplementedError, callback); 
	};

	/**
	 * Закрывает сессию, запрещает отправку
	 */
	close () {
		this.closed = true;
	}

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
		api.bus.emit('io.session', session);
	}
}

api.lib.support.Message = Message;
api.lib.support.RequestMessage = RequestMessage;
api.lib.support.ResponseMessage = ResponseMessage;
api.lib.support.Session = Session;
api.lib.support.IoProvider = IoProvider;
