(function() {
    angular.module("em").config(function($routeProvider, $locationProvider, localStorageServiceProvider) {
        $locationProvider.html5Mode(true);
        // localStorageServiceProvider.setPrefix('em');
        $routeProvider
            .when("/", {
                templateUrl: "./app/features/main/views/main.html",
                controller: "em.main.mainController"
            })
            .when("/profile/:userID", {
                templateUrl: function($routeParams, localStorageService) {
                    return "./app/features/profile/views/profile.html";
                },
                controller: "em.profile.profile-controller"
            })
            .when("/users", {
                templateUrl: "./app/features/users/views/users.html",
                controller: "em.users.users-controller"
            })
            .when("/profile/:userID/settings", {
                templateUrl: function($routeParams) {
                    return "./app/features/profile/views/settings.html";
                },
                controller: "em.profile.profile-controller"
            })
            .when("/chat", {
                templateUrl: "./app/features/chat/views/chat.html",
                controller: "em.chat.chatController"
            })
            .when("/login", {
                templateUrl: "./app/features/login/views/login.html",
                controller: "em.login.loginController",
                controllerAs: 'vm'
            })
            .when("/register", {
                templateUrl: "./app/features/register/views/register.html",
                controller: "em.register.registerController",
                controllerAs: 'vm'
            })
            .when("/events", {
                templateUrl: "./app/features/events/views/event-list.html",
                controller: "em.events.add-item-event-controller"
            })
            .when('/events/:id', {
                templateUrl: './app/features/events/views/event.html',
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
                templateUrl: "./app/features/main/views/main.html"
            });

    })
})();
