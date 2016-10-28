var jwt = require('jwt-simple');
var moment = require('moment');
var config = require("./database/config");
var auth = new(require("./database/auth"));
var chatDb = new(require("./database/chat"));
var escape = new(require("./escape"));

var chat = {
    init: function init(server) {
        var WebSocketServer = require("ws").Server;
        var webSocketServer = new WebSocketServer({
            server: server
        });

        // connected users
        var clients = {};

        var response = {
            data: '',
            error: false,
            errorMessage: ''
        };

        webSocketServer.on('connection', function(socket) {
            var id = Math.random();
            clients[id] = socket;
            // console.log('connected', id);
            // console.log(socket);
            // var requestObj = isAuth(obj);

            chatDb.getHistory().then(function(data, res) {
                response.data = data;
                clients[id].send(JSON.stringify(response));
            }).catch(function(error) {
                response.error = true;
                response.errorMessage = error;
            });

            socket.on('message', function(obj) {
                // if token can be decoded and isn't expired
                var requestObj = isAuth(obj);

                if (!requestObj.error) {
                    chatDb.addMessage(requestObj.data).then(function() {
                        for (var key in clients) {
                            clients[key].send(JSON.stringify(requestObj));
                            // console.log('sent to', id);
                        }
                    }).catch(function(error) {
                        console.log(error);
                        requestObj.error = true;
                        requestObj.errorMessage = error;
                        clients[id].send(JSON.stringify(requestObj));
                    });

                } else {
                    requestObj.error = true;
                    requestObj.errorMessage = 'Incorrect token. Try to login again';
                    clients[id].send(JSON.stringify(requestObj));
                }

            });

            socket.on('close', function() {
                // console.log('disconnected', id);
                delete clients[id];
            });
        });
    }
};

function isAuth(req) {
    var data = JSON.parse(req);
    var payload = null;
    var obj = {
        data: data,
        error: false,
        errorMessage: ''
    }
    obj.data.text = escape.makeTrusted(data.text);
    var token = data.token;
    try {
        payload = jwt.decode(token, config.TOKEN_SECRET);
    } catch (err) {
        obj.errorMessage = err.message;
        obj.error = true;
        return obj;
    }
    if (payload.exp <= moment().unix()) {
        obj.errorMessage = 'Token has expired';
        obj.error = true;
        return obj;
    }
    obj.data.decodedId = payload.sub;
    return obj;
}

module.exports = chat;
