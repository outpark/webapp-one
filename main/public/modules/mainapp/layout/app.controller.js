(function() {
    'use strict';
    var module = angular.module('mainapp');

    module.controller('AppController', function($scope, $log) {
        $log.debug('App Controller active');
    });

    module.controller('AppNavbarController', function($scope, $log){

    });
}());