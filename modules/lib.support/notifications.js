"use strict";

var throws = api.debug.throws,
	NotImplementedError = api.debug.errors.NotImplementedError;

/**
 * Позволяет отправлять уведомления
 */
class NotificationProvider {

	/**
	 * Функция отправки уведомлений.
	 */
	notify (notification, callback) {
		throws(new NotImplementedError, callback);
	}
}

/**
 * Класс уведомления.
 */
class Notification {

	/**
	 * Возвращает строковое представление уведомления.
	 */
	get string () {
		throws(new NotImplementedError);
	}
}

api.support.Notification = Notification;
api.support.NotificationProvider = NotificationProvider;