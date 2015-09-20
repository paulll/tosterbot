"use strict";

api.action.register('xselact', function (params, callback) {
	api.sense.xsel.readState(function (error, buffer) {
		
		if (error) {
			// response;
			return;
		}

		params.in = params.in || params.param.in;
		params.out = params.in;

		if (params.tokens.length !== 2) {
			var names = {
				base64: new Set(['base64', 'бейс64', 'base 64', 'бейс 64', 'б64', 'b64'].map(api.lib.simplify)),
				string: new Set(['строку', 'ascii', 'unicode', 'utf8', 'utf-8', 'utf 8', 'utf'].map(api.lib.simplify)),
				hex: new Set(['hex', 'хекс', 'хекслеты'].map(api.lib.simplify)),
				bin: new Set(['bin', 'двоичный код', 'бинарный код', 'бин', 'бинари', 'бинарник'].map(api.lib.simplify)),
				json: new Set(['json', 'жсон', 'javascript object notation'].map(api.lib.simplify))
			};
			
			for (let type in names) {
				if (names.hasOwnProperty(type)) {
					let value = names[type];
					if (value.has(params.tokens.last())) {
						params.out = type;
						break;
					}
				}
			}
		}
		
		let result = api.lib.convert(buffer, params.in, params.out);

		api.notify.xsel.notify(result, callback(function (error) {
			if (error) {
				console.error(error);
			}
		}))

	});
});

api.lib.dict.loadRules('./dict/ru/input/xselact.dict', function(error) {
	if (error) {
		console.log('[FAIL]', 'Should load xselact input dict');
	} 
});