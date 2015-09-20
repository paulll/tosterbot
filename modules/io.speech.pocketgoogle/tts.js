var spawn = require('child_process').spawn,
	mpg123 = spawn('mpg123', ['-']),
	http = require('http');

module.exports = function (string, lang) {
	http.request(`http://api.voicerss.org/?hl=${lang||'ru-ru'}&f=44khz_16bit_stereo&src=${encodeURIComponent(string)}&key=2d7363119e214921a4a1cae3e7eb0f8d`, function (response) {
		if (response.statusCode != 200) {
			return console.log('[FAIL] TTS api should response 200 HTTP status code.');
		}
		response.pipe(mpg123.stdin);
		response.on('end', function () {
			mpg123 = spawn('mpg123', ['-']);
		});
	}).end();
};