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

    it("Default value reverseSort", function () {
        expect(mockScope.reverseSort).toBeFalsy();
    })
    it("Default value sortColumn", function () {
        expect(mockScope.sortColumn).toEqual("title");
    })
    describe("Function sortData: sort column is not changed", function() {
        beforeEach(function() {
            mockScope.sortData("title");
        });

        it("New value reverseSort", function () {
            expect(mockScope.reverseSort).toBeTruthy();
        });
        it("Value sortColumn", function () {
            expect(mockScope.sortColumn).toEqual("title");
        });
    });
    describe("Function sortData: sort column is changed", function() {
        beforeEach(function() {
            mockScope.sortData("date");
        });

        it("Value reverseSort", function () {
            expect(mockScope.reverseSort).toBeFalsy();
        });
        it("Value sortColumn", function () {
            expect(mockScope.sortColumn).toEqual("date");
        });
    });

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
