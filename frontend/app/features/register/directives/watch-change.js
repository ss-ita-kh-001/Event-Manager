(function() {
    angular.module("em.register").directive("watchChange", function() {
        return {
            scope: {
                onchange: '&watchChange'
            },
            link: function(scope, element, attrs) {
                element.on('input', function() {
                    scope.$apply(function() {
                        scope.onchange();
                    });
                });
            }
        };
    })
})();
