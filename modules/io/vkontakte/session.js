"use strict";

var	Session = api.lib.support.Session;

class VKSession extends Session {
	constructor (provider, client, user_id, timestamp) {
		super(provider);

		this.client = client;
		this.user_id = user_id;
		this.timestamp = timestamp;
	}

	send (message, callback) {

		console.log('SEND', message, this.user_id);
		return;

		var self = this;

		this.client.request('messages.send', {
			user_id: this.user_id,
			guid: Math.random() * 1e17,
			message: message.text
		}, function (error) {
			if (!error) {
				self.appendMessage(message);
			}
			if (callback) callback(error);
		});
	};
}

module.exports = VKSession;