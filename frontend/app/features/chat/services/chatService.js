;
(function() {
    angular.module("em.chat").service("em.chat.chatService", ["$rootScope", chatService]);

    function chatService($rootScope) {
        var socket = $rootScope.socket;
        console.log('service.js ' + $rootScope.socket);
        var self = this;

        self.history = [];
        self.collection = [];

        self.msgSend = function(msg) {
            socket.emit('message', msg);
        };

        socket.on('welcome', function(messages) {

            // if have prev history from server
            if (messages.length > 0) {
                // preventing from double push
                if (!self.history.length) {
                    self.history.push(messages);
                }
            }

            // first msg for user
            if (!sessionStorage.getItem('chat')) {
                self.collection.push('Welcome to the chat!');
                sessionStorage.setItem('chat', true);
            }

        });

        socket.on('message', function(msg) {
            self.collection.push(msg);
            $rootScope.$apply();
        });

    }
})();
