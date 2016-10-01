;
(function() {
    angular.module("em.chat").controller("em.chat.chatController", chatController);

    function chatController($scope, chatService) {
        // chatService
        $scope.msgSend = function() {
            var msg = document.forms.publish.message.value;
            chatService.msgSend(msg);
            document.forms.publish.message.value = '';
        };
        $scope.message = chatService.collection;
        console.log($scope.message);

    }

    chatController.$inject = ["$scope", "em.chat.chatService"];

})();
