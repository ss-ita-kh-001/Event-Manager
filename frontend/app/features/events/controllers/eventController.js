(function() {
    angular.module("em.events").controller("em.events.eventController", eventController);

    function eventController($scope, $routeParams, eventService, $rootScope, userService) {

        $scope.isSubscribe;
        $scope.id = $routeParams.id;
        $scope.UserId = localStorage.getItem("userId");

        if (localStorage.getItem($scope.id)) {
            $scope.isSubscribe = true;
        }

        var getEventPromise = eventService.getEvent($scope.id);
        getEventPromise.then(function(res) {
            $scope.event = res.data[0];
            $scope.search()
        }, function(error) {
            console.log('Error: ' + error);
        });

        var getUserEventsPromise = eventService.getUserEvents($scope.UserId);
        getUserEventsPromise.then(function(res) {
            angular.forEach(res.data, function(value, key) {
                localStorage.setItem(value.event, value.event);
            });
        }, function(error) {
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

        $scope.subscribe = function() {
            eventService.subscribe(Object.assign({
                    event: $scope.id,
                    user: $scope.UserId
                }))
                .then(function(res) {
                    $scope.isSubscribe = true;
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
                    $scope.isSubscribe = false;
                    localStorage.removeItem($scope.id);
                }, function(error) {
                    console.log('Error: ' + error);
                });
        }


    }
    eventController.$inject = ["$scope", "$routeParams", "em.events.eventService", "$rootScope", "userService"]
})();
