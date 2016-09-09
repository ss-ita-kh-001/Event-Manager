(function() {
    angular.module("em").config(function($stateProvider) {
        $locationProvider.html5Mode(false);
        $routeProvider
            .state("/main", {
                template: "../features/main/views/main.html",
                controller: function() {}
            })
            .otherwise({
                template: "../features/main/views/main.html"
            });
    })
})()
