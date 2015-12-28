//DashboardController
//Controls all the dasbhoard stuff
(function(){
    'use strict';
    var module = angular.module('mainapp');

    function showFormError($scope, $timeout, message, color, notShake){
        if (!notShake) {
            $timeout(function () {
                $scope.loginAnimation = '';
            }, 500);
            $scope.loginAnimation = 'shake';
        }
    }

    module.controller('LoginController', function($log, $scope, $timeout, Restangular, $uibModal,
                                                  gaAppConfig, gaAuthentication, gaBrowserHistory){
        $log.debug('Login Controller active');
        $scope.cfg = gaAppConfig;

        var defaultCredentials = {
            terms: false
        };

        $scope.credentials = angular.copy(defaultCredentials);

        $scope.signin = function() {
            Restangular.all('auth/signin').post($scope.credentials).then(function (user) {
                gaAuthentication.setUser(user);
                gaBrowserHistory.redirectAfterLogin(user);
            }, function(error){
                $log.debug(error);
                showFormError($scope, $timeout, error.data.message || 'Login failed.');
            });
        };

        $scope.openModalForgot = function(){
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: 'modalForgot.html',
                controller: function($scope, $uibModalInstance){
                    $scope.forgot = {};
                    $scope.forgotPassword = function(){
                        $uibModalInstance.close($scope.forgot.email);
                    };
                    $scope.cancel = function(){
                        $uibModalInstance.dismiss();
                    }
                }
            });

            modalInstance.result.then(function(email){
                Restangular.all('auth/forgot').post({email: email}).then(function(data){
                    showFormError($scope, $timeout, 'Reset email sent to ' + email, 'success', true);
                }, function(error){
                    showFormError($scope, $timeout, error.data.message || 'Reset email not sent.', 'danger', true);
                });
            });
        };
    });

    module.controller('SignupController', function($log, $scope, $timeout, Restangular,
                                                   gaAppConfig, gaAuthentication, gaBrowserHistory){
        $log.debug('Sign up controller active');
        $scope.cfg = gaAppConfig;

        $scope.signup = function() {
            Restangular.all('auth/signup').post($scope.credentials).then(function (user) {
                gaAuthentication.setUser(user);
                gaBrowserHistory.redirectAfterLogin(user);
            }, function(error){
                $log.debug(error);
                showFormError($scope, $timeout, error.data.message || 'Sign up failed.');
            });
        };
    });
}());