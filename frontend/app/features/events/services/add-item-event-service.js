(function() {
    angular.module("em.events").service("em.events.add-item-event-service", itemEventService);

    function itemEventService(mainApiService) {
        this.getEvents = function() {
            return mainApiService.get('events')
                .then(fulfilled, rejected);
        }

        this.deleteEvent = function (id) {
            return mainApiService.delete('events/' + id)
                .then(fulfilled, rejected);
        }


        this.postEvent = function (data) {
            return mainApiService.post('events', data)
                .then(fulfilled, rejected);
        }


        this.putEvent = function (data) {
            return mainApiService.put('events/' + data.id, data)
                .then(fulfilled, rejected);
        }


        function fulfilled (response) {
            if (response) return response.data;
        }
        function rejected (error) {
            console.log('Error: ' + error.data.status);
        }
    }

    itemEventService.$inject = ["em.mainApiService"];
})();
