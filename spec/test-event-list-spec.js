describe("Controller Test", function () {

    var mockScope = {};
    var controller;
    var mockEvents = {data:[{
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
      }]};
    var mockCurrentUser = {data:[{
        "id": 1,
        "role": "admin",
        "name": "Natasha",
        "lastName": "Poberezhets"
      }]};

    beforeEach(angular.mock.module("em"));

    beforeEach(angular.mock.inject(function ($controller, $rootScope) {
        mockScope = $rootScope.$new();

        controller = $controller("em.events.event-list-controller", {
            $scope: mockScope,
            getEvents : mockEvents,
            getCurrentUser: mockCurrentUser
        });
    }));

    it('Get events array on controller initialization', function(){
        expect(mockScope.events).toBeDefined();
    });

    it('Data processing', function(){
        expect(mockScope.events.length).toEqual(2);
    });

    it("Order data in the response", function () {
        expect(mockScope.events[0].title).toEqual("Football");
        expect(mockScope.events[1].title).toEqual("Picnic");
    });
});
