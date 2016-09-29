(function() {
    angular.module("em.profile").controller("em.profile.profile-controller", profileController);

    function profileController($scope, profileService, $routeParams) {

        $scope.user = profileService.getUserData();
        $scope.updateUserSend = function () {
        	profileService.updateUser($scope.user, $routeParams);
        	$scope.update = true;
        	console.log($scope.update);
        }



    }
    profileController.$inject = ["$scope", "em.profile.profile-service"]
})();
