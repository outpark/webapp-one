(function() {
    'use strict';
    var module = angular.module('core');

    /**
     * @name gaAuthentication
     * @memberOf angularModule.core
     * @description
     * This service holds user object, so it can be used in any controller
     */

    module.factory('gaAuthentication', function(gaAuthenticatedUser, Restangular, $q, $state) {
        var me = {
            user     : gaAuthenticatedUser,
            isLogged : function() {
                return !!me.user && me.user.id;
            },
            isAdmin  : function() {
                return me.isLogged() && me.user.admin;
            },
            setUser  : function(user) {
                me.user = Restangular.restangularizeElement(null, user, 'users');
                console.log(me.user);
            },
            getUser: function(){
                var _deferred = $q.defer();
                if (me.isLogged())
                    _deferred.resolve(me.user);
                else {
                    _deferred.reject('no user');
                }
                return _deferred.promise;
            }
        };

        return me;
    });

}());
