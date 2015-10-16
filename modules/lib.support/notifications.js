"use strict";

var throws = api.lib.debug.throws,
	NotImplementedError = api.lib.debug.errors.NotImplementedError;

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

api.lib.support.Notification = Notification;
api.lib.support.NotificationProvider = NotificationProvider;