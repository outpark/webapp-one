(function() {
    'use strict';
    var module = angular.module('users');


    module.controller('DashboardHomeController', function($rootScope, $scope, $log, gaAuthentication,
                                                          $state, gaBrowserHistory, gaAppConfig,
                                                          Restangular, $interval, $fb, $twt, dhColors) {
        $scope.setHeader('Welcome, ' + ($scope.user.name ? $scope.user.name : $scope.user.username), null,
            dhColors.PINK);

        $scope.hideHeaderButton();

        $scope.openAmbassador = false;

        /* QUOTE CHANGER */
        $scope.currentQuoteIndex = 0;
        $scope.famousQuotes = [
            {
                quote: 'My greatest challenge has been to change the mindset of people. ' +
                'Mindsets play strange tricks on us. We see things the way our minds have instructed our eyes to see.',
                author: 'Muhammad Yunus'
            },
            {
                quote: 'All human beings are born entrepreneurs. Some get a chance to unleash that capacity. ' +
                'Some never got the chance, never knew that he or she has that capacity.',
                author: 'Muhammad Yunus'
            }
        ];

        var changeHeader = function(){
            $scope.currentQuoteIndex = Math.floor((Math.random()*$scope.famousQuotes.length));
        };
        $interval(changeHeader, 30000);
        /* DONE QUOTE CHANGER */

        $scope.shareFacebook = function(){
            $fb.feed({
                name: "Dental Hackathon",
                description: "Transform Oral Care Through Technology.",
                caption: 'Significant barriers exists for millions of Americans to access oral care ' +
                'and health education. In fact, 1 in 4 children report having cavities and over 181 million ' +
                'Americans do not visit the dentist.',
                link: "http://dentalhackathon.org",
                picture: "https://dental-hackathon-test.appspot.com/p/modules/core/img/banner_dental_hackathon.png"
            });
        };

        $scope.shareTwitter = function(){
            var text = 'Dental Hackathon: Transform Oral Care Through Technology.';
            var url = 'http://dentalhackathon.org';
            $twt.intent('tweet', {
                text : text,
                url  : url,
                hashtags: 'ChallengeOralCare',
                via: 'dentalhackathon16'
            });
        };
    });
}());
