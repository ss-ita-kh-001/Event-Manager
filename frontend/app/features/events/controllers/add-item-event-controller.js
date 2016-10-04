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
        $scope.deleteEventItem = function (event, id, index) {
            event.stopPropagation();
            itemEventService.deleteEvent(id).then(function (response) {
                // splice deleted element from event list
                if (response) {
                    $scope.events.splice(index, 1);
                }
            });
        }

        //add opportunity to create event
        $scope.mockData = {
            "title": "Football",
            "description": " Sports commonly called 'football' in certain places include: association football (known as soccer in some countries); gridiron football (specifically American football or Canadian football);",
            "date": "24.11.2016",
            "src": "build/img/ocean.jpg"
        };

        $scope.postEventItem = function (data) {
            itemEventService.postEvent(data).then(function (response) {
                $scope.events.push(response);
            });
        }

            //add opportunity to change event
        $scope.updateMockData = {
            "title": "Football New",
            "description": " New New Sports commonly called 'football' in certain places include: association football (known as soccer in some countries); gridiron football (specifically American football or Canadian football);",
            "date": "24.11.2016",
            "src": "build/img/ocean.jpg",
            "id": "35df3a8e23c3e843"
        };

        $scope.putEventItem = function (event, data, index) {
            event.stopPropagation();
            itemEventService.putEvent(data).then(function (response) {
                if (response) {
                    console.log(response);
                    $scope.events[index] = response;
                    // $scope.events.splice(index, 1);
                }
                // $scope.events.push(response);
            });
        }
 }
    itemEventController.$inject = ["$scope", "$location", "em.events.add-item-event-service", "em.mainApiService"];
})();
