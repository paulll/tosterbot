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
			var session = new TcpSession(self, socket);
			self.appendSession(session);

			socket.setEncoding('utf8');

			// @todo: motd --> приветствие 
			getSimple('tcp.motd', function (error, result) {
				if (handleError(error, level.warn)) {
					socket.write(result);
				}
				socket.write('\n> ');
			});

			socket.on('close', function () {
				session.close();
			});

			socket.on('data', function (message) {
				session.appendMessage(new RequestMessage(message.toString()));
			});

			session.on('message.out', function () {
				socket.write('\n> ');
			});
		});

		getSimple('tcp.port', function (error, result) {
			if (handleError(error, level.warn)) {
				server.listen(parseInt(result, 10));
			}
		});
	}
}

api.io.providers.add(new TcpIoProvider);