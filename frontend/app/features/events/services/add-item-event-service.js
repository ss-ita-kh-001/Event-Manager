(function() {
    angular.module("em.events").service("em.events.add-item-event-service", itemEventService);

    function itemEventService(mainApiService) {
        this.getEvents = function() {
            return mainApiService.get('events').then(function (response) {
                if (response) { // success
                    return response.data;
                }
            });
        }

        this.deleteEvent = function (id) {
            return mainApiService.delete('events/' + id).then(function (response) {
                if (response) { // success
                    return true;
                }
            });
        }

        this.postEvent = function (data) {
            return mainApiService.post('events', data).then(function (response) {
                if (response) { // success
                    return response.data;
                }
            });
        }

        this.putEvent = function (data) {
            return mainApiService.put('events/' + data.id, data).then(function (response) {
                if (response) { // success
                    return response.data;
                }
            });
        }
    }

    itemEventService.$inject = ["em.mainApiService"];
})();
