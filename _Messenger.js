module.exports = _Messenger;

function _Messenger() {
    this.sockets = [];
}

_Messenger.prototype.add = function (socket) {
    this.sockets.push(socket);
    return socket;
};

_Messenger.prototype.remove = function (socket) {
    var index;
    var count = 0;
    while((index = this.sockets.indexOf(socket)) > -1) {
        this.sockets.splice(index, 1);
        count++;
    }
    return count;
};

// TODO should this send to *all* sockets.
// TODO what's the origin for these postMessages?
_Messenger.prototype.postMessage = function (data) {
    console.log('postMessage out:', data);
    var dataStr = JSON.stringify({
        type: 'postMessage',
        data: data
    });
    this.sockets.forEach(function (socket) {
        socket.send(dataStr);
    });
};