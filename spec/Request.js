var URL = require('dom-urls');
module.exports = Request;

function Request(params) {
    this.timeout = 0;
    this.method = "GET";
    this.headers = {};
    if (params) {
        if (typeof params.timeout != "undefined") {
            this.timeout = params.timeout;
        }
        if (typeof params.url != "undefined") {
            this.url = new URL(params.url);
        }
        if (typeof params.method != "undefined") {
            this.method = params.method;
        }
        if (typeof params.headers != "undefined") {
            this.headers = params.headers;
        }
        if (typeof params.body != "undefined") {
            this.body = params.body;
        }
    }
}
