var db = require("./connection");
var chat = function() {
    this.getHistory = function() {
        return db.query("SELECT \"full_name\",\"user\",\"date\",\"text\"  FROM \"chat\" INNER JOIN \"users\" ON \"chat\".\"user\" = \"users\".\"id\" ;");
    };
    this.addMessage = function(user) {
        // console.log(user);
        return db.query("INSERT INTO \"chat\"(\"user\",\"date\", \"text\") " + "VALUES(\'" + user.decodedId + "\', \'" + user.date + "\', \'" + user.text + "\');");
    };
    this.getMessage = function (user) {
        return db.query("SELECT * FROM \"chat\" INNER JOIN \"users\" ON \"chat\".\"user\" = \"users\".\"id\" ;");
    }
    this.getLastId = function() {
        return db.query("SELECT \"id\" FROM \"chat\" ORDER BY \"id\" DESC LIMIT 1;");
    };

}

module.exports = chat;
