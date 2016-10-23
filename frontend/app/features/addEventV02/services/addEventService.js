(function() {
    angular.module("em.addEvent.v02").service("em.addEvent.v02.addEventService", addEventService);

    function addEventService(mainApiService, $location) {
        this.addEvent = function(data) {
            mainApiService.post("events", data).then(function(res) {
                $location.path("/events/" + res.data[0].id);
            }).catch(function(error) {
                console.log(error);
            });
        }
    }
    addEventService.$inject = ["em.mainApiService", "$location"];
})();
