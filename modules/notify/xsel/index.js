"use strict";

var spawn = require('child_process').spawn,
	NotificationProvider = api.lib.support.NotificationProvider

class XselNotificationProvider extends NotificationProvider {
	notify (message, callback) {
		let proc = spawn('xsel', ['-pi']);
		proc.stdin.write(message);
		proc.on('close', callback || function () {});
		proc.stdin.end();
	}
}

api.notify.providers.set('xsel', new XselNotificationProvider);