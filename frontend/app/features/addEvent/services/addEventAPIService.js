(function() {
    angular.module("em.addEvent").service("em.addEvent.addEventAPIService", addEventAPIService);

    function addEventAPIService(mainApiService, $location) {
        this.add = function(event) {
            mainApiService.post("event/add", event).then(function(res) {
                $location.path("/profile/" + res.data[0].id);
            }).catch(function(error) {
                console.log(error);
            });
        };
    }
    addEventAPIService.$inject = ["em.mainApiService", "$location"];
})();
