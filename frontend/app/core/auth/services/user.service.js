(function() {
    'use strict';

    angular.module('em').factory('userService', userService);

    userService.$inject = ['$http', 'em.mainApiService', '$location'];

    function userService($http, mainApiService, $location) {
        var service = {};

        service.getAll = getAll;
        service.getById = getById;
        service.getByUserEmail = getByUserEmail;
        service.create = create;
        service.update = update;
        service.remove = remove;

        return service;

        function getAll() {
            return mainApiService.get('users').then(handleSuccess, handleError('Error getting all users'));
        }

        function getById(id) {
            return mainApiService.get('profile/' + id).then(handleSuccess, handleError('Error getting user by id'));
        }

        function getByUserEmail(email) {
            return mainApiService.get('users' + email).then(handleSuccess, handleError('Error getting user by username'));
        }

        function create(user) {
            mainApiService.post("users", user).then(function(res) {
                $location.path("users" + res.data[0].id);
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
                return { success: false, message: error };
            };
        }
    }

})();
