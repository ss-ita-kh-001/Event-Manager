(function() {
    angular.module("em.users").controller("em.users.users-controller", usersController);

    function usersController($scope, $rootScope, userService, getUsers, getCurrentUser) {
        // get info about all users
        if (!userService.getUsersInfo()) {
            $rootScope.allUsers = getUsers.data;
            $rootScope.usersIndex = getUsers.index;
        }
        $scope.users = userService.getUsersInfo();

        // get info about current logged in user
        if (!userService.getUserInfo()) {
            userService.setUserInfo(getCurrentUser[0]);
        }
        $scope.user = userService.getUserInfo();

        // by default
        $scope.haveHistory = true;

        // run on click button 'Load more users'
        $scope.getMoreUsers = function() {
            userService.getUsers($rootScope.usersIndex).then(function(response) {
                $scope.haveHistory = response.haveHistory;
                $rootScope.usersIndex = response.index;
                console.log('$rootScope.usersIndex after load more', $rootScope.usersIndex);

                if (response.data.length > 0) {
                    $rootScope.allUsers = $rootScope.allUsers.concat(response.data);
                }
                $scope.users = $rootScope.allUsers;
            });
        }
    }
    usersController.$inject = ["$scope", "$rootScope", "userService", "getUsers", "getCurrentUser"];

})();
