var exec = require('child_process').execFile;

module.exports = function () {
	exec('mpg123', ['sound/served.mp3'], {cwd: __dirname});
};

module.exports.done = function () {
	exec('mpg123', ['sound/shut-your-mouth.mp3'], {cwd: __dirname});
}