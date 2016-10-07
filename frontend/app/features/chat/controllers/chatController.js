(function() {
    angular.module("em.chat").controller("em.chat.chatController", chatController);

    function chatController($scope, chatService, $timeout, FlashService, $rootScope) {
        var self = this;
        var obj = {
            author: '',
            msg: '',
            time: ''
        }
        $scope.formData = {};

        if (localStorage.getItem("chatLogin")) {
            obj.author = localStorage.getItem("chatLogin");
            $scope.login = true;
        } else {
            $scope.login = false;
        };

        $scope.chatLogin = function() {
            localStorage.setItem("chatLogin", $scope.formData.username);
            obj.author = $scope.formData.username;
            $scope.login = true;
        };

        $scope.isMine = function($index) {
            return obj.author == $scope.live[$index].author;
        }


        $scope.msgSend = function() {
            var date = new Date();
            var currentTime = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
            FlashService.clearFlashMessage();
            if ($scope.textMsg !== '') {
                obj.msg = $scope.textMsg.replace(/\r?\n/g, '<br />');
                obj.time = currentTime;
                chatService.msgSend(obj);
                $scope.textMsg = '';
                $timeout(self.scrollBottom, 10); // need to approve
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
        // new messages
        $scope.live = chatService.live;

    }

    chatController.$inject = ["$scope", "em.chat.chatService", "$timeout", "FlashService", "$rootScope"];

})();
