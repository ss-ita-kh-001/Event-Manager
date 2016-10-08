(function() {
    angular.module("em.events").controller("em.events.eventController", eventController);

    function eventController($scope, $routeParams, localStorageService) {

          $scope.path = $routeParams.id;
          $scope.events = JSON.parse(localStorageService.get('events'))
          $scope.eventNotFound = false;

          angular.forEach($scope.events, function(event,  path ){
           if(event.id == $scope.path){
             $scope.event = event;
           }
         });

    }
    eventController.$inject = ["$scope","$routeParams", "localStorageService"]
})();
