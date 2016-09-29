(function() {
    angular.module("em")
    .constant("baseUrl", "http://localhost:2403/")
    .service("em.mainApiService", mainApiService);
    function mainApiService($http, baseUrl) {

        this.getItems = function(itemsName) {
            return $http.get(baseUrl + itemsName + '/').then(
                function (response) {
                    return response;
                },
                function (error) {
                    alert('Error: ' + error.data.status + '. ' + error.data.message);
                    return error;
                }
            );
        }

    }

    mainApiService.$inject = ["$http", "baseUrl"];

        // // создание нового элемента
        // $scope.create = function (item) {
        //     // HTTP POST
        //     // Отправка POST запроса для создания новой записи на сервере
        //     $http.post(baseUrl, item).success(function (item) {
        //         $scope.items.push(item);
        //         $scope.currentView = "table";
        //     });
        // }
        //
        // // обновление элемента
        // $scope.update = function (item) {
        //     // HTTP PUT
        //     // Отправка PUT запроса для обновления определенной записи на сервере
        //     $http({
        //         url: baseUrl + item.id,
        //         method: "PUT",
        //         data: item
        //     }).success(function (modifiedItem) {
        //         for (var i = 0; i < $scope.items.length; i++) {
        //             if ($scope.items[i].id == modifiedItem.id) {
        //                 $scope.items[i] = modifiedItem;
        //                 break;
        //             }
        //         }
        //         $scope.currentView = "table";
        //     });
        // }
        //
        // // удаление элемента из модели
        // $scope.delete = function (item) {
        //     // HTTP DELETE
        //     // отправка DELETE запроса по адресу http://localhost:2403/items/id что приводит к удалению записей на сервере
        //     $http({
        //         method: "DELETE",
        //         url: baseUrl + item.id
        //     }).success(function () {
        //         $scope.items.splice($scope.items.indexOf(item), 1);
        //     });
        // }
})();
