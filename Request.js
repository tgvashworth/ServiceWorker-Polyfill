module.exports = Request;

function Request(params) {
    this.timeout = 0;
    this.method = "GET";
    if (params) {
        if (typeof params.timeout != "undefined") {
            this.timeout = params.timeout;
        }
        if (typeof params.url != "undefined") {
            // should be "new URL(params.url)" but TS won't allow it
            this.url = params.url;
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
