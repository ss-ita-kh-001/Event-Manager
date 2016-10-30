var db = require("./connection");
var users = function() {
    this.getAll = function() {
        return db.query("SELECT * FROM \"users\";");
    };
    this.getUserById = function(id) {
        return db.query("SELECT * FROM \"users\" WHERE \"id\" = " + id + ";");
    };
    this.getUserByResetToken = function(token) {
        console.log('getUserByResetToken DB');
        return db.query("SELECT * FROM \"users\" WHERE \"reset_password_token\" = \'" + token + "\';");
    };
    this.getUserByEmail = function(email) {
        return db.query("SELECT * FROM \"users\" WHERE \"email\" = \'" + email + "\';");
    };
    this.addUser = function(user) {
        return db.query("INSERT INTO \"users\"(\"full_name\",\"email\", \"password\") " +
            "VALUES(\'" + user.fullName + "\', \'" + user.email + "\', \'" + user.password + "\');");
    };
    this.updateUser = function(user) {
        return db.query("UPDATE \"users\" SET \"full_name\" = \'" + user.full_name +
            "\', \"avatar\" = \'" + user.avatar + "\', \"reset_password_token\" = \'" + user.reset_password_token +
            "\', \"reset_password_expires\" = \'" + user.reset_password_expires + "\', \"password\" = \'" + user.password +
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
