(function() {
    angular.module("em.events").service("em.events.add-item-event-service", itemEventService);

    function itemEventService() {
        this.getEvents = function() {
            var eventsItem = JSON.parse(localStorage.events);
            console.log(eventsItem);
            return JSON.parse(localStorage.events);
        }
    }
})();
