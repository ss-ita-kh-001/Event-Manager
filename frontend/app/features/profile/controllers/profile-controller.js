(function() {
    angular.module("em.profile").controller("em.profile.profile-controller", profileController);

    function profileController($scope, profileService, localStorageService) {
        // $scope.events = profileService.getEventsByUserId();
        $scope.user = profileService.getUserData();

    }
    profileController.$inject = ["$scope", "em.profile.profile-service"]
})();
