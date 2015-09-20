var exec = require('child_process').exec;

api.sense.xsel = {};

// xsel implements Sense
api.sense.xsel.readState = function (callback) {
	exec('xsel -po', {encoding: 'utf8'}, function (error, stdout, stderr) {
		if (error) {
			api.debug.warn('Невозможно получить выделение текста из иксов');
			callback(error);
		} else {
			callback(null, stdout);
		}
	});
};

