module.exports = function (string, args) {
	if (args && args.length && string) {
		for (var i=0,l=args.length;i<l;i++) {
			string = string.split('$' + i).join(args[i]);
		}
		string = string.split('$@').join(args.join(' '));
	} 

	return string;
}
