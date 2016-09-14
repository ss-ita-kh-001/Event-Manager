(function() {
    angular.module("em").config(function($routeProvider, $locationProvider) {
        $locationProvider.html5Mode(true);
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
            .when("/login", {
                templateUrl: "../features/login/views/login.html"
            })
            .otherwise({
                template: "../features/main/views/main.html"
            });
    })
})();
