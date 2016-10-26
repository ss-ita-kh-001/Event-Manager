(function() {
    angular.module("em.chat").service("em.chat.chatService", ["$rootScope", "$location", chatService]);

    function chatService($rootScope, $location) {

        var host = location.origin.replace(/^http/, 'ws')
        var socket = new WebSocket(host);

        var self = this;
        self.live = [];
        self.error = '';
        self.errorMessage = '';

        self.msgSend = function(msg) {
            if (socket.readyState == 1) {
                socket.send(JSON.stringify(msg));
            }
        }

        socket.onmessage = function(obj) {


            var response = JSON.parse(obj.data);
            // console.log(response);

            $rootScope.$apply(function() {

                self.error = response.error;
                self.errorMessage = response.errorMessage;
                // console.log(self.error);
                // console.log(self.errorMessage);

            });



            // if no saved local history and have history from server
            if (self.live.length == 0 && response.data.length > 0) {
                $rootScope.$apply(function() {
                    angular.extend(self.live, response.data);
                });

            } else {
                $rootScope.$apply(function() {
                    self.live.push(response.data);

                });
            }



        }
    }
})();
