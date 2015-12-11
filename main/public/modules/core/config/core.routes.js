(function() {
    'use strict';

    var module = angular.module('core');
    module.config(function($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('/');

        $stateProvider
            //guest routes
            .state('home', {
                url         : '/',
                controller  : 'HomeController',
                templateUrl : '/p/modules/home/home.view.html'
            })

            //user routes
            .state('login', {
                url         : '/login',
                controller  : 'LoginController',
                templateUrl : '/p/modules/users/auth/login.view.html'
            })
            .state('logout', {
                url         : '/logout',
                controller: function (Restangular, gaAuthentication, $state, gaAppConfig) {
                    Restangular.all('auth/signout').post().then(function (appConfig) {
                        gaAuthentication.user = false;
                        _.assignDelete(gaAppConfig, appConfig);
                        $state.go('home');
                    });
                }
            })
            .state('dashboard', {
                url         : '/dashboard',
                controller  : 'DashboardController',
                templateUrl : '/p/modules/users/dashboard/dashboard.view.html'
            });
    });
}());