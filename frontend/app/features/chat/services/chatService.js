(function() {
    angular.module("em.chat").service("em.chat.chatService", ["$rootScope", "flashService", chatService]);

    function chatService($rootScope, flashService) {

        var host = location.origin.replace(/^http/, 'ws');
        var socket = new WebSocket(host);

        var initialization = {
            token: localStorage.getItem("satellizer_token"),
            getHistory: true
        }
        socket.onopen = function(obj) {
            socket.send(JSON.stringify(initialization));
        };

        var self = this;
        self.live = [];
        self.error = false;

        self.msgSend = function(msg) {
            if (socket.readyState == 1) {
                socket.send(JSON.stringify(msg));
            }
        }

        socket.onmessage = function(obj) {
            var response = JSON.parse(obj.data);
            console.log(response);
            if (!response.error) {
                angular.forEach(response.data, function(value, key) {
                    response.data[key].date = moment(response.data.date).format("HH:mm:ss");
                });
                // if single msg
                if (response.data.length == 1) {
                    $rootScope.$apply(function() {
                        self.live.push(response.data[0]);
                    });
                } else {
                    $rootScope.$apply(function() {
                        angular.extend(self.live, response.data);
                    });
                }
            } else {
                $rootScope.$apply(function() {
                    self.error = true;
                    flashService.error(response.errorMessage, false);
                });
            }
        }
    }
})();
