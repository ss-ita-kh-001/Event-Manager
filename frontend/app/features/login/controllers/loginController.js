(function() {

    angular.module('em.login').controller('em.login.loginController', loginController);

    function loginController($scope, $location, authenticationService, flashService, userService) {

        $scope.login = function() {
            $scope.dataLoading = true;

            userService.authentication($scope.user.email, $scope.user.password).then(function(res) {
                localStorage.setItem('xxx', res.token);
                console.log(res);
            }).catch(function() {
                console.log(error);
            });

        };
        $scope.reset = function() {
            authenticationService.clearCredentials();
        };
    }
})();
