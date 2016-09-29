(function() {
    angular.module("em.events").service("em.events.add-item-event-service", itemEventService);

    function itemEventService() {
        this.getEvents = function() {
            var eventsItem = JSON.parse(JSON.parse(localStorage.getItem("ls.events")));
            return eventsItem;
        }
    }
})();
