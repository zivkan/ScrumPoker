(function() {
    'use strict';
    angular.module('scrumPokerApp').factory('PokerServer', [
        '$rootScope', '$location', '$modal', function($rootScope, $location, $modal) {
            var PokerServer = this;

            PokerServer.rooms = null;
            PokerServer.currentRoom = null;

            var lobby = $.connection.lobbyHub;

            lobby.client.roomAdded = function(room) {
                PokerServer.rooms.push(room);
                $rootScope.$apply();
            };

            lobby.client.roomDeleted = function(roomId) {
                var getRoomIndex = function(roomId) {
                    for (var i = 0; i < PokerServer.rooms.length; i++) {
                        if (PokerServer.rooms[i].Id === roomId) {
                            return i;
                        }
                    }
                    return -1;
                };
                var roomIndex = getRoomIndex(roomId);
                if (roomIndex !== -1) {
                    PokerServer.rooms.splice(roomIndex, 1);
                    $rootScope.$apply();
                }
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
                $.connection.hub.start().done(function() {
                    lobby.server.getRooms().done(function(rooms) {
                        PokerServer.rooms = rooms;
                        $rootScope.$apply();
                    });
                    if (PokerServer.currentRoom !== null) {
                        room.server.joinRoom(PokerServer.currentRoom.id, PokerServer.currentRoom.username);
                    }
                });
            };
            PokerServer.Reconnect();

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
