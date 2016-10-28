describe("Register Controller Test", function () {

    var mockScope = {};
    var controller;

    beforeEach(angular.mock.module("em"));

    beforeEach(angular.mock.inject(function ($controller, $rootScope) {
        mockScope = $rootScope.$new();

        controller = $controller("em.register.registerController", {
            $scope: mockScope
        });
    }));
    

});
