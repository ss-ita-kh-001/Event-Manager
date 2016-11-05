describe("Register Controller Test", function() {

    var mockScope = {};
    var mockFlashService;
    var mockUserService;
    var controller;

    beforeEach(angular.mock.module("em"));
    beforeEach(module(function($provide) {
        $provide.service('FlashService', function() {
            this.error = jasmine.createSpy('error');
            this.clearFlashMessage = jasmine.createSpy('clearFlashMessage');
            this.success = jasmine.createSpy('success');
        });
        $provide.service('UserService', function() {
            this.create = jasmine.createSpy('create');
        });
    }));

    beforeEach(angular.mock.inject(function($controller, $rootScope, FlashService, UserService) {
        mockScope = $rootScope.$new();
        mockFlashService = FlashService;
        mockUserService = UserService;

        controller = $controller("em.login.loginController", {
            $scope: mockScope,
            flashService: mockFlashService,
            userService: mockUserService
        });
    }));
    it('login function exist on controller initialisation', function() {
        expect(mockScope.login).toBeDefined();
    });
    it('check dataLoading ', function() {
        mockScope.login()
        expect(mockScope.dataLoading).toEqual(true);
    });
});
