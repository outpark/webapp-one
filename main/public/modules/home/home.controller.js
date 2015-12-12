(function() {
    'use strict';
    var module = angular.module('core');

    module.controller('HomeController', function($scope, $log, $timeout, $interval) {
        $log.debug('Home Controller active');
        var cityIndex = 0;
        $scope.autoScrollCover = true;
        var autoScrollInterval = 5000;
        $scope.cities = [
            {
                name: 'New York',
                banner: '/p/modules/home/img/new_york.jpg'
            },
            {
                name: 'Abu Dhabi',
                banner: '/p/modules/home/img/abu_dhabi.jpg'
            },
            {
                name: 'Shanghai',
                banner: '/p/modules/home/img/shanghai.jpg'
            }
        ];

        $scope.selectCity = function(cityIndex){
            $interval.cancel($scope.intervalHandler);
            $scope.transitionToCity(cityIndex);
        };

        $scope.transitionToCity = function(cityIndex){
            if ($scope.activeCity)
                $scope.activeCity.animation = 'fadeOut';
            $scope.activeCity = $scope.cities[cityIndex];
            $scope.activeCity.animation = 'fadeIn';
        };


        function autoScroll(){
            $scope.transitionToCity(cityIndex);
            if (cityIndex > $scope.cities.length - 2)
                cityIndex = 0;
            else
                cityIndex ++;
        }

        $scope.intervalHandler = $interval(function(){
            autoScroll();
        }, autoScrollInterval);

        $scope.transitionToCity(cityIndex++);
    });

    module.controller('HomeNavbarController', function($scope, $log){

    });
}());