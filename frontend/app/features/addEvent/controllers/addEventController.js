(function() {
    angular.module("em.addEvent").controller("em.addEvent.addEventController", addEventController);

    function addEventController($scope, datePicker, map, addEventAPIService) {
        $scope.datePicker = datePicker;
        $scope.place = {};

        $scope.search = function() {
            $scope.apiError = false;
            map.search($scope.searchPlace)
                .then(function(res) { // success
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

        $scope.add = function() {
            var eventTmp = {};
            eventTmp.title = $scope.title;
            eventTmp.desc = $scope.description;
            eventTmp.date = $scope.datePicker.dt;
            eventTmp.place = $scope.place;
            eventTmp.report = null;
            addEventAPIService.add(eventTmp);
        }
    }

    addEventController.$inject = ["$scope", "em.addEvent.datePicker", "em.addEvent.map", "em.addEvent.addEventAPIService"];

})();
