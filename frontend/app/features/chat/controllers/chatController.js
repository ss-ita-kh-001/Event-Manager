(function() {
    angular.module("em.chat").controller("em.chat.chatController", chatController);

    function chatController($scope, chatService, $timeout, flashService, $rootScope, $anchorScroll, $location) {
        var obj = {
            user: localStorage.getItem("userId"),
            date: '',
            text: ''
        }

        $scope.isMine = function($index) {
            return obj.author == $scope.live[$index].author;
        }

        $scope.msgSend = function() {
            var date = new Date();
            var currentTime = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
            flashService.clearFlashMessage();
            if ($scope.textMsg) {
                obj.text = $scope.textMsg.replace(/\r?\n/g, '<br />');
                obj.date = moment().format("YYYY-MM-DD HH:mm:ss");;
                chatService.msgSend(obj);
                $scope.textMsg = '';
            } else {
                flashService.error('Please, enter something', false);
            }
        };
        $scope.isChatOnTop = function() {
          $rootScope.chatOnTop = true;
          $scope.id = localStorage.getItem('userId');
          $location.path("/profile/" + $scope.id);
          $scope.classHandler();
        };
        $scope.closeSmallChat = function() {
          $rootScope.chatOnTop = false;
        };
        // new messages
        $scope.live = chatService.live;

    }

    chatController.$inject = ["$scope", "em.chat.chatService", "$timeout", "flashService", "$rootScope", "$anchorScroll", "$location"];

})();
