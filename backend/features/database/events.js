var db = require("./connection");
var events = function() {
    this.getAll = function() {
        return db.query("SELECT * FROM \"events\";");
    };
    this.getByEvent = function(id) {
        return db.query("SELECT * FROM \"events\" WHERE \"id\" = " + id + ";");
    };
    this.getEventByUser = function(id) {
        return db.query("SELECT \"event\" FROM \"users_events\" WHERE \"user\" = " + id + ";");
    };
    this.updateEvent = function(event) {
        return db.query("UPDATE \"events\" SET \"title\" = \'" + event.title +
            "\', \"desc\" = \'" + event.desc + "\', \"date\" = \'" + event.date +
            "\', \"place\" = \'" + event.place + "\', \"isGame\" = " + (event.type === "game"? true: false) + " WHERE \"id\" = " + event.id + ";");
    };
    this.addEvent = function(event) {
        return db.query("INSERT INTO \"events\"(\"title\", \"desc\", \"date\", \"place\", \"isGame\") " +
            "VALUES(\'" + event.title + "\', \'" + event.desc + "\', \'" + event.date +
            "\', \'" + event.place + "\', " +  (event.type === "game"? true: false) + ");");
    };
    this.deleteEventById = function(id) {
        return db.query("DELETE FROM \"events\"  WHERE \"id\"  = " + id + ";");
    };
    this.getLastId = function() {
        return db.query("SELECT \"id\" FROM \"events\" ORDER BY \"id\" DESC LIMIT 1;");
    };
    this.getLatest = function () {
      var today = new Date();
      var todayString = today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate() +
      " " + today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
      return db.query("SELECT * FROM \"events\" WHERE \"date\" < \'" + todayString + "\' ORDER BY \"date\" DESC LIMIT 3;");
    };
    this.getNext = function () {
      var today = new Date();
      var todayString = today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate() +
      " " + today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
      return db.query("SELECT * FROM \"events\" WHERE \"date\" > \'" + todayString + "\' ORDER BY \"date\" LIMIT 3;");
    };
};
module.exports = events;
