describe('table sorting directive', function() {
    var $compile,
        element,
        scope,
        attrs,
        $rootScope;
      //load the module which contains the directive

    beforeEach(angular.mock.module("em"));


    beforeEach(inject(function(_$compile_, _$rootScope_) {
      $compile = _$compile_;
      $rootScope = _$rootScope_;
    }));
    //critical
    it('sorts by name in events table', function() {
      var element = $compile("<th class='col-sm-2 cursor-pointer' table-sorting='title'></th>")($rootScope);
    });
    $rootScope.$digest();


    it('sorts by number', function() {});
    it('sorts by date', function() {});


});
