    var db = require("./connection");
    var subscribe = function() {
        this.subscribe = function(conn) {
            return db.query("INSERT INTO \"users_events\"(\"user\",\"event\") " +
                "VALUES(" + conn.user + "," + conn.event + ");");
        };
        this.unsubscribe = function(conn) {
            return db.query("DELETE FROM \"users_events\" WHERE (\"user\" = " + conn.user +
                ") AND (\"event\" = " + conn.event + ");");
        }
    };
    module.exports = subscribe;

