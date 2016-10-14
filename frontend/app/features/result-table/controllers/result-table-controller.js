(function() {
    'use strict';
    angular.module('em.result-table').controller('em.result-table.chessResultController', resultController);

    function resultController($scope, resultService, games, players) {
        $scope.gamesList = games.data;
        $scope.selectedGame = $scope.gamesList[0];
        $scope.newGameRes = {};

        $scope.selectGame = function () {
            $scope.getPlayersList($scope.selectedGame);
            $scope.getParticipantsByGame($scope.selectedGame);
        };

        $scope.getPlayersList = function (selectedGame) {
            resultService.getPlayersByEvent(selectedGame.id).then(function (response) {
                $scope.playersList = response.data;
            }, rejected);
        };

        $scope.getPlayersList($scope.selectedGame);

        $scope.getParticipantsByGame = function (selectedGame) {
            resultService.getParticipants(selectedGame.id).then(function (response) {
                $scope.participantsList = response.data;
                if($scope.newGameRes.selectedParticipant === undefined){
                     $scope.newGameRes.selectedParticipant = $scope.participantsList[0];
                }else{
                    var j=0;
                    while (j < $scope.participantsList.length && $scope.participantsList[j].id != $scope.newGameRes.selectedParticipant){
                        j++;
                    }
                }
            }, rejected);
        };

        $scope.getParticipantsByGame($scope.selectedGame);

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
                resultService.getAllPlayers().then(function (response) {
                    $scope.allPlayers = response.data;
                    var i=0;
                    while (i<$scope.allPlayers.length && $scope.allPlayers[i].id != $scope.selectedPlayer.id){
                        i++;
                    }
                    if (i>=$scope.allPlayers.length){
                        $scope.selectedPlayer = $scope.allPlayers[0];
                    }
                    $scope.getGameListByUser($scope.selectedPlayer);
                }, rejected);
                $scope.getPlayersList($scope.selectedGame);
                $scope.getParticipantsByGame($scope.selectedGame);
            }, rejected);
        };

        $scope.addGameRes = function () {
            var gameResult = {
                user: $scope.newGameRes.selectedParticipant.id,
                wins: $scope.newGameRes.wins,
                loses:$scope.newGameRes.loses,
                draws:$scope.newGameRes.draws
            };
            resultService.addNewRes($scope.selectedGame.id,gameResult).then(function (response) {
                $scope.getPlayersList($scope.selectedGame);
                $scope.getParticipantsByGame($scope.selectedGame);
                $scope.newGameRes = {};
                $scope.newGameRes.selectedParticipant = $scope.participantsList[0];
                resultService.getAllPlayers().then(function (response) {
                    $scope.allPlayers = response.data;
                    $scope.getGameListByUser($scope.selectedPlayer);
                }, rejected);
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
