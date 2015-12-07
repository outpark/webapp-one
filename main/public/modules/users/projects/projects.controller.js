(function() {
    'use strict';
    var module = angular.module('users');

    module.controller('ProjectsController', function($rootScope, $scope, $log, $state, $stateParams, dhColors) {

        $log.debug('Projects controller active');
        $scope.setHeader('Awesome Projects', 'Create or Join.', dhColors.PINK);
        $scope.setHeaderButtonColor('btn-success');

        $scope.projectsByUser = $stateParams.username;

        $scope.isAddProjectShown = false;

        $scope.onProjectHeaderButtonClick = function(forceShowAdd){
            if (!forceShowAdd && !$scope.isAddProjectShown) {
                $state.go('dashboard.projects.add');
                $scope.showHeaderButton('Cancel Project', $scope.onProjectHeaderButtonClick);
                $scope.isAddProjectShown = true;
            } else {
                $state.go('dashboard.projects');
                $scope.showHeaderButton('Create a Project', $scope.onProjectHeaderButtonClick);
                $scope.isAddProjectShown = false;
            }
        };

        $scope.showHeaderButton('Create a Project', $scope.onProjectHeaderButtonClick);

        $scope.projects = [];

        // This is fired when user scrolled to bottom
        //$scope.$on('mainContentScrolled', function() {
        //    if ($scope.showProjectExplorer)
        //        ctrl.getProjects();
        //});
    });
}());
