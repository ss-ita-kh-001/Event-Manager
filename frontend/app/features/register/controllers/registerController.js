(function() {

    angular.module('em.register').controller('em.register.registerController', registerController);
    registerController.$inject = ['$scope', 'userService', 'flashService'];

    function registerController($scope, userService, flashService) {
        $scope.range = '.{6,16}';
        $scope.username = /^[^"?!@#$%^&*()>_<,.\\/|{}\[\];=`~+\-\d][a-zA-Z]{3,50}$/;
        $scope.register = function() {
            $scope.dataLoading = true;
            userService.create($scope.user);
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
