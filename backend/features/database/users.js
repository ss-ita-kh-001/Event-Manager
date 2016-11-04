var db = require("./connection");
var users = function() {
    self = this;
    self.getUsers = function(index) {
        console.log('SELECT users WHERE id >= ', index);
        return db.query("SELECT * FROM \"users\" WHERE \"id\" >= " + Number(index) + " ORDER BY \"id\" LIMIT 10 ;");
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
    self.getUserByGithub = function(github) {
        return db.query("SELECT * FROM \"users\" WHERE \"github\" = \'" + github + "\';");
    };
    self.addUser = function(user) {
        return db.query("INSERT INTO \"users\"(\"full_name\",\"email\", \"password\", \"github\") " +
            "VALUES(\'" + user.fullName + "\', \'" + user.email + "\', \'" + user.password + "\', \'" + user.github + "\');");
    };
    self.updateUser = function(user) {
        return db.query("UPDATE \"users\" SET \"full_name\" = \'" + user.full_name +
            "\', \"avatar\" = \'" + user.avatar + "\', \"reset_password_token\" = \'" + user.reset_password_token +
            "\', \"reset_password_expires\" = \'" + user.reset_password_expires + "\', \"password\" = \'" + user.password +
            "\', \"email\" = \'" + user.email + "\'" + " WHERE \"id\" = " + user.id + ";");
    };
    self.deleteUser = function(id) {
        return db.query("DELETE FROM \"users\" WHERE \"id\" = " + id + ";");
    };
    self.deleteUserByName = function(user) {
        return db.query("DELETE FROM \"users\" WHERE \"full_name\" = \'" + user + "\'" + ";");
    };
    self.getLastId = function() {
        return db.query("SELECT \"id\" FROM \"users\" ORDER BY \"id\" DESC LIMIT 1;");
    };
};

module.exports = users;
