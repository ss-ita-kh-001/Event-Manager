(function() {
    angular.module("em.users").controller("em.users.users-controller", usersController);

    function usersController($scope, $rootScope, userService, getUsers) {
        if ($rootScope.allUsers.length === 0) {
            $rootScope.allUsers = getUsers.data;
            $rootScope.usersIndex = getUsers.index;
        }
        
        $scope.users = $rootScope.allUsers;

        // by default
        $scope.haveHistory = true;

        // run on click button 'Load more users'
        $scope.getUsers = function() {
            userService.getUsers($rootScope.usersIndex).then(function(response) {
                $scope.haveHistory = response.haveHistory;
                $rootScope.usersIndex = response.index;

                if (response.data.length > 0) {
                    $rootScope.allUsers = $rootScope.allUsers.concat(response.data);
                }
                $scope.users = $rootScope.allUsers;
            });
        }
    }
    usersController.$inject = ["$scope", "$rootScope", "userService", "getUsers"];

})();
