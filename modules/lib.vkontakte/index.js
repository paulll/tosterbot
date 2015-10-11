var https = require('https'),
	http = require('http'),
	querystring = require('querystring'),
	url = require('url'),
	EventEmitter = require('events').EventEmitter,
	handleError = api.debug.handleError,
	level = api.debug.level,
	reduce = api.lib.iterate.reduce;

api.lib.vkontakte = new EventEmitter;

api.lib.vkontakte.request = function (method, params, callback) {
	var retry = setTimeout.bind(null, api.lib.vkontakte.request.bind(null, method, params, callback), 1000);

	reduce(api.memory.providers, params.access_token, function (current, provider, rcallback) {
		provider.get('security.VkontakteToken', null, null, function (error, result) {
			if(handleError(error, level.warn, rcallback)) {
				rcallback(error, result ? result : current);
			}
		});
	}, function (error, result) {
		if(handleError(error, level.warn)) {
			params.access_token = result.object;

			var request = https.request({
				hostname: 'api.vk.com',
				port: 443,
				path: '/method/' + method + '?' + querystring.stringify(params),
				method: 'GET'
			}, function (response) {

				var data = '';
				
				response.on('data', function (chunk) {
					data += chunk;
				});

				response.on('end', function () {

					if (!data) {
						return retry();
					}

					callback(null, JSON.parse(data));
				});

				response.on('error', retry);
			});

			request.setTimeout(1000, retry);
			request.on('error', retry);
			request.end();
		}
	});
};


function getLongpoll(server, key, ts) {
	var retry = setTimeout.bind(null, getLongpoll.bind(null, server, key, ts), 1000);
	var addr = url.parse('http://' + server + '?act=a_check&key=' + key + '&ts=' + ts + '&wait=25&mode=2');
	var request = http.request(addr, function (response) {
		var data = '';

		response.on('data', function (chunk) {
			data += chunk;
		});

		response.on('end', function () {
			if (!data) {
				return retry();
			}

			try {
				var event = JSON.parse(data);
				if (typeof event.updates === 'undefined') {
					if (event.failed > 1) {
						return startListeningVkEvents();
					}
					if (event.failed == 1) {
						return getLongpoll(server, key, event.ts);
					}
					return retry();
				}
			} catch (e) {
				return retry();
			}

			event.updates.forEach(function (update) {
				if ((update[0] == 4) && ((update[2]&2) == 0)) { // if it is a message and this message is incoming
					api.lib.vkontakte.emit('message', {
						id: update[1],
						from: update[3],
						time: update[4],
						subject: update[5],
						text: update[6],
						attachments: update[7]
					});
				}
			});

			getLongpoll(server, key, event.ts);

		});
		response.on('error', retry);
	});

	request.on('error', retry);
	request.end();
}

!(function startListeningVkEvents () {
	api.lib.vkontakte.request('messages.getLongPollServer', {
		use_ssl: false,
		need_pts: 0
	}, function (error, resp) {
		getLongpoll(resp.response.server, resp.response.key, resp.response.ts);
	});
})();
