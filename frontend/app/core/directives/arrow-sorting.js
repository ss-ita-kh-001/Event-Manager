(function() {
    angular.module("em")
        .directive('arrowSorting', function() {
            return {
                restrict: 'E',
                scope: {
                  column: '='
                },
                templateUrl: './app/core/directives/arrow-sorting.html'
            }
        })
})();
