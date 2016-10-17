;
(function() {
    var li = document.querySelectorAll("li");
    for (var i = 0; i < li.length; i++) {
        li[i].onclick = function(event) {
            for (var i = 0; i < li.length; i++) {
                li[i].className = "";
            }
            event.target.parentNode.className = "active";
        }
    }
})();

(function() {
    angular.module("em").controller("em.navbarController", navbarController);

    function navbarController($scope) {
        $scope.isCollapsed = false;
    }
    navbarController.$inject = ["$scope"];
})();
