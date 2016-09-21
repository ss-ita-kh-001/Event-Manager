(function(){
    'use strict';

    angular.module('em.login').controller('em.login.loginController',loginController);

    function loginController($location, AuthenticationService, FlashService) {
      var vm = this;

      vm.login = login;

      (function initController() {
          // reset login status
          AuthenticationService.ClearCredentials();
      })();

      function login() {
          vm.dataLoading = true;
          AuthenticationService.Login(vm.user.username, vm.user.password, function (response) {
              if (response.success) {
                  AuthenticationService.SetCredentials(vm.user.username, vm.user.password);
                  console.log(vm.user.id);

                  $location.path('/profile/' + 1);
              } else {
                  FlashService.Error(response.message);
                  vm.dataLoading = false;
              }
          });
      };
  }

})();
