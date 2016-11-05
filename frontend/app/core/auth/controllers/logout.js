(function() {

    angular.module('em').controller('em.logoutController', logoutController);

    function logoutController($rootScope, $location, $auth, userService) {
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
    logoutController.$inject = ["$rootScope","$location", "$auth", "userService"];
})();
