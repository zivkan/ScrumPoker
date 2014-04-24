var scrumPokerApp = angular.module('scrumPokerApp', ['ngRoute', 'scrumPokerControllers']);

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
    $scope.rooms = [];
    $scope.messages = [];

    $scope.hub = $.connection.lobbyHub;

    $scope.hub.client.newMessage = function(message) {
        $scope.messages.push(message);
        $scope.$apply();
    };

    $.connection.hub.start();

}]);
scrumPokerControllers.controller('room', ['$scope', function ($scope) { }]);