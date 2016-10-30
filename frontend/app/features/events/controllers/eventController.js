(function() {
    angular.module("em.events").controller("em.events.eventController", eventController);

    function eventController($scope, $routeParams, eventService, $rootScope, userService, flashService) {

        $scope.isSubscribe;
        $scope.id = $routeParams.id;
        $scope.UserId = localStorage.getItem("userId");
        $scope.SubscribeMessage = 'Subscribe';

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

        $scope.getCurrentUser();

        $scope.getUsersByEvent = function() {
            userService.getUsersByEvent($scope.id)
                .then(function(res) {
                    $scope.userList = res.data;
                }, function(error) {
                    console.log('Error: ' + error);
                });
        }

        $scope.getUsersByEvent();

        var getEventPromise = eventService.getEvent($scope.id);
        getEventPromise.then(function(res) {
                $scope.event = res.data[0];
                $scope.search()
            },
            function(error) {
                console.log('Error: ' + error);
            });


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
        }

        $scope.subscribe = function() {
            eventService.subscribe(Object.assign({
                    event: $scope.id,
                    user: $scope.UserId
                }))
                .then(function(res) {
                    flashService.success(' You have successfully Subscribed to event', true);
                    localStorage.setItem($scope.id, $scope.id);
                }, function(error) {
                    console.log('Error: ' + error);
                });
        }

        $scope.unSubscribe = function() {
            eventService.unsubscribe(Object.assign({
                    event: $scope.id,
                    user: $scope.UserId
                }))
                .then(function(res) {
                    flashService.success('You have Unsubscribed to event', true);
                    localStorage.removeItem($scope.id);
                }, function(error) {
                    console.log('Error: ' + error);
                });
        }


    }
    eventController.$inject = ["$scope", "$routeParams", "em.events.eventService", "$rootScope", "userService", "flashService"]
})();
