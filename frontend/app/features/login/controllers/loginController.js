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
                  var users = JSON.parse(localStorage.users);
                  var id;
                  for (var i = 0; i < users.length; i++) {
                    if (users[i].username == vm.user.username) {
                      id = users[i].id;
                    }
                  }
                  $location.path('/profile/' + id);
              } else {
                  FlashService.Error(response.message);
                  vm.dataLoading = false;
              }
          });
      };
  }

})();
