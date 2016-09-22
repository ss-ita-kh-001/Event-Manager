(function() {
    angular.module("em.profile").service("em.profile.profile-service", profileService);

    function profileService($routeParams) {

        // get current user from db
        this.getUserData = function() {
            var users = JSON.parse(localStorage.getItem("users"));
            var index;
            angular.forEach(users, function(value, key) {
                if (value.id == $routeParams.userID) {
                    index = key;
                }
            });
            return users[index];
        }

        this.updateUser = function(user, $routeParams) {
            var users = JSON.parse(localStorage.getItem("users"));

            angular.forEach(users, function(value, key) {
                if (value.id == user.id) {
                    value.username = user.username;
                    value.email = user.email;
                    
                }
                localStorage.setItem("users", JSON.stringify(users))
                
            });

        }

    }

    profileService.$inject = ["$routeParams"]
})();
