(function() {
    angular.module("em.addEvent").service("em.addEvent.addEventService", addEventService);

    function addEventService(datePicker, map, localStorageService) {
        this.add = function(addedEvent) {
            var events = JSON.parse(localStorage.getItem("events"));
            if (events === null) {
                events = [];
            }

            addedEvent.id = events.length;
            events[events.length] = addedEvent;
            localStorage.setItem("events", JSON.stringify(events));
        }
    }
    addEventService.$inject = ["em.addEvent.datePicker", "em.addEvent.map", "localStorageService"];
})();
