(function() {
    angular.module("em.events").controller("em.events.add-item-event-controller", itemEventController);

    function itemEventController($scope, $location, itemEventService, $uibModal, userService) {

        $scope.getCurrentUser = function() {
            if (userService.getUserInfo()) {
                $scope.currentUser = userService.getUserInfo();
                return;
            }
            if (localStorage.getItem("userId")) {
                userService.getById(localStorage.getItem("userId"))
                    .then(function(response) {
                        if (Array.isArray(response) && response.length > 0) {
                            userService.setUserInfo(response[0]);
                            $scope.currentUser = userService.getUserInfo();
                        }
                    });
            };
        };

        $scope.getCurrentUser();

        /**
         * Update event list.
         * Called when init controller and update button on click
         */
        $scope.updateEventList = function() {
            itemEventService.getEvents().then(function(response) {
                $scope.events = response.data;
            }, rejected);
        };
        $scope.updateEventList();

        //redirect to other page
        $scope.fullEvent = function(eventId) {
            $location.path("/events/" + eventId);
        };

        $scope.editEvent = function(eventId) {
            $location.path("/events/" + eventId + "/edit/");
        };

        //add opportunity to delete event
        $scope.deleteEventItem = function(id) {
            itemEventService.deleteEvent(id).then(function(response) {
                var eventIndex = $scope.events
                    .map(function(event) { return event.id; })
                    .indexOf(id);

                $scope.events.splice(eventIndex, 1);
            }, rejected);
        }

        //add modal window
        $scope.openDeleteModal = function(event, eventItem) {
            event.stopPropagation();
            $scope.currentEventTitle = eventItem.title;
            $uibModal.open({
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                templateUrl: 'deleteModalContent.html',
                scope: $scope,
                controller: function($uibModalInstance, $scope) {
                    $scope.delete = function() {
                        $uibModalInstance.close();
                        $scope.currentEventTitle = null;
                        $scope.deleteEventItem(eventItem.id);
                    };
                    $scope.cancel = function() {
                        $scope.currentEventTitle = null;
                        $uibModalInstance.dismiss('cancel');
                    };
                }
            });
        };

        //opportunity to subscribe and invite friend to event
        $scope.subscribeOnEvent = function() {
            event.stopPropagation();
        };

        $scope.inviteFriend = function(event, eventItem) {
            event.stopPropagation();
            userService.getAll().then(function(response) {
                $scope.users = response;
            }, rejected);


            $uibModal.open({
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                templateUrl: 'inviteFriendForEvent.html',
                scope: $scope,
                controller: function($uibModalInstance, $scope) {
                    $scope.newInvitation = {
                        userSender: userService.getUserInfo(),
                        userReceiver: null,
                        event: eventItem
                    }

                    $scope.getSelectedUser = function() {
                        $scope.newInvitation.userReceiver = $scope.selectedFriend;
                    };

                    $scope.invite = function(invitation) {
                        itemEventService.sendInvitation($scope.newInvitation).then(function(response) {
                            // TODO: add user notification about success
                        }, rejected);

                        $uibModalInstance.close();
                    };

                    $scope.cancel = function() {
                        $scope.newTnvitation = null;
                        $uibModalInstance.dismiss('cancel');
                    };
                }
            });
        }

        //error handling
        function rejected(error) {
            console.log('Error: ' + error.data.status);
        }
    }

    itemEventController.$inject = [
        "$scope",
        "$location",
        "em.events.add-item-event-service",
        "$uibModal",
        "userService"
    ];

})();
