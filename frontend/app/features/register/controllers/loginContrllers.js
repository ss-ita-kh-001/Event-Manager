(function(){
    'use strict';

    angular.module('em.test').controller('em.test.testController',testController($scope)]);

    /**
     * Main Controller
     */
    function testController($scope){
      $scope.alerts = [
  { type: 'danger', msg: 'Oh snap! Change a few things up and try submitting again.' },
  { type: 'success', msg: 'Well done! You successfully read this important alert message.' }
];

$scope.addAlert = function() {
  $scope.alerts.push({msg: 'Another alert!'});
};

$scope.closeAlert = function(index) {
  $scope.alerts.splice(index, 1);
};
    }

    mainController.$inject = [];
})();
