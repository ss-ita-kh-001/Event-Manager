(function() {
    'use strict';
    angular.module('em.result-table').controller('em.result-table.chessResultController', resultController);

    function resultController($scope, resultService, games) {
        console.log(games);
        $scope.gamesList = games.data;
        $scope.selectedGame = $scope.gamesList[0];

        $scope.selectGame = function () {
            console.log($scope.selectedGame);
            $scope.getPlayersList($scope.selectedGame);
        };

        $scope.getPlayersList = function (selectedGame) {
            resultService.getPlayersByEvent(selectedGame.id).then(function (response) {
                $scope.playersList = response.data;
            }, rejected);
        };

        $scope.getPlayersList($scope.selectedGame);










        


        $scope.getAllPlayersList = function (){
            resultService.getAllPlayers().then(function (response) {
                $scope.allPlayers = response.data;
            },rejected);
        };

        $scope.getAllPlayersList();

        $scope.getGameListByUser = function (id) {
            resultService.getGameByUser(id).then(function (response) {
                $scope.usersGameList = response.data;
            }, rejected);
        };

        $scope.getGameListByUser(1);

        $scope.sortColoumn = "full_name";
        $scope.reverseSort = false;

        $scope.sortData = function(coloumnName){
            if ($scope.sortColoumn == coloumnName){
                $scope.reverseSort = !$scope.reverseSort;
            }else{
                $scope.reverseSort = false;
            }
            $scope.sortColoumn = coloumnName;
            return true;
        };
        
        function rejected (error) {
            console.log('Error: ' + error.data.status);
        }

    }

    resultController.$inject = ["$scope", "em.result-table.result-table-service", "games"];
})();
