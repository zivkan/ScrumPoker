///#source 1 1 /App/AppModule.js
(function() {
    'use strict';

    var scrumPokerApp = angular.module('scrumPokerApp', ['ngRoute', 'ui.bootstrap', 'scrumPokerControllers']);

    scrumPokerApp.config([
        '$routeProvider', function($routeProvider) {
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
})();

///#source 1 1 /App/ControllerModule.js
(function () {
    'use strict';
    angular.module('scrumPokerControllers', []);
})();

///#source 1 1 /App/ConnectionController.js
(function() {
    'use strict';

    angular.module('scrumPokerControllers').controller('connection', [
        '$scope', '$modalInstance', 'PokerServer',
        function($scope, $modalInstance, PokerServer) {
            $scope.PokerServer = PokerServer;

            var stateMessage = function(state) {
                if (state == $.connection.connectionState.connecting)
                    return "connecting";
                if (state == $.connection.connectionState.reconnecting)
                    return "reconnecting";
                if (state == $.connection.connectionState.disconnected)
                    return "disconnected";
                if (state == $.connection.connectionState.connected)
                    return "connected";
                return "unknown state";
            }

            $scope.connectionState = stateMessage($.connection.hub.state);

            $.connection.hub.stateChanged(function(stateInfo) {
                $scope.connectionState = stateMessage(stateInfo.newState);
                $scope.$apply();
            });

        }
    ]);

})();

///#source 1 1 /App/LobbyController.js
(function () {
    'use strict';

    angular.module('scrumPokerControllers').controller('lobby', [
        '$scope', 'PokerServer', function($scope, server) {
            $scope.server = server;
        }
    ]);

})();

///#source 1 1 /App/PokerServer.js
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

///#source 1 1 /App/RoomController.js
(function() {
    'use strict';

    angular.module('scrumPokerControllers').controller('room', [
        '$scope', 'PokerServer', '$routeParams', function($scope, server, $routeParams) {
            $scope.server = server;
            $scope.roomId = $routeParams.roomId;

            $scope.$watch('myBet', function(newValue, oldValue) {
                if (newValue != null) {
                    if (newValue === '-')
                        newValue = null;
                    $scope.server.Bet(newValue);
                }
            });

            $scope.allowedBets = [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89];
        }
    ]);

})();

