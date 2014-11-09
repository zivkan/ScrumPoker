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
                if (newValue !== null) {
                    if (newValue === '-')
                        newValue = null;
                    $scope.server.Bet(newValue);
                }
            });

            $scope.allowedBets = [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89];
        }
    ]);

})();

