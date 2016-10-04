(function() {
    'use strict';

    angular.module('em.result-table').controller('em.result-table.chessResultController', chessResultController);

    function chessResultController($scope,resultService) {
       
        $scope.players = resultService.getPlayers();

        $scope.sortColoumn = "name";
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
    }
    chessResultController.$inject = ["$scope", "em.result-table.result-table-service"]

})();
