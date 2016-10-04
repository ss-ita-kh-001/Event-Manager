(function() {
    angular.module("em.events").service("em.events.add-item-event-service", itemEventService);

    function itemEventService(mainApiService) {
        this.getEvents = function() {
            return mainApiService.get('events').then(function (response) {
                if (response.status < 300) { // success
                    return response.data;
                }
            });
        }

        this.deleteEvent = function (id) {
            return mainApiService.delete('events/' + id).then(function (response) {
                if (response.status < 300) { // success
                    $scope.events = response.data;
                }else {
                    console.log("error");
                }
            });
        }
    }

    itemEventService.$inject = ["em.mainApiService"];
})();
