/**
 * @license AngularJS v1.5.8
 * (c) 2010-2016 Google, Inc. http://angularjs.org
 * License: MIT
 */
(function(window, angular) {'use strict';

/* global shallowCopy: true */

/**
 * Creates a shallow copy of an object, an array or a primitive.
 *
 * Assumes that there are no proto properties for objects.
 */
function shallowCopy(src, dst) {
  if (isArray(src)) {
    dst = dst || [];

    for (var i = 0, ii = src.length; i < ii; i++) {
      dst[i] = src[i];
    }
  } else if (isObject(src)) {
    dst = dst || {};

    for (var key in src) {
      if (!(key.charAt(0) === '$' && key.charAt(1) === '$')) {
        dst[key] = src[key];
      }
    }
  }

  return dst || src;
}

/* global shallowCopy: false */

// There are necessary for `shallowCopy()` (included via `src/shallowCopy.js`).
// They are initialized inside the `$RouteProvider`, to ensure `window.angular` is available.
var isArray;
var isObject;

/**
 * @ngdoc module
 * @name ngRoute
 * @description
 *
 * # ngRoute
 *
 * The `ngRoute` module provides routing and deeplinking services and directives for angular apps.
 *
 * ## Example
 * See {@link ngRoute.$route#example $route} for an example of configuring and using `ngRoute`.
 *
 *
 * <div doc-module-components="ngRoute"></div>
 */
 /* global -ngRouteModule */
var ngRouteModule = angular.module('ngRoute', ['ng']).
                        provider('$route', $RouteProvider),
    $routeMinErr = angular.$$minErr('ngRoute');

/**
 * @ngdoc provider
 * @name $routeProvider
 *
 * @description
 *
 * Used for configuring routes.
 *
 * ## Example
 * See {@link ngRoute.$route#example $route} for an example of configuring and using `ngRoute`.
 *
 * ## Dependencies
 * Requires the {@link ngRoute `ngRoute`} module to be installed.
 */
function $RouteProvider() {
  isArray = angular.isArray;
  isObject = angular.isObject;

  function inherit(parent, extra) {
    return angular.extend(Object.create(parent), extra);
  }

  var routes = {};

  /**
   * @ngdoc method
   * @name $routeProvider#when
   *
   * @param {string} path Route path (matched against `$location.path`). If `$location.path`
   *    contains redundant trailing slash or is missing one, the route will still match and the
   *    `$location.path` will be updated to add or drop the trailing slash to exactly match the
   *    route definition.
   *
   *    * `path` can contain named groups starting with a colon: e.g. `:name`. All characters up
   *        to the next slash are matched and stored in `$routeParams` under the given `name`
   *        when the route matches.
   *    * `path` can contain named groups starting with a colon and ending with a star:
   *        e.g.`:name*`. All characters are eagerly stored in `$routeParams` under the given `name`
   *        when the route matches.
   *    * `path` can contain optional named groups with a question mark: e.g.`:name?`.
   *
   *    For example, routes like `/color/:color/largecode/:largecode*\/edit` will match
   *    `/color/brown/largecode/code/with/slashes/edit` and extract:
   *
   *    * `color: brown`
   *    * `largecode: code/with/slashes`.
   *
   *
   * @param {Object} route Mapping information to be assigned to `$route.current` on route
   *    match.
   *
   *    Object properties:
   *
   *    - `controller` – `{(string|function()=}` – Controller fn that should be associated with
   *      newly created scope or the name of a {@link angular.Module#controller registered
   *      controller} if passed as a string.
   *    - `controllerAs` – `{string=}` – An identifier name for a reference to the controller.
   *      If present, the controller will be published to scope under the `controllerAs` name.
   *    - `template` – `{string=|function()=}` – html template as a string or a function that
   *      returns an html template as a string which should be used by {@link
   *      ngRoute.directive:ngView ngView} or {@link ng.directive:ngInclude ngInclude} directives.
   *      This property takes precedence over `templateUrl`.
   *
   *      If `template` is a function, it will be called with the following parameters:
   *
   *      - `{Array.<Object>}` - route parameters extracted from the current
   *        `$location.path()` by applying the current route
   *
   *    - `templateUrl` – `{string=|function()=}` – path or function that returns a path to an html
   *      template that should be used by {@link ngRoute.directive:ngView ngView}.
   *
   *      If `templateUrl` is a function, it will be called with the following parameters:
   *
   *      - `{Array.<Object>}` - route parameters extracted from the current
   *        `$location.path()` by applying the current route
   *
   *    - `resolve` - `{Object.<string, function>=}` - An optional map of dependencies which should
   *      be injected into the controller. If any of these dependencies are promises, the router
   *      will wait for them all to be resolved or one to be rejected before the controller is
   *      instantiated.
   *      If all the promises are resolved successfully, the values of the resolved promises are
   *      injected and {@link ngRoute.$route#$routeChangeSuccess $routeChangeSuccess} event is
   *      fired. If any of the promises are rejected the
   *      {@link ngRoute.$route#$routeChangeError $routeChangeError} event is fired.
   *      For easier access to the resolved dependencies from the template, the `resolve` map will
   *      be available on the scope of the route, under `$resolve` (by default) or a custom name
   *      specified by the `resolveAs` property (see below). This can be particularly useful, when
   *      working with {@link angular.Module#component components} as route templates.<br />
   *      <div class="alert alert-warning">
   *        **Note:** If your scope already contains a property with this name, it will be hidden
   *        or overwritten. Make sure, you specify an appropriate name for this property, that
   *        does not collide with other properties on the scope.
   *      </div>
   *      The map object is:
   *
   *      - `key` – `{string}`: a name of a dependency to be injected into the controller.
   *      - `factory` - `{string|function}`: If `string` then it is an alias for a service.
   *        Otherwise if function, then it is {@link auto.$injector#invoke injected}
   *        and the return value is treated as the dependency. If the result is a promise, it is
   *        resolved before its value is injected into the controller. Be aware that
   *        `ngRoute.$routeParams` will still refer to the previous route within these resolve
   *        functions.  Use `$route.current.params` to access the new route parameters, instead.
   *
   *    - `resolveAs` - `{string=}` - The name under which the `resolve` map will be available on
   *      the scope of the route. If omitted, defaults to `$resolve`.
   *
   *    - `redirectTo` – `{(string|function())=}` – value to update
   *      {@link ng.$location $location} path with and trigger route redirection.
   *
   *      If `redirectTo` is a function, it will be called with the following parameters:
   *
   *      - `{Object.<string>}` - route parameters extracted from the current
   *        `$location.path()` by applying the current route templateUrl.
   *      - `{string}` - current `$location.path()`
   *      - `{Object}` - current `$location.search()`
   *
   *      The custom `redirectTo` function is expected to return a string which will be used
   *      to update `$location.path()` and `$location.search()`.
   *
   *    - `[reloadOnSearch=true]` - `{boolean=}` - reload route when only `$location.search()`
   *      or `$location.hash()` changes.
   *
   *      If the option is set to `false` and url in the browser changes, then
   *      `$routeUpdate` event is broadcasted on the root scope.
   *
   *    - `[caseInsensitiveMatch=false]` - `{boolean=}` - match routes without being case sensitive
   *
   *      If the option is set to `true`, then the particular route can be matched without being
   *      case sensitive
   *
   * @returns {Object} self
   *
   * @description
   * Adds a new route definition to the `$route` service.
   */
  this.when = function(path, route) {
    //copy original route object to preserve params inherited from proto chain
    var routeCopy = shallowCopy(route);
    if (angular.isUndefined(routeCopy.reloadOnSearch)) {
      routeCopy.reloadOnSearch = true;
    }
    if (angular.isUndefined(routeCopy.caseInsensitiveMatch)) {
      routeCopy.caseInsensitiveMatch = this.caseInsensitiveMatch;
    }
    routes[path] = angular.extend(
      routeCopy,
      path && pathRegExp(path, routeCopy)
    );

    // create redirection for trailing slashes
    if (path) {
      var redirectPath = (path[path.length - 1] == '/')
            ? path.substr(0, path.length - 1)
            : path + '/';

      routes[redirectPath] = angular.extend(
        {redirectTo: path},
        pathRegExp(redirectPath, routeCopy)
      );
    }

    return this;
  };

  /**
   * @ngdoc property
   * @name $routeProvider#caseInsensitiveMatch
   * @description
   *
   * A boolean property indicating if routes defined
   * using this provider should be matched using a case insensitive
   * algorithm. Defaults to `false`.
   */
  this.caseInsensitiveMatch = false;

   /**
    * @param path {string} path
    * @param opts {Object} options
    * @return {?Object}
    *
    * @description
    * Normalizes the given path, returning a regular expression
    * and the original path.
    *
    * Inspired by pathRexp in visionmedia/express/lib/utils.js.
    */
  function pathRegExp(path, opts) {
    var insensitive = opts.caseInsensitiveMatch,
        ret = {
          originalPath: path,
          regexp: path
        },
        keys = ret.keys = [];

    path = path
      .replace(/([().])/g, '\\$1')
      .replace(/(\/)?:(\w+)(\*\?|[\?\*])?/g, function(_, slash, key, option) {
        var optional = (option === '?' || option === '*?') ? '?' : null;
        var star = (option === '*' || option === '*?') ? '*' : null;
        keys.push({ name: key, optional: !!optional });
        slash = slash || '';
        return ''
          + (optional ? '' : slash)
          + '(?:'
          + (optional ? slash : '')
          + (star && '(.+?)' || '([^/]+)')
          + (optional || '')
          + ')'
          + (optional || '');
      })
      .replace(/([\/$\*])/g, '\\$1');

    ret.regexp = new RegExp('^' + path + '$', insensitive ? 'i' : '');
    return ret;
  }

  /**
   * @ngdoc method
   * @name $routeProvider#otherwise
   *
   * @description
   * Sets route definition that will be used on route change when no other route definition
   * is matched.
   *
   * @param {Object|string} params Mapping information to be assigned to `$route.current`.
   * If called with a string, the value maps to `redirectTo`.
   * @returns {Object} self
   */
  this.otherwise = function(params) {
    if (typeof params === 'string') {
      params = {redirectTo: params};
    }
    this.when(null, params);
    return this;
  };


  this.$get = ['$rootScope',
               '$location',
               '$routeParams',
               '$q',
               '$injector',
               '$templateRequest',
               '$sce',
      function($rootScope, $location, $routeParams, $q, $injector, $templateRequest, $sce) {

    /**
     * @ngdoc service
     * @name $route
     * @requires $location
     * @requires $routeParams
     *
     * @property {Object} current Reference to the current route definition.
     * The route definition contains:
     *
     *   - `controller`: The controller constructor as defined in the route definition.
     *   - `locals`: A map of locals which is used by {@link ng.$controller $controller} service for
     *     controller instantiation. The `locals` contain
     *     the resolved values of the `resolve` map. Additionally the `locals` also contain:
     *
     *     - `$scope` - The current route scope.
     *     - `$template` - The current route template HTML.
     *
     *     The `locals` will be assigned to the route scope's `$resolve` property. You can override
     *     the property name, using `resolveAs` in the route definition. See
     *     {@link ngRoute.$routeProvider $routeProvider} for more info.
     *
     * @property {Object} routes Object with all route configuration Objects as its properties.
     *
     * @description
     * `$route` is used for deep-linking URLs to controllers and views (HTML partials).
     * It watches `$location.url()` and tries to map the path to an existing route definition.
     *
     * Requires the {@link ngRoute `ngRoute`} module to be installed.
     *
     * You can define routes through {@link ngRoute.$routeProvider $routeProvider}'s API.
     *
     * The `$route` service is typically used in conjunction with the
     * {@link ngRoute.directive:ngView `ngView`} directive and the
     * {@link ngRoute.$routeParams `$routeParams`} service.
     *
     * @example
     * This example shows how changing the URL hash causes the `$route` to match a route against the
     * URL, and the `ngView` pulls in the partial.
     *
     * <example name="$route-service" module="ngRouteExample"
     *          deps="angular-route.js" fixBase="true">
     *   <file name="index.html">
     *     <div ng-controller="MainController">
     *       Choose:
     *       <a href="Book/Moby">Moby</a> |
     *       <a href="Book/Moby/ch/1">Moby: Ch1</a> |
     *       <a href="Book/Gatsby">Gatsby</a> |
     *       <a href="Book/Gatsby/ch/4?key=value">Gatsby: Ch4</a> |
     *       <a href="Book/Scarlet">Scarlet Letter</a><br/>
     *
     *       <div ng-view></div>
     *
     *       <hr />
     *
     *       <pre>$location.path() = {{$location.path()}}</pre>
     *       <pre>$route.current.templateUrl = {{$route.current.templateUrl}}</pre>
     *       <pre>$route.current.params = {{$route.current.params}}</pre>
     *       <pre>$route.current.scope.name = {{$route.current.scope.name}}</pre>
     *       <pre>$routeParams = {{$routeParams}}</pre>
     *     </div>
     *   </file>
     *
     *   <file name="book.html">
     *     controller: {{name}}<br />
     *     Book Id: {{params.bookId}}<br />
     *   </file>
     *
     *   <file name="chapter.html">
     *     controller: {{name}}<br />
     *     Book Id: {{params.bookId}}<br />
     *     Chapter Id: {{params.chapterId}}
     *   </file>
     *
     *   <file name="script.js">
     *     angular.module('ngRouteExample', ['ngRoute'])
     *
     *      .controller('MainController', function($scope, $route, $routeParams, $location) {
     *          $scope.$route = $route;
     *          $scope.$location = $location;
     *          $scope.$routeParams = $routeParams;
     *      })
     *
     *      .controller('BookController', function($scope, $routeParams) {
     *          $scope.name = "BookController";
     *          $scope.params = $routeParams;
     *      })
     *
     *      .controller('ChapterController', function($scope, $routeParams) {
     *          $scope.name = "ChapterController";
     *          $scope.params = $routeParams;
     *      })
     *
     *     .config(function($routeProvider, $locationProvider) {
     *       $routeProvider
     *        .when('/Book/:bookId', {
     *         templateUrl: 'book.html',
     *         controller: 'BookController',
     *         resolve: {
     *           // I will cause a 1 second delay
     *           delay: function($q, $timeout) {
     *             var delay = $q.defer();
     *             $timeout(delay.resolve, 1000);
     *             return delay.promise;
     *           }
     *         }
     *       })
     *       .when('/Book/:bookId/ch/:chapterId', {
     *         templateUrl: 'chapter.html',
     *         controller: 'ChapterController'
     *       });
     *
     *       // configure html5 to get links working on jsfiddle
     *       $locationProvider.html5Mode(true);
     *     });
     *
     *   </file>
     *
     *   <file name="protractor.js" type="protractor">
     *     it('should load and compile correct template', function() {
     *       element(by.linkText('Moby: Ch1')).click();
     *       var content = element(by.css('[ng-view]')).getText();
     *       expect(content).toMatch(/controller\: ChapterController/);
     *       expect(content).toMatch(/Book Id\: Moby/);
     *       expect(content).toMatch(/Chapter Id\: 1/);
     *
     *       element(by.partialLinkText('Scarlet')).click();
     *
     *       content = element(by.css('[ng-view]')).getText();
     *       expect(content).toMatch(/controller\: BookController/);
     *       expect(content).toMatch(/Book Id\: Scarlet/);
     *     });
     *   </file>
     * </example>
     */

    /**
     * @ngdoc event
     * @name $route#$routeChangeStart
     * @eventType broadcast on root scope
     * @description
     * Broadcasted before a route change. At this  point the route services starts
     * resolving all of the dependencies needed for the route change to occur.
     * Typically this involves fetching the view template as well as any dependencies
     * defined in `resolve` route property. Once  all of the dependencies are resolved
     * `$routeChangeSuccess` is fired.
     *
     * The route change (and the `$location` change that triggered it) can be prevented
     * by calling `preventDefault` method of the event. See {@link ng.$rootScope.Scope#$on}
     * for more details about event object.
     *
     * @param {Object} angularEvent Synthetic event object.
     * @param {Route} next Future route information.
     * @param {Route} current Current route information.
     */

    /**
     * @ngdoc event
     * @name $route#$routeChangeSuccess
     * @eventType broadcast on root scope
     * @description
     * Broadcasted after a route change has happened successfully.
     * The `resolve` dependencies are now available in the `current.locals` property.
     *
     * {@link ngRoute.directive:ngView ngView} listens for the directive
     * to instantiate the controller and render the view.
     *
     * @param {Object} angularEvent Synthetic event object.
     * @param {Route} current Current route information.
     * @param {Route|Undefined} previous Previous route information, or undefined if current is
     * first route entered.
     */

    /**
     * @ngdoc event
     * @name $route#$routeChangeError
     * @eventType broadcast on root scope
     * @description
     * Broadcasted if any of the resolve promises are rejected.
     *
     * @param {Object} angularEvent Synthetic event object
     * @param {Route} current Current route information.
     * @param {Route} previous Previous route information.
     * @param {Route} rejection Rejection of the promise. Usually the error of the failed promise.
     */

    /**
     * @ngdoc event
     * @name $route#$routeUpdate
     * @eventType broadcast on root scope
     * @description
     * The `reloadOnSearch` property has been set to false, and we are reusing the same
     * instance of the Controller.
     *
     * @param {Object} angularEvent Synthetic event object
     * @param {Route} current Current/previous route information.
     */

    var forceReload = false,
        preparedRoute,
        preparedRouteIsUpdateOnly,
        $route = {
          routes: routes,

          /**
           * @ngdoc method
           * @name $route#reload
           *
           * @description
           * Causes `$route` service to reload the current route even if
           * {@link ng.$location $location} hasn't changed.
           *
           * As a result of that, {@link ngRoute.directive:ngView ngView}
           * creates new scope and reinstantiates the controller.
           */
          reload: function() {
            forceReload = true;

            var fakeLocationEvent = {
              defaultPrevented: false,
              preventDefault: function fakePreventDefault() {
                this.defaultPrevented = true;
                forceReload = false;
              }
            };

            $rootScope.$evalAsync(function() {
              prepareRoute(fakeLocationEvent);
              if (!fakeLocationEvent.defaultPrevented) commitRoute();
            });
          },

          /**
           * @ngdoc method
           * @name $route#updateParams
           *
           * @description
           * Causes `$route` service to update the current URL, replacing
           * current route parameters with those specified in `newParams`.
           * Provided property names that match the route's path segment
           * definitions will be interpolated into the location's path, while
           * remaining properties will be treated as query params.
           *
           * @param {!Object<string, string>} newParams mapping of URL parameter names to values
           */
          updateParams: function(newParams) {
            if (this.current && this.current.$$route) {
              newParams = angular.extend({}, this.current.params, newParams);
              $location.path(interpolate(this.current.$$route.originalPath, newParams));
              // interpolate modifies newParams, only query params are left
              $location.search(newParams);
            } else {
              throw $routeMinErr('norout', 'Tried updating route when with no current route');
            }
          }
        };

    $rootScope.$on('$locationChangeStart', prepareRoute);
    $rootScope.$on('$locationChangeSuccess', commitRoute);

    return $route;

    /////////////////////////////////////////////////////

    /**
     * @param on {string} current url
     * @param route {Object} route regexp to match the url against
     * @return {?Object}
     *
     * @description
     * Check if the route matches the current url.
     *
     * Inspired by match in
     * visionmedia/express/lib/router/router.js.
     */
    function switchRouteMatcher(on, route) {
      var keys = route.keys,
          params = {};

      if (!route.regexp) return null;

      var m = route.regexp.exec(on);
      if (!m) return null;

      for (var i = 1, len = m.length; i < len; ++i) {
        var key = keys[i - 1];

        var val = m[i];

        if (key && val) {
          params[key.name] = val;
        }
      }
      return params;
    }

    function prepareRoute($locationEvent) {
      var lastRoute = $route.current;

      preparedRoute = parseRoute();
      preparedRouteIsUpdateOnly = preparedRoute && lastRoute && preparedRoute.$$route === lastRoute.$$route
          && angular.equals(preparedRoute.pathParams, lastRoute.pathParams)
          && !preparedRoute.reloadOnSearch && !forceReload;

      if (!preparedRouteIsUpdateOnly && (lastRoute || preparedRoute)) {
        if ($rootScope.$broadcast('$routeChangeStart', preparedRoute, lastRoute).defaultPrevented) {
          if ($locationEvent) {
            $locationEvent.preventDefault();
          }
        }
      }
    }

    function commitRoute() {
      var lastRoute = $route.current;
      var nextRoute = preparedRoute;

      if (preparedRouteIsUpdateOnly) {
        lastRoute.params = nextRoute.params;
        angular.copy(lastRoute.params, $routeParams);
        $rootScope.$broadcast('$routeUpdate', lastRoute);
      } else if (nextRoute || lastRoute) {
        forceReload = false;
        $route.current = nextRoute;
        if (nextRoute) {
          if (nextRoute.redirectTo) {
            if (angular.isString(nextRoute.redirectTo)) {
              $location.path(interpolate(nextRoute.redirectTo, nextRoute.params)).search(nextRoute.params)
                       .replace();
            } else {
              $location.url(nextRoute.redirectTo(nextRoute.pathParams, $location.path(), $location.search()))
                       .replace();
            }
          }
        }

        $q.when(nextRoute).
          then(resolveLocals).
          then(function(locals) {
            // after route change
            if (nextRoute == $route.current) {
              if (nextRoute) {
                nextRoute.locals = locals;
                angular.copy(nextRoute.params, $routeParams);
              }
              $rootScope.$broadcast('$routeChangeSuccess', nextRoute, lastRoute);
            }
          }, function(error) {
            if (nextRoute == $route.current) {
              $rootScope.$broadcast('$routeChangeError', nextRoute, lastRoute, error);
            }
          });
      }
    }

    function resolveLocals(route) {
      if (route) {
        var locals = angular.extend({}, route.resolve);
        angular.forEach(locals, function(value, key) {
          locals[key] = angular.isString(value) ?
              $injector.get(value) :
              $injector.invoke(value, null, null, key);
        });
        var template = getTemplateFor(route);
        if (angular.isDefined(template)) {
          locals['$template'] = template;
        }
        return $q.all(locals);
      }
    }


    function getTemplateFor(route) {
      var template, templateUrl;
      if (angular.isDefined(template = route.template)) {
        if (angular.isFunction(template)) {
          template = template(route.params);
        }
      } else if (angular.isDefined(templateUrl = route.templateUrl)) {
        if (angular.isFunction(templateUrl)) {
          templateUrl = templateUrl(route.params);
        }
        if (angular.isDefined(templateUrl)) {
          route.loadedTemplateUrl = $sce.valueOf(templateUrl);
          template = $templateRequest(templateUrl);
        }
      }
      return template;
    }


    /**
     * @returns {Object} the current active route, by matching it against the URL
     */
    function parseRoute() {
      // Match a route
      var params, match;
      angular.forEach(routes, function(route, path) {
        if (!match && (params = switchRouteMatcher($location.path(), route))) {
          match = inherit(route, {
            params: angular.extend({}, $location.search(), params),
            pathParams: params});
          match.$$route = route;
        }
      });
      // No route matched; fallback to "otherwise" route
      return match || routes[null] && inherit(routes[null], {params: {}, pathParams:{}});
    }

    /**
     * @returns {string} interpolation of the redirect path with the parameters
     */
    function interpolate(string, params) {
      var result = [];
      angular.forEach((string || '').split(':'), function(segment, i) {
        if (i === 0) {
          result.push(segment);
        } else {
          var segmentMatch = segment.match(/(\w+)(?:[?*])?(.*)/);
          var key = segmentMatch[1];
          result.push(params[key]);
          result.push(segmentMatch[2] || '');
          delete params[key];
        }
      });
      return result.join('');
    }
  }];
}

ngRouteModule.provider('$routeParams', $RouteParamsProvider);


/**
 * @ngdoc service
 * @name $routeParams
 * @requires $route
 *
 * @description
 * The `$routeParams` service allows you to retrieve the current set of route parameters.
 *
 * Requires the {@link ngRoute `ngRoute`} module to be installed.
 *
 * The route parameters are a combination of {@link ng.$location `$location`}'s
 * {@link ng.$location#search `search()`} and {@link ng.$location#path `path()`}.
 * The `path` parameters are extracted when the {@link ngRoute.$route `$route`} path is matched.
 *
 * In case of parameter name collision, `path` params take precedence over `search` params.
 *
 * The service guarantees that the identity of the `$routeParams` object will remain unchanged
 * (but its properties will likely change) even when a route change occurs.
 *
 * Note that the `$routeParams` are only updated *after* a route change completes successfully.
 * This means that you cannot rely on `$routeParams` being correct in route resolve functions.
 * Instead you can use `$route.current.params` to access the new route's parameters.
 *
 * @example
 * ```js
 *  // Given:
 *  // URL: http://server.com/index.html#/Chapter/1/Section/2?search=moby
 *  // Route: /Chapter/:chapterId/Section/:sectionId
 *  //
 *  // Then
 *  $routeParams ==> {chapterId:'1', sectionId:'2', search:'moby'}
 * ```
 */
function $RouteParamsProvider() {
  this.$get = function() { return {}; };
}

ngRouteModule.directive('ngView', ngViewFactory);
ngRouteModule.directive('ngView', ngViewFillContentFactory);


/**
 * @ngdoc directive
 * @name ngView
 * @restrict ECA
 *
 * @description
 * # Overview
 * `ngView` is a directive that complements the {@link ngRoute.$route $route} service by
 * including the rendered template of the current route into the main layout (`index.html`) file.
 * Every time the current route changes, the included view changes with it according to the
 * configuration of the `$route` service.
 *
 * Requires the {@link ngRoute `ngRoute`} module to be installed.
 *
 * @animations
 * | Animation                        | Occurs                              |
 * |----------------------------------|-------------------------------------|
 * | {@link ng.$animate#enter enter}  | when the new element is inserted to the DOM |
 * | {@link ng.$animate#leave leave}  | when the old element is removed from to the DOM  |
 *
 * The enter and leave animation occur concurrently.
 *
 * @knownIssue If `ngView` is contained in an asynchronously loaded template (e.g. in another
 *             directive's templateUrl or in a template loaded using `ngInclude`), then you need to
 *             make sure that `$route` is instantiated in time to capture the initial
 *             `$locationChangeStart` event and load the appropriate view. One way to achieve this
 *             is to have it as a dependency in a `.run` block:
 *             `myModule.run(['$route', function() {}]);`
 *
 * @scope
 * @priority 400
 * @param {string=} onload Expression to evaluate whenever the view updates.
 *
 * @param {string=} autoscroll Whether `ngView` should call {@link ng.$anchorScroll
 *                  $anchorScroll} to scroll the viewport after the view is updated.
 *
 *                  - If the attribute is not set, disable scrolling.
 *                  - If the attribute is set without value, enable scrolling.
 *                  - Otherwise enable scrolling only if the `autoscroll` attribute value evaluated
 *                    as an expression yields a truthy value.
 * @example
    <example name="ngView-directive" module="ngViewExample"
             deps="angular-route.js;angular-animate.js"
             animations="true" fixBase="true">
      <file name="index.html">
        <div ng-controller="MainCtrl as main">
          Choose:
          <a href="Book/Moby">Moby</a> |
          <a href="Book/Moby/ch/1">Moby: Ch1</a> |
          <a href="Book/Gatsby">Gatsby</a> |
          <a href="Book/Gatsby/ch/4?key=value">Gatsby: Ch4</a> |
          <a href="Book/Scarlet">Scarlet Letter</a><br/>

          <div class="view-animate-container">
            <div ng-view class="view-animate"></div>
          </div>
          <hr />

          <pre>$location.path() = {{main.$location.path()}}</pre>
          <pre>$route.current.templateUrl = {{main.$route.current.templateUrl}}</pre>
          <pre>$route.current.params = {{main.$route.current.params}}</pre>
          <pre>$routeParams = {{main.$routeParams}}</pre>
        </div>
      </file>

      <file name="book.html">
        <div>
          controller: {{book.name}}<br />
          Book Id: {{book.params.bookId}}<br />
        </div>
      </file>

      <file name="chapter.html">
        <div>
          controller: {{chapter.name}}<br />
          Book Id: {{chapter.params.bookId}}<br />
          Chapter Id: {{chapter.params.chapterId}}
        </div>
      </file>

      <file name="animations.css">
        .view-animate-container {
          position:relative;
          height:100px!important;
          background:white;
          border:1px solid black;
          height:40px;
          overflow:hidden;
        }

        .view-animate {
          padding:10px;
        }

        .view-animate.ng-enter, .view-animate.ng-leave {
          transition:all cubic-bezier(0.250, 0.460, 0.450, 0.940) 1.5s;

          display:block;
          width:100%;
          border-left:1px solid black;

          position:absolute;
          top:0;
          left:0;
          right:0;
          bottom:0;
          padding:10px;
        }

        .view-animate.ng-enter {
          left:100%;
        }
        .view-animate.ng-enter.ng-enter-active {
          left:0;
        }
        .view-animate.ng-leave.ng-leave-active {
          left:-100%;
        }
      </file>

      <file name="script.js">
        angular.module('ngViewExample', ['ngRoute', 'ngAnimate'])
          .config(['$routeProvider', '$locationProvider',
            function($routeProvider, $locationProvider) {
              $routeProvider
                .when('/Book/:bookId', {
                  templateUrl: 'book.html',
                  controller: 'BookCtrl',
                  controllerAs: 'book'
                })
                .when('/Book/:bookId/ch/:chapterId', {
                  templateUrl: 'chapter.html',
                  controller: 'ChapterCtrl',
                  controllerAs: 'chapter'
                });

              $locationProvider.html5Mode(true);
          }])
          .controller('MainCtrl', ['$route', '$routeParams', '$location',
            function($route, $routeParams, $location) {
              this.$route = $route;
              this.$location = $location;
              this.$routeParams = $routeParams;
          }])
          .controller('BookCtrl', ['$routeParams', function($routeParams) {
            this.name = "BookCtrl";
            this.params = $routeParams;
          }])
          .controller('ChapterCtrl', ['$routeParams', function($routeParams) {
            this.name = "ChapterCtrl";
            this.params = $routeParams;
          }]);

      </file>

      <file name="protractor.js" type="protractor">
        it('should load and compile correct template', function() {
          element(by.linkText('Moby: Ch1')).click();
          var content = element(by.css('[ng-view]')).getText();
          expect(content).toMatch(/controller\: ChapterCtrl/);
          expect(content).toMatch(/Book Id\: Moby/);
          expect(content).toMatch(/Chapter Id\: 1/);

          element(by.partialLinkText('Scarlet')).click();

          content = element(by.css('[ng-view]')).getText();
          expect(content).toMatch(/controller\: BookCtrl/);
          expect(content).toMatch(/Book Id\: Scarlet/);
        });
      </file>
    </example>
 */


/**
 * @ngdoc event
 * @name ngView#$viewContentLoaded
 * @eventType emit on the current ngView scope
 * @description
 * Emitted every time the ngView content is reloaded.
 */
ngViewFactory.$inject = ['$route', '$anchorScroll', '$animate'];
function ngViewFactory($route, $anchorScroll, $animate) {
  return {
    restrict: 'ECA',
    terminal: true,
    priority: 400,
    transclude: 'element',
    link: function(scope, $element, attr, ctrl, $transclude) {
        var currentScope,
            currentElement,
            previousLeaveAnimation,
            autoScrollExp = attr.autoscroll,
            onloadExp = attr.onload || '';

        scope.$on('$routeChangeSuccess', update);
        update();

        function cleanupLastView() {
          if (previousLeaveAnimation) {
            $animate.cancel(previousLeaveAnimation);
            previousLeaveAnimation = null;
          }

          if (currentScope) {
            currentScope.$destroy();
            currentScope = null;
          }
          if (currentElement) {
            previousLeaveAnimation = $animate.leave(currentElement);
            previousLeaveAnimation.then(function() {
              previousLeaveAnimation = null;
            });
            currentElement = null;
          }
        }

        function update() {
          var locals = $route.current && $route.current.locals,
              template = locals && locals.$template;

          if (angular.isDefined(template)) {
            var newScope = scope.$new();
            var current = $route.current;

            // Note: This will also link all children of ng-view that were contained in the original
            // html. If that content contains controllers, ... they could pollute/change the scope.
            // However, using ng-view on an element with additional content does not make sense...
            // Note: We can't remove them in the cloneAttchFn of $transclude as that
            // function is called before linking the content, which would apply child
            // directives to non existing elements.
            var clone = $transclude(newScope, function(clone) {
              $animate.enter(clone, null, currentElement || $element).then(function onNgViewEnter() {
                if (angular.isDefined(autoScrollExp)
                  && (!autoScrollExp || scope.$eval(autoScrollExp))) {
                  $anchorScroll();
                }
              });
              cleanupLastView();
            });

            currentElement = clone;
            currentScope = current.scope = newScope;
            currentScope.$emit('$viewContentLoaded');
            currentScope.$eval(onloadExp);
          } else {
            cleanupLastView();
          }
        }
    }
  };
}

// This directive is called during the $transclude call of the first `ngView` directive.
// It will replace and compile the content of the element with the loaded template.
// We need this directive so that the element content is already filled when
// the link function of another directive on the same element as ngView
// is called.
ngViewFillContentFactory.$inject = ['$compile', '$controller', '$route'];
function ngViewFillContentFactory($compile, $controller, $route) {
  return {
    restrict: 'ECA',
    priority: -400,
    link: function(scope, $element) {
      var current = $route.current,
          locals = current.locals;

      $element.html(locals.$template);

      var link = $compile($element.contents());

      if (current.controller) {
        locals.$scope = scope;
        var controller = $controller(current.controller, locals);
        if (current.controllerAs) {
          scope[current.controllerAs] = controller;
        }
        $element.data('$ngControllerController', controller);
        $element.children().data('$ngControllerController', controller);
      }
      scope[current.resolveAs || '$resolve'] = locals;

      link(scope);
    }
  };
}


})(window, window.angular);
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJhbmd1bGFyLXJvdXRlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBAbGljZW5zZSBBbmd1bGFySlMgdjEuNS44XHJcbiAqIChjKSAyMDEwLTIwMTYgR29vZ2xlLCBJbmMuIGh0dHA6Ly9hbmd1bGFyanMub3JnXHJcbiAqIExpY2Vuc2U6IE1JVFxyXG4gKi9cclxuKGZ1bmN0aW9uKHdpbmRvdywgYW5ndWxhcikgeyd1c2Ugc3RyaWN0JztcclxuXHJcbi8qIGdsb2JhbCBzaGFsbG93Q29weTogdHJ1ZSAqL1xyXG5cclxuLyoqXHJcbiAqIENyZWF0ZXMgYSBzaGFsbG93IGNvcHkgb2YgYW4gb2JqZWN0LCBhbiBhcnJheSBvciBhIHByaW1pdGl2ZS5cclxuICpcclxuICogQXNzdW1lcyB0aGF0IHRoZXJlIGFyZSBubyBwcm90byBwcm9wZXJ0aWVzIGZvciBvYmplY3RzLlxyXG4gKi9cclxuZnVuY3Rpb24gc2hhbGxvd0NvcHkoc3JjLCBkc3QpIHtcclxuICBpZiAoaXNBcnJheShzcmMpKSB7XHJcbiAgICBkc3QgPSBkc3QgfHwgW107XHJcblxyXG4gICAgZm9yICh2YXIgaSA9IDAsIGlpID0gc3JjLmxlbmd0aDsgaSA8IGlpOyBpKyspIHtcclxuICAgICAgZHN0W2ldID0gc3JjW2ldO1xyXG4gICAgfVxyXG4gIH0gZWxzZSBpZiAoaXNPYmplY3Qoc3JjKSkge1xyXG4gICAgZHN0ID0gZHN0IHx8IHt9O1xyXG5cclxuICAgIGZvciAodmFyIGtleSBpbiBzcmMpIHtcclxuICAgICAgaWYgKCEoa2V5LmNoYXJBdCgwKSA9PT0gJyQnICYmIGtleS5jaGFyQXQoMSkgPT09ICckJykpIHtcclxuICAgICAgICBkc3Rba2V5XSA9IHNyY1trZXldO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICByZXR1cm4gZHN0IHx8IHNyYztcclxufVxyXG5cclxuLyogZ2xvYmFsIHNoYWxsb3dDb3B5OiBmYWxzZSAqL1xyXG5cclxuLy8gVGhlcmUgYXJlIG5lY2Vzc2FyeSBmb3IgYHNoYWxsb3dDb3B5KClgIChpbmNsdWRlZCB2aWEgYHNyYy9zaGFsbG93Q29weS5qc2ApLlxyXG4vLyBUaGV5IGFyZSBpbml0aWFsaXplZCBpbnNpZGUgdGhlIGAkUm91dGVQcm92aWRlcmAsIHRvIGVuc3VyZSBgd2luZG93LmFuZ3VsYXJgIGlzIGF2YWlsYWJsZS5cclxudmFyIGlzQXJyYXk7XHJcbnZhciBpc09iamVjdDtcclxuXHJcbi8qKlxyXG4gKiBAbmdkb2MgbW9kdWxlXHJcbiAqIEBuYW1lIG5nUm91dGVcclxuICogQGRlc2NyaXB0aW9uXHJcbiAqXHJcbiAqICMgbmdSb3V0ZVxyXG4gKlxyXG4gKiBUaGUgYG5nUm91dGVgIG1vZHVsZSBwcm92aWRlcyByb3V0aW5nIGFuZCBkZWVwbGlua2luZyBzZXJ2aWNlcyBhbmQgZGlyZWN0aXZlcyBmb3IgYW5ndWxhciBhcHBzLlxyXG4gKlxyXG4gKiAjIyBFeGFtcGxlXHJcbiAqIFNlZSB7QGxpbmsgbmdSb3V0ZS4kcm91dGUjZXhhbXBsZSAkcm91dGV9IGZvciBhbiBleGFtcGxlIG9mIGNvbmZpZ3VyaW5nIGFuZCB1c2luZyBgbmdSb3V0ZWAuXHJcbiAqXHJcbiAqXHJcbiAqIDxkaXYgZG9jLW1vZHVsZS1jb21wb25lbnRzPVwibmdSb3V0ZVwiPjwvZGl2PlxyXG4gKi9cclxuIC8qIGdsb2JhbCAtbmdSb3V0ZU1vZHVsZSAqL1xyXG52YXIgbmdSb3V0ZU1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCduZ1JvdXRlJywgWyduZyddKS5cclxuICAgICAgICAgICAgICAgICAgICAgICAgcHJvdmlkZXIoJyRyb3V0ZScsICRSb3V0ZVByb3ZpZGVyKSxcclxuICAgICRyb3V0ZU1pbkVyciA9IGFuZ3VsYXIuJCRtaW5FcnIoJ25nUm91dGUnKTtcclxuXHJcbi8qKlxyXG4gKiBAbmdkb2MgcHJvdmlkZXJcclxuICogQG5hbWUgJHJvdXRlUHJvdmlkZXJcclxuICpcclxuICogQGRlc2NyaXB0aW9uXHJcbiAqXHJcbiAqIFVzZWQgZm9yIGNvbmZpZ3VyaW5nIHJvdXRlcy5cclxuICpcclxuICogIyMgRXhhbXBsZVxyXG4gKiBTZWUge0BsaW5rIG5nUm91dGUuJHJvdXRlI2V4YW1wbGUgJHJvdXRlfSBmb3IgYW4gZXhhbXBsZSBvZiBjb25maWd1cmluZyBhbmQgdXNpbmcgYG5nUm91dGVgLlxyXG4gKlxyXG4gKiAjIyBEZXBlbmRlbmNpZXNcclxuICogUmVxdWlyZXMgdGhlIHtAbGluayBuZ1JvdXRlIGBuZ1JvdXRlYH0gbW9kdWxlIHRvIGJlIGluc3RhbGxlZC5cclxuICovXHJcbmZ1bmN0aW9uICRSb3V0ZVByb3ZpZGVyKCkge1xyXG4gIGlzQXJyYXkgPSBhbmd1bGFyLmlzQXJyYXk7XHJcbiAgaXNPYmplY3QgPSBhbmd1bGFyLmlzT2JqZWN0O1xyXG5cclxuICBmdW5jdGlvbiBpbmhlcml0KHBhcmVudCwgZXh0cmEpIHtcclxuICAgIHJldHVybiBhbmd1bGFyLmV4dGVuZChPYmplY3QuY3JlYXRlKHBhcmVudCksIGV4dHJhKTtcclxuICB9XHJcblxyXG4gIHZhciByb3V0ZXMgPSB7fTtcclxuXHJcbiAgLyoqXHJcbiAgICogQG5nZG9jIG1ldGhvZFxyXG4gICAqIEBuYW1lICRyb3V0ZVByb3ZpZGVyI3doZW5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBwYXRoIFJvdXRlIHBhdGggKG1hdGNoZWQgYWdhaW5zdCBgJGxvY2F0aW9uLnBhdGhgKS4gSWYgYCRsb2NhdGlvbi5wYXRoYFxyXG4gICAqICAgIGNvbnRhaW5zIHJlZHVuZGFudCB0cmFpbGluZyBzbGFzaCBvciBpcyBtaXNzaW5nIG9uZSwgdGhlIHJvdXRlIHdpbGwgc3RpbGwgbWF0Y2ggYW5kIHRoZVxyXG4gICAqICAgIGAkbG9jYXRpb24ucGF0aGAgd2lsbCBiZSB1cGRhdGVkIHRvIGFkZCBvciBkcm9wIHRoZSB0cmFpbGluZyBzbGFzaCB0byBleGFjdGx5IG1hdGNoIHRoZVxyXG4gICAqICAgIHJvdXRlIGRlZmluaXRpb24uXHJcbiAgICpcclxuICAgKiAgICAqIGBwYXRoYCBjYW4gY29udGFpbiBuYW1lZCBncm91cHMgc3RhcnRpbmcgd2l0aCBhIGNvbG9uOiBlLmcuIGA6bmFtZWAuIEFsbCBjaGFyYWN0ZXJzIHVwXHJcbiAgICogICAgICAgIHRvIHRoZSBuZXh0IHNsYXNoIGFyZSBtYXRjaGVkIGFuZCBzdG9yZWQgaW4gYCRyb3V0ZVBhcmFtc2AgdW5kZXIgdGhlIGdpdmVuIGBuYW1lYFxyXG4gICAqICAgICAgICB3aGVuIHRoZSByb3V0ZSBtYXRjaGVzLlxyXG4gICAqICAgICogYHBhdGhgIGNhbiBjb250YWluIG5hbWVkIGdyb3VwcyBzdGFydGluZyB3aXRoIGEgY29sb24gYW5kIGVuZGluZyB3aXRoIGEgc3RhcjpcclxuICAgKiAgICAgICAgZS5nLmA6bmFtZSpgLiBBbGwgY2hhcmFjdGVycyBhcmUgZWFnZXJseSBzdG9yZWQgaW4gYCRyb3V0ZVBhcmFtc2AgdW5kZXIgdGhlIGdpdmVuIGBuYW1lYFxyXG4gICAqICAgICAgICB3aGVuIHRoZSByb3V0ZSBtYXRjaGVzLlxyXG4gICAqICAgICogYHBhdGhgIGNhbiBjb250YWluIG9wdGlvbmFsIG5hbWVkIGdyb3VwcyB3aXRoIGEgcXVlc3Rpb24gbWFyazogZS5nLmA6bmFtZT9gLlxyXG4gICAqXHJcbiAgICogICAgRm9yIGV4YW1wbGUsIHJvdXRlcyBsaWtlIGAvY29sb3IvOmNvbG9yL2xhcmdlY29kZS86bGFyZ2Vjb2RlKlxcL2VkaXRgIHdpbGwgbWF0Y2hcclxuICAgKiAgICBgL2NvbG9yL2Jyb3duL2xhcmdlY29kZS9jb2RlL3dpdGgvc2xhc2hlcy9lZGl0YCBhbmQgZXh0cmFjdDpcclxuICAgKlxyXG4gICAqICAgICogYGNvbG9yOiBicm93bmBcclxuICAgKiAgICAqIGBsYXJnZWNvZGU6IGNvZGUvd2l0aC9zbGFzaGVzYC5cclxuICAgKlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IHJvdXRlIE1hcHBpbmcgaW5mb3JtYXRpb24gdG8gYmUgYXNzaWduZWQgdG8gYCRyb3V0ZS5jdXJyZW50YCBvbiByb3V0ZVxyXG4gICAqICAgIG1hdGNoLlxyXG4gICAqXHJcbiAgICogICAgT2JqZWN0IHByb3BlcnRpZXM6XHJcbiAgICpcclxuICAgKiAgICAtIGBjb250cm9sbGVyYCDigJMgYHsoc3RyaW5nfGZ1bmN0aW9uKCk9fWAg4oCTIENvbnRyb2xsZXIgZm4gdGhhdCBzaG91bGQgYmUgYXNzb2NpYXRlZCB3aXRoXHJcbiAgICogICAgICBuZXdseSBjcmVhdGVkIHNjb3BlIG9yIHRoZSBuYW1lIG9mIGEge0BsaW5rIGFuZ3VsYXIuTW9kdWxlI2NvbnRyb2xsZXIgcmVnaXN0ZXJlZFxyXG4gICAqICAgICAgY29udHJvbGxlcn0gaWYgcGFzc2VkIGFzIGEgc3RyaW5nLlxyXG4gICAqICAgIC0gYGNvbnRyb2xsZXJBc2Ag4oCTIGB7c3RyaW5nPX1gIOKAkyBBbiBpZGVudGlmaWVyIG5hbWUgZm9yIGEgcmVmZXJlbmNlIHRvIHRoZSBjb250cm9sbGVyLlxyXG4gICAqICAgICAgSWYgcHJlc2VudCwgdGhlIGNvbnRyb2xsZXIgd2lsbCBiZSBwdWJsaXNoZWQgdG8gc2NvcGUgdW5kZXIgdGhlIGBjb250cm9sbGVyQXNgIG5hbWUuXHJcbiAgICogICAgLSBgdGVtcGxhdGVgIOKAkyBge3N0cmluZz18ZnVuY3Rpb24oKT19YCDigJMgaHRtbCB0ZW1wbGF0ZSBhcyBhIHN0cmluZyBvciBhIGZ1bmN0aW9uIHRoYXRcclxuICAgKiAgICAgIHJldHVybnMgYW4gaHRtbCB0ZW1wbGF0ZSBhcyBhIHN0cmluZyB3aGljaCBzaG91bGQgYmUgdXNlZCBieSB7QGxpbmtcclxuICAgKiAgICAgIG5nUm91dGUuZGlyZWN0aXZlOm5nVmlldyBuZ1ZpZXd9IG9yIHtAbGluayBuZy5kaXJlY3RpdmU6bmdJbmNsdWRlIG5nSW5jbHVkZX0gZGlyZWN0aXZlcy5cclxuICAgKiAgICAgIFRoaXMgcHJvcGVydHkgdGFrZXMgcHJlY2VkZW5jZSBvdmVyIGB0ZW1wbGF0ZVVybGAuXHJcbiAgICpcclxuICAgKiAgICAgIElmIGB0ZW1wbGF0ZWAgaXMgYSBmdW5jdGlvbiwgaXQgd2lsbCBiZSBjYWxsZWQgd2l0aCB0aGUgZm9sbG93aW5nIHBhcmFtZXRlcnM6XHJcbiAgICpcclxuICAgKiAgICAgIC0gYHtBcnJheS48T2JqZWN0Pn1gIC0gcm91dGUgcGFyYW1ldGVycyBleHRyYWN0ZWQgZnJvbSB0aGUgY3VycmVudFxyXG4gICAqICAgICAgICBgJGxvY2F0aW9uLnBhdGgoKWAgYnkgYXBwbHlpbmcgdGhlIGN1cnJlbnQgcm91dGVcclxuICAgKlxyXG4gICAqICAgIC0gYHRlbXBsYXRlVXJsYCDigJMgYHtzdHJpbmc9fGZ1bmN0aW9uKCk9fWAg4oCTIHBhdGggb3IgZnVuY3Rpb24gdGhhdCByZXR1cm5zIGEgcGF0aCB0byBhbiBodG1sXHJcbiAgICogICAgICB0ZW1wbGF0ZSB0aGF0IHNob3VsZCBiZSB1c2VkIGJ5IHtAbGluayBuZ1JvdXRlLmRpcmVjdGl2ZTpuZ1ZpZXcgbmdWaWV3fS5cclxuICAgKlxyXG4gICAqICAgICAgSWYgYHRlbXBsYXRlVXJsYCBpcyBhIGZ1bmN0aW9uLCBpdCB3aWxsIGJlIGNhbGxlZCB3aXRoIHRoZSBmb2xsb3dpbmcgcGFyYW1ldGVyczpcclxuICAgKlxyXG4gICAqICAgICAgLSBge0FycmF5LjxPYmplY3Q+fWAgLSByb3V0ZSBwYXJhbWV0ZXJzIGV4dHJhY3RlZCBmcm9tIHRoZSBjdXJyZW50XHJcbiAgICogICAgICAgIGAkbG9jYXRpb24ucGF0aCgpYCBieSBhcHBseWluZyB0aGUgY3VycmVudCByb3V0ZVxyXG4gICAqXHJcbiAgICogICAgLSBgcmVzb2x2ZWAgLSBge09iamVjdC48c3RyaW5nLCBmdW5jdGlvbj49fWAgLSBBbiBvcHRpb25hbCBtYXAgb2YgZGVwZW5kZW5jaWVzIHdoaWNoIHNob3VsZFxyXG4gICAqICAgICAgYmUgaW5qZWN0ZWQgaW50byB0aGUgY29udHJvbGxlci4gSWYgYW55IG9mIHRoZXNlIGRlcGVuZGVuY2llcyBhcmUgcHJvbWlzZXMsIHRoZSByb3V0ZXJcclxuICAgKiAgICAgIHdpbGwgd2FpdCBmb3IgdGhlbSBhbGwgdG8gYmUgcmVzb2x2ZWQgb3Igb25lIHRvIGJlIHJlamVjdGVkIGJlZm9yZSB0aGUgY29udHJvbGxlciBpc1xyXG4gICAqICAgICAgaW5zdGFudGlhdGVkLlxyXG4gICAqICAgICAgSWYgYWxsIHRoZSBwcm9taXNlcyBhcmUgcmVzb2x2ZWQgc3VjY2Vzc2Z1bGx5LCB0aGUgdmFsdWVzIG9mIHRoZSByZXNvbHZlZCBwcm9taXNlcyBhcmVcclxuICAgKiAgICAgIGluamVjdGVkIGFuZCB7QGxpbmsgbmdSb3V0ZS4kcm91dGUjJHJvdXRlQ2hhbmdlU3VjY2VzcyAkcm91dGVDaGFuZ2VTdWNjZXNzfSBldmVudCBpc1xyXG4gICAqICAgICAgZmlyZWQuIElmIGFueSBvZiB0aGUgcHJvbWlzZXMgYXJlIHJlamVjdGVkIHRoZVxyXG4gICAqICAgICAge0BsaW5rIG5nUm91dGUuJHJvdXRlIyRyb3V0ZUNoYW5nZUVycm9yICRyb3V0ZUNoYW5nZUVycm9yfSBldmVudCBpcyBmaXJlZC5cclxuICAgKiAgICAgIEZvciBlYXNpZXIgYWNjZXNzIHRvIHRoZSByZXNvbHZlZCBkZXBlbmRlbmNpZXMgZnJvbSB0aGUgdGVtcGxhdGUsIHRoZSBgcmVzb2x2ZWAgbWFwIHdpbGxcclxuICAgKiAgICAgIGJlIGF2YWlsYWJsZSBvbiB0aGUgc2NvcGUgb2YgdGhlIHJvdXRlLCB1bmRlciBgJHJlc29sdmVgIChieSBkZWZhdWx0KSBvciBhIGN1c3RvbSBuYW1lXHJcbiAgICogICAgICBzcGVjaWZpZWQgYnkgdGhlIGByZXNvbHZlQXNgIHByb3BlcnR5IChzZWUgYmVsb3cpLiBUaGlzIGNhbiBiZSBwYXJ0aWN1bGFybHkgdXNlZnVsLCB3aGVuXHJcbiAgICogICAgICB3b3JraW5nIHdpdGgge0BsaW5rIGFuZ3VsYXIuTW9kdWxlI2NvbXBvbmVudCBjb21wb25lbnRzfSBhcyByb3V0ZSB0ZW1wbGF0ZXMuPGJyIC8+XHJcbiAgICogICAgICA8ZGl2IGNsYXNzPVwiYWxlcnQgYWxlcnQtd2FybmluZ1wiPlxyXG4gICAqICAgICAgICAqKk5vdGU6KiogSWYgeW91ciBzY29wZSBhbHJlYWR5IGNvbnRhaW5zIGEgcHJvcGVydHkgd2l0aCB0aGlzIG5hbWUsIGl0IHdpbGwgYmUgaGlkZGVuXHJcbiAgICogICAgICAgIG9yIG92ZXJ3cml0dGVuLiBNYWtlIHN1cmUsIHlvdSBzcGVjaWZ5IGFuIGFwcHJvcHJpYXRlIG5hbWUgZm9yIHRoaXMgcHJvcGVydHksIHRoYXRcclxuICAgKiAgICAgICAgZG9lcyBub3QgY29sbGlkZSB3aXRoIG90aGVyIHByb3BlcnRpZXMgb24gdGhlIHNjb3BlLlxyXG4gICAqICAgICAgPC9kaXY+XHJcbiAgICogICAgICBUaGUgbWFwIG9iamVjdCBpczpcclxuICAgKlxyXG4gICAqICAgICAgLSBga2V5YCDigJMgYHtzdHJpbmd9YDogYSBuYW1lIG9mIGEgZGVwZW5kZW5jeSB0byBiZSBpbmplY3RlZCBpbnRvIHRoZSBjb250cm9sbGVyLlxyXG4gICAqICAgICAgLSBgZmFjdG9yeWAgLSBge3N0cmluZ3xmdW5jdGlvbn1gOiBJZiBgc3RyaW5nYCB0aGVuIGl0IGlzIGFuIGFsaWFzIGZvciBhIHNlcnZpY2UuXHJcbiAgICogICAgICAgIE90aGVyd2lzZSBpZiBmdW5jdGlvbiwgdGhlbiBpdCBpcyB7QGxpbmsgYXV0by4kaW5qZWN0b3IjaW52b2tlIGluamVjdGVkfVxyXG4gICAqICAgICAgICBhbmQgdGhlIHJldHVybiB2YWx1ZSBpcyB0cmVhdGVkIGFzIHRoZSBkZXBlbmRlbmN5LiBJZiB0aGUgcmVzdWx0IGlzIGEgcHJvbWlzZSwgaXQgaXNcclxuICAgKiAgICAgICAgcmVzb2x2ZWQgYmVmb3JlIGl0cyB2YWx1ZSBpcyBpbmplY3RlZCBpbnRvIHRoZSBjb250cm9sbGVyLiBCZSBhd2FyZSB0aGF0XHJcbiAgICogICAgICAgIGBuZ1JvdXRlLiRyb3V0ZVBhcmFtc2Agd2lsbCBzdGlsbCByZWZlciB0byB0aGUgcHJldmlvdXMgcm91dGUgd2l0aGluIHRoZXNlIHJlc29sdmVcclxuICAgKiAgICAgICAgZnVuY3Rpb25zLiAgVXNlIGAkcm91dGUuY3VycmVudC5wYXJhbXNgIHRvIGFjY2VzcyB0aGUgbmV3IHJvdXRlIHBhcmFtZXRlcnMsIGluc3RlYWQuXHJcbiAgICpcclxuICAgKiAgICAtIGByZXNvbHZlQXNgIC0gYHtzdHJpbmc9fWAgLSBUaGUgbmFtZSB1bmRlciB3aGljaCB0aGUgYHJlc29sdmVgIG1hcCB3aWxsIGJlIGF2YWlsYWJsZSBvblxyXG4gICAqICAgICAgdGhlIHNjb3BlIG9mIHRoZSByb3V0ZS4gSWYgb21pdHRlZCwgZGVmYXVsdHMgdG8gYCRyZXNvbHZlYC5cclxuICAgKlxyXG4gICAqICAgIC0gYHJlZGlyZWN0VG9gIOKAkyBgeyhzdHJpbmd8ZnVuY3Rpb24oKSk9fWAg4oCTIHZhbHVlIHRvIHVwZGF0ZVxyXG4gICAqICAgICAge0BsaW5rIG5nLiRsb2NhdGlvbiAkbG9jYXRpb259IHBhdGggd2l0aCBhbmQgdHJpZ2dlciByb3V0ZSByZWRpcmVjdGlvbi5cclxuICAgKlxyXG4gICAqICAgICAgSWYgYHJlZGlyZWN0VG9gIGlzIGEgZnVuY3Rpb24sIGl0IHdpbGwgYmUgY2FsbGVkIHdpdGggdGhlIGZvbGxvd2luZyBwYXJhbWV0ZXJzOlxyXG4gICAqXHJcbiAgICogICAgICAtIGB7T2JqZWN0LjxzdHJpbmc+fWAgLSByb3V0ZSBwYXJhbWV0ZXJzIGV4dHJhY3RlZCBmcm9tIHRoZSBjdXJyZW50XHJcbiAgICogICAgICAgIGAkbG9jYXRpb24ucGF0aCgpYCBieSBhcHBseWluZyB0aGUgY3VycmVudCByb3V0ZSB0ZW1wbGF0ZVVybC5cclxuICAgKiAgICAgIC0gYHtzdHJpbmd9YCAtIGN1cnJlbnQgYCRsb2NhdGlvbi5wYXRoKClgXHJcbiAgICogICAgICAtIGB7T2JqZWN0fWAgLSBjdXJyZW50IGAkbG9jYXRpb24uc2VhcmNoKClgXHJcbiAgICpcclxuICAgKiAgICAgIFRoZSBjdXN0b20gYHJlZGlyZWN0VG9gIGZ1bmN0aW9uIGlzIGV4cGVjdGVkIHRvIHJldHVybiBhIHN0cmluZyB3aGljaCB3aWxsIGJlIHVzZWRcclxuICAgKiAgICAgIHRvIHVwZGF0ZSBgJGxvY2F0aW9uLnBhdGgoKWAgYW5kIGAkbG9jYXRpb24uc2VhcmNoKClgLlxyXG4gICAqXHJcbiAgICogICAgLSBgW3JlbG9hZE9uU2VhcmNoPXRydWVdYCAtIGB7Ym9vbGVhbj19YCAtIHJlbG9hZCByb3V0ZSB3aGVuIG9ubHkgYCRsb2NhdGlvbi5zZWFyY2goKWBcclxuICAgKiAgICAgIG9yIGAkbG9jYXRpb24uaGFzaCgpYCBjaGFuZ2VzLlxyXG4gICAqXHJcbiAgICogICAgICBJZiB0aGUgb3B0aW9uIGlzIHNldCB0byBgZmFsc2VgIGFuZCB1cmwgaW4gdGhlIGJyb3dzZXIgY2hhbmdlcywgdGhlblxyXG4gICAqICAgICAgYCRyb3V0ZVVwZGF0ZWAgZXZlbnQgaXMgYnJvYWRjYXN0ZWQgb24gdGhlIHJvb3Qgc2NvcGUuXHJcbiAgICpcclxuICAgKiAgICAtIGBbY2FzZUluc2Vuc2l0aXZlTWF0Y2g9ZmFsc2VdYCAtIGB7Ym9vbGVhbj19YCAtIG1hdGNoIHJvdXRlcyB3aXRob3V0IGJlaW5nIGNhc2Ugc2Vuc2l0aXZlXHJcbiAgICpcclxuICAgKiAgICAgIElmIHRoZSBvcHRpb24gaXMgc2V0IHRvIGB0cnVlYCwgdGhlbiB0aGUgcGFydGljdWxhciByb3V0ZSBjYW4gYmUgbWF0Y2hlZCB3aXRob3V0IGJlaW5nXHJcbiAgICogICAgICBjYXNlIHNlbnNpdGl2ZVxyXG4gICAqXHJcbiAgICogQHJldHVybnMge09iamVjdH0gc2VsZlxyXG4gICAqXHJcbiAgICogQGRlc2NyaXB0aW9uXHJcbiAgICogQWRkcyBhIG5ldyByb3V0ZSBkZWZpbml0aW9uIHRvIHRoZSBgJHJvdXRlYCBzZXJ2aWNlLlxyXG4gICAqL1xyXG4gIHRoaXMud2hlbiA9IGZ1bmN0aW9uKHBhdGgsIHJvdXRlKSB7XHJcbiAgICAvL2NvcHkgb3JpZ2luYWwgcm91dGUgb2JqZWN0IHRvIHByZXNlcnZlIHBhcmFtcyBpbmhlcml0ZWQgZnJvbSBwcm90byBjaGFpblxyXG4gICAgdmFyIHJvdXRlQ29weSA9IHNoYWxsb3dDb3B5KHJvdXRlKTtcclxuICAgIGlmIChhbmd1bGFyLmlzVW5kZWZpbmVkKHJvdXRlQ29weS5yZWxvYWRPblNlYXJjaCkpIHtcclxuICAgICAgcm91dGVDb3B5LnJlbG9hZE9uU2VhcmNoID0gdHJ1ZTtcclxuICAgIH1cclxuICAgIGlmIChhbmd1bGFyLmlzVW5kZWZpbmVkKHJvdXRlQ29weS5jYXNlSW5zZW5zaXRpdmVNYXRjaCkpIHtcclxuICAgICAgcm91dGVDb3B5LmNhc2VJbnNlbnNpdGl2ZU1hdGNoID0gdGhpcy5jYXNlSW5zZW5zaXRpdmVNYXRjaDtcclxuICAgIH1cclxuICAgIHJvdXRlc1twYXRoXSA9IGFuZ3VsYXIuZXh0ZW5kKFxyXG4gICAgICByb3V0ZUNvcHksXHJcbiAgICAgIHBhdGggJiYgcGF0aFJlZ0V4cChwYXRoLCByb3V0ZUNvcHkpXHJcbiAgICApO1xyXG5cclxuICAgIC8vIGNyZWF0ZSByZWRpcmVjdGlvbiBmb3IgdHJhaWxpbmcgc2xhc2hlc1xyXG4gICAgaWYgKHBhdGgpIHtcclxuICAgICAgdmFyIHJlZGlyZWN0UGF0aCA9IChwYXRoW3BhdGgubGVuZ3RoIC0gMV0gPT0gJy8nKVxyXG4gICAgICAgICAgICA/IHBhdGguc3Vic3RyKDAsIHBhdGgubGVuZ3RoIC0gMSlcclxuICAgICAgICAgICAgOiBwYXRoICsgJy8nO1xyXG5cclxuICAgICAgcm91dGVzW3JlZGlyZWN0UGF0aF0gPSBhbmd1bGFyLmV4dGVuZChcclxuICAgICAgICB7cmVkaXJlY3RUbzogcGF0aH0sXHJcbiAgICAgICAgcGF0aFJlZ0V4cChyZWRpcmVjdFBhdGgsIHJvdXRlQ29weSlcclxuICAgICAgKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiBAbmdkb2MgcHJvcGVydHlcclxuICAgKiBAbmFtZSAkcm91dGVQcm92aWRlciNjYXNlSW5zZW5zaXRpdmVNYXRjaFxyXG4gICAqIEBkZXNjcmlwdGlvblxyXG4gICAqXHJcbiAgICogQSBib29sZWFuIHByb3BlcnR5IGluZGljYXRpbmcgaWYgcm91dGVzIGRlZmluZWRcclxuICAgKiB1c2luZyB0aGlzIHByb3ZpZGVyIHNob3VsZCBiZSBtYXRjaGVkIHVzaW5nIGEgY2FzZSBpbnNlbnNpdGl2ZVxyXG4gICAqIGFsZ29yaXRobS4gRGVmYXVsdHMgdG8gYGZhbHNlYC5cclxuICAgKi9cclxuICB0aGlzLmNhc2VJbnNlbnNpdGl2ZU1hdGNoID0gZmFsc2U7XHJcblxyXG4gICAvKipcclxuICAgICogQHBhcmFtIHBhdGgge3N0cmluZ30gcGF0aFxyXG4gICAgKiBAcGFyYW0gb3B0cyB7T2JqZWN0fSBvcHRpb25zXHJcbiAgICAqIEByZXR1cm4gez9PYmplY3R9XHJcbiAgICAqXHJcbiAgICAqIEBkZXNjcmlwdGlvblxyXG4gICAgKiBOb3JtYWxpemVzIHRoZSBnaXZlbiBwYXRoLCByZXR1cm5pbmcgYSByZWd1bGFyIGV4cHJlc3Npb25cclxuICAgICogYW5kIHRoZSBvcmlnaW5hbCBwYXRoLlxyXG4gICAgKlxyXG4gICAgKiBJbnNwaXJlZCBieSBwYXRoUmV4cCBpbiB2aXNpb25tZWRpYS9leHByZXNzL2xpYi91dGlscy5qcy5cclxuICAgICovXHJcbiAgZnVuY3Rpb24gcGF0aFJlZ0V4cChwYXRoLCBvcHRzKSB7XHJcbiAgICB2YXIgaW5zZW5zaXRpdmUgPSBvcHRzLmNhc2VJbnNlbnNpdGl2ZU1hdGNoLFxyXG4gICAgICAgIHJldCA9IHtcclxuICAgICAgICAgIG9yaWdpbmFsUGF0aDogcGF0aCxcclxuICAgICAgICAgIHJlZ2V4cDogcGF0aFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAga2V5cyA9IHJldC5rZXlzID0gW107XHJcblxyXG4gICAgcGF0aCA9IHBhdGhcclxuICAgICAgLnJlcGxhY2UoLyhbKCkuXSkvZywgJ1xcXFwkMScpXHJcbiAgICAgIC5yZXBsYWNlKC8oXFwvKT86KFxcdyspKFxcKlxcP3xbXFw/XFwqXSk/L2csIGZ1bmN0aW9uKF8sIHNsYXNoLCBrZXksIG9wdGlvbikge1xyXG4gICAgICAgIHZhciBvcHRpb25hbCA9IChvcHRpb24gPT09ICc/JyB8fCBvcHRpb24gPT09ICcqPycpID8gJz8nIDogbnVsbDtcclxuICAgICAgICB2YXIgc3RhciA9IChvcHRpb24gPT09ICcqJyB8fCBvcHRpb24gPT09ICcqPycpID8gJyonIDogbnVsbDtcclxuICAgICAgICBrZXlzLnB1c2goeyBuYW1lOiBrZXksIG9wdGlvbmFsOiAhIW9wdGlvbmFsIH0pO1xyXG4gICAgICAgIHNsYXNoID0gc2xhc2ggfHwgJyc7XHJcbiAgICAgICAgcmV0dXJuICcnXHJcbiAgICAgICAgICArIChvcHRpb25hbCA/ICcnIDogc2xhc2gpXHJcbiAgICAgICAgICArICcoPzonXHJcbiAgICAgICAgICArIChvcHRpb25hbCA/IHNsYXNoIDogJycpXHJcbiAgICAgICAgICArIChzdGFyICYmICcoLis/KScgfHwgJyhbXi9dKyknKVxyXG4gICAgICAgICAgKyAob3B0aW9uYWwgfHwgJycpXHJcbiAgICAgICAgICArICcpJ1xyXG4gICAgICAgICAgKyAob3B0aW9uYWwgfHwgJycpO1xyXG4gICAgICB9KVxyXG4gICAgICAucmVwbGFjZSgvKFtcXC8kXFwqXSkvZywgJ1xcXFwkMScpO1xyXG5cclxuICAgIHJldC5yZWdleHAgPSBuZXcgUmVnRXhwKCdeJyArIHBhdGggKyAnJCcsIGluc2Vuc2l0aXZlID8gJ2knIDogJycpO1xyXG4gICAgcmV0dXJuIHJldDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBuZ2RvYyBtZXRob2RcclxuICAgKiBAbmFtZSAkcm91dGVQcm92aWRlciNvdGhlcndpc2VcclxuICAgKlxyXG4gICAqIEBkZXNjcmlwdGlvblxyXG4gICAqIFNldHMgcm91dGUgZGVmaW5pdGlvbiB0aGF0IHdpbGwgYmUgdXNlZCBvbiByb3V0ZSBjaGFuZ2Ugd2hlbiBubyBvdGhlciByb3V0ZSBkZWZpbml0aW9uXHJcbiAgICogaXMgbWF0Y2hlZC5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fHN0cmluZ30gcGFyYW1zIE1hcHBpbmcgaW5mb3JtYXRpb24gdG8gYmUgYXNzaWduZWQgdG8gYCRyb3V0ZS5jdXJyZW50YC5cclxuICAgKiBJZiBjYWxsZWQgd2l0aCBhIHN0cmluZywgdGhlIHZhbHVlIG1hcHMgdG8gYHJlZGlyZWN0VG9gLlxyXG4gICAqIEByZXR1cm5zIHtPYmplY3R9IHNlbGZcclxuICAgKi9cclxuICB0aGlzLm90aGVyd2lzZSA9IGZ1bmN0aW9uKHBhcmFtcykge1xyXG4gICAgaWYgKHR5cGVvZiBwYXJhbXMgPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgIHBhcmFtcyA9IHtyZWRpcmVjdFRvOiBwYXJhbXN9O1xyXG4gICAgfVxyXG4gICAgdGhpcy53aGVuKG51bGwsIHBhcmFtcyk7XHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9O1xyXG5cclxuXHJcbiAgdGhpcy4kZ2V0ID0gWyckcm9vdFNjb3BlJyxcclxuICAgICAgICAgICAgICAgJyRsb2NhdGlvbicsXHJcbiAgICAgICAgICAgICAgICckcm91dGVQYXJhbXMnLFxyXG4gICAgICAgICAgICAgICAnJHEnLFxyXG4gICAgICAgICAgICAgICAnJGluamVjdG9yJyxcclxuICAgICAgICAgICAgICAgJyR0ZW1wbGF0ZVJlcXVlc3QnLFxyXG4gICAgICAgICAgICAgICAnJHNjZScsXHJcbiAgICAgIGZ1bmN0aW9uKCRyb290U2NvcGUsICRsb2NhdGlvbiwgJHJvdXRlUGFyYW1zLCAkcSwgJGluamVjdG9yLCAkdGVtcGxhdGVSZXF1ZXN0LCAkc2NlKSB7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAbmdkb2Mgc2VydmljZVxyXG4gICAgICogQG5hbWUgJHJvdXRlXHJcbiAgICAgKiBAcmVxdWlyZXMgJGxvY2F0aW9uXHJcbiAgICAgKiBAcmVxdWlyZXMgJHJvdXRlUGFyYW1zXHJcbiAgICAgKlxyXG4gICAgICogQHByb3BlcnR5IHtPYmplY3R9IGN1cnJlbnQgUmVmZXJlbmNlIHRvIHRoZSBjdXJyZW50IHJvdXRlIGRlZmluaXRpb24uXHJcbiAgICAgKiBUaGUgcm91dGUgZGVmaW5pdGlvbiBjb250YWluczpcclxuICAgICAqXHJcbiAgICAgKiAgIC0gYGNvbnRyb2xsZXJgOiBUaGUgY29udHJvbGxlciBjb25zdHJ1Y3RvciBhcyBkZWZpbmVkIGluIHRoZSByb3V0ZSBkZWZpbml0aW9uLlxyXG4gICAgICogICAtIGBsb2NhbHNgOiBBIG1hcCBvZiBsb2NhbHMgd2hpY2ggaXMgdXNlZCBieSB7QGxpbmsgbmcuJGNvbnRyb2xsZXIgJGNvbnRyb2xsZXJ9IHNlcnZpY2UgZm9yXHJcbiAgICAgKiAgICAgY29udHJvbGxlciBpbnN0YW50aWF0aW9uLiBUaGUgYGxvY2Fsc2AgY29udGFpblxyXG4gICAgICogICAgIHRoZSByZXNvbHZlZCB2YWx1ZXMgb2YgdGhlIGByZXNvbHZlYCBtYXAuIEFkZGl0aW9uYWxseSB0aGUgYGxvY2Fsc2AgYWxzbyBjb250YWluOlxyXG4gICAgICpcclxuICAgICAqICAgICAtIGAkc2NvcGVgIC0gVGhlIGN1cnJlbnQgcm91dGUgc2NvcGUuXHJcbiAgICAgKiAgICAgLSBgJHRlbXBsYXRlYCAtIFRoZSBjdXJyZW50IHJvdXRlIHRlbXBsYXRlIEhUTUwuXHJcbiAgICAgKlxyXG4gICAgICogICAgIFRoZSBgbG9jYWxzYCB3aWxsIGJlIGFzc2lnbmVkIHRvIHRoZSByb3V0ZSBzY29wZSdzIGAkcmVzb2x2ZWAgcHJvcGVydHkuIFlvdSBjYW4gb3ZlcnJpZGVcclxuICAgICAqICAgICB0aGUgcHJvcGVydHkgbmFtZSwgdXNpbmcgYHJlc29sdmVBc2AgaW4gdGhlIHJvdXRlIGRlZmluaXRpb24uIFNlZVxyXG4gICAgICogICAgIHtAbGluayBuZ1JvdXRlLiRyb3V0ZVByb3ZpZGVyICRyb3V0ZVByb3ZpZGVyfSBmb3IgbW9yZSBpbmZvLlxyXG4gICAgICpcclxuICAgICAqIEBwcm9wZXJ0eSB7T2JqZWN0fSByb3V0ZXMgT2JqZWN0IHdpdGggYWxsIHJvdXRlIGNvbmZpZ3VyYXRpb24gT2JqZWN0cyBhcyBpdHMgcHJvcGVydGllcy5cclxuICAgICAqXHJcbiAgICAgKiBAZGVzY3JpcHRpb25cclxuICAgICAqIGAkcm91dGVgIGlzIHVzZWQgZm9yIGRlZXAtbGlua2luZyBVUkxzIHRvIGNvbnRyb2xsZXJzIGFuZCB2aWV3cyAoSFRNTCBwYXJ0aWFscykuXHJcbiAgICAgKiBJdCB3YXRjaGVzIGAkbG9jYXRpb24udXJsKClgIGFuZCB0cmllcyB0byBtYXAgdGhlIHBhdGggdG8gYW4gZXhpc3Rpbmcgcm91dGUgZGVmaW5pdGlvbi5cclxuICAgICAqXHJcbiAgICAgKiBSZXF1aXJlcyB0aGUge0BsaW5rIG5nUm91dGUgYG5nUm91dGVgfSBtb2R1bGUgdG8gYmUgaW5zdGFsbGVkLlxyXG4gICAgICpcclxuICAgICAqIFlvdSBjYW4gZGVmaW5lIHJvdXRlcyB0aHJvdWdoIHtAbGluayBuZ1JvdXRlLiRyb3V0ZVByb3ZpZGVyICRyb3V0ZVByb3ZpZGVyfSdzIEFQSS5cclxuICAgICAqXHJcbiAgICAgKiBUaGUgYCRyb3V0ZWAgc2VydmljZSBpcyB0eXBpY2FsbHkgdXNlZCBpbiBjb25qdW5jdGlvbiB3aXRoIHRoZVxyXG4gICAgICoge0BsaW5rIG5nUm91dGUuZGlyZWN0aXZlOm5nVmlldyBgbmdWaWV3YH0gZGlyZWN0aXZlIGFuZCB0aGVcclxuICAgICAqIHtAbGluayBuZ1JvdXRlLiRyb3V0ZVBhcmFtcyBgJHJvdXRlUGFyYW1zYH0gc2VydmljZS5cclxuICAgICAqXHJcbiAgICAgKiBAZXhhbXBsZVxyXG4gICAgICogVGhpcyBleGFtcGxlIHNob3dzIGhvdyBjaGFuZ2luZyB0aGUgVVJMIGhhc2ggY2F1c2VzIHRoZSBgJHJvdXRlYCB0byBtYXRjaCBhIHJvdXRlIGFnYWluc3QgdGhlXHJcbiAgICAgKiBVUkwsIGFuZCB0aGUgYG5nVmlld2AgcHVsbHMgaW4gdGhlIHBhcnRpYWwuXHJcbiAgICAgKlxyXG4gICAgICogPGV4YW1wbGUgbmFtZT1cIiRyb3V0ZS1zZXJ2aWNlXCIgbW9kdWxlPVwibmdSb3V0ZUV4YW1wbGVcIlxyXG4gICAgICogICAgICAgICAgZGVwcz1cImFuZ3VsYXItcm91dGUuanNcIiBmaXhCYXNlPVwidHJ1ZVwiPlxyXG4gICAgICogICA8ZmlsZSBuYW1lPVwiaW5kZXguaHRtbFwiPlxyXG4gICAgICogICAgIDxkaXYgbmctY29udHJvbGxlcj1cIk1haW5Db250cm9sbGVyXCI+XHJcbiAgICAgKiAgICAgICBDaG9vc2U6XHJcbiAgICAgKiAgICAgICA8YSBocmVmPVwiQm9vay9Nb2J5XCI+TW9ieTwvYT4gfFxyXG4gICAgICogICAgICAgPGEgaHJlZj1cIkJvb2svTW9ieS9jaC8xXCI+TW9ieTogQ2gxPC9hPiB8XHJcbiAgICAgKiAgICAgICA8YSBocmVmPVwiQm9vay9HYXRzYnlcIj5HYXRzYnk8L2E+IHxcclxuICAgICAqICAgICAgIDxhIGhyZWY9XCJCb29rL0dhdHNieS9jaC80P2tleT12YWx1ZVwiPkdhdHNieTogQ2g0PC9hPiB8XHJcbiAgICAgKiAgICAgICA8YSBocmVmPVwiQm9vay9TY2FybGV0XCI+U2NhcmxldCBMZXR0ZXI8L2E+PGJyLz5cclxuICAgICAqXHJcbiAgICAgKiAgICAgICA8ZGl2IG5nLXZpZXc+PC9kaXY+XHJcbiAgICAgKlxyXG4gICAgICogICAgICAgPGhyIC8+XHJcbiAgICAgKlxyXG4gICAgICogICAgICAgPHByZT4kbG9jYXRpb24ucGF0aCgpID0ge3skbG9jYXRpb24ucGF0aCgpfX08L3ByZT5cclxuICAgICAqICAgICAgIDxwcmU+JHJvdXRlLmN1cnJlbnQudGVtcGxhdGVVcmwgPSB7eyRyb3V0ZS5jdXJyZW50LnRlbXBsYXRlVXJsfX08L3ByZT5cclxuICAgICAqICAgICAgIDxwcmU+JHJvdXRlLmN1cnJlbnQucGFyYW1zID0ge3skcm91dGUuY3VycmVudC5wYXJhbXN9fTwvcHJlPlxyXG4gICAgICogICAgICAgPHByZT4kcm91dGUuY3VycmVudC5zY29wZS5uYW1lID0ge3skcm91dGUuY3VycmVudC5zY29wZS5uYW1lfX08L3ByZT5cclxuICAgICAqICAgICAgIDxwcmU+JHJvdXRlUGFyYW1zID0ge3skcm91dGVQYXJhbXN9fTwvcHJlPlxyXG4gICAgICogICAgIDwvZGl2PlxyXG4gICAgICogICA8L2ZpbGU+XHJcbiAgICAgKlxyXG4gICAgICogICA8ZmlsZSBuYW1lPVwiYm9vay5odG1sXCI+XHJcbiAgICAgKiAgICAgY29udHJvbGxlcjoge3tuYW1lfX08YnIgLz5cclxuICAgICAqICAgICBCb29rIElkOiB7e3BhcmFtcy5ib29rSWR9fTxiciAvPlxyXG4gICAgICogICA8L2ZpbGU+XHJcbiAgICAgKlxyXG4gICAgICogICA8ZmlsZSBuYW1lPVwiY2hhcHRlci5odG1sXCI+XHJcbiAgICAgKiAgICAgY29udHJvbGxlcjoge3tuYW1lfX08YnIgLz5cclxuICAgICAqICAgICBCb29rIElkOiB7e3BhcmFtcy5ib29rSWR9fTxiciAvPlxyXG4gICAgICogICAgIENoYXB0ZXIgSWQ6IHt7cGFyYW1zLmNoYXB0ZXJJZH19XHJcbiAgICAgKiAgIDwvZmlsZT5cclxuICAgICAqXHJcbiAgICAgKiAgIDxmaWxlIG5hbWU9XCJzY3JpcHQuanNcIj5cclxuICAgICAqICAgICBhbmd1bGFyLm1vZHVsZSgnbmdSb3V0ZUV4YW1wbGUnLCBbJ25nUm91dGUnXSlcclxuICAgICAqXHJcbiAgICAgKiAgICAgIC5jb250cm9sbGVyKCdNYWluQ29udHJvbGxlcicsIGZ1bmN0aW9uKCRzY29wZSwgJHJvdXRlLCAkcm91dGVQYXJhbXMsICRsb2NhdGlvbikge1xyXG4gICAgICogICAgICAgICAgJHNjb3BlLiRyb3V0ZSA9ICRyb3V0ZTtcclxuICAgICAqICAgICAgICAgICRzY29wZS4kbG9jYXRpb24gPSAkbG9jYXRpb247XHJcbiAgICAgKiAgICAgICAgICAkc2NvcGUuJHJvdXRlUGFyYW1zID0gJHJvdXRlUGFyYW1zO1xyXG4gICAgICogICAgICB9KVxyXG4gICAgICpcclxuICAgICAqICAgICAgLmNvbnRyb2xsZXIoJ0Jvb2tDb250cm9sbGVyJywgZnVuY3Rpb24oJHNjb3BlLCAkcm91dGVQYXJhbXMpIHtcclxuICAgICAqICAgICAgICAgICRzY29wZS5uYW1lID0gXCJCb29rQ29udHJvbGxlclwiO1xyXG4gICAgICogICAgICAgICAgJHNjb3BlLnBhcmFtcyA9ICRyb3V0ZVBhcmFtcztcclxuICAgICAqICAgICAgfSlcclxuICAgICAqXHJcbiAgICAgKiAgICAgIC5jb250cm9sbGVyKCdDaGFwdGVyQ29udHJvbGxlcicsIGZ1bmN0aW9uKCRzY29wZSwgJHJvdXRlUGFyYW1zKSB7XHJcbiAgICAgKiAgICAgICAgICAkc2NvcGUubmFtZSA9IFwiQ2hhcHRlckNvbnRyb2xsZXJcIjtcclxuICAgICAqICAgICAgICAgICRzY29wZS5wYXJhbXMgPSAkcm91dGVQYXJhbXM7XHJcbiAgICAgKiAgICAgIH0pXHJcbiAgICAgKlxyXG4gICAgICogICAgIC5jb25maWcoZnVuY3Rpb24oJHJvdXRlUHJvdmlkZXIsICRsb2NhdGlvblByb3ZpZGVyKSB7XHJcbiAgICAgKiAgICAgICAkcm91dGVQcm92aWRlclxyXG4gICAgICogICAgICAgIC53aGVuKCcvQm9vay86Ym9va0lkJywge1xyXG4gICAgICogICAgICAgICB0ZW1wbGF0ZVVybDogJ2Jvb2suaHRtbCcsXHJcbiAgICAgKiAgICAgICAgIGNvbnRyb2xsZXI6ICdCb29rQ29udHJvbGxlcicsXHJcbiAgICAgKiAgICAgICAgIHJlc29sdmU6IHtcclxuICAgICAqICAgICAgICAgICAvLyBJIHdpbGwgY2F1c2UgYSAxIHNlY29uZCBkZWxheVxyXG4gICAgICogICAgICAgICAgIGRlbGF5OiBmdW5jdGlvbigkcSwgJHRpbWVvdXQpIHtcclxuICAgICAqICAgICAgICAgICAgIHZhciBkZWxheSA9ICRxLmRlZmVyKCk7XHJcbiAgICAgKiAgICAgICAgICAgICAkdGltZW91dChkZWxheS5yZXNvbHZlLCAxMDAwKTtcclxuICAgICAqICAgICAgICAgICAgIHJldHVybiBkZWxheS5wcm9taXNlO1xyXG4gICAgICogICAgICAgICAgIH1cclxuICAgICAqICAgICAgICAgfVxyXG4gICAgICogICAgICAgfSlcclxuICAgICAqICAgICAgIC53aGVuKCcvQm9vay86Ym9va0lkL2NoLzpjaGFwdGVySWQnLCB7XHJcbiAgICAgKiAgICAgICAgIHRlbXBsYXRlVXJsOiAnY2hhcHRlci5odG1sJyxcclxuICAgICAqICAgICAgICAgY29udHJvbGxlcjogJ0NoYXB0ZXJDb250cm9sbGVyJ1xyXG4gICAgICogICAgICAgfSk7XHJcbiAgICAgKlxyXG4gICAgICogICAgICAgLy8gY29uZmlndXJlIGh0bWw1IHRvIGdldCBsaW5rcyB3b3JraW5nIG9uIGpzZmlkZGxlXHJcbiAgICAgKiAgICAgICAkbG9jYXRpb25Qcm92aWRlci5odG1sNU1vZGUodHJ1ZSk7XHJcbiAgICAgKiAgICAgfSk7XHJcbiAgICAgKlxyXG4gICAgICogICA8L2ZpbGU+XHJcbiAgICAgKlxyXG4gICAgICogICA8ZmlsZSBuYW1lPVwicHJvdHJhY3Rvci5qc1wiIHR5cGU9XCJwcm90cmFjdG9yXCI+XHJcbiAgICAgKiAgICAgaXQoJ3Nob3VsZCBsb2FkIGFuZCBjb21waWxlIGNvcnJlY3QgdGVtcGxhdGUnLCBmdW5jdGlvbigpIHtcclxuICAgICAqICAgICAgIGVsZW1lbnQoYnkubGlua1RleHQoJ01vYnk6IENoMScpKS5jbGljaygpO1xyXG4gICAgICogICAgICAgdmFyIGNvbnRlbnQgPSBlbGVtZW50KGJ5LmNzcygnW25nLXZpZXddJykpLmdldFRleHQoKTtcclxuICAgICAqICAgICAgIGV4cGVjdChjb250ZW50KS50b01hdGNoKC9jb250cm9sbGVyXFw6IENoYXB0ZXJDb250cm9sbGVyLyk7XHJcbiAgICAgKiAgICAgICBleHBlY3QoY29udGVudCkudG9NYXRjaCgvQm9vayBJZFxcOiBNb2J5Lyk7XHJcbiAgICAgKiAgICAgICBleHBlY3QoY29udGVudCkudG9NYXRjaCgvQ2hhcHRlciBJZFxcOiAxLyk7XHJcbiAgICAgKlxyXG4gICAgICogICAgICAgZWxlbWVudChieS5wYXJ0aWFsTGlua1RleHQoJ1NjYXJsZXQnKSkuY2xpY2soKTtcclxuICAgICAqXHJcbiAgICAgKiAgICAgICBjb250ZW50ID0gZWxlbWVudChieS5jc3MoJ1tuZy12aWV3XScpKS5nZXRUZXh0KCk7XHJcbiAgICAgKiAgICAgICBleHBlY3QoY29udGVudCkudG9NYXRjaCgvY29udHJvbGxlclxcOiBCb29rQ29udHJvbGxlci8pO1xyXG4gICAgICogICAgICAgZXhwZWN0KGNvbnRlbnQpLnRvTWF0Y2goL0Jvb2sgSWRcXDogU2NhcmxldC8pO1xyXG4gICAgICogICAgIH0pO1xyXG4gICAgICogICA8L2ZpbGU+XHJcbiAgICAgKiA8L2V4YW1wbGU+XHJcbiAgICAgKi9cclxuXHJcbiAgICAvKipcclxuICAgICAqIEBuZ2RvYyBldmVudFxyXG4gICAgICogQG5hbWUgJHJvdXRlIyRyb3V0ZUNoYW5nZVN0YXJ0XHJcbiAgICAgKiBAZXZlbnRUeXBlIGJyb2FkY2FzdCBvbiByb290IHNjb3BlXHJcbiAgICAgKiBAZGVzY3JpcHRpb25cclxuICAgICAqIEJyb2FkY2FzdGVkIGJlZm9yZSBhIHJvdXRlIGNoYW5nZS4gQXQgdGhpcyAgcG9pbnQgdGhlIHJvdXRlIHNlcnZpY2VzIHN0YXJ0c1xyXG4gICAgICogcmVzb2x2aW5nIGFsbCBvZiB0aGUgZGVwZW5kZW5jaWVzIG5lZWRlZCBmb3IgdGhlIHJvdXRlIGNoYW5nZSB0byBvY2N1ci5cclxuICAgICAqIFR5cGljYWxseSB0aGlzIGludm9sdmVzIGZldGNoaW5nIHRoZSB2aWV3IHRlbXBsYXRlIGFzIHdlbGwgYXMgYW55IGRlcGVuZGVuY2llc1xyXG4gICAgICogZGVmaW5lZCBpbiBgcmVzb2x2ZWAgcm91dGUgcHJvcGVydHkuIE9uY2UgIGFsbCBvZiB0aGUgZGVwZW5kZW5jaWVzIGFyZSByZXNvbHZlZFxyXG4gICAgICogYCRyb3V0ZUNoYW5nZVN1Y2Nlc3NgIGlzIGZpcmVkLlxyXG4gICAgICpcclxuICAgICAqIFRoZSByb3V0ZSBjaGFuZ2UgKGFuZCB0aGUgYCRsb2NhdGlvbmAgY2hhbmdlIHRoYXQgdHJpZ2dlcmVkIGl0KSBjYW4gYmUgcHJldmVudGVkXHJcbiAgICAgKiBieSBjYWxsaW5nIGBwcmV2ZW50RGVmYXVsdGAgbWV0aG9kIG9mIHRoZSBldmVudC4gU2VlIHtAbGluayBuZy4kcm9vdFNjb3BlLlNjb3BlIyRvbn1cclxuICAgICAqIGZvciBtb3JlIGRldGFpbHMgYWJvdXQgZXZlbnQgb2JqZWN0LlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBhbmd1bGFyRXZlbnQgU3ludGhldGljIGV2ZW50IG9iamVjdC5cclxuICAgICAqIEBwYXJhbSB7Um91dGV9IG5leHQgRnV0dXJlIHJvdXRlIGluZm9ybWF0aW9uLlxyXG4gICAgICogQHBhcmFtIHtSb3V0ZX0gY3VycmVudCBDdXJyZW50IHJvdXRlIGluZm9ybWF0aW9uLlxyXG4gICAgICovXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAbmdkb2MgZXZlbnRcclxuICAgICAqIEBuYW1lICRyb3V0ZSMkcm91dGVDaGFuZ2VTdWNjZXNzXHJcbiAgICAgKiBAZXZlbnRUeXBlIGJyb2FkY2FzdCBvbiByb290IHNjb3BlXHJcbiAgICAgKiBAZGVzY3JpcHRpb25cclxuICAgICAqIEJyb2FkY2FzdGVkIGFmdGVyIGEgcm91dGUgY2hhbmdlIGhhcyBoYXBwZW5lZCBzdWNjZXNzZnVsbHkuXHJcbiAgICAgKiBUaGUgYHJlc29sdmVgIGRlcGVuZGVuY2llcyBhcmUgbm93IGF2YWlsYWJsZSBpbiB0aGUgYGN1cnJlbnQubG9jYWxzYCBwcm9wZXJ0eS5cclxuICAgICAqXHJcbiAgICAgKiB7QGxpbmsgbmdSb3V0ZS5kaXJlY3RpdmU6bmdWaWV3IG5nVmlld30gbGlzdGVucyBmb3IgdGhlIGRpcmVjdGl2ZVxyXG4gICAgICogdG8gaW5zdGFudGlhdGUgdGhlIGNvbnRyb2xsZXIgYW5kIHJlbmRlciB0aGUgdmlldy5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gYW5ndWxhckV2ZW50IFN5bnRoZXRpYyBldmVudCBvYmplY3QuXHJcbiAgICAgKiBAcGFyYW0ge1JvdXRlfSBjdXJyZW50IEN1cnJlbnQgcm91dGUgaW5mb3JtYXRpb24uXHJcbiAgICAgKiBAcGFyYW0ge1JvdXRlfFVuZGVmaW5lZH0gcHJldmlvdXMgUHJldmlvdXMgcm91dGUgaW5mb3JtYXRpb24sIG9yIHVuZGVmaW5lZCBpZiBjdXJyZW50IGlzXHJcbiAgICAgKiBmaXJzdCByb3V0ZSBlbnRlcmVkLlxyXG4gICAgICovXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAbmdkb2MgZXZlbnRcclxuICAgICAqIEBuYW1lICRyb3V0ZSMkcm91dGVDaGFuZ2VFcnJvclxyXG4gICAgICogQGV2ZW50VHlwZSBicm9hZGNhc3Qgb24gcm9vdCBzY29wZVxyXG4gICAgICogQGRlc2NyaXB0aW9uXHJcbiAgICAgKiBCcm9hZGNhc3RlZCBpZiBhbnkgb2YgdGhlIHJlc29sdmUgcHJvbWlzZXMgYXJlIHJlamVjdGVkLlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBhbmd1bGFyRXZlbnQgU3ludGhldGljIGV2ZW50IG9iamVjdFxyXG4gICAgICogQHBhcmFtIHtSb3V0ZX0gY3VycmVudCBDdXJyZW50IHJvdXRlIGluZm9ybWF0aW9uLlxyXG4gICAgICogQHBhcmFtIHtSb3V0ZX0gcHJldmlvdXMgUHJldmlvdXMgcm91dGUgaW5mb3JtYXRpb24uXHJcbiAgICAgKiBAcGFyYW0ge1JvdXRlfSByZWplY3Rpb24gUmVqZWN0aW9uIG9mIHRoZSBwcm9taXNlLiBVc3VhbGx5IHRoZSBlcnJvciBvZiB0aGUgZmFpbGVkIHByb21pc2UuXHJcbiAgICAgKi9cclxuXHJcbiAgICAvKipcclxuICAgICAqIEBuZ2RvYyBldmVudFxyXG4gICAgICogQG5hbWUgJHJvdXRlIyRyb3V0ZVVwZGF0ZVxyXG4gICAgICogQGV2ZW50VHlwZSBicm9hZGNhc3Qgb24gcm9vdCBzY29wZVxyXG4gICAgICogQGRlc2NyaXB0aW9uXHJcbiAgICAgKiBUaGUgYHJlbG9hZE9uU2VhcmNoYCBwcm9wZXJ0eSBoYXMgYmVlbiBzZXQgdG8gZmFsc2UsIGFuZCB3ZSBhcmUgcmV1c2luZyB0aGUgc2FtZVxyXG4gICAgICogaW5zdGFuY2Ugb2YgdGhlIENvbnRyb2xsZXIuXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGFuZ3VsYXJFdmVudCBTeW50aGV0aWMgZXZlbnQgb2JqZWN0XHJcbiAgICAgKiBAcGFyYW0ge1JvdXRlfSBjdXJyZW50IEN1cnJlbnQvcHJldmlvdXMgcm91dGUgaW5mb3JtYXRpb24uXHJcbiAgICAgKi9cclxuXHJcbiAgICB2YXIgZm9yY2VSZWxvYWQgPSBmYWxzZSxcclxuICAgICAgICBwcmVwYXJlZFJvdXRlLFxyXG4gICAgICAgIHByZXBhcmVkUm91dGVJc1VwZGF0ZU9ubHksXHJcbiAgICAgICAgJHJvdXRlID0ge1xyXG4gICAgICAgICAgcm91dGVzOiByb3V0ZXMsXHJcblxyXG4gICAgICAgICAgLyoqXHJcbiAgICAgICAgICAgKiBAbmdkb2MgbWV0aG9kXHJcbiAgICAgICAgICAgKiBAbmFtZSAkcm91dGUjcmVsb2FkXHJcbiAgICAgICAgICAgKlxyXG4gICAgICAgICAgICogQGRlc2NyaXB0aW9uXHJcbiAgICAgICAgICAgKiBDYXVzZXMgYCRyb3V0ZWAgc2VydmljZSB0byByZWxvYWQgdGhlIGN1cnJlbnQgcm91dGUgZXZlbiBpZlxyXG4gICAgICAgICAgICoge0BsaW5rIG5nLiRsb2NhdGlvbiAkbG9jYXRpb259IGhhc24ndCBjaGFuZ2VkLlxyXG4gICAgICAgICAgICpcclxuICAgICAgICAgICAqIEFzIGEgcmVzdWx0IG9mIHRoYXQsIHtAbGluayBuZ1JvdXRlLmRpcmVjdGl2ZTpuZ1ZpZXcgbmdWaWV3fVxyXG4gICAgICAgICAgICogY3JlYXRlcyBuZXcgc2NvcGUgYW5kIHJlaW5zdGFudGlhdGVzIHRoZSBjb250cm9sbGVyLlxyXG4gICAgICAgICAgICovXHJcbiAgICAgICAgICByZWxvYWQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBmb3JjZVJlbG9hZCA9IHRydWU7XHJcblxyXG4gICAgICAgICAgICB2YXIgZmFrZUxvY2F0aW9uRXZlbnQgPSB7XHJcbiAgICAgICAgICAgICAgZGVmYXVsdFByZXZlbnRlZDogZmFsc2UsXHJcbiAgICAgICAgICAgICAgcHJldmVudERlZmF1bHQ6IGZ1bmN0aW9uIGZha2VQcmV2ZW50RGVmYXVsdCgpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGVmYXVsdFByZXZlbnRlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICBmb3JjZVJlbG9hZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICRyb290U2NvcGUuJGV2YWxBc3luYyhmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICBwcmVwYXJlUm91dGUoZmFrZUxvY2F0aW9uRXZlbnQpO1xyXG4gICAgICAgICAgICAgIGlmICghZmFrZUxvY2F0aW9uRXZlbnQuZGVmYXVsdFByZXZlbnRlZCkgY29tbWl0Um91dGUoKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgIC8qKlxyXG4gICAgICAgICAgICogQG5nZG9jIG1ldGhvZFxyXG4gICAgICAgICAgICogQG5hbWUgJHJvdXRlI3VwZGF0ZVBhcmFtc1xyXG4gICAgICAgICAgICpcclxuICAgICAgICAgICAqIEBkZXNjcmlwdGlvblxyXG4gICAgICAgICAgICogQ2F1c2VzIGAkcm91dGVgIHNlcnZpY2UgdG8gdXBkYXRlIHRoZSBjdXJyZW50IFVSTCwgcmVwbGFjaW5nXHJcbiAgICAgICAgICAgKiBjdXJyZW50IHJvdXRlIHBhcmFtZXRlcnMgd2l0aCB0aG9zZSBzcGVjaWZpZWQgaW4gYG5ld1BhcmFtc2AuXHJcbiAgICAgICAgICAgKiBQcm92aWRlZCBwcm9wZXJ0eSBuYW1lcyB0aGF0IG1hdGNoIHRoZSByb3V0ZSdzIHBhdGggc2VnbWVudFxyXG4gICAgICAgICAgICogZGVmaW5pdGlvbnMgd2lsbCBiZSBpbnRlcnBvbGF0ZWQgaW50byB0aGUgbG9jYXRpb24ncyBwYXRoLCB3aGlsZVxyXG4gICAgICAgICAgICogcmVtYWluaW5nIHByb3BlcnRpZXMgd2lsbCBiZSB0cmVhdGVkIGFzIHF1ZXJ5IHBhcmFtcy5cclxuICAgICAgICAgICAqXHJcbiAgICAgICAgICAgKiBAcGFyYW0geyFPYmplY3Q8c3RyaW5nLCBzdHJpbmc+fSBuZXdQYXJhbXMgbWFwcGluZyBvZiBVUkwgcGFyYW1ldGVyIG5hbWVzIHRvIHZhbHVlc1xyXG4gICAgICAgICAgICovXHJcbiAgICAgICAgICB1cGRhdGVQYXJhbXM6IGZ1bmN0aW9uKG5ld1BhcmFtcykge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5jdXJyZW50ICYmIHRoaXMuY3VycmVudC4kJHJvdXRlKSB7XHJcbiAgICAgICAgICAgICAgbmV3UGFyYW1zID0gYW5ndWxhci5leHRlbmQoe30sIHRoaXMuY3VycmVudC5wYXJhbXMsIG5ld1BhcmFtcyk7XHJcbiAgICAgICAgICAgICAgJGxvY2F0aW9uLnBhdGgoaW50ZXJwb2xhdGUodGhpcy5jdXJyZW50LiQkcm91dGUub3JpZ2luYWxQYXRoLCBuZXdQYXJhbXMpKTtcclxuICAgICAgICAgICAgICAvLyBpbnRlcnBvbGF0ZSBtb2RpZmllcyBuZXdQYXJhbXMsIG9ubHkgcXVlcnkgcGFyYW1zIGFyZSBsZWZ0XHJcbiAgICAgICAgICAgICAgJGxvY2F0aW9uLnNlYXJjaChuZXdQYXJhbXMpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIHRocm93ICRyb3V0ZU1pbkVycignbm9yb3V0JywgJ1RyaWVkIHVwZGF0aW5nIHJvdXRlIHdoZW4gd2l0aCBubyBjdXJyZW50IHJvdXRlJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICRyb290U2NvcGUuJG9uKCckbG9jYXRpb25DaGFuZ2VTdGFydCcsIHByZXBhcmVSb3V0ZSk7XHJcbiAgICAkcm9vdFNjb3BlLiRvbignJGxvY2F0aW9uQ2hhbmdlU3VjY2VzcycsIGNvbW1pdFJvdXRlKTtcclxuXHJcbiAgICByZXR1cm4gJHJvdXRlO1xyXG5cclxuICAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAcGFyYW0gb24ge3N0cmluZ30gY3VycmVudCB1cmxcclxuICAgICAqIEBwYXJhbSByb3V0ZSB7T2JqZWN0fSByb3V0ZSByZWdleHAgdG8gbWF0Y2ggdGhlIHVybCBhZ2FpbnN0XHJcbiAgICAgKiBAcmV0dXJuIHs/T2JqZWN0fVxyXG4gICAgICpcclxuICAgICAqIEBkZXNjcmlwdGlvblxyXG4gICAgICogQ2hlY2sgaWYgdGhlIHJvdXRlIG1hdGNoZXMgdGhlIGN1cnJlbnQgdXJsLlxyXG4gICAgICpcclxuICAgICAqIEluc3BpcmVkIGJ5IG1hdGNoIGluXHJcbiAgICAgKiB2aXNpb25tZWRpYS9leHByZXNzL2xpYi9yb3V0ZXIvcm91dGVyLmpzLlxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBzd2l0Y2hSb3V0ZU1hdGNoZXIob24sIHJvdXRlKSB7XHJcbiAgICAgIHZhciBrZXlzID0gcm91dGUua2V5cyxcclxuICAgICAgICAgIHBhcmFtcyA9IHt9O1xyXG5cclxuICAgICAgaWYgKCFyb3V0ZS5yZWdleHApIHJldHVybiBudWxsO1xyXG5cclxuICAgICAgdmFyIG0gPSByb3V0ZS5yZWdleHAuZXhlYyhvbik7XHJcbiAgICAgIGlmICghbSkgcmV0dXJuIG51bGw7XHJcblxyXG4gICAgICBmb3IgKHZhciBpID0gMSwgbGVuID0gbS5sZW5ndGg7IGkgPCBsZW47ICsraSkge1xyXG4gICAgICAgIHZhciBrZXkgPSBrZXlzW2kgLSAxXTtcclxuXHJcbiAgICAgICAgdmFyIHZhbCA9IG1baV07XHJcblxyXG4gICAgICAgIGlmIChrZXkgJiYgdmFsKSB7XHJcbiAgICAgICAgICBwYXJhbXNba2V5Lm5hbWVdID0gdmFsO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gcGFyYW1zO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHByZXBhcmVSb3V0ZSgkbG9jYXRpb25FdmVudCkge1xyXG4gICAgICB2YXIgbGFzdFJvdXRlID0gJHJvdXRlLmN1cnJlbnQ7XHJcblxyXG4gICAgICBwcmVwYXJlZFJvdXRlID0gcGFyc2VSb3V0ZSgpO1xyXG4gICAgICBwcmVwYXJlZFJvdXRlSXNVcGRhdGVPbmx5ID0gcHJlcGFyZWRSb3V0ZSAmJiBsYXN0Um91dGUgJiYgcHJlcGFyZWRSb3V0ZS4kJHJvdXRlID09PSBsYXN0Um91dGUuJCRyb3V0ZVxyXG4gICAgICAgICAgJiYgYW5ndWxhci5lcXVhbHMocHJlcGFyZWRSb3V0ZS5wYXRoUGFyYW1zLCBsYXN0Um91dGUucGF0aFBhcmFtcylcclxuICAgICAgICAgICYmICFwcmVwYXJlZFJvdXRlLnJlbG9hZE9uU2VhcmNoICYmICFmb3JjZVJlbG9hZDtcclxuXHJcbiAgICAgIGlmICghcHJlcGFyZWRSb3V0ZUlzVXBkYXRlT25seSAmJiAobGFzdFJvdXRlIHx8IHByZXBhcmVkUm91dGUpKSB7XHJcbiAgICAgICAgaWYgKCRyb290U2NvcGUuJGJyb2FkY2FzdCgnJHJvdXRlQ2hhbmdlU3RhcnQnLCBwcmVwYXJlZFJvdXRlLCBsYXN0Um91dGUpLmRlZmF1bHRQcmV2ZW50ZWQpIHtcclxuICAgICAgICAgIGlmICgkbG9jYXRpb25FdmVudCkge1xyXG4gICAgICAgICAgICAkbG9jYXRpb25FdmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGNvbW1pdFJvdXRlKCkge1xyXG4gICAgICB2YXIgbGFzdFJvdXRlID0gJHJvdXRlLmN1cnJlbnQ7XHJcbiAgICAgIHZhciBuZXh0Um91dGUgPSBwcmVwYXJlZFJvdXRlO1xyXG5cclxuICAgICAgaWYgKHByZXBhcmVkUm91dGVJc1VwZGF0ZU9ubHkpIHtcclxuICAgICAgICBsYXN0Um91dGUucGFyYW1zID0gbmV4dFJvdXRlLnBhcmFtcztcclxuICAgICAgICBhbmd1bGFyLmNvcHkobGFzdFJvdXRlLnBhcmFtcywgJHJvdXRlUGFyYW1zKTtcclxuICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJyRyb3V0ZVVwZGF0ZScsIGxhc3RSb3V0ZSk7XHJcbiAgICAgIH0gZWxzZSBpZiAobmV4dFJvdXRlIHx8IGxhc3RSb3V0ZSkge1xyXG4gICAgICAgIGZvcmNlUmVsb2FkID0gZmFsc2U7XHJcbiAgICAgICAgJHJvdXRlLmN1cnJlbnQgPSBuZXh0Um91dGU7XHJcbiAgICAgICAgaWYgKG5leHRSb3V0ZSkge1xyXG4gICAgICAgICAgaWYgKG5leHRSb3V0ZS5yZWRpcmVjdFRvKSB7XHJcbiAgICAgICAgICAgIGlmIChhbmd1bGFyLmlzU3RyaW5nKG5leHRSb3V0ZS5yZWRpcmVjdFRvKSkge1xyXG4gICAgICAgICAgICAgICRsb2NhdGlvbi5wYXRoKGludGVycG9sYXRlKG5leHRSb3V0ZS5yZWRpcmVjdFRvLCBuZXh0Um91dGUucGFyYW1zKSkuc2VhcmNoKG5leHRSb3V0ZS5wYXJhbXMpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAkbG9jYXRpb24udXJsKG5leHRSb3V0ZS5yZWRpcmVjdFRvKG5leHRSb3V0ZS5wYXRoUGFyYW1zLCAkbG9jYXRpb24ucGF0aCgpLCAkbG9jYXRpb24uc2VhcmNoKCkpKVxyXG4gICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgICRxLndoZW4obmV4dFJvdXRlKS5cclxuICAgICAgICAgIHRoZW4ocmVzb2x2ZUxvY2FscykuXHJcbiAgICAgICAgICB0aGVuKGZ1bmN0aW9uKGxvY2Fscykge1xyXG4gICAgICAgICAgICAvLyBhZnRlciByb3V0ZSBjaGFuZ2VcclxuICAgICAgICAgICAgaWYgKG5leHRSb3V0ZSA9PSAkcm91dGUuY3VycmVudCkge1xyXG4gICAgICAgICAgICAgIGlmIChuZXh0Um91dGUpIHtcclxuICAgICAgICAgICAgICAgIG5leHRSb3V0ZS5sb2NhbHMgPSBsb2NhbHM7XHJcbiAgICAgICAgICAgICAgICBhbmd1bGFyLmNvcHkobmV4dFJvdXRlLnBhcmFtcywgJHJvdXRlUGFyYW1zKTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCckcm91dGVDaGFuZ2VTdWNjZXNzJywgbmV4dFJvdXRlLCBsYXN0Um91dGUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9LCBmdW5jdGlvbihlcnJvcikge1xyXG4gICAgICAgICAgICBpZiAobmV4dFJvdXRlID09ICRyb3V0ZS5jdXJyZW50KSB7XHJcbiAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCckcm91dGVDaGFuZ2VFcnJvcicsIG5leHRSb3V0ZSwgbGFzdFJvdXRlLCBlcnJvcik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gcmVzb2x2ZUxvY2Fscyhyb3V0ZSkge1xyXG4gICAgICBpZiAocm91dGUpIHtcclxuICAgICAgICB2YXIgbG9jYWxzID0gYW5ndWxhci5leHRlbmQoe30sIHJvdXRlLnJlc29sdmUpO1xyXG4gICAgICAgIGFuZ3VsYXIuZm9yRWFjaChsb2NhbHMsIGZ1bmN0aW9uKHZhbHVlLCBrZXkpIHtcclxuICAgICAgICAgIGxvY2Fsc1trZXldID0gYW5ndWxhci5pc1N0cmluZyh2YWx1ZSkgP1xyXG4gICAgICAgICAgICAgICRpbmplY3Rvci5nZXQodmFsdWUpIDpcclxuICAgICAgICAgICAgICAkaW5qZWN0b3IuaW52b2tlKHZhbHVlLCBudWxsLCBudWxsLCBrZXkpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHZhciB0ZW1wbGF0ZSA9IGdldFRlbXBsYXRlRm9yKHJvdXRlKTtcclxuICAgICAgICBpZiAoYW5ndWxhci5pc0RlZmluZWQodGVtcGxhdGUpKSB7XHJcbiAgICAgICAgICBsb2NhbHNbJyR0ZW1wbGF0ZSddID0gdGVtcGxhdGU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiAkcS5hbGwobG9jYWxzKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuXHJcbiAgICBmdW5jdGlvbiBnZXRUZW1wbGF0ZUZvcihyb3V0ZSkge1xyXG4gICAgICB2YXIgdGVtcGxhdGUsIHRlbXBsYXRlVXJsO1xyXG4gICAgICBpZiAoYW5ndWxhci5pc0RlZmluZWQodGVtcGxhdGUgPSByb3V0ZS50ZW1wbGF0ZSkpIHtcclxuICAgICAgICBpZiAoYW5ndWxhci5pc0Z1bmN0aW9uKHRlbXBsYXRlKSkge1xyXG4gICAgICAgICAgdGVtcGxhdGUgPSB0ZW1wbGF0ZShyb3V0ZS5wYXJhbXMpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBlbHNlIGlmIChhbmd1bGFyLmlzRGVmaW5lZCh0ZW1wbGF0ZVVybCA9IHJvdXRlLnRlbXBsYXRlVXJsKSkge1xyXG4gICAgICAgIGlmIChhbmd1bGFyLmlzRnVuY3Rpb24odGVtcGxhdGVVcmwpKSB7XHJcbiAgICAgICAgICB0ZW1wbGF0ZVVybCA9IHRlbXBsYXRlVXJsKHJvdXRlLnBhcmFtcyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChhbmd1bGFyLmlzRGVmaW5lZCh0ZW1wbGF0ZVVybCkpIHtcclxuICAgICAgICAgIHJvdXRlLmxvYWRlZFRlbXBsYXRlVXJsID0gJHNjZS52YWx1ZU9mKHRlbXBsYXRlVXJsKTtcclxuICAgICAgICAgIHRlbXBsYXRlID0gJHRlbXBsYXRlUmVxdWVzdCh0ZW1wbGF0ZVVybCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiB0ZW1wbGF0ZTtcclxuICAgIH1cclxuXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAcmV0dXJucyB7T2JqZWN0fSB0aGUgY3VycmVudCBhY3RpdmUgcm91dGUsIGJ5IG1hdGNoaW5nIGl0IGFnYWluc3QgdGhlIFVSTFxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBwYXJzZVJvdXRlKCkge1xyXG4gICAgICAvLyBNYXRjaCBhIHJvdXRlXHJcbiAgICAgIHZhciBwYXJhbXMsIG1hdGNoO1xyXG4gICAgICBhbmd1bGFyLmZvckVhY2gocm91dGVzLCBmdW5jdGlvbihyb3V0ZSwgcGF0aCkge1xyXG4gICAgICAgIGlmICghbWF0Y2ggJiYgKHBhcmFtcyA9IHN3aXRjaFJvdXRlTWF0Y2hlcigkbG9jYXRpb24ucGF0aCgpLCByb3V0ZSkpKSB7XHJcbiAgICAgICAgICBtYXRjaCA9IGluaGVyaXQocm91dGUsIHtcclxuICAgICAgICAgICAgcGFyYW1zOiBhbmd1bGFyLmV4dGVuZCh7fSwgJGxvY2F0aW9uLnNlYXJjaCgpLCBwYXJhbXMpLFxyXG4gICAgICAgICAgICBwYXRoUGFyYW1zOiBwYXJhbXN9KTtcclxuICAgICAgICAgIG1hdGNoLiQkcm91dGUgPSByb3V0ZTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgICAvLyBObyByb3V0ZSBtYXRjaGVkOyBmYWxsYmFjayB0byBcIm90aGVyd2lzZVwiIHJvdXRlXHJcbiAgICAgIHJldHVybiBtYXRjaCB8fCByb3V0ZXNbbnVsbF0gJiYgaW5oZXJpdChyb3V0ZXNbbnVsbF0sIHtwYXJhbXM6IHt9LCBwYXRoUGFyYW1zOnt9fSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSBpbnRlcnBvbGF0aW9uIG9mIHRoZSByZWRpcmVjdCBwYXRoIHdpdGggdGhlIHBhcmFtZXRlcnNcclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gaW50ZXJwb2xhdGUoc3RyaW5nLCBwYXJhbXMpIHtcclxuICAgICAgdmFyIHJlc3VsdCA9IFtdO1xyXG4gICAgICBhbmd1bGFyLmZvckVhY2goKHN0cmluZyB8fCAnJykuc3BsaXQoJzonKSwgZnVuY3Rpb24oc2VnbWVudCwgaSkge1xyXG4gICAgICAgIGlmIChpID09PSAwKSB7XHJcbiAgICAgICAgICByZXN1bHQucHVzaChzZWdtZW50KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgdmFyIHNlZ21lbnRNYXRjaCA9IHNlZ21lbnQubWF0Y2goLyhcXHcrKSg/Ols/Kl0pPyguKikvKTtcclxuICAgICAgICAgIHZhciBrZXkgPSBzZWdtZW50TWF0Y2hbMV07XHJcbiAgICAgICAgICByZXN1bHQucHVzaChwYXJhbXNba2V5XSk7XHJcbiAgICAgICAgICByZXN1bHQucHVzaChzZWdtZW50TWF0Y2hbMl0gfHwgJycpO1xyXG4gICAgICAgICAgZGVsZXRlIHBhcmFtc1trZXldO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICAgIHJldHVybiByZXN1bHQuam9pbignJyk7XHJcbiAgICB9XHJcbiAgfV07XHJcbn1cclxuXHJcbm5nUm91dGVNb2R1bGUucHJvdmlkZXIoJyRyb3V0ZVBhcmFtcycsICRSb3V0ZVBhcmFtc1Byb3ZpZGVyKTtcclxuXHJcblxyXG4vKipcclxuICogQG5nZG9jIHNlcnZpY2VcclxuICogQG5hbWUgJHJvdXRlUGFyYW1zXHJcbiAqIEByZXF1aXJlcyAkcm91dGVcclxuICpcclxuICogQGRlc2NyaXB0aW9uXHJcbiAqIFRoZSBgJHJvdXRlUGFyYW1zYCBzZXJ2aWNlIGFsbG93cyB5b3UgdG8gcmV0cmlldmUgdGhlIGN1cnJlbnQgc2V0IG9mIHJvdXRlIHBhcmFtZXRlcnMuXHJcbiAqXHJcbiAqIFJlcXVpcmVzIHRoZSB7QGxpbmsgbmdSb3V0ZSBgbmdSb3V0ZWB9IG1vZHVsZSB0byBiZSBpbnN0YWxsZWQuXHJcbiAqXHJcbiAqIFRoZSByb3V0ZSBwYXJhbWV0ZXJzIGFyZSBhIGNvbWJpbmF0aW9uIG9mIHtAbGluayBuZy4kbG9jYXRpb24gYCRsb2NhdGlvbmB9J3NcclxuICoge0BsaW5rIG5nLiRsb2NhdGlvbiNzZWFyY2ggYHNlYXJjaCgpYH0gYW5kIHtAbGluayBuZy4kbG9jYXRpb24jcGF0aCBgcGF0aCgpYH0uXHJcbiAqIFRoZSBgcGF0aGAgcGFyYW1ldGVycyBhcmUgZXh0cmFjdGVkIHdoZW4gdGhlIHtAbGluayBuZ1JvdXRlLiRyb3V0ZSBgJHJvdXRlYH0gcGF0aCBpcyBtYXRjaGVkLlxyXG4gKlxyXG4gKiBJbiBjYXNlIG9mIHBhcmFtZXRlciBuYW1lIGNvbGxpc2lvbiwgYHBhdGhgIHBhcmFtcyB0YWtlIHByZWNlZGVuY2Ugb3ZlciBgc2VhcmNoYCBwYXJhbXMuXHJcbiAqXHJcbiAqIFRoZSBzZXJ2aWNlIGd1YXJhbnRlZXMgdGhhdCB0aGUgaWRlbnRpdHkgb2YgdGhlIGAkcm91dGVQYXJhbXNgIG9iamVjdCB3aWxsIHJlbWFpbiB1bmNoYW5nZWRcclxuICogKGJ1dCBpdHMgcHJvcGVydGllcyB3aWxsIGxpa2VseSBjaGFuZ2UpIGV2ZW4gd2hlbiBhIHJvdXRlIGNoYW5nZSBvY2N1cnMuXHJcbiAqXHJcbiAqIE5vdGUgdGhhdCB0aGUgYCRyb3V0ZVBhcmFtc2AgYXJlIG9ubHkgdXBkYXRlZCAqYWZ0ZXIqIGEgcm91dGUgY2hhbmdlIGNvbXBsZXRlcyBzdWNjZXNzZnVsbHkuXHJcbiAqIFRoaXMgbWVhbnMgdGhhdCB5b3UgY2Fubm90IHJlbHkgb24gYCRyb3V0ZVBhcmFtc2AgYmVpbmcgY29ycmVjdCBpbiByb3V0ZSByZXNvbHZlIGZ1bmN0aW9ucy5cclxuICogSW5zdGVhZCB5b3UgY2FuIHVzZSBgJHJvdXRlLmN1cnJlbnQucGFyYW1zYCB0byBhY2Nlc3MgdGhlIG5ldyByb3V0ZSdzIHBhcmFtZXRlcnMuXHJcbiAqXHJcbiAqIEBleGFtcGxlXHJcbiAqIGBgYGpzXHJcbiAqICAvLyBHaXZlbjpcclxuICogIC8vIFVSTDogaHR0cDovL3NlcnZlci5jb20vaW5kZXguaHRtbCMvQ2hhcHRlci8xL1NlY3Rpb24vMj9zZWFyY2g9bW9ieVxyXG4gKiAgLy8gUm91dGU6IC9DaGFwdGVyLzpjaGFwdGVySWQvU2VjdGlvbi86c2VjdGlvbklkXHJcbiAqICAvL1xyXG4gKiAgLy8gVGhlblxyXG4gKiAgJHJvdXRlUGFyYW1zID09PiB7Y2hhcHRlcklkOicxJywgc2VjdGlvbklkOicyJywgc2VhcmNoOidtb2J5J31cclxuICogYGBgXHJcbiAqL1xyXG5mdW5jdGlvbiAkUm91dGVQYXJhbXNQcm92aWRlcigpIHtcclxuICB0aGlzLiRnZXQgPSBmdW5jdGlvbigpIHsgcmV0dXJuIHt9OyB9O1xyXG59XHJcblxyXG5uZ1JvdXRlTW9kdWxlLmRpcmVjdGl2ZSgnbmdWaWV3JywgbmdWaWV3RmFjdG9yeSk7XHJcbm5nUm91dGVNb2R1bGUuZGlyZWN0aXZlKCduZ1ZpZXcnLCBuZ1ZpZXdGaWxsQ29udGVudEZhY3RvcnkpO1xyXG5cclxuXHJcbi8qKlxyXG4gKiBAbmdkb2MgZGlyZWN0aXZlXHJcbiAqIEBuYW1lIG5nVmlld1xyXG4gKiBAcmVzdHJpY3QgRUNBXHJcbiAqXHJcbiAqIEBkZXNjcmlwdGlvblxyXG4gKiAjIE92ZXJ2aWV3XHJcbiAqIGBuZ1ZpZXdgIGlzIGEgZGlyZWN0aXZlIHRoYXQgY29tcGxlbWVudHMgdGhlIHtAbGluayBuZ1JvdXRlLiRyb3V0ZSAkcm91dGV9IHNlcnZpY2UgYnlcclxuICogaW5jbHVkaW5nIHRoZSByZW5kZXJlZCB0ZW1wbGF0ZSBvZiB0aGUgY3VycmVudCByb3V0ZSBpbnRvIHRoZSBtYWluIGxheW91dCAoYGluZGV4Lmh0bWxgKSBmaWxlLlxyXG4gKiBFdmVyeSB0aW1lIHRoZSBjdXJyZW50IHJvdXRlIGNoYW5nZXMsIHRoZSBpbmNsdWRlZCB2aWV3IGNoYW5nZXMgd2l0aCBpdCBhY2NvcmRpbmcgdG8gdGhlXHJcbiAqIGNvbmZpZ3VyYXRpb24gb2YgdGhlIGAkcm91dGVgIHNlcnZpY2UuXHJcbiAqXHJcbiAqIFJlcXVpcmVzIHRoZSB7QGxpbmsgbmdSb3V0ZSBgbmdSb3V0ZWB9IG1vZHVsZSB0byBiZSBpbnN0YWxsZWQuXHJcbiAqXHJcbiAqIEBhbmltYXRpb25zXHJcbiAqIHwgQW5pbWF0aW9uICAgICAgICAgICAgICAgICAgICAgICAgfCBPY2N1cnMgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XHJcbiAqIHwtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tfC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS18XHJcbiAqIHwge0BsaW5rIG5nLiRhbmltYXRlI2VudGVyIGVudGVyfSAgfCB3aGVuIHRoZSBuZXcgZWxlbWVudCBpcyBpbnNlcnRlZCB0byB0aGUgRE9NIHxcclxuICogfCB7QGxpbmsgbmcuJGFuaW1hdGUjbGVhdmUgbGVhdmV9ICB8IHdoZW4gdGhlIG9sZCBlbGVtZW50IGlzIHJlbW92ZWQgZnJvbSB0byB0aGUgRE9NICB8XHJcbiAqXHJcbiAqIFRoZSBlbnRlciBhbmQgbGVhdmUgYW5pbWF0aW9uIG9jY3VyIGNvbmN1cnJlbnRseS5cclxuICpcclxuICogQGtub3duSXNzdWUgSWYgYG5nVmlld2AgaXMgY29udGFpbmVkIGluIGFuIGFzeW5jaHJvbm91c2x5IGxvYWRlZCB0ZW1wbGF0ZSAoZS5nLiBpbiBhbm90aGVyXHJcbiAqICAgICAgICAgICAgIGRpcmVjdGl2ZSdzIHRlbXBsYXRlVXJsIG9yIGluIGEgdGVtcGxhdGUgbG9hZGVkIHVzaW5nIGBuZ0luY2x1ZGVgKSwgdGhlbiB5b3UgbmVlZCB0b1xyXG4gKiAgICAgICAgICAgICBtYWtlIHN1cmUgdGhhdCBgJHJvdXRlYCBpcyBpbnN0YW50aWF0ZWQgaW4gdGltZSB0byBjYXB0dXJlIHRoZSBpbml0aWFsXHJcbiAqICAgICAgICAgICAgIGAkbG9jYXRpb25DaGFuZ2VTdGFydGAgZXZlbnQgYW5kIGxvYWQgdGhlIGFwcHJvcHJpYXRlIHZpZXcuIE9uZSB3YXkgdG8gYWNoaWV2ZSB0aGlzXHJcbiAqICAgICAgICAgICAgIGlzIHRvIGhhdmUgaXQgYXMgYSBkZXBlbmRlbmN5IGluIGEgYC5ydW5gIGJsb2NrOlxyXG4gKiAgICAgICAgICAgICBgbXlNb2R1bGUucnVuKFsnJHJvdXRlJywgZnVuY3Rpb24oKSB7fV0pO2BcclxuICpcclxuICogQHNjb3BlXHJcbiAqIEBwcmlvcml0eSA0MDBcclxuICogQHBhcmFtIHtzdHJpbmc9fSBvbmxvYWQgRXhwcmVzc2lvbiB0byBldmFsdWF0ZSB3aGVuZXZlciB0aGUgdmlldyB1cGRhdGVzLlxyXG4gKlxyXG4gKiBAcGFyYW0ge3N0cmluZz19IGF1dG9zY3JvbGwgV2hldGhlciBgbmdWaWV3YCBzaG91bGQgY2FsbCB7QGxpbmsgbmcuJGFuY2hvclNjcm9sbFxyXG4gKiAgICAgICAgICAgICAgICAgICRhbmNob3JTY3JvbGx9IHRvIHNjcm9sbCB0aGUgdmlld3BvcnQgYWZ0ZXIgdGhlIHZpZXcgaXMgdXBkYXRlZC5cclxuICpcclxuICogICAgICAgICAgICAgICAgICAtIElmIHRoZSBhdHRyaWJ1dGUgaXMgbm90IHNldCwgZGlzYWJsZSBzY3JvbGxpbmcuXHJcbiAqICAgICAgICAgICAgICAgICAgLSBJZiB0aGUgYXR0cmlidXRlIGlzIHNldCB3aXRob3V0IHZhbHVlLCBlbmFibGUgc2Nyb2xsaW5nLlxyXG4gKiAgICAgICAgICAgICAgICAgIC0gT3RoZXJ3aXNlIGVuYWJsZSBzY3JvbGxpbmcgb25seSBpZiB0aGUgYGF1dG9zY3JvbGxgIGF0dHJpYnV0ZSB2YWx1ZSBldmFsdWF0ZWRcclxuICogICAgICAgICAgICAgICAgICAgIGFzIGFuIGV4cHJlc3Npb24geWllbGRzIGEgdHJ1dGh5IHZhbHVlLlxyXG4gKiBAZXhhbXBsZVxyXG4gICAgPGV4YW1wbGUgbmFtZT1cIm5nVmlldy1kaXJlY3RpdmVcIiBtb2R1bGU9XCJuZ1ZpZXdFeGFtcGxlXCJcclxuICAgICAgICAgICAgIGRlcHM9XCJhbmd1bGFyLXJvdXRlLmpzO2FuZ3VsYXItYW5pbWF0ZS5qc1wiXHJcbiAgICAgICAgICAgICBhbmltYXRpb25zPVwidHJ1ZVwiIGZpeEJhc2U9XCJ0cnVlXCI+XHJcbiAgICAgIDxmaWxlIG5hbWU9XCJpbmRleC5odG1sXCI+XHJcbiAgICAgICAgPGRpdiBuZy1jb250cm9sbGVyPVwiTWFpbkN0cmwgYXMgbWFpblwiPlxyXG4gICAgICAgICAgQ2hvb3NlOlxyXG4gICAgICAgICAgPGEgaHJlZj1cIkJvb2svTW9ieVwiPk1vYnk8L2E+IHxcclxuICAgICAgICAgIDxhIGhyZWY9XCJCb29rL01vYnkvY2gvMVwiPk1vYnk6IENoMTwvYT4gfFxyXG4gICAgICAgICAgPGEgaHJlZj1cIkJvb2svR2F0c2J5XCI+R2F0c2J5PC9hPiB8XHJcbiAgICAgICAgICA8YSBocmVmPVwiQm9vay9HYXRzYnkvY2gvND9rZXk9dmFsdWVcIj5HYXRzYnk6IENoNDwvYT4gfFxyXG4gICAgICAgICAgPGEgaHJlZj1cIkJvb2svU2NhcmxldFwiPlNjYXJsZXQgTGV0dGVyPC9hPjxici8+XHJcblxyXG4gICAgICAgICAgPGRpdiBjbGFzcz1cInZpZXctYW5pbWF0ZS1jb250YWluZXJcIj5cclxuICAgICAgICAgICAgPGRpdiBuZy12aWV3IGNsYXNzPVwidmlldy1hbmltYXRlXCI+PC9kaXY+XHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgIDxociAvPlxyXG5cclxuICAgICAgICAgIDxwcmU+JGxvY2F0aW9uLnBhdGgoKSA9IHt7bWFpbi4kbG9jYXRpb24ucGF0aCgpfX08L3ByZT5cclxuICAgICAgICAgIDxwcmU+JHJvdXRlLmN1cnJlbnQudGVtcGxhdGVVcmwgPSB7e21haW4uJHJvdXRlLmN1cnJlbnQudGVtcGxhdGVVcmx9fTwvcHJlPlxyXG4gICAgICAgICAgPHByZT4kcm91dGUuY3VycmVudC5wYXJhbXMgPSB7e21haW4uJHJvdXRlLmN1cnJlbnQucGFyYW1zfX08L3ByZT5cclxuICAgICAgICAgIDxwcmU+JHJvdXRlUGFyYW1zID0ge3ttYWluLiRyb3V0ZVBhcmFtc319PC9wcmU+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgIDwvZmlsZT5cclxuXHJcbiAgICAgIDxmaWxlIG5hbWU9XCJib29rLmh0bWxcIj5cclxuICAgICAgICA8ZGl2PlxyXG4gICAgICAgICAgY29udHJvbGxlcjoge3tib29rLm5hbWV9fTxiciAvPlxyXG4gICAgICAgICAgQm9vayBJZDoge3tib29rLnBhcmFtcy5ib29rSWR9fTxiciAvPlxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICA8L2ZpbGU+XHJcblxyXG4gICAgICA8ZmlsZSBuYW1lPVwiY2hhcHRlci5odG1sXCI+XHJcbiAgICAgICAgPGRpdj5cclxuICAgICAgICAgIGNvbnRyb2xsZXI6IHt7Y2hhcHRlci5uYW1lfX08YnIgLz5cclxuICAgICAgICAgIEJvb2sgSWQ6IHt7Y2hhcHRlci5wYXJhbXMuYm9va0lkfX08YnIgLz5cclxuICAgICAgICAgIENoYXB0ZXIgSWQ6IHt7Y2hhcHRlci5wYXJhbXMuY2hhcHRlcklkfX1cclxuICAgICAgICA8L2Rpdj5cclxuICAgICAgPC9maWxlPlxyXG5cclxuICAgICAgPGZpbGUgbmFtZT1cImFuaW1hdGlvbnMuY3NzXCI+XHJcbiAgICAgICAgLnZpZXctYW5pbWF0ZS1jb250YWluZXIge1xyXG4gICAgICAgICAgcG9zaXRpb246cmVsYXRpdmU7XHJcbiAgICAgICAgICBoZWlnaHQ6MTAwcHghaW1wb3J0YW50O1xyXG4gICAgICAgICAgYmFja2dyb3VuZDp3aGl0ZTtcclxuICAgICAgICAgIGJvcmRlcjoxcHggc29saWQgYmxhY2s7XHJcbiAgICAgICAgICBoZWlnaHQ6NDBweDtcclxuICAgICAgICAgIG92ZXJmbG93OmhpZGRlbjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC52aWV3LWFuaW1hdGUge1xyXG4gICAgICAgICAgcGFkZGluZzoxMHB4O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLnZpZXctYW5pbWF0ZS5uZy1lbnRlciwgLnZpZXctYW5pbWF0ZS5uZy1sZWF2ZSB7XHJcbiAgICAgICAgICB0cmFuc2l0aW9uOmFsbCBjdWJpYy1iZXppZXIoMC4yNTAsIDAuNDYwLCAwLjQ1MCwgMC45NDApIDEuNXM7XHJcblxyXG4gICAgICAgICAgZGlzcGxheTpibG9jaztcclxuICAgICAgICAgIHdpZHRoOjEwMCU7XHJcbiAgICAgICAgICBib3JkZXItbGVmdDoxcHggc29saWQgYmxhY2s7XHJcblxyXG4gICAgICAgICAgcG9zaXRpb246YWJzb2x1dGU7XHJcbiAgICAgICAgICB0b3A6MDtcclxuICAgICAgICAgIGxlZnQ6MDtcclxuICAgICAgICAgIHJpZ2h0OjA7XHJcbiAgICAgICAgICBib3R0b206MDtcclxuICAgICAgICAgIHBhZGRpbmc6MTBweDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC52aWV3LWFuaW1hdGUubmctZW50ZXIge1xyXG4gICAgICAgICAgbGVmdDoxMDAlO1xyXG4gICAgICAgIH1cclxuICAgICAgICAudmlldy1hbmltYXRlLm5nLWVudGVyLm5nLWVudGVyLWFjdGl2ZSB7XHJcbiAgICAgICAgICBsZWZ0OjA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC52aWV3LWFuaW1hdGUubmctbGVhdmUubmctbGVhdmUtYWN0aXZlIHtcclxuICAgICAgICAgIGxlZnQ6LTEwMCU7XHJcbiAgICAgICAgfVxyXG4gICAgICA8L2ZpbGU+XHJcblxyXG4gICAgICA8ZmlsZSBuYW1lPVwic2NyaXB0LmpzXCI+XHJcbiAgICAgICAgYW5ndWxhci5tb2R1bGUoJ25nVmlld0V4YW1wbGUnLCBbJ25nUm91dGUnLCAnbmdBbmltYXRlJ10pXHJcbiAgICAgICAgICAuY29uZmlnKFsnJHJvdXRlUHJvdmlkZXInLCAnJGxvY2F0aW9uUHJvdmlkZXInLFxyXG4gICAgICAgICAgICBmdW5jdGlvbigkcm91dGVQcm92aWRlciwgJGxvY2F0aW9uUHJvdmlkZXIpIHtcclxuICAgICAgICAgICAgICAkcm91dGVQcm92aWRlclxyXG4gICAgICAgICAgICAgICAgLndoZW4oJy9Cb29rLzpib29rSWQnLCB7XHJcbiAgICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnYm9vay5odG1sJyxcclxuICAgICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ0Jvb2tDdHJsJyxcclxuICAgICAgICAgICAgICAgICAgY29udHJvbGxlckFzOiAnYm9vaydcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAud2hlbignL0Jvb2svOmJvb2tJZC9jaC86Y2hhcHRlcklkJywge1xyXG4gICAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ2NoYXB0ZXIuaHRtbCcsXHJcbiAgICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdDaGFwdGVyQ3RybCcsXHJcbiAgICAgICAgICAgICAgICAgIGNvbnRyb2xsZXJBczogJ2NoYXB0ZXInXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgJGxvY2F0aW9uUHJvdmlkZXIuaHRtbDVNb2RlKHRydWUpO1xyXG4gICAgICAgICAgfV0pXHJcbiAgICAgICAgICAuY29udHJvbGxlcignTWFpbkN0cmwnLCBbJyRyb3V0ZScsICckcm91dGVQYXJhbXMnLCAnJGxvY2F0aW9uJyxcclxuICAgICAgICAgICAgZnVuY3Rpb24oJHJvdXRlLCAkcm91dGVQYXJhbXMsICRsb2NhdGlvbikge1xyXG4gICAgICAgICAgICAgIHRoaXMuJHJvdXRlID0gJHJvdXRlO1xyXG4gICAgICAgICAgICAgIHRoaXMuJGxvY2F0aW9uID0gJGxvY2F0aW9uO1xyXG4gICAgICAgICAgICAgIHRoaXMuJHJvdXRlUGFyYW1zID0gJHJvdXRlUGFyYW1zO1xyXG4gICAgICAgICAgfV0pXHJcbiAgICAgICAgICAuY29udHJvbGxlcignQm9va0N0cmwnLCBbJyRyb3V0ZVBhcmFtcycsIGZ1bmN0aW9uKCRyb3V0ZVBhcmFtcykge1xyXG4gICAgICAgICAgICB0aGlzLm5hbWUgPSBcIkJvb2tDdHJsXCI7XHJcbiAgICAgICAgICAgIHRoaXMucGFyYW1zID0gJHJvdXRlUGFyYW1zO1xyXG4gICAgICAgICAgfV0pXHJcbiAgICAgICAgICAuY29udHJvbGxlcignQ2hhcHRlckN0cmwnLCBbJyRyb3V0ZVBhcmFtcycsIGZ1bmN0aW9uKCRyb3V0ZVBhcmFtcykge1xyXG4gICAgICAgICAgICB0aGlzLm5hbWUgPSBcIkNoYXB0ZXJDdHJsXCI7XHJcbiAgICAgICAgICAgIHRoaXMucGFyYW1zID0gJHJvdXRlUGFyYW1zO1xyXG4gICAgICAgICAgfV0pO1xyXG5cclxuICAgICAgPC9maWxlPlxyXG5cclxuICAgICAgPGZpbGUgbmFtZT1cInByb3RyYWN0b3IuanNcIiB0eXBlPVwicHJvdHJhY3RvclwiPlxyXG4gICAgICAgIGl0KCdzaG91bGQgbG9hZCBhbmQgY29tcGlsZSBjb3JyZWN0IHRlbXBsYXRlJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICBlbGVtZW50KGJ5LmxpbmtUZXh0KCdNb2J5OiBDaDEnKSkuY2xpY2soKTtcclxuICAgICAgICAgIHZhciBjb250ZW50ID0gZWxlbWVudChieS5jc3MoJ1tuZy12aWV3XScpKS5nZXRUZXh0KCk7XHJcbiAgICAgICAgICBleHBlY3QoY29udGVudCkudG9NYXRjaCgvY29udHJvbGxlclxcOiBDaGFwdGVyQ3RybC8pO1xyXG4gICAgICAgICAgZXhwZWN0KGNvbnRlbnQpLnRvTWF0Y2goL0Jvb2sgSWRcXDogTW9ieS8pO1xyXG4gICAgICAgICAgZXhwZWN0KGNvbnRlbnQpLnRvTWF0Y2goL0NoYXB0ZXIgSWRcXDogMS8pO1xyXG5cclxuICAgICAgICAgIGVsZW1lbnQoYnkucGFydGlhbExpbmtUZXh0KCdTY2FybGV0JykpLmNsaWNrKCk7XHJcblxyXG4gICAgICAgICAgY29udGVudCA9IGVsZW1lbnQoYnkuY3NzKCdbbmctdmlld10nKSkuZ2V0VGV4dCgpO1xyXG4gICAgICAgICAgZXhwZWN0KGNvbnRlbnQpLnRvTWF0Y2goL2NvbnRyb2xsZXJcXDogQm9va0N0cmwvKTtcclxuICAgICAgICAgIGV4cGVjdChjb250ZW50KS50b01hdGNoKC9Cb29rIElkXFw6IFNjYXJsZXQvKTtcclxuICAgICAgICB9KTtcclxuICAgICAgPC9maWxlPlxyXG4gICAgPC9leGFtcGxlPlxyXG4gKi9cclxuXHJcblxyXG4vKipcclxuICogQG5nZG9jIGV2ZW50XHJcbiAqIEBuYW1lIG5nVmlldyMkdmlld0NvbnRlbnRMb2FkZWRcclxuICogQGV2ZW50VHlwZSBlbWl0IG9uIHRoZSBjdXJyZW50IG5nVmlldyBzY29wZVxyXG4gKiBAZGVzY3JpcHRpb25cclxuICogRW1pdHRlZCBldmVyeSB0aW1lIHRoZSBuZ1ZpZXcgY29udGVudCBpcyByZWxvYWRlZC5cclxuICovXHJcbm5nVmlld0ZhY3RvcnkuJGluamVjdCA9IFsnJHJvdXRlJywgJyRhbmNob3JTY3JvbGwnLCAnJGFuaW1hdGUnXTtcclxuZnVuY3Rpb24gbmdWaWV3RmFjdG9yeSgkcm91dGUsICRhbmNob3JTY3JvbGwsICRhbmltYXRlKSB7XHJcbiAgcmV0dXJuIHtcclxuICAgIHJlc3RyaWN0OiAnRUNBJyxcclxuICAgIHRlcm1pbmFsOiB0cnVlLFxyXG4gICAgcHJpb3JpdHk6IDQwMCxcclxuICAgIHRyYW5zY2x1ZGU6ICdlbGVtZW50JyxcclxuICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCAkZWxlbWVudCwgYXR0ciwgY3RybCwgJHRyYW5zY2x1ZGUpIHtcclxuICAgICAgICB2YXIgY3VycmVudFNjb3BlLFxyXG4gICAgICAgICAgICBjdXJyZW50RWxlbWVudCxcclxuICAgICAgICAgICAgcHJldmlvdXNMZWF2ZUFuaW1hdGlvbixcclxuICAgICAgICAgICAgYXV0b1Njcm9sbEV4cCA9IGF0dHIuYXV0b3Njcm9sbCxcclxuICAgICAgICAgICAgb25sb2FkRXhwID0gYXR0ci5vbmxvYWQgfHwgJyc7XHJcblxyXG4gICAgICAgIHNjb3BlLiRvbignJHJvdXRlQ2hhbmdlU3VjY2VzcycsIHVwZGF0ZSk7XHJcbiAgICAgICAgdXBkYXRlKCk7XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGNsZWFudXBMYXN0VmlldygpIHtcclxuICAgICAgICAgIGlmIChwcmV2aW91c0xlYXZlQW5pbWF0aW9uKSB7XHJcbiAgICAgICAgICAgICRhbmltYXRlLmNhbmNlbChwcmV2aW91c0xlYXZlQW5pbWF0aW9uKTtcclxuICAgICAgICAgICAgcHJldmlvdXNMZWF2ZUFuaW1hdGlvbiA9IG51bGw7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgaWYgKGN1cnJlbnRTY29wZSkge1xyXG4gICAgICAgICAgICBjdXJyZW50U2NvcGUuJGRlc3Ryb3koKTtcclxuICAgICAgICAgICAgY3VycmVudFNjb3BlID0gbnVsbDtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGlmIChjdXJyZW50RWxlbWVudCkge1xyXG4gICAgICAgICAgICBwcmV2aW91c0xlYXZlQW5pbWF0aW9uID0gJGFuaW1hdGUubGVhdmUoY3VycmVudEVsZW1lbnQpO1xyXG4gICAgICAgICAgICBwcmV2aW91c0xlYXZlQW5pbWF0aW9uLnRoZW4oZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgcHJldmlvdXNMZWF2ZUFuaW1hdGlvbiA9IG51bGw7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBjdXJyZW50RWxlbWVudCA9IG51bGw7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiB1cGRhdGUoKSB7XHJcbiAgICAgICAgICB2YXIgbG9jYWxzID0gJHJvdXRlLmN1cnJlbnQgJiYgJHJvdXRlLmN1cnJlbnQubG9jYWxzLFxyXG4gICAgICAgICAgICAgIHRlbXBsYXRlID0gbG9jYWxzICYmIGxvY2Fscy4kdGVtcGxhdGU7XHJcblxyXG4gICAgICAgICAgaWYgKGFuZ3VsYXIuaXNEZWZpbmVkKHRlbXBsYXRlKSkge1xyXG4gICAgICAgICAgICB2YXIgbmV3U2NvcGUgPSBzY29wZS4kbmV3KCk7XHJcbiAgICAgICAgICAgIHZhciBjdXJyZW50ID0gJHJvdXRlLmN1cnJlbnQ7XHJcblxyXG4gICAgICAgICAgICAvLyBOb3RlOiBUaGlzIHdpbGwgYWxzbyBsaW5rIGFsbCBjaGlsZHJlbiBvZiBuZy12aWV3IHRoYXQgd2VyZSBjb250YWluZWQgaW4gdGhlIG9yaWdpbmFsXHJcbiAgICAgICAgICAgIC8vIGh0bWwuIElmIHRoYXQgY29udGVudCBjb250YWlucyBjb250cm9sbGVycywgLi4uIHRoZXkgY291bGQgcG9sbHV0ZS9jaGFuZ2UgdGhlIHNjb3BlLlxyXG4gICAgICAgICAgICAvLyBIb3dldmVyLCB1c2luZyBuZy12aWV3IG9uIGFuIGVsZW1lbnQgd2l0aCBhZGRpdGlvbmFsIGNvbnRlbnQgZG9lcyBub3QgbWFrZSBzZW5zZS4uLlxyXG4gICAgICAgICAgICAvLyBOb3RlOiBXZSBjYW4ndCByZW1vdmUgdGhlbSBpbiB0aGUgY2xvbmVBdHRjaEZuIG9mICR0cmFuc2NsdWRlIGFzIHRoYXRcclxuICAgICAgICAgICAgLy8gZnVuY3Rpb24gaXMgY2FsbGVkIGJlZm9yZSBsaW5raW5nIHRoZSBjb250ZW50LCB3aGljaCB3b3VsZCBhcHBseSBjaGlsZFxyXG4gICAgICAgICAgICAvLyBkaXJlY3RpdmVzIHRvIG5vbiBleGlzdGluZyBlbGVtZW50cy5cclxuICAgICAgICAgICAgdmFyIGNsb25lID0gJHRyYW5zY2x1ZGUobmV3U2NvcGUsIGZ1bmN0aW9uKGNsb25lKSB7XHJcbiAgICAgICAgICAgICAgJGFuaW1hdGUuZW50ZXIoY2xvbmUsIG51bGwsIGN1cnJlbnRFbGVtZW50IHx8ICRlbGVtZW50KS50aGVuKGZ1bmN0aW9uIG9uTmdWaWV3RW50ZXIoKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoYW5ndWxhci5pc0RlZmluZWQoYXV0b1Njcm9sbEV4cClcclxuICAgICAgICAgICAgICAgICAgJiYgKCFhdXRvU2Nyb2xsRXhwIHx8IHNjb3BlLiRldmFsKGF1dG9TY3JvbGxFeHApKSkge1xyXG4gICAgICAgICAgICAgICAgICAkYW5jaG9yU2Nyb2xsKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgY2xlYW51cExhc3RWaWV3KCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgY3VycmVudEVsZW1lbnQgPSBjbG9uZTtcclxuICAgICAgICAgICAgY3VycmVudFNjb3BlID0gY3VycmVudC5zY29wZSA9IG5ld1Njb3BlO1xyXG4gICAgICAgICAgICBjdXJyZW50U2NvcGUuJGVtaXQoJyR2aWV3Q29udGVudExvYWRlZCcpO1xyXG4gICAgICAgICAgICBjdXJyZW50U2NvcGUuJGV2YWwob25sb2FkRXhwKTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNsZWFudXBMYXN0VmlldygpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICB9O1xyXG59XHJcblxyXG4vLyBUaGlzIGRpcmVjdGl2ZSBpcyBjYWxsZWQgZHVyaW5nIHRoZSAkdHJhbnNjbHVkZSBjYWxsIG9mIHRoZSBmaXJzdCBgbmdWaWV3YCBkaXJlY3RpdmUuXHJcbi8vIEl0IHdpbGwgcmVwbGFjZSBhbmQgY29tcGlsZSB0aGUgY29udGVudCBvZiB0aGUgZWxlbWVudCB3aXRoIHRoZSBsb2FkZWQgdGVtcGxhdGUuXHJcbi8vIFdlIG5lZWQgdGhpcyBkaXJlY3RpdmUgc28gdGhhdCB0aGUgZWxlbWVudCBjb250ZW50IGlzIGFscmVhZHkgZmlsbGVkIHdoZW5cclxuLy8gdGhlIGxpbmsgZnVuY3Rpb24gb2YgYW5vdGhlciBkaXJlY3RpdmUgb24gdGhlIHNhbWUgZWxlbWVudCBhcyBuZ1ZpZXdcclxuLy8gaXMgY2FsbGVkLlxyXG5uZ1ZpZXdGaWxsQ29udGVudEZhY3RvcnkuJGluamVjdCA9IFsnJGNvbXBpbGUnLCAnJGNvbnRyb2xsZXInLCAnJHJvdXRlJ107XHJcbmZ1bmN0aW9uIG5nVmlld0ZpbGxDb250ZW50RmFjdG9yeSgkY29tcGlsZSwgJGNvbnRyb2xsZXIsICRyb3V0ZSkge1xyXG4gIHJldHVybiB7XHJcbiAgICByZXN0cmljdDogJ0VDQScsXHJcbiAgICBwcmlvcml0eTogLTQwMCxcclxuICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCAkZWxlbWVudCkge1xyXG4gICAgICB2YXIgY3VycmVudCA9ICRyb3V0ZS5jdXJyZW50LFxyXG4gICAgICAgICAgbG9jYWxzID0gY3VycmVudC5sb2NhbHM7XHJcblxyXG4gICAgICAkZWxlbWVudC5odG1sKGxvY2Fscy4kdGVtcGxhdGUpO1xyXG5cclxuICAgICAgdmFyIGxpbmsgPSAkY29tcGlsZSgkZWxlbWVudC5jb250ZW50cygpKTtcclxuXHJcbiAgICAgIGlmIChjdXJyZW50LmNvbnRyb2xsZXIpIHtcclxuICAgICAgICBsb2NhbHMuJHNjb3BlID0gc2NvcGU7XHJcbiAgICAgICAgdmFyIGNvbnRyb2xsZXIgPSAkY29udHJvbGxlcihjdXJyZW50LmNvbnRyb2xsZXIsIGxvY2Fscyk7XHJcbiAgICAgICAgaWYgKGN1cnJlbnQuY29udHJvbGxlckFzKSB7XHJcbiAgICAgICAgICBzY29wZVtjdXJyZW50LmNvbnRyb2xsZXJBc10gPSBjb250cm9sbGVyO1xyXG4gICAgICAgIH1cclxuICAgICAgICAkZWxlbWVudC5kYXRhKCckbmdDb250cm9sbGVyQ29udHJvbGxlcicsIGNvbnRyb2xsZXIpO1xyXG4gICAgICAgICRlbGVtZW50LmNoaWxkcmVuKCkuZGF0YSgnJG5nQ29udHJvbGxlckNvbnRyb2xsZXInLCBjb250cm9sbGVyKTtcclxuICAgICAgfVxyXG4gICAgICBzY29wZVtjdXJyZW50LnJlc29sdmVBcyB8fCAnJHJlc29sdmUnXSA9IGxvY2FscztcclxuXHJcbiAgICAgIGxpbmsoc2NvcGUpO1xyXG4gICAgfVxyXG4gIH07XHJcbn1cclxuXHJcblxyXG59KSh3aW5kb3csIHdpbmRvdy5hbmd1bGFyKTsiXSwiZmlsZSI6ImFuZ3VsYXItcm91dGUuanMifQ==
