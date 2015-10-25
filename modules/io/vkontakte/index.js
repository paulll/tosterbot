"use strict";

var VKSession = require('./session.js'),
	IoProvider = api.lib.support.IoProvider,
	RequestMessage = api.lib.support.RequestMessage,
	VKClient = api.lib.vkontakte.VKClient,
	getSimple = api.memory.getSimple,
	handleError = api.lib.debug.handleError,
	level = api.lib.debug.level;


class VkIoProvider extends IoProvider {
	constructor () {

		super();

		var self = this,
			sessionsCache = new WeakMap();

		getSimple('security.VkontakteToken', function (error, result) {
			if (handleError(error, level.warn)) {
				self.client = new VKClient(result);
				self.client.connect();
				self.client.on('message', function (message) {
					
					let messageObject = new RequestMessage(message.text);
					messageObject.attachments = message.attachments;

					if (!sessionsCache.has(message.from)) {
						let sessionObject = new VKSession(self, self.client, message.from, message.time);
						sessionsCache[message.from] = sessionObject;
						self.appendSession(sessionObject);
					}

					sessionsCache[message.from].appendMessage(messageObject);
				});
			}
		});
	}
}

api.io.providers.add(new VkIoProvider);