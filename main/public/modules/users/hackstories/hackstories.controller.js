(function() {
    'use strict';
    var module = angular.module('users');

    module.controller('HackStoriesController', function($rootScope, $scope, $log, $state, dhColors) {

        $log.debug('Hack Stories controller active');
        $scope.setHeader('Stories.', null, dhColors.ORANGE);
        $scope.setHeaderButtonColor('btn-primary');

        var isAddStoryShown = false;

        $scope.onStoryHeaderButtonClick = function(forceShowAdd){
            if (!forceShowAdd && !isAddStoryShown) {
                $state.go('dashboard.stories.add');
                $scope.showHeaderButton('Done Sharing', $scope.onStoryHeaderButtonClick);
                isAddStoryShown = true;
            } else {
                $state.go('dashboard.stories');
                $scope.showHeaderButton('Share My Story', $scope.onStoryHeaderButtonClick);
                isAddStoryShown = false;
            }
        };

        $scope.showHeaderButton('Share My Story', $scope.onStoryHeaderButtonClick);

        $scope.stories = [];
    });
}());
