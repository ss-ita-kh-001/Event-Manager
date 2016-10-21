/*
 * angular-ui-bootstrap
 * http://angular-ui.github.io/bootstrap/

 * Version: 2.2.0 - 2016-10-10
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
        var scrollbarWidth = this.scrollbarWidth(BODY_REGEX.test(scrollParent.tagName));

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
      $document.off('click', closeDropdown);
      $document.off('keydown', this.keybindFilter);
      openScope = null;
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

    openScope.focusToggleElement();
    openScope.isOpen = false;

    if (!$rootScope.$$phase) {
      openScope.$apply();
    }
  };

  this.keybindFilter = function(evt) {
    if (!openScope) {
      // see this.close as ESC could have been pressed which kills the scope so we can not proceed
      return;
    }

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

        // Deferred object that will be resolved when this modal is rendered.
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
             * directive that causes focus) then there's no need to try to focus anything.
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
      var ARIA_HIDDEN_ATTRIBUTE_NAME = 'data-bootstrap-modal-aria-hidden-count';

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

        applyAriaHidden(angularDomEl);

        function applyAriaHidden(el) {
          if (!el || el[0].tagName === 'BODY') {
            return;
          }

          getSiblings(el).forEach(function(sibling) {
            var elemIsAlreadyHidden = sibling.getAttribute('aria-hidden') === 'true',
              ariaHiddenCount = parseInt(sibling.getAttribute(ARIA_HIDDEN_ATTRIBUTE_NAME), 10);

            if (!ariaHiddenCount) {
              ariaHiddenCount = elemIsAlreadyHidden ? 1 : 0;  
            }

            sibling.setAttribute(ARIA_HIDDEN_ATTRIBUTE_NAME, ariaHiddenCount + 1);
            sibling.setAttribute('aria-hidden', 'true');
          });

          return applyAriaHidden(el.parent());

          function getSiblings(el) {
            var children = el.parent() ? el.parent().children() : [];

            return Array.prototype.filter.call(children, function(child) {
              return child !== el[0];
            });
          }
        }
      };

      function broadcastClosing(modalWindow, resultOrReason, closing) {
        return !modalWindow.value.modalScope.$broadcast('modal.closing', resultOrReason, closing).defaultPrevented;
      }

      function unhideBackgroundElements() {
        Array.prototype.forEach.call(
          document.querySelectorAll('[' + ARIA_HIDDEN_ATTRIBUTE_NAME + ']'),
          function(hiddenEl) {
            var ariaHiddenCount = parseInt(hiddenEl.getAttribute(ARIA_HIDDEN_ATTRIBUTE_NAME), 10),
              newHiddenCount = ariaHiddenCount - 1;
            hiddenEl.setAttribute(ARIA_HIDDEN_ATTRIBUTE_NAME, newHiddenCount);

            if (!newHiddenCount) {
              hiddenEl.removeAttribute(ARIA_HIDDEN_ATTRIBUTE_NAME);
              hiddenEl.removeAttribute('aria-hidden');
            }
          }
        );
      }
      
      $modalStack.close = function(modalInstance, result) {
        var modalWindow = openedWindows.get(modalInstance);
        unhideBackgroundElements();
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
        unhideBackgroundElements();
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
        $modalStack.focusFirstFocusableElement($modalStack.loadFocusElementList(modalWindow));
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
            var adjustmentTimeout;
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

                  adjustmentTimeout = $timeout(function() {
                    var currentHeight = angular.isDefined(tooltip.offsetHeight) ? tooltip.offsetHeight : tooltip.prop('offsetHeight');
                    var adjustment = $position.adjustTop(placementClasses, elementPos, initialHeight, currentHeight);
                    if (adjustment) {
                      tooltip.css(adjustment);
                    }
                    adjustmentTimeout = null;
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
                if (adjustmentTimeout) {
                  $timeout.cancel(adjustmentTimeout);
                }
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
  var hoursModelCtrl, minutesModelCtrl, secondsModelCtrl;
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

    hoursModelCtrl = hoursInputEl.controller('ngModel');
    minutesModelCtrl = minutesInputEl.controller('ngModel');
    secondsModelCtrl = secondsInputEl.controller('ngModel');

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
        if (hoursModelCtrl) {
          hoursModelCtrl.$setValidity('hours', false);
        }
      }

      if (angular.isDefined(invalidMinutes)) {
        $scope.invalidMinutes = invalidMinutes;
        if (minutesModelCtrl) {
          minutesModelCtrl.$setValidity('minutes', false);
        }
      }

      if (angular.isDefined(invalidSeconds)) {
        $scope.invalidSeconds = invalidSeconds;
        if (secondsModelCtrl) {
          secondsModelCtrl.$setValidity('seconds', false);
        }
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
    if (hoursModelCtrl) {
      hoursModelCtrl.$setValidity('hours', true);
    }

    if (minutesModelCtrl) {
      minutesModelCtrl.$setValidity('minutes', true);
    }

    if (secondsModelCtrl) {
      secondsModelCtrl.$setValidity('seconds', true);
    }

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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJ1aS1ib290c3RyYXAuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLypcclxuICogYW5ndWxhci11aS1ib290c3RyYXBcclxuICogaHR0cDovL2FuZ3VsYXItdWkuZ2l0aHViLmlvL2Jvb3RzdHJhcC9cclxuXHJcbiAqIFZlcnNpb246IDIuMi4wIC0gMjAxNi0xMC0xMFxyXG4gKiBMaWNlbnNlOiBNSVRcclxuICovYW5ndWxhci5tb2R1bGUoXCJ1aS5ib290c3RyYXBcIiwgW1widWkuYm9vdHN0cmFwLmNvbGxhcHNlXCIsXCJ1aS5ib290c3RyYXAudGFiaW5kZXhcIixcInVpLmJvb3RzdHJhcC5hY2NvcmRpb25cIixcInVpLmJvb3RzdHJhcC5hbGVydFwiLFwidWkuYm9vdHN0cmFwLmJ1dHRvbnNcIixcInVpLmJvb3RzdHJhcC5jYXJvdXNlbFwiLFwidWkuYm9vdHN0cmFwLmRhdGVwYXJzZXJcIixcInVpLmJvb3RzdHJhcC5pc0NsYXNzXCIsXCJ1aS5ib290c3RyYXAuZGF0ZXBpY2tlclwiLFwidWkuYm9vdHN0cmFwLnBvc2l0aW9uXCIsXCJ1aS5ib290c3RyYXAuZGF0ZXBpY2tlclBvcHVwXCIsXCJ1aS5ib290c3RyYXAuZGVib3VuY2VcIixcInVpLmJvb3RzdHJhcC5kcm9wZG93blwiLFwidWkuYm9vdHN0cmFwLnN0YWNrZWRNYXBcIixcInVpLmJvb3RzdHJhcC5tb2RhbFwiLFwidWkuYm9vdHN0cmFwLnBhZ2luZ1wiLFwidWkuYm9vdHN0cmFwLnBhZ2VyXCIsXCJ1aS5ib290c3RyYXAucGFnaW5hdGlvblwiLFwidWkuYm9vdHN0cmFwLnRvb2x0aXBcIixcInVpLmJvb3RzdHJhcC5wb3BvdmVyXCIsXCJ1aS5ib290c3RyYXAucHJvZ3Jlc3NiYXJcIixcInVpLmJvb3RzdHJhcC5yYXRpbmdcIixcInVpLmJvb3RzdHJhcC50YWJzXCIsXCJ1aS5ib290c3RyYXAudGltZXBpY2tlclwiLFwidWkuYm9vdHN0cmFwLnR5cGVhaGVhZFwiXSk7XHJcbmFuZ3VsYXIubW9kdWxlKCd1aS5ib290c3RyYXAuY29sbGFwc2UnLCBbXSlcclxuXHJcbiAgLmRpcmVjdGl2ZSgndWliQ29sbGFwc2UnLCBbJyRhbmltYXRlJywgJyRxJywgJyRwYXJzZScsICckaW5qZWN0b3InLCBmdW5jdGlvbigkYW5pbWF0ZSwgJHEsICRwYXJzZSwgJGluamVjdG9yKSB7XHJcbiAgICB2YXIgJGFuaW1hdGVDc3MgPSAkaW5qZWN0b3IuaGFzKCckYW5pbWF0ZUNzcycpID8gJGluamVjdG9yLmdldCgnJGFuaW1hdGVDc3MnKSA6IG51bGw7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxlbWVudCwgYXR0cnMpIHtcclxuICAgICAgICB2YXIgZXhwYW5kaW5nRXhwciA9ICRwYXJzZShhdHRycy5leHBhbmRpbmcpLFxyXG4gICAgICAgICAgZXhwYW5kZWRFeHByID0gJHBhcnNlKGF0dHJzLmV4cGFuZGVkKSxcclxuICAgICAgICAgIGNvbGxhcHNpbmdFeHByID0gJHBhcnNlKGF0dHJzLmNvbGxhcHNpbmcpLFxyXG4gICAgICAgICAgY29sbGFwc2VkRXhwciA9ICRwYXJzZShhdHRycy5jb2xsYXBzZWQpLFxyXG4gICAgICAgICAgaG9yaXpvbnRhbCA9IGZhbHNlLFxyXG4gICAgICAgICAgY3NzID0ge30sXHJcbiAgICAgICAgICBjc3NUbyA9IHt9O1xyXG5cclxuICAgICAgICBpbml0KCk7XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGluaXQoKSB7XHJcbiAgICAgICAgICBob3Jpem9udGFsID0gISEoJ2hvcml6b250YWwnIGluIGF0dHJzKTtcclxuICAgICAgICAgIGlmIChob3Jpem9udGFsKSB7XHJcbiAgICAgICAgICAgIGNzcyA9IHtcclxuICAgICAgICAgICAgICB3aWR0aDogJydcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgY3NzVG8gPSB7d2lkdGg6ICcwJ307XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjc3MgPSB7XHJcbiAgICAgICAgICAgICAgaGVpZ2h0OiAnJ1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBjc3NUbyA9IHtoZWlnaHQ6ICcwJ307XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBpZiAoIXNjb3BlLiRldmFsKGF0dHJzLnVpYkNvbGxhcHNlKSkge1xyXG4gICAgICAgICAgICBlbGVtZW50LmFkZENsYXNzKCdpbicpXHJcbiAgICAgICAgICAgICAgLmFkZENsYXNzKCdjb2xsYXBzZScpXHJcbiAgICAgICAgICAgICAgLmF0dHIoJ2FyaWEtZXhwYW5kZWQnLCB0cnVlKVxyXG4gICAgICAgICAgICAgIC5hdHRyKCdhcmlhLWhpZGRlbicsIGZhbHNlKVxyXG4gICAgICAgICAgICAgIC5jc3MoY3NzKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGdldFNjcm9sbEZyb21FbGVtZW50KGVsZW1lbnQpIHtcclxuICAgICAgICAgIGlmIChob3Jpem9udGFsKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB7d2lkdGg6IGVsZW1lbnQuc2Nyb2xsV2lkdGggKyAncHgnfTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHJldHVybiB7aGVpZ2h0OiBlbGVtZW50LnNjcm9sbEhlaWdodCArICdweCd9O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gZXhwYW5kKCkge1xyXG4gICAgICAgICAgaWYgKGVsZW1lbnQuaGFzQ2xhc3MoJ2NvbGxhcHNlJykgJiYgZWxlbWVudC5oYXNDbGFzcygnaW4nKSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgJHEucmVzb2x2ZShleHBhbmRpbmdFeHByKHNjb3BlKSlcclxuICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgZWxlbWVudC5yZW1vdmVDbGFzcygnY29sbGFwc2UnKVxyXG4gICAgICAgICAgICAgICAgLmFkZENsYXNzKCdjb2xsYXBzaW5nJylcclxuICAgICAgICAgICAgICAgIC5hdHRyKCdhcmlhLWV4cGFuZGVkJywgdHJ1ZSlcclxuICAgICAgICAgICAgICAgIC5hdHRyKCdhcmlhLWhpZGRlbicsIGZhbHNlKTtcclxuXHJcbiAgICAgICAgICAgICAgaWYgKCRhbmltYXRlQ3NzKSB7XHJcbiAgICAgICAgICAgICAgICAkYW5pbWF0ZUNzcyhlbGVtZW50LCB7XHJcbiAgICAgICAgICAgICAgICAgIGFkZENsYXNzOiAnaW4nLFxyXG4gICAgICAgICAgICAgICAgICBlYXNpbmc6ICdlYXNlJyxcclxuICAgICAgICAgICAgICAgICAgY3NzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgb3ZlcmZsb3c6ICdoaWRkZW4nXHJcbiAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgIHRvOiBnZXRTY3JvbGxGcm9tRWxlbWVudChlbGVtZW50WzBdKVxyXG4gICAgICAgICAgICAgICAgfSkuc3RhcnQoKVsnZmluYWxseSddKGV4cGFuZERvbmUpO1xyXG4gICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAkYW5pbWF0ZS5hZGRDbGFzcyhlbGVtZW50LCAnaW4nLCB7XHJcbiAgICAgICAgICAgICAgICAgIGNzczoge1xyXG4gICAgICAgICAgICAgICAgICAgIG92ZXJmbG93OiAnaGlkZGVuJ1xyXG4gICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICB0bzogZ2V0U2Nyb2xsRnJvbUVsZW1lbnQoZWxlbWVudFswXSlcclxuICAgICAgICAgICAgICAgIH0pLnRoZW4oZXhwYW5kRG9uZSk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGV4cGFuZERvbmUoKSB7XHJcbiAgICAgICAgICBlbGVtZW50LnJlbW92ZUNsYXNzKCdjb2xsYXBzaW5nJylcclxuICAgICAgICAgICAgLmFkZENsYXNzKCdjb2xsYXBzZScpXHJcbiAgICAgICAgICAgIC5jc3MoY3NzKTtcclxuICAgICAgICAgIGV4cGFuZGVkRXhwcihzY29wZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBjb2xsYXBzZSgpIHtcclxuICAgICAgICAgIGlmICghZWxlbWVudC5oYXNDbGFzcygnY29sbGFwc2UnKSAmJiAhZWxlbWVudC5oYXNDbGFzcygnaW4nKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gY29sbGFwc2VEb25lKCk7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgJHEucmVzb2x2ZShjb2xsYXBzaW5nRXhwcihzY29wZSkpXHJcbiAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgIGVsZW1lbnRcclxuICAgICAgICAgICAgICAvLyBJTVBPUlRBTlQ6IFRoZSB3aWR0aCBtdXN0IGJlIHNldCBiZWZvcmUgYWRkaW5nIFwiY29sbGFwc2luZ1wiIGNsYXNzLlxyXG4gICAgICAgICAgICAgIC8vIE90aGVyd2lzZSwgdGhlIGJyb3dzZXIgYXR0ZW1wdHMgdG8gYW5pbWF0ZSBmcm9tIHdpZHRoIDAgKGluXHJcbiAgICAgICAgICAgICAgLy8gY29sbGFwc2luZyBjbGFzcykgdG8gdGhlIGdpdmVuIHdpZHRoIGhlcmUuXHJcbiAgICAgICAgICAgICAgICAuY3NzKGdldFNjcm9sbEZyb21FbGVtZW50KGVsZW1lbnRbMF0pKVxyXG4gICAgICAgICAgICAgICAgLy8gaW5pdGlhbGx5IGFsbCBwYW5lbCBjb2xsYXBzZSBoYXZlIHRoZSBjb2xsYXBzZSBjbGFzcywgdGhpcyByZW1vdmFsXHJcbiAgICAgICAgICAgICAgICAvLyBwcmV2ZW50cyB0aGUgYW5pbWF0aW9uIGZyb20ganVtcGluZyB0byBjb2xsYXBzZWQgc3RhdGVcclxuICAgICAgICAgICAgICAgIC5yZW1vdmVDbGFzcygnY29sbGFwc2UnKVxyXG4gICAgICAgICAgICAgICAgLmFkZENsYXNzKCdjb2xsYXBzaW5nJylcclxuICAgICAgICAgICAgICAgIC5hdHRyKCdhcmlhLWV4cGFuZGVkJywgZmFsc2UpXHJcbiAgICAgICAgICAgICAgICAuYXR0cignYXJpYS1oaWRkZW4nLCB0cnVlKTtcclxuXHJcbiAgICAgICAgICAgICAgaWYgKCRhbmltYXRlQ3NzKSB7XHJcbiAgICAgICAgICAgICAgICAkYW5pbWF0ZUNzcyhlbGVtZW50LCB7XHJcbiAgICAgICAgICAgICAgICAgIHJlbW92ZUNsYXNzOiAnaW4nLFxyXG4gICAgICAgICAgICAgICAgICB0bzogY3NzVG9cclxuICAgICAgICAgICAgICAgIH0pLnN0YXJ0KClbJ2ZpbmFsbHknXShjb2xsYXBzZURvbmUpO1xyXG4gICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAkYW5pbWF0ZS5yZW1vdmVDbGFzcyhlbGVtZW50LCAnaW4nLCB7XHJcbiAgICAgICAgICAgICAgICAgIHRvOiBjc3NUb1xyXG4gICAgICAgICAgICAgICAgfSkudGhlbihjb2xsYXBzZURvbmUpO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBjb2xsYXBzZURvbmUoKSB7XHJcbiAgICAgICAgICBlbGVtZW50LmNzcyhjc3NUbyk7IC8vIFJlcXVpcmVkIHNvIHRoYXQgY29sbGFwc2Ugd29ya3Mgd2hlbiBhbmltYXRpb24gaXMgZGlzYWJsZWRcclxuICAgICAgICAgIGVsZW1lbnQucmVtb3ZlQ2xhc3MoJ2NvbGxhcHNpbmcnKVxyXG4gICAgICAgICAgICAuYWRkQ2xhc3MoJ2NvbGxhcHNlJyk7XHJcbiAgICAgICAgICBjb2xsYXBzZWRFeHByKHNjb3BlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHNjb3BlLiR3YXRjaChhdHRycy51aWJDb2xsYXBzZSwgZnVuY3Rpb24oc2hvdWxkQ29sbGFwc2UpIHtcclxuICAgICAgICAgIGlmIChzaG91bGRDb2xsYXBzZSkge1xyXG4gICAgICAgICAgICBjb2xsYXBzZSgpO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgZXhwYW5kKCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgIH07XHJcbiAgfV0pO1xyXG5cclxuYW5ndWxhci5tb2R1bGUoJ3VpLmJvb3RzdHJhcC50YWJpbmRleCcsIFtdKVxyXG5cclxuLmRpcmVjdGl2ZSgndWliVGFiaW5kZXhUb2dnbGUnLCBmdW5jdGlvbigpIHtcclxuICByZXR1cm4ge1xyXG4gICAgcmVzdHJpY3Q6ICdBJyxcclxuICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBlbGVtLCBhdHRycykge1xyXG4gICAgICBhdHRycy4kb2JzZXJ2ZSgnZGlzYWJsZWQnLCBmdW5jdGlvbihkaXNhYmxlZCkge1xyXG4gICAgICAgIGF0dHJzLiRzZXQoJ3RhYmluZGV4JywgZGlzYWJsZWQgPyAtMSA6IG51bGwpO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuICB9O1xyXG59KTtcclxuXHJcbmFuZ3VsYXIubW9kdWxlKCd1aS5ib290c3RyYXAuYWNjb3JkaW9uJywgWyd1aS5ib290c3RyYXAuY29sbGFwc2UnLCAndWkuYm9vdHN0cmFwLnRhYmluZGV4J10pXHJcblxyXG4uY29uc3RhbnQoJ3VpYkFjY29yZGlvbkNvbmZpZycsIHtcclxuICBjbG9zZU90aGVyczogdHJ1ZVxyXG59KVxyXG5cclxuLmNvbnRyb2xsZXIoJ1VpYkFjY29yZGlvbkNvbnRyb2xsZXInLCBbJyRzY29wZScsICckYXR0cnMnLCAndWliQWNjb3JkaW9uQ29uZmlnJywgZnVuY3Rpb24oJHNjb3BlLCAkYXR0cnMsIGFjY29yZGlvbkNvbmZpZykge1xyXG4gIC8vIFRoaXMgYXJyYXkga2VlcHMgdHJhY2sgb2YgdGhlIGFjY29yZGlvbiBncm91cHNcclxuICB0aGlzLmdyb3VwcyA9IFtdO1xyXG5cclxuICAvLyBFbnN1cmUgdGhhdCBhbGwgdGhlIGdyb3VwcyBpbiB0aGlzIGFjY29yZGlvbiBhcmUgY2xvc2VkLCB1bmxlc3MgY2xvc2Utb3RoZXJzIGV4cGxpY2l0bHkgc2F5cyBub3QgdG9cclxuICB0aGlzLmNsb3NlT3RoZXJzID0gZnVuY3Rpb24ob3Blbkdyb3VwKSB7XHJcbiAgICB2YXIgY2xvc2VPdGhlcnMgPSBhbmd1bGFyLmlzRGVmaW5lZCgkYXR0cnMuY2xvc2VPdGhlcnMpID9cclxuICAgICAgJHNjb3BlLiRldmFsKCRhdHRycy5jbG9zZU90aGVycykgOiBhY2NvcmRpb25Db25maWcuY2xvc2VPdGhlcnM7XHJcbiAgICBpZiAoY2xvc2VPdGhlcnMpIHtcclxuICAgICAgYW5ndWxhci5mb3JFYWNoKHRoaXMuZ3JvdXBzLCBmdW5jdGlvbihncm91cCkge1xyXG4gICAgICAgIGlmIChncm91cCAhPT0gb3Blbkdyb3VwKSB7XHJcbiAgICAgICAgICBncm91cC5pc09wZW4gPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIC8vIFRoaXMgaXMgY2FsbGVkIGZyb20gdGhlIGFjY29yZGlvbi1ncm91cCBkaXJlY3RpdmUgdG8gYWRkIGl0c2VsZiB0byB0aGUgYWNjb3JkaW9uXHJcbiAgdGhpcy5hZGRHcm91cCA9IGZ1bmN0aW9uKGdyb3VwU2NvcGUpIHtcclxuICAgIHZhciB0aGF0ID0gdGhpcztcclxuICAgIHRoaXMuZ3JvdXBzLnB1c2goZ3JvdXBTY29wZSk7XHJcblxyXG4gICAgZ3JvdXBTY29wZS4kb24oJyRkZXN0cm95JywgZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgICAgdGhhdC5yZW1vdmVHcm91cChncm91cFNjb3BlKTtcclxuICAgIH0pO1xyXG4gIH07XHJcblxyXG4gIC8vIFRoaXMgaXMgY2FsbGVkIGZyb20gdGhlIGFjY29yZGlvbi1ncm91cCBkaXJlY3RpdmUgd2hlbiB0byByZW1vdmUgaXRzZWxmXHJcbiAgdGhpcy5yZW1vdmVHcm91cCA9IGZ1bmN0aW9uKGdyb3VwKSB7XHJcbiAgICB2YXIgaW5kZXggPSB0aGlzLmdyb3Vwcy5pbmRleE9mKGdyb3VwKTtcclxuICAgIGlmIChpbmRleCAhPT0gLTEpIHtcclxuICAgICAgdGhpcy5ncm91cHMuc3BsaWNlKGluZGV4LCAxKTtcclxuICAgIH1cclxuICB9O1xyXG59XSlcclxuXHJcbi8vIFRoZSBhY2NvcmRpb24gZGlyZWN0aXZlIHNpbXBseSBzZXRzIHVwIHRoZSBkaXJlY3RpdmUgY29udHJvbGxlclxyXG4vLyBhbmQgYWRkcyBhbiBhY2NvcmRpb24gQ1NTIGNsYXNzIHRvIGl0c2VsZiBlbGVtZW50LlxyXG4uZGlyZWN0aXZlKCd1aWJBY2NvcmRpb24nLCBmdW5jdGlvbigpIHtcclxuICByZXR1cm4ge1xyXG4gICAgY29udHJvbGxlcjogJ1VpYkFjY29yZGlvbkNvbnRyb2xsZXInLFxyXG4gICAgY29udHJvbGxlckFzOiAnYWNjb3JkaW9uJyxcclxuICAgIHRyYW5zY2x1ZGU6IHRydWUsXHJcbiAgICB0ZW1wbGF0ZVVybDogZnVuY3Rpb24oZWxlbWVudCwgYXR0cnMpIHtcclxuICAgICAgcmV0dXJuIGF0dHJzLnRlbXBsYXRlVXJsIHx8ICd1aWIvdGVtcGxhdGUvYWNjb3JkaW9uL2FjY29yZGlvbi5odG1sJztcclxuICAgIH1cclxuICB9O1xyXG59KVxyXG5cclxuLy8gVGhlIGFjY29yZGlvbi1ncm91cCBkaXJlY3RpdmUgaW5kaWNhdGVzIGEgYmxvY2sgb2YgaHRtbCB0aGF0IHdpbGwgZXhwYW5kIGFuZCBjb2xsYXBzZSBpbiBhbiBhY2NvcmRpb25cclxuLmRpcmVjdGl2ZSgndWliQWNjb3JkaW9uR3JvdXAnLCBmdW5jdGlvbigpIHtcclxuICByZXR1cm4ge1xyXG4gICAgcmVxdWlyZTogJ151aWJBY2NvcmRpb24nLCAgICAgICAgIC8vIFdlIG5lZWQgdGhpcyBkaXJlY3RpdmUgdG8gYmUgaW5zaWRlIGFuIGFjY29yZGlvblxyXG4gICAgdHJhbnNjbHVkZTogdHJ1ZSwgICAgICAgICAgICAgIC8vIEl0IHRyYW5zY2x1ZGVzIHRoZSBjb250ZW50cyBvZiB0aGUgZGlyZWN0aXZlIGludG8gdGhlIHRlbXBsYXRlXHJcbiAgICByZXN0cmljdDogJ0EnLFxyXG4gICAgdGVtcGxhdGVVcmw6IGZ1bmN0aW9uKGVsZW1lbnQsIGF0dHJzKSB7XHJcbiAgICAgIHJldHVybiBhdHRycy50ZW1wbGF0ZVVybCB8fCAndWliL3RlbXBsYXRlL2FjY29yZGlvbi9hY2NvcmRpb24tZ3JvdXAuaHRtbCc7XHJcbiAgICB9LFxyXG4gICAgc2NvcGU6IHtcclxuICAgICAgaGVhZGluZzogJ0AnLCAgICAgICAgICAgICAgIC8vIEludGVycG9sYXRlIHRoZSBoZWFkaW5nIGF0dHJpYnV0ZSBvbnRvIHRoaXMgc2NvcGVcclxuICAgICAgcGFuZWxDbGFzczogJ0A/JywgICAgICAgICAgIC8vIERpdHRvIHdpdGggcGFuZWxDbGFzc1xyXG4gICAgICBpc09wZW46ICc9PycsXHJcbiAgICAgIGlzRGlzYWJsZWQ6ICc9PydcclxuICAgIH0sXHJcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbigpIHtcclxuICAgICAgdGhpcy5zZXRIZWFkaW5nID0gZnVuY3Rpb24oZWxlbWVudCkge1xyXG4gICAgICAgIHRoaXMuaGVhZGluZyA9IGVsZW1lbnQ7XHJcbiAgICAgIH07XHJcbiAgICB9LFxyXG4gICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCBhY2NvcmRpb25DdHJsKSB7XHJcbiAgICAgIGVsZW1lbnQuYWRkQ2xhc3MoJ3BhbmVsJyk7XHJcbiAgICAgIGFjY29yZGlvbkN0cmwuYWRkR3JvdXAoc2NvcGUpO1xyXG5cclxuICAgICAgc2NvcGUub3BlbkNsYXNzID0gYXR0cnMub3BlbkNsYXNzIHx8ICdwYW5lbC1vcGVuJztcclxuICAgICAgc2NvcGUucGFuZWxDbGFzcyA9IGF0dHJzLnBhbmVsQ2xhc3MgfHwgJ3BhbmVsLWRlZmF1bHQnO1xyXG4gICAgICBzY29wZS4kd2F0Y2goJ2lzT3BlbicsIGZ1bmN0aW9uKHZhbHVlKSB7XHJcbiAgICAgICAgZWxlbWVudC50b2dnbGVDbGFzcyhzY29wZS5vcGVuQ2xhc3MsICEhdmFsdWUpO1xyXG4gICAgICAgIGlmICh2YWx1ZSkge1xyXG4gICAgICAgICAgYWNjb3JkaW9uQ3RybC5jbG9zZU90aGVycyhzY29wZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIHNjb3BlLnRvZ2dsZU9wZW4gPSBmdW5jdGlvbigkZXZlbnQpIHtcclxuICAgICAgICBpZiAoIXNjb3BlLmlzRGlzYWJsZWQpIHtcclxuICAgICAgICAgIGlmICghJGV2ZW50IHx8ICRldmVudC53aGljaCA9PT0gMzIpIHtcclxuICAgICAgICAgICAgc2NvcGUuaXNPcGVuID0gIXNjb3BlLmlzT3BlbjtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH07XHJcblxyXG4gICAgICB2YXIgaWQgPSAnYWNjb3JkaW9uZ3JvdXAtJyArIHNjb3BlLiRpZCArICctJyArIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDEwMDAwKTtcclxuICAgICAgc2NvcGUuaGVhZGluZ0lkID0gaWQgKyAnLXRhYic7XHJcbiAgICAgIHNjb3BlLnBhbmVsSWQgPSBpZCArICctcGFuZWwnO1xyXG4gICAgfVxyXG4gIH07XHJcbn0pXHJcblxyXG4vLyBVc2UgYWNjb3JkaW9uLWhlYWRpbmcgYmVsb3cgYW4gYWNjb3JkaW9uLWdyb3VwIHRvIHByb3ZpZGUgYSBoZWFkaW5nIGNvbnRhaW5pbmcgSFRNTFxyXG4uZGlyZWN0aXZlKCd1aWJBY2NvcmRpb25IZWFkaW5nJywgZnVuY3Rpb24oKSB7XHJcbiAgcmV0dXJuIHtcclxuICAgIHRyYW5zY2x1ZGU6IHRydWUsICAgLy8gR3JhYiB0aGUgY29udGVudHMgdG8gYmUgdXNlZCBhcyB0aGUgaGVhZGluZ1xyXG4gICAgdGVtcGxhdGU6ICcnLCAgICAgICAvLyBJbiBlZmZlY3QgcmVtb3ZlIHRoaXMgZWxlbWVudCFcclxuICAgIHJlcGxhY2U6IHRydWUsXHJcbiAgICByZXF1aXJlOiAnXnVpYkFjY29yZGlvbkdyb3VwJyxcclxuICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBlbGVtZW50LCBhdHRycywgYWNjb3JkaW9uR3JvdXBDdHJsLCB0cmFuc2NsdWRlKSB7XHJcbiAgICAgIC8vIFBhc3MgdGhlIGhlYWRpbmcgdG8gdGhlIGFjY29yZGlvbi1ncm91cCBjb250cm9sbGVyXHJcbiAgICAgIC8vIHNvIHRoYXQgaXQgY2FuIGJlIHRyYW5zY2x1ZGVkIGludG8gdGhlIHJpZ2h0IHBsYWNlIGluIHRoZSB0ZW1wbGF0ZVxyXG4gICAgICAvLyBbVGhlIHNlY29uZCBwYXJhbWV0ZXIgdG8gdHJhbnNjbHVkZSBjYXVzZXMgdGhlIGVsZW1lbnRzIHRvIGJlIGNsb25lZCBzbyB0aGF0IHRoZXkgd29yayBpbiBuZy1yZXBlYXRdXHJcbiAgICAgIGFjY29yZGlvbkdyb3VwQ3RybC5zZXRIZWFkaW5nKHRyYW5zY2x1ZGUoc2NvcGUsIGFuZ3VsYXIubm9vcCkpO1xyXG4gICAgfVxyXG4gIH07XHJcbn0pXHJcblxyXG4vLyBVc2UgaW4gdGhlIGFjY29yZGlvbi1ncm91cCB0ZW1wbGF0ZSB0byBpbmRpY2F0ZSB3aGVyZSB5b3Ugd2FudCB0aGUgaGVhZGluZyB0byBiZSB0cmFuc2NsdWRlZFxyXG4vLyBZb3UgbXVzdCBwcm92aWRlIHRoZSBwcm9wZXJ0eSBvbiB0aGUgYWNjb3JkaW9uLWdyb3VwIGNvbnRyb2xsZXIgdGhhdCB3aWxsIGhvbGQgdGhlIHRyYW5zY2x1ZGVkIGVsZW1lbnRcclxuLmRpcmVjdGl2ZSgndWliQWNjb3JkaW9uVHJhbnNjbHVkZScsIGZ1bmN0aW9uKCkge1xyXG4gIHJldHVybiB7XHJcbiAgICByZXF1aXJlOiAnXnVpYkFjY29yZGlvbkdyb3VwJyxcclxuICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBlbGVtZW50LCBhdHRycywgY29udHJvbGxlcikge1xyXG4gICAgICBzY29wZS4kd2F0Y2goZnVuY3Rpb24oKSB7IHJldHVybiBjb250cm9sbGVyW2F0dHJzLnVpYkFjY29yZGlvblRyYW5zY2x1ZGVdOyB9LCBmdW5jdGlvbihoZWFkaW5nKSB7XHJcbiAgICAgICAgaWYgKGhlYWRpbmcpIHtcclxuICAgICAgICAgIHZhciBlbGVtID0gYW5ndWxhci5lbGVtZW50KGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcihnZXRIZWFkZXJTZWxlY3RvcnMoKSkpO1xyXG4gICAgICAgICAgZWxlbS5odG1sKCcnKTtcclxuICAgICAgICAgIGVsZW0uYXBwZW5kKGhlYWRpbmcpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgZnVuY3Rpb24gZ2V0SGVhZGVyU2VsZWN0b3JzKCkge1xyXG4gICAgICByZXR1cm4gJ3VpYi1hY2NvcmRpb24taGVhZGVyLCcgK1xyXG4gICAgICAgICAgJ2RhdGEtdWliLWFjY29yZGlvbi1oZWFkZXIsJyArXHJcbiAgICAgICAgICAneC11aWItYWNjb3JkaW9uLWhlYWRlciwnICtcclxuICAgICAgICAgICd1aWJcXFxcOmFjY29yZGlvbi1oZWFkZXIsJyArXHJcbiAgICAgICAgICAnW3VpYi1hY2NvcmRpb24taGVhZGVyXSwnICtcclxuICAgICAgICAgICdbZGF0YS11aWItYWNjb3JkaW9uLWhlYWRlcl0sJyArXHJcbiAgICAgICAgICAnW3gtdWliLWFjY29yZGlvbi1oZWFkZXJdJztcclxuICB9XHJcbn0pO1xyXG5cclxuYW5ndWxhci5tb2R1bGUoJ3VpLmJvb3RzdHJhcC5hbGVydCcsIFtdKVxyXG5cclxuLmNvbnRyb2xsZXIoJ1VpYkFsZXJ0Q29udHJvbGxlcicsIFsnJHNjb3BlJywgJyRlbGVtZW50JywgJyRhdHRycycsICckaW50ZXJwb2xhdGUnLCAnJHRpbWVvdXQnLCBmdW5jdGlvbigkc2NvcGUsICRlbGVtZW50LCAkYXR0cnMsICRpbnRlcnBvbGF0ZSwgJHRpbWVvdXQpIHtcclxuICAkc2NvcGUuY2xvc2VhYmxlID0gISEkYXR0cnMuY2xvc2U7XHJcbiAgJGVsZW1lbnQuYWRkQ2xhc3MoJ2FsZXJ0Jyk7XHJcbiAgJGF0dHJzLiRzZXQoJ3JvbGUnLCAnYWxlcnQnKTtcclxuICBpZiAoJHNjb3BlLmNsb3NlYWJsZSkge1xyXG4gICAgJGVsZW1lbnQuYWRkQ2xhc3MoJ2FsZXJ0LWRpc21pc3NpYmxlJyk7XHJcbiAgfVxyXG5cclxuICB2YXIgZGlzbWlzc09uVGltZW91dCA9IGFuZ3VsYXIuaXNEZWZpbmVkKCRhdHRycy5kaXNtaXNzT25UaW1lb3V0KSA/XHJcbiAgICAkaW50ZXJwb2xhdGUoJGF0dHJzLmRpc21pc3NPblRpbWVvdXQpKCRzY29wZS4kcGFyZW50KSA6IG51bGw7XHJcblxyXG4gIGlmIChkaXNtaXNzT25UaW1lb3V0KSB7XHJcbiAgICAkdGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgJHNjb3BlLmNsb3NlKCk7XHJcbiAgICB9LCBwYXJzZUludChkaXNtaXNzT25UaW1lb3V0LCAxMCkpO1xyXG4gIH1cclxufV0pXHJcblxyXG4uZGlyZWN0aXZlKCd1aWJBbGVydCcsIGZ1bmN0aW9uKCkge1xyXG4gIHJldHVybiB7XHJcbiAgICBjb250cm9sbGVyOiAnVWliQWxlcnRDb250cm9sbGVyJyxcclxuICAgIGNvbnRyb2xsZXJBczogJ2FsZXJ0JyxcclxuICAgIHJlc3RyaWN0OiAnQScsXHJcbiAgICB0ZW1wbGF0ZVVybDogZnVuY3Rpb24oZWxlbWVudCwgYXR0cnMpIHtcclxuICAgICAgcmV0dXJuIGF0dHJzLnRlbXBsYXRlVXJsIHx8ICd1aWIvdGVtcGxhdGUvYWxlcnQvYWxlcnQuaHRtbCc7XHJcbiAgICB9LFxyXG4gICAgdHJhbnNjbHVkZTogdHJ1ZSxcclxuICAgIHNjb3BlOiB7XHJcbiAgICAgIGNsb3NlOiAnJidcclxuICAgIH1cclxuICB9O1xyXG59KTtcclxuXHJcbmFuZ3VsYXIubW9kdWxlKCd1aS5ib290c3RyYXAuYnV0dG9ucycsIFtdKVxyXG5cclxuLmNvbnN0YW50KCd1aWJCdXR0b25Db25maWcnLCB7XHJcbiAgYWN0aXZlQ2xhc3M6ICdhY3RpdmUnLFxyXG4gIHRvZ2dsZUV2ZW50OiAnY2xpY2snXHJcbn0pXHJcblxyXG4uY29udHJvbGxlcignVWliQnV0dG9uc0NvbnRyb2xsZXInLCBbJ3VpYkJ1dHRvbkNvbmZpZycsIGZ1bmN0aW9uKGJ1dHRvbkNvbmZpZykge1xyXG4gIHRoaXMuYWN0aXZlQ2xhc3MgPSBidXR0b25Db25maWcuYWN0aXZlQ2xhc3MgfHwgJ2FjdGl2ZSc7XHJcbiAgdGhpcy50b2dnbGVFdmVudCA9IGJ1dHRvbkNvbmZpZy50b2dnbGVFdmVudCB8fCAnY2xpY2snO1xyXG59XSlcclxuXHJcbi5kaXJlY3RpdmUoJ3VpYkJ0blJhZGlvJywgWyckcGFyc2UnLCBmdW5jdGlvbigkcGFyc2UpIHtcclxuICByZXR1cm4ge1xyXG4gICAgcmVxdWlyZTogWyd1aWJCdG5SYWRpbycsICduZ01vZGVsJ10sXHJcbiAgICBjb250cm9sbGVyOiAnVWliQnV0dG9uc0NvbnRyb2xsZXInLFxyXG4gICAgY29udHJvbGxlckFzOiAnYnV0dG9ucycsXHJcbiAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxlbWVudCwgYXR0cnMsIGN0cmxzKSB7XHJcbiAgICAgIHZhciBidXR0b25zQ3RybCA9IGN0cmxzWzBdLCBuZ01vZGVsQ3RybCA9IGN0cmxzWzFdO1xyXG4gICAgICB2YXIgdW5jaGVja2FibGVFeHByID0gJHBhcnNlKGF0dHJzLnVpYlVuY2hlY2thYmxlKTtcclxuXHJcbiAgICAgIGVsZW1lbnQuZmluZCgnaW5wdXQnKS5jc3Moe2Rpc3BsYXk6ICdub25lJ30pO1xyXG5cclxuICAgICAgLy9tb2RlbCAtPiBVSVxyXG4gICAgICBuZ01vZGVsQ3RybC4kcmVuZGVyID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgZWxlbWVudC50b2dnbGVDbGFzcyhidXR0b25zQ3RybC5hY3RpdmVDbGFzcywgYW5ndWxhci5lcXVhbHMobmdNb2RlbEN0cmwuJG1vZGVsVmFsdWUsIHNjb3BlLiRldmFsKGF0dHJzLnVpYkJ0blJhZGlvKSkpO1xyXG4gICAgICB9O1xyXG5cclxuICAgICAgLy91aS0+bW9kZWxcclxuICAgICAgZWxlbWVudC5vbihidXR0b25zQ3RybC50b2dnbGVFdmVudCwgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgaWYgKGF0dHJzLmRpc2FibGVkKSB7XHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2YXIgaXNBY3RpdmUgPSBlbGVtZW50Lmhhc0NsYXNzKGJ1dHRvbnNDdHJsLmFjdGl2ZUNsYXNzKTtcclxuXHJcbiAgICAgICAgaWYgKCFpc0FjdGl2ZSB8fCBhbmd1bGFyLmlzRGVmaW5lZChhdHRycy51bmNoZWNrYWJsZSkpIHtcclxuICAgICAgICAgIHNjb3BlLiRhcHBseShmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgbmdNb2RlbEN0cmwuJHNldFZpZXdWYWx1ZShpc0FjdGl2ZSA/IG51bGwgOiBzY29wZS4kZXZhbChhdHRycy51aWJCdG5SYWRpbykpO1xyXG4gICAgICAgICAgICBuZ01vZGVsQ3RybC4kcmVuZGVyKCk7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgaWYgKGF0dHJzLnVpYlVuY2hlY2thYmxlKSB7XHJcbiAgICAgICAgc2NvcGUuJHdhdGNoKHVuY2hlY2thYmxlRXhwciwgZnVuY3Rpb24odW5jaGVja2FibGUpIHtcclxuICAgICAgICAgIGF0dHJzLiRzZXQoJ3VuY2hlY2thYmxlJywgdW5jaGVja2FibGUgPyAnJyA6IHVuZGVmaW5lZCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9O1xyXG59XSlcclxuXHJcbi5kaXJlY3RpdmUoJ3VpYkJ0bkNoZWNrYm94JywgZnVuY3Rpb24oKSB7XHJcbiAgcmV0dXJuIHtcclxuICAgIHJlcXVpcmU6IFsndWliQnRuQ2hlY2tib3gnLCAnbmdNb2RlbCddLFxyXG4gICAgY29udHJvbGxlcjogJ1VpYkJ1dHRvbnNDb250cm9sbGVyJyxcclxuICAgIGNvbnRyb2xsZXJBczogJ2J1dHRvbicsXHJcbiAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxlbWVudCwgYXR0cnMsIGN0cmxzKSB7XHJcbiAgICAgIHZhciBidXR0b25zQ3RybCA9IGN0cmxzWzBdLCBuZ01vZGVsQ3RybCA9IGN0cmxzWzFdO1xyXG5cclxuICAgICAgZWxlbWVudC5maW5kKCdpbnB1dCcpLmNzcyh7ZGlzcGxheTogJ25vbmUnfSk7XHJcblxyXG4gICAgICBmdW5jdGlvbiBnZXRUcnVlVmFsdWUoKSB7XHJcbiAgICAgICAgcmV0dXJuIGdldENoZWNrYm94VmFsdWUoYXR0cnMuYnRuQ2hlY2tib3hUcnVlLCB0cnVlKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgZnVuY3Rpb24gZ2V0RmFsc2VWYWx1ZSgpIHtcclxuICAgICAgICByZXR1cm4gZ2V0Q2hlY2tib3hWYWx1ZShhdHRycy5idG5DaGVja2JveEZhbHNlLCBmYWxzZSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGZ1bmN0aW9uIGdldENoZWNrYm94VmFsdWUoYXR0cmlidXRlLCBkZWZhdWx0VmFsdWUpIHtcclxuICAgICAgICByZXR1cm4gYW5ndWxhci5pc0RlZmluZWQoYXR0cmlidXRlKSA/IHNjb3BlLiRldmFsKGF0dHJpYnV0ZSkgOiBkZWZhdWx0VmFsdWU7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vbW9kZWwgLT4gVUlcclxuICAgICAgbmdNb2RlbEN0cmwuJHJlbmRlciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGVsZW1lbnQudG9nZ2xlQ2xhc3MoYnV0dG9uc0N0cmwuYWN0aXZlQ2xhc3MsIGFuZ3VsYXIuZXF1YWxzKG5nTW9kZWxDdHJsLiRtb2RlbFZhbHVlLCBnZXRUcnVlVmFsdWUoKSkpO1xyXG4gICAgICB9O1xyXG5cclxuICAgICAgLy91aS0+bW9kZWxcclxuICAgICAgZWxlbWVudC5vbihidXR0b25zQ3RybC50b2dnbGVFdmVudCwgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgaWYgKGF0dHJzLmRpc2FibGVkKSB7XHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBzY29wZS4kYXBwbHkoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICBuZ01vZGVsQ3RybC4kc2V0Vmlld1ZhbHVlKGVsZW1lbnQuaGFzQ2xhc3MoYnV0dG9uc0N0cmwuYWN0aXZlQ2xhc3MpID8gZ2V0RmFsc2VWYWx1ZSgpIDogZ2V0VHJ1ZVZhbHVlKCkpO1xyXG4gICAgICAgICAgbmdNb2RlbEN0cmwuJHJlbmRlcigpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuICB9O1xyXG59KTtcclxuXHJcbmFuZ3VsYXIubW9kdWxlKCd1aS5ib290c3RyYXAuY2Fyb3VzZWwnLCBbXSlcclxuXHJcbi5jb250cm9sbGVyKCdVaWJDYXJvdXNlbENvbnRyb2xsZXInLCBbJyRzY29wZScsICckZWxlbWVudCcsICckaW50ZXJ2YWwnLCAnJHRpbWVvdXQnLCAnJGFuaW1hdGUnLCBmdW5jdGlvbigkc2NvcGUsICRlbGVtZW50LCAkaW50ZXJ2YWwsICR0aW1lb3V0LCAkYW5pbWF0ZSkge1xyXG4gIHZhciBzZWxmID0gdGhpcyxcclxuICAgIHNsaWRlcyA9IHNlbGYuc2xpZGVzID0gJHNjb3BlLnNsaWRlcyA9IFtdLFxyXG4gICAgU0xJREVfRElSRUNUSU9OID0gJ3VpYi1zbGlkZURpcmVjdGlvbicsXHJcbiAgICBjdXJyZW50SW5kZXggPSAkc2NvcGUuYWN0aXZlLFxyXG4gICAgY3VycmVudEludGVydmFsLCBpc1BsYXlpbmcsIGJ1ZmZlcmVkVHJhbnNpdGlvbnMgPSBbXTtcclxuXHJcbiAgdmFyIGRlc3Ryb3llZCA9IGZhbHNlO1xyXG4gICRlbGVtZW50LmFkZENsYXNzKCdjYXJvdXNlbCcpO1xyXG5cclxuICBzZWxmLmFkZFNsaWRlID0gZnVuY3Rpb24oc2xpZGUsIGVsZW1lbnQpIHtcclxuICAgIHNsaWRlcy5wdXNoKHtcclxuICAgICAgc2xpZGU6IHNsaWRlLFxyXG4gICAgICBlbGVtZW50OiBlbGVtZW50XHJcbiAgICB9KTtcclxuICAgIHNsaWRlcy5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcclxuICAgICAgcmV0dXJuICthLnNsaWRlLmluZGV4IC0gK2Iuc2xpZGUuaW5kZXg7XHJcbiAgICB9KTtcclxuICAgIC8vaWYgdGhpcyBpcyB0aGUgZmlyc3Qgc2xpZGUgb3IgdGhlIHNsaWRlIGlzIHNldCB0byBhY3RpdmUsIHNlbGVjdCBpdFxyXG4gICAgaWYgKHNsaWRlLmluZGV4ID09PSAkc2NvcGUuYWN0aXZlIHx8IHNsaWRlcy5sZW5ndGggPT09IDEgJiYgIWFuZ3VsYXIuaXNOdW1iZXIoJHNjb3BlLmFjdGl2ZSkpIHtcclxuICAgICAgaWYgKCRzY29wZS4kY3VycmVudFRyYW5zaXRpb24pIHtcclxuICAgICAgICAkc2NvcGUuJGN1cnJlbnRUcmFuc2l0aW9uID0gbnVsbDtcclxuICAgICAgfVxyXG5cclxuICAgICAgY3VycmVudEluZGV4ID0gc2xpZGUuaW5kZXg7XHJcbiAgICAgICRzY29wZS5hY3RpdmUgPSBzbGlkZS5pbmRleDtcclxuICAgICAgc2V0QWN0aXZlKGN1cnJlbnRJbmRleCk7XHJcbiAgICAgIHNlbGYuc2VsZWN0KHNsaWRlc1tmaW5kU2xpZGVJbmRleChzbGlkZSldKTtcclxuICAgICAgaWYgKHNsaWRlcy5sZW5ndGggPT09IDEpIHtcclxuICAgICAgICAkc2NvcGUucGxheSgpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgc2VsZi5nZXRDdXJyZW50SW5kZXggPSBmdW5jdGlvbigpIHtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc2xpZGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIGlmIChzbGlkZXNbaV0uc2xpZGUuaW5kZXggPT09IGN1cnJlbnRJbmRleCkge1xyXG4gICAgICAgIHJldHVybiBpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgc2VsZi5uZXh0ID0gJHNjb3BlLm5leHQgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBuZXdJbmRleCA9IChzZWxmLmdldEN1cnJlbnRJbmRleCgpICsgMSkgJSBzbGlkZXMubGVuZ3RoO1xyXG5cclxuICAgIGlmIChuZXdJbmRleCA9PT0gMCAmJiAkc2NvcGUubm9XcmFwKCkpIHtcclxuICAgICAgJHNjb3BlLnBhdXNlKCk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gc2VsZi5zZWxlY3Qoc2xpZGVzW25ld0luZGV4XSwgJ25leHQnKTtcclxuICB9O1xyXG5cclxuICBzZWxmLnByZXYgPSAkc2NvcGUucHJldiA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIG5ld0luZGV4ID0gc2VsZi5nZXRDdXJyZW50SW5kZXgoKSAtIDEgPCAwID8gc2xpZGVzLmxlbmd0aCAtIDEgOiBzZWxmLmdldEN1cnJlbnRJbmRleCgpIC0gMTtcclxuXHJcbiAgICBpZiAoJHNjb3BlLm5vV3JhcCgpICYmIG5ld0luZGV4ID09PSBzbGlkZXMubGVuZ3RoIC0gMSkge1xyXG4gICAgICAkc2NvcGUucGF1c2UoKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBzZWxmLnNlbGVjdChzbGlkZXNbbmV3SW5kZXhdLCAncHJldicpO1xyXG4gIH07XHJcblxyXG4gIHNlbGYucmVtb3ZlU2xpZGUgPSBmdW5jdGlvbihzbGlkZSkge1xyXG4gICAgdmFyIGluZGV4ID0gZmluZFNsaWRlSW5kZXgoc2xpZGUpO1xyXG5cclxuICAgIHZhciBidWZmZXJlZEluZGV4ID0gYnVmZmVyZWRUcmFuc2l0aW9ucy5pbmRleE9mKHNsaWRlc1tpbmRleF0pO1xyXG4gICAgaWYgKGJ1ZmZlcmVkSW5kZXggIT09IC0xKSB7XHJcbiAgICAgIGJ1ZmZlcmVkVHJhbnNpdGlvbnMuc3BsaWNlKGJ1ZmZlcmVkSW5kZXgsIDEpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vZ2V0IHRoZSBpbmRleCBvZiB0aGUgc2xpZGUgaW5zaWRlIHRoZSBjYXJvdXNlbFxyXG4gICAgc2xpZGVzLnNwbGljZShpbmRleCwgMSk7XHJcbiAgICBpZiAoc2xpZGVzLmxlbmd0aCA+IDAgJiYgY3VycmVudEluZGV4ID09PSBpbmRleCkge1xyXG4gICAgICBpZiAoaW5kZXggPj0gc2xpZGVzLmxlbmd0aCkge1xyXG4gICAgICAgIGN1cnJlbnRJbmRleCA9IHNsaWRlcy5sZW5ndGggLSAxO1xyXG4gICAgICAgICRzY29wZS5hY3RpdmUgPSBjdXJyZW50SW5kZXg7XHJcbiAgICAgICAgc2V0QWN0aXZlKGN1cnJlbnRJbmRleCk7XHJcbiAgICAgICAgc2VsZi5zZWxlY3Qoc2xpZGVzW3NsaWRlcy5sZW5ndGggLSAxXSk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgY3VycmVudEluZGV4ID0gaW5kZXg7XHJcbiAgICAgICAgJHNjb3BlLmFjdGl2ZSA9IGN1cnJlbnRJbmRleDtcclxuICAgICAgICBzZXRBY3RpdmUoY3VycmVudEluZGV4KTtcclxuICAgICAgICBzZWxmLnNlbGVjdChzbGlkZXNbaW5kZXhdKTtcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIGlmIChjdXJyZW50SW5kZXggPiBpbmRleCkge1xyXG4gICAgICBjdXJyZW50SW5kZXgtLTtcclxuICAgICAgJHNjb3BlLmFjdGl2ZSA9IGN1cnJlbnRJbmRleDtcclxuICAgIH1cclxuXHJcbiAgICAvL2NsZWFuIHRoZSBhY3RpdmUgdmFsdWUgd2hlbiBubyBtb3JlIHNsaWRlXHJcbiAgICBpZiAoc2xpZGVzLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICBjdXJyZW50SW5kZXggPSBudWxsO1xyXG4gICAgICAkc2NvcGUuYWN0aXZlID0gbnVsbDtcclxuICAgICAgY2xlYXJCdWZmZXJlZFRyYW5zaXRpb25zKCk7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgLyogZGlyZWN0aW9uOiBcInByZXZcIiBvciBcIm5leHRcIiAqL1xyXG4gIHNlbGYuc2VsZWN0ID0gJHNjb3BlLnNlbGVjdCA9IGZ1bmN0aW9uKG5leHRTbGlkZSwgZGlyZWN0aW9uKSB7XHJcbiAgICB2YXIgbmV4dEluZGV4ID0gZmluZFNsaWRlSW5kZXgobmV4dFNsaWRlLnNsaWRlKTtcclxuICAgIC8vRGVjaWRlIGRpcmVjdGlvbiBpZiBpdCdzIG5vdCBnaXZlblxyXG4gICAgaWYgKGRpcmVjdGlvbiA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgIGRpcmVjdGlvbiA9IG5leHRJbmRleCA+IHNlbGYuZ2V0Q3VycmVudEluZGV4KCkgPyAnbmV4dCcgOiAncHJldic7XHJcbiAgICB9XHJcbiAgICAvL1ByZXZlbnQgdGhpcyB1c2VyLXRyaWdnZXJlZCB0cmFuc2l0aW9uIGZyb20gb2NjdXJyaW5nIGlmIHRoZXJlIGlzIGFscmVhZHkgb25lIGluIHByb2dyZXNzXHJcbiAgICBpZiAobmV4dFNsaWRlLnNsaWRlLmluZGV4ICE9PSBjdXJyZW50SW5kZXggJiZcclxuICAgICAgISRzY29wZS4kY3VycmVudFRyYW5zaXRpb24pIHtcclxuICAgICAgZ29OZXh0KG5leHRTbGlkZS5zbGlkZSwgbmV4dEluZGV4LCBkaXJlY3Rpb24pO1xyXG4gICAgfSBlbHNlIGlmIChuZXh0U2xpZGUgJiYgbmV4dFNsaWRlLnNsaWRlLmluZGV4ICE9PSBjdXJyZW50SW5kZXggJiYgJHNjb3BlLiRjdXJyZW50VHJhbnNpdGlvbikge1xyXG4gICAgICBidWZmZXJlZFRyYW5zaXRpb25zLnB1c2goc2xpZGVzW25leHRJbmRleF0pO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIC8qIEFsbG93IG91dHNpZGUgcGVvcGxlIHRvIGNhbGwgaW5kZXhPZiBvbiBzbGlkZXMgYXJyYXkgKi9cclxuICAkc2NvcGUuaW5kZXhPZlNsaWRlID0gZnVuY3Rpb24oc2xpZGUpIHtcclxuICAgIHJldHVybiArc2xpZGUuc2xpZGUuaW5kZXg7XHJcbiAgfTtcclxuXHJcbiAgJHNjb3BlLmlzQWN0aXZlID0gZnVuY3Rpb24oc2xpZGUpIHtcclxuICAgIHJldHVybiAkc2NvcGUuYWN0aXZlID09PSBzbGlkZS5zbGlkZS5pbmRleDtcclxuICB9O1xyXG5cclxuICAkc2NvcGUuaXNQcmV2RGlzYWJsZWQgPSBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiAkc2NvcGUuYWN0aXZlID09PSAwICYmICRzY29wZS5ub1dyYXAoKTtcclxuICB9O1xyXG5cclxuICAkc2NvcGUuaXNOZXh0RGlzYWJsZWQgPSBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiAkc2NvcGUuYWN0aXZlID09PSBzbGlkZXMubGVuZ3RoIC0gMSAmJiAkc2NvcGUubm9XcmFwKCk7XHJcbiAgfTtcclxuXHJcbiAgJHNjb3BlLnBhdXNlID0gZnVuY3Rpb24oKSB7XHJcbiAgICBpZiAoISRzY29wZS5ub1BhdXNlKSB7XHJcbiAgICAgIGlzUGxheWluZyA9IGZhbHNlO1xyXG4gICAgICByZXNldFRpbWVyKCk7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgJHNjb3BlLnBsYXkgPSBmdW5jdGlvbigpIHtcclxuICAgIGlmICghaXNQbGF5aW5nKSB7XHJcbiAgICAgIGlzUGxheWluZyA9IHRydWU7XHJcbiAgICAgIHJlc3RhcnRUaW1lcigpO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gICRlbGVtZW50Lm9uKCdtb3VzZWVudGVyJywgJHNjb3BlLnBhdXNlKTtcclxuICAkZWxlbWVudC5vbignbW91c2VsZWF2ZScsICRzY29wZS5wbGF5KTtcclxuXHJcbiAgJHNjb3BlLiRvbignJGRlc3Ryb3knLCBmdW5jdGlvbigpIHtcclxuICAgIGRlc3Ryb3llZCA9IHRydWU7XHJcbiAgICByZXNldFRpbWVyKCk7XHJcbiAgfSk7XHJcblxyXG4gICRzY29wZS4kd2F0Y2goJ25vVHJhbnNpdGlvbicsIGZ1bmN0aW9uKG5vVHJhbnNpdGlvbikge1xyXG4gICAgJGFuaW1hdGUuZW5hYmxlZCgkZWxlbWVudCwgIW5vVHJhbnNpdGlvbik7XHJcbiAgfSk7XHJcblxyXG4gICRzY29wZS4kd2F0Y2goJ2ludGVydmFsJywgcmVzdGFydFRpbWVyKTtcclxuXHJcbiAgJHNjb3BlLiR3YXRjaENvbGxlY3Rpb24oJ3NsaWRlcycsIHJlc2V0VHJhbnNpdGlvbik7XHJcblxyXG4gICRzY29wZS4kd2F0Y2goJ2FjdGl2ZScsIGZ1bmN0aW9uKGluZGV4KSB7XHJcbiAgICBpZiAoYW5ndWxhci5pc051bWJlcihpbmRleCkgJiYgY3VycmVudEluZGV4ICE9PSBpbmRleCkge1xyXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNsaWRlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGlmIChzbGlkZXNbaV0uc2xpZGUuaW5kZXggPT09IGluZGV4KSB7XHJcbiAgICAgICAgICBpbmRleCA9IGk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHZhciBzbGlkZSA9IHNsaWRlc1tpbmRleF07XHJcbiAgICAgIGlmIChzbGlkZSkge1xyXG4gICAgICAgIHNldEFjdGl2ZShpbmRleCk7XHJcbiAgICAgICAgc2VsZi5zZWxlY3Qoc2xpZGVzW2luZGV4XSk7XHJcbiAgICAgICAgY3VycmVudEluZGV4ID0gaW5kZXg7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9KTtcclxuXHJcbiAgZnVuY3Rpb24gY2xlYXJCdWZmZXJlZFRyYW5zaXRpb25zKCkge1xyXG4gICAgd2hpbGUgKGJ1ZmZlcmVkVHJhbnNpdGlvbnMubGVuZ3RoKSB7XHJcbiAgICAgIGJ1ZmZlcmVkVHJhbnNpdGlvbnMuc2hpZnQoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGdldFNsaWRlQnlJbmRleChpbmRleCkge1xyXG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSBzbGlkZXMubGVuZ3RoOyBpIDwgbDsgKytpKSB7XHJcbiAgICAgIGlmIChzbGlkZXNbaV0uaW5kZXggPT09IGluZGV4KSB7XHJcbiAgICAgICAgcmV0dXJuIHNsaWRlc1tpXTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gc2V0QWN0aXZlKGluZGV4KSB7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNsaWRlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICBzbGlkZXNbaV0uc2xpZGUuYWN0aXZlID0gaSA9PT0gaW5kZXg7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBnb05leHQoc2xpZGUsIGluZGV4LCBkaXJlY3Rpb24pIHtcclxuICAgIGlmIChkZXN0cm95ZWQpIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGFuZ3VsYXIuZXh0ZW5kKHNsaWRlLCB7ZGlyZWN0aW9uOiBkaXJlY3Rpb259KTtcclxuICAgIGFuZ3VsYXIuZXh0ZW5kKHNsaWRlc1tjdXJyZW50SW5kZXhdLnNsaWRlIHx8IHt9LCB7ZGlyZWN0aW9uOiBkaXJlY3Rpb259KTtcclxuICAgIGlmICgkYW5pbWF0ZS5lbmFibGVkKCRlbGVtZW50KSAmJiAhJHNjb3BlLiRjdXJyZW50VHJhbnNpdGlvbiAmJlxyXG4gICAgICBzbGlkZXNbaW5kZXhdLmVsZW1lbnQgJiYgc2VsZi5zbGlkZXMubGVuZ3RoID4gMSkge1xyXG4gICAgICBzbGlkZXNbaW5kZXhdLmVsZW1lbnQuZGF0YShTTElERV9ESVJFQ1RJT04sIHNsaWRlLmRpcmVjdGlvbik7XHJcbiAgICAgIHZhciBjdXJyZW50SWR4ID0gc2VsZi5nZXRDdXJyZW50SW5kZXgoKTtcclxuXHJcbiAgICAgIGlmIChhbmd1bGFyLmlzTnVtYmVyKGN1cnJlbnRJZHgpICYmIHNsaWRlc1tjdXJyZW50SWR4XS5lbGVtZW50KSB7XHJcbiAgICAgICAgc2xpZGVzW2N1cnJlbnRJZHhdLmVsZW1lbnQuZGF0YShTTElERV9ESVJFQ1RJT04sIHNsaWRlLmRpcmVjdGlvbik7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgICRzY29wZS4kY3VycmVudFRyYW5zaXRpb24gPSB0cnVlO1xyXG4gICAgICAkYW5pbWF0ZS5vbignYWRkQ2xhc3MnLCBzbGlkZXNbaW5kZXhdLmVsZW1lbnQsIGZ1bmN0aW9uKGVsZW1lbnQsIHBoYXNlKSB7XHJcbiAgICAgICAgaWYgKHBoYXNlID09PSAnY2xvc2UnKSB7XHJcbiAgICAgICAgICAkc2NvcGUuJGN1cnJlbnRUcmFuc2l0aW9uID0gbnVsbDtcclxuICAgICAgICAgICRhbmltYXRlLm9mZignYWRkQ2xhc3MnLCBlbGVtZW50KTtcclxuICAgICAgICAgIGlmIChidWZmZXJlZFRyYW5zaXRpb25zLmxlbmd0aCkge1xyXG4gICAgICAgICAgICB2YXIgbmV4dFNsaWRlID0gYnVmZmVyZWRUcmFuc2l0aW9ucy5wb3AoKS5zbGlkZTtcclxuICAgICAgICAgICAgdmFyIG5leHRJbmRleCA9IG5leHRTbGlkZS5pbmRleDtcclxuICAgICAgICAgICAgdmFyIG5leHREaXJlY3Rpb24gPSBuZXh0SW5kZXggPiBzZWxmLmdldEN1cnJlbnRJbmRleCgpID8gJ25leHQnIDogJ3ByZXYnO1xyXG4gICAgICAgICAgICBjbGVhckJ1ZmZlcmVkVHJhbnNpdGlvbnMoKTtcclxuXHJcbiAgICAgICAgICAgIGdvTmV4dChuZXh0U2xpZGUsIG5leHRJbmRleCwgbmV4dERpcmVjdGlvbik7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAkc2NvcGUuYWN0aXZlID0gc2xpZGUuaW5kZXg7XHJcbiAgICBjdXJyZW50SW5kZXggPSBzbGlkZS5pbmRleDtcclxuICAgIHNldEFjdGl2ZShpbmRleCk7XHJcblxyXG4gICAgLy9ldmVyeSB0aW1lIHlvdSBjaGFuZ2Ugc2xpZGVzLCByZXNldCB0aGUgdGltZXJcclxuICAgIHJlc3RhcnRUaW1lcigpO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gZmluZFNsaWRlSW5kZXgoc2xpZGUpIHtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc2xpZGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIGlmIChzbGlkZXNbaV0uc2xpZGUgPT09IHNsaWRlKSB7XHJcbiAgICAgICAgcmV0dXJuIGk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHJlc2V0VGltZXIoKSB7XHJcbiAgICBpZiAoY3VycmVudEludGVydmFsKSB7XHJcbiAgICAgICRpbnRlcnZhbC5jYW5jZWwoY3VycmVudEludGVydmFsKTtcclxuICAgICAgY3VycmVudEludGVydmFsID0gbnVsbDtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHJlc2V0VHJhbnNpdGlvbihzbGlkZXMpIHtcclxuICAgIGlmICghc2xpZGVzLmxlbmd0aCkge1xyXG4gICAgICAkc2NvcGUuJGN1cnJlbnRUcmFuc2l0aW9uID0gbnVsbDtcclxuICAgICAgY2xlYXJCdWZmZXJlZFRyYW5zaXRpb25zKCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiByZXN0YXJ0VGltZXIoKSB7XHJcbiAgICByZXNldFRpbWVyKCk7XHJcbiAgICB2YXIgaW50ZXJ2YWwgPSArJHNjb3BlLmludGVydmFsO1xyXG4gICAgaWYgKCFpc05hTihpbnRlcnZhbCkgJiYgaW50ZXJ2YWwgPiAwKSB7XHJcbiAgICAgIGN1cnJlbnRJbnRlcnZhbCA9ICRpbnRlcnZhbCh0aW1lckZuLCBpbnRlcnZhbCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiB0aW1lckZuKCkge1xyXG4gICAgdmFyIGludGVydmFsID0gKyRzY29wZS5pbnRlcnZhbDtcclxuICAgIGlmIChpc1BsYXlpbmcgJiYgIWlzTmFOKGludGVydmFsKSAmJiBpbnRlcnZhbCA+IDAgJiYgc2xpZGVzLmxlbmd0aCkge1xyXG4gICAgICAkc2NvcGUubmV4dCgpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgJHNjb3BlLnBhdXNlKCk7XHJcbiAgICB9XHJcbiAgfVxyXG59XSlcclxuXHJcbi5kaXJlY3RpdmUoJ3VpYkNhcm91c2VsJywgZnVuY3Rpb24oKSB7XHJcbiAgcmV0dXJuIHtcclxuICAgIHRyYW5zY2x1ZGU6IHRydWUsXHJcbiAgICBjb250cm9sbGVyOiAnVWliQ2Fyb3VzZWxDb250cm9sbGVyJyxcclxuICAgIGNvbnRyb2xsZXJBczogJ2Nhcm91c2VsJyxcclxuICAgIHJlc3RyaWN0OiAnQScsXHJcbiAgICB0ZW1wbGF0ZVVybDogZnVuY3Rpb24oZWxlbWVudCwgYXR0cnMpIHtcclxuICAgICAgcmV0dXJuIGF0dHJzLnRlbXBsYXRlVXJsIHx8ICd1aWIvdGVtcGxhdGUvY2Fyb3VzZWwvY2Fyb3VzZWwuaHRtbCc7XHJcbiAgICB9LFxyXG4gICAgc2NvcGU6IHtcclxuICAgICAgYWN0aXZlOiAnPScsXHJcbiAgICAgIGludGVydmFsOiAnPScsXHJcbiAgICAgIG5vVHJhbnNpdGlvbjogJz0nLFxyXG4gICAgICBub1BhdXNlOiAnPScsXHJcbiAgICAgIG5vV3JhcDogJyYnXHJcbiAgICB9XHJcbiAgfTtcclxufSlcclxuXHJcbi5kaXJlY3RpdmUoJ3VpYlNsaWRlJywgWyckYW5pbWF0ZScsIGZ1bmN0aW9uKCRhbmltYXRlKSB7XHJcbiAgcmV0dXJuIHtcclxuICAgIHJlcXVpcmU6ICdedWliQ2Fyb3VzZWwnLFxyXG4gICAgcmVzdHJpY3Q6ICdBJyxcclxuICAgIHRyYW5zY2x1ZGU6IHRydWUsXHJcbiAgICB0ZW1wbGF0ZVVybDogZnVuY3Rpb24oZWxlbWVudCwgYXR0cnMpIHtcclxuICAgICAgcmV0dXJuIGF0dHJzLnRlbXBsYXRlVXJsIHx8ICd1aWIvdGVtcGxhdGUvY2Fyb3VzZWwvc2xpZGUuaHRtbCc7XHJcbiAgICB9LFxyXG4gICAgc2NvcGU6IHtcclxuICAgICAgYWN0dWFsOiAnPT8nLFxyXG4gICAgICBpbmRleDogJz0/J1xyXG4gICAgfSxcclxuICAgIGxpbms6IGZ1bmN0aW9uIChzY29wZSwgZWxlbWVudCwgYXR0cnMsIGNhcm91c2VsQ3RybCkge1xyXG4gICAgICBlbGVtZW50LmFkZENsYXNzKCdpdGVtJyk7XHJcbiAgICAgIGNhcm91c2VsQ3RybC5hZGRTbGlkZShzY29wZSwgZWxlbWVudCk7XHJcbiAgICAgIC8vd2hlbiB0aGUgc2NvcGUgaXMgZGVzdHJveWVkIHRoZW4gcmVtb3ZlIHRoZSBzbGlkZSBmcm9tIHRoZSBjdXJyZW50IHNsaWRlcyBhcnJheVxyXG4gICAgICBzY29wZS4kb24oJyRkZXN0cm95JywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgY2Fyb3VzZWxDdHJsLnJlbW92ZVNsaWRlKHNjb3BlKTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICBzY29wZS4kd2F0Y2goJ2FjdGl2ZScsIGZ1bmN0aW9uKGFjdGl2ZSkge1xyXG4gICAgICAgICRhbmltYXRlW2FjdGl2ZSA/ICdhZGRDbGFzcycgOiAncmVtb3ZlQ2xhc3MnXShlbGVtZW50LCAnYWN0aXZlJyk7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH07XHJcbn1dKVxyXG5cclxuLmFuaW1hdGlvbignLml0ZW0nLCBbJyRhbmltYXRlQ3NzJyxcclxuZnVuY3Rpb24oJGFuaW1hdGVDc3MpIHtcclxuICB2YXIgU0xJREVfRElSRUNUSU9OID0gJ3VpYi1zbGlkZURpcmVjdGlvbic7XHJcblxyXG4gIGZ1bmN0aW9uIHJlbW92ZUNsYXNzKGVsZW1lbnQsIGNsYXNzTmFtZSwgY2FsbGJhY2spIHtcclxuICAgIGVsZW1lbnQucmVtb3ZlQ2xhc3MoY2xhc3NOYW1lKTtcclxuICAgIGlmIChjYWxsYmFjaykge1xyXG4gICAgICBjYWxsYmFjaygpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHtcclxuICAgIGJlZm9yZUFkZENsYXNzOiBmdW5jdGlvbihlbGVtZW50LCBjbGFzc05hbWUsIGRvbmUpIHtcclxuICAgICAgaWYgKGNsYXNzTmFtZSA9PT0gJ2FjdGl2ZScpIHtcclxuICAgICAgICB2YXIgc3RvcHBlZCA9IGZhbHNlO1xyXG4gICAgICAgIHZhciBkaXJlY3Rpb24gPSBlbGVtZW50LmRhdGEoU0xJREVfRElSRUNUSU9OKTtcclxuICAgICAgICB2YXIgZGlyZWN0aW9uQ2xhc3MgPSBkaXJlY3Rpb24gPT09ICduZXh0JyA/ICdsZWZ0JyA6ICdyaWdodCc7XHJcbiAgICAgICAgdmFyIHJlbW92ZUNsYXNzRm4gPSByZW1vdmVDbGFzcy5iaW5kKHRoaXMsIGVsZW1lbnQsXHJcbiAgICAgICAgICBkaXJlY3Rpb25DbGFzcyArICcgJyArIGRpcmVjdGlvbiwgZG9uZSk7XHJcbiAgICAgICAgZWxlbWVudC5hZGRDbGFzcyhkaXJlY3Rpb24pO1xyXG5cclxuICAgICAgICAkYW5pbWF0ZUNzcyhlbGVtZW50LCB7YWRkQ2xhc3M6IGRpcmVjdGlvbkNsYXNzfSlcclxuICAgICAgICAgIC5zdGFydCgpXHJcbiAgICAgICAgICAuZG9uZShyZW1vdmVDbGFzc0ZuKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgc3RvcHBlZCA9IHRydWU7XHJcbiAgICAgICAgfTtcclxuICAgICAgfVxyXG4gICAgICBkb25lKCk7XHJcbiAgICB9LFxyXG4gICAgYmVmb3JlUmVtb3ZlQ2xhc3M6IGZ1bmN0aW9uIChlbGVtZW50LCBjbGFzc05hbWUsIGRvbmUpIHtcclxuICAgICAgaWYgKGNsYXNzTmFtZSA9PT0gJ2FjdGl2ZScpIHtcclxuICAgICAgICB2YXIgc3RvcHBlZCA9IGZhbHNlO1xyXG4gICAgICAgIHZhciBkaXJlY3Rpb24gPSBlbGVtZW50LmRhdGEoU0xJREVfRElSRUNUSU9OKTtcclxuICAgICAgICB2YXIgZGlyZWN0aW9uQ2xhc3MgPSBkaXJlY3Rpb24gPT09ICduZXh0JyA/ICdsZWZ0JyA6ICdyaWdodCc7XHJcbiAgICAgICAgdmFyIHJlbW92ZUNsYXNzRm4gPSByZW1vdmVDbGFzcy5iaW5kKHRoaXMsIGVsZW1lbnQsIGRpcmVjdGlvbkNsYXNzLCBkb25lKTtcclxuXHJcbiAgICAgICAgJGFuaW1hdGVDc3MoZWxlbWVudCwge2FkZENsYXNzOiBkaXJlY3Rpb25DbGFzc30pXHJcbiAgICAgICAgICAuc3RhcnQoKVxyXG4gICAgICAgICAgLmRvbmUocmVtb3ZlQ2xhc3NGbik7XHJcblxyXG4gICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgIHN0b3BwZWQgPSB0cnVlO1xyXG4gICAgICAgIH07XHJcbiAgICAgIH1cclxuICAgICAgZG9uZSgpO1xyXG4gICAgfVxyXG4gIH07XHJcbn1dKTtcclxuXHJcbmFuZ3VsYXIubW9kdWxlKCd1aS5ib290c3RyYXAuZGF0ZXBhcnNlcicsIFtdKVxyXG5cclxuLnNlcnZpY2UoJ3VpYkRhdGVQYXJzZXInLCBbJyRsb2cnLCAnJGxvY2FsZScsICdkYXRlRmlsdGVyJywgJ29yZGVyQnlGaWx0ZXInLCBmdW5jdGlvbigkbG9nLCAkbG9jYWxlLCBkYXRlRmlsdGVyLCBvcmRlckJ5RmlsdGVyKSB7XHJcbiAgLy8gUHVsbGVkIGZyb20gaHR0cHM6Ly9naXRodWIuY29tL21ib3N0b2NrL2QzL2Jsb2IvbWFzdGVyL3NyYy9mb3JtYXQvcmVxdW90ZS5qc1xyXG4gIHZhciBTUEVDSUFMX0NIQVJBQ1RFUlNfUkVHRVhQID0gL1tcXFxcXFxeXFwkXFwqXFwrXFw/XFx8XFxbXFxdXFwoXFwpXFwuXFx7XFx9XS9nO1xyXG5cclxuICB2YXIgbG9jYWxlSWQ7XHJcbiAgdmFyIGZvcm1hdENvZGVUb1JlZ2V4O1xyXG5cclxuICB0aGlzLmluaXQgPSBmdW5jdGlvbigpIHtcclxuICAgIGxvY2FsZUlkID0gJGxvY2FsZS5pZDtcclxuXHJcbiAgICB0aGlzLnBhcnNlcnMgPSB7fTtcclxuICAgIHRoaXMuZm9ybWF0dGVycyA9IHt9O1xyXG5cclxuICAgIGZvcm1hdENvZGVUb1JlZ2V4ID0gW1xyXG4gICAgICB7XHJcbiAgICAgICAga2V5OiAneXl5eScsXHJcbiAgICAgICAgcmVnZXg6ICdcXFxcZHs0fScsXHJcbiAgICAgICAgYXBwbHk6IGZ1bmN0aW9uKHZhbHVlKSB7IHRoaXMueWVhciA9ICt2YWx1ZTsgfSxcclxuICAgICAgICBmb3JtYXR0ZXI6IGZ1bmN0aW9uKGRhdGUpIHtcclxuICAgICAgICAgIHZhciBfZGF0ZSA9IG5ldyBEYXRlKCk7XHJcbiAgICAgICAgICBfZGF0ZS5zZXRGdWxsWWVhcihNYXRoLmFicyhkYXRlLmdldEZ1bGxZZWFyKCkpKTtcclxuICAgICAgICAgIHJldHVybiBkYXRlRmlsdGVyKF9kYXRlLCAneXl5eScpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIGtleTogJ3l5JyxcclxuICAgICAgICByZWdleDogJ1xcXFxkezJ9JyxcclxuICAgICAgICBhcHBseTogZnVuY3Rpb24odmFsdWUpIHsgdmFsdWUgPSArdmFsdWU7IHRoaXMueWVhciA9IHZhbHVlIDwgNjkgPyB2YWx1ZSArIDIwMDAgOiB2YWx1ZSArIDE5MDA7IH0sXHJcbiAgICAgICAgZm9ybWF0dGVyOiBmdW5jdGlvbihkYXRlKSB7XHJcbiAgICAgICAgICB2YXIgX2RhdGUgPSBuZXcgRGF0ZSgpO1xyXG4gICAgICAgICAgX2RhdGUuc2V0RnVsbFllYXIoTWF0aC5hYnMoZGF0ZS5nZXRGdWxsWWVhcigpKSk7XHJcbiAgICAgICAgICByZXR1cm4gZGF0ZUZpbHRlcihfZGF0ZSwgJ3l5Jyk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAga2V5OiAneScsXHJcbiAgICAgICAgcmVnZXg6ICdcXFxcZHsxLDR9JyxcclxuICAgICAgICBhcHBseTogZnVuY3Rpb24odmFsdWUpIHsgdGhpcy55ZWFyID0gK3ZhbHVlOyB9LFxyXG4gICAgICAgIGZvcm1hdHRlcjogZnVuY3Rpb24oZGF0ZSkge1xyXG4gICAgICAgICAgdmFyIF9kYXRlID0gbmV3IERhdGUoKTtcclxuICAgICAgICAgIF9kYXRlLnNldEZ1bGxZZWFyKE1hdGguYWJzKGRhdGUuZ2V0RnVsbFllYXIoKSkpO1xyXG4gICAgICAgICAgcmV0dXJuIGRhdGVGaWx0ZXIoX2RhdGUsICd5Jyk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAga2V5OiAnTSEnLFxyXG4gICAgICAgIHJlZ2V4OiAnMD9bMS05XXwxWzAtMl0nLFxyXG4gICAgICAgIGFwcGx5OiBmdW5jdGlvbih2YWx1ZSkgeyB0aGlzLm1vbnRoID0gdmFsdWUgLSAxOyB9LFxyXG4gICAgICAgIGZvcm1hdHRlcjogZnVuY3Rpb24oZGF0ZSkge1xyXG4gICAgICAgICAgdmFyIHZhbHVlID0gZGF0ZS5nZXRNb250aCgpO1xyXG4gICAgICAgICAgaWYgKC9eWzAtOV0kLy50ZXN0KHZhbHVlKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gZGF0ZUZpbHRlcihkYXRlLCAnTU0nKTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICByZXR1cm4gZGF0ZUZpbHRlcihkYXRlLCAnTScpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIGtleTogJ01NTU0nLFxyXG4gICAgICAgIHJlZ2V4OiAkbG9jYWxlLkRBVEVUSU1FX0ZPUk1BVFMuTU9OVEguam9pbignfCcpLFxyXG4gICAgICAgIGFwcGx5OiBmdW5jdGlvbih2YWx1ZSkgeyB0aGlzLm1vbnRoID0gJGxvY2FsZS5EQVRFVElNRV9GT1JNQVRTLk1PTlRILmluZGV4T2YodmFsdWUpOyB9LFxyXG4gICAgICAgIGZvcm1hdHRlcjogZnVuY3Rpb24oZGF0ZSkgeyByZXR1cm4gZGF0ZUZpbHRlcihkYXRlLCAnTU1NTScpOyB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICBrZXk6ICdNTU0nLFxyXG4gICAgICAgIHJlZ2V4OiAkbG9jYWxlLkRBVEVUSU1FX0ZPUk1BVFMuU0hPUlRNT05USC5qb2luKCd8JyksXHJcbiAgICAgICAgYXBwbHk6IGZ1bmN0aW9uKHZhbHVlKSB7IHRoaXMubW9udGggPSAkbG9jYWxlLkRBVEVUSU1FX0ZPUk1BVFMuU0hPUlRNT05USC5pbmRleE9mKHZhbHVlKTsgfSxcclxuICAgICAgICBmb3JtYXR0ZXI6IGZ1bmN0aW9uKGRhdGUpIHsgcmV0dXJuIGRhdGVGaWx0ZXIoZGF0ZSwgJ01NTScpOyB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICBrZXk6ICdNTScsXHJcbiAgICAgICAgcmVnZXg6ICcwWzEtOV18MVswLTJdJyxcclxuICAgICAgICBhcHBseTogZnVuY3Rpb24odmFsdWUpIHsgdGhpcy5tb250aCA9IHZhbHVlIC0gMTsgfSxcclxuICAgICAgICBmb3JtYXR0ZXI6IGZ1bmN0aW9uKGRhdGUpIHsgcmV0dXJuIGRhdGVGaWx0ZXIoZGF0ZSwgJ01NJyk7IH1cclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIGtleTogJ00nLFxyXG4gICAgICAgIHJlZ2V4OiAnWzEtOV18MVswLTJdJyxcclxuICAgICAgICBhcHBseTogZnVuY3Rpb24odmFsdWUpIHsgdGhpcy5tb250aCA9IHZhbHVlIC0gMTsgfSxcclxuICAgICAgICBmb3JtYXR0ZXI6IGZ1bmN0aW9uKGRhdGUpIHsgcmV0dXJuIGRhdGVGaWx0ZXIoZGF0ZSwgJ00nKTsgfVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAga2V5OiAnZCEnLFxyXG4gICAgICAgIHJlZ2V4OiAnWzAtMl0/WzAtOV17MX18M1swLTFdezF9JyxcclxuICAgICAgICBhcHBseTogZnVuY3Rpb24odmFsdWUpIHsgdGhpcy5kYXRlID0gK3ZhbHVlOyB9LFxyXG4gICAgICAgIGZvcm1hdHRlcjogZnVuY3Rpb24oZGF0ZSkge1xyXG4gICAgICAgICAgdmFyIHZhbHVlID0gZGF0ZS5nZXREYXRlKCk7XHJcbiAgICAgICAgICBpZiAoL15bMS05XSQvLnRlc3QodmFsdWUpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBkYXRlRmlsdGVyKGRhdGUsICdkZCcpO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIHJldHVybiBkYXRlRmlsdGVyKGRhdGUsICdkJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAga2V5OiAnZGQnLFxyXG4gICAgICAgIHJlZ2V4OiAnWzAtMl1bMC05XXsxfXwzWzAtMV17MX0nLFxyXG4gICAgICAgIGFwcGx5OiBmdW5jdGlvbih2YWx1ZSkgeyB0aGlzLmRhdGUgPSArdmFsdWU7IH0sXHJcbiAgICAgICAgZm9ybWF0dGVyOiBmdW5jdGlvbihkYXRlKSB7IHJldHVybiBkYXRlRmlsdGVyKGRhdGUsICdkZCcpOyB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICBrZXk6ICdkJyxcclxuICAgICAgICByZWdleDogJ1sxLTJdP1swLTldezF9fDNbMC0xXXsxfScsXHJcbiAgICAgICAgYXBwbHk6IGZ1bmN0aW9uKHZhbHVlKSB7IHRoaXMuZGF0ZSA9ICt2YWx1ZTsgfSxcclxuICAgICAgICBmb3JtYXR0ZXI6IGZ1bmN0aW9uKGRhdGUpIHsgcmV0dXJuIGRhdGVGaWx0ZXIoZGF0ZSwgJ2QnKTsgfVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAga2V5OiAnRUVFRScsXHJcbiAgICAgICAgcmVnZXg6ICRsb2NhbGUuREFURVRJTUVfRk9STUFUUy5EQVkuam9pbignfCcpLFxyXG4gICAgICAgIGZvcm1hdHRlcjogZnVuY3Rpb24oZGF0ZSkgeyByZXR1cm4gZGF0ZUZpbHRlcihkYXRlLCAnRUVFRScpOyB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICBrZXk6ICdFRUUnLFxyXG4gICAgICAgIHJlZ2V4OiAkbG9jYWxlLkRBVEVUSU1FX0ZPUk1BVFMuU0hPUlREQVkuam9pbignfCcpLFxyXG4gICAgICAgIGZvcm1hdHRlcjogZnVuY3Rpb24oZGF0ZSkgeyByZXR1cm4gZGF0ZUZpbHRlcihkYXRlLCAnRUVFJyk7IH1cclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIGtleTogJ0hIJyxcclxuICAgICAgICByZWdleDogJyg/OjB8MSlbMC05XXwyWzAtM10nLFxyXG4gICAgICAgIGFwcGx5OiBmdW5jdGlvbih2YWx1ZSkgeyB0aGlzLmhvdXJzID0gK3ZhbHVlOyB9LFxyXG4gICAgICAgIGZvcm1hdHRlcjogZnVuY3Rpb24oZGF0ZSkgeyByZXR1cm4gZGF0ZUZpbHRlcihkYXRlLCAnSEgnKTsgfVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAga2V5OiAnaGgnLFxyXG4gICAgICAgIHJlZ2V4OiAnMFswLTldfDFbMC0yXScsXHJcbiAgICAgICAgYXBwbHk6IGZ1bmN0aW9uKHZhbHVlKSB7IHRoaXMuaG91cnMgPSArdmFsdWU7IH0sXHJcbiAgICAgICAgZm9ybWF0dGVyOiBmdW5jdGlvbihkYXRlKSB7IHJldHVybiBkYXRlRmlsdGVyKGRhdGUsICdoaCcpOyB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICBrZXk6ICdIJyxcclxuICAgICAgICByZWdleDogJzE/WzAtOV18MlswLTNdJyxcclxuICAgICAgICBhcHBseTogZnVuY3Rpb24odmFsdWUpIHsgdGhpcy5ob3VycyA9ICt2YWx1ZTsgfSxcclxuICAgICAgICBmb3JtYXR0ZXI6IGZ1bmN0aW9uKGRhdGUpIHsgcmV0dXJuIGRhdGVGaWx0ZXIoZGF0ZSwgJ0gnKTsgfVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAga2V5OiAnaCcsXHJcbiAgICAgICAgcmVnZXg6ICdbMC05XXwxWzAtMl0nLFxyXG4gICAgICAgIGFwcGx5OiBmdW5jdGlvbih2YWx1ZSkgeyB0aGlzLmhvdXJzID0gK3ZhbHVlOyB9LFxyXG4gICAgICAgIGZvcm1hdHRlcjogZnVuY3Rpb24oZGF0ZSkgeyByZXR1cm4gZGF0ZUZpbHRlcihkYXRlLCAnaCcpOyB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICBrZXk6ICdtbScsXHJcbiAgICAgICAgcmVnZXg6ICdbMC01XVswLTldJyxcclxuICAgICAgICBhcHBseTogZnVuY3Rpb24odmFsdWUpIHsgdGhpcy5taW51dGVzID0gK3ZhbHVlOyB9LFxyXG4gICAgICAgIGZvcm1hdHRlcjogZnVuY3Rpb24oZGF0ZSkgeyByZXR1cm4gZGF0ZUZpbHRlcihkYXRlLCAnbW0nKTsgfVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAga2V5OiAnbScsXHJcbiAgICAgICAgcmVnZXg6ICdbMC05XXxbMS01XVswLTldJyxcclxuICAgICAgICBhcHBseTogZnVuY3Rpb24odmFsdWUpIHsgdGhpcy5taW51dGVzID0gK3ZhbHVlOyB9LFxyXG4gICAgICAgIGZvcm1hdHRlcjogZnVuY3Rpb24oZGF0ZSkgeyByZXR1cm4gZGF0ZUZpbHRlcihkYXRlLCAnbScpOyB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICBrZXk6ICdzc3MnLFxyXG4gICAgICAgIHJlZ2V4OiAnWzAtOV1bMC05XVswLTldJyxcclxuICAgICAgICBhcHBseTogZnVuY3Rpb24odmFsdWUpIHsgdGhpcy5taWxsaXNlY29uZHMgPSArdmFsdWU7IH0sXHJcbiAgICAgICAgZm9ybWF0dGVyOiBmdW5jdGlvbihkYXRlKSB7IHJldHVybiBkYXRlRmlsdGVyKGRhdGUsICdzc3MnKTsgfVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAga2V5OiAnc3MnLFxyXG4gICAgICAgIHJlZ2V4OiAnWzAtNV1bMC05XScsXHJcbiAgICAgICAgYXBwbHk6IGZ1bmN0aW9uKHZhbHVlKSB7IHRoaXMuc2Vjb25kcyA9ICt2YWx1ZTsgfSxcclxuICAgICAgICBmb3JtYXR0ZXI6IGZ1bmN0aW9uKGRhdGUpIHsgcmV0dXJuIGRhdGVGaWx0ZXIoZGF0ZSwgJ3NzJyk7IH1cclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIGtleTogJ3MnLFxyXG4gICAgICAgIHJlZ2V4OiAnWzAtOV18WzEtNV1bMC05XScsXHJcbiAgICAgICAgYXBwbHk6IGZ1bmN0aW9uKHZhbHVlKSB7IHRoaXMuc2Vjb25kcyA9ICt2YWx1ZTsgfSxcclxuICAgICAgICBmb3JtYXR0ZXI6IGZ1bmN0aW9uKGRhdGUpIHsgcmV0dXJuIGRhdGVGaWx0ZXIoZGF0ZSwgJ3MnKTsgfVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAga2V5OiAnYScsXHJcbiAgICAgICAgcmVnZXg6ICRsb2NhbGUuREFURVRJTUVfRk9STUFUUy5BTVBNUy5qb2luKCd8JyksXHJcbiAgICAgICAgYXBwbHk6IGZ1bmN0aW9uKHZhbHVlKSB7XHJcbiAgICAgICAgICBpZiAodGhpcy5ob3VycyA9PT0gMTIpIHtcclxuICAgICAgICAgICAgdGhpcy5ob3VycyA9IDA7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgaWYgKHZhbHVlID09PSAnUE0nKSB7XHJcbiAgICAgICAgICAgIHRoaXMuaG91cnMgKz0gMTI7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBmb3JtYXR0ZXI6IGZ1bmN0aW9uKGRhdGUpIHsgcmV0dXJuIGRhdGVGaWx0ZXIoZGF0ZSwgJ2EnKTsgfVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAga2V5OiAnWicsXHJcbiAgICAgICAgcmVnZXg6ICdbKy1dXFxcXGR7NH0nLFxyXG4gICAgICAgIGFwcGx5OiBmdW5jdGlvbih2YWx1ZSkge1xyXG4gICAgICAgICAgdmFyIG1hdGNoZXMgPSB2YWx1ZS5tYXRjaCgvKFsrLV0pKFxcZHsyfSkoXFxkezJ9KS8pLFxyXG4gICAgICAgICAgICBzaWduID0gbWF0Y2hlc1sxXSxcclxuICAgICAgICAgICAgaG91cnMgPSBtYXRjaGVzWzJdLFxyXG4gICAgICAgICAgICBtaW51dGVzID0gbWF0Y2hlc1szXTtcclxuICAgICAgICAgIHRoaXMuaG91cnMgKz0gdG9JbnQoc2lnbiArIGhvdXJzKTtcclxuICAgICAgICAgIHRoaXMubWludXRlcyArPSB0b0ludChzaWduICsgbWludXRlcyk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBmb3JtYXR0ZXI6IGZ1bmN0aW9uKGRhdGUpIHtcclxuICAgICAgICAgIHJldHVybiBkYXRlRmlsdGVyKGRhdGUsICdaJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAga2V5OiAnd3cnLFxyXG4gICAgICAgIHJlZ2V4OiAnWzAtNF1bMC05XXw1WzAtM10nLFxyXG4gICAgICAgIGZvcm1hdHRlcjogZnVuY3Rpb24oZGF0ZSkgeyByZXR1cm4gZGF0ZUZpbHRlcihkYXRlLCAnd3cnKTsgfVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAga2V5OiAndycsXHJcbiAgICAgICAgcmVnZXg6ICdbMC05XXxbMS00XVswLTldfDVbMC0zXScsXHJcbiAgICAgICAgZm9ybWF0dGVyOiBmdW5jdGlvbihkYXRlKSB7IHJldHVybiBkYXRlRmlsdGVyKGRhdGUsICd3Jyk7IH1cclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIGtleTogJ0dHR0cnLFxyXG4gICAgICAgIHJlZ2V4OiAkbG9jYWxlLkRBVEVUSU1FX0ZPUk1BVFMuRVJBTkFNRVMuam9pbignfCcpLnJlcGxhY2UoL1xccy9nLCAnXFxcXHMnKSxcclxuICAgICAgICBmb3JtYXR0ZXI6IGZ1bmN0aW9uKGRhdGUpIHsgcmV0dXJuIGRhdGVGaWx0ZXIoZGF0ZSwgJ0dHR0cnKTsgfVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAga2V5OiAnR0dHJyxcclxuICAgICAgICByZWdleDogJGxvY2FsZS5EQVRFVElNRV9GT1JNQVRTLkVSQVMuam9pbignfCcpLFxyXG4gICAgICAgIGZvcm1hdHRlcjogZnVuY3Rpb24oZGF0ZSkgeyByZXR1cm4gZGF0ZUZpbHRlcihkYXRlLCAnR0dHJyk7IH1cclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIGtleTogJ0dHJyxcclxuICAgICAgICByZWdleDogJGxvY2FsZS5EQVRFVElNRV9GT1JNQVRTLkVSQVMuam9pbignfCcpLFxyXG4gICAgICAgIGZvcm1hdHRlcjogZnVuY3Rpb24oZGF0ZSkgeyByZXR1cm4gZGF0ZUZpbHRlcihkYXRlLCAnR0cnKTsgfVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAga2V5OiAnRycsXHJcbiAgICAgICAgcmVnZXg6ICRsb2NhbGUuREFURVRJTUVfRk9STUFUUy5FUkFTLmpvaW4oJ3wnKSxcclxuICAgICAgICBmb3JtYXR0ZXI6IGZ1bmN0aW9uKGRhdGUpIHsgcmV0dXJuIGRhdGVGaWx0ZXIoZGF0ZSwgJ0cnKTsgfVxyXG4gICAgICB9XHJcbiAgICBdO1xyXG4gIH07XHJcblxyXG4gIHRoaXMuaW5pdCgpO1xyXG5cclxuICBmdW5jdGlvbiBjcmVhdGVQYXJzZXIoZm9ybWF0KSB7XHJcbiAgICB2YXIgbWFwID0gW10sIHJlZ2V4ID0gZm9ybWF0LnNwbGl0KCcnKTtcclxuXHJcbiAgICAvLyBjaGVjayBmb3IgbGl0ZXJhbCB2YWx1ZXNcclxuICAgIHZhciBxdW90ZUluZGV4ID0gZm9ybWF0LmluZGV4T2YoJ1xcJycpO1xyXG4gICAgaWYgKHF1b3RlSW5kZXggPiAtMSkge1xyXG4gICAgICB2YXIgaW5MaXRlcmFsID0gZmFsc2U7XHJcbiAgICAgIGZvcm1hdCA9IGZvcm1hdC5zcGxpdCgnJyk7XHJcbiAgICAgIGZvciAodmFyIGkgPSBxdW90ZUluZGV4OyBpIDwgZm9ybWF0Lmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgaWYgKGluTGl0ZXJhbCkge1xyXG4gICAgICAgICAgaWYgKGZvcm1hdFtpXSA9PT0gJ1xcJycpIHtcclxuICAgICAgICAgICAgaWYgKGkgKyAxIDwgZm9ybWF0Lmxlbmd0aCAmJiBmb3JtYXRbaSsxXSA9PT0gJ1xcJycpIHsgLy8gZXNjYXBlZCBzaW5nbGUgcXVvdGVcclxuICAgICAgICAgICAgICBmb3JtYXRbaSsxXSA9ICckJztcclxuICAgICAgICAgICAgICByZWdleFtpKzFdID0gJyc7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7IC8vIGVuZCBvZiBsaXRlcmFsXHJcbiAgICAgICAgICAgICAgcmVnZXhbaV0gPSAnJztcclxuICAgICAgICAgICAgICBpbkxpdGVyYWwgPSBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgZm9ybWF0W2ldID0gJyQnO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBpZiAoZm9ybWF0W2ldID09PSAnXFwnJykgeyAvLyBzdGFydCBvZiBsaXRlcmFsXHJcbiAgICAgICAgICAgIGZvcm1hdFtpXSA9ICckJztcclxuICAgICAgICAgICAgcmVnZXhbaV0gPSAnJztcclxuICAgICAgICAgICAgaW5MaXRlcmFsID0gdHJ1ZTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGZvcm1hdCA9IGZvcm1hdC5qb2luKCcnKTtcclxuICAgIH1cclxuXHJcbiAgICBhbmd1bGFyLmZvckVhY2goZm9ybWF0Q29kZVRvUmVnZXgsIGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgICAgdmFyIGluZGV4ID0gZm9ybWF0LmluZGV4T2YoZGF0YS5rZXkpO1xyXG5cclxuICAgICAgaWYgKGluZGV4ID4gLTEpIHtcclxuICAgICAgICBmb3JtYXQgPSBmb3JtYXQuc3BsaXQoJycpO1xyXG5cclxuICAgICAgICByZWdleFtpbmRleF0gPSAnKCcgKyBkYXRhLnJlZ2V4ICsgJyknO1xyXG4gICAgICAgIGZvcm1hdFtpbmRleF0gPSAnJCc7IC8vIEN1c3RvbSBzeW1ib2wgdG8gZGVmaW5lIGNvbnN1bWVkIHBhcnQgb2YgZm9ybWF0XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IGluZGV4ICsgMSwgbiA9IGluZGV4ICsgZGF0YS5rZXkubGVuZ3RoOyBpIDwgbjsgaSsrKSB7XHJcbiAgICAgICAgICByZWdleFtpXSA9ICcnO1xyXG4gICAgICAgICAgZm9ybWF0W2ldID0gJyQnO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmb3JtYXQgPSBmb3JtYXQuam9pbignJyk7XHJcblxyXG4gICAgICAgIG1hcC5wdXNoKHtcclxuICAgICAgICAgIGluZGV4OiBpbmRleCxcclxuICAgICAgICAgIGtleTogZGF0YS5rZXksXHJcbiAgICAgICAgICBhcHBseTogZGF0YS5hcHBseSxcclxuICAgICAgICAgIG1hdGNoZXI6IGRhdGEucmVnZXhcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgcmVnZXg6IG5ldyBSZWdFeHAoJ14nICsgcmVnZXguam9pbignJykgKyAnJCcpLFxyXG4gICAgICBtYXA6IG9yZGVyQnlGaWx0ZXIobWFwLCAnaW5kZXgnKVxyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGNyZWF0ZUZvcm1hdHRlcihmb3JtYXQpIHtcclxuICAgIHZhciBmb3JtYXR0ZXJzID0gW107XHJcbiAgICB2YXIgaSA9IDA7XHJcbiAgICB2YXIgZm9ybWF0dGVyLCBsaXRlcmFsSWR4O1xyXG4gICAgd2hpbGUgKGkgPCBmb3JtYXQubGVuZ3RoKSB7XHJcbiAgICAgIGlmIChhbmd1bGFyLmlzTnVtYmVyKGxpdGVyYWxJZHgpKSB7XHJcbiAgICAgICAgaWYgKGZvcm1hdC5jaGFyQXQoaSkgPT09ICdcXCcnKSB7XHJcbiAgICAgICAgICBpZiAoaSArIDEgPj0gZm9ybWF0Lmxlbmd0aCB8fCBmb3JtYXQuY2hhckF0KGkgKyAxKSAhPT0gJ1xcJycpIHtcclxuICAgICAgICAgICAgZm9ybWF0dGVycy5wdXNoKGNvbnN0cnVjdExpdGVyYWxGb3JtYXR0ZXIoZm9ybWF0LCBsaXRlcmFsSWR4LCBpKSk7XHJcbiAgICAgICAgICAgIGxpdGVyYWxJZHggPSBudWxsO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSBpZiAoaSA9PT0gZm9ybWF0Lmxlbmd0aCkge1xyXG4gICAgICAgICAgd2hpbGUgKGxpdGVyYWxJZHggPCBmb3JtYXQubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIGZvcm1hdHRlciA9IGNvbnN0cnVjdEZvcm1hdHRlckZyb21JZHgoZm9ybWF0LCBsaXRlcmFsSWR4KTtcclxuICAgICAgICAgICAgZm9ybWF0dGVycy5wdXNoKGZvcm1hdHRlcik7XHJcbiAgICAgICAgICAgIGxpdGVyYWxJZHggPSBmb3JtYXR0ZXIuZW5kSWR4O1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaSsrO1xyXG4gICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoZm9ybWF0LmNoYXJBdChpKSA9PT0gJ1xcJycpIHtcclxuICAgICAgICBsaXRlcmFsSWR4ID0gaTtcclxuICAgICAgICBpKys7XHJcbiAgICAgICAgY29udGludWU7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGZvcm1hdHRlciA9IGNvbnN0cnVjdEZvcm1hdHRlckZyb21JZHgoZm9ybWF0LCBpKTtcclxuXHJcbiAgICAgIGZvcm1hdHRlcnMucHVzaChmb3JtYXR0ZXIucGFyc2VyKTtcclxuICAgICAgaSA9IGZvcm1hdHRlci5lbmRJZHg7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGZvcm1hdHRlcnM7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBjb25zdHJ1Y3RMaXRlcmFsRm9ybWF0dGVyKGZvcm1hdCwgbGl0ZXJhbElkeCwgZW5kSWR4KSB7XHJcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XHJcbiAgICAgIHJldHVybiBmb3JtYXQuc3Vic3RyKGxpdGVyYWxJZHggKyAxLCBlbmRJZHggLSBsaXRlcmFsSWR4IC0gMSk7XHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gY29uc3RydWN0Rm9ybWF0dGVyRnJvbUlkeChmb3JtYXQsIGkpIHtcclxuICAgIHZhciBjdXJyZW50UG9zU3RyID0gZm9ybWF0LnN1YnN0cihpKTtcclxuICAgIGZvciAodmFyIGogPSAwOyBqIDwgZm9ybWF0Q29kZVRvUmVnZXgubGVuZ3RoOyBqKyspIHtcclxuICAgICAgaWYgKG5ldyBSZWdFeHAoJ14nICsgZm9ybWF0Q29kZVRvUmVnZXhbal0ua2V5KS50ZXN0KGN1cnJlbnRQb3NTdHIpKSB7XHJcbiAgICAgICAgdmFyIGRhdGEgPSBmb3JtYXRDb2RlVG9SZWdleFtqXTtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgZW5kSWR4OiBpICsgZGF0YS5rZXkubGVuZ3RoLFxyXG4gICAgICAgICAgcGFyc2VyOiBkYXRhLmZvcm1hdHRlclxyXG4gICAgICAgIH07XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBlbmRJZHg6IGkgKyAxLFxyXG4gICAgICBwYXJzZXI6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiBjdXJyZW50UG9zU3RyLmNoYXJBdCgwKTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIHRoaXMuZmlsdGVyID0gZnVuY3Rpb24oZGF0ZSwgZm9ybWF0KSB7XHJcbiAgICBpZiAoIWFuZ3VsYXIuaXNEYXRlKGRhdGUpIHx8IGlzTmFOKGRhdGUpIHx8ICFmb3JtYXQpIHtcclxuICAgICAgcmV0dXJuICcnO1xyXG4gICAgfVxyXG5cclxuICAgIGZvcm1hdCA9ICRsb2NhbGUuREFURVRJTUVfRk9STUFUU1tmb3JtYXRdIHx8IGZvcm1hdDtcclxuXHJcbiAgICBpZiAoJGxvY2FsZS5pZCAhPT0gbG9jYWxlSWQpIHtcclxuICAgICAgdGhpcy5pbml0KCk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCF0aGlzLmZvcm1hdHRlcnNbZm9ybWF0XSkge1xyXG4gICAgICB0aGlzLmZvcm1hdHRlcnNbZm9ybWF0XSA9IGNyZWF0ZUZvcm1hdHRlcihmb3JtYXQpO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBmb3JtYXR0ZXJzID0gdGhpcy5mb3JtYXR0ZXJzW2Zvcm1hdF07XHJcblxyXG4gICAgcmV0dXJuIGZvcm1hdHRlcnMucmVkdWNlKGZ1bmN0aW9uKHN0ciwgZm9ybWF0dGVyKSB7XHJcbiAgICAgIHJldHVybiBzdHIgKyBmb3JtYXR0ZXIoZGF0ZSk7XHJcbiAgICB9LCAnJyk7XHJcbiAgfTtcclxuXHJcbiAgdGhpcy5wYXJzZSA9IGZ1bmN0aW9uKGlucHV0LCBmb3JtYXQsIGJhc2VEYXRlKSB7XHJcbiAgICBpZiAoIWFuZ3VsYXIuaXNTdHJpbmcoaW5wdXQpIHx8ICFmb3JtYXQpIHtcclxuICAgICAgcmV0dXJuIGlucHV0O1xyXG4gICAgfVxyXG5cclxuICAgIGZvcm1hdCA9ICRsb2NhbGUuREFURVRJTUVfRk9STUFUU1tmb3JtYXRdIHx8IGZvcm1hdDtcclxuICAgIGZvcm1hdCA9IGZvcm1hdC5yZXBsYWNlKFNQRUNJQUxfQ0hBUkFDVEVSU19SRUdFWFAsICdcXFxcJCYnKTtcclxuXHJcbiAgICBpZiAoJGxvY2FsZS5pZCAhPT0gbG9jYWxlSWQpIHtcclxuICAgICAgdGhpcy5pbml0KCk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCF0aGlzLnBhcnNlcnNbZm9ybWF0XSkge1xyXG4gICAgICB0aGlzLnBhcnNlcnNbZm9ybWF0XSA9IGNyZWF0ZVBhcnNlcihmb3JtYXQsICdhcHBseScpO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBwYXJzZXIgPSB0aGlzLnBhcnNlcnNbZm9ybWF0XSxcclxuICAgICAgICByZWdleCA9IHBhcnNlci5yZWdleCxcclxuICAgICAgICBtYXAgPSBwYXJzZXIubWFwLFxyXG4gICAgICAgIHJlc3VsdHMgPSBpbnB1dC5tYXRjaChyZWdleCksXHJcbiAgICAgICAgdHpPZmZzZXQgPSBmYWxzZTtcclxuICAgIGlmIChyZXN1bHRzICYmIHJlc3VsdHMubGVuZ3RoKSB7XHJcbiAgICAgIHZhciBmaWVsZHMsIGR0O1xyXG4gICAgICBpZiAoYW5ndWxhci5pc0RhdGUoYmFzZURhdGUpICYmICFpc05hTihiYXNlRGF0ZS5nZXRUaW1lKCkpKSB7XHJcbiAgICAgICAgZmllbGRzID0ge1xyXG4gICAgICAgICAgeWVhcjogYmFzZURhdGUuZ2V0RnVsbFllYXIoKSxcclxuICAgICAgICAgIG1vbnRoOiBiYXNlRGF0ZS5nZXRNb250aCgpLFxyXG4gICAgICAgICAgZGF0ZTogYmFzZURhdGUuZ2V0RGF0ZSgpLFxyXG4gICAgICAgICAgaG91cnM6IGJhc2VEYXRlLmdldEhvdXJzKCksXHJcbiAgICAgICAgICBtaW51dGVzOiBiYXNlRGF0ZS5nZXRNaW51dGVzKCksXHJcbiAgICAgICAgICBzZWNvbmRzOiBiYXNlRGF0ZS5nZXRTZWNvbmRzKCksXHJcbiAgICAgICAgICBtaWxsaXNlY29uZHM6IGJhc2VEYXRlLmdldE1pbGxpc2Vjb25kcygpXHJcbiAgICAgICAgfTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBpZiAoYmFzZURhdGUpIHtcclxuICAgICAgICAgICRsb2cud2FybignZGF0ZXBhcnNlcjonLCAnYmFzZURhdGUgaXMgbm90IGEgdmFsaWQgZGF0ZScpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmaWVsZHMgPSB7IHllYXI6IDE5MDAsIG1vbnRoOiAwLCBkYXRlOiAxLCBob3VyczogMCwgbWludXRlczogMCwgc2Vjb25kczogMCwgbWlsbGlzZWNvbmRzOiAwIH07XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGZvciAodmFyIGkgPSAxLCBuID0gcmVzdWx0cy5sZW5ndGg7IGkgPCBuOyBpKyspIHtcclxuICAgICAgICB2YXIgbWFwcGVyID0gbWFwW2kgLSAxXTtcclxuICAgICAgICBpZiAobWFwcGVyLm1hdGNoZXIgPT09ICdaJykge1xyXG4gICAgICAgICAgdHpPZmZzZXQgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKG1hcHBlci5hcHBseSkge1xyXG4gICAgICAgICAgbWFwcGVyLmFwcGx5LmNhbGwoZmllbGRzLCByZXN1bHRzW2ldKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHZhciBkYXRlc2V0dGVyID0gdHpPZmZzZXQgPyBEYXRlLnByb3RvdHlwZS5zZXRVVENGdWxsWWVhciA6XHJcbiAgICAgICAgRGF0ZS5wcm90b3R5cGUuc2V0RnVsbFllYXI7XHJcbiAgICAgIHZhciB0aW1lc2V0dGVyID0gdHpPZmZzZXQgPyBEYXRlLnByb3RvdHlwZS5zZXRVVENIb3VycyA6XHJcbiAgICAgICAgRGF0ZS5wcm90b3R5cGUuc2V0SG91cnM7XHJcblxyXG4gICAgICBpZiAoaXNWYWxpZChmaWVsZHMueWVhciwgZmllbGRzLm1vbnRoLCBmaWVsZHMuZGF0ZSkpIHtcclxuICAgICAgICBpZiAoYW5ndWxhci5pc0RhdGUoYmFzZURhdGUpICYmICFpc05hTihiYXNlRGF0ZS5nZXRUaW1lKCkpICYmICF0ek9mZnNldCkge1xyXG4gICAgICAgICAgZHQgPSBuZXcgRGF0ZShiYXNlRGF0ZSk7XHJcbiAgICAgICAgICBkYXRlc2V0dGVyLmNhbGwoZHQsIGZpZWxkcy55ZWFyLCBmaWVsZHMubW9udGgsIGZpZWxkcy5kYXRlKTtcclxuICAgICAgICAgIHRpbWVzZXR0ZXIuY2FsbChkdCwgZmllbGRzLmhvdXJzLCBmaWVsZHMubWludXRlcyxcclxuICAgICAgICAgICAgZmllbGRzLnNlY29uZHMsIGZpZWxkcy5taWxsaXNlY29uZHMpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBkdCA9IG5ldyBEYXRlKDApO1xyXG4gICAgICAgICAgZGF0ZXNldHRlci5jYWxsKGR0LCBmaWVsZHMueWVhciwgZmllbGRzLm1vbnRoLCBmaWVsZHMuZGF0ZSk7XHJcbiAgICAgICAgICB0aW1lc2V0dGVyLmNhbGwoZHQsIGZpZWxkcy5ob3VycyB8fCAwLCBmaWVsZHMubWludXRlcyB8fCAwLFxyXG4gICAgICAgICAgICBmaWVsZHMuc2Vjb25kcyB8fCAwLCBmaWVsZHMubWlsbGlzZWNvbmRzIHx8IDApO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIGR0O1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIC8vIENoZWNrIGlmIGRhdGUgaXMgdmFsaWQgZm9yIHNwZWNpZmljIG1vbnRoIChhbmQgeWVhciBmb3IgRmVicnVhcnkpLlxyXG4gIC8vIE1vbnRoOiAwID0gSmFuLCAxID0gRmViLCBldGNcclxuICBmdW5jdGlvbiBpc1ZhbGlkKHllYXIsIG1vbnRoLCBkYXRlKSB7XHJcbiAgICBpZiAoZGF0ZSA8IDEpIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChtb250aCA9PT0gMSAmJiBkYXRlID4gMjgpIHtcclxuICAgICAgcmV0dXJuIGRhdGUgPT09IDI5ICYmICh5ZWFyICUgNCA9PT0gMCAmJiB5ZWFyICUgMTAwICE9PSAwIHx8IHllYXIgJSA0MDAgPT09IDApO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChtb250aCA9PT0gMyB8fCBtb250aCA9PT0gNSB8fCBtb250aCA9PT0gOCB8fCBtb250aCA9PT0gMTApIHtcclxuICAgICAgcmV0dXJuIGRhdGUgPCAzMTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHRvSW50KHN0cikge1xyXG4gICAgcmV0dXJuIHBhcnNlSW50KHN0ciwgMTApO1xyXG4gIH1cclxuXHJcbiAgdGhpcy50b1RpbWV6b25lID0gdG9UaW1lem9uZTtcclxuICB0aGlzLmZyb21UaW1lem9uZSA9IGZyb21UaW1lem9uZTtcclxuICB0aGlzLnRpbWV6b25lVG9PZmZzZXQgPSB0aW1lem9uZVRvT2Zmc2V0O1xyXG4gIHRoaXMuYWRkRGF0ZU1pbnV0ZXMgPSBhZGREYXRlTWludXRlcztcclxuICB0aGlzLmNvbnZlcnRUaW1lem9uZVRvTG9jYWwgPSBjb252ZXJ0VGltZXpvbmVUb0xvY2FsO1xyXG5cclxuICBmdW5jdGlvbiB0b1RpbWV6b25lKGRhdGUsIHRpbWV6b25lKSB7XHJcbiAgICByZXR1cm4gZGF0ZSAmJiB0aW1lem9uZSA/IGNvbnZlcnRUaW1lem9uZVRvTG9jYWwoZGF0ZSwgdGltZXpvbmUpIDogZGF0ZTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGZyb21UaW1lem9uZShkYXRlLCB0aW1lem9uZSkge1xyXG4gICAgcmV0dXJuIGRhdGUgJiYgdGltZXpvbmUgPyBjb252ZXJ0VGltZXpvbmVUb0xvY2FsKGRhdGUsIHRpbWV6b25lLCB0cnVlKSA6IGRhdGU7XHJcbiAgfVxyXG5cclxuICAvL2h0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2FuZ3VsYXIuanMvYmxvYi82MjJjNDIxNjk2OTllYzA3ZmM2ZGFhYTE5ZmU2ZDIyNGU1ZDJmNzBlL3NyYy9Bbmd1bGFyLmpzI0wxMjA3XHJcbiAgZnVuY3Rpb24gdGltZXpvbmVUb09mZnNldCh0aW1lem9uZSwgZmFsbGJhY2spIHtcclxuICAgIHRpbWV6b25lID0gdGltZXpvbmUucmVwbGFjZSgvOi9nLCAnJyk7XHJcbiAgICB2YXIgcmVxdWVzdGVkVGltZXpvbmVPZmZzZXQgPSBEYXRlLnBhcnNlKCdKYW4gMDEsIDE5NzAgMDA6MDA6MDAgJyArIHRpbWV6b25lKSAvIDYwMDAwO1xyXG4gICAgcmV0dXJuIGlzTmFOKHJlcXVlc3RlZFRpbWV6b25lT2Zmc2V0KSA/IGZhbGxiYWNrIDogcmVxdWVzdGVkVGltZXpvbmVPZmZzZXQ7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBhZGREYXRlTWludXRlcyhkYXRlLCBtaW51dGVzKSB7XHJcbiAgICBkYXRlID0gbmV3IERhdGUoZGF0ZS5nZXRUaW1lKCkpO1xyXG4gICAgZGF0ZS5zZXRNaW51dGVzKGRhdGUuZ2V0TWludXRlcygpICsgbWludXRlcyk7XHJcbiAgICByZXR1cm4gZGF0ZTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGNvbnZlcnRUaW1lem9uZVRvTG9jYWwoZGF0ZSwgdGltZXpvbmUsIHJldmVyc2UpIHtcclxuICAgIHJldmVyc2UgPSByZXZlcnNlID8gLTEgOiAxO1xyXG4gICAgdmFyIGRhdGVUaW1lem9uZU9mZnNldCA9IGRhdGUuZ2V0VGltZXpvbmVPZmZzZXQoKTtcclxuICAgIHZhciB0aW1lem9uZU9mZnNldCA9IHRpbWV6b25lVG9PZmZzZXQodGltZXpvbmUsIGRhdGVUaW1lem9uZU9mZnNldCk7XHJcbiAgICByZXR1cm4gYWRkRGF0ZU1pbnV0ZXMoZGF0ZSwgcmV2ZXJzZSAqICh0aW1lem9uZU9mZnNldCAtIGRhdGVUaW1lem9uZU9mZnNldCkpO1xyXG4gIH1cclxufV0pO1xyXG5cclxuLy8gQXZvaWRpbmcgdXNlIG9mIG5nLWNsYXNzIGFzIGl0IGNyZWF0ZXMgYSBsb3Qgb2Ygd2F0Y2hlcnMgd2hlbiBhIGNsYXNzIGlzIHRvIGJlIGFwcGxpZWQgdG9cclxuLy8gYXQgbW9zdCBvbmUgZWxlbWVudC5cclxuYW5ndWxhci5tb2R1bGUoJ3VpLmJvb3RzdHJhcC5pc0NsYXNzJywgW10pXHJcbi5kaXJlY3RpdmUoJ3VpYklzQ2xhc3MnLCBbXHJcbiAgICAgICAgICckYW5pbWF0ZScsXHJcbmZ1bmN0aW9uICgkYW5pbWF0ZSkge1xyXG4gIC8vICAgICAgICAgICAgICAgICAgICAxMTExMTExMSAgICAgICAgICAyMjIyMjIyMlxyXG4gIHZhciBPTl9SRUdFWFAgPSAvXlxccyooW1xcc1xcU10rPylcXHMrb25cXHMrKFtcXHNcXFNdKz8pXFxzKiQvO1xyXG4gIC8vICAgICAgICAgICAgICAgICAgICAxMTExMTExMSAgICAgICAgICAgMjIyMjIyMjJcclxuICB2YXIgSVNfUkVHRVhQID0gL15cXHMqKFtcXHNcXFNdKz8pXFxzK2ZvclxccysoW1xcc1xcU10rPylcXHMqJC87XHJcblxyXG4gIHZhciBkYXRhUGVyVHJhY2tlZCA9IHt9O1xyXG5cclxuICByZXR1cm4ge1xyXG4gICAgcmVzdHJpY3Q6ICdBJyxcclxuICAgIGNvbXBpbGU6IGZ1bmN0aW9uKHRFbGVtZW50LCB0QXR0cnMpIHtcclxuICAgICAgdmFyIGxpbmtlZFNjb3BlcyA9IFtdO1xyXG4gICAgICB2YXIgaW5zdGFuY2VzID0gW107XHJcbiAgICAgIHZhciBleHBUb0RhdGEgPSB7fTtcclxuICAgICAgdmFyIGxhc3RBY3RpdmF0ZWQgPSBudWxsO1xyXG4gICAgICB2YXIgb25FeHBNYXRjaGVzID0gdEF0dHJzLnVpYklzQ2xhc3MubWF0Y2goT05fUkVHRVhQKTtcclxuICAgICAgdmFyIG9uRXhwID0gb25FeHBNYXRjaGVzWzJdO1xyXG4gICAgICB2YXIgZXhwc1N0ciA9IG9uRXhwTWF0Y2hlc1sxXTtcclxuICAgICAgdmFyIGV4cHMgPSBleHBzU3RyLnNwbGl0KCcsJyk7XHJcblxyXG4gICAgICByZXR1cm4gbGlua0ZuO1xyXG5cclxuICAgICAgZnVuY3Rpb24gbGlua0ZuKHNjb3BlLCBlbGVtZW50LCBhdHRycykge1xyXG4gICAgICAgIGxpbmtlZFNjb3Blcy5wdXNoKHNjb3BlKTtcclxuICAgICAgICBpbnN0YW5jZXMucHVzaCh7XHJcbiAgICAgICAgICBzY29wZTogc2NvcGUsXHJcbiAgICAgICAgICBlbGVtZW50OiBlbGVtZW50XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGV4cHMuZm9yRWFjaChmdW5jdGlvbihleHAsIGspIHtcclxuICAgICAgICAgIGFkZEZvckV4cChleHAsIHNjb3BlKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgc2NvcGUuJG9uKCckZGVzdHJveScsIHJlbW92ZVNjb3BlKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgZnVuY3Rpb24gYWRkRm9yRXhwKGV4cCwgc2NvcGUpIHtcclxuICAgICAgICB2YXIgbWF0Y2hlcyA9IGV4cC5tYXRjaChJU19SRUdFWFApO1xyXG4gICAgICAgIHZhciBjbGF6eiA9IHNjb3BlLiRldmFsKG1hdGNoZXNbMV0pO1xyXG4gICAgICAgIHZhciBjb21wYXJlV2l0aEV4cCA9IG1hdGNoZXNbMl07XHJcbiAgICAgICAgdmFyIGRhdGEgPSBleHBUb0RhdGFbZXhwXTtcclxuICAgICAgICBpZiAoIWRhdGEpIHtcclxuICAgICAgICAgIHZhciB3YXRjaEZuID0gZnVuY3Rpb24oY29tcGFyZVdpdGhWYWwpIHtcclxuICAgICAgICAgICAgdmFyIG5ld0FjdGl2YXRlZCA9IG51bGw7XHJcbiAgICAgICAgICAgIGluc3RhbmNlcy5zb21lKGZ1bmN0aW9uKGluc3RhbmNlKSB7XHJcbiAgICAgICAgICAgICAgdmFyIHRoaXNWYWwgPSBpbnN0YW5jZS5zY29wZS4kZXZhbChvbkV4cCk7XHJcbiAgICAgICAgICAgICAgaWYgKHRoaXNWYWwgPT09IGNvbXBhcmVXaXRoVmFsKSB7XHJcbiAgICAgICAgICAgICAgICBuZXdBY3RpdmF0ZWQgPSBpbnN0YW5jZTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGlmIChkYXRhLmxhc3RBY3RpdmF0ZWQgIT09IG5ld0FjdGl2YXRlZCkge1xyXG4gICAgICAgICAgICAgIGlmIChkYXRhLmxhc3RBY3RpdmF0ZWQpIHtcclxuICAgICAgICAgICAgICAgICRhbmltYXRlLnJlbW92ZUNsYXNzKGRhdGEubGFzdEFjdGl2YXRlZC5lbGVtZW50LCBjbGF6eik7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIGlmIChuZXdBY3RpdmF0ZWQpIHtcclxuICAgICAgICAgICAgICAgICRhbmltYXRlLmFkZENsYXNzKG5ld0FjdGl2YXRlZC5lbGVtZW50LCBjbGF6eik7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIGRhdGEubGFzdEFjdGl2YXRlZCA9IG5ld0FjdGl2YXRlZDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfTtcclxuICAgICAgICAgIGV4cFRvRGF0YVtleHBdID0gZGF0YSA9IHtcclxuICAgICAgICAgICAgbGFzdEFjdGl2YXRlZDogbnVsbCxcclxuICAgICAgICAgICAgc2NvcGU6IHNjb3BlLFxyXG4gICAgICAgICAgICB3YXRjaEZuOiB3YXRjaEZuLFxyXG4gICAgICAgICAgICBjb21wYXJlV2l0aEV4cDogY29tcGFyZVdpdGhFeHAsXHJcbiAgICAgICAgICAgIHdhdGNoZXI6IHNjb3BlLiR3YXRjaChjb21wYXJlV2l0aEV4cCwgd2F0Y2hGbilcclxuICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGRhdGEud2F0Y2hGbihzY29wZS4kZXZhbChjb21wYXJlV2l0aEV4cCkpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBmdW5jdGlvbiByZW1vdmVTY29wZShlKSB7XHJcbiAgICAgICAgdmFyIHJlbW92ZWRTY29wZSA9IGUudGFyZ2V0U2NvcGU7XHJcbiAgICAgICAgdmFyIGluZGV4ID0gbGlua2VkU2NvcGVzLmluZGV4T2YocmVtb3ZlZFNjb3BlKTtcclxuICAgICAgICBsaW5rZWRTY29wZXMuc3BsaWNlKGluZGV4LCAxKTtcclxuICAgICAgICBpbnN0YW5jZXMuc3BsaWNlKGluZGV4LCAxKTtcclxuICAgICAgICBpZiAobGlua2VkU2NvcGVzLmxlbmd0aCkge1xyXG4gICAgICAgICAgdmFyIG5ld1dhdGNoU2NvcGUgPSBsaW5rZWRTY29wZXNbMF07XHJcbiAgICAgICAgICBhbmd1bGFyLmZvckVhY2goZXhwVG9EYXRhLCBmdW5jdGlvbihkYXRhKSB7XHJcbiAgICAgICAgICAgIGlmIChkYXRhLnNjb3BlID09PSByZW1vdmVkU2NvcGUpIHtcclxuICAgICAgICAgICAgICBkYXRhLndhdGNoZXIgPSBuZXdXYXRjaFNjb3BlLiR3YXRjaChkYXRhLmNvbXBhcmVXaXRoRXhwLCBkYXRhLndhdGNoRm4pO1xyXG4gICAgICAgICAgICAgIGRhdGEuc2NvcGUgPSBuZXdXYXRjaFNjb3BlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgZXhwVG9EYXRhID0ge307XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfTtcclxufV0pO1xyXG5hbmd1bGFyLm1vZHVsZSgndWkuYm9vdHN0cmFwLmRhdGVwaWNrZXInLCBbJ3VpLmJvb3RzdHJhcC5kYXRlcGFyc2VyJywgJ3VpLmJvb3RzdHJhcC5pc0NsYXNzJ10pXHJcblxyXG4udmFsdWUoJyRkYXRlcGlja2VyU3VwcHJlc3NFcnJvcicsIGZhbHNlKVxyXG5cclxuLnZhbHVlKCckZGF0ZXBpY2tlckxpdGVyYWxXYXJuaW5nJywgdHJ1ZSlcclxuXHJcbi5jb25zdGFudCgndWliRGF0ZXBpY2tlckNvbmZpZycsIHtcclxuICBkYXRlcGlja2VyTW9kZTogJ2RheScsXHJcbiAgZm9ybWF0RGF5OiAnZGQnLFxyXG4gIGZvcm1hdE1vbnRoOiAnTU1NTScsXHJcbiAgZm9ybWF0WWVhcjogJ3l5eXknLFxyXG4gIGZvcm1hdERheUhlYWRlcjogJ0VFRScsXHJcbiAgZm9ybWF0RGF5VGl0bGU6ICdNTU1NIHl5eXknLFxyXG4gIGZvcm1hdE1vbnRoVGl0bGU6ICd5eXl5JyxcclxuICBtYXhEYXRlOiBudWxsLFxyXG4gIG1heE1vZGU6ICd5ZWFyJyxcclxuICBtaW5EYXRlOiBudWxsLFxyXG4gIG1pbk1vZGU6ICdkYXknLFxyXG4gIG1vbnRoQ29sdW1uczogMyxcclxuICBuZ01vZGVsT3B0aW9uczoge30sXHJcbiAgc2hvcnRjdXRQcm9wYWdhdGlvbjogZmFsc2UsXHJcbiAgc2hvd1dlZWtzOiB0cnVlLFxyXG4gIHllYXJDb2x1bW5zOiA1LFxyXG4gIHllYXJSb3dzOiA0XHJcbn0pXHJcblxyXG4uY29udHJvbGxlcignVWliRGF0ZXBpY2tlckNvbnRyb2xsZXInLCBbJyRzY29wZScsICckZWxlbWVudCcsICckYXR0cnMnLCAnJHBhcnNlJywgJyRpbnRlcnBvbGF0ZScsICckbG9jYWxlJywgJyRsb2cnLCAnZGF0ZUZpbHRlcicsICd1aWJEYXRlcGlja2VyQ29uZmlnJywgJyRkYXRlcGlja2VyTGl0ZXJhbFdhcm5pbmcnLCAnJGRhdGVwaWNrZXJTdXBwcmVzc0Vycm9yJywgJ3VpYkRhdGVQYXJzZXInLFxyXG4gIGZ1bmN0aW9uKCRzY29wZSwgJGVsZW1lbnQsICRhdHRycywgJHBhcnNlLCAkaW50ZXJwb2xhdGUsICRsb2NhbGUsICRsb2csIGRhdGVGaWx0ZXIsIGRhdGVwaWNrZXJDb25maWcsICRkYXRlcGlja2VyTGl0ZXJhbFdhcm5pbmcsICRkYXRlcGlja2VyU3VwcHJlc3NFcnJvciwgZGF0ZVBhcnNlcikge1xyXG4gIHZhciBzZWxmID0gdGhpcyxcclxuICAgICAgbmdNb2RlbEN0cmwgPSB7ICRzZXRWaWV3VmFsdWU6IGFuZ3VsYXIubm9vcCB9LCAvLyBudWxsTW9kZWxDdHJsO1xyXG4gICAgICBuZ01vZGVsT3B0aW9ucyA9IHt9LFxyXG4gICAgICB3YXRjaExpc3RlbmVycyA9IFtdO1xyXG5cclxuICAkZWxlbWVudC5hZGRDbGFzcygndWliLWRhdGVwaWNrZXInKTtcclxuICAkYXR0cnMuJHNldCgncm9sZScsICdhcHBsaWNhdGlvbicpO1xyXG5cclxuICBpZiAoISRzY29wZS5kYXRlcGlja2VyT3B0aW9ucykge1xyXG4gICAgJHNjb3BlLmRhdGVwaWNrZXJPcHRpb25zID0ge307XHJcbiAgfVxyXG5cclxuICAvLyBNb2RlcyBjaGFpblxyXG4gIHRoaXMubW9kZXMgPSBbJ2RheScsICdtb250aCcsICd5ZWFyJ107XHJcblxyXG4gIFtcclxuICAgICdjdXN0b21DbGFzcycsXHJcbiAgICAnZGF0ZURpc2FibGVkJyxcclxuICAgICdkYXRlcGlja2VyTW9kZScsXHJcbiAgICAnZm9ybWF0RGF5JyxcclxuICAgICdmb3JtYXREYXlIZWFkZXInLFxyXG4gICAgJ2Zvcm1hdERheVRpdGxlJyxcclxuICAgICdmb3JtYXRNb250aCcsXHJcbiAgICAnZm9ybWF0TW9udGhUaXRsZScsXHJcbiAgICAnZm9ybWF0WWVhcicsXHJcbiAgICAnbWF4RGF0ZScsXHJcbiAgICAnbWF4TW9kZScsXHJcbiAgICAnbWluRGF0ZScsXHJcbiAgICAnbWluTW9kZScsXHJcbiAgICAnbW9udGhDb2x1bW5zJyxcclxuICAgICdzaG93V2Vla3MnLFxyXG4gICAgJ3Nob3J0Y3V0UHJvcGFnYXRpb24nLFxyXG4gICAgJ3N0YXJ0aW5nRGF5JyxcclxuICAgICd5ZWFyQ29sdW1ucycsXHJcbiAgICAneWVhclJvd3MnXHJcbiAgXS5mb3JFYWNoKGZ1bmN0aW9uKGtleSkge1xyXG4gICAgc3dpdGNoIChrZXkpIHtcclxuICAgICAgY2FzZSAnY3VzdG9tQ2xhc3MnOlxyXG4gICAgICBjYXNlICdkYXRlRGlzYWJsZWQnOlxyXG4gICAgICAgICRzY29wZVtrZXldID0gJHNjb3BlLmRhdGVwaWNrZXJPcHRpb25zW2tleV0gfHwgYW5ndWxhci5ub29wO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlICdkYXRlcGlja2VyTW9kZSc6XHJcbiAgICAgICAgJHNjb3BlLmRhdGVwaWNrZXJNb2RlID0gYW5ndWxhci5pc0RlZmluZWQoJHNjb3BlLmRhdGVwaWNrZXJPcHRpb25zLmRhdGVwaWNrZXJNb2RlKSA/XHJcbiAgICAgICAgICAkc2NvcGUuZGF0ZXBpY2tlck9wdGlvbnMuZGF0ZXBpY2tlck1vZGUgOiBkYXRlcGlja2VyQ29uZmlnLmRhdGVwaWNrZXJNb2RlO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlICdmb3JtYXREYXknOlxyXG4gICAgICBjYXNlICdmb3JtYXREYXlIZWFkZXInOlxyXG4gICAgICBjYXNlICdmb3JtYXREYXlUaXRsZSc6XHJcbiAgICAgIGNhc2UgJ2Zvcm1hdE1vbnRoJzpcclxuICAgICAgY2FzZSAnZm9ybWF0TW9udGhUaXRsZSc6XHJcbiAgICAgIGNhc2UgJ2Zvcm1hdFllYXInOlxyXG4gICAgICAgIHNlbGZba2V5XSA9IGFuZ3VsYXIuaXNEZWZpbmVkKCRzY29wZS5kYXRlcGlja2VyT3B0aW9uc1trZXldKSA/XHJcbiAgICAgICAgICAkaW50ZXJwb2xhdGUoJHNjb3BlLmRhdGVwaWNrZXJPcHRpb25zW2tleV0pKCRzY29wZS4kcGFyZW50KSA6XHJcbiAgICAgICAgICBkYXRlcGlja2VyQ29uZmlnW2tleV07XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgJ21vbnRoQ29sdW1ucyc6XHJcbiAgICAgIGNhc2UgJ3Nob3dXZWVrcyc6XHJcbiAgICAgIGNhc2UgJ3Nob3J0Y3V0UHJvcGFnYXRpb24nOlxyXG4gICAgICBjYXNlICd5ZWFyQ29sdW1ucyc6XHJcbiAgICAgIGNhc2UgJ3llYXJSb3dzJzpcclxuICAgICAgICBzZWxmW2tleV0gPSBhbmd1bGFyLmlzRGVmaW5lZCgkc2NvcGUuZGF0ZXBpY2tlck9wdGlvbnNba2V5XSkgP1xyXG4gICAgICAgICAgJHNjb3BlLmRhdGVwaWNrZXJPcHRpb25zW2tleV0gOiBkYXRlcGlja2VyQ29uZmlnW2tleV07XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgJ3N0YXJ0aW5nRGF5JzpcclxuICAgICAgICBpZiAoYW5ndWxhci5pc0RlZmluZWQoJHNjb3BlLmRhdGVwaWNrZXJPcHRpb25zLnN0YXJ0aW5nRGF5KSkge1xyXG4gICAgICAgICAgc2VsZi5zdGFydGluZ0RheSA9ICRzY29wZS5kYXRlcGlja2VyT3B0aW9ucy5zdGFydGluZ0RheTtcclxuICAgICAgICB9IGVsc2UgaWYgKGFuZ3VsYXIuaXNOdW1iZXIoZGF0ZXBpY2tlckNvbmZpZy5zdGFydGluZ0RheSkpIHtcclxuICAgICAgICAgIHNlbGYuc3RhcnRpbmdEYXkgPSBkYXRlcGlja2VyQ29uZmlnLnN0YXJ0aW5nRGF5O1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBzZWxmLnN0YXJ0aW5nRGF5ID0gKCRsb2NhbGUuREFURVRJTUVfRk9STUFUUy5GSVJTVERBWU9GV0VFSyArIDgpICUgNztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlICdtYXhEYXRlJzpcclxuICAgICAgY2FzZSAnbWluRGF0ZSc6XHJcbiAgICAgICAgJHNjb3BlLiR3YXRjaCgnZGF0ZXBpY2tlck9wdGlvbnMuJyArIGtleSwgZnVuY3Rpb24odmFsdWUpIHtcclxuICAgICAgICAgIGlmICh2YWx1ZSkge1xyXG4gICAgICAgICAgICBpZiAoYW5ndWxhci5pc0RhdGUodmFsdWUpKSB7XHJcbiAgICAgICAgICAgICAgc2VsZltrZXldID0gZGF0ZVBhcnNlci5mcm9tVGltZXpvbmUobmV3IERhdGUodmFsdWUpLCBuZ01vZGVsT3B0aW9ucy50aW1lem9uZSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgaWYgKCRkYXRlcGlja2VyTGl0ZXJhbFdhcm5pbmcpIHtcclxuICAgICAgICAgICAgICAgICRsb2cud2FybignTGl0ZXJhbCBkYXRlIHN1cHBvcnQgaGFzIGJlZW4gZGVwcmVjYXRlZCwgcGxlYXNlIHN3aXRjaCB0byBkYXRlIG9iamVjdCB1c2FnZScpO1xyXG4gICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgc2VsZltrZXldID0gbmV3IERhdGUoZGF0ZUZpbHRlcih2YWx1ZSwgJ21lZGl1bScpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgc2VsZltrZXldID0gZGF0ZXBpY2tlckNvbmZpZ1trZXldID9cclxuICAgICAgICAgICAgICBkYXRlUGFyc2VyLmZyb21UaW1lem9uZShuZXcgRGF0ZShkYXRlcGlja2VyQ29uZmlnW2tleV0pLCBuZ01vZGVsT3B0aW9ucy50aW1lem9uZSkgOlxyXG4gICAgICAgICAgICAgIG51bGw7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgc2VsZi5yZWZyZXNoVmlldygpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAnbWF4TW9kZSc6XHJcbiAgICAgIGNhc2UgJ21pbk1vZGUnOlxyXG4gICAgICAgIGlmICgkc2NvcGUuZGF0ZXBpY2tlck9wdGlvbnNba2V5XSkge1xyXG4gICAgICAgICAgJHNjb3BlLiR3YXRjaChmdW5jdGlvbigpIHsgcmV0dXJuICRzY29wZS5kYXRlcGlja2VyT3B0aW9uc1trZXldOyB9LCBmdW5jdGlvbih2YWx1ZSkge1xyXG4gICAgICAgICAgICBzZWxmW2tleV0gPSAkc2NvcGVba2V5XSA9IGFuZ3VsYXIuaXNEZWZpbmVkKHZhbHVlKSA/IHZhbHVlIDogJHNjb3BlLmRhdGVwaWNrZXJPcHRpb25zW2tleV07XHJcbiAgICAgICAgICAgIGlmIChrZXkgPT09ICdtaW5Nb2RlJyAmJiBzZWxmLm1vZGVzLmluZGV4T2YoJHNjb3BlLmRhdGVwaWNrZXJPcHRpb25zLmRhdGVwaWNrZXJNb2RlKSA8IHNlbGYubW9kZXMuaW5kZXhPZihzZWxmW2tleV0pIHx8XHJcbiAgICAgICAgICAgICAga2V5ID09PSAnbWF4TW9kZScgJiYgc2VsZi5tb2Rlcy5pbmRleE9mKCRzY29wZS5kYXRlcGlja2VyT3B0aW9ucy5kYXRlcGlja2VyTW9kZSkgPiBzZWxmLm1vZGVzLmluZGV4T2Yoc2VsZltrZXldKSkge1xyXG4gICAgICAgICAgICAgICRzY29wZS5kYXRlcGlja2VyTW9kZSA9IHNlbGZba2V5XTtcclxuICAgICAgICAgICAgICAkc2NvcGUuZGF0ZXBpY2tlck9wdGlvbnMuZGF0ZXBpY2tlck1vZGUgPSBzZWxmW2tleV07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBzZWxmW2tleV0gPSAkc2NvcGVba2V5XSA9IGRhdGVwaWNrZXJDb25maWdba2V5XSB8fCBudWxsO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgfSk7XHJcblxyXG4gICRzY29wZS51bmlxdWVJZCA9ICdkYXRlcGlja2VyLScgKyAkc2NvcGUuJGlkICsgJy0nICsgTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMTAwMDApO1xyXG5cclxuICAkc2NvcGUuZGlzYWJsZWQgPSBhbmd1bGFyLmlzRGVmaW5lZCgkYXR0cnMuZGlzYWJsZWQpIHx8IGZhbHNlO1xyXG4gIGlmIChhbmd1bGFyLmlzRGVmaW5lZCgkYXR0cnMubmdEaXNhYmxlZCkpIHtcclxuICAgIHdhdGNoTGlzdGVuZXJzLnB1c2goJHNjb3BlLiRwYXJlbnQuJHdhdGNoKCRhdHRycy5uZ0Rpc2FibGVkLCBmdW5jdGlvbihkaXNhYmxlZCkge1xyXG4gICAgICAkc2NvcGUuZGlzYWJsZWQgPSBkaXNhYmxlZDtcclxuICAgICAgc2VsZi5yZWZyZXNoVmlldygpO1xyXG4gICAgfSkpO1xyXG4gIH1cclxuXHJcbiAgJHNjb3BlLmlzQWN0aXZlID0gZnVuY3Rpb24oZGF0ZU9iamVjdCkge1xyXG4gICAgaWYgKHNlbGYuY29tcGFyZShkYXRlT2JqZWN0LmRhdGUsIHNlbGYuYWN0aXZlRGF0ZSkgPT09IDApIHtcclxuICAgICAgJHNjb3BlLmFjdGl2ZURhdGVJZCA9IGRhdGVPYmplY3QudWlkO1xyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9O1xyXG5cclxuICB0aGlzLmluaXQgPSBmdW5jdGlvbihuZ01vZGVsQ3RybF8pIHtcclxuICAgIG5nTW9kZWxDdHJsID0gbmdNb2RlbEN0cmxfO1xyXG4gICAgbmdNb2RlbE9wdGlvbnMgPSBuZ01vZGVsQ3RybF8uJG9wdGlvbnMgfHxcclxuICAgICAgJHNjb3BlLmRhdGVwaWNrZXJPcHRpb25zLm5nTW9kZWxPcHRpb25zIHx8XHJcbiAgICAgIGRhdGVwaWNrZXJDb25maWcubmdNb2RlbE9wdGlvbnM7XHJcbiAgICBpZiAoJHNjb3BlLmRhdGVwaWNrZXJPcHRpb25zLmluaXREYXRlKSB7XHJcbiAgICAgIHNlbGYuYWN0aXZlRGF0ZSA9IGRhdGVQYXJzZXIuZnJvbVRpbWV6b25lKCRzY29wZS5kYXRlcGlja2VyT3B0aW9ucy5pbml0RGF0ZSwgbmdNb2RlbE9wdGlvbnMudGltZXpvbmUpIHx8IG5ldyBEYXRlKCk7XHJcbiAgICAgICRzY29wZS4kd2F0Y2goJ2RhdGVwaWNrZXJPcHRpb25zLmluaXREYXRlJywgZnVuY3Rpb24oaW5pdERhdGUpIHtcclxuICAgICAgICBpZiAoaW5pdERhdGUgJiYgKG5nTW9kZWxDdHJsLiRpc0VtcHR5KG5nTW9kZWxDdHJsLiRtb2RlbFZhbHVlKSB8fCBuZ01vZGVsQ3RybC4kaW52YWxpZCkpIHtcclxuICAgICAgICAgIHNlbGYuYWN0aXZlRGF0ZSA9IGRhdGVQYXJzZXIuZnJvbVRpbWV6b25lKGluaXREYXRlLCBuZ01vZGVsT3B0aW9ucy50aW1lem9uZSk7XHJcbiAgICAgICAgICBzZWxmLnJlZnJlc2hWaWV3KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHNlbGYuYWN0aXZlRGF0ZSA9IG5ldyBEYXRlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGRhdGUgPSBuZ01vZGVsQ3RybC4kbW9kZWxWYWx1ZSA/IG5ldyBEYXRlKG5nTW9kZWxDdHJsLiRtb2RlbFZhbHVlKSA6IG5ldyBEYXRlKCk7XHJcbiAgICB0aGlzLmFjdGl2ZURhdGUgPSAhaXNOYU4oZGF0ZSkgP1xyXG4gICAgICBkYXRlUGFyc2VyLmZyb21UaW1lem9uZShkYXRlLCBuZ01vZGVsT3B0aW9ucy50aW1lem9uZSkgOlxyXG4gICAgICBkYXRlUGFyc2VyLmZyb21UaW1lem9uZShuZXcgRGF0ZSgpLCBuZ01vZGVsT3B0aW9ucy50aW1lem9uZSk7XHJcblxyXG4gICAgbmdNb2RlbEN0cmwuJHJlbmRlciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICBzZWxmLnJlbmRlcigpO1xyXG4gICAgfTtcclxuICB9O1xyXG5cclxuICB0aGlzLnJlbmRlciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgaWYgKG5nTW9kZWxDdHJsLiR2aWV3VmFsdWUpIHtcclxuICAgICAgdmFyIGRhdGUgPSBuZXcgRGF0ZShuZ01vZGVsQ3RybC4kdmlld1ZhbHVlKSxcclxuICAgICAgICAgIGlzVmFsaWQgPSAhaXNOYU4oZGF0ZSk7XHJcblxyXG4gICAgICBpZiAoaXNWYWxpZCkge1xyXG4gICAgICAgIHRoaXMuYWN0aXZlRGF0ZSA9IGRhdGVQYXJzZXIuZnJvbVRpbWV6b25lKGRhdGUsIG5nTW9kZWxPcHRpb25zLnRpbWV6b25lKTtcclxuICAgICAgfSBlbHNlIGlmICghJGRhdGVwaWNrZXJTdXBwcmVzc0Vycm9yKSB7XHJcbiAgICAgICAgJGxvZy5lcnJvcignRGF0ZXBpY2tlciBkaXJlY3RpdmU6IFwibmctbW9kZWxcIiB2YWx1ZSBtdXN0IGJlIGEgRGF0ZSBvYmplY3QnKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgdGhpcy5yZWZyZXNoVmlldygpO1xyXG4gIH07XHJcblxyXG4gIHRoaXMucmVmcmVzaFZpZXcgPSBmdW5jdGlvbigpIHtcclxuICAgIGlmICh0aGlzLmVsZW1lbnQpIHtcclxuICAgICAgJHNjb3BlLnNlbGVjdGVkRHQgPSBudWxsO1xyXG4gICAgICB0aGlzLl9yZWZyZXNoVmlldygpO1xyXG4gICAgICBpZiAoJHNjb3BlLmFjdGl2ZUR0KSB7XHJcbiAgICAgICAgJHNjb3BlLmFjdGl2ZURhdGVJZCA9ICRzY29wZS5hY3RpdmVEdC51aWQ7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHZhciBkYXRlID0gbmdNb2RlbEN0cmwuJHZpZXdWYWx1ZSA/IG5ldyBEYXRlKG5nTW9kZWxDdHJsLiR2aWV3VmFsdWUpIDogbnVsbDtcclxuICAgICAgZGF0ZSA9IGRhdGVQYXJzZXIuZnJvbVRpbWV6b25lKGRhdGUsIG5nTW9kZWxPcHRpb25zLnRpbWV6b25lKTtcclxuICAgICAgbmdNb2RlbEN0cmwuJHNldFZhbGlkaXR5KCdkYXRlRGlzYWJsZWQnLCAhZGF0ZSB8fFxyXG4gICAgICAgIHRoaXMuZWxlbWVudCAmJiAhdGhpcy5pc0Rpc2FibGVkKGRhdGUpKTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICB0aGlzLmNyZWF0ZURhdGVPYmplY3QgPSBmdW5jdGlvbihkYXRlLCBmb3JtYXQpIHtcclxuICAgIHZhciBtb2RlbCA9IG5nTW9kZWxDdHJsLiR2aWV3VmFsdWUgPyBuZXcgRGF0ZShuZ01vZGVsQ3RybC4kdmlld1ZhbHVlKSA6IG51bGw7XHJcbiAgICBtb2RlbCA9IGRhdGVQYXJzZXIuZnJvbVRpbWV6b25lKG1vZGVsLCBuZ01vZGVsT3B0aW9ucy50aW1lem9uZSk7XHJcbiAgICB2YXIgdG9kYXkgPSBuZXcgRGF0ZSgpO1xyXG4gICAgdG9kYXkgPSBkYXRlUGFyc2VyLmZyb21UaW1lem9uZSh0b2RheSwgbmdNb2RlbE9wdGlvbnMudGltZXpvbmUpO1xyXG4gICAgdmFyIHRpbWUgPSB0aGlzLmNvbXBhcmUoZGF0ZSwgdG9kYXkpO1xyXG4gICAgdmFyIGR0ID0ge1xyXG4gICAgICBkYXRlOiBkYXRlLFxyXG4gICAgICBsYWJlbDogZGF0ZVBhcnNlci5maWx0ZXIoZGF0ZSwgZm9ybWF0KSxcclxuICAgICAgc2VsZWN0ZWQ6IG1vZGVsICYmIHRoaXMuY29tcGFyZShkYXRlLCBtb2RlbCkgPT09IDAsXHJcbiAgICAgIGRpc2FibGVkOiB0aGlzLmlzRGlzYWJsZWQoZGF0ZSksXHJcbiAgICAgIHBhc3Q6IHRpbWUgPCAwLFxyXG4gICAgICBjdXJyZW50OiB0aW1lID09PSAwLFxyXG4gICAgICBmdXR1cmU6IHRpbWUgPiAwLFxyXG4gICAgICBjdXN0b21DbGFzczogdGhpcy5jdXN0b21DbGFzcyhkYXRlKSB8fCBudWxsXHJcbiAgICB9O1xyXG5cclxuICAgIGlmIChtb2RlbCAmJiB0aGlzLmNvbXBhcmUoZGF0ZSwgbW9kZWwpID09PSAwKSB7XHJcbiAgICAgICRzY29wZS5zZWxlY3RlZER0ID0gZHQ7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHNlbGYuYWN0aXZlRGF0ZSAmJiB0aGlzLmNvbXBhcmUoZHQuZGF0ZSwgc2VsZi5hY3RpdmVEYXRlKSA9PT0gMCkge1xyXG4gICAgICAkc2NvcGUuYWN0aXZlRHQgPSBkdDtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gZHQ7XHJcbiAgfTtcclxuXHJcbiAgdGhpcy5pc0Rpc2FibGVkID0gZnVuY3Rpb24oZGF0ZSkge1xyXG4gICAgcmV0dXJuICRzY29wZS5kaXNhYmxlZCB8fFxyXG4gICAgICB0aGlzLm1pbkRhdGUgJiYgdGhpcy5jb21wYXJlKGRhdGUsIHRoaXMubWluRGF0ZSkgPCAwIHx8XHJcbiAgICAgIHRoaXMubWF4RGF0ZSAmJiB0aGlzLmNvbXBhcmUoZGF0ZSwgdGhpcy5tYXhEYXRlKSA+IDAgfHxcclxuICAgICAgJHNjb3BlLmRhdGVEaXNhYmxlZCAmJiAkc2NvcGUuZGF0ZURpc2FibGVkKHtkYXRlOiBkYXRlLCBtb2RlOiAkc2NvcGUuZGF0ZXBpY2tlck1vZGV9KTtcclxuICB9O1xyXG5cclxuICB0aGlzLmN1c3RvbUNsYXNzID0gZnVuY3Rpb24oZGF0ZSkge1xyXG4gICAgcmV0dXJuICRzY29wZS5jdXN0b21DbGFzcyh7ZGF0ZTogZGF0ZSwgbW9kZTogJHNjb3BlLmRhdGVwaWNrZXJNb2RlfSk7XHJcbiAgfTtcclxuXHJcbiAgLy8gU3BsaXQgYXJyYXkgaW50byBzbWFsbGVyIGFycmF5c1xyXG4gIHRoaXMuc3BsaXQgPSBmdW5jdGlvbihhcnIsIHNpemUpIHtcclxuICAgIHZhciBhcnJheXMgPSBbXTtcclxuICAgIHdoaWxlIChhcnIubGVuZ3RoID4gMCkge1xyXG4gICAgICBhcnJheXMucHVzaChhcnIuc3BsaWNlKDAsIHNpemUpKTtcclxuICAgIH1cclxuICAgIHJldHVybiBhcnJheXM7XHJcbiAgfTtcclxuXHJcbiAgJHNjb3BlLnNlbGVjdCA9IGZ1bmN0aW9uKGRhdGUpIHtcclxuICAgIGlmICgkc2NvcGUuZGF0ZXBpY2tlck1vZGUgPT09IHNlbGYubWluTW9kZSkge1xyXG4gICAgICB2YXIgZHQgPSBuZ01vZGVsQ3RybC4kdmlld1ZhbHVlID8gZGF0ZVBhcnNlci5mcm9tVGltZXpvbmUobmV3IERhdGUobmdNb2RlbEN0cmwuJHZpZXdWYWx1ZSksIG5nTW9kZWxPcHRpb25zLnRpbWV6b25lKSA6IG5ldyBEYXRlKDAsIDAsIDAsIDAsIDAsIDAsIDApO1xyXG4gICAgICBkdC5zZXRGdWxsWWVhcihkYXRlLmdldEZ1bGxZZWFyKCksIGRhdGUuZ2V0TW9udGgoKSwgZGF0ZS5nZXREYXRlKCkpO1xyXG4gICAgICBkdCA9IGRhdGVQYXJzZXIudG9UaW1lem9uZShkdCwgbmdNb2RlbE9wdGlvbnMudGltZXpvbmUpO1xyXG4gICAgICBuZ01vZGVsQ3RybC4kc2V0Vmlld1ZhbHVlKGR0KTtcclxuICAgICAgbmdNb2RlbEN0cmwuJHJlbmRlcigpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgc2VsZi5hY3RpdmVEYXRlID0gZGF0ZTtcclxuICAgICAgc2V0TW9kZShzZWxmLm1vZGVzW3NlbGYubW9kZXMuaW5kZXhPZigkc2NvcGUuZGF0ZXBpY2tlck1vZGUpIC0gMV0pO1xyXG5cclxuICAgICAgJHNjb3BlLiRlbWl0KCd1aWI6ZGF0ZXBpY2tlci5tb2RlJyk7XHJcbiAgICB9XHJcblxyXG4gICAgJHNjb3BlLiRicm9hZGNhc3QoJ3VpYjpkYXRlcGlja2VyLmZvY3VzJyk7XHJcbiAgfTtcclxuXHJcbiAgJHNjb3BlLm1vdmUgPSBmdW5jdGlvbihkaXJlY3Rpb24pIHtcclxuICAgIHZhciB5ZWFyID0gc2VsZi5hY3RpdmVEYXRlLmdldEZ1bGxZZWFyKCkgKyBkaXJlY3Rpb24gKiAoc2VsZi5zdGVwLnllYXJzIHx8IDApLFxyXG4gICAgICAgIG1vbnRoID0gc2VsZi5hY3RpdmVEYXRlLmdldE1vbnRoKCkgKyBkaXJlY3Rpb24gKiAoc2VsZi5zdGVwLm1vbnRocyB8fCAwKTtcclxuICAgIHNlbGYuYWN0aXZlRGF0ZS5zZXRGdWxsWWVhcih5ZWFyLCBtb250aCwgMSk7XHJcbiAgICBzZWxmLnJlZnJlc2hWaWV3KCk7XHJcbiAgfTtcclxuXHJcbiAgJHNjb3BlLnRvZ2dsZU1vZGUgPSBmdW5jdGlvbihkaXJlY3Rpb24pIHtcclxuICAgIGRpcmVjdGlvbiA9IGRpcmVjdGlvbiB8fCAxO1xyXG5cclxuICAgIGlmICgkc2NvcGUuZGF0ZXBpY2tlck1vZGUgPT09IHNlbGYubWF4TW9kZSAmJiBkaXJlY3Rpb24gPT09IDEgfHxcclxuICAgICAgJHNjb3BlLmRhdGVwaWNrZXJNb2RlID09PSBzZWxmLm1pbk1vZGUgJiYgZGlyZWN0aW9uID09PSAtMSkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgc2V0TW9kZShzZWxmLm1vZGVzW3NlbGYubW9kZXMuaW5kZXhPZigkc2NvcGUuZGF0ZXBpY2tlck1vZGUpICsgZGlyZWN0aW9uXSk7XHJcblxyXG4gICAgJHNjb3BlLiRlbWl0KCd1aWI6ZGF0ZXBpY2tlci5tb2RlJyk7XHJcbiAgfTtcclxuXHJcbiAgLy8gS2V5IGV2ZW50IG1hcHBlclxyXG4gICRzY29wZS5rZXlzID0geyAxMzogJ2VudGVyJywgMzI6ICdzcGFjZScsIDMzOiAncGFnZXVwJywgMzQ6ICdwYWdlZG93bicsIDM1OiAnZW5kJywgMzY6ICdob21lJywgMzc6ICdsZWZ0JywgMzg6ICd1cCcsIDM5OiAncmlnaHQnLCA0MDogJ2Rvd24nIH07XHJcblxyXG4gIHZhciBmb2N1c0VsZW1lbnQgPSBmdW5jdGlvbigpIHtcclxuICAgIHNlbGYuZWxlbWVudFswXS5mb2N1cygpO1xyXG4gIH07XHJcblxyXG4gIC8vIExpc3RlbiBmb3IgZm9jdXMgcmVxdWVzdHMgZnJvbSBwb3B1cCBkaXJlY3RpdmVcclxuICAkc2NvcGUuJG9uKCd1aWI6ZGF0ZXBpY2tlci5mb2N1cycsIGZvY3VzRWxlbWVudCk7XHJcblxyXG4gICRzY29wZS5rZXlkb3duID0gZnVuY3Rpb24oZXZ0KSB7XHJcbiAgICB2YXIga2V5ID0gJHNjb3BlLmtleXNbZXZ0LndoaWNoXTtcclxuXHJcbiAgICBpZiAoIWtleSB8fCBldnQuc2hpZnRLZXkgfHwgZXZ0LmFsdEtleSB8fCAkc2NvcGUuZGlzYWJsZWQpIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgaWYgKCFzZWxmLnNob3J0Y3V0UHJvcGFnYXRpb24pIHtcclxuICAgICAgZXZ0LnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChrZXkgPT09ICdlbnRlcicgfHwga2V5ID09PSAnc3BhY2UnKSB7XHJcbiAgICAgIGlmIChzZWxmLmlzRGlzYWJsZWQoc2VsZi5hY3RpdmVEYXRlKSkge1xyXG4gICAgICAgIHJldHVybjsgLy8gZG8gbm90aGluZ1xyXG4gICAgICB9XHJcbiAgICAgICRzY29wZS5zZWxlY3Qoc2VsZi5hY3RpdmVEYXRlKTtcclxuICAgIH0gZWxzZSBpZiAoZXZ0LmN0cmxLZXkgJiYgKGtleSA9PT0gJ3VwJyB8fCBrZXkgPT09ICdkb3duJykpIHtcclxuICAgICAgJHNjb3BlLnRvZ2dsZU1vZGUoa2V5ID09PSAndXAnID8gMSA6IC0xKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHNlbGYuaGFuZGxlS2V5RG93bihrZXksIGV2dCk7XHJcbiAgICAgIHNlbGYucmVmcmVzaFZpZXcoKTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICAkZWxlbWVudC5vbigna2V5ZG93bicsIGZ1bmN0aW9uKGV2dCkge1xyXG4gICAgJHNjb3BlLiRhcHBseShmdW5jdGlvbigpIHtcclxuICAgICAgJHNjb3BlLmtleWRvd24oZXZ0KTtcclxuICAgIH0pO1xyXG4gIH0pO1xyXG5cclxuICAkc2NvcGUuJG9uKCckZGVzdHJveScsIGZ1bmN0aW9uKCkge1xyXG4gICAgLy9DbGVhciBhbGwgd2F0Y2ggbGlzdGVuZXJzIG9uIGRlc3Ryb3lcclxuICAgIHdoaWxlICh3YXRjaExpc3RlbmVycy5sZW5ndGgpIHtcclxuICAgICAgd2F0Y2hMaXN0ZW5lcnMuc2hpZnQoKSgpO1xyXG4gICAgfVxyXG4gIH0pO1xyXG5cclxuICBmdW5jdGlvbiBzZXRNb2RlKG1vZGUpIHtcclxuICAgICRzY29wZS5kYXRlcGlja2VyTW9kZSA9IG1vZGU7XHJcbiAgICAkc2NvcGUuZGF0ZXBpY2tlck9wdGlvbnMuZGF0ZXBpY2tlck1vZGUgPSBtb2RlO1xyXG4gIH1cclxufV0pXHJcblxyXG4uY29udHJvbGxlcignVWliRGF5cGlja2VyQ29udHJvbGxlcicsIFsnJHNjb3BlJywgJyRlbGVtZW50JywgJ2RhdGVGaWx0ZXInLCBmdW5jdGlvbihzY29wZSwgJGVsZW1lbnQsIGRhdGVGaWx0ZXIpIHtcclxuICB2YXIgREFZU19JTl9NT05USCA9IFszMSwgMjgsIDMxLCAzMCwgMzEsIDMwLCAzMSwgMzEsIDMwLCAzMSwgMzAsIDMxXTtcclxuXHJcbiAgdGhpcy5zdGVwID0geyBtb250aHM6IDEgfTtcclxuICB0aGlzLmVsZW1lbnQgPSAkZWxlbWVudDtcclxuICBmdW5jdGlvbiBnZXREYXlzSW5Nb250aCh5ZWFyLCBtb250aCkge1xyXG4gICAgcmV0dXJuIG1vbnRoID09PSAxICYmIHllYXIgJSA0ID09PSAwICYmXHJcbiAgICAgICh5ZWFyICUgMTAwICE9PSAwIHx8IHllYXIgJSA0MDAgPT09IDApID8gMjkgOiBEQVlTX0lOX01PTlRIW21vbnRoXTtcclxuICB9XHJcblxyXG4gIHRoaXMuaW5pdCA9IGZ1bmN0aW9uKGN0cmwpIHtcclxuICAgIGFuZ3VsYXIuZXh0ZW5kKGN0cmwsIHRoaXMpO1xyXG4gICAgc2NvcGUuc2hvd1dlZWtzID0gY3RybC5zaG93V2Vla3M7XHJcbiAgICBjdHJsLnJlZnJlc2hWaWV3KCk7XHJcbiAgfTtcclxuXHJcbiAgdGhpcy5nZXREYXRlcyA9IGZ1bmN0aW9uKHN0YXJ0RGF0ZSwgbikge1xyXG4gICAgdmFyIGRhdGVzID0gbmV3IEFycmF5KG4pLCBjdXJyZW50ID0gbmV3IERhdGUoc3RhcnREYXRlKSwgaSA9IDAsIGRhdGU7XHJcbiAgICB3aGlsZSAoaSA8IG4pIHtcclxuICAgICAgZGF0ZSA9IG5ldyBEYXRlKGN1cnJlbnQpO1xyXG4gICAgICBkYXRlc1tpKytdID0gZGF0ZTtcclxuICAgICAgY3VycmVudC5zZXREYXRlKGN1cnJlbnQuZ2V0RGF0ZSgpICsgMSk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZGF0ZXM7XHJcbiAgfTtcclxuXHJcbiAgdGhpcy5fcmVmcmVzaFZpZXcgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciB5ZWFyID0gdGhpcy5hY3RpdmVEYXRlLmdldEZ1bGxZZWFyKCksXHJcbiAgICAgIG1vbnRoID0gdGhpcy5hY3RpdmVEYXRlLmdldE1vbnRoKCksXHJcbiAgICAgIGZpcnN0RGF5T2ZNb250aCA9IG5ldyBEYXRlKHRoaXMuYWN0aXZlRGF0ZSk7XHJcblxyXG4gICAgZmlyc3REYXlPZk1vbnRoLnNldEZ1bGxZZWFyKHllYXIsIG1vbnRoLCAxKTtcclxuXHJcbiAgICB2YXIgZGlmZmVyZW5jZSA9IHRoaXMuc3RhcnRpbmdEYXkgLSBmaXJzdERheU9mTW9udGguZ2V0RGF5KCksXHJcbiAgICAgIG51bURpc3BsYXllZEZyb21QcmV2aW91c01vbnRoID0gZGlmZmVyZW5jZSA+IDAgP1xyXG4gICAgICAgIDcgLSBkaWZmZXJlbmNlIDogLSBkaWZmZXJlbmNlLFxyXG4gICAgICBmaXJzdERhdGUgPSBuZXcgRGF0ZShmaXJzdERheU9mTW9udGgpO1xyXG5cclxuICAgIGlmIChudW1EaXNwbGF5ZWRGcm9tUHJldmlvdXNNb250aCA+IDApIHtcclxuICAgICAgZmlyc3REYXRlLnNldERhdGUoLW51bURpc3BsYXllZEZyb21QcmV2aW91c01vbnRoICsgMSk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gNDIgaXMgdGhlIG51bWJlciBvZiBkYXlzIG9uIGEgc2l4LXdlZWsgY2FsZW5kYXJcclxuICAgIHZhciBkYXlzID0gdGhpcy5nZXREYXRlcyhmaXJzdERhdGUsIDQyKTtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgNDI7IGkgKyspIHtcclxuICAgICAgZGF5c1tpXSA9IGFuZ3VsYXIuZXh0ZW5kKHRoaXMuY3JlYXRlRGF0ZU9iamVjdChkYXlzW2ldLCB0aGlzLmZvcm1hdERheSksIHtcclxuICAgICAgICBzZWNvbmRhcnk6IGRheXNbaV0uZ2V0TW9udGgoKSAhPT0gbW9udGgsXHJcbiAgICAgICAgdWlkOiBzY29wZS51bmlxdWVJZCArICctJyArIGlcclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgc2NvcGUubGFiZWxzID0gbmV3IEFycmF5KDcpO1xyXG4gICAgZm9yICh2YXIgaiA9IDA7IGogPCA3OyBqKyspIHtcclxuICAgICAgc2NvcGUubGFiZWxzW2pdID0ge1xyXG4gICAgICAgIGFiYnI6IGRhdGVGaWx0ZXIoZGF5c1tqXS5kYXRlLCB0aGlzLmZvcm1hdERheUhlYWRlciksXHJcbiAgICAgICAgZnVsbDogZGF0ZUZpbHRlcihkYXlzW2pdLmRhdGUsICdFRUVFJylcclxuICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICBzY29wZS50aXRsZSA9IGRhdGVGaWx0ZXIodGhpcy5hY3RpdmVEYXRlLCB0aGlzLmZvcm1hdERheVRpdGxlKTtcclxuICAgIHNjb3BlLnJvd3MgPSB0aGlzLnNwbGl0KGRheXMsIDcpO1xyXG5cclxuICAgIGlmIChzY29wZS5zaG93V2Vla3MpIHtcclxuICAgICAgc2NvcGUud2Vla051bWJlcnMgPSBbXTtcclxuICAgICAgdmFyIHRodXJzZGF5SW5kZXggPSAoNCArIDcgLSB0aGlzLnN0YXJ0aW5nRGF5KSAlIDcsXHJcbiAgICAgICAgICBudW1XZWVrcyA9IHNjb3BlLnJvd3MubGVuZ3RoO1xyXG4gICAgICBmb3IgKHZhciBjdXJXZWVrID0gMDsgY3VyV2VlayA8IG51bVdlZWtzOyBjdXJXZWVrKyspIHtcclxuICAgICAgICBzY29wZS53ZWVrTnVtYmVycy5wdXNoKFxyXG4gICAgICAgICAgZ2V0SVNPODYwMVdlZWtOdW1iZXIoc2NvcGUucm93c1tjdXJXZWVrXVt0aHVyc2RheUluZGV4XS5kYXRlKSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9O1xyXG5cclxuICB0aGlzLmNvbXBhcmUgPSBmdW5jdGlvbihkYXRlMSwgZGF0ZTIpIHtcclxuICAgIHZhciBfZGF0ZTEgPSBuZXcgRGF0ZShkYXRlMS5nZXRGdWxsWWVhcigpLCBkYXRlMS5nZXRNb250aCgpLCBkYXRlMS5nZXREYXRlKCkpO1xyXG4gICAgdmFyIF9kYXRlMiA9IG5ldyBEYXRlKGRhdGUyLmdldEZ1bGxZZWFyKCksIGRhdGUyLmdldE1vbnRoKCksIGRhdGUyLmdldERhdGUoKSk7XHJcbiAgICBfZGF0ZTEuc2V0RnVsbFllYXIoZGF0ZTEuZ2V0RnVsbFllYXIoKSk7XHJcbiAgICBfZGF0ZTIuc2V0RnVsbFllYXIoZGF0ZTIuZ2V0RnVsbFllYXIoKSk7XHJcbiAgICByZXR1cm4gX2RhdGUxIC0gX2RhdGUyO1xyXG4gIH07XHJcblxyXG4gIGZ1bmN0aW9uIGdldElTTzg2MDFXZWVrTnVtYmVyKGRhdGUpIHtcclxuICAgIHZhciBjaGVja0RhdGUgPSBuZXcgRGF0ZShkYXRlKTtcclxuICAgIGNoZWNrRGF0ZS5zZXREYXRlKGNoZWNrRGF0ZS5nZXREYXRlKCkgKyA0IC0gKGNoZWNrRGF0ZS5nZXREYXkoKSB8fCA3KSk7IC8vIFRodXJzZGF5XHJcbiAgICB2YXIgdGltZSA9IGNoZWNrRGF0ZS5nZXRUaW1lKCk7XHJcbiAgICBjaGVja0RhdGUuc2V0TW9udGgoMCk7IC8vIENvbXBhcmUgd2l0aCBKYW4gMVxyXG4gICAgY2hlY2tEYXRlLnNldERhdGUoMSk7XHJcbiAgICByZXR1cm4gTWF0aC5mbG9vcihNYXRoLnJvdW5kKCh0aW1lIC0gY2hlY2tEYXRlKSAvIDg2NDAwMDAwKSAvIDcpICsgMTtcclxuICB9XHJcblxyXG4gIHRoaXMuaGFuZGxlS2V5RG93biA9IGZ1bmN0aW9uKGtleSwgZXZ0KSB7XHJcbiAgICB2YXIgZGF0ZSA9IHRoaXMuYWN0aXZlRGF0ZS5nZXREYXRlKCk7XHJcblxyXG4gICAgaWYgKGtleSA9PT0gJ2xlZnQnKSB7XHJcbiAgICAgIGRhdGUgPSBkYXRlIC0gMTtcclxuICAgIH0gZWxzZSBpZiAoa2V5ID09PSAndXAnKSB7XHJcbiAgICAgIGRhdGUgPSBkYXRlIC0gNztcclxuICAgIH0gZWxzZSBpZiAoa2V5ID09PSAncmlnaHQnKSB7XHJcbiAgICAgIGRhdGUgPSBkYXRlICsgMTtcclxuICAgIH0gZWxzZSBpZiAoa2V5ID09PSAnZG93bicpIHtcclxuICAgICAgZGF0ZSA9IGRhdGUgKyA3O1xyXG4gICAgfSBlbHNlIGlmIChrZXkgPT09ICdwYWdldXAnIHx8IGtleSA9PT0gJ3BhZ2Vkb3duJykge1xyXG4gICAgICB2YXIgbW9udGggPSB0aGlzLmFjdGl2ZURhdGUuZ2V0TW9udGgoKSArIChrZXkgPT09ICdwYWdldXAnID8gLSAxIDogMSk7XHJcbiAgICAgIHRoaXMuYWN0aXZlRGF0ZS5zZXRNb250aChtb250aCwgMSk7XHJcbiAgICAgIGRhdGUgPSBNYXRoLm1pbihnZXREYXlzSW5Nb250aCh0aGlzLmFjdGl2ZURhdGUuZ2V0RnVsbFllYXIoKSwgdGhpcy5hY3RpdmVEYXRlLmdldE1vbnRoKCkpLCBkYXRlKTtcclxuICAgIH0gZWxzZSBpZiAoa2V5ID09PSAnaG9tZScpIHtcclxuICAgICAgZGF0ZSA9IDE7XHJcbiAgICB9IGVsc2UgaWYgKGtleSA9PT0gJ2VuZCcpIHtcclxuICAgICAgZGF0ZSA9IGdldERheXNJbk1vbnRoKHRoaXMuYWN0aXZlRGF0ZS5nZXRGdWxsWWVhcigpLCB0aGlzLmFjdGl2ZURhdGUuZ2V0TW9udGgoKSk7XHJcbiAgICB9XHJcbiAgICB0aGlzLmFjdGl2ZURhdGUuc2V0RGF0ZShkYXRlKTtcclxuICB9O1xyXG59XSlcclxuXHJcbi5jb250cm9sbGVyKCdVaWJNb250aHBpY2tlckNvbnRyb2xsZXInLCBbJyRzY29wZScsICckZWxlbWVudCcsICdkYXRlRmlsdGVyJywgZnVuY3Rpb24oc2NvcGUsICRlbGVtZW50LCBkYXRlRmlsdGVyKSB7XHJcbiAgdGhpcy5zdGVwID0geyB5ZWFyczogMSB9O1xyXG4gIHRoaXMuZWxlbWVudCA9ICRlbGVtZW50O1xyXG5cclxuICB0aGlzLmluaXQgPSBmdW5jdGlvbihjdHJsKSB7XHJcbiAgICBhbmd1bGFyLmV4dGVuZChjdHJsLCB0aGlzKTtcclxuICAgIGN0cmwucmVmcmVzaFZpZXcoKTtcclxuICB9O1xyXG5cclxuICB0aGlzLl9yZWZyZXNoVmlldyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIG1vbnRocyA9IG5ldyBBcnJheSgxMiksXHJcbiAgICAgICAgeWVhciA9IHRoaXMuYWN0aXZlRGF0ZS5nZXRGdWxsWWVhcigpLFxyXG4gICAgICAgIGRhdGU7XHJcblxyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCAxMjsgaSsrKSB7XHJcbiAgICAgIGRhdGUgPSBuZXcgRGF0ZSh0aGlzLmFjdGl2ZURhdGUpO1xyXG4gICAgICBkYXRlLnNldEZ1bGxZZWFyKHllYXIsIGksIDEpO1xyXG4gICAgICBtb250aHNbaV0gPSBhbmd1bGFyLmV4dGVuZCh0aGlzLmNyZWF0ZURhdGVPYmplY3QoZGF0ZSwgdGhpcy5mb3JtYXRNb250aCksIHtcclxuICAgICAgICB1aWQ6IHNjb3BlLnVuaXF1ZUlkICsgJy0nICsgaVxyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBzY29wZS50aXRsZSA9IGRhdGVGaWx0ZXIodGhpcy5hY3RpdmVEYXRlLCB0aGlzLmZvcm1hdE1vbnRoVGl0bGUpO1xyXG4gICAgc2NvcGUucm93cyA9IHRoaXMuc3BsaXQobW9udGhzLCB0aGlzLm1vbnRoQ29sdW1ucyk7XHJcbiAgICBzY29wZS55ZWFySGVhZGVyQ29sc3BhbiA9IHRoaXMubW9udGhDb2x1bW5zID4gMyA/IHRoaXMubW9udGhDb2x1bW5zIC0gMiA6IDE7XHJcbiAgfTtcclxuXHJcbiAgdGhpcy5jb21wYXJlID0gZnVuY3Rpb24oZGF0ZTEsIGRhdGUyKSB7XHJcbiAgICB2YXIgX2RhdGUxID0gbmV3IERhdGUoZGF0ZTEuZ2V0RnVsbFllYXIoKSwgZGF0ZTEuZ2V0TW9udGgoKSk7XHJcbiAgICB2YXIgX2RhdGUyID0gbmV3IERhdGUoZGF0ZTIuZ2V0RnVsbFllYXIoKSwgZGF0ZTIuZ2V0TW9udGgoKSk7XHJcbiAgICBfZGF0ZTEuc2V0RnVsbFllYXIoZGF0ZTEuZ2V0RnVsbFllYXIoKSk7XHJcbiAgICBfZGF0ZTIuc2V0RnVsbFllYXIoZGF0ZTIuZ2V0RnVsbFllYXIoKSk7XHJcbiAgICByZXR1cm4gX2RhdGUxIC0gX2RhdGUyO1xyXG4gIH07XHJcblxyXG4gIHRoaXMuaGFuZGxlS2V5RG93biA9IGZ1bmN0aW9uKGtleSwgZXZ0KSB7XHJcbiAgICB2YXIgZGF0ZSA9IHRoaXMuYWN0aXZlRGF0ZS5nZXRNb250aCgpO1xyXG5cclxuICAgIGlmIChrZXkgPT09ICdsZWZ0Jykge1xyXG4gICAgICBkYXRlID0gZGF0ZSAtIDE7XHJcbiAgICB9IGVsc2UgaWYgKGtleSA9PT0gJ3VwJykge1xyXG4gICAgICBkYXRlID0gZGF0ZSAtIHRoaXMubW9udGhDb2x1bW5zO1xyXG4gICAgfSBlbHNlIGlmIChrZXkgPT09ICdyaWdodCcpIHtcclxuICAgICAgZGF0ZSA9IGRhdGUgKyAxO1xyXG4gICAgfSBlbHNlIGlmIChrZXkgPT09ICdkb3duJykge1xyXG4gICAgICBkYXRlID0gZGF0ZSArIHRoaXMubW9udGhDb2x1bW5zO1xyXG4gICAgfSBlbHNlIGlmIChrZXkgPT09ICdwYWdldXAnIHx8IGtleSA9PT0gJ3BhZ2Vkb3duJykge1xyXG4gICAgICB2YXIgeWVhciA9IHRoaXMuYWN0aXZlRGF0ZS5nZXRGdWxsWWVhcigpICsgKGtleSA9PT0gJ3BhZ2V1cCcgPyAtIDEgOiAxKTtcclxuICAgICAgdGhpcy5hY3RpdmVEYXRlLnNldEZ1bGxZZWFyKHllYXIpO1xyXG4gICAgfSBlbHNlIGlmIChrZXkgPT09ICdob21lJykge1xyXG4gICAgICBkYXRlID0gMDtcclxuICAgIH0gZWxzZSBpZiAoa2V5ID09PSAnZW5kJykge1xyXG4gICAgICBkYXRlID0gMTE7XHJcbiAgICB9XHJcbiAgICB0aGlzLmFjdGl2ZURhdGUuc2V0TW9udGgoZGF0ZSk7XHJcbiAgfTtcclxufV0pXHJcblxyXG4uY29udHJvbGxlcignVWliWWVhcnBpY2tlckNvbnRyb2xsZXInLCBbJyRzY29wZScsICckZWxlbWVudCcsICdkYXRlRmlsdGVyJywgZnVuY3Rpb24oc2NvcGUsICRlbGVtZW50LCBkYXRlRmlsdGVyKSB7XHJcbiAgdmFyIGNvbHVtbnMsIHJhbmdlO1xyXG4gIHRoaXMuZWxlbWVudCA9ICRlbGVtZW50O1xyXG5cclxuICBmdW5jdGlvbiBnZXRTdGFydGluZ1llYXIoeWVhcikge1xyXG4gICAgcmV0dXJuIHBhcnNlSW50KCh5ZWFyIC0gMSkgLyByYW5nZSwgMTApICogcmFuZ2UgKyAxO1xyXG4gIH1cclxuXHJcbiAgdGhpcy55ZWFycGlja2VySW5pdCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgY29sdW1ucyA9IHRoaXMueWVhckNvbHVtbnM7XHJcbiAgICByYW5nZSA9IHRoaXMueWVhclJvd3MgKiBjb2x1bW5zO1xyXG4gICAgdGhpcy5zdGVwID0geyB5ZWFyczogcmFuZ2UgfTtcclxuICB9O1xyXG5cclxuICB0aGlzLl9yZWZyZXNoVmlldyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIHllYXJzID0gbmV3IEFycmF5KHJhbmdlKSwgZGF0ZTtcclxuXHJcbiAgICBmb3IgKHZhciBpID0gMCwgc3RhcnQgPSBnZXRTdGFydGluZ1llYXIodGhpcy5hY3RpdmVEYXRlLmdldEZ1bGxZZWFyKCkpOyBpIDwgcmFuZ2U7IGkrKykge1xyXG4gICAgICBkYXRlID0gbmV3IERhdGUodGhpcy5hY3RpdmVEYXRlKTtcclxuICAgICAgZGF0ZS5zZXRGdWxsWWVhcihzdGFydCArIGksIDAsIDEpO1xyXG4gICAgICB5ZWFyc1tpXSA9IGFuZ3VsYXIuZXh0ZW5kKHRoaXMuY3JlYXRlRGF0ZU9iamVjdChkYXRlLCB0aGlzLmZvcm1hdFllYXIpLCB7XHJcbiAgICAgICAgdWlkOiBzY29wZS51bmlxdWVJZCArICctJyArIGlcclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgc2NvcGUudGl0bGUgPSBbeWVhcnNbMF0ubGFiZWwsIHllYXJzW3JhbmdlIC0gMV0ubGFiZWxdLmpvaW4oJyAtICcpO1xyXG4gICAgc2NvcGUucm93cyA9IHRoaXMuc3BsaXQoeWVhcnMsIGNvbHVtbnMpO1xyXG4gICAgc2NvcGUuY29sdW1ucyA9IGNvbHVtbnM7XHJcbiAgfTtcclxuXHJcbiAgdGhpcy5jb21wYXJlID0gZnVuY3Rpb24oZGF0ZTEsIGRhdGUyKSB7XHJcbiAgICByZXR1cm4gZGF0ZTEuZ2V0RnVsbFllYXIoKSAtIGRhdGUyLmdldEZ1bGxZZWFyKCk7XHJcbiAgfTtcclxuXHJcbiAgdGhpcy5oYW5kbGVLZXlEb3duID0gZnVuY3Rpb24oa2V5LCBldnQpIHtcclxuICAgIHZhciBkYXRlID0gdGhpcy5hY3RpdmVEYXRlLmdldEZ1bGxZZWFyKCk7XHJcblxyXG4gICAgaWYgKGtleSA9PT0gJ2xlZnQnKSB7XHJcbiAgICAgIGRhdGUgPSBkYXRlIC0gMTtcclxuICAgIH0gZWxzZSBpZiAoa2V5ID09PSAndXAnKSB7XHJcbiAgICAgIGRhdGUgPSBkYXRlIC0gY29sdW1ucztcclxuICAgIH0gZWxzZSBpZiAoa2V5ID09PSAncmlnaHQnKSB7XHJcbiAgICAgIGRhdGUgPSBkYXRlICsgMTtcclxuICAgIH0gZWxzZSBpZiAoa2V5ID09PSAnZG93bicpIHtcclxuICAgICAgZGF0ZSA9IGRhdGUgKyBjb2x1bW5zO1xyXG4gICAgfSBlbHNlIGlmIChrZXkgPT09ICdwYWdldXAnIHx8IGtleSA9PT0gJ3BhZ2Vkb3duJykge1xyXG4gICAgICBkYXRlICs9IChrZXkgPT09ICdwYWdldXAnID8gLSAxIDogMSkgKiByYW5nZTtcclxuICAgIH0gZWxzZSBpZiAoa2V5ID09PSAnaG9tZScpIHtcclxuICAgICAgZGF0ZSA9IGdldFN0YXJ0aW5nWWVhcih0aGlzLmFjdGl2ZURhdGUuZ2V0RnVsbFllYXIoKSk7XHJcbiAgICB9IGVsc2UgaWYgKGtleSA9PT0gJ2VuZCcpIHtcclxuICAgICAgZGF0ZSA9IGdldFN0YXJ0aW5nWWVhcih0aGlzLmFjdGl2ZURhdGUuZ2V0RnVsbFllYXIoKSkgKyByYW5nZSAtIDE7XHJcbiAgICB9XHJcbiAgICB0aGlzLmFjdGl2ZURhdGUuc2V0RnVsbFllYXIoZGF0ZSk7XHJcbiAgfTtcclxufV0pXHJcblxyXG4uZGlyZWN0aXZlKCd1aWJEYXRlcGlja2VyJywgZnVuY3Rpb24oKSB7XHJcbiAgcmV0dXJuIHtcclxuICAgIHRlbXBsYXRlVXJsOiBmdW5jdGlvbihlbGVtZW50LCBhdHRycykge1xyXG4gICAgICByZXR1cm4gYXR0cnMudGVtcGxhdGVVcmwgfHwgJ3VpYi90ZW1wbGF0ZS9kYXRlcGlja2VyL2RhdGVwaWNrZXIuaHRtbCc7XHJcbiAgICB9LFxyXG4gICAgc2NvcGU6IHtcclxuICAgICAgZGF0ZXBpY2tlck9wdGlvbnM6ICc9PydcclxuICAgIH0sXHJcbiAgICByZXF1aXJlOiBbJ3VpYkRhdGVwaWNrZXInLCAnXm5nTW9kZWwnXSxcclxuICAgIHJlc3RyaWN0OiAnQScsXHJcbiAgICBjb250cm9sbGVyOiAnVWliRGF0ZXBpY2tlckNvbnRyb2xsZXInLFxyXG4gICAgY29udHJvbGxlckFzOiAnZGF0ZXBpY2tlcicsXHJcbiAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxlbWVudCwgYXR0cnMsIGN0cmxzKSB7XHJcbiAgICAgIHZhciBkYXRlcGlja2VyQ3RybCA9IGN0cmxzWzBdLCBuZ01vZGVsQ3RybCA9IGN0cmxzWzFdO1xyXG5cclxuICAgICAgZGF0ZXBpY2tlckN0cmwuaW5pdChuZ01vZGVsQ3RybCk7XHJcbiAgICB9XHJcbiAgfTtcclxufSlcclxuXHJcbi5kaXJlY3RpdmUoJ3VpYkRheXBpY2tlcicsIGZ1bmN0aW9uKCkge1xyXG4gIHJldHVybiB7XHJcbiAgICB0ZW1wbGF0ZVVybDogZnVuY3Rpb24oZWxlbWVudCwgYXR0cnMpIHtcclxuICAgICAgcmV0dXJuIGF0dHJzLnRlbXBsYXRlVXJsIHx8ICd1aWIvdGVtcGxhdGUvZGF0ZXBpY2tlci9kYXkuaHRtbCc7XHJcbiAgICB9LFxyXG4gICAgcmVxdWlyZTogWydedWliRGF0ZXBpY2tlcicsICd1aWJEYXlwaWNrZXInXSxcclxuICAgIHJlc3RyaWN0OiAnQScsXHJcbiAgICBjb250cm9sbGVyOiAnVWliRGF5cGlja2VyQ29udHJvbGxlcicsXHJcbiAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxlbWVudCwgYXR0cnMsIGN0cmxzKSB7XHJcbiAgICAgIHZhciBkYXRlcGlja2VyQ3RybCA9IGN0cmxzWzBdLFxyXG4gICAgICAgIGRheXBpY2tlckN0cmwgPSBjdHJsc1sxXTtcclxuXHJcbiAgICAgIGRheXBpY2tlckN0cmwuaW5pdChkYXRlcGlja2VyQ3RybCk7XHJcbiAgICB9XHJcbiAgfTtcclxufSlcclxuXHJcbi5kaXJlY3RpdmUoJ3VpYk1vbnRocGlja2VyJywgZnVuY3Rpb24oKSB7XHJcbiAgcmV0dXJuIHtcclxuICAgIHRlbXBsYXRlVXJsOiBmdW5jdGlvbihlbGVtZW50LCBhdHRycykge1xyXG4gICAgICByZXR1cm4gYXR0cnMudGVtcGxhdGVVcmwgfHwgJ3VpYi90ZW1wbGF0ZS9kYXRlcGlja2VyL21vbnRoLmh0bWwnO1xyXG4gICAgfSxcclxuICAgIHJlcXVpcmU6IFsnXnVpYkRhdGVwaWNrZXInLCAndWliTW9udGhwaWNrZXInXSxcclxuICAgIHJlc3RyaWN0OiAnQScsXHJcbiAgICBjb250cm9sbGVyOiAnVWliTW9udGhwaWNrZXJDb250cm9sbGVyJyxcclxuICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBlbGVtZW50LCBhdHRycywgY3RybHMpIHtcclxuICAgICAgdmFyIGRhdGVwaWNrZXJDdHJsID0gY3RybHNbMF0sXHJcbiAgICAgICAgbW9udGhwaWNrZXJDdHJsID0gY3RybHNbMV07XHJcblxyXG4gICAgICBtb250aHBpY2tlckN0cmwuaW5pdChkYXRlcGlja2VyQ3RybCk7XHJcbiAgICB9XHJcbiAgfTtcclxufSlcclxuXHJcbi5kaXJlY3RpdmUoJ3VpYlllYXJwaWNrZXInLCBmdW5jdGlvbigpIHtcclxuICByZXR1cm4ge1xyXG4gICAgdGVtcGxhdGVVcmw6IGZ1bmN0aW9uKGVsZW1lbnQsIGF0dHJzKSB7XHJcbiAgICAgIHJldHVybiBhdHRycy50ZW1wbGF0ZVVybCB8fCAndWliL3RlbXBsYXRlL2RhdGVwaWNrZXIveWVhci5odG1sJztcclxuICAgIH0sXHJcbiAgICByZXF1aXJlOiBbJ151aWJEYXRlcGlja2VyJywgJ3VpYlllYXJwaWNrZXInXSxcclxuICAgIHJlc3RyaWN0OiAnQScsXHJcbiAgICBjb250cm9sbGVyOiAnVWliWWVhcnBpY2tlckNvbnRyb2xsZXInLFxyXG4gICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCBjdHJscykge1xyXG4gICAgICB2YXIgY3RybCA9IGN0cmxzWzBdO1xyXG4gICAgICBhbmd1bGFyLmV4dGVuZChjdHJsLCBjdHJsc1sxXSk7XHJcbiAgICAgIGN0cmwueWVhcnBpY2tlckluaXQoKTtcclxuXHJcbiAgICAgIGN0cmwucmVmcmVzaFZpZXcoKTtcclxuICAgIH1cclxuICB9O1xyXG59KTtcclxuXHJcbmFuZ3VsYXIubW9kdWxlKCd1aS5ib290c3RyYXAucG9zaXRpb24nLCBbXSlcclxuXHJcbi8qKlxyXG4gKiBBIHNldCBvZiB1dGlsaXR5IG1ldGhvZHMgZm9yIHdvcmtpbmcgd2l0aCB0aGUgRE9NLlxyXG4gKiBJdCBpcyBtZWFudCB0byBiZSB1c2VkIHdoZXJlIHdlIG5lZWQgdG8gYWJzb2x1dGUtcG9zaXRpb24gZWxlbWVudHMgaW5cclxuICogcmVsYXRpb24gdG8gYW5vdGhlciBlbGVtZW50ICh0aGlzIGlzIHRoZSBjYXNlIGZvciB0b29sdGlwcywgcG9wb3ZlcnMsXHJcbiAqIHR5cGVhaGVhZCBzdWdnZXN0aW9ucyBldGMuKS5cclxuICovXHJcbiAgLmZhY3RvcnkoJyR1aWJQb3NpdGlvbicsIFsnJGRvY3VtZW50JywgJyR3aW5kb3cnLCBmdW5jdGlvbigkZG9jdW1lbnQsICR3aW5kb3cpIHtcclxuICAgIC8qKlxyXG4gICAgICogVXNlZCBieSBzY3JvbGxiYXJXaWR0aCgpIGZ1bmN0aW9uIHRvIGNhY2hlIHNjcm9sbGJhcidzIHdpZHRoLlxyXG4gICAgICogRG8gbm90IGFjY2VzcyB0aGlzIHZhcmlhYmxlIGRpcmVjdGx5LCB1c2Ugc2Nyb2xsYmFyV2lkdGgoKSBpbnN0ZWFkLlxyXG4gICAgICovXHJcbiAgICB2YXIgU0NST0xMQkFSX1dJRFRIO1xyXG4gICAgLyoqXHJcbiAgICAgKiBzY3JvbGxiYXIgb24gYm9keSBhbmQgaHRtbCBlbGVtZW50IGluIElFIGFuZCBFZGdlIG92ZXJsYXlcclxuICAgICAqIGNvbnRlbnQgYW5kIHNob3VsZCBiZSBjb25zaWRlcmVkIDAgd2lkdGguXHJcbiAgICAgKi9cclxuICAgIHZhciBCT0RZX1NDUk9MTEJBUl9XSURUSDtcclxuICAgIHZhciBPVkVSRkxPV19SRUdFWCA9IHtcclxuICAgICAgbm9ybWFsOiAvKGF1dG98c2Nyb2xsKS8sXHJcbiAgICAgIGhpZGRlbjogLyhhdXRvfHNjcm9sbHxoaWRkZW4pL1xyXG4gICAgfTtcclxuICAgIHZhciBQTEFDRU1FTlRfUkVHRVggPSB7XHJcbiAgICAgIGF1dG86IC9cXHM/YXV0bz9cXHM/L2ksXHJcbiAgICAgIHByaW1hcnk6IC9eKHRvcHxib3R0b218bGVmdHxyaWdodCkkLyxcclxuICAgICAgc2Vjb25kYXJ5OiAvXih0b3B8Ym90dG9tfGxlZnR8cmlnaHR8Y2VudGVyKSQvLFxyXG4gICAgICB2ZXJ0aWNhbDogL14odG9wfGJvdHRvbSkkL1xyXG4gICAgfTtcclxuICAgIHZhciBCT0RZX1JFR0VYID0gLyhIVE1MfEJPRFkpLztcclxuXHJcbiAgICByZXR1cm4ge1xyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIFByb3ZpZGVzIGEgcmF3IERPTSBlbGVtZW50IGZyb20gYSBqUXVlcnkvalFMaXRlIGVsZW1lbnQuXHJcbiAgICAgICAqXHJcbiAgICAgICAqIEBwYXJhbSB7ZWxlbWVudH0gZWxlbSAtIFRoZSBlbGVtZW50IHRvIGNvbnZlcnQuXHJcbiAgICAgICAqXHJcbiAgICAgICAqIEByZXR1cm5zIHtlbGVtZW50fSBBIEhUTUwgZWxlbWVudC5cclxuICAgICAgICovXHJcbiAgICAgIGdldFJhd05vZGU6IGZ1bmN0aW9uKGVsZW0pIHtcclxuICAgICAgICByZXR1cm4gZWxlbS5ub2RlTmFtZSA/IGVsZW0gOiBlbGVtWzBdIHx8IGVsZW07XHJcbiAgICAgIH0sXHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogUHJvdmlkZXMgYSBwYXJzZWQgbnVtYmVyIGZvciBhIHN0eWxlIHByb3BlcnR5LiAgU3RyaXBzXHJcbiAgICAgICAqIHVuaXRzIGFuZCBjYXN0cyBpbnZhbGlkIG51bWJlcnMgdG8gMC5cclxuICAgICAgICpcclxuICAgICAgICogQHBhcmFtIHtzdHJpbmd9IHZhbHVlIC0gVGhlIHN0eWxlIHZhbHVlIHRvIHBhcnNlLlxyXG4gICAgICAgKlxyXG4gICAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBBIHZhbGlkIG51bWJlci5cclxuICAgICAgICovXHJcbiAgICAgIHBhcnNlU3R5bGU6IGZ1bmN0aW9uKHZhbHVlKSB7XHJcbiAgICAgICAgdmFsdWUgPSBwYXJzZUZsb2F0KHZhbHVlKTtcclxuICAgICAgICByZXR1cm4gaXNGaW5pdGUodmFsdWUpID8gdmFsdWUgOiAwO1xyXG4gICAgICB9LFxyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIFByb3ZpZGVzIHRoZSBjbG9zZXN0IHBvc2l0aW9uZWQgYW5jZXN0b3IuXHJcbiAgICAgICAqXHJcbiAgICAgICAqIEBwYXJhbSB7ZWxlbWVudH0gZWxlbWVudCAtIFRoZSBlbGVtZW50IHRvIGdldCB0aGUgb2ZmZXN0IHBhcmVudCBmb3IuXHJcbiAgICAgICAqXHJcbiAgICAgICAqIEByZXR1cm5zIHtlbGVtZW50fSBUaGUgY2xvc2VzdCBwb3NpdGlvbmVkIGFuY2VzdG9yLlxyXG4gICAgICAgKi9cclxuICAgICAgb2Zmc2V0UGFyZW50OiBmdW5jdGlvbihlbGVtKSB7XHJcbiAgICAgICAgZWxlbSA9IHRoaXMuZ2V0UmF3Tm9kZShlbGVtKTtcclxuXHJcbiAgICAgICAgdmFyIG9mZnNldFBhcmVudCA9IGVsZW0ub2Zmc2V0UGFyZW50IHx8ICRkb2N1bWVudFswXS5kb2N1bWVudEVsZW1lbnQ7XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGlzU3RhdGljUG9zaXRpb25lZChlbCkge1xyXG4gICAgICAgICAgcmV0dXJuICgkd2luZG93LmdldENvbXB1dGVkU3R5bGUoZWwpLnBvc2l0aW9uIHx8ICdzdGF0aWMnKSA9PT0gJ3N0YXRpYyc7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB3aGlsZSAob2Zmc2V0UGFyZW50ICYmIG9mZnNldFBhcmVudCAhPT0gJGRvY3VtZW50WzBdLmRvY3VtZW50RWxlbWVudCAmJiBpc1N0YXRpY1Bvc2l0aW9uZWQob2Zmc2V0UGFyZW50KSkge1xyXG4gICAgICAgICAgb2Zmc2V0UGFyZW50ID0gb2Zmc2V0UGFyZW50Lm9mZnNldFBhcmVudDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBvZmZzZXRQYXJlbnQgfHwgJGRvY3VtZW50WzBdLmRvY3VtZW50RWxlbWVudDtcclxuICAgICAgfSxcclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBQcm92aWRlcyB0aGUgc2Nyb2xsYmFyIHdpZHRoLCBjb25jZXB0IGZyb20gVFdCUyBtZWFzdXJlU2Nyb2xsYmFyKClcclxuICAgICAgICogZnVuY3Rpb24gaW4gaHR0cHM6Ly9naXRodWIuY29tL3R3YnMvYm9vdHN0cmFwL2Jsb2IvbWFzdGVyL2pzL21vZGFsLmpzXHJcbiAgICAgICAqIEluIElFIGFuZCBFZGdlLCBzY29sbGJhciBvbiBib2R5IGFuZCBodG1sIGVsZW1lbnQgb3ZlcmxheSBhbmQgc2hvdWxkXHJcbiAgICAgICAqIHJldHVybiBhIHdpZHRoIG9mIDAuXHJcbiAgICAgICAqXHJcbiAgICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IFRoZSB3aWR0aCBvZiB0aGUgYnJvd3NlciBzY29sbGJhci5cclxuICAgICAgICovXHJcbiAgICAgIHNjcm9sbGJhcldpZHRoOiBmdW5jdGlvbihpc0JvZHkpIHtcclxuICAgICAgICBpZiAoaXNCb2R5KSB7XHJcbiAgICAgICAgICBpZiAoYW5ndWxhci5pc1VuZGVmaW5lZChCT0RZX1NDUk9MTEJBUl9XSURUSCkpIHtcclxuICAgICAgICAgICAgdmFyIGJvZHlFbGVtID0gJGRvY3VtZW50LmZpbmQoJ2JvZHknKTtcclxuICAgICAgICAgICAgYm9keUVsZW0uYWRkQ2xhc3MoJ3VpYi1wb3NpdGlvbi1ib2R5LXNjcm9sbGJhci1tZWFzdXJlJyk7XHJcbiAgICAgICAgICAgIEJPRFlfU0NST0xMQkFSX1dJRFRIID0gJHdpbmRvdy5pbm5lcldpZHRoIC0gYm9keUVsZW1bMF0uY2xpZW50V2lkdGg7XHJcbiAgICAgICAgICAgIEJPRFlfU0NST0xMQkFSX1dJRFRIID0gaXNGaW5pdGUoQk9EWV9TQ1JPTExCQVJfV0lEVEgpID8gQk9EWV9TQ1JPTExCQVJfV0lEVEggOiAwO1xyXG4gICAgICAgICAgICBib2R5RWxlbS5yZW1vdmVDbGFzcygndWliLXBvc2l0aW9uLWJvZHktc2Nyb2xsYmFyLW1lYXN1cmUnKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHJldHVybiBCT0RZX1NDUk9MTEJBUl9XSURUSDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChhbmd1bGFyLmlzVW5kZWZpbmVkKFNDUk9MTEJBUl9XSURUSCkpIHtcclxuICAgICAgICAgIHZhciBzY3JvbGxFbGVtID0gYW5ndWxhci5lbGVtZW50KCc8ZGl2IGNsYXNzPVwidWliLXBvc2l0aW9uLXNjcm9sbGJhci1tZWFzdXJlXCI+PC9kaXY+Jyk7XHJcbiAgICAgICAgICAkZG9jdW1lbnQuZmluZCgnYm9keScpLmFwcGVuZChzY3JvbGxFbGVtKTtcclxuICAgICAgICAgIFNDUk9MTEJBUl9XSURUSCA9IHNjcm9sbEVsZW1bMF0ub2Zmc2V0V2lkdGggLSBzY3JvbGxFbGVtWzBdLmNsaWVudFdpZHRoO1xyXG4gICAgICAgICAgU0NST0xMQkFSX1dJRFRIID0gaXNGaW5pdGUoU0NST0xMQkFSX1dJRFRIKSA/IFNDUk9MTEJBUl9XSURUSCA6IDA7XHJcbiAgICAgICAgICBzY3JvbGxFbGVtLnJlbW92ZSgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIFNDUk9MTEJBUl9XSURUSDtcclxuICAgICAgfSxcclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBQcm92aWRlcyB0aGUgcGFkZGluZyByZXF1aXJlZCBvbiBhbiBlbGVtZW50IHRvIHJlcGxhY2UgdGhlIHNjcm9sbGJhci5cclxuICAgICAgICpcclxuICAgICAgICogQHJldHVybnMge29iamVjdH0gQW4gb2JqZWN0IHdpdGggdGhlIGZvbGxvd2luZyBwcm9wZXJ0aWVzOlxyXG4gICAgICAgKiAgIDx1bD5cclxuICAgICAgICogICAgIDxsaT4qKnNjcm9sbGJhcldpZHRoKio6IHRoZSB3aWR0aCBvZiB0aGUgc2Nyb2xsYmFyPC9saT5cclxuICAgICAgICogICAgIDxsaT4qKndpZHRoT3ZlcmZsb3cqKjogd2hldGhlciB0aGUgdGhlIHdpZHRoIGlzIG92ZXJmbG93aW5nPC9saT5cclxuICAgICAgICogICAgIDxsaT4qKnJpZ2h0Kio6IHRoZSBhbW91bnQgb2YgcmlnaHQgcGFkZGluZyBvbiB0aGUgZWxlbWVudCBuZWVkZWQgdG8gcmVwbGFjZSB0aGUgc2Nyb2xsYmFyPC9saT5cclxuICAgICAgICogICAgIDxsaT4qKnJpZ2h0T3JpZ2luYWwqKjogdGhlIGFtb3VudCBvZiByaWdodCBwYWRkaW5nIGN1cnJlbnRseSBvbiB0aGUgZWxlbWVudDwvbGk+XHJcbiAgICAgICAqICAgICA8bGk+KipoZWlnaHRPdmVyZmxvdyoqOiB3aGV0aGVyIHRoZSB0aGUgaGVpZ2h0IGlzIG92ZXJmbG93aW5nPC9saT5cclxuICAgICAgICogICAgIDxsaT4qKmJvdHRvbSoqOiB0aGUgYW1vdW50IG9mIGJvdHRvbSBwYWRkaW5nIG9uIHRoZSBlbGVtZW50IG5lZWRlZCB0byByZXBsYWNlIHRoZSBzY3JvbGxiYXI8L2xpPlxyXG4gICAgICAgKiAgICAgPGxpPioqYm90dG9tT3JpZ2luYWwqKjogdGhlIGFtb3VudCBvZiBib3R0b20gcGFkZGluZyBjdXJyZW50bHkgb24gdGhlIGVsZW1lbnQ8L2xpPlxyXG4gICAgICAgKiAgIDwvdWw+XHJcbiAgICAgICAqL1xyXG4gICAgICBzY3JvbGxiYXJQYWRkaW5nOiBmdW5jdGlvbihlbGVtKSB7XHJcbiAgICAgICAgZWxlbSA9IHRoaXMuZ2V0UmF3Tm9kZShlbGVtKTtcclxuXHJcbiAgICAgICAgdmFyIGVsZW1TdHlsZSA9ICR3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShlbGVtKTtcclxuICAgICAgICB2YXIgcGFkZGluZ1JpZ2h0ID0gdGhpcy5wYXJzZVN0eWxlKGVsZW1TdHlsZS5wYWRkaW5nUmlnaHQpO1xyXG4gICAgICAgIHZhciBwYWRkaW5nQm90dG9tID0gdGhpcy5wYXJzZVN0eWxlKGVsZW1TdHlsZS5wYWRkaW5nQm90dG9tKTtcclxuICAgICAgICB2YXIgc2Nyb2xsUGFyZW50ID0gdGhpcy5zY3JvbGxQYXJlbnQoZWxlbSwgZmFsc2UsIHRydWUpO1xyXG4gICAgICAgIHZhciBzY3JvbGxiYXJXaWR0aCA9IHRoaXMuc2Nyb2xsYmFyV2lkdGgoQk9EWV9SRUdFWC50ZXN0KHNjcm9sbFBhcmVudC50YWdOYW1lKSk7XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICBzY3JvbGxiYXJXaWR0aDogc2Nyb2xsYmFyV2lkdGgsXHJcbiAgICAgICAgICB3aWR0aE92ZXJmbG93OiBzY3JvbGxQYXJlbnQuc2Nyb2xsV2lkdGggPiBzY3JvbGxQYXJlbnQuY2xpZW50V2lkdGgsXHJcbiAgICAgICAgICByaWdodDogcGFkZGluZ1JpZ2h0ICsgc2Nyb2xsYmFyV2lkdGgsXHJcbiAgICAgICAgICBvcmlnaW5hbFJpZ2h0OiBwYWRkaW5nUmlnaHQsXHJcbiAgICAgICAgICBoZWlnaHRPdmVyZmxvdzogc2Nyb2xsUGFyZW50LnNjcm9sbEhlaWdodCA+IHNjcm9sbFBhcmVudC5jbGllbnRIZWlnaHQsXHJcbiAgICAgICAgICBib3R0b206IHBhZGRpbmdCb3R0b20gKyBzY3JvbGxiYXJXaWR0aCxcclxuICAgICAgICAgIG9yaWdpbmFsQm90dG9tOiBwYWRkaW5nQm90dG9tXHJcbiAgICAgICAgIH07XHJcbiAgICAgIH0sXHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogQ2hlY2tzIHRvIHNlZSBpZiB0aGUgZWxlbWVudCBpcyBzY3JvbGxhYmxlLlxyXG4gICAgICAgKlxyXG4gICAgICAgKiBAcGFyYW0ge2VsZW1lbnR9IGVsZW0gLSBUaGUgZWxlbWVudCB0byBjaGVjay5cclxuICAgICAgICogQHBhcmFtIHtib29sZWFuPX0gW2luY2x1ZGVIaWRkZW49ZmFsc2VdIC0gU2hvdWxkIHNjcm9sbCBzdHlsZSBvZiAnaGlkZGVuJyBiZSBjb25zaWRlcmVkLFxyXG4gICAgICAgKiAgIGRlZmF1bHQgaXMgZmFsc2UuXHJcbiAgICAgICAqXHJcbiAgICAgICAqIEByZXR1cm5zIHtib29sZWFufSBXaGV0aGVyIHRoZSBlbGVtZW50IGlzIHNjcm9sbGFibGUuXHJcbiAgICAgICAqL1xyXG4gICAgICBpc1Njcm9sbGFibGU6IGZ1bmN0aW9uKGVsZW0sIGluY2x1ZGVIaWRkZW4pIHtcclxuICAgICAgICBlbGVtID0gdGhpcy5nZXRSYXdOb2RlKGVsZW0pO1xyXG5cclxuICAgICAgICB2YXIgb3ZlcmZsb3dSZWdleCA9IGluY2x1ZGVIaWRkZW4gPyBPVkVSRkxPV19SRUdFWC5oaWRkZW4gOiBPVkVSRkxPV19SRUdFWC5ub3JtYWw7XHJcbiAgICAgICAgdmFyIGVsZW1TdHlsZSA9ICR3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShlbGVtKTtcclxuICAgICAgICByZXR1cm4gb3ZlcmZsb3dSZWdleC50ZXN0KGVsZW1TdHlsZS5vdmVyZmxvdyArIGVsZW1TdHlsZS5vdmVyZmxvd1kgKyBlbGVtU3R5bGUub3ZlcmZsb3dYKTtcclxuICAgICAgfSxcclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBQcm92aWRlcyB0aGUgY2xvc2VzdCBzY3JvbGxhYmxlIGFuY2VzdG9yLlxyXG4gICAgICAgKiBBIHBvcnQgb2YgdGhlIGpRdWVyeSBVSSBzY3JvbGxQYXJlbnQgbWV0aG9kOlxyXG4gICAgICAgKiBodHRwczovL2dpdGh1Yi5jb20vanF1ZXJ5L2pxdWVyeS11aS9ibG9iL21hc3Rlci91aS9zY3JvbGwtcGFyZW50LmpzXHJcbiAgICAgICAqXHJcbiAgICAgICAqIEBwYXJhbSB7ZWxlbWVudH0gZWxlbSAtIFRoZSBlbGVtZW50IHRvIGZpbmQgdGhlIHNjcm9sbCBwYXJlbnQgb2YuXHJcbiAgICAgICAqIEBwYXJhbSB7Ym9vbGVhbj19IFtpbmNsdWRlSGlkZGVuPWZhbHNlXSAtIFNob3VsZCBzY3JvbGwgc3R5bGUgb2YgJ2hpZGRlbicgYmUgY29uc2lkZXJlZCxcclxuICAgICAgICogICBkZWZhdWx0IGlzIGZhbHNlLlxyXG4gICAgICAgKiBAcGFyYW0ge2Jvb2xlYW49fSBbaW5jbHVkZVNlbGY9ZmFsc2VdIC0gU2hvdWxkIHRoZSBlbGVtZW50IGJlaW5nIHBhc3NlZCBiZVxyXG4gICAgICAgKiBpbmNsdWRlZCBpbiB0aGUgc2Nyb2xsYWJsZSBsbG9rdXAuXHJcbiAgICAgICAqXHJcbiAgICAgICAqIEByZXR1cm5zIHtlbGVtZW50fSBBIEhUTUwgZWxlbWVudC5cclxuICAgICAgICovXHJcbiAgICAgIHNjcm9sbFBhcmVudDogZnVuY3Rpb24oZWxlbSwgaW5jbHVkZUhpZGRlbiwgaW5jbHVkZVNlbGYpIHtcclxuICAgICAgICBlbGVtID0gdGhpcy5nZXRSYXdOb2RlKGVsZW0pO1xyXG5cclxuICAgICAgICB2YXIgb3ZlcmZsb3dSZWdleCA9IGluY2x1ZGVIaWRkZW4gPyBPVkVSRkxPV19SRUdFWC5oaWRkZW4gOiBPVkVSRkxPV19SRUdFWC5ub3JtYWw7XHJcbiAgICAgICAgdmFyIGRvY3VtZW50RWwgPSAkZG9jdW1lbnRbMF0uZG9jdW1lbnRFbGVtZW50O1xyXG4gICAgICAgIHZhciBlbGVtU3R5bGUgPSAkd2luZG93LmdldENvbXB1dGVkU3R5bGUoZWxlbSk7XHJcbiAgICAgICAgaWYgKGluY2x1ZGVTZWxmICYmIG92ZXJmbG93UmVnZXgudGVzdChlbGVtU3R5bGUub3ZlcmZsb3cgKyBlbGVtU3R5bGUub3ZlcmZsb3dZICsgZWxlbVN0eWxlLm92ZXJmbG93WCkpIHtcclxuICAgICAgICAgIHJldHVybiBlbGVtO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgZXhjbHVkZVN0YXRpYyA9IGVsZW1TdHlsZS5wb3NpdGlvbiA9PT0gJ2Fic29sdXRlJztcclxuICAgICAgICB2YXIgc2Nyb2xsUGFyZW50ID0gZWxlbS5wYXJlbnRFbGVtZW50IHx8IGRvY3VtZW50RWw7XHJcblxyXG4gICAgICAgIGlmIChzY3JvbGxQYXJlbnQgPT09IGRvY3VtZW50RWwgfHwgZWxlbVN0eWxlLnBvc2l0aW9uID09PSAnZml4ZWQnKSB7XHJcbiAgICAgICAgICByZXR1cm4gZG9jdW1lbnRFbDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHdoaWxlIChzY3JvbGxQYXJlbnQucGFyZW50RWxlbWVudCAmJiBzY3JvbGxQYXJlbnQgIT09IGRvY3VtZW50RWwpIHtcclxuICAgICAgICAgIHZhciBzcFN0eWxlID0gJHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKHNjcm9sbFBhcmVudCk7XHJcbiAgICAgICAgICBpZiAoZXhjbHVkZVN0YXRpYyAmJiBzcFN0eWxlLnBvc2l0aW9uICE9PSAnc3RhdGljJykge1xyXG4gICAgICAgICAgICBleGNsdWRlU3RhdGljID0gZmFsc2U7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgaWYgKCFleGNsdWRlU3RhdGljICYmIG92ZXJmbG93UmVnZXgudGVzdChzcFN0eWxlLm92ZXJmbG93ICsgc3BTdHlsZS5vdmVyZmxvd1kgKyBzcFN0eWxlLm92ZXJmbG93WCkpIHtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBzY3JvbGxQYXJlbnQgPSBzY3JvbGxQYXJlbnQucGFyZW50RWxlbWVudDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBzY3JvbGxQYXJlbnQ7XHJcbiAgICAgIH0sXHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogUHJvdmlkZXMgcmVhZC1vbmx5IGVxdWl2YWxlbnQgb2YgalF1ZXJ5J3MgcG9zaXRpb24gZnVuY3Rpb246XHJcbiAgICAgICAqIGh0dHA6Ly9hcGkuanF1ZXJ5LmNvbS9wb3NpdGlvbi8gLSBkaXN0YW5jZSB0byBjbG9zZXN0IHBvc2l0aW9uZWRcclxuICAgICAgICogYW5jZXN0b3IuICBEb2VzIG5vdCBhY2NvdW50IGZvciBtYXJnaW5zIGJ5IGRlZmF1bHQgbGlrZSBqUXVlcnkgcG9zaXRpb24uXHJcbiAgICAgICAqXHJcbiAgICAgICAqIEBwYXJhbSB7ZWxlbWVudH0gZWxlbSAtIFRoZSBlbGVtZW50IHRvIGNhY2x1bGF0ZSB0aGUgcG9zaXRpb24gb24uXHJcbiAgICAgICAqIEBwYXJhbSB7Ym9vbGVhbj19IFtpbmNsdWRlTWFyZ2lucz1mYWxzZV0gLSBTaG91bGQgbWFyZ2lucyBiZSBhY2NvdW50ZWRcclxuICAgICAgICogZm9yLCBkZWZhdWx0IGlzIGZhbHNlLlxyXG4gICAgICAgKlxyXG4gICAgICAgKiBAcmV0dXJucyB7b2JqZWN0fSBBbiBvYmplY3Qgd2l0aCB0aGUgZm9sbG93aW5nIHByb3BlcnRpZXM6XHJcbiAgICAgICAqICAgPHVsPlxyXG4gICAgICAgKiAgICAgPGxpPioqd2lkdGgqKjogdGhlIHdpZHRoIG9mIHRoZSBlbGVtZW50PC9saT5cclxuICAgICAgICogICAgIDxsaT4qKmhlaWdodCoqOiB0aGUgaGVpZ2h0IG9mIHRoZSBlbGVtZW50PC9saT5cclxuICAgICAgICogICAgIDxsaT4qKnRvcCoqOiBkaXN0YW5jZSB0byB0b3AgZWRnZSBvZiBvZmZzZXQgcGFyZW50PC9saT5cclxuICAgICAgICogICAgIDxsaT4qKmxlZnQqKjogZGlzdGFuY2UgdG8gbGVmdCBlZGdlIG9mIG9mZnNldCBwYXJlbnQ8L2xpPlxyXG4gICAgICAgKiAgIDwvdWw+XHJcbiAgICAgICAqL1xyXG4gICAgICBwb3NpdGlvbjogZnVuY3Rpb24oZWxlbSwgaW5jbHVkZU1hZ2lucykge1xyXG4gICAgICAgIGVsZW0gPSB0aGlzLmdldFJhd05vZGUoZWxlbSk7XHJcblxyXG4gICAgICAgIHZhciBlbGVtT2Zmc2V0ID0gdGhpcy5vZmZzZXQoZWxlbSk7XHJcbiAgICAgICAgaWYgKGluY2x1ZGVNYWdpbnMpIHtcclxuICAgICAgICAgIHZhciBlbGVtU3R5bGUgPSAkd2luZG93LmdldENvbXB1dGVkU3R5bGUoZWxlbSk7XHJcbiAgICAgICAgICBlbGVtT2Zmc2V0LnRvcCAtPSB0aGlzLnBhcnNlU3R5bGUoZWxlbVN0eWxlLm1hcmdpblRvcCk7XHJcbiAgICAgICAgICBlbGVtT2Zmc2V0LmxlZnQgLT0gdGhpcy5wYXJzZVN0eWxlKGVsZW1TdHlsZS5tYXJnaW5MZWZ0KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIHBhcmVudCA9IHRoaXMub2Zmc2V0UGFyZW50KGVsZW0pO1xyXG4gICAgICAgIHZhciBwYXJlbnRPZmZzZXQgPSB7dG9wOiAwLCBsZWZ0OiAwfTtcclxuXHJcbiAgICAgICAgaWYgKHBhcmVudCAhPT0gJGRvY3VtZW50WzBdLmRvY3VtZW50RWxlbWVudCkge1xyXG4gICAgICAgICAgcGFyZW50T2Zmc2V0ID0gdGhpcy5vZmZzZXQocGFyZW50KTtcclxuICAgICAgICAgIHBhcmVudE9mZnNldC50b3AgKz0gcGFyZW50LmNsaWVudFRvcCAtIHBhcmVudC5zY3JvbGxUb3A7XHJcbiAgICAgICAgICBwYXJlbnRPZmZzZXQubGVmdCArPSBwYXJlbnQuY2xpZW50TGVmdCAtIHBhcmVudC5zY3JvbGxMZWZ0O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHdpZHRoOiBNYXRoLnJvdW5kKGFuZ3VsYXIuaXNOdW1iZXIoZWxlbU9mZnNldC53aWR0aCkgPyBlbGVtT2Zmc2V0LndpZHRoIDogZWxlbS5vZmZzZXRXaWR0aCksXHJcbiAgICAgICAgICBoZWlnaHQ6IE1hdGgucm91bmQoYW5ndWxhci5pc051bWJlcihlbGVtT2Zmc2V0LmhlaWdodCkgPyBlbGVtT2Zmc2V0LmhlaWdodCA6IGVsZW0ub2Zmc2V0SGVpZ2h0KSxcclxuICAgICAgICAgIHRvcDogTWF0aC5yb3VuZChlbGVtT2Zmc2V0LnRvcCAtIHBhcmVudE9mZnNldC50b3ApLFxyXG4gICAgICAgICAgbGVmdDogTWF0aC5yb3VuZChlbGVtT2Zmc2V0LmxlZnQgLSBwYXJlbnRPZmZzZXQubGVmdClcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIFByb3ZpZGVzIHJlYWQtb25seSBlcXVpdmFsZW50IG9mIGpRdWVyeSdzIG9mZnNldCBmdW5jdGlvbjpcclxuICAgICAgICogaHR0cDovL2FwaS5qcXVlcnkuY29tL29mZnNldC8gLSBkaXN0YW5jZSB0byB2aWV3cG9ydC4gIERvZXNcclxuICAgICAgICogbm90IGFjY291bnQgZm9yIGJvcmRlcnMsIG1hcmdpbnMsIG9yIHBhZGRpbmcgb24gdGhlIGJvZHlcclxuICAgICAgICogZWxlbWVudC5cclxuICAgICAgICpcclxuICAgICAgICogQHBhcmFtIHtlbGVtZW50fSBlbGVtIC0gVGhlIGVsZW1lbnQgdG8gY2FsY3VsYXRlIHRoZSBvZmZzZXQgb24uXHJcbiAgICAgICAqXHJcbiAgICAgICAqIEByZXR1cm5zIHtvYmplY3R9IEFuIG9iamVjdCB3aXRoIHRoZSBmb2xsb3dpbmcgcHJvcGVydGllczpcclxuICAgICAgICogICA8dWw+XHJcbiAgICAgICAqICAgICA8bGk+Kip3aWR0aCoqOiB0aGUgd2lkdGggb2YgdGhlIGVsZW1lbnQ8L2xpPlxyXG4gICAgICAgKiAgICAgPGxpPioqaGVpZ2h0Kio6IHRoZSBoZWlnaHQgb2YgdGhlIGVsZW1lbnQ8L2xpPlxyXG4gICAgICAgKiAgICAgPGxpPioqdG9wKio6IGRpc3RhbmNlIHRvIHRvcCBlZGdlIG9mIHZpZXdwb3J0PC9saT5cclxuICAgICAgICogICAgIDxsaT4qKnJpZ2h0Kio6IGRpc3RhbmNlIHRvIGJvdHRvbSBlZGdlIG9mIHZpZXdwb3J0PC9saT5cclxuICAgICAgICogICA8L3VsPlxyXG4gICAgICAgKi9cclxuICAgICAgb2Zmc2V0OiBmdW5jdGlvbihlbGVtKSB7XHJcbiAgICAgICAgZWxlbSA9IHRoaXMuZ2V0UmF3Tm9kZShlbGVtKTtcclxuXHJcbiAgICAgICAgdmFyIGVsZW1CQ1IgPSBlbGVtLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB3aWR0aDogTWF0aC5yb3VuZChhbmd1bGFyLmlzTnVtYmVyKGVsZW1CQ1Iud2lkdGgpID8gZWxlbUJDUi53aWR0aCA6IGVsZW0ub2Zmc2V0V2lkdGgpLFxyXG4gICAgICAgICAgaGVpZ2h0OiBNYXRoLnJvdW5kKGFuZ3VsYXIuaXNOdW1iZXIoZWxlbUJDUi5oZWlnaHQpID8gZWxlbUJDUi5oZWlnaHQgOiBlbGVtLm9mZnNldEhlaWdodCksXHJcbiAgICAgICAgICB0b3A6IE1hdGgucm91bmQoZWxlbUJDUi50b3AgKyAoJHdpbmRvdy5wYWdlWU9mZnNldCB8fCAkZG9jdW1lbnRbMF0uZG9jdW1lbnRFbGVtZW50LnNjcm9sbFRvcCkpLFxyXG4gICAgICAgICAgbGVmdDogTWF0aC5yb3VuZChlbGVtQkNSLmxlZnQgKyAoJHdpbmRvdy5wYWdlWE9mZnNldCB8fCAkZG9jdW1lbnRbMF0uZG9jdW1lbnRFbGVtZW50LnNjcm9sbExlZnQpKVxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogUHJvdmlkZXMgb2Zmc2V0IGRpc3RhbmNlIHRvIHRoZSBjbG9zZXN0IHNjcm9sbGFibGUgYW5jZXN0b3JcclxuICAgICAgICogb3Igdmlld3BvcnQuICBBY2NvdW50cyBmb3IgYm9yZGVyIGFuZCBzY3JvbGxiYXIgd2lkdGguXHJcbiAgICAgICAqXHJcbiAgICAgICAqIFJpZ2h0IGFuZCBib3R0b20gZGltZW5zaW9ucyByZXByZXNlbnQgdGhlIGRpc3RhbmNlIHRvIHRoZVxyXG4gICAgICAgKiByZXNwZWN0aXZlIGVkZ2Ugb2YgdGhlIHZpZXdwb3J0IGVsZW1lbnQuICBJZiB0aGUgZWxlbWVudFxyXG4gICAgICAgKiBlZGdlIGV4dGVuZHMgYmV5b25kIHRoZSB2aWV3cG9ydCwgYSBuZWdhdGl2ZSB2YWx1ZSB3aWxsIGJlXHJcbiAgICAgICAqIHJlcG9ydGVkLlxyXG4gICAgICAgKlxyXG4gICAgICAgKiBAcGFyYW0ge2VsZW1lbnR9IGVsZW0gLSBUaGUgZWxlbWVudCB0byBnZXQgdGhlIHZpZXdwb3J0IG9mZnNldCBmb3IuXHJcbiAgICAgICAqIEBwYXJhbSB7Ym9vbGVhbj19IFt1c2VEb2N1bWVudD1mYWxzZV0gLSBTaG91bGQgdGhlIHZpZXdwb3J0IGJlIHRoZSBkb2N1bWVudCBlbGVtZW50IGluc3RlYWRcclxuICAgICAgICogb2YgdGhlIGZpcnN0IHNjcm9sbGFibGUgZWxlbWVudCwgZGVmYXVsdCBpcyBmYWxzZS5cclxuICAgICAgICogQHBhcmFtIHtib29sZWFuPX0gW2luY2x1ZGVQYWRkaW5nPXRydWVdIC0gU2hvdWxkIHRoZSBwYWRkaW5nIG9uIHRoZSBvZmZzZXQgcGFyZW50IGVsZW1lbnRcclxuICAgICAgICogYmUgYWNjb3VudGVkIGZvciwgZGVmYXVsdCBpcyB0cnVlLlxyXG4gICAgICAgKlxyXG4gICAgICAgKiBAcmV0dXJucyB7b2JqZWN0fSBBbiBvYmplY3Qgd2l0aCB0aGUgZm9sbG93aW5nIHByb3BlcnRpZXM6XHJcbiAgICAgICAqICAgPHVsPlxyXG4gICAgICAgKiAgICAgPGxpPioqdG9wKio6IGRpc3RhbmNlIHRvIHRoZSB0b3AgY29udGVudCBlZGdlIG9mIHZpZXdwb3J0IGVsZW1lbnQ8L2xpPlxyXG4gICAgICAgKiAgICAgPGxpPioqYm90dG9tKio6IGRpc3RhbmNlIHRvIHRoZSBib3R0b20gY29udGVudCBlZGdlIG9mIHZpZXdwb3J0IGVsZW1lbnQ8L2xpPlxyXG4gICAgICAgKiAgICAgPGxpPioqbGVmdCoqOiBkaXN0YW5jZSB0byB0aGUgbGVmdCBjb250ZW50IGVkZ2Ugb2Ygdmlld3BvcnQgZWxlbWVudDwvbGk+XHJcbiAgICAgICAqICAgICA8bGk+KipyaWdodCoqOiBkaXN0YW5jZSB0byB0aGUgcmlnaHQgY29udGVudCBlZGdlIG9mIHZpZXdwb3J0IGVsZW1lbnQ8L2xpPlxyXG4gICAgICAgKiAgIDwvdWw+XHJcbiAgICAgICAqL1xyXG4gICAgICB2aWV3cG9ydE9mZnNldDogZnVuY3Rpb24oZWxlbSwgdXNlRG9jdW1lbnQsIGluY2x1ZGVQYWRkaW5nKSB7XHJcbiAgICAgICAgZWxlbSA9IHRoaXMuZ2V0UmF3Tm9kZShlbGVtKTtcclxuICAgICAgICBpbmNsdWRlUGFkZGluZyA9IGluY2x1ZGVQYWRkaW5nICE9PSBmYWxzZSA/IHRydWUgOiBmYWxzZTtcclxuXHJcbiAgICAgICAgdmFyIGVsZW1CQ1IgPSBlbGVtLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xyXG4gICAgICAgIHZhciBvZmZzZXRCQ1IgPSB7dG9wOiAwLCBsZWZ0OiAwLCBib3R0b206IDAsIHJpZ2h0OiAwfTtcclxuXHJcbiAgICAgICAgdmFyIG9mZnNldFBhcmVudCA9IHVzZURvY3VtZW50ID8gJGRvY3VtZW50WzBdLmRvY3VtZW50RWxlbWVudCA6IHRoaXMuc2Nyb2xsUGFyZW50KGVsZW0pO1xyXG4gICAgICAgIHZhciBvZmZzZXRQYXJlbnRCQ1IgPSBvZmZzZXRQYXJlbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcblxyXG4gICAgICAgIG9mZnNldEJDUi50b3AgPSBvZmZzZXRQYXJlbnRCQ1IudG9wICsgb2Zmc2V0UGFyZW50LmNsaWVudFRvcDtcclxuICAgICAgICBvZmZzZXRCQ1IubGVmdCA9IG9mZnNldFBhcmVudEJDUi5sZWZ0ICsgb2Zmc2V0UGFyZW50LmNsaWVudExlZnQ7XHJcbiAgICAgICAgaWYgKG9mZnNldFBhcmVudCA9PT0gJGRvY3VtZW50WzBdLmRvY3VtZW50RWxlbWVudCkge1xyXG4gICAgICAgICAgb2Zmc2V0QkNSLnRvcCArPSAkd2luZG93LnBhZ2VZT2Zmc2V0O1xyXG4gICAgICAgICAgb2Zmc2V0QkNSLmxlZnQgKz0gJHdpbmRvdy5wYWdlWE9mZnNldDtcclxuICAgICAgICB9XHJcbiAgICAgICAgb2Zmc2V0QkNSLmJvdHRvbSA9IG9mZnNldEJDUi50b3AgKyBvZmZzZXRQYXJlbnQuY2xpZW50SGVpZ2h0O1xyXG4gICAgICAgIG9mZnNldEJDUi5yaWdodCA9IG9mZnNldEJDUi5sZWZ0ICsgb2Zmc2V0UGFyZW50LmNsaWVudFdpZHRoO1xyXG5cclxuICAgICAgICBpZiAoaW5jbHVkZVBhZGRpbmcpIHtcclxuICAgICAgICAgIHZhciBvZmZzZXRQYXJlbnRTdHlsZSA9ICR3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShvZmZzZXRQYXJlbnQpO1xyXG4gICAgICAgICAgb2Zmc2V0QkNSLnRvcCArPSB0aGlzLnBhcnNlU3R5bGUob2Zmc2V0UGFyZW50U3R5bGUucGFkZGluZ1RvcCk7XHJcbiAgICAgICAgICBvZmZzZXRCQ1IuYm90dG9tIC09IHRoaXMucGFyc2VTdHlsZShvZmZzZXRQYXJlbnRTdHlsZS5wYWRkaW5nQm90dG9tKTtcclxuICAgICAgICAgIG9mZnNldEJDUi5sZWZ0ICs9IHRoaXMucGFyc2VTdHlsZShvZmZzZXRQYXJlbnRTdHlsZS5wYWRkaW5nTGVmdCk7XHJcbiAgICAgICAgICBvZmZzZXRCQ1IucmlnaHQgLT0gdGhpcy5wYXJzZVN0eWxlKG9mZnNldFBhcmVudFN0eWxlLnBhZGRpbmdSaWdodCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdG9wOiBNYXRoLnJvdW5kKGVsZW1CQ1IudG9wIC0gb2Zmc2V0QkNSLnRvcCksXHJcbiAgICAgICAgICBib3R0b206IE1hdGgucm91bmQob2Zmc2V0QkNSLmJvdHRvbSAtIGVsZW1CQ1IuYm90dG9tKSxcclxuICAgICAgICAgIGxlZnQ6IE1hdGgucm91bmQoZWxlbUJDUi5sZWZ0IC0gb2Zmc2V0QkNSLmxlZnQpLFxyXG4gICAgICAgICAgcmlnaHQ6IE1hdGgucm91bmQob2Zmc2V0QkNSLnJpZ2h0IC0gZWxlbUJDUi5yaWdodClcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIFByb3ZpZGVzIGFuIGFycmF5IG9mIHBsYWNlbWVudCB2YWx1ZXMgcGFyc2VkIGZyb20gYSBwbGFjZW1lbnQgc3RyaW5nLlxyXG4gICAgICAgKiBBbG9uZyB3aXRoIHRoZSAnYXV0bycgaW5kaWNhdG9yLCBzdXBwb3J0ZWQgcGxhY2VtZW50IHN0cmluZ3MgYXJlOlxyXG4gICAgICAgKiAgIDx1bD5cclxuICAgICAgICogICAgIDxsaT50b3A6IGVsZW1lbnQgb24gdG9wLCBob3Jpem9udGFsbHkgY2VudGVyZWQgb24gaG9zdCBlbGVtZW50LjwvbGk+XHJcbiAgICAgICAqICAgICA8bGk+dG9wLWxlZnQ6IGVsZW1lbnQgb24gdG9wLCBsZWZ0IGVkZ2UgYWxpZ25lZCB3aXRoIGhvc3QgZWxlbWVudCBsZWZ0IGVkZ2UuPC9saT5cclxuICAgICAgICogICAgIDxsaT50b3AtcmlnaHQ6IGVsZW1lbnQgb24gdG9wLCBsZXJpZ2h0ZnQgZWRnZSBhbGlnbmVkIHdpdGggaG9zdCBlbGVtZW50IHJpZ2h0IGVkZ2UuPC9saT5cclxuICAgICAgICogICAgIDxsaT5ib3R0b206IGVsZW1lbnQgb24gYm90dG9tLCBob3Jpem9udGFsbHkgY2VudGVyZWQgb24gaG9zdCBlbGVtZW50LjwvbGk+XHJcbiAgICAgICAqICAgICA8bGk+Ym90dG9tLWxlZnQ6IGVsZW1lbnQgb24gYm90dG9tLCBsZWZ0IGVkZ2UgYWxpZ25lZCB3aXRoIGhvc3QgZWxlbWVudCBsZWZ0IGVkZ2UuPC9saT5cclxuICAgICAgICogICAgIDxsaT5ib3R0b20tcmlnaHQ6IGVsZW1lbnQgb24gYm90dG9tLCByaWdodCBlZGdlIGFsaWduZWQgd2l0aCBob3N0IGVsZW1lbnQgcmlnaHQgZWRnZS48L2xpPlxyXG4gICAgICAgKiAgICAgPGxpPmxlZnQ6IGVsZW1lbnQgb24gbGVmdCwgdmVydGljYWxseSBjZW50ZXJlZCBvbiBob3N0IGVsZW1lbnQuPC9saT5cclxuICAgICAgICogICAgIDxsaT5sZWZ0LXRvcDogZWxlbWVudCBvbiBsZWZ0LCB0b3AgZWRnZSBhbGlnbmVkIHdpdGggaG9zdCBlbGVtZW50IHRvcCBlZGdlLjwvbGk+XHJcbiAgICAgICAqICAgICA8bGk+bGVmdC1ib3R0b206IGVsZW1lbnQgb24gbGVmdCwgYm90dG9tIGVkZ2UgYWxpZ25lZCB3aXRoIGhvc3QgZWxlbWVudCBib3R0b20gZWRnZS48L2xpPlxyXG4gICAgICAgKiAgICAgPGxpPnJpZ2h0OiBlbGVtZW50IG9uIHJpZ2h0LCB2ZXJ0aWNhbGx5IGNlbnRlcmVkIG9uIGhvc3QgZWxlbWVudC48L2xpPlxyXG4gICAgICAgKiAgICAgPGxpPnJpZ2h0LXRvcDogZWxlbWVudCBvbiByaWdodCwgdG9wIGVkZ2UgYWxpZ25lZCB3aXRoIGhvc3QgZWxlbWVudCB0b3AgZWRnZS48L2xpPlxyXG4gICAgICAgKiAgICAgPGxpPnJpZ2h0LWJvdHRvbTogZWxlbWVudCBvbiByaWdodCwgYm90dG9tIGVkZ2UgYWxpZ25lZCB3aXRoIGhvc3QgZWxlbWVudCBib3R0b20gZWRnZS48L2xpPlxyXG4gICAgICAgKiAgIDwvdWw+XHJcbiAgICAgICAqIEEgcGxhY2VtZW50IHN0cmluZyB3aXRoIGFuICdhdXRvJyBpbmRpY2F0b3IgaXMgZXhwZWN0ZWQgdG8gYmVcclxuICAgICAgICogc3BhY2Ugc2VwYXJhdGVkIGZyb20gdGhlIHBsYWNlbWVudCwgaS5lOiAnYXV0byBib3R0b20tbGVmdCcgIElmXHJcbiAgICAgICAqIHRoZSBwcmltYXJ5IGFuZCBzZWNvbmRhcnkgcGxhY2VtZW50IHZhbHVlcyBkbyBub3QgbWF0Y2ggJ3RvcCxcclxuICAgICAgICogYm90dG9tLCBsZWZ0LCByaWdodCcgdGhlbiAndG9wJyB3aWxsIGJlIHRoZSBwcmltYXJ5IHBsYWNlbWVudCBhbmRcclxuICAgICAgICogJ2NlbnRlcicgd2lsbCBiZSB0aGUgc2Vjb25kYXJ5IHBsYWNlbWVudC4gIElmICdhdXRvJyBpcyBwYXNzZWQsIHRydWVcclxuICAgICAgICogd2lsbCBiZSByZXR1cm5lZCBhcyB0aGUgM3JkIHZhbHVlIG9mIHRoZSBhcnJheS5cclxuICAgICAgICpcclxuICAgICAgICogQHBhcmFtIHtzdHJpbmd9IHBsYWNlbWVudCAtIFRoZSBwbGFjZW1lbnQgc3RyaW5nIHRvIHBhcnNlLlxyXG4gICAgICAgKlxyXG4gICAgICAgKiBAcmV0dXJucyB7YXJyYXl9IEFuIGFycmF5IHdpdGggdGhlIGZvbGxvd2luZyB2YWx1ZXNcclxuICAgICAgICogPHVsPlxyXG4gICAgICAgKiAgIDxsaT4qKlswXSoqOiBUaGUgcHJpbWFyeSBwbGFjZW1lbnQuPC9saT5cclxuICAgICAgICogICA8bGk+KipbMV0qKjogVGhlIHNlY29uZGFyeSBwbGFjZW1lbnQuPC9saT5cclxuICAgICAgICogICA8bGk+KipbMl0qKjogSWYgYXV0byBpcyBwYXNzZWQ6IHRydWUsIGVsc2UgdW5kZWZpbmVkLjwvbGk+XHJcbiAgICAgICAqIDwvdWw+XHJcbiAgICAgICAqL1xyXG4gICAgICBwYXJzZVBsYWNlbWVudDogZnVuY3Rpb24ocGxhY2VtZW50KSB7XHJcbiAgICAgICAgdmFyIGF1dG9QbGFjZSA9IFBMQUNFTUVOVF9SRUdFWC5hdXRvLnRlc3QocGxhY2VtZW50KTtcclxuICAgICAgICBpZiAoYXV0b1BsYWNlKSB7XHJcbiAgICAgICAgICBwbGFjZW1lbnQgPSBwbGFjZW1lbnQucmVwbGFjZShQTEFDRU1FTlRfUkVHRVguYXV0bywgJycpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcGxhY2VtZW50ID0gcGxhY2VtZW50LnNwbGl0KCctJyk7XHJcblxyXG4gICAgICAgIHBsYWNlbWVudFswXSA9IHBsYWNlbWVudFswXSB8fCAndG9wJztcclxuICAgICAgICBpZiAoIVBMQUNFTUVOVF9SRUdFWC5wcmltYXJ5LnRlc3QocGxhY2VtZW50WzBdKSkge1xyXG4gICAgICAgICAgcGxhY2VtZW50WzBdID0gJ3RvcCc7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwbGFjZW1lbnRbMV0gPSBwbGFjZW1lbnRbMV0gfHwgJ2NlbnRlcic7XHJcbiAgICAgICAgaWYgKCFQTEFDRU1FTlRfUkVHRVguc2Vjb25kYXJ5LnRlc3QocGxhY2VtZW50WzFdKSkge1xyXG4gICAgICAgICAgcGxhY2VtZW50WzFdID0gJ2NlbnRlcic7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoYXV0b1BsYWNlKSB7XHJcbiAgICAgICAgICBwbGFjZW1lbnRbMl0gPSB0cnVlO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBwbGFjZW1lbnRbMl0gPSBmYWxzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBwbGFjZW1lbnQ7XHJcbiAgICAgIH0sXHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogUHJvdmlkZXMgY29vcmRpbmF0ZXMgZm9yIGFuIGVsZW1lbnQgdG8gYmUgcG9zaXRpb25lZCByZWxhdGl2ZSB0b1xyXG4gICAgICAgKiBhbm90aGVyIGVsZW1lbnQuICBQYXNzaW5nICdhdXRvJyBhcyBwYXJ0IG9mIHRoZSBwbGFjZW1lbnQgcGFyYW1ldGVyXHJcbiAgICAgICAqIHdpbGwgZW5hYmxlIHNtYXJ0IHBsYWNlbWVudCAtIHdoZXJlIHRoZSBlbGVtZW50IGZpdHMuIGkuZTpcclxuICAgICAgICogJ2F1dG8gbGVmdC10b3AnIHdpbGwgY2hlY2sgdG8gc2VlIGlmIHRoZXJlIGlzIGVub3VnaCBzcGFjZSB0byB0aGUgbGVmdFxyXG4gICAgICAgKiBvZiB0aGUgaG9zdEVsZW0gdG8gZml0IHRoZSB0YXJnZXRFbGVtLCBpZiBub3QgcGxhY2UgcmlnaHQgKHNhbWUgZm9yIHNlY29uZGFyeVxyXG4gICAgICAgKiB0b3AgcGxhY2VtZW50KS4gIEF2YWlsYWJsZSBzcGFjZSBpcyBjYWxjdWxhdGVkIHVzaW5nIHRoZSB2aWV3cG9ydE9mZnNldFxyXG4gICAgICAgKiBmdW5jdGlvbi5cclxuICAgICAgICpcclxuICAgICAgICogQHBhcmFtIHtlbGVtZW50fSBob3N0RWxlbSAtIFRoZSBlbGVtZW50IHRvIHBvc2l0aW9uIGFnYWluc3QuXHJcbiAgICAgICAqIEBwYXJhbSB7ZWxlbWVudH0gdGFyZ2V0RWxlbSAtIFRoZSBlbGVtZW50IHRvIHBvc2l0aW9uLlxyXG4gICAgICAgKiBAcGFyYW0ge3N0cmluZz19IFtwbGFjZW1lbnQ9dG9wXSAtIFRoZSBwbGFjZW1lbnQgZm9yIHRoZSB0YXJnZXRFbGVtLFxyXG4gICAgICAgKiAgIGRlZmF1bHQgaXMgJ3RvcCcuICdjZW50ZXInIGlzIGFzc3VtZWQgYXMgc2Vjb25kYXJ5IHBsYWNlbWVudCBmb3JcclxuICAgICAgICogICAndG9wJywgJ2xlZnQnLCAncmlnaHQnLCBhbmQgJ2JvdHRvbScgcGxhY2VtZW50cy4gIEF2YWlsYWJsZSBwbGFjZW1lbnRzIGFyZTpcclxuICAgICAgICogICA8dWw+XHJcbiAgICAgICAqICAgICA8bGk+dG9wPC9saT5cclxuICAgICAgICogICAgIDxsaT50b3AtcmlnaHQ8L2xpPlxyXG4gICAgICAgKiAgICAgPGxpPnRvcC1sZWZ0PC9saT5cclxuICAgICAgICogICAgIDxsaT5ib3R0b208L2xpPlxyXG4gICAgICAgKiAgICAgPGxpPmJvdHRvbS1sZWZ0PC9saT5cclxuICAgICAgICogICAgIDxsaT5ib3R0b20tcmlnaHQ8L2xpPlxyXG4gICAgICAgKiAgICAgPGxpPmxlZnQ8L2xpPlxyXG4gICAgICAgKiAgICAgPGxpPmxlZnQtdG9wPC9saT5cclxuICAgICAgICogICAgIDxsaT5sZWZ0LWJvdHRvbTwvbGk+XHJcbiAgICAgICAqICAgICA8bGk+cmlnaHQ8L2xpPlxyXG4gICAgICAgKiAgICAgPGxpPnJpZ2h0LXRvcDwvbGk+XHJcbiAgICAgICAqICAgICA8bGk+cmlnaHQtYm90dG9tPC9saT5cclxuICAgICAgICogICA8L3VsPlxyXG4gICAgICAgKiBAcGFyYW0ge2Jvb2xlYW49fSBbYXBwZW5kVG9Cb2R5PWZhbHNlXSAtIFNob3VsZCB0aGUgdG9wIGFuZCBsZWZ0IHZhbHVlcyByZXR1cm5lZFxyXG4gICAgICAgKiAgIGJlIGNhbGN1bGF0ZWQgZnJvbSB0aGUgYm9keSBlbGVtZW50LCBkZWZhdWx0IGlzIGZhbHNlLlxyXG4gICAgICAgKlxyXG4gICAgICAgKiBAcmV0dXJucyB7b2JqZWN0fSBBbiBvYmplY3Qgd2l0aCB0aGUgZm9sbG93aW5nIHByb3BlcnRpZXM6XHJcbiAgICAgICAqICAgPHVsPlxyXG4gICAgICAgKiAgICAgPGxpPioqdG9wKio6IFZhbHVlIGZvciB0YXJnZXRFbGVtIHRvcC48L2xpPlxyXG4gICAgICAgKiAgICAgPGxpPioqbGVmdCoqOiBWYWx1ZSBmb3IgdGFyZ2V0RWxlbSBsZWZ0LjwvbGk+XHJcbiAgICAgICAqICAgICA8bGk+KipwbGFjZW1lbnQqKjogVGhlIHJlc29sdmVkIHBsYWNlbWVudC48L2xpPlxyXG4gICAgICAgKiAgIDwvdWw+XHJcbiAgICAgICAqL1xyXG4gICAgICBwb3NpdGlvbkVsZW1lbnRzOiBmdW5jdGlvbihob3N0RWxlbSwgdGFyZ2V0RWxlbSwgcGxhY2VtZW50LCBhcHBlbmRUb0JvZHkpIHtcclxuICAgICAgICBob3N0RWxlbSA9IHRoaXMuZ2V0UmF3Tm9kZShob3N0RWxlbSk7XHJcbiAgICAgICAgdGFyZ2V0RWxlbSA9IHRoaXMuZ2V0UmF3Tm9kZSh0YXJnZXRFbGVtKTtcclxuXHJcbiAgICAgICAgLy8gbmVlZCB0byByZWFkIGZyb20gcHJvcCB0byBzdXBwb3J0IHRlc3RzLlxyXG4gICAgICAgIHZhciB0YXJnZXRXaWR0aCA9IGFuZ3VsYXIuaXNEZWZpbmVkKHRhcmdldEVsZW0ub2Zmc2V0V2lkdGgpID8gdGFyZ2V0RWxlbS5vZmZzZXRXaWR0aCA6IHRhcmdldEVsZW0ucHJvcCgnb2Zmc2V0V2lkdGgnKTtcclxuICAgICAgICB2YXIgdGFyZ2V0SGVpZ2h0ID0gYW5ndWxhci5pc0RlZmluZWQodGFyZ2V0RWxlbS5vZmZzZXRIZWlnaHQpID8gdGFyZ2V0RWxlbS5vZmZzZXRIZWlnaHQgOiB0YXJnZXRFbGVtLnByb3AoJ29mZnNldEhlaWdodCcpO1xyXG5cclxuICAgICAgICBwbGFjZW1lbnQgPSB0aGlzLnBhcnNlUGxhY2VtZW50KHBsYWNlbWVudCk7XHJcblxyXG4gICAgICAgIHZhciBob3N0RWxlbVBvcyA9IGFwcGVuZFRvQm9keSA/IHRoaXMub2Zmc2V0KGhvc3RFbGVtKSA6IHRoaXMucG9zaXRpb24oaG9zdEVsZW0pO1xyXG4gICAgICAgIHZhciB0YXJnZXRFbGVtUG9zID0ge3RvcDogMCwgbGVmdDogMCwgcGxhY2VtZW50OiAnJ307XHJcblxyXG4gICAgICAgIGlmIChwbGFjZW1lbnRbMl0pIHtcclxuICAgICAgICAgIHZhciB2aWV3cG9ydE9mZnNldCA9IHRoaXMudmlld3BvcnRPZmZzZXQoaG9zdEVsZW0sIGFwcGVuZFRvQm9keSk7XHJcblxyXG4gICAgICAgICAgdmFyIHRhcmdldEVsZW1TdHlsZSA9ICR3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZSh0YXJnZXRFbGVtKTtcclxuICAgICAgICAgIHZhciBhZGp1c3RlZFNpemUgPSB7XHJcbiAgICAgICAgICAgIHdpZHRoOiB0YXJnZXRXaWR0aCArIE1hdGgucm91bmQoTWF0aC5hYnModGhpcy5wYXJzZVN0eWxlKHRhcmdldEVsZW1TdHlsZS5tYXJnaW5MZWZ0KSArIHRoaXMucGFyc2VTdHlsZSh0YXJnZXRFbGVtU3R5bGUubWFyZ2luUmlnaHQpKSksXHJcbiAgICAgICAgICAgIGhlaWdodDogdGFyZ2V0SGVpZ2h0ICsgTWF0aC5yb3VuZChNYXRoLmFicyh0aGlzLnBhcnNlU3R5bGUodGFyZ2V0RWxlbVN0eWxlLm1hcmdpblRvcCkgKyB0aGlzLnBhcnNlU3R5bGUodGFyZ2V0RWxlbVN0eWxlLm1hcmdpbkJvdHRvbSkpKVxyXG4gICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICBwbGFjZW1lbnRbMF0gPSBwbGFjZW1lbnRbMF0gPT09ICd0b3AnICYmIGFkanVzdGVkU2l6ZS5oZWlnaHQgPiB2aWV3cG9ydE9mZnNldC50b3AgJiYgYWRqdXN0ZWRTaXplLmhlaWdodCA8PSB2aWV3cG9ydE9mZnNldC5ib3R0b20gPyAnYm90dG9tJyA6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICBwbGFjZW1lbnRbMF0gPT09ICdib3R0b20nICYmIGFkanVzdGVkU2l6ZS5oZWlnaHQgPiB2aWV3cG9ydE9mZnNldC5ib3R0b20gJiYgYWRqdXN0ZWRTaXplLmhlaWdodCA8PSB2aWV3cG9ydE9mZnNldC50b3AgPyAndG9wJyA6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICBwbGFjZW1lbnRbMF0gPT09ICdsZWZ0JyAmJiBhZGp1c3RlZFNpemUud2lkdGggPiB2aWV3cG9ydE9mZnNldC5sZWZ0ICYmIGFkanVzdGVkU2l6ZS53aWR0aCA8PSB2aWV3cG9ydE9mZnNldC5yaWdodCA/ICdyaWdodCcgOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgcGxhY2VtZW50WzBdID09PSAncmlnaHQnICYmIGFkanVzdGVkU2l6ZS53aWR0aCA+IHZpZXdwb3J0T2Zmc2V0LnJpZ2h0ICYmIGFkanVzdGVkU2l6ZS53aWR0aCA8PSB2aWV3cG9ydE9mZnNldC5sZWZ0ID8gJ2xlZnQnIDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgIHBsYWNlbWVudFswXTtcclxuXHJcbiAgICAgICAgICBwbGFjZW1lbnRbMV0gPSBwbGFjZW1lbnRbMV0gPT09ICd0b3AnICYmIGFkanVzdGVkU2l6ZS5oZWlnaHQgLSBob3N0RWxlbVBvcy5oZWlnaHQgPiB2aWV3cG9ydE9mZnNldC5ib3R0b20gJiYgYWRqdXN0ZWRTaXplLmhlaWdodCAtIGhvc3RFbGVtUG9zLmhlaWdodCA8PSB2aWV3cG9ydE9mZnNldC50b3AgPyAnYm90dG9tJyA6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICBwbGFjZW1lbnRbMV0gPT09ICdib3R0b20nICYmIGFkanVzdGVkU2l6ZS5oZWlnaHQgLSBob3N0RWxlbVBvcy5oZWlnaHQgPiB2aWV3cG9ydE9mZnNldC50b3AgJiYgYWRqdXN0ZWRTaXplLmhlaWdodCAtIGhvc3RFbGVtUG9zLmhlaWdodCA8PSB2aWV3cG9ydE9mZnNldC5ib3R0b20gPyAndG9wJyA6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICBwbGFjZW1lbnRbMV0gPT09ICdsZWZ0JyAmJiBhZGp1c3RlZFNpemUud2lkdGggLSBob3N0RWxlbVBvcy53aWR0aCA+IHZpZXdwb3J0T2Zmc2V0LnJpZ2h0ICYmIGFkanVzdGVkU2l6ZS53aWR0aCAtIGhvc3RFbGVtUG9zLndpZHRoIDw9IHZpZXdwb3J0T2Zmc2V0LmxlZnQgPyAncmlnaHQnIDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgIHBsYWNlbWVudFsxXSA9PT0gJ3JpZ2h0JyAmJiBhZGp1c3RlZFNpemUud2lkdGggLSBob3N0RWxlbVBvcy53aWR0aCA+IHZpZXdwb3J0T2Zmc2V0LmxlZnQgJiYgYWRqdXN0ZWRTaXplLndpZHRoIC0gaG9zdEVsZW1Qb3Mud2lkdGggPD0gdmlld3BvcnRPZmZzZXQucmlnaHQgPyAnbGVmdCcgOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgcGxhY2VtZW50WzFdO1xyXG5cclxuICAgICAgICAgIGlmIChwbGFjZW1lbnRbMV0gPT09ICdjZW50ZXInKSB7XHJcbiAgICAgICAgICAgIGlmIChQTEFDRU1FTlRfUkVHRVgudmVydGljYWwudGVzdChwbGFjZW1lbnRbMF0pKSB7XHJcbiAgICAgICAgICAgICAgdmFyIHhPdmVyZmxvdyA9IGhvc3RFbGVtUG9zLndpZHRoIC8gMiAtIHRhcmdldFdpZHRoIC8gMjtcclxuICAgICAgICAgICAgICBpZiAodmlld3BvcnRPZmZzZXQubGVmdCArIHhPdmVyZmxvdyA8IDAgJiYgYWRqdXN0ZWRTaXplLndpZHRoIC0gaG9zdEVsZW1Qb3Mud2lkdGggPD0gdmlld3BvcnRPZmZzZXQucmlnaHQpIHtcclxuICAgICAgICAgICAgICAgIHBsYWNlbWVudFsxXSA9ICdsZWZ0JztcclxuICAgICAgICAgICAgICB9IGVsc2UgaWYgKHZpZXdwb3J0T2Zmc2V0LnJpZ2h0ICsgeE92ZXJmbG93IDwgMCAmJiBhZGp1c3RlZFNpemUud2lkdGggLSBob3N0RWxlbVBvcy53aWR0aCA8PSB2aWV3cG9ydE9mZnNldC5sZWZ0KSB7XHJcbiAgICAgICAgICAgICAgICBwbGFjZW1lbnRbMV0gPSAncmlnaHQnO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICB2YXIgeU92ZXJmbG93ID0gaG9zdEVsZW1Qb3MuaGVpZ2h0IC8gMiAtIGFkanVzdGVkU2l6ZS5oZWlnaHQgLyAyO1xyXG4gICAgICAgICAgICAgIGlmICh2aWV3cG9ydE9mZnNldC50b3AgKyB5T3ZlcmZsb3cgPCAwICYmIGFkanVzdGVkU2l6ZS5oZWlnaHQgLSBob3N0RWxlbVBvcy5oZWlnaHQgPD0gdmlld3BvcnRPZmZzZXQuYm90dG9tKSB7XHJcbiAgICAgICAgICAgICAgICBwbGFjZW1lbnRbMV0gPSAndG9wJztcclxuICAgICAgICAgICAgICB9IGVsc2UgaWYgKHZpZXdwb3J0T2Zmc2V0LmJvdHRvbSArIHlPdmVyZmxvdyA8IDAgJiYgYWRqdXN0ZWRTaXplLmhlaWdodCAtIGhvc3RFbGVtUG9zLmhlaWdodCA8PSB2aWV3cG9ydE9mZnNldC50b3ApIHtcclxuICAgICAgICAgICAgICAgIHBsYWNlbWVudFsxXSA9ICdib3R0b20nO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgc3dpdGNoIChwbGFjZW1lbnRbMF0pIHtcclxuICAgICAgICAgIGNhc2UgJ3RvcCc6XHJcbiAgICAgICAgICAgIHRhcmdldEVsZW1Qb3MudG9wID0gaG9zdEVsZW1Qb3MudG9wIC0gdGFyZ2V0SGVpZ2h0O1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgIGNhc2UgJ2JvdHRvbSc6XHJcbiAgICAgICAgICAgIHRhcmdldEVsZW1Qb3MudG9wID0gaG9zdEVsZW1Qb3MudG9wICsgaG9zdEVsZW1Qb3MuaGVpZ2h0O1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgIGNhc2UgJ2xlZnQnOlxyXG4gICAgICAgICAgICB0YXJnZXRFbGVtUG9zLmxlZnQgPSBob3N0RWxlbVBvcy5sZWZ0IC0gdGFyZ2V0V2lkdGg7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgY2FzZSAncmlnaHQnOlxyXG4gICAgICAgICAgICB0YXJnZXRFbGVtUG9zLmxlZnQgPSBob3N0RWxlbVBvcy5sZWZ0ICsgaG9zdEVsZW1Qb3Mud2lkdGg7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgc3dpdGNoIChwbGFjZW1lbnRbMV0pIHtcclxuICAgICAgICAgIGNhc2UgJ3RvcCc6XHJcbiAgICAgICAgICAgIHRhcmdldEVsZW1Qb3MudG9wID0gaG9zdEVsZW1Qb3MudG9wO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgIGNhc2UgJ2JvdHRvbSc6XHJcbiAgICAgICAgICAgIHRhcmdldEVsZW1Qb3MudG9wID0gaG9zdEVsZW1Qb3MudG9wICsgaG9zdEVsZW1Qb3MuaGVpZ2h0IC0gdGFyZ2V0SGVpZ2h0O1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgIGNhc2UgJ2xlZnQnOlxyXG4gICAgICAgICAgICB0YXJnZXRFbGVtUG9zLmxlZnQgPSBob3N0RWxlbVBvcy5sZWZ0O1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgIGNhc2UgJ3JpZ2h0JzpcclxuICAgICAgICAgICAgdGFyZ2V0RWxlbVBvcy5sZWZ0ID0gaG9zdEVsZW1Qb3MubGVmdCArIGhvc3RFbGVtUG9zLndpZHRoIC0gdGFyZ2V0V2lkdGg7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgY2FzZSAnY2VudGVyJzpcclxuICAgICAgICAgICAgaWYgKFBMQUNFTUVOVF9SRUdFWC52ZXJ0aWNhbC50ZXN0KHBsYWNlbWVudFswXSkpIHtcclxuICAgICAgICAgICAgICB0YXJnZXRFbGVtUG9zLmxlZnQgPSBob3N0RWxlbVBvcy5sZWZ0ICsgaG9zdEVsZW1Qb3Mud2lkdGggLyAyIC0gdGFyZ2V0V2lkdGggLyAyO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIHRhcmdldEVsZW1Qb3MudG9wID0gaG9zdEVsZW1Qb3MudG9wICsgaG9zdEVsZW1Qb3MuaGVpZ2h0IC8gMiAtIHRhcmdldEhlaWdodCAvIDI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0YXJnZXRFbGVtUG9zLnRvcCA9IE1hdGgucm91bmQodGFyZ2V0RWxlbVBvcy50b3ApO1xyXG4gICAgICAgIHRhcmdldEVsZW1Qb3MubGVmdCA9IE1hdGgucm91bmQodGFyZ2V0RWxlbVBvcy5sZWZ0KTtcclxuICAgICAgICB0YXJnZXRFbGVtUG9zLnBsYWNlbWVudCA9IHBsYWNlbWVudFsxXSA9PT0gJ2NlbnRlcicgPyBwbGFjZW1lbnRbMF0gOiBwbGFjZW1lbnRbMF0gKyAnLScgKyBwbGFjZW1lbnRbMV07XHJcblxyXG4gICAgICAgIHJldHVybiB0YXJnZXRFbGVtUG9zO1xyXG4gICAgICB9LFxyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIFByb3ZpZGVzIGEgd2F5IHRvIGFkanVzdCB0aGUgdG9wIHBvc2l0aW9uaW5nIGFmdGVyIGZpcnN0XHJcbiAgICAgICAqIHJlbmRlciB0byBjb3JyZWN0bHkgYWxpZ24gZWxlbWVudCB0byB0b3AgYWZ0ZXIgY29udGVudFxyXG4gICAgICAgKiByZW5kZXJpbmcgY2F1c2VzIHJlc2l6ZWQgZWxlbWVudCBoZWlnaHRcclxuICAgICAgICpcclxuICAgICAgICogQHBhcmFtIHthcnJheX0gcGxhY2VtZW50Q2xhc3NlcyAtIFRoZSBhcnJheSBvZiBzdHJpbmdzIG9mIGNsYXNzZXNcclxuICAgICAgICogZWxlbWVudCBzaG91bGQgaGF2ZS5cclxuICAgICAgICogQHBhcmFtIHtvYmplY3R9IGNvbnRhaW5lclBvc2l0aW9uIC0gVGhlIG9iamVjdCB3aXRoIGNvbnRhaW5lclxyXG4gICAgICAgKiBwb3NpdGlvbiBpbmZvcm1hdGlvblxyXG4gICAgICAgKiBAcGFyYW0ge251bWJlcn0gaW5pdGlhbEhlaWdodCAtIFRoZSBpbml0aWFsIGhlaWdodCBmb3IgdGhlIGVsZW0uXHJcbiAgICAgICAqIEBwYXJhbSB7bnVtYmVyfSBjdXJyZW50SGVpZ2h0IC0gVGhlIGN1cnJlbnQgaGVpZ2h0IGZvciB0aGUgZWxlbS5cclxuICAgICAgICovXHJcbiAgICAgIGFkanVzdFRvcDogZnVuY3Rpb24ocGxhY2VtZW50Q2xhc3NlcywgY29udGFpbmVyUG9zaXRpb24sIGluaXRpYWxIZWlnaHQsIGN1cnJlbnRIZWlnaHQpIHtcclxuICAgICAgICBpZiAocGxhY2VtZW50Q2xhc3Nlcy5pbmRleE9mKCd0b3AnKSAhPT0gLTEgJiYgaW5pdGlhbEhlaWdodCAhPT0gY3VycmVudEhlaWdodCkge1xyXG4gICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgdG9wOiBjb250YWluZXJQb3NpdGlvbi50b3AgLSBjdXJyZW50SGVpZ2h0ICsgJ3B4J1xyXG4gICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogUHJvdmlkZXMgYSB3YXkgZm9yIHBvc2l0aW9uaW5nIHRvb2x0aXAgJiBkcm9wZG93blxyXG4gICAgICAgKiBhcnJvd3Mgd2hlbiB1c2luZyBwbGFjZW1lbnQgb3B0aW9ucyBiZXlvbmQgdGhlIHN0YW5kYXJkXHJcbiAgICAgICAqIGxlZnQsIHJpZ2h0LCB0b3AsIG9yIGJvdHRvbS5cclxuICAgICAgICpcclxuICAgICAgICogQHBhcmFtIHtlbGVtZW50fSBlbGVtIC0gVGhlIHRvb2x0aXAvZHJvcGRvd24gZWxlbWVudC5cclxuICAgICAgICogQHBhcmFtIHtzdHJpbmd9IHBsYWNlbWVudCAtIFRoZSBwbGFjZW1lbnQgZm9yIHRoZSBlbGVtLlxyXG4gICAgICAgKi9cclxuICAgICAgcG9zaXRpb25BcnJvdzogZnVuY3Rpb24oZWxlbSwgcGxhY2VtZW50KSB7XHJcbiAgICAgICAgZWxlbSA9IHRoaXMuZ2V0UmF3Tm9kZShlbGVtKTtcclxuXHJcbiAgICAgICAgdmFyIGlubmVyRWxlbSA9IGVsZW0ucXVlcnlTZWxlY3RvcignLnRvb2x0aXAtaW5uZXIsIC5wb3BvdmVyLWlubmVyJyk7XHJcbiAgICAgICAgaWYgKCFpbm5lckVsZW0pIHtcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhciBpc1Rvb2x0aXAgPSBhbmd1bGFyLmVsZW1lbnQoaW5uZXJFbGVtKS5oYXNDbGFzcygndG9vbHRpcC1pbm5lcicpO1xyXG5cclxuICAgICAgICB2YXIgYXJyb3dFbGVtID0gaXNUb29sdGlwID8gZWxlbS5xdWVyeVNlbGVjdG9yKCcudG9vbHRpcC1hcnJvdycpIDogZWxlbS5xdWVyeVNlbGVjdG9yKCcuYXJyb3cnKTtcclxuICAgICAgICBpZiAoIWFycm93RWxlbSkge1xyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdmFyIGFycm93Q3NzID0ge1xyXG4gICAgICAgICAgdG9wOiAnJyxcclxuICAgICAgICAgIGJvdHRvbTogJycsXHJcbiAgICAgICAgICBsZWZ0OiAnJyxcclxuICAgICAgICAgIHJpZ2h0OiAnJ1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHBsYWNlbWVudCA9IHRoaXMucGFyc2VQbGFjZW1lbnQocGxhY2VtZW50KTtcclxuICAgICAgICBpZiAocGxhY2VtZW50WzFdID09PSAnY2VudGVyJykge1xyXG4gICAgICAgICAgLy8gbm8gYWRqdXN0bWVudCBuZWNlc3NhcnkgLSBqdXN0IHJlc2V0IHN0eWxlc1xyXG4gICAgICAgICAgYW5ndWxhci5lbGVtZW50KGFycm93RWxlbSkuY3NzKGFycm93Q3NzKTtcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhciBib3JkZXJQcm9wID0gJ2JvcmRlci0nICsgcGxhY2VtZW50WzBdICsgJy13aWR0aCc7XHJcbiAgICAgICAgdmFyIGJvcmRlcldpZHRoID0gJHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKGFycm93RWxlbSlbYm9yZGVyUHJvcF07XHJcblxyXG4gICAgICAgIHZhciBib3JkZXJSYWRpdXNQcm9wID0gJ2JvcmRlci0nO1xyXG4gICAgICAgIGlmIChQTEFDRU1FTlRfUkVHRVgudmVydGljYWwudGVzdChwbGFjZW1lbnRbMF0pKSB7XHJcbiAgICAgICAgICBib3JkZXJSYWRpdXNQcm9wICs9IHBsYWNlbWVudFswXSArICctJyArIHBsYWNlbWVudFsxXTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgYm9yZGVyUmFkaXVzUHJvcCArPSBwbGFjZW1lbnRbMV0gKyAnLScgKyBwbGFjZW1lbnRbMF07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGJvcmRlclJhZGl1c1Byb3AgKz0gJy1yYWRpdXMnO1xyXG4gICAgICAgIHZhciBib3JkZXJSYWRpdXMgPSAkd2luZG93LmdldENvbXB1dGVkU3R5bGUoaXNUb29sdGlwID8gaW5uZXJFbGVtIDogZWxlbSlbYm9yZGVyUmFkaXVzUHJvcF07XHJcblxyXG4gICAgICAgIHN3aXRjaCAocGxhY2VtZW50WzBdKSB7XHJcbiAgICAgICAgICBjYXNlICd0b3AnOlxyXG4gICAgICAgICAgICBhcnJvd0Nzcy5ib3R0b20gPSBpc1Rvb2x0aXAgPyAnMCcgOiAnLScgKyBib3JkZXJXaWR0aDtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICBjYXNlICdib3R0b20nOlxyXG4gICAgICAgICAgICBhcnJvd0Nzcy50b3AgPSBpc1Rvb2x0aXAgPyAnMCcgOiAnLScgKyBib3JkZXJXaWR0aDtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICBjYXNlICdsZWZ0JzpcclxuICAgICAgICAgICAgYXJyb3dDc3MucmlnaHQgPSBpc1Rvb2x0aXAgPyAnMCcgOiAnLScgKyBib3JkZXJXaWR0aDtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICBjYXNlICdyaWdodCc6XHJcbiAgICAgICAgICAgIGFycm93Q3NzLmxlZnQgPSBpc1Rvb2x0aXAgPyAnMCcgOiAnLScgKyBib3JkZXJXaWR0aDtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBhcnJvd0Nzc1twbGFjZW1lbnRbMV1dID0gYm9yZGVyUmFkaXVzO1xyXG5cclxuICAgICAgICBhbmd1bGFyLmVsZW1lbnQoYXJyb3dFbGVtKS5jc3MoYXJyb3dDc3MpO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG4gIH1dKTtcclxuXHJcbmFuZ3VsYXIubW9kdWxlKCd1aS5ib290c3RyYXAuZGF0ZXBpY2tlclBvcHVwJywgWyd1aS5ib290c3RyYXAuZGF0ZXBpY2tlcicsICd1aS5ib290c3RyYXAucG9zaXRpb24nXSlcclxuXHJcbi52YWx1ZSgnJGRhdGVwaWNrZXJQb3B1cExpdGVyYWxXYXJuaW5nJywgdHJ1ZSlcclxuXHJcbi5jb25zdGFudCgndWliRGF0ZXBpY2tlclBvcHVwQ29uZmlnJywge1xyXG4gIGFsdElucHV0Rm9ybWF0czogW10sXHJcbiAgYXBwZW5kVG9Cb2R5OiBmYWxzZSxcclxuICBjbGVhclRleHQ6ICdDbGVhcicsXHJcbiAgY2xvc2VPbkRhdGVTZWxlY3Rpb246IHRydWUsXHJcbiAgY2xvc2VUZXh0OiAnRG9uZScsXHJcbiAgY3VycmVudFRleHQ6ICdUb2RheScsXHJcbiAgZGF0ZXBpY2tlclBvcHVwOiAneXl5eS1NTS1kZCcsXHJcbiAgZGF0ZXBpY2tlclBvcHVwVGVtcGxhdGVVcmw6ICd1aWIvdGVtcGxhdGUvZGF0ZXBpY2tlclBvcHVwL3BvcHVwLmh0bWwnLFxyXG4gIGRhdGVwaWNrZXJUZW1wbGF0ZVVybDogJ3VpYi90ZW1wbGF0ZS9kYXRlcGlja2VyL2RhdGVwaWNrZXIuaHRtbCcsXHJcbiAgaHRtbDVUeXBlczoge1xyXG4gICAgZGF0ZTogJ3l5eXktTU0tZGQnLFxyXG4gICAgJ2RhdGV0aW1lLWxvY2FsJzogJ3l5eXktTU0tZGRUSEg6bW06c3Muc3NzJyxcclxuICAgICdtb250aCc6ICd5eXl5LU1NJ1xyXG4gIH0sXHJcbiAgb25PcGVuRm9jdXM6IHRydWUsXHJcbiAgc2hvd0J1dHRvbkJhcjogdHJ1ZSxcclxuICBwbGFjZW1lbnQ6ICdhdXRvIGJvdHRvbS1sZWZ0J1xyXG59KVxyXG5cclxuLmNvbnRyb2xsZXIoJ1VpYkRhdGVwaWNrZXJQb3B1cENvbnRyb2xsZXInLCBbJyRzY29wZScsICckZWxlbWVudCcsICckYXR0cnMnLCAnJGNvbXBpbGUnLCAnJGxvZycsICckcGFyc2UnLCAnJHdpbmRvdycsICckZG9jdW1lbnQnLCAnJHJvb3RTY29wZScsICckdWliUG9zaXRpb24nLCAnZGF0ZUZpbHRlcicsICd1aWJEYXRlUGFyc2VyJywgJ3VpYkRhdGVwaWNrZXJQb3B1cENvbmZpZycsICckdGltZW91dCcsICd1aWJEYXRlcGlja2VyQ29uZmlnJywgJyRkYXRlcGlja2VyUG9wdXBMaXRlcmFsV2FybmluZycsXHJcbmZ1bmN0aW9uKCRzY29wZSwgJGVsZW1lbnQsICRhdHRycywgJGNvbXBpbGUsICRsb2csICRwYXJzZSwgJHdpbmRvdywgJGRvY3VtZW50LCAkcm9vdFNjb3BlLCAkcG9zaXRpb24sIGRhdGVGaWx0ZXIsIGRhdGVQYXJzZXIsIGRhdGVwaWNrZXJQb3B1cENvbmZpZywgJHRpbWVvdXQsIGRhdGVwaWNrZXJDb25maWcsICRkYXRlcGlja2VyUG9wdXBMaXRlcmFsV2FybmluZykge1xyXG4gIHZhciBjYWNoZSA9IHt9LFxyXG4gICAgaXNIdG1sNURhdGVJbnB1dCA9IGZhbHNlO1xyXG4gIHZhciBkYXRlRm9ybWF0LCBjbG9zZU9uRGF0ZVNlbGVjdGlvbiwgYXBwZW5kVG9Cb2R5LCBvbk9wZW5Gb2N1cyxcclxuICAgIGRhdGVwaWNrZXJQb3B1cFRlbXBsYXRlVXJsLCBkYXRlcGlja2VyVGVtcGxhdGVVcmwsIHBvcHVwRWwsIGRhdGVwaWNrZXJFbCwgc2Nyb2xsUGFyZW50RWwsXHJcbiAgICBuZ01vZGVsLCBuZ01vZGVsT3B0aW9ucywgJHBvcHVwLCBhbHRJbnB1dEZvcm1hdHMsIHdhdGNoTGlzdGVuZXJzID0gW107XHJcblxyXG4gIHRoaXMuaW5pdCA9IGZ1bmN0aW9uKF9uZ01vZGVsXykge1xyXG4gICAgbmdNb2RlbCA9IF9uZ01vZGVsXztcclxuICAgIG5nTW9kZWxPcHRpb25zID0gYW5ndWxhci5pc09iamVjdChfbmdNb2RlbF8uJG9wdGlvbnMpID9cclxuICAgICAgX25nTW9kZWxfLiRvcHRpb25zIDpcclxuICAgICAge1xyXG4gICAgICAgIHRpbWV6b25lOiBudWxsXHJcbiAgICAgIH07XHJcbiAgICBjbG9zZU9uRGF0ZVNlbGVjdGlvbiA9IGFuZ3VsYXIuaXNEZWZpbmVkKCRhdHRycy5jbG9zZU9uRGF0ZVNlbGVjdGlvbikgP1xyXG4gICAgICAkc2NvcGUuJHBhcmVudC4kZXZhbCgkYXR0cnMuY2xvc2VPbkRhdGVTZWxlY3Rpb24pIDpcclxuICAgICAgZGF0ZXBpY2tlclBvcHVwQ29uZmlnLmNsb3NlT25EYXRlU2VsZWN0aW9uO1xyXG4gICAgYXBwZW5kVG9Cb2R5ID0gYW5ndWxhci5pc0RlZmluZWQoJGF0dHJzLmRhdGVwaWNrZXJBcHBlbmRUb0JvZHkpID9cclxuICAgICAgJHNjb3BlLiRwYXJlbnQuJGV2YWwoJGF0dHJzLmRhdGVwaWNrZXJBcHBlbmRUb0JvZHkpIDpcclxuICAgICAgZGF0ZXBpY2tlclBvcHVwQ29uZmlnLmFwcGVuZFRvQm9keTtcclxuICAgIG9uT3BlbkZvY3VzID0gYW5ndWxhci5pc0RlZmluZWQoJGF0dHJzLm9uT3BlbkZvY3VzKSA/XHJcbiAgICAgICRzY29wZS4kcGFyZW50LiRldmFsKCRhdHRycy5vbk9wZW5Gb2N1cykgOiBkYXRlcGlja2VyUG9wdXBDb25maWcub25PcGVuRm9jdXM7XHJcbiAgICBkYXRlcGlja2VyUG9wdXBUZW1wbGF0ZVVybCA9IGFuZ3VsYXIuaXNEZWZpbmVkKCRhdHRycy5kYXRlcGlja2VyUG9wdXBUZW1wbGF0ZVVybCkgP1xyXG4gICAgICAkYXR0cnMuZGF0ZXBpY2tlclBvcHVwVGVtcGxhdGVVcmwgOlxyXG4gICAgICBkYXRlcGlja2VyUG9wdXBDb25maWcuZGF0ZXBpY2tlclBvcHVwVGVtcGxhdGVVcmw7XHJcbiAgICBkYXRlcGlja2VyVGVtcGxhdGVVcmwgPSBhbmd1bGFyLmlzRGVmaW5lZCgkYXR0cnMuZGF0ZXBpY2tlclRlbXBsYXRlVXJsKSA/XHJcbiAgICAgICRhdHRycy5kYXRlcGlja2VyVGVtcGxhdGVVcmwgOiBkYXRlcGlja2VyUG9wdXBDb25maWcuZGF0ZXBpY2tlclRlbXBsYXRlVXJsO1xyXG4gICAgYWx0SW5wdXRGb3JtYXRzID0gYW5ndWxhci5pc0RlZmluZWQoJGF0dHJzLmFsdElucHV0Rm9ybWF0cykgP1xyXG4gICAgICAkc2NvcGUuJHBhcmVudC4kZXZhbCgkYXR0cnMuYWx0SW5wdXRGb3JtYXRzKSA6XHJcbiAgICAgIGRhdGVwaWNrZXJQb3B1cENvbmZpZy5hbHRJbnB1dEZvcm1hdHM7XHJcblxyXG4gICAgJHNjb3BlLnNob3dCdXR0b25CYXIgPSBhbmd1bGFyLmlzRGVmaW5lZCgkYXR0cnMuc2hvd0J1dHRvbkJhcikgP1xyXG4gICAgICAkc2NvcGUuJHBhcmVudC4kZXZhbCgkYXR0cnMuc2hvd0J1dHRvbkJhcikgOlxyXG4gICAgICBkYXRlcGlja2VyUG9wdXBDb25maWcuc2hvd0J1dHRvbkJhcjtcclxuXHJcbiAgICBpZiAoZGF0ZXBpY2tlclBvcHVwQ29uZmlnLmh0bWw1VHlwZXNbJGF0dHJzLnR5cGVdKSB7XHJcbiAgICAgIGRhdGVGb3JtYXQgPSBkYXRlcGlja2VyUG9wdXBDb25maWcuaHRtbDVUeXBlc1skYXR0cnMudHlwZV07XHJcbiAgICAgIGlzSHRtbDVEYXRlSW5wdXQgPSB0cnVlO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgZGF0ZUZvcm1hdCA9ICRhdHRycy51aWJEYXRlcGlja2VyUG9wdXAgfHwgZGF0ZXBpY2tlclBvcHVwQ29uZmlnLmRhdGVwaWNrZXJQb3B1cDtcclxuICAgICAgJGF0dHJzLiRvYnNlcnZlKCd1aWJEYXRlcGlja2VyUG9wdXAnLCBmdW5jdGlvbih2YWx1ZSwgb2xkVmFsdWUpIHtcclxuICAgICAgICB2YXIgbmV3RGF0ZUZvcm1hdCA9IHZhbHVlIHx8IGRhdGVwaWNrZXJQb3B1cENvbmZpZy5kYXRlcGlja2VyUG9wdXA7XHJcbiAgICAgICAgLy8gSW52YWxpZGF0ZSB0aGUgJG1vZGVsVmFsdWUgdG8gZW5zdXJlIHRoYXQgZm9ybWF0dGVycyByZS1ydW5cclxuICAgICAgICAvLyBGSVhNRTogUmVmYWN0b3Igd2hlbiBQUiBpcyBtZXJnZWQ6IGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2FuZ3VsYXIuanMvcHVsbC8xMDc2NFxyXG4gICAgICAgIGlmIChuZXdEYXRlRm9ybWF0ICE9PSBkYXRlRm9ybWF0KSB7XHJcbiAgICAgICAgICBkYXRlRm9ybWF0ID0gbmV3RGF0ZUZvcm1hdDtcclxuICAgICAgICAgIG5nTW9kZWwuJG1vZGVsVmFsdWUgPSBudWxsO1xyXG5cclxuICAgICAgICAgIGlmICghZGF0ZUZvcm1hdCkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ3VpYkRhdGVwaWNrZXJQb3B1cCBtdXN0IGhhdmUgYSBkYXRlIGZvcm1hdCBzcGVjaWZpZWQuJyk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIWRhdGVGb3JtYXQpIHtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKCd1aWJEYXRlcGlja2VyUG9wdXAgbXVzdCBoYXZlIGEgZGF0ZSBmb3JtYXQgc3BlY2lmaWVkLicpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChpc0h0bWw1RGF0ZUlucHV0ICYmICRhdHRycy51aWJEYXRlcGlja2VyUG9wdXApIHtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdIVE1MNSBkYXRlIGlucHV0IHR5cGVzIGRvIG5vdCBzdXBwb3J0IGN1c3RvbSBmb3JtYXRzLicpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIHBvcHVwIGVsZW1lbnQgdXNlZCB0byBkaXNwbGF5IGNhbGVuZGFyXHJcbiAgICBwb3B1cEVsID0gYW5ndWxhci5lbGVtZW50KCc8ZGl2IHVpYi1kYXRlcGlja2VyLXBvcHVwLXdyYXA+PGRpdiB1aWItZGF0ZXBpY2tlcj48L2Rpdj48L2Rpdj4nKTtcclxuXHJcbiAgICBwb3B1cEVsLmF0dHIoe1xyXG4gICAgICAnbmctbW9kZWwnOiAnZGF0ZScsXHJcbiAgICAgICduZy1jaGFuZ2UnOiAnZGF0ZVNlbGVjdGlvbihkYXRlKScsXHJcbiAgICAgICd0ZW1wbGF0ZS11cmwnOiBkYXRlcGlja2VyUG9wdXBUZW1wbGF0ZVVybFxyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gZGF0ZXBpY2tlciBlbGVtZW50XHJcbiAgICBkYXRlcGlja2VyRWwgPSBhbmd1bGFyLmVsZW1lbnQocG9wdXBFbC5jaGlsZHJlbigpWzBdKTtcclxuICAgIGRhdGVwaWNrZXJFbC5hdHRyKCd0ZW1wbGF0ZS11cmwnLCBkYXRlcGlja2VyVGVtcGxhdGVVcmwpO1xyXG5cclxuICAgIGlmICghJHNjb3BlLmRhdGVwaWNrZXJPcHRpb25zKSB7XHJcbiAgICAgICRzY29wZS5kYXRlcGlja2VyT3B0aW9ucyA9IHt9O1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChpc0h0bWw1RGF0ZUlucHV0KSB7XHJcbiAgICAgIGlmICgkYXR0cnMudHlwZSA9PT0gJ21vbnRoJykge1xyXG4gICAgICAgICRzY29wZS5kYXRlcGlja2VyT3B0aW9ucy5kYXRlcGlja2VyTW9kZSA9ICdtb250aCc7XHJcbiAgICAgICAgJHNjb3BlLmRhdGVwaWNrZXJPcHRpb25zLm1pbk1vZGUgPSAnbW9udGgnO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZGF0ZXBpY2tlckVsLmF0dHIoJ2RhdGVwaWNrZXItb3B0aW9ucycsICdkYXRlcGlja2VyT3B0aW9ucycpO1xyXG5cclxuICAgIGlmICghaXNIdG1sNURhdGVJbnB1dCkge1xyXG4gICAgICAvLyBJbnRlcm5hbCBBUEkgdG8gbWFpbnRhaW4gdGhlIGNvcnJlY3QgbmctaW52YWxpZC1ba2V5XSBjbGFzc1xyXG4gICAgICBuZ01vZGVsLiQkcGFyc2VyTmFtZSA9ICdkYXRlJztcclxuICAgICAgbmdNb2RlbC4kdmFsaWRhdG9ycy5kYXRlID0gdmFsaWRhdG9yO1xyXG4gICAgICBuZ01vZGVsLiRwYXJzZXJzLnVuc2hpZnQocGFyc2VEYXRlKTtcclxuICAgICAgbmdNb2RlbC4kZm9ybWF0dGVycy5wdXNoKGZ1bmN0aW9uKHZhbHVlKSB7XHJcbiAgICAgICAgaWYgKG5nTW9kZWwuJGlzRW1wdHkodmFsdWUpKSB7XHJcbiAgICAgICAgICAkc2NvcGUuZGF0ZSA9IHZhbHVlO1xyXG4gICAgICAgICAgcmV0dXJuIHZhbHVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGFuZ3VsYXIuaXNOdW1iZXIodmFsdWUpKSB7XHJcbiAgICAgICAgICB2YWx1ZSA9IG5ldyBEYXRlKHZhbHVlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgICRzY29wZS5kYXRlID0gZGF0ZVBhcnNlci5mcm9tVGltZXpvbmUodmFsdWUsIG5nTW9kZWxPcHRpb25zLnRpbWV6b25lKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGRhdGVQYXJzZXIuZmlsdGVyKCRzY29wZS5kYXRlLCBkYXRlRm9ybWF0KTtcclxuICAgICAgfSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBuZ01vZGVsLiRmb3JtYXR0ZXJzLnB1c2goZnVuY3Rpb24odmFsdWUpIHtcclxuICAgICAgICAkc2NvcGUuZGF0ZSA9IGRhdGVQYXJzZXIuZnJvbVRpbWV6b25lKHZhbHVlLCBuZ01vZGVsT3B0aW9ucy50aW1lem9uZSk7XHJcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBEZXRlY3QgY2hhbmdlcyBpbiB0aGUgdmlldyBmcm9tIHRoZSB0ZXh0IGJveFxyXG4gICAgbmdNb2RlbC4kdmlld0NoYW5nZUxpc3RlbmVycy5wdXNoKGZ1bmN0aW9uKCkge1xyXG4gICAgICAkc2NvcGUuZGF0ZSA9IHBhcnNlRGF0ZVN0cmluZyhuZ01vZGVsLiR2aWV3VmFsdWUpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgJGVsZW1lbnQub24oJ2tleWRvd24nLCBpbnB1dEtleWRvd25CaW5kKTtcclxuXHJcbiAgICAkcG9wdXAgPSAkY29tcGlsZShwb3B1cEVsKSgkc2NvcGUpO1xyXG4gICAgLy8gUHJldmVudCBqUXVlcnkgY2FjaGUgbWVtb3J5IGxlYWsgKHRlbXBsYXRlIGlzIG5vdyByZWR1bmRhbnQgYWZ0ZXIgbGlua2luZylcclxuICAgIHBvcHVwRWwucmVtb3ZlKCk7XHJcblxyXG4gICAgaWYgKGFwcGVuZFRvQm9keSkge1xyXG4gICAgICAkZG9jdW1lbnQuZmluZCgnYm9keScpLmFwcGVuZCgkcG9wdXApO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgJGVsZW1lbnQuYWZ0ZXIoJHBvcHVwKTtcclxuICAgIH1cclxuXHJcbiAgICAkc2NvcGUuJG9uKCckZGVzdHJveScsIGZ1bmN0aW9uKCkge1xyXG4gICAgICBpZiAoJHNjb3BlLmlzT3BlbiA9PT0gdHJ1ZSkge1xyXG4gICAgICAgIGlmICghJHJvb3RTY29wZS4kJHBoYXNlKSB7XHJcbiAgICAgICAgICAkc2NvcGUuJGFwcGx5KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAkc2NvcGUuaXNPcGVuID0gZmFsc2U7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgICRwb3B1cC5yZW1vdmUoKTtcclxuICAgICAgJGVsZW1lbnQub2ZmKCdrZXlkb3duJywgaW5wdXRLZXlkb3duQmluZCk7XHJcbiAgICAgICRkb2N1bWVudC5vZmYoJ2NsaWNrJywgZG9jdW1lbnRDbGlja0JpbmQpO1xyXG4gICAgICBpZiAoc2Nyb2xsUGFyZW50RWwpIHtcclxuICAgICAgICBzY3JvbGxQYXJlbnRFbC5vZmYoJ3Njcm9sbCcsIHBvc2l0aW9uUG9wdXApO1xyXG4gICAgICB9XHJcbiAgICAgIGFuZ3VsYXIuZWxlbWVudCgkd2luZG93KS5vZmYoJ3Jlc2l6ZScsIHBvc2l0aW9uUG9wdXApO1xyXG5cclxuICAgICAgLy9DbGVhciBhbGwgd2F0Y2ggbGlzdGVuZXJzIG9uIGRlc3Ryb3lcclxuICAgICAgd2hpbGUgKHdhdGNoTGlzdGVuZXJzLmxlbmd0aCkge1xyXG4gICAgICAgIHdhdGNoTGlzdGVuZXJzLnNoaWZ0KCkoKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgfTtcclxuXHJcbiAgJHNjb3BlLmdldFRleHQgPSBmdW5jdGlvbihrZXkpIHtcclxuICAgIHJldHVybiAkc2NvcGVba2V5ICsgJ1RleHQnXSB8fCBkYXRlcGlja2VyUG9wdXBDb25maWdba2V5ICsgJ1RleHQnXTtcclxuICB9O1xyXG5cclxuICAkc2NvcGUuaXNEaXNhYmxlZCA9IGZ1bmN0aW9uKGRhdGUpIHtcclxuICAgIGlmIChkYXRlID09PSAndG9kYXknKSB7XHJcbiAgICAgIGRhdGUgPSBkYXRlUGFyc2VyLmZyb21UaW1lem9uZShuZXcgRGF0ZSgpLCBuZ01vZGVsT3B0aW9ucy50aW1lem9uZSk7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGRhdGVzID0ge307XHJcbiAgICBhbmd1bGFyLmZvckVhY2goWydtaW5EYXRlJywgJ21heERhdGUnXSwgZnVuY3Rpb24oa2V5KSB7XHJcbiAgICAgIGlmICghJHNjb3BlLmRhdGVwaWNrZXJPcHRpb25zW2tleV0pIHtcclxuICAgICAgICBkYXRlc1trZXldID0gbnVsbDtcclxuICAgICAgfSBlbHNlIGlmIChhbmd1bGFyLmlzRGF0ZSgkc2NvcGUuZGF0ZXBpY2tlck9wdGlvbnNba2V5XSkpIHtcclxuICAgICAgICBkYXRlc1trZXldID0gbmV3IERhdGUoJHNjb3BlLmRhdGVwaWNrZXJPcHRpb25zW2tleV0pO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGlmICgkZGF0ZXBpY2tlclBvcHVwTGl0ZXJhbFdhcm5pbmcpIHtcclxuICAgICAgICAgICRsb2cud2FybignTGl0ZXJhbCBkYXRlIHN1cHBvcnQgaGFzIGJlZW4gZGVwcmVjYXRlZCwgcGxlYXNlIHN3aXRjaCB0byBkYXRlIG9iamVjdCB1c2FnZScpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZGF0ZXNba2V5XSA9IG5ldyBEYXRlKGRhdGVGaWx0ZXIoJHNjb3BlLmRhdGVwaWNrZXJPcHRpb25zW2tleV0sICdtZWRpdW0nKSk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIHJldHVybiAkc2NvcGUuZGF0ZXBpY2tlck9wdGlvbnMgJiZcclxuICAgICAgZGF0ZXMubWluRGF0ZSAmJiAkc2NvcGUuY29tcGFyZShkYXRlLCBkYXRlcy5taW5EYXRlKSA8IDAgfHxcclxuICAgICAgZGF0ZXMubWF4RGF0ZSAmJiAkc2NvcGUuY29tcGFyZShkYXRlLCBkYXRlcy5tYXhEYXRlKSA+IDA7XHJcbiAgfTtcclxuXHJcbiAgJHNjb3BlLmNvbXBhcmUgPSBmdW5jdGlvbihkYXRlMSwgZGF0ZTIpIHtcclxuICAgIHJldHVybiBuZXcgRGF0ZShkYXRlMS5nZXRGdWxsWWVhcigpLCBkYXRlMS5nZXRNb250aCgpLCBkYXRlMS5nZXREYXRlKCkpIC0gbmV3IERhdGUoZGF0ZTIuZ2V0RnVsbFllYXIoKSwgZGF0ZTIuZ2V0TW9udGgoKSwgZGF0ZTIuZ2V0RGF0ZSgpKTtcclxuICB9O1xyXG5cclxuICAvLyBJbm5lciBjaGFuZ2VcclxuICAkc2NvcGUuZGF0ZVNlbGVjdGlvbiA9IGZ1bmN0aW9uKGR0KSB7XHJcbiAgICAkc2NvcGUuZGF0ZSA9IGR0O1xyXG4gICAgdmFyIGRhdGUgPSAkc2NvcGUuZGF0ZSA/IGRhdGVQYXJzZXIuZmlsdGVyKCRzY29wZS5kYXRlLCBkYXRlRm9ybWF0KSA6IG51bGw7IC8vIFNldHRpbmcgdG8gTlVMTCBpcyBuZWNlc3NhcnkgZm9yIGZvcm0gdmFsaWRhdG9ycyB0byBmdW5jdGlvblxyXG4gICAgJGVsZW1lbnQudmFsKGRhdGUpO1xyXG4gICAgbmdNb2RlbC4kc2V0Vmlld1ZhbHVlKGRhdGUpO1xyXG5cclxuICAgIGlmIChjbG9zZU9uRGF0ZVNlbGVjdGlvbikge1xyXG4gICAgICAkc2NvcGUuaXNPcGVuID0gZmFsc2U7XHJcbiAgICAgICRlbGVtZW50WzBdLmZvY3VzKCk7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgJHNjb3BlLmtleWRvd24gPSBmdW5jdGlvbihldnQpIHtcclxuICAgIGlmIChldnQud2hpY2ggPT09IDI3KSB7XHJcbiAgICAgIGV2dC5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgJHNjb3BlLmlzT3BlbiA9IGZhbHNlO1xyXG4gICAgICAkZWxlbWVudFswXS5mb2N1cygpO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gICRzY29wZS5zZWxlY3QgPSBmdW5jdGlvbihkYXRlLCBldnQpIHtcclxuICAgIGV2dC5zdG9wUHJvcGFnYXRpb24oKTtcclxuXHJcbiAgICBpZiAoZGF0ZSA9PT0gJ3RvZGF5Jykge1xyXG4gICAgICB2YXIgdG9kYXkgPSBuZXcgRGF0ZSgpO1xyXG4gICAgICBpZiAoYW5ndWxhci5pc0RhdGUoJHNjb3BlLmRhdGUpKSB7XHJcbiAgICAgICAgZGF0ZSA9IG5ldyBEYXRlKCRzY29wZS5kYXRlKTtcclxuICAgICAgICBkYXRlLnNldEZ1bGxZZWFyKHRvZGF5LmdldEZ1bGxZZWFyKCksIHRvZGF5LmdldE1vbnRoKCksIHRvZGF5LmdldERhdGUoKSk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgZGF0ZSA9IGRhdGVQYXJzZXIuZnJvbVRpbWV6b25lKHRvZGF5LCBuZ01vZGVsT3B0aW9ucy50aW1lem9uZSk7XHJcbiAgICAgICAgZGF0ZS5zZXRIb3VycygwLCAwLCAwLCAwKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgJHNjb3BlLmRhdGVTZWxlY3Rpb24oZGF0ZSk7XHJcbiAgfTtcclxuXHJcbiAgJHNjb3BlLmNsb3NlID0gZnVuY3Rpb24oZXZ0KSB7XHJcbiAgICBldnQuc3RvcFByb3BhZ2F0aW9uKCk7XHJcblxyXG4gICAgJHNjb3BlLmlzT3BlbiA9IGZhbHNlO1xyXG4gICAgJGVsZW1lbnRbMF0uZm9jdXMoKTtcclxuICB9O1xyXG5cclxuICAkc2NvcGUuZGlzYWJsZWQgPSBhbmd1bGFyLmlzRGVmaW5lZCgkYXR0cnMuZGlzYWJsZWQpIHx8IGZhbHNlO1xyXG4gIGlmICgkYXR0cnMubmdEaXNhYmxlZCkge1xyXG4gICAgd2F0Y2hMaXN0ZW5lcnMucHVzaCgkc2NvcGUuJHBhcmVudC4kd2F0Y2goJHBhcnNlKCRhdHRycy5uZ0Rpc2FibGVkKSwgZnVuY3Rpb24oZGlzYWJsZWQpIHtcclxuICAgICAgJHNjb3BlLmRpc2FibGVkID0gZGlzYWJsZWQ7XHJcbiAgICB9KSk7XHJcbiAgfVxyXG5cclxuICAkc2NvcGUuJHdhdGNoKCdpc09wZW4nLCBmdW5jdGlvbih2YWx1ZSkge1xyXG4gICAgaWYgKHZhbHVlKSB7XHJcbiAgICAgIGlmICghJHNjb3BlLmRpc2FibGVkKSB7XHJcbiAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICBwb3NpdGlvblBvcHVwKCk7XHJcblxyXG4gICAgICAgICAgaWYgKG9uT3BlbkZvY3VzKSB7XHJcbiAgICAgICAgICAgICRzY29wZS4kYnJvYWRjYXN0KCd1aWI6ZGF0ZXBpY2tlci5mb2N1cycpO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICRkb2N1bWVudC5vbignY2xpY2snLCBkb2N1bWVudENsaWNrQmluZCk7XHJcblxyXG4gICAgICAgICAgdmFyIHBsYWNlbWVudCA9ICRhdHRycy5wb3B1cFBsYWNlbWVudCA/ICRhdHRycy5wb3B1cFBsYWNlbWVudCA6IGRhdGVwaWNrZXJQb3B1cENvbmZpZy5wbGFjZW1lbnQ7XHJcbiAgICAgICAgICBpZiAoYXBwZW5kVG9Cb2R5IHx8ICRwb3NpdGlvbi5wYXJzZVBsYWNlbWVudChwbGFjZW1lbnQpWzJdKSB7XHJcbiAgICAgICAgICAgIHNjcm9sbFBhcmVudEVsID0gc2Nyb2xsUGFyZW50RWwgfHwgYW5ndWxhci5lbGVtZW50KCRwb3NpdGlvbi5zY3JvbGxQYXJlbnQoJGVsZW1lbnQpKTtcclxuICAgICAgICAgICAgaWYgKHNjcm9sbFBhcmVudEVsKSB7XHJcbiAgICAgICAgICAgICAgc2Nyb2xsUGFyZW50RWwub24oJ3Njcm9sbCcsIHBvc2l0aW9uUG9wdXApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBzY3JvbGxQYXJlbnRFbCA9IG51bGw7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgYW5ndWxhci5lbGVtZW50KCR3aW5kb3cpLm9uKCdyZXNpemUnLCBwb3NpdGlvblBvcHVwKTtcclxuICAgICAgICB9LCAwLCBmYWxzZSk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgJHNjb3BlLmlzT3BlbiA9IGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAkZG9jdW1lbnQub2ZmKCdjbGljaycsIGRvY3VtZW50Q2xpY2tCaW5kKTtcclxuICAgICAgaWYgKHNjcm9sbFBhcmVudEVsKSB7XHJcbiAgICAgICAgc2Nyb2xsUGFyZW50RWwub2ZmKCdzY3JvbGwnLCBwb3NpdGlvblBvcHVwKTtcclxuICAgICAgfVxyXG4gICAgICBhbmd1bGFyLmVsZW1lbnQoJHdpbmRvdykub2ZmKCdyZXNpemUnLCBwb3NpdGlvblBvcHVwKTtcclxuICAgIH1cclxuICB9KTtcclxuXHJcbiAgZnVuY3Rpb24gY2FtZWx0b0Rhc2goc3RyaW5nKSB7XHJcbiAgICByZXR1cm4gc3RyaW5nLnJlcGxhY2UoLyhbQS1aXSkvZywgZnVuY3Rpb24oJDEpIHsgcmV0dXJuICctJyArICQxLnRvTG93ZXJDYXNlKCk7IH0pO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gcGFyc2VEYXRlU3RyaW5nKHZpZXdWYWx1ZSkge1xyXG4gICAgdmFyIGRhdGUgPSBkYXRlUGFyc2VyLnBhcnNlKHZpZXdWYWx1ZSwgZGF0ZUZvcm1hdCwgJHNjb3BlLmRhdGUpO1xyXG4gICAgaWYgKGlzTmFOKGRhdGUpKSB7XHJcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYWx0SW5wdXRGb3JtYXRzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgZGF0ZSA9IGRhdGVQYXJzZXIucGFyc2Uodmlld1ZhbHVlLCBhbHRJbnB1dEZvcm1hdHNbaV0sICRzY29wZS5kYXRlKTtcclxuICAgICAgICBpZiAoIWlzTmFOKGRhdGUpKSB7XHJcbiAgICAgICAgICByZXR1cm4gZGF0ZTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBkYXRlO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gcGFyc2VEYXRlKHZpZXdWYWx1ZSkge1xyXG4gICAgaWYgKGFuZ3VsYXIuaXNOdW1iZXIodmlld1ZhbHVlKSkge1xyXG4gICAgICAvLyBwcmVzdW1hYmx5IHRpbWVzdGFtcCB0byBkYXRlIG9iamVjdFxyXG4gICAgICB2aWV3VmFsdWUgPSBuZXcgRGF0ZSh2aWV3VmFsdWUpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICghdmlld1ZhbHVlKSB7XHJcbiAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChhbmd1bGFyLmlzRGF0ZSh2aWV3VmFsdWUpICYmICFpc05hTih2aWV3VmFsdWUpKSB7XHJcbiAgICAgIHJldHVybiB2aWV3VmFsdWU7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGFuZ3VsYXIuaXNTdHJpbmcodmlld1ZhbHVlKSkge1xyXG4gICAgICB2YXIgZGF0ZSA9IHBhcnNlRGF0ZVN0cmluZyh2aWV3VmFsdWUpO1xyXG4gICAgICBpZiAoIWlzTmFOKGRhdGUpKSB7XHJcbiAgICAgICAgcmV0dXJuIGRhdGVQYXJzZXIuZnJvbVRpbWV6b25lKGRhdGUsIG5nTW9kZWxPcHRpb25zLnRpbWV6b25lKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBuZ01vZGVsLiRvcHRpb25zICYmIG5nTW9kZWwuJG9wdGlvbnMuYWxsb3dJbnZhbGlkID8gdmlld1ZhbHVlIDogdW5kZWZpbmVkO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gdmFsaWRhdG9yKG1vZGVsVmFsdWUsIHZpZXdWYWx1ZSkge1xyXG4gICAgdmFyIHZhbHVlID0gbW9kZWxWYWx1ZSB8fCB2aWV3VmFsdWU7XHJcblxyXG4gICAgaWYgKCEkYXR0cnMubmdSZXF1aXJlZCAmJiAhdmFsdWUpIHtcclxuICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGFuZ3VsYXIuaXNOdW1iZXIodmFsdWUpKSB7XHJcbiAgICAgIHZhbHVlID0gbmV3IERhdGUodmFsdWUpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICghdmFsdWUpIHtcclxuICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGFuZ3VsYXIuaXNEYXRlKHZhbHVlKSAmJiAhaXNOYU4odmFsdWUpKSB7XHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChhbmd1bGFyLmlzU3RyaW5nKHZhbHVlKSkge1xyXG4gICAgICByZXR1cm4gIWlzTmFOKHBhcnNlRGF0ZVN0cmluZyh2YWx1ZSkpO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGRvY3VtZW50Q2xpY2tCaW5kKGV2ZW50KSB7XHJcbiAgICBpZiAoISRzY29wZS5pc09wZW4gJiYgJHNjb3BlLmRpc2FibGVkKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgcG9wdXAgPSAkcG9wdXBbMF07XHJcbiAgICB2YXIgZHBDb250YWluc1RhcmdldCA9ICRlbGVtZW50WzBdLmNvbnRhaW5zKGV2ZW50LnRhcmdldCk7XHJcbiAgICAvLyBUaGUgcG9wdXAgbm9kZSBtYXkgbm90IGJlIGFuIGVsZW1lbnQgbm9kZVxyXG4gICAgLy8gSW4gc29tZSBicm93c2VycyAoSUUpIG9ubHkgZWxlbWVudCBub2RlcyBoYXZlIHRoZSAnY29udGFpbnMnIGZ1bmN0aW9uXHJcbiAgICB2YXIgcG9wdXBDb250YWluc1RhcmdldCA9IHBvcHVwLmNvbnRhaW5zICE9PSB1bmRlZmluZWQgJiYgcG9wdXAuY29udGFpbnMoZXZlbnQudGFyZ2V0KTtcclxuICAgIGlmICgkc2NvcGUuaXNPcGVuICYmICEoZHBDb250YWluc1RhcmdldCB8fCBwb3B1cENvbnRhaW5zVGFyZ2V0KSkge1xyXG4gICAgICAkc2NvcGUuJGFwcGx5KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICRzY29wZS5pc09wZW4gPSBmYWxzZTtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBpbnB1dEtleWRvd25CaW5kKGV2dCkge1xyXG4gICAgaWYgKGV2dC53aGljaCA9PT0gMjcgJiYgJHNjb3BlLmlzT3Blbikge1xyXG4gICAgICBldnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgZXZ0LnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAkc2NvcGUuJGFwcGx5KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICRzY29wZS5pc09wZW4gPSBmYWxzZTtcclxuICAgICAgfSk7XHJcbiAgICAgICRlbGVtZW50WzBdLmZvY3VzKCk7XHJcbiAgICB9IGVsc2UgaWYgKGV2dC53aGljaCA9PT0gNDAgJiYgISRzY29wZS5pc09wZW4pIHtcclxuICAgICAgZXZ0LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgIGV2dC5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgJHNjb3BlLiRhcHBseShmdW5jdGlvbigpIHtcclxuICAgICAgICAkc2NvcGUuaXNPcGVuID0gdHJ1ZTtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBwb3NpdGlvblBvcHVwKCkge1xyXG4gICAgaWYgKCRzY29wZS5pc09wZW4pIHtcclxuICAgICAgdmFyIGRwRWxlbWVudCA9IGFuZ3VsYXIuZWxlbWVudCgkcG9wdXBbMF0ucXVlcnlTZWxlY3RvcignLnVpYi1kYXRlcGlja2VyLXBvcHVwJykpO1xyXG4gICAgICB2YXIgcGxhY2VtZW50ID0gJGF0dHJzLnBvcHVwUGxhY2VtZW50ID8gJGF0dHJzLnBvcHVwUGxhY2VtZW50IDogZGF0ZXBpY2tlclBvcHVwQ29uZmlnLnBsYWNlbWVudDtcclxuICAgICAgdmFyIHBvc2l0aW9uID0gJHBvc2l0aW9uLnBvc2l0aW9uRWxlbWVudHMoJGVsZW1lbnQsIGRwRWxlbWVudCwgcGxhY2VtZW50LCBhcHBlbmRUb0JvZHkpO1xyXG4gICAgICBkcEVsZW1lbnQuY3NzKHt0b3A6IHBvc2l0aW9uLnRvcCArICdweCcsIGxlZnQ6IHBvc2l0aW9uLmxlZnQgKyAncHgnfSk7XHJcbiAgICAgIGlmIChkcEVsZW1lbnQuaGFzQ2xhc3MoJ3VpYi1wb3NpdGlvbi1tZWFzdXJlJykpIHtcclxuICAgICAgICBkcEVsZW1lbnQucmVtb3ZlQ2xhc3MoJ3VpYi1wb3NpdGlvbi1tZWFzdXJlJyk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gICRzY29wZS4kb24oJ3VpYjpkYXRlcGlja2VyLm1vZGUnLCBmdW5jdGlvbigpIHtcclxuICAgICR0aW1lb3V0KHBvc2l0aW9uUG9wdXAsIDAsIGZhbHNlKTtcclxuICB9KTtcclxufV0pXHJcblxyXG4uZGlyZWN0aXZlKCd1aWJEYXRlcGlja2VyUG9wdXAnLCBmdW5jdGlvbigpIHtcclxuICByZXR1cm4ge1xyXG4gICAgcmVxdWlyZTogWyduZ01vZGVsJywgJ3VpYkRhdGVwaWNrZXJQb3B1cCddLFxyXG4gICAgY29udHJvbGxlcjogJ1VpYkRhdGVwaWNrZXJQb3B1cENvbnRyb2xsZXInLFxyXG4gICAgc2NvcGU6IHtcclxuICAgICAgZGF0ZXBpY2tlck9wdGlvbnM6ICc9PycsXHJcbiAgICAgIGlzT3BlbjogJz0/JyxcclxuICAgICAgY3VycmVudFRleHQ6ICdAJyxcclxuICAgICAgY2xlYXJUZXh0OiAnQCcsXHJcbiAgICAgIGNsb3NlVGV4dDogJ0AnXHJcbiAgICB9LFxyXG4gICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCBjdHJscykge1xyXG4gICAgICB2YXIgbmdNb2RlbCA9IGN0cmxzWzBdLFxyXG4gICAgICAgIGN0cmwgPSBjdHJsc1sxXTtcclxuXHJcbiAgICAgIGN0cmwuaW5pdChuZ01vZGVsKTtcclxuICAgIH1cclxuICB9O1xyXG59KVxyXG5cclxuLmRpcmVjdGl2ZSgndWliRGF0ZXBpY2tlclBvcHVwV3JhcCcsIGZ1bmN0aW9uKCkge1xyXG4gIHJldHVybiB7XHJcbiAgICByZXN0cmljdDogJ0EnLFxyXG4gICAgdHJhbnNjbHVkZTogdHJ1ZSxcclxuICAgIHRlbXBsYXRlVXJsOiBmdW5jdGlvbihlbGVtZW50LCBhdHRycykge1xyXG4gICAgICByZXR1cm4gYXR0cnMudGVtcGxhdGVVcmwgfHwgJ3VpYi90ZW1wbGF0ZS9kYXRlcGlja2VyUG9wdXAvcG9wdXAuaHRtbCc7XHJcbiAgICB9XHJcbiAgfTtcclxufSk7XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgndWkuYm9vdHN0cmFwLmRlYm91bmNlJywgW10pXHJcbi8qKlxyXG4gKiBBIGhlbHBlciwgaW50ZXJuYWwgc2VydmljZSB0aGF0IGRlYm91bmNlcyBhIGZ1bmN0aW9uXHJcbiAqL1xyXG4gIC5mYWN0b3J5KCckJGRlYm91bmNlJywgWyckdGltZW91dCcsIGZ1bmN0aW9uKCR0aW1lb3V0KSB7XHJcbiAgICByZXR1cm4gZnVuY3Rpb24oY2FsbGJhY2ssIGRlYm91bmNlVGltZSkge1xyXG4gICAgICB2YXIgdGltZW91dFByb21pc2U7XHJcblxyXG4gICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xyXG4gICAgICAgIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKTtcclxuICAgICAgICBpZiAodGltZW91dFByb21pc2UpIHtcclxuICAgICAgICAgICR0aW1lb3V0LmNhbmNlbCh0aW1lb3V0UHJvbWlzZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aW1lb3V0UHJvbWlzZSA9ICR0aW1lb3V0KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgY2FsbGJhY2suYXBwbHkoc2VsZiwgYXJncyk7XHJcbiAgICAgICAgfSwgZGVib3VuY2VUaW1lKTtcclxuICAgICAgfTtcclxuICAgIH07XHJcbiAgfV0pO1xyXG5cclxuYW5ndWxhci5tb2R1bGUoJ3VpLmJvb3RzdHJhcC5kcm9wZG93bicsIFsndWkuYm9vdHN0cmFwLnBvc2l0aW9uJ10pXHJcblxyXG4uY29uc3RhbnQoJ3VpYkRyb3Bkb3duQ29uZmlnJywge1xyXG4gIGFwcGVuZFRvT3BlbkNsYXNzOiAndWliLWRyb3Bkb3duLW9wZW4nLFxyXG4gIG9wZW5DbGFzczogJ29wZW4nXHJcbn0pXHJcblxyXG4uc2VydmljZSgndWliRHJvcGRvd25TZXJ2aWNlJywgWyckZG9jdW1lbnQnLCAnJHJvb3RTY29wZScsIGZ1bmN0aW9uKCRkb2N1bWVudCwgJHJvb3RTY29wZSkge1xyXG4gIHZhciBvcGVuU2NvcGUgPSBudWxsO1xyXG5cclxuICB0aGlzLm9wZW4gPSBmdW5jdGlvbihkcm9wZG93blNjb3BlLCBlbGVtZW50KSB7XHJcbiAgICBpZiAoIW9wZW5TY29wZSkge1xyXG4gICAgICAkZG9jdW1lbnQub24oJ2NsaWNrJywgY2xvc2VEcm9wZG93bik7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKG9wZW5TY29wZSAmJiBvcGVuU2NvcGUgIT09IGRyb3Bkb3duU2NvcGUpIHtcclxuICAgICAgb3BlblNjb3BlLmlzT3BlbiA9IGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIG9wZW5TY29wZSA9IGRyb3Bkb3duU2NvcGU7XHJcbiAgfTtcclxuXHJcbiAgdGhpcy5jbG9zZSA9IGZ1bmN0aW9uKGRyb3Bkb3duU2NvcGUsIGVsZW1lbnQpIHtcclxuICAgIGlmIChvcGVuU2NvcGUgPT09IGRyb3Bkb3duU2NvcGUpIHtcclxuICAgICAgJGRvY3VtZW50Lm9mZignY2xpY2snLCBjbG9zZURyb3Bkb3duKTtcclxuICAgICAgJGRvY3VtZW50Lm9mZigna2V5ZG93bicsIHRoaXMua2V5YmluZEZpbHRlcik7XHJcbiAgICAgIG9wZW5TY29wZSA9IG51bGw7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgdmFyIGNsb3NlRHJvcGRvd24gPSBmdW5jdGlvbihldnQpIHtcclxuICAgIC8vIFRoaXMgbWV0aG9kIG1heSBzdGlsbCBiZSBjYWxsZWQgZHVyaW5nIHRoZSBzYW1lIG1vdXNlIGV2ZW50IHRoYXRcclxuICAgIC8vIHVuYm91bmQgdGhpcyBldmVudCBoYW5kbGVyLiBTbyBjaGVjayBvcGVuU2NvcGUgYmVmb3JlIHByb2NlZWRpbmcuXHJcbiAgICBpZiAoIW9wZW5TY29wZSkgeyByZXR1cm47IH1cclxuXHJcbiAgICBpZiAoZXZ0ICYmIG9wZW5TY29wZS5nZXRBdXRvQ2xvc2UoKSA9PT0gJ2Rpc2FibGVkJykgeyByZXR1cm47IH1cclxuXHJcbiAgICBpZiAoZXZ0ICYmIGV2dC53aGljaCA9PT0gMykgeyByZXR1cm47IH1cclxuXHJcbiAgICB2YXIgdG9nZ2xlRWxlbWVudCA9IG9wZW5TY29wZS5nZXRUb2dnbGVFbGVtZW50KCk7XHJcbiAgICBpZiAoZXZ0ICYmIHRvZ2dsZUVsZW1lbnQgJiYgdG9nZ2xlRWxlbWVudFswXS5jb250YWlucyhldnQudGFyZ2V0KSkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGRyb3Bkb3duRWxlbWVudCA9IG9wZW5TY29wZS5nZXREcm9wZG93bkVsZW1lbnQoKTtcclxuICAgIGlmIChldnQgJiYgb3BlblNjb3BlLmdldEF1dG9DbG9zZSgpID09PSAnb3V0c2lkZUNsaWNrJyAmJlxyXG4gICAgICBkcm9wZG93bkVsZW1lbnQgJiYgZHJvcGRvd25FbGVtZW50WzBdLmNvbnRhaW5zKGV2dC50YXJnZXQpKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBvcGVuU2NvcGUuZm9jdXNUb2dnbGVFbGVtZW50KCk7XHJcbiAgICBvcGVuU2NvcGUuaXNPcGVuID0gZmFsc2U7XHJcblxyXG4gICAgaWYgKCEkcm9vdFNjb3BlLiQkcGhhc2UpIHtcclxuICAgICAgb3BlblNjb3BlLiRhcHBseSgpO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIHRoaXMua2V5YmluZEZpbHRlciA9IGZ1bmN0aW9uKGV2dCkge1xyXG4gICAgaWYgKCFvcGVuU2NvcGUpIHtcclxuICAgICAgLy8gc2VlIHRoaXMuY2xvc2UgYXMgRVNDIGNvdWxkIGhhdmUgYmVlbiBwcmVzc2VkIHdoaWNoIGtpbGxzIHRoZSBzY29wZSBzbyB3ZSBjYW4gbm90IHByb2NlZWRcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBkcm9wZG93bkVsZW1lbnQgPSBvcGVuU2NvcGUuZ2V0RHJvcGRvd25FbGVtZW50KCk7XHJcbiAgICB2YXIgdG9nZ2xlRWxlbWVudCA9IG9wZW5TY29wZS5nZXRUb2dnbGVFbGVtZW50KCk7XHJcbiAgICB2YXIgZHJvcGRvd25FbGVtZW50VGFyZ2V0ZWQgPSBkcm9wZG93bkVsZW1lbnQgJiYgZHJvcGRvd25FbGVtZW50WzBdLmNvbnRhaW5zKGV2dC50YXJnZXQpO1xyXG4gICAgdmFyIHRvZ2dsZUVsZW1lbnRUYXJnZXRlZCA9IHRvZ2dsZUVsZW1lbnQgJiYgdG9nZ2xlRWxlbWVudFswXS5jb250YWlucyhldnQudGFyZ2V0KTtcclxuICAgIGlmIChldnQud2hpY2ggPT09IDI3KSB7XHJcbiAgICAgIGV2dC5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgb3BlblNjb3BlLmZvY3VzVG9nZ2xlRWxlbWVudCgpO1xyXG4gICAgICBjbG9zZURyb3Bkb3duKCk7XHJcbiAgICB9IGVsc2UgaWYgKG9wZW5TY29wZS5pc0tleW5hdkVuYWJsZWQoKSAmJiBbMzgsIDQwXS5pbmRleE9mKGV2dC53aGljaCkgIT09IC0xICYmIG9wZW5TY29wZS5pc09wZW4gJiYgKGRyb3Bkb3duRWxlbWVudFRhcmdldGVkIHx8IHRvZ2dsZUVsZW1lbnRUYXJnZXRlZCkpIHtcclxuICAgICAgZXZ0LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgIGV2dC5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgb3BlblNjb3BlLmZvY3VzRHJvcGRvd25FbnRyeShldnQud2hpY2gpO1xyXG4gICAgfVxyXG4gIH07XHJcbn1dKVxyXG5cclxuLmNvbnRyb2xsZXIoJ1VpYkRyb3Bkb3duQ29udHJvbGxlcicsIFsnJHNjb3BlJywgJyRlbGVtZW50JywgJyRhdHRycycsICckcGFyc2UnLCAndWliRHJvcGRvd25Db25maWcnLCAndWliRHJvcGRvd25TZXJ2aWNlJywgJyRhbmltYXRlJywgJyR1aWJQb3NpdGlvbicsICckZG9jdW1lbnQnLCAnJGNvbXBpbGUnLCAnJHRlbXBsYXRlUmVxdWVzdCcsIGZ1bmN0aW9uKCRzY29wZSwgJGVsZW1lbnQsICRhdHRycywgJHBhcnNlLCBkcm9wZG93bkNvbmZpZywgdWliRHJvcGRvd25TZXJ2aWNlLCAkYW5pbWF0ZSwgJHBvc2l0aW9uLCAkZG9jdW1lbnQsICRjb21waWxlLCAkdGVtcGxhdGVSZXF1ZXN0KSB7XHJcbiAgdmFyIHNlbGYgPSB0aGlzLFxyXG4gICAgc2NvcGUgPSAkc2NvcGUuJG5ldygpLCAvLyBjcmVhdGUgYSBjaGlsZCBzY29wZSBzbyB3ZSBhcmUgbm90IHBvbGx1dGluZyBvcmlnaW5hbCBvbmVcclxuICAgIHRlbXBsYXRlU2NvcGUsXHJcbiAgICBhcHBlbmRUb09wZW5DbGFzcyA9IGRyb3Bkb3duQ29uZmlnLmFwcGVuZFRvT3BlbkNsYXNzLFxyXG4gICAgb3BlbkNsYXNzID0gZHJvcGRvd25Db25maWcub3BlbkNsYXNzLFxyXG4gICAgZ2V0SXNPcGVuLFxyXG4gICAgc2V0SXNPcGVuID0gYW5ndWxhci5ub29wLFxyXG4gICAgdG9nZ2xlSW52b2tlciA9ICRhdHRycy5vblRvZ2dsZSA/ICRwYXJzZSgkYXR0cnMub25Ub2dnbGUpIDogYW5ndWxhci5ub29wLFxyXG4gICAgYXBwZW5kVG9Cb2R5ID0gZmFsc2UsXHJcbiAgICBhcHBlbmRUbyA9IG51bGwsXHJcbiAgICBrZXluYXZFbmFibGVkID0gZmFsc2UsXHJcbiAgICBzZWxlY3RlZE9wdGlvbiA9IG51bGwsXHJcbiAgICBib2R5ID0gJGRvY3VtZW50LmZpbmQoJ2JvZHknKTtcclxuXHJcbiAgJGVsZW1lbnQuYWRkQ2xhc3MoJ2Ryb3Bkb3duJyk7XHJcblxyXG4gIHRoaXMuaW5pdCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgaWYgKCRhdHRycy5pc09wZW4pIHtcclxuICAgICAgZ2V0SXNPcGVuID0gJHBhcnNlKCRhdHRycy5pc09wZW4pO1xyXG4gICAgICBzZXRJc09wZW4gPSBnZXRJc09wZW4uYXNzaWduO1xyXG5cclxuICAgICAgJHNjb3BlLiR3YXRjaChnZXRJc09wZW4sIGZ1bmN0aW9uKHZhbHVlKSB7XHJcbiAgICAgICAgc2NvcGUuaXNPcGVuID0gISF2YWx1ZTtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGFuZ3VsYXIuaXNEZWZpbmVkKCRhdHRycy5kcm9wZG93bkFwcGVuZFRvKSkge1xyXG4gICAgICB2YXIgYXBwZW5kVG9FbCA9ICRwYXJzZSgkYXR0cnMuZHJvcGRvd25BcHBlbmRUbykoc2NvcGUpO1xyXG4gICAgICBpZiAoYXBwZW5kVG9FbCkge1xyXG4gICAgICAgIGFwcGVuZFRvID0gYW5ndWxhci5lbGVtZW50KGFwcGVuZFRvRWwpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgYXBwZW5kVG9Cb2R5ID0gYW5ndWxhci5pc0RlZmluZWQoJGF0dHJzLmRyb3Bkb3duQXBwZW5kVG9Cb2R5KTtcclxuICAgIGtleW5hdkVuYWJsZWQgPSBhbmd1bGFyLmlzRGVmaW5lZCgkYXR0cnMua2V5Ym9hcmROYXYpO1xyXG5cclxuICAgIGlmIChhcHBlbmRUb0JvZHkgJiYgIWFwcGVuZFRvKSB7XHJcbiAgICAgIGFwcGVuZFRvID0gYm9keTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoYXBwZW5kVG8gJiYgc2VsZi5kcm9wZG93bk1lbnUpIHtcclxuICAgICAgYXBwZW5kVG8uYXBwZW5kKHNlbGYuZHJvcGRvd25NZW51KTtcclxuICAgICAgJGVsZW1lbnQub24oJyRkZXN0cm95JywgZnVuY3Rpb24gaGFuZGxlRGVzdHJveUV2ZW50KCkge1xyXG4gICAgICAgIHNlbGYuZHJvcGRvd25NZW51LnJlbW92ZSgpO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICB0aGlzLnRvZ2dsZSA9IGZ1bmN0aW9uKG9wZW4pIHtcclxuICAgIHNjb3BlLmlzT3BlbiA9IGFyZ3VtZW50cy5sZW5ndGggPyAhIW9wZW4gOiAhc2NvcGUuaXNPcGVuO1xyXG4gICAgaWYgKGFuZ3VsYXIuaXNGdW5jdGlvbihzZXRJc09wZW4pKSB7XHJcbiAgICAgIHNldElzT3BlbihzY29wZSwgc2NvcGUuaXNPcGVuKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gc2NvcGUuaXNPcGVuO1xyXG4gIH07XHJcblxyXG4gIC8vIEFsbG93IG90aGVyIGRpcmVjdGl2ZXMgdG8gd2F0Y2ggc3RhdHVzXHJcbiAgdGhpcy5pc09wZW4gPSBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiBzY29wZS5pc09wZW47XHJcbiAgfTtcclxuXHJcbiAgc2NvcGUuZ2V0VG9nZ2xlRWxlbWVudCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIHNlbGYudG9nZ2xlRWxlbWVudDtcclxuICB9O1xyXG5cclxuICBzY29wZS5nZXRBdXRvQ2xvc2UgPSBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiAkYXR0cnMuYXV0b0Nsb3NlIHx8ICdhbHdheXMnOyAvL29yICdvdXRzaWRlQ2xpY2snIG9yICdkaXNhYmxlZCdcclxuICB9O1xyXG5cclxuICBzY29wZS5nZXRFbGVtZW50ID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gJGVsZW1lbnQ7XHJcbiAgfTtcclxuXHJcbiAgc2NvcGUuaXNLZXluYXZFbmFibGVkID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4ga2V5bmF2RW5hYmxlZDtcclxuICB9O1xyXG5cclxuICBzY29wZS5mb2N1c0Ryb3Bkb3duRW50cnkgPSBmdW5jdGlvbihrZXlDb2RlKSB7XHJcbiAgICB2YXIgZWxlbXMgPSBzZWxmLmRyb3Bkb3duTWVudSA/IC8vSWYgYXBwZW5kIHRvIGJvZHkgaXMgdXNlZC5cclxuICAgICAgYW5ndWxhci5lbGVtZW50KHNlbGYuZHJvcGRvd25NZW51KS5maW5kKCdhJykgOlxyXG4gICAgICAkZWxlbWVudC5maW5kKCd1bCcpLmVxKDApLmZpbmQoJ2EnKTtcclxuXHJcbiAgICBzd2l0Y2ggKGtleUNvZGUpIHtcclxuICAgICAgY2FzZSA0MDoge1xyXG4gICAgICAgIGlmICghYW5ndWxhci5pc051bWJlcihzZWxmLnNlbGVjdGVkT3B0aW9uKSkge1xyXG4gICAgICAgICAgc2VsZi5zZWxlY3RlZE9wdGlvbiA9IDA7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHNlbGYuc2VsZWN0ZWRPcHRpb24gPSBzZWxmLnNlbGVjdGVkT3B0aW9uID09PSBlbGVtcy5sZW5ndGggLSAxID9cclxuICAgICAgICAgICAgc2VsZi5zZWxlY3RlZE9wdGlvbiA6XHJcbiAgICAgICAgICAgIHNlbGYuc2VsZWN0ZWRPcHRpb24gKyAxO1xyXG4gICAgICAgIH1cclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgICBjYXNlIDM4OiB7XHJcbiAgICAgICAgaWYgKCFhbmd1bGFyLmlzTnVtYmVyKHNlbGYuc2VsZWN0ZWRPcHRpb24pKSB7XHJcbiAgICAgICAgICBzZWxmLnNlbGVjdGVkT3B0aW9uID0gZWxlbXMubGVuZ3RoIC0gMTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgc2VsZi5zZWxlY3RlZE9wdGlvbiA9IHNlbGYuc2VsZWN0ZWRPcHRpb24gPT09IDAgP1xyXG4gICAgICAgICAgICAwIDogc2VsZi5zZWxlY3RlZE9wdGlvbiAtIDE7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBlbGVtc1tzZWxmLnNlbGVjdGVkT3B0aW9uXS5mb2N1cygpO1xyXG4gIH07XHJcblxyXG4gIHNjb3BlLmdldERyb3Bkb3duRWxlbWVudCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIHNlbGYuZHJvcGRvd25NZW51O1xyXG4gIH07XHJcblxyXG4gIHNjb3BlLmZvY3VzVG9nZ2xlRWxlbWVudCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgaWYgKHNlbGYudG9nZ2xlRWxlbWVudCkge1xyXG4gICAgICBzZWxmLnRvZ2dsZUVsZW1lbnRbMF0uZm9jdXMoKTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICBzY29wZS4kd2F0Y2goJ2lzT3BlbicsIGZ1bmN0aW9uKGlzT3Blbiwgd2FzT3Blbikge1xyXG4gICAgaWYgKGFwcGVuZFRvICYmIHNlbGYuZHJvcGRvd25NZW51KSB7XHJcbiAgICAgIHZhciBwb3MgPSAkcG9zaXRpb24ucG9zaXRpb25FbGVtZW50cygkZWxlbWVudCwgc2VsZi5kcm9wZG93bk1lbnUsICdib3R0b20tbGVmdCcsIHRydWUpLFxyXG4gICAgICAgIGNzcyxcclxuICAgICAgICByaWdodGFsaWduLFxyXG4gICAgICAgIHNjcm9sbGJhclBhZGRpbmcsXHJcbiAgICAgICAgc2Nyb2xsYmFyV2lkdGggPSAwO1xyXG5cclxuICAgICAgY3NzID0ge1xyXG4gICAgICAgIHRvcDogcG9zLnRvcCArICdweCcsXHJcbiAgICAgICAgZGlzcGxheTogaXNPcGVuID8gJ2Jsb2NrJyA6ICdub25lJ1xyXG4gICAgICB9O1xyXG5cclxuICAgICAgcmlnaHRhbGlnbiA9IHNlbGYuZHJvcGRvd25NZW51Lmhhc0NsYXNzKCdkcm9wZG93bi1tZW51LXJpZ2h0Jyk7XHJcbiAgICAgIGlmICghcmlnaHRhbGlnbikge1xyXG4gICAgICAgIGNzcy5sZWZ0ID0gcG9zLmxlZnQgKyAncHgnO1xyXG4gICAgICAgIGNzcy5yaWdodCA9ICdhdXRvJztcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBjc3MubGVmdCA9ICdhdXRvJztcclxuICAgICAgICBzY3JvbGxiYXJQYWRkaW5nID0gJHBvc2l0aW9uLnNjcm9sbGJhclBhZGRpbmcoYXBwZW5kVG8pO1xyXG5cclxuICAgICAgICBpZiAoc2Nyb2xsYmFyUGFkZGluZy5oZWlnaHRPdmVyZmxvdyAmJiBzY3JvbGxiYXJQYWRkaW5nLnNjcm9sbGJhcldpZHRoKSB7XHJcbiAgICAgICAgICBzY3JvbGxiYXJXaWR0aCA9IHNjcm9sbGJhclBhZGRpbmcuc2Nyb2xsYmFyV2lkdGg7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjc3MucmlnaHQgPSB3aW5kb3cuaW5uZXJXaWR0aCAtIHNjcm9sbGJhcldpZHRoIC1cclxuICAgICAgICAgIChwb3MubGVmdCArICRlbGVtZW50LnByb3AoJ29mZnNldFdpZHRoJykpICsgJ3B4JztcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gTmVlZCB0byBhZGp1c3Qgb3VyIHBvc2l0aW9uaW5nIHRvIGJlIHJlbGF0aXZlIHRvIHRoZSBhcHBlbmRUbyBjb250YWluZXJcclxuICAgICAgLy8gaWYgaXQncyBub3QgdGhlIGJvZHkgZWxlbWVudFxyXG4gICAgICBpZiAoIWFwcGVuZFRvQm9keSkge1xyXG4gICAgICAgIHZhciBhcHBlbmRPZmZzZXQgPSAkcG9zaXRpb24ub2Zmc2V0KGFwcGVuZFRvKTtcclxuXHJcbiAgICAgICAgY3NzLnRvcCA9IHBvcy50b3AgLSBhcHBlbmRPZmZzZXQudG9wICsgJ3B4JztcclxuXHJcbiAgICAgICAgaWYgKCFyaWdodGFsaWduKSB7XHJcbiAgICAgICAgICBjc3MubGVmdCA9IHBvcy5sZWZ0IC0gYXBwZW5kT2Zmc2V0LmxlZnQgKyAncHgnO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBjc3MucmlnaHQgPSB3aW5kb3cuaW5uZXJXaWR0aCAtXHJcbiAgICAgICAgICAgIChwb3MubGVmdCAtIGFwcGVuZE9mZnNldC5sZWZ0ICsgJGVsZW1lbnQucHJvcCgnb2Zmc2V0V2lkdGgnKSkgKyAncHgnO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgc2VsZi5kcm9wZG93bk1lbnUuY3NzKGNzcyk7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIG9wZW5Db250YWluZXIgPSBhcHBlbmRUbyA/IGFwcGVuZFRvIDogJGVsZW1lbnQ7XHJcbiAgICB2YXIgaGFzT3BlbkNsYXNzID0gb3BlbkNvbnRhaW5lci5oYXNDbGFzcyhhcHBlbmRUbyA/IGFwcGVuZFRvT3BlbkNsYXNzIDogb3BlbkNsYXNzKTtcclxuXHJcbiAgICBpZiAoaGFzT3BlbkNsYXNzID09PSAhaXNPcGVuKSB7XHJcbiAgICAgICRhbmltYXRlW2lzT3BlbiA/ICdhZGRDbGFzcycgOiAncmVtb3ZlQ2xhc3MnXShvcGVuQ29udGFpbmVyLCBhcHBlbmRUbyA/IGFwcGVuZFRvT3BlbkNsYXNzIDogb3BlbkNsYXNzKS50aGVuKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGlmIChhbmd1bGFyLmlzRGVmaW5lZChpc09wZW4pICYmIGlzT3BlbiAhPT0gd2FzT3Blbikge1xyXG4gICAgICAgICAgdG9nZ2xlSW52b2tlcigkc2NvcGUsIHsgb3BlbjogISFpc09wZW4gfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoaXNPcGVuKSB7XHJcbiAgICAgIGlmIChzZWxmLmRyb3Bkb3duTWVudVRlbXBsYXRlVXJsKSB7XHJcbiAgICAgICAgJHRlbXBsYXRlUmVxdWVzdChzZWxmLmRyb3Bkb3duTWVudVRlbXBsYXRlVXJsKS50aGVuKGZ1bmN0aW9uKHRwbENvbnRlbnQpIHtcclxuICAgICAgICAgIHRlbXBsYXRlU2NvcGUgPSBzY29wZS4kbmV3KCk7XHJcbiAgICAgICAgICAkY29tcGlsZSh0cGxDb250ZW50LnRyaW0oKSkodGVtcGxhdGVTY29wZSwgZnVuY3Rpb24oZHJvcGRvd25FbGVtZW50KSB7XHJcbiAgICAgICAgICAgIHZhciBuZXdFbCA9IGRyb3Bkb3duRWxlbWVudDtcclxuICAgICAgICAgICAgc2VsZi5kcm9wZG93bk1lbnUucmVwbGFjZVdpdGgobmV3RWwpO1xyXG4gICAgICAgICAgICBzZWxmLmRyb3Bkb3duTWVudSA9IG5ld0VsO1xyXG4gICAgICAgICAgICAkZG9jdW1lbnQub24oJ2tleWRvd24nLCB1aWJEcm9wZG93blNlcnZpY2Uua2V5YmluZEZpbHRlcik7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICAkZG9jdW1lbnQub24oJ2tleWRvd24nLCB1aWJEcm9wZG93blNlcnZpY2Uua2V5YmluZEZpbHRlcik7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHNjb3BlLmZvY3VzVG9nZ2xlRWxlbWVudCgpO1xyXG4gICAgICB1aWJEcm9wZG93blNlcnZpY2Uub3BlbihzY29wZSwgJGVsZW1lbnQpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdWliRHJvcGRvd25TZXJ2aWNlLmNsb3NlKHNjb3BlLCAkZWxlbWVudCk7XHJcbiAgICAgIGlmIChzZWxmLmRyb3Bkb3duTWVudVRlbXBsYXRlVXJsKSB7XHJcbiAgICAgICAgaWYgKHRlbXBsYXRlU2NvcGUpIHtcclxuICAgICAgICAgIHRlbXBsYXRlU2NvcGUuJGRlc3Ryb3koKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIG5ld0VsID0gYW5ndWxhci5lbGVtZW50KCc8dWwgY2xhc3M9XCJkcm9wZG93bi1tZW51XCI+PC91bD4nKTtcclxuICAgICAgICBzZWxmLmRyb3Bkb3duTWVudS5yZXBsYWNlV2l0aChuZXdFbCk7XHJcbiAgICAgICAgc2VsZi5kcm9wZG93bk1lbnUgPSBuZXdFbDtcclxuICAgICAgfVxyXG5cclxuICAgICAgc2VsZi5zZWxlY3RlZE9wdGlvbiA9IG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGFuZ3VsYXIuaXNGdW5jdGlvbihzZXRJc09wZW4pKSB7XHJcbiAgICAgIHNldElzT3Blbigkc2NvcGUsIGlzT3Blbik7XHJcbiAgICB9XHJcbiAgfSk7XHJcbn1dKVxyXG5cclxuLmRpcmVjdGl2ZSgndWliRHJvcGRvd24nLCBmdW5jdGlvbigpIHtcclxuICByZXR1cm4ge1xyXG4gICAgY29udHJvbGxlcjogJ1VpYkRyb3Bkb3duQ29udHJvbGxlcicsXHJcbiAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxlbWVudCwgYXR0cnMsIGRyb3Bkb3duQ3RybCkge1xyXG4gICAgICBkcm9wZG93bkN0cmwuaW5pdCgpO1xyXG4gICAgfVxyXG4gIH07XHJcbn0pXHJcblxyXG4uZGlyZWN0aXZlKCd1aWJEcm9wZG93bk1lbnUnLCBmdW5jdGlvbigpIHtcclxuICByZXR1cm4ge1xyXG4gICAgcmVzdHJpY3Q6ICdBJyxcclxuICAgIHJlcXVpcmU6ICc/XnVpYkRyb3Bkb3duJyxcclxuICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBlbGVtZW50LCBhdHRycywgZHJvcGRvd25DdHJsKSB7XHJcbiAgICAgIGlmICghZHJvcGRvd25DdHJsIHx8IGFuZ3VsYXIuaXNEZWZpbmVkKGF0dHJzLmRyb3Bkb3duTmVzdGVkKSkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG5cclxuICAgICAgZWxlbWVudC5hZGRDbGFzcygnZHJvcGRvd24tbWVudScpO1xyXG5cclxuICAgICAgdmFyIHRwbFVybCA9IGF0dHJzLnRlbXBsYXRlVXJsO1xyXG4gICAgICBpZiAodHBsVXJsKSB7XHJcbiAgICAgICAgZHJvcGRvd25DdHJsLmRyb3Bkb3duTWVudVRlbXBsYXRlVXJsID0gdHBsVXJsO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoIWRyb3Bkb3duQ3RybC5kcm9wZG93bk1lbnUpIHtcclxuICAgICAgICBkcm9wZG93bkN0cmwuZHJvcGRvd25NZW51ID0gZWxlbWVudDtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH07XHJcbn0pXHJcblxyXG4uZGlyZWN0aXZlKCd1aWJEcm9wZG93blRvZ2dsZScsIGZ1bmN0aW9uKCkge1xyXG4gIHJldHVybiB7XHJcbiAgICByZXF1aXJlOiAnP151aWJEcm9wZG93bicsXHJcbiAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxlbWVudCwgYXR0cnMsIGRyb3Bkb3duQ3RybCkge1xyXG4gICAgICBpZiAoIWRyb3Bkb3duQ3RybCkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG5cclxuICAgICAgZWxlbWVudC5hZGRDbGFzcygnZHJvcGRvd24tdG9nZ2xlJyk7XHJcblxyXG4gICAgICBkcm9wZG93bkN0cmwudG9nZ2xlRWxlbWVudCA9IGVsZW1lbnQ7XHJcblxyXG4gICAgICB2YXIgdG9nZ2xlRHJvcGRvd24gPSBmdW5jdGlvbihldmVudCkge1xyXG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcblxyXG4gICAgICAgIGlmICghZWxlbWVudC5oYXNDbGFzcygnZGlzYWJsZWQnKSAmJiAhYXR0cnMuZGlzYWJsZWQpIHtcclxuICAgICAgICAgIHNjb3BlLiRhcHBseShmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgZHJvcGRvd25DdHJsLnRvZ2dsZSgpO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9O1xyXG5cclxuICAgICAgZWxlbWVudC5iaW5kKCdjbGljaycsIHRvZ2dsZURyb3Bkb3duKTtcclxuXHJcbiAgICAgIC8vIFdBSS1BUklBXHJcbiAgICAgIGVsZW1lbnQuYXR0cih7ICdhcmlhLWhhc3BvcHVwJzogdHJ1ZSwgJ2FyaWEtZXhwYW5kZWQnOiBmYWxzZSB9KTtcclxuICAgICAgc2NvcGUuJHdhdGNoKGRyb3Bkb3duQ3RybC5pc09wZW4sIGZ1bmN0aW9uKGlzT3Blbikge1xyXG4gICAgICAgIGVsZW1lbnQuYXR0cignYXJpYS1leHBhbmRlZCcsICEhaXNPcGVuKTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICBzY29wZS4kb24oJyRkZXN0cm95JywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgZWxlbWVudC51bmJpbmQoJ2NsaWNrJywgdG9nZ2xlRHJvcGRvd24pO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuICB9O1xyXG59KTtcclxuXHJcbmFuZ3VsYXIubW9kdWxlKCd1aS5ib290c3RyYXAuc3RhY2tlZE1hcCcsIFtdKVxyXG4vKipcclxuICogQSBoZWxwZXIsIGludGVybmFsIGRhdGEgc3RydWN0dXJlIHRoYXQgYWN0cyBhcyBhIG1hcCBidXQgYWxzbyBhbGxvd3MgZ2V0dGluZyAvIHJlbW92aW5nXHJcbiAqIGVsZW1lbnRzIGluIHRoZSBMSUZPIG9yZGVyXHJcbiAqL1xyXG4gIC5mYWN0b3J5KCckJHN0YWNrZWRNYXAnLCBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIGNyZWF0ZU5ldzogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIHN0YWNrID0gW107XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICBhZGQ6IGZ1bmN0aW9uKGtleSwgdmFsdWUpIHtcclxuICAgICAgICAgICAgc3RhY2sucHVzaCh7XHJcbiAgICAgICAgICAgICAga2V5OiBrZXksXHJcbiAgICAgICAgICAgICAgdmFsdWU6IHZhbHVlXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIGdldDogZnVuY3Rpb24oa2V5KSB7XHJcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc3RhY2subGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICBpZiAoa2V5ID09PSBzdGFja1tpXS5rZXkpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBzdGFja1tpXTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICBrZXlzOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdmFyIGtleXMgPSBbXTtcclxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdGFjay5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgIGtleXMucHVzaChzdGFja1tpXS5rZXkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBrZXlzO1xyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHRvcDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBzdGFja1tzdGFjay5sZW5ndGggLSAxXTtcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICByZW1vdmU6IGZ1bmN0aW9uKGtleSkge1xyXG4gICAgICAgICAgICB2YXIgaWR4ID0gLTE7XHJcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc3RhY2subGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICBpZiAoa2V5ID09PSBzdGFja1tpXS5rZXkpIHtcclxuICAgICAgICAgICAgICAgIGlkeCA9IGk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHN0YWNrLnNwbGljZShpZHgsIDEpWzBdO1xyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHJlbW92ZVRvcDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBzdGFjay5wb3AoKTtcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICBsZW5ndGg6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gc3RhY2subGVuZ3RoO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICAgIH1cclxuICAgIH07XHJcbiAgfSk7XHJcbmFuZ3VsYXIubW9kdWxlKCd1aS5ib290c3RyYXAubW9kYWwnLCBbJ3VpLmJvb3RzdHJhcC5zdGFja2VkTWFwJywgJ3VpLmJvb3RzdHJhcC5wb3NpdGlvbiddKVxyXG4vKipcclxuICogQSBoZWxwZXIsIGludGVybmFsIGRhdGEgc3RydWN0dXJlIHRoYXQgc3RvcmVzIGFsbCByZWZlcmVuY2VzIGF0dGFjaGVkIHRvIGtleVxyXG4gKi9cclxuICAuZmFjdG9yeSgnJCRtdWx0aU1hcCcsIGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgY3JlYXRlTmV3OiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgbWFwID0ge307XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICBlbnRyaWVzOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIE9iamVjdC5rZXlzKG1hcCkubWFwKGZ1bmN0aW9uKGtleSkge1xyXG4gICAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICBrZXk6IGtleSxcclxuICAgICAgICAgICAgICAgIHZhbHVlOiBtYXBba2V5XVxyXG4gICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIGdldDogZnVuY3Rpb24oa2V5KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBtYXBba2V5XTtcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICBoYXNLZXk6IGZ1bmN0aW9uKGtleSkge1xyXG4gICAgICAgICAgICByZXR1cm4gISFtYXBba2V5XTtcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICBrZXlzOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIE9iamVjdC5rZXlzKG1hcCk7XHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgcHV0OiBmdW5jdGlvbihrZXksIHZhbHVlKSB7XHJcbiAgICAgICAgICAgIGlmICghbWFwW2tleV0pIHtcclxuICAgICAgICAgICAgICBtYXBba2V5XSA9IFtdO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBtYXBba2V5XS5wdXNoKHZhbHVlKTtcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICByZW1vdmU6IGZ1bmN0aW9uKGtleSwgdmFsdWUpIHtcclxuICAgICAgICAgICAgdmFyIHZhbHVlcyA9IG1hcFtrZXldO1xyXG5cclxuICAgICAgICAgICAgaWYgKCF2YWx1ZXMpIHtcclxuICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHZhciBpZHggPSB2YWx1ZXMuaW5kZXhPZih2YWx1ZSk7XHJcblxyXG4gICAgICAgICAgICBpZiAoaWR4ICE9PSAtMSkge1xyXG4gICAgICAgICAgICAgIHZhbHVlcy5zcGxpY2UoaWR4LCAxKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKCF2YWx1ZXMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgZGVsZXRlIG1hcFtrZXldO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuICB9KVxyXG5cclxuLyoqXHJcbiAqIFBsdWdnYWJsZSByZXNvbHZlIG1lY2hhbmlzbSBmb3IgdGhlIG1vZGFsIHJlc29sdmUgcmVzb2x1dGlvblxyXG4gKiBTdXBwb3J0cyBVSSBSb3V0ZXIncyAkcmVzb2x2ZSBzZXJ2aWNlXHJcbiAqL1xyXG4gIC5wcm92aWRlcignJHVpYlJlc29sdmUnLCBmdW5jdGlvbigpIHtcclxuICAgIHZhciByZXNvbHZlID0gdGhpcztcclxuICAgIHRoaXMucmVzb2x2ZXIgPSBudWxsO1xyXG5cclxuICAgIHRoaXMuc2V0UmVzb2x2ZXIgPSBmdW5jdGlvbihyZXNvbHZlcikge1xyXG4gICAgICB0aGlzLnJlc29sdmVyID0gcmVzb2x2ZXI7XHJcbiAgICB9O1xyXG5cclxuICAgIHRoaXMuJGdldCA9IFsnJGluamVjdG9yJywgJyRxJywgZnVuY3Rpb24oJGluamVjdG9yLCAkcSkge1xyXG4gICAgICB2YXIgcmVzb2x2ZXIgPSByZXNvbHZlLnJlc29sdmVyID8gJGluamVjdG9yLmdldChyZXNvbHZlLnJlc29sdmVyKSA6IG51bGw7XHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgcmVzb2x2ZTogZnVuY3Rpb24oaW52b2NhYmxlcywgbG9jYWxzLCBwYXJlbnQsIHNlbGYpIHtcclxuICAgICAgICAgIGlmIChyZXNvbHZlcikge1xyXG4gICAgICAgICAgICByZXR1cm4gcmVzb2x2ZXIucmVzb2x2ZShpbnZvY2FibGVzLCBsb2NhbHMsIHBhcmVudCwgc2VsZik7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgdmFyIHByb21pc2VzID0gW107XHJcblxyXG4gICAgICAgICAgYW5ndWxhci5mb3JFYWNoKGludm9jYWJsZXMsIGZ1bmN0aW9uKHZhbHVlKSB7XHJcbiAgICAgICAgICAgIGlmIChhbmd1bGFyLmlzRnVuY3Rpb24odmFsdWUpIHx8IGFuZ3VsYXIuaXNBcnJheSh2YWx1ZSkpIHtcclxuICAgICAgICAgICAgICBwcm9taXNlcy5wdXNoKCRxLnJlc29sdmUoJGluamVjdG9yLmludm9rZSh2YWx1ZSkpKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChhbmd1bGFyLmlzU3RyaW5nKHZhbHVlKSkge1xyXG4gICAgICAgICAgICAgIHByb21pc2VzLnB1c2goJHEucmVzb2x2ZSgkaW5qZWN0b3IuZ2V0KHZhbHVlKSkpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIHByb21pc2VzLnB1c2goJHEucmVzb2x2ZSh2YWx1ZSkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICByZXR1cm4gJHEuYWxsKHByb21pc2VzKS50aGVuKGZ1bmN0aW9uKHJlc29sdmVzKSB7XHJcbiAgICAgICAgICAgIHZhciByZXNvbHZlT2JqID0ge307XHJcbiAgICAgICAgICAgIHZhciByZXNvbHZlSXRlciA9IDA7XHJcbiAgICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaChpbnZvY2FibGVzLCBmdW5jdGlvbih2YWx1ZSwga2V5KSB7XHJcbiAgICAgICAgICAgICAgcmVzb2x2ZU9ialtrZXldID0gcmVzb2x2ZXNbcmVzb2x2ZUl0ZXIrK107XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHJlc29sdmVPYmo7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgIH07XHJcbiAgICB9XTtcclxuICB9KVxyXG5cclxuLyoqXHJcbiAqIEEgaGVscGVyIGRpcmVjdGl2ZSBmb3IgdGhlICRtb2RhbCBzZXJ2aWNlLiBJdCBjcmVhdGVzIGEgYmFja2Ryb3AgZWxlbWVudC5cclxuICovXHJcbiAgLmRpcmVjdGl2ZSgndWliTW9kYWxCYWNrZHJvcCcsIFsnJGFuaW1hdGUnLCAnJGluamVjdG9yJywgJyR1aWJNb2RhbFN0YWNrJyxcclxuICBmdW5jdGlvbigkYW5pbWF0ZSwgJGluamVjdG9yLCAkbW9kYWxTdGFjaykge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgcmVzdHJpY3Q6ICdBJyxcclxuICAgICAgY29tcGlsZTogZnVuY3Rpb24odEVsZW1lbnQsIHRBdHRycykge1xyXG4gICAgICAgIHRFbGVtZW50LmFkZENsYXNzKHRBdHRycy5iYWNrZHJvcENsYXNzKTtcclxuICAgICAgICByZXR1cm4gbGlua0ZuO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIGZ1bmN0aW9uIGxpbmtGbihzY29wZSwgZWxlbWVudCwgYXR0cnMpIHtcclxuICAgICAgaWYgKGF0dHJzLm1vZGFsSW5DbGFzcykge1xyXG4gICAgICAgICRhbmltYXRlLmFkZENsYXNzKGVsZW1lbnQsIGF0dHJzLm1vZGFsSW5DbGFzcyk7XHJcblxyXG4gICAgICAgIHNjb3BlLiRvbigkbW9kYWxTdGFjay5OT1dfQ0xPU0lOR19FVkVOVCwgZnVuY3Rpb24oZSwgc2V0SXNBc3luYykge1xyXG4gICAgICAgICAgdmFyIGRvbmUgPSBzZXRJc0FzeW5jKCk7XHJcbiAgICAgICAgICBpZiAoc2NvcGUubW9kYWxPcHRpb25zLmFuaW1hdGlvbikge1xyXG4gICAgICAgICAgICAkYW5pbWF0ZS5yZW1vdmVDbGFzcyhlbGVtZW50LCBhdHRycy5tb2RhbEluQ2xhc3MpLnRoZW4oZG9uZSk7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBkb25lKCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XSlcclxuXHJcbiAgLmRpcmVjdGl2ZSgndWliTW9kYWxXaW5kb3cnLCBbJyR1aWJNb2RhbFN0YWNrJywgJyRxJywgJyRhbmltYXRlQ3NzJywgJyRkb2N1bWVudCcsXHJcbiAgZnVuY3Rpb24oJG1vZGFsU3RhY2ssICRxLCAkYW5pbWF0ZUNzcywgJGRvY3VtZW50KSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBzY29wZToge1xyXG4gICAgICAgIGluZGV4OiAnQCdcclxuICAgICAgfSxcclxuICAgICAgcmVzdHJpY3Q6ICdBJyxcclxuICAgICAgdHJhbnNjbHVkZTogdHJ1ZSxcclxuICAgICAgdGVtcGxhdGVVcmw6IGZ1bmN0aW9uKHRFbGVtZW50LCB0QXR0cnMpIHtcclxuICAgICAgICByZXR1cm4gdEF0dHJzLnRlbXBsYXRlVXJsIHx8ICd1aWIvdGVtcGxhdGUvbW9kYWwvd2luZG93Lmh0bWwnO1xyXG4gICAgICB9LFxyXG4gICAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxlbWVudCwgYXR0cnMpIHtcclxuICAgICAgICBlbGVtZW50LmFkZENsYXNzKGF0dHJzLndpbmRvd1RvcENsYXNzIHx8ICcnKTtcclxuICAgICAgICBzY29wZS5zaXplID0gYXR0cnMuc2l6ZTtcclxuXHJcbiAgICAgICAgc2NvcGUuY2xvc2UgPSBmdW5jdGlvbihldnQpIHtcclxuICAgICAgICAgIHZhciBtb2RhbCA9ICRtb2RhbFN0YWNrLmdldFRvcCgpO1xyXG4gICAgICAgICAgaWYgKG1vZGFsICYmIG1vZGFsLnZhbHVlLmJhY2tkcm9wICYmXHJcbiAgICAgICAgICAgIG1vZGFsLnZhbHVlLmJhY2tkcm9wICE9PSAnc3RhdGljJyAmJlxyXG4gICAgICAgICAgICBldnQudGFyZ2V0ID09PSBldnQuY3VycmVudFRhcmdldCkge1xyXG4gICAgICAgICAgICBldnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgZXZ0LnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgICAkbW9kYWxTdGFjay5kaXNtaXNzKG1vZGFsLmtleSwgJ2JhY2tkcm9wIGNsaWNrJyk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLy8gbW92ZWQgZnJvbSB0ZW1wbGF0ZSB0byBmaXggaXNzdWUgIzIyODBcclxuICAgICAgICBlbGVtZW50Lm9uKCdjbGljaycsIHNjb3BlLmNsb3NlKTtcclxuXHJcbiAgICAgICAgLy8gVGhpcyBwcm9wZXJ0eSBpcyBvbmx5IGFkZGVkIHRvIHRoZSBzY29wZSBmb3IgdGhlIHB1cnBvc2Ugb2YgZGV0ZWN0aW5nIHdoZW4gdGhpcyBkaXJlY3RpdmUgaXMgcmVuZGVyZWQuXHJcbiAgICAgICAgLy8gV2UgY2FuIGRldGVjdCB0aGF0IGJ5IHVzaW5nIHRoaXMgcHJvcGVydHkgaW4gdGhlIHRlbXBsYXRlIGFzc29jaWF0ZWQgd2l0aCB0aGlzIGRpcmVjdGl2ZSBhbmQgdGhlbiB1c2VcclxuICAgICAgICAvLyB7QGxpbmsgQXR0cmlidXRlIyRvYnNlcnZlfSBvbiBpdC4gRm9yIG1vcmUgZGV0YWlscyBwbGVhc2Ugc2VlIHtAbGluayBUYWJsZUNvbHVtblJlc2l6ZX0uXHJcbiAgICAgICAgc2NvcGUuJGlzUmVuZGVyZWQgPSB0cnVlO1xyXG5cclxuICAgICAgICAvLyBEZWZlcnJlZCBvYmplY3QgdGhhdCB3aWxsIGJlIHJlc29sdmVkIHdoZW4gdGhpcyBtb2RhbCBpcyByZW5kZXJlZC5cclxuICAgICAgICB2YXIgbW9kYWxSZW5kZXJEZWZlck9iaiA9ICRxLmRlZmVyKCk7XHJcbiAgICAgICAgLy8gUmVzb2x2ZSByZW5kZXIgcHJvbWlzZSBwb3N0LWRpZ2VzdFxyXG4gICAgICAgIHNjb3BlLiQkcG9zdERpZ2VzdChmdW5jdGlvbigpIHtcclxuICAgICAgICAgIG1vZGFsUmVuZGVyRGVmZXJPYmoucmVzb2x2ZSgpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBtb2RhbFJlbmRlckRlZmVyT2JqLnByb21pc2UudGhlbihmdW5jdGlvbigpIHtcclxuICAgICAgICAgIHZhciBhbmltYXRpb25Qcm9taXNlID0gbnVsbDtcclxuXHJcbiAgICAgICAgICBpZiAoYXR0cnMubW9kYWxJbkNsYXNzKSB7XHJcbiAgICAgICAgICAgIGFuaW1hdGlvblByb21pc2UgPSAkYW5pbWF0ZUNzcyhlbGVtZW50LCB7XHJcbiAgICAgICAgICAgICAgYWRkQ2xhc3M6IGF0dHJzLm1vZGFsSW5DbGFzc1xyXG4gICAgICAgICAgICB9KS5zdGFydCgpO1xyXG5cclxuICAgICAgICAgICAgc2NvcGUuJG9uKCRtb2RhbFN0YWNrLk5PV19DTE9TSU5HX0VWRU5ULCBmdW5jdGlvbihlLCBzZXRJc0FzeW5jKSB7XHJcbiAgICAgICAgICAgICAgdmFyIGRvbmUgPSBzZXRJc0FzeW5jKCk7XHJcbiAgICAgICAgICAgICAgJGFuaW1hdGVDc3MoZWxlbWVudCwge1xyXG4gICAgICAgICAgICAgICAgcmVtb3ZlQ2xhc3M6IGF0dHJzLm1vZGFsSW5DbGFzc1xyXG4gICAgICAgICAgICAgIH0pLnN0YXJ0KCkudGhlbihkb25lKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICAgICRxLndoZW4oYW5pbWF0aW9uUHJvbWlzZSkudGhlbihmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgLy8gTm90aWZ5IHtAbGluayAkbW9kYWxTdGFja30gdGhhdCBtb2RhbCBpcyByZW5kZXJlZC5cclxuICAgICAgICAgICAgdmFyIG1vZGFsID0gJG1vZGFsU3RhY2suZ2V0VG9wKCk7XHJcbiAgICAgICAgICAgIGlmIChtb2RhbCkge1xyXG4gICAgICAgICAgICAgICRtb2RhbFN0YWNrLm1vZGFsUmVuZGVyZWQobW9kYWwua2V5KTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLyoqXHJcbiAgICAgICAgICAgICAqIElmIHNvbWV0aGluZyB3aXRoaW4gdGhlIGZyZXNobHktb3BlbmVkIG1vZGFsIGFscmVhZHkgaGFzIGZvY3VzIChwZXJoYXBzIHZpYSBhXHJcbiAgICAgICAgICAgICAqIGRpcmVjdGl2ZSB0aGF0IGNhdXNlcyBmb2N1cykgdGhlbiB0aGVyZSdzIG5vIG5lZWQgdG8gdHJ5IHRvIGZvY3VzIGFueXRoaW5nLlxyXG4gICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgaWYgKCEoJGRvY3VtZW50WzBdLmFjdGl2ZUVsZW1lbnQgJiYgZWxlbWVudFswXS5jb250YWlucygkZG9jdW1lbnRbMF0uYWN0aXZlRWxlbWVudCkpKSB7XHJcbiAgICAgICAgICAgICAgdmFyIGlucHV0V2l0aEF1dG9mb2N1cyA9IGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignW2F1dG9mb2N1c10nKTtcclxuICAgICAgICAgICAgICAvKipcclxuICAgICAgICAgICAgICAgKiBBdXRvLWZvY3VzaW5nIG9mIGEgZnJlc2hseS1vcGVuZWQgbW9kYWwgZWxlbWVudCBjYXVzZXMgYW55IGNoaWxkIGVsZW1lbnRzXHJcbiAgICAgICAgICAgICAgICogd2l0aCB0aGUgYXV0b2ZvY3VzIGF0dHJpYnV0ZSB0byBsb3NlIGZvY3VzLiBUaGlzIGlzIGFuIGlzc3VlIG9uIHRvdWNoXHJcbiAgICAgICAgICAgICAgICogYmFzZWQgZGV2aWNlcyB3aGljaCB3aWxsIHNob3cgYW5kIHRoZW4gaGlkZSB0aGUgb25zY3JlZW4ga2V5Ym9hcmQuXHJcbiAgICAgICAgICAgICAgICogQXR0ZW1wdHMgdG8gcmVmb2N1cyB0aGUgYXV0b2ZvY3VzIGVsZW1lbnQgdmlhIEphdmFTY3JpcHQgd2lsbCBub3QgcmVvcGVuXHJcbiAgICAgICAgICAgICAgICogdGhlIG9uc2NyZWVuIGtleWJvYXJkLiBGaXhlZCBieSB1cGRhdGVkIHRoZSBmb2N1c2luZyBsb2dpYyB0byBvbmx5IGF1dG9mb2N1c1xyXG4gICAgICAgICAgICAgICAqIHRoZSBtb2RhbCBlbGVtZW50IGlmIHRoZSBtb2RhbCBkb2VzIG5vdCBjb250YWluIGFuIGF1dG9mb2N1cyBlbGVtZW50LlxyXG4gICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgIGlmIChpbnB1dFdpdGhBdXRvZm9jdXMpIHtcclxuICAgICAgICAgICAgICAgIGlucHV0V2l0aEF1dG9mb2N1cy5mb2N1cygpO1xyXG4gICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBlbGVtZW50WzBdLmZvY3VzKCk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuICB9XSlcclxuXHJcbiAgLmRpcmVjdGl2ZSgndWliTW9kYWxBbmltYXRpb25DbGFzcycsIGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgY29tcGlsZTogZnVuY3Rpb24odEVsZW1lbnQsIHRBdHRycykge1xyXG4gICAgICAgIGlmICh0QXR0cnMubW9kYWxBbmltYXRpb24pIHtcclxuICAgICAgICAgIHRFbGVtZW50LmFkZENsYXNzKHRBdHRycy51aWJNb2RhbEFuaW1hdGlvbkNsYXNzKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH07XHJcbiAgfSlcclxuXHJcbiAgLmRpcmVjdGl2ZSgndWliTW9kYWxUcmFuc2NsdWRlJywgWyckYW5pbWF0ZScsIGZ1bmN0aW9uKCRhbmltYXRlKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxlbWVudCwgYXR0cnMsIGNvbnRyb2xsZXIsIHRyYW5zY2x1ZGUpIHtcclxuICAgICAgICB0cmFuc2NsdWRlKHNjb3BlLiRwYXJlbnQsIGZ1bmN0aW9uKGNsb25lKSB7XHJcbiAgICAgICAgICBlbGVtZW50LmVtcHR5KCk7XHJcbiAgICAgICAgICAkYW5pbWF0ZS5lbnRlcihjbG9uZSwgZWxlbWVudCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgIH07XHJcbiAgfV0pXHJcblxyXG4gIC5mYWN0b3J5KCckdWliTW9kYWxTdGFjaycsIFsnJGFuaW1hdGUnLCAnJGFuaW1hdGVDc3MnLCAnJGRvY3VtZW50JyxcclxuICAgICckY29tcGlsZScsICckcm9vdFNjb3BlJywgJyRxJywgJyQkbXVsdGlNYXAnLCAnJCRzdGFja2VkTWFwJywgJyR1aWJQb3NpdGlvbicsXHJcbiAgICBmdW5jdGlvbigkYW5pbWF0ZSwgJGFuaW1hdGVDc3MsICRkb2N1bWVudCwgJGNvbXBpbGUsICRyb290U2NvcGUsICRxLCAkJG11bHRpTWFwLCAkJHN0YWNrZWRNYXAsICR1aWJQb3NpdGlvbikge1xyXG4gICAgICB2YXIgT1BFTkVEX01PREFMX0NMQVNTID0gJ21vZGFsLW9wZW4nO1xyXG5cclxuICAgICAgdmFyIGJhY2tkcm9wRG9tRWwsIGJhY2tkcm9wU2NvcGU7XHJcbiAgICAgIHZhciBvcGVuZWRXaW5kb3dzID0gJCRzdGFja2VkTWFwLmNyZWF0ZU5ldygpO1xyXG4gICAgICB2YXIgb3BlbmVkQ2xhc3NlcyA9ICQkbXVsdGlNYXAuY3JlYXRlTmV3KCk7XHJcbiAgICAgIHZhciAkbW9kYWxTdGFjayA9IHtcclxuICAgICAgICBOT1dfQ0xPU0lOR19FVkVOVDogJ21vZGFsLnN0YWNrLm5vdy1jbG9zaW5nJ1xyXG4gICAgICB9O1xyXG4gICAgICB2YXIgdG9wTW9kYWxJbmRleCA9IDA7XHJcbiAgICAgIHZhciBwcmV2aW91c1RvcE9wZW5lZE1vZGFsID0gbnVsbDtcclxuICAgICAgdmFyIEFSSUFfSElEREVOX0FUVFJJQlVURV9OQU1FID0gJ2RhdGEtYm9vdHN0cmFwLW1vZGFsLWFyaWEtaGlkZGVuLWNvdW50JztcclxuXHJcbiAgICAgIC8vTW9kYWwgZm9jdXMgYmVoYXZpb3JcclxuICAgICAgdmFyIHRhYmJhYmxlU2VsZWN0b3IgPSAnYVtocmVmXSwgYXJlYVtocmVmXSwgaW5wdXQ6bm90KFtkaXNhYmxlZF0pOm5vdChbdGFiaW5kZXg9XFwnLTFcXCddKSwgJyArXHJcbiAgICAgICAgJ2J1dHRvbjpub3QoW2Rpc2FibGVkXSk6bm90KFt0YWJpbmRleD1cXCctMVxcJ10pLHNlbGVjdDpub3QoW2Rpc2FibGVkXSk6bm90KFt0YWJpbmRleD1cXCctMVxcJ10pLCB0ZXh0YXJlYTpub3QoW2Rpc2FibGVkXSk6bm90KFt0YWJpbmRleD1cXCctMVxcJ10pLCAnICtcclxuICAgICAgICAnaWZyYW1lLCBvYmplY3QsIGVtYmVkLCAqW3RhYmluZGV4XTpub3QoW3RhYmluZGV4PVxcJy0xXFwnXSksICpbY29udGVudGVkaXRhYmxlPXRydWVdJztcclxuICAgICAgdmFyIHNjcm9sbGJhclBhZGRpbmc7XHJcbiAgICAgIHZhciBTTkFLRV9DQVNFX1JFR0VYUCA9IC9bQS1aXS9nO1xyXG5cclxuICAgICAgLy8gVE9ETzogZXh0cmFjdCBpbnRvIGNvbW1vbiBkZXBlbmRlbmN5IHdpdGggdG9vbHRpcFxyXG4gICAgICBmdW5jdGlvbiBzbmFrZV9jYXNlKG5hbWUpIHtcclxuICAgICAgICB2YXIgc2VwYXJhdG9yID0gJy0nO1xyXG4gICAgICAgIHJldHVybiBuYW1lLnJlcGxhY2UoU05BS0VfQ0FTRV9SRUdFWFAsIGZ1bmN0aW9uKGxldHRlciwgcG9zKSB7XHJcbiAgICAgICAgICByZXR1cm4gKHBvcyA/IHNlcGFyYXRvciA6ICcnKSArIGxldHRlci50b0xvd2VyQ2FzZSgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBmdW5jdGlvbiBpc1Zpc2libGUoZWxlbWVudCkge1xyXG4gICAgICAgIHJldHVybiAhIShlbGVtZW50Lm9mZnNldFdpZHRoIHx8XHJcbiAgICAgICAgICBlbGVtZW50Lm9mZnNldEhlaWdodCB8fFxyXG4gICAgICAgICAgZWxlbWVudC5nZXRDbGllbnRSZWN0cygpLmxlbmd0aCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGZ1bmN0aW9uIGJhY2tkcm9wSW5kZXgoKSB7XHJcbiAgICAgICAgdmFyIHRvcEJhY2tkcm9wSW5kZXggPSAtMTtcclxuICAgICAgICB2YXIgb3BlbmVkID0gb3BlbmVkV2luZG93cy5rZXlzKCk7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBvcGVuZWQubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgIGlmIChvcGVuZWRXaW5kb3dzLmdldChvcGVuZWRbaV0pLnZhbHVlLmJhY2tkcm9wKSB7XHJcbiAgICAgICAgICAgIHRvcEJhY2tkcm9wSW5kZXggPSBpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gSWYgYW55IGJhY2tkcm9wIGV4aXN0LCBlbnN1cmUgdGhhdCBpdCdzIGluZGV4IGlzIGFsd2F5c1xyXG4gICAgICAgIC8vIHJpZ2h0IGJlbG93IHRoZSB0b3AgbW9kYWxcclxuICAgICAgICBpZiAodG9wQmFja2Ryb3BJbmRleCA+IC0xICYmIHRvcEJhY2tkcm9wSW5kZXggPCB0b3BNb2RhbEluZGV4KSB7XHJcbiAgICAgICAgICB0b3BCYWNrZHJvcEluZGV4ID0gdG9wTW9kYWxJbmRleDtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRvcEJhY2tkcm9wSW5kZXg7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgICRyb290U2NvcGUuJHdhdGNoKGJhY2tkcm9wSW5kZXgsIGZ1bmN0aW9uKG5ld0JhY2tkcm9wSW5kZXgpIHtcclxuICAgICAgICBpZiAoYmFja2Ryb3BTY29wZSkge1xyXG4gICAgICAgICAgYmFja2Ryb3BTY29wZS5pbmRleCA9IG5ld0JhY2tkcm9wSW5kZXg7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIGZ1bmN0aW9uIHJlbW92ZU1vZGFsV2luZG93KG1vZGFsSW5zdGFuY2UsIGVsZW1lbnRUb1JlY2VpdmVGb2N1cykge1xyXG4gICAgICAgIHZhciBtb2RhbFdpbmRvdyA9IG9wZW5lZFdpbmRvd3MuZ2V0KG1vZGFsSW5zdGFuY2UpLnZhbHVlO1xyXG4gICAgICAgIHZhciBhcHBlbmRUb0VsZW1lbnQgPSBtb2RhbFdpbmRvdy5hcHBlbmRUbztcclxuXHJcbiAgICAgICAgLy9jbGVhbiB1cCB0aGUgc3RhY2tcclxuICAgICAgICBvcGVuZWRXaW5kb3dzLnJlbW92ZShtb2RhbEluc3RhbmNlKTtcclxuICAgICAgICBwcmV2aW91c1RvcE9wZW5lZE1vZGFsID0gb3BlbmVkV2luZG93cy50b3AoKTtcclxuICAgICAgICBpZiAocHJldmlvdXNUb3BPcGVuZWRNb2RhbCkge1xyXG4gICAgICAgICAgdG9wTW9kYWxJbmRleCA9IHBhcnNlSW50KHByZXZpb3VzVG9wT3BlbmVkTW9kYWwudmFsdWUubW9kYWxEb21FbC5hdHRyKCdpbmRleCcpLCAxMCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZW1vdmVBZnRlckFuaW1hdGUobW9kYWxXaW5kb3cubW9kYWxEb21FbCwgbW9kYWxXaW5kb3cubW9kYWxTY29wZSwgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICB2YXIgbW9kYWxCb2R5Q2xhc3MgPSBtb2RhbFdpbmRvdy5vcGVuZWRDbGFzcyB8fCBPUEVORURfTU9EQUxfQ0xBU1M7XHJcbiAgICAgICAgICBvcGVuZWRDbGFzc2VzLnJlbW92ZShtb2RhbEJvZHlDbGFzcywgbW9kYWxJbnN0YW5jZSk7XHJcbiAgICAgICAgICB2YXIgYXJlQW55T3BlbiA9IG9wZW5lZENsYXNzZXMuaGFzS2V5KG1vZGFsQm9keUNsYXNzKTtcclxuICAgICAgICAgIGFwcGVuZFRvRWxlbWVudC50b2dnbGVDbGFzcyhtb2RhbEJvZHlDbGFzcywgYXJlQW55T3Blbik7XHJcbiAgICAgICAgICBpZiAoIWFyZUFueU9wZW4gJiYgc2Nyb2xsYmFyUGFkZGluZyAmJiBzY3JvbGxiYXJQYWRkaW5nLmhlaWdodE92ZXJmbG93ICYmIHNjcm9sbGJhclBhZGRpbmcuc2Nyb2xsYmFyV2lkdGgpIHtcclxuICAgICAgICAgICAgaWYgKHNjcm9sbGJhclBhZGRpbmcub3JpZ2luYWxSaWdodCkge1xyXG4gICAgICAgICAgICAgIGFwcGVuZFRvRWxlbWVudC5jc3Moe3BhZGRpbmdSaWdodDogc2Nyb2xsYmFyUGFkZGluZy5vcmlnaW5hbFJpZ2h0ICsgJ3B4J30pO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIGFwcGVuZFRvRWxlbWVudC5jc3Moe3BhZGRpbmdSaWdodDogJyd9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBzY3JvbGxiYXJQYWRkaW5nID0gbnVsbDtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHRvZ2dsZVRvcFdpbmRvd0NsYXNzKHRydWUpO1xyXG4gICAgICAgIH0sIG1vZGFsV2luZG93LmNsb3NlZERlZmVycmVkKTtcclxuICAgICAgICBjaGVja1JlbW92ZUJhY2tkcm9wKCk7XHJcblxyXG4gICAgICAgIC8vbW92ZSBmb2N1cyB0byBzcGVjaWZpZWQgZWxlbWVudCBpZiBhdmFpbGFibGUsIG9yIGVsc2UgdG8gYm9keVxyXG4gICAgICAgIGlmIChlbGVtZW50VG9SZWNlaXZlRm9jdXMgJiYgZWxlbWVudFRvUmVjZWl2ZUZvY3VzLmZvY3VzKSB7XHJcbiAgICAgICAgICBlbGVtZW50VG9SZWNlaXZlRm9jdXMuZm9jdXMoKTtcclxuICAgICAgICB9IGVsc2UgaWYgKGFwcGVuZFRvRWxlbWVudC5mb2N1cykge1xyXG4gICAgICAgICAgYXBwZW5kVG9FbGVtZW50LmZvY3VzKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBBZGQgb3IgcmVtb3ZlIFwid2luZG93VG9wQ2xhc3NcIiBmcm9tIHRoZSB0b3Agd2luZG93IGluIHRoZSBzdGFja1xyXG4gICAgICBmdW5jdGlvbiB0b2dnbGVUb3BXaW5kb3dDbGFzcyh0b2dnbGVTd2l0Y2gpIHtcclxuICAgICAgICB2YXIgbW9kYWxXaW5kb3c7XHJcblxyXG4gICAgICAgIGlmIChvcGVuZWRXaW5kb3dzLmxlbmd0aCgpID4gMCkge1xyXG4gICAgICAgICAgbW9kYWxXaW5kb3cgPSBvcGVuZWRXaW5kb3dzLnRvcCgpLnZhbHVlO1xyXG4gICAgICAgICAgbW9kYWxXaW5kb3cubW9kYWxEb21FbC50b2dnbGVDbGFzcyhtb2RhbFdpbmRvdy53aW5kb3dUb3BDbGFzcyB8fCAnJywgdG9nZ2xlU3dpdGNoKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGZ1bmN0aW9uIGNoZWNrUmVtb3ZlQmFja2Ryb3AoKSB7XHJcbiAgICAgICAgLy9yZW1vdmUgYmFja2Ryb3AgaWYgbm8gbG9uZ2VyIG5lZWRlZFxyXG4gICAgICAgIGlmIChiYWNrZHJvcERvbUVsICYmIGJhY2tkcm9wSW5kZXgoKSA9PT0gLTEpIHtcclxuICAgICAgICAgIHZhciBiYWNrZHJvcFNjb3BlUmVmID0gYmFja2Ryb3BTY29wZTtcclxuICAgICAgICAgIHJlbW92ZUFmdGVyQW5pbWF0ZShiYWNrZHJvcERvbUVsLCBiYWNrZHJvcFNjb3BlLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgYmFja2Ryb3BTY29wZVJlZiA9IG51bGw7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICAgIGJhY2tkcm9wRG9tRWwgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgICBiYWNrZHJvcFNjb3BlID0gdW5kZWZpbmVkO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgZnVuY3Rpb24gcmVtb3ZlQWZ0ZXJBbmltYXRlKGRvbUVsLCBzY29wZSwgZG9uZSwgY2xvc2VkRGVmZXJyZWQpIHtcclxuICAgICAgICB2YXIgYXN5bmNEZWZlcnJlZDtcclxuICAgICAgICB2YXIgYXN5bmNQcm9taXNlID0gbnVsbDtcclxuICAgICAgICB2YXIgc2V0SXNBc3luYyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgaWYgKCFhc3luY0RlZmVycmVkKSB7XHJcbiAgICAgICAgICAgIGFzeW5jRGVmZXJyZWQgPSAkcS5kZWZlcigpO1xyXG4gICAgICAgICAgICBhc3luY1Byb21pc2UgPSBhc3luY0RlZmVycmVkLnByb21pc2U7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIGFzeW5jRG9uZSgpIHtcclxuICAgICAgICAgICAgYXN5bmNEZWZlcnJlZC5yZXNvbHZlKCk7XHJcbiAgICAgICAgICB9O1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgc2NvcGUuJGJyb2FkY2FzdCgkbW9kYWxTdGFjay5OT1dfQ0xPU0lOR19FVkVOVCwgc2V0SXNBc3luYyk7XHJcblxyXG4gICAgICAgIC8vIE5vdGUgdGhhdCBpdCdzIGludGVudGlvbmFsIHRoYXQgYXN5bmNQcm9taXNlIG1pZ2h0IGJlIG51bGwuXHJcbiAgICAgICAgLy8gVGhhdCdzIHdoZW4gc2V0SXNBc3luYyBoYXMgbm90IGJlZW4gY2FsbGVkIGR1cmluZyB0aGVcclxuICAgICAgICAvLyBOT1dfQ0xPU0lOR19FVkVOVCBicm9hZGNhc3QuXHJcbiAgICAgICAgcmV0dXJuICRxLndoZW4oYXN5bmNQcm9taXNlKS50aGVuKGFmdGVyQW5pbWF0aW5nKTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gYWZ0ZXJBbmltYXRpbmcoKSB7XHJcbiAgICAgICAgICBpZiAoYWZ0ZXJBbmltYXRpbmcuZG9uZSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBhZnRlckFuaW1hdGluZy5kb25lID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgICAkYW5pbWF0ZS5sZWF2ZShkb21FbCkudGhlbihmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgaWYgKGRvbmUpIHtcclxuICAgICAgICAgICAgICBkb25lKCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGRvbUVsLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICBpZiAoY2xvc2VkRGVmZXJyZWQpIHtcclxuICAgICAgICAgICAgICBjbG9zZWREZWZlcnJlZC5yZXNvbHZlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgIHNjb3BlLiRkZXN0cm95KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICAkZG9jdW1lbnQub24oJ2tleWRvd24nLCBrZXlkb3duTGlzdGVuZXIpO1xyXG5cclxuICAgICAgJHJvb3RTY29wZS4kb24oJyRkZXN0cm95JywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgJGRvY3VtZW50Lm9mZigna2V5ZG93bicsIGtleWRvd25MaXN0ZW5lcik7XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgZnVuY3Rpb24ga2V5ZG93bkxpc3RlbmVyKGV2dCkge1xyXG4gICAgICAgIGlmIChldnQuaXNEZWZhdWx0UHJldmVudGVkKCkpIHtcclxuICAgICAgICAgIHJldHVybiBldnQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2YXIgbW9kYWwgPSBvcGVuZWRXaW5kb3dzLnRvcCgpO1xyXG4gICAgICAgIGlmIChtb2RhbCkge1xyXG4gICAgICAgICAgc3dpdGNoIChldnQud2hpY2gpIHtcclxuICAgICAgICAgICAgY2FzZSAyNzoge1xyXG4gICAgICAgICAgICAgIGlmIChtb2RhbC52YWx1ZS5rZXlib2FyZCkge1xyXG4gICAgICAgICAgICAgICAgZXZ0LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRhcHBseShmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgJG1vZGFsU3RhY2suZGlzbWlzcyhtb2RhbC5rZXksICdlc2NhcGUga2V5IHByZXNzJyk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2FzZSA5OiB7XHJcbiAgICAgICAgICAgICAgdmFyIGxpc3QgPSAkbW9kYWxTdGFjay5sb2FkRm9jdXNFbGVtZW50TGlzdChtb2RhbCk7XHJcbiAgICAgICAgICAgICAgdmFyIGZvY3VzQ2hhbmdlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgIGlmIChldnQuc2hpZnRLZXkpIHtcclxuICAgICAgICAgICAgICAgIGlmICgkbW9kYWxTdGFjay5pc0ZvY3VzSW5GaXJzdEl0ZW0oZXZ0LCBsaXN0KSB8fCAkbW9kYWxTdGFjay5pc01vZGFsRm9jdXNlZChldnQsIG1vZGFsKSkge1xyXG4gICAgICAgICAgICAgICAgICBmb2N1c0NoYW5nZWQgPSAkbW9kYWxTdGFjay5mb2N1c0xhc3RGb2N1c2FibGVFbGVtZW50KGxpc3QpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoJG1vZGFsU3RhY2suaXNGb2N1c0luTGFzdEl0ZW0oZXZ0LCBsaXN0KSkge1xyXG4gICAgICAgICAgICAgICAgICBmb2N1c0NoYW5nZWQgPSAkbW9kYWxTdGFjay5mb2N1c0ZpcnN0Rm9jdXNhYmxlRWxlbWVudChsaXN0KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgIGlmIChmb2N1c0NoYW5nZWQpIHtcclxuICAgICAgICAgICAgICAgIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICAgICAgZXZ0LnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgICRtb2RhbFN0YWNrLm9wZW4gPSBmdW5jdGlvbihtb2RhbEluc3RhbmNlLCBtb2RhbCkge1xyXG4gICAgICAgIHZhciBtb2RhbE9wZW5lciA9ICRkb2N1bWVudFswXS5hY3RpdmVFbGVtZW50LFxyXG4gICAgICAgICAgbW9kYWxCb2R5Q2xhc3MgPSBtb2RhbC5vcGVuZWRDbGFzcyB8fCBPUEVORURfTU9EQUxfQ0xBU1M7XHJcblxyXG4gICAgICAgIHRvZ2dsZVRvcFdpbmRvd0NsYXNzKGZhbHNlKTtcclxuXHJcbiAgICAgICAgLy8gU3RvcmUgdGhlIGN1cnJlbnQgdG9wIGZpcnN0LCB0byBkZXRlcm1pbmUgd2hhdCBpbmRleCB3ZSBvdWdodCB0byB1c2VcclxuICAgICAgICAvLyBmb3IgdGhlIGN1cnJlbnQgdG9wIG1vZGFsXHJcbiAgICAgICAgcHJldmlvdXNUb3BPcGVuZWRNb2RhbCA9IG9wZW5lZFdpbmRvd3MudG9wKCk7XHJcblxyXG4gICAgICAgIG9wZW5lZFdpbmRvd3MuYWRkKG1vZGFsSW5zdGFuY2UsIHtcclxuICAgICAgICAgIGRlZmVycmVkOiBtb2RhbC5kZWZlcnJlZCxcclxuICAgICAgICAgIHJlbmRlckRlZmVycmVkOiBtb2RhbC5yZW5kZXJEZWZlcnJlZCxcclxuICAgICAgICAgIGNsb3NlZERlZmVycmVkOiBtb2RhbC5jbG9zZWREZWZlcnJlZCxcclxuICAgICAgICAgIG1vZGFsU2NvcGU6IG1vZGFsLnNjb3BlLFxyXG4gICAgICAgICAgYmFja2Ryb3A6IG1vZGFsLmJhY2tkcm9wLFxyXG4gICAgICAgICAga2V5Ym9hcmQ6IG1vZGFsLmtleWJvYXJkLFxyXG4gICAgICAgICAgb3BlbmVkQ2xhc3M6IG1vZGFsLm9wZW5lZENsYXNzLFxyXG4gICAgICAgICAgd2luZG93VG9wQ2xhc3M6IG1vZGFsLndpbmRvd1RvcENsYXNzLFxyXG4gICAgICAgICAgYW5pbWF0aW9uOiBtb2RhbC5hbmltYXRpb24sXHJcbiAgICAgICAgICBhcHBlbmRUbzogbW9kYWwuYXBwZW5kVG9cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgb3BlbmVkQ2xhc3Nlcy5wdXQobW9kYWxCb2R5Q2xhc3MsIG1vZGFsSW5zdGFuY2UpO1xyXG5cclxuICAgICAgICB2YXIgYXBwZW5kVG9FbGVtZW50ID0gbW9kYWwuYXBwZW5kVG8sXHJcbiAgICAgICAgICAgIGN1cnJCYWNrZHJvcEluZGV4ID0gYmFja2Ryb3BJbmRleCgpO1xyXG5cclxuICAgICAgICBpZiAoIWFwcGVuZFRvRWxlbWVudC5sZW5ndGgpIHtcclxuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignYXBwZW5kVG8gZWxlbWVudCBub3QgZm91bmQuIE1ha2Ugc3VyZSB0aGF0IHRoZSBlbGVtZW50IHBhc3NlZCBpcyBpbiBET00uJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoY3VyckJhY2tkcm9wSW5kZXggPj0gMCAmJiAhYmFja2Ryb3BEb21FbCkge1xyXG4gICAgICAgICAgYmFja2Ryb3BTY29wZSA9ICRyb290U2NvcGUuJG5ldyh0cnVlKTtcclxuICAgICAgICAgIGJhY2tkcm9wU2NvcGUubW9kYWxPcHRpb25zID0gbW9kYWw7XHJcbiAgICAgICAgICBiYWNrZHJvcFNjb3BlLmluZGV4ID0gY3VyckJhY2tkcm9wSW5kZXg7XHJcbiAgICAgICAgICBiYWNrZHJvcERvbUVsID0gYW5ndWxhci5lbGVtZW50KCc8ZGl2IHVpYi1tb2RhbC1iYWNrZHJvcD1cIm1vZGFsLWJhY2tkcm9wXCI+PC9kaXY+Jyk7XHJcbiAgICAgICAgICBiYWNrZHJvcERvbUVsLmF0dHIoe1xyXG4gICAgICAgICAgICAnY2xhc3MnOiAnbW9kYWwtYmFja2Ryb3AnLFxyXG4gICAgICAgICAgICAnbmctc3R5bGUnOiAne1xcJ3otaW5kZXhcXCc6IDEwNDAgKyAoaW5kZXggJiYgMSB8fCAwKSArIGluZGV4KjEwfScsXHJcbiAgICAgICAgICAgICd1aWItbW9kYWwtYW5pbWF0aW9uLWNsYXNzJzogJ2ZhZGUnLFxyXG4gICAgICAgICAgICAnbW9kYWwtaW4tY2xhc3MnOiAnaW4nXHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICAgIGlmIChtb2RhbC5iYWNrZHJvcENsYXNzKSB7XHJcbiAgICAgICAgICAgIGJhY2tkcm9wRG9tRWwuYWRkQ2xhc3MobW9kYWwuYmFja2Ryb3BDbGFzcyk7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgaWYgKG1vZGFsLmFuaW1hdGlvbikge1xyXG4gICAgICAgICAgICBiYWNrZHJvcERvbUVsLmF0dHIoJ21vZGFsLWFuaW1hdGlvbicsICd0cnVlJyk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICAkY29tcGlsZShiYWNrZHJvcERvbUVsKShiYWNrZHJvcFNjb3BlKTtcclxuICAgICAgICAgICRhbmltYXRlLmVudGVyKGJhY2tkcm9wRG9tRWwsIGFwcGVuZFRvRWxlbWVudCk7XHJcbiAgICAgICAgICBpZiAoJHVpYlBvc2l0aW9uLmlzU2Nyb2xsYWJsZShhcHBlbmRUb0VsZW1lbnQpKSB7XHJcbiAgICAgICAgICAgIHNjcm9sbGJhclBhZGRpbmcgPSAkdWliUG9zaXRpb24uc2Nyb2xsYmFyUGFkZGluZyhhcHBlbmRUb0VsZW1lbnQpO1xyXG4gICAgICAgICAgICBpZiAoc2Nyb2xsYmFyUGFkZGluZy5oZWlnaHRPdmVyZmxvdyAmJiBzY3JvbGxiYXJQYWRkaW5nLnNjcm9sbGJhcldpZHRoKSB7XHJcbiAgICAgICAgICAgICAgYXBwZW5kVG9FbGVtZW50LmNzcyh7cGFkZGluZ1JpZ2h0OiBzY3JvbGxiYXJQYWRkaW5nLnJpZ2h0ICsgJ3B4J30pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2YXIgY29udGVudDtcclxuICAgICAgICBpZiAobW9kYWwuY29tcG9uZW50KSB7XHJcbiAgICAgICAgICBjb250ZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChzbmFrZV9jYXNlKG1vZGFsLmNvbXBvbmVudC5uYW1lKSk7XHJcbiAgICAgICAgICBjb250ZW50ID0gYW5ndWxhci5lbGVtZW50KGNvbnRlbnQpO1xyXG4gICAgICAgICAgY29udGVudC5hdHRyKHtcclxuICAgICAgICAgICAgcmVzb2x2ZTogJyRyZXNvbHZlJyxcclxuICAgICAgICAgICAgJ21vZGFsLWluc3RhbmNlJzogJyR1aWJNb2RhbEluc3RhbmNlJyxcclxuICAgICAgICAgICAgY2xvc2U6ICckY2xvc2UoJHZhbHVlKScsXHJcbiAgICAgICAgICAgIGRpc21pc3M6ICckZGlzbWlzcygkdmFsdWUpJ1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGNvbnRlbnQgPSBtb2RhbC5jb250ZW50O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gU2V0IHRoZSB0b3AgbW9kYWwgaW5kZXggYmFzZWQgb24gdGhlIGluZGV4IG9mIHRoZSBwcmV2aW91cyB0b3AgbW9kYWxcclxuICAgICAgICB0b3BNb2RhbEluZGV4ID0gcHJldmlvdXNUb3BPcGVuZWRNb2RhbCA/IHBhcnNlSW50KHByZXZpb3VzVG9wT3BlbmVkTW9kYWwudmFsdWUubW9kYWxEb21FbC5hdHRyKCdpbmRleCcpLCAxMCkgKyAxIDogMDtcclxuICAgICAgICB2YXIgYW5ndWxhckRvbUVsID0gYW5ndWxhci5lbGVtZW50KCc8ZGl2IHVpYi1tb2RhbC13aW5kb3c9XCJtb2RhbC13aW5kb3dcIj48L2Rpdj4nKTtcclxuICAgICAgICBhbmd1bGFyRG9tRWwuYXR0cih7XHJcbiAgICAgICAgICAnY2xhc3MnOiAnbW9kYWwnLFxyXG4gICAgICAgICAgJ3RlbXBsYXRlLXVybCc6IG1vZGFsLndpbmRvd1RlbXBsYXRlVXJsLFxyXG4gICAgICAgICAgJ3dpbmRvdy10b3AtY2xhc3MnOiBtb2RhbC53aW5kb3dUb3BDbGFzcyxcclxuICAgICAgICAgICdyb2xlJzogJ2RpYWxvZycsXHJcbiAgICAgICAgICAnYXJpYS1sYWJlbGxlZGJ5JzogbW9kYWwuYXJpYUxhYmVsbGVkQnksXHJcbiAgICAgICAgICAnYXJpYS1kZXNjcmliZWRieSc6IG1vZGFsLmFyaWFEZXNjcmliZWRCeSxcclxuICAgICAgICAgICdzaXplJzogbW9kYWwuc2l6ZSxcclxuICAgICAgICAgICdpbmRleCc6IHRvcE1vZGFsSW5kZXgsXHJcbiAgICAgICAgICAnYW5pbWF0ZSc6ICdhbmltYXRlJyxcclxuICAgICAgICAgICduZy1zdHlsZSc6ICd7XFwnei1pbmRleFxcJzogMTA1MCArICQkdG9wTW9kYWxJbmRleCoxMCwgZGlzcGxheTogXFwnYmxvY2tcXCd9JyxcclxuICAgICAgICAgICd0YWJpbmRleCc6IC0xLFxyXG4gICAgICAgICAgJ3VpYi1tb2RhbC1hbmltYXRpb24tY2xhc3MnOiAnZmFkZScsXHJcbiAgICAgICAgICAnbW9kYWwtaW4tY2xhc3MnOiAnaW4nXHJcbiAgICAgICAgfSkuYXBwZW5kKGNvbnRlbnQpO1xyXG4gICAgICAgIGlmIChtb2RhbC53aW5kb3dDbGFzcykge1xyXG4gICAgICAgICAgYW5ndWxhckRvbUVsLmFkZENsYXNzKG1vZGFsLndpbmRvd0NsYXNzKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChtb2RhbC5hbmltYXRpb24pIHtcclxuICAgICAgICAgIGFuZ3VsYXJEb21FbC5hdHRyKCdtb2RhbC1hbmltYXRpb24nLCAndHJ1ZScpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgYXBwZW5kVG9FbGVtZW50LmFkZENsYXNzKG1vZGFsQm9keUNsYXNzKTtcclxuICAgICAgICBpZiAobW9kYWwuc2NvcGUpIHtcclxuICAgICAgICAgIC8vIHdlIG5lZWQgdG8gZXhwbGljaXRseSBhZGQgdGhlIG1vZGFsIGluZGV4IHRvIHRoZSBtb2RhbCBzY29wZVxyXG4gICAgICAgICAgLy8gYmVjYXVzZSBpdCBpcyBuZWVkZWQgYnkgbmdTdHlsZSB0byBjb21wdXRlIHRoZSB6SW5kZXggcHJvcGVydHkuXHJcbiAgICAgICAgICBtb2RhbC5zY29wZS4kJHRvcE1vZGFsSW5kZXggPSB0b3BNb2RhbEluZGV4O1xyXG4gICAgICAgIH1cclxuICAgICAgICAkYW5pbWF0ZS5lbnRlcigkY29tcGlsZShhbmd1bGFyRG9tRWwpKG1vZGFsLnNjb3BlKSwgYXBwZW5kVG9FbGVtZW50KTtcclxuXHJcbiAgICAgICAgb3BlbmVkV2luZG93cy50b3AoKS52YWx1ZS5tb2RhbERvbUVsID0gYW5ndWxhckRvbUVsO1xyXG4gICAgICAgIG9wZW5lZFdpbmRvd3MudG9wKCkudmFsdWUubW9kYWxPcGVuZXIgPSBtb2RhbE9wZW5lcjtcclxuXHJcbiAgICAgICAgYXBwbHlBcmlhSGlkZGVuKGFuZ3VsYXJEb21FbCk7XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGFwcGx5QXJpYUhpZGRlbihlbCkge1xyXG4gICAgICAgICAgaWYgKCFlbCB8fCBlbFswXS50YWdOYW1lID09PSAnQk9EWScpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIGdldFNpYmxpbmdzKGVsKS5mb3JFYWNoKGZ1bmN0aW9uKHNpYmxpbmcpIHtcclxuICAgICAgICAgICAgdmFyIGVsZW1Jc0FscmVhZHlIaWRkZW4gPSBzaWJsaW5nLmdldEF0dHJpYnV0ZSgnYXJpYS1oaWRkZW4nKSA9PT0gJ3RydWUnLFxyXG4gICAgICAgICAgICAgIGFyaWFIaWRkZW5Db3VudCA9IHBhcnNlSW50KHNpYmxpbmcuZ2V0QXR0cmlidXRlKEFSSUFfSElEREVOX0FUVFJJQlVURV9OQU1FKSwgMTApO1xyXG5cclxuICAgICAgICAgICAgaWYgKCFhcmlhSGlkZGVuQ291bnQpIHtcclxuICAgICAgICAgICAgICBhcmlhSGlkZGVuQ291bnQgPSBlbGVtSXNBbHJlYWR5SGlkZGVuID8gMSA6IDA7ICBcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgc2libGluZy5zZXRBdHRyaWJ1dGUoQVJJQV9ISURERU5fQVRUUklCVVRFX05BTUUsIGFyaWFIaWRkZW5Db3VudCArIDEpO1xyXG4gICAgICAgICAgICBzaWJsaW5nLnNldEF0dHJpYnV0ZSgnYXJpYS1oaWRkZW4nLCAndHJ1ZScpO1xyXG4gICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgcmV0dXJuIGFwcGx5QXJpYUhpZGRlbihlbC5wYXJlbnQoKSk7XHJcblxyXG4gICAgICAgICAgZnVuY3Rpb24gZ2V0U2libGluZ3MoZWwpIHtcclxuICAgICAgICAgICAgdmFyIGNoaWxkcmVuID0gZWwucGFyZW50KCkgPyBlbC5wYXJlbnQoKS5jaGlsZHJlbigpIDogW107XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gQXJyYXkucHJvdG90eXBlLmZpbHRlci5jYWxsKGNoaWxkcmVuLCBmdW5jdGlvbihjaGlsZCkge1xyXG4gICAgICAgICAgICAgIHJldHVybiBjaGlsZCAhPT0gZWxbMF07XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfTtcclxuXHJcbiAgICAgIGZ1bmN0aW9uIGJyb2FkY2FzdENsb3NpbmcobW9kYWxXaW5kb3csIHJlc3VsdE9yUmVhc29uLCBjbG9zaW5nKSB7XHJcbiAgICAgICAgcmV0dXJuICFtb2RhbFdpbmRvdy52YWx1ZS5tb2RhbFNjb3BlLiRicm9hZGNhc3QoJ21vZGFsLmNsb3NpbmcnLCByZXN1bHRPclJlYXNvbiwgY2xvc2luZykuZGVmYXVsdFByZXZlbnRlZDtcclxuICAgICAgfVxyXG5cclxuICAgICAgZnVuY3Rpb24gdW5oaWRlQmFja2dyb3VuZEVsZW1lbnRzKCkge1xyXG4gICAgICAgIEFycmF5LnByb3RvdHlwZS5mb3JFYWNoLmNhbGwoXHJcbiAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdbJyArIEFSSUFfSElEREVOX0FUVFJJQlVURV9OQU1FICsgJ10nKSxcclxuICAgICAgICAgIGZ1bmN0aW9uKGhpZGRlbkVsKSB7XHJcbiAgICAgICAgICAgIHZhciBhcmlhSGlkZGVuQ291bnQgPSBwYXJzZUludChoaWRkZW5FbC5nZXRBdHRyaWJ1dGUoQVJJQV9ISURERU5fQVRUUklCVVRFX05BTUUpLCAxMCksXHJcbiAgICAgICAgICAgICAgbmV3SGlkZGVuQ291bnQgPSBhcmlhSGlkZGVuQ291bnQgLSAxO1xyXG4gICAgICAgICAgICBoaWRkZW5FbC5zZXRBdHRyaWJ1dGUoQVJJQV9ISURERU5fQVRUUklCVVRFX05BTUUsIG5ld0hpZGRlbkNvdW50KTtcclxuXHJcbiAgICAgICAgICAgIGlmICghbmV3SGlkZGVuQ291bnQpIHtcclxuICAgICAgICAgICAgICBoaWRkZW5FbC5yZW1vdmVBdHRyaWJ1dGUoQVJJQV9ISURERU5fQVRUUklCVVRFX05BTUUpO1xyXG4gICAgICAgICAgICAgIGhpZGRlbkVsLnJlbW92ZUF0dHJpYnV0ZSgnYXJpYS1oaWRkZW4nKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICk7XHJcbiAgICAgIH1cclxuICAgICAgXHJcbiAgICAgICRtb2RhbFN0YWNrLmNsb3NlID0gZnVuY3Rpb24obW9kYWxJbnN0YW5jZSwgcmVzdWx0KSB7XHJcbiAgICAgICAgdmFyIG1vZGFsV2luZG93ID0gb3BlbmVkV2luZG93cy5nZXQobW9kYWxJbnN0YW5jZSk7XHJcbiAgICAgICAgdW5oaWRlQmFja2dyb3VuZEVsZW1lbnRzKCk7XHJcbiAgICAgICAgaWYgKG1vZGFsV2luZG93ICYmIGJyb2FkY2FzdENsb3NpbmcobW9kYWxXaW5kb3csIHJlc3VsdCwgdHJ1ZSkpIHtcclxuICAgICAgICAgIG1vZGFsV2luZG93LnZhbHVlLm1vZGFsU2NvcGUuJCR1aWJEZXN0cnVjdGlvblNjaGVkdWxlZCA9IHRydWU7XHJcbiAgICAgICAgICBtb2RhbFdpbmRvdy52YWx1ZS5kZWZlcnJlZC5yZXNvbHZlKHJlc3VsdCk7XHJcbiAgICAgICAgICByZW1vdmVNb2RhbFdpbmRvdyhtb2RhbEluc3RhbmNlLCBtb2RhbFdpbmRvdy52YWx1ZS5tb2RhbE9wZW5lcik7XHJcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiAhbW9kYWxXaW5kb3c7XHJcbiAgICAgIH07XHJcblxyXG4gICAgICAkbW9kYWxTdGFjay5kaXNtaXNzID0gZnVuY3Rpb24obW9kYWxJbnN0YW5jZSwgcmVhc29uKSB7XHJcbiAgICAgICAgdmFyIG1vZGFsV2luZG93ID0gb3BlbmVkV2luZG93cy5nZXQobW9kYWxJbnN0YW5jZSk7XHJcbiAgICAgICAgdW5oaWRlQmFja2dyb3VuZEVsZW1lbnRzKCk7XHJcbiAgICAgICAgaWYgKG1vZGFsV2luZG93ICYmIGJyb2FkY2FzdENsb3NpbmcobW9kYWxXaW5kb3csIHJlYXNvbiwgZmFsc2UpKSB7XHJcbiAgICAgICAgICBtb2RhbFdpbmRvdy52YWx1ZS5tb2RhbFNjb3BlLiQkdWliRGVzdHJ1Y3Rpb25TY2hlZHVsZWQgPSB0cnVlO1xyXG4gICAgICAgICAgbW9kYWxXaW5kb3cudmFsdWUuZGVmZXJyZWQucmVqZWN0KHJlYXNvbik7XHJcbiAgICAgICAgICByZW1vdmVNb2RhbFdpbmRvdyhtb2RhbEluc3RhbmNlLCBtb2RhbFdpbmRvdy52YWx1ZS5tb2RhbE9wZW5lcik7XHJcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuICFtb2RhbFdpbmRvdztcclxuICAgICAgfTtcclxuXHJcbiAgICAgICRtb2RhbFN0YWNrLmRpc21pc3NBbGwgPSBmdW5jdGlvbihyZWFzb24pIHtcclxuICAgICAgICB2YXIgdG9wTW9kYWwgPSB0aGlzLmdldFRvcCgpO1xyXG4gICAgICAgIHdoaWxlICh0b3BNb2RhbCAmJiB0aGlzLmRpc21pc3ModG9wTW9kYWwua2V5LCByZWFzb24pKSB7XHJcbiAgICAgICAgICB0b3BNb2RhbCA9IHRoaXMuZ2V0VG9wKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9O1xyXG5cclxuICAgICAgJG1vZGFsU3RhY2suZ2V0VG9wID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIG9wZW5lZFdpbmRvd3MudG9wKCk7XHJcbiAgICAgIH07XHJcblxyXG4gICAgICAkbW9kYWxTdGFjay5tb2RhbFJlbmRlcmVkID0gZnVuY3Rpb24obW9kYWxJbnN0YW5jZSkge1xyXG4gICAgICAgIHZhciBtb2RhbFdpbmRvdyA9IG9wZW5lZFdpbmRvd3MuZ2V0KG1vZGFsSW5zdGFuY2UpO1xyXG4gICAgICAgICRtb2RhbFN0YWNrLmZvY3VzRmlyc3RGb2N1c2FibGVFbGVtZW50KCRtb2RhbFN0YWNrLmxvYWRGb2N1c0VsZW1lbnRMaXN0KG1vZGFsV2luZG93KSk7XHJcbiAgICAgICAgaWYgKG1vZGFsV2luZG93KSB7XHJcbiAgICAgICAgICBtb2RhbFdpbmRvdy52YWx1ZS5yZW5kZXJEZWZlcnJlZC5yZXNvbHZlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9O1xyXG5cclxuICAgICAgJG1vZGFsU3RhY2suZm9jdXNGaXJzdEZvY3VzYWJsZUVsZW1lbnQgPSBmdW5jdGlvbihsaXN0KSB7XHJcbiAgICAgICAgaWYgKGxpc3QubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgbGlzdFswXS5mb2N1cygpO1xyXG4gICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgfTtcclxuXHJcbiAgICAgICRtb2RhbFN0YWNrLmZvY3VzTGFzdEZvY3VzYWJsZUVsZW1lbnQgPSBmdW5jdGlvbihsaXN0KSB7XHJcbiAgICAgICAgaWYgKGxpc3QubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgbGlzdFtsaXN0Lmxlbmd0aCAtIDFdLmZvY3VzKCk7XHJcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICB9O1xyXG5cclxuICAgICAgJG1vZGFsU3RhY2suaXNNb2RhbEZvY3VzZWQgPSBmdW5jdGlvbihldnQsIG1vZGFsV2luZG93KSB7XHJcbiAgICAgICAgaWYgKGV2dCAmJiBtb2RhbFdpbmRvdykge1xyXG4gICAgICAgICAgdmFyIG1vZGFsRG9tRWwgPSBtb2RhbFdpbmRvdy52YWx1ZS5tb2RhbERvbUVsO1xyXG4gICAgICAgICAgaWYgKG1vZGFsRG9tRWwgJiYgbW9kYWxEb21FbC5sZW5ndGgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIChldnQudGFyZ2V0IHx8IGV2dC5zcmNFbGVtZW50KSA9PT0gbW9kYWxEb21FbFswXTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICB9O1xyXG5cclxuICAgICAgJG1vZGFsU3RhY2suaXNGb2N1c0luRmlyc3RJdGVtID0gZnVuY3Rpb24oZXZ0LCBsaXN0KSB7XHJcbiAgICAgICAgaWYgKGxpc3QubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgcmV0dXJuIChldnQudGFyZ2V0IHx8IGV2dC5zcmNFbGVtZW50KSA9PT0gbGlzdFswXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICB9O1xyXG5cclxuICAgICAgJG1vZGFsU3RhY2suaXNGb2N1c0luTGFzdEl0ZW0gPSBmdW5jdGlvbihldnQsIGxpc3QpIHtcclxuICAgICAgICBpZiAobGlzdC5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICByZXR1cm4gKGV2dC50YXJnZXQgfHwgZXZ0LnNyY0VsZW1lbnQpID09PSBsaXN0W2xpc3QubGVuZ3RoIC0gMV07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgfTtcclxuXHJcbiAgICAgICRtb2RhbFN0YWNrLmxvYWRGb2N1c0VsZW1lbnRMaXN0ID0gZnVuY3Rpb24obW9kYWxXaW5kb3cpIHtcclxuICAgICAgICBpZiAobW9kYWxXaW5kb3cpIHtcclxuICAgICAgICAgIHZhciBtb2RhbERvbUUxID0gbW9kYWxXaW5kb3cudmFsdWUubW9kYWxEb21FbDtcclxuICAgICAgICAgIGlmIChtb2RhbERvbUUxICYmIG1vZGFsRG9tRTEubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIHZhciBlbGVtZW50cyA9IG1vZGFsRG9tRTFbMF0ucXVlcnlTZWxlY3RvckFsbCh0YWJiYWJsZVNlbGVjdG9yKTtcclxuICAgICAgICAgICAgcmV0dXJuIGVsZW1lbnRzID9cclxuICAgICAgICAgICAgICBBcnJheS5wcm90b3R5cGUuZmlsdGVyLmNhbGwoZWxlbWVudHMsIGZ1bmN0aW9uKGVsZW1lbnQpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBpc1Zpc2libGUoZWxlbWVudCk7XHJcbiAgICAgICAgICAgICAgfSkgOiBlbGVtZW50cztcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH07XHJcblxyXG4gICAgICByZXR1cm4gJG1vZGFsU3RhY2s7XHJcbiAgICB9XSlcclxuXHJcbiAgLnByb3ZpZGVyKCckdWliTW9kYWwnLCBmdW5jdGlvbigpIHtcclxuICAgIHZhciAkbW9kYWxQcm92aWRlciA9IHtcclxuICAgICAgb3B0aW9uczoge1xyXG4gICAgICAgIGFuaW1hdGlvbjogdHJ1ZSxcclxuICAgICAgICBiYWNrZHJvcDogdHJ1ZSwgLy9jYW4gYWxzbyBiZSBmYWxzZSBvciAnc3RhdGljJ1xyXG4gICAgICAgIGtleWJvYXJkOiB0cnVlXHJcbiAgICAgIH0sXHJcbiAgICAgICRnZXQ6IFsnJHJvb3RTY29wZScsICckcScsICckZG9jdW1lbnQnLCAnJHRlbXBsYXRlUmVxdWVzdCcsICckY29udHJvbGxlcicsICckdWliUmVzb2x2ZScsICckdWliTW9kYWxTdGFjaycsXHJcbiAgICAgICAgZnVuY3Rpb24gKCRyb290U2NvcGUsICRxLCAkZG9jdW1lbnQsICR0ZW1wbGF0ZVJlcXVlc3QsICRjb250cm9sbGVyLCAkdWliUmVzb2x2ZSwgJG1vZGFsU3RhY2spIHtcclxuICAgICAgICAgIHZhciAkbW9kYWwgPSB7fTtcclxuXHJcbiAgICAgICAgICBmdW5jdGlvbiBnZXRUZW1wbGF0ZVByb21pc2Uob3B0aW9ucykge1xyXG4gICAgICAgICAgICByZXR1cm4gb3B0aW9ucy50ZW1wbGF0ZSA/ICRxLndoZW4ob3B0aW9ucy50ZW1wbGF0ZSkgOlxyXG4gICAgICAgICAgICAgICR0ZW1wbGF0ZVJlcXVlc3QoYW5ndWxhci5pc0Z1bmN0aW9uKG9wdGlvbnMudGVtcGxhdGVVcmwpID9cclxuICAgICAgICAgICAgICAgIG9wdGlvbnMudGVtcGxhdGVVcmwoKSA6IG9wdGlvbnMudGVtcGxhdGVVcmwpO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIHZhciBwcm9taXNlQ2hhaW4gPSBudWxsO1xyXG4gICAgICAgICAgJG1vZGFsLmdldFByb21pc2VDaGFpbiA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzZUNoYWluO1xyXG4gICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAkbW9kYWwub3BlbiA9IGZ1bmN0aW9uKG1vZGFsT3B0aW9ucykge1xyXG4gICAgICAgICAgICB2YXIgbW9kYWxSZXN1bHREZWZlcnJlZCA9ICRxLmRlZmVyKCk7XHJcbiAgICAgICAgICAgIHZhciBtb2RhbE9wZW5lZERlZmVycmVkID0gJHEuZGVmZXIoKTtcclxuICAgICAgICAgICAgdmFyIG1vZGFsQ2xvc2VkRGVmZXJyZWQgPSAkcS5kZWZlcigpO1xyXG4gICAgICAgICAgICB2YXIgbW9kYWxSZW5kZXJEZWZlcnJlZCA9ICRxLmRlZmVyKCk7XHJcblxyXG4gICAgICAgICAgICAvL3ByZXBhcmUgYW4gaW5zdGFuY2Ugb2YgYSBtb2RhbCB0byBiZSBpbmplY3RlZCBpbnRvIGNvbnRyb2xsZXJzIGFuZCByZXR1cm5lZCB0byBhIGNhbGxlclxyXG4gICAgICAgICAgICB2YXIgbW9kYWxJbnN0YW5jZSA9IHtcclxuICAgICAgICAgICAgICByZXN1bHQ6IG1vZGFsUmVzdWx0RGVmZXJyZWQucHJvbWlzZSxcclxuICAgICAgICAgICAgICBvcGVuZWQ6IG1vZGFsT3BlbmVkRGVmZXJyZWQucHJvbWlzZSxcclxuICAgICAgICAgICAgICBjbG9zZWQ6IG1vZGFsQ2xvc2VkRGVmZXJyZWQucHJvbWlzZSxcclxuICAgICAgICAgICAgICByZW5kZXJlZDogbW9kYWxSZW5kZXJEZWZlcnJlZC5wcm9taXNlLFxyXG4gICAgICAgICAgICAgIGNsb3NlOiBmdW5jdGlvbiAocmVzdWx0KSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJG1vZGFsU3RhY2suY2xvc2UobW9kYWxJbnN0YW5jZSwgcmVzdWx0KTtcclxuICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgIGRpc21pc3M6IGZ1bmN0aW9uIChyZWFzb24pIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAkbW9kYWxTdGFjay5kaXNtaXNzKG1vZGFsSW5zdGFuY2UsIHJlYXNvbik7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgLy9tZXJnZSBhbmQgY2xlYW4gdXAgb3B0aW9uc1xyXG4gICAgICAgICAgICBtb2RhbE9wdGlvbnMgPSBhbmd1bGFyLmV4dGVuZCh7fSwgJG1vZGFsUHJvdmlkZXIub3B0aW9ucywgbW9kYWxPcHRpb25zKTtcclxuICAgICAgICAgICAgbW9kYWxPcHRpb25zLnJlc29sdmUgPSBtb2RhbE9wdGlvbnMucmVzb2x2ZSB8fCB7fTtcclxuICAgICAgICAgICAgbW9kYWxPcHRpb25zLmFwcGVuZFRvID0gbW9kYWxPcHRpb25zLmFwcGVuZFRvIHx8ICRkb2N1bWVudC5maW5kKCdib2R5JykuZXEoMCk7XHJcblxyXG4gICAgICAgICAgICAvL3ZlcmlmeSBvcHRpb25zXHJcbiAgICAgICAgICAgIGlmICghbW9kYWxPcHRpb25zLmNvbXBvbmVudCAmJiAhbW9kYWxPcHRpb25zLnRlbXBsYXRlICYmICFtb2RhbE9wdGlvbnMudGVtcGxhdGVVcmwpIHtcclxuICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ09uZSBvZiBjb21wb25lbnQgb3IgdGVtcGxhdGUgb3IgdGVtcGxhdGVVcmwgb3B0aW9ucyBpcyByZXF1aXJlZC4nKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdmFyIHRlbXBsYXRlQW5kUmVzb2x2ZVByb21pc2U7XHJcbiAgICAgICAgICAgIGlmIChtb2RhbE9wdGlvbnMuY29tcG9uZW50KSB7XHJcbiAgICAgICAgICAgICAgdGVtcGxhdGVBbmRSZXNvbHZlUHJvbWlzZSA9ICRxLndoZW4oJHVpYlJlc29sdmUucmVzb2x2ZShtb2RhbE9wdGlvbnMucmVzb2x2ZSwge30sIG51bGwsIG51bGwpKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICB0ZW1wbGF0ZUFuZFJlc29sdmVQcm9taXNlID1cclxuICAgICAgICAgICAgICAgICRxLmFsbChbZ2V0VGVtcGxhdGVQcm9taXNlKG1vZGFsT3B0aW9ucyksICR1aWJSZXNvbHZlLnJlc29sdmUobW9kYWxPcHRpb25zLnJlc29sdmUsIHt9LCBudWxsLCBudWxsKV0pO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiByZXNvbHZlV2l0aFRlbXBsYXRlKCkge1xyXG4gICAgICAgICAgICAgIHJldHVybiB0ZW1wbGF0ZUFuZFJlc29sdmVQcm9taXNlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBXYWl0IGZvciB0aGUgcmVzb2x1dGlvbiBvZiB0aGUgZXhpc3RpbmcgcHJvbWlzZSBjaGFpbi5cclxuICAgICAgICAgICAgLy8gVGhlbiBzd2l0Y2ggdG8gb3VyIG93biBjb21iaW5lZCBwcm9taXNlIGRlcGVuZGVuY3kgKHJlZ2FyZGxlc3Mgb2YgaG93IHRoZSBwcmV2aW91cyBtb2RhbCBmYXJlZCkuXHJcbiAgICAgICAgICAgIC8vIFRoZW4gYWRkIHRvICRtb2RhbFN0YWNrIGFuZCByZXNvbHZlIG9wZW5lZC5cclxuICAgICAgICAgICAgLy8gRmluYWxseSBjbGVhbiB1cCB0aGUgY2hhaW4gdmFyaWFibGUgaWYgbm8gc3Vic2VxdWVudCBtb2RhbCBoYXMgb3ZlcndyaXR0ZW4gaXQuXHJcbiAgICAgICAgICAgIHZhciBzYW1lUHJvbWlzZTtcclxuICAgICAgICAgICAgc2FtZVByb21pc2UgPSBwcm9taXNlQ2hhaW4gPSAkcS5hbGwoW3Byb21pc2VDaGFpbl0pXHJcbiAgICAgICAgICAgICAgLnRoZW4ocmVzb2x2ZVdpdGhUZW1wbGF0ZSwgcmVzb2x2ZVdpdGhUZW1wbGF0ZSlcclxuICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiByZXNvbHZlU3VjY2Vzcyh0cGxBbmRWYXJzKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgcHJvdmlkZWRTY29wZSA9IG1vZGFsT3B0aW9ucy5zY29wZSB8fCAkcm9vdFNjb3BlO1xyXG5cclxuICAgICAgICAgICAgICAgIHZhciBtb2RhbFNjb3BlID0gcHJvdmlkZWRTY29wZS4kbmV3KCk7XHJcbiAgICAgICAgICAgICAgICBtb2RhbFNjb3BlLiRjbG9zZSA9IG1vZGFsSW5zdGFuY2UuY2xvc2U7XHJcbiAgICAgICAgICAgICAgICBtb2RhbFNjb3BlLiRkaXNtaXNzID0gbW9kYWxJbnN0YW5jZS5kaXNtaXNzO1xyXG5cclxuICAgICAgICAgICAgICAgIG1vZGFsU2NvcGUuJG9uKCckZGVzdHJveScsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICBpZiAoIW1vZGFsU2NvcGUuJCR1aWJEZXN0cnVjdGlvblNjaGVkdWxlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIG1vZGFsU2NvcGUuJGRpc21pc3MoJyR1aWJVbnNjaGVkdWxlZERlc3RydWN0aW9uJyk7XHJcbiAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgIHZhciBtb2RhbCA9IHtcclxuICAgICAgICAgICAgICAgICAgc2NvcGU6IG1vZGFsU2NvcGUsXHJcbiAgICAgICAgICAgICAgICAgIGRlZmVycmVkOiBtb2RhbFJlc3VsdERlZmVycmVkLFxyXG4gICAgICAgICAgICAgICAgICByZW5kZXJEZWZlcnJlZDogbW9kYWxSZW5kZXJEZWZlcnJlZCxcclxuICAgICAgICAgICAgICAgICAgY2xvc2VkRGVmZXJyZWQ6IG1vZGFsQ2xvc2VkRGVmZXJyZWQsXHJcbiAgICAgICAgICAgICAgICAgIGFuaW1hdGlvbjogbW9kYWxPcHRpb25zLmFuaW1hdGlvbixcclxuICAgICAgICAgICAgICAgICAgYmFja2Ryb3A6IG1vZGFsT3B0aW9ucy5iYWNrZHJvcCxcclxuICAgICAgICAgICAgICAgICAga2V5Ym9hcmQ6IG1vZGFsT3B0aW9ucy5rZXlib2FyZCxcclxuICAgICAgICAgICAgICAgICAgYmFja2Ryb3BDbGFzczogbW9kYWxPcHRpb25zLmJhY2tkcm9wQ2xhc3MsXHJcbiAgICAgICAgICAgICAgICAgIHdpbmRvd1RvcENsYXNzOiBtb2RhbE9wdGlvbnMud2luZG93VG9wQ2xhc3MsXHJcbiAgICAgICAgICAgICAgICAgIHdpbmRvd0NsYXNzOiBtb2RhbE9wdGlvbnMud2luZG93Q2xhc3MsXHJcbiAgICAgICAgICAgICAgICAgIHdpbmRvd1RlbXBsYXRlVXJsOiBtb2RhbE9wdGlvbnMud2luZG93VGVtcGxhdGVVcmwsXHJcbiAgICAgICAgICAgICAgICAgIGFyaWFMYWJlbGxlZEJ5OiBtb2RhbE9wdGlvbnMuYXJpYUxhYmVsbGVkQnksXHJcbiAgICAgICAgICAgICAgICAgIGFyaWFEZXNjcmliZWRCeTogbW9kYWxPcHRpb25zLmFyaWFEZXNjcmliZWRCeSxcclxuICAgICAgICAgICAgICAgICAgc2l6ZTogbW9kYWxPcHRpb25zLnNpemUsXHJcbiAgICAgICAgICAgICAgICAgIG9wZW5lZENsYXNzOiBtb2RhbE9wdGlvbnMub3BlbmVkQ2xhc3MsXHJcbiAgICAgICAgICAgICAgICAgIGFwcGVuZFRvOiBtb2RhbE9wdGlvbnMuYXBwZW5kVG9cclxuICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgdmFyIGNvbXBvbmVudCA9IHt9O1xyXG4gICAgICAgICAgICAgICAgdmFyIGN0cmxJbnN0YW5jZSwgY3RybEluc3RhbnRpYXRlLCBjdHJsTG9jYWxzID0ge307XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKG1vZGFsT3B0aW9ucy5jb21wb25lbnQpIHtcclxuICAgICAgICAgICAgICAgICAgY29uc3RydWN0TG9jYWxzKGNvbXBvbmVudCwgZmFsc2UsIHRydWUsIGZhbHNlKTtcclxuICAgICAgICAgICAgICAgICAgY29tcG9uZW50Lm5hbWUgPSBtb2RhbE9wdGlvbnMuY29tcG9uZW50O1xyXG4gICAgICAgICAgICAgICAgICBtb2RhbC5jb21wb25lbnQgPSBjb21wb25lbnQ7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKG1vZGFsT3B0aW9ucy5jb250cm9sbGVyKSB7XHJcbiAgICAgICAgICAgICAgICAgIGNvbnN0cnVjdExvY2FscyhjdHJsTG9jYWxzLCB0cnVlLCBmYWxzZSwgdHJ1ZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAvLyB0aGUgdGhpcmQgcGFyYW0gd2lsbCBtYWtlIHRoZSBjb250cm9sbGVyIGluc3RhbnRpYXRlIGxhdGVyLHByaXZhdGUgYXBpXHJcbiAgICAgICAgICAgICAgICAgIC8vIEBzZWUgaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvYW5ndWxhci5qcy9ibG9iL21hc3Rlci9zcmMvbmcvY29udHJvbGxlci5qcyNMMTI2XHJcbiAgICAgICAgICAgICAgICAgIGN0cmxJbnN0YW50aWF0ZSA9ICRjb250cm9sbGVyKG1vZGFsT3B0aW9ucy5jb250cm9sbGVyLCBjdHJsTG9jYWxzLCB0cnVlLCBtb2RhbE9wdGlvbnMuY29udHJvbGxlckFzKTtcclxuICAgICAgICAgICAgICAgICAgaWYgKG1vZGFsT3B0aW9ucy5jb250cm9sbGVyQXMgJiYgbW9kYWxPcHRpb25zLmJpbmRUb0NvbnRyb2xsZXIpIHtcclxuICAgICAgICAgICAgICAgICAgICBjdHJsSW5zdGFuY2UgPSBjdHJsSW5zdGFudGlhdGUuaW5zdGFuY2U7XHJcbiAgICAgICAgICAgICAgICAgICAgY3RybEluc3RhbmNlLiRjbG9zZSA9IG1vZGFsU2NvcGUuJGNsb3NlO1xyXG4gICAgICAgICAgICAgICAgICAgIGN0cmxJbnN0YW5jZS4kZGlzbWlzcyA9IG1vZGFsU2NvcGUuJGRpc21pc3M7XHJcbiAgICAgICAgICAgICAgICAgICAgYW5ndWxhci5leHRlbmQoY3RybEluc3RhbmNlLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAkcmVzb2x2ZTogY3RybExvY2Fscy4kc2NvcGUuJHJlc29sdmVcclxuICAgICAgICAgICAgICAgICAgICB9LCBwcm92aWRlZFNjb3BlKTtcclxuICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgY3RybEluc3RhbmNlID0gY3RybEluc3RhbnRpYXRlKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICBpZiAoYW5ndWxhci5pc0Z1bmN0aW9uKGN0cmxJbnN0YW5jZS4kb25Jbml0KSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGN0cmxJbnN0YW5jZS4kb25Jbml0KCk7XHJcbiAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoIW1vZGFsT3B0aW9ucy5jb21wb25lbnQpIHtcclxuICAgICAgICAgICAgICAgICAgbW9kYWwuY29udGVudCA9IHRwbEFuZFZhcnNbMF07XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgJG1vZGFsU3RhY2sub3Blbihtb2RhbEluc3RhbmNlLCBtb2RhbCk7XHJcbiAgICAgICAgICAgICAgICBtb2RhbE9wZW5lZERlZmVycmVkLnJlc29sdmUodHJ1ZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gY29uc3RydWN0TG9jYWxzKG9iaiwgdGVtcGxhdGUsIGluc3RhbmNlT25TY29wZSwgaW5qZWN0YWJsZSkge1xyXG4gICAgICAgICAgICAgICAgICBvYmouJHNjb3BlID0gbW9kYWxTY29wZTtcclxuICAgICAgICAgICAgICAgICAgb2JqLiRzY29wZS4kcmVzb2x2ZSA9IHt9O1xyXG4gICAgICAgICAgICAgICAgICBpZiAoaW5zdGFuY2VPblNjb3BlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgb2JqLiRzY29wZS4kdWliTW9kYWxJbnN0YW5jZSA9IG1vZGFsSW5zdGFuY2U7XHJcbiAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgb2JqLiR1aWJNb2RhbEluc3RhbmNlID0gbW9kYWxJbnN0YW5jZTtcclxuICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgdmFyIHJlc29sdmVzID0gdGVtcGxhdGUgPyB0cGxBbmRWYXJzWzFdIDogdHBsQW5kVmFycztcclxuICAgICAgICAgICAgICAgICAgYW5ndWxhci5mb3JFYWNoKHJlc29sdmVzLCBmdW5jdGlvbih2YWx1ZSwga2V5KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGluamVjdGFibGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgIG9ialtrZXldID0gdmFsdWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBvYmouJHNjb3BlLiRyZXNvbHZlW2tleV0gPSB2YWx1ZTtcclxuICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uIHJlc29sdmVFcnJvcihyZWFzb24pIHtcclxuICAgICAgICAgICAgICBtb2RhbE9wZW5lZERlZmVycmVkLnJlamVjdChyZWFzb24pO1xyXG4gICAgICAgICAgICAgIG1vZGFsUmVzdWx0RGVmZXJyZWQucmVqZWN0KHJlYXNvbik7XHJcbiAgICAgICAgICAgIH0pWydmaW5hbGx5J10oZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgaWYgKHByb21pc2VDaGFpbiA9PT0gc2FtZVByb21pc2UpIHtcclxuICAgICAgICAgICAgICAgIHByb21pc2VDaGFpbiA9IG51bGw7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBtb2RhbEluc3RhbmNlO1xyXG4gICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICByZXR1cm4gJG1vZGFsO1xyXG4gICAgICAgIH1cclxuICAgICAgXVxyXG4gICAgfTtcclxuXHJcbiAgICByZXR1cm4gJG1vZGFsUHJvdmlkZXI7XHJcbiAgfSk7XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgndWkuYm9vdHN0cmFwLnBhZ2luZycsIFtdKVxyXG4vKipcclxuICogSGVscGVyIGludGVybmFsIHNlcnZpY2UgZm9yIGdlbmVyYXRpbmcgY29tbW9uIGNvbnRyb2xsZXIgY29kZSBiZXR3ZWVuIHRoZVxyXG4gKiBwYWdlciBhbmQgcGFnaW5hdGlvbiBjb21wb25lbnRzXHJcbiAqL1xyXG4uZmFjdG9yeSgndWliUGFnaW5nJywgWyckcGFyc2UnLCBmdW5jdGlvbigkcGFyc2UpIHtcclxuICByZXR1cm4ge1xyXG4gICAgY3JlYXRlOiBmdW5jdGlvbihjdHJsLCAkc2NvcGUsICRhdHRycykge1xyXG4gICAgICBjdHJsLnNldE51bVBhZ2VzID0gJGF0dHJzLm51bVBhZ2VzID8gJHBhcnNlKCRhdHRycy5udW1QYWdlcykuYXNzaWduIDogYW5ndWxhci5ub29wO1xyXG4gICAgICBjdHJsLm5nTW9kZWxDdHJsID0geyAkc2V0Vmlld1ZhbHVlOiBhbmd1bGFyLm5vb3AgfTsgLy8gbnVsbE1vZGVsQ3RybFxyXG4gICAgICBjdHJsLl93YXRjaGVycyA9IFtdO1xyXG5cclxuICAgICAgY3RybC5pbml0ID0gZnVuY3Rpb24obmdNb2RlbEN0cmwsIGNvbmZpZykge1xyXG4gICAgICAgIGN0cmwubmdNb2RlbEN0cmwgPSBuZ01vZGVsQ3RybDtcclxuICAgICAgICBjdHJsLmNvbmZpZyA9IGNvbmZpZztcclxuXHJcbiAgICAgICAgbmdNb2RlbEN0cmwuJHJlbmRlciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgY3RybC5yZW5kZXIoKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBpZiAoJGF0dHJzLml0ZW1zUGVyUGFnZSkge1xyXG4gICAgICAgICAgY3RybC5fd2F0Y2hlcnMucHVzaCgkc2NvcGUuJHBhcmVudC4kd2F0Y2goJGF0dHJzLml0ZW1zUGVyUGFnZSwgZnVuY3Rpb24odmFsdWUpIHtcclxuICAgICAgICAgICAgY3RybC5pdGVtc1BlclBhZ2UgPSBwYXJzZUludCh2YWx1ZSwgMTApO1xyXG4gICAgICAgICAgICAkc2NvcGUudG90YWxQYWdlcyA9IGN0cmwuY2FsY3VsYXRlVG90YWxQYWdlcygpO1xyXG4gICAgICAgICAgICBjdHJsLnVwZGF0ZVBhZ2UoKTtcclxuICAgICAgICAgIH0pKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgY3RybC5pdGVtc1BlclBhZ2UgPSBjb25maWcuaXRlbXNQZXJQYWdlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgJHNjb3BlLiR3YXRjaCgndG90YWxJdGVtcycsIGZ1bmN0aW9uKG5ld1RvdGFsLCBvbGRUb3RhbCkge1xyXG4gICAgICAgICAgaWYgKGFuZ3VsYXIuaXNEZWZpbmVkKG5ld1RvdGFsKSB8fCBuZXdUb3RhbCAhPT0gb2xkVG90YWwpIHtcclxuICAgICAgICAgICAgJHNjb3BlLnRvdGFsUGFnZXMgPSBjdHJsLmNhbGN1bGF0ZVRvdGFsUGFnZXMoKTtcclxuICAgICAgICAgICAgY3RybC51cGRhdGVQYWdlKCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH07XHJcblxyXG4gICAgICBjdHJsLmNhbGN1bGF0ZVRvdGFsUGFnZXMgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgdG90YWxQYWdlcyA9IGN0cmwuaXRlbXNQZXJQYWdlIDwgMSA/IDEgOiBNYXRoLmNlaWwoJHNjb3BlLnRvdGFsSXRlbXMgLyBjdHJsLml0ZW1zUGVyUGFnZSk7XHJcbiAgICAgICAgcmV0dXJuIE1hdGgubWF4KHRvdGFsUGFnZXMgfHwgMCwgMSk7XHJcbiAgICAgIH07XHJcblxyXG4gICAgICBjdHJsLnJlbmRlciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICRzY29wZS5wYWdlID0gcGFyc2VJbnQoY3RybC5uZ01vZGVsQ3RybC4kdmlld1ZhbHVlLCAxMCkgfHwgMTtcclxuICAgICAgfTtcclxuXHJcbiAgICAgICRzY29wZS5zZWxlY3RQYWdlID0gZnVuY3Rpb24ocGFnZSwgZXZ0KSB7XHJcbiAgICAgICAgaWYgKGV2dCkge1xyXG4gICAgICAgICAgZXZ0LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2YXIgY2xpY2tBbGxvd2VkID0gISRzY29wZS5uZ0Rpc2FibGVkIHx8ICFldnQ7XHJcbiAgICAgICAgaWYgKGNsaWNrQWxsb3dlZCAmJiAkc2NvcGUucGFnZSAhPT0gcGFnZSAmJiBwYWdlID4gMCAmJiBwYWdlIDw9ICRzY29wZS50b3RhbFBhZ2VzKSB7XHJcbiAgICAgICAgICBpZiAoZXZ0ICYmIGV2dC50YXJnZXQpIHtcclxuICAgICAgICAgICAgZXZ0LnRhcmdldC5ibHVyKCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBjdHJsLm5nTW9kZWxDdHJsLiRzZXRWaWV3VmFsdWUocGFnZSk7XHJcbiAgICAgICAgICBjdHJsLm5nTW9kZWxDdHJsLiRyZW5kZXIoKTtcclxuICAgICAgICB9XHJcbiAgICAgIH07XHJcblxyXG4gICAgICAkc2NvcGUuZ2V0VGV4dCA9IGZ1bmN0aW9uKGtleSkge1xyXG4gICAgICAgIHJldHVybiAkc2NvcGVba2V5ICsgJ1RleHQnXSB8fCBjdHJsLmNvbmZpZ1trZXkgKyAnVGV4dCddO1xyXG4gICAgICB9O1xyXG5cclxuICAgICAgJHNjb3BlLm5vUHJldmlvdXMgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICByZXR1cm4gJHNjb3BlLnBhZ2UgPT09IDE7XHJcbiAgICAgIH07XHJcblxyXG4gICAgICAkc2NvcGUubm9OZXh0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuICRzY29wZS5wYWdlID09PSAkc2NvcGUudG90YWxQYWdlcztcclxuICAgICAgfTtcclxuXHJcbiAgICAgIGN0cmwudXBkYXRlUGFnZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGN0cmwuc2V0TnVtUGFnZXMoJHNjb3BlLiRwYXJlbnQsICRzY29wZS50b3RhbFBhZ2VzKTsgLy8gUmVhZG9ubHkgdmFyaWFibGVcclxuXHJcbiAgICAgICAgaWYgKCRzY29wZS5wYWdlID4gJHNjb3BlLnRvdGFsUGFnZXMpIHtcclxuICAgICAgICAgICRzY29wZS5zZWxlY3RQYWdlKCRzY29wZS50b3RhbFBhZ2VzKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgY3RybC5uZ01vZGVsQ3RybC4kcmVuZGVyKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9O1xyXG5cclxuICAgICAgJHNjb3BlLiRvbignJGRlc3Ryb3knLCBmdW5jdGlvbigpIHtcclxuICAgICAgICB3aGlsZSAoY3RybC5fd2F0Y2hlcnMubGVuZ3RoKSB7XHJcbiAgICAgICAgICBjdHJsLl93YXRjaGVycy5zaGlmdCgpKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgIH1cclxuICB9O1xyXG59XSk7XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgndWkuYm9vdHN0cmFwLnBhZ2VyJywgWyd1aS5ib290c3RyYXAucGFnaW5nJywgJ3VpLmJvb3RzdHJhcC50YWJpbmRleCddKVxyXG5cclxuLmNvbnRyb2xsZXIoJ1VpYlBhZ2VyQ29udHJvbGxlcicsIFsnJHNjb3BlJywgJyRhdHRycycsICd1aWJQYWdpbmcnLCAndWliUGFnZXJDb25maWcnLCBmdW5jdGlvbigkc2NvcGUsICRhdHRycywgdWliUGFnaW5nLCB1aWJQYWdlckNvbmZpZykge1xyXG4gICRzY29wZS5hbGlnbiA9IGFuZ3VsYXIuaXNEZWZpbmVkKCRhdHRycy5hbGlnbikgPyAkc2NvcGUuJHBhcmVudC4kZXZhbCgkYXR0cnMuYWxpZ24pIDogdWliUGFnZXJDb25maWcuYWxpZ247XHJcblxyXG4gIHVpYlBhZ2luZy5jcmVhdGUodGhpcywgJHNjb3BlLCAkYXR0cnMpO1xyXG59XSlcclxuXHJcbi5jb25zdGFudCgndWliUGFnZXJDb25maWcnLCB7XHJcbiAgaXRlbXNQZXJQYWdlOiAxMCxcclxuICBwcmV2aW91c1RleHQ6ICfCqyBQcmV2aW91cycsXHJcbiAgbmV4dFRleHQ6ICdOZXh0IMK7JyxcclxuICBhbGlnbjogdHJ1ZVxyXG59KVxyXG5cclxuLmRpcmVjdGl2ZSgndWliUGFnZXInLCBbJ3VpYlBhZ2VyQ29uZmlnJywgZnVuY3Rpb24odWliUGFnZXJDb25maWcpIHtcclxuICByZXR1cm4ge1xyXG4gICAgc2NvcGU6IHtcclxuICAgICAgdG90YWxJdGVtczogJz0nLFxyXG4gICAgICBwcmV2aW91c1RleHQ6ICdAJyxcclxuICAgICAgbmV4dFRleHQ6ICdAJyxcclxuICAgICAgbmdEaXNhYmxlZDogJz0nXHJcbiAgICB9LFxyXG4gICAgcmVxdWlyZTogWyd1aWJQYWdlcicsICc/bmdNb2RlbCddLFxyXG4gICAgcmVzdHJpY3Q6ICdBJyxcclxuICAgIGNvbnRyb2xsZXI6ICdVaWJQYWdlckNvbnRyb2xsZXInLFxyXG4gICAgY29udHJvbGxlckFzOiAncGFnZXInLFxyXG4gICAgdGVtcGxhdGVVcmw6IGZ1bmN0aW9uKGVsZW1lbnQsIGF0dHJzKSB7XHJcbiAgICAgIHJldHVybiBhdHRycy50ZW1wbGF0ZVVybCB8fCAndWliL3RlbXBsYXRlL3BhZ2VyL3BhZ2VyLmh0bWwnO1xyXG4gICAgfSxcclxuICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBlbGVtZW50LCBhdHRycywgY3RybHMpIHtcclxuICAgICAgZWxlbWVudC5hZGRDbGFzcygncGFnZXInKTtcclxuICAgICAgdmFyIHBhZ2luYXRpb25DdHJsID0gY3RybHNbMF0sIG5nTW9kZWxDdHJsID0gY3RybHNbMV07XHJcblxyXG4gICAgICBpZiAoIW5nTW9kZWxDdHJsKSB7XHJcbiAgICAgICAgcmV0dXJuOyAvLyBkbyBub3RoaW5nIGlmIG5vIG5nLW1vZGVsXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHBhZ2luYXRpb25DdHJsLmluaXQobmdNb2RlbEN0cmwsIHVpYlBhZ2VyQ29uZmlnKTtcclxuICAgIH1cclxuICB9O1xyXG59XSk7XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgndWkuYm9vdHN0cmFwLnBhZ2luYXRpb24nLCBbJ3VpLmJvb3RzdHJhcC5wYWdpbmcnLCAndWkuYm9vdHN0cmFwLnRhYmluZGV4J10pXHJcbi5jb250cm9sbGVyKCdVaWJQYWdpbmF0aW9uQ29udHJvbGxlcicsIFsnJHNjb3BlJywgJyRhdHRycycsICckcGFyc2UnLCAndWliUGFnaW5nJywgJ3VpYlBhZ2luYXRpb25Db25maWcnLCBmdW5jdGlvbigkc2NvcGUsICRhdHRycywgJHBhcnNlLCB1aWJQYWdpbmcsIHVpYlBhZ2luYXRpb25Db25maWcpIHtcclxuICB2YXIgY3RybCA9IHRoaXM7XHJcbiAgLy8gU2V0dXAgY29uZmlndXJhdGlvbiBwYXJhbWV0ZXJzXHJcbiAgdmFyIG1heFNpemUgPSBhbmd1bGFyLmlzRGVmaW5lZCgkYXR0cnMubWF4U2l6ZSkgPyAkc2NvcGUuJHBhcmVudC4kZXZhbCgkYXR0cnMubWF4U2l6ZSkgOiB1aWJQYWdpbmF0aW9uQ29uZmlnLm1heFNpemUsXHJcbiAgICByb3RhdGUgPSBhbmd1bGFyLmlzRGVmaW5lZCgkYXR0cnMucm90YXRlKSA/ICRzY29wZS4kcGFyZW50LiRldmFsKCRhdHRycy5yb3RhdGUpIDogdWliUGFnaW5hdGlvbkNvbmZpZy5yb3RhdGUsXHJcbiAgICBmb3JjZUVsbGlwc2VzID0gYW5ndWxhci5pc0RlZmluZWQoJGF0dHJzLmZvcmNlRWxsaXBzZXMpID8gJHNjb3BlLiRwYXJlbnQuJGV2YWwoJGF0dHJzLmZvcmNlRWxsaXBzZXMpIDogdWliUGFnaW5hdGlvbkNvbmZpZy5mb3JjZUVsbGlwc2VzLFxyXG4gICAgYm91bmRhcnlMaW5rTnVtYmVycyA9IGFuZ3VsYXIuaXNEZWZpbmVkKCRhdHRycy5ib3VuZGFyeUxpbmtOdW1iZXJzKSA/ICRzY29wZS4kcGFyZW50LiRldmFsKCRhdHRycy5ib3VuZGFyeUxpbmtOdW1iZXJzKSA6IHVpYlBhZ2luYXRpb25Db25maWcuYm91bmRhcnlMaW5rTnVtYmVycyxcclxuICAgIHBhZ2VMYWJlbCA9IGFuZ3VsYXIuaXNEZWZpbmVkKCRhdHRycy5wYWdlTGFiZWwpID8gZnVuY3Rpb24oaWR4KSB7IHJldHVybiAkc2NvcGUuJHBhcmVudC4kZXZhbCgkYXR0cnMucGFnZUxhYmVsLCB7JHBhZ2U6IGlkeH0pOyB9IDogYW5ndWxhci5pZGVudGl0eTtcclxuICAkc2NvcGUuYm91bmRhcnlMaW5rcyA9IGFuZ3VsYXIuaXNEZWZpbmVkKCRhdHRycy5ib3VuZGFyeUxpbmtzKSA/ICRzY29wZS4kcGFyZW50LiRldmFsKCRhdHRycy5ib3VuZGFyeUxpbmtzKSA6IHVpYlBhZ2luYXRpb25Db25maWcuYm91bmRhcnlMaW5rcztcclxuICAkc2NvcGUuZGlyZWN0aW9uTGlua3MgPSBhbmd1bGFyLmlzRGVmaW5lZCgkYXR0cnMuZGlyZWN0aW9uTGlua3MpID8gJHNjb3BlLiRwYXJlbnQuJGV2YWwoJGF0dHJzLmRpcmVjdGlvbkxpbmtzKSA6IHVpYlBhZ2luYXRpb25Db25maWcuZGlyZWN0aW9uTGlua3M7XHJcblxyXG4gIHVpYlBhZ2luZy5jcmVhdGUodGhpcywgJHNjb3BlLCAkYXR0cnMpO1xyXG5cclxuICBpZiAoJGF0dHJzLm1heFNpemUpIHtcclxuICAgIGN0cmwuX3dhdGNoZXJzLnB1c2goJHNjb3BlLiRwYXJlbnQuJHdhdGNoKCRwYXJzZSgkYXR0cnMubWF4U2l6ZSksIGZ1bmN0aW9uKHZhbHVlKSB7XHJcbiAgICAgIG1heFNpemUgPSBwYXJzZUludCh2YWx1ZSwgMTApO1xyXG4gICAgICBjdHJsLnJlbmRlcigpO1xyXG4gICAgfSkpO1xyXG4gIH1cclxuXHJcbiAgLy8gQ3JlYXRlIHBhZ2Ugb2JqZWN0IHVzZWQgaW4gdGVtcGxhdGVcclxuICBmdW5jdGlvbiBtYWtlUGFnZShudW1iZXIsIHRleHQsIGlzQWN0aXZlKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBudW1iZXI6IG51bWJlcixcclxuICAgICAgdGV4dDogdGV4dCxcclxuICAgICAgYWN0aXZlOiBpc0FjdGl2ZVxyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGdldFBhZ2VzKGN1cnJlbnRQYWdlLCB0b3RhbFBhZ2VzKSB7XHJcbiAgICB2YXIgcGFnZXMgPSBbXTtcclxuXHJcbiAgICAvLyBEZWZhdWx0IHBhZ2UgbGltaXRzXHJcbiAgICB2YXIgc3RhcnRQYWdlID0gMSwgZW5kUGFnZSA9IHRvdGFsUGFnZXM7XHJcbiAgICB2YXIgaXNNYXhTaXplZCA9IGFuZ3VsYXIuaXNEZWZpbmVkKG1heFNpemUpICYmIG1heFNpemUgPCB0b3RhbFBhZ2VzO1xyXG5cclxuICAgIC8vIHJlY29tcHV0ZSBpZiBtYXhTaXplXHJcbiAgICBpZiAoaXNNYXhTaXplZCkge1xyXG4gICAgICBpZiAocm90YXRlKSB7XHJcbiAgICAgICAgLy8gQ3VycmVudCBwYWdlIGlzIGRpc3BsYXllZCBpbiB0aGUgbWlkZGxlIG9mIHRoZSB2aXNpYmxlIG9uZXNcclxuICAgICAgICBzdGFydFBhZ2UgPSBNYXRoLm1heChjdXJyZW50UGFnZSAtIE1hdGguZmxvb3IobWF4U2l6ZSAvIDIpLCAxKTtcclxuICAgICAgICBlbmRQYWdlID0gc3RhcnRQYWdlICsgbWF4U2l6ZSAtIDE7XHJcblxyXG4gICAgICAgIC8vIEFkanVzdCBpZiBsaW1pdCBpcyBleGNlZWRlZFxyXG4gICAgICAgIGlmIChlbmRQYWdlID4gdG90YWxQYWdlcykge1xyXG4gICAgICAgICAgZW5kUGFnZSA9IHRvdGFsUGFnZXM7XHJcbiAgICAgICAgICBzdGFydFBhZ2UgPSBlbmRQYWdlIC0gbWF4U2l6ZSArIDE7XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIC8vIFZpc2libGUgcGFnZXMgYXJlIHBhZ2luYXRlZCB3aXRoIG1heFNpemVcclxuICAgICAgICBzdGFydFBhZ2UgPSAoTWF0aC5jZWlsKGN1cnJlbnRQYWdlIC8gbWF4U2l6ZSkgLSAxKSAqIG1heFNpemUgKyAxO1xyXG5cclxuICAgICAgICAvLyBBZGp1c3QgbGFzdCBwYWdlIGlmIGxpbWl0IGlzIGV4Y2VlZGVkXHJcbiAgICAgICAgZW5kUGFnZSA9IE1hdGgubWluKHN0YXJ0UGFnZSArIG1heFNpemUgLSAxLCB0b3RhbFBhZ2VzKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIEFkZCBwYWdlIG51bWJlciBsaW5rc1xyXG4gICAgZm9yICh2YXIgbnVtYmVyID0gc3RhcnRQYWdlOyBudW1iZXIgPD0gZW5kUGFnZTsgbnVtYmVyKyspIHtcclxuICAgICAgdmFyIHBhZ2UgPSBtYWtlUGFnZShudW1iZXIsIHBhZ2VMYWJlbChudW1iZXIpLCBudW1iZXIgPT09IGN1cnJlbnRQYWdlKTtcclxuICAgICAgcGFnZXMucHVzaChwYWdlKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBBZGQgbGlua3MgdG8gbW92ZSBiZXR3ZWVuIHBhZ2Ugc2V0c1xyXG4gICAgaWYgKGlzTWF4U2l6ZWQgJiYgbWF4U2l6ZSA+IDAgJiYgKCFyb3RhdGUgfHwgZm9yY2VFbGxpcHNlcyB8fCBib3VuZGFyeUxpbmtOdW1iZXJzKSkge1xyXG4gICAgICBpZiAoc3RhcnRQYWdlID4gMSkge1xyXG4gICAgICAgIGlmICghYm91bmRhcnlMaW5rTnVtYmVycyB8fCBzdGFydFBhZ2UgPiAzKSB7IC8vbmVlZCBlbGxpcHNpcyBmb3IgYWxsIG9wdGlvbnMgdW5sZXNzIHJhbmdlIGlzIHRvbyBjbG9zZSB0byBiZWdpbm5pbmdcclxuICAgICAgICB2YXIgcHJldmlvdXNQYWdlU2V0ID0gbWFrZVBhZ2Uoc3RhcnRQYWdlIC0gMSwgJy4uLicsIGZhbHNlKTtcclxuICAgICAgICBwYWdlcy51bnNoaWZ0KHByZXZpb3VzUGFnZVNldCk7XHJcbiAgICAgIH1cclxuICAgICAgICBpZiAoYm91bmRhcnlMaW5rTnVtYmVycykge1xyXG4gICAgICAgICAgaWYgKHN0YXJ0UGFnZSA9PT0gMykgeyAvL25lZWQgdG8gcmVwbGFjZSBlbGxpcHNpcyB3aGVuIHRoZSBidXR0b25zIHdvdWxkIGJlIHNlcXVlbnRpYWxcclxuICAgICAgICAgICAgdmFyIHNlY29uZFBhZ2VMaW5rID0gbWFrZVBhZ2UoMiwgJzInLCBmYWxzZSk7XHJcbiAgICAgICAgICAgIHBhZ2VzLnVuc2hpZnQoc2Vjb25kUGFnZUxpbmspO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgLy9hZGQgdGhlIGZpcnN0IHBhZ2VcclxuICAgICAgICAgIHZhciBmaXJzdFBhZ2VMaW5rID0gbWFrZVBhZ2UoMSwgJzEnLCBmYWxzZSk7XHJcbiAgICAgICAgICBwYWdlcy51bnNoaWZ0KGZpcnN0UGFnZUxpbmspO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKGVuZFBhZ2UgPCB0b3RhbFBhZ2VzKSB7XHJcbiAgICAgICAgaWYgKCFib3VuZGFyeUxpbmtOdW1iZXJzIHx8IGVuZFBhZ2UgPCB0b3RhbFBhZ2VzIC0gMikgeyAvL25lZWQgZWxsaXBzaXMgZm9yIGFsbCBvcHRpb25zIHVubGVzcyByYW5nZSBpcyB0b28gY2xvc2UgdG8gZW5kXHJcbiAgICAgICAgdmFyIG5leHRQYWdlU2V0ID0gbWFrZVBhZ2UoZW5kUGFnZSArIDEsICcuLi4nLCBmYWxzZSk7XHJcbiAgICAgICAgcGFnZXMucHVzaChuZXh0UGFnZVNldCk7XHJcbiAgICAgIH1cclxuICAgICAgICBpZiAoYm91bmRhcnlMaW5rTnVtYmVycykge1xyXG4gICAgICAgICAgaWYgKGVuZFBhZ2UgPT09IHRvdGFsUGFnZXMgLSAyKSB7IC8vbmVlZCB0byByZXBsYWNlIGVsbGlwc2lzIHdoZW4gdGhlIGJ1dHRvbnMgd291bGQgYmUgc2VxdWVudGlhbFxyXG4gICAgICAgICAgICB2YXIgc2Vjb25kVG9MYXN0UGFnZUxpbmsgPSBtYWtlUGFnZSh0b3RhbFBhZ2VzIC0gMSwgdG90YWxQYWdlcyAtIDEsIGZhbHNlKTtcclxuICAgICAgICAgICAgcGFnZXMucHVzaChzZWNvbmRUb0xhc3RQYWdlTGluayk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICAvL2FkZCB0aGUgbGFzdCBwYWdlXHJcbiAgICAgICAgICB2YXIgbGFzdFBhZ2VMaW5rID0gbWFrZVBhZ2UodG90YWxQYWdlcywgdG90YWxQYWdlcywgZmFsc2UpO1xyXG4gICAgICAgICAgcGFnZXMucHVzaChsYXN0UGFnZUxpbmspO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHBhZ2VzO1xyXG4gIH1cclxuXHJcbiAgdmFyIG9yaWdpbmFsUmVuZGVyID0gdGhpcy5yZW5kZXI7XHJcbiAgdGhpcy5yZW5kZXIgPSBmdW5jdGlvbigpIHtcclxuICAgIG9yaWdpbmFsUmVuZGVyKCk7XHJcbiAgICBpZiAoJHNjb3BlLnBhZ2UgPiAwICYmICRzY29wZS5wYWdlIDw9ICRzY29wZS50b3RhbFBhZ2VzKSB7XHJcbiAgICAgICRzY29wZS5wYWdlcyA9IGdldFBhZ2VzKCRzY29wZS5wYWdlLCAkc2NvcGUudG90YWxQYWdlcyk7XHJcbiAgICB9XHJcbiAgfTtcclxufV0pXHJcblxyXG4uY29uc3RhbnQoJ3VpYlBhZ2luYXRpb25Db25maWcnLCB7XHJcbiAgaXRlbXNQZXJQYWdlOiAxMCxcclxuICBib3VuZGFyeUxpbmtzOiBmYWxzZSxcclxuICBib3VuZGFyeUxpbmtOdW1iZXJzOiBmYWxzZSxcclxuICBkaXJlY3Rpb25MaW5rczogdHJ1ZSxcclxuICBmaXJzdFRleHQ6ICdGaXJzdCcsXHJcbiAgcHJldmlvdXNUZXh0OiAnUHJldmlvdXMnLFxyXG4gIG5leHRUZXh0OiAnTmV4dCcsXHJcbiAgbGFzdFRleHQ6ICdMYXN0JyxcclxuICByb3RhdGU6IHRydWUsXHJcbiAgZm9yY2VFbGxpcHNlczogZmFsc2VcclxufSlcclxuXHJcbi5kaXJlY3RpdmUoJ3VpYlBhZ2luYXRpb24nLCBbJyRwYXJzZScsICd1aWJQYWdpbmF0aW9uQ29uZmlnJywgZnVuY3Rpb24oJHBhcnNlLCB1aWJQYWdpbmF0aW9uQ29uZmlnKSB7XHJcbiAgcmV0dXJuIHtcclxuICAgIHNjb3BlOiB7XHJcbiAgICAgIHRvdGFsSXRlbXM6ICc9JyxcclxuICAgICAgZmlyc3RUZXh0OiAnQCcsXHJcbiAgICAgIHByZXZpb3VzVGV4dDogJ0AnLFxyXG4gICAgICBuZXh0VGV4dDogJ0AnLFxyXG4gICAgICBsYXN0VGV4dDogJ0AnLFxyXG4gICAgICBuZ0Rpc2FibGVkOic9J1xyXG4gICAgfSxcclxuICAgIHJlcXVpcmU6IFsndWliUGFnaW5hdGlvbicsICc/bmdNb2RlbCddLFxyXG4gICAgcmVzdHJpY3Q6ICdBJyxcclxuICAgIGNvbnRyb2xsZXI6ICdVaWJQYWdpbmF0aW9uQ29udHJvbGxlcicsXHJcbiAgICBjb250cm9sbGVyQXM6ICdwYWdpbmF0aW9uJyxcclxuICAgIHRlbXBsYXRlVXJsOiBmdW5jdGlvbihlbGVtZW50LCBhdHRycykge1xyXG4gICAgICByZXR1cm4gYXR0cnMudGVtcGxhdGVVcmwgfHwgJ3VpYi90ZW1wbGF0ZS9wYWdpbmF0aW9uL3BhZ2luYXRpb24uaHRtbCc7XHJcbiAgICB9LFxyXG4gICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCBjdHJscykge1xyXG4gICAgICBlbGVtZW50LmFkZENsYXNzKCdwYWdpbmF0aW9uJyk7XHJcbiAgICAgIHZhciBwYWdpbmF0aW9uQ3RybCA9IGN0cmxzWzBdLCBuZ01vZGVsQ3RybCA9IGN0cmxzWzFdO1xyXG5cclxuICAgICAgaWYgKCFuZ01vZGVsQ3RybCkge1xyXG4gICAgICAgICByZXR1cm47IC8vIGRvIG5vdGhpbmcgaWYgbm8gbmctbW9kZWxcclxuICAgICAgfVxyXG5cclxuICAgICAgcGFnaW5hdGlvbkN0cmwuaW5pdChuZ01vZGVsQ3RybCwgdWliUGFnaW5hdGlvbkNvbmZpZyk7XHJcbiAgICB9XHJcbiAgfTtcclxufV0pO1xyXG5cclxuLyoqXHJcbiAqIFRoZSBmb2xsb3dpbmcgZmVhdHVyZXMgYXJlIHN0aWxsIG91dHN0YW5kaW5nOiBhbmltYXRpb24gYXMgYVxyXG4gKiBmdW5jdGlvbiwgcGxhY2VtZW50IGFzIGEgZnVuY3Rpb24sIGluc2lkZSwgc3VwcG9ydCBmb3IgbW9yZSB0cmlnZ2VycyB0aGFuXHJcbiAqIGp1c3QgbW91c2UgZW50ZXIvbGVhdmUsIGh0bWwgdG9vbHRpcHMsIGFuZCBzZWxlY3RvciBkZWxlZ2F0aW9uLlxyXG4gKi9cclxuYW5ndWxhci5tb2R1bGUoJ3VpLmJvb3RzdHJhcC50b29sdGlwJywgWyd1aS5ib290c3RyYXAucG9zaXRpb24nLCAndWkuYm9vdHN0cmFwLnN0YWNrZWRNYXAnXSlcclxuXHJcbi8qKlxyXG4gKiBUaGUgJHRvb2x0aXAgc2VydmljZSBjcmVhdGVzIHRvb2x0aXAtIGFuZCBwb3BvdmVyLWxpa2UgZGlyZWN0aXZlcyBhcyB3ZWxsIGFzXHJcbiAqIGhvdXNlcyBnbG9iYWwgb3B0aW9ucyBmb3IgdGhlbS5cclxuICovXHJcbi5wcm92aWRlcignJHVpYlRvb2x0aXAnLCBmdW5jdGlvbigpIHtcclxuICAvLyBUaGUgZGVmYXVsdCBvcHRpb25zIHRvb2x0aXAgYW5kIHBvcG92ZXIuXHJcbiAgdmFyIGRlZmF1bHRPcHRpb25zID0ge1xyXG4gICAgcGxhY2VtZW50OiAndG9wJyxcclxuICAgIHBsYWNlbWVudENsYXNzUHJlZml4OiAnJyxcclxuICAgIGFuaW1hdGlvbjogdHJ1ZSxcclxuICAgIHBvcHVwRGVsYXk6IDAsXHJcbiAgICBwb3B1cENsb3NlRGVsYXk6IDAsXHJcbiAgICB1c2VDb250ZW50RXhwOiBmYWxzZVxyXG4gIH07XHJcblxyXG4gIC8vIERlZmF1bHQgaGlkZSB0cmlnZ2VycyBmb3IgZWFjaCBzaG93IHRyaWdnZXJcclxuICB2YXIgdHJpZ2dlck1hcCA9IHtcclxuICAgICdtb3VzZWVudGVyJzogJ21vdXNlbGVhdmUnLFxyXG4gICAgJ2NsaWNrJzogJ2NsaWNrJyxcclxuICAgICdvdXRzaWRlQ2xpY2snOiAnb3V0c2lkZUNsaWNrJyxcclxuICAgICdmb2N1cyc6ICdibHVyJyxcclxuICAgICdub25lJzogJydcclxuICB9O1xyXG5cclxuICAvLyBUaGUgb3B0aW9ucyBzcGVjaWZpZWQgdG8gdGhlIHByb3ZpZGVyIGdsb2JhbGx5LlxyXG4gIHZhciBnbG9iYWxPcHRpb25zID0ge307XHJcblxyXG4gIC8qKlxyXG4gICAqIGBvcHRpb25zKHt9KWAgYWxsb3dzIGdsb2JhbCBjb25maWd1cmF0aW9uIG9mIGFsbCB0b29sdGlwcyBpbiB0aGVcclxuICAgKiBhcHBsaWNhdGlvbi5cclxuICAgKlxyXG4gICAqICAgdmFyIGFwcCA9IGFuZ3VsYXIubW9kdWxlKCAnQXBwJywgWyd1aS5ib290c3RyYXAudG9vbHRpcCddLCBmdW5jdGlvbiggJHRvb2x0aXBQcm92aWRlciApIHtcclxuICAgKiAgICAgLy8gcGxhY2UgdG9vbHRpcHMgbGVmdCBpbnN0ZWFkIG9mIHRvcCBieSBkZWZhdWx0XHJcbiAgICogICAgICR0b29sdGlwUHJvdmlkZXIub3B0aW9ucyggeyBwbGFjZW1lbnQ6ICdsZWZ0JyB9ICk7XHJcbiAgICogICB9KTtcclxuICAgKi9cclxuXHR0aGlzLm9wdGlvbnMgPSBmdW5jdGlvbih2YWx1ZSkge1xyXG5cdFx0YW5ndWxhci5leHRlbmQoZ2xvYmFsT3B0aW9ucywgdmFsdWUpO1xyXG5cdH07XHJcblxyXG4gIC8qKlxyXG4gICAqIFRoaXMgYWxsb3dzIHlvdSB0byBleHRlbmQgdGhlIHNldCBvZiB0cmlnZ2VyIG1hcHBpbmdzIGF2YWlsYWJsZS4gRS5nLjpcclxuICAgKlxyXG4gICAqICAgJHRvb2x0aXBQcm92aWRlci5zZXRUcmlnZ2VycyggeyAnb3BlblRyaWdnZXInOiAnY2xvc2VUcmlnZ2VyJyB9ICk7XHJcbiAgICovXHJcbiAgdGhpcy5zZXRUcmlnZ2VycyA9IGZ1bmN0aW9uIHNldFRyaWdnZXJzKHRyaWdnZXJzKSB7XHJcbiAgICBhbmd1bGFyLmV4dGVuZCh0cmlnZ2VyTWFwLCB0cmlnZ2Vycyk7XHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogVGhpcyBpcyBhIGhlbHBlciBmdW5jdGlvbiBmb3IgdHJhbnNsYXRpbmcgY2FtZWwtY2FzZSB0byBzbmFrZV9jYXNlLlxyXG4gICAqL1xyXG4gIGZ1bmN0aW9uIHNuYWtlX2Nhc2UobmFtZSkge1xyXG4gICAgdmFyIHJlZ2V4cCA9IC9bQS1aXS9nO1xyXG4gICAgdmFyIHNlcGFyYXRvciA9ICctJztcclxuICAgIHJldHVybiBuYW1lLnJlcGxhY2UocmVnZXhwLCBmdW5jdGlvbihsZXR0ZXIsIHBvcykge1xyXG4gICAgICByZXR1cm4gKHBvcyA/IHNlcGFyYXRvciA6ICcnKSArIGxldHRlci50b0xvd2VyQ2FzZSgpO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSBhY3R1YWwgaW5zdGFuY2Ugb2YgdGhlICR0b29sdGlwIHNlcnZpY2UuXHJcbiAgICogVE9ETyBzdXBwb3J0IG11bHRpcGxlIHRyaWdnZXJzXHJcbiAgICovXHJcbiAgdGhpcy4kZ2V0ID0gWyckd2luZG93JywgJyRjb21waWxlJywgJyR0aW1lb3V0JywgJyRkb2N1bWVudCcsICckdWliUG9zaXRpb24nLCAnJGludGVycG9sYXRlJywgJyRyb290U2NvcGUnLCAnJHBhcnNlJywgJyQkc3RhY2tlZE1hcCcsIGZ1bmN0aW9uKCR3aW5kb3csICRjb21waWxlLCAkdGltZW91dCwgJGRvY3VtZW50LCAkcG9zaXRpb24sICRpbnRlcnBvbGF0ZSwgJHJvb3RTY29wZSwgJHBhcnNlLCAkJHN0YWNrZWRNYXApIHtcclxuICAgIHZhciBvcGVuZWRUb29sdGlwcyA9ICQkc3RhY2tlZE1hcC5jcmVhdGVOZXcoKTtcclxuICAgICRkb2N1bWVudC5vbigna2V5dXAnLCBrZXlwcmVzc0xpc3RlbmVyKTtcclxuXHJcbiAgICAkcm9vdFNjb3BlLiRvbignJGRlc3Ryb3knLCBmdW5jdGlvbigpIHtcclxuICAgICAgJGRvY3VtZW50Lm9mZigna2V5dXAnLCBrZXlwcmVzc0xpc3RlbmVyKTtcclxuICAgIH0pO1xyXG5cclxuICAgIGZ1bmN0aW9uIGtleXByZXNzTGlzdGVuZXIoZSkge1xyXG4gICAgICBpZiAoZS53aGljaCA9PT0gMjcpIHtcclxuICAgICAgICB2YXIgbGFzdCA9IG9wZW5lZFRvb2x0aXBzLnRvcCgpO1xyXG4gICAgICAgIGlmIChsYXN0KSB7XHJcbiAgICAgICAgICBsYXN0LnZhbHVlLmNsb3NlKCk7XHJcbiAgICAgICAgICBsYXN0ID0gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gZnVuY3Rpb24gJHRvb2x0aXAodHRUeXBlLCBwcmVmaXgsIGRlZmF1bHRUcmlnZ2VyU2hvdywgb3B0aW9ucykge1xyXG4gICAgICBvcHRpb25zID0gYW5ndWxhci5leHRlbmQoe30sIGRlZmF1bHRPcHRpb25zLCBnbG9iYWxPcHRpb25zLCBvcHRpb25zKTtcclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBSZXR1cm5zIGFuIG9iamVjdCBvZiBzaG93IGFuZCBoaWRlIHRyaWdnZXJzLlxyXG4gICAgICAgKlxyXG4gICAgICAgKiBJZiBhIHRyaWdnZXIgaXMgc3VwcGxpZWQsXHJcbiAgICAgICAqIGl0IGlzIHVzZWQgdG8gc2hvdyB0aGUgdG9vbHRpcDsgb3RoZXJ3aXNlLCBpdCB3aWxsIHVzZSB0aGUgYHRyaWdnZXJgXHJcbiAgICAgICAqIG9wdGlvbiBwYXNzZWQgdG8gdGhlIGAkdG9vbHRpcFByb3ZpZGVyLm9wdGlvbnNgIG1ldGhvZDsgZWxzZSBpdCB3aWxsXHJcbiAgICAgICAqIGRlZmF1bHQgdG8gdGhlIHRyaWdnZXIgc3VwcGxpZWQgdG8gdGhpcyBkaXJlY3RpdmUgZmFjdG9yeS5cclxuICAgICAgICpcclxuICAgICAgICogVGhlIGhpZGUgdHJpZ2dlciBpcyBiYXNlZCBvbiB0aGUgc2hvdyB0cmlnZ2VyLiBJZiB0aGUgYHRyaWdnZXJgIG9wdGlvblxyXG4gICAgICAgKiB3YXMgcGFzc2VkIHRvIHRoZSBgJHRvb2x0aXBQcm92aWRlci5vcHRpb25zYCBtZXRob2QsIGl0IHdpbGwgdXNlIHRoZVxyXG4gICAgICAgKiBtYXBwZWQgdHJpZ2dlciBmcm9tIGB0cmlnZ2VyTWFwYCBvciB0aGUgcGFzc2VkIHRyaWdnZXIgaWYgdGhlIG1hcCBpc1xyXG4gICAgICAgKiB1bmRlZmluZWQ7IG90aGVyd2lzZSwgaXQgdXNlcyB0aGUgYHRyaWdnZXJNYXBgIHZhbHVlIG9mIHRoZSBzaG93XHJcbiAgICAgICAqIHRyaWdnZXI7IGVsc2UgaXQgd2lsbCBqdXN0IHVzZSB0aGUgc2hvdyB0cmlnZ2VyLlxyXG4gICAgICAgKi9cclxuICAgICAgZnVuY3Rpb24gZ2V0VHJpZ2dlcnModHJpZ2dlcikge1xyXG4gICAgICAgIHZhciBzaG93ID0gKHRyaWdnZXIgfHwgb3B0aW9ucy50cmlnZ2VyIHx8IGRlZmF1bHRUcmlnZ2VyU2hvdykuc3BsaXQoJyAnKTtcclxuICAgICAgICB2YXIgaGlkZSA9IHNob3cubWFwKGZ1bmN0aW9uKHRyaWdnZXIpIHtcclxuICAgICAgICAgIHJldHVybiB0cmlnZ2VyTWFwW3RyaWdnZXJdIHx8IHRyaWdnZXI7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHNob3c6IHNob3csXHJcbiAgICAgICAgICBoaWRlOiBoaWRlXHJcbiAgICAgICAgfTtcclxuICAgICAgfVxyXG5cclxuICAgICAgdmFyIGRpcmVjdGl2ZU5hbWUgPSBzbmFrZV9jYXNlKHR0VHlwZSk7XHJcblxyXG4gICAgICB2YXIgc3RhcnRTeW0gPSAkaW50ZXJwb2xhdGUuc3RhcnRTeW1ib2woKTtcclxuICAgICAgdmFyIGVuZFN5bSA9ICRpbnRlcnBvbGF0ZS5lbmRTeW1ib2woKTtcclxuICAgICAgdmFyIHRlbXBsYXRlID1cclxuICAgICAgICAnPGRpdiAnKyBkaXJlY3RpdmVOYW1lICsgJy1wb3B1cCAnICtcclxuICAgICAgICAgICd1aWItdGl0bGU9XCInICsgc3RhcnRTeW0gKyAndGl0bGUnICsgZW5kU3ltICsgJ1wiICcgK1xyXG4gICAgICAgICAgKG9wdGlvbnMudXNlQ29udGVudEV4cCA/XHJcbiAgICAgICAgICAgICdjb250ZW50LWV4cD1cImNvbnRlbnRFeHAoKVwiICcgOlxyXG4gICAgICAgICAgICAnY29udGVudD1cIicgKyBzdGFydFN5bSArICdjb250ZW50JyArIGVuZFN5bSArICdcIiAnKSArXHJcbiAgICAgICAgICAnb3JpZ2luLXNjb3BlPVwib3JpZ1Njb3BlXCIgJyArXHJcbiAgICAgICAgICAnY2xhc3M9XCJ1aWItcG9zaXRpb24tbWVhc3VyZSAnICsgcHJlZml4ICsgJ1wiICcgK1xyXG4gICAgICAgICAgJ3Rvb2x0aXAtYW5pbWF0aW9uLWNsYXNzPVwiZmFkZVwiJyArXHJcbiAgICAgICAgICAndWliLXRvb2x0aXAtY2xhc3NlcyAnICtcclxuICAgICAgICAgICduZy1jbGFzcz1cInsgaW46IGlzT3BlbiB9XCIgJyArXHJcbiAgICAgICAgICAnPicgK1xyXG4gICAgICAgICc8L2Rpdj4nO1xyXG5cclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICBjb21waWxlOiBmdW5jdGlvbih0RWxlbSwgdEF0dHJzKSB7XHJcbiAgICAgICAgICB2YXIgdG9vbHRpcExpbmtlciA9ICRjb21waWxlKHRlbXBsYXRlKTtcclxuXHJcbiAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gbGluayhzY29wZSwgZWxlbWVudCwgYXR0cnMsIHRvb2x0aXBDdHJsKSB7XHJcbiAgICAgICAgICAgIHZhciB0b29sdGlwO1xyXG4gICAgICAgICAgICB2YXIgdG9vbHRpcExpbmtlZFNjb3BlO1xyXG4gICAgICAgICAgICB2YXIgdHJhbnNpdGlvblRpbWVvdXQ7XHJcbiAgICAgICAgICAgIHZhciBzaG93VGltZW91dDtcclxuICAgICAgICAgICAgdmFyIGhpZGVUaW1lb3V0O1xyXG4gICAgICAgICAgICB2YXIgcG9zaXRpb25UaW1lb3V0O1xyXG4gICAgICAgICAgICB2YXIgYWRqdXN0bWVudFRpbWVvdXQ7XHJcbiAgICAgICAgICAgIHZhciBhcHBlbmRUb0JvZHkgPSBhbmd1bGFyLmlzRGVmaW5lZChvcHRpb25zLmFwcGVuZFRvQm9keSkgPyBvcHRpb25zLmFwcGVuZFRvQm9keSA6IGZhbHNlO1xyXG4gICAgICAgICAgICB2YXIgdHJpZ2dlcnMgPSBnZXRUcmlnZ2Vycyh1bmRlZmluZWQpO1xyXG4gICAgICAgICAgICB2YXIgaGFzRW5hYmxlRXhwID0gYW5ndWxhci5pc0RlZmluZWQoYXR0cnNbcHJlZml4ICsgJ0VuYWJsZSddKTtcclxuICAgICAgICAgICAgdmFyIHR0U2NvcGUgPSBzY29wZS4kbmV3KHRydWUpO1xyXG4gICAgICAgICAgICB2YXIgcmVwb3NpdGlvblNjaGVkdWxlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICB2YXIgaXNPcGVuUGFyc2UgPSBhbmd1bGFyLmlzRGVmaW5lZChhdHRyc1twcmVmaXggKyAnSXNPcGVuJ10pID8gJHBhcnNlKGF0dHJzW3ByZWZpeCArICdJc09wZW4nXSkgOiBmYWxzZTtcclxuICAgICAgICAgICAgdmFyIGNvbnRlbnRQYXJzZSA9IG9wdGlvbnMudXNlQ29udGVudEV4cCA/ICRwYXJzZShhdHRyc1t0dFR5cGVdKSA6IGZhbHNlO1xyXG4gICAgICAgICAgICB2YXIgb2JzZXJ2ZXJzID0gW107XHJcbiAgICAgICAgICAgIHZhciBsYXN0UGxhY2VtZW50O1xyXG5cclxuICAgICAgICAgICAgdmFyIHBvc2l0aW9uVG9vbHRpcCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgIC8vIGNoZWNrIGlmIHRvb2x0aXAgZXhpc3RzIGFuZCBpcyBub3QgZW1wdHlcclxuICAgICAgICAgICAgICBpZiAoIXRvb2x0aXAgfHwgIXRvb2x0aXAuaHRtbCgpKSB7IHJldHVybjsgfVxyXG5cclxuICAgICAgICAgICAgICBpZiAoIXBvc2l0aW9uVGltZW91dCkge1xyXG4gICAgICAgICAgICAgICAgcG9zaXRpb25UaW1lb3V0ID0gJHRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgIHZhciB0dFBvc2l0aW9uID0gJHBvc2l0aW9uLnBvc2l0aW9uRWxlbWVudHMoZWxlbWVudCwgdG9vbHRpcCwgdHRTY29wZS5wbGFjZW1lbnQsIGFwcGVuZFRvQm9keSk7XHJcbiAgICAgICAgICAgICAgICAgIHZhciBpbml0aWFsSGVpZ2h0ID0gYW5ndWxhci5pc0RlZmluZWQodG9vbHRpcC5vZmZzZXRIZWlnaHQpID8gdG9vbHRpcC5vZmZzZXRIZWlnaHQgOiB0b29sdGlwLnByb3AoJ29mZnNldEhlaWdodCcpO1xyXG4gICAgICAgICAgICAgICAgICB2YXIgZWxlbWVudFBvcyA9IGFwcGVuZFRvQm9keSA/ICRwb3NpdGlvbi5vZmZzZXQoZWxlbWVudCkgOiAkcG9zaXRpb24ucG9zaXRpb24oZWxlbWVudCk7XHJcbiAgICAgICAgICAgICAgICAgIHRvb2x0aXAuY3NzKHsgdG9wOiB0dFBvc2l0aW9uLnRvcCArICdweCcsIGxlZnQ6IHR0UG9zaXRpb24ubGVmdCArICdweCcgfSk7XHJcbiAgICAgICAgICAgICAgICAgIHZhciBwbGFjZW1lbnRDbGFzc2VzID0gdHRQb3NpdGlvbi5wbGFjZW1lbnQuc3BsaXQoJy0nKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgIGlmICghdG9vbHRpcC5oYXNDbGFzcyhwbGFjZW1lbnRDbGFzc2VzWzBdKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRvb2x0aXAucmVtb3ZlQ2xhc3MobGFzdFBsYWNlbWVudC5zcGxpdCgnLScpWzBdKTtcclxuICAgICAgICAgICAgICAgICAgICB0b29sdGlwLmFkZENsYXNzKHBsYWNlbWVudENsYXNzZXNbMF0pO1xyXG4gICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICBpZiAoIXRvb2x0aXAuaGFzQ2xhc3Mob3B0aW9ucy5wbGFjZW1lbnRDbGFzc1ByZWZpeCArIHR0UG9zaXRpb24ucGxhY2VtZW50KSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRvb2x0aXAucmVtb3ZlQ2xhc3Mob3B0aW9ucy5wbGFjZW1lbnRDbGFzc1ByZWZpeCArIGxhc3RQbGFjZW1lbnQpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRvb2x0aXAuYWRkQ2xhc3Mob3B0aW9ucy5wbGFjZW1lbnRDbGFzc1ByZWZpeCArIHR0UG9zaXRpb24ucGxhY2VtZW50KTtcclxuICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgYWRqdXN0bWVudFRpbWVvdXQgPSAkdGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgY3VycmVudEhlaWdodCA9IGFuZ3VsYXIuaXNEZWZpbmVkKHRvb2x0aXAub2Zmc2V0SGVpZ2h0KSA/IHRvb2x0aXAub2Zmc2V0SGVpZ2h0IDogdG9vbHRpcC5wcm9wKCdvZmZzZXRIZWlnaHQnKTtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgYWRqdXN0bWVudCA9ICRwb3NpdGlvbi5hZGp1c3RUb3AocGxhY2VtZW50Q2xhc3NlcywgZWxlbWVudFBvcywgaW5pdGlhbEhlaWdodCwgY3VycmVudEhlaWdodCk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGFkanVzdG1lbnQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgIHRvb2x0aXAuY3NzKGFkanVzdG1lbnQpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBhZGp1c3RtZW50VGltZW91dCA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICAgIH0sIDAsIGZhbHNlKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgIC8vIGZpcnN0IHRpbWUgdGhyb3VnaCB0dCBlbGVtZW50IHdpbGwgaGF2ZSB0aGVcclxuICAgICAgICAgICAgICAgICAgLy8gdWliLXBvc2l0aW9uLW1lYXN1cmUgY2xhc3Mgb3IgaWYgdGhlIHBsYWNlbWVudFxyXG4gICAgICAgICAgICAgICAgICAvLyBoYXMgY2hhbmdlZCB3ZSBuZWVkIHRvIHBvc2l0aW9uIHRoZSBhcnJvdy5cclxuICAgICAgICAgICAgICAgICAgaWYgKHRvb2x0aXAuaGFzQ2xhc3MoJ3VpYi1wb3NpdGlvbi1tZWFzdXJlJykpIHtcclxuICAgICAgICAgICAgICAgICAgICAkcG9zaXRpb24ucG9zaXRpb25BcnJvdyh0b29sdGlwLCB0dFBvc2l0aW9uLnBsYWNlbWVudCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdG9vbHRpcC5yZW1vdmVDbGFzcygndWliLXBvc2l0aW9uLW1lYXN1cmUnKTtcclxuICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChsYXN0UGxhY2VtZW50ICE9PSB0dFBvc2l0aW9uLnBsYWNlbWVudCkge1xyXG4gICAgICAgICAgICAgICAgICAgICRwb3NpdGlvbi5wb3NpdGlvbkFycm93KHRvb2x0aXAsIHR0UG9zaXRpb24ucGxhY2VtZW50KTtcclxuICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICBsYXN0UGxhY2VtZW50ID0gdHRQb3NpdGlvbi5wbGFjZW1lbnQ7XHJcblxyXG4gICAgICAgICAgICAgICAgICBwb3NpdGlvblRpbWVvdXQgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgfSwgMCwgZmFsc2UpO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIC8vIFNldCB1cCB0aGUgY29ycmVjdCBzY29wZSB0byBhbGxvdyB0cmFuc2NsdXNpb24gbGF0ZXJcclxuICAgICAgICAgICAgdHRTY29wZS5vcmlnU2NvcGUgPSBzY29wZTtcclxuXHJcbiAgICAgICAgICAgIC8vIEJ5IGRlZmF1bHQsIHRoZSB0b29sdGlwIGlzIG5vdCBvcGVuLlxyXG4gICAgICAgICAgICAvLyBUT0RPIGFkZCBhYmlsaXR5IHRvIHN0YXJ0IHRvb2x0aXAgb3BlbmVkXHJcbiAgICAgICAgICAgIHR0U2NvcGUuaXNPcGVuID0gZmFsc2U7XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiB0b2dnbGVUb29sdGlwQmluZCgpIHtcclxuICAgICAgICAgICAgICBpZiAoIXR0U2NvcGUuaXNPcGVuKSB7XHJcbiAgICAgICAgICAgICAgICBzaG93VG9vbHRpcEJpbmQoKTtcclxuICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgaGlkZVRvb2x0aXBCaW5kKCk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBTaG93IHRoZSB0b29sdGlwIHdpdGggZGVsYXkgaWYgc3BlY2lmaWVkLCBvdGhlcndpc2Ugc2hvdyBpdCBpbW1lZGlhdGVseVxyXG4gICAgICAgICAgICBmdW5jdGlvbiBzaG93VG9vbHRpcEJpbmQoKSB7XHJcbiAgICAgICAgICAgICAgaWYgKGhhc0VuYWJsZUV4cCAmJiAhc2NvcGUuJGV2YWwoYXR0cnNbcHJlZml4ICsgJ0VuYWJsZSddKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgY2FuY2VsSGlkZSgpO1xyXG4gICAgICAgICAgICAgIHByZXBhcmVUb29sdGlwKCk7XHJcblxyXG4gICAgICAgICAgICAgIGlmICh0dFNjb3BlLnBvcHVwRGVsYXkpIHtcclxuICAgICAgICAgICAgICAgIC8vIERvIG5vdGhpbmcgaWYgdGhlIHRvb2x0aXAgd2FzIGFscmVhZHkgc2NoZWR1bGVkIHRvIHBvcC11cC5cclxuICAgICAgICAgICAgICAgIC8vIFRoaXMgaGFwcGVucyBpZiBzaG93IGlzIHRyaWdnZXJlZCBtdWx0aXBsZSB0aW1lcyBiZWZvcmUgYW55IGhpZGUgaXMgdHJpZ2dlcmVkLlxyXG4gICAgICAgICAgICAgICAgaWYgKCFzaG93VGltZW91dCkge1xyXG4gICAgICAgICAgICAgICAgICBzaG93VGltZW91dCA9ICR0aW1lb3V0KHNob3csIHR0U2NvcGUucG9wdXBEZWxheSwgZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBzaG93KCk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBoaWRlVG9vbHRpcEJpbmQoKSB7XHJcbiAgICAgICAgICAgICAgY2FuY2VsU2hvdygpO1xyXG5cclxuICAgICAgICAgICAgICBpZiAodHRTY29wZS5wb3B1cENsb3NlRGVsYXkpIHtcclxuICAgICAgICAgICAgICAgIGlmICghaGlkZVRpbWVvdXQpIHtcclxuICAgICAgICAgICAgICAgICAgaGlkZVRpbWVvdXQgPSAkdGltZW91dChoaWRlLCB0dFNjb3BlLnBvcHVwQ2xvc2VEZWxheSwgZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBoaWRlKCk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBTaG93IHRoZSB0b29sdGlwIHBvcHVwIGVsZW1lbnQuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIHNob3coKSB7XHJcbiAgICAgICAgICAgICAgY2FuY2VsU2hvdygpO1xyXG4gICAgICAgICAgICAgIGNhbmNlbEhpZGUoKTtcclxuXHJcbiAgICAgICAgICAgICAgLy8gRG9uJ3Qgc2hvdyBlbXB0eSB0b29sdGlwcy5cclxuICAgICAgICAgICAgICBpZiAoIXR0U2NvcGUuY29udGVudCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGFuZ3VsYXIubm9vcDtcclxuICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgIGNyZWF0ZVRvb2x0aXAoKTtcclxuXHJcbiAgICAgICAgICAgICAgLy8gQW5kIHNob3cgdGhlIHRvb2x0aXAuXHJcbiAgICAgICAgICAgICAgdHRTY29wZS4kZXZhbEFzeW5jKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgdHRTY29wZS5pc09wZW4gPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgYXNzaWduSXNPcGVuKHRydWUpO1xyXG4gICAgICAgICAgICAgICAgcG9zaXRpb25Ub29sdGlwKCk7XHJcbiAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIGNhbmNlbFNob3coKSB7XHJcbiAgICAgICAgICAgICAgaWYgKHNob3dUaW1lb3V0KSB7XHJcbiAgICAgICAgICAgICAgICAkdGltZW91dC5jYW5jZWwoc2hvd1RpbWVvdXQpO1xyXG4gICAgICAgICAgICAgICAgc2hvd1RpbWVvdXQgPSBudWxsO1xyXG4gICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgaWYgKHBvc2l0aW9uVGltZW91dCkge1xyXG4gICAgICAgICAgICAgICAgJHRpbWVvdXQuY2FuY2VsKHBvc2l0aW9uVGltZW91dCk7XHJcbiAgICAgICAgICAgICAgICBwb3NpdGlvblRpbWVvdXQgPSBudWxsO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gSGlkZSB0aGUgdG9vbHRpcCBwb3B1cCBlbGVtZW50LlxyXG4gICAgICAgICAgICBmdW5jdGlvbiBoaWRlKCkge1xyXG4gICAgICAgICAgICAgIGlmICghdHRTY29wZSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgLy8gRmlyc3QgdGhpbmdzIGZpcnN0OiB3ZSBkb24ndCBzaG93IGl0IGFueW1vcmUuXHJcbiAgICAgICAgICAgICAgdHRTY29wZS4kZXZhbEFzeW5jKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHR0U2NvcGUpIHtcclxuICAgICAgICAgICAgICAgICAgdHRTY29wZS5pc09wZW4gPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgYXNzaWduSXNPcGVuKGZhbHNlKTtcclxuICAgICAgICAgICAgICAgICAgLy8gQW5kIG5vdyB3ZSByZW1vdmUgaXQgZnJvbSB0aGUgRE9NLiBIb3dldmVyLCBpZiB3ZSBoYXZlIGFuaW1hdGlvbiwgd2VcclxuICAgICAgICAgICAgICAgICAgLy8gbmVlZCB0byB3YWl0IGZvciBpdCB0byBleHBpcmUgYmVmb3JlaGFuZC5cclxuICAgICAgICAgICAgICAgICAgLy8gRklYTUU6IHRoaXMgaXMgYSBwbGFjZWhvbGRlciBmb3IgYSBwb3J0IG9mIHRoZSB0cmFuc2l0aW9ucyBsaWJyYXJ5LlxyXG4gICAgICAgICAgICAgICAgICAvLyBUaGUgZmFkZSB0cmFuc2l0aW9uIGluIFRXQlMgaXMgMTUwbXMuXHJcbiAgICAgICAgICAgICAgICAgIGlmICh0dFNjb3BlLmFuaW1hdGlvbikge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICghdHJhbnNpdGlvblRpbWVvdXQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgIHRyYW5zaXRpb25UaW1lb3V0ID0gJHRpbWVvdXQocmVtb3ZlVG9vbHRpcCwgMTUwLCBmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlbW92ZVRvb2x0aXAoKTtcclxuICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBjYW5jZWxIaWRlKCkge1xyXG4gICAgICAgICAgICAgIGlmIChoaWRlVGltZW91dCkge1xyXG4gICAgICAgICAgICAgICAgJHRpbWVvdXQuY2FuY2VsKGhpZGVUaW1lb3V0KTtcclxuICAgICAgICAgICAgICAgIGhpZGVUaW1lb3V0ID0gbnVsbDtcclxuICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgIGlmICh0cmFuc2l0aW9uVGltZW91dCkge1xyXG4gICAgICAgICAgICAgICAgJHRpbWVvdXQuY2FuY2VsKHRyYW5zaXRpb25UaW1lb3V0KTtcclxuICAgICAgICAgICAgICAgIHRyYW5zaXRpb25UaW1lb3V0ID0gbnVsbDtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIGNyZWF0ZVRvb2x0aXAoKSB7XHJcbiAgICAgICAgICAgICAgLy8gVGhlcmUgY2FuIG9ubHkgYmUgb25lIHRvb2x0aXAgZWxlbWVudCBwZXIgZGlyZWN0aXZlIHNob3duIGF0IG9uY2UuXHJcbiAgICAgICAgICAgICAgaWYgKHRvb2x0aXApIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgIHRvb2x0aXBMaW5rZWRTY29wZSA9IHR0U2NvcGUuJG5ldygpO1xyXG4gICAgICAgICAgICAgIHRvb2x0aXAgPSB0b29sdGlwTGlua2VyKHRvb2x0aXBMaW5rZWRTY29wZSwgZnVuY3Rpb24odG9vbHRpcCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGFwcGVuZFRvQm9keSkge1xyXG4gICAgICAgICAgICAgICAgICAkZG9jdW1lbnQuZmluZCgnYm9keScpLmFwcGVuZCh0b29sdGlwKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgIGVsZW1lbnQuYWZ0ZXIodG9vbHRpcCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgIG9wZW5lZFRvb2x0aXBzLmFkZCh0dFNjb3BlLCB7XHJcbiAgICAgICAgICAgICAgICBjbG9zZTogaGlkZVxyXG4gICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICBwcmVwT2JzZXJ2ZXJzKCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIHJlbW92ZVRvb2x0aXAoKSB7XHJcbiAgICAgICAgICAgICAgY2FuY2VsU2hvdygpO1xyXG4gICAgICAgICAgICAgIGNhbmNlbEhpZGUoKTtcclxuICAgICAgICAgICAgICB1bnJlZ2lzdGVyT2JzZXJ2ZXJzKCk7XHJcblxyXG4gICAgICAgICAgICAgIGlmICh0b29sdGlwKSB7XHJcbiAgICAgICAgICAgICAgICB0b29sdGlwLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICB0b29sdGlwID0gbnVsbDtcclxuICAgICAgICAgICAgICAgIGlmIChhZGp1c3RtZW50VGltZW91dCkge1xyXG4gICAgICAgICAgICAgICAgICAkdGltZW91dC5jYW5jZWwoYWRqdXN0bWVudFRpbWVvdXQpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgb3BlbmVkVG9vbHRpcHMucmVtb3ZlKHR0U2NvcGUpO1xyXG4gICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgIGlmICh0b29sdGlwTGlua2VkU2NvcGUpIHtcclxuICAgICAgICAgICAgICAgIHRvb2x0aXBMaW5rZWRTY29wZS4kZGVzdHJveSgpO1xyXG4gICAgICAgICAgICAgICAgdG9vbHRpcExpbmtlZFNjb3BlID0gbnVsbDtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8qKlxyXG4gICAgICAgICAgICAgKiBTZXQgdGhlIGluaXRpYWwgc2NvcGUgdmFsdWVzLiBPbmNlXHJcbiAgICAgICAgICAgICAqIHRoZSB0b29sdGlwIGlzIGNyZWF0ZWQsIHRoZSBvYnNlcnZlcnNcclxuICAgICAgICAgICAgICogd2lsbCBiZSBhZGRlZCB0byBrZWVwIHRoaW5ncyBpbiBzeW5jLlxyXG4gICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgZnVuY3Rpb24gcHJlcGFyZVRvb2x0aXAoKSB7XHJcbiAgICAgICAgICAgICAgdHRTY29wZS50aXRsZSA9IGF0dHJzW3ByZWZpeCArICdUaXRsZSddO1xyXG4gICAgICAgICAgICAgIGlmIChjb250ZW50UGFyc2UpIHtcclxuICAgICAgICAgICAgICAgIHR0U2NvcGUuY29udGVudCA9IGNvbnRlbnRQYXJzZShzY29wZSk7XHJcbiAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHR0U2NvcGUuY29udGVudCA9IGF0dHJzW3R0VHlwZV07XHJcbiAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICB0dFNjb3BlLnBvcHVwQ2xhc3MgPSBhdHRyc1twcmVmaXggKyAnQ2xhc3MnXTtcclxuICAgICAgICAgICAgICB0dFNjb3BlLnBsYWNlbWVudCA9IGFuZ3VsYXIuaXNEZWZpbmVkKGF0dHJzW3ByZWZpeCArICdQbGFjZW1lbnQnXSkgPyBhdHRyc1twcmVmaXggKyAnUGxhY2VtZW50J10gOiBvcHRpb25zLnBsYWNlbWVudDtcclxuICAgICAgICAgICAgICB2YXIgcGxhY2VtZW50ID0gJHBvc2l0aW9uLnBhcnNlUGxhY2VtZW50KHR0U2NvcGUucGxhY2VtZW50KTtcclxuICAgICAgICAgICAgICBsYXN0UGxhY2VtZW50ID0gcGxhY2VtZW50WzFdID8gcGxhY2VtZW50WzBdICsgJy0nICsgcGxhY2VtZW50WzFdIDogcGxhY2VtZW50WzBdO1xyXG5cclxuICAgICAgICAgICAgICB2YXIgZGVsYXkgPSBwYXJzZUludChhdHRyc1twcmVmaXggKyAnUG9wdXBEZWxheSddLCAxMCk7XHJcbiAgICAgICAgICAgICAgdmFyIGNsb3NlRGVsYXkgPSBwYXJzZUludChhdHRyc1twcmVmaXggKyAnUG9wdXBDbG9zZURlbGF5J10sIDEwKTtcclxuICAgICAgICAgICAgICB0dFNjb3BlLnBvcHVwRGVsYXkgPSAhaXNOYU4oZGVsYXkpID8gZGVsYXkgOiBvcHRpb25zLnBvcHVwRGVsYXk7XHJcbiAgICAgICAgICAgICAgdHRTY29wZS5wb3B1cENsb3NlRGVsYXkgPSAhaXNOYU4oY2xvc2VEZWxheSkgPyBjbG9zZURlbGF5IDogb3B0aW9ucy5wb3B1cENsb3NlRGVsYXk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIGFzc2lnbklzT3Blbihpc09wZW4pIHtcclxuICAgICAgICAgICAgICBpZiAoaXNPcGVuUGFyc2UgJiYgYW5ndWxhci5pc0Z1bmN0aW9uKGlzT3BlblBhcnNlLmFzc2lnbikpIHtcclxuICAgICAgICAgICAgICAgIGlzT3BlblBhcnNlLmFzc2lnbihzY29wZSwgaXNPcGVuKTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHR0U2NvcGUuY29udGVudEV4cCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgIHJldHVybiB0dFNjb3BlLmNvbnRlbnQ7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAvKipcclxuICAgICAgICAgICAgICogT2JzZXJ2ZSB0aGUgcmVsZXZhbnQgYXR0cmlidXRlcy5cclxuICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgIGF0dHJzLiRvYnNlcnZlKCdkaXNhYmxlZCcsIGZ1bmN0aW9uKHZhbCkge1xyXG4gICAgICAgICAgICAgIGlmICh2YWwpIHtcclxuICAgICAgICAgICAgICAgIGNhbmNlbFNob3coKTtcclxuICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgIGlmICh2YWwgJiYgdHRTY29wZS5pc09wZW4pIHtcclxuICAgICAgICAgICAgICAgIGhpZGUoKTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgaWYgKGlzT3BlblBhcnNlKSB7XHJcbiAgICAgICAgICAgICAgc2NvcGUuJHdhdGNoKGlzT3BlblBhcnNlLCBmdW5jdGlvbih2YWwpIHtcclxuICAgICAgICAgICAgICAgIGlmICh0dFNjb3BlICYmICF2YWwgPT09IHR0U2NvcGUuaXNPcGVuKSB7XHJcbiAgICAgICAgICAgICAgICAgIHRvZ2dsZVRvb2x0aXBCaW5kKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIHByZXBPYnNlcnZlcnMoKSB7XHJcbiAgICAgICAgICAgICAgb2JzZXJ2ZXJzLmxlbmd0aCA9IDA7XHJcblxyXG4gICAgICAgICAgICAgIGlmIChjb250ZW50UGFyc2UpIHtcclxuICAgICAgICAgICAgICAgIG9ic2VydmVycy5wdXNoKFxyXG4gICAgICAgICAgICAgICAgICBzY29wZS4kd2F0Y2goY29udGVudFBhcnNlLCBmdW5jdGlvbih2YWwpIHtcclxuICAgICAgICAgICAgICAgICAgICB0dFNjb3BlLmNvbnRlbnQgPSB2YWw7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCF2YWwgJiYgdHRTY29wZS5pc09wZW4pIHtcclxuICAgICAgICAgICAgICAgICAgICAgIGhpZGUoKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgICAgIG9ic2VydmVycy5wdXNoKFxyXG4gICAgICAgICAgICAgICAgICB0b29sdGlwTGlua2VkU2NvcGUuJHdhdGNoKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICghcmVwb3NpdGlvblNjaGVkdWxlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgcmVwb3NpdGlvblNjaGVkdWxlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICB0b29sdGlwTGlua2VkU2NvcGUuJCRwb3N0RGlnZXN0KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXBvc2l0aW9uU2NoZWR1bGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0dFNjb3BlICYmIHR0U2NvcGUuaXNPcGVuKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgcG9zaXRpb25Ub29sdGlwKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIG9ic2VydmVycy5wdXNoKFxyXG4gICAgICAgICAgICAgICAgICBhdHRycy4kb2JzZXJ2ZSh0dFR5cGUsIGZ1bmN0aW9uKHZhbCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHR0U2NvcGUuY29udGVudCA9IHZhbDtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIXZhbCAmJiB0dFNjb3BlLmlzT3Blbikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgaGlkZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICBwb3NpdGlvblRvb2x0aXAoKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgb2JzZXJ2ZXJzLnB1c2goXHJcbiAgICAgICAgICAgICAgICBhdHRycy4kb2JzZXJ2ZShwcmVmaXggKyAnVGl0bGUnLCBmdW5jdGlvbih2YWwpIHtcclxuICAgICAgICAgICAgICAgICAgdHRTY29wZS50aXRsZSA9IHZhbDtcclxuICAgICAgICAgICAgICAgICAgaWYgKHR0U2NvcGUuaXNPcGVuKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcG9zaXRpb25Ub29sdGlwKCk7XHJcbiAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgICAgb2JzZXJ2ZXJzLnB1c2goXHJcbiAgICAgICAgICAgICAgICBhdHRycy4kb2JzZXJ2ZShwcmVmaXggKyAnUGxhY2VtZW50JywgZnVuY3Rpb24odmFsKSB7XHJcbiAgICAgICAgICAgICAgICAgIHR0U2NvcGUucGxhY2VtZW50ID0gdmFsID8gdmFsIDogb3B0aW9ucy5wbGFjZW1lbnQ7XHJcbiAgICAgICAgICAgICAgICAgIGlmICh0dFNjb3BlLmlzT3Blbikge1xyXG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uVG9vbHRpcCgpO1xyXG4gICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIHVucmVnaXN0ZXJPYnNlcnZlcnMoKSB7XHJcbiAgICAgICAgICAgICAgaWYgKG9ic2VydmVycy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaChvYnNlcnZlcnMsIGZ1bmN0aW9uKG9ic2VydmVyKSB7XHJcbiAgICAgICAgICAgICAgICAgIG9ic2VydmVyKCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIG9ic2VydmVycy5sZW5ndGggPSAwO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gaGlkZSB0b29sdGlwcy9wb3BvdmVycyBmb3Igb3V0c2lkZUNsaWNrIHRyaWdnZXJcclxuICAgICAgICAgICAgZnVuY3Rpb24gYm9keUhpZGVUb29sdGlwQmluZChlKSB7XHJcbiAgICAgICAgICAgICAgaWYgKCF0dFNjb3BlIHx8ICF0dFNjb3BlLmlzT3BlbiB8fCAhdG9vbHRpcCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAvLyBtYWtlIHN1cmUgdGhlIHRvb2x0aXAvcG9wb3ZlciBsaW5rIG9yIHRvb2wgdG9vbHRpcC9wb3BvdmVyIGl0c2VsZiB3ZXJlIG5vdCBjbGlja2VkXHJcbiAgICAgICAgICAgICAgaWYgKCFlbGVtZW50WzBdLmNvbnRhaW5zKGUudGFyZ2V0KSAmJiAhdG9vbHRpcFswXS5jb250YWlucyhlLnRhcmdldCkpIHtcclxuICAgICAgICAgICAgICAgIGhpZGVUb29sdGlwQmluZCgpO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdmFyIHVucmVnaXN0ZXJUcmlnZ2VycyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgIHRyaWdnZXJzLnNob3cuZm9yRWFjaChmdW5jdGlvbih0cmlnZ2VyKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodHJpZ2dlciA9PT0gJ291dHNpZGVDbGljaycpIHtcclxuICAgICAgICAgICAgICAgICAgZWxlbWVudC5vZmYoJ2NsaWNrJywgdG9nZ2xlVG9vbHRpcEJpbmQpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgZWxlbWVudC5vZmYodHJpZ2dlciwgc2hvd1Rvb2x0aXBCaW5kKTtcclxuICAgICAgICAgICAgICAgICAgZWxlbWVudC5vZmYodHJpZ2dlciwgdG9nZ2xlVG9vbHRpcEJpbmQpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgIHRyaWdnZXJzLmhpZGUuZm9yRWFjaChmdW5jdGlvbih0cmlnZ2VyKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodHJpZ2dlciA9PT0gJ291dHNpZGVDbGljaycpIHtcclxuICAgICAgICAgICAgICAgICAgJGRvY3VtZW50Lm9mZignY2xpY2snLCBib2R5SGlkZVRvb2x0aXBCaW5kKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgIGVsZW1lbnQub2ZmKHRyaWdnZXIsIGhpZGVUb29sdGlwQmluZCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBwcmVwVHJpZ2dlcnMoKSB7XHJcbiAgICAgICAgICAgICAgdmFyIHNob3dUcmlnZ2VycyA9IFtdLCBoaWRlVHJpZ2dlcnMgPSBbXTtcclxuICAgICAgICAgICAgICB2YXIgdmFsID0gc2NvcGUuJGV2YWwoYXR0cnNbcHJlZml4ICsgJ1RyaWdnZXInXSk7XHJcbiAgICAgICAgICAgICAgdW5yZWdpc3RlclRyaWdnZXJzKCk7XHJcblxyXG4gICAgICAgICAgICAgIGlmIChhbmd1bGFyLmlzT2JqZWN0KHZhbCkpIHtcclxuICAgICAgICAgICAgICAgIE9iamVjdC5rZXlzKHZhbCkuZm9yRWFjaChmdW5jdGlvbihrZXkpIHtcclxuICAgICAgICAgICAgICAgICAgc2hvd1RyaWdnZXJzLnB1c2goa2V5KTtcclxuICAgICAgICAgICAgICAgICAgaGlkZVRyaWdnZXJzLnB1c2godmFsW2tleV0pO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB0cmlnZ2VycyA9IHtcclxuICAgICAgICAgICAgICAgICAgc2hvdzogc2hvd1RyaWdnZXJzLFxyXG4gICAgICAgICAgICAgICAgICBoaWRlOiBoaWRlVHJpZ2dlcnNcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRyaWdnZXJzID0gZ2V0VHJpZ2dlcnModmFsKTtcclxuICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgIGlmICh0cmlnZ2Vycy5zaG93ICE9PSAnbm9uZScpIHtcclxuICAgICAgICAgICAgICAgIHRyaWdnZXJzLnNob3cuZm9yRWFjaChmdW5jdGlvbih0cmlnZ2VyLCBpZHgpIHtcclxuICAgICAgICAgICAgICAgICAgaWYgKHRyaWdnZXIgPT09ICdvdXRzaWRlQ2xpY2snKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5vbignY2xpY2snLCB0b2dnbGVUb29sdGlwQmluZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgJGRvY3VtZW50Lm9uKCdjbGljaycsIGJvZHlIaWRlVG9vbHRpcEJpbmQpO1xyXG4gICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRyaWdnZXIgPT09IHRyaWdnZXJzLmhpZGVbaWR4XSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQub24odHJpZ2dlciwgdG9nZ2xlVG9vbHRpcEJpbmQpO1xyXG4gICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRyaWdnZXIpIHtcclxuICAgICAgICAgICAgICAgICAgICBlbGVtZW50Lm9uKHRyaWdnZXIsIHNob3dUb29sdGlwQmluZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5vbih0cmlnZ2Vycy5oaWRlW2lkeF0sIGhpZGVUb29sdGlwQmluZCk7XHJcbiAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgIGVsZW1lbnQub24oJ2tleXByZXNzJywgZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChlLndoaWNoID09PSAyNykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgaGlkZVRvb2x0aXBCaW5kKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcHJlcFRyaWdnZXJzKCk7XHJcblxyXG4gICAgICAgICAgICB2YXIgYW5pbWF0aW9uID0gc2NvcGUuJGV2YWwoYXR0cnNbcHJlZml4ICsgJ0FuaW1hdGlvbiddKTtcclxuICAgICAgICAgICAgdHRTY29wZS5hbmltYXRpb24gPSBhbmd1bGFyLmlzRGVmaW5lZChhbmltYXRpb24pID8gISFhbmltYXRpb24gOiBvcHRpb25zLmFuaW1hdGlvbjtcclxuXHJcbiAgICAgICAgICAgIHZhciBhcHBlbmRUb0JvZHlWYWw7XHJcbiAgICAgICAgICAgIHZhciBhcHBlbmRLZXkgPSBwcmVmaXggKyAnQXBwZW5kVG9Cb2R5JztcclxuICAgICAgICAgICAgaWYgKGFwcGVuZEtleSBpbiBhdHRycyAmJiBhdHRyc1thcHBlbmRLZXldID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICBhcHBlbmRUb0JvZHlWYWwgPSB0cnVlO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIGFwcGVuZFRvQm9keVZhbCA9IHNjb3BlLiRldmFsKGF0dHJzW2FwcGVuZEtleV0pO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBhcHBlbmRUb0JvZHkgPSBhbmd1bGFyLmlzRGVmaW5lZChhcHBlbmRUb0JvZHlWYWwpID8gYXBwZW5kVG9Cb2R5VmFsIDogYXBwZW5kVG9Cb2R5O1xyXG5cclxuICAgICAgICAgICAgLy8gTWFrZSBzdXJlIHRvb2x0aXAgaXMgZGVzdHJveWVkIGFuZCByZW1vdmVkLlxyXG4gICAgICAgICAgICBzY29wZS4kb24oJyRkZXN0cm95JywgZnVuY3Rpb24gb25EZXN0cm95VG9vbHRpcCgpIHtcclxuICAgICAgICAgICAgICB1bnJlZ2lzdGVyVHJpZ2dlcnMoKTtcclxuICAgICAgICAgICAgICByZW1vdmVUb29sdGlwKCk7XHJcbiAgICAgICAgICAgICAgdHRTY29wZSA9IG51bGw7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICAgIH07XHJcbiAgICB9O1xyXG4gIH1dO1xyXG59KVxyXG5cclxuLy8gVGhpcyBpcyBtb3N0bHkgbmdJbmNsdWRlIGNvZGUgYnV0IHdpdGggYSBjdXN0b20gc2NvcGVcclxuLmRpcmVjdGl2ZSgndWliVG9vbHRpcFRlbXBsYXRlVHJhbnNjbHVkZScsIFtcclxuICAgICAgICAgJyRhbmltYXRlJywgJyRzY2UnLCAnJGNvbXBpbGUnLCAnJHRlbXBsYXRlUmVxdWVzdCcsXHJcbmZ1bmN0aW9uICgkYW5pbWF0ZSwgJHNjZSwgJGNvbXBpbGUsICR0ZW1wbGF0ZVJlcXVlc3QpIHtcclxuICByZXR1cm4ge1xyXG4gICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsZW0sIGF0dHJzKSB7XHJcbiAgICAgIHZhciBvcmlnU2NvcGUgPSBzY29wZS4kZXZhbChhdHRycy50b29sdGlwVGVtcGxhdGVUcmFuc2NsdWRlU2NvcGUpO1xyXG5cclxuICAgICAgdmFyIGNoYW5nZUNvdW50ZXIgPSAwLFxyXG4gICAgICAgIGN1cnJlbnRTY29wZSxcclxuICAgICAgICBwcmV2aW91c0VsZW1lbnQsXHJcbiAgICAgICAgY3VycmVudEVsZW1lbnQ7XHJcblxyXG4gICAgICB2YXIgY2xlYW51cExhc3RJbmNsdWRlQ29udGVudCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGlmIChwcmV2aW91c0VsZW1lbnQpIHtcclxuICAgICAgICAgIHByZXZpb3VzRWxlbWVudC5yZW1vdmUoKTtcclxuICAgICAgICAgIHByZXZpb3VzRWxlbWVudCA9IG51bGw7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoY3VycmVudFNjb3BlKSB7XHJcbiAgICAgICAgICBjdXJyZW50U2NvcGUuJGRlc3Ryb3koKTtcclxuICAgICAgICAgIGN1cnJlbnRTY29wZSA9IG51bGw7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoY3VycmVudEVsZW1lbnQpIHtcclxuICAgICAgICAgICRhbmltYXRlLmxlYXZlKGN1cnJlbnRFbGVtZW50KS50aGVuKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBwcmV2aW91c0VsZW1lbnQgPSBudWxsO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgICBwcmV2aW91c0VsZW1lbnQgPSBjdXJyZW50RWxlbWVudDtcclxuICAgICAgICAgIGN1cnJlbnRFbGVtZW50ID0gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICAgIH07XHJcblxyXG4gICAgICBzY29wZS4kd2F0Y2goJHNjZS5wYXJzZUFzUmVzb3VyY2VVcmwoYXR0cnMudWliVG9vbHRpcFRlbXBsYXRlVHJhbnNjbHVkZSksIGZ1bmN0aW9uKHNyYykge1xyXG4gICAgICAgIHZhciB0aGlzQ2hhbmdlSWQgPSArK2NoYW5nZUNvdW50ZXI7XHJcblxyXG4gICAgICAgIGlmIChzcmMpIHtcclxuICAgICAgICAgIC8vc2V0IHRoZSAybmQgcGFyYW0gdG8gdHJ1ZSB0byBpZ25vcmUgdGhlIHRlbXBsYXRlIHJlcXVlc3QgZXJyb3Igc28gdGhhdCB0aGUgaW5uZXJcclxuICAgICAgICAgIC8vY29udGVudHMgYW5kIHNjb3BlIGNhbiBiZSBjbGVhbmVkIHVwLlxyXG4gICAgICAgICAgJHRlbXBsYXRlUmVxdWVzdChzcmMsIHRydWUpLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXNDaGFuZ2VJZCAhPT0gY2hhbmdlQ291bnRlcikgeyByZXR1cm47IH1cclxuICAgICAgICAgICAgdmFyIG5ld1Njb3BlID0gb3JpZ1Njb3BlLiRuZXcoKTtcclxuICAgICAgICAgICAgdmFyIHRlbXBsYXRlID0gcmVzcG9uc2U7XHJcblxyXG4gICAgICAgICAgICB2YXIgY2xvbmUgPSAkY29tcGlsZSh0ZW1wbGF0ZSkobmV3U2NvcGUsIGZ1bmN0aW9uKGNsb25lKSB7XHJcbiAgICAgICAgICAgICAgY2xlYW51cExhc3RJbmNsdWRlQ29udGVudCgpO1xyXG4gICAgICAgICAgICAgICRhbmltYXRlLmVudGVyKGNsb25lLCBlbGVtKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBjdXJyZW50U2NvcGUgPSBuZXdTY29wZTtcclxuICAgICAgICAgICAgY3VycmVudEVsZW1lbnQgPSBjbG9uZTtcclxuXHJcbiAgICAgICAgICAgIGN1cnJlbnRTY29wZS4kZW1pdCgnJGluY2x1ZGVDb250ZW50TG9hZGVkJywgc3JjKTtcclxuICAgICAgICAgIH0sIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBpZiAodGhpc0NoYW5nZUlkID09PSBjaGFuZ2VDb3VudGVyKSB7XHJcbiAgICAgICAgICAgICAgY2xlYW51cExhc3RJbmNsdWRlQ29udGVudCgpO1xyXG4gICAgICAgICAgICAgIHNjb3BlLiRlbWl0KCckaW5jbHVkZUNvbnRlbnRFcnJvcicsIHNyYyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgc2NvcGUuJGVtaXQoJyRpbmNsdWRlQ29udGVudFJlcXVlc3RlZCcsIHNyYyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGNsZWFudXBMYXN0SW5jbHVkZUNvbnRlbnQoKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgc2NvcGUuJG9uKCckZGVzdHJveScsIGNsZWFudXBMYXN0SW5jbHVkZUNvbnRlbnQpO1xyXG4gICAgfVxyXG4gIH07XHJcbn1dKVxyXG5cclxuLyoqXHJcbiAqIE5vdGUgdGhhdCBpdCdzIGludGVudGlvbmFsIHRoYXQgdGhlc2UgY2xhc3NlcyBhcmUgKm5vdCogYXBwbGllZCB0aHJvdWdoICRhbmltYXRlLlxyXG4gKiBUaGV5IG11c3Qgbm90IGJlIGFuaW1hdGVkIGFzIHRoZXkncmUgZXhwZWN0ZWQgdG8gYmUgcHJlc2VudCBvbiB0aGUgdG9vbHRpcCBvblxyXG4gKiBpbml0aWFsaXphdGlvbi5cclxuICovXHJcbi5kaXJlY3RpdmUoJ3VpYlRvb2x0aXBDbGFzc2VzJywgWyckdWliUG9zaXRpb24nLCBmdW5jdGlvbigkdWliUG9zaXRpb24pIHtcclxuICByZXR1cm4ge1xyXG4gICAgcmVzdHJpY3Q6ICdBJyxcclxuICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBlbGVtZW50LCBhdHRycykge1xyXG4gICAgICAvLyBuZWVkIHRvIHNldCB0aGUgcHJpbWFyeSBwb3NpdGlvbiBzbyB0aGVcclxuICAgICAgLy8gYXJyb3cgaGFzIHNwYWNlIGR1cmluZyBwb3NpdGlvbiBtZWFzdXJlLlxyXG4gICAgICAvLyB0b29sdGlwLnBvc2l0aW9uVG9vbHRpcCgpXHJcbiAgICAgIGlmIChzY29wZS5wbGFjZW1lbnQpIHtcclxuICAgICAgICAvLyAvLyBUaGVyZSBhcmUgbm8gdG9wLWxlZnQgZXRjLi4uIGNsYXNzZXNcclxuICAgICAgICAvLyAvLyBpbiBUV0JTLCBzbyB3ZSBuZWVkIHRoZSBwcmltYXJ5IHBvc2l0aW9uLlxyXG4gICAgICAgIHZhciBwb3NpdGlvbiA9ICR1aWJQb3NpdGlvbi5wYXJzZVBsYWNlbWVudChzY29wZS5wbGFjZW1lbnQpO1xyXG4gICAgICAgIGVsZW1lbnQuYWRkQ2xhc3MocG9zaXRpb25bMF0pO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoc2NvcGUucG9wdXBDbGFzcykge1xyXG4gICAgICAgIGVsZW1lbnQuYWRkQ2xhc3Moc2NvcGUucG9wdXBDbGFzcyk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChzY29wZS5hbmltYXRpb24pIHtcclxuICAgICAgICBlbGVtZW50LmFkZENsYXNzKGF0dHJzLnRvb2x0aXBBbmltYXRpb25DbGFzcyk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9O1xyXG59XSlcclxuXHJcbi5kaXJlY3RpdmUoJ3VpYlRvb2x0aXBQb3B1cCcsIGZ1bmN0aW9uKCkge1xyXG4gIHJldHVybiB7XHJcbiAgICByZXN0cmljdDogJ0EnLFxyXG4gICAgc2NvcGU6IHsgY29udGVudDogJ0AnIH0sXHJcbiAgICB0ZW1wbGF0ZVVybDogJ3VpYi90ZW1wbGF0ZS90b29sdGlwL3Rvb2x0aXAtcG9wdXAuaHRtbCdcclxuICB9O1xyXG59KVxyXG5cclxuLmRpcmVjdGl2ZSgndWliVG9vbHRpcCcsIFsgJyR1aWJUb29sdGlwJywgZnVuY3Rpb24oJHVpYlRvb2x0aXApIHtcclxuICByZXR1cm4gJHVpYlRvb2x0aXAoJ3VpYlRvb2x0aXAnLCAndG9vbHRpcCcsICdtb3VzZWVudGVyJyk7XHJcbn1dKVxyXG5cclxuLmRpcmVjdGl2ZSgndWliVG9vbHRpcFRlbXBsYXRlUG9wdXAnLCBmdW5jdGlvbigpIHtcclxuICByZXR1cm4ge1xyXG4gICAgcmVzdHJpY3Q6ICdBJyxcclxuICAgIHNjb3BlOiB7IGNvbnRlbnRFeHA6ICcmJywgb3JpZ2luU2NvcGU6ICcmJyB9LFxyXG4gICAgdGVtcGxhdGVVcmw6ICd1aWIvdGVtcGxhdGUvdG9vbHRpcC90b29sdGlwLXRlbXBsYXRlLXBvcHVwLmh0bWwnXHJcbiAgfTtcclxufSlcclxuXHJcbi5kaXJlY3RpdmUoJ3VpYlRvb2x0aXBUZW1wbGF0ZScsIFsnJHVpYlRvb2x0aXAnLCBmdW5jdGlvbigkdWliVG9vbHRpcCkge1xyXG4gIHJldHVybiAkdWliVG9vbHRpcCgndWliVG9vbHRpcFRlbXBsYXRlJywgJ3Rvb2x0aXAnLCAnbW91c2VlbnRlcicsIHtcclxuICAgIHVzZUNvbnRlbnRFeHA6IHRydWVcclxuICB9KTtcclxufV0pXHJcblxyXG4uZGlyZWN0aXZlKCd1aWJUb29sdGlwSHRtbFBvcHVwJywgZnVuY3Rpb24oKSB7XHJcbiAgcmV0dXJuIHtcclxuICAgIHJlc3RyaWN0OiAnQScsXHJcbiAgICBzY29wZTogeyBjb250ZW50RXhwOiAnJicgfSxcclxuICAgIHRlbXBsYXRlVXJsOiAndWliL3RlbXBsYXRlL3Rvb2x0aXAvdG9vbHRpcC1odG1sLXBvcHVwLmh0bWwnXHJcbiAgfTtcclxufSlcclxuXHJcbi5kaXJlY3RpdmUoJ3VpYlRvb2x0aXBIdG1sJywgWyckdWliVG9vbHRpcCcsIGZ1bmN0aW9uKCR1aWJUb29sdGlwKSB7XHJcbiAgcmV0dXJuICR1aWJUb29sdGlwKCd1aWJUb29sdGlwSHRtbCcsICd0b29sdGlwJywgJ21vdXNlZW50ZXInLCB7XHJcbiAgICB1c2VDb250ZW50RXhwOiB0cnVlXHJcbiAgfSk7XHJcbn1dKTtcclxuXHJcbi8qKlxyXG4gKiBUaGUgZm9sbG93aW5nIGZlYXR1cmVzIGFyZSBzdGlsbCBvdXRzdGFuZGluZzogcG9wdXAgZGVsYXksIGFuaW1hdGlvbiBhcyBhXHJcbiAqIGZ1bmN0aW9uLCBwbGFjZW1lbnQgYXMgYSBmdW5jdGlvbiwgaW5zaWRlLCBzdXBwb3J0IGZvciBtb3JlIHRyaWdnZXJzIHRoYW5cclxuICoganVzdCBtb3VzZSBlbnRlci9sZWF2ZSwgYW5kIHNlbGVjdG9yIGRlbGVnYXRhdGlvbi5cclxuICovXHJcbmFuZ3VsYXIubW9kdWxlKCd1aS5ib290c3RyYXAucG9wb3ZlcicsIFsndWkuYm9vdHN0cmFwLnRvb2x0aXAnXSlcclxuXHJcbi5kaXJlY3RpdmUoJ3VpYlBvcG92ZXJUZW1wbGF0ZVBvcHVwJywgZnVuY3Rpb24oKSB7XHJcbiAgcmV0dXJuIHtcclxuICAgIHJlc3RyaWN0OiAnQScsXHJcbiAgICBzY29wZTogeyB1aWJUaXRsZTogJ0AnLCBjb250ZW50RXhwOiAnJicsIG9yaWdpblNjb3BlOiAnJicgfSxcclxuICAgIHRlbXBsYXRlVXJsOiAndWliL3RlbXBsYXRlL3BvcG92ZXIvcG9wb3Zlci10ZW1wbGF0ZS5odG1sJ1xyXG4gIH07XHJcbn0pXHJcblxyXG4uZGlyZWN0aXZlKCd1aWJQb3BvdmVyVGVtcGxhdGUnLCBbJyR1aWJUb29sdGlwJywgZnVuY3Rpb24oJHVpYlRvb2x0aXApIHtcclxuICByZXR1cm4gJHVpYlRvb2x0aXAoJ3VpYlBvcG92ZXJUZW1wbGF0ZScsICdwb3BvdmVyJywgJ2NsaWNrJywge1xyXG4gICAgdXNlQ29udGVudEV4cDogdHJ1ZVxyXG4gIH0pO1xyXG59XSlcclxuXHJcbi5kaXJlY3RpdmUoJ3VpYlBvcG92ZXJIdG1sUG9wdXAnLCBmdW5jdGlvbigpIHtcclxuICByZXR1cm4ge1xyXG4gICAgcmVzdHJpY3Q6ICdBJyxcclxuICAgIHNjb3BlOiB7IGNvbnRlbnRFeHA6ICcmJywgdWliVGl0bGU6ICdAJyB9LFxyXG4gICAgdGVtcGxhdGVVcmw6ICd1aWIvdGVtcGxhdGUvcG9wb3Zlci9wb3BvdmVyLWh0bWwuaHRtbCdcclxuICB9O1xyXG59KVxyXG5cclxuLmRpcmVjdGl2ZSgndWliUG9wb3Zlckh0bWwnLCBbJyR1aWJUb29sdGlwJywgZnVuY3Rpb24oJHVpYlRvb2x0aXApIHtcclxuICByZXR1cm4gJHVpYlRvb2x0aXAoJ3VpYlBvcG92ZXJIdG1sJywgJ3BvcG92ZXInLCAnY2xpY2snLCB7XHJcbiAgICB1c2VDb250ZW50RXhwOiB0cnVlXHJcbiAgfSk7XHJcbn1dKVxyXG5cclxuLmRpcmVjdGl2ZSgndWliUG9wb3ZlclBvcHVwJywgZnVuY3Rpb24oKSB7XHJcbiAgcmV0dXJuIHtcclxuICAgIHJlc3RyaWN0OiAnQScsXHJcbiAgICBzY29wZTogeyB1aWJUaXRsZTogJ0AnLCBjb250ZW50OiAnQCcgfSxcclxuICAgIHRlbXBsYXRlVXJsOiAndWliL3RlbXBsYXRlL3BvcG92ZXIvcG9wb3Zlci5odG1sJ1xyXG4gIH07XHJcbn0pXHJcblxyXG4uZGlyZWN0aXZlKCd1aWJQb3BvdmVyJywgWyckdWliVG9vbHRpcCcsIGZ1bmN0aW9uKCR1aWJUb29sdGlwKSB7XHJcbiAgcmV0dXJuICR1aWJUb29sdGlwKCd1aWJQb3BvdmVyJywgJ3BvcG92ZXInLCAnY2xpY2snKTtcclxufV0pO1xyXG5cclxuYW5ndWxhci5tb2R1bGUoJ3VpLmJvb3RzdHJhcC5wcm9ncmVzc2JhcicsIFtdKVxyXG5cclxuLmNvbnN0YW50KCd1aWJQcm9ncmVzc0NvbmZpZycsIHtcclxuICBhbmltYXRlOiB0cnVlLFxyXG4gIG1heDogMTAwXHJcbn0pXHJcblxyXG4uY29udHJvbGxlcignVWliUHJvZ3Jlc3NDb250cm9sbGVyJywgWyckc2NvcGUnLCAnJGF0dHJzJywgJ3VpYlByb2dyZXNzQ29uZmlnJywgZnVuY3Rpb24oJHNjb3BlLCAkYXR0cnMsIHByb2dyZXNzQ29uZmlnKSB7XHJcbiAgdmFyIHNlbGYgPSB0aGlzLFxyXG4gICAgICBhbmltYXRlID0gYW5ndWxhci5pc0RlZmluZWQoJGF0dHJzLmFuaW1hdGUpID8gJHNjb3BlLiRwYXJlbnQuJGV2YWwoJGF0dHJzLmFuaW1hdGUpIDogcHJvZ3Jlc3NDb25maWcuYW5pbWF0ZTtcclxuXHJcbiAgdGhpcy5iYXJzID0gW107XHJcbiAgJHNjb3BlLm1heCA9IGdldE1heE9yRGVmYXVsdCgpO1xyXG5cclxuICB0aGlzLmFkZEJhciA9IGZ1bmN0aW9uKGJhciwgZWxlbWVudCwgYXR0cnMpIHtcclxuICAgIGlmICghYW5pbWF0ZSkge1xyXG4gICAgICBlbGVtZW50LmNzcyh7J3RyYW5zaXRpb24nOiAnbm9uZSd9KTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmJhcnMucHVzaChiYXIpO1xyXG5cclxuICAgIGJhci5tYXggPSBnZXRNYXhPckRlZmF1bHQoKTtcclxuICAgIGJhci50aXRsZSA9IGF0dHJzICYmIGFuZ3VsYXIuaXNEZWZpbmVkKGF0dHJzLnRpdGxlKSA/IGF0dHJzLnRpdGxlIDogJ3Byb2dyZXNzYmFyJztcclxuXHJcbiAgICBiYXIuJHdhdGNoKCd2YWx1ZScsIGZ1bmN0aW9uKHZhbHVlKSB7XHJcbiAgICAgIGJhci5yZWNhbGN1bGF0ZVBlcmNlbnRhZ2UoKTtcclxuICAgIH0pO1xyXG5cclxuICAgIGJhci5yZWNhbGN1bGF0ZVBlcmNlbnRhZ2UgPSBmdW5jdGlvbigpIHtcclxuICAgICAgdmFyIHRvdGFsUGVyY2VudGFnZSA9IHNlbGYuYmFycy5yZWR1Y2UoZnVuY3Rpb24odG90YWwsIGJhcikge1xyXG4gICAgICAgIGJhci5wZXJjZW50ID0gKygxMDAgKiBiYXIudmFsdWUgLyBiYXIubWF4KS50b0ZpeGVkKDIpO1xyXG4gICAgICAgIHJldHVybiB0b3RhbCArIGJhci5wZXJjZW50O1xyXG4gICAgICB9LCAwKTtcclxuXHJcbiAgICAgIGlmICh0b3RhbFBlcmNlbnRhZ2UgPiAxMDApIHtcclxuICAgICAgICBiYXIucGVyY2VudCAtPSB0b3RhbFBlcmNlbnRhZ2UgLSAxMDA7XHJcbiAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgYmFyLiRvbignJGRlc3Ryb3knLCBmdW5jdGlvbigpIHtcclxuICAgICAgZWxlbWVudCA9IG51bGw7XHJcbiAgICAgIHNlbGYucmVtb3ZlQmFyKGJhcik7XHJcbiAgICB9KTtcclxuICB9O1xyXG5cclxuICB0aGlzLnJlbW92ZUJhciA9IGZ1bmN0aW9uKGJhcikge1xyXG4gICAgdGhpcy5iYXJzLnNwbGljZSh0aGlzLmJhcnMuaW5kZXhPZihiYXIpLCAxKTtcclxuICAgIHRoaXMuYmFycy5mb3JFYWNoKGZ1bmN0aW9uIChiYXIpIHtcclxuICAgICAgYmFyLnJlY2FsY3VsYXRlUGVyY2VudGFnZSgpO1xyXG4gICAgfSk7XHJcbiAgfTtcclxuXHJcbiAgLy8kYXR0cnMuJG9ic2VydmUoJ21heFBhcmFtJywgZnVuY3Rpb24obWF4UGFyYW0pIHtcclxuICAkc2NvcGUuJHdhdGNoKCdtYXhQYXJhbScsIGZ1bmN0aW9uKG1heFBhcmFtKSB7XHJcbiAgICBzZWxmLmJhcnMuZm9yRWFjaChmdW5jdGlvbihiYXIpIHtcclxuICAgICAgYmFyLm1heCA9IGdldE1heE9yRGVmYXVsdCgpO1xyXG4gICAgICBiYXIucmVjYWxjdWxhdGVQZXJjZW50YWdlKCk7XHJcbiAgICB9KTtcclxuICB9KTtcclxuXHJcbiAgZnVuY3Rpb24gZ2V0TWF4T3JEZWZhdWx0ICgpIHtcclxuICAgIHJldHVybiBhbmd1bGFyLmlzRGVmaW5lZCgkc2NvcGUubWF4UGFyYW0pID8gJHNjb3BlLm1heFBhcmFtIDogcHJvZ3Jlc3NDb25maWcubWF4O1xyXG4gIH1cclxufV0pXHJcblxyXG4uZGlyZWN0aXZlKCd1aWJQcm9ncmVzcycsIGZ1bmN0aW9uKCkge1xyXG4gIHJldHVybiB7XHJcbiAgICByZXBsYWNlOiB0cnVlLFxyXG4gICAgdHJhbnNjbHVkZTogdHJ1ZSxcclxuICAgIGNvbnRyb2xsZXI6ICdVaWJQcm9ncmVzc0NvbnRyb2xsZXInLFxyXG4gICAgcmVxdWlyZTogJ3VpYlByb2dyZXNzJyxcclxuICAgIHNjb3BlOiB7XHJcbiAgICAgIG1heFBhcmFtOiAnPT9tYXgnXHJcbiAgICB9LFxyXG4gICAgdGVtcGxhdGVVcmw6ICd1aWIvdGVtcGxhdGUvcHJvZ3Jlc3NiYXIvcHJvZ3Jlc3MuaHRtbCdcclxuICB9O1xyXG59KVxyXG5cclxuLmRpcmVjdGl2ZSgndWliQmFyJywgZnVuY3Rpb24oKSB7XHJcbiAgcmV0dXJuIHtcclxuICAgIHJlcGxhY2U6IHRydWUsXHJcbiAgICB0cmFuc2NsdWRlOiB0cnVlLFxyXG4gICAgcmVxdWlyZTogJ151aWJQcm9ncmVzcycsXHJcbiAgICBzY29wZToge1xyXG4gICAgICB2YWx1ZTogJz0nLFxyXG4gICAgICB0eXBlOiAnQCdcclxuICAgIH0sXHJcbiAgICB0ZW1wbGF0ZVVybDogJ3VpYi90ZW1wbGF0ZS9wcm9ncmVzc2Jhci9iYXIuaHRtbCcsXHJcbiAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxlbWVudCwgYXR0cnMsIHByb2dyZXNzQ3RybCkge1xyXG4gICAgICBwcm9ncmVzc0N0cmwuYWRkQmFyKHNjb3BlLCBlbGVtZW50LCBhdHRycyk7XHJcbiAgICB9XHJcbiAgfTtcclxufSlcclxuXHJcbi5kaXJlY3RpdmUoJ3VpYlByb2dyZXNzYmFyJywgZnVuY3Rpb24oKSB7XHJcbiAgcmV0dXJuIHtcclxuICAgIHJlcGxhY2U6IHRydWUsXHJcbiAgICB0cmFuc2NsdWRlOiB0cnVlLFxyXG4gICAgY29udHJvbGxlcjogJ1VpYlByb2dyZXNzQ29udHJvbGxlcicsXHJcbiAgICBzY29wZToge1xyXG4gICAgICB2YWx1ZTogJz0nLFxyXG4gICAgICBtYXhQYXJhbTogJz0/bWF4JyxcclxuICAgICAgdHlwZTogJ0AnXHJcbiAgICB9LFxyXG4gICAgdGVtcGxhdGVVcmw6ICd1aWIvdGVtcGxhdGUvcHJvZ3Jlc3NiYXIvcHJvZ3Jlc3NiYXIuaHRtbCcsXHJcbiAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxlbWVudCwgYXR0cnMsIHByb2dyZXNzQ3RybCkge1xyXG4gICAgICBwcm9ncmVzc0N0cmwuYWRkQmFyKHNjb3BlLCBhbmd1bGFyLmVsZW1lbnQoZWxlbWVudC5jaGlsZHJlbigpWzBdKSwge3RpdGxlOiBhdHRycy50aXRsZX0pO1xyXG4gICAgfVxyXG4gIH07XHJcbn0pO1xyXG5cclxuYW5ndWxhci5tb2R1bGUoJ3VpLmJvb3RzdHJhcC5yYXRpbmcnLCBbXSlcclxuXHJcbi5jb25zdGFudCgndWliUmF0aW5nQ29uZmlnJywge1xyXG4gIG1heDogNSxcclxuICBzdGF0ZU9uOiBudWxsLFxyXG4gIHN0YXRlT2ZmOiBudWxsLFxyXG4gIGVuYWJsZVJlc2V0OiB0cnVlLFxyXG4gIHRpdGxlczogWydvbmUnLCAndHdvJywgJ3RocmVlJywgJ2ZvdXInLCAnZml2ZSddXHJcbn0pXHJcblxyXG4uY29udHJvbGxlcignVWliUmF0aW5nQ29udHJvbGxlcicsIFsnJHNjb3BlJywgJyRhdHRycycsICd1aWJSYXRpbmdDb25maWcnLCBmdW5jdGlvbigkc2NvcGUsICRhdHRycywgcmF0aW5nQ29uZmlnKSB7XHJcbiAgdmFyIG5nTW9kZWxDdHJsID0geyAkc2V0Vmlld1ZhbHVlOiBhbmd1bGFyLm5vb3AgfSxcclxuICAgIHNlbGYgPSB0aGlzO1xyXG5cclxuICB0aGlzLmluaXQgPSBmdW5jdGlvbihuZ01vZGVsQ3RybF8pIHtcclxuICAgIG5nTW9kZWxDdHJsID0gbmdNb2RlbEN0cmxfO1xyXG4gICAgbmdNb2RlbEN0cmwuJHJlbmRlciA9IHRoaXMucmVuZGVyO1xyXG5cclxuICAgIG5nTW9kZWxDdHJsLiRmb3JtYXR0ZXJzLnB1c2goZnVuY3Rpb24odmFsdWUpIHtcclxuICAgICAgaWYgKGFuZ3VsYXIuaXNOdW1iZXIodmFsdWUpICYmIHZhbHVlIDw8IDAgIT09IHZhbHVlKSB7XHJcbiAgICAgICAgdmFsdWUgPSBNYXRoLnJvdW5kKHZhbHVlKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIHZhbHVlO1xyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy5zdGF0ZU9uID0gYW5ndWxhci5pc0RlZmluZWQoJGF0dHJzLnN0YXRlT24pID8gJHNjb3BlLiRwYXJlbnQuJGV2YWwoJGF0dHJzLnN0YXRlT24pIDogcmF0aW5nQ29uZmlnLnN0YXRlT247XHJcbiAgICB0aGlzLnN0YXRlT2ZmID0gYW5ndWxhci5pc0RlZmluZWQoJGF0dHJzLnN0YXRlT2ZmKSA/ICRzY29wZS4kcGFyZW50LiRldmFsKCRhdHRycy5zdGF0ZU9mZikgOiByYXRpbmdDb25maWcuc3RhdGVPZmY7XHJcbiAgICB0aGlzLmVuYWJsZVJlc2V0ID0gYW5ndWxhci5pc0RlZmluZWQoJGF0dHJzLmVuYWJsZVJlc2V0KSA/XHJcbiAgICAgICRzY29wZS4kcGFyZW50LiRldmFsKCRhdHRycy5lbmFibGVSZXNldCkgOiByYXRpbmdDb25maWcuZW5hYmxlUmVzZXQ7XHJcbiAgICB2YXIgdG1wVGl0bGVzID0gYW5ndWxhci5pc0RlZmluZWQoJGF0dHJzLnRpdGxlcykgPyAkc2NvcGUuJHBhcmVudC4kZXZhbCgkYXR0cnMudGl0bGVzKSA6IHJhdGluZ0NvbmZpZy50aXRsZXM7XHJcbiAgICB0aGlzLnRpdGxlcyA9IGFuZ3VsYXIuaXNBcnJheSh0bXBUaXRsZXMpICYmIHRtcFRpdGxlcy5sZW5ndGggPiAwID9cclxuICAgICAgdG1wVGl0bGVzIDogcmF0aW5nQ29uZmlnLnRpdGxlcztcclxuXHJcbiAgICB2YXIgcmF0aW5nU3RhdGVzID0gYW5ndWxhci5pc0RlZmluZWQoJGF0dHJzLnJhdGluZ1N0YXRlcykgP1xyXG4gICAgICAkc2NvcGUuJHBhcmVudC4kZXZhbCgkYXR0cnMucmF0aW5nU3RhdGVzKSA6XHJcbiAgICAgIG5ldyBBcnJheShhbmd1bGFyLmlzRGVmaW5lZCgkYXR0cnMubWF4KSA/ICRzY29wZS4kcGFyZW50LiRldmFsKCRhdHRycy5tYXgpIDogcmF0aW5nQ29uZmlnLm1heCk7XHJcbiAgICAkc2NvcGUucmFuZ2UgPSB0aGlzLmJ1aWxkVGVtcGxhdGVPYmplY3RzKHJhdGluZ1N0YXRlcyk7XHJcbiAgfTtcclxuXHJcbiAgdGhpcy5idWlsZFRlbXBsYXRlT2JqZWN0cyA9IGZ1bmN0aW9uKHN0YXRlcykge1xyXG4gICAgZm9yICh2YXIgaSA9IDAsIG4gPSBzdGF0ZXMubGVuZ3RoOyBpIDwgbjsgaSsrKSB7XHJcbiAgICAgIHN0YXRlc1tpXSA9IGFuZ3VsYXIuZXh0ZW5kKHsgaW5kZXg6IGkgfSwgeyBzdGF0ZU9uOiB0aGlzLnN0YXRlT24sIHN0YXRlT2ZmOiB0aGlzLnN0YXRlT2ZmLCB0aXRsZTogdGhpcy5nZXRUaXRsZShpKSB9LCBzdGF0ZXNbaV0pO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHN0YXRlcztcclxuICB9O1xyXG5cclxuICB0aGlzLmdldFRpdGxlID0gZnVuY3Rpb24oaW5kZXgpIHtcclxuICAgIGlmIChpbmRleCA+PSB0aGlzLnRpdGxlcy5sZW5ndGgpIHtcclxuICAgICAgcmV0dXJuIGluZGV4ICsgMTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdGhpcy50aXRsZXNbaW5kZXhdO1xyXG4gIH07XHJcblxyXG4gICRzY29wZS5yYXRlID0gZnVuY3Rpb24odmFsdWUpIHtcclxuICAgIGlmICghJHNjb3BlLnJlYWRvbmx5ICYmIHZhbHVlID49IDAgJiYgdmFsdWUgPD0gJHNjb3BlLnJhbmdlLmxlbmd0aCkge1xyXG4gICAgICB2YXIgbmV3Vmlld1ZhbHVlID0gc2VsZi5lbmFibGVSZXNldCAmJiBuZ01vZGVsQ3RybC4kdmlld1ZhbHVlID09PSB2YWx1ZSA/IDAgOiB2YWx1ZTtcclxuICAgICAgbmdNb2RlbEN0cmwuJHNldFZpZXdWYWx1ZShuZXdWaWV3VmFsdWUpO1xyXG4gICAgICBuZ01vZGVsQ3RybC4kcmVuZGVyKCk7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgJHNjb3BlLmVudGVyID0gZnVuY3Rpb24odmFsdWUpIHtcclxuICAgIGlmICghJHNjb3BlLnJlYWRvbmx5KSB7XHJcbiAgICAgICRzY29wZS52YWx1ZSA9IHZhbHVlO1xyXG4gICAgfVxyXG4gICAgJHNjb3BlLm9uSG92ZXIoe3ZhbHVlOiB2YWx1ZX0pO1xyXG4gIH07XHJcblxyXG4gICRzY29wZS5yZXNldCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgJHNjb3BlLnZhbHVlID0gbmdNb2RlbEN0cmwuJHZpZXdWYWx1ZTtcclxuICAgICRzY29wZS5vbkxlYXZlKCk7XHJcbiAgfTtcclxuXHJcbiAgJHNjb3BlLm9uS2V5ZG93biA9IGZ1bmN0aW9uKGV2dCkge1xyXG4gICAgaWYgKC8oMzd8Mzh8Mzl8NDApLy50ZXN0KGV2dC53aGljaCkpIHtcclxuICAgICAgZXZ0LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgIGV2dC5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgJHNjb3BlLnJhdGUoJHNjb3BlLnZhbHVlICsgKGV2dC53aGljaCA9PT0gMzggfHwgZXZ0LndoaWNoID09PSAzOSA/IDEgOiAtMSkpO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIHRoaXMucmVuZGVyID0gZnVuY3Rpb24oKSB7XHJcbiAgICAkc2NvcGUudmFsdWUgPSBuZ01vZGVsQ3RybC4kdmlld1ZhbHVlO1xyXG4gICAgJHNjb3BlLnRpdGxlID0gc2VsZi5nZXRUaXRsZSgkc2NvcGUudmFsdWUgLSAxKTtcclxuICB9O1xyXG59XSlcclxuXHJcbi5kaXJlY3RpdmUoJ3VpYlJhdGluZycsIGZ1bmN0aW9uKCkge1xyXG4gIHJldHVybiB7XHJcbiAgICByZXF1aXJlOiBbJ3VpYlJhdGluZycsICduZ01vZGVsJ10sXHJcbiAgICByZXN0cmljdDogJ0EnLFxyXG4gICAgc2NvcGU6IHtcclxuICAgICAgcmVhZG9ubHk6ICc9P3JlYWRPbmx5JyxcclxuICAgICAgb25Ib3ZlcjogJyYnLFxyXG4gICAgICBvbkxlYXZlOiAnJidcclxuICAgIH0sXHJcbiAgICBjb250cm9sbGVyOiAnVWliUmF0aW5nQ29udHJvbGxlcicsXHJcbiAgICB0ZW1wbGF0ZVVybDogJ3VpYi90ZW1wbGF0ZS9yYXRpbmcvcmF0aW5nLmh0bWwnLFxyXG4gICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCBjdHJscykge1xyXG4gICAgICB2YXIgcmF0aW5nQ3RybCA9IGN0cmxzWzBdLCBuZ01vZGVsQ3RybCA9IGN0cmxzWzFdO1xyXG4gICAgICByYXRpbmdDdHJsLmluaXQobmdNb2RlbEN0cmwpO1xyXG4gICAgfVxyXG4gIH07XHJcbn0pO1xyXG5cclxuYW5ndWxhci5tb2R1bGUoJ3VpLmJvb3RzdHJhcC50YWJzJywgW10pXHJcblxyXG4uY29udHJvbGxlcignVWliVGFic2V0Q29udHJvbGxlcicsIFsnJHNjb3BlJywgZnVuY3Rpb24gKCRzY29wZSkge1xyXG4gIHZhciBjdHJsID0gdGhpcyxcclxuICAgIG9sZEluZGV4O1xyXG4gIGN0cmwudGFicyA9IFtdO1xyXG5cclxuICBjdHJsLnNlbGVjdCA9IGZ1bmN0aW9uKGluZGV4LCBldnQpIHtcclxuICAgIGlmICghZGVzdHJveWVkKSB7XHJcbiAgICAgIHZhciBwcmV2aW91c0luZGV4ID0gZmluZFRhYkluZGV4KG9sZEluZGV4KTtcclxuICAgICAgdmFyIHByZXZpb3VzU2VsZWN0ZWQgPSBjdHJsLnRhYnNbcHJldmlvdXNJbmRleF07XHJcbiAgICAgIGlmIChwcmV2aW91c1NlbGVjdGVkKSB7XHJcbiAgICAgICAgcHJldmlvdXNTZWxlY3RlZC50YWIub25EZXNlbGVjdCh7XHJcbiAgICAgICAgICAkZXZlbnQ6IGV2dCxcclxuICAgICAgICAgICRzZWxlY3RlZEluZGV4OiBpbmRleFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGlmIChldnQgJiYgZXZ0LmlzRGVmYXVsdFByZXZlbnRlZCgpKSB7XHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHByZXZpb3VzU2VsZWN0ZWQudGFiLmFjdGl2ZSA9IGZhbHNlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB2YXIgc2VsZWN0ZWQgPSBjdHJsLnRhYnNbaW5kZXhdO1xyXG4gICAgICBpZiAoc2VsZWN0ZWQpIHtcclxuICAgICAgICBzZWxlY3RlZC50YWIub25TZWxlY3Qoe1xyXG4gICAgICAgICAgJGV2ZW50OiBldnRcclxuICAgICAgICB9KTtcclxuICAgICAgICBzZWxlY3RlZC50YWIuYWN0aXZlID0gdHJ1ZTtcclxuICAgICAgICBjdHJsLmFjdGl2ZSA9IHNlbGVjdGVkLmluZGV4O1xyXG4gICAgICAgIG9sZEluZGV4ID0gc2VsZWN0ZWQuaW5kZXg7XHJcbiAgICAgIH0gZWxzZSBpZiAoIXNlbGVjdGVkICYmIGFuZ3VsYXIuaXNEZWZpbmVkKG9sZEluZGV4KSkge1xyXG4gICAgICAgIGN0cmwuYWN0aXZlID0gbnVsbDtcclxuICAgICAgICBvbGRJbmRleCA9IG51bGw7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9O1xyXG5cclxuICBjdHJsLmFkZFRhYiA9IGZ1bmN0aW9uIGFkZFRhYih0YWIpIHtcclxuICAgIGN0cmwudGFicy5wdXNoKHtcclxuICAgICAgdGFiOiB0YWIsXHJcbiAgICAgIGluZGV4OiB0YWIuaW5kZXhcclxuICAgIH0pO1xyXG4gICAgY3RybC50YWJzLnNvcnQoZnVuY3Rpb24odDEsIHQyKSB7XHJcbiAgICAgIGlmICh0MS5pbmRleCA+IHQyLmluZGV4KSB7XHJcbiAgICAgICAgcmV0dXJuIDE7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmICh0MS5pbmRleCA8IHQyLmluZGV4KSB7XHJcbiAgICAgICAgcmV0dXJuIC0xO1xyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4gMDtcclxuICAgIH0pO1xyXG5cclxuICAgIGlmICh0YWIuaW5kZXggPT09IGN0cmwuYWN0aXZlIHx8ICFhbmd1bGFyLmlzRGVmaW5lZChjdHJsLmFjdGl2ZSkgJiYgY3RybC50YWJzLmxlbmd0aCA9PT0gMSkge1xyXG4gICAgICB2YXIgbmV3QWN0aXZlSW5kZXggPSBmaW5kVGFiSW5kZXgodGFiLmluZGV4KTtcclxuICAgICAgY3RybC5zZWxlY3QobmV3QWN0aXZlSW5kZXgpO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIGN0cmwucmVtb3ZlVGFiID0gZnVuY3Rpb24gcmVtb3ZlVGFiKHRhYikge1xyXG4gICAgdmFyIGluZGV4O1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjdHJsLnRhYnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgaWYgKGN0cmwudGFic1tpXS50YWIgPT09IHRhYikge1xyXG4gICAgICAgIGluZGV4ID0gaTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlmIChjdHJsLnRhYnNbaW5kZXhdLmluZGV4ID09PSBjdHJsLmFjdGl2ZSkge1xyXG4gICAgICB2YXIgbmV3QWN0aXZlVGFiSW5kZXggPSBpbmRleCA9PT0gY3RybC50YWJzLmxlbmd0aCAtIDEgP1xyXG4gICAgICAgIGluZGV4IC0gMSA6IGluZGV4ICsgMSAlIGN0cmwudGFicy5sZW5ndGg7XHJcbiAgICAgIGN0cmwuc2VsZWN0KG5ld0FjdGl2ZVRhYkluZGV4KTtcclxuICAgIH1cclxuXHJcbiAgICBjdHJsLnRhYnMuc3BsaWNlKGluZGV4LCAxKTtcclxuICB9O1xyXG5cclxuICAkc2NvcGUuJHdhdGNoKCd0YWJzZXQuYWN0aXZlJywgZnVuY3Rpb24odmFsKSB7XHJcbiAgICBpZiAoYW5ndWxhci5pc0RlZmluZWQodmFsKSAmJiB2YWwgIT09IG9sZEluZGV4KSB7XHJcbiAgICAgIGN0cmwuc2VsZWN0KGZpbmRUYWJJbmRleCh2YWwpKTtcclxuICAgIH1cclxuICB9KTtcclxuXHJcbiAgdmFyIGRlc3Ryb3llZDtcclxuICAkc2NvcGUuJG9uKCckZGVzdHJveScsIGZ1bmN0aW9uKCkge1xyXG4gICAgZGVzdHJveWVkID0gdHJ1ZTtcclxuICB9KTtcclxuXHJcbiAgZnVuY3Rpb24gZmluZFRhYkluZGV4KGluZGV4KSB7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGN0cmwudGFicy5sZW5ndGg7IGkrKykge1xyXG4gICAgICBpZiAoY3RybC50YWJzW2ldLmluZGV4ID09PSBpbmRleCkge1xyXG4gICAgICAgIHJldHVybiBpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG59XSlcclxuXHJcbi5kaXJlY3RpdmUoJ3VpYlRhYnNldCcsIGZ1bmN0aW9uKCkge1xyXG4gIHJldHVybiB7XHJcbiAgICB0cmFuc2NsdWRlOiB0cnVlLFxyXG4gICAgcmVwbGFjZTogdHJ1ZSxcclxuICAgIHNjb3BlOiB7fSxcclxuICAgIGJpbmRUb0NvbnRyb2xsZXI6IHtcclxuICAgICAgYWN0aXZlOiAnPT8nLFxyXG4gICAgICB0eXBlOiAnQCdcclxuICAgIH0sXHJcbiAgICBjb250cm9sbGVyOiAnVWliVGFic2V0Q29udHJvbGxlcicsXHJcbiAgICBjb250cm9sbGVyQXM6ICd0YWJzZXQnLFxyXG4gICAgdGVtcGxhdGVVcmw6IGZ1bmN0aW9uKGVsZW1lbnQsIGF0dHJzKSB7XHJcbiAgICAgIHJldHVybiBhdHRycy50ZW1wbGF0ZVVybCB8fCAndWliL3RlbXBsYXRlL3RhYnMvdGFic2V0Lmh0bWwnO1xyXG4gICAgfSxcclxuICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBlbGVtZW50LCBhdHRycykge1xyXG4gICAgICBzY29wZS52ZXJ0aWNhbCA9IGFuZ3VsYXIuaXNEZWZpbmVkKGF0dHJzLnZlcnRpY2FsKSA/XHJcbiAgICAgICAgc2NvcGUuJHBhcmVudC4kZXZhbChhdHRycy52ZXJ0aWNhbCkgOiBmYWxzZTtcclxuICAgICAgc2NvcGUuanVzdGlmaWVkID0gYW5ndWxhci5pc0RlZmluZWQoYXR0cnMuanVzdGlmaWVkKSA/XHJcbiAgICAgICAgc2NvcGUuJHBhcmVudC4kZXZhbChhdHRycy5qdXN0aWZpZWQpIDogZmFsc2U7XHJcbiAgICB9XHJcbiAgfTtcclxufSlcclxuXHJcbi5kaXJlY3RpdmUoJ3VpYlRhYicsIFsnJHBhcnNlJywgZnVuY3Rpb24oJHBhcnNlKSB7XHJcbiAgcmV0dXJuIHtcclxuICAgIHJlcXVpcmU6ICdedWliVGFic2V0JyxcclxuICAgIHJlcGxhY2U6IHRydWUsXHJcbiAgICB0ZW1wbGF0ZVVybDogZnVuY3Rpb24oZWxlbWVudCwgYXR0cnMpIHtcclxuICAgICAgcmV0dXJuIGF0dHJzLnRlbXBsYXRlVXJsIHx8ICd1aWIvdGVtcGxhdGUvdGFicy90YWIuaHRtbCc7XHJcbiAgICB9LFxyXG4gICAgdHJhbnNjbHVkZTogdHJ1ZSxcclxuICAgIHNjb3BlOiB7XHJcbiAgICAgIGhlYWRpbmc6ICdAJyxcclxuICAgICAgaW5kZXg6ICc9PycsXHJcbiAgICAgIGNsYXNzZXM6ICdAPycsXHJcbiAgICAgIG9uU2VsZWN0OiAnJnNlbGVjdCcsIC8vVGhpcyBjYWxsYmFjayBpcyBjYWxsZWQgaW4gY29udGVudEhlYWRpbmdUcmFuc2NsdWRlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgLy9vbmNlIGl0IGluc2VydHMgdGhlIHRhYidzIGNvbnRlbnQgaW50byB0aGUgZG9tXHJcbiAgICAgIG9uRGVzZWxlY3Q6ICcmZGVzZWxlY3QnXHJcbiAgICB9LFxyXG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24oKSB7XHJcbiAgICAgIC8vRW1wdHkgY29udHJvbGxlciBzbyBvdGhlciBkaXJlY3RpdmVzIGNhbiByZXF1aXJlIGJlaW5nICd1bmRlcicgYSB0YWJcclxuICAgIH0sXHJcbiAgICBjb250cm9sbGVyQXM6ICd0YWInLFxyXG4gICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsbSwgYXR0cnMsIHRhYnNldEN0cmwsIHRyYW5zY2x1ZGUpIHtcclxuICAgICAgc2NvcGUuZGlzYWJsZWQgPSBmYWxzZTtcclxuICAgICAgaWYgKGF0dHJzLmRpc2FibGUpIHtcclxuICAgICAgICBzY29wZS4kcGFyZW50LiR3YXRjaCgkcGFyc2UoYXR0cnMuZGlzYWJsZSksIGZ1bmN0aW9uKHZhbHVlKSB7XHJcbiAgICAgICAgICBzY29wZS5kaXNhYmxlZCA9ICEhIHZhbHVlO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoYW5ndWxhci5pc1VuZGVmaW5lZChhdHRycy5pbmRleCkpIHtcclxuICAgICAgICBpZiAodGFic2V0Q3RybC50YWJzICYmIHRhYnNldEN0cmwudGFicy5sZW5ndGgpIHtcclxuICAgICAgICAgIHNjb3BlLmluZGV4ID0gTWF0aC5tYXguYXBwbHkobnVsbCwgdGFic2V0Q3RybC50YWJzLm1hcChmdW5jdGlvbih0KSB7IHJldHVybiB0LmluZGV4OyB9KSkgKyAxO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBzY29wZS5pbmRleCA9IDA7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoYW5ndWxhci5pc1VuZGVmaW5lZChhdHRycy5jbGFzc2VzKSkge1xyXG4gICAgICAgIHNjb3BlLmNsYXNzZXMgPSAnJztcclxuICAgICAgfVxyXG5cclxuICAgICAgc2NvcGUuc2VsZWN0ID0gZnVuY3Rpb24oZXZ0KSB7XHJcbiAgICAgICAgaWYgKCFzY29wZS5kaXNhYmxlZCkge1xyXG4gICAgICAgICAgdmFyIGluZGV4O1xyXG4gICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0YWJzZXRDdHJsLnRhYnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgaWYgKHRhYnNldEN0cmwudGFic1tpXS50YWIgPT09IHNjb3BlKSB7XHJcbiAgICAgICAgICAgICAgaW5kZXggPSBpO1xyXG4gICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgdGFic2V0Q3RybC5zZWxlY3QoaW5kZXgsIGV2dCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9O1xyXG5cclxuICAgICAgdGFic2V0Q3RybC5hZGRUYWIoc2NvcGUpO1xyXG4gICAgICBzY29wZS4kb24oJyRkZXN0cm95JywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGFic2V0Q3RybC5yZW1vdmVUYWIoc2NvcGUpO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIC8vV2UgbmVlZCB0byB0cmFuc2NsdWRlIGxhdGVyLCBvbmNlIHRoZSBjb250ZW50IGNvbnRhaW5lciBpcyByZWFkeS5cclxuICAgICAgLy93aGVuIHRoaXMgbGluayBoYXBwZW5zLCB3ZSdyZSBpbnNpZGUgYSB0YWIgaGVhZGluZy5cclxuICAgICAgc2NvcGUuJHRyYW5zY2x1ZGVGbiA9IHRyYW5zY2x1ZGU7XHJcbiAgICB9XHJcbiAgfTtcclxufV0pXHJcblxyXG4uZGlyZWN0aXZlKCd1aWJUYWJIZWFkaW5nVHJhbnNjbHVkZScsIGZ1bmN0aW9uKCkge1xyXG4gIHJldHVybiB7XHJcbiAgICByZXN0cmljdDogJ0EnLFxyXG4gICAgcmVxdWlyZTogJ151aWJUYWInLFxyXG4gICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsbSkge1xyXG4gICAgICBzY29wZS4kd2F0Y2goJ2hlYWRpbmdFbGVtZW50JywgZnVuY3Rpb24gdXBkYXRlSGVhZGluZ0VsZW1lbnQoaGVhZGluZykge1xyXG4gICAgICAgIGlmIChoZWFkaW5nKSB7XHJcbiAgICAgICAgICBlbG0uaHRtbCgnJyk7XHJcbiAgICAgICAgICBlbG0uYXBwZW5kKGhlYWRpbmcpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfTtcclxufSlcclxuXHJcbi5kaXJlY3RpdmUoJ3VpYlRhYkNvbnRlbnRUcmFuc2NsdWRlJywgZnVuY3Rpb24oKSB7XHJcbiAgcmV0dXJuIHtcclxuICAgIHJlc3RyaWN0OiAnQScsXHJcbiAgICByZXF1aXJlOiAnXnVpYlRhYnNldCcsXHJcbiAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxtLCBhdHRycykge1xyXG4gICAgICB2YXIgdGFiID0gc2NvcGUuJGV2YWwoYXR0cnMudWliVGFiQ29udGVudFRyYW5zY2x1ZGUpLnRhYjtcclxuXHJcbiAgICAgIC8vTm93IG91ciB0YWIgaXMgcmVhZHkgdG8gYmUgdHJhbnNjbHVkZWQ6IGJvdGggdGhlIHRhYiBoZWFkaW5nIGFyZWFcclxuICAgICAgLy9hbmQgdGhlIHRhYiBjb250ZW50IGFyZWEgYXJlIGxvYWRlZC4gIFRyYW5zY2x1ZGUgJ2VtIGJvdGguXHJcbiAgICAgIHRhYi4kdHJhbnNjbHVkZUZuKHRhYi4kcGFyZW50LCBmdW5jdGlvbihjb250ZW50cykge1xyXG4gICAgICAgIGFuZ3VsYXIuZm9yRWFjaChjb250ZW50cywgZnVuY3Rpb24obm9kZSkge1xyXG4gICAgICAgICAgaWYgKGlzVGFiSGVhZGluZyhub2RlKSkge1xyXG4gICAgICAgICAgICAvL0xldCB0YWJIZWFkaW5nVHJhbnNjbHVkZSBrbm93LlxyXG4gICAgICAgICAgICB0YWIuaGVhZGluZ0VsZW1lbnQgPSBub2RlO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgZWxtLmFwcGVuZChub2RlKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgZnVuY3Rpb24gaXNUYWJIZWFkaW5nKG5vZGUpIHtcclxuICAgIHJldHVybiBub2RlLnRhZ05hbWUgJiYgKFxyXG4gICAgICBub2RlLmhhc0F0dHJpYnV0ZSgndWliLXRhYi1oZWFkaW5nJykgfHxcclxuICAgICAgbm9kZS5oYXNBdHRyaWJ1dGUoJ2RhdGEtdWliLXRhYi1oZWFkaW5nJykgfHxcclxuICAgICAgbm9kZS5oYXNBdHRyaWJ1dGUoJ3gtdWliLXRhYi1oZWFkaW5nJykgfHxcclxuICAgICAgbm9kZS50YWdOYW1lLnRvTG93ZXJDYXNlKCkgPT09ICd1aWItdGFiLWhlYWRpbmcnIHx8XHJcbiAgICAgIG5vZGUudGFnTmFtZS50b0xvd2VyQ2FzZSgpID09PSAnZGF0YS11aWItdGFiLWhlYWRpbmcnIHx8XHJcbiAgICAgIG5vZGUudGFnTmFtZS50b0xvd2VyQ2FzZSgpID09PSAneC11aWItdGFiLWhlYWRpbmcnIHx8XHJcbiAgICAgIG5vZGUudGFnTmFtZS50b0xvd2VyQ2FzZSgpID09PSAndWliOnRhYi1oZWFkaW5nJ1xyXG4gICAgKTtcclxuICB9XHJcbn0pO1xyXG5cclxuYW5ndWxhci5tb2R1bGUoJ3VpLmJvb3RzdHJhcC50aW1lcGlja2VyJywgW10pXHJcblxyXG4uY29uc3RhbnQoJ3VpYlRpbWVwaWNrZXJDb25maWcnLCB7XHJcbiAgaG91clN0ZXA6IDEsXHJcbiAgbWludXRlU3RlcDogMSxcclxuICBzZWNvbmRTdGVwOiAxLFxyXG4gIHNob3dNZXJpZGlhbjogdHJ1ZSxcclxuICBzaG93U2Vjb25kczogZmFsc2UsXHJcbiAgbWVyaWRpYW5zOiBudWxsLFxyXG4gIHJlYWRvbmx5SW5wdXQ6IGZhbHNlLFxyXG4gIG1vdXNld2hlZWw6IHRydWUsXHJcbiAgYXJyb3drZXlzOiB0cnVlLFxyXG4gIHNob3dTcGlubmVyczogdHJ1ZSxcclxuICB0ZW1wbGF0ZVVybDogJ3VpYi90ZW1wbGF0ZS90aW1lcGlja2VyL3RpbWVwaWNrZXIuaHRtbCdcclxufSlcclxuXHJcbi5jb250cm9sbGVyKCdVaWJUaW1lcGlja2VyQ29udHJvbGxlcicsIFsnJHNjb3BlJywgJyRlbGVtZW50JywgJyRhdHRycycsICckcGFyc2UnLCAnJGxvZycsICckbG9jYWxlJywgJ3VpYlRpbWVwaWNrZXJDb25maWcnLCBmdW5jdGlvbigkc2NvcGUsICRlbGVtZW50LCAkYXR0cnMsICRwYXJzZSwgJGxvZywgJGxvY2FsZSwgdGltZXBpY2tlckNvbmZpZykge1xyXG4gIHZhciBob3Vyc01vZGVsQ3RybCwgbWludXRlc01vZGVsQ3RybCwgc2Vjb25kc01vZGVsQ3RybDtcclxuICB2YXIgc2VsZWN0ZWQgPSBuZXcgRGF0ZSgpLFxyXG4gICAgd2F0Y2hlcnMgPSBbXSxcclxuICAgIG5nTW9kZWxDdHJsID0geyAkc2V0Vmlld1ZhbHVlOiBhbmd1bGFyLm5vb3AgfSwgLy8gbnVsbE1vZGVsQ3RybFxyXG4gICAgbWVyaWRpYW5zID0gYW5ndWxhci5pc0RlZmluZWQoJGF0dHJzLm1lcmlkaWFucykgPyAkc2NvcGUuJHBhcmVudC4kZXZhbCgkYXR0cnMubWVyaWRpYW5zKSA6IHRpbWVwaWNrZXJDb25maWcubWVyaWRpYW5zIHx8ICRsb2NhbGUuREFURVRJTUVfRk9STUFUUy5BTVBNUyxcclxuICAgIHBhZEhvdXJzID0gYW5ndWxhci5pc0RlZmluZWQoJGF0dHJzLnBhZEhvdXJzKSA/ICRzY29wZS4kcGFyZW50LiRldmFsKCRhdHRycy5wYWRIb3VycykgOiB0cnVlO1xyXG5cclxuICAkc2NvcGUudGFiaW5kZXggPSBhbmd1bGFyLmlzRGVmaW5lZCgkYXR0cnMudGFiaW5kZXgpID8gJGF0dHJzLnRhYmluZGV4IDogMDtcclxuICAkZWxlbWVudC5yZW1vdmVBdHRyKCd0YWJpbmRleCcpO1xyXG5cclxuICB0aGlzLmluaXQgPSBmdW5jdGlvbihuZ01vZGVsQ3RybF8sIGlucHV0cykge1xyXG4gICAgbmdNb2RlbEN0cmwgPSBuZ01vZGVsQ3RybF87XHJcbiAgICBuZ01vZGVsQ3RybC4kcmVuZGVyID0gdGhpcy5yZW5kZXI7XHJcblxyXG4gICAgbmdNb2RlbEN0cmwuJGZvcm1hdHRlcnMudW5zaGlmdChmdW5jdGlvbihtb2RlbFZhbHVlKSB7XHJcbiAgICAgIHJldHVybiBtb2RlbFZhbHVlID8gbmV3IERhdGUobW9kZWxWYWx1ZSkgOiBudWxsO1xyXG4gICAgfSk7XHJcblxyXG4gICAgdmFyIGhvdXJzSW5wdXRFbCA9IGlucHV0cy5lcSgwKSxcclxuICAgICAgICBtaW51dGVzSW5wdXRFbCA9IGlucHV0cy5lcSgxKSxcclxuICAgICAgICBzZWNvbmRzSW5wdXRFbCA9IGlucHV0cy5lcSgyKTtcclxuXHJcbiAgICBob3Vyc01vZGVsQ3RybCA9IGhvdXJzSW5wdXRFbC5jb250cm9sbGVyKCduZ01vZGVsJyk7XHJcbiAgICBtaW51dGVzTW9kZWxDdHJsID0gbWludXRlc0lucHV0RWwuY29udHJvbGxlcignbmdNb2RlbCcpO1xyXG4gICAgc2Vjb25kc01vZGVsQ3RybCA9IHNlY29uZHNJbnB1dEVsLmNvbnRyb2xsZXIoJ25nTW9kZWwnKTtcclxuXHJcbiAgICB2YXIgbW91c2V3aGVlbCA9IGFuZ3VsYXIuaXNEZWZpbmVkKCRhdHRycy5tb3VzZXdoZWVsKSA/ICRzY29wZS4kcGFyZW50LiRldmFsKCRhdHRycy5tb3VzZXdoZWVsKSA6IHRpbWVwaWNrZXJDb25maWcubW91c2V3aGVlbDtcclxuXHJcbiAgICBpZiAobW91c2V3aGVlbCkge1xyXG4gICAgICB0aGlzLnNldHVwTW91c2V3aGVlbEV2ZW50cyhob3Vyc0lucHV0RWwsIG1pbnV0ZXNJbnB1dEVsLCBzZWNvbmRzSW5wdXRFbCk7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGFycm93a2V5cyA9IGFuZ3VsYXIuaXNEZWZpbmVkKCRhdHRycy5hcnJvd2tleXMpID8gJHNjb3BlLiRwYXJlbnQuJGV2YWwoJGF0dHJzLmFycm93a2V5cykgOiB0aW1lcGlja2VyQ29uZmlnLmFycm93a2V5cztcclxuICAgIGlmIChhcnJvd2tleXMpIHtcclxuICAgICAgdGhpcy5zZXR1cEFycm93a2V5RXZlbnRzKGhvdXJzSW5wdXRFbCwgbWludXRlc0lucHV0RWwsIHNlY29uZHNJbnB1dEVsKTtcclxuICAgIH1cclxuXHJcbiAgICAkc2NvcGUucmVhZG9ubHlJbnB1dCA9IGFuZ3VsYXIuaXNEZWZpbmVkKCRhdHRycy5yZWFkb25seUlucHV0KSA/ICRzY29wZS4kcGFyZW50LiRldmFsKCRhdHRycy5yZWFkb25seUlucHV0KSA6IHRpbWVwaWNrZXJDb25maWcucmVhZG9ubHlJbnB1dDtcclxuICAgIHRoaXMuc2V0dXBJbnB1dEV2ZW50cyhob3Vyc0lucHV0RWwsIG1pbnV0ZXNJbnB1dEVsLCBzZWNvbmRzSW5wdXRFbCk7XHJcbiAgfTtcclxuXHJcbiAgdmFyIGhvdXJTdGVwID0gdGltZXBpY2tlckNvbmZpZy5ob3VyU3RlcDtcclxuICBpZiAoJGF0dHJzLmhvdXJTdGVwKSB7XHJcbiAgICB3YXRjaGVycy5wdXNoKCRzY29wZS4kcGFyZW50LiR3YXRjaCgkcGFyc2UoJGF0dHJzLmhvdXJTdGVwKSwgZnVuY3Rpb24odmFsdWUpIHtcclxuICAgICAgaG91clN0ZXAgPSArdmFsdWU7XHJcbiAgICB9KSk7XHJcbiAgfVxyXG5cclxuICB2YXIgbWludXRlU3RlcCA9IHRpbWVwaWNrZXJDb25maWcubWludXRlU3RlcDtcclxuICBpZiAoJGF0dHJzLm1pbnV0ZVN0ZXApIHtcclxuICAgIHdhdGNoZXJzLnB1c2goJHNjb3BlLiRwYXJlbnQuJHdhdGNoKCRwYXJzZSgkYXR0cnMubWludXRlU3RlcCksIGZ1bmN0aW9uKHZhbHVlKSB7XHJcbiAgICAgIG1pbnV0ZVN0ZXAgPSArdmFsdWU7XHJcbiAgICB9KSk7XHJcbiAgfVxyXG5cclxuICB2YXIgbWluO1xyXG4gIHdhdGNoZXJzLnB1c2goJHNjb3BlLiRwYXJlbnQuJHdhdGNoKCRwYXJzZSgkYXR0cnMubWluKSwgZnVuY3Rpb24odmFsdWUpIHtcclxuICAgIHZhciBkdCA9IG5ldyBEYXRlKHZhbHVlKTtcclxuICAgIG1pbiA9IGlzTmFOKGR0KSA/IHVuZGVmaW5lZCA6IGR0O1xyXG4gIH0pKTtcclxuXHJcbiAgdmFyIG1heDtcclxuICB3YXRjaGVycy5wdXNoKCRzY29wZS4kcGFyZW50LiR3YXRjaCgkcGFyc2UoJGF0dHJzLm1heCksIGZ1bmN0aW9uKHZhbHVlKSB7XHJcbiAgICB2YXIgZHQgPSBuZXcgRGF0ZSh2YWx1ZSk7XHJcbiAgICBtYXggPSBpc05hTihkdCkgPyB1bmRlZmluZWQgOiBkdDtcclxuICB9KSk7XHJcblxyXG4gIHZhciBkaXNhYmxlZCA9IGZhbHNlO1xyXG4gIGlmICgkYXR0cnMubmdEaXNhYmxlZCkge1xyXG4gICAgd2F0Y2hlcnMucHVzaCgkc2NvcGUuJHBhcmVudC4kd2F0Y2goJHBhcnNlKCRhdHRycy5uZ0Rpc2FibGVkKSwgZnVuY3Rpb24odmFsdWUpIHtcclxuICAgICAgZGlzYWJsZWQgPSB2YWx1ZTtcclxuICAgIH0pKTtcclxuICB9XHJcblxyXG4gICRzY29wZS5ub0luY3JlbWVudEhvdXJzID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgaW5jcmVtZW50ZWRTZWxlY3RlZCA9IGFkZE1pbnV0ZXMoc2VsZWN0ZWQsIGhvdXJTdGVwICogNjApO1xyXG4gICAgcmV0dXJuIGRpc2FibGVkIHx8IGluY3JlbWVudGVkU2VsZWN0ZWQgPiBtYXggfHxcclxuICAgICAgaW5jcmVtZW50ZWRTZWxlY3RlZCA8IHNlbGVjdGVkICYmIGluY3JlbWVudGVkU2VsZWN0ZWQgPCBtaW47XHJcbiAgfTtcclxuXHJcbiAgJHNjb3BlLm5vRGVjcmVtZW50SG91cnMgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBkZWNyZW1lbnRlZFNlbGVjdGVkID0gYWRkTWludXRlcyhzZWxlY3RlZCwgLWhvdXJTdGVwICogNjApO1xyXG4gICAgcmV0dXJuIGRpc2FibGVkIHx8IGRlY3JlbWVudGVkU2VsZWN0ZWQgPCBtaW4gfHxcclxuICAgICAgZGVjcmVtZW50ZWRTZWxlY3RlZCA+IHNlbGVjdGVkICYmIGRlY3JlbWVudGVkU2VsZWN0ZWQgPiBtYXg7XHJcbiAgfTtcclxuXHJcbiAgJHNjb3BlLm5vSW5jcmVtZW50TWludXRlcyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGluY3JlbWVudGVkU2VsZWN0ZWQgPSBhZGRNaW51dGVzKHNlbGVjdGVkLCBtaW51dGVTdGVwKTtcclxuICAgIHJldHVybiBkaXNhYmxlZCB8fCBpbmNyZW1lbnRlZFNlbGVjdGVkID4gbWF4IHx8XHJcbiAgICAgIGluY3JlbWVudGVkU2VsZWN0ZWQgPCBzZWxlY3RlZCAmJiBpbmNyZW1lbnRlZFNlbGVjdGVkIDwgbWluO1xyXG4gIH07XHJcblxyXG4gICRzY29wZS5ub0RlY3JlbWVudE1pbnV0ZXMgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBkZWNyZW1lbnRlZFNlbGVjdGVkID0gYWRkTWludXRlcyhzZWxlY3RlZCwgLW1pbnV0ZVN0ZXApO1xyXG4gICAgcmV0dXJuIGRpc2FibGVkIHx8IGRlY3JlbWVudGVkU2VsZWN0ZWQgPCBtaW4gfHxcclxuICAgICAgZGVjcmVtZW50ZWRTZWxlY3RlZCA+IHNlbGVjdGVkICYmIGRlY3JlbWVudGVkU2VsZWN0ZWQgPiBtYXg7XHJcbiAgfTtcclxuXHJcbiAgJHNjb3BlLm5vSW5jcmVtZW50U2Vjb25kcyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGluY3JlbWVudGVkU2VsZWN0ZWQgPSBhZGRTZWNvbmRzKHNlbGVjdGVkLCBzZWNvbmRTdGVwKTtcclxuICAgIHJldHVybiBkaXNhYmxlZCB8fCBpbmNyZW1lbnRlZFNlbGVjdGVkID4gbWF4IHx8XHJcbiAgICAgIGluY3JlbWVudGVkU2VsZWN0ZWQgPCBzZWxlY3RlZCAmJiBpbmNyZW1lbnRlZFNlbGVjdGVkIDwgbWluO1xyXG4gIH07XHJcblxyXG4gICRzY29wZS5ub0RlY3JlbWVudFNlY29uZHMgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBkZWNyZW1lbnRlZFNlbGVjdGVkID0gYWRkU2Vjb25kcyhzZWxlY3RlZCwgLXNlY29uZFN0ZXApO1xyXG4gICAgcmV0dXJuIGRpc2FibGVkIHx8IGRlY3JlbWVudGVkU2VsZWN0ZWQgPCBtaW4gfHxcclxuICAgICAgZGVjcmVtZW50ZWRTZWxlY3RlZCA+IHNlbGVjdGVkICYmIGRlY3JlbWVudGVkU2VsZWN0ZWQgPiBtYXg7XHJcbiAgfTtcclxuXHJcbiAgJHNjb3BlLm5vVG9nZ2xlTWVyaWRpYW4gPSBmdW5jdGlvbigpIHtcclxuICAgIGlmIChzZWxlY3RlZC5nZXRIb3VycygpIDwgMTIpIHtcclxuICAgICAgcmV0dXJuIGRpc2FibGVkIHx8IGFkZE1pbnV0ZXMoc2VsZWN0ZWQsIDEyICogNjApID4gbWF4O1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBkaXNhYmxlZCB8fCBhZGRNaW51dGVzKHNlbGVjdGVkLCAtMTIgKiA2MCkgPCBtaW47XHJcbiAgfTtcclxuXHJcbiAgdmFyIHNlY29uZFN0ZXAgPSB0aW1lcGlja2VyQ29uZmlnLnNlY29uZFN0ZXA7XHJcbiAgaWYgKCRhdHRycy5zZWNvbmRTdGVwKSB7XHJcbiAgICB3YXRjaGVycy5wdXNoKCRzY29wZS4kcGFyZW50LiR3YXRjaCgkcGFyc2UoJGF0dHJzLnNlY29uZFN0ZXApLCBmdW5jdGlvbih2YWx1ZSkge1xyXG4gICAgICBzZWNvbmRTdGVwID0gK3ZhbHVlO1xyXG4gICAgfSkpO1xyXG4gIH1cclxuXHJcbiAgJHNjb3BlLnNob3dTZWNvbmRzID0gdGltZXBpY2tlckNvbmZpZy5zaG93U2Vjb25kcztcclxuICBpZiAoJGF0dHJzLnNob3dTZWNvbmRzKSB7XHJcbiAgICB3YXRjaGVycy5wdXNoKCRzY29wZS4kcGFyZW50LiR3YXRjaCgkcGFyc2UoJGF0dHJzLnNob3dTZWNvbmRzKSwgZnVuY3Rpb24odmFsdWUpIHtcclxuICAgICAgJHNjb3BlLnNob3dTZWNvbmRzID0gISF2YWx1ZTtcclxuICAgIH0pKTtcclxuICB9XHJcblxyXG4gIC8vIDEySCAvIDI0SCBtb2RlXHJcbiAgJHNjb3BlLnNob3dNZXJpZGlhbiA9IHRpbWVwaWNrZXJDb25maWcuc2hvd01lcmlkaWFuO1xyXG4gIGlmICgkYXR0cnMuc2hvd01lcmlkaWFuKSB7XHJcbiAgICB3YXRjaGVycy5wdXNoKCRzY29wZS4kcGFyZW50LiR3YXRjaCgkcGFyc2UoJGF0dHJzLnNob3dNZXJpZGlhbiksIGZ1bmN0aW9uKHZhbHVlKSB7XHJcbiAgICAgICRzY29wZS5zaG93TWVyaWRpYW4gPSAhIXZhbHVlO1xyXG5cclxuICAgICAgaWYgKG5nTW9kZWxDdHJsLiRlcnJvci50aW1lKSB7XHJcbiAgICAgICAgLy8gRXZhbHVhdGUgZnJvbSB0ZW1wbGF0ZVxyXG4gICAgICAgIHZhciBob3VycyA9IGdldEhvdXJzRnJvbVRlbXBsYXRlKCksIG1pbnV0ZXMgPSBnZXRNaW51dGVzRnJvbVRlbXBsYXRlKCk7XHJcbiAgICAgICAgaWYgKGFuZ3VsYXIuaXNEZWZpbmVkKGhvdXJzKSAmJiBhbmd1bGFyLmlzRGVmaW5lZChtaW51dGVzKSkge1xyXG4gICAgICAgICAgc2VsZWN0ZWQuc2V0SG91cnMoaG91cnMpO1xyXG4gICAgICAgICAgcmVmcmVzaCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB1cGRhdGVUZW1wbGF0ZSgpO1xyXG4gICAgICB9XHJcbiAgICB9KSk7XHJcbiAgfVxyXG5cclxuICAvLyBHZXQgJHNjb3BlLmhvdXJzIGluIDI0SCBtb2RlIGlmIHZhbGlkXHJcbiAgZnVuY3Rpb24gZ2V0SG91cnNGcm9tVGVtcGxhdGUoKSB7XHJcbiAgICB2YXIgaG91cnMgPSArJHNjb3BlLmhvdXJzO1xyXG4gICAgdmFyIHZhbGlkID0gJHNjb3BlLnNob3dNZXJpZGlhbiA/IGhvdXJzID4gMCAmJiBob3VycyA8IDEzIDpcclxuICAgICAgaG91cnMgPj0gMCAmJiBob3VycyA8IDI0O1xyXG4gICAgaWYgKCF2YWxpZCB8fCAkc2NvcGUuaG91cnMgPT09ICcnKSB7XHJcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCRzY29wZS5zaG93TWVyaWRpYW4pIHtcclxuICAgICAgaWYgKGhvdXJzID09PSAxMikge1xyXG4gICAgICAgIGhvdXJzID0gMDtcclxuICAgICAgfVxyXG4gICAgICBpZiAoJHNjb3BlLm1lcmlkaWFuID09PSBtZXJpZGlhbnNbMV0pIHtcclxuICAgICAgICBob3VycyA9IGhvdXJzICsgMTI7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBob3VycztcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGdldE1pbnV0ZXNGcm9tVGVtcGxhdGUoKSB7XHJcbiAgICB2YXIgbWludXRlcyA9ICskc2NvcGUubWludXRlcztcclxuICAgIHZhciB2YWxpZCA9IG1pbnV0ZXMgPj0gMCAmJiBtaW51dGVzIDwgNjA7XHJcbiAgICBpZiAoIXZhbGlkIHx8ICRzY29wZS5taW51dGVzID09PSAnJykge1xyXG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIG1pbnV0ZXM7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBnZXRTZWNvbmRzRnJvbVRlbXBsYXRlKCkge1xyXG4gICAgdmFyIHNlY29uZHMgPSArJHNjb3BlLnNlY29uZHM7XHJcbiAgICByZXR1cm4gc2Vjb25kcyA+PSAwICYmIHNlY29uZHMgPCA2MCA/IHNlY29uZHMgOiB1bmRlZmluZWQ7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBwYWQodmFsdWUsIG5vUGFkKSB7XHJcbiAgICBpZiAodmFsdWUgPT09IG51bGwpIHtcclxuICAgICAgcmV0dXJuICcnO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBhbmd1bGFyLmlzRGVmaW5lZCh2YWx1ZSkgJiYgdmFsdWUudG9TdHJpbmcoKS5sZW5ndGggPCAyICYmICFub1BhZCA/XHJcbiAgICAgICcwJyArIHZhbHVlIDogdmFsdWUudG9TdHJpbmcoKTtcclxuICB9XHJcblxyXG4gIC8vIFJlc3BvbmQgb24gbW91c2V3aGVlbCBzcGluXHJcbiAgdGhpcy5zZXR1cE1vdXNld2hlZWxFdmVudHMgPSBmdW5jdGlvbihob3Vyc0lucHV0RWwsIG1pbnV0ZXNJbnB1dEVsLCBzZWNvbmRzSW5wdXRFbCkge1xyXG4gICAgdmFyIGlzU2Nyb2xsaW5nVXAgPSBmdW5jdGlvbihlKSB7XHJcbiAgICAgIGlmIChlLm9yaWdpbmFsRXZlbnQpIHtcclxuICAgICAgICBlID0gZS5vcmlnaW5hbEV2ZW50O1xyXG4gICAgICB9XHJcbiAgICAgIC8vcGljayBjb3JyZWN0IGRlbHRhIHZhcmlhYmxlIGRlcGVuZGluZyBvbiBldmVudFxyXG4gICAgICB2YXIgZGVsdGEgPSBlLndoZWVsRGVsdGEgPyBlLndoZWVsRGVsdGEgOiAtZS5kZWx0YVk7XHJcbiAgICAgIHJldHVybiBlLmRldGFpbCB8fCBkZWx0YSA+IDA7XHJcbiAgICB9O1xyXG5cclxuICAgIGhvdXJzSW5wdXRFbC5iaW5kKCdtb3VzZXdoZWVsIHdoZWVsJywgZnVuY3Rpb24oZSkge1xyXG4gICAgICBpZiAoIWRpc2FibGVkKSB7XHJcbiAgICAgICAgJHNjb3BlLiRhcHBseShpc1Njcm9sbGluZ1VwKGUpID8gJHNjb3BlLmluY3JlbWVudEhvdXJzKCkgOiAkc2NvcGUuZGVjcmVtZW50SG91cnMoKSk7XHJcbiAgICAgIH1cclxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgbWludXRlc0lucHV0RWwuYmluZCgnbW91c2V3aGVlbCB3aGVlbCcsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgaWYgKCFkaXNhYmxlZCkge1xyXG4gICAgICAgICRzY29wZS4kYXBwbHkoaXNTY3JvbGxpbmdVcChlKSA/ICRzY29wZS5pbmNyZW1lbnRNaW51dGVzKCkgOiAkc2NvcGUuZGVjcmVtZW50TWludXRlcygpKTtcclxuICAgICAgfVxyXG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAgc2Vjb25kc0lucHV0RWwuYmluZCgnbW91c2V3aGVlbCB3aGVlbCcsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgaWYgKCFkaXNhYmxlZCkge1xyXG4gICAgICAgICRzY29wZS4kYXBwbHkoaXNTY3JvbGxpbmdVcChlKSA/ICRzY29wZS5pbmNyZW1lbnRTZWNvbmRzKCkgOiAkc2NvcGUuZGVjcmVtZW50U2Vjb25kcygpKTtcclxuICAgICAgfVxyXG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICB9KTtcclxuICB9O1xyXG5cclxuICAvLyBSZXNwb25kIG9uIHVwL2Rvd24gYXJyb3drZXlzXHJcbiAgdGhpcy5zZXR1cEFycm93a2V5RXZlbnRzID0gZnVuY3Rpb24oaG91cnNJbnB1dEVsLCBtaW51dGVzSW5wdXRFbCwgc2Vjb25kc0lucHV0RWwpIHtcclxuICAgIGhvdXJzSW5wdXRFbC5iaW5kKCdrZXlkb3duJywgZnVuY3Rpb24oZSkge1xyXG4gICAgICBpZiAoIWRpc2FibGVkKSB7XHJcbiAgICAgICAgaWYgKGUud2hpY2ggPT09IDM4KSB7IC8vIHVwXHJcbiAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAkc2NvcGUuaW5jcmVtZW50SG91cnMoKTtcclxuICAgICAgICAgICRzY29wZS4kYXBwbHkoKTtcclxuICAgICAgICB9IGVsc2UgaWYgKGUud2hpY2ggPT09IDQwKSB7IC8vIGRvd25cclxuICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICRzY29wZS5kZWNyZW1lbnRIb3VycygpO1xyXG4gICAgICAgICAgJHNjb3BlLiRhcHBseSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgbWludXRlc0lucHV0RWwuYmluZCgna2V5ZG93bicsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgaWYgKCFkaXNhYmxlZCkge1xyXG4gICAgICAgIGlmIChlLndoaWNoID09PSAzOCkgeyAvLyB1cFxyXG4gICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgJHNjb3BlLmluY3JlbWVudE1pbnV0ZXMoKTtcclxuICAgICAgICAgICRzY29wZS4kYXBwbHkoKTtcclxuICAgICAgICB9IGVsc2UgaWYgKGUud2hpY2ggPT09IDQwKSB7IC8vIGRvd25cclxuICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICRzY29wZS5kZWNyZW1lbnRNaW51dGVzKCk7XHJcbiAgICAgICAgICAkc2NvcGUuJGFwcGx5KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICBzZWNvbmRzSW5wdXRFbC5iaW5kKCdrZXlkb3duJywgZnVuY3Rpb24oZSkge1xyXG4gICAgICBpZiAoIWRpc2FibGVkKSB7XHJcbiAgICAgICAgaWYgKGUud2hpY2ggPT09IDM4KSB7IC8vIHVwXHJcbiAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAkc2NvcGUuaW5jcmVtZW50U2Vjb25kcygpO1xyXG4gICAgICAgICAgJHNjb3BlLiRhcHBseSgpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoZS53aGljaCA9PT0gNDApIHsgLy8gZG93blxyXG4gICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgJHNjb3BlLmRlY3JlbWVudFNlY29uZHMoKTtcclxuICAgICAgICAgICRzY29wZS4kYXBwbHkoKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gIH07XHJcblxyXG4gIHRoaXMuc2V0dXBJbnB1dEV2ZW50cyA9IGZ1bmN0aW9uKGhvdXJzSW5wdXRFbCwgbWludXRlc0lucHV0RWwsIHNlY29uZHNJbnB1dEVsKSB7XHJcbiAgICBpZiAoJHNjb3BlLnJlYWRvbmx5SW5wdXQpIHtcclxuICAgICAgJHNjb3BlLnVwZGF0ZUhvdXJzID0gYW5ndWxhci5ub29wO1xyXG4gICAgICAkc2NvcGUudXBkYXRlTWludXRlcyA9IGFuZ3VsYXIubm9vcDtcclxuICAgICAgJHNjb3BlLnVwZGF0ZVNlY29uZHMgPSBhbmd1bGFyLm5vb3A7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgaW52YWxpZGF0ZSA9IGZ1bmN0aW9uKGludmFsaWRIb3VycywgaW52YWxpZE1pbnV0ZXMsIGludmFsaWRTZWNvbmRzKSB7XHJcbiAgICAgIG5nTW9kZWxDdHJsLiRzZXRWaWV3VmFsdWUobnVsbCk7XHJcbiAgICAgIG5nTW9kZWxDdHJsLiRzZXRWYWxpZGl0eSgndGltZScsIGZhbHNlKTtcclxuICAgICAgaWYgKGFuZ3VsYXIuaXNEZWZpbmVkKGludmFsaWRIb3VycykpIHtcclxuICAgICAgICAkc2NvcGUuaW52YWxpZEhvdXJzID0gaW52YWxpZEhvdXJzO1xyXG4gICAgICAgIGlmIChob3Vyc01vZGVsQ3RybCkge1xyXG4gICAgICAgICAgaG91cnNNb2RlbEN0cmwuJHNldFZhbGlkaXR5KCdob3VycycsIGZhbHNlKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChhbmd1bGFyLmlzRGVmaW5lZChpbnZhbGlkTWludXRlcykpIHtcclxuICAgICAgICAkc2NvcGUuaW52YWxpZE1pbnV0ZXMgPSBpbnZhbGlkTWludXRlcztcclxuICAgICAgICBpZiAobWludXRlc01vZGVsQ3RybCkge1xyXG4gICAgICAgICAgbWludXRlc01vZGVsQ3RybC4kc2V0VmFsaWRpdHkoJ21pbnV0ZXMnLCBmYWxzZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoYW5ndWxhci5pc0RlZmluZWQoaW52YWxpZFNlY29uZHMpKSB7XHJcbiAgICAgICAgJHNjb3BlLmludmFsaWRTZWNvbmRzID0gaW52YWxpZFNlY29uZHM7XHJcbiAgICAgICAgaWYgKHNlY29uZHNNb2RlbEN0cmwpIHtcclxuICAgICAgICAgIHNlY29uZHNNb2RlbEN0cmwuJHNldFZhbGlkaXR5KCdzZWNvbmRzJywgZmFsc2UpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICAkc2NvcGUudXBkYXRlSG91cnMgPSBmdW5jdGlvbigpIHtcclxuICAgICAgdmFyIGhvdXJzID0gZ2V0SG91cnNGcm9tVGVtcGxhdGUoKSxcclxuICAgICAgICBtaW51dGVzID0gZ2V0TWludXRlc0Zyb21UZW1wbGF0ZSgpO1xyXG5cclxuICAgICAgbmdNb2RlbEN0cmwuJHNldERpcnR5KCk7XHJcblxyXG4gICAgICBpZiAoYW5ndWxhci5pc0RlZmluZWQoaG91cnMpICYmIGFuZ3VsYXIuaXNEZWZpbmVkKG1pbnV0ZXMpKSB7XHJcbiAgICAgICAgc2VsZWN0ZWQuc2V0SG91cnMoaG91cnMpO1xyXG4gICAgICAgIHNlbGVjdGVkLnNldE1pbnV0ZXMobWludXRlcyk7XHJcbiAgICAgICAgaWYgKHNlbGVjdGVkIDwgbWluIHx8IHNlbGVjdGVkID4gbWF4KSB7XHJcbiAgICAgICAgICBpbnZhbGlkYXRlKHRydWUpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICByZWZyZXNoKCdoJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGludmFsaWRhdGUodHJ1ZSk7XHJcbiAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgaG91cnNJbnB1dEVsLmJpbmQoJ2JsdXInLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgIG5nTW9kZWxDdHJsLiRzZXRUb3VjaGVkKCk7XHJcbiAgICAgIGlmIChtb2RlbElzRW1wdHkoKSkge1xyXG4gICAgICAgIG1ha2VWYWxpZCgpO1xyXG4gICAgICB9IGVsc2UgaWYgKCRzY29wZS5ob3VycyA9PT0gbnVsbCB8fCAkc2NvcGUuaG91cnMgPT09ICcnKSB7XHJcbiAgICAgICAgaW52YWxpZGF0ZSh0cnVlKTtcclxuICAgICAgfSBlbHNlIGlmICghJHNjb3BlLmludmFsaWRIb3VycyAmJiAkc2NvcGUuaG91cnMgPCAxMCkge1xyXG4gICAgICAgICRzY29wZS4kYXBwbHkoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAkc2NvcGUuaG91cnMgPSBwYWQoJHNjb3BlLmhvdXJzLCAhcGFkSG91cnMpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICAkc2NvcGUudXBkYXRlTWludXRlcyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICB2YXIgbWludXRlcyA9IGdldE1pbnV0ZXNGcm9tVGVtcGxhdGUoKSxcclxuICAgICAgICBob3VycyA9IGdldEhvdXJzRnJvbVRlbXBsYXRlKCk7XHJcblxyXG4gICAgICBuZ01vZGVsQ3RybC4kc2V0RGlydHkoKTtcclxuXHJcbiAgICAgIGlmIChhbmd1bGFyLmlzRGVmaW5lZChtaW51dGVzKSAmJiBhbmd1bGFyLmlzRGVmaW5lZChob3VycykpIHtcclxuICAgICAgICBzZWxlY3RlZC5zZXRIb3Vycyhob3Vycyk7XHJcbiAgICAgICAgc2VsZWN0ZWQuc2V0TWludXRlcyhtaW51dGVzKTtcclxuICAgICAgICBpZiAoc2VsZWN0ZWQgPCBtaW4gfHwgc2VsZWN0ZWQgPiBtYXgpIHtcclxuICAgICAgICAgIGludmFsaWRhdGUodW5kZWZpbmVkLCB0cnVlKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgcmVmcmVzaCgnbScpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBpbnZhbGlkYXRlKHVuZGVmaW5lZCwgdHJ1ZSk7XHJcbiAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgbWludXRlc0lucHV0RWwuYmluZCgnYmx1cicsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgbmdNb2RlbEN0cmwuJHNldFRvdWNoZWQoKTtcclxuICAgICAgaWYgKG1vZGVsSXNFbXB0eSgpKSB7XHJcbiAgICAgICAgbWFrZVZhbGlkKCk7XHJcbiAgICAgIH0gZWxzZSBpZiAoJHNjb3BlLm1pbnV0ZXMgPT09IG51bGwpIHtcclxuICAgICAgICBpbnZhbGlkYXRlKHVuZGVmaW5lZCwgdHJ1ZSk7XHJcbiAgICAgIH0gZWxzZSBpZiAoISRzY29wZS5pbnZhbGlkTWludXRlcyAmJiAkc2NvcGUubWludXRlcyA8IDEwKSB7XHJcbiAgICAgICAgJHNjb3BlLiRhcHBseShmdW5jdGlvbigpIHtcclxuICAgICAgICAgICRzY29wZS5taW51dGVzID0gcGFkKCRzY29wZS5taW51dGVzKTtcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgJHNjb3BlLnVwZGF0ZVNlY29uZHMgPSBmdW5jdGlvbigpIHtcclxuICAgICAgdmFyIHNlY29uZHMgPSBnZXRTZWNvbmRzRnJvbVRlbXBsYXRlKCk7XHJcblxyXG4gICAgICBuZ01vZGVsQ3RybC4kc2V0RGlydHkoKTtcclxuXHJcbiAgICAgIGlmIChhbmd1bGFyLmlzRGVmaW5lZChzZWNvbmRzKSkge1xyXG4gICAgICAgIHNlbGVjdGVkLnNldFNlY29uZHMoc2Vjb25kcyk7XHJcbiAgICAgICAgcmVmcmVzaCgncycpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGludmFsaWRhdGUodW5kZWZpbmVkLCB1bmRlZmluZWQsIHRydWUpO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIHNlY29uZHNJbnB1dEVsLmJpbmQoJ2JsdXInLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgIGlmIChtb2RlbElzRW1wdHkoKSkge1xyXG4gICAgICAgIG1ha2VWYWxpZCgpO1xyXG4gICAgICB9IGVsc2UgaWYgKCEkc2NvcGUuaW52YWxpZFNlY29uZHMgJiYgJHNjb3BlLnNlY29uZHMgPCAxMCkge1xyXG4gICAgICAgICRzY29wZS4kYXBwbHkoIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgJHNjb3BlLnNlY29uZHMgPSBwYWQoJHNjb3BlLnNlY29uZHMpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgfTtcclxuXHJcbiAgdGhpcy5yZW5kZXIgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBkYXRlID0gbmdNb2RlbEN0cmwuJHZpZXdWYWx1ZTtcclxuXHJcbiAgICBpZiAoaXNOYU4oZGF0ZSkpIHtcclxuICAgICAgbmdNb2RlbEN0cmwuJHNldFZhbGlkaXR5KCd0aW1lJywgZmFsc2UpO1xyXG4gICAgICAkbG9nLmVycm9yKCdUaW1lcGlja2VyIGRpcmVjdGl2ZTogXCJuZy1tb2RlbFwiIHZhbHVlIG11c3QgYmUgYSBEYXRlIG9iamVjdCwgYSBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIHNpbmNlIDAxLjAxLjE5NzAgb3IgYSBzdHJpbmcgcmVwcmVzZW50aW5nIGFuIFJGQzI4MjIgb3IgSVNPIDg2MDEgZGF0ZS4nKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGlmIChkYXRlKSB7XHJcbiAgICAgICAgc2VsZWN0ZWQgPSBkYXRlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoc2VsZWN0ZWQgPCBtaW4gfHwgc2VsZWN0ZWQgPiBtYXgpIHtcclxuICAgICAgICBuZ01vZGVsQ3RybC4kc2V0VmFsaWRpdHkoJ3RpbWUnLCBmYWxzZSk7XHJcbiAgICAgICAgJHNjb3BlLmludmFsaWRIb3VycyA9IHRydWU7XHJcbiAgICAgICAgJHNjb3BlLmludmFsaWRNaW51dGVzID0gdHJ1ZTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBtYWtlVmFsaWQoKTtcclxuICAgICAgfVxyXG4gICAgICB1cGRhdGVUZW1wbGF0ZSgpO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIC8vIENhbGwgaW50ZXJuYWxseSB3aGVuIHdlIGtub3cgdGhhdCBtb2RlbCBpcyB2YWxpZC5cclxuICBmdW5jdGlvbiByZWZyZXNoKGtleWJvYXJkQ2hhbmdlKSB7XHJcbiAgICBtYWtlVmFsaWQoKTtcclxuICAgIG5nTW9kZWxDdHJsLiRzZXRWaWV3VmFsdWUobmV3IERhdGUoc2VsZWN0ZWQpKTtcclxuICAgIHVwZGF0ZVRlbXBsYXRlKGtleWJvYXJkQ2hhbmdlKTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIG1ha2VWYWxpZCgpIHtcclxuICAgIGlmIChob3Vyc01vZGVsQ3RybCkge1xyXG4gICAgICBob3Vyc01vZGVsQ3RybC4kc2V0VmFsaWRpdHkoJ2hvdXJzJywgdHJ1ZSk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKG1pbnV0ZXNNb2RlbEN0cmwpIHtcclxuICAgICAgbWludXRlc01vZGVsQ3RybC4kc2V0VmFsaWRpdHkoJ21pbnV0ZXMnLCB0cnVlKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoc2Vjb25kc01vZGVsQ3RybCkge1xyXG4gICAgICBzZWNvbmRzTW9kZWxDdHJsLiRzZXRWYWxpZGl0eSgnc2Vjb25kcycsIHRydWUpO1xyXG4gICAgfVxyXG5cclxuICAgIG5nTW9kZWxDdHJsLiRzZXRWYWxpZGl0eSgndGltZScsIHRydWUpO1xyXG4gICAgJHNjb3BlLmludmFsaWRIb3VycyA9IGZhbHNlO1xyXG4gICAgJHNjb3BlLmludmFsaWRNaW51dGVzID0gZmFsc2U7XHJcbiAgICAkc2NvcGUuaW52YWxpZFNlY29uZHMgPSBmYWxzZTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHVwZGF0ZVRlbXBsYXRlKGtleWJvYXJkQ2hhbmdlKSB7XHJcbiAgICBpZiAoIW5nTW9kZWxDdHJsLiRtb2RlbFZhbHVlKSB7XHJcbiAgICAgICRzY29wZS5ob3VycyA9IG51bGw7XHJcbiAgICAgICRzY29wZS5taW51dGVzID0gbnVsbDtcclxuICAgICAgJHNjb3BlLnNlY29uZHMgPSBudWxsO1xyXG4gICAgICAkc2NvcGUubWVyaWRpYW4gPSBtZXJpZGlhbnNbMF07XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB2YXIgaG91cnMgPSBzZWxlY3RlZC5nZXRIb3VycygpLFxyXG4gICAgICAgIG1pbnV0ZXMgPSBzZWxlY3RlZC5nZXRNaW51dGVzKCksXHJcbiAgICAgICAgc2Vjb25kcyA9IHNlbGVjdGVkLmdldFNlY29uZHMoKTtcclxuXHJcbiAgICAgIGlmICgkc2NvcGUuc2hvd01lcmlkaWFuKSB7XHJcbiAgICAgICAgaG91cnMgPSBob3VycyA9PT0gMCB8fCBob3VycyA9PT0gMTIgPyAxMiA6IGhvdXJzICUgMTI7IC8vIENvbnZlcnQgMjQgdG8gMTIgaG91ciBzeXN0ZW1cclxuICAgICAgfVxyXG5cclxuICAgICAgJHNjb3BlLmhvdXJzID0ga2V5Ym9hcmRDaGFuZ2UgPT09ICdoJyA/IGhvdXJzIDogcGFkKGhvdXJzLCAhcGFkSG91cnMpO1xyXG4gICAgICBpZiAoa2V5Ym9hcmRDaGFuZ2UgIT09ICdtJykge1xyXG4gICAgICAgICRzY29wZS5taW51dGVzID0gcGFkKG1pbnV0ZXMpO1xyXG4gICAgICB9XHJcbiAgICAgICRzY29wZS5tZXJpZGlhbiA9IHNlbGVjdGVkLmdldEhvdXJzKCkgPCAxMiA/IG1lcmlkaWFuc1swXSA6IG1lcmlkaWFuc1sxXTtcclxuXHJcbiAgICAgIGlmIChrZXlib2FyZENoYW5nZSAhPT0gJ3MnKSB7XHJcbiAgICAgICAgJHNjb3BlLnNlY29uZHMgPSBwYWQoc2Vjb25kcyk7XHJcbiAgICAgIH1cclxuICAgICAgJHNjb3BlLm1lcmlkaWFuID0gc2VsZWN0ZWQuZ2V0SG91cnMoKSA8IDEyID8gbWVyaWRpYW5zWzBdIDogbWVyaWRpYW5zWzFdO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gYWRkU2Vjb25kc1RvU2VsZWN0ZWQoc2Vjb25kcykge1xyXG4gICAgc2VsZWN0ZWQgPSBhZGRTZWNvbmRzKHNlbGVjdGVkLCBzZWNvbmRzKTtcclxuICAgIHJlZnJlc2goKTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGFkZE1pbnV0ZXMoc2VsZWN0ZWQsIG1pbnV0ZXMpIHtcclxuICAgIHJldHVybiBhZGRTZWNvbmRzKHNlbGVjdGVkLCBtaW51dGVzKjYwKTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGFkZFNlY29uZHMoZGF0ZSwgc2Vjb25kcykge1xyXG4gICAgdmFyIGR0ID0gbmV3IERhdGUoZGF0ZS5nZXRUaW1lKCkgKyBzZWNvbmRzICogMTAwMCk7XHJcbiAgICB2YXIgbmV3RGF0ZSA9IG5ldyBEYXRlKGRhdGUpO1xyXG4gICAgbmV3RGF0ZS5zZXRIb3VycyhkdC5nZXRIb3VycygpLCBkdC5nZXRNaW51dGVzKCksIGR0LmdldFNlY29uZHMoKSk7XHJcbiAgICByZXR1cm4gbmV3RGF0ZTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIG1vZGVsSXNFbXB0eSgpIHtcclxuICAgIHJldHVybiAoJHNjb3BlLmhvdXJzID09PSBudWxsIHx8ICRzY29wZS5ob3VycyA9PT0gJycpICYmXHJcbiAgICAgICgkc2NvcGUubWludXRlcyA9PT0gbnVsbCB8fCAkc2NvcGUubWludXRlcyA9PT0gJycpICYmXHJcbiAgICAgICghJHNjb3BlLnNob3dTZWNvbmRzIHx8ICRzY29wZS5zaG93U2Vjb25kcyAmJiAoJHNjb3BlLnNlY29uZHMgPT09IG51bGwgfHwgJHNjb3BlLnNlY29uZHMgPT09ICcnKSk7XHJcbiAgfVxyXG5cclxuICAkc2NvcGUuc2hvd1NwaW5uZXJzID0gYW5ndWxhci5pc0RlZmluZWQoJGF0dHJzLnNob3dTcGlubmVycykgP1xyXG4gICAgJHNjb3BlLiRwYXJlbnQuJGV2YWwoJGF0dHJzLnNob3dTcGlubmVycykgOiB0aW1lcGlja2VyQ29uZmlnLnNob3dTcGlubmVycztcclxuXHJcbiAgJHNjb3BlLmluY3JlbWVudEhvdXJzID0gZnVuY3Rpb24oKSB7XHJcbiAgICBpZiAoISRzY29wZS5ub0luY3JlbWVudEhvdXJzKCkpIHtcclxuICAgICAgYWRkU2Vjb25kc1RvU2VsZWN0ZWQoaG91clN0ZXAgKiA2MCAqIDYwKTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICAkc2NvcGUuZGVjcmVtZW50SG91cnMgPSBmdW5jdGlvbigpIHtcclxuICAgIGlmICghJHNjb3BlLm5vRGVjcmVtZW50SG91cnMoKSkge1xyXG4gICAgICBhZGRTZWNvbmRzVG9TZWxlY3RlZCgtaG91clN0ZXAgKiA2MCAqIDYwKTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICAkc2NvcGUuaW5jcmVtZW50TWludXRlcyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgaWYgKCEkc2NvcGUubm9JbmNyZW1lbnRNaW51dGVzKCkpIHtcclxuICAgICAgYWRkU2Vjb25kc1RvU2VsZWN0ZWQobWludXRlU3RlcCAqIDYwKTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICAkc2NvcGUuZGVjcmVtZW50TWludXRlcyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgaWYgKCEkc2NvcGUubm9EZWNyZW1lbnRNaW51dGVzKCkpIHtcclxuICAgICAgYWRkU2Vjb25kc1RvU2VsZWN0ZWQoLW1pbnV0ZVN0ZXAgKiA2MCk7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgJHNjb3BlLmluY3JlbWVudFNlY29uZHMgPSBmdW5jdGlvbigpIHtcclxuICAgIGlmICghJHNjb3BlLm5vSW5jcmVtZW50U2Vjb25kcygpKSB7XHJcbiAgICAgIGFkZFNlY29uZHNUb1NlbGVjdGVkKHNlY29uZFN0ZXApO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gICRzY29wZS5kZWNyZW1lbnRTZWNvbmRzID0gZnVuY3Rpb24oKSB7XHJcbiAgICBpZiAoISRzY29wZS5ub0RlY3JlbWVudFNlY29uZHMoKSkge1xyXG4gICAgICBhZGRTZWNvbmRzVG9TZWxlY3RlZCgtc2Vjb25kU3RlcCk7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgJHNjb3BlLnRvZ2dsZU1lcmlkaWFuID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgbWludXRlcyA9IGdldE1pbnV0ZXNGcm9tVGVtcGxhdGUoKSxcclxuICAgICAgICBob3VycyA9IGdldEhvdXJzRnJvbVRlbXBsYXRlKCk7XHJcblxyXG4gICAgaWYgKCEkc2NvcGUubm9Ub2dnbGVNZXJpZGlhbigpKSB7XHJcbiAgICAgIGlmIChhbmd1bGFyLmlzRGVmaW5lZChtaW51dGVzKSAmJiBhbmd1bGFyLmlzRGVmaW5lZChob3VycykpIHtcclxuICAgICAgICBhZGRTZWNvbmRzVG9TZWxlY3RlZCgxMiAqIDYwICogKHNlbGVjdGVkLmdldEhvdXJzKCkgPCAxMiA/IDYwIDogLTYwKSk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgJHNjb3BlLm1lcmlkaWFuID0gJHNjb3BlLm1lcmlkaWFuID09PSBtZXJpZGlhbnNbMF0gPyBtZXJpZGlhbnNbMV0gOiBtZXJpZGlhbnNbMF07XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9O1xyXG5cclxuICAkc2NvcGUuYmx1ciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgbmdNb2RlbEN0cmwuJHNldFRvdWNoZWQoKTtcclxuICB9O1xyXG5cclxuICAkc2NvcGUuJG9uKCckZGVzdHJveScsIGZ1bmN0aW9uKCkge1xyXG4gICAgd2hpbGUgKHdhdGNoZXJzLmxlbmd0aCkge1xyXG4gICAgICB3YXRjaGVycy5zaGlmdCgpKCk7XHJcbiAgICB9XHJcbiAgfSk7XHJcbn1dKVxyXG5cclxuLmRpcmVjdGl2ZSgndWliVGltZXBpY2tlcicsIFsndWliVGltZXBpY2tlckNvbmZpZycsIGZ1bmN0aW9uKHVpYlRpbWVwaWNrZXJDb25maWcpIHtcclxuICByZXR1cm4ge1xyXG4gICAgcmVxdWlyZTogWyd1aWJUaW1lcGlja2VyJywgJz9ebmdNb2RlbCddLFxyXG4gICAgcmVzdHJpY3Q6ICdBJyxcclxuICAgIGNvbnRyb2xsZXI6ICdVaWJUaW1lcGlja2VyQ29udHJvbGxlcicsXHJcbiAgICBjb250cm9sbGVyQXM6ICd0aW1lcGlja2VyJyxcclxuICAgIHNjb3BlOiB7fSxcclxuICAgIHRlbXBsYXRlVXJsOiBmdW5jdGlvbihlbGVtZW50LCBhdHRycykge1xyXG4gICAgICByZXR1cm4gYXR0cnMudGVtcGxhdGVVcmwgfHwgdWliVGltZXBpY2tlckNvbmZpZy50ZW1wbGF0ZVVybDtcclxuICAgIH0sXHJcbiAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxlbWVudCwgYXR0cnMsIGN0cmxzKSB7XHJcbiAgICAgIHZhciB0aW1lcGlja2VyQ3RybCA9IGN0cmxzWzBdLCBuZ01vZGVsQ3RybCA9IGN0cmxzWzFdO1xyXG5cclxuICAgICAgaWYgKG5nTW9kZWxDdHJsKSB7XHJcbiAgICAgICAgdGltZXBpY2tlckN0cmwuaW5pdChuZ01vZGVsQ3RybCwgZWxlbWVudC5maW5kKCdpbnB1dCcpKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH07XHJcbn1dKTtcclxuXHJcbmFuZ3VsYXIubW9kdWxlKCd1aS5ib290c3RyYXAudHlwZWFoZWFkJywgWyd1aS5ib290c3RyYXAuZGVib3VuY2UnLCAndWkuYm9vdHN0cmFwLnBvc2l0aW9uJ10pXHJcblxyXG4vKipcclxuICogQSBoZWxwZXIgc2VydmljZSB0aGF0IGNhbiBwYXJzZSB0eXBlYWhlYWQncyBzeW50YXggKHN0cmluZyBwcm92aWRlZCBieSB1c2VycylcclxuICogRXh0cmFjdGVkIHRvIGEgc2VwYXJhdGUgc2VydmljZSBmb3IgZWFzZSBvZiB1bml0IHRlc3RpbmdcclxuICovXHJcbiAgLmZhY3RvcnkoJ3VpYlR5cGVhaGVhZFBhcnNlcicsIFsnJHBhcnNlJywgZnVuY3Rpb24oJHBhcnNlKSB7XHJcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAwMDAwMDExMTExMTExMDAwMDAwMDAwMDAwMDIyMjIyMjIyMDAwMDAwMDAwMDAwMDAwMDMzMzMzMzMzMzMzMzMzMzAwMDAwMDAwMDAwNDQ0NDQ0NDQwMDBcclxuICAgIHZhciBUWVBFQUhFQURfUkVHRVhQID0gL15cXHMqKFtcXHNcXFNdKz8pKD86XFxzK2FzXFxzKyhbXFxzXFxTXSs/KSk/XFxzK2ZvclxccysoPzooW1xcJFxcd11bXFwkXFx3XFxkXSopKVxccytpblxccysoW1xcc1xcU10rPykkLztcclxuICAgIHJldHVybiB7XHJcbiAgICAgIHBhcnNlOiBmdW5jdGlvbihpbnB1dCkge1xyXG4gICAgICAgIHZhciBtYXRjaCA9IGlucHV0Lm1hdGNoKFRZUEVBSEVBRF9SRUdFWFApO1xyXG4gICAgICAgIGlmICghbWF0Y2gpIHtcclxuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcclxuICAgICAgICAgICAgJ0V4cGVjdGVkIHR5cGVhaGVhZCBzcGVjaWZpY2F0aW9uIGluIGZvcm0gb2YgXCJfbW9kZWxWYWx1ZV8gKGFzIF9sYWJlbF8pPyBmb3IgX2l0ZW1fIGluIF9jb2xsZWN0aW9uX1wiJyArXHJcbiAgICAgICAgICAgICAgJyBidXQgZ290IFwiJyArIGlucHV0ICsgJ1wiLicpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIGl0ZW1OYW1lOiBtYXRjaFszXSxcclxuICAgICAgICAgIHNvdXJjZTogJHBhcnNlKG1hdGNoWzRdKSxcclxuICAgICAgICAgIHZpZXdNYXBwZXI6ICRwYXJzZShtYXRjaFsyXSB8fCBtYXRjaFsxXSksXHJcbiAgICAgICAgICBtb2RlbE1hcHBlcjogJHBhcnNlKG1hdGNoWzFdKVxyXG4gICAgICAgIH07XHJcbiAgICAgIH1cclxuICAgIH07XHJcbiAgfV0pXHJcblxyXG4gIC5jb250cm9sbGVyKCdVaWJUeXBlYWhlYWRDb250cm9sbGVyJywgWyckc2NvcGUnLCAnJGVsZW1lbnQnLCAnJGF0dHJzJywgJyRjb21waWxlJywgJyRwYXJzZScsICckcScsICckdGltZW91dCcsICckZG9jdW1lbnQnLCAnJHdpbmRvdycsICckcm9vdFNjb3BlJywgJyQkZGVib3VuY2UnLCAnJHVpYlBvc2l0aW9uJywgJ3VpYlR5cGVhaGVhZFBhcnNlcicsXHJcbiAgICBmdW5jdGlvbihvcmlnaW5hbFNjb3BlLCBlbGVtZW50LCBhdHRycywgJGNvbXBpbGUsICRwYXJzZSwgJHEsICR0aW1lb3V0LCAkZG9jdW1lbnQsICR3aW5kb3csICRyb290U2NvcGUsICQkZGVib3VuY2UsICRwb3NpdGlvbiwgdHlwZWFoZWFkUGFyc2VyKSB7XHJcbiAgICB2YXIgSE9UX0tFWVMgPSBbOSwgMTMsIDI3LCAzOCwgNDBdO1xyXG4gICAgdmFyIGV2ZW50RGVib3VuY2VUaW1lID0gMjAwO1xyXG4gICAgdmFyIG1vZGVsQ3RybCwgbmdNb2RlbE9wdGlvbnM7XHJcbiAgICAvL1NVUFBPUlRFRCBBVFRSSUJVVEVTIChPUFRJT05TKVxyXG5cclxuICAgIC8vbWluaW1hbCBubyBvZiBjaGFyYWN0ZXJzIHRoYXQgbmVlZHMgdG8gYmUgZW50ZXJlZCBiZWZvcmUgdHlwZWFoZWFkIGtpY2tzLWluXHJcbiAgICB2YXIgbWluTGVuZ3RoID0gb3JpZ2luYWxTY29wZS4kZXZhbChhdHRycy50eXBlYWhlYWRNaW5MZW5ndGgpO1xyXG4gICAgaWYgKCFtaW5MZW5ndGggJiYgbWluTGVuZ3RoICE9PSAwKSB7XHJcbiAgICAgIG1pbkxlbmd0aCA9IDE7XHJcbiAgICB9XHJcblxyXG4gICAgb3JpZ2luYWxTY29wZS4kd2F0Y2goYXR0cnMudHlwZWFoZWFkTWluTGVuZ3RoLCBmdW5jdGlvbiAobmV3VmFsKSB7XHJcbiAgICAgICAgbWluTGVuZ3RoID0gIW5ld1ZhbCAmJiBuZXdWYWwgIT09IDAgPyAxIDogbmV3VmFsO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy9taW5pbWFsIHdhaXQgdGltZSBhZnRlciBsYXN0IGNoYXJhY3RlciB0eXBlZCBiZWZvcmUgdHlwZWFoZWFkIGtpY2tzLWluXHJcbiAgICB2YXIgd2FpdFRpbWUgPSBvcmlnaW5hbFNjb3BlLiRldmFsKGF0dHJzLnR5cGVhaGVhZFdhaXRNcykgfHwgMDtcclxuXHJcbiAgICAvL3Nob3VsZCBpdCByZXN0cmljdCBtb2RlbCB2YWx1ZXMgdG8gdGhlIG9uZXMgc2VsZWN0ZWQgZnJvbSB0aGUgcG9wdXAgb25seT9cclxuICAgIHZhciBpc0VkaXRhYmxlID0gb3JpZ2luYWxTY29wZS4kZXZhbChhdHRycy50eXBlYWhlYWRFZGl0YWJsZSkgIT09IGZhbHNlO1xyXG4gICAgb3JpZ2luYWxTY29wZS4kd2F0Y2goYXR0cnMudHlwZWFoZWFkRWRpdGFibGUsIGZ1bmN0aW9uIChuZXdWYWwpIHtcclxuICAgICAgaXNFZGl0YWJsZSA9IG5ld1ZhbCAhPT0gZmFsc2U7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvL2JpbmRpbmcgdG8gYSB2YXJpYWJsZSB0aGF0IGluZGljYXRlcyBpZiBtYXRjaGVzIGFyZSBiZWluZyByZXRyaWV2ZWQgYXN5bmNocm9ub3VzbHlcclxuICAgIHZhciBpc0xvYWRpbmdTZXR0ZXIgPSAkcGFyc2UoYXR0cnMudHlwZWFoZWFkTG9hZGluZykuYXNzaWduIHx8IGFuZ3VsYXIubm9vcDtcclxuXHJcbiAgICAvL2EgZnVuY3Rpb24gdG8gZGV0ZXJtaW5lIGlmIGFuIGV2ZW50IHNob3VsZCBjYXVzZSBzZWxlY3Rpb25cclxuICAgIHZhciBpc1NlbGVjdEV2ZW50ID0gYXR0cnMudHlwZWFoZWFkU2hvdWxkU2VsZWN0ID8gJHBhcnNlKGF0dHJzLnR5cGVhaGVhZFNob3VsZFNlbGVjdCkgOiBmdW5jdGlvbihzY29wZSwgdmFscykge1xyXG4gICAgICB2YXIgZXZ0ID0gdmFscy4kZXZlbnQ7XHJcbiAgICAgIHJldHVybiBldnQud2hpY2ggPT09IDEzIHx8IGV2dC53aGljaCA9PT0gOTtcclxuICAgIH07XHJcblxyXG4gICAgLy9hIGNhbGxiYWNrIGV4ZWN1dGVkIHdoZW4gYSBtYXRjaCBpcyBzZWxlY3RlZFxyXG4gICAgdmFyIG9uU2VsZWN0Q2FsbGJhY2sgPSAkcGFyc2UoYXR0cnMudHlwZWFoZWFkT25TZWxlY3QpO1xyXG5cclxuICAgIC8vc2hvdWxkIGl0IHNlbGVjdCBoaWdobGlnaHRlZCBwb3B1cCB2YWx1ZSB3aGVuIGxvc2luZyBmb2N1cz9cclxuICAgIHZhciBpc1NlbGVjdE9uQmx1ciA9IGFuZ3VsYXIuaXNEZWZpbmVkKGF0dHJzLnR5cGVhaGVhZFNlbGVjdE9uQmx1cikgPyBvcmlnaW5hbFNjb3BlLiRldmFsKGF0dHJzLnR5cGVhaGVhZFNlbGVjdE9uQmx1cikgOiBmYWxzZTtcclxuXHJcbiAgICAvL2JpbmRpbmcgdG8gYSB2YXJpYWJsZSB0aGF0IGluZGljYXRlcyBpZiB0aGVyZSB3ZXJlIG5vIHJlc3VsdHMgYWZ0ZXIgdGhlIHF1ZXJ5IGlzIGNvbXBsZXRlZFxyXG4gICAgdmFyIGlzTm9SZXN1bHRzU2V0dGVyID0gJHBhcnNlKGF0dHJzLnR5cGVhaGVhZE5vUmVzdWx0cykuYXNzaWduIHx8IGFuZ3VsYXIubm9vcDtcclxuXHJcbiAgICB2YXIgaW5wdXRGb3JtYXR0ZXIgPSBhdHRycy50eXBlYWhlYWRJbnB1dEZvcm1hdHRlciA/ICRwYXJzZShhdHRycy50eXBlYWhlYWRJbnB1dEZvcm1hdHRlcikgOiB1bmRlZmluZWQ7XHJcblxyXG4gICAgdmFyIGFwcGVuZFRvQm9keSA9IGF0dHJzLnR5cGVhaGVhZEFwcGVuZFRvQm9keSA/IG9yaWdpbmFsU2NvcGUuJGV2YWwoYXR0cnMudHlwZWFoZWFkQXBwZW5kVG9Cb2R5KSA6IGZhbHNlO1xyXG5cclxuICAgIHZhciBhcHBlbmRUbyA9IGF0dHJzLnR5cGVhaGVhZEFwcGVuZFRvID9cclxuICAgICAgb3JpZ2luYWxTY29wZS4kZXZhbChhdHRycy50eXBlYWhlYWRBcHBlbmRUbykgOiBudWxsO1xyXG5cclxuICAgIHZhciBmb2N1c0ZpcnN0ID0gb3JpZ2luYWxTY29wZS4kZXZhbChhdHRycy50eXBlYWhlYWRGb2N1c0ZpcnN0KSAhPT0gZmFsc2U7XHJcblxyXG4gICAgLy9JZiBpbnB1dCBtYXRjaGVzIGFuIGl0ZW0gb2YgdGhlIGxpc3QgZXhhY3RseSwgc2VsZWN0IGl0IGF1dG9tYXRpY2FsbHlcclxuICAgIHZhciBzZWxlY3RPbkV4YWN0ID0gYXR0cnMudHlwZWFoZWFkU2VsZWN0T25FeGFjdCA/IG9yaWdpbmFsU2NvcGUuJGV2YWwoYXR0cnMudHlwZWFoZWFkU2VsZWN0T25FeGFjdCkgOiBmYWxzZTtcclxuXHJcbiAgICAvL2JpbmRpbmcgdG8gYSB2YXJpYWJsZSB0aGF0IGluZGljYXRlcyBpZiBkcm9wZG93biBpcyBvcGVuXHJcbiAgICB2YXIgaXNPcGVuU2V0dGVyID0gJHBhcnNlKGF0dHJzLnR5cGVhaGVhZElzT3BlbikuYXNzaWduIHx8IGFuZ3VsYXIubm9vcDtcclxuXHJcbiAgICB2YXIgc2hvd0hpbnQgPSBvcmlnaW5hbFNjb3BlLiRldmFsKGF0dHJzLnR5cGVhaGVhZFNob3dIaW50KSB8fCBmYWxzZTtcclxuXHJcbiAgICAvL0lOVEVSTkFMIFZBUklBQkxFU1xyXG5cclxuICAgIC8vbW9kZWwgc2V0dGVyIGV4ZWN1dGVkIHVwb24gbWF0Y2ggc2VsZWN0aW9uXHJcbiAgICB2YXIgcGFyc2VkTW9kZWwgPSAkcGFyc2UoYXR0cnMubmdNb2RlbCk7XHJcbiAgICB2YXIgaW52b2tlTW9kZWxTZXR0ZXIgPSAkcGFyc2UoYXR0cnMubmdNb2RlbCArICcoJCQkcCknKTtcclxuICAgIHZhciAkc2V0TW9kZWxWYWx1ZSA9IGZ1bmN0aW9uKHNjb3BlLCBuZXdWYWx1ZSkge1xyXG4gICAgICBpZiAoYW5ndWxhci5pc0Z1bmN0aW9uKHBhcnNlZE1vZGVsKG9yaWdpbmFsU2NvcGUpKSAmJlxyXG4gICAgICAgIG5nTW9kZWxPcHRpb25zICYmIG5nTW9kZWxPcHRpb25zLiRvcHRpb25zICYmIG5nTW9kZWxPcHRpb25zLiRvcHRpb25zLmdldHRlclNldHRlcikge1xyXG4gICAgICAgIHJldHVybiBpbnZva2VNb2RlbFNldHRlcihzY29wZSwgeyQkJHA6IG5ld1ZhbHVlfSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiBwYXJzZWRNb2RlbC5hc3NpZ24oc2NvcGUsIG5ld1ZhbHVlKTtcclxuICAgIH07XHJcblxyXG4gICAgLy9leHByZXNzaW9ucyB1c2VkIGJ5IHR5cGVhaGVhZFxyXG4gICAgdmFyIHBhcnNlclJlc3VsdCA9IHR5cGVhaGVhZFBhcnNlci5wYXJzZShhdHRycy51aWJUeXBlYWhlYWQpO1xyXG5cclxuICAgIHZhciBoYXNGb2N1cztcclxuXHJcbiAgICAvL1VzZWQgdG8gYXZvaWQgYnVnIGluIGlPUyB3ZWJ2aWV3IHdoZXJlIGlPUyBrZXlib2FyZCBkb2VzIG5vdCBmaXJlXHJcbiAgICAvL21vdXNlZG93biAmIG1vdXNldXAgZXZlbnRzXHJcbiAgICAvL0lzc3VlICMzNjk5XHJcbiAgICB2YXIgc2VsZWN0ZWQ7XHJcblxyXG4gICAgLy9jcmVhdGUgYSBjaGlsZCBzY29wZSBmb3IgdGhlIHR5cGVhaGVhZCBkaXJlY3RpdmUgc28gd2UgYXJlIG5vdCBwb2xsdXRpbmcgb3JpZ2luYWwgc2NvcGVcclxuICAgIC8vd2l0aCB0eXBlYWhlYWQtc3BlY2lmaWMgZGF0YSAobWF0Y2hlcywgcXVlcnkgZXRjLilcclxuICAgIHZhciBzY29wZSA9IG9yaWdpbmFsU2NvcGUuJG5ldygpO1xyXG4gICAgdmFyIG9mZkRlc3Ryb3kgPSBvcmlnaW5hbFNjb3BlLiRvbignJGRlc3Ryb3knLCBmdW5jdGlvbigpIHtcclxuICAgICAgc2NvcGUuJGRlc3Ryb3koKTtcclxuICAgIH0pO1xyXG4gICAgc2NvcGUuJG9uKCckZGVzdHJveScsIG9mZkRlc3Ryb3kpO1xyXG5cclxuICAgIC8vIFdBSS1BUklBXHJcbiAgICB2YXIgcG9wdXBJZCA9ICd0eXBlYWhlYWQtJyArIHNjb3BlLiRpZCArICctJyArIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDEwMDAwKTtcclxuICAgIGVsZW1lbnQuYXR0cih7XHJcbiAgICAgICdhcmlhLWF1dG9jb21wbGV0ZSc6ICdsaXN0JyxcclxuICAgICAgJ2FyaWEtZXhwYW5kZWQnOiBmYWxzZSxcclxuICAgICAgJ2FyaWEtb3ducyc6IHBvcHVwSWRcclxuICAgIH0pO1xyXG5cclxuICAgIHZhciBpbnB1dHNDb250YWluZXIsIGhpbnRJbnB1dEVsZW07XHJcbiAgICAvL2FkZCByZWFkLW9ubHkgaW5wdXQgdG8gc2hvdyBoaW50XHJcbiAgICBpZiAoc2hvd0hpbnQpIHtcclxuICAgICAgaW5wdXRzQ29udGFpbmVyID0gYW5ndWxhci5lbGVtZW50KCc8ZGl2PjwvZGl2PicpO1xyXG4gICAgICBpbnB1dHNDb250YWluZXIuY3NzKCdwb3NpdGlvbicsICdyZWxhdGl2ZScpO1xyXG4gICAgICBlbGVtZW50LmFmdGVyKGlucHV0c0NvbnRhaW5lcik7XHJcbiAgICAgIGhpbnRJbnB1dEVsZW0gPSBlbGVtZW50LmNsb25lKCk7XHJcbiAgICAgIGhpbnRJbnB1dEVsZW0uYXR0cigncGxhY2Vob2xkZXInLCAnJyk7XHJcbiAgICAgIGhpbnRJbnB1dEVsZW0uYXR0cigndGFiaW5kZXgnLCAnLTEnKTtcclxuICAgICAgaGludElucHV0RWxlbS52YWwoJycpO1xyXG4gICAgICBoaW50SW5wdXRFbGVtLmNzcyh7XHJcbiAgICAgICAgJ3Bvc2l0aW9uJzogJ2Fic29sdXRlJyxcclxuICAgICAgICAndG9wJzogJzBweCcsXHJcbiAgICAgICAgJ2xlZnQnOiAnMHB4JyxcclxuICAgICAgICAnYm9yZGVyLWNvbG9yJzogJ3RyYW5zcGFyZW50JyxcclxuICAgICAgICAnYm94LXNoYWRvdyc6ICdub25lJyxcclxuICAgICAgICAnb3BhY2l0eSc6IDEsXHJcbiAgICAgICAgJ2JhY2tncm91bmQnOiAnbm9uZSAwJSAwJSAvIGF1dG8gcmVwZWF0IHNjcm9sbCBwYWRkaW5nLWJveCBib3JkZXItYm94IHJnYigyNTUsIDI1NSwgMjU1KScsXHJcbiAgICAgICAgJ2NvbG9yJzogJyM5OTknXHJcbiAgICAgIH0pO1xyXG4gICAgICBlbGVtZW50LmNzcyh7XHJcbiAgICAgICAgJ3Bvc2l0aW9uJzogJ3JlbGF0aXZlJyxcclxuICAgICAgICAndmVydGljYWwtYWxpZ24nOiAndG9wJyxcclxuICAgICAgICAnYmFja2dyb3VuZC1jb2xvcic6ICd0cmFuc3BhcmVudCdcclxuICAgICAgfSk7XHJcblxyXG4gICAgICBpZiAoaGludElucHV0RWxlbS5hdHRyKCdpZCcpKSB7XHJcbiAgICAgICAgaGludElucHV0RWxlbS5yZW1vdmVBdHRyKCdpZCcpOyAvLyByZW1vdmUgZHVwbGljYXRlIGlkIGlmIHByZXNlbnQuXHJcbiAgICAgIH1cclxuICAgICAgaW5wdXRzQ29udGFpbmVyLmFwcGVuZChoaW50SW5wdXRFbGVtKTtcclxuICAgICAgaGludElucHV0RWxlbS5hZnRlcihlbGVtZW50KTtcclxuICAgIH1cclxuXHJcbiAgICAvL3BvcC11cCBlbGVtZW50IHVzZWQgdG8gZGlzcGxheSBtYXRjaGVzXHJcbiAgICB2YXIgcG9wVXBFbCA9IGFuZ3VsYXIuZWxlbWVudCgnPGRpdiB1aWItdHlwZWFoZWFkLXBvcHVwPjwvZGl2PicpO1xyXG4gICAgcG9wVXBFbC5hdHRyKHtcclxuICAgICAgaWQ6IHBvcHVwSWQsXHJcbiAgICAgIG1hdGNoZXM6ICdtYXRjaGVzJyxcclxuICAgICAgYWN0aXZlOiAnYWN0aXZlSWR4JyxcclxuICAgICAgc2VsZWN0OiAnc2VsZWN0KGFjdGl2ZUlkeCwgZXZ0KScsXHJcbiAgICAgICdtb3ZlLWluLXByb2dyZXNzJzogJ21vdmVJblByb2dyZXNzJyxcclxuICAgICAgcXVlcnk6ICdxdWVyeScsXHJcbiAgICAgIHBvc2l0aW9uOiAncG9zaXRpb24nLFxyXG4gICAgICAnYXNzaWduLWlzLW9wZW4nOiAnYXNzaWduSXNPcGVuKGlzT3BlbiknLFxyXG4gICAgICBkZWJvdW5jZTogJ2RlYm91bmNlVXBkYXRlJ1xyXG4gICAgfSk7XHJcbiAgICAvL2N1c3RvbSBpdGVtIHRlbXBsYXRlXHJcbiAgICBpZiAoYW5ndWxhci5pc0RlZmluZWQoYXR0cnMudHlwZWFoZWFkVGVtcGxhdGVVcmwpKSB7XHJcbiAgICAgIHBvcFVwRWwuYXR0cigndGVtcGxhdGUtdXJsJywgYXR0cnMudHlwZWFoZWFkVGVtcGxhdGVVcmwpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChhbmd1bGFyLmlzRGVmaW5lZChhdHRycy50eXBlYWhlYWRQb3B1cFRlbXBsYXRlVXJsKSkge1xyXG4gICAgICBwb3BVcEVsLmF0dHIoJ3BvcHVwLXRlbXBsYXRlLXVybCcsIGF0dHJzLnR5cGVhaGVhZFBvcHVwVGVtcGxhdGVVcmwpO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciByZXNldEhpbnQgPSBmdW5jdGlvbigpIHtcclxuICAgICAgaWYgKHNob3dIaW50KSB7XHJcbiAgICAgICAgaGludElucHV0RWxlbS52YWwoJycpO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIHZhciByZXNldE1hdGNoZXMgPSBmdW5jdGlvbigpIHtcclxuICAgICAgc2NvcGUubWF0Y2hlcyA9IFtdO1xyXG4gICAgICBzY29wZS5hY3RpdmVJZHggPSAtMTtcclxuICAgICAgZWxlbWVudC5hdHRyKCdhcmlhLWV4cGFuZGVkJywgZmFsc2UpO1xyXG4gICAgICByZXNldEhpbnQoKTtcclxuICAgIH07XHJcblxyXG4gICAgdmFyIGdldE1hdGNoSWQgPSBmdW5jdGlvbihpbmRleCkge1xyXG4gICAgICByZXR1cm4gcG9wdXBJZCArICctb3B0aW9uLScgKyBpbmRleDtcclxuICAgIH07XHJcblxyXG4gICAgLy8gSW5kaWNhdGUgdGhhdCB0aGUgc3BlY2lmaWVkIG1hdGNoIGlzIHRoZSBhY3RpdmUgKHByZS1zZWxlY3RlZCkgaXRlbSBpbiB0aGUgbGlzdCBvd25lZCBieSB0aGlzIHR5cGVhaGVhZC5cclxuICAgIC8vIFRoaXMgYXR0cmlidXRlIGlzIGFkZGVkIG9yIHJlbW92ZWQgYXV0b21hdGljYWxseSB3aGVuIHRoZSBgYWN0aXZlSWR4YCBjaGFuZ2VzLlxyXG4gICAgc2NvcGUuJHdhdGNoKCdhY3RpdmVJZHgnLCBmdW5jdGlvbihpbmRleCkge1xyXG4gICAgICBpZiAoaW5kZXggPCAwKSB7XHJcbiAgICAgICAgZWxlbWVudC5yZW1vdmVBdHRyKCdhcmlhLWFjdGl2ZWRlc2NlbmRhbnQnKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBlbGVtZW50LmF0dHIoJ2FyaWEtYWN0aXZlZGVzY2VuZGFudCcsIGdldE1hdGNoSWQoaW5kZXgpKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgdmFyIGlucHV0SXNFeGFjdE1hdGNoID0gZnVuY3Rpb24oaW5wdXRWYWx1ZSwgaW5kZXgpIHtcclxuICAgICAgaWYgKHNjb3BlLm1hdGNoZXMubGVuZ3RoID4gaW5kZXggJiYgaW5wdXRWYWx1ZSkge1xyXG4gICAgICAgIHJldHVybiBpbnB1dFZhbHVlLnRvVXBwZXJDYXNlKCkgPT09IHNjb3BlLm1hdGNoZXNbaW5kZXhdLmxhYmVsLnRvVXBwZXJDYXNlKCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH07XHJcblxyXG4gICAgdmFyIGdldE1hdGNoZXNBc3luYyA9IGZ1bmN0aW9uKGlucHV0VmFsdWUsIGV2dCkge1xyXG4gICAgICB2YXIgbG9jYWxzID0geyR2aWV3VmFsdWU6IGlucHV0VmFsdWV9O1xyXG4gICAgICBpc0xvYWRpbmdTZXR0ZXIob3JpZ2luYWxTY29wZSwgdHJ1ZSk7XHJcbiAgICAgIGlzTm9SZXN1bHRzU2V0dGVyKG9yaWdpbmFsU2NvcGUsIGZhbHNlKTtcclxuICAgICAgJHEud2hlbihwYXJzZXJSZXN1bHQuc291cmNlKG9yaWdpbmFsU2NvcGUsIGxvY2FscykpLnRoZW4oZnVuY3Rpb24obWF0Y2hlcykge1xyXG4gICAgICAgIC8vaXQgbWlnaHQgaGFwcGVuIHRoYXQgc2V2ZXJhbCBhc3luYyBxdWVyaWVzIHdlcmUgaW4gcHJvZ3Jlc3MgaWYgYSB1c2VyIHdlcmUgdHlwaW5nIGZhc3RcclxuICAgICAgICAvL2J1dCB3ZSBhcmUgaW50ZXJlc3RlZCBvbmx5IGluIHJlc3BvbnNlcyB0aGF0IGNvcnJlc3BvbmQgdG8gdGhlIGN1cnJlbnQgdmlldyB2YWx1ZVxyXG4gICAgICAgIHZhciBvbkN1cnJlbnRSZXF1ZXN0ID0gaW5wdXRWYWx1ZSA9PT0gbW9kZWxDdHJsLiR2aWV3VmFsdWU7XHJcbiAgICAgICAgaWYgKG9uQ3VycmVudFJlcXVlc3QgJiYgaGFzRm9jdXMpIHtcclxuICAgICAgICAgIGlmIChtYXRjaGVzICYmIG1hdGNoZXMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICBzY29wZS5hY3RpdmVJZHggPSBmb2N1c0ZpcnN0ID8gMCA6IC0xO1xyXG4gICAgICAgICAgICBpc05vUmVzdWx0c1NldHRlcihvcmlnaW5hbFNjb3BlLCBmYWxzZSk7XHJcbiAgICAgICAgICAgIHNjb3BlLm1hdGNoZXMubGVuZ3RoID0gMDtcclxuXHJcbiAgICAgICAgICAgIC8vdHJhbnNmb3JtIGxhYmVsc1xyXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG1hdGNoZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICBsb2NhbHNbcGFyc2VyUmVzdWx0Lml0ZW1OYW1lXSA9IG1hdGNoZXNbaV07XHJcbiAgICAgICAgICAgICAgc2NvcGUubWF0Y2hlcy5wdXNoKHtcclxuICAgICAgICAgICAgICAgIGlkOiBnZXRNYXRjaElkKGkpLFxyXG4gICAgICAgICAgICAgICAgbGFiZWw6IHBhcnNlclJlc3VsdC52aWV3TWFwcGVyKHNjb3BlLCBsb2NhbHMpLFxyXG4gICAgICAgICAgICAgICAgbW9kZWw6IG1hdGNoZXNbaV1cclxuICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgc2NvcGUucXVlcnkgPSBpbnB1dFZhbHVlO1xyXG4gICAgICAgICAgICAvL3Bvc2l0aW9uIHBvcC11cCB3aXRoIG1hdGNoZXMgLSB3ZSBuZWVkIHRvIHJlLWNhbGN1bGF0ZSBpdHMgcG9zaXRpb24gZWFjaCB0aW1lIHdlIGFyZSBvcGVuaW5nIGEgd2luZG93XHJcbiAgICAgICAgICAgIC8vd2l0aCBtYXRjaGVzIGFzIGEgcG9wLXVwIG1pZ2h0IGJlIGFic29sdXRlLXBvc2l0aW9uZWQgYW5kIHBvc2l0aW9uIG9mIGFuIGlucHV0IG1pZ2h0IGhhdmUgY2hhbmdlZCBvbiBhIHBhZ2VcclxuICAgICAgICAgICAgLy9kdWUgdG8gb3RoZXIgZWxlbWVudHMgYmVpbmcgcmVuZGVyZWRcclxuICAgICAgICAgICAgcmVjYWxjdWxhdGVQb3NpdGlvbigpO1xyXG5cclxuICAgICAgICAgICAgZWxlbWVudC5hdHRyKCdhcmlhLWV4cGFuZGVkJywgdHJ1ZSk7XHJcblxyXG4gICAgICAgICAgICAvL1NlbGVjdCB0aGUgc2luZ2xlIHJlbWFpbmluZyBvcHRpb24gaWYgdXNlciBpbnB1dCBtYXRjaGVzXHJcbiAgICAgICAgICAgIGlmIChzZWxlY3RPbkV4YWN0ICYmIHNjb3BlLm1hdGNoZXMubGVuZ3RoID09PSAxICYmIGlucHV0SXNFeGFjdE1hdGNoKGlucHV0VmFsdWUsIDApKSB7XHJcbiAgICAgICAgICAgICAgaWYgKGFuZ3VsYXIuaXNOdW1iZXIoc2NvcGUuZGVib3VuY2VVcGRhdGUpIHx8IGFuZ3VsYXIuaXNPYmplY3Qoc2NvcGUuZGVib3VuY2VVcGRhdGUpKSB7XHJcbiAgICAgICAgICAgICAgICAkJGRlYm91bmNlKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICBzY29wZS5zZWxlY3QoMCwgZXZ0KTtcclxuICAgICAgICAgICAgICAgIH0sIGFuZ3VsYXIuaXNOdW1iZXIoc2NvcGUuZGVib3VuY2VVcGRhdGUpID8gc2NvcGUuZGVib3VuY2VVcGRhdGUgOiBzY29wZS5kZWJvdW5jZVVwZGF0ZVsnZGVmYXVsdCddKTtcclxuICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgc2NvcGUuc2VsZWN0KDAsIGV2dCk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoc2hvd0hpbnQpIHtcclxuICAgICAgICAgICAgICB2YXIgZmlyc3RMYWJlbCA9IHNjb3BlLm1hdGNoZXNbMF0ubGFiZWw7XHJcbiAgICAgICAgICAgICAgaWYgKGFuZ3VsYXIuaXNTdHJpbmcoaW5wdXRWYWx1ZSkgJiZcclxuICAgICAgICAgICAgICAgIGlucHV0VmFsdWUubGVuZ3RoID4gMCAmJlxyXG4gICAgICAgICAgICAgICAgZmlyc3RMYWJlbC5zbGljZSgwLCBpbnB1dFZhbHVlLmxlbmd0aCkudG9VcHBlckNhc2UoKSA9PT0gaW5wdXRWYWx1ZS50b1VwcGVyQ2FzZSgpKSB7XHJcbiAgICAgICAgICAgICAgICBoaW50SW5wdXRFbGVtLnZhbChpbnB1dFZhbHVlICsgZmlyc3RMYWJlbC5zbGljZShpbnB1dFZhbHVlLmxlbmd0aCkpO1xyXG4gICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBoaW50SW5wdXRFbGVtLnZhbCgnJyk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXNldE1hdGNoZXMoKTtcclxuICAgICAgICAgICAgaXNOb1Jlc3VsdHNTZXR0ZXIob3JpZ2luYWxTY29wZSwgdHJ1ZSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChvbkN1cnJlbnRSZXF1ZXN0KSB7XHJcbiAgICAgICAgICBpc0xvYWRpbmdTZXR0ZXIob3JpZ2luYWxTY29wZSwgZmFsc2UpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSwgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgcmVzZXRNYXRjaGVzKCk7XHJcbiAgICAgICAgaXNMb2FkaW5nU2V0dGVyKG9yaWdpbmFsU2NvcGUsIGZhbHNlKTtcclxuICAgICAgICBpc05vUmVzdWx0c1NldHRlcihvcmlnaW5hbFNjb3BlLCB0cnVlKTtcclxuICAgICAgfSk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8vIGJpbmQgZXZlbnRzIG9ubHkgaWYgYXBwZW5kVG9Cb2R5IHBhcmFtcyBleGlzdCAtIHBlcmZvcm1hbmNlIGZlYXR1cmVcclxuICAgIGlmIChhcHBlbmRUb0JvZHkpIHtcclxuICAgICAgYW5ndWxhci5lbGVtZW50KCR3aW5kb3cpLm9uKCdyZXNpemUnLCBmaXJlUmVjYWxjdWxhdGluZyk7XHJcbiAgICAgICRkb2N1bWVudC5maW5kKCdib2R5Jykub24oJ3Njcm9sbCcsIGZpcmVSZWNhbGN1bGF0aW5nKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBEZWNsYXJlIHRoZSBkZWJvdW5jZWQgZnVuY3Rpb24gb3V0c2lkZSByZWNhbGN1bGF0aW5nIGZvclxyXG4gICAgLy8gcHJvcGVyIGRlYm91bmNpbmdcclxuICAgIHZhciBkZWJvdW5jZWRSZWNhbGN1bGF0ZSA9ICQkZGVib3VuY2UoZnVuY3Rpb24oKSB7XHJcbiAgICAgIC8vIGlmIHBvcHVwIGlzIHZpc2libGVcclxuICAgICAgaWYgKHNjb3BlLm1hdGNoZXMubGVuZ3RoKSB7XHJcbiAgICAgICAgcmVjYWxjdWxhdGVQb3NpdGlvbigpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBzY29wZS5tb3ZlSW5Qcm9ncmVzcyA9IGZhbHNlO1xyXG4gICAgfSwgZXZlbnREZWJvdW5jZVRpbWUpO1xyXG5cclxuICAgIC8vIERlZmF1bHQgcHJvZ3Jlc3MgdHlwZVxyXG4gICAgc2NvcGUubW92ZUluUHJvZ3Jlc3MgPSBmYWxzZTtcclxuXHJcbiAgICBmdW5jdGlvbiBmaXJlUmVjYWxjdWxhdGluZygpIHtcclxuICAgICAgaWYgKCFzY29wZS5tb3ZlSW5Qcm9ncmVzcykge1xyXG4gICAgICAgIHNjb3BlLm1vdmVJblByb2dyZXNzID0gdHJ1ZTtcclxuICAgICAgICBzY29wZS4kZGlnZXN0KCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGRlYm91bmNlZFJlY2FsY3VsYXRlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gcmVjYWxjdWxhdGUgYWN0dWFsIHBvc2l0aW9uIGFuZCBzZXQgbmV3IHZhbHVlcyB0byBzY29wZVxyXG4gICAgLy8gYWZ0ZXIgZGlnZXN0IGxvb3AgaXMgcG9wdXAgaW4gcmlnaHQgcG9zaXRpb25cclxuICAgIGZ1bmN0aW9uIHJlY2FsY3VsYXRlUG9zaXRpb24oKSB7XHJcbiAgICAgIHNjb3BlLnBvc2l0aW9uID0gYXBwZW5kVG9Cb2R5ID8gJHBvc2l0aW9uLm9mZnNldChlbGVtZW50KSA6ICRwb3NpdGlvbi5wb3NpdGlvbihlbGVtZW50KTtcclxuICAgICAgc2NvcGUucG9zaXRpb24udG9wICs9IGVsZW1lbnQucHJvcCgnb2Zmc2V0SGVpZ2h0Jyk7XHJcbiAgICB9XHJcblxyXG4gICAgLy93ZSBuZWVkIHRvIHByb3BhZ2F0ZSB1c2VyJ3MgcXVlcnkgc28gd2UgY2FuIGhpZ2xpZ2h0IG1hdGNoZXNcclxuICAgIHNjb3BlLnF1ZXJ5ID0gdW5kZWZpbmVkO1xyXG5cclxuICAgIC8vRGVjbGFyZSB0aGUgdGltZW91dCBwcm9taXNlIHZhciBvdXRzaWRlIHRoZSBmdW5jdGlvbiBzY29wZSBzbyB0aGF0IHN0YWNrZWQgY2FsbHMgY2FuIGJlIGNhbmNlbGxlZCBsYXRlclxyXG4gICAgdmFyIHRpbWVvdXRQcm9taXNlO1xyXG5cclxuICAgIHZhciBzY2hlZHVsZVNlYXJjaFdpdGhUaW1lb3V0ID0gZnVuY3Rpb24oaW5wdXRWYWx1ZSkge1xyXG4gICAgICB0aW1lb3V0UHJvbWlzZSA9ICR0aW1lb3V0KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGdldE1hdGNoZXNBc3luYyhpbnB1dFZhbHVlKTtcclxuICAgICAgfSwgd2FpdFRpbWUpO1xyXG4gICAgfTtcclxuXHJcbiAgICB2YXIgY2FuY2VsUHJldmlvdXNUaW1lb3V0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgIGlmICh0aW1lb3V0UHJvbWlzZSkge1xyXG4gICAgICAgICR0aW1lb3V0LmNhbmNlbCh0aW1lb3V0UHJvbWlzZSk7XHJcbiAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgcmVzZXRNYXRjaGVzKCk7XHJcblxyXG4gICAgc2NvcGUuYXNzaWduSXNPcGVuID0gZnVuY3Rpb24gKGlzT3Blbikge1xyXG4gICAgICBpc09wZW5TZXR0ZXIob3JpZ2luYWxTY29wZSwgaXNPcGVuKTtcclxuICAgIH07XHJcblxyXG4gICAgc2NvcGUuc2VsZWN0ID0gZnVuY3Rpb24oYWN0aXZlSWR4LCBldnQpIHtcclxuICAgICAgLy9jYWxsZWQgZnJvbSB3aXRoaW4gdGhlICRkaWdlc3QoKSBjeWNsZVxyXG4gICAgICB2YXIgbG9jYWxzID0ge307XHJcbiAgICAgIHZhciBtb2RlbCwgaXRlbTtcclxuXHJcbiAgICAgIHNlbGVjdGVkID0gdHJ1ZTtcclxuICAgICAgbG9jYWxzW3BhcnNlclJlc3VsdC5pdGVtTmFtZV0gPSBpdGVtID0gc2NvcGUubWF0Y2hlc1thY3RpdmVJZHhdLm1vZGVsO1xyXG4gICAgICBtb2RlbCA9IHBhcnNlclJlc3VsdC5tb2RlbE1hcHBlcihvcmlnaW5hbFNjb3BlLCBsb2NhbHMpO1xyXG4gICAgICAkc2V0TW9kZWxWYWx1ZShvcmlnaW5hbFNjb3BlLCBtb2RlbCk7XHJcbiAgICAgIG1vZGVsQ3RybC4kc2V0VmFsaWRpdHkoJ2VkaXRhYmxlJywgdHJ1ZSk7XHJcbiAgICAgIG1vZGVsQ3RybC4kc2V0VmFsaWRpdHkoJ3BhcnNlJywgdHJ1ZSk7XHJcblxyXG4gICAgICBvblNlbGVjdENhbGxiYWNrKG9yaWdpbmFsU2NvcGUsIHtcclxuICAgICAgICAkaXRlbTogaXRlbSxcclxuICAgICAgICAkbW9kZWw6IG1vZGVsLFxyXG4gICAgICAgICRsYWJlbDogcGFyc2VyUmVzdWx0LnZpZXdNYXBwZXIob3JpZ2luYWxTY29wZSwgbG9jYWxzKSxcclxuICAgICAgICAkZXZlbnQ6IGV2dFxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIHJlc2V0TWF0Y2hlcygpO1xyXG5cclxuICAgICAgLy9yZXR1cm4gZm9jdXMgdG8gdGhlIGlucHV0IGVsZW1lbnQgaWYgYSBtYXRjaCB3YXMgc2VsZWN0ZWQgdmlhIGEgbW91c2UgY2xpY2sgZXZlbnRcclxuICAgICAgLy8gdXNlIHRpbWVvdXQgdG8gYXZvaWQgJHJvb3RTY29wZTppbnByb2cgZXJyb3JcclxuICAgICAgaWYgKHNjb3BlLiRldmFsKGF0dHJzLnR5cGVhaGVhZEZvY3VzT25TZWxlY3QpICE9PSBmYWxzZSkge1xyXG4gICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uKCkgeyBlbGVtZW50WzBdLmZvY3VzKCk7IH0sIDAsIGZhbHNlKTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICAvL2JpbmQga2V5Ym9hcmQgZXZlbnRzOiBhcnJvd3MgdXAoMzgpIC8gZG93big0MCksIGVudGVyKDEzKSBhbmQgdGFiKDkpLCBlc2MoMjcpXHJcbiAgICBlbGVtZW50Lm9uKCdrZXlkb3duJywgZnVuY3Rpb24oZXZ0KSB7XHJcbiAgICAgIC8vdHlwZWFoZWFkIGlzIG9wZW4gYW5kIGFuIFwiaW50ZXJlc3RpbmdcIiBrZXkgd2FzIHByZXNzZWRcclxuICAgICAgaWYgKHNjb3BlLm1hdGNoZXMubGVuZ3RoID09PSAwIHx8IEhPVF9LRVlTLmluZGV4T2YoZXZ0LndoaWNoKSA9PT0gLTEpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHZhciBzaG91bGRTZWxlY3QgPSBpc1NlbGVjdEV2ZW50KG9yaWdpbmFsU2NvcGUsIHskZXZlbnQ6IGV2dH0pO1xyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIGlmIHRoZXJlJ3Mgbm90aGluZyBzZWxlY3RlZCAoaS5lLiBmb2N1c0ZpcnN0KSBhbmQgZW50ZXIgb3IgdGFiIGlzIGhpdFxyXG4gICAgICAgKiBvclxyXG4gICAgICAgKiBzaGlmdCArIHRhYiBpcyBwcmVzc2VkIHRvIGJyaW5nIGZvY3VzIHRvIHRoZSBwcmV2aW91cyBlbGVtZW50XHJcbiAgICAgICAqIHRoZW4gY2xlYXIgdGhlIHJlc3VsdHNcclxuICAgICAgICovXHJcbiAgICAgIGlmIChzY29wZS5hY3RpdmVJZHggPT09IC0xICYmIHNob3VsZFNlbGVjdCB8fCBldnQud2hpY2ggPT09IDkgJiYgISFldnQuc2hpZnRLZXkpIHtcclxuICAgICAgICByZXNldE1hdGNoZXMoKTtcclxuICAgICAgICBzY29wZS4kZGlnZXN0KCk7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBldnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgdmFyIHRhcmdldDtcclxuICAgICAgc3dpdGNoIChldnQud2hpY2gpIHtcclxuICAgICAgICBjYXNlIDI3OiAvLyBlc2NhcGVcclxuICAgICAgICAgIGV2dC5zdG9wUHJvcGFnYXRpb24oKTtcclxuXHJcbiAgICAgICAgICByZXNldE1hdGNoZXMoKTtcclxuICAgICAgICAgIG9yaWdpbmFsU2NvcGUuJGRpZ2VzdCgpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSAzODogLy8gdXAgYXJyb3dcclxuICAgICAgICAgIHNjb3BlLmFjdGl2ZUlkeCA9IChzY29wZS5hY3RpdmVJZHggPiAwID8gc2NvcGUuYWN0aXZlSWR4IDogc2NvcGUubWF0Y2hlcy5sZW5ndGgpIC0gMTtcclxuICAgICAgICAgIHNjb3BlLiRkaWdlc3QoKTtcclxuICAgICAgICAgIHRhcmdldCA9IHBvcFVwRWxbMF0ucXVlcnlTZWxlY3RvckFsbCgnLnVpYi10eXBlYWhlYWQtbWF0Y2gnKVtzY29wZS5hY3RpdmVJZHhdO1xyXG4gICAgICAgICAgdGFyZ2V0LnBhcmVudE5vZGUuc2Nyb2xsVG9wID0gdGFyZ2V0Lm9mZnNldFRvcDtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgNDA6IC8vIGRvd24gYXJyb3dcclxuICAgICAgICAgIHNjb3BlLmFjdGl2ZUlkeCA9IChzY29wZS5hY3RpdmVJZHggKyAxKSAlIHNjb3BlLm1hdGNoZXMubGVuZ3RoO1xyXG4gICAgICAgICAgc2NvcGUuJGRpZ2VzdCgpO1xyXG4gICAgICAgICAgdGFyZ2V0ID0gcG9wVXBFbFswXS5xdWVyeVNlbGVjdG9yQWxsKCcudWliLXR5cGVhaGVhZC1tYXRjaCcpW3Njb3BlLmFjdGl2ZUlkeF07XHJcbiAgICAgICAgICB0YXJnZXQucGFyZW50Tm9kZS5zY3JvbGxUb3AgPSB0YXJnZXQub2Zmc2V0VG9wO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgIGlmIChzaG91bGRTZWxlY3QpIHtcclxuICAgICAgICAgICAgc2NvcGUuJGFwcGx5KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgIGlmIChhbmd1bGFyLmlzTnVtYmVyKHNjb3BlLmRlYm91bmNlVXBkYXRlKSB8fCBhbmd1bGFyLmlzT2JqZWN0KHNjb3BlLmRlYm91bmNlVXBkYXRlKSkge1xyXG4gICAgICAgICAgICAgICAgJCRkZWJvdW5jZShmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgc2NvcGUuc2VsZWN0KHNjb3BlLmFjdGl2ZUlkeCwgZXZ0KTtcclxuICAgICAgICAgICAgICAgIH0sIGFuZ3VsYXIuaXNOdW1iZXIoc2NvcGUuZGVib3VuY2VVcGRhdGUpID8gc2NvcGUuZGVib3VuY2VVcGRhdGUgOiBzY29wZS5kZWJvdW5jZVVwZGF0ZVsnZGVmYXVsdCddKTtcclxuICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgc2NvcGUuc2VsZWN0KHNjb3BlLmFjdGl2ZUlkeCwgZXZ0KTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICBlbGVtZW50LmJpbmQoJ2ZvY3VzJywgZnVuY3Rpb24gKGV2dCkge1xyXG4gICAgICBoYXNGb2N1cyA9IHRydWU7XHJcbiAgICAgIGlmIChtaW5MZW5ndGggPT09IDAgJiYgIW1vZGVsQ3RybC4kdmlld1ZhbHVlKSB7XHJcbiAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICBnZXRNYXRjaGVzQXN5bmMobW9kZWxDdHJsLiR2aWV3VmFsdWUsIGV2dCk7XHJcbiAgICAgICAgfSwgMCk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIGVsZW1lbnQuYmluZCgnYmx1cicsIGZ1bmN0aW9uKGV2dCkge1xyXG4gICAgICBpZiAoaXNTZWxlY3RPbkJsdXIgJiYgc2NvcGUubWF0Y2hlcy5sZW5ndGggJiYgc2NvcGUuYWN0aXZlSWR4ICE9PSAtMSAmJiAhc2VsZWN0ZWQpIHtcclxuICAgICAgICBzZWxlY3RlZCA9IHRydWU7XHJcbiAgICAgICAgc2NvcGUuJGFwcGx5KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgaWYgKGFuZ3VsYXIuaXNPYmplY3Qoc2NvcGUuZGVib3VuY2VVcGRhdGUpICYmIGFuZ3VsYXIuaXNOdW1iZXIoc2NvcGUuZGVib3VuY2VVcGRhdGUuYmx1cikpIHtcclxuICAgICAgICAgICAgJCRkZWJvdW5jZShmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICBzY29wZS5zZWxlY3Qoc2NvcGUuYWN0aXZlSWR4LCBldnQpO1xyXG4gICAgICAgICAgICB9LCBzY29wZS5kZWJvdW5jZVVwZGF0ZS5ibHVyKTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHNjb3BlLnNlbGVjdChzY29wZS5hY3RpdmVJZHgsIGV2dCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKCFpc0VkaXRhYmxlICYmIG1vZGVsQ3RybC4kZXJyb3IuZWRpdGFibGUpIHtcclxuICAgICAgICBtb2RlbEN0cmwuJHNldFZpZXdWYWx1ZSgpO1xyXG4gICAgICAgIHNjb3BlLiRhcHBseShmdW5jdGlvbigpIHtcclxuICAgICAgICAgIC8vIFJlc2V0IHZhbGlkaXR5IGFzIHdlIGFyZSBjbGVhcmluZ1xyXG4gICAgICAgICAgbW9kZWxDdHJsLiRzZXRWYWxpZGl0eSgnZWRpdGFibGUnLCB0cnVlKTtcclxuICAgICAgICAgIG1vZGVsQ3RybC4kc2V0VmFsaWRpdHkoJ3BhcnNlJywgdHJ1ZSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgZWxlbWVudC52YWwoJycpO1xyXG4gICAgICB9XHJcbiAgICAgIGhhc0ZvY3VzID0gZmFsc2U7XHJcbiAgICAgIHNlbGVjdGVkID0gZmFsc2U7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBLZWVwIHJlZmVyZW5jZSB0byBjbGljayBoYW5kbGVyIHRvIHVuYmluZCBpdC5cclxuICAgIHZhciBkaXNtaXNzQ2xpY2tIYW5kbGVyID0gZnVuY3Rpb24oZXZ0KSB7XHJcbiAgICAgIC8vIElzc3VlICMzOTczXHJcbiAgICAgIC8vIEZpcmVmb3ggdHJlYXRzIHJpZ2h0IGNsaWNrIGFzIGEgY2xpY2sgb24gZG9jdW1lbnRcclxuICAgICAgaWYgKGVsZW1lbnRbMF0gIT09IGV2dC50YXJnZXQgJiYgZXZ0LndoaWNoICE9PSAzICYmIHNjb3BlLm1hdGNoZXMubGVuZ3RoICE9PSAwKSB7XHJcbiAgICAgICAgcmVzZXRNYXRjaGVzKCk7XHJcbiAgICAgICAgaWYgKCEkcm9vdFNjb3BlLiQkcGhhc2UpIHtcclxuICAgICAgICAgIG9yaWdpbmFsU2NvcGUuJGRpZ2VzdCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICAkZG9jdW1lbnQub24oJ2NsaWNrJywgZGlzbWlzc0NsaWNrSGFuZGxlcik7XHJcblxyXG4gICAgb3JpZ2luYWxTY29wZS4kb24oJyRkZXN0cm95JywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICRkb2N1bWVudC5vZmYoJ2NsaWNrJywgZGlzbWlzc0NsaWNrSGFuZGxlcik7XHJcbiAgICAgIGlmIChhcHBlbmRUb0JvZHkgfHwgYXBwZW5kVG8pIHtcclxuICAgICAgICAkcG9wdXAucmVtb3ZlKCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChhcHBlbmRUb0JvZHkpIHtcclxuICAgICAgICBhbmd1bGFyLmVsZW1lbnQoJHdpbmRvdykub2ZmKCdyZXNpemUnLCBmaXJlUmVjYWxjdWxhdGluZyk7XHJcbiAgICAgICAgJGRvY3VtZW50LmZpbmQoJ2JvZHknKS5vZmYoJ3Njcm9sbCcsIGZpcmVSZWNhbGN1bGF0aW5nKTtcclxuICAgICAgfVxyXG4gICAgICAvLyBQcmV2ZW50IGpRdWVyeSBjYWNoZSBtZW1vcnkgbGVha1xyXG4gICAgICBwb3BVcEVsLnJlbW92ZSgpO1xyXG5cclxuICAgICAgaWYgKHNob3dIaW50KSB7XHJcbiAgICAgICAgICBpbnB1dHNDb250YWluZXIucmVtb3ZlKCk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIHZhciAkcG9wdXAgPSAkY29tcGlsZShwb3BVcEVsKShzY29wZSk7XHJcblxyXG4gICAgaWYgKGFwcGVuZFRvQm9keSkge1xyXG4gICAgICAkZG9jdW1lbnQuZmluZCgnYm9keScpLmFwcGVuZCgkcG9wdXApO1xyXG4gICAgfSBlbHNlIGlmIChhcHBlbmRUbykge1xyXG4gICAgICBhbmd1bGFyLmVsZW1lbnQoYXBwZW5kVG8pLmVxKDApLmFwcGVuZCgkcG9wdXApO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgZWxlbWVudC5hZnRlcigkcG9wdXApO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuaW5pdCA9IGZ1bmN0aW9uKF9tb2RlbEN0cmwsIF9uZ01vZGVsT3B0aW9ucykge1xyXG4gICAgICBtb2RlbEN0cmwgPSBfbW9kZWxDdHJsO1xyXG4gICAgICBuZ01vZGVsT3B0aW9ucyA9IF9uZ01vZGVsT3B0aW9ucztcclxuXHJcbiAgICAgIHNjb3BlLmRlYm91bmNlVXBkYXRlID0gbW9kZWxDdHJsLiRvcHRpb25zICYmICRwYXJzZShtb2RlbEN0cmwuJG9wdGlvbnMuZGVib3VuY2UpKG9yaWdpbmFsU2NvcGUpO1xyXG5cclxuICAgICAgLy9wbHVnIGludG8gJHBhcnNlcnMgcGlwZWxpbmUgdG8gb3BlbiBhIHR5cGVhaGVhZCBvbiB2aWV3IGNoYW5nZXMgaW5pdGlhdGVkIGZyb20gRE9NXHJcbiAgICAgIC8vJHBhcnNlcnMga2ljay1pbiBvbiBhbGwgdGhlIGNoYW5nZXMgY29taW5nIGZyb20gdGhlIHZpZXcgYXMgd2VsbCBhcyBtYW51YWxseSB0cmlnZ2VyZWQgYnkgJHNldFZpZXdWYWx1ZVxyXG4gICAgICBtb2RlbEN0cmwuJHBhcnNlcnMudW5zaGlmdChmdW5jdGlvbihpbnB1dFZhbHVlKSB7XHJcbiAgICAgICAgaGFzRm9jdXMgPSB0cnVlO1xyXG5cclxuICAgICAgICBpZiAobWluTGVuZ3RoID09PSAwIHx8IGlucHV0VmFsdWUgJiYgaW5wdXRWYWx1ZS5sZW5ndGggPj0gbWluTGVuZ3RoKSB7XHJcbiAgICAgICAgICBpZiAod2FpdFRpbWUgPiAwKSB7XHJcbiAgICAgICAgICAgIGNhbmNlbFByZXZpb3VzVGltZW91dCgpO1xyXG4gICAgICAgICAgICBzY2hlZHVsZVNlYXJjaFdpdGhUaW1lb3V0KGlucHV0VmFsdWUpO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgZ2V0TWF0Y2hlc0FzeW5jKGlucHV0VmFsdWUpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBpc0xvYWRpbmdTZXR0ZXIob3JpZ2luYWxTY29wZSwgZmFsc2UpO1xyXG4gICAgICAgICAgY2FuY2VsUHJldmlvdXNUaW1lb3V0KCk7XHJcbiAgICAgICAgICByZXNldE1hdGNoZXMoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChpc0VkaXRhYmxlKSB7XHJcbiAgICAgICAgICByZXR1cm4gaW5wdXRWYWx1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghaW5wdXRWYWx1ZSkge1xyXG4gICAgICAgICAgLy8gUmVzZXQgaW4gY2FzZSB1c2VyIGhhZCB0eXBlZCBzb21ldGhpbmcgcHJldmlvdXNseS5cclxuICAgICAgICAgIG1vZGVsQ3RybC4kc2V0VmFsaWRpdHkoJ2VkaXRhYmxlJywgdHJ1ZSk7XHJcbiAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIG1vZGVsQ3RybC4kc2V0VmFsaWRpdHkoJ2VkaXRhYmxlJywgZmFsc2UpO1xyXG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgbW9kZWxDdHJsLiRmb3JtYXR0ZXJzLnB1c2goZnVuY3Rpb24obW9kZWxWYWx1ZSkge1xyXG4gICAgICAgIHZhciBjYW5kaWRhdGVWaWV3VmFsdWUsIGVtcHR5Vmlld1ZhbHVlO1xyXG4gICAgICAgIHZhciBsb2NhbHMgPSB7fTtcclxuXHJcbiAgICAgICAgLy8gVGhlIHZhbGlkaXR5IG1heSBiZSBzZXQgdG8gZmFsc2UgdmlhICRwYXJzZXJzIChzZWUgYWJvdmUpIGlmXHJcbiAgICAgICAgLy8gdGhlIG1vZGVsIGlzIHJlc3RyaWN0ZWQgdG8gc2VsZWN0ZWQgdmFsdWVzLiBJZiB0aGUgbW9kZWxcclxuICAgICAgICAvLyBpcyBzZXQgbWFudWFsbHkgaXQgaXMgY29uc2lkZXJlZCB0byBiZSB2YWxpZC5cclxuICAgICAgICBpZiAoIWlzRWRpdGFibGUpIHtcclxuICAgICAgICAgIG1vZGVsQ3RybC4kc2V0VmFsaWRpdHkoJ2VkaXRhYmxlJywgdHJ1ZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoaW5wdXRGb3JtYXR0ZXIpIHtcclxuICAgICAgICAgIGxvY2Fscy4kbW9kZWwgPSBtb2RlbFZhbHVlO1xyXG4gICAgICAgICAgcmV0dXJuIGlucHV0Rm9ybWF0dGVyKG9yaWdpbmFsU2NvcGUsIGxvY2Fscyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvL2l0IG1pZ2h0IGhhcHBlbiB0aGF0IHdlIGRvbid0IGhhdmUgZW5vdWdoIGluZm8gdG8gcHJvcGVybHkgcmVuZGVyIGlucHV0IHZhbHVlXHJcbiAgICAgICAgLy93ZSBuZWVkIHRvIGNoZWNrIGZvciB0aGlzIHNpdHVhdGlvbiBhbmQgc2ltcGx5IHJldHVybiBtb2RlbCB2YWx1ZSBpZiB3ZSBjYW4ndCBhcHBseSBjdXN0b20gZm9ybWF0dGluZ1xyXG4gICAgICAgIGxvY2Fsc1twYXJzZXJSZXN1bHQuaXRlbU5hbWVdID0gbW9kZWxWYWx1ZTtcclxuICAgICAgICBjYW5kaWRhdGVWaWV3VmFsdWUgPSBwYXJzZXJSZXN1bHQudmlld01hcHBlcihvcmlnaW5hbFNjb3BlLCBsb2NhbHMpO1xyXG4gICAgICAgIGxvY2Fsc1twYXJzZXJSZXN1bHQuaXRlbU5hbWVdID0gdW5kZWZpbmVkO1xyXG4gICAgICAgIGVtcHR5Vmlld1ZhbHVlID0gcGFyc2VyUmVzdWx0LnZpZXdNYXBwZXIob3JpZ2luYWxTY29wZSwgbG9jYWxzKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGNhbmRpZGF0ZVZpZXdWYWx1ZSAhPT0gZW1wdHlWaWV3VmFsdWUgPyBjYW5kaWRhdGVWaWV3VmFsdWUgOiBtb2RlbFZhbHVlO1xyXG4gICAgICB9KTtcclxuICAgIH07XHJcbiAgfV0pXHJcblxyXG4gIC5kaXJlY3RpdmUoJ3VpYlR5cGVhaGVhZCcsIGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgY29udHJvbGxlcjogJ1VpYlR5cGVhaGVhZENvbnRyb2xsZXInLFxyXG4gICAgICByZXF1aXJlOiBbJ25nTW9kZWwnLCAnXj9uZ01vZGVsT3B0aW9ucycsICd1aWJUeXBlYWhlYWQnXSxcclxuICAgICAgbGluazogZnVuY3Rpb24ob3JpZ2luYWxTY29wZSwgZWxlbWVudCwgYXR0cnMsIGN0cmxzKSB7XHJcbiAgICAgICAgY3RybHNbMl0uaW5pdChjdHJsc1swXSwgY3RybHNbMV0pO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG4gIH0pXHJcblxyXG4gIC5kaXJlY3RpdmUoJ3VpYlR5cGVhaGVhZFBvcHVwJywgWyckJGRlYm91bmNlJywgZnVuY3Rpb24oJCRkZWJvdW5jZSkge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgc2NvcGU6IHtcclxuICAgICAgICBtYXRjaGVzOiAnPScsXHJcbiAgICAgICAgcXVlcnk6ICc9JyxcclxuICAgICAgICBhY3RpdmU6ICc9JyxcclxuICAgICAgICBwb3NpdGlvbjogJyYnLFxyXG4gICAgICAgIG1vdmVJblByb2dyZXNzOiAnPScsXHJcbiAgICAgICAgc2VsZWN0OiAnJicsXHJcbiAgICAgICAgYXNzaWduSXNPcGVuOiAnJicsXHJcbiAgICAgICAgZGVib3VuY2U6ICcmJ1xyXG4gICAgICB9LFxyXG4gICAgICByZXBsYWNlOiB0cnVlLFxyXG4gICAgICB0ZW1wbGF0ZVVybDogZnVuY3Rpb24oZWxlbWVudCwgYXR0cnMpIHtcclxuICAgICAgICByZXR1cm4gYXR0cnMucG9wdXBUZW1wbGF0ZVVybCB8fCAndWliL3RlbXBsYXRlL3R5cGVhaGVhZC90eXBlYWhlYWQtcG9wdXAuaHRtbCc7XHJcbiAgICAgIH0sXHJcbiAgICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBlbGVtZW50LCBhdHRycykge1xyXG4gICAgICAgIHNjb3BlLnRlbXBsYXRlVXJsID0gYXR0cnMudGVtcGxhdGVVcmw7XHJcblxyXG4gICAgICAgIHNjb3BlLmlzT3BlbiA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgdmFyIGlzRHJvcGRvd25PcGVuID0gc2NvcGUubWF0Y2hlcy5sZW5ndGggPiAwO1xyXG4gICAgICAgICAgc2NvcGUuYXNzaWduSXNPcGVuKHsgaXNPcGVuOiBpc0Ryb3Bkb3duT3BlbiB9KTtcclxuICAgICAgICAgIHJldHVybiBpc0Ryb3Bkb3duT3BlbjtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBzY29wZS5pc0FjdGl2ZSA9IGZ1bmN0aW9uKG1hdGNoSWR4KSB7XHJcbiAgICAgICAgICByZXR1cm4gc2NvcGUuYWN0aXZlID09PSBtYXRjaElkeDtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBzY29wZS5zZWxlY3RBY3RpdmUgPSBmdW5jdGlvbihtYXRjaElkeCkge1xyXG4gICAgICAgICAgc2NvcGUuYWN0aXZlID0gbWF0Y2hJZHg7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgc2NvcGUuc2VsZWN0TWF0Y2ggPSBmdW5jdGlvbihhY3RpdmVJZHgsIGV2dCkge1xyXG4gICAgICAgICAgdmFyIGRlYm91bmNlID0gc2NvcGUuZGVib3VuY2UoKTtcclxuICAgICAgICAgIGlmIChhbmd1bGFyLmlzTnVtYmVyKGRlYm91bmNlKSB8fCBhbmd1bGFyLmlzT2JqZWN0KGRlYm91bmNlKSkge1xyXG4gICAgICAgICAgICAkJGRlYm91bmNlKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgIHNjb3BlLnNlbGVjdCh7YWN0aXZlSWR4OiBhY3RpdmVJZHgsIGV2dDogZXZ0fSk7XHJcbiAgICAgICAgICAgIH0sIGFuZ3VsYXIuaXNOdW1iZXIoZGVib3VuY2UpID8gZGVib3VuY2UgOiBkZWJvdW5jZVsnZGVmYXVsdCddKTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHNjb3BlLnNlbGVjdCh7YWN0aXZlSWR4OiBhY3RpdmVJZHgsIGV2dDogZXZ0fSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuICB9XSlcclxuXHJcbiAgLmRpcmVjdGl2ZSgndWliVHlwZWFoZWFkTWF0Y2gnLCBbJyR0ZW1wbGF0ZVJlcXVlc3QnLCAnJGNvbXBpbGUnLCAnJHBhcnNlJywgZnVuY3Rpb24oJHRlbXBsYXRlUmVxdWVzdCwgJGNvbXBpbGUsICRwYXJzZSkge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgc2NvcGU6IHtcclxuICAgICAgICBpbmRleDogJz0nLFxyXG4gICAgICAgIG1hdGNoOiAnPScsXHJcbiAgICAgICAgcXVlcnk6ICc9J1xyXG4gICAgICB9LFxyXG4gICAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxlbWVudCwgYXR0cnMpIHtcclxuICAgICAgICB2YXIgdHBsVXJsID0gJHBhcnNlKGF0dHJzLnRlbXBsYXRlVXJsKShzY29wZS4kcGFyZW50KSB8fCAndWliL3RlbXBsYXRlL3R5cGVhaGVhZC90eXBlYWhlYWQtbWF0Y2guaHRtbCc7XHJcbiAgICAgICAgJHRlbXBsYXRlUmVxdWVzdCh0cGxVcmwpLnRoZW4oZnVuY3Rpb24odHBsQ29udGVudCkge1xyXG4gICAgICAgICAgdmFyIHRwbEVsID0gYW5ndWxhci5lbGVtZW50KHRwbENvbnRlbnQudHJpbSgpKTtcclxuICAgICAgICAgIGVsZW1lbnQucmVwbGFjZVdpdGgodHBsRWwpO1xyXG4gICAgICAgICAgJGNvbXBpbGUodHBsRWwpKHNjb3BlKTtcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuICB9XSlcclxuXHJcbiAgLmZpbHRlcigndWliVHlwZWFoZWFkSGlnaGxpZ2h0JywgWyckc2NlJywgJyRpbmplY3RvcicsICckbG9nJywgZnVuY3Rpb24oJHNjZSwgJGluamVjdG9yLCAkbG9nKSB7XHJcbiAgICB2YXIgaXNTYW5pdGl6ZVByZXNlbnQ7XHJcbiAgICBpc1Nhbml0aXplUHJlc2VudCA9ICRpbmplY3Rvci5oYXMoJyRzYW5pdGl6ZScpO1xyXG5cclxuICAgIGZ1bmN0aW9uIGVzY2FwZVJlZ2V4cChxdWVyeVRvRXNjYXBlKSB7XHJcbiAgICAgIC8vIFJlZ2V4OiBjYXB0dXJlIHRoZSB3aG9sZSBxdWVyeSBzdHJpbmcgYW5kIHJlcGxhY2UgaXQgd2l0aCB0aGUgc3RyaW5nIHRoYXQgd2lsbCBiZSB1c2VkIHRvIG1hdGNoXHJcbiAgICAgIC8vIHRoZSByZXN1bHRzLCBmb3IgZXhhbXBsZSBpZiB0aGUgY2FwdHVyZSBpcyBcImFcIiB0aGUgcmVzdWx0IHdpbGwgYmUgXFxhXHJcbiAgICAgIHJldHVybiBxdWVyeVRvRXNjYXBlLnJlcGxhY2UoLyhbLj8qK14kW1xcXVxcXFwoKXt9fC1dKS9nLCAnXFxcXCQxJyk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gY29udGFpbnNIdG1sKG1hdGNoSXRlbSkge1xyXG4gICAgICByZXR1cm4gLzwuKj4vZy50ZXN0KG1hdGNoSXRlbSk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGZ1bmN0aW9uKG1hdGNoSXRlbSwgcXVlcnkpIHtcclxuICAgICAgaWYgKCFpc1Nhbml0aXplUHJlc2VudCAmJiBjb250YWluc0h0bWwobWF0Y2hJdGVtKSkge1xyXG4gICAgICAgICRsb2cud2FybignVW5zYWZlIHVzZSBvZiB0eXBlYWhlYWQgcGxlYXNlIHVzZSBuZ1Nhbml0aXplJyk7IC8vIFdhcm4gdGhlIHVzZXIgYWJvdXQgdGhlIGRhbmdlclxyXG4gICAgICB9XHJcbiAgICAgIG1hdGNoSXRlbSA9IHF1ZXJ5ID8gKCcnICsgbWF0Y2hJdGVtKS5yZXBsYWNlKG5ldyBSZWdFeHAoZXNjYXBlUmVnZXhwKHF1ZXJ5KSwgJ2dpJyksICc8c3Ryb25nPiQmPC9zdHJvbmc+JykgOiBtYXRjaEl0ZW07IC8vIFJlcGxhY2VzIHRoZSBjYXB0dXJlIHN0cmluZyB3aXRoIGEgdGhlIHNhbWUgc3RyaW5nIGluc2lkZSBvZiBhIFwic3Ryb25nXCIgdGFnXHJcbiAgICAgIGlmICghaXNTYW5pdGl6ZVByZXNlbnQpIHtcclxuICAgICAgICBtYXRjaEl0ZW0gPSAkc2NlLnRydXN0QXNIdG1sKG1hdGNoSXRlbSk7IC8vIElmICRzYW5pdGl6ZSBpcyBub3QgcHJlc2VudCB3ZSBwYWNrIHRoZSBzdHJpbmcgaW4gYSAkc2NlIG9iamVjdCBmb3IgdGhlIG5nLWJpbmQtaHRtbCBkaXJlY3RpdmVcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gbWF0Y2hJdGVtO1xyXG4gICAgfTtcclxuICB9XSk7XHJcbmFuZ3VsYXIubW9kdWxlKCd1aS5ib290c3RyYXAuY2Fyb3VzZWwnKS5ydW4oZnVuY3Rpb24oKSB7IWFuZ3VsYXIuJCRjc3AoKS5ub0lubGluZVN0eWxlICYmICFhbmd1bGFyLiQkdWliQ2Fyb3VzZWxDc3MgJiYgYW5ndWxhci5lbGVtZW50KGRvY3VtZW50KS5maW5kKCdoZWFkJykucHJlcGVuZCgnPHN0eWxlIHR5cGU9XCJ0ZXh0L2Nzc1wiPi5uZy1hbmltYXRlLml0ZW06bm90KC5sZWZ0KTpub3QoLnJpZ2h0KXstd2Via2l0LXRyYW5zaXRpb246MHMgZWFzZS1pbi1vdXQgbGVmdDt0cmFuc2l0aW9uOjBzIGVhc2UtaW4tb3V0IGxlZnR9PC9zdHlsZT4nKTsgYW5ndWxhci4kJHVpYkNhcm91c2VsQ3NzID0gdHJ1ZTsgfSk7XHJcbmFuZ3VsYXIubW9kdWxlKCd1aS5ib290c3RyYXAuZGF0ZXBpY2tlcicpLnJ1bihmdW5jdGlvbigpIHshYW5ndWxhci4kJGNzcCgpLm5vSW5saW5lU3R5bGUgJiYgIWFuZ3VsYXIuJCR1aWJEYXRlcGlja2VyQ3NzICYmIGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudCkuZmluZCgnaGVhZCcpLnByZXBlbmQoJzxzdHlsZSB0eXBlPVwidGV4dC9jc3NcIj4udWliLWRhdGVwaWNrZXIgLnVpYi10aXRsZXt3aWR0aDoxMDAlO30udWliLWRheSBidXR0b24sLnVpYi1tb250aCBidXR0b24sLnVpYi15ZWFyIGJ1dHRvbnttaW4td2lkdGg6MTAwJTt9LnVpYi1sZWZ0LC51aWItcmlnaHR7d2lkdGg6MTAwJX08L3N0eWxlPicpOyBhbmd1bGFyLiQkdWliRGF0ZXBpY2tlckNzcyA9IHRydWU7IH0pO1xyXG5hbmd1bGFyLm1vZHVsZSgndWkuYm9vdHN0cmFwLnBvc2l0aW9uJykucnVuKGZ1bmN0aW9uKCkgeyFhbmd1bGFyLiQkY3NwKCkubm9JbmxpbmVTdHlsZSAmJiAhYW5ndWxhci4kJHVpYlBvc2l0aW9uQ3NzICYmIGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudCkuZmluZCgnaGVhZCcpLnByZXBlbmQoJzxzdHlsZSB0eXBlPVwidGV4dC9jc3NcIj4udWliLXBvc2l0aW9uLW1lYXN1cmV7ZGlzcGxheTpibG9jayAhaW1wb3J0YW50O3Zpc2liaWxpdHk6aGlkZGVuICFpbXBvcnRhbnQ7cG9zaXRpb246YWJzb2x1dGUgIWltcG9ydGFudDt0b3A6LTk5OTlweCAhaW1wb3J0YW50O2xlZnQ6LTk5OTlweCAhaW1wb3J0YW50O30udWliLXBvc2l0aW9uLXNjcm9sbGJhci1tZWFzdXJle3Bvc2l0aW9uOmFic29sdXRlICFpbXBvcnRhbnQ7dG9wOi05OTk5cHggIWltcG9ydGFudDt3aWR0aDo1MHB4ICFpbXBvcnRhbnQ7aGVpZ2h0OjUwcHggIWltcG9ydGFudDtvdmVyZmxvdzpzY3JvbGwgIWltcG9ydGFudDt9LnVpYi1wb3NpdGlvbi1ib2R5LXNjcm9sbGJhci1tZWFzdXJle292ZXJmbG93OnNjcm9sbCAhaW1wb3J0YW50O308L3N0eWxlPicpOyBhbmd1bGFyLiQkdWliUG9zaXRpb25Dc3MgPSB0cnVlOyB9KTtcclxuYW5ndWxhci5tb2R1bGUoJ3VpLmJvb3RzdHJhcC5kYXRlcGlja2VyUG9wdXAnKS5ydW4oZnVuY3Rpb24oKSB7IWFuZ3VsYXIuJCRjc3AoKS5ub0lubGluZVN0eWxlICYmICFhbmd1bGFyLiQkdWliRGF0ZXBpY2tlcnBvcHVwQ3NzICYmIGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudCkuZmluZCgnaGVhZCcpLnByZXBlbmQoJzxzdHlsZSB0eXBlPVwidGV4dC9jc3NcIj4udWliLWRhdGVwaWNrZXItcG9wdXAuZHJvcGRvd24tbWVudXtkaXNwbGF5OmJsb2NrO2Zsb2F0Om5vbmU7bWFyZ2luOjA7fS51aWItYnV0dG9uLWJhcntwYWRkaW5nOjEwcHggOXB4IDJweDt9PC9zdHlsZT4nKTsgYW5ndWxhci4kJHVpYkRhdGVwaWNrZXJwb3B1cENzcyA9IHRydWU7IH0pO1xyXG5hbmd1bGFyLm1vZHVsZSgndWkuYm9vdHN0cmFwLnRvb2x0aXAnKS5ydW4oZnVuY3Rpb24oKSB7IWFuZ3VsYXIuJCRjc3AoKS5ub0lubGluZVN0eWxlICYmICFhbmd1bGFyLiQkdWliVG9vbHRpcENzcyAmJiBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQpLmZpbmQoJ2hlYWQnKS5wcmVwZW5kKCc8c3R5bGUgdHlwZT1cInRleHQvY3NzXCI+W3VpYi10b29sdGlwLXBvcHVwXS50b29sdGlwLnRvcC1sZWZ0ID4gLnRvb2x0aXAtYXJyb3csW3VpYi10b29sdGlwLXBvcHVwXS50b29sdGlwLnRvcC1yaWdodCA+IC50b29sdGlwLWFycm93LFt1aWItdG9vbHRpcC1wb3B1cF0udG9vbHRpcC5ib3R0b20tbGVmdCA+IC50b29sdGlwLWFycm93LFt1aWItdG9vbHRpcC1wb3B1cF0udG9vbHRpcC5ib3R0b20tcmlnaHQgPiAudG9vbHRpcC1hcnJvdyxbdWliLXRvb2x0aXAtcG9wdXBdLnRvb2x0aXAubGVmdC10b3AgPiAudG9vbHRpcC1hcnJvdyxbdWliLXRvb2x0aXAtcG9wdXBdLnRvb2x0aXAubGVmdC1ib3R0b20gPiAudG9vbHRpcC1hcnJvdyxbdWliLXRvb2x0aXAtcG9wdXBdLnRvb2x0aXAucmlnaHQtdG9wID4gLnRvb2x0aXAtYXJyb3csW3VpYi10b29sdGlwLXBvcHVwXS50b29sdGlwLnJpZ2h0LWJvdHRvbSA+IC50b29sdGlwLWFycm93LFt1aWItdG9vbHRpcC1odG1sLXBvcHVwXS50b29sdGlwLnRvcC1sZWZ0ID4gLnRvb2x0aXAtYXJyb3csW3VpYi10b29sdGlwLWh0bWwtcG9wdXBdLnRvb2x0aXAudG9wLXJpZ2h0ID4gLnRvb2x0aXAtYXJyb3csW3VpYi10b29sdGlwLWh0bWwtcG9wdXBdLnRvb2x0aXAuYm90dG9tLWxlZnQgPiAudG9vbHRpcC1hcnJvdyxbdWliLXRvb2x0aXAtaHRtbC1wb3B1cF0udG9vbHRpcC5ib3R0b20tcmlnaHQgPiAudG9vbHRpcC1hcnJvdyxbdWliLXRvb2x0aXAtaHRtbC1wb3B1cF0udG9vbHRpcC5sZWZ0LXRvcCA+IC50b29sdGlwLWFycm93LFt1aWItdG9vbHRpcC1odG1sLXBvcHVwXS50b29sdGlwLmxlZnQtYm90dG9tID4gLnRvb2x0aXAtYXJyb3csW3VpYi10b29sdGlwLWh0bWwtcG9wdXBdLnRvb2x0aXAucmlnaHQtdG9wID4gLnRvb2x0aXAtYXJyb3csW3VpYi10b29sdGlwLWh0bWwtcG9wdXBdLnRvb2x0aXAucmlnaHQtYm90dG9tID4gLnRvb2x0aXAtYXJyb3csW3VpYi10b29sdGlwLXRlbXBsYXRlLXBvcHVwXS50b29sdGlwLnRvcC1sZWZ0ID4gLnRvb2x0aXAtYXJyb3csW3VpYi10b29sdGlwLXRlbXBsYXRlLXBvcHVwXS50b29sdGlwLnRvcC1yaWdodCA+IC50b29sdGlwLWFycm93LFt1aWItdG9vbHRpcC10ZW1wbGF0ZS1wb3B1cF0udG9vbHRpcC5ib3R0b20tbGVmdCA+IC50b29sdGlwLWFycm93LFt1aWItdG9vbHRpcC10ZW1wbGF0ZS1wb3B1cF0udG9vbHRpcC5ib3R0b20tcmlnaHQgPiAudG9vbHRpcC1hcnJvdyxbdWliLXRvb2x0aXAtdGVtcGxhdGUtcG9wdXBdLnRvb2x0aXAubGVmdC10b3AgPiAudG9vbHRpcC1hcnJvdyxbdWliLXRvb2x0aXAtdGVtcGxhdGUtcG9wdXBdLnRvb2x0aXAubGVmdC1ib3R0b20gPiAudG9vbHRpcC1hcnJvdyxbdWliLXRvb2x0aXAtdGVtcGxhdGUtcG9wdXBdLnRvb2x0aXAucmlnaHQtdG9wID4gLnRvb2x0aXAtYXJyb3csW3VpYi10b29sdGlwLXRlbXBsYXRlLXBvcHVwXS50b29sdGlwLnJpZ2h0LWJvdHRvbSA+IC50b29sdGlwLWFycm93LFt1aWItcG9wb3Zlci1wb3B1cF0ucG9wb3Zlci50b3AtbGVmdCA+IC5hcnJvdyxbdWliLXBvcG92ZXItcG9wdXBdLnBvcG92ZXIudG9wLXJpZ2h0ID4gLmFycm93LFt1aWItcG9wb3Zlci1wb3B1cF0ucG9wb3Zlci5ib3R0b20tbGVmdCA+IC5hcnJvdyxbdWliLXBvcG92ZXItcG9wdXBdLnBvcG92ZXIuYm90dG9tLXJpZ2h0ID4gLmFycm93LFt1aWItcG9wb3Zlci1wb3B1cF0ucG9wb3Zlci5sZWZ0LXRvcCA+IC5hcnJvdyxbdWliLXBvcG92ZXItcG9wdXBdLnBvcG92ZXIubGVmdC1ib3R0b20gPiAuYXJyb3csW3VpYi1wb3BvdmVyLXBvcHVwXS5wb3BvdmVyLnJpZ2h0LXRvcCA+IC5hcnJvdyxbdWliLXBvcG92ZXItcG9wdXBdLnBvcG92ZXIucmlnaHQtYm90dG9tID4gLmFycm93LFt1aWItcG9wb3Zlci1odG1sLXBvcHVwXS5wb3BvdmVyLnRvcC1sZWZ0ID4gLmFycm93LFt1aWItcG9wb3Zlci1odG1sLXBvcHVwXS5wb3BvdmVyLnRvcC1yaWdodCA+IC5hcnJvdyxbdWliLXBvcG92ZXItaHRtbC1wb3B1cF0ucG9wb3Zlci5ib3R0b20tbGVmdCA+IC5hcnJvdyxbdWliLXBvcG92ZXItaHRtbC1wb3B1cF0ucG9wb3Zlci5ib3R0b20tcmlnaHQgPiAuYXJyb3csW3VpYi1wb3BvdmVyLWh0bWwtcG9wdXBdLnBvcG92ZXIubGVmdC10b3AgPiAuYXJyb3csW3VpYi1wb3BvdmVyLWh0bWwtcG9wdXBdLnBvcG92ZXIubGVmdC1ib3R0b20gPiAuYXJyb3csW3VpYi1wb3BvdmVyLWh0bWwtcG9wdXBdLnBvcG92ZXIucmlnaHQtdG9wID4gLmFycm93LFt1aWItcG9wb3Zlci1odG1sLXBvcHVwXS5wb3BvdmVyLnJpZ2h0LWJvdHRvbSA+IC5hcnJvdyxbdWliLXBvcG92ZXItdGVtcGxhdGUtcG9wdXBdLnBvcG92ZXIudG9wLWxlZnQgPiAuYXJyb3csW3VpYi1wb3BvdmVyLXRlbXBsYXRlLXBvcHVwXS5wb3BvdmVyLnRvcC1yaWdodCA+IC5hcnJvdyxbdWliLXBvcG92ZXItdGVtcGxhdGUtcG9wdXBdLnBvcG92ZXIuYm90dG9tLWxlZnQgPiAuYXJyb3csW3VpYi1wb3BvdmVyLXRlbXBsYXRlLXBvcHVwXS5wb3BvdmVyLmJvdHRvbS1yaWdodCA+IC5hcnJvdyxbdWliLXBvcG92ZXItdGVtcGxhdGUtcG9wdXBdLnBvcG92ZXIubGVmdC10b3AgPiAuYXJyb3csW3VpYi1wb3BvdmVyLXRlbXBsYXRlLXBvcHVwXS5wb3BvdmVyLmxlZnQtYm90dG9tID4gLmFycm93LFt1aWItcG9wb3Zlci10ZW1wbGF0ZS1wb3B1cF0ucG9wb3Zlci5yaWdodC10b3AgPiAuYXJyb3csW3VpYi1wb3BvdmVyLXRlbXBsYXRlLXBvcHVwXS5wb3BvdmVyLnJpZ2h0LWJvdHRvbSA+IC5hcnJvd3t0b3A6YXV0bztib3R0b206YXV0bztsZWZ0OmF1dG87cmlnaHQ6YXV0bzttYXJnaW46MDt9W3VpYi1wb3BvdmVyLXBvcHVwXS5wb3BvdmVyLFt1aWItcG9wb3Zlci1odG1sLXBvcHVwXS5wb3BvdmVyLFt1aWItcG9wb3Zlci10ZW1wbGF0ZS1wb3B1cF0ucG9wb3ZlcntkaXNwbGF5OmJsb2NrICFpbXBvcnRhbnQ7fTwvc3R5bGU+Jyk7IGFuZ3VsYXIuJCR1aWJUb29sdGlwQ3NzID0gdHJ1ZTsgfSk7XHJcbmFuZ3VsYXIubW9kdWxlKCd1aS5ib290c3RyYXAudGltZXBpY2tlcicpLnJ1bihmdW5jdGlvbigpIHshYW5ndWxhci4kJGNzcCgpLm5vSW5saW5lU3R5bGUgJiYgIWFuZ3VsYXIuJCR1aWJUaW1lcGlja2VyQ3NzICYmIGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudCkuZmluZCgnaGVhZCcpLnByZXBlbmQoJzxzdHlsZSB0eXBlPVwidGV4dC9jc3NcIj4udWliLXRpbWUgaW5wdXR7d2lkdGg6NTBweDt9PC9zdHlsZT4nKTsgYW5ndWxhci4kJHVpYlRpbWVwaWNrZXJDc3MgPSB0cnVlOyB9KTtcclxuYW5ndWxhci5tb2R1bGUoJ3VpLmJvb3RzdHJhcC50eXBlYWhlYWQnKS5ydW4oZnVuY3Rpb24oKSB7IWFuZ3VsYXIuJCRjc3AoKS5ub0lubGluZVN0eWxlICYmICFhbmd1bGFyLiQkdWliVHlwZWFoZWFkQ3NzICYmIGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudCkuZmluZCgnaGVhZCcpLnByZXBlbmQoJzxzdHlsZSB0eXBlPVwidGV4dC9jc3NcIj5bdWliLXR5cGVhaGVhZC1wb3B1cF0uZHJvcGRvd24tbWVudXtkaXNwbGF5OmJsb2NrO308L3N0eWxlPicpOyBhbmd1bGFyLiQkdWliVHlwZWFoZWFkQ3NzID0gdHJ1ZTsgfSk7Il0sImZpbGUiOiJ1aS1ib290c3RyYXAuanMifQ==
