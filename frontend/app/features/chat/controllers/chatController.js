(function() {
    angular.module("em.chat").controller("em.chat.chatController", chatController);

    function chatController($scope, chatService, $timeout, FlashService, $rootScope) {
        var self = this;
        var obj = {
            author: '',
            msg: '',
            time: ''
        }

        // console.log("Last Sync: " + currentdate.getDate() + "/" + (currentdate.getMonth() + 1) + "/" + currentdate.getFullYear() + " @ " + currentdate.getHours() + ":" + currentdate.getMinutes() + ":" + currentdate.getSeconds());

        if (localStorage.getItem("chatLogin")) {
            obj.author = localStorage.getItem("chatLogin");
            chatService.msgGet();
            $scope.login = true;
        } else {
            $scope.login = false;
        };

        $scope.chatLogin = function() {
            var login = document.forms.login.login.value;
            localStorage.setItem("chatLogin", login);
            chatService.msgGet();
            obj.author = login;
            $scope.auth = obj.author;
            $scope.login = true;
        };

        $scope.msgSend = function() {
            var msg = document.forms.publish.message.value;
            var date = new Date();
            var currentTime = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();

            FlashService.clearFlashMessage();
            if (msg !== '') {
                obj.msg = msg;
                obj.time = currentTime;
                chatService.msgSend(obj);
                document.forms.publish.message.value = '';
                $timeout(self.scrollBottom, 10);
            } else {
                console.log('flaaaaash');
                FlashService.Error('Please, enter something', false);
            }
        };

        self.scrollBottom = function() {
            var objDiv = document.querySelector('.chat-body');
            objDiv.scrollTop = objDiv.scrollHeight;
        };
        //scroll to bottom for a new user
        $timeout(self.scrollBottom, 1000);
        // history
        $scope.history = chatService.history;
        // new messages
        $scope.live = chatService.live;

    }

    chatController.$inject = ["$scope", "em.chat.chatService", "$timeout", "FlashService", "$rootScope"];

})();
