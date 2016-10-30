(function() {
    angular.module("em.users").controller("em.users.users-controller", usersController);

    function usersController($scope, $rootScope, userService, getUsers) {
        // default upload
        // if (true) {}
        if ($rootScope.allUsers < getUsers) {
            $rootScope.allUsers = getUsers;
        }
        $scope.users = $rootScope.allUsers;

        // run on click button 'Load more users'
        $scope.getUsers = function() {

            userService.getUsers($rootScope.usersIndex).then(function(res) {
                // check available users
                if (res.length < 10) {
                    $scope.noUsers = true
                }
                // concat response from server with local data
                $rootScope.allUsers = $rootScope.allUsers.concat(res);
                $scope.users = $rootScope.allUsers;
                // increase index for future requests
                $rootScope.usersIndex += +$rootScope.itemsPerPage + 1;
            });
        }
    }
    usersController.$inject = ["$scope", "$rootScope", "userService", "getUsers"];

})();
