(function() {
    'use strict';
    var module = angular.module('admin');

    module.controller('AdminBlogController', function($scope, $log, Restangular) {
        $log.debug('Blog Controller - Admin is active');
    });
}());
