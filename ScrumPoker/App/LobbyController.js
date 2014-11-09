(function () {
    'use strict';

    angular.module('scrumPokerControllers').controller('lobby', [
        '$scope', 'PokerServer', function ($scope, server) {
            $scope.server = server;

            $scope.rooms = null;

            server.Reconnect().then(function () {
                server.getRooms().then(function (data) {
                    $scope.rooms = data;
                });
            });

            server.$on('roomAdded', function (event, room) {
                $scope.$apply(function () {
                    if ($scope.rooms != null) {
                        $scope.rooms.push(room);
                    }
                });
            });

            server.$on('roomDeleted', function (event, roomId) {
                for (var i = 0; i < $scope.rooms.length; i++) {
                    if ($scope.rooms[i].Id === roomId) {
                        $scope.$apply(function () { $scope.rooms.splice(i, 1); });
                        break;
                    }
                }
            });

        }
    ]);

})();
