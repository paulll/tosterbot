var VKSession = require('./session.js'),
	IoProvider = api.lib.support.IoProvider,
	RequestMessage = api.lib.support.RequestMessage,
	VKClient = api.lib.vkontakte.VKClient;


class VkIoProvider extends IoProvider {
	constructor () {

		var self = this,
			sessionsCache = new WeakMap();

		reduce(api.memory.providers, function (current, provider, rcallback) {
			provider.get('security.VkontakteToken', null, null, function (error, result) {
				if(handleError(error, level.warn, rcallback)) {
					rcallback(error, result ? result : current);
				}
			});
		}, function (error, result) {
			if (handleError(error, level.warn)) {
				self.client = new VKClient(result.object);
				self.client.connect();
				self.client.on('message', function (message) {
					
					let messageObject = new RequestMessage(message.text);
					messageObject.attachments = message.attachments;

					if (!sessionsCache.has(message.from)) {
						sessionsCache[message.from] = new VKSession(self, self.client, message.from, message.time);
					}

					sessionsCache[message.from].appendMessage(messageObject);
				});
			}
		});
	}
}