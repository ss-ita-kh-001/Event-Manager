(function() {
    angular.module("em").config(function($routeProvider, $locationProvider, $authProvider) {
        $locationProvider.html5Mode(true);
        /**
         * Helper auth functions
         */
        var skipIfLoggedIn = ['$q', '$auth', function($q, $auth) {
            var deferred = $q.defer();
            if ($auth.isAuthenticated()) {
                deferred.reject();
            } else {
                deferred.resolve();
            }
            return deferred.promise;
        }];

        var loginRequired = ['$q', '$location', '$auth', function($q, $location, $auth) {
            var deferred = $q.defer();
            if ($auth.isAuthenticated()) {
                deferred.resolve();
            } else {
                $location.path('/login');
            }
            return deferred.promise;
        }];

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
                resolve: {
                    skipIfLoggedIn: skipIfLoggedIn
                }
            })
            .when("/logout", {
                templateUrl: "./app/features/login/views/login.html",
                controller: "em.logoutController"
            })
            .when("/forgot", {
                templateUrl: "./app/features/forgot/views/forgot.html",
                controller: "em.forgot.forgotController"
            })
            .when("/reset/:token", {
                templateUrl: "./app/features/reset/views/reset.html",
                controller: "em.reset.resetController"
            })
            .when("/register", {
                templateUrl: "./app/features/register/views/register.html",
                controller: "em.register.registerController",
                resolve: {
                    skipIfLoggedIn: skipIfLoggedIn
                }
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
                controller: "em.result-table.chessResultController",
                resolve: {
                    games: ["em.result-table.result-table-service", function(resultService) {
                        return resultService.getEventsGames();
                    }],
                    gamesForUsers: ["em.result-table.result-table-service", function(resultService) {
                        return resultService.getGamesForUsers();
                    }],
                    players: ["em.result-table.result-table-service", function(resultService) {
                        return resultService.getAllPlayers();
                    }]
                }
            })
            .when("/event/add/v02", {
                templateUrl: "./app/features/addEventV02/views/addEvent.html",
                controller: "em.addEvent.v02.addEventController"
            })
            .otherwise({
                templateUrl: "./app/features/main/views/main.html"
            });

    })
})();
