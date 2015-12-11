/**
 * Core config file
 * Sets up the location mode to html5 (no # in the address bar)
 * Sets up the Restangular's base url and request interceptors
 * Initializes Facebook app
 * Initializes Twitter app
 * Sets scope.user and scope.cfg for all controllers inside <body/>
 */
(function() {
    'use strict';

    var module = angular.module('core');

    module.constant('_', _);

    module.config(function($locationProvider, RestangularProvider,
                           $fbProvider, $twtProvider, $httpProvider) {
        $locationProvider.html5Mode(false);
        delete $httpProvider.defaults.headers.common['X-Requested-With'];
        RestangularProvider
            .setBaseUrl('/api/v1')
            .setRestangularFields({
                id : 'key'
            });

        $fbProvider.init('1044653762222445');
        $twtProvider.init()
            .trimText(true);
    });

    module.run(function(Restangular, $state, $rootScope, $timeout, gaAuthentication,
                        gaBrowserHistory, gaFlashMessages, Flash) {
        var loadingPromise;
        var endLoading = function () {
            $timeout.cancel(loadingPromise);
            $rootScope.isLoading = false;
        };

        if (gaAuthentication.isLogged()) {
            gaAuthentication.user = Restangular.restangularizeElement(null, gaAuthentication.user, 'users');
        }

        gaBrowserHistory.init();

        Restangular.setErrorInterceptor(function (res) {
            endLoading();
            var msg = res.data && res.data.message ? res.data.message :
                'Sorry, I failed so badly I can\'t even describe it :(';
            if (res.status === 403) {
                Flash.create('danger', 'Sorry, you\'re not allowed to do it, please sign in with different account');
                $state.go('signin');
            } else if (res.status === 401) {
                Flash.create('danger', 'Please sign in first!');
                $state.go('signin');
            } else if (res.status === 404) {
                Flash.create('danger', res.data.message || 'Sorry, this requested page doesn\'t exist');
            } else {
                Flash.create('danger', msg);
            }
            return true;
        });

        Restangular.addRequestInterceptor(function (element, operation) {
            // This is just convenient loading indicator, so we don't have to do it in every controller
            // separately. It's mainly used to disable submit buttons, when request is sent. There's also
            // added little delay so disabling buttons looks more smoothly
            loadingPromise = $timeout(function () {
                $rootScope.isLoading = true;
            }, 500);

            // Flask responds with error, when DELETE method contains body, so we remove it
            if (operation === 'remove') {
                return undefined;
            }
            return element;
        });
        Restangular.addResponseInterceptor(function (data) {
            endLoading();
            return data;
        });

        /**
         * This interceptor extracts meta data from list response
         * This meta data can be:
         *      cursor - ndb Cursor used for pagination
         *      totalCount - total count of items
         *      more - whether datastore contains more items, in terms of pagination
         */
        Restangular.addResponseInterceptor(function (data, operation) {
            var extractedData;
            if (operation === 'getList') {
                extractedData = data.list;
                extractedData.meta = data.meta;
            } else {
                extractedData = data;
            }
            return extractedData;
        });

        /**
         * If there are FlashMessages from server, toast will display them
         */
        if (!_.isEmpty(gaFlashMessages)) {
            Flash.create(gaFlashMessages[0]);
        }
    });

    module.controller('CoreController', function($scope, $document, $anchorScroll, $location,
                                                 gaAuthentication, gaAppConfig){
        $scope.user = gaAuthentication.user; //attaches signed in user to scope of <body/>
        $scope.cfg = gaAppConfig; //attaches config to scope of <body/>

    });

    module.constant('hnyColor', {
        DARK_PRIMARY_COLOR: '#512DA8',
        PRIMARY_COLOR: '#673AB7',
        LIGHT_PRIMARY_COLOR: '#D1C4E9',
        TEXT_PRIMARY_COLOR: '#FFFFFF',
        ACCENT_COLOR: '#7C4DFF',
        PRIMARY_TEXT_COLOR: '#212121',
        SECONDARY_TEXT_COLOR: '#727272',
        DIVIDER_COLOR: '#B6B6B6'
    });
}());