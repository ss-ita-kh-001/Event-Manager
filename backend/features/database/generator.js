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
    this.events = function(amount) {
        for (var i = 0; i < amount; i++) {
            var data = {};
            data.isGame = Math.random() < 0.5 ? false : true;
            data.report = null;
            data.date = Math.floor((Math.random() * (2018 - 2014) + 2014)) + "-" + Math.floor((Math.random() * (12 - 1) + 1)) + "-" + Math.floor((Math.random() * (28 - 1) + 1));
            data.title = randomString(20);
            data.desc = randomString(200);
            data.place = "kharkiv";
            db.query("INSERT INTO \"events\"(${this~}) VALUES(${isGame}, ${report}, ${date}, ${title}, ${desc}, ${place});", data).then(function() {}).catch(function(error) {
                console.log(error);
            });
        }
    };
    this.users = function(amount) {
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
                console.log(error);
            });
        }
    };
    this.subscribe = function(amount) {
        db.query("SELECT $2~.$1~ AS $5~, $3~.$1~ AS $6~ FROM $2~, $3~ ORDER BY random() LIMIT $4", ["id", "users", "events", amount, "user", "event"]).then(function(data) {
            for (var i = 0; i < data.length; i++) {
                db.query("INSERT INTO \"users_events\"(${this~}) VALUES(${user},${event});", data[i]).then(function() {}).catch(function(error) {
                    console.log(error);
                });
            }
        });
    };
    this.games = function(amount) {
        db.query("SELECT $4~.$1~ AS $2~, $5~.$1~ AS $3~ FROM $6~ INNER JOIN $4~ ON $6~.$2~ = $4~.$1~ INNER JOIN $5~ ON $6~.$3~ = $5~.$1~ WHERE $5~.$7~ = $8 ORDER BY random() LIMIT $9;", ["id",
            "user",
            "event",
            "users",
            "events",
            "users_events",
            "isGame",
            true,
            amount
        ]).then(function(data) {
            for (var i = 0; i < data.length; i++) {
                db.query("INSERT INTO \"game_result\"(${this~}) VALUES(${user}, ${event}, ${wins}, ${loses}, ${draws})", Object.assign(data[i], {
                    wins: Math.floor(Math.random() * 20),
                    loses: Math.floor(Math.random() * 20),
                    draws: Math.floor(Math.random() * 20)
                }));
            }
        }).catch(function(error) {
            console.log(error);
        });
    };
    this.chat = function() {
        db.query("SELECT $1 AS $3 FROM $2;", ["id", "users", "user"]).then(function(data) {
            for (var i = 0; i < data.length; i++) {
              db.query("INSERT INTO \"chat\"(${this~}) VALUES(${user}, ${date}, ${text}))", Object.assign(data[i], {
                date: Math.floor((Math.random() * (2018 - 2014) + 2014)) + "-" + Math.floor((Math.random() * (12 - 1) + 1)) + "-" + Math.floor((Math.random() * (28 - 1) + 1)),
                text: randomString(50)
              }));
            }
        });
    };
};
module.exports = generator;
