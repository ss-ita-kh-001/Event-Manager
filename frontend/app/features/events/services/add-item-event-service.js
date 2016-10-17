(function() {
    angular.module("em.events").service("em.events.add-item-event-service", itemEventService);

    function itemEventService(mainApiService) {
        this.getEvents = function() {
            return mainApiService.get('events')
        };

        this.deleteEvent = function (id) {
            return mainApiService.delete('events/' + id)
        };

        this.sendInvitation = function (invitation) {
            return mainApiService.post("invite", invitation)
        };
    }
    
    itemEventService.$inject = ["em.mainApiService"];
})();