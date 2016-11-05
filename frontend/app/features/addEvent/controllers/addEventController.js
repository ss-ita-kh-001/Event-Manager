(function() {
    angular.module("em.addEvent").controller("em.addEvent.addEventController", addEventController);

    function addEventController($scope, $route, $rootScope, $routeParams, eventService, addEventService) {

        $scope.event = {
            isGame: false,
            report: null
        };
        $scope.angular = angular;
        $scope.id = $routeParams.id;
        $scope.en = true;
        $scope.edit = false;
        $scope.place = {};

        $scope.$watch("dt", function(value) {
            $scope.event.date = moment(value).format("YYYY-MM-DD");
        });

        $scope.getEventPromise = function() {
            eventService.getEvent($scope.id)
                .then(function(response) {
                    $scope.event = response.data[0];
                    $scope.$watch("event.date", function(value) {
                        $scope.dt = new Date(moment(value).year(), moment(value).month(), moment(value).date());
                    });
                    $scope.$watch("dt", function(value) {
                        $scope.event.date = moment(value).format("YYYY-MM-DD");
                    });
                    $scope.lookFor();
                }, function(error) {
                    console.log('Error: ' + error.data.status);
                });
        }

        if ($route.current.mode === 'edit') {
            $scope.edit = true;
            $scope.getEventPromise()
        }


        $scope.save = function() {
            $scope.en = false;
            if (angular.isObject($scope.event.avatar) && ($route.current.mode === 'edit')) {
                addEventService.updateWithImage($scope.event);
            } else if ($route.current.mode === 'edit') {
                addEventService.update($scope.event);
            } else {
                addEventService.addEvent($scope.event);
            }
        }


        $scope.lookFor = function() {
            $scope.apiError = false;
            $scope.search($scope.event.place)
                .then(
                    function(res) { // success
                        $scope.addMarker(res);
                        $scope.place.name = res.name;
                        $scope.place.lat = res.geometry.location.lat();
                        $scope.place.lng = res.geometry.location.lng();
                    },
                    function(status) { // error
                        $scope.apiError = true;
                        $scope.apiStatus = status;
                    }
                );
        };

    }
    addEventController.$inject = ["$scope", "$route", "$rootScope", "$routeParams", "em.events.eventService", "em.addEvent.addEventService"];
})();
