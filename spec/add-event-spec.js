describe("Add event", function() {
    var scope = {};
    var controller;

    beforeEach(angular.mock.module("em"));
    beforeEach(angular.mock.inject(function($controller) {
        controller = $controller("em.addEvent.addEventController", {
            $scope: scope
        });
    }));

    it("should pass values to the controller", function () {
        scope.title = "TEST EVENT: title";
        scope.desc = "TEST EVENT: title";
        scope.date = "2016-01-01";
        scope.plase = "London";
        scope.avatar = null;
    });
});
