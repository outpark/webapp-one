(function(){
    /*
     This directive allows us to pass a function in on an enter key to do what we want.
     */
    var module = angular.module('core');
    module.directive('dhTimer', function ($interval) {
        function dhms(t) {
            var days, hours, minutes, seconds;
            days = Math.floor(t / 86400);
            t -= days * 86400;
            hours = Math.floor(t / 3600) % 24;
            t -= hours * 3600;
            minutes = Math.floor(t / 60) % 60;
            t -= minutes * 60;
            seconds = t % 60;
            return [
                days + ' day' + (days > 1 ? 's' : '') + ' · ',
                hours + ' hour' + (hours > 1 ? 's' : '') + ' · ',
                minutes + ' minute' + (minutes > 1 ? 's' : '') + ' · ',
                seconds + ' second' + (seconds > 1 ? 's' : '') + ': Workshop 1'
            ].join(' ');
        }

        return {
            link: function (scope, element) {
                var future;
                future = new Date(scope.date);
                $interval(function () {
                    var diff;
                    diff = Math.floor((future.getTime() - new Date().getTime()) / 1000);
                    return element.text(dhms(diff));
                }, 1000);
            },
            restrict: 'A',
            replace: true,
            scope: {
                date: '@'
            }
        };
    });
}());
