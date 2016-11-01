(function() {
    angular.module("em.events").controller("em.events.eventController", eventController);

    function eventController($scope, $location, $routeParams, eventService, $rootScope, userService, flashService, $sce) {

        $scope.showReportTextArea = false;
        $scope.isSubscribe;
        $scope.report;
        $scope.id = $routeParams.id;
        $scope.UserId = localStorage.getItem("userId");
        $scope.SubscribeMessage = 'Subscribe';
        $scope.reportDone = false;


        if (localStorage.getItem($scope.id)) {
            $scope.SubscribeMessage = 'Unsubscribe'
            $scope.isSubscribe = !$scope.isSubscribe;
        }

        $scope.getCurrentUser = function() {
            userService.getById(localStorage.getItem("userId"))
                .then(function(response) {
                    userService.setUserInfo(response[0]);
                    $scope.currentUser = userService.getUserInfo();
                });
        };

        if ($scope.UserId) {
            $scope.getCurrentUser();
        }

        $scope.getUsersByEvent = function() {
            userService.getUsersByEvent($scope.id)
                .then(function(res) {
                    $scope.userList = res.data;
                }, rejected);
        };

        $scope.getUsersByEvent();

        var getEventPromise = eventService.getEvent($scope.id);
        getEventPromise.then(function(res) {
            $scope.event = res.data[0];
            $scope.content = $scope.event.report !== 'null' ? $scope.event.report : $scope.event.desc;
            $scope.search()
        }, rejected);


        $scope.search = function() {
            $scope.apiError = false;
            $rootScope.search($scope.event.place)
                .then(function(res) { // success
                        $rootScope.addMarker(res);
                    },
                    function(status) { // error
                        $scope.apiError = true;
                        $scope.apiStatus = status;
                    }
                );
        };

        $scope.goEvent = function() {
            $scope.isSubscribe = !$scope.isSubscribe;
            $scope.getUsersByEvent()
            if ($scope.isSubscribe) {
                $scope.SubscribeMessage = 'Unsubscribe';
                $scope.subscribe();
            } else {
                $scope.SubscribeMessage = 'Subscribe'
                $scope.unSubscribe();
            }
        };

        $scope.subscribe = function() {
            eventService.subscribe(Object.assign({
                    event: $scope.id,
                    user: $scope.UserId
                }))
                .then(function(res) {
                    flashService.success(' You have successfully Subscribed to event', true);
                    localStorage.setItem($scope.id, $scope.id);
                }, rejected);
            $scope.sendMessage();
        };

        $scope.unSubscribe = function() {
            eventService.unsubscribe(Object.assign({
                    event: $scope.id,
                    user: $scope.UserId
                }))
                .then(function(res) {
                    flashService.success('You have Unsubscribed to event', true);
                    localStorage.removeItem($scope.id);
                }, rejected);
            $scope.sendMessage();
        };

        $scope.sendMessage = function(event) {
            userService.getById(localStorage.getItem("userId"))
                .then(function(response) {
                    userService.setUserInfo(response[0]);
                    $scope.message = {
                        user: userService.getUserInfo(),
                        event: {
                            title: $scope.event.title,
                            status: $scope.SubscribeMessage,
                            date: moment($scope.event.date).format("YYYY-MM-DD"),
                            place: $scope.event.place
                        },
                        link: $location.absUrl()
                    }
                    if (!$scope.isSubscribe) {
                        $scope.sendMessageToSubscribe()
                    } else {
                        $scope.sendMessageToUnSubscribe()
                    }
                }, rejected);

        };

        $scope.sendMessageToSubscribe = function() {
            eventService.sendInvitationToSubscribe($scope.message).then(function(response) {
                // TODO: add user notification about success
            }, rejected);
        };

        $scope.sendMessageToUnSubscribe = function() {
            eventService.sendInvitationToUnSubscribe($scope.message).then(function(response) {
                // TODO: add user notification about success
            }, rejected);
        };

        function rejected(error) {
            console.log('Error: ' + error.data.status);
        }

        $scope.reportButton = function() {
            return $scope.event ? ((new Date(moment($scope.event.date).year(), moment($scope.event.date).month(), moment($scope.event.date).date()) < new Date()) && ($scope.event.report === "null")) : false;
        };
        $scope.submitReport = function() {
            $scope.showReportTextArea = false;
            $scope.reportDone = true;
            eventService.sendReport({
                makeReport: $scope.makeReport,
                id: $scope.id
            }).then(function(response) {
                // TODO: add user notification about success
                $scope.content = $scope.makeReport;
            }, rejected);
        };

    }
    eventController.$inject = ["$scope", "$location", "$routeParams", "em.events.eventService", "$rootScope", "userService", "flashService", "$sce"];
})();
