var browserLauncher = require('./browserLauncher');
var startServer = require('./server').startServer;
var argv = require('optimist').argv;

browserLauncher(argv['browser-path']).then(function(browserProcess) {
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
    startServer(argv.port || 5678, argv.worker || "worker.js");
});