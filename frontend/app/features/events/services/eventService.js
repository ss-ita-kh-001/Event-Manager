(function() {
    angular.module("em.events").service("em.events.eventService", eventService);

    function eventService(mainApiService, $location) {

        this.getEvent = function(id) {
            return mainApiService.get("events/" + id)
        }
        this.getUserEvents = function(id) {
            return mainApiService.get("users-events/" + id)
        }

        this.update = function(event) {
            mainApiService.put("events/" + event.id, event).then(function(res) {
                $location.path("/events/" + event.id);
            }).catch(function(error) {
                console.log(error);
            });
        };

        this.subscribe = function(Object) {
            return mainApiService.post("subscribe/" + Object.user + "/" + Object.event)
        };

        this.unsubscribe = function(Object) {
            return mainApiService.delete("unsubscribe/" + Object.user + "/" + Object.event)
        };
    }

    eventService.$inject = ["em.mainApiService", "$location"];
})();
