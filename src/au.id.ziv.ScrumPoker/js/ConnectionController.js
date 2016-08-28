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
