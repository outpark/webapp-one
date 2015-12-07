(function() {
    'use strict';
    var module = angular.module('users');

    module.controller('LoginController', function($rootScope, $scope, $log, $location, $anchorScroll,
                                                  ngToast, $state, gaAppConfig, Restangular, gaAuthentication, gaBrowserHistory) {

        $log.debug('Login Controller active');
        $scope.cfg = gaAppConfig;

        $scope.signin = function() {
            $scope.isLoading = true;
            Restangular.all('auth/signin').post($scope.credentials).then(function(user) {
                var category;
                if (!user.verified) {
                    Restangular.all('auth/resend-verification').post($scope.credentials).then(function() {
                        ngToast.warning({
                            content: 'A verification email has been sent to your email, please verify to continue!'
                        });
                    });
                    category = 'unverified';
                } else if (!user.active) {
                    ngToast.create('Your account has been blocked. Please contact administrators to find out why.');
                    category = 'blocked';
                } else {
                    gaAuthentication.setUser(user);
                    gaBrowserHistory.redirectAfterLogin(user);
                    category = 'success';
                }
                //gaTracking.eventTrack('Signin', $scope.credentials.login, category);
            }).finally(function(){
                $scope.isLoading = false;
            });
        };

        return;
    });
    module.controller('ForgotPswdController', function($scope, $log, $state, $stateParams, ngToast, Restangular) {
        $log.debug('Forgot Pswd Controller active');

        $scope.credentials = {};

        $scope.submit = function() {
            $scope.isLoading = true;
            Restangular.all('auth/forgot').post($scope.credentials).then(function() {
                ngToast.create('Please check your email for instructions to reset your password.');
                $state.go('home');
            }).finally(function(){
                $scope.isLoading = false;
            });
        };

        return;
    });

    module.controller('ResetPswdController', function($scope, $log, $state, $stateParams, ngToast, Restangular,
                                                      gaAuthentication, gaBrowserHistory) {

        $log.debug('Reset Pswd Controller active');
        var token = $stateParams.token;

        $scope.credentials = {
            token: token
        };

        $scope.submit = function() {
            $scope.isLoading = true;
            Restangular.all('auth/reset').post($scope.credentials).then(function(user) {
                var category;
                if (!user.active) {
                    ngToast.create('Your account has been blocked. Please contact administrators to find out why.');
                    category = 'blocked';
                } else {
                    gaAuthentication.setUser(user);
                    gaBrowserHistory.redirectAfterLogin(user);
                    category = 'success';
                }
                //gaTracking.eventTrack('Signin', $scope.credentials.login, category);
            }).finally(function(){
                $scope.isLoading = false;
            });
        };

        return;
    });
}());
