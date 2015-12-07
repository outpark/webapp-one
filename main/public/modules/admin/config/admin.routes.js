(function() {
    'use strict';

    var module = angular.module('admin');
    module.config(function ($stateProvider) {
        $stateProvider
            .state('admin', {
                url: '/admin',
                templateUrl: '/p/modules/admin/admin/admin.view.html',
                controller: 'AdminController'
            })
            .state('admin.users', {
                url: '/users',
                templateUrl: '/p/modules/admin/invitations/admin-invitations.view.html',
                controller: 'AdminInvitationsController'
            })
            .state('admin.invitations', {
                url: '/invitations',
                templateUrl: '/p/modules/admin/invitations/admin-invitations.view.html',
                controller: 'AdminInvitationsController'
            })
            .state('admin.blog', {
                url: '/blog',
                templateUrl: '/p/modules/admin/blog/admin-blog.view.html',
                controller: 'AdminBlogController'
            })
            .state('admin.applications', {
                url: '/applications',
                templateUrl: '/p/modules/admin/invitations/admin-invitations.view.html',
                controller: 'AdminInvitationsController'
            });
    });
}());