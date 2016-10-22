(function() {
    angular.module("em.addEvent.v02").controller("em.addEvent.v02.addEventController", addEventController);

    function addEventController($scope, uploadService) {
        $scope.event = {
            isGame: false
        };
        $scope.place = {};
        $scope.lookFor = function() {
            $scope.apiError = false;
            $scope.search($scope.event.location)
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
        }
        $scope.upload = function() {
            uploadService.upload($scope.event.media).then(function(res) {
                console.log(res);
            }).catch(function(error) {
                console.log(error);
            });
        }
        console.log($scope.event);
    }
    addEventController.$inject = ["$scope", "em.addEvent.v02.uploadService"];
})();
