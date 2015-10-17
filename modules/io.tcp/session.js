var	Session = api.lib.support.Session;

class TcpSession extends Session {
	constructor (provider, socket) {
		super(provider);

		this.socket = socket;
		this.user_ip = socket.remoteAddress;
		this.timestamp = Date.now();
	}

	send (message, callback) {
		this.appendMessage(message);
		this.socket.send(message, callback);
	};
}

module.exports = TcpSession;