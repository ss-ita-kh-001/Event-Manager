(function() {
    'use strict';

    angular.module('em.main').controller('em.main.mainController', mainController);

    function mainController($scope, $location, eventNews) {

        $scope.getEventListNews = function () {

            eventNews.getNextEvents().then(function (response) {
                $scope.nextEvents = response.data;
                $scope.descriptionLimit = 130;
                console.log($scope.nextEvents[0].avatar);
            }, rejected);

            eventNews.getLatestEvents().then(function (response) {
                $scope.latestEvents = response.data;
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
