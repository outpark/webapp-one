(function() {
    'use strict';

    var module = angular.module('core');

    module.constant('_', _);

    module.config(function($locationProvider, RestangularProvider, ngToastProvider,
                           $fbProvider, $twtProvider, $httpProvider) {
        $locationProvider.html5Mode(false);
        delete $httpProvider.defaults.headers.common['X-Requested-With'];
        RestangularProvider
            .setBaseUrl('/api/v1')
            .setRestangularFields({
                id : 'key'
            });

        ngToastProvider.configure({
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            dismissButton: true,
            additionalClasses: 'dh-toast'
        });

        $fbProvider.init('1044653762222445');
        $twtProvider.init()
            .trimText(true);
    });

    module.run(function(Restangular, $state, $rootScope, $timeout, ngToast, gaAuthentication,
                        gaBrowserHistory, gaFlashMessages) {
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
                ngToast.danger('Sorry, you\'re not allowed to do it, please sign in with different account');
                $state.go('signin');
            } else if (res.status === 401) {
                ngToast.warning('Please sign in first!');
                $state.go('signin');
            } else if (res.status === 404) {
                ngToast.danger(res.data.message || 'Sorry, this requested page doesn\'t exist');
            } else {
                ngToast.create(msg);
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
            ngToast.create(gaFlashMessages[0]);
        }
    });
    module.controller('CoreController', function($scope, $document, $anchorScroll, $location,
                                                 gaAuthentication, gaAppConfig){

        $scope.auth = gaAuthentication;
        $scope.user = $scope.auth.user;
        $scope.cfg = gaAppConfig;

        $scope.isLogged = gaAuthentication.isLogged();
        var currentLocation = $location.path();

        function fancyNavInit(){
            $scope.fancyNav = false;
            if (currentLocation == '/') {
                $scope.fancyNav = true;
            }
        }

        var animateScrollTo = null;

        function myEasing(t) {
            return t<.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1;
        }

        $scope.scrollTo = function(location){
            animateScrollTo = null;
            var element = angular.element(document.getElementById(location));
            $document.scrollToElement(element, 0, 500, myEasing);
        };

        $scope.homeAndScrollTo = function(location){
            if (currentLocation != '/') {
                $location.url('/');
                $location.hash(location);
                $anchorScroll();
            } else {
                $scope.scrollTo(location);
            }
        };

        $scope.$on('$locationChangeSuccess', function(){
            currentLocation = $location.path();
            fancyNavInit();
            if (animateScrollTo != null)
                $scope.scrollTo(animateScrollTo);
            $scope.isLogged = gaAuthentication.isLogged();
            $scope.auth = gaAuthentication;
            $scope.user = $scope.auth.user;
        });

        fancyNavInit();
    });
    module.constant('dhColors', {
        BLUE: '#337AB7',
        ORANGE: '#FA9D15',
        PINK: '#D93173',
        GREEN: '#42AF4A'
    });
}());