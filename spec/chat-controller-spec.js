describe("Chat Controller Test", function() {

    var mockScope = {};
    var mockFlashService;
    var controller;

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
    it('isError function works', function() {
        mockScope.textMsg = "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Corporis odit neque nobis earum delectus, beatae ad illo voluptates illum, quis inventore itaque odio dolor animi quibusdam. Molestiae quo quidem, vel.Lorem ipsum dolor sit amet, consectetur adipisicing elit. Corporis odit neque nobis earum delectus, beatae ad illo voluptates illum, quis inventore itaque odio dolor animi quibusdam. Molestiae quo quidem, vel.";
        expect(mockScope.isError()).toEqual(true);
    });

});
