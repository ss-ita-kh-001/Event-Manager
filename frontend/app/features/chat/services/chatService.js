(function() {
    angular.module("em.chat").service("em.chat.chatService", ["$rootScope", "flashService", "em.mainApiService", chatService]);

    function chatService($rootScope, flashService, mainApiService) {

        var host = location.origin.replace(/^http/, 'ws');
        var socket = new WebSocket(host);

        var self = this;
        self.haveHistory = true;
        self.history = [];
        self.live = [];

        socket.onopen = function(obj) {
            mainApiService.get('chat-history', $rootScope.chatIndex).then(function(response) {
                $rootScope.chatIndex = response.data.index;
                // format data
                console.log(response.data);
                angular.forEach(response.data.data, function(value, key) {
                    response.data.data[key].date = response.data.data[key].date.substring(11, 19);
                });
                self.haveHistory = response.data.haveHistory;
                angular.extend(self.history, response.data.data.reverse());
            });
        };
        socket.onmessage = function(obj) {
            var response = JSON.parse(obj.data);
            // console.log();
            if (!response.error) {
                // format data
                angular.forEach(response.data, function(value, key) {
                    response.data[key].date = response.data[key].date.substring(11, 19);
                });
                $rootScope.$apply(function() {
                    self.live.push(response.data[0]);
                });
            } else {
                $rootScope.$apply(function() {
                    flashService.error(response.errorMessage, false);
                });
            }

        }
        self.msgSend = function(msg) {
            socket.send(JSON.stringify(msg));
        }
        self.getHistory = function() {
            mainApiService.get('chat-history', $rootScope.chatIndex).then(function(response) {
                $rootScope.chatIndex = response.data.index;
                // format data
                angular.forEach(response.data.data, function(value, key) {
                    response.data.data[key].date = response.data.data[key].date.substring(11, 19);
                });
                var tmp = response.data.data.reverse();
                tmp = tmp.concat(self.history);
                self.haveHistory = response.data.haveHistory;
                angular.extend(self.history, tmp);
            });
        }
    }
})();
