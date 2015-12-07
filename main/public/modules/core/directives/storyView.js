/**
 * Created by sajarora on 10/8/15.
 */
(function(){
    'use strict';
    var module = angular.module('users');

    /**
     * @name gaimageUrlUpload
     */
    module.directive('storyView', function(){
        var controller = function($scope, Restangular, $fb, $twt){
            var nextCursor = '';
            var more = true;
            $scope.storyModel = [];

            function getStories() {
                if (!more) {
                    return;
                }
                $scope.isLoading = true;
                Restangular.all('stories').getList({cursor: nextCursor, filter: $scope.filter}).then(function(stories) {
                    $scope.storyModel = $scope.storyModel.concat(stories);
                    nextCursor = stories.meta.nextCursor;
                    more = stories.meta.more;
                    $scope.totalCount = stories.meta.totalCount;
                }).finally(function() {
                    $scope.isLoading = false;
                });
            }

            getStories();

            $scope.readMore = function(){
                getStories();
            };

            $scope.shareFacebook = function(story){
                $fb.feed({
                    name: story.owner_name + ": Dental Hackathon Story",
                    description: "Transform Oral Care Through Technology.",
                    caption: story.text,
                    link: "http://dentalhackathon.org",
                    picture: "https://dental-hackathon-test.appspot.com/p/modules/core/img/banner_dental_hackathon.png"
                });
            };

            $scope.shareTwitter = function(story){
                var text = 'Read ' + story.owner_name + '\'s Dental Hackathon story.';
                var url = 'http://dentalhackathon.org/stories/' + story.owner_username;
                $twt.intent('tweet', {
                    text : text,
                    url  : url,
                    hashtags: 'ChallengeOralCare',
                    via: 'dentalhackathon16'
                });
            };
        };

        var link = function(scope, el, attrs, ctrls) {

        };

        return {
            link: link,
            restrict: 'E',
            replace: true,
            scope: {
                storyModel: '='
            },
            controller: controller,
            templateUrl: '/p/modules/core/directives/storyView.html'
        };
    });
}());