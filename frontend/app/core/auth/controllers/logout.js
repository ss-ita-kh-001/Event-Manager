(function() {

    angular.module('em').controller('em.logoutController', logoutController);

    function logoutController($location, $auth, userService) {
        if (!$auth.isAuthenticated()) {
            return;
        }
        $auth.logout()
            .then(function() {
                localStorage.clear();
                $location.path('/login');
                userService.setUserInfo(null); //clear user info obj in userService
            });

    }

})();
