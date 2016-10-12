(function() {

    angular.module('em').controller('em.logoutController', logoutController);

    function logoutController($location, $auth, flashService) {
        if (!$auth.isAuthenticated()) {
            return;
        }
        $auth.logout()
            .then(function() {
                console.log('you have logged out');
                $location.path('/');
            });
    }

})();
