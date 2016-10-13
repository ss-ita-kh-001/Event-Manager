(function() {
    'use strict';
    angular.module('em.result-table').controller('em.result-table.chessResultController', resultController);

    function resultController($scope, resultService, games, players) {
        $scope.gamesList = games.data;
        $scope.selectedGame = $scope.gamesList[0];

        $scope.selectGame = function () {
            $scope.getPlayersList($scope.selectedGame);
        };

        $scope.getPlayersList = function (selectedGame) {
            resultService.getPlayersByEvent(selectedGame.id).then(function (response) {
                $scope.playersList = response.data;
            }, rejected);
        };

        $scope.getPlayersList($scope.selectedGame);

        $scope.allPlayers = players.data;
        $scope.selectedPlayer = $scope.allPlayers[0];

        $scope.selectPlayer = function () {
            $scope.getGameListByUser($scope.selectedPlayer);
        };

        $scope.getGameListByUser = function (selectedPlayer) {
            resultService.getGameByUser(selectedPlayer.id).then(function (response) {
                $scope.usersGameList = response.data;
            }, rejected);
        };

        $scope.getGameListByUser($scope.selectedPlayer);
        
        $scope.deleteGameResById = function(id){
            resultService.deleteGameResult(id).then(function (response) {
                $scope.getPlayersList($scope.selectedGame);
            }, rejected);
        };

        $scope.sortState = [
            {sortColoumn: 'full_name',reverseSort: false},
            {sortColoumn: 'date', reverseSort: false}
        ];
        
        $scope.sortData = function(coloumnName,index){
            if ($scope.sortState[index].sortColoumn == coloumnName){
                $scope.sortState[index].reverseSort = !$scope.sortState[index].reverseSort;
            }else{
                $scope.sortState[index].reverseSort = false;
            }
            $scope.sortState[index].sortColoumn = coloumnName;
                return true;
        };
        
        function rejected (error) {
            console.log('Error: ' + error.data.status);
        }

    }

    resultController.$inject = ["$scope", "em.result-table.result-table-service", "games","players"];
})();
