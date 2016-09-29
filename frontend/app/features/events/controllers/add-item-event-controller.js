(function() {
    angular.module("em.events").controller("em.events.add-item-event-controller", itemEventController);

    function itemEventController($scope, itemEventService, mainApiService) {
        /**
        * Update event list.
        * Called when init controller and update button on click
        */
        $scope.updateEventList = function () {
            mainApiService.getItems('events').then(function (response) {
                if (response.status < 300) { // success
                    $scope.events = response.data;
                }
            });
        };

        $scope.updateEventList();
    }
    itemEventController.$inject = ["$scope", "em.events.add-item-event-service", "em.mainApiService"];
})();
