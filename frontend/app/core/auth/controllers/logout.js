(function() {

    angular.module('em').controller('em.logoutController', logoutController);

    function logoutController($location, $auth, userService, $rootScope) {
        if (!$auth.isAuthenticated()) {
            return;
        }
        $auth.logout()
            .then(function() {
                localStorage.clear();
                $rootScope.$resetScope();
                $location.path('/login');
                userService.setUserInfo(null); //clear user info obj in userService
                userService.setCurrentUserEvents(null);
            });

    }
    logoutController.$inject = ["$location", "$auth", "userService", "$rootScope"];
})();
