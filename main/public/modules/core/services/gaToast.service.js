(function() {
    'use strict';
    var module = angular.module('core');

    /**
     * @name gaToast
     * @memberOf angularModule.core
     * @description
     * Service responsible for showing, hiding, updating toast
     */

    module.factory('gaToast', function(ngToast, _) {
        return {
            show   : function(content) {
                ngToast.create(content);
            },
            hide   : function() {
                ngToast.dismiss();
            }
        };
    });

}());
