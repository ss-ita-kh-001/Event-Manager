(function() {

    angular.module('em.register').controller('em.register.registerController', registerController);
    registerController.$inject = ['$scope', 'userService', 'flashService'];

    function registerController($scope, userService, flashService) {

        $scope.range = '.{6,16}';
        $scope.email = /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i;
        $scope.username = /^[a-zA-Z\s]{3,50}$/;
        $scope.register = function() {
            $scope.dataLoading = true;
            userService.create($scope.user);
        };
        $scope.checkName = function() {
            if ($scope.signupForm.displayName.$invalid) {
                flashService.error('Only latin symbols and length between 3 and 50', false);
            } else {
                flashService.clearFlashMessage();
            }
        };

        $scope.checkEmail = function() {
            if ($scope.signupForm.email.$invalid) {
                flashService.error('Please, enter valid email', false);
            } else {
                flashService.clearFlashMessage();
            }
        };

        $scope.checkPass = function() {
            if ($scope.signupForm.password.$invalid) {
                flashService.error('The password must be between 6 and 16 characters long', false);
            } else {
                flashService.clearFlashMessage();
            }
        };
        $scope.confirmPass = function() {
            if ($scope.user.password === $scope.user.confirmPassword) {
                flashService.success('Great!', false);
            } else {
                flashService.error('The passwords must match', false);
            }
        };
    };
})();
