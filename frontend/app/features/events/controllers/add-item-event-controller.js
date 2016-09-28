(function() {
    angular.module("em.events").controller("em.events.add-item-event-controller", itemEventController);

    function itemEventController($scope, itemEventService) {
        $scope.events = itemEventService.getEvents();
        console.log(typeof($scope.events));
    }
    itemEventController.$inject = ["$scope", "em.events.add-item-event-service"];
})();
