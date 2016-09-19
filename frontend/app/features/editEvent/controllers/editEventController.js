(function() {
    angular.module("em.editEvent").controller("em.editEvent.editEventController", editEventController);

    function editEventController($scope, datePicker, map) {
        $scope.datePicker = datePicker;
        $scope.place = {};

        $scope.image = null;
        $scope.imageFileName = '';

        $scope.uploadme = {};
        $scope.uploadme.src = '';

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

    editEventController.$inject = ["$scope", "em.editEvent.datePicker", "em.editEvent.map"];

})();
