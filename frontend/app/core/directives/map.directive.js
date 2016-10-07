(function() {
    angular.module("em")
        .directive('map', ['$rootScope', function($rootScope) {
            return {
                restrict: 'A',
                link: function(scope, element, attrs) {
                  console.log(attrs)

                  var options = {
                      center: new google.maps.LatLng(40.7127837, -74.00594130000002),
                      zoom: 13,
                      disableDefaultUI: true
                  }
                     scope.map = new google.maps.Map(
                       element, options
                  );
                      scope.places = new google.maps.places.PlacesService(scope.map);

                    //  if (this.marker) this.marker.setMap(null);
                      scope.marker =  new google.maps.Marker({
                         position: { lat: parseFloat(attrs.lat), lng: parseFloat(attrs.lng)},
                         map: scope.map,
                         animation: google.maps.Animation.DROP
                    });

                    scope.map.setCenter({ lat: parseFloat(attrs.lat), lng:parseFloat(attrs.lng) });

                    $rootScope.$on('search', function(test){
                      console.log('serach', test)
                    })

                    }
                }
        }])

})();
