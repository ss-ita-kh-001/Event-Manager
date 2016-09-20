(function() {
    'use strict';


    angular.module('em.register').controller('em.register.registerController', registerController);
    registerController.$inject = ['UserService', '$location', '$rootScope', 'FlashService'];

    function registerController(UserService, $location, $rootScope, FlashService) {
        var vm = this;

        vm.register = register;

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
        }
    }
})();
