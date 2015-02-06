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

///#source 1 1 /App/PokerServer.js
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

///#source 1 1 /App/RoomController.js
(function() {
    'use strict';

    angular.module('scrumPokerControllers').controller('room', [
        '$scope', 'PokerServer', '$routeParams', function($scope, server, $routeParams) {
            $scope.server = server;
            $scope.roomId = $routeParams.roomId;
            $scope.participation = "viewer";

            $scope.allowedBets = [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89];

            server.Reconnect().then(function() {
                server.JoinRoom($scope.roomId).then(function(roomInfo) {
                    server.currentRoom = roomInfo;
                });
            });

            $scope.$on('$destroy', function() {
                server.LeaveRoom();
            });

            $scope.Bet = function(value) {
                if (value === '-')
                    value = null;
                server.Bet(value);
            };

            $scope.setName = function(name) {
                $scope.participation = 'changing';
                server.ChangeParticipation(name).then(
                    function() {
                        $scope.serverName = name;
                        $scope.participation = (name === null) ? "viewer" : "voter";
                    },
                    function() {
                        $scope.participation = (name === null) ? "viewer" : "voter";
                    });
            }

        }
    ]);

})();

