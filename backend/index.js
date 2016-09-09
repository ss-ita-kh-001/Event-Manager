// var express = require('express');
// var app = express();
// var path = require('path');
//
// app.use(express.static(__dirname + '/../frontend'));
//
// app.listen(process.env.PORT || 5000, function(req, res) {
//     console.log('Example app listening on port 5000!');
// });
// app.get('*', function(req, res) {
//     res.sendFile(path.resolve('frontend/index.html'));
// });




var express = require('express');
var app = express();


// static - all our js, css, images, etc go into the assets path
app.use(express.static(__dirname + '/../frontend'));
//If we get here then the request for a static file is invalid so we may as well stop here
app.use('/assets', function(req, res, next) {
    res.send(404);
});

app.get('/customers/:id', function(req, res) {
    // return data for customer....
});

// This route deals enables HTML5Mode by forwarding missing files to the index.html
app.all('/*', function(req, res) {
    res.sendfile('/../frontend/index.html');
});

app.listen(5000);
