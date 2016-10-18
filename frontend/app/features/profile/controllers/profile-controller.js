(function() {
    angular.module("em.profile").controller("em.profile.profile-controller", profileController);

    function profileController($scope, userService, $routeParams, $location) {

        userService.getById($routeParams.userID).then(function(res) {
            $scope.user = res[0];
        });
        userService.getUserEvents($routeParams.userID).then(function(res) {
            $scope.events = res.data;
        });
        $scope.updateUserSend = function() {
            var user = $scope.user;
            var token = localStorage.getItem('satellizer_token');

            if (token) {
                user.token = token;
            } else {
                $location.path('/');
                $scope.user = {};
                localStorage.clear();
            }
            userService.update(user);
        };
        $scope.classHandler();
        //    $location.path('/profile/' + user.id);
    }
    profileController.$inject = ["$scope", "userService", "$routeParams", "$location"]
})();
