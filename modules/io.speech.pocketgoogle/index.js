'use strict';

var tts = require('./tts'),
	notify = require('./notify'),
	activator = require('./activator'),
	gspeech = require('./gspeech'),
	spawn = require('child_process').spawn,
	EventEmitter = require('events').EventEmitter,
	session = new EventEmitter;

activator.on('activate', function () {
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
			session.emit('message', new Message(translation, session));
			speech.stop();
		}
	});

	speech.on('error', function(error) {
		console.error(error);
	});

	notify();
});

session.send = function (message, callback) {
	if (!callback) {callback = function(){};}
	try {
		tts(message.toString(), message.lang);
		callback();
	} catch (error) {
		callback(error);
	}
};

api.io.sessions.push(session);
api.io.emit('session', session);