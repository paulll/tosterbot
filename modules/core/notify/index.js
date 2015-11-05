"use strict";

api.notify.notify = function (notifier, message) {
	let notifierObject = api.notify.providers.get(notifier);

	if (notifierObject) {
		notifierObject.notify(message);
	}
}