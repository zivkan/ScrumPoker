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

scrumPokerControllers.controller('lobby', ['$scope', '$http', function ($scope, $http) {
    $scope.rooms = [];
}]);
scrumPokerControllers.controller('room', ['$scope', function($scope) {}]);