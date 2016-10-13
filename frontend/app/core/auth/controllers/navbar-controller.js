(function() {

      angular.module('em').controller('em.navbarController', navbarController);

    function navbarController($scope, $auth) {
        $scope.id = localStorage.getItem("userId");
        $scope.isAuthenticated = function() {
            return $auth.isAuthenticated();
        };
    }
})();
