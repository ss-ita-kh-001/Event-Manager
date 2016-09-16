(function() {
    angular.module("em").config(function($routeProvider, $locationProvider) {
        $locationProvider.html5Mode(true);
        $routeProvider
            .when("/", {
                templateUrl: "./app/features/main/views/main.html",
                controller: "em.main.mainController"
            })
            .when("/user", {
                templateUrl: "./app/features/user/views/index.html"
            })
            .when("/settings", {
                templateUrl: "./app/features/user/views/settings.html"
            })
            .when("/login", {
                templateUrl: "./app/features/login/views/login.html"
            })
            .when("/register", {
                templateUrl: "./app/features/register/views/register.html"
            })
            .when("/event/add", {
                  templateUrl: "./app/features/addEvent/views/addEvent.html"
            })
            .otherwise({
                template: "./app/features/main/views/main.html"
            });
    })
})();
