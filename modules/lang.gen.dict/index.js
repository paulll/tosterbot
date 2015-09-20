api.lang.generators.dict = {};
api.lang.generators.dict.generate = function (message, callback) {
	
	var answer = api.lib.dict.generate(message.answer);

	if (!answer) {
		callback(null, {confidence: 0});
	} else {
		answer.confidence = answer.confidence || 1;
		callback(null, answer);
	}
};

api.lib.dict.loadDict('./dict/ru/output/base.dict', function(error) {
	if (error) {
		console.log('[FAIL]', 'Should load base output dict');
	}
});