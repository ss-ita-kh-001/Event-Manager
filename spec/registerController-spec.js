describe("Register Controller Test", function () {

    var mockScope = {};
    var mockFlashService;
    var controller;

    beforeEach(angular.mock.module("em"));
    beforeEach(module(function($provide) {
        $provide.service('FlashService', function () {
            this.error = jasmine.createSpy('error');
            this.clearFlashMessage = jasmine.createSpy('clearFlashMessage');
        });
    }));

    beforeEach(angular.mock.inject(function ($controller, $rootScope, FlashService) {
        mockScope = $rootScope.$new();
        mockFlashService =  FlashService;

        controller = $controller("em.register.registerController", {
            $scope: mockScope,
            flashService: mockFlashService
        });
    }));
    it ('check password length value', function(){
        expect(mockScope.range).toEqual('.{6,16}');
    });
    it("check password validation. flashService.error with params", function() {
        mockScope.signupForm = {password : {$invalid : true}};
        mockScope.checkPass();
        expect(mockFlashService.error).toHaveBeenCalledWith('The password must be between 6 and 16 characters long', false);
    });
    it("check password validation. flashService.clearFlashMessage with params", function() {
        mockScope.signupForm = {password : {$invalid : false}};
        mockScope.checkPass();
        expect(mockFlashService.clearFlashMessage).toHaveBeenCalled();
    });
});
