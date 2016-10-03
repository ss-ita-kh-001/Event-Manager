(function() {
    angular.module("em.events").controller("em.events.add-item-event-controller", itemEventController);

    function itemEventController($scope, $location, itemEventService, mainApiService) {
        /**
        * Update event list.
        * Called when init controller and update button on click
        */
        $scope.updateEventList = function () {
            mainApiService.getItems('events').then(function (response) {
                if (response.status < 300) { // success
                    $scope.events = response.data;
                }
            });
        };

        $scope.updateEventList();

        //redirect to other page
        $scope.fullEvent = function (eventId) {
           $location.path("/events/" + eventId);
        }


        //setting filters
        $scope.sortColumn = "name";
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

        $scope.getSortClass = function(column){
            if ($scope.sortColumn == column){
                if($scope.reverseSort){
                    return "glyphicon glyphicon-arrow-up";
                }else{
                    return "glyphicon glyphicon-arrow-down";
                }
            }else{
                return '';
            }

        }

        $scope.deleteItem = function (eventId) {
            event.stopPropagation();
            mainApiService.deleteItem('events/' + eventId).then(function (response) {
                if (response.status < 300) { // success
                    $scope.events = response.data;
                }else {
                    console.log("error");
                }
            });
        }


 }
    itemEventController.$inject = ["$scope", "$location", "em.events.add-item-event-service", "em.mainApiService"];
})();
