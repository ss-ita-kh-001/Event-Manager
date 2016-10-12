(function() {
    'use strict';

    angular.module('em.main').controller('em.main.mainController', mainController);

    function mainController($scope, eventNews, mainApiService) {

        $scope.PickEventListNews = function () {
            eventNews.getEventNews().then(function (response) {
                $scope.pastEvents = findThreePastEvents(response.data);
                $scope.upcomingEvents = findThreeUpcomingEvents(response.data); 
            }, rejected);
         
        };

        $scope.PickEventListNews();

        function rejected (error) {
            console.log('Error: ' + error.data.status);
        }
    }


// sort to show three past events
    function findThreePastEvents (eventArray) {
        var pastEventsArray = [];
        var today = new Date();
        eventArray = eventArray.sort(function (a, b) {
            if (a.date > b.date) return 1;
            if (a.date < b.date) return -1;
            return 0;
        });


        for (var i=0; i<eventArray.length; i++) {
            var eventDay = new Date(eventArray[i].date);
            var isToday = today.getDate()  === eventDay.getDate() && today.getMonth()  === eventDay.getMonth() && today.getFullYear()  === eventDay.getFullYear();
            var isLaterThanToday = eventDay > today;
            if (isToday || isLaterThanToday) {
                pastEventsArray.push(eventArray[i-1]);
                pastEventsArray.push(eventArray[i-2]);
                pastEventsArray.push(eventArray[i-3]);
                break;
            }
        }

        return pastEventsArray;
    }

// sort to show three upcoming events
    function findThreeUpcomingEvents (eventArray) {
        var upcomingEventsArray = [];
        var today = new Date();
        eventArray = eventArray.sort(function (a, b) {
            if (a.date > b.date) return 1;
            if (a.date < b.date) return -1;
            return 0;
        });
 
        for (var i=0; i<eventArray.length; i++) {
            var eventDay = new Date(eventArray[i].date);
            var isToday = today.getDate()  === eventDay.getDate() && today.getMonth()  === eventDay.getMonth() && today.getFullYear()  === eventDay.getFullYear();
            var isLaterThanToday = eventDay > today;
            if (isToday || isLaterThanToday) {
                upcomingEventsArray.push(eventArray[i]);
                upcomingEventsArray.push(eventArray[i+1]);
                upcomingEventsArray.push(eventArray[i+2]);
                break;
            }
        }

        return upcomingEventsArray;
    }

    mainController.$inject = ["$scope", "em.main.event.service.news", "em.mainApiService"];
})();
