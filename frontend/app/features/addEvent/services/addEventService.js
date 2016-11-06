(function() {
    angular.module("em.addEvent").service("em.addEvent.addEventService", addEventService);

    function addEventService(mainApiService, $location) {
        this.addEvent = function(data) {
            mainApiService.post("events", data, {
                transformRequest: angular.indentity,
                headers: {
                    'Content-Type': undefined
                }
            }).then(function(res) {
                $location.path("/events/" + res.data[0].id);
            }).catch(function(error) {
                console.log(error);
            });
        };

        this.updateWithImage = function(event) {
            mainApiService.post("events/" + event.id + "/i", event, {
                transformRequest: angular.indentity,
                headers: {
                    'Content-Type': undefined
                }
            }).then(function(res) {
                $location.path("/events/" + event.id);
            }).catch(function(error) {
                console.log(error);
            });
        };

        this.update = function(event) {
            mainApiService.put("events/" + event.id, event).then(function(res) {
                $location.path("/events/" + event.id);
            }).catch(function(error) {
                console.log(error);
            });
        };

    }
    addEventService.$inject = ["em.mainApiService", "$location"];
})();
