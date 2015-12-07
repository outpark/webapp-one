(function() {
    'use strict';
    var module = angular.module('users');


    module.controller('AdminInvitationsController', function($scope) {
        //get all invitations

    });

    module.controller('AdminInvitationsListController', function($scope, Restangular, $http) {
        $scope.dhForm = {};

        $scope.submit = function(){
            Restangular.all($scope.endpoint).post($scope.dhForm).then(function(data){
                $scope.ngModel.push(data);
                $scope.dhForm = {};
            });
        };

        $scope.download = function(){
            angular.forEach($scope.ngModel, function(value, index){
                console.log(value);
            });
        };

        $scope.getQrCode = function(code){
            return 'https://api.qrserver.com/v1/create-qr-code/?data=http://dentalhackathon.org/invitations/'+
                code +'&size=300x300&color=D93173';
        }
    });
}());
