var jwt = require('jwt-simple');
var moment = require('moment');
var config = require("./database/config");
var auth = new(require("./database/auth"));
var chatDb = new(require("./database/chat"));
var validate = new(require("./validate"));

var chat = {
    init: function init(server) {
        var WebSocketServer = require("ws").Server;
        var webSocketServer = new WebSocketServer({
            server: server
        });

        // connected users
        var clients = {};
        // last index, equal to the last id by default
        var lastIndex;

        var response = {
            data: '',
            error: false,
            errorMessage: ''
        };

        webSocketServer.on('connection', function(socket) {
            var id = Math.random();
            clients[id] = socket;

            chatDb.getLastId().then(function(data, res) {
                lastIndex = data[0].id;
                console.log('get Last id', lastIndex);
            }).catch(function(error) {
                response.error = true;
                response.errorMessage = error;
            });

            socket.on('message', function(obj) {
                var index = lastIndex;

                // if token can be decoded and isn't expired
                var requestExt = isAuth(obj);
                // console.log(requestExt);

                if (!requestExt.error) {
                    // console.log(requestExt);
                    if (!requestExt.data.getHistory) {
                        console.log('single message');
                        requestExt.data.text = validate.makeTrusted(requestExt.data.text);
                        chatDb.addMessage(requestExt.data).then(function(res) {
                            chatDb.getMessage().then(function(data, res) {
                                response.data = data;
                                for (var key in clients) {
                                    clients[key].send(JSON.stringify(response));
                                }
                            }).catch(function(error) {
                                console.log(error);
                                requestExt.error = true;
                                requestExt.errorMessage = error;
                                clients[id].send(JSON.stringify(requestExt));
                            });

                        }).catch(function(error) {
                            console.log(error);
                            requestExt.error = true;
                            requestExt.errorMessage = error;
                            clients[id].send(JSON.stringify(requestExt));
                        });
                    } else {
                        console.log('index from client', requestExt.data.index);

                        // if get index from client
                        if (requestExt.data.index) {
                            index = requestExt.data.index;
                        } else {

                        }

                        requestExt.data.getHistory = false;
                        chatDb.getHistory(index).then(function(data, res) {

                            response.data = data;
                            response.index = lastIndex;
                            clients[id].send(JSON.stringify(response));
                            console.log('sent history', response);
                        }).catch(function(error) {
                            response.error = true;
                            response.errorMessage = error;
                        });
                    }

                } else {
                    requestExt.error = true;
                    requestExt.errorMessage = 'Incorrect token. Try to login again';
                    clients[id].send(JSON.stringify(requestExt));
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
