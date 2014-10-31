(function() {
    'use strict';

    angular.module('scrumPokerControllers').controller('room', [
        '$scope', 'PokerServer', '$routeParams', function($scope, server, $routeParams) {
            $scope.server = server;
            $scope.roomId = $routeParams.roomId;

            $scope.$watch('myBet', function(newValue, oldValue) {
                if (newValue != null) {
                    if (newValue === '-')
                        newValue = null;
                    $scope.server.Bet(newValue);
                }
            });

            $scope.allowedBets = [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89];
        }
    ]);

})();
