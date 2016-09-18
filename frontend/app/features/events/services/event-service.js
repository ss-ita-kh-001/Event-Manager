(function() {
    angular.module("em.events").service("em.events.event-service", eventService);

    function eventService(mockedEventList) {
        this.getEvents = function() {
            return mockedEventList;
        }
    }
    eventService.$inject = ["em.events.mock-event-list"]
})();
