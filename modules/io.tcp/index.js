var net = require('net'),
	EventEmitter = require('events').EventEmitter;

var server = net.createServer(function(socket) {
	socket.setEncoding('utf8');
	socket.write('Connection initialized.\n');

	/**
	 * Session is instance of EventEmitter
	 */
	var session = new EventEmitter;

	/**
	 * implement Session.send
	 */
	session.send = function (message, callback) {
		if (!callback) {callback = function(){};}
		try {
			socket.write(message + "\n> ");
			callback();
		} catch (error) {
			callback(error);
		}
	};
	
	/**
	 *  Proxy incoming messages
	 */
	socket.on('data', function (message) {
		session.emit('message', new Message(message.toString(), session));
	});

	/**
	 *  Handle socket ending
	 */
	socket.on('close', function () {
		session.emit('close');
	});

	/**
	 *  Handle session ending
	 */
	session.on('close', function () {
		var index = api.io.sessions.indexOf(session);
		if (index !== -1) {
			api.io.sessions.splice(index, 1);
		}
		if (socket.writable) {
			socket.close();
		}
	});

	/**
	 * Activate the session
	 */
	api.io.sessions.push(session);
	api.io.emit('session', session);
});

server.listen(1337);