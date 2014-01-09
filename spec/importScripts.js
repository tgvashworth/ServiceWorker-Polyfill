var XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;

module.exports = function () {

	var disabled = false;
	var importer = function importer() {

		if (disabled) {
			throw new Error('You cannot call importScripts outside of initial setup.');
		}

		var urls = [].slice.call(arguments).filter(function (arg) {
			return (typeof arg === 'string');
		});

		// Sync get each URL and return as one string to be eval'd.
		// These requests are done in series. TODO: Possibly solve?
		return urls.map(function(url) {
			var xhr = new XMLHttpRequest();
			xhr.open('GET', url, false);
			xhr.send(null);
			xhr.status = parseInt(xhr.status, 10);
			if (xhr.status === 200) {
				return xhr.responseText;
			} else {
				console.log('importScripts error. Status', xhr.status);
				return ''; // Return nothing if error.
			}
		}).join('\n;\n');
	}

	importer.disable = function() {
		disabled = true;
	};

	return importer;
};