(function() {
    angular.module("em.register").directive("watchChange", function() {
        return {
            scope: {
                onchange: '&watchChange'
            },
            link: function(scope, element) {
                element.on('input', function() {
                    scope.$apply(function() {
                        scope.onchange();
                    });
                });
            }
        };
    })
})();
