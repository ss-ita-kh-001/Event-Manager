(function() {
    angular.module("em.events").controller("em.events.eventController", eventController);

    function eventController($scope, $routeParams, eventService, profileService) {
          $scope.events = profileService.getEventsByUserId();
          $scope.path = $routeParams.id;

          angular.forEach($scope.events, function(events,  path ){
            if(events.id == $scope.path){
              $scope.isSubscribe = events.isSubscribe;
            }
          });



          $scope.subscribe = function() {
            var state = true;
            $scope.isSubscribe = !$scope.isSubscribe;
            profileService.updateEventSubscribe($scope, state);
          }

          $scope.unSubscribe = function() {
            var state = false;
             $scope.isSubscribe = !$scope.isSubscribe;
            profileService.updateEventSubscribe($scope, state);
          }
    }
    eventController.$inject = ["$scope", "$routeParams", "em.events.event-service", "em.profile.profile-service"]
})();
