/*global module,require*/

var util   = require('util');
var events = require('events');
var WebSocketClient = require('ws');

var STREAM_BASE = 'wss://stream.pushbullet.com/websocket';

/**
 * Event emitter for the Pushbullet streaming API.
 *
 * @param {String} apiKey PushBullet API key.
 */
function Stream(apiKey) {
	var self = this;

	self.apiKey = apiKey;

	events.EventEmitter.call(self);

	self.client = new WebSocketClient(STREAM_BASE + '/' + this.apiKey);

	self.client.on('error', function(error) {
		self.emit('error', error);
	});

	self.client.on('open', function(connection) {

		self.connection = connection;

		self.emit('connect');

		self.client.on('error', function(error) {
			self.emit('error', error);
		});

		self.client.on('close', function() {
			self.emit('close');
		});

		self.client.on('message', function(message) {
			console.log('message', message);
			var data = JSON.parse(message);
			self.emit('message', data);

			if (data.type === 'nop') {
				self.emit('nop');
			}
			else if (data.type === 'tickle') {
				self.emit('tickle', data.subtype);
			}
			else if (data.type === 'push') {
				self.emit('push', data.push);
			}
		});
	});
}

util.inherits(Stream, events.EventEmitter);

module.exports = Stream;

/**
 * Connect to the stream.
 */
Stream.prototype.connect = function connect() {
	//this.client.connect(STREAM_BASE + '/' + this.apiKey);
};

/**
 * Disconnect from the stream.
 */
Stream.prototype.close = function close() {
	//this.connection.close();
};

