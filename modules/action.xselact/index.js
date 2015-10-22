"use strict";

var simplify = api.lib.simplify,
	handleError = api.lib.debug.handleError,
	level = api.lib.debug.level,
	Action = api.lib.support.Action;

class XselAction extends Action {
	
	constructor () {
		super();
		this.name = 'xselact';

		api.lib.dict.loadRules('./dict/ru/input/xselact.dict', function(error) {
			if (error) {
				console.log('[FAIL]', 'Should load xselact input dict');
			} 
		});
	}

	do (params, callback) {
		api.sense.get('xsel').readState({}, function (error, state) {
			if(handleError(error, level.error)){
				params.in = params.in || params.param.in;
				params.out = params.in;

				if (params.tokens.length !== 2) {
					var names = {
						base64: new Set(['base64', 'бейс64', 'base 64', 'бейс 64', 'б64', 'b64'].map(simplify)),
						string: new Set(['строку', 'ascii', 'unicode', 'utf8', 'utf-8', 'utf 8', 'utf'].map(simplify)),
						hex: new Set(['hex', 'хекс', 'хекслеты'].map(simplify)),
						bin: new Set(['bin', 'двоичный код', 'бинарный код', 'бин', 'бинари', 'бинарник'].map(simplify)),
						json: new Set(['json', 'жсон', 'javascript object notation'].map(simplify))
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
				
				let result = api.lib.convert(state, params.in, params.out);

				api.notify.xsel.notify(result);
			}
		});
	}
}

api.registerAction(new XselAction);