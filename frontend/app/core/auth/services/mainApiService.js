(function() {
    angular.module("em")
        .constant("baseUrl", "/api/")
        .service("em.mainApiService", mainApiService);

    function mainApiService($http, baseUrl) {
        this.get = function(url) {
            return $http.get(baseUrl + url + '/');
        };

        this.delete = function(url) {
            return $http.delete(baseUrl + url + '/');
        };

        this.post = function(url, data) {
            return $http.post(baseUrl + url + '/', data);
        };

        this.postMultipart = function(url, data) {
            return $http.post(baseUrl + url + '/', data, {
                transformRequest: angular.identity,
                headers: {
                    "Content-Type": undefined
                }
            });
        };

        this.put = function(url, data) {
            return $http.put(baseUrl + url + '/', data);
        };
    }

    mainApiService.$inject = ["$http", "baseUrl"];
})();
