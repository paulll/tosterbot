"use strict";

var simplify = api.lib.simplify,
	handleError = api.lib.debug.handleError,
	level = api.lib.debug.level,
	Action = api.lib.support.Action,
	notify = api.notify.notify,
	convert = api.lib.convert;

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
		api.sense.get('xsel').readState({}, function (error, xselbuffer) {
			if(handleError(error, level.error)){

				if (params.scope.get('unary')) {
					let encoding = params.scope.get('unary').values().next().value;
					notify('xsel', convert(xselbuffer, encoding, encoding));
				} else {
					let from = params.scope.get('object').values().next().value,
						to = params.scope.get('target').values().next().value;
					notify('xsel', convert(xselbuffer, from, to));
				}
			}
		});
	}
}

api.registerAction(new XselAction);