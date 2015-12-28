(function() {
    'use strict';
    var module = angular.module('mainapp');

    /**
     * @name gaAuthentication
     * @memberOf angularModule.core
     * @description
     * This service holds user object, so it can be used in any controller
     */
    module.factory('FacebookIntegration', function ($q, $log, Facebook, Flash) {
        /**
         * Google api init
         */
        var SCOPES = 'email,user_education_history,user_work_history,' +
            'user_location,user_hometown,user_website';
        var ME_FIELDS = 'fields=education,work,email,location,hometown,website';

        var me = {
            isLoggedIn: false,
            login: function(){
                var _deferred = $q.defer();
                if (me.isLoggedIn) {
                    _deferred.resolve();
                } else {
                    Facebook.login(function(response){}, {
                        scope: SCOPES
                    }).then(function(response){
                        _deferred.resolve(response);
                    }, function(error){
                        Flash.create('danger', error);
                        $log.debug(error);
                        _deferred.reject(error);
                    });
                }
                return _deferred.promise;
            },
            getMe: function(){
                var _deferred = $q.defer();
                me.login().then(function(){
                    Facebook.api('/me?' + ME_FIELDS, function(response){
                        if (!response) {
                            Flash.create('danger', 'Failed to get your profile from Facebook');
                            _deferred.reject(response);
                        } else
                            _deferred.resolve(response);
                    });
                }, _deferred.reject);
                return _deferred.promise;
            }
        };

        return me;
    });
}());