var db = require("./connection");
var chat = function() {
    this.getHistory = function() {
        return db.query("SELECT * FROM \"chat\" ;");
    };
    this.addMessage = function(user) {
        // console.log(data);
        return db.query("INSERT INTO \"chat\"(\"user\",\"date\", \"text\") " + "VALUES(\'" + user.decodedId + "\', \'" + user.date + "\', \'" + user.text + "\');");
    };
    this.getLastId = function() {
        return db.query("SELECT \"id\" FROM \"chat\" ORDER BY \"id\" DESC LIMIT 1;");
    };

}

module.exports = chat;
