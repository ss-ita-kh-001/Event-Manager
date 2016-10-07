(function() {
    angular.module("em.addEvent").service("em.addEvent.addEventService", addEventService);

    function addEventService(datePicker,  localStorageService) {
        this.add = function(addedEvent) {
            var events = JSON.parse(localStorageService.get("events"));
            if (events === null) {
                events = [];
            }

            addedEvent.id = events.length;
            events[events.length] = addedEvent;
            localStorageService.set("events", JSON.stringify(events));
        }
    }
    addEventService.$inject = ["em.addEvent.datePicker", "localStorageService"];
})();
