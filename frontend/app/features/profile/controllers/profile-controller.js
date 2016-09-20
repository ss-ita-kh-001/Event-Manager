(function() {
    angular.module("em.profile").controller("em.profile.profile-controller", profileController);

    function profileController($scope, profileService) {
        $scope.events = profileService.getEventsByUserId();

    }
    profileController.$inject = ["$scope", "em.profile.profile-service"]
})();
