(function() {
    var db = require("./connection");
    var users = function() {
        this.getAll = function() {
                return db.query("SELECT * FROM \"users\";");
            },
            this.getUserById = function(id) {
                return db.query("SELECT * FROM \"users\" WHERE \"id\" = " + id + ";");
            },
            this.addUser = function(user) {
                return db.query("INSERT INTO \"users\"(\"full_name\", \"login\", \"password\", \"email\", \"status\")" +
                    " VALUES(\'" + user.fullName + "\', \'" + user.login + "\', \'" +
                    user.password + "\', \'" + user.email + "\', \'" + user.status + "\');");
            },
            this.updateUser = function(user) {
                return db.query("UPDATE \"users\" SET \"full_name\" = \'" + user.fullName +
                    "\', \"login\" = \'" + user.login + "\', \"password\" = \'" + user.password +
                    "\', \"email\" = \'" + user.email + "\', \"status\" = \'" + user.status +
                    "\' WHERE \"id\" = " + user.id + ";");
            },
            this.deleteUser = function(user) {
                return db.query("DELETE FROM users WHERE id = " + user.id + ";");
            }
    };
    module.exports = users;
})();
