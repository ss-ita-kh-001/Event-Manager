(function() {
    angular.module("em.addEvent").controller("em.addEvent.addEventController", addEventController);

    function addEventController($scope, datePicker, map) {
        $scope.datePicker = datePicker;
        $scope.place = {};
        $scope.search = function() {
            $scope.apiError = false;
            map.search($scope.searchPlace)
                .then(
                    function(res) { // success
                        map.addMarker(res);
                        $scope.place.name = res.name;
                        $scope.place.lat = res.geometry.location.lat();
                        $scope.place.lng = res.geometry.location.lng();
                    },
                    function(status) { // error
                        $scope.apiError = true;
                        $scope.apiStatus = status;
                    }
                );
        }
        map.init();
    }
    addEventController.$inject = ["$scope", "em.addEvent.datePicker", "em.addEvent.map"];
})();
