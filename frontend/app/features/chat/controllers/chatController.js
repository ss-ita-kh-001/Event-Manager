(function() {
    angular.module("em.chat").controller("em.chat.chatController", chatController);

    function chatController($scope, chatService, $timeout, FlashService, $rootScope) {
        // console.log("$scope.login = " + $scope.login);
        if (sessionStorage.getItem("chatLogin")) {
            $scope.login = true;
        } else {
            $scope.login = false;
        };

        $scope.chatLogin = function() {
            var login = document.forms.login.login.value;

            sessionStorage.setItem("chatLogin", login);
            $scope.login = true;
            $scope.username = login;
        };
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
