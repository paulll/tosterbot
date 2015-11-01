"use strict";

var	Session = api.lib.support.Session;

class TcpSession extends Session {
	constructor (provider, socket) {
		super(provider);

		this.socket = socket;
		this.user_ip = socket.remoteAddress;
		this.timestamp = Date.now();
	}

	send (message, callback) {
		var self = this;

		this.socket.write(message.text, 'utf8', function (error) {
			if (!error) {
				self.appendMessage(message);
			}
			if (callback) callback(error);
		});
	};
}

module.exports = TcpSession;