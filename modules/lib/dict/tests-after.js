"use strict";

class NamedSet extends Set {
	constructor (name, array) {
		super(array);
		this.name = name;
	}
}

var tests = [
	[
		'Должно поддерживать невложенные множества',
		new Set(['a', 'b', 'c']),
		'b'
	],
	[
		'Должно поддерживать вложенные множества',
		new Set([
			new Set(['a', 'b', 'c'])
		]),
		'b'
	],
	[
		'Должно поддерживать конкатенцию',
		new Set([
			[
				new Set(['a', 'b', 'c']),
				new Set(['a', 'b', 'c'])
			]
		]),
		'ac'
	],
	[
		'Должно поддерживать вложенную конкатенцию',
		new Set([
			[
				[
					'a',
					['b']
				],
				'c'
			]
		]),
		'abc'
	],
	[
		'Должно определять ложные пути',
		new Set([
			[
				new Set([
					'start-middle',
					'start'
				]),
				new Set([
					'-middle-end',
				])
			]
		]),
		'start-middle-end'
	],
	[
		'Должно обрабатывать группы',
		new NamedSet('root', ['a', 'b', 'c']),
		'a',
		{
			root: 'a'
		}
	],
	[
		'Должно обрабатывать группы во вложенных множествах',
		new Set([
			[
				new NamedSet('not-a-root', [
					'start',
					'end'
				]),
				'-',
				new NamedSet('not-a-second-root', [
					'end',
					'start'
				])
			]
		]),
		'start-end',
		{
			'not-a-root': 'start',
			'not-a-second-root': 'end'
		}
	],
	[
		'Должно обрабатывать вложенные группы',
		new NamedSet('root', [
			new NamedSet('group-first', [
				'start',
				'end',
				'nope',
				''
			]),
			[
				new NamedSet('group-second', [
					new NamedSet('group-subsecond', [
						'start'
					]),
					'end'
				]),
				'-',
				new NamedSet('group-third',[
					'end'
				])
			]
		]),
		'start-end',
		{
			'root': 'start-end',
			'root.group-second': 'start',
			'root.group-second.group-subsecond': 'start',
			'root.group-third': 'end'
		}
	],
	[
		'Должно работать',
		new Set([
			[
				new Set(['сконвертируй','преобразуй','переведи','перевести','сконвертировать','преобразовать']),
				' ',
				new NamedSet('object', [
					new NamedSet('base64', ['base64','бейс64','base 64','бейс 64','б64','b64']),
					new NamedSet('string', ['строку','текст','ascii','unicode','utf8','utf-8','utf 8','utf']),
					new NamedSet('hex', ['hex','хекс','хекслеты']),
					new NamedSet('bin', ['bin','двоичный код','бинарный код','бин','бинари','бинарник']),
					new NamedSet('json', ['json','жсон','javascript object notation'])
				]),
				' в ',
				new NamedSet('target', [
					new NamedSet('base64', ['base64','бейс64','base 64','бейс 64','б64','b64']),
					new NamedSet('string', ['строку','текст','ascii','unicode','utf8','utf-8','utf 8','utf']),
					new NamedSet('hex', ['hex','хекс','хекслеты']),
					new NamedSet('bin', ['bin','двоичный код','бинарный код','бин','бинари','бинарник']),
					new NamedSet('json', ['json','жсон','javascript object notation'])
				])
			],
			[
				'упрости',
				' ',
				new NamedSet('unaryObject', [
					new NamedSet('base64', ['base64','бейс64','base 64','бейс 64','б64','b64']),
					new NamedSet('string', ['строку','текст','ascii','unicode','utf8','utf-8','utf 8','utf']),
					new NamedSet('hex', ['hex','хекс','хекслеты']),
					new NamedSet('bin', ['bin','двоичный код','бинарный код','бин','бинари','бинарник']),
					new NamedSet('json', ['json','жсон','javascript object notation'])
				])
			]
		]),
		'переведи строку в base64',
		{
			'object': {value: 'строку', items: ['string']},
			//'object.string': {value: 'строку'},
			'target': {value: 'base64', items: ['base64']}
			//'target.base64': 'base64'
		}
	]
];

var dictcheck = require('./dictcheck');


exports.run = function (callback, strict) {
	let success = true;
	tests.forEach(function (test) {

		if (!success && strict) {
			return;
		}

		let result, result2
		if (result = dictcheck(test[1], test[2])) {

			if (false&&test[3]) {
				for (var i in test[3]) {
					if (test[3].hasOwnProperty(i)) {
						if (result.scope.get(i) == test[3][i]) {
							console.log('[Тест успешен]', test[0]);
						} else {
							console.log('[Тест провален]', test[0]);
							success = false;
						}
					}
				}
			} else {
				console.log('[Тест успешен]', test[0]);
			}
		} else {
			console.log('[Тест провален]', test[0]);
			success = false;
		}
	});

	callback(success);
}