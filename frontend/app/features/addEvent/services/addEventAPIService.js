(function() {
    angular.module("em.addEvent").service("em.addEvent.addEventAPIService", addEventAPIService);

    function addEventAPIService(mainApiService, $location) {
        this.add = function(event) {
            var formData = new FormData();
            for (var key in event) {
                formData.append(key, event[key]);
            }
            mainApiService.postMultipart("events", formData).then(function(res) {
                $location.path("/events/" + res.data[0].id);
            }).catch(function(error) {
                console.log(error);
            });
        };
    }
    addEventAPIService.$inject = ["em.mainApiService", "$location"];
})();
