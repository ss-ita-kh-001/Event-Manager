(function() {
    var db = require("./connection");
    var users = function() {
        this.getAll = function() {
            return db.query("SELECT * FROM \"users\"");
        }
    };
    module.exports = users;
})();
