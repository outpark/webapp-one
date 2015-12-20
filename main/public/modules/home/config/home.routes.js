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
            .state('signin', {
                url: '/signin',
                controller: function () {
                    window.location.replace('/app');
                }
            });
    });
}());