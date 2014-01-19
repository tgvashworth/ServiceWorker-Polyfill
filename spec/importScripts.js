var XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
var URL = require('dom-urls');

module.exports = function () {

	var disabled = false;
	var importer = function importer(workerUrl) {

		if (disabled) {
			throw new Error('You cannot call importScripts outside of initial setup.');
		}

		var urls = [].slice.call(arguments).filter(function (arg) {
			return (typeof arg === 'string');
		});

		// Sync get each URL and return as one string to be eval'd.
		// These requests are done in series. TODO: Possibly solve?
		return urls.map(function(url) {
			var absoluteUrl = new URL(url, workerUrl);
			var xhr = new XMLHttpRequest();
			xhr.open('GET', absoluteUrl, false);
			xhr.send(null);
			xhr.status = parseInt(xhr.status, 10);
			if (xhr.status === 200) {
				return xhr.responseText;
			} else {
				console.log('Status:', xhr.status);
				console.log('URL:', absoluteUrl.toString());
				throw new Error('Network error while calling importScripts()');
			}
		});
	}

	importer.disable = function() {
		disabled = true;
	};

	return importer;
};