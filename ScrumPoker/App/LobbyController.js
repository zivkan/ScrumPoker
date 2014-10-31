(function () {
    'use strict';

    angular.module('scrumPokerControllers').controller('lobby', [
        '$scope', 'PokerServer', function($scope, server) {
            $scope.server = server;
        }
    ]);

})();
