(function() {
    'use strict';

    var module = angular.module('mainapp');

    module.controller('HackathonWizardController', function ($scope, $log, GoogleIntegration, $uibModal,
                                                             gaBrowserHistory, HackNYUConst) {
        $scope.toggleMaker = function(value){
            $scope.hackathonForm.$setDirty();
            _.remove($scope.hackathon.maker, value);
            $scope.hackathon.makers.push(value);
        };

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

        $scope.makers = ['Artist', 'Content Provider', 'Front-End Developer', 'Back-End Developer',
            'Designer', 'Mobile Developer', 'Game Developer'];
        $scope.sizes = ['Small', 'Medium', 'Large', 'X-Large', '2X-Large'];
        $scope.genders = ['Male', 'Female', 'Rather not specify'];

        $scope.genderOtherChange = function(){
            $scope.hackathon.gender = null;
        };

        var user = $scope.data;

        //set current hackathon as 'spring_2016'
        if (user.hackathons && user.hackathons instanceof Array){
            angular.forEach(user.hackathons, function(value){
                if (value.which == HackNYUConst.HACKATHON_NAME) {
                    if ($scope.genders.indexOf(value.gender) == -1)
                        value['genderOther'] = value.gender;
                    $scope.hackathon = value;
                }
            })
        }
        $scope.hackathon = $scope.hackathon || {makers:[]};


        _.extend($scope.wizardFxn, {
            doGoogleLogin: function(){
                GoogleIntegration.login().then(function(){
                    var modalInstance = $uibModal.open({
                        animation: true,
                        size: 'lg',
                        templateUrl: 'modalBrowser.html',
                        controller: 'ModalBrowserController'
                    });

                    modalInstance.result.then(function(fileUrl){
                        $scope.hackathon.resume = fileUrl;
                    });
                });
            },
            saveHackathon: function(item){
                $scope.wizardFxn.isLoading = true;

                //set gender from other
                $scope.hackathon.gender = $scope.hackathon.genderOther ?
                    $scope.hackathon.genderOther : $scope.hackathon.gender;

                var after = function(){
                    $scope.wizardFxn.isLoading = false;
                };

                if (item.key){
                    item.save().finally(after);
                } else {
                    user.post('hackathons', item).then(function(data){
                        _.extend(item, data);
                    }).finally(after);
                }
            },
            finishWizard: function(){
                gaBrowserHistory.back();
            }
        });
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
                $scope.activeFile = null;
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