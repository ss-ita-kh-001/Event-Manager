var chat = {
    init: function init(app) {
        var WebSocketServer = new require('ws');
        var webSocketServer = new WebSocketServer.Server({
            port: 8080
        });


        // connected users
        var clients = {};

        // all messages
        var history = [];

        webSocketServer.on('connection', function(socket) {

            var id = Math.random();
            clients[id] = socket;

            console.log('a user connected ' + id);

            socket.on('message', function(obj) {
                // var msg = JSON.parse(obj);
                for (var key in clients) {
                    clients[key].send(obj);
                    console.log(obj);
                }
            });

            socket.on('close', function() {
                console.log('user disconnected ' + id);
                delete clients[id];
            });
        });

    }
};

module.exports = chat;
