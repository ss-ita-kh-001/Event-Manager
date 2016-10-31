(function() {
    angular.module("em").directive("datepickerNew", function() {
        return {
            restrict: "A",
            templateUrl: "./app/core/directives.v02/datepicker.html",
            link: function(scope) {
                scope.today = function() {
                    scope.dt = new Date();
                    scope.event.date = moment(scope.dt).format("YYYY-MM-DD");
                };
                scope.today();

                scope.clear = function() {
                    scope.dt = null;
                    scope.event.date = null;
                };

                scope.inlineOptions = {
                    customClass: getDayClass,
                    minDate: new Date(),
                    showWeeks: true
                };

                scope.dateOptions = {
                    dateDisabled: disabled,
                    formatYear: 'yy',
                    maxDate: new Date(2050, 5, 22),
                    minDate: new Date(),
                    startingDay: 1
                };

                function disabled(data) {
                    var date = data.date;
                    return (date < moment().subtract(1, "days"));
                }

                scope.toggleMin = function() {
                    scope.inlineOptions.minDate = scope.inlineOptions.minDate ? null : new Date();
                    scope.dateOptions.minDate = scope.inlineOptions.minDate;
                };

                scope.toggleMin();

                scope.open1 = function() {
                    scope.popup1.opened = true;
                };

                scope.setDate = function(year, month, day) {
                    scope.dt = new Date(year, month, day);
                };

                scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
                scope.format = scope.formats[0];
                scope.altInputFormats = ['M!/d!/yyyy'];

                scope.popup1 = {
                    opened: false
                };

                var tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                var afterTomorrow = new Date();
                afterTomorrow.setDate(tomorrow.getDate() + 1);
                scope.events = [{
                    date: tomorrow,
                    status: 'full'
                }, {
                    date: afterTomorrow,
                    status: 'partially'
                }];

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

                scope.$watch("dt", function(value) {
                    scope.event.date = moment(value).format("YYYY-MM-DD");
                });
            }
        };
    });
})();
