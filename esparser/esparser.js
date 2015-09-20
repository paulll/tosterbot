var fs = require('fs');

/**
 * Словарь частей речи Эсперанто + словарь корней
 */
var dict = {
	prepositions: ['en', 'al', 'el', 'inter', 'sub', 'sur', 'super', 'antaŭ', 'ĉe', 'trans', 'tra', 'ĉirkaŭ', 'ĝis', 'de', 'ekster', 'apud', 'preter', 'pri', 'kun', 'sen', 'lontraŭ', 'anstataŭ', 'post', 'per', 'laŭ', 'dum', 'krom', 'malgraŭ', 'por', 'pro', 'po', 'da', 'je'],
	pronouns: ['mi', 'vi', 'li', 'ŝi', 'ĝi', 'ni', 'ili', 'oni', 'sin'],
	conjunctions: ['kaj', 'aŭ', 'sed', 'ĉar', 'se', 'do', 'kvankam', 'kvazaŭ', 'tamen', 'ke', 'ol'],
	particles: ['ĉu', 'ĉi'],
	particles_adjective: ['pli', 'plej'],
	functions: ['jes', 'ne', 'jam', 'ankoraŭ', 'ĵus', 'num', 'tuj', 'hieraŭ', 'hodiaŭ', 'baldaŭ', 'ankaŭ', 'eĉ', 'nur', 'preskaŭ', 'tre', 'tro', 'ja', 'mem', 'ambaŭ', 'for', 'jen'],
	numerals: ['nul', 'unu', 'du', 'tri', 'kvar', 'kvin', 'ses', 'sep', 'ok', 'naŭ', 'dek', 'cent', 'mil', 'miliono'],
	adverbs: ['ankoraŭ', 'almenaŭ', 'apenaŭ', 'baldaŭ', 'eĉ', 'for', 'jam', 'jen', 'ĵus', 'hieraŭ', 'hodiaŭ', 'morgaŭ', 'nun', 'preskaŭ', 'plu', 'tre', 'tro', 'tuj'],
	 
	// Коррелятивы состоят из двух частей
	correlatives_start: ['ki', 'ti', 'i', 'ĉi', 'neni'],
	correlatives_end: ['a', 'al', 'am', 'e', 'el', 'es', 'o', 'om', 'u'],
	
	// Корни в порядке убывания длины (вообще херовый способ это, но язык небольшой, должно проканать)
	roots: fs.readFileSync('./esroots.list', {encoding: 'utf8'}).split('\n').sort(function(a,b){return b.length-a.length}),
	
	// Приставки и предлоги (и те, и другие можно использоваь как префикс, но только предлоги можно ставить отдельно). Не менять порядок!
	prefixes: ['anstataŭ', 'malgraŭ', 'lontraŭ', 'preter', 'ĉirkaŭ', 'ekster', 'trans', 'inter', 'antaŭ', 'super', 'krom', 'post', 'apud', 'pra', 'pri', 'kun', 'sen', 'eks', 'dis', 'sub', 'per', 'laŭ', 'dum', 'tra', 'mal', 'por', 'pro', 'sur', 'ĝis', 'mis', 'da', 'ge', 'al', 'ĉe', 'po', 'de', 'je', 're', 'ek', 'el', 'en'],

	// Основные суффиксы. Не менять порядок!
	suffixes: ['estr', 'ism', 'ebl', 'ind', 'ist', 'obl', 'ul', 'iĝ', 'em', 'in', 'aĵ', 'ej', 'ec', 'et', 'id', 'an', 'eg', 'ad', 'ar', 'il', 'er', 'aĉ', 'uj', 'ig', 'op', 'on']
}

Object.prototype.arr = function (property) {if (this[property]) {return this[property]} else {return this[property] = []}};
var util = {
	ends: function (word, endings) {
		return !endings.every(function (ending) {
			return word.substr(-ending.length) != ending;
		});
	},
	in: function (word, list) {
		return ~list.indexOf(word);
	},
	starts: function (word, start) {
		return word.substr(0, start.length) == start;
	},
	startsm: function (word, starts) {
		return !starts.every(function (start) {
			return word.substr(0, start.length) != start;
		});
	},
	prefixes: function (word) {
		return (function deeper(part, result, stop) {
			dict.prefixes.every(function (prefix) {
				if (util.starts(part, prefix)) {
					result.push(prefix);
					part = part.substr(prefix.length);
					return false;
				}
				return true;
			});
			if (!stop--) {
				return [];
			}
			if (part.length) {
				return deeper(part, result, stop);
			} else {
				return result;
			}
		})(word, [], 100);
	},
	suffixes: function (word) {
		return (function deeper(part, result, stop) {
			dict.suffixes.every(function (suffix) {
				if (util.starts(part, suffix)) {
					result.push(suffix);
					part = part.substr(suffix.length);
					return false;
				}
				return true;
			});
			if (!stop--) {
				return [];
			}
			if (part.length) {
				return deeper(part, result, stop);
			} else {
				return result;
			}
		})(word, [], 100);
	},
	split: function (word) {
		var result = {root: word.toLowerCase(), pre: '', post: ''};

		return (function deeper () {
			if (dict.roots.every(function(root) {
				if (util.starts(result.root, root)) {
					result.post = result.root.substr(root.length);
					result.root = result.root.substr(0, root.length);
					return false
				}
				return true;
			})){
				result.pre += result.root.substr(0, 1);
				result.root = result.root.substr(1);
				if (!result.root.length) {
					console.log('Невозможно определить корень!', word);
					return {root: word, pre: '', post: ''};
				}
				return deeper();
			} else {
				return result;
			}
		})();
	},
	whichStarts: function (word, starts) {
		var result = false;
		starts.every(function (start) {
			if (util.starts(word, start)) {
				result = start;
				return false;
			}
			return true;
		});
		return result;
	},
	whichEnds: function (word, ends) {
		var result = false;
		ends.every(function (ending) {
			if (word.substr(-ending.length) == ending) {
				result = ending;
				return false;
			}
			return true;
		});
		return result;
	}
}

/**
 * Первый проход - определение членов предложения
 */

/**
 * Условия принадлежности слова к какой-либо части речи
 */
var validate = {
	preposition: function (word) { // предлог
		return util.in(word, dict.prepositions);
	},
	pronoun: function (word) {	// местоимение
		return util.startsm(word, dict.pronouns) && util.ends(word, ['a', 'n', 'an', 'ajn', 'jn', '']);
	},
	conjunction: function (word) { // союз
		return util.in(word, dict.conjunctions);
	},
	adjective_particle: function (word) { // определяет степень прилагательного
		return util.in(word, dict.particles_adjective);
	},
	particle: function (word) { // частица
		return util.in(word, dict.particles);
	},
	numeral: function (word) { // числительное

		// Убираем окончания, они не нужны на стадии определения части речи
		if (end = util.whichEnds(word, ["oblojn", "oblejn", "onejn", "oblon", "opojn", "obloj", "opejn", "oblen", "onojn", "oblej", "onoj", "opon", "opoj", "oblo", "opej", "onej", "onen", "open", "oble", "onon", "opo", "ope", "one", "ono", "ejn", "ojn", "en", "ej", "oj", "on", "e", "o"])) {
			word = word.substr(0, word.length - end.length);
		}

		// Простые. От 0 до 9, а так же 10, 100, 1000, 1000000, 1000000000 и так далее
		if (util.in(word, dict.numerals)) {
			return true;
		}

		// Двусоставные числа, т.е. через дефис (всегда порядковые, но пох)
		var parts = word.split('-');
		if (parts.length == 2) {
			return !dict.numerals.every(function(num){
				if (util.starts(part[0], num)) {
					return !util.in(part[0].substr(num.length), ['dek', 'cent']);
				} else {
					return true;
				}
			}) && !dict.numerals.every(function(num){
				if (util.starts(part[1], num)) {
					return !util.in(part[1].substr(num.length), ['dek', 'cent']);
				} else {
					return true;
				}
			});
		}

		// Сложные числа - десятки и сотни
		return !dict.numerals.every(function(num){
			if (util.starts(word, num)) {
				return !util.in(word.substr(num.length), ['dek', 'cent']);
			} else {
				return true;
			}
		});
	},
	correlative: function (word) { // местоимения и местоименные наречия
		return !dict.correlatives_start.every(function (start) {
			return dict.correlatives_end.every(function (mid) {
				return ['', 'j', 'n', 'jn'].every(function (end) {
					return word != start + mid + end ;
				});
			});
		});
	},
	article: function (word) { // артикль
		return util.in(word, ['la']);
	},
	function_word: function (word) { // служебное слово
		return util.in(word, dict.functions);
	},
	passive_participle: function (word) { // страдательное причастие
		return util.ends(word, ['ita', 'ata', 'ota']);
	},
	active_participle: function (word) { // причастие
		return util.ends(word, ['inta', 'anta', 'onta']);
	},
	passive_transgressive: function (word) { // страдательное деепричастие
		return util.ends(word, ['ite', 'ate', 'ote']);
	},
	active_transgressive: function (word) { // деепричастие
		return util.ends(word, ['inte', 'ante', 'onte']);
	},
	number: function (word) { // число
		return /^[0-9]+|0x[0-9a-f]+$/i.test(word)
	},
	noun: function (word) { // существительное
		return util.ends(word, ['o', 'oj', 'on', 'ojn']);
	},
	adjective : function (word) { // прилагательное
		return util.ends(word, ['a', 'aj', 'an', 'ajn']);
	},
	verb: function (word) { // глагол
		return util.ends(word, ['i', 'is', 'as', 'os', 'u', 'us']);
	},
	adverb: function (word) { // наречие
		return util.ends(word, ['e']) || util.in(word, dict.adverbs);
	}
}

function getType (word) {
	for (var type in validate) {
		if (validate[type](word.toLowerCase().replace(/[^a-zĉĥŭĵŝ0-9-]/g, ''))) {
			return type;
		}
	}
}
function pass1(sentence) {
	return sentence.replace(/([\s\.,?!;:]+)/gmi, '|$1|').replace(/\|\s*\|/gm, '|').split('|').filter(function(e){return e}).map(function (word) {
		if (/[\.,?!;:]+/.test(word)) {
			return {type: 'mark', word: word}
		}
		return {type: getType(word), word: word};
	});
}
console.log('Первый проход:', pass1(process.argv.slice(2).join(' ')));


/**
 * Второй проход - определение свойств
 */
var properties = {
	preposition: function (word) { // предлог
		return word;
	},
	pronoun: function (word) {	// местоимение
		if (util.ends(word.word, ['n'])) {
			word.case = 'akk';
		}
		if (util.ends(word.word, ['j', 'jn'])) {
			word.multiple = true;
		}
		if (util.ends(word.word, ['a', 'an', 'aj', 'ajn'])) {
			word.possessive = true;
		}
		return word;
	},
	conjunction: function (word) { // союз
		return word;
	},
	particle: function (word) { // частица
		return word;
	},
	adjective_particle: function (word) { // определяет степень прилагательного
		return word;
	},
	numeral: function (word) { // числительное
		word.value = dict.numerals.indexOf(word.word);
		dict.numerals.every(function(num){
			if (util.starts(word.word, num)) {
				if (word.word.substr(num.length) == 'dek') {
					word.value = dict.numerals.indexOf(num) * 10;
					return false;
				}
				if (word.word.substr(num.length) == 'cent') {
					word.value = dict.numerals.indexOf(num) * 100;
					return false;
				}
			} else {
				return true;
			}
		});
		if (word.word == 'mil') {
			word.value = 1000;
		}
		if (util.starts(word.word, 'miliono')) {
			word.value = 1000000;
		}
		return word;
	},
	article: function (word) { // артикль
		return word;
	},
	function_word: function (word) { // служебное слово
		return word;
	},
	passive_participle: function (word) { // страдательное причастие
		var parts = util.split(word.word.substr(0, word.word.length - 3));
		word.root = parts.root;
		word.prefixes = util.prefixes(parts.pre);
		word.suffixes = util.suffixes(parts.post);
		switch (word.word.substr(-3)) {
			case 'ita':
				word.time = -1;
				break;
			case 'ata':
				word.time = 0;
				break;
			case 'ota':
				word.time = 1;
				break;
		}
		return word;
	},
	active_participle: function (word) { // причастие
		var parts = util.split(word.word.substr(0, word.word.length - 4));
		word.root = parts.root;
		word.prefixes = util.prefixes(parts.pre);
		word.suffixes = util.suffixes(parts.post);
		switch (word.word.substr(-3)) {
			case 'inta':
				word.time = -1;
				break;
			case 'anta':
				word.time = 0;
				break;
			case 'onta':
				word.time = 1;
				break;
		}
		return word;
	},
	passive_transgressive: function (word) { // страдательное деепричастие
		var parts = util.split(word.word.substr(0, word.word.length - 3));
		word.root = parts.root;
		word.prefixes = util.prefixes(parts.pre);
		word.suffixes = util.suffixes(parts.post);
		switch (word.word.substr(-3)) {
			case 'ite':
				word.time = -1;
				break;
			case 'ate':
				word.time = 0;
				break;
			case 'ote':
				word.time = 1;
				break;
		}
		return word;
	},
	active_transgressive: function (word) { // деепричастие
		var parts = util.split(word.word.substr(0, word.word.length - 4));
		word.root = parts.root;
		word.prefixes = util.prefixes(parts.pre);
		word.suffixes = util.suffixes(parts.post);
		switch (word.word.substr(-3)) {
			case 'inte':
				word.time = -1;
				break;
			case 'ante':
				word.time = 0;
				break;
			case 'onte':
				word.time = 1;
				break;
		}
		return word;
	},
	number: function (word) { // число
		word.value = parseInt(word.word);
		return word;
	},
	noun: function (word) { // существительное
		var flags = word.word.substr(word.word.lastIndexOf('o')),
			parts = util.split(word.word.substr(0, word.word.lastIndexOf('o')));
		if (util.in('j', flags)) {
			word.multiple = true;
		}
		if (util.in('n', flags)) {
			word.case = 'akk';
		}
		word.root = parts.root;
		word.prefixes = util.prefixes(parts.pre);
		word.suffixes = util.suffixes(parts.post);

		return word;
	},
	correlative: function (word) {
		var root = util.whichStarts(word.word, dict.correlatives_start),
			end = util.whichStarts(word.word.substr(root.length), dict.correlatives_end),
			flags = word.word.substr(root.length + end.length);

		if (util.in('j', flags)) {
			word.multiple = true;
		}
		if (util.in('n', flags)) {
			word.case = 'akk';
		}

		return word;
	},
	adjective : function (word) { // прилагательное
		var flags = word.word.substr(word.word.lastIndexOf('a')),
			parts = util.split(word.word.substr(0, word.word.lastIndexOf('a')));
		if (util.in('j', flags)) {
			word.multiple = true;
		}
		if (util.in('n', flags)) {
			word.case = 'akk';
		}
		word.comparsion = 'positive';
		word.root = parts.root;
		word.prefixes = util.prefixes(parts.pre);
		word.suffixes = util.suffixes(parts.post);

		return word;
	},
	verb: function (word) { // глагол
		var parts;
		if (util.ends(word.word, ['i'])) {
			word.infinitive = true;
			parts = util.split(word.word.substr(0, word.word.length - 1));
		}
		if (util.ends(word.word, ['is'])) {
			word.time = -1;
			parts = util.split(word.word.substr(0, word.word.length - 2));
		}
		if (util.ends(word.word, ['as'])) {
			word.time = 0;
			parts = util.split(word.word.substr(0, word.word.length - 2));
		}
		if (util.ends(word.word, ['os'])) {
			word.time = 1;
			parts = util.split(word.word.substr(0, word.word.length - 2));
		}
		if (util.ends(word.word, ['us'])) {
			word.mood = 'sub';
			parts = util.split(word.word.substr(0, word.word.length - 2));
		}
		if (util.ends(word.word, ['u'])) {
			word.mood = 'imp';
			parts = util.split(word.word.substr(0, word.word.length - 1));
		}
		word.mood = word.mood || 'ind';

		word.root = parts.root;
		word.prefixes = util.prefixes(parts.pre);
		word.suffixes = util.suffixes(parts.post);
		
		return word;
	},
	adverb: function (word) { // наречие
		return word;
	}
};
function pass2(words) {
	return words.map(function (word) {
		if (word.type == 'mark') {
			return word;
		}
		return properties[word.type](word);
	});
}
console.log('Второй проход:\n', JSON.stringify(pass2(pass1(process.argv.slice(2).join(' '))),null,'\t'));

/**
 * Третий проход. AST и взаимосвязь слов.
 */

function pass3 (words) {

	var graph = [];

	function Link (subject, predicate, object) {
		this.subject = subject;
		this.predicate = predicate;
		this.object = object;
	}

	function link (subject, predicate, object) {
		var triplet = new Link(subject, predicate, object); 
		subject.arr('links').push(triplet);
		object.arr('links').push(triplet);
	}

	function iterwords (word, callback) {
		words.forEach(function(wo, index) {
			callback(wo, index < words.indexOf(word), words[index - 1], word[index + 1]);
		});
	}

	var deps = {
		// предлог
		// указывает связь между двумя словами
		// пока что упростим, что предлог связывает два соседних слова (ex: дом напротив парка)
		preposition: function (word) { 
			var index = words.indexOf(word);
			link(words[index - 1], {preposition: word}, words[index + 1]);
		},

		// местоимение
		// подразумевает что-то, видимое из контекста
		// не инициирует связей между словами
		pronoun: function (word) {},

		// союз
		// соединяет части сложного предложения или его однородные члены
		// допустим, что если перед ним запятая - то он делит части предложения, иначе ищем ближайшую пару однородных членов и соединяем их
		conjunction: function (word) { 
			return;
			var accepted = false,
				before = [];
		
			// Зависит от слов
			accept(word, false, function (wo, isBefore, prev, next) {

				// Если союз стоит сразу после запятой, то относим его к ней.
				if (next == word && wo.type == 'mark') {
					return accepted = true;
				}

				// Ну и если однородные члены предложения до и после
				if (!accepted) {
					if (isBefore) {
						if (wo.type == 'conjunction') {
							before = [];
						} else {
							before.push(wo);
						}
					} else {
						if (wo.type == 'conjunction' && wo !== word) {
							accepted = true;
							return false;
						}
						before.every(function (ow) {
							if (ow.type == wo.type && ow.case == wo.case) {
								link(ow, word);
								link(word, wo);
								return false;
							}
							return true;
						});
						return false;
					}
				}

			});
		},
		particle: function (word) { // частица
			
		},
		// определяет степень сравнения прилагательного
		// допустим, что оно стоит прямо перед прилагательным.
		adjective_particle: function (word) { 
			var index = words.indexOf(word),
				adj = words[index + 1];
			words.splice(index, 1);
			adj.comparsion = (word == 'plej') ? 'superlative' : 'comparative';
		},
		// числительное
		// состоит из нескольких слов
		// будем совмещать их в одно, т.е. список слов изменяется тут.
		numeral: function (word) { // числительное
			var index = words.indexOf(word),
				values = [word.value],
				value = 0,
				acc = 0,
				last = 0;
			
			// поглощаем все числительные идущие подряд
			(function recursive () {
				if (words[index+1] && words[index+1].type == 'numeral') {
					values.push(words[index+1].value);
					word.word += ' ' + words[index+1].word;
					words.splice(index + 1, 1);
					recursive();
				}
			})();

			// преобразуем числа в одно
			for (var i=0,l=values.length;i<l;i++) {
				var current = values[i];
				if (current >= 1000) {
					value += (acc || 1) * current;
					acc = 0;
				} else {
					acc += current;
				}
			}
			value += acc;

			word.value = value;
		},
		correlative: function (word) { // местоимения и местоименные наречия
			
		},
		article: function (word) { // артикль
			
		},
		function_word: function (word) { // служебное слово
			
		},
		passive_participle: function (word) { // страдательное причастие
			
		},
		active_participle: function (word) { // причастие
			
		},
		passive_transgressive: function (word) { // страдательное деепричастие
			
		},
		active_transgressive: function (word) { // деепричастие
			
		},
		number: function (word) { // число
			
		},
		noun: function (word) { // существительное
			
		},
		adjective : function (word) { // прилагательное
			
		},
		verb: function (word) { // глагол
			
		},
		adverb: function (word) { // наречие
			
		},
		mark: function (word) {}
	}

	for (var i=0;i<words.length;i++) {
		deps[words[i].type](words[i]);
	}
	return words;
}

console.log('Третий проход:\n', toJSON(pass3(pass2(pass1(process.argv.slice(2).join(' ')))),8,9000,'\t'));

function toJSON(object, objectMaxDepth, arrayMaxLength, indent) {
    "use strict";

    /**
     * Escapes control characters, quote characters, backslash characters and quotes the string.
     *
     * @param {string} string the string to quote
     * @returns {String} the quoted string
     */
    function quote(string)
    {
        escapable.lastIndex = 0;
        var escaped;
        if (escapable.test(string))
        {
            escaped = string.replace(escapable, function(a)
            {
                var replacement = replacements[a];
                if (typeof (replacement) === "string")
                    return replacement;
                // Pad the unicode representation with leading zeros, up to 4 characters.
                return "\\u" + ("0000" + a.charCodeAt(0).toString(16)).slice(-4);
            });
        }
        else
            escaped = string;
        return "\"" + escaped + "\"";
    }

    /**
     * Returns the String representation of an object.
     * 
     * Based on <a href="https://github.com/Canop/JSON.prune/blob/master/JSON.prune.js">https://github.com/Canop/JSON.prune/blob/master/JSON.prune.js</a>
     *
     * @param {string} path the fully-qualified path of value in the JSON object
     * @param {type} value the value of the property
     * @param {string} cumulativeIndent the indentation to apply at this level
     * @param {number} depth the current recursion depth
     * @return {String} the JSON representation of the object, or "null" for values that aren't valid
     * in JSON (e.g. infinite numbers).
     */
    function toString(path, value, cumulativeIndent, depth)
    {
        switch (typeof (value))
        {
            case "string":
                return quote(value);
            case "number":
                {
                    // JSON numbers must be finite
                    if (isFinite(value))
                        return String(value);
                    return "null";
                }
            case "boolean":
                return String(value);
            case "object":
                {
                    if (!value)
                        return "null";
                    var valueIndex = values.indexOf(value);
                    if (valueIndex !== -1)
                        return "Reference => " + paths[valueIndex];
                    values.push(value);
                    paths.push(path);
                    if (depth > objectMaxDepth)
                        return "...";

                    // Make an array to hold the partial results of stringifying this object value.
                    var partial = [];

                    // Is the value an array?
                    var i;
                    if (Object.prototype.toString.apply(value) === "[object Array]")
                    {
                        // The value is an array. Stringify every element
                        var length = Math.min(value.length, arrayMaxLength);

                        // Whether a property has one or multiple values, they should be treated as the same
                        // object depth. As such, we do not increment the object depth when recursing into an
                        // array.
                        for (i = 0; i < length; ++i)
                        {
                            partial[i] = toString(path + "." + i, value[i], cumulativeIndent + indent, depth,
                                arrayMaxLength);
                        }
                        if (i < value.length)
                        {
                            // arrayMaxLength reached
                            partial[i] = "...";
                        }
                        return "\n" + cumulativeIndent + "[" + partial.join(", ") + "\n" + cumulativeIndent +
                            "]";
                    }

                    // Otherwise, iterate through all of the keys in the object.
                    for (var subKey in value)
                    {
                        if (Object.prototype.hasOwnProperty.call(value, subKey))
                        {
                            var subValue;
                            try
                            {
                                subValue = toString(path + "." + subKey, value[subKey], cumulativeIndent + indent,
                                    depth + 1);
                                partial.push(quote(subKey) + ": " + subValue);
                            }
                            catch (e)
                            {
                                // this try/catch due to forbidden accessors on some objects
                                if (e.message)
                                    subKey = e.message;
                                else
                                    subKey = "access denied";
                            }
                        }
                    }
                    var result = "\n" + cumulativeIndent + "{\n";
                    for (i = 0; i < partial.length; ++i)
                        result += cumulativeIndent + indent + partial[i] + ",\n";
                    if (partial.length > 0)
                    {
                        // Remove trailing comma
                        result = result.slice(0, result.length - 2) + "\n";
                    }
                    result += cumulativeIndent + "}";
                    return result;
                }
            default:
                return "null";
        }
    }

    if (indent === undefined)
        indent = "  ";
    if (objectMaxDepth === undefined)
        objectMaxDepth = 0;
    if (arrayMaxLength === undefined)
        arrayMaxLength = 50;
    // Matches characters that must be escaped
    var escapable =
        /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
    // The replacement characters
    var replacements =
        {
            "\b": "\\b",
            "\t": "\\t",
            "\n": "\\n",
            "\f": "\\f",
            "\r": "\\r",
            "\"": "\\\"",
            "\\": "\\\\"
        };
    // A list of all the objects that were seen (used to avoid recursion)
    var values = [];
    // The path of an object in the JSON object, with indexes corresponding to entries in the
    // "values" variable.
    var paths = [];
    return toString("root", object, "", 0);
}
function toJSON (a) {return a}