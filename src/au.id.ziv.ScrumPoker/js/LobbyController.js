(function () {
    'use strict';

    angular.module('scrumPokerControllers').controller('lobby', [
        '$scope', 'PokerServer', '$location', function ($scope, server, $location) {
            $scope.rooms = null;

            server.Reconnect().then(function () {
                server.getRooms().then(function (data) {
                    $scope.rooms = data;
                });
            });

            $scope.CreateRoom = function(roomName) {
                server.CreateRoom(roomName).then(function(roomId) {
                    if (roomId !== null) {
                        $location.path('/room/' + roomId);
                    }
                });
            };

            server.$on('roomAdded', function (event, room) {
                $scope.$apply(function () {
                    if ($scope.rooms !== null) {
                        $scope.rooms.push(room);
                    }
                });
            });

            server.$on('roomDeleted', function (event, roomId) {
                var removeRoom = function(index) { $scope.rooms.splice(index, 1); };
                for (var i = 0; i < $scope.rooms.length; i++) {
                    if ($scope.rooms[i].Id === roomId) {
                        $scope.$apply(removeRoom(i));
                        break;
                    }
                }
            });

            server.$on('roomUpdated', function(event, room) {
                for (var i = 0; i < $scope.rooms.length; i++) {
                    if ($scope.rooms[i].Id === room.Id) {
                        $scope.$apply(function() {
                            $scope.rooms[i].Voters = room.Voters;
                            $scope.rooms[i].Viewers = room.Viewers;
                        });
                        break;
                    }
                }
            });

        }
    ]);

})();
