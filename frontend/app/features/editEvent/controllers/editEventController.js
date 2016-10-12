(function() {
    angular.module("em.editEvent").controller("em.editEvent.editEventController", editEventController);

    function editEventController($scope, $rootScope, $routeParams, datePicker, eventService) {

      $scope.datePicker = datePicker;
      $scope.id = $routeParams.id;

        $scope.getEventPromise = eventService.getEvent($scope.id);
        $scope.getEventPromise.then(function (response) {
              $scope.event = response.data[0];
             $scope.search()
          }, rejected );

    //  console.log('scope',$scope.event.place)

      function rejected (error) {
          console.log('Error: ' + error.data.status);
      }

        $scope.search = function() {
                $rootScope.search($scope.event.place)
                    .then(function(res) { // success
                            $rootScope.addMarker(res);
                        },
                        function(status) { // error
                            $scope.apiError = true;
                            $scope.apiStatus = status;
                        }
                    );
            }



      $scope.update = function() {
            console.log($scope.event)
            eventService.update(Object.assign({}, $scope.event));
        }


    }

    editEventController.$inject = ["$scope", "$rootScope", "$routeParams", "em.editEvent.datePicker", "em.events.eventService"];

})();
