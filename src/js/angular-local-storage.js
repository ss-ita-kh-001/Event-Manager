/**
 * An Angular module that gives you access to the browsers local storage
 * @version v0.5.0 - 2016-08-29
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
                return JSON.parse(storedValues);
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
                if (isKeyPrefixOurs(e.key)) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJhbmd1bGFyLWxvY2FsLXN0b3JhZ2UuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIEFuIEFuZ3VsYXIgbW9kdWxlIHRoYXQgZ2l2ZXMgeW91IGFjY2VzcyB0byB0aGUgYnJvd3NlcnMgbG9jYWwgc3RvcmFnZVxyXG4gKiBAdmVyc2lvbiB2MC41LjAgLSAyMDE2LTA4LTI5XHJcbiAqIEBsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9ncmV2b3J5L2FuZ3VsYXItbG9jYWwtc3RvcmFnZVxyXG4gKiBAYXV0aG9yIGdyZXZvcnkgPGdyZWdAZ3JlZ3Bpa2UuY2E+XHJcbiAqIEBsaWNlbnNlIE1JVCBMaWNlbnNlLCBodHRwOi8vd3d3Lm9wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL01JVFxyXG4gKi9cclxuKGZ1bmN0aW9uICh3aW5kb3csIGFuZ3VsYXIpIHtcclxudmFyIGlzRGVmaW5lZCA9IGFuZ3VsYXIuaXNEZWZpbmVkLFxyXG4gIGlzVW5kZWZpbmVkID0gYW5ndWxhci5pc1VuZGVmaW5lZCxcclxuICBpc051bWJlciA9IGFuZ3VsYXIuaXNOdW1iZXIsXHJcbiAgaXNPYmplY3QgPSBhbmd1bGFyLmlzT2JqZWN0LFxyXG4gIGlzQXJyYXkgPSBhbmd1bGFyLmlzQXJyYXksXHJcbiAgZXh0ZW5kID0gYW5ndWxhci5leHRlbmQsXHJcbiAgdG9Kc29uID0gYW5ndWxhci50b0pzb247XHJcblxyXG5hbmd1bGFyXHJcbiAgLm1vZHVsZSgnTG9jYWxTdG9yYWdlTW9kdWxlJywgW10pXHJcbiAgLnByb3ZpZGVyKCdsb2NhbFN0b3JhZ2VTZXJ2aWNlJywgZnVuY3Rpb24oKSB7XHJcbiAgICAvLyBZb3Ugc2hvdWxkIHNldCBhIHByZWZpeCB0byBhdm9pZCBvdmVyd3JpdGluZyBhbnkgbG9jYWwgc3RvcmFnZSB2YXJpYWJsZXMgZnJvbSB0aGUgcmVzdCBvZiB5b3VyIGFwcFxyXG4gICAgLy8gZS5nLiBsb2NhbFN0b3JhZ2VTZXJ2aWNlUHJvdmlkZXIuc2V0UHJlZml4KCd5b3VyQXBwTmFtZScpO1xyXG4gICAgLy8gV2l0aCBwcm92aWRlciB5b3UgY2FuIHVzZSBjb25maWcgYXMgdGhpczpcclxuICAgIC8vIG15QXBwLmNvbmZpZyhmdW5jdGlvbiAobG9jYWxTdG9yYWdlU2VydmljZVByb3ZpZGVyKSB7XHJcbiAgICAvLyAgICBsb2NhbFN0b3JhZ2VTZXJ2aWNlUHJvdmlkZXIucHJlZml4ID0gJ3lvdXJBcHBOYW1lJztcclxuICAgIC8vIH0pO1xyXG4gICAgdGhpcy5wcmVmaXggPSAnbHMnO1xyXG5cclxuICAgIC8vIFlvdSBjb3VsZCBjaGFuZ2Ugd2ViIHN0b3JhZ2UgdHlwZSBsb2NhbHN0b3JhZ2Ugb3Igc2Vzc2lvblN0b3JhZ2VcclxuICAgIHRoaXMuc3RvcmFnZVR5cGUgPSAnbG9jYWxTdG9yYWdlJztcclxuXHJcbiAgICAvLyBDb29raWUgb3B0aW9ucyAodXN1YWxseSBpbiBjYXNlIG9mIGZhbGxiYWNrKVxyXG4gICAgLy8gZXhwaXJ5ID0gTnVtYmVyIG9mIGRheXMgYmVmb3JlIGNvb2tpZXMgZXhwaXJlIC8vIDAgPSBEb2VzIG5vdCBleHBpcmVcclxuICAgIC8vIHBhdGggPSBUaGUgd2ViIHBhdGggdGhlIGNvb2tpZSByZXByZXNlbnRzXHJcbiAgICAvLyBzZWN1cmUgPSBXZXRoZXIgdGhlIGNvb2tpZXMgc2hvdWxkIGJlIHNlY3VyZSAoaS5lIG9ubHkgc2VudCBvbiBIVFRQUyByZXF1ZXN0cylcclxuICAgIHRoaXMuY29va2llID0ge1xyXG4gICAgICBleHBpcnk6IDMwLFxyXG4gICAgICBwYXRoOiAnLycsXHJcbiAgICAgIHNlY3VyZTogZmFsc2VcclxuICAgIH07XHJcblxyXG4gICAgLy8gRGVjaWRlcyB3ZXRoZXIgd2Ugc2hvdWxkIGRlZmF1bHQgdG8gY29va2llcyBpZiBsb2NhbHN0b3JhZ2UgaXMgbm90IHN1cHBvcnRlZC5cclxuICAgIHRoaXMuZGVmYXVsdFRvQ29va2llID0gdHJ1ZTtcclxuXHJcbiAgICAvLyBTZW5kIHNpZ25hbHMgZm9yIGVhY2ggb2YgdGhlIGZvbGxvd2luZyBhY3Rpb25zP1xyXG4gICAgdGhpcy5ub3RpZnkgPSB7XHJcbiAgICAgIHNldEl0ZW06IHRydWUsXHJcbiAgICAgIHJlbW92ZUl0ZW06IGZhbHNlXHJcbiAgICB9O1xyXG5cclxuICAgIC8vIFNldHRlciBmb3IgdGhlIHByZWZpeFxyXG4gICAgdGhpcy5zZXRQcmVmaXggPSBmdW5jdGlvbihwcmVmaXgpIHtcclxuICAgICAgdGhpcy5wcmVmaXggPSBwcmVmaXg7XHJcbiAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfTtcclxuXHJcbiAgICAvLyBTZXR0ZXIgZm9yIHRoZSBzdG9yYWdlVHlwZVxyXG4gICAgdGhpcy5zZXRTdG9yYWdlVHlwZSA9IGZ1bmN0aW9uKHN0b3JhZ2VUeXBlKSB7XHJcbiAgICAgIHRoaXMuc3RvcmFnZVR5cGUgPSBzdG9yYWdlVHlwZTtcclxuICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9O1xyXG4gICAgLy8gU2V0dGVyIGZvciBkZWZhdWx0VG9Db29raWUgdmFsdWUsIGRlZmF1bHQgaXMgdHJ1ZS5cclxuICAgIHRoaXMuc2V0RGVmYXVsdFRvQ29va2llID0gZnVuY3Rpb24gKHNob3VsZERlZmF1bHQpIHtcclxuICAgICAgdGhpcy5kZWZhdWx0VG9Db29raWUgPSAhIXNob3VsZERlZmF1bHQ7IC8vIERvdWJsZS1ub3QgdG8gbWFrZSBzdXJlIGl0J3MgYSBib29sIHZhbHVlLlxyXG4gICAgICByZXR1cm4gdGhpcztcclxuICAgIH07XHJcbiAgICAvLyBTZXR0ZXIgZm9yIGNvb2tpZSBjb25maWdcclxuICAgIHRoaXMuc2V0U3RvcmFnZUNvb2tpZSA9IGZ1bmN0aW9uKGV4cCwgcGF0aCwgc2VjdXJlKSB7XHJcbiAgICAgIHRoaXMuY29va2llLmV4cGlyeSA9IGV4cDtcclxuICAgICAgdGhpcy5jb29raWUucGF0aCA9IHBhdGg7XHJcbiAgICAgIHRoaXMuY29va2llLnNlY3VyZSA9IHNlY3VyZTtcclxuICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9O1xyXG5cclxuICAgIC8vIFNldHRlciBmb3IgY29va2llIGRvbWFpblxyXG4gICAgdGhpcy5zZXRTdG9yYWdlQ29va2llRG9tYWluID0gZnVuY3Rpb24oZG9tYWluKSB7XHJcbiAgICAgIHRoaXMuY29va2llLmRvbWFpbiA9IGRvbWFpbjtcclxuICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9O1xyXG5cclxuICAgIC8vIFNldHRlciBmb3Igbm90aWZpY2F0aW9uIGNvbmZpZ1xyXG4gICAgLy8gaXRlbVNldCAmIGl0ZW1SZW1vdmUgc2hvdWxkIGJlIGJvb2xlYW5zXHJcbiAgICB0aGlzLnNldE5vdGlmeSA9IGZ1bmN0aW9uKGl0ZW1TZXQsIGl0ZW1SZW1vdmUpIHtcclxuICAgICAgdGhpcy5ub3RpZnkgPSB7XHJcbiAgICAgICAgc2V0SXRlbTogaXRlbVNldCxcclxuICAgICAgICByZW1vdmVJdGVtOiBpdGVtUmVtb3ZlXHJcbiAgICAgIH07XHJcbiAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfTtcclxuXHJcbiAgICB0aGlzLiRnZXQgPSBbJyRyb290U2NvcGUnLCAnJHdpbmRvdycsICckZG9jdW1lbnQnLCAnJHBhcnNlJywnJHRpbWVvdXQnLCBmdW5jdGlvbigkcm9vdFNjb3BlLCAkd2luZG93LCAkZG9jdW1lbnQsICRwYXJzZSwgJHRpbWVvdXQpIHtcclxuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xyXG4gICAgICB2YXIgcHJlZml4ID0gc2VsZi5wcmVmaXg7XHJcbiAgICAgIHZhciBjb29raWUgPSBzZWxmLmNvb2tpZTtcclxuICAgICAgdmFyIG5vdGlmeSA9IHNlbGYubm90aWZ5O1xyXG4gICAgICB2YXIgc3RvcmFnZVR5cGUgPSBzZWxmLnN0b3JhZ2VUeXBlO1xyXG4gICAgICB2YXIgd2ViU3RvcmFnZTtcclxuXHJcbiAgICAgIC8vIFdoZW4gQW5ndWxhcidzICRkb2N1bWVudCBpcyBub3QgYXZhaWxhYmxlXHJcbiAgICAgIGlmICghJGRvY3VtZW50KSB7XHJcbiAgICAgICAgJGRvY3VtZW50ID0gZG9jdW1lbnQ7XHJcbiAgICAgIH0gZWxzZSBpZiAoJGRvY3VtZW50WzBdKSB7XHJcbiAgICAgICAgJGRvY3VtZW50ID0gJGRvY3VtZW50WzBdO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBJZiB0aGVyZSBpcyBhIHByZWZpeCBzZXQgaW4gdGhlIGNvbmZpZyBsZXRzIHVzZSB0aGF0IHdpdGggYW4gYXBwZW5kZWQgcGVyaW9kIGZvciByZWFkYWJpbGl0eVxyXG4gICAgICBpZiAocHJlZml4LnN1YnN0cigtMSkgIT09ICcuJykge1xyXG4gICAgICAgIHByZWZpeCA9ICEhcHJlZml4ID8gcHJlZml4ICsgJy4nIDogJyc7XHJcbiAgICAgIH1cclxuICAgICAgdmFyIGRlcml2ZVF1YWxpZmllZEtleSA9IGZ1bmN0aW9uKGtleSkge1xyXG4gICAgICAgIHJldHVybiBwcmVmaXggKyBrZXk7XHJcbiAgICAgIH07XHJcblxyXG4gICAgICAvLyBSZW1vdmVzIHByZWZpeCBmcm9tIHRoZSBrZXkuXHJcbiAgICAgIHZhciB1bmRlcml2ZVF1YWxpZmllZEtleSA9IGZ1bmN0aW9uIChrZXkpIHtcclxuICAgICAgICByZXR1cm4ga2V5LnJlcGxhY2UobmV3IFJlZ0V4cCgnXicgKyBwcmVmaXgsICdnJyksICcnKTtcclxuICAgICAgfTtcclxuXHJcbiAgICAgIC8vIENoZWNrIGlmIHRoZSBrZXkgaXMgd2l0aGluIG91ciBwcmVmaXggbmFtZXNwYWNlLlxyXG4gICAgICB2YXIgaXNLZXlQcmVmaXhPdXJzID0gZnVuY3Rpb24gKGtleSkge1xyXG4gICAgICAgIHJldHVybiBrZXkuaW5kZXhPZihwcmVmaXgpID09PSAwO1xyXG4gICAgICB9O1xyXG5cclxuICAgICAgLy8gQ2hlY2tzIHRoZSBicm93c2VyIHRvIHNlZSBpZiBsb2NhbCBzdG9yYWdlIGlzIHN1cHBvcnRlZFxyXG4gICAgICB2YXIgY2hlY2tTdXBwb3J0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICB2YXIgc3VwcG9ydGVkID0gKHN0b3JhZ2VUeXBlIGluICR3aW5kb3cgJiYgJHdpbmRvd1tzdG9yYWdlVHlwZV0gIT09IG51bGwpO1xyXG5cclxuICAgICAgICAgIC8vIFdoZW4gU2FmYXJpIChPUyBYIG9yIGlPUykgaXMgaW4gcHJpdmF0ZSBicm93c2luZyBtb2RlLCBpdCBhcHBlYXJzIGFzIHRob3VnaCBsb2NhbFN0b3JhZ2VcclxuICAgICAgICAgIC8vIGlzIGF2YWlsYWJsZSwgYnV0IHRyeWluZyB0byBjYWxsIC5zZXRJdGVtIHRocm93cyBhbiBleGNlcHRpb24uXHJcbiAgICAgICAgICAvL1xyXG4gICAgICAgICAgLy8gXCJRVU9UQV9FWENFRURFRF9FUlI6IERPTSBFeGNlcHRpb24gMjI6IEFuIGF0dGVtcHQgd2FzIG1hZGUgdG8gYWRkIHNvbWV0aGluZyB0byBzdG9yYWdlXHJcbiAgICAgICAgICAvLyB0aGF0IGV4Y2VlZGVkIHRoZSBxdW90YS5cIlxyXG4gICAgICAgICAgdmFyIGtleSA9IGRlcml2ZVF1YWxpZmllZEtleSgnX18nICsgTWF0aC5yb3VuZChNYXRoLnJhbmRvbSgpICogMWU3KSk7XHJcbiAgICAgICAgICBpZiAoc3VwcG9ydGVkKSB7XHJcbiAgICAgICAgICAgIHdlYlN0b3JhZ2UgPSAkd2luZG93W3N0b3JhZ2VUeXBlXTtcclxuICAgICAgICAgICAgd2ViU3RvcmFnZS5zZXRJdGVtKGtleSwgJycpO1xyXG4gICAgICAgICAgICB3ZWJTdG9yYWdlLnJlbW92ZUl0ZW0oa2V5KTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICByZXR1cm4gc3VwcG9ydGVkO1xyXG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgIC8vIE9ubHkgY2hhbmdlIHN0b3JhZ2VUeXBlIHRvIGNvb2tpZXMgaWYgZGVmYXVsdGluZyBpcyBlbmFibGVkLlxyXG4gICAgICAgICAgaWYgKHNlbGYuZGVmYXVsdFRvQ29va2llKVxyXG4gICAgICAgICAgICBzdG9yYWdlVHlwZSA9ICdjb29raWUnO1xyXG4gICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCdMb2NhbFN0b3JhZ2VNb2R1bGUubm90aWZpY2F0aW9uLmVycm9yJywgZS5tZXNzYWdlKTtcclxuICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgIH07XHJcbiAgICAgIHZhciBicm93c2VyU3VwcG9ydHNMb2NhbFN0b3JhZ2UgPSBjaGVja1N1cHBvcnQoKTtcclxuXHJcbiAgICAgIC8vIERpcmVjdGx5IGFkZHMgYSB2YWx1ZSB0byBsb2NhbCBzdG9yYWdlXHJcbiAgICAgIC8vIElmIGxvY2FsIHN0b3JhZ2UgaXMgbm90IGF2YWlsYWJsZSBpbiB0aGUgYnJvd3NlciB1c2UgY29va2llc1xyXG4gICAgICAvLyBFeGFtcGxlIHVzZTogbG9jYWxTdG9yYWdlU2VydmljZS5hZGQoJ2xpYnJhcnknLCdhbmd1bGFyJyk7XHJcbiAgICAgIHZhciBhZGRUb0xvY2FsU3RvcmFnZSA9IGZ1bmN0aW9uIChrZXksIHZhbHVlLCB0eXBlKSB7XHJcbiAgICAgICAgc2V0U3RvcmFnZVR5cGUodHlwZSk7XHJcblxyXG4gICAgICAgIC8vIExldCdzIGNvbnZlcnQgdW5kZWZpbmVkIHZhbHVlcyB0byBudWxsIHRvIGdldCB0aGUgdmFsdWUgY29uc2lzdGVudFxyXG4gICAgICAgIGlmIChpc1VuZGVmaW5lZCh2YWx1ZSkpIHtcclxuICAgICAgICAgIHZhbHVlID0gbnVsbDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgdmFsdWUgPSB0b0pzb24odmFsdWUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gSWYgdGhpcyBicm93c2VyIGRvZXMgbm90IHN1cHBvcnQgbG9jYWwgc3RvcmFnZSB1c2UgY29va2llc1xyXG4gICAgICAgIGlmICghYnJvd3NlclN1cHBvcnRzTG9jYWxTdG9yYWdlICYmIHNlbGYuZGVmYXVsdFRvQ29va2llIHx8IHNlbGYuc3RvcmFnZVR5cGUgPT09ICdjb29raWUnKSB7XHJcbiAgICAgICAgICBpZiAoIWJyb3dzZXJTdXBwb3J0c0xvY2FsU3RvcmFnZSkge1xyXG4gICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ0xvY2FsU3RvcmFnZU1vZHVsZS5ub3RpZmljYXRpb24ud2FybmluZycsICdMT0NBTF9TVE9SQUdFX05PVF9TVVBQT1JURUQnKTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBpZiAobm90aWZ5LnNldEl0ZW0pIHtcclxuICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCdMb2NhbFN0b3JhZ2VNb2R1bGUubm90aWZpY2F0aW9uLnNldGl0ZW0nLCB7a2V5OiBrZXksIG5ld3ZhbHVlOiB2YWx1ZSwgc3RvcmFnZVR5cGU6ICdjb29raWUnfSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICByZXR1cm4gYWRkVG9Db29raWVzKGtleSwgdmFsdWUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgIGlmICh3ZWJTdG9yYWdlKSB7XHJcbiAgICAgICAgICAgIHdlYlN0b3JhZ2Uuc2V0SXRlbShkZXJpdmVRdWFsaWZpZWRLZXkoa2V5KSwgdmFsdWUpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgaWYgKG5vdGlmeS5zZXRJdGVtKSB7XHJcbiAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgnTG9jYWxTdG9yYWdlTW9kdWxlLm5vdGlmaWNhdGlvbi5zZXRpdGVtJywge2tleToga2V5LCBuZXd2YWx1ZTogdmFsdWUsIHN0b3JhZ2VUeXBlOiBzZWxmLnN0b3JhZ2VUeXBlfSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCdMb2NhbFN0b3JhZ2VNb2R1bGUubm90aWZpY2F0aW9uLmVycm9yJywgZS5tZXNzYWdlKTtcclxuICAgICAgICAgIHJldHVybiBhZGRUb0Nvb2tpZXMoa2V5LCB2YWx1ZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICB9O1xyXG5cclxuICAgICAgLy8gRGlyZWN0bHkgZ2V0IGEgdmFsdWUgZnJvbSBsb2NhbCBzdG9yYWdlXHJcbiAgICAgIC8vIEV4YW1wbGUgdXNlOiBsb2NhbFN0b3JhZ2VTZXJ2aWNlLmdldCgnbGlicmFyeScpOyAvLyByZXR1cm5zICdhbmd1bGFyJ1xyXG4gICAgICB2YXIgZ2V0RnJvbUxvY2FsU3RvcmFnZSA9IGZ1bmN0aW9uIChrZXksIHR5cGUpIHtcclxuICAgICAgICBzZXRTdG9yYWdlVHlwZSh0eXBlKTtcclxuXHJcbiAgICAgICAgaWYgKCFicm93c2VyU3VwcG9ydHNMb2NhbFN0b3JhZ2UgJiYgc2VsZi5kZWZhdWx0VG9Db29raWUgIHx8IHNlbGYuc3RvcmFnZVR5cGUgPT09ICdjb29raWUnKSB7XHJcbiAgICAgICAgICBpZiAoIWJyb3dzZXJTdXBwb3J0c0xvY2FsU3RvcmFnZSkge1xyXG4gICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ0xvY2FsU3RvcmFnZU1vZHVsZS5ub3RpZmljYXRpb24ud2FybmluZycsICdMT0NBTF9TVE9SQUdFX05PVF9TVVBQT1JURUQnKTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICByZXR1cm4gZ2V0RnJvbUNvb2tpZXMoa2V5KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhciBpdGVtID0gd2ViU3RvcmFnZSA/IHdlYlN0b3JhZ2UuZ2V0SXRlbShkZXJpdmVRdWFsaWZpZWRLZXkoa2V5KSkgOiBudWxsO1xyXG4gICAgICAgIC8vIGFuZ3VsYXIudG9Kc29uIHdpbGwgY29udmVydCBudWxsIHRvICdudWxsJywgc28gYSBwcm9wZXIgY29udmVyc2lvbiBpcyBuZWVkZWRcclxuICAgICAgICAvLyBGSVhNRSBub3QgYSBwZXJmZWN0IHNvbHV0aW9uLCBzaW5jZSBhIHZhbGlkICdudWxsJyBzdHJpbmcgY2FuJ3QgYmUgc3RvcmVkXHJcbiAgICAgICAgaWYgKCFpdGVtIHx8IGl0ZW0gPT09ICdudWxsJykge1xyXG4gICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgcmV0dXJuIEpTT04ucGFyc2UoaXRlbSk7XHJcbiAgICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgcmV0dXJuIGl0ZW07XHJcbiAgICAgICAgfVxyXG4gICAgICB9O1xyXG5cclxuICAgICAgLy8gUmVtb3ZlIGFuIGl0ZW0gZnJvbSBsb2NhbCBzdG9yYWdlXHJcbiAgICAgIC8vIEV4YW1wbGUgdXNlOiBsb2NhbFN0b3JhZ2VTZXJ2aWNlLnJlbW92ZSgnbGlicmFyeScpOyAvLyByZW1vdmVzIHRoZSBrZXkvdmFsdWUgcGFpciBvZiBsaWJyYXJ5PSdhbmd1bGFyJ1xyXG4gICAgICAvL1xyXG4gICAgICAvLyBUaGlzIGlzIHZhci1hcmcgcmVtb3ZhbCwgY2hlY2sgdGhlIGxhc3QgYXJndW1lbnQgdG8gc2VlIGlmIGl0IGlzIGEgc3RvcmFnZVR5cGVcclxuICAgICAgLy8gYW5kIHNldCB0eXBlIGFjY29yZGluZ2x5IGJlZm9yZSByZW1vdmluZy5cclxuICAgICAgLy9cclxuICAgICAgdmFyIHJlbW92ZUZyb21Mb2NhbFN0b3JhZ2UgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgLy8gY2FuJ3QgcG9wIG9uIGFyZ3VtZW50cywgc28gd2UgZG8gdGhpc1xyXG4gICAgICAgIHZhciBjb25zdW1lZCA9IDA7XHJcbiAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPj0gMSAmJlxyXG4gICAgICAgICAgICAoYXJndW1lbnRzW2FyZ3VtZW50cy5sZW5ndGggLSAxXSA9PT0gJ2xvY2FsU3RvcmFnZScgfHxcclxuICAgICAgICAgICAgIGFyZ3VtZW50c1thcmd1bWVudHMubGVuZ3RoIC0gMV0gPT09ICdzZXNzaW9uU3RvcmFnZScpKSB7XHJcbiAgICAgICAgICBjb25zdW1lZCA9IDE7XHJcbiAgICAgICAgICBzZXRTdG9yYWdlVHlwZShhcmd1bWVudHNbYXJndW1lbnRzLmxlbmd0aCAtIDFdKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhciBpLCBrZXk7XHJcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGFyZ3VtZW50cy5sZW5ndGggLSBjb25zdW1lZDsgaSsrKSB7XHJcbiAgICAgICAgICBrZXkgPSBhcmd1bWVudHNbaV07XHJcbiAgICAgICAgICBpZiAoIWJyb3dzZXJTdXBwb3J0c0xvY2FsU3RvcmFnZSAmJiBzZWxmLmRlZmF1bHRUb0Nvb2tpZSB8fCBzZWxmLnN0b3JhZ2VUeXBlID09PSAnY29va2llJykge1xyXG4gICAgICAgICAgICBpZiAoIWJyb3dzZXJTdXBwb3J0c0xvY2FsU3RvcmFnZSkge1xyXG4gICAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgnTG9jYWxTdG9yYWdlTW9kdWxlLm5vdGlmaWNhdGlvbi53YXJuaW5nJywgJ0xPQ0FMX1NUT1JBR0VfTk9UX1NVUFBPUlRFRCcpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAobm90aWZ5LnJlbW92ZUl0ZW0pIHtcclxuICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ0xvY2FsU3RvcmFnZU1vZHVsZS5ub3RpZmljYXRpb24ucmVtb3ZlaXRlbScsIHtrZXk6IGtleSwgc3RvcmFnZVR5cGU6ICdjb29raWUnfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmVtb3ZlRnJvbUNvb2tpZXMoa2V5KTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgIHdlYlN0b3JhZ2UucmVtb3ZlSXRlbShkZXJpdmVRdWFsaWZpZWRLZXkoa2V5KSk7XHJcbiAgICAgICAgICAgICAgaWYgKG5vdGlmeS5yZW1vdmVJdGVtKSB7XHJcbiAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ0xvY2FsU3RvcmFnZU1vZHVsZS5ub3RpZmljYXRpb24ucmVtb3ZlaXRlbScsIHtcclxuICAgICAgICAgICAgICAgICAga2V5OiBrZXksXHJcbiAgICAgICAgICAgICAgICAgIHN0b3JhZ2VUeXBlOiBzZWxmLnN0b3JhZ2VUeXBlXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ0xvY2FsU3RvcmFnZU1vZHVsZS5ub3RpZmljYXRpb24uZXJyb3InLCBlLm1lc3NhZ2UpO1xyXG4gICAgICAgICAgICAgIHJlbW92ZUZyb21Db29raWVzKGtleSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH07XHJcblxyXG4gICAgICAvLyBSZXR1cm4gYXJyYXkgb2Yga2V5cyBmb3IgbG9jYWwgc3RvcmFnZVxyXG4gICAgICAvLyBFeGFtcGxlIHVzZTogdmFyIGtleXMgPSBsb2NhbFN0b3JhZ2VTZXJ2aWNlLmtleXMoKVxyXG4gICAgICB2YXIgZ2V0S2V5c0ZvckxvY2FsU3RvcmFnZSA9IGZ1bmN0aW9uICh0eXBlKSB7XHJcbiAgICAgICAgc2V0U3RvcmFnZVR5cGUodHlwZSk7XHJcblxyXG4gICAgICAgIGlmICghYnJvd3NlclN1cHBvcnRzTG9jYWxTdG9yYWdlKSB7XHJcbiAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ0xvY2FsU3RvcmFnZU1vZHVsZS5ub3RpZmljYXRpb24ud2FybmluZycsICdMT0NBTF9TVE9SQUdFX05PVF9TVVBQT1JURUQnKTtcclxuICAgICAgICAgIHJldHVybiBbXTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhciBwcmVmaXhMZW5ndGggPSBwcmVmaXgubGVuZ3RoO1xyXG4gICAgICAgIHZhciBrZXlzID0gW107XHJcbiAgICAgICAgZm9yICh2YXIga2V5IGluIHdlYlN0b3JhZ2UpIHtcclxuICAgICAgICAgIC8vIE9ubHkgcmV0dXJuIGtleXMgdGhhdCBhcmUgZm9yIHRoaXMgYXBwXHJcbiAgICAgICAgICBpZiAoa2V5LnN1YnN0cigwLCBwcmVmaXhMZW5ndGgpID09PSBwcmVmaXgpIHtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICBrZXlzLnB1c2goa2V5LnN1YnN0cihwcmVmaXhMZW5ndGgpKTtcclxuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgnTG9jYWxTdG9yYWdlTW9kdWxlLm5vdGlmaWNhdGlvbi5lcnJvcicsIGUuRGVzY3JpcHRpb24pO1xyXG4gICAgICAgICAgICAgIHJldHVybiBbXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4ga2V5cztcclxuICAgICAgfTtcclxuXHJcbiAgICAgIC8vIFJlbW92ZSBhbGwgZGF0YSBmb3IgdGhpcyBhcHAgZnJvbSBsb2NhbCBzdG9yYWdlXHJcbiAgICAgIC8vIEFsc28gb3B0aW9uYWxseSB0YWtlcyBhIHJlZ3VsYXIgZXhwcmVzc2lvbiBzdHJpbmcgYW5kIHJlbW92ZXMgdGhlIG1hdGNoaW5nIGtleS12YWx1ZSBwYWlyc1xyXG4gICAgICAvLyBFeGFtcGxlIHVzZTogbG9jYWxTdG9yYWdlU2VydmljZS5jbGVhckFsbCgpO1xyXG4gICAgICAvLyBTaG91bGQgYmUgdXNlZCBtb3N0bHkgZm9yIGRldmVsb3BtZW50IHB1cnBvc2VzXHJcbiAgICAgIHZhciBjbGVhckFsbEZyb21Mb2NhbFN0b3JhZ2UgPSBmdW5jdGlvbiAocmVndWxhckV4cHJlc3Npb24sIHR5cGUpIHtcclxuICAgICAgICBzZXRTdG9yYWdlVHlwZSh0eXBlKTtcclxuXHJcbiAgICAgICAgLy8gU2V0dGluZyBib3RoIHJlZ3VsYXIgZXhwcmVzc2lvbnMgaW5kZXBlbmRlbnRseVxyXG4gICAgICAgIC8vIEVtcHR5IHN0cmluZ3MgcmVzdWx0IGluIGNhdGNoYWxsIFJlZ0V4cFxyXG4gICAgICAgIHZhciBwcmVmaXhSZWdleCA9ICEhcHJlZml4ID8gbmV3IFJlZ0V4cCgnXicgKyBwcmVmaXgpIDogbmV3IFJlZ0V4cCgpO1xyXG4gICAgICAgIHZhciB0ZXN0UmVnZXggPSAhIXJlZ3VsYXJFeHByZXNzaW9uID8gbmV3IFJlZ0V4cChyZWd1bGFyRXhwcmVzc2lvbikgOiBuZXcgUmVnRXhwKCk7XHJcblxyXG4gICAgICAgIGlmICghYnJvd3NlclN1cHBvcnRzTG9jYWxTdG9yYWdlICYmIHNlbGYuZGVmYXVsdFRvQ29va2llICB8fCBzZWxmLnN0b3JhZ2VUeXBlID09PSAnY29va2llJykge1xyXG4gICAgICAgICAgaWYgKCFicm93c2VyU3VwcG9ydHNMb2NhbFN0b3JhZ2UpIHtcclxuICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCdMb2NhbFN0b3JhZ2VNb2R1bGUubm90aWZpY2F0aW9uLndhcm5pbmcnLCAnTE9DQUxfU1RPUkFHRV9OT1RfU1VQUE9SVEVEJyk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICByZXR1cm4gY2xlYXJBbGxGcm9tQ29va2llcygpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIWJyb3dzZXJTdXBwb3J0c0xvY2FsU3RvcmFnZSAmJiAhc2VsZi5kZWZhdWx0VG9Db29raWUpXHJcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgdmFyIHByZWZpeExlbmd0aCA9IHByZWZpeC5sZW5ndGg7XHJcblxyXG4gICAgICAgIGZvciAodmFyIGtleSBpbiB3ZWJTdG9yYWdlKSB7XHJcbiAgICAgICAgICAvLyBPbmx5IHJlbW92ZSBpdGVtcyB0aGF0IGFyZSBmb3IgdGhpcyBhcHAgYW5kIG1hdGNoIHRoZSByZWd1bGFyIGV4cHJlc3Npb25cclxuICAgICAgICAgIGlmIChwcmVmaXhSZWdleC50ZXN0KGtleSkgJiYgdGVzdFJlZ2V4LnRlc3Qoa2V5LnN1YnN0cihwcmVmaXhMZW5ndGgpKSkge1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgIHJlbW92ZUZyb21Mb2NhbFN0b3JhZ2Uoa2V5LnN1YnN0cihwcmVmaXhMZW5ndGgpKTtcclxuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgnTG9jYWxTdG9yYWdlTW9kdWxlLm5vdGlmaWNhdGlvbi5lcnJvcicsIGUubWVzc2FnZSk7XHJcbiAgICAgICAgICAgICAgcmV0dXJuIGNsZWFyQWxsRnJvbUNvb2tpZXMoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgfTtcclxuXHJcbiAgICAgIC8vIENoZWNrcyB0aGUgYnJvd3NlciB0byBzZWUgaWYgY29va2llcyBhcmUgc3VwcG9ydGVkXHJcbiAgICAgIHZhciBicm93c2VyU3VwcG9ydHNDb29raWVzID0gKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICByZXR1cm4gJHdpbmRvdy5uYXZpZ2F0b3IuY29va2llRW5hYmxlZCB8fFxyXG4gICAgICAgICAgKFwiY29va2llXCIgaW4gJGRvY3VtZW50ICYmICgkZG9jdW1lbnQuY29va2llLmxlbmd0aCA+IDAgfHxcclxuICAgICAgICAgICAgKCRkb2N1bWVudC5jb29raWUgPSBcInRlc3RcIikuaW5kZXhPZi5jYWxsKCRkb2N1bWVudC5jb29raWUsIFwidGVzdFwiKSA+IC0xKSk7XHJcbiAgICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgnTG9jYWxTdG9yYWdlTW9kdWxlLm5vdGlmaWNhdGlvbi5lcnJvcicsIGUubWVzc2FnZSk7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9KCkpO1xyXG5cclxuICAgICAgICAvLyBEaXJlY3RseSBhZGRzIGEgdmFsdWUgdG8gY29va2llc1xyXG4gICAgICAgIC8vIFR5cGljYWxseSB1c2VkIGFzIGEgZmFsbGJhY2sgaWYgbG9jYWwgc3RvcmFnZSBpcyBub3QgYXZhaWxhYmxlIGluIHRoZSBicm93c2VyXHJcbiAgICAgICAgLy8gRXhhbXBsZSB1c2U6IGxvY2FsU3RvcmFnZVNlcnZpY2UuY29va2llLmFkZCgnbGlicmFyeScsJ2FuZ3VsYXInKTtcclxuICAgICAgICB2YXIgYWRkVG9Db29raWVzID0gZnVuY3Rpb24gKGtleSwgdmFsdWUsIGRheXNUb0V4cGlyeSwgc2VjdXJlKSB7XHJcblxyXG4gICAgICAgICAgaWYgKGlzVW5kZWZpbmVkKHZhbHVlKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICB9IGVsc2UgaWYoaXNBcnJheSh2YWx1ZSkgfHwgaXNPYmplY3QodmFsdWUpKSB7XHJcbiAgICAgICAgICAgIHZhbHVlID0gdG9Kc29uKHZhbHVlKTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBpZiAoIWJyb3dzZXJTdXBwb3J0c0Nvb2tpZXMpIHtcclxuICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCdMb2NhbFN0b3JhZ2VNb2R1bGUubm90aWZpY2F0aW9uLmVycm9yJywgJ0NPT0tJRVNfTk9UX1NVUFBPUlRFRCcpO1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgdmFyIGV4cGlyeSA9ICcnLFxyXG4gICAgICAgICAgICBleHBpcnlEYXRlID0gbmV3IERhdGUoKSxcclxuICAgICAgICAgICAgY29va2llRG9tYWluID0gJyc7XHJcblxyXG4gICAgICAgICAgICBpZiAodmFsdWUgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAvLyBNYXJrIHRoYXQgdGhlIGNvb2tpZSBoYXMgZXhwaXJlZCBvbmUgZGF5IGFnb1xyXG4gICAgICAgICAgICAgIGV4cGlyeURhdGUuc2V0VGltZShleHBpcnlEYXRlLmdldFRpbWUoKSArICgtMSAqIDI0ICogNjAgKiA2MCAqIDEwMDApKTtcclxuICAgICAgICAgICAgICBleHBpcnkgPSBcIjsgZXhwaXJlcz1cIiArIGV4cGlyeURhdGUudG9HTVRTdHJpbmcoKTtcclxuICAgICAgICAgICAgICB2YWx1ZSA9ICcnO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGlzTnVtYmVyKGRheXNUb0V4cGlyeSkgJiYgZGF5c1RvRXhwaXJ5ICE9PSAwKSB7XHJcbiAgICAgICAgICAgICAgZXhwaXJ5RGF0ZS5zZXRUaW1lKGV4cGlyeURhdGUuZ2V0VGltZSgpICsgKGRheXNUb0V4cGlyeSAqIDI0ICogNjAgKiA2MCAqIDEwMDApKTtcclxuICAgICAgICAgICAgICBleHBpcnkgPSBcIjsgZXhwaXJlcz1cIiArIGV4cGlyeURhdGUudG9HTVRTdHJpbmcoKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChjb29raWUuZXhwaXJ5ICE9PSAwKSB7XHJcbiAgICAgICAgICAgICAgZXhwaXJ5RGF0ZS5zZXRUaW1lKGV4cGlyeURhdGUuZ2V0VGltZSgpICsgKGNvb2tpZS5leHBpcnkgKiAyNCAqIDYwICogNjAgKiAxMDAwKSk7XHJcbiAgICAgICAgICAgICAgZXhwaXJ5ID0gXCI7IGV4cGlyZXM9XCIgKyBleHBpcnlEYXRlLnRvR01UU3RyaW5nKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCEha2V5KSB7XHJcbiAgICAgICAgICAgICAgdmFyIGNvb2tpZVBhdGggPSBcIjsgcGF0aD1cIiArIGNvb2tpZS5wYXRoO1xyXG4gICAgICAgICAgICAgIGlmIChjb29raWUuZG9tYWluKSB7XHJcbiAgICAgICAgICAgICAgICBjb29raWVEb21haW4gPSBcIjsgZG9tYWluPVwiICsgY29va2llLmRvbWFpbjtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgLyogUHJvdmlkaW5nIHRoZSBzZWN1cmUgcGFyYW1ldGVyIGFsd2F5cyB0YWtlcyBwcmVjZWRlbmNlIG92ZXIgY29uZmlnXHJcbiAgICAgICAgICAgICAgICogKGFsbG93cyBkZXZlbG9wZXIgdG8gbWl4IGFuZCBtYXRjaCBzZWN1cmUgKyBub24tc2VjdXJlKSAqL1xyXG4gICAgICAgICAgICAgIGlmICh0eXBlb2Ygc2VjdXJlID09PSAnYm9vbGVhbicpIHtcclxuICAgICAgICAgICAgICAgICAgaWYgKHNlY3VyZSA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgLyogV2UndmUgZXhwbGljaXRseSBzcGVjaWZpZWQgc2VjdXJlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICogYWRkIHRoZSBzZWN1cmUgYXR0cmlidXRlIHRvIHRoZSBjb29raWUgKGFmdGVyIGRvbWFpbikgKi9cclxuICAgICAgICAgICAgICAgICAgICAgIGNvb2tpZURvbWFpbiArPSBcIjsgc2VjdXJlXCI7XHJcbiAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgLy8gZWxzZSAtIHNlY3VyZSBoYXMgYmVlbiBzdXBwbGllZCBidXQgaXNuJ3QgdHJ1ZSAtIHNvIGRvbid0IHNldCBzZWN1cmUgZmxhZywgcmVnYXJkbGVzcyBvZiB3aGF0IGNvbmZpZyBzYXlzXHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIGVsc2UgaWYgKGNvb2tpZS5zZWN1cmUgPT09IHRydWUpIHtcclxuICAgICAgICAgICAgICAgICAgLy8gc2VjdXJlIHBhcmFtZXRlciB3YXNuJ3Qgc3BlY2lmaWVkLCBnZXQgZGVmYXVsdCBmcm9tIGNvbmZpZ1xyXG4gICAgICAgICAgICAgICAgICBjb29raWVEb21haW4gKz0gXCI7IHNlY3VyZVwiO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAkZG9jdW1lbnQuY29va2llID0gZGVyaXZlUXVhbGlmaWVkS2V5KGtleSkgKyBcIj1cIiArIGVuY29kZVVSSUNvbXBvbmVudCh2YWx1ZSkgKyBleHBpcnkgKyBjb29raWVQYXRoICsgY29va2llRG9tYWluO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgnTG9jYWxTdG9yYWdlTW9kdWxlLm5vdGlmaWNhdGlvbi5lcnJvcicsIGUubWVzc2FnZSk7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8vIERpcmVjdGx5IGdldCBhIHZhbHVlIGZyb20gYSBjb29raWVcclxuICAgICAgICAvLyBFeGFtcGxlIHVzZTogbG9jYWxTdG9yYWdlU2VydmljZS5jb29raWUuZ2V0KCdsaWJyYXJ5Jyk7IC8vIHJldHVybnMgJ2FuZ3VsYXInXHJcbiAgICAgICAgdmFyIGdldEZyb21Db29raWVzID0gZnVuY3Rpb24gKGtleSkge1xyXG4gICAgICAgICAgaWYgKCFicm93c2VyU3VwcG9ydHNDb29raWVzKSB7XHJcbiAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgnTG9jYWxTdG9yYWdlTW9kdWxlLm5vdGlmaWNhdGlvbi5lcnJvcicsICdDT09LSUVTX05PVF9TVVBQT1JURUQnKTtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIHZhciBjb29raWVzID0gJGRvY3VtZW50LmNvb2tpZSAmJiAkZG9jdW1lbnQuY29va2llLnNwbGl0KCc7JykgfHwgW107XHJcbiAgICAgICAgICBmb3IodmFyIGk9MDsgaSA8IGNvb2tpZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgdmFyIHRoaXNDb29raWUgPSBjb29raWVzW2ldO1xyXG4gICAgICAgICAgICB3aGlsZSAodGhpc0Nvb2tpZS5jaGFyQXQoMCkgPT09ICcgJykge1xyXG4gICAgICAgICAgICAgIHRoaXNDb29raWUgPSB0aGlzQ29va2llLnN1YnN0cmluZygxLHRoaXNDb29raWUubGVuZ3RoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAodGhpc0Nvb2tpZS5pbmRleE9mKGRlcml2ZVF1YWxpZmllZEtleShrZXkpICsgJz0nKSA9PT0gMCkge1xyXG4gICAgICAgICAgICAgIHZhciBzdG9yZWRWYWx1ZXMgPSBkZWNvZGVVUklDb21wb25lbnQodGhpc0Nvb2tpZS5zdWJzdHJpbmcocHJlZml4Lmxlbmd0aCArIGtleS5sZW5ndGggKyAxLCB0aGlzQ29va2llLmxlbmd0aCkpO1xyXG4gICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gSlNPTi5wYXJzZShzdG9yZWRWYWx1ZXMpO1xyXG4gICAgICAgICAgICAgIH0gY2F0Y2goZSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHN0b3JlZFZhbHVlcztcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHZhciByZW1vdmVGcm9tQ29va2llcyA9IGZ1bmN0aW9uIChrZXkpIHtcclxuICAgICAgICAgIGFkZFRvQ29va2llcyhrZXksbnVsbCk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdmFyIGNsZWFyQWxsRnJvbUNvb2tpZXMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICB2YXIgdGhpc0Nvb2tpZSA9IG51bGw7XHJcbiAgICAgICAgICB2YXIgcHJlZml4TGVuZ3RoID0gcHJlZml4Lmxlbmd0aDtcclxuICAgICAgICAgIHZhciBjb29raWVzID0gJGRvY3VtZW50LmNvb2tpZS5zcGxpdCgnOycpO1xyXG4gICAgICAgICAgZm9yKHZhciBpID0gMDsgaSA8IGNvb2tpZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgdGhpc0Nvb2tpZSA9IGNvb2tpZXNbaV07XHJcblxyXG4gICAgICAgICAgICB3aGlsZSAodGhpc0Nvb2tpZS5jaGFyQXQoMCkgPT09ICcgJykge1xyXG4gICAgICAgICAgICAgIHRoaXNDb29raWUgPSB0aGlzQ29va2llLnN1YnN0cmluZygxLCB0aGlzQ29va2llLmxlbmd0aCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHZhciBrZXkgPSB0aGlzQ29va2llLnN1YnN0cmluZyhwcmVmaXhMZW5ndGgsIHRoaXNDb29raWUuaW5kZXhPZignPScpKTtcclxuICAgICAgICAgICAgcmVtb3ZlRnJvbUNvb2tpZXMoa2V5KTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB2YXIgZ2V0U3RvcmFnZVR5cGUgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgIHJldHVybiBzdG9yYWdlVHlwZTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB2YXIgc2V0U3RvcmFnZVR5cGUgPSBmdW5jdGlvbih0eXBlKSB7XHJcbiAgICAgICAgICBpZiAodHlwZSAmJiBzdG9yYWdlVHlwZSAhPT0gdHlwZSkge1xyXG4gICAgICAgICAgICBzdG9yYWdlVHlwZSA9IHR5cGU7XHJcbiAgICAgICAgICAgIGJyb3dzZXJTdXBwb3J0c0xvY2FsU3RvcmFnZSA9IGNoZWNrU3VwcG9ydCgpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgcmV0dXJuIGJyb3dzZXJTdXBwb3J0c0xvY2FsU3RvcmFnZTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvLyBBZGQgYSBsaXN0ZW5lciBvbiBzY29wZSB2YXJpYWJsZSB0byBzYXZlIGl0cyBjaGFuZ2VzIHRvIGxvY2FsIHN0b3JhZ2VcclxuICAgICAgICAvLyBSZXR1cm4gYSBmdW5jdGlvbiB3aGljaCB3aGVuIGNhbGxlZCBjYW5jZWxzIGJpbmRpbmdcclxuICAgICAgICB2YXIgYmluZFRvU2NvcGUgPSBmdW5jdGlvbihzY29wZSwga2V5LCBkZWYsIGxzS2V5LCB0eXBlKSB7XHJcbiAgICAgICAgICBsc0tleSA9IGxzS2V5IHx8IGtleTtcclxuICAgICAgICAgIHZhciB2YWx1ZSA9IGdldEZyb21Mb2NhbFN0b3JhZ2UobHNLZXksIHR5cGUpO1xyXG5cclxuICAgICAgICAgIGlmICh2YWx1ZSA9PT0gbnVsbCAmJiBpc0RlZmluZWQoZGVmKSkge1xyXG4gICAgICAgICAgICB2YWx1ZSA9IGRlZjtcclxuICAgICAgICAgIH0gZWxzZSBpZiAoaXNPYmplY3QodmFsdWUpICYmIGlzT2JqZWN0KGRlZikpIHtcclxuICAgICAgICAgICAgdmFsdWUgPSBleHRlbmQodmFsdWUsIGRlZik7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgJHBhcnNlKGtleSkuYXNzaWduKHNjb3BlLCB2YWx1ZSk7XHJcblxyXG4gICAgICAgICAgcmV0dXJuIHNjb3BlLiR3YXRjaChrZXksIGZ1bmN0aW9uKG5ld1ZhbCkge1xyXG4gICAgICAgICAgICBhZGRUb0xvY2FsU3RvcmFnZShsc0tleSwgbmV3VmFsLCB0eXBlKTtcclxuICAgICAgICAgIH0sIGlzT2JqZWN0KHNjb3BlW2tleV0pKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvLyBBZGQgbGlzdGVuZXIgdG8gbG9jYWwgc3RvcmFnZSwgZm9yIHVwZGF0ZSBjYWxsYmFja3MuXHJcbiAgICAgICAgaWYgKGJyb3dzZXJTdXBwb3J0c0xvY2FsU3RvcmFnZSkge1xyXG4gICAgICAgICAgICBpZiAoJHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKSB7XHJcbiAgICAgICAgICAgICAgICAkd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJzdG9yYWdlXCIsIGhhbmRsZVN0b3JhZ2VDaGFuZ2VDYWxsYmFjaywgZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kb24oJyRkZXN0cm95JywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKFwic3RvcmFnZVwiLCBoYW5kbGVTdG9yYWdlQ2hhbmdlQ2FsbGJhY2spO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZigkd2luZG93LmF0dGFjaEV2ZW50KXtcclxuICAgICAgICAgICAgICAgIC8vIGF0dGFjaEV2ZW50IGFuZCBkZXRhY2hFdmVudCBhcmUgcHJvcHJpZXRhcnkgdG8gSUUgdjYtMTBcclxuICAgICAgICAgICAgICAgICR3aW5kb3cuYXR0YWNoRXZlbnQoXCJvbnN0b3JhZ2VcIiwgaGFuZGxlU3RvcmFnZUNoYW5nZUNhbGxiYWNrKTtcclxuICAgICAgICAgICAgICAgICRyb290U2NvcGUuJG9uKCckZGVzdHJveScsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICR3aW5kb3cuZGV0YWNoRXZlbnQoXCJvbnN0b3JhZ2VcIiwgaGFuZGxlU3RvcmFnZUNoYW5nZUNhbGxiYWNrKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBDYWxsYmFjayBoYW5kbGVyIGZvciBzdG9yYWdlIGNoYW5nZWQuXHJcbiAgICAgICAgZnVuY3Rpb24gaGFuZGxlU3RvcmFnZUNoYW5nZUNhbGxiYWNrKGUpIHtcclxuICAgICAgICAgICAgaWYgKCFlKSB7IGUgPSAkd2luZG93LmV2ZW50OyB9XHJcbiAgICAgICAgICAgIGlmIChub3RpZnkuc2V0SXRlbSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGlzS2V5UHJlZml4T3VycyhlLmtleSkpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIga2V5ID0gdW5kZXJpdmVRdWFsaWZpZWRLZXkoZS5rZXkpO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIFVzZSB0aW1lb3V0LCB0byBhdm9pZCB1c2luZyAkcm9vdFNjb3BlLiRhcHBseS5cclxuICAgICAgICAgICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgnTG9jYWxTdG9yYWdlTW9kdWxlLm5vdGlmaWNhdGlvbi5jaGFuZ2VkJywgeyBrZXk6IGtleSwgbmV3dmFsdWU6IGUubmV3VmFsdWUsIHN0b3JhZ2VUeXBlOiBzZWxmLnN0b3JhZ2VUeXBlIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBSZXR1cm4gbG9jYWxTdG9yYWdlU2VydmljZS5sZW5ndGhcclxuICAgICAgICAvLyBpZ25vcmUga2V5cyB0aGF0IG5vdCBvd25lZFxyXG4gICAgICAgIHZhciBsZW5ndGhPZkxvY2FsU3RvcmFnZSA9IGZ1bmN0aW9uKHR5cGUpIHtcclxuICAgICAgICAgIHNldFN0b3JhZ2VUeXBlKHR5cGUpO1xyXG5cclxuICAgICAgICAgIHZhciBjb3VudCA9IDA7XHJcbiAgICAgICAgICB2YXIgc3RvcmFnZSA9ICR3aW5kb3dbc3RvcmFnZVR5cGVdO1xyXG4gICAgICAgICAgZm9yKHZhciBpID0gMDsgaSA8IHN0b3JhZ2UubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgaWYoc3RvcmFnZS5rZXkoaSkuaW5kZXhPZihwcmVmaXgpID09PSAwICkge1xyXG4gICAgICAgICAgICAgIGNvdW50Kys7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHJldHVybiBjb3VudDtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgaXNTdXBwb3J0ZWQ6IGJyb3dzZXJTdXBwb3J0c0xvY2FsU3RvcmFnZSxcclxuICAgICAgICAgIGdldFN0b3JhZ2VUeXBlOiBnZXRTdG9yYWdlVHlwZSxcclxuICAgICAgICAgIHNldFN0b3JhZ2VUeXBlOiBzZXRTdG9yYWdlVHlwZSxcclxuICAgICAgICAgIHNldDogYWRkVG9Mb2NhbFN0b3JhZ2UsXHJcbiAgICAgICAgICBhZGQ6IGFkZFRvTG9jYWxTdG9yYWdlLCAvL0RFUFJFQ0FURURcclxuICAgICAgICAgIGdldDogZ2V0RnJvbUxvY2FsU3RvcmFnZSxcclxuICAgICAgICAgIGtleXM6IGdldEtleXNGb3JMb2NhbFN0b3JhZ2UsXHJcbiAgICAgICAgICByZW1vdmU6IHJlbW92ZUZyb21Mb2NhbFN0b3JhZ2UsXHJcbiAgICAgICAgICBjbGVhckFsbDogY2xlYXJBbGxGcm9tTG9jYWxTdG9yYWdlLFxyXG4gICAgICAgICAgYmluZDogYmluZFRvU2NvcGUsXHJcbiAgICAgICAgICBkZXJpdmVLZXk6IGRlcml2ZVF1YWxpZmllZEtleSxcclxuICAgICAgICAgIHVuZGVyaXZlS2V5OiB1bmRlcml2ZVF1YWxpZmllZEtleSxcclxuICAgICAgICAgIGxlbmd0aDogbGVuZ3RoT2ZMb2NhbFN0b3JhZ2UsXHJcbiAgICAgICAgICBkZWZhdWx0VG9Db29raWU6IHRoaXMuZGVmYXVsdFRvQ29va2llLFxyXG4gICAgICAgICAgY29va2llOiB7XHJcbiAgICAgICAgICAgIGlzU3VwcG9ydGVkOiBicm93c2VyU3VwcG9ydHNDb29raWVzLFxyXG4gICAgICAgICAgICBzZXQ6IGFkZFRvQ29va2llcyxcclxuICAgICAgICAgICAgYWRkOiBhZGRUb0Nvb2tpZXMsIC8vREVQUkVDQVRFRFxyXG4gICAgICAgICAgICBnZXQ6IGdldEZyb21Db29raWVzLFxyXG4gICAgICAgICAgICByZW1vdmU6IHJlbW92ZUZyb21Db29raWVzLFxyXG4gICAgICAgICAgICBjbGVhckFsbDogY2xlYXJBbGxGcm9tQ29va2llc1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICAgIH1dO1xyXG4gIH0pO1xyXG59KSh3aW5kb3csIHdpbmRvdy5hbmd1bGFyKTsiXSwiZmlsZSI6ImFuZ3VsYXItbG9jYWwtc3RvcmFnZS5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
