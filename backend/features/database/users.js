var db = require("./connection");
var users = function() {
    this.getAll = function() {
        return db.query("SELECT * FROM \"users\";");
    };
    this.getUserById = function(id) {
        return db.query("SELECT * FROM \"users\" WHERE \"id\" = " + id + ";");
    };
    this.addUser = function(user) {
        return db.query("INSERT INTO \"users\"(\"full_name\",\"email\", \"password\", \"avatar\", \"role\") " +
            "VALUES(\'" + user.fullName + "\', \'" + user.email + "\', \'" + user.password +
            "\', \'" + user.avatar + "\', \'" + (typeof user.role === "undefined" ? "user" : user.role) + "\');");
    };
    this.updateUser = function(user) {
        return db.query("UPDATE \"users\" SET \"full_name\" = \'" + user.fullName +
            "\', \"avatar\" = \'" + user.avatar + "\', \"password\" = \'" + user.password +
            "\', \"email\" = \'" + user.email + "\'" + (typeof user.role === "undefined" ? "" : ", \"role\" = \'" + user.role + "\'") +
            " WHERE \"id\" = " + user.id + ";");
    };
    this.deleteUser = function(user) {
        return db.query("DELETE FROM \"users\" WHERE \"id\" = " + user.id + ";");
    };
    this.getLastId = function() {
        return db.query("SELECT \"id\" FROM \"users\" ORDER BY \"id\" DESC LIMIT 1;");
    };
};
module.exports = users;
