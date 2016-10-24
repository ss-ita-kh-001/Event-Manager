var db = require("./connection");
var generator = function() {
    var iterator = 0;

    function randomString(length) {
        var random = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (var i = 0; i < length; i++) {
            random += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return random;
    }
    this.events = function(amount, res) {
        for (var i = 0; i < amount; i++) {
            var data = {};
            data.isGame = Math.random() < 0.5 ? false : true;
            data.report = null;
            data.date = Math.floor((Math.random() * (2018 - 2014) + 2014)) + "-" + Math.floor((Math.random() * (12 - 1) + 1)) + "-" + Math.floor((Math.random() * (28 - 1) + 1));
            data.title = randomString(20);
            data.desc = randomString(200);
            data.place = "kharkiv";
            db.query("INSERT INTO \"events\"(${this~}) VALUES(${isGame}, ${report}, ${date}, ${title}, ${desc}, ${place});", data).then(function() {}).catch(function(error) {
                res.status(500).send(error);
            });
        }
    };
};
module.exports = generator;
