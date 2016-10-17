var express = require('express');
var app = express();
var nodemailer = require('nodemailer');
var async = require("async");
var http = require("http");
var port = process.env.PORT || 5000;

var bodyParser = require('body-parser');
var router = require('./router');
var chat = require("./features/chat.js");

var server = http.createServer(app);



app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));


server.listen(port, function(req, res) {
    console.log('Example app listening on port 5000!');
});

app.use(express.static(__dirname + "/../frontend"));


router.init(app);
chat.init(server);
