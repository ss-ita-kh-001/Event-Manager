(function() {

    angular.module('em.forgot').controller('em.forgot.forgotController', forgotController);

    forgotController.$inject = ['$scope', 'userService', '$location', '$rootScope', 'flashService'];

    function forgotController($scope, userService, $location, $rootScope, flashService) {
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
