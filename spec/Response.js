module.exports = Response;

function Response(params) {
    if (params) {
        if (typeof params.statusCode != "undefined") {
            this.statusCode = params.statusCode;
        }
        if (typeof params.statusText != "undefined") {
            this.statusText = params.statusText;
        }
        if (typeof params.encoding != "undefined") {
            this.encoding = params.encoding;
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
