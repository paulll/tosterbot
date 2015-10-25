"use strict";

var tts = require('./tts'),
	Session = api.lib.support.Session;

class PocketGoogleSession extends Session {
	constructor (provider) {
		super(provider);
		this.timestamp = Date.now();
	}

	send (message, callback) {
		this.appendMessage(message);
		if (!callback) {callback = function(){};}
		try {

			let str = message.toString();

			switch(str){
				case '[object Object]': str = 'Неопознанный Объект'; break;
			}

			tts(str, message.lang);
			callback();
		} catch (error) {
			callback(error);
		}
	}
}

module.exports = PocketGoogleSession;