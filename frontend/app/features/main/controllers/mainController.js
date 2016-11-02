(function() {
    'use strict';

    angular.module('em.main').controller('em.main.mainController', mainController);

    function mainController($scope, $location, eventNews) {

        $scope.getEventListNews = function () {

            eventNews.getNextEvents().then(function (response) {
                $scope.nextEvents = response.data;
                for(var i = 0; i < $scope.nextEvents.length; i++){
                  $scope.nextEvents[i].desc = $scope.nextEvents[i].desc.replace(/(<([^>]+)>)/g, "").substring(0, 100) + ($scope.nextEvents[i].desc.length > 100? "...": "");
                }
                $scope.descriptionLimit = 130;
            }, rejected);

            eventNews.getLatestEvents().then(function (response) {
                $scope.latestEvents = response.data;
                for(var i = 0; i < $scope.latestEvents.length; i++){
                  $scope.latestEvents[i].desc = $scope.latestEvents[i].desc.replace(/(<([^>]+)>)/g, "").substring(0, 100) + ($scope.latestEvents[i].desc.length > 100? "...": "");
                }
                $scope.letterLimit = 100;
            }, rejected);
        };

        $scope.getEventListNews();


        function rejected (error) {
            console.log('Error: ' + error.data.status);
        };

        //redirect to event's page
        $scope.eventPage = function (eventId) {
           $location.path("/events/" + eventId);
        };

    }

    mainController.$inject = ["$scope", "$location", "em.main.event.service.news"];
})();
