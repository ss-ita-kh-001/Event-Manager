var db = require("./connection");
var auth = function() {
    this.login = function (data, req) {
        console.log('data.password ', data[0].password);
        console.log('req.password ', req.password);
        if(req.password == data[0].password) {
          console.log('okeeey');
        } else {
          console.log('wrong');
        }
    }
};
module.exports = auth;
