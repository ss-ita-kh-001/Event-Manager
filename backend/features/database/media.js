var db = require("./connection");
var media = function() {
    this.add = function(path, kind, event) {
        return db.query("INSERT INTO \"media\"(\"path\", \"kind\", \"event\") VALUES(\'" +
            path + "\', \'" + kind + "\'," + event + ");")
    };
    this.getByEvent = function(event) {
        return db.query("SELECT * FROM \"media\" WHERE \"event\" = " + event + ";")
    }
    this.getAll = function () {
      return db.query("SELECT * FROM \"media\";");
    }
};
module.exports = media;
