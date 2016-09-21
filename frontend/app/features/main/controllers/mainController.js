(function() {
    'use strict';

    angular.module('em.main').controller('em.main.mainController', mainController);

    function mainController($scope, eventNews) {
        $scope.events = eventNews.getNews();
    }
    mainController.$inject = ["$scope", "em.main.event.service.news"];
})();
