/**
 * Created by sajarora on 10/8/15.
 */
(function(){
    'use strict';
    var module = angular.module('core');

    /**
     * @name gaimageUrlUpload
     */
    module.directive('imageUpload', function($http){
        var link = function(scope, el, attrs, ctrls) {

            scope.getHelperText = function(){
                return scope.placeholder ? scope.placeholder : 'Square (1:1) images work best.';
            };
            scope.imageSelected = function(files){
                scope.error = false;
                if (files == null || files[0] == null)
                    return;
                scope.form.$dirty = true;
                scope.form.$pristine = false;

                scope.imageUploading = true;
                scope.user.post('uploadurl', scope.options).then(function(data) {
                    var fd = new FormData();
                    //Take the first selected file
                    fd.append("file", files[0]);
                    $http.post(data.upload_url, fd, {
                        withCredentials: true,
                        headers: {'Content-Type': undefined},
                        transformRequest: angular.identity
                    }).success(function(data){
                        scope.imageUrl = data.url || '/images/' + data.blob_key;
                        scope.onChange();
                        scope.imageUploading = false;
                    }).error(function(error){
                        scope.error = {
                            animation: 'shake',
                            message: 'Failed to upload file.'
                        };
                        scope.imageUploading = false;
                    });
                }, function(error){
                    scope.error = {
                        animation: 'shake',
                        message: 'Failed to get upload url.'
                    };
                    scope.imageUploading = false;
                });
            };
        };

        return {
            link: link,
            restrict: 'E',
            replace: true,
            scope: {
                imageUrl: '=',
                form: '=',
                user: '=',
                placeholder: '@',
                onChange: '&',
                options: '='
            },
            templateUrl: function(element, attrs) {
                return attrs.templateUrl || '/p/modules/core/directives/image-upload/image-upload.view.html';
            }
        };
    });
}());