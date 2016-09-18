(function() {
    angular.module("em.events").controller("em.events.event-list-controller", eventListController);

    function eventListController($scope, eventService) {
        $scope.events = eventService.getEvents();
    }
    eventListController.$inject = ["$scope", "em.events.event-service"]
})();
