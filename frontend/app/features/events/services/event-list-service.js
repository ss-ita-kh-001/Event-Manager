(function() {
    angular.module("em.events").service("em.events.event-list-service", itemEventService);


    function itemEventService($rootScope, mainApiService) {

        $rootScope.allEvents = [];
        this.getEvents = function(index) {
            console.log('getEvents index', index);
            return mainApiService.get('events', index).then(handleSuccess, handleError('Error getting events'));
        };

        this.deleteEvent = function(id) {
            return mainApiService.delete('events/' + id).then(handleSuccess, handleError('Error delete event'));
        };

        this.sendInvitation = function(invitation) {
            return mainApiService.post("invite", invitation).then(handleSuccess, handleError('Error send invitation'));
        };

        // private functions

        function handleSuccess(res) {
            return res.data;
        }

        function handleError(error) {
            return function() {
                return {
                    success: false,
                    message: error
                };
            };
        }
    }

    itemEventService.$inject = ["$rootScope", "em.mainApiService"];
})();
