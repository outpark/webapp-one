(function(){
    'use strict';

    var module = angular.module('mainapp');

    module.controller('ProfileController', function($scope){

    });

    module.controller('ProfileWizardController', function($scope, $log, Restangular, hackathons,
                                                          profile, $timeout, $stateParams){
        angular.forEach(['workplaces_struct', 'colleges_struct', 'schools_struct'], function(value){
            Restangular.restangularizeCollection(profile, profile[value], value);
        });
        $scope.user['profile'] = profile;
        $scope.user['hackathons'] = hackathons;

        $scope.forms = [
            {
                name: "Personal",
                partial: "/p/modules/mainapp/profile/wizard-partials/personal-info.partial.html"
            },
            {
                name: "Work & Education",
                partial: "/p/modules/mainapp/profile/wizard-partials/work-education.partial.html"
            },
            {
                name: '<i class="hn-hack_nyu"></i> HACKNYU',
                partial: "/p/modules/mainapp/profile/wizard-partials/hacknyu.partial.html"
            }
        ];
        var active = $stateParams.step || 0; //$scope.user.show_profile_wizard;
        if (active > 0 && active <= $scope.forms.length)
            $scope.forms[active - 1].active = true;

        $scope.wizardFxn = {
            isLoading: false,
            savePersonal: function(form){
                $scope.wizardFxn.isLoading = true;
                $scope.user.save().then(function(user){
                    $scope.user.profile.save().then(function(data){
                        if (form){
                            form.$setUntouched();
                            form.$setPristine();
                        } else {
                            $scope.wizardFxn.nextPage(0);
                        }
                    }).finally(function(){$scope.wizardFxn.isLoading = false;});
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
            }
        };
    });
}());