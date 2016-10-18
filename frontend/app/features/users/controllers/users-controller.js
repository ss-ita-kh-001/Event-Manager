(function() {
    angular.module("em.users").controller("em.users.users-controller", usersController);

    function usersController($scope, userService) {

        userService.getAll().then(function(res) {
            $scope.users = res;
        });
    }
    usersController.$inject = ["$scope", "userService"];

})();
