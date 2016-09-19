(function() {
    angular.module("em.profile").service("em.profile.profile-service", profileService);

    function profileService(users) {
        this.getEventsByUserId = function() {
            return users;
        }
        this.updateEventSubscribe = function($scope, state) {

            angular.forEach(users, function(users, path) {
                if (users.id == $scope.path) {
                    users.isSubscribe = state;
                }
            });
        }

    }
    profileService.$inject = ["em.profile.mocked-values", "em.db.users"]
})();
