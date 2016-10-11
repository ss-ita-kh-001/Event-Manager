(function() {
    angular.module("em")
        .directive('map', function($rootScope, $q) {
            return {
                restrict: 'A',
                link: function(scope, element, attrs) {
                  var options = {
                      center: new google.maps.LatLng(40.7127837, -74.00594130000002),
                      zoom: 13,
                      disableDefaultUI: true
                  }

                  scope.map = new google.maps.Map(
                       element[0], options
                  );
                      scope.places = new google.maps.places.PlacesService(scope.map);

                  if (scope.marker) scope.marker.setMap(null);
                      scope.marker =  new google.maps.Marker({
                         position: { lat: parseFloat(attrs.lat), lng:parseFloat(attrs.lng)},
                         map: scope.map,
                         animation: google.maps.Animation.DROP
                    });

                    scope.map.setCenter({ lat: parseFloat(attrs.lat), lng:parseFloat(attrs.lng) });


                    $rootScope.addMarker = function(res){
                        if (scope.marker) scope.marker.setMap(null);
                          scope.marker =  new google.maps.Marker({
                             position: res.geometry.location,
                             map: scope.map,
                             animation: google.maps.Animation.DROP
                        });

                        scope.map.setCenter(res.geometry.location);
                    }

                    $rootScope.getLatLong = function(address){
                        var d = $q.defer();
                      var geo = new google.maps.Geocoder;
                      geo.geocode({'address':address},function(results, status){
                        if (status == google.maps.GeocoderStatus.OK) {
                          d.resolve(results[0]);
                        } else d.reject(status);
                      });
                      return d.promise;
                      }


                    $rootScope.search = function(str){
                      var d = $q.defer();
                      scope.places.textSearch({
                          query: str
                      }, function(results, status) {
                          if (status == 'OK') {
                              d.resolve(results[0]);
                          } else d.reject(status);
                      });
                      return d.promise;
                    }

                    }
                }
        })

})();
