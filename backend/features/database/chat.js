var db = require("./connection");
var chat = function() {
    this.getHistory = function(index) {
        console.log('SELECT chat WHERE id <= ', index);
        return db.query("SELECT \"full_name\",\"user\",\"date\",\"text\"  FROM \"chat\" INNER JOIN \"users\" ON \"chat\".\"user\" = \"users\".\"id\" WHERE \"chat\".\"id\"<=" + index + " ORDER BY \"chat\".\"id\" DESC  LIMIT 10 ;");
    };
    this.addMessage = function(user) {
        // console.log('addMessage',user);
        return db.query("INSERT INTO \"chat\"(\"user\",\"date\", \"text\") " + "VALUES(\'" + user.userID + "\', \'" + user.date + "\', \'" + user.text + "\');");
    };
    this.getMessage = function() {
        return db.query("SELECT \"full_name\",\"user\",\"date\",\"text\" FROM \"chat\" INNER JOIN \"users\" ON \"chat\".\"user\" = \"users\".\"id\" ORDER BY \"chat\".\"id\" DESC LIMIT 1;");
    }
    this.getLastId = function() {
        return db.query("SELECT \"id\" FROM \"chat\" ORDER BY \"id\" DESC LIMIT 1;");
    };

}

module.exports = chat;
