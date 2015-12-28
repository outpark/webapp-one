(function() {
    'use strict';

    var module = angular.module('mainapp');
    module.config(function($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('/');

        $stateProvider
            .state('signup', {
                url         : '/app/signup',
                controller  : 'SignupController',
                templateUrl : '/p/modules/mainapp/auth/signup.view.html'
            })
            .state('login', {
                url         : '/app/login',
                controller  : 'LoginController',
                templateUrl : '/p/modules/mainapp/auth/login.view.html'
            })
            .state('logout', {
                url         : '/app/logout',
                controller: function (Restangular, gaAuthentication, $state, gaAppConfig) {
                    Restangular.all('auth/signout').post().then(function (appConfig) {
                        gaAuthentication.user = false;
                        _.assignDelete(gaAppConfig, appConfig);
                        $state.go('app.dashboard');
                    });
                }
            })
            //app routes
            //checks for logged in user and all app routes inherit from this route
            .state('app', {
                url: '/app',
                resolve: {
                    authentication: function(gaAuthentication, $state) {
                        return gaAuthentication.getUser().then(null,
                            function(error){
                                $state.go('login');
                            });
                    }
                },
                controller: 'AppController',
                abstract: true,
                templateUrl:'/p/modules/mainapp/layout/app.view.html'
            })
            .state('app.profile', {
                url: '/profile',
                controller: 'ProfileController',
                templateUrl:'/p/modules/mainapp/profile/profile.view.html'
            })
            .state('app.profile-wizard', {
                url: '/profile/wizard?step',
                controller: 'ProfileWizardController',
                templateUrl: '/p/modules/mainapp/profile/profile-wizard.view.html',
                resolve: {
                    profile: function (gaAuthentication, Flash, gaBrowserHistory) {
                        var user = gaAuthentication.user;
                        return user.one('profile').get().then(function(data){
                            return data
                        }, function(error){
                            Flash.create('danger', error.data.message);
                            gaBrowserHistory.back();
                        });
                    },
                    hackathons: function (gaAuthentication, Flash, gaBrowserHistory) {
                        var user = gaAuthentication.user;
                        return user.all('hackathons').getList().then(function(data){
                            return data
                        }, function(error){
                            Flash.create('danger', error.data.message);
                            gaBrowserHistory.back();
                        });
                    }
                }
            })
            .state('app.dashboard', {
                url: '',
                controller: 'DashboardController',
                templateUrl:'/p/modules/mainapp/dashboard/dashboard.view.html'
            });
    });
}());