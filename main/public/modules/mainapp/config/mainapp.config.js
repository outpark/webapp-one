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

    var module = angular.module('mainapp');

    module.constant('_', _);

    module.config(function($locationProvider, RestangularProvider, FacebookProvider, $httpProvider) {
        $locationProvider.html5Mode(false);
        delete $httpProvider.defaults.headers.common['X-Requested-With'];
        RestangularProvider
            .setBaseUrl('/api/v1')
            .setRestangularFields({
                id : 'key'
            });
        //todo put appid in backend config
        FacebookProvider.init({
            appId      : '903435779732345',
            xfbml      : true,
            version    : 'v2.5'
        });
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

        function showError(color, message, testJson){
            if (!(testJson && message.indexOf('json') > -1))
                Flash.create(color, message);
        }

        Restangular.setErrorInterceptor(function (res) {
            endLoading();
            var msg = res.data && res.data.message ? res.data.message :
                'Sorry, I failed so badly I can\'t even describe it :(';
            if (res.status === 403) {
                showError('danger', res.data.message || 'Sorry, you\'re not allowed to do it, please sign in with different account');
            } else if (res.status === 401) {
                showError('danger', res.data.message || 'Please sign in first!');
                $state.go('login');
            } else if (res.status === 404) {
                showError('danger', res.data.message || 'Sorry, this requested page doesn\'t exist');
            } else {
                showError('danger', msg, true);
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

    module.constant('HackNYUConst',{
        HACKATHON_NAME: 'spring_2016'
    })
}());