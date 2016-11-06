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
                    $scope.flag = false;
                    angular.forEach($scope.participantsList, function(participant, key){
                        if (participant.id === $scope.newGameRes.selectedParticipant){
                            $scope.flag =true;
                            return true;
                        }else{}
                    });
                    if(!$scope.flag){
                        $scope.newGameRes.selectedParticipant = $scope.participantsList[0];
                    }
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
                        $scope.flag = false;
                        angular.forEach($scope.allPlayers, function(allPlayer,key){
                            if(allPlayer.id === $scope.userResults.selectedPlayer.id){
                                $scope.flag = true;
                                return true;
                            }else{}
                        });
                        if(!$scope.flag){
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
                    angular.forEach($scope.allPlayers, function(allPlayer,key){
                        if(allPlayer.id === $scope.userResults.selectedPlayer.id){
                            $scope.flag = true;
                            return true;
                        }else{}
                    });
                    if(!$scope.flag){
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
                angular.forEach($scope.playersList.length, function(player,key){
                    if(player.id === id){
                        i = key;
                        return true;
                    }
                });
                $scope.upRes.event = $scope.gameResults.selectedGame.id;
                $scope.upRes.wins = $scope.playersList[i].wins;
                $scope.upRes.loses = $scope.playersList[i].loses;
                $scope.upRes.draws = $scope.playersList[i].draws;
                resultService.getUpdatingParticipants($scope.gameResults.selectedGame.id, id).then(function (response) {
                    $scope.updatingParticipantsList = response.data;
                    var j = 0;
                    angular.forEach($scope.updatingParticipantsList, function(updatingParticipant,key){
                        if(updatingParticipant.id === $scope.playersList[i].user){
                            j = key;
                            return true;
                        }
                    });
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
                        $scope.flag = false;
                        angular.forEach($scope.allPlayers, function(allPlayer,key){
                            if(allPlayer.id === $scope.userResults.selectedPlayer.id){
                                $scope.flag = true;
                                return true;
                            }else{}
                        });
                        if(!$scope.flag){
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
        $scope.flag = false;
        $scope.currentUser ={};
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
