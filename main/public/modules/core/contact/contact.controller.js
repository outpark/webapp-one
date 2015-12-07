(function() {
    'use strict';
    var module = angular.module('core');

    module.controller('ContactController', function($scope, $log, Restangular, ngToast, gaBrowserHistory, gaAuthentication) {

        $log.debug('Contact Controller active');

        $scope.form = {
            name: $scope.user.name,
            email: $scope.user.email
        };

        $scope.submit = function(){
            if (!$scope.form.captcha){
                ngToast.danger('Captcha is required');
                return false;
            }
            Restangular.all('feedback').post($scope.form).then(function() {
                ngToast.create('Thank you for your feedback!');
                gaBrowserHistory.back();
            });
        };

        return;
    });
}());
