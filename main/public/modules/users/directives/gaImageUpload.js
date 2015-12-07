/**
 * Created by sajarora on 10/8/15.
 */
(function(){
    'use strict';
    var module = angular.module('users');

    /**
     * @name gaimageUrlUpload
     */
    module.directive('gaImageUpload', function(ngToast, $http){
        var link = function(scope, el, attrs, ctrls) {

            scope.getHelperText = function(){
                return scope.placeholder ? scope.placeholder : 'Square (1:1) images work best.';
            };

            scope.imageSelected = function(files){
                if (files == null || files[0] == null)
                    return;
                scope.form.$dirty = true;
                scope.form.$pristine = false;

                scope.imageUploading = true;
                scope.user.post('uploadurl').then(function(data) {
                    var fd = new FormData();
                    //Take the first selected file
                    fd.append("file", files[0]);
                    $http.post(data.upload_url, fd, {
                        withCredentials: true,
                        headers: {'Content-Type': undefined },
                        transformRequest: angular.identity
                    }).success(function(data){
                        scope.imageUrl = '/images/' + data.blob_key;
                        scope.onChange();
                        scope.imageUploading = false;
                    }).error(function(error){
                        ngToast.create('Failed to upload file.');
                        scope.imageUploading = false;
                    });
                }, function(error){
                    ngToast.create('Failed to get upload url.');
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
                onChange: '&'
            },
            templateUrl: '/p/modules/users/directives/gaImageUpload.html'
        };
    });
}());