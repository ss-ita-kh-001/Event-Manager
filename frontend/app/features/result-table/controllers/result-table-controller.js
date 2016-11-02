(function() {
    'use strict';
    angular.module('em.result-table').controller('em.result-table.chessResultController', resultController);

    function resultController($scope, resultService, games, players, userService, gamesForUsers) {

        $scope.getCurrentUser = function () {
            if (userService.getUserInfo()) {
                $scope.currentUser = userService.getUserInfo();
                return;
            }
            if(localStorage.getItem("userId")){
                userService.getById(localStorage.getItem("userId"))
                    .then(function (response) {
                        if (Array.isArray(response) && response.length > 0) {
                            userService.setUserInfo(response[0]);
                            $scope.currentUser = userService.getUserInfo();
                        }
                    } );
            }
        };

        $scope.selectGame = function () {
            $scope.getPlayersList($scope.gameResults.selectedGame);
            $scope.getParticipantsByGame($scope.gameResults.selectedGame);
        };

        $scope.getPlayersList = function (selectedGame) {
            resultService.getPlayersByEvent(selectedGame.id).then(function (response) {
                $scope.playersList = response.data;
            }, rejected);
        };

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
                    if(j >= $scope.participantsList.length){
                        $scope.newGameRes.selectedParticipant = $scope.participantsList[0];
                    }else{}
                }
            }, rejected);
        };

        $scope.selectPlayer = function () {
            $scope.getGameListByUser($scope.userResults.selectedPlayer);
        };

        $scope.getGameListByUser = function (selectedPlayer) {
            if (selectedPlayer == undefined){
                $scope.usersGameList =[];
            }else{
                resultService.getGameByUser(selectedPlayer.id).then(function (response) {
                    $scope.usersGameList = response.data;
                }, rejected);
            }
        };

        $scope.deleteGameResById = function(id){
            resultService.deleteGameResult(id).then(function () {
                resultService.getAllPlayers().then(function (response) {
                    $scope.allPlayers = response.data;
                    if($scope.allPlayers.length == 0){
                        $scope.usersGameList =[];
                    }else{
                        var i=0;
                        while (i<$scope.allPlayers.length && $scope.allPlayers[i].id != $scope.userResults.selectedPlayer.id){
                            i++;
                        }
                        if (i>=$scope.allPlayers.length){
                            $scope.userResults.selectedPlayer = $scope.allPlayers[0];
                        }
                        $scope.getGameListByUser($scope.userResults.selectedPlayer);
                    }
                }, rejected);
                $scope.getPlayersList($scope.gameResults.selectedGame);
                $scope.getParticipantsByGame($scope.gameResults.selectedGame);
            }, rejected);
        };

        $scope.addGameRes = function () {
            var gameResult = {
                user: $scope.newGameRes.selectedParticipant.id,
                wins: $scope.newGameRes.wins,
                loses:$scope.newGameRes.loses,
                draws:$scope.newGameRes.draws
            };
            resultService.addNewRes($scope.gameResults.selectedGame.id,gameResult).then(function () {
                $scope.getPlayersList($scope.gameResults.selectedGame);
                $scope.newGameRes = {};
                $scope.getParticipantsByGame($scope.gameResults.selectedGame);
                resultService.getAllPlayers().then(function (response) {
                    $scope.allPlayers = response.data;
                    var i=0;
                    while (i<$scope.allPlayers.length && $scope.allPlayers[i].id != $scope.userResults.selectedPlayer.id){
                        i++;
                    }
                    if (i>=$scope.allPlayers.length){
                        $scope.userResults.selectedPlayer = $scope.allPlayers[0];
                    }
                    $scope.getGameListByUser($scope.userResults.selectedPlayer);
                }, rejected);
            }, rejected);
        };

        $scope.updateResult = function (id) {
            if($scope.upRes.id !== id){
                $scope.upRes.id = id;
                var i = 0;
                while(i < $scope.playersList.length && $scope.playersList[i].id != id){
                    i++;
                }
                $scope.upRes.event = $scope.gameResults.selectedGame.id;
                $scope.upRes.wins = $scope.playersList[i].wins;
                $scope.upRes.loses = $scope.playersList[i].loses;
                $scope.upRes.draws = $scope.playersList[i].draws;
                resultService.getUpdatingParticipants($scope.gameResults.selectedGame.id, id).then(function (response) {
                    $scope.updatingParticipantsList = response.data;
                    var j=0;
                    while(j < $scope.updatingParticipantsList.length && $scope.updatingParticipantsList[j].id != $scope.playersList[i].user){
                        j++;
                    }
                    $scope.upRes.selectedParticipant = $scope.updatingParticipantsList[j];
                }, rejected);

            }else{
                var gameResult  = {
                    user: $scope.upRes.selectedParticipant.id,
                    event: $scope.upRes.event,
                    wins: $scope.upRes.wins,
                    loses:$scope.upRes.loses,
                    draws:$scope.upRes.draws
                };
                resultService.updateRes(id,gameResult).then(function (response) {
                    $scope.getPlayersList($scope.gameResults.selectedGame);
                    $scope.getParticipantsByGame($scope.gameResults.selectedGame);
                    resultService.getAllPlayers().then(function (response) {
                        $scope.allPlayers = response.data;
                        var i=0;
                        while (i<$scope.allPlayers.length && $scope.allPlayers[i].id != $scope.userResults.selectedPlayer.id){
                            i++;
                        }
                        if (i>=$scope.allPlayers.length){
                            $scope.userResults.selectedPlayer = $scope.allPlayers[0];
                        }
                        $scope.getGameListByUser($scope.userResults.selectedPlayer);
                    }, rejected);
                }, rejected);
                $scope.upRes={id: -1};
            }
        };

        $scope.cancelUpdate = function(){
            $scope.upRes={id: -1};
        };

        function rejected (error) {
            console.log('Error: ' + error.data.status);
        }

        $scope.currentUser={};
        $scope.currentUser.role = 'user';
        $scope.getCurrentUser();
        if($scope.currentUser.role  !== 'admin'){
            $scope.gamesList = gamesForUsers.data;
        }else{
            $scope.gamesList = games.data;
        }

        if($scope.gamesList.length === 0){
            $scope.playersList =[];
            $scope.participantsList = [];
        }else{
            $scope.gameResults = {
                selectedGame : $scope.gamesList[0]
            };
            $scope.getPlayersList($scope.gameResults.selectedGame);
            $scope.getParticipantsByGame($scope.gameResults.selectedGame);
        }
        $scope.newGameRes = {};
        $scope.upRes = {id: -1};

        $scope.allPlayers = players.data;
        if ($scope.allPlayers.length == 0){
            $scope.userResults = {
                selectedPlayer: {
                    id: -2
                }
            };
        }else{
            $scope.userResults = {
                selectedPlayer: $scope.allPlayers[0]
            };
            $scope.getGameListByUser($scope.userResults.selectedPlayer);
        }
    }

    resultController.$inject = ["$scope", "em.result-table.result-table-service", "games","players", "userService", "gamesForUsers"];
})();
