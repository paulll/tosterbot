"use strict";

var pty = require('pty'),
	fs = require('fs'),
	child_process = require('child_process'),
	getSimple = api.memory.getSimple,
	log = api.lib.debug.log,
	configedit = api.lib.configedit;

function startListening (directory, keyphrase) {
	log('Dict ready');

	var	init = true,
		kws = pty.spawn(
			"/usr/local/bin/pocketsphinx_continuous",
			[
				'-inmic', 'yes', 
				'-hmm', `${directory}/modules/io.speech.pocketgoogle/pocket/zero_ru_cont_8k_v3/zero_ru.cd_cont_4000`,
				'-dict', `${directory}/modules/io.speech.pocketgoogle/pocket/mydict.dict`,
				//'-jsgf', '/home/paulll/public/projects/bot6/modules/io.speech.pocketgoogle/pocket/control.jsgf',
				'-keyphrase', keyphrase,
				'-kws_threshold', '1e-40',
				'-kws_delay', '1'
			]
		);

	kws.setEncoding('utf8');
	kws.on('data', function (data) {
		if (data.indexOf(keyphrase) !== -1) {
			if (init) {return init = !init};
			module.exports.emit('activate');
		}
	});

	configedit.once('change', function () {
		startup(kws.close());
	});
}

!(function startup () {
	getSimple('rootDirectory', function (error, directory) {
		log('Got root directory');

		getSimple('recognition.keyphrase', function (error, keyphrase) {
			log('Got the keyphrase');

			fs.readFile(`${directory}/modules/io.speech.pocketgoogle/pocket/mydict.dict`, {encoding: "utf-8"}, function (error, data) {
				log('Got the dict', error);

				let needed = [],
					got = data.split('\n').map(x => x.substr(0, x.indexOf(' ')));

				keyphrase.split(' ').forEach(function (word) {
					if (!got.find(x => x == word)) {
						needed.push(word);
					}
				});

				if (needed.length) {
					log('Dict not ready');

					let child = child_process.exec(`${directory}/modules/io.speech.pocketgoogle/pocket/ru4sphinx/text2dict/dict2transcript.pl`, {
						cwd: `${directory}/modules/io.speech.pocketgoogle/pocket/ru4sphinx/text2dict`,
						encoding: 'utf-8'
					}, function (error, stdout) {
						fs.appendFile(`${directory}/modules/io.speech.pocketgoogle/pocket/mydict.dict`, stdout, function (error) {
							startListening(directory, keyphrase);
						});
					});

					child.stdin.setEncoding('utf-8');
					child.stdin.write(needed.join('\n') + '\n');
				} else {
					startListening(directory, keyphrase);
				}
				
			});
		});
	});
})();

module.exports = new (require('events').EventEmitter);