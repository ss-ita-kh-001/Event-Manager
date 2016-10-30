/*
 * angular-ui-bootstrap
 * http://angular-ui.github.io/bootstrap/

 * Version: 2.1.3 - 2016-08-25
 * License: MIT
 */angular.module("ui.bootstrap", ["ui.bootstrap.collapse","ui.bootstrap.tabindex","ui.bootstrap.accordion","ui.bootstrap.alert","ui.bootstrap.buttons","ui.bootstrap.carousel","ui.bootstrap.dateparser","ui.bootstrap.isClass","ui.bootstrap.datepicker","ui.bootstrap.position","ui.bootstrap.datepickerPopup","ui.bootstrap.debounce","ui.bootstrap.dropdown","ui.bootstrap.stackedMap","ui.bootstrap.modal","ui.bootstrap.paging","ui.bootstrap.pager","ui.bootstrap.pagination","ui.bootstrap.tooltip","ui.bootstrap.popover","ui.bootstrap.progressbar","ui.bootstrap.rating","ui.bootstrap.tabs","ui.bootstrap.timepicker","ui.bootstrap.typeahead"]);
angular.module('ui.bootstrap.collapse', [])

  .directive('uibCollapse', ['$animate', '$q', '$parse', '$injector', function($animate, $q, $parse, $injector) {
    var $animateCss = $injector.has('$animateCss') ? $injector.get('$animateCss') : null;
    return {
      link: function(scope, element, attrs) {
        var expandingExpr = $parse(attrs.expanding),
          expandedExpr = $parse(attrs.expanded),
          collapsingExpr = $parse(attrs.collapsing),
          collapsedExpr = $parse(attrs.collapsed),
          horizontal = false,
          css = {},
          cssTo = {};

        init();

        function init() {
          horizontal = !!('horizontal' in attrs);
          if (horizontal) {
            css = {
              width: ''
            };
            cssTo = {width: '0'};
          } else {
            css = {
              height: ''
            };
            cssTo = {height: '0'};
          }
          if (!scope.$eval(attrs.uibCollapse)) {
            element.addClass('in')
              .addClass('collapse')
              .attr('aria-expanded', true)
              .attr('aria-hidden', false)
              .css(css);
          }
        }

        function getScrollFromElement(element) {
          if (horizontal) {
            return {width: element.scrollWidth + 'px'};
          }
          return {height: element.scrollHeight + 'px'};
        }

        function expand() {
          if (element.hasClass('collapse') && element.hasClass('in')) {
            return;
          }

          $q.resolve(expandingExpr(scope))
            .then(function() {
              element.removeClass('collapse')
                .addClass('collapsing')
                .attr('aria-expanded', true)
                .attr('aria-hidden', false);

              if ($animateCss) {
                $animateCss(element, {
                  addClass: 'in',
                  easing: 'ease',
                  css: {
                    overflow: 'hidden'
                  },
                  to: getScrollFromElement(element[0])
                }).start()['finally'](expandDone);
              } else {
                $animate.addClass(element, 'in', {
                  css: {
                    overflow: 'hidden'
                  },
                  to: getScrollFromElement(element[0])
                }).then(expandDone);
              }
            });
        }

        function expandDone() {
          element.removeClass('collapsing')
            .addClass('collapse')
            .css(css);
          expandedExpr(scope);
        }

        function collapse() {
          if (!element.hasClass('collapse') && !element.hasClass('in')) {
            return collapseDone();
          }

          $q.resolve(collapsingExpr(scope))
            .then(function() {
              element
              // IMPORTANT: The width must be set before adding "collapsing" class.
              // Otherwise, the browser attempts to animate from width 0 (in
              // collapsing class) to the given width here.
                .css(getScrollFromElement(element[0]))
                // initially all panel collapse have the collapse class, this removal
                // prevents the animation from jumping to collapsed state
                .removeClass('collapse')
                .addClass('collapsing')
                .attr('aria-expanded', false)
                .attr('aria-hidden', true);

              if ($animateCss) {
                $animateCss(element, {
                  removeClass: 'in',
                  to: cssTo
                }).start()['finally'](collapseDone);
              } else {
                $animate.removeClass(element, 'in', {
                  to: cssTo
                }).then(collapseDone);
              }
            });
        }

        function collapseDone() {
          element.css(cssTo); // Required so that collapse works when animation is disabled
          element.removeClass('collapsing')
            .addClass('collapse');
          collapsedExpr(scope);
        }

        scope.$watch(attrs.uibCollapse, function(shouldCollapse) {
          if (shouldCollapse) {
            collapse();
          } else {
            expand();
          }
        });
      }
    };
  }]);

angular.module('ui.bootstrap.tabindex', [])

.directive('uibTabindexToggle', function() {
  return {
    restrict: 'A',
    link: function(scope, elem, attrs) {
      attrs.$observe('disabled', function(disabled) {
        attrs.$set('tabindex', disabled ? -1 : null);
      });
    }
  };
});

angular.module('ui.bootstrap.accordion', ['ui.bootstrap.collapse', 'ui.bootstrap.tabindex'])

.constant('uibAccordionConfig', {
  closeOthers: true
})

.controller('UibAccordionController', ['$scope', '$attrs', 'uibAccordionConfig', function($scope, $attrs, accordionConfig) {
  // This array keeps track of the accordion groups
  this.groups = [];

  // Ensure that all the groups in this accordion are closed, unless close-others explicitly says not to
  this.closeOthers = function(openGroup) {
    var closeOthers = angular.isDefined($attrs.closeOthers) ?
      $scope.$eval($attrs.closeOthers) : accordionConfig.closeOthers;
    if (closeOthers) {
      angular.forEach(this.groups, function(group) {
        if (group !== openGroup) {
          group.isOpen = false;
        }
      });
    }
  };

  // This is called from the accordion-group directive to add itself to the accordion
  this.addGroup = function(groupScope) {
    var that = this;
    this.groups.push(groupScope);

    groupScope.$on('$destroy', function(event) {
      that.removeGroup(groupScope);
    });
  };

  // This is called from the accordion-group directive when to remove itself
  this.removeGroup = function(group) {
    var index = this.groups.indexOf(group);
    if (index !== -1) {
      this.groups.splice(index, 1);
    }
  };
}])

// The accordion directive simply sets up the directive controller
// and adds an accordion CSS class to itself element.
.directive('uibAccordion', function() {
  return {
    controller: 'UibAccordionController',
    controllerAs: 'accordion',
    transclude: true,
    templateUrl: function(element, attrs) {
      return attrs.templateUrl || 'uib/template/accordion/accordion.html';
    }
  };
})

// The accordion-group directive indicates a block of html that will expand and collapse in an accordion
.directive('uibAccordionGroup', function() {
  return {
    require: '^uibAccordion',         // We need this directive to be inside an accordion
    transclude: true,              // It transcludes the contents of the directive into the template
    restrict: 'A',
    templateUrl: function(element, attrs) {
      return attrs.templateUrl || 'uib/template/accordion/accordion-group.html';
    },
    scope: {
      heading: '@',               // Interpolate the heading attribute onto this scope
      panelClass: '@?',           // Ditto with panelClass
      isOpen: '=?',
      isDisabled: '=?'
    },
    controller: function() {
      this.setHeading = function(element) {
        this.heading = element;
      };
    },
    link: function(scope, element, attrs, accordionCtrl) {
      element.addClass('panel');
      accordionCtrl.addGroup(scope);

      scope.openClass = attrs.openClass || 'panel-open';
      scope.panelClass = attrs.panelClass || 'panel-default';
      scope.$watch('isOpen', function(value) {
        element.toggleClass(scope.openClass, !!value);
        if (value) {
          accordionCtrl.closeOthers(scope);
        }
      });

      scope.toggleOpen = function($event) {
        if (!scope.isDisabled) {
          if (!$event || $event.which === 32) {
            scope.isOpen = !scope.isOpen;
          }
        }
      };

      var id = 'accordiongroup-' + scope.$id + '-' + Math.floor(Math.random() * 10000);
      scope.headingId = id + '-tab';
      scope.panelId = id + '-panel';
    }
  };
})

// Use accordion-heading below an accordion-group to provide a heading containing HTML
.directive('uibAccordionHeading', function() {
  return {
    transclude: true,   // Grab the contents to be used as the heading
    template: '',       // In effect remove this element!
    replace: true,
    require: '^uibAccordionGroup',
    link: function(scope, element, attrs, accordionGroupCtrl, transclude) {
      // Pass the heading to the accordion-group controller
      // so that it can be transcluded into the right place in the template
      // [The second parameter to transclude causes the elements to be cloned so that they work in ng-repeat]
      accordionGroupCtrl.setHeading(transclude(scope, angular.noop));
    }
  };
})

// Use in the accordion-group template to indicate where you want the heading to be transcluded
// You must provide the property on the accordion-group controller that will hold the transcluded element
.directive('uibAccordionTransclude', function() {
  return {
    require: '^uibAccordionGroup',
    link: function(scope, element, attrs, controller) {
      scope.$watch(function() { return controller[attrs.uibAccordionTransclude]; }, function(heading) {
        if (heading) {
          var elem = angular.element(element[0].querySelector(getHeaderSelectors()));
          elem.html('');
          elem.append(heading);
        }
      });
    }
  };

  function getHeaderSelectors() {
      return 'uib-accordion-header,' +
          'data-uib-accordion-header,' +
          'x-uib-accordion-header,' +
          'uib\\:accordion-header,' +
          '[uib-accordion-header],' +
          '[data-uib-accordion-header],' +
          '[x-uib-accordion-header]';
  }
});

angular.module('ui.bootstrap.alert', [])

.controller('UibAlertController', ['$scope', '$element', '$attrs', '$interpolate', '$timeout', function($scope, $element, $attrs, $interpolate, $timeout) {
  $scope.closeable = !!$attrs.close;
  $element.addClass('alert');
  $attrs.$set('role', 'alert');
  if ($scope.closeable) {
    $element.addClass('alert-dismissible');
  }

  var dismissOnTimeout = angular.isDefined($attrs.dismissOnTimeout) ?
    $interpolate($attrs.dismissOnTimeout)($scope.$parent) : null;

  if (dismissOnTimeout) {
    $timeout(function() {
      $scope.close();
    }, parseInt(dismissOnTimeout, 10));
  }
}])

.directive('uibAlert', function() {
  return {
    controller: 'UibAlertController',
    controllerAs: 'alert',
    restrict: 'A',
    templateUrl: function(element, attrs) {
      return attrs.templateUrl || 'uib/template/alert/alert.html';
    },
    transclude: true,
    scope: {
      close: '&'
    }
  };
});

angular.module('ui.bootstrap.buttons', [])

.constant('uibButtonConfig', {
  activeClass: 'active',
  toggleEvent: 'click'
})

.controller('UibButtonsController', ['uibButtonConfig', function(buttonConfig) {
  this.activeClass = buttonConfig.activeClass || 'active';
  this.toggleEvent = buttonConfig.toggleEvent || 'click';
}])

.directive('uibBtnRadio', ['$parse', function($parse) {
  return {
    require: ['uibBtnRadio', 'ngModel'],
    controller: 'UibButtonsController',
    controllerAs: 'buttons',
    link: function(scope, element, attrs, ctrls) {
      var buttonsCtrl = ctrls[0], ngModelCtrl = ctrls[1];
      var uncheckableExpr = $parse(attrs.uibUncheckable);

      element.find('input').css({display: 'none'});

      //model -> UI
      ngModelCtrl.$render = function() {
        element.toggleClass(buttonsCtrl.activeClass, angular.equals(ngModelCtrl.$modelValue, scope.$eval(attrs.uibBtnRadio)));
      };

      //ui->model
      element.on(buttonsCtrl.toggleEvent, function() {
        if (attrs.disabled) {
          return;
        }

        var isActive = element.hasClass(buttonsCtrl.activeClass);

        if (!isActive || angular.isDefined(attrs.uncheckable)) {
          scope.$apply(function() {
            ngModelCtrl.$setViewValue(isActive ? null : scope.$eval(attrs.uibBtnRadio));
            ngModelCtrl.$render();
          });
        }
      });

      if (attrs.uibUncheckable) {
        scope.$watch(uncheckableExpr, function(uncheckable) {
          attrs.$set('uncheckable', uncheckable ? '' : undefined);
        });
      }
    }
  };
}])

.directive('uibBtnCheckbox', function() {
  return {
    require: ['uibBtnCheckbox', 'ngModel'],
    controller: 'UibButtonsController',
    controllerAs: 'button',
    link: function(scope, element, attrs, ctrls) {
      var buttonsCtrl = ctrls[0], ngModelCtrl = ctrls[1];

      element.find('input').css({display: 'none'});

      function getTrueValue() {
        return getCheckboxValue(attrs.btnCheckboxTrue, true);
      }

      function getFalseValue() {
        return getCheckboxValue(attrs.btnCheckboxFalse, false);
      }

      function getCheckboxValue(attribute, defaultValue) {
        return angular.isDefined(attribute) ? scope.$eval(attribute) : defaultValue;
      }

      //model -> UI
      ngModelCtrl.$render = function() {
        element.toggleClass(buttonsCtrl.activeClass, angular.equals(ngModelCtrl.$modelValue, getTrueValue()));
      };

      //ui->model
      element.on(buttonsCtrl.toggleEvent, function() {
        if (attrs.disabled) {
          return;
        }

        scope.$apply(function() {
          ngModelCtrl.$setViewValue(element.hasClass(buttonsCtrl.activeClass) ? getFalseValue() : getTrueValue());
          ngModelCtrl.$render();
        });
      });
    }
  };
});

angular.module('ui.bootstrap.carousel', [])

.controller('UibCarouselController', ['$scope', '$element', '$interval', '$timeout', '$animate', function($scope, $element, $interval, $timeout, $animate) {
  var self = this,
    slides = self.slides = $scope.slides = [],
    SLIDE_DIRECTION = 'uib-slideDirection',
    currentIndex = $scope.active,
    currentInterval, isPlaying, bufferedTransitions = [];

  var destroyed = false;
  $element.addClass('carousel');

  self.addSlide = function(slide, element) {
    slides.push({
      slide: slide,
      element: element
    });
    slides.sort(function(a, b) {
      return +a.slide.index - +b.slide.index;
    });
    //if this is the first slide or the slide is set to active, select it
    if (slide.index === $scope.active || slides.length === 1 && !angular.isNumber($scope.active)) {
      if ($scope.$currentTransition) {
        $scope.$currentTransition = null;
      }

      currentIndex = slide.index;
      $scope.active = slide.index;
      setActive(currentIndex);
      self.select(slides[findSlideIndex(slide)]);
      if (slides.length === 1) {
        $scope.play();
      }
    }
  };

  self.getCurrentIndex = function() {
    for (var i = 0; i < slides.length; i++) {
      if (slides[i].slide.index === currentIndex) {
        return i;
      }
    }
  };

  self.next = $scope.next = function() {
    var newIndex = (self.getCurrentIndex() + 1) % slides.length;

    if (newIndex === 0 && $scope.noWrap()) {
      $scope.pause();
      return;
    }

    return self.select(slides[newIndex], 'next');
  };

  self.prev = $scope.prev = function() {
    var newIndex = self.getCurrentIndex() - 1 < 0 ? slides.length - 1 : self.getCurrentIndex() - 1;

    if ($scope.noWrap() && newIndex === slides.length - 1) {
      $scope.pause();
      return;
    }

    return self.select(slides[newIndex], 'prev');
  };

  self.removeSlide = function(slide) {
    var index = findSlideIndex(slide);

    var bufferedIndex = bufferedTransitions.indexOf(slides[index]);
    if (bufferedIndex !== -1) {
      bufferedTransitions.splice(bufferedIndex, 1);
    }

    //get the index of the slide inside the carousel
    slides.splice(index, 1);
    if (slides.length > 0 && currentIndex === index) {
      if (index >= slides.length) {
        currentIndex = slides.length - 1;
        $scope.active = currentIndex;
        setActive(currentIndex);
        self.select(slides[slides.length - 1]);
      } else {
        currentIndex = index;
        $scope.active = currentIndex;
        setActive(currentIndex);
        self.select(slides[index]);
      }
    } else if (currentIndex > index) {
      currentIndex--;
      $scope.active = currentIndex;
    }

    //clean the active value when no more slide
    if (slides.length === 0) {
      currentIndex = null;
      $scope.active = null;
      clearBufferedTransitions();
    }
  };

  /* direction: "prev" or "next" */
  self.select = $scope.select = function(nextSlide, direction) {
    var nextIndex = findSlideIndex(nextSlide.slide);
    //Decide direction if it's not given
    if (direction === undefined) {
      direction = nextIndex > self.getCurrentIndex() ? 'next' : 'prev';
    }
    //Prevent this user-triggered transition from occurring if there is already one in progress
    if (nextSlide.slide.index !== currentIndex &&
      !$scope.$currentTransition) {
      goNext(nextSlide.slide, nextIndex, direction);
    } else if (nextSlide && nextSlide.slide.index !== currentIndex && $scope.$currentTransition) {
      bufferedTransitions.push(slides[nextIndex]);
    }
  };

  /* Allow outside people to call indexOf on slides array */
  $scope.indexOfSlide = function(slide) {
    return +slide.slide.index;
  };

  $scope.isActive = function(slide) {
    return $scope.active === slide.slide.index;
  };

  $scope.isPrevDisabled = function() {
    return $scope.active === 0 && $scope.noWrap();
  };

  $scope.isNextDisabled = function() {
    return $scope.active === slides.length - 1 && $scope.noWrap();
  };

  $scope.pause = function() {
    if (!$scope.noPause) {
      isPlaying = false;
      resetTimer();
    }
  };

  $scope.play = function() {
    if (!isPlaying) {
      isPlaying = true;
      restartTimer();
    }
  };

  $element.on('mouseenter', $scope.pause);
  $element.on('mouseleave', $scope.play);

  $scope.$on('$destroy', function() {
    destroyed = true;
    resetTimer();
  });

  $scope.$watch('noTransition', function(noTransition) {
    $animate.enabled($element, !noTransition);
  });

  $scope.$watch('interval', restartTimer);

  $scope.$watchCollection('slides', resetTransition);

  $scope.$watch('active', function(index) {
    if (angular.isNumber(index) && currentIndex !== index) {
      for (var i = 0; i < slides.length; i++) {
        if (slides[i].slide.index === index) {
          index = i;
          break;
        }
      }

      var slide = slides[index];
      if (slide) {
        setActive(index);
        self.select(slides[index]);
        currentIndex = index;
      }
    }
  });

  function clearBufferedTransitions() {
    while (bufferedTransitions.length) {
      bufferedTransitions.shift();
    }
  }

  function getSlideByIndex(index) {
    for (var i = 0, l = slides.length; i < l; ++i) {
      if (slides[i].index === index) {
        return slides[i];
      }
    }
  }

  function setActive(index) {
    for (var i = 0; i < slides.length; i++) {
      slides[i].slide.active = i === index;
    }
  }

  function goNext(slide, index, direction) {
    if (destroyed) {
      return;
    }

    angular.extend(slide, {direction: direction});
    angular.extend(slides[currentIndex].slide || {}, {direction: direction});
    if ($animate.enabled($element) && !$scope.$currentTransition &&
      slides[index].element && self.slides.length > 1) {
      slides[index].element.data(SLIDE_DIRECTION, slide.direction);
      var currentIdx = self.getCurrentIndex();

      if (angular.isNumber(currentIdx) && slides[currentIdx].element) {
        slides[currentIdx].element.data(SLIDE_DIRECTION, slide.direction);
      }

      $scope.$currentTransition = true;
      $animate.on('addClass', slides[index].element, function(element, phase) {
        if (phase === 'close') {
          $scope.$currentTransition = null;
          $animate.off('addClass', element);
          if (bufferedTransitions.length) {
            var nextSlide = bufferedTransitions.pop().slide;
            var nextIndex = nextSlide.index;
            var nextDirection = nextIndex > self.getCurrentIndex() ? 'next' : 'prev';
            clearBufferedTransitions();

            goNext(nextSlide, nextIndex, nextDirection);
          }
        }
      });
    }

    $scope.active = slide.index;
    currentIndex = slide.index;
    setActive(index);

    //every time you change slides, reset the timer
    restartTimer();
  }

  function findSlideIndex(slide) {
    for (var i = 0; i < slides.length; i++) {
      if (slides[i].slide === slide) {
        return i;
      }
    }
  }

  function resetTimer() {
    if (currentInterval) {
      $interval.cancel(currentInterval);
      currentInterval = null;
    }
  }

  function resetTransition(slides) {
    if (!slides.length) {
      $scope.$currentTransition = null;
      clearBufferedTransitions();
    }
  }

  function restartTimer() {
    resetTimer();
    var interval = +$scope.interval;
    if (!isNaN(interval) && interval > 0) {
      currentInterval = $interval(timerFn, interval);
    }
  }

  function timerFn() {
    var interval = +$scope.interval;
    if (isPlaying && !isNaN(interval) && interval > 0 && slides.length) {
      $scope.next();
    } else {
      $scope.pause();
    }
  }
}])

.directive('uibCarousel', function() {
  return {
    transclude: true,
    controller: 'UibCarouselController',
    controllerAs: 'carousel',
    restrict: 'A',
    templateUrl: function(element, attrs) {
      return attrs.templateUrl || 'uib/template/carousel/carousel.html';
    },
    scope: {
      active: '=',
      interval: '=',
      noTransition: '=',
      noPause: '=',
      noWrap: '&'
    }
  };
})

.directive('uibSlide', ['$animate', function($animate) {
  return {
    require: '^uibCarousel',
    restrict: 'A',
    transclude: true,
    templateUrl: function(element, attrs) {
      return attrs.templateUrl || 'uib/template/carousel/slide.html';
    },
    scope: {
      actual: '=?',
      index: '=?'
    },
    link: function (scope, element, attrs, carouselCtrl) {
      element.addClass('item');
      carouselCtrl.addSlide(scope, element);
      //when the scope is destroyed then remove the slide from the current slides array
      scope.$on('$destroy', function() {
        carouselCtrl.removeSlide(scope);
      });

      scope.$watch('active', function(active) {
        $animate[active ? 'addClass' : 'removeClass'](element, 'active');
      });
    }
  };
}])

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

angular.module('ui.bootstrap.dateparser', [])

.service('uibDateParser', ['$log', '$locale', 'dateFilter', 'orderByFilter', function($log, $locale, dateFilter, orderByFilter) {
  // Pulled from https://github.com/mbostock/d3/blob/master/src/format/requote.js
  var SPECIAL_CHARACTERS_REGEXP = /[\\\^\$\*\+\?\|\[\]\(\)\.\{\}]/g;

  var localeId;
  var formatCodeToRegex;

  this.init = function() {
    localeId = $locale.id;

    this.parsers = {};
    this.formatters = {};

    formatCodeToRegex = [
      {
        key: 'yyyy',
        regex: '\\d{4}',
        apply: function(value) { this.year = +value; },
        formatter: function(date) {
          var _date = new Date();
          _date.setFullYear(Math.abs(date.getFullYear()));
          return dateFilter(_date, 'yyyy');
        }
      },
      {
        key: 'yy',
        regex: '\\d{2}',
        apply: function(value) { value = +value; this.year = value < 69 ? value + 2000 : value + 1900; },
        formatter: function(date) {
          var _date = new Date();
          _date.setFullYear(Math.abs(date.getFullYear()));
          return dateFilter(_date, 'yy');
        }
      },
      {
        key: 'y',
        regex: '\\d{1,4}',
        apply: function(value) { this.year = +value; },
        formatter: function(date) {
          var _date = new Date();
          _date.setFullYear(Math.abs(date.getFullYear()));
          return dateFilter(_date, 'y');
        }
      },
      {
        key: 'M!',
        regex: '0?[1-9]|1[0-2]',
        apply: function(value) { this.month = value - 1; },
        formatter: function(date) {
          var value = date.getMonth();
          if (/^[0-9]$/.test(value)) {
            return dateFilter(date, 'MM');
          }

          return dateFilter(date, 'M');
        }
      },
      {
        key: 'MMMM',
        regex: $locale.DATETIME_FORMATS.MONTH.join('|'),
        apply: function(value) { this.month = $locale.DATETIME_FORMATS.MONTH.indexOf(value); },
        formatter: function(date) { return dateFilter(date, 'MMMM'); }
      },
      {
        key: 'MMM',
        regex: $locale.DATETIME_FORMATS.SHORTMONTH.join('|'),
        apply: function(value) { this.month = $locale.DATETIME_FORMATS.SHORTMONTH.indexOf(value); },
        formatter: function(date) { return dateFilter(date, 'MMM'); }
      },
      {
        key: 'MM',
        regex: '0[1-9]|1[0-2]',
        apply: function(value) { this.month = value - 1; },
        formatter: function(date) { return dateFilter(date, 'MM'); }
      },
      {
        key: 'M',
        regex: '[1-9]|1[0-2]',
        apply: function(value) { this.month = value - 1; },
        formatter: function(date) { return dateFilter(date, 'M'); }
      },
      {
        key: 'd!',
        regex: '[0-2]?[0-9]{1}|3[0-1]{1}',
        apply: function(value) { this.date = +value; },
        formatter: function(date) {
          var value = date.getDate();
          if (/^[1-9]$/.test(value)) {
            return dateFilter(date, 'dd');
          }

          return dateFilter(date, 'd');
        }
      },
      {
        key: 'dd',
        regex: '[0-2][0-9]{1}|3[0-1]{1}',
        apply: function(value) { this.date = +value; },
        formatter: function(date) { return dateFilter(date, 'dd'); }
      },
      {
        key: 'd',
        regex: '[1-2]?[0-9]{1}|3[0-1]{1}',
        apply: function(value) { this.date = +value; },
        formatter: function(date) { return dateFilter(date, 'd'); }
      },
      {
        key: 'EEEE',
        regex: $locale.DATETIME_FORMATS.DAY.join('|'),
        formatter: function(date) { return dateFilter(date, 'EEEE'); }
      },
      {
        key: 'EEE',
        regex: $locale.DATETIME_FORMATS.SHORTDAY.join('|'),
        formatter: function(date) { return dateFilter(date, 'EEE'); }
      },
      {
        key: 'HH',
        regex: '(?:0|1)[0-9]|2[0-3]',
        apply: function(value) { this.hours = +value; },
        formatter: function(date) { return dateFilter(date, 'HH'); }
      },
      {
        key: 'hh',
        regex: '0[0-9]|1[0-2]',
        apply: function(value) { this.hours = +value; },
        formatter: function(date) { return dateFilter(date, 'hh'); }
      },
      {
        key: 'H',
        regex: '1?[0-9]|2[0-3]',
        apply: function(value) { this.hours = +value; },
        formatter: function(date) { return dateFilter(date, 'H'); }
      },
      {
        key: 'h',
        regex: '[0-9]|1[0-2]',
        apply: function(value) { this.hours = +value; },
        formatter: function(date) { return dateFilter(date, 'h'); }
      },
      {
        key: 'mm',
        regex: '[0-5][0-9]',
        apply: function(value) { this.minutes = +value; },
        formatter: function(date) { return dateFilter(date, 'mm'); }
      },
      {
        key: 'm',
        regex: '[0-9]|[1-5][0-9]',
        apply: function(value) { this.minutes = +value; },
        formatter: function(date) { return dateFilter(date, 'm'); }
      },
      {
        key: 'sss',
        regex: '[0-9][0-9][0-9]',
        apply: function(value) { this.milliseconds = +value; },
        formatter: function(date) { return dateFilter(date, 'sss'); }
      },
      {
        key: 'ss',
        regex: '[0-5][0-9]',
        apply: function(value) { this.seconds = +value; },
        formatter: function(date) { return dateFilter(date, 'ss'); }
      },
      {
        key: 's',
        regex: '[0-9]|[1-5][0-9]',
        apply: function(value) { this.seconds = +value; },
        formatter: function(date) { return dateFilter(date, 's'); }
      },
      {
        key: 'a',
        regex: $locale.DATETIME_FORMATS.AMPMS.join('|'),
        apply: function(value) {
          if (this.hours === 12) {
            this.hours = 0;
          }

          if (value === 'PM') {
            this.hours += 12;
          }
        },
        formatter: function(date) { return dateFilter(date, 'a'); }
      },
      {
        key: 'Z',
        regex: '[+-]\\d{4}',
        apply: function(value) {
          var matches = value.match(/([+-])(\d{2})(\d{2})/),
            sign = matches[1],
            hours = matches[2],
            minutes = matches[3];
          this.hours += toInt(sign + hours);
          this.minutes += toInt(sign + minutes);
        },
        formatter: function(date) {
          return dateFilter(date, 'Z');
        }
      },
      {
        key: 'ww',
        regex: '[0-4][0-9]|5[0-3]',
        formatter: function(date) { return dateFilter(date, 'ww'); }
      },
      {
        key: 'w',
        regex: '[0-9]|[1-4][0-9]|5[0-3]',
        formatter: function(date) { return dateFilter(date, 'w'); }
      },
      {
        key: 'GGGG',
        regex: $locale.DATETIME_FORMATS.ERANAMES.join('|').replace(/\s/g, '\\s'),
        formatter: function(date) { return dateFilter(date, 'GGGG'); }
      },
      {
        key: 'GGG',
        regex: $locale.DATETIME_FORMATS.ERAS.join('|'),
        formatter: function(date) { return dateFilter(date, 'GGG'); }
      },
      {
        key: 'GG',
        regex: $locale.DATETIME_FORMATS.ERAS.join('|'),
        formatter: function(date) { return dateFilter(date, 'GG'); }
      },
      {
        key: 'G',
        regex: $locale.DATETIME_FORMATS.ERAS.join('|'),
        formatter: function(date) { return dateFilter(date, 'G'); }
      }
    ];
  };

  this.init();

  function createParser(format) {
    var map = [], regex = format.split('');

    // check for literal values
    var quoteIndex = format.indexOf('\'');
    if (quoteIndex > -1) {
      var inLiteral = false;
      format = format.split('');
      for (var i = quoteIndex; i < format.length; i++) {
        if (inLiteral) {
          if (format[i] === '\'') {
            if (i + 1 < format.length && format[i+1] === '\'') { // escaped single quote
              format[i+1] = '$';
              regex[i+1] = '';
            } else { // end of literal
              regex[i] = '';
              inLiteral = false;
            }
          }
          format[i] = '$';
        } else {
          if (format[i] === '\'') { // start of literal
            format[i] = '$';
            regex[i] = '';
            inLiteral = true;
          }
        }
      }

      format = format.join('');
    }

    angular.forEach(formatCodeToRegex, function(data) {
      var index = format.indexOf(data.key);

      if (index > -1) {
        format = format.split('');

        regex[index] = '(' + data.regex + ')';
        format[index] = '$'; // Custom symbol to define consumed part of format
        for (var i = index + 1, n = index + data.key.length; i < n; i++) {
          regex[i] = '';
          format[i] = '$';
        }
        format = format.join('');

        map.push({
          index: index,
          key: data.key,
          apply: data.apply,
          matcher: data.regex
        });
      }
    });

    return {
      regex: new RegExp('^' + regex.join('') + '$'),
      map: orderByFilter(map, 'index')
    };
  }

  function createFormatter(format) {
    var formatters = [];
    var i = 0;
    var formatter, literalIdx;
    while (i < format.length) {
      if (angular.isNumber(literalIdx)) {
        if (format.charAt(i) === '\'') {
          if (i + 1 >= format.length || format.charAt(i + 1) !== '\'') {
            formatters.push(constructLiteralFormatter(format, literalIdx, i));
            literalIdx = null;
          }
        } else if (i === format.length) {
          while (literalIdx < format.length) {
            formatter = constructFormatterFromIdx(format, literalIdx);
            formatters.push(formatter);
            literalIdx = formatter.endIdx;
          }
        }

        i++;
        continue;
      }

      if (format.charAt(i) === '\'') {
        literalIdx = i;
        i++;
        continue;
      }

      formatter = constructFormatterFromIdx(format, i);

      formatters.push(formatter.parser);
      i = formatter.endIdx;
    }

    return formatters;
  }

  function constructLiteralFormatter(format, literalIdx, endIdx) {
    return function() {
      return format.substr(literalIdx + 1, endIdx - literalIdx - 1);
    };
  }

  function constructFormatterFromIdx(format, i) {
    var currentPosStr = format.substr(i);
    for (var j = 0; j < formatCodeToRegex.length; j++) {
      if (new RegExp('^' + formatCodeToRegex[j].key).test(currentPosStr)) {
        var data = formatCodeToRegex[j];
        return {
          endIdx: i + data.key.length,
          parser: data.formatter
        };
      }
    }

    return {
      endIdx: i + 1,
      parser: function() {
        return currentPosStr.charAt(0);
      }
    };
  }

  this.filter = function(date, format) {
    if (!angular.isDate(date) || isNaN(date) || !format) {
      return '';
    }

    format = $locale.DATETIME_FORMATS[format] || format;

    if ($locale.id !== localeId) {
      this.init();
    }

    if (!this.formatters[format]) {
      this.formatters[format] = createFormatter(format);
    }

    var formatters = this.formatters[format];

    return formatters.reduce(function(str, formatter) {
      return str + formatter(date);
    }, '');
  };

  this.parse = function(input, format, baseDate) {
    if (!angular.isString(input) || !format) {
      return input;
    }

    format = $locale.DATETIME_FORMATS[format] || format;
    format = format.replace(SPECIAL_CHARACTERS_REGEXP, '\\$&');

    if ($locale.id !== localeId) {
      this.init();
    }

    if (!this.parsers[format]) {
      this.parsers[format] = createParser(format, 'apply');
    }

    var parser = this.parsers[format],
        regex = parser.regex,
        map = parser.map,
        results = input.match(regex),
        tzOffset = false;
    if (results && results.length) {
      var fields, dt;
      if (angular.isDate(baseDate) && !isNaN(baseDate.getTime())) {
        fields = {
          year: baseDate.getFullYear(),
          month: baseDate.getMonth(),
          date: baseDate.getDate(),
          hours: baseDate.getHours(),
          minutes: baseDate.getMinutes(),
          seconds: baseDate.getSeconds(),
          milliseconds: baseDate.getMilliseconds()
        };
      } else {
        if (baseDate) {
          $log.warn('dateparser:', 'baseDate is not a valid date');
        }
        fields = { year: 1900, month: 0, date: 1, hours: 0, minutes: 0, seconds: 0, milliseconds: 0 };
      }

      for (var i = 1, n = results.length; i < n; i++) {
        var mapper = map[i - 1];
        if (mapper.matcher === 'Z') {
          tzOffset = true;
        }

        if (mapper.apply) {
          mapper.apply.call(fields, results[i]);
        }
      }

      var datesetter = tzOffset ? Date.prototype.setUTCFullYear :
        Date.prototype.setFullYear;
      var timesetter = tzOffset ? Date.prototype.setUTCHours :
        Date.prototype.setHours;

      if (isValid(fields.year, fields.month, fields.date)) {
        if (angular.isDate(baseDate) && !isNaN(baseDate.getTime()) && !tzOffset) {
          dt = new Date(baseDate);
          datesetter.call(dt, fields.year, fields.month, fields.date);
          timesetter.call(dt, fields.hours, fields.minutes,
            fields.seconds, fields.milliseconds);
        } else {
          dt = new Date(0);
          datesetter.call(dt, fields.year, fields.month, fields.date);
          timesetter.call(dt, fields.hours || 0, fields.minutes || 0,
            fields.seconds || 0, fields.milliseconds || 0);
        }
      }

      return dt;
    }
  };

  // Check if date is valid for specific month (and year for February).
  // Month: 0 = Jan, 1 = Feb, etc
  function isValid(year, month, date) {
    if (date < 1) {
      return false;
    }

    if (month === 1 && date > 28) {
      return date === 29 && (year % 4 === 0 && year % 100 !== 0 || year % 400 === 0);
    }

    if (month === 3 || month === 5 || month === 8 || month === 10) {
      return date < 31;
    }

    return true;
  }

  function toInt(str) {
    return parseInt(str, 10);
  }

  this.toTimezone = toTimezone;
  this.fromTimezone = fromTimezone;
  this.timezoneToOffset = timezoneToOffset;
  this.addDateMinutes = addDateMinutes;
  this.convertTimezoneToLocal = convertTimezoneToLocal;

  function toTimezone(date, timezone) {
    return date && timezone ? convertTimezoneToLocal(date, timezone) : date;
  }

  function fromTimezone(date, timezone) {
    return date && timezone ? convertTimezoneToLocal(date, timezone, true) : date;
  }

  //https://github.com/angular/angular.js/blob/622c42169699ec07fc6daaa19fe6d224e5d2f70e/src/Angular.js#L1207
  function timezoneToOffset(timezone, fallback) {
    timezone = timezone.replace(/:/g, '');
    var requestedTimezoneOffset = Date.parse('Jan 01, 1970 00:00:00 ' + timezone) / 60000;
    return isNaN(requestedTimezoneOffset) ? fallback : requestedTimezoneOffset;
  }

  function addDateMinutes(date, minutes) {
    date = new Date(date.getTime());
    date.setMinutes(date.getMinutes() + minutes);
    return date;
  }

  function convertTimezoneToLocal(date, timezone, reverse) {
    reverse = reverse ? -1 : 1;
    var dateTimezoneOffset = date.getTimezoneOffset();
    var timezoneOffset = timezoneToOffset(timezone, dateTimezoneOffset);
    return addDateMinutes(date, reverse * (timezoneOffset - dateTimezoneOffset));
  }
}]);

// Avoiding use of ng-class as it creates a lot of watchers when a class is to be applied to
// at most one element.
angular.module('ui.bootstrap.isClass', [])
.directive('uibIsClass', [
         '$animate',
function ($animate) {
  //                    11111111          22222222
  var ON_REGEXP = /^\s*([\s\S]+?)\s+on\s+([\s\S]+?)\s*$/;
  //                    11111111           22222222
  var IS_REGEXP = /^\s*([\s\S]+?)\s+for\s+([\s\S]+?)\s*$/;

  var dataPerTracked = {};

  return {
    restrict: 'A',
    compile: function(tElement, tAttrs) {
      var linkedScopes = [];
      var instances = [];
      var expToData = {};
      var lastActivated = null;
      var onExpMatches = tAttrs.uibIsClass.match(ON_REGEXP);
      var onExp = onExpMatches[2];
      var expsStr = onExpMatches[1];
      var exps = expsStr.split(',');

      return linkFn;

      function linkFn(scope, element, attrs) {
        linkedScopes.push(scope);
        instances.push({
          scope: scope,
          element: element
        });

        exps.forEach(function(exp, k) {
          addForExp(exp, scope);
        });

        scope.$on('$destroy', removeScope);
      }

      function addForExp(exp, scope) {
        var matches = exp.match(IS_REGEXP);
        var clazz = scope.$eval(matches[1]);
        var compareWithExp = matches[2];
        var data = expToData[exp];
        if (!data) {
          var watchFn = function(compareWithVal) {
            var newActivated = null;
            instances.some(function(instance) {
              var thisVal = instance.scope.$eval(onExp);
              if (thisVal === compareWithVal) {
                newActivated = instance;
                return true;
              }
            });
            if (data.lastActivated !== newActivated) {
              if (data.lastActivated) {
                $animate.removeClass(data.lastActivated.element, clazz);
              }
              if (newActivated) {
                $animate.addClass(newActivated.element, clazz);
              }
              data.lastActivated = newActivated;
            }
          };
          expToData[exp] = data = {
            lastActivated: null,
            scope: scope,
            watchFn: watchFn,
            compareWithExp: compareWithExp,
            watcher: scope.$watch(compareWithExp, watchFn)
          };
        }
        data.watchFn(scope.$eval(compareWithExp));
      }

      function removeScope(e) {
        var removedScope = e.targetScope;
        var index = linkedScopes.indexOf(removedScope);
        linkedScopes.splice(index, 1);
        instances.splice(index, 1);
        if (linkedScopes.length) {
          var newWatchScope = linkedScopes[0];
          angular.forEach(expToData, function(data) {
            if (data.scope === removedScope) {
              data.watcher = newWatchScope.$watch(data.compareWithExp, data.watchFn);
              data.scope = newWatchScope;
            }
          });
        } else {
          expToData = {};
        }
      }
    }
  };
}]);
angular.module('ui.bootstrap.datepicker', ['ui.bootstrap.dateparser', 'ui.bootstrap.isClass'])

.value('$datepickerSuppressError', false)

.value('$datepickerLiteralWarning', true)

.constant('uibDatepickerConfig', {
  datepickerMode: 'day',
  formatDay: 'dd',
  formatMonth: 'MMMM',
  formatYear: 'yyyy',
  formatDayHeader: 'EEE',
  formatDayTitle: 'MMMM yyyy',
  formatMonthTitle: 'yyyy',
  maxDate: null,
  maxMode: 'year',
  minDate: null,
  minMode: 'day',
  monthColumns: 3,
  ngModelOptions: {},
  shortcutPropagation: false,
  showWeeks: true,
  yearColumns: 5,
  yearRows: 4
})

.controller('UibDatepickerController', ['$scope', '$element', '$attrs', '$parse', '$interpolate', '$locale', '$log', 'dateFilter', 'uibDatepickerConfig', '$datepickerLiteralWarning', '$datepickerSuppressError', 'uibDateParser',
  function($scope, $element, $attrs, $parse, $interpolate, $locale, $log, dateFilter, datepickerConfig, $datepickerLiteralWarning, $datepickerSuppressError, dateParser) {
  var self = this,
      ngModelCtrl = { $setViewValue: angular.noop }, // nullModelCtrl;
      ngModelOptions = {},
      watchListeners = [];

  $element.addClass('uib-datepicker');
  $attrs.$set('role', 'application');

  if (!$scope.datepickerOptions) {
    $scope.datepickerOptions = {};
  }

  // Modes chain
  this.modes = ['day', 'month', 'year'];

  [
    'customClass',
    'dateDisabled',
    'datepickerMode',
    'formatDay',
    'formatDayHeader',
    'formatDayTitle',
    'formatMonth',
    'formatMonthTitle',
    'formatYear',
    'maxDate',
    'maxMode',
    'minDate',
    'minMode',
    'monthColumns',
    'showWeeks',
    'shortcutPropagation',
    'startingDay',
    'yearColumns',
    'yearRows'
  ].forEach(function(key) {
    switch (key) {
      case 'customClass':
      case 'dateDisabled':
        $scope[key] = $scope.datepickerOptions[key] || angular.noop;
        break;
      case 'datepickerMode':
        $scope.datepickerMode = angular.isDefined($scope.datepickerOptions.datepickerMode) ?
          $scope.datepickerOptions.datepickerMode : datepickerConfig.datepickerMode;
        break;
      case 'formatDay':
      case 'formatDayHeader':
      case 'formatDayTitle':
      case 'formatMonth':
      case 'formatMonthTitle':
      case 'formatYear':
        self[key] = angular.isDefined($scope.datepickerOptions[key]) ?
          $interpolate($scope.datepickerOptions[key])($scope.$parent) :
          datepickerConfig[key];
        break;
      case 'monthColumns':
      case 'showWeeks':
      case 'shortcutPropagation':
      case 'yearColumns':
      case 'yearRows':
        self[key] = angular.isDefined($scope.datepickerOptions[key]) ?
          $scope.datepickerOptions[key] : datepickerConfig[key];
        break;
      case 'startingDay':
        if (angular.isDefined($scope.datepickerOptions.startingDay)) {
          self.startingDay = $scope.datepickerOptions.startingDay;
        } else if (angular.isNumber(datepickerConfig.startingDay)) {
          self.startingDay = datepickerConfig.startingDay;
        } else {
          self.startingDay = ($locale.DATETIME_FORMATS.FIRSTDAYOFWEEK + 8) % 7;
        }

        break;
      case 'maxDate':
      case 'minDate':
        $scope.$watch('datepickerOptions.' + key, function(value) {
          if (value) {
            if (angular.isDate(value)) {
              self[key] = dateParser.fromTimezone(new Date(value), ngModelOptions.timezone);
            } else {
              if ($datepickerLiteralWarning) {
                $log.warn('Literal date support has been deprecated, please switch to date object usage');
              }

              self[key] = new Date(dateFilter(value, 'medium'));
            }
          } else {
            self[key] = datepickerConfig[key] ?
              dateParser.fromTimezone(new Date(datepickerConfig[key]), ngModelOptions.timezone) :
              null;
          }

          self.refreshView();
        });

        break;
      case 'maxMode':
      case 'minMode':
        if ($scope.datepickerOptions[key]) {
          $scope.$watch(function() { return $scope.datepickerOptions[key]; }, function(value) {
            self[key] = $scope[key] = angular.isDefined(value) ? value : $scope.datepickerOptions[key];
            if (key === 'minMode' && self.modes.indexOf($scope.datepickerOptions.datepickerMode) < self.modes.indexOf(self[key]) ||
              key === 'maxMode' && self.modes.indexOf($scope.datepickerOptions.datepickerMode) > self.modes.indexOf(self[key])) {
              $scope.datepickerMode = self[key];
              $scope.datepickerOptions.datepickerMode = self[key];
            }
          });
        } else {
          self[key] = $scope[key] = datepickerConfig[key] || null;
        }

        break;
    }
  });

  $scope.uniqueId = 'datepicker-' + $scope.$id + '-' + Math.floor(Math.random() * 10000);

  $scope.disabled = angular.isDefined($attrs.disabled) || false;
  if (angular.isDefined($attrs.ngDisabled)) {
    watchListeners.push($scope.$parent.$watch($attrs.ngDisabled, function(disabled) {
      $scope.disabled = disabled;
      self.refreshView();
    }));
  }

  $scope.isActive = function(dateObject) {
    if (self.compare(dateObject.date, self.activeDate) === 0) {
      $scope.activeDateId = dateObject.uid;
      return true;
    }
    return false;
  };

  this.init = function(ngModelCtrl_) {
    ngModelCtrl = ngModelCtrl_;
    ngModelOptions = ngModelCtrl_.$options ||
      $scope.datepickerOptions.ngModelOptions ||
      datepickerConfig.ngModelOptions;
    if ($scope.datepickerOptions.initDate) {
      self.activeDate = dateParser.fromTimezone($scope.datepickerOptions.initDate, ngModelOptions.timezone) || new Date();
      $scope.$watch('datepickerOptions.initDate', function(initDate) {
        if (initDate && (ngModelCtrl.$isEmpty(ngModelCtrl.$modelValue) || ngModelCtrl.$invalid)) {
          self.activeDate = dateParser.fromTimezone(initDate, ngModelOptions.timezone);
          self.refreshView();
        }
      });
    } else {
      self.activeDate = new Date();
    }

    var date = ngModelCtrl.$modelValue ? new Date(ngModelCtrl.$modelValue) : new Date();
    this.activeDate = !isNaN(date) ?
      dateParser.fromTimezone(date, ngModelOptions.timezone) :
      dateParser.fromTimezone(new Date(), ngModelOptions.timezone);

    ngModelCtrl.$render = function() {
      self.render();
    };
  };

  this.render = function() {
    if (ngModelCtrl.$viewValue) {
      var date = new Date(ngModelCtrl.$viewValue),
          isValid = !isNaN(date);

      if (isValid) {
        this.activeDate = dateParser.fromTimezone(date, ngModelOptions.timezone);
      } else if (!$datepickerSuppressError) {
        $log.error('Datepicker directive: "ng-model" value must be a Date object');
      }
    }
    this.refreshView();
  };

  this.refreshView = function() {
    if (this.element) {
      $scope.selectedDt = null;
      this._refreshView();
      if ($scope.activeDt) {
        $scope.activeDateId = $scope.activeDt.uid;
      }

      var date = ngModelCtrl.$viewValue ? new Date(ngModelCtrl.$viewValue) : null;
      date = dateParser.fromTimezone(date, ngModelOptions.timezone);
      ngModelCtrl.$setValidity('dateDisabled', !date ||
        this.element && !this.isDisabled(date));
    }
  };

  this.createDateObject = function(date, format) {
    var model = ngModelCtrl.$viewValue ? new Date(ngModelCtrl.$viewValue) : null;
    model = dateParser.fromTimezone(model, ngModelOptions.timezone);
    var today = new Date();
    today = dateParser.fromTimezone(today, ngModelOptions.timezone);
    var time = this.compare(date, today);
    var dt = {
      date: date,
      label: dateParser.filter(date, format),
      selected: model && this.compare(date, model) === 0,
      disabled: this.isDisabled(date),
      past: time < 0,
      current: time === 0,
      future: time > 0,
      customClass: this.customClass(date) || null
    };

    if (model && this.compare(date, model) === 0) {
      $scope.selectedDt = dt;
    }

    if (self.activeDate && this.compare(dt.date, self.activeDate) === 0) {
      $scope.activeDt = dt;
    }

    return dt;
  };

  this.isDisabled = function(date) {
    return $scope.disabled ||
      this.minDate && this.compare(date, this.minDate) < 0 ||
      this.maxDate && this.compare(date, this.maxDate) > 0 ||
      $scope.dateDisabled && $scope.dateDisabled({date: date, mode: $scope.datepickerMode});
  };

  this.customClass = function(date) {
    return $scope.customClass({date: date, mode: $scope.datepickerMode});
  };

  // Split array into smaller arrays
  this.split = function(arr, size) {
    var arrays = [];
    while (arr.length > 0) {
      arrays.push(arr.splice(0, size));
    }
    return arrays;
  };

  $scope.select = function(date) {
    if ($scope.datepickerMode === self.minMode) {
      var dt = ngModelCtrl.$viewValue ? dateParser.fromTimezone(new Date(ngModelCtrl.$viewValue), ngModelOptions.timezone) : new Date(0, 0, 0, 0, 0, 0, 0);
      dt.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
      dt = dateParser.toTimezone(dt, ngModelOptions.timezone);
      ngModelCtrl.$setViewValue(dt);
      ngModelCtrl.$render();
    } else {
      self.activeDate = date;
      setMode(self.modes[self.modes.indexOf($scope.datepickerMode) - 1]);

      $scope.$emit('uib:datepicker.mode');
    }

    $scope.$broadcast('uib:datepicker.focus');
  };

  $scope.move = function(direction) {
    var year = self.activeDate.getFullYear() + direction * (self.step.years || 0),
        month = self.activeDate.getMonth() + direction * (self.step.months || 0);
    self.activeDate.setFullYear(year, month, 1);
    self.refreshView();
  };

  $scope.toggleMode = function(direction) {
    direction = direction || 1;

    if ($scope.datepickerMode === self.maxMode && direction === 1 ||
      $scope.datepickerMode === self.minMode && direction === -1) {
      return;
    }

    setMode(self.modes[self.modes.indexOf($scope.datepickerMode) + direction]);

    $scope.$emit('uib:datepicker.mode');
  };

  // Key event mapper
  $scope.keys = { 13: 'enter', 32: 'space', 33: 'pageup', 34: 'pagedown', 35: 'end', 36: 'home', 37: 'left', 38: 'up', 39: 'right', 40: 'down' };

  var focusElement = function() {
    self.element[0].focus();
  };

  // Listen for focus requests from popup directive
  $scope.$on('uib:datepicker.focus', focusElement);

  $scope.keydown = function(evt) {
    var key = $scope.keys[evt.which];

    if (!key || evt.shiftKey || evt.altKey || $scope.disabled) {
      return;
    }

    evt.preventDefault();
    if (!self.shortcutPropagation) {
      evt.stopPropagation();
    }

    if (key === 'enter' || key === 'space') {
      if (self.isDisabled(self.activeDate)) {
        return; // do nothing
      }
      $scope.select(self.activeDate);
    } else if (evt.ctrlKey && (key === 'up' || key === 'down')) {
      $scope.toggleMode(key === 'up' ? 1 : -1);
    } else {
      self.handleKeyDown(key, evt);
      self.refreshView();
    }
  };

  $element.on('keydown', function(evt) {
    $scope.$apply(function() {
      $scope.keydown(evt);
    });
  });

  $scope.$on('$destroy', function() {
    //Clear all watch listeners on destroy
    while (watchListeners.length) {
      watchListeners.shift()();
    }
  });

  function setMode(mode) {
    $scope.datepickerMode = mode;
    $scope.datepickerOptions.datepickerMode = mode;
  }
}])

.controller('UibDaypickerController', ['$scope', '$element', 'dateFilter', function(scope, $element, dateFilter) {
  var DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  this.step = { months: 1 };
  this.element = $element;
  function getDaysInMonth(year, month) {
    return month === 1 && year % 4 === 0 &&
      (year % 100 !== 0 || year % 400 === 0) ? 29 : DAYS_IN_MONTH[month];
  }

  this.init = function(ctrl) {
    angular.extend(ctrl, this);
    scope.showWeeks = ctrl.showWeeks;
    ctrl.refreshView();
  };

  this.getDates = function(startDate, n) {
    var dates = new Array(n), current = new Date(startDate), i = 0, date;
    while (i < n) {
      date = new Date(current);
      dates[i++] = date;
      current.setDate(current.getDate() + 1);
    }
    return dates;
  };

  this._refreshView = function() {
    var year = this.activeDate.getFullYear(),
      month = this.activeDate.getMonth(),
      firstDayOfMonth = new Date(this.activeDate);

    firstDayOfMonth.setFullYear(year, month, 1);

    var difference = this.startingDay - firstDayOfMonth.getDay(),
      numDisplayedFromPreviousMonth = difference > 0 ?
        7 - difference : - difference,
      firstDate = new Date(firstDayOfMonth);

    if (numDisplayedFromPreviousMonth > 0) {
      firstDate.setDate(-numDisplayedFromPreviousMonth + 1);
    }

    // 42 is the number of days on a six-week calendar
    var days = this.getDates(firstDate, 42);
    for (var i = 0; i < 42; i ++) {
      days[i] = angular.extend(this.createDateObject(days[i], this.formatDay), {
        secondary: days[i].getMonth() !== month,
        uid: scope.uniqueId + '-' + i
      });
    }

    scope.labels = new Array(7);
    for (var j = 0; j < 7; j++) {
      scope.labels[j] = {
        abbr: dateFilter(days[j].date, this.formatDayHeader),
        full: dateFilter(days[j].date, 'EEEE')
      };
    }

    scope.title = dateFilter(this.activeDate, this.formatDayTitle);
    scope.rows = this.split(days, 7);

    if (scope.showWeeks) {
      scope.weekNumbers = [];
      var thursdayIndex = (4 + 7 - this.startingDay) % 7,
          numWeeks = scope.rows.length;
      for (var curWeek = 0; curWeek < numWeeks; curWeek++) {
        scope.weekNumbers.push(
          getISO8601WeekNumber(scope.rows[curWeek][thursdayIndex].date));
      }
    }
  };

  this.compare = function(date1, date2) {
    var _date1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
    var _date2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
    _date1.setFullYear(date1.getFullYear());
    _date2.setFullYear(date2.getFullYear());
    return _date1 - _date2;
  };

  function getISO8601WeekNumber(date) {
    var checkDate = new Date(date);
    checkDate.setDate(checkDate.getDate() + 4 - (checkDate.getDay() || 7)); // Thursday
    var time = checkDate.getTime();
    checkDate.setMonth(0); // Compare with Jan 1
    checkDate.setDate(1);
    return Math.floor(Math.round((time - checkDate) / 86400000) / 7) + 1;
  }

  this.handleKeyDown = function(key, evt) {
    var date = this.activeDate.getDate();

    if (key === 'left') {
      date = date - 1;
    } else if (key === 'up') {
      date = date - 7;
    } else if (key === 'right') {
      date = date + 1;
    } else if (key === 'down') {
      date = date + 7;
    } else if (key === 'pageup' || key === 'pagedown') {
      var month = this.activeDate.getMonth() + (key === 'pageup' ? - 1 : 1);
      this.activeDate.setMonth(month, 1);
      date = Math.min(getDaysInMonth(this.activeDate.getFullYear(), this.activeDate.getMonth()), date);
    } else if (key === 'home') {
      date = 1;
    } else if (key === 'end') {
      date = getDaysInMonth(this.activeDate.getFullYear(), this.activeDate.getMonth());
    }
    this.activeDate.setDate(date);
  };
}])

.controller('UibMonthpickerController', ['$scope', '$element', 'dateFilter', function(scope, $element, dateFilter) {
  this.step = { years: 1 };
  this.element = $element;

  this.init = function(ctrl) {
    angular.extend(ctrl, this);
    ctrl.refreshView();
  };

  this._refreshView = function() {
    var months = new Array(12),
        year = this.activeDate.getFullYear(),
        date;

    for (var i = 0; i < 12; i++) {
      date = new Date(this.activeDate);
      date.setFullYear(year, i, 1);
      months[i] = angular.extend(this.createDateObject(date, this.formatMonth), {
        uid: scope.uniqueId + '-' + i
      });
    }

    scope.title = dateFilter(this.activeDate, this.formatMonthTitle);
    scope.rows = this.split(months, this.monthColumns);
    scope.yearHeaderColspan = this.monthColumns > 3 ? this.monthColumns - 2 : 1;
  };

  this.compare = function(date1, date2) {
    var _date1 = new Date(date1.getFullYear(), date1.getMonth());
    var _date2 = new Date(date2.getFullYear(), date2.getMonth());
    _date1.setFullYear(date1.getFullYear());
    _date2.setFullYear(date2.getFullYear());
    return _date1 - _date2;
  };

  this.handleKeyDown = function(key, evt) {
    var date = this.activeDate.getMonth();

    if (key === 'left') {
      date = date - 1;
    } else if (key === 'up') {
      date = date - this.monthColumns;
    } else if (key === 'right') {
      date = date + 1;
    } else if (key === 'down') {
      date = date + this.monthColumns;
    } else if (key === 'pageup' || key === 'pagedown') {
      var year = this.activeDate.getFullYear() + (key === 'pageup' ? - 1 : 1);
      this.activeDate.setFullYear(year);
    } else if (key === 'home') {
      date = 0;
    } else if (key === 'end') {
      date = 11;
    }
    this.activeDate.setMonth(date);
  };
}])

.controller('UibYearpickerController', ['$scope', '$element', 'dateFilter', function(scope, $element, dateFilter) {
  var columns, range;
  this.element = $element;

  function getStartingYear(year) {
    return parseInt((year - 1) / range, 10) * range + 1;
  }

  this.yearpickerInit = function() {
    columns = this.yearColumns;
    range = this.yearRows * columns;
    this.step = { years: range };
  };

  this._refreshView = function() {
    var years = new Array(range), date;

    for (var i = 0, start = getStartingYear(this.activeDate.getFullYear()); i < range; i++) {
      date = new Date(this.activeDate);
      date.setFullYear(start + i, 0, 1);
      years[i] = angular.extend(this.createDateObject(date, this.formatYear), {
        uid: scope.uniqueId + '-' + i
      });
    }

    scope.title = [years[0].label, years[range - 1].label].join(' - ');
    scope.rows = this.split(years, columns);
    scope.columns = columns;
  };

  this.compare = function(date1, date2) {
    return date1.getFullYear() - date2.getFullYear();
  };

  this.handleKeyDown = function(key, evt) {
    var date = this.activeDate.getFullYear();

    if (key === 'left') {
      date = date - 1;
    } else if (key === 'up') {
      date = date - columns;
    } else if (key === 'right') {
      date = date + 1;
    } else if (key === 'down') {
      date = date + columns;
    } else if (key === 'pageup' || key === 'pagedown') {
      date += (key === 'pageup' ? - 1 : 1) * range;
    } else if (key === 'home') {
      date = getStartingYear(this.activeDate.getFullYear());
    } else if (key === 'end') {
      date = getStartingYear(this.activeDate.getFullYear()) + range - 1;
    }
    this.activeDate.setFullYear(date);
  };
}])

.directive('uibDatepicker', function() {
  return {
    templateUrl: function(element, attrs) {
      return attrs.templateUrl || 'uib/template/datepicker/datepicker.html';
    },
    scope: {
      datepickerOptions: '=?'
    },
    require: ['uibDatepicker', '^ngModel'],
    restrict: 'A',
    controller: 'UibDatepickerController',
    controllerAs: 'datepicker',
    link: function(scope, element, attrs, ctrls) {
      var datepickerCtrl = ctrls[0], ngModelCtrl = ctrls[1];

      datepickerCtrl.init(ngModelCtrl);
    }
  };
})

.directive('uibDaypicker', function() {
  return {
    templateUrl: function(element, attrs) {
      return attrs.templateUrl || 'uib/template/datepicker/day.html';
    },
    require: ['^uibDatepicker', 'uibDaypicker'],
    restrict: 'A',
    controller: 'UibDaypickerController',
    link: function(scope, element, attrs, ctrls) {
      var datepickerCtrl = ctrls[0],
        daypickerCtrl = ctrls[1];

      daypickerCtrl.init(datepickerCtrl);
    }
  };
})

.directive('uibMonthpicker', function() {
  return {
    templateUrl: function(element, attrs) {
      return attrs.templateUrl || 'uib/template/datepicker/month.html';
    },
    require: ['^uibDatepicker', 'uibMonthpicker'],
    restrict: 'A',
    controller: 'UibMonthpickerController',
    link: function(scope, element, attrs, ctrls) {
      var datepickerCtrl = ctrls[0],
        monthpickerCtrl = ctrls[1];

      monthpickerCtrl.init(datepickerCtrl);
    }
  };
})

.directive('uibYearpicker', function() {
  return {
    templateUrl: function(element, attrs) {
      return attrs.templateUrl || 'uib/template/datepicker/year.html';
    },
    require: ['^uibDatepicker', 'uibYearpicker'],
    restrict: 'A',
    controller: 'UibYearpickerController',
    link: function(scope, element, attrs, ctrls) {
      var ctrl = ctrls[0];
      angular.extend(ctrl, ctrls[1]);
      ctrl.yearpickerInit();

      ctrl.refreshView();
    }
  };
});

angular.module('ui.bootstrap.position', [])

/**
 * A set of utility methods for working with the DOM.
 * It is meant to be used where we need to absolute-position elements in
 * relation to another element (this is the case for tooltips, popovers,
 * typeahead suggestions etc.).
 */
  .factory('$uibPosition', ['$document', '$window', function($document, $window) {
    /**
     * Used by scrollbarWidth() function to cache scrollbar's width.
     * Do not access this variable directly, use scrollbarWidth() instead.
     */
    var SCROLLBAR_WIDTH;
    /**
     * scrollbar on body and html element in IE and Edge overlay
     * content and should be considered 0 width.
     */
    var BODY_SCROLLBAR_WIDTH;
    var OVERFLOW_REGEX = {
      normal: /(auto|scroll)/,
      hidden: /(auto|scroll|hidden)/
    };
    var PLACEMENT_REGEX = {
      auto: /\s?auto?\s?/i,
      primary: /^(top|bottom|left|right)$/,
      secondary: /^(top|bottom|left|right|center)$/,
      vertical: /^(top|bottom)$/
    };
    var BODY_REGEX = /(HTML|BODY)/;

    return {

      /**
       * Provides a raw DOM element from a jQuery/jQLite element.
       *
       * @param {element} elem - The element to convert.
       *
       * @returns {element} A HTML element.
       */
      getRawNode: function(elem) {
        return elem.nodeName ? elem : elem[0] || elem;
      },

      /**
       * Provides a parsed number for a style property.  Strips
       * units and casts invalid numbers to 0.
       *
       * @param {string} value - The style value to parse.
       *
       * @returns {number} A valid number.
       */
      parseStyle: function(value) {
        value = parseFloat(value);
        return isFinite(value) ? value : 0;
      },

      /**
       * Provides the closest positioned ancestor.
       *
       * @param {element} element - The element to get the offest parent for.
       *
       * @returns {element} The closest positioned ancestor.
       */
      offsetParent: function(elem) {
        elem = this.getRawNode(elem);

        var offsetParent = elem.offsetParent || $document[0].documentElement;

        function isStaticPositioned(el) {
          return ($window.getComputedStyle(el).position || 'static') === 'static';
        }

        while (offsetParent && offsetParent !== $document[0].documentElement && isStaticPositioned(offsetParent)) {
          offsetParent = offsetParent.offsetParent;
        }

        return offsetParent || $document[0].documentElement;
      },

      /**
       * Provides the scrollbar width, concept from TWBS measureScrollbar()
       * function in https://github.com/twbs/bootstrap/blob/master/js/modal.js
       * In IE and Edge, scollbar on body and html element overlay and should
       * return a width of 0.
       *
       * @returns {number} The width of the browser scollbar.
       */
      scrollbarWidth: function(isBody) {
        if (isBody) {
          if (angular.isUndefined(BODY_SCROLLBAR_WIDTH)) {
            var bodyElem = $document.find('body');
            bodyElem.addClass('uib-position-body-scrollbar-measure');
            BODY_SCROLLBAR_WIDTH = $window.innerWidth - bodyElem[0].clientWidth;
            BODY_SCROLLBAR_WIDTH = isFinite(BODY_SCROLLBAR_WIDTH) ? BODY_SCROLLBAR_WIDTH : 0;
            bodyElem.removeClass('uib-position-body-scrollbar-measure');
          }
          return BODY_SCROLLBAR_WIDTH;
        }

        if (angular.isUndefined(SCROLLBAR_WIDTH)) {
          var scrollElem = angular.element('<div class="uib-position-scrollbar-measure"></div>');
          $document.find('body').append(scrollElem);
          SCROLLBAR_WIDTH = scrollElem[0].offsetWidth - scrollElem[0].clientWidth;
          SCROLLBAR_WIDTH = isFinite(SCROLLBAR_WIDTH) ? SCROLLBAR_WIDTH : 0;
          scrollElem.remove();
        }

        return SCROLLBAR_WIDTH;
      },

      /**
       * Provides the padding required on an element to replace the scrollbar.
       *
       * @returns {object} An object with the following properties:
       *   <ul>
       *     <li>**scrollbarWidth**: the width of the scrollbar</li>
       *     <li>**widthOverflow**: whether the the width is overflowing</li>
       *     <li>**right**: the amount of right padding on the element needed to replace the scrollbar</li>
       *     <li>**rightOriginal**: the amount of right padding currently on the element</li>
       *     <li>**heightOverflow**: whether the the height is overflowing</li>
       *     <li>**bottom**: the amount of bottom padding on the element needed to replace the scrollbar</li>
       *     <li>**bottomOriginal**: the amount of bottom padding currently on the element</li>
       *   </ul>
       */
      scrollbarPadding: function(elem) {
        elem = this.getRawNode(elem);

        var elemStyle = $window.getComputedStyle(elem);
        var paddingRight = this.parseStyle(elemStyle.paddingRight);
        var paddingBottom = this.parseStyle(elemStyle.paddingBottom);
        var scrollParent = this.scrollParent(elem, false, true);
        var scrollbarWidth = this.scrollbarWidth(scrollParent, BODY_REGEX.test(scrollParent.tagName));

        return {
          scrollbarWidth: scrollbarWidth,
          widthOverflow: scrollParent.scrollWidth > scrollParent.clientWidth,
          right: paddingRight + scrollbarWidth,
          originalRight: paddingRight,
          heightOverflow: scrollParent.scrollHeight > scrollParent.clientHeight,
          bottom: paddingBottom + scrollbarWidth,
          originalBottom: paddingBottom
         };
      },

      /**
       * Checks to see if the element is scrollable.
       *
       * @param {element} elem - The element to check.
       * @param {boolean=} [includeHidden=false] - Should scroll style of 'hidden' be considered,
       *   default is false.
       *
       * @returns {boolean} Whether the element is scrollable.
       */
      isScrollable: function(elem, includeHidden) {
        elem = this.getRawNode(elem);

        var overflowRegex = includeHidden ? OVERFLOW_REGEX.hidden : OVERFLOW_REGEX.normal;
        var elemStyle = $window.getComputedStyle(elem);
        return overflowRegex.test(elemStyle.overflow + elemStyle.overflowY + elemStyle.overflowX);
      },

      /**
       * Provides the closest scrollable ancestor.
       * A port of the jQuery UI scrollParent method:
       * https://github.com/jquery/jquery-ui/blob/master/ui/scroll-parent.js
       *
       * @param {element} elem - The element to find the scroll parent of.
       * @param {boolean=} [includeHidden=false] - Should scroll style of 'hidden' be considered,
       *   default is false.
       * @param {boolean=} [includeSelf=false] - Should the element being passed be
       * included in the scrollable llokup.
       *
       * @returns {element} A HTML element.
       */
      scrollParent: function(elem, includeHidden, includeSelf) {
        elem = this.getRawNode(elem);

        var overflowRegex = includeHidden ? OVERFLOW_REGEX.hidden : OVERFLOW_REGEX.normal;
        var documentEl = $document[0].documentElement;
        var elemStyle = $window.getComputedStyle(elem);
        if (includeSelf && overflowRegex.test(elemStyle.overflow + elemStyle.overflowY + elemStyle.overflowX)) {
          return elem;
        }
        var excludeStatic = elemStyle.position === 'absolute';
        var scrollParent = elem.parentElement || documentEl;

        if (scrollParent === documentEl || elemStyle.position === 'fixed') {
          return documentEl;
        }

        while (scrollParent.parentElement && scrollParent !== documentEl) {
          var spStyle = $window.getComputedStyle(scrollParent);
          if (excludeStatic && spStyle.position !== 'static') {
            excludeStatic = false;
          }

          if (!excludeStatic && overflowRegex.test(spStyle.overflow + spStyle.overflowY + spStyle.overflowX)) {
            break;
          }
          scrollParent = scrollParent.parentElement;
        }

        return scrollParent;
      },

      /**
       * Provides read-only equivalent of jQuery's position function:
       * http://api.jquery.com/position/ - distance to closest positioned
       * ancestor.  Does not account for margins by default like jQuery position.
       *
       * @param {element} elem - The element to caclulate the position on.
       * @param {boolean=} [includeMargins=false] - Should margins be accounted
       * for, default is false.
       *
       * @returns {object} An object with the following properties:
       *   <ul>
       *     <li>**width**: the width of the element</li>
       *     <li>**height**: the height of the element</li>
       *     <li>**top**: distance to top edge of offset parent</li>
       *     <li>**left**: distance to left edge of offset parent</li>
       *   </ul>
       */
      position: function(elem, includeMagins) {
        elem = this.getRawNode(elem);

        var elemOffset = this.offset(elem);
        if (includeMagins) {
          var elemStyle = $window.getComputedStyle(elem);
          elemOffset.top -= this.parseStyle(elemStyle.marginTop);
          elemOffset.left -= this.parseStyle(elemStyle.marginLeft);
        }
        var parent = this.offsetParent(elem);
        var parentOffset = {top: 0, left: 0};

        if (parent !== $document[0].documentElement) {
          parentOffset = this.offset(parent);
          parentOffset.top += parent.clientTop - parent.scrollTop;
          parentOffset.left += parent.clientLeft - parent.scrollLeft;
        }

        return {
          width: Math.round(angular.isNumber(elemOffset.width) ? elemOffset.width : elem.offsetWidth),
          height: Math.round(angular.isNumber(elemOffset.height) ? elemOffset.height : elem.offsetHeight),
          top: Math.round(elemOffset.top - parentOffset.top),
          left: Math.round(elemOffset.left - parentOffset.left)
        };
      },

      /**
       * Provides read-only equivalent of jQuery's offset function:
       * http://api.jquery.com/offset/ - distance to viewport.  Does
       * not account for borders, margins, or padding on the body
       * element.
       *
       * @param {element} elem - The element to calculate the offset on.
       *
       * @returns {object} An object with the following properties:
       *   <ul>
       *     <li>**width**: the width of the element</li>
       *     <li>**height**: the height of the element</li>
       *     <li>**top**: distance to top edge of viewport</li>
       *     <li>**right**: distance to bottom edge of viewport</li>
       *   </ul>
       */
      offset: function(elem) {
        elem = this.getRawNode(elem);

        var elemBCR = elem.getBoundingClientRect();
        return {
          width: Math.round(angular.isNumber(elemBCR.width) ? elemBCR.width : elem.offsetWidth),
          height: Math.round(angular.isNumber(elemBCR.height) ? elemBCR.height : elem.offsetHeight),
          top: Math.round(elemBCR.top + ($window.pageYOffset || $document[0].documentElement.scrollTop)),
          left: Math.round(elemBCR.left + ($window.pageXOffset || $document[0].documentElement.scrollLeft))
        };
      },

      /**
       * Provides offset distance to the closest scrollable ancestor
       * or viewport.  Accounts for border and scrollbar width.
       *
       * Right and bottom dimensions represent the distance to the
       * respective edge of the viewport element.  If the element
       * edge extends beyond the viewport, a negative value will be
       * reported.
       *
       * @param {element} elem - The element to get the viewport offset for.
       * @param {boolean=} [useDocument=false] - Should the viewport be the document element instead
       * of the first scrollable element, default is false.
       * @param {boolean=} [includePadding=true] - Should the padding on the offset parent element
       * be accounted for, default is true.
       *
       * @returns {object} An object with the following properties:
       *   <ul>
       *     <li>**top**: distance to the top content edge of viewport element</li>
       *     <li>**bottom**: distance to the bottom content edge of viewport element</li>
       *     <li>**left**: distance to the left content edge of viewport element</li>
       *     <li>**right**: distance to the right content edge of viewport element</li>
       *   </ul>
       */
      viewportOffset: function(elem, useDocument, includePadding) {
        elem = this.getRawNode(elem);
        includePadding = includePadding !== false ? true : false;

        var elemBCR = elem.getBoundingClientRect();
        var offsetBCR = {top: 0, left: 0, bottom: 0, right: 0};

        var offsetParent = useDocument ? $document[0].documentElement : this.scrollParent(elem);
        var offsetParentBCR = offsetParent.getBoundingClientRect();

        offsetBCR.top = offsetParentBCR.top + offsetParent.clientTop;
        offsetBCR.left = offsetParentBCR.left + offsetParent.clientLeft;
        if (offsetParent === $document[0].documentElement) {
          offsetBCR.top += $window.pageYOffset;
          offsetBCR.left += $window.pageXOffset;
        }
        offsetBCR.bottom = offsetBCR.top + offsetParent.clientHeight;
        offsetBCR.right = offsetBCR.left + offsetParent.clientWidth;

        if (includePadding) {
          var offsetParentStyle = $window.getComputedStyle(offsetParent);
          offsetBCR.top += this.parseStyle(offsetParentStyle.paddingTop);
          offsetBCR.bottom -= this.parseStyle(offsetParentStyle.paddingBottom);
          offsetBCR.left += this.parseStyle(offsetParentStyle.paddingLeft);
          offsetBCR.right -= this.parseStyle(offsetParentStyle.paddingRight);
        }

        return {
          top: Math.round(elemBCR.top - offsetBCR.top),
          bottom: Math.round(offsetBCR.bottom - elemBCR.bottom),
          left: Math.round(elemBCR.left - offsetBCR.left),
          right: Math.round(offsetBCR.right - elemBCR.right)
        };
      },

      /**
       * Provides an array of placement values parsed from a placement string.
       * Along with the 'auto' indicator, supported placement strings are:
       *   <ul>
       *     <li>top: element on top, horizontally centered on host element.</li>
       *     <li>top-left: element on top, left edge aligned with host element left edge.</li>
       *     <li>top-right: element on top, lerightft edge aligned with host element right edge.</li>
       *     <li>bottom: element on bottom, horizontally centered on host element.</li>
       *     <li>bottom-left: element on bottom, left edge aligned with host element left edge.</li>
       *     <li>bottom-right: element on bottom, right edge aligned with host element right edge.</li>
       *     <li>left: element on left, vertically centered on host element.</li>
       *     <li>left-top: element on left, top edge aligned with host element top edge.</li>
       *     <li>left-bottom: element on left, bottom edge aligned with host element bottom edge.</li>
       *     <li>right: element on right, vertically centered on host element.</li>
       *     <li>right-top: element on right, top edge aligned with host element top edge.</li>
       *     <li>right-bottom: element on right, bottom edge aligned with host element bottom edge.</li>
       *   </ul>
       * A placement string with an 'auto' indicator is expected to be
       * space separated from the placement, i.e: 'auto bottom-left'  If
       * the primary and secondary placement values do not match 'top,
       * bottom, left, right' then 'top' will be the primary placement and
       * 'center' will be the secondary placement.  If 'auto' is passed, true
       * will be returned as the 3rd value of the array.
       *
       * @param {string} placement - The placement string to parse.
       *
       * @returns {array} An array with the following values
       * <ul>
       *   <li>**[0]**: The primary placement.</li>
       *   <li>**[1]**: The secondary placement.</li>
       *   <li>**[2]**: If auto is passed: true, else undefined.</li>
       * </ul>
       */
      parsePlacement: function(placement) {
        var autoPlace = PLACEMENT_REGEX.auto.test(placement);
        if (autoPlace) {
          placement = placement.replace(PLACEMENT_REGEX.auto, '');
        }

        placement = placement.split('-');

        placement[0] = placement[0] || 'top';
        if (!PLACEMENT_REGEX.primary.test(placement[0])) {
          placement[0] = 'top';
        }

        placement[1] = placement[1] || 'center';
        if (!PLACEMENT_REGEX.secondary.test(placement[1])) {
          placement[1] = 'center';
        }

        if (autoPlace) {
          placement[2] = true;
        } else {
          placement[2] = false;
        }

        return placement;
      },

      /**
       * Provides coordinates for an element to be positioned relative to
       * another element.  Passing 'auto' as part of the placement parameter
       * will enable smart placement - where the element fits. i.e:
       * 'auto left-top' will check to see if there is enough space to the left
       * of the hostElem to fit the targetElem, if not place right (same for secondary
       * top placement).  Available space is calculated using the viewportOffset
       * function.
       *
       * @param {element} hostElem - The element to position against.
       * @param {element} targetElem - The element to position.
       * @param {string=} [placement=top] - The placement for the targetElem,
       *   default is 'top'. 'center' is assumed as secondary placement for
       *   'top', 'left', 'right', and 'bottom' placements.  Available placements are:
       *   <ul>
       *     <li>top</li>
       *     <li>top-right</li>
       *     <li>top-left</li>
       *     <li>bottom</li>
       *     <li>bottom-left</li>
       *     <li>bottom-right</li>
       *     <li>left</li>
       *     <li>left-top</li>
       *     <li>left-bottom</li>
       *     <li>right</li>
       *     <li>right-top</li>
       *     <li>right-bottom</li>
       *   </ul>
       * @param {boolean=} [appendToBody=false] - Should the top and left values returned
       *   be calculated from the body element, default is false.
       *
       * @returns {object} An object with the following properties:
       *   <ul>
       *     <li>**top**: Value for targetElem top.</li>
       *     <li>**left**: Value for targetElem left.</li>
       *     <li>**placement**: The resolved placement.</li>
       *   </ul>
       */
      positionElements: function(hostElem, targetElem, placement, appendToBody) {
        hostElem = this.getRawNode(hostElem);
        targetElem = this.getRawNode(targetElem);

        // need to read from prop to support tests.
        var targetWidth = angular.isDefined(targetElem.offsetWidth) ? targetElem.offsetWidth : targetElem.prop('offsetWidth');
        var targetHeight = angular.isDefined(targetElem.offsetHeight) ? targetElem.offsetHeight : targetElem.prop('offsetHeight');

        placement = this.parsePlacement(placement);

        var hostElemPos = appendToBody ? this.offset(hostElem) : this.position(hostElem);
        var targetElemPos = {top: 0, left: 0, placement: ''};

        if (placement[2]) {
          var viewportOffset = this.viewportOffset(hostElem, appendToBody);

          var targetElemStyle = $window.getComputedStyle(targetElem);
          var adjustedSize = {
            width: targetWidth + Math.round(Math.abs(this.parseStyle(targetElemStyle.marginLeft) + this.parseStyle(targetElemStyle.marginRight))),
            height: targetHeight + Math.round(Math.abs(this.parseStyle(targetElemStyle.marginTop) + this.parseStyle(targetElemStyle.marginBottom)))
          };

          placement[0] = placement[0] === 'top' && adjustedSize.height > viewportOffset.top && adjustedSize.height <= viewportOffset.bottom ? 'bottom' :
                         placement[0] === 'bottom' && adjustedSize.height > viewportOffset.bottom && adjustedSize.height <= viewportOffset.top ? 'top' :
                         placement[0] === 'left' && adjustedSize.width > viewportOffset.left && adjustedSize.width <= viewportOffset.right ? 'right' :
                         placement[0] === 'right' && adjustedSize.width > viewportOffset.right && adjustedSize.width <= viewportOffset.left ? 'left' :
                         placement[0];

          placement[1] = placement[1] === 'top' && adjustedSize.height - hostElemPos.height > viewportOffset.bottom && adjustedSize.height - hostElemPos.height <= viewportOffset.top ? 'bottom' :
                         placement[1] === 'bottom' && adjustedSize.height - hostElemPos.height > viewportOffset.top && adjustedSize.height - hostElemPos.height <= viewportOffset.bottom ? 'top' :
                         placement[1] === 'left' && adjustedSize.width - hostElemPos.width > viewportOffset.right && adjustedSize.width - hostElemPos.width <= viewportOffset.left ? 'right' :
                         placement[1] === 'right' && adjustedSize.width - hostElemPos.width > viewportOffset.left && adjustedSize.width - hostElemPos.width <= viewportOffset.right ? 'left' :
                         placement[1];

          if (placement[1] === 'center') {
            if (PLACEMENT_REGEX.vertical.test(placement[0])) {
              var xOverflow = hostElemPos.width / 2 - targetWidth / 2;
              if (viewportOffset.left + xOverflow < 0 && adjustedSize.width - hostElemPos.width <= viewportOffset.right) {
                placement[1] = 'left';
              } else if (viewportOffset.right + xOverflow < 0 && adjustedSize.width - hostElemPos.width <= viewportOffset.left) {
                placement[1] = 'right';
              }
            } else {
              var yOverflow = hostElemPos.height / 2 - adjustedSize.height / 2;
              if (viewportOffset.top + yOverflow < 0 && adjustedSize.height - hostElemPos.height <= viewportOffset.bottom) {
                placement[1] = 'top';
              } else if (viewportOffset.bottom + yOverflow < 0 && adjustedSize.height - hostElemPos.height <= viewportOffset.top) {
                placement[1] = 'bottom';
              }
            }
          }
        }

        switch (placement[0]) {
          case 'top':
            targetElemPos.top = hostElemPos.top - targetHeight;
            break;
          case 'bottom':
            targetElemPos.top = hostElemPos.top + hostElemPos.height;
            break;
          case 'left':
            targetElemPos.left = hostElemPos.left - targetWidth;
            break;
          case 'right':
            targetElemPos.left = hostElemPos.left + hostElemPos.width;
            break;
        }

        switch (placement[1]) {
          case 'top':
            targetElemPos.top = hostElemPos.top;
            break;
          case 'bottom':
            targetElemPos.top = hostElemPos.top + hostElemPos.height - targetHeight;
            break;
          case 'left':
            targetElemPos.left = hostElemPos.left;
            break;
          case 'right':
            targetElemPos.left = hostElemPos.left + hostElemPos.width - targetWidth;
            break;
          case 'center':
            if (PLACEMENT_REGEX.vertical.test(placement[0])) {
              targetElemPos.left = hostElemPos.left + hostElemPos.width / 2 - targetWidth / 2;
            } else {
              targetElemPos.top = hostElemPos.top + hostElemPos.height / 2 - targetHeight / 2;
            }
            break;
        }

        targetElemPos.top = Math.round(targetElemPos.top);
        targetElemPos.left = Math.round(targetElemPos.left);
        targetElemPos.placement = placement[1] === 'center' ? placement[0] : placement[0] + '-' + placement[1];

        return targetElemPos;
      },

      /**
       * Provides a way to adjust the top positioning after first
       * render to correctly align element to top after content
       * rendering causes resized element height
       *
       * @param {array} placementClasses - The array of strings of classes
       * element should have.
       * @param {object} containerPosition - The object with container
       * position information
       * @param {number} initialHeight - The initial height for the elem.
       * @param {number} currentHeight - The current height for the elem.
       */
      adjustTop: function(placementClasses, containerPosition, initialHeight, currentHeight) {
        if (placementClasses.indexOf('top') !== -1 && initialHeight !== currentHeight) {
          return {
            top: containerPosition.top - currentHeight + 'px'
          };
        }
      },

      /**
       * Provides a way for positioning tooltip & dropdown
       * arrows when using placement options beyond the standard
       * left, right, top, or bottom.
       *
       * @param {element} elem - The tooltip/dropdown element.
       * @param {string} placement - The placement for the elem.
       */
      positionArrow: function(elem, placement) {
        elem = this.getRawNode(elem);

        var innerElem = elem.querySelector('.tooltip-inner, .popover-inner');
        if (!innerElem) {
          return;
        }

        var isTooltip = angular.element(innerElem).hasClass('tooltip-inner');

        var arrowElem = isTooltip ? elem.querySelector('.tooltip-arrow') : elem.querySelector('.arrow');
        if (!arrowElem) {
          return;
        }

        var arrowCss = {
          top: '',
          bottom: '',
          left: '',
          right: ''
        };

        placement = this.parsePlacement(placement);
        if (placement[1] === 'center') {
          // no adjustment necessary - just reset styles
          angular.element(arrowElem).css(arrowCss);
          return;
        }

        var borderProp = 'border-' + placement[0] + '-width';
        var borderWidth = $window.getComputedStyle(arrowElem)[borderProp];

        var borderRadiusProp = 'border-';
        if (PLACEMENT_REGEX.vertical.test(placement[0])) {
          borderRadiusProp += placement[0] + '-' + placement[1];
        } else {
          borderRadiusProp += placement[1] + '-' + placement[0];
        }
        borderRadiusProp += '-radius';
        var borderRadius = $window.getComputedStyle(isTooltip ? innerElem : elem)[borderRadiusProp];

        switch (placement[0]) {
          case 'top':
            arrowCss.bottom = isTooltip ? '0' : '-' + borderWidth;
            break;
          case 'bottom':
            arrowCss.top = isTooltip ? '0' : '-' + borderWidth;
            break;
          case 'left':
            arrowCss.right = isTooltip ? '0' : '-' + borderWidth;
            break;
          case 'right':
            arrowCss.left = isTooltip ? '0' : '-' + borderWidth;
            break;
        }

        arrowCss[placement[1]] = borderRadius;

        angular.element(arrowElem).css(arrowCss);
      }
    };
  }]);

angular.module('ui.bootstrap.datepickerPopup', ['ui.bootstrap.datepicker', 'ui.bootstrap.position'])

.value('$datepickerPopupLiteralWarning', true)

.constant('uibDatepickerPopupConfig', {
  altInputFormats: [],
  appendToBody: false,
  clearText: 'Clear',
  closeOnDateSelection: true,
  closeText: 'Done',
  currentText: 'Today',
  datepickerPopup: 'yyyy-MM-dd',
  datepickerPopupTemplateUrl: 'uib/template/datepickerPopup/popup.html',
  datepickerTemplateUrl: 'uib/template/datepicker/datepicker.html',
  html5Types: {
    date: 'yyyy-MM-dd',
    'datetime-local': 'yyyy-MM-ddTHH:mm:ss.sss',
    'month': 'yyyy-MM'
  },
  onOpenFocus: true,
  showButtonBar: true,
  placement: 'auto bottom-left'
})

.controller('UibDatepickerPopupController', ['$scope', '$element', '$attrs', '$compile', '$log', '$parse', '$window', '$document', '$rootScope', '$uibPosition', 'dateFilter', 'uibDateParser', 'uibDatepickerPopupConfig', '$timeout', 'uibDatepickerConfig', '$datepickerPopupLiteralWarning',
function($scope, $element, $attrs, $compile, $log, $parse, $window, $document, $rootScope, $position, dateFilter, dateParser, datepickerPopupConfig, $timeout, datepickerConfig, $datepickerPopupLiteralWarning) {
  var cache = {},
    isHtml5DateInput = false;
  var dateFormat, closeOnDateSelection, appendToBody, onOpenFocus,
    datepickerPopupTemplateUrl, datepickerTemplateUrl, popupEl, datepickerEl, scrollParentEl,
    ngModel, ngModelOptions, $popup, altInputFormats, watchListeners = [];

  this.init = function(_ngModel_) {
    ngModel = _ngModel_;
    ngModelOptions = angular.isObject(_ngModel_.$options) ?
      _ngModel_.$options :
      {
        timezone: null
      };
    closeOnDateSelection = angular.isDefined($attrs.closeOnDateSelection) ?
      $scope.$parent.$eval($attrs.closeOnDateSelection) :
      datepickerPopupConfig.closeOnDateSelection;
    appendToBody = angular.isDefined($attrs.datepickerAppendToBody) ?
      $scope.$parent.$eval($attrs.datepickerAppendToBody) :
      datepickerPopupConfig.appendToBody;
    onOpenFocus = angular.isDefined($attrs.onOpenFocus) ?
      $scope.$parent.$eval($attrs.onOpenFocus) : datepickerPopupConfig.onOpenFocus;
    datepickerPopupTemplateUrl = angular.isDefined($attrs.datepickerPopupTemplateUrl) ?
      $attrs.datepickerPopupTemplateUrl :
      datepickerPopupConfig.datepickerPopupTemplateUrl;
    datepickerTemplateUrl = angular.isDefined($attrs.datepickerTemplateUrl) ?
      $attrs.datepickerTemplateUrl : datepickerPopupConfig.datepickerTemplateUrl;
    altInputFormats = angular.isDefined($attrs.altInputFormats) ?
      $scope.$parent.$eval($attrs.altInputFormats) :
      datepickerPopupConfig.altInputFormats;

    $scope.showButtonBar = angular.isDefined($attrs.showButtonBar) ?
      $scope.$parent.$eval($attrs.showButtonBar) :
      datepickerPopupConfig.showButtonBar;

    if (datepickerPopupConfig.html5Types[$attrs.type]) {
      dateFormat = datepickerPopupConfig.html5Types[$attrs.type];
      isHtml5DateInput = true;
    } else {
      dateFormat = $attrs.uibDatepickerPopup || datepickerPopupConfig.datepickerPopup;
      $attrs.$observe('uibDatepickerPopup', function(value, oldValue) {
        var newDateFormat = value || datepickerPopupConfig.datepickerPopup;
        // Invalidate the $modelValue to ensure that formatters re-run
        // FIXME: Refactor when PR is merged: https://github.com/angular/angular.js/pull/10764
        if (newDateFormat !== dateFormat) {
          dateFormat = newDateFormat;
          ngModel.$modelValue = null;

          if (!dateFormat) {
            throw new Error('uibDatepickerPopup must have a date format specified.');
          }
        }
      });
    }

    if (!dateFormat) {
      throw new Error('uibDatepickerPopup must have a date format specified.');
    }

    if (isHtml5DateInput && $attrs.uibDatepickerPopup) {
      throw new Error('HTML5 date input types do not support custom formats.');
    }

    // popup element used to display calendar
    popupEl = angular.element('<div uib-datepicker-popup-wrap><div uib-datepicker></div></div>');

    popupEl.attr({
      'ng-model': 'date',
      'ng-change': 'dateSelection(date)',
      'template-url': datepickerPopupTemplateUrl
    });

    // datepicker element
    datepickerEl = angular.element(popupEl.children()[0]);
    datepickerEl.attr('template-url', datepickerTemplateUrl);

    if (!$scope.datepickerOptions) {
      $scope.datepickerOptions = {};
    }

    if (isHtml5DateInput) {
      if ($attrs.type === 'month') {
        $scope.datepickerOptions.datepickerMode = 'month';
        $scope.datepickerOptions.minMode = 'month';
      }
    }

    datepickerEl.attr('datepicker-options', 'datepickerOptions');

    if (!isHtml5DateInput) {
      // Internal API to maintain the correct ng-invalid-[key] class
      ngModel.$$parserName = 'date';
      ngModel.$validators.date = validator;
      ngModel.$parsers.unshift(parseDate);
      ngModel.$formatters.push(function(value) {
        if (ngModel.$isEmpty(value)) {
          $scope.date = value;
          return value;
        }

        if (angular.isNumber(value)) {
          value = new Date(value);
        }

        $scope.date = dateParser.fromTimezone(value, ngModelOptions.timezone);

        return dateParser.filter($scope.date, dateFormat);
      });
    } else {
      ngModel.$formatters.push(function(value) {
        $scope.date = dateParser.fromTimezone(value, ngModelOptions.timezone);
        return value;
      });
    }

    // Detect changes in the view from the text box
    ngModel.$viewChangeListeners.push(function() {
      $scope.date = parseDateString(ngModel.$viewValue);
    });

    $element.on('keydown', inputKeydownBind);

    $popup = $compile(popupEl)($scope);
    // Prevent jQuery cache memory leak (template is now redundant after linking)
    popupEl.remove();

    if (appendToBody) {
      $document.find('body').append($popup);
    } else {
      $element.after($popup);
    }

    $scope.$on('$destroy', function() {
      if ($scope.isOpen === true) {
        if (!$rootScope.$$phase) {
          $scope.$apply(function() {
            $scope.isOpen = false;
          });
        }
      }

      $popup.remove();
      $element.off('keydown', inputKeydownBind);
      $document.off('click', documentClickBind);
      if (scrollParentEl) {
        scrollParentEl.off('scroll', positionPopup);
      }
      angular.element($window).off('resize', positionPopup);

      //Clear all watch listeners on destroy
      while (watchListeners.length) {
        watchListeners.shift()();
      }
    });
  };

  $scope.getText = function(key) {
    return $scope[key + 'Text'] || datepickerPopupConfig[key + 'Text'];
  };

  $scope.isDisabled = function(date) {
    if (date === 'today') {
      date = dateParser.fromTimezone(new Date(), ngModelOptions.timezone);
    }

    var dates = {};
    angular.forEach(['minDate', 'maxDate'], function(key) {
      if (!$scope.datepickerOptions[key]) {
        dates[key] = null;
      } else if (angular.isDate($scope.datepickerOptions[key])) {
        dates[key] = new Date($scope.datepickerOptions[key]);
      } else {
        if ($datepickerPopupLiteralWarning) {
          $log.warn('Literal date support has been deprecated, please switch to date object usage');
        }

        dates[key] = new Date(dateFilter($scope.datepickerOptions[key], 'medium'));
      }
    });

    return $scope.datepickerOptions &&
      dates.minDate && $scope.compare(date, dates.minDate) < 0 ||
      dates.maxDate && $scope.compare(date, dates.maxDate) > 0;
  };

  $scope.compare = function(date1, date2) {
    return new Date(date1.getFullYear(), date1.getMonth(), date1.getDate()) - new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
  };

  // Inner change
  $scope.dateSelection = function(dt) {
    $scope.date = dt;
    var date = $scope.date ? dateParser.filter($scope.date, dateFormat) : null; // Setting to NULL is necessary for form validators to function
    $element.val(date);
    ngModel.$setViewValue(date);

    if (closeOnDateSelection) {
      $scope.isOpen = false;
      $element[0].focus();
    }
  };

  $scope.keydown = function(evt) {
    if (evt.which === 27) {
      evt.stopPropagation();
      $scope.isOpen = false;
      $element[0].focus();
    }
  };

  $scope.select = function(date, evt) {
    evt.stopPropagation();

    if (date === 'today') {
      var today = new Date();
      if (angular.isDate($scope.date)) {
        date = new Date($scope.date);
        date.setFullYear(today.getFullYear(), today.getMonth(), today.getDate());
      } else {
        date = dateParser.fromTimezone(today, ngModelOptions.timezone);
        date.setHours(0, 0, 0, 0);
      }
    }
    $scope.dateSelection(date);
  };

  $scope.close = function(evt) {
    evt.stopPropagation();

    $scope.isOpen = false;
    $element[0].focus();
  };

  $scope.disabled = angular.isDefined($attrs.disabled) || false;
  if ($attrs.ngDisabled) {
    watchListeners.push($scope.$parent.$watch($parse($attrs.ngDisabled), function(disabled) {
      $scope.disabled = disabled;
    }));
  }

  $scope.$watch('isOpen', function(value) {
    if (value) {
      if (!$scope.disabled) {
        $timeout(function() {
          positionPopup();

          if (onOpenFocus) {
            $scope.$broadcast('uib:datepicker.focus');
          }

          $document.on('click', documentClickBind);

          var placement = $attrs.popupPlacement ? $attrs.popupPlacement : datepickerPopupConfig.placement;
          if (appendToBody || $position.parsePlacement(placement)[2]) {
            scrollParentEl = scrollParentEl || angular.element($position.scrollParent($element));
            if (scrollParentEl) {
              scrollParentEl.on('scroll', positionPopup);
            }
          } else {
            scrollParentEl = null;
          }

          angular.element($window).on('resize', positionPopup);
        }, 0, false);
      } else {
        $scope.isOpen = false;
      }
    } else {
      $document.off('click', documentClickBind);
      if (scrollParentEl) {
        scrollParentEl.off('scroll', positionPopup);
      }
      angular.element($window).off('resize', positionPopup);
    }
  });

  function cameltoDash(string) {
    return string.replace(/([A-Z])/g, function($1) { return '-' + $1.toLowerCase(); });
  }

  function parseDateString(viewValue) {
    var date = dateParser.parse(viewValue, dateFormat, $scope.date);
    if (isNaN(date)) {
      for (var i = 0; i < altInputFormats.length; i++) {
        date = dateParser.parse(viewValue, altInputFormats[i], $scope.date);
        if (!isNaN(date)) {
          return date;
        }
      }
    }
    return date;
  }

  function parseDate(viewValue) {
    if (angular.isNumber(viewValue)) {
      // presumably timestamp to date object
      viewValue = new Date(viewValue);
    }

    if (!viewValue) {
      return null;
    }

    if (angular.isDate(viewValue) && !isNaN(viewValue)) {
      return viewValue;
    }

    if (angular.isString(viewValue)) {
      var date = parseDateString(viewValue);
      if (!isNaN(date)) {
        return dateParser.fromTimezone(date, ngModelOptions.timezone);
      }
    }

    return ngModel.$options && ngModel.$options.allowInvalid ? viewValue : undefined;
  }

  function validator(modelValue, viewValue) {
    var value = modelValue || viewValue;

    if (!$attrs.ngRequired && !value) {
      return true;
    }

    if (angular.isNumber(value)) {
      value = new Date(value);
    }

    if (!value) {
      return true;
    }

    if (angular.isDate(value) && !isNaN(value)) {
      return true;
    }

    if (angular.isString(value)) {
      return !isNaN(parseDateString(value));
    }

    return false;
  }

  function documentClickBind(event) {
    if (!$scope.isOpen && $scope.disabled) {
      return;
    }

    var popup = $popup[0];
    var dpContainsTarget = $element[0].contains(event.target);
    // The popup node may not be an element node
    // In some browsers (IE) only element nodes have the 'contains' function
    var popupContainsTarget = popup.contains !== undefined && popup.contains(event.target);
    if ($scope.isOpen && !(dpContainsTarget || popupContainsTarget)) {
      $scope.$apply(function() {
        $scope.isOpen = false;
      });
    }
  }

  function inputKeydownBind(evt) {
    if (evt.which === 27 && $scope.isOpen) {
      evt.preventDefault();
      evt.stopPropagation();
      $scope.$apply(function() {
        $scope.isOpen = false;
      });
      $element[0].focus();
    } else if (evt.which === 40 && !$scope.isOpen) {
      evt.preventDefault();
      evt.stopPropagation();
      $scope.$apply(function() {
        $scope.isOpen = true;
      });
    }
  }

  function positionPopup() {
    if ($scope.isOpen) {
      var dpElement = angular.element($popup[0].querySelector('.uib-datepicker-popup'));
      var placement = $attrs.popupPlacement ? $attrs.popupPlacement : datepickerPopupConfig.placement;
      var position = $position.positionElements($element, dpElement, placement, appendToBody);
      dpElement.css({top: position.top + 'px', left: position.left + 'px'});
      if (dpElement.hasClass('uib-position-measure')) {
        dpElement.removeClass('uib-position-measure');
      }
    }
  }

  $scope.$on('uib:datepicker.mode', function() {
    $timeout(positionPopup, 0, false);
  });
}])

.directive('uibDatepickerPopup', function() {
  return {
    require: ['ngModel', 'uibDatepickerPopup'],
    controller: 'UibDatepickerPopupController',
    scope: {
      datepickerOptions: '=?',
      isOpen: '=?',
      currentText: '@',
      clearText: '@',
      closeText: '@'
    },
    link: function(scope, element, attrs, ctrls) {
      var ngModel = ctrls[0],
        ctrl = ctrls[1];

      ctrl.init(ngModel);
    }
  };
})

.directive('uibDatepickerPopupWrap', function() {
  return {
    restrict: 'A',
    transclude: true,
    templateUrl: function(element, attrs) {
      return attrs.templateUrl || 'uib/template/datepickerPopup/popup.html';
    }
  };
});

angular.module('ui.bootstrap.debounce', [])
/**
 * A helper, internal service that debounces a function
 */
  .factory('$$debounce', ['$timeout', function($timeout) {
    return function(callback, debounceTime) {
      var timeoutPromise;

      return function() {
        var self = this;
        var args = Array.prototype.slice.call(arguments);
        if (timeoutPromise) {
          $timeout.cancel(timeoutPromise);
        }

        timeoutPromise = $timeout(function() {
          callback.apply(self, args);
        }, debounceTime);
      };
    };
  }]);

angular.module('ui.bootstrap.dropdown', ['ui.bootstrap.position'])

.constant('uibDropdownConfig', {
  appendToOpenClass: 'uib-dropdown-open',
  openClass: 'open'
})

.service('uibDropdownService', ['$document', '$rootScope', function($document, $rootScope) {
  var openScope = null;

  this.open = function(dropdownScope, element) {
    if (!openScope) {
      $document.on('click', closeDropdown);
    }

    if (openScope && openScope !== dropdownScope) {
      openScope.isOpen = false;
    }

    openScope = dropdownScope;
  };

  this.close = function(dropdownScope, element) {
    if (openScope === dropdownScope) {
      openScope = null;
      $document.off('click', closeDropdown);
      $document.off('keydown', this.keybindFilter);
    }
  };

  var closeDropdown = function(evt) {
    // This method may still be called during the same mouse event that
    // unbound this event handler. So check openScope before proceeding.
    if (!openScope) { return; }

    if (evt && openScope.getAutoClose() === 'disabled') { return; }

    if (evt && evt.which === 3) { return; }

    var toggleElement = openScope.getToggleElement();
    if (evt && toggleElement && toggleElement[0].contains(evt.target)) {
      return;
    }

    var dropdownElement = openScope.getDropdownElement();
    if (evt && openScope.getAutoClose() === 'outsideClick' &&
      dropdownElement && dropdownElement[0].contains(evt.target)) {
      return;
    }

    openScope.isOpen = false;
    openScope.focusToggleElement();

    if (!$rootScope.$$phase) {
      openScope.$apply();
    }
  };

  this.keybindFilter = function(evt) {
    var dropdownElement = openScope.getDropdownElement();
    var toggleElement = openScope.getToggleElement();
    var dropdownElementTargeted = dropdownElement && dropdownElement[0].contains(evt.target);
    var toggleElementTargeted = toggleElement && toggleElement[0].contains(evt.target);
    if (evt.which === 27) {
      evt.stopPropagation();
      openScope.focusToggleElement();
      closeDropdown();
    } else if (openScope.isKeynavEnabled() && [38, 40].indexOf(evt.which) !== -1 && openScope.isOpen && (dropdownElementTargeted || toggleElementTargeted)) {
      evt.preventDefault();
      evt.stopPropagation();
      openScope.focusDropdownEntry(evt.which);
    }
  };
}])

.controller('UibDropdownController', ['$scope', '$element', '$attrs', '$parse', 'uibDropdownConfig', 'uibDropdownService', '$animate', '$uibPosition', '$document', '$compile', '$templateRequest', function($scope, $element, $attrs, $parse, dropdownConfig, uibDropdownService, $animate, $position, $document, $compile, $templateRequest) {
  var self = this,
    scope = $scope.$new(), // create a child scope so we are not polluting original one
    templateScope,
    appendToOpenClass = dropdownConfig.appendToOpenClass,
    openClass = dropdownConfig.openClass,
    getIsOpen,
    setIsOpen = angular.noop,
    toggleInvoker = $attrs.onToggle ? $parse($attrs.onToggle) : angular.noop,
    appendToBody = false,
    appendTo = null,
    keynavEnabled = false,
    selectedOption = null,
    body = $document.find('body');

  $element.addClass('dropdown');

  this.init = function() {
    if ($attrs.isOpen) {
      getIsOpen = $parse($attrs.isOpen);
      setIsOpen = getIsOpen.assign;

      $scope.$watch(getIsOpen, function(value) {
        scope.isOpen = !!value;
      });
    }

    if (angular.isDefined($attrs.dropdownAppendTo)) {
      var appendToEl = $parse($attrs.dropdownAppendTo)(scope);
      if (appendToEl) {
        appendTo = angular.element(appendToEl);
      }
    }

    appendToBody = angular.isDefined($attrs.dropdownAppendToBody);
    keynavEnabled = angular.isDefined($attrs.keyboardNav);

    if (appendToBody && !appendTo) {
      appendTo = body;
    }

    if (appendTo && self.dropdownMenu) {
      appendTo.append(self.dropdownMenu);
      $element.on('$destroy', function handleDestroyEvent() {
        self.dropdownMenu.remove();
      });
    }
  };

  this.toggle = function(open) {
    scope.isOpen = arguments.length ? !!open : !scope.isOpen;
    if (angular.isFunction(setIsOpen)) {
      setIsOpen(scope, scope.isOpen);
    }

    return scope.isOpen;
  };

  // Allow other directives to watch status
  this.isOpen = function() {
    return scope.isOpen;
  };

  scope.getToggleElement = function() {
    return self.toggleElement;
  };

  scope.getAutoClose = function() {
    return $attrs.autoClose || 'always'; //or 'outsideClick' or 'disabled'
  };

  scope.getElement = function() {
    return $element;
  };

  scope.isKeynavEnabled = function() {
    return keynavEnabled;
  };

  scope.focusDropdownEntry = function(keyCode) {
    var elems = self.dropdownMenu ? //If append to body is used.
      angular.element(self.dropdownMenu).find('a') :
      $element.find('ul').eq(0).find('a');

    switch (keyCode) {
      case 40: {
        if (!angular.isNumber(self.selectedOption)) {
          self.selectedOption = 0;
        } else {
          self.selectedOption = self.selectedOption === elems.length - 1 ?
            self.selectedOption :
            self.selectedOption + 1;
        }
        break;
      }
      case 38: {
        if (!angular.isNumber(self.selectedOption)) {
          self.selectedOption = elems.length - 1;
        } else {
          self.selectedOption = self.selectedOption === 0 ?
            0 : self.selectedOption - 1;
        }
        break;
      }
    }
    elems[self.selectedOption].focus();
  };

  scope.getDropdownElement = function() {
    return self.dropdownMenu;
  };

  scope.focusToggleElement = function() {
    if (self.toggleElement) {
      self.toggleElement[0].focus();
    }
  };

  scope.$watch('isOpen', function(isOpen, wasOpen) {
    if (appendTo && self.dropdownMenu) {
      var pos = $position.positionElements($element, self.dropdownMenu, 'bottom-left', true),
        css,
        rightalign,
        scrollbarPadding,
        scrollbarWidth = 0;

      css = {
        top: pos.top + 'px',
        display: isOpen ? 'block' : 'none'
      };

      rightalign = self.dropdownMenu.hasClass('dropdown-menu-right');
      if (!rightalign) {
        css.left = pos.left + 'px';
        css.right = 'auto';
      } else {
        css.left = 'auto';
        scrollbarPadding = $position.scrollbarPadding(appendTo);

        if (scrollbarPadding.heightOverflow && scrollbarPadding.scrollbarWidth) {
          scrollbarWidth = scrollbarPadding.scrollbarWidth;
        }

        css.right = window.innerWidth - scrollbarWidth -
          (pos.left + $element.prop('offsetWidth')) + 'px';
      }

      // Need to adjust our positioning to be relative to the appendTo container
      // if it's not the body element
      if (!appendToBody) {
        var appendOffset = $position.offset(appendTo);

        css.top = pos.top - appendOffset.top + 'px';

        if (!rightalign) {
          css.left = pos.left - appendOffset.left + 'px';
        } else {
          css.right = window.innerWidth -
            (pos.left - appendOffset.left + $element.prop('offsetWidth')) + 'px';
        }
      }

      self.dropdownMenu.css(css);
    }

    var openContainer = appendTo ? appendTo : $element;
    var hasOpenClass = openContainer.hasClass(appendTo ? appendToOpenClass : openClass);

    if (hasOpenClass === !isOpen) {
      $animate[isOpen ? 'addClass' : 'removeClass'](openContainer, appendTo ? appendToOpenClass : openClass).then(function() {
        if (angular.isDefined(isOpen) && isOpen !== wasOpen) {
          toggleInvoker($scope, { open: !!isOpen });
        }
      });
    }

    if (isOpen) {
      if (self.dropdownMenuTemplateUrl) {
        $templateRequest(self.dropdownMenuTemplateUrl).then(function(tplContent) {
          templateScope = scope.$new();
          $compile(tplContent.trim())(templateScope, function(dropdownElement) {
            var newEl = dropdownElement;
            self.dropdownMenu.replaceWith(newEl);
            self.dropdownMenu = newEl;
            $document.on('keydown', uibDropdownService.keybindFilter);
          });
        });
      } else {
        $document.on('keydown', uibDropdownService.keybindFilter);
      }

      scope.focusToggleElement();
      uibDropdownService.open(scope, $element);
    } else {
      uibDropdownService.close(scope, $element);
      if (self.dropdownMenuTemplateUrl) {
        if (templateScope) {
          templateScope.$destroy();
        }
        var newEl = angular.element('<ul class="dropdown-menu"></ul>');
        self.dropdownMenu.replaceWith(newEl);
        self.dropdownMenu = newEl;
      }

      self.selectedOption = null;
    }

    if (angular.isFunction(setIsOpen)) {
      setIsOpen($scope, isOpen);
    }
  });
}])

.directive('uibDropdown', function() {
  return {
    controller: 'UibDropdownController',
    link: function(scope, element, attrs, dropdownCtrl) {
      dropdownCtrl.init();
    }
  };
})

.directive('uibDropdownMenu', function() {
  return {
    restrict: 'A',
    require: '?^uibDropdown',
    link: function(scope, element, attrs, dropdownCtrl) {
      if (!dropdownCtrl || angular.isDefined(attrs.dropdownNested)) {
        return;
      }

      element.addClass('dropdown-menu');

      var tplUrl = attrs.templateUrl;
      if (tplUrl) {
        dropdownCtrl.dropdownMenuTemplateUrl = tplUrl;
      }

      if (!dropdownCtrl.dropdownMenu) {
        dropdownCtrl.dropdownMenu = element;
      }
    }
  };
})

.directive('uibDropdownToggle', function() {
  return {
    require: '?^uibDropdown',
    link: function(scope, element, attrs, dropdownCtrl) {
      if (!dropdownCtrl) {
        return;
      }

      element.addClass('dropdown-toggle');

      dropdownCtrl.toggleElement = element;

      var toggleDropdown = function(event) {
        event.preventDefault();

        if (!element.hasClass('disabled') && !attrs.disabled) {
          scope.$apply(function() {
            dropdownCtrl.toggle();
          });
        }
      };

      element.bind('click', toggleDropdown);

      // WAI-ARIA
      element.attr({ 'aria-haspopup': true, 'aria-expanded': false });
      scope.$watch(dropdownCtrl.isOpen, function(isOpen) {
        element.attr('aria-expanded', !!isOpen);
      });

      scope.$on('$destroy', function() {
        element.unbind('click', toggleDropdown);
      });
    }
  };
});

angular.module('ui.bootstrap.stackedMap', [])
/**
 * A helper, internal data structure that acts as a map but also allows getting / removing
 * elements in the LIFO order
 */
  .factory('$$stackedMap', function() {
    return {
      createNew: function() {
        var stack = [];

        return {
          add: function(key, value) {
            stack.push({
              key: key,
              value: value
            });
          },
          get: function(key) {
            for (var i = 0; i < stack.length; i++) {
              if (key === stack[i].key) {
                return stack[i];
              }
            }
          },
          keys: function() {
            var keys = [];
            for (var i = 0; i < stack.length; i++) {
              keys.push(stack[i].key);
            }
            return keys;
          },
          top: function() {
            return stack[stack.length - 1];
          },
          remove: function(key) {
            var idx = -1;
            for (var i = 0; i < stack.length; i++) {
              if (key === stack[i].key) {
                idx = i;
                break;
              }
            }
            return stack.splice(idx, 1)[0];
          },
          removeTop: function() {
            return stack.pop();
          },
          length: function() {
            return stack.length;
          }
        };
      }
    };
  });
angular.module('ui.bootstrap.modal', ['ui.bootstrap.stackedMap', 'ui.bootstrap.position'])
/**
 * A helper, internal data structure that stores all references attached to key
 */
  .factory('$$multiMap', function() {
    return {
      createNew: function() {
        var map = {};

        return {
          entries: function() {
            return Object.keys(map).map(function(key) {
              return {
                key: key,
                value: map[key]
              };
            });
          },
          get: function(key) {
            return map[key];
          },
          hasKey: function(key) {
            return !!map[key];
          },
          keys: function() {
            return Object.keys(map);
          },
          put: function(key, value) {
            if (!map[key]) {
              map[key] = [];
            }

            map[key].push(value);
          },
          remove: function(key, value) {
            var values = map[key];

            if (!values) {
              return;
            }

            var idx = values.indexOf(value);

            if (idx !== -1) {
              values.splice(idx, 1);
            }

            if (!values.length) {
              delete map[key];
            }
          }
        };
      }
    };
  })

/**
 * Pluggable resolve mechanism for the modal resolve resolution
 * Supports UI Router's $resolve service
 */
  .provider('$uibResolve', function() {
    var resolve = this;
    this.resolver = null;

    this.setResolver = function(resolver) {
      this.resolver = resolver;
    };

    this.$get = ['$injector', '$q', function($injector, $q) {
      var resolver = resolve.resolver ? $injector.get(resolve.resolver) : null;
      return {
        resolve: function(invocables, locals, parent, self) {
          if (resolver) {
            return resolver.resolve(invocables, locals, parent, self);
          }

          var promises = [];

          angular.forEach(invocables, function(value) {
            if (angular.isFunction(value) || angular.isArray(value)) {
              promises.push($q.resolve($injector.invoke(value)));
            } else if (angular.isString(value)) {
              promises.push($q.resolve($injector.get(value)));
            } else {
              promises.push($q.resolve(value));
            }
          });

          return $q.all(promises).then(function(resolves) {
            var resolveObj = {};
            var resolveIter = 0;
            angular.forEach(invocables, function(value, key) {
              resolveObj[key] = resolves[resolveIter++];
            });

            return resolveObj;
          });
        }
      };
    }];
  })

/**
 * A helper directive for the $modal service. It creates a backdrop element.
 */
  .directive('uibModalBackdrop', ['$animate', '$injector', '$uibModalStack',
  function($animate, $injector, $modalStack) {
    return {
      restrict: 'A',
      compile: function(tElement, tAttrs) {
        tElement.addClass(tAttrs.backdropClass);
        return linkFn;
      }
    };

    function linkFn(scope, element, attrs) {
      if (attrs.modalInClass) {
        $animate.addClass(element, attrs.modalInClass);

        scope.$on($modalStack.NOW_CLOSING_EVENT, function(e, setIsAsync) {
          var done = setIsAsync();
          if (scope.modalOptions.animation) {
            $animate.removeClass(element, attrs.modalInClass).then(done);
          } else {
            done();
          }
        });
      }
    }
  }])

  .directive('uibModalWindow', ['$uibModalStack', '$q', '$animateCss', '$document',
  function($modalStack, $q, $animateCss, $document) {
    return {
      scope: {
        index: '@'
      },
      restrict: 'A',
      transclude: true,
      templateUrl: function(tElement, tAttrs) {
        return tAttrs.templateUrl || 'uib/template/modal/window.html';
      },
      link: function(scope, element, attrs) {
        element.addClass(attrs.windowTopClass || '');
        scope.size = attrs.size;

        scope.close = function(evt) {
          var modal = $modalStack.getTop();
          if (modal && modal.value.backdrop &&
            modal.value.backdrop !== 'static' &&
            evt.target === evt.currentTarget) {
            evt.preventDefault();
            evt.stopPropagation();
            $modalStack.dismiss(modal.key, 'backdrop click');
          }
        };

        // moved from template to fix issue #2280
        element.on('click', scope.close);

        // This property is only added to the scope for the purpose of detecting when this directive is rendered.
        // We can detect that by using this property in the template associated with this directive and then use
        // {@link Attribute#$observe} on it. For more details please see {@link TableColumnResize}.
        scope.$isRendered = true;

        // Deferred object that will be resolved when this modal is render.
        var modalRenderDeferObj = $q.defer();
        // Resolve render promise post-digest
        scope.$$postDigest(function() {
          modalRenderDeferObj.resolve();
        });

        modalRenderDeferObj.promise.then(function() {
          var animationPromise = null;

          if (attrs.modalInClass) {
            animationPromise = $animateCss(element, {
              addClass: attrs.modalInClass
            }).start();

            scope.$on($modalStack.NOW_CLOSING_EVENT, function(e, setIsAsync) {
              var done = setIsAsync();
              $animateCss(element, {
                removeClass: attrs.modalInClass
              }).start().then(done);
            });
          }


          $q.when(animationPromise).then(function() {
            // Notify {@link $modalStack} that modal is rendered.
            var modal = $modalStack.getTop();
            if (modal) {
              $modalStack.modalRendered(modal.key);
            }

            /**
             * If something within the freshly-opened modal already has focus (perhaps via a
             * directive that causes focus). then no need to try and focus anything.
             */
            if (!($document[0].activeElement && element[0].contains($document[0].activeElement))) {
              var inputWithAutofocus = element[0].querySelector('[autofocus]');
              /**
               * Auto-focusing of a freshly-opened modal element causes any child elements
               * with the autofocus attribute to lose focus. This is an issue on touch
               * based devices which will show and then hide the onscreen keyboard.
               * Attempts to refocus the autofocus element via JavaScript will not reopen
               * the onscreen keyboard. Fixed by updated the focusing logic to only autofocus
               * the modal element if the modal does not contain an autofocus element.
               */
              if (inputWithAutofocus) {
                inputWithAutofocus.focus();
              } else {
                element[0].focus();
              }
            }
          });
        });
      }
    };
  }])

  .directive('uibModalAnimationClass', function() {
    return {
      compile: function(tElement, tAttrs) {
        if (tAttrs.modalAnimation) {
          tElement.addClass(tAttrs.uibModalAnimationClass);
        }
      }
    };
  })

  .directive('uibModalTransclude', ['$animate', function($animate) {
    return {
      link: function(scope, element, attrs, controller, transclude) {
        transclude(scope.$parent, function(clone) {
          element.empty();
          $animate.enter(clone, element);
        });
      }
    };
  }])

  .factory('$uibModalStack', ['$animate', '$animateCss', '$document',
    '$compile', '$rootScope', '$q', '$$multiMap', '$$stackedMap', '$uibPosition',
    function($animate, $animateCss, $document, $compile, $rootScope, $q, $$multiMap, $$stackedMap, $uibPosition) {
      var OPENED_MODAL_CLASS = 'modal-open';

      var backdropDomEl, backdropScope;
      var openedWindows = $$stackedMap.createNew();
      var openedClasses = $$multiMap.createNew();
      var $modalStack = {
        NOW_CLOSING_EVENT: 'modal.stack.now-closing'
      };
      var topModalIndex = 0;
      var previousTopOpenedModal = null;

      //Modal focus behavior
      var tabbableSelector = 'a[href], area[href], input:not([disabled]):not([tabindex=\'-1\']), ' +
        'button:not([disabled]):not([tabindex=\'-1\']),select:not([disabled]):not([tabindex=\'-1\']), textarea:not([disabled]):not([tabindex=\'-1\']), ' +
        'iframe, object, embed, *[tabindex]:not([tabindex=\'-1\']), *[contenteditable=true]';
      var scrollbarPadding;
      var SNAKE_CASE_REGEXP = /[A-Z]/g;

      // TODO: extract into common dependency with tooltip
      function snake_case(name) {
        var separator = '-';
        return name.replace(SNAKE_CASE_REGEXP, function(letter, pos) {
          return (pos ? separator : '') + letter.toLowerCase();
        });
      }

      function isVisible(element) {
        return !!(element.offsetWidth ||
          element.offsetHeight ||
          element.getClientRects().length);
      }

      function backdropIndex() {
        var topBackdropIndex = -1;
        var opened = openedWindows.keys();
        for (var i = 0; i < opened.length; i++) {
          if (openedWindows.get(opened[i]).value.backdrop) {
            topBackdropIndex = i;
          }
        }

        // If any backdrop exist, ensure that it's index is always
        // right below the top modal
        if (topBackdropIndex > -1 && topBackdropIndex < topModalIndex) {
          topBackdropIndex = topModalIndex;
        }
        return topBackdropIndex;
      }

      $rootScope.$watch(backdropIndex, function(newBackdropIndex) {
        if (backdropScope) {
          backdropScope.index = newBackdropIndex;
        }
      });

      function removeModalWindow(modalInstance, elementToReceiveFocus) {
        var modalWindow = openedWindows.get(modalInstance).value;
        var appendToElement = modalWindow.appendTo;

        //clean up the stack
        openedWindows.remove(modalInstance);
        previousTopOpenedModal = openedWindows.top();
        if (previousTopOpenedModal) {
          topModalIndex = parseInt(previousTopOpenedModal.value.modalDomEl.attr('index'), 10);
        }

        removeAfterAnimate(modalWindow.modalDomEl, modalWindow.modalScope, function() {
          var modalBodyClass = modalWindow.openedClass || OPENED_MODAL_CLASS;
          openedClasses.remove(modalBodyClass, modalInstance);
          var areAnyOpen = openedClasses.hasKey(modalBodyClass);
          appendToElement.toggleClass(modalBodyClass, areAnyOpen);
          if (!areAnyOpen && scrollbarPadding && scrollbarPadding.heightOverflow && scrollbarPadding.scrollbarWidth) {
            if (scrollbarPadding.originalRight) {
              appendToElement.css({paddingRight: scrollbarPadding.originalRight + 'px'});
            } else {
              appendToElement.css({paddingRight: ''});
            }
            scrollbarPadding = null;
          }
          toggleTopWindowClass(true);
        }, modalWindow.closedDeferred);
        checkRemoveBackdrop();

        //move focus to specified element if available, or else to body
        if (elementToReceiveFocus && elementToReceiveFocus.focus) {
          elementToReceiveFocus.focus();
        } else if (appendToElement.focus) {
          appendToElement.focus();
        }
      }

      // Add or remove "windowTopClass" from the top window in the stack
      function toggleTopWindowClass(toggleSwitch) {
        var modalWindow;

        if (openedWindows.length() > 0) {
          modalWindow = openedWindows.top().value;
          modalWindow.modalDomEl.toggleClass(modalWindow.windowTopClass || '', toggleSwitch);
        }
      }

      function checkRemoveBackdrop() {
        //remove backdrop if no longer needed
        if (backdropDomEl && backdropIndex() === -1) {
          var backdropScopeRef = backdropScope;
          removeAfterAnimate(backdropDomEl, backdropScope, function() {
            backdropScopeRef = null;
          });
          backdropDomEl = undefined;
          backdropScope = undefined;
        }
      }

      function removeAfterAnimate(domEl, scope, done, closedDeferred) {
        var asyncDeferred;
        var asyncPromise = null;
        var setIsAsync = function() {
          if (!asyncDeferred) {
            asyncDeferred = $q.defer();
            asyncPromise = asyncDeferred.promise;
          }

          return function asyncDone() {
            asyncDeferred.resolve();
          };
        };
        scope.$broadcast($modalStack.NOW_CLOSING_EVENT, setIsAsync);

        // Note that it's intentional that asyncPromise might be null.
        // That's when setIsAsync has not been called during the
        // NOW_CLOSING_EVENT broadcast.
        return $q.when(asyncPromise).then(afterAnimating);

        function afterAnimating() {
          if (afterAnimating.done) {
            return;
          }
          afterAnimating.done = true;

          $animate.leave(domEl).then(function() {
            if (done) {
              done();
            }

            domEl.remove();
            if (closedDeferred) {
              closedDeferred.resolve();
            }
          });

          scope.$destroy();
        }
      }

      $document.on('keydown', keydownListener);

      $rootScope.$on('$destroy', function() {
        $document.off('keydown', keydownListener);
      });

      function keydownListener(evt) {
        if (evt.isDefaultPrevented()) {
          return evt;
        }

        var modal = openedWindows.top();
        if (modal) {
          switch (evt.which) {
            case 27: {
              if (modal.value.keyboard) {
                evt.preventDefault();
                $rootScope.$apply(function() {
                  $modalStack.dismiss(modal.key, 'escape key press');
                });
              }
              break;
            }
            case 9: {
              var list = $modalStack.loadFocusElementList(modal);
              var focusChanged = false;
              if (evt.shiftKey) {
                if ($modalStack.isFocusInFirstItem(evt, list) || $modalStack.isModalFocused(evt, modal)) {
                  focusChanged = $modalStack.focusLastFocusableElement(list);
                }
              } else {
                if ($modalStack.isFocusInLastItem(evt, list)) {
                  focusChanged = $modalStack.focusFirstFocusableElement(list);
                }
              }

              if (focusChanged) {
                evt.preventDefault();
                evt.stopPropagation();
              }

              break;
            }
          }
        }
      }

      $modalStack.open = function(modalInstance, modal) {
        var modalOpener = $document[0].activeElement,
          modalBodyClass = modal.openedClass || OPENED_MODAL_CLASS;

        toggleTopWindowClass(false);

        // Store the current top first, to determine what index we ought to use
        // for the current top modal
        previousTopOpenedModal = openedWindows.top();

        openedWindows.add(modalInstance, {
          deferred: modal.deferred,
          renderDeferred: modal.renderDeferred,
          closedDeferred: modal.closedDeferred,
          modalScope: modal.scope,
          backdrop: modal.backdrop,
          keyboard: modal.keyboard,
          openedClass: modal.openedClass,
          windowTopClass: modal.windowTopClass,
          animation: modal.animation,
          appendTo: modal.appendTo
        });

        openedClasses.put(modalBodyClass, modalInstance);

        var appendToElement = modal.appendTo,
            currBackdropIndex = backdropIndex();

        if (!appendToElement.length) {
          throw new Error('appendTo element not found. Make sure that the element passed is in DOM.');
        }

        if (currBackdropIndex >= 0 && !backdropDomEl) {
          backdropScope = $rootScope.$new(true);
          backdropScope.modalOptions = modal;
          backdropScope.index = currBackdropIndex;
          backdropDomEl = angular.element('<div uib-modal-backdrop="modal-backdrop"></div>');
          backdropDomEl.attr({
            'class': 'modal-backdrop',
            'ng-style': '{\'z-index\': 1040 + (index && 1 || 0) + index*10}',
            'uib-modal-animation-class': 'fade',
            'modal-in-class': 'in'
          });
          if (modal.backdropClass) {
            backdropDomEl.addClass(modal.backdropClass);
          }

          if (modal.animation) {
            backdropDomEl.attr('modal-animation', 'true');
          }
          $compile(backdropDomEl)(backdropScope);
          $animate.enter(backdropDomEl, appendToElement);
          if ($uibPosition.isScrollable(appendToElement)) {
            scrollbarPadding = $uibPosition.scrollbarPadding(appendToElement);
            if (scrollbarPadding.heightOverflow && scrollbarPadding.scrollbarWidth) {
              appendToElement.css({paddingRight: scrollbarPadding.right + 'px'});
            }
          }
        }

        var content;
        if (modal.component) {
          content = document.createElement(snake_case(modal.component.name));
          content = angular.element(content);
          content.attr({
            resolve: '$resolve',
            'modal-instance': '$uibModalInstance',
            close: '$close($value)',
            dismiss: '$dismiss($value)'
          });
        } else {
          content = modal.content;
        }

        // Set the top modal index based on the index of the previous top modal
        topModalIndex = previousTopOpenedModal ? parseInt(previousTopOpenedModal.value.modalDomEl.attr('index'), 10) + 1 : 0;
        var angularDomEl = angular.element('<div uib-modal-window="modal-window"></div>');
        angularDomEl.attr({
          'class': 'modal',
          'template-url': modal.windowTemplateUrl,
          'window-top-class': modal.windowTopClass,
          'role': 'dialog',
          'aria-labelledby': modal.ariaLabelledBy,
          'aria-describedby': modal.ariaDescribedBy,
          'size': modal.size,
          'index': topModalIndex,
          'animate': 'animate',
          'ng-style': '{\'z-index\': 1050 + $$topModalIndex*10, display: \'block\'}',
          'tabindex': -1,
          'uib-modal-animation-class': 'fade',
          'modal-in-class': 'in'
        }).append(content);
        if (modal.windowClass) {
          angularDomEl.addClass(modal.windowClass);
        }

        if (modal.animation) {
          angularDomEl.attr('modal-animation', 'true');
        }

        appendToElement.addClass(modalBodyClass);
        if (modal.scope) {
          // we need to explicitly add the modal index to the modal scope
          // because it is needed by ngStyle to compute the zIndex property.
          modal.scope.$$topModalIndex = topModalIndex;
        }
        $animate.enter($compile(angularDomEl)(modal.scope), appendToElement);

        openedWindows.top().value.modalDomEl = angularDomEl;
        openedWindows.top().value.modalOpener = modalOpener;
      };

      function broadcastClosing(modalWindow, resultOrReason, closing) {
        return !modalWindow.value.modalScope.$broadcast('modal.closing', resultOrReason, closing).defaultPrevented;
      }

      $modalStack.close = function(modalInstance, result) {
        var modalWindow = openedWindows.get(modalInstance);
        if (modalWindow && broadcastClosing(modalWindow, result, true)) {
          modalWindow.value.modalScope.$$uibDestructionScheduled = true;
          modalWindow.value.deferred.resolve(result);
          removeModalWindow(modalInstance, modalWindow.value.modalOpener);
          return true;
        }
        return !modalWindow;
      };

      $modalStack.dismiss = function(modalInstance, reason) {
        var modalWindow = openedWindows.get(modalInstance);
        if (modalWindow && broadcastClosing(modalWindow, reason, false)) {
          modalWindow.value.modalScope.$$uibDestructionScheduled = true;
          modalWindow.value.deferred.reject(reason);
          removeModalWindow(modalInstance, modalWindow.value.modalOpener);
          return true;
        }
        return !modalWindow;
      };

      $modalStack.dismissAll = function(reason) {
        var topModal = this.getTop();
        while (topModal && this.dismiss(topModal.key, reason)) {
          topModal = this.getTop();
        }
      };

      $modalStack.getTop = function() {
        return openedWindows.top();
      };

      $modalStack.modalRendered = function(modalInstance) {
        var modalWindow = openedWindows.get(modalInstance);
        if (modalWindow) {
          modalWindow.value.renderDeferred.resolve();
        }
      };

      $modalStack.focusFirstFocusableElement = function(list) {
        if (list.length > 0) {
          list[0].focus();
          return true;
        }
        return false;
      };

      $modalStack.focusLastFocusableElement = function(list) {
        if (list.length > 0) {
          list[list.length - 1].focus();
          return true;
        }
        return false;
      };

      $modalStack.isModalFocused = function(evt, modalWindow) {
        if (evt && modalWindow) {
          var modalDomEl = modalWindow.value.modalDomEl;
          if (modalDomEl && modalDomEl.length) {
            return (evt.target || evt.srcElement) === modalDomEl[0];
          }
        }
        return false;
      };

      $modalStack.isFocusInFirstItem = function(evt, list) {
        if (list.length > 0) {
          return (evt.target || evt.srcElement) === list[0];
        }
        return false;
      };

      $modalStack.isFocusInLastItem = function(evt, list) {
        if (list.length > 0) {
          return (evt.target || evt.srcElement) === list[list.length - 1];
        }
        return false;
      };

      $modalStack.loadFocusElementList = function(modalWindow) {
        if (modalWindow) {
          var modalDomE1 = modalWindow.value.modalDomEl;
          if (modalDomE1 && modalDomE1.length) {
            var elements = modalDomE1[0].querySelectorAll(tabbableSelector);
            return elements ?
              Array.prototype.filter.call(elements, function(element) {
                return isVisible(element);
              }) : elements;
          }
        }
      };

      return $modalStack;
    }])

  .provider('$uibModal', function() {
    var $modalProvider = {
      options: {
        animation: true,
        backdrop: true, //can also be false or 'static'
        keyboard: true
      },
      $get: ['$rootScope', '$q', '$document', '$templateRequest', '$controller', '$uibResolve', '$uibModalStack',
        function ($rootScope, $q, $document, $templateRequest, $controller, $uibResolve, $modalStack) {
          var $modal = {};

          function getTemplatePromise(options) {
            return options.template ? $q.when(options.template) :
              $templateRequest(angular.isFunction(options.templateUrl) ?
                options.templateUrl() : options.templateUrl);
          }

          var promiseChain = null;
          $modal.getPromiseChain = function() {
            return promiseChain;
          };

          $modal.open = function(modalOptions) {
            var modalResultDeferred = $q.defer();
            var modalOpenedDeferred = $q.defer();
            var modalClosedDeferred = $q.defer();
            var modalRenderDeferred = $q.defer();

            //prepare an instance of a modal to be injected into controllers and returned to a caller
            var modalInstance = {
              result: modalResultDeferred.promise,
              opened: modalOpenedDeferred.promise,
              closed: modalClosedDeferred.promise,
              rendered: modalRenderDeferred.promise,
              close: function (result) {
                return $modalStack.close(modalInstance, result);
              },
              dismiss: function (reason) {
                return $modalStack.dismiss(modalInstance, reason);
              }
            };

            //merge and clean up options
            modalOptions = angular.extend({}, $modalProvider.options, modalOptions);
            modalOptions.resolve = modalOptions.resolve || {};
            modalOptions.appendTo = modalOptions.appendTo || $document.find('body').eq(0);

            //verify options
            if (!modalOptions.component && !modalOptions.template && !modalOptions.templateUrl) {
              throw new Error('One of component or template or templateUrl options is required.');
            }

            var templateAndResolvePromise;
            if (modalOptions.component) {
              templateAndResolvePromise = $q.when($uibResolve.resolve(modalOptions.resolve, {}, null, null));
            } else {
              templateAndResolvePromise =
                $q.all([getTemplatePromise(modalOptions), $uibResolve.resolve(modalOptions.resolve, {}, null, null)]);
            }

            function resolveWithTemplate() {
              return templateAndResolvePromise;
            }

            // Wait for the resolution of the existing promise chain.
            // Then switch to our own combined promise dependency (regardless of how the previous modal fared).
            // Then add to $modalStack and resolve opened.
            // Finally clean up the chain variable if no subsequent modal has overwritten it.
            var samePromise;
            samePromise = promiseChain = $q.all([promiseChain])
              .then(resolveWithTemplate, resolveWithTemplate)
              .then(function resolveSuccess(tplAndVars) {
                var providedScope = modalOptions.scope || $rootScope;

                var modalScope = providedScope.$new();
                modalScope.$close = modalInstance.close;
                modalScope.$dismiss = modalInstance.dismiss;

                modalScope.$on('$destroy', function() {
                  if (!modalScope.$$uibDestructionScheduled) {
                    modalScope.$dismiss('$uibUnscheduledDestruction');
                  }
                });

                var modal = {
                  scope: modalScope,
                  deferred: modalResultDeferred,
                  renderDeferred: modalRenderDeferred,
                  closedDeferred: modalClosedDeferred,
                  animation: modalOptions.animation,
                  backdrop: modalOptions.backdrop,
                  keyboard: modalOptions.keyboard,
                  backdropClass: modalOptions.backdropClass,
                  windowTopClass: modalOptions.windowTopClass,
                  windowClass: modalOptions.windowClass,
                  windowTemplateUrl: modalOptions.windowTemplateUrl,
                  ariaLabelledBy: modalOptions.ariaLabelledBy,
                  ariaDescribedBy: modalOptions.ariaDescribedBy,
                  size: modalOptions.size,
                  openedClass: modalOptions.openedClass,
                  appendTo: modalOptions.appendTo
                };

                var component = {};
                var ctrlInstance, ctrlInstantiate, ctrlLocals = {};

                if (modalOptions.component) {
                  constructLocals(component, false, true, false);
                  component.name = modalOptions.component;
                  modal.component = component;
                } else if (modalOptions.controller) {
                  constructLocals(ctrlLocals, true, false, true);

                  // the third param will make the controller instantiate later,private api
                  // @see https://github.com/angular/angular.js/blob/master/src/ng/controller.js#L126
                  ctrlInstantiate = $controller(modalOptions.controller, ctrlLocals, true, modalOptions.controllerAs);
                  if (modalOptions.controllerAs && modalOptions.bindToController) {
                    ctrlInstance = ctrlInstantiate.instance;
                    ctrlInstance.$close = modalScope.$close;
                    ctrlInstance.$dismiss = modalScope.$dismiss;
                    angular.extend(ctrlInstance, {
                      $resolve: ctrlLocals.$scope.$resolve
                    }, providedScope);
                  }

                  ctrlInstance = ctrlInstantiate();

                  if (angular.isFunction(ctrlInstance.$onInit)) {
                    ctrlInstance.$onInit();
                  }
                }

                if (!modalOptions.component) {
                  modal.content = tplAndVars[0];
                }

                $modalStack.open(modalInstance, modal);
                modalOpenedDeferred.resolve(true);

                function constructLocals(obj, template, instanceOnScope, injectable) {
                  obj.$scope = modalScope;
                  obj.$scope.$resolve = {};
                  if (instanceOnScope) {
                    obj.$scope.$uibModalInstance = modalInstance;
                  } else {
                    obj.$uibModalInstance = modalInstance;
                  }

                  var resolves = template ? tplAndVars[1] : tplAndVars;
                  angular.forEach(resolves, function(value, key) {
                    if (injectable) {
                      obj[key] = value;
                    }

                    obj.$scope.$resolve[key] = value;
                  });
                }
            }, function resolveError(reason) {
              modalOpenedDeferred.reject(reason);
              modalResultDeferred.reject(reason);
            })['finally'](function() {
              if (promiseChain === samePromise) {
                promiseChain = null;
              }
            });

            return modalInstance;
          };

          return $modal;
        }
      ]
    };

    return $modalProvider;
  });

angular.module('ui.bootstrap.paging', [])
/**
 * Helper internal service for generating common controller code between the
 * pager and pagination components
 */
.factory('uibPaging', ['$parse', function($parse) {
  return {
    create: function(ctrl, $scope, $attrs) {
      ctrl.setNumPages = $attrs.numPages ? $parse($attrs.numPages).assign : angular.noop;
      ctrl.ngModelCtrl = { $setViewValue: angular.noop }; // nullModelCtrl
      ctrl._watchers = [];

      ctrl.init = function(ngModelCtrl, config) {
        ctrl.ngModelCtrl = ngModelCtrl;
        ctrl.config = config;

        ngModelCtrl.$render = function() {
          ctrl.render();
        };

        if ($attrs.itemsPerPage) {
          ctrl._watchers.push($scope.$parent.$watch($attrs.itemsPerPage, function(value) {
            ctrl.itemsPerPage = parseInt(value, 10);
            $scope.totalPages = ctrl.calculateTotalPages();
            ctrl.updatePage();
          }));
        } else {
          ctrl.itemsPerPage = config.itemsPerPage;
        }

        $scope.$watch('totalItems', function(newTotal, oldTotal) {
          if (angular.isDefined(newTotal) || newTotal !== oldTotal) {
            $scope.totalPages = ctrl.calculateTotalPages();
            ctrl.updatePage();
          }
        });
      };

      ctrl.calculateTotalPages = function() {
        var totalPages = ctrl.itemsPerPage < 1 ? 1 : Math.ceil($scope.totalItems / ctrl.itemsPerPage);
        return Math.max(totalPages || 0, 1);
      };

      ctrl.render = function() {
        $scope.page = parseInt(ctrl.ngModelCtrl.$viewValue, 10) || 1;
      };

      $scope.selectPage = function(page, evt) {
        if (evt) {
          evt.preventDefault();
        }

        var clickAllowed = !$scope.ngDisabled || !evt;
        if (clickAllowed && $scope.page !== page && page > 0 && page <= $scope.totalPages) {
          if (evt && evt.target) {
            evt.target.blur();
          }
          ctrl.ngModelCtrl.$setViewValue(page);
          ctrl.ngModelCtrl.$render();
        }
      };

      $scope.getText = function(key) {
        return $scope[key + 'Text'] || ctrl.config[key + 'Text'];
      };

      $scope.noPrevious = function() {
        return $scope.page === 1;
      };

      $scope.noNext = function() {
        return $scope.page === $scope.totalPages;
      };

      ctrl.updatePage = function() {
        ctrl.setNumPages($scope.$parent, $scope.totalPages); // Readonly variable

        if ($scope.page > $scope.totalPages) {
          $scope.selectPage($scope.totalPages);
        } else {
          ctrl.ngModelCtrl.$render();
        }
      };

      $scope.$on('$destroy', function() {
        while (ctrl._watchers.length) {
          ctrl._watchers.shift()();
        }
      });
    }
  };
}]);

angular.module('ui.bootstrap.pager', ['ui.bootstrap.paging', 'ui.bootstrap.tabindex'])

.controller('UibPagerController', ['$scope', '$attrs', 'uibPaging', 'uibPagerConfig', function($scope, $attrs, uibPaging, uibPagerConfig) {
  $scope.align = angular.isDefined($attrs.align) ? $scope.$parent.$eval($attrs.align) : uibPagerConfig.align;

  uibPaging.create(this, $scope, $attrs);
}])

.constant('uibPagerConfig', {
  itemsPerPage: 10,
  previousText: '« Previous',
  nextText: 'Next »',
  align: true
})

.directive('uibPager', ['uibPagerConfig', function(uibPagerConfig) {
  return {
    scope: {
      totalItems: '=',
      previousText: '@',
      nextText: '@',
      ngDisabled: '='
    },
    require: ['uibPager', '?ngModel'],
    restrict: 'A',
    controller: 'UibPagerController',
    controllerAs: 'pager',
    templateUrl: function(element, attrs) {
      return attrs.templateUrl || 'uib/template/pager/pager.html';
    },
    link: function(scope, element, attrs, ctrls) {
      element.addClass('pager');
      var paginationCtrl = ctrls[0], ngModelCtrl = ctrls[1];

      if (!ngModelCtrl) {
        return; // do nothing if no ng-model
      }

      paginationCtrl.init(ngModelCtrl, uibPagerConfig);
    }
  };
}]);

angular.module('ui.bootstrap.pagination', ['ui.bootstrap.paging', 'ui.bootstrap.tabindex'])
.controller('UibPaginationController', ['$scope', '$attrs', '$parse', 'uibPaging', 'uibPaginationConfig', function($scope, $attrs, $parse, uibPaging, uibPaginationConfig) {
  var ctrl = this;
  // Setup configuration parameters
  var maxSize = angular.isDefined($attrs.maxSize) ? $scope.$parent.$eval($attrs.maxSize) : uibPaginationConfig.maxSize,
    rotate = angular.isDefined($attrs.rotate) ? $scope.$parent.$eval($attrs.rotate) : uibPaginationConfig.rotate,
    forceEllipses = angular.isDefined($attrs.forceEllipses) ? $scope.$parent.$eval($attrs.forceEllipses) : uibPaginationConfig.forceEllipses,
    boundaryLinkNumbers = angular.isDefined($attrs.boundaryLinkNumbers) ? $scope.$parent.$eval($attrs.boundaryLinkNumbers) : uibPaginationConfig.boundaryLinkNumbers,
    pageLabel = angular.isDefined($attrs.pageLabel) ? function(idx) { return $scope.$parent.$eval($attrs.pageLabel, {$page: idx}); } : angular.identity;
  $scope.boundaryLinks = angular.isDefined($attrs.boundaryLinks) ? $scope.$parent.$eval($attrs.boundaryLinks) : uibPaginationConfig.boundaryLinks;
  $scope.directionLinks = angular.isDefined($attrs.directionLinks) ? $scope.$parent.$eval($attrs.directionLinks) : uibPaginationConfig.directionLinks;

  uibPaging.create(this, $scope, $attrs);

  if ($attrs.maxSize) {
    ctrl._watchers.push($scope.$parent.$watch($parse($attrs.maxSize), function(value) {
      maxSize = parseInt(value, 10);
      ctrl.render();
    }));
  }

  // Create page object used in template
  function makePage(number, text, isActive) {
    return {
      number: number,
      text: text,
      active: isActive
    };
  }

  function getPages(currentPage, totalPages) {
    var pages = [];

    // Default page limits
    var startPage = 1, endPage = totalPages;
    var isMaxSized = angular.isDefined(maxSize) && maxSize < totalPages;

    // recompute if maxSize
    if (isMaxSized) {
      if (rotate) {
        // Current page is displayed in the middle of the visible ones
        startPage = Math.max(currentPage - Math.floor(maxSize / 2), 1);
        endPage = startPage + maxSize - 1;

        // Adjust if limit is exceeded
        if (endPage > totalPages) {
          endPage = totalPages;
          startPage = endPage - maxSize + 1;
        }
      } else {
        // Visible pages are paginated with maxSize
        startPage = (Math.ceil(currentPage / maxSize) - 1) * maxSize + 1;

        // Adjust last page if limit is exceeded
        endPage = Math.min(startPage + maxSize - 1, totalPages);
      }
    }

    // Add page number links
    for (var number = startPage; number <= endPage; number++) {
      var page = makePage(number, pageLabel(number), number === currentPage);
      pages.push(page);
    }

    // Add links to move between page sets
    if (isMaxSized && maxSize > 0 && (!rotate || forceEllipses || boundaryLinkNumbers)) {
      if (startPage > 1) {
        if (!boundaryLinkNumbers || startPage > 3) { //need ellipsis for all options unless range is too close to beginning
        var previousPageSet = makePage(startPage - 1, '...', false);
        pages.unshift(previousPageSet);
      }
        if (boundaryLinkNumbers) {
          if (startPage === 3) { //need to replace ellipsis when the buttons would be sequential
            var secondPageLink = makePage(2, '2', false);
            pages.unshift(secondPageLink);
          }
          //add the first page
          var firstPageLink = makePage(1, '1', false);
          pages.unshift(firstPageLink);
        }
      }

      if (endPage < totalPages) {
        if (!boundaryLinkNumbers || endPage < totalPages - 2) { //need ellipsis for all options unless range is too close to end
        var nextPageSet = makePage(endPage + 1, '...', false);
        pages.push(nextPageSet);
      }
        if (boundaryLinkNumbers) {
          if (endPage === totalPages - 2) { //need to replace ellipsis when the buttons would be sequential
            var secondToLastPageLink = makePage(totalPages - 1, totalPages - 1, false);
            pages.push(secondToLastPageLink);
          }
          //add the last page
          var lastPageLink = makePage(totalPages, totalPages, false);
          pages.push(lastPageLink);
        }
      }
    }
    return pages;
  }

  var originalRender = this.render;
  this.render = function() {
    originalRender();
    if ($scope.page > 0 && $scope.page <= $scope.totalPages) {
      $scope.pages = getPages($scope.page, $scope.totalPages);
    }
  };
}])

.constant('uibPaginationConfig', {
  itemsPerPage: 10,
  boundaryLinks: false,
  boundaryLinkNumbers: false,
  directionLinks: true,
  firstText: 'First',
  previousText: 'Previous',
  nextText: 'Next',
  lastText: 'Last',
  rotate: true,
  forceEllipses: false
})

.directive('uibPagination', ['$parse', 'uibPaginationConfig', function($parse, uibPaginationConfig) {
  return {
    scope: {
      totalItems: '=',
      firstText: '@',
      previousText: '@',
      nextText: '@',
      lastText: '@',
      ngDisabled:'='
    },
    require: ['uibPagination', '?ngModel'],
    restrict: 'A',
    controller: 'UibPaginationController',
    controllerAs: 'pagination',
    templateUrl: function(element, attrs) {
      return attrs.templateUrl || 'uib/template/pagination/pagination.html';
    },
    link: function(scope, element, attrs, ctrls) {
      element.addClass('pagination');
      var paginationCtrl = ctrls[0], ngModelCtrl = ctrls[1];

      if (!ngModelCtrl) {
         return; // do nothing if no ng-model
      }

      paginationCtrl.init(ngModelCtrl, uibPaginationConfig);
    }
  };
}]);

/**
 * The following features are still outstanding: animation as a
 * function, placement as a function, inside, support for more triggers than
 * just mouse enter/leave, html tooltips, and selector delegation.
 */
angular.module('ui.bootstrap.tooltip', ['ui.bootstrap.position', 'ui.bootstrap.stackedMap'])

/**
 * The $tooltip service creates tooltip- and popover-like directives as well as
 * houses global options for them.
 */
.provider('$uibTooltip', function() {
  // The default options tooltip and popover.
  var defaultOptions = {
    placement: 'top',
    placementClassPrefix: '',
    animation: true,
    popupDelay: 0,
    popupCloseDelay: 0,
    useContentExp: false
  };

  // Default hide triggers for each show trigger
  var triggerMap = {
    'mouseenter': 'mouseleave',
    'click': 'click',
    'outsideClick': 'outsideClick',
    'focus': 'blur',
    'none': ''
  };

  // The options specified to the provider globally.
  var globalOptions = {};

  /**
   * `options({})` allows global configuration of all tooltips in the
   * application.
   *
   *   var app = angular.module( 'App', ['ui.bootstrap.tooltip'], function( $tooltipProvider ) {
   *     // place tooltips left instead of top by default
   *     $tooltipProvider.options( { placement: 'left' } );
   *   });
   */
	this.options = function(value) {
		angular.extend(globalOptions, value);
	};

  /**
   * This allows you to extend the set of trigger mappings available. E.g.:
   *
   *   $tooltipProvider.setTriggers( { 'openTrigger': 'closeTrigger' } );
   */
  this.setTriggers = function setTriggers(triggers) {
    angular.extend(triggerMap, triggers);
  };

  /**
   * This is a helper function for translating camel-case to snake_case.
   */
  function snake_case(name) {
    var regexp = /[A-Z]/g;
    var separator = '-';
    return name.replace(regexp, function(letter, pos) {
      return (pos ? separator : '') + letter.toLowerCase();
    });
  }

  /**
   * Returns the actual instance of the $tooltip service.
   * TODO support multiple triggers
   */
  this.$get = ['$window', '$compile', '$timeout', '$document', '$uibPosition', '$interpolate', '$rootScope', '$parse', '$$stackedMap', function($window, $compile, $timeout, $document, $position, $interpolate, $rootScope, $parse, $$stackedMap) {
    var openedTooltips = $$stackedMap.createNew();
    $document.on('keyup', keypressListener);

    $rootScope.$on('$destroy', function() {
      $document.off('keyup', keypressListener);
    });

    function keypressListener(e) {
      if (e.which === 27) {
        var last = openedTooltips.top();
        if (last) {
          last.value.close();
          last = null;
        }
      }
    }

    return function $tooltip(ttType, prefix, defaultTriggerShow, options) {
      options = angular.extend({}, defaultOptions, globalOptions, options);

      /**
       * Returns an object of show and hide triggers.
       *
       * If a trigger is supplied,
       * it is used to show the tooltip; otherwise, it will use the `trigger`
       * option passed to the `$tooltipProvider.options` method; else it will
       * default to the trigger supplied to this directive factory.
       *
       * The hide trigger is based on the show trigger. If the `trigger` option
       * was passed to the `$tooltipProvider.options` method, it will use the
       * mapped trigger from `triggerMap` or the passed trigger if the map is
       * undefined; otherwise, it uses the `triggerMap` value of the show
       * trigger; else it will just use the show trigger.
       */
      function getTriggers(trigger) {
        var show = (trigger || options.trigger || defaultTriggerShow).split(' ');
        var hide = show.map(function(trigger) {
          return triggerMap[trigger] || trigger;
        });
        return {
          show: show,
          hide: hide
        };
      }

      var directiveName = snake_case(ttType);

      var startSym = $interpolate.startSymbol();
      var endSym = $interpolate.endSymbol();
      var template =
        '<div '+ directiveName + '-popup ' +
          'uib-title="' + startSym + 'title' + endSym + '" ' +
          (options.useContentExp ?
            'content-exp="contentExp()" ' :
            'content="' + startSym + 'content' + endSym + '" ') +
          'origin-scope="origScope" ' +
          'class="uib-position-measure ' + prefix + '" ' +
          'tooltip-animation-class="fade"' +
          'uib-tooltip-classes ' +
          'ng-class="{ in: isOpen }" ' +
          '>' +
        '</div>';

      return {
        compile: function(tElem, tAttrs) {
          var tooltipLinker = $compile(template);

          return function link(scope, element, attrs, tooltipCtrl) {
            var tooltip;
            var tooltipLinkedScope;
            var transitionTimeout;
            var showTimeout;
            var hideTimeout;
            var positionTimeout;
            var appendToBody = angular.isDefined(options.appendToBody) ? options.appendToBody : false;
            var triggers = getTriggers(undefined);
            var hasEnableExp = angular.isDefined(attrs[prefix + 'Enable']);
            var ttScope = scope.$new(true);
            var repositionScheduled = false;
            var isOpenParse = angular.isDefined(attrs[prefix + 'IsOpen']) ? $parse(attrs[prefix + 'IsOpen']) : false;
            var contentParse = options.useContentExp ? $parse(attrs[ttType]) : false;
            var observers = [];
            var lastPlacement;

            var positionTooltip = function() {
              // check if tooltip exists and is not empty
              if (!tooltip || !tooltip.html()) { return; }

              if (!positionTimeout) {
                positionTimeout = $timeout(function() {
                  var ttPosition = $position.positionElements(element, tooltip, ttScope.placement, appendToBody);
                  var initialHeight = angular.isDefined(tooltip.offsetHeight) ? tooltip.offsetHeight : tooltip.prop('offsetHeight');
                  var elementPos = appendToBody ? $position.offset(element) : $position.position(element);
                  tooltip.css({ top: ttPosition.top + 'px', left: ttPosition.left + 'px' });
                  var placementClasses = ttPosition.placement.split('-');

                  if (!tooltip.hasClass(placementClasses[0])) {
                    tooltip.removeClass(lastPlacement.split('-')[0]);
                    tooltip.addClass(placementClasses[0]);
                  }

                  if (!tooltip.hasClass(options.placementClassPrefix + ttPosition.placement)) {
                    tooltip.removeClass(options.placementClassPrefix + lastPlacement);
                    tooltip.addClass(options.placementClassPrefix + ttPosition.placement);
                  }

                  $timeout(function() {
                    var currentHeight = angular.isDefined(tooltip.offsetHeight) ? tooltip.offsetHeight : tooltip.prop('offsetHeight');
                    var adjustment = $position.adjustTop(placementClasses, elementPos, initialHeight, currentHeight);
                    if (adjustment) {
                      tooltip.css(adjustment);
                    }
                  }, 0, false);

                  // first time through tt element will have the
                  // uib-position-measure class or if the placement
                  // has changed we need to position the arrow.
                  if (tooltip.hasClass('uib-position-measure')) {
                    $position.positionArrow(tooltip, ttPosition.placement);
                    tooltip.removeClass('uib-position-measure');
                  } else if (lastPlacement !== ttPosition.placement) {
                    $position.positionArrow(tooltip, ttPosition.placement);
                  }
                  lastPlacement = ttPosition.placement;

                  positionTimeout = null;
                }, 0, false);
              }
            };

            // Set up the correct scope to allow transclusion later
            ttScope.origScope = scope;

            // By default, the tooltip is not open.
            // TODO add ability to start tooltip opened
            ttScope.isOpen = false;

            function toggleTooltipBind() {
              if (!ttScope.isOpen) {
                showTooltipBind();
              } else {
                hideTooltipBind();
              }
            }

            // Show the tooltip with delay if specified, otherwise show it immediately
            function showTooltipBind() {
              if (hasEnableExp && !scope.$eval(attrs[prefix + 'Enable'])) {
                return;
              }

              cancelHide();
              prepareTooltip();

              if (ttScope.popupDelay) {
                // Do nothing if the tooltip was already scheduled to pop-up.
                // This happens if show is triggered multiple times before any hide is triggered.
                if (!showTimeout) {
                  showTimeout = $timeout(show, ttScope.popupDelay, false);
                }
              } else {
                show();
              }
            }

            function hideTooltipBind() {
              cancelShow();

              if (ttScope.popupCloseDelay) {
                if (!hideTimeout) {
                  hideTimeout = $timeout(hide, ttScope.popupCloseDelay, false);
                }
              } else {
                hide();
              }
            }

            // Show the tooltip popup element.
            function show() {
              cancelShow();
              cancelHide();

              // Don't show empty tooltips.
              if (!ttScope.content) {
                return angular.noop;
              }

              createTooltip();

              // And show the tooltip.
              ttScope.$evalAsync(function() {
                ttScope.isOpen = true;
                assignIsOpen(true);
                positionTooltip();
              });
            }

            function cancelShow() {
              if (showTimeout) {
                $timeout.cancel(showTimeout);
                showTimeout = null;
              }

              if (positionTimeout) {
                $timeout.cancel(positionTimeout);
                positionTimeout = null;
              }
            }

            // Hide the tooltip popup element.
            function hide() {
              if (!ttScope) {
                return;
              }

              // First things first: we don't show it anymore.
              ttScope.$evalAsync(function() {
                if (ttScope) {
                  ttScope.isOpen = false;
                  assignIsOpen(false);
                  // And now we remove it from the DOM. However, if we have animation, we
                  // need to wait for it to expire beforehand.
                  // FIXME: this is a placeholder for a port of the transitions library.
                  // The fade transition in TWBS is 150ms.
                  if (ttScope.animation) {
                    if (!transitionTimeout) {
                      transitionTimeout = $timeout(removeTooltip, 150, false);
                    }
                  } else {
                    removeTooltip();
                  }
                }
              });
            }

            function cancelHide() {
              if (hideTimeout) {
                $timeout.cancel(hideTimeout);
                hideTimeout = null;
              }

              if (transitionTimeout) {
                $timeout.cancel(transitionTimeout);
                transitionTimeout = null;
              }
            }

            function createTooltip() {
              // There can only be one tooltip element per directive shown at once.
              if (tooltip) {
                return;
              }

              tooltipLinkedScope = ttScope.$new();
              tooltip = tooltipLinker(tooltipLinkedScope, function(tooltip) {
                if (appendToBody) {
                  $document.find('body').append(tooltip);
                } else {
                  element.after(tooltip);
                }
              });

              openedTooltips.add(ttScope, {
                close: hide
              });

              prepObservers();
            }

            function removeTooltip() {
              cancelShow();
              cancelHide();
              unregisterObservers();

              if (tooltip) {
                tooltip.remove();
                tooltip = null;
              }

              openedTooltips.remove(ttScope);
              
              if (tooltipLinkedScope) {
                tooltipLinkedScope.$destroy();
                tooltipLinkedScope = null;
              }
            }

            /**
             * Set the initial scope values. Once
             * the tooltip is created, the observers
             * will be added to keep things in sync.
             */
            function prepareTooltip() {
              ttScope.title = attrs[prefix + 'Title'];
              if (contentParse) {
                ttScope.content = contentParse(scope);
              } else {
                ttScope.content = attrs[ttType];
              }

              ttScope.popupClass = attrs[prefix + 'Class'];
              ttScope.placement = angular.isDefined(attrs[prefix + 'Placement']) ? attrs[prefix + 'Placement'] : options.placement;
              var placement = $position.parsePlacement(ttScope.placement);
              lastPlacement = placement[1] ? placement[0] + '-' + placement[1] : placement[0];

              var delay = parseInt(attrs[prefix + 'PopupDelay'], 10);
              var closeDelay = parseInt(attrs[prefix + 'PopupCloseDelay'], 10);
              ttScope.popupDelay = !isNaN(delay) ? delay : options.popupDelay;
              ttScope.popupCloseDelay = !isNaN(closeDelay) ? closeDelay : options.popupCloseDelay;
            }

            function assignIsOpen(isOpen) {
              if (isOpenParse && angular.isFunction(isOpenParse.assign)) {
                isOpenParse.assign(scope, isOpen);
              }
            }

            ttScope.contentExp = function() {
              return ttScope.content;
            };

            /**
             * Observe the relevant attributes.
             */
            attrs.$observe('disabled', function(val) {
              if (val) {
                cancelShow();
              }

              if (val && ttScope.isOpen) {
                hide();
              }
            });

            if (isOpenParse) {
              scope.$watch(isOpenParse, function(val) {
                if (ttScope && !val === ttScope.isOpen) {
                  toggleTooltipBind();
                }
              });
            }

            function prepObservers() {
              observers.length = 0;

              if (contentParse) {
                observers.push(
                  scope.$watch(contentParse, function(val) {
                    ttScope.content = val;
                    if (!val && ttScope.isOpen) {
                      hide();
                    }
                  })
                );

                observers.push(
                  tooltipLinkedScope.$watch(function() {
                    if (!repositionScheduled) {
                      repositionScheduled = true;
                      tooltipLinkedScope.$$postDigest(function() {
                        repositionScheduled = false;
                        if (ttScope && ttScope.isOpen) {
                          positionTooltip();
                        }
                      });
                    }
                  })
                );
              } else {
                observers.push(
                  attrs.$observe(ttType, function(val) {
                    ttScope.content = val;
                    if (!val && ttScope.isOpen) {
                      hide();
                    } else {
                      positionTooltip();
                    }
                  })
                );
              }

              observers.push(
                attrs.$observe(prefix + 'Title', function(val) {
                  ttScope.title = val;
                  if (ttScope.isOpen) {
                    positionTooltip();
                  }
                })
              );

              observers.push(
                attrs.$observe(prefix + 'Placement', function(val) {
                  ttScope.placement = val ? val : options.placement;
                  if (ttScope.isOpen) {
                    positionTooltip();
                  }
                })
              );
            }

            function unregisterObservers() {
              if (observers.length) {
                angular.forEach(observers, function(observer) {
                  observer();
                });
                observers.length = 0;
              }
            }

            // hide tooltips/popovers for outsideClick trigger
            function bodyHideTooltipBind(e) {
              if (!ttScope || !ttScope.isOpen || !tooltip) {
                return;
              }
              // make sure the tooltip/popover link or tool tooltip/popover itself were not clicked
              if (!element[0].contains(e.target) && !tooltip[0].contains(e.target)) {
                hideTooltipBind();
              }
            }

            var unregisterTriggers = function() {
              triggers.show.forEach(function(trigger) {
                if (trigger === 'outsideClick') {
                  element.off('click', toggleTooltipBind);
                } else {
                  element.off(trigger, showTooltipBind);
                  element.off(trigger, toggleTooltipBind);
                }
              });
              triggers.hide.forEach(function(trigger) {
                if (trigger === 'outsideClick') {
                  $document.off('click', bodyHideTooltipBind);
                } else {
                  element.off(trigger, hideTooltipBind);
                }
              });
            };

            function prepTriggers() {
              var showTriggers = [], hideTriggers = [];
              var val = scope.$eval(attrs[prefix + 'Trigger']);
              unregisterTriggers();

              if (angular.isObject(val)) {
                Object.keys(val).forEach(function(key) {
                  showTriggers.push(key);
                  hideTriggers.push(val[key]);
                });
                triggers = {
                  show: showTriggers,
                  hide: hideTriggers
                };
              } else {
                triggers = getTriggers(val);
              }

              if (triggers.show !== 'none') {
                triggers.show.forEach(function(trigger, idx) {
                  if (trigger === 'outsideClick') {
                    element.on('click', toggleTooltipBind);
                    $document.on('click', bodyHideTooltipBind);
                  } else if (trigger === triggers.hide[idx]) {
                    element.on(trigger, toggleTooltipBind);
                  } else if (trigger) {
                    element.on(trigger, showTooltipBind);
                    element.on(triggers.hide[idx], hideTooltipBind);
                  }

                  element.on('keypress', function(e) {
                    if (e.which === 27) {
                      hideTooltipBind();
                    }
                  });
                });
              }
            }

            prepTriggers();

            var animation = scope.$eval(attrs[prefix + 'Animation']);
            ttScope.animation = angular.isDefined(animation) ? !!animation : options.animation;

            var appendToBodyVal;
            var appendKey = prefix + 'AppendToBody';
            if (appendKey in attrs && attrs[appendKey] === undefined) {
              appendToBodyVal = true;
            } else {
              appendToBodyVal = scope.$eval(attrs[appendKey]);
            }

            appendToBody = angular.isDefined(appendToBodyVal) ? appendToBodyVal : appendToBody;

            // Make sure tooltip is destroyed and removed.
            scope.$on('$destroy', function onDestroyTooltip() {
              unregisterTriggers();
              removeTooltip();
              ttScope = null;
            });
          };
        }
      };
    };
  }];
})

// This is mostly ngInclude code but with a custom scope
.directive('uibTooltipTemplateTransclude', [
         '$animate', '$sce', '$compile', '$templateRequest',
function ($animate, $sce, $compile, $templateRequest) {
  return {
    link: function(scope, elem, attrs) {
      var origScope = scope.$eval(attrs.tooltipTemplateTranscludeScope);

      var changeCounter = 0,
        currentScope,
        previousElement,
        currentElement;

      var cleanupLastIncludeContent = function() {
        if (previousElement) {
          previousElement.remove();
          previousElement = null;
        }

        if (currentScope) {
          currentScope.$destroy();
          currentScope = null;
        }

        if (currentElement) {
          $animate.leave(currentElement).then(function() {
            previousElement = null;
          });
          previousElement = currentElement;
          currentElement = null;
        }
      };

      scope.$watch($sce.parseAsResourceUrl(attrs.uibTooltipTemplateTransclude), function(src) {
        var thisChangeId = ++changeCounter;

        if (src) {
          //set the 2nd param to true to ignore the template request error so that the inner
          //contents and scope can be cleaned up.
          $templateRequest(src, true).then(function(response) {
            if (thisChangeId !== changeCounter) { return; }
            var newScope = origScope.$new();
            var template = response;

            var clone = $compile(template)(newScope, function(clone) {
              cleanupLastIncludeContent();
              $animate.enter(clone, elem);
            });

            currentScope = newScope;
            currentElement = clone;

            currentScope.$emit('$includeContentLoaded', src);
          }, function() {
            if (thisChangeId === changeCounter) {
              cleanupLastIncludeContent();
              scope.$emit('$includeContentError', src);
            }
          });
          scope.$emit('$includeContentRequested', src);
        } else {
          cleanupLastIncludeContent();
        }
      });

      scope.$on('$destroy', cleanupLastIncludeContent);
    }
  };
}])

/**
 * Note that it's intentional that these classes are *not* applied through $animate.
 * They must not be animated as they're expected to be present on the tooltip on
 * initialization.
 */
.directive('uibTooltipClasses', ['$uibPosition', function($uibPosition) {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      // need to set the primary position so the
      // arrow has space during position measure.
      // tooltip.positionTooltip()
      if (scope.placement) {
        // // There are no top-left etc... classes
        // // in TWBS, so we need the primary position.
        var position = $uibPosition.parsePlacement(scope.placement);
        element.addClass(position[0]);
      }

      if (scope.popupClass) {
        element.addClass(scope.popupClass);
      }

      if (scope.animation) {
        element.addClass(attrs.tooltipAnimationClass);
      }
    }
  };
}])

.directive('uibTooltipPopup', function() {
  return {
    restrict: 'A',
    scope: { content: '@' },
    templateUrl: 'uib/template/tooltip/tooltip-popup.html'
  };
})

.directive('uibTooltip', [ '$uibTooltip', function($uibTooltip) {
  return $uibTooltip('uibTooltip', 'tooltip', 'mouseenter');
}])

.directive('uibTooltipTemplatePopup', function() {
  return {
    restrict: 'A',
    scope: { contentExp: '&', originScope: '&' },
    templateUrl: 'uib/template/tooltip/tooltip-template-popup.html'
  };
})

.directive('uibTooltipTemplate', ['$uibTooltip', function($uibTooltip) {
  return $uibTooltip('uibTooltipTemplate', 'tooltip', 'mouseenter', {
    useContentExp: true
  });
}])

.directive('uibTooltipHtmlPopup', function() {
  return {
    restrict: 'A',
    scope: { contentExp: '&' },
    templateUrl: 'uib/template/tooltip/tooltip-html-popup.html'
  };
})

.directive('uibTooltipHtml', ['$uibTooltip', function($uibTooltip) {
  return $uibTooltip('uibTooltipHtml', 'tooltip', 'mouseenter', {
    useContentExp: true
  });
}]);

/**
 * The following features are still outstanding: popup delay, animation as a
 * function, placement as a function, inside, support for more triggers than
 * just mouse enter/leave, and selector delegatation.
 */
angular.module('ui.bootstrap.popover', ['ui.bootstrap.tooltip'])

.directive('uibPopoverTemplatePopup', function() {
  return {
    restrict: 'A',
    scope: { uibTitle: '@', contentExp: '&', originScope: '&' },
    templateUrl: 'uib/template/popover/popover-template.html'
  };
})

.directive('uibPopoverTemplate', ['$uibTooltip', function($uibTooltip) {
  return $uibTooltip('uibPopoverTemplate', 'popover', 'click', {
    useContentExp: true
  });
}])

.directive('uibPopoverHtmlPopup', function() {
  return {
    restrict: 'A',
    scope: { contentExp: '&', uibTitle: '@' },
    templateUrl: 'uib/template/popover/popover-html.html'
  };
})

.directive('uibPopoverHtml', ['$uibTooltip', function($uibTooltip) {
  return $uibTooltip('uibPopoverHtml', 'popover', 'click', {
    useContentExp: true
  });
}])

.directive('uibPopoverPopup', function() {
  return {
    restrict: 'A',
    scope: { uibTitle: '@', content: '@' },
    templateUrl: 'uib/template/popover/popover.html'
  };
})

.directive('uibPopover', ['$uibTooltip', function($uibTooltip) {
  return $uibTooltip('uibPopover', 'popover', 'click');
}]);

angular.module('ui.bootstrap.progressbar', [])

.constant('uibProgressConfig', {
  animate: true,
  max: 100
})

.controller('UibProgressController', ['$scope', '$attrs', 'uibProgressConfig', function($scope, $attrs, progressConfig) {
  var self = this,
      animate = angular.isDefined($attrs.animate) ? $scope.$parent.$eval($attrs.animate) : progressConfig.animate;

  this.bars = [];
  $scope.max = getMaxOrDefault();

  this.addBar = function(bar, element, attrs) {
    if (!animate) {
      element.css({'transition': 'none'});
    }

    this.bars.push(bar);

    bar.max = getMaxOrDefault();
    bar.title = attrs && angular.isDefined(attrs.title) ? attrs.title : 'progressbar';

    bar.$watch('value', function(value) {
      bar.recalculatePercentage();
    });

    bar.recalculatePercentage = function() {
      var totalPercentage = self.bars.reduce(function(total, bar) {
        bar.percent = +(100 * bar.value / bar.max).toFixed(2);
        return total + bar.percent;
      }, 0);

      if (totalPercentage > 100) {
        bar.percent -= totalPercentage - 100;
      }
    };

    bar.$on('$destroy', function() {
      element = null;
      self.removeBar(bar);
    });
  };

  this.removeBar = function(bar) {
    this.bars.splice(this.bars.indexOf(bar), 1);
    this.bars.forEach(function (bar) {
      bar.recalculatePercentage();
    });
  };

  //$attrs.$observe('maxParam', function(maxParam) {
  $scope.$watch('maxParam', function(maxParam) {
    self.bars.forEach(function(bar) {
      bar.max = getMaxOrDefault();
      bar.recalculatePercentage();
    });
  });

  function getMaxOrDefault () {
    return angular.isDefined($scope.maxParam) ? $scope.maxParam : progressConfig.max;
  }
}])

.directive('uibProgress', function() {
  return {
    replace: true,
    transclude: true,
    controller: 'UibProgressController',
    require: 'uibProgress',
    scope: {
      maxParam: '=?max'
    },
    templateUrl: 'uib/template/progressbar/progress.html'
  };
})

.directive('uibBar', function() {
  return {
    replace: true,
    transclude: true,
    require: '^uibProgress',
    scope: {
      value: '=',
      type: '@'
    },
    templateUrl: 'uib/template/progressbar/bar.html',
    link: function(scope, element, attrs, progressCtrl) {
      progressCtrl.addBar(scope, element, attrs);
    }
  };
})

.directive('uibProgressbar', function() {
  return {
    replace: true,
    transclude: true,
    controller: 'UibProgressController',
    scope: {
      value: '=',
      maxParam: '=?max',
      type: '@'
    },
    templateUrl: 'uib/template/progressbar/progressbar.html',
    link: function(scope, element, attrs, progressCtrl) {
      progressCtrl.addBar(scope, angular.element(element.children()[0]), {title: attrs.title});
    }
  };
});

angular.module('ui.bootstrap.rating', [])

.constant('uibRatingConfig', {
  max: 5,
  stateOn: null,
  stateOff: null,
  enableReset: true,
  titles: ['one', 'two', 'three', 'four', 'five']
})

.controller('UibRatingController', ['$scope', '$attrs', 'uibRatingConfig', function($scope, $attrs, ratingConfig) {
  var ngModelCtrl = { $setViewValue: angular.noop },
    self = this;

  this.init = function(ngModelCtrl_) {
    ngModelCtrl = ngModelCtrl_;
    ngModelCtrl.$render = this.render;

    ngModelCtrl.$formatters.push(function(value) {
      if (angular.isNumber(value) && value << 0 !== value) {
        value = Math.round(value);
      }

      return value;
    });

    this.stateOn = angular.isDefined($attrs.stateOn) ? $scope.$parent.$eval($attrs.stateOn) : ratingConfig.stateOn;
    this.stateOff = angular.isDefined($attrs.stateOff) ? $scope.$parent.$eval($attrs.stateOff) : ratingConfig.stateOff;
    this.enableReset = angular.isDefined($attrs.enableReset) ?
      $scope.$parent.$eval($attrs.enableReset) : ratingConfig.enableReset;
    var tmpTitles = angular.isDefined($attrs.titles) ? $scope.$parent.$eval($attrs.titles) : ratingConfig.titles;
    this.titles = angular.isArray(tmpTitles) && tmpTitles.length > 0 ?
      tmpTitles : ratingConfig.titles;

    var ratingStates = angular.isDefined($attrs.ratingStates) ?
      $scope.$parent.$eval($attrs.ratingStates) :
      new Array(angular.isDefined($attrs.max) ? $scope.$parent.$eval($attrs.max) : ratingConfig.max);
    $scope.range = this.buildTemplateObjects(ratingStates);
  };

  this.buildTemplateObjects = function(states) {
    for (var i = 0, n = states.length; i < n; i++) {
      states[i] = angular.extend({ index: i }, { stateOn: this.stateOn, stateOff: this.stateOff, title: this.getTitle(i) }, states[i]);
    }
    return states;
  };

  this.getTitle = function(index) {
    if (index >= this.titles.length) {
      return index + 1;
    }

    return this.titles[index];
  };

  $scope.rate = function(value) {
    if (!$scope.readonly && value >= 0 && value <= $scope.range.length) {
      var newViewValue = self.enableReset && ngModelCtrl.$viewValue === value ? 0 : value;
      ngModelCtrl.$setViewValue(newViewValue);
      ngModelCtrl.$render();
    }
  };

  $scope.enter = function(value) {
    if (!$scope.readonly) {
      $scope.value = value;
    }
    $scope.onHover({value: value});
  };

  $scope.reset = function() {
    $scope.value = ngModelCtrl.$viewValue;
    $scope.onLeave();
  };

  $scope.onKeydown = function(evt) {
    if (/(37|38|39|40)/.test(evt.which)) {
      evt.preventDefault();
      evt.stopPropagation();
      $scope.rate($scope.value + (evt.which === 38 || evt.which === 39 ? 1 : -1));
    }
  };

  this.render = function() {
    $scope.value = ngModelCtrl.$viewValue;
    $scope.title = self.getTitle($scope.value - 1);
  };
}])

.directive('uibRating', function() {
  return {
    require: ['uibRating', 'ngModel'],
    restrict: 'A',
    scope: {
      readonly: '=?readOnly',
      onHover: '&',
      onLeave: '&'
    },
    controller: 'UibRatingController',
    templateUrl: 'uib/template/rating/rating.html',
    link: function(scope, element, attrs, ctrls) {
      var ratingCtrl = ctrls[0], ngModelCtrl = ctrls[1];
      ratingCtrl.init(ngModelCtrl);
    }
  };
});

angular.module('ui.bootstrap.tabs', [])

.controller('UibTabsetController', ['$scope', function ($scope) {
  var ctrl = this,
    oldIndex;
  ctrl.tabs = [];

  ctrl.select = function(index, evt) {
    if (!destroyed) {
      var previousIndex = findTabIndex(oldIndex);
      var previousSelected = ctrl.tabs[previousIndex];
      if (previousSelected) {
        previousSelected.tab.onDeselect({
          $event: evt,
          $selectedIndex: index
        });
        if (evt && evt.isDefaultPrevented()) {
          return;
        }
        previousSelected.tab.active = false;
      }

      var selected = ctrl.tabs[index];
      if (selected) {
        selected.tab.onSelect({
          $event: evt
        });
        selected.tab.active = true;
        ctrl.active = selected.index;
        oldIndex = selected.index;
      } else if (!selected && angular.isDefined(oldIndex)) {
        ctrl.active = null;
        oldIndex = null;
      }
    }
  };

  ctrl.addTab = function addTab(tab) {
    ctrl.tabs.push({
      tab: tab,
      index: tab.index
    });
    ctrl.tabs.sort(function(t1, t2) {
      if (t1.index > t2.index) {
        return 1;
      }

      if (t1.index < t2.index) {
        return -1;
      }

      return 0;
    });

    if (tab.index === ctrl.active || !angular.isDefined(ctrl.active) && ctrl.tabs.length === 1) {
      var newActiveIndex = findTabIndex(tab.index);
      ctrl.select(newActiveIndex);
    }
  };

  ctrl.removeTab = function removeTab(tab) {
    var index;
    for (var i = 0; i < ctrl.tabs.length; i++) {
      if (ctrl.tabs[i].tab === tab) {
        index = i;
        break;
      }
    }

    if (ctrl.tabs[index].index === ctrl.active) {
      var newActiveTabIndex = index === ctrl.tabs.length - 1 ?
        index - 1 : index + 1 % ctrl.tabs.length;
      ctrl.select(newActiveTabIndex);
    }

    ctrl.tabs.splice(index, 1);
  };

  $scope.$watch('tabset.active', function(val) {
    if (angular.isDefined(val) && val !== oldIndex) {
      ctrl.select(findTabIndex(val));
    }
  });

  var destroyed;
  $scope.$on('$destroy', function() {
    destroyed = true;
  });

  function findTabIndex(index) {
    for (var i = 0; i < ctrl.tabs.length; i++) {
      if (ctrl.tabs[i].index === index) {
        return i;
      }
    }
  }
}])

.directive('uibTabset', function() {
  return {
    transclude: true,
    replace: true,
    scope: {},
    bindToController: {
      active: '=?',
      type: '@'
    },
    controller: 'UibTabsetController',
    controllerAs: 'tabset',
    templateUrl: function(element, attrs) {
      return attrs.templateUrl || 'uib/template/tabs/tabset.html';
    },
    link: function(scope, element, attrs) {
      scope.vertical = angular.isDefined(attrs.vertical) ?
        scope.$parent.$eval(attrs.vertical) : false;
      scope.justified = angular.isDefined(attrs.justified) ?
        scope.$parent.$eval(attrs.justified) : false;
    }
  };
})

.directive('uibTab', ['$parse', function($parse) {
  return {
    require: '^uibTabset',
    replace: true,
    templateUrl: function(element, attrs) {
      return attrs.templateUrl || 'uib/template/tabs/tab.html';
    },
    transclude: true,
    scope: {
      heading: '@',
      index: '=?',
      classes: '@?',
      onSelect: '&select', //This callback is called in contentHeadingTransclude
                          //once it inserts the tab's content into the dom
      onDeselect: '&deselect'
    },
    controller: function() {
      //Empty controller so other directives can require being 'under' a tab
    },
    controllerAs: 'tab',
    link: function(scope, elm, attrs, tabsetCtrl, transclude) {
      scope.disabled = false;
      if (attrs.disable) {
        scope.$parent.$watch($parse(attrs.disable), function(value) {
          scope.disabled = !! value;
        });
      }

      if (angular.isUndefined(attrs.index)) {
        if (tabsetCtrl.tabs && tabsetCtrl.tabs.length) {
          scope.index = Math.max.apply(null, tabsetCtrl.tabs.map(function(t) { return t.index; })) + 1;
        } else {
          scope.index = 0;
        }
      }

      if (angular.isUndefined(attrs.classes)) {
        scope.classes = '';
      }

      scope.select = function(evt) {
        if (!scope.disabled) {
          var index;
          for (var i = 0; i < tabsetCtrl.tabs.length; i++) {
            if (tabsetCtrl.tabs[i].tab === scope) {
              index = i;
              break;
            }
          }

          tabsetCtrl.select(index, evt);
        }
      };

      tabsetCtrl.addTab(scope);
      scope.$on('$destroy', function() {
        tabsetCtrl.removeTab(scope);
      });

      //We need to transclude later, once the content container is ready.
      //when this link happens, we're inside a tab heading.
      scope.$transcludeFn = transclude;
    }
  };
}])

.directive('uibTabHeadingTransclude', function() {
  return {
    restrict: 'A',
    require: '^uibTab',
    link: function(scope, elm) {
      scope.$watch('headingElement', function updateHeadingElement(heading) {
        if (heading) {
          elm.html('');
          elm.append(heading);
        }
      });
    }
  };
})

.directive('uibTabContentTransclude', function() {
  return {
    restrict: 'A',
    require: '^uibTabset',
    link: function(scope, elm, attrs) {
      var tab = scope.$eval(attrs.uibTabContentTransclude).tab;

      //Now our tab is ready to be transcluded: both the tab heading area
      //and the tab content area are loaded.  Transclude 'em both.
      tab.$transcludeFn(tab.$parent, function(contents) {
        angular.forEach(contents, function(node) {
          if (isTabHeading(node)) {
            //Let tabHeadingTransclude know.
            tab.headingElement = node;
          } else {
            elm.append(node);
          }
        });
      });
    }
  };

  function isTabHeading(node) {
    return node.tagName && (
      node.hasAttribute('uib-tab-heading') ||
      node.hasAttribute('data-uib-tab-heading') ||
      node.hasAttribute('x-uib-tab-heading') ||
      node.tagName.toLowerCase() === 'uib-tab-heading' ||
      node.tagName.toLowerCase() === 'data-uib-tab-heading' ||
      node.tagName.toLowerCase() === 'x-uib-tab-heading' ||
      node.tagName.toLowerCase() === 'uib:tab-heading'
    );
  }
});

angular.module('ui.bootstrap.timepicker', [])

.constant('uibTimepickerConfig', {
  hourStep: 1,
  minuteStep: 1,
  secondStep: 1,
  showMeridian: true,
  showSeconds: false,
  meridians: null,
  readonlyInput: false,
  mousewheel: true,
  arrowkeys: true,
  showSpinners: true,
  templateUrl: 'uib/template/timepicker/timepicker.html'
})

.controller('UibTimepickerController', ['$scope', '$element', '$attrs', '$parse', '$log', '$locale', 'uibTimepickerConfig', function($scope, $element, $attrs, $parse, $log, $locale, timepickerConfig) {
  var selected = new Date(),
    watchers = [],
    ngModelCtrl = { $setViewValue: angular.noop }, // nullModelCtrl
    meridians = angular.isDefined($attrs.meridians) ? $scope.$parent.$eval($attrs.meridians) : timepickerConfig.meridians || $locale.DATETIME_FORMATS.AMPMS,
    padHours = angular.isDefined($attrs.padHours) ? $scope.$parent.$eval($attrs.padHours) : true;

  $scope.tabindex = angular.isDefined($attrs.tabindex) ? $attrs.tabindex : 0;
  $element.removeAttr('tabindex');

  this.init = function(ngModelCtrl_, inputs) {
    ngModelCtrl = ngModelCtrl_;
    ngModelCtrl.$render = this.render;

    ngModelCtrl.$formatters.unshift(function(modelValue) {
      return modelValue ? new Date(modelValue) : null;
    });

    var hoursInputEl = inputs.eq(0),
        minutesInputEl = inputs.eq(1),
        secondsInputEl = inputs.eq(2);

    var mousewheel = angular.isDefined($attrs.mousewheel) ? $scope.$parent.$eval($attrs.mousewheel) : timepickerConfig.mousewheel;

    if (mousewheel) {
      this.setupMousewheelEvents(hoursInputEl, minutesInputEl, secondsInputEl);
    }

    var arrowkeys = angular.isDefined($attrs.arrowkeys) ? $scope.$parent.$eval($attrs.arrowkeys) : timepickerConfig.arrowkeys;
    if (arrowkeys) {
      this.setupArrowkeyEvents(hoursInputEl, minutesInputEl, secondsInputEl);
    }

    $scope.readonlyInput = angular.isDefined($attrs.readonlyInput) ? $scope.$parent.$eval($attrs.readonlyInput) : timepickerConfig.readonlyInput;
    this.setupInputEvents(hoursInputEl, minutesInputEl, secondsInputEl);
  };

  var hourStep = timepickerConfig.hourStep;
  if ($attrs.hourStep) {
    watchers.push($scope.$parent.$watch($parse($attrs.hourStep), function(value) {
      hourStep = +value;
    }));
  }

  var minuteStep = timepickerConfig.minuteStep;
  if ($attrs.minuteStep) {
    watchers.push($scope.$parent.$watch($parse($attrs.minuteStep), function(value) {
      minuteStep = +value;
    }));
  }

  var min;
  watchers.push($scope.$parent.$watch($parse($attrs.min), function(value) {
    var dt = new Date(value);
    min = isNaN(dt) ? undefined : dt;
  }));

  var max;
  watchers.push($scope.$parent.$watch($parse($attrs.max), function(value) {
    var dt = new Date(value);
    max = isNaN(dt) ? undefined : dt;
  }));

  var disabled = false;
  if ($attrs.ngDisabled) {
    watchers.push($scope.$parent.$watch($parse($attrs.ngDisabled), function(value) {
      disabled = value;
    }));
  }

  $scope.noIncrementHours = function() {
    var incrementedSelected = addMinutes(selected, hourStep * 60);
    return disabled || incrementedSelected > max ||
      incrementedSelected < selected && incrementedSelected < min;
  };

  $scope.noDecrementHours = function() {
    var decrementedSelected = addMinutes(selected, -hourStep * 60);
    return disabled || decrementedSelected < min ||
      decrementedSelected > selected && decrementedSelected > max;
  };

  $scope.noIncrementMinutes = function() {
    var incrementedSelected = addMinutes(selected, minuteStep);
    return disabled || incrementedSelected > max ||
      incrementedSelected < selected && incrementedSelected < min;
  };

  $scope.noDecrementMinutes = function() {
    var decrementedSelected = addMinutes(selected, -minuteStep);
    return disabled || decrementedSelected < min ||
      decrementedSelected > selected && decrementedSelected > max;
  };

  $scope.noIncrementSeconds = function() {
    var incrementedSelected = addSeconds(selected, secondStep);
    return disabled || incrementedSelected > max ||
      incrementedSelected < selected && incrementedSelected < min;
  };

  $scope.noDecrementSeconds = function() {
    var decrementedSelected = addSeconds(selected, -secondStep);
    return disabled || decrementedSelected < min ||
      decrementedSelected > selected && decrementedSelected > max;
  };

  $scope.noToggleMeridian = function() {
    if (selected.getHours() < 12) {
      return disabled || addMinutes(selected, 12 * 60) > max;
    }

    return disabled || addMinutes(selected, -12 * 60) < min;
  };

  var secondStep = timepickerConfig.secondStep;
  if ($attrs.secondStep) {
    watchers.push($scope.$parent.$watch($parse($attrs.secondStep), function(value) {
      secondStep = +value;
    }));
  }

  $scope.showSeconds = timepickerConfig.showSeconds;
  if ($attrs.showSeconds) {
    watchers.push($scope.$parent.$watch($parse($attrs.showSeconds), function(value) {
      $scope.showSeconds = !!value;
    }));
  }

  // 12H / 24H mode
  $scope.showMeridian = timepickerConfig.showMeridian;
  if ($attrs.showMeridian) {
    watchers.push($scope.$parent.$watch($parse($attrs.showMeridian), function(value) {
      $scope.showMeridian = !!value;

      if (ngModelCtrl.$error.time) {
        // Evaluate from template
        var hours = getHoursFromTemplate(), minutes = getMinutesFromTemplate();
        if (angular.isDefined(hours) && angular.isDefined(minutes)) {
          selected.setHours(hours);
          refresh();
        }
      } else {
        updateTemplate();
      }
    }));
  }

  // Get $scope.hours in 24H mode if valid
  function getHoursFromTemplate() {
    var hours = +$scope.hours;
    var valid = $scope.showMeridian ? hours > 0 && hours < 13 :
      hours >= 0 && hours < 24;
    if (!valid || $scope.hours === '') {
      return undefined;
    }

    if ($scope.showMeridian) {
      if (hours === 12) {
        hours = 0;
      }
      if ($scope.meridian === meridians[1]) {
        hours = hours + 12;
      }
    }
    return hours;
  }

  function getMinutesFromTemplate() {
    var minutes = +$scope.minutes;
    var valid = minutes >= 0 && minutes < 60;
    if (!valid || $scope.minutes === '') {
      return undefined;
    }
    return minutes;
  }

  function getSecondsFromTemplate() {
    var seconds = +$scope.seconds;
    return seconds >= 0 && seconds < 60 ? seconds : undefined;
  }

  function pad(value, noPad) {
    if (value === null) {
      return '';
    }

    return angular.isDefined(value) && value.toString().length < 2 && !noPad ?
      '0' + value : value.toString();
  }

  // Respond on mousewheel spin
  this.setupMousewheelEvents = function(hoursInputEl, minutesInputEl, secondsInputEl) {
    var isScrollingUp = function(e) {
      if (e.originalEvent) {
        e = e.originalEvent;
      }
      //pick correct delta variable depending on event
      var delta = e.wheelDelta ? e.wheelDelta : -e.deltaY;
      return e.detail || delta > 0;
    };

    hoursInputEl.bind('mousewheel wheel', function(e) {
      if (!disabled) {
        $scope.$apply(isScrollingUp(e) ? $scope.incrementHours() : $scope.decrementHours());
      }
      e.preventDefault();
    });

    minutesInputEl.bind('mousewheel wheel', function(e) {
      if (!disabled) {
        $scope.$apply(isScrollingUp(e) ? $scope.incrementMinutes() : $scope.decrementMinutes());
      }
      e.preventDefault();
    });

     secondsInputEl.bind('mousewheel wheel', function(e) {
      if (!disabled) {
        $scope.$apply(isScrollingUp(e) ? $scope.incrementSeconds() : $scope.decrementSeconds());
      }
      e.preventDefault();
    });
  };

  // Respond on up/down arrowkeys
  this.setupArrowkeyEvents = function(hoursInputEl, minutesInputEl, secondsInputEl) {
    hoursInputEl.bind('keydown', function(e) {
      if (!disabled) {
        if (e.which === 38) { // up
          e.preventDefault();
          $scope.incrementHours();
          $scope.$apply();
        } else if (e.which === 40) { // down
          e.preventDefault();
          $scope.decrementHours();
          $scope.$apply();
        }
      }
    });

    minutesInputEl.bind('keydown', function(e) {
      if (!disabled) {
        if (e.which === 38) { // up
          e.preventDefault();
          $scope.incrementMinutes();
          $scope.$apply();
        } else if (e.which === 40) { // down
          e.preventDefault();
          $scope.decrementMinutes();
          $scope.$apply();
        }
      }
    });

    secondsInputEl.bind('keydown', function(e) {
      if (!disabled) {
        if (e.which === 38) { // up
          e.preventDefault();
          $scope.incrementSeconds();
          $scope.$apply();
        } else if (e.which === 40) { // down
          e.preventDefault();
          $scope.decrementSeconds();
          $scope.$apply();
        }
      }
    });
  };

  this.setupInputEvents = function(hoursInputEl, minutesInputEl, secondsInputEl) {
    if ($scope.readonlyInput) {
      $scope.updateHours = angular.noop;
      $scope.updateMinutes = angular.noop;
      $scope.updateSeconds = angular.noop;
      return;
    }

    var invalidate = function(invalidHours, invalidMinutes, invalidSeconds) {
      ngModelCtrl.$setViewValue(null);
      ngModelCtrl.$setValidity('time', false);
      if (angular.isDefined(invalidHours)) {
        $scope.invalidHours = invalidHours;
      }

      if (angular.isDefined(invalidMinutes)) {
        $scope.invalidMinutes = invalidMinutes;
      }

      if (angular.isDefined(invalidSeconds)) {
        $scope.invalidSeconds = invalidSeconds;
      }
    };

    $scope.updateHours = function() {
      var hours = getHoursFromTemplate(),
        minutes = getMinutesFromTemplate();

      ngModelCtrl.$setDirty();

      if (angular.isDefined(hours) && angular.isDefined(minutes)) {
        selected.setHours(hours);
        selected.setMinutes(minutes);
        if (selected < min || selected > max) {
          invalidate(true);
        } else {
          refresh('h');
        }
      } else {
        invalidate(true);
      }
    };

    hoursInputEl.bind('blur', function(e) {
      ngModelCtrl.$setTouched();
      if (modelIsEmpty()) {
        makeValid();
      } else if ($scope.hours === null || $scope.hours === '') {
        invalidate(true);
      } else if (!$scope.invalidHours && $scope.hours < 10) {
        $scope.$apply(function() {
          $scope.hours = pad($scope.hours, !padHours);
        });
      }
    });

    $scope.updateMinutes = function() {
      var minutes = getMinutesFromTemplate(),
        hours = getHoursFromTemplate();

      ngModelCtrl.$setDirty();

      if (angular.isDefined(minutes) && angular.isDefined(hours)) {
        selected.setHours(hours);
        selected.setMinutes(minutes);
        if (selected < min || selected > max) {
          invalidate(undefined, true);
        } else {
          refresh('m');
        }
      } else {
        invalidate(undefined, true);
      }
    };

    minutesInputEl.bind('blur', function(e) {
      ngModelCtrl.$setTouched();
      if (modelIsEmpty()) {
        makeValid();
      } else if ($scope.minutes === null) {
        invalidate(undefined, true);
      } else if (!$scope.invalidMinutes && $scope.minutes < 10) {
        $scope.$apply(function() {
          $scope.minutes = pad($scope.minutes);
        });
      }
    });

    $scope.updateSeconds = function() {
      var seconds = getSecondsFromTemplate();

      ngModelCtrl.$setDirty();

      if (angular.isDefined(seconds)) {
        selected.setSeconds(seconds);
        refresh('s');
      } else {
        invalidate(undefined, undefined, true);
      }
    };

    secondsInputEl.bind('blur', function(e) {
      if (modelIsEmpty()) {
        makeValid();
      } else if (!$scope.invalidSeconds && $scope.seconds < 10) {
        $scope.$apply( function() {
          $scope.seconds = pad($scope.seconds);
        });
      }
    });

  };

  this.render = function() {
    var date = ngModelCtrl.$viewValue;

    if (isNaN(date)) {
      ngModelCtrl.$setValidity('time', false);
      $log.error('Timepicker directive: "ng-model" value must be a Date object, a number of milliseconds since 01.01.1970 or a string representing an RFC2822 or ISO 8601 date.');
    } else {
      if (date) {
        selected = date;
      }

      if (selected < min || selected > max) {
        ngModelCtrl.$setValidity('time', false);
        $scope.invalidHours = true;
        $scope.invalidMinutes = true;
      } else {
        makeValid();
      }
      updateTemplate();
    }
  };

  // Call internally when we know that model is valid.
  function refresh(keyboardChange) {
    makeValid();
    ngModelCtrl.$setViewValue(new Date(selected));
    updateTemplate(keyboardChange);
  }

  function makeValid() {
    ngModelCtrl.$setValidity('time', true);
    $scope.invalidHours = false;
    $scope.invalidMinutes = false;
    $scope.invalidSeconds = false;
  }

  function updateTemplate(keyboardChange) {
    if (!ngModelCtrl.$modelValue) {
      $scope.hours = null;
      $scope.minutes = null;
      $scope.seconds = null;
      $scope.meridian = meridians[0];
    } else {
      var hours = selected.getHours(),
        minutes = selected.getMinutes(),
        seconds = selected.getSeconds();

      if ($scope.showMeridian) {
        hours = hours === 0 || hours === 12 ? 12 : hours % 12; // Convert 24 to 12 hour system
      }

      $scope.hours = keyboardChange === 'h' ? hours : pad(hours, !padHours);
      if (keyboardChange !== 'm') {
        $scope.minutes = pad(minutes);
      }
      $scope.meridian = selected.getHours() < 12 ? meridians[0] : meridians[1];

      if (keyboardChange !== 's') {
        $scope.seconds = pad(seconds);
      }
      $scope.meridian = selected.getHours() < 12 ? meridians[0] : meridians[1];
    }
  }

  function addSecondsToSelected(seconds) {
    selected = addSeconds(selected, seconds);
    refresh();
  }

  function addMinutes(selected, minutes) {
    return addSeconds(selected, minutes*60);
  }

  function addSeconds(date, seconds) {
    var dt = new Date(date.getTime() + seconds * 1000);
    var newDate = new Date(date);
    newDate.setHours(dt.getHours(), dt.getMinutes(), dt.getSeconds());
    return newDate;
  }

  function modelIsEmpty() {
    return ($scope.hours === null || $scope.hours === '') &&
      ($scope.minutes === null || $scope.minutes === '') &&
      (!$scope.showSeconds || $scope.showSeconds && ($scope.seconds === null || $scope.seconds === ''));
  }

  $scope.showSpinners = angular.isDefined($attrs.showSpinners) ?
    $scope.$parent.$eval($attrs.showSpinners) : timepickerConfig.showSpinners;

  $scope.incrementHours = function() {
    if (!$scope.noIncrementHours()) {
      addSecondsToSelected(hourStep * 60 * 60);
    }
  };

  $scope.decrementHours = function() {
    if (!$scope.noDecrementHours()) {
      addSecondsToSelected(-hourStep * 60 * 60);
    }
  };

  $scope.incrementMinutes = function() {
    if (!$scope.noIncrementMinutes()) {
      addSecondsToSelected(minuteStep * 60);
    }
  };

  $scope.decrementMinutes = function() {
    if (!$scope.noDecrementMinutes()) {
      addSecondsToSelected(-minuteStep * 60);
    }
  };

  $scope.incrementSeconds = function() {
    if (!$scope.noIncrementSeconds()) {
      addSecondsToSelected(secondStep);
    }
  };

  $scope.decrementSeconds = function() {
    if (!$scope.noDecrementSeconds()) {
      addSecondsToSelected(-secondStep);
    }
  };

  $scope.toggleMeridian = function() {
    var minutes = getMinutesFromTemplate(),
        hours = getHoursFromTemplate();

    if (!$scope.noToggleMeridian()) {
      if (angular.isDefined(minutes) && angular.isDefined(hours)) {
        addSecondsToSelected(12 * 60 * (selected.getHours() < 12 ? 60 : -60));
      } else {
        $scope.meridian = $scope.meridian === meridians[0] ? meridians[1] : meridians[0];
      }
    }
  };

  $scope.blur = function() {
    ngModelCtrl.$setTouched();
  };

  $scope.$on('$destroy', function() {
    while (watchers.length) {
      watchers.shift()();
    }
  });
}])

.directive('uibTimepicker', ['uibTimepickerConfig', function(uibTimepickerConfig) {
  return {
    require: ['uibTimepicker', '?^ngModel'],
    restrict: 'A',
    controller: 'UibTimepickerController',
    controllerAs: 'timepicker',
    scope: {},
    templateUrl: function(element, attrs) {
      return attrs.templateUrl || uibTimepickerConfig.templateUrl;
    },
    link: function(scope, element, attrs, ctrls) {
      var timepickerCtrl = ctrls[0], ngModelCtrl = ctrls[1];

      if (ngModelCtrl) {
        timepickerCtrl.init(ngModelCtrl, element.find('input'));
      }
    }
  };
}]);

angular.module('ui.bootstrap.typeahead', ['ui.bootstrap.debounce', 'ui.bootstrap.position'])

/**
 * A helper service that can parse typeahead's syntax (string provided by users)
 * Extracted to a separate service for ease of unit testing
 */
  .factory('uibTypeaheadParser', ['$parse', function($parse) {
    //                      000001111111100000000000002222222200000000000000003333333333333330000000000044444444000
    var TYPEAHEAD_REGEXP = /^\s*([\s\S]+?)(?:\s+as\s+([\s\S]+?))?\s+for\s+(?:([\$\w][\$\w\d]*))\s+in\s+([\s\S]+?)$/;
    return {
      parse: function(input) {
        var match = input.match(TYPEAHEAD_REGEXP);
        if (!match) {
          throw new Error(
            'Expected typeahead specification in form of "_modelValue_ (as _label_)? for _item_ in _collection_"' +
              ' but got "' + input + '".');
        }

        return {
          itemName: match[3],
          source: $parse(match[4]),
          viewMapper: $parse(match[2] || match[1]),
          modelMapper: $parse(match[1])
        };
      }
    };
  }])

  .controller('UibTypeaheadController', ['$scope', '$element', '$attrs', '$compile', '$parse', '$q', '$timeout', '$document', '$window', '$rootScope', '$$debounce', '$uibPosition', 'uibTypeaheadParser',
    function(originalScope, element, attrs, $compile, $parse, $q, $timeout, $document, $window, $rootScope, $$debounce, $position, typeaheadParser) {
    var HOT_KEYS = [9, 13, 27, 38, 40];
    var eventDebounceTime = 200;
    var modelCtrl, ngModelOptions;
    //SUPPORTED ATTRIBUTES (OPTIONS)

    //minimal no of characters that needs to be entered before typeahead kicks-in
    var minLength = originalScope.$eval(attrs.typeaheadMinLength);
    if (!minLength && minLength !== 0) {
      minLength = 1;
    }

    originalScope.$watch(attrs.typeaheadMinLength, function (newVal) {
        minLength = !newVal && newVal !== 0 ? 1 : newVal;
    });

    //minimal wait time after last character typed before typeahead kicks-in
    var waitTime = originalScope.$eval(attrs.typeaheadWaitMs) || 0;

    //should it restrict model values to the ones selected from the popup only?
    var isEditable = originalScope.$eval(attrs.typeaheadEditable) !== false;
    originalScope.$watch(attrs.typeaheadEditable, function (newVal) {
      isEditable = newVal !== false;
    });

    //binding to a variable that indicates if matches are being retrieved asynchronously
    var isLoadingSetter = $parse(attrs.typeaheadLoading).assign || angular.noop;

    //a function to determine if an event should cause selection
    var isSelectEvent = attrs.typeaheadShouldSelect ? $parse(attrs.typeaheadShouldSelect) : function(scope, vals) {
      var evt = vals.$event;
      return evt.which === 13 || evt.which === 9;
    };

    //a callback executed when a match is selected
    var onSelectCallback = $parse(attrs.typeaheadOnSelect);

    //should it select highlighted popup value when losing focus?
    var isSelectOnBlur = angular.isDefined(attrs.typeaheadSelectOnBlur) ? originalScope.$eval(attrs.typeaheadSelectOnBlur) : false;

    //binding to a variable that indicates if there were no results after the query is completed
    var isNoResultsSetter = $parse(attrs.typeaheadNoResults).assign || angular.noop;

    var inputFormatter = attrs.typeaheadInputFormatter ? $parse(attrs.typeaheadInputFormatter) : undefined;

    var appendToBody = attrs.typeaheadAppendToBody ? originalScope.$eval(attrs.typeaheadAppendToBody) : false;

    var appendTo = attrs.typeaheadAppendTo ?
      originalScope.$eval(attrs.typeaheadAppendTo) : null;

    var focusFirst = originalScope.$eval(attrs.typeaheadFocusFirst) !== false;

    //If input matches an item of the list exactly, select it automatically
    var selectOnExact = attrs.typeaheadSelectOnExact ? originalScope.$eval(attrs.typeaheadSelectOnExact) : false;

    //binding to a variable that indicates if dropdown is open
    var isOpenSetter = $parse(attrs.typeaheadIsOpen).assign || angular.noop;

    var showHint = originalScope.$eval(attrs.typeaheadShowHint) || false;

    //INTERNAL VARIABLES

    //model setter executed upon match selection
    var parsedModel = $parse(attrs.ngModel);
    var invokeModelSetter = $parse(attrs.ngModel + '($$$p)');
    var $setModelValue = function(scope, newValue) {
      if (angular.isFunction(parsedModel(originalScope)) &&
        ngModelOptions && ngModelOptions.$options && ngModelOptions.$options.getterSetter) {
        return invokeModelSetter(scope, {$$$p: newValue});
      }

      return parsedModel.assign(scope, newValue);
    };

    //expressions used by typeahead
    var parserResult = typeaheadParser.parse(attrs.uibTypeahead);

    var hasFocus;

    //Used to avoid bug in iOS webview where iOS keyboard does not fire
    //mousedown & mouseup events
    //Issue #3699
    var selected;

    //create a child scope for the typeahead directive so we are not polluting original scope
    //with typeahead-specific data (matches, query etc.)
    var scope = originalScope.$new();
    var offDestroy = originalScope.$on('$destroy', function() {
      scope.$destroy();
    });
    scope.$on('$destroy', offDestroy);

    // WAI-ARIA
    var popupId = 'typeahead-' + scope.$id + '-' + Math.floor(Math.random() * 10000);
    element.attr({
      'aria-autocomplete': 'list',
      'aria-expanded': false,
      'aria-owns': popupId
    });

    var inputsContainer, hintInputElem;
    //add read-only input to show hint
    if (showHint) {
      inputsContainer = angular.element('<div></div>');
      inputsContainer.css('position', 'relative');
      element.after(inputsContainer);
      hintInputElem = element.clone();
      hintInputElem.attr('placeholder', '');
      hintInputElem.attr('tabindex', '-1');
      hintInputElem.val('');
      hintInputElem.css({
        'position': 'absolute',
        'top': '0px',
        'left': '0px',
        'border-color': 'transparent',
        'box-shadow': 'none',
        'opacity': 1,
        'background': 'none 0% 0% / auto repeat scroll padding-box border-box rgb(255, 255, 255)',
        'color': '#999'
      });
      element.css({
        'position': 'relative',
        'vertical-align': 'top',
        'background-color': 'transparent'
      });

      if (hintInputElem.attr('id')) {
        hintInputElem.removeAttr('id'); // remove duplicate id if present.
      }
      inputsContainer.append(hintInputElem);
      hintInputElem.after(element);
    }

    //pop-up element used to display matches
    var popUpEl = angular.element('<div uib-typeahead-popup></div>');
    popUpEl.attr({
      id: popupId,
      matches: 'matches',
      active: 'activeIdx',
      select: 'select(activeIdx, evt)',
      'move-in-progress': 'moveInProgress',
      query: 'query',
      position: 'position',
      'assign-is-open': 'assignIsOpen(isOpen)',
      debounce: 'debounceUpdate'
    });
    //custom item template
    if (angular.isDefined(attrs.typeaheadTemplateUrl)) {
      popUpEl.attr('template-url', attrs.typeaheadTemplateUrl);
    }

    if (angular.isDefined(attrs.typeaheadPopupTemplateUrl)) {
      popUpEl.attr('popup-template-url', attrs.typeaheadPopupTemplateUrl);
    }

    var resetHint = function() {
      if (showHint) {
        hintInputElem.val('');
      }
    };

    var resetMatches = function() {
      scope.matches = [];
      scope.activeIdx = -1;
      element.attr('aria-expanded', false);
      resetHint();
    };

    var getMatchId = function(index) {
      return popupId + '-option-' + index;
    };

    // Indicate that the specified match is the active (pre-selected) item in the list owned by this typeahead.
    // This attribute is added or removed automatically when the `activeIdx` changes.
    scope.$watch('activeIdx', function(index) {
      if (index < 0) {
        element.removeAttr('aria-activedescendant');
      } else {
        element.attr('aria-activedescendant', getMatchId(index));
      }
    });

    var inputIsExactMatch = function(inputValue, index) {
      if (scope.matches.length > index && inputValue) {
        return inputValue.toUpperCase() === scope.matches[index].label.toUpperCase();
      }

      return false;
    };

    var getMatchesAsync = function(inputValue, evt) {
      var locals = {$viewValue: inputValue};
      isLoadingSetter(originalScope, true);
      isNoResultsSetter(originalScope, false);
      $q.when(parserResult.source(originalScope, locals)).then(function(matches) {
        //it might happen that several async queries were in progress if a user were typing fast
        //but we are interested only in responses that correspond to the current view value
        var onCurrentRequest = inputValue === modelCtrl.$viewValue;
        if (onCurrentRequest && hasFocus) {
          if (matches && matches.length > 0) {
            scope.activeIdx = focusFirst ? 0 : -1;
            isNoResultsSetter(originalScope, false);
            scope.matches.length = 0;

            //transform labels
            for (var i = 0; i < matches.length; i++) {
              locals[parserResult.itemName] = matches[i];
              scope.matches.push({
                id: getMatchId(i),
                label: parserResult.viewMapper(scope, locals),
                model: matches[i]
              });
            }

            scope.query = inputValue;
            //position pop-up with matches - we need to re-calculate its position each time we are opening a window
            //with matches as a pop-up might be absolute-positioned and position of an input might have changed on a page
            //due to other elements being rendered
            recalculatePosition();

            element.attr('aria-expanded', true);

            //Select the single remaining option if user input matches
            if (selectOnExact && scope.matches.length === 1 && inputIsExactMatch(inputValue, 0)) {
              if (angular.isNumber(scope.debounceUpdate) || angular.isObject(scope.debounceUpdate)) {
                $$debounce(function() {
                  scope.select(0, evt);
                }, angular.isNumber(scope.debounceUpdate) ? scope.debounceUpdate : scope.debounceUpdate['default']);
              } else {
                scope.select(0, evt);
              }
            }

            if (showHint) {
              var firstLabel = scope.matches[0].label;
              if (angular.isString(inputValue) &&
                inputValue.length > 0 &&
                firstLabel.slice(0, inputValue.length).toUpperCase() === inputValue.toUpperCase()) {
                hintInputElem.val(inputValue + firstLabel.slice(inputValue.length));
              } else {
                hintInputElem.val('');
              }
            }
          } else {
            resetMatches();
            isNoResultsSetter(originalScope, true);
          }
        }
        if (onCurrentRequest) {
          isLoadingSetter(originalScope, false);
        }
      }, function() {
        resetMatches();
        isLoadingSetter(originalScope, false);
        isNoResultsSetter(originalScope, true);
      });
    };

    // bind events only if appendToBody params exist - performance feature
    if (appendToBody) {
      angular.element($window).on('resize', fireRecalculating);
      $document.find('body').on('scroll', fireRecalculating);
    }

    // Declare the debounced function outside recalculating for
    // proper debouncing
    var debouncedRecalculate = $$debounce(function() {
      // if popup is visible
      if (scope.matches.length) {
        recalculatePosition();
      }

      scope.moveInProgress = false;
    }, eventDebounceTime);

    // Default progress type
    scope.moveInProgress = false;

    function fireRecalculating() {
      if (!scope.moveInProgress) {
        scope.moveInProgress = true;
        scope.$digest();
      }

      debouncedRecalculate();
    }

    // recalculate actual position and set new values to scope
    // after digest loop is popup in right position
    function recalculatePosition() {
      scope.position = appendToBody ? $position.offset(element) : $position.position(element);
      scope.position.top += element.prop('offsetHeight');
    }

    //we need to propagate user's query so we can higlight matches
    scope.query = undefined;

    //Declare the timeout promise var outside the function scope so that stacked calls can be cancelled later
    var timeoutPromise;

    var scheduleSearchWithTimeout = function(inputValue) {
      timeoutPromise = $timeout(function() {
        getMatchesAsync(inputValue);
      }, waitTime);
    };

    var cancelPreviousTimeout = function() {
      if (timeoutPromise) {
        $timeout.cancel(timeoutPromise);
      }
    };

    resetMatches();

    scope.assignIsOpen = function (isOpen) {
      isOpenSetter(originalScope, isOpen);
    };

    scope.select = function(activeIdx, evt) {
      //called from within the $digest() cycle
      var locals = {};
      var model, item;

      selected = true;
      locals[parserResult.itemName] = item = scope.matches[activeIdx].model;
      model = parserResult.modelMapper(originalScope, locals);
      $setModelValue(originalScope, model);
      modelCtrl.$setValidity('editable', true);
      modelCtrl.$setValidity('parse', true);

      onSelectCallback(originalScope, {
        $item: item,
        $model: model,
        $label: parserResult.viewMapper(originalScope, locals),
        $event: evt
      });

      resetMatches();

      //return focus to the input element if a match was selected via a mouse click event
      // use timeout to avoid $rootScope:inprog error
      if (scope.$eval(attrs.typeaheadFocusOnSelect) !== false) {
        $timeout(function() { element[0].focus(); }, 0, false);
      }
    };

    //bind keyboard events: arrows up(38) / down(40), enter(13) and tab(9), esc(27)
    element.on('keydown', function(evt) {
      //typeahead is open and an "interesting" key was pressed
      if (scope.matches.length === 0 || HOT_KEYS.indexOf(evt.which) === -1) {
        return;
      }

      var shouldSelect = isSelectEvent(originalScope, {$event: evt});

      /**
       * if there's nothing selected (i.e. focusFirst) and enter or tab is hit
       * or
       * shift + tab is pressed to bring focus to the previous element
       * then clear the results
       */
      if (scope.activeIdx === -1 && shouldSelect || evt.which === 9 && !!evt.shiftKey) {
        resetMatches();
        scope.$digest();
        return;
      }

      evt.preventDefault();
      var target;
      switch (evt.which) {
        case 27: // escape
          evt.stopPropagation();

          resetMatches();
          originalScope.$digest();
          break;
        case 38: // up arrow
          scope.activeIdx = (scope.activeIdx > 0 ? scope.activeIdx : scope.matches.length) - 1;
          scope.$digest();
          target = popUpEl[0].querySelectorAll('.uib-typeahead-match')[scope.activeIdx];
          target.parentNode.scrollTop = target.offsetTop;
          break;
        case 40: // down arrow
          scope.activeIdx = (scope.activeIdx + 1) % scope.matches.length;
          scope.$digest();
          target = popUpEl[0].querySelectorAll('.uib-typeahead-match')[scope.activeIdx];
          target.parentNode.scrollTop = target.offsetTop;
          break;
        default:
          if (shouldSelect) {
            scope.$apply(function() {
              if (angular.isNumber(scope.debounceUpdate) || angular.isObject(scope.debounceUpdate)) {
                $$debounce(function() {
                  scope.select(scope.activeIdx, evt);
                }, angular.isNumber(scope.debounceUpdate) ? scope.debounceUpdate : scope.debounceUpdate['default']);
              } else {
                scope.select(scope.activeIdx, evt);
              }
            });
          }
      }
    });

    element.bind('focus', function (evt) {
      hasFocus = true;
      if (minLength === 0 && !modelCtrl.$viewValue) {
        $timeout(function() {
          getMatchesAsync(modelCtrl.$viewValue, evt);
        }, 0);
      }
    });

    element.bind('blur', function(evt) {
      if (isSelectOnBlur && scope.matches.length && scope.activeIdx !== -1 && !selected) {
        selected = true;
        scope.$apply(function() {
          if (angular.isObject(scope.debounceUpdate) && angular.isNumber(scope.debounceUpdate.blur)) {
            $$debounce(function() {
              scope.select(scope.activeIdx, evt);
            }, scope.debounceUpdate.blur);
          } else {
            scope.select(scope.activeIdx, evt);
          }
        });
      }
      if (!isEditable && modelCtrl.$error.editable) {
        modelCtrl.$setViewValue();
        scope.$apply(function() {
          // Reset validity as we are clearing
          modelCtrl.$setValidity('editable', true);
          modelCtrl.$setValidity('parse', true);
        });
        element.val('');
      }
      hasFocus = false;
      selected = false;
    });

    // Keep reference to click handler to unbind it.
    var dismissClickHandler = function(evt) {
      // Issue #3973
      // Firefox treats right click as a click on document
      if (element[0] !== evt.target && evt.which !== 3 && scope.matches.length !== 0) {
        resetMatches();
        if (!$rootScope.$$phase) {
          originalScope.$digest();
        }
      }
    };

    $document.on('click', dismissClickHandler);

    originalScope.$on('$destroy', function() {
      $document.off('click', dismissClickHandler);
      if (appendToBody || appendTo) {
        $popup.remove();
      }

      if (appendToBody) {
        angular.element($window).off('resize', fireRecalculating);
        $document.find('body').off('scroll', fireRecalculating);
      }
      // Prevent jQuery cache memory leak
      popUpEl.remove();

      if (showHint) {
          inputsContainer.remove();
      }
    });

    var $popup = $compile(popUpEl)(scope);

    if (appendToBody) {
      $document.find('body').append($popup);
    } else if (appendTo) {
      angular.element(appendTo).eq(0).append($popup);
    } else {
      element.after($popup);
    }

    this.init = function(_modelCtrl, _ngModelOptions) {
      modelCtrl = _modelCtrl;
      ngModelOptions = _ngModelOptions;

      scope.debounceUpdate = modelCtrl.$options && $parse(modelCtrl.$options.debounce)(originalScope);

      //plug into $parsers pipeline to open a typeahead on view changes initiated from DOM
      //$parsers kick-in on all the changes coming from the view as well as manually triggered by $setViewValue
      modelCtrl.$parsers.unshift(function(inputValue) {
        hasFocus = true;

        if (minLength === 0 || inputValue && inputValue.length >= minLength) {
          if (waitTime > 0) {
            cancelPreviousTimeout();
            scheduleSearchWithTimeout(inputValue);
          } else {
            getMatchesAsync(inputValue);
          }
        } else {
          isLoadingSetter(originalScope, false);
          cancelPreviousTimeout();
          resetMatches();
        }

        if (isEditable) {
          return inputValue;
        }

        if (!inputValue) {
          // Reset in case user had typed something previously.
          modelCtrl.$setValidity('editable', true);
          return null;
        }

        modelCtrl.$setValidity('editable', false);
        return undefined;
      });

      modelCtrl.$formatters.push(function(modelValue) {
        var candidateViewValue, emptyViewValue;
        var locals = {};

        // The validity may be set to false via $parsers (see above) if
        // the model is restricted to selected values. If the model
        // is set manually it is considered to be valid.
        if (!isEditable) {
          modelCtrl.$setValidity('editable', true);
        }

        if (inputFormatter) {
          locals.$model = modelValue;
          return inputFormatter(originalScope, locals);
        }

        //it might happen that we don't have enough info to properly render input value
        //we need to check for this situation and simply return model value if we can't apply custom formatting
        locals[parserResult.itemName] = modelValue;
        candidateViewValue = parserResult.viewMapper(originalScope, locals);
        locals[parserResult.itemName] = undefined;
        emptyViewValue = parserResult.viewMapper(originalScope, locals);

        return candidateViewValue !== emptyViewValue ? candidateViewValue : modelValue;
      });
    };
  }])

  .directive('uibTypeahead', function() {
    return {
      controller: 'UibTypeaheadController',
      require: ['ngModel', '^?ngModelOptions', 'uibTypeahead'],
      link: function(originalScope, element, attrs, ctrls) {
        ctrls[2].init(ctrls[0], ctrls[1]);
      }
    };
  })

  .directive('uibTypeaheadPopup', ['$$debounce', function($$debounce) {
    return {
      scope: {
        matches: '=',
        query: '=',
        active: '=',
        position: '&',
        moveInProgress: '=',
        select: '&',
        assignIsOpen: '&',
        debounce: '&'
      },
      replace: true,
      templateUrl: function(element, attrs) {
        return attrs.popupTemplateUrl || 'uib/template/typeahead/typeahead-popup.html';
      },
      link: function(scope, element, attrs) {
        scope.templateUrl = attrs.templateUrl;

        scope.isOpen = function() {
          var isDropdownOpen = scope.matches.length > 0;
          scope.assignIsOpen({ isOpen: isDropdownOpen });
          return isDropdownOpen;
        };

        scope.isActive = function(matchIdx) {
          return scope.active === matchIdx;
        };

        scope.selectActive = function(matchIdx) {
          scope.active = matchIdx;
        };

        scope.selectMatch = function(activeIdx, evt) {
          var debounce = scope.debounce();
          if (angular.isNumber(debounce) || angular.isObject(debounce)) {
            $$debounce(function() {
              scope.select({activeIdx: activeIdx, evt: evt});
            }, angular.isNumber(debounce) ? debounce : debounce['default']);
          } else {
            scope.select({activeIdx: activeIdx, evt: evt});
          }
        };
      }
    };
  }])

  .directive('uibTypeaheadMatch', ['$templateRequest', '$compile', '$parse', function($templateRequest, $compile, $parse) {
    return {
      scope: {
        index: '=',
        match: '=',
        query: '='
      },
      link: function(scope, element, attrs) {
        var tplUrl = $parse(attrs.templateUrl)(scope.$parent) || 'uib/template/typeahead/typeahead-match.html';
        $templateRequest(tplUrl).then(function(tplContent) {
          var tplEl = angular.element(tplContent.trim());
          element.replaceWith(tplEl);
          $compile(tplEl)(scope);
        });
      }
    };
  }])

  .filter('uibTypeaheadHighlight', ['$sce', '$injector', '$log', function($sce, $injector, $log) {
    var isSanitizePresent;
    isSanitizePresent = $injector.has('$sanitize');

    function escapeRegexp(queryToEscape) {
      // Regex: capture the whole query string and replace it with the string that will be used to match
      // the results, for example if the capture is "a" the result will be \a
      return queryToEscape.replace(/([.?*+^$[\]\\(){}|-])/g, '\\$1');
    }

    function containsHtml(matchItem) {
      return /<.*>/g.test(matchItem);
    }

    return function(matchItem, query) {
      if (!isSanitizePresent && containsHtml(matchItem)) {
        $log.warn('Unsafe use of typeahead please use ngSanitize'); // Warn the user about the danger
      }
      matchItem = query ? ('' + matchItem).replace(new RegExp(escapeRegexp(query), 'gi'), '<strong>$&</strong>') : matchItem; // Replaces the capture string with a the same string inside of a "strong" tag
      if (!isSanitizePresent) {
        matchItem = $sce.trustAsHtml(matchItem); // If $sanitize is not present we pack the string in a $sce object for the ng-bind-html directive
      }
      return matchItem;
    };
  }]);
angular.module('ui.bootstrap.carousel').run(function() {!angular.$$csp().noInlineStyle && !angular.$$uibCarouselCss && angular.element(document).find('head').prepend('<style type="text/css">.ng-animate.item:not(.left):not(.right){-webkit-transition:0s ease-in-out left;transition:0s ease-in-out left}</style>'); angular.$$uibCarouselCss = true; });
angular.module('ui.bootstrap.datepicker').run(function() {!angular.$$csp().noInlineStyle && !angular.$$uibDatepickerCss && angular.element(document).find('head').prepend('<style type="text/css">.uib-datepicker .uib-title{width:100%;}.uib-day button,.uib-month button,.uib-year button{min-width:100%;}.uib-left,.uib-right{width:100%}</style>'); angular.$$uibDatepickerCss = true; });
angular.module('ui.bootstrap.position').run(function() {!angular.$$csp().noInlineStyle && !angular.$$uibPositionCss && angular.element(document).find('head').prepend('<style type="text/css">.uib-position-measure{display:block !important;visibility:hidden !important;position:absolute !important;top:-9999px !important;left:-9999px !important;}.uib-position-scrollbar-measure{position:absolute !important;top:-9999px !important;width:50px !important;height:50px !important;overflow:scroll !important;}.uib-position-body-scrollbar-measure{overflow:scroll !important;}</style>'); angular.$$uibPositionCss = true; });
angular.module('ui.bootstrap.datepickerPopup').run(function() {!angular.$$csp().noInlineStyle && !angular.$$uibDatepickerpopupCss && angular.element(document).find('head').prepend('<style type="text/css">.uib-datepicker-popup.dropdown-menu{display:block;float:none;margin:0;}.uib-button-bar{padding:10px 9px 2px;}</style>'); angular.$$uibDatepickerpopupCss = true; });
angular.module('ui.bootstrap.tooltip').run(function() {!angular.$$csp().noInlineStyle && !angular.$$uibTooltipCss && angular.element(document).find('head').prepend('<style type="text/css">[uib-tooltip-popup].tooltip.top-left > .tooltip-arrow,[uib-tooltip-popup].tooltip.top-right > .tooltip-arrow,[uib-tooltip-popup].tooltip.bottom-left > .tooltip-arrow,[uib-tooltip-popup].tooltip.bottom-right > .tooltip-arrow,[uib-tooltip-popup].tooltip.left-top > .tooltip-arrow,[uib-tooltip-popup].tooltip.left-bottom > .tooltip-arrow,[uib-tooltip-popup].tooltip.right-top > .tooltip-arrow,[uib-tooltip-popup].tooltip.right-bottom > .tooltip-arrow,[uib-tooltip-html-popup].tooltip.top-left > .tooltip-arrow,[uib-tooltip-html-popup].tooltip.top-right > .tooltip-arrow,[uib-tooltip-html-popup].tooltip.bottom-left > .tooltip-arrow,[uib-tooltip-html-popup].tooltip.bottom-right > .tooltip-arrow,[uib-tooltip-html-popup].tooltip.left-top > .tooltip-arrow,[uib-tooltip-html-popup].tooltip.left-bottom > .tooltip-arrow,[uib-tooltip-html-popup].tooltip.right-top > .tooltip-arrow,[uib-tooltip-html-popup].tooltip.right-bottom > .tooltip-arrow,[uib-tooltip-template-popup].tooltip.top-left > .tooltip-arrow,[uib-tooltip-template-popup].tooltip.top-right > .tooltip-arrow,[uib-tooltip-template-popup].tooltip.bottom-left > .tooltip-arrow,[uib-tooltip-template-popup].tooltip.bottom-right > .tooltip-arrow,[uib-tooltip-template-popup].tooltip.left-top > .tooltip-arrow,[uib-tooltip-template-popup].tooltip.left-bottom > .tooltip-arrow,[uib-tooltip-template-popup].tooltip.right-top > .tooltip-arrow,[uib-tooltip-template-popup].tooltip.right-bottom > .tooltip-arrow,[uib-popover-popup].popover.top-left > .arrow,[uib-popover-popup].popover.top-right > .arrow,[uib-popover-popup].popover.bottom-left > .arrow,[uib-popover-popup].popover.bottom-right > .arrow,[uib-popover-popup].popover.left-top > .arrow,[uib-popover-popup].popover.left-bottom > .arrow,[uib-popover-popup].popover.right-top > .arrow,[uib-popover-popup].popover.right-bottom > .arrow,[uib-popover-html-popup].popover.top-left > .arrow,[uib-popover-html-popup].popover.top-right > .arrow,[uib-popover-html-popup].popover.bottom-left > .arrow,[uib-popover-html-popup].popover.bottom-right > .arrow,[uib-popover-html-popup].popover.left-top > .arrow,[uib-popover-html-popup].popover.left-bottom > .arrow,[uib-popover-html-popup].popover.right-top > .arrow,[uib-popover-html-popup].popover.right-bottom > .arrow,[uib-popover-template-popup].popover.top-left > .arrow,[uib-popover-template-popup].popover.top-right > .arrow,[uib-popover-template-popup].popover.bottom-left > .arrow,[uib-popover-template-popup].popover.bottom-right > .arrow,[uib-popover-template-popup].popover.left-top > .arrow,[uib-popover-template-popup].popover.left-bottom > .arrow,[uib-popover-template-popup].popover.right-top > .arrow,[uib-popover-template-popup].popover.right-bottom > .arrow{top:auto;bottom:auto;left:auto;right:auto;margin:0;}[uib-popover-popup].popover,[uib-popover-html-popup].popover,[uib-popover-template-popup].popover{display:block !important;}</style>'); angular.$$uibTooltipCss = true; });
angular.module('ui.bootstrap.timepicker').run(function() {!angular.$$csp().noInlineStyle && !angular.$$uibTimepickerCss && angular.element(document).find('head').prepend('<style type="text/css">.uib-time input{width:50px;}</style>'); angular.$$uibTimepickerCss = true; });
angular.module('ui.bootstrap.typeahead').run(function() {!angular.$$csp().noInlineStyle && !angular.$$uibTypeaheadCss && angular.element(document).find('head').prepend('<style type="text/css">[uib-typeahead-popup].dropdown-menu{display:block;}</style>'); angular.$$uibTypeaheadCss = true; });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJ1aS1ib290c3RyYXAuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLypcclxuICogYW5ndWxhci11aS1ib290c3RyYXBcclxuICogaHR0cDovL2FuZ3VsYXItdWkuZ2l0aHViLmlvL2Jvb3RzdHJhcC9cclxuXHJcbiAqIFZlcnNpb246IDIuMS4zIC0gMjAxNi0wOC0yNVxyXG4gKiBMaWNlbnNlOiBNSVRcclxuICovYW5ndWxhci5tb2R1bGUoXCJ1aS5ib290c3RyYXBcIiwgW1widWkuYm9vdHN0cmFwLmNvbGxhcHNlXCIsXCJ1aS5ib290c3RyYXAudGFiaW5kZXhcIixcInVpLmJvb3RzdHJhcC5hY2NvcmRpb25cIixcInVpLmJvb3RzdHJhcC5hbGVydFwiLFwidWkuYm9vdHN0cmFwLmJ1dHRvbnNcIixcInVpLmJvb3RzdHJhcC5jYXJvdXNlbFwiLFwidWkuYm9vdHN0cmFwLmRhdGVwYXJzZXJcIixcInVpLmJvb3RzdHJhcC5pc0NsYXNzXCIsXCJ1aS5ib290c3RyYXAuZGF0ZXBpY2tlclwiLFwidWkuYm9vdHN0cmFwLnBvc2l0aW9uXCIsXCJ1aS5ib290c3RyYXAuZGF0ZXBpY2tlclBvcHVwXCIsXCJ1aS5ib290c3RyYXAuZGVib3VuY2VcIixcInVpLmJvb3RzdHJhcC5kcm9wZG93blwiLFwidWkuYm9vdHN0cmFwLnN0YWNrZWRNYXBcIixcInVpLmJvb3RzdHJhcC5tb2RhbFwiLFwidWkuYm9vdHN0cmFwLnBhZ2luZ1wiLFwidWkuYm9vdHN0cmFwLnBhZ2VyXCIsXCJ1aS5ib290c3RyYXAucGFnaW5hdGlvblwiLFwidWkuYm9vdHN0cmFwLnRvb2x0aXBcIixcInVpLmJvb3RzdHJhcC5wb3BvdmVyXCIsXCJ1aS5ib290c3RyYXAucHJvZ3Jlc3NiYXJcIixcInVpLmJvb3RzdHJhcC5yYXRpbmdcIixcInVpLmJvb3RzdHJhcC50YWJzXCIsXCJ1aS5ib290c3RyYXAudGltZXBpY2tlclwiLFwidWkuYm9vdHN0cmFwLnR5cGVhaGVhZFwiXSk7XHJcbmFuZ3VsYXIubW9kdWxlKCd1aS5ib290c3RyYXAuY29sbGFwc2UnLCBbXSlcclxuXHJcbiAgLmRpcmVjdGl2ZSgndWliQ29sbGFwc2UnLCBbJyRhbmltYXRlJywgJyRxJywgJyRwYXJzZScsICckaW5qZWN0b3InLCBmdW5jdGlvbigkYW5pbWF0ZSwgJHEsICRwYXJzZSwgJGluamVjdG9yKSB7XHJcbiAgICB2YXIgJGFuaW1hdGVDc3MgPSAkaW5qZWN0b3IuaGFzKCckYW5pbWF0ZUNzcycpID8gJGluamVjdG9yLmdldCgnJGFuaW1hdGVDc3MnKSA6IG51bGw7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxlbWVudCwgYXR0cnMpIHtcclxuICAgICAgICB2YXIgZXhwYW5kaW5nRXhwciA9ICRwYXJzZShhdHRycy5leHBhbmRpbmcpLFxyXG4gICAgICAgICAgZXhwYW5kZWRFeHByID0gJHBhcnNlKGF0dHJzLmV4cGFuZGVkKSxcclxuICAgICAgICAgIGNvbGxhcHNpbmdFeHByID0gJHBhcnNlKGF0dHJzLmNvbGxhcHNpbmcpLFxyXG4gICAgICAgICAgY29sbGFwc2VkRXhwciA9ICRwYXJzZShhdHRycy5jb2xsYXBzZWQpLFxyXG4gICAgICAgICAgaG9yaXpvbnRhbCA9IGZhbHNlLFxyXG4gICAgICAgICAgY3NzID0ge30sXHJcbiAgICAgICAgICBjc3NUbyA9IHt9O1xyXG5cclxuICAgICAgICBpbml0KCk7XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGluaXQoKSB7XHJcbiAgICAgICAgICBob3Jpem9udGFsID0gISEoJ2hvcml6b250YWwnIGluIGF0dHJzKTtcclxuICAgICAgICAgIGlmIChob3Jpem9udGFsKSB7XHJcbiAgICAgICAgICAgIGNzcyA9IHtcclxuICAgICAgICAgICAgICB3aWR0aDogJydcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgY3NzVG8gPSB7d2lkdGg6ICcwJ307XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjc3MgPSB7XHJcbiAgICAgICAgICAgICAgaGVpZ2h0OiAnJ1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBjc3NUbyA9IHtoZWlnaHQ6ICcwJ307XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBpZiAoIXNjb3BlLiRldmFsKGF0dHJzLnVpYkNvbGxhcHNlKSkge1xyXG4gICAgICAgICAgICBlbGVtZW50LmFkZENsYXNzKCdpbicpXHJcbiAgICAgICAgICAgICAgLmFkZENsYXNzKCdjb2xsYXBzZScpXHJcbiAgICAgICAgICAgICAgLmF0dHIoJ2FyaWEtZXhwYW5kZWQnLCB0cnVlKVxyXG4gICAgICAgICAgICAgIC5hdHRyKCdhcmlhLWhpZGRlbicsIGZhbHNlKVxyXG4gICAgICAgICAgICAgIC5jc3MoY3NzKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGdldFNjcm9sbEZyb21FbGVtZW50KGVsZW1lbnQpIHtcclxuICAgICAgICAgIGlmIChob3Jpem9udGFsKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB7d2lkdGg6IGVsZW1lbnQuc2Nyb2xsV2lkdGggKyAncHgnfTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHJldHVybiB7aGVpZ2h0OiBlbGVtZW50LnNjcm9sbEhlaWdodCArICdweCd9O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gZXhwYW5kKCkge1xyXG4gICAgICAgICAgaWYgKGVsZW1lbnQuaGFzQ2xhc3MoJ2NvbGxhcHNlJykgJiYgZWxlbWVudC5oYXNDbGFzcygnaW4nKSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgJHEucmVzb2x2ZShleHBhbmRpbmdFeHByKHNjb3BlKSlcclxuICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgZWxlbWVudC5yZW1vdmVDbGFzcygnY29sbGFwc2UnKVxyXG4gICAgICAgICAgICAgICAgLmFkZENsYXNzKCdjb2xsYXBzaW5nJylcclxuICAgICAgICAgICAgICAgIC5hdHRyKCdhcmlhLWV4cGFuZGVkJywgdHJ1ZSlcclxuICAgICAgICAgICAgICAgIC5hdHRyKCdhcmlhLWhpZGRlbicsIGZhbHNlKTtcclxuXHJcbiAgICAgICAgICAgICAgaWYgKCRhbmltYXRlQ3NzKSB7XHJcbiAgICAgICAgICAgICAgICAkYW5pbWF0ZUNzcyhlbGVtZW50LCB7XHJcbiAgICAgICAgICAgICAgICAgIGFkZENsYXNzOiAnaW4nLFxyXG4gICAgICAgICAgICAgICAgICBlYXNpbmc6ICdlYXNlJyxcclxuICAgICAgICAgICAgICAgICAgY3NzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgb3ZlcmZsb3c6ICdoaWRkZW4nXHJcbiAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgIHRvOiBnZXRTY3JvbGxGcm9tRWxlbWVudChlbGVtZW50WzBdKVxyXG4gICAgICAgICAgICAgICAgfSkuc3RhcnQoKVsnZmluYWxseSddKGV4cGFuZERvbmUpO1xyXG4gICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAkYW5pbWF0ZS5hZGRDbGFzcyhlbGVtZW50LCAnaW4nLCB7XHJcbiAgICAgICAgICAgICAgICAgIGNzczoge1xyXG4gICAgICAgICAgICAgICAgICAgIG92ZXJmbG93OiAnaGlkZGVuJ1xyXG4gICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICB0bzogZ2V0U2Nyb2xsRnJvbUVsZW1lbnQoZWxlbWVudFswXSlcclxuICAgICAgICAgICAgICAgIH0pLnRoZW4oZXhwYW5kRG9uZSk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGV4cGFuZERvbmUoKSB7XHJcbiAgICAgICAgICBlbGVtZW50LnJlbW92ZUNsYXNzKCdjb2xsYXBzaW5nJylcclxuICAgICAgICAgICAgLmFkZENsYXNzKCdjb2xsYXBzZScpXHJcbiAgICAgICAgICAgIC5jc3MoY3NzKTtcclxuICAgICAgICAgIGV4cGFuZGVkRXhwcihzY29wZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBjb2xsYXBzZSgpIHtcclxuICAgICAgICAgIGlmICghZWxlbWVudC5oYXNDbGFzcygnY29sbGFwc2UnKSAmJiAhZWxlbWVudC5oYXNDbGFzcygnaW4nKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gY29sbGFwc2VEb25lKCk7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgJHEucmVzb2x2ZShjb2xsYXBzaW5nRXhwcihzY29wZSkpXHJcbiAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgIGVsZW1lbnRcclxuICAgICAgICAgICAgICAvLyBJTVBPUlRBTlQ6IFRoZSB3aWR0aCBtdXN0IGJlIHNldCBiZWZvcmUgYWRkaW5nIFwiY29sbGFwc2luZ1wiIGNsYXNzLlxyXG4gICAgICAgICAgICAgIC8vIE90aGVyd2lzZSwgdGhlIGJyb3dzZXIgYXR0ZW1wdHMgdG8gYW5pbWF0ZSBmcm9tIHdpZHRoIDAgKGluXHJcbiAgICAgICAgICAgICAgLy8gY29sbGFwc2luZyBjbGFzcykgdG8gdGhlIGdpdmVuIHdpZHRoIGhlcmUuXHJcbiAgICAgICAgICAgICAgICAuY3NzKGdldFNjcm9sbEZyb21FbGVtZW50KGVsZW1lbnRbMF0pKVxyXG4gICAgICAgICAgICAgICAgLy8gaW5pdGlhbGx5IGFsbCBwYW5lbCBjb2xsYXBzZSBoYXZlIHRoZSBjb2xsYXBzZSBjbGFzcywgdGhpcyByZW1vdmFsXHJcbiAgICAgICAgICAgICAgICAvLyBwcmV2ZW50cyB0aGUgYW5pbWF0aW9uIGZyb20ganVtcGluZyB0byBjb2xsYXBzZWQgc3RhdGVcclxuICAgICAgICAgICAgICAgIC5yZW1vdmVDbGFzcygnY29sbGFwc2UnKVxyXG4gICAgICAgICAgICAgICAgLmFkZENsYXNzKCdjb2xsYXBzaW5nJylcclxuICAgICAgICAgICAgICAgIC5hdHRyKCdhcmlhLWV4cGFuZGVkJywgZmFsc2UpXHJcbiAgICAgICAgICAgICAgICAuYXR0cignYXJpYS1oaWRkZW4nLCB0cnVlKTtcclxuXHJcbiAgICAgICAgICAgICAgaWYgKCRhbmltYXRlQ3NzKSB7XHJcbiAgICAgICAgICAgICAgICAkYW5pbWF0ZUNzcyhlbGVtZW50LCB7XHJcbiAgICAgICAgICAgICAgICAgIHJlbW92ZUNsYXNzOiAnaW4nLFxyXG4gICAgICAgICAgICAgICAgICB0bzogY3NzVG9cclxuICAgICAgICAgICAgICAgIH0pLnN0YXJ0KClbJ2ZpbmFsbHknXShjb2xsYXBzZURvbmUpO1xyXG4gICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAkYW5pbWF0ZS5yZW1vdmVDbGFzcyhlbGVtZW50LCAnaW4nLCB7XHJcbiAgICAgICAgICAgICAgICAgIHRvOiBjc3NUb1xyXG4gICAgICAgICAgICAgICAgfSkudGhlbihjb2xsYXBzZURvbmUpO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBjb2xsYXBzZURvbmUoKSB7XHJcbiAgICAgICAgICBlbGVtZW50LmNzcyhjc3NUbyk7IC8vIFJlcXVpcmVkIHNvIHRoYXQgY29sbGFwc2Ugd29ya3Mgd2hlbiBhbmltYXRpb24gaXMgZGlzYWJsZWRcclxuICAgICAgICAgIGVsZW1lbnQucmVtb3ZlQ2xhc3MoJ2NvbGxhcHNpbmcnKVxyXG4gICAgICAgICAgICAuYWRkQ2xhc3MoJ2NvbGxhcHNlJyk7XHJcbiAgICAgICAgICBjb2xsYXBzZWRFeHByKHNjb3BlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHNjb3BlLiR3YXRjaChhdHRycy51aWJDb2xsYXBzZSwgZnVuY3Rpb24oc2hvdWxkQ29sbGFwc2UpIHtcclxuICAgICAgICAgIGlmIChzaG91bGRDb2xsYXBzZSkge1xyXG4gICAgICAgICAgICBjb2xsYXBzZSgpO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgZXhwYW5kKCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgIH07XHJcbiAgfV0pO1xyXG5cclxuYW5ndWxhci5tb2R1bGUoJ3VpLmJvb3RzdHJhcC50YWJpbmRleCcsIFtdKVxyXG5cclxuLmRpcmVjdGl2ZSgndWliVGFiaW5kZXhUb2dnbGUnLCBmdW5jdGlvbigpIHtcclxuICByZXR1cm4ge1xyXG4gICAgcmVzdHJpY3Q6ICdBJyxcclxuICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBlbGVtLCBhdHRycykge1xyXG4gICAgICBhdHRycy4kb2JzZXJ2ZSgnZGlzYWJsZWQnLCBmdW5jdGlvbihkaXNhYmxlZCkge1xyXG4gICAgICAgIGF0dHJzLiRzZXQoJ3RhYmluZGV4JywgZGlzYWJsZWQgPyAtMSA6IG51bGwpO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuICB9O1xyXG59KTtcclxuXHJcbmFuZ3VsYXIubW9kdWxlKCd1aS5ib290c3RyYXAuYWNjb3JkaW9uJywgWyd1aS5ib290c3RyYXAuY29sbGFwc2UnLCAndWkuYm9vdHN0cmFwLnRhYmluZGV4J10pXHJcblxyXG4uY29uc3RhbnQoJ3VpYkFjY29yZGlvbkNvbmZpZycsIHtcclxuICBjbG9zZU90aGVyczogdHJ1ZVxyXG59KVxyXG5cclxuLmNvbnRyb2xsZXIoJ1VpYkFjY29yZGlvbkNvbnRyb2xsZXInLCBbJyRzY29wZScsICckYXR0cnMnLCAndWliQWNjb3JkaW9uQ29uZmlnJywgZnVuY3Rpb24oJHNjb3BlLCAkYXR0cnMsIGFjY29yZGlvbkNvbmZpZykge1xyXG4gIC8vIFRoaXMgYXJyYXkga2VlcHMgdHJhY2sgb2YgdGhlIGFjY29yZGlvbiBncm91cHNcclxuICB0aGlzLmdyb3VwcyA9IFtdO1xyXG5cclxuICAvLyBFbnN1cmUgdGhhdCBhbGwgdGhlIGdyb3VwcyBpbiB0aGlzIGFjY29yZGlvbiBhcmUgY2xvc2VkLCB1bmxlc3MgY2xvc2Utb3RoZXJzIGV4cGxpY2l0bHkgc2F5cyBub3QgdG9cclxuICB0aGlzLmNsb3NlT3RoZXJzID0gZnVuY3Rpb24ob3Blbkdyb3VwKSB7XHJcbiAgICB2YXIgY2xvc2VPdGhlcnMgPSBhbmd1bGFyLmlzRGVmaW5lZCgkYXR0cnMuY2xvc2VPdGhlcnMpID9cclxuICAgICAgJHNjb3BlLiRldmFsKCRhdHRycy5jbG9zZU90aGVycykgOiBhY2NvcmRpb25Db25maWcuY2xvc2VPdGhlcnM7XHJcbiAgICBpZiAoY2xvc2VPdGhlcnMpIHtcclxuICAgICAgYW5ndWxhci5mb3JFYWNoKHRoaXMuZ3JvdXBzLCBmdW5jdGlvbihncm91cCkge1xyXG4gICAgICAgIGlmIChncm91cCAhPT0gb3Blbkdyb3VwKSB7XHJcbiAgICAgICAgICBncm91cC5pc09wZW4gPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIC8vIFRoaXMgaXMgY2FsbGVkIGZyb20gdGhlIGFjY29yZGlvbi1ncm91cCBkaXJlY3RpdmUgdG8gYWRkIGl0c2VsZiB0byB0aGUgYWNjb3JkaW9uXHJcbiAgdGhpcy5hZGRHcm91cCA9IGZ1bmN0aW9uKGdyb3VwU2NvcGUpIHtcclxuICAgIHZhciB0aGF0ID0gdGhpcztcclxuICAgIHRoaXMuZ3JvdXBzLnB1c2goZ3JvdXBTY29wZSk7XHJcblxyXG4gICAgZ3JvdXBTY29wZS4kb24oJyRkZXN0cm95JywgZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgICAgdGhhdC5yZW1vdmVHcm91cChncm91cFNjb3BlKTtcclxuICAgIH0pO1xyXG4gIH07XHJcblxyXG4gIC8vIFRoaXMgaXMgY2FsbGVkIGZyb20gdGhlIGFjY29yZGlvbi1ncm91cCBkaXJlY3RpdmUgd2hlbiB0byByZW1vdmUgaXRzZWxmXHJcbiAgdGhpcy5yZW1vdmVHcm91cCA9IGZ1bmN0aW9uKGdyb3VwKSB7XHJcbiAgICB2YXIgaW5kZXggPSB0aGlzLmdyb3Vwcy5pbmRleE9mKGdyb3VwKTtcclxuICAgIGlmIChpbmRleCAhPT0gLTEpIHtcclxuICAgICAgdGhpcy5ncm91cHMuc3BsaWNlKGluZGV4LCAxKTtcclxuICAgIH1cclxuICB9O1xyXG59XSlcclxuXHJcbi8vIFRoZSBhY2NvcmRpb24gZGlyZWN0aXZlIHNpbXBseSBzZXRzIHVwIHRoZSBkaXJlY3RpdmUgY29udHJvbGxlclxyXG4vLyBhbmQgYWRkcyBhbiBhY2NvcmRpb24gQ1NTIGNsYXNzIHRvIGl0c2VsZiBlbGVtZW50LlxyXG4uZGlyZWN0aXZlKCd1aWJBY2NvcmRpb24nLCBmdW5jdGlvbigpIHtcclxuICByZXR1cm4ge1xyXG4gICAgY29udHJvbGxlcjogJ1VpYkFjY29yZGlvbkNvbnRyb2xsZXInLFxyXG4gICAgY29udHJvbGxlckFzOiAnYWNjb3JkaW9uJyxcclxuICAgIHRyYW5zY2x1ZGU6IHRydWUsXHJcbiAgICB0ZW1wbGF0ZVVybDogZnVuY3Rpb24oZWxlbWVudCwgYXR0cnMpIHtcclxuICAgICAgcmV0dXJuIGF0dHJzLnRlbXBsYXRlVXJsIHx8ICd1aWIvdGVtcGxhdGUvYWNjb3JkaW9uL2FjY29yZGlvbi5odG1sJztcclxuICAgIH1cclxuICB9O1xyXG59KVxyXG5cclxuLy8gVGhlIGFjY29yZGlvbi1ncm91cCBkaXJlY3RpdmUgaW5kaWNhdGVzIGEgYmxvY2sgb2YgaHRtbCB0aGF0IHdpbGwgZXhwYW5kIGFuZCBjb2xsYXBzZSBpbiBhbiBhY2NvcmRpb25cclxuLmRpcmVjdGl2ZSgndWliQWNjb3JkaW9uR3JvdXAnLCBmdW5jdGlvbigpIHtcclxuICByZXR1cm4ge1xyXG4gICAgcmVxdWlyZTogJ151aWJBY2NvcmRpb24nLCAgICAgICAgIC8vIFdlIG5lZWQgdGhpcyBkaXJlY3RpdmUgdG8gYmUgaW5zaWRlIGFuIGFjY29yZGlvblxyXG4gICAgdHJhbnNjbHVkZTogdHJ1ZSwgICAgICAgICAgICAgIC8vIEl0IHRyYW5zY2x1ZGVzIHRoZSBjb250ZW50cyBvZiB0aGUgZGlyZWN0aXZlIGludG8gdGhlIHRlbXBsYXRlXHJcbiAgICByZXN0cmljdDogJ0EnLFxyXG4gICAgdGVtcGxhdGVVcmw6IGZ1bmN0aW9uKGVsZW1lbnQsIGF0dHJzKSB7XHJcbiAgICAgIHJldHVybiBhdHRycy50ZW1wbGF0ZVVybCB8fCAndWliL3RlbXBsYXRlL2FjY29yZGlvbi9hY2NvcmRpb24tZ3JvdXAuaHRtbCc7XHJcbiAgICB9LFxyXG4gICAgc2NvcGU6IHtcclxuICAgICAgaGVhZGluZzogJ0AnLCAgICAgICAgICAgICAgIC8vIEludGVycG9sYXRlIHRoZSBoZWFkaW5nIGF0dHJpYnV0ZSBvbnRvIHRoaXMgc2NvcGVcclxuICAgICAgcGFuZWxDbGFzczogJ0A/JywgICAgICAgICAgIC8vIERpdHRvIHdpdGggcGFuZWxDbGFzc1xyXG4gICAgICBpc09wZW46ICc9PycsXHJcbiAgICAgIGlzRGlzYWJsZWQ6ICc9PydcclxuICAgIH0sXHJcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbigpIHtcclxuICAgICAgdGhpcy5zZXRIZWFkaW5nID0gZnVuY3Rpb24oZWxlbWVudCkge1xyXG4gICAgICAgIHRoaXMuaGVhZGluZyA9IGVsZW1lbnQ7XHJcbiAgICAgIH07XHJcbiAgICB9LFxyXG4gICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCBhY2NvcmRpb25DdHJsKSB7XHJcbiAgICAgIGVsZW1lbnQuYWRkQ2xhc3MoJ3BhbmVsJyk7XHJcbiAgICAgIGFjY29yZGlvbkN0cmwuYWRkR3JvdXAoc2NvcGUpO1xyXG5cclxuICAgICAgc2NvcGUub3BlbkNsYXNzID0gYXR0cnMub3BlbkNsYXNzIHx8ICdwYW5lbC1vcGVuJztcclxuICAgICAgc2NvcGUucGFuZWxDbGFzcyA9IGF0dHJzLnBhbmVsQ2xhc3MgfHwgJ3BhbmVsLWRlZmF1bHQnO1xyXG4gICAgICBzY29wZS4kd2F0Y2goJ2lzT3BlbicsIGZ1bmN0aW9uKHZhbHVlKSB7XHJcbiAgICAgICAgZWxlbWVudC50b2dnbGVDbGFzcyhzY29wZS5vcGVuQ2xhc3MsICEhdmFsdWUpO1xyXG4gICAgICAgIGlmICh2YWx1ZSkge1xyXG4gICAgICAgICAgYWNjb3JkaW9uQ3RybC5jbG9zZU90aGVycyhzY29wZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIHNjb3BlLnRvZ2dsZU9wZW4gPSBmdW5jdGlvbigkZXZlbnQpIHtcclxuICAgICAgICBpZiAoIXNjb3BlLmlzRGlzYWJsZWQpIHtcclxuICAgICAgICAgIGlmICghJGV2ZW50IHx8ICRldmVudC53aGljaCA9PT0gMzIpIHtcclxuICAgICAgICAgICAgc2NvcGUuaXNPcGVuID0gIXNjb3BlLmlzT3BlbjtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH07XHJcblxyXG4gICAgICB2YXIgaWQgPSAnYWNjb3JkaW9uZ3JvdXAtJyArIHNjb3BlLiRpZCArICctJyArIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDEwMDAwKTtcclxuICAgICAgc2NvcGUuaGVhZGluZ0lkID0gaWQgKyAnLXRhYic7XHJcbiAgICAgIHNjb3BlLnBhbmVsSWQgPSBpZCArICctcGFuZWwnO1xyXG4gICAgfVxyXG4gIH07XHJcbn0pXHJcblxyXG4vLyBVc2UgYWNjb3JkaW9uLWhlYWRpbmcgYmVsb3cgYW4gYWNjb3JkaW9uLWdyb3VwIHRvIHByb3ZpZGUgYSBoZWFkaW5nIGNvbnRhaW5pbmcgSFRNTFxyXG4uZGlyZWN0aXZlKCd1aWJBY2NvcmRpb25IZWFkaW5nJywgZnVuY3Rpb24oKSB7XHJcbiAgcmV0dXJuIHtcclxuICAgIHRyYW5zY2x1ZGU6IHRydWUsICAgLy8gR3JhYiB0aGUgY29udGVudHMgdG8gYmUgdXNlZCBhcyB0aGUgaGVhZGluZ1xyXG4gICAgdGVtcGxhdGU6ICcnLCAgICAgICAvLyBJbiBlZmZlY3QgcmVtb3ZlIHRoaXMgZWxlbWVudCFcclxuICAgIHJlcGxhY2U6IHRydWUsXHJcbiAgICByZXF1aXJlOiAnXnVpYkFjY29yZGlvbkdyb3VwJyxcclxuICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBlbGVtZW50LCBhdHRycywgYWNjb3JkaW9uR3JvdXBDdHJsLCB0cmFuc2NsdWRlKSB7XHJcbiAgICAgIC8vIFBhc3MgdGhlIGhlYWRpbmcgdG8gdGhlIGFjY29yZGlvbi1ncm91cCBjb250cm9sbGVyXHJcbiAgICAgIC8vIHNvIHRoYXQgaXQgY2FuIGJlIHRyYW5zY2x1ZGVkIGludG8gdGhlIHJpZ2h0IHBsYWNlIGluIHRoZSB0ZW1wbGF0ZVxyXG4gICAgICAvLyBbVGhlIHNlY29uZCBwYXJhbWV0ZXIgdG8gdHJhbnNjbHVkZSBjYXVzZXMgdGhlIGVsZW1lbnRzIHRvIGJlIGNsb25lZCBzbyB0aGF0IHRoZXkgd29yayBpbiBuZy1yZXBlYXRdXHJcbiAgICAgIGFjY29yZGlvbkdyb3VwQ3RybC5zZXRIZWFkaW5nKHRyYW5zY2x1ZGUoc2NvcGUsIGFuZ3VsYXIubm9vcCkpO1xyXG4gICAgfVxyXG4gIH07XHJcbn0pXHJcblxyXG4vLyBVc2UgaW4gdGhlIGFjY29yZGlvbi1ncm91cCB0ZW1wbGF0ZSB0byBpbmRpY2F0ZSB3aGVyZSB5b3Ugd2FudCB0aGUgaGVhZGluZyB0byBiZSB0cmFuc2NsdWRlZFxyXG4vLyBZb3UgbXVzdCBwcm92aWRlIHRoZSBwcm9wZXJ0eSBvbiB0aGUgYWNjb3JkaW9uLWdyb3VwIGNvbnRyb2xsZXIgdGhhdCB3aWxsIGhvbGQgdGhlIHRyYW5zY2x1ZGVkIGVsZW1lbnRcclxuLmRpcmVjdGl2ZSgndWliQWNjb3JkaW9uVHJhbnNjbHVkZScsIGZ1bmN0aW9uKCkge1xyXG4gIHJldHVybiB7XHJcbiAgICByZXF1aXJlOiAnXnVpYkFjY29yZGlvbkdyb3VwJyxcclxuICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBlbGVtZW50LCBhdHRycywgY29udHJvbGxlcikge1xyXG4gICAgICBzY29wZS4kd2F0Y2goZnVuY3Rpb24oKSB7IHJldHVybiBjb250cm9sbGVyW2F0dHJzLnVpYkFjY29yZGlvblRyYW5zY2x1ZGVdOyB9LCBmdW5jdGlvbihoZWFkaW5nKSB7XHJcbiAgICAgICAgaWYgKGhlYWRpbmcpIHtcclxuICAgICAgICAgIHZhciBlbGVtID0gYW5ndWxhci5lbGVtZW50KGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcihnZXRIZWFkZXJTZWxlY3RvcnMoKSkpO1xyXG4gICAgICAgICAgZWxlbS5odG1sKCcnKTtcclxuICAgICAgICAgIGVsZW0uYXBwZW5kKGhlYWRpbmcpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgZnVuY3Rpb24gZ2V0SGVhZGVyU2VsZWN0b3JzKCkge1xyXG4gICAgICByZXR1cm4gJ3VpYi1hY2NvcmRpb24taGVhZGVyLCcgK1xyXG4gICAgICAgICAgJ2RhdGEtdWliLWFjY29yZGlvbi1oZWFkZXIsJyArXHJcbiAgICAgICAgICAneC11aWItYWNjb3JkaW9uLWhlYWRlciwnICtcclxuICAgICAgICAgICd1aWJcXFxcOmFjY29yZGlvbi1oZWFkZXIsJyArXHJcbiAgICAgICAgICAnW3VpYi1hY2NvcmRpb24taGVhZGVyXSwnICtcclxuICAgICAgICAgICdbZGF0YS11aWItYWNjb3JkaW9uLWhlYWRlcl0sJyArXHJcbiAgICAgICAgICAnW3gtdWliLWFjY29yZGlvbi1oZWFkZXJdJztcclxuICB9XHJcbn0pO1xyXG5cclxuYW5ndWxhci5tb2R1bGUoJ3VpLmJvb3RzdHJhcC5hbGVydCcsIFtdKVxyXG5cclxuLmNvbnRyb2xsZXIoJ1VpYkFsZXJ0Q29udHJvbGxlcicsIFsnJHNjb3BlJywgJyRlbGVtZW50JywgJyRhdHRycycsICckaW50ZXJwb2xhdGUnLCAnJHRpbWVvdXQnLCBmdW5jdGlvbigkc2NvcGUsICRlbGVtZW50LCAkYXR0cnMsICRpbnRlcnBvbGF0ZSwgJHRpbWVvdXQpIHtcclxuICAkc2NvcGUuY2xvc2VhYmxlID0gISEkYXR0cnMuY2xvc2U7XHJcbiAgJGVsZW1lbnQuYWRkQ2xhc3MoJ2FsZXJ0Jyk7XHJcbiAgJGF0dHJzLiRzZXQoJ3JvbGUnLCAnYWxlcnQnKTtcclxuICBpZiAoJHNjb3BlLmNsb3NlYWJsZSkge1xyXG4gICAgJGVsZW1lbnQuYWRkQ2xhc3MoJ2FsZXJ0LWRpc21pc3NpYmxlJyk7XHJcbiAgfVxyXG5cclxuICB2YXIgZGlzbWlzc09uVGltZW91dCA9IGFuZ3VsYXIuaXNEZWZpbmVkKCRhdHRycy5kaXNtaXNzT25UaW1lb3V0KSA/XHJcbiAgICAkaW50ZXJwb2xhdGUoJGF0dHJzLmRpc21pc3NPblRpbWVvdXQpKCRzY29wZS4kcGFyZW50KSA6IG51bGw7XHJcblxyXG4gIGlmIChkaXNtaXNzT25UaW1lb3V0KSB7XHJcbiAgICAkdGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgJHNjb3BlLmNsb3NlKCk7XHJcbiAgICB9LCBwYXJzZUludChkaXNtaXNzT25UaW1lb3V0LCAxMCkpO1xyXG4gIH1cclxufV0pXHJcblxyXG4uZGlyZWN0aXZlKCd1aWJBbGVydCcsIGZ1bmN0aW9uKCkge1xyXG4gIHJldHVybiB7XHJcbiAgICBjb250cm9sbGVyOiAnVWliQWxlcnRDb250cm9sbGVyJyxcclxuICAgIGNvbnRyb2xsZXJBczogJ2FsZXJ0JyxcclxuICAgIHJlc3RyaWN0OiAnQScsXHJcbiAgICB0ZW1wbGF0ZVVybDogZnVuY3Rpb24oZWxlbWVudCwgYXR0cnMpIHtcclxuICAgICAgcmV0dXJuIGF0dHJzLnRlbXBsYXRlVXJsIHx8ICd1aWIvdGVtcGxhdGUvYWxlcnQvYWxlcnQuaHRtbCc7XHJcbiAgICB9LFxyXG4gICAgdHJhbnNjbHVkZTogdHJ1ZSxcclxuICAgIHNjb3BlOiB7XHJcbiAgICAgIGNsb3NlOiAnJidcclxuICAgIH1cclxuICB9O1xyXG59KTtcclxuXHJcbmFuZ3VsYXIubW9kdWxlKCd1aS5ib290c3RyYXAuYnV0dG9ucycsIFtdKVxyXG5cclxuLmNvbnN0YW50KCd1aWJCdXR0b25Db25maWcnLCB7XHJcbiAgYWN0aXZlQ2xhc3M6ICdhY3RpdmUnLFxyXG4gIHRvZ2dsZUV2ZW50OiAnY2xpY2snXHJcbn0pXHJcblxyXG4uY29udHJvbGxlcignVWliQnV0dG9uc0NvbnRyb2xsZXInLCBbJ3VpYkJ1dHRvbkNvbmZpZycsIGZ1bmN0aW9uKGJ1dHRvbkNvbmZpZykge1xyXG4gIHRoaXMuYWN0aXZlQ2xhc3MgPSBidXR0b25Db25maWcuYWN0aXZlQ2xhc3MgfHwgJ2FjdGl2ZSc7XHJcbiAgdGhpcy50b2dnbGVFdmVudCA9IGJ1dHRvbkNvbmZpZy50b2dnbGVFdmVudCB8fCAnY2xpY2snO1xyXG59XSlcclxuXHJcbi5kaXJlY3RpdmUoJ3VpYkJ0blJhZGlvJywgWyckcGFyc2UnLCBmdW5jdGlvbigkcGFyc2UpIHtcclxuICByZXR1cm4ge1xyXG4gICAgcmVxdWlyZTogWyd1aWJCdG5SYWRpbycsICduZ01vZGVsJ10sXHJcbiAgICBjb250cm9sbGVyOiAnVWliQnV0dG9uc0NvbnRyb2xsZXInLFxyXG4gICAgY29udHJvbGxlckFzOiAnYnV0dG9ucycsXHJcbiAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxlbWVudCwgYXR0cnMsIGN0cmxzKSB7XHJcbiAgICAgIHZhciBidXR0b25zQ3RybCA9IGN0cmxzWzBdLCBuZ01vZGVsQ3RybCA9IGN0cmxzWzFdO1xyXG4gICAgICB2YXIgdW5jaGVja2FibGVFeHByID0gJHBhcnNlKGF0dHJzLnVpYlVuY2hlY2thYmxlKTtcclxuXHJcbiAgICAgIGVsZW1lbnQuZmluZCgnaW5wdXQnKS5jc3Moe2Rpc3BsYXk6ICdub25lJ30pO1xyXG5cclxuICAgICAgLy9tb2RlbCAtPiBVSVxyXG4gICAgICBuZ01vZGVsQ3RybC4kcmVuZGVyID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgZWxlbWVudC50b2dnbGVDbGFzcyhidXR0b25zQ3RybC5hY3RpdmVDbGFzcywgYW5ndWxhci5lcXVhbHMobmdNb2RlbEN0cmwuJG1vZGVsVmFsdWUsIHNjb3BlLiRldmFsKGF0dHJzLnVpYkJ0blJhZGlvKSkpO1xyXG4gICAgICB9O1xyXG5cclxuICAgICAgLy91aS0+bW9kZWxcclxuICAgICAgZWxlbWVudC5vbihidXR0b25zQ3RybC50b2dnbGVFdmVudCwgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgaWYgKGF0dHJzLmRpc2FibGVkKSB7XHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2YXIgaXNBY3RpdmUgPSBlbGVtZW50Lmhhc0NsYXNzKGJ1dHRvbnNDdHJsLmFjdGl2ZUNsYXNzKTtcclxuXHJcbiAgICAgICAgaWYgKCFpc0FjdGl2ZSB8fCBhbmd1bGFyLmlzRGVmaW5lZChhdHRycy51bmNoZWNrYWJsZSkpIHtcclxuICAgICAgICAgIHNjb3BlLiRhcHBseShmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgbmdNb2RlbEN0cmwuJHNldFZpZXdWYWx1ZShpc0FjdGl2ZSA/IG51bGwgOiBzY29wZS4kZXZhbChhdHRycy51aWJCdG5SYWRpbykpO1xyXG4gICAgICAgICAgICBuZ01vZGVsQ3RybC4kcmVuZGVyKCk7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgaWYgKGF0dHJzLnVpYlVuY2hlY2thYmxlKSB7XHJcbiAgICAgICAgc2NvcGUuJHdhdGNoKHVuY2hlY2thYmxlRXhwciwgZnVuY3Rpb24odW5jaGVja2FibGUpIHtcclxuICAgICAgICAgIGF0dHJzLiRzZXQoJ3VuY2hlY2thYmxlJywgdW5jaGVja2FibGUgPyAnJyA6IHVuZGVmaW5lZCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9O1xyXG59XSlcclxuXHJcbi5kaXJlY3RpdmUoJ3VpYkJ0bkNoZWNrYm94JywgZnVuY3Rpb24oKSB7XHJcbiAgcmV0dXJuIHtcclxuICAgIHJlcXVpcmU6IFsndWliQnRuQ2hlY2tib3gnLCAnbmdNb2RlbCddLFxyXG4gICAgY29udHJvbGxlcjogJ1VpYkJ1dHRvbnNDb250cm9sbGVyJyxcclxuICAgIGNvbnRyb2xsZXJBczogJ2J1dHRvbicsXHJcbiAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxlbWVudCwgYXR0cnMsIGN0cmxzKSB7XHJcbiAgICAgIHZhciBidXR0b25zQ3RybCA9IGN0cmxzWzBdLCBuZ01vZGVsQ3RybCA9IGN0cmxzWzFdO1xyXG5cclxuICAgICAgZWxlbWVudC5maW5kKCdpbnB1dCcpLmNzcyh7ZGlzcGxheTogJ25vbmUnfSk7XHJcblxyXG4gICAgICBmdW5jdGlvbiBnZXRUcnVlVmFsdWUoKSB7XHJcbiAgICAgICAgcmV0dXJuIGdldENoZWNrYm94VmFsdWUoYXR0cnMuYnRuQ2hlY2tib3hUcnVlLCB0cnVlKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgZnVuY3Rpb24gZ2V0RmFsc2VWYWx1ZSgpIHtcclxuICAgICAgICByZXR1cm4gZ2V0Q2hlY2tib3hWYWx1ZShhdHRycy5idG5DaGVja2JveEZhbHNlLCBmYWxzZSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGZ1bmN0aW9uIGdldENoZWNrYm94VmFsdWUoYXR0cmlidXRlLCBkZWZhdWx0VmFsdWUpIHtcclxuICAgICAgICByZXR1cm4gYW5ndWxhci5pc0RlZmluZWQoYXR0cmlidXRlKSA/IHNjb3BlLiRldmFsKGF0dHJpYnV0ZSkgOiBkZWZhdWx0VmFsdWU7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vbW9kZWwgLT4gVUlcclxuICAgICAgbmdNb2RlbEN0cmwuJHJlbmRlciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGVsZW1lbnQudG9nZ2xlQ2xhc3MoYnV0dG9uc0N0cmwuYWN0aXZlQ2xhc3MsIGFuZ3VsYXIuZXF1YWxzKG5nTW9kZWxDdHJsLiRtb2RlbFZhbHVlLCBnZXRUcnVlVmFsdWUoKSkpO1xyXG4gICAgICB9O1xyXG5cclxuICAgICAgLy91aS0+bW9kZWxcclxuICAgICAgZWxlbWVudC5vbihidXR0b25zQ3RybC50b2dnbGVFdmVudCwgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgaWYgKGF0dHJzLmRpc2FibGVkKSB7XHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBzY29wZS4kYXBwbHkoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICBuZ01vZGVsQ3RybC4kc2V0Vmlld1ZhbHVlKGVsZW1lbnQuaGFzQ2xhc3MoYnV0dG9uc0N0cmwuYWN0aXZlQ2xhc3MpID8gZ2V0RmFsc2VWYWx1ZSgpIDogZ2V0VHJ1ZVZhbHVlKCkpO1xyXG4gICAgICAgICAgbmdNb2RlbEN0cmwuJHJlbmRlcigpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuICB9O1xyXG59KTtcclxuXHJcbmFuZ3VsYXIubW9kdWxlKCd1aS5ib290c3RyYXAuY2Fyb3VzZWwnLCBbXSlcclxuXHJcbi5jb250cm9sbGVyKCdVaWJDYXJvdXNlbENvbnRyb2xsZXInLCBbJyRzY29wZScsICckZWxlbWVudCcsICckaW50ZXJ2YWwnLCAnJHRpbWVvdXQnLCAnJGFuaW1hdGUnLCBmdW5jdGlvbigkc2NvcGUsICRlbGVtZW50LCAkaW50ZXJ2YWwsICR0aW1lb3V0LCAkYW5pbWF0ZSkge1xyXG4gIHZhciBzZWxmID0gdGhpcyxcclxuICAgIHNsaWRlcyA9IHNlbGYuc2xpZGVzID0gJHNjb3BlLnNsaWRlcyA9IFtdLFxyXG4gICAgU0xJREVfRElSRUNUSU9OID0gJ3VpYi1zbGlkZURpcmVjdGlvbicsXHJcbiAgICBjdXJyZW50SW5kZXggPSAkc2NvcGUuYWN0aXZlLFxyXG4gICAgY3VycmVudEludGVydmFsLCBpc1BsYXlpbmcsIGJ1ZmZlcmVkVHJhbnNpdGlvbnMgPSBbXTtcclxuXHJcbiAgdmFyIGRlc3Ryb3llZCA9IGZhbHNlO1xyXG4gICRlbGVtZW50LmFkZENsYXNzKCdjYXJvdXNlbCcpO1xyXG5cclxuICBzZWxmLmFkZFNsaWRlID0gZnVuY3Rpb24oc2xpZGUsIGVsZW1lbnQpIHtcclxuICAgIHNsaWRlcy5wdXNoKHtcclxuICAgICAgc2xpZGU6IHNsaWRlLFxyXG4gICAgICBlbGVtZW50OiBlbGVtZW50XHJcbiAgICB9KTtcclxuICAgIHNsaWRlcy5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcclxuICAgICAgcmV0dXJuICthLnNsaWRlLmluZGV4IC0gK2Iuc2xpZGUuaW5kZXg7XHJcbiAgICB9KTtcclxuICAgIC8vaWYgdGhpcyBpcyB0aGUgZmlyc3Qgc2xpZGUgb3IgdGhlIHNsaWRlIGlzIHNldCB0byBhY3RpdmUsIHNlbGVjdCBpdFxyXG4gICAgaWYgKHNsaWRlLmluZGV4ID09PSAkc2NvcGUuYWN0aXZlIHx8IHNsaWRlcy5sZW5ndGggPT09IDEgJiYgIWFuZ3VsYXIuaXNOdW1iZXIoJHNjb3BlLmFjdGl2ZSkpIHtcclxuICAgICAgaWYgKCRzY29wZS4kY3VycmVudFRyYW5zaXRpb24pIHtcclxuICAgICAgICAkc2NvcGUuJGN1cnJlbnRUcmFuc2l0aW9uID0gbnVsbDtcclxuICAgICAgfVxyXG5cclxuICAgICAgY3VycmVudEluZGV4ID0gc2xpZGUuaW5kZXg7XHJcbiAgICAgICRzY29wZS5hY3RpdmUgPSBzbGlkZS5pbmRleDtcclxuICAgICAgc2V0QWN0aXZlKGN1cnJlbnRJbmRleCk7XHJcbiAgICAgIHNlbGYuc2VsZWN0KHNsaWRlc1tmaW5kU2xpZGVJbmRleChzbGlkZSldKTtcclxuICAgICAgaWYgKHNsaWRlcy5sZW5ndGggPT09IDEpIHtcclxuICAgICAgICAkc2NvcGUucGxheSgpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgc2VsZi5nZXRDdXJyZW50SW5kZXggPSBmdW5jdGlvbigpIHtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc2xpZGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIGlmIChzbGlkZXNbaV0uc2xpZGUuaW5kZXggPT09IGN1cnJlbnRJbmRleCkge1xyXG4gICAgICAgIHJldHVybiBpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgc2VsZi5uZXh0ID0gJHNjb3BlLm5leHQgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBuZXdJbmRleCA9IChzZWxmLmdldEN1cnJlbnRJbmRleCgpICsgMSkgJSBzbGlkZXMubGVuZ3RoO1xyXG5cclxuICAgIGlmIChuZXdJbmRleCA9PT0gMCAmJiAkc2NvcGUubm9XcmFwKCkpIHtcclxuICAgICAgJHNjb3BlLnBhdXNlKCk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gc2VsZi5zZWxlY3Qoc2xpZGVzW25ld0luZGV4XSwgJ25leHQnKTtcclxuICB9O1xyXG5cclxuICBzZWxmLnByZXYgPSAkc2NvcGUucHJldiA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIG5ld0luZGV4ID0gc2VsZi5nZXRDdXJyZW50SW5kZXgoKSAtIDEgPCAwID8gc2xpZGVzLmxlbmd0aCAtIDEgOiBzZWxmLmdldEN1cnJlbnRJbmRleCgpIC0gMTtcclxuXHJcbiAgICBpZiAoJHNjb3BlLm5vV3JhcCgpICYmIG5ld0luZGV4ID09PSBzbGlkZXMubGVuZ3RoIC0gMSkge1xyXG4gICAgICAkc2NvcGUucGF1c2UoKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBzZWxmLnNlbGVjdChzbGlkZXNbbmV3SW5kZXhdLCAncHJldicpO1xyXG4gIH07XHJcblxyXG4gIHNlbGYucmVtb3ZlU2xpZGUgPSBmdW5jdGlvbihzbGlkZSkge1xyXG4gICAgdmFyIGluZGV4ID0gZmluZFNsaWRlSW5kZXgoc2xpZGUpO1xyXG5cclxuICAgIHZhciBidWZmZXJlZEluZGV4ID0gYnVmZmVyZWRUcmFuc2l0aW9ucy5pbmRleE9mKHNsaWRlc1tpbmRleF0pO1xyXG4gICAgaWYgKGJ1ZmZlcmVkSW5kZXggIT09IC0xKSB7XHJcbiAgICAgIGJ1ZmZlcmVkVHJhbnNpdGlvbnMuc3BsaWNlKGJ1ZmZlcmVkSW5kZXgsIDEpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vZ2V0IHRoZSBpbmRleCBvZiB0aGUgc2xpZGUgaW5zaWRlIHRoZSBjYXJvdXNlbFxyXG4gICAgc2xpZGVzLnNwbGljZShpbmRleCwgMSk7XHJcbiAgICBpZiAoc2xpZGVzLmxlbmd0aCA+IDAgJiYgY3VycmVudEluZGV4ID09PSBpbmRleCkge1xyXG4gICAgICBpZiAoaW5kZXggPj0gc2xpZGVzLmxlbmd0aCkge1xyXG4gICAgICAgIGN1cnJlbnRJbmRleCA9IHNsaWRlcy5sZW5ndGggLSAxO1xyXG4gICAgICAgICRzY29wZS5hY3RpdmUgPSBjdXJyZW50SW5kZXg7XHJcbiAgICAgICAgc2V0QWN0aXZlKGN1cnJlbnRJbmRleCk7XHJcbiAgICAgICAgc2VsZi5zZWxlY3Qoc2xpZGVzW3NsaWRlcy5sZW5ndGggLSAxXSk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgY3VycmVudEluZGV4ID0gaW5kZXg7XHJcbiAgICAgICAgJHNjb3BlLmFjdGl2ZSA9IGN1cnJlbnRJbmRleDtcclxuICAgICAgICBzZXRBY3RpdmUoY3VycmVudEluZGV4KTtcclxuICAgICAgICBzZWxmLnNlbGVjdChzbGlkZXNbaW5kZXhdKTtcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIGlmIChjdXJyZW50SW5kZXggPiBpbmRleCkge1xyXG4gICAgICBjdXJyZW50SW5kZXgtLTtcclxuICAgICAgJHNjb3BlLmFjdGl2ZSA9IGN1cnJlbnRJbmRleDtcclxuICAgIH1cclxuXHJcbiAgICAvL2NsZWFuIHRoZSBhY3RpdmUgdmFsdWUgd2hlbiBubyBtb3JlIHNsaWRlXHJcbiAgICBpZiAoc2xpZGVzLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICBjdXJyZW50SW5kZXggPSBudWxsO1xyXG4gICAgICAkc2NvcGUuYWN0aXZlID0gbnVsbDtcclxuICAgICAgY2xlYXJCdWZmZXJlZFRyYW5zaXRpb25zKCk7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgLyogZGlyZWN0aW9uOiBcInByZXZcIiBvciBcIm5leHRcIiAqL1xyXG4gIHNlbGYuc2VsZWN0ID0gJHNjb3BlLnNlbGVjdCA9IGZ1bmN0aW9uKG5leHRTbGlkZSwgZGlyZWN0aW9uKSB7XHJcbiAgICB2YXIgbmV4dEluZGV4ID0gZmluZFNsaWRlSW5kZXgobmV4dFNsaWRlLnNsaWRlKTtcclxuICAgIC8vRGVjaWRlIGRpcmVjdGlvbiBpZiBpdCdzIG5vdCBnaXZlblxyXG4gICAgaWYgKGRpcmVjdGlvbiA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgIGRpcmVjdGlvbiA9IG5leHRJbmRleCA+IHNlbGYuZ2V0Q3VycmVudEluZGV4KCkgPyAnbmV4dCcgOiAncHJldic7XHJcbiAgICB9XHJcbiAgICAvL1ByZXZlbnQgdGhpcyB1c2VyLXRyaWdnZXJlZCB0cmFuc2l0aW9uIGZyb20gb2NjdXJyaW5nIGlmIHRoZXJlIGlzIGFscmVhZHkgb25lIGluIHByb2dyZXNzXHJcbiAgICBpZiAobmV4dFNsaWRlLnNsaWRlLmluZGV4ICE9PSBjdXJyZW50SW5kZXggJiZcclxuICAgICAgISRzY29wZS4kY3VycmVudFRyYW5zaXRpb24pIHtcclxuICAgICAgZ29OZXh0KG5leHRTbGlkZS5zbGlkZSwgbmV4dEluZGV4LCBkaXJlY3Rpb24pO1xyXG4gICAgfSBlbHNlIGlmIChuZXh0U2xpZGUgJiYgbmV4dFNsaWRlLnNsaWRlLmluZGV4ICE9PSBjdXJyZW50SW5kZXggJiYgJHNjb3BlLiRjdXJyZW50VHJhbnNpdGlvbikge1xyXG4gICAgICBidWZmZXJlZFRyYW5zaXRpb25zLnB1c2goc2xpZGVzW25leHRJbmRleF0pO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIC8qIEFsbG93IG91dHNpZGUgcGVvcGxlIHRvIGNhbGwgaW5kZXhPZiBvbiBzbGlkZXMgYXJyYXkgKi9cclxuICAkc2NvcGUuaW5kZXhPZlNsaWRlID0gZnVuY3Rpb24oc2xpZGUpIHtcclxuICAgIHJldHVybiArc2xpZGUuc2xpZGUuaW5kZXg7XHJcbiAgfTtcclxuXHJcbiAgJHNjb3BlLmlzQWN0aXZlID0gZnVuY3Rpb24oc2xpZGUpIHtcclxuICAgIHJldHVybiAkc2NvcGUuYWN0aXZlID09PSBzbGlkZS5zbGlkZS5pbmRleDtcclxuICB9O1xyXG5cclxuICAkc2NvcGUuaXNQcmV2RGlzYWJsZWQgPSBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiAkc2NvcGUuYWN0aXZlID09PSAwICYmICRzY29wZS5ub1dyYXAoKTtcclxuICB9O1xyXG5cclxuICAkc2NvcGUuaXNOZXh0RGlzYWJsZWQgPSBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiAkc2NvcGUuYWN0aXZlID09PSBzbGlkZXMubGVuZ3RoIC0gMSAmJiAkc2NvcGUubm9XcmFwKCk7XHJcbiAgfTtcclxuXHJcbiAgJHNjb3BlLnBhdXNlID0gZnVuY3Rpb24oKSB7XHJcbiAgICBpZiAoISRzY29wZS5ub1BhdXNlKSB7XHJcbiAgICAgIGlzUGxheWluZyA9IGZhbHNlO1xyXG4gICAgICByZXNldFRpbWVyKCk7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgJHNjb3BlLnBsYXkgPSBmdW5jdGlvbigpIHtcclxuICAgIGlmICghaXNQbGF5aW5nKSB7XHJcbiAgICAgIGlzUGxheWluZyA9IHRydWU7XHJcbiAgICAgIHJlc3RhcnRUaW1lcigpO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gICRlbGVtZW50Lm9uKCdtb3VzZWVudGVyJywgJHNjb3BlLnBhdXNlKTtcclxuICAkZWxlbWVudC5vbignbW91c2VsZWF2ZScsICRzY29wZS5wbGF5KTtcclxuXHJcbiAgJHNjb3BlLiRvbignJGRlc3Ryb3knLCBmdW5jdGlvbigpIHtcclxuICAgIGRlc3Ryb3llZCA9IHRydWU7XHJcbiAgICByZXNldFRpbWVyKCk7XHJcbiAgfSk7XHJcblxyXG4gICRzY29wZS4kd2F0Y2goJ25vVHJhbnNpdGlvbicsIGZ1bmN0aW9uKG5vVHJhbnNpdGlvbikge1xyXG4gICAgJGFuaW1hdGUuZW5hYmxlZCgkZWxlbWVudCwgIW5vVHJhbnNpdGlvbik7XHJcbiAgfSk7XHJcblxyXG4gICRzY29wZS4kd2F0Y2goJ2ludGVydmFsJywgcmVzdGFydFRpbWVyKTtcclxuXHJcbiAgJHNjb3BlLiR3YXRjaENvbGxlY3Rpb24oJ3NsaWRlcycsIHJlc2V0VHJhbnNpdGlvbik7XHJcblxyXG4gICRzY29wZS4kd2F0Y2goJ2FjdGl2ZScsIGZ1bmN0aW9uKGluZGV4KSB7XHJcbiAgICBpZiAoYW5ndWxhci5pc051bWJlcihpbmRleCkgJiYgY3VycmVudEluZGV4ICE9PSBpbmRleCkge1xyXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNsaWRlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGlmIChzbGlkZXNbaV0uc2xpZGUuaW5kZXggPT09IGluZGV4KSB7XHJcbiAgICAgICAgICBpbmRleCA9IGk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHZhciBzbGlkZSA9IHNsaWRlc1tpbmRleF07XHJcbiAgICAgIGlmIChzbGlkZSkge1xyXG4gICAgICAgIHNldEFjdGl2ZShpbmRleCk7XHJcbiAgICAgICAgc2VsZi5zZWxlY3Qoc2xpZGVzW2luZGV4XSk7XHJcbiAgICAgICAgY3VycmVudEluZGV4ID0gaW5kZXg7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9KTtcclxuXHJcbiAgZnVuY3Rpb24gY2xlYXJCdWZmZXJlZFRyYW5zaXRpb25zKCkge1xyXG4gICAgd2hpbGUgKGJ1ZmZlcmVkVHJhbnNpdGlvbnMubGVuZ3RoKSB7XHJcbiAgICAgIGJ1ZmZlcmVkVHJhbnNpdGlvbnMuc2hpZnQoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGdldFNsaWRlQnlJbmRleChpbmRleCkge1xyXG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSBzbGlkZXMubGVuZ3RoOyBpIDwgbDsgKytpKSB7XHJcbiAgICAgIGlmIChzbGlkZXNbaV0uaW5kZXggPT09IGluZGV4KSB7XHJcbiAgICAgICAgcmV0dXJuIHNsaWRlc1tpXTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gc2V0QWN0aXZlKGluZGV4KSB7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNsaWRlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICBzbGlkZXNbaV0uc2xpZGUuYWN0aXZlID0gaSA9PT0gaW5kZXg7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBnb05leHQoc2xpZGUsIGluZGV4LCBkaXJlY3Rpb24pIHtcclxuICAgIGlmIChkZXN0cm95ZWQpIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGFuZ3VsYXIuZXh0ZW5kKHNsaWRlLCB7ZGlyZWN0aW9uOiBkaXJlY3Rpb259KTtcclxuICAgIGFuZ3VsYXIuZXh0ZW5kKHNsaWRlc1tjdXJyZW50SW5kZXhdLnNsaWRlIHx8IHt9LCB7ZGlyZWN0aW9uOiBkaXJlY3Rpb259KTtcclxuICAgIGlmICgkYW5pbWF0ZS5lbmFibGVkKCRlbGVtZW50KSAmJiAhJHNjb3BlLiRjdXJyZW50VHJhbnNpdGlvbiAmJlxyXG4gICAgICBzbGlkZXNbaW5kZXhdLmVsZW1lbnQgJiYgc2VsZi5zbGlkZXMubGVuZ3RoID4gMSkge1xyXG4gICAgICBzbGlkZXNbaW5kZXhdLmVsZW1lbnQuZGF0YShTTElERV9ESVJFQ1RJT04sIHNsaWRlLmRpcmVjdGlvbik7XHJcbiAgICAgIHZhciBjdXJyZW50SWR4ID0gc2VsZi5nZXRDdXJyZW50SW5kZXgoKTtcclxuXHJcbiAgICAgIGlmIChhbmd1bGFyLmlzTnVtYmVyKGN1cnJlbnRJZHgpICYmIHNsaWRlc1tjdXJyZW50SWR4XS5lbGVtZW50KSB7XHJcbiAgICAgICAgc2xpZGVzW2N1cnJlbnRJZHhdLmVsZW1lbnQuZGF0YShTTElERV9ESVJFQ1RJT04sIHNsaWRlLmRpcmVjdGlvbik7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgICRzY29wZS4kY3VycmVudFRyYW5zaXRpb24gPSB0cnVlO1xyXG4gICAgICAkYW5pbWF0ZS5vbignYWRkQ2xhc3MnLCBzbGlkZXNbaW5kZXhdLmVsZW1lbnQsIGZ1bmN0aW9uKGVsZW1lbnQsIHBoYXNlKSB7XHJcbiAgICAgICAgaWYgKHBoYXNlID09PSAnY2xvc2UnKSB7XHJcbiAgICAgICAgICAkc2NvcGUuJGN1cnJlbnRUcmFuc2l0aW9uID0gbnVsbDtcclxuICAgICAgICAgICRhbmltYXRlLm9mZignYWRkQ2xhc3MnLCBlbGVtZW50KTtcclxuICAgICAgICAgIGlmIChidWZmZXJlZFRyYW5zaXRpb25zLmxlbmd0aCkge1xyXG4gICAgICAgICAgICB2YXIgbmV4dFNsaWRlID0gYnVmZmVyZWRUcmFuc2l0aW9ucy5wb3AoKS5zbGlkZTtcclxuICAgICAgICAgICAgdmFyIG5leHRJbmRleCA9IG5leHRTbGlkZS5pbmRleDtcclxuICAgICAgICAgICAgdmFyIG5leHREaXJlY3Rpb24gPSBuZXh0SW5kZXggPiBzZWxmLmdldEN1cnJlbnRJbmRleCgpID8gJ25leHQnIDogJ3ByZXYnO1xyXG4gICAgICAgICAgICBjbGVhckJ1ZmZlcmVkVHJhbnNpdGlvbnMoKTtcclxuXHJcbiAgICAgICAgICAgIGdvTmV4dChuZXh0U2xpZGUsIG5leHRJbmRleCwgbmV4dERpcmVjdGlvbik7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAkc2NvcGUuYWN0aXZlID0gc2xpZGUuaW5kZXg7XHJcbiAgICBjdXJyZW50SW5kZXggPSBzbGlkZS5pbmRleDtcclxuICAgIHNldEFjdGl2ZShpbmRleCk7XHJcblxyXG4gICAgLy9ldmVyeSB0aW1lIHlvdSBjaGFuZ2Ugc2xpZGVzLCByZXNldCB0aGUgdGltZXJcclxuICAgIHJlc3RhcnRUaW1lcigpO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gZmluZFNsaWRlSW5kZXgoc2xpZGUpIHtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc2xpZGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIGlmIChzbGlkZXNbaV0uc2xpZGUgPT09IHNsaWRlKSB7XHJcbiAgICAgICAgcmV0dXJuIGk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHJlc2V0VGltZXIoKSB7XHJcbiAgICBpZiAoY3VycmVudEludGVydmFsKSB7XHJcbiAgICAgICRpbnRlcnZhbC5jYW5jZWwoY3VycmVudEludGVydmFsKTtcclxuICAgICAgY3VycmVudEludGVydmFsID0gbnVsbDtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHJlc2V0VHJhbnNpdGlvbihzbGlkZXMpIHtcclxuICAgIGlmICghc2xpZGVzLmxlbmd0aCkge1xyXG4gICAgICAkc2NvcGUuJGN1cnJlbnRUcmFuc2l0aW9uID0gbnVsbDtcclxuICAgICAgY2xlYXJCdWZmZXJlZFRyYW5zaXRpb25zKCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiByZXN0YXJ0VGltZXIoKSB7XHJcbiAgICByZXNldFRpbWVyKCk7XHJcbiAgICB2YXIgaW50ZXJ2YWwgPSArJHNjb3BlLmludGVydmFsO1xyXG4gICAgaWYgKCFpc05hTihpbnRlcnZhbCkgJiYgaW50ZXJ2YWwgPiAwKSB7XHJcbiAgICAgIGN1cnJlbnRJbnRlcnZhbCA9ICRpbnRlcnZhbCh0aW1lckZuLCBpbnRlcnZhbCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiB0aW1lckZuKCkge1xyXG4gICAgdmFyIGludGVydmFsID0gKyRzY29wZS5pbnRlcnZhbDtcclxuICAgIGlmIChpc1BsYXlpbmcgJiYgIWlzTmFOKGludGVydmFsKSAmJiBpbnRlcnZhbCA+IDAgJiYgc2xpZGVzLmxlbmd0aCkge1xyXG4gICAgICAkc2NvcGUubmV4dCgpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgJHNjb3BlLnBhdXNlKCk7XHJcbiAgICB9XHJcbiAgfVxyXG59XSlcclxuXHJcbi5kaXJlY3RpdmUoJ3VpYkNhcm91c2VsJywgZnVuY3Rpb24oKSB7XHJcbiAgcmV0dXJuIHtcclxuICAgIHRyYW5zY2x1ZGU6IHRydWUsXHJcbiAgICBjb250cm9sbGVyOiAnVWliQ2Fyb3VzZWxDb250cm9sbGVyJyxcclxuICAgIGNvbnRyb2xsZXJBczogJ2Nhcm91c2VsJyxcclxuICAgIHJlc3RyaWN0OiAnQScsXHJcbiAgICB0ZW1wbGF0ZVVybDogZnVuY3Rpb24oZWxlbWVudCwgYXR0cnMpIHtcclxuICAgICAgcmV0dXJuIGF0dHJzLnRlbXBsYXRlVXJsIHx8ICd1aWIvdGVtcGxhdGUvY2Fyb3VzZWwvY2Fyb3VzZWwuaHRtbCc7XHJcbiAgICB9LFxyXG4gICAgc2NvcGU6IHtcclxuICAgICAgYWN0aXZlOiAnPScsXHJcbiAgICAgIGludGVydmFsOiAnPScsXHJcbiAgICAgIG5vVHJhbnNpdGlvbjogJz0nLFxyXG4gICAgICBub1BhdXNlOiAnPScsXHJcbiAgICAgIG5vV3JhcDogJyYnXHJcbiAgICB9XHJcbiAgfTtcclxufSlcclxuXHJcbi5kaXJlY3RpdmUoJ3VpYlNsaWRlJywgWyckYW5pbWF0ZScsIGZ1bmN0aW9uKCRhbmltYXRlKSB7XHJcbiAgcmV0dXJuIHtcclxuICAgIHJlcXVpcmU6ICdedWliQ2Fyb3VzZWwnLFxyXG4gICAgcmVzdHJpY3Q6ICdBJyxcclxuICAgIHRyYW5zY2x1ZGU6IHRydWUsXHJcbiAgICB0ZW1wbGF0ZVVybDogZnVuY3Rpb24oZWxlbWVudCwgYXR0cnMpIHtcclxuICAgICAgcmV0dXJuIGF0dHJzLnRlbXBsYXRlVXJsIHx8ICd1aWIvdGVtcGxhdGUvY2Fyb3VzZWwvc2xpZGUuaHRtbCc7XHJcbiAgICB9LFxyXG4gICAgc2NvcGU6IHtcclxuICAgICAgYWN0dWFsOiAnPT8nLFxyXG4gICAgICBpbmRleDogJz0/J1xyXG4gICAgfSxcclxuICAgIGxpbms6IGZ1bmN0aW9uIChzY29wZSwgZWxlbWVudCwgYXR0cnMsIGNhcm91c2VsQ3RybCkge1xyXG4gICAgICBlbGVtZW50LmFkZENsYXNzKCdpdGVtJyk7XHJcbiAgICAgIGNhcm91c2VsQ3RybC5hZGRTbGlkZShzY29wZSwgZWxlbWVudCk7XHJcbiAgICAgIC8vd2hlbiB0aGUgc2NvcGUgaXMgZGVzdHJveWVkIHRoZW4gcmVtb3ZlIHRoZSBzbGlkZSBmcm9tIHRoZSBjdXJyZW50IHNsaWRlcyBhcnJheVxyXG4gICAgICBzY29wZS4kb24oJyRkZXN0cm95JywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgY2Fyb3VzZWxDdHJsLnJlbW92ZVNsaWRlKHNjb3BlKTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICBzY29wZS4kd2F0Y2goJ2FjdGl2ZScsIGZ1bmN0aW9uKGFjdGl2ZSkge1xyXG4gICAgICAgICRhbmltYXRlW2FjdGl2ZSA/ICdhZGRDbGFzcycgOiAncmVtb3ZlQ2xhc3MnXShlbGVtZW50LCAnYWN0aXZlJyk7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH07XHJcbn1dKVxyXG5cclxuLmFuaW1hdGlvbignLml0ZW0nLCBbJyRhbmltYXRlQ3NzJyxcclxuZnVuY3Rpb24oJGFuaW1hdGVDc3MpIHtcclxuICB2YXIgU0xJREVfRElSRUNUSU9OID0gJ3VpYi1zbGlkZURpcmVjdGlvbic7XHJcblxyXG4gIGZ1bmN0aW9uIHJlbW92ZUNsYXNzKGVsZW1lbnQsIGNsYXNzTmFtZSwgY2FsbGJhY2spIHtcclxuICAgIGVsZW1lbnQucmVtb3ZlQ2xhc3MoY2xhc3NOYW1lKTtcclxuICAgIGlmIChjYWxsYmFjaykge1xyXG4gICAgICBjYWxsYmFjaygpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHtcclxuICAgIGJlZm9yZUFkZENsYXNzOiBmdW5jdGlvbihlbGVtZW50LCBjbGFzc05hbWUsIGRvbmUpIHtcclxuICAgICAgaWYgKGNsYXNzTmFtZSA9PT0gJ2FjdGl2ZScpIHtcclxuICAgICAgICB2YXIgc3RvcHBlZCA9IGZhbHNlO1xyXG4gICAgICAgIHZhciBkaXJlY3Rpb24gPSBlbGVtZW50LmRhdGEoU0xJREVfRElSRUNUSU9OKTtcclxuICAgICAgICB2YXIgZGlyZWN0aW9uQ2xhc3MgPSBkaXJlY3Rpb24gPT09ICduZXh0JyA/ICdsZWZ0JyA6ICdyaWdodCc7XHJcbiAgICAgICAgdmFyIHJlbW92ZUNsYXNzRm4gPSByZW1vdmVDbGFzcy5iaW5kKHRoaXMsIGVsZW1lbnQsXHJcbiAgICAgICAgICBkaXJlY3Rpb25DbGFzcyArICcgJyArIGRpcmVjdGlvbiwgZG9uZSk7XHJcbiAgICAgICAgZWxlbWVudC5hZGRDbGFzcyhkaXJlY3Rpb24pO1xyXG5cclxuICAgICAgICAkYW5pbWF0ZUNzcyhlbGVtZW50LCB7YWRkQ2xhc3M6IGRpcmVjdGlvbkNsYXNzfSlcclxuICAgICAgICAgIC5zdGFydCgpXHJcbiAgICAgICAgICAuZG9uZShyZW1vdmVDbGFzc0ZuKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgc3RvcHBlZCA9IHRydWU7XHJcbiAgICAgICAgfTtcclxuICAgICAgfVxyXG4gICAgICBkb25lKCk7XHJcbiAgICB9LFxyXG4gICAgYmVmb3JlUmVtb3ZlQ2xhc3M6IGZ1bmN0aW9uIChlbGVtZW50LCBjbGFzc05hbWUsIGRvbmUpIHtcclxuICAgICAgaWYgKGNsYXNzTmFtZSA9PT0gJ2FjdGl2ZScpIHtcclxuICAgICAgICB2YXIgc3RvcHBlZCA9IGZhbHNlO1xyXG4gICAgICAgIHZhciBkaXJlY3Rpb24gPSBlbGVtZW50LmRhdGEoU0xJREVfRElSRUNUSU9OKTtcclxuICAgICAgICB2YXIgZGlyZWN0aW9uQ2xhc3MgPSBkaXJlY3Rpb24gPT09ICduZXh0JyA/ICdsZWZ0JyA6ICdyaWdodCc7XHJcbiAgICAgICAgdmFyIHJlbW92ZUNsYXNzRm4gPSByZW1vdmVDbGFzcy5iaW5kKHRoaXMsIGVsZW1lbnQsIGRpcmVjdGlvbkNsYXNzLCBkb25lKTtcclxuXHJcbiAgICAgICAgJGFuaW1hdGVDc3MoZWxlbWVudCwge2FkZENsYXNzOiBkaXJlY3Rpb25DbGFzc30pXHJcbiAgICAgICAgICAuc3RhcnQoKVxyXG4gICAgICAgICAgLmRvbmUocmVtb3ZlQ2xhc3NGbik7XHJcblxyXG4gICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgIHN0b3BwZWQgPSB0cnVlO1xyXG4gICAgICAgIH07XHJcbiAgICAgIH1cclxuICAgICAgZG9uZSgpO1xyXG4gICAgfVxyXG4gIH07XHJcbn1dKTtcclxuXHJcbmFuZ3VsYXIubW9kdWxlKCd1aS5ib290c3RyYXAuZGF0ZXBhcnNlcicsIFtdKVxyXG5cclxuLnNlcnZpY2UoJ3VpYkRhdGVQYXJzZXInLCBbJyRsb2cnLCAnJGxvY2FsZScsICdkYXRlRmlsdGVyJywgJ29yZGVyQnlGaWx0ZXInLCBmdW5jdGlvbigkbG9nLCAkbG9jYWxlLCBkYXRlRmlsdGVyLCBvcmRlckJ5RmlsdGVyKSB7XHJcbiAgLy8gUHVsbGVkIGZyb20gaHR0cHM6Ly9naXRodWIuY29tL21ib3N0b2NrL2QzL2Jsb2IvbWFzdGVyL3NyYy9mb3JtYXQvcmVxdW90ZS5qc1xyXG4gIHZhciBTUEVDSUFMX0NIQVJBQ1RFUlNfUkVHRVhQID0gL1tcXFxcXFxeXFwkXFwqXFwrXFw/XFx8XFxbXFxdXFwoXFwpXFwuXFx7XFx9XS9nO1xyXG5cclxuICB2YXIgbG9jYWxlSWQ7XHJcbiAgdmFyIGZvcm1hdENvZGVUb1JlZ2V4O1xyXG5cclxuICB0aGlzLmluaXQgPSBmdW5jdGlvbigpIHtcclxuICAgIGxvY2FsZUlkID0gJGxvY2FsZS5pZDtcclxuXHJcbiAgICB0aGlzLnBhcnNlcnMgPSB7fTtcclxuICAgIHRoaXMuZm9ybWF0dGVycyA9IHt9O1xyXG5cclxuICAgIGZvcm1hdENvZGVUb1JlZ2V4ID0gW1xyXG4gICAgICB7XHJcbiAgICAgICAga2V5OiAneXl5eScsXHJcbiAgICAgICAgcmVnZXg6ICdcXFxcZHs0fScsXHJcbiAgICAgICAgYXBwbHk6IGZ1bmN0aW9uKHZhbHVlKSB7IHRoaXMueWVhciA9ICt2YWx1ZTsgfSxcclxuICAgICAgICBmb3JtYXR0ZXI6IGZ1bmN0aW9uKGRhdGUpIHtcclxuICAgICAgICAgIHZhciBfZGF0ZSA9IG5ldyBEYXRlKCk7XHJcbiAgICAgICAgICBfZGF0ZS5zZXRGdWxsWWVhcihNYXRoLmFicyhkYXRlLmdldEZ1bGxZZWFyKCkpKTtcclxuICAgICAgICAgIHJldHVybiBkYXRlRmlsdGVyKF9kYXRlLCAneXl5eScpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIGtleTogJ3l5JyxcclxuICAgICAgICByZWdleDogJ1xcXFxkezJ9JyxcclxuICAgICAgICBhcHBseTogZnVuY3Rpb24odmFsdWUpIHsgdmFsdWUgPSArdmFsdWU7IHRoaXMueWVhciA9IHZhbHVlIDwgNjkgPyB2YWx1ZSArIDIwMDAgOiB2YWx1ZSArIDE5MDA7IH0sXHJcbiAgICAgICAgZm9ybWF0dGVyOiBmdW5jdGlvbihkYXRlKSB7XHJcbiAgICAgICAgICB2YXIgX2RhdGUgPSBuZXcgRGF0ZSgpO1xyXG4gICAgICAgICAgX2RhdGUuc2V0RnVsbFllYXIoTWF0aC5hYnMoZGF0ZS5nZXRGdWxsWWVhcigpKSk7XHJcbiAgICAgICAgICByZXR1cm4gZGF0ZUZpbHRlcihfZGF0ZSwgJ3l5Jyk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAga2V5OiAneScsXHJcbiAgICAgICAgcmVnZXg6ICdcXFxcZHsxLDR9JyxcclxuICAgICAgICBhcHBseTogZnVuY3Rpb24odmFsdWUpIHsgdGhpcy55ZWFyID0gK3ZhbHVlOyB9LFxyXG4gICAgICAgIGZvcm1hdHRlcjogZnVuY3Rpb24oZGF0ZSkge1xyXG4gICAgICAgICAgdmFyIF9kYXRlID0gbmV3IERhdGUoKTtcclxuICAgICAgICAgIF9kYXRlLnNldEZ1bGxZZWFyKE1hdGguYWJzKGRhdGUuZ2V0RnVsbFllYXIoKSkpO1xyXG4gICAgICAgICAgcmV0dXJuIGRhdGVGaWx0ZXIoX2RhdGUsICd5Jyk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAga2V5OiAnTSEnLFxyXG4gICAgICAgIHJlZ2V4OiAnMD9bMS05XXwxWzAtMl0nLFxyXG4gICAgICAgIGFwcGx5OiBmdW5jdGlvbih2YWx1ZSkgeyB0aGlzLm1vbnRoID0gdmFsdWUgLSAxOyB9LFxyXG4gICAgICAgIGZvcm1hdHRlcjogZnVuY3Rpb24oZGF0ZSkge1xyXG4gICAgICAgICAgdmFyIHZhbHVlID0gZGF0ZS5nZXRNb250aCgpO1xyXG4gICAgICAgICAgaWYgKC9eWzAtOV0kLy50ZXN0KHZhbHVlKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gZGF0ZUZpbHRlcihkYXRlLCAnTU0nKTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICByZXR1cm4gZGF0ZUZpbHRlcihkYXRlLCAnTScpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIGtleTogJ01NTU0nLFxyXG4gICAgICAgIHJlZ2V4OiAkbG9jYWxlLkRBVEVUSU1FX0ZPUk1BVFMuTU9OVEguam9pbignfCcpLFxyXG4gICAgICAgIGFwcGx5OiBmdW5jdGlvbih2YWx1ZSkgeyB0aGlzLm1vbnRoID0gJGxvY2FsZS5EQVRFVElNRV9GT1JNQVRTLk1PTlRILmluZGV4T2YodmFsdWUpOyB9LFxyXG4gICAgICAgIGZvcm1hdHRlcjogZnVuY3Rpb24oZGF0ZSkgeyByZXR1cm4gZGF0ZUZpbHRlcihkYXRlLCAnTU1NTScpOyB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICBrZXk6ICdNTU0nLFxyXG4gICAgICAgIHJlZ2V4OiAkbG9jYWxlLkRBVEVUSU1FX0ZPUk1BVFMuU0hPUlRNT05USC5qb2luKCd8JyksXHJcbiAgICAgICAgYXBwbHk6IGZ1bmN0aW9uKHZhbHVlKSB7IHRoaXMubW9udGggPSAkbG9jYWxlLkRBVEVUSU1FX0ZPUk1BVFMuU0hPUlRNT05USC5pbmRleE9mKHZhbHVlKTsgfSxcclxuICAgICAgICBmb3JtYXR0ZXI6IGZ1bmN0aW9uKGRhdGUpIHsgcmV0dXJuIGRhdGVGaWx0ZXIoZGF0ZSwgJ01NTScpOyB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICBrZXk6ICdNTScsXHJcbiAgICAgICAgcmVnZXg6ICcwWzEtOV18MVswLTJdJyxcclxuICAgICAgICBhcHBseTogZnVuY3Rpb24odmFsdWUpIHsgdGhpcy5tb250aCA9IHZhbHVlIC0gMTsgfSxcclxuICAgICAgICBmb3JtYXR0ZXI6IGZ1bmN0aW9uKGRhdGUpIHsgcmV0dXJuIGRhdGVGaWx0ZXIoZGF0ZSwgJ01NJyk7IH1cclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIGtleTogJ00nLFxyXG4gICAgICAgIHJlZ2V4OiAnWzEtOV18MVswLTJdJyxcclxuICAgICAgICBhcHBseTogZnVuY3Rpb24odmFsdWUpIHsgdGhpcy5tb250aCA9IHZhbHVlIC0gMTsgfSxcclxuICAgICAgICBmb3JtYXR0ZXI6IGZ1bmN0aW9uKGRhdGUpIHsgcmV0dXJuIGRhdGVGaWx0ZXIoZGF0ZSwgJ00nKTsgfVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAga2V5OiAnZCEnLFxyXG4gICAgICAgIHJlZ2V4OiAnWzAtMl0/WzAtOV17MX18M1swLTFdezF9JyxcclxuICAgICAgICBhcHBseTogZnVuY3Rpb24odmFsdWUpIHsgdGhpcy5kYXRlID0gK3ZhbHVlOyB9LFxyXG4gICAgICAgIGZvcm1hdHRlcjogZnVuY3Rpb24oZGF0ZSkge1xyXG4gICAgICAgICAgdmFyIHZhbHVlID0gZGF0ZS5nZXREYXRlKCk7XHJcbiAgICAgICAgICBpZiAoL15bMS05XSQvLnRlc3QodmFsdWUpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBkYXRlRmlsdGVyKGRhdGUsICdkZCcpO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIHJldHVybiBkYXRlRmlsdGVyKGRhdGUsICdkJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAga2V5OiAnZGQnLFxyXG4gICAgICAgIHJlZ2V4OiAnWzAtMl1bMC05XXsxfXwzWzAtMV17MX0nLFxyXG4gICAgICAgIGFwcGx5OiBmdW5jdGlvbih2YWx1ZSkgeyB0aGlzLmRhdGUgPSArdmFsdWU7IH0sXHJcbiAgICAgICAgZm9ybWF0dGVyOiBmdW5jdGlvbihkYXRlKSB7IHJldHVybiBkYXRlRmlsdGVyKGRhdGUsICdkZCcpOyB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICBrZXk6ICdkJyxcclxuICAgICAgICByZWdleDogJ1sxLTJdP1swLTldezF9fDNbMC0xXXsxfScsXHJcbiAgICAgICAgYXBwbHk6IGZ1bmN0aW9uKHZhbHVlKSB7IHRoaXMuZGF0ZSA9ICt2YWx1ZTsgfSxcclxuICAgICAgICBmb3JtYXR0ZXI6IGZ1bmN0aW9uKGRhdGUpIHsgcmV0dXJuIGRhdGVGaWx0ZXIoZGF0ZSwgJ2QnKTsgfVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAga2V5OiAnRUVFRScsXHJcbiAgICAgICAgcmVnZXg6ICRsb2NhbGUuREFURVRJTUVfRk9STUFUUy5EQVkuam9pbignfCcpLFxyXG4gICAgICAgIGZvcm1hdHRlcjogZnVuY3Rpb24oZGF0ZSkgeyByZXR1cm4gZGF0ZUZpbHRlcihkYXRlLCAnRUVFRScpOyB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICBrZXk6ICdFRUUnLFxyXG4gICAgICAgIHJlZ2V4OiAkbG9jYWxlLkRBVEVUSU1FX0ZPUk1BVFMuU0hPUlREQVkuam9pbignfCcpLFxyXG4gICAgICAgIGZvcm1hdHRlcjogZnVuY3Rpb24oZGF0ZSkgeyByZXR1cm4gZGF0ZUZpbHRlcihkYXRlLCAnRUVFJyk7IH1cclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIGtleTogJ0hIJyxcclxuICAgICAgICByZWdleDogJyg/OjB8MSlbMC05XXwyWzAtM10nLFxyXG4gICAgICAgIGFwcGx5OiBmdW5jdGlvbih2YWx1ZSkgeyB0aGlzLmhvdXJzID0gK3ZhbHVlOyB9LFxyXG4gICAgICAgIGZvcm1hdHRlcjogZnVuY3Rpb24oZGF0ZSkgeyByZXR1cm4gZGF0ZUZpbHRlcihkYXRlLCAnSEgnKTsgfVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAga2V5OiAnaGgnLFxyXG4gICAgICAgIHJlZ2V4OiAnMFswLTldfDFbMC0yXScsXHJcbiAgICAgICAgYXBwbHk6IGZ1bmN0aW9uKHZhbHVlKSB7IHRoaXMuaG91cnMgPSArdmFsdWU7IH0sXHJcbiAgICAgICAgZm9ybWF0dGVyOiBmdW5jdGlvbihkYXRlKSB7IHJldHVybiBkYXRlRmlsdGVyKGRhdGUsICdoaCcpOyB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICBrZXk6ICdIJyxcclxuICAgICAgICByZWdleDogJzE/WzAtOV18MlswLTNdJyxcclxuICAgICAgICBhcHBseTogZnVuY3Rpb24odmFsdWUpIHsgdGhpcy5ob3VycyA9ICt2YWx1ZTsgfSxcclxuICAgICAgICBmb3JtYXR0ZXI6IGZ1bmN0aW9uKGRhdGUpIHsgcmV0dXJuIGRhdGVGaWx0ZXIoZGF0ZSwgJ0gnKTsgfVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAga2V5OiAnaCcsXHJcbiAgICAgICAgcmVnZXg6ICdbMC05XXwxWzAtMl0nLFxyXG4gICAgICAgIGFwcGx5OiBmdW5jdGlvbih2YWx1ZSkgeyB0aGlzLmhvdXJzID0gK3ZhbHVlOyB9LFxyXG4gICAgICAgIGZvcm1hdHRlcjogZnVuY3Rpb24oZGF0ZSkgeyByZXR1cm4gZGF0ZUZpbHRlcihkYXRlLCAnaCcpOyB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICBrZXk6ICdtbScsXHJcbiAgICAgICAgcmVnZXg6ICdbMC01XVswLTldJyxcclxuICAgICAgICBhcHBseTogZnVuY3Rpb24odmFsdWUpIHsgdGhpcy5taW51dGVzID0gK3ZhbHVlOyB9LFxyXG4gICAgICAgIGZvcm1hdHRlcjogZnVuY3Rpb24oZGF0ZSkgeyByZXR1cm4gZGF0ZUZpbHRlcihkYXRlLCAnbW0nKTsgfVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAga2V5OiAnbScsXHJcbiAgICAgICAgcmVnZXg6ICdbMC05XXxbMS01XVswLTldJyxcclxuICAgICAgICBhcHBseTogZnVuY3Rpb24odmFsdWUpIHsgdGhpcy5taW51dGVzID0gK3ZhbHVlOyB9LFxyXG4gICAgICAgIGZvcm1hdHRlcjogZnVuY3Rpb24oZGF0ZSkgeyByZXR1cm4gZGF0ZUZpbHRlcihkYXRlLCAnbScpOyB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICBrZXk6ICdzc3MnLFxyXG4gICAgICAgIHJlZ2V4OiAnWzAtOV1bMC05XVswLTldJyxcclxuICAgICAgICBhcHBseTogZnVuY3Rpb24odmFsdWUpIHsgdGhpcy5taWxsaXNlY29uZHMgPSArdmFsdWU7IH0sXHJcbiAgICAgICAgZm9ybWF0dGVyOiBmdW5jdGlvbihkYXRlKSB7IHJldHVybiBkYXRlRmlsdGVyKGRhdGUsICdzc3MnKTsgfVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAga2V5OiAnc3MnLFxyXG4gICAgICAgIHJlZ2V4OiAnWzAtNV1bMC05XScsXHJcbiAgICAgICAgYXBwbHk6IGZ1bmN0aW9uKHZhbHVlKSB7IHRoaXMuc2Vjb25kcyA9ICt2YWx1ZTsgfSxcclxuICAgICAgICBmb3JtYXR0ZXI6IGZ1bmN0aW9uKGRhdGUpIHsgcmV0dXJuIGRhdGVGaWx0ZXIoZGF0ZSwgJ3NzJyk7IH1cclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIGtleTogJ3MnLFxyXG4gICAgICAgIHJlZ2V4OiAnWzAtOV18WzEtNV1bMC05XScsXHJcbiAgICAgICAgYXBwbHk6IGZ1bmN0aW9uKHZhbHVlKSB7IHRoaXMuc2Vjb25kcyA9ICt2YWx1ZTsgfSxcclxuICAgICAgICBmb3JtYXR0ZXI6IGZ1bmN0aW9uKGRhdGUpIHsgcmV0dXJuIGRhdGVGaWx0ZXIoZGF0ZSwgJ3MnKTsgfVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAga2V5OiAnYScsXHJcbiAgICAgICAgcmVnZXg6ICRsb2NhbGUuREFURVRJTUVfRk9STUFUUy5BTVBNUy5qb2luKCd8JyksXHJcbiAgICAgICAgYXBwbHk6IGZ1bmN0aW9uKHZhbHVlKSB7XHJcbiAgICAgICAgICBpZiAodGhpcy5ob3VycyA9PT0gMTIpIHtcclxuICAgICAgICAgICAgdGhpcy5ob3VycyA9IDA7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgaWYgKHZhbHVlID09PSAnUE0nKSB7XHJcbiAgICAgICAgICAgIHRoaXMuaG91cnMgKz0gMTI7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBmb3JtYXR0ZXI6IGZ1bmN0aW9uKGRhdGUpIHsgcmV0dXJuIGRhdGVGaWx0ZXIoZGF0ZSwgJ2EnKTsgfVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAga2V5OiAnWicsXHJcbiAgICAgICAgcmVnZXg6ICdbKy1dXFxcXGR7NH0nLFxyXG4gICAgICAgIGFwcGx5OiBmdW5jdGlvbih2YWx1ZSkge1xyXG4gICAgICAgICAgdmFyIG1hdGNoZXMgPSB2YWx1ZS5tYXRjaCgvKFsrLV0pKFxcZHsyfSkoXFxkezJ9KS8pLFxyXG4gICAgICAgICAgICBzaWduID0gbWF0Y2hlc1sxXSxcclxuICAgICAgICAgICAgaG91cnMgPSBtYXRjaGVzWzJdLFxyXG4gICAgICAgICAgICBtaW51dGVzID0gbWF0Y2hlc1szXTtcclxuICAgICAgICAgIHRoaXMuaG91cnMgKz0gdG9JbnQoc2lnbiArIGhvdXJzKTtcclxuICAgICAgICAgIHRoaXMubWludXRlcyArPSB0b0ludChzaWduICsgbWludXRlcyk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBmb3JtYXR0ZXI6IGZ1bmN0aW9uKGRhdGUpIHtcclxuICAgICAgICAgIHJldHVybiBkYXRlRmlsdGVyKGRhdGUsICdaJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAga2V5OiAnd3cnLFxyXG4gICAgICAgIHJlZ2V4OiAnWzAtNF1bMC05XXw1WzAtM10nLFxyXG4gICAgICAgIGZvcm1hdHRlcjogZnVuY3Rpb24oZGF0ZSkgeyByZXR1cm4gZGF0ZUZpbHRlcihkYXRlLCAnd3cnKTsgfVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAga2V5OiAndycsXHJcbiAgICAgICAgcmVnZXg6ICdbMC05XXxbMS00XVswLTldfDVbMC0zXScsXHJcbiAgICAgICAgZm9ybWF0dGVyOiBmdW5jdGlvbihkYXRlKSB7IHJldHVybiBkYXRlRmlsdGVyKGRhdGUsICd3Jyk7IH1cclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIGtleTogJ0dHR0cnLFxyXG4gICAgICAgIHJlZ2V4OiAkbG9jYWxlLkRBVEVUSU1FX0ZPUk1BVFMuRVJBTkFNRVMuam9pbignfCcpLnJlcGxhY2UoL1xccy9nLCAnXFxcXHMnKSxcclxuICAgICAgICBmb3JtYXR0ZXI6IGZ1bmN0aW9uKGRhdGUpIHsgcmV0dXJuIGRhdGVGaWx0ZXIoZGF0ZSwgJ0dHR0cnKTsgfVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAga2V5OiAnR0dHJyxcclxuICAgICAgICByZWdleDogJGxvY2FsZS5EQVRFVElNRV9GT1JNQVRTLkVSQVMuam9pbignfCcpLFxyXG4gICAgICAgIGZvcm1hdHRlcjogZnVuY3Rpb24oZGF0ZSkgeyByZXR1cm4gZGF0ZUZpbHRlcihkYXRlLCAnR0dHJyk7IH1cclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIGtleTogJ0dHJyxcclxuICAgICAgICByZWdleDogJGxvY2FsZS5EQVRFVElNRV9GT1JNQVRTLkVSQVMuam9pbignfCcpLFxyXG4gICAgICAgIGZvcm1hdHRlcjogZnVuY3Rpb24oZGF0ZSkgeyByZXR1cm4gZGF0ZUZpbHRlcihkYXRlLCAnR0cnKTsgfVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAga2V5OiAnRycsXHJcbiAgICAgICAgcmVnZXg6ICRsb2NhbGUuREFURVRJTUVfRk9STUFUUy5FUkFTLmpvaW4oJ3wnKSxcclxuICAgICAgICBmb3JtYXR0ZXI6IGZ1bmN0aW9uKGRhdGUpIHsgcmV0dXJuIGRhdGVGaWx0ZXIoZGF0ZSwgJ0cnKTsgfVxyXG4gICAgICB9XHJcbiAgICBdO1xyXG4gIH07XHJcblxyXG4gIHRoaXMuaW5pdCgpO1xyXG5cclxuICBmdW5jdGlvbiBjcmVhdGVQYXJzZXIoZm9ybWF0KSB7XHJcbiAgICB2YXIgbWFwID0gW10sIHJlZ2V4ID0gZm9ybWF0LnNwbGl0KCcnKTtcclxuXHJcbiAgICAvLyBjaGVjayBmb3IgbGl0ZXJhbCB2YWx1ZXNcclxuICAgIHZhciBxdW90ZUluZGV4ID0gZm9ybWF0LmluZGV4T2YoJ1xcJycpO1xyXG4gICAgaWYgKHF1b3RlSW5kZXggPiAtMSkge1xyXG4gICAgICB2YXIgaW5MaXRlcmFsID0gZmFsc2U7XHJcbiAgICAgIGZvcm1hdCA9IGZvcm1hdC5zcGxpdCgnJyk7XHJcbiAgICAgIGZvciAodmFyIGkgPSBxdW90ZUluZGV4OyBpIDwgZm9ybWF0Lmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgaWYgKGluTGl0ZXJhbCkge1xyXG4gICAgICAgICAgaWYgKGZvcm1hdFtpXSA9PT0gJ1xcJycpIHtcclxuICAgICAgICAgICAgaWYgKGkgKyAxIDwgZm9ybWF0Lmxlbmd0aCAmJiBmb3JtYXRbaSsxXSA9PT0gJ1xcJycpIHsgLy8gZXNjYXBlZCBzaW5nbGUgcXVvdGVcclxuICAgICAgICAgICAgICBmb3JtYXRbaSsxXSA9ICckJztcclxuICAgICAgICAgICAgICByZWdleFtpKzFdID0gJyc7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7IC8vIGVuZCBvZiBsaXRlcmFsXHJcbiAgICAgICAgICAgICAgcmVnZXhbaV0gPSAnJztcclxuICAgICAgICAgICAgICBpbkxpdGVyYWwgPSBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgZm9ybWF0W2ldID0gJyQnO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBpZiAoZm9ybWF0W2ldID09PSAnXFwnJykgeyAvLyBzdGFydCBvZiBsaXRlcmFsXHJcbiAgICAgICAgICAgIGZvcm1hdFtpXSA9ICckJztcclxuICAgICAgICAgICAgcmVnZXhbaV0gPSAnJztcclxuICAgICAgICAgICAgaW5MaXRlcmFsID0gdHJ1ZTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGZvcm1hdCA9IGZvcm1hdC5qb2luKCcnKTtcclxuICAgIH1cclxuXHJcbiAgICBhbmd1bGFyLmZvckVhY2goZm9ybWF0Q29kZVRvUmVnZXgsIGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgICAgdmFyIGluZGV4ID0gZm9ybWF0LmluZGV4T2YoZGF0YS5rZXkpO1xyXG5cclxuICAgICAgaWYgKGluZGV4ID4gLTEpIHtcclxuICAgICAgICBmb3JtYXQgPSBmb3JtYXQuc3BsaXQoJycpO1xyXG5cclxuICAgICAgICByZWdleFtpbmRleF0gPSAnKCcgKyBkYXRhLnJlZ2V4ICsgJyknO1xyXG4gICAgICAgIGZvcm1hdFtpbmRleF0gPSAnJCc7IC8vIEN1c3RvbSBzeW1ib2wgdG8gZGVmaW5lIGNvbnN1bWVkIHBhcnQgb2YgZm9ybWF0XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IGluZGV4ICsgMSwgbiA9IGluZGV4ICsgZGF0YS5rZXkubGVuZ3RoOyBpIDwgbjsgaSsrKSB7XHJcbiAgICAgICAgICByZWdleFtpXSA9ICcnO1xyXG4gICAgICAgICAgZm9ybWF0W2ldID0gJyQnO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmb3JtYXQgPSBmb3JtYXQuam9pbignJyk7XHJcblxyXG4gICAgICAgIG1hcC5wdXNoKHtcclxuICAgICAgICAgIGluZGV4OiBpbmRleCxcclxuICAgICAgICAgIGtleTogZGF0YS5rZXksXHJcbiAgICAgICAgICBhcHBseTogZGF0YS5hcHBseSxcclxuICAgICAgICAgIG1hdGNoZXI6IGRhdGEucmVnZXhcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgcmVnZXg6IG5ldyBSZWdFeHAoJ14nICsgcmVnZXguam9pbignJykgKyAnJCcpLFxyXG4gICAgICBtYXA6IG9yZGVyQnlGaWx0ZXIobWFwLCAnaW5kZXgnKVxyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGNyZWF0ZUZvcm1hdHRlcihmb3JtYXQpIHtcclxuICAgIHZhciBmb3JtYXR0ZXJzID0gW107XHJcbiAgICB2YXIgaSA9IDA7XHJcbiAgICB2YXIgZm9ybWF0dGVyLCBsaXRlcmFsSWR4O1xyXG4gICAgd2hpbGUgKGkgPCBmb3JtYXQubGVuZ3RoKSB7XHJcbiAgICAgIGlmIChhbmd1bGFyLmlzTnVtYmVyKGxpdGVyYWxJZHgpKSB7XHJcbiAgICAgICAgaWYgKGZvcm1hdC5jaGFyQXQoaSkgPT09ICdcXCcnKSB7XHJcbiAgICAgICAgICBpZiAoaSArIDEgPj0gZm9ybWF0Lmxlbmd0aCB8fCBmb3JtYXQuY2hhckF0KGkgKyAxKSAhPT0gJ1xcJycpIHtcclxuICAgICAgICAgICAgZm9ybWF0dGVycy5wdXNoKGNvbnN0cnVjdExpdGVyYWxGb3JtYXR0ZXIoZm9ybWF0LCBsaXRlcmFsSWR4LCBpKSk7XHJcbiAgICAgICAgICAgIGxpdGVyYWxJZHggPSBudWxsO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSBpZiAoaSA9PT0gZm9ybWF0Lmxlbmd0aCkge1xyXG4gICAgICAgICAgd2hpbGUgKGxpdGVyYWxJZHggPCBmb3JtYXQubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIGZvcm1hdHRlciA9IGNvbnN0cnVjdEZvcm1hdHRlckZyb21JZHgoZm9ybWF0LCBsaXRlcmFsSWR4KTtcclxuICAgICAgICAgICAgZm9ybWF0dGVycy5wdXNoKGZvcm1hdHRlcik7XHJcbiAgICAgICAgICAgIGxpdGVyYWxJZHggPSBmb3JtYXR0ZXIuZW5kSWR4O1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaSsrO1xyXG4gICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoZm9ybWF0LmNoYXJBdChpKSA9PT0gJ1xcJycpIHtcclxuICAgICAgICBsaXRlcmFsSWR4ID0gaTtcclxuICAgICAgICBpKys7XHJcbiAgICAgICAgY29udGludWU7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGZvcm1hdHRlciA9IGNvbnN0cnVjdEZvcm1hdHRlckZyb21JZHgoZm9ybWF0LCBpKTtcclxuXHJcbiAgICAgIGZvcm1hdHRlcnMucHVzaChmb3JtYXR0ZXIucGFyc2VyKTtcclxuICAgICAgaSA9IGZvcm1hdHRlci5lbmRJZHg7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGZvcm1hdHRlcnM7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBjb25zdHJ1Y3RMaXRlcmFsRm9ybWF0dGVyKGZvcm1hdCwgbGl0ZXJhbElkeCwgZW5kSWR4KSB7XHJcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XHJcbiAgICAgIHJldHVybiBmb3JtYXQuc3Vic3RyKGxpdGVyYWxJZHggKyAxLCBlbmRJZHggLSBsaXRlcmFsSWR4IC0gMSk7XHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gY29uc3RydWN0Rm9ybWF0dGVyRnJvbUlkeChmb3JtYXQsIGkpIHtcclxuICAgIHZhciBjdXJyZW50UG9zU3RyID0gZm9ybWF0LnN1YnN0cihpKTtcclxuICAgIGZvciAodmFyIGogPSAwOyBqIDwgZm9ybWF0Q29kZVRvUmVnZXgubGVuZ3RoOyBqKyspIHtcclxuICAgICAgaWYgKG5ldyBSZWdFeHAoJ14nICsgZm9ybWF0Q29kZVRvUmVnZXhbal0ua2V5KS50ZXN0KGN1cnJlbnRQb3NTdHIpKSB7XHJcbiAgICAgICAgdmFyIGRhdGEgPSBmb3JtYXRDb2RlVG9SZWdleFtqXTtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgZW5kSWR4OiBpICsgZGF0YS5rZXkubGVuZ3RoLFxyXG4gICAgICAgICAgcGFyc2VyOiBkYXRhLmZvcm1hdHRlclxyXG4gICAgICAgIH07XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBlbmRJZHg6IGkgKyAxLFxyXG4gICAgICBwYXJzZXI6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiBjdXJyZW50UG9zU3RyLmNoYXJBdCgwKTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIHRoaXMuZmlsdGVyID0gZnVuY3Rpb24oZGF0ZSwgZm9ybWF0KSB7XHJcbiAgICBpZiAoIWFuZ3VsYXIuaXNEYXRlKGRhdGUpIHx8IGlzTmFOKGRhdGUpIHx8ICFmb3JtYXQpIHtcclxuICAgICAgcmV0dXJuICcnO1xyXG4gICAgfVxyXG5cclxuICAgIGZvcm1hdCA9ICRsb2NhbGUuREFURVRJTUVfRk9STUFUU1tmb3JtYXRdIHx8IGZvcm1hdDtcclxuXHJcbiAgICBpZiAoJGxvY2FsZS5pZCAhPT0gbG9jYWxlSWQpIHtcclxuICAgICAgdGhpcy5pbml0KCk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCF0aGlzLmZvcm1hdHRlcnNbZm9ybWF0XSkge1xyXG4gICAgICB0aGlzLmZvcm1hdHRlcnNbZm9ybWF0XSA9IGNyZWF0ZUZvcm1hdHRlcihmb3JtYXQpO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBmb3JtYXR0ZXJzID0gdGhpcy5mb3JtYXR0ZXJzW2Zvcm1hdF07XHJcblxyXG4gICAgcmV0dXJuIGZvcm1hdHRlcnMucmVkdWNlKGZ1bmN0aW9uKHN0ciwgZm9ybWF0dGVyKSB7XHJcbiAgICAgIHJldHVybiBzdHIgKyBmb3JtYXR0ZXIoZGF0ZSk7XHJcbiAgICB9LCAnJyk7XHJcbiAgfTtcclxuXHJcbiAgdGhpcy5wYXJzZSA9IGZ1bmN0aW9uKGlucHV0LCBmb3JtYXQsIGJhc2VEYXRlKSB7XHJcbiAgICBpZiAoIWFuZ3VsYXIuaXNTdHJpbmcoaW5wdXQpIHx8ICFmb3JtYXQpIHtcclxuICAgICAgcmV0dXJuIGlucHV0O1xyXG4gICAgfVxyXG5cclxuICAgIGZvcm1hdCA9ICRsb2NhbGUuREFURVRJTUVfRk9STUFUU1tmb3JtYXRdIHx8IGZvcm1hdDtcclxuICAgIGZvcm1hdCA9IGZvcm1hdC5yZXBsYWNlKFNQRUNJQUxfQ0hBUkFDVEVSU19SRUdFWFAsICdcXFxcJCYnKTtcclxuXHJcbiAgICBpZiAoJGxvY2FsZS5pZCAhPT0gbG9jYWxlSWQpIHtcclxuICAgICAgdGhpcy5pbml0KCk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCF0aGlzLnBhcnNlcnNbZm9ybWF0XSkge1xyXG4gICAgICB0aGlzLnBhcnNlcnNbZm9ybWF0XSA9IGNyZWF0ZVBhcnNlcihmb3JtYXQsICdhcHBseScpO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBwYXJzZXIgPSB0aGlzLnBhcnNlcnNbZm9ybWF0XSxcclxuICAgICAgICByZWdleCA9IHBhcnNlci5yZWdleCxcclxuICAgICAgICBtYXAgPSBwYXJzZXIubWFwLFxyXG4gICAgICAgIHJlc3VsdHMgPSBpbnB1dC5tYXRjaChyZWdleCksXHJcbiAgICAgICAgdHpPZmZzZXQgPSBmYWxzZTtcclxuICAgIGlmIChyZXN1bHRzICYmIHJlc3VsdHMubGVuZ3RoKSB7XHJcbiAgICAgIHZhciBmaWVsZHMsIGR0O1xyXG4gICAgICBpZiAoYW5ndWxhci5pc0RhdGUoYmFzZURhdGUpICYmICFpc05hTihiYXNlRGF0ZS5nZXRUaW1lKCkpKSB7XHJcbiAgICAgICAgZmllbGRzID0ge1xyXG4gICAgICAgICAgeWVhcjogYmFzZURhdGUuZ2V0RnVsbFllYXIoKSxcclxuICAgICAgICAgIG1vbnRoOiBiYXNlRGF0ZS5nZXRNb250aCgpLFxyXG4gICAgICAgICAgZGF0ZTogYmFzZURhdGUuZ2V0RGF0ZSgpLFxyXG4gICAgICAgICAgaG91cnM6IGJhc2VEYXRlLmdldEhvdXJzKCksXHJcbiAgICAgICAgICBtaW51dGVzOiBiYXNlRGF0ZS5nZXRNaW51dGVzKCksXHJcbiAgICAgICAgICBzZWNvbmRzOiBiYXNlRGF0ZS5nZXRTZWNvbmRzKCksXHJcbiAgICAgICAgICBtaWxsaXNlY29uZHM6IGJhc2VEYXRlLmdldE1pbGxpc2Vjb25kcygpXHJcbiAgICAgICAgfTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBpZiAoYmFzZURhdGUpIHtcclxuICAgICAgICAgICRsb2cud2FybignZGF0ZXBhcnNlcjonLCAnYmFzZURhdGUgaXMgbm90IGEgdmFsaWQgZGF0ZScpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmaWVsZHMgPSB7IHllYXI6IDE5MDAsIG1vbnRoOiAwLCBkYXRlOiAxLCBob3VyczogMCwgbWludXRlczogMCwgc2Vjb25kczogMCwgbWlsbGlzZWNvbmRzOiAwIH07XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGZvciAodmFyIGkgPSAxLCBuID0gcmVzdWx0cy5sZW5ndGg7IGkgPCBuOyBpKyspIHtcclxuICAgICAgICB2YXIgbWFwcGVyID0gbWFwW2kgLSAxXTtcclxuICAgICAgICBpZiAobWFwcGVyLm1hdGNoZXIgPT09ICdaJykge1xyXG4gICAgICAgICAgdHpPZmZzZXQgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKG1hcHBlci5hcHBseSkge1xyXG4gICAgICAgICAgbWFwcGVyLmFwcGx5LmNhbGwoZmllbGRzLCByZXN1bHRzW2ldKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHZhciBkYXRlc2V0dGVyID0gdHpPZmZzZXQgPyBEYXRlLnByb3RvdHlwZS5zZXRVVENGdWxsWWVhciA6XHJcbiAgICAgICAgRGF0ZS5wcm90b3R5cGUuc2V0RnVsbFllYXI7XHJcbiAgICAgIHZhciB0aW1lc2V0dGVyID0gdHpPZmZzZXQgPyBEYXRlLnByb3RvdHlwZS5zZXRVVENIb3VycyA6XHJcbiAgICAgICAgRGF0ZS5wcm90b3R5cGUuc2V0SG91cnM7XHJcblxyXG4gICAgICBpZiAoaXNWYWxpZChmaWVsZHMueWVhciwgZmllbGRzLm1vbnRoLCBmaWVsZHMuZGF0ZSkpIHtcclxuICAgICAgICBpZiAoYW5ndWxhci5pc0RhdGUoYmFzZURhdGUpICYmICFpc05hTihiYXNlRGF0ZS5nZXRUaW1lKCkpICYmICF0ek9mZnNldCkge1xyXG4gICAgICAgICAgZHQgPSBuZXcgRGF0ZShiYXNlRGF0ZSk7XHJcbiAgICAgICAgICBkYXRlc2V0dGVyLmNhbGwoZHQsIGZpZWxkcy55ZWFyLCBmaWVsZHMubW9udGgsIGZpZWxkcy5kYXRlKTtcclxuICAgICAgICAgIHRpbWVzZXR0ZXIuY2FsbChkdCwgZmllbGRzLmhvdXJzLCBmaWVsZHMubWludXRlcyxcclxuICAgICAgICAgICAgZmllbGRzLnNlY29uZHMsIGZpZWxkcy5taWxsaXNlY29uZHMpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBkdCA9IG5ldyBEYXRlKDApO1xyXG4gICAgICAgICAgZGF0ZXNldHRlci5jYWxsKGR0LCBmaWVsZHMueWVhciwgZmllbGRzLm1vbnRoLCBmaWVsZHMuZGF0ZSk7XHJcbiAgICAgICAgICB0aW1lc2V0dGVyLmNhbGwoZHQsIGZpZWxkcy5ob3VycyB8fCAwLCBmaWVsZHMubWludXRlcyB8fCAwLFxyXG4gICAgICAgICAgICBmaWVsZHMuc2Vjb25kcyB8fCAwLCBmaWVsZHMubWlsbGlzZWNvbmRzIHx8IDApO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIGR0O1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIC8vIENoZWNrIGlmIGRhdGUgaXMgdmFsaWQgZm9yIHNwZWNpZmljIG1vbnRoIChhbmQgeWVhciBmb3IgRmVicnVhcnkpLlxyXG4gIC8vIE1vbnRoOiAwID0gSmFuLCAxID0gRmViLCBldGNcclxuICBmdW5jdGlvbiBpc1ZhbGlkKHllYXIsIG1vbnRoLCBkYXRlKSB7XHJcbiAgICBpZiAoZGF0ZSA8IDEpIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChtb250aCA9PT0gMSAmJiBkYXRlID4gMjgpIHtcclxuICAgICAgcmV0dXJuIGRhdGUgPT09IDI5ICYmICh5ZWFyICUgNCA9PT0gMCAmJiB5ZWFyICUgMTAwICE9PSAwIHx8IHllYXIgJSA0MDAgPT09IDApO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChtb250aCA9PT0gMyB8fCBtb250aCA9PT0gNSB8fCBtb250aCA9PT0gOCB8fCBtb250aCA9PT0gMTApIHtcclxuICAgICAgcmV0dXJuIGRhdGUgPCAzMTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHRvSW50KHN0cikge1xyXG4gICAgcmV0dXJuIHBhcnNlSW50KHN0ciwgMTApO1xyXG4gIH1cclxuXHJcbiAgdGhpcy50b1RpbWV6b25lID0gdG9UaW1lem9uZTtcclxuICB0aGlzLmZyb21UaW1lem9uZSA9IGZyb21UaW1lem9uZTtcclxuICB0aGlzLnRpbWV6b25lVG9PZmZzZXQgPSB0aW1lem9uZVRvT2Zmc2V0O1xyXG4gIHRoaXMuYWRkRGF0ZU1pbnV0ZXMgPSBhZGREYXRlTWludXRlcztcclxuICB0aGlzLmNvbnZlcnRUaW1lem9uZVRvTG9jYWwgPSBjb252ZXJ0VGltZXpvbmVUb0xvY2FsO1xyXG5cclxuICBmdW5jdGlvbiB0b1RpbWV6b25lKGRhdGUsIHRpbWV6b25lKSB7XHJcbiAgICByZXR1cm4gZGF0ZSAmJiB0aW1lem9uZSA/IGNvbnZlcnRUaW1lem9uZVRvTG9jYWwoZGF0ZSwgdGltZXpvbmUpIDogZGF0ZTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGZyb21UaW1lem9uZShkYXRlLCB0aW1lem9uZSkge1xyXG4gICAgcmV0dXJuIGRhdGUgJiYgdGltZXpvbmUgPyBjb252ZXJ0VGltZXpvbmVUb0xvY2FsKGRhdGUsIHRpbWV6b25lLCB0cnVlKSA6IGRhdGU7XHJcbiAgfVxyXG5cclxuICAvL2h0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2FuZ3VsYXIuanMvYmxvYi82MjJjNDIxNjk2OTllYzA3ZmM2ZGFhYTE5ZmU2ZDIyNGU1ZDJmNzBlL3NyYy9Bbmd1bGFyLmpzI0wxMjA3XHJcbiAgZnVuY3Rpb24gdGltZXpvbmVUb09mZnNldCh0aW1lem9uZSwgZmFsbGJhY2spIHtcclxuICAgIHRpbWV6b25lID0gdGltZXpvbmUucmVwbGFjZSgvOi9nLCAnJyk7XHJcbiAgICB2YXIgcmVxdWVzdGVkVGltZXpvbmVPZmZzZXQgPSBEYXRlLnBhcnNlKCdKYW4gMDEsIDE5NzAgMDA6MDA6MDAgJyArIHRpbWV6b25lKSAvIDYwMDAwO1xyXG4gICAgcmV0dXJuIGlzTmFOKHJlcXVlc3RlZFRpbWV6b25lT2Zmc2V0KSA/IGZhbGxiYWNrIDogcmVxdWVzdGVkVGltZXpvbmVPZmZzZXQ7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBhZGREYXRlTWludXRlcyhkYXRlLCBtaW51dGVzKSB7XHJcbiAgICBkYXRlID0gbmV3IERhdGUoZGF0ZS5nZXRUaW1lKCkpO1xyXG4gICAgZGF0ZS5zZXRNaW51dGVzKGRhdGUuZ2V0TWludXRlcygpICsgbWludXRlcyk7XHJcbiAgICByZXR1cm4gZGF0ZTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGNvbnZlcnRUaW1lem9uZVRvTG9jYWwoZGF0ZSwgdGltZXpvbmUsIHJldmVyc2UpIHtcclxuICAgIHJldmVyc2UgPSByZXZlcnNlID8gLTEgOiAxO1xyXG4gICAgdmFyIGRhdGVUaW1lem9uZU9mZnNldCA9IGRhdGUuZ2V0VGltZXpvbmVPZmZzZXQoKTtcclxuICAgIHZhciB0aW1lem9uZU9mZnNldCA9IHRpbWV6b25lVG9PZmZzZXQodGltZXpvbmUsIGRhdGVUaW1lem9uZU9mZnNldCk7XHJcbiAgICByZXR1cm4gYWRkRGF0ZU1pbnV0ZXMoZGF0ZSwgcmV2ZXJzZSAqICh0aW1lem9uZU9mZnNldCAtIGRhdGVUaW1lem9uZU9mZnNldCkpO1xyXG4gIH1cclxufV0pO1xyXG5cclxuLy8gQXZvaWRpbmcgdXNlIG9mIG5nLWNsYXNzIGFzIGl0IGNyZWF0ZXMgYSBsb3Qgb2Ygd2F0Y2hlcnMgd2hlbiBhIGNsYXNzIGlzIHRvIGJlIGFwcGxpZWQgdG9cclxuLy8gYXQgbW9zdCBvbmUgZWxlbWVudC5cclxuYW5ndWxhci5tb2R1bGUoJ3VpLmJvb3RzdHJhcC5pc0NsYXNzJywgW10pXHJcbi5kaXJlY3RpdmUoJ3VpYklzQ2xhc3MnLCBbXHJcbiAgICAgICAgICckYW5pbWF0ZScsXHJcbmZ1bmN0aW9uICgkYW5pbWF0ZSkge1xyXG4gIC8vICAgICAgICAgICAgICAgICAgICAxMTExMTExMSAgICAgICAgICAyMjIyMjIyMlxyXG4gIHZhciBPTl9SRUdFWFAgPSAvXlxccyooW1xcc1xcU10rPylcXHMrb25cXHMrKFtcXHNcXFNdKz8pXFxzKiQvO1xyXG4gIC8vICAgICAgICAgICAgICAgICAgICAxMTExMTExMSAgICAgICAgICAgMjIyMjIyMjJcclxuICB2YXIgSVNfUkVHRVhQID0gL15cXHMqKFtcXHNcXFNdKz8pXFxzK2ZvclxccysoW1xcc1xcU10rPylcXHMqJC87XHJcblxyXG4gIHZhciBkYXRhUGVyVHJhY2tlZCA9IHt9O1xyXG5cclxuICByZXR1cm4ge1xyXG4gICAgcmVzdHJpY3Q6ICdBJyxcclxuICAgIGNvbXBpbGU6IGZ1bmN0aW9uKHRFbGVtZW50LCB0QXR0cnMpIHtcclxuICAgICAgdmFyIGxpbmtlZFNjb3BlcyA9IFtdO1xyXG4gICAgICB2YXIgaW5zdGFuY2VzID0gW107XHJcbiAgICAgIHZhciBleHBUb0RhdGEgPSB7fTtcclxuICAgICAgdmFyIGxhc3RBY3RpdmF0ZWQgPSBudWxsO1xyXG4gICAgICB2YXIgb25FeHBNYXRjaGVzID0gdEF0dHJzLnVpYklzQ2xhc3MubWF0Y2goT05fUkVHRVhQKTtcclxuICAgICAgdmFyIG9uRXhwID0gb25FeHBNYXRjaGVzWzJdO1xyXG4gICAgICB2YXIgZXhwc1N0ciA9IG9uRXhwTWF0Y2hlc1sxXTtcclxuICAgICAgdmFyIGV4cHMgPSBleHBzU3RyLnNwbGl0KCcsJyk7XHJcblxyXG4gICAgICByZXR1cm4gbGlua0ZuO1xyXG5cclxuICAgICAgZnVuY3Rpb24gbGlua0ZuKHNjb3BlLCBlbGVtZW50LCBhdHRycykge1xyXG4gICAgICAgIGxpbmtlZFNjb3Blcy5wdXNoKHNjb3BlKTtcclxuICAgICAgICBpbnN0YW5jZXMucHVzaCh7XHJcbiAgICAgICAgICBzY29wZTogc2NvcGUsXHJcbiAgICAgICAgICBlbGVtZW50OiBlbGVtZW50XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGV4cHMuZm9yRWFjaChmdW5jdGlvbihleHAsIGspIHtcclxuICAgICAgICAgIGFkZEZvckV4cChleHAsIHNjb3BlKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgc2NvcGUuJG9uKCckZGVzdHJveScsIHJlbW92ZVNjb3BlKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgZnVuY3Rpb24gYWRkRm9yRXhwKGV4cCwgc2NvcGUpIHtcclxuICAgICAgICB2YXIgbWF0Y2hlcyA9IGV4cC5tYXRjaChJU19SRUdFWFApO1xyXG4gICAgICAgIHZhciBjbGF6eiA9IHNjb3BlLiRldmFsKG1hdGNoZXNbMV0pO1xyXG4gICAgICAgIHZhciBjb21wYXJlV2l0aEV4cCA9IG1hdGNoZXNbMl07XHJcbiAgICAgICAgdmFyIGRhdGEgPSBleHBUb0RhdGFbZXhwXTtcclxuICAgICAgICBpZiAoIWRhdGEpIHtcclxuICAgICAgICAgIHZhciB3YXRjaEZuID0gZnVuY3Rpb24oY29tcGFyZVdpdGhWYWwpIHtcclxuICAgICAgICAgICAgdmFyIG5ld0FjdGl2YXRlZCA9IG51bGw7XHJcbiAgICAgICAgICAgIGluc3RhbmNlcy5zb21lKGZ1bmN0aW9uKGluc3RhbmNlKSB7XHJcbiAgICAgICAgICAgICAgdmFyIHRoaXNWYWwgPSBpbnN0YW5jZS5zY29wZS4kZXZhbChvbkV4cCk7XHJcbiAgICAgICAgICAgICAgaWYgKHRoaXNWYWwgPT09IGNvbXBhcmVXaXRoVmFsKSB7XHJcbiAgICAgICAgICAgICAgICBuZXdBY3RpdmF0ZWQgPSBpbnN0YW5jZTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGlmIChkYXRhLmxhc3RBY3RpdmF0ZWQgIT09IG5ld0FjdGl2YXRlZCkge1xyXG4gICAgICAgICAgICAgIGlmIChkYXRhLmxhc3RBY3RpdmF0ZWQpIHtcclxuICAgICAgICAgICAgICAgICRhbmltYXRlLnJlbW92ZUNsYXNzKGRhdGEubGFzdEFjdGl2YXRlZC5lbGVtZW50LCBjbGF6eik7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIGlmIChuZXdBY3RpdmF0ZWQpIHtcclxuICAgICAgICAgICAgICAgICRhbmltYXRlLmFkZENsYXNzKG5ld0FjdGl2YXRlZC5lbGVtZW50LCBjbGF6eik7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIGRhdGEubGFzdEFjdGl2YXRlZCA9IG5ld0FjdGl2YXRlZDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfTtcclxuICAgICAgICAgIGV4cFRvRGF0YVtleHBdID0gZGF0YSA9IHtcclxuICAgICAgICAgICAgbGFzdEFjdGl2YXRlZDogbnVsbCxcclxuICAgICAgICAgICAgc2NvcGU6IHNjb3BlLFxyXG4gICAgICAgICAgICB3YXRjaEZuOiB3YXRjaEZuLFxyXG4gICAgICAgICAgICBjb21wYXJlV2l0aEV4cDogY29tcGFyZVdpdGhFeHAsXHJcbiAgICAgICAgICAgIHdhdGNoZXI6IHNjb3BlLiR3YXRjaChjb21wYXJlV2l0aEV4cCwgd2F0Y2hGbilcclxuICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGRhdGEud2F0Y2hGbihzY29wZS4kZXZhbChjb21wYXJlV2l0aEV4cCkpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBmdW5jdGlvbiByZW1vdmVTY29wZShlKSB7XHJcbiAgICAgICAgdmFyIHJlbW92ZWRTY29wZSA9IGUudGFyZ2V0U2NvcGU7XHJcbiAgICAgICAgdmFyIGluZGV4ID0gbGlua2VkU2NvcGVzLmluZGV4T2YocmVtb3ZlZFNjb3BlKTtcclxuICAgICAgICBsaW5rZWRTY29wZXMuc3BsaWNlKGluZGV4LCAxKTtcclxuICAgICAgICBpbnN0YW5jZXMuc3BsaWNlKGluZGV4LCAxKTtcclxuICAgICAgICBpZiAobGlua2VkU2NvcGVzLmxlbmd0aCkge1xyXG4gICAgICAgICAgdmFyIG5ld1dhdGNoU2NvcGUgPSBsaW5rZWRTY29wZXNbMF07XHJcbiAgICAgICAgICBhbmd1bGFyLmZvckVhY2goZXhwVG9EYXRhLCBmdW5jdGlvbihkYXRhKSB7XHJcbiAgICAgICAgICAgIGlmIChkYXRhLnNjb3BlID09PSByZW1vdmVkU2NvcGUpIHtcclxuICAgICAgICAgICAgICBkYXRhLndhdGNoZXIgPSBuZXdXYXRjaFNjb3BlLiR3YXRjaChkYXRhLmNvbXBhcmVXaXRoRXhwLCBkYXRhLndhdGNoRm4pO1xyXG4gICAgICAgICAgICAgIGRhdGEuc2NvcGUgPSBuZXdXYXRjaFNjb3BlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgZXhwVG9EYXRhID0ge307XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfTtcclxufV0pO1xyXG5hbmd1bGFyLm1vZHVsZSgndWkuYm9vdHN0cmFwLmRhdGVwaWNrZXInLCBbJ3VpLmJvb3RzdHJhcC5kYXRlcGFyc2VyJywgJ3VpLmJvb3RzdHJhcC5pc0NsYXNzJ10pXHJcblxyXG4udmFsdWUoJyRkYXRlcGlja2VyU3VwcHJlc3NFcnJvcicsIGZhbHNlKVxyXG5cclxuLnZhbHVlKCckZGF0ZXBpY2tlckxpdGVyYWxXYXJuaW5nJywgdHJ1ZSlcclxuXHJcbi5jb25zdGFudCgndWliRGF0ZXBpY2tlckNvbmZpZycsIHtcclxuICBkYXRlcGlja2VyTW9kZTogJ2RheScsXHJcbiAgZm9ybWF0RGF5OiAnZGQnLFxyXG4gIGZvcm1hdE1vbnRoOiAnTU1NTScsXHJcbiAgZm9ybWF0WWVhcjogJ3l5eXknLFxyXG4gIGZvcm1hdERheUhlYWRlcjogJ0VFRScsXHJcbiAgZm9ybWF0RGF5VGl0bGU6ICdNTU1NIHl5eXknLFxyXG4gIGZvcm1hdE1vbnRoVGl0bGU6ICd5eXl5JyxcclxuICBtYXhEYXRlOiBudWxsLFxyXG4gIG1heE1vZGU6ICd5ZWFyJyxcclxuICBtaW5EYXRlOiBudWxsLFxyXG4gIG1pbk1vZGU6ICdkYXknLFxyXG4gIG1vbnRoQ29sdW1uczogMyxcclxuICBuZ01vZGVsT3B0aW9uczoge30sXHJcbiAgc2hvcnRjdXRQcm9wYWdhdGlvbjogZmFsc2UsXHJcbiAgc2hvd1dlZWtzOiB0cnVlLFxyXG4gIHllYXJDb2x1bW5zOiA1LFxyXG4gIHllYXJSb3dzOiA0XHJcbn0pXHJcblxyXG4uY29udHJvbGxlcignVWliRGF0ZXBpY2tlckNvbnRyb2xsZXInLCBbJyRzY29wZScsICckZWxlbWVudCcsICckYXR0cnMnLCAnJHBhcnNlJywgJyRpbnRlcnBvbGF0ZScsICckbG9jYWxlJywgJyRsb2cnLCAnZGF0ZUZpbHRlcicsICd1aWJEYXRlcGlja2VyQ29uZmlnJywgJyRkYXRlcGlja2VyTGl0ZXJhbFdhcm5pbmcnLCAnJGRhdGVwaWNrZXJTdXBwcmVzc0Vycm9yJywgJ3VpYkRhdGVQYXJzZXInLFxyXG4gIGZ1bmN0aW9uKCRzY29wZSwgJGVsZW1lbnQsICRhdHRycywgJHBhcnNlLCAkaW50ZXJwb2xhdGUsICRsb2NhbGUsICRsb2csIGRhdGVGaWx0ZXIsIGRhdGVwaWNrZXJDb25maWcsICRkYXRlcGlja2VyTGl0ZXJhbFdhcm5pbmcsICRkYXRlcGlja2VyU3VwcHJlc3NFcnJvciwgZGF0ZVBhcnNlcikge1xyXG4gIHZhciBzZWxmID0gdGhpcyxcclxuICAgICAgbmdNb2RlbEN0cmwgPSB7ICRzZXRWaWV3VmFsdWU6IGFuZ3VsYXIubm9vcCB9LCAvLyBudWxsTW9kZWxDdHJsO1xyXG4gICAgICBuZ01vZGVsT3B0aW9ucyA9IHt9LFxyXG4gICAgICB3YXRjaExpc3RlbmVycyA9IFtdO1xyXG5cclxuICAkZWxlbWVudC5hZGRDbGFzcygndWliLWRhdGVwaWNrZXInKTtcclxuICAkYXR0cnMuJHNldCgncm9sZScsICdhcHBsaWNhdGlvbicpO1xyXG5cclxuICBpZiAoISRzY29wZS5kYXRlcGlja2VyT3B0aW9ucykge1xyXG4gICAgJHNjb3BlLmRhdGVwaWNrZXJPcHRpb25zID0ge307XHJcbiAgfVxyXG5cclxuICAvLyBNb2RlcyBjaGFpblxyXG4gIHRoaXMubW9kZXMgPSBbJ2RheScsICdtb250aCcsICd5ZWFyJ107XHJcblxyXG4gIFtcclxuICAgICdjdXN0b21DbGFzcycsXHJcbiAgICAnZGF0ZURpc2FibGVkJyxcclxuICAgICdkYXRlcGlja2VyTW9kZScsXHJcbiAgICAnZm9ybWF0RGF5JyxcclxuICAgICdmb3JtYXREYXlIZWFkZXInLFxyXG4gICAgJ2Zvcm1hdERheVRpdGxlJyxcclxuICAgICdmb3JtYXRNb250aCcsXHJcbiAgICAnZm9ybWF0TW9udGhUaXRsZScsXHJcbiAgICAnZm9ybWF0WWVhcicsXHJcbiAgICAnbWF4RGF0ZScsXHJcbiAgICAnbWF4TW9kZScsXHJcbiAgICAnbWluRGF0ZScsXHJcbiAgICAnbWluTW9kZScsXHJcbiAgICAnbW9udGhDb2x1bW5zJyxcclxuICAgICdzaG93V2Vla3MnLFxyXG4gICAgJ3Nob3J0Y3V0UHJvcGFnYXRpb24nLFxyXG4gICAgJ3N0YXJ0aW5nRGF5JyxcclxuICAgICd5ZWFyQ29sdW1ucycsXHJcbiAgICAneWVhclJvd3MnXHJcbiAgXS5mb3JFYWNoKGZ1bmN0aW9uKGtleSkge1xyXG4gICAgc3dpdGNoIChrZXkpIHtcclxuICAgICAgY2FzZSAnY3VzdG9tQ2xhc3MnOlxyXG4gICAgICBjYXNlICdkYXRlRGlzYWJsZWQnOlxyXG4gICAgICAgICRzY29wZVtrZXldID0gJHNjb3BlLmRhdGVwaWNrZXJPcHRpb25zW2tleV0gfHwgYW5ndWxhci5ub29wO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlICdkYXRlcGlja2VyTW9kZSc6XHJcbiAgICAgICAgJHNjb3BlLmRhdGVwaWNrZXJNb2RlID0gYW5ndWxhci5pc0RlZmluZWQoJHNjb3BlLmRhdGVwaWNrZXJPcHRpb25zLmRhdGVwaWNrZXJNb2RlKSA/XHJcbiAgICAgICAgICAkc2NvcGUuZGF0ZXBpY2tlck9wdGlvbnMuZGF0ZXBpY2tlck1vZGUgOiBkYXRlcGlja2VyQ29uZmlnLmRhdGVwaWNrZXJNb2RlO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlICdmb3JtYXREYXknOlxyXG4gICAgICBjYXNlICdmb3JtYXREYXlIZWFkZXInOlxyXG4gICAgICBjYXNlICdmb3JtYXREYXlUaXRsZSc6XHJcbiAgICAgIGNhc2UgJ2Zvcm1hdE1vbnRoJzpcclxuICAgICAgY2FzZSAnZm9ybWF0TW9udGhUaXRsZSc6XHJcbiAgICAgIGNhc2UgJ2Zvcm1hdFllYXInOlxyXG4gICAgICAgIHNlbGZba2V5XSA9IGFuZ3VsYXIuaXNEZWZpbmVkKCRzY29wZS5kYXRlcGlja2VyT3B0aW9uc1trZXldKSA/XHJcbiAgICAgICAgICAkaW50ZXJwb2xhdGUoJHNjb3BlLmRhdGVwaWNrZXJPcHRpb25zW2tleV0pKCRzY29wZS4kcGFyZW50KSA6XHJcbiAgICAgICAgICBkYXRlcGlja2VyQ29uZmlnW2tleV07XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgJ21vbnRoQ29sdW1ucyc6XHJcbiAgICAgIGNhc2UgJ3Nob3dXZWVrcyc6XHJcbiAgICAgIGNhc2UgJ3Nob3J0Y3V0UHJvcGFnYXRpb24nOlxyXG4gICAgICBjYXNlICd5ZWFyQ29sdW1ucyc6XHJcbiAgICAgIGNhc2UgJ3llYXJSb3dzJzpcclxuICAgICAgICBzZWxmW2tleV0gPSBhbmd1bGFyLmlzRGVmaW5lZCgkc2NvcGUuZGF0ZXBpY2tlck9wdGlvbnNba2V5XSkgP1xyXG4gICAgICAgICAgJHNjb3BlLmRhdGVwaWNrZXJPcHRpb25zW2tleV0gOiBkYXRlcGlja2VyQ29uZmlnW2tleV07XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgJ3N0YXJ0aW5nRGF5JzpcclxuICAgICAgICBpZiAoYW5ndWxhci5pc0RlZmluZWQoJHNjb3BlLmRhdGVwaWNrZXJPcHRpb25zLnN0YXJ0aW5nRGF5KSkge1xyXG4gICAgICAgICAgc2VsZi5zdGFydGluZ0RheSA9ICRzY29wZS5kYXRlcGlja2VyT3B0aW9ucy5zdGFydGluZ0RheTtcclxuICAgICAgICB9IGVsc2UgaWYgKGFuZ3VsYXIuaXNOdW1iZXIoZGF0ZXBpY2tlckNvbmZpZy5zdGFydGluZ0RheSkpIHtcclxuICAgICAgICAgIHNlbGYuc3RhcnRpbmdEYXkgPSBkYXRlcGlja2VyQ29uZmlnLnN0YXJ0aW5nRGF5O1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBzZWxmLnN0YXJ0aW5nRGF5ID0gKCRsb2NhbGUuREFURVRJTUVfRk9STUFUUy5GSVJTVERBWU9GV0VFSyArIDgpICUgNztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlICdtYXhEYXRlJzpcclxuICAgICAgY2FzZSAnbWluRGF0ZSc6XHJcbiAgICAgICAgJHNjb3BlLiR3YXRjaCgnZGF0ZXBpY2tlck9wdGlvbnMuJyArIGtleSwgZnVuY3Rpb24odmFsdWUpIHtcclxuICAgICAgICAgIGlmICh2YWx1ZSkge1xyXG4gICAgICAgICAgICBpZiAoYW5ndWxhci5pc0RhdGUodmFsdWUpKSB7XHJcbiAgICAgICAgICAgICAgc2VsZltrZXldID0gZGF0ZVBhcnNlci5mcm9tVGltZXpvbmUobmV3IERhdGUodmFsdWUpLCBuZ01vZGVsT3B0aW9ucy50aW1lem9uZSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgaWYgKCRkYXRlcGlja2VyTGl0ZXJhbFdhcm5pbmcpIHtcclxuICAgICAgICAgICAgICAgICRsb2cud2FybignTGl0ZXJhbCBkYXRlIHN1cHBvcnQgaGFzIGJlZW4gZGVwcmVjYXRlZCwgcGxlYXNlIHN3aXRjaCB0byBkYXRlIG9iamVjdCB1c2FnZScpO1xyXG4gICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgc2VsZltrZXldID0gbmV3IERhdGUoZGF0ZUZpbHRlcih2YWx1ZSwgJ21lZGl1bScpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgc2VsZltrZXldID0gZGF0ZXBpY2tlckNvbmZpZ1trZXldID9cclxuICAgICAgICAgICAgICBkYXRlUGFyc2VyLmZyb21UaW1lem9uZShuZXcgRGF0ZShkYXRlcGlja2VyQ29uZmlnW2tleV0pLCBuZ01vZGVsT3B0aW9ucy50aW1lem9uZSkgOlxyXG4gICAgICAgICAgICAgIG51bGw7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgc2VsZi5yZWZyZXNoVmlldygpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAnbWF4TW9kZSc6XHJcbiAgICAgIGNhc2UgJ21pbk1vZGUnOlxyXG4gICAgICAgIGlmICgkc2NvcGUuZGF0ZXBpY2tlck9wdGlvbnNba2V5XSkge1xyXG4gICAgICAgICAgJHNjb3BlLiR3YXRjaChmdW5jdGlvbigpIHsgcmV0dXJuICRzY29wZS5kYXRlcGlja2VyT3B0aW9uc1trZXldOyB9LCBmdW5jdGlvbih2YWx1ZSkge1xyXG4gICAgICAgICAgICBzZWxmW2tleV0gPSAkc2NvcGVba2V5XSA9IGFuZ3VsYXIuaXNEZWZpbmVkKHZhbHVlKSA/IHZhbHVlIDogJHNjb3BlLmRhdGVwaWNrZXJPcHRpb25zW2tleV07XHJcbiAgICAgICAgICAgIGlmIChrZXkgPT09ICdtaW5Nb2RlJyAmJiBzZWxmLm1vZGVzLmluZGV4T2YoJHNjb3BlLmRhdGVwaWNrZXJPcHRpb25zLmRhdGVwaWNrZXJNb2RlKSA8IHNlbGYubW9kZXMuaW5kZXhPZihzZWxmW2tleV0pIHx8XHJcbiAgICAgICAgICAgICAga2V5ID09PSAnbWF4TW9kZScgJiYgc2VsZi5tb2Rlcy5pbmRleE9mKCRzY29wZS5kYXRlcGlja2VyT3B0aW9ucy5kYXRlcGlja2VyTW9kZSkgPiBzZWxmLm1vZGVzLmluZGV4T2Yoc2VsZltrZXldKSkge1xyXG4gICAgICAgICAgICAgICRzY29wZS5kYXRlcGlja2VyTW9kZSA9IHNlbGZba2V5XTtcclxuICAgICAgICAgICAgICAkc2NvcGUuZGF0ZXBpY2tlck9wdGlvbnMuZGF0ZXBpY2tlck1vZGUgPSBzZWxmW2tleV07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBzZWxmW2tleV0gPSAkc2NvcGVba2V5XSA9IGRhdGVwaWNrZXJDb25maWdba2V5XSB8fCBudWxsO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgfSk7XHJcblxyXG4gICRzY29wZS51bmlxdWVJZCA9ICdkYXRlcGlja2VyLScgKyAkc2NvcGUuJGlkICsgJy0nICsgTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMTAwMDApO1xyXG5cclxuICAkc2NvcGUuZGlzYWJsZWQgPSBhbmd1bGFyLmlzRGVmaW5lZCgkYXR0cnMuZGlzYWJsZWQpIHx8IGZhbHNlO1xyXG4gIGlmIChhbmd1bGFyLmlzRGVmaW5lZCgkYXR0cnMubmdEaXNhYmxlZCkpIHtcclxuICAgIHdhdGNoTGlzdGVuZXJzLnB1c2goJHNjb3BlLiRwYXJlbnQuJHdhdGNoKCRhdHRycy5uZ0Rpc2FibGVkLCBmdW5jdGlvbihkaXNhYmxlZCkge1xyXG4gICAgICAkc2NvcGUuZGlzYWJsZWQgPSBkaXNhYmxlZDtcclxuICAgICAgc2VsZi5yZWZyZXNoVmlldygpO1xyXG4gICAgfSkpO1xyXG4gIH1cclxuXHJcbiAgJHNjb3BlLmlzQWN0aXZlID0gZnVuY3Rpb24oZGF0ZU9iamVjdCkge1xyXG4gICAgaWYgKHNlbGYuY29tcGFyZShkYXRlT2JqZWN0LmRhdGUsIHNlbGYuYWN0aXZlRGF0ZSkgPT09IDApIHtcclxuICAgICAgJHNjb3BlLmFjdGl2ZURhdGVJZCA9IGRhdGVPYmplY3QudWlkO1xyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9O1xyXG5cclxuICB0aGlzLmluaXQgPSBmdW5jdGlvbihuZ01vZGVsQ3RybF8pIHtcclxuICAgIG5nTW9kZWxDdHJsID0gbmdNb2RlbEN0cmxfO1xyXG4gICAgbmdNb2RlbE9wdGlvbnMgPSBuZ01vZGVsQ3RybF8uJG9wdGlvbnMgfHxcclxuICAgICAgJHNjb3BlLmRhdGVwaWNrZXJPcHRpb25zLm5nTW9kZWxPcHRpb25zIHx8XHJcbiAgICAgIGRhdGVwaWNrZXJDb25maWcubmdNb2RlbE9wdGlvbnM7XHJcbiAgICBpZiAoJHNjb3BlLmRhdGVwaWNrZXJPcHRpb25zLmluaXREYXRlKSB7XHJcbiAgICAgIHNlbGYuYWN0aXZlRGF0ZSA9IGRhdGVQYXJzZXIuZnJvbVRpbWV6b25lKCRzY29wZS5kYXRlcGlja2VyT3B0aW9ucy5pbml0RGF0ZSwgbmdNb2RlbE9wdGlvbnMudGltZXpvbmUpIHx8IG5ldyBEYXRlKCk7XHJcbiAgICAgICRzY29wZS4kd2F0Y2goJ2RhdGVwaWNrZXJPcHRpb25zLmluaXREYXRlJywgZnVuY3Rpb24oaW5pdERhdGUpIHtcclxuICAgICAgICBpZiAoaW5pdERhdGUgJiYgKG5nTW9kZWxDdHJsLiRpc0VtcHR5KG5nTW9kZWxDdHJsLiRtb2RlbFZhbHVlKSB8fCBuZ01vZGVsQ3RybC4kaW52YWxpZCkpIHtcclxuICAgICAgICAgIHNlbGYuYWN0aXZlRGF0ZSA9IGRhdGVQYXJzZXIuZnJvbVRpbWV6b25lKGluaXREYXRlLCBuZ01vZGVsT3B0aW9ucy50aW1lem9uZSk7XHJcbiAgICAgICAgICBzZWxmLnJlZnJlc2hWaWV3KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHNlbGYuYWN0aXZlRGF0ZSA9IG5ldyBEYXRlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGRhdGUgPSBuZ01vZGVsQ3RybC4kbW9kZWxWYWx1ZSA/IG5ldyBEYXRlKG5nTW9kZWxDdHJsLiRtb2RlbFZhbHVlKSA6IG5ldyBEYXRlKCk7XHJcbiAgICB0aGlzLmFjdGl2ZURhdGUgPSAhaXNOYU4oZGF0ZSkgP1xyXG4gICAgICBkYXRlUGFyc2VyLmZyb21UaW1lem9uZShkYXRlLCBuZ01vZGVsT3B0aW9ucy50aW1lem9uZSkgOlxyXG4gICAgICBkYXRlUGFyc2VyLmZyb21UaW1lem9uZShuZXcgRGF0ZSgpLCBuZ01vZGVsT3B0aW9ucy50aW1lem9uZSk7XHJcblxyXG4gICAgbmdNb2RlbEN0cmwuJHJlbmRlciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICBzZWxmLnJlbmRlcigpO1xyXG4gICAgfTtcclxuICB9O1xyXG5cclxuICB0aGlzLnJlbmRlciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgaWYgKG5nTW9kZWxDdHJsLiR2aWV3VmFsdWUpIHtcclxuICAgICAgdmFyIGRhdGUgPSBuZXcgRGF0ZShuZ01vZGVsQ3RybC4kdmlld1ZhbHVlKSxcclxuICAgICAgICAgIGlzVmFsaWQgPSAhaXNOYU4oZGF0ZSk7XHJcblxyXG4gICAgICBpZiAoaXNWYWxpZCkge1xyXG4gICAgICAgIHRoaXMuYWN0aXZlRGF0ZSA9IGRhdGVQYXJzZXIuZnJvbVRpbWV6b25lKGRhdGUsIG5nTW9kZWxPcHRpb25zLnRpbWV6b25lKTtcclxuICAgICAgfSBlbHNlIGlmICghJGRhdGVwaWNrZXJTdXBwcmVzc0Vycm9yKSB7XHJcbiAgICAgICAgJGxvZy5lcnJvcignRGF0ZXBpY2tlciBkaXJlY3RpdmU6IFwibmctbW9kZWxcIiB2YWx1ZSBtdXN0IGJlIGEgRGF0ZSBvYmplY3QnKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgdGhpcy5yZWZyZXNoVmlldygpO1xyXG4gIH07XHJcblxyXG4gIHRoaXMucmVmcmVzaFZpZXcgPSBmdW5jdGlvbigpIHtcclxuICAgIGlmICh0aGlzLmVsZW1lbnQpIHtcclxuICAgICAgJHNjb3BlLnNlbGVjdGVkRHQgPSBudWxsO1xyXG4gICAgICB0aGlzLl9yZWZyZXNoVmlldygpO1xyXG4gICAgICBpZiAoJHNjb3BlLmFjdGl2ZUR0KSB7XHJcbiAgICAgICAgJHNjb3BlLmFjdGl2ZURhdGVJZCA9ICRzY29wZS5hY3RpdmVEdC51aWQ7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHZhciBkYXRlID0gbmdNb2RlbEN0cmwuJHZpZXdWYWx1ZSA/IG5ldyBEYXRlKG5nTW9kZWxDdHJsLiR2aWV3VmFsdWUpIDogbnVsbDtcclxuICAgICAgZGF0ZSA9IGRhdGVQYXJzZXIuZnJvbVRpbWV6b25lKGRhdGUsIG5nTW9kZWxPcHRpb25zLnRpbWV6b25lKTtcclxuICAgICAgbmdNb2RlbEN0cmwuJHNldFZhbGlkaXR5KCdkYXRlRGlzYWJsZWQnLCAhZGF0ZSB8fFxyXG4gICAgICAgIHRoaXMuZWxlbWVudCAmJiAhdGhpcy5pc0Rpc2FibGVkKGRhdGUpKTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICB0aGlzLmNyZWF0ZURhdGVPYmplY3QgPSBmdW5jdGlvbihkYXRlLCBmb3JtYXQpIHtcclxuICAgIHZhciBtb2RlbCA9IG5nTW9kZWxDdHJsLiR2aWV3VmFsdWUgPyBuZXcgRGF0ZShuZ01vZGVsQ3RybC4kdmlld1ZhbHVlKSA6IG51bGw7XHJcbiAgICBtb2RlbCA9IGRhdGVQYXJzZXIuZnJvbVRpbWV6b25lKG1vZGVsLCBuZ01vZGVsT3B0aW9ucy50aW1lem9uZSk7XHJcbiAgICB2YXIgdG9kYXkgPSBuZXcgRGF0ZSgpO1xyXG4gICAgdG9kYXkgPSBkYXRlUGFyc2VyLmZyb21UaW1lem9uZSh0b2RheSwgbmdNb2RlbE9wdGlvbnMudGltZXpvbmUpO1xyXG4gICAgdmFyIHRpbWUgPSB0aGlzLmNvbXBhcmUoZGF0ZSwgdG9kYXkpO1xyXG4gICAgdmFyIGR0ID0ge1xyXG4gICAgICBkYXRlOiBkYXRlLFxyXG4gICAgICBsYWJlbDogZGF0ZVBhcnNlci5maWx0ZXIoZGF0ZSwgZm9ybWF0KSxcclxuICAgICAgc2VsZWN0ZWQ6IG1vZGVsICYmIHRoaXMuY29tcGFyZShkYXRlLCBtb2RlbCkgPT09IDAsXHJcbiAgICAgIGRpc2FibGVkOiB0aGlzLmlzRGlzYWJsZWQoZGF0ZSksXHJcbiAgICAgIHBhc3Q6IHRpbWUgPCAwLFxyXG4gICAgICBjdXJyZW50OiB0aW1lID09PSAwLFxyXG4gICAgICBmdXR1cmU6IHRpbWUgPiAwLFxyXG4gICAgICBjdXN0b21DbGFzczogdGhpcy5jdXN0b21DbGFzcyhkYXRlKSB8fCBudWxsXHJcbiAgICB9O1xyXG5cclxuICAgIGlmIChtb2RlbCAmJiB0aGlzLmNvbXBhcmUoZGF0ZSwgbW9kZWwpID09PSAwKSB7XHJcbiAgICAgICRzY29wZS5zZWxlY3RlZER0ID0gZHQ7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHNlbGYuYWN0aXZlRGF0ZSAmJiB0aGlzLmNvbXBhcmUoZHQuZGF0ZSwgc2VsZi5hY3RpdmVEYXRlKSA9PT0gMCkge1xyXG4gICAgICAkc2NvcGUuYWN0aXZlRHQgPSBkdDtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gZHQ7XHJcbiAgfTtcclxuXHJcbiAgdGhpcy5pc0Rpc2FibGVkID0gZnVuY3Rpb24oZGF0ZSkge1xyXG4gICAgcmV0dXJuICRzY29wZS5kaXNhYmxlZCB8fFxyXG4gICAgICB0aGlzLm1pbkRhdGUgJiYgdGhpcy5jb21wYXJlKGRhdGUsIHRoaXMubWluRGF0ZSkgPCAwIHx8XHJcbiAgICAgIHRoaXMubWF4RGF0ZSAmJiB0aGlzLmNvbXBhcmUoZGF0ZSwgdGhpcy5tYXhEYXRlKSA+IDAgfHxcclxuICAgICAgJHNjb3BlLmRhdGVEaXNhYmxlZCAmJiAkc2NvcGUuZGF0ZURpc2FibGVkKHtkYXRlOiBkYXRlLCBtb2RlOiAkc2NvcGUuZGF0ZXBpY2tlck1vZGV9KTtcclxuICB9O1xyXG5cclxuICB0aGlzLmN1c3RvbUNsYXNzID0gZnVuY3Rpb24oZGF0ZSkge1xyXG4gICAgcmV0dXJuICRzY29wZS5jdXN0b21DbGFzcyh7ZGF0ZTogZGF0ZSwgbW9kZTogJHNjb3BlLmRhdGVwaWNrZXJNb2RlfSk7XHJcbiAgfTtcclxuXHJcbiAgLy8gU3BsaXQgYXJyYXkgaW50byBzbWFsbGVyIGFycmF5c1xyXG4gIHRoaXMuc3BsaXQgPSBmdW5jdGlvbihhcnIsIHNpemUpIHtcclxuICAgIHZhciBhcnJheXMgPSBbXTtcclxuICAgIHdoaWxlIChhcnIubGVuZ3RoID4gMCkge1xyXG4gICAgICBhcnJheXMucHVzaChhcnIuc3BsaWNlKDAsIHNpemUpKTtcclxuICAgIH1cclxuICAgIHJldHVybiBhcnJheXM7XHJcbiAgfTtcclxuXHJcbiAgJHNjb3BlLnNlbGVjdCA9IGZ1bmN0aW9uKGRhdGUpIHtcclxuICAgIGlmICgkc2NvcGUuZGF0ZXBpY2tlck1vZGUgPT09IHNlbGYubWluTW9kZSkge1xyXG4gICAgICB2YXIgZHQgPSBuZ01vZGVsQ3RybC4kdmlld1ZhbHVlID8gZGF0ZVBhcnNlci5mcm9tVGltZXpvbmUobmV3IERhdGUobmdNb2RlbEN0cmwuJHZpZXdWYWx1ZSksIG5nTW9kZWxPcHRpb25zLnRpbWV6b25lKSA6IG5ldyBEYXRlKDAsIDAsIDAsIDAsIDAsIDAsIDApO1xyXG4gICAgICBkdC5zZXRGdWxsWWVhcihkYXRlLmdldEZ1bGxZZWFyKCksIGRhdGUuZ2V0TW9udGgoKSwgZGF0ZS5nZXREYXRlKCkpO1xyXG4gICAgICBkdCA9IGRhdGVQYXJzZXIudG9UaW1lem9uZShkdCwgbmdNb2RlbE9wdGlvbnMudGltZXpvbmUpO1xyXG4gICAgICBuZ01vZGVsQ3RybC4kc2V0Vmlld1ZhbHVlKGR0KTtcclxuICAgICAgbmdNb2RlbEN0cmwuJHJlbmRlcigpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgc2VsZi5hY3RpdmVEYXRlID0gZGF0ZTtcclxuICAgICAgc2V0TW9kZShzZWxmLm1vZGVzW3NlbGYubW9kZXMuaW5kZXhPZigkc2NvcGUuZGF0ZXBpY2tlck1vZGUpIC0gMV0pO1xyXG5cclxuICAgICAgJHNjb3BlLiRlbWl0KCd1aWI6ZGF0ZXBpY2tlci5tb2RlJyk7XHJcbiAgICB9XHJcblxyXG4gICAgJHNjb3BlLiRicm9hZGNhc3QoJ3VpYjpkYXRlcGlja2VyLmZvY3VzJyk7XHJcbiAgfTtcclxuXHJcbiAgJHNjb3BlLm1vdmUgPSBmdW5jdGlvbihkaXJlY3Rpb24pIHtcclxuICAgIHZhciB5ZWFyID0gc2VsZi5hY3RpdmVEYXRlLmdldEZ1bGxZZWFyKCkgKyBkaXJlY3Rpb24gKiAoc2VsZi5zdGVwLnllYXJzIHx8IDApLFxyXG4gICAgICAgIG1vbnRoID0gc2VsZi5hY3RpdmVEYXRlLmdldE1vbnRoKCkgKyBkaXJlY3Rpb24gKiAoc2VsZi5zdGVwLm1vbnRocyB8fCAwKTtcclxuICAgIHNlbGYuYWN0aXZlRGF0ZS5zZXRGdWxsWWVhcih5ZWFyLCBtb250aCwgMSk7XHJcbiAgICBzZWxmLnJlZnJlc2hWaWV3KCk7XHJcbiAgfTtcclxuXHJcbiAgJHNjb3BlLnRvZ2dsZU1vZGUgPSBmdW5jdGlvbihkaXJlY3Rpb24pIHtcclxuICAgIGRpcmVjdGlvbiA9IGRpcmVjdGlvbiB8fCAxO1xyXG5cclxuICAgIGlmICgkc2NvcGUuZGF0ZXBpY2tlck1vZGUgPT09IHNlbGYubWF4TW9kZSAmJiBkaXJlY3Rpb24gPT09IDEgfHxcclxuICAgICAgJHNjb3BlLmRhdGVwaWNrZXJNb2RlID09PSBzZWxmLm1pbk1vZGUgJiYgZGlyZWN0aW9uID09PSAtMSkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgc2V0TW9kZShzZWxmLm1vZGVzW3NlbGYubW9kZXMuaW5kZXhPZigkc2NvcGUuZGF0ZXBpY2tlck1vZGUpICsgZGlyZWN0aW9uXSk7XHJcblxyXG4gICAgJHNjb3BlLiRlbWl0KCd1aWI6ZGF0ZXBpY2tlci5tb2RlJyk7XHJcbiAgfTtcclxuXHJcbiAgLy8gS2V5IGV2ZW50IG1hcHBlclxyXG4gICRzY29wZS5rZXlzID0geyAxMzogJ2VudGVyJywgMzI6ICdzcGFjZScsIDMzOiAncGFnZXVwJywgMzQ6ICdwYWdlZG93bicsIDM1OiAnZW5kJywgMzY6ICdob21lJywgMzc6ICdsZWZ0JywgMzg6ICd1cCcsIDM5OiAncmlnaHQnLCA0MDogJ2Rvd24nIH07XHJcblxyXG4gIHZhciBmb2N1c0VsZW1lbnQgPSBmdW5jdGlvbigpIHtcclxuICAgIHNlbGYuZWxlbWVudFswXS5mb2N1cygpO1xyXG4gIH07XHJcblxyXG4gIC8vIExpc3RlbiBmb3IgZm9jdXMgcmVxdWVzdHMgZnJvbSBwb3B1cCBkaXJlY3RpdmVcclxuICAkc2NvcGUuJG9uKCd1aWI6ZGF0ZXBpY2tlci5mb2N1cycsIGZvY3VzRWxlbWVudCk7XHJcblxyXG4gICRzY29wZS5rZXlkb3duID0gZnVuY3Rpb24oZXZ0KSB7XHJcbiAgICB2YXIga2V5ID0gJHNjb3BlLmtleXNbZXZ0LndoaWNoXTtcclxuXHJcbiAgICBpZiAoIWtleSB8fCBldnQuc2hpZnRLZXkgfHwgZXZ0LmFsdEtleSB8fCAkc2NvcGUuZGlzYWJsZWQpIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgaWYgKCFzZWxmLnNob3J0Y3V0UHJvcGFnYXRpb24pIHtcclxuICAgICAgZXZ0LnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChrZXkgPT09ICdlbnRlcicgfHwga2V5ID09PSAnc3BhY2UnKSB7XHJcbiAgICAgIGlmIChzZWxmLmlzRGlzYWJsZWQoc2VsZi5hY3RpdmVEYXRlKSkge1xyXG4gICAgICAgIHJldHVybjsgLy8gZG8gbm90aGluZ1xyXG4gICAgICB9XHJcbiAgICAgICRzY29wZS5zZWxlY3Qoc2VsZi5hY3RpdmVEYXRlKTtcclxuICAgIH0gZWxzZSBpZiAoZXZ0LmN0cmxLZXkgJiYgKGtleSA9PT0gJ3VwJyB8fCBrZXkgPT09ICdkb3duJykpIHtcclxuICAgICAgJHNjb3BlLnRvZ2dsZU1vZGUoa2V5ID09PSAndXAnID8gMSA6IC0xKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHNlbGYuaGFuZGxlS2V5RG93bihrZXksIGV2dCk7XHJcbiAgICAgIHNlbGYucmVmcmVzaFZpZXcoKTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICAkZWxlbWVudC5vbigna2V5ZG93bicsIGZ1bmN0aW9uKGV2dCkge1xyXG4gICAgJHNjb3BlLiRhcHBseShmdW5jdGlvbigpIHtcclxuICAgICAgJHNjb3BlLmtleWRvd24oZXZ0KTtcclxuICAgIH0pO1xyXG4gIH0pO1xyXG5cclxuICAkc2NvcGUuJG9uKCckZGVzdHJveScsIGZ1bmN0aW9uKCkge1xyXG4gICAgLy9DbGVhciBhbGwgd2F0Y2ggbGlzdGVuZXJzIG9uIGRlc3Ryb3lcclxuICAgIHdoaWxlICh3YXRjaExpc3RlbmVycy5sZW5ndGgpIHtcclxuICAgICAgd2F0Y2hMaXN0ZW5lcnMuc2hpZnQoKSgpO1xyXG4gICAgfVxyXG4gIH0pO1xyXG5cclxuICBmdW5jdGlvbiBzZXRNb2RlKG1vZGUpIHtcclxuICAgICRzY29wZS5kYXRlcGlja2VyTW9kZSA9IG1vZGU7XHJcbiAgICAkc2NvcGUuZGF0ZXBpY2tlck9wdGlvbnMuZGF0ZXBpY2tlck1vZGUgPSBtb2RlO1xyXG4gIH1cclxufV0pXHJcblxyXG4uY29udHJvbGxlcignVWliRGF5cGlja2VyQ29udHJvbGxlcicsIFsnJHNjb3BlJywgJyRlbGVtZW50JywgJ2RhdGVGaWx0ZXInLCBmdW5jdGlvbihzY29wZSwgJGVsZW1lbnQsIGRhdGVGaWx0ZXIpIHtcclxuICB2YXIgREFZU19JTl9NT05USCA9IFszMSwgMjgsIDMxLCAzMCwgMzEsIDMwLCAzMSwgMzEsIDMwLCAzMSwgMzAsIDMxXTtcclxuXHJcbiAgdGhpcy5zdGVwID0geyBtb250aHM6IDEgfTtcclxuICB0aGlzLmVsZW1lbnQgPSAkZWxlbWVudDtcclxuICBmdW5jdGlvbiBnZXREYXlzSW5Nb250aCh5ZWFyLCBtb250aCkge1xyXG4gICAgcmV0dXJuIG1vbnRoID09PSAxICYmIHllYXIgJSA0ID09PSAwICYmXHJcbiAgICAgICh5ZWFyICUgMTAwICE9PSAwIHx8IHllYXIgJSA0MDAgPT09IDApID8gMjkgOiBEQVlTX0lOX01PTlRIW21vbnRoXTtcclxuICB9XHJcblxyXG4gIHRoaXMuaW5pdCA9IGZ1bmN0aW9uKGN0cmwpIHtcclxuICAgIGFuZ3VsYXIuZXh0ZW5kKGN0cmwsIHRoaXMpO1xyXG4gICAgc2NvcGUuc2hvd1dlZWtzID0gY3RybC5zaG93V2Vla3M7XHJcbiAgICBjdHJsLnJlZnJlc2hWaWV3KCk7XHJcbiAgfTtcclxuXHJcbiAgdGhpcy5nZXREYXRlcyA9IGZ1bmN0aW9uKHN0YXJ0RGF0ZSwgbikge1xyXG4gICAgdmFyIGRhdGVzID0gbmV3IEFycmF5KG4pLCBjdXJyZW50ID0gbmV3IERhdGUoc3RhcnREYXRlKSwgaSA9IDAsIGRhdGU7XHJcbiAgICB3aGlsZSAoaSA8IG4pIHtcclxuICAgICAgZGF0ZSA9IG5ldyBEYXRlKGN1cnJlbnQpO1xyXG4gICAgICBkYXRlc1tpKytdID0gZGF0ZTtcclxuICAgICAgY3VycmVudC5zZXREYXRlKGN1cnJlbnQuZ2V0RGF0ZSgpICsgMSk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZGF0ZXM7XHJcbiAgfTtcclxuXHJcbiAgdGhpcy5fcmVmcmVzaFZpZXcgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciB5ZWFyID0gdGhpcy5hY3RpdmVEYXRlLmdldEZ1bGxZZWFyKCksXHJcbiAgICAgIG1vbnRoID0gdGhpcy5hY3RpdmVEYXRlLmdldE1vbnRoKCksXHJcbiAgICAgIGZpcnN0RGF5T2ZNb250aCA9IG5ldyBEYXRlKHRoaXMuYWN0aXZlRGF0ZSk7XHJcblxyXG4gICAgZmlyc3REYXlPZk1vbnRoLnNldEZ1bGxZZWFyKHllYXIsIG1vbnRoLCAxKTtcclxuXHJcbiAgICB2YXIgZGlmZmVyZW5jZSA9IHRoaXMuc3RhcnRpbmdEYXkgLSBmaXJzdERheU9mTW9udGguZ2V0RGF5KCksXHJcbiAgICAgIG51bURpc3BsYXllZEZyb21QcmV2aW91c01vbnRoID0gZGlmZmVyZW5jZSA+IDAgP1xyXG4gICAgICAgIDcgLSBkaWZmZXJlbmNlIDogLSBkaWZmZXJlbmNlLFxyXG4gICAgICBmaXJzdERhdGUgPSBuZXcgRGF0ZShmaXJzdERheU9mTW9udGgpO1xyXG5cclxuICAgIGlmIChudW1EaXNwbGF5ZWRGcm9tUHJldmlvdXNNb250aCA+IDApIHtcclxuICAgICAgZmlyc3REYXRlLnNldERhdGUoLW51bURpc3BsYXllZEZyb21QcmV2aW91c01vbnRoICsgMSk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gNDIgaXMgdGhlIG51bWJlciBvZiBkYXlzIG9uIGEgc2l4LXdlZWsgY2FsZW5kYXJcclxuICAgIHZhciBkYXlzID0gdGhpcy5nZXREYXRlcyhmaXJzdERhdGUsIDQyKTtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgNDI7IGkgKyspIHtcclxuICAgICAgZGF5c1tpXSA9IGFuZ3VsYXIuZXh0ZW5kKHRoaXMuY3JlYXRlRGF0ZU9iamVjdChkYXlzW2ldLCB0aGlzLmZvcm1hdERheSksIHtcclxuICAgICAgICBzZWNvbmRhcnk6IGRheXNbaV0uZ2V0TW9udGgoKSAhPT0gbW9udGgsXHJcbiAgICAgICAgdWlkOiBzY29wZS51bmlxdWVJZCArICctJyArIGlcclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgc2NvcGUubGFiZWxzID0gbmV3IEFycmF5KDcpO1xyXG4gICAgZm9yICh2YXIgaiA9IDA7IGogPCA3OyBqKyspIHtcclxuICAgICAgc2NvcGUubGFiZWxzW2pdID0ge1xyXG4gICAgICAgIGFiYnI6IGRhdGVGaWx0ZXIoZGF5c1tqXS5kYXRlLCB0aGlzLmZvcm1hdERheUhlYWRlciksXHJcbiAgICAgICAgZnVsbDogZGF0ZUZpbHRlcihkYXlzW2pdLmRhdGUsICdFRUVFJylcclxuICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICBzY29wZS50aXRsZSA9IGRhdGVGaWx0ZXIodGhpcy5hY3RpdmVEYXRlLCB0aGlzLmZvcm1hdERheVRpdGxlKTtcclxuICAgIHNjb3BlLnJvd3MgPSB0aGlzLnNwbGl0KGRheXMsIDcpO1xyXG5cclxuICAgIGlmIChzY29wZS5zaG93V2Vla3MpIHtcclxuICAgICAgc2NvcGUud2Vla051bWJlcnMgPSBbXTtcclxuICAgICAgdmFyIHRodXJzZGF5SW5kZXggPSAoNCArIDcgLSB0aGlzLnN0YXJ0aW5nRGF5KSAlIDcsXHJcbiAgICAgICAgICBudW1XZWVrcyA9IHNjb3BlLnJvd3MubGVuZ3RoO1xyXG4gICAgICBmb3IgKHZhciBjdXJXZWVrID0gMDsgY3VyV2VlayA8IG51bVdlZWtzOyBjdXJXZWVrKyspIHtcclxuICAgICAgICBzY29wZS53ZWVrTnVtYmVycy5wdXNoKFxyXG4gICAgICAgICAgZ2V0SVNPODYwMVdlZWtOdW1iZXIoc2NvcGUucm93c1tjdXJXZWVrXVt0aHVyc2RheUluZGV4XS5kYXRlKSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9O1xyXG5cclxuICB0aGlzLmNvbXBhcmUgPSBmdW5jdGlvbihkYXRlMSwgZGF0ZTIpIHtcclxuICAgIHZhciBfZGF0ZTEgPSBuZXcgRGF0ZShkYXRlMS5nZXRGdWxsWWVhcigpLCBkYXRlMS5nZXRNb250aCgpLCBkYXRlMS5nZXREYXRlKCkpO1xyXG4gICAgdmFyIF9kYXRlMiA9IG5ldyBEYXRlKGRhdGUyLmdldEZ1bGxZZWFyKCksIGRhdGUyLmdldE1vbnRoKCksIGRhdGUyLmdldERhdGUoKSk7XHJcbiAgICBfZGF0ZTEuc2V0RnVsbFllYXIoZGF0ZTEuZ2V0RnVsbFllYXIoKSk7XHJcbiAgICBfZGF0ZTIuc2V0RnVsbFllYXIoZGF0ZTIuZ2V0RnVsbFllYXIoKSk7XHJcbiAgICByZXR1cm4gX2RhdGUxIC0gX2RhdGUyO1xyXG4gIH07XHJcblxyXG4gIGZ1bmN0aW9uIGdldElTTzg2MDFXZWVrTnVtYmVyKGRhdGUpIHtcclxuICAgIHZhciBjaGVja0RhdGUgPSBuZXcgRGF0ZShkYXRlKTtcclxuICAgIGNoZWNrRGF0ZS5zZXREYXRlKGNoZWNrRGF0ZS5nZXREYXRlKCkgKyA0IC0gKGNoZWNrRGF0ZS5nZXREYXkoKSB8fCA3KSk7IC8vIFRodXJzZGF5XHJcbiAgICB2YXIgdGltZSA9IGNoZWNrRGF0ZS5nZXRUaW1lKCk7XHJcbiAgICBjaGVja0RhdGUuc2V0TW9udGgoMCk7IC8vIENvbXBhcmUgd2l0aCBKYW4gMVxyXG4gICAgY2hlY2tEYXRlLnNldERhdGUoMSk7XHJcbiAgICByZXR1cm4gTWF0aC5mbG9vcihNYXRoLnJvdW5kKCh0aW1lIC0gY2hlY2tEYXRlKSAvIDg2NDAwMDAwKSAvIDcpICsgMTtcclxuICB9XHJcblxyXG4gIHRoaXMuaGFuZGxlS2V5RG93biA9IGZ1bmN0aW9uKGtleSwgZXZ0KSB7XHJcbiAgICB2YXIgZGF0ZSA9IHRoaXMuYWN0aXZlRGF0ZS5nZXREYXRlKCk7XHJcblxyXG4gICAgaWYgKGtleSA9PT0gJ2xlZnQnKSB7XHJcbiAgICAgIGRhdGUgPSBkYXRlIC0gMTtcclxuICAgIH0gZWxzZSBpZiAoa2V5ID09PSAndXAnKSB7XHJcbiAgICAgIGRhdGUgPSBkYXRlIC0gNztcclxuICAgIH0gZWxzZSBpZiAoa2V5ID09PSAncmlnaHQnKSB7XHJcbiAgICAgIGRhdGUgPSBkYXRlICsgMTtcclxuICAgIH0gZWxzZSBpZiAoa2V5ID09PSAnZG93bicpIHtcclxuICAgICAgZGF0ZSA9IGRhdGUgKyA3O1xyXG4gICAgfSBlbHNlIGlmIChrZXkgPT09ICdwYWdldXAnIHx8IGtleSA9PT0gJ3BhZ2Vkb3duJykge1xyXG4gICAgICB2YXIgbW9udGggPSB0aGlzLmFjdGl2ZURhdGUuZ2V0TW9udGgoKSArIChrZXkgPT09ICdwYWdldXAnID8gLSAxIDogMSk7XHJcbiAgICAgIHRoaXMuYWN0aXZlRGF0ZS5zZXRNb250aChtb250aCwgMSk7XHJcbiAgICAgIGRhdGUgPSBNYXRoLm1pbihnZXREYXlzSW5Nb250aCh0aGlzLmFjdGl2ZURhdGUuZ2V0RnVsbFllYXIoKSwgdGhpcy5hY3RpdmVEYXRlLmdldE1vbnRoKCkpLCBkYXRlKTtcclxuICAgIH0gZWxzZSBpZiAoa2V5ID09PSAnaG9tZScpIHtcclxuICAgICAgZGF0ZSA9IDE7XHJcbiAgICB9IGVsc2UgaWYgKGtleSA9PT0gJ2VuZCcpIHtcclxuICAgICAgZGF0ZSA9IGdldERheXNJbk1vbnRoKHRoaXMuYWN0aXZlRGF0ZS5nZXRGdWxsWWVhcigpLCB0aGlzLmFjdGl2ZURhdGUuZ2V0TW9udGgoKSk7XHJcbiAgICB9XHJcbiAgICB0aGlzLmFjdGl2ZURhdGUuc2V0RGF0ZShkYXRlKTtcclxuICB9O1xyXG59XSlcclxuXHJcbi5jb250cm9sbGVyKCdVaWJNb250aHBpY2tlckNvbnRyb2xsZXInLCBbJyRzY29wZScsICckZWxlbWVudCcsICdkYXRlRmlsdGVyJywgZnVuY3Rpb24oc2NvcGUsICRlbGVtZW50LCBkYXRlRmlsdGVyKSB7XHJcbiAgdGhpcy5zdGVwID0geyB5ZWFyczogMSB9O1xyXG4gIHRoaXMuZWxlbWVudCA9ICRlbGVtZW50O1xyXG5cclxuICB0aGlzLmluaXQgPSBmdW5jdGlvbihjdHJsKSB7XHJcbiAgICBhbmd1bGFyLmV4dGVuZChjdHJsLCB0aGlzKTtcclxuICAgIGN0cmwucmVmcmVzaFZpZXcoKTtcclxuICB9O1xyXG5cclxuICB0aGlzLl9yZWZyZXNoVmlldyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIG1vbnRocyA9IG5ldyBBcnJheSgxMiksXHJcbiAgICAgICAgeWVhciA9IHRoaXMuYWN0aXZlRGF0ZS5nZXRGdWxsWWVhcigpLFxyXG4gICAgICAgIGRhdGU7XHJcblxyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCAxMjsgaSsrKSB7XHJcbiAgICAgIGRhdGUgPSBuZXcgRGF0ZSh0aGlzLmFjdGl2ZURhdGUpO1xyXG4gICAgICBkYXRlLnNldEZ1bGxZZWFyKHllYXIsIGksIDEpO1xyXG4gICAgICBtb250aHNbaV0gPSBhbmd1bGFyLmV4dGVuZCh0aGlzLmNyZWF0ZURhdGVPYmplY3QoZGF0ZSwgdGhpcy5mb3JtYXRNb250aCksIHtcclxuICAgICAgICB1aWQ6IHNjb3BlLnVuaXF1ZUlkICsgJy0nICsgaVxyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBzY29wZS50aXRsZSA9IGRhdGVGaWx0ZXIodGhpcy5hY3RpdmVEYXRlLCB0aGlzLmZvcm1hdE1vbnRoVGl0bGUpO1xyXG4gICAgc2NvcGUucm93cyA9IHRoaXMuc3BsaXQobW9udGhzLCB0aGlzLm1vbnRoQ29sdW1ucyk7XHJcbiAgICBzY29wZS55ZWFySGVhZGVyQ29sc3BhbiA9IHRoaXMubW9udGhDb2x1bW5zID4gMyA/IHRoaXMubW9udGhDb2x1bW5zIC0gMiA6IDE7XHJcbiAgfTtcclxuXHJcbiAgdGhpcy5jb21wYXJlID0gZnVuY3Rpb24oZGF0ZTEsIGRhdGUyKSB7XHJcbiAgICB2YXIgX2RhdGUxID0gbmV3IERhdGUoZGF0ZTEuZ2V0RnVsbFllYXIoKSwgZGF0ZTEuZ2V0TW9udGgoKSk7XHJcbiAgICB2YXIgX2RhdGUyID0gbmV3IERhdGUoZGF0ZTIuZ2V0RnVsbFllYXIoKSwgZGF0ZTIuZ2V0TW9udGgoKSk7XHJcbiAgICBfZGF0ZTEuc2V0RnVsbFllYXIoZGF0ZTEuZ2V0RnVsbFllYXIoKSk7XHJcbiAgICBfZGF0ZTIuc2V0RnVsbFllYXIoZGF0ZTIuZ2V0RnVsbFllYXIoKSk7XHJcbiAgICByZXR1cm4gX2RhdGUxIC0gX2RhdGUyO1xyXG4gIH07XHJcblxyXG4gIHRoaXMuaGFuZGxlS2V5RG93biA9IGZ1bmN0aW9uKGtleSwgZXZ0KSB7XHJcbiAgICB2YXIgZGF0ZSA9IHRoaXMuYWN0aXZlRGF0ZS5nZXRNb250aCgpO1xyXG5cclxuICAgIGlmIChrZXkgPT09ICdsZWZ0Jykge1xyXG4gICAgICBkYXRlID0gZGF0ZSAtIDE7XHJcbiAgICB9IGVsc2UgaWYgKGtleSA9PT0gJ3VwJykge1xyXG4gICAgICBkYXRlID0gZGF0ZSAtIHRoaXMubW9udGhDb2x1bW5zO1xyXG4gICAgfSBlbHNlIGlmIChrZXkgPT09ICdyaWdodCcpIHtcclxuICAgICAgZGF0ZSA9IGRhdGUgKyAxO1xyXG4gICAgfSBlbHNlIGlmIChrZXkgPT09ICdkb3duJykge1xyXG4gICAgICBkYXRlID0gZGF0ZSArIHRoaXMubW9udGhDb2x1bW5zO1xyXG4gICAgfSBlbHNlIGlmIChrZXkgPT09ICdwYWdldXAnIHx8IGtleSA9PT0gJ3BhZ2Vkb3duJykge1xyXG4gICAgICB2YXIgeWVhciA9IHRoaXMuYWN0aXZlRGF0ZS5nZXRGdWxsWWVhcigpICsgKGtleSA9PT0gJ3BhZ2V1cCcgPyAtIDEgOiAxKTtcclxuICAgICAgdGhpcy5hY3RpdmVEYXRlLnNldEZ1bGxZZWFyKHllYXIpO1xyXG4gICAgfSBlbHNlIGlmIChrZXkgPT09ICdob21lJykge1xyXG4gICAgICBkYXRlID0gMDtcclxuICAgIH0gZWxzZSBpZiAoa2V5ID09PSAnZW5kJykge1xyXG4gICAgICBkYXRlID0gMTE7XHJcbiAgICB9XHJcbiAgICB0aGlzLmFjdGl2ZURhdGUuc2V0TW9udGgoZGF0ZSk7XHJcbiAgfTtcclxufV0pXHJcblxyXG4uY29udHJvbGxlcignVWliWWVhcnBpY2tlckNvbnRyb2xsZXInLCBbJyRzY29wZScsICckZWxlbWVudCcsICdkYXRlRmlsdGVyJywgZnVuY3Rpb24oc2NvcGUsICRlbGVtZW50LCBkYXRlRmlsdGVyKSB7XHJcbiAgdmFyIGNvbHVtbnMsIHJhbmdlO1xyXG4gIHRoaXMuZWxlbWVudCA9ICRlbGVtZW50O1xyXG5cclxuICBmdW5jdGlvbiBnZXRTdGFydGluZ1llYXIoeWVhcikge1xyXG4gICAgcmV0dXJuIHBhcnNlSW50KCh5ZWFyIC0gMSkgLyByYW5nZSwgMTApICogcmFuZ2UgKyAxO1xyXG4gIH1cclxuXHJcbiAgdGhpcy55ZWFycGlja2VySW5pdCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgY29sdW1ucyA9IHRoaXMueWVhckNvbHVtbnM7XHJcbiAgICByYW5nZSA9IHRoaXMueWVhclJvd3MgKiBjb2x1bW5zO1xyXG4gICAgdGhpcy5zdGVwID0geyB5ZWFyczogcmFuZ2UgfTtcclxuICB9O1xyXG5cclxuICB0aGlzLl9yZWZyZXNoVmlldyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIHllYXJzID0gbmV3IEFycmF5KHJhbmdlKSwgZGF0ZTtcclxuXHJcbiAgICBmb3IgKHZhciBpID0gMCwgc3RhcnQgPSBnZXRTdGFydGluZ1llYXIodGhpcy5hY3RpdmVEYXRlLmdldEZ1bGxZZWFyKCkpOyBpIDwgcmFuZ2U7IGkrKykge1xyXG4gICAgICBkYXRlID0gbmV3IERhdGUodGhpcy5hY3RpdmVEYXRlKTtcclxuICAgICAgZGF0ZS5zZXRGdWxsWWVhcihzdGFydCArIGksIDAsIDEpO1xyXG4gICAgICB5ZWFyc1tpXSA9IGFuZ3VsYXIuZXh0ZW5kKHRoaXMuY3JlYXRlRGF0ZU9iamVjdChkYXRlLCB0aGlzLmZvcm1hdFllYXIpLCB7XHJcbiAgICAgICAgdWlkOiBzY29wZS51bmlxdWVJZCArICctJyArIGlcclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgc2NvcGUudGl0bGUgPSBbeWVhcnNbMF0ubGFiZWwsIHllYXJzW3JhbmdlIC0gMV0ubGFiZWxdLmpvaW4oJyAtICcpO1xyXG4gICAgc2NvcGUucm93cyA9IHRoaXMuc3BsaXQoeWVhcnMsIGNvbHVtbnMpO1xyXG4gICAgc2NvcGUuY29sdW1ucyA9IGNvbHVtbnM7XHJcbiAgfTtcclxuXHJcbiAgdGhpcy5jb21wYXJlID0gZnVuY3Rpb24oZGF0ZTEsIGRhdGUyKSB7XHJcbiAgICByZXR1cm4gZGF0ZTEuZ2V0RnVsbFllYXIoKSAtIGRhdGUyLmdldEZ1bGxZZWFyKCk7XHJcbiAgfTtcclxuXHJcbiAgdGhpcy5oYW5kbGVLZXlEb3duID0gZnVuY3Rpb24oa2V5LCBldnQpIHtcclxuICAgIHZhciBkYXRlID0gdGhpcy5hY3RpdmVEYXRlLmdldEZ1bGxZZWFyKCk7XHJcblxyXG4gICAgaWYgKGtleSA9PT0gJ2xlZnQnKSB7XHJcbiAgICAgIGRhdGUgPSBkYXRlIC0gMTtcclxuICAgIH0gZWxzZSBpZiAoa2V5ID09PSAndXAnKSB7XHJcbiAgICAgIGRhdGUgPSBkYXRlIC0gY29sdW1ucztcclxuICAgIH0gZWxzZSBpZiAoa2V5ID09PSAncmlnaHQnKSB7XHJcbiAgICAgIGRhdGUgPSBkYXRlICsgMTtcclxuICAgIH0gZWxzZSBpZiAoa2V5ID09PSAnZG93bicpIHtcclxuICAgICAgZGF0ZSA9IGRhdGUgKyBjb2x1bW5zO1xyXG4gICAgfSBlbHNlIGlmIChrZXkgPT09ICdwYWdldXAnIHx8IGtleSA9PT0gJ3BhZ2Vkb3duJykge1xyXG4gICAgICBkYXRlICs9IChrZXkgPT09ICdwYWdldXAnID8gLSAxIDogMSkgKiByYW5nZTtcclxuICAgIH0gZWxzZSBpZiAoa2V5ID09PSAnaG9tZScpIHtcclxuICAgICAgZGF0ZSA9IGdldFN0YXJ0aW5nWWVhcih0aGlzLmFjdGl2ZURhdGUuZ2V0RnVsbFllYXIoKSk7XHJcbiAgICB9IGVsc2UgaWYgKGtleSA9PT0gJ2VuZCcpIHtcclxuICAgICAgZGF0ZSA9IGdldFN0YXJ0aW5nWWVhcih0aGlzLmFjdGl2ZURhdGUuZ2V0RnVsbFllYXIoKSkgKyByYW5nZSAtIDE7XHJcbiAgICB9XHJcbiAgICB0aGlzLmFjdGl2ZURhdGUuc2V0RnVsbFllYXIoZGF0ZSk7XHJcbiAgfTtcclxufV0pXHJcblxyXG4uZGlyZWN0aXZlKCd1aWJEYXRlcGlja2VyJywgZnVuY3Rpb24oKSB7XHJcbiAgcmV0dXJuIHtcclxuICAgIHRlbXBsYXRlVXJsOiBmdW5jdGlvbihlbGVtZW50LCBhdHRycykge1xyXG4gICAgICByZXR1cm4gYXR0cnMudGVtcGxhdGVVcmwgfHwgJ3VpYi90ZW1wbGF0ZS9kYXRlcGlja2VyL2RhdGVwaWNrZXIuaHRtbCc7XHJcbiAgICB9LFxyXG4gICAgc2NvcGU6IHtcclxuICAgICAgZGF0ZXBpY2tlck9wdGlvbnM6ICc9PydcclxuICAgIH0sXHJcbiAgICByZXF1aXJlOiBbJ3VpYkRhdGVwaWNrZXInLCAnXm5nTW9kZWwnXSxcclxuICAgIHJlc3RyaWN0OiAnQScsXHJcbiAgICBjb250cm9sbGVyOiAnVWliRGF0ZXBpY2tlckNvbnRyb2xsZXInLFxyXG4gICAgY29udHJvbGxlckFzOiAnZGF0ZXBpY2tlcicsXHJcbiAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxlbWVudCwgYXR0cnMsIGN0cmxzKSB7XHJcbiAgICAgIHZhciBkYXRlcGlja2VyQ3RybCA9IGN0cmxzWzBdLCBuZ01vZGVsQ3RybCA9IGN0cmxzWzFdO1xyXG5cclxuICAgICAgZGF0ZXBpY2tlckN0cmwuaW5pdChuZ01vZGVsQ3RybCk7XHJcbiAgICB9XHJcbiAgfTtcclxufSlcclxuXHJcbi5kaXJlY3RpdmUoJ3VpYkRheXBpY2tlcicsIGZ1bmN0aW9uKCkge1xyXG4gIHJldHVybiB7XHJcbiAgICB0ZW1wbGF0ZVVybDogZnVuY3Rpb24oZWxlbWVudCwgYXR0cnMpIHtcclxuICAgICAgcmV0dXJuIGF0dHJzLnRlbXBsYXRlVXJsIHx8ICd1aWIvdGVtcGxhdGUvZGF0ZXBpY2tlci9kYXkuaHRtbCc7XHJcbiAgICB9LFxyXG4gICAgcmVxdWlyZTogWydedWliRGF0ZXBpY2tlcicsICd1aWJEYXlwaWNrZXInXSxcclxuICAgIHJlc3RyaWN0OiAnQScsXHJcbiAgICBjb250cm9sbGVyOiAnVWliRGF5cGlja2VyQ29udHJvbGxlcicsXHJcbiAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxlbWVudCwgYXR0cnMsIGN0cmxzKSB7XHJcbiAgICAgIHZhciBkYXRlcGlja2VyQ3RybCA9IGN0cmxzWzBdLFxyXG4gICAgICAgIGRheXBpY2tlckN0cmwgPSBjdHJsc1sxXTtcclxuXHJcbiAgICAgIGRheXBpY2tlckN0cmwuaW5pdChkYXRlcGlja2VyQ3RybCk7XHJcbiAgICB9XHJcbiAgfTtcclxufSlcclxuXHJcbi5kaXJlY3RpdmUoJ3VpYk1vbnRocGlja2VyJywgZnVuY3Rpb24oKSB7XHJcbiAgcmV0dXJuIHtcclxuICAgIHRlbXBsYXRlVXJsOiBmdW5jdGlvbihlbGVtZW50LCBhdHRycykge1xyXG4gICAgICByZXR1cm4gYXR0cnMudGVtcGxhdGVVcmwgfHwgJ3VpYi90ZW1wbGF0ZS9kYXRlcGlja2VyL21vbnRoLmh0bWwnO1xyXG4gICAgfSxcclxuICAgIHJlcXVpcmU6IFsnXnVpYkRhdGVwaWNrZXInLCAndWliTW9udGhwaWNrZXInXSxcclxuICAgIHJlc3RyaWN0OiAnQScsXHJcbiAgICBjb250cm9sbGVyOiAnVWliTW9udGhwaWNrZXJDb250cm9sbGVyJyxcclxuICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBlbGVtZW50LCBhdHRycywgY3RybHMpIHtcclxuICAgICAgdmFyIGRhdGVwaWNrZXJDdHJsID0gY3RybHNbMF0sXHJcbiAgICAgICAgbW9udGhwaWNrZXJDdHJsID0gY3RybHNbMV07XHJcblxyXG4gICAgICBtb250aHBpY2tlckN0cmwuaW5pdChkYXRlcGlja2VyQ3RybCk7XHJcbiAgICB9XHJcbiAgfTtcclxufSlcclxuXHJcbi5kaXJlY3RpdmUoJ3VpYlllYXJwaWNrZXInLCBmdW5jdGlvbigpIHtcclxuICByZXR1cm4ge1xyXG4gICAgdGVtcGxhdGVVcmw6IGZ1bmN0aW9uKGVsZW1lbnQsIGF0dHJzKSB7XHJcbiAgICAgIHJldHVybiBhdHRycy50ZW1wbGF0ZVVybCB8fCAndWliL3RlbXBsYXRlL2RhdGVwaWNrZXIveWVhci5odG1sJztcclxuICAgIH0sXHJcbiAgICByZXF1aXJlOiBbJ151aWJEYXRlcGlja2VyJywgJ3VpYlllYXJwaWNrZXInXSxcclxuICAgIHJlc3RyaWN0OiAnQScsXHJcbiAgICBjb250cm9sbGVyOiAnVWliWWVhcnBpY2tlckNvbnRyb2xsZXInLFxyXG4gICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCBjdHJscykge1xyXG4gICAgICB2YXIgY3RybCA9IGN0cmxzWzBdO1xyXG4gICAgICBhbmd1bGFyLmV4dGVuZChjdHJsLCBjdHJsc1sxXSk7XHJcbiAgICAgIGN0cmwueWVhcnBpY2tlckluaXQoKTtcclxuXHJcbiAgICAgIGN0cmwucmVmcmVzaFZpZXcoKTtcclxuICAgIH1cclxuICB9O1xyXG59KTtcclxuXHJcbmFuZ3VsYXIubW9kdWxlKCd1aS5ib290c3RyYXAucG9zaXRpb24nLCBbXSlcclxuXHJcbi8qKlxyXG4gKiBBIHNldCBvZiB1dGlsaXR5IG1ldGhvZHMgZm9yIHdvcmtpbmcgd2l0aCB0aGUgRE9NLlxyXG4gKiBJdCBpcyBtZWFudCB0byBiZSB1c2VkIHdoZXJlIHdlIG5lZWQgdG8gYWJzb2x1dGUtcG9zaXRpb24gZWxlbWVudHMgaW5cclxuICogcmVsYXRpb24gdG8gYW5vdGhlciBlbGVtZW50ICh0aGlzIGlzIHRoZSBjYXNlIGZvciB0b29sdGlwcywgcG9wb3ZlcnMsXHJcbiAqIHR5cGVhaGVhZCBzdWdnZXN0aW9ucyBldGMuKS5cclxuICovXHJcbiAgLmZhY3RvcnkoJyR1aWJQb3NpdGlvbicsIFsnJGRvY3VtZW50JywgJyR3aW5kb3cnLCBmdW5jdGlvbigkZG9jdW1lbnQsICR3aW5kb3cpIHtcclxuICAgIC8qKlxyXG4gICAgICogVXNlZCBieSBzY3JvbGxiYXJXaWR0aCgpIGZ1bmN0aW9uIHRvIGNhY2hlIHNjcm9sbGJhcidzIHdpZHRoLlxyXG4gICAgICogRG8gbm90IGFjY2VzcyB0aGlzIHZhcmlhYmxlIGRpcmVjdGx5LCB1c2Ugc2Nyb2xsYmFyV2lkdGgoKSBpbnN0ZWFkLlxyXG4gICAgICovXHJcbiAgICB2YXIgU0NST0xMQkFSX1dJRFRIO1xyXG4gICAgLyoqXHJcbiAgICAgKiBzY3JvbGxiYXIgb24gYm9keSBhbmQgaHRtbCBlbGVtZW50IGluIElFIGFuZCBFZGdlIG92ZXJsYXlcclxuICAgICAqIGNvbnRlbnQgYW5kIHNob3VsZCBiZSBjb25zaWRlcmVkIDAgd2lkdGguXHJcbiAgICAgKi9cclxuICAgIHZhciBCT0RZX1NDUk9MTEJBUl9XSURUSDtcclxuICAgIHZhciBPVkVSRkxPV19SRUdFWCA9IHtcclxuICAgICAgbm9ybWFsOiAvKGF1dG98c2Nyb2xsKS8sXHJcbiAgICAgIGhpZGRlbjogLyhhdXRvfHNjcm9sbHxoaWRkZW4pL1xyXG4gICAgfTtcclxuICAgIHZhciBQTEFDRU1FTlRfUkVHRVggPSB7XHJcbiAgICAgIGF1dG86IC9cXHM/YXV0bz9cXHM/L2ksXHJcbiAgICAgIHByaW1hcnk6IC9eKHRvcHxib3R0b218bGVmdHxyaWdodCkkLyxcclxuICAgICAgc2Vjb25kYXJ5OiAvXih0b3B8Ym90dG9tfGxlZnR8cmlnaHR8Y2VudGVyKSQvLFxyXG4gICAgICB2ZXJ0aWNhbDogL14odG9wfGJvdHRvbSkkL1xyXG4gICAgfTtcclxuICAgIHZhciBCT0RZX1JFR0VYID0gLyhIVE1MfEJPRFkpLztcclxuXHJcbiAgICByZXR1cm4ge1xyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIFByb3ZpZGVzIGEgcmF3IERPTSBlbGVtZW50IGZyb20gYSBqUXVlcnkvalFMaXRlIGVsZW1lbnQuXHJcbiAgICAgICAqXHJcbiAgICAgICAqIEBwYXJhbSB7ZWxlbWVudH0gZWxlbSAtIFRoZSBlbGVtZW50IHRvIGNvbnZlcnQuXHJcbiAgICAgICAqXHJcbiAgICAgICAqIEByZXR1cm5zIHtlbGVtZW50fSBBIEhUTUwgZWxlbWVudC5cclxuICAgICAgICovXHJcbiAgICAgIGdldFJhd05vZGU6IGZ1bmN0aW9uKGVsZW0pIHtcclxuICAgICAgICByZXR1cm4gZWxlbS5ub2RlTmFtZSA/IGVsZW0gOiBlbGVtWzBdIHx8IGVsZW07XHJcbiAgICAgIH0sXHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogUHJvdmlkZXMgYSBwYXJzZWQgbnVtYmVyIGZvciBhIHN0eWxlIHByb3BlcnR5LiAgU3RyaXBzXHJcbiAgICAgICAqIHVuaXRzIGFuZCBjYXN0cyBpbnZhbGlkIG51bWJlcnMgdG8gMC5cclxuICAgICAgICpcclxuICAgICAgICogQHBhcmFtIHtzdHJpbmd9IHZhbHVlIC0gVGhlIHN0eWxlIHZhbHVlIHRvIHBhcnNlLlxyXG4gICAgICAgKlxyXG4gICAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBBIHZhbGlkIG51bWJlci5cclxuICAgICAgICovXHJcbiAgICAgIHBhcnNlU3R5bGU6IGZ1bmN0aW9uKHZhbHVlKSB7XHJcbiAgICAgICAgdmFsdWUgPSBwYXJzZUZsb2F0KHZhbHVlKTtcclxuICAgICAgICByZXR1cm4gaXNGaW5pdGUodmFsdWUpID8gdmFsdWUgOiAwO1xyXG4gICAgICB9LFxyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIFByb3ZpZGVzIHRoZSBjbG9zZXN0IHBvc2l0aW9uZWQgYW5jZXN0b3IuXHJcbiAgICAgICAqXHJcbiAgICAgICAqIEBwYXJhbSB7ZWxlbWVudH0gZWxlbWVudCAtIFRoZSBlbGVtZW50IHRvIGdldCB0aGUgb2ZmZXN0IHBhcmVudCBmb3IuXHJcbiAgICAgICAqXHJcbiAgICAgICAqIEByZXR1cm5zIHtlbGVtZW50fSBUaGUgY2xvc2VzdCBwb3NpdGlvbmVkIGFuY2VzdG9yLlxyXG4gICAgICAgKi9cclxuICAgICAgb2Zmc2V0UGFyZW50OiBmdW5jdGlvbihlbGVtKSB7XHJcbiAgICAgICAgZWxlbSA9IHRoaXMuZ2V0UmF3Tm9kZShlbGVtKTtcclxuXHJcbiAgICAgICAgdmFyIG9mZnNldFBhcmVudCA9IGVsZW0ub2Zmc2V0UGFyZW50IHx8ICRkb2N1bWVudFswXS5kb2N1bWVudEVsZW1lbnQ7XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGlzU3RhdGljUG9zaXRpb25lZChlbCkge1xyXG4gICAgICAgICAgcmV0dXJuICgkd2luZG93LmdldENvbXB1dGVkU3R5bGUoZWwpLnBvc2l0aW9uIHx8ICdzdGF0aWMnKSA9PT0gJ3N0YXRpYyc7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB3aGlsZSAob2Zmc2V0UGFyZW50ICYmIG9mZnNldFBhcmVudCAhPT0gJGRvY3VtZW50WzBdLmRvY3VtZW50RWxlbWVudCAmJiBpc1N0YXRpY1Bvc2l0aW9uZWQob2Zmc2V0UGFyZW50KSkge1xyXG4gICAgICAgICAgb2Zmc2V0UGFyZW50ID0gb2Zmc2V0UGFyZW50Lm9mZnNldFBhcmVudDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBvZmZzZXRQYXJlbnQgfHwgJGRvY3VtZW50WzBdLmRvY3VtZW50RWxlbWVudDtcclxuICAgICAgfSxcclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBQcm92aWRlcyB0aGUgc2Nyb2xsYmFyIHdpZHRoLCBjb25jZXB0IGZyb20gVFdCUyBtZWFzdXJlU2Nyb2xsYmFyKClcclxuICAgICAgICogZnVuY3Rpb24gaW4gaHR0cHM6Ly9naXRodWIuY29tL3R3YnMvYm9vdHN0cmFwL2Jsb2IvbWFzdGVyL2pzL21vZGFsLmpzXHJcbiAgICAgICAqIEluIElFIGFuZCBFZGdlLCBzY29sbGJhciBvbiBib2R5IGFuZCBodG1sIGVsZW1lbnQgb3ZlcmxheSBhbmQgc2hvdWxkXHJcbiAgICAgICAqIHJldHVybiBhIHdpZHRoIG9mIDAuXHJcbiAgICAgICAqXHJcbiAgICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IFRoZSB3aWR0aCBvZiB0aGUgYnJvd3NlciBzY29sbGJhci5cclxuICAgICAgICovXHJcbiAgICAgIHNjcm9sbGJhcldpZHRoOiBmdW5jdGlvbihpc0JvZHkpIHtcclxuICAgICAgICBpZiAoaXNCb2R5KSB7XHJcbiAgICAgICAgICBpZiAoYW5ndWxhci5pc1VuZGVmaW5lZChCT0RZX1NDUk9MTEJBUl9XSURUSCkpIHtcclxuICAgICAgICAgICAgdmFyIGJvZHlFbGVtID0gJGRvY3VtZW50LmZpbmQoJ2JvZHknKTtcclxuICAgICAgICAgICAgYm9keUVsZW0uYWRkQ2xhc3MoJ3VpYi1wb3NpdGlvbi1ib2R5LXNjcm9sbGJhci1tZWFzdXJlJyk7XHJcbiAgICAgICAgICAgIEJPRFlfU0NST0xMQkFSX1dJRFRIID0gJHdpbmRvdy5pbm5lcldpZHRoIC0gYm9keUVsZW1bMF0uY2xpZW50V2lkdGg7XHJcbiAgICAgICAgICAgIEJPRFlfU0NST0xMQkFSX1dJRFRIID0gaXNGaW5pdGUoQk9EWV9TQ1JPTExCQVJfV0lEVEgpID8gQk9EWV9TQ1JPTExCQVJfV0lEVEggOiAwO1xyXG4gICAgICAgICAgICBib2R5RWxlbS5yZW1vdmVDbGFzcygndWliLXBvc2l0aW9uLWJvZHktc2Nyb2xsYmFyLW1lYXN1cmUnKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHJldHVybiBCT0RZX1NDUk9MTEJBUl9XSURUSDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChhbmd1bGFyLmlzVW5kZWZpbmVkKFNDUk9MTEJBUl9XSURUSCkpIHtcclxuICAgICAgICAgIHZhciBzY3JvbGxFbGVtID0gYW5ndWxhci5lbGVtZW50KCc8ZGl2IGNsYXNzPVwidWliLXBvc2l0aW9uLXNjcm9sbGJhci1tZWFzdXJlXCI+PC9kaXY+Jyk7XHJcbiAgICAgICAgICAkZG9jdW1lbnQuZmluZCgnYm9keScpLmFwcGVuZChzY3JvbGxFbGVtKTtcclxuICAgICAgICAgIFNDUk9MTEJBUl9XSURUSCA9IHNjcm9sbEVsZW1bMF0ub2Zmc2V0V2lkdGggLSBzY3JvbGxFbGVtWzBdLmNsaWVudFdpZHRoO1xyXG4gICAgICAgICAgU0NST0xMQkFSX1dJRFRIID0gaXNGaW5pdGUoU0NST0xMQkFSX1dJRFRIKSA/IFNDUk9MTEJBUl9XSURUSCA6IDA7XHJcbiAgICAgICAgICBzY3JvbGxFbGVtLnJlbW92ZSgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIFNDUk9MTEJBUl9XSURUSDtcclxuICAgICAgfSxcclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBQcm92aWRlcyB0aGUgcGFkZGluZyByZXF1aXJlZCBvbiBhbiBlbGVtZW50IHRvIHJlcGxhY2UgdGhlIHNjcm9sbGJhci5cclxuICAgICAgICpcclxuICAgICAgICogQHJldHVybnMge29iamVjdH0gQW4gb2JqZWN0IHdpdGggdGhlIGZvbGxvd2luZyBwcm9wZXJ0aWVzOlxyXG4gICAgICAgKiAgIDx1bD5cclxuICAgICAgICogICAgIDxsaT4qKnNjcm9sbGJhcldpZHRoKio6IHRoZSB3aWR0aCBvZiB0aGUgc2Nyb2xsYmFyPC9saT5cclxuICAgICAgICogICAgIDxsaT4qKndpZHRoT3ZlcmZsb3cqKjogd2hldGhlciB0aGUgdGhlIHdpZHRoIGlzIG92ZXJmbG93aW5nPC9saT5cclxuICAgICAgICogICAgIDxsaT4qKnJpZ2h0Kio6IHRoZSBhbW91bnQgb2YgcmlnaHQgcGFkZGluZyBvbiB0aGUgZWxlbWVudCBuZWVkZWQgdG8gcmVwbGFjZSB0aGUgc2Nyb2xsYmFyPC9saT5cclxuICAgICAgICogICAgIDxsaT4qKnJpZ2h0T3JpZ2luYWwqKjogdGhlIGFtb3VudCBvZiByaWdodCBwYWRkaW5nIGN1cnJlbnRseSBvbiB0aGUgZWxlbWVudDwvbGk+XHJcbiAgICAgICAqICAgICA8bGk+KipoZWlnaHRPdmVyZmxvdyoqOiB3aGV0aGVyIHRoZSB0aGUgaGVpZ2h0IGlzIG92ZXJmbG93aW5nPC9saT5cclxuICAgICAgICogICAgIDxsaT4qKmJvdHRvbSoqOiB0aGUgYW1vdW50IG9mIGJvdHRvbSBwYWRkaW5nIG9uIHRoZSBlbGVtZW50IG5lZWRlZCB0byByZXBsYWNlIHRoZSBzY3JvbGxiYXI8L2xpPlxyXG4gICAgICAgKiAgICAgPGxpPioqYm90dG9tT3JpZ2luYWwqKjogdGhlIGFtb3VudCBvZiBib3R0b20gcGFkZGluZyBjdXJyZW50bHkgb24gdGhlIGVsZW1lbnQ8L2xpPlxyXG4gICAgICAgKiAgIDwvdWw+XHJcbiAgICAgICAqL1xyXG4gICAgICBzY3JvbGxiYXJQYWRkaW5nOiBmdW5jdGlvbihlbGVtKSB7XHJcbiAgICAgICAgZWxlbSA9IHRoaXMuZ2V0UmF3Tm9kZShlbGVtKTtcclxuXHJcbiAgICAgICAgdmFyIGVsZW1TdHlsZSA9ICR3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShlbGVtKTtcclxuICAgICAgICB2YXIgcGFkZGluZ1JpZ2h0ID0gdGhpcy5wYXJzZVN0eWxlKGVsZW1TdHlsZS5wYWRkaW5nUmlnaHQpO1xyXG4gICAgICAgIHZhciBwYWRkaW5nQm90dG9tID0gdGhpcy5wYXJzZVN0eWxlKGVsZW1TdHlsZS5wYWRkaW5nQm90dG9tKTtcclxuICAgICAgICB2YXIgc2Nyb2xsUGFyZW50ID0gdGhpcy5zY3JvbGxQYXJlbnQoZWxlbSwgZmFsc2UsIHRydWUpO1xyXG4gICAgICAgIHZhciBzY3JvbGxiYXJXaWR0aCA9IHRoaXMuc2Nyb2xsYmFyV2lkdGgoc2Nyb2xsUGFyZW50LCBCT0RZX1JFR0VYLnRlc3Qoc2Nyb2xsUGFyZW50LnRhZ05hbWUpKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHNjcm9sbGJhcldpZHRoOiBzY3JvbGxiYXJXaWR0aCxcclxuICAgICAgICAgIHdpZHRoT3ZlcmZsb3c6IHNjcm9sbFBhcmVudC5zY3JvbGxXaWR0aCA+IHNjcm9sbFBhcmVudC5jbGllbnRXaWR0aCxcclxuICAgICAgICAgIHJpZ2h0OiBwYWRkaW5nUmlnaHQgKyBzY3JvbGxiYXJXaWR0aCxcclxuICAgICAgICAgIG9yaWdpbmFsUmlnaHQ6IHBhZGRpbmdSaWdodCxcclxuICAgICAgICAgIGhlaWdodE92ZXJmbG93OiBzY3JvbGxQYXJlbnQuc2Nyb2xsSGVpZ2h0ID4gc2Nyb2xsUGFyZW50LmNsaWVudEhlaWdodCxcclxuICAgICAgICAgIGJvdHRvbTogcGFkZGluZ0JvdHRvbSArIHNjcm9sbGJhcldpZHRoLFxyXG4gICAgICAgICAgb3JpZ2luYWxCb3R0b206IHBhZGRpbmdCb3R0b21cclxuICAgICAgICAgfTtcclxuICAgICAgfSxcclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBDaGVja3MgdG8gc2VlIGlmIHRoZSBlbGVtZW50IGlzIHNjcm9sbGFibGUuXHJcbiAgICAgICAqXHJcbiAgICAgICAqIEBwYXJhbSB7ZWxlbWVudH0gZWxlbSAtIFRoZSBlbGVtZW50IHRvIGNoZWNrLlxyXG4gICAgICAgKiBAcGFyYW0ge2Jvb2xlYW49fSBbaW5jbHVkZUhpZGRlbj1mYWxzZV0gLSBTaG91bGQgc2Nyb2xsIHN0eWxlIG9mICdoaWRkZW4nIGJlIGNvbnNpZGVyZWQsXHJcbiAgICAgICAqICAgZGVmYXVsdCBpcyBmYWxzZS5cclxuICAgICAgICpcclxuICAgICAgICogQHJldHVybnMge2Jvb2xlYW59IFdoZXRoZXIgdGhlIGVsZW1lbnQgaXMgc2Nyb2xsYWJsZS5cclxuICAgICAgICovXHJcbiAgICAgIGlzU2Nyb2xsYWJsZTogZnVuY3Rpb24oZWxlbSwgaW5jbHVkZUhpZGRlbikge1xyXG4gICAgICAgIGVsZW0gPSB0aGlzLmdldFJhd05vZGUoZWxlbSk7XHJcblxyXG4gICAgICAgIHZhciBvdmVyZmxvd1JlZ2V4ID0gaW5jbHVkZUhpZGRlbiA/IE9WRVJGTE9XX1JFR0VYLmhpZGRlbiA6IE9WRVJGTE9XX1JFR0VYLm5vcm1hbDtcclxuICAgICAgICB2YXIgZWxlbVN0eWxlID0gJHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKGVsZW0pO1xyXG4gICAgICAgIHJldHVybiBvdmVyZmxvd1JlZ2V4LnRlc3QoZWxlbVN0eWxlLm92ZXJmbG93ICsgZWxlbVN0eWxlLm92ZXJmbG93WSArIGVsZW1TdHlsZS5vdmVyZmxvd1gpO1xyXG4gICAgICB9LFxyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIFByb3ZpZGVzIHRoZSBjbG9zZXN0IHNjcm9sbGFibGUgYW5jZXN0b3IuXHJcbiAgICAgICAqIEEgcG9ydCBvZiB0aGUgalF1ZXJ5IFVJIHNjcm9sbFBhcmVudCBtZXRob2Q6XHJcbiAgICAgICAqIGh0dHBzOi8vZ2l0aHViLmNvbS9qcXVlcnkvanF1ZXJ5LXVpL2Jsb2IvbWFzdGVyL3VpL3Njcm9sbC1wYXJlbnQuanNcclxuICAgICAgICpcclxuICAgICAgICogQHBhcmFtIHtlbGVtZW50fSBlbGVtIC0gVGhlIGVsZW1lbnQgdG8gZmluZCB0aGUgc2Nyb2xsIHBhcmVudCBvZi5cclxuICAgICAgICogQHBhcmFtIHtib29sZWFuPX0gW2luY2x1ZGVIaWRkZW49ZmFsc2VdIC0gU2hvdWxkIHNjcm9sbCBzdHlsZSBvZiAnaGlkZGVuJyBiZSBjb25zaWRlcmVkLFxyXG4gICAgICAgKiAgIGRlZmF1bHQgaXMgZmFsc2UuXHJcbiAgICAgICAqIEBwYXJhbSB7Ym9vbGVhbj19IFtpbmNsdWRlU2VsZj1mYWxzZV0gLSBTaG91bGQgdGhlIGVsZW1lbnQgYmVpbmcgcGFzc2VkIGJlXHJcbiAgICAgICAqIGluY2x1ZGVkIGluIHRoZSBzY3JvbGxhYmxlIGxsb2t1cC5cclxuICAgICAgICpcclxuICAgICAgICogQHJldHVybnMge2VsZW1lbnR9IEEgSFRNTCBlbGVtZW50LlxyXG4gICAgICAgKi9cclxuICAgICAgc2Nyb2xsUGFyZW50OiBmdW5jdGlvbihlbGVtLCBpbmNsdWRlSGlkZGVuLCBpbmNsdWRlU2VsZikge1xyXG4gICAgICAgIGVsZW0gPSB0aGlzLmdldFJhd05vZGUoZWxlbSk7XHJcblxyXG4gICAgICAgIHZhciBvdmVyZmxvd1JlZ2V4ID0gaW5jbHVkZUhpZGRlbiA/IE9WRVJGTE9XX1JFR0VYLmhpZGRlbiA6IE9WRVJGTE9XX1JFR0VYLm5vcm1hbDtcclxuICAgICAgICB2YXIgZG9jdW1lbnRFbCA9ICRkb2N1bWVudFswXS5kb2N1bWVudEVsZW1lbnQ7XHJcbiAgICAgICAgdmFyIGVsZW1TdHlsZSA9ICR3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShlbGVtKTtcclxuICAgICAgICBpZiAoaW5jbHVkZVNlbGYgJiYgb3ZlcmZsb3dSZWdleC50ZXN0KGVsZW1TdHlsZS5vdmVyZmxvdyArIGVsZW1TdHlsZS5vdmVyZmxvd1kgKyBlbGVtU3R5bGUub3ZlcmZsb3dYKSkge1xyXG4gICAgICAgICAgcmV0dXJuIGVsZW07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciBleGNsdWRlU3RhdGljID0gZWxlbVN0eWxlLnBvc2l0aW9uID09PSAnYWJzb2x1dGUnO1xyXG4gICAgICAgIHZhciBzY3JvbGxQYXJlbnQgPSBlbGVtLnBhcmVudEVsZW1lbnQgfHwgZG9jdW1lbnRFbDtcclxuXHJcbiAgICAgICAgaWYgKHNjcm9sbFBhcmVudCA9PT0gZG9jdW1lbnRFbCB8fCBlbGVtU3R5bGUucG9zaXRpb24gPT09ICdmaXhlZCcpIHtcclxuICAgICAgICAgIHJldHVybiBkb2N1bWVudEVsO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgd2hpbGUgKHNjcm9sbFBhcmVudC5wYXJlbnRFbGVtZW50ICYmIHNjcm9sbFBhcmVudCAhPT0gZG9jdW1lbnRFbCkge1xyXG4gICAgICAgICAgdmFyIHNwU3R5bGUgPSAkd2luZG93LmdldENvbXB1dGVkU3R5bGUoc2Nyb2xsUGFyZW50KTtcclxuICAgICAgICAgIGlmIChleGNsdWRlU3RhdGljICYmIHNwU3R5bGUucG9zaXRpb24gIT09ICdzdGF0aWMnKSB7XHJcbiAgICAgICAgICAgIGV4Y2x1ZGVTdGF0aWMgPSBmYWxzZTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBpZiAoIWV4Y2x1ZGVTdGF0aWMgJiYgb3ZlcmZsb3dSZWdleC50ZXN0KHNwU3R5bGUub3ZlcmZsb3cgKyBzcFN0eWxlLm92ZXJmbG93WSArIHNwU3R5bGUub3ZlcmZsb3dYKSkge1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHNjcm9sbFBhcmVudCA9IHNjcm9sbFBhcmVudC5wYXJlbnRFbGVtZW50O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHNjcm9sbFBhcmVudDtcclxuICAgICAgfSxcclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBQcm92aWRlcyByZWFkLW9ubHkgZXF1aXZhbGVudCBvZiBqUXVlcnkncyBwb3NpdGlvbiBmdW5jdGlvbjpcclxuICAgICAgICogaHR0cDovL2FwaS5qcXVlcnkuY29tL3Bvc2l0aW9uLyAtIGRpc3RhbmNlIHRvIGNsb3Nlc3QgcG9zaXRpb25lZFxyXG4gICAgICAgKiBhbmNlc3Rvci4gIERvZXMgbm90IGFjY291bnQgZm9yIG1hcmdpbnMgYnkgZGVmYXVsdCBsaWtlIGpRdWVyeSBwb3NpdGlvbi5cclxuICAgICAgICpcclxuICAgICAgICogQHBhcmFtIHtlbGVtZW50fSBlbGVtIC0gVGhlIGVsZW1lbnQgdG8gY2FjbHVsYXRlIHRoZSBwb3NpdGlvbiBvbi5cclxuICAgICAgICogQHBhcmFtIHtib29sZWFuPX0gW2luY2x1ZGVNYXJnaW5zPWZhbHNlXSAtIFNob3VsZCBtYXJnaW5zIGJlIGFjY291bnRlZFxyXG4gICAgICAgKiBmb3IsIGRlZmF1bHQgaXMgZmFsc2UuXHJcbiAgICAgICAqXHJcbiAgICAgICAqIEByZXR1cm5zIHtvYmplY3R9IEFuIG9iamVjdCB3aXRoIHRoZSBmb2xsb3dpbmcgcHJvcGVydGllczpcclxuICAgICAgICogICA8dWw+XHJcbiAgICAgICAqICAgICA8bGk+Kip3aWR0aCoqOiB0aGUgd2lkdGggb2YgdGhlIGVsZW1lbnQ8L2xpPlxyXG4gICAgICAgKiAgICAgPGxpPioqaGVpZ2h0Kio6IHRoZSBoZWlnaHQgb2YgdGhlIGVsZW1lbnQ8L2xpPlxyXG4gICAgICAgKiAgICAgPGxpPioqdG9wKio6IGRpc3RhbmNlIHRvIHRvcCBlZGdlIG9mIG9mZnNldCBwYXJlbnQ8L2xpPlxyXG4gICAgICAgKiAgICAgPGxpPioqbGVmdCoqOiBkaXN0YW5jZSB0byBsZWZ0IGVkZ2Ugb2Ygb2Zmc2V0IHBhcmVudDwvbGk+XHJcbiAgICAgICAqICAgPC91bD5cclxuICAgICAgICovXHJcbiAgICAgIHBvc2l0aW9uOiBmdW5jdGlvbihlbGVtLCBpbmNsdWRlTWFnaW5zKSB7XHJcbiAgICAgICAgZWxlbSA9IHRoaXMuZ2V0UmF3Tm9kZShlbGVtKTtcclxuXHJcbiAgICAgICAgdmFyIGVsZW1PZmZzZXQgPSB0aGlzLm9mZnNldChlbGVtKTtcclxuICAgICAgICBpZiAoaW5jbHVkZU1hZ2lucykge1xyXG4gICAgICAgICAgdmFyIGVsZW1TdHlsZSA9ICR3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShlbGVtKTtcclxuICAgICAgICAgIGVsZW1PZmZzZXQudG9wIC09IHRoaXMucGFyc2VTdHlsZShlbGVtU3R5bGUubWFyZ2luVG9wKTtcclxuICAgICAgICAgIGVsZW1PZmZzZXQubGVmdCAtPSB0aGlzLnBhcnNlU3R5bGUoZWxlbVN0eWxlLm1hcmdpbkxlZnQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgcGFyZW50ID0gdGhpcy5vZmZzZXRQYXJlbnQoZWxlbSk7XHJcbiAgICAgICAgdmFyIHBhcmVudE9mZnNldCA9IHt0b3A6IDAsIGxlZnQ6IDB9O1xyXG5cclxuICAgICAgICBpZiAocGFyZW50ICE9PSAkZG9jdW1lbnRbMF0uZG9jdW1lbnRFbGVtZW50KSB7XHJcbiAgICAgICAgICBwYXJlbnRPZmZzZXQgPSB0aGlzLm9mZnNldChwYXJlbnQpO1xyXG4gICAgICAgICAgcGFyZW50T2Zmc2V0LnRvcCArPSBwYXJlbnQuY2xpZW50VG9wIC0gcGFyZW50LnNjcm9sbFRvcDtcclxuICAgICAgICAgIHBhcmVudE9mZnNldC5sZWZ0ICs9IHBhcmVudC5jbGllbnRMZWZ0IC0gcGFyZW50LnNjcm9sbExlZnQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgd2lkdGg6IE1hdGgucm91bmQoYW5ndWxhci5pc051bWJlcihlbGVtT2Zmc2V0LndpZHRoKSA/IGVsZW1PZmZzZXQud2lkdGggOiBlbGVtLm9mZnNldFdpZHRoKSxcclxuICAgICAgICAgIGhlaWdodDogTWF0aC5yb3VuZChhbmd1bGFyLmlzTnVtYmVyKGVsZW1PZmZzZXQuaGVpZ2h0KSA/IGVsZW1PZmZzZXQuaGVpZ2h0IDogZWxlbS5vZmZzZXRIZWlnaHQpLFxyXG4gICAgICAgICAgdG9wOiBNYXRoLnJvdW5kKGVsZW1PZmZzZXQudG9wIC0gcGFyZW50T2Zmc2V0LnRvcCksXHJcbiAgICAgICAgICBsZWZ0OiBNYXRoLnJvdW5kKGVsZW1PZmZzZXQubGVmdCAtIHBhcmVudE9mZnNldC5sZWZ0KVxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogUHJvdmlkZXMgcmVhZC1vbmx5IGVxdWl2YWxlbnQgb2YgalF1ZXJ5J3Mgb2Zmc2V0IGZ1bmN0aW9uOlxyXG4gICAgICAgKiBodHRwOi8vYXBpLmpxdWVyeS5jb20vb2Zmc2V0LyAtIGRpc3RhbmNlIHRvIHZpZXdwb3J0LiAgRG9lc1xyXG4gICAgICAgKiBub3QgYWNjb3VudCBmb3IgYm9yZGVycywgbWFyZ2lucywgb3IgcGFkZGluZyBvbiB0aGUgYm9keVxyXG4gICAgICAgKiBlbGVtZW50LlxyXG4gICAgICAgKlxyXG4gICAgICAgKiBAcGFyYW0ge2VsZW1lbnR9IGVsZW0gLSBUaGUgZWxlbWVudCB0byBjYWxjdWxhdGUgdGhlIG9mZnNldCBvbi5cclxuICAgICAgICpcclxuICAgICAgICogQHJldHVybnMge29iamVjdH0gQW4gb2JqZWN0IHdpdGggdGhlIGZvbGxvd2luZyBwcm9wZXJ0aWVzOlxyXG4gICAgICAgKiAgIDx1bD5cclxuICAgICAgICogICAgIDxsaT4qKndpZHRoKio6IHRoZSB3aWR0aCBvZiB0aGUgZWxlbWVudDwvbGk+XHJcbiAgICAgICAqICAgICA8bGk+KipoZWlnaHQqKjogdGhlIGhlaWdodCBvZiB0aGUgZWxlbWVudDwvbGk+XHJcbiAgICAgICAqICAgICA8bGk+Kip0b3AqKjogZGlzdGFuY2UgdG8gdG9wIGVkZ2Ugb2Ygdmlld3BvcnQ8L2xpPlxyXG4gICAgICAgKiAgICAgPGxpPioqcmlnaHQqKjogZGlzdGFuY2UgdG8gYm90dG9tIGVkZ2Ugb2Ygdmlld3BvcnQ8L2xpPlxyXG4gICAgICAgKiAgIDwvdWw+XHJcbiAgICAgICAqL1xyXG4gICAgICBvZmZzZXQ6IGZ1bmN0aW9uKGVsZW0pIHtcclxuICAgICAgICBlbGVtID0gdGhpcy5nZXRSYXdOb2RlKGVsZW0pO1xyXG5cclxuICAgICAgICB2YXIgZWxlbUJDUiA9IGVsZW0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHdpZHRoOiBNYXRoLnJvdW5kKGFuZ3VsYXIuaXNOdW1iZXIoZWxlbUJDUi53aWR0aCkgPyBlbGVtQkNSLndpZHRoIDogZWxlbS5vZmZzZXRXaWR0aCksXHJcbiAgICAgICAgICBoZWlnaHQ6IE1hdGgucm91bmQoYW5ndWxhci5pc051bWJlcihlbGVtQkNSLmhlaWdodCkgPyBlbGVtQkNSLmhlaWdodCA6IGVsZW0ub2Zmc2V0SGVpZ2h0KSxcclxuICAgICAgICAgIHRvcDogTWF0aC5yb3VuZChlbGVtQkNSLnRvcCArICgkd2luZG93LnBhZ2VZT2Zmc2V0IHx8ICRkb2N1bWVudFswXS5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsVG9wKSksXHJcbiAgICAgICAgICBsZWZ0OiBNYXRoLnJvdW5kKGVsZW1CQ1IubGVmdCArICgkd2luZG93LnBhZ2VYT2Zmc2V0IHx8ICRkb2N1bWVudFswXS5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsTGVmdCkpXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBQcm92aWRlcyBvZmZzZXQgZGlzdGFuY2UgdG8gdGhlIGNsb3Nlc3Qgc2Nyb2xsYWJsZSBhbmNlc3RvclxyXG4gICAgICAgKiBvciB2aWV3cG9ydC4gIEFjY291bnRzIGZvciBib3JkZXIgYW5kIHNjcm9sbGJhciB3aWR0aC5cclxuICAgICAgICpcclxuICAgICAgICogUmlnaHQgYW5kIGJvdHRvbSBkaW1lbnNpb25zIHJlcHJlc2VudCB0aGUgZGlzdGFuY2UgdG8gdGhlXHJcbiAgICAgICAqIHJlc3BlY3RpdmUgZWRnZSBvZiB0aGUgdmlld3BvcnQgZWxlbWVudC4gIElmIHRoZSBlbGVtZW50XHJcbiAgICAgICAqIGVkZ2UgZXh0ZW5kcyBiZXlvbmQgdGhlIHZpZXdwb3J0LCBhIG5lZ2F0aXZlIHZhbHVlIHdpbGwgYmVcclxuICAgICAgICogcmVwb3J0ZWQuXHJcbiAgICAgICAqXHJcbiAgICAgICAqIEBwYXJhbSB7ZWxlbWVudH0gZWxlbSAtIFRoZSBlbGVtZW50IHRvIGdldCB0aGUgdmlld3BvcnQgb2Zmc2V0IGZvci5cclxuICAgICAgICogQHBhcmFtIHtib29sZWFuPX0gW3VzZURvY3VtZW50PWZhbHNlXSAtIFNob3VsZCB0aGUgdmlld3BvcnQgYmUgdGhlIGRvY3VtZW50IGVsZW1lbnQgaW5zdGVhZFxyXG4gICAgICAgKiBvZiB0aGUgZmlyc3Qgc2Nyb2xsYWJsZSBlbGVtZW50LCBkZWZhdWx0IGlzIGZhbHNlLlxyXG4gICAgICAgKiBAcGFyYW0ge2Jvb2xlYW49fSBbaW5jbHVkZVBhZGRpbmc9dHJ1ZV0gLSBTaG91bGQgdGhlIHBhZGRpbmcgb24gdGhlIG9mZnNldCBwYXJlbnQgZWxlbWVudFxyXG4gICAgICAgKiBiZSBhY2NvdW50ZWQgZm9yLCBkZWZhdWx0IGlzIHRydWUuXHJcbiAgICAgICAqXHJcbiAgICAgICAqIEByZXR1cm5zIHtvYmplY3R9IEFuIG9iamVjdCB3aXRoIHRoZSBmb2xsb3dpbmcgcHJvcGVydGllczpcclxuICAgICAgICogICA8dWw+XHJcbiAgICAgICAqICAgICA8bGk+Kip0b3AqKjogZGlzdGFuY2UgdG8gdGhlIHRvcCBjb250ZW50IGVkZ2Ugb2Ygdmlld3BvcnQgZWxlbWVudDwvbGk+XHJcbiAgICAgICAqICAgICA8bGk+Kipib3R0b20qKjogZGlzdGFuY2UgdG8gdGhlIGJvdHRvbSBjb250ZW50IGVkZ2Ugb2Ygdmlld3BvcnQgZWxlbWVudDwvbGk+XHJcbiAgICAgICAqICAgICA8bGk+KipsZWZ0Kio6IGRpc3RhbmNlIHRvIHRoZSBsZWZ0IGNvbnRlbnQgZWRnZSBvZiB2aWV3cG9ydCBlbGVtZW50PC9saT5cclxuICAgICAgICogICAgIDxsaT4qKnJpZ2h0Kio6IGRpc3RhbmNlIHRvIHRoZSByaWdodCBjb250ZW50IGVkZ2Ugb2Ygdmlld3BvcnQgZWxlbWVudDwvbGk+XHJcbiAgICAgICAqICAgPC91bD5cclxuICAgICAgICovXHJcbiAgICAgIHZpZXdwb3J0T2Zmc2V0OiBmdW5jdGlvbihlbGVtLCB1c2VEb2N1bWVudCwgaW5jbHVkZVBhZGRpbmcpIHtcclxuICAgICAgICBlbGVtID0gdGhpcy5nZXRSYXdOb2RlKGVsZW0pO1xyXG4gICAgICAgIGluY2x1ZGVQYWRkaW5nID0gaW5jbHVkZVBhZGRpbmcgIT09IGZhbHNlID8gdHJ1ZSA6IGZhbHNlO1xyXG5cclxuICAgICAgICB2YXIgZWxlbUJDUiA9IGVsZW0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcbiAgICAgICAgdmFyIG9mZnNldEJDUiA9IHt0b3A6IDAsIGxlZnQ6IDAsIGJvdHRvbTogMCwgcmlnaHQ6IDB9O1xyXG5cclxuICAgICAgICB2YXIgb2Zmc2V0UGFyZW50ID0gdXNlRG9jdW1lbnQgPyAkZG9jdW1lbnRbMF0uZG9jdW1lbnRFbGVtZW50IDogdGhpcy5zY3JvbGxQYXJlbnQoZWxlbSk7XHJcbiAgICAgICAgdmFyIG9mZnNldFBhcmVudEJDUiA9IG9mZnNldFBhcmVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcclxuXHJcbiAgICAgICAgb2Zmc2V0QkNSLnRvcCA9IG9mZnNldFBhcmVudEJDUi50b3AgKyBvZmZzZXRQYXJlbnQuY2xpZW50VG9wO1xyXG4gICAgICAgIG9mZnNldEJDUi5sZWZ0ID0gb2Zmc2V0UGFyZW50QkNSLmxlZnQgKyBvZmZzZXRQYXJlbnQuY2xpZW50TGVmdDtcclxuICAgICAgICBpZiAob2Zmc2V0UGFyZW50ID09PSAkZG9jdW1lbnRbMF0uZG9jdW1lbnRFbGVtZW50KSB7XHJcbiAgICAgICAgICBvZmZzZXRCQ1IudG9wICs9ICR3aW5kb3cucGFnZVlPZmZzZXQ7XHJcbiAgICAgICAgICBvZmZzZXRCQ1IubGVmdCArPSAkd2luZG93LnBhZ2VYT2Zmc2V0O1xyXG4gICAgICAgIH1cclxuICAgICAgICBvZmZzZXRCQ1IuYm90dG9tID0gb2Zmc2V0QkNSLnRvcCArIG9mZnNldFBhcmVudC5jbGllbnRIZWlnaHQ7XHJcbiAgICAgICAgb2Zmc2V0QkNSLnJpZ2h0ID0gb2Zmc2V0QkNSLmxlZnQgKyBvZmZzZXRQYXJlbnQuY2xpZW50V2lkdGg7XHJcblxyXG4gICAgICAgIGlmIChpbmNsdWRlUGFkZGluZykge1xyXG4gICAgICAgICAgdmFyIG9mZnNldFBhcmVudFN0eWxlID0gJHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKG9mZnNldFBhcmVudCk7XHJcbiAgICAgICAgICBvZmZzZXRCQ1IudG9wICs9IHRoaXMucGFyc2VTdHlsZShvZmZzZXRQYXJlbnRTdHlsZS5wYWRkaW5nVG9wKTtcclxuICAgICAgICAgIG9mZnNldEJDUi5ib3R0b20gLT0gdGhpcy5wYXJzZVN0eWxlKG9mZnNldFBhcmVudFN0eWxlLnBhZGRpbmdCb3R0b20pO1xyXG4gICAgICAgICAgb2Zmc2V0QkNSLmxlZnQgKz0gdGhpcy5wYXJzZVN0eWxlKG9mZnNldFBhcmVudFN0eWxlLnBhZGRpbmdMZWZ0KTtcclxuICAgICAgICAgIG9mZnNldEJDUi5yaWdodCAtPSB0aGlzLnBhcnNlU3R5bGUob2Zmc2V0UGFyZW50U3R5bGUucGFkZGluZ1JpZ2h0KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0b3A6IE1hdGgucm91bmQoZWxlbUJDUi50b3AgLSBvZmZzZXRCQ1IudG9wKSxcclxuICAgICAgICAgIGJvdHRvbTogTWF0aC5yb3VuZChvZmZzZXRCQ1IuYm90dG9tIC0gZWxlbUJDUi5ib3R0b20pLFxyXG4gICAgICAgICAgbGVmdDogTWF0aC5yb3VuZChlbGVtQkNSLmxlZnQgLSBvZmZzZXRCQ1IubGVmdCksXHJcbiAgICAgICAgICByaWdodDogTWF0aC5yb3VuZChvZmZzZXRCQ1IucmlnaHQgLSBlbGVtQkNSLnJpZ2h0KVxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogUHJvdmlkZXMgYW4gYXJyYXkgb2YgcGxhY2VtZW50IHZhbHVlcyBwYXJzZWQgZnJvbSBhIHBsYWNlbWVudCBzdHJpbmcuXHJcbiAgICAgICAqIEFsb25nIHdpdGggdGhlICdhdXRvJyBpbmRpY2F0b3IsIHN1cHBvcnRlZCBwbGFjZW1lbnQgc3RyaW5ncyBhcmU6XHJcbiAgICAgICAqICAgPHVsPlxyXG4gICAgICAgKiAgICAgPGxpPnRvcDogZWxlbWVudCBvbiB0b3AsIGhvcml6b250YWxseSBjZW50ZXJlZCBvbiBob3N0IGVsZW1lbnQuPC9saT5cclxuICAgICAgICogICAgIDxsaT50b3AtbGVmdDogZWxlbWVudCBvbiB0b3AsIGxlZnQgZWRnZSBhbGlnbmVkIHdpdGggaG9zdCBlbGVtZW50IGxlZnQgZWRnZS48L2xpPlxyXG4gICAgICAgKiAgICAgPGxpPnRvcC1yaWdodDogZWxlbWVudCBvbiB0b3AsIGxlcmlnaHRmdCBlZGdlIGFsaWduZWQgd2l0aCBob3N0IGVsZW1lbnQgcmlnaHQgZWRnZS48L2xpPlxyXG4gICAgICAgKiAgICAgPGxpPmJvdHRvbTogZWxlbWVudCBvbiBib3R0b20sIGhvcml6b250YWxseSBjZW50ZXJlZCBvbiBob3N0IGVsZW1lbnQuPC9saT5cclxuICAgICAgICogICAgIDxsaT5ib3R0b20tbGVmdDogZWxlbWVudCBvbiBib3R0b20sIGxlZnQgZWRnZSBhbGlnbmVkIHdpdGggaG9zdCBlbGVtZW50IGxlZnQgZWRnZS48L2xpPlxyXG4gICAgICAgKiAgICAgPGxpPmJvdHRvbS1yaWdodDogZWxlbWVudCBvbiBib3R0b20sIHJpZ2h0IGVkZ2UgYWxpZ25lZCB3aXRoIGhvc3QgZWxlbWVudCByaWdodCBlZGdlLjwvbGk+XHJcbiAgICAgICAqICAgICA8bGk+bGVmdDogZWxlbWVudCBvbiBsZWZ0LCB2ZXJ0aWNhbGx5IGNlbnRlcmVkIG9uIGhvc3QgZWxlbWVudC48L2xpPlxyXG4gICAgICAgKiAgICAgPGxpPmxlZnQtdG9wOiBlbGVtZW50IG9uIGxlZnQsIHRvcCBlZGdlIGFsaWduZWQgd2l0aCBob3N0IGVsZW1lbnQgdG9wIGVkZ2UuPC9saT5cclxuICAgICAgICogICAgIDxsaT5sZWZ0LWJvdHRvbTogZWxlbWVudCBvbiBsZWZ0LCBib3R0b20gZWRnZSBhbGlnbmVkIHdpdGggaG9zdCBlbGVtZW50IGJvdHRvbSBlZGdlLjwvbGk+XHJcbiAgICAgICAqICAgICA8bGk+cmlnaHQ6IGVsZW1lbnQgb24gcmlnaHQsIHZlcnRpY2FsbHkgY2VudGVyZWQgb24gaG9zdCBlbGVtZW50LjwvbGk+XHJcbiAgICAgICAqICAgICA8bGk+cmlnaHQtdG9wOiBlbGVtZW50IG9uIHJpZ2h0LCB0b3AgZWRnZSBhbGlnbmVkIHdpdGggaG9zdCBlbGVtZW50IHRvcCBlZGdlLjwvbGk+XHJcbiAgICAgICAqICAgICA8bGk+cmlnaHQtYm90dG9tOiBlbGVtZW50IG9uIHJpZ2h0LCBib3R0b20gZWRnZSBhbGlnbmVkIHdpdGggaG9zdCBlbGVtZW50IGJvdHRvbSBlZGdlLjwvbGk+XHJcbiAgICAgICAqICAgPC91bD5cclxuICAgICAgICogQSBwbGFjZW1lbnQgc3RyaW5nIHdpdGggYW4gJ2F1dG8nIGluZGljYXRvciBpcyBleHBlY3RlZCB0byBiZVxyXG4gICAgICAgKiBzcGFjZSBzZXBhcmF0ZWQgZnJvbSB0aGUgcGxhY2VtZW50LCBpLmU6ICdhdXRvIGJvdHRvbS1sZWZ0JyAgSWZcclxuICAgICAgICogdGhlIHByaW1hcnkgYW5kIHNlY29uZGFyeSBwbGFjZW1lbnQgdmFsdWVzIGRvIG5vdCBtYXRjaCAndG9wLFxyXG4gICAgICAgKiBib3R0b20sIGxlZnQsIHJpZ2h0JyB0aGVuICd0b3AnIHdpbGwgYmUgdGhlIHByaW1hcnkgcGxhY2VtZW50IGFuZFxyXG4gICAgICAgKiAnY2VudGVyJyB3aWxsIGJlIHRoZSBzZWNvbmRhcnkgcGxhY2VtZW50LiAgSWYgJ2F1dG8nIGlzIHBhc3NlZCwgdHJ1ZVxyXG4gICAgICAgKiB3aWxsIGJlIHJldHVybmVkIGFzIHRoZSAzcmQgdmFsdWUgb2YgdGhlIGFycmF5LlxyXG4gICAgICAgKlxyXG4gICAgICAgKiBAcGFyYW0ge3N0cmluZ30gcGxhY2VtZW50IC0gVGhlIHBsYWNlbWVudCBzdHJpbmcgdG8gcGFyc2UuXHJcbiAgICAgICAqXHJcbiAgICAgICAqIEByZXR1cm5zIHthcnJheX0gQW4gYXJyYXkgd2l0aCB0aGUgZm9sbG93aW5nIHZhbHVlc1xyXG4gICAgICAgKiA8dWw+XHJcbiAgICAgICAqICAgPGxpPioqWzBdKio6IFRoZSBwcmltYXJ5IHBsYWNlbWVudC48L2xpPlxyXG4gICAgICAgKiAgIDxsaT4qKlsxXSoqOiBUaGUgc2Vjb25kYXJ5IHBsYWNlbWVudC48L2xpPlxyXG4gICAgICAgKiAgIDxsaT4qKlsyXSoqOiBJZiBhdXRvIGlzIHBhc3NlZDogdHJ1ZSwgZWxzZSB1bmRlZmluZWQuPC9saT5cclxuICAgICAgICogPC91bD5cclxuICAgICAgICovXHJcbiAgICAgIHBhcnNlUGxhY2VtZW50OiBmdW5jdGlvbihwbGFjZW1lbnQpIHtcclxuICAgICAgICB2YXIgYXV0b1BsYWNlID0gUExBQ0VNRU5UX1JFR0VYLmF1dG8udGVzdChwbGFjZW1lbnQpO1xyXG4gICAgICAgIGlmIChhdXRvUGxhY2UpIHtcclxuICAgICAgICAgIHBsYWNlbWVudCA9IHBsYWNlbWVudC5yZXBsYWNlKFBMQUNFTUVOVF9SRUdFWC5hdXRvLCAnJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwbGFjZW1lbnQgPSBwbGFjZW1lbnQuc3BsaXQoJy0nKTtcclxuXHJcbiAgICAgICAgcGxhY2VtZW50WzBdID0gcGxhY2VtZW50WzBdIHx8ICd0b3AnO1xyXG4gICAgICAgIGlmICghUExBQ0VNRU5UX1JFR0VYLnByaW1hcnkudGVzdChwbGFjZW1lbnRbMF0pKSB7XHJcbiAgICAgICAgICBwbGFjZW1lbnRbMF0gPSAndG9wJztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHBsYWNlbWVudFsxXSA9IHBsYWNlbWVudFsxXSB8fCAnY2VudGVyJztcclxuICAgICAgICBpZiAoIVBMQUNFTUVOVF9SRUdFWC5zZWNvbmRhcnkudGVzdChwbGFjZW1lbnRbMV0pKSB7XHJcbiAgICAgICAgICBwbGFjZW1lbnRbMV0gPSAnY2VudGVyJztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChhdXRvUGxhY2UpIHtcclxuICAgICAgICAgIHBsYWNlbWVudFsyXSA9IHRydWU7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHBsYWNlbWVudFsyXSA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHBsYWNlbWVudDtcclxuICAgICAgfSxcclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBQcm92aWRlcyBjb29yZGluYXRlcyBmb3IgYW4gZWxlbWVudCB0byBiZSBwb3NpdGlvbmVkIHJlbGF0aXZlIHRvXHJcbiAgICAgICAqIGFub3RoZXIgZWxlbWVudC4gIFBhc3NpbmcgJ2F1dG8nIGFzIHBhcnQgb2YgdGhlIHBsYWNlbWVudCBwYXJhbWV0ZXJcclxuICAgICAgICogd2lsbCBlbmFibGUgc21hcnQgcGxhY2VtZW50IC0gd2hlcmUgdGhlIGVsZW1lbnQgZml0cy4gaS5lOlxyXG4gICAgICAgKiAnYXV0byBsZWZ0LXRvcCcgd2lsbCBjaGVjayB0byBzZWUgaWYgdGhlcmUgaXMgZW5vdWdoIHNwYWNlIHRvIHRoZSBsZWZ0XHJcbiAgICAgICAqIG9mIHRoZSBob3N0RWxlbSB0byBmaXQgdGhlIHRhcmdldEVsZW0sIGlmIG5vdCBwbGFjZSByaWdodCAoc2FtZSBmb3Igc2Vjb25kYXJ5XHJcbiAgICAgICAqIHRvcCBwbGFjZW1lbnQpLiAgQXZhaWxhYmxlIHNwYWNlIGlzIGNhbGN1bGF0ZWQgdXNpbmcgdGhlIHZpZXdwb3J0T2Zmc2V0XHJcbiAgICAgICAqIGZ1bmN0aW9uLlxyXG4gICAgICAgKlxyXG4gICAgICAgKiBAcGFyYW0ge2VsZW1lbnR9IGhvc3RFbGVtIC0gVGhlIGVsZW1lbnQgdG8gcG9zaXRpb24gYWdhaW5zdC5cclxuICAgICAgICogQHBhcmFtIHtlbGVtZW50fSB0YXJnZXRFbGVtIC0gVGhlIGVsZW1lbnQgdG8gcG9zaXRpb24uXHJcbiAgICAgICAqIEBwYXJhbSB7c3RyaW5nPX0gW3BsYWNlbWVudD10b3BdIC0gVGhlIHBsYWNlbWVudCBmb3IgdGhlIHRhcmdldEVsZW0sXHJcbiAgICAgICAqICAgZGVmYXVsdCBpcyAndG9wJy4gJ2NlbnRlcicgaXMgYXNzdW1lZCBhcyBzZWNvbmRhcnkgcGxhY2VtZW50IGZvclxyXG4gICAgICAgKiAgICd0b3AnLCAnbGVmdCcsICdyaWdodCcsIGFuZCAnYm90dG9tJyBwbGFjZW1lbnRzLiAgQXZhaWxhYmxlIHBsYWNlbWVudHMgYXJlOlxyXG4gICAgICAgKiAgIDx1bD5cclxuICAgICAgICogICAgIDxsaT50b3A8L2xpPlxyXG4gICAgICAgKiAgICAgPGxpPnRvcC1yaWdodDwvbGk+XHJcbiAgICAgICAqICAgICA8bGk+dG9wLWxlZnQ8L2xpPlxyXG4gICAgICAgKiAgICAgPGxpPmJvdHRvbTwvbGk+XHJcbiAgICAgICAqICAgICA8bGk+Ym90dG9tLWxlZnQ8L2xpPlxyXG4gICAgICAgKiAgICAgPGxpPmJvdHRvbS1yaWdodDwvbGk+XHJcbiAgICAgICAqICAgICA8bGk+bGVmdDwvbGk+XHJcbiAgICAgICAqICAgICA8bGk+bGVmdC10b3A8L2xpPlxyXG4gICAgICAgKiAgICAgPGxpPmxlZnQtYm90dG9tPC9saT5cclxuICAgICAgICogICAgIDxsaT5yaWdodDwvbGk+XHJcbiAgICAgICAqICAgICA8bGk+cmlnaHQtdG9wPC9saT5cclxuICAgICAgICogICAgIDxsaT5yaWdodC1ib3R0b208L2xpPlxyXG4gICAgICAgKiAgIDwvdWw+XHJcbiAgICAgICAqIEBwYXJhbSB7Ym9vbGVhbj19IFthcHBlbmRUb0JvZHk9ZmFsc2VdIC0gU2hvdWxkIHRoZSB0b3AgYW5kIGxlZnQgdmFsdWVzIHJldHVybmVkXHJcbiAgICAgICAqICAgYmUgY2FsY3VsYXRlZCBmcm9tIHRoZSBib2R5IGVsZW1lbnQsIGRlZmF1bHQgaXMgZmFsc2UuXHJcbiAgICAgICAqXHJcbiAgICAgICAqIEByZXR1cm5zIHtvYmplY3R9IEFuIG9iamVjdCB3aXRoIHRoZSBmb2xsb3dpbmcgcHJvcGVydGllczpcclxuICAgICAgICogICA8dWw+XHJcbiAgICAgICAqICAgICA8bGk+Kip0b3AqKjogVmFsdWUgZm9yIHRhcmdldEVsZW0gdG9wLjwvbGk+XHJcbiAgICAgICAqICAgICA8bGk+KipsZWZ0Kio6IFZhbHVlIGZvciB0YXJnZXRFbGVtIGxlZnQuPC9saT5cclxuICAgICAgICogICAgIDxsaT4qKnBsYWNlbWVudCoqOiBUaGUgcmVzb2x2ZWQgcGxhY2VtZW50LjwvbGk+XHJcbiAgICAgICAqICAgPC91bD5cclxuICAgICAgICovXHJcbiAgICAgIHBvc2l0aW9uRWxlbWVudHM6IGZ1bmN0aW9uKGhvc3RFbGVtLCB0YXJnZXRFbGVtLCBwbGFjZW1lbnQsIGFwcGVuZFRvQm9keSkge1xyXG4gICAgICAgIGhvc3RFbGVtID0gdGhpcy5nZXRSYXdOb2RlKGhvc3RFbGVtKTtcclxuICAgICAgICB0YXJnZXRFbGVtID0gdGhpcy5nZXRSYXdOb2RlKHRhcmdldEVsZW0pO1xyXG5cclxuICAgICAgICAvLyBuZWVkIHRvIHJlYWQgZnJvbSBwcm9wIHRvIHN1cHBvcnQgdGVzdHMuXHJcbiAgICAgICAgdmFyIHRhcmdldFdpZHRoID0gYW5ndWxhci5pc0RlZmluZWQodGFyZ2V0RWxlbS5vZmZzZXRXaWR0aCkgPyB0YXJnZXRFbGVtLm9mZnNldFdpZHRoIDogdGFyZ2V0RWxlbS5wcm9wKCdvZmZzZXRXaWR0aCcpO1xyXG4gICAgICAgIHZhciB0YXJnZXRIZWlnaHQgPSBhbmd1bGFyLmlzRGVmaW5lZCh0YXJnZXRFbGVtLm9mZnNldEhlaWdodCkgPyB0YXJnZXRFbGVtLm9mZnNldEhlaWdodCA6IHRhcmdldEVsZW0ucHJvcCgnb2Zmc2V0SGVpZ2h0Jyk7XHJcblxyXG4gICAgICAgIHBsYWNlbWVudCA9IHRoaXMucGFyc2VQbGFjZW1lbnQocGxhY2VtZW50KTtcclxuXHJcbiAgICAgICAgdmFyIGhvc3RFbGVtUG9zID0gYXBwZW5kVG9Cb2R5ID8gdGhpcy5vZmZzZXQoaG9zdEVsZW0pIDogdGhpcy5wb3NpdGlvbihob3N0RWxlbSk7XHJcbiAgICAgICAgdmFyIHRhcmdldEVsZW1Qb3MgPSB7dG9wOiAwLCBsZWZ0OiAwLCBwbGFjZW1lbnQ6ICcnfTtcclxuXHJcbiAgICAgICAgaWYgKHBsYWNlbWVudFsyXSkge1xyXG4gICAgICAgICAgdmFyIHZpZXdwb3J0T2Zmc2V0ID0gdGhpcy52aWV3cG9ydE9mZnNldChob3N0RWxlbSwgYXBwZW5kVG9Cb2R5KTtcclxuXHJcbiAgICAgICAgICB2YXIgdGFyZ2V0RWxlbVN0eWxlID0gJHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKHRhcmdldEVsZW0pO1xyXG4gICAgICAgICAgdmFyIGFkanVzdGVkU2l6ZSA9IHtcclxuICAgICAgICAgICAgd2lkdGg6IHRhcmdldFdpZHRoICsgTWF0aC5yb3VuZChNYXRoLmFicyh0aGlzLnBhcnNlU3R5bGUodGFyZ2V0RWxlbVN0eWxlLm1hcmdpbkxlZnQpICsgdGhpcy5wYXJzZVN0eWxlKHRhcmdldEVsZW1TdHlsZS5tYXJnaW5SaWdodCkpKSxcclxuICAgICAgICAgICAgaGVpZ2h0OiB0YXJnZXRIZWlnaHQgKyBNYXRoLnJvdW5kKE1hdGguYWJzKHRoaXMucGFyc2VTdHlsZSh0YXJnZXRFbGVtU3R5bGUubWFyZ2luVG9wKSArIHRoaXMucGFyc2VTdHlsZSh0YXJnZXRFbGVtU3R5bGUubWFyZ2luQm90dG9tKSkpXHJcbiAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgIHBsYWNlbWVudFswXSA9IHBsYWNlbWVudFswXSA9PT0gJ3RvcCcgJiYgYWRqdXN0ZWRTaXplLmhlaWdodCA+IHZpZXdwb3J0T2Zmc2V0LnRvcCAmJiBhZGp1c3RlZFNpemUuaGVpZ2h0IDw9IHZpZXdwb3J0T2Zmc2V0LmJvdHRvbSA/ICdib3R0b20nIDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgIHBsYWNlbWVudFswXSA9PT0gJ2JvdHRvbScgJiYgYWRqdXN0ZWRTaXplLmhlaWdodCA+IHZpZXdwb3J0T2Zmc2V0LmJvdHRvbSAmJiBhZGp1c3RlZFNpemUuaGVpZ2h0IDw9IHZpZXdwb3J0T2Zmc2V0LnRvcCA/ICd0b3AnIDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgIHBsYWNlbWVudFswXSA9PT0gJ2xlZnQnICYmIGFkanVzdGVkU2l6ZS53aWR0aCA+IHZpZXdwb3J0T2Zmc2V0LmxlZnQgJiYgYWRqdXN0ZWRTaXplLndpZHRoIDw9IHZpZXdwb3J0T2Zmc2V0LnJpZ2h0ID8gJ3JpZ2h0JyA6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICBwbGFjZW1lbnRbMF0gPT09ICdyaWdodCcgJiYgYWRqdXN0ZWRTaXplLndpZHRoID4gdmlld3BvcnRPZmZzZXQucmlnaHQgJiYgYWRqdXN0ZWRTaXplLndpZHRoIDw9IHZpZXdwb3J0T2Zmc2V0LmxlZnQgPyAnbGVmdCcgOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgcGxhY2VtZW50WzBdO1xyXG5cclxuICAgICAgICAgIHBsYWNlbWVudFsxXSA9IHBsYWNlbWVudFsxXSA9PT0gJ3RvcCcgJiYgYWRqdXN0ZWRTaXplLmhlaWdodCAtIGhvc3RFbGVtUG9zLmhlaWdodCA+IHZpZXdwb3J0T2Zmc2V0LmJvdHRvbSAmJiBhZGp1c3RlZFNpemUuaGVpZ2h0IC0gaG9zdEVsZW1Qb3MuaGVpZ2h0IDw9IHZpZXdwb3J0T2Zmc2V0LnRvcCA/ICdib3R0b20nIDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgIHBsYWNlbWVudFsxXSA9PT0gJ2JvdHRvbScgJiYgYWRqdXN0ZWRTaXplLmhlaWdodCAtIGhvc3RFbGVtUG9zLmhlaWdodCA+IHZpZXdwb3J0T2Zmc2V0LnRvcCAmJiBhZGp1c3RlZFNpemUuaGVpZ2h0IC0gaG9zdEVsZW1Qb3MuaGVpZ2h0IDw9IHZpZXdwb3J0T2Zmc2V0LmJvdHRvbSA/ICd0b3AnIDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgIHBsYWNlbWVudFsxXSA9PT0gJ2xlZnQnICYmIGFkanVzdGVkU2l6ZS53aWR0aCAtIGhvc3RFbGVtUG9zLndpZHRoID4gdmlld3BvcnRPZmZzZXQucmlnaHQgJiYgYWRqdXN0ZWRTaXplLndpZHRoIC0gaG9zdEVsZW1Qb3Mud2lkdGggPD0gdmlld3BvcnRPZmZzZXQubGVmdCA/ICdyaWdodCcgOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgcGxhY2VtZW50WzFdID09PSAncmlnaHQnICYmIGFkanVzdGVkU2l6ZS53aWR0aCAtIGhvc3RFbGVtUG9zLndpZHRoID4gdmlld3BvcnRPZmZzZXQubGVmdCAmJiBhZGp1c3RlZFNpemUud2lkdGggLSBob3N0RWxlbVBvcy53aWR0aCA8PSB2aWV3cG9ydE9mZnNldC5yaWdodCA/ICdsZWZ0JyA6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICBwbGFjZW1lbnRbMV07XHJcblxyXG4gICAgICAgICAgaWYgKHBsYWNlbWVudFsxXSA9PT0gJ2NlbnRlcicpIHtcclxuICAgICAgICAgICAgaWYgKFBMQUNFTUVOVF9SRUdFWC52ZXJ0aWNhbC50ZXN0KHBsYWNlbWVudFswXSkpIHtcclxuICAgICAgICAgICAgICB2YXIgeE92ZXJmbG93ID0gaG9zdEVsZW1Qb3Mud2lkdGggLyAyIC0gdGFyZ2V0V2lkdGggLyAyO1xyXG4gICAgICAgICAgICAgIGlmICh2aWV3cG9ydE9mZnNldC5sZWZ0ICsgeE92ZXJmbG93IDwgMCAmJiBhZGp1c3RlZFNpemUud2lkdGggLSBob3N0RWxlbVBvcy53aWR0aCA8PSB2aWV3cG9ydE9mZnNldC5yaWdodCkge1xyXG4gICAgICAgICAgICAgICAgcGxhY2VtZW50WzFdID0gJ2xlZnQnO1xyXG4gICAgICAgICAgICAgIH0gZWxzZSBpZiAodmlld3BvcnRPZmZzZXQucmlnaHQgKyB4T3ZlcmZsb3cgPCAwICYmIGFkanVzdGVkU2l6ZS53aWR0aCAtIGhvc3RFbGVtUG9zLndpZHRoIDw9IHZpZXdwb3J0T2Zmc2V0LmxlZnQpIHtcclxuICAgICAgICAgICAgICAgIHBsYWNlbWVudFsxXSA9ICdyaWdodCc7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIHZhciB5T3ZlcmZsb3cgPSBob3N0RWxlbVBvcy5oZWlnaHQgLyAyIC0gYWRqdXN0ZWRTaXplLmhlaWdodCAvIDI7XHJcbiAgICAgICAgICAgICAgaWYgKHZpZXdwb3J0T2Zmc2V0LnRvcCArIHlPdmVyZmxvdyA8IDAgJiYgYWRqdXN0ZWRTaXplLmhlaWdodCAtIGhvc3RFbGVtUG9zLmhlaWdodCA8PSB2aWV3cG9ydE9mZnNldC5ib3R0b20pIHtcclxuICAgICAgICAgICAgICAgIHBsYWNlbWVudFsxXSA9ICd0b3AnO1xyXG4gICAgICAgICAgICAgIH0gZWxzZSBpZiAodmlld3BvcnRPZmZzZXQuYm90dG9tICsgeU92ZXJmbG93IDwgMCAmJiBhZGp1c3RlZFNpemUuaGVpZ2h0IC0gaG9zdEVsZW1Qb3MuaGVpZ2h0IDw9IHZpZXdwb3J0T2Zmc2V0LnRvcCkge1xyXG4gICAgICAgICAgICAgICAgcGxhY2VtZW50WzFdID0gJ2JvdHRvbSc7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBzd2l0Y2ggKHBsYWNlbWVudFswXSkge1xyXG4gICAgICAgICAgY2FzZSAndG9wJzpcclxuICAgICAgICAgICAgdGFyZ2V0RWxlbVBvcy50b3AgPSBob3N0RWxlbVBvcy50b3AgLSB0YXJnZXRIZWlnaHQ7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgY2FzZSAnYm90dG9tJzpcclxuICAgICAgICAgICAgdGFyZ2V0RWxlbVBvcy50b3AgPSBob3N0RWxlbVBvcy50b3AgKyBob3N0RWxlbVBvcy5oZWlnaHQ7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgY2FzZSAnbGVmdCc6XHJcbiAgICAgICAgICAgIHRhcmdldEVsZW1Qb3MubGVmdCA9IGhvc3RFbGVtUG9zLmxlZnQgLSB0YXJnZXRXaWR0aDtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICBjYXNlICdyaWdodCc6XHJcbiAgICAgICAgICAgIHRhcmdldEVsZW1Qb3MubGVmdCA9IGhvc3RFbGVtUG9zLmxlZnQgKyBob3N0RWxlbVBvcy53aWR0aDtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBzd2l0Y2ggKHBsYWNlbWVudFsxXSkge1xyXG4gICAgICAgICAgY2FzZSAndG9wJzpcclxuICAgICAgICAgICAgdGFyZ2V0RWxlbVBvcy50b3AgPSBob3N0RWxlbVBvcy50b3A7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgY2FzZSAnYm90dG9tJzpcclxuICAgICAgICAgICAgdGFyZ2V0RWxlbVBvcy50b3AgPSBob3N0RWxlbVBvcy50b3AgKyBob3N0RWxlbVBvcy5oZWlnaHQgLSB0YXJnZXRIZWlnaHQ7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgY2FzZSAnbGVmdCc6XHJcbiAgICAgICAgICAgIHRhcmdldEVsZW1Qb3MubGVmdCA9IGhvc3RFbGVtUG9zLmxlZnQ7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgY2FzZSAncmlnaHQnOlxyXG4gICAgICAgICAgICB0YXJnZXRFbGVtUG9zLmxlZnQgPSBob3N0RWxlbVBvcy5sZWZ0ICsgaG9zdEVsZW1Qb3Mud2lkdGggLSB0YXJnZXRXaWR0aDtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICBjYXNlICdjZW50ZXInOlxyXG4gICAgICAgICAgICBpZiAoUExBQ0VNRU5UX1JFR0VYLnZlcnRpY2FsLnRlc3QocGxhY2VtZW50WzBdKSkge1xyXG4gICAgICAgICAgICAgIHRhcmdldEVsZW1Qb3MubGVmdCA9IGhvc3RFbGVtUG9zLmxlZnQgKyBob3N0RWxlbVBvcy53aWR0aCAvIDIgLSB0YXJnZXRXaWR0aCAvIDI7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgdGFyZ2V0RWxlbVBvcy50b3AgPSBob3N0RWxlbVBvcy50b3AgKyBob3N0RWxlbVBvcy5oZWlnaHQgLyAyIC0gdGFyZ2V0SGVpZ2h0IC8gMjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRhcmdldEVsZW1Qb3MudG9wID0gTWF0aC5yb3VuZCh0YXJnZXRFbGVtUG9zLnRvcCk7XHJcbiAgICAgICAgdGFyZ2V0RWxlbVBvcy5sZWZ0ID0gTWF0aC5yb3VuZCh0YXJnZXRFbGVtUG9zLmxlZnQpO1xyXG4gICAgICAgIHRhcmdldEVsZW1Qb3MucGxhY2VtZW50ID0gcGxhY2VtZW50WzFdID09PSAnY2VudGVyJyA/IHBsYWNlbWVudFswXSA6IHBsYWNlbWVudFswXSArICctJyArIHBsYWNlbWVudFsxXTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHRhcmdldEVsZW1Qb3M7XHJcbiAgICAgIH0sXHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogUHJvdmlkZXMgYSB3YXkgdG8gYWRqdXN0IHRoZSB0b3AgcG9zaXRpb25pbmcgYWZ0ZXIgZmlyc3RcclxuICAgICAgICogcmVuZGVyIHRvIGNvcnJlY3RseSBhbGlnbiBlbGVtZW50IHRvIHRvcCBhZnRlciBjb250ZW50XHJcbiAgICAgICAqIHJlbmRlcmluZyBjYXVzZXMgcmVzaXplZCBlbGVtZW50IGhlaWdodFxyXG4gICAgICAgKlxyXG4gICAgICAgKiBAcGFyYW0ge2FycmF5fSBwbGFjZW1lbnRDbGFzc2VzIC0gVGhlIGFycmF5IG9mIHN0cmluZ3Mgb2YgY2xhc3Nlc1xyXG4gICAgICAgKiBlbGVtZW50IHNob3VsZCBoYXZlLlxyXG4gICAgICAgKiBAcGFyYW0ge29iamVjdH0gY29udGFpbmVyUG9zaXRpb24gLSBUaGUgb2JqZWN0IHdpdGggY29udGFpbmVyXHJcbiAgICAgICAqIHBvc2l0aW9uIGluZm9ybWF0aW9uXHJcbiAgICAgICAqIEBwYXJhbSB7bnVtYmVyfSBpbml0aWFsSGVpZ2h0IC0gVGhlIGluaXRpYWwgaGVpZ2h0IGZvciB0aGUgZWxlbS5cclxuICAgICAgICogQHBhcmFtIHtudW1iZXJ9IGN1cnJlbnRIZWlnaHQgLSBUaGUgY3VycmVudCBoZWlnaHQgZm9yIHRoZSBlbGVtLlxyXG4gICAgICAgKi9cclxuICAgICAgYWRqdXN0VG9wOiBmdW5jdGlvbihwbGFjZW1lbnRDbGFzc2VzLCBjb250YWluZXJQb3NpdGlvbiwgaW5pdGlhbEhlaWdodCwgY3VycmVudEhlaWdodCkge1xyXG4gICAgICAgIGlmIChwbGFjZW1lbnRDbGFzc2VzLmluZGV4T2YoJ3RvcCcpICE9PSAtMSAmJiBpbml0aWFsSGVpZ2h0ICE9PSBjdXJyZW50SGVpZ2h0KSB7XHJcbiAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICB0b3A6IGNvbnRhaW5lclBvc2l0aW9uLnRvcCAtIGN1cnJlbnRIZWlnaHQgKyAncHgnXHJcbiAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBQcm92aWRlcyBhIHdheSBmb3IgcG9zaXRpb25pbmcgdG9vbHRpcCAmIGRyb3Bkb3duXHJcbiAgICAgICAqIGFycm93cyB3aGVuIHVzaW5nIHBsYWNlbWVudCBvcHRpb25zIGJleW9uZCB0aGUgc3RhbmRhcmRcclxuICAgICAgICogbGVmdCwgcmlnaHQsIHRvcCwgb3IgYm90dG9tLlxyXG4gICAgICAgKlxyXG4gICAgICAgKiBAcGFyYW0ge2VsZW1lbnR9IGVsZW0gLSBUaGUgdG9vbHRpcC9kcm9wZG93biBlbGVtZW50LlxyXG4gICAgICAgKiBAcGFyYW0ge3N0cmluZ30gcGxhY2VtZW50IC0gVGhlIHBsYWNlbWVudCBmb3IgdGhlIGVsZW0uXHJcbiAgICAgICAqL1xyXG4gICAgICBwb3NpdGlvbkFycm93OiBmdW5jdGlvbihlbGVtLCBwbGFjZW1lbnQpIHtcclxuICAgICAgICBlbGVtID0gdGhpcy5nZXRSYXdOb2RlKGVsZW0pO1xyXG5cclxuICAgICAgICB2YXIgaW5uZXJFbGVtID0gZWxlbS5xdWVyeVNlbGVjdG9yKCcudG9vbHRpcC1pbm5lciwgLnBvcG92ZXItaW5uZXInKTtcclxuICAgICAgICBpZiAoIWlubmVyRWxlbSkge1xyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdmFyIGlzVG9vbHRpcCA9IGFuZ3VsYXIuZWxlbWVudChpbm5lckVsZW0pLmhhc0NsYXNzKCd0b29sdGlwLWlubmVyJyk7XHJcblxyXG4gICAgICAgIHZhciBhcnJvd0VsZW0gPSBpc1Rvb2x0aXAgPyBlbGVtLnF1ZXJ5U2VsZWN0b3IoJy50b29sdGlwLWFycm93JykgOiBlbGVtLnF1ZXJ5U2VsZWN0b3IoJy5hcnJvdycpO1xyXG4gICAgICAgIGlmICghYXJyb3dFbGVtKSB7XHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2YXIgYXJyb3dDc3MgPSB7XHJcbiAgICAgICAgICB0b3A6ICcnLFxyXG4gICAgICAgICAgYm90dG9tOiAnJyxcclxuICAgICAgICAgIGxlZnQ6ICcnLFxyXG4gICAgICAgICAgcmlnaHQ6ICcnXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgcGxhY2VtZW50ID0gdGhpcy5wYXJzZVBsYWNlbWVudChwbGFjZW1lbnQpO1xyXG4gICAgICAgIGlmIChwbGFjZW1lbnRbMV0gPT09ICdjZW50ZXInKSB7XHJcbiAgICAgICAgICAvLyBubyBhZGp1c3RtZW50IG5lY2Vzc2FyeSAtIGp1c3QgcmVzZXQgc3R5bGVzXHJcbiAgICAgICAgICBhbmd1bGFyLmVsZW1lbnQoYXJyb3dFbGVtKS5jc3MoYXJyb3dDc3MpO1xyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdmFyIGJvcmRlclByb3AgPSAnYm9yZGVyLScgKyBwbGFjZW1lbnRbMF0gKyAnLXdpZHRoJztcclxuICAgICAgICB2YXIgYm9yZGVyV2lkdGggPSAkd2luZG93LmdldENvbXB1dGVkU3R5bGUoYXJyb3dFbGVtKVtib3JkZXJQcm9wXTtcclxuXHJcbiAgICAgICAgdmFyIGJvcmRlclJhZGl1c1Byb3AgPSAnYm9yZGVyLSc7XHJcbiAgICAgICAgaWYgKFBMQUNFTUVOVF9SRUdFWC52ZXJ0aWNhbC50ZXN0KHBsYWNlbWVudFswXSkpIHtcclxuICAgICAgICAgIGJvcmRlclJhZGl1c1Byb3AgKz0gcGxhY2VtZW50WzBdICsgJy0nICsgcGxhY2VtZW50WzFdO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBib3JkZXJSYWRpdXNQcm9wICs9IHBsYWNlbWVudFsxXSArICctJyArIHBsYWNlbWVudFswXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgYm9yZGVyUmFkaXVzUHJvcCArPSAnLXJhZGl1cyc7XHJcbiAgICAgICAgdmFyIGJvcmRlclJhZGl1cyA9ICR3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShpc1Rvb2x0aXAgPyBpbm5lckVsZW0gOiBlbGVtKVtib3JkZXJSYWRpdXNQcm9wXTtcclxuXHJcbiAgICAgICAgc3dpdGNoIChwbGFjZW1lbnRbMF0pIHtcclxuICAgICAgICAgIGNhc2UgJ3RvcCc6XHJcbiAgICAgICAgICAgIGFycm93Q3NzLmJvdHRvbSA9IGlzVG9vbHRpcCA/ICcwJyA6ICctJyArIGJvcmRlcldpZHRoO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgIGNhc2UgJ2JvdHRvbSc6XHJcbiAgICAgICAgICAgIGFycm93Q3NzLnRvcCA9IGlzVG9vbHRpcCA/ICcwJyA6ICctJyArIGJvcmRlcldpZHRoO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgIGNhc2UgJ2xlZnQnOlxyXG4gICAgICAgICAgICBhcnJvd0Nzcy5yaWdodCA9IGlzVG9vbHRpcCA/ICcwJyA6ICctJyArIGJvcmRlcldpZHRoO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgIGNhc2UgJ3JpZ2h0JzpcclxuICAgICAgICAgICAgYXJyb3dDc3MubGVmdCA9IGlzVG9vbHRpcCA/ICcwJyA6ICctJyArIGJvcmRlcldpZHRoO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGFycm93Q3NzW3BsYWNlbWVudFsxXV0gPSBib3JkZXJSYWRpdXM7XHJcblxyXG4gICAgICAgIGFuZ3VsYXIuZWxlbWVudChhcnJvd0VsZW0pLmNzcyhhcnJvd0Nzcyk7XHJcbiAgICAgIH1cclxuICAgIH07XHJcbiAgfV0pO1xyXG5cclxuYW5ndWxhci5tb2R1bGUoJ3VpLmJvb3RzdHJhcC5kYXRlcGlja2VyUG9wdXAnLCBbJ3VpLmJvb3RzdHJhcC5kYXRlcGlja2VyJywgJ3VpLmJvb3RzdHJhcC5wb3NpdGlvbiddKVxyXG5cclxuLnZhbHVlKCckZGF0ZXBpY2tlclBvcHVwTGl0ZXJhbFdhcm5pbmcnLCB0cnVlKVxyXG5cclxuLmNvbnN0YW50KCd1aWJEYXRlcGlja2VyUG9wdXBDb25maWcnLCB7XHJcbiAgYWx0SW5wdXRGb3JtYXRzOiBbXSxcclxuICBhcHBlbmRUb0JvZHk6IGZhbHNlLFxyXG4gIGNsZWFyVGV4dDogJ0NsZWFyJyxcclxuICBjbG9zZU9uRGF0ZVNlbGVjdGlvbjogdHJ1ZSxcclxuICBjbG9zZVRleHQ6ICdEb25lJyxcclxuICBjdXJyZW50VGV4dDogJ1RvZGF5JyxcclxuICBkYXRlcGlja2VyUG9wdXA6ICd5eXl5LU1NLWRkJyxcclxuICBkYXRlcGlja2VyUG9wdXBUZW1wbGF0ZVVybDogJ3VpYi90ZW1wbGF0ZS9kYXRlcGlja2VyUG9wdXAvcG9wdXAuaHRtbCcsXHJcbiAgZGF0ZXBpY2tlclRlbXBsYXRlVXJsOiAndWliL3RlbXBsYXRlL2RhdGVwaWNrZXIvZGF0ZXBpY2tlci5odG1sJyxcclxuICBodG1sNVR5cGVzOiB7XHJcbiAgICBkYXRlOiAneXl5eS1NTS1kZCcsXHJcbiAgICAnZGF0ZXRpbWUtbG9jYWwnOiAneXl5eS1NTS1kZFRISDptbTpzcy5zc3MnLFxyXG4gICAgJ21vbnRoJzogJ3l5eXktTU0nXHJcbiAgfSxcclxuICBvbk9wZW5Gb2N1czogdHJ1ZSxcclxuICBzaG93QnV0dG9uQmFyOiB0cnVlLFxyXG4gIHBsYWNlbWVudDogJ2F1dG8gYm90dG9tLWxlZnQnXHJcbn0pXHJcblxyXG4uY29udHJvbGxlcignVWliRGF0ZXBpY2tlclBvcHVwQ29udHJvbGxlcicsIFsnJHNjb3BlJywgJyRlbGVtZW50JywgJyRhdHRycycsICckY29tcGlsZScsICckbG9nJywgJyRwYXJzZScsICckd2luZG93JywgJyRkb2N1bWVudCcsICckcm9vdFNjb3BlJywgJyR1aWJQb3NpdGlvbicsICdkYXRlRmlsdGVyJywgJ3VpYkRhdGVQYXJzZXInLCAndWliRGF0ZXBpY2tlclBvcHVwQ29uZmlnJywgJyR0aW1lb3V0JywgJ3VpYkRhdGVwaWNrZXJDb25maWcnLCAnJGRhdGVwaWNrZXJQb3B1cExpdGVyYWxXYXJuaW5nJyxcclxuZnVuY3Rpb24oJHNjb3BlLCAkZWxlbWVudCwgJGF0dHJzLCAkY29tcGlsZSwgJGxvZywgJHBhcnNlLCAkd2luZG93LCAkZG9jdW1lbnQsICRyb290U2NvcGUsICRwb3NpdGlvbiwgZGF0ZUZpbHRlciwgZGF0ZVBhcnNlciwgZGF0ZXBpY2tlclBvcHVwQ29uZmlnLCAkdGltZW91dCwgZGF0ZXBpY2tlckNvbmZpZywgJGRhdGVwaWNrZXJQb3B1cExpdGVyYWxXYXJuaW5nKSB7XHJcbiAgdmFyIGNhY2hlID0ge30sXHJcbiAgICBpc0h0bWw1RGF0ZUlucHV0ID0gZmFsc2U7XHJcbiAgdmFyIGRhdGVGb3JtYXQsIGNsb3NlT25EYXRlU2VsZWN0aW9uLCBhcHBlbmRUb0JvZHksIG9uT3BlbkZvY3VzLFxyXG4gICAgZGF0ZXBpY2tlclBvcHVwVGVtcGxhdGVVcmwsIGRhdGVwaWNrZXJUZW1wbGF0ZVVybCwgcG9wdXBFbCwgZGF0ZXBpY2tlckVsLCBzY3JvbGxQYXJlbnRFbCxcclxuICAgIG5nTW9kZWwsIG5nTW9kZWxPcHRpb25zLCAkcG9wdXAsIGFsdElucHV0Rm9ybWF0cywgd2F0Y2hMaXN0ZW5lcnMgPSBbXTtcclxuXHJcbiAgdGhpcy5pbml0ID0gZnVuY3Rpb24oX25nTW9kZWxfKSB7XHJcbiAgICBuZ01vZGVsID0gX25nTW9kZWxfO1xyXG4gICAgbmdNb2RlbE9wdGlvbnMgPSBhbmd1bGFyLmlzT2JqZWN0KF9uZ01vZGVsXy4kb3B0aW9ucykgP1xyXG4gICAgICBfbmdNb2RlbF8uJG9wdGlvbnMgOlxyXG4gICAgICB7XHJcbiAgICAgICAgdGltZXpvbmU6IG51bGxcclxuICAgICAgfTtcclxuICAgIGNsb3NlT25EYXRlU2VsZWN0aW9uID0gYW5ndWxhci5pc0RlZmluZWQoJGF0dHJzLmNsb3NlT25EYXRlU2VsZWN0aW9uKSA/XHJcbiAgICAgICRzY29wZS4kcGFyZW50LiRldmFsKCRhdHRycy5jbG9zZU9uRGF0ZVNlbGVjdGlvbikgOlxyXG4gICAgICBkYXRlcGlja2VyUG9wdXBDb25maWcuY2xvc2VPbkRhdGVTZWxlY3Rpb247XHJcbiAgICBhcHBlbmRUb0JvZHkgPSBhbmd1bGFyLmlzRGVmaW5lZCgkYXR0cnMuZGF0ZXBpY2tlckFwcGVuZFRvQm9keSkgP1xyXG4gICAgICAkc2NvcGUuJHBhcmVudC4kZXZhbCgkYXR0cnMuZGF0ZXBpY2tlckFwcGVuZFRvQm9keSkgOlxyXG4gICAgICBkYXRlcGlja2VyUG9wdXBDb25maWcuYXBwZW5kVG9Cb2R5O1xyXG4gICAgb25PcGVuRm9jdXMgPSBhbmd1bGFyLmlzRGVmaW5lZCgkYXR0cnMub25PcGVuRm9jdXMpID9cclxuICAgICAgJHNjb3BlLiRwYXJlbnQuJGV2YWwoJGF0dHJzLm9uT3BlbkZvY3VzKSA6IGRhdGVwaWNrZXJQb3B1cENvbmZpZy5vbk9wZW5Gb2N1cztcclxuICAgIGRhdGVwaWNrZXJQb3B1cFRlbXBsYXRlVXJsID0gYW5ndWxhci5pc0RlZmluZWQoJGF0dHJzLmRhdGVwaWNrZXJQb3B1cFRlbXBsYXRlVXJsKSA/XHJcbiAgICAgICRhdHRycy5kYXRlcGlja2VyUG9wdXBUZW1wbGF0ZVVybCA6XHJcbiAgICAgIGRhdGVwaWNrZXJQb3B1cENvbmZpZy5kYXRlcGlja2VyUG9wdXBUZW1wbGF0ZVVybDtcclxuICAgIGRhdGVwaWNrZXJUZW1wbGF0ZVVybCA9IGFuZ3VsYXIuaXNEZWZpbmVkKCRhdHRycy5kYXRlcGlja2VyVGVtcGxhdGVVcmwpID9cclxuICAgICAgJGF0dHJzLmRhdGVwaWNrZXJUZW1wbGF0ZVVybCA6IGRhdGVwaWNrZXJQb3B1cENvbmZpZy5kYXRlcGlja2VyVGVtcGxhdGVVcmw7XHJcbiAgICBhbHRJbnB1dEZvcm1hdHMgPSBhbmd1bGFyLmlzRGVmaW5lZCgkYXR0cnMuYWx0SW5wdXRGb3JtYXRzKSA/XHJcbiAgICAgICRzY29wZS4kcGFyZW50LiRldmFsKCRhdHRycy5hbHRJbnB1dEZvcm1hdHMpIDpcclxuICAgICAgZGF0ZXBpY2tlclBvcHVwQ29uZmlnLmFsdElucHV0Rm9ybWF0cztcclxuXHJcbiAgICAkc2NvcGUuc2hvd0J1dHRvbkJhciA9IGFuZ3VsYXIuaXNEZWZpbmVkKCRhdHRycy5zaG93QnV0dG9uQmFyKSA/XHJcbiAgICAgICRzY29wZS4kcGFyZW50LiRldmFsKCRhdHRycy5zaG93QnV0dG9uQmFyKSA6XHJcbiAgICAgIGRhdGVwaWNrZXJQb3B1cENvbmZpZy5zaG93QnV0dG9uQmFyO1xyXG5cclxuICAgIGlmIChkYXRlcGlja2VyUG9wdXBDb25maWcuaHRtbDVUeXBlc1skYXR0cnMudHlwZV0pIHtcclxuICAgICAgZGF0ZUZvcm1hdCA9IGRhdGVwaWNrZXJQb3B1cENvbmZpZy5odG1sNVR5cGVzWyRhdHRycy50eXBlXTtcclxuICAgICAgaXNIdG1sNURhdGVJbnB1dCA9IHRydWU7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBkYXRlRm9ybWF0ID0gJGF0dHJzLnVpYkRhdGVwaWNrZXJQb3B1cCB8fCBkYXRlcGlja2VyUG9wdXBDb25maWcuZGF0ZXBpY2tlclBvcHVwO1xyXG4gICAgICAkYXR0cnMuJG9ic2VydmUoJ3VpYkRhdGVwaWNrZXJQb3B1cCcsIGZ1bmN0aW9uKHZhbHVlLCBvbGRWYWx1ZSkge1xyXG4gICAgICAgIHZhciBuZXdEYXRlRm9ybWF0ID0gdmFsdWUgfHwgZGF0ZXBpY2tlclBvcHVwQ29uZmlnLmRhdGVwaWNrZXJQb3B1cDtcclxuICAgICAgICAvLyBJbnZhbGlkYXRlIHRoZSAkbW9kZWxWYWx1ZSB0byBlbnN1cmUgdGhhdCBmb3JtYXR0ZXJzIHJlLXJ1blxyXG4gICAgICAgIC8vIEZJWE1FOiBSZWZhY3RvciB3aGVuIFBSIGlzIG1lcmdlZDogaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvYW5ndWxhci5qcy9wdWxsLzEwNzY0XHJcbiAgICAgICAgaWYgKG5ld0RhdGVGb3JtYXQgIT09IGRhdGVGb3JtYXQpIHtcclxuICAgICAgICAgIGRhdGVGb3JtYXQgPSBuZXdEYXRlRm9ybWF0O1xyXG4gICAgICAgICAgbmdNb2RlbC4kbW9kZWxWYWx1ZSA9IG51bGw7XHJcblxyXG4gICAgICAgICAgaWYgKCFkYXRlRm9ybWF0KSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcigndWliRGF0ZXBpY2tlclBvcHVwIG11c3QgaGF2ZSBhIGRhdGUgZm9ybWF0IHNwZWNpZmllZC4nKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICghZGF0ZUZvcm1hdCkge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ3VpYkRhdGVwaWNrZXJQb3B1cCBtdXN0IGhhdmUgYSBkYXRlIGZvcm1hdCBzcGVjaWZpZWQuJyk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGlzSHRtbDVEYXRlSW5wdXQgJiYgJGF0dHJzLnVpYkRhdGVwaWNrZXJQb3B1cCkge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0hUTUw1IGRhdGUgaW5wdXQgdHlwZXMgZG8gbm90IHN1cHBvcnQgY3VzdG9tIGZvcm1hdHMuJyk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gcG9wdXAgZWxlbWVudCB1c2VkIHRvIGRpc3BsYXkgY2FsZW5kYXJcclxuICAgIHBvcHVwRWwgPSBhbmd1bGFyLmVsZW1lbnQoJzxkaXYgdWliLWRhdGVwaWNrZXItcG9wdXAtd3JhcD48ZGl2IHVpYi1kYXRlcGlja2VyPjwvZGl2PjwvZGl2PicpO1xyXG5cclxuICAgIHBvcHVwRWwuYXR0cih7XHJcbiAgICAgICduZy1tb2RlbCc6ICdkYXRlJyxcclxuICAgICAgJ25nLWNoYW5nZSc6ICdkYXRlU2VsZWN0aW9uKGRhdGUpJyxcclxuICAgICAgJ3RlbXBsYXRlLXVybCc6IGRhdGVwaWNrZXJQb3B1cFRlbXBsYXRlVXJsXHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBkYXRlcGlja2VyIGVsZW1lbnRcclxuICAgIGRhdGVwaWNrZXJFbCA9IGFuZ3VsYXIuZWxlbWVudChwb3B1cEVsLmNoaWxkcmVuKClbMF0pO1xyXG4gICAgZGF0ZXBpY2tlckVsLmF0dHIoJ3RlbXBsYXRlLXVybCcsIGRhdGVwaWNrZXJUZW1wbGF0ZVVybCk7XHJcblxyXG4gICAgaWYgKCEkc2NvcGUuZGF0ZXBpY2tlck9wdGlvbnMpIHtcclxuICAgICAgJHNjb3BlLmRhdGVwaWNrZXJPcHRpb25zID0ge307XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGlzSHRtbDVEYXRlSW5wdXQpIHtcclxuICAgICAgaWYgKCRhdHRycy50eXBlID09PSAnbW9udGgnKSB7XHJcbiAgICAgICAgJHNjb3BlLmRhdGVwaWNrZXJPcHRpb25zLmRhdGVwaWNrZXJNb2RlID0gJ21vbnRoJztcclxuICAgICAgICAkc2NvcGUuZGF0ZXBpY2tlck9wdGlvbnMubWluTW9kZSA9ICdtb250aCc7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBkYXRlcGlja2VyRWwuYXR0cignZGF0ZXBpY2tlci1vcHRpb25zJywgJ2RhdGVwaWNrZXJPcHRpb25zJyk7XHJcblxyXG4gICAgaWYgKCFpc0h0bWw1RGF0ZUlucHV0KSB7XHJcbiAgICAgIC8vIEludGVybmFsIEFQSSB0byBtYWludGFpbiB0aGUgY29ycmVjdCBuZy1pbnZhbGlkLVtrZXldIGNsYXNzXHJcbiAgICAgIG5nTW9kZWwuJCRwYXJzZXJOYW1lID0gJ2RhdGUnO1xyXG4gICAgICBuZ01vZGVsLiR2YWxpZGF0b3JzLmRhdGUgPSB2YWxpZGF0b3I7XHJcbiAgICAgIG5nTW9kZWwuJHBhcnNlcnMudW5zaGlmdChwYXJzZURhdGUpO1xyXG4gICAgICBuZ01vZGVsLiRmb3JtYXR0ZXJzLnB1c2goZnVuY3Rpb24odmFsdWUpIHtcclxuICAgICAgICBpZiAobmdNb2RlbC4kaXNFbXB0eSh2YWx1ZSkpIHtcclxuICAgICAgICAgICRzY29wZS5kYXRlID0gdmFsdWU7XHJcbiAgICAgICAgICByZXR1cm4gdmFsdWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoYW5ndWxhci5pc051bWJlcih2YWx1ZSkpIHtcclxuICAgICAgICAgIHZhbHVlID0gbmV3IERhdGUodmFsdWUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgJHNjb3BlLmRhdGUgPSBkYXRlUGFyc2VyLmZyb21UaW1lem9uZSh2YWx1ZSwgbmdNb2RlbE9wdGlvbnMudGltZXpvbmUpO1xyXG5cclxuICAgICAgICByZXR1cm4gZGF0ZVBhcnNlci5maWx0ZXIoJHNjb3BlLmRhdGUsIGRhdGVGb3JtYXQpO1xyXG4gICAgICB9KTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIG5nTW9kZWwuJGZvcm1hdHRlcnMucHVzaChmdW5jdGlvbih2YWx1ZSkge1xyXG4gICAgICAgICRzY29wZS5kYXRlID0gZGF0ZVBhcnNlci5mcm9tVGltZXpvbmUodmFsdWUsIG5nTW9kZWxPcHRpb25zLnRpbWV6b25lKTtcclxuICAgICAgICByZXR1cm4gdmFsdWU7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIERldGVjdCBjaGFuZ2VzIGluIHRoZSB2aWV3IGZyb20gdGhlIHRleHQgYm94XHJcbiAgICBuZ01vZGVsLiR2aWV3Q2hhbmdlTGlzdGVuZXJzLnB1c2goZnVuY3Rpb24oKSB7XHJcbiAgICAgICRzY29wZS5kYXRlID0gcGFyc2VEYXRlU3RyaW5nKG5nTW9kZWwuJHZpZXdWYWx1ZSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAkZWxlbWVudC5vbigna2V5ZG93bicsIGlucHV0S2V5ZG93bkJpbmQpO1xyXG5cclxuICAgICRwb3B1cCA9ICRjb21waWxlKHBvcHVwRWwpKCRzY29wZSk7XHJcbiAgICAvLyBQcmV2ZW50IGpRdWVyeSBjYWNoZSBtZW1vcnkgbGVhayAodGVtcGxhdGUgaXMgbm93IHJlZHVuZGFudCBhZnRlciBsaW5raW5nKVxyXG4gICAgcG9wdXBFbC5yZW1vdmUoKTtcclxuXHJcbiAgICBpZiAoYXBwZW5kVG9Cb2R5KSB7XHJcbiAgICAgICRkb2N1bWVudC5maW5kKCdib2R5JykuYXBwZW5kKCRwb3B1cCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAkZWxlbWVudC5hZnRlcigkcG9wdXApO1xyXG4gICAgfVxyXG5cclxuICAgICRzY29wZS4kb24oJyRkZXN0cm95JywgZnVuY3Rpb24oKSB7XHJcbiAgICAgIGlmICgkc2NvcGUuaXNPcGVuID09PSB0cnVlKSB7XHJcbiAgICAgICAgaWYgKCEkcm9vdFNjb3BlLiQkcGhhc2UpIHtcclxuICAgICAgICAgICRzY29wZS4kYXBwbHkoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICRzY29wZS5pc09wZW4gPSBmYWxzZTtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgJHBvcHVwLnJlbW92ZSgpO1xyXG4gICAgICAkZWxlbWVudC5vZmYoJ2tleWRvd24nLCBpbnB1dEtleWRvd25CaW5kKTtcclxuICAgICAgJGRvY3VtZW50Lm9mZignY2xpY2snLCBkb2N1bWVudENsaWNrQmluZCk7XHJcbiAgICAgIGlmIChzY3JvbGxQYXJlbnRFbCkge1xyXG4gICAgICAgIHNjcm9sbFBhcmVudEVsLm9mZignc2Nyb2xsJywgcG9zaXRpb25Qb3B1cCk7XHJcbiAgICAgIH1cclxuICAgICAgYW5ndWxhci5lbGVtZW50KCR3aW5kb3cpLm9mZigncmVzaXplJywgcG9zaXRpb25Qb3B1cCk7XHJcblxyXG4gICAgICAvL0NsZWFyIGFsbCB3YXRjaCBsaXN0ZW5lcnMgb24gZGVzdHJveVxyXG4gICAgICB3aGlsZSAod2F0Y2hMaXN0ZW5lcnMubGVuZ3RoKSB7XHJcbiAgICAgICAgd2F0Y2hMaXN0ZW5lcnMuc2hpZnQoKSgpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICB9O1xyXG5cclxuICAkc2NvcGUuZ2V0VGV4dCA9IGZ1bmN0aW9uKGtleSkge1xyXG4gICAgcmV0dXJuICRzY29wZVtrZXkgKyAnVGV4dCddIHx8IGRhdGVwaWNrZXJQb3B1cENvbmZpZ1trZXkgKyAnVGV4dCddO1xyXG4gIH07XHJcblxyXG4gICRzY29wZS5pc0Rpc2FibGVkID0gZnVuY3Rpb24oZGF0ZSkge1xyXG4gICAgaWYgKGRhdGUgPT09ICd0b2RheScpIHtcclxuICAgICAgZGF0ZSA9IGRhdGVQYXJzZXIuZnJvbVRpbWV6b25lKG5ldyBEYXRlKCksIG5nTW9kZWxPcHRpb25zLnRpbWV6b25lKTtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgZGF0ZXMgPSB7fTtcclxuICAgIGFuZ3VsYXIuZm9yRWFjaChbJ21pbkRhdGUnLCAnbWF4RGF0ZSddLCBmdW5jdGlvbihrZXkpIHtcclxuICAgICAgaWYgKCEkc2NvcGUuZGF0ZXBpY2tlck9wdGlvbnNba2V5XSkge1xyXG4gICAgICAgIGRhdGVzW2tleV0gPSBudWxsO1xyXG4gICAgICB9IGVsc2UgaWYgKGFuZ3VsYXIuaXNEYXRlKCRzY29wZS5kYXRlcGlja2VyT3B0aW9uc1trZXldKSkge1xyXG4gICAgICAgIGRhdGVzW2tleV0gPSBuZXcgRGF0ZSgkc2NvcGUuZGF0ZXBpY2tlck9wdGlvbnNba2V5XSk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgaWYgKCRkYXRlcGlja2VyUG9wdXBMaXRlcmFsV2FybmluZykge1xyXG4gICAgICAgICAgJGxvZy53YXJuKCdMaXRlcmFsIGRhdGUgc3VwcG9ydCBoYXMgYmVlbiBkZXByZWNhdGVkLCBwbGVhc2Ugc3dpdGNoIHRvIGRhdGUgb2JqZWN0IHVzYWdlJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBkYXRlc1trZXldID0gbmV3IERhdGUoZGF0ZUZpbHRlcigkc2NvcGUuZGF0ZXBpY2tlck9wdGlvbnNba2V5XSwgJ21lZGl1bScpKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgcmV0dXJuICRzY29wZS5kYXRlcGlja2VyT3B0aW9ucyAmJlxyXG4gICAgICBkYXRlcy5taW5EYXRlICYmICRzY29wZS5jb21wYXJlKGRhdGUsIGRhdGVzLm1pbkRhdGUpIDwgMCB8fFxyXG4gICAgICBkYXRlcy5tYXhEYXRlICYmICRzY29wZS5jb21wYXJlKGRhdGUsIGRhdGVzLm1heERhdGUpID4gMDtcclxuICB9O1xyXG5cclxuICAkc2NvcGUuY29tcGFyZSA9IGZ1bmN0aW9uKGRhdGUxLCBkYXRlMikge1xyXG4gICAgcmV0dXJuIG5ldyBEYXRlKGRhdGUxLmdldEZ1bGxZZWFyKCksIGRhdGUxLmdldE1vbnRoKCksIGRhdGUxLmdldERhdGUoKSkgLSBuZXcgRGF0ZShkYXRlMi5nZXRGdWxsWWVhcigpLCBkYXRlMi5nZXRNb250aCgpLCBkYXRlMi5nZXREYXRlKCkpO1xyXG4gIH07XHJcblxyXG4gIC8vIElubmVyIGNoYW5nZVxyXG4gICRzY29wZS5kYXRlU2VsZWN0aW9uID0gZnVuY3Rpb24oZHQpIHtcclxuICAgICRzY29wZS5kYXRlID0gZHQ7XHJcbiAgICB2YXIgZGF0ZSA9ICRzY29wZS5kYXRlID8gZGF0ZVBhcnNlci5maWx0ZXIoJHNjb3BlLmRhdGUsIGRhdGVGb3JtYXQpIDogbnVsbDsgLy8gU2V0dGluZyB0byBOVUxMIGlzIG5lY2Vzc2FyeSBmb3IgZm9ybSB2YWxpZGF0b3JzIHRvIGZ1bmN0aW9uXHJcbiAgICAkZWxlbWVudC52YWwoZGF0ZSk7XHJcbiAgICBuZ01vZGVsLiRzZXRWaWV3VmFsdWUoZGF0ZSk7XHJcblxyXG4gICAgaWYgKGNsb3NlT25EYXRlU2VsZWN0aW9uKSB7XHJcbiAgICAgICRzY29wZS5pc09wZW4gPSBmYWxzZTtcclxuICAgICAgJGVsZW1lbnRbMF0uZm9jdXMoKTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICAkc2NvcGUua2V5ZG93biA9IGZ1bmN0aW9uKGV2dCkge1xyXG4gICAgaWYgKGV2dC53aGljaCA9PT0gMjcpIHtcclxuICAgICAgZXZ0LnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAkc2NvcGUuaXNPcGVuID0gZmFsc2U7XHJcbiAgICAgICRlbGVtZW50WzBdLmZvY3VzKCk7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgJHNjb3BlLnNlbGVjdCA9IGZ1bmN0aW9uKGRhdGUsIGV2dCkge1xyXG4gICAgZXZ0LnN0b3BQcm9wYWdhdGlvbigpO1xyXG5cclxuICAgIGlmIChkYXRlID09PSAndG9kYXknKSB7XHJcbiAgICAgIHZhciB0b2RheSA9IG5ldyBEYXRlKCk7XHJcbiAgICAgIGlmIChhbmd1bGFyLmlzRGF0ZSgkc2NvcGUuZGF0ZSkpIHtcclxuICAgICAgICBkYXRlID0gbmV3IERhdGUoJHNjb3BlLmRhdGUpO1xyXG4gICAgICAgIGRhdGUuc2V0RnVsbFllYXIodG9kYXkuZ2V0RnVsbFllYXIoKSwgdG9kYXkuZ2V0TW9udGgoKSwgdG9kYXkuZ2V0RGF0ZSgpKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBkYXRlID0gZGF0ZVBhcnNlci5mcm9tVGltZXpvbmUodG9kYXksIG5nTW9kZWxPcHRpb25zLnRpbWV6b25lKTtcclxuICAgICAgICBkYXRlLnNldEhvdXJzKDAsIDAsIDAsIDApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICAkc2NvcGUuZGF0ZVNlbGVjdGlvbihkYXRlKTtcclxuICB9O1xyXG5cclxuICAkc2NvcGUuY2xvc2UgPSBmdW5jdGlvbihldnQpIHtcclxuICAgIGV2dC5zdG9wUHJvcGFnYXRpb24oKTtcclxuXHJcbiAgICAkc2NvcGUuaXNPcGVuID0gZmFsc2U7XHJcbiAgICAkZWxlbWVudFswXS5mb2N1cygpO1xyXG4gIH07XHJcblxyXG4gICRzY29wZS5kaXNhYmxlZCA9IGFuZ3VsYXIuaXNEZWZpbmVkKCRhdHRycy5kaXNhYmxlZCkgfHwgZmFsc2U7XHJcbiAgaWYgKCRhdHRycy5uZ0Rpc2FibGVkKSB7XHJcbiAgICB3YXRjaExpc3RlbmVycy5wdXNoKCRzY29wZS4kcGFyZW50LiR3YXRjaCgkcGFyc2UoJGF0dHJzLm5nRGlzYWJsZWQpLCBmdW5jdGlvbihkaXNhYmxlZCkge1xyXG4gICAgICAkc2NvcGUuZGlzYWJsZWQgPSBkaXNhYmxlZDtcclxuICAgIH0pKTtcclxuICB9XHJcblxyXG4gICRzY29wZS4kd2F0Y2goJ2lzT3BlbicsIGZ1bmN0aW9uKHZhbHVlKSB7XHJcbiAgICBpZiAodmFsdWUpIHtcclxuICAgICAgaWYgKCEkc2NvcGUuZGlzYWJsZWQpIHtcclxuICAgICAgICAkdGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgICAgIHBvc2l0aW9uUG9wdXAoKTtcclxuXHJcbiAgICAgICAgICBpZiAob25PcGVuRm9jdXMpIHtcclxuICAgICAgICAgICAgJHNjb3BlLiRicm9hZGNhc3QoJ3VpYjpkYXRlcGlja2VyLmZvY3VzJyk7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgJGRvY3VtZW50Lm9uKCdjbGljaycsIGRvY3VtZW50Q2xpY2tCaW5kKTtcclxuXHJcbiAgICAgICAgICB2YXIgcGxhY2VtZW50ID0gJGF0dHJzLnBvcHVwUGxhY2VtZW50ID8gJGF0dHJzLnBvcHVwUGxhY2VtZW50IDogZGF0ZXBpY2tlclBvcHVwQ29uZmlnLnBsYWNlbWVudDtcclxuICAgICAgICAgIGlmIChhcHBlbmRUb0JvZHkgfHwgJHBvc2l0aW9uLnBhcnNlUGxhY2VtZW50KHBsYWNlbWVudClbMl0pIHtcclxuICAgICAgICAgICAgc2Nyb2xsUGFyZW50RWwgPSBzY3JvbGxQYXJlbnRFbCB8fCBhbmd1bGFyLmVsZW1lbnQoJHBvc2l0aW9uLnNjcm9sbFBhcmVudCgkZWxlbWVudCkpO1xyXG4gICAgICAgICAgICBpZiAoc2Nyb2xsUGFyZW50RWwpIHtcclxuICAgICAgICAgICAgICBzY3JvbGxQYXJlbnRFbC5vbignc2Nyb2xsJywgcG9zaXRpb25Qb3B1cCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHNjcm9sbFBhcmVudEVsID0gbnVsbDtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBhbmd1bGFyLmVsZW1lbnQoJHdpbmRvdykub24oJ3Jlc2l6ZScsIHBvc2l0aW9uUG9wdXApO1xyXG4gICAgICAgIH0sIDAsIGZhbHNlKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICAkc2NvcGUuaXNPcGVuID0gZmFsc2U7XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICRkb2N1bWVudC5vZmYoJ2NsaWNrJywgZG9jdW1lbnRDbGlja0JpbmQpO1xyXG4gICAgICBpZiAoc2Nyb2xsUGFyZW50RWwpIHtcclxuICAgICAgICBzY3JvbGxQYXJlbnRFbC5vZmYoJ3Njcm9sbCcsIHBvc2l0aW9uUG9wdXApO1xyXG4gICAgICB9XHJcbiAgICAgIGFuZ3VsYXIuZWxlbWVudCgkd2luZG93KS5vZmYoJ3Jlc2l6ZScsIHBvc2l0aW9uUG9wdXApO1xyXG4gICAgfVxyXG4gIH0pO1xyXG5cclxuICBmdW5jdGlvbiBjYW1lbHRvRGFzaChzdHJpbmcpIHtcclxuICAgIHJldHVybiBzdHJpbmcucmVwbGFjZSgvKFtBLVpdKS9nLCBmdW5jdGlvbigkMSkgeyByZXR1cm4gJy0nICsgJDEudG9Mb3dlckNhc2UoKTsgfSk7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBwYXJzZURhdGVTdHJpbmcodmlld1ZhbHVlKSB7XHJcbiAgICB2YXIgZGF0ZSA9IGRhdGVQYXJzZXIucGFyc2Uodmlld1ZhbHVlLCBkYXRlRm9ybWF0LCAkc2NvcGUuZGF0ZSk7XHJcbiAgICBpZiAoaXNOYU4oZGF0ZSkpIHtcclxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhbHRJbnB1dEZvcm1hdHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBkYXRlID0gZGF0ZVBhcnNlci5wYXJzZSh2aWV3VmFsdWUsIGFsdElucHV0Rm9ybWF0c1tpXSwgJHNjb3BlLmRhdGUpO1xyXG4gICAgICAgIGlmICghaXNOYU4oZGF0ZSkpIHtcclxuICAgICAgICAgIHJldHVybiBkYXRlO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIGRhdGU7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBwYXJzZURhdGUodmlld1ZhbHVlKSB7XHJcbiAgICBpZiAoYW5ndWxhci5pc051bWJlcih2aWV3VmFsdWUpKSB7XHJcbiAgICAgIC8vIHByZXN1bWFibHkgdGltZXN0YW1wIHRvIGRhdGUgb2JqZWN0XHJcbiAgICAgIHZpZXdWYWx1ZSA9IG5ldyBEYXRlKHZpZXdWYWx1ZSk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCF2aWV3VmFsdWUpIHtcclxuICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGFuZ3VsYXIuaXNEYXRlKHZpZXdWYWx1ZSkgJiYgIWlzTmFOKHZpZXdWYWx1ZSkpIHtcclxuICAgICAgcmV0dXJuIHZpZXdWYWx1ZTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoYW5ndWxhci5pc1N0cmluZyh2aWV3VmFsdWUpKSB7XHJcbiAgICAgIHZhciBkYXRlID0gcGFyc2VEYXRlU3RyaW5nKHZpZXdWYWx1ZSk7XHJcbiAgICAgIGlmICghaXNOYU4oZGF0ZSkpIHtcclxuICAgICAgICByZXR1cm4gZGF0ZVBhcnNlci5mcm9tVGltZXpvbmUoZGF0ZSwgbmdNb2RlbE9wdGlvbnMudGltZXpvbmUpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIG5nTW9kZWwuJG9wdGlvbnMgJiYgbmdNb2RlbC4kb3B0aW9ucy5hbGxvd0ludmFsaWQgPyB2aWV3VmFsdWUgOiB1bmRlZmluZWQ7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiB2YWxpZGF0b3IobW9kZWxWYWx1ZSwgdmlld1ZhbHVlKSB7XHJcbiAgICB2YXIgdmFsdWUgPSBtb2RlbFZhbHVlIHx8IHZpZXdWYWx1ZTtcclxuXHJcbiAgICBpZiAoISRhdHRycy5uZ1JlcXVpcmVkICYmICF2YWx1ZSkge1xyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoYW5ndWxhci5pc051bWJlcih2YWx1ZSkpIHtcclxuICAgICAgdmFsdWUgPSBuZXcgRGF0ZSh2YWx1ZSk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCF2YWx1ZSkge1xyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoYW5ndWxhci5pc0RhdGUodmFsdWUpICYmICFpc05hTih2YWx1ZSkpIHtcclxuICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGFuZ3VsYXIuaXNTdHJpbmcodmFsdWUpKSB7XHJcbiAgICAgIHJldHVybiAhaXNOYU4ocGFyc2VEYXRlU3RyaW5nKHZhbHVlKSk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gZG9jdW1lbnRDbGlja0JpbmQoZXZlbnQpIHtcclxuICAgIGlmICghJHNjb3BlLmlzT3BlbiAmJiAkc2NvcGUuZGlzYWJsZWQpIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBwb3B1cCA9ICRwb3B1cFswXTtcclxuICAgIHZhciBkcENvbnRhaW5zVGFyZ2V0ID0gJGVsZW1lbnRbMF0uY29udGFpbnMoZXZlbnQudGFyZ2V0KTtcclxuICAgIC8vIFRoZSBwb3B1cCBub2RlIG1heSBub3QgYmUgYW4gZWxlbWVudCBub2RlXHJcbiAgICAvLyBJbiBzb21lIGJyb3dzZXJzIChJRSkgb25seSBlbGVtZW50IG5vZGVzIGhhdmUgdGhlICdjb250YWlucycgZnVuY3Rpb25cclxuICAgIHZhciBwb3B1cENvbnRhaW5zVGFyZ2V0ID0gcG9wdXAuY29udGFpbnMgIT09IHVuZGVmaW5lZCAmJiBwb3B1cC5jb250YWlucyhldmVudC50YXJnZXQpO1xyXG4gICAgaWYgKCRzY29wZS5pc09wZW4gJiYgIShkcENvbnRhaW5zVGFyZ2V0IHx8IHBvcHVwQ29udGFpbnNUYXJnZXQpKSB7XHJcbiAgICAgICRzY29wZS4kYXBwbHkoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgJHNjb3BlLmlzT3BlbiA9IGZhbHNlO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGlucHV0S2V5ZG93bkJpbmQoZXZ0KSB7XHJcbiAgICBpZiAoZXZ0LndoaWNoID09PSAyNyAmJiAkc2NvcGUuaXNPcGVuKSB7XHJcbiAgICAgIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICBldnQuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICRzY29wZS4kYXBwbHkoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgJHNjb3BlLmlzT3BlbiA9IGZhbHNlO1xyXG4gICAgICB9KTtcclxuICAgICAgJGVsZW1lbnRbMF0uZm9jdXMoKTtcclxuICAgIH0gZWxzZSBpZiAoZXZ0LndoaWNoID09PSA0MCAmJiAhJHNjb3BlLmlzT3Blbikge1xyXG4gICAgICBldnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgZXZ0LnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAkc2NvcGUuJGFwcGx5KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICRzY29wZS5pc09wZW4gPSB0cnVlO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHBvc2l0aW9uUG9wdXAoKSB7XHJcbiAgICBpZiAoJHNjb3BlLmlzT3Blbikge1xyXG4gICAgICB2YXIgZHBFbGVtZW50ID0gYW5ndWxhci5lbGVtZW50KCRwb3B1cFswXS5xdWVyeVNlbGVjdG9yKCcudWliLWRhdGVwaWNrZXItcG9wdXAnKSk7XHJcbiAgICAgIHZhciBwbGFjZW1lbnQgPSAkYXR0cnMucG9wdXBQbGFjZW1lbnQgPyAkYXR0cnMucG9wdXBQbGFjZW1lbnQgOiBkYXRlcGlja2VyUG9wdXBDb25maWcucGxhY2VtZW50O1xyXG4gICAgICB2YXIgcG9zaXRpb24gPSAkcG9zaXRpb24ucG9zaXRpb25FbGVtZW50cygkZWxlbWVudCwgZHBFbGVtZW50LCBwbGFjZW1lbnQsIGFwcGVuZFRvQm9keSk7XHJcbiAgICAgIGRwRWxlbWVudC5jc3Moe3RvcDogcG9zaXRpb24udG9wICsgJ3B4JywgbGVmdDogcG9zaXRpb24ubGVmdCArICdweCd9KTtcclxuICAgICAgaWYgKGRwRWxlbWVudC5oYXNDbGFzcygndWliLXBvc2l0aW9uLW1lYXN1cmUnKSkge1xyXG4gICAgICAgIGRwRWxlbWVudC5yZW1vdmVDbGFzcygndWliLXBvc2l0aW9uLW1lYXN1cmUnKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgJHNjb3BlLiRvbigndWliOmRhdGVwaWNrZXIubW9kZScsIGZ1bmN0aW9uKCkge1xyXG4gICAgJHRpbWVvdXQocG9zaXRpb25Qb3B1cCwgMCwgZmFsc2UpO1xyXG4gIH0pO1xyXG59XSlcclxuXHJcbi5kaXJlY3RpdmUoJ3VpYkRhdGVwaWNrZXJQb3B1cCcsIGZ1bmN0aW9uKCkge1xyXG4gIHJldHVybiB7XHJcbiAgICByZXF1aXJlOiBbJ25nTW9kZWwnLCAndWliRGF0ZXBpY2tlclBvcHVwJ10sXHJcbiAgICBjb250cm9sbGVyOiAnVWliRGF0ZXBpY2tlclBvcHVwQ29udHJvbGxlcicsXHJcbiAgICBzY29wZToge1xyXG4gICAgICBkYXRlcGlja2VyT3B0aW9uczogJz0/JyxcclxuICAgICAgaXNPcGVuOiAnPT8nLFxyXG4gICAgICBjdXJyZW50VGV4dDogJ0AnLFxyXG4gICAgICBjbGVhclRleHQ6ICdAJyxcclxuICAgICAgY2xvc2VUZXh0OiAnQCdcclxuICAgIH0sXHJcbiAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxlbWVudCwgYXR0cnMsIGN0cmxzKSB7XHJcbiAgICAgIHZhciBuZ01vZGVsID0gY3RybHNbMF0sXHJcbiAgICAgICAgY3RybCA9IGN0cmxzWzFdO1xyXG5cclxuICAgICAgY3RybC5pbml0KG5nTW9kZWwpO1xyXG4gICAgfVxyXG4gIH07XHJcbn0pXHJcblxyXG4uZGlyZWN0aXZlKCd1aWJEYXRlcGlja2VyUG9wdXBXcmFwJywgZnVuY3Rpb24oKSB7XHJcbiAgcmV0dXJuIHtcclxuICAgIHJlc3RyaWN0OiAnQScsXHJcbiAgICB0cmFuc2NsdWRlOiB0cnVlLFxyXG4gICAgdGVtcGxhdGVVcmw6IGZ1bmN0aW9uKGVsZW1lbnQsIGF0dHJzKSB7XHJcbiAgICAgIHJldHVybiBhdHRycy50ZW1wbGF0ZVVybCB8fCAndWliL3RlbXBsYXRlL2RhdGVwaWNrZXJQb3B1cC9wb3B1cC5odG1sJztcclxuICAgIH1cclxuICB9O1xyXG59KTtcclxuXHJcbmFuZ3VsYXIubW9kdWxlKCd1aS5ib290c3RyYXAuZGVib3VuY2UnLCBbXSlcclxuLyoqXHJcbiAqIEEgaGVscGVyLCBpbnRlcm5hbCBzZXJ2aWNlIHRoYXQgZGVib3VuY2VzIGEgZnVuY3Rpb25cclxuICovXHJcbiAgLmZhY3RvcnkoJyQkZGVib3VuY2UnLCBbJyR0aW1lb3V0JywgZnVuY3Rpb24oJHRpbWVvdXQpIHtcclxuICAgIHJldHVybiBmdW5jdGlvbihjYWxsYmFjaywgZGVib3VuY2VUaW1lKSB7XHJcbiAgICAgIHZhciB0aW1lb3V0UHJvbWlzZTtcclxuXHJcbiAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XHJcbiAgICAgICAgdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpO1xyXG4gICAgICAgIGlmICh0aW1lb3V0UHJvbWlzZSkge1xyXG4gICAgICAgICAgJHRpbWVvdXQuY2FuY2VsKHRpbWVvdXRQcm9taXNlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRpbWVvdXRQcm9taXNlID0gJHRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICBjYWxsYmFjay5hcHBseShzZWxmLCBhcmdzKTtcclxuICAgICAgICB9LCBkZWJvdW5jZVRpbWUpO1xyXG4gICAgICB9O1xyXG4gICAgfTtcclxuICB9XSk7XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgndWkuYm9vdHN0cmFwLmRyb3Bkb3duJywgWyd1aS5ib290c3RyYXAucG9zaXRpb24nXSlcclxuXHJcbi5jb25zdGFudCgndWliRHJvcGRvd25Db25maWcnLCB7XHJcbiAgYXBwZW5kVG9PcGVuQ2xhc3M6ICd1aWItZHJvcGRvd24tb3BlbicsXHJcbiAgb3BlbkNsYXNzOiAnb3BlbidcclxufSlcclxuXHJcbi5zZXJ2aWNlKCd1aWJEcm9wZG93blNlcnZpY2UnLCBbJyRkb2N1bWVudCcsICckcm9vdFNjb3BlJywgZnVuY3Rpb24oJGRvY3VtZW50LCAkcm9vdFNjb3BlKSB7XHJcbiAgdmFyIG9wZW5TY29wZSA9IG51bGw7XHJcblxyXG4gIHRoaXMub3BlbiA9IGZ1bmN0aW9uKGRyb3Bkb3duU2NvcGUsIGVsZW1lbnQpIHtcclxuICAgIGlmICghb3BlblNjb3BlKSB7XHJcbiAgICAgICRkb2N1bWVudC5vbignY2xpY2snLCBjbG9zZURyb3Bkb3duKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAob3BlblNjb3BlICYmIG9wZW5TY29wZSAhPT0gZHJvcGRvd25TY29wZSkge1xyXG4gICAgICBvcGVuU2NvcGUuaXNPcGVuID0gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgb3BlblNjb3BlID0gZHJvcGRvd25TY29wZTtcclxuICB9O1xyXG5cclxuICB0aGlzLmNsb3NlID0gZnVuY3Rpb24oZHJvcGRvd25TY29wZSwgZWxlbWVudCkge1xyXG4gICAgaWYgKG9wZW5TY29wZSA9PT0gZHJvcGRvd25TY29wZSkge1xyXG4gICAgICBvcGVuU2NvcGUgPSBudWxsO1xyXG4gICAgICAkZG9jdW1lbnQub2ZmKCdjbGljaycsIGNsb3NlRHJvcGRvd24pO1xyXG4gICAgICAkZG9jdW1lbnQub2ZmKCdrZXlkb3duJywgdGhpcy5rZXliaW5kRmlsdGVyKTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICB2YXIgY2xvc2VEcm9wZG93biA9IGZ1bmN0aW9uKGV2dCkge1xyXG4gICAgLy8gVGhpcyBtZXRob2QgbWF5IHN0aWxsIGJlIGNhbGxlZCBkdXJpbmcgdGhlIHNhbWUgbW91c2UgZXZlbnQgdGhhdFxyXG4gICAgLy8gdW5ib3VuZCB0aGlzIGV2ZW50IGhhbmRsZXIuIFNvIGNoZWNrIG9wZW5TY29wZSBiZWZvcmUgcHJvY2VlZGluZy5cclxuICAgIGlmICghb3BlblNjb3BlKSB7IHJldHVybjsgfVxyXG5cclxuICAgIGlmIChldnQgJiYgb3BlblNjb3BlLmdldEF1dG9DbG9zZSgpID09PSAnZGlzYWJsZWQnKSB7IHJldHVybjsgfVxyXG5cclxuICAgIGlmIChldnQgJiYgZXZ0LndoaWNoID09PSAzKSB7IHJldHVybjsgfVxyXG5cclxuICAgIHZhciB0b2dnbGVFbGVtZW50ID0gb3BlblNjb3BlLmdldFRvZ2dsZUVsZW1lbnQoKTtcclxuICAgIGlmIChldnQgJiYgdG9nZ2xlRWxlbWVudCAmJiB0b2dnbGVFbGVtZW50WzBdLmNvbnRhaW5zKGV2dC50YXJnZXQpKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgZHJvcGRvd25FbGVtZW50ID0gb3BlblNjb3BlLmdldERyb3Bkb3duRWxlbWVudCgpO1xyXG4gICAgaWYgKGV2dCAmJiBvcGVuU2NvcGUuZ2V0QXV0b0Nsb3NlKCkgPT09ICdvdXRzaWRlQ2xpY2snICYmXHJcbiAgICAgIGRyb3Bkb3duRWxlbWVudCAmJiBkcm9wZG93bkVsZW1lbnRbMF0uY29udGFpbnMoZXZ0LnRhcmdldCkpIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIG9wZW5TY29wZS5pc09wZW4gPSBmYWxzZTtcclxuICAgIG9wZW5TY29wZS5mb2N1c1RvZ2dsZUVsZW1lbnQoKTtcclxuXHJcbiAgICBpZiAoISRyb290U2NvcGUuJCRwaGFzZSkge1xyXG4gICAgICBvcGVuU2NvcGUuJGFwcGx5KCk7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgdGhpcy5rZXliaW5kRmlsdGVyID0gZnVuY3Rpb24oZXZ0KSB7XHJcbiAgICB2YXIgZHJvcGRvd25FbGVtZW50ID0gb3BlblNjb3BlLmdldERyb3Bkb3duRWxlbWVudCgpO1xyXG4gICAgdmFyIHRvZ2dsZUVsZW1lbnQgPSBvcGVuU2NvcGUuZ2V0VG9nZ2xlRWxlbWVudCgpO1xyXG4gICAgdmFyIGRyb3Bkb3duRWxlbWVudFRhcmdldGVkID0gZHJvcGRvd25FbGVtZW50ICYmIGRyb3Bkb3duRWxlbWVudFswXS5jb250YWlucyhldnQudGFyZ2V0KTtcclxuICAgIHZhciB0b2dnbGVFbGVtZW50VGFyZ2V0ZWQgPSB0b2dnbGVFbGVtZW50ICYmIHRvZ2dsZUVsZW1lbnRbMF0uY29udGFpbnMoZXZ0LnRhcmdldCk7XHJcbiAgICBpZiAoZXZ0LndoaWNoID09PSAyNykge1xyXG4gICAgICBldnQuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgIG9wZW5TY29wZS5mb2N1c1RvZ2dsZUVsZW1lbnQoKTtcclxuICAgICAgY2xvc2VEcm9wZG93bigpO1xyXG4gICAgfSBlbHNlIGlmIChvcGVuU2NvcGUuaXNLZXluYXZFbmFibGVkKCkgJiYgWzM4LCA0MF0uaW5kZXhPZihldnQud2hpY2gpICE9PSAtMSAmJiBvcGVuU2NvcGUuaXNPcGVuICYmIChkcm9wZG93bkVsZW1lbnRUYXJnZXRlZCB8fCB0b2dnbGVFbGVtZW50VGFyZ2V0ZWQpKSB7XHJcbiAgICAgIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICBldnQuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgIG9wZW5TY29wZS5mb2N1c0Ryb3Bkb3duRW50cnkoZXZ0LndoaWNoKTtcclxuICAgIH1cclxuICB9O1xyXG59XSlcclxuXHJcbi5jb250cm9sbGVyKCdVaWJEcm9wZG93bkNvbnRyb2xsZXInLCBbJyRzY29wZScsICckZWxlbWVudCcsICckYXR0cnMnLCAnJHBhcnNlJywgJ3VpYkRyb3Bkb3duQ29uZmlnJywgJ3VpYkRyb3Bkb3duU2VydmljZScsICckYW5pbWF0ZScsICckdWliUG9zaXRpb24nLCAnJGRvY3VtZW50JywgJyRjb21waWxlJywgJyR0ZW1wbGF0ZVJlcXVlc3QnLCBmdW5jdGlvbigkc2NvcGUsICRlbGVtZW50LCAkYXR0cnMsICRwYXJzZSwgZHJvcGRvd25Db25maWcsIHVpYkRyb3Bkb3duU2VydmljZSwgJGFuaW1hdGUsICRwb3NpdGlvbiwgJGRvY3VtZW50LCAkY29tcGlsZSwgJHRlbXBsYXRlUmVxdWVzdCkge1xyXG4gIHZhciBzZWxmID0gdGhpcyxcclxuICAgIHNjb3BlID0gJHNjb3BlLiRuZXcoKSwgLy8gY3JlYXRlIGEgY2hpbGQgc2NvcGUgc28gd2UgYXJlIG5vdCBwb2xsdXRpbmcgb3JpZ2luYWwgb25lXHJcbiAgICB0ZW1wbGF0ZVNjb3BlLFxyXG4gICAgYXBwZW5kVG9PcGVuQ2xhc3MgPSBkcm9wZG93bkNvbmZpZy5hcHBlbmRUb09wZW5DbGFzcyxcclxuICAgIG9wZW5DbGFzcyA9IGRyb3Bkb3duQ29uZmlnLm9wZW5DbGFzcyxcclxuICAgIGdldElzT3BlbixcclxuICAgIHNldElzT3BlbiA9IGFuZ3VsYXIubm9vcCxcclxuICAgIHRvZ2dsZUludm9rZXIgPSAkYXR0cnMub25Ub2dnbGUgPyAkcGFyc2UoJGF0dHJzLm9uVG9nZ2xlKSA6IGFuZ3VsYXIubm9vcCxcclxuICAgIGFwcGVuZFRvQm9keSA9IGZhbHNlLFxyXG4gICAgYXBwZW5kVG8gPSBudWxsLFxyXG4gICAga2V5bmF2RW5hYmxlZCA9IGZhbHNlLFxyXG4gICAgc2VsZWN0ZWRPcHRpb24gPSBudWxsLFxyXG4gICAgYm9keSA9ICRkb2N1bWVudC5maW5kKCdib2R5Jyk7XHJcblxyXG4gICRlbGVtZW50LmFkZENsYXNzKCdkcm9wZG93bicpO1xyXG5cclxuICB0aGlzLmluaXQgPSBmdW5jdGlvbigpIHtcclxuICAgIGlmICgkYXR0cnMuaXNPcGVuKSB7XHJcbiAgICAgIGdldElzT3BlbiA9ICRwYXJzZSgkYXR0cnMuaXNPcGVuKTtcclxuICAgICAgc2V0SXNPcGVuID0gZ2V0SXNPcGVuLmFzc2lnbjtcclxuXHJcbiAgICAgICRzY29wZS4kd2F0Y2goZ2V0SXNPcGVuLCBmdW5jdGlvbih2YWx1ZSkge1xyXG4gICAgICAgIHNjb3BlLmlzT3BlbiA9ICEhdmFsdWU7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChhbmd1bGFyLmlzRGVmaW5lZCgkYXR0cnMuZHJvcGRvd25BcHBlbmRUbykpIHtcclxuICAgICAgdmFyIGFwcGVuZFRvRWwgPSAkcGFyc2UoJGF0dHJzLmRyb3Bkb3duQXBwZW5kVG8pKHNjb3BlKTtcclxuICAgICAgaWYgKGFwcGVuZFRvRWwpIHtcclxuICAgICAgICBhcHBlbmRUbyA9IGFuZ3VsYXIuZWxlbWVudChhcHBlbmRUb0VsKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGFwcGVuZFRvQm9keSA9IGFuZ3VsYXIuaXNEZWZpbmVkKCRhdHRycy5kcm9wZG93bkFwcGVuZFRvQm9keSk7XHJcbiAgICBrZXluYXZFbmFibGVkID0gYW5ndWxhci5pc0RlZmluZWQoJGF0dHJzLmtleWJvYXJkTmF2KTtcclxuXHJcbiAgICBpZiAoYXBwZW5kVG9Cb2R5ICYmICFhcHBlbmRUbykge1xyXG4gICAgICBhcHBlbmRUbyA9IGJvZHk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGFwcGVuZFRvICYmIHNlbGYuZHJvcGRvd25NZW51KSB7XHJcbiAgICAgIGFwcGVuZFRvLmFwcGVuZChzZWxmLmRyb3Bkb3duTWVudSk7XHJcbiAgICAgICRlbGVtZW50Lm9uKCckZGVzdHJveScsIGZ1bmN0aW9uIGhhbmRsZURlc3Ryb3lFdmVudCgpIHtcclxuICAgICAgICBzZWxmLmRyb3Bkb3duTWVudS5yZW1vdmUoKTtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgdGhpcy50b2dnbGUgPSBmdW5jdGlvbihvcGVuKSB7XHJcbiAgICBzY29wZS5pc09wZW4gPSBhcmd1bWVudHMubGVuZ3RoID8gISFvcGVuIDogIXNjb3BlLmlzT3BlbjtcclxuICAgIGlmIChhbmd1bGFyLmlzRnVuY3Rpb24oc2V0SXNPcGVuKSkge1xyXG4gICAgICBzZXRJc09wZW4oc2NvcGUsIHNjb3BlLmlzT3Blbik7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHNjb3BlLmlzT3BlbjtcclxuICB9O1xyXG5cclxuICAvLyBBbGxvdyBvdGhlciBkaXJlY3RpdmVzIHRvIHdhdGNoIHN0YXR1c1xyXG4gIHRoaXMuaXNPcGVuID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gc2NvcGUuaXNPcGVuO1xyXG4gIH07XHJcblxyXG4gIHNjb3BlLmdldFRvZ2dsZUVsZW1lbnQgPSBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiBzZWxmLnRvZ2dsZUVsZW1lbnQ7XHJcbiAgfTtcclxuXHJcbiAgc2NvcGUuZ2V0QXV0b0Nsb3NlID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gJGF0dHJzLmF1dG9DbG9zZSB8fCAnYWx3YXlzJzsgLy9vciAnb3V0c2lkZUNsaWNrJyBvciAnZGlzYWJsZWQnXHJcbiAgfTtcclxuXHJcbiAgc2NvcGUuZ2V0RWxlbWVudCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuICRlbGVtZW50O1xyXG4gIH07XHJcblxyXG4gIHNjb3BlLmlzS2V5bmF2RW5hYmxlZCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIGtleW5hdkVuYWJsZWQ7XHJcbiAgfTtcclxuXHJcbiAgc2NvcGUuZm9jdXNEcm9wZG93bkVudHJ5ID0gZnVuY3Rpb24oa2V5Q29kZSkge1xyXG4gICAgdmFyIGVsZW1zID0gc2VsZi5kcm9wZG93bk1lbnUgPyAvL0lmIGFwcGVuZCB0byBib2R5IGlzIHVzZWQuXHJcbiAgICAgIGFuZ3VsYXIuZWxlbWVudChzZWxmLmRyb3Bkb3duTWVudSkuZmluZCgnYScpIDpcclxuICAgICAgJGVsZW1lbnQuZmluZCgndWwnKS5lcSgwKS5maW5kKCdhJyk7XHJcblxyXG4gICAgc3dpdGNoIChrZXlDb2RlKSB7XHJcbiAgICAgIGNhc2UgNDA6IHtcclxuICAgICAgICBpZiAoIWFuZ3VsYXIuaXNOdW1iZXIoc2VsZi5zZWxlY3RlZE9wdGlvbikpIHtcclxuICAgICAgICAgIHNlbGYuc2VsZWN0ZWRPcHRpb24gPSAwO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBzZWxmLnNlbGVjdGVkT3B0aW9uID0gc2VsZi5zZWxlY3RlZE9wdGlvbiA9PT0gZWxlbXMubGVuZ3RoIC0gMSA/XHJcbiAgICAgICAgICAgIHNlbGYuc2VsZWN0ZWRPcHRpb24gOlxyXG4gICAgICAgICAgICBzZWxmLnNlbGVjdGVkT3B0aW9uICsgMTtcclxuICAgICAgICB9XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgICAgY2FzZSAzODoge1xyXG4gICAgICAgIGlmICghYW5ndWxhci5pc051bWJlcihzZWxmLnNlbGVjdGVkT3B0aW9uKSkge1xyXG4gICAgICAgICAgc2VsZi5zZWxlY3RlZE9wdGlvbiA9IGVsZW1zLmxlbmd0aCAtIDE7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHNlbGYuc2VsZWN0ZWRPcHRpb24gPSBzZWxmLnNlbGVjdGVkT3B0aW9uID09PSAwID9cclxuICAgICAgICAgICAgMCA6IHNlbGYuc2VsZWN0ZWRPcHRpb24gLSAxO1xyXG4gICAgICAgIH1cclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgZWxlbXNbc2VsZi5zZWxlY3RlZE9wdGlvbl0uZm9jdXMoKTtcclxuICB9O1xyXG5cclxuICBzY29wZS5nZXREcm9wZG93bkVsZW1lbnQgPSBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiBzZWxmLmRyb3Bkb3duTWVudTtcclxuICB9O1xyXG5cclxuICBzY29wZS5mb2N1c1RvZ2dsZUVsZW1lbnQgPSBmdW5jdGlvbigpIHtcclxuICAgIGlmIChzZWxmLnRvZ2dsZUVsZW1lbnQpIHtcclxuICAgICAgc2VsZi50b2dnbGVFbGVtZW50WzBdLmZvY3VzKCk7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgc2NvcGUuJHdhdGNoKCdpc09wZW4nLCBmdW5jdGlvbihpc09wZW4sIHdhc09wZW4pIHtcclxuICAgIGlmIChhcHBlbmRUbyAmJiBzZWxmLmRyb3Bkb3duTWVudSkge1xyXG4gICAgICB2YXIgcG9zID0gJHBvc2l0aW9uLnBvc2l0aW9uRWxlbWVudHMoJGVsZW1lbnQsIHNlbGYuZHJvcGRvd25NZW51LCAnYm90dG9tLWxlZnQnLCB0cnVlKSxcclxuICAgICAgICBjc3MsXHJcbiAgICAgICAgcmlnaHRhbGlnbixcclxuICAgICAgICBzY3JvbGxiYXJQYWRkaW5nLFxyXG4gICAgICAgIHNjcm9sbGJhcldpZHRoID0gMDtcclxuXHJcbiAgICAgIGNzcyA9IHtcclxuICAgICAgICB0b3A6IHBvcy50b3AgKyAncHgnLFxyXG4gICAgICAgIGRpc3BsYXk6IGlzT3BlbiA/ICdibG9jaycgOiAnbm9uZSdcclxuICAgICAgfTtcclxuXHJcbiAgICAgIHJpZ2h0YWxpZ24gPSBzZWxmLmRyb3Bkb3duTWVudS5oYXNDbGFzcygnZHJvcGRvd24tbWVudS1yaWdodCcpO1xyXG4gICAgICBpZiAoIXJpZ2h0YWxpZ24pIHtcclxuICAgICAgICBjc3MubGVmdCA9IHBvcy5sZWZ0ICsgJ3B4JztcclxuICAgICAgICBjc3MucmlnaHQgPSAnYXV0byc7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgY3NzLmxlZnQgPSAnYXV0byc7XHJcbiAgICAgICAgc2Nyb2xsYmFyUGFkZGluZyA9ICRwb3NpdGlvbi5zY3JvbGxiYXJQYWRkaW5nKGFwcGVuZFRvKTtcclxuXHJcbiAgICAgICAgaWYgKHNjcm9sbGJhclBhZGRpbmcuaGVpZ2h0T3ZlcmZsb3cgJiYgc2Nyb2xsYmFyUGFkZGluZy5zY3JvbGxiYXJXaWR0aCkge1xyXG4gICAgICAgICAgc2Nyb2xsYmFyV2lkdGggPSBzY3JvbGxiYXJQYWRkaW5nLnNjcm9sbGJhcldpZHRoO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY3NzLnJpZ2h0ID0gd2luZG93LmlubmVyV2lkdGggLSBzY3JvbGxiYXJXaWR0aCAtXHJcbiAgICAgICAgICAocG9zLmxlZnQgKyAkZWxlbWVudC5wcm9wKCdvZmZzZXRXaWR0aCcpKSArICdweCc7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIE5lZWQgdG8gYWRqdXN0IG91ciBwb3NpdGlvbmluZyB0byBiZSByZWxhdGl2ZSB0byB0aGUgYXBwZW5kVG8gY29udGFpbmVyXHJcbiAgICAgIC8vIGlmIGl0J3Mgbm90IHRoZSBib2R5IGVsZW1lbnRcclxuICAgICAgaWYgKCFhcHBlbmRUb0JvZHkpIHtcclxuICAgICAgICB2YXIgYXBwZW5kT2Zmc2V0ID0gJHBvc2l0aW9uLm9mZnNldChhcHBlbmRUbyk7XHJcblxyXG4gICAgICAgIGNzcy50b3AgPSBwb3MudG9wIC0gYXBwZW5kT2Zmc2V0LnRvcCArICdweCc7XHJcblxyXG4gICAgICAgIGlmICghcmlnaHRhbGlnbikge1xyXG4gICAgICAgICAgY3NzLmxlZnQgPSBwb3MubGVmdCAtIGFwcGVuZE9mZnNldC5sZWZ0ICsgJ3B4JztcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgY3NzLnJpZ2h0ID0gd2luZG93LmlubmVyV2lkdGggLVxyXG4gICAgICAgICAgICAocG9zLmxlZnQgLSBhcHBlbmRPZmZzZXQubGVmdCArICRlbGVtZW50LnByb3AoJ29mZnNldFdpZHRoJykpICsgJ3B4JztcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHNlbGYuZHJvcGRvd25NZW51LmNzcyhjc3MpO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBvcGVuQ29udGFpbmVyID0gYXBwZW5kVG8gPyBhcHBlbmRUbyA6ICRlbGVtZW50O1xyXG4gICAgdmFyIGhhc09wZW5DbGFzcyA9IG9wZW5Db250YWluZXIuaGFzQ2xhc3MoYXBwZW5kVG8gPyBhcHBlbmRUb09wZW5DbGFzcyA6IG9wZW5DbGFzcyk7XHJcblxyXG4gICAgaWYgKGhhc09wZW5DbGFzcyA9PT0gIWlzT3Blbikge1xyXG4gICAgICAkYW5pbWF0ZVtpc09wZW4gPyAnYWRkQ2xhc3MnIDogJ3JlbW92ZUNsYXNzJ10ob3BlbkNvbnRhaW5lciwgYXBwZW5kVG8gPyBhcHBlbmRUb09wZW5DbGFzcyA6IG9wZW5DbGFzcykudGhlbihmdW5jdGlvbigpIHtcclxuICAgICAgICBpZiAoYW5ndWxhci5pc0RlZmluZWQoaXNPcGVuKSAmJiBpc09wZW4gIT09IHdhc09wZW4pIHtcclxuICAgICAgICAgIHRvZ2dsZUludm9rZXIoJHNjb3BlLCB7IG9wZW46ICEhaXNPcGVuIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGlzT3Blbikge1xyXG4gICAgICBpZiAoc2VsZi5kcm9wZG93bk1lbnVUZW1wbGF0ZVVybCkge1xyXG4gICAgICAgICR0ZW1wbGF0ZVJlcXVlc3Qoc2VsZi5kcm9wZG93bk1lbnVUZW1wbGF0ZVVybCkudGhlbihmdW5jdGlvbih0cGxDb250ZW50KSB7XHJcbiAgICAgICAgICB0ZW1wbGF0ZVNjb3BlID0gc2NvcGUuJG5ldygpO1xyXG4gICAgICAgICAgJGNvbXBpbGUodHBsQ29udGVudC50cmltKCkpKHRlbXBsYXRlU2NvcGUsIGZ1bmN0aW9uKGRyb3Bkb3duRWxlbWVudCkge1xyXG4gICAgICAgICAgICB2YXIgbmV3RWwgPSBkcm9wZG93bkVsZW1lbnQ7XHJcbiAgICAgICAgICAgIHNlbGYuZHJvcGRvd25NZW51LnJlcGxhY2VXaXRoKG5ld0VsKTtcclxuICAgICAgICAgICAgc2VsZi5kcm9wZG93bk1lbnUgPSBuZXdFbDtcclxuICAgICAgICAgICAgJGRvY3VtZW50Lm9uKCdrZXlkb3duJywgdWliRHJvcGRvd25TZXJ2aWNlLmtleWJpbmRGaWx0ZXIpO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgJGRvY3VtZW50Lm9uKCdrZXlkb3duJywgdWliRHJvcGRvd25TZXJ2aWNlLmtleWJpbmRGaWx0ZXIpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBzY29wZS5mb2N1c1RvZ2dsZUVsZW1lbnQoKTtcclxuICAgICAgdWliRHJvcGRvd25TZXJ2aWNlLm9wZW4oc2NvcGUsICRlbGVtZW50KTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHVpYkRyb3Bkb3duU2VydmljZS5jbG9zZShzY29wZSwgJGVsZW1lbnQpO1xyXG4gICAgICBpZiAoc2VsZi5kcm9wZG93bk1lbnVUZW1wbGF0ZVVybCkge1xyXG4gICAgICAgIGlmICh0ZW1wbGF0ZVNjb3BlKSB7XHJcbiAgICAgICAgICB0ZW1wbGF0ZVNjb3BlLiRkZXN0cm95KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciBuZXdFbCA9IGFuZ3VsYXIuZWxlbWVudCgnPHVsIGNsYXNzPVwiZHJvcGRvd24tbWVudVwiPjwvdWw+Jyk7XHJcbiAgICAgICAgc2VsZi5kcm9wZG93bk1lbnUucmVwbGFjZVdpdGgobmV3RWwpO1xyXG4gICAgICAgIHNlbGYuZHJvcGRvd25NZW51ID0gbmV3RWw7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHNlbGYuc2VsZWN0ZWRPcHRpb24gPSBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChhbmd1bGFyLmlzRnVuY3Rpb24oc2V0SXNPcGVuKSkge1xyXG4gICAgICBzZXRJc09wZW4oJHNjb3BlLCBpc09wZW4pO1xyXG4gICAgfVxyXG4gIH0pO1xyXG59XSlcclxuXHJcbi5kaXJlY3RpdmUoJ3VpYkRyb3Bkb3duJywgZnVuY3Rpb24oKSB7XHJcbiAgcmV0dXJuIHtcclxuICAgIGNvbnRyb2xsZXI6ICdVaWJEcm9wZG93bkNvbnRyb2xsZXInLFxyXG4gICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCBkcm9wZG93bkN0cmwpIHtcclxuICAgICAgZHJvcGRvd25DdHJsLmluaXQoKTtcclxuICAgIH1cclxuICB9O1xyXG59KVxyXG5cclxuLmRpcmVjdGl2ZSgndWliRHJvcGRvd25NZW51JywgZnVuY3Rpb24oKSB7XHJcbiAgcmV0dXJuIHtcclxuICAgIHJlc3RyaWN0OiAnQScsXHJcbiAgICByZXF1aXJlOiAnP151aWJEcm9wZG93bicsXHJcbiAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxlbWVudCwgYXR0cnMsIGRyb3Bkb3duQ3RybCkge1xyXG4gICAgICBpZiAoIWRyb3Bkb3duQ3RybCB8fCBhbmd1bGFyLmlzRGVmaW5lZChhdHRycy5kcm9wZG93bk5lc3RlZCkpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGVsZW1lbnQuYWRkQ2xhc3MoJ2Ryb3Bkb3duLW1lbnUnKTtcclxuXHJcbiAgICAgIHZhciB0cGxVcmwgPSBhdHRycy50ZW1wbGF0ZVVybDtcclxuICAgICAgaWYgKHRwbFVybCkge1xyXG4gICAgICAgIGRyb3Bkb3duQ3RybC5kcm9wZG93bk1lbnVUZW1wbGF0ZVVybCA9IHRwbFVybDtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKCFkcm9wZG93bkN0cmwuZHJvcGRvd25NZW51KSB7XHJcbiAgICAgICAgZHJvcGRvd25DdHJsLmRyb3Bkb3duTWVudSA9IGVsZW1lbnQ7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9O1xyXG59KVxyXG5cclxuLmRpcmVjdGl2ZSgndWliRHJvcGRvd25Ub2dnbGUnLCBmdW5jdGlvbigpIHtcclxuICByZXR1cm4ge1xyXG4gICAgcmVxdWlyZTogJz9edWliRHJvcGRvd24nLFxyXG4gICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCBkcm9wZG93bkN0cmwpIHtcclxuICAgICAgaWYgKCFkcm9wZG93bkN0cmwpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGVsZW1lbnQuYWRkQ2xhc3MoJ2Ryb3Bkb3duLXRvZ2dsZScpO1xyXG5cclxuICAgICAgZHJvcGRvd25DdHJsLnRvZ2dsZUVsZW1lbnQgPSBlbGVtZW50O1xyXG5cclxuICAgICAgdmFyIHRvZ2dsZURyb3Bkb3duID0gZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cclxuICAgICAgICBpZiAoIWVsZW1lbnQuaGFzQ2xhc3MoJ2Rpc2FibGVkJykgJiYgIWF0dHJzLmRpc2FibGVkKSB7XHJcbiAgICAgICAgICBzY29wZS4kYXBwbHkoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGRyb3Bkb3duQ3RybC50b2dnbGUoKTtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgfTtcclxuXHJcbiAgICAgIGVsZW1lbnQuYmluZCgnY2xpY2snLCB0b2dnbGVEcm9wZG93bik7XHJcblxyXG4gICAgICAvLyBXQUktQVJJQVxyXG4gICAgICBlbGVtZW50LmF0dHIoeyAnYXJpYS1oYXNwb3B1cCc6IHRydWUsICdhcmlhLWV4cGFuZGVkJzogZmFsc2UgfSk7XHJcbiAgICAgIHNjb3BlLiR3YXRjaChkcm9wZG93bkN0cmwuaXNPcGVuLCBmdW5jdGlvbihpc09wZW4pIHtcclxuICAgICAgICBlbGVtZW50LmF0dHIoJ2FyaWEtZXhwYW5kZWQnLCAhIWlzT3Blbik7XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgc2NvcGUuJG9uKCckZGVzdHJveScsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGVsZW1lbnQudW5iaW5kKCdjbGljaycsIHRvZ2dsZURyb3Bkb3duKTtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfTtcclxufSk7XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgndWkuYm9vdHN0cmFwLnN0YWNrZWRNYXAnLCBbXSlcclxuLyoqXHJcbiAqIEEgaGVscGVyLCBpbnRlcm5hbCBkYXRhIHN0cnVjdHVyZSB0aGF0IGFjdHMgYXMgYSBtYXAgYnV0IGFsc28gYWxsb3dzIGdldHRpbmcgLyByZW1vdmluZ1xyXG4gKiBlbGVtZW50cyBpbiB0aGUgTElGTyBvcmRlclxyXG4gKi9cclxuICAuZmFjdG9yeSgnJCRzdGFja2VkTWFwJywgZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBjcmVhdGVOZXc6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBzdGFjayA9IFtdO1xyXG5cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgYWRkOiBmdW5jdGlvbihrZXksIHZhbHVlKSB7XHJcbiAgICAgICAgICAgIHN0YWNrLnB1c2goe1xyXG4gICAgICAgICAgICAgIGtleToga2V5LFxyXG4gICAgICAgICAgICAgIHZhbHVlOiB2YWx1ZVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICBnZXQ6IGZ1bmN0aW9uKGtleSkge1xyXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHN0YWNrLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgaWYgKGtleSA9PT0gc3RhY2tbaV0ua2V5KSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gc3RhY2tbaV07XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAga2V5czogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHZhciBrZXlzID0gW107XHJcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc3RhY2subGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICBrZXlzLnB1c2goc3RhY2tbaV0ua2V5KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4ga2V5cztcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICB0b3A6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gc3RhY2tbc3RhY2subGVuZ3RoIC0gMV07XHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgcmVtb3ZlOiBmdW5jdGlvbihrZXkpIHtcclxuICAgICAgICAgICAgdmFyIGlkeCA9IC0xO1xyXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHN0YWNrLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgaWYgKGtleSA9PT0gc3RhY2tbaV0ua2V5KSB7XHJcbiAgICAgICAgICAgICAgICBpZHggPSBpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBzdGFjay5zcGxpY2UoaWR4LCAxKVswXTtcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICByZW1vdmVUb3A6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gc3RhY2sucG9wKCk7XHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgbGVuZ3RoOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHN0YWNrLmxlbmd0aDtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG4gIH0pO1xyXG5hbmd1bGFyLm1vZHVsZSgndWkuYm9vdHN0cmFwLm1vZGFsJywgWyd1aS5ib290c3RyYXAuc3RhY2tlZE1hcCcsICd1aS5ib290c3RyYXAucG9zaXRpb24nXSlcclxuLyoqXHJcbiAqIEEgaGVscGVyLCBpbnRlcm5hbCBkYXRhIHN0cnVjdHVyZSB0aGF0IHN0b3JlcyBhbGwgcmVmZXJlbmNlcyBhdHRhY2hlZCB0byBrZXlcclxuICovXHJcbiAgLmZhY3RvcnkoJyQkbXVsdGlNYXAnLCBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIGNyZWF0ZU5ldzogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIG1hcCA9IHt9O1xyXG5cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgZW50cmllczogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBPYmplY3Qua2V5cyhtYXApLm1hcChmdW5jdGlvbihrZXkpIHtcclxuICAgICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAga2V5OiBrZXksXHJcbiAgICAgICAgICAgICAgICB2YWx1ZTogbWFwW2tleV1cclxuICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICBnZXQ6IGZ1bmN0aW9uKGtleSkge1xyXG4gICAgICAgICAgICByZXR1cm4gbWFwW2tleV07XHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgaGFzS2V5OiBmdW5jdGlvbihrZXkpIHtcclxuICAgICAgICAgICAgcmV0dXJuICEhbWFwW2tleV07XHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAga2V5czogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBPYmplY3Qua2V5cyhtYXApO1xyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHB1dDogZnVuY3Rpb24oa2V5LCB2YWx1ZSkge1xyXG4gICAgICAgICAgICBpZiAoIW1hcFtrZXldKSB7XHJcbiAgICAgICAgICAgICAgbWFwW2tleV0gPSBbXTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbWFwW2tleV0ucHVzaCh2YWx1ZSk7XHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgcmVtb3ZlOiBmdW5jdGlvbihrZXksIHZhbHVlKSB7XHJcbiAgICAgICAgICAgIHZhciB2YWx1ZXMgPSBtYXBba2V5XTtcclxuXHJcbiAgICAgICAgICAgIGlmICghdmFsdWVzKSB7XHJcbiAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB2YXIgaWR4ID0gdmFsdWVzLmluZGV4T2YodmFsdWUpO1xyXG5cclxuICAgICAgICAgICAgaWYgKGlkeCAhPT0gLTEpIHtcclxuICAgICAgICAgICAgICB2YWx1ZXMuc3BsaWNlKGlkeCwgMSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICghdmFsdWVzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgIGRlbGV0ZSBtYXBba2V5XTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICAgIH1cclxuICAgIH07XHJcbiAgfSlcclxuXHJcbi8qKlxyXG4gKiBQbHVnZ2FibGUgcmVzb2x2ZSBtZWNoYW5pc20gZm9yIHRoZSBtb2RhbCByZXNvbHZlIHJlc29sdXRpb25cclxuICogU3VwcG9ydHMgVUkgUm91dGVyJ3MgJHJlc29sdmUgc2VydmljZVxyXG4gKi9cclxuICAucHJvdmlkZXIoJyR1aWJSZXNvbHZlJywgZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgcmVzb2x2ZSA9IHRoaXM7XHJcbiAgICB0aGlzLnJlc29sdmVyID0gbnVsbDtcclxuXHJcbiAgICB0aGlzLnNldFJlc29sdmVyID0gZnVuY3Rpb24ocmVzb2x2ZXIpIHtcclxuICAgICAgdGhpcy5yZXNvbHZlciA9IHJlc29sdmVyO1xyXG4gICAgfTtcclxuXHJcbiAgICB0aGlzLiRnZXQgPSBbJyRpbmplY3RvcicsICckcScsIGZ1bmN0aW9uKCRpbmplY3RvciwgJHEpIHtcclxuICAgICAgdmFyIHJlc29sdmVyID0gcmVzb2x2ZS5yZXNvbHZlciA/ICRpbmplY3Rvci5nZXQocmVzb2x2ZS5yZXNvbHZlcikgOiBudWxsO1xyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIHJlc29sdmU6IGZ1bmN0aW9uKGludm9jYWJsZXMsIGxvY2FscywgcGFyZW50LCBzZWxmKSB7XHJcbiAgICAgICAgICBpZiAocmVzb2x2ZXIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHJlc29sdmVyLnJlc29sdmUoaW52b2NhYmxlcywgbG9jYWxzLCBwYXJlbnQsIHNlbGYpO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIHZhciBwcm9taXNlcyA9IFtdO1xyXG5cclxuICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaChpbnZvY2FibGVzLCBmdW5jdGlvbih2YWx1ZSkge1xyXG4gICAgICAgICAgICBpZiAoYW5ndWxhci5pc0Z1bmN0aW9uKHZhbHVlKSB8fCBhbmd1bGFyLmlzQXJyYXkodmFsdWUpKSB7XHJcbiAgICAgICAgICAgICAgcHJvbWlzZXMucHVzaCgkcS5yZXNvbHZlKCRpbmplY3Rvci5pbnZva2UodmFsdWUpKSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoYW5ndWxhci5pc1N0cmluZyh2YWx1ZSkpIHtcclxuICAgICAgICAgICAgICBwcm9taXNlcy5wdXNoKCRxLnJlc29sdmUoJGluamVjdG9yLmdldCh2YWx1ZSkpKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICBwcm9taXNlcy5wdXNoKCRxLnJlc29sdmUodmFsdWUpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgcmV0dXJuICRxLmFsbChwcm9taXNlcykudGhlbihmdW5jdGlvbihyZXNvbHZlcykge1xyXG4gICAgICAgICAgICB2YXIgcmVzb2x2ZU9iaiA9IHt9O1xyXG4gICAgICAgICAgICB2YXIgcmVzb2x2ZUl0ZXIgPSAwO1xyXG4gICAgICAgICAgICBhbmd1bGFyLmZvckVhY2goaW52b2NhYmxlcywgZnVuY3Rpb24odmFsdWUsIGtleSkge1xyXG4gICAgICAgICAgICAgIHJlc29sdmVPYmpba2V5XSA9IHJlc29sdmVzW3Jlc29sdmVJdGVyKytdO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiByZXNvbHZlT2JqO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9O1xyXG4gICAgfV07XHJcbiAgfSlcclxuXHJcbi8qKlxyXG4gKiBBIGhlbHBlciBkaXJlY3RpdmUgZm9yIHRoZSAkbW9kYWwgc2VydmljZS4gSXQgY3JlYXRlcyBhIGJhY2tkcm9wIGVsZW1lbnQuXHJcbiAqL1xyXG4gIC5kaXJlY3RpdmUoJ3VpYk1vZGFsQmFja2Ryb3AnLCBbJyRhbmltYXRlJywgJyRpbmplY3RvcicsICckdWliTW9kYWxTdGFjaycsXHJcbiAgZnVuY3Rpb24oJGFuaW1hdGUsICRpbmplY3RvciwgJG1vZGFsU3RhY2spIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIHJlc3RyaWN0OiAnQScsXHJcbiAgICAgIGNvbXBpbGU6IGZ1bmN0aW9uKHRFbGVtZW50LCB0QXR0cnMpIHtcclxuICAgICAgICB0RWxlbWVudC5hZGRDbGFzcyh0QXR0cnMuYmFja2Ryb3BDbGFzcyk7XHJcbiAgICAgICAgcmV0dXJuIGxpbmtGbjtcclxuICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICBmdW5jdGlvbiBsaW5rRm4oc2NvcGUsIGVsZW1lbnQsIGF0dHJzKSB7XHJcbiAgICAgIGlmIChhdHRycy5tb2RhbEluQ2xhc3MpIHtcclxuICAgICAgICAkYW5pbWF0ZS5hZGRDbGFzcyhlbGVtZW50LCBhdHRycy5tb2RhbEluQ2xhc3MpO1xyXG5cclxuICAgICAgICBzY29wZS4kb24oJG1vZGFsU3RhY2suTk9XX0NMT1NJTkdfRVZFTlQsIGZ1bmN0aW9uKGUsIHNldElzQXN5bmMpIHtcclxuICAgICAgICAgIHZhciBkb25lID0gc2V0SXNBc3luYygpO1xyXG4gICAgICAgICAgaWYgKHNjb3BlLm1vZGFsT3B0aW9ucy5hbmltYXRpb24pIHtcclxuICAgICAgICAgICAgJGFuaW1hdGUucmVtb3ZlQ2xhc3MoZWxlbWVudCwgYXR0cnMubW9kYWxJbkNsYXNzKS50aGVuKGRvbmUpO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgZG9uZSgpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfV0pXHJcblxyXG4gIC5kaXJlY3RpdmUoJ3VpYk1vZGFsV2luZG93JywgWyckdWliTW9kYWxTdGFjaycsICckcScsICckYW5pbWF0ZUNzcycsICckZG9jdW1lbnQnLFxyXG4gIGZ1bmN0aW9uKCRtb2RhbFN0YWNrLCAkcSwgJGFuaW1hdGVDc3MsICRkb2N1bWVudCkge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgc2NvcGU6IHtcclxuICAgICAgICBpbmRleDogJ0AnXHJcbiAgICAgIH0sXHJcbiAgICAgIHJlc3RyaWN0OiAnQScsXHJcbiAgICAgIHRyYW5zY2x1ZGU6IHRydWUsXHJcbiAgICAgIHRlbXBsYXRlVXJsOiBmdW5jdGlvbih0RWxlbWVudCwgdEF0dHJzKSB7XHJcbiAgICAgICAgcmV0dXJuIHRBdHRycy50ZW1wbGF0ZVVybCB8fCAndWliL3RlbXBsYXRlL21vZGFsL3dpbmRvdy5odG1sJztcclxuICAgICAgfSxcclxuICAgICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsZW1lbnQsIGF0dHJzKSB7XHJcbiAgICAgICAgZWxlbWVudC5hZGRDbGFzcyhhdHRycy53aW5kb3dUb3BDbGFzcyB8fCAnJyk7XHJcbiAgICAgICAgc2NvcGUuc2l6ZSA9IGF0dHJzLnNpemU7XHJcblxyXG4gICAgICAgIHNjb3BlLmNsb3NlID0gZnVuY3Rpb24oZXZ0KSB7XHJcbiAgICAgICAgICB2YXIgbW9kYWwgPSAkbW9kYWxTdGFjay5nZXRUb3AoKTtcclxuICAgICAgICAgIGlmIChtb2RhbCAmJiBtb2RhbC52YWx1ZS5iYWNrZHJvcCAmJlxyXG4gICAgICAgICAgICBtb2RhbC52YWx1ZS5iYWNrZHJvcCAhPT0gJ3N0YXRpYycgJiZcclxuICAgICAgICAgICAgZXZ0LnRhcmdldCA9PT0gZXZ0LmN1cnJlbnRUYXJnZXQpIHtcclxuICAgICAgICAgICAgZXZ0LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgIGV2dC5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICAgICAgJG1vZGFsU3RhY2suZGlzbWlzcyhtb2RhbC5rZXksICdiYWNrZHJvcCBjbGljaycpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8vIG1vdmVkIGZyb20gdGVtcGxhdGUgdG8gZml4IGlzc3VlICMyMjgwXHJcbiAgICAgICAgZWxlbWVudC5vbignY2xpY2snLCBzY29wZS5jbG9zZSk7XHJcblxyXG4gICAgICAgIC8vIFRoaXMgcHJvcGVydHkgaXMgb25seSBhZGRlZCB0byB0aGUgc2NvcGUgZm9yIHRoZSBwdXJwb3NlIG9mIGRldGVjdGluZyB3aGVuIHRoaXMgZGlyZWN0aXZlIGlzIHJlbmRlcmVkLlxyXG4gICAgICAgIC8vIFdlIGNhbiBkZXRlY3QgdGhhdCBieSB1c2luZyB0aGlzIHByb3BlcnR5IGluIHRoZSB0ZW1wbGF0ZSBhc3NvY2lhdGVkIHdpdGggdGhpcyBkaXJlY3RpdmUgYW5kIHRoZW4gdXNlXHJcbiAgICAgICAgLy8ge0BsaW5rIEF0dHJpYnV0ZSMkb2JzZXJ2ZX0gb24gaXQuIEZvciBtb3JlIGRldGFpbHMgcGxlYXNlIHNlZSB7QGxpbmsgVGFibGVDb2x1bW5SZXNpemV9LlxyXG4gICAgICAgIHNjb3BlLiRpc1JlbmRlcmVkID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgLy8gRGVmZXJyZWQgb2JqZWN0IHRoYXQgd2lsbCBiZSByZXNvbHZlZCB3aGVuIHRoaXMgbW9kYWwgaXMgcmVuZGVyLlxyXG4gICAgICAgIHZhciBtb2RhbFJlbmRlckRlZmVyT2JqID0gJHEuZGVmZXIoKTtcclxuICAgICAgICAvLyBSZXNvbHZlIHJlbmRlciBwcm9taXNlIHBvc3QtZGlnZXN0XHJcbiAgICAgICAgc2NvcGUuJCRwb3N0RGlnZXN0KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgbW9kYWxSZW5kZXJEZWZlck9iai5yZXNvbHZlKCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIG1vZGFsUmVuZGVyRGVmZXJPYmoucHJvbWlzZS50aGVuKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgdmFyIGFuaW1hdGlvblByb21pc2UgPSBudWxsO1xyXG5cclxuICAgICAgICAgIGlmIChhdHRycy5tb2RhbEluQ2xhc3MpIHtcclxuICAgICAgICAgICAgYW5pbWF0aW9uUHJvbWlzZSA9ICRhbmltYXRlQ3NzKGVsZW1lbnQsIHtcclxuICAgICAgICAgICAgICBhZGRDbGFzczogYXR0cnMubW9kYWxJbkNsYXNzXHJcbiAgICAgICAgICAgIH0pLnN0YXJ0KCk7XHJcblxyXG4gICAgICAgICAgICBzY29wZS4kb24oJG1vZGFsU3RhY2suTk9XX0NMT1NJTkdfRVZFTlQsIGZ1bmN0aW9uKGUsIHNldElzQXN5bmMpIHtcclxuICAgICAgICAgICAgICB2YXIgZG9uZSA9IHNldElzQXN5bmMoKTtcclxuICAgICAgICAgICAgICAkYW5pbWF0ZUNzcyhlbGVtZW50LCB7XHJcbiAgICAgICAgICAgICAgICByZW1vdmVDbGFzczogYXR0cnMubW9kYWxJbkNsYXNzXHJcbiAgICAgICAgICAgICAgfSkuc3RhcnQoKS50aGVuKGRvbmUpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgICAgJHEud2hlbihhbmltYXRpb25Qcm9taXNlKS50aGVuKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAvLyBOb3RpZnkge0BsaW5rICRtb2RhbFN0YWNrfSB0aGF0IG1vZGFsIGlzIHJlbmRlcmVkLlxyXG4gICAgICAgICAgICB2YXIgbW9kYWwgPSAkbW9kYWxTdGFjay5nZXRUb3AoKTtcclxuICAgICAgICAgICAgaWYgKG1vZGFsKSB7XHJcbiAgICAgICAgICAgICAgJG1vZGFsU3RhY2subW9kYWxSZW5kZXJlZChtb2RhbC5rZXkpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvKipcclxuICAgICAgICAgICAgICogSWYgc29tZXRoaW5nIHdpdGhpbiB0aGUgZnJlc2hseS1vcGVuZWQgbW9kYWwgYWxyZWFkeSBoYXMgZm9jdXMgKHBlcmhhcHMgdmlhIGFcclxuICAgICAgICAgICAgICogZGlyZWN0aXZlIHRoYXQgY2F1c2VzIGZvY3VzKS4gdGhlbiBubyBuZWVkIHRvIHRyeSBhbmQgZm9jdXMgYW55dGhpbmcuXHJcbiAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICBpZiAoISgkZG9jdW1lbnRbMF0uYWN0aXZlRWxlbWVudCAmJiBlbGVtZW50WzBdLmNvbnRhaW5zKCRkb2N1bWVudFswXS5hY3RpdmVFbGVtZW50KSkpIHtcclxuICAgICAgICAgICAgICB2YXIgaW5wdXRXaXRoQXV0b2ZvY3VzID0gZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCdbYXV0b2ZvY3VzXScpO1xyXG4gICAgICAgICAgICAgIC8qKlxyXG4gICAgICAgICAgICAgICAqIEF1dG8tZm9jdXNpbmcgb2YgYSBmcmVzaGx5LW9wZW5lZCBtb2RhbCBlbGVtZW50IGNhdXNlcyBhbnkgY2hpbGQgZWxlbWVudHNcclxuICAgICAgICAgICAgICAgKiB3aXRoIHRoZSBhdXRvZm9jdXMgYXR0cmlidXRlIHRvIGxvc2UgZm9jdXMuIFRoaXMgaXMgYW4gaXNzdWUgb24gdG91Y2hcclxuICAgICAgICAgICAgICAgKiBiYXNlZCBkZXZpY2VzIHdoaWNoIHdpbGwgc2hvdyBhbmQgdGhlbiBoaWRlIHRoZSBvbnNjcmVlbiBrZXlib2FyZC5cclxuICAgICAgICAgICAgICAgKiBBdHRlbXB0cyB0byByZWZvY3VzIHRoZSBhdXRvZm9jdXMgZWxlbWVudCB2aWEgSmF2YVNjcmlwdCB3aWxsIG5vdCByZW9wZW5cclxuICAgICAgICAgICAgICAgKiB0aGUgb25zY3JlZW4ga2V5Ym9hcmQuIEZpeGVkIGJ5IHVwZGF0ZWQgdGhlIGZvY3VzaW5nIGxvZ2ljIHRvIG9ubHkgYXV0b2ZvY3VzXHJcbiAgICAgICAgICAgICAgICogdGhlIG1vZGFsIGVsZW1lbnQgaWYgdGhlIG1vZGFsIGRvZXMgbm90IGNvbnRhaW4gYW4gYXV0b2ZvY3VzIGVsZW1lbnQuXHJcbiAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgaWYgKGlucHV0V2l0aEF1dG9mb2N1cykge1xyXG4gICAgICAgICAgICAgICAgaW5wdXRXaXRoQXV0b2ZvY3VzLmZvY3VzKCk7XHJcbiAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGVsZW1lbnRbMF0uZm9jdXMoKTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG4gIH1dKVxyXG5cclxuICAuZGlyZWN0aXZlKCd1aWJNb2RhbEFuaW1hdGlvbkNsYXNzJywgZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBjb21waWxlOiBmdW5jdGlvbih0RWxlbWVudCwgdEF0dHJzKSB7XHJcbiAgICAgICAgaWYgKHRBdHRycy5tb2RhbEFuaW1hdGlvbikge1xyXG4gICAgICAgICAgdEVsZW1lbnQuYWRkQ2xhc3ModEF0dHJzLnVpYk1vZGFsQW5pbWF0aW9uQ2xhc3MpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfTtcclxuICB9KVxyXG5cclxuICAuZGlyZWN0aXZlKCd1aWJNb2RhbFRyYW5zY2x1ZGUnLCBbJyRhbmltYXRlJywgZnVuY3Rpb24oJGFuaW1hdGUpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBlbGVtZW50LCBhdHRycywgY29udHJvbGxlciwgdHJhbnNjbHVkZSkge1xyXG4gICAgICAgIHRyYW5zY2x1ZGUoc2NvcGUuJHBhcmVudCwgZnVuY3Rpb24oY2xvbmUpIHtcclxuICAgICAgICAgIGVsZW1lbnQuZW1wdHkoKTtcclxuICAgICAgICAgICRhbmltYXRlLmVudGVyKGNsb25lLCBlbGVtZW50KTtcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuICB9XSlcclxuXHJcbiAgLmZhY3RvcnkoJyR1aWJNb2RhbFN0YWNrJywgWyckYW5pbWF0ZScsICckYW5pbWF0ZUNzcycsICckZG9jdW1lbnQnLFxyXG4gICAgJyRjb21waWxlJywgJyRyb290U2NvcGUnLCAnJHEnLCAnJCRtdWx0aU1hcCcsICckJHN0YWNrZWRNYXAnLCAnJHVpYlBvc2l0aW9uJyxcclxuICAgIGZ1bmN0aW9uKCRhbmltYXRlLCAkYW5pbWF0ZUNzcywgJGRvY3VtZW50LCAkY29tcGlsZSwgJHJvb3RTY29wZSwgJHEsICQkbXVsdGlNYXAsICQkc3RhY2tlZE1hcCwgJHVpYlBvc2l0aW9uKSB7XHJcbiAgICAgIHZhciBPUEVORURfTU9EQUxfQ0xBU1MgPSAnbW9kYWwtb3Blbic7XHJcblxyXG4gICAgICB2YXIgYmFja2Ryb3BEb21FbCwgYmFja2Ryb3BTY29wZTtcclxuICAgICAgdmFyIG9wZW5lZFdpbmRvd3MgPSAkJHN0YWNrZWRNYXAuY3JlYXRlTmV3KCk7XHJcbiAgICAgIHZhciBvcGVuZWRDbGFzc2VzID0gJCRtdWx0aU1hcC5jcmVhdGVOZXcoKTtcclxuICAgICAgdmFyICRtb2RhbFN0YWNrID0ge1xyXG4gICAgICAgIE5PV19DTE9TSU5HX0VWRU5UOiAnbW9kYWwuc3RhY2subm93LWNsb3NpbmcnXHJcbiAgICAgIH07XHJcbiAgICAgIHZhciB0b3BNb2RhbEluZGV4ID0gMDtcclxuICAgICAgdmFyIHByZXZpb3VzVG9wT3BlbmVkTW9kYWwgPSBudWxsO1xyXG5cclxuICAgICAgLy9Nb2RhbCBmb2N1cyBiZWhhdmlvclxyXG4gICAgICB2YXIgdGFiYmFibGVTZWxlY3RvciA9ICdhW2hyZWZdLCBhcmVhW2hyZWZdLCBpbnB1dDpub3QoW2Rpc2FibGVkXSk6bm90KFt0YWJpbmRleD1cXCctMVxcJ10pLCAnICtcclxuICAgICAgICAnYnV0dG9uOm5vdChbZGlzYWJsZWRdKTpub3QoW3RhYmluZGV4PVxcJy0xXFwnXSksc2VsZWN0Om5vdChbZGlzYWJsZWRdKTpub3QoW3RhYmluZGV4PVxcJy0xXFwnXSksIHRleHRhcmVhOm5vdChbZGlzYWJsZWRdKTpub3QoW3RhYmluZGV4PVxcJy0xXFwnXSksICcgK1xyXG4gICAgICAgICdpZnJhbWUsIG9iamVjdCwgZW1iZWQsICpbdGFiaW5kZXhdOm5vdChbdGFiaW5kZXg9XFwnLTFcXCddKSwgKltjb250ZW50ZWRpdGFibGU9dHJ1ZV0nO1xyXG4gICAgICB2YXIgc2Nyb2xsYmFyUGFkZGluZztcclxuICAgICAgdmFyIFNOQUtFX0NBU0VfUkVHRVhQID0gL1tBLVpdL2c7XHJcblxyXG4gICAgICAvLyBUT0RPOiBleHRyYWN0IGludG8gY29tbW9uIGRlcGVuZGVuY3kgd2l0aCB0b29sdGlwXHJcbiAgICAgIGZ1bmN0aW9uIHNuYWtlX2Nhc2UobmFtZSkge1xyXG4gICAgICAgIHZhciBzZXBhcmF0b3IgPSAnLSc7XHJcbiAgICAgICAgcmV0dXJuIG5hbWUucmVwbGFjZShTTkFLRV9DQVNFX1JFR0VYUCwgZnVuY3Rpb24obGV0dGVyLCBwb3MpIHtcclxuICAgICAgICAgIHJldHVybiAocG9zID8gc2VwYXJhdG9yIDogJycpICsgbGV0dGVyLnRvTG93ZXJDYXNlKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGZ1bmN0aW9uIGlzVmlzaWJsZShlbGVtZW50KSB7XHJcbiAgICAgICAgcmV0dXJuICEhKGVsZW1lbnQub2Zmc2V0V2lkdGggfHxcclxuICAgICAgICAgIGVsZW1lbnQub2Zmc2V0SGVpZ2h0IHx8XHJcbiAgICAgICAgICBlbGVtZW50LmdldENsaWVudFJlY3RzKCkubGVuZ3RoKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgZnVuY3Rpb24gYmFja2Ryb3BJbmRleCgpIHtcclxuICAgICAgICB2YXIgdG9wQmFja2Ryb3BJbmRleCA9IC0xO1xyXG4gICAgICAgIHZhciBvcGVuZWQgPSBvcGVuZWRXaW5kb3dzLmtleXMoKTtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG9wZW5lZC5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgaWYgKG9wZW5lZFdpbmRvd3MuZ2V0KG9wZW5lZFtpXSkudmFsdWUuYmFja2Ryb3ApIHtcclxuICAgICAgICAgICAgdG9wQmFja2Ryb3BJbmRleCA9IGk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBJZiBhbnkgYmFja2Ryb3AgZXhpc3QsIGVuc3VyZSB0aGF0IGl0J3MgaW5kZXggaXMgYWx3YXlzXHJcbiAgICAgICAgLy8gcmlnaHQgYmVsb3cgdGhlIHRvcCBtb2RhbFxyXG4gICAgICAgIGlmICh0b3BCYWNrZHJvcEluZGV4ID4gLTEgJiYgdG9wQmFja2Ryb3BJbmRleCA8IHRvcE1vZGFsSW5kZXgpIHtcclxuICAgICAgICAgIHRvcEJhY2tkcm9wSW5kZXggPSB0b3BNb2RhbEluZGV4O1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdG9wQmFja2Ryb3BJbmRleDtcclxuICAgICAgfVxyXG5cclxuICAgICAgJHJvb3RTY29wZS4kd2F0Y2goYmFja2Ryb3BJbmRleCwgZnVuY3Rpb24obmV3QmFja2Ryb3BJbmRleCkge1xyXG4gICAgICAgIGlmIChiYWNrZHJvcFNjb3BlKSB7XHJcbiAgICAgICAgICBiYWNrZHJvcFNjb3BlLmluZGV4ID0gbmV3QmFja2Ryb3BJbmRleDtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgZnVuY3Rpb24gcmVtb3ZlTW9kYWxXaW5kb3cobW9kYWxJbnN0YW5jZSwgZWxlbWVudFRvUmVjZWl2ZUZvY3VzKSB7XHJcbiAgICAgICAgdmFyIG1vZGFsV2luZG93ID0gb3BlbmVkV2luZG93cy5nZXQobW9kYWxJbnN0YW5jZSkudmFsdWU7XHJcbiAgICAgICAgdmFyIGFwcGVuZFRvRWxlbWVudCA9IG1vZGFsV2luZG93LmFwcGVuZFRvO1xyXG5cclxuICAgICAgICAvL2NsZWFuIHVwIHRoZSBzdGFja1xyXG4gICAgICAgIG9wZW5lZFdpbmRvd3MucmVtb3ZlKG1vZGFsSW5zdGFuY2UpO1xyXG4gICAgICAgIHByZXZpb3VzVG9wT3BlbmVkTW9kYWwgPSBvcGVuZWRXaW5kb3dzLnRvcCgpO1xyXG4gICAgICAgIGlmIChwcmV2aW91c1RvcE9wZW5lZE1vZGFsKSB7XHJcbiAgICAgICAgICB0b3BNb2RhbEluZGV4ID0gcGFyc2VJbnQocHJldmlvdXNUb3BPcGVuZWRNb2RhbC52YWx1ZS5tb2RhbERvbUVsLmF0dHIoJ2luZGV4JyksIDEwKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJlbW92ZUFmdGVyQW5pbWF0ZShtb2RhbFdpbmRvdy5tb2RhbERvbUVsLCBtb2RhbFdpbmRvdy5tb2RhbFNjb3BlLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgIHZhciBtb2RhbEJvZHlDbGFzcyA9IG1vZGFsV2luZG93Lm9wZW5lZENsYXNzIHx8IE9QRU5FRF9NT0RBTF9DTEFTUztcclxuICAgICAgICAgIG9wZW5lZENsYXNzZXMucmVtb3ZlKG1vZGFsQm9keUNsYXNzLCBtb2RhbEluc3RhbmNlKTtcclxuICAgICAgICAgIHZhciBhcmVBbnlPcGVuID0gb3BlbmVkQ2xhc3Nlcy5oYXNLZXkobW9kYWxCb2R5Q2xhc3MpO1xyXG4gICAgICAgICAgYXBwZW5kVG9FbGVtZW50LnRvZ2dsZUNsYXNzKG1vZGFsQm9keUNsYXNzLCBhcmVBbnlPcGVuKTtcclxuICAgICAgICAgIGlmICghYXJlQW55T3BlbiAmJiBzY3JvbGxiYXJQYWRkaW5nICYmIHNjcm9sbGJhclBhZGRpbmcuaGVpZ2h0T3ZlcmZsb3cgJiYgc2Nyb2xsYmFyUGFkZGluZy5zY3JvbGxiYXJXaWR0aCkge1xyXG4gICAgICAgICAgICBpZiAoc2Nyb2xsYmFyUGFkZGluZy5vcmlnaW5hbFJpZ2h0KSB7XHJcbiAgICAgICAgICAgICAgYXBwZW5kVG9FbGVtZW50LmNzcyh7cGFkZGluZ1JpZ2h0OiBzY3JvbGxiYXJQYWRkaW5nLm9yaWdpbmFsUmlnaHQgKyAncHgnfSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgYXBwZW5kVG9FbGVtZW50LmNzcyh7cGFkZGluZ1JpZ2h0OiAnJ30pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHNjcm9sbGJhclBhZGRpbmcgPSBudWxsO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgdG9nZ2xlVG9wV2luZG93Q2xhc3ModHJ1ZSk7XHJcbiAgICAgICAgfSwgbW9kYWxXaW5kb3cuY2xvc2VkRGVmZXJyZWQpO1xyXG4gICAgICAgIGNoZWNrUmVtb3ZlQmFja2Ryb3AoKTtcclxuXHJcbiAgICAgICAgLy9tb3ZlIGZvY3VzIHRvIHNwZWNpZmllZCBlbGVtZW50IGlmIGF2YWlsYWJsZSwgb3IgZWxzZSB0byBib2R5XHJcbiAgICAgICAgaWYgKGVsZW1lbnRUb1JlY2VpdmVGb2N1cyAmJiBlbGVtZW50VG9SZWNlaXZlRm9jdXMuZm9jdXMpIHtcclxuICAgICAgICAgIGVsZW1lbnRUb1JlY2VpdmVGb2N1cy5mb2N1cygpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoYXBwZW5kVG9FbGVtZW50LmZvY3VzKSB7XHJcbiAgICAgICAgICBhcHBlbmRUb0VsZW1lbnQuZm9jdXMoKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIEFkZCBvciByZW1vdmUgXCJ3aW5kb3dUb3BDbGFzc1wiIGZyb20gdGhlIHRvcCB3aW5kb3cgaW4gdGhlIHN0YWNrXHJcbiAgICAgIGZ1bmN0aW9uIHRvZ2dsZVRvcFdpbmRvd0NsYXNzKHRvZ2dsZVN3aXRjaCkge1xyXG4gICAgICAgIHZhciBtb2RhbFdpbmRvdztcclxuXHJcbiAgICAgICAgaWYgKG9wZW5lZFdpbmRvd3MubGVuZ3RoKCkgPiAwKSB7XHJcbiAgICAgICAgICBtb2RhbFdpbmRvdyA9IG9wZW5lZFdpbmRvd3MudG9wKCkudmFsdWU7XHJcbiAgICAgICAgICBtb2RhbFdpbmRvdy5tb2RhbERvbUVsLnRvZ2dsZUNsYXNzKG1vZGFsV2luZG93LndpbmRvd1RvcENsYXNzIHx8ICcnLCB0b2dnbGVTd2l0Y2gpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgZnVuY3Rpb24gY2hlY2tSZW1vdmVCYWNrZHJvcCgpIHtcclxuICAgICAgICAvL3JlbW92ZSBiYWNrZHJvcCBpZiBubyBsb25nZXIgbmVlZGVkXHJcbiAgICAgICAgaWYgKGJhY2tkcm9wRG9tRWwgJiYgYmFja2Ryb3BJbmRleCgpID09PSAtMSkge1xyXG4gICAgICAgICAgdmFyIGJhY2tkcm9wU2NvcGVSZWYgPSBiYWNrZHJvcFNjb3BlO1xyXG4gICAgICAgICAgcmVtb3ZlQWZ0ZXJBbmltYXRlKGJhY2tkcm9wRG9tRWwsIGJhY2tkcm9wU2NvcGUsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBiYWNrZHJvcFNjb3BlUmVmID0gbnVsbDtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgYmFja2Ryb3BEb21FbCA9IHVuZGVmaW5lZDtcclxuICAgICAgICAgIGJhY2tkcm9wU2NvcGUgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICBmdW5jdGlvbiByZW1vdmVBZnRlckFuaW1hdGUoZG9tRWwsIHNjb3BlLCBkb25lLCBjbG9zZWREZWZlcnJlZCkge1xyXG4gICAgICAgIHZhciBhc3luY0RlZmVycmVkO1xyXG4gICAgICAgIHZhciBhc3luY1Byb21pc2UgPSBudWxsO1xyXG4gICAgICAgIHZhciBzZXRJc0FzeW5jID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICBpZiAoIWFzeW5jRGVmZXJyZWQpIHtcclxuICAgICAgICAgICAgYXN5bmNEZWZlcnJlZCA9ICRxLmRlZmVyKCk7XHJcbiAgICAgICAgICAgIGFzeW5jUHJvbWlzZSA9IGFzeW5jRGVmZXJyZWQucHJvbWlzZTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gYXN5bmNEb25lKCkge1xyXG4gICAgICAgICAgICBhc3luY0RlZmVycmVkLnJlc29sdmUoKTtcclxuICAgICAgICAgIH07XHJcbiAgICAgICAgfTtcclxuICAgICAgICBzY29wZS4kYnJvYWRjYXN0KCRtb2RhbFN0YWNrLk5PV19DTE9TSU5HX0VWRU5ULCBzZXRJc0FzeW5jKTtcclxuXHJcbiAgICAgICAgLy8gTm90ZSB0aGF0IGl0J3MgaW50ZW50aW9uYWwgdGhhdCBhc3luY1Byb21pc2UgbWlnaHQgYmUgbnVsbC5cclxuICAgICAgICAvLyBUaGF0J3Mgd2hlbiBzZXRJc0FzeW5jIGhhcyBub3QgYmVlbiBjYWxsZWQgZHVyaW5nIHRoZVxyXG4gICAgICAgIC8vIE5PV19DTE9TSU5HX0VWRU5UIGJyb2FkY2FzdC5cclxuICAgICAgICByZXR1cm4gJHEud2hlbihhc3luY1Byb21pc2UpLnRoZW4oYWZ0ZXJBbmltYXRpbmcpO1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBhZnRlckFuaW1hdGluZygpIHtcclxuICAgICAgICAgIGlmIChhZnRlckFuaW1hdGluZy5kb25lKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGFmdGVyQW5pbWF0aW5nLmRvbmUgPSB0cnVlO1xyXG5cclxuICAgICAgICAgICRhbmltYXRlLmxlYXZlKGRvbUVsKS50aGVuKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBpZiAoZG9uZSkge1xyXG4gICAgICAgICAgICAgIGRvbmUoKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZG9tRWwucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgIGlmIChjbG9zZWREZWZlcnJlZCkge1xyXG4gICAgICAgICAgICAgIGNsb3NlZERlZmVycmVkLnJlc29sdmUoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgc2NvcGUuJGRlc3Ryb3koKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgICRkb2N1bWVudC5vbigna2V5ZG93bicsIGtleWRvd25MaXN0ZW5lcik7XHJcblxyXG4gICAgICAkcm9vdFNjb3BlLiRvbignJGRlc3Ryb3knLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAkZG9jdW1lbnQub2ZmKCdrZXlkb3duJywga2V5ZG93bkxpc3RlbmVyKTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICBmdW5jdGlvbiBrZXlkb3duTGlzdGVuZXIoZXZ0KSB7XHJcbiAgICAgICAgaWYgKGV2dC5pc0RlZmF1bHRQcmV2ZW50ZWQoKSkge1xyXG4gICAgICAgICAgcmV0dXJuIGV2dDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhciBtb2RhbCA9IG9wZW5lZFdpbmRvd3MudG9wKCk7XHJcbiAgICAgICAgaWYgKG1vZGFsKSB7XHJcbiAgICAgICAgICBzd2l0Y2ggKGV2dC53aGljaCkge1xyXG4gICAgICAgICAgICBjYXNlIDI3OiB7XHJcbiAgICAgICAgICAgICAgaWYgKG1vZGFsLnZhbHVlLmtleWJvYXJkKSB7XHJcbiAgICAgICAgICAgICAgICBldnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICAgICRyb290U2NvcGUuJGFwcGx5KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAkbW9kYWxTdGFjay5kaXNtaXNzKG1vZGFsLmtleSwgJ2VzY2FwZSBrZXkgcHJlc3MnKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYXNlIDk6IHtcclxuICAgICAgICAgICAgICB2YXIgbGlzdCA9ICRtb2RhbFN0YWNrLmxvYWRGb2N1c0VsZW1lbnRMaXN0KG1vZGFsKTtcclxuICAgICAgICAgICAgICB2YXIgZm9jdXNDaGFuZ2VkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgaWYgKGV2dC5zaGlmdEtleSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKCRtb2RhbFN0YWNrLmlzRm9jdXNJbkZpcnN0SXRlbShldnQsIGxpc3QpIHx8ICRtb2RhbFN0YWNrLmlzTW9kYWxGb2N1c2VkKGV2dCwgbW9kYWwpKSB7XHJcbiAgICAgICAgICAgICAgICAgIGZvY3VzQ2hhbmdlZCA9ICRtb2RhbFN0YWNrLmZvY3VzTGFzdEZvY3VzYWJsZUVsZW1lbnQobGlzdCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGlmICgkbW9kYWxTdGFjay5pc0ZvY3VzSW5MYXN0SXRlbShldnQsIGxpc3QpKSB7XHJcbiAgICAgICAgICAgICAgICAgIGZvY3VzQ2hhbmdlZCA9ICRtb2RhbFN0YWNrLmZvY3VzRmlyc3RGb2N1c2FibGVFbGVtZW50KGxpc3QpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgaWYgKGZvY3VzQ2hhbmdlZCkge1xyXG4gICAgICAgICAgICAgICAgZXZ0LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICAgICBldnQuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgJG1vZGFsU3RhY2sub3BlbiA9IGZ1bmN0aW9uKG1vZGFsSW5zdGFuY2UsIG1vZGFsKSB7XHJcbiAgICAgICAgdmFyIG1vZGFsT3BlbmVyID0gJGRvY3VtZW50WzBdLmFjdGl2ZUVsZW1lbnQsXHJcbiAgICAgICAgICBtb2RhbEJvZHlDbGFzcyA9IG1vZGFsLm9wZW5lZENsYXNzIHx8IE9QRU5FRF9NT0RBTF9DTEFTUztcclxuXHJcbiAgICAgICAgdG9nZ2xlVG9wV2luZG93Q2xhc3MoZmFsc2UpO1xyXG5cclxuICAgICAgICAvLyBTdG9yZSB0aGUgY3VycmVudCB0b3AgZmlyc3QsIHRvIGRldGVybWluZSB3aGF0IGluZGV4IHdlIG91Z2h0IHRvIHVzZVxyXG4gICAgICAgIC8vIGZvciB0aGUgY3VycmVudCB0b3AgbW9kYWxcclxuICAgICAgICBwcmV2aW91c1RvcE9wZW5lZE1vZGFsID0gb3BlbmVkV2luZG93cy50b3AoKTtcclxuXHJcbiAgICAgICAgb3BlbmVkV2luZG93cy5hZGQobW9kYWxJbnN0YW5jZSwge1xyXG4gICAgICAgICAgZGVmZXJyZWQ6IG1vZGFsLmRlZmVycmVkLFxyXG4gICAgICAgICAgcmVuZGVyRGVmZXJyZWQ6IG1vZGFsLnJlbmRlckRlZmVycmVkLFxyXG4gICAgICAgICAgY2xvc2VkRGVmZXJyZWQ6IG1vZGFsLmNsb3NlZERlZmVycmVkLFxyXG4gICAgICAgICAgbW9kYWxTY29wZTogbW9kYWwuc2NvcGUsXHJcbiAgICAgICAgICBiYWNrZHJvcDogbW9kYWwuYmFja2Ryb3AsXHJcbiAgICAgICAgICBrZXlib2FyZDogbW9kYWwua2V5Ym9hcmQsXHJcbiAgICAgICAgICBvcGVuZWRDbGFzczogbW9kYWwub3BlbmVkQ2xhc3MsXHJcbiAgICAgICAgICB3aW5kb3dUb3BDbGFzczogbW9kYWwud2luZG93VG9wQ2xhc3MsXHJcbiAgICAgICAgICBhbmltYXRpb246IG1vZGFsLmFuaW1hdGlvbixcclxuICAgICAgICAgIGFwcGVuZFRvOiBtb2RhbC5hcHBlbmRUb1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBvcGVuZWRDbGFzc2VzLnB1dChtb2RhbEJvZHlDbGFzcywgbW9kYWxJbnN0YW5jZSk7XHJcblxyXG4gICAgICAgIHZhciBhcHBlbmRUb0VsZW1lbnQgPSBtb2RhbC5hcHBlbmRUbyxcclxuICAgICAgICAgICAgY3VyckJhY2tkcm9wSW5kZXggPSBiYWNrZHJvcEluZGV4KCk7XHJcblxyXG4gICAgICAgIGlmICghYXBwZW5kVG9FbGVtZW50Lmxlbmd0aCkge1xyXG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdhcHBlbmRUbyBlbGVtZW50IG5vdCBmb3VuZC4gTWFrZSBzdXJlIHRoYXQgdGhlIGVsZW1lbnQgcGFzc2VkIGlzIGluIERPTS4nKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChjdXJyQmFja2Ryb3BJbmRleCA+PSAwICYmICFiYWNrZHJvcERvbUVsKSB7XHJcbiAgICAgICAgICBiYWNrZHJvcFNjb3BlID0gJHJvb3RTY29wZS4kbmV3KHRydWUpO1xyXG4gICAgICAgICAgYmFja2Ryb3BTY29wZS5tb2RhbE9wdGlvbnMgPSBtb2RhbDtcclxuICAgICAgICAgIGJhY2tkcm9wU2NvcGUuaW5kZXggPSBjdXJyQmFja2Ryb3BJbmRleDtcclxuICAgICAgICAgIGJhY2tkcm9wRG9tRWwgPSBhbmd1bGFyLmVsZW1lbnQoJzxkaXYgdWliLW1vZGFsLWJhY2tkcm9wPVwibW9kYWwtYmFja2Ryb3BcIj48L2Rpdj4nKTtcclxuICAgICAgICAgIGJhY2tkcm9wRG9tRWwuYXR0cih7XHJcbiAgICAgICAgICAgICdjbGFzcyc6ICdtb2RhbC1iYWNrZHJvcCcsXHJcbiAgICAgICAgICAgICduZy1zdHlsZSc6ICd7XFwnei1pbmRleFxcJzogMTA0MCArIChpbmRleCAmJiAxIHx8IDApICsgaW5kZXgqMTB9JyxcclxuICAgICAgICAgICAgJ3VpYi1tb2RhbC1hbmltYXRpb24tY2xhc3MnOiAnZmFkZScsXHJcbiAgICAgICAgICAgICdtb2RhbC1pbi1jbGFzcyc6ICdpbidcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgaWYgKG1vZGFsLmJhY2tkcm9wQ2xhc3MpIHtcclxuICAgICAgICAgICAgYmFja2Ryb3BEb21FbC5hZGRDbGFzcyhtb2RhbC5iYWNrZHJvcENsYXNzKTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBpZiAobW9kYWwuYW5pbWF0aW9uKSB7XHJcbiAgICAgICAgICAgIGJhY2tkcm9wRG9tRWwuYXR0cignbW9kYWwtYW5pbWF0aW9uJywgJ3RydWUnKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgICRjb21waWxlKGJhY2tkcm9wRG9tRWwpKGJhY2tkcm9wU2NvcGUpO1xyXG4gICAgICAgICAgJGFuaW1hdGUuZW50ZXIoYmFja2Ryb3BEb21FbCwgYXBwZW5kVG9FbGVtZW50KTtcclxuICAgICAgICAgIGlmICgkdWliUG9zaXRpb24uaXNTY3JvbGxhYmxlKGFwcGVuZFRvRWxlbWVudCkpIHtcclxuICAgICAgICAgICAgc2Nyb2xsYmFyUGFkZGluZyA9ICR1aWJQb3NpdGlvbi5zY3JvbGxiYXJQYWRkaW5nKGFwcGVuZFRvRWxlbWVudCk7XHJcbiAgICAgICAgICAgIGlmIChzY3JvbGxiYXJQYWRkaW5nLmhlaWdodE92ZXJmbG93ICYmIHNjcm9sbGJhclBhZGRpbmcuc2Nyb2xsYmFyV2lkdGgpIHtcclxuICAgICAgICAgICAgICBhcHBlbmRUb0VsZW1lbnQuY3NzKHtwYWRkaW5nUmlnaHQ6IHNjcm9sbGJhclBhZGRpbmcucmlnaHQgKyAncHgnfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhciBjb250ZW50O1xyXG4gICAgICAgIGlmIChtb2RhbC5jb21wb25lbnQpIHtcclxuICAgICAgICAgIGNvbnRlbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KHNuYWtlX2Nhc2UobW9kYWwuY29tcG9uZW50Lm5hbWUpKTtcclxuICAgICAgICAgIGNvbnRlbnQgPSBhbmd1bGFyLmVsZW1lbnQoY29udGVudCk7XHJcbiAgICAgICAgICBjb250ZW50LmF0dHIoe1xyXG4gICAgICAgICAgICByZXNvbHZlOiAnJHJlc29sdmUnLFxyXG4gICAgICAgICAgICAnbW9kYWwtaW5zdGFuY2UnOiAnJHVpYk1vZGFsSW5zdGFuY2UnLFxyXG4gICAgICAgICAgICBjbG9zZTogJyRjbG9zZSgkdmFsdWUpJyxcclxuICAgICAgICAgICAgZGlzbWlzczogJyRkaXNtaXNzKCR2YWx1ZSknXHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgY29udGVudCA9IG1vZGFsLmNvbnRlbnQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBTZXQgdGhlIHRvcCBtb2RhbCBpbmRleCBiYXNlZCBvbiB0aGUgaW5kZXggb2YgdGhlIHByZXZpb3VzIHRvcCBtb2RhbFxyXG4gICAgICAgIHRvcE1vZGFsSW5kZXggPSBwcmV2aW91c1RvcE9wZW5lZE1vZGFsID8gcGFyc2VJbnQocHJldmlvdXNUb3BPcGVuZWRNb2RhbC52YWx1ZS5tb2RhbERvbUVsLmF0dHIoJ2luZGV4JyksIDEwKSArIDEgOiAwO1xyXG4gICAgICAgIHZhciBhbmd1bGFyRG9tRWwgPSBhbmd1bGFyLmVsZW1lbnQoJzxkaXYgdWliLW1vZGFsLXdpbmRvdz1cIm1vZGFsLXdpbmRvd1wiPjwvZGl2PicpO1xyXG4gICAgICAgIGFuZ3VsYXJEb21FbC5hdHRyKHtcclxuICAgICAgICAgICdjbGFzcyc6ICdtb2RhbCcsXHJcbiAgICAgICAgICAndGVtcGxhdGUtdXJsJzogbW9kYWwud2luZG93VGVtcGxhdGVVcmwsXHJcbiAgICAgICAgICAnd2luZG93LXRvcC1jbGFzcyc6IG1vZGFsLndpbmRvd1RvcENsYXNzLFxyXG4gICAgICAgICAgJ3JvbGUnOiAnZGlhbG9nJyxcclxuICAgICAgICAgICdhcmlhLWxhYmVsbGVkYnknOiBtb2RhbC5hcmlhTGFiZWxsZWRCeSxcclxuICAgICAgICAgICdhcmlhLWRlc2NyaWJlZGJ5JzogbW9kYWwuYXJpYURlc2NyaWJlZEJ5LFxyXG4gICAgICAgICAgJ3NpemUnOiBtb2RhbC5zaXplLFxyXG4gICAgICAgICAgJ2luZGV4JzogdG9wTW9kYWxJbmRleCxcclxuICAgICAgICAgICdhbmltYXRlJzogJ2FuaW1hdGUnLFxyXG4gICAgICAgICAgJ25nLXN0eWxlJzogJ3tcXCd6LWluZGV4XFwnOiAxMDUwICsgJCR0b3BNb2RhbEluZGV4KjEwLCBkaXNwbGF5OiBcXCdibG9ja1xcJ30nLFxyXG4gICAgICAgICAgJ3RhYmluZGV4JzogLTEsXHJcbiAgICAgICAgICAndWliLW1vZGFsLWFuaW1hdGlvbi1jbGFzcyc6ICdmYWRlJyxcclxuICAgICAgICAgICdtb2RhbC1pbi1jbGFzcyc6ICdpbidcclxuICAgICAgICB9KS5hcHBlbmQoY29udGVudCk7XHJcbiAgICAgICAgaWYgKG1vZGFsLndpbmRvd0NsYXNzKSB7XHJcbiAgICAgICAgICBhbmd1bGFyRG9tRWwuYWRkQ2xhc3MobW9kYWwud2luZG93Q2xhc3MpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKG1vZGFsLmFuaW1hdGlvbikge1xyXG4gICAgICAgICAgYW5ndWxhckRvbUVsLmF0dHIoJ21vZGFsLWFuaW1hdGlvbicsICd0cnVlJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBhcHBlbmRUb0VsZW1lbnQuYWRkQ2xhc3MobW9kYWxCb2R5Q2xhc3MpO1xyXG4gICAgICAgIGlmIChtb2RhbC5zY29wZSkge1xyXG4gICAgICAgICAgLy8gd2UgbmVlZCB0byBleHBsaWNpdGx5IGFkZCB0aGUgbW9kYWwgaW5kZXggdG8gdGhlIG1vZGFsIHNjb3BlXHJcbiAgICAgICAgICAvLyBiZWNhdXNlIGl0IGlzIG5lZWRlZCBieSBuZ1N0eWxlIHRvIGNvbXB1dGUgdGhlIHpJbmRleCBwcm9wZXJ0eS5cclxuICAgICAgICAgIG1vZGFsLnNjb3BlLiQkdG9wTW9kYWxJbmRleCA9IHRvcE1vZGFsSW5kZXg7XHJcbiAgICAgICAgfVxyXG4gICAgICAgICRhbmltYXRlLmVudGVyKCRjb21waWxlKGFuZ3VsYXJEb21FbCkobW9kYWwuc2NvcGUpLCBhcHBlbmRUb0VsZW1lbnQpO1xyXG5cclxuICAgICAgICBvcGVuZWRXaW5kb3dzLnRvcCgpLnZhbHVlLm1vZGFsRG9tRWwgPSBhbmd1bGFyRG9tRWw7XHJcbiAgICAgICAgb3BlbmVkV2luZG93cy50b3AoKS52YWx1ZS5tb2RhbE9wZW5lciA9IG1vZGFsT3BlbmVyO1xyXG4gICAgICB9O1xyXG5cclxuICAgICAgZnVuY3Rpb24gYnJvYWRjYXN0Q2xvc2luZyhtb2RhbFdpbmRvdywgcmVzdWx0T3JSZWFzb24sIGNsb3NpbmcpIHtcclxuICAgICAgICByZXR1cm4gIW1vZGFsV2luZG93LnZhbHVlLm1vZGFsU2NvcGUuJGJyb2FkY2FzdCgnbW9kYWwuY2xvc2luZycsIHJlc3VsdE9yUmVhc29uLCBjbG9zaW5nKS5kZWZhdWx0UHJldmVudGVkO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAkbW9kYWxTdGFjay5jbG9zZSA9IGZ1bmN0aW9uKG1vZGFsSW5zdGFuY2UsIHJlc3VsdCkge1xyXG4gICAgICAgIHZhciBtb2RhbFdpbmRvdyA9IG9wZW5lZFdpbmRvd3MuZ2V0KG1vZGFsSW5zdGFuY2UpO1xyXG4gICAgICAgIGlmIChtb2RhbFdpbmRvdyAmJiBicm9hZGNhc3RDbG9zaW5nKG1vZGFsV2luZG93LCByZXN1bHQsIHRydWUpKSB7XHJcbiAgICAgICAgICBtb2RhbFdpbmRvdy52YWx1ZS5tb2RhbFNjb3BlLiQkdWliRGVzdHJ1Y3Rpb25TY2hlZHVsZWQgPSB0cnVlO1xyXG4gICAgICAgICAgbW9kYWxXaW5kb3cudmFsdWUuZGVmZXJyZWQucmVzb2x2ZShyZXN1bHQpO1xyXG4gICAgICAgICAgcmVtb3ZlTW9kYWxXaW5kb3cobW9kYWxJbnN0YW5jZSwgbW9kYWxXaW5kb3cudmFsdWUubW9kYWxPcGVuZXIpO1xyXG4gICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiAhbW9kYWxXaW5kb3c7XHJcbiAgICAgIH07XHJcblxyXG4gICAgICAkbW9kYWxTdGFjay5kaXNtaXNzID0gZnVuY3Rpb24obW9kYWxJbnN0YW5jZSwgcmVhc29uKSB7XHJcbiAgICAgICAgdmFyIG1vZGFsV2luZG93ID0gb3BlbmVkV2luZG93cy5nZXQobW9kYWxJbnN0YW5jZSk7XHJcbiAgICAgICAgaWYgKG1vZGFsV2luZG93ICYmIGJyb2FkY2FzdENsb3NpbmcobW9kYWxXaW5kb3csIHJlYXNvbiwgZmFsc2UpKSB7XHJcbiAgICAgICAgICBtb2RhbFdpbmRvdy52YWx1ZS5tb2RhbFNjb3BlLiQkdWliRGVzdHJ1Y3Rpb25TY2hlZHVsZWQgPSB0cnVlO1xyXG4gICAgICAgICAgbW9kYWxXaW5kb3cudmFsdWUuZGVmZXJyZWQucmVqZWN0KHJlYXNvbik7XHJcbiAgICAgICAgICByZW1vdmVNb2RhbFdpbmRvdyhtb2RhbEluc3RhbmNlLCBtb2RhbFdpbmRvdy52YWx1ZS5tb2RhbE9wZW5lcik7XHJcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuICFtb2RhbFdpbmRvdztcclxuICAgICAgfTtcclxuXHJcbiAgICAgICRtb2RhbFN0YWNrLmRpc21pc3NBbGwgPSBmdW5jdGlvbihyZWFzb24pIHtcclxuICAgICAgICB2YXIgdG9wTW9kYWwgPSB0aGlzLmdldFRvcCgpO1xyXG4gICAgICAgIHdoaWxlICh0b3BNb2RhbCAmJiB0aGlzLmRpc21pc3ModG9wTW9kYWwua2V5LCByZWFzb24pKSB7XHJcbiAgICAgICAgICB0b3BNb2RhbCA9IHRoaXMuZ2V0VG9wKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9O1xyXG5cclxuICAgICAgJG1vZGFsU3RhY2suZ2V0VG9wID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIG9wZW5lZFdpbmRvd3MudG9wKCk7XHJcbiAgICAgIH07XHJcblxyXG4gICAgICAkbW9kYWxTdGFjay5tb2RhbFJlbmRlcmVkID0gZnVuY3Rpb24obW9kYWxJbnN0YW5jZSkge1xyXG4gICAgICAgIHZhciBtb2RhbFdpbmRvdyA9IG9wZW5lZFdpbmRvd3MuZ2V0KG1vZGFsSW5zdGFuY2UpO1xyXG4gICAgICAgIGlmIChtb2RhbFdpbmRvdykge1xyXG4gICAgICAgICAgbW9kYWxXaW5kb3cudmFsdWUucmVuZGVyRGVmZXJyZWQucmVzb2x2ZSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgfTtcclxuXHJcbiAgICAgICRtb2RhbFN0YWNrLmZvY3VzRmlyc3RGb2N1c2FibGVFbGVtZW50ID0gZnVuY3Rpb24obGlzdCkge1xyXG4gICAgICAgIGlmIChsaXN0Lmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgIGxpc3RbMF0uZm9jdXMoKTtcclxuICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgIH07XHJcblxyXG4gICAgICAkbW9kYWxTdGFjay5mb2N1c0xhc3RGb2N1c2FibGVFbGVtZW50ID0gZnVuY3Rpb24obGlzdCkge1xyXG4gICAgICAgIGlmIChsaXN0Lmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgIGxpc3RbbGlzdC5sZW5ndGggLSAxXS5mb2N1cygpO1xyXG4gICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgfTtcclxuXHJcbiAgICAgICRtb2RhbFN0YWNrLmlzTW9kYWxGb2N1c2VkID0gZnVuY3Rpb24oZXZ0LCBtb2RhbFdpbmRvdykge1xyXG4gICAgICAgIGlmIChldnQgJiYgbW9kYWxXaW5kb3cpIHtcclxuICAgICAgICAgIHZhciBtb2RhbERvbUVsID0gbW9kYWxXaW5kb3cudmFsdWUubW9kYWxEb21FbDtcclxuICAgICAgICAgIGlmIChtb2RhbERvbUVsICYmIG1vZGFsRG9tRWwubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAoZXZ0LnRhcmdldCB8fCBldnQuc3JjRWxlbWVudCkgPT09IG1vZGFsRG9tRWxbMF07XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgfTtcclxuXHJcbiAgICAgICRtb2RhbFN0YWNrLmlzRm9jdXNJbkZpcnN0SXRlbSA9IGZ1bmN0aW9uKGV2dCwgbGlzdCkge1xyXG4gICAgICAgIGlmIChsaXN0Lmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgIHJldHVybiAoZXZ0LnRhcmdldCB8fCBldnQuc3JjRWxlbWVudCkgPT09IGxpc3RbMF07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgfTtcclxuXHJcbiAgICAgICRtb2RhbFN0YWNrLmlzRm9jdXNJbkxhc3RJdGVtID0gZnVuY3Rpb24oZXZ0LCBsaXN0KSB7XHJcbiAgICAgICAgaWYgKGxpc3QubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgcmV0dXJuIChldnQudGFyZ2V0IHx8IGV2dC5zcmNFbGVtZW50KSA9PT0gbGlzdFtsaXN0Lmxlbmd0aCAtIDFdO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgIH07XHJcblxyXG4gICAgICAkbW9kYWxTdGFjay5sb2FkRm9jdXNFbGVtZW50TGlzdCA9IGZ1bmN0aW9uKG1vZGFsV2luZG93KSB7XHJcbiAgICAgICAgaWYgKG1vZGFsV2luZG93KSB7XHJcbiAgICAgICAgICB2YXIgbW9kYWxEb21FMSA9IG1vZGFsV2luZG93LnZhbHVlLm1vZGFsRG9tRWw7XHJcbiAgICAgICAgICBpZiAobW9kYWxEb21FMSAmJiBtb2RhbERvbUUxLmxlbmd0aCkge1xyXG4gICAgICAgICAgICB2YXIgZWxlbWVudHMgPSBtb2RhbERvbUUxWzBdLnF1ZXJ5U2VsZWN0b3JBbGwodGFiYmFibGVTZWxlY3Rvcik7XHJcbiAgICAgICAgICAgIHJldHVybiBlbGVtZW50cyA/XHJcbiAgICAgICAgICAgICAgQXJyYXkucHJvdG90eXBlLmZpbHRlci5jYWxsKGVsZW1lbnRzLCBmdW5jdGlvbihlbGVtZW50KSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gaXNWaXNpYmxlKGVsZW1lbnQpO1xyXG4gICAgICAgICAgICAgIH0pIDogZWxlbWVudHM7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9O1xyXG5cclxuICAgICAgcmV0dXJuICRtb2RhbFN0YWNrO1xyXG4gICAgfV0pXHJcblxyXG4gIC5wcm92aWRlcignJHVpYk1vZGFsJywgZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgJG1vZGFsUHJvdmlkZXIgPSB7XHJcbiAgICAgIG9wdGlvbnM6IHtcclxuICAgICAgICBhbmltYXRpb246IHRydWUsXHJcbiAgICAgICAgYmFja2Ryb3A6IHRydWUsIC8vY2FuIGFsc28gYmUgZmFsc2Ugb3IgJ3N0YXRpYydcclxuICAgICAgICBrZXlib2FyZDogdHJ1ZVxyXG4gICAgICB9LFxyXG4gICAgICAkZ2V0OiBbJyRyb290U2NvcGUnLCAnJHEnLCAnJGRvY3VtZW50JywgJyR0ZW1wbGF0ZVJlcXVlc3QnLCAnJGNvbnRyb2xsZXInLCAnJHVpYlJlc29sdmUnLCAnJHVpYk1vZGFsU3RhY2snLFxyXG4gICAgICAgIGZ1bmN0aW9uICgkcm9vdFNjb3BlLCAkcSwgJGRvY3VtZW50LCAkdGVtcGxhdGVSZXF1ZXN0LCAkY29udHJvbGxlciwgJHVpYlJlc29sdmUsICRtb2RhbFN0YWNrKSB7XHJcbiAgICAgICAgICB2YXIgJG1vZGFsID0ge307XHJcblxyXG4gICAgICAgICAgZnVuY3Rpb24gZ2V0VGVtcGxhdGVQcm9taXNlKG9wdGlvbnMpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG9wdGlvbnMudGVtcGxhdGUgPyAkcS53aGVuKG9wdGlvbnMudGVtcGxhdGUpIDpcclxuICAgICAgICAgICAgICAkdGVtcGxhdGVSZXF1ZXN0KGFuZ3VsYXIuaXNGdW5jdGlvbihvcHRpb25zLnRlbXBsYXRlVXJsKSA/XHJcbiAgICAgICAgICAgICAgICBvcHRpb25zLnRlbXBsYXRlVXJsKCkgOiBvcHRpb25zLnRlbXBsYXRlVXJsKTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICB2YXIgcHJvbWlzZUNoYWluID0gbnVsbDtcclxuICAgICAgICAgICRtb2RhbC5nZXRQcm9taXNlQ2hhaW4gPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2VDaGFpbjtcclxuICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgJG1vZGFsLm9wZW4gPSBmdW5jdGlvbihtb2RhbE9wdGlvbnMpIHtcclxuICAgICAgICAgICAgdmFyIG1vZGFsUmVzdWx0RGVmZXJyZWQgPSAkcS5kZWZlcigpO1xyXG4gICAgICAgICAgICB2YXIgbW9kYWxPcGVuZWREZWZlcnJlZCA9ICRxLmRlZmVyKCk7XHJcbiAgICAgICAgICAgIHZhciBtb2RhbENsb3NlZERlZmVycmVkID0gJHEuZGVmZXIoKTtcclxuICAgICAgICAgICAgdmFyIG1vZGFsUmVuZGVyRGVmZXJyZWQgPSAkcS5kZWZlcigpO1xyXG5cclxuICAgICAgICAgICAgLy9wcmVwYXJlIGFuIGluc3RhbmNlIG9mIGEgbW9kYWwgdG8gYmUgaW5qZWN0ZWQgaW50byBjb250cm9sbGVycyBhbmQgcmV0dXJuZWQgdG8gYSBjYWxsZXJcclxuICAgICAgICAgICAgdmFyIG1vZGFsSW5zdGFuY2UgPSB7XHJcbiAgICAgICAgICAgICAgcmVzdWx0OiBtb2RhbFJlc3VsdERlZmVycmVkLnByb21pc2UsXHJcbiAgICAgICAgICAgICAgb3BlbmVkOiBtb2RhbE9wZW5lZERlZmVycmVkLnByb21pc2UsXHJcbiAgICAgICAgICAgICAgY2xvc2VkOiBtb2RhbENsb3NlZERlZmVycmVkLnByb21pc2UsXHJcbiAgICAgICAgICAgICAgcmVuZGVyZWQ6IG1vZGFsUmVuZGVyRGVmZXJyZWQucHJvbWlzZSxcclxuICAgICAgICAgICAgICBjbG9zZTogZnVuY3Rpb24gKHJlc3VsdCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuICRtb2RhbFN0YWNrLmNsb3NlKG1vZGFsSW5zdGFuY2UsIHJlc3VsdCk7XHJcbiAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICBkaXNtaXNzOiBmdW5jdGlvbiAocmVhc29uKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJG1vZGFsU3RhY2suZGlzbWlzcyhtb2RhbEluc3RhbmNlLCByZWFzb24pO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIC8vbWVyZ2UgYW5kIGNsZWFuIHVwIG9wdGlvbnNcclxuICAgICAgICAgICAgbW9kYWxPcHRpb25zID0gYW5ndWxhci5leHRlbmQoe30sICRtb2RhbFByb3ZpZGVyLm9wdGlvbnMsIG1vZGFsT3B0aW9ucyk7XHJcbiAgICAgICAgICAgIG1vZGFsT3B0aW9ucy5yZXNvbHZlID0gbW9kYWxPcHRpb25zLnJlc29sdmUgfHwge307XHJcbiAgICAgICAgICAgIG1vZGFsT3B0aW9ucy5hcHBlbmRUbyA9IG1vZGFsT3B0aW9ucy5hcHBlbmRUbyB8fCAkZG9jdW1lbnQuZmluZCgnYm9keScpLmVxKDApO1xyXG5cclxuICAgICAgICAgICAgLy92ZXJpZnkgb3B0aW9uc1xyXG4gICAgICAgICAgICBpZiAoIW1vZGFsT3B0aW9ucy5jb21wb25lbnQgJiYgIW1vZGFsT3B0aW9ucy50ZW1wbGF0ZSAmJiAhbW9kYWxPcHRpb25zLnRlbXBsYXRlVXJsKSB7XHJcbiAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdPbmUgb2YgY29tcG9uZW50IG9yIHRlbXBsYXRlIG9yIHRlbXBsYXRlVXJsIG9wdGlvbnMgaXMgcmVxdWlyZWQuJyk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHZhciB0ZW1wbGF0ZUFuZFJlc29sdmVQcm9taXNlO1xyXG4gICAgICAgICAgICBpZiAobW9kYWxPcHRpb25zLmNvbXBvbmVudCkge1xyXG4gICAgICAgICAgICAgIHRlbXBsYXRlQW5kUmVzb2x2ZVByb21pc2UgPSAkcS53aGVuKCR1aWJSZXNvbHZlLnJlc29sdmUobW9kYWxPcHRpb25zLnJlc29sdmUsIHt9LCBudWxsLCBudWxsKSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgdGVtcGxhdGVBbmRSZXNvbHZlUHJvbWlzZSA9XHJcbiAgICAgICAgICAgICAgICAkcS5hbGwoW2dldFRlbXBsYXRlUHJvbWlzZShtb2RhbE9wdGlvbnMpLCAkdWliUmVzb2x2ZS5yZXNvbHZlKG1vZGFsT3B0aW9ucy5yZXNvbHZlLCB7fSwgbnVsbCwgbnVsbCldKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gcmVzb2x2ZVdpdGhUZW1wbGF0ZSgpIHtcclxuICAgICAgICAgICAgICByZXR1cm4gdGVtcGxhdGVBbmRSZXNvbHZlUHJvbWlzZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gV2FpdCBmb3IgdGhlIHJlc29sdXRpb24gb2YgdGhlIGV4aXN0aW5nIHByb21pc2UgY2hhaW4uXHJcbiAgICAgICAgICAgIC8vIFRoZW4gc3dpdGNoIHRvIG91ciBvd24gY29tYmluZWQgcHJvbWlzZSBkZXBlbmRlbmN5IChyZWdhcmRsZXNzIG9mIGhvdyB0aGUgcHJldmlvdXMgbW9kYWwgZmFyZWQpLlxyXG4gICAgICAgICAgICAvLyBUaGVuIGFkZCB0byAkbW9kYWxTdGFjayBhbmQgcmVzb2x2ZSBvcGVuZWQuXHJcbiAgICAgICAgICAgIC8vIEZpbmFsbHkgY2xlYW4gdXAgdGhlIGNoYWluIHZhcmlhYmxlIGlmIG5vIHN1YnNlcXVlbnQgbW9kYWwgaGFzIG92ZXJ3cml0dGVuIGl0LlxyXG4gICAgICAgICAgICB2YXIgc2FtZVByb21pc2U7XHJcbiAgICAgICAgICAgIHNhbWVQcm9taXNlID0gcHJvbWlzZUNoYWluID0gJHEuYWxsKFtwcm9taXNlQ2hhaW5dKVxyXG4gICAgICAgICAgICAgIC50aGVuKHJlc29sdmVXaXRoVGVtcGxhdGUsIHJlc29sdmVXaXRoVGVtcGxhdGUpXHJcbiAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gcmVzb2x2ZVN1Y2Nlc3ModHBsQW5kVmFycykge1xyXG4gICAgICAgICAgICAgICAgdmFyIHByb3ZpZGVkU2NvcGUgPSBtb2RhbE9wdGlvbnMuc2NvcGUgfHwgJHJvb3RTY29wZTtcclxuXHJcbiAgICAgICAgICAgICAgICB2YXIgbW9kYWxTY29wZSA9IHByb3ZpZGVkU2NvcGUuJG5ldygpO1xyXG4gICAgICAgICAgICAgICAgbW9kYWxTY29wZS4kY2xvc2UgPSBtb2RhbEluc3RhbmNlLmNsb3NlO1xyXG4gICAgICAgICAgICAgICAgbW9kYWxTY29wZS4kZGlzbWlzcyA9IG1vZGFsSW5zdGFuY2UuZGlzbWlzcztcclxuXHJcbiAgICAgICAgICAgICAgICBtb2RhbFNjb3BlLiRvbignJGRlc3Ryb3knLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgaWYgKCFtb2RhbFNjb3BlLiQkdWliRGVzdHJ1Y3Rpb25TY2hlZHVsZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICBtb2RhbFNjb3BlLiRkaXNtaXNzKCckdWliVW5zY2hlZHVsZWREZXN0cnVjdGlvbicpO1xyXG4gICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICB2YXIgbW9kYWwgPSB7XHJcbiAgICAgICAgICAgICAgICAgIHNjb3BlOiBtb2RhbFNjb3BlLFxyXG4gICAgICAgICAgICAgICAgICBkZWZlcnJlZDogbW9kYWxSZXN1bHREZWZlcnJlZCxcclxuICAgICAgICAgICAgICAgICAgcmVuZGVyRGVmZXJyZWQ6IG1vZGFsUmVuZGVyRGVmZXJyZWQsXHJcbiAgICAgICAgICAgICAgICAgIGNsb3NlZERlZmVycmVkOiBtb2RhbENsb3NlZERlZmVycmVkLFxyXG4gICAgICAgICAgICAgICAgICBhbmltYXRpb246IG1vZGFsT3B0aW9ucy5hbmltYXRpb24sXHJcbiAgICAgICAgICAgICAgICAgIGJhY2tkcm9wOiBtb2RhbE9wdGlvbnMuYmFja2Ryb3AsXHJcbiAgICAgICAgICAgICAgICAgIGtleWJvYXJkOiBtb2RhbE9wdGlvbnMua2V5Ym9hcmQsXHJcbiAgICAgICAgICAgICAgICAgIGJhY2tkcm9wQ2xhc3M6IG1vZGFsT3B0aW9ucy5iYWNrZHJvcENsYXNzLFxyXG4gICAgICAgICAgICAgICAgICB3aW5kb3dUb3BDbGFzczogbW9kYWxPcHRpb25zLndpbmRvd1RvcENsYXNzLFxyXG4gICAgICAgICAgICAgICAgICB3aW5kb3dDbGFzczogbW9kYWxPcHRpb25zLndpbmRvd0NsYXNzLFxyXG4gICAgICAgICAgICAgICAgICB3aW5kb3dUZW1wbGF0ZVVybDogbW9kYWxPcHRpb25zLndpbmRvd1RlbXBsYXRlVXJsLFxyXG4gICAgICAgICAgICAgICAgICBhcmlhTGFiZWxsZWRCeTogbW9kYWxPcHRpb25zLmFyaWFMYWJlbGxlZEJ5LFxyXG4gICAgICAgICAgICAgICAgICBhcmlhRGVzY3JpYmVkQnk6IG1vZGFsT3B0aW9ucy5hcmlhRGVzY3JpYmVkQnksXHJcbiAgICAgICAgICAgICAgICAgIHNpemU6IG1vZGFsT3B0aW9ucy5zaXplLFxyXG4gICAgICAgICAgICAgICAgICBvcGVuZWRDbGFzczogbW9kYWxPcHRpb25zLm9wZW5lZENsYXNzLFxyXG4gICAgICAgICAgICAgICAgICBhcHBlbmRUbzogbW9kYWxPcHRpb25zLmFwcGVuZFRvXHJcbiAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgIHZhciBjb21wb25lbnQgPSB7fTtcclxuICAgICAgICAgICAgICAgIHZhciBjdHJsSW5zdGFuY2UsIGN0cmxJbnN0YW50aWF0ZSwgY3RybExvY2FscyA9IHt9O1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChtb2RhbE9wdGlvbnMuY29tcG9uZW50KSB7XHJcbiAgICAgICAgICAgICAgICAgIGNvbnN0cnVjdExvY2Fscyhjb21wb25lbnQsIGZhbHNlLCB0cnVlLCBmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICAgIGNvbXBvbmVudC5uYW1lID0gbW9kYWxPcHRpb25zLmNvbXBvbmVudDtcclxuICAgICAgICAgICAgICAgICAgbW9kYWwuY29tcG9uZW50ID0gY29tcG9uZW50O1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChtb2RhbE9wdGlvbnMuY29udHJvbGxlcikge1xyXG4gICAgICAgICAgICAgICAgICBjb25zdHJ1Y3RMb2NhbHMoY3RybExvY2FscywgdHJ1ZSwgZmFsc2UsIHRydWUpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgLy8gdGhlIHRoaXJkIHBhcmFtIHdpbGwgbWFrZSB0aGUgY29udHJvbGxlciBpbnN0YW50aWF0ZSBsYXRlcixwcml2YXRlIGFwaVxyXG4gICAgICAgICAgICAgICAgICAvLyBAc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2FuZ3VsYXIuanMvYmxvYi9tYXN0ZXIvc3JjL25nL2NvbnRyb2xsZXIuanMjTDEyNlxyXG4gICAgICAgICAgICAgICAgICBjdHJsSW5zdGFudGlhdGUgPSAkY29udHJvbGxlcihtb2RhbE9wdGlvbnMuY29udHJvbGxlciwgY3RybExvY2FscywgdHJ1ZSwgbW9kYWxPcHRpb25zLmNvbnRyb2xsZXJBcyk7XHJcbiAgICAgICAgICAgICAgICAgIGlmIChtb2RhbE9wdGlvbnMuY29udHJvbGxlckFzICYmIG1vZGFsT3B0aW9ucy5iaW5kVG9Db250cm9sbGVyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY3RybEluc3RhbmNlID0gY3RybEluc3RhbnRpYXRlLmluc3RhbmNlO1xyXG4gICAgICAgICAgICAgICAgICAgIGN0cmxJbnN0YW5jZS4kY2xvc2UgPSBtb2RhbFNjb3BlLiRjbG9zZTtcclxuICAgICAgICAgICAgICAgICAgICBjdHJsSW5zdGFuY2UuJGRpc21pc3MgPSBtb2RhbFNjb3BlLiRkaXNtaXNzO1xyXG4gICAgICAgICAgICAgICAgICAgIGFuZ3VsYXIuZXh0ZW5kKGN0cmxJbnN0YW5jZSwge1xyXG4gICAgICAgICAgICAgICAgICAgICAgJHJlc29sdmU6IGN0cmxMb2NhbHMuJHNjb3BlLiRyZXNvbHZlXHJcbiAgICAgICAgICAgICAgICAgICAgfSwgcHJvdmlkZWRTY29wZSk7XHJcbiAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgIGN0cmxJbnN0YW5jZSA9IGN0cmxJbnN0YW50aWF0ZSgpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgaWYgKGFuZ3VsYXIuaXNGdW5jdGlvbihjdHJsSW5zdGFuY2UuJG9uSW5pdCkpIHtcclxuICAgICAgICAgICAgICAgICAgICBjdHJsSW5zdGFuY2UuJG9uSW5pdCgpO1xyXG4gICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKCFtb2RhbE9wdGlvbnMuY29tcG9uZW50KSB7XHJcbiAgICAgICAgICAgICAgICAgIG1vZGFsLmNvbnRlbnQgPSB0cGxBbmRWYXJzWzBdO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICRtb2RhbFN0YWNrLm9wZW4obW9kYWxJbnN0YW5jZSwgbW9kYWwpO1xyXG4gICAgICAgICAgICAgICAgbW9kYWxPcGVuZWREZWZlcnJlZC5yZXNvbHZlKHRydWUpO1xyXG5cclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIGNvbnN0cnVjdExvY2FscyhvYmosIHRlbXBsYXRlLCBpbnN0YW5jZU9uU2NvcGUsIGluamVjdGFibGUpIHtcclxuICAgICAgICAgICAgICAgICAgb2JqLiRzY29wZSA9IG1vZGFsU2NvcGU7XHJcbiAgICAgICAgICAgICAgICAgIG9iai4kc2NvcGUuJHJlc29sdmUgPSB7fTtcclxuICAgICAgICAgICAgICAgICAgaWYgKGluc3RhbmNlT25TY29wZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIG9iai4kc2NvcGUuJHVpYk1vZGFsSW5zdGFuY2UgPSBtb2RhbEluc3RhbmNlO1xyXG4gICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIG9iai4kdWliTW9kYWxJbnN0YW5jZSA9IG1vZGFsSW5zdGFuY2U7XHJcbiAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgIHZhciByZXNvbHZlcyA9IHRlbXBsYXRlID8gdHBsQW5kVmFyc1sxXSA6IHRwbEFuZFZhcnM7XHJcbiAgICAgICAgICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaChyZXNvbHZlcywgZnVuY3Rpb24odmFsdWUsIGtleSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChpbmplY3RhYmxlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICBvYmpba2V5XSA9IHZhbHVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgb2JqLiRzY29wZS4kcmVzb2x2ZVtrZXldID0gdmFsdWU7XHJcbiAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LCBmdW5jdGlvbiByZXNvbHZlRXJyb3IocmVhc29uKSB7XHJcbiAgICAgICAgICAgICAgbW9kYWxPcGVuZWREZWZlcnJlZC5yZWplY3QocmVhc29uKTtcclxuICAgICAgICAgICAgICBtb2RhbFJlc3VsdERlZmVycmVkLnJlamVjdChyZWFzb24pO1xyXG4gICAgICAgICAgICB9KVsnZmluYWxseSddKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgIGlmIChwcm9taXNlQ2hhaW4gPT09IHNhbWVQcm9taXNlKSB7XHJcbiAgICAgICAgICAgICAgICBwcm9taXNlQ2hhaW4gPSBudWxsO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gbW9kYWxJbnN0YW5jZTtcclxuICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgcmV0dXJuICRtb2RhbDtcclxuICAgICAgICB9XHJcbiAgICAgIF1cclxuICAgIH07XHJcblxyXG4gICAgcmV0dXJuICRtb2RhbFByb3ZpZGVyO1xyXG4gIH0pO1xyXG5cclxuYW5ndWxhci5tb2R1bGUoJ3VpLmJvb3RzdHJhcC5wYWdpbmcnLCBbXSlcclxuLyoqXHJcbiAqIEhlbHBlciBpbnRlcm5hbCBzZXJ2aWNlIGZvciBnZW5lcmF0aW5nIGNvbW1vbiBjb250cm9sbGVyIGNvZGUgYmV0d2VlbiB0aGVcclxuICogcGFnZXIgYW5kIHBhZ2luYXRpb24gY29tcG9uZW50c1xyXG4gKi9cclxuLmZhY3RvcnkoJ3VpYlBhZ2luZycsIFsnJHBhcnNlJywgZnVuY3Rpb24oJHBhcnNlKSB7XHJcbiAgcmV0dXJuIHtcclxuICAgIGNyZWF0ZTogZnVuY3Rpb24oY3RybCwgJHNjb3BlLCAkYXR0cnMpIHtcclxuICAgICAgY3RybC5zZXROdW1QYWdlcyA9ICRhdHRycy5udW1QYWdlcyA/ICRwYXJzZSgkYXR0cnMubnVtUGFnZXMpLmFzc2lnbiA6IGFuZ3VsYXIubm9vcDtcclxuICAgICAgY3RybC5uZ01vZGVsQ3RybCA9IHsgJHNldFZpZXdWYWx1ZTogYW5ndWxhci5ub29wIH07IC8vIG51bGxNb2RlbEN0cmxcclxuICAgICAgY3RybC5fd2F0Y2hlcnMgPSBbXTtcclxuXHJcbiAgICAgIGN0cmwuaW5pdCA9IGZ1bmN0aW9uKG5nTW9kZWxDdHJsLCBjb25maWcpIHtcclxuICAgICAgICBjdHJsLm5nTW9kZWxDdHJsID0gbmdNb2RlbEN0cmw7XHJcbiAgICAgICAgY3RybC5jb25maWcgPSBjb25maWc7XHJcblxyXG4gICAgICAgIG5nTW9kZWxDdHJsLiRyZW5kZXIgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgIGN0cmwucmVuZGVyKCk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgaWYgKCRhdHRycy5pdGVtc1BlclBhZ2UpIHtcclxuICAgICAgICAgIGN0cmwuX3dhdGNoZXJzLnB1c2goJHNjb3BlLiRwYXJlbnQuJHdhdGNoKCRhdHRycy5pdGVtc1BlclBhZ2UsIGZ1bmN0aW9uKHZhbHVlKSB7XHJcbiAgICAgICAgICAgIGN0cmwuaXRlbXNQZXJQYWdlID0gcGFyc2VJbnQodmFsdWUsIDEwKTtcclxuICAgICAgICAgICAgJHNjb3BlLnRvdGFsUGFnZXMgPSBjdHJsLmNhbGN1bGF0ZVRvdGFsUGFnZXMoKTtcclxuICAgICAgICAgICAgY3RybC51cGRhdGVQYWdlKCk7XHJcbiAgICAgICAgICB9KSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGN0cmwuaXRlbXNQZXJQYWdlID0gY29uZmlnLml0ZW1zUGVyUGFnZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgICRzY29wZS4kd2F0Y2goJ3RvdGFsSXRlbXMnLCBmdW5jdGlvbihuZXdUb3RhbCwgb2xkVG90YWwpIHtcclxuICAgICAgICAgIGlmIChhbmd1bGFyLmlzRGVmaW5lZChuZXdUb3RhbCkgfHwgbmV3VG90YWwgIT09IG9sZFRvdGFsKSB7XHJcbiAgICAgICAgICAgICRzY29wZS50b3RhbFBhZ2VzID0gY3RybC5jYWxjdWxhdGVUb3RhbFBhZ2VzKCk7XHJcbiAgICAgICAgICAgIGN0cmwudXBkYXRlUGFnZSgpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9O1xyXG5cclxuICAgICAgY3RybC5jYWxjdWxhdGVUb3RhbFBhZ2VzID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIHRvdGFsUGFnZXMgPSBjdHJsLml0ZW1zUGVyUGFnZSA8IDEgPyAxIDogTWF0aC5jZWlsKCRzY29wZS50b3RhbEl0ZW1zIC8gY3RybC5pdGVtc1BlclBhZ2UpO1xyXG4gICAgICAgIHJldHVybiBNYXRoLm1heCh0b3RhbFBhZ2VzIHx8IDAsIDEpO1xyXG4gICAgICB9O1xyXG5cclxuICAgICAgY3RybC5yZW5kZXIgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAkc2NvcGUucGFnZSA9IHBhcnNlSW50KGN0cmwubmdNb2RlbEN0cmwuJHZpZXdWYWx1ZSwgMTApIHx8IDE7XHJcbiAgICAgIH07XHJcblxyXG4gICAgICAkc2NvcGUuc2VsZWN0UGFnZSA9IGZ1bmN0aW9uKHBhZ2UsIGV2dCkge1xyXG4gICAgICAgIGlmIChldnQpIHtcclxuICAgICAgICAgIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdmFyIGNsaWNrQWxsb3dlZCA9ICEkc2NvcGUubmdEaXNhYmxlZCB8fCAhZXZ0O1xyXG4gICAgICAgIGlmIChjbGlja0FsbG93ZWQgJiYgJHNjb3BlLnBhZ2UgIT09IHBhZ2UgJiYgcGFnZSA+IDAgJiYgcGFnZSA8PSAkc2NvcGUudG90YWxQYWdlcykge1xyXG4gICAgICAgICAgaWYgKGV2dCAmJiBldnQudGFyZ2V0KSB7XHJcbiAgICAgICAgICAgIGV2dC50YXJnZXQuYmx1cigpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgY3RybC5uZ01vZGVsQ3RybC4kc2V0Vmlld1ZhbHVlKHBhZ2UpO1xyXG4gICAgICAgICAgY3RybC5uZ01vZGVsQ3RybC4kcmVuZGVyKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9O1xyXG5cclxuICAgICAgJHNjb3BlLmdldFRleHQgPSBmdW5jdGlvbihrZXkpIHtcclxuICAgICAgICByZXR1cm4gJHNjb3BlW2tleSArICdUZXh0J10gfHwgY3RybC5jb25maWdba2V5ICsgJ1RleHQnXTtcclxuICAgICAgfTtcclxuXHJcbiAgICAgICRzY29wZS5ub1ByZXZpb3VzID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuICRzY29wZS5wYWdlID09PSAxO1xyXG4gICAgICB9O1xyXG5cclxuICAgICAgJHNjb3BlLm5vTmV4dCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiAkc2NvcGUucGFnZSA9PT0gJHNjb3BlLnRvdGFsUGFnZXM7XHJcbiAgICAgIH07XHJcblxyXG4gICAgICBjdHJsLnVwZGF0ZVBhZ2UgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICBjdHJsLnNldE51bVBhZ2VzKCRzY29wZS4kcGFyZW50LCAkc2NvcGUudG90YWxQYWdlcyk7IC8vIFJlYWRvbmx5IHZhcmlhYmxlXHJcblxyXG4gICAgICAgIGlmICgkc2NvcGUucGFnZSA+ICRzY29wZS50b3RhbFBhZ2VzKSB7XHJcbiAgICAgICAgICAkc2NvcGUuc2VsZWN0UGFnZSgkc2NvcGUudG90YWxQYWdlcyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGN0cmwubmdNb2RlbEN0cmwuJHJlbmRlcigpO1xyXG4gICAgICAgIH1cclxuICAgICAgfTtcclxuXHJcbiAgICAgICRzY29wZS4kb24oJyRkZXN0cm95JywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgd2hpbGUgKGN0cmwuX3dhdGNoZXJzLmxlbmd0aCkge1xyXG4gICAgICAgICAgY3RybC5fd2F0Y2hlcnMuc2hpZnQoKSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfTtcclxufV0pO1xyXG5cclxuYW5ndWxhci5tb2R1bGUoJ3VpLmJvb3RzdHJhcC5wYWdlcicsIFsndWkuYm9vdHN0cmFwLnBhZ2luZycsICd1aS5ib290c3RyYXAudGFiaW5kZXgnXSlcclxuXHJcbi5jb250cm9sbGVyKCdVaWJQYWdlckNvbnRyb2xsZXInLCBbJyRzY29wZScsICckYXR0cnMnLCAndWliUGFnaW5nJywgJ3VpYlBhZ2VyQ29uZmlnJywgZnVuY3Rpb24oJHNjb3BlLCAkYXR0cnMsIHVpYlBhZ2luZywgdWliUGFnZXJDb25maWcpIHtcclxuICAkc2NvcGUuYWxpZ24gPSBhbmd1bGFyLmlzRGVmaW5lZCgkYXR0cnMuYWxpZ24pID8gJHNjb3BlLiRwYXJlbnQuJGV2YWwoJGF0dHJzLmFsaWduKSA6IHVpYlBhZ2VyQ29uZmlnLmFsaWduO1xyXG5cclxuICB1aWJQYWdpbmcuY3JlYXRlKHRoaXMsICRzY29wZSwgJGF0dHJzKTtcclxufV0pXHJcblxyXG4uY29uc3RhbnQoJ3VpYlBhZ2VyQ29uZmlnJywge1xyXG4gIGl0ZW1zUGVyUGFnZTogMTAsXHJcbiAgcHJldmlvdXNUZXh0OiAnwqsgUHJldmlvdXMnLFxyXG4gIG5leHRUZXh0OiAnTmV4dCDCuycsXHJcbiAgYWxpZ246IHRydWVcclxufSlcclxuXHJcbi5kaXJlY3RpdmUoJ3VpYlBhZ2VyJywgWyd1aWJQYWdlckNvbmZpZycsIGZ1bmN0aW9uKHVpYlBhZ2VyQ29uZmlnKSB7XHJcbiAgcmV0dXJuIHtcclxuICAgIHNjb3BlOiB7XHJcbiAgICAgIHRvdGFsSXRlbXM6ICc9JyxcclxuICAgICAgcHJldmlvdXNUZXh0OiAnQCcsXHJcbiAgICAgIG5leHRUZXh0OiAnQCcsXHJcbiAgICAgIG5nRGlzYWJsZWQ6ICc9J1xyXG4gICAgfSxcclxuICAgIHJlcXVpcmU6IFsndWliUGFnZXInLCAnP25nTW9kZWwnXSxcclxuICAgIHJlc3RyaWN0OiAnQScsXHJcbiAgICBjb250cm9sbGVyOiAnVWliUGFnZXJDb250cm9sbGVyJyxcclxuICAgIGNvbnRyb2xsZXJBczogJ3BhZ2VyJyxcclxuICAgIHRlbXBsYXRlVXJsOiBmdW5jdGlvbihlbGVtZW50LCBhdHRycykge1xyXG4gICAgICByZXR1cm4gYXR0cnMudGVtcGxhdGVVcmwgfHwgJ3VpYi90ZW1wbGF0ZS9wYWdlci9wYWdlci5odG1sJztcclxuICAgIH0sXHJcbiAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxlbWVudCwgYXR0cnMsIGN0cmxzKSB7XHJcbiAgICAgIGVsZW1lbnQuYWRkQ2xhc3MoJ3BhZ2VyJyk7XHJcbiAgICAgIHZhciBwYWdpbmF0aW9uQ3RybCA9IGN0cmxzWzBdLCBuZ01vZGVsQ3RybCA9IGN0cmxzWzFdO1xyXG5cclxuICAgICAgaWYgKCFuZ01vZGVsQ3RybCkge1xyXG4gICAgICAgIHJldHVybjsgLy8gZG8gbm90aGluZyBpZiBubyBuZy1tb2RlbFxyXG4gICAgICB9XHJcblxyXG4gICAgICBwYWdpbmF0aW9uQ3RybC5pbml0KG5nTW9kZWxDdHJsLCB1aWJQYWdlckNvbmZpZyk7XHJcbiAgICB9XHJcbiAgfTtcclxufV0pO1xyXG5cclxuYW5ndWxhci5tb2R1bGUoJ3VpLmJvb3RzdHJhcC5wYWdpbmF0aW9uJywgWyd1aS5ib290c3RyYXAucGFnaW5nJywgJ3VpLmJvb3RzdHJhcC50YWJpbmRleCddKVxyXG4uY29udHJvbGxlcignVWliUGFnaW5hdGlvbkNvbnRyb2xsZXInLCBbJyRzY29wZScsICckYXR0cnMnLCAnJHBhcnNlJywgJ3VpYlBhZ2luZycsICd1aWJQYWdpbmF0aW9uQ29uZmlnJywgZnVuY3Rpb24oJHNjb3BlLCAkYXR0cnMsICRwYXJzZSwgdWliUGFnaW5nLCB1aWJQYWdpbmF0aW9uQ29uZmlnKSB7XHJcbiAgdmFyIGN0cmwgPSB0aGlzO1xyXG4gIC8vIFNldHVwIGNvbmZpZ3VyYXRpb24gcGFyYW1ldGVyc1xyXG4gIHZhciBtYXhTaXplID0gYW5ndWxhci5pc0RlZmluZWQoJGF0dHJzLm1heFNpemUpID8gJHNjb3BlLiRwYXJlbnQuJGV2YWwoJGF0dHJzLm1heFNpemUpIDogdWliUGFnaW5hdGlvbkNvbmZpZy5tYXhTaXplLFxyXG4gICAgcm90YXRlID0gYW5ndWxhci5pc0RlZmluZWQoJGF0dHJzLnJvdGF0ZSkgPyAkc2NvcGUuJHBhcmVudC4kZXZhbCgkYXR0cnMucm90YXRlKSA6IHVpYlBhZ2luYXRpb25Db25maWcucm90YXRlLFxyXG4gICAgZm9yY2VFbGxpcHNlcyA9IGFuZ3VsYXIuaXNEZWZpbmVkKCRhdHRycy5mb3JjZUVsbGlwc2VzKSA/ICRzY29wZS4kcGFyZW50LiRldmFsKCRhdHRycy5mb3JjZUVsbGlwc2VzKSA6IHVpYlBhZ2luYXRpb25Db25maWcuZm9yY2VFbGxpcHNlcyxcclxuICAgIGJvdW5kYXJ5TGlua051bWJlcnMgPSBhbmd1bGFyLmlzRGVmaW5lZCgkYXR0cnMuYm91bmRhcnlMaW5rTnVtYmVycykgPyAkc2NvcGUuJHBhcmVudC4kZXZhbCgkYXR0cnMuYm91bmRhcnlMaW5rTnVtYmVycykgOiB1aWJQYWdpbmF0aW9uQ29uZmlnLmJvdW5kYXJ5TGlua051bWJlcnMsXHJcbiAgICBwYWdlTGFiZWwgPSBhbmd1bGFyLmlzRGVmaW5lZCgkYXR0cnMucGFnZUxhYmVsKSA/IGZ1bmN0aW9uKGlkeCkgeyByZXR1cm4gJHNjb3BlLiRwYXJlbnQuJGV2YWwoJGF0dHJzLnBhZ2VMYWJlbCwgeyRwYWdlOiBpZHh9KTsgfSA6IGFuZ3VsYXIuaWRlbnRpdHk7XHJcbiAgJHNjb3BlLmJvdW5kYXJ5TGlua3MgPSBhbmd1bGFyLmlzRGVmaW5lZCgkYXR0cnMuYm91bmRhcnlMaW5rcykgPyAkc2NvcGUuJHBhcmVudC4kZXZhbCgkYXR0cnMuYm91bmRhcnlMaW5rcykgOiB1aWJQYWdpbmF0aW9uQ29uZmlnLmJvdW5kYXJ5TGlua3M7XHJcbiAgJHNjb3BlLmRpcmVjdGlvbkxpbmtzID0gYW5ndWxhci5pc0RlZmluZWQoJGF0dHJzLmRpcmVjdGlvbkxpbmtzKSA/ICRzY29wZS4kcGFyZW50LiRldmFsKCRhdHRycy5kaXJlY3Rpb25MaW5rcykgOiB1aWJQYWdpbmF0aW9uQ29uZmlnLmRpcmVjdGlvbkxpbmtzO1xyXG5cclxuICB1aWJQYWdpbmcuY3JlYXRlKHRoaXMsICRzY29wZSwgJGF0dHJzKTtcclxuXHJcbiAgaWYgKCRhdHRycy5tYXhTaXplKSB7XHJcbiAgICBjdHJsLl93YXRjaGVycy5wdXNoKCRzY29wZS4kcGFyZW50LiR3YXRjaCgkcGFyc2UoJGF0dHJzLm1heFNpemUpLCBmdW5jdGlvbih2YWx1ZSkge1xyXG4gICAgICBtYXhTaXplID0gcGFyc2VJbnQodmFsdWUsIDEwKTtcclxuICAgICAgY3RybC5yZW5kZXIoKTtcclxuICAgIH0pKTtcclxuICB9XHJcblxyXG4gIC8vIENyZWF0ZSBwYWdlIG9iamVjdCB1c2VkIGluIHRlbXBsYXRlXHJcbiAgZnVuY3Rpb24gbWFrZVBhZ2UobnVtYmVyLCB0ZXh0LCBpc0FjdGl2ZSkge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgbnVtYmVyOiBudW1iZXIsXHJcbiAgICAgIHRleHQ6IHRleHQsXHJcbiAgICAgIGFjdGl2ZTogaXNBY3RpdmVcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBnZXRQYWdlcyhjdXJyZW50UGFnZSwgdG90YWxQYWdlcykge1xyXG4gICAgdmFyIHBhZ2VzID0gW107XHJcblxyXG4gICAgLy8gRGVmYXVsdCBwYWdlIGxpbWl0c1xyXG4gICAgdmFyIHN0YXJ0UGFnZSA9IDEsIGVuZFBhZ2UgPSB0b3RhbFBhZ2VzO1xyXG4gICAgdmFyIGlzTWF4U2l6ZWQgPSBhbmd1bGFyLmlzRGVmaW5lZChtYXhTaXplKSAmJiBtYXhTaXplIDwgdG90YWxQYWdlcztcclxuXHJcbiAgICAvLyByZWNvbXB1dGUgaWYgbWF4U2l6ZVxyXG4gICAgaWYgKGlzTWF4U2l6ZWQpIHtcclxuICAgICAgaWYgKHJvdGF0ZSkge1xyXG4gICAgICAgIC8vIEN1cnJlbnQgcGFnZSBpcyBkaXNwbGF5ZWQgaW4gdGhlIG1pZGRsZSBvZiB0aGUgdmlzaWJsZSBvbmVzXHJcbiAgICAgICAgc3RhcnRQYWdlID0gTWF0aC5tYXgoY3VycmVudFBhZ2UgLSBNYXRoLmZsb29yKG1heFNpemUgLyAyKSwgMSk7XHJcbiAgICAgICAgZW5kUGFnZSA9IHN0YXJ0UGFnZSArIG1heFNpemUgLSAxO1xyXG5cclxuICAgICAgICAvLyBBZGp1c3QgaWYgbGltaXQgaXMgZXhjZWVkZWRcclxuICAgICAgICBpZiAoZW5kUGFnZSA+IHRvdGFsUGFnZXMpIHtcclxuICAgICAgICAgIGVuZFBhZ2UgPSB0b3RhbFBhZ2VzO1xyXG4gICAgICAgICAgc3RhcnRQYWdlID0gZW5kUGFnZSAtIG1heFNpemUgKyAxO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICAvLyBWaXNpYmxlIHBhZ2VzIGFyZSBwYWdpbmF0ZWQgd2l0aCBtYXhTaXplXHJcbiAgICAgICAgc3RhcnRQYWdlID0gKE1hdGguY2VpbChjdXJyZW50UGFnZSAvIG1heFNpemUpIC0gMSkgKiBtYXhTaXplICsgMTtcclxuXHJcbiAgICAgICAgLy8gQWRqdXN0IGxhc3QgcGFnZSBpZiBsaW1pdCBpcyBleGNlZWRlZFxyXG4gICAgICAgIGVuZFBhZ2UgPSBNYXRoLm1pbihzdGFydFBhZ2UgKyBtYXhTaXplIC0gMSwgdG90YWxQYWdlcyk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBBZGQgcGFnZSBudW1iZXIgbGlua3NcclxuICAgIGZvciAodmFyIG51bWJlciA9IHN0YXJ0UGFnZTsgbnVtYmVyIDw9IGVuZFBhZ2U7IG51bWJlcisrKSB7XHJcbiAgICAgIHZhciBwYWdlID0gbWFrZVBhZ2UobnVtYmVyLCBwYWdlTGFiZWwobnVtYmVyKSwgbnVtYmVyID09PSBjdXJyZW50UGFnZSk7XHJcbiAgICAgIHBhZ2VzLnB1c2gocGFnZSk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQWRkIGxpbmtzIHRvIG1vdmUgYmV0d2VlbiBwYWdlIHNldHNcclxuICAgIGlmIChpc01heFNpemVkICYmIG1heFNpemUgPiAwICYmICghcm90YXRlIHx8IGZvcmNlRWxsaXBzZXMgfHwgYm91bmRhcnlMaW5rTnVtYmVycykpIHtcclxuICAgICAgaWYgKHN0YXJ0UGFnZSA+IDEpIHtcclxuICAgICAgICBpZiAoIWJvdW5kYXJ5TGlua051bWJlcnMgfHwgc3RhcnRQYWdlID4gMykgeyAvL25lZWQgZWxsaXBzaXMgZm9yIGFsbCBvcHRpb25zIHVubGVzcyByYW5nZSBpcyB0b28gY2xvc2UgdG8gYmVnaW5uaW5nXHJcbiAgICAgICAgdmFyIHByZXZpb3VzUGFnZVNldCA9IG1ha2VQYWdlKHN0YXJ0UGFnZSAtIDEsICcuLi4nLCBmYWxzZSk7XHJcbiAgICAgICAgcGFnZXMudW5zaGlmdChwcmV2aW91c1BhZ2VTZXQpO1xyXG4gICAgICB9XHJcbiAgICAgICAgaWYgKGJvdW5kYXJ5TGlua051bWJlcnMpIHtcclxuICAgICAgICAgIGlmIChzdGFydFBhZ2UgPT09IDMpIHsgLy9uZWVkIHRvIHJlcGxhY2UgZWxsaXBzaXMgd2hlbiB0aGUgYnV0dG9ucyB3b3VsZCBiZSBzZXF1ZW50aWFsXHJcbiAgICAgICAgICAgIHZhciBzZWNvbmRQYWdlTGluayA9IG1ha2VQYWdlKDIsICcyJywgZmFsc2UpO1xyXG4gICAgICAgICAgICBwYWdlcy51bnNoaWZ0KHNlY29uZFBhZ2VMaW5rKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIC8vYWRkIHRoZSBmaXJzdCBwYWdlXHJcbiAgICAgICAgICB2YXIgZmlyc3RQYWdlTGluayA9IG1ha2VQYWdlKDEsICcxJywgZmFsc2UpO1xyXG4gICAgICAgICAgcGFnZXMudW5zaGlmdChmaXJzdFBhZ2VMaW5rKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChlbmRQYWdlIDwgdG90YWxQYWdlcykge1xyXG4gICAgICAgIGlmICghYm91bmRhcnlMaW5rTnVtYmVycyB8fCBlbmRQYWdlIDwgdG90YWxQYWdlcyAtIDIpIHsgLy9uZWVkIGVsbGlwc2lzIGZvciBhbGwgb3B0aW9ucyB1bmxlc3MgcmFuZ2UgaXMgdG9vIGNsb3NlIHRvIGVuZFxyXG4gICAgICAgIHZhciBuZXh0UGFnZVNldCA9IG1ha2VQYWdlKGVuZFBhZ2UgKyAxLCAnLi4uJywgZmFsc2UpO1xyXG4gICAgICAgIHBhZ2VzLnB1c2gobmV4dFBhZ2VTZXQpO1xyXG4gICAgICB9XHJcbiAgICAgICAgaWYgKGJvdW5kYXJ5TGlua051bWJlcnMpIHtcclxuICAgICAgICAgIGlmIChlbmRQYWdlID09PSB0b3RhbFBhZ2VzIC0gMikgeyAvL25lZWQgdG8gcmVwbGFjZSBlbGxpcHNpcyB3aGVuIHRoZSBidXR0b25zIHdvdWxkIGJlIHNlcXVlbnRpYWxcclxuICAgICAgICAgICAgdmFyIHNlY29uZFRvTGFzdFBhZ2VMaW5rID0gbWFrZVBhZ2UodG90YWxQYWdlcyAtIDEsIHRvdGFsUGFnZXMgLSAxLCBmYWxzZSk7XHJcbiAgICAgICAgICAgIHBhZ2VzLnB1c2goc2Vjb25kVG9MYXN0UGFnZUxpbmspO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgLy9hZGQgdGhlIGxhc3QgcGFnZVxyXG4gICAgICAgICAgdmFyIGxhc3RQYWdlTGluayA9IG1ha2VQYWdlKHRvdGFsUGFnZXMsIHRvdGFsUGFnZXMsIGZhbHNlKTtcclxuICAgICAgICAgIHBhZ2VzLnB1c2gobGFzdFBhZ2VMaW5rKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBwYWdlcztcclxuICB9XHJcblxyXG4gIHZhciBvcmlnaW5hbFJlbmRlciA9IHRoaXMucmVuZGVyO1xyXG4gIHRoaXMucmVuZGVyID0gZnVuY3Rpb24oKSB7XHJcbiAgICBvcmlnaW5hbFJlbmRlcigpO1xyXG4gICAgaWYgKCRzY29wZS5wYWdlID4gMCAmJiAkc2NvcGUucGFnZSA8PSAkc2NvcGUudG90YWxQYWdlcykge1xyXG4gICAgICAkc2NvcGUucGFnZXMgPSBnZXRQYWdlcygkc2NvcGUucGFnZSwgJHNjb3BlLnRvdGFsUGFnZXMpO1xyXG4gICAgfVxyXG4gIH07XHJcbn1dKVxyXG5cclxuLmNvbnN0YW50KCd1aWJQYWdpbmF0aW9uQ29uZmlnJywge1xyXG4gIGl0ZW1zUGVyUGFnZTogMTAsXHJcbiAgYm91bmRhcnlMaW5rczogZmFsc2UsXHJcbiAgYm91bmRhcnlMaW5rTnVtYmVyczogZmFsc2UsXHJcbiAgZGlyZWN0aW9uTGlua3M6IHRydWUsXHJcbiAgZmlyc3RUZXh0OiAnRmlyc3QnLFxyXG4gIHByZXZpb3VzVGV4dDogJ1ByZXZpb3VzJyxcclxuICBuZXh0VGV4dDogJ05leHQnLFxyXG4gIGxhc3RUZXh0OiAnTGFzdCcsXHJcbiAgcm90YXRlOiB0cnVlLFxyXG4gIGZvcmNlRWxsaXBzZXM6IGZhbHNlXHJcbn0pXHJcblxyXG4uZGlyZWN0aXZlKCd1aWJQYWdpbmF0aW9uJywgWyckcGFyc2UnLCAndWliUGFnaW5hdGlvbkNvbmZpZycsIGZ1bmN0aW9uKCRwYXJzZSwgdWliUGFnaW5hdGlvbkNvbmZpZykge1xyXG4gIHJldHVybiB7XHJcbiAgICBzY29wZToge1xyXG4gICAgICB0b3RhbEl0ZW1zOiAnPScsXHJcbiAgICAgIGZpcnN0VGV4dDogJ0AnLFxyXG4gICAgICBwcmV2aW91c1RleHQ6ICdAJyxcclxuICAgICAgbmV4dFRleHQ6ICdAJyxcclxuICAgICAgbGFzdFRleHQ6ICdAJyxcclxuICAgICAgbmdEaXNhYmxlZDonPSdcclxuICAgIH0sXHJcbiAgICByZXF1aXJlOiBbJ3VpYlBhZ2luYXRpb24nLCAnP25nTW9kZWwnXSxcclxuICAgIHJlc3RyaWN0OiAnQScsXHJcbiAgICBjb250cm9sbGVyOiAnVWliUGFnaW5hdGlvbkNvbnRyb2xsZXInLFxyXG4gICAgY29udHJvbGxlckFzOiAncGFnaW5hdGlvbicsXHJcbiAgICB0ZW1wbGF0ZVVybDogZnVuY3Rpb24oZWxlbWVudCwgYXR0cnMpIHtcclxuICAgICAgcmV0dXJuIGF0dHJzLnRlbXBsYXRlVXJsIHx8ICd1aWIvdGVtcGxhdGUvcGFnaW5hdGlvbi9wYWdpbmF0aW9uLmh0bWwnO1xyXG4gICAgfSxcclxuICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBlbGVtZW50LCBhdHRycywgY3RybHMpIHtcclxuICAgICAgZWxlbWVudC5hZGRDbGFzcygncGFnaW5hdGlvbicpO1xyXG4gICAgICB2YXIgcGFnaW5hdGlvbkN0cmwgPSBjdHJsc1swXSwgbmdNb2RlbEN0cmwgPSBjdHJsc1sxXTtcclxuXHJcbiAgICAgIGlmICghbmdNb2RlbEN0cmwpIHtcclxuICAgICAgICAgcmV0dXJuOyAvLyBkbyBub3RoaW5nIGlmIG5vIG5nLW1vZGVsXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHBhZ2luYXRpb25DdHJsLmluaXQobmdNb2RlbEN0cmwsIHVpYlBhZ2luYXRpb25Db25maWcpO1xyXG4gICAgfVxyXG4gIH07XHJcbn1dKTtcclxuXHJcbi8qKlxyXG4gKiBUaGUgZm9sbG93aW5nIGZlYXR1cmVzIGFyZSBzdGlsbCBvdXRzdGFuZGluZzogYW5pbWF0aW9uIGFzIGFcclxuICogZnVuY3Rpb24sIHBsYWNlbWVudCBhcyBhIGZ1bmN0aW9uLCBpbnNpZGUsIHN1cHBvcnQgZm9yIG1vcmUgdHJpZ2dlcnMgdGhhblxyXG4gKiBqdXN0IG1vdXNlIGVudGVyL2xlYXZlLCBodG1sIHRvb2x0aXBzLCBhbmQgc2VsZWN0b3IgZGVsZWdhdGlvbi5cclxuICovXHJcbmFuZ3VsYXIubW9kdWxlKCd1aS5ib290c3RyYXAudG9vbHRpcCcsIFsndWkuYm9vdHN0cmFwLnBvc2l0aW9uJywgJ3VpLmJvb3RzdHJhcC5zdGFja2VkTWFwJ10pXHJcblxyXG4vKipcclxuICogVGhlICR0b29sdGlwIHNlcnZpY2UgY3JlYXRlcyB0b29sdGlwLSBhbmQgcG9wb3Zlci1saWtlIGRpcmVjdGl2ZXMgYXMgd2VsbCBhc1xyXG4gKiBob3VzZXMgZ2xvYmFsIG9wdGlvbnMgZm9yIHRoZW0uXHJcbiAqL1xyXG4ucHJvdmlkZXIoJyR1aWJUb29sdGlwJywgZnVuY3Rpb24oKSB7XHJcbiAgLy8gVGhlIGRlZmF1bHQgb3B0aW9ucyB0b29sdGlwIGFuZCBwb3BvdmVyLlxyXG4gIHZhciBkZWZhdWx0T3B0aW9ucyA9IHtcclxuICAgIHBsYWNlbWVudDogJ3RvcCcsXHJcbiAgICBwbGFjZW1lbnRDbGFzc1ByZWZpeDogJycsXHJcbiAgICBhbmltYXRpb246IHRydWUsXHJcbiAgICBwb3B1cERlbGF5OiAwLFxyXG4gICAgcG9wdXBDbG9zZURlbGF5OiAwLFxyXG4gICAgdXNlQ29udGVudEV4cDogZmFsc2VcclxuICB9O1xyXG5cclxuICAvLyBEZWZhdWx0IGhpZGUgdHJpZ2dlcnMgZm9yIGVhY2ggc2hvdyB0cmlnZ2VyXHJcbiAgdmFyIHRyaWdnZXJNYXAgPSB7XHJcbiAgICAnbW91c2VlbnRlcic6ICdtb3VzZWxlYXZlJyxcclxuICAgICdjbGljayc6ICdjbGljaycsXHJcbiAgICAnb3V0c2lkZUNsaWNrJzogJ291dHNpZGVDbGljaycsXHJcbiAgICAnZm9jdXMnOiAnYmx1cicsXHJcbiAgICAnbm9uZSc6ICcnXHJcbiAgfTtcclxuXHJcbiAgLy8gVGhlIG9wdGlvbnMgc3BlY2lmaWVkIHRvIHRoZSBwcm92aWRlciBnbG9iYWxseS5cclxuICB2YXIgZ2xvYmFsT3B0aW9ucyA9IHt9O1xyXG5cclxuICAvKipcclxuICAgKiBgb3B0aW9ucyh7fSlgIGFsbG93cyBnbG9iYWwgY29uZmlndXJhdGlvbiBvZiBhbGwgdG9vbHRpcHMgaW4gdGhlXHJcbiAgICogYXBwbGljYXRpb24uXHJcbiAgICpcclxuICAgKiAgIHZhciBhcHAgPSBhbmd1bGFyLm1vZHVsZSggJ0FwcCcsIFsndWkuYm9vdHN0cmFwLnRvb2x0aXAnXSwgZnVuY3Rpb24oICR0b29sdGlwUHJvdmlkZXIgKSB7XHJcbiAgICogICAgIC8vIHBsYWNlIHRvb2x0aXBzIGxlZnQgaW5zdGVhZCBvZiB0b3AgYnkgZGVmYXVsdFxyXG4gICAqICAgICAkdG9vbHRpcFByb3ZpZGVyLm9wdGlvbnMoIHsgcGxhY2VtZW50OiAnbGVmdCcgfSApO1xyXG4gICAqICAgfSk7XHJcbiAgICovXHJcblx0dGhpcy5vcHRpb25zID0gZnVuY3Rpb24odmFsdWUpIHtcclxuXHRcdGFuZ3VsYXIuZXh0ZW5kKGdsb2JhbE9wdGlvbnMsIHZhbHVlKTtcclxuXHR9O1xyXG5cclxuICAvKipcclxuICAgKiBUaGlzIGFsbG93cyB5b3UgdG8gZXh0ZW5kIHRoZSBzZXQgb2YgdHJpZ2dlciBtYXBwaW5ncyBhdmFpbGFibGUuIEUuZy46XHJcbiAgICpcclxuICAgKiAgICR0b29sdGlwUHJvdmlkZXIuc2V0VHJpZ2dlcnMoIHsgJ29wZW5UcmlnZ2VyJzogJ2Nsb3NlVHJpZ2dlcicgfSApO1xyXG4gICAqL1xyXG4gIHRoaXMuc2V0VHJpZ2dlcnMgPSBmdW5jdGlvbiBzZXRUcmlnZ2Vycyh0cmlnZ2Vycykge1xyXG4gICAgYW5ndWxhci5leHRlbmQodHJpZ2dlck1hcCwgdHJpZ2dlcnMpO1xyXG4gIH07XHJcblxyXG4gIC8qKlxyXG4gICAqIFRoaXMgaXMgYSBoZWxwZXIgZnVuY3Rpb24gZm9yIHRyYW5zbGF0aW5nIGNhbWVsLWNhc2UgdG8gc25ha2VfY2FzZS5cclxuICAgKi9cclxuICBmdW5jdGlvbiBzbmFrZV9jYXNlKG5hbWUpIHtcclxuICAgIHZhciByZWdleHAgPSAvW0EtWl0vZztcclxuICAgIHZhciBzZXBhcmF0b3IgPSAnLSc7XHJcbiAgICByZXR1cm4gbmFtZS5yZXBsYWNlKHJlZ2V4cCwgZnVuY3Rpb24obGV0dGVyLCBwb3MpIHtcclxuICAgICAgcmV0dXJuIChwb3MgPyBzZXBhcmF0b3IgOiAnJykgKyBsZXR0ZXIudG9Mb3dlckNhc2UoKTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgYWN0dWFsIGluc3RhbmNlIG9mIHRoZSAkdG9vbHRpcCBzZXJ2aWNlLlxyXG4gICAqIFRPRE8gc3VwcG9ydCBtdWx0aXBsZSB0cmlnZ2Vyc1xyXG4gICAqL1xyXG4gIHRoaXMuJGdldCA9IFsnJHdpbmRvdycsICckY29tcGlsZScsICckdGltZW91dCcsICckZG9jdW1lbnQnLCAnJHVpYlBvc2l0aW9uJywgJyRpbnRlcnBvbGF0ZScsICckcm9vdFNjb3BlJywgJyRwYXJzZScsICckJHN0YWNrZWRNYXAnLCBmdW5jdGlvbigkd2luZG93LCAkY29tcGlsZSwgJHRpbWVvdXQsICRkb2N1bWVudCwgJHBvc2l0aW9uLCAkaW50ZXJwb2xhdGUsICRyb290U2NvcGUsICRwYXJzZSwgJCRzdGFja2VkTWFwKSB7XHJcbiAgICB2YXIgb3BlbmVkVG9vbHRpcHMgPSAkJHN0YWNrZWRNYXAuY3JlYXRlTmV3KCk7XHJcbiAgICAkZG9jdW1lbnQub24oJ2tleXVwJywga2V5cHJlc3NMaXN0ZW5lcik7XHJcblxyXG4gICAgJHJvb3RTY29wZS4kb24oJyRkZXN0cm95JywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICRkb2N1bWVudC5vZmYoJ2tleXVwJywga2V5cHJlc3NMaXN0ZW5lcik7XHJcbiAgICB9KTtcclxuXHJcbiAgICBmdW5jdGlvbiBrZXlwcmVzc0xpc3RlbmVyKGUpIHtcclxuICAgICAgaWYgKGUud2hpY2ggPT09IDI3KSB7XHJcbiAgICAgICAgdmFyIGxhc3QgPSBvcGVuZWRUb29sdGlwcy50b3AoKTtcclxuICAgICAgICBpZiAobGFzdCkge1xyXG4gICAgICAgICAgbGFzdC52YWx1ZS5jbG9zZSgpO1xyXG4gICAgICAgICAgbGFzdCA9IG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGZ1bmN0aW9uICR0b29sdGlwKHR0VHlwZSwgcHJlZml4LCBkZWZhdWx0VHJpZ2dlclNob3csIG9wdGlvbnMpIHtcclxuICAgICAgb3B0aW9ucyA9IGFuZ3VsYXIuZXh0ZW5kKHt9LCBkZWZhdWx0T3B0aW9ucywgZ2xvYmFsT3B0aW9ucywgb3B0aW9ucyk7XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogUmV0dXJucyBhbiBvYmplY3Qgb2Ygc2hvdyBhbmQgaGlkZSB0cmlnZ2Vycy5cclxuICAgICAgICpcclxuICAgICAgICogSWYgYSB0cmlnZ2VyIGlzIHN1cHBsaWVkLFxyXG4gICAgICAgKiBpdCBpcyB1c2VkIHRvIHNob3cgdGhlIHRvb2x0aXA7IG90aGVyd2lzZSwgaXQgd2lsbCB1c2UgdGhlIGB0cmlnZ2VyYFxyXG4gICAgICAgKiBvcHRpb24gcGFzc2VkIHRvIHRoZSBgJHRvb2x0aXBQcm92aWRlci5vcHRpb25zYCBtZXRob2Q7IGVsc2UgaXQgd2lsbFxyXG4gICAgICAgKiBkZWZhdWx0IHRvIHRoZSB0cmlnZ2VyIHN1cHBsaWVkIHRvIHRoaXMgZGlyZWN0aXZlIGZhY3RvcnkuXHJcbiAgICAgICAqXHJcbiAgICAgICAqIFRoZSBoaWRlIHRyaWdnZXIgaXMgYmFzZWQgb24gdGhlIHNob3cgdHJpZ2dlci4gSWYgdGhlIGB0cmlnZ2VyYCBvcHRpb25cclxuICAgICAgICogd2FzIHBhc3NlZCB0byB0aGUgYCR0b29sdGlwUHJvdmlkZXIub3B0aW9uc2AgbWV0aG9kLCBpdCB3aWxsIHVzZSB0aGVcclxuICAgICAgICogbWFwcGVkIHRyaWdnZXIgZnJvbSBgdHJpZ2dlck1hcGAgb3IgdGhlIHBhc3NlZCB0cmlnZ2VyIGlmIHRoZSBtYXAgaXNcclxuICAgICAgICogdW5kZWZpbmVkOyBvdGhlcndpc2UsIGl0IHVzZXMgdGhlIGB0cmlnZ2VyTWFwYCB2YWx1ZSBvZiB0aGUgc2hvd1xyXG4gICAgICAgKiB0cmlnZ2VyOyBlbHNlIGl0IHdpbGwganVzdCB1c2UgdGhlIHNob3cgdHJpZ2dlci5cclxuICAgICAgICovXHJcbiAgICAgIGZ1bmN0aW9uIGdldFRyaWdnZXJzKHRyaWdnZXIpIHtcclxuICAgICAgICB2YXIgc2hvdyA9ICh0cmlnZ2VyIHx8IG9wdGlvbnMudHJpZ2dlciB8fCBkZWZhdWx0VHJpZ2dlclNob3cpLnNwbGl0KCcgJyk7XHJcbiAgICAgICAgdmFyIGhpZGUgPSBzaG93Lm1hcChmdW5jdGlvbih0cmlnZ2VyKSB7XHJcbiAgICAgICAgICByZXR1cm4gdHJpZ2dlck1hcFt0cmlnZ2VyXSB8fCB0cmlnZ2VyO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICBzaG93OiBzaG93LFxyXG4gICAgICAgICAgaGlkZTogaGlkZVxyXG4gICAgICAgIH07XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHZhciBkaXJlY3RpdmVOYW1lID0gc25ha2VfY2FzZSh0dFR5cGUpO1xyXG5cclxuICAgICAgdmFyIHN0YXJ0U3ltID0gJGludGVycG9sYXRlLnN0YXJ0U3ltYm9sKCk7XHJcbiAgICAgIHZhciBlbmRTeW0gPSAkaW50ZXJwb2xhdGUuZW5kU3ltYm9sKCk7XHJcbiAgICAgIHZhciB0ZW1wbGF0ZSA9XHJcbiAgICAgICAgJzxkaXYgJysgZGlyZWN0aXZlTmFtZSArICctcG9wdXAgJyArXHJcbiAgICAgICAgICAndWliLXRpdGxlPVwiJyArIHN0YXJ0U3ltICsgJ3RpdGxlJyArIGVuZFN5bSArICdcIiAnICtcclxuICAgICAgICAgIChvcHRpb25zLnVzZUNvbnRlbnRFeHAgP1xyXG4gICAgICAgICAgICAnY29udGVudC1leHA9XCJjb250ZW50RXhwKClcIiAnIDpcclxuICAgICAgICAgICAgJ2NvbnRlbnQ9XCInICsgc3RhcnRTeW0gKyAnY29udGVudCcgKyBlbmRTeW0gKyAnXCIgJykgK1xyXG4gICAgICAgICAgJ29yaWdpbi1zY29wZT1cIm9yaWdTY29wZVwiICcgK1xyXG4gICAgICAgICAgJ2NsYXNzPVwidWliLXBvc2l0aW9uLW1lYXN1cmUgJyArIHByZWZpeCArICdcIiAnICtcclxuICAgICAgICAgICd0b29sdGlwLWFuaW1hdGlvbi1jbGFzcz1cImZhZGVcIicgK1xyXG4gICAgICAgICAgJ3VpYi10b29sdGlwLWNsYXNzZXMgJyArXHJcbiAgICAgICAgICAnbmctY2xhc3M9XCJ7IGluOiBpc09wZW4gfVwiICcgK1xyXG4gICAgICAgICAgJz4nICtcclxuICAgICAgICAnPC9kaXY+JztcclxuXHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgY29tcGlsZTogZnVuY3Rpb24odEVsZW0sIHRBdHRycykge1xyXG4gICAgICAgICAgdmFyIHRvb2x0aXBMaW5rZXIgPSAkY29tcGlsZSh0ZW1wbGF0ZSk7XHJcblxyXG4gICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIGxpbmsoc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCB0b29sdGlwQ3RybCkge1xyXG4gICAgICAgICAgICB2YXIgdG9vbHRpcDtcclxuICAgICAgICAgICAgdmFyIHRvb2x0aXBMaW5rZWRTY29wZTtcclxuICAgICAgICAgICAgdmFyIHRyYW5zaXRpb25UaW1lb3V0O1xyXG4gICAgICAgICAgICB2YXIgc2hvd1RpbWVvdXQ7XHJcbiAgICAgICAgICAgIHZhciBoaWRlVGltZW91dDtcclxuICAgICAgICAgICAgdmFyIHBvc2l0aW9uVGltZW91dDtcclxuICAgICAgICAgICAgdmFyIGFwcGVuZFRvQm9keSA9IGFuZ3VsYXIuaXNEZWZpbmVkKG9wdGlvbnMuYXBwZW5kVG9Cb2R5KSA/IG9wdGlvbnMuYXBwZW5kVG9Cb2R5IDogZmFsc2U7XHJcbiAgICAgICAgICAgIHZhciB0cmlnZ2VycyA9IGdldFRyaWdnZXJzKHVuZGVmaW5lZCk7XHJcbiAgICAgICAgICAgIHZhciBoYXNFbmFibGVFeHAgPSBhbmd1bGFyLmlzRGVmaW5lZChhdHRyc1twcmVmaXggKyAnRW5hYmxlJ10pO1xyXG4gICAgICAgICAgICB2YXIgdHRTY29wZSA9IHNjb3BlLiRuZXcodHJ1ZSk7XHJcbiAgICAgICAgICAgIHZhciByZXBvc2l0aW9uU2NoZWR1bGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHZhciBpc09wZW5QYXJzZSA9IGFuZ3VsYXIuaXNEZWZpbmVkKGF0dHJzW3ByZWZpeCArICdJc09wZW4nXSkgPyAkcGFyc2UoYXR0cnNbcHJlZml4ICsgJ0lzT3BlbiddKSA6IGZhbHNlO1xyXG4gICAgICAgICAgICB2YXIgY29udGVudFBhcnNlID0gb3B0aW9ucy51c2VDb250ZW50RXhwID8gJHBhcnNlKGF0dHJzW3R0VHlwZV0pIDogZmFsc2U7XHJcbiAgICAgICAgICAgIHZhciBvYnNlcnZlcnMgPSBbXTtcclxuICAgICAgICAgICAgdmFyIGxhc3RQbGFjZW1lbnQ7XHJcblxyXG4gICAgICAgICAgICB2YXIgcG9zaXRpb25Ub29sdGlwID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgLy8gY2hlY2sgaWYgdG9vbHRpcCBleGlzdHMgYW5kIGlzIG5vdCBlbXB0eVxyXG4gICAgICAgICAgICAgIGlmICghdG9vbHRpcCB8fCAhdG9vbHRpcC5odG1sKCkpIHsgcmV0dXJuOyB9XHJcblxyXG4gICAgICAgICAgICAgIGlmICghcG9zaXRpb25UaW1lb3V0KSB7XHJcbiAgICAgICAgICAgICAgICBwb3NpdGlvblRpbWVvdXQgPSAkdGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgdmFyIHR0UG9zaXRpb24gPSAkcG9zaXRpb24ucG9zaXRpb25FbGVtZW50cyhlbGVtZW50LCB0b29sdGlwLCB0dFNjb3BlLnBsYWNlbWVudCwgYXBwZW5kVG9Cb2R5KTtcclxuICAgICAgICAgICAgICAgICAgdmFyIGluaXRpYWxIZWlnaHQgPSBhbmd1bGFyLmlzRGVmaW5lZCh0b29sdGlwLm9mZnNldEhlaWdodCkgPyB0b29sdGlwLm9mZnNldEhlaWdodCA6IHRvb2x0aXAucHJvcCgnb2Zmc2V0SGVpZ2h0Jyk7XHJcbiAgICAgICAgICAgICAgICAgIHZhciBlbGVtZW50UG9zID0gYXBwZW5kVG9Cb2R5ID8gJHBvc2l0aW9uLm9mZnNldChlbGVtZW50KSA6ICRwb3NpdGlvbi5wb3NpdGlvbihlbGVtZW50KTtcclxuICAgICAgICAgICAgICAgICAgdG9vbHRpcC5jc3MoeyB0b3A6IHR0UG9zaXRpb24udG9wICsgJ3B4JywgbGVmdDogdHRQb3NpdGlvbi5sZWZ0ICsgJ3B4JyB9KTtcclxuICAgICAgICAgICAgICAgICAgdmFyIHBsYWNlbWVudENsYXNzZXMgPSB0dFBvc2l0aW9uLnBsYWNlbWVudC5zcGxpdCgnLScpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgaWYgKCF0b29sdGlwLmhhc0NsYXNzKHBsYWNlbWVudENsYXNzZXNbMF0pKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdG9vbHRpcC5yZW1vdmVDbGFzcyhsYXN0UGxhY2VtZW50LnNwbGl0KCctJylbMF0pO1xyXG4gICAgICAgICAgICAgICAgICAgIHRvb2x0aXAuYWRkQ2xhc3MocGxhY2VtZW50Q2xhc3Nlc1swXSk7XHJcbiAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgIGlmICghdG9vbHRpcC5oYXNDbGFzcyhvcHRpb25zLnBsYWNlbWVudENsYXNzUHJlZml4ICsgdHRQb3NpdGlvbi5wbGFjZW1lbnQpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdG9vbHRpcC5yZW1vdmVDbGFzcyhvcHRpb25zLnBsYWNlbWVudENsYXNzUHJlZml4ICsgbGFzdFBsYWNlbWVudCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdG9vbHRpcC5hZGRDbGFzcyhvcHRpb25zLnBsYWNlbWVudENsYXNzUHJlZml4ICsgdHRQb3NpdGlvbi5wbGFjZW1lbnQpO1xyXG4gICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgY3VycmVudEhlaWdodCA9IGFuZ3VsYXIuaXNEZWZpbmVkKHRvb2x0aXAub2Zmc2V0SGVpZ2h0KSA/IHRvb2x0aXAub2Zmc2V0SGVpZ2h0IDogdG9vbHRpcC5wcm9wKCdvZmZzZXRIZWlnaHQnKTtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgYWRqdXN0bWVudCA9ICRwb3NpdGlvbi5hZGp1c3RUb3AocGxhY2VtZW50Q2xhc3NlcywgZWxlbWVudFBvcywgaW5pdGlhbEhlaWdodCwgY3VycmVudEhlaWdodCk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGFkanVzdG1lbnQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgIHRvb2x0aXAuY3NzKGFkanVzdG1lbnQpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgfSwgMCwgZmFsc2UpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgLy8gZmlyc3QgdGltZSB0aHJvdWdoIHR0IGVsZW1lbnQgd2lsbCBoYXZlIHRoZVxyXG4gICAgICAgICAgICAgICAgICAvLyB1aWItcG9zaXRpb24tbWVhc3VyZSBjbGFzcyBvciBpZiB0aGUgcGxhY2VtZW50XHJcbiAgICAgICAgICAgICAgICAgIC8vIGhhcyBjaGFuZ2VkIHdlIG5lZWQgdG8gcG9zaXRpb24gdGhlIGFycm93LlxyXG4gICAgICAgICAgICAgICAgICBpZiAodG9vbHRpcC5oYXNDbGFzcygndWliLXBvc2l0aW9uLW1lYXN1cmUnKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICRwb3NpdGlvbi5wb3NpdGlvbkFycm93KHRvb2x0aXAsIHR0UG9zaXRpb24ucGxhY2VtZW50KTtcclxuICAgICAgICAgICAgICAgICAgICB0b29sdGlwLnJlbW92ZUNsYXNzKCd1aWItcG9zaXRpb24tbWVhc3VyZScpO1xyXG4gICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGxhc3RQbGFjZW1lbnQgIT09IHR0UG9zaXRpb24ucGxhY2VtZW50KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJHBvc2l0aW9uLnBvc2l0aW9uQXJyb3codG9vbHRpcCwgdHRQb3NpdGlvbi5wbGFjZW1lbnQpO1xyXG4gICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgIGxhc3RQbGFjZW1lbnQgPSB0dFBvc2l0aW9uLnBsYWNlbWVudDtcclxuXHJcbiAgICAgICAgICAgICAgICAgIHBvc2l0aW9uVGltZW91dCA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICB9LCAwLCBmYWxzZSk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgLy8gU2V0IHVwIHRoZSBjb3JyZWN0IHNjb3BlIHRvIGFsbG93IHRyYW5zY2x1c2lvbiBsYXRlclxyXG4gICAgICAgICAgICB0dFNjb3BlLm9yaWdTY29wZSA9IHNjb3BlO1xyXG5cclxuICAgICAgICAgICAgLy8gQnkgZGVmYXVsdCwgdGhlIHRvb2x0aXAgaXMgbm90IG9wZW4uXHJcbiAgICAgICAgICAgIC8vIFRPRE8gYWRkIGFiaWxpdHkgdG8gc3RhcnQgdG9vbHRpcCBvcGVuZWRcclxuICAgICAgICAgICAgdHRTY29wZS5pc09wZW4gPSBmYWxzZTtcclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIHRvZ2dsZVRvb2x0aXBCaW5kKCkge1xyXG4gICAgICAgICAgICAgIGlmICghdHRTY29wZS5pc09wZW4pIHtcclxuICAgICAgICAgICAgICAgIHNob3dUb29sdGlwQmluZCgpO1xyXG4gICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBoaWRlVG9vbHRpcEJpbmQoKTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIFNob3cgdGhlIHRvb2x0aXAgd2l0aCBkZWxheSBpZiBzcGVjaWZpZWQsIG90aGVyd2lzZSBzaG93IGl0IGltbWVkaWF0ZWx5XHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIHNob3dUb29sdGlwQmluZCgpIHtcclxuICAgICAgICAgICAgICBpZiAoaGFzRW5hYmxlRXhwICYmICFzY29wZS4kZXZhbChhdHRyc1twcmVmaXggKyAnRW5hYmxlJ10pKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICBjYW5jZWxIaWRlKCk7XHJcbiAgICAgICAgICAgICAgcHJlcGFyZVRvb2x0aXAoKTtcclxuXHJcbiAgICAgICAgICAgICAgaWYgKHR0U2NvcGUucG9wdXBEZWxheSkge1xyXG4gICAgICAgICAgICAgICAgLy8gRG8gbm90aGluZyBpZiB0aGUgdG9vbHRpcCB3YXMgYWxyZWFkeSBzY2hlZHVsZWQgdG8gcG9wLXVwLlxyXG4gICAgICAgICAgICAgICAgLy8gVGhpcyBoYXBwZW5zIGlmIHNob3cgaXMgdHJpZ2dlcmVkIG11bHRpcGxlIHRpbWVzIGJlZm9yZSBhbnkgaGlkZSBpcyB0cmlnZ2VyZWQuXHJcbiAgICAgICAgICAgICAgICBpZiAoIXNob3dUaW1lb3V0KSB7XHJcbiAgICAgICAgICAgICAgICAgIHNob3dUaW1lb3V0ID0gJHRpbWVvdXQoc2hvdywgdHRTY29wZS5wb3B1cERlbGF5LCBmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHNob3coKTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIGhpZGVUb29sdGlwQmluZCgpIHtcclxuICAgICAgICAgICAgICBjYW5jZWxTaG93KCk7XHJcblxyXG4gICAgICAgICAgICAgIGlmICh0dFNjb3BlLnBvcHVwQ2xvc2VEZWxheSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKCFoaWRlVGltZW91dCkge1xyXG4gICAgICAgICAgICAgICAgICBoaWRlVGltZW91dCA9ICR0aW1lb3V0KGhpZGUsIHR0U2NvcGUucG9wdXBDbG9zZURlbGF5LCBmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGhpZGUoKTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIFNob3cgdGhlIHRvb2x0aXAgcG9wdXAgZWxlbWVudC5cclxuICAgICAgICAgICAgZnVuY3Rpb24gc2hvdygpIHtcclxuICAgICAgICAgICAgICBjYW5jZWxTaG93KCk7XHJcbiAgICAgICAgICAgICAgY2FuY2VsSGlkZSgpO1xyXG5cclxuICAgICAgICAgICAgICAvLyBEb24ndCBzaG93IGVtcHR5IHRvb2x0aXBzLlxyXG4gICAgICAgICAgICAgIGlmICghdHRTY29wZS5jb250ZW50KSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gYW5ndWxhci5ub29wO1xyXG4gICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgY3JlYXRlVG9vbHRpcCgpO1xyXG5cclxuICAgICAgICAgICAgICAvLyBBbmQgc2hvdyB0aGUgdG9vbHRpcC5cclxuICAgICAgICAgICAgICB0dFNjb3BlLiRldmFsQXN5bmMoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICB0dFNjb3BlLmlzT3BlbiA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICBhc3NpZ25Jc09wZW4odHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICBwb3NpdGlvblRvb2x0aXAoKTtcclxuICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gY2FuY2VsU2hvdygpIHtcclxuICAgICAgICAgICAgICBpZiAoc2hvd1RpbWVvdXQpIHtcclxuICAgICAgICAgICAgICAgICR0aW1lb3V0LmNhbmNlbChzaG93VGltZW91dCk7XHJcbiAgICAgICAgICAgICAgICBzaG93VGltZW91dCA9IG51bGw7XHJcbiAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICBpZiAocG9zaXRpb25UaW1lb3V0KSB7XHJcbiAgICAgICAgICAgICAgICAkdGltZW91dC5jYW5jZWwocG9zaXRpb25UaW1lb3V0KTtcclxuICAgICAgICAgICAgICAgIHBvc2l0aW9uVGltZW91dCA9IG51bGw7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBIaWRlIHRoZSB0b29sdGlwIHBvcHVwIGVsZW1lbnQuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIGhpZGUoKSB7XHJcbiAgICAgICAgICAgICAgaWYgKCF0dFNjb3BlKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAvLyBGaXJzdCB0aGluZ3MgZmlyc3Q6IHdlIGRvbid0IHNob3cgaXQgYW55bW9yZS5cclxuICAgICAgICAgICAgICB0dFNjb3BlLiRldmFsQXN5bmMoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodHRTY29wZSkge1xyXG4gICAgICAgICAgICAgICAgICB0dFNjb3BlLmlzT3BlbiA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICBhc3NpZ25Jc09wZW4oZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgICAvLyBBbmQgbm93IHdlIHJlbW92ZSBpdCBmcm9tIHRoZSBET00uIEhvd2V2ZXIsIGlmIHdlIGhhdmUgYW5pbWF0aW9uLCB3ZVxyXG4gICAgICAgICAgICAgICAgICAvLyBuZWVkIHRvIHdhaXQgZm9yIGl0IHRvIGV4cGlyZSBiZWZvcmVoYW5kLlxyXG4gICAgICAgICAgICAgICAgICAvLyBGSVhNRTogdGhpcyBpcyBhIHBsYWNlaG9sZGVyIGZvciBhIHBvcnQgb2YgdGhlIHRyYW5zaXRpb25zIGxpYnJhcnkuXHJcbiAgICAgICAgICAgICAgICAgIC8vIFRoZSBmYWRlIHRyYW5zaXRpb24gaW4gVFdCUyBpcyAxNTBtcy5cclxuICAgICAgICAgICAgICAgICAgaWYgKHR0U2NvcGUuYW5pbWF0aW9uKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCF0cmFuc2l0aW9uVGltZW91dCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgdHJhbnNpdGlvblRpbWVvdXQgPSAkdGltZW91dChyZW1vdmVUb29sdGlwLCAxNTAsIGZhbHNlKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVtb3ZlVG9vbHRpcCgpO1xyXG4gICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIGNhbmNlbEhpZGUoKSB7XHJcbiAgICAgICAgICAgICAgaWYgKGhpZGVUaW1lb3V0KSB7XHJcbiAgICAgICAgICAgICAgICAkdGltZW91dC5jYW5jZWwoaGlkZVRpbWVvdXQpO1xyXG4gICAgICAgICAgICAgICAgaGlkZVRpbWVvdXQgPSBudWxsO1xyXG4gICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgaWYgKHRyYW5zaXRpb25UaW1lb3V0KSB7XHJcbiAgICAgICAgICAgICAgICAkdGltZW91dC5jYW5jZWwodHJhbnNpdGlvblRpbWVvdXQpO1xyXG4gICAgICAgICAgICAgICAgdHJhbnNpdGlvblRpbWVvdXQgPSBudWxsO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gY3JlYXRlVG9vbHRpcCgpIHtcclxuICAgICAgICAgICAgICAvLyBUaGVyZSBjYW4gb25seSBiZSBvbmUgdG9vbHRpcCBlbGVtZW50IHBlciBkaXJlY3RpdmUgc2hvd24gYXQgb25jZS5cclxuICAgICAgICAgICAgICBpZiAodG9vbHRpcCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgdG9vbHRpcExpbmtlZFNjb3BlID0gdHRTY29wZS4kbmV3KCk7XHJcbiAgICAgICAgICAgICAgdG9vbHRpcCA9IHRvb2x0aXBMaW5rZXIodG9vbHRpcExpbmtlZFNjb3BlLCBmdW5jdGlvbih0b29sdGlwKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoYXBwZW5kVG9Cb2R5KSB7XHJcbiAgICAgICAgICAgICAgICAgICRkb2N1bWVudC5maW5kKCdib2R5JykuYXBwZW5kKHRvb2x0aXApO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgZWxlbWVudC5hZnRlcih0b29sdGlwKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgb3BlbmVkVG9vbHRpcHMuYWRkKHR0U2NvcGUsIHtcclxuICAgICAgICAgICAgICAgIGNsb3NlOiBoaWRlXHJcbiAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgIHByZXBPYnNlcnZlcnMoKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gcmVtb3ZlVG9vbHRpcCgpIHtcclxuICAgICAgICAgICAgICBjYW5jZWxTaG93KCk7XHJcbiAgICAgICAgICAgICAgY2FuY2VsSGlkZSgpO1xyXG4gICAgICAgICAgICAgIHVucmVnaXN0ZXJPYnNlcnZlcnMoKTtcclxuXHJcbiAgICAgICAgICAgICAgaWYgKHRvb2x0aXApIHtcclxuICAgICAgICAgICAgICAgIHRvb2x0aXAucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICAgICB0b29sdGlwID0gbnVsbDtcclxuICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgIG9wZW5lZFRvb2x0aXBzLnJlbW92ZSh0dFNjb3BlKTtcclxuICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICBpZiAodG9vbHRpcExpbmtlZFNjb3BlKSB7XHJcbiAgICAgICAgICAgICAgICB0b29sdGlwTGlua2VkU2NvcGUuJGRlc3Ryb3koKTtcclxuICAgICAgICAgICAgICAgIHRvb2x0aXBMaW5rZWRTY29wZSA9IG51bGw7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvKipcclxuICAgICAgICAgICAgICogU2V0IHRoZSBpbml0aWFsIHNjb3BlIHZhbHVlcy4gT25jZVxyXG4gICAgICAgICAgICAgKiB0aGUgdG9vbHRpcCBpcyBjcmVhdGVkLCB0aGUgb2JzZXJ2ZXJzXHJcbiAgICAgICAgICAgICAqIHdpbGwgYmUgYWRkZWQgdG8ga2VlcCB0aGluZ3MgaW4gc3luYy5cclxuICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIHByZXBhcmVUb29sdGlwKCkge1xyXG4gICAgICAgICAgICAgIHR0U2NvcGUudGl0bGUgPSBhdHRyc1twcmVmaXggKyAnVGl0bGUnXTtcclxuICAgICAgICAgICAgICBpZiAoY29udGVudFBhcnNlKSB7XHJcbiAgICAgICAgICAgICAgICB0dFNjb3BlLmNvbnRlbnQgPSBjb250ZW50UGFyc2Uoc2NvcGUpO1xyXG4gICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0dFNjb3BlLmNvbnRlbnQgPSBhdHRyc1t0dFR5cGVdO1xyXG4gICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgdHRTY29wZS5wb3B1cENsYXNzID0gYXR0cnNbcHJlZml4ICsgJ0NsYXNzJ107XHJcbiAgICAgICAgICAgICAgdHRTY29wZS5wbGFjZW1lbnQgPSBhbmd1bGFyLmlzRGVmaW5lZChhdHRyc1twcmVmaXggKyAnUGxhY2VtZW50J10pID8gYXR0cnNbcHJlZml4ICsgJ1BsYWNlbWVudCddIDogb3B0aW9ucy5wbGFjZW1lbnQ7XHJcbiAgICAgICAgICAgICAgdmFyIHBsYWNlbWVudCA9ICRwb3NpdGlvbi5wYXJzZVBsYWNlbWVudCh0dFNjb3BlLnBsYWNlbWVudCk7XHJcbiAgICAgICAgICAgICAgbGFzdFBsYWNlbWVudCA9IHBsYWNlbWVudFsxXSA/IHBsYWNlbWVudFswXSArICctJyArIHBsYWNlbWVudFsxXSA6IHBsYWNlbWVudFswXTtcclxuXHJcbiAgICAgICAgICAgICAgdmFyIGRlbGF5ID0gcGFyc2VJbnQoYXR0cnNbcHJlZml4ICsgJ1BvcHVwRGVsYXknXSwgMTApO1xyXG4gICAgICAgICAgICAgIHZhciBjbG9zZURlbGF5ID0gcGFyc2VJbnQoYXR0cnNbcHJlZml4ICsgJ1BvcHVwQ2xvc2VEZWxheSddLCAxMCk7XHJcbiAgICAgICAgICAgICAgdHRTY29wZS5wb3B1cERlbGF5ID0gIWlzTmFOKGRlbGF5KSA/IGRlbGF5IDogb3B0aW9ucy5wb3B1cERlbGF5O1xyXG4gICAgICAgICAgICAgIHR0U2NvcGUucG9wdXBDbG9zZURlbGF5ID0gIWlzTmFOKGNsb3NlRGVsYXkpID8gY2xvc2VEZWxheSA6IG9wdGlvbnMucG9wdXBDbG9zZURlbGF5O1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBhc3NpZ25Jc09wZW4oaXNPcGVuKSB7XHJcbiAgICAgICAgICAgICAgaWYgKGlzT3BlblBhcnNlICYmIGFuZ3VsYXIuaXNGdW5jdGlvbihpc09wZW5QYXJzZS5hc3NpZ24pKSB7XHJcbiAgICAgICAgICAgICAgICBpc09wZW5QYXJzZS5hc3NpZ24oc2NvcGUsIGlzT3Blbik7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0dFNjb3BlLmNvbnRlbnRFeHAgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICByZXR1cm4gdHRTY29wZS5jb250ZW50O1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgLyoqXHJcbiAgICAgICAgICAgICAqIE9ic2VydmUgdGhlIHJlbGV2YW50IGF0dHJpYnV0ZXMuXHJcbiAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICBhdHRycy4kb2JzZXJ2ZSgnZGlzYWJsZWQnLCBmdW5jdGlvbih2YWwpIHtcclxuICAgICAgICAgICAgICBpZiAodmFsKSB7XHJcbiAgICAgICAgICAgICAgICBjYW5jZWxTaG93KCk7XHJcbiAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICBpZiAodmFsICYmIHR0U2NvcGUuaXNPcGVuKSB7XHJcbiAgICAgICAgICAgICAgICBoaWRlKCk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIGlmIChpc09wZW5QYXJzZSkge1xyXG4gICAgICAgICAgICAgIHNjb3BlLiR3YXRjaChpc09wZW5QYXJzZSwgZnVuY3Rpb24odmFsKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodHRTY29wZSAmJiAhdmFsID09PSB0dFNjb3BlLmlzT3Blbikge1xyXG4gICAgICAgICAgICAgICAgICB0b2dnbGVUb29sdGlwQmluZCgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBwcmVwT2JzZXJ2ZXJzKCkge1xyXG4gICAgICAgICAgICAgIG9ic2VydmVycy5sZW5ndGggPSAwO1xyXG5cclxuICAgICAgICAgICAgICBpZiAoY29udGVudFBhcnNlKSB7XHJcbiAgICAgICAgICAgICAgICBvYnNlcnZlcnMucHVzaChcclxuICAgICAgICAgICAgICAgICAgc2NvcGUuJHdhdGNoKGNvbnRlbnRQYXJzZSwgZnVuY3Rpb24odmFsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdHRTY29wZS5jb250ZW50ID0gdmFsO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICghdmFsICYmIHR0U2NvcGUuaXNPcGVuKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICBoaWRlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgICAgICBvYnNlcnZlcnMucHVzaChcclxuICAgICAgICAgICAgICAgICAgdG9vbHRpcExpbmtlZFNjb3BlLiR3YXRjaChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIXJlcG9zaXRpb25TY2hlZHVsZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgIHJlcG9zaXRpb25TY2hlZHVsZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgdG9vbHRpcExpbmtlZFNjb3BlLiQkcG9zdERpZ2VzdChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVwb3NpdGlvblNjaGVkdWxlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodHRTY29wZSAmJiB0dFNjb3BlLmlzT3Blbikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uVG9vbHRpcCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBvYnNlcnZlcnMucHVzaChcclxuICAgICAgICAgICAgICAgICAgYXR0cnMuJG9ic2VydmUodHRUeXBlLCBmdW5jdGlvbih2YWwpIHtcclxuICAgICAgICAgICAgICAgICAgICB0dFNjb3BlLmNvbnRlbnQgPSB2YWw7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCF2YWwgJiYgdHRTY29wZS5pc09wZW4pIHtcclxuICAgICAgICAgICAgICAgICAgICAgIGhpZGUoKTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgcG9zaXRpb25Ub29sdGlwKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgIG9ic2VydmVycy5wdXNoKFxyXG4gICAgICAgICAgICAgICAgYXR0cnMuJG9ic2VydmUocHJlZml4ICsgJ1RpdGxlJywgZnVuY3Rpb24odmFsKSB7XHJcbiAgICAgICAgICAgICAgICAgIHR0U2NvcGUudGl0bGUgPSB2YWw7XHJcbiAgICAgICAgICAgICAgICAgIGlmICh0dFNjb3BlLmlzT3Blbikge1xyXG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uVG9vbHRpcCgpO1xyXG4gICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICAgIG9ic2VydmVycy5wdXNoKFxyXG4gICAgICAgICAgICAgICAgYXR0cnMuJG9ic2VydmUocHJlZml4ICsgJ1BsYWNlbWVudCcsIGZ1bmN0aW9uKHZhbCkge1xyXG4gICAgICAgICAgICAgICAgICB0dFNjb3BlLnBsYWNlbWVudCA9IHZhbCA/IHZhbCA6IG9wdGlvbnMucGxhY2VtZW50O1xyXG4gICAgICAgICAgICAgICAgICBpZiAodHRTY29wZS5pc09wZW4pIHtcclxuICAgICAgICAgICAgICAgICAgICBwb3NpdGlvblRvb2x0aXAoKTtcclxuICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiB1bnJlZ2lzdGVyT2JzZXJ2ZXJzKCkge1xyXG4gICAgICAgICAgICAgIGlmIChvYnNlcnZlcnMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICBhbmd1bGFyLmZvckVhY2gob2JzZXJ2ZXJzLCBmdW5jdGlvbihvYnNlcnZlcikge1xyXG4gICAgICAgICAgICAgICAgICBvYnNlcnZlcigpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICBvYnNlcnZlcnMubGVuZ3RoID0gMDtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIGhpZGUgdG9vbHRpcHMvcG9wb3ZlcnMgZm9yIG91dHNpZGVDbGljayB0cmlnZ2VyXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIGJvZHlIaWRlVG9vbHRpcEJpbmQoZSkge1xyXG4gICAgICAgICAgICAgIGlmICghdHRTY29wZSB8fCAhdHRTY29wZS5pc09wZW4gfHwgIXRvb2x0aXApIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgLy8gbWFrZSBzdXJlIHRoZSB0b29sdGlwL3BvcG92ZXIgbGluayBvciB0b29sIHRvb2x0aXAvcG9wb3ZlciBpdHNlbGYgd2VyZSBub3QgY2xpY2tlZFxyXG4gICAgICAgICAgICAgIGlmICghZWxlbWVudFswXS5jb250YWlucyhlLnRhcmdldCkgJiYgIXRvb2x0aXBbMF0uY29udGFpbnMoZS50YXJnZXQpKSB7XHJcbiAgICAgICAgICAgICAgICBoaWRlVG9vbHRpcEJpbmQoKTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHZhciB1bnJlZ2lzdGVyVHJpZ2dlcnMgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICB0cmlnZ2Vycy5zaG93LmZvckVhY2goZnVuY3Rpb24odHJpZ2dlcikge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRyaWdnZXIgPT09ICdvdXRzaWRlQ2xpY2snKSB7XHJcbiAgICAgICAgICAgICAgICAgIGVsZW1lbnQub2ZmKCdjbGljaycsIHRvZ2dsZVRvb2x0aXBCaW5kKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgIGVsZW1lbnQub2ZmKHRyaWdnZXIsIHNob3dUb29sdGlwQmluZCk7XHJcbiAgICAgICAgICAgICAgICAgIGVsZW1lbnQub2ZmKHRyaWdnZXIsIHRvZ2dsZVRvb2x0aXBCaW5kKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICB0cmlnZ2Vycy5oaWRlLmZvckVhY2goZnVuY3Rpb24odHJpZ2dlcikge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRyaWdnZXIgPT09ICdvdXRzaWRlQ2xpY2snKSB7XHJcbiAgICAgICAgICAgICAgICAgICRkb2N1bWVudC5vZmYoJ2NsaWNrJywgYm9keUhpZGVUb29sdGlwQmluZCk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICBlbGVtZW50Lm9mZih0cmlnZ2VyLCBoaWRlVG9vbHRpcEJpbmQpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gcHJlcFRyaWdnZXJzKCkge1xyXG4gICAgICAgICAgICAgIHZhciBzaG93VHJpZ2dlcnMgPSBbXSwgaGlkZVRyaWdnZXJzID0gW107XHJcbiAgICAgICAgICAgICAgdmFyIHZhbCA9IHNjb3BlLiRldmFsKGF0dHJzW3ByZWZpeCArICdUcmlnZ2VyJ10pO1xyXG4gICAgICAgICAgICAgIHVucmVnaXN0ZXJUcmlnZ2VycygpO1xyXG5cclxuICAgICAgICAgICAgICBpZiAoYW5ndWxhci5pc09iamVjdCh2YWwpKSB7XHJcbiAgICAgICAgICAgICAgICBPYmplY3Qua2V5cyh2YWwpLmZvckVhY2goZnVuY3Rpb24oa2V5KSB7XHJcbiAgICAgICAgICAgICAgICAgIHNob3dUcmlnZ2Vycy5wdXNoKGtleSk7XHJcbiAgICAgICAgICAgICAgICAgIGhpZGVUcmlnZ2Vycy5wdXNoKHZhbFtrZXldKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgdHJpZ2dlcnMgPSB7XHJcbiAgICAgICAgICAgICAgICAgIHNob3c6IHNob3dUcmlnZ2VycyxcclxuICAgICAgICAgICAgICAgICAgaGlkZTogaGlkZVRyaWdnZXJzXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0cmlnZ2VycyA9IGdldFRyaWdnZXJzKHZhbCk7XHJcbiAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICBpZiAodHJpZ2dlcnMuc2hvdyAhPT0gJ25vbmUnKSB7XHJcbiAgICAgICAgICAgICAgICB0cmlnZ2Vycy5zaG93LmZvckVhY2goZnVuY3Rpb24odHJpZ2dlciwgaWR4KSB7XHJcbiAgICAgICAgICAgICAgICAgIGlmICh0cmlnZ2VyID09PSAnb3V0c2lkZUNsaWNrJykge1xyXG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQub24oJ2NsaWNrJywgdG9nZ2xlVG9vbHRpcEJpbmQpO1xyXG4gICAgICAgICAgICAgICAgICAgICRkb2N1bWVudC5vbignY2xpY2snLCBib2R5SGlkZVRvb2x0aXBCaW5kKTtcclxuICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0cmlnZ2VyID09PSB0cmlnZ2Vycy5oaWRlW2lkeF0pIHtcclxuICAgICAgICAgICAgICAgICAgICBlbGVtZW50Lm9uKHRyaWdnZXIsIHRvZ2dsZVRvb2x0aXBCaW5kKTtcclxuICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0cmlnZ2VyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5vbih0cmlnZ2VyLCBzaG93VG9vbHRpcEJpbmQpO1xyXG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQub24odHJpZ2dlcnMuaGlkZVtpZHhdLCBoaWRlVG9vbHRpcEJpbmQpO1xyXG4gICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICBlbGVtZW50Lm9uKCdrZXlwcmVzcycsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZS53aGljaCA9PT0gMjcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgIGhpZGVUb29sdGlwQmluZCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHByZXBUcmlnZ2VycygpO1xyXG5cclxuICAgICAgICAgICAgdmFyIGFuaW1hdGlvbiA9IHNjb3BlLiRldmFsKGF0dHJzW3ByZWZpeCArICdBbmltYXRpb24nXSk7XHJcbiAgICAgICAgICAgIHR0U2NvcGUuYW5pbWF0aW9uID0gYW5ndWxhci5pc0RlZmluZWQoYW5pbWF0aW9uKSA/ICEhYW5pbWF0aW9uIDogb3B0aW9ucy5hbmltYXRpb247XHJcblxyXG4gICAgICAgICAgICB2YXIgYXBwZW5kVG9Cb2R5VmFsO1xyXG4gICAgICAgICAgICB2YXIgYXBwZW5kS2V5ID0gcHJlZml4ICsgJ0FwcGVuZFRvQm9keSc7XHJcbiAgICAgICAgICAgIGlmIChhcHBlbmRLZXkgaW4gYXR0cnMgJiYgYXR0cnNbYXBwZW5kS2V5XSA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgYXBwZW5kVG9Cb2R5VmFsID0gdHJ1ZTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICBhcHBlbmRUb0JvZHlWYWwgPSBzY29wZS4kZXZhbChhdHRyc1thcHBlbmRLZXldKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgYXBwZW5kVG9Cb2R5ID0gYW5ndWxhci5pc0RlZmluZWQoYXBwZW5kVG9Cb2R5VmFsKSA/IGFwcGVuZFRvQm9keVZhbCA6IGFwcGVuZFRvQm9keTtcclxuXHJcbiAgICAgICAgICAgIC8vIE1ha2Ugc3VyZSB0b29sdGlwIGlzIGRlc3Ryb3llZCBhbmQgcmVtb3ZlZC5cclxuICAgICAgICAgICAgc2NvcGUuJG9uKCckZGVzdHJveScsIGZ1bmN0aW9uIG9uRGVzdHJveVRvb2x0aXAoKSB7XHJcbiAgICAgICAgICAgICAgdW5yZWdpc3RlclRyaWdnZXJzKCk7XHJcbiAgICAgICAgICAgICAgcmVtb3ZlVG9vbHRpcCgpO1xyXG4gICAgICAgICAgICAgIHR0U2NvcGUgPSBudWxsO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG4gICAgICB9O1xyXG4gICAgfTtcclxuICB9XTtcclxufSlcclxuXHJcbi8vIFRoaXMgaXMgbW9zdGx5IG5nSW5jbHVkZSBjb2RlIGJ1dCB3aXRoIGEgY3VzdG9tIHNjb3BlXHJcbi5kaXJlY3RpdmUoJ3VpYlRvb2x0aXBUZW1wbGF0ZVRyYW5zY2x1ZGUnLCBbXHJcbiAgICAgICAgICckYW5pbWF0ZScsICckc2NlJywgJyRjb21waWxlJywgJyR0ZW1wbGF0ZVJlcXVlc3QnLFxyXG5mdW5jdGlvbiAoJGFuaW1hdGUsICRzY2UsICRjb21waWxlLCAkdGVtcGxhdGVSZXF1ZXN0KSB7XHJcbiAgcmV0dXJuIHtcclxuICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBlbGVtLCBhdHRycykge1xyXG4gICAgICB2YXIgb3JpZ1Njb3BlID0gc2NvcGUuJGV2YWwoYXR0cnMudG9vbHRpcFRlbXBsYXRlVHJhbnNjbHVkZVNjb3BlKTtcclxuXHJcbiAgICAgIHZhciBjaGFuZ2VDb3VudGVyID0gMCxcclxuICAgICAgICBjdXJyZW50U2NvcGUsXHJcbiAgICAgICAgcHJldmlvdXNFbGVtZW50LFxyXG4gICAgICAgIGN1cnJlbnRFbGVtZW50O1xyXG5cclxuICAgICAgdmFyIGNsZWFudXBMYXN0SW5jbHVkZUNvbnRlbnQgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICBpZiAocHJldmlvdXNFbGVtZW50KSB7XHJcbiAgICAgICAgICBwcmV2aW91c0VsZW1lbnQucmVtb3ZlKCk7XHJcbiAgICAgICAgICBwcmV2aW91c0VsZW1lbnQgPSBudWxsO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGN1cnJlbnRTY29wZSkge1xyXG4gICAgICAgICAgY3VycmVudFNjb3BlLiRkZXN0cm95KCk7XHJcbiAgICAgICAgICBjdXJyZW50U2NvcGUgPSBudWxsO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGN1cnJlbnRFbGVtZW50KSB7XHJcbiAgICAgICAgICAkYW5pbWF0ZS5sZWF2ZShjdXJyZW50RWxlbWVudCkudGhlbihmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcHJldmlvdXNFbGVtZW50ID0gbnVsbDtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgcHJldmlvdXNFbGVtZW50ID0gY3VycmVudEVsZW1lbnQ7XHJcbiAgICAgICAgICBjdXJyZW50RWxlbWVudCA9IG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgICB9O1xyXG5cclxuICAgICAgc2NvcGUuJHdhdGNoKCRzY2UucGFyc2VBc1Jlc291cmNlVXJsKGF0dHJzLnVpYlRvb2x0aXBUZW1wbGF0ZVRyYW5zY2x1ZGUpLCBmdW5jdGlvbihzcmMpIHtcclxuICAgICAgICB2YXIgdGhpc0NoYW5nZUlkID0gKytjaGFuZ2VDb3VudGVyO1xyXG5cclxuICAgICAgICBpZiAoc3JjKSB7XHJcbiAgICAgICAgICAvL3NldCB0aGUgMm5kIHBhcmFtIHRvIHRydWUgdG8gaWdub3JlIHRoZSB0ZW1wbGF0ZSByZXF1ZXN0IGVycm9yIHNvIHRoYXQgdGhlIGlubmVyXHJcbiAgICAgICAgICAvL2NvbnRlbnRzIGFuZCBzY29wZSBjYW4gYmUgY2xlYW5lZCB1cC5cclxuICAgICAgICAgICR0ZW1wbGF0ZVJlcXVlc3Qoc3JjLCB0cnVlKS50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzQ2hhbmdlSWQgIT09IGNoYW5nZUNvdW50ZXIpIHsgcmV0dXJuOyB9XHJcbiAgICAgICAgICAgIHZhciBuZXdTY29wZSA9IG9yaWdTY29wZS4kbmV3KCk7XHJcbiAgICAgICAgICAgIHZhciB0ZW1wbGF0ZSA9IHJlc3BvbnNlO1xyXG5cclxuICAgICAgICAgICAgdmFyIGNsb25lID0gJGNvbXBpbGUodGVtcGxhdGUpKG5ld1Njb3BlLCBmdW5jdGlvbihjbG9uZSkge1xyXG4gICAgICAgICAgICAgIGNsZWFudXBMYXN0SW5jbHVkZUNvbnRlbnQoKTtcclxuICAgICAgICAgICAgICAkYW5pbWF0ZS5lbnRlcihjbG9uZSwgZWxlbSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgY3VycmVudFNjb3BlID0gbmV3U2NvcGU7XHJcbiAgICAgICAgICAgIGN1cnJlbnRFbGVtZW50ID0gY2xvbmU7XHJcblxyXG4gICAgICAgICAgICBjdXJyZW50U2NvcGUuJGVtaXQoJyRpbmNsdWRlQ29udGVudExvYWRlZCcsIHNyYyk7XHJcbiAgICAgICAgICB9LCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXNDaGFuZ2VJZCA9PT0gY2hhbmdlQ291bnRlcikge1xyXG4gICAgICAgICAgICAgIGNsZWFudXBMYXN0SW5jbHVkZUNvbnRlbnQoKTtcclxuICAgICAgICAgICAgICBzY29wZS4kZW1pdCgnJGluY2x1ZGVDb250ZW50RXJyb3InLCBzcmMpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICAgIHNjb3BlLiRlbWl0KCckaW5jbHVkZUNvbnRlbnRSZXF1ZXN0ZWQnLCBzcmMpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBjbGVhbnVwTGFzdEluY2x1ZGVDb250ZW50KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIHNjb3BlLiRvbignJGRlc3Ryb3knLCBjbGVhbnVwTGFzdEluY2x1ZGVDb250ZW50KTtcclxuICAgIH1cclxuICB9O1xyXG59XSlcclxuXHJcbi8qKlxyXG4gKiBOb3RlIHRoYXQgaXQncyBpbnRlbnRpb25hbCB0aGF0IHRoZXNlIGNsYXNzZXMgYXJlICpub3QqIGFwcGxpZWQgdGhyb3VnaCAkYW5pbWF0ZS5cclxuICogVGhleSBtdXN0IG5vdCBiZSBhbmltYXRlZCBhcyB0aGV5J3JlIGV4cGVjdGVkIHRvIGJlIHByZXNlbnQgb24gdGhlIHRvb2x0aXAgb25cclxuICogaW5pdGlhbGl6YXRpb24uXHJcbiAqL1xyXG4uZGlyZWN0aXZlKCd1aWJUb29sdGlwQ2xhc3NlcycsIFsnJHVpYlBvc2l0aW9uJywgZnVuY3Rpb24oJHVpYlBvc2l0aW9uKSB7XHJcbiAgcmV0dXJuIHtcclxuICAgIHJlc3RyaWN0OiAnQScsXHJcbiAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxlbWVudCwgYXR0cnMpIHtcclxuICAgICAgLy8gbmVlZCB0byBzZXQgdGhlIHByaW1hcnkgcG9zaXRpb24gc28gdGhlXHJcbiAgICAgIC8vIGFycm93IGhhcyBzcGFjZSBkdXJpbmcgcG9zaXRpb24gbWVhc3VyZS5cclxuICAgICAgLy8gdG9vbHRpcC5wb3NpdGlvblRvb2x0aXAoKVxyXG4gICAgICBpZiAoc2NvcGUucGxhY2VtZW50KSB7XHJcbiAgICAgICAgLy8gLy8gVGhlcmUgYXJlIG5vIHRvcC1sZWZ0IGV0Yy4uLiBjbGFzc2VzXHJcbiAgICAgICAgLy8gLy8gaW4gVFdCUywgc28gd2UgbmVlZCB0aGUgcHJpbWFyeSBwb3NpdGlvbi5cclxuICAgICAgICB2YXIgcG9zaXRpb24gPSAkdWliUG9zaXRpb24ucGFyc2VQbGFjZW1lbnQoc2NvcGUucGxhY2VtZW50KTtcclxuICAgICAgICBlbGVtZW50LmFkZENsYXNzKHBvc2l0aW9uWzBdKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKHNjb3BlLnBvcHVwQ2xhc3MpIHtcclxuICAgICAgICBlbGVtZW50LmFkZENsYXNzKHNjb3BlLnBvcHVwQ2xhc3MpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoc2NvcGUuYW5pbWF0aW9uKSB7XHJcbiAgICAgICAgZWxlbWVudC5hZGRDbGFzcyhhdHRycy50b29sdGlwQW5pbWF0aW9uQ2xhc3MpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfTtcclxufV0pXHJcblxyXG4uZGlyZWN0aXZlKCd1aWJUb29sdGlwUG9wdXAnLCBmdW5jdGlvbigpIHtcclxuICByZXR1cm4ge1xyXG4gICAgcmVzdHJpY3Q6ICdBJyxcclxuICAgIHNjb3BlOiB7IGNvbnRlbnQ6ICdAJyB9LFxyXG4gICAgdGVtcGxhdGVVcmw6ICd1aWIvdGVtcGxhdGUvdG9vbHRpcC90b29sdGlwLXBvcHVwLmh0bWwnXHJcbiAgfTtcclxufSlcclxuXHJcbi5kaXJlY3RpdmUoJ3VpYlRvb2x0aXAnLCBbICckdWliVG9vbHRpcCcsIGZ1bmN0aW9uKCR1aWJUb29sdGlwKSB7XHJcbiAgcmV0dXJuICR1aWJUb29sdGlwKCd1aWJUb29sdGlwJywgJ3Rvb2x0aXAnLCAnbW91c2VlbnRlcicpO1xyXG59XSlcclxuXHJcbi5kaXJlY3RpdmUoJ3VpYlRvb2x0aXBUZW1wbGF0ZVBvcHVwJywgZnVuY3Rpb24oKSB7XHJcbiAgcmV0dXJuIHtcclxuICAgIHJlc3RyaWN0OiAnQScsXHJcbiAgICBzY29wZTogeyBjb250ZW50RXhwOiAnJicsIG9yaWdpblNjb3BlOiAnJicgfSxcclxuICAgIHRlbXBsYXRlVXJsOiAndWliL3RlbXBsYXRlL3Rvb2x0aXAvdG9vbHRpcC10ZW1wbGF0ZS1wb3B1cC5odG1sJ1xyXG4gIH07XHJcbn0pXHJcblxyXG4uZGlyZWN0aXZlKCd1aWJUb29sdGlwVGVtcGxhdGUnLCBbJyR1aWJUb29sdGlwJywgZnVuY3Rpb24oJHVpYlRvb2x0aXApIHtcclxuICByZXR1cm4gJHVpYlRvb2x0aXAoJ3VpYlRvb2x0aXBUZW1wbGF0ZScsICd0b29sdGlwJywgJ21vdXNlZW50ZXInLCB7XHJcbiAgICB1c2VDb250ZW50RXhwOiB0cnVlXHJcbiAgfSk7XHJcbn1dKVxyXG5cclxuLmRpcmVjdGl2ZSgndWliVG9vbHRpcEh0bWxQb3B1cCcsIGZ1bmN0aW9uKCkge1xyXG4gIHJldHVybiB7XHJcbiAgICByZXN0cmljdDogJ0EnLFxyXG4gICAgc2NvcGU6IHsgY29udGVudEV4cDogJyYnIH0sXHJcbiAgICB0ZW1wbGF0ZVVybDogJ3VpYi90ZW1wbGF0ZS90b29sdGlwL3Rvb2x0aXAtaHRtbC1wb3B1cC5odG1sJ1xyXG4gIH07XHJcbn0pXHJcblxyXG4uZGlyZWN0aXZlKCd1aWJUb29sdGlwSHRtbCcsIFsnJHVpYlRvb2x0aXAnLCBmdW5jdGlvbigkdWliVG9vbHRpcCkge1xyXG4gIHJldHVybiAkdWliVG9vbHRpcCgndWliVG9vbHRpcEh0bWwnLCAndG9vbHRpcCcsICdtb3VzZWVudGVyJywge1xyXG4gICAgdXNlQ29udGVudEV4cDogdHJ1ZVxyXG4gIH0pO1xyXG59XSk7XHJcblxyXG4vKipcclxuICogVGhlIGZvbGxvd2luZyBmZWF0dXJlcyBhcmUgc3RpbGwgb3V0c3RhbmRpbmc6IHBvcHVwIGRlbGF5LCBhbmltYXRpb24gYXMgYVxyXG4gKiBmdW5jdGlvbiwgcGxhY2VtZW50IGFzIGEgZnVuY3Rpb24sIGluc2lkZSwgc3VwcG9ydCBmb3IgbW9yZSB0cmlnZ2VycyB0aGFuXHJcbiAqIGp1c3QgbW91c2UgZW50ZXIvbGVhdmUsIGFuZCBzZWxlY3RvciBkZWxlZ2F0YXRpb24uXHJcbiAqL1xyXG5hbmd1bGFyLm1vZHVsZSgndWkuYm9vdHN0cmFwLnBvcG92ZXInLCBbJ3VpLmJvb3RzdHJhcC50b29sdGlwJ10pXHJcblxyXG4uZGlyZWN0aXZlKCd1aWJQb3BvdmVyVGVtcGxhdGVQb3B1cCcsIGZ1bmN0aW9uKCkge1xyXG4gIHJldHVybiB7XHJcbiAgICByZXN0cmljdDogJ0EnLFxyXG4gICAgc2NvcGU6IHsgdWliVGl0bGU6ICdAJywgY29udGVudEV4cDogJyYnLCBvcmlnaW5TY29wZTogJyYnIH0sXHJcbiAgICB0ZW1wbGF0ZVVybDogJ3VpYi90ZW1wbGF0ZS9wb3BvdmVyL3BvcG92ZXItdGVtcGxhdGUuaHRtbCdcclxuICB9O1xyXG59KVxyXG5cclxuLmRpcmVjdGl2ZSgndWliUG9wb3ZlclRlbXBsYXRlJywgWyckdWliVG9vbHRpcCcsIGZ1bmN0aW9uKCR1aWJUb29sdGlwKSB7XHJcbiAgcmV0dXJuICR1aWJUb29sdGlwKCd1aWJQb3BvdmVyVGVtcGxhdGUnLCAncG9wb3ZlcicsICdjbGljaycsIHtcclxuICAgIHVzZUNvbnRlbnRFeHA6IHRydWVcclxuICB9KTtcclxufV0pXHJcblxyXG4uZGlyZWN0aXZlKCd1aWJQb3BvdmVySHRtbFBvcHVwJywgZnVuY3Rpb24oKSB7XHJcbiAgcmV0dXJuIHtcclxuICAgIHJlc3RyaWN0OiAnQScsXHJcbiAgICBzY29wZTogeyBjb250ZW50RXhwOiAnJicsIHVpYlRpdGxlOiAnQCcgfSxcclxuICAgIHRlbXBsYXRlVXJsOiAndWliL3RlbXBsYXRlL3BvcG92ZXIvcG9wb3Zlci1odG1sLmh0bWwnXHJcbiAgfTtcclxufSlcclxuXHJcbi5kaXJlY3RpdmUoJ3VpYlBvcG92ZXJIdG1sJywgWyckdWliVG9vbHRpcCcsIGZ1bmN0aW9uKCR1aWJUb29sdGlwKSB7XHJcbiAgcmV0dXJuICR1aWJUb29sdGlwKCd1aWJQb3BvdmVySHRtbCcsICdwb3BvdmVyJywgJ2NsaWNrJywge1xyXG4gICAgdXNlQ29udGVudEV4cDogdHJ1ZVxyXG4gIH0pO1xyXG59XSlcclxuXHJcbi5kaXJlY3RpdmUoJ3VpYlBvcG92ZXJQb3B1cCcsIGZ1bmN0aW9uKCkge1xyXG4gIHJldHVybiB7XHJcbiAgICByZXN0cmljdDogJ0EnLFxyXG4gICAgc2NvcGU6IHsgdWliVGl0bGU6ICdAJywgY29udGVudDogJ0AnIH0sXHJcbiAgICB0ZW1wbGF0ZVVybDogJ3VpYi90ZW1wbGF0ZS9wb3BvdmVyL3BvcG92ZXIuaHRtbCdcclxuICB9O1xyXG59KVxyXG5cclxuLmRpcmVjdGl2ZSgndWliUG9wb3ZlcicsIFsnJHVpYlRvb2x0aXAnLCBmdW5jdGlvbigkdWliVG9vbHRpcCkge1xyXG4gIHJldHVybiAkdWliVG9vbHRpcCgndWliUG9wb3ZlcicsICdwb3BvdmVyJywgJ2NsaWNrJyk7XHJcbn1dKTtcclxuXHJcbmFuZ3VsYXIubW9kdWxlKCd1aS5ib290c3RyYXAucHJvZ3Jlc3NiYXInLCBbXSlcclxuXHJcbi5jb25zdGFudCgndWliUHJvZ3Jlc3NDb25maWcnLCB7XHJcbiAgYW5pbWF0ZTogdHJ1ZSxcclxuICBtYXg6IDEwMFxyXG59KVxyXG5cclxuLmNvbnRyb2xsZXIoJ1VpYlByb2dyZXNzQ29udHJvbGxlcicsIFsnJHNjb3BlJywgJyRhdHRycycsICd1aWJQcm9ncmVzc0NvbmZpZycsIGZ1bmN0aW9uKCRzY29wZSwgJGF0dHJzLCBwcm9ncmVzc0NvbmZpZykge1xyXG4gIHZhciBzZWxmID0gdGhpcyxcclxuICAgICAgYW5pbWF0ZSA9IGFuZ3VsYXIuaXNEZWZpbmVkKCRhdHRycy5hbmltYXRlKSA/ICRzY29wZS4kcGFyZW50LiRldmFsKCRhdHRycy5hbmltYXRlKSA6IHByb2dyZXNzQ29uZmlnLmFuaW1hdGU7XHJcblxyXG4gIHRoaXMuYmFycyA9IFtdO1xyXG4gICRzY29wZS5tYXggPSBnZXRNYXhPckRlZmF1bHQoKTtcclxuXHJcbiAgdGhpcy5hZGRCYXIgPSBmdW5jdGlvbihiYXIsIGVsZW1lbnQsIGF0dHJzKSB7XHJcbiAgICBpZiAoIWFuaW1hdGUpIHtcclxuICAgICAgZWxlbWVudC5jc3Moeyd0cmFuc2l0aW9uJzogJ25vbmUnfSk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5iYXJzLnB1c2goYmFyKTtcclxuXHJcbiAgICBiYXIubWF4ID0gZ2V0TWF4T3JEZWZhdWx0KCk7XHJcbiAgICBiYXIudGl0bGUgPSBhdHRycyAmJiBhbmd1bGFyLmlzRGVmaW5lZChhdHRycy50aXRsZSkgPyBhdHRycy50aXRsZSA6ICdwcm9ncmVzc2Jhcic7XHJcblxyXG4gICAgYmFyLiR3YXRjaCgndmFsdWUnLCBmdW5jdGlvbih2YWx1ZSkge1xyXG4gICAgICBiYXIucmVjYWxjdWxhdGVQZXJjZW50YWdlKCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBiYXIucmVjYWxjdWxhdGVQZXJjZW50YWdlID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgIHZhciB0b3RhbFBlcmNlbnRhZ2UgPSBzZWxmLmJhcnMucmVkdWNlKGZ1bmN0aW9uKHRvdGFsLCBiYXIpIHtcclxuICAgICAgICBiYXIucGVyY2VudCA9ICsoMTAwICogYmFyLnZhbHVlIC8gYmFyLm1heCkudG9GaXhlZCgyKTtcclxuICAgICAgICByZXR1cm4gdG90YWwgKyBiYXIucGVyY2VudDtcclxuICAgICAgfSwgMCk7XHJcblxyXG4gICAgICBpZiAodG90YWxQZXJjZW50YWdlID4gMTAwKSB7XHJcbiAgICAgICAgYmFyLnBlcmNlbnQgLT0gdG90YWxQZXJjZW50YWdlIC0gMTAwO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIGJhci4kb24oJyRkZXN0cm95JywgZnVuY3Rpb24oKSB7XHJcbiAgICAgIGVsZW1lbnQgPSBudWxsO1xyXG4gICAgICBzZWxmLnJlbW92ZUJhcihiYXIpO1xyXG4gICAgfSk7XHJcbiAgfTtcclxuXHJcbiAgdGhpcy5yZW1vdmVCYXIgPSBmdW5jdGlvbihiYXIpIHtcclxuICAgIHRoaXMuYmFycy5zcGxpY2UodGhpcy5iYXJzLmluZGV4T2YoYmFyKSwgMSk7XHJcbiAgICB0aGlzLmJhcnMuZm9yRWFjaChmdW5jdGlvbiAoYmFyKSB7XHJcbiAgICAgIGJhci5yZWNhbGN1bGF0ZVBlcmNlbnRhZ2UoKTtcclxuICAgIH0pO1xyXG4gIH07XHJcblxyXG4gIC8vJGF0dHJzLiRvYnNlcnZlKCdtYXhQYXJhbScsIGZ1bmN0aW9uKG1heFBhcmFtKSB7XHJcbiAgJHNjb3BlLiR3YXRjaCgnbWF4UGFyYW0nLCBmdW5jdGlvbihtYXhQYXJhbSkge1xyXG4gICAgc2VsZi5iYXJzLmZvckVhY2goZnVuY3Rpb24oYmFyKSB7XHJcbiAgICAgIGJhci5tYXggPSBnZXRNYXhPckRlZmF1bHQoKTtcclxuICAgICAgYmFyLnJlY2FsY3VsYXRlUGVyY2VudGFnZSgpO1xyXG4gICAgfSk7XHJcbiAgfSk7XHJcblxyXG4gIGZ1bmN0aW9uIGdldE1heE9yRGVmYXVsdCAoKSB7XHJcbiAgICByZXR1cm4gYW5ndWxhci5pc0RlZmluZWQoJHNjb3BlLm1heFBhcmFtKSA/ICRzY29wZS5tYXhQYXJhbSA6IHByb2dyZXNzQ29uZmlnLm1heDtcclxuICB9XHJcbn1dKVxyXG5cclxuLmRpcmVjdGl2ZSgndWliUHJvZ3Jlc3MnLCBmdW5jdGlvbigpIHtcclxuICByZXR1cm4ge1xyXG4gICAgcmVwbGFjZTogdHJ1ZSxcclxuICAgIHRyYW5zY2x1ZGU6IHRydWUsXHJcbiAgICBjb250cm9sbGVyOiAnVWliUHJvZ3Jlc3NDb250cm9sbGVyJyxcclxuICAgIHJlcXVpcmU6ICd1aWJQcm9ncmVzcycsXHJcbiAgICBzY29wZToge1xyXG4gICAgICBtYXhQYXJhbTogJz0/bWF4J1xyXG4gICAgfSxcclxuICAgIHRlbXBsYXRlVXJsOiAndWliL3RlbXBsYXRlL3Byb2dyZXNzYmFyL3Byb2dyZXNzLmh0bWwnXHJcbiAgfTtcclxufSlcclxuXHJcbi5kaXJlY3RpdmUoJ3VpYkJhcicsIGZ1bmN0aW9uKCkge1xyXG4gIHJldHVybiB7XHJcbiAgICByZXBsYWNlOiB0cnVlLFxyXG4gICAgdHJhbnNjbHVkZTogdHJ1ZSxcclxuICAgIHJlcXVpcmU6ICdedWliUHJvZ3Jlc3MnLFxyXG4gICAgc2NvcGU6IHtcclxuICAgICAgdmFsdWU6ICc9JyxcclxuICAgICAgdHlwZTogJ0AnXHJcbiAgICB9LFxyXG4gICAgdGVtcGxhdGVVcmw6ICd1aWIvdGVtcGxhdGUvcHJvZ3Jlc3NiYXIvYmFyLmh0bWwnLFxyXG4gICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCBwcm9ncmVzc0N0cmwpIHtcclxuICAgICAgcHJvZ3Jlc3NDdHJsLmFkZEJhcihzY29wZSwgZWxlbWVudCwgYXR0cnMpO1xyXG4gICAgfVxyXG4gIH07XHJcbn0pXHJcblxyXG4uZGlyZWN0aXZlKCd1aWJQcm9ncmVzc2JhcicsIGZ1bmN0aW9uKCkge1xyXG4gIHJldHVybiB7XHJcbiAgICByZXBsYWNlOiB0cnVlLFxyXG4gICAgdHJhbnNjbHVkZTogdHJ1ZSxcclxuICAgIGNvbnRyb2xsZXI6ICdVaWJQcm9ncmVzc0NvbnRyb2xsZXInLFxyXG4gICAgc2NvcGU6IHtcclxuICAgICAgdmFsdWU6ICc9JyxcclxuICAgICAgbWF4UGFyYW06ICc9P21heCcsXHJcbiAgICAgIHR5cGU6ICdAJ1xyXG4gICAgfSxcclxuICAgIHRlbXBsYXRlVXJsOiAndWliL3RlbXBsYXRlL3Byb2dyZXNzYmFyL3Byb2dyZXNzYmFyLmh0bWwnLFxyXG4gICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCBwcm9ncmVzc0N0cmwpIHtcclxuICAgICAgcHJvZ3Jlc3NDdHJsLmFkZEJhcihzY29wZSwgYW5ndWxhci5lbGVtZW50KGVsZW1lbnQuY2hpbGRyZW4oKVswXSksIHt0aXRsZTogYXR0cnMudGl0bGV9KTtcclxuICAgIH1cclxuICB9O1xyXG59KTtcclxuXHJcbmFuZ3VsYXIubW9kdWxlKCd1aS5ib290c3RyYXAucmF0aW5nJywgW10pXHJcblxyXG4uY29uc3RhbnQoJ3VpYlJhdGluZ0NvbmZpZycsIHtcclxuICBtYXg6IDUsXHJcbiAgc3RhdGVPbjogbnVsbCxcclxuICBzdGF0ZU9mZjogbnVsbCxcclxuICBlbmFibGVSZXNldDogdHJ1ZSxcclxuICB0aXRsZXM6IFsnb25lJywgJ3R3bycsICd0aHJlZScsICdmb3VyJywgJ2ZpdmUnXVxyXG59KVxyXG5cclxuLmNvbnRyb2xsZXIoJ1VpYlJhdGluZ0NvbnRyb2xsZXInLCBbJyRzY29wZScsICckYXR0cnMnLCAndWliUmF0aW5nQ29uZmlnJywgZnVuY3Rpb24oJHNjb3BlLCAkYXR0cnMsIHJhdGluZ0NvbmZpZykge1xyXG4gIHZhciBuZ01vZGVsQ3RybCA9IHsgJHNldFZpZXdWYWx1ZTogYW5ndWxhci5ub29wIH0sXHJcbiAgICBzZWxmID0gdGhpcztcclxuXHJcbiAgdGhpcy5pbml0ID0gZnVuY3Rpb24obmdNb2RlbEN0cmxfKSB7XHJcbiAgICBuZ01vZGVsQ3RybCA9IG5nTW9kZWxDdHJsXztcclxuICAgIG5nTW9kZWxDdHJsLiRyZW5kZXIgPSB0aGlzLnJlbmRlcjtcclxuXHJcbiAgICBuZ01vZGVsQ3RybC4kZm9ybWF0dGVycy5wdXNoKGZ1bmN0aW9uKHZhbHVlKSB7XHJcbiAgICAgIGlmIChhbmd1bGFyLmlzTnVtYmVyKHZhbHVlKSAmJiB2YWx1ZSA8PCAwICE9PSB2YWx1ZSkge1xyXG4gICAgICAgIHZhbHVlID0gTWF0aC5yb3VuZCh2YWx1ZSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiB2YWx1ZTtcclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMuc3RhdGVPbiA9IGFuZ3VsYXIuaXNEZWZpbmVkKCRhdHRycy5zdGF0ZU9uKSA/ICRzY29wZS4kcGFyZW50LiRldmFsKCRhdHRycy5zdGF0ZU9uKSA6IHJhdGluZ0NvbmZpZy5zdGF0ZU9uO1xyXG4gICAgdGhpcy5zdGF0ZU9mZiA9IGFuZ3VsYXIuaXNEZWZpbmVkKCRhdHRycy5zdGF0ZU9mZikgPyAkc2NvcGUuJHBhcmVudC4kZXZhbCgkYXR0cnMuc3RhdGVPZmYpIDogcmF0aW5nQ29uZmlnLnN0YXRlT2ZmO1xyXG4gICAgdGhpcy5lbmFibGVSZXNldCA9IGFuZ3VsYXIuaXNEZWZpbmVkKCRhdHRycy5lbmFibGVSZXNldCkgP1xyXG4gICAgICAkc2NvcGUuJHBhcmVudC4kZXZhbCgkYXR0cnMuZW5hYmxlUmVzZXQpIDogcmF0aW5nQ29uZmlnLmVuYWJsZVJlc2V0O1xyXG4gICAgdmFyIHRtcFRpdGxlcyA9IGFuZ3VsYXIuaXNEZWZpbmVkKCRhdHRycy50aXRsZXMpID8gJHNjb3BlLiRwYXJlbnQuJGV2YWwoJGF0dHJzLnRpdGxlcykgOiByYXRpbmdDb25maWcudGl0bGVzO1xyXG4gICAgdGhpcy50aXRsZXMgPSBhbmd1bGFyLmlzQXJyYXkodG1wVGl0bGVzKSAmJiB0bXBUaXRsZXMubGVuZ3RoID4gMCA/XHJcbiAgICAgIHRtcFRpdGxlcyA6IHJhdGluZ0NvbmZpZy50aXRsZXM7XHJcblxyXG4gICAgdmFyIHJhdGluZ1N0YXRlcyA9IGFuZ3VsYXIuaXNEZWZpbmVkKCRhdHRycy5yYXRpbmdTdGF0ZXMpID9cclxuICAgICAgJHNjb3BlLiRwYXJlbnQuJGV2YWwoJGF0dHJzLnJhdGluZ1N0YXRlcykgOlxyXG4gICAgICBuZXcgQXJyYXkoYW5ndWxhci5pc0RlZmluZWQoJGF0dHJzLm1heCkgPyAkc2NvcGUuJHBhcmVudC4kZXZhbCgkYXR0cnMubWF4KSA6IHJhdGluZ0NvbmZpZy5tYXgpO1xyXG4gICAgJHNjb3BlLnJhbmdlID0gdGhpcy5idWlsZFRlbXBsYXRlT2JqZWN0cyhyYXRpbmdTdGF0ZXMpO1xyXG4gIH07XHJcblxyXG4gIHRoaXMuYnVpbGRUZW1wbGF0ZU9iamVjdHMgPSBmdW5jdGlvbihzdGF0ZXMpIHtcclxuICAgIGZvciAodmFyIGkgPSAwLCBuID0gc3RhdGVzLmxlbmd0aDsgaSA8IG47IGkrKykge1xyXG4gICAgICBzdGF0ZXNbaV0gPSBhbmd1bGFyLmV4dGVuZCh7IGluZGV4OiBpIH0sIHsgc3RhdGVPbjogdGhpcy5zdGF0ZU9uLCBzdGF0ZU9mZjogdGhpcy5zdGF0ZU9mZiwgdGl0bGU6IHRoaXMuZ2V0VGl0bGUoaSkgfSwgc3RhdGVzW2ldKTtcclxuICAgIH1cclxuICAgIHJldHVybiBzdGF0ZXM7XHJcbiAgfTtcclxuXHJcbiAgdGhpcy5nZXRUaXRsZSA9IGZ1bmN0aW9uKGluZGV4KSB7XHJcbiAgICBpZiAoaW5kZXggPj0gdGhpcy50aXRsZXMubGVuZ3RoKSB7XHJcbiAgICAgIHJldHVybiBpbmRleCArIDE7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRoaXMudGl0bGVzW2luZGV4XTtcclxuICB9O1xyXG5cclxuICAkc2NvcGUucmF0ZSA9IGZ1bmN0aW9uKHZhbHVlKSB7XHJcbiAgICBpZiAoISRzY29wZS5yZWFkb25seSAmJiB2YWx1ZSA+PSAwICYmIHZhbHVlIDw9ICRzY29wZS5yYW5nZS5sZW5ndGgpIHtcclxuICAgICAgdmFyIG5ld1ZpZXdWYWx1ZSA9IHNlbGYuZW5hYmxlUmVzZXQgJiYgbmdNb2RlbEN0cmwuJHZpZXdWYWx1ZSA9PT0gdmFsdWUgPyAwIDogdmFsdWU7XHJcbiAgICAgIG5nTW9kZWxDdHJsLiRzZXRWaWV3VmFsdWUobmV3Vmlld1ZhbHVlKTtcclxuICAgICAgbmdNb2RlbEN0cmwuJHJlbmRlcigpO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gICRzY29wZS5lbnRlciA9IGZ1bmN0aW9uKHZhbHVlKSB7XHJcbiAgICBpZiAoISRzY29wZS5yZWFkb25seSkge1xyXG4gICAgICAkc2NvcGUudmFsdWUgPSB2YWx1ZTtcclxuICAgIH1cclxuICAgICRzY29wZS5vbkhvdmVyKHt2YWx1ZTogdmFsdWV9KTtcclxuICB9O1xyXG5cclxuICAkc2NvcGUucmVzZXQgPSBmdW5jdGlvbigpIHtcclxuICAgICRzY29wZS52YWx1ZSA9IG5nTW9kZWxDdHJsLiR2aWV3VmFsdWU7XHJcbiAgICAkc2NvcGUub25MZWF2ZSgpO1xyXG4gIH07XHJcblxyXG4gICRzY29wZS5vbktleWRvd24gPSBmdW5jdGlvbihldnQpIHtcclxuICAgIGlmICgvKDM3fDM4fDM5fDQwKS8udGVzdChldnQud2hpY2gpKSB7XHJcbiAgICAgIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICBldnQuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICRzY29wZS5yYXRlKCRzY29wZS52YWx1ZSArIChldnQud2hpY2ggPT09IDM4IHx8IGV2dC53aGljaCA9PT0gMzkgPyAxIDogLTEpKTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICB0aGlzLnJlbmRlciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgJHNjb3BlLnZhbHVlID0gbmdNb2RlbEN0cmwuJHZpZXdWYWx1ZTtcclxuICAgICRzY29wZS50aXRsZSA9IHNlbGYuZ2V0VGl0bGUoJHNjb3BlLnZhbHVlIC0gMSk7XHJcbiAgfTtcclxufV0pXHJcblxyXG4uZGlyZWN0aXZlKCd1aWJSYXRpbmcnLCBmdW5jdGlvbigpIHtcclxuICByZXR1cm4ge1xyXG4gICAgcmVxdWlyZTogWyd1aWJSYXRpbmcnLCAnbmdNb2RlbCddLFxyXG4gICAgcmVzdHJpY3Q6ICdBJyxcclxuICAgIHNjb3BlOiB7XHJcbiAgICAgIHJlYWRvbmx5OiAnPT9yZWFkT25seScsXHJcbiAgICAgIG9uSG92ZXI6ICcmJyxcclxuICAgICAgb25MZWF2ZTogJyYnXHJcbiAgICB9LFxyXG4gICAgY29udHJvbGxlcjogJ1VpYlJhdGluZ0NvbnRyb2xsZXInLFxyXG4gICAgdGVtcGxhdGVVcmw6ICd1aWIvdGVtcGxhdGUvcmF0aW5nL3JhdGluZy5odG1sJyxcclxuICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBlbGVtZW50LCBhdHRycywgY3RybHMpIHtcclxuICAgICAgdmFyIHJhdGluZ0N0cmwgPSBjdHJsc1swXSwgbmdNb2RlbEN0cmwgPSBjdHJsc1sxXTtcclxuICAgICAgcmF0aW5nQ3RybC5pbml0KG5nTW9kZWxDdHJsKTtcclxuICAgIH1cclxuICB9O1xyXG59KTtcclxuXHJcbmFuZ3VsYXIubW9kdWxlKCd1aS5ib290c3RyYXAudGFicycsIFtdKVxyXG5cclxuLmNvbnRyb2xsZXIoJ1VpYlRhYnNldENvbnRyb2xsZXInLCBbJyRzY29wZScsIGZ1bmN0aW9uICgkc2NvcGUpIHtcclxuICB2YXIgY3RybCA9IHRoaXMsXHJcbiAgICBvbGRJbmRleDtcclxuICBjdHJsLnRhYnMgPSBbXTtcclxuXHJcbiAgY3RybC5zZWxlY3QgPSBmdW5jdGlvbihpbmRleCwgZXZ0KSB7XHJcbiAgICBpZiAoIWRlc3Ryb3llZCkge1xyXG4gICAgICB2YXIgcHJldmlvdXNJbmRleCA9IGZpbmRUYWJJbmRleChvbGRJbmRleCk7XHJcbiAgICAgIHZhciBwcmV2aW91c1NlbGVjdGVkID0gY3RybC50YWJzW3ByZXZpb3VzSW5kZXhdO1xyXG4gICAgICBpZiAocHJldmlvdXNTZWxlY3RlZCkge1xyXG4gICAgICAgIHByZXZpb3VzU2VsZWN0ZWQudGFiLm9uRGVzZWxlY3Qoe1xyXG4gICAgICAgICAgJGV2ZW50OiBldnQsXHJcbiAgICAgICAgICAkc2VsZWN0ZWRJbmRleDogaW5kZXhcclxuICAgICAgICB9KTtcclxuICAgICAgICBpZiAoZXZ0ICYmIGV2dC5pc0RlZmF1bHRQcmV2ZW50ZWQoKSkge1xyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBwcmV2aW91c1NlbGVjdGVkLnRhYi5hY3RpdmUgPSBmYWxzZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgdmFyIHNlbGVjdGVkID0gY3RybC50YWJzW2luZGV4XTtcclxuICAgICAgaWYgKHNlbGVjdGVkKSB7XHJcbiAgICAgICAgc2VsZWN0ZWQudGFiLm9uU2VsZWN0KHtcclxuICAgICAgICAgICRldmVudDogZXZ0XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgc2VsZWN0ZWQudGFiLmFjdGl2ZSA9IHRydWU7XHJcbiAgICAgICAgY3RybC5hY3RpdmUgPSBzZWxlY3RlZC5pbmRleDtcclxuICAgICAgICBvbGRJbmRleCA9IHNlbGVjdGVkLmluZGV4O1xyXG4gICAgICB9IGVsc2UgaWYgKCFzZWxlY3RlZCAmJiBhbmd1bGFyLmlzRGVmaW5lZChvbGRJbmRleCkpIHtcclxuICAgICAgICBjdHJsLmFjdGl2ZSA9IG51bGw7XHJcbiAgICAgICAgb2xkSW5kZXggPSBudWxsO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgY3RybC5hZGRUYWIgPSBmdW5jdGlvbiBhZGRUYWIodGFiKSB7XHJcbiAgICBjdHJsLnRhYnMucHVzaCh7XHJcbiAgICAgIHRhYjogdGFiLFxyXG4gICAgICBpbmRleDogdGFiLmluZGV4XHJcbiAgICB9KTtcclxuICAgIGN0cmwudGFicy5zb3J0KGZ1bmN0aW9uKHQxLCB0Mikge1xyXG4gICAgICBpZiAodDEuaW5kZXggPiB0Mi5pbmRleCkge1xyXG4gICAgICAgIHJldHVybiAxO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAodDEuaW5kZXggPCB0Mi5pbmRleCkge1xyXG4gICAgICAgIHJldHVybiAtMTtcclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIDA7XHJcbiAgICB9KTtcclxuXHJcbiAgICBpZiAodGFiLmluZGV4ID09PSBjdHJsLmFjdGl2ZSB8fCAhYW5ndWxhci5pc0RlZmluZWQoY3RybC5hY3RpdmUpICYmIGN0cmwudGFicy5sZW5ndGggPT09IDEpIHtcclxuICAgICAgdmFyIG5ld0FjdGl2ZUluZGV4ID0gZmluZFRhYkluZGV4KHRhYi5pbmRleCk7XHJcbiAgICAgIGN0cmwuc2VsZWN0KG5ld0FjdGl2ZUluZGV4KTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICBjdHJsLnJlbW92ZVRhYiA9IGZ1bmN0aW9uIHJlbW92ZVRhYih0YWIpIHtcclxuICAgIHZhciBpbmRleDtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY3RybC50YWJzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIGlmIChjdHJsLnRhYnNbaV0udGFiID09PSB0YWIpIHtcclxuICAgICAgICBpbmRleCA9IGk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpZiAoY3RybC50YWJzW2luZGV4XS5pbmRleCA9PT0gY3RybC5hY3RpdmUpIHtcclxuICAgICAgdmFyIG5ld0FjdGl2ZVRhYkluZGV4ID0gaW5kZXggPT09IGN0cmwudGFicy5sZW5ndGggLSAxID9cclxuICAgICAgICBpbmRleCAtIDEgOiBpbmRleCArIDEgJSBjdHJsLnRhYnMubGVuZ3RoO1xyXG4gICAgICBjdHJsLnNlbGVjdChuZXdBY3RpdmVUYWJJbmRleCk7XHJcbiAgICB9XHJcblxyXG4gICAgY3RybC50YWJzLnNwbGljZShpbmRleCwgMSk7XHJcbiAgfTtcclxuXHJcbiAgJHNjb3BlLiR3YXRjaCgndGFic2V0LmFjdGl2ZScsIGZ1bmN0aW9uKHZhbCkge1xyXG4gICAgaWYgKGFuZ3VsYXIuaXNEZWZpbmVkKHZhbCkgJiYgdmFsICE9PSBvbGRJbmRleCkge1xyXG4gICAgICBjdHJsLnNlbGVjdChmaW5kVGFiSW5kZXgodmFsKSk7XHJcbiAgICB9XHJcbiAgfSk7XHJcblxyXG4gIHZhciBkZXN0cm95ZWQ7XHJcbiAgJHNjb3BlLiRvbignJGRlc3Ryb3knLCBmdW5jdGlvbigpIHtcclxuICAgIGRlc3Ryb3llZCA9IHRydWU7XHJcbiAgfSk7XHJcblxyXG4gIGZ1bmN0aW9uIGZpbmRUYWJJbmRleChpbmRleCkge1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjdHJsLnRhYnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgaWYgKGN0cmwudGFic1tpXS5pbmRleCA9PT0gaW5kZXgpIHtcclxuICAgICAgICByZXR1cm4gaTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxufV0pXHJcblxyXG4uZGlyZWN0aXZlKCd1aWJUYWJzZXQnLCBmdW5jdGlvbigpIHtcclxuICByZXR1cm4ge1xyXG4gICAgdHJhbnNjbHVkZTogdHJ1ZSxcclxuICAgIHJlcGxhY2U6IHRydWUsXHJcbiAgICBzY29wZToge30sXHJcbiAgICBiaW5kVG9Db250cm9sbGVyOiB7XHJcbiAgICAgIGFjdGl2ZTogJz0/JyxcclxuICAgICAgdHlwZTogJ0AnXHJcbiAgICB9LFxyXG4gICAgY29udHJvbGxlcjogJ1VpYlRhYnNldENvbnRyb2xsZXInLFxyXG4gICAgY29udHJvbGxlckFzOiAndGFic2V0JyxcclxuICAgIHRlbXBsYXRlVXJsOiBmdW5jdGlvbihlbGVtZW50LCBhdHRycykge1xyXG4gICAgICByZXR1cm4gYXR0cnMudGVtcGxhdGVVcmwgfHwgJ3VpYi90ZW1wbGF0ZS90YWJzL3RhYnNldC5odG1sJztcclxuICAgIH0sXHJcbiAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxlbWVudCwgYXR0cnMpIHtcclxuICAgICAgc2NvcGUudmVydGljYWwgPSBhbmd1bGFyLmlzRGVmaW5lZChhdHRycy52ZXJ0aWNhbCkgP1xyXG4gICAgICAgIHNjb3BlLiRwYXJlbnQuJGV2YWwoYXR0cnMudmVydGljYWwpIDogZmFsc2U7XHJcbiAgICAgIHNjb3BlLmp1c3RpZmllZCA9IGFuZ3VsYXIuaXNEZWZpbmVkKGF0dHJzLmp1c3RpZmllZCkgP1xyXG4gICAgICAgIHNjb3BlLiRwYXJlbnQuJGV2YWwoYXR0cnMuanVzdGlmaWVkKSA6IGZhbHNlO1xyXG4gICAgfVxyXG4gIH07XHJcbn0pXHJcblxyXG4uZGlyZWN0aXZlKCd1aWJUYWInLCBbJyRwYXJzZScsIGZ1bmN0aW9uKCRwYXJzZSkge1xyXG4gIHJldHVybiB7XHJcbiAgICByZXF1aXJlOiAnXnVpYlRhYnNldCcsXHJcbiAgICByZXBsYWNlOiB0cnVlLFxyXG4gICAgdGVtcGxhdGVVcmw6IGZ1bmN0aW9uKGVsZW1lbnQsIGF0dHJzKSB7XHJcbiAgICAgIHJldHVybiBhdHRycy50ZW1wbGF0ZVVybCB8fCAndWliL3RlbXBsYXRlL3RhYnMvdGFiLmh0bWwnO1xyXG4gICAgfSxcclxuICAgIHRyYW5zY2x1ZGU6IHRydWUsXHJcbiAgICBzY29wZToge1xyXG4gICAgICBoZWFkaW5nOiAnQCcsXHJcbiAgICAgIGluZGV4OiAnPT8nLFxyXG4gICAgICBjbGFzc2VzOiAnQD8nLFxyXG4gICAgICBvblNlbGVjdDogJyZzZWxlY3QnLCAvL1RoaXMgY2FsbGJhY2sgaXMgY2FsbGVkIGluIGNvbnRlbnRIZWFkaW5nVHJhbnNjbHVkZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIC8vb25jZSBpdCBpbnNlcnRzIHRoZSB0YWIncyBjb250ZW50IGludG8gdGhlIGRvbVxyXG4gICAgICBvbkRlc2VsZWN0OiAnJmRlc2VsZWN0J1xyXG4gICAgfSxcclxuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAvL0VtcHR5IGNvbnRyb2xsZXIgc28gb3RoZXIgZGlyZWN0aXZlcyBjYW4gcmVxdWlyZSBiZWluZyAndW5kZXInIGEgdGFiXHJcbiAgICB9LFxyXG4gICAgY29udHJvbGxlckFzOiAndGFiJyxcclxuICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBlbG0sIGF0dHJzLCB0YWJzZXRDdHJsLCB0cmFuc2NsdWRlKSB7XHJcbiAgICAgIHNjb3BlLmRpc2FibGVkID0gZmFsc2U7XHJcbiAgICAgIGlmIChhdHRycy5kaXNhYmxlKSB7XHJcbiAgICAgICAgc2NvcGUuJHBhcmVudC4kd2F0Y2goJHBhcnNlKGF0dHJzLmRpc2FibGUpLCBmdW5jdGlvbih2YWx1ZSkge1xyXG4gICAgICAgICAgc2NvcGUuZGlzYWJsZWQgPSAhISB2YWx1ZTtcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKGFuZ3VsYXIuaXNVbmRlZmluZWQoYXR0cnMuaW5kZXgpKSB7XHJcbiAgICAgICAgaWYgKHRhYnNldEN0cmwudGFicyAmJiB0YWJzZXRDdHJsLnRhYnMubGVuZ3RoKSB7XHJcbiAgICAgICAgICBzY29wZS5pbmRleCA9IE1hdGgubWF4LmFwcGx5KG51bGwsIHRhYnNldEN0cmwudGFicy5tYXAoZnVuY3Rpb24odCkgeyByZXR1cm4gdC5pbmRleDsgfSkpICsgMTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgc2NvcGUuaW5kZXggPSAwO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKGFuZ3VsYXIuaXNVbmRlZmluZWQoYXR0cnMuY2xhc3NlcykpIHtcclxuICAgICAgICBzY29wZS5jbGFzc2VzID0gJyc7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHNjb3BlLnNlbGVjdCA9IGZ1bmN0aW9uKGV2dCkge1xyXG4gICAgICAgIGlmICghc2NvcGUuZGlzYWJsZWQpIHtcclxuICAgICAgICAgIHZhciBpbmRleDtcclxuICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGFic2V0Q3RybC50YWJzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGlmICh0YWJzZXRDdHJsLnRhYnNbaV0udGFiID09PSBzY29wZSkge1xyXG4gICAgICAgICAgICAgIGluZGV4ID0gaTtcclxuICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIHRhYnNldEN0cmwuc2VsZWN0KGluZGV4LCBldnQpO1xyXG4gICAgICAgIH1cclxuICAgICAgfTtcclxuXHJcbiAgICAgIHRhYnNldEN0cmwuYWRkVGFiKHNjb3BlKTtcclxuICAgICAgc2NvcGUuJG9uKCckZGVzdHJveScsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRhYnNldEN0cmwucmVtb3ZlVGFiKHNjb3BlKTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICAvL1dlIG5lZWQgdG8gdHJhbnNjbHVkZSBsYXRlciwgb25jZSB0aGUgY29udGVudCBjb250YWluZXIgaXMgcmVhZHkuXHJcbiAgICAgIC8vd2hlbiB0aGlzIGxpbmsgaGFwcGVucywgd2UncmUgaW5zaWRlIGEgdGFiIGhlYWRpbmcuXHJcbiAgICAgIHNjb3BlLiR0cmFuc2NsdWRlRm4gPSB0cmFuc2NsdWRlO1xyXG4gICAgfVxyXG4gIH07XHJcbn1dKVxyXG5cclxuLmRpcmVjdGl2ZSgndWliVGFiSGVhZGluZ1RyYW5zY2x1ZGUnLCBmdW5jdGlvbigpIHtcclxuICByZXR1cm4ge1xyXG4gICAgcmVzdHJpY3Q6ICdBJyxcclxuICAgIHJlcXVpcmU6ICdedWliVGFiJyxcclxuICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBlbG0pIHtcclxuICAgICAgc2NvcGUuJHdhdGNoKCdoZWFkaW5nRWxlbWVudCcsIGZ1bmN0aW9uIHVwZGF0ZUhlYWRpbmdFbGVtZW50KGhlYWRpbmcpIHtcclxuICAgICAgICBpZiAoaGVhZGluZykge1xyXG4gICAgICAgICAgZWxtLmh0bWwoJycpO1xyXG4gICAgICAgICAgZWxtLmFwcGVuZChoZWFkaW5nKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH07XHJcbn0pXHJcblxyXG4uZGlyZWN0aXZlKCd1aWJUYWJDb250ZW50VHJhbnNjbHVkZScsIGZ1bmN0aW9uKCkge1xyXG4gIHJldHVybiB7XHJcbiAgICByZXN0cmljdDogJ0EnLFxyXG4gICAgcmVxdWlyZTogJ151aWJUYWJzZXQnLFxyXG4gICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsbSwgYXR0cnMpIHtcclxuICAgICAgdmFyIHRhYiA9IHNjb3BlLiRldmFsKGF0dHJzLnVpYlRhYkNvbnRlbnRUcmFuc2NsdWRlKS50YWI7XHJcblxyXG4gICAgICAvL05vdyBvdXIgdGFiIGlzIHJlYWR5IHRvIGJlIHRyYW5zY2x1ZGVkOiBib3RoIHRoZSB0YWIgaGVhZGluZyBhcmVhXHJcbiAgICAgIC8vYW5kIHRoZSB0YWIgY29udGVudCBhcmVhIGFyZSBsb2FkZWQuICBUcmFuc2NsdWRlICdlbSBib3RoLlxyXG4gICAgICB0YWIuJHRyYW5zY2x1ZGVGbih0YWIuJHBhcmVudCwgZnVuY3Rpb24oY29udGVudHMpIHtcclxuICAgICAgICBhbmd1bGFyLmZvckVhY2goY29udGVudHMsIGZ1bmN0aW9uKG5vZGUpIHtcclxuICAgICAgICAgIGlmIChpc1RhYkhlYWRpbmcobm9kZSkpIHtcclxuICAgICAgICAgICAgLy9MZXQgdGFiSGVhZGluZ1RyYW5zY2x1ZGUga25vdy5cclxuICAgICAgICAgICAgdGFiLmhlYWRpbmdFbGVtZW50ID0gbm9kZTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGVsbS5hcHBlbmQobm9kZSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIGZ1bmN0aW9uIGlzVGFiSGVhZGluZyhub2RlKSB7XHJcbiAgICByZXR1cm4gbm9kZS50YWdOYW1lICYmIChcclxuICAgICAgbm9kZS5oYXNBdHRyaWJ1dGUoJ3VpYi10YWItaGVhZGluZycpIHx8XHJcbiAgICAgIG5vZGUuaGFzQXR0cmlidXRlKCdkYXRhLXVpYi10YWItaGVhZGluZycpIHx8XHJcbiAgICAgIG5vZGUuaGFzQXR0cmlidXRlKCd4LXVpYi10YWItaGVhZGluZycpIHx8XHJcbiAgICAgIG5vZGUudGFnTmFtZS50b0xvd2VyQ2FzZSgpID09PSAndWliLXRhYi1oZWFkaW5nJyB8fFxyXG4gICAgICBub2RlLnRhZ05hbWUudG9Mb3dlckNhc2UoKSA9PT0gJ2RhdGEtdWliLXRhYi1oZWFkaW5nJyB8fFxyXG4gICAgICBub2RlLnRhZ05hbWUudG9Mb3dlckNhc2UoKSA9PT0gJ3gtdWliLXRhYi1oZWFkaW5nJyB8fFxyXG4gICAgICBub2RlLnRhZ05hbWUudG9Mb3dlckNhc2UoKSA9PT0gJ3VpYjp0YWItaGVhZGluZydcclxuICAgICk7XHJcbiAgfVxyXG59KTtcclxuXHJcbmFuZ3VsYXIubW9kdWxlKCd1aS5ib290c3RyYXAudGltZXBpY2tlcicsIFtdKVxyXG5cclxuLmNvbnN0YW50KCd1aWJUaW1lcGlja2VyQ29uZmlnJywge1xyXG4gIGhvdXJTdGVwOiAxLFxyXG4gIG1pbnV0ZVN0ZXA6IDEsXHJcbiAgc2Vjb25kU3RlcDogMSxcclxuICBzaG93TWVyaWRpYW46IHRydWUsXHJcbiAgc2hvd1NlY29uZHM6IGZhbHNlLFxyXG4gIG1lcmlkaWFuczogbnVsbCxcclxuICByZWFkb25seUlucHV0OiBmYWxzZSxcclxuICBtb3VzZXdoZWVsOiB0cnVlLFxyXG4gIGFycm93a2V5czogdHJ1ZSxcclxuICBzaG93U3Bpbm5lcnM6IHRydWUsXHJcbiAgdGVtcGxhdGVVcmw6ICd1aWIvdGVtcGxhdGUvdGltZXBpY2tlci90aW1lcGlja2VyLmh0bWwnXHJcbn0pXHJcblxyXG4uY29udHJvbGxlcignVWliVGltZXBpY2tlckNvbnRyb2xsZXInLCBbJyRzY29wZScsICckZWxlbWVudCcsICckYXR0cnMnLCAnJHBhcnNlJywgJyRsb2cnLCAnJGxvY2FsZScsICd1aWJUaW1lcGlja2VyQ29uZmlnJywgZnVuY3Rpb24oJHNjb3BlLCAkZWxlbWVudCwgJGF0dHJzLCAkcGFyc2UsICRsb2csICRsb2NhbGUsIHRpbWVwaWNrZXJDb25maWcpIHtcclxuICB2YXIgc2VsZWN0ZWQgPSBuZXcgRGF0ZSgpLFxyXG4gICAgd2F0Y2hlcnMgPSBbXSxcclxuICAgIG5nTW9kZWxDdHJsID0geyAkc2V0Vmlld1ZhbHVlOiBhbmd1bGFyLm5vb3AgfSwgLy8gbnVsbE1vZGVsQ3RybFxyXG4gICAgbWVyaWRpYW5zID0gYW5ndWxhci5pc0RlZmluZWQoJGF0dHJzLm1lcmlkaWFucykgPyAkc2NvcGUuJHBhcmVudC4kZXZhbCgkYXR0cnMubWVyaWRpYW5zKSA6IHRpbWVwaWNrZXJDb25maWcubWVyaWRpYW5zIHx8ICRsb2NhbGUuREFURVRJTUVfRk9STUFUUy5BTVBNUyxcclxuICAgIHBhZEhvdXJzID0gYW5ndWxhci5pc0RlZmluZWQoJGF0dHJzLnBhZEhvdXJzKSA/ICRzY29wZS4kcGFyZW50LiRldmFsKCRhdHRycy5wYWRIb3VycykgOiB0cnVlO1xyXG5cclxuICAkc2NvcGUudGFiaW5kZXggPSBhbmd1bGFyLmlzRGVmaW5lZCgkYXR0cnMudGFiaW5kZXgpID8gJGF0dHJzLnRhYmluZGV4IDogMDtcclxuICAkZWxlbWVudC5yZW1vdmVBdHRyKCd0YWJpbmRleCcpO1xyXG5cclxuICB0aGlzLmluaXQgPSBmdW5jdGlvbihuZ01vZGVsQ3RybF8sIGlucHV0cykge1xyXG4gICAgbmdNb2RlbEN0cmwgPSBuZ01vZGVsQ3RybF87XHJcbiAgICBuZ01vZGVsQ3RybC4kcmVuZGVyID0gdGhpcy5yZW5kZXI7XHJcblxyXG4gICAgbmdNb2RlbEN0cmwuJGZvcm1hdHRlcnMudW5zaGlmdChmdW5jdGlvbihtb2RlbFZhbHVlKSB7XHJcbiAgICAgIHJldHVybiBtb2RlbFZhbHVlID8gbmV3IERhdGUobW9kZWxWYWx1ZSkgOiBudWxsO1xyXG4gICAgfSk7XHJcblxyXG4gICAgdmFyIGhvdXJzSW5wdXRFbCA9IGlucHV0cy5lcSgwKSxcclxuICAgICAgICBtaW51dGVzSW5wdXRFbCA9IGlucHV0cy5lcSgxKSxcclxuICAgICAgICBzZWNvbmRzSW5wdXRFbCA9IGlucHV0cy5lcSgyKTtcclxuXHJcbiAgICB2YXIgbW91c2V3aGVlbCA9IGFuZ3VsYXIuaXNEZWZpbmVkKCRhdHRycy5tb3VzZXdoZWVsKSA/ICRzY29wZS4kcGFyZW50LiRldmFsKCRhdHRycy5tb3VzZXdoZWVsKSA6IHRpbWVwaWNrZXJDb25maWcubW91c2V3aGVlbDtcclxuXHJcbiAgICBpZiAobW91c2V3aGVlbCkge1xyXG4gICAgICB0aGlzLnNldHVwTW91c2V3aGVlbEV2ZW50cyhob3Vyc0lucHV0RWwsIG1pbnV0ZXNJbnB1dEVsLCBzZWNvbmRzSW5wdXRFbCk7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGFycm93a2V5cyA9IGFuZ3VsYXIuaXNEZWZpbmVkKCRhdHRycy5hcnJvd2tleXMpID8gJHNjb3BlLiRwYXJlbnQuJGV2YWwoJGF0dHJzLmFycm93a2V5cykgOiB0aW1lcGlja2VyQ29uZmlnLmFycm93a2V5cztcclxuICAgIGlmIChhcnJvd2tleXMpIHtcclxuICAgICAgdGhpcy5zZXR1cEFycm93a2V5RXZlbnRzKGhvdXJzSW5wdXRFbCwgbWludXRlc0lucHV0RWwsIHNlY29uZHNJbnB1dEVsKTtcclxuICAgIH1cclxuXHJcbiAgICAkc2NvcGUucmVhZG9ubHlJbnB1dCA9IGFuZ3VsYXIuaXNEZWZpbmVkKCRhdHRycy5yZWFkb25seUlucHV0KSA/ICRzY29wZS4kcGFyZW50LiRldmFsKCRhdHRycy5yZWFkb25seUlucHV0KSA6IHRpbWVwaWNrZXJDb25maWcucmVhZG9ubHlJbnB1dDtcclxuICAgIHRoaXMuc2V0dXBJbnB1dEV2ZW50cyhob3Vyc0lucHV0RWwsIG1pbnV0ZXNJbnB1dEVsLCBzZWNvbmRzSW5wdXRFbCk7XHJcbiAgfTtcclxuXHJcbiAgdmFyIGhvdXJTdGVwID0gdGltZXBpY2tlckNvbmZpZy5ob3VyU3RlcDtcclxuICBpZiAoJGF0dHJzLmhvdXJTdGVwKSB7XHJcbiAgICB3YXRjaGVycy5wdXNoKCRzY29wZS4kcGFyZW50LiR3YXRjaCgkcGFyc2UoJGF0dHJzLmhvdXJTdGVwKSwgZnVuY3Rpb24odmFsdWUpIHtcclxuICAgICAgaG91clN0ZXAgPSArdmFsdWU7XHJcbiAgICB9KSk7XHJcbiAgfVxyXG5cclxuICB2YXIgbWludXRlU3RlcCA9IHRpbWVwaWNrZXJDb25maWcubWludXRlU3RlcDtcclxuICBpZiAoJGF0dHJzLm1pbnV0ZVN0ZXApIHtcclxuICAgIHdhdGNoZXJzLnB1c2goJHNjb3BlLiRwYXJlbnQuJHdhdGNoKCRwYXJzZSgkYXR0cnMubWludXRlU3RlcCksIGZ1bmN0aW9uKHZhbHVlKSB7XHJcbiAgICAgIG1pbnV0ZVN0ZXAgPSArdmFsdWU7XHJcbiAgICB9KSk7XHJcbiAgfVxyXG5cclxuICB2YXIgbWluO1xyXG4gIHdhdGNoZXJzLnB1c2goJHNjb3BlLiRwYXJlbnQuJHdhdGNoKCRwYXJzZSgkYXR0cnMubWluKSwgZnVuY3Rpb24odmFsdWUpIHtcclxuICAgIHZhciBkdCA9IG5ldyBEYXRlKHZhbHVlKTtcclxuICAgIG1pbiA9IGlzTmFOKGR0KSA/IHVuZGVmaW5lZCA6IGR0O1xyXG4gIH0pKTtcclxuXHJcbiAgdmFyIG1heDtcclxuICB3YXRjaGVycy5wdXNoKCRzY29wZS4kcGFyZW50LiR3YXRjaCgkcGFyc2UoJGF0dHJzLm1heCksIGZ1bmN0aW9uKHZhbHVlKSB7XHJcbiAgICB2YXIgZHQgPSBuZXcgRGF0ZSh2YWx1ZSk7XHJcbiAgICBtYXggPSBpc05hTihkdCkgPyB1bmRlZmluZWQgOiBkdDtcclxuICB9KSk7XHJcblxyXG4gIHZhciBkaXNhYmxlZCA9IGZhbHNlO1xyXG4gIGlmICgkYXR0cnMubmdEaXNhYmxlZCkge1xyXG4gICAgd2F0Y2hlcnMucHVzaCgkc2NvcGUuJHBhcmVudC4kd2F0Y2goJHBhcnNlKCRhdHRycy5uZ0Rpc2FibGVkKSwgZnVuY3Rpb24odmFsdWUpIHtcclxuICAgICAgZGlzYWJsZWQgPSB2YWx1ZTtcclxuICAgIH0pKTtcclxuICB9XHJcblxyXG4gICRzY29wZS5ub0luY3JlbWVudEhvdXJzID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgaW5jcmVtZW50ZWRTZWxlY3RlZCA9IGFkZE1pbnV0ZXMoc2VsZWN0ZWQsIGhvdXJTdGVwICogNjApO1xyXG4gICAgcmV0dXJuIGRpc2FibGVkIHx8IGluY3JlbWVudGVkU2VsZWN0ZWQgPiBtYXggfHxcclxuICAgICAgaW5jcmVtZW50ZWRTZWxlY3RlZCA8IHNlbGVjdGVkICYmIGluY3JlbWVudGVkU2VsZWN0ZWQgPCBtaW47XHJcbiAgfTtcclxuXHJcbiAgJHNjb3BlLm5vRGVjcmVtZW50SG91cnMgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBkZWNyZW1lbnRlZFNlbGVjdGVkID0gYWRkTWludXRlcyhzZWxlY3RlZCwgLWhvdXJTdGVwICogNjApO1xyXG4gICAgcmV0dXJuIGRpc2FibGVkIHx8IGRlY3JlbWVudGVkU2VsZWN0ZWQgPCBtaW4gfHxcclxuICAgICAgZGVjcmVtZW50ZWRTZWxlY3RlZCA+IHNlbGVjdGVkICYmIGRlY3JlbWVudGVkU2VsZWN0ZWQgPiBtYXg7XHJcbiAgfTtcclxuXHJcbiAgJHNjb3BlLm5vSW5jcmVtZW50TWludXRlcyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGluY3JlbWVudGVkU2VsZWN0ZWQgPSBhZGRNaW51dGVzKHNlbGVjdGVkLCBtaW51dGVTdGVwKTtcclxuICAgIHJldHVybiBkaXNhYmxlZCB8fCBpbmNyZW1lbnRlZFNlbGVjdGVkID4gbWF4IHx8XHJcbiAgICAgIGluY3JlbWVudGVkU2VsZWN0ZWQgPCBzZWxlY3RlZCAmJiBpbmNyZW1lbnRlZFNlbGVjdGVkIDwgbWluO1xyXG4gIH07XHJcblxyXG4gICRzY29wZS5ub0RlY3JlbWVudE1pbnV0ZXMgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBkZWNyZW1lbnRlZFNlbGVjdGVkID0gYWRkTWludXRlcyhzZWxlY3RlZCwgLW1pbnV0ZVN0ZXApO1xyXG4gICAgcmV0dXJuIGRpc2FibGVkIHx8IGRlY3JlbWVudGVkU2VsZWN0ZWQgPCBtaW4gfHxcclxuICAgICAgZGVjcmVtZW50ZWRTZWxlY3RlZCA+IHNlbGVjdGVkICYmIGRlY3JlbWVudGVkU2VsZWN0ZWQgPiBtYXg7XHJcbiAgfTtcclxuXHJcbiAgJHNjb3BlLm5vSW5jcmVtZW50U2Vjb25kcyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGluY3JlbWVudGVkU2VsZWN0ZWQgPSBhZGRTZWNvbmRzKHNlbGVjdGVkLCBzZWNvbmRTdGVwKTtcclxuICAgIHJldHVybiBkaXNhYmxlZCB8fCBpbmNyZW1lbnRlZFNlbGVjdGVkID4gbWF4IHx8XHJcbiAgICAgIGluY3JlbWVudGVkU2VsZWN0ZWQgPCBzZWxlY3RlZCAmJiBpbmNyZW1lbnRlZFNlbGVjdGVkIDwgbWluO1xyXG4gIH07XHJcblxyXG4gICRzY29wZS5ub0RlY3JlbWVudFNlY29uZHMgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBkZWNyZW1lbnRlZFNlbGVjdGVkID0gYWRkU2Vjb25kcyhzZWxlY3RlZCwgLXNlY29uZFN0ZXApO1xyXG4gICAgcmV0dXJuIGRpc2FibGVkIHx8IGRlY3JlbWVudGVkU2VsZWN0ZWQgPCBtaW4gfHxcclxuICAgICAgZGVjcmVtZW50ZWRTZWxlY3RlZCA+IHNlbGVjdGVkICYmIGRlY3JlbWVudGVkU2VsZWN0ZWQgPiBtYXg7XHJcbiAgfTtcclxuXHJcbiAgJHNjb3BlLm5vVG9nZ2xlTWVyaWRpYW4gPSBmdW5jdGlvbigpIHtcclxuICAgIGlmIChzZWxlY3RlZC5nZXRIb3VycygpIDwgMTIpIHtcclxuICAgICAgcmV0dXJuIGRpc2FibGVkIHx8IGFkZE1pbnV0ZXMoc2VsZWN0ZWQsIDEyICogNjApID4gbWF4O1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBkaXNhYmxlZCB8fCBhZGRNaW51dGVzKHNlbGVjdGVkLCAtMTIgKiA2MCkgPCBtaW47XHJcbiAgfTtcclxuXHJcbiAgdmFyIHNlY29uZFN0ZXAgPSB0aW1lcGlja2VyQ29uZmlnLnNlY29uZFN0ZXA7XHJcbiAgaWYgKCRhdHRycy5zZWNvbmRTdGVwKSB7XHJcbiAgICB3YXRjaGVycy5wdXNoKCRzY29wZS4kcGFyZW50LiR3YXRjaCgkcGFyc2UoJGF0dHJzLnNlY29uZFN0ZXApLCBmdW5jdGlvbih2YWx1ZSkge1xyXG4gICAgICBzZWNvbmRTdGVwID0gK3ZhbHVlO1xyXG4gICAgfSkpO1xyXG4gIH1cclxuXHJcbiAgJHNjb3BlLnNob3dTZWNvbmRzID0gdGltZXBpY2tlckNvbmZpZy5zaG93U2Vjb25kcztcclxuICBpZiAoJGF0dHJzLnNob3dTZWNvbmRzKSB7XHJcbiAgICB3YXRjaGVycy5wdXNoKCRzY29wZS4kcGFyZW50LiR3YXRjaCgkcGFyc2UoJGF0dHJzLnNob3dTZWNvbmRzKSwgZnVuY3Rpb24odmFsdWUpIHtcclxuICAgICAgJHNjb3BlLnNob3dTZWNvbmRzID0gISF2YWx1ZTtcclxuICAgIH0pKTtcclxuICB9XHJcblxyXG4gIC8vIDEySCAvIDI0SCBtb2RlXHJcbiAgJHNjb3BlLnNob3dNZXJpZGlhbiA9IHRpbWVwaWNrZXJDb25maWcuc2hvd01lcmlkaWFuO1xyXG4gIGlmICgkYXR0cnMuc2hvd01lcmlkaWFuKSB7XHJcbiAgICB3YXRjaGVycy5wdXNoKCRzY29wZS4kcGFyZW50LiR3YXRjaCgkcGFyc2UoJGF0dHJzLnNob3dNZXJpZGlhbiksIGZ1bmN0aW9uKHZhbHVlKSB7XHJcbiAgICAgICRzY29wZS5zaG93TWVyaWRpYW4gPSAhIXZhbHVlO1xyXG5cclxuICAgICAgaWYgKG5nTW9kZWxDdHJsLiRlcnJvci50aW1lKSB7XHJcbiAgICAgICAgLy8gRXZhbHVhdGUgZnJvbSB0ZW1wbGF0ZVxyXG4gICAgICAgIHZhciBob3VycyA9IGdldEhvdXJzRnJvbVRlbXBsYXRlKCksIG1pbnV0ZXMgPSBnZXRNaW51dGVzRnJvbVRlbXBsYXRlKCk7XHJcbiAgICAgICAgaWYgKGFuZ3VsYXIuaXNEZWZpbmVkKGhvdXJzKSAmJiBhbmd1bGFyLmlzRGVmaW5lZChtaW51dGVzKSkge1xyXG4gICAgICAgICAgc2VsZWN0ZWQuc2V0SG91cnMoaG91cnMpO1xyXG4gICAgICAgICAgcmVmcmVzaCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB1cGRhdGVUZW1wbGF0ZSgpO1xyXG4gICAgICB9XHJcbiAgICB9KSk7XHJcbiAgfVxyXG5cclxuICAvLyBHZXQgJHNjb3BlLmhvdXJzIGluIDI0SCBtb2RlIGlmIHZhbGlkXHJcbiAgZnVuY3Rpb24gZ2V0SG91cnNGcm9tVGVtcGxhdGUoKSB7XHJcbiAgICB2YXIgaG91cnMgPSArJHNjb3BlLmhvdXJzO1xyXG4gICAgdmFyIHZhbGlkID0gJHNjb3BlLnNob3dNZXJpZGlhbiA/IGhvdXJzID4gMCAmJiBob3VycyA8IDEzIDpcclxuICAgICAgaG91cnMgPj0gMCAmJiBob3VycyA8IDI0O1xyXG4gICAgaWYgKCF2YWxpZCB8fCAkc2NvcGUuaG91cnMgPT09ICcnKSB7XHJcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCRzY29wZS5zaG93TWVyaWRpYW4pIHtcclxuICAgICAgaWYgKGhvdXJzID09PSAxMikge1xyXG4gICAgICAgIGhvdXJzID0gMDtcclxuICAgICAgfVxyXG4gICAgICBpZiAoJHNjb3BlLm1lcmlkaWFuID09PSBtZXJpZGlhbnNbMV0pIHtcclxuICAgICAgICBob3VycyA9IGhvdXJzICsgMTI7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBob3VycztcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGdldE1pbnV0ZXNGcm9tVGVtcGxhdGUoKSB7XHJcbiAgICB2YXIgbWludXRlcyA9ICskc2NvcGUubWludXRlcztcclxuICAgIHZhciB2YWxpZCA9IG1pbnV0ZXMgPj0gMCAmJiBtaW51dGVzIDwgNjA7XHJcbiAgICBpZiAoIXZhbGlkIHx8ICRzY29wZS5taW51dGVzID09PSAnJykge1xyXG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIG1pbnV0ZXM7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBnZXRTZWNvbmRzRnJvbVRlbXBsYXRlKCkge1xyXG4gICAgdmFyIHNlY29uZHMgPSArJHNjb3BlLnNlY29uZHM7XHJcbiAgICByZXR1cm4gc2Vjb25kcyA+PSAwICYmIHNlY29uZHMgPCA2MCA/IHNlY29uZHMgOiB1bmRlZmluZWQ7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBwYWQodmFsdWUsIG5vUGFkKSB7XHJcbiAgICBpZiAodmFsdWUgPT09IG51bGwpIHtcclxuICAgICAgcmV0dXJuICcnO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBhbmd1bGFyLmlzRGVmaW5lZCh2YWx1ZSkgJiYgdmFsdWUudG9TdHJpbmcoKS5sZW5ndGggPCAyICYmICFub1BhZCA/XHJcbiAgICAgICcwJyArIHZhbHVlIDogdmFsdWUudG9TdHJpbmcoKTtcclxuICB9XHJcblxyXG4gIC8vIFJlc3BvbmQgb24gbW91c2V3aGVlbCBzcGluXHJcbiAgdGhpcy5zZXR1cE1vdXNld2hlZWxFdmVudHMgPSBmdW5jdGlvbihob3Vyc0lucHV0RWwsIG1pbnV0ZXNJbnB1dEVsLCBzZWNvbmRzSW5wdXRFbCkge1xyXG4gICAgdmFyIGlzU2Nyb2xsaW5nVXAgPSBmdW5jdGlvbihlKSB7XHJcbiAgICAgIGlmIChlLm9yaWdpbmFsRXZlbnQpIHtcclxuICAgICAgICBlID0gZS5vcmlnaW5hbEV2ZW50O1xyXG4gICAgICB9XHJcbiAgICAgIC8vcGljayBjb3JyZWN0IGRlbHRhIHZhcmlhYmxlIGRlcGVuZGluZyBvbiBldmVudFxyXG4gICAgICB2YXIgZGVsdGEgPSBlLndoZWVsRGVsdGEgPyBlLndoZWVsRGVsdGEgOiAtZS5kZWx0YVk7XHJcbiAgICAgIHJldHVybiBlLmRldGFpbCB8fCBkZWx0YSA+IDA7XHJcbiAgICB9O1xyXG5cclxuICAgIGhvdXJzSW5wdXRFbC5iaW5kKCdtb3VzZXdoZWVsIHdoZWVsJywgZnVuY3Rpb24oZSkge1xyXG4gICAgICBpZiAoIWRpc2FibGVkKSB7XHJcbiAgICAgICAgJHNjb3BlLiRhcHBseShpc1Njcm9sbGluZ1VwKGUpID8gJHNjb3BlLmluY3JlbWVudEhvdXJzKCkgOiAkc2NvcGUuZGVjcmVtZW50SG91cnMoKSk7XHJcbiAgICAgIH1cclxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgbWludXRlc0lucHV0RWwuYmluZCgnbW91c2V3aGVlbCB3aGVlbCcsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgaWYgKCFkaXNhYmxlZCkge1xyXG4gICAgICAgICRzY29wZS4kYXBwbHkoaXNTY3JvbGxpbmdVcChlKSA/ICRzY29wZS5pbmNyZW1lbnRNaW51dGVzKCkgOiAkc2NvcGUuZGVjcmVtZW50TWludXRlcygpKTtcclxuICAgICAgfVxyXG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAgc2Vjb25kc0lucHV0RWwuYmluZCgnbW91c2V3aGVlbCB3aGVlbCcsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgaWYgKCFkaXNhYmxlZCkge1xyXG4gICAgICAgICRzY29wZS4kYXBwbHkoaXNTY3JvbGxpbmdVcChlKSA/ICRzY29wZS5pbmNyZW1lbnRTZWNvbmRzKCkgOiAkc2NvcGUuZGVjcmVtZW50U2Vjb25kcygpKTtcclxuICAgICAgfVxyXG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICB9KTtcclxuICB9O1xyXG5cclxuICAvLyBSZXNwb25kIG9uIHVwL2Rvd24gYXJyb3drZXlzXHJcbiAgdGhpcy5zZXR1cEFycm93a2V5RXZlbnRzID0gZnVuY3Rpb24oaG91cnNJbnB1dEVsLCBtaW51dGVzSW5wdXRFbCwgc2Vjb25kc0lucHV0RWwpIHtcclxuICAgIGhvdXJzSW5wdXRFbC5iaW5kKCdrZXlkb3duJywgZnVuY3Rpb24oZSkge1xyXG4gICAgICBpZiAoIWRpc2FibGVkKSB7XHJcbiAgICAgICAgaWYgKGUud2hpY2ggPT09IDM4KSB7IC8vIHVwXHJcbiAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAkc2NvcGUuaW5jcmVtZW50SG91cnMoKTtcclxuICAgICAgICAgICRzY29wZS4kYXBwbHkoKTtcclxuICAgICAgICB9IGVsc2UgaWYgKGUud2hpY2ggPT09IDQwKSB7IC8vIGRvd25cclxuICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICRzY29wZS5kZWNyZW1lbnRIb3VycygpO1xyXG4gICAgICAgICAgJHNjb3BlLiRhcHBseSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgbWludXRlc0lucHV0RWwuYmluZCgna2V5ZG93bicsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgaWYgKCFkaXNhYmxlZCkge1xyXG4gICAgICAgIGlmIChlLndoaWNoID09PSAzOCkgeyAvLyB1cFxyXG4gICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgJHNjb3BlLmluY3JlbWVudE1pbnV0ZXMoKTtcclxuICAgICAgICAgICRzY29wZS4kYXBwbHkoKTtcclxuICAgICAgICB9IGVsc2UgaWYgKGUud2hpY2ggPT09IDQwKSB7IC8vIGRvd25cclxuICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICRzY29wZS5kZWNyZW1lbnRNaW51dGVzKCk7XHJcbiAgICAgICAgICAkc2NvcGUuJGFwcGx5KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICBzZWNvbmRzSW5wdXRFbC5iaW5kKCdrZXlkb3duJywgZnVuY3Rpb24oZSkge1xyXG4gICAgICBpZiAoIWRpc2FibGVkKSB7XHJcbiAgICAgICAgaWYgKGUud2hpY2ggPT09IDM4KSB7IC8vIHVwXHJcbiAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAkc2NvcGUuaW5jcmVtZW50U2Vjb25kcygpO1xyXG4gICAgICAgICAgJHNjb3BlLiRhcHBseSgpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoZS53aGljaCA9PT0gNDApIHsgLy8gZG93blxyXG4gICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgJHNjb3BlLmRlY3JlbWVudFNlY29uZHMoKTtcclxuICAgICAgICAgICRzY29wZS4kYXBwbHkoKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gIH07XHJcblxyXG4gIHRoaXMuc2V0dXBJbnB1dEV2ZW50cyA9IGZ1bmN0aW9uKGhvdXJzSW5wdXRFbCwgbWludXRlc0lucHV0RWwsIHNlY29uZHNJbnB1dEVsKSB7XHJcbiAgICBpZiAoJHNjb3BlLnJlYWRvbmx5SW5wdXQpIHtcclxuICAgICAgJHNjb3BlLnVwZGF0ZUhvdXJzID0gYW5ndWxhci5ub29wO1xyXG4gICAgICAkc2NvcGUudXBkYXRlTWludXRlcyA9IGFuZ3VsYXIubm9vcDtcclxuICAgICAgJHNjb3BlLnVwZGF0ZVNlY29uZHMgPSBhbmd1bGFyLm5vb3A7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgaW52YWxpZGF0ZSA9IGZ1bmN0aW9uKGludmFsaWRIb3VycywgaW52YWxpZE1pbnV0ZXMsIGludmFsaWRTZWNvbmRzKSB7XHJcbiAgICAgIG5nTW9kZWxDdHJsLiRzZXRWaWV3VmFsdWUobnVsbCk7XHJcbiAgICAgIG5nTW9kZWxDdHJsLiRzZXRWYWxpZGl0eSgndGltZScsIGZhbHNlKTtcclxuICAgICAgaWYgKGFuZ3VsYXIuaXNEZWZpbmVkKGludmFsaWRIb3VycykpIHtcclxuICAgICAgICAkc2NvcGUuaW52YWxpZEhvdXJzID0gaW52YWxpZEhvdXJzO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoYW5ndWxhci5pc0RlZmluZWQoaW52YWxpZE1pbnV0ZXMpKSB7XHJcbiAgICAgICAgJHNjb3BlLmludmFsaWRNaW51dGVzID0gaW52YWxpZE1pbnV0ZXM7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChhbmd1bGFyLmlzRGVmaW5lZChpbnZhbGlkU2Vjb25kcykpIHtcclxuICAgICAgICAkc2NvcGUuaW52YWxpZFNlY29uZHMgPSBpbnZhbGlkU2Vjb25kcztcclxuICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICAkc2NvcGUudXBkYXRlSG91cnMgPSBmdW5jdGlvbigpIHtcclxuICAgICAgdmFyIGhvdXJzID0gZ2V0SG91cnNGcm9tVGVtcGxhdGUoKSxcclxuICAgICAgICBtaW51dGVzID0gZ2V0TWludXRlc0Zyb21UZW1wbGF0ZSgpO1xyXG5cclxuICAgICAgbmdNb2RlbEN0cmwuJHNldERpcnR5KCk7XHJcblxyXG4gICAgICBpZiAoYW5ndWxhci5pc0RlZmluZWQoaG91cnMpICYmIGFuZ3VsYXIuaXNEZWZpbmVkKG1pbnV0ZXMpKSB7XHJcbiAgICAgICAgc2VsZWN0ZWQuc2V0SG91cnMoaG91cnMpO1xyXG4gICAgICAgIHNlbGVjdGVkLnNldE1pbnV0ZXMobWludXRlcyk7XHJcbiAgICAgICAgaWYgKHNlbGVjdGVkIDwgbWluIHx8IHNlbGVjdGVkID4gbWF4KSB7XHJcbiAgICAgICAgICBpbnZhbGlkYXRlKHRydWUpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICByZWZyZXNoKCdoJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGludmFsaWRhdGUodHJ1ZSk7XHJcbiAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgaG91cnNJbnB1dEVsLmJpbmQoJ2JsdXInLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgIG5nTW9kZWxDdHJsLiRzZXRUb3VjaGVkKCk7XHJcbiAgICAgIGlmIChtb2RlbElzRW1wdHkoKSkge1xyXG4gICAgICAgIG1ha2VWYWxpZCgpO1xyXG4gICAgICB9IGVsc2UgaWYgKCRzY29wZS5ob3VycyA9PT0gbnVsbCB8fCAkc2NvcGUuaG91cnMgPT09ICcnKSB7XHJcbiAgICAgICAgaW52YWxpZGF0ZSh0cnVlKTtcclxuICAgICAgfSBlbHNlIGlmICghJHNjb3BlLmludmFsaWRIb3VycyAmJiAkc2NvcGUuaG91cnMgPCAxMCkge1xyXG4gICAgICAgICRzY29wZS4kYXBwbHkoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAkc2NvcGUuaG91cnMgPSBwYWQoJHNjb3BlLmhvdXJzLCAhcGFkSG91cnMpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICAkc2NvcGUudXBkYXRlTWludXRlcyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICB2YXIgbWludXRlcyA9IGdldE1pbnV0ZXNGcm9tVGVtcGxhdGUoKSxcclxuICAgICAgICBob3VycyA9IGdldEhvdXJzRnJvbVRlbXBsYXRlKCk7XHJcblxyXG4gICAgICBuZ01vZGVsQ3RybC4kc2V0RGlydHkoKTtcclxuXHJcbiAgICAgIGlmIChhbmd1bGFyLmlzRGVmaW5lZChtaW51dGVzKSAmJiBhbmd1bGFyLmlzRGVmaW5lZChob3VycykpIHtcclxuICAgICAgICBzZWxlY3RlZC5zZXRIb3Vycyhob3Vycyk7XHJcbiAgICAgICAgc2VsZWN0ZWQuc2V0TWludXRlcyhtaW51dGVzKTtcclxuICAgICAgICBpZiAoc2VsZWN0ZWQgPCBtaW4gfHwgc2VsZWN0ZWQgPiBtYXgpIHtcclxuICAgICAgICAgIGludmFsaWRhdGUodW5kZWZpbmVkLCB0cnVlKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgcmVmcmVzaCgnbScpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBpbnZhbGlkYXRlKHVuZGVmaW5lZCwgdHJ1ZSk7XHJcbiAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgbWludXRlc0lucHV0RWwuYmluZCgnYmx1cicsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgbmdNb2RlbEN0cmwuJHNldFRvdWNoZWQoKTtcclxuICAgICAgaWYgKG1vZGVsSXNFbXB0eSgpKSB7XHJcbiAgICAgICAgbWFrZVZhbGlkKCk7XHJcbiAgICAgIH0gZWxzZSBpZiAoJHNjb3BlLm1pbnV0ZXMgPT09IG51bGwpIHtcclxuICAgICAgICBpbnZhbGlkYXRlKHVuZGVmaW5lZCwgdHJ1ZSk7XHJcbiAgICAgIH0gZWxzZSBpZiAoISRzY29wZS5pbnZhbGlkTWludXRlcyAmJiAkc2NvcGUubWludXRlcyA8IDEwKSB7XHJcbiAgICAgICAgJHNjb3BlLiRhcHBseShmdW5jdGlvbigpIHtcclxuICAgICAgICAgICRzY29wZS5taW51dGVzID0gcGFkKCRzY29wZS5taW51dGVzKTtcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgJHNjb3BlLnVwZGF0ZVNlY29uZHMgPSBmdW5jdGlvbigpIHtcclxuICAgICAgdmFyIHNlY29uZHMgPSBnZXRTZWNvbmRzRnJvbVRlbXBsYXRlKCk7XHJcblxyXG4gICAgICBuZ01vZGVsQ3RybC4kc2V0RGlydHkoKTtcclxuXHJcbiAgICAgIGlmIChhbmd1bGFyLmlzRGVmaW5lZChzZWNvbmRzKSkge1xyXG4gICAgICAgIHNlbGVjdGVkLnNldFNlY29uZHMoc2Vjb25kcyk7XHJcbiAgICAgICAgcmVmcmVzaCgncycpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGludmFsaWRhdGUodW5kZWZpbmVkLCB1bmRlZmluZWQsIHRydWUpO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIHNlY29uZHNJbnB1dEVsLmJpbmQoJ2JsdXInLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgIGlmIChtb2RlbElzRW1wdHkoKSkge1xyXG4gICAgICAgIG1ha2VWYWxpZCgpO1xyXG4gICAgICB9IGVsc2UgaWYgKCEkc2NvcGUuaW52YWxpZFNlY29uZHMgJiYgJHNjb3BlLnNlY29uZHMgPCAxMCkge1xyXG4gICAgICAgICRzY29wZS4kYXBwbHkoIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgJHNjb3BlLnNlY29uZHMgPSBwYWQoJHNjb3BlLnNlY29uZHMpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgfTtcclxuXHJcbiAgdGhpcy5yZW5kZXIgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBkYXRlID0gbmdNb2RlbEN0cmwuJHZpZXdWYWx1ZTtcclxuXHJcbiAgICBpZiAoaXNOYU4oZGF0ZSkpIHtcclxuICAgICAgbmdNb2RlbEN0cmwuJHNldFZhbGlkaXR5KCd0aW1lJywgZmFsc2UpO1xyXG4gICAgICAkbG9nLmVycm9yKCdUaW1lcGlja2VyIGRpcmVjdGl2ZTogXCJuZy1tb2RlbFwiIHZhbHVlIG11c3QgYmUgYSBEYXRlIG9iamVjdCwgYSBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIHNpbmNlIDAxLjAxLjE5NzAgb3IgYSBzdHJpbmcgcmVwcmVzZW50aW5nIGFuIFJGQzI4MjIgb3IgSVNPIDg2MDEgZGF0ZS4nKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGlmIChkYXRlKSB7XHJcbiAgICAgICAgc2VsZWN0ZWQgPSBkYXRlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoc2VsZWN0ZWQgPCBtaW4gfHwgc2VsZWN0ZWQgPiBtYXgpIHtcclxuICAgICAgICBuZ01vZGVsQ3RybC4kc2V0VmFsaWRpdHkoJ3RpbWUnLCBmYWxzZSk7XHJcbiAgICAgICAgJHNjb3BlLmludmFsaWRIb3VycyA9IHRydWU7XHJcbiAgICAgICAgJHNjb3BlLmludmFsaWRNaW51dGVzID0gdHJ1ZTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBtYWtlVmFsaWQoKTtcclxuICAgICAgfVxyXG4gICAgICB1cGRhdGVUZW1wbGF0ZSgpO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIC8vIENhbGwgaW50ZXJuYWxseSB3aGVuIHdlIGtub3cgdGhhdCBtb2RlbCBpcyB2YWxpZC5cclxuICBmdW5jdGlvbiByZWZyZXNoKGtleWJvYXJkQ2hhbmdlKSB7XHJcbiAgICBtYWtlVmFsaWQoKTtcclxuICAgIG5nTW9kZWxDdHJsLiRzZXRWaWV3VmFsdWUobmV3IERhdGUoc2VsZWN0ZWQpKTtcclxuICAgIHVwZGF0ZVRlbXBsYXRlKGtleWJvYXJkQ2hhbmdlKTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIG1ha2VWYWxpZCgpIHtcclxuICAgIG5nTW9kZWxDdHJsLiRzZXRWYWxpZGl0eSgndGltZScsIHRydWUpO1xyXG4gICAgJHNjb3BlLmludmFsaWRIb3VycyA9IGZhbHNlO1xyXG4gICAgJHNjb3BlLmludmFsaWRNaW51dGVzID0gZmFsc2U7XHJcbiAgICAkc2NvcGUuaW52YWxpZFNlY29uZHMgPSBmYWxzZTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHVwZGF0ZVRlbXBsYXRlKGtleWJvYXJkQ2hhbmdlKSB7XHJcbiAgICBpZiAoIW5nTW9kZWxDdHJsLiRtb2RlbFZhbHVlKSB7XHJcbiAgICAgICRzY29wZS5ob3VycyA9IG51bGw7XHJcbiAgICAgICRzY29wZS5taW51dGVzID0gbnVsbDtcclxuICAgICAgJHNjb3BlLnNlY29uZHMgPSBudWxsO1xyXG4gICAgICAkc2NvcGUubWVyaWRpYW4gPSBtZXJpZGlhbnNbMF07XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB2YXIgaG91cnMgPSBzZWxlY3RlZC5nZXRIb3VycygpLFxyXG4gICAgICAgIG1pbnV0ZXMgPSBzZWxlY3RlZC5nZXRNaW51dGVzKCksXHJcbiAgICAgICAgc2Vjb25kcyA9IHNlbGVjdGVkLmdldFNlY29uZHMoKTtcclxuXHJcbiAgICAgIGlmICgkc2NvcGUuc2hvd01lcmlkaWFuKSB7XHJcbiAgICAgICAgaG91cnMgPSBob3VycyA9PT0gMCB8fCBob3VycyA9PT0gMTIgPyAxMiA6IGhvdXJzICUgMTI7IC8vIENvbnZlcnQgMjQgdG8gMTIgaG91ciBzeXN0ZW1cclxuICAgICAgfVxyXG5cclxuICAgICAgJHNjb3BlLmhvdXJzID0ga2V5Ym9hcmRDaGFuZ2UgPT09ICdoJyA/IGhvdXJzIDogcGFkKGhvdXJzLCAhcGFkSG91cnMpO1xyXG4gICAgICBpZiAoa2V5Ym9hcmRDaGFuZ2UgIT09ICdtJykge1xyXG4gICAgICAgICRzY29wZS5taW51dGVzID0gcGFkKG1pbnV0ZXMpO1xyXG4gICAgICB9XHJcbiAgICAgICRzY29wZS5tZXJpZGlhbiA9IHNlbGVjdGVkLmdldEhvdXJzKCkgPCAxMiA/IG1lcmlkaWFuc1swXSA6IG1lcmlkaWFuc1sxXTtcclxuXHJcbiAgICAgIGlmIChrZXlib2FyZENoYW5nZSAhPT0gJ3MnKSB7XHJcbiAgICAgICAgJHNjb3BlLnNlY29uZHMgPSBwYWQoc2Vjb25kcyk7XHJcbiAgICAgIH1cclxuICAgICAgJHNjb3BlLm1lcmlkaWFuID0gc2VsZWN0ZWQuZ2V0SG91cnMoKSA8IDEyID8gbWVyaWRpYW5zWzBdIDogbWVyaWRpYW5zWzFdO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gYWRkU2Vjb25kc1RvU2VsZWN0ZWQoc2Vjb25kcykge1xyXG4gICAgc2VsZWN0ZWQgPSBhZGRTZWNvbmRzKHNlbGVjdGVkLCBzZWNvbmRzKTtcclxuICAgIHJlZnJlc2goKTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGFkZE1pbnV0ZXMoc2VsZWN0ZWQsIG1pbnV0ZXMpIHtcclxuICAgIHJldHVybiBhZGRTZWNvbmRzKHNlbGVjdGVkLCBtaW51dGVzKjYwKTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGFkZFNlY29uZHMoZGF0ZSwgc2Vjb25kcykge1xyXG4gICAgdmFyIGR0ID0gbmV3IERhdGUoZGF0ZS5nZXRUaW1lKCkgKyBzZWNvbmRzICogMTAwMCk7XHJcbiAgICB2YXIgbmV3RGF0ZSA9IG5ldyBEYXRlKGRhdGUpO1xyXG4gICAgbmV3RGF0ZS5zZXRIb3VycyhkdC5nZXRIb3VycygpLCBkdC5nZXRNaW51dGVzKCksIGR0LmdldFNlY29uZHMoKSk7XHJcbiAgICByZXR1cm4gbmV3RGF0ZTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIG1vZGVsSXNFbXB0eSgpIHtcclxuICAgIHJldHVybiAoJHNjb3BlLmhvdXJzID09PSBudWxsIHx8ICRzY29wZS5ob3VycyA9PT0gJycpICYmXHJcbiAgICAgICgkc2NvcGUubWludXRlcyA9PT0gbnVsbCB8fCAkc2NvcGUubWludXRlcyA9PT0gJycpICYmXHJcbiAgICAgICghJHNjb3BlLnNob3dTZWNvbmRzIHx8ICRzY29wZS5zaG93U2Vjb25kcyAmJiAoJHNjb3BlLnNlY29uZHMgPT09IG51bGwgfHwgJHNjb3BlLnNlY29uZHMgPT09ICcnKSk7XHJcbiAgfVxyXG5cclxuICAkc2NvcGUuc2hvd1NwaW5uZXJzID0gYW5ndWxhci5pc0RlZmluZWQoJGF0dHJzLnNob3dTcGlubmVycykgP1xyXG4gICAgJHNjb3BlLiRwYXJlbnQuJGV2YWwoJGF0dHJzLnNob3dTcGlubmVycykgOiB0aW1lcGlja2VyQ29uZmlnLnNob3dTcGlubmVycztcclxuXHJcbiAgJHNjb3BlLmluY3JlbWVudEhvdXJzID0gZnVuY3Rpb24oKSB7XHJcbiAgICBpZiAoISRzY29wZS5ub0luY3JlbWVudEhvdXJzKCkpIHtcclxuICAgICAgYWRkU2Vjb25kc1RvU2VsZWN0ZWQoaG91clN0ZXAgKiA2MCAqIDYwKTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICAkc2NvcGUuZGVjcmVtZW50SG91cnMgPSBmdW5jdGlvbigpIHtcclxuICAgIGlmICghJHNjb3BlLm5vRGVjcmVtZW50SG91cnMoKSkge1xyXG4gICAgICBhZGRTZWNvbmRzVG9TZWxlY3RlZCgtaG91clN0ZXAgKiA2MCAqIDYwKTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICAkc2NvcGUuaW5jcmVtZW50TWludXRlcyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgaWYgKCEkc2NvcGUubm9JbmNyZW1lbnRNaW51dGVzKCkpIHtcclxuICAgICAgYWRkU2Vjb25kc1RvU2VsZWN0ZWQobWludXRlU3RlcCAqIDYwKTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICAkc2NvcGUuZGVjcmVtZW50TWludXRlcyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgaWYgKCEkc2NvcGUubm9EZWNyZW1lbnRNaW51dGVzKCkpIHtcclxuICAgICAgYWRkU2Vjb25kc1RvU2VsZWN0ZWQoLW1pbnV0ZVN0ZXAgKiA2MCk7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgJHNjb3BlLmluY3JlbWVudFNlY29uZHMgPSBmdW5jdGlvbigpIHtcclxuICAgIGlmICghJHNjb3BlLm5vSW5jcmVtZW50U2Vjb25kcygpKSB7XHJcbiAgICAgIGFkZFNlY29uZHNUb1NlbGVjdGVkKHNlY29uZFN0ZXApO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gICRzY29wZS5kZWNyZW1lbnRTZWNvbmRzID0gZnVuY3Rpb24oKSB7XHJcbiAgICBpZiAoISRzY29wZS5ub0RlY3JlbWVudFNlY29uZHMoKSkge1xyXG4gICAgICBhZGRTZWNvbmRzVG9TZWxlY3RlZCgtc2Vjb25kU3RlcCk7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgJHNjb3BlLnRvZ2dsZU1lcmlkaWFuID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgbWludXRlcyA9IGdldE1pbnV0ZXNGcm9tVGVtcGxhdGUoKSxcclxuICAgICAgICBob3VycyA9IGdldEhvdXJzRnJvbVRlbXBsYXRlKCk7XHJcblxyXG4gICAgaWYgKCEkc2NvcGUubm9Ub2dnbGVNZXJpZGlhbigpKSB7XHJcbiAgICAgIGlmIChhbmd1bGFyLmlzRGVmaW5lZChtaW51dGVzKSAmJiBhbmd1bGFyLmlzRGVmaW5lZChob3VycykpIHtcclxuICAgICAgICBhZGRTZWNvbmRzVG9TZWxlY3RlZCgxMiAqIDYwICogKHNlbGVjdGVkLmdldEhvdXJzKCkgPCAxMiA/IDYwIDogLTYwKSk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgJHNjb3BlLm1lcmlkaWFuID0gJHNjb3BlLm1lcmlkaWFuID09PSBtZXJpZGlhbnNbMF0gPyBtZXJpZGlhbnNbMV0gOiBtZXJpZGlhbnNbMF07XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9O1xyXG5cclxuICAkc2NvcGUuYmx1ciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgbmdNb2RlbEN0cmwuJHNldFRvdWNoZWQoKTtcclxuICB9O1xyXG5cclxuICAkc2NvcGUuJG9uKCckZGVzdHJveScsIGZ1bmN0aW9uKCkge1xyXG4gICAgd2hpbGUgKHdhdGNoZXJzLmxlbmd0aCkge1xyXG4gICAgICB3YXRjaGVycy5zaGlmdCgpKCk7XHJcbiAgICB9XHJcbiAgfSk7XHJcbn1dKVxyXG5cclxuLmRpcmVjdGl2ZSgndWliVGltZXBpY2tlcicsIFsndWliVGltZXBpY2tlckNvbmZpZycsIGZ1bmN0aW9uKHVpYlRpbWVwaWNrZXJDb25maWcpIHtcclxuICByZXR1cm4ge1xyXG4gICAgcmVxdWlyZTogWyd1aWJUaW1lcGlja2VyJywgJz9ebmdNb2RlbCddLFxyXG4gICAgcmVzdHJpY3Q6ICdBJyxcclxuICAgIGNvbnRyb2xsZXI6ICdVaWJUaW1lcGlja2VyQ29udHJvbGxlcicsXHJcbiAgICBjb250cm9sbGVyQXM6ICd0aW1lcGlja2VyJyxcclxuICAgIHNjb3BlOiB7fSxcclxuICAgIHRlbXBsYXRlVXJsOiBmdW5jdGlvbihlbGVtZW50LCBhdHRycykge1xyXG4gICAgICByZXR1cm4gYXR0cnMudGVtcGxhdGVVcmwgfHwgdWliVGltZXBpY2tlckNvbmZpZy50ZW1wbGF0ZVVybDtcclxuICAgIH0sXHJcbiAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxlbWVudCwgYXR0cnMsIGN0cmxzKSB7XHJcbiAgICAgIHZhciB0aW1lcGlja2VyQ3RybCA9IGN0cmxzWzBdLCBuZ01vZGVsQ3RybCA9IGN0cmxzWzFdO1xyXG5cclxuICAgICAgaWYgKG5nTW9kZWxDdHJsKSB7XHJcbiAgICAgICAgdGltZXBpY2tlckN0cmwuaW5pdChuZ01vZGVsQ3RybCwgZWxlbWVudC5maW5kKCdpbnB1dCcpKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH07XHJcbn1dKTtcclxuXHJcbmFuZ3VsYXIubW9kdWxlKCd1aS5ib290c3RyYXAudHlwZWFoZWFkJywgWyd1aS5ib290c3RyYXAuZGVib3VuY2UnLCAndWkuYm9vdHN0cmFwLnBvc2l0aW9uJ10pXHJcblxyXG4vKipcclxuICogQSBoZWxwZXIgc2VydmljZSB0aGF0IGNhbiBwYXJzZSB0eXBlYWhlYWQncyBzeW50YXggKHN0cmluZyBwcm92aWRlZCBieSB1c2VycylcclxuICogRXh0cmFjdGVkIHRvIGEgc2VwYXJhdGUgc2VydmljZSBmb3IgZWFzZSBvZiB1bml0IHRlc3RpbmdcclxuICovXHJcbiAgLmZhY3RvcnkoJ3VpYlR5cGVhaGVhZFBhcnNlcicsIFsnJHBhcnNlJywgZnVuY3Rpb24oJHBhcnNlKSB7XHJcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAwMDAwMDExMTExMTExMDAwMDAwMDAwMDAwMDIyMjIyMjIyMDAwMDAwMDAwMDAwMDAwMDMzMzMzMzMzMzMzMzMzMzAwMDAwMDAwMDAwNDQ0NDQ0NDQwMDBcclxuICAgIHZhciBUWVBFQUhFQURfUkVHRVhQID0gL15cXHMqKFtcXHNcXFNdKz8pKD86XFxzK2FzXFxzKyhbXFxzXFxTXSs/KSk/XFxzK2ZvclxccysoPzooW1xcJFxcd11bXFwkXFx3XFxkXSopKVxccytpblxccysoW1xcc1xcU10rPykkLztcclxuICAgIHJldHVybiB7XHJcbiAgICAgIHBhcnNlOiBmdW5jdGlvbihpbnB1dCkge1xyXG4gICAgICAgIHZhciBtYXRjaCA9IGlucHV0Lm1hdGNoKFRZUEVBSEVBRF9SRUdFWFApO1xyXG4gICAgICAgIGlmICghbWF0Y2gpIHtcclxuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcclxuICAgICAgICAgICAgJ0V4cGVjdGVkIHR5cGVhaGVhZCBzcGVjaWZpY2F0aW9uIGluIGZvcm0gb2YgXCJfbW9kZWxWYWx1ZV8gKGFzIF9sYWJlbF8pPyBmb3IgX2l0ZW1fIGluIF9jb2xsZWN0aW9uX1wiJyArXHJcbiAgICAgICAgICAgICAgJyBidXQgZ290IFwiJyArIGlucHV0ICsgJ1wiLicpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIGl0ZW1OYW1lOiBtYXRjaFszXSxcclxuICAgICAgICAgIHNvdXJjZTogJHBhcnNlKG1hdGNoWzRdKSxcclxuICAgICAgICAgIHZpZXdNYXBwZXI6ICRwYXJzZShtYXRjaFsyXSB8fCBtYXRjaFsxXSksXHJcbiAgICAgICAgICBtb2RlbE1hcHBlcjogJHBhcnNlKG1hdGNoWzFdKVxyXG4gICAgICAgIH07XHJcbiAgICAgIH1cclxuICAgIH07XHJcbiAgfV0pXHJcblxyXG4gIC5jb250cm9sbGVyKCdVaWJUeXBlYWhlYWRDb250cm9sbGVyJywgWyckc2NvcGUnLCAnJGVsZW1lbnQnLCAnJGF0dHJzJywgJyRjb21waWxlJywgJyRwYXJzZScsICckcScsICckdGltZW91dCcsICckZG9jdW1lbnQnLCAnJHdpbmRvdycsICckcm9vdFNjb3BlJywgJyQkZGVib3VuY2UnLCAnJHVpYlBvc2l0aW9uJywgJ3VpYlR5cGVhaGVhZFBhcnNlcicsXHJcbiAgICBmdW5jdGlvbihvcmlnaW5hbFNjb3BlLCBlbGVtZW50LCBhdHRycywgJGNvbXBpbGUsICRwYXJzZSwgJHEsICR0aW1lb3V0LCAkZG9jdW1lbnQsICR3aW5kb3csICRyb290U2NvcGUsICQkZGVib3VuY2UsICRwb3NpdGlvbiwgdHlwZWFoZWFkUGFyc2VyKSB7XHJcbiAgICB2YXIgSE9UX0tFWVMgPSBbOSwgMTMsIDI3LCAzOCwgNDBdO1xyXG4gICAgdmFyIGV2ZW50RGVib3VuY2VUaW1lID0gMjAwO1xyXG4gICAgdmFyIG1vZGVsQ3RybCwgbmdNb2RlbE9wdGlvbnM7XHJcbiAgICAvL1NVUFBPUlRFRCBBVFRSSUJVVEVTIChPUFRJT05TKVxyXG5cclxuICAgIC8vbWluaW1hbCBubyBvZiBjaGFyYWN0ZXJzIHRoYXQgbmVlZHMgdG8gYmUgZW50ZXJlZCBiZWZvcmUgdHlwZWFoZWFkIGtpY2tzLWluXHJcbiAgICB2YXIgbWluTGVuZ3RoID0gb3JpZ2luYWxTY29wZS4kZXZhbChhdHRycy50eXBlYWhlYWRNaW5MZW5ndGgpO1xyXG4gICAgaWYgKCFtaW5MZW5ndGggJiYgbWluTGVuZ3RoICE9PSAwKSB7XHJcbiAgICAgIG1pbkxlbmd0aCA9IDE7XHJcbiAgICB9XHJcblxyXG4gICAgb3JpZ2luYWxTY29wZS4kd2F0Y2goYXR0cnMudHlwZWFoZWFkTWluTGVuZ3RoLCBmdW5jdGlvbiAobmV3VmFsKSB7XHJcbiAgICAgICAgbWluTGVuZ3RoID0gIW5ld1ZhbCAmJiBuZXdWYWwgIT09IDAgPyAxIDogbmV3VmFsO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy9taW5pbWFsIHdhaXQgdGltZSBhZnRlciBsYXN0IGNoYXJhY3RlciB0eXBlZCBiZWZvcmUgdHlwZWFoZWFkIGtpY2tzLWluXHJcbiAgICB2YXIgd2FpdFRpbWUgPSBvcmlnaW5hbFNjb3BlLiRldmFsKGF0dHJzLnR5cGVhaGVhZFdhaXRNcykgfHwgMDtcclxuXHJcbiAgICAvL3Nob3VsZCBpdCByZXN0cmljdCBtb2RlbCB2YWx1ZXMgdG8gdGhlIG9uZXMgc2VsZWN0ZWQgZnJvbSB0aGUgcG9wdXAgb25seT9cclxuICAgIHZhciBpc0VkaXRhYmxlID0gb3JpZ2luYWxTY29wZS4kZXZhbChhdHRycy50eXBlYWhlYWRFZGl0YWJsZSkgIT09IGZhbHNlO1xyXG4gICAgb3JpZ2luYWxTY29wZS4kd2F0Y2goYXR0cnMudHlwZWFoZWFkRWRpdGFibGUsIGZ1bmN0aW9uIChuZXdWYWwpIHtcclxuICAgICAgaXNFZGl0YWJsZSA9IG5ld1ZhbCAhPT0gZmFsc2U7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvL2JpbmRpbmcgdG8gYSB2YXJpYWJsZSB0aGF0IGluZGljYXRlcyBpZiBtYXRjaGVzIGFyZSBiZWluZyByZXRyaWV2ZWQgYXN5bmNocm9ub3VzbHlcclxuICAgIHZhciBpc0xvYWRpbmdTZXR0ZXIgPSAkcGFyc2UoYXR0cnMudHlwZWFoZWFkTG9hZGluZykuYXNzaWduIHx8IGFuZ3VsYXIubm9vcDtcclxuXHJcbiAgICAvL2EgZnVuY3Rpb24gdG8gZGV0ZXJtaW5lIGlmIGFuIGV2ZW50IHNob3VsZCBjYXVzZSBzZWxlY3Rpb25cclxuICAgIHZhciBpc1NlbGVjdEV2ZW50ID0gYXR0cnMudHlwZWFoZWFkU2hvdWxkU2VsZWN0ID8gJHBhcnNlKGF0dHJzLnR5cGVhaGVhZFNob3VsZFNlbGVjdCkgOiBmdW5jdGlvbihzY29wZSwgdmFscykge1xyXG4gICAgICB2YXIgZXZ0ID0gdmFscy4kZXZlbnQ7XHJcbiAgICAgIHJldHVybiBldnQud2hpY2ggPT09IDEzIHx8IGV2dC53aGljaCA9PT0gOTtcclxuICAgIH07XHJcblxyXG4gICAgLy9hIGNhbGxiYWNrIGV4ZWN1dGVkIHdoZW4gYSBtYXRjaCBpcyBzZWxlY3RlZFxyXG4gICAgdmFyIG9uU2VsZWN0Q2FsbGJhY2sgPSAkcGFyc2UoYXR0cnMudHlwZWFoZWFkT25TZWxlY3QpO1xyXG5cclxuICAgIC8vc2hvdWxkIGl0IHNlbGVjdCBoaWdobGlnaHRlZCBwb3B1cCB2YWx1ZSB3aGVuIGxvc2luZyBmb2N1cz9cclxuICAgIHZhciBpc1NlbGVjdE9uQmx1ciA9IGFuZ3VsYXIuaXNEZWZpbmVkKGF0dHJzLnR5cGVhaGVhZFNlbGVjdE9uQmx1cikgPyBvcmlnaW5hbFNjb3BlLiRldmFsKGF0dHJzLnR5cGVhaGVhZFNlbGVjdE9uQmx1cikgOiBmYWxzZTtcclxuXHJcbiAgICAvL2JpbmRpbmcgdG8gYSB2YXJpYWJsZSB0aGF0IGluZGljYXRlcyBpZiB0aGVyZSB3ZXJlIG5vIHJlc3VsdHMgYWZ0ZXIgdGhlIHF1ZXJ5IGlzIGNvbXBsZXRlZFxyXG4gICAgdmFyIGlzTm9SZXN1bHRzU2V0dGVyID0gJHBhcnNlKGF0dHJzLnR5cGVhaGVhZE5vUmVzdWx0cykuYXNzaWduIHx8IGFuZ3VsYXIubm9vcDtcclxuXHJcbiAgICB2YXIgaW5wdXRGb3JtYXR0ZXIgPSBhdHRycy50eXBlYWhlYWRJbnB1dEZvcm1hdHRlciA/ICRwYXJzZShhdHRycy50eXBlYWhlYWRJbnB1dEZvcm1hdHRlcikgOiB1bmRlZmluZWQ7XHJcblxyXG4gICAgdmFyIGFwcGVuZFRvQm9keSA9IGF0dHJzLnR5cGVhaGVhZEFwcGVuZFRvQm9keSA/IG9yaWdpbmFsU2NvcGUuJGV2YWwoYXR0cnMudHlwZWFoZWFkQXBwZW5kVG9Cb2R5KSA6IGZhbHNlO1xyXG5cclxuICAgIHZhciBhcHBlbmRUbyA9IGF0dHJzLnR5cGVhaGVhZEFwcGVuZFRvID9cclxuICAgICAgb3JpZ2luYWxTY29wZS4kZXZhbChhdHRycy50eXBlYWhlYWRBcHBlbmRUbykgOiBudWxsO1xyXG5cclxuICAgIHZhciBmb2N1c0ZpcnN0ID0gb3JpZ2luYWxTY29wZS4kZXZhbChhdHRycy50eXBlYWhlYWRGb2N1c0ZpcnN0KSAhPT0gZmFsc2U7XHJcblxyXG4gICAgLy9JZiBpbnB1dCBtYXRjaGVzIGFuIGl0ZW0gb2YgdGhlIGxpc3QgZXhhY3RseSwgc2VsZWN0IGl0IGF1dG9tYXRpY2FsbHlcclxuICAgIHZhciBzZWxlY3RPbkV4YWN0ID0gYXR0cnMudHlwZWFoZWFkU2VsZWN0T25FeGFjdCA/IG9yaWdpbmFsU2NvcGUuJGV2YWwoYXR0cnMudHlwZWFoZWFkU2VsZWN0T25FeGFjdCkgOiBmYWxzZTtcclxuXHJcbiAgICAvL2JpbmRpbmcgdG8gYSB2YXJpYWJsZSB0aGF0IGluZGljYXRlcyBpZiBkcm9wZG93biBpcyBvcGVuXHJcbiAgICB2YXIgaXNPcGVuU2V0dGVyID0gJHBhcnNlKGF0dHJzLnR5cGVhaGVhZElzT3BlbikuYXNzaWduIHx8IGFuZ3VsYXIubm9vcDtcclxuXHJcbiAgICB2YXIgc2hvd0hpbnQgPSBvcmlnaW5hbFNjb3BlLiRldmFsKGF0dHJzLnR5cGVhaGVhZFNob3dIaW50KSB8fCBmYWxzZTtcclxuXHJcbiAgICAvL0lOVEVSTkFMIFZBUklBQkxFU1xyXG5cclxuICAgIC8vbW9kZWwgc2V0dGVyIGV4ZWN1dGVkIHVwb24gbWF0Y2ggc2VsZWN0aW9uXHJcbiAgICB2YXIgcGFyc2VkTW9kZWwgPSAkcGFyc2UoYXR0cnMubmdNb2RlbCk7XHJcbiAgICB2YXIgaW52b2tlTW9kZWxTZXR0ZXIgPSAkcGFyc2UoYXR0cnMubmdNb2RlbCArICcoJCQkcCknKTtcclxuICAgIHZhciAkc2V0TW9kZWxWYWx1ZSA9IGZ1bmN0aW9uKHNjb3BlLCBuZXdWYWx1ZSkge1xyXG4gICAgICBpZiAoYW5ndWxhci5pc0Z1bmN0aW9uKHBhcnNlZE1vZGVsKG9yaWdpbmFsU2NvcGUpKSAmJlxyXG4gICAgICAgIG5nTW9kZWxPcHRpb25zICYmIG5nTW9kZWxPcHRpb25zLiRvcHRpb25zICYmIG5nTW9kZWxPcHRpb25zLiRvcHRpb25zLmdldHRlclNldHRlcikge1xyXG4gICAgICAgIHJldHVybiBpbnZva2VNb2RlbFNldHRlcihzY29wZSwgeyQkJHA6IG5ld1ZhbHVlfSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiBwYXJzZWRNb2RlbC5hc3NpZ24oc2NvcGUsIG5ld1ZhbHVlKTtcclxuICAgIH07XHJcblxyXG4gICAgLy9leHByZXNzaW9ucyB1c2VkIGJ5IHR5cGVhaGVhZFxyXG4gICAgdmFyIHBhcnNlclJlc3VsdCA9IHR5cGVhaGVhZFBhcnNlci5wYXJzZShhdHRycy51aWJUeXBlYWhlYWQpO1xyXG5cclxuICAgIHZhciBoYXNGb2N1cztcclxuXHJcbiAgICAvL1VzZWQgdG8gYXZvaWQgYnVnIGluIGlPUyB3ZWJ2aWV3IHdoZXJlIGlPUyBrZXlib2FyZCBkb2VzIG5vdCBmaXJlXHJcbiAgICAvL21vdXNlZG93biAmIG1vdXNldXAgZXZlbnRzXHJcbiAgICAvL0lzc3VlICMzNjk5XHJcbiAgICB2YXIgc2VsZWN0ZWQ7XHJcblxyXG4gICAgLy9jcmVhdGUgYSBjaGlsZCBzY29wZSBmb3IgdGhlIHR5cGVhaGVhZCBkaXJlY3RpdmUgc28gd2UgYXJlIG5vdCBwb2xsdXRpbmcgb3JpZ2luYWwgc2NvcGVcclxuICAgIC8vd2l0aCB0eXBlYWhlYWQtc3BlY2lmaWMgZGF0YSAobWF0Y2hlcywgcXVlcnkgZXRjLilcclxuICAgIHZhciBzY29wZSA9IG9yaWdpbmFsU2NvcGUuJG5ldygpO1xyXG4gICAgdmFyIG9mZkRlc3Ryb3kgPSBvcmlnaW5hbFNjb3BlLiRvbignJGRlc3Ryb3knLCBmdW5jdGlvbigpIHtcclxuICAgICAgc2NvcGUuJGRlc3Ryb3koKTtcclxuICAgIH0pO1xyXG4gICAgc2NvcGUuJG9uKCckZGVzdHJveScsIG9mZkRlc3Ryb3kpO1xyXG5cclxuICAgIC8vIFdBSS1BUklBXHJcbiAgICB2YXIgcG9wdXBJZCA9ICd0eXBlYWhlYWQtJyArIHNjb3BlLiRpZCArICctJyArIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDEwMDAwKTtcclxuICAgIGVsZW1lbnQuYXR0cih7XHJcbiAgICAgICdhcmlhLWF1dG9jb21wbGV0ZSc6ICdsaXN0JyxcclxuICAgICAgJ2FyaWEtZXhwYW5kZWQnOiBmYWxzZSxcclxuICAgICAgJ2FyaWEtb3ducyc6IHBvcHVwSWRcclxuICAgIH0pO1xyXG5cclxuICAgIHZhciBpbnB1dHNDb250YWluZXIsIGhpbnRJbnB1dEVsZW07XHJcbiAgICAvL2FkZCByZWFkLW9ubHkgaW5wdXQgdG8gc2hvdyBoaW50XHJcbiAgICBpZiAoc2hvd0hpbnQpIHtcclxuICAgICAgaW5wdXRzQ29udGFpbmVyID0gYW5ndWxhci5lbGVtZW50KCc8ZGl2PjwvZGl2PicpO1xyXG4gICAgICBpbnB1dHNDb250YWluZXIuY3NzKCdwb3NpdGlvbicsICdyZWxhdGl2ZScpO1xyXG4gICAgICBlbGVtZW50LmFmdGVyKGlucHV0c0NvbnRhaW5lcik7XHJcbiAgICAgIGhpbnRJbnB1dEVsZW0gPSBlbGVtZW50LmNsb25lKCk7XHJcbiAgICAgIGhpbnRJbnB1dEVsZW0uYXR0cigncGxhY2Vob2xkZXInLCAnJyk7XHJcbiAgICAgIGhpbnRJbnB1dEVsZW0uYXR0cigndGFiaW5kZXgnLCAnLTEnKTtcclxuICAgICAgaGludElucHV0RWxlbS52YWwoJycpO1xyXG4gICAgICBoaW50SW5wdXRFbGVtLmNzcyh7XHJcbiAgICAgICAgJ3Bvc2l0aW9uJzogJ2Fic29sdXRlJyxcclxuICAgICAgICAndG9wJzogJzBweCcsXHJcbiAgICAgICAgJ2xlZnQnOiAnMHB4JyxcclxuICAgICAgICAnYm9yZGVyLWNvbG9yJzogJ3RyYW5zcGFyZW50JyxcclxuICAgICAgICAnYm94LXNoYWRvdyc6ICdub25lJyxcclxuICAgICAgICAnb3BhY2l0eSc6IDEsXHJcbiAgICAgICAgJ2JhY2tncm91bmQnOiAnbm9uZSAwJSAwJSAvIGF1dG8gcmVwZWF0IHNjcm9sbCBwYWRkaW5nLWJveCBib3JkZXItYm94IHJnYigyNTUsIDI1NSwgMjU1KScsXHJcbiAgICAgICAgJ2NvbG9yJzogJyM5OTknXHJcbiAgICAgIH0pO1xyXG4gICAgICBlbGVtZW50LmNzcyh7XHJcbiAgICAgICAgJ3Bvc2l0aW9uJzogJ3JlbGF0aXZlJyxcclxuICAgICAgICAndmVydGljYWwtYWxpZ24nOiAndG9wJyxcclxuICAgICAgICAnYmFja2dyb3VuZC1jb2xvcic6ICd0cmFuc3BhcmVudCdcclxuICAgICAgfSk7XHJcblxyXG4gICAgICBpZiAoaGludElucHV0RWxlbS5hdHRyKCdpZCcpKSB7XHJcbiAgICAgICAgaGludElucHV0RWxlbS5yZW1vdmVBdHRyKCdpZCcpOyAvLyByZW1vdmUgZHVwbGljYXRlIGlkIGlmIHByZXNlbnQuXHJcbiAgICAgIH1cclxuICAgICAgaW5wdXRzQ29udGFpbmVyLmFwcGVuZChoaW50SW5wdXRFbGVtKTtcclxuICAgICAgaGludElucHV0RWxlbS5hZnRlcihlbGVtZW50KTtcclxuICAgIH1cclxuXHJcbiAgICAvL3BvcC11cCBlbGVtZW50IHVzZWQgdG8gZGlzcGxheSBtYXRjaGVzXHJcbiAgICB2YXIgcG9wVXBFbCA9IGFuZ3VsYXIuZWxlbWVudCgnPGRpdiB1aWItdHlwZWFoZWFkLXBvcHVwPjwvZGl2PicpO1xyXG4gICAgcG9wVXBFbC5hdHRyKHtcclxuICAgICAgaWQ6IHBvcHVwSWQsXHJcbiAgICAgIG1hdGNoZXM6ICdtYXRjaGVzJyxcclxuICAgICAgYWN0aXZlOiAnYWN0aXZlSWR4JyxcclxuICAgICAgc2VsZWN0OiAnc2VsZWN0KGFjdGl2ZUlkeCwgZXZ0KScsXHJcbiAgICAgICdtb3ZlLWluLXByb2dyZXNzJzogJ21vdmVJblByb2dyZXNzJyxcclxuICAgICAgcXVlcnk6ICdxdWVyeScsXHJcbiAgICAgIHBvc2l0aW9uOiAncG9zaXRpb24nLFxyXG4gICAgICAnYXNzaWduLWlzLW9wZW4nOiAnYXNzaWduSXNPcGVuKGlzT3BlbiknLFxyXG4gICAgICBkZWJvdW5jZTogJ2RlYm91bmNlVXBkYXRlJ1xyXG4gICAgfSk7XHJcbiAgICAvL2N1c3RvbSBpdGVtIHRlbXBsYXRlXHJcbiAgICBpZiAoYW5ndWxhci5pc0RlZmluZWQoYXR0cnMudHlwZWFoZWFkVGVtcGxhdGVVcmwpKSB7XHJcbiAgICAgIHBvcFVwRWwuYXR0cigndGVtcGxhdGUtdXJsJywgYXR0cnMudHlwZWFoZWFkVGVtcGxhdGVVcmwpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChhbmd1bGFyLmlzRGVmaW5lZChhdHRycy50eXBlYWhlYWRQb3B1cFRlbXBsYXRlVXJsKSkge1xyXG4gICAgICBwb3BVcEVsLmF0dHIoJ3BvcHVwLXRlbXBsYXRlLXVybCcsIGF0dHJzLnR5cGVhaGVhZFBvcHVwVGVtcGxhdGVVcmwpO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciByZXNldEhpbnQgPSBmdW5jdGlvbigpIHtcclxuICAgICAgaWYgKHNob3dIaW50KSB7XHJcbiAgICAgICAgaGludElucHV0RWxlbS52YWwoJycpO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIHZhciByZXNldE1hdGNoZXMgPSBmdW5jdGlvbigpIHtcclxuICAgICAgc2NvcGUubWF0Y2hlcyA9IFtdO1xyXG4gICAgICBzY29wZS5hY3RpdmVJZHggPSAtMTtcclxuICAgICAgZWxlbWVudC5hdHRyKCdhcmlhLWV4cGFuZGVkJywgZmFsc2UpO1xyXG4gICAgICByZXNldEhpbnQoKTtcclxuICAgIH07XHJcblxyXG4gICAgdmFyIGdldE1hdGNoSWQgPSBmdW5jdGlvbihpbmRleCkge1xyXG4gICAgICByZXR1cm4gcG9wdXBJZCArICctb3B0aW9uLScgKyBpbmRleDtcclxuICAgIH07XHJcblxyXG4gICAgLy8gSW5kaWNhdGUgdGhhdCB0aGUgc3BlY2lmaWVkIG1hdGNoIGlzIHRoZSBhY3RpdmUgKHByZS1zZWxlY3RlZCkgaXRlbSBpbiB0aGUgbGlzdCBvd25lZCBieSB0aGlzIHR5cGVhaGVhZC5cclxuICAgIC8vIFRoaXMgYXR0cmlidXRlIGlzIGFkZGVkIG9yIHJlbW92ZWQgYXV0b21hdGljYWxseSB3aGVuIHRoZSBgYWN0aXZlSWR4YCBjaGFuZ2VzLlxyXG4gICAgc2NvcGUuJHdhdGNoKCdhY3RpdmVJZHgnLCBmdW5jdGlvbihpbmRleCkge1xyXG4gICAgICBpZiAoaW5kZXggPCAwKSB7XHJcbiAgICAgICAgZWxlbWVudC5yZW1vdmVBdHRyKCdhcmlhLWFjdGl2ZWRlc2NlbmRhbnQnKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBlbGVtZW50LmF0dHIoJ2FyaWEtYWN0aXZlZGVzY2VuZGFudCcsIGdldE1hdGNoSWQoaW5kZXgpKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgdmFyIGlucHV0SXNFeGFjdE1hdGNoID0gZnVuY3Rpb24oaW5wdXRWYWx1ZSwgaW5kZXgpIHtcclxuICAgICAgaWYgKHNjb3BlLm1hdGNoZXMubGVuZ3RoID4gaW5kZXggJiYgaW5wdXRWYWx1ZSkge1xyXG4gICAgICAgIHJldHVybiBpbnB1dFZhbHVlLnRvVXBwZXJDYXNlKCkgPT09IHNjb3BlLm1hdGNoZXNbaW5kZXhdLmxhYmVsLnRvVXBwZXJDYXNlKCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH07XHJcblxyXG4gICAgdmFyIGdldE1hdGNoZXNBc3luYyA9IGZ1bmN0aW9uKGlucHV0VmFsdWUsIGV2dCkge1xyXG4gICAgICB2YXIgbG9jYWxzID0geyR2aWV3VmFsdWU6IGlucHV0VmFsdWV9O1xyXG4gICAgICBpc0xvYWRpbmdTZXR0ZXIob3JpZ2luYWxTY29wZSwgdHJ1ZSk7XHJcbiAgICAgIGlzTm9SZXN1bHRzU2V0dGVyKG9yaWdpbmFsU2NvcGUsIGZhbHNlKTtcclxuICAgICAgJHEud2hlbihwYXJzZXJSZXN1bHQuc291cmNlKG9yaWdpbmFsU2NvcGUsIGxvY2FscykpLnRoZW4oZnVuY3Rpb24obWF0Y2hlcykge1xyXG4gICAgICAgIC8vaXQgbWlnaHQgaGFwcGVuIHRoYXQgc2V2ZXJhbCBhc3luYyBxdWVyaWVzIHdlcmUgaW4gcHJvZ3Jlc3MgaWYgYSB1c2VyIHdlcmUgdHlwaW5nIGZhc3RcclxuICAgICAgICAvL2J1dCB3ZSBhcmUgaW50ZXJlc3RlZCBvbmx5IGluIHJlc3BvbnNlcyB0aGF0IGNvcnJlc3BvbmQgdG8gdGhlIGN1cnJlbnQgdmlldyB2YWx1ZVxyXG4gICAgICAgIHZhciBvbkN1cnJlbnRSZXF1ZXN0ID0gaW5wdXRWYWx1ZSA9PT0gbW9kZWxDdHJsLiR2aWV3VmFsdWU7XHJcbiAgICAgICAgaWYgKG9uQ3VycmVudFJlcXVlc3QgJiYgaGFzRm9jdXMpIHtcclxuICAgICAgICAgIGlmIChtYXRjaGVzICYmIG1hdGNoZXMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICBzY29wZS5hY3RpdmVJZHggPSBmb2N1c0ZpcnN0ID8gMCA6IC0xO1xyXG4gICAgICAgICAgICBpc05vUmVzdWx0c1NldHRlcihvcmlnaW5hbFNjb3BlLCBmYWxzZSk7XHJcbiAgICAgICAgICAgIHNjb3BlLm1hdGNoZXMubGVuZ3RoID0gMDtcclxuXHJcbiAgICAgICAgICAgIC8vdHJhbnNmb3JtIGxhYmVsc1xyXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG1hdGNoZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICBsb2NhbHNbcGFyc2VyUmVzdWx0Lml0ZW1OYW1lXSA9IG1hdGNoZXNbaV07XHJcbiAgICAgICAgICAgICAgc2NvcGUubWF0Y2hlcy5wdXNoKHtcclxuICAgICAgICAgICAgICAgIGlkOiBnZXRNYXRjaElkKGkpLFxyXG4gICAgICAgICAgICAgICAgbGFiZWw6IHBhcnNlclJlc3VsdC52aWV3TWFwcGVyKHNjb3BlLCBsb2NhbHMpLFxyXG4gICAgICAgICAgICAgICAgbW9kZWw6IG1hdGNoZXNbaV1cclxuICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgc2NvcGUucXVlcnkgPSBpbnB1dFZhbHVlO1xyXG4gICAgICAgICAgICAvL3Bvc2l0aW9uIHBvcC11cCB3aXRoIG1hdGNoZXMgLSB3ZSBuZWVkIHRvIHJlLWNhbGN1bGF0ZSBpdHMgcG9zaXRpb24gZWFjaCB0aW1lIHdlIGFyZSBvcGVuaW5nIGEgd2luZG93XHJcbiAgICAgICAgICAgIC8vd2l0aCBtYXRjaGVzIGFzIGEgcG9wLXVwIG1pZ2h0IGJlIGFic29sdXRlLXBvc2l0aW9uZWQgYW5kIHBvc2l0aW9uIG9mIGFuIGlucHV0IG1pZ2h0IGhhdmUgY2hhbmdlZCBvbiBhIHBhZ2VcclxuICAgICAgICAgICAgLy9kdWUgdG8gb3RoZXIgZWxlbWVudHMgYmVpbmcgcmVuZGVyZWRcclxuICAgICAgICAgICAgcmVjYWxjdWxhdGVQb3NpdGlvbigpO1xyXG5cclxuICAgICAgICAgICAgZWxlbWVudC5hdHRyKCdhcmlhLWV4cGFuZGVkJywgdHJ1ZSk7XHJcblxyXG4gICAgICAgICAgICAvL1NlbGVjdCB0aGUgc2luZ2xlIHJlbWFpbmluZyBvcHRpb24gaWYgdXNlciBpbnB1dCBtYXRjaGVzXHJcbiAgICAgICAgICAgIGlmIChzZWxlY3RPbkV4YWN0ICYmIHNjb3BlLm1hdGNoZXMubGVuZ3RoID09PSAxICYmIGlucHV0SXNFeGFjdE1hdGNoKGlucHV0VmFsdWUsIDApKSB7XHJcbiAgICAgICAgICAgICAgaWYgKGFuZ3VsYXIuaXNOdW1iZXIoc2NvcGUuZGVib3VuY2VVcGRhdGUpIHx8IGFuZ3VsYXIuaXNPYmplY3Qoc2NvcGUuZGVib3VuY2VVcGRhdGUpKSB7XHJcbiAgICAgICAgICAgICAgICAkJGRlYm91bmNlKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICBzY29wZS5zZWxlY3QoMCwgZXZ0KTtcclxuICAgICAgICAgICAgICAgIH0sIGFuZ3VsYXIuaXNOdW1iZXIoc2NvcGUuZGVib3VuY2VVcGRhdGUpID8gc2NvcGUuZGVib3VuY2VVcGRhdGUgOiBzY29wZS5kZWJvdW5jZVVwZGF0ZVsnZGVmYXVsdCddKTtcclxuICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgc2NvcGUuc2VsZWN0KDAsIGV2dCk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoc2hvd0hpbnQpIHtcclxuICAgICAgICAgICAgICB2YXIgZmlyc3RMYWJlbCA9IHNjb3BlLm1hdGNoZXNbMF0ubGFiZWw7XHJcbiAgICAgICAgICAgICAgaWYgKGFuZ3VsYXIuaXNTdHJpbmcoaW5wdXRWYWx1ZSkgJiZcclxuICAgICAgICAgICAgICAgIGlucHV0VmFsdWUubGVuZ3RoID4gMCAmJlxyXG4gICAgICAgICAgICAgICAgZmlyc3RMYWJlbC5zbGljZSgwLCBpbnB1dFZhbHVlLmxlbmd0aCkudG9VcHBlckNhc2UoKSA9PT0gaW5wdXRWYWx1ZS50b1VwcGVyQ2FzZSgpKSB7XHJcbiAgICAgICAgICAgICAgICBoaW50SW5wdXRFbGVtLnZhbChpbnB1dFZhbHVlICsgZmlyc3RMYWJlbC5zbGljZShpbnB1dFZhbHVlLmxlbmd0aCkpO1xyXG4gICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBoaW50SW5wdXRFbGVtLnZhbCgnJyk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXNldE1hdGNoZXMoKTtcclxuICAgICAgICAgICAgaXNOb1Jlc3VsdHNTZXR0ZXIob3JpZ2luYWxTY29wZSwgdHJ1ZSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChvbkN1cnJlbnRSZXF1ZXN0KSB7XHJcbiAgICAgICAgICBpc0xvYWRpbmdTZXR0ZXIob3JpZ2luYWxTY29wZSwgZmFsc2UpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSwgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgcmVzZXRNYXRjaGVzKCk7XHJcbiAgICAgICAgaXNMb2FkaW5nU2V0dGVyKG9yaWdpbmFsU2NvcGUsIGZhbHNlKTtcclxuICAgICAgICBpc05vUmVzdWx0c1NldHRlcihvcmlnaW5hbFNjb3BlLCB0cnVlKTtcclxuICAgICAgfSk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8vIGJpbmQgZXZlbnRzIG9ubHkgaWYgYXBwZW5kVG9Cb2R5IHBhcmFtcyBleGlzdCAtIHBlcmZvcm1hbmNlIGZlYXR1cmVcclxuICAgIGlmIChhcHBlbmRUb0JvZHkpIHtcclxuICAgICAgYW5ndWxhci5lbGVtZW50KCR3aW5kb3cpLm9uKCdyZXNpemUnLCBmaXJlUmVjYWxjdWxhdGluZyk7XHJcbiAgICAgICRkb2N1bWVudC5maW5kKCdib2R5Jykub24oJ3Njcm9sbCcsIGZpcmVSZWNhbGN1bGF0aW5nKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBEZWNsYXJlIHRoZSBkZWJvdW5jZWQgZnVuY3Rpb24gb3V0c2lkZSByZWNhbGN1bGF0aW5nIGZvclxyXG4gICAgLy8gcHJvcGVyIGRlYm91bmNpbmdcclxuICAgIHZhciBkZWJvdW5jZWRSZWNhbGN1bGF0ZSA9ICQkZGVib3VuY2UoZnVuY3Rpb24oKSB7XHJcbiAgICAgIC8vIGlmIHBvcHVwIGlzIHZpc2libGVcclxuICAgICAgaWYgKHNjb3BlLm1hdGNoZXMubGVuZ3RoKSB7XHJcbiAgICAgICAgcmVjYWxjdWxhdGVQb3NpdGlvbigpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBzY29wZS5tb3ZlSW5Qcm9ncmVzcyA9IGZhbHNlO1xyXG4gICAgfSwgZXZlbnREZWJvdW5jZVRpbWUpO1xyXG5cclxuICAgIC8vIERlZmF1bHQgcHJvZ3Jlc3MgdHlwZVxyXG4gICAgc2NvcGUubW92ZUluUHJvZ3Jlc3MgPSBmYWxzZTtcclxuXHJcbiAgICBmdW5jdGlvbiBmaXJlUmVjYWxjdWxhdGluZygpIHtcclxuICAgICAgaWYgKCFzY29wZS5tb3ZlSW5Qcm9ncmVzcykge1xyXG4gICAgICAgIHNjb3BlLm1vdmVJblByb2dyZXNzID0gdHJ1ZTtcclxuICAgICAgICBzY29wZS4kZGlnZXN0KCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGRlYm91bmNlZFJlY2FsY3VsYXRlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gcmVjYWxjdWxhdGUgYWN0dWFsIHBvc2l0aW9uIGFuZCBzZXQgbmV3IHZhbHVlcyB0byBzY29wZVxyXG4gICAgLy8gYWZ0ZXIgZGlnZXN0IGxvb3AgaXMgcG9wdXAgaW4gcmlnaHQgcG9zaXRpb25cclxuICAgIGZ1bmN0aW9uIHJlY2FsY3VsYXRlUG9zaXRpb24oKSB7XHJcbiAgICAgIHNjb3BlLnBvc2l0aW9uID0gYXBwZW5kVG9Cb2R5ID8gJHBvc2l0aW9uLm9mZnNldChlbGVtZW50KSA6ICRwb3NpdGlvbi5wb3NpdGlvbihlbGVtZW50KTtcclxuICAgICAgc2NvcGUucG9zaXRpb24udG9wICs9IGVsZW1lbnQucHJvcCgnb2Zmc2V0SGVpZ2h0Jyk7XHJcbiAgICB9XHJcblxyXG4gICAgLy93ZSBuZWVkIHRvIHByb3BhZ2F0ZSB1c2VyJ3MgcXVlcnkgc28gd2UgY2FuIGhpZ2xpZ2h0IG1hdGNoZXNcclxuICAgIHNjb3BlLnF1ZXJ5ID0gdW5kZWZpbmVkO1xyXG5cclxuICAgIC8vRGVjbGFyZSB0aGUgdGltZW91dCBwcm9taXNlIHZhciBvdXRzaWRlIHRoZSBmdW5jdGlvbiBzY29wZSBzbyB0aGF0IHN0YWNrZWQgY2FsbHMgY2FuIGJlIGNhbmNlbGxlZCBsYXRlclxyXG4gICAgdmFyIHRpbWVvdXRQcm9taXNlO1xyXG5cclxuICAgIHZhciBzY2hlZHVsZVNlYXJjaFdpdGhUaW1lb3V0ID0gZnVuY3Rpb24oaW5wdXRWYWx1ZSkge1xyXG4gICAgICB0aW1lb3V0UHJvbWlzZSA9ICR0aW1lb3V0KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGdldE1hdGNoZXNBc3luYyhpbnB1dFZhbHVlKTtcclxuICAgICAgfSwgd2FpdFRpbWUpO1xyXG4gICAgfTtcclxuXHJcbiAgICB2YXIgY2FuY2VsUHJldmlvdXNUaW1lb3V0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgIGlmICh0aW1lb3V0UHJvbWlzZSkge1xyXG4gICAgICAgICR0aW1lb3V0LmNhbmNlbCh0aW1lb3V0UHJvbWlzZSk7XHJcbiAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgcmVzZXRNYXRjaGVzKCk7XHJcblxyXG4gICAgc2NvcGUuYXNzaWduSXNPcGVuID0gZnVuY3Rpb24gKGlzT3Blbikge1xyXG4gICAgICBpc09wZW5TZXR0ZXIob3JpZ2luYWxTY29wZSwgaXNPcGVuKTtcclxuICAgIH07XHJcblxyXG4gICAgc2NvcGUuc2VsZWN0ID0gZnVuY3Rpb24oYWN0aXZlSWR4LCBldnQpIHtcclxuICAgICAgLy9jYWxsZWQgZnJvbSB3aXRoaW4gdGhlICRkaWdlc3QoKSBjeWNsZVxyXG4gICAgICB2YXIgbG9jYWxzID0ge307XHJcbiAgICAgIHZhciBtb2RlbCwgaXRlbTtcclxuXHJcbiAgICAgIHNlbGVjdGVkID0gdHJ1ZTtcclxuICAgICAgbG9jYWxzW3BhcnNlclJlc3VsdC5pdGVtTmFtZV0gPSBpdGVtID0gc2NvcGUubWF0Y2hlc1thY3RpdmVJZHhdLm1vZGVsO1xyXG4gICAgICBtb2RlbCA9IHBhcnNlclJlc3VsdC5tb2RlbE1hcHBlcihvcmlnaW5hbFNjb3BlLCBsb2NhbHMpO1xyXG4gICAgICAkc2V0TW9kZWxWYWx1ZShvcmlnaW5hbFNjb3BlLCBtb2RlbCk7XHJcbiAgICAgIG1vZGVsQ3RybC4kc2V0VmFsaWRpdHkoJ2VkaXRhYmxlJywgdHJ1ZSk7XHJcbiAgICAgIG1vZGVsQ3RybC4kc2V0VmFsaWRpdHkoJ3BhcnNlJywgdHJ1ZSk7XHJcblxyXG4gICAgICBvblNlbGVjdENhbGxiYWNrKG9yaWdpbmFsU2NvcGUsIHtcclxuICAgICAgICAkaXRlbTogaXRlbSxcclxuICAgICAgICAkbW9kZWw6IG1vZGVsLFxyXG4gICAgICAgICRsYWJlbDogcGFyc2VyUmVzdWx0LnZpZXdNYXBwZXIob3JpZ2luYWxTY29wZSwgbG9jYWxzKSxcclxuICAgICAgICAkZXZlbnQ6IGV2dFxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIHJlc2V0TWF0Y2hlcygpO1xyXG5cclxuICAgICAgLy9yZXR1cm4gZm9jdXMgdG8gdGhlIGlucHV0IGVsZW1lbnQgaWYgYSBtYXRjaCB3YXMgc2VsZWN0ZWQgdmlhIGEgbW91c2UgY2xpY2sgZXZlbnRcclxuICAgICAgLy8gdXNlIHRpbWVvdXQgdG8gYXZvaWQgJHJvb3RTY29wZTppbnByb2cgZXJyb3JcclxuICAgICAgaWYgKHNjb3BlLiRldmFsKGF0dHJzLnR5cGVhaGVhZEZvY3VzT25TZWxlY3QpICE9PSBmYWxzZSkge1xyXG4gICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uKCkgeyBlbGVtZW50WzBdLmZvY3VzKCk7IH0sIDAsIGZhbHNlKTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICAvL2JpbmQga2V5Ym9hcmQgZXZlbnRzOiBhcnJvd3MgdXAoMzgpIC8gZG93big0MCksIGVudGVyKDEzKSBhbmQgdGFiKDkpLCBlc2MoMjcpXHJcbiAgICBlbGVtZW50Lm9uKCdrZXlkb3duJywgZnVuY3Rpb24oZXZ0KSB7XHJcbiAgICAgIC8vdHlwZWFoZWFkIGlzIG9wZW4gYW5kIGFuIFwiaW50ZXJlc3RpbmdcIiBrZXkgd2FzIHByZXNzZWRcclxuICAgICAgaWYgKHNjb3BlLm1hdGNoZXMubGVuZ3RoID09PSAwIHx8IEhPVF9LRVlTLmluZGV4T2YoZXZ0LndoaWNoKSA9PT0gLTEpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHZhciBzaG91bGRTZWxlY3QgPSBpc1NlbGVjdEV2ZW50KG9yaWdpbmFsU2NvcGUsIHskZXZlbnQ6IGV2dH0pO1xyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIGlmIHRoZXJlJ3Mgbm90aGluZyBzZWxlY3RlZCAoaS5lLiBmb2N1c0ZpcnN0KSBhbmQgZW50ZXIgb3IgdGFiIGlzIGhpdFxyXG4gICAgICAgKiBvclxyXG4gICAgICAgKiBzaGlmdCArIHRhYiBpcyBwcmVzc2VkIHRvIGJyaW5nIGZvY3VzIHRvIHRoZSBwcmV2aW91cyBlbGVtZW50XHJcbiAgICAgICAqIHRoZW4gY2xlYXIgdGhlIHJlc3VsdHNcclxuICAgICAgICovXHJcbiAgICAgIGlmIChzY29wZS5hY3RpdmVJZHggPT09IC0xICYmIHNob3VsZFNlbGVjdCB8fCBldnQud2hpY2ggPT09IDkgJiYgISFldnQuc2hpZnRLZXkpIHtcclxuICAgICAgICByZXNldE1hdGNoZXMoKTtcclxuICAgICAgICBzY29wZS4kZGlnZXN0KCk7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBldnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgdmFyIHRhcmdldDtcclxuICAgICAgc3dpdGNoIChldnQud2hpY2gpIHtcclxuICAgICAgICBjYXNlIDI3OiAvLyBlc2NhcGVcclxuICAgICAgICAgIGV2dC5zdG9wUHJvcGFnYXRpb24oKTtcclxuXHJcbiAgICAgICAgICByZXNldE1hdGNoZXMoKTtcclxuICAgICAgICAgIG9yaWdpbmFsU2NvcGUuJGRpZ2VzdCgpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSAzODogLy8gdXAgYXJyb3dcclxuICAgICAgICAgIHNjb3BlLmFjdGl2ZUlkeCA9IChzY29wZS5hY3RpdmVJZHggPiAwID8gc2NvcGUuYWN0aXZlSWR4IDogc2NvcGUubWF0Y2hlcy5sZW5ndGgpIC0gMTtcclxuICAgICAgICAgIHNjb3BlLiRkaWdlc3QoKTtcclxuICAgICAgICAgIHRhcmdldCA9IHBvcFVwRWxbMF0ucXVlcnlTZWxlY3RvckFsbCgnLnVpYi10eXBlYWhlYWQtbWF0Y2gnKVtzY29wZS5hY3RpdmVJZHhdO1xyXG4gICAgICAgICAgdGFyZ2V0LnBhcmVudE5vZGUuc2Nyb2xsVG9wID0gdGFyZ2V0Lm9mZnNldFRvcDtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgNDA6IC8vIGRvd24gYXJyb3dcclxuICAgICAgICAgIHNjb3BlLmFjdGl2ZUlkeCA9IChzY29wZS5hY3RpdmVJZHggKyAxKSAlIHNjb3BlLm1hdGNoZXMubGVuZ3RoO1xyXG4gICAgICAgICAgc2NvcGUuJGRpZ2VzdCgpO1xyXG4gICAgICAgICAgdGFyZ2V0ID0gcG9wVXBFbFswXS5xdWVyeVNlbGVjdG9yQWxsKCcudWliLXR5cGVhaGVhZC1tYXRjaCcpW3Njb3BlLmFjdGl2ZUlkeF07XHJcbiAgICAgICAgICB0YXJnZXQucGFyZW50Tm9kZS5zY3JvbGxUb3AgPSB0YXJnZXQub2Zmc2V0VG9wO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgIGlmIChzaG91bGRTZWxlY3QpIHtcclxuICAgICAgICAgICAgc2NvcGUuJGFwcGx5KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgIGlmIChhbmd1bGFyLmlzTnVtYmVyKHNjb3BlLmRlYm91bmNlVXBkYXRlKSB8fCBhbmd1bGFyLmlzT2JqZWN0KHNjb3BlLmRlYm91bmNlVXBkYXRlKSkge1xyXG4gICAgICAgICAgICAgICAgJCRkZWJvdW5jZShmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgc2NvcGUuc2VsZWN0KHNjb3BlLmFjdGl2ZUlkeCwgZXZ0KTtcclxuICAgICAgICAgICAgICAgIH0sIGFuZ3VsYXIuaXNOdW1iZXIoc2NvcGUuZGVib3VuY2VVcGRhdGUpID8gc2NvcGUuZGVib3VuY2VVcGRhdGUgOiBzY29wZS5kZWJvdW5jZVVwZGF0ZVsnZGVmYXVsdCddKTtcclxuICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgc2NvcGUuc2VsZWN0KHNjb3BlLmFjdGl2ZUlkeCwgZXZ0KTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICBlbGVtZW50LmJpbmQoJ2ZvY3VzJywgZnVuY3Rpb24gKGV2dCkge1xyXG4gICAgICBoYXNGb2N1cyA9IHRydWU7XHJcbiAgICAgIGlmIChtaW5MZW5ndGggPT09IDAgJiYgIW1vZGVsQ3RybC4kdmlld1ZhbHVlKSB7XHJcbiAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICBnZXRNYXRjaGVzQXN5bmMobW9kZWxDdHJsLiR2aWV3VmFsdWUsIGV2dCk7XHJcbiAgICAgICAgfSwgMCk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIGVsZW1lbnQuYmluZCgnYmx1cicsIGZ1bmN0aW9uKGV2dCkge1xyXG4gICAgICBpZiAoaXNTZWxlY3RPbkJsdXIgJiYgc2NvcGUubWF0Y2hlcy5sZW5ndGggJiYgc2NvcGUuYWN0aXZlSWR4ICE9PSAtMSAmJiAhc2VsZWN0ZWQpIHtcclxuICAgICAgICBzZWxlY3RlZCA9IHRydWU7XHJcbiAgICAgICAgc2NvcGUuJGFwcGx5KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgaWYgKGFuZ3VsYXIuaXNPYmplY3Qoc2NvcGUuZGVib3VuY2VVcGRhdGUpICYmIGFuZ3VsYXIuaXNOdW1iZXIoc2NvcGUuZGVib3VuY2VVcGRhdGUuYmx1cikpIHtcclxuICAgICAgICAgICAgJCRkZWJvdW5jZShmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICBzY29wZS5zZWxlY3Qoc2NvcGUuYWN0aXZlSWR4LCBldnQpO1xyXG4gICAgICAgICAgICB9LCBzY29wZS5kZWJvdW5jZVVwZGF0ZS5ibHVyKTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHNjb3BlLnNlbGVjdChzY29wZS5hY3RpdmVJZHgsIGV2dCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKCFpc0VkaXRhYmxlICYmIG1vZGVsQ3RybC4kZXJyb3IuZWRpdGFibGUpIHtcclxuICAgICAgICBtb2RlbEN0cmwuJHNldFZpZXdWYWx1ZSgpO1xyXG4gICAgICAgIHNjb3BlLiRhcHBseShmdW5jdGlvbigpIHtcclxuICAgICAgICAgIC8vIFJlc2V0IHZhbGlkaXR5IGFzIHdlIGFyZSBjbGVhcmluZ1xyXG4gICAgICAgICAgbW9kZWxDdHJsLiRzZXRWYWxpZGl0eSgnZWRpdGFibGUnLCB0cnVlKTtcclxuICAgICAgICAgIG1vZGVsQ3RybC4kc2V0VmFsaWRpdHkoJ3BhcnNlJywgdHJ1ZSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgZWxlbWVudC52YWwoJycpO1xyXG4gICAgICB9XHJcbiAgICAgIGhhc0ZvY3VzID0gZmFsc2U7XHJcbiAgICAgIHNlbGVjdGVkID0gZmFsc2U7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBLZWVwIHJlZmVyZW5jZSB0byBjbGljayBoYW5kbGVyIHRvIHVuYmluZCBpdC5cclxuICAgIHZhciBkaXNtaXNzQ2xpY2tIYW5kbGVyID0gZnVuY3Rpb24oZXZ0KSB7XHJcbiAgICAgIC8vIElzc3VlICMzOTczXHJcbiAgICAgIC8vIEZpcmVmb3ggdHJlYXRzIHJpZ2h0IGNsaWNrIGFzIGEgY2xpY2sgb24gZG9jdW1lbnRcclxuICAgICAgaWYgKGVsZW1lbnRbMF0gIT09IGV2dC50YXJnZXQgJiYgZXZ0LndoaWNoICE9PSAzICYmIHNjb3BlLm1hdGNoZXMubGVuZ3RoICE9PSAwKSB7XHJcbiAgICAgICAgcmVzZXRNYXRjaGVzKCk7XHJcbiAgICAgICAgaWYgKCEkcm9vdFNjb3BlLiQkcGhhc2UpIHtcclxuICAgICAgICAgIG9yaWdpbmFsU2NvcGUuJGRpZ2VzdCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICAkZG9jdW1lbnQub24oJ2NsaWNrJywgZGlzbWlzc0NsaWNrSGFuZGxlcik7XHJcblxyXG4gICAgb3JpZ2luYWxTY29wZS4kb24oJyRkZXN0cm95JywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICRkb2N1bWVudC5vZmYoJ2NsaWNrJywgZGlzbWlzc0NsaWNrSGFuZGxlcik7XHJcbiAgICAgIGlmIChhcHBlbmRUb0JvZHkgfHwgYXBwZW5kVG8pIHtcclxuICAgICAgICAkcG9wdXAucmVtb3ZlKCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChhcHBlbmRUb0JvZHkpIHtcclxuICAgICAgICBhbmd1bGFyLmVsZW1lbnQoJHdpbmRvdykub2ZmKCdyZXNpemUnLCBmaXJlUmVjYWxjdWxhdGluZyk7XHJcbiAgICAgICAgJGRvY3VtZW50LmZpbmQoJ2JvZHknKS5vZmYoJ3Njcm9sbCcsIGZpcmVSZWNhbGN1bGF0aW5nKTtcclxuICAgICAgfVxyXG4gICAgICAvLyBQcmV2ZW50IGpRdWVyeSBjYWNoZSBtZW1vcnkgbGVha1xyXG4gICAgICBwb3BVcEVsLnJlbW92ZSgpO1xyXG5cclxuICAgICAgaWYgKHNob3dIaW50KSB7XHJcbiAgICAgICAgICBpbnB1dHNDb250YWluZXIucmVtb3ZlKCk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIHZhciAkcG9wdXAgPSAkY29tcGlsZShwb3BVcEVsKShzY29wZSk7XHJcblxyXG4gICAgaWYgKGFwcGVuZFRvQm9keSkge1xyXG4gICAgICAkZG9jdW1lbnQuZmluZCgnYm9keScpLmFwcGVuZCgkcG9wdXApO1xyXG4gICAgfSBlbHNlIGlmIChhcHBlbmRUbykge1xyXG4gICAgICBhbmd1bGFyLmVsZW1lbnQoYXBwZW5kVG8pLmVxKDApLmFwcGVuZCgkcG9wdXApO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgZWxlbWVudC5hZnRlcigkcG9wdXApO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuaW5pdCA9IGZ1bmN0aW9uKF9tb2RlbEN0cmwsIF9uZ01vZGVsT3B0aW9ucykge1xyXG4gICAgICBtb2RlbEN0cmwgPSBfbW9kZWxDdHJsO1xyXG4gICAgICBuZ01vZGVsT3B0aW9ucyA9IF9uZ01vZGVsT3B0aW9ucztcclxuXHJcbiAgICAgIHNjb3BlLmRlYm91bmNlVXBkYXRlID0gbW9kZWxDdHJsLiRvcHRpb25zICYmICRwYXJzZShtb2RlbEN0cmwuJG9wdGlvbnMuZGVib3VuY2UpKG9yaWdpbmFsU2NvcGUpO1xyXG5cclxuICAgICAgLy9wbHVnIGludG8gJHBhcnNlcnMgcGlwZWxpbmUgdG8gb3BlbiBhIHR5cGVhaGVhZCBvbiB2aWV3IGNoYW5nZXMgaW5pdGlhdGVkIGZyb20gRE9NXHJcbiAgICAgIC8vJHBhcnNlcnMga2ljay1pbiBvbiBhbGwgdGhlIGNoYW5nZXMgY29taW5nIGZyb20gdGhlIHZpZXcgYXMgd2VsbCBhcyBtYW51YWxseSB0cmlnZ2VyZWQgYnkgJHNldFZpZXdWYWx1ZVxyXG4gICAgICBtb2RlbEN0cmwuJHBhcnNlcnMudW5zaGlmdChmdW5jdGlvbihpbnB1dFZhbHVlKSB7XHJcbiAgICAgICAgaGFzRm9jdXMgPSB0cnVlO1xyXG5cclxuICAgICAgICBpZiAobWluTGVuZ3RoID09PSAwIHx8IGlucHV0VmFsdWUgJiYgaW5wdXRWYWx1ZS5sZW5ndGggPj0gbWluTGVuZ3RoKSB7XHJcbiAgICAgICAgICBpZiAod2FpdFRpbWUgPiAwKSB7XHJcbiAgICAgICAgICAgIGNhbmNlbFByZXZpb3VzVGltZW91dCgpO1xyXG4gICAgICAgICAgICBzY2hlZHVsZVNlYXJjaFdpdGhUaW1lb3V0KGlucHV0VmFsdWUpO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgZ2V0TWF0Y2hlc0FzeW5jKGlucHV0VmFsdWUpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBpc0xvYWRpbmdTZXR0ZXIob3JpZ2luYWxTY29wZSwgZmFsc2UpO1xyXG4gICAgICAgICAgY2FuY2VsUHJldmlvdXNUaW1lb3V0KCk7XHJcbiAgICAgICAgICByZXNldE1hdGNoZXMoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChpc0VkaXRhYmxlKSB7XHJcbiAgICAgICAgICByZXR1cm4gaW5wdXRWYWx1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghaW5wdXRWYWx1ZSkge1xyXG4gICAgICAgICAgLy8gUmVzZXQgaW4gY2FzZSB1c2VyIGhhZCB0eXBlZCBzb21ldGhpbmcgcHJldmlvdXNseS5cclxuICAgICAgICAgIG1vZGVsQ3RybC4kc2V0VmFsaWRpdHkoJ2VkaXRhYmxlJywgdHJ1ZSk7XHJcbiAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIG1vZGVsQ3RybC4kc2V0VmFsaWRpdHkoJ2VkaXRhYmxlJywgZmFsc2UpO1xyXG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgbW9kZWxDdHJsLiRmb3JtYXR0ZXJzLnB1c2goZnVuY3Rpb24obW9kZWxWYWx1ZSkge1xyXG4gICAgICAgIHZhciBjYW5kaWRhdGVWaWV3VmFsdWUsIGVtcHR5Vmlld1ZhbHVlO1xyXG4gICAgICAgIHZhciBsb2NhbHMgPSB7fTtcclxuXHJcbiAgICAgICAgLy8gVGhlIHZhbGlkaXR5IG1heSBiZSBzZXQgdG8gZmFsc2UgdmlhICRwYXJzZXJzIChzZWUgYWJvdmUpIGlmXHJcbiAgICAgICAgLy8gdGhlIG1vZGVsIGlzIHJlc3RyaWN0ZWQgdG8gc2VsZWN0ZWQgdmFsdWVzLiBJZiB0aGUgbW9kZWxcclxuICAgICAgICAvLyBpcyBzZXQgbWFudWFsbHkgaXQgaXMgY29uc2lkZXJlZCB0byBiZSB2YWxpZC5cclxuICAgICAgICBpZiAoIWlzRWRpdGFibGUpIHtcclxuICAgICAgICAgIG1vZGVsQ3RybC4kc2V0VmFsaWRpdHkoJ2VkaXRhYmxlJywgdHJ1ZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoaW5wdXRGb3JtYXR0ZXIpIHtcclxuICAgICAgICAgIGxvY2Fscy4kbW9kZWwgPSBtb2RlbFZhbHVlO1xyXG4gICAgICAgICAgcmV0dXJuIGlucHV0Rm9ybWF0dGVyKG9yaWdpbmFsU2NvcGUsIGxvY2Fscyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvL2l0IG1pZ2h0IGhhcHBlbiB0aGF0IHdlIGRvbid0IGhhdmUgZW5vdWdoIGluZm8gdG8gcHJvcGVybHkgcmVuZGVyIGlucHV0IHZhbHVlXHJcbiAgICAgICAgLy93ZSBuZWVkIHRvIGNoZWNrIGZvciB0aGlzIHNpdHVhdGlvbiBhbmQgc2ltcGx5IHJldHVybiBtb2RlbCB2YWx1ZSBpZiB3ZSBjYW4ndCBhcHBseSBjdXN0b20gZm9ybWF0dGluZ1xyXG4gICAgICAgIGxvY2Fsc1twYXJzZXJSZXN1bHQuaXRlbU5hbWVdID0gbW9kZWxWYWx1ZTtcclxuICAgICAgICBjYW5kaWRhdGVWaWV3VmFsdWUgPSBwYXJzZXJSZXN1bHQudmlld01hcHBlcihvcmlnaW5hbFNjb3BlLCBsb2NhbHMpO1xyXG4gICAgICAgIGxvY2Fsc1twYXJzZXJSZXN1bHQuaXRlbU5hbWVdID0gdW5kZWZpbmVkO1xyXG4gICAgICAgIGVtcHR5Vmlld1ZhbHVlID0gcGFyc2VyUmVzdWx0LnZpZXdNYXBwZXIob3JpZ2luYWxTY29wZSwgbG9jYWxzKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGNhbmRpZGF0ZVZpZXdWYWx1ZSAhPT0gZW1wdHlWaWV3VmFsdWUgPyBjYW5kaWRhdGVWaWV3VmFsdWUgOiBtb2RlbFZhbHVlO1xyXG4gICAgICB9KTtcclxuICAgIH07XHJcbiAgfV0pXHJcblxyXG4gIC5kaXJlY3RpdmUoJ3VpYlR5cGVhaGVhZCcsIGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgY29udHJvbGxlcjogJ1VpYlR5cGVhaGVhZENvbnRyb2xsZXInLFxyXG4gICAgICByZXF1aXJlOiBbJ25nTW9kZWwnLCAnXj9uZ01vZGVsT3B0aW9ucycsICd1aWJUeXBlYWhlYWQnXSxcclxuICAgICAgbGluazogZnVuY3Rpb24ob3JpZ2luYWxTY29wZSwgZWxlbWVudCwgYXR0cnMsIGN0cmxzKSB7XHJcbiAgICAgICAgY3RybHNbMl0uaW5pdChjdHJsc1swXSwgY3RybHNbMV0pO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG4gIH0pXHJcblxyXG4gIC5kaXJlY3RpdmUoJ3VpYlR5cGVhaGVhZFBvcHVwJywgWyckJGRlYm91bmNlJywgZnVuY3Rpb24oJCRkZWJvdW5jZSkge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgc2NvcGU6IHtcclxuICAgICAgICBtYXRjaGVzOiAnPScsXHJcbiAgICAgICAgcXVlcnk6ICc9JyxcclxuICAgICAgICBhY3RpdmU6ICc9JyxcclxuICAgICAgICBwb3NpdGlvbjogJyYnLFxyXG4gICAgICAgIG1vdmVJblByb2dyZXNzOiAnPScsXHJcbiAgICAgICAgc2VsZWN0OiAnJicsXHJcbiAgICAgICAgYXNzaWduSXNPcGVuOiAnJicsXHJcbiAgICAgICAgZGVib3VuY2U6ICcmJ1xyXG4gICAgICB9LFxyXG4gICAgICByZXBsYWNlOiB0cnVlLFxyXG4gICAgICB0ZW1wbGF0ZVVybDogZnVuY3Rpb24oZWxlbWVudCwgYXR0cnMpIHtcclxuICAgICAgICByZXR1cm4gYXR0cnMucG9wdXBUZW1wbGF0ZVVybCB8fCAndWliL3RlbXBsYXRlL3R5cGVhaGVhZC90eXBlYWhlYWQtcG9wdXAuaHRtbCc7XHJcbiAgICAgIH0sXHJcbiAgICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBlbGVtZW50LCBhdHRycykge1xyXG4gICAgICAgIHNjb3BlLnRlbXBsYXRlVXJsID0gYXR0cnMudGVtcGxhdGVVcmw7XHJcblxyXG4gICAgICAgIHNjb3BlLmlzT3BlbiA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgdmFyIGlzRHJvcGRvd25PcGVuID0gc2NvcGUubWF0Y2hlcy5sZW5ndGggPiAwO1xyXG4gICAgICAgICAgc2NvcGUuYXNzaWduSXNPcGVuKHsgaXNPcGVuOiBpc0Ryb3Bkb3duT3BlbiB9KTtcclxuICAgICAgICAgIHJldHVybiBpc0Ryb3Bkb3duT3BlbjtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBzY29wZS5pc0FjdGl2ZSA9IGZ1bmN0aW9uKG1hdGNoSWR4KSB7XHJcbiAgICAgICAgICByZXR1cm4gc2NvcGUuYWN0aXZlID09PSBtYXRjaElkeDtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBzY29wZS5zZWxlY3RBY3RpdmUgPSBmdW5jdGlvbihtYXRjaElkeCkge1xyXG4gICAgICAgICAgc2NvcGUuYWN0aXZlID0gbWF0Y2hJZHg7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgc2NvcGUuc2VsZWN0TWF0Y2ggPSBmdW5jdGlvbihhY3RpdmVJZHgsIGV2dCkge1xyXG4gICAgICAgICAgdmFyIGRlYm91bmNlID0gc2NvcGUuZGVib3VuY2UoKTtcclxuICAgICAgICAgIGlmIChhbmd1bGFyLmlzTnVtYmVyKGRlYm91bmNlKSB8fCBhbmd1bGFyLmlzT2JqZWN0KGRlYm91bmNlKSkge1xyXG4gICAgICAgICAgICAkJGRlYm91bmNlKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgIHNjb3BlLnNlbGVjdCh7YWN0aXZlSWR4OiBhY3RpdmVJZHgsIGV2dDogZXZ0fSk7XHJcbiAgICAgICAgICAgIH0sIGFuZ3VsYXIuaXNOdW1iZXIoZGVib3VuY2UpID8gZGVib3VuY2UgOiBkZWJvdW5jZVsnZGVmYXVsdCddKTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHNjb3BlLnNlbGVjdCh7YWN0aXZlSWR4OiBhY3RpdmVJZHgsIGV2dDogZXZ0fSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuICB9XSlcclxuXHJcbiAgLmRpcmVjdGl2ZSgndWliVHlwZWFoZWFkTWF0Y2gnLCBbJyR0ZW1wbGF0ZVJlcXVlc3QnLCAnJGNvbXBpbGUnLCAnJHBhcnNlJywgZnVuY3Rpb24oJHRlbXBsYXRlUmVxdWVzdCwgJGNvbXBpbGUsICRwYXJzZSkge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgc2NvcGU6IHtcclxuICAgICAgICBpbmRleDogJz0nLFxyXG4gICAgICAgIG1hdGNoOiAnPScsXHJcbiAgICAgICAgcXVlcnk6ICc9J1xyXG4gICAgICB9LFxyXG4gICAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxlbWVudCwgYXR0cnMpIHtcclxuICAgICAgICB2YXIgdHBsVXJsID0gJHBhcnNlKGF0dHJzLnRlbXBsYXRlVXJsKShzY29wZS4kcGFyZW50KSB8fCAndWliL3RlbXBsYXRlL3R5cGVhaGVhZC90eXBlYWhlYWQtbWF0Y2guaHRtbCc7XHJcbiAgICAgICAgJHRlbXBsYXRlUmVxdWVzdCh0cGxVcmwpLnRoZW4oZnVuY3Rpb24odHBsQ29udGVudCkge1xyXG4gICAgICAgICAgdmFyIHRwbEVsID0gYW5ndWxhci5lbGVtZW50KHRwbENvbnRlbnQudHJpbSgpKTtcclxuICAgICAgICAgIGVsZW1lbnQucmVwbGFjZVdpdGgodHBsRWwpO1xyXG4gICAgICAgICAgJGNvbXBpbGUodHBsRWwpKHNjb3BlKTtcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuICB9XSlcclxuXHJcbiAgLmZpbHRlcigndWliVHlwZWFoZWFkSGlnaGxpZ2h0JywgWyckc2NlJywgJyRpbmplY3RvcicsICckbG9nJywgZnVuY3Rpb24oJHNjZSwgJGluamVjdG9yLCAkbG9nKSB7XHJcbiAgICB2YXIgaXNTYW5pdGl6ZVByZXNlbnQ7XHJcbiAgICBpc1Nhbml0aXplUHJlc2VudCA9ICRpbmplY3Rvci5oYXMoJyRzYW5pdGl6ZScpO1xyXG5cclxuICAgIGZ1bmN0aW9uIGVzY2FwZVJlZ2V4cChxdWVyeVRvRXNjYXBlKSB7XHJcbiAgICAgIC8vIFJlZ2V4OiBjYXB0dXJlIHRoZSB3aG9sZSBxdWVyeSBzdHJpbmcgYW5kIHJlcGxhY2UgaXQgd2l0aCB0aGUgc3RyaW5nIHRoYXQgd2lsbCBiZSB1c2VkIHRvIG1hdGNoXHJcbiAgICAgIC8vIHRoZSByZXN1bHRzLCBmb3IgZXhhbXBsZSBpZiB0aGUgY2FwdHVyZSBpcyBcImFcIiB0aGUgcmVzdWx0IHdpbGwgYmUgXFxhXHJcbiAgICAgIHJldHVybiBxdWVyeVRvRXNjYXBlLnJlcGxhY2UoLyhbLj8qK14kW1xcXVxcXFwoKXt9fC1dKS9nLCAnXFxcXCQxJyk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gY29udGFpbnNIdG1sKG1hdGNoSXRlbSkge1xyXG4gICAgICByZXR1cm4gLzwuKj4vZy50ZXN0KG1hdGNoSXRlbSk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGZ1bmN0aW9uKG1hdGNoSXRlbSwgcXVlcnkpIHtcclxuICAgICAgaWYgKCFpc1Nhbml0aXplUHJlc2VudCAmJiBjb250YWluc0h0bWwobWF0Y2hJdGVtKSkge1xyXG4gICAgICAgICRsb2cud2FybignVW5zYWZlIHVzZSBvZiB0eXBlYWhlYWQgcGxlYXNlIHVzZSBuZ1Nhbml0aXplJyk7IC8vIFdhcm4gdGhlIHVzZXIgYWJvdXQgdGhlIGRhbmdlclxyXG4gICAgICB9XHJcbiAgICAgIG1hdGNoSXRlbSA9IHF1ZXJ5ID8gKCcnICsgbWF0Y2hJdGVtKS5yZXBsYWNlKG5ldyBSZWdFeHAoZXNjYXBlUmVnZXhwKHF1ZXJ5KSwgJ2dpJyksICc8c3Ryb25nPiQmPC9zdHJvbmc+JykgOiBtYXRjaEl0ZW07IC8vIFJlcGxhY2VzIHRoZSBjYXB0dXJlIHN0cmluZyB3aXRoIGEgdGhlIHNhbWUgc3RyaW5nIGluc2lkZSBvZiBhIFwic3Ryb25nXCIgdGFnXHJcbiAgICAgIGlmICghaXNTYW5pdGl6ZVByZXNlbnQpIHtcclxuICAgICAgICBtYXRjaEl0ZW0gPSAkc2NlLnRydXN0QXNIdG1sKG1hdGNoSXRlbSk7IC8vIElmICRzYW5pdGl6ZSBpcyBub3QgcHJlc2VudCB3ZSBwYWNrIHRoZSBzdHJpbmcgaW4gYSAkc2NlIG9iamVjdCBmb3IgdGhlIG5nLWJpbmQtaHRtbCBkaXJlY3RpdmVcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gbWF0Y2hJdGVtO1xyXG4gICAgfTtcclxuICB9XSk7XHJcbmFuZ3VsYXIubW9kdWxlKCd1aS5ib290c3RyYXAuY2Fyb3VzZWwnKS5ydW4oZnVuY3Rpb24oKSB7IWFuZ3VsYXIuJCRjc3AoKS5ub0lubGluZVN0eWxlICYmICFhbmd1bGFyLiQkdWliQ2Fyb3VzZWxDc3MgJiYgYW5ndWxhci5lbGVtZW50KGRvY3VtZW50KS5maW5kKCdoZWFkJykucHJlcGVuZCgnPHN0eWxlIHR5cGU9XCJ0ZXh0L2Nzc1wiPi5uZy1hbmltYXRlLml0ZW06bm90KC5sZWZ0KTpub3QoLnJpZ2h0KXstd2Via2l0LXRyYW5zaXRpb246MHMgZWFzZS1pbi1vdXQgbGVmdDt0cmFuc2l0aW9uOjBzIGVhc2UtaW4tb3V0IGxlZnR9PC9zdHlsZT4nKTsgYW5ndWxhci4kJHVpYkNhcm91c2VsQ3NzID0gdHJ1ZTsgfSk7XHJcbmFuZ3VsYXIubW9kdWxlKCd1aS5ib290c3RyYXAuZGF0ZXBpY2tlcicpLnJ1bihmdW5jdGlvbigpIHshYW5ndWxhci4kJGNzcCgpLm5vSW5saW5lU3R5bGUgJiYgIWFuZ3VsYXIuJCR1aWJEYXRlcGlja2VyQ3NzICYmIGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudCkuZmluZCgnaGVhZCcpLnByZXBlbmQoJzxzdHlsZSB0eXBlPVwidGV4dC9jc3NcIj4udWliLWRhdGVwaWNrZXIgLnVpYi10aXRsZXt3aWR0aDoxMDAlO30udWliLWRheSBidXR0b24sLnVpYi1tb250aCBidXR0b24sLnVpYi15ZWFyIGJ1dHRvbnttaW4td2lkdGg6MTAwJTt9LnVpYi1sZWZ0LC51aWItcmlnaHR7d2lkdGg6MTAwJX08L3N0eWxlPicpOyBhbmd1bGFyLiQkdWliRGF0ZXBpY2tlckNzcyA9IHRydWU7IH0pO1xyXG5hbmd1bGFyLm1vZHVsZSgndWkuYm9vdHN0cmFwLnBvc2l0aW9uJykucnVuKGZ1bmN0aW9uKCkgeyFhbmd1bGFyLiQkY3NwKCkubm9JbmxpbmVTdHlsZSAmJiAhYW5ndWxhci4kJHVpYlBvc2l0aW9uQ3NzICYmIGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudCkuZmluZCgnaGVhZCcpLnByZXBlbmQoJzxzdHlsZSB0eXBlPVwidGV4dC9jc3NcIj4udWliLXBvc2l0aW9uLW1lYXN1cmV7ZGlzcGxheTpibG9jayAhaW1wb3J0YW50O3Zpc2liaWxpdHk6aGlkZGVuICFpbXBvcnRhbnQ7cG9zaXRpb246YWJzb2x1dGUgIWltcG9ydGFudDt0b3A6LTk5OTlweCAhaW1wb3J0YW50O2xlZnQ6LTk5OTlweCAhaW1wb3J0YW50O30udWliLXBvc2l0aW9uLXNjcm9sbGJhci1tZWFzdXJle3Bvc2l0aW9uOmFic29sdXRlICFpbXBvcnRhbnQ7dG9wOi05OTk5cHggIWltcG9ydGFudDt3aWR0aDo1MHB4ICFpbXBvcnRhbnQ7aGVpZ2h0OjUwcHggIWltcG9ydGFudDtvdmVyZmxvdzpzY3JvbGwgIWltcG9ydGFudDt9LnVpYi1wb3NpdGlvbi1ib2R5LXNjcm9sbGJhci1tZWFzdXJle292ZXJmbG93OnNjcm9sbCAhaW1wb3J0YW50O308L3N0eWxlPicpOyBhbmd1bGFyLiQkdWliUG9zaXRpb25Dc3MgPSB0cnVlOyB9KTtcclxuYW5ndWxhci5tb2R1bGUoJ3VpLmJvb3RzdHJhcC5kYXRlcGlja2VyUG9wdXAnKS5ydW4oZnVuY3Rpb24oKSB7IWFuZ3VsYXIuJCRjc3AoKS5ub0lubGluZVN0eWxlICYmICFhbmd1bGFyLiQkdWliRGF0ZXBpY2tlcnBvcHVwQ3NzICYmIGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudCkuZmluZCgnaGVhZCcpLnByZXBlbmQoJzxzdHlsZSB0eXBlPVwidGV4dC9jc3NcIj4udWliLWRhdGVwaWNrZXItcG9wdXAuZHJvcGRvd24tbWVudXtkaXNwbGF5OmJsb2NrO2Zsb2F0Om5vbmU7bWFyZ2luOjA7fS51aWItYnV0dG9uLWJhcntwYWRkaW5nOjEwcHggOXB4IDJweDt9PC9zdHlsZT4nKTsgYW5ndWxhci4kJHVpYkRhdGVwaWNrZXJwb3B1cENzcyA9IHRydWU7IH0pO1xyXG5hbmd1bGFyLm1vZHVsZSgndWkuYm9vdHN0cmFwLnRvb2x0aXAnKS5ydW4oZnVuY3Rpb24oKSB7IWFuZ3VsYXIuJCRjc3AoKS5ub0lubGluZVN0eWxlICYmICFhbmd1bGFyLiQkdWliVG9vbHRpcENzcyAmJiBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQpLmZpbmQoJ2hlYWQnKS5wcmVwZW5kKCc8c3R5bGUgdHlwZT1cInRleHQvY3NzXCI+W3VpYi10b29sdGlwLXBvcHVwXS50b29sdGlwLnRvcC1sZWZ0ID4gLnRvb2x0aXAtYXJyb3csW3VpYi10b29sdGlwLXBvcHVwXS50b29sdGlwLnRvcC1yaWdodCA+IC50b29sdGlwLWFycm93LFt1aWItdG9vbHRpcC1wb3B1cF0udG9vbHRpcC5ib3R0b20tbGVmdCA+IC50b29sdGlwLWFycm93LFt1aWItdG9vbHRpcC1wb3B1cF0udG9vbHRpcC5ib3R0b20tcmlnaHQgPiAudG9vbHRpcC1hcnJvdyxbdWliLXRvb2x0aXAtcG9wdXBdLnRvb2x0aXAubGVmdC10b3AgPiAudG9vbHRpcC1hcnJvdyxbdWliLXRvb2x0aXAtcG9wdXBdLnRvb2x0aXAubGVmdC1ib3R0b20gPiAudG9vbHRpcC1hcnJvdyxbdWliLXRvb2x0aXAtcG9wdXBdLnRvb2x0aXAucmlnaHQtdG9wID4gLnRvb2x0aXAtYXJyb3csW3VpYi10b29sdGlwLXBvcHVwXS50b29sdGlwLnJpZ2h0LWJvdHRvbSA+IC50b29sdGlwLWFycm93LFt1aWItdG9vbHRpcC1odG1sLXBvcHVwXS50b29sdGlwLnRvcC1sZWZ0ID4gLnRvb2x0aXAtYXJyb3csW3VpYi10b29sdGlwLWh0bWwtcG9wdXBdLnRvb2x0aXAudG9wLXJpZ2h0ID4gLnRvb2x0aXAtYXJyb3csW3VpYi10b29sdGlwLWh0bWwtcG9wdXBdLnRvb2x0aXAuYm90dG9tLWxlZnQgPiAudG9vbHRpcC1hcnJvdyxbdWliLXRvb2x0aXAtaHRtbC1wb3B1cF0udG9vbHRpcC5ib3R0b20tcmlnaHQgPiAudG9vbHRpcC1hcnJvdyxbdWliLXRvb2x0aXAtaHRtbC1wb3B1cF0udG9vbHRpcC5sZWZ0LXRvcCA+IC50b29sdGlwLWFycm93LFt1aWItdG9vbHRpcC1odG1sLXBvcHVwXS50b29sdGlwLmxlZnQtYm90dG9tID4gLnRvb2x0aXAtYXJyb3csW3VpYi10b29sdGlwLWh0bWwtcG9wdXBdLnRvb2x0aXAucmlnaHQtdG9wID4gLnRvb2x0aXAtYXJyb3csW3VpYi10b29sdGlwLWh0bWwtcG9wdXBdLnRvb2x0aXAucmlnaHQtYm90dG9tID4gLnRvb2x0aXAtYXJyb3csW3VpYi10b29sdGlwLXRlbXBsYXRlLXBvcHVwXS50b29sdGlwLnRvcC1sZWZ0ID4gLnRvb2x0aXAtYXJyb3csW3VpYi10b29sdGlwLXRlbXBsYXRlLXBvcHVwXS50b29sdGlwLnRvcC1yaWdodCA+IC50b29sdGlwLWFycm93LFt1aWItdG9vbHRpcC10ZW1wbGF0ZS1wb3B1cF0udG9vbHRpcC5ib3R0b20tbGVmdCA+IC50b29sdGlwLWFycm93LFt1aWItdG9vbHRpcC10ZW1wbGF0ZS1wb3B1cF0udG9vbHRpcC5ib3R0b20tcmlnaHQgPiAudG9vbHRpcC1hcnJvdyxbdWliLXRvb2x0aXAtdGVtcGxhdGUtcG9wdXBdLnRvb2x0aXAubGVmdC10b3AgPiAudG9vbHRpcC1hcnJvdyxbdWliLXRvb2x0aXAtdGVtcGxhdGUtcG9wdXBdLnRvb2x0aXAubGVmdC1ib3R0b20gPiAudG9vbHRpcC1hcnJvdyxbdWliLXRvb2x0aXAtdGVtcGxhdGUtcG9wdXBdLnRvb2x0aXAucmlnaHQtdG9wID4gLnRvb2x0aXAtYXJyb3csW3VpYi10b29sdGlwLXRlbXBsYXRlLXBvcHVwXS50b29sdGlwLnJpZ2h0LWJvdHRvbSA+IC50b29sdGlwLWFycm93LFt1aWItcG9wb3Zlci1wb3B1cF0ucG9wb3Zlci50b3AtbGVmdCA+IC5hcnJvdyxbdWliLXBvcG92ZXItcG9wdXBdLnBvcG92ZXIudG9wLXJpZ2h0ID4gLmFycm93LFt1aWItcG9wb3Zlci1wb3B1cF0ucG9wb3Zlci5ib3R0b20tbGVmdCA+IC5hcnJvdyxbdWliLXBvcG92ZXItcG9wdXBdLnBvcG92ZXIuYm90dG9tLXJpZ2h0ID4gLmFycm93LFt1aWItcG9wb3Zlci1wb3B1cF0ucG9wb3Zlci5sZWZ0LXRvcCA+IC5hcnJvdyxbdWliLXBvcG92ZXItcG9wdXBdLnBvcG92ZXIubGVmdC1ib3R0b20gPiAuYXJyb3csW3VpYi1wb3BvdmVyLXBvcHVwXS5wb3BvdmVyLnJpZ2h0LXRvcCA+IC5hcnJvdyxbdWliLXBvcG92ZXItcG9wdXBdLnBvcG92ZXIucmlnaHQtYm90dG9tID4gLmFycm93LFt1aWItcG9wb3Zlci1odG1sLXBvcHVwXS5wb3BvdmVyLnRvcC1sZWZ0ID4gLmFycm93LFt1aWItcG9wb3Zlci1odG1sLXBvcHVwXS5wb3BvdmVyLnRvcC1yaWdodCA+IC5hcnJvdyxbdWliLXBvcG92ZXItaHRtbC1wb3B1cF0ucG9wb3Zlci5ib3R0b20tbGVmdCA+IC5hcnJvdyxbdWliLXBvcG92ZXItaHRtbC1wb3B1cF0ucG9wb3Zlci5ib3R0b20tcmlnaHQgPiAuYXJyb3csW3VpYi1wb3BvdmVyLWh0bWwtcG9wdXBdLnBvcG92ZXIubGVmdC10b3AgPiAuYXJyb3csW3VpYi1wb3BvdmVyLWh0bWwtcG9wdXBdLnBvcG92ZXIubGVmdC1ib3R0b20gPiAuYXJyb3csW3VpYi1wb3BvdmVyLWh0bWwtcG9wdXBdLnBvcG92ZXIucmlnaHQtdG9wID4gLmFycm93LFt1aWItcG9wb3Zlci1odG1sLXBvcHVwXS5wb3BvdmVyLnJpZ2h0LWJvdHRvbSA+IC5hcnJvdyxbdWliLXBvcG92ZXItdGVtcGxhdGUtcG9wdXBdLnBvcG92ZXIudG9wLWxlZnQgPiAuYXJyb3csW3VpYi1wb3BvdmVyLXRlbXBsYXRlLXBvcHVwXS5wb3BvdmVyLnRvcC1yaWdodCA+IC5hcnJvdyxbdWliLXBvcG92ZXItdGVtcGxhdGUtcG9wdXBdLnBvcG92ZXIuYm90dG9tLWxlZnQgPiAuYXJyb3csW3VpYi1wb3BvdmVyLXRlbXBsYXRlLXBvcHVwXS5wb3BvdmVyLmJvdHRvbS1yaWdodCA+IC5hcnJvdyxbdWliLXBvcG92ZXItdGVtcGxhdGUtcG9wdXBdLnBvcG92ZXIubGVmdC10b3AgPiAuYXJyb3csW3VpYi1wb3BvdmVyLXRlbXBsYXRlLXBvcHVwXS5wb3BvdmVyLmxlZnQtYm90dG9tID4gLmFycm93LFt1aWItcG9wb3Zlci10ZW1wbGF0ZS1wb3B1cF0ucG9wb3Zlci5yaWdodC10b3AgPiAuYXJyb3csW3VpYi1wb3BvdmVyLXRlbXBsYXRlLXBvcHVwXS5wb3BvdmVyLnJpZ2h0LWJvdHRvbSA+IC5hcnJvd3t0b3A6YXV0bztib3R0b206YXV0bztsZWZ0OmF1dG87cmlnaHQ6YXV0bzttYXJnaW46MDt9W3VpYi1wb3BvdmVyLXBvcHVwXS5wb3BvdmVyLFt1aWItcG9wb3Zlci1odG1sLXBvcHVwXS5wb3BvdmVyLFt1aWItcG9wb3Zlci10ZW1wbGF0ZS1wb3B1cF0ucG9wb3ZlcntkaXNwbGF5OmJsb2NrICFpbXBvcnRhbnQ7fTwvc3R5bGU+Jyk7IGFuZ3VsYXIuJCR1aWJUb29sdGlwQ3NzID0gdHJ1ZTsgfSk7XHJcbmFuZ3VsYXIubW9kdWxlKCd1aS5ib290c3RyYXAudGltZXBpY2tlcicpLnJ1bihmdW5jdGlvbigpIHshYW5ndWxhci4kJGNzcCgpLm5vSW5saW5lU3R5bGUgJiYgIWFuZ3VsYXIuJCR1aWJUaW1lcGlja2VyQ3NzICYmIGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudCkuZmluZCgnaGVhZCcpLnByZXBlbmQoJzxzdHlsZSB0eXBlPVwidGV4dC9jc3NcIj4udWliLXRpbWUgaW5wdXR7d2lkdGg6NTBweDt9PC9zdHlsZT4nKTsgYW5ndWxhci4kJHVpYlRpbWVwaWNrZXJDc3MgPSB0cnVlOyB9KTtcclxuYW5ndWxhci5tb2R1bGUoJ3VpLmJvb3RzdHJhcC50eXBlYWhlYWQnKS5ydW4oZnVuY3Rpb24oKSB7IWFuZ3VsYXIuJCRjc3AoKS5ub0lubGluZVN0eWxlICYmICFhbmd1bGFyLiQkdWliVHlwZWFoZWFkQ3NzICYmIGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudCkuZmluZCgnaGVhZCcpLnByZXBlbmQoJzxzdHlsZSB0eXBlPVwidGV4dC9jc3NcIj5bdWliLXR5cGVhaGVhZC1wb3B1cF0uZHJvcGRvd24tbWVudXtkaXNwbGF5OmJsb2NrO308L3N0eWxlPicpOyBhbmd1bGFyLiQkdWliVHlwZWFoZWFkQ3NzID0gdHJ1ZTsgfSk7Il0sImZpbGUiOiJ1aS1ib290c3RyYXAuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
