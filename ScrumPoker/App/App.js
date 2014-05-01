var scrumPokerApp = angular.module('scrumPokerApp', ['ngRoute', 'ui.bootstrap', 'scrumPokerControllers']);

scrumPokerApp.config([
    '$routeProvider', function ($routeProvider) {
        $routeProvider.when('/', {
            templateUrl: 'partials/lobby.html',
            controller: 'lobby'
        }).
            when('/room/:room', {
                templateUrl: 'partials/room.html',
                controller: 'room'
            }).
            otherwise({ redirectTo: '/' });
    }
]);

var scrumPokerControllers = angular.module('scrumPokerControllers', []);

scrumPokerControllers.controller('lobby', ['$scope', function ($scope) {
    $scope.rooms = null;

    $scope.hub = $.connection.lobbyHub;

    $scope.hub.client.roomAdded = function(room) {
        $scope.rooms.push(room);
        $scope.$apply();
    };
    $scope.hub.client.roomDeleted = function (roomId) {
        var getRoomIndex = function(roomId) {
            for (var i = 0; i < $scope.rooms.length; i++) {
                if ($scope.rooms[i].Id == roomId) {
                    return i;
                }
            }
            return -1;
        }
        var roomIndex = getRoomIndex(roomId);
        if (roomIndex != -1) {
            $scope.rooms.splice(roomIndex, 1);
            $scope.$apply();
        }
    }

    $.connection.hub.start().done(function() {
        $scope.hub.server.getRooms().done(function (rooms) {
                $scope.rooms = rooms;
            $scope.$apply();
        });
    });

    $scope.addRoomButton = function(name) {
        $scope.hub.server.addRoom(name).done(function(result) {
            var r = result;
        });
    }

}]);

scrumPokerControllers.controller('room', ['$scope', function ($scope) { }]);
