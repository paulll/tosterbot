var EventEmitter = require('events').EventEmitter,
	util = require('util');

function VKSession(user_id, timestamp) {
	this.user_id = user_id;
	this.timestamp = timestamp;
};

util.inherits(VKSession, EventEmitter);


VKSession.prototype.send = function (message, callback) {
	api.lib.vkontakte.request('messages.send', {
		user_id: this.user_id,
		guid: Math.random() * 1e17,
		message: (message||'d').toString()
	}, console.log.bind(console));
};



module.exports = VKSession;