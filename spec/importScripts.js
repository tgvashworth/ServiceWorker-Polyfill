var XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;

module.exports = function (url) {
	console.log('called importScripts with url:', url);

	// TODO: Throw if not in initial worker context.

	// Sync get URL and execute in the worker context.
	var xhr = new XMLHttpRequest();
	xhr.open('GET', url, false);
	var r = xhr.send(null);
	return xhr.responseText;
};