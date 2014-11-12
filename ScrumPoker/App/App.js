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
                if (state === $.connection.connectionState.connecting)
                    return "connecting";
                if (state === $.connection.connectionState.reconnecting)
                    return "reconnecting";
                if (state === $.connection.connectionState.disconnected)
                    return "disconnected";
                if (state === $.connection.connectionState.connected)
                    return "connected";
                return "unknown state";
            };

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

///#source 1 1 /App/PokerServer.js
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

///#source 1 1 /App/RoomController.js
(function() {
    'use strict';

    angular.module('scrumPokerControllers').controller('room', [
        '$scope', 'PokerServer', '$routeParams', function($scope, server, $routeParams) {
            $scope.server = server;
            $scope.roomId = $routeParams.roomId;

            $scope.allowedBets = [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89];

            server.Reconnect();

            $scope.JoinRoom = function(roomId, userName) {
                server.JoinRoom(roomId, userName).then(function(result) {
                    server.currentRoom = { id: roomId, name: 'unknown', username: userName };
                    server.currentRoom.participants = result;
                });
            };

            $scope.Bet = function(value) {
                if (value === '-')
                    value = null;
                server.Bet(value);
            };

        }
    ]);

})();

