(function() {
    angular.module("em.addEvent").controller("em.addEvent.addEventController", addEventController);

    function addEventController($scope, datePicker, map, $window) {
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

        $scope.add = function() {
            var addedEvent = {};
            addedEvent.id = Math.ceil(Math.random() * 1000);
            addedEvent.title = $scope.title;
            addedEvent.description = $scope.description;
            addedEvent.date = $scope.datePicker.dt;
            addedEvent.place = $scope.place;
            addedEvent.uploadme = $scope.uploadme;

            var events = JSON.parse(localStorage.getItem("events"));
            if (events === null) {
                events = [];
            }

            events[events.length] = addedEvent;
            localStorage.setItem("events", JSON.stringify(events));
        }

        $scope.clear = function() {
            //Bydło code
            $window.location.reload();
        }
    }

    addEventController.$inject = ["$scope", "em.addEvent.datePicker", "em.addEvent.map", "$window"];

})();
