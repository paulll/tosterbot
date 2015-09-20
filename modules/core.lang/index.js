var parsers = [],
	generators = [],
	async = require('async');

api.lang.refreshParserList = function () {
	parsers = [];
	for (var lp in api.lang.parsers) {
		if (api.lang.parsers.hasOwnProperty(lp) && typeof api.lang.parsers[lp].parse !== 'undefined') {
			parsers.push(api.lang.parsers[lp].parse);
		}
	}
}

api.lang.refreshGeneratorList = function () {
	generators = [];
	for (var lp in api.lang.generators) {
		if (api.lang.generators.hasOwnProperty(lp) && typeof api.lang.generators[lp].generate !== 'undefined') {
			generators.push(api.lang.generators[lp].generate);
		}
	}
}

api.lang.refreshParserList();
api.lang.refreshGeneratorList();

/**
 * Прогоняет сообщение по всем парсерам,
 * выбирает самый подходящий вариант
 * (парсер возвращает в т.ч. уверенность в том,
 *  что используется данный язык)
 */
api.lang.parse = function (message, callback) {
	if (api.debug) {
		api.lang.refreshParserList();		
	}

	async.map(parsers, function (parse, callback) {
		parse(message, callback);
	}, function (error, result) {
		
		if (error) {
			callback(error);
		} else {
			var max = {confidence: -1};
			result.forEach(function (parsed) {
				if (parsed.confidence > max.confidence) {
					max = parsed;
				}
			});
			callback(null, max);
		}
	});
};

/**
 * Прогоняет сообщение по всем генераторам,
 * выбирает самый подходящий вариант
 */
api.lang.generate = function (message, callback) {
	if (api.debug) {
		api.lang.refreshGeneratorList();
	}

	async.map(generators, function (generate, callback) {
		generate(message, callback);
	}, function (error, result) {
		
		if (error) {
			callback(error);
		} else {
			var max = {confidence: -1};
			result.forEach(function (generated) {
				if (generated.confidence > max.confidence) {
					max = generated;
				}
			});
			callback(null, max);
		}
	});
}