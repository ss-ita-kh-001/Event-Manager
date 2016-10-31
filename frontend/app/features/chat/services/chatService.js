(function() {
    angular.module("em.chat").service("em.chat.chatService", ["$rootScope", "flashService", chatService]);

    function chatService($rootScope, flashService) {

        var host = location.origin.replace(/^http/, 'ws');
        var socket = new WebSocket(host);

        var self = this;
        self.live = [];
        self.error = false;

        var initialization = {
            token: localStorage.getItem("satellizer_token"),
            getHistory: true,
            index: $rootScope.chatIndex //index defined first time on server
        }

        socket.onopen = function(obj) {
            console.log('initialization', initialization);
            socket.send(JSON.stringify(initialization));
        };

        socket.onmessage = function(obj) {
            var response = JSON.parse(obj.data);
            // console.log(response);

            if (!response.error) {
                $rootScope.chatIndex = response.index;
                angular.forEach(response.data, function(value, key) {
                    // console.log(response.data[key].date);
                    response.data[key].date = response.data[key].date.substring(11, 19);
                });
                // if single msg
                if (response.data.length == 1) {
                    $rootScope.$apply(function() {
                        self.live.push(response.data[0]);
                        // $rootScope.live = self.live;
                        console.log('single message from server', response.data[0]);
                    });
                } else {
                    $rootScope.$apply(function() {
                        self.live = self.live.concat(response.data);
                        // $rootScope.live = self.live;
                        console.log('history from server', response.data);
                    });
                }
            } else {
                $rootScope.$apply(function() {
                    self.error = true;
                    flashService.error(response.errorMessage, false);
                });
            }
        }

        self.msgSend = function(msg) {
            if (socket.readyState == 1) {
                socket.send(JSON.stringify(msg));
            }
        }
        self.getHistory = function() {
            $rootScope.chatIndex -= 10;
            initialization.index = $rootScope.chatIndex;
            console.log(initialization);
            socket.send(JSON.stringify(initialization));
        }
    }
})();
