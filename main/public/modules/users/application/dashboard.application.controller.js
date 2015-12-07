(function() {
    'use strict';
    var module = angular.module('users');

    module.controller('ApplicationController', function($rootScope, $scope, $log, $http, gaBrowserHistory,
                                                        ngToast, dhColors, $state, Restangular) {


        if (!$scope.user.is_complete){
            ngToast.warning({
                content: 'Please complete your profile. Click here to go to your profile.',
                stateChange: 'dashboard.profile'
            });
            $state.go('dashboard.home');
        }

        $scope.setHeader('Interested?', 'Join Us.', dhColors.BLUE);
        $scope.hideHeaderButton();

        var workshops = [
            {
                value:0,
                name:'Technology Driven Oral Health Education - November 21st, 2015',
                description: '',
                selected: false,
                info: 'Transform the way we teach. Oral health is neglected in many communities due to the lack of ' +
                'culturally-sensitive resources and personalized teaching materials. Create tools that tackle this ' +
                'social disparity by building scalable apps for iPhones, Android devices and the web that can truly ' +
                'help millions of people around the globe.'
            },
            {
                value:1,
                name:'Delivering Preventative Care - January, 2015',
                description: '',
                selected: false,
                info: 'Treatment is costly, focus on prevention. Dental sealants and topical fluoride are incredibly ' +
                'effective tools for the prevention and early treatment of caries. However, these tools are largely ' +
                'underused and ineffectively delivered in many communities. Innovative technologies are needed to ' +
                'improve delivery of these materials and to effectively train local providers in the use of these ' +
                'preventative measures.'
            },
            {
                value:2,
                name:'Engineering in Oral Care - February, 2015',
                description: '',
                selected: false,
                info: 'Best outcomes stem from effective and efficient patient care. Inventors and creators are needed ' +
                'to challenge today\'s status quo in oral healthcare by transforming provider-patient interactions. ' +
                'Work with engineers and developers to prototype tools that optimize delivery of care with the ' +
                'potential to become marketable products and services of tomorrow.'
            }
        ];
        $scope.firstWorkshops = angular.copy(workshops);
        $scope.secondWorkshops = angular.copy(workshops);

        $scope.onSelectWorkshop = function(value){
            $scope.secondWorkshops = angular.copy(workshops);
            $scope.secondWorkshops[value].disabled = true;
        };


        var ctrl = this;
        $scope.application = {
            owner_name: ''
        };

        ctrl.getApplication = function() {
            Restangular.one('applications', $scope.user.email).get().then(function(data){
                angular.forEach(data, function(value, key){
                    if (value === 'None')
                        data[key] = null;
                });
                $scope.application = data || {};
                if (!('owner_name' in $scope.application) || !$scope.application.owner_name)
                    $scope.application.owner_name = $scope.user.name || $scope.user.username;

                if (parseInt($scope.application.first_choice_workshop) >= 0)
                    $scope.onSelectWorkshop($scope.application.first_choice_workshop);
            });
        };

        $scope.submit = function(submitApplication){
            $scope.application.is_submitted = submitApplication;
            if (submitApplication) {
                if ($scope.application.first_choice_workshop < 0) {
                    ngToast.danger('Please select your first choice for workshop.');
                    return;
                }
                if ($scope.application.second_choice_workshop < 0) {
                    ngToast.danger('Please select your second choice for workshop.');
                    return;
                }
            }
            Restangular.all('applications').post($scope.application).then(function(data){
                if (!submitApplication)
                    ngToast.create('Saved, take a break and enjoy a coffee!');
                else
                    ngToast.create('Submitted, you can celebrate now!');
                $scope.user.has_applied = data.is_submitted;
            }).finally(function(){
                if (!submitApplication){
                    $scope.applicationForm.$setPristine();
                } else {
                    gaBrowserHistory.back(true);
                }
            });
        };

        ctrl.getApplication();
    });
}());
