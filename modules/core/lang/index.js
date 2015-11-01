var reduce = api.lib.iterate.reduce,
	handleError = api.lib.debug.handleError,
	level = api.lib.debug.level;

api.lang.generateSimple = function (message, callback) {
	reduce(api.lang.generators.values(), {confidence: 0}, function (current, generator, callback) {
		generator.generate(message, function (error, probablyGeneratedMessage) {
			if (handleError(error, level.warn, callback)) {
				if (current.confidence > probablyGeneratedMessage.confidence) {
					callback(error, current);
				} else {
					callback(error, probablyGeneratedMessage);
				}
			}
		});
	}, callback);
}

api.lang.parseSimple = function (message, callback) {
	reduce(api.lang.parsers.values(), {confidence: 0}, function (current, parser, callback) {
		parser.parse(message, function (error, probablyParsedMessage) {
			if (handleError(error, level.warn, callback)) {
				if (current.confidence > probablyParsedMessage.confidence) {
					callback(error, current);
				} else {
					callback(error, probablyParsedMessage);
				}
			}
		});
	}, callback);
}
