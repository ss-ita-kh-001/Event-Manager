(function () {
    'use strict';

    angular.module('em').factory('userService', userService);

    userService.$inject = ['$http'];
    function userService($http) {
        var service = {};

        service.getAll = getAll;
        service.getById = getById;
        service.getByUsername = getByUsername;
        service.create = create;
        service.update = update;
        service.remove = remove;

        return service;

        function getAll() {
            return $http.get('/api/users').then(handleSuccess, handleError('Error getting all users'));
        }

        function getById(id) {
            return $http.get('/api/users/' + id).then(handleSuccess, handleError('Error getting user by id'));
        }

        function getByUsername(username) {
            return $http.get('/api/users/' + username).then(handleSuccess, handleError('Error getting user by username'));
        }

        function create(user) {
            return $http.post('/api/users', user).then(handleSuccess, handleError('Error creating user'));
        }

        function update(user) {
            return $http.put('/api/users/' + user.id, user).then(handleSuccess, handleError('Error updating user'));
        }

        function remove(id) {
            return $http.remove('/api/users/' + id).then(handleSuccess, handleError('Error deleting user'));
        }

        // private functions

        function handleSuccess(res) {
            return res.data;
        }

        function handleError(error) {
            return function () {
                return { success: false, message: error };
            };
        }
    }

})();
