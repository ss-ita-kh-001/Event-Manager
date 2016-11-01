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

        var response = {
            data: '',
            error: false,
            errorMessage: ''
        };

        webSocketServer.on('connection', function(socket) {
            var id = Math.random();
            clients[id] = socket;

            var currentIndex;

            socket.on('message', function(obj) {
                console.log('-----------------------------------------------------');
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
                                sendError(clients, id, requestExt, error);
                            });

                        }).catch(function(error) {
                            console.log(error);
                            sendError(clients, id, requestExt, error);
                        });
                    } else {
                        // if index is defined on client
                        requestExt.data.getHistory = false;
                        chatDb.getLastId().then(function(data, res) {
                            currentIndex = data[0].id;
                            console.log('get Last id', currentIndex);
                            if (requestExt.data.index) {
                                console.log('requestExt.data.index true', requestExt.data.index);
                                currentIndex = requestExt.data.index;
                            }
                            console.log('index from client', requestExt.data.index);
                            chatDb.getHistory(currentIndex).then(function(data, res) {
                                // console.log('getHistory with currentIndex', currentIndex);
                                response.data = data;
                                response.index = (currentIndex - 10);
                                clients[id].send(JSON.stringify(response));
                            }).catch(function(error) {
                                sendError(clients, id, requestExt, error);
                            });
                        }).catch(function(error) {
                            sendError(clients, id, requestExt, error);
                        });
                    }
                } else {
                    sendError(clients, id, requestExt, 'Incorrect token. Try to login again');
                }
            });

            socket.on('close', function() {
                console.log('disconnected', id);
                delete clients[id];
            });


        });

    }
};

function sendError(clients, id, response, status) {
    response.error = true;
    response.errorMessage = status;
    clients[id].send(JSON.stringify(response));
}

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
