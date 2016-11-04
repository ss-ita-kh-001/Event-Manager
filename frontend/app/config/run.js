(function() {
    'use strict';

    angular.module('em').run(["$rootScope", "$location", "$cookieStore", "$http", "$window", function($rootScope, $location, $cookieStore, $http, $window) {
        // keep user logged in after page refresh
        $rootScope.globals = $cookieStore.get('globals') || {};
        if ($rootScope.globals.currentUser) {
            $http.defaults.headers.common['Authorization'] = 'Basic ' + $rootScope.globals.currentUser.authdata; // jshint ignore:line
        };
        $rootScope.$resetScope = function() {
            for (var prop in $rootScope) {
                if (prop.substring(0, 1) !== '$') {
                    delete $rootScope[prop];
                }
            }
        }

        $rootScope.cancel = function() {
            $window.history.back();
        }
    }]);
})();
