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
            if (!response.error) {
                angular.forEach(response.data, function(value, key) {
                    response.data[key].date = moment(response.data.date).format("HH:mm:ss");
                });
                $rootScope.$apply(function() {
                    // console.log('type local before', typeof(self.live)); // why not array?
                    // console.log('type from server', typeof(response.data));
                    console.log('length local before', self.live.length);
                    console.log('length from server', response.data.length);
                    // self.live doesn't extend 
                    angular.extend(self.live, response.data);
                    console.log('length local after', self.live.length);
                });
            } else {
                $rootScope.$apply(function() {
                    self.error = true;
                    flashService.error(response.errorMessage, false);
                });

            }
        }
    }
})();
