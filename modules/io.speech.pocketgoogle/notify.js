var exec = require('child_process').execFile;

module.exports = function () {
	exec('mpg123', ['sound/served.mp3'], {cwd: __dirname});
};