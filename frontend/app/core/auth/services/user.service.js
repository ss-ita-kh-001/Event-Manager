(function() {
    'use strict';

    angular.module('em').factory('userService', userService);

    userService.$inject = ['em.mainApiService', '$location', 'flashService', '$rootScope'];

    function userService(mainApiService, $location, flashService, $rootScope) {
        $rootScope.itemsPerPage = 10;
        $rootScope.allUsers = [];

        var service = {};
        var userInfo;
        var userEvents;

        service.getCurrentUser = getCurrentUser;

        service.getUsers = getUsers;
        service.getById = getById;
        service.getUserEvents = getUserEvents;
        service.getUsersByEvent = getUsersByEvent;
        service.create = create;
        service.update = update;
        service.remove = remove;
        service.authentication = authentication;
        service.forgotPassword = forgotPassword;
        service.getByUserToken = getByUserToken;
        service.updatePassword = updatePassword;
        service.setUserInfo = setUserInfo;
        service.getUserInfo = getUserInfo;

        service.setCurrentUserEvents = setCurrentUserEvents;
        service.getCurrentUserEvents = getCurrentUserEvents;

        return service;

        function getUsers(index) {
            return mainApiService.get('users', index).then(handleSuccess, handleError('Error getting all users'));
        }

        function getCurrentUser() {
            return mainApiService.get('me').then(handleSuccess, handleError('Error getting all users'));
        }

        function forgotPassword(email, callback) {
            return mainApiService.post('forgot', email).then(function(res) {
                flashService.success('An e-mail has been sent to ' + res.config.data.email + ' with further instructions.', true);
                callback();
            });
        }

        function getByUserToken(token) {
            return mainApiService.post('reset', token).then(function(res) {
                if (res.data == 'true') {
                    console.log('ok');
                } else {
                    flashService.error('Token has expired', true);
                    $location.path("/forgot");
                }
            });
        }

        function authentication(authdata) {
            return mainApiService.post('login', authdata).then(handleSuccess, handleError('Error getting all users'));
        }

        function getById(id) {
            return mainApiService.get('profile/' + id).then(handleSuccess, handleError('Error getting user by id'));
        }

        // function getUserEvents(id) {
        //     return mainApiService.get("users-events/" + id)
        // }
        function getUserEvents() {
            return mainApiService.get("users-events")
        }

        function getUsersByEvent(id) {
            return mainApiService.get("event-users/" + id)
        }

        function create(user) {
            mainApiService.post("users", user).then(function(res) {
                flashService.success('Registration is successful', true);
                $location.path("/login");
            }).catch(function(error) {
                console.log(error);
            });
        }

        function updatePassword(user) {
            mainApiService.post("reset/token", user).then(function(res) {
                flashService.success('Success! Your password has been changed', true);
                $location.path("/login");
            }).catch(function(error) {
                console.log(error);
            });
        }

        function update(user) {
            return mainApiService.put('me', user).then(handleSuccess, handleError('Error updating user'));
        }

        function remove(id) {
            return mainApiService.remove('users' + id).then(handleSuccess, handleError('Error deleting user'));
        }

        // private functions

        function handleSuccess(res) {
            return res.data;
        }

        function handleError(error) {
            return function() {
                return {
                    success: false,
                    message: error
                };
            };
        }

        //set and get information about current loged user

        function setUserInfo(user) {
            localStorage.setItem('userId', user.id);
            localStorage.setItem('fullName', user.full_name);
            userInfo = user;
        }

        function getUserInfo() {
            return userInfo;
        }

        function getCurrentUserEvents() {
            return userEvents;
        }

        function setCurrentUserEvents(events) {
            userEvents = events;
        }

    }
})();
