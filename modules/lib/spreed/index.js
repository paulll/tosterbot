'use strict';

var child_process = require('child_process'),
	path = require('path'),
	handleError = api.lib.debug.handleError,
	level = api.lib.debug.level;

api.lib.spreed = {};

api.lib.spreed.show = function (options, text, callback) {
	
	let isWin;

	if (isWin = process.platform == 'win32') {
		handleError(new Error('OS not supported for this module'), level.warn, callback);
		return;
	}

	var proc = child_process.spawn(__dirname + '/bin/displaytext', []),
		close = proc.kill.bind(proc);

	process.on('exit', close);

	options.speed = options.speed || 3;

	options.controller = options.controller || function (word, i) {
		
		let index = Math.floor((word.length-1)/2);
		
		word = '<span font_desc="Roboto Slab 22" background="white" foreground="black">  ' + word.substr(0, index) + '<span foreground="red">' + word[index] + '</span>' + word.substr(index+1) + '  </span>'; 

		if (i == 0) {
			return [200 + Math.max(word.length * options.speed, 400), word];
		}

		return [Math.max(word.length * options.speed, 100), word];
	}

	var items = text.split(/\s/).map((x, i) => options.controller(x, i));

	(function recursive () {
		let item = items.shift();
		proc.stdin.write(item[1] + '\n');
		if (items.length) {
			setTimeout(recursive, item[0]);
		} else {
			setTimeout(function(){
				proc.kill();
				process.removeListener('exit', close);
			}, item[0]);
		}
	})();
};

api.lib.spreed.show({}, 'Ну теперь я могу быстро показывать текст!')