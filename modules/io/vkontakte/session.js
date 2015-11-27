"use strict";

var	Session = api.lib.support.Session,
	humanize = api.lib.typo.humanize;

class VKSession extends Session {
	constructor (provider, client, user_id, timestamp) {
		super(provider);

		this.client = client;
		this.user_id = user_id;
		this.timestamp = timestamp;
	}

	send (message, callback) {

		let self = this;

		let setActivity = function (yes) {
			self.client.request('messages.setActivity', {
				user_id: self.user_id,
				type: yes ? 'typing' : ''
			}, function () {});
		}

		
		let send = function (text, next) {
			self.client.request('messages.send', {
				user_id: self.user_id,
				guid: Math.random() * 1e17,
				message: text
			}, function (error) {
				if (!error) {
					setActivity(true);
					next();
				}
				callback && callback(error);
			});
		}

		let end = function () {
			self.appendMessage(message);
			setActivity(false);
		}

		setActivity(true);
		humanize(message.text, {split: true}, send, end);
	};
}

module.exports = VKSession;