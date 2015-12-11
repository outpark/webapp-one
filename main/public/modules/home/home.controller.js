(function() {
    'use strict';
    var module = angular.module('core');

    module.controller('HomeController', function($scope, $log) {
        $log.debug('Home Controller active');
    });

    module.controller('HomeNavbarController', function($scope, $log){

    });
}());