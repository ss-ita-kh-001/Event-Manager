(function() {

    angular.module('em').controller('em.logoutController', logoutController);

    function logoutController($location, $auth, flashService, userService) {
        if (!$auth.isAuthenticated()) {
            return;
        }
        $auth.logout()
            .then(function() {
                console.log('you have logged out');
                localStorage.clear();
                $location.path('/login');
                userService.setUserInfo(null); //clear user info obj in userService
            });

    }

})();
