var PushBullet = require('pushbullet'),
	PushStream = require('./pushbullet-stream'),
	streams = new Map();

api.lib.pushbullet = PushBullet;
PushBullet.prototype.stream = function () {
	if (streams.has(this.token)) {
		return streams[this.token];
	}
	return streams[this.token] = new PushStream(this.token);
};