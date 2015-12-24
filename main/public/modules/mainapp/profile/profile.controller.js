(function(){
    'use strict';

    var module = angular.module('mainapp');

    module.controller('ProfileController', function($scope){

    });

    module.controller('ProfileWizardController', function($scope, $log, gaAuthentication){
        $scope.step = $scope.user.profile.show_profile_wizard;
        $log.debug('Profile wizard controller active. At step: ' + $scope.step);

        var profile = $scope.user.profile;
        var editingWorkplace = false;

        $scope.wizardFxn = {
            addWorkplace: function(){
                if (editingWorkplace)
                    return;
                $log.debug('adding workplace');
                if (!profile.workplaces){
                    profile['workplaces'] = [];
                }
                profile.workplaces.push({
                    edit: true,
                    new: true
                });
                editingWorkplace = true;
            },
            isEditingWorkplace: function(){
                return editingWorkplace;
            },
            cancelWorkplace: function(workplace){
                var index = profile.workplaces.indexOf(workplace);
                if (workplace.new){
                    profile.workplaces.splice(index, 1);
                } else {
                    workplace.edit = false;
                    workplace.error = false;
                }
                editingWorkplace = false;
            },
            deleteWorkplace: function(workplace){
                var index = profile.workplaces.indexOf(workplace);
                profile.workplaces.splice(index, 1);
                editingWorkplace = false;
            },
            saveWorkplace: function(workplace){
                workplace = { //only push things that we want in workplace
                    company: workplace.company,
                    position: workplace.position,
                    city: workplace.city,
                    description: workplace.description
                };
                $scope.wizardFxn.saveChanges(null, function(){
                    //workplace.edit = false;
                    //editingWorkplace = false;
                }, function(error){
                    workplace.error= {
                        message: error.data.message || 'Failed to save workplace.',
                        animation: 'shake'
                    };
                });
            },
            saveChanges: function(form, success, fail){
                $scope.user.save().then(function(data){
                    _.extend($scope.user, data);
                    gaAuthentication.setUser($scope.user);
                    if (form) {
                        form.$dirty = false;
                        form.$pristine = true;
                    }
                    if (success)
                        success(data);
                }, function(error){
                    $log.debug(error);
                    if (fail)
                        fail(error);
                });
            },
            onNextPage: function(form){
                $log.debug('on next page');
                $scope.wizardFxn.saveChanges(form);
            },
            submit: function(){
                $log.debug('submit form');
            }
        };

        if (!profile.workplaces || profile.workplaces.length == 0){
            $scope.wizardFxn.addWorkplace();
        }
    })
}());