'use strict';

var typo = {};
api.lib.typo = typo;

var async = require('async');

var keyboard = [
	'qwertyuiop',
	'sdfghjkl',
	'zxcvbnm',
	'йцукенгшщзхъ',
	'фывапролджэ',
	'ячсмитьбю'
];

var noshift = [
	'1234567890-=\\][pl;\'/.,', // en
	'1234567890-=\\ъхзджэ.юб'
]

var shift = [
	'!@#$%&*()_+|}{PL:"?><', // en
	'!"№;%:?*()_+/ЪХЗДЖЭ,ЮБ'
];

var kbparts = [
	'tgbvfredcxswqzепимакувсчыцйя',
	'yhnmjuiklopнртьогшлбюдщзжэхъ'
]

/**
 * Options
 * 	- {5}			fast				maek typos like thsi (value is proportional to the possibility of this type of mistake)
 * 	- {0} 			blind				nearby keys instead of taegt
 * 	- {true}  		realtime			timeout before callback
 * 	- {false} 		split				split message and call timeout N times. Needs 'realtime' set to 'true'
 * 	- {0}			noshift				randomly unpress shift
 * 	- {1}			skip				remove randm chars
 * 	- {40}			interval			interval between typos
 * 	- {0.2}			intervalAccuracy	interval = interval*(1 + (1 - accuracy)(random - 0.5))
 *
 * For realtime
 *  - {10}			speed 				ms per char
 *  - {0.1}			accuracy			time = chars*speed(1 + (1 - accuracy)*(random - 0.5))
 *
 * For message splitting
 * splitOptions = {object}
 * 	- {6.78}		wpm					words per message
 * 	- {40.44}		cpm 				chars per message
 * 	- {both}		criteria			wpm / cpm / both / any
 * 	- {[3.4,20]}	threshold			round threshold
 * 	- {2}			spread				randomization spread (words count will not be less than wpm value) // for 'wpm' or 'any' criteria    
 * 	
 */

typo.humanize = function (text, options, callback, endCallback) {

	// defaults 
	options.fast = (typeof options.fast === 'undefined') ? 5 : options.fast
	options.realtime = (typeof options.realtime === 'undefined') ? true : options.realtime 
	options.split = options.split; // false default
	options.noshift = (typeof options.noshift === 'undefined') ? 0 : options.noshift; 
	options.skip = (typeof options.skip === 'undefined') ? 1 : options.skip; 
	options.interval = (typeof options.interval === 'undefined') ? 40 : options.interval; 
	options.intervalAccuracy = (typeof options.intervalAccuracy === 'undefined') ? 0.2 : options.intervalAccuracy;

	options.speed = (typeof options.speed === 'undefined') ? 100 : options.speed;
	options.accuracy = (typeof options.accuracy === 'undefined') ? 0.3 : options.accuracy;

	options.splitOptions = options.splitOptions || {};
	options.splitOptions.wpm = (typeof options.splitOptions.wpm  === 'undefined') ? 2 : options.splitOptions.wpm;
	options.splitOptions.cpm = (typeof options.splitOptions.cpm  === 'undefined') ? 10 : options.splitOptions.cpm;
	options.splitOptions.criteria = options.splitOptions.criteria || 'any';
	options.splitOptions.threshold = options.splitOptions.threshold || [1, 5];
	options.splitOptions.spread = (typeof options.splitOptions.spread  === 'undefined') ? 2 : options.splitOptions.spread;

	/**
	 * Take mistake only if char keys are assigned to different hands. 
	 */
	function typo_fast(char, char2) {
		if (kbparts[0].indexOf(char) + kbparts[1].indexOf(char2) > 1) {
			return char2 + char;
		}
		if (kbparts[1].indexOf(char) + kbparts[0].indexOf(char2) > 1) {
			return char2 + char;
		}
		return char + char2;
	}

	/**
	 * Replace first char with adjacent key.
	 */
	function typo_blind(char, char2) {
		for (let row of keyboard) {
			let index = row.indexOf(char);
			if (~index) {
				let result = [
					row[index+1],
					row[index-1]
				].filter(x => x);

				return result[Math.floor(Math.random() * result.length)] + char2;
			} else {
				return char + char2;
			}
		}
	}

	/**
	 * Skip random char
	 */
	function typo_skip (char, char2) {
		if (Math.random() > 0.5) {
			return char;
		} else {
			return char2;
		}
	}

	/**
	 * Undo shift. ( ! => 1, % => 5, F => f ) 
	 */
	function typo_noshift (char, char2) {
		if (Math.random() > 0.5) {
			let temp = char2;
			char2 = char;
			char = temp;
		}

		for (let lid=0, lic=shift.length; lid<lic; lid++) {
			for (let kid=0, kic=shift[lid].length; kid<kic; kid++) {
				if (char == shift[lid][kid]) {
					return noshift[lid][kid];
				}
			}
		}
	}

	let typos = []
		.concat(Array(options.fast || 5).fill(typo_fast))
		.concat(Array(options.blind || 0).fill(typo_blind))
		.concat(Array(options.noshift || 0).fill(typo_noshift))
		.concat(Array(options.skip || 1).fill(typo_skip));


	if (options.realtime) {
		if (options.split) {
			let realCallback = callback;
			callback = function (message) {
				
				function send(part, _, cb) {
					let time = Math.abs(options.speed*part.length*(1 + options.accuracy*(Math.random() - 0.5)));

					setTimeout(function () {
						realCallback(part, cb);
					}, time);
				}

				let parts = [],
					part = [],
					words = message.split(/\s+/); 

				options.splitOptions.wpm--;

				for (let wid=0, wic=words.length;wid<wic;wid++) {

					let word = words[wid],
						random = (_ => Math.round(Math.abs(options.splitOptions.spread * (Math.random() - 0.5))));

					if (~['any', 'wpm'].indexOf(options.splitOptions.criteria)) {
						if (part.length >= options.splitOptions.wpm + random()) {

							// if there is small enough string at the end
							if (wic-wid < options.splitOptions.threshold[0]) {

								part = part.concat(words.slice(wid)).join(' ').replace(/(?![.,])[.,]$/, ''); // replace , or . at the line end
								parts.push(part);
								part = [];
								break;
							}

							part = part.concat([word]).join(' ').replace(/(?![.,])[.,]$/, '');
							parts.push(part);
							part = [];
							continue;
						}
					}
					if (~['any', 'cpm'].indexOf(options.splitOptions.criteria)) {
						if (part.join(' ').length > options.splitOptions.cpm) {
							
							// if there is small enough string at the end
							if (words.slice(wid).join(' ') <= options.splitOptions.threshold[1]) {

								part = part.concat(words.slice(wid)).join(' ').replace(/(?![.,])[.,]$/, ''); // replace , or . at the line end
								parts.push(part);
								part = [];
								break;	
							}

							part = part.concat([word]).join(' ').replace(/(?![.,])[.,]$/, '');
							parts.push(part);
							part = [];
							continue;
						}
					}
					if (~['both'].indexOf(options.splitOptions.criteria)) {
						if (part.length > options.splitOptions.wpm &&
							part.join(' ').length > options.splitOptions.cpm) {
							
							// if there is small enough string at the end
							if (words.slice(wid).join(' ') <= options.splitOptions.threshold[1] &&
								wic-wid <= options.splitOptions.threshold[0]) {

								part = part.concat(words.slice(wid)).join(' ').replace(/(?![.,])[.,]$/, ''); // replace , or . at the line end
								parts.push(part);
								part = [];
								break;	
							}

							part = part.concat([word]).join(' ').replace(/(?![.,])[.,]$/, '');
							parts.push(part);
							part = [];
							continue;
						}
					}

					part.push(word);
				}

				if (part.length) {
					part = part.join(' ').replace(/(?![.,])[.,]$/, '');
					parts.push(part);
				}

				async.forEachOfSeries(parts, send, endCallback);
				
			}
		} else {
			let realCallback = callback;
			callback = function (message) {
				// time = chars*speed(1 + accuracy*(random - 0.5))
				let time = Math.abs(options.speed*message.length*(1 + options.accuracy*(Math.random() - 0.5)));

				setTimeout(function () {
					realCallback(message);
				}, time);
			}
		}
	}

	let typoPlaces = Array(Math.floor(text.length / options.interval)).fill(0).map(function (_, x) {
		return Math.round((x * options.interval * (1 + (1 - options.intervalAccuracy)*(Math.random() - 0.5))));
	}).filter(x => x);

	function makeTypo(char1, char2) {
		typo = typos[Math.floor(Math.random() * typos.length)];
		return typo(char1, char2);
	}

	typoPlaces.forEach(function (place) {
		if (text[place + 1]) {
			return text = text.substr(0, place) + makeTypo(text[place], text[place+1]) + text.substr(place + 2);
		}
		if (text[place - 1]) {
			place--;
			return text = text.substr(0, place) + makeTypo(text[place], text[place+1]) + text.substr(place + 2);
		}
	});

	callback(text);
};

false&&typo.humanize('лорем ипсум долор сит амет, консестетуэр адипискинг элит, сед диам нонумми нибх юисмод тинсидунт ут лаореет долоре магна аликуам ерат волютпат',
	{
		split: true,
		interval: 40
	}, 
	console.log.bind(console)
);