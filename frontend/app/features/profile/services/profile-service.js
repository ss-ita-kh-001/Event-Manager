(function() {
    angular.module("em.profile").service("em.profile.profile-service", profileService);

    function profileService($routeParams) {
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

    }
    profileService.$inject = ["$routeParams"]
})();
