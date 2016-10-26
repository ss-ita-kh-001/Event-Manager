(function() {
    angular.module("em.addEvent").controller("em.addEvent.addEventController", addEventController);

    function addEventController($scope, addEventService) {
        $scope.event = {
            isGame: false,
            report: null
        };
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
        $scope.add = function() {
            addEventService.addEvent($scope.event);
        };
    }
    addEventController.$inject = ["$scope", "em.addEvent.addEventService"];
})();
