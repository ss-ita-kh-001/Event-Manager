(function() {
    angular.module("em.chat").controller("em.chat.chatController", chatController);

    function chatController($scope, chatService, $timeout, flashService, $rootScope, $anchorScroll, $location, $sce) {
        var obj = {
            user: localStorage.getItem("userId")
        }

        $scope.isMine = function($index) {
            return obj.user == $scope.live[$index].user;
        }

        $scope.msgSend = function() {
            // for example, tmp is empty object, why???
            var tmp = $sce.trustAsHtml('My name is <div style = "color:red; width: 500px; height: 500px; background: red;"><b>Mudassar Khan</b></div>');         
            console.log('tmp',tmp);
            console.log($sce);

            if (!$scope.isError()) {
                if ($scope.textMsg) {
                    flashService.clearFlashMessage();
                    obj.user = localStorage.getItem("userId");
                    obj.text = $scope.textMsg.replace(/\r?\n/g, '<br />');
                    // obj.text = $sce.trustAsHtml($scope.textMsg);
                    obj.date = moment().format("YYYY-MM-DD HH:mm:ss");
                    obj.token = localStorage.getItem("satellizer_token");
                    chatService.msgSend(obj);
                    $scope.textMsg = '';
                } else {
                    flashService.error('Please, enter something', false);
                }
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
            return chatService.error;
        }

        // new messages
        $scope.live = chatService.live;


    }

    chatController.$inject = ["$scope", "em.chat.chatService", "$timeout", "flashService", "$rootScope", "$anchorScroll", "$location", "$sce"];

})();
