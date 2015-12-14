(function() {
    'use strict';
    var module = angular.module('core');

    module.controller('HomeController', function($scope, $log, $timeout, $interval, $http) {
        $log.debug('Home Controller active');
        var cityIndex = 0;
        $scope.autoScrollCover = true;
        var autoScrollInterval = 5000;
        $scope.tempInCelsius = false;

        $scope.cities = [
            {
                id: '5128581',
                name: 'New York',
                banner: '/p/modules/home/img/new_york.jpg'
            },
            {
                id: '292968',
                name: 'Abu Dhabi',
                banner: '/p/modules/home/img/abu_dhabi.jpg'
            },
            {
                id: '1796236',
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

        function getWeather(){
            $scope.cities.forEach(function(city){
                $http.get('http://api.openweathermap.org/data/2.5/weather?id='+city.id+'&APPID='+$scope.cfg.weatherApiKey).then(function(data){
                    console.log(data);
                    if (data.status == 200){
                        city['weather'] = data.data.main;
                    }
                });
            });
        }

        getWeather();

        $scope.getTemp = function(city){
            if (city.weather && city.weather.temp) {
                var value = parseInt(city.weather.temp);
                if (value) {
                    if ($scope.tempInCelsius) {
                        value -= 273.15;
                    } else {
                        value = value * 9 / 5 - 459.67;
                    }
                    return value.toFixed(1);
                }
            }
            return '--';
        };

        $scope.transitionToCity(cityIndex++);
    });
}());