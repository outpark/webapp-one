(function() {
    'use strict';
    var module = angular.module('core');

    module.controller('WorkshopsController', function($scope, $log, Restangular,
                                                    ngToast, gaBrowserHistory,
                                                    $stateParams, $state) {

        $log.debug('Workshops Controller active');

        $scope.dhForm = {
            is_attending: 1
        };

        $scope.submit = function(){
            if (!$scope.dhForm.captcha){
                ngToast.danger('Captcha is required');
                return false;
            }
            Restangular.all('invitations').post($scope.dhForm).then(function(invite) {
                ngToast.create('Thank you ' + invite.name + ' for completing the RSVP! Check your email for more details.');
                $state.go('home');
            });
        };
    });
}());
