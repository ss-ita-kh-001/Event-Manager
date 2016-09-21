(function() {
    angular.module("em.profile").service("em.profile.profile-service", profileService);

    function profileService($routeParams) {
        // $scope.path = $routeParams.userID;

        // this.getEventsByUserId = function() {
        //     return events;
        // }
        // this.updateEventSubscribe = function($scope, state) {
        //         angular.forEach(users, function(users, path) {
        //             if (users.id == $scope.path) {
        //                 users.isSubscribe = state;
        //             }
        //         });
        //     }
        // wrtite users to localStorageService

        // get current user from db

        this.getUserData = function() {
            // console.log(JSON.parse(localStorage.users));
            var users = JSON.parse(localStorage.users);
            var index;
            angular.forEach(users, function(value, key) {
              console.log('users.us');

                if (value.id == $routeParams.userID) {
                    index = key;
                }

            });
            return users[index];

        }
    }
    profileService.$inject = ["$routeParams"]
})();
