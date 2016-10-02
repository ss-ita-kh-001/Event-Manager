(function(){
    'use strict';

    angular.module('em.login').controller('em.login.loginController',loginController);

    function loginController($location, AuthenticationService, FlashService) {
      var vm = this;

      vm.login = login;
      
      function login() {
          vm.dataLoading = true;
          AuthenticationService.Login(vm.user.email, vm.user.password, function (response) {
              if (response.success) {
                  AuthenticationService.SetCredentials(vm.user.email, vm.user.password);
                  var users = JSON.parse(localStorage.users);
                  var id;
                  for (var i = 0; i < users.length; i++) {
                    if (users[i].email == vm.user.email) {
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
