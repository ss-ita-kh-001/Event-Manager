describe("Chat Controller Test", function() {

    var mockScope = {};
    var mockFlashService;
    var controller;

    // var message = ""

    beforeEach(angular.mock.module("em"));

    beforeEach(angular.mock.inject(function($controller, flashService, $rootScope) {
        mockScope = $rootScope.$new();
        mockFlashService = flashService;

        controller = $controller("em.chat.chatController", {
            $scope: mockScope,
            flashService: mockFlashService
        });
    }));

    it('msgSend function exist on controller initialisation', function() {
        expect(mockScope.msgSend).toBeDefined();
    });
    it('getHistory function exist on controller initialisation', function() {
        expect(mockScope.getHistory).toBeDefined();
    });
    it('isError function exist on controller initialisation', function() {
        expect(mockScope.isError).toBeDefined();
    });

});
