(function() {
    angular.module("em.editEvent").service("em.editEvent.datePicker", datePicker);

    function datePicker() {
        this.today = function() {
            this.dt = new Date();
        };
        this.today();
        this.inlineOptions = {
            customClass: getDayClass,
            minDate: new Date(),
            showWeeks: true
        };
        this.dateOptions = {
            formatYear: 'yy',
            maxDate: new Date(2020, 5, 22),
            minDate: new Date(),
            startingDay: 1
        };
        this.toggleMin = function() {
            this.inlineOptions.minDate = this.inlineOptions.minDate ? null : new Date();
            this.dateOptions.minDate = this.inlineOptions.minDate;
        };
        this.toggleMin();
        this.open = function() {
            this.popup.opened = true;
        };
        this.setDate = function(year, month, day) {
            this.dt = new Date(year, month, day);
        };
        this.format = "dd-MMMM-yyyy";
        this.altInputFormats = ['M!/d!/yyyy'];
        this.popup = {
            opened: false
        };

        function getDayClass(data) {
            var date = data.date,
                mode = data.mode;
            if (mode === 'day') {
                var dayToCheck = new Date(date).setHours(0, 0, 0, 0);

                for (var i = 0; i < this.events.length; i++) {
                    var currentDay = new Date(this.events[i].date).setHours(0, 0, 0, 0);

                    if (dayToCheck === currentDay) {
                        return this.events[i].status;
                    }
                }
            }

            return '';
        }
    }
})();
