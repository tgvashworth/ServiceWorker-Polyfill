var XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;

module.exports = function () {

	var disabled = false;

	var importer = function () {

		importer.disable = function() {
			disabled = true;
		}

		if (disabled === true) {
			console.log('You cannot call importScripts outside of initial setup.');
			throw 'You cannot call importScripts outside of initial setup.';
		}

		var urls = Array.prototype.slice.call(arguments, 0).filter(function(arg) {
			return typeof arg === 'string';
		});

		// Sync get each URL and return as one string to be eval'd.
		// This requests are done in series. TODO: Possibly solve?
		return urls.map(function(url) {
			var xhr = new XMLHttpRequest();
			xhr.open('GET', url, false);
			xhr.send(null);
			if(xhr.status === '200') {
				return xhr.responseText;
			} else {
				console.log('importScripts error. Status', xhr.status);
				return ''; // Return nothing if error.
			}
		}).join(';');
	}

	return importer;
};