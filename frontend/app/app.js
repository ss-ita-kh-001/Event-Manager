(function() {
    angular.module("em", [
        "ngRoute",
        "em.main",
        "em.chat",
        "em.profile",
        "em.users",
        "em.register",
        "em.login",
        "em.forgot",
        "em.reset",
        "ngAnimate",
        "ui.bootstrap",
        "ngMaterial",
        "em.events",
        "em.result-table",
        "ngCookies",
        "ngSanitize",
        "luegg.directives",
        "satellizer",
        "wt.responsive",
        "em.addEvent"
    ]);
})();
