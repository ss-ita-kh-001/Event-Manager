(function() {
    angular.module("em")
    .constant("baseUrl", "http://localhost:2403/")
    .service("em.mainApiService", mainApiService);
    function mainApiService($http, baseUrl) {
        this.get = function(url) {
            return $http.get(baseUrl + url + '/')
                .then(fulfilled, rejected);
        }

        this.delete = function(url) {
            return $http.delete(baseUrl + url + '/')
                .then(fulfilled, rejected);
        }

        this.post = function(url, data) {
            return $http.post(baseUrl + url + '/', data)
                .then(fulfilled, rejected);
        }

        this.put = function(url, data) {
            return $http.put(baseUrl + url + '/', data)
                .then(fulfilled, rejected);
        }

        function fulfilled (response) {
            return response;
        }
        function rejected (error) {
            alert('Error: ' + error.data.status);
        }
    }

    mainApiService.$inject = ["$http", "baseUrl"];
})();
