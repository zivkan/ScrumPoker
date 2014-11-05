(function() {
    'use strict';
    angular.module('scrumPokerApp').factory('PokerServer', [
        '$rootScope', '$location', '$modal', '$q', function($rootScope, $location, $modal, $q) {
            var PokerServer = $rootScope.$new();

            PokerServer.currentRoom = null;

            var lobby = $.connection.lobbyHub;

            PokerServer.getRooms = function() {
                return $q.when(lobby.server.getRooms());
            };

            lobby.client.roomAdded = function(room) {
                PokerServer.$emit('roomAdded', room);
            };

            lobby.client.roomDeleted = function (roomId) {
                PokerServer.$emit('roomDeleted', roomId);
            };

            var room = $.connection.roomHub;
            room.client.roomUpdate = function(participants) {
                if (PokerServer.currentRoom !== null) {
                    PokerServer.currentRoom.participants = participants;
                    $rootScope.$apply();
                }
            };

            PokerServer.modalInstance = null;

            $.connection.hub.stateChanged(function(stateInfo) {
                if (stateInfo.newState !== $.connection.connectionState.connected) {
                    if (PokerServer.modalInstance === null) {
                        PokerServer.modalInstance = $modal.open({
                            templateUrl: 'partials/connection.html',
                            controller: 'connection',
                            backdrop: 'static'
                        });
                    }
                } else {
                    if (PokerServer.modalInstance !== null) {
                        PokerServer.modalInstance.dismiss();
                        PokerServer.modalInstance = null;
                    }
                }
            });

            PokerServer.Reconnect = function() {
                return $q.when($.connection.hub.start());
            };

            PokerServer.CreateRoom = function(roomName, userName) {
                lobby.server.createRoom(roomName, userName).done(function(result) {
                    if (result.RoomId !== null) {
                        PokerServer.currentRoom = { id: result.RoomId, name: roomName };
                        PokerServer.currentRoom.participants = result.participants;
                        $location.path('/room/' + result.RoomId);
                        $rootScope.$apply();
                    }
                });
            };

            PokerServer.JoinRoom = function(roomId, userName) {
                room.server.joinRoom(roomId, userName).done(function(result) {
                    PokerServer.currentRoom = { id: roomId, username: userName, name: 'later' };
                    PokerServer.currentRoom.participants = result;
                    if ($location.$$path.indexOf('/room/') === -1) {
                        $location.path('/room/' + roomId);
                    }
                    $rootScope.$apply();
                });
            };

            PokerServer.Bet = function(amount) {
                room.server.bet(amount);
            };

            $rootScope.$on('$locationChangeStart', function(event, newUrl, oldUrl) {
                if (oldUrl.indexOf('/room/') !== -1) {
                    if (PokerServer.currentRoom !== null) {
                        room.server.leaveRoom();
                        PokerServer.currentRoom = null;
                    }
                }
            });

            return PokerServer;
        }
    ]);
})();
