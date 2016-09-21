(function() {
    angular.module("em.main").service("em.main.event.service.news", eventNews);

    function eventNews(mockedNews) {
        this.getNews = function() {
            return mockedNews;
        }
    }
    eventNews.$inject = ["em.main.mock-news"]
})();
