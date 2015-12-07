(function() {
    'use strict';
    var module = angular.module('users');

    module.controller('SignupController', function($rootScope, $scope, $log, $location, $anchorScroll,
        ngToast, $state, gaAppConfig, Restangular) {

        console.log('here');
        $scope.cfg = gaAppConfig;

        $scope.signup = function() {
            Restangular.all('auth/signup').post($scope.credentials).then(function(user) {
                ngToast.create('Your account has been created! Please verify your email');
                $scope.credentials = {};
                $scope.signupForm.$setPristine();
                $scope.signupForm.$dirty = false;
                $scope.signupForm.email.$touched = false;
                $scope.signupForm.username.$touched = false;
                $scope.signupForm.password.$touched = false;
                $state.go('home');

                //gaTracking.eventTrack('Signup', $scope.credentials.email);
            }, function() {
                //on error
            });
            $log.debug('submitting form');
        };

        return;
    });
}());
