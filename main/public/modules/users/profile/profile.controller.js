(function() {
    'use strict';
    var module = angular.module('users');

    module.controller('ProfileController', function($rootScope, $scope, $log, $http,
                                                    ngToast, gaAuthentication, $state, Restangular, gaBrowserHistory,
                                                    dhColors) {

        $log.debug('Profile controller active');
        $scope.hideHeaderButton();
        $scope.setHeader('Profile',
            $scope.user.name ? $scope.user.name : '@' + $scope.user.username,
            dhColors.PINK);

        $scope.programs = [
            {
                value: 'DDS',
                name: 'Doctor of Dental Surgery (DDS)'
            },
            {
                value: 'Dental Hygiene',
                name: 'Dental Hygiene'
            },
            {
                value: 'Nursing',
                name: 'Nursing'
            },
            {
                value: 'Mechanical/Hardware Engineering',
                name: 'Mechanical/Hardware Engineering'
            },
            {
                value: 'Software/Computer Engineering',
                name: 'Software/Computer Engineering'
            },
            {
                value: 'Bioengineering',
                name: 'Bioengineering'
            }
        ];

        $scope.institutions = [
            {
                value: 'NYU College of Dentistry',
                name: 'NYU College of Dentistry'
            },
            {
                value: 'NYU College of Nursing',
                name: 'NYU College of Nursing'
            },
            {
                value: 'Tandon School of Engineering',
                name: 'Tandon School of Engineering'
            },
            {
                value: 'Columbia College of Dental Medicine',
                name: 'Columbia College of Dental Medicine'
            }
        ];

        $scope.editedUser = $scope.user.clone();

        function setOtherProgramValue(){
            var alreadySelected = false;
            angular.forEach($scope.programs, function(program, index){
                if ($scope.editedUser.program == program.value)
                    alreadySelected = true;
            });
            if (!alreadySelected){
                $scope.editedUser.otherProgram = $scope.editedUser.program;
            }
        }

        setOtherProgramValue();

        function setOtherInstitutionValue(){
            var alreadySelected = false;
            angular.forEach($scope.institutions, function(institution, index){
                if ($scope.editedUser.institution == institution.value)
                    alreadySelected = true;
            });
            if (!alreadySelected){
                $scope.editedUser.otherInstitution = $scope.editedUser.institution;
            }
        }

        setOtherInstitutionValue();

        $scope.submit = function() {
            if ($scope.editedUser.otherProgram){
                $scope.editedUser.program = $scope.editedUser.otherProgram;
            }
            if ($scope.editedUser.otherInstitution){
                $scope.editedUser.institution = $scope.editedUser.otherInstitution;
            }
            $scope.editedUser.save().then(function(data) {
                _.extend($scope.user, $scope.editedUser);
                $scope.user.is_complete = data.is_complete;
                gaAuthentication.setUser($scope.user);
                ngToast.create('Your profile was successfully updated');
                if (gaBrowserHistory.checkWasProfileShownForcefully())
                    gaBrowserHistory.redirectAfterLogin(null);
                else {
                    gaBrowserHistory.back();
                }
            });
        };

        $scope.onChangeProgramOther = function(){
            $scope.editedUser.program = null;
        };

        $scope.onSelectProgram = function(){
            $scope.editedUser.otherProgram = null;
        };

        $scope.onChangeInstitutionOther = function(){
            $scope.editedUser.institution = null;
        };

        $scope.onSelectInstitution = function(){
            $scope.editedUser.otherInstitution = null;
        };

    });
}());
