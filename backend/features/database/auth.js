var jwt = require('jwt-simple');
var moment = require('moment');
var auth = function() {
    this.login = function(data, req) {
        var response = {
            user: {},
            token: ''
        };
        if (req.password == data[0].password) {
            response.user = data[0];
            response.user.password = 'SECRET!!!';
            response.token = createJWT(data);
            return response;

        } else {
            console.log('wrong');
            return false;
        }
    }
};

function createJWT(user) {
    console.log('run');
    var payload = {
        sub: user.email,
        iat: moment().unix(),
        exp: moment().add(14, 'days').unix()
    };
    return jwt.encode(payload, 'YOUR_UNIQUE_JWT_TOKEN_SECRET');
}
module.exports = auth;
