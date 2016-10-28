(function() {
    angular.module("em")
        .constant("baseUrl", "/api/")
        .service("em.mainApiService", mainApiService);

    function mainApiService($http, baseUrl) {
        this.get = function(url, config) {
            // config.headers['count'] = localStorage.getItem('count');
            console.log(config);
            return $http.get(baseUrl + url + '/');
        }

        this.delete = function(url) {
            return $http.delete(baseUrl + url + '/');
        }

        this.post = function(url, data, config) {
            if (typeof config !== "undefined") {
                var fd = new FormData();
                for (var key in data) {
                    fd.append(key, data[key]);
                }
                return $http.post(baseUrl + url + '/', fd, {
                    transformRequest: angular.indentity,
                    headers: {
                        'Content-Type': undefined
                    }
                });
            } else {
                return $http.post(baseUrl + url + '/', data);
            }
        }

        this.put = function(url, data) {
            return $http.put(baseUrl + url + '/', data);
        }
        this.upload = function(data) {
            var fd = new FormData();
            for (var key in data) {
                fd.append(key, data[key]);
            }
            return $http.post(baseUrl + "upload/", fd, {
                transformRequest: angular.indentity,
                headers: {
                    'Content-Type': undefined
                }
            });
        }
    }

    mainApiService.$inject = ["$http", "baseUrl"];
})();
