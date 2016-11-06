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
            console.log('connected', id);
            var currentIndex;

            socket.on('message', function(obj) {
                console.log('-----------------------------------------------------');
                // if token can be decoded and isn't expired
                var requestExt = isAuth(obj);
                if (!requestExt.error) {
                    requestExt.singleMessage = true;
                    console.log('single message');
                    requestExt.data.text = validate.makeTrusted(requestExt.data.text);
                    // console.log('addMessage',requestExt.data);
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

function isAuth(req) {
    var data = JSON.parse(req);
    var payload = null;
    var requestExt = {
        data: data,
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
    // console.log(payload.id);
    return requestExt;
}
function sendError(clients, id, response, status) {
    response.error = true;
    response.errorMessage = status;
    console.log('sendError', response);
    clients[id].send(JSON.stringify(response));
}

module.exports = chat;
