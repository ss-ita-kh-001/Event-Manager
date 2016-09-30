;
(function() {
    angular.module("em.chat").service("em.chat.chatService", ["$rootScope", chatService]);

    function chatService($rootScope) {
        var socket = $rootScope.socket;
        var self = this;
        self.collection = [];

        self.msgSend = function(msg) {
            socket.emit('message', msg);
        };

        socket.on('message', function(msg) {
            self.collection.push(msg);
            $rootScope.$apply();
        });

    }
})();
