describe("AddEditEventController Test", function() {


    var mockScope = {};
    var mockAddEventService;
    var mockEventService;
    var controller;
    var route;
    var rootScope;
    var location;


    beforeEach(angular.mock.module("em"));
    beforeEach(module(function($provide) {
        $provide.service('addEventService', function() {
            this.addEvent = jasmine.createSpy('addEvent');
            this.updateWithImage = jasmine.createSpy('updateWithImage');
            this.update = jasmine.createSpy('update');
        });
        $provide.service('eventService', function() {
            this.create = jasmine.createSpy('getEvent');
        });
    }));
    beforeEach(angular.mock.inject(function($controller, $rootScope, $route, $location, eventService, addEventService) {
        mockScope = $rootScope.$new();
        mockRoute = $route;
        mockRoute.current = {params: {  mode: 'add' } };
        mockRootScope = $rootScope;
        mockLocation = $location;
        mockAddEventService = addEventService;
        mockEventService = eventService;

        controller = $controller("em.addEvent.addEventController", {
            $scope: mockScope,
            $route: mockRoute,
            $rootScope: mockRootScope,
            addEventService: mockAddEventService,
            eventService: mockEventService

        });
    }));

    describe('Add/Edit mode', function() {
      it('add mode', function() {
        mockRoute.current = { mode: 'add' };
        mockScope.state = mockRoute.current.mode;
        expect(mockScope.state).toEqual('add');
      });

      it('edit mode', function() {
        mockRoute.current = { mode: 'edit' };
        mockScope.state = mockRoute.current.mode
        expect(mockScope.state).toEqual('edit');
      });

     it('edit mode', function() {
        mockScope.getMode('add')
        expect(mockScope.test).toEqual('add')
      });


        // beforeEach(inject(
        //     function($httpBackend) {
        //         $httpBackend.expectGET('/events/2/edit')
        //             .respond(200);
        //     }));
        //
        // it('should load the login page on successful load of /login', function() {
        //     mockLocation.path('/events/2/edit');
        //     mockRootScope.$digest();
        //     expect(mockRoute.current.mode).toBe('edit')
        // });
    });

    // it('add mode', function() {
    //   mockRoute.current = {params: {  mode: 'add' } };
    //   expect(mockScope.state).toEqual('add');
    // });
    // it('edit mode', function() {
    //     mockRoute.current = {params: {  mode: 'edit' } };
    //     expect(mockScope.state).toEqual('edit');
    // });

    //
    // describe("HTTP service test", function() {
    //    var mockScope = {};
    //    var controller;
    //     var backend;
    //     var modeValues = ['add', 'edit'];
    //     var counter = 0;
    //
    //     beforeEach(angular.mock.inject(function($httpBackend) {
    //         backend = $httpBackend;
    //
    //         backend.when("GET", "/api/events/22").respond(
    //             [{
    //                 "id": 22,
    //                 "title": "Football",
    //                 "desc": "description about football",
    //                 "date": "2016-10-28T18:00:00.000Z",
    //                 "place": "Kharkiv",
    //                 "photos": null,
    //                 "report": null,
    //                 "isGame": true
    //             }]
    //         );
    //     }));
    //
    //     beforeEach(angular.mock.inject(function($controller, $rootScope, $http, $route) {
    //         mockScope = $rootScope.$new();
    //         mockScope.state = modeValues[counter];
    //         mockRoute = $route;
    //         mockRoute.current = { params: {mode: 'edit'}};
    //
    //         $controller("em.addEvent.addEventController", {
    //             $scope: mockScope,
    //             $http: $http,
    //             $route: mockRoute,
    //         });
    //
    //         backend.flush();
    //     }));
    //
    //
    //
    //     it("Ajax request", function() {
    //         backend.verifyNoOutstandingExpectation();
    //     });
    //
    //     it("Data processing", function() {
    //         expect(mockScope.event).toBeDefined();
    //     });
    //
    //     it("Data in the response", function() {
    //         expect(mockScope.event.title).toEqual("Football");
    //     });
    // });
});
