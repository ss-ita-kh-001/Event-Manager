(function() {
    angular.module("em.users").service("em.users.users-service", usersService);

    function usersService() {
        this.getUsers = function() {
            return JSON.parse(localStorage.users);
        }
    }
})();
