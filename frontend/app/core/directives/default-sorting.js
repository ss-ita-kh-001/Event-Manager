(function() {
    angular.module("em")
        .directive('defaultSorting', function() {
            return {
                restrict: 'A',
                link: function(scope, element, attrs) {
                  scope.reverseSort = false;
                  scope.predicate = attrs.defaultSorting;
                }
            }
        })
})();
