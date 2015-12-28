(function() {
    'use strict';

    var module = angular.module('mainapp');

    module.controller('WorkEducationController', function ($scope, $log, FacebookIntegration, Flash) {
        var profile = $scope.data.profile;

        function parseError(error){
            if (typeof error === "string" && error.indexOf('json') > -1)
                return angular.fromJson(error);
            else
                return error;
        }

        _.extend($scope.wizardFxn, {
            addProfileCollegeItem: function(){
                return $scope.wizardFxn.addProfileItem('colleges_struct',
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
                return $scope.wizardFxn.editProfileItem(item);
            },
            editProfileItem: function(item){
                item.editor = {
                    show: true,
                    animation: 'bounceInRight',
                    error: false
                };
                return item;
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
            doFacebookLogin: function(){
                FacebookIntegration.getMe().then(function(response){
                    parseEducationFromFb(response);
                    parseWorkplacesFromFb(response);
                });
            }
        }); // end of extending wizardfxn

        function parseEducationFromFb(response){ //convert education hx into actionable timeline messages
            if (response.education && response.education instanceof Array){ //check if there is education hx
                angular.forEach(response.education, function(item){
                    var current_year = new Date().getFullYear();
                    var graduation_date = (item.year ? item.year.name : current_year) + '-06-01';
                    var newSchool = {
                        name: item.school.name,
                        graduation_date: graduation_date,
                        imported: true //to tell apart from existing entries
                    };
                    if (item.type.toLowerCase() == 'high school') {
                        newProfileItemFromFbOrIn(newSchool, 'schools_struct');
                    } else {
                        if (item.degree)
                            newSchool.concentrations = item.degree.name;
                        newSchool.attended_for = item.type;
                        newProfileItemFromFbOrIn(newSchool, 'colleges_struct');
                    }
                });
            }
        }

        function parseWorkplacesFromFb(response){
            if (response.work && response.work instanceof Array){
                angular.forEach(response.work, function(item){
                    var current_year = new Date().getFullYear();
                    //var start_date = (parseInt(item.start_date) > 0 ? item.start_date : current_year) + '-01-01';
                    var newWork = {
                        company: item.employer.name,
                        position: item.position ? item.position.name : null,
                        start_date: item.start_date,
                        end_date: item.end_date,
                        is_present: !item.end_date ? true : false,
                        imported: true //to tell apart from existing entries
                    };
                    newProfileItemFromFbOrIn(newWork, 'workplaces_struct');
                });
            }
        }

        function newProfileItemFromFbOrIn(item, struct){
            item = $scope.wizardFxn.addProfileItem(struct, item);
            angular.forEach(profile[struct], function(value){
                if (!value.imported && value.name == item.name) {
                    item.editor.warning = 'Possible duplicate entry to: ' + value.name;
                }
            });
        }
    });
}());