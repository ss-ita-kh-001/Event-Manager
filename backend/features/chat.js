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
            
            if (history.length !== 0) {
                clients[id].send(JSON.stringify(history));
            }


            socket.on('message', function(obj) {
                if (history.length > 20) {
                    history.shift();
                }
                history.push(JSON.parse(obj));
                for (var key in clients) {
                    clients[key].send(obj);
                    console.log('sent' + key);
                }
            });

            socket.on('close', function() {
                delete clients[id];
            });
        });
    }
};

module.exports = chat;
