var pgp = require("pg-promise")();
var dbConnectionString = process.env.EM_PG_CONN;
var db = pgp(dbConnectionString);
module.exports = db;
