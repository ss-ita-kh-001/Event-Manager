(function() {
    angular.module("em.events").service("em.events.add-item-event-service", itemEventService);

    function itemEventService(mainApiService) {
        this.getEvents = function() {
            return mainApiService.get('events')
        }

        this.deleteEvent = function (id) {
            return mainApiService.delete('events/' + id)
        }


        this.postEvent = function (data) {
            return mainApiService.post('events', data)
        }


        this.putEvent = function (data) {
            return mainApiService.put('events/' + data.id, data)
        }
    }

    itemEventService.$inject = ["em.mainApiService"];
})();
