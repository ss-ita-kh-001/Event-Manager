(function() {

    angular.module('em.login').controller('em.login.loginController', loginController);

    function loginController($scope, $location, flashService, userService, $auth) {

        $scope.login = function() {
            $scope.dataLoading = true;

            $auth.login($scope.user)
                .then(function(res) {
                    userService.setUserInfo(res.data.user); //write information about current logged user to userService
                    localStorage.setItem('userId', res.data.user.id);
                    localStorage.setItem('fullName', res.data.user.full_name);
                    $scope.id = localStorage.getItem('userId');
                    $location.path('/me');
                    $scope.classHandler();
                    var getUserEventsPromise = userService.getUserEvents($scope.id);
                    getUserEventsPromise.then(function(res) {
                        angular.forEach(res.data, function(value, key) {
                            localStorage.setItem(value.event, value.event);
                        });
                    }, function(error) {
                        console.log('Error: ' + error);
                    });
                })
                .catch(function(error) {
                    flashService.error('Wrong email or password', false);
                    $scope.dataLoading = false;
                });
        };
        $scope.classHandler();
    }
    loginController.$inject = ["$scope", "$location", "flashService", "userService", "$auth"];
})();
