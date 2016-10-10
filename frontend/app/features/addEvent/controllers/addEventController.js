(function() {
    angular.module("em.addEvent").controller("em.addEvent.addEventController", addEventController);


    function addEventController($scope, $rootScope, datePicker, addEventAPIService) {
        $scope.datePicker = datePicker;
        $scope.place = {};

        $scope.search = function() {
                $scope.apiError = false;
                $rootScope.search($scope.searchPlace)
                    .then(function(res) { // success
                            $rootScope.addMarker(res);
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
            // map.init();

        $scope.add = function() {
            var eventTmp = {};
            eventTmp.title = $scope.title;
            eventTmp.desc = $scope.description;
            eventTmp.date = $scope.datePicker.dt;
            eventTmp.place = $scope.place.name;
            eventTmp.report = null;
            addEventAPIService.add(eventTmp);
        }
    }


    addEventController.$inject = ["$scope", "$rootScope", "em.addEvent.datePicker", "em.addEvent.addEventAPIService"];

})();
