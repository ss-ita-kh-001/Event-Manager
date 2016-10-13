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
        this.deleteGameResult = function (id){
            return mainApiService.delete('games/' + id);
        };
        this.getParticipants =function (){
            return mainApiService.get('users');
        };
        this.addNewRes = function (id, data){
            return mainApiService.post('games/event/' + id, data);
        };
    }
    resultService.$inject = ["em.mainApiService"];
})();
