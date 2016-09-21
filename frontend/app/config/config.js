(function() {
    angular.module("em").config(function($routeProvider, $locationProvider) {
        $locationProvider.html5Mode(true);
        $routeProvider
            .when("/", {
                templateUrl: "./app/features/main/views/main.html",
                controller: "em.main.mainController"
            })
            .when("/profile/:userID", {
              templateUrl: function($routeParams) {
                  return "./app/features/profile/views/profile.html";
              },
              controller: "em.profile.profile-controller"
            })
            .when("/users", {
                templateUrl: "./app/features/users/views/users.html",
                controller: "em.users.users-controller"
            })
            .when("/settings", {
                templateUrl: "./app/features/profile/views/settings.html"
            })
            .when("/login", {
                templateUrl: "./app/features/login/views/login.html"
            })
            .when("/register", {
                templateUrl: "./app/features/register/views/register.html",
            })
            .when("/events", {
                templateUrl: "./app/features/events/views/event-list.html",
                controller: "em.events.event-list-controller"
            })
            .when('/events/:id', {
                templateUrl: function($routeParams) {
                    return './app/features/events/views/event.html';
                },
                controller: "em.events.eventController"
            })
            .when("/event/add", {
                templateUrl: "./app/features/addEvent/views/addEvent.html",
                controller: "em.addEvent.addEventController"
            })
            .when("/events/:id/edit", {
                templateUrl: "./app/features/editEvent/views/editEvent.html",
                controller: "em.editEvent.editEventController"
            })
            .when("/results", {
                templateUrl: "./app/features/result-table/views/result-table.html",
                controller: "em.result-table.chessResultController"
            })
            .otherwise({
                template: "./app/features/main/views/main.html"
            });
    })
})();
