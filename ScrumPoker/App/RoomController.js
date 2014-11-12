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
