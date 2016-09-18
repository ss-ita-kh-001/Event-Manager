(function() {
    angular.module("em.profile").service("em.profile.profile-service", profileService);

    function profileService(mockedValues) {
        this.getEventsByUserId = function() {
            return mockedValues;
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
