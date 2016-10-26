(function() {
    angular.module("em")
        .directive('arrowSorting', function() {
            return {
                restrict: 'E',
                transclude: true,
                templateUrl: './app/core/directives/arrow-sorting.html'
            }
        })
})();
