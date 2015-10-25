var fs = require('fs'),
	path = require('path'),
	regex = /\( (.) → (.*) \)/gm
	dict = JSON.parse(fs.readFileSync(path.join(__dirname, 'confusables.json')));

/*

var raw_dict = fs.readFileSync(path.join(__dirname, 'confusables.txt'));

do {
	var match = regex.exec(raw_dict);
	if (match) {
		dict[match[1]] = match[2];	
	}
} while (match != null);

fs.writeFileSync(path.join(__dirname, 'confusables.json'), JSON.stringify(dict));

*/

var blacklist = {};
',.;\'"?!:/\\'.split('').forEach(function(e){
	blacklist[e] = true;
});

var translit = {"6":"b","a":"a","ʙ":"v","r":"g","д":"d","e":"e","ё":"e","ж":"zh","ɜ":"z","ᴎ":"i","й":"j","k":"k","л":"l","rn":"rn","ʜ":"n","o":"o","n":"p","p":"r","c":"s","t":"t","y":"u","ɸ":"f","x":"h","u":"c","ч":"ch","ш":"sh","щ":"sh","ˉb":"","ƅi":"y","ƅ":"","э":"e","ю":"yu","ᴙ":"ya"," ":""}

function replace(a) {
	return (typeof dict[a] === 'undefined') ? a : dict[a];
};

function replace_translit(a) {
	return (typeof translit[a] === 'undefined') ? a : translit[a];
};

api.lib.simplify = function (phrase) {
	return phrase.toLowerCase().split('').map(replace).map(replace_translit).filter(function (e) {return typeof blacklist[e] === 'undefined'} ).join('');
};

api.lib.simplify('прив');
api.lib.simplify('priv');