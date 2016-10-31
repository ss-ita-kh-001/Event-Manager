(function() {
    angular.module("em")
        .directive('tableSorting', function() {
            return {
                restrict: 'A',
                link: function(scope, element, attrs) {
                  element.on('click', function() {
                      scope.predicate = attrs.tableSorting;
                      scope.reverseSort = !scope.reverseSort;
                      scope.$apply();
                  });
                }
            }
        })

})();
