(function() {

    angular.module('em').controller('em.navbarController', navbarController);

    function navbarController($scope, $auth, $location, $timeout, userService) {
        console.log('navbar');
        $scope.isAuthenticated = function() {
            return $auth.isAuthenticated();
        };
        if ($auth.isAuthenticated()) {
            userService.getCurrentUser().then(function(data) {
                $scope.currentUser = data[0];
            });
        }

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
        $scope.setActiveClass = function() {
            var path = $location.path();
            var eventCheck = path.split('').slice(0, 6).join('');
            if (eventCheck === '/event') {
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
            if (!userService.getUserInfo()) {
                userService.getCurrentUser().then(function(data) {
                    userService.setUserInfo(data[0]);
                });
            }
            $scope.currentUser = userService.getUserInfo();
        };
        $scope.setActiveClass();


    }
    navbarController.$inject = ['$scope', '$auth', '$location', '$timeout', 'userService'];
})();
