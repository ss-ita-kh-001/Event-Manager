(function() {
    angular.module("em.addEvent").service("em.addEvent.addEventService", addEventService);

    function addEventService($scope, datePicker, map, localStorageServiceProvider) {
        this.add = function() {
            var addedEvent = {};
            addedEvent.title = $scope.title;
            addedEvent.description = $scope.description;
            addedEvent.date = $scope.datePicker.dt;
            addedEvent.place = $scope.place;
            addedEvent.uploadme = $scope.uploadme;

            var events = JSON.parse(localStorage.getItem("events"));
            if (events === null) {
                events = [];
            }

            addedEvent.id = events.length;
            events[events.length] = addedEvent;
            localStorage.setItem("events", JSON.stringify(events));
        }
    }
    addEventService.$inject = ["$scope", "em.addEvent.datePicker", "em.addEvent.map", "localStorageServiceProvider"];
})();
