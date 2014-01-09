#!/usr/bin/env node

var Promise = require('rsvp').Promise;
var browserLauncher = require('./browserLauncher');
var startServer = require('./server').startServer;
var argv = require('optimist').argv;


var proxyPort = argv.port || 5678;
var workerPath = argv.worker || "worker.js";
var browser = argv.browser;
var browserOnly = argv['browser-only'];

Promise.resolve().then(function() {
    if (browser === false) { // as in --no-browser
        return;
    }

    return browserLauncher(browser, proxyPort).then(function(browserProcess) {
        browserProcess.on('exit', function(code) {
            if (code) {
                console.error("Browser unexpectedly exited");
                process.exit(1);
            }
            else {
                process.exit(0);
            }
        });
    });
}).catch(function(err) {
    console.error(err.message);
    process.exit(1);
}).then(function() {
    if (browserOnly) { // as in --browser-only
        return;
    }
    startServer(proxyPort, workerPath);
});
