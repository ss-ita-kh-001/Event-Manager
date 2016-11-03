(function() {
    angular.module("em.profile").controller("em.profile.profile-controller", profileController);

    function profileController($scope, userService, $routeParams, $location, getCurrentUser, getCurrentUserEvents) {

        if (!userService.getUserInfo()) {
            userService.setUserInfo(getCurrentUser[0]);
        }
        $scope.user = userService.getUserInfo();

        if (!userService.getCurrentUserEvents()) {
            userService.setCurrentUserEvents(getCurrentUserEvents.data);
        }
        $scope.events = userService.getCurrentUserEvents();

        // console.log($scope.events);

        $scope.updateUserSend = function() {
            userService.update($scope.user);
            $location.path('/me');
        };
        // $scope.classHandler();
    }
    profileController.$inject = ["$scope", "userService", "$routeParams", "$location", "getCurrentUser", "getCurrentUserEvents"]
})();
