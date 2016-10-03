var express = require('express');
    app = express(),
    path = require('path'),
    bodyParser = require('body-parser'),
    router =  require('./router');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(express.static(__dirname + '/../frontend'));
app.listen(process.env.PORT || 5000, function(req, res) {
    console.log('Example app listening on port 5000!');
});

router.init(app);
