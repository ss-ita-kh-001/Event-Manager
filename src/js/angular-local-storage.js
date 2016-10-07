/**
 * An Angular module that gives you access to the browsers local storage
 * @version v0.5.1 - 2016-09-27
 * @link https://github.com/grevory/angular-local-storage
 * @author grevory <greg@gregpike.ca>
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */
(function (window, angular) {
var isDefined = angular.isDefined,
  isUndefined = angular.isUndefined,
  isNumber = angular.isNumber,
  isObject = angular.isObject,
  isArray = angular.isArray,
  isString = angular.isString,
  extend = angular.extend,
  toJson = angular.toJson;

angular
  .module('LocalStorageModule', [])
  .provider('localStorageService', function() {
    // You should set a prefix to avoid overwriting any local storage variables from the rest of your app
    // e.g. localStorageServiceProvider.setPrefix('yourAppName');
    // With provider you can use config as this:
    // myApp.config(function (localStorageServiceProvider) {
    //    localStorageServiceProvider.prefix = 'yourAppName';
    // });
    this.prefix = 'ls';

    // You could change web storage type localstorage or sessionStorage
    this.storageType = 'localStorage';

    // Cookie options (usually in case of fallback)
    // expiry = Number of days before cookies expire // 0 = Does not expire
    // path = The web path the cookie represents
    // secure = Wether the cookies should be secure (i.e only sent on HTTPS requests)
    this.cookie = {
      expiry: 30,
      path: '/',
      secure: false
    };

    // Decides wether we should default to cookies if localstorage is not supported.
    this.defaultToCookie = true;

    // Send signals for each of the following actions?
    this.notify = {
      setItem: true,
      removeItem: false
    };

    // Setter for the prefix
    this.setPrefix = function(prefix) {
      this.prefix = prefix;
      return this;
    };

    // Setter for the storageType
    this.setStorageType = function(storageType) {
      this.storageType = storageType;
      return this;
    };
    // Setter for defaultToCookie value, default is true.
    this.setDefaultToCookie = function (shouldDefault) {
      this.defaultToCookie = !!shouldDefault; // Double-not to make sure it's a bool value.
      return this;
    };
    // Setter for cookie config
    this.setStorageCookie = function(exp, path, secure) {
      this.cookie.expiry = exp;
      this.cookie.path = path;
      this.cookie.secure = secure;
      return this;
    };

    // Setter for cookie domain
    this.setStorageCookieDomain = function(domain) {
      this.cookie.domain = domain;
      return this;
    };

    // Setter for notification config
    // itemSet & itemRemove should be booleans
    this.setNotify = function(itemSet, itemRemove) {
      this.notify = {
        setItem: itemSet,
        removeItem: itemRemove
      };
      return this;
    };

    this.$get = ['$rootScope', '$window', '$document', '$parse','$timeout', function($rootScope, $window, $document, $parse, $timeout) {
      var self = this;
      var prefix = self.prefix;
      var cookie = self.cookie;
      var notify = self.notify;
      var storageType = self.storageType;
      var webStorage;

      // When Angular's $document is not available
      if (!$document) {
        $document = document;
      } else if ($document[0]) {
        $document = $document[0];
      }

      // If there is a prefix set in the config lets use that with an appended period for readability
      if (prefix.substr(-1) !== '.') {
        prefix = !!prefix ? prefix + '.' : '';
      }
      var deriveQualifiedKey = function(key) {
        return prefix + key;
      };

      // Removes prefix from the key.
      var underiveQualifiedKey = function (key) {
        return key.replace(new RegExp('^' + prefix, 'g'), '');
      };

      // Check if the key is within our prefix namespace.
      var isKeyPrefixOurs = function (key) {
        return key.indexOf(prefix) === 0;
      };

      // Checks the browser to see if local storage is supported
      var checkSupport = function () {
        try {
          var supported = (storageType in $window && $window[storageType] !== null);

          // When Safari (OS X or iOS) is in private browsing mode, it appears as though localStorage
          // is available, but trying to call .setItem throws an exception.
          //
          // "QUOTA_EXCEEDED_ERR: DOM Exception 22: An attempt was made to add something to storage
          // that exceeded the quota."
          var key = deriveQualifiedKey('__' + Math.round(Math.random() * 1e7));
          if (supported) {
            webStorage = $window[storageType];
            webStorage.setItem(key, '');
            webStorage.removeItem(key);
          }

          return supported;
        } catch (e) {
          // Only change storageType to cookies if defaulting is enabled.
          if (self.defaultToCookie)
            storageType = 'cookie';
          $rootScope.$broadcast('LocalStorageModule.notification.error', e.message);
          return false;
        }
      };
      var browserSupportsLocalStorage = checkSupport();

      // Directly adds a value to local storage
      // If local storage is not available in the browser use cookies
      // Example use: localStorageService.add('library','angular');
      var addToLocalStorage = function (key, value, type) {
        setStorageType(type);

        // Let's convert undefined values to null to get the value consistent
        if (isUndefined(value)) {
          value = null;
        } else {
          value = toJson(value);
        }

        // If this browser does not support local storage use cookies
        if (!browserSupportsLocalStorage && self.defaultToCookie || self.storageType === 'cookie') {
          if (!browserSupportsLocalStorage) {
            $rootScope.$broadcast('LocalStorageModule.notification.warning', 'LOCAL_STORAGE_NOT_SUPPORTED');
          }

          if (notify.setItem) {
            $rootScope.$broadcast('LocalStorageModule.notification.setitem', {key: key, newvalue: value, storageType: 'cookie'});
          }
          return addToCookies(key, value);
        }

        try {
          if (webStorage) {
            webStorage.setItem(deriveQualifiedKey(key), value);
          }
          if (notify.setItem) {
            $rootScope.$broadcast('LocalStorageModule.notification.setitem', {key: key, newvalue: value, storageType: self.storageType});
          }
        } catch (e) {
          $rootScope.$broadcast('LocalStorageModule.notification.error', e.message);
          return addToCookies(key, value);
        }
        return true;
      };

      // Directly get a value from local storage
      // Example use: localStorageService.get('library'); // returns 'angular'
      var getFromLocalStorage = function (key, type) {
        setStorageType(type);

        if (!browserSupportsLocalStorage && self.defaultToCookie  || self.storageType === 'cookie') {
          if (!browserSupportsLocalStorage) {
            $rootScope.$broadcast('LocalStorageModule.notification.warning', 'LOCAL_STORAGE_NOT_SUPPORTED');
          }

          return getFromCookies(key);
        }

        var item = webStorage ? webStorage.getItem(deriveQualifiedKey(key)) : null;
        // angular.toJson will convert null to 'null', so a proper conversion is needed
        // FIXME not a perfect solution, since a valid 'null' string can't be stored
        if (!item || item === 'null') {
          return null;
        }

        try {
          return JSON.parse(item);
        } catch (e) {
          return item;
        }
      };

      // Remove an item from local storage
      // Example use: localStorageService.remove('library'); // removes the key/value pair of library='angular'
      //
      // This is var-arg removal, check the last argument to see if it is a storageType
      // and set type accordingly before removing.
      //
      var removeFromLocalStorage = function () {
        // can't pop on arguments, so we do this
        var consumed = 0;
        if (arguments.length >= 1 &&
            (arguments[arguments.length - 1] === 'localStorage' ||
             arguments[arguments.length - 1] === 'sessionStorage')) {
          consumed = 1;
          setStorageType(arguments[arguments.length - 1]);
        }

        var i, key;
        for (i = 0; i < arguments.length - consumed; i++) {
          key = arguments[i];
          if (!browserSupportsLocalStorage && self.defaultToCookie || self.storageType === 'cookie') {
            if (!browserSupportsLocalStorage) {
              $rootScope.$broadcast('LocalStorageModule.notification.warning', 'LOCAL_STORAGE_NOT_SUPPORTED');
            }

            if (notify.removeItem) {
              $rootScope.$broadcast('LocalStorageModule.notification.removeitem', {key: key, storageType: 'cookie'});
            }
            removeFromCookies(key);
          }
          else {
            try {
              webStorage.removeItem(deriveQualifiedKey(key));
              if (notify.removeItem) {
                $rootScope.$broadcast('LocalStorageModule.notification.removeitem', {
                  key: key,
                  storageType: self.storageType
                });
              }
            } catch (e) {
              $rootScope.$broadcast('LocalStorageModule.notification.error', e.message);
              removeFromCookies(key);
            }
          }
        }
      };

      // Return array of keys for local storage
      // Example use: var keys = localStorageService.keys()
      var getKeysForLocalStorage = function (type) {
        setStorageType(type);

        if (!browserSupportsLocalStorage) {
          $rootScope.$broadcast('LocalStorageModule.notification.warning', 'LOCAL_STORAGE_NOT_SUPPORTED');
          return [];
        }

        var prefixLength = prefix.length;
        var keys = [];
        for (var key in webStorage) {
          // Only return keys that are for this app
          if (key.substr(0, prefixLength) === prefix) {
            try {
              keys.push(key.substr(prefixLength));
            } catch (e) {
              $rootScope.$broadcast('LocalStorageModule.notification.error', e.Description);
              return [];
            }
          }
        }
        return keys;
      };

      // Remove all data for this app from local storage
      // Also optionally takes a regular expression string and removes the matching key-value pairs
      // Example use: localStorageService.clearAll();
      // Should be used mostly for development purposes
      var clearAllFromLocalStorage = function (regularExpression, type) {
        setStorageType(type);

        // Setting both regular expressions independently
        // Empty strings result in catchall RegExp
        var prefixRegex = !!prefix ? new RegExp('^' + prefix) : new RegExp();
        var testRegex = !!regularExpression ? new RegExp(regularExpression) : new RegExp();

        if (!browserSupportsLocalStorage && self.defaultToCookie  || self.storageType === 'cookie') {
          if (!browserSupportsLocalStorage) {
            $rootScope.$broadcast('LocalStorageModule.notification.warning', 'LOCAL_STORAGE_NOT_SUPPORTED');
          }
          return clearAllFromCookies();
        }
        if (!browserSupportsLocalStorage && !self.defaultToCookie)
          return false;
        var prefixLength = prefix.length;

        for (var key in webStorage) {
          // Only remove items that are for this app and match the regular expression
          if (prefixRegex.test(key) && testRegex.test(key.substr(prefixLength))) {
            try {
              removeFromLocalStorage(key.substr(prefixLength));
            } catch (e) {
              $rootScope.$broadcast('LocalStorageModule.notification.error', e.message);
              return clearAllFromCookies();
            }
          }
        }
        return true;
      };

      // Checks the browser to see if cookies are supported
      var browserSupportsCookies = (function() {
        try {
          return $window.navigator.cookieEnabled ||
          ("cookie" in $document && ($document.cookie.length > 0 ||
            ($document.cookie = "test").indexOf.call($document.cookie, "test") > -1));
          } catch (e) {
            $rootScope.$broadcast('LocalStorageModule.notification.error', e.message);
            return false;
          }
        }());

        // Directly adds a value to cookies
        // Typically used as a fallback if local storage is not available in the browser
        // Example use: localStorageService.cookie.add('library','angular');
        var addToCookies = function (key, value, daysToExpiry, secure) {

          if (isUndefined(value)) {
            return false;
          } else if(isArray(value) || isObject(value)) {
            value = toJson(value);
          }

          if (!browserSupportsCookies) {
            $rootScope.$broadcast('LocalStorageModule.notification.error', 'COOKIES_NOT_SUPPORTED');
            return false;
          }

          try {
            var expiry = '',
            expiryDate = new Date(),
            cookieDomain = '';

            if (value === null) {
              // Mark that the cookie has expired one day ago
              expiryDate.setTime(expiryDate.getTime() + (-1 * 24 * 60 * 60 * 1000));
              expiry = "; expires=" + expiryDate.toGMTString();
              value = '';
            } else if (isNumber(daysToExpiry) && daysToExpiry !== 0) {
              expiryDate.setTime(expiryDate.getTime() + (daysToExpiry * 24 * 60 * 60 * 1000));
              expiry = "; expires=" + expiryDate.toGMTString();
            } else if (cookie.expiry !== 0) {
              expiryDate.setTime(expiryDate.getTime() + (cookie.expiry * 24 * 60 * 60 * 1000));
              expiry = "; expires=" + expiryDate.toGMTString();
            }
            if (!!key) {
              var cookiePath = "; path=" + cookie.path;
              if (cookie.domain) {
                cookieDomain = "; domain=" + cookie.domain;
              }
              /* Providing the secure parameter always takes precedence over config
               * (allows developer to mix and match secure + non-secure) */
              if (typeof secure === 'boolean') {
                  if (secure === true) {
                      /* We've explicitly specified secure,
                       * add the secure attribute to the cookie (after domain) */
                      cookieDomain += "; secure";
                  }
                  // else - secure has been supplied but isn't true - so don't set secure flag, regardless of what config says
              }
              else if (cookie.secure === true) {
                  // secure parameter wasn't specified, get default from config
                  cookieDomain += "; secure";
              }
              $document.cookie = deriveQualifiedKey(key) + "=" + encodeURIComponent(value) + expiry + cookiePath + cookieDomain;
            }
          } catch (e) {
            $rootScope.$broadcast('LocalStorageModule.notification.error', e.message);
            return false;
          }
          return true;
        };

        // Directly get a value from a cookie
        // Example use: localStorageService.cookie.get('library'); // returns 'angular'
        var getFromCookies = function (key) {
          if (!browserSupportsCookies) {
            $rootScope.$broadcast('LocalStorageModule.notification.error', 'COOKIES_NOT_SUPPORTED');
            return false;
          }

          var cookies = $document.cookie && $document.cookie.split(';') || [];
          for(var i=0; i < cookies.length; i++) {
            var thisCookie = cookies[i];
            while (thisCookie.charAt(0) === ' ') {
              thisCookie = thisCookie.substring(1,thisCookie.length);
            }
            if (thisCookie.indexOf(deriveQualifiedKey(key) + '=') === 0) {
              var storedValues = decodeURIComponent(thisCookie.substring(prefix.length + key.length + 1, thisCookie.length));
              try {
                var parsedValue = JSON.parse(storedValues);
                return typeof(parsedValue) === 'number' ? storedValues : parsedValue;
              } catch(e) {
                return storedValues;
              }
            }
          }
          return null;
        };

        var removeFromCookies = function (key) {
          addToCookies(key,null);
        };

        var clearAllFromCookies = function () {
          var thisCookie = null;
          var prefixLength = prefix.length;
          var cookies = $document.cookie.split(';');
          for(var i = 0; i < cookies.length; i++) {
            thisCookie = cookies[i];

            while (thisCookie.charAt(0) === ' ') {
              thisCookie = thisCookie.substring(1, thisCookie.length);
            }

            var key = thisCookie.substring(prefixLength, thisCookie.indexOf('='));
            removeFromCookies(key);
          }
        };

        var getStorageType = function() {
          return storageType;
        };

        var setStorageType = function(type) {
          if (type && storageType !== type) {
            storageType = type;
            browserSupportsLocalStorage = checkSupport();
          }
          return browserSupportsLocalStorage;
        };

        // Add a listener on scope variable to save its changes to local storage
        // Return a function which when called cancels binding
        var bindToScope = function(scope, key, def, lsKey, type) {
          lsKey = lsKey || key;
          var value = getFromLocalStorage(lsKey, type);

          if (value === null && isDefined(def)) {
            value = def;
          } else if (isObject(value) && isObject(def)) {
            value = extend(value, def);
          }

          $parse(key).assign(scope, value);

          return scope.$watch(key, function(newVal) {
            addToLocalStorage(lsKey, newVal, type);
          }, isObject(scope[key]));
        };

        // Add listener to local storage, for update callbacks.
        if (browserSupportsLocalStorage) {
            if ($window.addEventListener) {
                $window.addEventListener("storage", handleStorageChangeCallback, false);
                $rootScope.$on('$destroy', function() {
                    $window.removeEventListener("storage", handleStorageChangeCallback);
                });
            } else if($window.attachEvent){
                // attachEvent and detachEvent are proprietary to IE v6-10
                $window.attachEvent("onstorage", handleStorageChangeCallback);
                $rootScope.$on('$destroy', function() {
                    $window.detachEvent("onstorage", handleStorageChangeCallback);
                });
            }
        }

        // Callback handler for storage changed.
        function handleStorageChangeCallback(e) {
            if (!e) { e = $window.event; }
            if (notify.setItem) {
                if (isString(e.key) && isKeyPrefixOurs(e.key)) {
                    var key = underiveQualifiedKey(e.key);
                    // Use timeout, to avoid using $rootScope.$apply.
                    $timeout(function () {
                        $rootScope.$broadcast('LocalStorageModule.notification.changed', { key: key, newvalue: e.newValue, storageType: self.storageType });
                    });
                }
            }
        }

        // Return localStorageService.length
        // ignore keys that not owned
        var lengthOfLocalStorage = function(type) {
          setStorageType(type);

          var count = 0;
          var storage = $window[storageType];
          for(var i = 0; i < storage.length; i++) {
            if(storage.key(i).indexOf(prefix) === 0 ) {
              count++;
            }
          }
          return count;
        };

        return {
          isSupported: browserSupportsLocalStorage,
          getStorageType: getStorageType,
          setStorageType: setStorageType,
          set: addToLocalStorage,
          add: addToLocalStorage, //DEPRECATED
          get: getFromLocalStorage,
          keys: getKeysForLocalStorage,
          remove: removeFromLocalStorage,
          clearAll: clearAllFromLocalStorage,
          bind: bindToScope,
          deriveKey: deriveQualifiedKey,
          underiveKey: underiveQualifiedKey,
          length: lengthOfLocalStorage,
          defaultToCookie: this.defaultToCookie,
          cookie: {
            isSupported: browserSupportsCookies,
            set: addToCookies,
            add: addToCookies, //DEPRECATED
            get: getFromCookies,
            remove: removeFromCookies,
            clearAll: clearAllFromCookies
          }
        };
      }];
  });
})(window, window.angular);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJhbmd1bGFyLWxvY2FsLXN0b3JhZ2UuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIEFuIEFuZ3VsYXIgbW9kdWxlIHRoYXQgZ2l2ZXMgeW91IGFjY2VzcyB0byB0aGUgYnJvd3NlcnMgbG9jYWwgc3RvcmFnZVxyXG4gKiBAdmVyc2lvbiB2MC41LjEgLSAyMDE2LTA5LTI3XHJcbiAqIEBsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9ncmV2b3J5L2FuZ3VsYXItbG9jYWwtc3RvcmFnZVxyXG4gKiBAYXV0aG9yIGdyZXZvcnkgPGdyZWdAZ3JlZ3Bpa2UuY2E+XHJcbiAqIEBsaWNlbnNlIE1JVCBMaWNlbnNlLCBodHRwOi8vd3d3Lm9wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL01JVFxyXG4gKi9cclxuKGZ1bmN0aW9uICh3aW5kb3csIGFuZ3VsYXIpIHtcclxudmFyIGlzRGVmaW5lZCA9IGFuZ3VsYXIuaXNEZWZpbmVkLFxyXG4gIGlzVW5kZWZpbmVkID0gYW5ndWxhci5pc1VuZGVmaW5lZCxcclxuICBpc051bWJlciA9IGFuZ3VsYXIuaXNOdW1iZXIsXHJcbiAgaXNPYmplY3QgPSBhbmd1bGFyLmlzT2JqZWN0LFxyXG4gIGlzQXJyYXkgPSBhbmd1bGFyLmlzQXJyYXksXHJcbiAgaXNTdHJpbmcgPSBhbmd1bGFyLmlzU3RyaW5nLFxyXG4gIGV4dGVuZCA9IGFuZ3VsYXIuZXh0ZW5kLFxyXG4gIHRvSnNvbiA9IGFuZ3VsYXIudG9Kc29uO1xyXG5cclxuYW5ndWxhclxyXG4gIC5tb2R1bGUoJ0xvY2FsU3RvcmFnZU1vZHVsZScsIFtdKVxyXG4gIC5wcm92aWRlcignbG9jYWxTdG9yYWdlU2VydmljZScsIGZ1bmN0aW9uKCkge1xyXG4gICAgLy8gWW91IHNob3VsZCBzZXQgYSBwcmVmaXggdG8gYXZvaWQgb3ZlcndyaXRpbmcgYW55IGxvY2FsIHN0b3JhZ2UgdmFyaWFibGVzIGZyb20gdGhlIHJlc3Qgb2YgeW91ciBhcHBcclxuICAgIC8vIGUuZy4gbG9jYWxTdG9yYWdlU2VydmljZVByb3ZpZGVyLnNldFByZWZpeCgneW91ckFwcE5hbWUnKTtcclxuICAgIC8vIFdpdGggcHJvdmlkZXIgeW91IGNhbiB1c2UgY29uZmlnIGFzIHRoaXM6XHJcbiAgICAvLyBteUFwcC5jb25maWcoZnVuY3Rpb24gKGxvY2FsU3RvcmFnZVNlcnZpY2VQcm92aWRlcikge1xyXG4gICAgLy8gICAgbG9jYWxTdG9yYWdlU2VydmljZVByb3ZpZGVyLnByZWZpeCA9ICd5b3VyQXBwTmFtZSc7XHJcbiAgICAvLyB9KTtcclxuICAgIHRoaXMucHJlZml4ID0gJ2xzJztcclxuXHJcbiAgICAvLyBZb3UgY291bGQgY2hhbmdlIHdlYiBzdG9yYWdlIHR5cGUgbG9jYWxzdG9yYWdlIG9yIHNlc3Npb25TdG9yYWdlXHJcbiAgICB0aGlzLnN0b3JhZ2VUeXBlID0gJ2xvY2FsU3RvcmFnZSc7XHJcblxyXG4gICAgLy8gQ29va2llIG9wdGlvbnMgKHVzdWFsbHkgaW4gY2FzZSBvZiBmYWxsYmFjaylcclxuICAgIC8vIGV4cGlyeSA9IE51bWJlciBvZiBkYXlzIGJlZm9yZSBjb29raWVzIGV4cGlyZSAvLyAwID0gRG9lcyBub3QgZXhwaXJlXHJcbiAgICAvLyBwYXRoID0gVGhlIHdlYiBwYXRoIHRoZSBjb29raWUgcmVwcmVzZW50c1xyXG4gICAgLy8gc2VjdXJlID0gV2V0aGVyIHRoZSBjb29raWVzIHNob3VsZCBiZSBzZWN1cmUgKGkuZSBvbmx5IHNlbnQgb24gSFRUUFMgcmVxdWVzdHMpXHJcbiAgICB0aGlzLmNvb2tpZSA9IHtcclxuICAgICAgZXhwaXJ5OiAzMCxcclxuICAgICAgcGF0aDogJy8nLFxyXG4gICAgICBzZWN1cmU6IGZhbHNlXHJcbiAgICB9O1xyXG5cclxuICAgIC8vIERlY2lkZXMgd2V0aGVyIHdlIHNob3VsZCBkZWZhdWx0IHRvIGNvb2tpZXMgaWYgbG9jYWxzdG9yYWdlIGlzIG5vdCBzdXBwb3J0ZWQuXHJcbiAgICB0aGlzLmRlZmF1bHRUb0Nvb2tpZSA9IHRydWU7XHJcblxyXG4gICAgLy8gU2VuZCBzaWduYWxzIGZvciBlYWNoIG9mIHRoZSBmb2xsb3dpbmcgYWN0aW9ucz9cclxuICAgIHRoaXMubm90aWZ5ID0ge1xyXG4gICAgICBzZXRJdGVtOiB0cnVlLFxyXG4gICAgICByZW1vdmVJdGVtOiBmYWxzZVxyXG4gICAgfTtcclxuXHJcbiAgICAvLyBTZXR0ZXIgZm9yIHRoZSBwcmVmaXhcclxuICAgIHRoaXMuc2V0UHJlZml4ID0gZnVuY3Rpb24ocHJlZml4KSB7XHJcbiAgICAgIHRoaXMucHJlZml4ID0gcHJlZml4O1xyXG4gICAgICByZXR1cm4gdGhpcztcclxuICAgIH07XHJcblxyXG4gICAgLy8gU2V0dGVyIGZvciB0aGUgc3RvcmFnZVR5cGVcclxuICAgIHRoaXMuc2V0U3RvcmFnZVR5cGUgPSBmdW5jdGlvbihzdG9yYWdlVHlwZSkge1xyXG4gICAgICB0aGlzLnN0b3JhZ2VUeXBlID0gc3RvcmFnZVR5cGU7XHJcbiAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfTtcclxuICAgIC8vIFNldHRlciBmb3IgZGVmYXVsdFRvQ29va2llIHZhbHVlLCBkZWZhdWx0IGlzIHRydWUuXHJcbiAgICB0aGlzLnNldERlZmF1bHRUb0Nvb2tpZSA9IGZ1bmN0aW9uIChzaG91bGREZWZhdWx0KSB7XHJcbiAgICAgIHRoaXMuZGVmYXVsdFRvQ29va2llID0gISFzaG91bGREZWZhdWx0OyAvLyBEb3VibGUtbm90IHRvIG1ha2Ugc3VyZSBpdCdzIGEgYm9vbCB2YWx1ZS5cclxuICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9O1xyXG4gICAgLy8gU2V0dGVyIGZvciBjb29raWUgY29uZmlnXHJcbiAgICB0aGlzLnNldFN0b3JhZ2VDb29raWUgPSBmdW5jdGlvbihleHAsIHBhdGgsIHNlY3VyZSkge1xyXG4gICAgICB0aGlzLmNvb2tpZS5leHBpcnkgPSBleHA7XHJcbiAgICAgIHRoaXMuY29va2llLnBhdGggPSBwYXRoO1xyXG4gICAgICB0aGlzLmNvb2tpZS5zZWN1cmUgPSBzZWN1cmU7XHJcbiAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfTtcclxuXHJcbiAgICAvLyBTZXR0ZXIgZm9yIGNvb2tpZSBkb21haW5cclxuICAgIHRoaXMuc2V0U3RvcmFnZUNvb2tpZURvbWFpbiA9IGZ1bmN0aW9uKGRvbWFpbikge1xyXG4gICAgICB0aGlzLmNvb2tpZS5kb21haW4gPSBkb21haW47XHJcbiAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfTtcclxuXHJcbiAgICAvLyBTZXR0ZXIgZm9yIG5vdGlmaWNhdGlvbiBjb25maWdcclxuICAgIC8vIGl0ZW1TZXQgJiBpdGVtUmVtb3ZlIHNob3VsZCBiZSBib29sZWFuc1xyXG4gICAgdGhpcy5zZXROb3RpZnkgPSBmdW5jdGlvbihpdGVtU2V0LCBpdGVtUmVtb3ZlKSB7XHJcbiAgICAgIHRoaXMubm90aWZ5ID0ge1xyXG4gICAgICAgIHNldEl0ZW06IGl0ZW1TZXQsXHJcbiAgICAgICAgcmVtb3ZlSXRlbTogaXRlbVJlbW92ZVxyXG4gICAgICB9O1xyXG4gICAgICByZXR1cm4gdGhpcztcclxuICAgIH07XHJcblxyXG4gICAgdGhpcy4kZ2V0ID0gWyckcm9vdFNjb3BlJywgJyR3aW5kb3cnLCAnJGRvY3VtZW50JywgJyRwYXJzZScsJyR0aW1lb3V0JywgZnVuY3Rpb24oJHJvb3RTY29wZSwgJHdpbmRvdywgJGRvY3VtZW50LCAkcGFyc2UsICR0aW1lb3V0KSB7XHJcbiAgICAgIHZhciBzZWxmID0gdGhpcztcclxuICAgICAgdmFyIHByZWZpeCA9IHNlbGYucHJlZml4O1xyXG4gICAgICB2YXIgY29va2llID0gc2VsZi5jb29raWU7XHJcbiAgICAgIHZhciBub3RpZnkgPSBzZWxmLm5vdGlmeTtcclxuICAgICAgdmFyIHN0b3JhZ2VUeXBlID0gc2VsZi5zdG9yYWdlVHlwZTtcclxuICAgICAgdmFyIHdlYlN0b3JhZ2U7XHJcblxyXG4gICAgICAvLyBXaGVuIEFuZ3VsYXIncyAkZG9jdW1lbnQgaXMgbm90IGF2YWlsYWJsZVxyXG4gICAgICBpZiAoISRkb2N1bWVudCkge1xyXG4gICAgICAgICRkb2N1bWVudCA9IGRvY3VtZW50O1xyXG4gICAgICB9IGVsc2UgaWYgKCRkb2N1bWVudFswXSkge1xyXG4gICAgICAgICRkb2N1bWVudCA9ICRkb2N1bWVudFswXTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gSWYgdGhlcmUgaXMgYSBwcmVmaXggc2V0IGluIHRoZSBjb25maWcgbGV0cyB1c2UgdGhhdCB3aXRoIGFuIGFwcGVuZGVkIHBlcmlvZCBmb3IgcmVhZGFiaWxpdHlcclxuICAgICAgaWYgKHByZWZpeC5zdWJzdHIoLTEpICE9PSAnLicpIHtcclxuICAgICAgICBwcmVmaXggPSAhIXByZWZpeCA/IHByZWZpeCArICcuJyA6ICcnO1xyXG4gICAgICB9XHJcbiAgICAgIHZhciBkZXJpdmVRdWFsaWZpZWRLZXkgPSBmdW5jdGlvbihrZXkpIHtcclxuICAgICAgICByZXR1cm4gcHJlZml4ICsga2V5O1xyXG4gICAgICB9O1xyXG5cclxuICAgICAgLy8gUmVtb3ZlcyBwcmVmaXggZnJvbSB0aGUga2V5LlxyXG4gICAgICB2YXIgdW5kZXJpdmVRdWFsaWZpZWRLZXkgPSBmdW5jdGlvbiAoa2V5KSB7XHJcbiAgICAgICAgcmV0dXJuIGtleS5yZXBsYWNlKG5ldyBSZWdFeHAoJ14nICsgcHJlZml4LCAnZycpLCAnJyk7XHJcbiAgICAgIH07XHJcblxyXG4gICAgICAvLyBDaGVjayBpZiB0aGUga2V5IGlzIHdpdGhpbiBvdXIgcHJlZml4IG5hbWVzcGFjZS5cclxuICAgICAgdmFyIGlzS2V5UHJlZml4T3VycyA9IGZ1bmN0aW9uIChrZXkpIHtcclxuICAgICAgICByZXR1cm4ga2V5LmluZGV4T2YocHJlZml4KSA9PT0gMDtcclxuICAgICAgfTtcclxuXHJcbiAgICAgIC8vIENoZWNrcyB0aGUgYnJvd3NlciB0byBzZWUgaWYgbG9jYWwgc3RvcmFnZSBpcyBzdXBwb3J0ZWRcclxuICAgICAgdmFyIGNoZWNrU3VwcG9ydCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgdmFyIHN1cHBvcnRlZCA9IChzdG9yYWdlVHlwZSBpbiAkd2luZG93ICYmICR3aW5kb3dbc3RvcmFnZVR5cGVdICE9PSBudWxsKTtcclxuXHJcbiAgICAgICAgICAvLyBXaGVuIFNhZmFyaSAoT1MgWCBvciBpT1MpIGlzIGluIHByaXZhdGUgYnJvd3NpbmcgbW9kZSwgaXQgYXBwZWFycyBhcyB0aG91Z2ggbG9jYWxTdG9yYWdlXHJcbiAgICAgICAgICAvLyBpcyBhdmFpbGFibGUsIGJ1dCB0cnlpbmcgdG8gY2FsbCAuc2V0SXRlbSB0aHJvd3MgYW4gZXhjZXB0aW9uLlxyXG4gICAgICAgICAgLy9cclxuICAgICAgICAgIC8vIFwiUVVPVEFfRVhDRUVERURfRVJSOiBET00gRXhjZXB0aW9uIDIyOiBBbiBhdHRlbXB0IHdhcyBtYWRlIHRvIGFkZCBzb21ldGhpbmcgdG8gc3RvcmFnZVxyXG4gICAgICAgICAgLy8gdGhhdCBleGNlZWRlZCB0aGUgcXVvdGEuXCJcclxuICAgICAgICAgIHZhciBrZXkgPSBkZXJpdmVRdWFsaWZpZWRLZXkoJ19fJyArIE1hdGgucm91bmQoTWF0aC5yYW5kb20oKSAqIDFlNykpO1xyXG4gICAgICAgICAgaWYgKHN1cHBvcnRlZCkge1xyXG4gICAgICAgICAgICB3ZWJTdG9yYWdlID0gJHdpbmRvd1tzdG9yYWdlVHlwZV07XHJcbiAgICAgICAgICAgIHdlYlN0b3JhZ2Uuc2V0SXRlbShrZXksICcnKTtcclxuICAgICAgICAgICAgd2ViU3RvcmFnZS5yZW1vdmVJdGVtKGtleSk7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgcmV0dXJuIHN1cHBvcnRlZDtcclxuICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAvLyBPbmx5IGNoYW5nZSBzdG9yYWdlVHlwZSB0byBjb29raWVzIGlmIGRlZmF1bHRpbmcgaXMgZW5hYmxlZC5cclxuICAgICAgICAgIGlmIChzZWxmLmRlZmF1bHRUb0Nvb2tpZSlcclxuICAgICAgICAgICAgc3RvcmFnZVR5cGUgPSAnY29va2llJztcclxuICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgnTG9jYWxTdG9yYWdlTW9kdWxlLm5vdGlmaWNhdGlvbi5lcnJvcicsIGUubWVzc2FnZSk7XHJcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICB9O1xyXG4gICAgICB2YXIgYnJvd3NlclN1cHBvcnRzTG9jYWxTdG9yYWdlID0gY2hlY2tTdXBwb3J0KCk7XHJcblxyXG4gICAgICAvLyBEaXJlY3RseSBhZGRzIGEgdmFsdWUgdG8gbG9jYWwgc3RvcmFnZVxyXG4gICAgICAvLyBJZiBsb2NhbCBzdG9yYWdlIGlzIG5vdCBhdmFpbGFibGUgaW4gdGhlIGJyb3dzZXIgdXNlIGNvb2tpZXNcclxuICAgICAgLy8gRXhhbXBsZSB1c2U6IGxvY2FsU3RvcmFnZVNlcnZpY2UuYWRkKCdsaWJyYXJ5JywnYW5ndWxhcicpO1xyXG4gICAgICB2YXIgYWRkVG9Mb2NhbFN0b3JhZ2UgPSBmdW5jdGlvbiAoa2V5LCB2YWx1ZSwgdHlwZSkge1xyXG4gICAgICAgIHNldFN0b3JhZ2VUeXBlKHR5cGUpO1xyXG5cclxuICAgICAgICAvLyBMZXQncyBjb252ZXJ0IHVuZGVmaW5lZCB2YWx1ZXMgdG8gbnVsbCB0byBnZXQgdGhlIHZhbHVlIGNvbnNpc3RlbnRcclxuICAgICAgICBpZiAoaXNVbmRlZmluZWQodmFsdWUpKSB7XHJcbiAgICAgICAgICB2YWx1ZSA9IG51bGw7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHZhbHVlID0gdG9Kc29uKHZhbHVlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIElmIHRoaXMgYnJvd3NlciBkb2VzIG5vdCBzdXBwb3J0IGxvY2FsIHN0b3JhZ2UgdXNlIGNvb2tpZXNcclxuICAgICAgICBpZiAoIWJyb3dzZXJTdXBwb3J0c0xvY2FsU3RvcmFnZSAmJiBzZWxmLmRlZmF1bHRUb0Nvb2tpZSB8fCBzZWxmLnN0b3JhZ2VUeXBlID09PSAnY29va2llJykge1xyXG4gICAgICAgICAgaWYgKCFicm93c2VyU3VwcG9ydHNMb2NhbFN0b3JhZ2UpIHtcclxuICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCdMb2NhbFN0b3JhZ2VNb2R1bGUubm90aWZpY2F0aW9uLndhcm5pbmcnLCAnTE9DQUxfU1RPUkFHRV9OT1RfU1VQUE9SVEVEJyk7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgaWYgKG5vdGlmeS5zZXRJdGVtKSB7XHJcbiAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgnTG9jYWxTdG9yYWdlTW9kdWxlLm5vdGlmaWNhdGlvbi5zZXRpdGVtJywge2tleToga2V5LCBuZXd2YWx1ZTogdmFsdWUsIHN0b3JhZ2VUeXBlOiAnY29va2llJ30pO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgcmV0dXJuIGFkZFRvQ29va2llcyhrZXksIHZhbHVlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICBpZiAod2ViU3RvcmFnZSkge1xyXG4gICAgICAgICAgICB3ZWJTdG9yYWdlLnNldEl0ZW0oZGVyaXZlUXVhbGlmaWVkS2V5KGtleSksIHZhbHVlKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGlmIChub3RpZnkuc2V0SXRlbSkge1xyXG4gICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ0xvY2FsU3RvcmFnZU1vZHVsZS5ub3RpZmljYXRpb24uc2V0aXRlbScsIHtrZXk6IGtleSwgbmV3dmFsdWU6IHZhbHVlLCBzdG9yYWdlVHlwZTogc2VsZi5zdG9yYWdlVHlwZX0pO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgnTG9jYWxTdG9yYWdlTW9kdWxlLm5vdGlmaWNhdGlvbi5lcnJvcicsIGUubWVzc2FnZSk7XHJcbiAgICAgICAgICByZXR1cm4gYWRkVG9Db29raWVzKGtleSwgdmFsdWUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgfTtcclxuXHJcbiAgICAgIC8vIERpcmVjdGx5IGdldCBhIHZhbHVlIGZyb20gbG9jYWwgc3RvcmFnZVxyXG4gICAgICAvLyBFeGFtcGxlIHVzZTogbG9jYWxTdG9yYWdlU2VydmljZS5nZXQoJ2xpYnJhcnknKTsgLy8gcmV0dXJucyAnYW5ndWxhcidcclxuICAgICAgdmFyIGdldEZyb21Mb2NhbFN0b3JhZ2UgPSBmdW5jdGlvbiAoa2V5LCB0eXBlKSB7XHJcbiAgICAgICAgc2V0U3RvcmFnZVR5cGUodHlwZSk7XHJcblxyXG4gICAgICAgIGlmICghYnJvd3NlclN1cHBvcnRzTG9jYWxTdG9yYWdlICYmIHNlbGYuZGVmYXVsdFRvQ29va2llICB8fCBzZWxmLnN0b3JhZ2VUeXBlID09PSAnY29va2llJykge1xyXG4gICAgICAgICAgaWYgKCFicm93c2VyU3VwcG9ydHNMb2NhbFN0b3JhZ2UpIHtcclxuICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCdMb2NhbFN0b3JhZ2VNb2R1bGUubm90aWZpY2F0aW9uLndhcm5pbmcnLCAnTE9DQUxfU1RPUkFHRV9OT1RfU1VQUE9SVEVEJyk7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgcmV0dXJuIGdldEZyb21Db29raWVzKGtleSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2YXIgaXRlbSA9IHdlYlN0b3JhZ2UgPyB3ZWJTdG9yYWdlLmdldEl0ZW0oZGVyaXZlUXVhbGlmaWVkS2V5KGtleSkpIDogbnVsbDtcclxuICAgICAgICAvLyBhbmd1bGFyLnRvSnNvbiB3aWxsIGNvbnZlcnQgbnVsbCB0byAnbnVsbCcsIHNvIGEgcHJvcGVyIGNvbnZlcnNpb24gaXMgbmVlZGVkXHJcbiAgICAgICAgLy8gRklYTUUgbm90IGEgcGVyZmVjdCBzb2x1dGlvbiwgc2luY2UgYSB2YWxpZCAnbnVsbCcgc3RyaW5nIGNhbid0IGJlIHN0b3JlZFxyXG4gICAgICAgIGlmICghaXRlbSB8fCBpdGVtID09PSAnbnVsbCcpIHtcclxuICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgIHJldHVybiBKU09OLnBhcnNlKGl0ZW0pO1xyXG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgIHJldHVybiBpdGVtO1xyXG4gICAgICAgIH1cclxuICAgICAgfTtcclxuXHJcbiAgICAgIC8vIFJlbW92ZSBhbiBpdGVtIGZyb20gbG9jYWwgc3RvcmFnZVxyXG4gICAgICAvLyBFeGFtcGxlIHVzZTogbG9jYWxTdG9yYWdlU2VydmljZS5yZW1vdmUoJ2xpYnJhcnknKTsgLy8gcmVtb3ZlcyB0aGUga2V5L3ZhbHVlIHBhaXIgb2YgbGlicmFyeT0nYW5ndWxhcidcclxuICAgICAgLy9cclxuICAgICAgLy8gVGhpcyBpcyB2YXItYXJnIHJlbW92YWwsIGNoZWNrIHRoZSBsYXN0IGFyZ3VtZW50IHRvIHNlZSBpZiBpdCBpcyBhIHN0b3JhZ2VUeXBlXHJcbiAgICAgIC8vIGFuZCBzZXQgdHlwZSBhY2NvcmRpbmdseSBiZWZvcmUgcmVtb3ZpbmcuXHJcbiAgICAgIC8vXHJcbiAgICAgIHZhciByZW1vdmVGcm9tTG9jYWxTdG9yYWdlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIC8vIGNhbid0IHBvcCBvbiBhcmd1bWVudHMsIHNvIHdlIGRvIHRoaXNcclxuICAgICAgICB2YXIgY29uc3VtZWQgPSAwO1xyXG4gICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID49IDEgJiZcclxuICAgICAgICAgICAgKGFyZ3VtZW50c1thcmd1bWVudHMubGVuZ3RoIC0gMV0gPT09ICdsb2NhbFN0b3JhZ2UnIHx8XHJcbiAgICAgICAgICAgICBhcmd1bWVudHNbYXJndW1lbnRzLmxlbmd0aCAtIDFdID09PSAnc2Vzc2lvblN0b3JhZ2UnKSkge1xyXG4gICAgICAgICAgY29uc3VtZWQgPSAxO1xyXG4gICAgICAgICAgc2V0U3RvcmFnZVR5cGUoYXJndW1lbnRzW2FyZ3VtZW50cy5sZW5ndGggLSAxXSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2YXIgaSwga2V5O1xyXG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBhcmd1bWVudHMubGVuZ3RoIC0gY29uc3VtZWQ7IGkrKykge1xyXG4gICAgICAgICAga2V5ID0gYXJndW1lbnRzW2ldO1xyXG4gICAgICAgICAgaWYgKCFicm93c2VyU3VwcG9ydHNMb2NhbFN0b3JhZ2UgJiYgc2VsZi5kZWZhdWx0VG9Db29raWUgfHwgc2VsZi5zdG9yYWdlVHlwZSA9PT0gJ2Nvb2tpZScpIHtcclxuICAgICAgICAgICAgaWYgKCFicm93c2VyU3VwcG9ydHNMb2NhbFN0b3JhZ2UpIHtcclxuICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ0xvY2FsU3RvcmFnZU1vZHVsZS5ub3RpZmljYXRpb24ud2FybmluZycsICdMT0NBTF9TVE9SQUdFX05PVF9TVVBQT1JURUQnKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKG5vdGlmeS5yZW1vdmVJdGVtKSB7XHJcbiAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCdMb2NhbFN0b3JhZ2VNb2R1bGUubm90aWZpY2F0aW9uLnJlbW92ZWl0ZW0nLCB7a2V5OiBrZXksIHN0b3JhZ2VUeXBlOiAnY29va2llJ30pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJlbW92ZUZyb21Db29raWVzKGtleSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICB3ZWJTdG9yYWdlLnJlbW92ZUl0ZW0oZGVyaXZlUXVhbGlmaWVkS2V5KGtleSkpO1xyXG4gICAgICAgICAgICAgIGlmIChub3RpZnkucmVtb3ZlSXRlbSkge1xyXG4gICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCdMb2NhbFN0b3JhZ2VNb2R1bGUubm90aWZpY2F0aW9uLnJlbW92ZWl0ZW0nLCB7XHJcbiAgICAgICAgICAgICAgICAgIGtleToga2V5LFxyXG4gICAgICAgICAgICAgICAgICBzdG9yYWdlVHlwZTogc2VsZi5zdG9yYWdlVHlwZVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCdMb2NhbFN0b3JhZ2VNb2R1bGUubm90aWZpY2F0aW9uLmVycm9yJywgZS5tZXNzYWdlKTtcclxuICAgICAgICAgICAgICByZW1vdmVGcm9tQ29va2llcyhrZXkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9O1xyXG5cclxuICAgICAgLy8gUmV0dXJuIGFycmF5IG9mIGtleXMgZm9yIGxvY2FsIHN0b3JhZ2VcclxuICAgICAgLy8gRXhhbXBsZSB1c2U6IHZhciBrZXlzID0gbG9jYWxTdG9yYWdlU2VydmljZS5rZXlzKClcclxuICAgICAgdmFyIGdldEtleXNGb3JMb2NhbFN0b3JhZ2UgPSBmdW5jdGlvbiAodHlwZSkge1xyXG4gICAgICAgIHNldFN0b3JhZ2VUeXBlKHR5cGUpO1xyXG5cclxuICAgICAgICBpZiAoIWJyb3dzZXJTdXBwb3J0c0xvY2FsU3RvcmFnZSkge1xyXG4gICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCdMb2NhbFN0b3JhZ2VNb2R1bGUubm90aWZpY2F0aW9uLndhcm5pbmcnLCAnTE9DQUxfU1RPUkFHRV9OT1RfU1VQUE9SVEVEJyk7XHJcbiAgICAgICAgICByZXR1cm4gW107XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2YXIgcHJlZml4TGVuZ3RoID0gcHJlZml4Lmxlbmd0aDtcclxuICAgICAgICB2YXIga2V5cyA9IFtdO1xyXG4gICAgICAgIGZvciAodmFyIGtleSBpbiB3ZWJTdG9yYWdlKSB7XHJcbiAgICAgICAgICAvLyBPbmx5IHJldHVybiBrZXlzIHRoYXQgYXJlIGZvciB0aGlzIGFwcFxyXG4gICAgICAgICAgaWYgKGtleS5zdWJzdHIoMCwgcHJlZml4TGVuZ3RoKSA9PT0gcHJlZml4KSB7XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAga2V5cy5wdXNoKGtleS5zdWJzdHIocHJlZml4TGVuZ3RoKSk7XHJcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ0xvY2FsU3RvcmFnZU1vZHVsZS5ub3RpZmljYXRpb24uZXJyb3InLCBlLkRlc2NyaXB0aW9uKTtcclxuICAgICAgICAgICAgICByZXR1cm4gW107XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGtleXM7XHJcbiAgICAgIH07XHJcblxyXG4gICAgICAvLyBSZW1vdmUgYWxsIGRhdGEgZm9yIHRoaXMgYXBwIGZyb20gbG9jYWwgc3RvcmFnZVxyXG4gICAgICAvLyBBbHNvIG9wdGlvbmFsbHkgdGFrZXMgYSByZWd1bGFyIGV4cHJlc3Npb24gc3RyaW5nIGFuZCByZW1vdmVzIHRoZSBtYXRjaGluZyBrZXktdmFsdWUgcGFpcnNcclxuICAgICAgLy8gRXhhbXBsZSB1c2U6IGxvY2FsU3RvcmFnZVNlcnZpY2UuY2xlYXJBbGwoKTtcclxuICAgICAgLy8gU2hvdWxkIGJlIHVzZWQgbW9zdGx5IGZvciBkZXZlbG9wbWVudCBwdXJwb3Nlc1xyXG4gICAgICB2YXIgY2xlYXJBbGxGcm9tTG9jYWxTdG9yYWdlID0gZnVuY3Rpb24gKHJlZ3VsYXJFeHByZXNzaW9uLCB0eXBlKSB7XHJcbiAgICAgICAgc2V0U3RvcmFnZVR5cGUodHlwZSk7XHJcblxyXG4gICAgICAgIC8vIFNldHRpbmcgYm90aCByZWd1bGFyIGV4cHJlc3Npb25zIGluZGVwZW5kZW50bHlcclxuICAgICAgICAvLyBFbXB0eSBzdHJpbmdzIHJlc3VsdCBpbiBjYXRjaGFsbCBSZWdFeHBcclxuICAgICAgICB2YXIgcHJlZml4UmVnZXggPSAhIXByZWZpeCA/IG5ldyBSZWdFeHAoJ14nICsgcHJlZml4KSA6IG5ldyBSZWdFeHAoKTtcclxuICAgICAgICB2YXIgdGVzdFJlZ2V4ID0gISFyZWd1bGFyRXhwcmVzc2lvbiA/IG5ldyBSZWdFeHAocmVndWxhckV4cHJlc3Npb24pIDogbmV3IFJlZ0V4cCgpO1xyXG5cclxuICAgICAgICBpZiAoIWJyb3dzZXJTdXBwb3J0c0xvY2FsU3RvcmFnZSAmJiBzZWxmLmRlZmF1bHRUb0Nvb2tpZSAgfHwgc2VsZi5zdG9yYWdlVHlwZSA9PT0gJ2Nvb2tpZScpIHtcclxuICAgICAgICAgIGlmICghYnJvd3NlclN1cHBvcnRzTG9jYWxTdG9yYWdlKSB7XHJcbiAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgnTG9jYWxTdG9yYWdlTW9kdWxlLm5vdGlmaWNhdGlvbi53YXJuaW5nJywgJ0xPQ0FMX1NUT1JBR0VfTk9UX1NVUFBPUlRFRCcpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgcmV0dXJuIGNsZWFyQWxsRnJvbUNvb2tpZXMoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCFicm93c2VyU3VwcG9ydHNMb2NhbFN0b3JhZ2UgJiYgIXNlbGYuZGVmYXVsdFRvQ29va2llKVxyXG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIHZhciBwcmVmaXhMZW5ndGggPSBwcmVmaXgubGVuZ3RoO1xyXG5cclxuICAgICAgICBmb3IgKHZhciBrZXkgaW4gd2ViU3RvcmFnZSkge1xyXG4gICAgICAgICAgLy8gT25seSByZW1vdmUgaXRlbXMgdGhhdCBhcmUgZm9yIHRoaXMgYXBwIGFuZCBtYXRjaCB0aGUgcmVndWxhciBleHByZXNzaW9uXHJcbiAgICAgICAgICBpZiAocHJlZml4UmVnZXgudGVzdChrZXkpICYmIHRlc3RSZWdleC50ZXN0KGtleS5zdWJzdHIocHJlZml4TGVuZ3RoKSkpIHtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICByZW1vdmVGcm9tTG9jYWxTdG9yYWdlKGtleS5zdWJzdHIocHJlZml4TGVuZ3RoKSk7XHJcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ0xvY2FsU3RvcmFnZU1vZHVsZS5ub3RpZmljYXRpb24uZXJyb3InLCBlLm1lc3NhZ2UpO1xyXG4gICAgICAgICAgICAgIHJldHVybiBjbGVhckFsbEZyb21Db29raWVzKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgIH07XHJcblxyXG4gICAgICAvLyBDaGVja3MgdGhlIGJyb3dzZXIgdG8gc2VlIGlmIGNvb2tpZXMgYXJlIHN1cHBvcnRlZFxyXG4gICAgICB2YXIgYnJvd3NlclN1cHBvcnRzQ29va2llcyA9IChmdW5jdGlvbigpIHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgcmV0dXJuICR3aW5kb3cubmF2aWdhdG9yLmNvb2tpZUVuYWJsZWQgfHxcclxuICAgICAgICAgIChcImNvb2tpZVwiIGluICRkb2N1bWVudCAmJiAoJGRvY3VtZW50LmNvb2tpZS5sZW5ndGggPiAwIHx8XHJcbiAgICAgICAgICAgICgkZG9jdW1lbnQuY29va2llID0gXCJ0ZXN0XCIpLmluZGV4T2YuY2FsbCgkZG9jdW1lbnQuY29va2llLCBcInRlc3RcIikgPiAtMSkpO1xyXG4gICAgICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ0xvY2FsU3RvcmFnZU1vZHVsZS5ub3RpZmljYXRpb24uZXJyb3InLCBlLm1lc3NhZ2UpO1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSgpKTtcclxuXHJcbiAgICAgICAgLy8gRGlyZWN0bHkgYWRkcyBhIHZhbHVlIHRvIGNvb2tpZXNcclxuICAgICAgICAvLyBUeXBpY2FsbHkgdXNlZCBhcyBhIGZhbGxiYWNrIGlmIGxvY2FsIHN0b3JhZ2UgaXMgbm90IGF2YWlsYWJsZSBpbiB0aGUgYnJvd3NlclxyXG4gICAgICAgIC8vIEV4YW1wbGUgdXNlOiBsb2NhbFN0b3JhZ2VTZXJ2aWNlLmNvb2tpZS5hZGQoJ2xpYnJhcnknLCdhbmd1bGFyJyk7XHJcbiAgICAgICAgdmFyIGFkZFRvQ29va2llcyA9IGZ1bmN0aW9uIChrZXksIHZhbHVlLCBkYXlzVG9FeHBpcnksIHNlY3VyZSkge1xyXG5cclxuICAgICAgICAgIGlmIChpc1VuZGVmaW5lZCh2YWx1ZSkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgfSBlbHNlIGlmKGlzQXJyYXkodmFsdWUpIHx8IGlzT2JqZWN0KHZhbHVlKSkge1xyXG4gICAgICAgICAgICB2YWx1ZSA9IHRvSnNvbih2YWx1ZSk7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgaWYgKCFicm93c2VyU3VwcG9ydHNDb29raWVzKSB7XHJcbiAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgnTG9jYWxTdG9yYWdlTW9kdWxlLm5vdGlmaWNhdGlvbi5lcnJvcicsICdDT09LSUVTX05PVF9TVVBQT1JURUQnKTtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIHZhciBleHBpcnkgPSAnJyxcclxuICAgICAgICAgICAgZXhwaXJ5RGF0ZSA9IG5ldyBEYXRlKCksXHJcbiAgICAgICAgICAgIGNvb2tpZURvbWFpbiA9ICcnO1xyXG5cclxuICAgICAgICAgICAgaWYgKHZhbHVlID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgLy8gTWFyayB0aGF0IHRoZSBjb29raWUgaGFzIGV4cGlyZWQgb25lIGRheSBhZ29cclxuICAgICAgICAgICAgICBleHBpcnlEYXRlLnNldFRpbWUoZXhwaXJ5RGF0ZS5nZXRUaW1lKCkgKyAoLTEgKiAyNCAqIDYwICogNjAgKiAxMDAwKSk7XHJcbiAgICAgICAgICAgICAgZXhwaXJ5ID0gXCI7IGV4cGlyZXM9XCIgKyBleHBpcnlEYXRlLnRvR01UU3RyaW5nKCk7XHJcbiAgICAgICAgICAgICAgdmFsdWUgPSAnJztcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChpc051bWJlcihkYXlzVG9FeHBpcnkpICYmIGRheXNUb0V4cGlyeSAhPT0gMCkge1xyXG4gICAgICAgICAgICAgIGV4cGlyeURhdGUuc2V0VGltZShleHBpcnlEYXRlLmdldFRpbWUoKSArIChkYXlzVG9FeHBpcnkgKiAyNCAqIDYwICogNjAgKiAxMDAwKSk7XHJcbiAgICAgICAgICAgICAgZXhwaXJ5ID0gXCI7IGV4cGlyZXM9XCIgKyBleHBpcnlEYXRlLnRvR01UU3RyaW5nKCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoY29va2llLmV4cGlyeSAhPT0gMCkge1xyXG4gICAgICAgICAgICAgIGV4cGlyeURhdGUuc2V0VGltZShleHBpcnlEYXRlLmdldFRpbWUoKSArIChjb29raWUuZXhwaXJ5ICogMjQgKiA2MCAqIDYwICogMTAwMCkpO1xyXG4gICAgICAgICAgICAgIGV4cGlyeSA9IFwiOyBleHBpcmVzPVwiICsgZXhwaXJ5RGF0ZS50b0dNVFN0cmluZygpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICghIWtleSkge1xyXG4gICAgICAgICAgICAgIHZhciBjb29raWVQYXRoID0gXCI7IHBhdGg9XCIgKyBjb29raWUucGF0aDtcclxuICAgICAgICAgICAgICBpZiAoY29va2llLmRvbWFpbikge1xyXG4gICAgICAgICAgICAgICAgY29va2llRG9tYWluID0gXCI7IGRvbWFpbj1cIiArIGNvb2tpZS5kb21haW47XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIC8qIFByb3ZpZGluZyB0aGUgc2VjdXJlIHBhcmFtZXRlciBhbHdheXMgdGFrZXMgcHJlY2VkZW5jZSBvdmVyIGNvbmZpZ1xyXG4gICAgICAgICAgICAgICAqIChhbGxvd3MgZGV2ZWxvcGVyIHRvIG1peCBhbmQgbWF0Y2ggc2VjdXJlICsgbm9uLXNlY3VyZSkgKi9cclxuICAgICAgICAgICAgICBpZiAodHlwZW9mIHNlY3VyZSA9PT0gJ2Jvb2xlYW4nKSB7XHJcbiAgICAgICAgICAgICAgICAgIGlmIChzZWN1cmUgPT09IHRydWUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgIC8qIFdlJ3ZlIGV4cGxpY2l0bHkgc3BlY2lmaWVkIHNlY3VyZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAqIGFkZCB0aGUgc2VjdXJlIGF0dHJpYnV0ZSB0byB0aGUgY29va2llIChhZnRlciBkb21haW4pICovXHJcbiAgICAgICAgICAgICAgICAgICAgICBjb29raWVEb21haW4gKz0gXCI7IHNlY3VyZVwiO1xyXG4gICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgIC8vIGVsc2UgLSBzZWN1cmUgaGFzIGJlZW4gc3VwcGxpZWQgYnV0IGlzbid0IHRydWUgLSBzbyBkb24ndCBzZXQgc2VjdXJlIGZsYWcsIHJlZ2FyZGxlc3Mgb2Ygd2hhdCBjb25maWcgc2F5c1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICBlbHNlIGlmIChjb29raWUuc2VjdXJlID09PSB0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICAgIC8vIHNlY3VyZSBwYXJhbWV0ZXIgd2Fzbid0IHNwZWNpZmllZCwgZ2V0IGRlZmF1bHQgZnJvbSBjb25maWdcclxuICAgICAgICAgICAgICAgICAgY29va2llRG9tYWluICs9IFwiOyBzZWN1cmVcIjtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgJGRvY3VtZW50LmNvb2tpZSA9IGRlcml2ZVF1YWxpZmllZEtleShrZXkpICsgXCI9XCIgKyBlbmNvZGVVUklDb21wb25lbnQodmFsdWUpICsgZXhwaXJ5ICsgY29va2llUGF0aCArIGNvb2tpZURvbWFpbjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ0xvY2FsU3RvcmFnZU1vZHVsZS5ub3RpZmljYXRpb24uZXJyb3InLCBlLm1lc3NhZ2UpO1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvLyBEaXJlY3RseSBnZXQgYSB2YWx1ZSBmcm9tIGEgY29va2llXHJcbiAgICAgICAgLy8gRXhhbXBsZSB1c2U6IGxvY2FsU3RvcmFnZVNlcnZpY2UuY29va2llLmdldCgnbGlicmFyeScpOyAvLyByZXR1cm5zICdhbmd1bGFyJ1xyXG4gICAgICAgIHZhciBnZXRGcm9tQ29va2llcyA9IGZ1bmN0aW9uIChrZXkpIHtcclxuICAgICAgICAgIGlmICghYnJvd3NlclN1cHBvcnRzQ29va2llcykge1xyXG4gICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ0xvY2FsU3RvcmFnZU1vZHVsZS5ub3RpZmljYXRpb24uZXJyb3InLCAnQ09PS0lFU19OT1RfU1VQUE9SVEVEJyk7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICB2YXIgY29va2llcyA9ICRkb2N1bWVudC5jb29raWUgJiYgJGRvY3VtZW50LmNvb2tpZS5zcGxpdCgnOycpIHx8IFtdO1xyXG4gICAgICAgICAgZm9yKHZhciBpPTA7IGkgPCBjb29raWVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIHZhciB0aGlzQ29va2llID0gY29va2llc1tpXTtcclxuICAgICAgICAgICAgd2hpbGUgKHRoaXNDb29raWUuY2hhckF0KDApID09PSAnICcpIHtcclxuICAgICAgICAgICAgICB0aGlzQ29va2llID0gdGhpc0Nvb2tpZS5zdWJzdHJpbmcoMSx0aGlzQ29va2llLmxlbmd0aCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHRoaXNDb29raWUuaW5kZXhPZihkZXJpdmVRdWFsaWZpZWRLZXkoa2V5KSArICc9JykgPT09IDApIHtcclxuICAgICAgICAgICAgICB2YXIgc3RvcmVkVmFsdWVzID0gZGVjb2RlVVJJQ29tcG9uZW50KHRoaXNDb29raWUuc3Vic3RyaW5nKHByZWZpeC5sZW5ndGggKyBrZXkubGVuZ3RoICsgMSwgdGhpc0Nvb2tpZS5sZW5ndGgpKTtcclxuICAgICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHBhcnNlZFZhbHVlID0gSlNPTi5wYXJzZShzdG9yZWRWYWx1ZXMpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHR5cGVvZihwYXJzZWRWYWx1ZSkgPT09ICdudW1iZXInID8gc3RvcmVkVmFsdWVzIDogcGFyc2VkVmFsdWU7XHJcbiAgICAgICAgICAgICAgfSBjYXRjaChlKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gc3RvcmVkVmFsdWVzO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdmFyIHJlbW92ZUZyb21Db29raWVzID0gZnVuY3Rpb24gKGtleSkge1xyXG4gICAgICAgICAgYWRkVG9Db29raWVzKGtleSxudWxsKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB2YXIgY2xlYXJBbGxGcm9tQ29va2llcyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgIHZhciB0aGlzQ29va2llID0gbnVsbDtcclxuICAgICAgICAgIHZhciBwcmVmaXhMZW5ndGggPSBwcmVmaXgubGVuZ3RoO1xyXG4gICAgICAgICAgdmFyIGNvb2tpZXMgPSAkZG9jdW1lbnQuY29va2llLnNwbGl0KCc7Jyk7XHJcbiAgICAgICAgICBmb3IodmFyIGkgPSAwOyBpIDwgY29va2llcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICB0aGlzQ29va2llID0gY29va2llc1tpXTtcclxuXHJcbiAgICAgICAgICAgIHdoaWxlICh0aGlzQ29va2llLmNoYXJBdCgwKSA9PT0gJyAnKSB7XHJcbiAgICAgICAgICAgICAgdGhpc0Nvb2tpZSA9IHRoaXNDb29raWUuc3Vic3RyaW5nKDEsIHRoaXNDb29raWUubGVuZ3RoKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdmFyIGtleSA9IHRoaXNDb29raWUuc3Vic3RyaW5nKHByZWZpeExlbmd0aCwgdGhpc0Nvb2tpZS5pbmRleE9mKCc9JykpO1xyXG4gICAgICAgICAgICByZW1vdmVGcm9tQ29va2llcyhrZXkpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHZhciBnZXRTdG9yYWdlVHlwZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgcmV0dXJuIHN0b3JhZ2VUeXBlO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHZhciBzZXRTdG9yYWdlVHlwZSA9IGZ1bmN0aW9uKHR5cGUpIHtcclxuICAgICAgICAgIGlmICh0eXBlICYmIHN0b3JhZ2VUeXBlICE9PSB0eXBlKSB7XHJcbiAgICAgICAgICAgIHN0b3JhZ2VUeXBlID0gdHlwZTtcclxuICAgICAgICAgICAgYnJvd3NlclN1cHBvcnRzTG9jYWxTdG9yYWdlID0gY2hlY2tTdXBwb3J0KCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICByZXR1cm4gYnJvd3NlclN1cHBvcnRzTG9jYWxTdG9yYWdlO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8vIEFkZCBhIGxpc3RlbmVyIG9uIHNjb3BlIHZhcmlhYmxlIHRvIHNhdmUgaXRzIGNoYW5nZXMgdG8gbG9jYWwgc3RvcmFnZVxyXG4gICAgICAgIC8vIFJldHVybiBhIGZ1bmN0aW9uIHdoaWNoIHdoZW4gY2FsbGVkIGNhbmNlbHMgYmluZGluZ1xyXG4gICAgICAgIHZhciBiaW5kVG9TY29wZSA9IGZ1bmN0aW9uKHNjb3BlLCBrZXksIGRlZiwgbHNLZXksIHR5cGUpIHtcclxuICAgICAgICAgIGxzS2V5ID0gbHNLZXkgfHwga2V5O1xyXG4gICAgICAgICAgdmFyIHZhbHVlID0gZ2V0RnJvbUxvY2FsU3RvcmFnZShsc0tleSwgdHlwZSk7XHJcblxyXG4gICAgICAgICAgaWYgKHZhbHVlID09PSBudWxsICYmIGlzRGVmaW5lZChkZWYpKSB7XHJcbiAgICAgICAgICAgIHZhbHVlID0gZGVmO1xyXG4gICAgICAgICAgfSBlbHNlIGlmIChpc09iamVjdCh2YWx1ZSkgJiYgaXNPYmplY3QoZGVmKSkge1xyXG4gICAgICAgICAgICB2YWx1ZSA9IGV4dGVuZCh2YWx1ZSwgZGVmKTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAkcGFyc2Uoa2V5KS5hc3NpZ24oc2NvcGUsIHZhbHVlKTtcclxuXHJcbiAgICAgICAgICByZXR1cm4gc2NvcGUuJHdhdGNoKGtleSwgZnVuY3Rpb24obmV3VmFsKSB7XHJcbiAgICAgICAgICAgIGFkZFRvTG9jYWxTdG9yYWdlKGxzS2V5LCBuZXdWYWwsIHR5cGUpO1xyXG4gICAgICAgICAgfSwgaXNPYmplY3Qoc2NvcGVba2V5XSkpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8vIEFkZCBsaXN0ZW5lciB0byBsb2NhbCBzdG9yYWdlLCBmb3IgdXBkYXRlIGNhbGxiYWNrcy5cclxuICAgICAgICBpZiAoYnJvd3NlclN1cHBvcnRzTG9jYWxTdG9yYWdlKSB7XHJcbiAgICAgICAgICAgIGlmICgkd2luZG93LmFkZEV2ZW50TGlzdGVuZXIpIHtcclxuICAgICAgICAgICAgICAgICR3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcInN0b3JhZ2VcIiwgaGFuZGxlU3RvcmFnZUNoYW5nZUNhbGxiYWNrLCBmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRvbignJGRlc3Ryb3knLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAkd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJzdG9yYWdlXCIsIGhhbmRsZVN0b3JhZ2VDaGFuZ2VDYWxsYmFjayk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmKCR3aW5kb3cuYXR0YWNoRXZlbnQpe1xyXG4gICAgICAgICAgICAgICAgLy8gYXR0YWNoRXZlbnQgYW5kIGRldGFjaEV2ZW50IGFyZSBwcm9wcmlldGFyeSB0byBJRSB2Ni0xMFxyXG4gICAgICAgICAgICAgICAgJHdpbmRvdy5hdHRhY2hFdmVudChcIm9uc3RvcmFnZVwiLCBoYW5kbGVTdG9yYWdlQ2hhbmdlQ2FsbGJhY2spO1xyXG4gICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kb24oJyRkZXN0cm95JywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJHdpbmRvdy5kZXRhY2hFdmVudChcIm9uc3RvcmFnZVwiLCBoYW5kbGVTdG9yYWdlQ2hhbmdlQ2FsbGJhY2spO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIENhbGxiYWNrIGhhbmRsZXIgZm9yIHN0b3JhZ2UgY2hhbmdlZC5cclxuICAgICAgICBmdW5jdGlvbiBoYW5kbGVTdG9yYWdlQ2hhbmdlQ2FsbGJhY2soZSkge1xyXG4gICAgICAgICAgICBpZiAoIWUpIHsgZSA9ICR3aW5kb3cuZXZlbnQ7IH1cclxuICAgICAgICAgICAgaWYgKG5vdGlmeS5zZXRJdGVtKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoaXNTdHJpbmcoZS5rZXkpICYmIGlzS2V5UHJlZml4T3VycyhlLmtleSkpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIga2V5ID0gdW5kZXJpdmVRdWFsaWZpZWRLZXkoZS5rZXkpO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIFVzZSB0aW1lb3V0LCB0byBhdm9pZCB1c2luZyAkcm9vdFNjb3BlLiRhcHBseS5cclxuICAgICAgICAgICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgnTG9jYWxTdG9yYWdlTW9kdWxlLm5vdGlmaWNhdGlvbi5jaGFuZ2VkJywgeyBrZXk6IGtleSwgbmV3dmFsdWU6IGUubmV3VmFsdWUsIHN0b3JhZ2VUeXBlOiBzZWxmLnN0b3JhZ2VUeXBlIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBSZXR1cm4gbG9jYWxTdG9yYWdlU2VydmljZS5sZW5ndGhcclxuICAgICAgICAvLyBpZ25vcmUga2V5cyB0aGF0IG5vdCBvd25lZFxyXG4gICAgICAgIHZhciBsZW5ndGhPZkxvY2FsU3RvcmFnZSA9IGZ1bmN0aW9uKHR5cGUpIHtcclxuICAgICAgICAgIHNldFN0b3JhZ2VUeXBlKHR5cGUpO1xyXG5cclxuICAgICAgICAgIHZhciBjb3VudCA9IDA7XHJcbiAgICAgICAgICB2YXIgc3RvcmFnZSA9ICR3aW5kb3dbc3RvcmFnZVR5cGVdO1xyXG4gICAgICAgICAgZm9yKHZhciBpID0gMDsgaSA8IHN0b3JhZ2UubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgaWYoc3RvcmFnZS5rZXkoaSkuaW5kZXhPZihwcmVmaXgpID09PSAwICkge1xyXG4gICAgICAgICAgICAgIGNvdW50Kys7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHJldHVybiBjb3VudDtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgaXNTdXBwb3J0ZWQ6IGJyb3dzZXJTdXBwb3J0c0xvY2FsU3RvcmFnZSxcclxuICAgICAgICAgIGdldFN0b3JhZ2VUeXBlOiBnZXRTdG9yYWdlVHlwZSxcclxuICAgICAgICAgIHNldFN0b3JhZ2VUeXBlOiBzZXRTdG9yYWdlVHlwZSxcclxuICAgICAgICAgIHNldDogYWRkVG9Mb2NhbFN0b3JhZ2UsXHJcbiAgICAgICAgICBhZGQ6IGFkZFRvTG9jYWxTdG9yYWdlLCAvL0RFUFJFQ0FURURcclxuICAgICAgICAgIGdldDogZ2V0RnJvbUxvY2FsU3RvcmFnZSxcclxuICAgICAgICAgIGtleXM6IGdldEtleXNGb3JMb2NhbFN0b3JhZ2UsXHJcbiAgICAgICAgICByZW1vdmU6IHJlbW92ZUZyb21Mb2NhbFN0b3JhZ2UsXHJcbiAgICAgICAgICBjbGVhckFsbDogY2xlYXJBbGxGcm9tTG9jYWxTdG9yYWdlLFxyXG4gICAgICAgICAgYmluZDogYmluZFRvU2NvcGUsXHJcbiAgICAgICAgICBkZXJpdmVLZXk6IGRlcml2ZVF1YWxpZmllZEtleSxcclxuICAgICAgICAgIHVuZGVyaXZlS2V5OiB1bmRlcml2ZVF1YWxpZmllZEtleSxcclxuICAgICAgICAgIGxlbmd0aDogbGVuZ3RoT2ZMb2NhbFN0b3JhZ2UsXHJcbiAgICAgICAgICBkZWZhdWx0VG9Db29raWU6IHRoaXMuZGVmYXVsdFRvQ29va2llLFxyXG4gICAgICAgICAgY29va2llOiB7XHJcbiAgICAgICAgICAgIGlzU3VwcG9ydGVkOiBicm93c2VyU3VwcG9ydHNDb29raWVzLFxyXG4gICAgICAgICAgICBzZXQ6IGFkZFRvQ29va2llcyxcclxuICAgICAgICAgICAgYWRkOiBhZGRUb0Nvb2tpZXMsIC8vREVQUkVDQVRFRFxyXG4gICAgICAgICAgICBnZXQ6IGdldEZyb21Db29raWVzLFxyXG4gICAgICAgICAgICByZW1vdmU6IHJlbW92ZUZyb21Db29raWVzLFxyXG4gICAgICAgICAgICBjbGVhckFsbDogY2xlYXJBbGxGcm9tQ29va2llc1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICAgIH1dO1xyXG4gIH0pO1xyXG59KSh3aW5kb3csIHdpbmRvdy5hbmd1bGFyKTsiXSwiZmlsZSI6ImFuZ3VsYXItbG9jYWwtc3RvcmFnZS5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
