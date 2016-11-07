describe("Add/Edit event", function() {
    var mockScope = {};
    var controller;
    var mockRoute;
    var mockEventService;
    var mockAddEventService;


    beforeEach(angular.mock.module("em"));
    beforeEach(angular.mock.module(function($provide) {
        $provide.service("addEventService", function() {
            this.addEvent = jasmine.createSpy("addEvent");
            this.updateWithImage = jasmine.createSpy("updateWithImage");
            this.update = jasmine.createSpy("update");
        });
        $provide.service('eventService', function() {
            this.getEvent = jasmine.createSpy('getEvent');
        });
    }));
    beforeEach(angular.mock.inject(function($controller, $rootScope, addEventService, eventService, $route, $injector) {
        mockScope = $rootScope.$new();
        mockAddEventService = addEventService;
        mockEventService = eventService;
        mockRoute = $route;
        mockRoute.current = {
            mode: 'add'
        };

        controller = $controller("em.addEvent.addEventController", {
            $scope: mockScope,
            $route: mockRoute,
            addEventService: mockAddEventService,
            eventService: mockEventService
        });
    }));

    describe('Add/Edit mode', function() {
        it('add mode', function() {
            mockRoute.current = {
                mode: 'add'
            };
            mockScope.state = mockRoute.current.mode;
            expect(mockScope.state).toEqual('add');
        });

        it('edit mode', function() {
            mockRoute.current = {
                mode: 'edit'
            };
            mockScope.state = mockRoute.current.mode
            expect(mockScope.state).toEqual('edit');
        });

    });

    it('getEventPromise function exist on controller initialisation', function() {
        expect(mockScope.getEventPromise).toBeDefined();
    });

    it('save event function exist on controller initialisation', function() {
        expect(mockScope.save).toBeDefined();
    });

    it('lookFor function exist on controller initialisation', function() {
        expect(mockScope.lookFor).toBeDefined();
    });

    it("should call update method of AddEventService", function() {
        Object.assign(mockScope.event, {
           id: '1',
            title: "TEST EVENT: title",
            desc: "TEST EVENT: title",
            date: "2016-01-01",
            place: "London",
            avatar: null
        });
        mockRoute.current = {
            mode: 'edit'
        };
        mockScope.save();
        expect(mockAddEventService.update).toBeDefined();
    });
    it("should call addEvent method of AddEventService", function() {
        Object.assign(mockScope.event, {
            title: "TEST EVENT: title",
            desc: "TEST EVENT: title",
            date: "2016-01-01",
            place: "London",
            avatar: null
        });
        mockScope.save();
        expect(mockAddEventService.addEvent).toBeDefined();
    });
    it("should call  event", function() {
        Object.assign(mockScope.event, {
           id: '1',
            title: "TEST EVENT: title",
            desc: "TEST EVENT: title",
            date: "2016-01-01",
            place: "London",
            avatar: null
        });
        mockRoute.current = {
            mode: 'edit'
        };
        mockScope.event.avatar= {
            avatr: 'image.jpeg'
        };
        mockScope.save();
        expect(mockAddEventService.updateWithImage).toBeDefined();

    });

});
