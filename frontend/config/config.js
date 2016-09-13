(function() {
    angular.module("em").config(function($routeProvider, $locationProvider) {
        $locationProvider.html5Mode(false);
        $routeProvider
            .when("/", {
                templateUrl: "../features/main/views/main.html",
                controller: "em.main.mainController"
            })
            .when("/user", {
                templateUrl: "../features/user/views/index.html"
            })
            .when("/settings", {
                templateUrl: "../features/user/views/settings.html"
            })
            .otherwise({
                template: "../features/main/views/main.html"
            });
    })
})();
