var pgp = require("pg-promise")();
var dbConnectionString = process.env.DATABASE_URL +'?ssl=true';
var db = pgp(dbConnectionString);
    module.exports = db;

