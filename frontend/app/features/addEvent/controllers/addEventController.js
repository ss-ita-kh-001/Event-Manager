(function() {
    angular.module("em.addEvent").controller("em.addEvent.addEventController", addEventController);

    function addEventController($scope, $route, $rootScope, $routeParams, eventService, addEventService) {

        switch ($route.current.mode) {
            case 'add':
                $scope.event = {
                    isGame: false,
                    report: null
                };
                $scope.save = function() {
                    console.log($scope.event)
                    addEventService.addEvent($scope.event);
                };
                break;
            case 'edit':
                $scope.id = $routeParams.id;
                $scope.getEventPromise = eventService.getEvent($scope.id);
                $scope.getEventPromise.then(function(response) {
                    $scope.event = response.data[0];
                    $scope.event.date = new Date($scope.event.date);
                    $scope.lookFor()
                }, rejected);

                function rejected(error) {
                    console.log('Error: ' + error.data.status);
                }

                $scope.save = function() {
                    $scope.event.date = "2016-10-29";
                    console.log($scope.event)
                    eventService.update($scope.event);
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
