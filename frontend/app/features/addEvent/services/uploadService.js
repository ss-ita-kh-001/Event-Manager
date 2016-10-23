(function() {
    angular.module("em.addEvent").service("em.addEvent.uploadService", uploadService);

    function uploadService(mainApiService) {
        this.upload = function(data) {
            return mainApiService.upload(data);
        }
    }
    uploadService.$inject = ["em.mainApiService"];
})();
