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
                    $location.path('/profile/' + $scope.id);
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
        $scope.authenticate = function(provider) {
            console.log('start auth');
            $auth.authenticate(provider)
                .then(function() {
                    console.log('sucessssss');
                    flashService.success('You have successfully signed in with ' + provider + '!', true);
                  //  localStorage.setItem('userId', res.data.user.id);
                    console.log(data);
                    $scope.id = localStorage.getItem('userId');
                    $scope.id = 60;
                    $location.path('/profile/' + $scope.id);
                })
                .catch(function(error) {
                    console.log('failure');
                    if (error.message) {
                        // Satellizer promise reject error.
                        flashService.error('Satellizer promise reject error', false);
                    } else if (error.data) {
                        // HTTP response error from server
                        flashService.error('HTTP response error from server', false);
                    } else {
                        flashService.error('Error');
                    }
                });
        };
        $scope.classHandler();
    }
})();
