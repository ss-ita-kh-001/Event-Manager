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
});
