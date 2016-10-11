(function() {

    angular.module('em.login').controller('em.login.loginController', loginController);

    function loginController($scope, $location, authenticationService, flashService, userService) {

        $scope.login = function() {
            $scope.dataLoading = true;
            authenticationService.logIn($scope.user.email, $scope.user.password, function(response) {
                if (response.success) {

                  //  authenticationService.setCredentials($scope.user.email, $scope.user.password);
                    var user = response;
                    var id = user[i].id;
                    $location.path('/profile/' + id);
                } else {
                    flashService.error(response.message);
                    $scope.dataLoading = false;
                }
            });
        };
        $scope.reset = function() {
            authenticationService.clearCredentials();
        };
    }
})();
