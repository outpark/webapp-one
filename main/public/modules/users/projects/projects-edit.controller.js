(function() {
    'use strict';
    var module = angular.module('users');

    module.controller('ProjectsEditController', function($rootScope, $scope, $log, ngToast, gaBrowserHistory,
                                                         $http, $state, Restangular, gaAuthentication, dhColors,
                                                         $stateParams) {

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
            $state.go('dashboard.projects');
            $scope.showHeaderButton('Create a Project', $scope.onProjectHeaderButtonClick);
            $scope.isAddProjectShown = false;
        };
        $scope.showHeaderButton('Back To Projects', $scope.onHeaderButtonClick);

        var projectKey = $stateParams.key;

        $scope.project = {};

        //is true when user uploads an image
        var hasUserUploadedFeatureImage = false;

        //get one of the random dh colors
        function getRandomColor(){
            var number = Math.floor(Math.random() * 4);
            var color;
            switch (number){
                case 0:
                    color = dhColors.BLUE;
                    break;
                case 1:
                    color = dhColors.ORANGE;
                    break;
                case 2:
                    color = dhColors.PINK;
                    break;
                default:
                    color = dhColors.GREEN;
                    break;
            }
            return color.substr(1);
        }

        //update feature image on project title change
        $scope.updateFeatureImage = function(title){
            //get a feature image for the project
            if (!hasUserUploadedFeatureImage)
                $scope.project.feature = "http://placehold.it/600x400/"+ getRandomColor() + "/ffffff/?text=" +
                    (title || '@' + $scope.user.username);
        };

        //fired by directive for image upload
        $scope.featureImageUploaded = function(){
            $log.debug('user has uploaded picture, no longer dynamic');
            hasUserUploadedFeatureImage = true;
        };

        //get project
        ctrl.getProject = function() {
            Restangular.one('projects', projectKey).get().then(function(data){
                console.log(data);
                $scope.project = data || {};
                if ($scope.project.feature)
                    hasUserUploadedFeatureImage = true;
                $scope.updateFeatureImage($scope.project.name);
            });
        };

        ctrl.getProject();

        $scope.onChangeNewMemberInput = function(){
            $scope.projectForm.textNewMember.$error = {};
        };

        $scope.inviteMember = function(email){
            if (!email){
                $scope.projectForm.$dirty = true;
                $scope.projectForm.textNewMember.$touched = true;
                $scope.projectForm.textNewMember.$error = { required : true };
                return;
            }
            var foundMember = false;
            angular.forEach($scope.project.members_struct, function(value, key){
                if (value.email == email)
                    foundMember = true;
            });
            if (!foundMember)
                $scope.project.members_struct.push({
                    email: email,
                    role: 'Collaborator'
                });
            else
                ngToast.danger("This email address is already linked to a member of this project.");
            $scope.newMemberEmail = "";
        };

        $scope.deleteMember = function(index){
            console.log(index);
            $scope.project.members_struct.splice(index, 1);
        };

        function pushProject(data){
            var projectFound = false;
            angular.forEach($scope.projects, function(value, index){
                if (value.id == data.id){
                    projectFound = true;
                    $scope.projects[index] = data;
                }
            });
            if (!projectFound)
                $scope.projects.push(data);
        }

        $scope.submit = function(){
            $scope.project.put().then(function(data){
                ngToast.create('Created project successfully!');
                pushProject(data);
                $scope.onHeaderButtonClick();
            });
        };

        $scope.cancel = function(){
            $scope.onHeaderButtonClick();
            $scope.projectForm.$setPristine();
        };
    });
}());
