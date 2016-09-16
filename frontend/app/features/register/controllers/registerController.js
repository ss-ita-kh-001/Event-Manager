(function() {
    'use strict';

    angular.module('em.register').controller('em.register.registerController', registerController);

    function registerController($scope) {
        $scope.signup = function() {
            console.log('Sign up');
        }
    }
    registerController.$inject = ["$scope"];
})();
