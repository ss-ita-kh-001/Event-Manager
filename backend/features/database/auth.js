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
        if (!req.header('Authorization')) {
            return res.status(401).send({ message: 'Please make sure your request has an Authorization header' });
        }
        var token = req.header('Authorization').split(' ')[1];
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
        req.body.userID = payload.id;
        req.body.userRole = payload.role
        next();
    };
    this.ensureIsAdmin = function(req, res, next) {

        if (req.body.userRole !== "admin") {
            return res.status(403).send({
                message: 'Access denied'
            });
        }
        next();
    };
};

function createJWT(user) {
    var payload = {
        id: user[0].id,
        role: user[0].role,
        iat: moment().unix(),
        exp: moment().add(14, 'days').unix()
    };

    return jwt.encode(payload, config.TOKEN_SECRET);
}

module.exports = auth;
