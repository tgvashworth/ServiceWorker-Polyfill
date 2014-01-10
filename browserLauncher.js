var path = require('path');
var fs = require('fs');
var spawn = require('child_process').spawn;
var Promise = require('rsvp').Promise;
var readline = require('readline');

var chromiumPaths = [
    // Mac Canary
    path.join('/Applications', 'Google Chrome Canary.app', 'Contents', 'MacOS', 'Google Chrome Canary')
];

function ask(question, opts) {
    return new Promise(function(resolve, reject) {
        opts = opts || {};

        var rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        rl.question(question + ' ', function(answer) {
            rl.close();

            if (opts.process) {
                answer = opts.process(answer);
            }
            if (opts.validate && !opts.validate(answer)) {
                console.error(opts.errorMsg || "Invalid answer, try again");
                return ask(question, opts);
            }
            resolve(answer);
        });
    });
}

module.exports = function browserLauncher(chromiumPath, proxyPort) {
    return Promise.resolve()
        .then(function() {
            if (chromiumPath) {
                return chromiumPath;
            }

            for (var i = 0; i < chromiumPaths.length; i++) {
                if (fs.existsSync(chromiumPaths[i])) {
                    return chromiumPaths[i];
                }
            }

            return ask("Enter path to Chrome:", {
                validate: function(chromiumPath) {
                    return fs.existsSync(chromiumPath);
                },
                errorMsg: "Cannot find Chromium"
            });
        })
        .then(function(chromiumPath) {
            var process = spawn(chromiumPath, [
                "--proxy-server=http=localhost:" + Number(proxyPort),
                "--load-extension=" + path.join(__dirname, "extension")
            ]);

            return new Promise(function(resolve, reject) {
                process.on('error', function(err) {
                    if (err.code == "ENOENT") {
                        reject(Error("No browser at " + chromiumPath));
                    } else {
                        reject(err);
                    }
                });

                process.on('exit', function(code) {
                    if (code) {
                        reject(Error("Cannot start \""+ chromiumPath +"\", ensure it isn't already running, and try again."));
                    }
                });

                setTimeout(function() {
                    resolve(process);
                }, 3000); // assuming everything's ok after a second. Yeah, I know.
            });
        });
};
