var module = angular.module('core');

module.controller('FormWizardController', ['$scope', '$element', '$interval', '$timeout', '$animate', function($scope, $element, $interval, $timeout, $animate) {
        var self = this,
            slides = self.slides = $scope.slides = [],
            SLIDE_DIRECTION = 'uib-slideDirection',
            currentIndex = -1,
            currentInterval, isPlaying, bufferedTransitions = [];
        self.currentSlide = null;

        var destroyed = false;

        self.addSlide = function(slide, element) {
            slide.$element = element;
            slides.push(slide);
            //if this is the first slide or the slide is set to active, select it
            if (slides.length === 1 || slide.active) {
                if ($scope.$currentTransition) {
                    $scope.$currentTransition = null;
                }

                self.select(slides[slides.length - 1]);
            } else {
                slide.active = false;
            }
        };

        self.getCurrentIndex = function() {
            if (self.currentSlide && angular.isDefined(self.currentSlide.index)) {
                return +self.currentSlide.index;
            }
            return currentIndex;
        };

        self.next = $scope.next = function() {
            var newIndex = (self.getCurrentIndex() + 1) % slides.length;
            $scope.wizardFxn.onNextPage($scope.form);

            if (newIndex === 0) {
                return;
            }

            return self.select(getSlideByIndex(newIndex), 'next');
        };

        self.prev = $scope.prev = function() {
            var newIndex = self.getCurrentIndex() - 1 < 0 ? slides.length - 1 : self.getCurrentIndex() - 1;

            if (newIndex === slides.length - 1) {
                return;
            }

            return self.select(getSlideByIndex(newIndex), 'prev');
        };

        self.removeSlide = function(slide) {
            if (angular.isDefined(slide.index)) {
                slides.sort(function(a, b) {
                    return +a.index > +b.index;
                });
            }

            var bufferedIndex = bufferedTransitions.indexOf(slide);
            if (bufferedIndex !== -1) {
                bufferedTransitions.splice(bufferedIndex, 1);
            }
            //get the index of the slide inside the carousel
            var index = slides.indexOf(slide);
            slides.splice(index, 1);
            $timeout(function() {
                if (slides.length > 0 && slide.active) {
                    if (index >= slides.length) {
                        self.select(slides[index - 1]);
                    } else {
                        self.select(slides[index]);
                    }
                } else if (currentIndex > index) {
                    currentIndex--;
                }
            });

            //clean the currentSlide when no more slide
            if (slides.length === 0) {
                self.currentSlide = null;
                clearBufferedTransitions();
            }
        };

        /* direction: "prev" or "next" */
        self.select = $scope.select = function(nextSlide, direction) {
            var nextIndex = $scope.indexOfSlide(nextSlide);
            //Decide direction if it's not given
            if (direction === undefined) {
                direction = nextIndex > self.getCurrentIndex() ? 'next' : 'prev';
            }
            //Prevent this user-triggered transition from occurring if there is already one in progress
            if (nextSlide && nextSlide !== self.currentSlide && !$scope.$currentTransition) {
                goNext(nextSlide, nextIndex, direction);
            } else if (nextSlide && nextSlide !== self.currentSlide && $scope.$currentTransition) {
                bufferedTransitions.push(nextSlide);
            }
        };

        /* Allow outside people to call indexOf on slides array */
        $scope.indexOfSlide = function(slide) {
            return angular.isDefined(slide.index) ? +slide.index : slides.indexOf(slide);
        };

        $scope.isActive = function(slide) {
            return self.currentSlide === slide;
        };

        $scope.$on('$destroy', function() {
            destroyed = true;
        });

        $scope.$watch('noTransition', function(noTransition) {
            $animate.enabled($element, !noTransition);
        });

        $scope.$watchCollection('slides', resetTransition);

        function clearBufferedTransitions() {
            while (bufferedTransitions.length) {
                bufferedTransitions.shift();
            }
        }

        function getSlideByIndex(index) {
            if (angular.isUndefined(slides[index].index)) {
                return slides[index];
            }
            for (var i = 0, l = slides.length; i < l; ++i) {
                if (slides[i].index === index) {
                    return slides[i];
                }
            }
        }

        function goNext(slide, index, direction) {
            if (destroyed) { return; }

            angular.extend(slide, {direction: direction, active: true});
            angular.extend(self.currentSlide || {}, {direction: direction, active: false});
            if ($animate.enabled($element) && !$scope.$currentTransition &&
                slide.$element && self.slides.length > 1) {
                slide.$element.data(SLIDE_DIRECTION, slide.direction);
                if (self.currentSlide && self.currentSlide.$element) {
                    self.currentSlide.$element.data(SLIDE_DIRECTION, slide.direction);
                }

                $scope.$currentTransition = true;
                $animate.on('addClass', slide.$element, function(element, phase) {
                    if (phase === 'close') {
                        $scope.$currentTransition = null;
                        $animate.off('addClass', element);
                        if (bufferedTransitions.length) {
                            var nextSlide = bufferedTransitions.pop();
                            var nextIndex = $scope.indexOfSlide(nextSlide);
                            var nextDirection = nextIndex > self.getCurrentIndex() ? 'next' : 'prev';
                            clearBufferedTransitions();

                            goNext(nextSlide, nextIndex, nextDirection);
                        }
                    }
                });
            }

            self.currentSlide = slide;
            currentIndex = index;
        }


        function resetTransition(slides) {
            if (!slides.length) {
                $scope.$currentTransition = null;
                clearBufferedTransitions();
            }
        }
    }])

    .directive('formWizard', function() {
        return {
            transclude: true,
            replace: true,
            controller: 'FormWizardController',
            controllerAs: 'carousel',
            templateUrl: function(element, attrs) {
                return attrs.templateUrl || '/p/modules/core/directives/form-wizard/form-wizard.view.html';
            },
            scope: {
                wizardFxn: '='
            }
        };
    })

    .directive('formWizardSlide', function() {
        return {
            require: '^formWizard',
            transclude: true,
            replace: true,
            templateUrl: function(element, attrs) {
                return attrs.templateUrl || '/p/modules/core/directives/form-wizard/form-wizard-slide.view.html';
            },
            scope: {
                active: '=?',
                index: '=?',
                name: '@',
                partial: '@',
                wizardFxn: '=',
                data: '='
            },
            link: function (scope, element, attrs, carouselCtrl) {
                carouselCtrl.addSlide(scope, element);
                //when the scope is destroyed then remove the slide from the current slides array
                scope.$on('$destroy', function() {
                    carouselCtrl.removeSlide(scope);
                });

                scope.$watch('active', function(active) {
                    if (active) {
                        carouselCtrl.select(scope);
                    }
                });
            }
        };
    })

    .animation('.item', ['$animateCss',
        function($animateCss) {
            var SLIDE_DIRECTION = 'uib-slideDirection';

            function removeClass(element, className, callback) {
                element.removeClass(className);
                if (callback) {
                    callback();
                }
            }

            return {
                beforeAddClass: function(element, className, done) {
                    if (className === 'active') {
                        var stopped = false;
                        var direction = element.data(SLIDE_DIRECTION);
                        var directionClass = direction === 'next' ? 'left' : 'right';
                        var removeClassFn = removeClass.bind(this, element,
                            directionClass + ' ' + direction, done);
                        element.addClass(direction);

                        $animateCss(element, {addClass: directionClass})
                            .start()
                            .done(removeClassFn);

                        return function() {
                            stopped = true;
                        };
                    }
                    done();
                },
                beforeRemoveClass: function (element, className, done) {
                    if (className === 'active') {
                        var stopped = false;
                        var direction = element.data(SLIDE_DIRECTION);
                        var directionClass = direction === 'next' ? 'left' : 'right';
                        var removeClassFn = removeClass.bind(this, element, directionClass, done);

                        $animateCss(element, {addClass: directionClass})
                            .start()
                            .done(removeClassFn);

                        return function() {
                            stopped = true;
                        };
                    }
                    done();
                }
            };
        }]);