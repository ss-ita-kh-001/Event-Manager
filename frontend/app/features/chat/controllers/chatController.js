(function() {
    angular.module("em.chat").controller("em.chat.chatController", chatController);

    function chatController($scope, chatService, $timeout, FlashService, $rootScope) {
        var self = this;
        self.scrollBottom = function() {
            var objDiv = document.querySelector('.chat-body');
            objDiv.scrollTop = objDiv.scrollHeight;
        };
        $scope.msgSend = function() {
            var msg = document.forms.publish.message.value;
            FlashService.clearFlashMessage();
            if (msg !== '') {
                chatService.msgSend(msg);
                document.forms.publish.message.value = '';
                $timeout(self.scrollBottom, 10);
            } else {
              console.log('flaaaaash');
                FlashService.Error('Please, enter something', false);
            }
        };
        // history
        $scope.history = chatService.history;
        // new messages
        $scope.live = chatService.live;
        //scroll to bottom for new user
        $timeout(self.scrollBottom, 1000);

    }

    chatController.$inject = ["$scope", "em.chat.chatService", "$timeout", "FlashService", "$rootScope"];

})();
