var browserLauncher = require('./browserLauncher');
var startServer = require('./server').startServer;
var argv = require('optimist').argv;

var proxyPort = argv.port || 5678;
var workerPath = argv.worker || "worker.js";

browserLauncher(argv['browser-path'], proxyPort).then(function(browserProcess) {
  browserProcess.on('exit', function(code) {
    if (code) {
      console.error("Browser unexpectedly exited");
      process.exit(1);
    }
    else {
      process.exit(0);
    }
  });
}).catch(function(err) {
    console.error(err.message);
    process.exit(1);
}).then(function() {
    startServer(proxyPort, workerPath);
});