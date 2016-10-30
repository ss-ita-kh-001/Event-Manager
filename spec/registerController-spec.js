describe("Register Controller Test", function () {

    var mockScope = {};
    var mockFlashService;
    var mockUserService;
    var controller;

    beforeEach(angular.mock.module("em"));
    beforeEach(module(function($provide) {
        $provide.service('FlashService', function () {
            this.error = jasmine.createSpy('error');
            this.clearFlashMessage = jasmine.createSpy('clearFlashMessage');
            this.success = jasmine.createSpy('success');
        });
        $provide.service('UserService', function () {
            this.create = jasmine.createSpy('create');
        });
    }));

    beforeEach(angular.mock.inject(function ($controller, $rootScope, FlashService, UserService) {
        mockScope = $rootScope.$new();
        mockFlashService =  FlashService;
        mockUserService = UserService;

        controller = $controller("em.register.registerController", {
            $scope: mockScope,
            flashService: mockFlashService,
            userService: mockUserService
        });
    }));
    it('register function exist on controller initialisation', function(){
        expect(mockScope.register).toBeDefined();
    });
    it('checkPass exist on controller initialisation', function () {
        expect(mockScope.checkPass).toBeDefined();
    });
    it('confirmPass exist on controller initialisation', function () {
        expect(mockScope.confirmPass).toBeDefined();
    });
    it ('check password length value', function(){
        expect(mockScope.range).toEqual('.{6,16}');
    });
    it('check registration. userService.create with params',function () {
       mockScope.register();
       expect(mockUserService.create).toHaveBeenCalledWith(mockScope.user);
    });
    it('check data loading in register', function(){
        mockScope.register();
        expect(mockScope.dataLoading).toBeTruthy();
    });
    it('check password validation. flashService.error with params', function() {
        mockScope.signupForm = {password : {$invalid : true}};
        mockScope.checkPass();
        expect(mockFlashService.error).toHaveBeenCalledWith('The password must be between 6 and 16 characters long', false);
    });
    it('check password validation. flashService.clearFlashMessage with params', function() {
        mockScope.signupForm = {password : {$invalid : false}};
        mockScope.checkPass();
        expect(mockFlashService.clearFlashMessage).toHaveBeenCalledWith();
    });
    it('check confirm password validation. flashService.clearFlashMessage with params', function(){
        mockScope.user = {password: 'somePassword',
                          confirmPassword: 'somePassword'};
        mockScope.confirmPass();
        expect(mockFlashService.success).toHaveBeenCalledWith('Great!', false);
    })
});
