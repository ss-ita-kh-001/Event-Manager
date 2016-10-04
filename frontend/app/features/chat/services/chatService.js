(function() {
    angular.module("em.chat").service("em.chat.chatService", ["$rootScope", chatService]);

    function chatService($rootScope) {
        var socket = $rootScope.socket;
        var self = this;

        self.history = []; // old messages from server
        self.live = []; // new messages after connection

        self.msgSend = function(msg) {
            socket.emit('message', msg);
        };
        self.msgGet = function () {
            socket.emit('get history');
        }

        socket.on('post history', function(messages) {
            $rootScope.$apply(function() {
                angular.extend(self.history, messages);
            });

        });

        socket.on('message', function(msg) {
            $rootScope.$apply(function() {
                self.live.push(msg);
            });
        });
    }
})();
