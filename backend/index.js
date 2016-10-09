var express = require('express');
var app = express();
var path = require('path');
var bodyParser = require('body-parser');
var router =  require('./router');
var chat = require("./features/chat.js");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(express.static(__dirname + '/../frontend'));

app.listen(process.env.PORT || 5000, function(req, res) {
    console.log('Example app listening on port 5000!');
});

app.get('*', function(req, res) {
    res.sendFile(path.resolve('frontend/app/index.html'));
});

router.init(app);
chat.init(app);
