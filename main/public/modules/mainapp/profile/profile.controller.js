(function(){
    'use strict';

    var module = angular.module('mainapp');

    module.controller('ProfileController', function($scope){

    });

    module.controller('ProfileWizardController', function($scope, $log, Restangular, profile, $timeout, $stateParams,
                                                          gaAuthentication, GoogleIntegration, $uibModal){
        angular.forEach(['workplaces_struct', 'colleges_struct', 'schools_struct'], function(value){
            Restangular.restangularizeCollection(profile, profile[value], value);
        });
        $scope.user['profile'] = profile;

        $scope.forms = [
            {
                name: "Personal Information",
                partial: "/p/modules/mainapp/profile/wizard-partials/personal-info.partial.html"
            },
            {
                name: "Work & Education",
                partial: "/p/modules/mainapp/profile/wizard-partials/work-education.partial.html"
            },
            {
                name: "HackNYU",
                partial: "/p/modules/mainapp/profile/wizard-partials/hacknyu.partial.html"
            }
        ];
        var active = $stateParams.step || 0; //$scope.user.show_profile_wizard;
        if (active > 0 && active <= $scope.forms.length)
            $scope.forms[active - 1].active = true;

        function parseError(error){
            if (typeof error === "string" && error.indexOf('json') > -1)
                return angular.fromJson(error);
            else
                return error;
        }

        $scope.wizardFxn = {
            addProfileCollegeItem: function(){
                $scope.wizardFxn.addProfileItem('colleges_struct',
                    {
                        attended_for: 'College',
                        is_present: true
                    });
            },
            addProfileItem: function(itemType, item){
                if (!profile[itemType]) {
                    profile[itemType] = []
                }
                item = item || {is_present: true};
                profile[itemType].push(item);
                $scope.wizardFxn.editProfileItem(item);
            },
            editProfileItem: function(item){
                item.editor = {
                    show: true,
                    animation: 'bounceInRight',
                    error: false
                };
            },
            dismissProfileItem: function(item, itemType){
                $log.debug('dismissing item');

                item.editor = {
                    show: false,
                    animation: 'bounceOutRight',
                    error: false
                };
                if (!item.key) {
                    _.remove(profile[itemType], item);
                }
            },
            deleteProfileItem: function(item, itemType){
                $log.debug('deleting item');
                if (item.key){ // delete from database
                    item.remove().then(function(){
                        item.editor.animation = 'bounceOutRight';
                        _.remove(profile[itemType], item); //profile[itemType].splice(index, 1);
                    }, function(error){
                        item.editor.error = parseError(error.data.message);
                    });
                } else
                    _.remove(profile[itemType], item);
            },
            saveProfileItem: function(item, itemType){
                item.editor.error = false; // old errors are hidden this way
                if (item.key){
                    item.save().then(function(data){
                        $scope.wizardFxn.dismissProfileItem(item, itemType)
                    }, function(error){
                        item.editor.error = parseError(error.data.message);
                    });
                } else {
                    profile[itemType].post(item).then(function(data){
                        _.remove(profile[itemType], item);
                        profile[itemType].push(data);
                    }, function(error){
                        item.editor.error = parseError(error.data.message);
                    });
                }
            },
            savePersonal: function(){
                $scope.user.save().then(function(user){
                    $scope.wizardFxn.nextPage(0);
                });
            },
            nextPage: function(currentPage){
                if (currentPage + 1 <= $scope.forms.length) {
                    $scope.forms[currentPage].active = false;
                    $scope.forms[++currentPage].active = true;
                }
            },
            prevPage: function(currentPage){
                if (currentPage - 1 >= 0) {
                    $scope.forms[currentPage].active = false;
                    $scope.forms[--currentPage].active = true;
                }
            },
            goToForm: function(index){
                angular.forEach($scope.forms, function(form){
                    form.active = false;
                });
                $scope.forms[index].active = true;
            },
            getDateFromString : function(item){
                return new Date(item.start_date);
            },
            //hacknyu page
            doGoogleLogin: function(){
                GoogleIntegration.login().then(function(){
                    var modalInstance = $uibModal.open({
                        animation: true,
                        size: 'lg',
                        templateUrl: 'modalBrowser.html',
                        controller: 'ModalBrowserController'
                    });

                    modalInstance.result.then(function(fileUrl){
                        $log.debug(fileUrl);
                    });
                });
            }
        };
    });
}());