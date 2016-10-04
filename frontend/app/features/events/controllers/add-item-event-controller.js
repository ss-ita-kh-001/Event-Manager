(function() {
    angular.module("em.events").controller("em.events.add-item-event-controller", itemEventController);

    function itemEventController($scope, $location, itemEventService, mainApiService) {
        /**
        * Update event list.
        * Called when init controller and update button on click
        */
        $scope.updateEventList = function () {
            itemEventService.getEvents().then(function (events) {
                $scope.events = events;
            });
        };

        $scope.updateEventList();

        //redirect to other page
        $scope.fullEvent = function (eventId) {
           $location.path("/events/" + eventId);
        };

        //setting sort
        $scope.sortColumn = "title";
        $scope.reverseSort = false;

        $scope.sortData = function(column){
            if ($scope.sortColumn == column){
                $scope.reverseSort = !$scope.reverseSort;
            }else{
                $scope.reverseSort = false;
            }
            $scope.sortColumn = column;
            return true;
        };


        //add opportunity to delete event
        $scope.deleteEventItem = function (event, id) {
            event.stopPropagation();
            itemEventService.deleteEvent(id).then(function (response) {
                    $scope.events = response.data;
                // }else {
                //     console.log("error");
                // }
            });
        }
 }
    itemEventController.$inject = ["$scope", "$location", "em.events.add-item-event-service", "em.mainApiService"];
})();
