var express = require('express');
var app = express();
var path = require('path');
var bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static(__dirname + '/../frontend'));
app.listen(process.env.PORT || 5000, function(req, res) {
    console.log('Example app listening on port 5000!');
});

var apiPreff = "/api";

var users = new(require("./features/database/users"));
app.get(apiPreff + "/users", function(req, res) {
    users.getAll().then(function(data) {
        res.send(data);
    });
});

var games = new(require("./features/database/games"));
app.get(apiPreff + "/games/user/:user", function(req, res) {
    games.getByUser(req.params.user).then(function(data) {
        res.send(data);
    });
});
app.get(apiPreff + "/games/event/:event", function(req, res) {
    games.getByEvent(req.params.event).then(function(data) {
        res.send(data);
    });
});
app.post(apiPreff + "/games/event/:event", function(req, res) {
    games.addGame(Object.assign({}, req.body, req.params));
    res.end();
});
app.post(apiPreff + "/games/user/:user", function(req, res) {
    games.addGame(Object.assign({}, req.body, req.params));
    res.end();
});
app.post(apiPreff + "/games/:user/:event", function(req, res) {
    games.addGame(Object.assign({}, req.body, req.params));
    res.end();
});
app.put(apiPreff + "/games/:id", function(req, res) {
    games.updateGame(Object.assign({}, req.params, req.body));
    res.end();
});
app.delete(apiPreff + "/games/:id", function(req, res) {
    games.deleteById(req.params.id);
    res.end();
});
app.delete(apiPreff + "/games/user/:user", function(req, res) {
    games.deleteByUser(req.params.user);
    res.end();
});
app.delete(apiPreff + "/games/event/:event", function(req, res) {
    games.deleteByEvent(req.params.event);
    res.end();
});

var subscribe = new(require("./features/database/subscribe"));
app.post(apiPreff + "/subscribe/:user/:event", function(req, res) {
    subscribe.subscribe(req.params);
    res.end();
});
app.delete(apiPreff + "/unsubscribe/:user/:event", function(req, res) {
    subscribe.unsubscribe(req.params);
    res.end();
});
app.get('*', function(req, res) {
    res.sendFile(path.resolve('frontend/app/index.html'));
});
