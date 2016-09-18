(function() {
    angular.module("em.users-table").controller("em.users-table.users-table-controller", usersTableController);

    function usersTableController($scope, usersTableService) {
        $scope.users = usersTableService.getUser();
        console.log($scope.users);

    }
    usersTableController.$inject = ["$scope", "em.users-table.users-table-service"];
})();
