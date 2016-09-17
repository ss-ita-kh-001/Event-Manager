(function() {
    angular.module("em.profile").controller("em.profile.profile-controller", profileController);

    function profileController($scope, profileService) {
        $scope.events = profileService.getEventsByUserId();
        console.log($scope.events);

        $scope.toggle = function() {
            $scope.isVisible = !$scope.isVisible;
        }
    }
    profileController.$inject = ["$scope", "em.profile.profile-service"]
})();
