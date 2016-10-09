(function() {
    angular.module("em.main").service("em.main.event.service.news", eventNews);

    function eventNews(mainApiService) {
 
        this.getEventNews = function() {
            return mainApiService.get('events');
        }
    }

    eventNews.$inject = ["em.mainApiService"]
})();

