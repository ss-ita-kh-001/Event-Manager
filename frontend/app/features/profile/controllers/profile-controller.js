(function() {
    angular.module("em.profile").controller("em.profile.profile-controller", profileController);

    function profileController($scope, profileService, localStorageService, $routeParams) {

        $scope.user = profileService.getUserData();

        // variant 2
        var btn = document.getElementById("updateUser");
        btn.onclick = console.log('user');

    }
    profileController.$inject = ["$scope", "em.profile.profile-service"]
})();
