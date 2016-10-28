(function() {
    angular.module("em")
        .directive('datepicker', function() {
            return {
                restrict: 'E',
                templateUrl: './app/core/directives/datepicker.html',
                link: function(scope) {
                    scope.today = function() {
                        scope.dt = new Date();
                    };
                    scope.today();
                    scope.inlineOptions = {
                        customClass: getDayClass,
                        minDate: new Date(),
                        showWeeks: true
                    };
                    scope.dateOptions = {
                        formatYear: 'yy',
                        maxDate: new Date(2020, 5, 22),
                        minDate: new Date(),
                        startingDay: 1
                    };
                    scope.toggleMin = function() {
                        scope.inlineOptions.minDate = scope.inlineOptions.minDate ? null : new Date();
                        scope.dateOptions.minDate = scope.inlineOptions.minDate;
                    };
                    scope.toggleMin();

                    scope.open = function() {
                        scope.popup.opened = true;
                    };
                    scope.setDate = function(year, month, day) {
                        scope.dt = new Date(year, month, day);
                    };
                    scope.format = "dd-MMMM-yyyy";
                    scope.altInputFormats = ['M!/d!/yyyy'];
                    scope.popup = {
                        opened: false
                    };

                    function getDayClass(data) {
                        var date = data.date,
                            mode = data.mode;
                        if (mode === 'day') {
                            var dayToCheck = new Date(date).setHours(0, 0, 0, 0);

                            for (var i = 0; i < scope.events.length; i++) {
                                var currentDay = new Date(scope.events[i].date).setHours(0, 0, 0, 0);

                                if (dayToCheck === currentDay) {
                                    return scope.events[i].status;
                                }
                            }
                        }

                        return '';
                    }
                }
            }
        })

})();
