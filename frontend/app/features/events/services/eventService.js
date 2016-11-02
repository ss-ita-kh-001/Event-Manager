(function() {
    angular.module("em.events").service("em.events.eventService", eventService);

    function eventService(mainApiService, $location) {

        this.getEvent = function(id) {
            return mainApiService.get("events/" + id)
        }

        this.subscribe = function(Object) {
            return mainApiService.post("subscribe/" + Object.user + "/" + Object.event)
        };

        this.unsubscribe = function(Object) {
            return mainApiService.delete("unsubscribe/" + Object.user + "/" + Object.event)
        };

        this.sendInvitationToSubscribe = function(invitation) {
            return mainApiService.post("message/subscribe", invitation)
        };

        this.sendInvitationToUnSubscribe = function(invitation) {
            return mainApiService.post("message/unsubscribe", invitation)
        };
        this.sendReport = function(report) {
            return mainApiService.put("event/report/" + report.id, {
                report: report.makeReport
            });
        };
    }

    eventService.$inject = ["em.mainApiService", "$location"];
})();
