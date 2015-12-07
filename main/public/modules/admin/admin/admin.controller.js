(function() {
    'use strict';
    var module = angular.module('admin');

    module.controller('AdminController', function($rootScope, $scope, $log, gaAuthentication,
                                                      ngToast, $state, gaBrowserHistory, gaAppConfig,
                                                      Restangular) {
        if (!gaAuthentication.isLogged()) { //redirect to login if not already logged in
            gaBrowserHistory.redirectLogin();
        }

        $scope.cfg = gaAppConfig;
        $scope.auth = gaAuthentication;
        $scope.user = $scope.auth.user;

        if (!$scope.user.admin) {
            gaBrowserHistory.goDashboardHome();
            ngToast.warning('Sorry, you are not an administrator...Learn to hack to get in?')
        }
    });
}());
