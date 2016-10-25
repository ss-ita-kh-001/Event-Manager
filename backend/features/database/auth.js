var jwt = require('jwt-simple');
var moment = require('moment');
var config = require("./config");
var bcrypt = require('bcrypt-nodejs');

var auth = function() {
    this.login = function(data, req) {
        var response = {
            user: {},
            token: ''
        };
        if (bcrypt.compareSync(req.password, data[0].password)) {
            response.user = data[0];
            response.user.password = 'SECRET!!!';
            response.token = createJWT(data);
            return response;

        } else {
            console.log('wrong');
            return false;
        }
    };
    this.hashData = function(data) {
        var salt = bcrypt.genSaltSync(10);
        var hash = bcrypt.hashSync(data, salt);

        return hash;
    }
    this.ensureAuthenticated = function(req, res, next) {
        var token = req.body.token;
        var payload = null;

        try {
            payload = jwt.decode(token, config.TOKEN_SECRET);
        } catch (err) {
            return res.status(401).send({
                message: err.message
            });
        }

        if (payload.exp <= moment().unix()) {
            return res.status(401).send({
                message: 'Token has expired'
            });
        }
        req.body.sub = payload.sub;
        console.log(payload.sub);
        next();
    };
};


function createJWT(user) {
    var payload = {
        sub: user[0].email,
        iat: moment().unix(),
        exp: moment().add(14, 'days').unix()
    };

    return jwt.encode(payload, config.TOKEN_SECRET);
}


module.exports = auth;
