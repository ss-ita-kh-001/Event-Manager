(function() {
    angular.module("em.chat").service("em.chat.chatService", ["$rootScope", chatService]);

    function chatService($rootScope) {

        var socket = new WebSocket("ws://localhost:8080");
        var self = this;

        self.history = []; // old messages from server
        self.live = []; // new messages after connection

        self.msgSend = function(msg) {
            if (socket.readyState == 1) {
                socket.send(JSON.stringify(msg));
            }
        }

        socket.onmessage = function(obj) {
            var response = JSON.parse(obj.data);

            // if no saved local history and have history from server
            if (self.history.length == 0 && response.length > 0) {
                $rootScope.$apply(function() {
                    angular.extend(self.history, response);
                });

            } else {
                $rootScope.$apply(function() {
                    self.history.push(response);
                });
            }
        }
    }
})();
