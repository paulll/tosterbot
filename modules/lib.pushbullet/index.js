
return false;

var PushBullet = require('pushbullet'),
	pusher = new PushBullet('KkRntoc0bHFN3tZymIv1J5OAz8r0IXf2'),
	stream = pusher.stream(),
	EventEmitter = require('events').EventEmitter;

api.lib.pushbullet = new EventEmitter;
api.lib.pushbullet._pusher = pusher;
api.lib.pushbullet.file = function (title, path, callback) {
	pusher.file('', file, title, callback);
};
api.lib.pushbullet.link = function (title, url, callback) {
	pusher.file('', title, url, callback);
};
api.lib.pushbullet.list = function (title, list, callback) {
	pusher.file('', title, list, callback);
};
api.lib.pushbullet.address = function (title, addr, callback) {
	pusher.file('', title, addr, callback);
};
api.lib.pushbullet.note = function (title, body, callback) {
	pusher.file('', title, body, callback);
};

stream.connect();

stream.on('push', function (data) {
	api.lib.pushbullet.emit('push', data);
});