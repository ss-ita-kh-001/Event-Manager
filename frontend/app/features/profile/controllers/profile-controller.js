(function() {
    angular.module("em.profile").controller("em.profile.profile-controller", profileController);

    function profileController($scope, userService, $routeParams, $location) {

        userService.getById($routeParams.userID).then(function(res) {
            $scope.user = res[0];
            localStorage.setItem('userId', res[0].id);
            localStorage.setItem('fullName', res[0].full_name);
        });
        userService.getUserEvents($routeParams.userID).then(function(res) {
            $scope.events = res.data;
            for (var i = 0; i < $scope.events.length; i++) {
                $scope.events[i].desc = $scope.events[i].desc.replace(/(<([^>]+)>)/g, "").substring(0, 57) + ($scope.events[i].desc.length > 100 ? "..." : "");
            }
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
            $location.path('/profile/' + user.id);
        };
        $scope.classHandler();
    }
    profileController.$inject = ["$scope", "userService", "$routeParams", "$location"]
})();
