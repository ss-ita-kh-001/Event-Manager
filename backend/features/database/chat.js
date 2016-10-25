var db = require("./connection");
var chat = function() {
    this.getHistory = function() {
        return db.query("SELECT * FROM \"chat\" LIMIT 20;");
    };
    this.addMessage = function(user) {
        return db.query("INSERT INTO \"chat\"(\"id\",\"user\",\"date\", \"text\") " +
            "VALUES(\'" + user.id + "\', \'" + user.username + "\', \'" + user.date +
            "\', \'" + user.text + "\');");
    };

}

module.exports = chat;
