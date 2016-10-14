(function() {

    angular.module('em.forgot').controller('em.forgot.forgotController', forgotController);

    function forgotController($scope, $location, authenticationService, flashService, userService, $auth, $rootScope) {
      console.log('ForgotCTRL');

    }
})();
