(function() {
    angular.module("em")
        .directive('map', ["$rootScope", "$q", function($rootScope, $q) {
            return {
                restrict: 'A',
                link: function(scope, element) {
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
                    scope.marker = new google.maps.Marker({
                        position: {
                            lat: 40.7127837,
                            lng: -74.00594130000002
                        },
                        map: scope.map,
                        animation: google.maps.Animation.DROP
                    });

                    scope.map.setCenter({
                        lat: 40.7127837,
                        lng: -74.00594130000002
                    });


                    $rootScope.addMarker = function(res) {
                        if (scope.marker) scope.marker.setMap(null);
                        scope.marker = new google.maps.Marker({
                            position: res.geometry.location,
                            map: scope.map,
                            animation: google.maps.Animation.DROP
                        });

                        scope.map.setCenter(res.geometry.location);
                    }

                    $rootScope.search = function(str) {
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
        }]);

})();
