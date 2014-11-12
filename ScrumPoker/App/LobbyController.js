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

            var goToRoom = function(roomId, roomName, userName, participants) {
                server.currentRoom = { id: roomId, name: roomName, username: userName };
                server.currentRoom.participants = participants;
                $location.path('/room/' + roomId);
            };

            $scope.CreateRoom = function(roomName, userName) {
                server.CreateRoom(roomName, userName).then(function(result) {
                    if (result.RoomId !== null) {
                        goToRoom(result.RoomId, roomName, userName, result.participants);
                    }
                });
            };

            $scope.JoinRoom = function (roomId, userName) {
                server.JoinRoom(roomId, userName).then(function (result) {
                    goToRoom(roomId, 'unknown', userName, result);
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

        }
    ]);

})();
