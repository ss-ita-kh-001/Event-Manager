(function() {
    angular.module("em.profile").controller("em.profile.profile-controller", profileController);

    function profileController($scope, userService, $routeParams, $location) {

        userService.getById($routeParams.userID).then(function(res) {
            $scope.user = res[0];
        });
        userService.getUserEvents($routeParams.userID).then(function (res) {
            $scope.events = res.data;
            console.log($scope.events);
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
    }
    profileController.$inject = ["$scope", "userService", "$routeParams", "$location"]
})();
