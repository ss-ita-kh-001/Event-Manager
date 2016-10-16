
(function() {
    'use strict';

    angular.module('em').factory('userService', userService);

    userService.$inject = ['$http', 'em.mainApiService', '$location', '$rootScope', 'flashService'];

    function userService($http, mainApiService, $location, $rootScope,flashService) {
        var service = {};

        service.getAll = getAll;
        service.getById = getById;
        service.getUserEvents = getUserEvents;
        //  service.getByUserEmail = getByUserEmail;
        service.create = create;
        service.update = update;
        service.remove = remove;
        service.authentication = authentication;

        return service;

        function getAll() {
            return mainApiService.get('users').then(handleSuccess, handleError('Error getting all users'));
        }

        function authentication(authdata) {
            return mainApiService.post('login', authdata).then(handleSuccess, handleError('Error getting all users'));
        }

        function getById(id) {
            return mainApiService.get('profile/' + id).then(handleSuccess, handleError('Error getting user by id'));
        }

        function getUserEvents (id) {
            return mainApiService.get("users-events/" + id)
        }

        function create(user) {
            mainApiService.post("users", user).then(function(res) {
                flashService.success('Registration is successful', true);
                $location.path("/login");
            }).catch(function(error) {
                console.log(error);
            });
        }

        function update(user) {
            console.log(user);
            return mainApiService.put('profile/' + user.id, user).then(handleSuccess, handleError('Error updating user'));
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
    }

})();
