(function() {
    'use strict';

    angular.module('em.main').controller('em.main.mainController', mainController);

    function mainController($scope, $location, eventNews, mainApiService) {

        $scope.getEventListNews = function () {

            eventNews.getNextEvents().then(function (response) {
                $scope.nextEvents = response.data;
            }, rejected);

            eventNews.getLatestEvents().then(function (response) {
                $scope.latestEvents = response.data;
            }, rejected);
         
        };

        $scope.getEventListNews();

        function rejected (error) {
            console.log('Error: ' + error.data.status);
        }

        //redirect to event's page
        $scope.eventPage = function (eventId) {
           $location.path("/events/" + eventId);
        };

    }

    mainController.$inject = ["$scope", "$location", "em.main.event.service.news", "em.mainApiService"];
})();
