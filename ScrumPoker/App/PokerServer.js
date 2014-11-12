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

            PokerServer.CreateRoom = function (roomName, userName) {
                return $q.when(lobby.server.createRoom(roomName, userName));
            };

            PokerServer.JoinRoom = function(roomId, userName) {
                return $q.when(room.server.joinRoom(roomId, userName));
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
