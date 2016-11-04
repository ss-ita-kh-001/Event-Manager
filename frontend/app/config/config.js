(function() {
    angular.module("em").config(["$routeProvider", "$locationProvider", "$authProvider", function($routeProvider, $locationProvider, $authProvider) {
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
                templateUrl: "./app/features/profile/views/profile.html",
                controller: "em.profile.profile-controller",
                resolve: {
                    loginRequired: loginRequired
                }
            })
            .when("/users", {
                templateUrl: "./app/features/users/views/users.html",
                controller: "em.users.users-controller",
                resolve: {
                    loginRequired: loginRequired,
                    getUsers: ["userService", function(userService) {
                        return userService.getUsers(1);
                    }]
                }
            })
            .when("/profile/:userID/settings", {
                templateUrl: "./app/features/profile/views/settings.html",
                controller: "em.profile.profile-controller",
                resolve: {
                    loginRequired: loginRequired
                }
            })
            .when("/chat", {
                templateUrl: "./app/features/chat/views/chat.html",
                controller: "em.chat.chatController",
                resolve: {
                    loginRequired: loginRequired
                }
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
                controller: "em.events.event-list-controller",
                resolve: {
                    getEvents: ["em.events.event-list-service", function(itemEventService) {
                        return itemEventService.getEvents(1);
                    }]
                }
            })
            .when('/events/:id', {
                templateUrl: './app/features/events/views/event.html',
                controller: "em.events.eventController"
            })
            .when("/events/:id/edit", {
                templateUrl: "./app/features/addEvent/views/addEvent.html",
                controller: "em.addEvent.addEventController",
                mode: 'edit',
                resolve: {
                    loginRequired: loginRequired
                }
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
            .when("/event/add", {
                templateUrl: "./app/features/addEvent/views/addEvent.html",
                controller: "em.addEvent.addEventController",
                mode: 'add',
                resolve: {
                    loginRequired: loginRequired
                }
            })
            .otherwise({
                templateUrl: "./app/features/main/views/main.html"
            });

    }]);
})();
