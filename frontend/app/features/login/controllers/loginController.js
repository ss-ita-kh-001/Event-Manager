(function() {

    angular.module('em.login').controller('em.login.loginController', loginController);

    function loginController($scope, $location, authenticationService, flashService, userService, $auth) {

        $scope.login = function() {
            $scope.dataLoading = true;
            $auth.login($scope.user)
                .then(function(res) {
                    console.log('You have logged in');
                    console.log(res);
                    $location.path('/profile/me');
                })
                .catch(function(error) {
                    flashService.error('Wrong email or password', false);
                    $scope.dataLoading = false;
                });

          //  userService.authentication($scope.user);
        };
        $scope.reset = function() {
            authenticationService.clearCredentials();
        };
    }
})();
