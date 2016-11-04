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
            href: '/event',
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
            href: '/me',
            name: 'me'
        }, {
            href: '/register',
            name: 'register'
        }];
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

        $scope.setActiveClass = function() {
            $scope.getCurrentUser();
            var path = $location.path();
            var eventCheck = path.split('').slice(0, 6).join('');
            if  (eventCheck === '/event') {
                path = eventCheck;
            }
            angular.forEach($scope.menuItems, function(value, key) {
                if ($scope.menuItems[key].href == path) {
                    $scope.thisActive = $scope.menuItems[key].name;
                }
            });
        };
        $scope.classHandler = function() {
            $timeout($scope.setActiveClass, 10);
            $scope.isCollapsed = false;
        };
        $scope.setActiveClass();
    }
    navbarController.$inject = ['$scope', '$auth', '$location', '$timeout', 'userService'];
})();
