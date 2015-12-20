(function() {
    'use strict';

    var module = angular.module('mainapp');
    module.config(function($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('/');

        $stateProvider
            //app routes
            //checks for logged in user and all app routes inherit from this route
            .state('app', {
                url: '/app',
                controller: 'AppController',
                abstract: true,
                templateUrl:'/p/modules/mainapp/layout/app.view.html'
            })
            .state('app.signin', {
                url         : '/signin',
                controller  : 'LoginController',
                templateUrl : '/p/modules/mainapp/auth/login.view.html'
            })
            .state('app.logout', {
                url         : '/logout',
                controller: function (Restangular, gaAuthentication, $state, gaAppConfig) {
                    Restangular.all('auth/signout').post().then(function (appConfig) {
                        gaAuthentication.user = false;
                        _.assignDelete(gaAppConfig, appConfig);
                        $state.go('home');
                    });
                }
            })
            .state('app.dashboard', {
                url: '',
                controller: 'DashboardController',
                templateUrl:'/p/modules/mainapp/dashboard/dashboard.view.html'
            });
    });
}());