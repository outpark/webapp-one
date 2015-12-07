(function() {
    'use strict';
    var module = angular.module('users');

    module.controller('DashboardController', function($rootScope, $scope, $log, gaAuthentication,
                                                      ngToast, $state, gaBrowserHistory, gaAppConfig,
                                                      Restangular) {
        if (!gaAuthentication.isLogged()) { //redirect to login if not already logged in
            gaBrowserHistory.redirectLogin();
        }

        $scope.cfg = gaAppConfig;
        $scope.auth = gaAuthentication;
        $scope.user = $scope.auth.user;

        $scope.setHeader = function(title, subtitle, color){
            $scope.headerTitle = title;
            $scope.headerSubtitle = subtitle;
            $scope.headerColor = color;
        };

        // Determine whether the header button should be shown //
        var currentState = $state.current.name;
        var noHeaderButtonStates = [
            'dashboard.profile',
            'dashboard.home'
        ];
        if (noHeaderButtonStates.indexOf(currentState) > 0){
            $log.debug('no header button');
            $scope.headerButtonVisible = false;
        } else {
            $log.debug('header button');
            $scope.headerButtonVisible = true;
        }

        $scope.showHeaderButton = function(text, fxn){
            $scope.headerButtonVisible = true;
            if (text != null)
                $scope.headerButtonText = text;
            if (fxn != null)
                $scope.onHeaderButtonClick = fxn;
        };

        $scope.setHeaderButtonColor = function(color){
          $scope.headerButtonColor = color;
        };

        $scope.hideHeaderButton = function(){
            $scope.headerButtonVisible = false;
        };
    });
}());
