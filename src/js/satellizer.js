/**
 * Satellizer 0.15.5
 * (c) 2016 Sahat Yalkabov 
 * License: MIT 
 */

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global.satellizer = factory());
}(this, function () { 'use strict';

    var Config = (function () {
        function Config() {
            this.baseUrl = '/';
            this.loginUrl = '/auth/login';
            this.signupUrl = '/auth/signup';
            this.unlinkUrl = '/auth/unlink/';
            this.tokenName = 'token';
            this.tokenPrefix = 'satellizer';
            this.tokenHeader = 'Authorization';
            this.tokenType = 'Bearer';
            this.storageType = 'localStorage';
            this.tokenRoot = null;
            this.withCredentials = false;
            this.providers = {
                facebook: {
                    name: 'facebook',
                    url: '/auth/facebook',
                    authorizationEndpoint: 'https://www.facebook.com/v2.5/dialog/oauth',
                    redirectUri: window.location.origin + '/',
                    requiredUrlParams: ['display', 'scope'],
                    scope: ['email'],
                    scopeDelimiter: ',',
                    display: 'popup',
                    oauthType: '2.0',
                    popupOptions: { width: 580, height: 400 }
                },
                google: {
                    name: 'google',
                    url: '/auth/google',
                    authorizationEndpoint: 'https://accounts.google.com/o/oauth2/auth',
                    redirectUri: window.location.origin,
                    requiredUrlParams: ['scope'],
                    optionalUrlParams: ['display', 'state'],
                    scope: ['profile', 'email'],
                    scopePrefix: 'openid',
                    scopeDelimiter: ' ',
                    display: 'popup',
                    oauthType: '2.0',
                    popupOptions: { width: 452, height: 633 },
                    state: function () { return encodeURIComponent(Math.random().toString(36).substr(2)); }
                },
                github: {
                    name: 'github',
                    url: '/auth/github',
                    authorizationEndpoint: 'https://github.com/login/oauth/authorize',
                    redirectUri: window.location.origin,
                    optionalUrlParams: ['scope'],
                    scope: ['user:email'],
                    scopeDelimiter: ' ',
                    oauthType: '2.0',
                    popupOptions: { width: 1020, height: 618 }
                },
                instagram: {
                    name: 'instagram',
                    url: '/auth/instagram',
                    authorizationEndpoint: 'https://api.instagram.com/oauth/authorize',
                    redirectUri: window.location.origin,
                    requiredUrlParams: ['scope'],
                    scope: ['basic'],
                    scopeDelimiter: '+',
                    oauthType: '2.0'
                },
                linkedin: {
                    name: 'linkedin',
                    url: '/auth/linkedin',
                    authorizationEndpoint: 'https://www.linkedin.com/uas/oauth2/authorization',
                    redirectUri: window.location.origin,
                    requiredUrlParams: ['state'],
                    scope: ['r_emailaddress'],
                    scopeDelimiter: ' ',
                    state: 'STATE',
                    oauthType: '2.0',
                    popupOptions: { width: 527, height: 582 }
                },
                twitter: {
                    name: 'twitter',
                    url: '/auth/twitter',
                    authorizationEndpoint: 'https://api.twitter.com/oauth/authenticate',
                    redirectUri: window.location.origin,
                    oauthType: '1.0',
                    popupOptions: { width: 495, height: 645 }
                },
                twitch: {
                    name: 'twitch',
                    url: '/auth/twitch',
                    authorizationEndpoint: 'https://api.twitch.tv/kraken/oauth2/authorize',
                    redirectUri: window.location.origin,
                    requiredUrlParams: ['scope'],
                    scope: ['user_read'],
                    scopeDelimiter: ' ',
                    display: 'popup',
                    oauthType: '2.0',
                    popupOptions: { width: 500, height: 560 }
                },
                live: {
                    name: 'live',
                    url: '/auth/live',
                    authorizationEndpoint: 'https://login.live.com/oauth20_authorize.srf',
                    redirectUri: window.location.origin,
                    requiredUrlParams: ['display', 'scope'],
                    scope: ['wl.emails'],
                    scopeDelimiter: ' ',
                    display: 'popup',
                    oauthType: '2.0',
                    popupOptions: { width: 500, height: 560 }
                },
                yahoo: {
                    name: 'yahoo',
                    url: '/auth/yahoo',
                    authorizationEndpoint: 'https://api.login.yahoo.com/oauth2/request_auth',
                    redirectUri: window.location.origin,
                    scope: [],
                    scopeDelimiter: ',',
                    oauthType: '2.0',
                    popupOptions: { width: 559, height: 519 }
                },
                bitbucket: {
                    name: 'bitbucket',
                    url: '/auth/bitbucket',
                    authorizationEndpoint: 'https://bitbucket.org/site/oauth2/authorize',
                    redirectUri: window.location.origin + '/',
                    requiredUrlParams: ['scope'],
                    scope: ['email'],
                    scopeDelimiter: ' ',
                    oauthType: '2.0',
                    popupOptions: { width: 1028, height: 529 }
                },
                spotify: {
                    name: 'spotify',
                    url: '/auth/spotify',
                    authorizationEndpoint: 'https://accounts.spotify.com/authorize',
                    redirectUri: window.location.origin,
                    optionalUrlParams: ['state'],
                    requiredUrlParams: ['scope'],
                    scope: ['user-read-email'],
                    scopePrefix: '',
                    scopeDelimiter: ',',
                    oauthType: '2.0',
                    popupOptions: { width: 500, height: 530 },
                    state: function () { return encodeURIComponent(Math.random().toString(36).substr(2)); }
                }
            };
            this.httpInterceptor = function () { return true; };
        }
        Object.defineProperty(Config, "getConstant", {
            get: function () {
                return new Config();
            },
            enumerable: true,
            configurable: true
        });
        return Config;
    }());
    ;

    var AuthProvider = (function () {
        function AuthProvider(SatellizerConfig) {
            this.SatellizerConfig = SatellizerConfig;
        }
        Object.defineProperty(AuthProvider.prototype, "baseUrl", {
            get: function () { return this.SatellizerConfig.baseUrl; },
            set: function (value) { this.SatellizerConfig.baseUrl = value; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AuthProvider.prototype, "loginUrl", {
            get: function () { return this.SatellizerConfig.loginUrl; },
            set: function (value) { this.SatellizerConfig.loginUrl = value; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AuthProvider.prototype, "signupUrl", {
            get: function () { return this.SatellizerConfig.signupUrl; },
            set: function (value) { this.SatellizerConfig.signupUrl = value; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AuthProvider.prototype, "unlinkUrl", {
            get: function () { return this.SatellizerConfig.unlinkUrl; },
            set: function (value) { this.SatellizerConfig.unlinkUrl = value; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AuthProvider.prototype, "tokenRoot", {
            get: function () { return this.SatellizerConfig.tokenRoot; },
            set: function (value) { this.SatellizerConfig.tokenRoot = value; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AuthProvider.prototype, "tokenName", {
            get: function () { return this.SatellizerConfig.tokenName; },
            set: function (value) { this.SatellizerConfig.tokenName = value; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AuthProvider.prototype, "tokenPrefix", {
            get: function () { return this.SatellizerConfig.tokenPrefix; },
            set: function (value) { this.SatellizerConfig.tokenPrefix = value; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AuthProvider.prototype, "tokenHeader", {
            get: function () { return this.SatellizerConfig.tokenHeader; },
            set: function (value) { this.SatellizerConfig.tokenHeader = value; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AuthProvider.prototype, "tokenType", {
            get: function () { return this.SatellizerConfig.tokenType; },
            set: function (value) { this.SatellizerConfig.tokenType = value; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AuthProvider.prototype, "withCredentials", {
            get: function () { return this.SatellizerConfig.withCredentials; },
            set: function (value) { this.SatellizerConfig.withCredentials = value; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AuthProvider.prototype, "storageType", {
            get: function () { return this.SatellizerConfig.storageType; },
            set: function (value) { this.SatellizerConfig.storageType = value; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AuthProvider.prototype, "httpInterceptor", {
            get: function () { return this.SatellizerConfig.httpInterceptor; },
            set: function (value) {
                if (typeof value === 'function') {
                    this.SatellizerConfig.httpInterceptor = value;
                }
                else {
                    this.SatellizerConfig.httpInterceptor = function () { return value; };
                }
            },
            enumerable: true,
            configurable: true
        });
        AuthProvider.prototype.facebook = function (options) {
            angular.extend(this.SatellizerConfig.providers.facebook, options);
        };
        AuthProvider.prototype.google = function (options) {
            angular.extend(this.SatellizerConfig.providers.google, options);
        };
        AuthProvider.prototype.github = function (options) {
            angular.extend(this.SatellizerConfig.providers.github, options);
        };
        AuthProvider.prototype.instagram = function (options) {
            angular.extend(this.SatellizerConfig.providers.instagram, options);
        };
        AuthProvider.prototype.linkedin = function (options) {
            angular.extend(this.SatellizerConfig.providers.linkedin, options);
        };
        AuthProvider.prototype.twitter = function (options) {
            angular.extend(this.SatellizerConfig.providers.twitter, options);
        };
        AuthProvider.prototype.twitch = function (options) {
            angular.extend(this.SatellizerConfig.providers.twitch, options);
        };
        AuthProvider.prototype.live = function (options) {
            angular.extend(this.SatellizerConfig.providers.live, options);
        };
        AuthProvider.prototype.yahoo = function (options) {
            angular.extend(this.SatellizerConfig.providers.yahoo, options);
        };
        AuthProvider.prototype.bitbucket = function (options) {
            angular.extend(this.SatellizerConfig.providers.bitbucket, options);
        };
        AuthProvider.prototype.spotify = function (options) {
            angular.extend(this.SatellizerConfig.providers.spotify, options);
        };
        AuthProvider.prototype.oauth1 = function (options) {
            this.SatellizerConfig.providers[options.name] = angular.extend(options, {
                oauthType: '1.0'
            });
        };
        AuthProvider.prototype.oauth2 = function (options) {
            this.SatellizerConfig.providers[options.name] = angular.extend(options, {
                oauthType: '2.0'
            });
        };
        AuthProvider.prototype.$get = function (SatellizerShared, SatellizerLocal, SatellizerOAuth) {
            return {
                login: function (user, options) { return SatellizerLocal.login(user, options); },
                signup: function (user, options) { return SatellizerLocal.signup(user, options); },
                logout: function () { return SatellizerShared.logout(); },
                authenticate: function (name, data) { return SatellizerOAuth.authenticate(name, data); },
                link: function (name, data) { return SatellizerOAuth.authenticate(name, data); },
                unlink: function (name, options) { return SatellizerOAuth.unlink(name, options); },
                isAuthenticated: function () { return SatellizerShared.isAuthenticated(); },
                getPayload: function () { return SatellizerShared.getPayload(); },
                getToken: function () { return SatellizerShared.getToken(); },
                setToken: function (token) { return SatellizerShared.setToken({ access_token: token }); },
                removeToken: function () { return SatellizerShared.removeToken(); },
                setStorageType: function (type) { return SatellizerShared.setStorageType(type); }
            };
        };
        AuthProvider.$inject = ['SatellizerConfig'];
        return AuthProvider;
    }());
    AuthProvider.prototype.$get.$inject = ['SatellizerShared', 'SatellizerLocal', 'SatellizerOAuth'];

    function joinUrl(baseUrl, url) {
        if (/^(?:[a-z]+:)?\/\//i.test(url)) {
            return url;
        }
        var joined = [baseUrl, url].join('/');
        var normalize = function (str) {
            return str
                .replace(/[\/]+/g, '/')
                .replace(/\/\?/g, '?')
                .replace(/\/\#/g, '#')
                .replace(/\:\//g, '://');
        };
        return normalize(joined);
    }
    function getFullUrlPath(location) {
        var isHttps = location.protocol === 'https:';
        return location.protocol + '//' + location.hostname +
            ':' + (location.port || (isHttps ? '443' : '80')) +
            (/^\//.test(location.pathname) ? location.pathname : '/' + location.pathname);
    }
    function parseQueryString(str) {
        var obj = {};
        var key;
        var value;
        angular.forEach((str || '').split('&'), function (keyValue) {
            if (keyValue) {
                value = keyValue.split('=');
                key = decodeURIComponent(value[0]);
                obj[key] = angular.isDefined(value[1]) ? decodeURIComponent(value[1]) : true;
            }
        });
        return obj;
    }
    function decodeBase64(str) {
        var buffer;
        if (typeof module !== 'undefined' && module.exports) {
            try {
                buffer = require('buffer').Buffer;
            }
            catch (err) {
            }
        }
        var fromCharCode = String.fromCharCode;
        var re_btou = new RegExp([
            '[\xC0-\xDF][\x80-\xBF]',
            '[\xE0-\xEF][\x80-\xBF]{2}',
            '[\xF0-\xF7][\x80-\xBF]{3}'
        ].join('|'), 'g');
        var cb_btou = function (cccc) {
            switch (cccc.length) {
                case 4:
                    var cp = ((0x07 & cccc.charCodeAt(0)) << 18)
                        | ((0x3f & cccc.charCodeAt(1)) << 12)
                        | ((0x3f & cccc.charCodeAt(2)) << 6)
                        | (0x3f & cccc.charCodeAt(3));
                    var offset = cp - 0x10000;
                    return (fromCharCode((offset >>> 10) + 0xD800)
                        + fromCharCode((offset & 0x3FF) + 0xDC00));
                case 3:
                    return fromCharCode(((0x0f & cccc.charCodeAt(0)) << 12)
                        | ((0x3f & cccc.charCodeAt(1)) << 6)
                        | (0x3f & cccc.charCodeAt(2)));
                default:
                    return fromCharCode(((0x1f & cccc.charCodeAt(0)) << 6)
                        | (0x3f & cccc.charCodeAt(1)));
            }
        };
        var btou = function (b) {
            return b.replace(re_btou, cb_btou);
        };
        var _decode = buffer ? function (a) {
            return (a.constructor === buffer.constructor
                ? a : new buffer(a, 'base64')).toString();
        }
            : function (a) {
                return btou(atob(a));
            };
        return _decode(String(str).replace(/[-_]/g, function (m0) {
            return m0 === '-' ? '+' : '/';
        })
            .replace(/[^A-Za-z0-9\+\/]/g, ''));
    }

    var Shared = (function () {
        function Shared($q, $window, SatellizerConfig, SatellizerStorage) {
            this.$q = $q;
            this.$window = $window;
            this.SatellizerConfig = SatellizerConfig;
            this.SatellizerStorage = SatellizerStorage;
            var _a = this.SatellizerConfig, tokenName = _a.tokenName, tokenPrefix = _a.tokenPrefix;
            this.prefixedTokenName = tokenPrefix ? [tokenPrefix, tokenName].join('_') : tokenName;
        }
        Shared.prototype.getToken = function () {
            return this.SatellizerStorage.get(this.prefixedTokenName);
        };
        Shared.prototype.getPayload = function () {
            var token = this.SatellizerStorage.get(this.prefixedTokenName);
            if (token && token.split('.').length === 3) {
                try {
                    var base64Url = token.split('.')[1];
                    var base64 = base64Url.replace('-', '+').replace('_', '/');
                    return JSON.parse(decodeBase64(base64));
                }
                catch (e) {
                }
            }
        };
        Shared.prototype.setToken = function (response) {
            var tokenRoot = this.SatellizerConfig.tokenRoot;
            var tokenName = this.SatellizerConfig.tokenName;
            var accessToken = response && response.access_token;
            var token;
            if (accessToken) {
                if (angular.isObject(accessToken) && angular.isObject(accessToken.data)) {
                    response = accessToken;
                }
                else if (angular.isString(accessToken)) {
                    token = accessToken;
                }
            }
            if (!token && response) {
                var tokenRootData = tokenRoot && tokenRoot.split('.').reduce(function (o, x) { return o[x]; }, response.data);
                token = tokenRootData ? tokenRootData[tokenName] : response.data && response.data[tokenName];
            }
            if (token) {
                this.SatellizerStorage.set(this.prefixedTokenName, token);
            }
        };
        Shared.prototype.removeToken = function () {
            this.SatellizerStorage.remove(this.prefixedTokenName);
        };
        Shared.prototype.isAuthenticated = function () {
            var token = this.SatellizerStorage.get(this.prefixedTokenName);
            if (token) {
                if (token.split('.').length === 3) {
                    try {
                        var base64Url = token.split('.')[1];
                        var base64 = base64Url.replace('-', '+').replace('_', '/');
                        var exp = JSON.parse(this.$window.atob(base64)).exp;
                        if (typeof exp === 'number') {
                            return Math.round(new Date().getTime() / 1000) < exp;
                        }
                    }
                    catch (e) {
                        return true; // Pass: Non-JWT token that looks like JWT
                    }
                }
                return true; // Pass: All other tokens
            }
            return false; // Fail: No token at all
        };
        Shared.prototype.logout = function () {
            this.SatellizerStorage.remove(this.prefixedTokenName);
            return this.$q.when();
        };
        Shared.prototype.setStorageType = function (type) {
            this.SatellizerConfig.storageType = type;
        };
        Shared.$inject = ['$q', '$window', 'SatellizerConfig', 'SatellizerStorage'];
        return Shared;
    }());

    var Local = (function () {
        function Local($http, SatellizerConfig, SatellizerShared) {
            this.$http = $http;
            this.SatellizerConfig = SatellizerConfig;
            this.SatellizerShared = SatellizerShared;
        }
        Local.prototype.login = function (user, options) {
            var _this = this;
            if (options === void 0) { options = {}; }
            options.url = options.url ? options.url : joinUrl(this.SatellizerConfig.baseUrl, this.SatellizerConfig.loginUrl);
            options.data = user || options.data;
            options.method = options.method || 'POST';
            options.withCredentials = options.withCredentials || this.SatellizerConfig.withCredentials;
            return this.$http(options).then(function (response) {
                _this.SatellizerShared.setToken(response);
                return response;
            });
        };
        Local.prototype.signup = function (user, options) {
            if (options === void 0) { options = {}; }
            options.url = options.url ? options.url : joinUrl(this.SatellizerConfig.baseUrl, this.SatellizerConfig.signupUrl);
            options.data = user || options.data;
            options.method = options.method || 'POST';
            options.withCredentials = options.withCredentials || this.SatellizerConfig.withCredentials;
            return this.$http(options);
        };
        Local.$inject = ['$http', 'SatellizerConfig', 'SatellizerShared'];
        return Local;
    }());

    var Popup = (function () {
        function Popup($interval, $window, $q) {
            this.$interval = $interval;
            this.$window = $window;
            this.$q = $q;
            this.popup = null;
            this.defaults = {
                redirectUri: null
            };
        }
        Popup.prototype.stringifyOptions = function (options) {
            var parts = [];
            angular.forEach(options, function (value, key) {
                parts.push(key + '=' + value);
            });
            return parts.join(',');
        };
        Popup.prototype.open = function (url, name, popupOptions, redirectUri, dontPoll) {
            var width = popupOptions.width || 500;
            var height = popupOptions.height || 500;
            var options = this.stringifyOptions({
                width: width,
                height: height,
                top: this.$window.screenY + ((this.$window.outerHeight - height) / 2.5),
                left: this.$window.screenX + ((this.$window.outerWidth - width) / 2)
            });
            var popupName = this.$window['cordova'] || this.$window.navigator.userAgent.indexOf('CriOS') > -1 ? '_blank' : name;
            this.popup = this.$window.open(url, popupName, options);
            if (this.popup && this.popup.focus) {
                this.popup.focus();
            }
            if (dontPoll) {
                return;
            }
            if (this.$window['cordova']) {
                return this.eventListener(redirectUri);
            }
            else {
                if (url === 'about:blank') {
                    this.popup.location = url;
                }
                return this.polling(redirectUri);
            }
        };
        Popup.prototype.polling = function (redirectUri) {
            var _this = this;
            return this.$q(function (resolve, reject) {
                var redirectUriParser = document.createElement('a');
                redirectUriParser.href = redirectUri;
                var redirectUriPath = getFullUrlPath(redirectUriParser);
                var polling = _this.$interval(function () {
                    if (!_this.popup || _this.popup.closed || _this.popup.closed === undefined) {
                        _this.$interval.cancel(polling);
                        reject(new Error('The popup window was closed'));
                    }
                    try {
                        var popupWindowPath = getFullUrlPath(_this.popup.location);
                        if (popupWindowPath === redirectUriPath) {
                            if (_this.popup.location.search || _this.popup.location.hash) {
                                var query = parseQueryString(_this.popup.location.search.substring(1).replace(/\/$/, ''));
                                var hash = parseQueryString(_this.popup.location.hash.substring(1).replace(/[\/$]/, ''));
                                var params = angular.extend({}, query, hash);
                                if (params.error) {
                                    reject(new Error(params.error));
                                }
                                else {
                                    resolve(params);
                                }
                            }
                            else {
                                reject(new Error('OAuth redirect has occurred but no query or hash parameters were found. ' +
                                    'They were either not set during the redirect, or were removed—typically by a ' +
                                    'routing library—before Satellizer could read it.'));
                            }
                            _this.$interval.cancel(polling);
                            _this.popup.close();
                        }
                    }
                    catch (error) {
                    }
                }, 500);
            });
        };
        Popup.prototype.eventListener = function (redirectUri) {
            var _this = this;
            return this.$q(function (resolve, reject) {
                _this.popup.addEventListener('loadstart', function (event) {
                    if (event.url.indexOf(redirectUri) !== 0) {
                        return;
                    }
                    var parser = document.createElement('a');
                    parser.href = event.url;
                    if (parser.search || parser.hash) {
                        var query = parseQueryString(parser.search.substring(1).replace(/\/$/, ''));
                        var hash = parseQueryString(parser.hash.substring(1).replace(/[\/$]/, ''));
                        var params = angular.extend({}, query, hash);
                        if (params.error) {
                            reject(new Error(params.error));
                        }
                        else {
                            resolve(params);
                        }
                        _this.popup.close();
                    }
                });
                _this.popup.addEventListener('loaderror', function () {
                    reject(new Error('Authorization failed'));
                });
                _this.popup.addEventListener('exit', function () {
                    reject(new Error('The popup window was closed'));
                });
            });
        };
        Popup.$inject = ['$interval', '$window', '$q'];
        return Popup;
    }());

    var OAuth1 = (function () {
        function OAuth1($http, $window, SatellizerConfig, SatellizerPopup) {
            this.$http = $http;
            this.$window = $window;
            this.SatellizerConfig = SatellizerConfig;
            this.SatellizerPopup = SatellizerPopup;
            this.defaults = {
                name: null,
                url: null,
                authorizationEndpoint: null,
                scope: null,
                scopePrefix: null,
                scopeDelimiter: null,
                redirectUri: null,
                requiredUrlParams: null,
                defaultUrlParams: null,
                oauthType: '1.0',
                popupOptions: { width: null, height: null }
            };
        }
        ;
        OAuth1.prototype.init = function (options, userData) {
            var _this = this;
            angular.extend(this.defaults, options);
            var name = options.name, popupOptions = options.popupOptions;
            var redirectUri = this.defaults.redirectUri;
            // Should open an empty popup and wait until request token is received
            if (!this.$window['cordova']) {
                this.SatellizerPopup.open('about:blank', name, popupOptions, redirectUri, true);
            }
            return this.getRequestToken().then(function (response) {
                return _this.openPopup(options, response).then(function (popupResponse) {
                    return _this.exchangeForToken(popupResponse, userData);
                });
            });
        };
        OAuth1.prototype.openPopup = function (options, response) {
            var url = [options.authorizationEndpoint, this.buildQueryString(response.data)].join('?');
            var redirectUri = this.defaults.redirectUri;
            if (this.$window['cordova']) {
                return this.SatellizerPopup.open(url, options.name, options.popupOptions, redirectUri);
            }
            else {
                this.SatellizerPopup.popup.location = url;
                return this.SatellizerPopup.polling(redirectUri);
            }
        };
        OAuth1.prototype.getRequestToken = function () {
            var url = this.SatellizerConfig.baseUrl ? joinUrl(this.SatellizerConfig.baseUrl, this.defaults.url) : this.defaults.url;
            return this.$http.post(url, this.defaults);
        };
        OAuth1.prototype.exchangeForToken = function (oauthData, userData) {
            var payload = angular.extend({}, userData, oauthData);
            var exchangeForTokenUrl = this.SatellizerConfig.baseUrl ? joinUrl(this.SatellizerConfig.baseUrl, this.defaults.url) : this.defaults.url;
            return this.$http.post(exchangeForTokenUrl, payload, { withCredentials: this.SatellizerConfig.withCredentials });
        };
        OAuth1.prototype.buildQueryString = function (obj) {
            var str = [];
            angular.forEach(obj, function (value, key) {
                str.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
            });
            return str.join('&');
        };
        OAuth1.$inject = ['$http', '$window', 'SatellizerConfig', 'SatellizerPopup'];
        return OAuth1;
    }());

    var OAuth2 = (function () {
        function OAuth2($http, $window, $timeout, $q, SatellizerConfig, SatellizerPopup, SatellizerStorage) {
            this.$http = $http;
            this.$window = $window;
            this.$timeout = $timeout;
            this.$q = $q;
            this.SatellizerConfig = SatellizerConfig;
            this.SatellizerPopup = SatellizerPopup;
            this.SatellizerStorage = SatellizerStorage;
            this.defaults = {
                name: null,
                url: null,
                clientId: null,
                authorizationEndpoint: null,
                redirectUri: null,
                scope: null,
                scopePrefix: null,
                scopeDelimiter: null,
                state: null,
                requiredUrlParams: null,
                defaultUrlParams: ['response_type', 'client_id', 'redirect_uri'],
                responseType: 'code',
                responseParams: {
                    code: 'code',
                    clientId: 'clientId',
                    redirectUri: 'redirectUri'
                },
                oauthType: '2.0',
                popupOptions: { width: null, height: null }
            };
        }
        OAuth2.camelCase = function (name) {
            return name.replace(/([\:\-\_]+(.))/g, function (_, separator, letter, offset) {
                return offset ? letter.toUpperCase() : letter;
            });
        };
        OAuth2.prototype.init = function (options, userData) {
            var _this = this;
            return this.$q(function (resolve, reject) {
                angular.extend(_this.defaults, options);
                var stateName = _this.defaults.name + '_state';
                var _a = _this.defaults, name = _a.name, state = _a.state, popupOptions = _a.popupOptions, redirectUri = _a.redirectUri, responseType = _a.responseType;
                if (typeof state === 'function') {
                    _this.SatellizerStorage.set(stateName, state());
                }
                else if (typeof state === 'string') {
                    _this.SatellizerStorage.set(stateName, state);
                }
                var url = [_this.defaults.authorizationEndpoint, _this.buildQueryString()].join('?');
                _this.SatellizerPopup.open(url, name, popupOptions, redirectUri).then(function (oauth) {
                    if (responseType === 'token' || !url) {
                        return resolve(oauth);
                    }
                    if (oauth.state && oauth.state !== _this.SatellizerStorage.get(stateName)) {
                        return reject(new Error('The value returned in the state parameter does not match the state value from your original ' +
                            'authorization code request.'));
                    }
                    resolve(_this.exchangeForToken(oauth, userData));
                }).catch(function (error) { return reject(error); });
            });
        };
        OAuth2.prototype.exchangeForToken = function (oauthData, userData) {
            var _this = this;
            var payload = angular.extend({}, userData);
            angular.forEach(this.defaults.responseParams, function (value, key) {
                switch (key) {
                    case 'code':
                        payload[value] = oauthData.code;
                        break;
                    case 'clientId':
                        payload[value] = _this.defaults.clientId;
                        break;
                    case 'redirectUri':
                        payload[value] = _this.defaults.redirectUri;
                        break;
                    default:
                        payload[value] = oauthData[key];
                }
            });
            if (oauthData.state) {
                payload.state = oauthData.state;
            }
            var exchangeForTokenUrl = this.SatellizerConfig.baseUrl ?
                joinUrl(this.SatellizerConfig.baseUrl, this.defaults.url) :
                this.defaults.url;
            return this.$http.post(exchangeForTokenUrl, payload, { withCredentials: this.SatellizerConfig.withCredentials });
        };
        OAuth2.prototype.buildQueryString = function () {
            var _this = this;
            var keyValuePairs = [];
            var urlParamsCategories = ['defaultUrlParams', 'requiredUrlParams', 'optionalUrlParams'];
            angular.forEach(urlParamsCategories, function (paramsCategory) {
                angular.forEach(_this.defaults[paramsCategory], function (paramName) {
                    var camelizedName = OAuth2.camelCase(paramName);
                    var paramValue = angular.isFunction(_this.defaults[paramName]) ? _this.defaults[paramName]() : _this.defaults[camelizedName];
                    if (paramName === 'redirect_uri' && !paramValue) {
                        return;
                    }
                    if (paramName === 'state') {
                        var stateName = _this.defaults.name + '_state';
                        paramValue = encodeURIComponent(_this.SatellizerStorage.get(stateName));
                    }
                    if (paramName === 'scope' && Array.isArray(paramValue)) {
                        paramValue = paramValue.join(_this.defaults.scopeDelimiter);
                        if (_this.defaults.scopePrefix) {
                            paramValue = [_this.defaults.scopePrefix, paramValue].join(_this.defaults.scopeDelimiter);
                        }
                    }
                    keyValuePairs.push([paramName, paramValue]);
                });
            });
            return keyValuePairs.map(function (pair) { return pair.join('='); }).join('&');
        };
        OAuth2.$inject = ['$http', '$window', '$timeout', '$q', 'SatellizerConfig', 'SatellizerPopup', 'SatellizerStorage'];
        return OAuth2;
    }());

    var OAuth = (function () {
        function OAuth($http, $window, $timeout, $q, SatellizerConfig, SatellizerPopup, SatellizerStorage, SatellizerShared, SatellizerOAuth1, SatellizerOAuth2) {
            this.$http = $http;
            this.$window = $window;
            this.$timeout = $timeout;
            this.$q = $q;
            this.SatellizerConfig = SatellizerConfig;
            this.SatellizerPopup = SatellizerPopup;
            this.SatellizerStorage = SatellizerStorage;
            this.SatellizerShared = SatellizerShared;
            this.SatellizerOAuth1 = SatellizerOAuth1;
            this.SatellizerOAuth2 = SatellizerOAuth2;
        }
        OAuth.prototype.authenticate = function (name, userData) {
            var _this = this;
            return this.$q(function (resolve, reject) {
                var provider = _this.SatellizerConfig.providers[name];
                var oauth = null;
                switch (provider.oauthType) {
                    case '1.0':
                        oauth = new OAuth1(_this.$http, _this.$window, _this.SatellizerConfig, _this.SatellizerPopup);
                        break;
                    case '2.0':
                        oauth = new OAuth2(_this.$http, _this.$window, _this.$timeout, _this.$q, _this.SatellizerConfig, _this.SatellizerPopup, _this.SatellizerStorage);
                        break;
                    default:
                        return reject(new Error('Invalid OAuth Type'));
                }
                return oauth.init(provider, userData).then(function (response) {
                    if (provider.url) {
                        _this.SatellizerShared.setToken(response);
                    }
                    resolve(response);
                }).catch(function (error) {
                    reject(error);
                });
            });
        };
        OAuth.prototype.unlink = function (provider, httpOptions) {
            if (httpOptions === void 0) { httpOptions = {}; }
            httpOptions.url = httpOptions.url ? httpOptions.url : joinUrl(this.SatellizerConfig.baseUrl, this.SatellizerConfig.unlinkUrl);
            httpOptions.data = { provider: provider } || httpOptions.data;
            httpOptions.method = httpOptions.method || 'POST';
            httpOptions.withCredentials = httpOptions.withCredentials || this.SatellizerConfig.withCredentials;
            return this.$http(httpOptions);
        };
        OAuth.$inject = [
            '$http',
            '$window',
            '$timeout',
            '$q',
            'SatellizerConfig',
            'SatellizerPopup',
            'SatellizerStorage',
            'SatellizerShared',
            'SatellizerOAuth1',
            'SatellizerOAuth2'
        ];
        return OAuth;
    }());

    var Storage = (function () {
        function Storage($window, SatellizerConfig) {
            this.$window = $window;
            this.SatellizerConfig = SatellizerConfig;
            this.memoryStore = {};
        }
        Storage.prototype.get = function (key) {
            try {
                return this.$window[this.SatellizerConfig.storageType].getItem(key);
            }
            catch (e) {
                return this.memoryStore[key];
            }
        };
        Storage.prototype.set = function (key, value) {
            try {
                this.$window[this.SatellizerConfig.storageType].setItem(key, value);
            }
            catch (e) {
                this.memoryStore[key] = value;
            }
        };
        Storage.prototype.remove = function (key) {
            try {
                this.$window[this.SatellizerConfig.storageType].removeItem(key);
            }
            catch (e) {
                delete this.memoryStore[key];
            }
        };
        Storage.$inject = ['$window', 'SatellizerConfig'];
        return Storage;
    }());

    var Interceptor = (function () {
        function Interceptor(SatellizerConfig, SatellizerShared, SatellizerStorage) {
            var _this = this;
            this.SatellizerConfig = SatellizerConfig;
            this.SatellizerShared = SatellizerShared;
            this.SatellizerStorage = SatellizerStorage;
            this.request = function (config) {
                if (config['skipAuthorization']) {
                    return config;
                }
                if (_this.SatellizerShared.isAuthenticated() && _this.SatellizerConfig.httpInterceptor()) {
                    var tokenName = _this.SatellizerConfig.tokenPrefix ?
                        [_this.SatellizerConfig.tokenPrefix, _this.SatellizerConfig.tokenName].join('_') : _this.SatellizerConfig.tokenName;
                    var token = _this.SatellizerStorage.get(tokenName);
                    if (_this.SatellizerConfig.tokenHeader && _this.SatellizerConfig.tokenType) {
                        token = _this.SatellizerConfig.tokenType + ' ' + token;
                    }
                    config.headers[_this.SatellizerConfig.tokenHeader] = token;
                }
                return config;
            };
        }
        Interceptor.Factory = function (SatellizerConfig, SatellizerShared, SatellizerStorage) {
            return new Interceptor(SatellizerConfig, SatellizerShared, SatellizerStorage);
        };
        Interceptor.$inject = ['SatellizerConfig', 'SatellizerShared', 'SatellizerStorage'];
        return Interceptor;
    }());
    Interceptor.Factory.$inject = ['SatellizerConfig', 'SatellizerShared', 'SatellizerStorage'];

    var HttpProviderConfig = (function () {
        function HttpProviderConfig($httpProvider) {
            this.$httpProvider = $httpProvider;
            $httpProvider.interceptors.push(Interceptor.Factory);
        }
        HttpProviderConfig.$inject = ['$httpProvider'];
        return HttpProviderConfig;
    }());

    angular.module('satellizer', [])
        .provider('$auth', ['SatellizerConfig', function (SatellizerConfig) { return new AuthProvider(SatellizerConfig); }])
        .constant('SatellizerConfig', Config.getConstant)
        .service('SatellizerShared', Shared)
        .service('SatellizerLocal', Local)
        .service('SatellizerPopup', Popup)
        .service('SatellizerOAuth', OAuth)
        .service('SatellizerOAuth2', OAuth2)
        .service('SatellizerOAuth1', OAuth1)
        .service('SatellizerStorage', Storage)
        .service('SatellizerInterceptor', Interceptor)
        .config(['$httpProvider', function ($httpProvider) { return new HttpProviderConfig($httpProvider); }]);
    var ng1 = 'satellizer';

    return ng1;

}));
//# sourceMappingURL=satellizer.js.map
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJzYXRlbGxpemVyLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBTYXRlbGxpemVyIDAuMTUuNVxyXG4gKiAoYykgMjAxNiBTYWhhdCBZYWxrYWJvdiBcclxuICogTGljZW5zZTogTUlUIFxyXG4gKi9cclxuXHJcbihmdW5jdGlvbiAoZ2xvYmFsLCBmYWN0b3J5KSB7XHJcbiAgICB0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgPyBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKSA6XHJcbiAgICB0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQgPyBkZWZpbmUoZmFjdG9yeSkgOlxyXG4gICAgKGdsb2JhbC5zYXRlbGxpemVyID0gZmFjdG9yeSgpKTtcclxufSh0aGlzLCBmdW5jdGlvbiAoKSB7ICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICB2YXIgQ29uZmlnID0gKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBmdW5jdGlvbiBDb25maWcoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuYmFzZVVybCA9ICcvJztcclxuICAgICAgICAgICAgdGhpcy5sb2dpblVybCA9ICcvYXV0aC9sb2dpbic7XHJcbiAgICAgICAgICAgIHRoaXMuc2lnbnVwVXJsID0gJy9hdXRoL3NpZ251cCc7XHJcbiAgICAgICAgICAgIHRoaXMudW5saW5rVXJsID0gJy9hdXRoL3VubGluay8nO1xyXG4gICAgICAgICAgICB0aGlzLnRva2VuTmFtZSA9ICd0b2tlbic7XHJcbiAgICAgICAgICAgIHRoaXMudG9rZW5QcmVmaXggPSAnc2F0ZWxsaXplcic7XHJcbiAgICAgICAgICAgIHRoaXMudG9rZW5IZWFkZXIgPSAnQXV0aG9yaXphdGlvbic7XHJcbiAgICAgICAgICAgIHRoaXMudG9rZW5UeXBlID0gJ0JlYXJlcic7XHJcbiAgICAgICAgICAgIHRoaXMuc3RvcmFnZVR5cGUgPSAnbG9jYWxTdG9yYWdlJztcclxuICAgICAgICAgICAgdGhpcy50b2tlblJvb3QgPSBudWxsO1xyXG4gICAgICAgICAgICB0aGlzLndpdGhDcmVkZW50aWFscyA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLnByb3ZpZGVycyA9IHtcclxuICAgICAgICAgICAgICAgIGZhY2Vib29rOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogJ2ZhY2Vib29rJyxcclxuICAgICAgICAgICAgICAgICAgICB1cmw6ICcvYXV0aC9mYWNlYm9vaycsXHJcbiAgICAgICAgICAgICAgICAgICAgYXV0aG9yaXphdGlvbkVuZHBvaW50OiAnaHR0cHM6Ly93d3cuZmFjZWJvb2suY29tL3YyLjUvZGlhbG9nL29hdXRoJyxcclxuICAgICAgICAgICAgICAgICAgICByZWRpcmVjdFVyaTogd2luZG93LmxvY2F0aW9uLm9yaWdpbiArICcvJyxcclxuICAgICAgICAgICAgICAgICAgICByZXF1aXJlZFVybFBhcmFtczogWydkaXNwbGF5JywgJ3Njb3BlJ10sXHJcbiAgICAgICAgICAgICAgICAgICAgc2NvcGU6IFsnZW1haWwnXSxcclxuICAgICAgICAgICAgICAgICAgICBzY29wZURlbGltaXRlcjogJywnLFxyXG4gICAgICAgICAgICAgICAgICAgIGRpc3BsYXk6ICdwb3B1cCcsXHJcbiAgICAgICAgICAgICAgICAgICAgb2F1dGhUeXBlOiAnMi4wJyxcclxuICAgICAgICAgICAgICAgICAgICBwb3B1cE9wdGlvbnM6IHsgd2lkdGg6IDU4MCwgaGVpZ2h0OiA0MDAgfVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGdvb2dsZToge1xyXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6ICdnb29nbGUnLFxyXG4gICAgICAgICAgICAgICAgICAgIHVybDogJy9hdXRoL2dvb2dsZScsXHJcbiAgICAgICAgICAgICAgICAgICAgYXV0aG9yaXphdGlvbkVuZHBvaW50OiAnaHR0cHM6Ly9hY2NvdW50cy5nb29nbGUuY29tL28vb2F1dGgyL2F1dGgnLFxyXG4gICAgICAgICAgICAgICAgICAgIHJlZGlyZWN0VXJpOiB3aW5kb3cubG9jYXRpb24ub3JpZ2luLFxyXG4gICAgICAgICAgICAgICAgICAgIHJlcXVpcmVkVXJsUGFyYW1zOiBbJ3Njb3BlJ10sXHJcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9uYWxVcmxQYXJhbXM6IFsnZGlzcGxheScsICdzdGF0ZSddLFxyXG4gICAgICAgICAgICAgICAgICAgIHNjb3BlOiBbJ3Byb2ZpbGUnLCAnZW1haWwnXSxcclxuICAgICAgICAgICAgICAgICAgICBzY29wZVByZWZpeDogJ29wZW5pZCcsXHJcbiAgICAgICAgICAgICAgICAgICAgc2NvcGVEZWxpbWl0ZXI6ICcgJyxcclxuICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiAncG9wdXAnLFxyXG4gICAgICAgICAgICAgICAgICAgIG9hdXRoVHlwZTogJzIuMCcsXHJcbiAgICAgICAgICAgICAgICAgICAgcG9wdXBPcHRpb25zOiB7IHdpZHRoOiA0NTIsIGhlaWdodDogNjMzIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgc3RhdGU6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIGVuY29kZVVSSUNvbXBvbmVudChNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zdWJzdHIoMikpOyB9XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgZ2l0aHViOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogJ2dpdGh1YicsXHJcbiAgICAgICAgICAgICAgICAgICAgdXJsOiAnL2F1dGgvZ2l0aHViJyxcclxuICAgICAgICAgICAgICAgICAgICBhdXRob3JpemF0aW9uRW5kcG9pbnQ6ICdodHRwczovL2dpdGh1Yi5jb20vbG9naW4vb2F1dGgvYXV0aG9yaXplJyxcclxuICAgICAgICAgICAgICAgICAgICByZWRpcmVjdFVyaTogd2luZG93LmxvY2F0aW9uLm9yaWdpbixcclxuICAgICAgICAgICAgICAgICAgICBvcHRpb25hbFVybFBhcmFtczogWydzY29wZSddLFxyXG4gICAgICAgICAgICAgICAgICAgIHNjb3BlOiBbJ3VzZXI6ZW1haWwnXSxcclxuICAgICAgICAgICAgICAgICAgICBzY29wZURlbGltaXRlcjogJyAnLFxyXG4gICAgICAgICAgICAgICAgICAgIG9hdXRoVHlwZTogJzIuMCcsXHJcbiAgICAgICAgICAgICAgICAgICAgcG9wdXBPcHRpb25zOiB7IHdpZHRoOiAxMDIwLCBoZWlnaHQ6IDYxOCB9XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgaW5zdGFncmFtOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogJ2luc3RhZ3JhbScsXHJcbiAgICAgICAgICAgICAgICAgICAgdXJsOiAnL2F1dGgvaW5zdGFncmFtJyxcclxuICAgICAgICAgICAgICAgICAgICBhdXRob3JpemF0aW9uRW5kcG9pbnQ6ICdodHRwczovL2FwaS5pbnN0YWdyYW0uY29tL29hdXRoL2F1dGhvcml6ZScsXHJcbiAgICAgICAgICAgICAgICAgICAgcmVkaXJlY3RVcmk6IHdpbmRvdy5sb2NhdGlvbi5vcmlnaW4sXHJcbiAgICAgICAgICAgICAgICAgICAgcmVxdWlyZWRVcmxQYXJhbXM6IFsnc2NvcGUnXSxcclxuICAgICAgICAgICAgICAgICAgICBzY29wZTogWydiYXNpYyddLFxyXG4gICAgICAgICAgICAgICAgICAgIHNjb3BlRGVsaW1pdGVyOiAnKycsXHJcbiAgICAgICAgICAgICAgICAgICAgb2F1dGhUeXBlOiAnMi4wJ1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGxpbmtlZGluOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogJ2xpbmtlZGluJyxcclxuICAgICAgICAgICAgICAgICAgICB1cmw6ICcvYXV0aC9saW5rZWRpbicsXHJcbiAgICAgICAgICAgICAgICAgICAgYXV0aG9yaXphdGlvbkVuZHBvaW50OiAnaHR0cHM6Ly93d3cubGlua2VkaW4uY29tL3Vhcy9vYXV0aDIvYXV0aG9yaXphdGlvbicsXHJcbiAgICAgICAgICAgICAgICAgICAgcmVkaXJlY3RVcmk6IHdpbmRvdy5sb2NhdGlvbi5vcmlnaW4sXHJcbiAgICAgICAgICAgICAgICAgICAgcmVxdWlyZWRVcmxQYXJhbXM6IFsnc3RhdGUnXSxcclxuICAgICAgICAgICAgICAgICAgICBzY29wZTogWydyX2VtYWlsYWRkcmVzcyddLFxyXG4gICAgICAgICAgICAgICAgICAgIHNjb3BlRGVsaW1pdGVyOiAnICcsXHJcbiAgICAgICAgICAgICAgICAgICAgc3RhdGU6ICdTVEFURScsXHJcbiAgICAgICAgICAgICAgICAgICAgb2F1dGhUeXBlOiAnMi4wJyxcclxuICAgICAgICAgICAgICAgICAgICBwb3B1cE9wdGlvbnM6IHsgd2lkdGg6IDUyNywgaGVpZ2h0OiA1ODIgfVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHR3aXR0ZXI6IHtcclxuICAgICAgICAgICAgICAgICAgICBuYW1lOiAndHdpdHRlcicsXHJcbiAgICAgICAgICAgICAgICAgICAgdXJsOiAnL2F1dGgvdHdpdHRlcicsXHJcbiAgICAgICAgICAgICAgICAgICAgYXV0aG9yaXphdGlvbkVuZHBvaW50OiAnaHR0cHM6Ly9hcGkudHdpdHRlci5jb20vb2F1dGgvYXV0aGVudGljYXRlJyxcclxuICAgICAgICAgICAgICAgICAgICByZWRpcmVjdFVyaTogd2luZG93LmxvY2F0aW9uLm9yaWdpbixcclxuICAgICAgICAgICAgICAgICAgICBvYXV0aFR5cGU6ICcxLjAnLFxyXG4gICAgICAgICAgICAgICAgICAgIHBvcHVwT3B0aW9uczogeyB3aWR0aDogNDk1LCBoZWlnaHQ6IDY0NSB9XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgdHdpdGNoOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogJ3R3aXRjaCcsXHJcbiAgICAgICAgICAgICAgICAgICAgdXJsOiAnL2F1dGgvdHdpdGNoJyxcclxuICAgICAgICAgICAgICAgICAgICBhdXRob3JpemF0aW9uRW5kcG9pbnQ6ICdodHRwczovL2FwaS50d2l0Y2gudHYva3Jha2VuL29hdXRoMi9hdXRob3JpemUnLFxyXG4gICAgICAgICAgICAgICAgICAgIHJlZGlyZWN0VXJpOiB3aW5kb3cubG9jYXRpb24ub3JpZ2luLFxyXG4gICAgICAgICAgICAgICAgICAgIHJlcXVpcmVkVXJsUGFyYW1zOiBbJ3Njb3BlJ10sXHJcbiAgICAgICAgICAgICAgICAgICAgc2NvcGU6IFsndXNlcl9yZWFkJ10sXHJcbiAgICAgICAgICAgICAgICAgICAgc2NvcGVEZWxpbWl0ZXI6ICcgJyxcclxuICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiAncG9wdXAnLFxyXG4gICAgICAgICAgICAgICAgICAgIG9hdXRoVHlwZTogJzIuMCcsXHJcbiAgICAgICAgICAgICAgICAgICAgcG9wdXBPcHRpb25zOiB7IHdpZHRoOiA1MDAsIGhlaWdodDogNTYwIH1cclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBsaXZlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogJ2xpdmUnLFxyXG4gICAgICAgICAgICAgICAgICAgIHVybDogJy9hdXRoL2xpdmUnLFxyXG4gICAgICAgICAgICAgICAgICAgIGF1dGhvcml6YXRpb25FbmRwb2ludDogJ2h0dHBzOi8vbG9naW4ubGl2ZS5jb20vb2F1dGgyMF9hdXRob3JpemUuc3JmJyxcclxuICAgICAgICAgICAgICAgICAgICByZWRpcmVjdFVyaTogd2luZG93LmxvY2F0aW9uLm9yaWdpbixcclxuICAgICAgICAgICAgICAgICAgICByZXF1aXJlZFVybFBhcmFtczogWydkaXNwbGF5JywgJ3Njb3BlJ10sXHJcbiAgICAgICAgICAgICAgICAgICAgc2NvcGU6IFsnd2wuZW1haWxzJ10sXHJcbiAgICAgICAgICAgICAgICAgICAgc2NvcGVEZWxpbWl0ZXI6ICcgJyxcclxuICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiAncG9wdXAnLFxyXG4gICAgICAgICAgICAgICAgICAgIG9hdXRoVHlwZTogJzIuMCcsXHJcbiAgICAgICAgICAgICAgICAgICAgcG9wdXBPcHRpb25zOiB7IHdpZHRoOiA1MDAsIGhlaWdodDogNTYwIH1cclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICB5YWhvbzoge1xyXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6ICd5YWhvbycsXHJcbiAgICAgICAgICAgICAgICAgICAgdXJsOiAnL2F1dGgveWFob28nLFxyXG4gICAgICAgICAgICAgICAgICAgIGF1dGhvcml6YXRpb25FbmRwb2ludDogJ2h0dHBzOi8vYXBpLmxvZ2luLnlhaG9vLmNvbS9vYXV0aDIvcmVxdWVzdF9hdXRoJyxcclxuICAgICAgICAgICAgICAgICAgICByZWRpcmVjdFVyaTogd2luZG93LmxvY2F0aW9uLm9yaWdpbixcclxuICAgICAgICAgICAgICAgICAgICBzY29wZTogW10sXHJcbiAgICAgICAgICAgICAgICAgICAgc2NvcGVEZWxpbWl0ZXI6ICcsJyxcclxuICAgICAgICAgICAgICAgICAgICBvYXV0aFR5cGU6ICcyLjAnLFxyXG4gICAgICAgICAgICAgICAgICAgIHBvcHVwT3B0aW9uczogeyB3aWR0aDogNTU5LCBoZWlnaHQ6IDUxOSB9XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgYml0YnVja2V0OiB7XHJcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogJ2JpdGJ1Y2tldCcsXHJcbiAgICAgICAgICAgICAgICAgICAgdXJsOiAnL2F1dGgvYml0YnVja2V0JyxcclxuICAgICAgICAgICAgICAgICAgICBhdXRob3JpemF0aW9uRW5kcG9pbnQ6ICdodHRwczovL2JpdGJ1Y2tldC5vcmcvc2l0ZS9vYXV0aDIvYXV0aG9yaXplJyxcclxuICAgICAgICAgICAgICAgICAgICByZWRpcmVjdFVyaTogd2luZG93LmxvY2F0aW9uLm9yaWdpbiArICcvJyxcclxuICAgICAgICAgICAgICAgICAgICByZXF1aXJlZFVybFBhcmFtczogWydzY29wZSddLFxyXG4gICAgICAgICAgICAgICAgICAgIHNjb3BlOiBbJ2VtYWlsJ10sXHJcbiAgICAgICAgICAgICAgICAgICAgc2NvcGVEZWxpbWl0ZXI6ICcgJyxcclxuICAgICAgICAgICAgICAgICAgICBvYXV0aFR5cGU6ICcyLjAnLFxyXG4gICAgICAgICAgICAgICAgICAgIHBvcHVwT3B0aW9uczogeyB3aWR0aDogMTAyOCwgaGVpZ2h0OiA1MjkgfVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHNwb3RpZnk6IHtcclxuICAgICAgICAgICAgICAgICAgICBuYW1lOiAnc3BvdGlmeScsXHJcbiAgICAgICAgICAgICAgICAgICAgdXJsOiAnL2F1dGgvc3BvdGlmeScsXHJcbiAgICAgICAgICAgICAgICAgICAgYXV0aG9yaXphdGlvbkVuZHBvaW50OiAnaHR0cHM6Ly9hY2NvdW50cy5zcG90aWZ5LmNvbS9hdXRob3JpemUnLFxyXG4gICAgICAgICAgICAgICAgICAgIHJlZGlyZWN0VXJpOiB3aW5kb3cubG9jYXRpb24ub3JpZ2luLFxyXG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbmFsVXJsUGFyYW1zOiBbJ3N0YXRlJ10sXHJcbiAgICAgICAgICAgICAgICAgICAgcmVxdWlyZWRVcmxQYXJhbXM6IFsnc2NvcGUnXSxcclxuICAgICAgICAgICAgICAgICAgICBzY29wZTogWyd1c2VyLXJlYWQtZW1haWwnXSxcclxuICAgICAgICAgICAgICAgICAgICBzY29wZVByZWZpeDogJycsXHJcbiAgICAgICAgICAgICAgICAgICAgc2NvcGVEZWxpbWl0ZXI6ICcsJyxcclxuICAgICAgICAgICAgICAgICAgICBvYXV0aFR5cGU6ICcyLjAnLFxyXG4gICAgICAgICAgICAgICAgICAgIHBvcHVwT3B0aW9uczogeyB3aWR0aDogNTAwLCBoZWlnaHQ6IDUzMCB9LFxyXG4gICAgICAgICAgICAgICAgICAgIHN0YXRlOiBmdW5jdGlvbiAoKSB7IHJldHVybiBlbmNvZGVVUklDb21wb25lbnQoTWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc3Vic3RyKDIpKTsgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICB0aGlzLmh0dHBJbnRlcmNlcHRvciA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRydWU7IH07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShDb25maWcsIFwiZ2V0Q29uc3RhbnRcIiwge1xyXG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgQ29uZmlnKCk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXHJcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiBDb25maWc7XHJcbiAgICB9KCkpO1xyXG4gICAgO1xyXG5cclxuICAgIHZhciBBdXRoUHJvdmlkZXIgPSAoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGZ1bmN0aW9uIEF1dGhQcm92aWRlcihTYXRlbGxpemVyQ29uZmlnKSB7XHJcbiAgICAgICAgICAgIHRoaXMuU2F0ZWxsaXplckNvbmZpZyA9IFNhdGVsbGl6ZXJDb25maWc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShBdXRoUHJvdmlkZXIucHJvdG90eXBlLCBcImJhc2VVcmxcIiwge1xyXG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMuU2F0ZWxsaXplckNvbmZpZy5iYXNlVXJsOyB9LFxyXG4gICAgICAgICAgICBzZXQ6IGZ1bmN0aW9uICh2YWx1ZSkgeyB0aGlzLlNhdGVsbGl6ZXJDb25maWcuYmFzZVVybCA9IHZhbHVlOyB9LFxyXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxyXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcclxuICAgICAgICB9KTtcclxuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoQXV0aFByb3ZpZGVyLnByb3RvdHlwZSwgXCJsb2dpblVybFwiLCB7XHJcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy5TYXRlbGxpemVyQ29uZmlnLmxvZ2luVXJsOyB9LFxyXG4gICAgICAgICAgICBzZXQ6IGZ1bmN0aW9uICh2YWx1ZSkgeyB0aGlzLlNhdGVsbGl6ZXJDb25maWcubG9naW5VcmwgPSB2YWx1ZTsgfSxcclxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcclxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KEF1dGhQcm92aWRlci5wcm90b3R5cGUsIFwic2lnbnVwVXJsXCIsIHtcclxuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLlNhdGVsbGl6ZXJDb25maWcuc2lnbnVwVXJsOyB9LFxyXG4gICAgICAgICAgICBzZXQ6IGZ1bmN0aW9uICh2YWx1ZSkgeyB0aGlzLlNhdGVsbGl6ZXJDb25maWcuc2lnbnVwVXJsID0gdmFsdWU7IH0sXHJcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXHJcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShBdXRoUHJvdmlkZXIucHJvdG90eXBlLCBcInVubGlua1VybFwiLCB7XHJcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy5TYXRlbGxpemVyQ29uZmlnLnVubGlua1VybDsgfSxcclxuICAgICAgICAgICAgc2V0OiBmdW5jdGlvbiAodmFsdWUpIHsgdGhpcy5TYXRlbGxpemVyQ29uZmlnLnVubGlua1VybCA9IHZhbHVlOyB9LFxyXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxyXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcclxuICAgICAgICB9KTtcclxuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoQXV0aFByb3ZpZGVyLnByb3RvdHlwZSwgXCJ0b2tlblJvb3RcIiwge1xyXG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMuU2F0ZWxsaXplckNvbmZpZy50b2tlblJvb3Q7IH0sXHJcbiAgICAgICAgICAgIHNldDogZnVuY3Rpb24gKHZhbHVlKSB7IHRoaXMuU2F0ZWxsaXplckNvbmZpZy50b2tlblJvb3QgPSB2YWx1ZTsgfSxcclxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcclxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KEF1dGhQcm92aWRlci5wcm90b3R5cGUsIFwidG9rZW5OYW1lXCIsIHtcclxuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLlNhdGVsbGl6ZXJDb25maWcudG9rZW5OYW1lOyB9LFxyXG4gICAgICAgICAgICBzZXQ6IGZ1bmN0aW9uICh2YWx1ZSkgeyB0aGlzLlNhdGVsbGl6ZXJDb25maWcudG9rZW5OYW1lID0gdmFsdWU7IH0sXHJcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXHJcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShBdXRoUHJvdmlkZXIucHJvdG90eXBlLCBcInRva2VuUHJlZml4XCIsIHtcclxuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLlNhdGVsbGl6ZXJDb25maWcudG9rZW5QcmVmaXg7IH0sXHJcbiAgICAgICAgICAgIHNldDogZnVuY3Rpb24gKHZhbHVlKSB7IHRoaXMuU2F0ZWxsaXplckNvbmZpZy50b2tlblByZWZpeCA9IHZhbHVlOyB9LFxyXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxyXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcclxuICAgICAgICB9KTtcclxuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoQXV0aFByb3ZpZGVyLnByb3RvdHlwZSwgXCJ0b2tlbkhlYWRlclwiLCB7XHJcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy5TYXRlbGxpemVyQ29uZmlnLnRva2VuSGVhZGVyOyB9LFxyXG4gICAgICAgICAgICBzZXQ6IGZ1bmN0aW9uICh2YWx1ZSkgeyB0aGlzLlNhdGVsbGl6ZXJDb25maWcudG9rZW5IZWFkZXIgPSB2YWx1ZTsgfSxcclxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcclxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KEF1dGhQcm92aWRlci5wcm90b3R5cGUsIFwidG9rZW5UeXBlXCIsIHtcclxuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLlNhdGVsbGl6ZXJDb25maWcudG9rZW5UeXBlOyB9LFxyXG4gICAgICAgICAgICBzZXQ6IGZ1bmN0aW9uICh2YWx1ZSkgeyB0aGlzLlNhdGVsbGl6ZXJDb25maWcudG9rZW5UeXBlID0gdmFsdWU7IH0sXHJcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXHJcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShBdXRoUHJvdmlkZXIucHJvdG90eXBlLCBcIndpdGhDcmVkZW50aWFsc1wiLCB7XHJcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy5TYXRlbGxpemVyQ29uZmlnLndpdGhDcmVkZW50aWFsczsgfSxcclxuICAgICAgICAgICAgc2V0OiBmdW5jdGlvbiAodmFsdWUpIHsgdGhpcy5TYXRlbGxpemVyQ29uZmlnLndpdGhDcmVkZW50aWFscyA9IHZhbHVlOyB9LFxyXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxyXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcclxuICAgICAgICB9KTtcclxuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoQXV0aFByb3ZpZGVyLnByb3RvdHlwZSwgXCJzdG9yYWdlVHlwZVwiLCB7XHJcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy5TYXRlbGxpemVyQ29uZmlnLnN0b3JhZ2VUeXBlOyB9LFxyXG4gICAgICAgICAgICBzZXQ6IGZ1bmN0aW9uICh2YWx1ZSkgeyB0aGlzLlNhdGVsbGl6ZXJDb25maWcuc3RvcmFnZVR5cGUgPSB2YWx1ZTsgfSxcclxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcclxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KEF1dGhQcm92aWRlci5wcm90b3R5cGUsIFwiaHR0cEludGVyY2VwdG9yXCIsIHtcclxuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLlNhdGVsbGl6ZXJDb25maWcuaHR0cEludGVyY2VwdG9yOyB9LFxyXG4gICAgICAgICAgICBzZXQ6IGZ1bmN0aW9uICh2YWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuU2F0ZWxsaXplckNvbmZpZy5odHRwSW50ZXJjZXB0b3IgPSB2YWx1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuU2F0ZWxsaXplckNvbmZpZy5odHRwSW50ZXJjZXB0b3IgPSBmdW5jdGlvbiAoKSB7IHJldHVybiB2YWx1ZTsgfTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcclxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgQXV0aFByb3ZpZGVyLnByb3RvdHlwZS5mYWNlYm9vayA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XHJcbiAgICAgICAgICAgIGFuZ3VsYXIuZXh0ZW5kKHRoaXMuU2F0ZWxsaXplckNvbmZpZy5wcm92aWRlcnMuZmFjZWJvb2ssIG9wdGlvbnMpO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgQXV0aFByb3ZpZGVyLnByb3RvdHlwZS5nb29nbGUgPSBmdW5jdGlvbiAob3B0aW9ucykge1xyXG4gICAgICAgICAgICBhbmd1bGFyLmV4dGVuZCh0aGlzLlNhdGVsbGl6ZXJDb25maWcucHJvdmlkZXJzLmdvb2dsZSwgb3B0aW9ucyk7XHJcbiAgICAgICAgfTtcclxuICAgICAgICBBdXRoUHJvdmlkZXIucHJvdG90eXBlLmdpdGh1YiA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XHJcbiAgICAgICAgICAgIGFuZ3VsYXIuZXh0ZW5kKHRoaXMuU2F0ZWxsaXplckNvbmZpZy5wcm92aWRlcnMuZ2l0aHViLCBvcHRpb25zKTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIEF1dGhQcm92aWRlci5wcm90b3R5cGUuaW5zdGFncmFtID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcclxuICAgICAgICAgICAgYW5ndWxhci5leHRlbmQodGhpcy5TYXRlbGxpemVyQ29uZmlnLnByb3ZpZGVycy5pbnN0YWdyYW0sIG9wdGlvbnMpO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgQXV0aFByb3ZpZGVyLnByb3RvdHlwZS5saW5rZWRpbiA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XHJcbiAgICAgICAgICAgIGFuZ3VsYXIuZXh0ZW5kKHRoaXMuU2F0ZWxsaXplckNvbmZpZy5wcm92aWRlcnMubGlua2VkaW4sIG9wdGlvbnMpO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgQXV0aFByb3ZpZGVyLnByb3RvdHlwZS50d2l0dGVyID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcclxuICAgICAgICAgICAgYW5ndWxhci5leHRlbmQodGhpcy5TYXRlbGxpemVyQ29uZmlnLnByb3ZpZGVycy50d2l0dGVyLCBvcHRpb25zKTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIEF1dGhQcm92aWRlci5wcm90b3R5cGUudHdpdGNoID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcclxuICAgICAgICAgICAgYW5ndWxhci5leHRlbmQodGhpcy5TYXRlbGxpemVyQ29uZmlnLnByb3ZpZGVycy50d2l0Y2gsIG9wdGlvbnMpO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgQXV0aFByb3ZpZGVyLnByb3RvdHlwZS5saXZlID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcclxuICAgICAgICAgICAgYW5ndWxhci5leHRlbmQodGhpcy5TYXRlbGxpemVyQ29uZmlnLnByb3ZpZGVycy5saXZlLCBvcHRpb25zKTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIEF1dGhQcm92aWRlci5wcm90b3R5cGUueWFob28gPSBmdW5jdGlvbiAob3B0aW9ucykge1xyXG4gICAgICAgICAgICBhbmd1bGFyLmV4dGVuZCh0aGlzLlNhdGVsbGl6ZXJDb25maWcucHJvdmlkZXJzLnlhaG9vLCBvcHRpb25zKTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIEF1dGhQcm92aWRlci5wcm90b3R5cGUuYml0YnVja2V0ID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcclxuICAgICAgICAgICAgYW5ndWxhci5leHRlbmQodGhpcy5TYXRlbGxpemVyQ29uZmlnLnByb3ZpZGVycy5iaXRidWNrZXQsIG9wdGlvbnMpO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgQXV0aFByb3ZpZGVyLnByb3RvdHlwZS5zcG90aWZ5ID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcclxuICAgICAgICAgICAgYW5ndWxhci5leHRlbmQodGhpcy5TYXRlbGxpemVyQ29uZmlnLnByb3ZpZGVycy5zcG90aWZ5LCBvcHRpb25zKTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIEF1dGhQcm92aWRlci5wcm90b3R5cGUub2F1dGgxID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcclxuICAgICAgICAgICAgdGhpcy5TYXRlbGxpemVyQ29uZmlnLnByb3ZpZGVyc1tvcHRpb25zLm5hbWVdID0gYW5ndWxhci5leHRlbmQob3B0aW9ucywge1xyXG4gICAgICAgICAgICAgICAgb2F1dGhUeXBlOiAnMS4wJ1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIEF1dGhQcm92aWRlci5wcm90b3R5cGUub2F1dGgyID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcclxuICAgICAgICAgICAgdGhpcy5TYXRlbGxpemVyQ29uZmlnLnByb3ZpZGVyc1tvcHRpb25zLm5hbWVdID0gYW5ndWxhci5leHRlbmQob3B0aW9ucywge1xyXG4gICAgICAgICAgICAgICAgb2F1dGhUeXBlOiAnMi4wJ1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIEF1dGhQcm92aWRlci5wcm90b3R5cGUuJGdldCA9IGZ1bmN0aW9uIChTYXRlbGxpemVyU2hhcmVkLCBTYXRlbGxpemVyTG9jYWwsIFNhdGVsbGl6ZXJPQXV0aCkge1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgbG9naW46IGZ1bmN0aW9uICh1c2VyLCBvcHRpb25zKSB7IHJldHVybiBTYXRlbGxpemVyTG9jYWwubG9naW4odXNlciwgb3B0aW9ucyk7IH0sXHJcbiAgICAgICAgICAgICAgICBzaWdudXA6IGZ1bmN0aW9uICh1c2VyLCBvcHRpb25zKSB7IHJldHVybiBTYXRlbGxpemVyTG9jYWwuc2lnbnVwKHVzZXIsIG9wdGlvbnMpOyB9LFxyXG4gICAgICAgICAgICAgICAgbG9nb3V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiBTYXRlbGxpemVyU2hhcmVkLmxvZ291dCgpOyB9LFxyXG4gICAgICAgICAgICAgICAgYXV0aGVudGljYXRlOiBmdW5jdGlvbiAobmFtZSwgZGF0YSkgeyByZXR1cm4gU2F0ZWxsaXplck9BdXRoLmF1dGhlbnRpY2F0ZShuYW1lLCBkYXRhKTsgfSxcclxuICAgICAgICAgICAgICAgIGxpbms6IGZ1bmN0aW9uIChuYW1lLCBkYXRhKSB7IHJldHVybiBTYXRlbGxpemVyT0F1dGguYXV0aGVudGljYXRlKG5hbWUsIGRhdGEpOyB9LFxyXG4gICAgICAgICAgICAgICAgdW5saW5rOiBmdW5jdGlvbiAobmFtZSwgb3B0aW9ucykgeyByZXR1cm4gU2F0ZWxsaXplck9BdXRoLnVubGluayhuYW1lLCBvcHRpb25zKTsgfSxcclxuICAgICAgICAgICAgICAgIGlzQXV0aGVudGljYXRlZDogZnVuY3Rpb24gKCkgeyByZXR1cm4gU2F0ZWxsaXplclNoYXJlZC5pc0F1dGhlbnRpY2F0ZWQoKTsgfSxcclxuICAgICAgICAgICAgICAgIGdldFBheWxvYWQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIFNhdGVsbGl6ZXJTaGFyZWQuZ2V0UGF5bG9hZCgpOyB9LFxyXG4gICAgICAgICAgICAgICAgZ2V0VG9rZW46IGZ1bmN0aW9uICgpIHsgcmV0dXJuIFNhdGVsbGl6ZXJTaGFyZWQuZ2V0VG9rZW4oKTsgfSxcclxuICAgICAgICAgICAgICAgIHNldFRva2VuOiBmdW5jdGlvbiAodG9rZW4pIHsgcmV0dXJuIFNhdGVsbGl6ZXJTaGFyZWQuc2V0VG9rZW4oeyBhY2Nlc3NfdG9rZW46IHRva2VuIH0pOyB9LFxyXG4gICAgICAgICAgICAgICAgcmVtb3ZlVG9rZW46IGZ1bmN0aW9uICgpIHsgcmV0dXJuIFNhdGVsbGl6ZXJTaGFyZWQucmVtb3ZlVG9rZW4oKTsgfSxcclxuICAgICAgICAgICAgICAgIHNldFN0b3JhZ2VUeXBlOiBmdW5jdGlvbiAodHlwZSkgeyByZXR1cm4gU2F0ZWxsaXplclNoYXJlZC5zZXRTdG9yYWdlVHlwZSh0eXBlKTsgfVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgQXV0aFByb3ZpZGVyLiRpbmplY3QgPSBbJ1NhdGVsbGl6ZXJDb25maWcnXTtcclxuICAgICAgICByZXR1cm4gQXV0aFByb3ZpZGVyO1xyXG4gICAgfSgpKTtcclxuICAgIEF1dGhQcm92aWRlci5wcm90b3R5cGUuJGdldC4kaW5qZWN0ID0gWydTYXRlbGxpemVyU2hhcmVkJywgJ1NhdGVsbGl6ZXJMb2NhbCcsICdTYXRlbGxpemVyT0F1dGgnXTtcclxuXHJcbiAgICBmdW5jdGlvbiBqb2luVXJsKGJhc2VVcmwsIHVybCkge1xyXG4gICAgICAgIGlmICgvXig/OlthLXpdKzopP1xcL1xcLy9pLnRlc3QodXJsKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdXJsO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgam9pbmVkID0gW2Jhc2VVcmwsIHVybF0uam9pbignLycpO1xyXG4gICAgICAgIHZhciBub3JtYWxpemUgPSBmdW5jdGlvbiAoc3RyKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBzdHJcclxuICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9bXFwvXSsvZywgJy8nKVxyXG4gICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xcL1xcPy9nLCAnPycpXHJcbiAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFwvXFwjL2csICcjJylcclxuICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXDpcXC8vZywgJzovLycpO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgcmV0dXJuIG5vcm1hbGl6ZShqb2luZWQpO1xyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gZ2V0RnVsbFVybFBhdGgobG9jYXRpb24pIHtcclxuICAgICAgICB2YXIgaXNIdHRwcyA9IGxvY2F0aW9uLnByb3RvY29sID09PSAnaHR0cHM6JztcclxuICAgICAgICByZXR1cm4gbG9jYXRpb24ucHJvdG9jb2wgKyAnLy8nICsgbG9jYXRpb24uaG9zdG5hbWUgK1xyXG4gICAgICAgICAgICAnOicgKyAobG9jYXRpb24ucG9ydCB8fCAoaXNIdHRwcyA/ICc0NDMnIDogJzgwJykpICtcclxuICAgICAgICAgICAgKC9eXFwvLy50ZXN0KGxvY2F0aW9uLnBhdGhuYW1lKSA/IGxvY2F0aW9uLnBhdGhuYW1lIDogJy8nICsgbG9jYXRpb24ucGF0aG5hbWUpO1xyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gcGFyc2VRdWVyeVN0cmluZyhzdHIpIHtcclxuICAgICAgICB2YXIgb2JqID0ge307XHJcbiAgICAgICAgdmFyIGtleTtcclxuICAgICAgICB2YXIgdmFsdWU7XHJcbiAgICAgICAgYW5ndWxhci5mb3JFYWNoKChzdHIgfHwgJycpLnNwbGl0KCcmJyksIGZ1bmN0aW9uIChrZXlWYWx1ZSkge1xyXG4gICAgICAgICAgICBpZiAoa2V5VmFsdWUpIHtcclxuICAgICAgICAgICAgICAgIHZhbHVlID0ga2V5VmFsdWUuc3BsaXQoJz0nKTtcclxuICAgICAgICAgICAgICAgIGtleSA9IGRlY29kZVVSSUNvbXBvbmVudCh2YWx1ZVswXSk7XHJcbiAgICAgICAgICAgICAgICBvYmpba2V5XSA9IGFuZ3VsYXIuaXNEZWZpbmVkKHZhbHVlWzFdKSA/IGRlY29kZVVSSUNvbXBvbmVudCh2YWx1ZVsxXSkgOiB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIG9iajtcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIGRlY29kZUJhc2U2NChzdHIpIHtcclxuICAgICAgICB2YXIgYnVmZmVyO1xyXG4gICAgICAgIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyAmJiBtb2R1bGUuZXhwb3J0cykge1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgYnVmZmVyID0gcmVxdWlyZSgnYnVmZmVyJykuQnVmZmVyO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhdGNoIChlcnIpIHtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgZnJvbUNoYXJDb2RlID0gU3RyaW5nLmZyb21DaGFyQ29kZTtcclxuICAgICAgICB2YXIgcmVfYnRvdSA9IG5ldyBSZWdFeHAoW1xyXG4gICAgICAgICAgICAnW1xceEMwLVxceERGXVtcXHg4MC1cXHhCRl0nLFxyXG4gICAgICAgICAgICAnW1xceEUwLVxceEVGXVtcXHg4MC1cXHhCRl17Mn0nLFxyXG4gICAgICAgICAgICAnW1xceEYwLVxceEY3XVtcXHg4MC1cXHhCRl17M30nXHJcbiAgICAgICAgXS5qb2luKCd8JyksICdnJyk7XHJcbiAgICAgICAgdmFyIGNiX2J0b3UgPSBmdW5jdGlvbiAoY2NjYykge1xyXG4gICAgICAgICAgICBzd2l0Y2ggKGNjY2MubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDQ6XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGNwID0gKCgweDA3ICYgY2NjYy5jaGFyQ29kZUF0KDApKSA8PCAxOClcclxuICAgICAgICAgICAgICAgICAgICAgICAgfCAoKDB4M2YgJiBjY2NjLmNoYXJDb2RlQXQoMSkpIDw8IDEyKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB8ICgoMHgzZiAmIGNjY2MuY2hhckNvZGVBdCgyKSkgPDwgNilcclxuICAgICAgICAgICAgICAgICAgICAgICAgfCAoMHgzZiAmIGNjY2MuY2hhckNvZGVBdCgzKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIG9mZnNldCA9IGNwIC0gMHgxMDAwMDtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gKGZyb21DaGFyQ29kZSgob2Zmc2V0ID4+PiAxMCkgKyAweEQ4MDApXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICsgZnJvbUNoYXJDb2RlKChvZmZzZXQgJiAweDNGRikgKyAweERDMDApKTtcclxuICAgICAgICAgICAgICAgIGNhc2UgMzpcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZnJvbUNoYXJDb2RlKCgoMHgwZiAmIGNjY2MuY2hhckNvZGVBdCgwKSkgPDwgMTIpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHwgKCgweDNmICYgY2NjYy5jaGFyQ29kZUF0KDEpKSA8PCA2KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB8ICgweDNmICYgY2NjYy5jaGFyQ29kZUF0KDIpKSk7XHJcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmcm9tQ2hhckNvZGUoKCgweDFmICYgY2NjYy5jaGFyQ29kZUF0KDApKSA8PCA2KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB8ICgweDNmICYgY2NjYy5jaGFyQ29kZUF0KDEpKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgICAgIHZhciBidG91ID0gZnVuY3Rpb24gKGIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGIucmVwbGFjZShyZV9idG91LCBjYl9idG91KTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIHZhciBfZGVjb2RlID0gYnVmZmVyID8gZnVuY3Rpb24gKGEpIHtcclxuICAgICAgICAgICAgcmV0dXJuIChhLmNvbnN0cnVjdG9yID09PSBidWZmZXIuY29uc3RydWN0b3JcclxuICAgICAgICAgICAgICAgID8gYSA6IG5ldyBidWZmZXIoYSwgJ2Jhc2U2NCcpKS50b1N0cmluZygpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAgICAgOiBmdW5jdGlvbiAoYSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGJ0b3UoYXRvYihhKSk7XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgcmV0dXJuIF9kZWNvZGUoU3RyaW5nKHN0cikucmVwbGFjZSgvWy1fXS9nLCBmdW5jdGlvbiAobTApIHtcclxuICAgICAgICAgICAgcmV0dXJuIG0wID09PSAnLScgPyAnKycgOiAnLyc7XHJcbiAgICAgICAgfSlcclxuICAgICAgICAgICAgLnJlcGxhY2UoL1teQS1aYS16MC05XFwrXFwvXS9nLCAnJykpO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBTaGFyZWQgPSAoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGZ1bmN0aW9uIFNoYXJlZCgkcSwgJHdpbmRvdywgU2F0ZWxsaXplckNvbmZpZywgU2F0ZWxsaXplclN0b3JhZ2UpIHtcclxuICAgICAgICAgICAgdGhpcy4kcSA9ICRxO1xyXG4gICAgICAgICAgICB0aGlzLiR3aW5kb3cgPSAkd2luZG93O1xyXG4gICAgICAgICAgICB0aGlzLlNhdGVsbGl6ZXJDb25maWcgPSBTYXRlbGxpemVyQ29uZmlnO1xyXG4gICAgICAgICAgICB0aGlzLlNhdGVsbGl6ZXJTdG9yYWdlID0gU2F0ZWxsaXplclN0b3JhZ2U7XHJcbiAgICAgICAgICAgIHZhciBfYSA9IHRoaXMuU2F0ZWxsaXplckNvbmZpZywgdG9rZW5OYW1lID0gX2EudG9rZW5OYW1lLCB0b2tlblByZWZpeCA9IF9hLnRva2VuUHJlZml4O1xyXG4gICAgICAgICAgICB0aGlzLnByZWZpeGVkVG9rZW5OYW1lID0gdG9rZW5QcmVmaXggPyBbdG9rZW5QcmVmaXgsIHRva2VuTmFtZV0uam9pbignXycpIDogdG9rZW5OYW1lO1xyXG4gICAgICAgIH1cclxuICAgICAgICBTaGFyZWQucHJvdG90eXBlLmdldFRva2VuID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5TYXRlbGxpemVyU3RvcmFnZS5nZXQodGhpcy5wcmVmaXhlZFRva2VuTmFtZSk7XHJcbiAgICAgICAgfTtcclxuICAgICAgICBTaGFyZWQucHJvdG90eXBlLmdldFBheWxvYWQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciB0b2tlbiA9IHRoaXMuU2F0ZWxsaXplclN0b3JhZ2UuZ2V0KHRoaXMucHJlZml4ZWRUb2tlbk5hbWUpO1xyXG4gICAgICAgICAgICBpZiAodG9rZW4gJiYgdG9rZW4uc3BsaXQoJy4nKS5sZW5ndGggPT09IDMpIHtcclxuICAgICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGJhc2U2NFVybCA9IHRva2VuLnNwbGl0KCcuJylbMV07XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGJhc2U2NCA9IGJhc2U2NFVybC5yZXBsYWNlKCctJywgJysnKS5yZXBsYWNlKCdfJywgJy8nKTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gSlNPTi5wYXJzZShkZWNvZGVCYXNlNjQoYmFzZTY0KSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgICAgICBTaGFyZWQucHJvdG90eXBlLnNldFRva2VuID0gZnVuY3Rpb24gKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgIHZhciB0b2tlblJvb3QgPSB0aGlzLlNhdGVsbGl6ZXJDb25maWcudG9rZW5Sb290O1xyXG4gICAgICAgICAgICB2YXIgdG9rZW5OYW1lID0gdGhpcy5TYXRlbGxpemVyQ29uZmlnLnRva2VuTmFtZTtcclxuICAgICAgICAgICAgdmFyIGFjY2Vzc1Rva2VuID0gcmVzcG9uc2UgJiYgcmVzcG9uc2UuYWNjZXNzX3Rva2VuO1xyXG4gICAgICAgICAgICB2YXIgdG9rZW47XHJcbiAgICAgICAgICAgIGlmIChhY2Nlc3NUb2tlbikge1xyXG4gICAgICAgICAgICAgICAgaWYgKGFuZ3VsYXIuaXNPYmplY3QoYWNjZXNzVG9rZW4pICYmIGFuZ3VsYXIuaXNPYmplY3QoYWNjZXNzVG9rZW4uZGF0YSkpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXNwb25zZSA9IGFjY2Vzc1Rva2VuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoYW5ndWxhci5pc1N0cmluZyhhY2Nlc3NUb2tlbikpIHtcclxuICAgICAgICAgICAgICAgICAgICB0b2tlbiA9IGFjY2Vzc1Rva2VuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICghdG9rZW4gJiYgcmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgIHZhciB0b2tlblJvb3REYXRhID0gdG9rZW5Sb290ICYmIHRva2VuUm9vdC5zcGxpdCgnLicpLnJlZHVjZShmdW5jdGlvbiAobywgeCkgeyByZXR1cm4gb1t4XTsgfSwgcmVzcG9uc2UuZGF0YSk7XHJcbiAgICAgICAgICAgICAgICB0b2tlbiA9IHRva2VuUm9vdERhdGEgPyB0b2tlblJvb3REYXRhW3Rva2VuTmFtZV0gOiByZXNwb25zZS5kYXRhICYmIHJlc3BvbnNlLmRhdGFbdG9rZW5OYW1lXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAodG9rZW4pIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuU2F0ZWxsaXplclN0b3JhZ2Uuc2V0KHRoaXMucHJlZml4ZWRUb2tlbk5hbWUsIHRva2VuKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgU2hhcmVkLnByb3RvdHlwZS5yZW1vdmVUb2tlbiA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdGhpcy5TYXRlbGxpemVyU3RvcmFnZS5yZW1vdmUodGhpcy5wcmVmaXhlZFRva2VuTmFtZSk7XHJcbiAgICAgICAgfTtcclxuICAgICAgICBTaGFyZWQucHJvdG90eXBlLmlzQXV0aGVudGljYXRlZCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyIHRva2VuID0gdGhpcy5TYXRlbGxpemVyU3RvcmFnZS5nZXQodGhpcy5wcmVmaXhlZFRva2VuTmFtZSk7XHJcbiAgICAgICAgICAgIGlmICh0b2tlbikge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRva2VuLnNwbGl0KCcuJykubGVuZ3RoID09PSAzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGJhc2U2NFVybCA9IHRva2VuLnNwbGl0KCcuJylbMV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBiYXNlNjQgPSBiYXNlNjRVcmwucmVwbGFjZSgnLScsICcrJykucmVwbGFjZSgnXycsICcvJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBleHAgPSBKU09OLnBhcnNlKHRoaXMuJHdpbmRvdy5hdG9iKGJhc2U2NCkpLmV4cDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBleHAgPT09ICdudW1iZXInKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gTWF0aC5yb3VuZChuZXcgRGF0ZSgpLmdldFRpbWUoKSAvIDEwMDApIDwgZXhwO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlOyAvLyBQYXNzOiBOb24tSldUIHRva2VuIHRoYXQgbG9va3MgbGlrZSBKV1RcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTsgLy8gUGFzczogQWxsIG90aGVyIHRva2Vuc1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTsgLy8gRmFpbDogTm8gdG9rZW4gYXQgYWxsXHJcbiAgICAgICAgfTtcclxuICAgICAgICBTaGFyZWQucHJvdG90eXBlLmxvZ291dCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdGhpcy5TYXRlbGxpemVyU3RvcmFnZS5yZW1vdmUodGhpcy5wcmVmaXhlZFRva2VuTmFtZSk7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLiRxLndoZW4oKTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIFNoYXJlZC5wcm90b3R5cGUuc2V0U3RvcmFnZVR5cGUgPSBmdW5jdGlvbiAodHlwZSkge1xyXG4gICAgICAgICAgICB0aGlzLlNhdGVsbGl6ZXJDb25maWcuc3RvcmFnZVR5cGUgPSB0eXBlO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgU2hhcmVkLiRpbmplY3QgPSBbJyRxJywgJyR3aW5kb3cnLCAnU2F0ZWxsaXplckNvbmZpZycsICdTYXRlbGxpemVyU3RvcmFnZSddO1xyXG4gICAgICAgIHJldHVybiBTaGFyZWQ7XHJcbiAgICB9KCkpO1xyXG5cclxuICAgIHZhciBMb2NhbCA9IChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgZnVuY3Rpb24gTG9jYWwoJGh0dHAsIFNhdGVsbGl6ZXJDb25maWcsIFNhdGVsbGl6ZXJTaGFyZWQpIHtcclxuICAgICAgICAgICAgdGhpcy4kaHR0cCA9ICRodHRwO1xyXG4gICAgICAgICAgICB0aGlzLlNhdGVsbGl6ZXJDb25maWcgPSBTYXRlbGxpemVyQ29uZmlnO1xyXG4gICAgICAgICAgICB0aGlzLlNhdGVsbGl6ZXJTaGFyZWQgPSBTYXRlbGxpemVyU2hhcmVkO1xyXG4gICAgICAgIH1cclxuICAgICAgICBMb2NhbC5wcm90b3R5cGUubG9naW4gPSBmdW5jdGlvbiAodXNlciwgb3B0aW9ucykge1xyXG4gICAgICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xyXG4gICAgICAgICAgICBpZiAob3B0aW9ucyA9PT0gdm9pZCAwKSB7IG9wdGlvbnMgPSB7fTsgfVxyXG4gICAgICAgICAgICBvcHRpb25zLnVybCA9IG9wdGlvbnMudXJsID8gb3B0aW9ucy51cmwgOiBqb2luVXJsKHRoaXMuU2F0ZWxsaXplckNvbmZpZy5iYXNlVXJsLCB0aGlzLlNhdGVsbGl6ZXJDb25maWcubG9naW5VcmwpO1xyXG4gICAgICAgICAgICBvcHRpb25zLmRhdGEgPSB1c2VyIHx8IG9wdGlvbnMuZGF0YTtcclxuICAgICAgICAgICAgb3B0aW9ucy5tZXRob2QgPSBvcHRpb25zLm1ldGhvZCB8fCAnUE9TVCc7XHJcbiAgICAgICAgICAgIG9wdGlvbnMud2l0aENyZWRlbnRpYWxzID0gb3B0aW9ucy53aXRoQ3JlZGVudGlhbHMgfHwgdGhpcy5TYXRlbGxpemVyQ29uZmlnLndpdGhDcmVkZW50aWFscztcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuJGh0dHAob3B0aW9ucykudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgIF90aGlzLlNhdGVsbGl6ZXJTaGFyZWQuc2V0VG9rZW4ocmVzcG9uc2UpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIExvY2FsLnByb3RvdHlwZS5zaWdudXAgPSBmdW5jdGlvbiAodXNlciwgb3B0aW9ucykge1xyXG4gICAgICAgICAgICBpZiAob3B0aW9ucyA9PT0gdm9pZCAwKSB7IG9wdGlvbnMgPSB7fTsgfVxyXG4gICAgICAgICAgICBvcHRpb25zLnVybCA9IG9wdGlvbnMudXJsID8gb3B0aW9ucy51cmwgOiBqb2luVXJsKHRoaXMuU2F0ZWxsaXplckNvbmZpZy5iYXNlVXJsLCB0aGlzLlNhdGVsbGl6ZXJDb25maWcuc2lnbnVwVXJsKTtcclxuICAgICAgICAgICAgb3B0aW9ucy5kYXRhID0gdXNlciB8fCBvcHRpb25zLmRhdGE7XHJcbiAgICAgICAgICAgIG9wdGlvbnMubWV0aG9kID0gb3B0aW9ucy5tZXRob2QgfHwgJ1BPU1QnO1xyXG4gICAgICAgICAgICBvcHRpb25zLndpdGhDcmVkZW50aWFscyA9IG9wdGlvbnMud2l0aENyZWRlbnRpYWxzIHx8IHRoaXMuU2F0ZWxsaXplckNvbmZpZy53aXRoQ3JlZGVudGlhbHM7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLiRodHRwKG9wdGlvbnMpO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgTG9jYWwuJGluamVjdCA9IFsnJGh0dHAnLCAnU2F0ZWxsaXplckNvbmZpZycsICdTYXRlbGxpemVyU2hhcmVkJ107XHJcbiAgICAgICAgcmV0dXJuIExvY2FsO1xyXG4gICAgfSgpKTtcclxuXHJcbiAgICB2YXIgUG9wdXAgPSAoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGZ1bmN0aW9uIFBvcHVwKCRpbnRlcnZhbCwgJHdpbmRvdywgJHEpIHtcclxuICAgICAgICAgICAgdGhpcy4kaW50ZXJ2YWwgPSAkaW50ZXJ2YWw7XHJcbiAgICAgICAgICAgIHRoaXMuJHdpbmRvdyA9ICR3aW5kb3c7XHJcbiAgICAgICAgICAgIHRoaXMuJHEgPSAkcTtcclxuICAgICAgICAgICAgdGhpcy5wb3B1cCA9IG51bGw7XHJcbiAgICAgICAgICAgIHRoaXMuZGVmYXVsdHMgPSB7XHJcbiAgICAgICAgICAgICAgICByZWRpcmVjdFVyaTogbnVsbFxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgICAgICBQb3B1cC5wcm90b3R5cGUuc3RyaW5naWZ5T3B0aW9ucyA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XHJcbiAgICAgICAgICAgIHZhciBwYXJ0cyA9IFtdO1xyXG4gICAgICAgICAgICBhbmd1bGFyLmZvckVhY2gob3B0aW9ucywgZnVuY3Rpb24gKHZhbHVlLCBrZXkpIHtcclxuICAgICAgICAgICAgICAgIHBhcnRzLnB1c2goa2V5ICsgJz0nICsgdmFsdWUpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgcmV0dXJuIHBhcnRzLmpvaW4oJywnKTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIFBvcHVwLnByb3RvdHlwZS5vcGVuID0gZnVuY3Rpb24gKHVybCwgbmFtZSwgcG9wdXBPcHRpb25zLCByZWRpcmVjdFVyaSwgZG9udFBvbGwpIHtcclxuICAgICAgICAgICAgdmFyIHdpZHRoID0gcG9wdXBPcHRpb25zLndpZHRoIHx8IDUwMDtcclxuICAgICAgICAgICAgdmFyIGhlaWdodCA9IHBvcHVwT3B0aW9ucy5oZWlnaHQgfHwgNTAwO1xyXG4gICAgICAgICAgICB2YXIgb3B0aW9ucyA9IHRoaXMuc3RyaW5naWZ5T3B0aW9ucyh7XHJcbiAgICAgICAgICAgICAgICB3aWR0aDogd2lkdGgsXHJcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IGhlaWdodCxcclxuICAgICAgICAgICAgICAgIHRvcDogdGhpcy4kd2luZG93LnNjcmVlblkgKyAoKHRoaXMuJHdpbmRvdy5vdXRlckhlaWdodCAtIGhlaWdodCkgLyAyLjUpLFxyXG4gICAgICAgICAgICAgICAgbGVmdDogdGhpcy4kd2luZG93LnNjcmVlblggKyAoKHRoaXMuJHdpbmRvdy5vdXRlcldpZHRoIC0gd2lkdGgpIC8gMilcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHZhciBwb3B1cE5hbWUgPSB0aGlzLiR3aW5kb3dbJ2NvcmRvdmEnXSB8fCB0aGlzLiR3aW5kb3cubmF2aWdhdG9yLnVzZXJBZ2VudC5pbmRleE9mKCdDcmlPUycpID4gLTEgPyAnX2JsYW5rJyA6IG5hbWU7XHJcbiAgICAgICAgICAgIHRoaXMucG9wdXAgPSB0aGlzLiR3aW5kb3cub3Blbih1cmwsIHBvcHVwTmFtZSwgb3B0aW9ucyk7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnBvcHVwICYmIHRoaXMucG9wdXAuZm9jdXMpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucG9wdXAuZm9jdXMoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoZG9udFBvbGwpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAodGhpcy4kd2luZG93Wydjb3Jkb3ZhJ10pIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmV2ZW50TGlzdGVuZXIocmVkaXJlY3RVcmkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgaWYgKHVybCA9PT0gJ2Fib3V0OmJsYW5rJykge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucG9wdXAubG9jYXRpb24gPSB1cmw7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5wb2xsaW5nKHJlZGlyZWN0VXJpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgUG9wdXAucHJvdG90eXBlLnBvbGxpbmcgPSBmdW5jdGlvbiAocmVkaXJlY3RVcmkpIHtcclxuICAgICAgICAgICAgdmFyIF90aGlzID0gdGhpcztcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuJHEoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHJlZGlyZWN0VXJpUGFyc2VyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xyXG4gICAgICAgICAgICAgICAgcmVkaXJlY3RVcmlQYXJzZXIuaHJlZiA9IHJlZGlyZWN0VXJpO1xyXG4gICAgICAgICAgICAgICAgdmFyIHJlZGlyZWN0VXJpUGF0aCA9IGdldEZ1bGxVcmxQYXRoKHJlZGlyZWN0VXJpUGFyc2VyKTtcclxuICAgICAgICAgICAgICAgIHZhciBwb2xsaW5nID0gX3RoaXMuJGludGVydmFsKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIV90aGlzLnBvcHVwIHx8IF90aGlzLnBvcHVwLmNsb3NlZCB8fCBfdGhpcy5wb3B1cC5jbG9zZWQgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy4kaW50ZXJ2YWwuY2FuY2VsKHBvbGxpbmcpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZWplY3QobmV3IEVycm9yKCdUaGUgcG9wdXAgd2luZG93IHdhcyBjbG9zZWQnKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBwb3B1cFdpbmRvd1BhdGggPSBnZXRGdWxsVXJsUGF0aChfdGhpcy5wb3B1cC5sb2NhdGlvbik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwb3B1cFdpbmRvd1BhdGggPT09IHJlZGlyZWN0VXJpUGF0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKF90aGlzLnBvcHVwLmxvY2F0aW9uLnNlYXJjaCB8fCBfdGhpcy5wb3B1cC5sb2NhdGlvbi5oYXNoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHF1ZXJ5ID0gcGFyc2VRdWVyeVN0cmluZyhfdGhpcy5wb3B1cC5sb2NhdGlvbi5zZWFyY2guc3Vic3RyaW5nKDEpLnJlcGxhY2UoL1xcLyQvLCAnJykpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBoYXNoID0gcGFyc2VRdWVyeVN0cmluZyhfdGhpcy5wb3B1cC5sb2NhdGlvbi5oYXNoLnN1YnN0cmluZygxKS5yZXBsYWNlKC9bXFwvJF0vLCAnJykpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBwYXJhbXMgPSBhbmd1bGFyLmV4dGVuZCh7fSwgcXVlcnksIGhhc2gpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwYXJhbXMuZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihwYXJhbXMuZXJyb3IpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUocGFyYW1zKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWplY3QobmV3IEVycm9yKCdPQXV0aCByZWRpcmVjdCBoYXMgb2NjdXJyZWQgYnV0IG5vIHF1ZXJ5IG9yIGhhc2ggcGFyYW1ldGVycyB3ZXJlIGZvdW5kLiAnICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ1RoZXkgd2VyZSBlaXRoZXIgbm90IHNldCBkdXJpbmcgdGhlIHJlZGlyZWN0LCBvciB3ZXJlIHJlbW92ZWTigJR0eXBpY2FsbHkgYnkgYSAnICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3JvdXRpbmcgbGlicmFyeeKAlGJlZm9yZSBTYXRlbGxpemVyIGNvdWxkIHJlYWQgaXQuJykpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMuJGludGVydmFsLmNhbmNlbChwb2xsaW5nKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLnBvcHVwLmNsb3NlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSwgNTAwKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfTtcclxuICAgICAgICBQb3B1cC5wcm90b3R5cGUuZXZlbnRMaXN0ZW5lciA9IGZ1bmN0aW9uIChyZWRpcmVjdFVyaSkge1xyXG4gICAgICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy4kcShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XHJcbiAgICAgICAgICAgICAgICBfdGhpcy5wb3B1cC5hZGRFdmVudExpc3RlbmVyKCdsb2Fkc3RhcnQnLCBmdW5jdGlvbiAoZXZlbnQpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZXZlbnQudXJsLmluZGV4T2YocmVkaXJlY3RVcmkpICE9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHBhcnNlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcclxuICAgICAgICAgICAgICAgICAgICBwYXJzZXIuaHJlZiA9IGV2ZW50LnVybDtcclxuICAgICAgICAgICAgICAgICAgICBpZiAocGFyc2VyLnNlYXJjaCB8fCBwYXJzZXIuaGFzaCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgcXVlcnkgPSBwYXJzZVF1ZXJ5U3RyaW5nKHBhcnNlci5zZWFyY2guc3Vic3RyaW5nKDEpLnJlcGxhY2UoL1xcLyQvLCAnJykpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgaGFzaCA9IHBhcnNlUXVlcnlTdHJpbmcocGFyc2VyLmhhc2guc3Vic3RyaW5nKDEpLnJlcGxhY2UoL1tcXC8kXS8sICcnKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBwYXJhbXMgPSBhbmd1bGFyLmV4dGVuZCh7fSwgcXVlcnksIGhhc2gpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocGFyYW1zLmVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWplY3QobmV3IEVycm9yKHBhcmFtcy5lcnJvcikpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShwYXJhbXMpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLnBvcHVwLmNsb3NlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICBfdGhpcy5wb3B1cC5hZGRFdmVudExpc3RlbmVyKCdsb2FkZXJyb3InLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcignQXV0aG9yaXphdGlvbiBmYWlsZWQnKSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIF90aGlzLnBvcHVwLmFkZEV2ZW50TGlzdGVuZXIoJ2V4aXQnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcignVGhlIHBvcHVwIHdpbmRvdyB3YXMgY2xvc2VkJykpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgUG9wdXAuJGluamVjdCA9IFsnJGludGVydmFsJywgJyR3aW5kb3cnLCAnJHEnXTtcclxuICAgICAgICByZXR1cm4gUG9wdXA7XHJcbiAgICB9KCkpO1xyXG5cclxuICAgIHZhciBPQXV0aDEgPSAoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGZ1bmN0aW9uIE9BdXRoMSgkaHR0cCwgJHdpbmRvdywgU2F0ZWxsaXplckNvbmZpZywgU2F0ZWxsaXplclBvcHVwKSB7XHJcbiAgICAgICAgICAgIHRoaXMuJGh0dHAgPSAkaHR0cDtcclxuICAgICAgICAgICAgdGhpcy4kd2luZG93ID0gJHdpbmRvdztcclxuICAgICAgICAgICAgdGhpcy5TYXRlbGxpemVyQ29uZmlnID0gU2F0ZWxsaXplckNvbmZpZztcclxuICAgICAgICAgICAgdGhpcy5TYXRlbGxpemVyUG9wdXAgPSBTYXRlbGxpemVyUG9wdXA7XHJcbiAgICAgICAgICAgIHRoaXMuZGVmYXVsdHMgPSB7XHJcbiAgICAgICAgICAgICAgICBuYW1lOiBudWxsLFxyXG4gICAgICAgICAgICAgICAgdXJsOiBudWxsLFxyXG4gICAgICAgICAgICAgICAgYXV0aG9yaXphdGlvbkVuZHBvaW50OiBudWxsLFxyXG4gICAgICAgICAgICAgICAgc2NvcGU6IG51bGwsXHJcbiAgICAgICAgICAgICAgICBzY29wZVByZWZpeDogbnVsbCxcclxuICAgICAgICAgICAgICAgIHNjb3BlRGVsaW1pdGVyOiBudWxsLFxyXG4gICAgICAgICAgICAgICAgcmVkaXJlY3RVcmk6IG51bGwsXHJcbiAgICAgICAgICAgICAgICByZXF1aXJlZFVybFBhcmFtczogbnVsbCxcclxuICAgICAgICAgICAgICAgIGRlZmF1bHRVcmxQYXJhbXM6IG51bGwsXHJcbiAgICAgICAgICAgICAgICBvYXV0aFR5cGU6ICcxLjAnLFxyXG4gICAgICAgICAgICAgICAgcG9wdXBPcHRpb25zOiB7IHdpZHRoOiBudWxsLCBoZWlnaHQ6IG51bGwgfVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgICAgICA7XHJcbiAgICAgICAgT0F1dGgxLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24gKG9wdGlvbnMsIHVzZXJEYXRhKSB7XHJcbiAgICAgICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XHJcbiAgICAgICAgICAgIGFuZ3VsYXIuZXh0ZW5kKHRoaXMuZGVmYXVsdHMsIG9wdGlvbnMpO1xyXG4gICAgICAgICAgICB2YXIgbmFtZSA9IG9wdGlvbnMubmFtZSwgcG9wdXBPcHRpb25zID0gb3B0aW9ucy5wb3B1cE9wdGlvbnM7XHJcbiAgICAgICAgICAgIHZhciByZWRpcmVjdFVyaSA9IHRoaXMuZGVmYXVsdHMucmVkaXJlY3RVcmk7XHJcbiAgICAgICAgICAgIC8vIFNob3VsZCBvcGVuIGFuIGVtcHR5IHBvcHVwIGFuZCB3YWl0IHVudGlsIHJlcXVlc3QgdG9rZW4gaXMgcmVjZWl2ZWRcclxuICAgICAgICAgICAgaWYgKCF0aGlzLiR3aW5kb3dbJ2NvcmRvdmEnXSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5TYXRlbGxpemVyUG9wdXAub3BlbignYWJvdXQ6YmxhbmsnLCBuYW1lLCBwb3B1cE9wdGlvbnMsIHJlZGlyZWN0VXJpLCB0cnVlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRSZXF1ZXN0VG9rZW4oKS50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIF90aGlzLm9wZW5Qb3B1cChvcHRpb25zLCByZXNwb25zZSkudGhlbihmdW5jdGlvbiAocG9wdXBSZXNwb25zZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBfdGhpcy5leGNoYW5nZUZvclRva2VuKHBvcHVwUmVzcG9uc2UsIHVzZXJEYXRhKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIE9BdXRoMS5wcm90b3R5cGUub3BlblBvcHVwID0gZnVuY3Rpb24gKG9wdGlvbnMsIHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgIHZhciB1cmwgPSBbb3B0aW9ucy5hdXRob3JpemF0aW9uRW5kcG9pbnQsIHRoaXMuYnVpbGRRdWVyeVN0cmluZyhyZXNwb25zZS5kYXRhKV0uam9pbignPycpO1xyXG4gICAgICAgICAgICB2YXIgcmVkaXJlY3RVcmkgPSB0aGlzLmRlZmF1bHRzLnJlZGlyZWN0VXJpO1xyXG4gICAgICAgICAgICBpZiAodGhpcy4kd2luZG93Wydjb3Jkb3ZhJ10pIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLlNhdGVsbGl6ZXJQb3B1cC5vcGVuKHVybCwgb3B0aW9ucy5uYW1lLCBvcHRpb25zLnBvcHVwT3B0aW9ucywgcmVkaXJlY3RVcmkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5TYXRlbGxpemVyUG9wdXAucG9wdXAubG9jYXRpb24gPSB1cmw7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5TYXRlbGxpemVyUG9wdXAucG9sbGluZyhyZWRpcmVjdFVyaSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgICAgIE9BdXRoMS5wcm90b3R5cGUuZ2V0UmVxdWVzdFRva2VuID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB2YXIgdXJsID0gdGhpcy5TYXRlbGxpemVyQ29uZmlnLmJhc2VVcmwgPyBqb2luVXJsKHRoaXMuU2F0ZWxsaXplckNvbmZpZy5iYXNlVXJsLCB0aGlzLmRlZmF1bHRzLnVybCkgOiB0aGlzLmRlZmF1bHRzLnVybDtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuJGh0dHAucG9zdCh1cmwsIHRoaXMuZGVmYXVsdHMpO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgT0F1dGgxLnByb3RvdHlwZS5leGNoYW5nZUZvclRva2VuID0gZnVuY3Rpb24gKG9hdXRoRGF0YSwgdXNlckRhdGEpIHtcclxuICAgICAgICAgICAgdmFyIHBheWxvYWQgPSBhbmd1bGFyLmV4dGVuZCh7fSwgdXNlckRhdGEsIG9hdXRoRGF0YSk7XHJcbiAgICAgICAgICAgIHZhciBleGNoYW5nZUZvclRva2VuVXJsID0gdGhpcy5TYXRlbGxpemVyQ29uZmlnLmJhc2VVcmwgPyBqb2luVXJsKHRoaXMuU2F0ZWxsaXplckNvbmZpZy5iYXNlVXJsLCB0aGlzLmRlZmF1bHRzLnVybCkgOiB0aGlzLmRlZmF1bHRzLnVybDtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuJGh0dHAucG9zdChleGNoYW5nZUZvclRva2VuVXJsLCBwYXlsb2FkLCB7IHdpdGhDcmVkZW50aWFsczogdGhpcy5TYXRlbGxpemVyQ29uZmlnLndpdGhDcmVkZW50aWFscyB9KTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIE9BdXRoMS5wcm90b3R5cGUuYnVpbGRRdWVyeVN0cmluZyA9IGZ1bmN0aW9uIChvYmopIHtcclxuICAgICAgICAgICAgdmFyIHN0ciA9IFtdO1xyXG4gICAgICAgICAgICBhbmd1bGFyLmZvckVhY2gob2JqLCBmdW5jdGlvbiAodmFsdWUsIGtleSkge1xyXG4gICAgICAgICAgICAgICAgc3RyLnB1c2goZW5jb2RlVVJJQ29tcG9uZW50KGtleSkgKyAnPScgKyBlbmNvZGVVUklDb21wb25lbnQodmFsdWUpKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHJldHVybiBzdHIuam9pbignJicpO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgT0F1dGgxLiRpbmplY3QgPSBbJyRodHRwJywgJyR3aW5kb3cnLCAnU2F0ZWxsaXplckNvbmZpZycsICdTYXRlbGxpemVyUG9wdXAnXTtcclxuICAgICAgICByZXR1cm4gT0F1dGgxO1xyXG4gICAgfSgpKTtcclxuXHJcbiAgICB2YXIgT0F1dGgyID0gKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBmdW5jdGlvbiBPQXV0aDIoJGh0dHAsICR3aW5kb3csICR0aW1lb3V0LCAkcSwgU2F0ZWxsaXplckNvbmZpZywgU2F0ZWxsaXplclBvcHVwLCBTYXRlbGxpemVyU3RvcmFnZSkge1xyXG4gICAgICAgICAgICB0aGlzLiRodHRwID0gJGh0dHA7XHJcbiAgICAgICAgICAgIHRoaXMuJHdpbmRvdyA9ICR3aW5kb3c7XHJcbiAgICAgICAgICAgIHRoaXMuJHRpbWVvdXQgPSAkdGltZW91dDtcclxuICAgICAgICAgICAgdGhpcy4kcSA9ICRxO1xyXG4gICAgICAgICAgICB0aGlzLlNhdGVsbGl6ZXJDb25maWcgPSBTYXRlbGxpemVyQ29uZmlnO1xyXG4gICAgICAgICAgICB0aGlzLlNhdGVsbGl6ZXJQb3B1cCA9IFNhdGVsbGl6ZXJQb3B1cDtcclxuICAgICAgICAgICAgdGhpcy5TYXRlbGxpemVyU3RvcmFnZSA9IFNhdGVsbGl6ZXJTdG9yYWdlO1xyXG4gICAgICAgICAgICB0aGlzLmRlZmF1bHRzID0ge1xyXG4gICAgICAgICAgICAgICAgbmFtZTogbnVsbCxcclxuICAgICAgICAgICAgICAgIHVybDogbnVsbCxcclxuICAgICAgICAgICAgICAgIGNsaWVudElkOiBudWxsLFxyXG4gICAgICAgICAgICAgICAgYXV0aG9yaXphdGlvbkVuZHBvaW50OiBudWxsLFxyXG4gICAgICAgICAgICAgICAgcmVkaXJlY3RVcmk6IG51bGwsXHJcbiAgICAgICAgICAgICAgICBzY29wZTogbnVsbCxcclxuICAgICAgICAgICAgICAgIHNjb3BlUHJlZml4OiBudWxsLFxyXG4gICAgICAgICAgICAgICAgc2NvcGVEZWxpbWl0ZXI6IG51bGwsXHJcbiAgICAgICAgICAgICAgICBzdGF0ZTogbnVsbCxcclxuICAgICAgICAgICAgICAgIHJlcXVpcmVkVXJsUGFyYW1zOiBudWxsLFxyXG4gICAgICAgICAgICAgICAgZGVmYXVsdFVybFBhcmFtczogWydyZXNwb25zZV90eXBlJywgJ2NsaWVudF9pZCcsICdyZWRpcmVjdF91cmknXSxcclxuICAgICAgICAgICAgICAgIHJlc3BvbnNlVHlwZTogJ2NvZGUnLFxyXG4gICAgICAgICAgICAgICAgcmVzcG9uc2VQYXJhbXM6IHtcclxuICAgICAgICAgICAgICAgICAgICBjb2RlOiAnY29kZScsXHJcbiAgICAgICAgICAgICAgICAgICAgY2xpZW50SWQ6ICdjbGllbnRJZCcsXHJcbiAgICAgICAgICAgICAgICAgICAgcmVkaXJlY3RVcmk6ICdyZWRpcmVjdFVyaSdcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBvYXV0aFR5cGU6ICcyLjAnLFxyXG4gICAgICAgICAgICAgICAgcG9wdXBPcHRpb25zOiB7IHdpZHRoOiBudWxsLCBoZWlnaHQ6IG51bGwgfVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgICAgICBPQXV0aDIuY2FtZWxDYXNlID0gZnVuY3Rpb24gKG5hbWUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5hbWUucmVwbGFjZSgvKFtcXDpcXC1cXF9dKyguKSkvZywgZnVuY3Rpb24gKF8sIHNlcGFyYXRvciwgbGV0dGVyLCBvZmZzZXQpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBvZmZzZXQgPyBsZXR0ZXIudG9VcHBlckNhc2UoKSA6IGxldHRlcjtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfTtcclxuICAgICAgICBPQXV0aDIucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbiAob3B0aW9ucywgdXNlckRhdGEpIHtcclxuICAgICAgICAgICAgdmFyIF90aGlzID0gdGhpcztcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuJHEoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xyXG4gICAgICAgICAgICAgICAgYW5ndWxhci5leHRlbmQoX3RoaXMuZGVmYXVsdHMsIG9wdGlvbnMpO1xyXG4gICAgICAgICAgICAgICAgdmFyIHN0YXRlTmFtZSA9IF90aGlzLmRlZmF1bHRzLm5hbWUgKyAnX3N0YXRlJztcclxuICAgICAgICAgICAgICAgIHZhciBfYSA9IF90aGlzLmRlZmF1bHRzLCBuYW1lID0gX2EubmFtZSwgc3RhdGUgPSBfYS5zdGF0ZSwgcG9wdXBPcHRpb25zID0gX2EucG9wdXBPcHRpb25zLCByZWRpcmVjdFVyaSA9IF9hLnJlZGlyZWN0VXJpLCByZXNwb25zZVR5cGUgPSBfYS5yZXNwb25zZVR5cGU7XHJcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHN0YXRlID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMuU2F0ZWxsaXplclN0b3JhZ2Uuc2V0KHN0YXRlTmFtZSwgc3RhdGUoKSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIGlmICh0eXBlb2Ygc3RhdGUgPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMuU2F0ZWxsaXplclN0b3JhZ2Uuc2V0KHN0YXRlTmFtZSwgc3RhdGUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdmFyIHVybCA9IFtfdGhpcy5kZWZhdWx0cy5hdXRob3JpemF0aW9uRW5kcG9pbnQsIF90aGlzLmJ1aWxkUXVlcnlTdHJpbmcoKV0uam9pbignPycpO1xyXG4gICAgICAgICAgICAgICAgX3RoaXMuU2F0ZWxsaXplclBvcHVwLm9wZW4odXJsLCBuYW1lLCBwb3B1cE9wdGlvbnMsIHJlZGlyZWN0VXJpKS50aGVuKGZ1bmN0aW9uIChvYXV0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZVR5cGUgPT09ICd0b2tlbicgfHwgIXVybCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzb2x2ZShvYXV0aCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChvYXV0aC5zdGF0ZSAmJiBvYXV0aC5zdGF0ZSAhPT0gX3RoaXMuU2F0ZWxsaXplclN0b3JhZ2UuZ2V0KHN0YXRlTmFtZSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlamVjdChuZXcgRXJyb3IoJ1RoZSB2YWx1ZSByZXR1cm5lZCBpbiB0aGUgc3RhdGUgcGFyYW1ldGVyIGRvZXMgbm90IG1hdGNoIHRoZSBzdGF0ZSB2YWx1ZSBmcm9tIHlvdXIgb3JpZ2luYWwgJyArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnYXV0aG9yaXphdGlvbiBjb2RlIHJlcXVlc3QuJykpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKF90aGlzLmV4Y2hhbmdlRm9yVG9rZW4ob2F1dGgsIHVzZXJEYXRhKSk7XHJcbiAgICAgICAgICAgICAgICB9KS5jYXRjaChmdW5jdGlvbiAoZXJyb3IpIHsgcmV0dXJuIHJlamVjdChlcnJvcik7IH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIE9BdXRoMi5wcm90b3R5cGUuZXhjaGFuZ2VGb3JUb2tlbiA9IGZ1bmN0aW9uIChvYXV0aERhdGEsIHVzZXJEYXRhKSB7XHJcbiAgICAgICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XHJcbiAgICAgICAgICAgIHZhciBwYXlsb2FkID0gYW5ndWxhci5leHRlbmQoe30sIHVzZXJEYXRhKTtcclxuICAgICAgICAgICAgYW5ndWxhci5mb3JFYWNoKHRoaXMuZGVmYXVsdHMucmVzcG9uc2VQYXJhbXMsIGZ1bmN0aW9uICh2YWx1ZSwga2V5KSB7XHJcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKGtleSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ2NvZGUnOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXlsb2FkW3ZhbHVlXSA9IG9hdXRoRGF0YS5jb2RlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICBjYXNlICdjbGllbnRJZCc6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBheWxvYWRbdmFsdWVdID0gX3RoaXMuZGVmYXVsdHMuY2xpZW50SWQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ3JlZGlyZWN0VXJpJzpcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGF5bG9hZFt2YWx1ZV0gPSBfdGhpcy5kZWZhdWx0cy5yZWRpcmVjdFVyaTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGF5bG9hZFt2YWx1ZV0gPSBvYXV0aERhdGFba2V5XTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGlmIChvYXV0aERhdGEuc3RhdGUpIHtcclxuICAgICAgICAgICAgICAgIHBheWxvYWQuc3RhdGUgPSBvYXV0aERhdGEuc3RhdGU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdmFyIGV4Y2hhbmdlRm9yVG9rZW5VcmwgPSB0aGlzLlNhdGVsbGl6ZXJDb25maWcuYmFzZVVybCA/XHJcbiAgICAgICAgICAgICAgICBqb2luVXJsKHRoaXMuU2F0ZWxsaXplckNvbmZpZy5iYXNlVXJsLCB0aGlzLmRlZmF1bHRzLnVybCkgOlxyXG4gICAgICAgICAgICAgICAgdGhpcy5kZWZhdWx0cy51cmw7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLiRodHRwLnBvc3QoZXhjaGFuZ2VGb3JUb2tlblVybCwgcGF5bG9hZCwgeyB3aXRoQ3JlZGVudGlhbHM6IHRoaXMuU2F0ZWxsaXplckNvbmZpZy53aXRoQ3JlZGVudGlhbHMgfSk7XHJcbiAgICAgICAgfTtcclxuICAgICAgICBPQXV0aDIucHJvdG90eXBlLmJ1aWxkUXVlcnlTdHJpbmcgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XHJcbiAgICAgICAgICAgIHZhciBrZXlWYWx1ZVBhaXJzID0gW107XHJcbiAgICAgICAgICAgIHZhciB1cmxQYXJhbXNDYXRlZ29yaWVzID0gWydkZWZhdWx0VXJsUGFyYW1zJywgJ3JlcXVpcmVkVXJsUGFyYW1zJywgJ29wdGlvbmFsVXJsUGFyYW1zJ107XHJcbiAgICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaCh1cmxQYXJhbXNDYXRlZ29yaWVzLCBmdW5jdGlvbiAocGFyYW1zQ2F0ZWdvcnkpIHtcclxuICAgICAgICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaChfdGhpcy5kZWZhdWx0c1twYXJhbXNDYXRlZ29yeV0sIGZ1bmN0aW9uIChwYXJhbU5hbWUpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgY2FtZWxpemVkTmFtZSA9IE9BdXRoMi5jYW1lbENhc2UocGFyYW1OYW1lKTtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgcGFyYW1WYWx1ZSA9IGFuZ3VsYXIuaXNGdW5jdGlvbihfdGhpcy5kZWZhdWx0c1twYXJhbU5hbWVdKSA/IF90aGlzLmRlZmF1bHRzW3BhcmFtTmFtZV0oKSA6IF90aGlzLmRlZmF1bHRzW2NhbWVsaXplZE5hbWVdO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChwYXJhbU5hbWUgPT09ICdyZWRpcmVjdF91cmknICYmICFwYXJhbVZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHBhcmFtTmFtZSA9PT0gJ3N0YXRlJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgc3RhdGVOYW1lID0gX3RoaXMuZGVmYXVsdHMubmFtZSArICdfc3RhdGUnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJhbVZhbHVlID0gZW5jb2RlVVJJQ29tcG9uZW50KF90aGlzLlNhdGVsbGl6ZXJTdG9yYWdlLmdldChzdGF0ZU5hbWUpKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHBhcmFtTmFtZSA9PT0gJ3Njb3BlJyAmJiBBcnJheS5pc0FycmF5KHBhcmFtVmFsdWUpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcmFtVmFsdWUgPSBwYXJhbVZhbHVlLmpvaW4oX3RoaXMuZGVmYXVsdHMuc2NvcGVEZWxpbWl0ZXIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoX3RoaXMuZGVmYXVsdHMuc2NvcGVQcmVmaXgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcmFtVmFsdWUgPSBbX3RoaXMuZGVmYXVsdHMuc2NvcGVQcmVmaXgsIHBhcmFtVmFsdWVdLmpvaW4oX3RoaXMuZGVmYXVsdHMuc2NvcGVEZWxpbWl0ZXIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGtleVZhbHVlUGFpcnMucHVzaChbcGFyYW1OYW1lLCBwYXJhbVZhbHVlXSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHJldHVybiBrZXlWYWx1ZVBhaXJzLm1hcChmdW5jdGlvbiAocGFpcikgeyByZXR1cm4gcGFpci5qb2luKCc9Jyk7IH0pLmpvaW4oJyYnKTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIE9BdXRoMi4kaW5qZWN0ID0gWyckaHR0cCcsICckd2luZG93JywgJyR0aW1lb3V0JywgJyRxJywgJ1NhdGVsbGl6ZXJDb25maWcnLCAnU2F0ZWxsaXplclBvcHVwJywgJ1NhdGVsbGl6ZXJTdG9yYWdlJ107XHJcbiAgICAgICAgcmV0dXJuIE9BdXRoMjtcclxuICAgIH0oKSk7XHJcblxyXG4gICAgdmFyIE9BdXRoID0gKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBmdW5jdGlvbiBPQXV0aCgkaHR0cCwgJHdpbmRvdywgJHRpbWVvdXQsICRxLCBTYXRlbGxpemVyQ29uZmlnLCBTYXRlbGxpemVyUG9wdXAsIFNhdGVsbGl6ZXJTdG9yYWdlLCBTYXRlbGxpemVyU2hhcmVkLCBTYXRlbGxpemVyT0F1dGgxLCBTYXRlbGxpemVyT0F1dGgyKSB7XHJcbiAgICAgICAgICAgIHRoaXMuJGh0dHAgPSAkaHR0cDtcclxuICAgICAgICAgICAgdGhpcy4kd2luZG93ID0gJHdpbmRvdztcclxuICAgICAgICAgICAgdGhpcy4kdGltZW91dCA9ICR0aW1lb3V0O1xyXG4gICAgICAgICAgICB0aGlzLiRxID0gJHE7XHJcbiAgICAgICAgICAgIHRoaXMuU2F0ZWxsaXplckNvbmZpZyA9IFNhdGVsbGl6ZXJDb25maWc7XHJcbiAgICAgICAgICAgIHRoaXMuU2F0ZWxsaXplclBvcHVwID0gU2F0ZWxsaXplclBvcHVwO1xyXG4gICAgICAgICAgICB0aGlzLlNhdGVsbGl6ZXJTdG9yYWdlID0gU2F0ZWxsaXplclN0b3JhZ2U7XHJcbiAgICAgICAgICAgIHRoaXMuU2F0ZWxsaXplclNoYXJlZCA9IFNhdGVsbGl6ZXJTaGFyZWQ7XHJcbiAgICAgICAgICAgIHRoaXMuU2F0ZWxsaXplck9BdXRoMSA9IFNhdGVsbGl6ZXJPQXV0aDE7XHJcbiAgICAgICAgICAgIHRoaXMuU2F0ZWxsaXplck9BdXRoMiA9IFNhdGVsbGl6ZXJPQXV0aDI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIE9BdXRoLnByb3RvdHlwZS5hdXRoZW50aWNhdGUgPSBmdW5jdGlvbiAobmFtZSwgdXNlckRhdGEpIHtcclxuICAgICAgICAgICAgdmFyIF90aGlzID0gdGhpcztcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuJHEoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHByb3ZpZGVyID0gX3RoaXMuU2F0ZWxsaXplckNvbmZpZy5wcm92aWRlcnNbbmFtZV07XHJcbiAgICAgICAgICAgICAgICB2YXIgb2F1dGggPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgc3dpdGNoIChwcm92aWRlci5vYXV0aFR5cGUpIHtcclxuICAgICAgICAgICAgICAgICAgICBjYXNlICcxLjAnOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBvYXV0aCA9IG5ldyBPQXV0aDEoX3RoaXMuJGh0dHAsIF90aGlzLiR3aW5kb3csIF90aGlzLlNhdGVsbGl6ZXJDb25maWcsIF90aGlzLlNhdGVsbGl6ZXJQb3B1cCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJzIuMCc6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG9hdXRoID0gbmV3IE9BdXRoMihfdGhpcy4kaHR0cCwgX3RoaXMuJHdpbmRvdywgX3RoaXMuJHRpbWVvdXQsIF90aGlzLiRxLCBfdGhpcy5TYXRlbGxpemVyQ29uZmlnLCBfdGhpcy5TYXRlbGxpemVyUG9wdXAsIF90aGlzLlNhdGVsbGl6ZXJTdG9yYWdlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlamVjdChuZXcgRXJyb3IoJ0ludmFsaWQgT0F1dGggVHlwZScpKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiBvYXV0aC5pbml0KHByb3ZpZGVyLCB1c2VyRGF0YSkudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAocHJvdmlkZXIudXJsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLlNhdGVsbGl6ZXJTaGFyZWQuc2V0VG9rZW4ocmVzcG9uc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHJlc3BvbnNlKTtcclxuICAgICAgICAgICAgICAgIH0pLmNhdGNoKGZ1bmN0aW9uIChlcnJvcikge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChlcnJvcik7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfTtcclxuICAgICAgICBPQXV0aC5wcm90b3R5cGUudW5saW5rID0gZnVuY3Rpb24gKHByb3ZpZGVyLCBodHRwT3B0aW9ucykge1xyXG4gICAgICAgICAgICBpZiAoaHR0cE9wdGlvbnMgPT09IHZvaWQgMCkgeyBodHRwT3B0aW9ucyA9IHt9OyB9XHJcbiAgICAgICAgICAgIGh0dHBPcHRpb25zLnVybCA9IGh0dHBPcHRpb25zLnVybCA/IGh0dHBPcHRpb25zLnVybCA6IGpvaW5VcmwodGhpcy5TYXRlbGxpemVyQ29uZmlnLmJhc2VVcmwsIHRoaXMuU2F0ZWxsaXplckNvbmZpZy51bmxpbmtVcmwpO1xyXG4gICAgICAgICAgICBodHRwT3B0aW9ucy5kYXRhID0geyBwcm92aWRlcjogcHJvdmlkZXIgfSB8fCBodHRwT3B0aW9ucy5kYXRhO1xyXG4gICAgICAgICAgICBodHRwT3B0aW9ucy5tZXRob2QgPSBodHRwT3B0aW9ucy5tZXRob2QgfHwgJ1BPU1QnO1xyXG4gICAgICAgICAgICBodHRwT3B0aW9ucy53aXRoQ3JlZGVudGlhbHMgPSBodHRwT3B0aW9ucy53aXRoQ3JlZGVudGlhbHMgfHwgdGhpcy5TYXRlbGxpemVyQ29uZmlnLndpdGhDcmVkZW50aWFscztcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuJGh0dHAoaHR0cE9wdGlvbnMpO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgT0F1dGguJGluamVjdCA9IFtcclxuICAgICAgICAgICAgJyRodHRwJyxcclxuICAgICAgICAgICAgJyR3aW5kb3cnLFxyXG4gICAgICAgICAgICAnJHRpbWVvdXQnLFxyXG4gICAgICAgICAgICAnJHEnLFxyXG4gICAgICAgICAgICAnU2F0ZWxsaXplckNvbmZpZycsXHJcbiAgICAgICAgICAgICdTYXRlbGxpemVyUG9wdXAnLFxyXG4gICAgICAgICAgICAnU2F0ZWxsaXplclN0b3JhZ2UnLFxyXG4gICAgICAgICAgICAnU2F0ZWxsaXplclNoYXJlZCcsXHJcbiAgICAgICAgICAgICdTYXRlbGxpemVyT0F1dGgxJyxcclxuICAgICAgICAgICAgJ1NhdGVsbGl6ZXJPQXV0aDInXHJcbiAgICAgICAgXTtcclxuICAgICAgICByZXR1cm4gT0F1dGg7XHJcbiAgICB9KCkpO1xyXG5cclxuICAgIHZhciBTdG9yYWdlID0gKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBmdW5jdGlvbiBTdG9yYWdlKCR3aW5kb3csIFNhdGVsbGl6ZXJDb25maWcpIHtcclxuICAgICAgICAgICAgdGhpcy4kd2luZG93ID0gJHdpbmRvdztcclxuICAgICAgICAgICAgdGhpcy5TYXRlbGxpemVyQ29uZmlnID0gU2F0ZWxsaXplckNvbmZpZztcclxuICAgICAgICAgICAgdGhpcy5tZW1vcnlTdG9yZSA9IHt9O1xyXG4gICAgICAgIH1cclxuICAgICAgICBTdG9yYWdlLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbiAoa2V5KSB7XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy4kd2luZG93W3RoaXMuU2F0ZWxsaXplckNvbmZpZy5zdG9yYWdlVHlwZV0uZ2V0SXRlbShrZXkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5tZW1vcnlTdG9yZVtrZXldO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgICAgICBTdG9yYWdlLnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbiAoa2V5LCB2YWx1ZSkge1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kd2luZG93W3RoaXMuU2F0ZWxsaXplckNvbmZpZy5zdG9yYWdlVHlwZV0uc2V0SXRlbShrZXksIHZhbHVlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5tZW1vcnlTdG9yZVtrZXldID0gdmFsdWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgICAgIFN0b3JhZ2UucHJvdG90eXBlLnJlbW92ZSA9IGZ1bmN0aW9uIChrZXkpIHtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuJHdpbmRvd1t0aGlzLlNhdGVsbGl6ZXJDb25maWcuc3RvcmFnZVR5cGVdLnJlbW92ZUl0ZW0oa2V5KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICAgICAgZGVsZXRlIHRoaXMubWVtb3J5U3RvcmVba2V5XTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgU3RvcmFnZS4kaW5qZWN0ID0gWyckd2luZG93JywgJ1NhdGVsbGl6ZXJDb25maWcnXTtcclxuICAgICAgICByZXR1cm4gU3RvcmFnZTtcclxuICAgIH0oKSk7XHJcblxyXG4gICAgdmFyIEludGVyY2VwdG9yID0gKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBmdW5jdGlvbiBJbnRlcmNlcHRvcihTYXRlbGxpemVyQ29uZmlnLCBTYXRlbGxpemVyU2hhcmVkLCBTYXRlbGxpemVyU3RvcmFnZSkge1xyXG4gICAgICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xyXG4gICAgICAgICAgICB0aGlzLlNhdGVsbGl6ZXJDb25maWcgPSBTYXRlbGxpemVyQ29uZmlnO1xyXG4gICAgICAgICAgICB0aGlzLlNhdGVsbGl6ZXJTaGFyZWQgPSBTYXRlbGxpemVyU2hhcmVkO1xyXG4gICAgICAgICAgICB0aGlzLlNhdGVsbGl6ZXJTdG9yYWdlID0gU2F0ZWxsaXplclN0b3JhZ2U7XHJcbiAgICAgICAgICAgIHRoaXMucmVxdWVzdCA9IGZ1bmN0aW9uIChjb25maWcpIHtcclxuICAgICAgICAgICAgICAgIGlmIChjb25maWdbJ3NraXBBdXRob3JpemF0aW9uJ10pIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY29uZmlnO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKF90aGlzLlNhdGVsbGl6ZXJTaGFyZWQuaXNBdXRoZW50aWNhdGVkKCkgJiYgX3RoaXMuU2F0ZWxsaXplckNvbmZpZy5odHRwSW50ZXJjZXB0b3IoKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciB0b2tlbk5hbWUgPSBfdGhpcy5TYXRlbGxpemVyQ29uZmlnLnRva2VuUHJlZml4ID9cclxuICAgICAgICAgICAgICAgICAgICAgICAgW190aGlzLlNhdGVsbGl6ZXJDb25maWcudG9rZW5QcmVmaXgsIF90aGlzLlNhdGVsbGl6ZXJDb25maWcudG9rZW5OYW1lXS5qb2luKCdfJykgOiBfdGhpcy5TYXRlbGxpemVyQ29uZmlnLnRva2VuTmFtZTtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgdG9rZW4gPSBfdGhpcy5TYXRlbGxpemVyU3RvcmFnZS5nZXQodG9rZW5OYW1lKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoX3RoaXMuU2F0ZWxsaXplckNvbmZpZy50b2tlbkhlYWRlciAmJiBfdGhpcy5TYXRlbGxpemVyQ29uZmlnLnRva2VuVHlwZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0b2tlbiA9IF90aGlzLlNhdGVsbGl6ZXJDb25maWcudG9rZW5UeXBlICsgJyAnICsgdG9rZW47XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZy5oZWFkZXJzW190aGlzLlNhdGVsbGl6ZXJDb25maWcudG9rZW5IZWFkZXJdID0gdG9rZW47XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gY29uZmlnO1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgICAgICBJbnRlcmNlcHRvci5GYWN0b3J5ID0gZnVuY3Rpb24gKFNhdGVsbGl6ZXJDb25maWcsIFNhdGVsbGl6ZXJTaGFyZWQsIFNhdGVsbGl6ZXJTdG9yYWdlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgSW50ZXJjZXB0b3IoU2F0ZWxsaXplckNvbmZpZywgU2F0ZWxsaXplclNoYXJlZCwgU2F0ZWxsaXplclN0b3JhZ2UpO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgSW50ZXJjZXB0b3IuJGluamVjdCA9IFsnU2F0ZWxsaXplckNvbmZpZycsICdTYXRlbGxpemVyU2hhcmVkJywgJ1NhdGVsbGl6ZXJTdG9yYWdlJ107XHJcbiAgICAgICAgcmV0dXJuIEludGVyY2VwdG9yO1xyXG4gICAgfSgpKTtcclxuICAgIEludGVyY2VwdG9yLkZhY3RvcnkuJGluamVjdCA9IFsnU2F0ZWxsaXplckNvbmZpZycsICdTYXRlbGxpemVyU2hhcmVkJywgJ1NhdGVsbGl6ZXJTdG9yYWdlJ107XHJcblxyXG4gICAgdmFyIEh0dHBQcm92aWRlckNvbmZpZyA9IChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgZnVuY3Rpb24gSHR0cFByb3ZpZGVyQ29uZmlnKCRodHRwUHJvdmlkZXIpIHtcclxuICAgICAgICAgICAgdGhpcy4kaHR0cFByb3ZpZGVyID0gJGh0dHBQcm92aWRlcjtcclxuICAgICAgICAgICAgJGh0dHBQcm92aWRlci5pbnRlcmNlcHRvcnMucHVzaChJbnRlcmNlcHRvci5GYWN0b3J5KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgSHR0cFByb3ZpZGVyQ29uZmlnLiRpbmplY3QgPSBbJyRodHRwUHJvdmlkZXInXTtcclxuICAgICAgICByZXR1cm4gSHR0cFByb3ZpZGVyQ29uZmlnO1xyXG4gICAgfSgpKTtcclxuXHJcbiAgICBhbmd1bGFyLm1vZHVsZSgnc2F0ZWxsaXplcicsIFtdKVxyXG4gICAgICAgIC5wcm92aWRlcignJGF1dGgnLCBbJ1NhdGVsbGl6ZXJDb25maWcnLCBmdW5jdGlvbiAoU2F0ZWxsaXplckNvbmZpZykgeyByZXR1cm4gbmV3IEF1dGhQcm92aWRlcihTYXRlbGxpemVyQ29uZmlnKTsgfV0pXHJcbiAgICAgICAgLmNvbnN0YW50KCdTYXRlbGxpemVyQ29uZmlnJywgQ29uZmlnLmdldENvbnN0YW50KVxyXG4gICAgICAgIC5zZXJ2aWNlKCdTYXRlbGxpemVyU2hhcmVkJywgU2hhcmVkKVxyXG4gICAgICAgIC5zZXJ2aWNlKCdTYXRlbGxpemVyTG9jYWwnLCBMb2NhbClcclxuICAgICAgICAuc2VydmljZSgnU2F0ZWxsaXplclBvcHVwJywgUG9wdXApXHJcbiAgICAgICAgLnNlcnZpY2UoJ1NhdGVsbGl6ZXJPQXV0aCcsIE9BdXRoKVxyXG4gICAgICAgIC5zZXJ2aWNlKCdTYXRlbGxpemVyT0F1dGgyJywgT0F1dGgyKVxyXG4gICAgICAgIC5zZXJ2aWNlKCdTYXRlbGxpemVyT0F1dGgxJywgT0F1dGgxKVxyXG4gICAgICAgIC5zZXJ2aWNlKCdTYXRlbGxpemVyU3RvcmFnZScsIFN0b3JhZ2UpXHJcbiAgICAgICAgLnNlcnZpY2UoJ1NhdGVsbGl6ZXJJbnRlcmNlcHRvcicsIEludGVyY2VwdG9yKVxyXG4gICAgICAgIC5jb25maWcoWyckaHR0cFByb3ZpZGVyJywgZnVuY3Rpb24gKCRodHRwUHJvdmlkZXIpIHsgcmV0dXJuIG5ldyBIdHRwUHJvdmlkZXJDb25maWcoJGh0dHBQcm92aWRlcik7IH1dKTtcclxuICAgIHZhciBuZzEgPSAnc2F0ZWxsaXplcic7XHJcblxyXG4gICAgcmV0dXJuIG5nMTtcclxuXHJcbn0pKTtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9c2F0ZWxsaXplci5qcy5tYXAiXSwiZmlsZSI6InNhdGVsbGl6ZXIuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
