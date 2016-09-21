(function() {
    angular.module("em", [
        "ngRoute",
        "LocalStorageModule",
        "em.db",
        "em.main",
        "em.profile",
        "em.users",
        "em.register",
        'ngAnimate',
        "ui.bootstrap",
        "em.addEvent",
        "em.editEvent",
        "em.events",
        "em.result-table"
    ]);
})();
