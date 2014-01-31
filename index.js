#!/usr/bin/env node

var Promise = require('rsvp').Promise;
var browserLauncher = require('./browserLauncher');
var startServer = require('./server').startServer;
var chalk = require('chalk');

var issueLink = chalk.blue('https://github.com/phuu/serviceworker-polyfill/issues/new');

var argvConfig = require('optimist')
    .usage('ServiceWorker polyfill.\nPlease submit issues at ' + issueLink)
    .describe('no-browser', 'Do not launch Chrome Canary.')
    .describe('only-browser', 'Only launch Chrome Canary.')
    .describe('debug', 'Debug with node-inspector.')
    .describe('help', 'Show this help message.')
    .alias('h', 'help');

var argv = argvConfig.argv;

if (argv.h) {
    return argvConfig.showHelp();
}

if (argv.debug && process._debugProcess) {
    process._debugProcess(process.pid);
}

var proxyPort = argv.port || 5678;
var browser = argv.browser;
var browserOnly = argv['browser-only'];

/**
 * Gracefully-ish handle errors
 */
var proc = {};
process.on('uncaughtException', function (why) {
    if (proc.browserProcess) {
        proc.browserProcess.kill();
    }
    if (proc.server) {
        try {
            proc.server.close();
        } catch (e) {}
    }
    logError(why);
});

Promise.resolve()
    .then(function() {
        if (browser === false) { // as in --no-browser
            return;
        }

        return browserLauncher(browser, proxyPort)
            .then(function(browserProcess) {
                proc.browserProcess = browserProcess;
                console.log(chalk.green('Browser running.'));
                browserProcess.on('exit', function(code) {
                    if (code) {
                        throw Error('Browser unexpectedly exited.');
                        process.exit(1);
                    } else {
                        process.exit(0);
                    }
                });
            });
    })
    .then(function() {
        if (browserOnly) { // as in --browser-only
            return;
        }
        return startServer(proxyPort).then(function (server) {
            proc.server = server;
            console.log(chalk.green('Server running.'));
        });
    })
    .then(function () {
        console.log();
        console.log('If you spot any issues, please add them at', issueLink);
        console.log();
    })
    .catch(logError);

function logError(why) {
    console.log();
    console.error(chalk.red('Sorry, there was an error.'), 'Please submit an issue with this information:');
    console.error(why.stack);
    process.exit(1);
}
