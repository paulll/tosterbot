"use strict";

var MessageParser = api.lib.support.MessageParser,
	parse = api.lib.dict.parse;

class DictParser extends MessageParser {

	constructor() {
		super();
		api.lib.dict.loadRules('./dict/ru/input/base.dict', function(error) {
			if (error) {
				console.log('[FAIL]', 'Should load base.dict');
			}
		});
	}

	parse (message, callback) {
		var answer = parse(message.text.trim());

		if (!answer) {
			callback(null, {confidence: 0});
		} else {
			answer.confidence = answer.confidence || 1;
			callback(null, answer);
		}
	}
}

api.lang.parsers.add(new DictParser);