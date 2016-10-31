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
    it('check email length value', function(){
        expect(mockScope.email).toEqual('.{5,50}');
    });
    it('check username value', function(){
        expect(mockScope.username).toEqual(/^[a-zA-Z\s]{3,50}$/);
    });
    it('check registration. userService.create with params',function () {
       mockScope.register();
       expect(mockUserService.create).toHaveBeenCalledWith(mockScope.user);
    });
    it('check data loading in register', function(){
        mockScope.register();
        expect(mockScope.dataLoading).toBeTruthy();
    });
    it ('check name validation.flashService.error with params', function () {
        mockScope.signupForm = {displayName: {$invalid : true}};
        mockScope.checkName();
        expect(mockFlashService.error).toHaveBeenCalledWith('Only latin symbols and length between 3 and 50', false);
    });
    it ('check name validation.flashService.error with params', function () {
        mockScope.signupForm = {displayName: {$invalid : false}};
        mockScope.checkName();
        expect(mockFlashService.clearFlashMessage).toHaveBeenCalledWith();
    });
    it('check email validation.flashService.error with params', function () {
        mockScope.signupForm = {email: {$invalid : true}};
        mockScope.checkEmail();
        expect(mockFlashService.error).toHaveBeenCalledWith('The email must be correct and shorter than 50 characters', false);
    });
    it('check email validation.flashService.error with params', function () {
        mockScope.signupForm = {email: {$invalid : false}};
        mockScope.checkEmail();
        expect(mockFlashService.clearFlashMessage).toHaveBeenCalledWith();
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
