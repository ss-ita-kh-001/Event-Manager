(function() {
    angular.module("em")
        .constant("baseUrl", "/api/")
        .service("em.mainApiService", mainApiService);

    function mainApiService($http, baseUrl) {
        this.get = function(url, datum) {
          console.log(baseUrl + url);
          console.log(datum);
          return $http.get(baseUrl + url, datum);
          //return $http.get("http://localhost:5000/lo");
        }

        this.delete = function(url) {
            return $http.delete(baseUrl + url + '/');
        }

        this.post = function(url, data) {
            return $http.post(baseUrl + url + '/', data);
        }

        this.put = function(url, data) {
            return $http.put(baseUrl + url + '/', data);
        }
    }

    mainApiService.$inject = ["$http", "baseUrl"];
})();
