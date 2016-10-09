(function() {

    angular.module('em.login').controller('em.login.loginController', loginController);

    function loginController($scope, $location, authenticationService, flashService) {

        $scope.login = function() {
            $scope.dataLoading = true;
            authenticationService.logIn($scope.user.email, $scope.user.password, function(response) {
                if (response.success) {
                    authenticationService.setCredentials($scope.user.email, $scope.user.password);
                    var users = JSON.parse(localStorage.users);
                    var id;
                    for (var i = 0; i < users.length; i++) {
                        if (users[i].email == $scope.user.email) {
                            id = users[i].id;
                        }
                    }
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
