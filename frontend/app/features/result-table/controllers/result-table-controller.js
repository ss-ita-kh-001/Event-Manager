(function() {
    'use strict';

    angular.module('em.result-table').controller('em.result-table.chessResultController', chessResultController);

    function chessResultController($scope,resultService) {
       
        $scope.players = resultService.getPlayers();

        $scope.sortColoumn = "name";
        $scope.reverseSort = false;
        
        $scope.sortData = function(coloumn){
            if ($scope.sortColoumn == coloumn){
                $scope.reverseSort = !$scope.reverseSort;
            }else{
                $scope.reverseSort = false;
            }
            $scope.sortColoumn = coloumn;
            return true;
        };

        $scope.getSortClass = function(coloumn){
            if ($scope.sortColoumn ==coloumn){
                if($scope.reverseSort){
                    return ".arrow-up";
                }else{
                    return ".arrow-down";
                }
            }else{
                return '';
            }
        
        }
    }
    chessResultController.$inject = ["$scope", "em.result-table.result-table-service"]

})();
