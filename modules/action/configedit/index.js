"use strict";

var simplify = api.lib.simplify,
	handleError = api.lib.debug.handleError,
	level = api.lib.debug.level,
	Action = api.lib.support.Action,
	ResponseMessage = api.lib.support.ResponseMessage,
	confirm = api.lib.confirm,
	configedit = api.lib.configedit;


var confs = {
	"recognition.keyphrase": new Set([
		'фраза активации',
		'фразу активации',
		"активационная фраза",
		"активационную фразу",
		'ключевое слово',
		'recognition keyphrase',
		'recognition dot keyphrase',
		'recognition.keyphrase'
	]),

	"TcpChatPort": new Set([
		'порт чата',
		'порт tcp чата',
		'порт'
	])
}

var values = {
	"высокий": '1e-20',
	"средний": '1e-30',
	'низкий': '1e-40',
	'очень низкий': '1e-50'
}

class ConfigeditAction extends Action {
	
	constructor () {
		super();
		this.name = 'configedit';

		api.lib.dict.loadRules('./dict/ru/input/configedit.dict', function(error) {});
	}

	do (message, callback) {

		var tochange = message.params.setting,
			value = message.params.value,
			temp = message.params.temp;

		confirm(message, (temp ? 'временную' : 'постоянную') + 'установку значения ' + tochange + ' в ' + value , function (error, ok) {
			if (error) {
				console.error(error);
			} else {
				if (ok) {
					configedit.set(tochange, value, !temp);
				}
			}
		});
	}
}

api.registerAction(new ConfigeditAction);