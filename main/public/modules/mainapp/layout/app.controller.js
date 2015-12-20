(function() {
    'use strict';
    var module = angular.module('mainapp');

    module.constant('Dimensions', {
        LG_SCREEN: 980,
        MD_SCREEN: 767,
        SM_SCREEN: 480
    });

    module.controller('AppController', function($scope, $window, $log) {
        $log.debug('App Controller active');
        $scope.showLeftSidebar = true;
        $scope.showRightSidebar = false;
    });

    module.controller('AppNavbarController', function($scope, $log){

    });
}());