"use strict";

var exec = require('child_process').exec,
	Sense = api.lib.support.Sense,
	debug = api.lib.debug;

class XselSense extends Sense {
	readState(params, callback) {
		exec('xsel -po', {encoding: 'utf8'}, function (error, stdout, stderr) {
			if (error) {
				debug.warn('Невозможно получить выделение текста из иксов');
				callback(error);
			} else {
				callback(null, stdout);
			}
		});
	}
}

api.sense.set('xsel', new XselSense);