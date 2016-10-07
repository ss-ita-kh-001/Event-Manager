(function() {
    angular.module("em.editEvent").controller("em.editEvent.editEventController", editEventController);

    function editEventController($scope, $rootScope, $routeParams, datePicker, localStorageService, $timeout, addEventService) {

      $scope.path = $routeParams.id;
      $scope.events = JSON.parse(localStorageService.get('events'))
      $scope.eventNotFound = false;
      $scope.datePicker = datePicker;

      angular.forEach($scope.events, function(event,  path ){
       if(event.id == $scope.path){
         $scope.event = event;
       }
     });

  //  console.log( $scope.event)

     $scope.title = $scope.event.title;
     $scope.description = $scope.event.description;


        var lat = $scope.event.place.lat;
        var lng = $scope.event.place.lng;


          // map.init();
          //
          // map.staticMarker(lat, lng);

         $scope.place = $scope.event.place;

        $scope.search = function() {
            $scope.apiError = false;
            $rootScope.$broadcast('serach', 'hello')
            // map.search($scope.searchPlace)
            //     .then(
            //         function(res) { // success
            //             map.addMarker(res);
            //             $scope.place.name = res.name;
            //             $scope.place.lat = res.geometry.location.lat();
            //             $scope.place.lng = res.geometry.location.lng();
            //         },
            //         function(status) { // error
            //             $scope.apiError = true;
            //             $scope.apiStatus = status;
            //         }
            //     );
        }

        $scope.update = function() {
            var updateEvent = {};
            updateEvent.title = $scope.title;
            updateEvent.description = $scope.description;
            updateEvent.date = $scope.datePicker.dt.toISOString().slice(0, 10);
            updateEvent.place = $scope.place;
             console.log(updateEvent)
            addEventService.add(updateEvent);
        }

    }

    editEventController.$inject = ["$scope", "$rootScope", "$routeParams", "em.editEvent.datePicker", "localStorageService", "$timeout", "em.addEvent.addEventService"];

})();
