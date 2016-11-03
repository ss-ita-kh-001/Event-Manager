(function() {
    angular.module("em.profile").controller("em.profile.profile-controller", profileController);

    function profileController($scope, userService, $routeParams, $location, getCurrentUser) {
        if (!userService.getUserInfo()) {
            $scope.user = getCurrentUser[0];
            userService.setUserInfo(getCurrentUser[0]);
        }
        $scope.user = userService.getUserInfo();

        
        // userService.setUserInfo(getCurrentUser);


        // userService.getById($routeParams.userID).then(function(res) {
        //     $scope.user = res[0];
        //     localStorage.setItem('userId', res[0].id);
        //     localStorage.setItem('fullName', res[0].full_name);
        // });
        // userService.getUserEvents($routeParams.userID).then(function(res) {
        //     $scope.events = res.data;
        //     for (var i = 0; i < $scope.events.length; i++) {
        //         $scope.events[i].desc = $scope.events[i].desc.replace(/(<([^>]+)>)/g, "").substring(0, 57) + ($scope.events[i].desc.length > 100 ? "..." : "");
        //     }
        // });
        $scope.updateUserSend = function() {
            userService.update($scope.user);
            $location.path('/me');
        };
        $scope.classHandler();
    }
    profileController.$inject = ["$scope", "userService", "$routeParams", "$location", "getCurrentUser"]
})();
