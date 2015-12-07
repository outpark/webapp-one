(function() {
    'use strict';
    var module = angular.module('users');

    module.controller('ProjectsAddController', function($rootScope, $scope, $log, ngToast, gaBrowserHistory,
                                                        $http, $state, Restangular, gaAuthentication, dhColors) {

        var ctrl = this;

        //check if the user profile is complete before creating a project
        if (!gaAuthentication.user.is_complete){
            ngToast.warning({
                content: 'Please complete your profile. Click here to go to your profile.',
                stateChange: 'dashboard.profile'
            });
            $scope.onProjectHeaderButtonClick(true);
        }

        $scope.onHeaderButtonClick = function(){
            gaBrowserHistory.back();
            $scope.showHeaderButton('Create a Project', $scope.onProjectHeaderButtonClick);
            $scope.isAddProjectShown = false;
        };
        $scope.showHeaderButton('Back To Projects', $scope.onHeaderButtonClick);

        $scope.project = {};

        $scope.isSubmittingForm = false;

        $scope.submit = function(){
            $scope.isSubmittingForm = true;
            Restangular.all('projects').post($scope.project).then(function(data){
                ngToast.create('Created project successfully!');
                $scope.user.has_project = true;
                $state.go('dashboard.projects.edit', {key: data.key});
            }).finally(function() {
                $scope.isSubmittingForm = false;
            });
        };
    });
}());
