"use strict";

var tests = [
	[
		'Should support single Sets',
		new Set(['a', 'b', 'c']),
		'b'
	],
	[
		'Should support nested Sets',
		new Set([new Set(['a', 'b', 'c'])]),
		'b'
	],
	[
		'Should support concat (Arrays)',
		new Set([[new Set(['a', 'b', 'c']), new Set(['a', 'b', 'c'])]]),
		'ac'
	],
	[
		'Should handle wrong ways',
		new Set([[new Set(['ab', 'cb', 'c']), new Set(['c', 'a', 'bR'])]]),
		'cbR'
	],
	[
		'Should handle nested arrays',
		new Set([[['a', 'b'], 'c']]),
		'abc'
	],
	[
		'Should just work',
		new Set([
		    new Set([["прив", new Set(["", "ет"])], "приветик", "l"]),
		    new Set(["здраствуй", "здарова", "здорова", "здраствуйте", "здравия желаю", "здаров"]),
		    new Set(["хай", "хей", "хелло", "хеллоу", "хело", "хелоу"]),
		    new Set(["зд", "првт", "хлло", "здрствй", "здрствуй", "приветь", "приветъ"]),
		]),
		'прив'
	],
	[
		'Should support something more',
		new Set([[
			'flag-',
			new Set(["{pref-1}", "{pref-2}", "{pref-3}"]),
			new Set(["{root-1}", "{root-2}", "{root-3}"]),
			new Set(["{suff-1}", "{suff-2}", "{suff-3}"]),
			new Set(["{wro", "{wrong-1}", "{wrong"]),
			new Set(["ng", "-"]),
			new Set(["{end-1}", "{end-2}", "{end-3}"]),
		]]),
		'flag-{pref-1}{root-3}{suff-1}{wrong-1}-{end-2}'
	]
];

var dictcheck = require('./dictcheck');

exports.run = function (callback) {
	
	let success = true;

	tests.forEach(function (test) {
		if (dictcheck(test[1], test[2])) {
			//console.log('[SUCC]', test[0]);
		} else {
			console.log('[Тест провален]', test[0]);
			success = false;
		}
	});

	callback(success);
}