api.io.on('session', function (session) {

	console.log('Открыта сессия:', session);

	session.on('message', function (message) {

		console.log('Получено сообщение:', message.toString().trim());

		api.lang.parse(message, function (error, parsed) {

			if (error) {
				console.error(error);
			}

			console.log('brain.talk/index.js:15', parsed, api.action.exists(parsed.action));

			if (typeof parsed.action !== 'undefined') {
				if (api.action.exists(parsed.action)) {
					api.action.run(parsed.action, parsed, function (error) {
						
					});
				} else {
					session.send(new Message('[w] Пока не умею выполнять это действие', session));
				}
				//api.log('warn', 'Пока не умею выполнять действия').
			}

			api.lang.generate(parsed, function (error, generated) {

				if (error) {
					console.error(error);
				}

				session.send(generated.text);
			});
		});
	});
});