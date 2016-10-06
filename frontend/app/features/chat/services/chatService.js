(function() {
    angular.module("em.chat").service("em.chat.chatService", ["$rootScope", chatService]);

    function chatService($rootScope) {
        // var socket = io.connect('http://localhost:8080');
        var socket = new WebSocket("ws://localhost:8080");
        var self = this;

        self.history = []; // old messages from server
        self.live = []; // new messages after connection

        self.msgSend = function(msg) {
            socket.send(JSON.stringify(msg));
        }

        // self.msgGet = function() {
        //     socket.onopen = function(e) {
        //         console.log("Connection established!");
        //         socket.send('get history');
        //     };
        //
        // }

        socket.onmessage = function(obj) {
            $rootScope.$apply(function() {
                self.live.push(JSON.parse(obj.data));
                console.log(self.live);
            });
        }


    }
})();
