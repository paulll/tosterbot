var util = require('lib/util');
var dict = {};

/**
 * Обработка:
 * 1. Определение свойств слова
 * 		Проверка на наличие слова в кэше
 * 			если есть, то return
 * 	  	Разбиение слова на части
 * 	  		если невалидно, то повторить попытку
 * 	    Определение части речи
 *      Определение свойств	    
 * 
 * 
 * Структура:
 * 	 list - генераторы списков слов по частям речи (*.dg)
 *   dict - обработчики для каждой части речи (*.js)
 *   cache - кэш словарей и списков (*.list, *.dict)
 *
 * 
 * 
 * make lists чтобы сгенерировать кэш списков
 * make dicts чтобы сгенерировать кэш словарей
 * make cache чтобы сгенерировать кэш
 *  
 */

