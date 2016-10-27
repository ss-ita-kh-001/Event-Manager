describe("Controller Test", function () {

    var mockScope = {};
    var controller;

    beforeEach(angular.mock.module("em"));

    beforeEach(angular.mock.inject(function ($controller, $rootScope) {
        mockScope = $rootScope.$new();

        controller = $controller("em.events.add-item-event-controller", {
            $scope: mockScope
        });
    }));

    describe("HTTP service test", function () {

        var backend;

        beforeEach(angular.mock.inject(function ($httpBackend) {
            backend = $httpBackend;

            backend.when("GET", "/api/events/").respond(
                [{
                    "id": 22,
                    "title": "Football",
                    "desc": "description about football",
                    "date": "2016-10-28T18:00:00.000Z",
                    "place": "Kharkiv",
                    "photos": null,
                    "report": null,
                    "isGame": true
                  },
                  {
                    "id": 23,
                    "title": "Picnic",
                    "desc": "description about picnic",
                    "date": "2016-10-28T18:00:00.000Z",
                    "place": "Kharkiv",
                    "photos": null,
                    "report": null,
                    "isGame": true
                  }
                ]);
        }));

        beforeEach(angular.mock.inject(function ($controller, $rootScope, $http) {
            mockScope = $rootScope.$new();
            $controller("em.events.add-item-event-controller", {
                $scope: mockScope,
                $http: $http
            });

            backend.flush();
        }));

        it("Ajax request", function () {
            backend.verifyNoOutstandingExpectation();
        });

        it("Data processing", function () {
            expect(mockScope.events).toBeDefined();
            expect(mockScope.events.length).toEqual(2);
        });

        it("Order data in the response", function () {
            expect(mockScope.events[0].title).toEqual("Football");
            expect(mockScope.events[1].title).toEqual("Picnic");
        });
    });
});
