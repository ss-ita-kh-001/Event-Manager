var auth = new(require("./auth"));
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
    this.users = function(amount, res) {
        for (var i = 0; i < amount; i++) {
            var data = {};
            data.full_name = randomString(20);
            data.password = auth.hashData(randomString(20));
            data.email = randomString(10) + "@" + randomString(5) + ".com";
            data.role = Math.random() < 0.001 ? "admin" : "user";
            data.reset_password_token = null;
            data.reset_password_expires = null;
            data.activated = Math.random() < 0.5 ? false : true;
            db.query("INSERT INTO \"users\"(${this~}) VALUES(${full_name}, ${password}, ${email}, ${role}, ${reset_password_token}, ${reset_password_expires}, ${activated});", data).then(function() {}).catch(function(error) {
                res.status(500).send(error);
            });
        }
    }
};
module.exports = generator;
