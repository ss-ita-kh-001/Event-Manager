(function() {
    'use strict';


    angular.module('em.register').controller('em.register.registerController', registerController);
    registerController.$inject = ['UserService', '$location', '$rootScope', 'FlashService'];

    function registerController(UserService, $location, $rootScope, FlashService) {
        var vm = this;
        vm.register = register;
        vm.checkPass = checkPass;
        vm.confirmPass = confirmPass;

        function register() {
            vm.dataLoading = true;
            UserService.Create(vm.user)
                .then(function(response) {
                    if (response.success) {
                        FlashService.Success('Registration successful', true);
                        $location.path('/login');
                    } else {
                        FlashService.Error(response.message);
                        vm.dataLoading = false;
                    }
                });
        };

        function checkPass() {
            var inpVal = document.getElementById('passFirst').value;
            if (inpVal.length < 6) {
                FlashService.Error('The password must be at least 6 characters long', true);
            } else if (inpVal.length > 16) {
                FlashService.Error('The password must be no longer than 16 characters', true);
            } else {
                FlashService.Success('The password is fine', true)
            }
        };

        function confirmPass() {
          var inpVal1 = document.getElementById('passFirst').value;
          var inpVal2 = document.getElementById('passSecond').value;
          if (inpVal1 !== inpVal2) {
            FlashService.Error('The passwords must match', true);
          } else {
            FlashService.Success('Great!', true)
          }
        }
    }
})();
