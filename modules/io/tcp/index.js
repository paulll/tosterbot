"use strict";

var TcpSession = require('./session.js'),
	net = require('net'),
	IoProvider = api.lib.support.IoProvider,
	RequestMessage = api.lib.support.RequestMessage,
	getSimple = api.memory.getSimple,
	handleError = api.lib.debug.handleError,
	level = api.lib.debug.level;


class TcpIoProvider extends IoProvider {
	constructor () {

		super();
		var self = this;
		
		var server = net.createServer(function (socket) {
			var session = new TcpSession(TcpIoProvider, socket);
			self.appendSession(session);

			socket.setEncoding('utf8');

			// @todo: motd --> приветствие 
			getSimple('TcpMotd', function (error, result) {
				if (handleError(error, level.warn)) {
					socket.write(result);
				}
				socket.write('> ');
			});

			socket.on('close', function () {
				session.close();
			});

			socket.on('message', function (message) {
				session.appendMessage(new RequestMessage(message));
			});
		});

		getSimple('TcpChatPort', function (error, result) {
			if (handleError(error, level.warn)) {
				server.listen(parseInt(result, 10));
			}
		});
	}
}

api.io.providers.add(new TcpIoProvider);