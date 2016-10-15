var db = require("./connection");
var media = function() {
    this.add = function(path, kind, event) {
        return db.query("INSERT INTO \"media\"(\"path\", \"kind\", \"event\") VALUES(\'" +
            path + "\', \'" + kind + "\'," + event + ");")
    };
};
module.exports = media;
