(function() {
    angular.module("em.addEvent").service("em.addEvent.uploadService", uploadService);

    function uploadService(mainApiService) {
        this.upload = function(data) {
            mainApiService.upload(data);
        }
    }
    uploadService.$inject = ["em.mainApiService"];
})();
