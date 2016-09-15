(function() {
    var app = angular.module("em", ["ngRoute", "em.main", 'ngAnimate', "ngSanitize" , "ui.bootstrap", "satellizer"]);
    app.controller('DropdownCtrl', function($scope, $log) {
        $scope.items = [
            'The first choice!',
            'And another choice for you.',
            'but wait! A third!'
        ];

        $scope.status = {
            isopen: false
        };

        $scope.toggled = function(open) {
            $log.log('Dropdown is now: ', open);
        };

        $scope.toggleDropdown = function($event) {
            $event.preventDefault();
            $event.stopPropagation();
            $scope.status.isopen = !$scope.status.isopen;
        };

        $scope.appendToEl = angular.element(document.querySelector('#dropdown-long-content'));
    });
})();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJhcHAuanMiXSwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGFwcCA9IGFuZ3VsYXIubW9kdWxlKFwiZW1cIiwgW1wibmdSb3V0ZVwiLCBcImVtLm1haW5cIiwgJ25nQW5pbWF0ZScsIFwibmdTYW5pdGl6ZVwiICwgXCJ1aS5ib290c3RyYXBcIiwgXCJzYXRlbGxpemVyXCJdKTtcclxuICAgIGFwcC5jb250cm9sbGVyKCdEcm9wZG93bkN0cmwnLCBmdW5jdGlvbigkc2NvcGUsICRsb2cpIHtcclxuICAgICAgICAkc2NvcGUuaXRlbXMgPSBbXHJcbiAgICAgICAgICAgICdUaGUgZmlyc3QgY2hvaWNlIScsXHJcbiAgICAgICAgICAgICdBbmQgYW5vdGhlciBjaG9pY2UgZm9yIHlvdS4nLFxyXG4gICAgICAgICAgICAnYnV0IHdhaXQhIEEgdGhpcmQhJ1xyXG4gICAgICAgIF07XHJcblxyXG4gICAgICAgICRzY29wZS5zdGF0dXMgPSB7XHJcbiAgICAgICAgICAgIGlzb3BlbjogZmFsc2VcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAkc2NvcGUudG9nZ2xlZCA9IGZ1bmN0aW9uKG9wZW4pIHtcclxuICAgICAgICAgICAgJGxvZy5sb2coJ0Ryb3Bkb3duIGlzIG5vdzogJywgb3Blbik7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgJHNjb3BlLnRvZ2dsZURyb3Bkb3duID0gZnVuY3Rpb24oJGV2ZW50KSB7XHJcbiAgICAgICAgICAgICRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICAkZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgICAgICRzY29wZS5zdGF0dXMuaXNvcGVuID0gISRzY29wZS5zdGF0dXMuaXNvcGVuO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgICRzY29wZS5hcHBlbmRUb0VsID0gYW5ndWxhci5lbGVtZW50KGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNkcm9wZG93bi1sb25nLWNvbnRlbnQnKSk7XHJcbiAgICB9KTtcclxufSkoKTsiXSwiZmlsZSI6ImFwcC5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
