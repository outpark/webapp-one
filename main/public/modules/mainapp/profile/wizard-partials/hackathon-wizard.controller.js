(function() {
    'use strict';

    var module = angular.module('mainapp');

    module.controller('HackathonWizardController', function ($scope) {
        $scope.hackathon = {};

        $scope.rsvpOptions = [
            {
                value: 'attending',
                label: 'Attending <strong>HACKNYU 2016</strong>'
            },
            {
                value: 'interested',
                label: 'interested'
            },
            {
                value: 'cant_go',
                label: "Can't Go"
            }
        ];
        $scope.sizes = ['Small', 'Medium', 'Large', 'X-Large', '2X-Large'];
    });

    module.controller('ModalBrowserController', function($scope, $log, $uibModalInstance, GoogleIntegration, $timeout,
                                                         Flash){
        $scope.files = [];
        GoogleIntegration.getFiles().then(function(data){
            $scope.files = data.items || [];
        });
        $scope.inputFileChanged = function(file){
            $scope.fileSelected = file.name;
            $scope.uploading = true;
            GoogleIntegration.uploadFile(file).then(function(file){
                $scope.files.push(file);
                $scope.selectFile(file);
                $timeout(function(){ // fetch again to see if thumbnail is ready
                    GoogleIntegration.getFile(file).then(function(newFile){
                        file.thumbnailLink = newFile.thumbnailLink;
                    })
                }, 5000);
            }, function(error){
                Flash.create('danger', error);
                $log.debug(error);
            }).finally(function(){$scope.uploading = false;});
        };
        $scope.activeFile = null;
        $scope.selectFile = function(file){
            if ($scope.activeFile)
                $scope.activeFile.active = false;
            file.active = true;
            $scope.activeFile = file;
        };
        $scope.deleteFile = function(file){
            GoogleIntegration.deleteFile(file).then(function(){
                _.remove($scope.files, file);
            });
        };
        $scope.submit = function(file){
            $uibModalInstance.close(file.webContentLink);
        };

        $scope.cancel = function(){
            $uibModalInstance.dismiss();
        }
    });
}());