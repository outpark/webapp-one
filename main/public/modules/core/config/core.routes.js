(function() {
    'use strict';

    var module = angular.module('core');
    module.config(function($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('/');

        $stateProvider
            .state('home', {
                url         : '/',
                controller  : 'HomeController',
                templateUrl : '/p/modules/core/home/home.view.html'
            })
            .state('workshops-code', {
                url: '/workshops/{code}',
                controller : 'WorkshopsController',
                templateUrl: '/p/modules/core/workshops/workshops.view.html'
            })
            .state('workshops', {
                url: '/workshops',
                controller : 'WorkshopsController',
                templateUrl: '/p/modules/core/workshops/workshops.view.html'
            })
            .state('contact', {
                url: '/contact',
                controller : 'ContactController',
                templateUrl: '/p/modules/core/contact/contact.view.html'
            })
            .state('blog', {
                url: '/blog',
                controller: 'BlogController',
                templateUrl: '/p/modules/core/blog/blog.index.html'
            });
    });
}());