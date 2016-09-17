(function() {
    angular.module("em.register").directive("comparePassword", function() {
        return {
            require: "?ngModel",
            restrict: 'A',
            link: function(scope, element, attrs, ctrl) {
                console.log(scope, element, attrs, ctrl);
                console.log(attrs);
                if (!ctrl) return; // do nothing if no ng-model

                // watch own value and re-validate on change
                scope.$watch(attrs.ctrl, function() {
                    validate();
                });

                // observe the other value and re-validate on change
                attrs.$observe('equals', function(val) {
                    console.log(attrs.equals);
                    validate();
                });

                var validate = function() {
                    // values
                    var val1 = ctrl.$viewValue;
                    var val2 = attrs.equals;

                    // set validity
                    ctrl.$setValidity('equals', !val1 || !val2 || val1 === val2);
                };
            }
        }

    })


})();
