(function() {
    angular.module("em").controller("em.navnavbarController", navnavbarController);

    function navnavbarController($scope) {
        $scope.prev = document.querySelector(".active");
        $scope.activate = function(event) {
            $scope.prev.classList.remove("active");
            $scope.prev = event.target.parentNode;
            $scope.prev.classList.add("active");
            $scope.isCollapsed = !$scope.isCollapsed
        }
    }
    navnavbarController.$inject = ["$scope"];
})();
