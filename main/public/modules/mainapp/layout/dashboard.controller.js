(function() {
    'use strict';
    var module = angular.module('mainapp');

    module.controller('DashboardController', function($scope, $log) {
        $log.debug('Dashboard Controller active');
    });

    module.controller('AppNavbarController', function($scope, $log){

    });
}());