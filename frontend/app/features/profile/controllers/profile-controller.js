(function() {
    angular.module("em.profile").controller("em.profile.profile-controller", profileController);

    function profileController($scope, userService, $routeParams, $location, getCurrentUser, getCurrentUserEvents) {

        // we're going to our profile
        if (!$routeParams.id) {
            console.log('my profile');

            // get info about current user
            if (!userService.getUserInfo()) {
                userService.setUserInfo(getCurrentUser[0]);
            }
            $scope.user = userService.getUserInfo();
            // get info about current user events
            if (!userService.getCurrentUserEvents()) {
                userService.setCurrentUserEvents(getCurrentUserEvents.data);
            }
            var events = userService.getCurrentUserEvents();

            angular.forEach(events, function(value, key) {
                events[key].date = events[key].date.substring(0, 19).replace(/T/, ' ');
            });

            $scope.events = events;
        }
        // admin open profile of other user
        else {
            console.log('profile of other user');
            console.log($routeParams.id);
            userService.getById($routeParams.id).then(function (data) {
                $scope.user = data[0];
            });
            
            userService.getProfileEvents($routeParams.id).then(function (data) {
                $scope.events = data.data;
            });
            
            
        }
        // $scope.classHandler();

        $scope.updateUserSend = function() {
            userService.update($scope.user);
            $location.path('/me');
        };
    }
    profileController.$inject = ["$scope", "userService", "$routeParams", "$location", "getCurrentUser", "getCurrentUserEvents"]
})();
