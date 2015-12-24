(function() {
    'use strict';
    var module = angular.module('core');

    /**
     * @name gaBrowserHistory
     * @memberOf angularModule.core
     * @description
     * Keeps track of states user navigates
     */

    module.factory('gaBrowserHistory', function($state, $rootScope, $anchorScroll, _, gaAuthentication, $location) {
        var history = [];
        var beforeLogin = null;
        var ignoredStates = ['signout'];
        var dashboardHome = 'app.dashboard';
        var dashboardProfile = 'app.profile-wizard';
        var wasProfileShownForcefully = false;

        return {
            /**
             * Initialize browser history. This has to be run on app startup
             */
            init : function() {
                history = [];
                /*jslint unparam:true*/
                $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
                    if (fromState.abstract || _.contains(ignoredStates, fromState.name)) {
                        return;
                    }
                    history.push({
                        state  : fromState,
                        params : fromParams
                    });
                });
            },
            /**
             * Navigates back to previous state
             * If user is logged and his previous state was signin page, it won't redirect there
             */
            back : function(toTop) {
                var state = history.pop();
                if (!state || (gaAuthentication.isLogged() && state.state.data && state.state.data.signedOutOnly)) {
                    $state.go('dashboard.home');
                } else {
                    $state.go(state.state, state.params);
                }
                if (toTop)
                    $anchorScroll();
            },
            redirectLogin: function(){
                $state.go('login');
                beforeLogin = $location.url()
            },
            redirectAfterLogin: function(user){
                if (beforeLogin == null) { //no redirect login
                    if (user != null && user.profile.show_profile_wizard) { // redirect to profile editor
                        wasProfileShownForcefully = true;
                        $state.go(dashboardProfile);
                    }
                    else
                        $state.go(dashboardHome);
                } else {
                    //check if user profile is complete (terms have to be accepted)
                    $location.url(beforeLogin);
                }
            },
            goDashboardHome: function(){
                $state.go(dashboardHome);
            },
            checkWasProfileShownForcefully: function(){
                return wasProfileShownForcefully;
            }
        };

    });

}());
