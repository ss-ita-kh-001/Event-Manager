(function() {
    angular.module("em.profile").service("em.profile.profile-service", profileService);

    function profileService($routeParams) {
        var users = JSON.parse(localStorage.users);
        // get current user from db
        this.getUserData = function() {
            var users = JSON.parse(localStorage.users);
            var index;
            angular.forEach(users, function(value, key) {
                if (value.id == $routeParams.userID) {
                    index = key;
                }
            });
            return users[index];
        }

        this.updateUser = function(user, $routeParams) {
            var users = JSON.parse(localStorage.users);

            console.log('user');

        }

    }

    profileService.$inject = ["$routeParams"]
})();
