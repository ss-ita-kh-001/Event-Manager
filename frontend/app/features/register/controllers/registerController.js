(function() {
    'use strict';


    angular.module('em.register').controller('em.register.registerController', registerController);
    registerController.$inject = ['$scope', 'userService', '$location', '$rootScope', 'flashService'];

    function registerController($scope, userService, $location, $rootScope, flashService) {

        $scope.register = register;
        $scope.checkPass = checkPass;
        $scope.confirmPass = confirmPass;

        function register() {
            $scope.dataLoading = true;
            userService.create($scope.user)
                .then(function(response) {
                    if (response.success) {
                        flashService.success('Registration successful', true);
                        $location.path('/login');
                    } else {
                        flashService.error(response.message);
                        $scope.dataLoading = false;
                    }
                });
        };

        function checkPass() {
          console.log('check pass');
            //var inpVal = document.getElementById('passFirst').value;
            var inpVal = $scope.passFirst;
            if (inpVal.length < 6) {
                flashService.error('The password must be at least 6 characters long', false);
            } else if (inpVal.length > 16) {
                flashService.error('The password must be no longer than 16 characters', false);
            } else {
                flashService.clearFlashMessage();
            }
        };

        function confirmPass() {
          //var inpVal1 = document.getElementById('passFirst').value;
          //var inpVal2 = document.getElementById('passSecond').value;
          if ($scope.passFirst === $scope.passSecond) {
            flashService.success('Great!', false);
          } else {
            flashService.error('The passwords must match', false);
          }
        }
    }
})();
