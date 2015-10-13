var exec = require('child_process').exec,
	Sense = api.lib.support.Sense;

class XselSense extends Sense {
	readState(params, callback) {
		exec('xsel -po', {encoding: 'utf8'}, function (error, stdout, stderr) {
			if (error) {
				api.debug.warn('Невозможно получить выделение текста из иксов');
				callback(error);
			} else {
				callback(null, stdout);
			}
		});
	}
}

api.sense.xsel = new XselSense;