;
(function() {
    angular.module("em.chat").service("em.chat.chatService", ["$rootScope", chatService]);

    function chatService($rootScope) {
        var socket = io.connect('http://localhost:8080');
        var self = this;
        self.collection = [];

        this.msgSend = function(msg) {
            socket.emit('message', msg);
        };

        socket.on('message', function(msg) {
            self.collection.push(msg);
            $rootScope.$apply();
        });

    }

    // chatService.$inject = ["$rootScope"];

})();
