describe("Add event", function() {
    var scope = {};
    var controller;

    beforeEach(angular.mock.module("em"));
    beforeEach(angular.mock.inject(function($controller) {
        controller = $controller("em.addEvent.addEventController", {
            $scope: scope
        });
    }));

    it("should pass values to the controller", function() {
        Object.assign(scope.event, {
            title: "TEST EVENT: title",
            desc: "TEST EVENT: title",
            date: "2016-01-01",
            place: "London",
            avatar: null;
        });
    });
});
