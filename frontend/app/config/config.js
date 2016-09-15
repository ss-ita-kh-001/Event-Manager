(function() {
    angular.module("em").config(function($routeProvider, $locationProvider) {
        $locationProvider.html5Mode(true);
        $routeProvider
            .when("/", {
                templateUrl: "./app/features/main/views/main.html",
                controller: "em.main.mainController"
            })
            .when("/profile", {
                templateUrl: "./app/features/profile/views/index.html"
            })
            .when("/users", {
                templateUrl: "./app/features/users-table/views/index.html"
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
            .otherwise({
                template: "./app/features/main/views/main.html"
            });
    })
})();
