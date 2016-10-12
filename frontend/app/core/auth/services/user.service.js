(function() {
    'use strict';

    angular.module('em').factory('userService', userService);

    userService.$inject = ['$http', 'em.mainApiService', '$location', '$rootScope'];

    function userService($http, mainApiService, $location, $rootScope) {
        var service = {};

        service.getAll = getAll;
        service.getById = getById;
      //  service.getByUserEmail = getByUserEmail;
        service.create = create;
        service.update = update;
        service.remove = remove;
        service.authentication = authentication;

        return service;

        function getAll() {
            return mainApiService.get('users').then(handleSuccess, handleError('Error getting all users'));
        }
        function authentication(email, password) {
          var authdata = {
            email: email,
            password: password
          };
          console.log(authdata);
          return mainApiService.post('login', authdata).then(handleSuccess, handleError('Error getting all users'));
        }

        function getById(id) {
            return mainApiService.get('users' + '/' + id).then(handleSuccess, handleError('Error getting user by id'));
        }

    /*    function getByUserEmail(email) {
          console.log('user emailllll');
            var all = getAll().then(function(res){
              console.log('res: ' + res);
              var j;
              for (var i = 0; i < res.length; i++) {
                if(email == res[i].email) {
                  console.log('res[i].email: ' + res[i].email);
                  j = res[i];
                  console.log('check: ' + j);
                  return j;
                }
              }
              console.log('j: '+ j);
              return j;
            });
            console.log('all: ' + all);

            //return mainApiService.get('users', email).then(handleSuccess, handleError('Error getting user by username'));
        } */

        function create(user) {
            mainApiService.post("users", user).then(function(res) {
                $location.path("/login");
            }).catch(function(error) {
                console.log(error);
            });
        }

        function update(user) {
            return mainApiService.put('users' + user.id, user).then(handleSuccess, handleError('Error updating user'));
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
