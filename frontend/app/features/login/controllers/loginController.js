(function(){
    'use strict';

    angular.module('em.login').controller('em.login.loginController',loginController);

    function loginController($scope, $location, AuthenticationService, FlashService) {

      $scope.login = login;
      $scope.reset = reset;

      function login() {
          $scope.dataLoading = true;
          AuthenticationService.Login($scope.user.email, $scope.user.password, function (response) {
              if (response.success) {
                  AuthenticationService.SetCredentials($scope.user.email, $scope.user.password);
                  var users = JSON.parse(localStorage.users);
                  var id;
                  for (var i = 0; i < users.length; i++) {
                    if (users[i].email == $scope.user.email) {
                      id = users[i].id;
                    }
                  }
                  $location.path('/profile/' + id);
              } else {
                  FlashService.Error(response.message);
                  $scope.dataLoading = false;
              }
          });
      };
      function reset() {
        AuthenticationService.ClearCredentials();
      };
  }

})();
