(function() {
    'use strict';
    var module = angular.module('mainapp');

    /**
     * @name gaAuthentication
     * @memberOf angularModule.core
     * @description
     * This service holds user object, so it can be used in any controller
     */
    module.factory('GoogleIntegration', function (GAuth, GApi, $q, $http, $log, $window) {
        /**
         * Google api init
         */
        var CLIENT_ID = '573911340805-6p0g7sejr7ag93aujibujfeq67ek8f95.apps.googleusercontent.com';
        var SCOPES = [
            'https://www.googleapis.com/auth/drive.file',
            'email',
            'profile'
            // Add other scopes needed by your application.
        ];
        var CREATE_FILE_URL = 'https://www.googleapis.com/drive/v2/files';
        GAuth.setClient(CLIENT_ID);
        GAuth.setScope(SCOPES);
        GApi.load('drive', 'v2');

        var me = {
            isLoggedIn: false,
            login: function(){
                var _deferred = $q.defer();
                if (me.isLoggedIn) {
                    _deferred.resolve();
                } else {
                    GAuth.login().then(function () {
                        me.isLoggedIn = true;
                        _deferred.resolve();
                    }, function (error) {
                        _deferred.reject(error);
                    });
                }
                return _deferred.promise;
            },
            uploadFile: function(file){
                //get the auth token
                var _deferred = $q.defer();
                GAuth.getToken().then(function(data) {
                    //first create a file resource
                    $http.post(CREATE_FILE_URL, {
                        "title": file.name || "HACKNYU-resume",
                        "mimeType": file.type,
                        "description": "HACKNYU Resume 2016"
                    }, {
                        params:{
                            uploadType: 'multipart',
                            convert: true,
                            ocr: true
                        },
                        headers: {
                            'Authorization': "Bearer " + data.access_token
                        }
                    }).then(function (fileResource) { // got back the data for new file, now upload content
                        var fileId = fileResource.data.id;
                        const boundary = '-------314159265358979323846';
                        const delimiter = "\r\n--" + boundary + "\r\n";
                        const close_delim = "\r\n--" + boundary + "--";

                        var reader = new FileReader();
                        reader.readAsBinaryString(file);
                        reader.onload = function(e) {
                            var contentType = file.type || 'application/octet-stream';
                            // Updating the metadata is optional and you can instead use the value from drive.files.get.
                            var base64Data = btoa(reader.result);
                            var multipartRequestBody =
                                delimiter +
                                'Content-Type: application/json\r\n\r\n' +
                                JSON.stringify({
                                    "title": file.name || "HACKNYU-resume",
                                    "mimeType": file.type,
                                    "description": "HACKNYU Resume 2016"
                                }) +
                                delimiter +
                                'Content-Type: ' + contentType + '\r\n' +
                                'Content-Transfer-Encoding: base64\r\n' +
                                '\r\n' +
                                base64Data +
                                close_delim;

                            var request = $window.gapi.client.request({
                                'path': '/upload/drive/v2/files/' + fileId,
                                'method': 'PUT',
                                'params': {'uploadType': 'multipart', 'alt': 'json', convert:true},
                                'headers': {
                                    'Content-Type': 'multipart/mixed; boundary="' + boundary + '"'
                                },
                                'body': multipartRequestBody});
                            var callback = function(file) {
                                _deferred.resolve(file);
                            };
                            request.execute(callback);
                        }
                    }, _deferred.reject); //after url get
                }, _deferred.reject); //after auth token get
                return _deferred.promise;
            },
            getFiles: function(){
                return GApi.executeAuth('drive', 'files.list');
            },
            getFile: function(file){
                return GApi.executeAuth('drive', 'files.get', {fileId: file.id});
            },
            deleteFile: function(file){
                return GApi.executeAuth('drive', 'files.delete', {fileId: file.id})
            }
        };

        GAuth.checkAuth().then(function() {
                me.isLoggedIn = true;
            }, function(error) {
                me.isLoggedIn = false;
            }
        );
        return me;
    });
}());