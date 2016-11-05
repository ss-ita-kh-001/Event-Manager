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

                        requestExt.singleMessage = true;
                        console.log('single message');

                        requestExt.data.text = validate.makeTrusted(requestExt.data.text);
                        chatDb.addMessage(requestExt.data).then(function(res) {
                            chatDb.getMessage().then(function(data, res) {
                                requestExt.data = data;

                                for (var key in clients) {
                                    clients[key].send(JSON.stringify(requestExt));
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

                        requestExt.getHistory = false;
                        requestExt.singleMessage = false;

                        // index present on client
                        if (requestExt.data.index) {
                            console.log('index from client', requestExt.data.index);
                            currentIndex = requestExt.data.index;
                            chatDb.getHistory(currentIndex).then(function(data, res) {
                                console.log('getHistory with currentIndex', currentIndex);
                                requestExt.data = data;
                                requestExt.index = (currentIndex - data.length);
                                if (data.length < 10) {
                                    requestExt.haveHistory = false;
                                }

                                clients[id].send(JSON.stringify(requestExt));
                            }).catch(function(error) {
                                sendError(clients, id, requestExt, error);
                            });
                        } else {
                            chatDb.getLastId().then(function(data, res) {
                                currentIndex = data[0].id;
                                console.log('get Last id', currentIndex);

                                chatDb.getHistory(currentIndex).then(function(data, res) {
                                    console.log('getHistory with currentIndex', currentIndex);
                                    requestExt.data = data;
                                    requestExt.index = (currentIndex - data.length);
                                    if (data.length < 10) {
                                        requestExt.haveHistory = false;
                                    }
                                    clients[id].send(JSON.stringify(requestExt));
                                }).catch(function(error) {
                                    sendError(clients, id, requestExt, error);
                                });
                            }).catch(function(error) {
                                sendError(clients, id, requestExt, error);
                            });

                        }

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
    var requestExt = {
        data: data,
        singleMessage: true,
        haveHistory: true,
        error: false,
        errorMessage: ''
    }

    var token = data.token;
    try {
        payload = jwt.decode(token, config.TOKEN_SECRET);
    } catch (err) {
        requestExt.errorMessage = err.message;
        requestExt.error = true;
        return requestExt;
    }
    if (payload.exp <= moment().unix()) {
        requestExt.errorMessage = 'Token has expired';
        requestExt.error = true;
        return requestExt;
    }
    requestExt.data.userID = payload.id;
    return requestExt;
}

module.exports = chat;
