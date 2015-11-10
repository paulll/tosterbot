"use strict";

var spawn = require('child_process').spawn,
	NotificationProvider = api.lib.support.NotificationProvider

class SpreedNotificationProvider extends NotificationProvider {
	notify (message, callback) {
		api.lib.spreed.show({}, message, callback);
	}
}

api.notify.providers.set('spreed', new SpreedNotificationProvider);