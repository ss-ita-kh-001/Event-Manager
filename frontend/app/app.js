(function() {
    angular.module("em", [
        "ngRoute",
        "em.main",
        "em.chat",
        "em.profile",
        "em.users",
        "em.register",
        "em.login",
        "ngAnimate",
        "ui.bootstrap",
        "em.addEvent",
        "em.editEvent",
        "em.events",
        "em.result-table",
        "ngCookies",
        "ngSanitize",
        "luegg.directives",
        "satellizer"
    ]);
})();
