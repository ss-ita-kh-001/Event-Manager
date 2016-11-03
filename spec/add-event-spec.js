describe("Add event", function() {
    var scope = {};
    var controller;
    var mockAddEventService;
    var mock$Route;

    beforeEach(angular.mock.module("em"));
    beforeEach(angular.mock.module(function($provide) {
        $provide.service("em.addEvent.addEventService", function() {
            this.addEvent = jasmine.createSpy("addEvent");
            this.updateWithImage = jasmine.createSpy("updateWithImage");
            this.update = jasmine.createSpy("update");
        });
        $provide.service("$route");
    }));
    beforeEach(angular.mock.inject(function($controller, addEventService, $route) {
        scope = $rootScope.$new();
        mockAddEventService = addEventService;
        mock$Route = $route;
        controller = $controller("em.addEvent.addEventController", {
            $scope: scope,
            addEventService: mockAddEventService,
            $route: mock$Route
        });
    }));

    it("should pass values to the controller", function() {
        Object.assign(scope.event, {
            title: "TEST EVENT: title",
            desc: "TEST EVENT: title",
            date: "2016-01-01",
            place: "London",
            avatar: null
        });
    });
});
