(function() {
    angular.module("em.events").controller("em.events.eventController", eventController);

    function eventController($scope, $routeParams, map, localStorageService) {
          $scope.path = $routeParams.id;
          $scope.events = JSON.parse(localStorageService.get('events'))

          angular.forEach($scope.events, function(event,  path ){
           if(event.id == $scope.path){
             $scope.event = event;
           }
         });
          console.log($scope.event, 'vw');
          console.log($scope.events, 'local');

          var lat = $scope.event.place.lat;
          var lng = $scope.event.place.lng;

          map.init();
          map.staticMarker(lat, lng);
          //
          // angular.forEach($scope.events, function(events,  path ){
          //   if(events.id == $scope.path){
          //     $scope.isSubscribe = events.isSubscribe;
          //   }
          // });
          //
          // $scope.subscribe = function() {
          //   var state = true;
          //   $scope.isSubscribe = !$scope.isSubscribe;
          //   profileService.updateEventSubscribe($scope, state);
          // }
          //
          // $scope.unSubscribe = function() {
          //   var state = false;
          //    $scope.isSubscribe = !$scope.isSubscribe;
          //   profileService.updateEventSubscribe($scope, state);
          // }
    }
    eventController.$inject = ["$scope", "$routeParams", "em.addEvent.map", "localStorageService"]
})();
