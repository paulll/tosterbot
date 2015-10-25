var spawn = require('child_process').spawn;

api.notify.xsel = {};

// xsel implements Sense
api.notify.xsel.notify = function (message, callback) {
	var proc = spawn('xsel', ['-pi']);
	proc.stdin.write(message);
	proc.on('close', callback || function () {});
	proc.stdin.end();
};
