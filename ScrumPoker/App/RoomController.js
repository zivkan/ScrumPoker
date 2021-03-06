﻿(function() {
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
