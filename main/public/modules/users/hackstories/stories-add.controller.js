(function() {
    'use strict';
    var module = angular.module('users');

    module.controller('StoriesAddController', function($rootScope, $scope, $log, $http,
                                                       ngToast, $state, Restangular, gaAuthentication) {

        if (!gaAuthentication.user.is_complete){
            ngToast.warning({
                content: 'Please complete your profile. Click here to go to your profile.',
                stateChange: 'dashboard.profile'
            });
            $scope.onStoryHeaderButtonClick(true);
        }

        var ctrl = this;
        $scope.story = {};

        ctrl.getStory = function() {
            $scope.isStoryLoading = true;
            Restangular.one('stories', $scope.user.email).get().then(function(data){
                $scope.story = data;
            }).finally(function(){
                $scope.isStoryLoading = false;
            });
        };

        ctrl.getStory();

        function pushStory(data){
            var storyFound = false;
                angular.forEach($scope.stories, function(value, index){
                    if (value.id == data.id){
                        storyFound = true;
                        $scope.stories[index] = data;
                    }
                });
                if (!storyFound)
                    $scope.stories.push(data);
        }

        $scope.submit = function(){
            $scope.submittingForm = true;
            Restangular.all('stories').post($scope.story).then(function(data){
                ngToast.create('Thank you, your story is shared!');
                $scope.user.has_story = true;
                pushStory(data);
                // close add stories dialog
                $scope.onStoryHeaderButtonClick(true);
            }, function(error){
                $log.debug(error);
            }).finally(function(){
                $scope.submittingForm = false;
            });
        };

        $scope.cancel = function(){
            $scope.onStoryHeaderButtonClick(false);
            $scope.storyForm.$setPristine();
            $scope.pushStory(null);
            $state.go('dashboard.stories');
        };
    });
}());
