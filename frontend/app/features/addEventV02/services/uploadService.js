(function() {
    angular.module("em.addEvent.v02").service("em.addEvent.v02.uploadService", uploadService);

    function uploadService($http) {
        this.upload = function(data) {
            var fd = new FormData();
            for (var key in data) {
                fd.append(key, data[key]);
            }
            return $http.post("/api/upload", fd, {
              transformRequest: angular.indentity,
              headers:{
                'Content-Type': undefined
              }
            });
        }
    }
    uploadService.$inject = ["$http"];
})();
