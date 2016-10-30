/**
 * @license AngularJS v1.5.8
 * (c) 2010-2016 Google, Inc. http://angularjs.org
 * License: MIT
 */
(function(window, angular) {'use strict';

/**
 * @ngdoc module
 * @name ngCookies
 * @description
 *
 * # ngCookies
 *
 * The `ngCookies` module provides a convenient wrapper for reading and writing browser cookies.
 *
 *
 * <div doc-module-components="ngCookies"></div>
 *
 * See {@link ngCookies.$cookies `$cookies`} for usage.
 */


angular.module('ngCookies', ['ng']).
  /**
   * @ngdoc provider
   * @name $cookiesProvider
   * @description
   * Use `$cookiesProvider` to change the default behavior of the {@link ngCookies.$cookies $cookies} service.
   * */
   provider('$cookies', [function $CookiesProvider() {
    /**
     * @ngdoc property
     * @name $cookiesProvider#defaults
     * @description
     *
     * Object containing default options to pass when setting cookies.
     *
     * The object may have following properties:
     *
     * - **path** - `{string}` - The cookie will be available only for this path and its
     *   sub-paths. By default, this is the URL that appears in your `<base>` tag.
     * - **domain** - `{string}` - The cookie will be available only for this domain and
     *   its sub-domains. For security reasons the user agent will not accept the cookie
     *   if the current domain is not a sub-domain of this domain or equal to it.
     * - **expires** - `{string|Date}` - String of the form "Wdy, DD Mon YYYY HH:MM:SS GMT"
     *   or a Date object indicating the exact date/time this cookie will expire.
     * - **secure** - `{boolean}` - If `true`, then the cookie will only be available through a
     *   secured connection.
     *
     * Note: By default, the address that appears in your `<base>` tag will be used as the path.
     * This is important so that cookies will be visible for all routes when html5mode is enabled.
     *
     **/
    var defaults = this.defaults = {};

    function calcOptions(options) {
      return options ? angular.extend({}, defaults, options) : defaults;
    }

    /**
     * @ngdoc service
     * @name $cookies
     *
     * @description
     * Provides read/write access to browser's cookies.
     *
     * <div class="alert alert-info">
     * Up until Angular 1.3, `$cookies` exposed properties that represented the
     * current browser cookie values. In version 1.4, this behavior has changed, and
     * `$cookies` now provides a standard api of getters, setters etc.
     * </div>
     *
     * Requires the {@link ngCookies `ngCookies`} module to be installed.
     *
     * @example
     *
     * ```js
     * angular.module('cookiesExample', ['ngCookies'])
     *   .controller('ExampleController', ['$cookies', function($cookies) {
     *     // Retrieving a cookie
     *     var favoriteCookie = $cookies.get('myFavorite');
     *     // Setting a cookie
     *     $cookies.put('myFavorite', 'oatmeal');
     *   }]);
     * ```
     */
    this.$get = ['$$cookieReader', '$$cookieWriter', function($$cookieReader, $$cookieWriter) {
      return {
        /**
         * @ngdoc method
         * @name $cookies#get
         *
         * @description
         * Returns the value of given cookie key
         *
         * @param {string} key Id to use for lookup.
         * @returns {string} Raw cookie value.
         */
        get: function(key) {
          return $$cookieReader()[key];
        },

        /**
         * @ngdoc method
         * @name $cookies#getObject
         *
         * @description
         * Returns the deserialized value of given cookie key
         *
         * @param {string} key Id to use for lookup.
         * @returns {Object} Deserialized cookie value.
         */
        getObject: function(key) {
          var value = this.get(key);
          return value ? angular.fromJson(value) : value;
        },

        /**
         * @ngdoc method
         * @name $cookies#getAll
         *
         * @description
         * Returns a key value object with all the cookies
         *
         * @returns {Object} All cookies
         */
        getAll: function() {
          return $$cookieReader();
        },

        /**
         * @ngdoc method
         * @name $cookies#put
         *
         * @description
         * Sets a value for given cookie key
         *
         * @param {string} key Id for the `value`.
         * @param {string} value Raw value to be stored.
         * @param {Object=} options Options object.
         *    See {@link ngCookies.$cookiesProvider#defaults $cookiesProvider.defaults}
         */
        put: function(key, value, options) {
          $$cookieWriter(key, value, calcOptions(options));
        },

        /**
         * @ngdoc method
         * @name $cookies#putObject
         *
         * @description
         * Serializes and sets a value for given cookie key
         *
         * @param {string} key Id for the `value`.
         * @param {Object} value Value to be stored.
         * @param {Object=} options Options object.
         *    See {@link ngCookies.$cookiesProvider#defaults $cookiesProvider.defaults}
         */
        putObject: function(key, value, options) {
          this.put(key, angular.toJson(value), options);
        },

        /**
         * @ngdoc method
         * @name $cookies#remove
         *
         * @description
         * Remove given cookie
         *
         * @param {string} key Id of the key-value pair to delete.
         * @param {Object=} options Options object.
         *    See {@link ngCookies.$cookiesProvider#defaults $cookiesProvider.defaults}
         */
        remove: function(key, options) {
          $$cookieWriter(key, undefined, calcOptions(options));
        }
      };
    }];
  }]);

angular.module('ngCookies').
/**
 * @ngdoc service
 * @name $cookieStore
 * @deprecated
 * @requires $cookies
 *
 * @description
 * Provides a key-value (string-object) storage, that is backed by session cookies.
 * Objects put or retrieved from this storage are automatically serialized or
 * deserialized by angular's toJson/fromJson.
 *
 * Requires the {@link ngCookies `ngCookies`} module to be installed.
 *
 * <div class="alert alert-danger">
 * **Note:** The $cookieStore service is **deprecated**.
 * Please use the {@link ngCookies.$cookies `$cookies`} service instead.
 * </div>
 *
 * @example
 *
 * ```js
 * angular.module('cookieStoreExample', ['ngCookies'])
 *   .controller('ExampleController', ['$cookieStore', function($cookieStore) {
 *     // Put cookie
 *     $cookieStore.put('myFavorite','oatmeal');
 *     // Get cookie
 *     var favoriteCookie = $cookieStore.get('myFavorite');
 *     // Removing a cookie
 *     $cookieStore.remove('myFavorite');
 *   }]);
 * ```
 */
 factory('$cookieStore', ['$cookies', function($cookies) {

    return {
      /**
       * @ngdoc method
       * @name $cookieStore#get
       *
       * @description
       * Returns the value of given cookie key
       *
       * @param {string} key Id to use for lookup.
       * @returns {Object} Deserialized cookie value, undefined if the cookie does not exist.
       */
      get: function(key) {
        return $cookies.getObject(key);
      },

      /**
       * @ngdoc method
       * @name $cookieStore#put
       *
       * @description
       * Sets a value for given cookie key
       *
       * @param {string} key Id for the `value`.
       * @param {Object} value Value to be stored.
       */
      put: function(key, value) {
        $cookies.putObject(key, value);
      },

      /**
       * @ngdoc method
       * @name $cookieStore#remove
       *
       * @description
       * Remove given cookie
       *
       * @param {string} key Id of the key-value pair to delete.
       */
      remove: function(key) {
        $cookies.remove(key);
      }
    };

  }]);

/**
 * @name $$cookieWriter
 * @requires $document
 *
 * @description
 * This is a private service for writing cookies
 *
 * @param {string} name Cookie name
 * @param {string=} value Cookie value (if undefined, cookie will be deleted)
 * @param {Object=} options Object with options that need to be stored for the cookie.
 */
function $$CookieWriter($document, $log, $browser) {
  var cookiePath = $browser.baseHref();
  var rawDocument = $document[0];

  function buildCookieString(name, value, options) {
    var path, expires;
    options = options || {};
    expires = options.expires;
    path = angular.isDefined(options.path) ? options.path : cookiePath;
    if (angular.isUndefined(value)) {
      expires = 'Thu, 01 Jan 1970 00:00:00 GMT';
      value = '';
    }
    if (angular.isString(expires)) {
      expires = new Date(expires);
    }

    var str = encodeURIComponent(name) + '=' + encodeURIComponent(value);
    str += path ? ';path=' + path : '';
    str += options.domain ? ';domain=' + options.domain : '';
    str += expires ? ';expires=' + expires.toUTCString() : '';
    str += options.secure ? ';secure' : '';

    // per http://www.ietf.org/rfc/rfc2109.txt browser must allow at minimum:
    // - 300 cookies
    // - 20 cookies per unique domain
    // - 4096 bytes per cookie
    var cookieLength = str.length + 1;
    if (cookieLength > 4096) {
      $log.warn("Cookie '" + name +
        "' possibly not set or overflowed because it was too large (" +
        cookieLength + " > 4096 bytes)!");
    }

    return str;
  }

  return function(name, value, options) {
    rawDocument.cookie = buildCookieString(name, value, options);
  };
}

$$CookieWriter.$inject = ['$document', '$log', '$browser'];

angular.module('ngCookies').provider('$$cookieWriter', function $$CookieWriterProvider() {
  this.$get = $$CookieWriter;
});


})(window, window.angular);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJhbmd1bGFyLWNvb2tpZXMuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIEBsaWNlbnNlIEFuZ3VsYXJKUyB2MS41LjhcclxuICogKGMpIDIwMTAtMjAxNiBHb29nbGUsIEluYy4gaHR0cDovL2FuZ3VsYXJqcy5vcmdcclxuICogTGljZW5zZTogTUlUXHJcbiAqL1xyXG4oZnVuY3Rpb24od2luZG93LCBhbmd1bGFyKSB7J3VzZSBzdHJpY3QnO1xyXG5cclxuLyoqXHJcbiAqIEBuZ2RvYyBtb2R1bGVcclxuICogQG5hbWUgbmdDb29raWVzXHJcbiAqIEBkZXNjcmlwdGlvblxyXG4gKlxyXG4gKiAjIG5nQ29va2llc1xyXG4gKlxyXG4gKiBUaGUgYG5nQ29va2llc2AgbW9kdWxlIHByb3ZpZGVzIGEgY29udmVuaWVudCB3cmFwcGVyIGZvciByZWFkaW5nIGFuZCB3cml0aW5nIGJyb3dzZXIgY29va2llcy5cclxuICpcclxuICpcclxuICogPGRpdiBkb2MtbW9kdWxlLWNvbXBvbmVudHM9XCJuZ0Nvb2tpZXNcIj48L2Rpdj5cclxuICpcclxuICogU2VlIHtAbGluayBuZ0Nvb2tpZXMuJGNvb2tpZXMgYCRjb29raWVzYH0gZm9yIHVzYWdlLlxyXG4gKi9cclxuXHJcblxyXG5hbmd1bGFyLm1vZHVsZSgnbmdDb29raWVzJywgWyduZyddKS5cclxuICAvKipcclxuICAgKiBAbmdkb2MgcHJvdmlkZXJcclxuICAgKiBAbmFtZSAkY29va2llc1Byb3ZpZGVyXHJcbiAgICogQGRlc2NyaXB0aW9uXHJcbiAgICogVXNlIGAkY29va2llc1Byb3ZpZGVyYCB0byBjaGFuZ2UgdGhlIGRlZmF1bHQgYmVoYXZpb3Igb2YgdGhlIHtAbGluayBuZ0Nvb2tpZXMuJGNvb2tpZXMgJGNvb2tpZXN9IHNlcnZpY2UuXHJcbiAgICogKi9cclxuICAgcHJvdmlkZXIoJyRjb29raWVzJywgW2Z1bmN0aW9uICRDb29raWVzUHJvdmlkZXIoKSB7XHJcbiAgICAvKipcclxuICAgICAqIEBuZ2RvYyBwcm9wZXJ0eVxyXG4gICAgICogQG5hbWUgJGNvb2tpZXNQcm92aWRlciNkZWZhdWx0c1xyXG4gICAgICogQGRlc2NyaXB0aW9uXHJcbiAgICAgKlxyXG4gICAgICogT2JqZWN0IGNvbnRhaW5pbmcgZGVmYXVsdCBvcHRpb25zIHRvIHBhc3Mgd2hlbiBzZXR0aW5nIGNvb2tpZXMuXHJcbiAgICAgKlxyXG4gICAgICogVGhlIG9iamVjdCBtYXkgaGF2ZSBmb2xsb3dpbmcgcHJvcGVydGllczpcclxuICAgICAqXHJcbiAgICAgKiAtICoqcGF0aCoqIC0gYHtzdHJpbmd9YCAtIFRoZSBjb29raWUgd2lsbCBiZSBhdmFpbGFibGUgb25seSBmb3IgdGhpcyBwYXRoIGFuZCBpdHNcclxuICAgICAqICAgc3ViLXBhdGhzLiBCeSBkZWZhdWx0LCB0aGlzIGlzIHRoZSBVUkwgdGhhdCBhcHBlYXJzIGluIHlvdXIgYDxiYXNlPmAgdGFnLlxyXG4gICAgICogLSAqKmRvbWFpbioqIC0gYHtzdHJpbmd9YCAtIFRoZSBjb29raWUgd2lsbCBiZSBhdmFpbGFibGUgb25seSBmb3IgdGhpcyBkb21haW4gYW5kXHJcbiAgICAgKiAgIGl0cyBzdWItZG9tYWlucy4gRm9yIHNlY3VyaXR5IHJlYXNvbnMgdGhlIHVzZXIgYWdlbnQgd2lsbCBub3QgYWNjZXB0IHRoZSBjb29raWVcclxuICAgICAqICAgaWYgdGhlIGN1cnJlbnQgZG9tYWluIGlzIG5vdCBhIHN1Yi1kb21haW4gb2YgdGhpcyBkb21haW4gb3IgZXF1YWwgdG8gaXQuXHJcbiAgICAgKiAtICoqZXhwaXJlcyoqIC0gYHtzdHJpbmd8RGF0ZX1gIC0gU3RyaW5nIG9mIHRoZSBmb3JtIFwiV2R5LCBERCBNb24gWVlZWSBISDpNTTpTUyBHTVRcIlxyXG4gICAgICogICBvciBhIERhdGUgb2JqZWN0IGluZGljYXRpbmcgdGhlIGV4YWN0IGRhdGUvdGltZSB0aGlzIGNvb2tpZSB3aWxsIGV4cGlyZS5cclxuICAgICAqIC0gKipzZWN1cmUqKiAtIGB7Ym9vbGVhbn1gIC0gSWYgYHRydWVgLCB0aGVuIHRoZSBjb29raWUgd2lsbCBvbmx5IGJlIGF2YWlsYWJsZSB0aHJvdWdoIGFcclxuICAgICAqICAgc2VjdXJlZCBjb25uZWN0aW9uLlxyXG4gICAgICpcclxuICAgICAqIE5vdGU6IEJ5IGRlZmF1bHQsIHRoZSBhZGRyZXNzIHRoYXQgYXBwZWFycyBpbiB5b3VyIGA8YmFzZT5gIHRhZyB3aWxsIGJlIHVzZWQgYXMgdGhlIHBhdGguXHJcbiAgICAgKiBUaGlzIGlzIGltcG9ydGFudCBzbyB0aGF0IGNvb2tpZXMgd2lsbCBiZSB2aXNpYmxlIGZvciBhbGwgcm91dGVzIHdoZW4gaHRtbDVtb2RlIGlzIGVuYWJsZWQuXHJcbiAgICAgKlxyXG4gICAgICoqL1xyXG4gICAgdmFyIGRlZmF1bHRzID0gdGhpcy5kZWZhdWx0cyA9IHt9O1xyXG5cclxuICAgIGZ1bmN0aW9uIGNhbGNPcHRpb25zKG9wdGlvbnMpIHtcclxuICAgICAgcmV0dXJuIG9wdGlvbnMgPyBhbmd1bGFyLmV4dGVuZCh7fSwgZGVmYXVsdHMsIG9wdGlvbnMpIDogZGVmYXVsdHM7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAbmdkb2Mgc2VydmljZVxyXG4gICAgICogQG5hbWUgJGNvb2tpZXNcclxuICAgICAqXHJcbiAgICAgKiBAZGVzY3JpcHRpb25cclxuICAgICAqIFByb3ZpZGVzIHJlYWQvd3JpdGUgYWNjZXNzIHRvIGJyb3dzZXIncyBjb29raWVzLlxyXG4gICAgICpcclxuICAgICAqIDxkaXYgY2xhc3M9XCJhbGVydCBhbGVydC1pbmZvXCI+XHJcbiAgICAgKiBVcCB1bnRpbCBBbmd1bGFyIDEuMywgYCRjb29raWVzYCBleHBvc2VkIHByb3BlcnRpZXMgdGhhdCByZXByZXNlbnRlZCB0aGVcclxuICAgICAqIGN1cnJlbnQgYnJvd3NlciBjb29raWUgdmFsdWVzLiBJbiB2ZXJzaW9uIDEuNCwgdGhpcyBiZWhhdmlvciBoYXMgY2hhbmdlZCwgYW5kXHJcbiAgICAgKiBgJGNvb2tpZXNgIG5vdyBwcm92aWRlcyBhIHN0YW5kYXJkIGFwaSBvZiBnZXR0ZXJzLCBzZXR0ZXJzIGV0Yy5cclxuICAgICAqIDwvZGl2PlxyXG4gICAgICpcclxuICAgICAqIFJlcXVpcmVzIHRoZSB7QGxpbmsgbmdDb29raWVzIGBuZ0Nvb2tpZXNgfSBtb2R1bGUgdG8gYmUgaW5zdGFsbGVkLlxyXG4gICAgICpcclxuICAgICAqIEBleGFtcGxlXHJcbiAgICAgKlxyXG4gICAgICogYGBganNcclxuICAgICAqIGFuZ3VsYXIubW9kdWxlKCdjb29raWVzRXhhbXBsZScsIFsnbmdDb29raWVzJ10pXHJcbiAgICAgKiAgIC5jb250cm9sbGVyKCdFeGFtcGxlQ29udHJvbGxlcicsIFsnJGNvb2tpZXMnLCBmdW5jdGlvbigkY29va2llcykge1xyXG4gICAgICogICAgIC8vIFJldHJpZXZpbmcgYSBjb29raWVcclxuICAgICAqICAgICB2YXIgZmF2b3JpdGVDb29raWUgPSAkY29va2llcy5nZXQoJ215RmF2b3JpdGUnKTtcclxuICAgICAqICAgICAvLyBTZXR0aW5nIGEgY29va2llXHJcbiAgICAgKiAgICAgJGNvb2tpZXMucHV0KCdteUZhdm9yaXRlJywgJ29hdG1lYWwnKTtcclxuICAgICAqICAgfV0pO1xyXG4gICAgICogYGBgXHJcbiAgICAgKi9cclxuICAgIHRoaXMuJGdldCA9IFsnJCRjb29raWVSZWFkZXInLCAnJCRjb29raWVXcml0ZXInLCBmdW5jdGlvbigkJGNvb2tpZVJlYWRlciwgJCRjb29raWVXcml0ZXIpIHtcclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBAbmdkb2MgbWV0aG9kXHJcbiAgICAgICAgICogQG5hbWUgJGNvb2tpZXMjZ2V0XHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBAZGVzY3JpcHRpb25cclxuICAgICAgICAgKiBSZXR1cm5zIHRoZSB2YWx1ZSBvZiBnaXZlbiBjb29raWUga2V5XHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30ga2V5IElkIHRvIHVzZSBmb3IgbG9va3VwLlxyXG4gICAgICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IFJhdyBjb29raWUgdmFsdWUuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZ2V0OiBmdW5jdGlvbihrZXkpIHtcclxuICAgICAgICAgIHJldHVybiAkJGNvb2tpZVJlYWRlcigpW2tleV07XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogQG5nZG9jIG1ldGhvZFxyXG4gICAgICAgICAqIEBuYW1lICRjb29raWVzI2dldE9iamVjdFxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogQGRlc2NyaXB0aW9uXHJcbiAgICAgICAgICogUmV0dXJucyB0aGUgZGVzZXJpYWxpemVkIHZhbHVlIG9mIGdpdmVuIGNvb2tpZSBrZXlcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgSWQgdG8gdXNlIGZvciBsb29rdXAuXHJcbiAgICAgICAgICogQHJldHVybnMge09iamVjdH0gRGVzZXJpYWxpemVkIGNvb2tpZSB2YWx1ZS5cclxuICAgICAgICAgKi9cclxuICAgICAgICBnZXRPYmplY3Q6IGZ1bmN0aW9uKGtleSkge1xyXG4gICAgICAgICAgdmFyIHZhbHVlID0gdGhpcy5nZXQoa2V5KTtcclxuICAgICAgICAgIHJldHVybiB2YWx1ZSA/IGFuZ3VsYXIuZnJvbUpzb24odmFsdWUpIDogdmFsdWU7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogQG5nZG9jIG1ldGhvZFxyXG4gICAgICAgICAqIEBuYW1lICRjb29raWVzI2dldEFsbFxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogQGRlc2NyaXB0aW9uXHJcbiAgICAgICAgICogUmV0dXJucyBhIGtleSB2YWx1ZSBvYmplY3Qgd2l0aCBhbGwgdGhlIGNvb2tpZXNcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEByZXR1cm5zIHtPYmplY3R9IEFsbCBjb29raWVzXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZ2V0QWxsOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgIHJldHVybiAkJGNvb2tpZVJlYWRlcigpO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEBuZ2RvYyBtZXRob2RcclxuICAgICAgICAgKiBAbmFtZSAkY29va2llcyNwdXRcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEBkZXNjcmlwdGlvblxyXG4gICAgICAgICAqIFNldHMgYSB2YWx1ZSBmb3IgZ2l2ZW4gY29va2llIGtleVxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGtleSBJZCBmb3IgdGhlIGB2YWx1ZWAuXHJcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IHZhbHVlIFJhdyB2YWx1ZSB0byBiZSBzdG9yZWQuXHJcbiAgICAgICAgICogQHBhcmFtIHtPYmplY3Q9fSBvcHRpb25zIE9wdGlvbnMgb2JqZWN0LlxyXG4gICAgICAgICAqICAgIFNlZSB7QGxpbmsgbmdDb29raWVzLiRjb29raWVzUHJvdmlkZXIjZGVmYXVsdHMgJGNvb2tpZXNQcm92aWRlci5kZWZhdWx0c31cclxuICAgICAgICAgKi9cclxuICAgICAgICBwdXQ6IGZ1bmN0aW9uKGtleSwgdmFsdWUsIG9wdGlvbnMpIHtcclxuICAgICAgICAgICQkY29va2llV3JpdGVyKGtleSwgdmFsdWUsIGNhbGNPcHRpb25zKG9wdGlvbnMpKTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBAbmdkb2MgbWV0aG9kXHJcbiAgICAgICAgICogQG5hbWUgJGNvb2tpZXMjcHV0T2JqZWN0XHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBAZGVzY3JpcHRpb25cclxuICAgICAgICAgKiBTZXJpYWxpemVzIGFuZCBzZXRzIGEgdmFsdWUgZm9yIGdpdmVuIGNvb2tpZSBrZXlcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgSWQgZm9yIHRoZSBgdmFsdWVgLlxyXG4gICAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSB2YWx1ZSBWYWx1ZSB0byBiZSBzdG9yZWQuXHJcbiAgICAgICAgICogQHBhcmFtIHtPYmplY3Q9fSBvcHRpb25zIE9wdGlvbnMgb2JqZWN0LlxyXG4gICAgICAgICAqICAgIFNlZSB7QGxpbmsgbmdDb29raWVzLiRjb29raWVzUHJvdmlkZXIjZGVmYXVsdHMgJGNvb2tpZXNQcm92aWRlci5kZWZhdWx0c31cclxuICAgICAgICAgKi9cclxuICAgICAgICBwdXRPYmplY3Q6IGZ1bmN0aW9uKGtleSwgdmFsdWUsIG9wdGlvbnMpIHtcclxuICAgICAgICAgIHRoaXMucHV0KGtleSwgYW5ndWxhci50b0pzb24odmFsdWUpLCBvcHRpb25zKTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBAbmdkb2MgbWV0aG9kXHJcbiAgICAgICAgICogQG5hbWUgJGNvb2tpZXMjcmVtb3ZlXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBAZGVzY3JpcHRpb25cclxuICAgICAgICAgKiBSZW1vdmUgZ2l2ZW4gY29va2llXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30ga2V5IElkIG9mIHRoZSBrZXktdmFsdWUgcGFpciB0byBkZWxldGUuXHJcbiAgICAgICAgICogQHBhcmFtIHtPYmplY3Q9fSBvcHRpb25zIE9wdGlvbnMgb2JqZWN0LlxyXG4gICAgICAgICAqICAgIFNlZSB7QGxpbmsgbmdDb29raWVzLiRjb29raWVzUHJvdmlkZXIjZGVmYXVsdHMgJGNvb2tpZXNQcm92aWRlci5kZWZhdWx0c31cclxuICAgICAgICAgKi9cclxuICAgICAgICByZW1vdmU6IGZ1bmN0aW9uKGtleSwgb3B0aW9ucykge1xyXG4gICAgICAgICAgJCRjb29raWVXcml0ZXIoa2V5LCB1bmRlZmluZWQsIGNhbGNPcHRpb25zKG9wdGlvbnMpKTtcclxuICAgICAgICB9XHJcbiAgICAgIH07XHJcbiAgICB9XTtcclxuICB9XSk7XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgnbmdDb29raWVzJykuXHJcbi8qKlxyXG4gKiBAbmdkb2Mgc2VydmljZVxyXG4gKiBAbmFtZSAkY29va2llU3RvcmVcclxuICogQGRlcHJlY2F0ZWRcclxuICogQHJlcXVpcmVzICRjb29raWVzXHJcbiAqXHJcbiAqIEBkZXNjcmlwdGlvblxyXG4gKiBQcm92aWRlcyBhIGtleS12YWx1ZSAoc3RyaW5nLW9iamVjdCkgc3RvcmFnZSwgdGhhdCBpcyBiYWNrZWQgYnkgc2Vzc2lvbiBjb29raWVzLlxyXG4gKiBPYmplY3RzIHB1dCBvciByZXRyaWV2ZWQgZnJvbSB0aGlzIHN0b3JhZ2UgYXJlIGF1dG9tYXRpY2FsbHkgc2VyaWFsaXplZCBvclxyXG4gKiBkZXNlcmlhbGl6ZWQgYnkgYW5ndWxhcidzIHRvSnNvbi9mcm9tSnNvbi5cclxuICpcclxuICogUmVxdWlyZXMgdGhlIHtAbGluayBuZ0Nvb2tpZXMgYG5nQ29va2llc2B9IG1vZHVsZSB0byBiZSBpbnN0YWxsZWQuXHJcbiAqXHJcbiAqIDxkaXYgY2xhc3M9XCJhbGVydCBhbGVydC1kYW5nZXJcIj5cclxuICogKipOb3RlOioqIFRoZSAkY29va2llU3RvcmUgc2VydmljZSBpcyAqKmRlcHJlY2F0ZWQqKi5cclxuICogUGxlYXNlIHVzZSB0aGUge0BsaW5rIG5nQ29va2llcy4kY29va2llcyBgJGNvb2tpZXNgfSBzZXJ2aWNlIGluc3RlYWQuXHJcbiAqIDwvZGl2PlxyXG4gKlxyXG4gKiBAZXhhbXBsZVxyXG4gKlxyXG4gKiBgYGBqc1xyXG4gKiBhbmd1bGFyLm1vZHVsZSgnY29va2llU3RvcmVFeGFtcGxlJywgWyduZ0Nvb2tpZXMnXSlcclxuICogICAuY29udHJvbGxlcignRXhhbXBsZUNvbnRyb2xsZXInLCBbJyRjb29raWVTdG9yZScsIGZ1bmN0aW9uKCRjb29raWVTdG9yZSkge1xyXG4gKiAgICAgLy8gUHV0IGNvb2tpZVxyXG4gKiAgICAgJGNvb2tpZVN0b3JlLnB1dCgnbXlGYXZvcml0ZScsJ29hdG1lYWwnKTtcclxuICogICAgIC8vIEdldCBjb29raWVcclxuICogICAgIHZhciBmYXZvcml0ZUNvb2tpZSA9ICRjb29raWVTdG9yZS5nZXQoJ215RmF2b3JpdGUnKTtcclxuICogICAgIC8vIFJlbW92aW5nIGEgY29va2llXHJcbiAqICAgICAkY29va2llU3RvcmUucmVtb3ZlKCdteUZhdm9yaXRlJyk7XHJcbiAqICAgfV0pO1xyXG4gKiBgYGBcclxuICovXHJcbiBmYWN0b3J5KCckY29va2llU3RvcmUnLCBbJyRjb29raWVzJywgZnVuY3Rpb24oJGNvb2tpZXMpIHtcclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAvKipcclxuICAgICAgICogQG5nZG9jIG1ldGhvZFxyXG4gICAgICAgKiBAbmFtZSAkY29va2llU3RvcmUjZ2V0XHJcbiAgICAgICAqXHJcbiAgICAgICAqIEBkZXNjcmlwdGlvblxyXG4gICAgICAgKiBSZXR1cm5zIHRoZSB2YWx1ZSBvZiBnaXZlbiBjb29raWUga2V5XHJcbiAgICAgICAqXHJcbiAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgSWQgdG8gdXNlIGZvciBsb29rdXAuXHJcbiAgICAgICAqIEByZXR1cm5zIHtPYmplY3R9IERlc2VyaWFsaXplZCBjb29raWUgdmFsdWUsIHVuZGVmaW5lZCBpZiB0aGUgY29va2llIGRvZXMgbm90IGV4aXN0LlxyXG4gICAgICAgKi9cclxuICAgICAgZ2V0OiBmdW5jdGlvbihrZXkpIHtcclxuICAgICAgICByZXR1cm4gJGNvb2tpZXMuZ2V0T2JqZWN0KGtleSk7XHJcbiAgICAgIH0sXHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogQG5nZG9jIG1ldGhvZFxyXG4gICAgICAgKiBAbmFtZSAkY29va2llU3RvcmUjcHV0XHJcbiAgICAgICAqXHJcbiAgICAgICAqIEBkZXNjcmlwdGlvblxyXG4gICAgICAgKiBTZXRzIGEgdmFsdWUgZm9yIGdpdmVuIGNvb2tpZSBrZXlcclxuICAgICAgICpcclxuICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGtleSBJZCBmb3IgdGhlIGB2YWx1ZWAuXHJcbiAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSB2YWx1ZSBWYWx1ZSB0byBiZSBzdG9yZWQuXHJcbiAgICAgICAqL1xyXG4gICAgICBwdXQ6IGZ1bmN0aW9uKGtleSwgdmFsdWUpIHtcclxuICAgICAgICAkY29va2llcy5wdXRPYmplY3Qoa2V5LCB2YWx1ZSk7XHJcbiAgICAgIH0sXHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogQG5nZG9jIG1ldGhvZFxyXG4gICAgICAgKiBAbmFtZSAkY29va2llU3RvcmUjcmVtb3ZlXHJcbiAgICAgICAqXHJcbiAgICAgICAqIEBkZXNjcmlwdGlvblxyXG4gICAgICAgKiBSZW1vdmUgZ2l2ZW4gY29va2llXHJcbiAgICAgICAqXHJcbiAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgSWQgb2YgdGhlIGtleS12YWx1ZSBwYWlyIHRvIGRlbGV0ZS5cclxuICAgICAgICovXHJcbiAgICAgIHJlbW92ZTogZnVuY3Rpb24oa2V5KSB7XHJcbiAgICAgICAgJGNvb2tpZXMucmVtb3ZlKGtleSk7XHJcbiAgICAgIH1cclxuICAgIH07XHJcblxyXG4gIH1dKTtcclxuXHJcbi8qKlxyXG4gKiBAbmFtZSAkJGNvb2tpZVdyaXRlclxyXG4gKiBAcmVxdWlyZXMgJGRvY3VtZW50XHJcbiAqXHJcbiAqIEBkZXNjcmlwdGlvblxyXG4gKiBUaGlzIGlzIGEgcHJpdmF0ZSBzZXJ2aWNlIGZvciB3cml0aW5nIGNvb2tpZXNcclxuICpcclxuICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgQ29va2llIG5hbWVcclxuICogQHBhcmFtIHtzdHJpbmc9fSB2YWx1ZSBDb29raWUgdmFsdWUgKGlmIHVuZGVmaW5lZCwgY29va2llIHdpbGwgYmUgZGVsZXRlZClcclxuICogQHBhcmFtIHtPYmplY3Q9fSBvcHRpb25zIE9iamVjdCB3aXRoIG9wdGlvbnMgdGhhdCBuZWVkIHRvIGJlIHN0b3JlZCBmb3IgdGhlIGNvb2tpZS5cclxuICovXHJcbmZ1bmN0aW9uICQkQ29va2llV3JpdGVyKCRkb2N1bWVudCwgJGxvZywgJGJyb3dzZXIpIHtcclxuICB2YXIgY29va2llUGF0aCA9ICRicm93c2VyLmJhc2VIcmVmKCk7XHJcbiAgdmFyIHJhd0RvY3VtZW50ID0gJGRvY3VtZW50WzBdO1xyXG5cclxuICBmdW5jdGlvbiBidWlsZENvb2tpZVN0cmluZyhuYW1lLCB2YWx1ZSwgb3B0aW9ucykge1xyXG4gICAgdmFyIHBhdGgsIGV4cGlyZXM7XHJcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcclxuICAgIGV4cGlyZXMgPSBvcHRpb25zLmV4cGlyZXM7XHJcbiAgICBwYXRoID0gYW5ndWxhci5pc0RlZmluZWQob3B0aW9ucy5wYXRoKSA/IG9wdGlvbnMucGF0aCA6IGNvb2tpZVBhdGg7XHJcbiAgICBpZiAoYW5ndWxhci5pc1VuZGVmaW5lZCh2YWx1ZSkpIHtcclxuICAgICAgZXhwaXJlcyA9ICdUaHUsIDAxIEphbiAxOTcwIDAwOjAwOjAwIEdNVCc7XHJcbiAgICAgIHZhbHVlID0gJyc7XHJcbiAgICB9XHJcbiAgICBpZiAoYW5ndWxhci5pc1N0cmluZyhleHBpcmVzKSkge1xyXG4gICAgICBleHBpcmVzID0gbmV3IERhdGUoZXhwaXJlcyk7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIHN0ciA9IGVuY29kZVVSSUNvbXBvbmVudChuYW1lKSArICc9JyArIGVuY29kZVVSSUNvbXBvbmVudCh2YWx1ZSk7XHJcbiAgICBzdHIgKz0gcGF0aCA/ICc7cGF0aD0nICsgcGF0aCA6ICcnO1xyXG4gICAgc3RyICs9IG9wdGlvbnMuZG9tYWluID8gJztkb21haW49JyArIG9wdGlvbnMuZG9tYWluIDogJyc7XHJcbiAgICBzdHIgKz0gZXhwaXJlcyA/ICc7ZXhwaXJlcz0nICsgZXhwaXJlcy50b1VUQ1N0cmluZygpIDogJyc7XHJcbiAgICBzdHIgKz0gb3B0aW9ucy5zZWN1cmUgPyAnO3NlY3VyZScgOiAnJztcclxuXHJcbiAgICAvLyBwZXIgaHR0cDovL3d3dy5pZXRmLm9yZy9yZmMvcmZjMjEwOS50eHQgYnJvd3NlciBtdXN0IGFsbG93IGF0IG1pbmltdW06XHJcbiAgICAvLyAtIDMwMCBjb29raWVzXHJcbiAgICAvLyAtIDIwIGNvb2tpZXMgcGVyIHVuaXF1ZSBkb21haW5cclxuICAgIC8vIC0gNDA5NiBieXRlcyBwZXIgY29va2llXHJcbiAgICB2YXIgY29va2llTGVuZ3RoID0gc3RyLmxlbmd0aCArIDE7XHJcbiAgICBpZiAoY29va2llTGVuZ3RoID4gNDA5Nikge1xyXG4gICAgICAkbG9nLndhcm4oXCJDb29raWUgJ1wiICsgbmFtZSArXHJcbiAgICAgICAgXCInIHBvc3NpYmx5IG5vdCBzZXQgb3Igb3ZlcmZsb3dlZCBiZWNhdXNlIGl0IHdhcyB0b28gbGFyZ2UgKFwiICtcclxuICAgICAgICBjb29raWVMZW5ndGggKyBcIiA+IDQwOTYgYnl0ZXMpIVwiKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gc3RyO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIGZ1bmN0aW9uKG5hbWUsIHZhbHVlLCBvcHRpb25zKSB7XHJcbiAgICByYXdEb2N1bWVudC5jb29raWUgPSBidWlsZENvb2tpZVN0cmluZyhuYW1lLCB2YWx1ZSwgb3B0aW9ucyk7XHJcbiAgfTtcclxufVxyXG5cclxuJCRDb29raWVXcml0ZXIuJGluamVjdCA9IFsnJGRvY3VtZW50JywgJyRsb2cnLCAnJGJyb3dzZXInXTtcclxuXHJcbmFuZ3VsYXIubW9kdWxlKCduZ0Nvb2tpZXMnKS5wcm92aWRlcignJCRjb29raWVXcml0ZXInLCBmdW5jdGlvbiAkJENvb2tpZVdyaXRlclByb3ZpZGVyKCkge1xyXG4gIHRoaXMuJGdldCA9ICQkQ29va2llV3JpdGVyO1xyXG59KTtcclxuXHJcblxyXG59KSh3aW5kb3csIHdpbmRvdy5hbmd1bGFyKTsiXSwiZmlsZSI6ImFuZ3VsYXItY29va2llcy5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
