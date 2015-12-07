(function() {
    'use strict';

    var module = angular.module('core');
    module.config(function($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('/');

        $stateProvider
            .state('home', {
                url         : '/',
                controller  : 'HomeController',
                templateUrl : '/p/modules/core/main/main.client.view.html'
            })
            .state('dashboard', {
                url         : '/dashboard',
                controller  : 'DashboardController',
                templateUrl : '/p/modules/core/main/home.client.view.html'
            })
            .state('feedback', {
                url         : '/feedback',
                controller  : 'FeedbackController',
                templateUrl : '/p/modules/core/feedback/feedback.client.view.html'
            });
    });
}());
