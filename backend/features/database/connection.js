var pgp = require("pg-promise")();
var dbConnectionString = process.env.DATABASE_URL + '?ssl=false';
var db = pgp(dbConnectionString);
module.exports = db;
