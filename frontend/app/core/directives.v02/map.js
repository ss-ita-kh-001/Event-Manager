(function() {
    angular.module("em").directive("mapNew", function($q) {
        return {
            restrict: "A",
            templateUrl: "./app/core/directives.v02/map.html",
            link: function(scope, element) {
                var options = {
                    center: new google.maps.LatLng(40.7127837, -74.00594130000002),
                    zoom: 13,
                    disableDefaultUI: true
                }
                scope.map = new google.maps.Map(
                    element[0].childNodes[0].childNodes[7], options
                );
                scope.places = new google.maps.places.PlacesService(scope.map);
                scope.addMarker = function(res) {
                    if (scope.marker) scope.marker.setMap(null);
                    scope.marker = new google.maps.Marker({
                        position: res.geometry.location,
                        map: scope.map,
                        animation: google.maps.Animation.DROP
                    });

                    scope.map.setCenter(res.geometry.location);
                };

                scope.search = function(str) {
                    var d = $q.defer();
                    scope.places.textSearch({
                        query: str
                    }, function(results, status) {
                        if (status == 'OK') {
                            d.resolve(results[0]);
                        } else d.reject(status);
                    });
                    return d.promise;
                };
            }
        };
    });
})();
