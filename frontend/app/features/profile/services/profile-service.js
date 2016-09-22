(function() {
    angular.module("em.profile").service("em.profile.profile-service", profileService);

    function profileService($routeParams) {
        // get current user from db

        this.getUserData = function() {
            // console.log(JSON.parse(localStorage.users));
            var users = JSON.parse(localStorage.users);
            var index;
            angular.forEach(users, function(value, key) {

                if (value.id == $routeParams.userID) {
                    index = key;
                }

            });
            return users[index];

        }
        this.updateUserData = function() {

        }
    }
    profileService.$inject = ["$routeParams"]
})();
