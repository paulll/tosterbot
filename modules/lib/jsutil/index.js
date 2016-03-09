Array.prototype.__defineGetter__('top', function () {
	return this[this.length - 1];
});