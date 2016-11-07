var validate = function() {
    this.makeTrusted = function(text) {
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;")
            .replace(/\r?\n/g, '<br />');
    }
    this.checkPattern = function(req, res, next) {
        var patternName = /^[a-zA-Z\s]{3,50}$/;
        var patternPsw = /^.{6,16}$/;
        var patternEmail = /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i;

        if (patternName.test(req.body.fullName) && patternPsw.test(req.body.password) && patternEmail.test(req.body.email)) {
            next();
        } else {
            return res.status(406).send({
                message: 'Error 406 (Not Acceptable)'
            });
        }
    }
};

module.exports = validate;
