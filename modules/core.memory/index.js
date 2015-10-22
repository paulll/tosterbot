var reduce = api.lib.iterate.reduce,
	handleError = api.lib.debug.handleError,
	level = api.lib.debug.level;

var $ = console.log.bind(console);

api.memory.getSimple = function (subject, callback) {
	reduce(api.memory.providers.values(), null, function (current, provider, rcallback) {
		provider.get(subject, null, null, function (error, result) {
			if(handleError(error, level.warn, rcallback)) {
				rcallback(error, result ? result : current);
			}
		});
	}, function (error, result) {
		callback(error, result && typeof result.object !== 'undefined' ? result.object : result);
	});
}
