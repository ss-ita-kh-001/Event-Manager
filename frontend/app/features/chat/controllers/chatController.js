(function() {
    angular.module("em.chat").controller("em.chat.chatController", chatController);

    function chatController($scope, chatService, $timeout, flashService, $rootScope, $anchorScroll, $location) {
        var obj = {
            user: localStorage.getItem("userId")
        }

        $scope.isMine = function($index) {
            return obj.user == $scope.live[$index].user;
        }

        $scope.msgSend = function() {

            flashService.clearFlashMessage();
            if ($scope.textMsg) {
                obj.user = localStorage.getItem("userId");
                obj.text = $scope.textMsg.replace(/\r?\n/g, '<br />');
                obj.date = moment().format("YYYY-MM-DD HH:mm:ss");
                obj.token = localStorage.getItem("satellizer_token");
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
        $scope.error = chatService.error;
        // console.log($scope.error);

        if ($scope.error) {
            // console.log($scope.live);
            $scope.live = chatService.errorMessage;
        }
        else {
            // console.log($scope.live);
            $scope.live = chatService.live;
        }
        $scope.isError = function() {
            console.log($scope.error);
            return $scope.error;
        }


    }

    chatController.$inject = ["$scope", "em.chat.chatService", "$timeout", "flashService", "$rootScope", "$anchorScroll", "$location"];

})();
