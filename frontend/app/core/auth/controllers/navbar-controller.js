(function() {

      angular.module('em').controller('em.navbarController', navbarController);

    function navbarController($scope, $auth) {
        $scope.isAuthenticated = function() {
            return $auth.isAuthenticated();
        };
    }
})();
