(function() {
    angular.module("em")
        .directive('tableSorting', function() {
            return {
                restrict: 'A',
                link: function(scope, element, attrs, rootScope) {

                  scope.predicate = 'title';
                  scope.reverseSort = false;

                  element.on('click', function() {

                      scope.predicate = attrs.tableSorting;
                      scope.reverseSort = !scope.reverseSort;
                      scope.$apply();

                  });
                }
            }
        })

})();
