api.lang.parsers.dict = {};
api.lang.parsers.dict.parse = function (message, callback) {
	
	var answer = api.lib.dict.parse(message.toString().trim());

	if (!answer) {
		callback(null, {confidence: 0});
	} else {
		answer.confidence = answer.confidence || 1;
		callback(null, answer);
	}
};

api.lib.dict.loadRules('./dict/ru/input/base.dict', function(error) {
	if (error) {
		console.log('[FAIL]', 'Should load base.dict');
	}
});