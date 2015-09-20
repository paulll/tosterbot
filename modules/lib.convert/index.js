api.lib.convert = function (data, source, dest) {

	switch (source) {
		case 'base64':
			data = new Buffer(data, 'base64');
			break;
		case 'json':
			data = JSON.parse(data);
			break;
		case 'hex':
			data = new Buffer(data.replace(/[^0-9a-zA-F]+/gm, ''));
			break;
	}

	switch (dest) {
		case 'string':
			if (typeof data == 'string') {
				return data;
			} else {
				return data.toString()
			}
		case 'json':
			return JSON.stringify(data, false, '\t');
		case 'base64':
			return (new Buffer(data)).toString('base64');
	}

	return data;
};