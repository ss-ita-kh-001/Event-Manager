(function() {
    angular.module("em.result-table").service("em.result-table.result-table-service", resultService);

    function resultService(mainApiService) {
        this.getPlayersByEvent = function(id) {
            return mainApiService.get('games/event/' + id);
        };

        this.getEventsGames = function(){
            return mainApiService.get('games');
        };

        this.getAllPlayers = function () {
            return mainApiService.get('games/users');
        };
        this.getGameByUser = function (id) {
            return mainApiService.get('games/user/' + id);
        };
    }
    resultService.$inject = ["em.mainApiService"];
})();
