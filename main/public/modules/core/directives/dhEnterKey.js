(function(){
    /*
     This directive allows us to pass a function in on an enter key to do what we want.
     */
    var module = angular.module('core');
    module.directive('dhEnter', function () {
        return function (scope, element, attrs) {
            element.bind("keydown keypress", function (event) {
                if(event.which === 13) {
                    scope.$apply(function (){
                        scope.$eval(attrs.dhEnter);
                    });
                    event.preventDefault();
                }
            });
        };
    });
}());
