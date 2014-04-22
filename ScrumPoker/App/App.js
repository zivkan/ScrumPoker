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

var scrumPokerControllers = angular.module('scrumPokerControllers', ['SignalR']);

scrumPokerControllers.controller('lobby', ['$scope', '$rootScope', 'Hub', function ($scope, $rootScope, Hub) {
    $scope.rooms = [];
    $scope.messages = [];
    $scope.hub = new Hub('lobbyHub', {
        'newMessage': function(message) {
            //if (message != null) {
                $scope.messages.push(message);
                $rootScope.$apply();
            //}
        }
    },['click']);

}]);
scrumPokerControllers.controller('room', ['$scope', function($scope) {}]);