(function() {
    angular.module("em.chat").controller("em.chat.chatController", chatController);

    function chatController($scope, chatService, $timeout, flashService, $rootScope, $anchorScroll, $location, $sce) {
        var maxSymbols = 300;
        var obj = {
            user: localStorage.getItem("userId")
        }

        $scope.isMine = function($index) {
            return obj.user == $scope.live[$index].user;
        }

        $scope.msgSend = function() {
            if (!$scope.isError()) {
                flashService.clearFlashMessage();
                obj.user = localStorage.getItem("userId");
                obj.text = $scope.textMsg;  
                // obj.text = $sce.getTrustedHtml($scope.textMsg);
                obj.date = moment().format("YYYY-MM-DD HH:mm:ss");
                obj.token = localStorage.getItem("satellizer_token");
                chatService.msgSend(obj);
                $scope.textMsg = '';
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

        $scope.isError = function() {
            if (chatService.error || !$scope.textMsg || $scope.textMsg.length > maxSymbols) {
                return true;
            }
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

    }

    chatController.$inject = ["$scope", "em.chat.chatService", "$timeout", "flashService", "$rootScope", "$anchorScroll", "$location", "$sce"];

})();
