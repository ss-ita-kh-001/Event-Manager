(function() {
    angular.module("em.chat").controller("em.chat.chatController", chatController);

    function chatController($scope, chatService, flashService, $rootScope, $location, userService) {
        var maxSymbols = 300;
        $scope.currentUser;
        userService.getCurrentUser().then(function (data) {
            console.log(data[0]);
            $scope.currentUser = data[0];
        });
        var obj = {
            user: localStorage.getItem("userId")
        };
        $scope.isMine = function($index) {
            return $scope.currentUser.id == $scope.live[$index].user;
        };
        $scope.msgSend = function() {
            if (!$scope.isError()) {
                flashService.clearFlashMessage();
                obj.user = $scope.currentUser.id;
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
            $scope.classHandler();
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
        $scope.history = chatService.history;
        $scope.live = chatService.live;
        // new array for listening new history from service
        $scope.newArray = chatService.history;
        $scope.$watchCollection('newArray', function(newValue) {
            var tmp = [];
            tmp = tmp.concat(newValue);
            $scope.history = tmp.concat($scope.history);
        });
    }

    chatController.$inject = ["$scope", "em.chat.chatService", "flashService", "$rootScope", "$location", "userService"];

})();
