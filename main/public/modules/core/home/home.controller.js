(function() {
    'use strict';
    var module = angular.module('core');

    module.controller('HomeController', function($scope, $log) {

        $log.debug('Home Controller active');
        $scope.timerEndTime = new Date('2015-11-21').getTime();
        return;
    });
}());
