(function() {
    angular.module("em").controller("em.navbarController", navbarController);

    function navbarController($scope) {
        $scope.activate = function(event) {
            console.log("event");
        }
    }

    navbarController.$inject = ["$scope"];
})();
