var reduce = api.lib.iterate.reduce;

api.memory.getSimple = function (predicate, callback) {
	reduce(api.memory.providers, function (current, provider, rcallback) {
		provider.get(predicate, null, null, function (error, result) {
			if(handleError(error, level.warn, rcallback)) {
				rcallback(error, result ? result : current);
			}
		});
	}, function (error, result) {
		callback(error, result && typeof result.object !== 'undefined' ? result.object : result);
	});
}
