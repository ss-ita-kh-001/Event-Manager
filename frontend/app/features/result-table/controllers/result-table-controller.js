(function() {
    'use strict';

    angular.module('em.result-table').controller('em.result-table.chessResultController', chessResultController);

    function chessResultController($scope) {
        $scope.players = players;
        var players = [{
            name: 'Vasyl',
            DateOfBirth: new Date('October 1, 1986'),
            descr: 'grandmaster',
            win: 3,
            lose: 0,
            draw: 1
        }, {
            name: 'Petro',
            DateOfBirth: new Date('August 18, 1986'),
            descr: 'master',
            win: 2,
            lose: 2,
            draw: 4
        }, {
            name: 'Platon',
            DateOfBirth: new Date('July 25, 1989'),
            descr: 'grandmaster',
            win: 3,
            lose: 0,
            draw: 1
        }, {
            name: 'Agafia',
            DateOfBirth: new Date('September 20, 1986'),
            descr: 'grandmaster',
            win: 5,
            lose: 0,
            draw: 1
        }];

        $scope.sortColoumn = "name";
        $scope.reverseSort = false;

        $scope.sortData = function(coloumn) {
            if ($scope.sortColoumn == coloumn) {
                $scope.reverseSort = !$scope.reverseSort;
            } else {
                return false;
            }
            $scope.sortColoumn = coloumn;
        };
    }

    /* $scope.getSortClass = function(coloumn){
         if ($scope.sortColoumn ==coloumn){
              return $scope.reverseSort;
         }else {

         }


     }*/
})();
