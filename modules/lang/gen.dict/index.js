"use strict";

var MessageGenerator = api.lib.support.MessageGenerator,
	generate = api.lib.dict.generate;

class DictGenerator extends MessageGenerator {

	constructor() {
		super();
		api.lib.dict.loadDict('./dict/ru/output/base.dict', function(error) {
			if (error) {
				console.log('[FAIL]', 'Should load base output dict');
			}
		});
	}

	generate (message, callback) {
		var answer = generate(message.answer, message.answerVariables);

		if (!answer) {
			callback(null, {confidence: 0});
		} else {
			answer.confidence = answer.confidence || 1;
			callback(null, answer);
		}
	}
}

api.lang.generators.add(new DictGenerator);