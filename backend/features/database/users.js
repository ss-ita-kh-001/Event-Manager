var db = require("./connection");
var users = function() {
    self = this;
    self.getUsers = function(index) {
        console.log('SELECT users OFFSET ', index);
        return db.query("SELECT \"full_name\",\"id\",\"role\",\"avatar\",\"email\" FROM \"users\" ORDER BY \"id\" OFFSET " + Number(index) + " ROWS FETCH NEXT 10 ROWS ONLY;");
    };
    self.getUserById = function(id) {
        console.log('getUserById typo', typeof(id));
        console.log('getUserById', id);
        return db.query("SELECT \"full_name\",\"id\",\"role\",\"avatar\",\"email\" FROM \"users\" WHERE \"id\" = " + id + ";");
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
    self.deleteUser = function(user) {
        return db.query("DELETE FROM \"users\" WHERE \"id\" = " + user.id + ";");
    };
    self.getLastId = function() {
        return db.query("SELECT \"id\" FROM \"users\" ORDER BY \"id\" DESC LIMIT 1;");
    };
};

module.exports = users;
