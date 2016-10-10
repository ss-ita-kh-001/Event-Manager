var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var router = require('./router');
var chat = require("./features/chat.js");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

// app.use(express.static(__dirname + '/../frontend'));

// app.listen(process.env.PORT || 5000, function(req, res) {
//     console.log('Example app listening on port 5000!');
// });

// connected users
var clients = {};
// all messages
var history = [];

var WebSocketServer = require("ws").Server;
var http = require("http");
var port = process.env.PORT || 5000;

app.use(express.static(__dirname + "/../frontend"));

var server = http.createServer(app);
server.listen(port);

console.log("http server listening on %d", port);

var webSocketServer = new WebSocketServer({ server: server });
console.log("websocket server created");

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

router.init(app);
// chat.init(app);
