(function() {
    angular.module("em.addEvent").controller("em.addEvent.addEventController", addEventController);

    function addEventController($scope, $route, $rootScope, $routeParams, eventService, addEventService) {

        switch ($route.current.mode) {
            case 'add':

                $scope.event = {
                    isGame: false,
                    report: null

                };

                $scope.en = true;

                $scope.save = function() {
                    $scope.en = false;
                    addEventService.addEvent($scope.event);
                };
                $scope.$watch("dt", function(value) {
                    $scope.event.date = moment(value).format("YYYY-MM-DD");
                });

                break;
            case 'edit':
                $scope.angular = angular;
                $scope.id = $routeParams.id;
                $scope.getEventPromise = eventService.getEvent($scope.id);
                $scope.getEventPromise.then(function(response) {
                    $scope.event = response.data[0];
                    $scope.$watch("event.date", function(value) {
                        $scope.dt = new Date(moment(value).year(), moment(value).month(), moment(value).date());
                    });
                    $scope.$watch("dt", function(value) {
                        $scope.event.date = moment(value).format("YYYY-MM-DD");
                    });
                    $scope.lookFor();
                }, rejected);

                function rejected(error) {
                    console.log('Error: ' + error.data.status);
                }

                $scope.save = function() {
                    if (angular.isObject($scope.event.avatar)) {
                        addEventService.updateWithImage($scope.event);
                    } else {
                        addEventService.update($scope.event);
                    }
                }

                break;
            default:
                $state.go('404Error');
        }


        $scope.place = {};
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
