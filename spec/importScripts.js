var XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;

module.exports = function () {

	var disabled = false;

	var importer = function (url) {

		importer.disable = function() {
			disabled = true;
		}

		if (disabled === true) {
			console.log('You cannot call importScripts outside of initial setup.');
			throw 'You cannot call importScripts outside of initial setup.';
		}

		console.log('called importScripts with url:', url);
		// Sync get URL and execute in the worker context.
		var xhr = new XMLHttpRequest();
		xhr.open('GET', url, false);
		var r = xhr.send(null);
		return xhr.responseText;
	}

	return importer;
};