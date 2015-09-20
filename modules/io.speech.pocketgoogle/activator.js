"use strict";

module.exports = new (require('events').EventEmitter);

var pty = require('pty'),
	init = true,
	kws = pty.spawn(
		"/usr/local/bin/pocketsphinx_continuous",
		[
			'-inmic', 'yes', 
			'-hmm', '/home/paulll/public/projects/bot6/modules/io.speech.pocketgoogle/pocket/zero_ru_cont_8k_v3/zero_ru.cd_cont_4000',
			'-dict', '/home/paulll/public/projects/bot6/modules/io.speech.pocketgoogle/pocket/mydict.dict',
			//'-jsgf', '/home/paulll/public/projects/bot6/modules/io.speech.pocketgoogle/pocket/control.jsgf',
			'-keyphrase', 'картошка',
			'-kws_threshold', '1e-20'
		]
	);


kws.setEncoding('utf8');
kws.on('data', function (data) {
	if (data.indexOf('картошка') !== -1) {
		if (init) {return init = !init};
		module.exports.emit('activate');
	}
});


kws.on('close', function (code) {
  console.log('child process exited with code ' + code);
});
