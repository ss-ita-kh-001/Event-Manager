(function() {
    'use strict';


    angular.module('em.register').controller('em.register.registerController', registerController);
    registerController.$inject = ['$scope', 'UserService', '$location', '$rootScope', 'FlashService'];

    function registerController($scope, UserService, $location, $rootScope, FlashService) {

        $scope.register = register;
        $scope.checkPass = checkPass;
        $scope.confirmPass = confirmPass;

        function register() {
            $scope.dataLoading = true;
            UserService.Create($scope.user)
                .then(function(response) {
                    if (response.success) {
                        FlashService.Success('Registration successful', true);
                        $location.path('/login');
                    } else {
                        FlashService.Error(response.message);
                        $scope.dataLoading = false;
                    }
                });
        };

        function checkPass() {
          console.log('check pass');
            var inpVal = document.getElementById('passFirst').value;
            if (inpVal.length < 6) {
                FlashService.Error('The password must be at least 6 characters long', false);
            } else if (inpVal.length > 16) {
                FlashService.Error('The password must be no longer than 16 characters', false);
            } else {
                FlashService.clearFlashMessage();
            }
        };

        function confirmPass() {
          var inpVal1 = document.getElementById('passFirst').value;
          var inpVal2 = document.getElementById('passSecond').value;
          if (inpVal1 === inpVal2) {
            FlashService.Success('Great!', false);
          } else {
            FlashService.Error('The passwords must match', false);
          }
        }
    }
})();
