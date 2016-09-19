(function() {
    var app = angular.module("em", [
        "ngRoute",
        "em.db",
        "em.main",
        "em.profile",
        "em.users",
        "em.register",
        'ngAnimate',
        "ui.bootstrap",
        "em.addEvent",
        "em.editEvent",
        "em.events"
    ]);
})();
