(function() {
    angular.module("em.chat").service("em.chat.chatService", ["$rootScope", "$location", "flashService", chatService]);

    function chatService($rootScope, $location, flashService) {

        var host = location.origin.replace(/^http/, 'ws');
        var socket = new WebSocket(host);

        // socket.onmessage = function(obj) {
        //   console.log(obj.data);
        // }
        // console.log('sss');

        // socket.onopen = function(obj) {
        //     console.log(obj);
        // };

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

            // format date in every msg
            angular.forEach(response.data, function(value, key) {
                response.data[key].date = moment(response.data.date).format("HH:mm:ss");
            });

            if (response.error) {
                $rootScope.$apply(function() {
                    self.error = true;
                    flashService.error(response.errorMessage, false);
                });
            } else {
                // refactoring
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
    }
})();
