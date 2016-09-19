(function() {
    angular.module("em.users").service("em.users.users-service", usersService);

    function usersService(users) {
        this.getUser = function() {
            return users;
        }
    }
    usersService.$inject = ["em.users.users"]
})();
