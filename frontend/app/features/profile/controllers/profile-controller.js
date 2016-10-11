(function() {
    angular.module("em.profile").controller("em.profile.profile-controller", profileController);

    function profileController($scope, userService, $routeParams) {

        userService.getById($routeParams.userID).then(function(res) {
            $scope.user = res[0];
        });
        $scope.updateUserSend = function () {
            console.log('click');
            var user = $scope.user;
            userService.update(user);
            // body...
        }

    }
    profileController.$inject = ["$scope", "userService", "$routeParams"]
})();
