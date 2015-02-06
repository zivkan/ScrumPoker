(function() {
    'use strict';
    angular.module('scrumPokerApp').factory('PokerServer', [
        '$rootScope', '$location', '$modal', '$q', function($rootScope, $location, $modal, $q) {
            // 'class' and connection method
            var PokerServer = $rootScope.$new();

            PokerServer.Reconnect = function() {
                return $q.when($.connection.hub.start());
            };

            // lobby methods & events
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

            lobby.client.roomChanged = function(room) {
                PokerServer.$emit('roomUpdated', room);
            }

            // room methods & events
            PokerServer.currentRoom = null;
            var room = $.connection.roomHub;

            room.client.roomUpdate = function(participants) {
                if (PokerServer.currentRoom !== null) {
                    PokerServer.currentRoom.Voters = participants.Participants;
                    PokerServer.currentRoom.Viewers = participants.Viewers;
                    PokerServer.currentRoom.average = participants.Average;
                    PokerServer.currentRoom.majority = participants.MajorityVote;
                    $rootScope.$apply();
                }
            };

            PokerServer.CreateRoom = function(roomName) {
                return $q.when(lobby.server.createRoom(roomName));
            };

            PokerServer.JoinRoom = function(roomId) {
                return $q.when(room.server.joinRoom(roomId));
            };

            PokerServer.ChangeParticipation = function(username) {
                return $q.when(room.server.changeParticipation(username));
            };

            PokerServer.LeaveRoom = function() {
                return $q.when(room.server.leaveRoom());
            };

            PokerServer.Bet = function(amount) {
                room.server.bet(amount);
            };


            // Connect problem dialog
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

            return PokerServer;
        }
    ]);
})();
