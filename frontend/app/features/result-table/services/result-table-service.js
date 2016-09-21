(function() {
    angular.module("em.result-table").service("em.result-table.result-table-service", resultService);

    function resultService(playersList) {
        this.getPlayers = function() {
            return playersList;
        }

    }
    resultService.$inject = ["em.result-table.users-array"]
})();
