(function() {
    angular.module("em")
        .directive('defaultSorting', function() {
            return {
                restrict: 'A',
                link: function(scope, element, attrs) {
                    if (attrs.defaultSorting == "date"){
                      scope.reverseSort = true;
                    } else {
                      scope.reverseSort = false;
                    }
                  scope.predicate = attrs.defaultSorting;
                }
            }
        })
})();
