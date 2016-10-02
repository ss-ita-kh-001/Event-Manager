var express = require('express');
var app = express();
var path = require('path');


var http = require('http').Server(app);
var io = require('socket.io')(http);


app.use(express.static(__dirname + '/../frontend'));

app.listen(process.env.PORT || 5000, function(req, res) {
    console.log('Example app listening on port 5000!');
});

app.get('*', function(req, res) {
    res.sendFile(path.resolve('frontend/app/index.html'));
});

// connected users
var clients = {};

// all messages
var history = [];

io.on('connection', function(socket) {

    var id = Math.random();
    clients[id] = socket;
    clients[id].emit('start', history);

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
//
