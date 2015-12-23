(function() {
    'use strict';
    var module = angular.module('mainapp');

    module.constant('Dimensions', {
        LG_SCREEN: 980,
        MD_SCREEN: 767,
        SM_SCREEN: 480
    });

    module.controller('AppController', function($scope, $window, $log, gaAuthentication,
                                                gaBrowserHistory, gaAppConfig, $state) {
        $log.debug('App Controller active');

        $scope.cfg = gaAppConfig;
        $scope.auth = gaAuthentication;
        $scope.user = $scope.auth.user;

        $scope.showLeftSidebar = true;
        $scope.showRightSidebar = false;

        //initialize open/close states of sidebar items
        var state = $state.current.name;
        $scope.sidebar = [
            {
                name: 'Hub',
                sref: 'app.dashboard',
                icon: 'fa-dashboard',
                active: state == 'app.dashboard'
            },
            {
                name: 'HACKNYU',
                icon: 'hn-hack_nyu',
                active: state == 'app.projects',
                isCollapsed: false,
                subItems: [
                    {
                        name: 'Browse Tracks',
                        sref: 'app.projects',
                        icon: '',
                        active: state == 'app.projects'
                    },
                    {
                        name: 'Register',
                        sref: 'app.projects',
                        srefOptions: '',
                        icon: '',
                        active: state == 'app.projects'
                    },
                    {
                        name: 'Workshops',
                        sref: 'app.teams',
                        srefOptions: '',
                        icon: '',
                        active: state == 'app.teams'
                    }
                ]
            },
            {
                name: 'Projects',
                icon: 'fa-th',
                active: state == 'app.projects',
                isCollapsed: false,
                subItems: [
                    {
                        name: 'All Projects',
                        sref: 'app.projects',
                        icon: '',
                        active: state == 'app.projects'
                    },
                    {
                        name: 'My Projects',
                        sref: 'app.projects',
                        srefOptions: '',
                        icon: '',
                        active: state == 'app.projects'
                    },
                    {
                        name: 'Teams',
                        sref: 'app.teams',
                        srefOptions: '',
                        icon: '',
                        active: state == 'app.teams'
                    }
                ]
            },
            {
                name: 'Channels',
                icon: 'fa-hashtag',
                active: state == 'app.channels',
                isCollapsed: false,
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
                name: 'Settings',
                icon: 'fa-cog',
                active: state == 'app.settings',
                isCollapsed: false,
                subItems: [
                    {
                        name: 'Personal',
                        sref: 'app.projects',
                        icon: '',
                        active: state == 'app.projects'
                    },
                    {
                        name: 'Profile',
                        sref: 'app.projects',
                        srefOptions: '',
                        icon: '',
                        active: state == 'app.projects'
                    },
                    {
                        name: 'Notifications',
                        sref: 'app.teams',
                        srefOptions: '',
                        icon: '',
                        active: state == 'app.teams'
                    }
                ]
            },
            {
                name: 'Log out',
                sref: 'logout',
                icon: 'fa-sign-out',
                active: state == 'logout'
            }
        ];
    });

    module.controller('AppNavbarController', function($scope, $log){

    });
}());