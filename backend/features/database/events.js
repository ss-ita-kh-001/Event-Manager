    var db = require("./connection");
    var events = function() {
        this.getAll = function() {
            return db.query("SELECT * FROM \"events\";");
        };
        this.getByEvent = function(id) {
            return db.query("SELECT * FROM events WHERE id = '" + id + "';");
        };
        this.updateEvent = function(event) {
            return db.query("UPDATE events SET title = '" + event.title +
                "', \"desc\" = '" + event.desc + "', date = '" + event.date +
                "', place = '" + event.place + "', report = '" + event.report +
                "' WHERE id =  '" + event.id + "';");
        };
        this.addEvent = function(event) {
            return db.query("INSERT INTO events( title, \"desc\", date, place, report)" +
                " VALUES(\'" + event.title + "\', \'" + event.desc + "\', \'" +
                event.date + "\', \'" + event.place + "\', \'" + event.report + "\');");
        };
        this.deleteEventById = function(id) {
            return db.query("DELETE FROM events  WHERE id  = '" + id + "';");
        };
        this.getLastId = function() {
            return db.query("SELECT \"id\" FROM \"events\" ORDER BY \"id\" DESC;");
        };
    };
    module.exports = events;
