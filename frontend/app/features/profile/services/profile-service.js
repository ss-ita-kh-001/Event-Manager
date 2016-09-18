(function() {
    angular.module("em.profile").service("em.profile.profile-service", profileService);

    function profileService(users) {
        this.getEventsByUserId = function() {
            return users;
        }
        this.updateEventSubscribe = function($scope, state) {

            angular.forEach(mockedValues, function(mockedValues,  path ){
              if(mockedValues.id == $scope.path){
                mockedValues.isSubscribe = state;
              }
            });
        }
    }
    profileService.$inject = ["em.profile.mocked-values"]
})();
