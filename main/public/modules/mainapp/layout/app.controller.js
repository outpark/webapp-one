(function() {
    'use strict';
    var module = angular.module('mainapp');

    module.constant('Dimensions', {
        LG_SCREEN: 980,
        MD_SCREEN: 767,
        SM_SCREEN: 480
    });

    module.controller('AppController', function($scope, $window, $log, gaAuthentication,
                                                gaBrowserHistory, gaAppConfig, $uibModal) {
        $log.debug('App Controller active');

        $scope.cfg = gaAppConfig;
        $scope.auth = gaAuthentication;
        $scope.user = $scope.auth.user;

        $scope.showLeftSidebar = true;
        $scope.showRightSidebar = false;

    });

    module.controller('SidebarController', function($scope, $log, $state){
        //initialize open/close states of sidebar items
        $log.debug('Sidebar Controller active');
        $scope.sidebar = [
            {
                name: 'Hub',
                sref: 'app.dashboard',
                icon: 'fa-dashboard'
            },
            {
                name: 'HACKNYU',
                icon: 'hn-hack_nyu',
                isCollapsed: true,
                subItems: [
                    {
                        name: 'Browse Tracks',
                        sref: 'app.projects',
                        icon: ''
                    },
                    {
                        name: 'Register',
                        sref: 'app.projects',
                        srefOptions: '',
                        icon: ''
                    },
                    {
                        name: 'Workshops',
                        sref: 'app.teams',
                        srefOptions: '',
                        icon: ''
                    }
                ]
            },
            {
                name: 'Projects',
                icon: 'fa-th',
                isCollapsed: true,
                subItems: [
                    {
                        name: 'All Projects',
                        sref: 'app.projects',
                        icon: ''
                    },
                    {
                        name: 'My Projects',
                        sref: 'app.projects',
                        srefOptions: '',
                        icon: ''
                    },
                    {
                        name: 'Teams',
                        sref: 'app.teams',
                        srefOptions: '',
                        icon: ''
                    }
                ]
            },
            {
                name: 'Channels',
                icon: 'fa-hashtag',
                isCollapsed: true,
                subItems: [ //in future include only channels user is part of
                    {
                        name: '#general',
                        sref: 'app.channels',
                        srefOptions: 'general',
                        icon: ''
                    },
                    {
                        name: '#random',
                        sref: 'app.channels',
                        srefOptions: 'random',
                        icon: ''
                    }
                ]
            },
            {
                name: 'Profile',
                sref: 'app.profile',
                icon: 'fa-user'
            },
            {
                name: 'Settings',
                icon: 'fa-cog',
                isCollapsed: true,
                subItems: [
                    {
                        name: 'Sign in & Security',
                        sref: 'app.security',
                        icon: 'fa-user-secret'
                    },
                    {
                        name: 'Personal Info & Privacy',
                        sref: 'app.personal',
                        icon: 'fa-lock'
                    },
                    {
                        name: 'Account Preferences',
                        sref: 'app.preferences',
                        icon: 'fa-life-ring'
                    }
                ]
            },
            {
                name: 'Log out',
                sref: 'logout',
                icon: 'fa-sign-out'
            }
        ];
        $scope.$on('$stateChangeSuccess', function () {
            var path = $state.current.name;
            angular.forEach($scope.sidebar, function(item){ //iterate over each item
                item.active = item.sref == path; // set active pending if path matches item sref

                if (item.subItems){ //check each subitem
                    angular.forEach(item.subItems, function(subItem){
                        if (subItem.sref == path){
                            subItem.active = true; //set subitem as active
                            item.isCollapsed = false; //open up the category
                        } else {
                            subItem.active = false; //not active subitem, take active off
                        }
                    });
                }
            });
        });
    });
}());