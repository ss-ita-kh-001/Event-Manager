(function() {
    'use strict';

    angular.module('em.main').controller('em.main.mainController', mainController);

    function mainController($scope, eventNews, mainApiService) {
        // TODO: remove mocks when backend API will be implemented
    //     mainApiService.getItems('events').then(function (response) {
    //         if (response.status < 300) { // success
    //             $scope.events = response.data;
    //         }
    //     });
        $scope.events = [
             {
               "title": "Football",
               "description": " Sports commonly called 'football' in certain places include: association football (known as soccer in some countries);",
               "date": "24.11.2016",
               "src": "build/img/ocean.jpg",
               "id": "b6a904e4bf5bf8a6"
             },
             {
               "title": "Chess",
               "description": "Chess is a two-player strategy board. Chess is played by millions of people worldwide, both amateurs and professionals.",
               "date": "11.11.2016",
               "src": "build/img/badminton.jpg",
               "id": "1c1e72aae8b82a80"
             },
             {
               "title": "Test 3",
               "description": "Football is a family of team sports that involve, to varying degrees, kicking a ball with the foot to score a goal. Unqualified, the word football is understood.",
               "date": "Test 3",
               "src": "build/img/picnic.jpg",
               "id": "663a262e2f6c1803"
             }
            ]
        }

    mainController.$inject = ["$scope", "em.main.event.service.news", "em.mainApiService"];
})();
