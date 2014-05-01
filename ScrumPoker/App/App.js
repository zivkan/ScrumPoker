var scrumPokerApp = angular.module('scrumPokerApp', ['ngRoute', 'ui.bootstrap', 'scrumPokerControllers']);

scrumPokerApp.config([
    '$routeProvider', function ($routeProvider) {
        $routeProvider.when('/', {
            templateUrl: 'partials/lobby.html',
            controller: 'lobby'
        }).
            when('/room/:roomId', {
                templateUrl: 'partials/room.html',
                controller: 'room'
            }).
            otherwise({ redirectTo: '/' });
    }
]);

scrumPokerApp.factory('PokerServer', [
    '$rootScope', '$location', function ($rootScope, $location) {
        var PokerServer = this;

        PokerServer.rooms = null;
        PokerServer.roomMessages = [];

        var lobby = $.connection.lobbyHub;

        lobby.client.roomAdded = function (room) {
            PokerServer.rooms.push(room);
            $rootScope.$apply();
        };

        lobby.client.roomDeleted = function (roomId) {
            var getRoomIndex = function (roomId) {
                for (var i = 0; i < PokerServer.rooms.length; i++) {
                    if (PokerServer.rooms[i].Id == roomId) {
                        return i;
                    }
                }
                return -1;
            }
            var roomIndex = getRoomIndex(roomId);
            if (roomIndex != -1) {
                PokerServer.rooms.splice(roomIndex, 1);
                $rootScope.$apply();
            }
        }

        var room = $.connection.roomHub;
        room.client.roomMessage = function (message) {
            PokerServer.roomMessages.push(message);
            $rootScope.$apply();
        }

        $.connection.hub.start().done(function () {
            lobby.server.getRooms().done(function (rooms) {
                PokerServer.rooms = rooms;
                $rootScope.$apply();
            });
        });

        PokerServer.CreateRoom = function (roomName, userName) {
            lobby.server.createRoom(roomName, userName).done(function (result) {
                if (result.roomId != null) {
                    PokerServer.currentRoom = { id: result.roomId, name: roomName };
                    $location.path('/room/' + result.roomId);
                    $rootScope.$apply();
                }
            });
        }

        PokerServer.SendRoomMessage = function(message) {
            room.server.sendMessage(message);
        }

        return PokerServer;
    }
]);

var scrumPokerControllers = angular.module('scrumPokerControllers', []);

scrumPokerControllers.controller('lobby', [
    '$scope', 'PokerServer', function ($scope, server) {
        $scope.server = server;
    }
]);

scrumPokerControllers.controller('room', [
    '$scope', 'PokerServer', '$routeParams', function($scope, server, $routeParams) {
        $scope.server = server;
        $scope.roomId = $routeParams.roomId;
    }
]);
