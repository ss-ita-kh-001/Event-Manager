(function() {
    angular.module("em")
        .directive('arrowSorting', function() {
            return {
                restrict: 'E',
                scope: {
                  sorting: '='
                },
                templateUrl: './app/core/directives/arrow-sorting.html',
                link: function(scope, element, attrs) {

                  element.on('click', function() {
                      console.log(attrs.sorting);

                      scope.$apply();

                  });
                }
            }
        })
})();
