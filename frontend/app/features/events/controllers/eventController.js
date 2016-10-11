(function() {
    angular.module("em.events").controller("em.events.eventController", eventController);

    function eventController($scope, $routeParams, eventService, $rootScope) {

      $scope.id = $routeParams.id;

      var getEventPromise = eventService.getEvent($scope.id);
      getEventPromise.then(function (response) {
            $scope.event = response.data[0];
            $scope.search()
        }, rejected );


    function rejected (error) {
        console.log('Error: ' + error.data.status);
    }

      $scope.search = function() {
              $scope.apiError = false;
              $rootScope.search($scope.event.place)
                .then(function(res) { // success
                         $rootScope.addMarker(res);
                    },
                    function(status) { // error
                        $scope.apiError = true;
                        $scope.apiStatus = status;
                    }
                );
             };



    }
    eventController.$inject = ["$scope","$routeParams", "em.events.eventService", "$rootScope"]
})();
