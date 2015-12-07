(function() {
    'use strict';

    var module = angular.module('users');
    module.config(function ($stateProvider) {
        $stateProvider
            .state('dashboard', {
                url: '/dashboard',
                abstract: true,
                templateUrl: '/p/modules/users/dashboard/dashboard.view.html',
                controller: 'DashboardController'
            })
            .state('dashboard.home', {
                url: '/',
                templateUrl: '/p/modules/users/dashboard/dashboard-home.view.html',
                controller: 'DashboardHomeController'
            })
            .state('dashboard.profile', {
                url: '/profile',
                templateUrl: '/p/modules/users/profile/profile.view.html',
                controller: 'ProfileController'
            })
            .state('dashboard.projects', {
                url: '/projects',
                templateUrl: '/p/modules/users/projects/projects.view.html',
                controller: 'ProjectsController'
            })
            .state('dashboard.projects-user', {
                url: '/projects/user/{:username}',
                templateUrl: '/p/modules/users/projects/projects.view.html',
                controller: 'ProjectsController'
            })
            .state('dashboard.projects.add', {
                url: '/add',
                templateUrl: '/p/modules/users/projects/projects-add.view.html',
                controller: 'ProjectsAddController'
            })
            .state('dashboard.projects.edit',{
                url: '/edit/{:key}',
                templateUrl: '/p/modules/users/projects/projects-edit.view.html',
                controller: 'ProjectsEditController'
            })
            .state('dashboard.apply', {
                url: '/apply',
                templateUrl: '/p/modules/users/application/dashboard.application.view.html',
                controller: 'ApplicationController'
            })
            .state('dashboard.stories', {
                url: '/stories',
                templateUrl: '/p/modules/users/hackstories/hackstories.view.html',
                controller: 'HackStoriesController'
            })
            .state('dashboard.stories.add', {
                url: '/add',
                templateUrl: '/p/modules/users/hackstories/stories-add.view.html',
                controller: 'StoriesAddController'
            })
            .state('login', {
                url: '/login',
                controller: 'LoginController',
                templateUrl: '/p/modules/users/auth/login.view.html'
            })
            .state('forgot-password', {
                url: '/forgot',
                controller: 'ForgotPswdController',
                templateUrl: '/p/modules/users/auth/forgot.view.html'
            })
            .state('reset-password', {
                url: '/reset/{token}',
                controller: 'ResetPswdController',
                templateUrl: '/p/modules/users/auth/reset.view.html'
            })
            .state('signup', {
                url: '/signup',
                controller: 'SignupController',
                templateUrl: '/p/modules/users/auth/signup.view.html'
            })
            .state('signout', {
                url: '/signout',
                controller: function (Restangular, gaAuthentication, $state, gaAppConfig) {
                    Restangular.all('auth/signout').post().then(function (appConfig) {
                        gaAuthentication.user = false;
                        _.assignDelete(gaAppConfig, appConfig);
                        $state.go('home');
                    });
                }
            });
    });
}());