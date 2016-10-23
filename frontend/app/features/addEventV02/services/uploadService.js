(function() {
    angular.module("em.addEvent.v02").service("em.addEvent.v02.uploadService", uploadService);

    function uploadService(mainApiService) {
        this.upload = function(data) {
            mainApiService.upload(data);
        }
    }
    uploadService.$inject = ["em.mainApiService"];
})();
