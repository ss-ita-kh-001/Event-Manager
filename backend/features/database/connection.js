    var pgp = require("pg-promise")();
    var localDbConnection = {
        host: "localhost",
        port: 5432,
        database: "ita-event-manager",
        user: "postgres",
        password: "root"
    };
    var herokuDbConnection = {
        host: "ec2-54-235-202-71.compute-1.amazonaws.com",
        port: 5432,
        database: "d3fhukpkuqto8d",
        user: "yqifxpsiqstfzq",
        password: "9GKXzO6J838Mw0aBsNoXL6CMGZ",
        ssl: true
    };
    var db = pgp(herokuDbConnection);
    module.exports = db;

