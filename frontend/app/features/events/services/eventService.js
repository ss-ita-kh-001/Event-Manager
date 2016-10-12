(function() {
    angular.module("em.events").service("em.events.eventService", eventService);

    function eventService(mainApiService, $location) {
        this.getEvent = function(id) {
            return mainApiService.get("events/" + id)
        }
        this.update = function(event) {
            mainApiService.put("events/" + event.id + "/edit", event).then(function(res) {
               $location.path("/events/" + event.id);
            }).catch(function(error) {
                console.log(error);
            });
        };
    }

    eventService.$inject = ["em.mainApiService", "$location"];
})();
