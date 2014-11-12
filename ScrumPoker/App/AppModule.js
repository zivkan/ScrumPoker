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
