(function() {
    'use strict';
    angular.module('em.result-table').controller('em.result-table.chessResultController', resultController);

    function resultController($scope, resultService, mainApiService) {

        $scope.getPlayersList = function (id) {
            resultService.getPlayersByEvent(id).then(function (response) {
                $scope.playersList = response.data;
            }, rejected);
        };

        $scope.getPlayersList(11);

        $scope.getEventListSelect = function (){
            resultService.getEventsGames().then(function (response) {
                $scope.gamesList = response.data;
            },rejected);
        };

        $scope.getEventListSelect();

        $scope.getAllPlayersList = function (){
            resultService.getAllPlayers().then(function (response) {
                $scope.allPlayers = response.data;
            },rejected);
        };

        $scope.getAllPlayersList();

        $scope.getGameListByUser = function (id) {
            resultService.getGameByUser(id).then(function (response) {

                $scope.usersGameList = response.data;
                console.log(response.data);
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

    resultController.$inject = ["$scope", "em.result-table.result-table-service", "em.mainApiService"];
})();
