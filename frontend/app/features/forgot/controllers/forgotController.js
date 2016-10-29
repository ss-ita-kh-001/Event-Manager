(function() {

    angular.module('em.forgot').controller('em.forgot.forgotController', forgotController);

    forgotController.$inject = ['$scope', 'userService'];

    function forgotController($scope, userService) {
        $scope.user = {};
        $scope.forgot = function() {
            $scope.dataLoading = true;
            userService.forgotPassword($scope.user, $scope.cleanForm);
        }
        $scope.cleanForm = function() {
            $scope.dataLoading = false;
            $scope.user.email = '';
        }
    }


})();
