(function() {
    'use strict';

    angular.module('em').run(function($rootScope, $location, $cookieStore, $http, $window) {
        // keep user logged in after page refresh
        $rootScope.globals = $cookieStore.get('globals') || {};
        if ($rootScope.globals.currentUser) {
            $http.defaults.headers.common['Authorization'] = 'Basic ' + $rootScope.globals.currentUser.authdata; // jshint ignore:line
        };

        $rootScope.cancel = function(){
            $window.history.back();
        }
    })
})();
