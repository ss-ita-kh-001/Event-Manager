var express = require('express');
var app = express();
var path = require('path');

// socket.io example
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static(__dirname + '/../frontend'));

app.listen(process.env.PORT || 5000, function(req, res) {
    console.log('Example app listening on port 5000!');
});

app.get('*', function(req, res) {
    res.sendFile(path.resolve('frontend/app/index.html'));
});



io.on('connection', function(socket) {
    console.log('a user connected');

    socket.on('message', function(msg) {
        console.log(msg);
        // collection.push(msg);
        io.emit('message', msg);
    });


    socket.on('disconnect', function() {
        console.log('user disconnected');
    });
});

http.listen(8080, function() {
    console.log('listening on *:8080');
});




//
