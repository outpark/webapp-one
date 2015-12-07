/**
 * Created by sajarora on 10/8/15.
 */
(function(){
    'use strict';
    var module = angular.module('users');

    /**
     * @name gaimageUrlUpload
     */
    module.directive('projectView', function(){
        var controller = function($scope, Restangular, $fb, $twt){
            var nextCursor = '';
            var more = true;
            $scope.projectsModel = [];

            function getProjects() {
                if (!more) {
                    return;
                }
                $scope.isLoading = true;
                if ($scope.username) {
                    Restangular.one('users', $scope.username).get().then(function (data) {
                        $scope.projectUser = data;
                        $scope.isLoading = true;
                        $scope.projectUser.all('projects').getList({cursor: nextCursor, filter: $scope.filter})
                            .then(function(projects){
                                $scope.projectsModel = $scope.projectsModel.concat(projects);
                                nextCursor = projects.meta.nextCursor;
                                more = projects.meta.more;
                                $scope.totalCount = projects.meta.totalCount;
                            }).finally(function(){
                                $scope.isLoading = false;
                            });
                    }).finally(function(){
                        $scope.isLoading = false;
                    });
                } else {
                    Restangular.all('projects').getList({cursor: nextCursor, filter: $scope.filter}).then(function(projects) {
                        $scope.projectsModel = $scope.projectsModel.concat(projects);
                        nextCursor = projects.meta.nextCursor;
                        more = projects.meta.more;
                        $scope.totalCount = projects.meta.totalCount;
                    }).finally(function(){
                        $scope.isLoading = false;
                    });
                }
            }

            getProjects();

            $scope.readMore = function(){
                getProjects();
            };

            $scope.shareFacebook = function(project){
                $fb.feed({
                    name: project.owner_name + ": Dental Hackathon Project",
                    description: "Transform Oral Care Through Technology.",
                    caption: project.elevator,
                    link: "http://dentalhackathon.org",
                    picture: "https://dental-hackathon-test.appspot.com/p/modules/core/img/banner_dental_hackathon.png"
                });
            };

            $scope.shareTwitter = function(project){
                var text = 'Read ' + project.owner_name + '\'s Dental Hackathon project.';
                var url = 'http://dentalhackathon.org/projects/' + project.owner_username;
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
                projectsModel: '=',
                username: '='
            },
            controller: controller,
            templateUrl: '/p/modules/core/directives/projectView.html'
        };
    });
}());