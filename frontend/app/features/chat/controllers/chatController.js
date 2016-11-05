(function() {
    angular.module("em.chat").controller("em.chat.chatController", chatController);

    function chatController($scope, chatService, flashService, $rootScope, $location, userService, $auth) {

        var maxSymbols = 300;
        var obj = {}; //save here text,time,and token of message

        $scope.user = userService.getUserInfo();

        $scope.haveHistory = function() {
            return chatService.haveHistory;
        }

        $scope.isMineHistory = function($index) {
            return $scope.user.id == $scope.history[$index].user;
        }

        $scope.isMineLive = function($index) {
            return $scope.user.id == $scope.live[$index].user;
        }

        $scope.msgSend = function() {
            if (!$scope.isError()) {
                flashService.clearFlashMessage();
                obj.text = $scope.textMsg;
                obj.date = moment().format("YYYY-MM-DD HH:mm:ss");
                obj.token = localStorage.getItem("satellizer_token");
                chatService.msgSend(obj);
                $scope.textMsg = '';
            }
        };

        $scope.isChatOnTop = function() {
            $rootScope.chatOnTop = true;
            $scope.id = localStorage.getItem('userId');
            $location.path("/me");
        };

        $scope.closeSmallChat = function() {
            $rootScope.chatOnTop = false;
        };

        $scope.isError = function() {
            if (chatService.error || !$scope.textMsg || $scope.textMsg.length > maxSymbols) {
                return true;
            }
        };

        $scope.getHistory = function() {
            chatService.getHistory();
        }

        $scope.$watch('textMsg', function(newValue) {
            if (newValue !== undefined) {
                $scope.symbols = leftSymbols(newValue);
            }
        });

        function leftSymbols(message) {
            if (message.length < maxSymbols) {
                flashService.clearFlashMessage();
                return 'Left symbols ' + (maxSymbols - message.length);
            } else {
                flashService.error('Too much symbols!', false);
            }
        }
        // new messages
        $scope.live = chatService.live;
        $scope.history = chatService.history;
    }

    chatController.$inject = ["$scope", "em.chat.chatService", "flashService", "$rootScope", "$location", "userService", "$auth"];

})();
