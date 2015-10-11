var https = require('https'),
	VKSession = require('./session.js');

api.lib.vkontakte.on('message', function (message) {
	// сессии делятся либо по 24 часам либо по 30 минут и приветствию
	
	var session = api.io.sessions.find(function(session) {
		return session.user_id == message.from;
	});

	var msg = new Message(message.text, session);
	msg.attachments = message.attachments;

	if (session) {
		session.emit('message', msg);
	} else {
		session = new VKSession(message.from, message.time)
		api.io.sessions.push(session);
		api.io.emit('session', session);
		session.emit('message', msg);
	}
});
