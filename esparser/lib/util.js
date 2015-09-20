var fs = require('fs');

exports.importList = function (filename) {
	return fs.readFileSync(filename, {encoding: 'utf8'}).split('\n');
};

