(function() {

    angular.module('em').controller('em.navbarController', navbarController);

    function navbarController($scope, $auth, $location, $timeout, userService) {
        $scope.isAuthenticated = function() {
            return $auth.isAuthenticated();
        };
        $scope.getId = function() {
            $scope.id = localStorage.getItem("userId");
        };
        $scope.menuItems = [{
            href: '/',
            name: 'main'
        }, {
            href: '/events',
            name: 'events'
        }, {
            href: '/users',
            name: 'users'
        }, {
            href: '/results',
            name: 'results'
        }, {
            href: '/login',
            name: 'login'
        }, {
            href: '/chat',
            name: 'chat'
        }, {
            href: '/profile/' + localStorage.getItem("userId"),
            name: 'profile'
        }, {
            href: '/register',
            name: 'register'
        }];
        $scope.getCurrentUser = function() {
            if (userService.getUserInfo()) {
                console.log('first if');
                $scope.currentUser = userService.getUserInfo();
                return;
            }
            if (localStorage.getItem("userId")) {
                userService.getById(localStorage.getItem("userId"))
                    .then(function(response) {
                      console.log('second if');
                        if (Array.isArray(response) && response.length > 0) {
                            userService.setUserInfo(response[0]);
                            $scope.currentUser = userService.getUserInfo();
                        }
                    });
            };
        };
        $scope.getCurrentUser();
        $scope.idInit = function() {
            $scope.menuItems[6].href = '/profile/' + localStorage.getItem("userId");
        };
        $scope.setActiveClass = function() {
            $scope.getCurrentUser();
            var path = $location.path();
            $scope.idInit();
            for (var i = 0; i < $scope.menuItems.length; i++) {
                if ($scope.menuItems[i].href == path) {
                    $scope.thisActive = $scope.menuItems[i].name;
                }
            };
        };
        $scope.classHandler = function() {
            $timeout($scope.setActiveClass, 10);
        };
      //  $scope.getCurrentUser();
        $scope.setActiveClass();
    }
    navbarController.$inject = ['$scope', '$auth', '$location', '$timeout', 'userService'];
})();
