var db = require("./connection");
var events = function() {
    this.getEvents = function(index) {
        console.log('SELECT events WHERE id >= ', index);
        return db.query("SELECT * FROM \"events\" WHERE \"id\" >= " + Number(index) + "ORDER BY \"id\" LIMIT 10;");
    };
    this.getByEvent = function(id) {
        return db.query("SELECT * FROM \"events\" WHERE \"id\" = " + id + ";");
    };
    this.getEventByUser = function(id) {
        console.log('getEventByUser', id);
        return db.query("SELECT * FROM \"users_events\" INNER JOIN \"events\" ON \"users_events\".\"event\" = \"events\".\"id\" WHERE \"users_events\".\"user\" = " + id + ";");
    };
    this.getUsersByEvent = function(id) {
        return db.query("SELECT * FROM \"users_events\" INNER JOIN \"users\" ON \"users_events\".\"user\" = \"users\".\"id\" WHERE \"users_events\".\"event\" = " + id + ";");
    };
    this.updateEvent = function(event) {
        console.log(event.avatar)
        return db.query("UPDATE \"events\" SET \"title\" = \'" + event.title +
            "\', \"desc\" = \'" + event.desc + "\', \"date\" = \'" + event.date +
            "\', \"place\" = \'" + event.place + "\', \"isGame\" = " + event.isGame + ", avatar = '" + event.avatar + "' WHERE \"id\"  = " + event.id + ";");
    };
    this.addEvent = function(data) {
        return db.query("INSERT INTO \"events\"(\"avatar\", \"isGame\", \"report\", \"date\",  \"desc\", \"title\", \"place\") " +
            "VALUES(${avatar}, ${isGame}, ${report}, ${date},  ${desc}, ${title}, ${place});", data);
    };
    this.deleteEventById = function(id) {
        console.log('deleteEventById events WHERE id = ', id);
        return db.query("DELETE FROM \"events\"  WHERE \"id\"  = " + id + ";");
    };
    this.getLastId = function() {
        return db.query("SELECT \"id\" FROM \"events\" ORDER BY \"id\" DESC LIMIT 1;");
    };
    this.getLatest = function() {
        var today = new Date();
        var todayString = today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate() +
            " " + today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
        return db.query("SELECT * FROM \"events\" WHERE \"date\" < \'" + todayString + "\' ORDER BY \"date\" DESC LIMIT 3;");
    };
    this.getNext = function() {
        var today = new Date();
        var todayString = today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate() +
            " " + today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
        return db.query("SELECT * FROM \"events\" WHERE \"date\" > \'" + todayString + "\' ORDER BY \"date\" LIMIT 3;");
    };
    this.makeReport = function(data) {
        return db.query("UPDATE \"events\" SET \"report\" = ${report} WHERE \"id\" = ${id}", data);
    };
};
module.exports = events;
