"use strict";

var	handleError = api.lib.debug.handleError,
	level = api.lib.debug.level,
	Action = api.lib.support.Action,
	notify = api.notify.notify,
	SerialPort = require("serialport").SerialPort;

class XselAction extends Action {
	
	constructor () {
		super();
		this.name = 'lightctl';

		api.lib.dict.loadRules('./dict/ru/input/lightctl.dict', function(error) {
			if (error) {
				console.log('[FAIL]', 'Should load lightctl input dict');
			} 
		});

		console.log('Pretending that arduino is on /dev/ttyUSB0');
		try {
			this.serialPort = new SerialPort("/dev/ttyUSB0");
		} catch (e) {
			console.log('sp:', e);
		}
		this.serialPort.on('open', function () {
			console.log('Serial port opened successifully');
		});
		this.serialPort.on('error', function (e) {
			console.log('Serial port error:', e);
		});
	}

	do (params, callback) {
		let self = this;

		console.log('change light state');
		self.serialPort.write('@');
	}
}

api.registerAction(new XselAction);