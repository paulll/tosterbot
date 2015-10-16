var EventEmitter = require('events').EventEmitter,
	Session = api.lib.support.Session;

class VKSession extends Session {
	constructor (provider, client, user_id, timestamp) {
		super(provider);

		this.client = client;
		this.user_id = user_id;
		this.timestamp = timestamp;
	}

	send (message, callback) {
		this.client.request('messages.send', {
			user_id: this.user_id,
			guid: Math.random() * 1e17,
			message: (message||'d').toString()
		}, callback);
	};
}

module.exports = VKSession;