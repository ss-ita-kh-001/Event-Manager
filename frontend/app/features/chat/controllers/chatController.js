(function() {
    angular.module("em.chat").controller("em.chat.chatController", chatController);

    function chatController($scope, chatService, $timeout, FlashService, $rootScope, $anchorScroll, $location) {
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
            } else {
                FlashService.Error('Please, enter something', false);
            }
        };
        // new messages
        $scope.live = chatService.live;

    }

    chatController.$inject = ["$scope", "em.chat.chatService", "$timeout", "FlashService", "$rootScope", "$anchorScroll", "$location"];

})();
