(function() {
    angular.module("em.profile").controller("em.profile.profile-controller", profileController);

    function profileController($scope, profileService) {
        // $scope.events = profileService.getEventsByUserId();
        $scope.user = profileService.getUserData();
        console.log($scope.user);

    }
    profileController.$inject = ["$scope", "em.profile.profile-service"]
})();
