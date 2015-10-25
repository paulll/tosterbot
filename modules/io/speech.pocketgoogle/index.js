"use strict";

var notify = require('./notify'),
	activator = require('./activator'),
	gspeech = require('./gspeech'),
	spawn = require('child_process').spawn,
	IoProvider = api.lib.support.IoProvider,
	handleError = api.lib.debug.handleError,
	PocketGoogleSession = require('./session'),
	RequestMessage = api.lib.support.RequestMessage;

class PocketGoogleProvider extends IoProvider {
	constructor() {
		super();

		var self = this,
			session = new PocketGoogleSession(this),
			recognizing = false;

		this.appendSession(session);

		activator.on('activate', function () {
			
			if (recognizing) {
				return;
			} else {
				recognizing = true;
			}

			var sox = spawn('sox', ['-d', '-esigned-integer', '-c 1', '-b 16', '-r 16000', '-twav', '-']),
				speech = gspeech.recognize(sox.stdout, {
					type: 'audio/l16',
					rate: 16000,
					api_key: 'AIzaSyBOti4mM-6x9WDnZIjIeyEU21OpBXqWBgw',
					language: 'ru-RU',
					timeout: 360000 // seconds
				});

			// Translation
			speech.on('translation', function(translation) {
				translation = translation.toLowerCase();

				if (translation === 'stop') {
					speech.stop();
				} else {
					notify.done();
					session.appendMessage(new RequestMessage(translation));
					speech.stop();
				}

				recognizing = false;
			});

			speech.on('error', function (error) {
				if (error.message == '400') {
					activator.emit('activate');
				}
			});

			notify();
		});
	}
}

api.io.providers.add(new PocketGoogleProvider);