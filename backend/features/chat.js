var chat = {
    init: function init(app) {
        var http = require('http').Server(app);
        var io = require('socket.io')(http);

        // connected users
        var clients = {};

        // all messages
        var history = [];

        io.on('connection', function(socket) {

            var id = Math.random();
            clients[id] = socket;
            socket.on('get history', function() {
                clients[id].emit('post history', history);
            });

            console.log('a user connected ' + id);

            socket.on('message', function(msg) {
                history.push(msg);
                io.emit('message', msg);
            });

            socket.on('disconnect', function() {
                console.log('user disconnected ' + id);
                delete clients[id];
            });
        });

        http.listen(8080, function() {
            console.log('listening on *:8080');
        });
    }
};

module.exports = chat;
