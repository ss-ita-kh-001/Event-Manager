(function() {
    angular.module("em.chat").service("em.chat.chatService", ["$rootScope", "$location", chatService]);

    function chatService($rootScope, $location) {

        var host = location.origin.replace(/^http/, 'ws')
        var socket = new WebSocket(host);

        var self = this;
        self.live = [];

        self.msgSend = function(msg) {
            if (socket.readyState == 1) {
                socket.send(JSON.stringify(msg));
            }
        }

        socket.onmessage = function(obj) {
            console.log('onmessage');
            var response = JSON.parse(obj.data);

            console.log(obj);

            // if no saved local history and have history from server
            if (self.live.length == 0 && response.length > 0) {
                $rootScope.$apply(function() {
                    angular.extend(self.live, response);
                });

            } else {
                $rootScope.$apply(function() {
                    self.live.push(response);
                });
            }
        }
    }
})();
