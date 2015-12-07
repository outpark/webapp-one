/**
 * Created by sajarora on 10/8/15.
 */
(function(){
    'use strict';
    var module = angular.module('core');

    /**
     * @name gaimageUrlUpload
     */
    module.directive('listView', function(){
        var controller = function($scope, Restangular){
            var nextCursor = '';
            var more = true;
            $scope.ngModel = [];

            function getList() {
                if (!more) {
                    return;
                }
                $scope.isLoading = true;
                Restangular.all($scope.endpoint).getList({cursor: nextCursor, filter: $scope.filter}).then(function(invites) {
                    $scope.ngModel = $scope.ngModel.concat(invites);
                    nextCursor = invites.meta.nextCursor;
                    more = invites.meta.more;
                    $scope.totalCount = invites.meta.totalCount;
                }).finally(function() {
                    $scope.isLoading = false;
                });
            }

            getList();

            $scope.readMore = function(){
                getList();
            };
        };

        var link = function(scope, el, attrs, ctrls) {
            scope.getTemplateUrl = function(){
                return attrs.templateUrl;
            }
        };

        return {
            link: link,
            restrict: 'E',
            replace: true,
            scope: {
                ngModel: '=',
                endpoint: '@',
                templateUrl: '@'
            },
            controller: controller,
            template: '<div ng-include="getTemplateUrl()"></div>'
        };
    });
}());