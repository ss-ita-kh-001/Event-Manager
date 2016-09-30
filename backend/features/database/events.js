(function() {
    var db = require("./connection");
    var events = function() {
        this.getAll = function() {
            return db.query("SELECT * FROM \"events\";");
        }
        this.getByEvent = function(id) {
            return db.query("SELECT * FROM events WHERE id = '"+ id +"';");
        }
        this.addEvent = function(event) {


          /*waiting for implementation*/
        }
    };
    module.exports = events;
})();
