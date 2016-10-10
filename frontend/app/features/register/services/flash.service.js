
(function() {
    'use strict';

    angular.module('em').factory('flashService', flashService);

    flashService.$inject = ['$rootScope'];

    function flashService($rootScope) {
        var service = {};

        service.success = function(message, keepAfterLocationChange) {
            $rootScope.flash = {
                message: message,
                type: 'success',
                keepAfterLocationChange: keepAfterLocationChange
            };
        };
        service.error = function(message, keepAfterLocationChange) {
            $rootScope.flash = {
                message: message,
                type: 'error',
                keepAfterLocationChange: keepAfterLocationChange
            };
        };
        service.clearFlashMessage = function() {
            var flash = $rootScope.flash;
            if (flash) {
                if (!flash.keepAfterLocationChange) {
                    delete $rootScope.flash;
                } else {
                    // only keep for a single location change
                    flash.keepAfterLocationChange = false;
                }
            }
        }
        return service;
    }
})();
