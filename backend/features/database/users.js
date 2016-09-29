(function() {
    var db = require("./connection");
    var users = function() {
        this.getAll = function() {
            db.query("SELECT * FROM \"users\"")
                .then(function(data) {
                    console.log(data);
                })
                .catch(function(error) {
                    console.error(error);
                })
        }
    };
    module.exports = users;
})();
