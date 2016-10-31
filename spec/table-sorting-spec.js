describe('table sorting directive', function() {
    var $compile,
        element,
        $rootScope;

    beforeEach(angular.mock.module("em"));

    beforeEach(inject(function(_$compile_, _$rootScope_) {
      $compile = _$compile_;
      $rootScope = _$rootScope_;
      element = $compile("<th class='col-sm-2 cursor-pointer' default-sorting='title' table-sorting='title'></th>")($rootScope);
    }));

    it('check for initil values in reverseSort and predicate', function() {
      expect($rootScope.predicate).toEqual("title");
      expect($rootScope.reverseSort).toBeFalsy();
    });

    it("check for a new value in reverseSort on click", function () {
        element.triggerHandler('click');
        expect($rootScope.reverseSort).toBeTruthy();
    });

    it("check for a new value in reverseSort on 2 clicks", function () {
        element.triggerHandler('click');
        element.triggerHandler('click');
        expect($rootScope.reverseSort).toBeFalsy();
    });

    it("check for a new value in reverseSort on 3 clicks", function () {
        element.triggerHandler('click');
        element.triggerHandler('click');
        element.triggerHandler('click');
        expect($rootScope.reverseSort).toBeTruthy();
    });

});
