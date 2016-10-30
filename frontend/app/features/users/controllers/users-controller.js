(function() {
    angular.module("em.users").controller("em.users.users-controller", usersController);

    function usersController($scope, $rootScope, userService, users) {
    	// 
        $scope.users = $rootScope.allUsers;

        // run on click button 'Load more users'
        $scope.getUsers = function() {
            userService.getUsers($rootScope.usersIndex).then(function(res) {
                // check available users
                if (res.length < 10) {
                	$scope.noUsers = true
                }

                $rootScope.allUsers = $rootScope.allUsers.concat(res);
                $scope.users = $rootScope.allUsers;
                $rootScope.usersIndex += $rootScope.itemsPerPage + 1;
            });
        }
    }
    usersController.$inject = ["$scope", "$rootScope", "userService"];

})();
