(function() {
    angular.module("em.events").controller("em.events.add-item-event-controller", itemEventController);

    function itemEventController($scope, itemEventService) {
        $scope.events = itemEventService.getEvents();
    }
    itemEventController.$inject = ["$scope", "em.events.add-item-event-service"];
})();
