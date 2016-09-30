(function() {
    angular.module("em.users").service("em.users.users-service", usersService);

    function usersService() {
        this.getUsers = function() {
            var users = localStorage.getItem("users");
            if (users) {
                return JSON.parse(users);
            } else {
                return false;
            }

        }
    }
})();
