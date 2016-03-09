"use strict";

var RequestMessage = api.lib.support.RequestMessage,
	Session = api.lib.support.Session,
	IoProvider = api.lib.support.IoProvider,
	async = require('async');

// classes
class FakeIoProvider extends IoProvider {};
class FakeSession extends Session {};

var tests = [
	function (cb) {
		let myio = new FakeIoProvider,
			myss = new FakeSession(myio),
			myms = new RequestMessage('привет');

		myss.send = function (message) {
			console.log('[SUCC]:', message.text);
			cb();
		}

		myio.appendSession(myio);
		myss.appendMessage(myms);
	}, 
	function (cb) {
		let myio = new FakeIoProvider,
			myss = new FakeSession(myio),
			myms = new RequestMessage('переведи строку в base64');

		myss.send = function (message) {
			console.log('[SUCC]:', message.text);
			cb();
		}


		myio.appendSession(myio);
		myss.appendMessage(myms);
	}
];

setTimeout(function () {
	async.series(tests, function (error, data) {

	})
}, 1060);