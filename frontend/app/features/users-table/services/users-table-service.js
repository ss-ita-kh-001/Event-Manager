(function() {
    angular.module("em.users-table").service("em.users-table.users-table-service", usersTableService);

    function usersTableService(users) {
        this.getUser = function() {
            return users;
        }
    }
    usersTableService.$inject = ["em.users-table.users"]
})();
