var db = require("./connection");
var auth = function() {
    this.login = function (data, req) {

      
      return db.query("SELECT * FROM \"users\" WHERE \"id\" = " + data + ";");
      //console.log(user);
        //user.forEach(function (key, value) {
        //  if (req.email == data[key].email) {
            //if (req.password == data[key].password) {
        //      return data[key];
        //      console.log("Inside of IF")
            //}
        //  }

        //})
    }


};
module.exports = auth;
