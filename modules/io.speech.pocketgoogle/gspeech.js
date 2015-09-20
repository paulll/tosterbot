'use strict';

var DUPLEX_API = 'https://www.google.com/speech-api/full-duplex/v1', DEFAULT_TIMEOUT = 10000;

var EventEmitter = require('events').EventEmitter, inherits = require('inherits');

// Determine the best available transcription
function determine(transcripts) {
	var command = '', confidence = 0;
	transcripts.forEach(function(transcript) {
		if(transcript.result && transcript.result.length > 0) {
			transcript.result.forEach(function(node) {
				if(node.final) {
					if(node.alternative[0].confidence > confidence) {
						confidence = node.alternative[0].confidence;
						command = node.alternative[0].transcript;
					}
				}
			});
		}
	});
	command = command.trim();
	return command;
}

function AudioStream() {
	this.post = 0;
	this.get = 0;
	this.stream = 0;

	Object.defineProperty(this, 'get', {
		value: this.get
	});

	Object.defineProperty(this, 'post', {
		value: this.post
	});

	Object.defineProperty(this, 'stream', {
		value: this.stream
	});
}

inherits(AudioStream, EventEmitter);

AudioStream.prototype.stop = function() {
	var self = this;

	this.stream.on('error', function(){});

	self.stream.end(function () {
		self.post.end(function () {
			self.get.end();
		});
	});	
};

function request(url, options, audio) {
	var hyperquest = require('hyperquest');

	// Redirect
	var cb = function(err, res) {
		if(res && (res.statusCode === 301 || res.statusCode === 302))
			return hyperquest(res.headers['location'], options, cb);
	};
	// Timeout
	var abort = function() {
		return audio.stop();
	};

	var req = hyperquest(url, options, cb), t, ms;
	var transcripts = [];

	// Handle each request
	if(options.method === 'GET') {
		ms = options.timeout;
		t = setTimeout(abort, ms);
		audio.get = req;
	}

	if(options.method === 'POST') {
		var stream = options.body;
		stream.pipe(req);
		audio.stream = stream;
		audio.post = req;
	}

	// Handle response
	req.on('response', function(res) {
		// Send back if response code is not 200
		if(res && res.statusCode !== 200) {
			audio.emit('error', new Error(res.statusCode));
			return audio.stop();
		}
		// Read stream
		res.on('data', function(chunk) {
			// Reset timer
			if(options.method === 'GET') {
				clearTimeout(t);
				t = setTimeout(abort, ms);
			}
			var data = chunk.toString();
			if(data !== '\r') {
				try {
					transcripts.push(JSON.parse(data));
				} catch(e) {
					audio.emit('error', e);
				}
				audio.emit('data', data);
				var translate = determine(transcripts);
				if(!(/^\s*$/.test(translate))) {
					audio.emit('translation', translate);
					transcripts = [];
				}
			}
		});
		if(options.method === 'GET') clearTimeout(t);
		// We handle the 'end' event, so lets handle errors
		res.on('end', function() {
			audio.emit('end');
			return audio.stop();
		});
	});
	// Handle errors
	req.on('error', function(err) {
		if(err) {
			audio.emit('error', err);
			return audio.stop();
		}
	});
};

exports.recognize = function(stream, options) {
	var util = require('util'), pair = require('crypto').randomBytes(32).toString('hex').slice(0, 16);

	if(!options.api_key) throw new Error('API key must be defined');
	if(!options.type) throw new Error('MIME type must be defined');
	if(!options.rate) throw new Error('Sample rate must be defined');
	if(!options.language) throw new Error('Language must be defined');

	//
	var downstream = util.format('%s/down?pair=%s&key=%s', DUPLEX_API, pair, options.api_key),
		upstream = util.format('%s/up?key=%s&pair=%s&lang=%s&client=chromium&interim&continuous&output=json', DUPLEX_API, options.api_key,
			pair, options.language);

	if(options.maxAlternatives) upstream += util.format('&maxAlternatives=%d', options.maxAlternatives);
	if(options.pFilter) upstream += util.format('&pfilter=%d', options.pFilter);
	if(options.lm) upstream += util.format('&lm=%s', options.lm);
	if(options.xhw) upstream += util.format('&xhw=%s', options.xhw);

	var audio = new AudioStream();

	// Call upstream
	request(upstream, { method: 'POST', body: stream, timeout: (options.timeout || DEFAULT_TIMEOUT),
		headers: { 'Content-Type': util.format('%s; rate=%d', options.type, options.rate),	'Transfer-Encoding': 'chunked' } }, audio);
	// Call downstream
	request(downstream, { method: 'GET', timeout: (options.timeout || DEFAULT_TIMEOUT) }, audio);

	return audio;
};