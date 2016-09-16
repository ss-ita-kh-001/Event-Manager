(function() {
    angular.module("em.profile").service("em.profile.profile-service", profileService);

    function profileService(mockedValues) {
        this.getEventsByUserId = function() {
            return mockedValues;
        }
    }
    profileService.$inject = ["em.profile.mocked-values"]
})();
