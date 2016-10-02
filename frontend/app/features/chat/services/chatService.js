;
(function() {
    angular.module("em.chat").service("em.chat.chatService", ["$rootScope", chatService]);

    function chatService($rootScope) {
        var socket = $rootScope.socket;
        console.log('service.js ' + $rootScope.socket);
        var self = this;

        self.history = []; // old messages from server
        self.live = []; // new messages after connection

        self.msgSend = function(msg) {
            socket.emit('message', msg);
        };

        socket.on('start', function(messages) {
            angular.extend(self.history, messages);
            self.live.push('Welcome to the chat!');
        });

        socket.on('message', function(msg) {
            $rootScope.$apply(function() {
                self.live.push(msg);
            });
        });
    }
})();
