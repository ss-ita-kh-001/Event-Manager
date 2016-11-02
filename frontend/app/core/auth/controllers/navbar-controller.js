(function() {

    angular.module('em').controller('em.navbarController', navbarController);

    function navbarController($scope, $auth, $location, $timeout) {
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
        $scope.idInit = function() {
            $scope.menuItems[6].href = '/profile/' + localStorage.getItem("userId");
        };
        $scope.setActiveClass = function() {
            var path = $location.path();
            $scope.idInit();
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
})();
