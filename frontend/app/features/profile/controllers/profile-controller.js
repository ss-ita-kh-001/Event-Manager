(function() {
    angular.module("em.profile").controller("em.profile.profile-controller", profileController);

    function profileController($scope, userService, $routeParams, $location, getCurrentUser, getCurrentUserEvents) {

        // we're going to our profile
        if (!$routeParams.id) {
            // console.log('my profile');

            // get info about current user
            if (!userService.getUserInfo()) {
                userService.setUserInfo(getCurrentUser[0]);
            }
            $scope.user = userService.getUserInfo();
            // get info about current user events
            if (!userService.getCurrentUserEvents()) {
                userService.setCurrentUserEvents(getCurrentUserEvents.data);
            }
            $scope.events = userService.getCurrentUserEvents();

            angular.forEach($scope.events, function(value, key) {
                $scope.events[key].date = $scope.events[key].date.substring(0, 19).replace(/T/, ' ');
                $scope.events[key].desc = $scope.events[key].desc.replace(/(<([^>]+)>)/g, "")
                    .substring(0, 57) + ($scope.events[key].desc.length > 100 ? "..." : "");
            });
        }
        // admin open profile of other user
        else {
            userService.getById($routeParams.id).then(function(data) {
                $scope.user = data[0];
            });

            userService.getProfileEvents($routeParams.id).then(function(data) {
                $scope.events = data.data;
                angular.forEach($scope.events, function(value, key) {
                    $scope.events[key].date = $scope.events[key].date.substring(0, 19).replace(/T/, ' ');
                    $scope.events[key].desc = $scope.events[key].desc.replace(/(<([^>]+)>)/g, "")
                        .substring(0, 57) + ($scope.events[key].desc.length > 100 ? "..." : "");
                });
            });
        }
        $scope.classHandler();

        $scope.updateUserSend = function() {
            userService.update($scope.user);
            $location.path('/me');
        };
    }
    profileController.$inject = ["$scope", "userService", "$routeParams", "$location", "getCurrentUser", "getCurrentUserEvents"]
})();
