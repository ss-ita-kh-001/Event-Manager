(function() {
    angular.module("em.chat").controller("em.chat.chatController", chatController);

    function chatController($scope, chatService, $timeout) {
        var self = this;
        self.scrollBottom = function() {
            var objDiv = document.querySelector('.chat-body');
            objDiv.scrollTop = objDiv.scrollHeight;
        };
        $scope.msgSend = function() {
            var msg = document.forms.publish.message.value;
            if (msg !== '') {
                chatService.msgSend(msg);
                document.forms.publish.message.value = '';
                $timeout(self.scrollBottom, 10);
            } else {
                alert('Enter something!');
            }
        };
        // history
        $scope.history = chatService.history;
        // new messages
        $scope.live = chatService.live;

        $timeout(self.scrollBottom, 1000);

    }

    chatController.$inject = ["$scope", "em.chat.chatService", "$timeout"];

})();
