var db = require("./connection");
var users = function() {
    self = this;
    self.itemsPerPage = 10;

    self.getUsers = function(index) {
        return db.query("SELECT * FROM \"users\" WHERE \"id\" BETWEEN " + Number(index) + " AND " + (Number(index) + self.itemsPerPage) + " ORDER BY \"id\";");
    };
    self.getUserById = function(id) {
        return db.query("SELECT * FROM \"users\" WHERE \"id\" = " + id + ";");
    };
    self.getUserByResetToken = function(token) {
        return db.query("SELECT * FROM \"users\" WHERE \"reset_password_token\" = \'" + token + "\';");
    };
    self.getUserByEmail = function(email) {
        return db.query("SELECT * FROM \"users\" WHERE \"email\" = \'" + email + "\';");
    };
    self.addUser = function(user) {
        return db.query("INSERT INTO \"users\"(\"full_name\",\"email\", \"password\") " +
            "VALUES(\'" + user.fullName + "\', \'" + user.email + "\', \'" + user.password + "\');");
    };
    self.updateUser = function(user) {
        return db.query("UPDATE \"users\" SET \"full_name\" = \'" + user.full_name +
            "\', \"avatar\" = \'" + user.avatar + "\', \"reset_password_token\" = \'" + user.reset_password_token +
            "\', \"reset_password_expires\" = \'" + user.reset_password_expires + "\', \"password\" = \'" + user.password +
            "\', \"email\" = \'" + user.email + "\'" + " WHERE \"id\" = " + user.id + ";");
    };
    self.deleteUser = function(user) {
        return db.query("DELETE FROM \"users\" WHERE \"id\" = " + user.id + ";");
    };
    self.getLastId = function() {
        return db.query("SELECT \"id\" FROM \"users\" ORDER BY \"id\" DESC LIMIT 1;");
    };
};

module.exports = users;
