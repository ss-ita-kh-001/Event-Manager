(function() {
    var app = angular.module("em", [
        "ngRoute",
        "em.main",
        "em.profile",
        "em.register",
        'ngAnimate',
        "ui.bootstrap",
        "em.addEvent",
        "em.editEvent",
        "em.events"
    ]);
    app.controller('DropdownCtrl', function($scope, $log) {
        $scope.items = [
            'The first choice!',
            'And another choice for you.',
            'but wait! A third!'
        ];
      });
})();
