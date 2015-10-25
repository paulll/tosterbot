"use strict";

var https = require('https'),
	http = require('http'),
	querystring = require('querystring'),
	url = require('url'),
	EventEmitter = require('events').EventEmitter,
	handleError = api.lib.debug.handleError,
	level = api.lib.debug.level;

class VKClient  extends EventEmitter {
	constructor (token) {
		super();
		this.access_token = token;
	}

	request (method, params, callback) {
		var retry = setTimeout.bind(null, this.request.bind(this, method, params, callback), 1000);

		params.access_token = params.access_token || this.access_token;

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
				if (!data) { return retry() }
				callback(null, JSON.parse(data));
			});

			response.on('error', retry);
		});

		request.setTimeout(1000, retry);
		request.on('error', retry);
		request.end();
	}

	connect () {
		var self = this;

		this.discontinued = false;
		this.request('messages.getLongPollServer', {
			use_ssl: false,
			need_pts: 0
		}, function (error, resp) {
			if (handleError(error || resp.error ? new Error(resp.error.error_msg) : null, level.warn)) {
				self._getLongpoll(resp.response.server, resp.response.key, resp.response.ts);
			}
		});
	}

	disconnect () {
		this.discontinued = true;
	}

	_getLongpoll(server, key, ts) {

		if (this.discontinued) {return}

		var self = this,
			retry = setTimeout.bind(null, this._getLongpoll.bind(this, server, key, ts), 1000),
			addr = url.parse('http://' + server + '?act=a_check&key=' + key + '&ts=' + ts + '&wait=25&mode=2'),

		request = http.request(addr, function (response) {
			var data = '';

			response.on('data', function (chunk) {
				data += chunk;
			});

			response.on('end', function () {
				if (!data) { return retry() }

				try {
					var event = JSON.parse(data);
					if (typeof event.updates === 'undefined') {
						if (event.failed > 1) {
							return startListeningVkEvents();
						}
						if (event.failed == 1) {
							return self._getLongpoll(server, key, event.ts);
						}
						return retry();
					}
				} catch (e) {
					return retry();
				}

				event.updates.forEach(function (update) {
					// если это сообщение и оно входящее
					if ((update[0] == 4) && ((update[2]&2) == 0)) { 
						self.emit('message', {
							id: update[1],
							from: update[3],
							time: update[4],
							subject: update[5],
							text: update[6],
							attachments: update[7]
						});
					}
				});

				self._getLongpoll(server, key, event.ts);

			});
			response.on('error', retry);
		});

		request.on('error', retry);
		request.end();
	}
}

api.lib.vkontakte = {};
api.lib.vkontakte.VKClient = VKClient;