(function() {
    angular.module("em.chat").service("em.chat.chatService", chatService);

    function chatService() {
        var socket = io.connect('http://localhost:8080')

        function msgSend(msg) {
            socket.emit('message', msg);
        };

        function msgGet(msg) {
            // console.log('ss');
            return msg;
        };

        socket.on('message', function(msg) {
            msgGet(msg);
        });

        var methods = {
            send: msgSend,
            get: msgGet
        };

        return methods;

    }

    chatService.$inject = []
})();
