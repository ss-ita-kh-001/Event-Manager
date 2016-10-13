(function() {
    angular.module("em.main").service("em.main.event.service.news", eventNews);

    function eventNews(mainApiService) {
 
        this.getNextEvents = function() {
            return mainApiService.get('events/next');
        }

        this.getLatestEvents = function() {
            return mainApiService.get('events/latest');
        }
    }

    eventNews.$inject = ["em.mainApiService"]
})();

