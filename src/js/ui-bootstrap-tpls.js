/*
 * angular-ui-bootstrap
 * http://angular-ui.github.io/bootstrap/

 * Version: 2.1.3 - 2016-08-25
 * License: MIT
 */angular.module("ui.bootstrap", ["ui.bootstrap.tpls", "ui.bootstrap.collapse","ui.bootstrap.tabindex","ui.bootstrap.accordion","ui.bootstrap.alert","ui.bootstrap.buttons","ui.bootstrap.carousel","ui.bootstrap.dateparser","ui.bootstrap.isClass","ui.bootstrap.datepicker","ui.bootstrap.position","ui.bootstrap.datepickerPopup","ui.bootstrap.debounce","ui.bootstrap.dropdown","ui.bootstrap.stackedMap","ui.bootstrap.modal","ui.bootstrap.paging","ui.bootstrap.pager","ui.bootstrap.pagination","ui.bootstrap.tooltip","ui.bootstrap.popover","ui.bootstrap.progressbar","ui.bootstrap.rating","ui.bootstrap.tabs","ui.bootstrap.timepicker","ui.bootstrap.typeahead"]);
angular.module("ui.bootstrap.tpls", ["uib/template/accordion/accordion-group.html","uib/template/accordion/accordion.html","uib/template/alert/alert.html","uib/template/carousel/carousel.html","uib/template/carousel/slide.html","uib/template/datepicker/datepicker.html","uib/template/datepicker/day.html","uib/template/datepicker/month.html","uib/template/datepicker/year.html","uib/template/datepickerPopup/popup.html","uib/template/modal/window.html","uib/template/pager/pager.html","uib/template/pagination/pagination.html","uib/template/tooltip/tooltip-html-popup.html","uib/template/tooltip/tooltip-popup.html","uib/template/tooltip/tooltip-template-popup.html","uib/template/popover/popover-html.html","uib/template/popover/popover-template.html","uib/template/popover/popover.html","uib/template/progressbar/bar.html","uib/template/progressbar/progress.html","uib/template/progressbar/progressbar.html","uib/template/rating/rating.html","uib/template/tabs/tab.html","uib/template/tabs/tabset.html","uib/template/timepicker/timepicker.html","uib/template/typeahead/typeahead-match.html","uib/template/typeahead/typeahead-popup.html"]);
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

angular.module("uib/template/accordion/accordion-group.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("uib/template/accordion/accordion-group.html",
    "<div role=\"tab\" id=\"{{::headingId}}\" aria-selected=\"{{isOpen}}\" class=\"panel-heading\" ng-keypress=\"toggleOpen($event)\">\n" +
    "  <h4 class=\"panel-title\">\n" +
    "    <a role=\"button\" data-toggle=\"collapse\" href aria-expanded=\"{{isOpen}}\" aria-controls=\"{{::panelId}}\" tabindex=\"0\" class=\"accordion-toggle\" ng-click=\"toggleOpen()\" uib-accordion-transclude=\"heading\" ng-disabled=\"isDisabled\" uib-tabindex-toggle><span uib-accordion-header ng-class=\"{'text-muted': isDisabled}\">{{heading}}</span></a>\n" +
    "  </h4>\n" +
    "</div>\n" +
    "<div id=\"{{::panelId}}\" aria-labelledby=\"{{::headingId}}\" aria-hidden=\"{{!isOpen}}\" role=\"tabpanel\" class=\"panel-collapse collapse\" uib-collapse=\"!isOpen\">\n" +
    "  <div class=\"panel-body\" ng-transclude></div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("uib/template/accordion/accordion.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("uib/template/accordion/accordion.html",
    "<div role=\"tablist\" class=\"panel-group\" ng-transclude></div>");
}]);

angular.module("uib/template/alert/alert.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("uib/template/alert/alert.html",
    "<button ng-show=\"closeable\" type=\"button\" class=\"close\" ng-click=\"close({$event: $event})\">\n" +
    "  <span aria-hidden=\"true\">&times;</span>\n" +
    "  <span class=\"sr-only\">Close</span>\n" +
    "</button>\n" +
    "<div ng-transclude></div>\n" +
    "");
}]);

angular.module("uib/template/carousel/carousel.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("uib/template/carousel/carousel.html",
    "<div class=\"carousel-inner\" ng-transclude></div>\n" +
    "<a role=\"button\" href class=\"left carousel-control\" ng-click=\"prev()\" ng-class=\"{ disabled: isPrevDisabled() }\" ng-show=\"slides.length > 1\">\n" +
    "  <span aria-hidden=\"true\" class=\"glyphicon glyphicon-chevron-left\"></span>\n" +
    "  <span class=\"sr-only\">previous</span>\n" +
    "</a>\n" +
    "<a role=\"button\" href class=\"right carousel-control\" ng-click=\"next()\" ng-class=\"{ disabled: isNextDisabled() }\" ng-show=\"slides.length > 1\">\n" +
    "  <span aria-hidden=\"true\" class=\"glyphicon glyphicon-chevron-right\"></span>\n" +
    "  <span class=\"sr-only\">next</span>\n" +
    "</a>\n" +
    "<ol class=\"carousel-indicators\" ng-show=\"slides.length > 1\">\n" +
    "  <li ng-repeat=\"slide in slides | orderBy:indexOfSlide track by $index\" ng-class=\"{ active: isActive(slide) }\" ng-click=\"select(slide)\">\n" +
    "    <span class=\"sr-only\">slide {{ $index + 1 }} of {{ slides.length }}<span ng-if=\"isActive(slide)\">, currently active</span></span>\n" +
    "  </li>\n" +
    "</ol>\n" +
    "");
}]);

angular.module("uib/template/carousel/slide.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("uib/template/carousel/slide.html",
    "<div class=\"text-center\" ng-transclude></div>\n" +
    "");
}]);

angular.module("uib/template/datepicker/datepicker.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("uib/template/datepicker/datepicker.html",
    "<div ng-switch=\"datepickerMode\">\n" +
    "  <div uib-daypicker ng-switch-when=\"day\" tabindex=\"0\" class=\"uib-daypicker\"></div>\n" +
    "  <div uib-monthpicker ng-switch-when=\"month\" tabindex=\"0\" class=\"uib-monthpicker\"></div>\n" +
    "  <div uib-yearpicker ng-switch-when=\"year\" tabindex=\"0\" class=\"uib-yearpicker\"></div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("uib/template/datepicker/day.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("uib/template/datepicker/day.html",
    "<table role=\"grid\" aria-labelledby=\"{{::uniqueId}}-title\" aria-activedescendant=\"{{activeDateId}}\">\n" +
    "  <thead>\n" +
    "    <tr>\n" +
    "      <th><button type=\"button\" class=\"btn btn-default btn-sm pull-left uib-left\" ng-click=\"move(-1)\" tabindex=\"-1\"><i class=\"glyphicon glyphicon-chevron-left\"></i></button></th>\n" +
    "      <th colspan=\"{{::5 + showWeeks}}\"><button id=\"{{::uniqueId}}-title\" role=\"heading\" aria-live=\"assertive\" aria-atomic=\"true\" type=\"button\" class=\"btn btn-default btn-sm uib-title\" ng-click=\"toggleMode()\" ng-disabled=\"datepickerMode === maxMode\" tabindex=\"-1\"><strong>{{title}}</strong></button></th>\n" +
    "      <th><button type=\"button\" class=\"btn btn-default btn-sm pull-right uib-right\" ng-click=\"move(1)\" tabindex=\"-1\"><i class=\"glyphicon glyphicon-chevron-right\"></i></button></th>\n" +
    "    </tr>\n" +
    "    <tr>\n" +
    "      <th ng-if=\"showWeeks\" class=\"text-center\"></th>\n" +
    "      <th ng-repeat=\"label in ::labels track by $index\" class=\"text-center\"><small aria-label=\"{{::label.full}}\">{{::label.abbr}}</small></th>\n" +
    "    </tr>\n" +
    "  </thead>\n" +
    "  <tbody>\n" +
    "    <tr class=\"uib-weeks\" ng-repeat=\"row in rows track by $index\" role=\"row\">\n" +
    "      <td ng-if=\"showWeeks\" class=\"text-center h6\"><em>{{ weekNumbers[$index] }}</em></td>\n" +
    "      <td ng-repeat=\"dt in row\" class=\"uib-day text-center\" role=\"gridcell\"\n" +
    "        id=\"{{::dt.uid}}\"\n" +
    "        ng-class=\"::dt.customClass\">\n" +
    "        <button type=\"button\" class=\"btn btn-default btn-sm\"\n" +
    "          uib-is-class=\"\n" +
    "            'btn-info' for selectedDt,\n" +
    "            'active' for activeDt\n" +
    "            on dt\"\n" +
    "          ng-click=\"select(dt.date)\"\n" +
    "          ng-disabled=\"::dt.disabled\"\n" +
    "          tabindex=\"-1\"><span ng-class=\"::{'text-muted': dt.secondary, 'text-info': dt.current}\">{{::dt.label}}</span></button>\n" +
    "      </td>\n" +
    "    </tr>\n" +
    "  </tbody>\n" +
    "</table>\n" +
    "");
}]);

angular.module("uib/template/datepicker/month.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("uib/template/datepicker/month.html",
    "<table role=\"grid\" aria-labelledby=\"{{::uniqueId}}-title\" aria-activedescendant=\"{{activeDateId}}\">\n" +
    "  <thead>\n" +
    "    <tr>\n" +
    "      <th><button type=\"button\" class=\"btn btn-default btn-sm pull-left uib-left\" ng-click=\"move(-1)\" tabindex=\"-1\"><i class=\"glyphicon glyphicon-chevron-left\"></i></button></th>\n" +
    "      <th colspan=\"{{::yearHeaderColspan}}\"><button id=\"{{::uniqueId}}-title\" role=\"heading\" aria-live=\"assertive\" aria-atomic=\"true\" type=\"button\" class=\"btn btn-default btn-sm uib-title\" ng-click=\"toggleMode()\" ng-disabled=\"datepickerMode === maxMode\" tabindex=\"-1\"><strong>{{title}}</strong></button></th>\n" +
    "      <th><button type=\"button\" class=\"btn btn-default btn-sm pull-right uib-right\" ng-click=\"move(1)\" tabindex=\"-1\"><i class=\"glyphicon glyphicon-chevron-right\"></i></button></th>\n" +
    "    </tr>\n" +
    "  </thead>\n" +
    "  <tbody>\n" +
    "    <tr class=\"uib-months\" ng-repeat=\"row in rows track by $index\" role=\"row\">\n" +
    "      <td ng-repeat=\"dt in row\" class=\"uib-month text-center\" role=\"gridcell\"\n" +
    "        id=\"{{::dt.uid}}\"\n" +
    "        ng-class=\"::dt.customClass\">\n" +
    "        <button type=\"button\" class=\"btn btn-default\"\n" +
    "          uib-is-class=\"\n" +
    "            'btn-info' for selectedDt,\n" +
    "            'active' for activeDt\n" +
    "            on dt\"\n" +
    "          ng-click=\"select(dt.date)\"\n" +
    "          ng-disabled=\"::dt.disabled\"\n" +
    "          tabindex=\"-1\"><span ng-class=\"::{'text-info': dt.current}\">{{::dt.label}}</span></button>\n" +
    "      </td>\n" +
    "    </tr>\n" +
    "  </tbody>\n" +
    "</table>\n" +
    "");
}]);

angular.module("uib/template/datepicker/year.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("uib/template/datepicker/year.html",
    "<table role=\"grid\" aria-labelledby=\"{{::uniqueId}}-title\" aria-activedescendant=\"{{activeDateId}}\">\n" +
    "  <thead>\n" +
    "    <tr>\n" +
    "      <th><button type=\"button\" class=\"btn btn-default btn-sm pull-left uib-left\" ng-click=\"move(-1)\" tabindex=\"-1\"><i class=\"glyphicon glyphicon-chevron-left\"></i></button></th>\n" +
    "      <th colspan=\"{{::columns - 2}}\"><button id=\"{{::uniqueId}}-title\" role=\"heading\" aria-live=\"assertive\" aria-atomic=\"true\" type=\"button\" class=\"btn btn-default btn-sm uib-title\" ng-click=\"toggleMode()\" ng-disabled=\"datepickerMode === maxMode\" tabindex=\"-1\"><strong>{{title}}</strong></button></th>\n" +
    "      <th><button type=\"button\" class=\"btn btn-default btn-sm pull-right uib-right\" ng-click=\"move(1)\" tabindex=\"-1\"><i class=\"glyphicon glyphicon-chevron-right\"></i></button></th>\n" +
    "    </tr>\n" +
    "  </thead>\n" +
    "  <tbody>\n" +
    "    <tr class=\"uib-years\" ng-repeat=\"row in rows track by $index\" role=\"row\">\n" +
    "      <td ng-repeat=\"dt in row\" class=\"uib-year text-center\" role=\"gridcell\"\n" +
    "        id=\"{{::dt.uid}}\"\n" +
    "        ng-class=\"::dt.customClass\">\n" +
    "        <button type=\"button\" class=\"btn btn-default\"\n" +
    "          uib-is-class=\"\n" +
    "            'btn-info' for selectedDt,\n" +
    "            'active' for activeDt\n" +
    "            on dt\"\n" +
    "          ng-click=\"select(dt.date)\"\n" +
    "          ng-disabled=\"::dt.disabled\"\n" +
    "          tabindex=\"-1\"><span ng-class=\"::{'text-info': dt.current}\">{{::dt.label}}</span></button>\n" +
    "      </td>\n" +
    "    </tr>\n" +
    "  </tbody>\n" +
    "</table>\n" +
    "");
}]);

angular.module("uib/template/datepickerPopup/popup.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("uib/template/datepickerPopup/popup.html",
    "<ul class=\"uib-datepicker-popup dropdown-menu uib-position-measure\" dropdown-nested ng-if=\"isOpen\" ng-keydown=\"keydown($event)\" ng-click=\"$event.stopPropagation()\">\n" +
    "  <li ng-transclude></li>\n" +
    "  <li ng-if=\"showButtonBar\" class=\"uib-button-bar\">\n" +
    "    <span class=\"btn-group pull-left\">\n" +
    "      <button type=\"button\" class=\"btn btn-sm btn-info uib-datepicker-current\" ng-click=\"select('today', $event)\" ng-disabled=\"isDisabled('today')\">{{ getText('current') }}</button>\n" +
    "      <button type=\"button\" class=\"btn btn-sm btn-danger uib-clear\" ng-click=\"select(null, $event)\">{{ getText('clear') }}</button>\n" +
    "    </span>\n" +
    "    <button type=\"button\" class=\"btn btn-sm btn-success pull-right uib-close\" ng-click=\"close($event)\">{{ getText('close') }}</button>\n" +
    "  </li>\n" +
    "</ul>\n" +
    "");
}]);

angular.module("uib/template/modal/window.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("uib/template/modal/window.html",
    "<div class=\"modal-dialog {{size ? 'modal-' + size : ''}}\"><div class=\"modal-content\" uib-modal-transclude></div></div>\n" +
    "");
}]);

angular.module("uib/template/pager/pager.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("uib/template/pager/pager.html",
    "<li ng-class=\"{disabled: noPrevious()||ngDisabled, previous: align}\"><a href ng-click=\"selectPage(page - 1, $event)\" ng-disabled=\"noPrevious()||ngDisabled\" uib-tabindex-toggle>{{::getText('previous')}}</a></li>\n" +
    "<li ng-class=\"{disabled: noNext()||ngDisabled, next: align}\"><a href ng-click=\"selectPage(page + 1, $event)\" ng-disabled=\"noNext()||ngDisabled\" uib-tabindex-toggle>{{::getText('next')}}</a></li>\n" +
    "");
}]);

angular.module("uib/template/pagination/pagination.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("uib/template/pagination/pagination.html",
    "<li ng-if=\"::boundaryLinks\" ng-class=\"{disabled: noPrevious()||ngDisabled}\" class=\"pagination-first\"><a href ng-click=\"selectPage(1, $event)\" ng-disabled=\"noPrevious()||ngDisabled\" uib-tabindex-toggle>{{::getText('first')}}</a></li>\n" +
    "<li ng-if=\"::directionLinks\" ng-class=\"{disabled: noPrevious()||ngDisabled}\" class=\"pagination-prev\"><a href ng-click=\"selectPage(page - 1, $event)\" ng-disabled=\"noPrevious()||ngDisabled\" uib-tabindex-toggle>{{::getText('previous')}}</a></li>\n" +
    "<li ng-repeat=\"page in pages track by $index\" ng-class=\"{active: page.active,disabled: ngDisabled&&!page.active}\" class=\"pagination-page\"><a href ng-click=\"selectPage(page.number, $event)\" ng-disabled=\"ngDisabled&&!page.active\" uib-tabindex-toggle>{{page.text}}</a></li>\n" +
    "<li ng-if=\"::directionLinks\" ng-class=\"{disabled: noNext()||ngDisabled}\" class=\"pagination-next\"><a href ng-click=\"selectPage(page + 1, $event)\" ng-disabled=\"noNext()||ngDisabled\" uib-tabindex-toggle>{{::getText('next')}}</a></li>\n" +
    "<li ng-if=\"::boundaryLinks\" ng-class=\"{disabled: noNext()||ngDisabled}\" class=\"pagination-last\"><a href ng-click=\"selectPage(totalPages, $event)\" ng-disabled=\"noNext()||ngDisabled\" uib-tabindex-toggle>{{::getText('last')}}</a></li>\n" +
    "");
}]);

angular.module("uib/template/tooltip/tooltip-html-popup.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("uib/template/tooltip/tooltip-html-popup.html",
    "<div class=\"tooltip-arrow\"></div>\n" +
    "<div class=\"tooltip-inner\" ng-bind-html=\"contentExp()\"></div>\n" +
    "");
}]);

angular.module("uib/template/tooltip/tooltip-popup.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("uib/template/tooltip/tooltip-popup.html",
    "<div class=\"tooltip-arrow\"></div>\n" +
    "<div class=\"tooltip-inner\" ng-bind=\"content\"></div>\n" +
    "");
}]);

angular.module("uib/template/tooltip/tooltip-template-popup.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("uib/template/tooltip/tooltip-template-popup.html",
    "<div class=\"tooltip-arrow\"></div>\n" +
    "<div class=\"tooltip-inner\"\n" +
    "  uib-tooltip-template-transclude=\"contentExp()\"\n" +
    "  tooltip-template-transclude-scope=\"originScope()\"></div>\n" +
    "");
}]);

angular.module("uib/template/popover/popover-html.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("uib/template/popover/popover-html.html",
    "<div class=\"arrow\"></div>\n" +
    "\n" +
    "<div class=\"popover-inner\">\n" +
    "    <h3 class=\"popover-title\" ng-bind=\"uibTitle\" ng-if=\"uibTitle\"></h3>\n" +
    "    <div class=\"popover-content\" ng-bind-html=\"contentExp()\"></div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("uib/template/popover/popover-template.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("uib/template/popover/popover-template.html",
    "<div class=\"arrow\"></div>\n" +
    "\n" +
    "<div class=\"popover-inner\">\n" +
    "    <h3 class=\"popover-title\" ng-bind=\"uibTitle\" ng-if=\"uibTitle\"></h3>\n" +
    "    <div class=\"popover-content\"\n" +
    "      uib-tooltip-template-transclude=\"contentExp()\"\n" +
    "      tooltip-template-transclude-scope=\"originScope()\"></div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("uib/template/popover/popover.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("uib/template/popover/popover.html",
    "<div class=\"arrow\"></div>\n" +
    "\n" +
    "<div class=\"popover-inner\">\n" +
    "    <h3 class=\"popover-title\" ng-bind=\"uibTitle\" ng-if=\"uibTitle\"></h3>\n" +
    "    <div class=\"popover-content\" ng-bind=\"content\"></div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("uib/template/progressbar/bar.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("uib/template/progressbar/bar.html",
    "<div class=\"progress-bar\" ng-class=\"type && 'progress-bar-' + type\" role=\"progressbar\" aria-valuenow=\"{{value}}\" aria-valuemin=\"0\" aria-valuemax=\"{{max}}\" ng-style=\"{width: (percent < 100 ? percent : 100) + '%'}\" aria-valuetext=\"{{percent | number:0}}%\" aria-labelledby=\"{{::title}}\" ng-transclude></div>\n" +
    "");
}]);

angular.module("uib/template/progressbar/progress.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("uib/template/progressbar/progress.html",
    "<div class=\"progress\" ng-transclude aria-labelledby=\"{{::title}}\"></div>");
}]);

angular.module("uib/template/progressbar/progressbar.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("uib/template/progressbar/progressbar.html",
    "<div class=\"progress\">\n" +
    "  <div class=\"progress-bar\" ng-class=\"type && 'progress-bar-' + type\" role=\"progressbar\" aria-valuenow=\"{{value}}\" aria-valuemin=\"0\" aria-valuemax=\"{{max}}\" ng-style=\"{width: (percent < 100 ? percent : 100) + '%'}\" aria-valuetext=\"{{percent | number:0}}%\" aria-labelledby=\"{{::title}}\" ng-transclude></div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("uib/template/rating/rating.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("uib/template/rating/rating.html",
    "<span ng-mouseleave=\"reset()\" ng-keydown=\"onKeydown($event)\" tabindex=\"0\" role=\"slider\" aria-valuemin=\"0\" aria-valuemax=\"{{range.length}}\" aria-valuenow=\"{{value}}\" aria-valuetext=\"{{title}}\">\n" +
    "    <span ng-repeat-start=\"r in range track by $index\" class=\"sr-only\">({{ $index < value ? '*' : ' ' }})</span>\n" +
    "    <i ng-repeat-end ng-mouseenter=\"enter($index + 1)\" ng-click=\"rate($index + 1)\" class=\"glyphicon\" ng-class=\"$index < value && (r.stateOn || 'glyphicon-star') || (r.stateOff || 'glyphicon-star-empty')\" ng-attr-title=\"{{r.title}}\"></i>\n" +
    "</span>\n" +
    "");
}]);

angular.module("uib/template/tabs/tab.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("uib/template/tabs/tab.html",
    "<li ng-class=\"[{active: active, disabled: disabled}, classes]\" class=\"uib-tab nav-item\">\n" +
    "  <a href ng-click=\"select($event)\" class=\"nav-link\" uib-tab-heading-transclude>{{heading}}</a>\n" +
    "</li>\n" +
    "");
}]);

angular.module("uib/template/tabs/tabset.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("uib/template/tabs/tabset.html",
    "<div>\n" +
    "  <ul class=\"nav nav-{{tabset.type || 'tabs'}}\" ng-class=\"{'nav-stacked': vertical, 'nav-justified': justified}\" ng-transclude></ul>\n" +
    "  <div class=\"tab-content\">\n" +
    "    <div class=\"tab-pane\"\n" +
    "         ng-repeat=\"tab in tabset.tabs\"\n" +
    "         ng-class=\"{active: tabset.active === tab.index}\"\n" +
    "         uib-tab-content-transclude=\"tab\">\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("uib/template/timepicker/timepicker.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("uib/template/timepicker/timepicker.html",
    "<table class=\"uib-timepicker\">\n" +
    "  <tbody>\n" +
    "    <tr class=\"text-center\" ng-show=\"::showSpinners\">\n" +
    "      <td class=\"uib-increment hours\"><a ng-click=\"incrementHours()\" ng-class=\"{disabled: noIncrementHours()}\" class=\"btn btn-link\" ng-disabled=\"noIncrementHours()\" tabindex=\"-1\"><span class=\"glyphicon glyphicon-chevron-up\"></span></a></td>\n" +
    "      <td>&nbsp;</td>\n" +
    "      <td class=\"uib-increment minutes\"><a ng-click=\"incrementMinutes()\" ng-class=\"{disabled: noIncrementMinutes()}\" class=\"btn btn-link\" ng-disabled=\"noIncrementMinutes()\" tabindex=\"-1\"><span class=\"glyphicon glyphicon-chevron-up\"></span></a></td>\n" +
    "      <td ng-show=\"showSeconds\">&nbsp;</td>\n" +
    "      <td ng-show=\"showSeconds\" class=\"uib-increment seconds\"><a ng-click=\"incrementSeconds()\" ng-class=\"{disabled: noIncrementSeconds()}\" class=\"btn btn-link\" ng-disabled=\"noIncrementSeconds()\" tabindex=\"-1\"><span class=\"glyphicon glyphicon-chevron-up\"></span></a></td>\n" +
    "      <td ng-show=\"showMeridian\"></td>\n" +
    "    </tr>\n" +
    "    <tr>\n" +
    "      <td class=\"form-group uib-time hours\" ng-class=\"{'has-error': invalidHours}\">\n" +
    "        <input type=\"text\" placeholder=\"HH\" ng-model=\"hours\" ng-change=\"updateHours()\" class=\"form-control text-center\" ng-readonly=\"::readonlyInput\" maxlength=\"2\" tabindex=\"{{::tabindex}}\" ng-disabled=\"noIncrementHours()\" ng-blur=\"blur()\">\n" +
    "      </td>\n" +
    "      <td class=\"uib-separator\">:</td>\n" +
    "      <td class=\"form-group uib-time minutes\" ng-class=\"{'has-error': invalidMinutes}\">\n" +
    "        <input type=\"text\" placeholder=\"MM\" ng-model=\"minutes\" ng-change=\"updateMinutes()\" class=\"form-control text-center\" ng-readonly=\"::readonlyInput\" maxlength=\"2\" tabindex=\"{{::tabindex}}\" ng-disabled=\"noIncrementMinutes()\" ng-blur=\"blur()\">\n" +
    "      </td>\n" +
    "      <td ng-show=\"showSeconds\" class=\"uib-separator\">:</td>\n" +
    "      <td class=\"form-group uib-time seconds\" ng-class=\"{'has-error': invalidSeconds}\" ng-show=\"showSeconds\">\n" +
    "        <input type=\"text\" placeholder=\"SS\" ng-model=\"seconds\" ng-change=\"updateSeconds()\" class=\"form-control text-center\" ng-readonly=\"readonlyInput\" maxlength=\"2\" tabindex=\"{{::tabindex}}\" ng-disabled=\"noIncrementSeconds()\" ng-blur=\"blur()\">\n" +
    "      </td>\n" +
    "      <td ng-show=\"showMeridian\" class=\"uib-time am-pm\"><button type=\"button\" ng-class=\"{disabled: noToggleMeridian()}\" class=\"btn btn-default text-center\" ng-click=\"toggleMeridian()\" ng-disabled=\"noToggleMeridian()\" tabindex=\"{{::tabindex}}\">{{meridian}}</button></td>\n" +
    "    </tr>\n" +
    "    <tr class=\"text-center\" ng-show=\"::showSpinners\">\n" +
    "      <td class=\"uib-decrement hours\"><a ng-click=\"decrementHours()\" ng-class=\"{disabled: noDecrementHours()}\" class=\"btn btn-link\" ng-disabled=\"noDecrementHours()\" tabindex=\"-1\"><span class=\"glyphicon glyphicon-chevron-down\"></span></a></td>\n" +
    "      <td>&nbsp;</td>\n" +
    "      <td class=\"uib-decrement minutes\"><a ng-click=\"decrementMinutes()\" ng-class=\"{disabled: noDecrementMinutes()}\" class=\"btn btn-link\" ng-disabled=\"noDecrementMinutes()\" tabindex=\"-1\"><span class=\"glyphicon glyphicon-chevron-down\"></span></a></td>\n" +
    "      <td ng-show=\"showSeconds\">&nbsp;</td>\n" +
    "      <td ng-show=\"showSeconds\" class=\"uib-decrement seconds\"><a ng-click=\"decrementSeconds()\" ng-class=\"{disabled: noDecrementSeconds()}\" class=\"btn btn-link\" ng-disabled=\"noDecrementSeconds()\" tabindex=\"-1\"><span class=\"glyphicon glyphicon-chevron-down\"></span></a></td>\n" +
    "      <td ng-show=\"showMeridian\"></td>\n" +
    "    </tr>\n" +
    "  </tbody>\n" +
    "</table>\n" +
    "");
}]);

angular.module("uib/template/typeahead/typeahead-match.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("uib/template/typeahead/typeahead-match.html",
    "<a href\n" +
    "   tabindex=\"-1\"\n" +
    "   ng-bind-html=\"match.label | uibTypeaheadHighlight:query\"\n" +
    "   ng-attr-title=\"{{match.label}}\"></a>\n" +
    "");
}]);

angular.module("uib/template/typeahead/typeahead-popup.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("uib/template/typeahead/typeahead-popup.html",
    "<ul class=\"dropdown-menu\" ng-show=\"isOpen() && !moveInProgress\" ng-style=\"{top: position().top+'px', left: position().left+'px'}\" role=\"listbox\" aria-hidden=\"{{!isOpen()}}\">\n" +
    "    <li class=\"uib-typeahead-match\" ng-repeat=\"match in matches track by $index\" ng-class=\"{active: isActive($index) }\" ng-mouseenter=\"selectActive($index)\" ng-click=\"selectMatch($index, $event)\" role=\"option\" id=\"{{::match.id}}\">\n" +
    "        <div uib-typeahead-match index=\"$index\" match=\"match\" query=\"query\" template-url=\"templateUrl\"></div>\n" +
    "    </li>\n" +
    "</ul>\n" +
    "");
}]);
angular.module('ui.bootstrap.carousel').run(function() {!angular.$$csp().noInlineStyle && !angular.$$uibCarouselCss && angular.element(document).find('head').prepend('<style type="text/css">.ng-animate.item:not(.left):not(.right){-webkit-transition:0s ease-in-out left;transition:0s ease-in-out left}</style>'); angular.$$uibCarouselCss = true; });
angular.module('ui.bootstrap.datepicker').run(function() {!angular.$$csp().noInlineStyle && !angular.$$uibDatepickerCss && angular.element(document).find('head').prepend('<style type="text/css">.uib-datepicker .uib-title{width:100%;}.uib-day button,.uib-month button,.uib-year button{min-width:100%;}.uib-left,.uib-right{width:100%}</style>'); angular.$$uibDatepickerCss = true; });
angular.module('ui.bootstrap.position').run(function() {!angular.$$csp().noInlineStyle && !angular.$$uibPositionCss && angular.element(document).find('head').prepend('<style type="text/css">.uib-position-measure{display:block !important;visibility:hidden !important;position:absolute !important;top:-9999px !important;left:-9999px !important;}.uib-position-scrollbar-measure{position:absolute !important;top:-9999px !important;width:50px !important;height:50px !important;overflow:scroll !important;}.uib-position-body-scrollbar-measure{overflow:scroll !important;}</style>'); angular.$$uibPositionCss = true; });
angular.module('ui.bootstrap.datepickerPopup').run(function() {!angular.$$csp().noInlineStyle && !angular.$$uibDatepickerpopupCss && angular.element(document).find('head').prepend('<style type="text/css">.uib-datepicker-popup.dropdown-menu{display:block;float:none;margin:0;}.uib-button-bar{padding:10px 9px 2px;}</style>'); angular.$$uibDatepickerpopupCss = true; });
angular.module('ui.bootstrap.tooltip').run(function() {!angular.$$csp().noInlineStyle && !angular.$$uibTooltipCss && angular.element(document).find('head').prepend('<style type="text/css">[uib-tooltip-popup].tooltip.top-left > .tooltip-arrow,[uib-tooltip-popup].tooltip.top-right > .tooltip-arrow,[uib-tooltip-popup].tooltip.bottom-left > .tooltip-arrow,[uib-tooltip-popup].tooltip.bottom-right > .tooltip-arrow,[uib-tooltip-popup].tooltip.left-top > .tooltip-arrow,[uib-tooltip-popup].tooltip.left-bottom > .tooltip-arrow,[uib-tooltip-popup].tooltip.right-top > .tooltip-arrow,[uib-tooltip-popup].tooltip.right-bottom > .tooltip-arrow,[uib-tooltip-html-popup].tooltip.top-left > .tooltip-arrow,[uib-tooltip-html-popup].tooltip.top-right > .tooltip-arrow,[uib-tooltip-html-popup].tooltip.bottom-left > .tooltip-arrow,[uib-tooltip-html-popup].tooltip.bottom-right > .tooltip-arrow,[uib-tooltip-html-popup].tooltip.left-top > .tooltip-arrow,[uib-tooltip-html-popup].tooltip.left-bottom > .tooltip-arrow,[uib-tooltip-html-popup].tooltip.right-top > .tooltip-arrow,[uib-tooltip-html-popup].tooltip.right-bottom > .tooltip-arrow,[uib-tooltip-template-popup].tooltip.top-left > .tooltip-arrow,[uib-tooltip-template-popup].tooltip.top-right > .tooltip-arrow,[uib-tooltip-template-popup].tooltip.bottom-left > .tooltip-arrow,[uib-tooltip-template-popup].tooltip.bottom-right > .tooltip-arrow,[uib-tooltip-template-popup].tooltip.left-top > .tooltip-arrow,[uib-tooltip-template-popup].tooltip.left-bottom > .tooltip-arrow,[uib-tooltip-template-popup].tooltip.right-top > .tooltip-arrow,[uib-tooltip-template-popup].tooltip.right-bottom > .tooltip-arrow,[uib-popover-popup].popover.top-left > .arrow,[uib-popover-popup].popover.top-right > .arrow,[uib-popover-popup].popover.bottom-left > .arrow,[uib-popover-popup].popover.bottom-right > .arrow,[uib-popover-popup].popover.left-top > .arrow,[uib-popover-popup].popover.left-bottom > .arrow,[uib-popover-popup].popover.right-top > .arrow,[uib-popover-popup].popover.right-bottom > .arrow,[uib-popover-html-popup].popover.top-left > .arrow,[uib-popover-html-popup].popover.top-right > .arrow,[uib-popover-html-popup].popover.bottom-left > .arrow,[uib-popover-html-popup].popover.bottom-right > .arrow,[uib-popover-html-popup].popover.left-top > .arrow,[uib-popover-html-popup].popover.left-bottom > .arrow,[uib-popover-html-popup].popover.right-top > .arrow,[uib-popover-html-popup].popover.right-bottom > .arrow,[uib-popover-template-popup].popover.top-left > .arrow,[uib-popover-template-popup].popover.top-right > .arrow,[uib-popover-template-popup].popover.bottom-left > .arrow,[uib-popover-template-popup].popover.bottom-right > .arrow,[uib-popover-template-popup].popover.left-top > .arrow,[uib-popover-template-popup].popover.left-bottom > .arrow,[uib-popover-template-popup].popover.right-top > .arrow,[uib-popover-template-popup].popover.right-bottom > .arrow{top:auto;bottom:auto;left:auto;right:auto;margin:0;}[uib-popover-popup].popover,[uib-popover-html-popup].popover,[uib-popover-template-popup].popover{display:block !important;}</style>'); angular.$$uibTooltipCss = true; });
angular.module('ui.bootstrap.timepicker').run(function() {!angular.$$csp().noInlineStyle && !angular.$$uibTimepickerCss && angular.element(document).find('head').prepend('<style type="text/css">.uib-time input{width:50px;}</style>'); angular.$$uibTimepickerCss = true; });
angular.module('ui.bootstrap.typeahead').run(function() {!angular.$$csp().noInlineStyle && !angular.$$uibTypeaheadCss && angular.element(document).find('head').prepend('<style type="text/css">[uib-typeahead-popup].dropdown-menu{display:block;}</style>'); angular.$$uibTypeaheadCss = true; });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJ1aS1ib290c3RyYXAtdHBscy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxyXG4gKiBhbmd1bGFyLXVpLWJvb3RzdHJhcFxyXG4gKiBodHRwOi8vYW5ndWxhci11aS5naXRodWIuaW8vYm9vdHN0cmFwL1xyXG5cclxuICogVmVyc2lvbjogMi4xLjMgLSAyMDE2LTA4LTI1XHJcbiAqIExpY2Vuc2U6IE1JVFxyXG4gKi9hbmd1bGFyLm1vZHVsZShcInVpLmJvb3RzdHJhcFwiLCBbXCJ1aS5ib290c3RyYXAudHBsc1wiLCBcInVpLmJvb3RzdHJhcC5jb2xsYXBzZVwiLFwidWkuYm9vdHN0cmFwLnRhYmluZGV4XCIsXCJ1aS5ib290c3RyYXAuYWNjb3JkaW9uXCIsXCJ1aS5ib290c3RyYXAuYWxlcnRcIixcInVpLmJvb3RzdHJhcC5idXR0b25zXCIsXCJ1aS5ib290c3RyYXAuY2Fyb3VzZWxcIixcInVpLmJvb3RzdHJhcC5kYXRlcGFyc2VyXCIsXCJ1aS5ib290c3RyYXAuaXNDbGFzc1wiLFwidWkuYm9vdHN0cmFwLmRhdGVwaWNrZXJcIixcInVpLmJvb3RzdHJhcC5wb3NpdGlvblwiLFwidWkuYm9vdHN0cmFwLmRhdGVwaWNrZXJQb3B1cFwiLFwidWkuYm9vdHN0cmFwLmRlYm91bmNlXCIsXCJ1aS5ib290c3RyYXAuZHJvcGRvd25cIixcInVpLmJvb3RzdHJhcC5zdGFja2VkTWFwXCIsXCJ1aS5ib290c3RyYXAubW9kYWxcIixcInVpLmJvb3RzdHJhcC5wYWdpbmdcIixcInVpLmJvb3RzdHJhcC5wYWdlclwiLFwidWkuYm9vdHN0cmFwLnBhZ2luYXRpb25cIixcInVpLmJvb3RzdHJhcC50b29sdGlwXCIsXCJ1aS5ib290c3RyYXAucG9wb3ZlclwiLFwidWkuYm9vdHN0cmFwLnByb2dyZXNzYmFyXCIsXCJ1aS5ib290c3RyYXAucmF0aW5nXCIsXCJ1aS5ib290c3RyYXAudGFic1wiLFwidWkuYm9vdHN0cmFwLnRpbWVwaWNrZXJcIixcInVpLmJvb3RzdHJhcC50eXBlYWhlYWRcIl0pO1xyXG5hbmd1bGFyLm1vZHVsZShcInVpLmJvb3RzdHJhcC50cGxzXCIsIFtcInVpYi90ZW1wbGF0ZS9hY2NvcmRpb24vYWNjb3JkaW9uLWdyb3VwLmh0bWxcIixcInVpYi90ZW1wbGF0ZS9hY2NvcmRpb24vYWNjb3JkaW9uLmh0bWxcIixcInVpYi90ZW1wbGF0ZS9hbGVydC9hbGVydC5odG1sXCIsXCJ1aWIvdGVtcGxhdGUvY2Fyb3VzZWwvY2Fyb3VzZWwuaHRtbFwiLFwidWliL3RlbXBsYXRlL2Nhcm91c2VsL3NsaWRlLmh0bWxcIixcInVpYi90ZW1wbGF0ZS9kYXRlcGlja2VyL2RhdGVwaWNrZXIuaHRtbFwiLFwidWliL3RlbXBsYXRlL2RhdGVwaWNrZXIvZGF5Lmh0bWxcIixcInVpYi90ZW1wbGF0ZS9kYXRlcGlja2VyL21vbnRoLmh0bWxcIixcInVpYi90ZW1wbGF0ZS9kYXRlcGlja2VyL3llYXIuaHRtbFwiLFwidWliL3RlbXBsYXRlL2RhdGVwaWNrZXJQb3B1cC9wb3B1cC5odG1sXCIsXCJ1aWIvdGVtcGxhdGUvbW9kYWwvd2luZG93Lmh0bWxcIixcInVpYi90ZW1wbGF0ZS9wYWdlci9wYWdlci5odG1sXCIsXCJ1aWIvdGVtcGxhdGUvcGFnaW5hdGlvbi9wYWdpbmF0aW9uLmh0bWxcIixcInVpYi90ZW1wbGF0ZS90b29sdGlwL3Rvb2x0aXAtaHRtbC1wb3B1cC5odG1sXCIsXCJ1aWIvdGVtcGxhdGUvdG9vbHRpcC90b29sdGlwLXBvcHVwLmh0bWxcIixcInVpYi90ZW1wbGF0ZS90b29sdGlwL3Rvb2x0aXAtdGVtcGxhdGUtcG9wdXAuaHRtbFwiLFwidWliL3RlbXBsYXRlL3BvcG92ZXIvcG9wb3Zlci1odG1sLmh0bWxcIixcInVpYi90ZW1wbGF0ZS9wb3BvdmVyL3BvcG92ZXItdGVtcGxhdGUuaHRtbFwiLFwidWliL3RlbXBsYXRlL3BvcG92ZXIvcG9wb3Zlci5odG1sXCIsXCJ1aWIvdGVtcGxhdGUvcHJvZ3Jlc3NiYXIvYmFyLmh0bWxcIixcInVpYi90ZW1wbGF0ZS9wcm9ncmVzc2Jhci9wcm9ncmVzcy5odG1sXCIsXCJ1aWIvdGVtcGxhdGUvcHJvZ3Jlc3NiYXIvcHJvZ3Jlc3NiYXIuaHRtbFwiLFwidWliL3RlbXBsYXRlL3JhdGluZy9yYXRpbmcuaHRtbFwiLFwidWliL3RlbXBsYXRlL3RhYnMvdGFiLmh0bWxcIixcInVpYi90ZW1wbGF0ZS90YWJzL3RhYnNldC5odG1sXCIsXCJ1aWIvdGVtcGxhdGUvdGltZXBpY2tlci90aW1lcGlja2VyLmh0bWxcIixcInVpYi90ZW1wbGF0ZS90eXBlYWhlYWQvdHlwZWFoZWFkLW1hdGNoLmh0bWxcIixcInVpYi90ZW1wbGF0ZS90eXBlYWhlYWQvdHlwZWFoZWFkLXBvcHVwLmh0bWxcIl0pO1xyXG5hbmd1bGFyLm1vZHVsZSgndWkuYm9vdHN0cmFwLmNvbGxhcHNlJywgW10pXHJcblxyXG4gIC5kaXJlY3RpdmUoJ3VpYkNvbGxhcHNlJywgWyckYW5pbWF0ZScsICckcScsICckcGFyc2UnLCAnJGluamVjdG9yJywgZnVuY3Rpb24oJGFuaW1hdGUsICRxLCAkcGFyc2UsICRpbmplY3Rvcikge1xyXG4gICAgdmFyICRhbmltYXRlQ3NzID0gJGluamVjdG9yLmhhcygnJGFuaW1hdGVDc3MnKSA/ICRpbmplY3Rvci5nZXQoJyRhbmltYXRlQ3NzJykgOiBudWxsO1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsZW1lbnQsIGF0dHJzKSB7XHJcbiAgICAgICAgdmFyIGV4cGFuZGluZ0V4cHIgPSAkcGFyc2UoYXR0cnMuZXhwYW5kaW5nKSxcclxuICAgICAgICAgIGV4cGFuZGVkRXhwciA9ICRwYXJzZShhdHRycy5leHBhbmRlZCksXHJcbiAgICAgICAgICBjb2xsYXBzaW5nRXhwciA9ICRwYXJzZShhdHRycy5jb2xsYXBzaW5nKSxcclxuICAgICAgICAgIGNvbGxhcHNlZEV4cHIgPSAkcGFyc2UoYXR0cnMuY29sbGFwc2VkKSxcclxuICAgICAgICAgIGhvcml6b250YWwgPSBmYWxzZSxcclxuICAgICAgICAgIGNzcyA9IHt9LFxyXG4gICAgICAgICAgY3NzVG8gPSB7fTtcclxuXHJcbiAgICAgICAgaW5pdCgpO1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBpbml0KCkge1xyXG4gICAgICAgICAgaG9yaXpvbnRhbCA9ICEhKCdob3Jpem9udGFsJyBpbiBhdHRycyk7XHJcbiAgICAgICAgICBpZiAoaG9yaXpvbnRhbCkge1xyXG4gICAgICAgICAgICBjc3MgPSB7XHJcbiAgICAgICAgICAgICAgd2lkdGg6ICcnXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIGNzc1RvID0ge3dpZHRoOiAnMCd9O1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY3NzID0ge1xyXG4gICAgICAgICAgICAgIGhlaWdodDogJydcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgY3NzVG8gPSB7aGVpZ2h0OiAnMCd9O1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgaWYgKCFzY29wZS4kZXZhbChhdHRycy51aWJDb2xsYXBzZSkpIHtcclxuICAgICAgICAgICAgZWxlbWVudC5hZGRDbGFzcygnaW4nKVxyXG4gICAgICAgICAgICAgIC5hZGRDbGFzcygnY29sbGFwc2UnKVxyXG4gICAgICAgICAgICAgIC5hdHRyKCdhcmlhLWV4cGFuZGVkJywgdHJ1ZSlcclxuICAgICAgICAgICAgICAuYXR0cignYXJpYS1oaWRkZW4nLCBmYWxzZSlcclxuICAgICAgICAgICAgICAuY3NzKGNzcyk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBnZXRTY3JvbGxGcm9tRWxlbWVudChlbGVtZW50KSB7XHJcbiAgICAgICAgICBpZiAoaG9yaXpvbnRhbCkge1xyXG4gICAgICAgICAgICByZXR1cm4ge3dpZHRoOiBlbGVtZW50LnNjcm9sbFdpZHRoICsgJ3B4J307XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICByZXR1cm4ge2hlaWdodDogZWxlbWVudC5zY3JvbGxIZWlnaHQgKyAncHgnfTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGV4cGFuZCgpIHtcclxuICAgICAgICAgIGlmIChlbGVtZW50Lmhhc0NsYXNzKCdjb2xsYXBzZScpICYmIGVsZW1lbnQuaGFzQ2xhc3MoJ2luJykpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICRxLnJlc29sdmUoZXhwYW5kaW5nRXhwcihzY29wZSkpXHJcbiAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgIGVsZW1lbnQucmVtb3ZlQ2xhc3MoJ2NvbGxhcHNlJylcclxuICAgICAgICAgICAgICAgIC5hZGRDbGFzcygnY29sbGFwc2luZycpXHJcbiAgICAgICAgICAgICAgICAuYXR0cignYXJpYS1leHBhbmRlZCcsIHRydWUpXHJcbiAgICAgICAgICAgICAgICAuYXR0cignYXJpYS1oaWRkZW4nLCBmYWxzZSk7XHJcblxyXG4gICAgICAgICAgICAgIGlmICgkYW5pbWF0ZUNzcykge1xyXG4gICAgICAgICAgICAgICAgJGFuaW1hdGVDc3MoZWxlbWVudCwge1xyXG4gICAgICAgICAgICAgICAgICBhZGRDbGFzczogJ2luJyxcclxuICAgICAgICAgICAgICAgICAgZWFzaW5nOiAnZWFzZScsXHJcbiAgICAgICAgICAgICAgICAgIGNzczoge1xyXG4gICAgICAgICAgICAgICAgICAgIG92ZXJmbG93OiAnaGlkZGVuJ1xyXG4gICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICB0bzogZ2V0U2Nyb2xsRnJvbUVsZW1lbnQoZWxlbWVudFswXSlcclxuICAgICAgICAgICAgICAgIH0pLnN0YXJ0KClbJ2ZpbmFsbHknXShleHBhbmREb25lKTtcclxuICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgJGFuaW1hdGUuYWRkQ2xhc3MoZWxlbWVudCwgJ2luJywge1xyXG4gICAgICAgICAgICAgICAgICBjc3M6IHtcclxuICAgICAgICAgICAgICAgICAgICBvdmVyZmxvdzogJ2hpZGRlbidcclxuICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgdG86IGdldFNjcm9sbEZyb21FbGVtZW50KGVsZW1lbnRbMF0pXHJcbiAgICAgICAgICAgICAgICB9KS50aGVuKGV4cGFuZERvbmUpO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBleHBhbmREb25lKCkge1xyXG4gICAgICAgICAgZWxlbWVudC5yZW1vdmVDbGFzcygnY29sbGFwc2luZycpXHJcbiAgICAgICAgICAgIC5hZGRDbGFzcygnY29sbGFwc2UnKVxyXG4gICAgICAgICAgICAuY3NzKGNzcyk7XHJcbiAgICAgICAgICBleHBhbmRlZEV4cHIoc2NvcGUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gY29sbGFwc2UoKSB7XHJcbiAgICAgICAgICBpZiAoIWVsZW1lbnQuaGFzQ2xhc3MoJ2NvbGxhcHNlJykgJiYgIWVsZW1lbnQuaGFzQ2xhc3MoJ2luJykpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGNvbGxhcHNlRG9uZSgpO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICRxLnJlc29sdmUoY29sbGFwc2luZ0V4cHIoc2NvcGUpKVxyXG4gICAgICAgICAgICAudGhlbihmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICBlbGVtZW50XHJcbiAgICAgICAgICAgICAgLy8gSU1QT1JUQU5UOiBUaGUgd2lkdGggbXVzdCBiZSBzZXQgYmVmb3JlIGFkZGluZyBcImNvbGxhcHNpbmdcIiBjbGFzcy5cclxuICAgICAgICAgICAgICAvLyBPdGhlcndpc2UsIHRoZSBicm93c2VyIGF0dGVtcHRzIHRvIGFuaW1hdGUgZnJvbSB3aWR0aCAwIChpblxyXG4gICAgICAgICAgICAgIC8vIGNvbGxhcHNpbmcgY2xhc3MpIHRvIHRoZSBnaXZlbiB3aWR0aCBoZXJlLlxyXG4gICAgICAgICAgICAgICAgLmNzcyhnZXRTY3JvbGxGcm9tRWxlbWVudChlbGVtZW50WzBdKSlcclxuICAgICAgICAgICAgICAgIC8vIGluaXRpYWxseSBhbGwgcGFuZWwgY29sbGFwc2UgaGF2ZSB0aGUgY29sbGFwc2UgY2xhc3MsIHRoaXMgcmVtb3ZhbFxyXG4gICAgICAgICAgICAgICAgLy8gcHJldmVudHMgdGhlIGFuaW1hdGlvbiBmcm9tIGp1bXBpbmcgdG8gY29sbGFwc2VkIHN0YXRlXHJcbiAgICAgICAgICAgICAgICAucmVtb3ZlQ2xhc3MoJ2NvbGxhcHNlJylcclxuICAgICAgICAgICAgICAgIC5hZGRDbGFzcygnY29sbGFwc2luZycpXHJcbiAgICAgICAgICAgICAgICAuYXR0cignYXJpYS1leHBhbmRlZCcsIGZhbHNlKVxyXG4gICAgICAgICAgICAgICAgLmF0dHIoJ2FyaWEtaGlkZGVuJywgdHJ1ZSk7XHJcblxyXG4gICAgICAgICAgICAgIGlmICgkYW5pbWF0ZUNzcykge1xyXG4gICAgICAgICAgICAgICAgJGFuaW1hdGVDc3MoZWxlbWVudCwge1xyXG4gICAgICAgICAgICAgICAgICByZW1vdmVDbGFzczogJ2luJyxcclxuICAgICAgICAgICAgICAgICAgdG86IGNzc1RvXHJcbiAgICAgICAgICAgICAgICB9KS5zdGFydCgpWydmaW5hbGx5J10oY29sbGFwc2VEb25lKTtcclxuICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgJGFuaW1hdGUucmVtb3ZlQ2xhc3MoZWxlbWVudCwgJ2luJywge1xyXG4gICAgICAgICAgICAgICAgICB0bzogY3NzVG9cclxuICAgICAgICAgICAgICAgIH0pLnRoZW4oY29sbGFwc2VEb25lKTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gY29sbGFwc2VEb25lKCkge1xyXG4gICAgICAgICAgZWxlbWVudC5jc3MoY3NzVG8pOyAvLyBSZXF1aXJlZCBzbyB0aGF0IGNvbGxhcHNlIHdvcmtzIHdoZW4gYW5pbWF0aW9uIGlzIGRpc2FibGVkXHJcbiAgICAgICAgICBlbGVtZW50LnJlbW92ZUNsYXNzKCdjb2xsYXBzaW5nJylcclxuICAgICAgICAgICAgLmFkZENsYXNzKCdjb2xsYXBzZScpO1xyXG4gICAgICAgICAgY29sbGFwc2VkRXhwcihzY29wZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBzY29wZS4kd2F0Y2goYXR0cnMudWliQ29sbGFwc2UsIGZ1bmN0aW9uKHNob3VsZENvbGxhcHNlKSB7XHJcbiAgICAgICAgICBpZiAoc2hvdWxkQ29sbGFwc2UpIHtcclxuICAgICAgICAgICAgY29sbGFwc2UoKTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGV4cGFuZCgpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG4gIH1dKTtcclxuXHJcbmFuZ3VsYXIubW9kdWxlKCd1aS5ib290c3RyYXAudGFiaW5kZXgnLCBbXSlcclxuXHJcbi5kaXJlY3RpdmUoJ3VpYlRhYmluZGV4VG9nZ2xlJywgZnVuY3Rpb24oKSB7XHJcbiAgcmV0dXJuIHtcclxuICAgIHJlc3RyaWN0OiAnQScsXHJcbiAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxlbSwgYXR0cnMpIHtcclxuICAgICAgYXR0cnMuJG9ic2VydmUoJ2Rpc2FibGVkJywgZnVuY3Rpb24oZGlzYWJsZWQpIHtcclxuICAgICAgICBhdHRycy4kc2V0KCd0YWJpbmRleCcsIGRpc2FibGVkID8gLTEgOiBudWxsKTtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfTtcclxufSk7XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgndWkuYm9vdHN0cmFwLmFjY29yZGlvbicsIFsndWkuYm9vdHN0cmFwLmNvbGxhcHNlJywgJ3VpLmJvb3RzdHJhcC50YWJpbmRleCddKVxyXG5cclxuLmNvbnN0YW50KCd1aWJBY2NvcmRpb25Db25maWcnLCB7XHJcbiAgY2xvc2VPdGhlcnM6IHRydWVcclxufSlcclxuXHJcbi5jb250cm9sbGVyKCdVaWJBY2NvcmRpb25Db250cm9sbGVyJywgWyckc2NvcGUnLCAnJGF0dHJzJywgJ3VpYkFjY29yZGlvbkNvbmZpZycsIGZ1bmN0aW9uKCRzY29wZSwgJGF0dHJzLCBhY2NvcmRpb25Db25maWcpIHtcclxuICAvLyBUaGlzIGFycmF5IGtlZXBzIHRyYWNrIG9mIHRoZSBhY2NvcmRpb24gZ3JvdXBzXHJcbiAgdGhpcy5ncm91cHMgPSBbXTtcclxuXHJcbiAgLy8gRW5zdXJlIHRoYXQgYWxsIHRoZSBncm91cHMgaW4gdGhpcyBhY2NvcmRpb24gYXJlIGNsb3NlZCwgdW5sZXNzIGNsb3NlLW90aGVycyBleHBsaWNpdGx5IHNheXMgbm90IHRvXHJcbiAgdGhpcy5jbG9zZU90aGVycyA9IGZ1bmN0aW9uKG9wZW5Hcm91cCkge1xyXG4gICAgdmFyIGNsb3NlT3RoZXJzID0gYW5ndWxhci5pc0RlZmluZWQoJGF0dHJzLmNsb3NlT3RoZXJzKSA/XHJcbiAgICAgICRzY29wZS4kZXZhbCgkYXR0cnMuY2xvc2VPdGhlcnMpIDogYWNjb3JkaW9uQ29uZmlnLmNsb3NlT3RoZXJzO1xyXG4gICAgaWYgKGNsb3NlT3RoZXJzKSB7XHJcbiAgICAgIGFuZ3VsYXIuZm9yRWFjaCh0aGlzLmdyb3VwcywgZnVuY3Rpb24oZ3JvdXApIHtcclxuICAgICAgICBpZiAoZ3JvdXAgIT09IG9wZW5Hcm91cCkge1xyXG4gICAgICAgICAgZ3JvdXAuaXNPcGVuID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICAvLyBUaGlzIGlzIGNhbGxlZCBmcm9tIHRoZSBhY2NvcmRpb24tZ3JvdXAgZGlyZWN0aXZlIHRvIGFkZCBpdHNlbGYgdG8gdGhlIGFjY29yZGlvblxyXG4gIHRoaXMuYWRkR3JvdXAgPSBmdW5jdGlvbihncm91cFNjb3BlKSB7XHJcbiAgICB2YXIgdGhhdCA9IHRoaXM7XHJcbiAgICB0aGlzLmdyb3Vwcy5wdXNoKGdyb3VwU2NvcGUpO1xyXG5cclxuICAgIGdyb3VwU2NvcGUuJG9uKCckZGVzdHJveScsIGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICAgIHRoYXQucmVtb3ZlR3JvdXAoZ3JvdXBTY29wZSk7XHJcbiAgICB9KTtcclxuICB9O1xyXG5cclxuICAvLyBUaGlzIGlzIGNhbGxlZCBmcm9tIHRoZSBhY2NvcmRpb24tZ3JvdXAgZGlyZWN0aXZlIHdoZW4gdG8gcmVtb3ZlIGl0c2VsZlxyXG4gIHRoaXMucmVtb3ZlR3JvdXAgPSBmdW5jdGlvbihncm91cCkge1xyXG4gICAgdmFyIGluZGV4ID0gdGhpcy5ncm91cHMuaW5kZXhPZihncm91cCk7XHJcbiAgICBpZiAoaW5kZXggIT09IC0xKSB7XHJcbiAgICAgIHRoaXMuZ3JvdXBzLnNwbGljZShpbmRleCwgMSk7XHJcbiAgICB9XHJcbiAgfTtcclxufV0pXHJcblxyXG4vLyBUaGUgYWNjb3JkaW9uIGRpcmVjdGl2ZSBzaW1wbHkgc2V0cyB1cCB0aGUgZGlyZWN0aXZlIGNvbnRyb2xsZXJcclxuLy8gYW5kIGFkZHMgYW4gYWNjb3JkaW9uIENTUyBjbGFzcyB0byBpdHNlbGYgZWxlbWVudC5cclxuLmRpcmVjdGl2ZSgndWliQWNjb3JkaW9uJywgZnVuY3Rpb24oKSB7XHJcbiAgcmV0dXJuIHtcclxuICAgIGNvbnRyb2xsZXI6ICdVaWJBY2NvcmRpb25Db250cm9sbGVyJyxcclxuICAgIGNvbnRyb2xsZXJBczogJ2FjY29yZGlvbicsXHJcbiAgICB0cmFuc2NsdWRlOiB0cnVlLFxyXG4gICAgdGVtcGxhdGVVcmw6IGZ1bmN0aW9uKGVsZW1lbnQsIGF0dHJzKSB7XHJcbiAgICAgIHJldHVybiBhdHRycy50ZW1wbGF0ZVVybCB8fCAndWliL3RlbXBsYXRlL2FjY29yZGlvbi9hY2NvcmRpb24uaHRtbCc7XHJcbiAgICB9XHJcbiAgfTtcclxufSlcclxuXHJcbi8vIFRoZSBhY2NvcmRpb24tZ3JvdXAgZGlyZWN0aXZlIGluZGljYXRlcyBhIGJsb2NrIG9mIGh0bWwgdGhhdCB3aWxsIGV4cGFuZCBhbmQgY29sbGFwc2UgaW4gYW4gYWNjb3JkaW9uXHJcbi5kaXJlY3RpdmUoJ3VpYkFjY29yZGlvbkdyb3VwJywgZnVuY3Rpb24oKSB7XHJcbiAgcmV0dXJuIHtcclxuICAgIHJlcXVpcmU6ICdedWliQWNjb3JkaW9uJywgICAgICAgICAvLyBXZSBuZWVkIHRoaXMgZGlyZWN0aXZlIHRvIGJlIGluc2lkZSBhbiBhY2NvcmRpb25cclxuICAgIHRyYW5zY2x1ZGU6IHRydWUsICAgICAgICAgICAgICAvLyBJdCB0cmFuc2NsdWRlcyB0aGUgY29udGVudHMgb2YgdGhlIGRpcmVjdGl2ZSBpbnRvIHRoZSB0ZW1wbGF0ZVxyXG4gICAgcmVzdHJpY3Q6ICdBJyxcclxuICAgIHRlbXBsYXRlVXJsOiBmdW5jdGlvbihlbGVtZW50LCBhdHRycykge1xyXG4gICAgICByZXR1cm4gYXR0cnMudGVtcGxhdGVVcmwgfHwgJ3VpYi90ZW1wbGF0ZS9hY2NvcmRpb24vYWNjb3JkaW9uLWdyb3VwLmh0bWwnO1xyXG4gICAgfSxcclxuICAgIHNjb3BlOiB7XHJcbiAgICAgIGhlYWRpbmc6ICdAJywgICAgICAgICAgICAgICAvLyBJbnRlcnBvbGF0ZSB0aGUgaGVhZGluZyBhdHRyaWJ1dGUgb250byB0aGlzIHNjb3BlXHJcbiAgICAgIHBhbmVsQ2xhc3M6ICdAPycsICAgICAgICAgICAvLyBEaXR0byB3aXRoIHBhbmVsQ2xhc3NcclxuICAgICAgaXNPcGVuOiAnPT8nLFxyXG4gICAgICBpc0Rpc2FibGVkOiAnPT8nXHJcbiAgICB9LFxyXG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24oKSB7XHJcbiAgICAgIHRoaXMuc2V0SGVhZGluZyA9IGZ1bmN0aW9uKGVsZW1lbnQpIHtcclxuICAgICAgICB0aGlzLmhlYWRpbmcgPSBlbGVtZW50O1xyXG4gICAgICB9O1xyXG4gICAgfSxcclxuICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBlbGVtZW50LCBhdHRycywgYWNjb3JkaW9uQ3RybCkge1xyXG4gICAgICBlbGVtZW50LmFkZENsYXNzKCdwYW5lbCcpO1xyXG4gICAgICBhY2NvcmRpb25DdHJsLmFkZEdyb3VwKHNjb3BlKTtcclxuXHJcbiAgICAgIHNjb3BlLm9wZW5DbGFzcyA9IGF0dHJzLm9wZW5DbGFzcyB8fCAncGFuZWwtb3Blbic7XHJcbiAgICAgIHNjb3BlLnBhbmVsQ2xhc3MgPSBhdHRycy5wYW5lbENsYXNzIHx8ICdwYW5lbC1kZWZhdWx0JztcclxuICAgICAgc2NvcGUuJHdhdGNoKCdpc09wZW4nLCBmdW5jdGlvbih2YWx1ZSkge1xyXG4gICAgICAgIGVsZW1lbnQudG9nZ2xlQ2xhc3Moc2NvcGUub3BlbkNsYXNzLCAhIXZhbHVlKTtcclxuICAgICAgICBpZiAodmFsdWUpIHtcclxuICAgICAgICAgIGFjY29yZGlvbkN0cmwuY2xvc2VPdGhlcnMoc2NvcGUpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcblxyXG4gICAgICBzY29wZS50b2dnbGVPcGVuID0gZnVuY3Rpb24oJGV2ZW50KSB7XHJcbiAgICAgICAgaWYgKCFzY29wZS5pc0Rpc2FibGVkKSB7XHJcbiAgICAgICAgICBpZiAoISRldmVudCB8fCAkZXZlbnQud2hpY2ggPT09IDMyKSB7XHJcbiAgICAgICAgICAgIHNjb3BlLmlzT3BlbiA9ICFzY29wZS5pc09wZW47XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9O1xyXG5cclxuICAgICAgdmFyIGlkID0gJ2FjY29yZGlvbmdyb3VwLScgKyBzY29wZS4kaWQgKyAnLScgKyBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAxMDAwMCk7XHJcbiAgICAgIHNjb3BlLmhlYWRpbmdJZCA9IGlkICsgJy10YWInO1xyXG4gICAgICBzY29wZS5wYW5lbElkID0gaWQgKyAnLXBhbmVsJztcclxuICAgIH1cclxuICB9O1xyXG59KVxyXG5cclxuLy8gVXNlIGFjY29yZGlvbi1oZWFkaW5nIGJlbG93IGFuIGFjY29yZGlvbi1ncm91cCB0byBwcm92aWRlIGEgaGVhZGluZyBjb250YWluaW5nIEhUTUxcclxuLmRpcmVjdGl2ZSgndWliQWNjb3JkaW9uSGVhZGluZycsIGZ1bmN0aW9uKCkge1xyXG4gIHJldHVybiB7XHJcbiAgICB0cmFuc2NsdWRlOiB0cnVlLCAgIC8vIEdyYWIgdGhlIGNvbnRlbnRzIHRvIGJlIHVzZWQgYXMgdGhlIGhlYWRpbmdcclxuICAgIHRlbXBsYXRlOiAnJywgICAgICAgLy8gSW4gZWZmZWN0IHJlbW92ZSB0aGlzIGVsZW1lbnQhXHJcbiAgICByZXBsYWNlOiB0cnVlLFxyXG4gICAgcmVxdWlyZTogJ151aWJBY2NvcmRpb25Hcm91cCcsXHJcbiAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxlbWVudCwgYXR0cnMsIGFjY29yZGlvbkdyb3VwQ3RybCwgdHJhbnNjbHVkZSkge1xyXG4gICAgICAvLyBQYXNzIHRoZSBoZWFkaW5nIHRvIHRoZSBhY2NvcmRpb24tZ3JvdXAgY29udHJvbGxlclxyXG4gICAgICAvLyBzbyB0aGF0IGl0IGNhbiBiZSB0cmFuc2NsdWRlZCBpbnRvIHRoZSByaWdodCBwbGFjZSBpbiB0aGUgdGVtcGxhdGVcclxuICAgICAgLy8gW1RoZSBzZWNvbmQgcGFyYW1ldGVyIHRvIHRyYW5zY2x1ZGUgY2F1c2VzIHRoZSBlbGVtZW50cyB0byBiZSBjbG9uZWQgc28gdGhhdCB0aGV5IHdvcmsgaW4gbmctcmVwZWF0XVxyXG4gICAgICBhY2NvcmRpb25Hcm91cEN0cmwuc2V0SGVhZGluZyh0cmFuc2NsdWRlKHNjb3BlLCBhbmd1bGFyLm5vb3ApKTtcclxuICAgIH1cclxuICB9O1xyXG59KVxyXG5cclxuLy8gVXNlIGluIHRoZSBhY2NvcmRpb24tZ3JvdXAgdGVtcGxhdGUgdG8gaW5kaWNhdGUgd2hlcmUgeW91IHdhbnQgdGhlIGhlYWRpbmcgdG8gYmUgdHJhbnNjbHVkZWRcclxuLy8gWW91IG11c3QgcHJvdmlkZSB0aGUgcHJvcGVydHkgb24gdGhlIGFjY29yZGlvbi1ncm91cCBjb250cm9sbGVyIHRoYXQgd2lsbCBob2xkIHRoZSB0cmFuc2NsdWRlZCBlbGVtZW50XHJcbi5kaXJlY3RpdmUoJ3VpYkFjY29yZGlvblRyYW5zY2x1ZGUnLCBmdW5jdGlvbigpIHtcclxuICByZXR1cm4ge1xyXG4gICAgcmVxdWlyZTogJ151aWJBY2NvcmRpb25Hcm91cCcsXHJcbiAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxlbWVudCwgYXR0cnMsIGNvbnRyb2xsZXIpIHtcclxuICAgICAgc2NvcGUuJHdhdGNoKGZ1bmN0aW9uKCkgeyByZXR1cm4gY29udHJvbGxlclthdHRycy51aWJBY2NvcmRpb25UcmFuc2NsdWRlXTsgfSwgZnVuY3Rpb24oaGVhZGluZykge1xyXG4gICAgICAgIGlmIChoZWFkaW5nKSB7XHJcbiAgICAgICAgICB2YXIgZWxlbSA9IGFuZ3VsYXIuZWxlbWVudChlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3IoZ2V0SGVhZGVyU2VsZWN0b3JzKCkpKTtcclxuICAgICAgICAgIGVsZW0uaHRtbCgnJyk7XHJcbiAgICAgICAgICBlbGVtLmFwcGVuZChoZWFkaW5nKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIGZ1bmN0aW9uIGdldEhlYWRlclNlbGVjdG9ycygpIHtcclxuICAgICAgcmV0dXJuICd1aWItYWNjb3JkaW9uLWhlYWRlciwnICtcclxuICAgICAgICAgICdkYXRhLXVpYi1hY2NvcmRpb24taGVhZGVyLCcgK1xyXG4gICAgICAgICAgJ3gtdWliLWFjY29yZGlvbi1oZWFkZXIsJyArXHJcbiAgICAgICAgICAndWliXFxcXDphY2NvcmRpb24taGVhZGVyLCcgK1xyXG4gICAgICAgICAgJ1t1aWItYWNjb3JkaW9uLWhlYWRlcl0sJyArXHJcbiAgICAgICAgICAnW2RhdGEtdWliLWFjY29yZGlvbi1oZWFkZXJdLCcgK1xyXG4gICAgICAgICAgJ1t4LXVpYi1hY2NvcmRpb24taGVhZGVyXSc7XHJcbiAgfVxyXG59KTtcclxuXHJcbmFuZ3VsYXIubW9kdWxlKCd1aS5ib290c3RyYXAuYWxlcnQnLCBbXSlcclxuXHJcbi5jb250cm9sbGVyKCdVaWJBbGVydENvbnRyb2xsZXInLCBbJyRzY29wZScsICckZWxlbWVudCcsICckYXR0cnMnLCAnJGludGVycG9sYXRlJywgJyR0aW1lb3V0JywgZnVuY3Rpb24oJHNjb3BlLCAkZWxlbWVudCwgJGF0dHJzLCAkaW50ZXJwb2xhdGUsICR0aW1lb3V0KSB7XHJcbiAgJHNjb3BlLmNsb3NlYWJsZSA9ICEhJGF0dHJzLmNsb3NlO1xyXG4gICRlbGVtZW50LmFkZENsYXNzKCdhbGVydCcpO1xyXG4gICRhdHRycy4kc2V0KCdyb2xlJywgJ2FsZXJ0Jyk7XHJcbiAgaWYgKCRzY29wZS5jbG9zZWFibGUpIHtcclxuICAgICRlbGVtZW50LmFkZENsYXNzKCdhbGVydC1kaXNtaXNzaWJsZScpO1xyXG4gIH1cclxuXHJcbiAgdmFyIGRpc21pc3NPblRpbWVvdXQgPSBhbmd1bGFyLmlzRGVmaW5lZCgkYXR0cnMuZGlzbWlzc09uVGltZW91dCkgP1xyXG4gICAgJGludGVycG9sYXRlKCRhdHRycy5kaXNtaXNzT25UaW1lb3V0KSgkc2NvcGUuJHBhcmVudCkgOiBudWxsO1xyXG5cclxuICBpZiAoZGlzbWlzc09uVGltZW91dCkge1xyXG4gICAgJHRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICRzY29wZS5jbG9zZSgpO1xyXG4gICAgfSwgcGFyc2VJbnQoZGlzbWlzc09uVGltZW91dCwgMTApKTtcclxuICB9XHJcbn1dKVxyXG5cclxuLmRpcmVjdGl2ZSgndWliQWxlcnQnLCBmdW5jdGlvbigpIHtcclxuICByZXR1cm4ge1xyXG4gICAgY29udHJvbGxlcjogJ1VpYkFsZXJ0Q29udHJvbGxlcicsXHJcbiAgICBjb250cm9sbGVyQXM6ICdhbGVydCcsXHJcbiAgICByZXN0cmljdDogJ0EnLFxyXG4gICAgdGVtcGxhdGVVcmw6IGZ1bmN0aW9uKGVsZW1lbnQsIGF0dHJzKSB7XHJcbiAgICAgIHJldHVybiBhdHRycy50ZW1wbGF0ZVVybCB8fCAndWliL3RlbXBsYXRlL2FsZXJ0L2FsZXJ0Lmh0bWwnO1xyXG4gICAgfSxcclxuICAgIHRyYW5zY2x1ZGU6IHRydWUsXHJcbiAgICBzY29wZToge1xyXG4gICAgICBjbG9zZTogJyYnXHJcbiAgICB9XHJcbiAgfTtcclxufSk7XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgndWkuYm9vdHN0cmFwLmJ1dHRvbnMnLCBbXSlcclxuXHJcbi5jb25zdGFudCgndWliQnV0dG9uQ29uZmlnJywge1xyXG4gIGFjdGl2ZUNsYXNzOiAnYWN0aXZlJyxcclxuICB0b2dnbGVFdmVudDogJ2NsaWNrJ1xyXG59KVxyXG5cclxuLmNvbnRyb2xsZXIoJ1VpYkJ1dHRvbnNDb250cm9sbGVyJywgWyd1aWJCdXR0b25Db25maWcnLCBmdW5jdGlvbihidXR0b25Db25maWcpIHtcclxuICB0aGlzLmFjdGl2ZUNsYXNzID0gYnV0dG9uQ29uZmlnLmFjdGl2ZUNsYXNzIHx8ICdhY3RpdmUnO1xyXG4gIHRoaXMudG9nZ2xlRXZlbnQgPSBidXR0b25Db25maWcudG9nZ2xlRXZlbnQgfHwgJ2NsaWNrJztcclxufV0pXHJcblxyXG4uZGlyZWN0aXZlKCd1aWJCdG5SYWRpbycsIFsnJHBhcnNlJywgZnVuY3Rpb24oJHBhcnNlKSB7XHJcbiAgcmV0dXJuIHtcclxuICAgIHJlcXVpcmU6IFsndWliQnRuUmFkaW8nLCAnbmdNb2RlbCddLFxyXG4gICAgY29udHJvbGxlcjogJ1VpYkJ1dHRvbnNDb250cm9sbGVyJyxcclxuICAgIGNvbnRyb2xsZXJBczogJ2J1dHRvbnMnLFxyXG4gICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCBjdHJscykge1xyXG4gICAgICB2YXIgYnV0dG9uc0N0cmwgPSBjdHJsc1swXSwgbmdNb2RlbEN0cmwgPSBjdHJsc1sxXTtcclxuICAgICAgdmFyIHVuY2hlY2thYmxlRXhwciA9ICRwYXJzZShhdHRycy51aWJVbmNoZWNrYWJsZSk7XHJcblxyXG4gICAgICBlbGVtZW50LmZpbmQoJ2lucHV0JykuY3NzKHtkaXNwbGF5OiAnbm9uZSd9KTtcclxuXHJcbiAgICAgIC8vbW9kZWwgLT4gVUlcclxuICAgICAgbmdNb2RlbEN0cmwuJHJlbmRlciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGVsZW1lbnQudG9nZ2xlQ2xhc3MoYnV0dG9uc0N0cmwuYWN0aXZlQ2xhc3MsIGFuZ3VsYXIuZXF1YWxzKG5nTW9kZWxDdHJsLiRtb2RlbFZhbHVlLCBzY29wZS4kZXZhbChhdHRycy51aWJCdG5SYWRpbykpKTtcclxuICAgICAgfTtcclxuXHJcbiAgICAgIC8vdWktPm1vZGVsXHJcbiAgICAgIGVsZW1lbnQub24oYnV0dG9uc0N0cmwudG9nZ2xlRXZlbnQsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGlmIChhdHRycy5kaXNhYmxlZCkge1xyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdmFyIGlzQWN0aXZlID0gZWxlbWVudC5oYXNDbGFzcyhidXR0b25zQ3RybC5hY3RpdmVDbGFzcyk7XHJcblxyXG4gICAgICAgIGlmICghaXNBY3RpdmUgfHwgYW5ndWxhci5pc0RlZmluZWQoYXR0cnMudW5jaGVja2FibGUpKSB7XHJcbiAgICAgICAgICBzY29wZS4kYXBwbHkoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIG5nTW9kZWxDdHJsLiRzZXRWaWV3VmFsdWUoaXNBY3RpdmUgPyBudWxsIDogc2NvcGUuJGV2YWwoYXR0cnMudWliQnRuUmFkaW8pKTtcclxuICAgICAgICAgICAgbmdNb2RlbEN0cmwuJHJlbmRlcigpO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIGlmIChhdHRycy51aWJVbmNoZWNrYWJsZSkge1xyXG4gICAgICAgIHNjb3BlLiR3YXRjaCh1bmNoZWNrYWJsZUV4cHIsIGZ1bmN0aW9uKHVuY2hlY2thYmxlKSB7XHJcbiAgICAgICAgICBhdHRycy4kc2V0KCd1bmNoZWNrYWJsZScsIHVuY2hlY2thYmxlID8gJycgOiB1bmRlZmluZWQpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfTtcclxufV0pXHJcblxyXG4uZGlyZWN0aXZlKCd1aWJCdG5DaGVja2JveCcsIGZ1bmN0aW9uKCkge1xyXG4gIHJldHVybiB7XHJcbiAgICByZXF1aXJlOiBbJ3VpYkJ0bkNoZWNrYm94JywgJ25nTW9kZWwnXSxcclxuICAgIGNvbnRyb2xsZXI6ICdVaWJCdXR0b25zQ29udHJvbGxlcicsXHJcbiAgICBjb250cm9sbGVyQXM6ICdidXR0b24nLFxyXG4gICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCBjdHJscykge1xyXG4gICAgICB2YXIgYnV0dG9uc0N0cmwgPSBjdHJsc1swXSwgbmdNb2RlbEN0cmwgPSBjdHJsc1sxXTtcclxuXHJcbiAgICAgIGVsZW1lbnQuZmluZCgnaW5wdXQnKS5jc3Moe2Rpc3BsYXk6ICdub25lJ30pO1xyXG5cclxuICAgICAgZnVuY3Rpb24gZ2V0VHJ1ZVZhbHVlKCkge1xyXG4gICAgICAgIHJldHVybiBnZXRDaGVja2JveFZhbHVlKGF0dHJzLmJ0bkNoZWNrYm94VHJ1ZSwgdHJ1ZSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGZ1bmN0aW9uIGdldEZhbHNlVmFsdWUoKSB7XHJcbiAgICAgICAgcmV0dXJuIGdldENoZWNrYm94VmFsdWUoYXR0cnMuYnRuQ2hlY2tib3hGYWxzZSwgZmFsc2UpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBmdW5jdGlvbiBnZXRDaGVja2JveFZhbHVlKGF0dHJpYnV0ZSwgZGVmYXVsdFZhbHVlKSB7XHJcbiAgICAgICAgcmV0dXJuIGFuZ3VsYXIuaXNEZWZpbmVkKGF0dHJpYnV0ZSkgPyBzY29wZS4kZXZhbChhdHRyaWJ1dGUpIDogZGVmYXVsdFZhbHVlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvL21vZGVsIC0+IFVJXHJcbiAgICAgIG5nTW9kZWxDdHJsLiRyZW5kZXIgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICBlbGVtZW50LnRvZ2dsZUNsYXNzKGJ1dHRvbnNDdHJsLmFjdGl2ZUNsYXNzLCBhbmd1bGFyLmVxdWFscyhuZ01vZGVsQ3RybC4kbW9kZWxWYWx1ZSwgZ2V0VHJ1ZVZhbHVlKCkpKTtcclxuICAgICAgfTtcclxuXHJcbiAgICAgIC8vdWktPm1vZGVsXHJcbiAgICAgIGVsZW1lbnQub24oYnV0dG9uc0N0cmwudG9nZ2xlRXZlbnQsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGlmIChhdHRycy5kaXNhYmxlZCkge1xyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgc2NvcGUuJGFwcGx5KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgbmdNb2RlbEN0cmwuJHNldFZpZXdWYWx1ZShlbGVtZW50Lmhhc0NsYXNzKGJ1dHRvbnNDdHJsLmFjdGl2ZUNsYXNzKSA/IGdldEZhbHNlVmFsdWUoKSA6IGdldFRydWVWYWx1ZSgpKTtcclxuICAgICAgICAgIG5nTW9kZWxDdHJsLiRyZW5kZXIoKTtcclxuICAgICAgICB9KTtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfTtcclxufSk7XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgndWkuYm9vdHN0cmFwLmNhcm91c2VsJywgW10pXHJcblxyXG4uY29udHJvbGxlcignVWliQ2Fyb3VzZWxDb250cm9sbGVyJywgWyckc2NvcGUnLCAnJGVsZW1lbnQnLCAnJGludGVydmFsJywgJyR0aW1lb3V0JywgJyRhbmltYXRlJywgZnVuY3Rpb24oJHNjb3BlLCAkZWxlbWVudCwgJGludGVydmFsLCAkdGltZW91dCwgJGFuaW1hdGUpIHtcclxuICB2YXIgc2VsZiA9IHRoaXMsXHJcbiAgICBzbGlkZXMgPSBzZWxmLnNsaWRlcyA9ICRzY29wZS5zbGlkZXMgPSBbXSxcclxuICAgIFNMSURFX0RJUkVDVElPTiA9ICd1aWItc2xpZGVEaXJlY3Rpb24nLFxyXG4gICAgY3VycmVudEluZGV4ID0gJHNjb3BlLmFjdGl2ZSxcclxuICAgIGN1cnJlbnRJbnRlcnZhbCwgaXNQbGF5aW5nLCBidWZmZXJlZFRyYW5zaXRpb25zID0gW107XHJcblxyXG4gIHZhciBkZXN0cm95ZWQgPSBmYWxzZTtcclxuICAkZWxlbWVudC5hZGRDbGFzcygnY2Fyb3VzZWwnKTtcclxuXHJcbiAgc2VsZi5hZGRTbGlkZSA9IGZ1bmN0aW9uKHNsaWRlLCBlbGVtZW50KSB7XHJcbiAgICBzbGlkZXMucHVzaCh7XHJcbiAgICAgIHNsaWRlOiBzbGlkZSxcclxuICAgICAgZWxlbWVudDogZWxlbWVudFxyXG4gICAgfSk7XHJcbiAgICBzbGlkZXMuc29ydChmdW5jdGlvbihhLCBiKSB7XHJcbiAgICAgIHJldHVybiArYS5zbGlkZS5pbmRleCAtICtiLnNsaWRlLmluZGV4O1xyXG4gICAgfSk7XHJcbiAgICAvL2lmIHRoaXMgaXMgdGhlIGZpcnN0IHNsaWRlIG9yIHRoZSBzbGlkZSBpcyBzZXQgdG8gYWN0aXZlLCBzZWxlY3QgaXRcclxuICAgIGlmIChzbGlkZS5pbmRleCA9PT0gJHNjb3BlLmFjdGl2ZSB8fCBzbGlkZXMubGVuZ3RoID09PSAxICYmICFhbmd1bGFyLmlzTnVtYmVyKCRzY29wZS5hY3RpdmUpKSB7XHJcbiAgICAgIGlmICgkc2NvcGUuJGN1cnJlbnRUcmFuc2l0aW9uKSB7XHJcbiAgICAgICAgJHNjb3BlLiRjdXJyZW50VHJhbnNpdGlvbiA9IG51bGw7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGN1cnJlbnRJbmRleCA9IHNsaWRlLmluZGV4O1xyXG4gICAgICAkc2NvcGUuYWN0aXZlID0gc2xpZGUuaW5kZXg7XHJcbiAgICAgIHNldEFjdGl2ZShjdXJyZW50SW5kZXgpO1xyXG4gICAgICBzZWxmLnNlbGVjdChzbGlkZXNbZmluZFNsaWRlSW5kZXgoc2xpZGUpXSk7XHJcbiAgICAgIGlmIChzbGlkZXMubGVuZ3RoID09PSAxKSB7XHJcbiAgICAgICAgJHNjb3BlLnBsYXkoKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIHNlbGYuZ2V0Q3VycmVudEluZGV4ID0gZnVuY3Rpb24oKSB7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNsaWRlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICBpZiAoc2xpZGVzW2ldLnNsaWRlLmluZGV4ID09PSBjdXJyZW50SW5kZXgpIHtcclxuICAgICAgICByZXR1cm4gaTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIHNlbGYubmV4dCA9ICRzY29wZS5uZXh0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgbmV3SW5kZXggPSAoc2VsZi5nZXRDdXJyZW50SW5kZXgoKSArIDEpICUgc2xpZGVzLmxlbmd0aDtcclxuXHJcbiAgICBpZiAobmV3SW5kZXggPT09IDAgJiYgJHNjb3BlLm5vV3JhcCgpKSB7XHJcbiAgICAgICRzY29wZS5wYXVzZSgpO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHNlbGYuc2VsZWN0KHNsaWRlc1tuZXdJbmRleF0sICduZXh0Jyk7XHJcbiAgfTtcclxuXHJcbiAgc2VsZi5wcmV2ID0gJHNjb3BlLnByZXYgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBuZXdJbmRleCA9IHNlbGYuZ2V0Q3VycmVudEluZGV4KCkgLSAxIDwgMCA/IHNsaWRlcy5sZW5ndGggLSAxIDogc2VsZi5nZXRDdXJyZW50SW5kZXgoKSAtIDE7XHJcblxyXG4gICAgaWYgKCRzY29wZS5ub1dyYXAoKSAmJiBuZXdJbmRleCA9PT0gc2xpZGVzLmxlbmd0aCAtIDEpIHtcclxuICAgICAgJHNjb3BlLnBhdXNlKCk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gc2VsZi5zZWxlY3Qoc2xpZGVzW25ld0luZGV4XSwgJ3ByZXYnKTtcclxuICB9O1xyXG5cclxuICBzZWxmLnJlbW92ZVNsaWRlID0gZnVuY3Rpb24oc2xpZGUpIHtcclxuICAgIHZhciBpbmRleCA9IGZpbmRTbGlkZUluZGV4KHNsaWRlKTtcclxuXHJcbiAgICB2YXIgYnVmZmVyZWRJbmRleCA9IGJ1ZmZlcmVkVHJhbnNpdGlvbnMuaW5kZXhPZihzbGlkZXNbaW5kZXhdKTtcclxuICAgIGlmIChidWZmZXJlZEluZGV4ICE9PSAtMSkge1xyXG4gICAgICBidWZmZXJlZFRyYW5zaXRpb25zLnNwbGljZShidWZmZXJlZEluZGV4LCAxKTtcclxuICAgIH1cclxuXHJcbiAgICAvL2dldCB0aGUgaW5kZXggb2YgdGhlIHNsaWRlIGluc2lkZSB0aGUgY2Fyb3VzZWxcclxuICAgIHNsaWRlcy5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgaWYgKHNsaWRlcy5sZW5ndGggPiAwICYmIGN1cnJlbnRJbmRleCA9PT0gaW5kZXgpIHtcclxuICAgICAgaWYgKGluZGV4ID49IHNsaWRlcy5sZW5ndGgpIHtcclxuICAgICAgICBjdXJyZW50SW5kZXggPSBzbGlkZXMubGVuZ3RoIC0gMTtcclxuICAgICAgICAkc2NvcGUuYWN0aXZlID0gY3VycmVudEluZGV4O1xyXG4gICAgICAgIHNldEFjdGl2ZShjdXJyZW50SW5kZXgpO1xyXG4gICAgICAgIHNlbGYuc2VsZWN0KHNsaWRlc1tzbGlkZXMubGVuZ3RoIC0gMV0pO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGN1cnJlbnRJbmRleCA9IGluZGV4O1xyXG4gICAgICAgICRzY29wZS5hY3RpdmUgPSBjdXJyZW50SW5kZXg7XHJcbiAgICAgICAgc2V0QWN0aXZlKGN1cnJlbnRJbmRleCk7XHJcbiAgICAgICAgc2VsZi5zZWxlY3Qoc2xpZGVzW2luZGV4XSk7XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSBpZiAoY3VycmVudEluZGV4ID4gaW5kZXgpIHtcclxuICAgICAgY3VycmVudEluZGV4LS07XHJcbiAgICAgICRzY29wZS5hY3RpdmUgPSBjdXJyZW50SW5kZXg7XHJcbiAgICB9XHJcblxyXG4gICAgLy9jbGVhbiB0aGUgYWN0aXZlIHZhbHVlIHdoZW4gbm8gbW9yZSBzbGlkZVxyXG4gICAgaWYgKHNsaWRlcy5sZW5ndGggPT09IDApIHtcclxuICAgICAgY3VycmVudEluZGV4ID0gbnVsbDtcclxuICAgICAgJHNjb3BlLmFjdGl2ZSA9IG51bGw7XHJcbiAgICAgIGNsZWFyQnVmZmVyZWRUcmFuc2l0aW9ucygpO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIC8qIGRpcmVjdGlvbjogXCJwcmV2XCIgb3IgXCJuZXh0XCIgKi9cclxuICBzZWxmLnNlbGVjdCA9ICRzY29wZS5zZWxlY3QgPSBmdW5jdGlvbihuZXh0U2xpZGUsIGRpcmVjdGlvbikge1xyXG4gICAgdmFyIG5leHRJbmRleCA9IGZpbmRTbGlkZUluZGV4KG5leHRTbGlkZS5zbGlkZSk7XHJcbiAgICAvL0RlY2lkZSBkaXJlY3Rpb24gaWYgaXQncyBub3QgZ2l2ZW5cclxuICAgIGlmIChkaXJlY3Rpb24gPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICBkaXJlY3Rpb24gPSBuZXh0SW5kZXggPiBzZWxmLmdldEN1cnJlbnRJbmRleCgpID8gJ25leHQnIDogJ3ByZXYnO1xyXG4gICAgfVxyXG4gICAgLy9QcmV2ZW50IHRoaXMgdXNlci10cmlnZ2VyZWQgdHJhbnNpdGlvbiBmcm9tIG9jY3VycmluZyBpZiB0aGVyZSBpcyBhbHJlYWR5IG9uZSBpbiBwcm9ncmVzc1xyXG4gICAgaWYgKG5leHRTbGlkZS5zbGlkZS5pbmRleCAhPT0gY3VycmVudEluZGV4ICYmXHJcbiAgICAgICEkc2NvcGUuJGN1cnJlbnRUcmFuc2l0aW9uKSB7XHJcbiAgICAgIGdvTmV4dChuZXh0U2xpZGUuc2xpZGUsIG5leHRJbmRleCwgZGlyZWN0aW9uKTtcclxuICAgIH0gZWxzZSBpZiAobmV4dFNsaWRlICYmIG5leHRTbGlkZS5zbGlkZS5pbmRleCAhPT0gY3VycmVudEluZGV4ICYmICRzY29wZS4kY3VycmVudFRyYW5zaXRpb24pIHtcclxuICAgICAgYnVmZmVyZWRUcmFuc2l0aW9ucy5wdXNoKHNsaWRlc1tuZXh0SW5kZXhdKTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICAvKiBBbGxvdyBvdXRzaWRlIHBlb3BsZSB0byBjYWxsIGluZGV4T2Ygb24gc2xpZGVzIGFycmF5ICovXHJcbiAgJHNjb3BlLmluZGV4T2ZTbGlkZSA9IGZ1bmN0aW9uKHNsaWRlKSB7XHJcbiAgICByZXR1cm4gK3NsaWRlLnNsaWRlLmluZGV4O1xyXG4gIH07XHJcblxyXG4gICRzY29wZS5pc0FjdGl2ZSA9IGZ1bmN0aW9uKHNsaWRlKSB7XHJcbiAgICByZXR1cm4gJHNjb3BlLmFjdGl2ZSA9PT0gc2xpZGUuc2xpZGUuaW5kZXg7XHJcbiAgfTtcclxuXHJcbiAgJHNjb3BlLmlzUHJldkRpc2FibGVkID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gJHNjb3BlLmFjdGl2ZSA9PT0gMCAmJiAkc2NvcGUubm9XcmFwKCk7XHJcbiAgfTtcclxuXHJcbiAgJHNjb3BlLmlzTmV4dERpc2FibGVkID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gJHNjb3BlLmFjdGl2ZSA9PT0gc2xpZGVzLmxlbmd0aCAtIDEgJiYgJHNjb3BlLm5vV3JhcCgpO1xyXG4gIH07XHJcblxyXG4gICRzY29wZS5wYXVzZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgaWYgKCEkc2NvcGUubm9QYXVzZSkge1xyXG4gICAgICBpc1BsYXlpbmcgPSBmYWxzZTtcclxuICAgICAgcmVzZXRUaW1lcigpO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gICRzY29wZS5wbGF5ID0gZnVuY3Rpb24oKSB7XHJcbiAgICBpZiAoIWlzUGxheWluZykge1xyXG4gICAgICBpc1BsYXlpbmcgPSB0cnVlO1xyXG4gICAgICByZXN0YXJ0VGltZXIoKTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICAkZWxlbWVudC5vbignbW91c2VlbnRlcicsICRzY29wZS5wYXVzZSk7XHJcbiAgJGVsZW1lbnQub24oJ21vdXNlbGVhdmUnLCAkc2NvcGUucGxheSk7XHJcblxyXG4gICRzY29wZS4kb24oJyRkZXN0cm95JywgZnVuY3Rpb24oKSB7XHJcbiAgICBkZXN0cm95ZWQgPSB0cnVlO1xyXG4gICAgcmVzZXRUaW1lcigpO1xyXG4gIH0pO1xyXG5cclxuICAkc2NvcGUuJHdhdGNoKCdub1RyYW5zaXRpb24nLCBmdW5jdGlvbihub1RyYW5zaXRpb24pIHtcclxuICAgICRhbmltYXRlLmVuYWJsZWQoJGVsZW1lbnQsICFub1RyYW5zaXRpb24pO1xyXG4gIH0pO1xyXG5cclxuICAkc2NvcGUuJHdhdGNoKCdpbnRlcnZhbCcsIHJlc3RhcnRUaW1lcik7XHJcblxyXG4gICRzY29wZS4kd2F0Y2hDb2xsZWN0aW9uKCdzbGlkZXMnLCByZXNldFRyYW5zaXRpb24pO1xyXG5cclxuICAkc2NvcGUuJHdhdGNoKCdhY3RpdmUnLCBmdW5jdGlvbihpbmRleCkge1xyXG4gICAgaWYgKGFuZ3VsYXIuaXNOdW1iZXIoaW5kZXgpICYmIGN1cnJlbnRJbmRleCAhPT0gaW5kZXgpIHtcclxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzbGlkZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBpZiAoc2xpZGVzW2ldLnNsaWRlLmluZGV4ID09PSBpbmRleCkge1xyXG4gICAgICAgICAgaW5kZXggPSBpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICB2YXIgc2xpZGUgPSBzbGlkZXNbaW5kZXhdO1xyXG4gICAgICBpZiAoc2xpZGUpIHtcclxuICAgICAgICBzZXRBY3RpdmUoaW5kZXgpO1xyXG4gICAgICAgIHNlbGYuc2VsZWN0KHNsaWRlc1tpbmRleF0pO1xyXG4gICAgICAgIGN1cnJlbnRJbmRleCA9IGluZGV4O1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSk7XHJcblxyXG4gIGZ1bmN0aW9uIGNsZWFyQnVmZmVyZWRUcmFuc2l0aW9ucygpIHtcclxuICAgIHdoaWxlIChidWZmZXJlZFRyYW5zaXRpb25zLmxlbmd0aCkge1xyXG4gICAgICBidWZmZXJlZFRyYW5zaXRpb25zLnNoaWZ0KCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBnZXRTbGlkZUJ5SW5kZXgoaW5kZXgpIHtcclxuICAgIGZvciAodmFyIGkgPSAwLCBsID0gc2xpZGVzLmxlbmd0aDsgaSA8IGw7ICsraSkge1xyXG4gICAgICBpZiAoc2xpZGVzW2ldLmluZGV4ID09PSBpbmRleCkge1xyXG4gICAgICAgIHJldHVybiBzbGlkZXNbaV07XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHNldEFjdGl2ZShpbmRleCkge1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzbGlkZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgc2xpZGVzW2ldLnNsaWRlLmFjdGl2ZSA9IGkgPT09IGluZGV4O1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gZ29OZXh0KHNsaWRlLCBpbmRleCwgZGlyZWN0aW9uKSB7XHJcbiAgICBpZiAoZGVzdHJveWVkKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBhbmd1bGFyLmV4dGVuZChzbGlkZSwge2RpcmVjdGlvbjogZGlyZWN0aW9ufSk7XHJcbiAgICBhbmd1bGFyLmV4dGVuZChzbGlkZXNbY3VycmVudEluZGV4XS5zbGlkZSB8fCB7fSwge2RpcmVjdGlvbjogZGlyZWN0aW9ufSk7XHJcbiAgICBpZiAoJGFuaW1hdGUuZW5hYmxlZCgkZWxlbWVudCkgJiYgISRzY29wZS4kY3VycmVudFRyYW5zaXRpb24gJiZcclxuICAgICAgc2xpZGVzW2luZGV4XS5lbGVtZW50ICYmIHNlbGYuc2xpZGVzLmxlbmd0aCA+IDEpIHtcclxuICAgICAgc2xpZGVzW2luZGV4XS5lbGVtZW50LmRhdGEoU0xJREVfRElSRUNUSU9OLCBzbGlkZS5kaXJlY3Rpb24pO1xyXG4gICAgICB2YXIgY3VycmVudElkeCA9IHNlbGYuZ2V0Q3VycmVudEluZGV4KCk7XHJcblxyXG4gICAgICBpZiAoYW5ndWxhci5pc051bWJlcihjdXJyZW50SWR4KSAmJiBzbGlkZXNbY3VycmVudElkeF0uZWxlbWVudCkge1xyXG4gICAgICAgIHNsaWRlc1tjdXJyZW50SWR4XS5lbGVtZW50LmRhdGEoU0xJREVfRElSRUNUSU9OLCBzbGlkZS5kaXJlY3Rpb24pO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAkc2NvcGUuJGN1cnJlbnRUcmFuc2l0aW9uID0gdHJ1ZTtcclxuICAgICAgJGFuaW1hdGUub24oJ2FkZENsYXNzJywgc2xpZGVzW2luZGV4XS5lbGVtZW50LCBmdW5jdGlvbihlbGVtZW50LCBwaGFzZSkge1xyXG4gICAgICAgIGlmIChwaGFzZSA9PT0gJ2Nsb3NlJykge1xyXG4gICAgICAgICAgJHNjb3BlLiRjdXJyZW50VHJhbnNpdGlvbiA9IG51bGw7XHJcbiAgICAgICAgICAkYW5pbWF0ZS5vZmYoJ2FkZENsYXNzJywgZWxlbWVudCk7XHJcbiAgICAgICAgICBpZiAoYnVmZmVyZWRUcmFuc2l0aW9ucy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgdmFyIG5leHRTbGlkZSA9IGJ1ZmZlcmVkVHJhbnNpdGlvbnMucG9wKCkuc2xpZGU7XHJcbiAgICAgICAgICAgIHZhciBuZXh0SW5kZXggPSBuZXh0U2xpZGUuaW5kZXg7XHJcbiAgICAgICAgICAgIHZhciBuZXh0RGlyZWN0aW9uID0gbmV4dEluZGV4ID4gc2VsZi5nZXRDdXJyZW50SW5kZXgoKSA/ICduZXh0JyA6ICdwcmV2JztcclxuICAgICAgICAgICAgY2xlYXJCdWZmZXJlZFRyYW5zaXRpb25zKCk7XHJcblxyXG4gICAgICAgICAgICBnb05leHQobmV4dFNsaWRlLCBuZXh0SW5kZXgsIG5leHREaXJlY3Rpb24pO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgJHNjb3BlLmFjdGl2ZSA9IHNsaWRlLmluZGV4O1xyXG4gICAgY3VycmVudEluZGV4ID0gc2xpZGUuaW5kZXg7XHJcbiAgICBzZXRBY3RpdmUoaW5kZXgpO1xyXG5cclxuICAgIC8vZXZlcnkgdGltZSB5b3UgY2hhbmdlIHNsaWRlcywgcmVzZXQgdGhlIHRpbWVyXHJcbiAgICByZXN0YXJ0VGltZXIoKTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGZpbmRTbGlkZUluZGV4KHNsaWRlKSB7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNsaWRlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICBpZiAoc2xpZGVzW2ldLnNsaWRlID09PSBzbGlkZSkge1xyXG4gICAgICAgIHJldHVybiBpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiByZXNldFRpbWVyKCkge1xyXG4gICAgaWYgKGN1cnJlbnRJbnRlcnZhbCkge1xyXG4gICAgICAkaW50ZXJ2YWwuY2FuY2VsKGN1cnJlbnRJbnRlcnZhbCk7XHJcbiAgICAgIGN1cnJlbnRJbnRlcnZhbCA9IG51bGw7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiByZXNldFRyYW5zaXRpb24oc2xpZGVzKSB7XHJcbiAgICBpZiAoIXNsaWRlcy5sZW5ndGgpIHtcclxuICAgICAgJHNjb3BlLiRjdXJyZW50VHJhbnNpdGlvbiA9IG51bGw7XHJcbiAgICAgIGNsZWFyQnVmZmVyZWRUcmFuc2l0aW9ucygpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gcmVzdGFydFRpbWVyKCkge1xyXG4gICAgcmVzZXRUaW1lcigpO1xyXG4gICAgdmFyIGludGVydmFsID0gKyRzY29wZS5pbnRlcnZhbDtcclxuICAgIGlmICghaXNOYU4oaW50ZXJ2YWwpICYmIGludGVydmFsID4gMCkge1xyXG4gICAgICBjdXJyZW50SW50ZXJ2YWwgPSAkaW50ZXJ2YWwodGltZXJGbiwgaW50ZXJ2YWwpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gdGltZXJGbigpIHtcclxuICAgIHZhciBpbnRlcnZhbCA9ICskc2NvcGUuaW50ZXJ2YWw7XHJcbiAgICBpZiAoaXNQbGF5aW5nICYmICFpc05hTihpbnRlcnZhbCkgJiYgaW50ZXJ2YWwgPiAwICYmIHNsaWRlcy5sZW5ndGgpIHtcclxuICAgICAgJHNjb3BlLm5leHQoKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICRzY29wZS5wYXVzZSgpO1xyXG4gICAgfVxyXG4gIH1cclxufV0pXHJcblxyXG4uZGlyZWN0aXZlKCd1aWJDYXJvdXNlbCcsIGZ1bmN0aW9uKCkge1xyXG4gIHJldHVybiB7XHJcbiAgICB0cmFuc2NsdWRlOiB0cnVlLFxyXG4gICAgY29udHJvbGxlcjogJ1VpYkNhcm91c2VsQ29udHJvbGxlcicsXHJcbiAgICBjb250cm9sbGVyQXM6ICdjYXJvdXNlbCcsXHJcbiAgICByZXN0cmljdDogJ0EnLFxyXG4gICAgdGVtcGxhdGVVcmw6IGZ1bmN0aW9uKGVsZW1lbnQsIGF0dHJzKSB7XHJcbiAgICAgIHJldHVybiBhdHRycy50ZW1wbGF0ZVVybCB8fCAndWliL3RlbXBsYXRlL2Nhcm91c2VsL2Nhcm91c2VsLmh0bWwnO1xyXG4gICAgfSxcclxuICAgIHNjb3BlOiB7XHJcbiAgICAgIGFjdGl2ZTogJz0nLFxyXG4gICAgICBpbnRlcnZhbDogJz0nLFxyXG4gICAgICBub1RyYW5zaXRpb246ICc9JyxcclxuICAgICAgbm9QYXVzZTogJz0nLFxyXG4gICAgICBub1dyYXA6ICcmJ1xyXG4gICAgfVxyXG4gIH07XHJcbn0pXHJcblxyXG4uZGlyZWN0aXZlKCd1aWJTbGlkZScsIFsnJGFuaW1hdGUnLCBmdW5jdGlvbigkYW5pbWF0ZSkge1xyXG4gIHJldHVybiB7XHJcbiAgICByZXF1aXJlOiAnXnVpYkNhcm91c2VsJyxcclxuICAgIHJlc3RyaWN0OiAnQScsXHJcbiAgICB0cmFuc2NsdWRlOiB0cnVlLFxyXG4gICAgdGVtcGxhdGVVcmw6IGZ1bmN0aW9uKGVsZW1lbnQsIGF0dHJzKSB7XHJcbiAgICAgIHJldHVybiBhdHRycy50ZW1wbGF0ZVVybCB8fCAndWliL3RlbXBsYXRlL2Nhcm91c2VsL3NsaWRlLmh0bWwnO1xyXG4gICAgfSxcclxuICAgIHNjb3BlOiB7XHJcbiAgICAgIGFjdHVhbDogJz0/JyxcclxuICAgICAgaW5kZXg6ICc9PydcclxuICAgIH0sXHJcbiAgICBsaW5rOiBmdW5jdGlvbiAoc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCBjYXJvdXNlbEN0cmwpIHtcclxuICAgICAgZWxlbWVudC5hZGRDbGFzcygnaXRlbScpO1xyXG4gICAgICBjYXJvdXNlbEN0cmwuYWRkU2xpZGUoc2NvcGUsIGVsZW1lbnQpO1xyXG4gICAgICAvL3doZW4gdGhlIHNjb3BlIGlzIGRlc3Ryb3llZCB0aGVuIHJlbW92ZSB0aGUgc2xpZGUgZnJvbSB0aGUgY3VycmVudCBzbGlkZXMgYXJyYXlcclxuICAgICAgc2NvcGUuJG9uKCckZGVzdHJveScsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGNhcm91c2VsQ3RybC5yZW1vdmVTbGlkZShzY29wZSk7XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgc2NvcGUuJHdhdGNoKCdhY3RpdmUnLCBmdW5jdGlvbihhY3RpdmUpIHtcclxuICAgICAgICAkYW5pbWF0ZVthY3RpdmUgPyAnYWRkQ2xhc3MnIDogJ3JlbW92ZUNsYXNzJ10oZWxlbWVudCwgJ2FjdGl2ZScpO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuICB9O1xyXG59XSlcclxuXHJcbi5hbmltYXRpb24oJy5pdGVtJywgWyckYW5pbWF0ZUNzcycsXHJcbmZ1bmN0aW9uKCRhbmltYXRlQ3NzKSB7XHJcbiAgdmFyIFNMSURFX0RJUkVDVElPTiA9ICd1aWItc2xpZGVEaXJlY3Rpb24nO1xyXG5cclxuICBmdW5jdGlvbiByZW1vdmVDbGFzcyhlbGVtZW50LCBjbGFzc05hbWUsIGNhbGxiYWNrKSB7XHJcbiAgICBlbGVtZW50LnJlbW92ZUNsYXNzKGNsYXNzTmFtZSk7XHJcbiAgICBpZiAoY2FsbGJhY2spIHtcclxuICAgICAgY2FsbGJhY2soKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHJldHVybiB7XHJcbiAgICBiZWZvcmVBZGRDbGFzczogZnVuY3Rpb24oZWxlbWVudCwgY2xhc3NOYW1lLCBkb25lKSB7XHJcbiAgICAgIGlmIChjbGFzc05hbWUgPT09ICdhY3RpdmUnKSB7XHJcbiAgICAgICAgdmFyIHN0b3BwZWQgPSBmYWxzZTtcclxuICAgICAgICB2YXIgZGlyZWN0aW9uID0gZWxlbWVudC5kYXRhKFNMSURFX0RJUkVDVElPTik7XHJcbiAgICAgICAgdmFyIGRpcmVjdGlvbkNsYXNzID0gZGlyZWN0aW9uID09PSAnbmV4dCcgPyAnbGVmdCcgOiAncmlnaHQnO1xyXG4gICAgICAgIHZhciByZW1vdmVDbGFzc0ZuID0gcmVtb3ZlQ2xhc3MuYmluZCh0aGlzLCBlbGVtZW50LFxyXG4gICAgICAgICAgZGlyZWN0aW9uQ2xhc3MgKyAnICcgKyBkaXJlY3Rpb24sIGRvbmUpO1xyXG4gICAgICAgIGVsZW1lbnQuYWRkQ2xhc3MoZGlyZWN0aW9uKTtcclxuXHJcbiAgICAgICAgJGFuaW1hdGVDc3MoZWxlbWVudCwge2FkZENsYXNzOiBkaXJlY3Rpb25DbGFzc30pXHJcbiAgICAgICAgICAuc3RhcnQoKVxyXG4gICAgICAgICAgLmRvbmUocmVtb3ZlQ2xhc3NGbik7XHJcblxyXG4gICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgIHN0b3BwZWQgPSB0cnVlO1xyXG4gICAgICAgIH07XHJcbiAgICAgIH1cclxuICAgICAgZG9uZSgpO1xyXG4gICAgfSxcclxuICAgIGJlZm9yZVJlbW92ZUNsYXNzOiBmdW5jdGlvbiAoZWxlbWVudCwgY2xhc3NOYW1lLCBkb25lKSB7XHJcbiAgICAgIGlmIChjbGFzc05hbWUgPT09ICdhY3RpdmUnKSB7XHJcbiAgICAgICAgdmFyIHN0b3BwZWQgPSBmYWxzZTtcclxuICAgICAgICB2YXIgZGlyZWN0aW9uID0gZWxlbWVudC5kYXRhKFNMSURFX0RJUkVDVElPTik7XHJcbiAgICAgICAgdmFyIGRpcmVjdGlvbkNsYXNzID0gZGlyZWN0aW9uID09PSAnbmV4dCcgPyAnbGVmdCcgOiAncmlnaHQnO1xyXG4gICAgICAgIHZhciByZW1vdmVDbGFzc0ZuID0gcmVtb3ZlQ2xhc3MuYmluZCh0aGlzLCBlbGVtZW50LCBkaXJlY3Rpb25DbGFzcywgZG9uZSk7XHJcblxyXG4gICAgICAgICRhbmltYXRlQ3NzKGVsZW1lbnQsIHthZGRDbGFzczogZGlyZWN0aW9uQ2xhc3N9KVxyXG4gICAgICAgICAgLnN0YXJ0KClcclxuICAgICAgICAgIC5kb25lKHJlbW92ZUNsYXNzRm4pO1xyXG5cclxuICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICBzdG9wcGVkID0gdHJ1ZTtcclxuICAgICAgICB9O1xyXG4gICAgICB9XHJcbiAgICAgIGRvbmUoKTtcclxuICAgIH1cclxuICB9O1xyXG59XSk7XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgndWkuYm9vdHN0cmFwLmRhdGVwYXJzZXInLCBbXSlcclxuXHJcbi5zZXJ2aWNlKCd1aWJEYXRlUGFyc2VyJywgWyckbG9nJywgJyRsb2NhbGUnLCAnZGF0ZUZpbHRlcicsICdvcmRlckJ5RmlsdGVyJywgZnVuY3Rpb24oJGxvZywgJGxvY2FsZSwgZGF0ZUZpbHRlciwgb3JkZXJCeUZpbHRlcikge1xyXG4gIC8vIFB1bGxlZCBmcm9tIGh0dHBzOi8vZ2l0aHViLmNvbS9tYm9zdG9jay9kMy9ibG9iL21hc3Rlci9zcmMvZm9ybWF0L3JlcXVvdGUuanNcclxuICB2YXIgU1BFQ0lBTF9DSEFSQUNURVJTX1JFR0VYUCA9IC9bXFxcXFxcXlxcJFxcKlxcK1xcP1xcfFxcW1xcXVxcKFxcKVxcLlxce1xcfV0vZztcclxuXHJcbiAgdmFyIGxvY2FsZUlkO1xyXG4gIHZhciBmb3JtYXRDb2RlVG9SZWdleDtcclxuXHJcbiAgdGhpcy5pbml0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICBsb2NhbGVJZCA9ICRsb2NhbGUuaWQ7XHJcblxyXG4gICAgdGhpcy5wYXJzZXJzID0ge307XHJcbiAgICB0aGlzLmZvcm1hdHRlcnMgPSB7fTtcclxuXHJcbiAgICBmb3JtYXRDb2RlVG9SZWdleCA9IFtcclxuICAgICAge1xyXG4gICAgICAgIGtleTogJ3l5eXknLFxyXG4gICAgICAgIHJlZ2V4OiAnXFxcXGR7NH0nLFxyXG4gICAgICAgIGFwcGx5OiBmdW5jdGlvbih2YWx1ZSkgeyB0aGlzLnllYXIgPSArdmFsdWU7IH0sXHJcbiAgICAgICAgZm9ybWF0dGVyOiBmdW5jdGlvbihkYXRlKSB7XHJcbiAgICAgICAgICB2YXIgX2RhdGUgPSBuZXcgRGF0ZSgpO1xyXG4gICAgICAgICAgX2RhdGUuc2V0RnVsbFllYXIoTWF0aC5hYnMoZGF0ZS5nZXRGdWxsWWVhcigpKSk7XHJcbiAgICAgICAgICByZXR1cm4gZGF0ZUZpbHRlcihfZGF0ZSwgJ3l5eXknKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICBrZXk6ICd5eScsXHJcbiAgICAgICAgcmVnZXg6ICdcXFxcZHsyfScsXHJcbiAgICAgICAgYXBwbHk6IGZ1bmN0aW9uKHZhbHVlKSB7IHZhbHVlID0gK3ZhbHVlOyB0aGlzLnllYXIgPSB2YWx1ZSA8IDY5ID8gdmFsdWUgKyAyMDAwIDogdmFsdWUgKyAxOTAwOyB9LFxyXG4gICAgICAgIGZvcm1hdHRlcjogZnVuY3Rpb24oZGF0ZSkge1xyXG4gICAgICAgICAgdmFyIF9kYXRlID0gbmV3IERhdGUoKTtcclxuICAgICAgICAgIF9kYXRlLnNldEZ1bGxZZWFyKE1hdGguYWJzKGRhdGUuZ2V0RnVsbFllYXIoKSkpO1xyXG4gICAgICAgICAgcmV0dXJuIGRhdGVGaWx0ZXIoX2RhdGUsICd5eScpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIGtleTogJ3knLFxyXG4gICAgICAgIHJlZ2V4OiAnXFxcXGR7MSw0fScsXHJcbiAgICAgICAgYXBwbHk6IGZ1bmN0aW9uKHZhbHVlKSB7IHRoaXMueWVhciA9ICt2YWx1ZTsgfSxcclxuICAgICAgICBmb3JtYXR0ZXI6IGZ1bmN0aW9uKGRhdGUpIHtcclxuICAgICAgICAgIHZhciBfZGF0ZSA9IG5ldyBEYXRlKCk7XHJcbiAgICAgICAgICBfZGF0ZS5zZXRGdWxsWWVhcihNYXRoLmFicyhkYXRlLmdldEZ1bGxZZWFyKCkpKTtcclxuICAgICAgICAgIHJldHVybiBkYXRlRmlsdGVyKF9kYXRlLCAneScpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIGtleTogJ00hJyxcclxuICAgICAgICByZWdleDogJzA/WzEtOV18MVswLTJdJyxcclxuICAgICAgICBhcHBseTogZnVuY3Rpb24odmFsdWUpIHsgdGhpcy5tb250aCA9IHZhbHVlIC0gMTsgfSxcclxuICAgICAgICBmb3JtYXR0ZXI6IGZ1bmN0aW9uKGRhdGUpIHtcclxuICAgICAgICAgIHZhciB2YWx1ZSA9IGRhdGUuZ2V0TW9udGgoKTtcclxuICAgICAgICAgIGlmICgvXlswLTldJC8udGVzdCh2YWx1ZSkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGRhdGVGaWx0ZXIoZGF0ZSwgJ01NJyk7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgcmV0dXJuIGRhdGVGaWx0ZXIoZGF0ZSwgJ00nKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICBrZXk6ICdNTU1NJyxcclxuICAgICAgICByZWdleDogJGxvY2FsZS5EQVRFVElNRV9GT1JNQVRTLk1PTlRILmpvaW4oJ3wnKSxcclxuICAgICAgICBhcHBseTogZnVuY3Rpb24odmFsdWUpIHsgdGhpcy5tb250aCA9ICRsb2NhbGUuREFURVRJTUVfRk9STUFUUy5NT05USC5pbmRleE9mKHZhbHVlKTsgfSxcclxuICAgICAgICBmb3JtYXR0ZXI6IGZ1bmN0aW9uKGRhdGUpIHsgcmV0dXJuIGRhdGVGaWx0ZXIoZGF0ZSwgJ01NTU0nKTsgfVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAga2V5OiAnTU1NJyxcclxuICAgICAgICByZWdleDogJGxvY2FsZS5EQVRFVElNRV9GT1JNQVRTLlNIT1JUTU9OVEguam9pbignfCcpLFxyXG4gICAgICAgIGFwcGx5OiBmdW5jdGlvbih2YWx1ZSkgeyB0aGlzLm1vbnRoID0gJGxvY2FsZS5EQVRFVElNRV9GT1JNQVRTLlNIT1JUTU9OVEguaW5kZXhPZih2YWx1ZSk7IH0sXHJcbiAgICAgICAgZm9ybWF0dGVyOiBmdW5jdGlvbihkYXRlKSB7IHJldHVybiBkYXRlRmlsdGVyKGRhdGUsICdNTU0nKTsgfVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAga2V5OiAnTU0nLFxyXG4gICAgICAgIHJlZ2V4OiAnMFsxLTldfDFbMC0yXScsXHJcbiAgICAgICAgYXBwbHk6IGZ1bmN0aW9uKHZhbHVlKSB7IHRoaXMubW9udGggPSB2YWx1ZSAtIDE7IH0sXHJcbiAgICAgICAgZm9ybWF0dGVyOiBmdW5jdGlvbihkYXRlKSB7IHJldHVybiBkYXRlRmlsdGVyKGRhdGUsICdNTScpOyB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICBrZXk6ICdNJyxcclxuICAgICAgICByZWdleDogJ1sxLTldfDFbMC0yXScsXHJcbiAgICAgICAgYXBwbHk6IGZ1bmN0aW9uKHZhbHVlKSB7IHRoaXMubW9udGggPSB2YWx1ZSAtIDE7IH0sXHJcbiAgICAgICAgZm9ybWF0dGVyOiBmdW5jdGlvbihkYXRlKSB7IHJldHVybiBkYXRlRmlsdGVyKGRhdGUsICdNJyk7IH1cclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIGtleTogJ2QhJyxcclxuICAgICAgICByZWdleDogJ1swLTJdP1swLTldezF9fDNbMC0xXXsxfScsXHJcbiAgICAgICAgYXBwbHk6IGZ1bmN0aW9uKHZhbHVlKSB7IHRoaXMuZGF0ZSA9ICt2YWx1ZTsgfSxcclxuICAgICAgICBmb3JtYXR0ZXI6IGZ1bmN0aW9uKGRhdGUpIHtcclxuICAgICAgICAgIHZhciB2YWx1ZSA9IGRhdGUuZ2V0RGF0ZSgpO1xyXG4gICAgICAgICAgaWYgKC9eWzEtOV0kLy50ZXN0KHZhbHVlKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gZGF0ZUZpbHRlcihkYXRlLCAnZGQnKTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICByZXR1cm4gZGF0ZUZpbHRlcihkYXRlLCAnZCcpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIGtleTogJ2RkJyxcclxuICAgICAgICByZWdleDogJ1swLTJdWzAtOV17MX18M1swLTFdezF9JyxcclxuICAgICAgICBhcHBseTogZnVuY3Rpb24odmFsdWUpIHsgdGhpcy5kYXRlID0gK3ZhbHVlOyB9LFxyXG4gICAgICAgIGZvcm1hdHRlcjogZnVuY3Rpb24oZGF0ZSkgeyByZXR1cm4gZGF0ZUZpbHRlcihkYXRlLCAnZGQnKTsgfVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAga2V5OiAnZCcsXHJcbiAgICAgICAgcmVnZXg6ICdbMS0yXT9bMC05XXsxfXwzWzAtMV17MX0nLFxyXG4gICAgICAgIGFwcGx5OiBmdW5jdGlvbih2YWx1ZSkgeyB0aGlzLmRhdGUgPSArdmFsdWU7IH0sXHJcbiAgICAgICAgZm9ybWF0dGVyOiBmdW5jdGlvbihkYXRlKSB7IHJldHVybiBkYXRlRmlsdGVyKGRhdGUsICdkJyk7IH1cclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIGtleTogJ0VFRUUnLFxyXG4gICAgICAgIHJlZ2V4OiAkbG9jYWxlLkRBVEVUSU1FX0ZPUk1BVFMuREFZLmpvaW4oJ3wnKSxcclxuICAgICAgICBmb3JtYXR0ZXI6IGZ1bmN0aW9uKGRhdGUpIHsgcmV0dXJuIGRhdGVGaWx0ZXIoZGF0ZSwgJ0VFRUUnKTsgfVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAga2V5OiAnRUVFJyxcclxuICAgICAgICByZWdleDogJGxvY2FsZS5EQVRFVElNRV9GT1JNQVRTLlNIT1JUREFZLmpvaW4oJ3wnKSxcclxuICAgICAgICBmb3JtYXR0ZXI6IGZ1bmN0aW9uKGRhdGUpIHsgcmV0dXJuIGRhdGVGaWx0ZXIoZGF0ZSwgJ0VFRScpOyB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICBrZXk6ICdISCcsXHJcbiAgICAgICAgcmVnZXg6ICcoPzowfDEpWzAtOV18MlswLTNdJyxcclxuICAgICAgICBhcHBseTogZnVuY3Rpb24odmFsdWUpIHsgdGhpcy5ob3VycyA9ICt2YWx1ZTsgfSxcclxuICAgICAgICBmb3JtYXR0ZXI6IGZ1bmN0aW9uKGRhdGUpIHsgcmV0dXJuIGRhdGVGaWx0ZXIoZGF0ZSwgJ0hIJyk7IH1cclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIGtleTogJ2hoJyxcclxuICAgICAgICByZWdleDogJzBbMC05XXwxWzAtMl0nLFxyXG4gICAgICAgIGFwcGx5OiBmdW5jdGlvbih2YWx1ZSkgeyB0aGlzLmhvdXJzID0gK3ZhbHVlOyB9LFxyXG4gICAgICAgIGZvcm1hdHRlcjogZnVuY3Rpb24oZGF0ZSkgeyByZXR1cm4gZGF0ZUZpbHRlcihkYXRlLCAnaGgnKTsgfVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAga2V5OiAnSCcsXHJcbiAgICAgICAgcmVnZXg6ICcxP1swLTldfDJbMC0zXScsXHJcbiAgICAgICAgYXBwbHk6IGZ1bmN0aW9uKHZhbHVlKSB7IHRoaXMuaG91cnMgPSArdmFsdWU7IH0sXHJcbiAgICAgICAgZm9ybWF0dGVyOiBmdW5jdGlvbihkYXRlKSB7IHJldHVybiBkYXRlRmlsdGVyKGRhdGUsICdIJyk7IH1cclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIGtleTogJ2gnLFxyXG4gICAgICAgIHJlZ2V4OiAnWzAtOV18MVswLTJdJyxcclxuICAgICAgICBhcHBseTogZnVuY3Rpb24odmFsdWUpIHsgdGhpcy5ob3VycyA9ICt2YWx1ZTsgfSxcclxuICAgICAgICBmb3JtYXR0ZXI6IGZ1bmN0aW9uKGRhdGUpIHsgcmV0dXJuIGRhdGVGaWx0ZXIoZGF0ZSwgJ2gnKTsgfVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAga2V5OiAnbW0nLFxyXG4gICAgICAgIHJlZ2V4OiAnWzAtNV1bMC05XScsXHJcbiAgICAgICAgYXBwbHk6IGZ1bmN0aW9uKHZhbHVlKSB7IHRoaXMubWludXRlcyA9ICt2YWx1ZTsgfSxcclxuICAgICAgICBmb3JtYXR0ZXI6IGZ1bmN0aW9uKGRhdGUpIHsgcmV0dXJuIGRhdGVGaWx0ZXIoZGF0ZSwgJ21tJyk7IH1cclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIGtleTogJ20nLFxyXG4gICAgICAgIHJlZ2V4OiAnWzAtOV18WzEtNV1bMC05XScsXHJcbiAgICAgICAgYXBwbHk6IGZ1bmN0aW9uKHZhbHVlKSB7IHRoaXMubWludXRlcyA9ICt2YWx1ZTsgfSxcclxuICAgICAgICBmb3JtYXR0ZXI6IGZ1bmN0aW9uKGRhdGUpIHsgcmV0dXJuIGRhdGVGaWx0ZXIoZGF0ZSwgJ20nKTsgfVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAga2V5OiAnc3NzJyxcclxuICAgICAgICByZWdleDogJ1swLTldWzAtOV1bMC05XScsXHJcbiAgICAgICAgYXBwbHk6IGZ1bmN0aW9uKHZhbHVlKSB7IHRoaXMubWlsbGlzZWNvbmRzID0gK3ZhbHVlOyB9LFxyXG4gICAgICAgIGZvcm1hdHRlcjogZnVuY3Rpb24oZGF0ZSkgeyByZXR1cm4gZGF0ZUZpbHRlcihkYXRlLCAnc3NzJyk7IH1cclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIGtleTogJ3NzJyxcclxuICAgICAgICByZWdleDogJ1swLTVdWzAtOV0nLFxyXG4gICAgICAgIGFwcGx5OiBmdW5jdGlvbih2YWx1ZSkgeyB0aGlzLnNlY29uZHMgPSArdmFsdWU7IH0sXHJcbiAgICAgICAgZm9ybWF0dGVyOiBmdW5jdGlvbihkYXRlKSB7IHJldHVybiBkYXRlRmlsdGVyKGRhdGUsICdzcycpOyB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICBrZXk6ICdzJyxcclxuICAgICAgICByZWdleDogJ1swLTldfFsxLTVdWzAtOV0nLFxyXG4gICAgICAgIGFwcGx5OiBmdW5jdGlvbih2YWx1ZSkgeyB0aGlzLnNlY29uZHMgPSArdmFsdWU7IH0sXHJcbiAgICAgICAgZm9ybWF0dGVyOiBmdW5jdGlvbihkYXRlKSB7IHJldHVybiBkYXRlRmlsdGVyKGRhdGUsICdzJyk7IH1cclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIGtleTogJ2EnLFxyXG4gICAgICAgIHJlZ2V4OiAkbG9jYWxlLkRBVEVUSU1FX0ZPUk1BVFMuQU1QTVMuam9pbignfCcpLFxyXG4gICAgICAgIGFwcGx5OiBmdW5jdGlvbih2YWx1ZSkge1xyXG4gICAgICAgICAgaWYgKHRoaXMuaG91cnMgPT09IDEyKSB7XHJcbiAgICAgICAgICAgIHRoaXMuaG91cnMgPSAwO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIGlmICh2YWx1ZSA9PT0gJ1BNJykge1xyXG4gICAgICAgICAgICB0aGlzLmhvdXJzICs9IDEyO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZm9ybWF0dGVyOiBmdW5jdGlvbihkYXRlKSB7IHJldHVybiBkYXRlRmlsdGVyKGRhdGUsICdhJyk7IH1cclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIGtleTogJ1onLFxyXG4gICAgICAgIHJlZ2V4OiAnWystXVxcXFxkezR9JyxcclxuICAgICAgICBhcHBseTogZnVuY3Rpb24odmFsdWUpIHtcclxuICAgICAgICAgIHZhciBtYXRjaGVzID0gdmFsdWUubWF0Y2goLyhbKy1dKShcXGR7Mn0pKFxcZHsyfSkvKSxcclxuICAgICAgICAgICAgc2lnbiA9IG1hdGNoZXNbMV0sXHJcbiAgICAgICAgICAgIGhvdXJzID0gbWF0Y2hlc1syXSxcclxuICAgICAgICAgICAgbWludXRlcyA9IG1hdGNoZXNbM107XHJcbiAgICAgICAgICB0aGlzLmhvdXJzICs9IHRvSW50KHNpZ24gKyBob3Vycyk7XHJcbiAgICAgICAgICB0aGlzLm1pbnV0ZXMgKz0gdG9JbnQoc2lnbiArIG1pbnV0ZXMpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZm9ybWF0dGVyOiBmdW5jdGlvbihkYXRlKSB7XHJcbiAgICAgICAgICByZXR1cm4gZGF0ZUZpbHRlcihkYXRlLCAnWicpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIGtleTogJ3d3JyxcclxuICAgICAgICByZWdleDogJ1swLTRdWzAtOV18NVswLTNdJyxcclxuICAgICAgICBmb3JtYXR0ZXI6IGZ1bmN0aW9uKGRhdGUpIHsgcmV0dXJuIGRhdGVGaWx0ZXIoZGF0ZSwgJ3d3Jyk7IH1cclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIGtleTogJ3cnLFxyXG4gICAgICAgIHJlZ2V4OiAnWzAtOV18WzEtNF1bMC05XXw1WzAtM10nLFxyXG4gICAgICAgIGZvcm1hdHRlcjogZnVuY3Rpb24oZGF0ZSkgeyByZXR1cm4gZGF0ZUZpbHRlcihkYXRlLCAndycpOyB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICBrZXk6ICdHR0dHJyxcclxuICAgICAgICByZWdleDogJGxvY2FsZS5EQVRFVElNRV9GT1JNQVRTLkVSQU5BTUVTLmpvaW4oJ3wnKS5yZXBsYWNlKC9cXHMvZywgJ1xcXFxzJyksXHJcbiAgICAgICAgZm9ybWF0dGVyOiBmdW5jdGlvbihkYXRlKSB7IHJldHVybiBkYXRlRmlsdGVyKGRhdGUsICdHR0dHJyk7IH1cclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIGtleTogJ0dHRycsXHJcbiAgICAgICAgcmVnZXg6ICRsb2NhbGUuREFURVRJTUVfRk9STUFUUy5FUkFTLmpvaW4oJ3wnKSxcclxuICAgICAgICBmb3JtYXR0ZXI6IGZ1bmN0aW9uKGRhdGUpIHsgcmV0dXJuIGRhdGVGaWx0ZXIoZGF0ZSwgJ0dHRycpOyB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICBrZXk6ICdHRycsXHJcbiAgICAgICAgcmVnZXg6ICRsb2NhbGUuREFURVRJTUVfRk9STUFUUy5FUkFTLmpvaW4oJ3wnKSxcclxuICAgICAgICBmb3JtYXR0ZXI6IGZ1bmN0aW9uKGRhdGUpIHsgcmV0dXJuIGRhdGVGaWx0ZXIoZGF0ZSwgJ0dHJyk7IH1cclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIGtleTogJ0cnLFxyXG4gICAgICAgIHJlZ2V4OiAkbG9jYWxlLkRBVEVUSU1FX0ZPUk1BVFMuRVJBUy5qb2luKCd8JyksXHJcbiAgICAgICAgZm9ybWF0dGVyOiBmdW5jdGlvbihkYXRlKSB7IHJldHVybiBkYXRlRmlsdGVyKGRhdGUsICdHJyk7IH1cclxuICAgICAgfVxyXG4gICAgXTtcclxuICB9O1xyXG5cclxuICB0aGlzLmluaXQoKTtcclxuXHJcbiAgZnVuY3Rpb24gY3JlYXRlUGFyc2VyKGZvcm1hdCkge1xyXG4gICAgdmFyIG1hcCA9IFtdLCByZWdleCA9IGZvcm1hdC5zcGxpdCgnJyk7XHJcblxyXG4gICAgLy8gY2hlY2sgZm9yIGxpdGVyYWwgdmFsdWVzXHJcbiAgICB2YXIgcXVvdGVJbmRleCA9IGZvcm1hdC5pbmRleE9mKCdcXCcnKTtcclxuICAgIGlmIChxdW90ZUluZGV4ID4gLTEpIHtcclxuICAgICAgdmFyIGluTGl0ZXJhbCA9IGZhbHNlO1xyXG4gICAgICBmb3JtYXQgPSBmb3JtYXQuc3BsaXQoJycpO1xyXG4gICAgICBmb3IgKHZhciBpID0gcXVvdGVJbmRleDsgaSA8IGZvcm1hdC5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGlmIChpbkxpdGVyYWwpIHtcclxuICAgICAgICAgIGlmIChmb3JtYXRbaV0gPT09ICdcXCcnKSB7XHJcbiAgICAgICAgICAgIGlmIChpICsgMSA8IGZvcm1hdC5sZW5ndGggJiYgZm9ybWF0W2krMV0gPT09ICdcXCcnKSB7IC8vIGVzY2FwZWQgc2luZ2xlIHF1b3RlXHJcbiAgICAgICAgICAgICAgZm9ybWF0W2krMV0gPSAnJCc7XHJcbiAgICAgICAgICAgICAgcmVnZXhbaSsxXSA9ICcnO1xyXG4gICAgICAgICAgICB9IGVsc2UgeyAvLyBlbmQgb2YgbGl0ZXJhbFxyXG4gICAgICAgICAgICAgIHJlZ2V4W2ldID0gJyc7XHJcbiAgICAgICAgICAgICAgaW5MaXRlcmFsID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGZvcm1hdFtpXSA9ICckJztcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgaWYgKGZvcm1hdFtpXSA9PT0gJ1xcJycpIHsgLy8gc3RhcnQgb2YgbGl0ZXJhbFxyXG4gICAgICAgICAgICBmb3JtYXRbaV0gPSAnJCc7XHJcbiAgICAgICAgICAgIHJlZ2V4W2ldID0gJyc7XHJcbiAgICAgICAgICAgIGluTGl0ZXJhbCA9IHRydWU7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICBmb3JtYXQgPSBmb3JtYXQuam9pbignJyk7XHJcbiAgICB9XHJcblxyXG4gICAgYW5ndWxhci5mb3JFYWNoKGZvcm1hdENvZGVUb1JlZ2V4LCBmdW5jdGlvbihkYXRhKSB7XHJcbiAgICAgIHZhciBpbmRleCA9IGZvcm1hdC5pbmRleE9mKGRhdGEua2V5KTtcclxuXHJcbiAgICAgIGlmIChpbmRleCA+IC0xKSB7XHJcbiAgICAgICAgZm9ybWF0ID0gZm9ybWF0LnNwbGl0KCcnKTtcclxuXHJcbiAgICAgICAgcmVnZXhbaW5kZXhdID0gJygnICsgZGF0YS5yZWdleCArICcpJztcclxuICAgICAgICBmb3JtYXRbaW5kZXhdID0gJyQnOyAvLyBDdXN0b20gc3ltYm9sIHRvIGRlZmluZSBjb25zdW1lZCBwYXJ0IG9mIGZvcm1hdFxyXG4gICAgICAgIGZvciAodmFyIGkgPSBpbmRleCArIDEsIG4gPSBpbmRleCArIGRhdGEua2V5Lmxlbmd0aDsgaSA8IG47IGkrKykge1xyXG4gICAgICAgICAgcmVnZXhbaV0gPSAnJztcclxuICAgICAgICAgIGZvcm1hdFtpXSA9ICckJztcclxuICAgICAgICB9XHJcbiAgICAgICAgZm9ybWF0ID0gZm9ybWF0LmpvaW4oJycpO1xyXG5cclxuICAgICAgICBtYXAucHVzaCh7XHJcbiAgICAgICAgICBpbmRleDogaW5kZXgsXHJcbiAgICAgICAgICBrZXk6IGRhdGEua2V5LFxyXG4gICAgICAgICAgYXBwbHk6IGRhdGEuYXBwbHksXHJcbiAgICAgICAgICBtYXRjaGVyOiBkYXRhLnJlZ2V4XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgIHJlZ2V4OiBuZXcgUmVnRXhwKCdeJyArIHJlZ2V4LmpvaW4oJycpICsgJyQnKSxcclxuICAgICAgbWFwOiBvcmRlckJ5RmlsdGVyKG1hcCwgJ2luZGV4JylcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBjcmVhdGVGb3JtYXR0ZXIoZm9ybWF0KSB7XHJcbiAgICB2YXIgZm9ybWF0dGVycyA9IFtdO1xyXG4gICAgdmFyIGkgPSAwO1xyXG4gICAgdmFyIGZvcm1hdHRlciwgbGl0ZXJhbElkeDtcclxuICAgIHdoaWxlIChpIDwgZm9ybWF0Lmxlbmd0aCkge1xyXG4gICAgICBpZiAoYW5ndWxhci5pc051bWJlcihsaXRlcmFsSWR4KSkge1xyXG4gICAgICAgIGlmIChmb3JtYXQuY2hhckF0KGkpID09PSAnXFwnJykge1xyXG4gICAgICAgICAgaWYgKGkgKyAxID49IGZvcm1hdC5sZW5ndGggfHwgZm9ybWF0LmNoYXJBdChpICsgMSkgIT09ICdcXCcnKSB7XHJcbiAgICAgICAgICAgIGZvcm1hdHRlcnMucHVzaChjb25zdHJ1Y3RMaXRlcmFsRm9ybWF0dGVyKGZvcm1hdCwgbGl0ZXJhbElkeCwgaSkpO1xyXG4gICAgICAgICAgICBsaXRlcmFsSWR4ID0gbnVsbDtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2UgaWYgKGkgPT09IGZvcm1hdC5sZW5ndGgpIHtcclxuICAgICAgICAgIHdoaWxlIChsaXRlcmFsSWR4IDwgZm9ybWF0Lmxlbmd0aCkge1xyXG4gICAgICAgICAgICBmb3JtYXR0ZXIgPSBjb25zdHJ1Y3RGb3JtYXR0ZXJGcm9tSWR4KGZvcm1hdCwgbGl0ZXJhbElkeCk7XHJcbiAgICAgICAgICAgIGZvcm1hdHRlcnMucHVzaChmb3JtYXR0ZXIpO1xyXG4gICAgICAgICAgICBsaXRlcmFsSWR4ID0gZm9ybWF0dGVyLmVuZElkeDtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGkrKztcclxuICAgICAgICBjb250aW51ZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKGZvcm1hdC5jaGFyQXQoaSkgPT09ICdcXCcnKSB7XHJcbiAgICAgICAgbGl0ZXJhbElkeCA9IGk7XHJcbiAgICAgICAgaSsrO1xyXG4gICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBmb3JtYXR0ZXIgPSBjb25zdHJ1Y3RGb3JtYXR0ZXJGcm9tSWR4KGZvcm1hdCwgaSk7XHJcblxyXG4gICAgICBmb3JtYXR0ZXJzLnB1c2goZm9ybWF0dGVyLnBhcnNlcik7XHJcbiAgICAgIGkgPSBmb3JtYXR0ZXIuZW5kSWR4O1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBmb3JtYXR0ZXJzO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gY29uc3RydWN0TGl0ZXJhbEZvcm1hdHRlcihmb3JtYXQsIGxpdGVyYWxJZHgsIGVuZElkeCkge1xyXG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xyXG4gICAgICByZXR1cm4gZm9ybWF0LnN1YnN0cihsaXRlcmFsSWR4ICsgMSwgZW5kSWR4IC0gbGl0ZXJhbElkeCAtIDEpO1xyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGNvbnN0cnVjdEZvcm1hdHRlckZyb21JZHgoZm9ybWF0LCBpKSB7XHJcbiAgICB2YXIgY3VycmVudFBvc1N0ciA9IGZvcm1hdC5zdWJzdHIoaSk7XHJcbiAgICBmb3IgKHZhciBqID0gMDsgaiA8IGZvcm1hdENvZGVUb1JlZ2V4Lmxlbmd0aDsgaisrKSB7XHJcbiAgICAgIGlmIChuZXcgUmVnRXhwKCdeJyArIGZvcm1hdENvZGVUb1JlZ2V4W2pdLmtleSkudGVzdChjdXJyZW50UG9zU3RyKSkge1xyXG4gICAgICAgIHZhciBkYXRhID0gZm9ybWF0Q29kZVRvUmVnZXhbal07XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIGVuZElkeDogaSArIGRhdGEua2V5Lmxlbmd0aCxcclxuICAgICAgICAgIHBhcnNlcjogZGF0YS5mb3JtYXR0ZXJcclxuICAgICAgICB9O1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgZW5kSWR4OiBpICsgMSxcclxuICAgICAgcGFyc2VyOiBmdW5jdGlvbigpIHtcclxuICAgICAgICByZXR1cm4gY3VycmVudFBvc1N0ci5jaGFyQXQoMCk7XHJcbiAgICAgIH1cclxuICAgIH07XHJcbiAgfVxyXG5cclxuICB0aGlzLmZpbHRlciA9IGZ1bmN0aW9uKGRhdGUsIGZvcm1hdCkge1xyXG4gICAgaWYgKCFhbmd1bGFyLmlzRGF0ZShkYXRlKSB8fCBpc05hTihkYXRlKSB8fCAhZm9ybWF0KSB7XHJcbiAgICAgIHJldHVybiAnJztcclxuICAgIH1cclxuXHJcbiAgICBmb3JtYXQgPSAkbG9jYWxlLkRBVEVUSU1FX0ZPUk1BVFNbZm9ybWF0XSB8fCBmb3JtYXQ7XHJcblxyXG4gICAgaWYgKCRsb2NhbGUuaWQgIT09IGxvY2FsZUlkKSB7XHJcbiAgICAgIHRoaXMuaW5pdCgpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICghdGhpcy5mb3JtYXR0ZXJzW2Zvcm1hdF0pIHtcclxuICAgICAgdGhpcy5mb3JtYXR0ZXJzW2Zvcm1hdF0gPSBjcmVhdGVGb3JtYXR0ZXIoZm9ybWF0KTtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgZm9ybWF0dGVycyA9IHRoaXMuZm9ybWF0dGVyc1tmb3JtYXRdO1xyXG5cclxuICAgIHJldHVybiBmb3JtYXR0ZXJzLnJlZHVjZShmdW5jdGlvbihzdHIsIGZvcm1hdHRlcikge1xyXG4gICAgICByZXR1cm4gc3RyICsgZm9ybWF0dGVyKGRhdGUpO1xyXG4gICAgfSwgJycpO1xyXG4gIH07XHJcblxyXG4gIHRoaXMucGFyc2UgPSBmdW5jdGlvbihpbnB1dCwgZm9ybWF0LCBiYXNlRGF0ZSkge1xyXG4gICAgaWYgKCFhbmd1bGFyLmlzU3RyaW5nKGlucHV0KSB8fCAhZm9ybWF0KSB7XHJcbiAgICAgIHJldHVybiBpbnB1dDtcclxuICAgIH1cclxuXHJcbiAgICBmb3JtYXQgPSAkbG9jYWxlLkRBVEVUSU1FX0ZPUk1BVFNbZm9ybWF0XSB8fCBmb3JtYXQ7XHJcbiAgICBmb3JtYXQgPSBmb3JtYXQucmVwbGFjZShTUEVDSUFMX0NIQVJBQ1RFUlNfUkVHRVhQLCAnXFxcXCQmJyk7XHJcblxyXG4gICAgaWYgKCRsb2NhbGUuaWQgIT09IGxvY2FsZUlkKSB7XHJcbiAgICAgIHRoaXMuaW5pdCgpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICghdGhpcy5wYXJzZXJzW2Zvcm1hdF0pIHtcclxuICAgICAgdGhpcy5wYXJzZXJzW2Zvcm1hdF0gPSBjcmVhdGVQYXJzZXIoZm9ybWF0LCAnYXBwbHknKTtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgcGFyc2VyID0gdGhpcy5wYXJzZXJzW2Zvcm1hdF0sXHJcbiAgICAgICAgcmVnZXggPSBwYXJzZXIucmVnZXgsXHJcbiAgICAgICAgbWFwID0gcGFyc2VyLm1hcCxcclxuICAgICAgICByZXN1bHRzID0gaW5wdXQubWF0Y2gocmVnZXgpLFxyXG4gICAgICAgIHR6T2Zmc2V0ID0gZmFsc2U7XHJcbiAgICBpZiAocmVzdWx0cyAmJiByZXN1bHRzLmxlbmd0aCkge1xyXG4gICAgICB2YXIgZmllbGRzLCBkdDtcclxuICAgICAgaWYgKGFuZ3VsYXIuaXNEYXRlKGJhc2VEYXRlKSAmJiAhaXNOYU4oYmFzZURhdGUuZ2V0VGltZSgpKSkge1xyXG4gICAgICAgIGZpZWxkcyA9IHtcclxuICAgICAgICAgIHllYXI6IGJhc2VEYXRlLmdldEZ1bGxZZWFyKCksXHJcbiAgICAgICAgICBtb250aDogYmFzZURhdGUuZ2V0TW9udGgoKSxcclxuICAgICAgICAgIGRhdGU6IGJhc2VEYXRlLmdldERhdGUoKSxcclxuICAgICAgICAgIGhvdXJzOiBiYXNlRGF0ZS5nZXRIb3VycygpLFxyXG4gICAgICAgICAgbWludXRlczogYmFzZURhdGUuZ2V0TWludXRlcygpLFxyXG4gICAgICAgICAgc2Vjb25kczogYmFzZURhdGUuZ2V0U2Vjb25kcygpLFxyXG4gICAgICAgICAgbWlsbGlzZWNvbmRzOiBiYXNlRGF0ZS5nZXRNaWxsaXNlY29uZHMoKVxyXG4gICAgICAgIH07XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgaWYgKGJhc2VEYXRlKSB7XHJcbiAgICAgICAgICAkbG9nLndhcm4oJ2RhdGVwYXJzZXI6JywgJ2Jhc2VEYXRlIGlzIG5vdCBhIHZhbGlkIGRhdGUnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZmllbGRzID0geyB5ZWFyOiAxOTAwLCBtb250aDogMCwgZGF0ZTogMSwgaG91cnM6IDAsIG1pbnV0ZXM6IDAsIHNlY29uZHM6IDAsIG1pbGxpc2Vjb25kczogMCB9O1xyXG4gICAgICB9XHJcblxyXG4gICAgICBmb3IgKHZhciBpID0gMSwgbiA9IHJlc3VsdHMubGVuZ3RoOyBpIDwgbjsgaSsrKSB7XHJcbiAgICAgICAgdmFyIG1hcHBlciA9IG1hcFtpIC0gMV07XHJcbiAgICAgICAgaWYgKG1hcHBlci5tYXRjaGVyID09PSAnWicpIHtcclxuICAgICAgICAgIHR6T2Zmc2V0ID0gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChtYXBwZXIuYXBwbHkpIHtcclxuICAgICAgICAgIG1hcHBlci5hcHBseS5jYWxsKGZpZWxkcywgcmVzdWx0c1tpXSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICB2YXIgZGF0ZXNldHRlciA9IHR6T2Zmc2V0ID8gRGF0ZS5wcm90b3R5cGUuc2V0VVRDRnVsbFllYXIgOlxyXG4gICAgICAgIERhdGUucHJvdG90eXBlLnNldEZ1bGxZZWFyO1xyXG4gICAgICB2YXIgdGltZXNldHRlciA9IHR6T2Zmc2V0ID8gRGF0ZS5wcm90b3R5cGUuc2V0VVRDSG91cnMgOlxyXG4gICAgICAgIERhdGUucHJvdG90eXBlLnNldEhvdXJzO1xyXG5cclxuICAgICAgaWYgKGlzVmFsaWQoZmllbGRzLnllYXIsIGZpZWxkcy5tb250aCwgZmllbGRzLmRhdGUpKSB7XHJcbiAgICAgICAgaWYgKGFuZ3VsYXIuaXNEYXRlKGJhc2VEYXRlKSAmJiAhaXNOYU4oYmFzZURhdGUuZ2V0VGltZSgpKSAmJiAhdHpPZmZzZXQpIHtcclxuICAgICAgICAgIGR0ID0gbmV3IERhdGUoYmFzZURhdGUpO1xyXG4gICAgICAgICAgZGF0ZXNldHRlci5jYWxsKGR0LCBmaWVsZHMueWVhciwgZmllbGRzLm1vbnRoLCBmaWVsZHMuZGF0ZSk7XHJcbiAgICAgICAgICB0aW1lc2V0dGVyLmNhbGwoZHQsIGZpZWxkcy5ob3VycywgZmllbGRzLm1pbnV0ZXMsXHJcbiAgICAgICAgICAgIGZpZWxkcy5zZWNvbmRzLCBmaWVsZHMubWlsbGlzZWNvbmRzKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgZHQgPSBuZXcgRGF0ZSgwKTtcclxuICAgICAgICAgIGRhdGVzZXR0ZXIuY2FsbChkdCwgZmllbGRzLnllYXIsIGZpZWxkcy5tb250aCwgZmllbGRzLmRhdGUpO1xyXG4gICAgICAgICAgdGltZXNldHRlci5jYWxsKGR0LCBmaWVsZHMuaG91cnMgfHwgMCwgZmllbGRzLm1pbnV0ZXMgfHwgMCxcclxuICAgICAgICAgICAgZmllbGRzLnNlY29uZHMgfHwgMCwgZmllbGRzLm1pbGxpc2Vjb25kcyB8fCAwKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiBkdDtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICAvLyBDaGVjayBpZiBkYXRlIGlzIHZhbGlkIGZvciBzcGVjaWZpYyBtb250aCAoYW5kIHllYXIgZm9yIEZlYnJ1YXJ5KS5cclxuICAvLyBNb250aDogMCA9IEphbiwgMSA9IEZlYiwgZXRjXHJcbiAgZnVuY3Rpb24gaXNWYWxpZCh5ZWFyLCBtb250aCwgZGF0ZSkge1xyXG4gICAgaWYgKGRhdGUgPCAxKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAobW9udGggPT09IDEgJiYgZGF0ZSA+IDI4KSB7XHJcbiAgICAgIHJldHVybiBkYXRlID09PSAyOSAmJiAoeWVhciAlIDQgPT09IDAgJiYgeWVhciAlIDEwMCAhPT0gMCB8fCB5ZWFyICUgNDAwID09PSAwKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAobW9udGggPT09IDMgfHwgbW9udGggPT09IDUgfHwgbW9udGggPT09IDggfHwgbW9udGggPT09IDEwKSB7XHJcbiAgICAgIHJldHVybiBkYXRlIDwgMzE7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRydWU7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiB0b0ludChzdHIpIHtcclxuICAgIHJldHVybiBwYXJzZUludChzdHIsIDEwKTtcclxuICB9XHJcblxyXG4gIHRoaXMudG9UaW1lem9uZSA9IHRvVGltZXpvbmU7XHJcbiAgdGhpcy5mcm9tVGltZXpvbmUgPSBmcm9tVGltZXpvbmU7XHJcbiAgdGhpcy50aW1lem9uZVRvT2Zmc2V0ID0gdGltZXpvbmVUb09mZnNldDtcclxuICB0aGlzLmFkZERhdGVNaW51dGVzID0gYWRkRGF0ZU1pbnV0ZXM7XHJcbiAgdGhpcy5jb252ZXJ0VGltZXpvbmVUb0xvY2FsID0gY29udmVydFRpbWV6b25lVG9Mb2NhbDtcclxuXHJcbiAgZnVuY3Rpb24gdG9UaW1lem9uZShkYXRlLCB0aW1lem9uZSkge1xyXG4gICAgcmV0dXJuIGRhdGUgJiYgdGltZXpvbmUgPyBjb252ZXJ0VGltZXpvbmVUb0xvY2FsKGRhdGUsIHRpbWV6b25lKSA6IGRhdGU7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBmcm9tVGltZXpvbmUoZGF0ZSwgdGltZXpvbmUpIHtcclxuICAgIHJldHVybiBkYXRlICYmIHRpbWV6b25lID8gY29udmVydFRpbWV6b25lVG9Mb2NhbChkYXRlLCB0aW1lem9uZSwgdHJ1ZSkgOiBkYXRlO1xyXG4gIH1cclxuXHJcbiAgLy9odHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9hbmd1bGFyLmpzL2Jsb2IvNjIyYzQyMTY5Njk5ZWMwN2ZjNmRhYWExOWZlNmQyMjRlNWQyZjcwZS9zcmMvQW5ndWxhci5qcyNMMTIwN1xyXG4gIGZ1bmN0aW9uIHRpbWV6b25lVG9PZmZzZXQodGltZXpvbmUsIGZhbGxiYWNrKSB7XHJcbiAgICB0aW1lem9uZSA9IHRpbWV6b25lLnJlcGxhY2UoLzovZywgJycpO1xyXG4gICAgdmFyIHJlcXVlc3RlZFRpbWV6b25lT2Zmc2V0ID0gRGF0ZS5wYXJzZSgnSmFuIDAxLCAxOTcwIDAwOjAwOjAwICcgKyB0aW1lem9uZSkgLyA2MDAwMDtcclxuICAgIHJldHVybiBpc05hTihyZXF1ZXN0ZWRUaW1lem9uZU9mZnNldCkgPyBmYWxsYmFjayA6IHJlcXVlc3RlZFRpbWV6b25lT2Zmc2V0O1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gYWRkRGF0ZU1pbnV0ZXMoZGF0ZSwgbWludXRlcykge1xyXG4gICAgZGF0ZSA9IG5ldyBEYXRlKGRhdGUuZ2V0VGltZSgpKTtcclxuICAgIGRhdGUuc2V0TWludXRlcyhkYXRlLmdldE1pbnV0ZXMoKSArIG1pbnV0ZXMpO1xyXG4gICAgcmV0dXJuIGRhdGU7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBjb252ZXJ0VGltZXpvbmVUb0xvY2FsKGRhdGUsIHRpbWV6b25lLCByZXZlcnNlKSB7XHJcbiAgICByZXZlcnNlID0gcmV2ZXJzZSA/IC0xIDogMTtcclxuICAgIHZhciBkYXRlVGltZXpvbmVPZmZzZXQgPSBkYXRlLmdldFRpbWV6b25lT2Zmc2V0KCk7XHJcbiAgICB2YXIgdGltZXpvbmVPZmZzZXQgPSB0aW1lem9uZVRvT2Zmc2V0KHRpbWV6b25lLCBkYXRlVGltZXpvbmVPZmZzZXQpO1xyXG4gICAgcmV0dXJuIGFkZERhdGVNaW51dGVzKGRhdGUsIHJldmVyc2UgKiAodGltZXpvbmVPZmZzZXQgLSBkYXRlVGltZXpvbmVPZmZzZXQpKTtcclxuICB9XHJcbn1dKTtcclxuXHJcbi8vIEF2b2lkaW5nIHVzZSBvZiBuZy1jbGFzcyBhcyBpdCBjcmVhdGVzIGEgbG90IG9mIHdhdGNoZXJzIHdoZW4gYSBjbGFzcyBpcyB0byBiZSBhcHBsaWVkIHRvXHJcbi8vIGF0IG1vc3Qgb25lIGVsZW1lbnQuXHJcbmFuZ3VsYXIubW9kdWxlKCd1aS5ib290c3RyYXAuaXNDbGFzcycsIFtdKVxyXG4uZGlyZWN0aXZlKCd1aWJJc0NsYXNzJywgW1xyXG4gICAgICAgICAnJGFuaW1hdGUnLFxyXG5mdW5jdGlvbiAoJGFuaW1hdGUpIHtcclxuICAvLyAgICAgICAgICAgICAgICAgICAgMTExMTExMTEgICAgICAgICAgMjIyMjIyMjJcclxuICB2YXIgT05fUkVHRVhQID0gL15cXHMqKFtcXHNcXFNdKz8pXFxzK29uXFxzKyhbXFxzXFxTXSs/KVxccyokLztcclxuICAvLyAgICAgICAgICAgICAgICAgICAgMTExMTExMTEgICAgICAgICAgIDIyMjIyMjIyXHJcbiAgdmFyIElTX1JFR0VYUCA9IC9eXFxzKihbXFxzXFxTXSs/KVxccytmb3JcXHMrKFtcXHNcXFNdKz8pXFxzKiQvO1xyXG5cclxuICB2YXIgZGF0YVBlclRyYWNrZWQgPSB7fTtcclxuXHJcbiAgcmV0dXJuIHtcclxuICAgIHJlc3RyaWN0OiAnQScsXHJcbiAgICBjb21waWxlOiBmdW5jdGlvbih0RWxlbWVudCwgdEF0dHJzKSB7XHJcbiAgICAgIHZhciBsaW5rZWRTY29wZXMgPSBbXTtcclxuICAgICAgdmFyIGluc3RhbmNlcyA9IFtdO1xyXG4gICAgICB2YXIgZXhwVG9EYXRhID0ge307XHJcbiAgICAgIHZhciBsYXN0QWN0aXZhdGVkID0gbnVsbDtcclxuICAgICAgdmFyIG9uRXhwTWF0Y2hlcyA9IHRBdHRycy51aWJJc0NsYXNzLm1hdGNoKE9OX1JFR0VYUCk7XHJcbiAgICAgIHZhciBvbkV4cCA9IG9uRXhwTWF0Y2hlc1syXTtcclxuICAgICAgdmFyIGV4cHNTdHIgPSBvbkV4cE1hdGNoZXNbMV07XHJcbiAgICAgIHZhciBleHBzID0gZXhwc1N0ci5zcGxpdCgnLCcpO1xyXG5cclxuICAgICAgcmV0dXJuIGxpbmtGbjtcclxuXHJcbiAgICAgIGZ1bmN0aW9uIGxpbmtGbihzY29wZSwgZWxlbWVudCwgYXR0cnMpIHtcclxuICAgICAgICBsaW5rZWRTY29wZXMucHVzaChzY29wZSk7XHJcbiAgICAgICAgaW5zdGFuY2VzLnB1c2goe1xyXG4gICAgICAgICAgc2NvcGU6IHNjb3BlLFxyXG4gICAgICAgICAgZWxlbWVudDogZWxlbWVudFxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBleHBzLmZvckVhY2goZnVuY3Rpb24oZXhwLCBrKSB7XHJcbiAgICAgICAgICBhZGRGb3JFeHAoZXhwLCBzY29wZSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHNjb3BlLiRvbignJGRlc3Ryb3knLCByZW1vdmVTY29wZSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGZ1bmN0aW9uIGFkZEZvckV4cChleHAsIHNjb3BlKSB7XHJcbiAgICAgICAgdmFyIG1hdGNoZXMgPSBleHAubWF0Y2goSVNfUkVHRVhQKTtcclxuICAgICAgICB2YXIgY2xhenogPSBzY29wZS4kZXZhbChtYXRjaGVzWzFdKTtcclxuICAgICAgICB2YXIgY29tcGFyZVdpdGhFeHAgPSBtYXRjaGVzWzJdO1xyXG4gICAgICAgIHZhciBkYXRhID0gZXhwVG9EYXRhW2V4cF07XHJcbiAgICAgICAgaWYgKCFkYXRhKSB7XHJcbiAgICAgICAgICB2YXIgd2F0Y2hGbiA9IGZ1bmN0aW9uKGNvbXBhcmVXaXRoVmFsKSB7XHJcbiAgICAgICAgICAgIHZhciBuZXdBY3RpdmF0ZWQgPSBudWxsO1xyXG4gICAgICAgICAgICBpbnN0YW5jZXMuc29tZShmdW5jdGlvbihpbnN0YW5jZSkge1xyXG4gICAgICAgICAgICAgIHZhciB0aGlzVmFsID0gaW5zdGFuY2Uuc2NvcGUuJGV2YWwob25FeHApO1xyXG4gICAgICAgICAgICAgIGlmICh0aGlzVmFsID09PSBjb21wYXJlV2l0aFZhbCkge1xyXG4gICAgICAgICAgICAgICAgbmV3QWN0aXZhdGVkID0gaW5zdGFuY2U7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBpZiAoZGF0YS5sYXN0QWN0aXZhdGVkICE9PSBuZXdBY3RpdmF0ZWQpIHtcclxuICAgICAgICAgICAgICBpZiAoZGF0YS5sYXN0QWN0aXZhdGVkKSB7XHJcbiAgICAgICAgICAgICAgICAkYW5pbWF0ZS5yZW1vdmVDbGFzcyhkYXRhLmxhc3RBY3RpdmF0ZWQuZWxlbWVudCwgY2xhenopO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICBpZiAobmV3QWN0aXZhdGVkKSB7XHJcbiAgICAgICAgICAgICAgICAkYW5pbWF0ZS5hZGRDbGFzcyhuZXdBY3RpdmF0ZWQuZWxlbWVudCwgY2xhenopO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICBkYXRhLmxhc3RBY3RpdmF0ZWQgPSBuZXdBY3RpdmF0ZWQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH07XHJcbiAgICAgICAgICBleHBUb0RhdGFbZXhwXSA9IGRhdGEgPSB7XHJcbiAgICAgICAgICAgIGxhc3RBY3RpdmF0ZWQ6IG51bGwsXHJcbiAgICAgICAgICAgIHNjb3BlOiBzY29wZSxcclxuICAgICAgICAgICAgd2F0Y2hGbjogd2F0Y2hGbixcclxuICAgICAgICAgICAgY29tcGFyZVdpdGhFeHA6IGNvbXBhcmVXaXRoRXhwLFxyXG4gICAgICAgICAgICB3YXRjaGVyOiBzY29wZS4kd2F0Y2goY29tcGFyZVdpdGhFeHAsIHdhdGNoRm4pXHJcbiAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgICAgICBkYXRhLndhdGNoRm4oc2NvcGUuJGV2YWwoY29tcGFyZVdpdGhFeHApKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgZnVuY3Rpb24gcmVtb3ZlU2NvcGUoZSkge1xyXG4gICAgICAgIHZhciByZW1vdmVkU2NvcGUgPSBlLnRhcmdldFNjb3BlO1xyXG4gICAgICAgIHZhciBpbmRleCA9IGxpbmtlZFNjb3Blcy5pbmRleE9mKHJlbW92ZWRTY29wZSk7XHJcbiAgICAgICAgbGlua2VkU2NvcGVzLnNwbGljZShpbmRleCwgMSk7XHJcbiAgICAgICAgaW5zdGFuY2VzLnNwbGljZShpbmRleCwgMSk7XHJcbiAgICAgICAgaWYgKGxpbmtlZFNjb3Blcy5sZW5ndGgpIHtcclxuICAgICAgICAgIHZhciBuZXdXYXRjaFNjb3BlID0gbGlua2VkU2NvcGVzWzBdO1xyXG4gICAgICAgICAgYW5ndWxhci5mb3JFYWNoKGV4cFRvRGF0YSwgZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgICAgICAgICBpZiAoZGF0YS5zY29wZSA9PT0gcmVtb3ZlZFNjb3BlKSB7XHJcbiAgICAgICAgICAgICAgZGF0YS53YXRjaGVyID0gbmV3V2F0Y2hTY29wZS4kd2F0Y2goZGF0YS5jb21wYXJlV2l0aEV4cCwgZGF0YS53YXRjaEZuKTtcclxuICAgICAgICAgICAgICBkYXRhLnNjb3BlID0gbmV3V2F0Y2hTY29wZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGV4cFRvRGF0YSA9IHt9O1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH07XHJcbn1dKTtcclxuYW5ndWxhci5tb2R1bGUoJ3VpLmJvb3RzdHJhcC5kYXRlcGlja2VyJywgWyd1aS5ib290c3RyYXAuZGF0ZXBhcnNlcicsICd1aS5ib290c3RyYXAuaXNDbGFzcyddKVxyXG5cclxuLnZhbHVlKCckZGF0ZXBpY2tlclN1cHByZXNzRXJyb3InLCBmYWxzZSlcclxuXHJcbi52YWx1ZSgnJGRhdGVwaWNrZXJMaXRlcmFsV2FybmluZycsIHRydWUpXHJcblxyXG4uY29uc3RhbnQoJ3VpYkRhdGVwaWNrZXJDb25maWcnLCB7XHJcbiAgZGF0ZXBpY2tlck1vZGU6ICdkYXknLFxyXG4gIGZvcm1hdERheTogJ2RkJyxcclxuICBmb3JtYXRNb250aDogJ01NTU0nLFxyXG4gIGZvcm1hdFllYXI6ICd5eXl5JyxcclxuICBmb3JtYXREYXlIZWFkZXI6ICdFRUUnLFxyXG4gIGZvcm1hdERheVRpdGxlOiAnTU1NTSB5eXl5JyxcclxuICBmb3JtYXRNb250aFRpdGxlOiAneXl5eScsXHJcbiAgbWF4RGF0ZTogbnVsbCxcclxuICBtYXhNb2RlOiAneWVhcicsXHJcbiAgbWluRGF0ZTogbnVsbCxcclxuICBtaW5Nb2RlOiAnZGF5JyxcclxuICBtb250aENvbHVtbnM6IDMsXHJcbiAgbmdNb2RlbE9wdGlvbnM6IHt9LFxyXG4gIHNob3J0Y3V0UHJvcGFnYXRpb246IGZhbHNlLFxyXG4gIHNob3dXZWVrczogdHJ1ZSxcclxuICB5ZWFyQ29sdW1uczogNSxcclxuICB5ZWFyUm93czogNFxyXG59KVxyXG5cclxuLmNvbnRyb2xsZXIoJ1VpYkRhdGVwaWNrZXJDb250cm9sbGVyJywgWyckc2NvcGUnLCAnJGVsZW1lbnQnLCAnJGF0dHJzJywgJyRwYXJzZScsICckaW50ZXJwb2xhdGUnLCAnJGxvY2FsZScsICckbG9nJywgJ2RhdGVGaWx0ZXInLCAndWliRGF0ZXBpY2tlckNvbmZpZycsICckZGF0ZXBpY2tlckxpdGVyYWxXYXJuaW5nJywgJyRkYXRlcGlja2VyU3VwcHJlc3NFcnJvcicsICd1aWJEYXRlUGFyc2VyJyxcclxuICBmdW5jdGlvbigkc2NvcGUsICRlbGVtZW50LCAkYXR0cnMsICRwYXJzZSwgJGludGVycG9sYXRlLCAkbG9jYWxlLCAkbG9nLCBkYXRlRmlsdGVyLCBkYXRlcGlja2VyQ29uZmlnLCAkZGF0ZXBpY2tlckxpdGVyYWxXYXJuaW5nLCAkZGF0ZXBpY2tlclN1cHByZXNzRXJyb3IsIGRhdGVQYXJzZXIpIHtcclxuICB2YXIgc2VsZiA9IHRoaXMsXHJcbiAgICAgIG5nTW9kZWxDdHJsID0geyAkc2V0Vmlld1ZhbHVlOiBhbmd1bGFyLm5vb3AgfSwgLy8gbnVsbE1vZGVsQ3RybDtcclxuICAgICAgbmdNb2RlbE9wdGlvbnMgPSB7fSxcclxuICAgICAgd2F0Y2hMaXN0ZW5lcnMgPSBbXTtcclxuXHJcbiAgJGVsZW1lbnQuYWRkQ2xhc3MoJ3VpYi1kYXRlcGlja2VyJyk7XHJcbiAgJGF0dHJzLiRzZXQoJ3JvbGUnLCAnYXBwbGljYXRpb24nKTtcclxuXHJcbiAgaWYgKCEkc2NvcGUuZGF0ZXBpY2tlck9wdGlvbnMpIHtcclxuICAgICRzY29wZS5kYXRlcGlja2VyT3B0aW9ucyA9IHt9O1xyXG4gIH1cclxuXHJcbiAgLy8gTW9kZXMgY2hhaW5cclxuICB0aGlzLm1vZGVzID0gWydkYXknLCAnbW9udGgnLCAneWVhciddO1xyXG5cclxuICBbXHJcbiAgICAnY3VzdG9tQ2xhc3MnLFxyXG4gICAgJ2RhdGVEaXNhYmxlZCcsXHJcbiAgICAnZGF0ZXBpY2tlck1vZGUnLFxyXG4gICAgJ2Zvcm1hdERheScsXHJcbiAgICAnZm9ybWF0RGF5SGVhZGVyJyxcclxuICAgICdmb3JtYXREYXlUaXRsZScsXHJcbiAgICAnZm9ybWF0TW9udGgnLFxyXG4gICAgJ2Zvcm1hdE1vbnRoVGl0bGUnLFxyXG4gICAgJ2Zvcm1hdFllYXInLFxyXG4gICAgJ21heERhdGUnLFxyXG4gICAgJ21heE1vZGUnLFxyXG4gICAgJ21pbkRhdGUnLFxyXG4gICAgJ21pbk1vZGUnLFxyXG4gICAgJ21vbnRoQ29sdW1ucycsXHJcbiAgICAnc2hvd1dlZWtzJyxcclxuICAgICdzaG9ydGN1dFByb3BhZ2F0aW9uJyxcclxuICAgICdzdGFydGluZ0RheScsXHJcbiAgICAneWVhckNvbHVtbnMnLFxyXG4gICAgJ3llYXJSb3dzJ1xyXG4gIF0uZm9yRWFjaChmdW5jdGlvbihrZXkpIHtcclxuICAgIHN3aXRjaCAoa2V5KSB7XHJcbiAgICAgIGNhc2UgJ2N1c3RvbUNsYXNzJzpcclxuICAgICAgY2FzZSAnZGF0ZURpc2FibGVkJzpcclxuICAgICAgICAkc2NvcGVba2V5XSA9ICRzY29wZS5kYXRlcGlja2VyT3B0aW9uc1trZXldIHx8IGFuZ3VsYXIubm9vcDtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAnZGF0ZXBpY2tlck1vZGUnOlxyXG4gICAgICAgICRzY29wZS5kYXRlcGlja2VyTW9kZSA9IGFuZ3VsYXIuaXNEZWZpbmVkKCRzY29wZS5kYXRlcGlja2VyT3B0aW9ucy5kYXRlcGlja2VyTW9kZSkgP1xyXG4gICAgICAgICAgJHNjb3BlLmRhdGVwaWNrZXJPcHRpb25zLmRhdGVwaWNrZXJNb2RlIDogZGF0ZXBpY2tlckNvbmZpZy5kYXRlcGlja2VyTW9kZTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAnZm9ybWF0RGF5JzpcclxuICAgICAgY2FzZSAnZm9ybWF0RGF5SGVhZGVyJzpcclxuICAgICAgY2FzZSAnZm9ybWF0RGF5VGl0bGUnOlxyXG4gICAgICBjYXNlICdmb3JtYXRNb250aCc6XHJcbiAgICAgIGNhc2UgJ2Zvcm1hdE1vbnRoVGl0bGUnOlxyXG4gICAgICBjYXNlICdmb3JtYXRZZWFyJzpcclxuICAgICAgICBzZWxmW2tleV0gPSBhbmd1bGFyLmlzRGVmaW5lZCgkc2NvcGUuZGF0ZXBpY2tlck9wdGlvbnNba2V5XSkgP1xyXG4gICAgICAgICAgJGludGVycG9sYXRlKCRzY29wZS5kYXRlcGlja2VyT3B0aW9uc1trZXldKSgkc2NvcGUuJHBhcmVudCkgOlxyXG4gICAgICAgICAgZGF0ZXBpY2tlckNvbmZpZ1trZXldO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlICdtb250aENvbHVtbnMnOlxyXG4gICAgICBjYXNlICdzaG93V2Vla3MnOlxyXG4gICAgICBjYXNlICdzaG9ydGN1dFByb3BhZ2F0aW9uJzpcclxuICAgICAgY2FzZSAneWVhckNvbHVtbnMnOlxyXG4gICAgICBjYXNlICd5ZWFyUm93cyc6XHJcbiAgICAgICAgc2VsZltrZXldID0gYW5ndWxhci5pc0RlZmluZWQoJHNjb3BlLmRhdGVwaWNrZXJPcHRpb25zW2tleV0pID9cclxuICAgICAgICAgICRzY29wZS5kYXRlcGlja2VyT3B0aW9uc1trZXldIDogZGF0ZXBpY2tlckNvbmZpZ1trZXldO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlICdzdGFydGluZ0RheSc6XHJcbiAgICAgICAgaWYgKGFuZ3VsYXIuaXNEZWZpbmVkKCRzY29wZS5kYXRlcGlja2VyT3B0aW9ucy5zdGFydGluZ0RheSkpIHtcclxuICAgICAgICAgIHNlbGYuc3RhcnRpbmdEYXkgPSAkc2NvcGUuZGF0ZXBpY2tlck9wdGlvbnMuc3RhcnRpbmdEYXk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChhbmd1bGFyLmlzTnVtYmVyKGRhdGVwaWNrZXJDb25maWcuc3RhcnRpbmdEYXkpKSB7XHJcbiAgICAgICAgICBzZWxmLnN0YXJ0aW5nRGF5ID0gZGF0ZXBpY2tlckNvbmZpZy5zdGFydGluZ0RheTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgc2VsZi5zdGFydGluZ0RheSA9ICgkbG9jYWxlLkRBVEVUSU1FX0ZPUk1BVFMuRklSU1REQVlPRldFRUsgKyA4KSAlIDc7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAnbWF4RGF0ZSc6XHJcbiAgICAgIGNhc2UgJ21pbkRhdGUnOlxyXG4gICAgICAgICRzY29wZS4kd2F0Y2goJ2RhdGVwaWNrZXJPcHRpb25zLicgKyBrZXksIGZ1bmN0aW9uKHZhbHVlKSB7XHJcbiAgICAgICAgICBpZiAodmFsdWUpIHtcclxuICAgICAgICAgICAgaWYgKGFuZ3VsYXIuaXNEYXRlKHZhbHVlKSkge1xyXG4gICAgICAgICAgICAgIHNlbGZba2V5XSA9IGRhdGVQYXJzZXIuZnJvbVRpbWV6b25lKG5ldyBEYXRlKHZhbHVlKSwgbmdNb2RlbE9wdGlvbnMudGltZXpvbmUpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIGlmICgkZGF0ZXBpY2tlckxpdGVyYWxXYXJuaW5nKSB7XHJcbiAgICAgICAgICAgICAgICAkbG9nLndhcm4oJ0xpdGVyYWwgZGF0ZSBzdXBwb3J0IGhhcyBiZWVuIGRlcHJlY2F0ZWQsIHBsZWFzZSBzd2l0Y2ggdG8gZGF0ZSBvYmplY3QgdXNhZ2UnKTtcclxuICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgIHNlbGZba2V5XSA9IG5ldyBEYXRlKGRhdGVGaWx0ZXIodmFsdWUsICdtZWRpdW0nKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHNlbGZba2V5XSA9IGRhdGVwaWNrZXJDb25maWdba2V5XSA/XHJcbiAgICAgICAgICAgICAgZGF0ZVBhcnNlci5mcm9tVGltZXpvbmUobmV3IERhdGUoZGF0ZXBpY2tlckNvbmZpZ1trZXldKSwgbmdNb2RlbE9wdGlvbnMudGltZXpvbmUpIDpcclxuICAgICAgICAgICAgICBudWxsO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIHNlbGYucmVmcmVzaFZpZXcoKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgJ21heE1vZGUnOlxyXG4gICAgICBjYXNlICdtaW5Nb2RlJzpcclxuICAgICAgICBpZiAoJHNjb3BlLmRhdGVwaWNrZXJPcHRpb25zW2tleV0pIHtcclxuICAgICAgICAgICRzY29wZS4kd2F0Y2goZnVuY3Rpb24oKSB7IHJldHVybiAkc2NvcGUuZGF0ZXBpY2tlck9wdGlvbnNba2V5XTsgfSwgZnVuY3Rpb24odmFsdWUpIHtcclxuICAgICAgICAgICAgc2VsZltrZXldID0gJHNjb3BlW2tleV0gPSBhbmd1bGFyLmlzRGVmaW5lZCh2YWx1ZSkgPyB2YWx1ZSA6ICRzY29wZS5kYXRlcGlja2VyT3B0aW9uc1trZXldO1xyXG4gICAgICAgICAgICBpZiAoa2V5ID09PSAnbWluTW9kZScgJiYgc2VsZi5tb2Rlcy5pbmRleE9mKCRzY29wZS5kYXRlcGlja2VyT3B0aW9ucy5kYXRlcGlja2VyTW9kZSkgPCBzZWxmLm1vZGVzLmluZGV4T2Yoc2VsZltrZXldKSB8fFxyXG4gICAgICAgICAgICAgIGtleSA9PT0gJ21heE1vZGUnICYmIHNlbGYubW9kZXMuaW5kZXhPZigkc2NvcGUuZGF0ZXBpY2tlck9wdGlvbnMuZGF0ZXBpY2tlck1vZGUpID4gc2VsZi5tb2Rlcy5pbmRleE9mKHNlbGZba2V5XSkpIHtcclxuICAgICAgICAgICAgICAkc2NvcGUuZGF0ZXBpY2tlck1vZGUgPSBzZWxmW2tleV07XHJcbiAgICAgICAgICAgICAgJHNjb3BlLmRhdGVwaWNrZXJPcHRpb25zLmRhdGVwaWNrZXJNb2RlID0gc2VsZltrZXldO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgc2VsZltrZXldID0gJHNjb3BlW2tleV0gPSBkYXRlcGlja2VyQ29uZmlnW2tleV0gfHwgbnVsbDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG4gIH0pO1xyXG5cclxuICAkc2NvcGUudW5pcXVlSWQgPSAnZGF0ZXBpY2tlci0nICsgJHNjb3BlLiRpZCArICctJyArIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDEwMDAwKTtcclxuXHJcbiAgJHNjb3BlLmRpc2FibGVkID0gYW5ndWxhci5pc0RlZmluZWQoJGF0dHJzLmRpc2FibGVkKSB8fCBmYWxzZTtcclxuICBpZiAoYW5ndWxhci5pc0RlZmluZWQoJGF0dHJzLm5nRGlzYWJsZWQpKSB7XHJcbiAgICB3YXRjaExpc3RlbmVycy5wdXNoKCRzY29wZS4kcGFyZW50LiR3YXRjaCgkYXR0cnMubmdEaXNhYmxlZCwgZnVuY3Rpb24oZGlzYWJsZWQpIHtcclxuICAgICAgJHNjb3BlLmRpc2FibGVkID0gZGlzYWJsZWQ7XHJcbiAgICAgIHNlbGYucmVmcmVzaFZpZXcoKTtcclxuICAgIH0pKTtcclxuICB9XHJcblxyXG4gICRzY29wZS5pc0FjdGl2ZSA9IGZ1bmN0aW9uKGRhdGVPYmplY3QpIHtcclxuICAgIGlmIChzZWxmLmNvbXBhcmUoZGF0ZU9iamVjdC5kYXRlLCBzZWxmLmFjdGl2ZURhdGUpID09PSAwKSB7XHJcbiAgICAgICRzY29wZS5hY3RpdmVEYXRlSWQgPSBkYXRlT2JqZWN0LnVpZDtcclxuICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfTtcclxuXHJcbiAgdGhpcy5pbml0ID0gZnVuY3Rpb24obmdNb2RlbEN0cmxfKSB7XHJcbiAgICBuZ01vZGVsQ3RybCA9IG5nTW9kZWxDdHJsXztcclxuICAgIG5nTW9kZWxPcHRpb25zID0gbmdNb2RlbEN0cmxfLiRvcHRpb25zIHx8XHJcbiAgICAgICRzY29wZS5kYXRlcGlja2VyT3B0aW9ucy5uZ01vZGVsT3B0aW9ucyB8fFxyXG4gICAgICBkYXRlcGlja2VyQ29uZmlnLm5nTW9kZWxPcHRpb25zO1xyXG4gICAgaWYgKCRzY29wZS5kYXRlcGlja2VyT3B0aW9ucy5pbml0RGF0ZSkge1xyXG4gICAgICBzZWxmLmFjdGl2ZURhdGUgPSBkYXRlUGFyc2VyLmZyb21UaW1lem9uZSgkc2NvcGUuZGF0ZXBpY2tlck9wdGlvbnMuaW5pdERhdGUsIG5nTW9kZWxPcHRpb25zLnRpbWV6b25lKSB8fCBuZXcgRGF0ZSgpO1xyXG4gICAgICAkc2NvcGUuJHdhdGNoKCdkYXRlcGlja2VyT3B0aW9ucy5pbml0RGF0ZScsIGZ1bmN0aW9uKGluaXREYXRlKSB7XHJcbiAgICAgICAgaWYgKGluaXREYXRlICYmIChuZ01vZGVsQ3RybC4kaXNFbXB0eShuZ01vZGVsQ3RybC4kbW9kZWxWYWx1ZSkgfHwgbmdNb2RlbEN0cmwuJGludmFsaWQpKSB7XHJcbiAgICAgICAgICBzZWxmLmFjdGl2ZURhdGUgPSBkYXRlUGFyc2VyLmZyb21UaW1lem9uZShpbml0RGF0ZSwgbmdNb2RlbE9wdGlvbnMudGltZXpvbmUpO1xyXG4gICAgICAgICAgc2VsZi5yZWZyZXNoVmlldygpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBzZWxmLmFjdGl2ZURhdGUgPSBuZXcgRGF0ZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBkYXRlID0gbmdNb2RlbEN0cmwuJG1vZGVsVmFsdWUgPyBuZXcgRGF0ZShuZ01vZGVsQ3RybC4kbW9kZWxWYWx1ZSkgOiBuZXcgRGF0ZSgpO1xyXG4gICAgdGhpcy5hY3RpdmVEYXRlID0gIWlzTmFOKGRhdGUpID9cclxuICAgICAgZGF0ZVBhcnNlci5mcm9tVGltZXpvbmUoZGF0ZSwgbmdNb2RlbE9wdGlvbnMudGltZXpvbmUpIDpcclxuICAgICAgZGF0ZVBhcnNlci5mcm9tVGltZXpvbmUobmV3IERhdGUoKSwgbmdNb2RlbE9wdGlvbnMudGltZXpvbmUpO1xyXG5cclxuICAgIG5nTW9kZWxDdHJsLiRyZW5kZXIgPSBmdW5jdGlvbigpIHtcclxuICAgICAgc2VsZi5yZW5kZXIoKTtcclxuICAgIH07XHJcbiAgfTtcclxuXHJcbiAgdGhpcy5yZW5kZXIgPSBmdW5jdGlvbigpIHtcclxuICAgIGlmIChuZ01vZGVsQ3RybC4kdmlld1ZhbHVlKSB7XHJcbiAgICAgIHZhciBkYXRlID0gbmV3IERhdGUobmdNb2RlbEN0cmwuJHZpZXdWYWx1ZSksXHJcbiAgICAgICAgICBpc1ZhbGlkID0gIWlzTmFOKGRhdGUpO1xyXG5cclxuICAgICAgaWYgKGlzVmFsaWQpIHtcclxuICAgICAgICB0aGlzLmFjdGl2ZURhdGUgPSBkYXRlUGFyc2VyLmZyb21UaW1lem9uZShkYXRlLCBuZ01vZGVsT3B0aW9ucy50aW1lem9uZSk7XHJcbiAgICAgIH0gZWxzZSBpZiAoISRkYXRlcGlja2VyU3VwcHJlc3NFcnJvcikge1xyXG4gICAgICAgICRsb2cuZXJyb3IoJ0RhdGVwaWNrZXIgZGlyZWN0aXZlOiBcIm5nLW1vZGVsXCIgdmFsdWUgbXVzdCBiZSBhIERhdGUgb2JqZWN0Jyk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHRoaXMucmVmcmVzaFZpZXcoKTtcclxuICB9O1xyXG5cclxuICB0aGlzLnJlZnJlc2hWaWV3ID0gZnVuY3Rpb24oKSB7XHJcbiAgICBpZiAodGhpcy5lbGVtZW50KSB7XHJcbiAgICAgICRzY29wZS5zZWxlY3RlZER0ID0gbnVsbDtcclxuICAgICAgdGhpcy5fcmVmcmVzaFZpZXcoKTtcclxuICAgICAgaWYgKCRzY29wZS5hY3RpdmVEdCkge1xyXG4gICAgICAgICRzY29wZS5hY3RpdmVEYXRlSWQgPSAkc2NvcGUuYWN0aXZlRHQudWlkO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB2YXIgZGF0ZSA9IG5nTW9kZWxDdHJsLiR2aWV3VmFsdWUgPyBuZXcgRGF0ZShuZ01vZGVsQ3RybC4kdmlld1ZhbHVlKSA6IG51bGw7XHJcbiAgICAgIGRhdGUgPSBkYXRlUGFyc2VyLmZyb21UaW1lem9uZShkYXRlLCBuZ01vZGVsT3B0aW9ucy50aW1lem9uZSk7XHJcbiAgICAgIG5nTW9kZWxDdHJsLiRzZXRWYWxpZGl0eSgnZGF0ZURpc2FibGVkJywgIWRhdGUgfHxcclxuICAgICAgICB0aGlzLmVsZW1lbnQgJiYgIXRoaXMuaXNEaXNhYmxlZChkYXRlKSk7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgdGhpcy5jcmVhdGVEYXRlT2JqZWN0ID0gZnVuY3Rpb24oZGF0ZSwgZm9ybWF0KSB7XHJcbiAgICB2YXIgbW9kZWwgPSBuZ01vZGVsQ3RybC4kdmlld1ZhbHVlID8gbmV3IERhdGUobmdNb2RlbEN0cmwuJHZpZXdWYWx1ZSkgOiBudWxsO1xyXG4gICAgbW9kZWwgPSBkYXRlUGFyc2VyLmZyb21UaW1lem9uZShtb2RlbCwgbmdNb2RlbE9wdGlvbnMudGltZXpvbmUpO1xyXG4gICAgdmFyIHRvZGF5ID0gbmV3IERhdGUoKTtcclxuICAgIHRvZGF5ID0gZGF0ZVBhcnNlci5mcm9tVGltZXpvbmUodG9kYXksIG5nTW9kZWxPcHRpb25zLnRpbWV6b25lKTtcclxuICAgIHZhciB0aW1lID0gdGhpcy5jb21wYXJlKGRhdGUsIHRvZGF5KTtcclxuICAgIHZhciBkdCA9IHtcclxuICAgICAgZGF0ZTogZGF0ZSxcclxuICAgICAgbGFiZWw6IGRhdGVQYXJzZXIuZmlsdGVyKGRhdGUsIGZvcm1hdCksXHJcbiAgICAgIHNlbGVjdGVkOiBtb2RlbCAmJiB0aGlzLmNvbXBhcmUoZGF0ZSwgbW9kZWwpID09PSAwLFxyXG4gICAgICBkaXNhYmxlZDogdGhpcy5pc0Rpc2FibGVkKGRhdGUpLFxyXG4gICAgICBwYXN0OiB0aW1lIDwgMCxcclxuICAgICAgY3VycmVudDogdGltZSA9PT0gMCxcclxuICAgICAgZnV0dXJlOiB0aW1lID4gMCxcclxuICAgICAgY3VzdG9tQ2xhc3M6IHRoaXMuY3VzdG9tQ2xhc3MoZGF0ZSkgfHwgbnVsbFxyXG4gICAgfTtcclxuXHJcbiAgICBpZiAobW9kZWwgJiYgdGhpcy5jb21wYXJlKGRhdGUsIG1vZGVsKSA9PT0gMCkge1xyXG4gICAgICAkc2NvcGUuc2VsZWN0ZWREdCA9IGR0O1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChzZWxmLmFjdGl2ZURhdGUgJiYgdGhpcy5jb21wYXJlKGR0LmRhdGUsIHNlbGYuYWN0aXZlRGF0ZSkgPT09IDApIHtcclxuICAgICAgJHNjb3BlLmFjdGl2ZUR0ID0gZHQ7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGR0O1xyXG4gIH07XHJcblxyXG4gIHRoaXMuaXNEaXNhYmxlZCA9IGZ1bmN0aW9uKGRhdGUpIHtcclxuICAgIHJldHVybiAkc2NvcGUuZGlzYWJsZWQgfHxcclxuICAgICAgdGhpcy5taW5EYXRlICYmIHRoaXMuY29tcGFyZShkYXRlLCB0aGlzLm1pbkRhdGUpIDwgMCB8fFxyXG4gICAgICB0aGlzLm1heERhdGUgJiYgdGhpcy5jb21wYXJlKGRhdGUsIHRoaXMubWF4RGF0ZSkgPiAwIHx8XHJcbiAgICAgICRzY29wZS5kYXRlRGlzYWJsZWQgJiYgJHNjb3BlLmRhdGVEaXNhYmxlZCh7ZGF0ZTogZGF0ZSwgbW9kZTogJHNjb3BlLmRhdGVwaWNrZXJNb2RlfSk7XHJcbiAgfTtcclxuXHJcbiAgdGhpcy5jdXN0b21DbGFzcyA9IGZ1bmN0aW9uKGRhdGUpIHtcclxuICAgIHJldHVybiAkc2NvcGUuY3VzdG9tQ2xhc3Moe2RhdGU6IGRhdGUsIG1vZGU6ICRzY29wZS5kYXRlcGlja2VyTW9kZX0pO1xyXG4gIH07XHJcblxyXG4gIC8vIFNwbGl0IGFycmF5IGludG8gc21hbGxlciBhcnJheXNcclxuICB0aGlzLnNwbGl0ID0gZnVuY3Rpb24oYXJyLCBzaXplKSB7XHJcbiAgICB2YXIgYXJyYXlzID0gW107XHJcbiAgICB3aGlsZSAoYXJyLmxlbmd0aCA+IDApIHtcclxuICAgICAgYXJyYXlzLnB1c2goYXJyLnNwbGljZSgwLCBzaXplKSk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gYXJyYXlzO1xyXG4gIH07XHJcblxyXG4gICRzY29wZS5zZWxlY3QgPSBmdW5jdGlvbihkYXRlKSB7XHJcbiAgICBpZiAoJHNjb3BlLmRhdGVwaWNrZXJNb2RlID09PSBzZWxmLm1pbk1vZGUpIHtcclxuICAgICAgdmFyIGR0ID0gbmdNb2RlbEN0cmwuJHZpZXdWYWx1ZSA/IGRhdGVQYXJzZXIuZnJvbVRpbWV6b25lKG5ldyBEYXRlKG5nTW9kZWxDdHJsLiR2aWV3VmFsdWUpLCBuZ01vZGVsT3B0aW9ucy50aW1lem9uZSkgOiBuZXcgRGF0ZSgwLCAwLCAwLCAwLCAwLCAwLCAwKTtcclxuICAgICAgZHQuc2V0RnVsbFllYXIoZGF0ZS5nZXRGdWxsWWVhcigpLCBkYXRlLmdldE1vbnRoKCksIGRhdGUuZ2V0RGF0ZSgpKTtcclxuICAgICAgZHQgPSBkYXRlUGFyc2VyLnRvVGltZXpvbmUoZHQsIG5nTW9kZWxPcHRpb25zLnRpbWV6b25lKTtcclxuICAgICAgbmdNb2RlbEN0cmwuJHNldFZpZXdWYWx1ZShkdCk7XHJcbiAgICAgIG5nTW9kZWxDdHJsLiRyZW5kZXIoKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHNlbGYuYWN0aXZlRGF0ZSA9IGRhdGU7XHJcbiAgICAgIHNldE1vZGUoc2VsZi5tb2Rlc1tzZWxmLm1vZGVzLmluZGV4T2YoJHNjb3BlLmRhdGVwaWNrZXJNb2RlKSAtIDFdKTtcclxuXHJcbiAgICAgICRzY29wZS4kZW1pdCgndWliOmRhdGVwaWNrZXIubW9kZScpO1xyXG4gICAgfVxyXG5cclxuICAgICRzY29wZS4kYnJvYWRjYXN0KCd1aWI6ZGF0ZXBpY2tlci5mb2N1cycpO1xyXG4gIH07XHJcblxyXG4gICRzY29wZS5tb3ZlID0gZnVuY3Rpb24oZGlyZWN0aW9uKSB7XHJcbiAgICB2YXIgeWVhciA9IHNlbGYuYWN0aXZlRGF0ZS5nZXRGdWxsWWVhcigpICsgZGlyZWN0aW9uICogKHNlbGYuc3RlcC55ZWFycyB8fCAwKSxcclxuICAgICAgICBtb250aCA9IHNlbGYuYWN0aXZlRGF0ZS5nZXRNb250aCgpICsgZGlyZWN0aW9uICogKHNlbGYuc3RlcC5tb250aHMgfHwgMCk7XHJcbiAgICBzZWxmLmFjdGl2ZURhdGUuc2V0RnVsbFllYXIoeWVhciwgbW9udGgsIDEpO1xyXG4gICAgc2VsZi5yZWZyZXNoVmlldygpO1xyXG4gIH07XHJcblxyXG4gICRzY29wZS50b2dnbGVNb2RlID0gZnVuY3Rpb24oZGlyZWN0aW9uKSB7XHJcbiAgICBkaXJlY3Rpb24gPSBkaXJlY3Rpb24gfHwgMTtcclxuXHJcbiAgICBpZiAoJHNjb3BlLmRhdGVwaWNrZXJNb2RlID09PSBzZWxmLm1heE1vZGUgJiYgZGlyZWN0aW9uID09PSAxIHx8XHJcbiAgICAgICRzY29wZS5kYXRlcGlja2VyTW9kZSA9PT0gc2VsZi5taW5Nb2RlICYmIGRpcmVjdGlvbiA9PT0gLTEpIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIHNldE1vZGUoc2VsZi5tb2Rlc1tzZWxmLm1vZGVzLmluZGV4T2YoJHNjb3BlLmRhdGVwaWNrZXJNb2RlKSArIGRpcmVjdGlvbl0pO1xyXG5cclxuICAgICRzY29wZS4kZW1pdCgndWliOmRhdGVwaWNrZXIubW9kZScpO1xyXG4gIH07XHJcblxyXG4gIC8vIEtleSBldmVudCBtYXBwZXJcclxuICAkc2NvcGUua2V5cyA9IHsgMTM6ICdlbnRlcicsIDMyOiAnc3BhY2UnLCAzMzogJ3BhZ2V1cCcsIDM0OiAncGFnZWRvd24nLCAzNTogJ2VuZCcsIDM2OiAnaG9tZScsIDM3OiAnbGVmdCcsIDM4OiAndXAnLCAzOTogJ3JpZ2h0JywgNDA6ICdkb3duJyB9O1xyXG5cclxuICB2YXIgZm9jdXNFbGVtZW50ID0gZnVuY3Rpb24oKSB7XHJcbiAgICBzZWxmLmVsZW1lbnRbMF0uZm9jdXMoKTtcclxuICB9O1xyXG5cclxuICAvLyBMaXN0ZW4gZm9yIGZvY3VzIHJlcXVlc3RzIGZyb20gcG9wdXAgZGlyZWN0aXZlXHJcbiAgJHNjb3BlLiRvbigndWliOmRhdGVwaWNrZXIuZm9jdXMnLCBmb2N1c0VsZW1lbnQpO1xyXG5cclxuICAkc2NvcGUua2V5ZG93biA9IGZ1bmN0aW9uKGV2dCkge1xyXG4gICAgdmFyIGtleSA9ICRzY29wZS5rZXlzW2V2dC53aGljaF07XHJcblxyXG4gICAgaWYgKCFrZXkgfHwgZXZ0LnNoaWZ0S2V5IHx8IGV2dC5hbHRLZXkgfHwgJHNjb3BlLmRpc2FibGVkKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBldnQucHJldmVudERlZmF1bHQoKTtcclxuICAgIGlmICghc2VsZi5zaG9ydGN1dFByb3BhZ2F0aW9uKSB7XHJcbiAgICAgIGV2dC5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoa2V5ID09PSAnZW50ZXInIHx8IGtleSA9PT0gJ3NwYWNlJykge1xyXG4gICAgICBpZiAoc2VsZi5pc0Rpc2FibGVkKHNlbGYuYWN0aXZlRGF0ZSkpIHtcclxuICAgICAgICByZXR1cm47IC8vIGRvIG5vdGhpbmdcclxuICAgICAgfVxyXG4gICAgICAkc2NvcGUuc2VsZWN0KHNlbGYuYWN0aXZlRGF0ZSk7XHJcbiAgICB9IGVsc2UgaWYgKGV2dC5jdHJsS2V5ICYmIChrZXkgPT09ICd1cCcgfHwga2V5ID09PSAnZG93bicpKSB7XHJcbiAgICAgICRzY29wZS50b2dnbGVNb2RlKGtleSA9PT0gJ3VwJyA/IDEgOiAtMSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBzZWxmLmhhbmRsZUtleURvd24oa2V5LCBldnQpO1xyXG4gICAgICBzZWxmLnJlZnJlc2hWaWV3KCk7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgJGVsZW1lbnQub24oJ2tleWRvd24nLCBmdW5jdGlvbihldnQpIHtcclxuICAgICRzY29wZS4kYXBwbHkoZnVuY3Rpb24oKSB7XHJcbiAgICAgICRzY29wZS5rZXlkb3duKGV2dCk7XHJcbiAgICB9KTtcclxuICB9KTtcclxuXHJcbiAgJHNjb3BlLiRvbignJGRlc3Ryb3knLCBmdW5jdGlvbigpIHtcclxuICAgIC8vQ2xlYXIgYWxsIHdhdGNoIGxpc3RlbmVycyBvbiBkZXN0cm95XHJcbiAgICB3aGlsZSAod2F0Y2hMaXN0ZW5lcnMubGVuZ3RoKSB7XHJcbiAgICAgIHdhdGNoTGlzdGVuZXJzLnNoaWZ0KCkoKTtcclxuICAgIH1cclxuICB9KTtcclxuXHJcbiAgZnVuY3Rpb24gc2V0TW9kZShtb2RlKSB7XHJcbiAgICAkc2NvcGUuZGF0ZXBpY2tlck1vZGUgPSBtb2RlO1xyXG4gICAgJHNjb3BlLmRhdGVwaWNrZXJPcHRpb25zLmRhdGVwaWNrZXJNb2RlID0gbW9kZTtcclxuICB9XHJcbn1dKVxyXG5cclxuLmNvbnRyb2xsZXIoJ1VpYkRheXBpY2tlckNvbnRyb2xsZXInLCBbJyRzY29wZScsICckZWxlbWVudCcsICdkYXRlRmlsdGVyJywgZnVuY3Rpb24oc2NvcGUsICRlbGVtZW50LCBkYXRlRmlsdGVyKSB7XHJcbiAgdmFyIERBWVNfSU5fTU9OVEggPSBbMzEsIDI4LCAzMSwgMzAsIDMxLCAzMCwgMzEsIDMxLCAzMCwgMzEsIDMwLCAzMV07XHJcblxyXG4gIHRoaXMuc3RlcCA9IHsgbW9udGhzOiAxIH07XHJcbiAgdGhpcy5lbGVtZW50ID0gJGVsZW1lbnQ7XHJcbiAgZnVuY3Rpb24gZ2V0RGF5c0luTW9udGgoeWVhciwgbW9udGgpIHtcclxuICAgIHJldHVybiBtb250aCA9PT0gMSAmJiB5ZWFyICUgNCA9PT0gMCAmJlxyXG4gICAgICAoeWVhciAlIDEwMCAhPT0gMCB8fCB5ZWFyICUgNDAwID09PSAwKSA/IDI5IDogREFZU19JTl9NT05USFttb250aF07XHJcbiAgfVxyXG5cclxuICB0aGlzLmluaXQgPSBmdW5jdGlvbihjdHJsKSB7XHJcbiAgICBhbmd1bGFyLmV4dGVuZChjdHJsLCB0aGlzKTtcclxuICAgIHNjb3BlLnNob3dXZWVrcyA9IGN0cmwuc2hvd1dlZWtzO1xyXG4gICAgY3RybC5yZWZyZXNoVmlldygpO1xyXG4gIH07XHJcblxyXG4gIHRoaXMuZ2V0RGF0ZXMgPSBmdW5jdGlvbihzdGFydERhdGUsIG4pIHtcclxuICAgIHZhciBkYXRlcyA9IG5ldyBBcnJheShuKSwgY3VycmVudCA9IG5ldyBEYXRlKHN0YXJ0RGF0ZSksIGkgPSAwLCBkYXRlO1xyXG4gICAgd2hpbGUgKGkgPCBuKSB7XHJcbiAgICAgIGRhdGUgPSBuZXcgRGF0ZShjdXJyZW50KTtcclxuICAgICAgZGF0ZXNbaSsrXSA9IGRhdGU7XHJcbiAgICAgIGN1cnJlbnQuc2V0RGF0ZShjdXJyZW50LmdldERhdGUoKSArIDEpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGRhdGVzO1xyXG4gIH07XHJcblxyXG4gIHRoaXMuX3JlZnJlc2hWaWV3ID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgeWVhciA9IHRoaXMuYWN0aXZlRGF0ZS5nZXRGdWxsWWVhcigpLFxyXG4gICAgICBtb250aCA9IHRoaXMuYWN0aXZlRGF0ZS5nZXRNb250aCgpLFxyXG4gICAgICBmaXJzdERheU9mTW9udGggPSBuZXcgRGF0ZSh0aGlzLmFjdGl2ZURhdGUpO1xyXG5cclxuICAgIGZpcnN0RGF5T2ZNb250aC5zZXRGdWxsWWVhcih5ZWFyLCBtb250aCwgMSk7XHJcblxyXG4gICAgdmFyIGRpZmZlcmVuY2UgPSB0aGlzLnN0YXJ0aW5nRGF5IC0gZmlyc3REYXlPZk1vbnRoLmdldERheSgpLFxyXG4gICAgICBudW1EaXNwbGF5ZWRGcm9tUHJldmlvdXNNb250aCA9IGRpZmZlcmVuY2UgPiAwID9cclxuICAgICAgICA3IC0gZGlmZmVyZW5jZSA6IC0gZGlmZmVyZW5jZSxcclxuICAgICAgZmlyc3REYXRlID0gbmV3IERhdGUoZmlyc3REYXlPZk1vbnRoKTtcclxuXHJcbiAgICBpZiAobnVtRGlzcGxheWVkRnJvbVByZXZpb3VzTW9udGggPiAwKSB7XHJcbiAgICAgIGZpcnN0RGF0ZS5zZXREYXRlKC1udW1EaXNwbGF5ZWRGcm9tUHJldmlvdXNNb250aCArIDEpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIDQyIGlzIHRoZSBudW1iZXIgb2YgZGF5cyBvbiBhIHNpeC13ZWVrIGNhbGVuZGFyXHJcbiAgICB2YXIgZGF5cyA9IHRoaXMuZ2V0RGF0ZXMoZmlyc3REYXRlLCA0Mik7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDQyOyBpICsrKSB7XHJcbiAgICAgIGRheXNbaV0gPSBhbmd1bGFyLmV4dGVuZCh0aGlzLmNyZWF0ZURhdGVPYmplY3QoZGF5c1tpXSwgdGhpcy5mb3JtYXREYXkpLCB7XHJcbiAgICAgICAgc2Vjb25kYXJ5OiBkYXlzW2ldLmdldE1vbnRoKCkgIT09IG1vbnRoLFxyXG4gICAgICAgIHVpZDogc2NvcGUudW5pcXVlSWQgKyAnLScgKyBpXHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHNjb3BlLmxhYmVscyA9IG5ldyBBcnJheSg3KTtcclxuICAgIGZvciAodmFyIGogPSAwOyBqIDwgNzsgaisrKSB7XHJcbiAgICAgIHNjb3BlLmxhYmVsc1tqXSA9IHtcclxuICAgICAgICBhYmJyOiBkYXRlRmlsdGVyKGRheXNbal0uZGF0ZSwgdGhpcy5mb3JtYXREYXlIZWFkZXIpLFxyXG4gICAgICAgIGZ1bGw6IGRhdGVGaWx0ZXIoZGF5c1tqXS5kYXRlLCAnRUVFRScpXHJcbiAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgc2NvcGUudGl0bGUgPSBkYXRlRmlsdGVyKHRoaXMuYWN0aXZlRGF0ZSwgdGhpcy5mb3JtYXREYXlUaXRsZSk7XHJcbiAgICBzY29wZS5yb3dzID0gdGhpcy5zcGxpdChkYXlzLCA3KTtcclxuXHJcbiAgICBpZiAoc2NvcGUuc2hvd1dlZWtzKSB7XHJcbiAgICAgIHNjb3BlLndlZWtOdW1iZXJzID0gW107XHJcbiAgICAgIHZhciB0aHVyc2RheUluZGV4ID0gKDQgKyA3IC0gdGhpcy5zdGFydGluZ0RheSkgJSA3LFxyXG4gICAgICAgICAgbnVtV2Vla3MgPSBzY29wZS5yb3dzLmxlbmd0aDtcclxuICAgICAgZm9yICh2YXIgY3VyV2VlayA9IDA7IGN1cldlZWsgPCBudW1XZWVrczsgY3VyV2VlaysrKSB7XHJcbiAgICAgICAgc2NvcGUud2Vla051bWJlcnMucHVzaChcclxuICAgICAgICAgIGdldElTTzg2MDFXZWVrTnVtYmVyKHNjb3BlLnJvd3NbY3VyV2Vla11bdGh1cnNkYXlJbmRleF0uZGF0ZSkpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgdGhpcy5jb21wYXJlID0gZnVuY3Rpb24oZGF0ZTEsIGRhdGUyKSB7XHJcbiAgICB2YXIgX2RhdGUxID0gbmV3IERhdGUoZGF0ZTEuZ2V0RnVsbFllYXIoKSwgZGF0ZTEuZ2V0TW9udGgoKSwgZGF0ZTEuZ2V0RGF0ZSgpKTtcclxuICAgIHZhciBfZGF0ZTIgPSBuZXcgRGF0ZShkYXRlMi5nZXRGdWxsWWVhcigpLCBkYXRlMi5nZXRNb250aCgpLCBkYXRlMi5nZXREYXRlKCkpO1xyXG4gICAgX2RhdGUxLnNldEZ1bGxZZWFyKGRhdGUxLmdldEZ1bGxZZWFyKCkpO1xyXG4gICAgX2RhdGUyLnNldEZ1bGxZZWFyKGRhdGUyLmdldEZ1bGxZZWFyKCkpO1xyXG4gICAgcmV0dXJuIF9kYXRlMSAtIF9kYXRlMjtcclxuICB9O1xyXG5cclxuICBmdW5jdGlvbiBnZXRJU084NjAxV2Vla051bWJlcihkYXRlKSB7XHJcbiAgICB2YXIgY2hlY2tEYXRlID0gbmV3IERhdGUoZGF0ZSk7XHJcbiAgICBjaGVja0RhdGUuc2V0RGF0ZShjaGVja0RhdGUuZ2V0RGF0ZSgpICsgNCAtIChjaGVja0RhdGUuZ2V0RGF5KCkgfHwgNykpOyAvLyBUaHVyc2RheVxyXG4gICAgdmFyIHRpbWUgPSBjaGVja0RhdGUuZ2V0VGltZSgpO1xyXG4gICAgY2hlY2tEYXRlLnNldE1vbnRoKDApOyAvLyBDb21wYXJlIHdpdGggSmFuIDFcclxuICAgIGNoZWNrRGF0ZS5zZXREYXRlKDEpO1xyXG4gICAgcmV0dXJuIE1hdGguZmxvb3IoTWF0aC5yb3VuZCgodGltZSAtIGNoZWNrRGF0ZSkgLyA4NjQwMDAwMCkgLyA3KSArIDE7XHJcbiAgfVxyXG5cclxuICB0aGlzLmhhbmRsZUtleURvd24gPSBmdW5jdGlvbihrZXksIGV2dCkge1xyXG4gICAgdmFyIGRhdGUgPSB0aGlzLmFjdGl2ZURhdGUuZ2V0RGF0ZSgpO1xyXG5cclxuICAgIGlmIChrZXkgPT09ICdsZWZ0Jykge1xyXG4gICAgICBkYXRlID0gZGF0ZSAtIDE7XHJcbiAgICB9IGVsc2UgaWYgKGtleSA9PT0gJ3VwJykge1xyXG4gICAgICBkYXRlID0gZGF0ZSAtIDc7XHJcbiAgICB9IGVsc2UgaWYgKGtleSA9PT0gJ3JpZ2h0Jykge1xyXG4gICAgICBkYXRlID0gZGF0ZSArIDE7XHJcbiAgICB9IGVsc2UgaWYgKGtleSA9PT0gJ2Rvd24nKSB7XHJcbiAgICAgIGRhdGUgPSBkYXRlICsgNztcclxuICAgIH0gZWxzZSBpZiAoa2V5ID09PSAncGFnZXVwJyB8fCBrZXkgPT09ICdwYWdlZG93bicpIHtcclxuICAgICAgdmFyIG1vbnRoID0gdGhpcy5hY3RpdmVEYXRlLmdldE1vbnRoKCkgKyAoa2V5ID09PSAncGFnZXVwJyA/IC0gMSA6IDEpO1xyXG4gICAgICB0aGlzLmFjdGl2ZURhdGUuc2V0TW9udGgobW9udGgsIDEpO1xyXG4gICAgICBkYXRlID0gTWF0aC5taW4oZ2V0RGF5c0luTW9udGgodGhpcy5hY3RpdmVEYXRlLmdldEZ1bGxZZWFyKCksIHRoaXMuYWN0aXZlRGF0ZS5nZXRNb250aCgpKSwgZGF0ZSk7XHJcbiAgICB9IGVsc2UgaWYgKGtleSA9PT0gJ2hvbWUnKSB7XHJcbiAgICAgIGRhdGUgPSAxO1xyXG4gICAgfSBlbHNlIGlmIChrZXkgPT09ICdlbmQnKSB7XHJcbiAgICAgIGRhdGUgPSBnZXREYXlzSW5Nb250aCh0aGlzLmFjdGl2ZURhdGUuZ2V0RnVsbFllYXIoKSwgdGhpcy5hY3RpdmVEYXRlLmdldE1vbnRoKCkpO1xyXG4gICAgfVxyXG4gICAgdGhpcy5hY3RpdmVEYXRlLnNldERhdGUoZGF0ZSk7XHJcbiAgfTtcclxufV0pXHJcblxyXG4uY29udHJvbGxlcignVWliTW9udGhwaWNrZXJDb250cm9sbGVyJywgWyckc2NvcGUnLCAnJGVsZW1lbnQnLCAnZGF0ZUZpbHRlcicsIGZ1bmN0aW9uKHNjb3BlLCAkZWxlbWVudCwgZGF0ZUZpbHRlcikge1xyXG4gIHRoaXMuc3RlcCA9IHsgeWVhcnM6IDEgfTtcclxuICB0aGlzLmVsZW1lbnQgPSAkZWxlbWVudDtcclxuXHJcbiAgdGhpcy5pbml0ID0gZnVuY3Rpb24oY3RybCkge1xyXG4gICAgYW5ndWxhci5leHRlbmQoY3RybCwgdGhpcyk7XHJcbiAgICBjdHJsLnJlZnJlc2hWaWV3KCk7XHJcbiAgfTtcclxuXHJcbiAgdGhpcy5fcmVmcmVzaFZpZXcgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBtb250aHMgPSBuZXcgQXJyYXkoMTIpLFxyXG4gICAgICAgIHllYXIgPSB0aGlzLmFjdGl2ZURhdGUuZ2V0RnVsbFllYXIoKSxcclxuICAgICAgICBkYXRlO1xyXG5cclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgMTI7IGkrKykge1xyXG4gICAgICBkYXRlID0gbmV3IERhdGUodGhpcy5hY3RpdmVEYXRlKTtcclxuICAgICAgZGF0ZS5zZXRGdWxsWWVhcih5ZWFyLCBpLCAxKTtcclxuICAgICAgbW9udGhzW2ldID0gYW5ndWxhci5leHRlbmQodGhpcy5jcmVhdGVEYXRlT2JqZWN0KGRhdGUsIHRoaXMuZm9ybWF0TW9udGgpLCB7XHJcbiAgICAgICAgdWlkOiBzY29wZS51bmlxdWVJZCArICctJyArIGlcclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgc2NvcGUudGl0bGUgPSBkYXRlRmlsdGVyKHRoaXMuYWN0aXZlRGF0ZSwgdGhpcy5mb3JtYXRNb250aFRpdGxlKTtcclxuICAgIHNjb3BlLnJvd3MgPSB0aGlzLnNwbGl0KG1vbnRocywgdGhpcy5tb250aENvbHVtbnMpO1xyXG4gICAgc2NvcGUueWVhckhlYWRlckNvbHNwYW4gPSB0aGlzLm1vbnRoQ29sdW1ucyA+IDMgPyB0aGlzLm1vbnRoQ29sdW1ucyAtIDIgOiAxO1xyXG4gIH07XHJcblxyXG4gIHRoaXMuY29tcGFyZSA9IGZ1bmN0aW9uKGRhdGUxLCBkYXRlMikge1xyXG4gICAgdmFyIF9kYXRlMSA9IG5ldyBEYXRlKGRhdGUxLmdldEZ1bGxZZWFyKCksIGRhdGUxLmdldE1vbnRoKCkpO1xyXG4gICAgdmFyIF9kYXRlMiA9IG5ldyBEYXRlKGRhdGUyLmdldEZ1bGxZZWFyKCksIGRhdGUyLmdldE1vbnRoKCkpO1xyXG4gICAgX2RhdGUxLnNldEZ1bGxZZWFyKGRhdGUxLmdldEZ1bGxZZWFyKCkpO1xyXG4gICAgX2RhdGUyLnNldEZ1bGxZZWFyKGRhdGUyLmdldEZ1bGxZZWFyKCkpO1xyXG4gICAgcmV0dXJuIF9kYXRlMSAtIF9kYXRlMjtcclxuICB9O1xyXG5cclxuICB0aGlzLmhhbmRsZUtleURvd24gPSBmdW5jdGlvbihrZXksIGV2dCkge1xyXG4gICAgdmFyIGRhdGUgPSB0aGlzLmFjdGl2ZURhdGUuZ2V0TW9udGgoKTtcclxuXHJcbiAgICBpZiAoa2V5ID09PSAnbGVmdCcpIHtcclxuICAgICAgZGF0ZSA9IGRhdGUgLSAxO1xyXG4gICAgfSBlbHNlIGlmIChrZXkgPT09ICd1cCcpIHtcclxuICAgICAgZGF0ZSA9IGRhdGUgLSB0aGlzLm1vbnRoQ29sdW1ucztcclxuICAgIH0gZWxzZSBpZiAoa2V5ID09PSAncmlnaHQnKSB7XHJcbiAgICAgIGRhdGUgPSBkYXRlICsgMTtcclxuICAgIH0gZWxzZSBpZiAoa2V5ID09PSAnZG93bicpIHtcclxuICAgICAgZGF0ZSA9IGRhdGUgKyB0aGlzLm1vbnRoQ29sdW1ucztcclxuICAgIH0gZWxzZSBpZiAoa2V5ID09PSAncGFnZXVwJyB8fCBrZXkgPT09ICdwYWdlZG93bicpIHtcclxuICAgICAgdmFyIHllYXIgPSB0aGlzLmFjdGl2ZURhdGUuZ2V0RnVsbFllYXIoKSArIChrZXkgPT09ICdwYWdldXAnID8gLSAxIDogMSk7XHJcbiAgICAgIHRoaXMuYWN0aXZlRGF0ZS5zZXRGdWxsWWVhcih5ZWFyKTtcclxuICAgIH0gZWxzZSBpZiAoa2V5ID09PSAnaG9tZScpIHtcclxuICAgICAgZGF0ZSA9IDA7XHJcbiAgICB9IGVsc2UgaWYgKGtleSA9PT0gJ2VuZCcpIHtcclxuICAgICAgZGF0ZSA9IDExO1xyXG4gICAgfVxyXG4gICAgdGhpcy5hY3RpdmVEYXRlLnNldE1vbnRoKGRhdGUpO1xyXG4gIH07XHJcbn1dKVxyXG5cclxuLmNvbnRyb2xsZXIoJ1VpYlllYXJwaWNrZXJDb250cm9sbGVyJywgWyckc2NvcGUnLCAnJGVsZW1lbnQnLCAnZGF0ZUZpbHRlcicsIGZ1bmN0aW9uKHNjb3BlLCAkZWxlbWVudCwgZGF0ZUZpbHRlcikge1xyXG4gIHZhciBjb2x1bW5zLCByYW5nZTtcclxuICB0aGlzLmVsZW1lbnQgPSAkZWxlbWVudDtcclxuXHJcbiAgZnVuY3Rpb24gZ2V0U3RhcnRpbmdZZWFyKHllYXIpIHtcclxuICAgIHJldHVybiBwYXJzZUludCgoeWVhciAtIDEpIC8gcmFuZ2UsIDEwKSAqIHJhbmdlICsgMTtcclxuICB9XHJcblxyXG4gIHRoaXMueWVhcnBpY2tlckluaXQgPSBmdW5jdGlvbigpIHtcclxuICAgIGNvbHVtbnMgPSB0aGlzLnllYXJDb2x1bW5zO1xyXG4gICAgcmFuZ2UgPSB0aGlzLnllYXJSb3dzICogY29sdW1ucztcclxuICAgIHRoaXMuc3RlcCA9IHsgeWVhcnM6IHJhbmdlIH07XHJcbiAgfTtcclxuXHJcbiAgdGhpcy5fcmVmcmVzaFZpZXcgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciB5ZWFycyA9IG5ldyBBcnJheShyYW5nZSksIGRhdGU7XHJcblxyXG4gICAgZm9yICh2YXIgaSA9IDAsIHN0YXJ0ID0gZ2V0U3RhcnRpbmdZZWFyKHRoaXMuYWN0aXZlRGF0ZS5nZXRGdWxsWWVhcigpKTsgaSA8IHJhbmdlOyBpKyspIHtcclxuICAgICAgZGF0ZSA9IG5ldyBEYXRlKHRoaXMuYWN0aXZlRGF0ZSk7XHJcbiAgICAgIGRhdGUuc2V0RnVsbFllYXIoc3RhcnQgKyBpLCAwLCAxKTtcclxuICAgICAgeWVhcnNbaV0gPSBhbmd1bGFyLmV4dGVuZCh0aGlzLmNyZWF0ZURhdGVPYmplY3QoZGF0ZSwgdGhpcy5mb3JtYXRZZWFyKSwge1xyXG4gICAgICAgIHVpZDogc2NvcGUudW5pcXVlSWQgKyAnLScgKyBpXHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHNjb3BlLnRpdGxlID0gW3llYXJzWzBdLmxhYmVsLCB5ZWFyc1tyYW5nZSAtIDFdLmxhYmVsXS5qb2luKCcgLSAnKTtcclxuICAgIHNjb3BlLnJvd3MgPSB0aGlzLnNwbGl0KHllYXJzLCBjb2x1bW5zKTtcclxuICAgIHNjb3BlLmNvbHVtbnMgPSBjb2x1bW5zO1xyXG4gIH07XHJcblxyXG4gIHRoaXMuY29tcGFyZSA9IGZ1bmN0aW9uKGRhdGUxLCBkYXRlMikge1xyXG4gICAgcmV0dXJuIGRhdGUxLmdldEZ1bGxZZWFyKCkgLSBkYXRlMi5nZXRGdWxsWWVhcigpO1xyXG4gIH07XHJcblxyXG4gIHRoaXMuaGFuZGxlS2V5RG93biA9IGZ1bmN0aW9uKGtleSwgZXZ0KSB7XHJcbiAgICB2YXIgZGF0ZSA9IHRoaXMuYWN0aXZlRGF0ZS5nZXRGdWxsWWVhcigpO1xyXG5cclxuICAgIGlmIChrZXkgPT09ICdsZWZ0Jykge1xyXG4gICAgICBkYXRlID0gZGF0ZSAtIDE7XHJcbiAgICB9IGVsc2UgaWYgKGtleSA9PT0gJ3VwJykge1xyXG4gICAgICBkYXRlID0gZGF0ZSAtIGNvbHVtbnM7XHJcbiAgICB9IGVsc2UgaWYgKGtleSA9PT0gJ3JpZ2h0Jykge1xyXG4gICAgICBkYXRlID0gZGF0ZSArIDE7XHJcbiAgICB9IGVsc2UgaWYgKGtleSA9PT0gJ2Rvd24nKSB7XHJcbiAgICAgIGRhdGUgPSBkYXRlICsgY29sdW1ucztcclxuICAgIH0gZWxzZSBpZiAoa2V5ID09PSAncGFnZXVwJyB8fCBrZXkgPT09ICdwYWdlZG93bicpIHtcclxuICAgICAgZGF0ZSArPSAoa2V5ID09PSAncGFnZXVwJyA/IC0gMSA6IDEpICogcmFuZ2U7XHJcbiAgICB9IGVsc2UgaWYgKGtleSA9PT0gJ2hvbWUnKSB7XHJcbiAgICAgIGRhdGUgPSBnZXRTdGFydGluZ1llYXIodGhpcy5hY3RpdmVEYXRlLmdldEZ1bGxZZWFyKCkpO1xyXG4gICAgfSBlbHNlIGlmIChrZXkgPT09ICdlbmQnKSB7XHJcbiAgICAgIGRhdGUgPSBnZXRTdGFydGluZ1llYXIodGhpcy5hY3RpdmVEYXRlLmdldEZ1bGxZZWFyKCkpICsgcmFuZ2UgLSAxO1xyXG4gICAgfVxyXG4gICAgdGhpcy5hY3RpdmVEYXRlLnNldEZ1bGxZZWFyKGRhdGUpO1xyXG4gIH07XHJcbn1dKVxyXG5cclxuLmRpcmVjdGl2ZSgndWliRGF0ZXBpY2tlcicsIGZ1bmN0aW9uKCkge1xyXG4gIHJldHVybiB7XHJcbiAgICB0ZW1wbGF0ZVVybDogZnVuY3Rpb24oZWxlbWVudCwgYXR0cnMpIHtcclxuICAgICAgcmV0dXJuIGF0dHJzLnRlbXBsYXRlVXJsIHx8ICd1aWIvdGVtcGxhdGUvZGF0ZXBpY2tlci9kYXRlcGlja2VyLmh0bWwnO1xyXG4gICAgfSxcclxuICAgIHNjb3BlOiB7XHJcbiAgICAgIGRhdGVwaWNrZXJPcHRpb25zOiAnPT8nXHJcbiAgICB9LFxyXG4gICAgcmVxdWlyZTogWyd1aWJEYXRlcGlja2VyJywgJ15uZ01vZGVsJ10sXHJcbiAgICByZXN0cmljdDogJ0EnLFxyXG4gICAgY29udHJvbGxlcjogJ1VpYkRhdGVwaWNrZXJDb250cm9sbGVyJyxcclxuICAgIGNvbnRyb2xsZXJBczogJ2RhdGVwaWNrZXInLFxyXG4gICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCBjdHJscykge1xyXG4gICAgICB2YXIgZGF0ZXBpY2tlckN0cmwgPSBjdHJsc1swXSwgbmdNb2RlbEN0cmwgPSBjdHJsc1sxXTtcclxuXHJcbiAgICAgIGRhdGVwaWNrZXJDdHJsLmluaXQobmdNb2RlbEN0cmwpO1xyXG4gICAgfVxyXG4gIH07XHJcbn0pXHJcblxyXG4uZGlyZWN0aXZlKCd1aWJEYXlwaWNrZXInLCBmdW5jdGlvbigpIHtcclxuICByZXR1cm4ge1xyXG4gICAgdGVtcGxhdGVVcmw6IGZ1bmN0aW9uKGVsZW1lbnQsIGF0dHJzKSB7XHJcbiAgICAgIHJldHVybiBhdHRycy50ZW1wbGF0ZVVybCB8fCAndWliL3RlbXBsYXRlL2RhdGVwaWNrZXIvZGF5Lmh0bWwnO1xyXG4gICAgfSxcclxuICAgIHJlcXVpcmU6IFsnXnVpYkRhdGVwaWNrZXInLCAndWliRGF5cGlja2VyJ10sXHJcbiAgICByZXN0cmljdDogJ0EnLFxyXG4gICAgY29udHJvbGxlcjogJ1VpYkRheXBpY2tlckNvbnRyb2xsZXInLFxyXG4gICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCBjdHJscykge1xyXG4gICAgICB2YXIgZGF0ZXBpY2tlckN0cmwgPSBjdHJsc1swXSxcclxuICAgICAgICBkYXlwaWNrZXJDdHJsID0gY3RybHNbMV07XHJcblxyXG4gICAgICBkYXlwaWNrZXJDdHJsLmluaXQoZGF0ZXBpY2tlckN0cmwpO1xyXG4gICAgfVxyXG4gIH07XHJcbn0pXHJcblxyXG4uZGlyZWN0aXZlKCd1aWJNb250aHBpY2tlcicsIGZ1bmN0aW9uKCkge1xyXG4gIHJldHVybiB7XHJcbiAgICB0ZW1wbGF0ZVVybDogZnVuY3Rpb24oZWxlbWVudCwgYXR0cnMpIHtcclxuICAgICAgcmV0dXJuIGF0dHJzLnRlbXBsYXRlVXJsIHx8ICd1aWIvdGVtcGxhdGUvZGF0ZXBpY2tlci9tb250aC5odG1sJztcclxuICAgIH0sXHJcbiAgICByZXF1aXJlOiBbJ151aWJEYXRlcGlja2VyJywgJ3VpYk1vbnRocGlja2VyJ10sXHJcbiAgICByZXN0cmljdDogJ0EnLFxyXG4gICAgY29udHJvbGxlcjogJ1VpYk1vbnRocGlja2VyQ29udHJvbGxlcicsXHJcbiAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxlbWVudCwgYXR0cnMsIGN0cmxzKSB7XHJcbiAgICAgIHZhciBkYXRlcGlja2VyQ3RybCA9IGN0cmxzWzBdLFxyXG4gICAgICAgIG1vbnRocGlja2VyQ3RybCA9IGN0cmxzWzFdO1xyXG5cclxuICAgICAgbW9udGhwaWNrZXJDdHJsLmluaXQoZGF0ZXBpY2tlckN0cmwpO1xyXG4gICAgfVxyXG4gIH07XHJcbn0pXHJcblxyXG4uZGlyZWN0aXZlKCd1aWJZZWFycGlja2VyJywgZnVuY3Rpb24oKSB7XHJcbiAgcmV0dXJuIHtcclxuICAgIHRlbXBsYXRlVXJsOiBmdW5jdGlvbihlbGVtZW50LCBhdHRycykge1xyXG4gICAgICByZXR1cm4gYXR0cnMudGVtcGxhdGVVcmwgfHwgJ3VpYi90ZW1wbGF0ZS9kYXRlcGlja2VyL3llYXIuaHRtbCc7XHJcbiAgICB9LFxyXG4gICAgcmVxdWlyZTogWydedWliRGF0ZXBpY2tlcicsICd1aWJZZWFycGlja2VyJ10sXHJcbiAgICByZXN0cmljdDogJ0EnLFxyXG4gICAgY29udHJvbGxlcjogJ1VpYlllYXJwaWNrZXJDb250cm9sbGVyJyxcclxuICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBlbGVtZW50LCBhdHRycywgY3RybHMpIHtcclxuICAgICAgdmFyIGN0cmwgPSBjdHJsc1swXTtcclxuICAgICAgYW5ndWxhci5leHRlbmQoY3RybCwgY3RybHNbMV0pO1xyXG4gICAgICBjdHJsLnllYXJwaWNrZXJJbml0KCk7XHJcblxyXG4gICAgICBjdHJsLnJlZnJlc2hWaWV3KCk7XHJcbiAgICB9XHJcbiAgfTtcclxufSk7XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgndWkuYm9vdHN0cmFwLnBvc2l0aW9uJywgW10pXHJcblxyXG4vKipcclxuICogQSBzZXQgb2YgdXRpbGl0eSBtZXRob2RzIGZvciB3b3JraW5nIHdpdGggdGhlIERPTS5cclxuICogSXQgaXMgbWVhbnQgdG8gYmUgdXNlZCB3aGVyZSB3ZSBuZWVkIHRvIGFic29sdXRlLXBvc2l0aW9uIGVsZW1lbnRzIGluXHJcbiAqIHJlbGF0aW9uIHRvIGFub3RoZXIgZWxlbWVudCAodGhpcyBpcyB0aGUgY2FzZSBmb3IgdG9vbHRpcHMsIHBvcG92ZXJzLFxyXG4gKiB0eXBlYWhlYWQgc3VnZ2VzdGlvbnMgZXRjLikuXHJcbiAqL1xyXG4gIC5mYWN0b3J5KCckdWliUG9zaXRpb24nLCBbJyRkb2N1bWVudCcsICckd2luZG93JywgZnVuY3Rpb24oJGRvY3VtZW50LCAkd2luZG93KSB7XHJcbiAgICAvKipcclxuICAgICAqIFVzZWQgYnkgc2Nyb2xsYmFyV2lkdGgoKSBmdW5jdGlvbiB0byBjYWNoZSBzY3JvbGxiYXIncyB3aWR0aC5cclxuICAgICAqIERvIG5vdCBhY2Nlc3MgdGhpcyB2YXJpYWJsZSBkaXJlY3RseSwgdXNlIHNjcm9sbGJhcldpZHRoKCkgaW5zdGVhZC5cclxuICAgICAqL1xyXG4gICAgdmFyIFNDUk9MTEJBUl9XSURUSDtcclxuICAgIC8qKlxyXG4gICAgICogc2Nyb2xsYmFyIG9uIGJvZHkgYW5kIGh0bWwgZWxlbWVudCBpbiBJRSBhbmQgRWRnZSBvdmVybGF5XHJcbiAgICAgKiBjb250ZW50IGFuZCBzaG91bGQgYmUgY29uc2lkZXJlZCAwIHdpZHRoLlxyXG4gICAgICovXHJcbiAgICB2YXIgQk9EWV9TQ1JPTExCQVJfV0lEVEg7XHJcbiAgICB2YXIgT1ZFUkZMT1dfUkVHRVggPSB7XHJcbiAgICAgIG5vcm1hbDogLyhhdXRvfHNjcm9sbCkvLFxyXG4gICAgICBoaWRkZW46IC8oYXV0b3xzY3JvbGx8aGlkZGVuKS9cclxuICAgIH07XHJcbiAgICB2YXIgUExBQ0VNRU5UX1JFR0VYID0ge1xyXG4gICAgICBhdXRvOiAvXFxzP2F1dG8/XFxzPy9pLFxyXG4gICAgICBwcmltYXJ5OiAvXih0b3B8Ym90dG9tfGxlZnR8cmlnaHQpJC8sXHJcbiAgICAgIHNlY29uZGFyeTogL14odG9wfGJvdHRvbXxsZWZ0fHJpZ2h0fGNlbnRlcikkLyxcclxuICAgICAgdmVydGljYWw6IC9eKHRvcHxib3R0b20pJC9cclxuICAgIH07XHJcbiAgICB2YXIgQk9EWV9SRUdFWCA9IC8oSFRNTHxCT0RZKS87XHJcblxyXG4gICAgcmV0dXJuIHtcclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBQcm92aWRlcyBhIHJhdyBET00gZWxlbWVudCBmcm9tIGEgalF1ZXJ5L2pRTGl0ZSBlbGVtZW50LlxyXG4gICAgICAgKlxyXG4gICAgICAgKiBAcGFyYW0ge2VsZW1lbnR9IGVsZW0gLSBUaGUgZWxlbWVudCB0byBjb252ZXJ0LlxyXG4gICAgICAgKlxyXG4gICAgICAgKiBAcmV0dXJucyB7ZWxlbWVudH0gQSBIVE1MIGVsZW1lbnQuXHJcbiAgICAgICAqL1xyXG4gICAgICBnZXRSYXdOb2RlOiBmdW5jdGlvbihlbGVtKSB7XHJcbiAgICAgICAgcmV0dXJuIGVsZW0ubm9kZU5hbWUgPyBlbGVtIDogZWxlbVswXSB8fCBlbGVtO1xyXG4gICAgICB9LFxyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIFByb3ZpZGVzIGEgcGFyc2VkIG51bWJlciBmb3IgYSBzdHlsZSBwcm9wZXJ0eS4gIFN0cmlwc1xyXG4gICAgICAgKiB1bml0cyBhbmQgY2FzdHMgaW52YWxpZCBudW1iZXJzIHRvIDAuXHJcbiAgICAgICAqXHJcbiAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSB2YWx1ZSAtIFRoZSBzdHlsZSB2YWx1ZSB0byBwYXJzZS5cclxuICAgICAgICpcclxuICAgICAgICogQHJldHVybnMge251bWJlcn0gQSB2YWxpZCBudW1iZXIuXHJcbiAgICAgICAqL1xyXG4gICAgICBwYXJzZVN0eWxlOiBmdW5jdGlvbih2YWx1ZSkge1xyXG4gICAgICAgIHZhbHVlID0gcGFyc2VGbG9hdCh2YWx1ZSk7XHJcbiAgICAgICAgcmV0dXJuIGlzRmluaXRlKHZhbHVlKSA/IHZhbHVlIDogMDtcclxuICAgICAgfSxcclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBQcm92aWRlcyB0aGUgY2xvc2VzdCBwb3NpdGlvbmVkIGFuY2VzdG9yLlxyXG4gICAgICAgKlxyXG4gICAgICAgKiBAcGFyYW0ge2VsZW1lbnR9IGVsZW1lbnQgLSBUaGUgZWxlbWVudCB0byBnZXQgdGhlIG9mZmVzdCBwYXJlbnQgZm9yLlxyXG4gICAgICAgKlxyXG4gICAgICAgKiBAcmV0dXJucyB7ZWxlbWVudH0gVGhlIGNsb3Nlc3QgcG9zaXRpb25lZCBhbmNlc3Rvci5cclxuICAgICAgICovXHJcbiAgICAgIG9mZnNldFBhcmVudDogZnVuY3Rpb24oZWxlbSkge1xyXG4gICAgICAgIGVsZW0gPSB0aGlzLmdldFJhd05vZGUoZWxlbSk7XHJcblxyXG4gICAgICAgIHZhciBvZmZzZXRQYXJlbnQgPSBlbGVtLm9mZnNldFBhcmVudCB8fCAkZG9jdW1lbnRbMF0uZG9jdW1lbnRFbGVtZW50O1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBpc1N0YXRpY1Bvc2l0aW9uZWQoZWwpIHtcclxuICAgICAgICAgIHJldHVybiAoJHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKGVsKS5wb3NpdGlvbiB8fCAnc3RhdGljJykgPT09ICdzdGF0aWMnO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgd2hpbGUgKG9mZnNldFBhcmVudCAmJiBvZmZzZXRQYXJlbnQgIT09ICRkb2N1bWVudFswXS5kb2N1bWVudEVsZW1lbnQgJiYgaXNTdGF0aWNQb3NpdGlvbmVkKG9mZnNldFBhcmVudCkpIHtcclxuICAgICAgICAgIG9mZnNldFBhcmVudCA9IG9mZnNldFBhcmVudC5vZmZzZXRQYXJlbnQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gb2Zmc2V0UGFyZW50IHx8ICRkb2N1bWVudFswXS5kb2N1bWVudEVsZW1lbnQ7XHJcbiAgICAgIH0sXHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogUHJvdmlkZXMgdGhlIHNjcm9sbGJhciB3aWR0aCwgY29uY2VwdCBmcm9tIFRXQlMgbWVhc3VyZVNjcm9sbGJhcigpXHJcbiAgICAgICAqIGZ1bmN0aW9uIGluIGh0dHBzOi8vZ2l0aHViLmNvbS90d2JzL2Jvb3RzdHJhcC9ibG9iL21hc3Rlci9qcy9tb2RhbC5qc1xyXG4gICAgICAgKiBJbiBJRSBhbmQgRWRnZSwgc2NvbGxiYXIgb24gYm9keSBhbmQgaHRtbCBlbGVtZW50IG92ZXJsYXkgYW5kIHNob3VsZFxyXG4gICAgICAgKiByZXR1cm4gYSB3aWR0aCBvZiAwLlxyXG4gICAgICAgKlxyXG4gICAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBUaGUgd2lkdGggb2YgdGhlIGJyb3dzZXIgc2NvbGxiYXIuXHJcbiAgICAgICAqL1xyXG4gICAgICBzY3JvbGxiYXJXaWR0aDogZnVuY3Rpb24oaXNCb2R5KSB7XHJcbiAgICAgICAgaWYgKGlzQm9keSkge1xyXG4gICAgICAgICAgaWYgKGFuZ3VsYXIuaXNVbmRlZmluZWQoQk9EWV9TQ1JPTExCQVJfV0lEVEgpKSB7XHJcbiAgICAgICAgICAgIHZhciBib2R5RWxlbSA9ICRkb2N1bWVudC5maW5kKCdib2R5Jyk7XHJcbiAgICAgICAgICAgIGJvZHlFbGVtLmFkZENsYXNzKCd1aWItcG9zaXRpb24tYm9keS1zY3JvbGxiYXItbWVhc3VyZScpO1xyXG4gICAgICAgICAgICBCT0RZX1NDUk9MTEJBUl9XSURUSCA9ICR3aW5kb3cuaW5uZXJXaWR0aCAtIGJvZHlFbGVtWzBdLmNsaWVudFdpZHRoO1xyXG4gICAgICAgICAgICBCT0RZX1NDUk9MTEJBUl9XSURUSCA9IGlzRmluaXRlKEJPRFlfU0NST0xMQkFSX1dJRFRIKSA/IEJPRFlfU0NST0xMQkFSX1dJRFRIIDogMDtcclxuICAgICAgICAgICAgYm9keUVsZW0ucmVtb3ZlQ2xhc3MoJ3VpYi1wb3NpdGlvbi1ib2R5LXNjcm9sbGJhci1tZWFzdXJlJyk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICByZXR1cm4gQk9EWV9TQ1JPTExCQVJfV0lEVEg7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoYW5ndWxhci5pc1VuZGVmaW5lZChTQ1JPTExCQVJfV0lEVEgpKSB7XHJcbiAgICAgICAgICB2YXIgc2Nyb2xsRWxlbSA9IGFuZ3VsYXIuZWxlbWVudCgnPGRpdiBjbGFzcz1cInVpYi1wb3NpdGlvbi1zY3JvbGxiYXItbWVhc3VyZVwiPjwvZGl2PicpO1xyXG4gICAgICAgICAgJGRvY3VtZW50LmZpbmQoJ2JvZHknKS5hcHBlbmQoc2Nyb2xsRWxlbSk7XHJcbiAgICAgICAgICBTQ1JPTExCQVJfV0lEVEggPSBzY3JvbGxFbGVtWzBdLm9mZnNldFdpZHRoIC0gc2Nyb2xsRWxlbVswXS5jbGllbnRXaWR0aDtcclxuICAgICAgICAgIFNDUk9MTEJBUl9XSURUSCA9IGlzRmluaXRlKFNDUk9MTEJBUl9XSURUSCkgPyBTQ1JPTExCQVJfV0lEVEggOiAwO1xyXG4gICAgICAgICAgc2Nyb2xsRWxlbS5yZW1vdmUoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBTQ1JPTExCQVJfV0lEVEg7XHJcbiAgICAgIH0sXHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogUHJvdmlkZXMgdGhlIHBhZGRpbmcgcmVxdWlyZWQgb24gYW4gZWxlbWVudCB0byByZXBsYWNlIHRoZSBzY3JvbGxiYXIuXHJcbiAgICAgICAqXHJcbiAgICAgICAqIEByZXR1cm5zIHtvYmplY3R9IEFuIG9iamVjdCB3aXRoIHRoZSBmb2xsb3dpbmcgcHJvcGVydGllczpcclxuICAgICAgICogICA8dWw+XHJcbiAgICAgICAqICAgICA8bGk+KipzY3JvbGxiYXJXaWR0aCoqOiB0aGUgd2lkdGggb2YgdGhlIHNjcm9sbGJhcjwvbGk+XHJcbiAgICAgICAqICAgICA8bGk+Kip3aWR0aE92ZXJmbG93Kio6IHdoZXRoZXIgdGhlIHRoZSB3aWR0aCBpcyBvdmVyZmxvd2luZzwvbGk+XHJcbiAgICAgICAqICAgICA8bGk+KipyaWdodCoqOiB0aGUgYW1vdW50IG9mIHJpZ2h0IHBhZGRpbmcgb24gdGhlIGVsZW1lbnQgbmVlZGVkIHRvIHJlcGxhY2UgdGhlIHNjcm9sbGJhcjwvbGk+XHJcbiAgICAgICAqICAgICA8bGk+KipyaWdodE9yaWdpbmFsKio6IHRoZSBhbW91bnQgb2YgcmlnaHQgcGFkZGluZyBjdXJyZW50bHkgb24gdGhlIGVsZW1lbnQ8L2xpPlxyXG4gICAgICAgKiAgICAgPGxpPioqaGVpZ2h0T3ZlcmZsb3cqKjogd2hldGhlciB0aGUgdGhlIGhlaWdodCBpcyBvdmVyZmxvd2luZzwvbGk+XHJcbiAgICAgICAqICAgICA8bGk+Kipib3R0b20qKjogdGhlIGFtb3VudCBvZiBib3R0b20gcGFkZGluZyBvbiB0aGUgZWxlbWVudCBuZWVkZWQgdG8gcmVwbGFjZSB0aGUgc2Nyb2xsYmFyPC9saT5cclxuICAgICAgICogICAgIDxsaT4qKmJvdHRvbU9yaWdpbmFsKio6IHRoZSBhbW91bnQgb2YgYm90dG9tIHBhZGRpbmcgY3VycmVudGx5IG9uIHRoZSBlbGVtZW50PC9saT5cclxuICAgICAgICogICA8L3VsPlxyXG4gICAgICAgKi9cclxuICAgICAgc2Nyb2xsYmFyUGFkZGluZzogZnVuY3Rpb24oZWxlbSkge1xyXG4gICAgICAgIGVsZW0gPSB0aGlzLmdldFJhd05vZGUoZWxlbSk7XHJcblxyXG4gICAgICAgIHZhciBlbGVtU3R5bGUgPSAkd2luZG93LmdldENvbXB1dGVkU3R5bGUoZWxlbSk7XHJcbiAgICAgICAgdmFyIHBhZGRpbmdSaWdodCA9IHRoaXMucGFyc2VTdHlsZShlbGVtU3R5bGUucGFkZGluZ1JpZ2h0KTtcclxuICAgICAgICB2YXIgcGFkZGluZ0JvdHRvbSA9IHRoaXMucGFyc2VTdHlsZShlbGVtU3R5bGUucGFkZGluZ0JvdHRvbSk7XHJcbiAgICAgICAgdmFyIHNjcm9sbFBhcmVudCA9IHRoaXMuc2Nyb2xsUGFyZW50KGVsZW0sIGZhbHNlLCB0cnVlKTtcclxuICAgICAgICB2YXIgc2Nyb2xsYmFyV2lkdGggPSB0aGlzLnNjcm9sbGJhcldpZHRoKHNjcm9sbFBhcmVudCwgQk9EWV9SRUdFWC50ZXN0KHNjcm9sbFBhcmVudC50YWdOYW1lKSk7XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICBzY3JvbGxiYXJXaWR0aDogc2Nyb2xsYmFyV2lkdGgsXHJcbiAgICAgICAgICB3aWR0aE92ZXJmbG93OiBzY3JvbGxQYXJlbnQuc2Nyb2xsV2lkdGggPiBzY3JvbGxQYXJlbnQuY2xpZW50V2lkdGgsXHJcbiAgICAgICAgICByaWdodDogcGFkZGluZ1JpZ2h0ICsgc2Nyb2xsYmFyV2lkdGgsXHJcbiAgICAgICAgICBvcmlnaW5hbFJpZ2h0OiBwYWRkaW5nUmlnaHQsXHJcbiAgICAgICAgICBoZWlnaHRPdmVyZmxvdzogc2Nyb2xsUGFyZW50LnNjcm9sbEhlaWdodCA+IHNjcm9sbFBhcmVudC5jbGllbnRIZWlnaHQsXHJcbiAgICAgICAgICBib3R0b206IHBhZGRpbmdCb3R0b20gKyBzY3JvbGxiYXJXaWR0aCxcclxuICAgICAgICAgIG9yaWdpbmFsQm90dG9tOiBwYWRkaW5nQm90dG9tXHJcbiAgICAgICAgIH07XHJcbiAgICAgIH0sXHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogQ2hlY2tzIHRvIHNlZSBpZiB0aGUgZWxlbWVudCBpcyBzY3JvbGxhYmxlLlxyXG4gICAgICAgKlxyXG4gICAgICAgKiBAcGFyYW0ge2VsZW1lbnR9IGVsZW0gLSBUaGUgZWxlbWVudCB0byBjaGVjay5cclxuICAgICAgICogQHBhcmFtIHtib29sZWFuPX0gW2luY2x1ZGVIaWRkZW49ZmFsc2VdIC0gU2hvdWxkIHNjcm9sbCBzdHlsZSBvZiAnaGlkZGVuJyBiZSBjb25zaWRlcmVkLFxyXG4gICAgICAgKiAgIGRlZmF1bHQgaXMgZmFsc2UuXHJcbiAgICAgICAqXHJcbiAgICAgICAqIEByZXR1cm5zIHtib29sZWFufSBXaGV0aGVyIHRoZSBlbGVtZW50IGlzIHNjcm9sbGFibGUuXHJcbiAgICAgICAqL1xyXG4gICAgICBpc1Njcm9sbGFibGU6IGZ1bmN0aW9uKGVsZW0sIGluY2x1ZGVIaWRkZW4pIHtcclxuICAgICAgICBlbGVtID0gdGhpcy5nZXRSYXdOb2RlKGVsZW0pO1xyXG5cclxuICAgICAgICB2YXIgb3ZlcmZsb3dSZWdleCA9IGluY2x1ZGVIaWRkZW4gPyBPVkVSRkxPV19SRUdFWC5oaWRkZW4gOiBPVkVSRkxPV19SRUdFWC5ub3JtYWw7XHJcbiAgICAgICAgdmFyIGVsZW1TdHlsZSA9ICR3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShlbGVtKTtcclxuICAgICAgICByZXR1cm4gb3ZlcmZsb3dSZWdleC50ZXN0KGVsZW1TdHlsZS5vdmVyZmxvdyArIGVsZW1TdHlsZS5vdmVyZmxvd1kgKyBlbGVtU3R5bGUub3ZlcmZsb3dYKTtcclxuICAgICAgfSxcclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBQcm92aWRlcyB0aGUgY2xvc2VzdCBzY3JvbGxhYmxlIGFuY2VzdG9yLlxyXG4gICAgICAgKiBBIHBvcnQgb2YgdGhlIGpRdWVyeSBVSSBzY3JvbGxQYXJlbnQgbWV0aG9kOlxyXG4gICAgICAgKiBodHRwczovL2dpdGh1Yi5jb20vanF1ZXJ5L2pxdWVyeS11aS9ibG9iL21hc3Rlci91aS9zY3JvbGwtcGFyZW50LmpzXHJcbiAgICAgICAqXHJcbiAgICAgICAqIEBwYXJhbSB7ZWxlbWVudH0gZWxlbSAtIFRoZSBlbGVtZW50IHRvIGZpbmQgdGhlIHNjcm9sbCBwYXJlbnQgb2YuXHJcbiAgICAgICAqIEBwYXJhbSB7Ym9vbGVhbj19IFtpbmNsdWRlSGlkZGVuPWZhbHNlXSAtIFNob3VsZCBzY3JvbGwgc3R5bGUgb2YgJ2hpZGRlbicgYmUgY29uc2lkZXJlZCxcclxuICAgICAgICogICBkZWZhdWx0IGlzIGZhbHNlLlxyXG4gICAgICAgKiBAcGFyYW0ge2Jvb2xlYW49fSBbaW5jbHVkZVNlbGY9ZmFsc2VdIC0gU2hvdWxkIHRoZSBlbGVtZW50IGJlaW5nIHBhc3NlZCBiZVxyXG4gICAgICAgKiBpbmNsdWRlZCBpbiB0aGUgc2Nyb2xsYWJsZSBsbG9rdXAuXHJcbiAgICAgICAqXHJcbiAgICAgICAqIEByZXR1cm5zIHtlbGVtZW50fSBBIEhUTUwgZWxlbWVudC5cclxuICAgICAgICovXHJcbiAgICAgIHNjcm9sbFBhcmVudDogZnVuY3Rpb24oZWxlbSwgaW5jbHVkZUhpZGRlbiwgaW5jbHVkZVNlbGYpIHtcclxuICAgICAgICBlbGVtID0gdGhpcy5nZXRSYXdOb2RlKGVsZW0pO1xyXG5cclxuICAgICAgICB2YXIgb3ZlcmZsb3dSZWdleCA9IGluY2x1ZGVIaWRkZW4gPyBPVkVSRkxPV19SRUdFWC5oaWRkZW4gOiBPVkVSRkxPV19SRUdFWC5ub3JtYWw7XHJcbiAgICAgICAgdmFyIGRvY3VtZW50RWwgPSAkZG9jdW1lbnRbMF0uZG9jdW1lbnRFbGVtZW50O1xyXG4gICAgICAgIHZhciBlbGVtU3R5bGUgPSAkd2luZG93LmdldENvbXB1dGVkU3R5bGUoZWxlbSk7XHJcbiAgICAgICAgaWYgKGluY2x1ZGVTZWxmICYmIG92ZXJmbG93UmVnZXgudGVzdChlbGVtU3R5bGUub3ZlcmZsb3cgKyBlbGVtU3R5bGUub3ZlcmZsb3dZICsgZWxlbVN0eWxlLm92ZXJmbG93WCkpIHtcclxuICAgICAgICAgIHJldHVybiBlbGVtO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgZXhjbHVkZVN0YXRpYyA9IGVsZW1TdHlsZS5wb3NpdGlvbiA9PT0gJ2Fic29sdXRlJztcclxuICAgICAgICB2YXIgc2Nyb2xsUGFyZW50ID0gZWxlbS5wYXJlbnRFbGVtZW50IHx8IGRvY3VtZW50RWw7XHJcblxyXG4gICAgICAgIGlmIChzY3JvbGxQYXJlbnQgPT09IGRvY3VtZW50RWwgfHwgZWxlbVN0eWxlLnBvc2l0aW9uID09PSAnZml4ZWQnKSB7XHJcbiAgICAgICAgICByZXR1cm4gZG9jdW1lbnRFbDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHdoaWxlIChzY3JvbGxQYXJlbnQucGFyZW50RWxlbWVudCAmJiBzY3JvbGxQYXJlbnQgIT09IGRvY3VtZW50RWwpIHtcclxuICAgICAgICAgIHZhciBzcFN0eWxlID0gJHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKHNjcm9sbFBhcmVudCk7XHJcbiAgICAgICAgICBpZiAoZXhjbHVkZVN0YXRpYyAmJiBzcFN0eWxlLnBvc2l0aW9uICE9PSAnc3RhdGljJykge1xyXG4gICAgICAgICAgICBleGNsdWRlU3RhdGljID0gZmFsc2U7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgaWYgKCFleGNsdWRlU3RhdGljICYmIG92ZXJmbG93UmVnZXgudGVzdChzcFN0eWxlLm92ZXJmbG93ICsgc3BTdHlsZS5vdmVyZmxvd1kgKyBzcFN0eWxlLm92ZXJmbG93WCkpIHtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBzY3JvbGxQYXJlbnQgPSBzY3JvbGxQYXJlbnQucGFyZW50RWxlbWVudDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBzY3JvbGxQYXJlbnQ7XHJcbiAgICAgIH0sXHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogUHJvdmlkZXMgcmVhZC1vbmx5IGVxdWl2YWxlbnQgb2YgalF1ZXJ5J3MgcG9zaXRpb24gZnVuY3Rpb246XHJcbiAgICAgICAqIGh0dHA6Ly9hcGkuanF1ZXJ5LmNvbS9wb3NpdGlvbi8gLSBkaXN0YW5jZSB0byBjbG9zZXN0IHBvc2l0aW9uZWRcclxuICAgICAgICogYW5jZXN0b3IuICBEb2VzIG5vdCBhY2NvdW50IGZvciBtYXJnaW5zIGJ5IGRlZmF1bHQgbGlrZSBqUXVlcnkgcG9zaXRpb24uXHJcbiAgICAgICAqXHJcbiAgICAgICAqIEBwYXJhbSB7ZWxlbWVudH0gZWxlbSAtIFRoZSBlbGVtZW50IHRvIGNhY2x1bGF0ZSB0aGUgcG9zaXRpb24gb24uXHJcbiAgICAgICAqIEBwYXJhbSB7Ym9vbGVhbj19IFtpbmNsdWRlTWFyZ2lucz1mYWxzZV0gLSBTaG91bGQgbWFyZ2lucyBiZSBhY2NvdW50ZWRcclxuICAgICAgICogZm9yLCBkZWZhdWx0IGlzIGZhbHNlLlxyXG4gICAgICAgKlxyXG4gICAgICAgKiBAcmV0dXJucyB7b2JqZWN0fSBBbiBvYmplY3Qgd2l0aCB0aGUgZm9sbG93aW5nIHByb3BlcnRpZXM6XHJcbiAgICAgICAqICAgPHVsPlxyXG4gICAgICAgKiAgICAgPGxpPioqd2lkdGgqKjogdGhlIHdpZHRoIG9mIHRoZSBlbGVtZW50PC9saT5cclxuICAgICAgICogICAgIDxsaT4qKmhlaWdodCoqOiB0aGUgaGVpZ2h0IG9mIHRoZSBlbGVtZW50PC9saT5cclxuICAgICAgICogICAgIDxsaT4qKnRvcCoqOiBkaXN0YW5jZSB0byB0b3AgZWRnZSBvZiBvZmZzZXQgcGFyZW50PC9saT5cclxuICAgICAgICogICAgIDxsaT4qKmxlZnQqKjogZGlzdGFuY2UgdG8gbGVmdCBlZGdlIG9mIG9mZnNldCBwYXJlbnQ8L2xpPlxyXG4gICAgICAgKiAgIDwvdWw+XHJcbiAgICAgICAqL1xyXG4gICAgICBwb3NpdGlvbjogZnVuY3Rpb24oZWxlbSwgaW5jbHVkZU1hZ2lucykge1xyXG4gICAgICAgIGVsZW0gPSB0aGlzLmdldFJhd05vZGUoZWxlbSk7XHJcblxyXG4gICAgICAgIHZhciBlbGVtT2Zmc2V0ID0gdGhpcy5vZmZzZXQoZWxlbSk7XHJcbiAgICAgICAgaWYgKGluY2x1ZGVNYWdpbnMpIHtcclxuICAgICAgICAgIHZhciBlbGVtU3R5bGUgPSAkd2luZG93LmdldENvbXB1dGVkU3R5bGUoZWxlbSk7XHJcbiAgICAgICAgICBlbGVtT2Zmc2V0LnRvcCAtPSB0aGlzLnBhcnNlU3R5bGUoZWxlbVN0eWxlLm1hcmdpblRvcCk7XHJcbiAgICAgICAgICBlbGVtT2Zmc2V0LmxlZnQgLT0gdGhpcy5wYXJzZVN0eWxlKGVsZW1TdHlsZS5tYXJnaW5MZWZ0KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIHBhcmVudCA9IHRoaXMub2Zmc2V0UGFyZW50KGVsZW0pO1xyXG4gICAgICAgIHZhciBwYXJlbnRPZmZzZXQgPSB7dG9wOiAwLCBsZWZ0OiAwfTtcclxuXHJcbiAgICAgICAgaWYgKHBhcmVudCAhPT0gJGRvY3VtZW50WzBdLmRvY3VtZW50RWxlbWVudCkge1xyXG4gICAgICAgICAgcGFyZW50T2Zmc2V0ID0gdGhpcy5vZmZzZXQocGFyZW50KTtcclxuICAgICAgICAgIHBhcmVudE9mZnNldC50b3AgKz0gcGFyZW50LmNsaWVudFRvcCAtIHBhcmVudC5zY3JvbGxUb3A7XHJcbiAgICAgICAgICBwYXJlbnRPZmZzZXQubGVmdCArPSBwYXJlbnQuY2xpZW50TGVmdCAtIHBhcmVudC5zY3JvbGxMZWZ0O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHdpZHRoOiBNYXRoLnJvdW5kKGFuZ3VsYXIuaXNOdW1iZXIoZWxlbU9mZnNldC53aWR0aCkgPyBlbGVtT2Zmc2V0LndpZHRoIDogZWxlbS5vZmZzZXRXaWR0aCksXHJcbiAgICAgICAgICBoZWlnaHQ6IE1hdGgucm91bmQoYW5ndWxhci5pc051bWJlcihlbGVtT2Zmc2V0LmhlaWdodCkgPyBlbGVtT2Zmc2V0LmhlaWdodCA6IGVsZW0ub2Zmc2V0SGVpZ2h0KSxcclxuICAgICAgICAgIHRvcDogTWF0aC5yb3VuZChlbGVtT2Zmc2V0LnRvcCAtIHBhcmVudE9mZnNldC50b3ApLFxyXG4gICAgICAgICAgbGVmdDogTWF0aC5yb3VuZChlbGVtT2Zmc2V0LmxlZnQgLSBwYXJlbnRPZmZzZXQubGVmdClcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIFByb3ZpZGVzIHJlYWQtb25seSBlcXVpdmFsZW50IG9mIGpRdWVyeSdzIG9mZnNldCBmdW5jdGlvbjpcclxuICAgICAgICogaHR0cDovL2FwaS5qcXVlcnkuY29tL29mZnNldC8gLSBkaXN0YW5jZSB0byB2aWV3cG9ydC4gIERvZXNcclxuICAgICAgICogbm90IGFjY291bnQgZm9yIGJvcmRlcnMsIG1hcmdpbnMsIG9yIHBhZGRpbmcgb24gdGhlIGJvZHlcclxuICAgICAgICogZWxlbWVudC5cclxuICAgICAgICpcclxuICAgICAgICogQHBhcmFtIHtlbGVtZW50fSBlbGVtIC0gVGhlIGVsZW1lbnQgdG8gY2FsY3VsYXRlIHRoZSBvZmZzZXQgb24uXHJcbiAgICAgICAqXHJcbiAgICAgICAqIEByZXR1cm5zIHtvYmplY3R9IEFuIG9iamVjdCB3aXRoIHRoZSBmb2xsb3dpbmcgcHJvcGVydGllczpcclxuICAgICAgICogICA8dWw+XHJcbiAgICAgICAqICAgICA8bGk+Kip3aWR0aCoqOiB0aGUgd2lkdGggb2YgdGhlIGVsZW1lbnQ8L2xpPlxyXG4gICAgICAgKiAgICAgPGxpPioqaGVpZ2h0Kio6IHRoZSBoZWlnaHQgb2YgdGhlIGVsZW1lbnQ8L2xpPlxyXG4gICAgICAgKiAgICAgPGxpPioqdG9wKio6IGRpc3RhbmNlIHRvIHRvcCBlZGdlIG9mIHZpZXdwb3J0PC9saT5cclxuICAgICAgICogICAgIDxsaT4qKnJpZ2h0Kio6IGRpc3RhbmNlIHRvIGJvdHRvbSBlZGdlIG9mIHZpZXdwb3J0PC9saT5cclxuICAgICAgICogICA8L3VsPlxyXG4gICAgICAgKi9cclxuICAgICAgb2Zmc2V0OiBmdW5jdGlvbihlbGVtKSB7XHJcbiAgICAgICAgZWxlbSA9IHRoaXMuZ2V0UmF3Tm9kZShlbGVtKTtcclxuXHJcbiAgICAgICAgdmFyIGVsZW1CQ1IgPSBlbGVtLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB3aWR0aDogTWF0aC5yb3VuZChhbmd1bGFyLmlzTnVtYmVyKGVsZW1CQ1Iud2lkdGgpID8gZWxlbUJDUi53aWR0aCA6IGVsZW0ub2Zmc2V0V2lkdGgpLFxyXG4gICAgICAgICAgaGVpZ2h0OiBNYXRoLnJvdW5kKGFuZ3VsYXIuaXNOdW1iZXIoZWxlbUJDUi5oZWlnaHQpID8gZWxlbUJDUi5oZWlnaHQgOiBlbGVtLm9mZnNldEhlaWdodCksXHJcbiAgICAgICAgICB0b3A6IE1hdGgucm91bmQoZWxlbUJDUi50b3AgKyAoJHdpbmRvdy5wYWdlWU9mZnNldCB8fCAkZG9jdW1lbnRbMF0uZG9jdW1lbnRFbGVtZW50LnNjcm9sbFRvcCkpLFxyXG4gICAgICAgICAgbGVmdDogTWF0aC5yb3VuZChlbGVtQkNSLmxlZnQgKyAoJHdpbmRvdy5wYWdlWE9mZnNldCB8fCAkZG9jdW1lbnRbMF0uZG9jdW1lbnRFbGVtZW50LnNjcm9sbExlZnQpKVxyXG4gICAgICAgIH07XHJcbiAgICAgIH0sXHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogUHJvdmlkZXMgb2Zmc2V0IGRpc3RhbmNlIHRvIHRoZSBjbG9zZXN0IHNjcm9sbGFibGUgYW5jZXN0b3JcclxuICAgICAgICogb3Igdmlld3BvcnQuICBBY2NvdW50cyBmb3IgYm9yZGVyIGFuZCBzY3JvbGxiYXIgd2lkdGguXHJcbiAgICAgICAqXHJcbiAgICAgICAqIFJpZ2h0IGFuZCBib3R0b20gZGltZW5zaW9ucyByZXByZXNlbnQgdGhlIGRpc3RhbmNlIHRvIHRoZVxyXG4gICAgICAgKiByZXNwZWN0aXZlIGVkZ2Ugb2YgdGhlIHZpZXdwb3J0IGVsZW1lbnQuICBJZiB0aGUgZWxlbWVudFxyXG4gICAgICAgKiBlZGdlIGV4dGVuZHMgYmV5b25kIHRoZSB2aWV3cG9ydCwgYSBuZWdhdGl2ZSB2YWx1ZSB3aWxsIGJlXHJcbiAgICAgICAqIHJlcG9ydGVkLlxyXG4gICAgICAgKlxyXG4gICAgICAgKiBAcGFyYW0ge2VsZW1lbnR9IGVsZW0gLSBUaGUgZWxlbWVudCB0byBnZXQgdGhlIHZpZXdwb3J0IG9mZnNldCBmb3IuXHJcbiAgICAgICAqIEBwYXJhbSB7Ym9vbGVhbj19IFt1c2VEb2N1bWVudD1mYWxzZV0gLSBTaG91bGQgdGhlIHZpZXdwb3J0IGJlIHRoZSBkb2N1bWVudCBlbGVtZW50IGluc3RlYWRcclxuICAgICAgICogb2YgdGhlIGZpcnN0IHNjcm9sbGFibGUgZWxlbWVudCwgZGVmYXVsdCBpcyBmYWxzZS5cclxuICAgICAgICogQHBhcmFtIHtib29sZWFuPX0gW2luY2x1ZGVQYWRkaW5nPXRydWVdIC0gU2hvdWxkIHRoZSBwYWRkaW5nIG9uIHRoZSBvZmZzZXQgcGFyZW50IGVsZW1lbnRcclxuICAgICAgICogYmUgYWNjb3VudGVkIGZvciwgZGVmYXVsdCBpcyB0cnVlLlxyXG4gICAgICAgKlxyXG4gICAgICAgKiBAcmV0dXJucyB7b2JqZWN0fSBBbiBvYmplY3Qgd2l0aCB0aGUgZm9sbG93aW5nIHByb3BlcnRpZXM6XHJcbiAgICAgICAqICAgPHVsPlxyXG4gICAgICAgKiAgICAgPGxpPioqdG9wKio6IGRpc3RhbmNlIHRvIHRoZSB0b3AgY29udGVudCBlZGdlIG9mIHZpZXdwb3J0IGVsZW1lbnQ8L2xpPlxyXG4gICAgICAgKiAgICAgPGxpPioqYm90dG9tKio6IGRpc3RhbmNlIHRvIHRoZSBib3R0b20gY29udGVudCBlZGdlIG9mIHZpZXdwb3J0IGVsZW1lbnQ8L2xpPlxyXG4gICAgICAgKiAgICAgPGxpPioqbGVmdCoqOiBkaXN0YW5jZSB0byB0aGUgbGVmdCBjb250ZW50IGVkZ2Ugb2Ygdmlld3BvcnQgZWxlbWVudDwvbGk+XHJcbiAgICAgICAqICAgICA8bGk+KipyaWdodCoqOiBkaXN0YW5jZSB0byB0aGUgcmlnaHQgY29udGVudCBlZGdlIG9mIHZpZXdwb3J0IGVsZW1lbnQ8L2xpPlxyXG4gICAgICAgKiAgIDwvdWw+XHJcbiAgICAgICAqL1xyXG4gICAgICB2aWV3cG9ydE9mZnNldDogZnVuY3Rpb24oZWxlbSwgdXNlRG9jdW1lbnQsIGluY2x1ZGVQYWRkaW5nKSB7XHJcbiAgICAgICAgZWxlbSA9IHRoaXMuZ2V0UmF3Tm9kZShlbGVtKTtcclxuICAgICAgICBpbmNsdWRlUGFkZGluZyA9IGluY2x1ZGVQYWRkaW5nICE9PSBmYWxzZSA/IHRydWUgOiBmYWxzZTtcclxuXHJcbiAgICAgICAgdmFyIGVsZW1CQ1IgPSBlbGVtLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xyXG4gICAgICAgIHZhciBvZmZzZXRCQ1IgPSB7dG9wOiAwLCBsZWZ0OiAwLCBib3R0b206IDAsIHJpZ2h0OiAwfTtcclxuXHJcbiAgICAgICAgdmFyIG9mZnNldFBhcmVudCA9IHVzZURvY3VtZW50ID8gJGRvY3VtZW50WzBdLmRvY3VtZW50RWxlbWVudCA6IHRoaXMuc2Nyb2xsUGFyZW50KGVsZW0pO1xyXG4gICAgICAgIHZhciBvZmZzZXRQYXJlbnRCQ1IgPSBvZmZzZXRQYXJlbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcblxyXG4gICAgICAgIG9mZnNldEJDUi50b3AgPSBvZmZzZXRQYXJlbnRCQ1IudG9wICsgb2Zmc2V0UGFyZW50LmNsaWVudFRvcDtcclxuICAgICAgICBvZmZzZXRCQ1IubGVmdCA9IG9mZnNldFBhcmVudEJDUi5sZWZ0ICsgb2Zmc2V0UGFyZW50LmNsaWVudExlZnQ7XHJcbiAgICAgICAgaWYgKG9mZnNldFBhcmVudCA9PT0gJGRvY3VtZW50WzBdLmRvY3VtZW50RWxlbWVudCkge1xyXG4gICAgICAgICAgb2Zmc2V0QkNSLnRvcCArPSAkd2luZG93LnBhZ2VZT2Zmc2V0O1xyXG4gICAgICAgICAgb2Zmc2V0QkNSLmxlZnQgKz0gJHdpbmRvdy5wYWdlWE9mZnNldDtcclxuICAgICAgICB9XHJcbiAgICAgICAgb2Zmc2V0QkNSLmJvdHRvbSA9IG9mZnNldEJDUi50b3AgKyBvZmZzZXRQYXJlbnQuY2xpZW50SGVpZ2h0O1xyXG4gICAgICAgIG9mZnNldEJDUi5yaWdodCA9IG9mZnNldEJDUi5sZWZ0ICsgb2Zmc2V0UGFyZW50LmNsaWVudFdpZHRoO1xyXG5cclxuICAgICAgICBpZiAoaW5jbHVkZVBhZGRpbmcpIHtcclxuICAgICAgICAgIHZhciBvZmZzZXRQYXJlbnRTdHlsZSA9ICR3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShvZmZzZXRQYXJlbnQpO1xyXG4gICAgICAgICAgb2Zmc2V0QkNSLnRvcCArPSB0aGlzLnBhcnNlU3R5bGUob2Zmc2V0UGFyZW50U3R5bGUucGFkZGluZ1RvcCk7XHJcbiAgICAgICAgICBvZmZzZXRCQ1IuYm90dG9tIC09IHRoaXMucGFyc2VTdHlsZShvZmZzZXRQYXJlbnRTdHlsZS5wYWRkaW5nQm90dG9tKTtcclxuICAgICAgICAgIG9mZnNldEJDUi5sZWZ0ICs9IHRoaXMucGFyc2VTdHlsZShvZmZzZXRQYXJlbnRTdHlsZS5wYWRkaW5nTGVmdCk7XHJcbiAgICAgICAgICBvZmZzZXRCQ1IucmlnaHQgLT0gdGhpcy5wYXJzZVN0eWxlKG9mZnNldFBhcmVudFN0eWxlLnBhZGRpbmdSaWdodCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdG9wOiBNYXRoLnJvdW5kKGVsZW1CQ1IudG9wIC0gb2Zmc2V0QkNSLnRvcCksXHJcbiAgICAgICAgICBib3R0b206IE1hdGgucm91bmQob2Zmc2V0QkNSLmJvdHRvbSAtIGVsZW1CQ1IuYm90dG9tKSxcclxuICAgICAgICAgIGxlZnQ6IE1hdGgucm91bmQoZWxlbUJDUi5sZWZ0IC0gb2Zmc2V0QkNSLmxlZnQpLFxyXG4gICAgICAgICAgcmlnaHQ6IE1hdGgucm91bmQob2Zmc2V0QkNSLnJpZ2h0IC0gZWxlbUJDUi5yaWdodClcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIFByb3ZpZGVzIGFuIGFycmF5IG9mIHBsYWNlbWVudCB2YWx1ZXMgcGFyc2VkIGZyb20gYSBwbGFjZW1lbnQgc3RyaW5nLlxyXG4gICAgICAgKiBBbG9uZyB3aXRoIHRoZSAnYXV0bycgaW5kaWNhdG9yLCBzdXBwb3J0ZWQgcGxhY2VtZW50IHN0cmluZ3MgYXJlOlxyXG4gICAgICAgKiAgIDx1bD5cclxuICAgICAgICogICAgIDxsaT50b3A6IGVsZW1lbnQgb24gdG9wLCBob3Jpem9udGFsbHkgY2VudGVyZWQgb24gaG9zdCBlbGVtZW50LjwvbGk+XHJcbiAgICAgICAqICAgICA8bGk+dG9wLWxlZnQ6IGVsZW1lbnQgb24gdG9wLCBsZWZ0IGVkZ2UgYWxpZ25lZCB3aXRoIGhvc3QgZWxlbWVudCBsZWZ0IGVkZ2UuPC9saT5cclxuICAgICAgICogICAgIDxsaT50b3AtcmlnaHQ6IGVsZW1lbnQgb24gdG9wLCBsZXJpZ2h0ZnQgZWRnZSBhbGlnbmVkIHdpdGggaG9zdCBlbGVtZW50IHJpZ2h0IGVkZ2UuPC9saT5cclxuICAgICAgICogICAgIDxsaT5ib3R0b206IGVsZW1lbnQgb24gYm90dG9tLCBob3Jpem9udGFsbHkgY2VudGVyZWQgb24gaG9zdCBlbGVtZW50LjwvbGk+XHJcbiAgICAgICAqICAgICA8bGk+Ym90dG9tLWxlZnQ6IGVsZW1lbnQgb24gYm90dG9tLCBsZWZ0IGVkZ2UgYWxpZ25lZCB3aXRoIGhvc3QgZWxlbWVudCBsZWZ0IGVkZ2UuPC9saT5cclxuICAgICAgICogICAgIDxsaT5ib3R0b20tcmlnaHQ6IGVsZW1lbnQgb24gYm90dG9tLCByaWdodCBlZGdlIGFsaWduZWQgd2l0aCBob3N0IGVsZW1lbnQgcmlnaHQgZWRnZS48L2xpPlxyXG4gICAgICAgKiAgICAgPGxpPmxlZnQ6IGVsZW1lbnQgb24gbGVmdCwgdmVydGljYWxseSBjZW50ZXJlZCBvbiBob3N0IGVsZW1lbnQuPC9saT5cclxuICAgICAgICogICAgIDxsaT5sZWZ0LXRvcDogZWxlbWVudCBvbiBsZWZ0LCB0b3AgZWRnZSBhbGlnbmVkIHdpdGggaG9zdCBlbGVtZW50IHRvcCBlZGdlLjwvbGk+XHJcbiAgICAgICAqICAgICA8bGk+bGVmdC1ib3R0b206IGVsZW1lbnQgb24gbGVmdCwgYm90dG9tIGVkZ2UgYWxpZ25lZCB3aXRoIGhvc3QgZWxlbWVudCBib3R0b20gZWRnZS48L2xpPlxyXG4gICAgICAgKiAgICAgPGxpPnJpZ2h0OiBlbGVtZW50IG9uIHJpZ2h0LCB2ZXJ0aWNhbGx5IGNlbnRlcmVkIG9uIGhvc3QgZWxlbWVudC48L2xpPlxyXG4gICAgICAgKiAgICAgPGxpPnJpZ2h0LXRvcDogZWxlbWVudCBvbiByaWdodCwgdG9wIGVkZ2UgYWxpZ25lZCB3aXRoIGhvc3QgZWxlbWVudCB0b3AgZWRnZS48L2xpPlxyXG4gICAgICAgKiAgICAgPGxpPnJpZ2h0LWJvdHRvbTogZWxlbWVudCBvbiByaWdodCwgYm90dG9tIGVkZ2UgYWxpZ25lZCB3aXRoIGhvc3QgZWxlbWVudCBib3R0b20gZWRnZS48L2xpPlxyXG4gICAgICAgKiAgIDwvdWw+XHJcbiAgICAgICAqIEEgcGxhY2VtZW50IHN0cmluZyB3aXRoIGFuICdhdXRvJyBpbmRpY2F0b3IgaXMgZXhwZWN0ZWQgdG8gYmVcclxuICAgICAgICogc3BhY2Ugc2VwYXJhdGVkIGZyb20gdGhlIHBsYWNlbWVudCwgaS5lOiAnYXV0byBib3R0b20tbGVmdCcgIElmXHJcbiAgICAgICAqIHRoZSBwcmltYXJ5IGFuZCBzZWNvbmRhcnkgcGxhY2VtZW50IHZhbHVlcyBkbyBub3QgbWF0Y2ggJ3RvcCxcclxuICAgICAgICogYm90dG9tLCBsZWZ0LCByaWdodCcgdGhlbiAndG9wJyB3aWxsIGJlIHRoZSBwcmltYXJ5IHBsYWNlbWVudCBhbmRcclxuICAgICAgICogJ2NlbnRlcicgd2lsbCBiZSB0aGUgc2Vjb25kYXJ5IHBsYWNlbWVudC4gIElmICdhdXRvJyBpcyBwYXNzZWQsIHRydWVcclxuICAgICAgICogd2lsbCBiZSByZXR1cm5lZCBhcyB0aGUgM3JkIHZhbHVlIG9mIHRoZSBhcnJheS5cclxuICAgICAgICpcclxuICAgICAgICogQHBhcmFtIHtzdHJpbmd9IHBsYWNlbWVudCAtIFRoZSBwbGFjZW1lbnQgc3RyaW5nIHRvIHBhcnNlLlxyXG4gICAgICAgKlxyXG4gICAgICAgKiBAcmV0dXJucyB7YXJyYXl9IEFuIGFycmF5IHdpdGggdGhlIGZvbGxvd2luZyB2YWx1ZXNcclxuICAgICAgICogPHVsPlxyXG4gICAgICAgKiAgIDxsaT4qKlswXSoqOiBUaGUgcHJpbWFyeSBwbGFjZW1lbnQuPC9saT5cclxuICAgICAgICogICA8bGk+KipbMV0qKjogVGhlIHNlY29uZGFyeSBwbGFjZW1lbnQuPC9saT5cclxuICAgICAgICogICA8bGk+KipbMl0qKjogSWYgYXV0byBpcyBwYXNzZWQ6IHRydWUsIGVsc2UgdW5kZWZpbmVkLjwvbGk+XHJcbiAgICAgICAqIDwvdWw+XHJcbiAgICAgICAqL1xyXG4gICAgICBwYXJzZVBsYWNlbWVudDogZnVuY3Rpb24ocGxhY2VtZW50KSB7XHJcbiAgICAgICAgdmFyIGF1dG9QbGFjZSA9IFBMQUNFTUVOVF9SRUdFWC5hdXRvLnRlc3QocGxhY2VtZW50KTtcclxuICAgICAgICBpZiAoYXV0b1BsYWNlKSB7XHJcbiAgICAgICAgICBwbGFjZW1lbnQgPSBwbGFjZW1lbnQucmVwbGFjZShQTEFDRU1FTlRfUkVHRVguYXV0bywgJycpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcGxhY2VtZW50ID0gcGxhY2VtZW50LnNwbGl0KCctJyk7XHJcblxyXG4gICAgICAgIHBsYWNlbWVudFswXSA9IHBsYWNlbWVudFswXSB8fCAndG9wJztcclxuICAgICAgICBpZiAoIVBMQUNFTUVOVF9SRUdFWC5wcmltYXJ5LnRlc3QocGxhY2VtZW50WzBdKSkge1xyXG4gICAgICAgICAgcGxhY2VtZW50WzBdID0gJ3RvcCc7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwbGFjZW1lbnRbMV0gPSBwbGFjZW1lbnRbMV0gfHwgJ2NlbnRlcic7XHJcbiAgICAgICAgaWYgKCFQTEFDRU1FTlRfUkVHRVguc2Vjb25kYXJ5LnRlc3QocGxhY2VtZW50WzFdKSkge1xyXG4gICAgICAgICAgcGxhY2VtZW50WzFdID0gJ2NlbnRlcic7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoYXV0b1BsYWNlKSB7XHJcbiAgICAgICAgICBwbGFjZW1lbnRbMl0gPSB0cnVlO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBwbGFjZW1lbnRbMl0gPSBmYWxzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBwbGFjZW1lbnQ7XHJcbiAgICAgIH0sXHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogUHJvdmlkZXMgY29vcmRpbmF0ZXMgZm9yIGFuIGVsZW1lbnQgdG8gYmUgcG9zaXRpb25lZCByZWxhdGl2ZSB0b1xyXG4gICAgICAgKiBhbm90aGVyIGVsZW1lbnQuICBQYXNzaW5nICdhdXRvJyBhcyBwYXJ0IG9mIHRoZSBwbGFjZW1lbnQgcGFyYW1ldGVyXHJcbiAgICAgICAqIHdpbGwgZW5hYmxlIHNtYXJ0IHBsYWNlbWVudCAtIHdoZXJlIHRoZSBlbGVtZW50IGZpdHMuIGkuZTpcclxuICAgICAgICogJ2F1dG8gbGVmdC10b3AnIHdpbGwgY2hlY2sgdG8gc2VlIGlmIHRoZXJlIGlzIGVub3VnaCBzcGFjZSB0byB0aGUgbGVmdFxyXG4gICAgICAgKiBvZiB0aGUgaG9zdEVsZW0gdG8gZml0IHRoZSB0YXJnZXRFbGVtLCBpZiBub3QgcGxhY2UgcmlnaHQgKHNhbWUgZm9yIHNlY29uZGFyeVxyXG4gICAgICAgKiB0b3AgcGxhY2VtZW50KS4gIEF2YWlsYWJsZSBzcGFjZSBpcyBjYWxjdWxhdGVkIHVzaW5nIHRoZSB2aWV3cG9ydE9mZnNldFxyXG4gICAgICAgKiBmdW5jdGlvbi5cclxuICAgICAgICpcclxuICAgICAgICogQHBhcmFtIHtlbGVtZW50fSBob3N0RWxlbSAtIFRoZSBlbGVtZW50IHRvIHBvc2l0aW9uIGFnYWluc3QuXHJcbiAgICAgICAqIEBwYXJhbSB7ZWxlbWVudH0gdGFyZ2V0RWxlbSAtIFRoZSBlbGVtZW50IHRvIHBvc2l0aW9uLlxyXG4gICAgICAgKiBAcGFyYW0ge3N0cmluZz19IFtwbGFjZW1lbnQ9dG9wXSAtIFRoZSBwbGFjZW1lbnQgZm9yIHRoZSB0YXJnZXRFbGVtLFxyXG4gICAgICAgKiAgIGRlZmF1bHQgaXMgJ3RvcCcuICdjZW50ZXInIGlzIGFzc3VtZWQgYXMgc2Vjb25kYXJ5IHBsYWNlbWVudCBmb3JcclxuICAgICAgICogICAndG9wJywgJ2xlZnQnLCAncmlnaHQnLCBhbmQgJ2JvdHRvbScgcGxhY2VtZW50cy4gIEF2YWlsYWJsZSBwbGFjZW1lbnRzIGFyZTpcclxuICAgICAgICogICA8dWw+XHJcbiAgICAgICAqICAgICA8bGk+dG9wPC9saT5cclxuICAgICAgICogICAgIDxsaT50b3AtcmlnaHQ8L2xpPlxyXG4gICAgICAgKiAgICAgPGxpPnRvcC1sZWZ0PC9saT5cclxuICAgICAgICogICAgIDxsaT5ib3R0b208L2xpPlxyXG4gICAgICAgKiAgICAgPGxpPmJvdHRvbS1sZWZ0PC9saT5cclxuICAgICAgICogICAgIDxsaT5ib3R0b20tcmlnaHQ8L2xpPlxyXG4gICAgICAgKiAgICAgPGxpPmxlZnQ8L2xpPlxyXG4gICAgICAgKiAgICAgPGxpPmxlZnQtdG9wPC9saT5cclxuICAgICAgICogICAgIDxsaT5sZWZ0LWJvdHRvbTwvbGk+XHJcbiAgICAgICAqICAgICA8bGk+cmlnaHQ8L2xpPlxyXG4gICAgICAgKiAgICAgPGxpPnJpZ2h0LXRvcDwvbGk+XHJcbiAgICAgICAqICAgICA8bGk+cmlnaHQtYm90dG9tPC9saT5cclxuICAgICAgICogICA8L3VsPlxyXG4gICAgICAgKiBAcGFyYW0ge2Jvb2xlYW49fSBbYXBwZW5kVG9Cb2R5PWZhbHNlXSAtIFNob3VsZCB0aGUgdG9wIGFuZCBsZWZ0IHZhbHVlcyByZXR1cm5lZFxyXG4gICAgICAgKiAgIGJlIGNhbGN1bGF0ZWQgZnJvbSB0aGUgYm9keSBlbGVtZW50LCBkZWZhdWx0IGlzIGZhbHNlLlxyXG4gICAgICAgKlxyXG4gICAgICAgKiBAcmV0dXJucyB7b2JqZWN0fSBBbiBvYmplY3Qgd2l0aCB0aGUgZm9sbG93aW5nIHByb3BlcnRpZXM6XHJcbiAgICAgICAqICAgPHVsPlxyXG4gICAgICAgKiAgICAgPGxpPioqdG9wKio6IFZhbHVlIGZvciB0YXJnZXRFbGVtIHRvcC48L2xpPlxyXG4gICAgICAgKiAgICAgPGxpPioqbGVmdCoqOiBWYWx1ZSBmb3IgdGFyZ2V0RWxlbSBsZWZ0LjwvbGk+XHJcbiAgICAgICAqICAgICA8bGk+KipwbGFjZW1lbnQqKjogVGhlIHJlc29sdmVkIHBsYWNlbWVudC48L2xpPlxyXG4gICAgICAgKiAgIDwvdWw+XHJcbiAgICAgICAqL1xyXG4gICAgICBwb3NpdGlvbkVsZW1lbnRzOiBmdW5jdGlvbihob3N0RWxlbSwgdGFyZ2V0RWxlbSwgcGxhY2VtZW50LCBhcHBlbmRUb0JvZHkpIHtcclxuICAgICAgICBob3N0RWxlbSA9IHRoaXMuZ2V0UmF3Tm9kZShob3N0RWxlbSk7XHJcbiAgICAgICAgdGFyZ2V0RWxlbSA9IHRoaXMuZ2V0UmF3Tm9kZSh0YXJnZXRFbGVtKTtcclxuXHJcbiAgICAgICAgLy8gbmVlZCB0byByZWFkIGZyb20gcHJvcCB0byBzdXBwb3J0IHRlc3RzLlxyXG4gICAgICAgIHZhciB0YXJnZXRXaWR0aCA9IGFuZ3VsYXIuaXNEZWZpbmVkKHRhcmdldEVsZW0ub2Zmc2V0V2lkdGgpID8gdGFyZ2V0RWxlbS5vZmZzZXRXaWR0aCA6IHRhcmdldEVsZW0ucHJvcCgnb2Zmc2V0V2lkdGgnKTtcclxuICAgICAgICB2YXIgdGFyZ2V0SGVpZ2h0ID0gYW5ndWxhci5pc0RlZmluZWQodGFyZ2V0RWxlbS5vZmZzZXRIZWlnaHQpID8gdGFyZ2V0RWxlbS5vZmZzZXRIZWlnaHQgOiB0YXJnZXRFbGVtLnByb3AoJ29mZnNldEhlaWdodCcpO1xyXG5cclxuICAgICAgICBwbGFjZW1lbnQgPSB0aGlzLnBhcnNlUGxhY2VtZW50KHBsYWNlbWVudCk7XHJcblxyXG4gICAgICAgIHZhciBob3N0RWxlbVBvcyA9IGFwcGVuZFRvQm9keSA/IHRoaXMub2Zmc2V0KGhvc3RFbGVtKSA6IHRoaXMucG9zaXRpb24oaG9zdEVsZW0pO1xyXG4gICAgICAgIHZhciB0YXJnZXRFbGVtUG9zID0ge3RvcDogMCwgbGVmdDogMCwgcGxhY2VtZW50OiAnJ307XHJcblxyXG4gICAgICAgIGlmIChwbGFjZW1lbnRbMl0pIHtcclxuICAgICAgICAgIHZhciB2aWV3cG9ydE9mZnNldCA9IHRoaXMudmlld3BvcnRPZmZzZXQoaG9zdEVsZW0sIGFwcGVuZFRvQm9keSk7XHJcblxyXG4gICAgICAgICAgdmFyIHRhcmdldEVsZW1TdHlsZSA9ICR3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZSh0YXJnZXRFbGVtKTtcclxuICAgICAgICAgIHZhciBhZGp1c3RlZFNpemUgPSB7XHJcbiAgICAgICAgICAgIHdpZHRoOiB0YXJnZXRXaWR0aCArIE1hdGgucm91bmQoTWF0aC5hYnModGhpcy5wYXJzZVN0eWxlKHRhcmdldEVsZW1TdHlsZS5tYXJnaW5MZWZ0KSArIHRoaXMucGFyc2VTdHlsZSh0YXJnZXRFbGVtU3R5bGUubWFyZ2luUmlnaHQpKSksXHJcbiAgICAgICAgICAgIGhlaWdodDogdGFyZ2V0SGVpZ2h0ICsgTWF0aC5yb3VuZChNYXRoLmFicyh0aGlzLnBhcnNlU3R5bGUodGFyZ2V0RWxlbVN0eWxlLm1hcmdpblRvcCkgKyB0aGlzLnBhcnNlU3R5bGUodGFyZ2V0RWxlbVN0eWxlLm1hcmdpbkJvdHRvbSkpKVxyXG4gICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICBwbGFjZW1lbnRbMF0gPSBwbGFjZW1lbnRbMF0gPT09ICd0b3AnICYmIGFkanVzdGVkU2l6ZS5oZWlnaHQgPiB2aWV3cG9ydE9mZnNldC50b3AgJiYgYWRqdXN0ZWRTaXplLmhlaWdodCA8PSB2aWV3cG9ydE9mZnNldC5ib3R0b20gPyAnYm90dG9tJyA6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICBwbGFjZW1lbnRbMF0gPT09ICdib3R0b20nICYmIGFkanVzdGVkU2l6ZS5oZWlnaHQgPiB2aWV3cG9ydE9mZnNldC5ib3R0b20gJiYgYWRqdXN0ZWRTaXplLmhlaWdodCA8PSB2aWV3cG9ydE9mZnNldC50b3AgPyAndG9wJyA6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICBwbGFjZW1lbnRbMF0gPT09ICdsZWZ0JyAmJiBhZGp1c3RlZFNpemUud2lkdGggPiB2aWV3cG9ydE9mZnNldC5sZWZ0ICYmIGFkanVzdGVkU2l6ZS53aWR0aCA8PSB2aWV3cG9ydE9mZnNldC5yaWdodCA/ICdyaWdodCcgOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgcGxhY2VtZW50WzBdID09PSAncmlnaHQnICYmIGFkanVzdGVkU2l6ZS53aWR0aCA+IHZpZXdwb3J0T2Zmc2V0LnJpZ2h0ICYmIGFkanVzdGVkU2l6ZS53aWR0aCA8PSB2aWV3cG9ydE9mZnNldC5sZWZ0ID8gJ2xlZnQnIDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgIHBsYWNlbWVudFswXTtcclxuXHJcbiAgICAgICAgICBwbGFjZW1lbnRbMV0gPSBwbGFjZW1lbnRbMV0gPT09ICd0b3AnICYmIGFkanVzdGVkU2l6ZS5oZWlnaHQgLSBob3N0RWxlbVBvcy5oZWlnaHQgPiB2aWV3cG9ydE9mZnNldC5ib3R0b20gJiYgYWRqdXN0ZWRTaXplLmhlaWdodCAtIGhvc3RFbGVtUG9zLmhlaWdodCA8PSB2aWV3cG9ydE9mZnNldC50b3AgPyAnYm90dG9tJyA6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICBwbGFjZW1lbnRbMV0gPT09ICdib3R0b20nICYmIGFkanVzdGVkU2l6ZS5oZWlnaHQgLSBob3N0RWxlbVBvcy5oZWlnaHQgPiB2aWV3cG9ydE9mZnNldC50b3AgJiYgYWRqdXN0ZWRTaXplLmhlaWdodCAtIGhvc3RFbGVtUG9zLmhlaWdodCA8PSB2aWV3cG9ydE9mZnNldC5ib3R0b20gPyAndG9wJyA6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICBwbGFjZW1lbnRbMV0gPT09ICdsZWZ0JyAmJiBhZGp1c3RlZFNpemUud2lkdGggLSBob3N0RWxlbVBvcy53aWR0aCA+IHZpZXdwb3J0T2Zmc2V0LnJpZ2h0ICYmIGFkanVzdGVkU2l6ZS53aWR0aCAtIGhvc3RFbGVtUG9zLndpZHRoIDw9IHZpZXdwb3J0T2Zmc2V0LmxlZnQgPyAncmlnaHQnIDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgIHBsYWNlbWVudFsxXSA9PT0gJ3JpZ2h0JyAmJiBhZGp1c3RlZFNpemUud2lkdGggLSBob3N0RWxlbVBvcy53aWR0aCA+IHZpZXdwb3J0T2Zmc2V0LmxlZnQgJiYgYWRqdXN0ZWRTaXplLndpZHRoIC0gaG9zdEVsZW1Qb3Mud2lkdGggPD0gdmlld3BvcnRPZmZzZXQucmlnaHQgPyAnbGVmdCcgOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgcGxhY2VtZW50WzFdO1xyXG5cclxuICAgICAgICAgIGlmIChwbGFjZW1lbnRbMV0gPT09ICdjZW50ZXInKSB7XHJcbiAgICAgICAgICAgIGlmIChQTEFDRU1FTlRfUkVHRVgudmVydGljYWwudGVzdChwbGFjZW1lbnRbMF0pKSB7XHJcbiAgICAgICAgICAgICAgdmFyIHhPdmVyZmxvdyA9IGhvc3RFbGVtUG9zLndpZHRoIC8gMiAtIHRhcmdldFdpZHRoIC8gMjtcclxuICAgICAgICAgICAgICBpZiAodmlld3BvcnRPZmZzZXQubGVmdCArIHhPdmVyZmxvdyA8IDAgJiYgYWRqdXN0ZWRTaXplLndpZHRoIC0gaG9zdEVsZW1Qb3Mud2lkdGggPD0gdmlld3BvcnRPZmZzZXQucmlnaHQpIHtcclxuICAgICAgICAgICAgICAgIHBsYWNlbWVudFsxXSA9ICdsZWZ0JztcclxuICAgICAgICAgICAgICB9IGVsc2UgaWYgKHZpZXdwb3J0T2Zmc2V0LnJpZ2h0ICsgeE92ZXJmbG93IDwgMCAmJiBhZGp1c3RlZFNpemUud2lkdGggLSBob3N0RWxlbVBvcy53aWR0aCA8PSB2aWV3cG9ydE9mZnNldC5sZWZ0KSB7XHJcbiAgICAgICAgICAgICAgICBwbGFjZW1lbnRbMV0gPSAncmlnaHQnO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICB2YXIgeU92ZXJmbG93ID0gaG9zdEVsZW1Qb3MuaGVpZ2h0IC8gMiAtIGFkanVzdGVkU2l6ZS5oZWlnaHQgLyAyO1xyXG4gICAgICAgICAgICAgIGlmICh2aWV3cG9ydE9mZnNldC50b3AgKyB5T3ZlcmZsb3cgPCAwICYmIGFkanVzdGVkU2l6ZS5oZWlnaHQgLSBob3N0RWxlbVBvcy5oZWlnaHQgPD0gdmlld3BvcnRPZmZzZXQuYm90dG9tKSB7XHJcbiAgICAgICAgICAgICAgICBwbGFjZW1lbnRbMV0gPSAndG9wJztcclxuICAgICAgICAgICAgICB9IGVsc2UgaWYgKHZpZXdwb3J0T2Zmc2V0LmJvdHRvbSArIHlPdmVyZmxvdyA8IDAgJiYgYWRqdXN0ZWRTaXplLmhlaWdodCAtIGhvc3RFbGVtUG9zLmhlaWdodCA8PSB2aWV3cG9ydE9mZnNldC50b3ApIHtcclxuICAgICAgICAgICAgICAgIHBsYWNlbWVudFsxXSA9ICdib3R0b20nO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgc3dpdGNoIChwbGFjZW1lbnRbMF0pIHtcclxuICAgICAgICAgIGNhc2UgJ3RvcCc6XHJcbiAgICAgICAgICAgIHRhcmdldEVsZW1Qb3MudG9wID0gaG9zdEVsZW1Qb3MudG9wIC0gdGFyZ2V0SGVpZ2h0O1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgIGNhc2UgJ2JvdHRvbSc6XHJcbiAgICAgICAgICAgIHRhcmdldEVsZW1Qb3MudG9wID0gaG9zdEVsZW1Qb3MudG9wICsgaG9zdEVsZW1Qb3MuaGVpZ2h0O1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgIGNhc2UgJ2xlZnQnOlxyXG4gICAgICAgICAgICB0YXJnZXRFbGVtUG9zLmxlZnQgPSBob3N0RWxlbVBvcy5sZWZ0IC0gdGFyZ2V0V2lkdGg7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgY2FzZSAncmlnaHQnOlxyXG4gICAgICAgICAgICB0YXJnZXRFbGVtUG9zLmxlZnQgPSBob3N0RWxlbVBvcy5sZWZ0ICsgaG9zdEVsZW1Qb3Mud2lkdGg7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgc3dpdGNoIChwbGFjZW1lbnRbMV0pIHtcclxuICAgICAgICAgIGNhc2UgJ3RvcCc6XHJcbiAgICAgICAgICAgIHRhcmdldEVsZW1Qb3MudG9wID0gaG9zdEVsZW1Qb3MudG9wO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgIGNhc2UgJ2JvdHRvbSc6XHJcbiAgICAgICAgICAgIHRhcmdldEVsZW1Qb3MudG9wID0gaG9zdEVsZW1Qb3MudG9wICsgaG9zdEVsZW1Qb3MuaGVpZ2h0IC0gdGFyZ2V0SGVpZ2h0O1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgIGNhc2UgJ2xlZnQnOlxyXG4gICAgICAgICAgICB0YXJnZXRFbGVtUG9zLmxlZnQgPSBob3N0RWxlbVBvcy5sZWZ0O1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgIGNhc2UgJ3JpZ2h0JzpcclxuICAgICAgICAgICAgdGFyZ2V0RWxlbVBvcy5sZWZ0ID0gaG9zdEVsZW1Qb3MubGVmdCArIGhvc3RFbGVtUG9zLndpZHRoIC0gdGFyZ2V0V2lkdGg7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgY2FzZSAnY2VudGVyJzpcclxuICAgICAgICAgICAgaWYgKFBMQUNFTUVOVF9SRUdFWC52ZXJ0aWNhbC50ZXN0KHBsYWNlbWVudFswXSkpIHtcclxuICAgICAgICAgICAgICB0YXJnZXRFbGVtUG9zLmxlZnQgPSBob3N0RWxlbVBvcy5sZWZ0ICsgaG9zdEVsZW1Qb3Mud2lkdGggLyAyIC0gdGFyZ2V0V2lkdGggLyAyO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIHRhcmdldEVsZW1Qb3MudG9wID0gaG9zdEVsZW1Qb3MudG9wICsgaG9zdEVsZW1Qb3MuaGVpZ2h0IC8gMiAtIHRhcmdldEhlaWdodCAvIDI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0YXJnZXRFbGVtUG9zLnRvcCA9IE1hdGgucm91bmQodGFyZ2V0RWxlbVBvcy50b3ApO1xyXG4gICAgICAgIHRhcmdldEVsZW1Qb3MubGVmdCA9IE1hdGgucm91bmQodGFyZ2V0RWxlbVBvcy5sZWZ0KTtcclxuICAgICAgICB0YXJnZXRFbGVtUG9zLnBsYWNlbWVudCA9IHBsYWNlbWVudFsxXSA9PT0gJ2NlbnRlcicgPyBwbGFjZW1lbnRbMF0gOiBwbGFjZW1lbnRbMF0gKyAnLScgKyBwbGFjZW1lbnRbMV07XHJcblxyXG4gICAgICAgIHJldHVybiB0YXJnZXRFbGVtUG9zO1xyXG4gICAgICB9LFxyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIFByb3ZpZGVzIGEgd2F5IHRvIGFkanVzdCB0aGUgdG9wIHBvc2l0aW9uaW5nIGFmdGVyIGZpcnN0XHJcbiAgICAgICAqIHJlbmRlciB0byBjb3JyZWN0bHkgYWxpZ24gZWxlbWVudCB0byB0b3AgYWZ0ZXIgY29udGVudFxyXG4gICAgICAgKiByZW5kZXJpbmcgY2F1c2VzIHJlc2l6ZWQgZWxlbWVudCBoZWlnaHRcclxuICAgICAgICpcclxuICAgICAgICogQHBhcmFtIHthcnJheX0gcGxhY2VtZW50Q2xhc3NlcyAtIFRoZSBhcnJheSBvZiBzdHJpbmdzIG9mIGNsYXNzZXNcclxuICAgICAgICogZWxlbWVudCBzaG91bGQgaGF2ZS5cclxuICAgICAgICogQHBhcmFtIHtvYmplY3R9IGNvbnRhaW5lclBvc2l0aW9uIC0gVGhlIG9iamVjdCB3aXRoIGNvbnRhaW5lclxyXG4gICAgICAgKiBwb3NpdGlvbiBpbmZvcm1hdGlvblxyXG4gICAgICAgKiBAcGFyYW0ge251bWJlcn0gaW5pdGlhbEhlaWdodCAtIFRoZSBpbml0aWFsIGhlaWdodCBmb3IgdGhlIGVsZW0uXHJcbiAgICAgICAqIEBwYXJhbSB7bnVtYmVyfSBjdXJyZW50SGVpZ2h0IC0gVGhlIGN1cnJlbnQgaGVpZ2h0IGZvciB0aGUgZWxlbS5cclxuICAgICAgICovXHJcbiAgICAgIGFkanVzdFRvcDogZnVuY3Rpb24ocGxhY2VtZW50Q2xhc3NlcywgY29udGFpbmVyUG9zaXRpb24sIGluaXRpYWxIZWlnaHQsIGN1cnJlbnRIZWlnaHQpIHtcclxuICAgICAgICBpZiAocGxhY2VtZW50Q2xhc3Nlcy5pbmRleE9mKCd0b3AnKSAhPT0gLTEgJiYgaW5pdGlhbEhlaWdodCAhPT0gY3VycmVudEhlaWdodCkge1xyXG4gICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgdG9wOiBjb250YWluZXJQb3NpdGlvbi50b3AgLSBjdXJyZW50SGVpZ2h0ICsgJ3B4J1xyXG4gICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogUHJvdmlkZXMgYSB3YXkgZm9yIHBvc2l0aW9uaW5nIHRvb2x0aXAgJiBkcm9wZG93blxyXG4gICAgICAgKiBhcnJvd3Mgd2hlbiB1c2luZyBwbGFjZW1lbnQgb3B0aW9ucyBiZXlvbmQgdGhlIHN0YW5kYXJkXHJcbiAgICAgICAqIGxlZnQsIHJpZ2h0LCB0b3AsIG9yIGJvdHRvbS5cclxuICAgICAgICpcclxuICAgICAgICogQHBhcmFtIHtlbGVtZW50fSBlbGVtIC0gVGhlIHRvb2x0aXAvZHJvcGRvd24gZWxlbWVudC5cclxuICAgICAgICogQHBhcmFtIHtzdHJpbmd9IHBsYWNlbWVudCAtIFRoZSBwbGFjZW1lbnQgZm9yIHRoZSBlbGVtLlxyXG4gICAgICAgKi9cclxuICAgICAgcG9zaXRpb25BcnJvdzogZnVuY3Rpb24oZWxlbSwgcGxhY2VtZW50KSB7XHJcbiAgICAgICAgZWxlbSA9IHRoaXMuZ2V0UmF3Tm9kZShlbGVtKTtcclxuXHJcbiAgICAgICAgdmFyIGlubmVyRWxlbSA9IGVsZW0ucXVlcnlTZWxlY3RvcignLnRvb2x0aXAtaW5uZXIsIC5wb3BvdmVyLWlubmVyJyk7XHJcbiAgICAgICAgaWYgKCFpbm5lckVsZW0pIHtcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhciBpc1Rvb2x0aXAgPSBhbmd1bGFyLmVsZW1lbnQoaW5uZXJFbGVtKS5oYXNDbGFzcygndG9vbHRpcC1pbm5lcicpO1xyXG5cclxuICAgICAgICB2YXIgYXJyb3dFbGVtID0gaXNUb29sdGlwID8gZWxlbS5xdWVyeVNlbGVjdG9yKCcudG9vbHRpcC1hcnJvdycpIDogZWxlbS5xdWVyeVNlbGVjdG9yKCcuYXJyb3cnKTtcclxuICAgICAgICBpZiAoIWFycm93RWxlbSkge1xyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdmFyIGFycm93Q3NzID0ge1xyXG4gICAgICAgICAgdG9wOiAnJyxcclxuICAgICAgICAgIGJvdHRvbTogJycsXHJcbiAgICAgICAgICBsZWZ0OiAnJyxcclxuICAgICAgICAgIHJpZ2h0OiAnJ1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHBsYWNlbWVudCA9IHRoaXMucGFyc2VQbGFjZW1lbnQocGxhY2VtZW50KTtcclxuICAgICAgICBpZiAocGxhY2VtZW50WzFdID09PSAnY2VudGVyJykge1xyXG4gICAgICAgICAgLy8gbm8gYWRqdXN0bWVudCBuZWNlc3NhcnkgLSBqdXN0IHJlc2V0IHN0eWxlc1xyXG4gICAgICAgICAgYW5ndWxhci5lbGVtZW50KGFycm93RWxlbSkuY3NzKGFycm93Q3NzKTtcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhciBib3JkZXJQcm9wID0gJ2JvcmRlci0nICsgcGxhY2VtZW50WzBdICsgJy13aWR0aCc7XHJcbiAgICAgICAgdmFyIGJvcmRlcldpZHRoID0gJHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKGFycm93RWxlbSlbYm9yZGVyUHJvcF07XHJcblxyXG4gICAgICAgIHZhciBib3JkZXJSYWRpdXNQcm9wID0gJ2JvcmRlci0nO1xyXG4gICAgICAgIGlmIChQTEFDRU1FTlRfUkVHRVgudmVydGljYWwudGVzdChwbGFjZW1lbnRbMF0pKSB7XHJcbiAgICAgICAgICBib3JkZXJSYWRpdXNQcm9wICs9IHBsYWNlbWVudFswXSArICctJyArIHBsYWNlbWVudFsxXTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgYm9yZGVyUmFkaXVzUHJvcCArPSBwbGFjZW1lbnRbMV0gKyAnLScgKyBwbGFjZW1lbnRbMF07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGJvcmRlclJhZGl1c1Byb3AgKz0gJy1yYWRpdXMnO1xyXG4gICAgICAgIHZhciBib3JkZXJSYWRpdXMgPSAkd2luZG93LmdldENvbXB1dGVkU3R5bGUoaXNUb29sdGlwID8gaW5uZXJFbGVtIDogZWxlbSlbYm9yZGVyUmFkaXVzUHJvcF07XHJcblxyXG4gICAgICAgIHN3aXRjaCAocGxhY2VtZW50WzBdKSB7XHJcbiAgICAgICAgICBjYXNlICd0b3AnOlxyXG4gICAgICAgICAgICBhcnJvd0Nzcy5ib3R0b20gPSBpc1Rvb2x0aXAgPyAnMCcgOiAnLScgKyBib3JkZXJXaWR0aDtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICBjYXNlICdib3R0b20nOlxyXG4gICAgICAgICAgICBhcnJvd0Nzcy50b3AgPSBpc1Rvb2x0aXAgPyAnMCcgOiAnLScgKyBib3JkZXJXaWR0aDtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICBjYXNlICdsZWZ0JzpcclxuICAgICAgICAgICAgYXJyb3dDc3MucmlnaHQgPSBpc1Rvb2x0aXAgPyAnMCcgOiAnLScgKyBib3JkZXJXaWR0aDtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICBjYXNlICdyaWdodCc6XHJcbiAgICAgICAgICAgIGFycm93Q3NzLmxlZnQgPSBpc1Rvb2x0aXAgPyAnMCcgOiAnLScgKyBib3JkZXJXaWR0aDtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBhcnJvd0Nzc1twbGFjZW1lbnRbMV1dID0gYm9yZGVyUmFkaXVzO1xyXG5cclxuICAgICAgICBhbmd1bGFyLmVsZW1lbnQoYXJyb3dFbGVtKS5jc3MoYXJyb3dDc3MpO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG4gIH1dKTtcclxuXHJcbmFuZ3VsYXIubW9kdWxlKCd1aS5ib290c3RyYXAuZGF0ZXBpY2tlclBvcHVwJywgWyd1aS5ib290c3RyYXAuZGF0ZXBpY2tlcicsICd1aS5ib290c3RyYXAucG9zaXRpb24nXSlcclxuXHJcbi52YWx1ZSgnJGRhdGVwaWNrZXJQb3B1cExpdGVyYWxXYXJuaW5nJywgdHJ1ZSlcclxuXHJcbi5jb25zdGFudCgndWliRGF0ZXBpY2tlclBvcHVwQ29uZmlnJywge1xyXG4gIGFsdElucHV0Rm9ybWF0czogW10sXHJcbiAgYXBwZW5kVG9Cb2R5OiBmYWxzZSxcclxuICBjbGVhclRleHQ6ICdDbGVhcicsXHJcbiAgY2xvc2VPbkRhdGVTZWxlY3Rpb246IHRydWUsXHJcbiAgY2xvc2VUZXh0OiAnRG9uZScsXHJcbiAgY3VycmVudFRleHQ6ICdUb2RheScsXHJcbiAgZGF0ZXBpY2tlclBvcHVwOiAneXl5eS1NTS1kZCcsXHJcbiAgZGF0ZXBpY2tlclBvcHVwVGVtcGxhdGVVcmw6ICd1aWIvdGVtcGxhdGUvZGF0ZXBpY2tlclBvcHVwL3BvcHVwLmh0bWwnLFxyXG4gIGRhdGVwaWNrZXJUZW1wbGF0ZVVybDogJ3VpYi90ZW1wbGF0ZS9kYXRlcGlja2VyL2RhdGVwaWNrZXIuaHRtbCcsXHJcbiAgaHRtbDVUeXBlczoge1xyXG4gICAgZGF0ZTogJ3l5eXktTU0tZGQnLFxyXG4gICAgJ2RhdGV0aW1lLWxvY2FsJzogJ3l5eXktTU0tZGRUSEg6bW06c3Muc3NzJyxcclxuICAgICdtb250aCc6ICd5eXl5LU1NJ1xyXG4gIH0sXHJcbiAgb25PcGVuRm9jdXM6IHRydWUsXHJcbiAgc2hvd0J1dHRvbkJhcjogdHJ1ZSxcclxuICBwbGFjZW1lbnQ6ICdhdXRvIGJvdHRvbS1sZWZ0J1xyXG59KVxyXG5cclxuLmNvbnRyb2xsZXIoJ1VpYkRhdGVwaWNrZXJQb3B1cENvbnRyb2xsZXInLCBbJyRzY29wZScsICckZWxlbWVudCcsICckYXR0cnMnLCAnJGNvbXBpbGUnLCAnJGxvZycsICckcGFyc2UnLCAnJHdpbmRvdycsICckZG9jdW1lbnQnLCAnJHJvb3RTY29wZScsICckdWliUG9zaXRpb24nLCAnZGF0ZUZpbHRlcicsICd1aWJEYXRlUGFyc2VyJywgJ3VpYkRhdGVwaWNrZXJQb3B1cENvbmZpZycsICckdGltZW91dCcsICd1aWJEYXRlcGlja2VyQ29uZmlnJywgJyRkYXRlcGlja2VyUG9wdXBMaXRlcmFsV2FybmluZycsXHJcbmZ1bmN0aW9uKCRzY29wZSwgJGVsZW1lbnQsICRhdHRycywgJGNvbXBpbGUsICRsb2csICRwYXJzZSwgJHdpbmRvdywgJGRvY3VtZW50LCAkcm9vdFNjb3BlLCAkcG9zaXRpb24sIGRhdGVGaWx0ZXIsIGRhdGVQYXJzZXIsIGRhdGVwaWNrZXJQb3B1cENvbmZpZywgJHRpbWVvdXQsIGRhdGVwaWNrZXJDb25maWcsICRkYXRlcGlja2VyUG9wdXBMaXRlcmFsV2FybmluZykge1xyXG4gIHZhciBjYWNoZSA9IHt9LFxyXG4gICAgaXNIdG1sNURhdGVJbnB1dCA9IGZhbHNlO1xyXG4gIHZhciBkYXRlRm9ybWF0LCBjbG9zZU9uRGF0ZVNlbGVjdGlvbiwgYXBwZW5kVG9Cb2R5LCBvbk9wZW5Gb2N1cyxcclxuICAgIGRhdGVwaWNrZXJQb3B1cFRlbXBsYXRlVXJsLCBkYXRlcGlja2VyVGVtcGxhdGVVcmwsIHBvcHVwRWwsIGRhdGVwaWNrZXJFbCwgc2Nyb2xsUGFyZW50RWwsXHJcbiAgICBuZ01vZGVsLCBuZ01vZGVsT3B0aW9ucywgJHBvcHVwLCBhbHRJbnB1dEZvcm1hdHMsIHdhdGNoTGlzdGVuZXJzID0gW107XHJcblxyXG4gIHRoaXMuaW5pdCA9IGZ1bmN0aW9uKF9uZ01vZGVsXykge1xyXG4gICAgbmdNb2RlbCA9IF9uZ01vZGVsXztcclxuICAgIG5nTW9kZWxPcHRpb25zID0gYW5ndWxhci5pc09iamVjdChfbmdNb2RlbF8uJG9wdGlvbnMpID9cclxuICAgICAgX25nTW9kZWxfLiRvcHRpb25zIDpcclxuICAgICAge1xyXG4gICAgICAgIHRpbWV6b25lOiBudWxsXHJcbiAgICAgIH07XHJcbiAgICBjbG9zZU9uRGF0ZVNlbGVjdGlvbiA9IGFuZ3VsYXIuaXNEZWZpbmVkKCRhdHRycy5jbG9zZU9uRGF0ZVNlbGVjdGlvbikgP1xyXG4gICAgICAkc2NvcGUuJHBhcmVudC4kZXZhbCgkYXR0cnMuY2xvc2VPbkRhdGVTZWxlY3Rpb24pIDpcclxuICAgICAgZGF0ZXBpY2tlclBvcHVwQ29uZmlnLmNsb3NlT25EYXRlU2VsZWN0aW9uO1xyXG4gICAgYXBwZW5kVG9Cb2R5ID0gYW5ndWxhci5pc0RlZmluZWQoJGF0dHJzLmRhdGVwaWNrZXJBcHBlbmRUb0JvZHkpID9cclxuICAgICAgJHNjb3BlLiRwYXJlbnQuJGV2YWwoJGF0dHJzLmRhdGVwaWNrZXJBcHBlbmRUb0JvZHkpIDpcclxuICAgICAgZGF0ZXBpY2tlclBvcHVwQ29uZmlnLmFwcGVuZFRvQm9keTtcclxuICAgIG9uT3BlbkZvY3VzID0gYW5ndWxhci5pc0RlZmluZWQoJGF0dHJzLm9uT3BlbkZvY3VzKSA/XHJcbiAgICAgICRzY29wZS4kcGFyZW50LiRldmFsKCRhdHRycy5vbk9wZW5Gb2N1cykgOiBkYXRlcGlja2VyUG9wdXBDb25maWcub25PcGVuRm9jdXM7XHJcbiAgICBkYXRlcGlja2VyUG9wdXBUZW1wbGF0ZVVybCA9IGFuZ3VsYXIuaXNEZWZpbmVkKCRhdHRycy5kYXRlcGlja2VyUG9wdXBUZW1wbGF0ZVVybCkgP1xyXG4gICAgICAkYXR0cnMuZGF0ZXBpY2tlclBvcHVwVGVtcGxhdGVVcmwgOlxyXG4gICAgICBkYXRlcGlja2VyUG9wdXBDb25maWcuZGF0ZXBpY2tlclBvcHVwVGVtcGxhdGVVcmw7XHJcbiAgICBkYXRlcGlja2VyVGVtcGxhdGVVcmwgPSBhbmd1bGFyLmlzRGVmaW5lZCgkYXR0cnMuZGF0ZXBpY2tlclRlbXBsYXRlVXJsKSA/XHJcbiAgICAgICRhdHRycy5kYXRlcGlja2VyVGVtcGxhdGVVcmwgOiBkYXRlcGlja2VyUG9wdXBDb25maWcuZGF0ZXBpY2tlclRlbXBsYXRlVXJsO1xyXG4gICAgYWx0SW5wdXRGb3JtYXRzID0gYW5ndWxhci5pc0RlZmluZWQoJGF0dHJzLmFsdElucHV0Rm9ybWF0cykgP1xyXG4gICAgICAkc2NvcGUuJHBhcmVudC4kZXZhbCgkYXR0cnMuYWx0SW5wdXRGb3JtYXRzKSA6XHJcbiAgICAgIGRhdGVwaWNrZXJQb3B1cENvbmZpZy5hbHRJbnB1dEZvcm1hdHM7XHJcblxyXG4gICAgJHNjb3BlLnNob3dCdXR0b25CYXIgPSBhbmd1bGFyLmlzRGVmaW5lZCgkYXR0cnMuc2hvd0J1dHRvbkJhcikgP1xyXG4gICAgICAkc2NvcGUuJHBhcmVudC4kZXZhbCgkYXR0cnMuc2hvd0J1dHRvbkJhcikgOlxyXG4gICAgICBkYXRlcGlja2VyUG9wdXBDb25maWcuc2hvd0J1dHRvbkJhcjtcclxuXHJcbiAgICBpZiAoZGF0ZXBpY2tlclBvcHVwQ29uZmlnLmh0bWw1VHlwZXNbJGF0dHJzLnR5cGVdKSB7XHJcbiAgICAgIGRhdGVGb3JtYXQgPSBkYXRlcGlja2VyUG9wdXBDb25maWcuaHRtbDVUeXBlc1skYXR0cnMudHlwZV07XHJcbiAgICAgIGlzSHRtbDVEYXRlSW5wdXQgPSB0cnVlO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgZGF0ZUZvcm1hdCA9ICRhdHRycy51aWJEYXRlcGlja2VyUG9wdXAgfHwgZGF0ZXBpY2tlclBvcHVwQ29uZmlnLmRhdGVwaWNrZXJQb3B1cDtcclxuICAgICAgJGF0dHJzLiRvYnNlcnZlKCd1aWJEYXRlcGlja2VyUG9wdXAnLCBmdW5jdGlvbih2YWx1ZSwgb2xkVmFsdWUpIHtcclxuICAgICAgICB2YXIgbmV3RGF0ZUZvcm1hdCA9IHZhbHVlIHx8IGRhdGVwaWNrZXJQb3B1cENvbmZpZy5kYXRlcGlja2VyUG9wdXA7XHJcbiAgICAgICAgLy8gSW52YWxpZGF0ZSB0aGUgJG1vZGVsVmFsdWUgdG8gZW5zdXJlIHRoYXQgZm9ybWF0dGVycyByZS1ydW5cclxuICAgICAgICAvLyBGSVhNRTogUmVmYWN0b3Igd2hlbiBQUiBpcyBtZXJnZWQ6IGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2FuZ3VsYXIuanMvcHVsbC8xMDc2NFxyXG4gICAgICAgIGlmIChuZXdEYXRlRm9ybWF0ICE9PSBkYXRlRm9ybWF0KSB7XHJcbiAgICAgICAgICBkYXRlRm9ybWF0ID0gbmV3RGF0ZUZvcm1hdDtcclxuICAgICAgICAgIG5nTW9kZWwuJG1vZGVsVmFsdWUgPSBudWxsO1xyXG5cclxuICAgICAgICAgIGlmICghZGF0ZUZvcm1hdCkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ3VpYkRhdGVwaWNrZXJQb3B1cCBtdXN0IGhhdmUgYSBkYXRlIGZvcm1hdCBzcGVjaWZpZWQuJyk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIWRhdGVGb3JtYXQpIHtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKCd1aWJEYXRlcGlja2VyUG9wdXAgbXVzdCBoYXZlIGEgZGF0ZSBmb3JtYXQgc3BlY2lmaWVkLicpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChpc0h0bWw1RGF0ZUlucHV0ICYmICRhdHRycy51aWJEYXRlcGlja2VyUG9wdXApIHtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdIVE1MNSBkYXRlIGlucHV0IHR5cGVzIGRvIG5vdCBzdXBwb3J0IGN1c3RvbSBmb3JtYXRzLicpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIHBvcHVwIGVsZW1lbnQgdXNlZCB0byBkaXNwbGF5IGNhbGVuZGFyXHJcbiAgICBwb3B1cEVsID0gYW5ndWxhci5lbGVtZW50KCc8ZGl2IHVpYi1kYXRlcGlja2VyLXBvcHVwLXdyYXA+PGRpdiB1aWItZGF0ZXBpY2tlcj48L2Rpdj48L2Rpdj4nKTtcclxuXHJcbiAgICBwb3B1cEVsLmF0dHIoe1xyXG4gICAgICAnbmctbW9kZWwnOiAnZGF0ZScsXHJcbiAgICAgICduZy1jaGFuZ2UnOiAnZGF0ZVNlbGVjdGlvbihkYXRlKScsXHJcbiAgICAgICd0ZW1wbGF0ZS11cmwnOiBkYXRlcGlja2VyUG9wdXBUZW1wbGF0ZVVybFxyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gZGF0ZXBpY2tlciBlbGVtZW50XHJcbiAgICBkYXRlcGlja2VyRWwgPSBhbmd1bGFyLmVsZW1lbnQocG9wdXBFbC5jaGlsZHJlbigpWzBdKTtcclxuICAgIGRhdGVwaWNrZXJFbC5hdHRyKCd0ZW1wbGF0ZS11cmwnLCBkYXRlcGlja2VyVGVtcGxhdGVVcmwpO1xyXG5cclxuICAgIGlmICghJHNjb3BlLmRhdGVwaWNrZXJPcHRpb25zKSB7XHJcbiAgICAgICRzY29wZS5kYXRlcGlja2VyT3B0aW9ucyA9IHt9O1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChpc0h0bWw1RGF0ZUlucHV0KSB7XHJcbiAgICAgIGlmICgkYXR0cnMudHlwZSA9PT0gJ21vbnRoJykge1xyXG4gICAgICAgICRzY29wZS5kYXRlcGlja2VyT3B0aW9ucy5kYXRlcGlja2VyTW9kZSA9ICdtb250aCc7XHJcbiAgICAgICAgJHNjb3BlLmRhdGVwaWNrZXJPcHRpb25zLm1pbk1vZGUgPSAnbW9udGgnO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZGF0ZXBpY2tlckVsLmF0dHIoJ2RhdGVwaWNrZXItb3B0aW9ucycsICdkYXRlcGlja2VyT3B0aW9ucycpO1xyXG5cclxuICAgIGlmICghaXNIdG1sNURhdGVJbnB1dCkge1xyXG4gICAgICAvLyBJbnRlcm5hbCBBUEkgdG8gbWFpbnRhaW4gdGhlIGNvcnJlY3QgbmctaW52YWxpZC1ba2V5XSBjbGFzc1xyXG4gICAgICBuZ01vZGVsLiQkcGFyc2VyTmFtZSA9ICdkYXRlJztcclxuICAgICAgbmdNb2RlbC4kdmFsaWRhdG9ycy5kYXRlID0gdmFsaWRhdG9yO1xyXG4gICAgICBuZ01vZGVsLiRwYXJzZXJzLnVuc2hpZnQocGFyc2VEYXRlKTtcclxuICAgICAgbmdNb2RlbC4kZm9ybWF0dGVycy5wdXNoKGZ1bmN0aW9uKHZhbHVlKSB7XHJcbiAgICAgICAgaWYgKG5nTW9kZWwuJGlzRW1wdHkodmFsdWUpKSB7XHJcbiAgICAgICAgICAkc2NvcGUuZGF0ZSA9IHZhbHVlO1xyXG4gICAgICAgICAgcmV0dXJuIHZhbHVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGFuZ3VsYXIuaXNOdW1iZXIodmFsdWUpKSB7XHJcbiAgICAgICAgICB2YWx1ZSA9IG5ldyBEYXRlKHZhbHVlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgICRzY29wZS5kYXRlID0gZGF0ZVBhcnNlci5mcm9tVGltZXpvbmUodmFsdWUsIG5nTW9kZWxPcHRpb25zLnRpbWV6b25lKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGRhdGVQYXJzZXIuZmlsdGVyKCRzY29wZS5kYXRlLCBkYXRlRm9ybWF0KTtcclxuICAgICAgfSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBuZ01vZGVsLiRmb3JtYXR0ZXJzLnB1c2goZnVuY3Rpb24odmFsdWUpIHtcclxuICAgICAgICAkc2NvcGUuZGF0ZSA9IGRhdGVQYXJzZXIuZnJvbVRpbWV6b25lKHZhbHVlLCBuZ01vZGVsT3B0aW9ucy50aW1lem9uZSk7XHJcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBEZXRlY3QgY2hhbmdlcyBpbiB0aGUgdmlldyBmcm9tIHRoZSB0ZXh0IGJveFxyXG4gICAgbmdNb2RlbC4kdmlld0NoYW5nZUxpc3RlbmVycy5wdXNoKGZ1bmN0aW9uKCkge1xyXG4gICAgICAkc2NvcGUuZGF0ZSA9IHBhcnNlRGF0ZVN0cmluZyhuZ01vZGVsLiR2aWV3VmFsdWUpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgJGVsZW1lbnQub24oJ2tleWRvd24nLCBpbnB1dEtleWRvd25CaW5kKTtcclxuXHJcbiAgICAkcG9wdXAgPSAkY29tcGlsZShwb3B1cEVsKSgkc2NvcGUpO1xyXG4gICAgLy8gUHJldmVudCBqUXVlcnkgY2FjaGUgbWVtb3J5IGxlYWsgKHRlbXBsYXRlIGlzIG5vdyByZWR1bmRhbnQgYWZ0ZXIgbGlua2luZylcclxuICAgIHBvcHVwRWwucmVtb3ZlKCk7XHJcblxyXG4gICAgaWYgKGFwcGVuZFRvQm9keSkge1xyXG4gICAgICAkZG9jdW1lbnQuZmluZCgnYm9keScpLmFwcGVuZCgkcG9wdXApO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgJGVsZW1lbnQuYWZ0ZXIoJHBvcHVwKTtcclxuICAgIH1cclxuXHJcbiAgICAkc2NvcGUuJG9uKCckZGVzdHJveScsIGZ1bmN0aW9uKCkge1xyXG4gICAgICBpZiAoJHNjb3BlLmlzT3BlbiA9PT0gdHJ1ZSkge1xyXG4gICAgICAgIGlmICghJHJvb3RTY29wZS4kJHBoYXNlKSB7XHJcbiAgICAgICAgICAkc2NvcGUuJGFwcGx5KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAkc2NvcGUuaXNPcGVuID0gZmFsc2U7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgICRwb3B1cC5yZW1vdmUoKTtcclxuICAgICAgJGVsZW1lbnQub2ZmKCdrZXlkb3duJywgaW5wdXRLZXlkb3duQmluZCk7XHJcbiAgICAgICRkb2N1bWVudC5vZmYoJ2NsaWNrJywgZG9jdW1lbnRDbGlja0JpbmQpO1xyXG4gICAgICBpZiAoc2Nyb2xsUGFyZW50RWwpIHtcclxuICAgICAgICBzY3JvbGxQYXJlbnRFbC5vZmYoJ3Njcm9sbCcsIHBvc2l0aW9uUG9wdXApO1xyXG4gICAgICB9XHJcbiAgICAgIGFuZ3VsYXIuZWxlbWVudCgkd2luZG93KS5vZmYoJ3Jlc2l6ZScsIHBvc2l0aW9uUG9wdXApO1xyXG5cclxuICAgICAgLy9DbGVhciBhbGwgd2F0Y2ggbGlzdGVuZXJzIG9uIGRlc3Ryb3lcclxuICAgICAgd2hpbGUgKHdhdGNoTGlzdGVuZXJzLmxlbmd0aCkge1xyXG4gICAgICAgIHdhdGNoTGlzdGVuZXJzLnNoaWZ0KCkoKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgfTtcclxuXHJcbiAgJHNjb3BlLmdldFRleHQgPSBmdW5jdGlvbihrZXkpIHtcclxuICAgIHJldHVybiAkc2NvcGVba2V5ICsgJ1RleHQnXSB8fCBkYXRlcGlja2VyUG9wdXBDb25maWdba2V5ICsgJ1RleHQnXTtcclxuICB9O1xyXG5cclxuICAkc2NvcGUuaXNEaXNhYmxlZCA9IGZ1bmN0aW9uKGRhdGUpIHtcclxuICAgIGlmIChkYXRlID09PSAndG9kYXknKSB7XHJcbiAgICAgIGRhdGUgPSBkYXRlUGFyc2VyLmZyb21UaW1lem9uZShuZXcgRGF0ZSgpLCBuZ01vZGVsT3B0aW9ucy50aW1lem9uZSk7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGRhdGVzID0ge307XHJcbiAgICBhbmd1bGFyLmZvckVhY2goWydtaW5EYXRlJywgJ21heERhdGUnXSwgZnVuY3Rpb24oa2V5KSB7XHJcbiAgICAgIGlmICghJHNjb3BlLmRhdGVwaWNrZXJPcHRpb25zW2tleV0pIHtcclxuICAgICAgICBkYXRlc1trZXldID0gbnVsbDtcclxuICAgICAgfSBlbHNlIGlmIChhbmd1bGFyLmlzRGF0ZSgkc2NvcGUuZGF0ZXBpY2tlck9wdGlvbnNba2V5XSkpIHtcclxuICAgICAgICBkYXRlc1trZXldID0gbmV3IERhdGUoJHNjb3BlLmRhdGVwaWNrZXJPcHRpb25zW2tleV0pO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGlmICgkZGF0ZXBpY2tlclBvcHVwTGl0ZXJhbFdhcm5pbmcpIHtcclxuICAgICAgICAgICRsb2cud2FybignTGl0ZXJhbCBkYXRlIHN1cHBvcnQgaGFzIGJlZW4gZGVwcmVjYXRlZCwgcGxlYXNlIHN3aXRjaCB0byBkYXRlIG9iamVjdCB1c2FnZScpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZGF0ZXNba2V5XSA9IG5ldyBEYXRlKGRhdGVGaWx0ZXIoJHNjb3BlLmRhdGVwaWNrZXJPcHRpb25zW2tleV0sICdtZWRpdW0nKSk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIHJldHVybiAkc2NvcGUuZGF0ZXBpY2tlck9wdGlvbnMgJiZcclxuICAgICAgZGF0ZXMubWluRGF0ZSAmJiAkc2NvcGUuY29tcGFyZShkYXRlLCBkYXRlcy5taW5EYXRlKSA8IDAgfHxcclxuICAgICAgZGF0ZXMubWF4RGF0ZSAmJiAkc2NvcGUuY29tcGFyZShkYXRlLCBkYXRlcy5tYXhEYXRlKSA+IDA7XHJcbiAgfTtcclxuXHJcbiAgJHNjb3BlLmNvbXBhcmUgPSBmdW5jdGlvbihkYXRlMSwgZGF0ZTIpIHtcclxuICAgIHJldHVybiBuZXcgRGF0ZShkYXRlMS5nZXRGdWxsWWVhcigpLCBkYXRlMS5nZXRNb250aCgpLCBkYXRlMS5nZXREYXRlKCkpIC0gbmV3IERhdGUoZGF0ZTIuZ2V0RnVsbFllYXIoKSwgZGF0ZTIuZ2V0TW9udGgoKSwgZGF0ZTIuZ2V0RGF0ZSgpKTtcclxuICB9O1xyXG5cclxuICAvLyBJbm5lciBjaGFuZ2VcclxuICAkc2NvcGUuZGF0ZVNlbGVjdGlvbiA9IGZ1bmN0aW9uKGR0KSB7XHJcbiAgICAkc2NvcGUuZGF0ZSA9IGR0O1xyXG4gICAgdmFyIGRhdGUgPSAkc2NvcGUuZGF0ZSA/IGRhdGVQYXJzZXIuZmlsdGVyKCRzY29wZS5kYXRlLCBkYXRlRm9ybWF0KSA6IG51bGw7IC8vIFNldHRpbmcgdG8gTlVMTCBpcyBuZWNlc3NhcnkgZm9yIGZvcm0gdmFsaWRhdG9ycyB0byBmdW5jdGlvblxyXG4gICAgJGVsZW1lbnQudmFsKGRhdGUpO1xyXG4gICAgbmdNb2RlbC4kc2V0Vmlld1ZhbHVlKGRhdGUpO1xyXG5cclxuICAgIGlmIChjbG9zZU9uRGF0ZVNlbGVjdGlvbikge1xyXG4gICAgICAkc2NvcGUuaXNPcGVuID0gZmFsc2U7XHJcbiAgICAgICRlbGVtZW50WzBdLmZvY3VzKCk7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgJHNjb3BlLmtleWRvd24gPSBmdW5jdGlvbihldnQpIHtcclxuICAgIGlmIChldnQud2hpY2ggPT09IDI3KSB7XHJcbiAgICAgIGV2dC5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgJHNjb3BlLmlzT3BlbiA9IGZhbHNlO1xyXG4gICAgICAkZWxlbWVudFswXS5mb2N1cygpO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gICRzY29wZS5zZWxlY3QgPSBmdW5jdGlvbihkYXRlLCBldnQpIHtcclxuICAgIGV2dC5zdG9wUHJvcGFnYXRpb24oKTtcclxuXHJcbiAgICBpZiAoZGF0ZSA9PT0gJ3RvZGF5Jykge1xyXG4gICAgICB2YXIgdG9kYXkgPSBuZXcgRGF0ZSgpO1xyXG4gICAgICBpZiAoYW5ndWxhci5pc0RhdGUoJHNjb3BlLmRhdGUpKSB7XHJcbiAgICAgICAgZGF0ZSA9IG5ldyBEYXRlKCRzY29wZS5kYXRlKTtcclxuICAgICAgICBkYXRlLnNldEZ1bGxZZWFyKHRvZGF5LmdldEZ1bGxZZWFyKCksIHRvZGF5LmdldE1vbnRoKCksIHRvZGF5LmdldERhdGUoKSk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgZGF0ZSA9IGRhdGVQYXJzZXIuZnJvbVRpbWV6b25lKHRvZGF5LCBuZ01vZGVsT3B0aW9ucy50aW1lem9uZSk7XHJcbiAgICAgICAgZGF0ZS5zZXRIb3VycygwLCAwLCAwLCAwKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgJHNjb3BlLmRhdGVTZWxlY3Rpb24oZGF0ZSk7XHJcbiAgfTtcclxuXHJcbiAgJHNjb3BlLmNsb3NlID0gZnVuY3Rpb24oZXZ0KSB7XHJcbiAgICBldnQuc3RvcFByb3BhZ2F0aW9uKCk7XHJcblxyXG4gICAgJHNjb3BlLmlzT3BlbiA9IGZhbHNlO1xyXG4gICAgJGVsZW1lbnRbMF0uZm9jdXMoKTtcclxuICB9O1xyXG5cclxuICAkc2NvcGUuZGlzYWJsZWQgPSBhbmd1bGFyLmlzRGVmaW5lZCgkYXR0cnMuZGlzYWJsZWQpIHx8IGZhbHNlO1xyXG4gIGlmICgkYXR0cnMubmdEaXNhYmxlZCkge1xyXG4gICAgd2F0Y2hMaXN0ZW5lcnMucHVzaCgkc2NvcGUuJHBhcmVudC4kd2F0Y2goJHBhcnNlKCRhdHRycy5uZ0Rpc2FibGVkKSwgZnVuY3Rpb24oZGlzYWJsZWQpIHtcclxuICAgICAgJHNjb3BlLmRpc2FibGVkID0gZGlzYWJsZWQ7XHJcbiAgICB9KSk7XHJcbiAgfVxyXG5cclxuICAkc2NvcGUuJHdhdGNoKCdpc09wZW4nLCBmdW5jdGlvbih2YWx1ZSkge1xyXG4gICAgaWYgKHZhbHVlKSB7XHJcbiAgICAgIGlmICghJHNjb3BlLmRpc2FibGVkKSB7XHJcbiAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICBwb3NpdGlvblBvcHVwKCk7XHJcblxyXG4gICAgICAgICAgaWYgKG9uT3BlbkZvY3VzKSB7XHJcbiAgICAgICAgICAgICRzY29wZS4kYnJvYWRjYXN0KCd1aWI6ZGF0ZXBpY2tlci5mb2N1cycpO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICRkb2N1bWVudC5vbignY2xpY2snLCBkb2N1bWVudENsaWNrQmluZCk7XHJcblxyXG4gICAgICAgICAgdmFyIHBsYWNlbWVudCA9ICRhdHRycy5wb3B1cFBsYWNlbWVudCA/ICRhdHRycy5wb3B1cFBsYWNlbWVudCA6IGRhdGVwaWNrZXJQb3B1cENvbmZpZy5wbGFjZW1lbnQ7XHJcbiAgICAgICAgICBpZiAoYXBwZW5kVG9Cb2R5IHx8ICRwb3NpdGlvbi5wYXJzZVBsYWNlbWVudChwbGFjZW1lbnQpWzJdKSB7XHJcbiAgICAgICAgICAgIHNjcm9sbFBhcmVudEVsID0gc2Nyb2xsUGFyZW50RWwgfHwgYW5ndWxhci5lbGVtZW50KCRwb3NpdGlvbi5zY3JvbGxQYXJlbnQoJGVsZW1lbnQpKTtcclxuICAgICAgICAgICAgaWYgKHNjcm9sbFBhcmVudEVsKSB7XHJcbiAgICAgICAgICAgICAgc2Nyb2xsUGFyZW50RWwub24oJ3Njcm9sbCcsIHBvc2l0aW9uUG9wdXApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBzY3JvbGxQYXJlbnRFbCA9IG51bGw7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgYW5ndWxhci5lbGVtZW50KCR3aW5kb3cpLm9uKCdyZXNpemUnLCBwb3NpdGlvblBvcHVwKTtcclxuICAgICAgICB9LCAwLCBmYWxzZSk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgJHNjb3BlLmlzT3BlbiA9IGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAkZG9jdW1lbnQub2ZmKCdjbGljaycsIGRvY3VtZW50Q2xpY2tCaW5kKTtcclxuICAgICAgaWYgKHNjcm9sbFBhcmVudEVsKSB7XHJcbiAgICAgICAgc2Nyb2xsUGFyZW50RWwub2ZmKCdzY3JvbGwnLCBwb3NpdGlvblBvcHVwKTtcclxuICAgICAgfVxyXG4gICAgICBhbmd1bGFyLmVsZW1lbnQoJHdpbmRvdykub2ZmKCdyZXNpemUnLCBwb3NpdGlvblBvcHVwKTtcclxuICAgIH1cclxuICB9KTtcclxuXHJcbiAgZnVuY3Rpb24gY2FtZWx0b0Rhc2goc3RyaW5nKSB7XHJcbiAgICByZXR1cm4gc3RyaW5nLnJlcGxhY2UoLyhbQS1aXSkvZywgZnVuY3Rpb24oJDEpIHsgcmV0dXJuICctJyArICQxLnRvTG93ZXJDYXNlKCk7IH0pO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gcGFyc2VEYXRlU3RyaW5nKHZpZXdWYWx1ZSkge1xyXG4gICAgdmFyIGRhdGUgPSBkYXRlUGFyc2VyLnBhcnNlKHZpZXdWYWx1ZSwgZGF0ZUZvcm1hdCwgJHNjb3BlLmRhdGUpO1xyXG4gICAgaWYgKGlzTmFOKGRhdGUpKSB7XHJcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYWx0SW5wdXRGb3JtYXRzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgZGF0ZSA9IGRhdGVQYXJzZXIucGFyc2Uodmlld1ZhbHVlLCBhbHRJbnB1dEZvcm1hdHNbaV0sICRzY29wZS5kYXRlKTtcclxuICAgICAgICBpZiAoIWlzTmFOKGRhdGUpKSB7XHJcbiAgICAgICAgICByZXR1cm4gZGF0ZTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBkYXRlO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gcGFyc2VEYXRlKHZpZXdWYWx1ZSkge1xyXG4gICAgaWYgKGFuZ3VsYXIuaXNOdW1iZXIodmlld1ZhbHVlKSkge1xyXG4gICAgICAvLyBwcmVzdW1hYmx5IHRpbWVzdGFtcCB0byBkYXRlIG9iamVjdFxyXG4gICAgICB2aWV3VmFsdWUgPSBuZXcgRGF0ZSh2aWV3VmFsdWUpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICghdmlld1ZhbHVlKSB7XHJcbiAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChhbmd1bGFyLmlzRGF0ZSh2aWV3VmFsdWUpICYmICFpc05hTih2aWV3VmFsdWUpKSB7XHJcbiAgICAgIHJldHVybiB2aWV3VmFsdWU7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGFuZ3VsYXIuaXNTdHJpbmcodmlld1ZhbHVlKSkge1xyXG4gICAgICB2YXIgZGF0ZSA9IHBhcnNlRGF0ZVN0cmluZyh2aWV3VmFsdWUpO1xyXG4gICAgICBpZiAoIWlzTmFOKGRhdGUpKSB7XHJcbiAgICAgICAgcmV0dXJuIGRhdGVQYXJzZXIuZnJvbVRpbWV6b25lKGRhdGUsIG5nTW9kZWxPcHRpb25zLnRpbWV6b25lKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBuZ01vZGVsLiRvcHRpb25zICYmIG5nTW9kZWwuJG9wdGlvbnMuYWxsb3dJbnZhbGlkID8gdmlld1ZhbHVlIDogdW5kZWZpbmVkO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gdmFsaWRhdG9yKG1vZGVsVmFsdWUsIHZpZXdWYWx1ZSkge1xyXG4gICAgdmFyIHZhbHVlID0gbW9kZWxWYWx1ZSB8fCB2aWV3VmFsdWU7XHJcblxyXG4gICAgaWYgKCEkYXR0cnMubmdSZXF1aXJlZCAmJiAhdmFsdWUpIHtcclxuICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGFuZ3VsYXIuaXNOdW1iZXIodmFsdWUpKSB7XHJcbiAgICAgIHZhbHVlID0gbmV3IERhdGUodmFsdWUpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICghdmFsdWUpIHtcclxuICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGFuZ3VsYXIuaXNEYXRlKHZhbHVlKSAmJiAhaXNOYU4odmFsdWUpKSB7XHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChhbmd1bGFyLmlzU3RyaW5nKHZhbHVlKSkge1xyXG4gICAgICByZXR1cm4gIWlzTmFOKHBhcnNlRGF0ZVN0cmluZyh2YWx1ZSkpO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGRvY3VtZW50Q2xpY2tCaW5kKGV2ZW50KSB7XHJcbiAgICBpZiAoISRzY29wZS5pc09wZW4gJiYgJHNjb3BlLmRpc2FibGVkKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgcG9wdXAgPSAkcG9wdXBbMF07XHJcbiAgICB2YXIgZHBDb250YWluc1RhcmdldCA9ICRlbGVtZW50WzBdLmNvbnRhaW5zKGV2ZW50LnRhcmdldCk7XHJcbiAgICAvLyBUaGUgcG9wdXAgbm9kZSBtYXkgbm90IGJlIGFuIGVsZW1lbnQgbm9kZVxyXG4gICAgLy8gSW4gc29tZSBicm93c2VycyAoSUUpIG9ubHkgZWxlbWVudCBub2RlcyBoYXZlIHRoZSAnY29udGFpbnMnIGZ1bmN0aW9uXHJcbiAgICB2YXIgcG9wdXBDb250YWluc1RhcmdldCA9IHBvcHVwLmNvbnRhaW5zICE9PSB1bmRlZmluZWQgJiYgcG9wdXAuY29udGFpbnMoZXZlbnQudGFyZ2V0KTtcclxuICAgIGlmICgkc2NvcGUuaXNPcGVuICYmICEoZHBDb250YWluc1RhcmdldCB8fCBwb3B1cENvbnRhaW5zVGFyZ2V0KSkge1xyXG4gICAgICAkc2NvcGUuJGFwcGx5KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICRzY29wZS5pc09wZW4gPSBmYWxzZTtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBpbnB1dEtleWRvd25CaW5kKGV2dCkge1xyXG4gICAgaWYgKGV2dC53aGljaCA9PT0gMjcgJiYgJHNjb3BlLmlzT3Blbikge1xyXG4gICAgICBldnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgZXZ0LnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAkc2NvcGUuJGFwcGx5KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICRzY29wZS5pc09wZW4gPSBmYWxzZTtcclxuICAgICAgfSk7XHJcbiAgICAgICRlbGVtZW50WzBdLmZvY3VzKCk7XHJcbiAgICB9IGVsc2UgaWYgKGV2dC53aGljaCA9PT0gNDAgJiYgISRzY29wZS5pc09wZW4pIHtcclxuICAgICAgZXZ0LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgIGV2dC5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgJHNjb3BlLiRhcHBseShmdW5jdGlvbigpIHtcclxuICAgICAgICAkc2NvcGUuaXNPcGVuID0gdHJ1ZTtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBwb3NpdGlvblBvcHVwKCkge1xyXG4gICAgaWYgKCRzY29wZS5pc09wZW4pIHtcclxuICAgICAgdmFyIGRwRWxlbWVudCA9IGFuZ3VsYXIuZWxlbWVudCgkcG9wdXBbMF0ucXVlcnlTZWxlY3RvcignLnVpYi1kYXRlcGlja2VyLXBvcHVwJykpO1xyXG4gICAgICB2YXIgcGxhY2VtZW50ID0gJGF0dHJzLnBvcHVwUGxhY2VtZW50ID8gJGF0dHJzLnBvcHVwUGxhY2VtZW50IDogZGF0ZXBpY2tlclBvcHVwQ29uZmlnLnBsYWNlbWVudDtcclxuICAgICAgdmFyIHBvc2l0aW9uID0gJHBvc2l0aW9uLnBvc2l0aW9uRWxlbWVudHMoJGVsZW1lbnQsIGRwRWxlbWVudCwgcGxhY2VtZW50LCBhcHBlbmRUb0JvZHkpO1xyXG4gICAgICBkcEVsZW1lbnQuY3NzKHt0b3A6IHBvc2l0aW9uLnRvcCArICdweCcsIGxlZnQ6IHBvc2l0aW9uLmxlZnQgKyAncHgnfSk7XHJcbiAgICAgIGlmIChkcEVsZW1lbnQuaGFzQ2xhc3MoJ3VpYi1wb3NpdGlvbi1tZWFzdXJlJykpIHtcclxuICAgICAgICBkcEVsZW1lbnQucmVtb3ZlQ2xhc3MoJ3VpYi1wb3NpdGlvbi1tZWFzdXJlJyk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gICRzY29wZS4kb24oJ3VpYjpkYXRlcGlja2VyLm1vZGUnLCBmdW5jdGlvbigpIHtcclxuICAgICR0aW1lb3V0KHBvc2l0aW9uUG9wdXAsIDAsIGZhbHNlKTtcclxuICB9KTtcclxufV0pXHJcblxyXG4uZGlyZWN0aXZlKCd1aWJEYXRlcGlja2VyUG9wdXAnLCBmdW5jdGlvbigpIHtcclxuICByZXR1cm4ge1xyXG4gICAgcmVxdWlyZTogWyduZ01vZGVsJywgJ3VpYkRhdGVwaWNrZXJQb3B1cCddLFxyXG4gICAgY29udHJvbGxlcjogJ1VpYkRhdGVwaWNrZXJQb3B1cENvbnRyb2xsZXInLFxyXG4gICAgc2NvcGU6IHtcclxuICAgICAgZGF0ZXBpY2tlck9wdGlvbnM6ICc9PycsXHJcbiAgICAgIGlzT3BlbjogJz0/JyxcclxuICAgICAgY3VycmVudFRleHQ6ICdAJyxcclxuICAgICAgY2xlYXJUZXh0OiAnQCcsXHJcbiAgICAgIGNsb3NlVGV4dDogJ0AnXHJcbiAgICB9LFxyXG4gICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCBjdHJscykge1xyXG4gICAgICB2YXIgbmdNb2RlbCA9IGN0cmxzWzBdLFxyXG4gICAgICAgIGN0cmwgPSBjdHJsc1sxXTtcclxuXHJcbiAgICAgIGN0cmwuaW5pdChuZ01vZGVsKTtcclxuICAgIH1cclxuICB9O1xyXG59KVxyXG5cclxuLmRpcmVjdGl2ZSgndWliRGF0ZXBpY2tlclBvcHVwV3JhcCcsIGZ1bmN0aW9uKCkge1xyXG4gIHJldHVybiB7XHJcbiAgICByZXN0cmljdDogJ0EnLFxyXG4gICAgdHJhbnNjbHVkZTogdHJ1ZSxcclxuICAgIHRlbXBsYXRlVXJsOiBmdW5jdGlvbihlbGVtZW50LCBhdHRycykge1xyXG4gICAgICByZXR1cm4gYXR0cnMudGVtcGxhdGVVcmwgfHwgJ3VpYi90ZW1wbGF0ZS9kYXRlcGlja2VyUG9wdXAvcG9wdXAuaHRtbCc7XHJcbiAgICB9XHJcbiAgfTtcclxufSk7XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgndWkuYm9vdHN0cmFwLmRlYm91bmNlJywgW10pXHJcbi8qKlxyXG4gKiBBIGhlbHBlciwgaW50ZXJuYWwgc2VydmljZSB0aGF0IGRlYm91bmNlcyBhIGZ1bmN0aW9uXHJcbiAqL1xyXG4gIC5mYWN0b3J5KCckJGRlYm91bmNlJywgWyckdGltZW91dCcsIGZ1bmN0aW9uKCR0aW1lb3V0KSB7XHJcbiAgICByZXR1cm4gZnVuY3Rpb24oY2FsbGJhY2ssIGRlYm91bmNlVGltZSkge1xyXG4gICAgICB2YXIgdGltZW91dFByb21pc2U7XHJcblxyXG4gICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xyXG4gICAgICAgIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKTtcclxuICAgICAgICBpZiAodGltZW91dFByb21pc2UpIHtcclxuICAgICAgICAgICR0aW1lb3V0LmNhbmNlbCh0aW1lb3V0UHJvbWlzZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aW1lb3V0UHJvbWlzZSA9ICR0aW1lb3V0KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgY2FsbGJhY2suYXBwbHkoc2VsZiwgYXJncyk7XHJcbiAgICAgICAgfSwgZGVib3VuY2VUaW1lKTtcclxuICAgICAgfTtcclxuICAgIH07XHJcbiAgfV0pO1xyXG5cclxuYW5ndWxhci5tb2R1bGUoJ3VpLmJvb3RzdHJhcC5kcm9wZG93bicsIFsndWkuYm9vdHN0cmFwLnBvc2l0aW9uJ10pXHJcblxyXG4uY29uc3RhbnQoJ3VpYkRyb3Bkb3duQ29uZmlnJywge1xyXG4gIGFwcGVuZFRvT3BlbkNsYXNzOiAndWliLWRyb3Bkb3duLW9wZW4nLFxyXG4gIG9wZW5DbGFzczogJ29wZW4nXHJcbn0pXHJcblxyXG4uc2VydmljZSgndWliRHJvcGRvd25TZXJ2aWNlJywgWyckZG9jdW1lbnQnLCAnJHJvb3RTY29wZScsIGZ1bmN0aW9uKCRkb2N1bWVudCwgJHJvb3RTY29wZSkge1xyXG4gIHZhciBvcGVuU2NvcGUgPSBudWxsO1xyXG5cclxuICB0aGlzLm9wZW4gPSBmdW5jdGlvbihkcm9wZG93blNjb3BlLCBlbGVtZW50KSB7XHJcbiAgICBpZiAoIW9wZW5TY29wZSkge1xyXG4gICAgICAkZG9jdW1lbnQub24oJ2NsaWNrJywgY2xvc2VEcm9wZG93bik7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKG9wZW5TY29wZSAmJiBvcGVuU2NvcGUgIT09IGRyb3Bkb3duU2NvcGUpIHtcclxuICAgICAgb3BlblNjb3BlLmlzT3BlbiA9IGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIG9wZW5TY29wZSA9IGRyb3Bkb3duU2NvcGU7XHJcbiAgfTtcclxuXHJcbiAgdGhpcy5jbG9zZSA9IGZ1bmN0aW9uKGRyb3Bkb3duU2NvcGUsIGVsZW1lbnQpIHtcclxuICAgIGlmIChvcGVuU2NvcGUgPT09IGRyb3Bkb3duU2NvcGUpIHtcclxuICAgICAgb3BlblNjb3BlID0gbnVsbDtcclxuICAgICAgJGRvY3VtZW50Lm9mZignY2xpY2snLCBjbG9zZURyb3Bkb3duKTtcclxuICAgICAgJGRvY3VtZW50Lm9mZigna2V5ZG93bicsIHRoaXMua2V5YmluZEZpbHRlcik7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgdmFyIGNsb3NlRHJvcGRvd24gPSBmdW5jdGlvbihldnQpIHtcclxuICAgIC8vIFRoaXMgbWV0aG9kIG1heSBzdGlsbCBiZSBjYWxsZWQgZHVyaW5nIHRoZSBzYW1lIG1vdXNlIGV2ZW50IHRoYXRcclxuICAgIC8vIHVuYm91bmQgdGhpcyBldmVudCBoYW5kbGVyLiBTbyBjaGVjayBvcGVuU2NvcGUgYmVmb3JlIHByb2NlZWRpbmcuXHJcbiAgICBpZiAoIW9wZW5TY29wZSkgeyByZXR1cm47IH1cclxuXHJcbiAgICBpZiAoZXZ0ICYmIG9wZW5TY29wZS5nZXRBdXRvQ2xvc2UoKSA9PT0gJ2Rpc2FibGVkJykgeyByZXR1cm47IH1cclxuXHJcbiAgICBpZiAoZXZ0ICYmIGV2dC53aGljaCA9PT0gMykgeyByZXR1cm47IH1cclxuXHJcbiAgICB2YXIgdG9nZ2xlRWxlbWVudCA9IG9wZW5TY29wZS5nZXRUb2dnbGVFbGVtZW50KCk7XHJcbiAgICBpZiAoZXZ0ICYmIHRvZ2dsZUVsZW1lbnQgJiYgdG9nZ2xlRWxlbWVudFswXS5jb250YWlucyhldnQudGFyZ2V0KSkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGRyb3Bkb3duRWxlbWVudCA9IG9wZW5TY29wZS5nZXREcm9wZG93bkVsZW1lbnQoKTtcclxuICAgIGlmIChldnQgJiYgb3BlblNjb3BlLmdldEF1dG9DbG9zZSgpID09PSAnb3V0c2lkZUNsaWNrJyAmJlxyXG4gICAgICBkcm9wZG93bkVsZW1lbnQgJiYgZHJvcGRvd25FbGVtZW50WzBdLmNvbnRhaW5zKGV2dC50YXJnZXQpKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBvcGVuU2NvcGUuaXNPcGVuID0gZmFsc2U7XHJcbiAgICBvcGVuU2NvcGUuZm9jdXNUb2dnbGVFbGVtZW50KCk7XHJcblxyXG4gICAgaWYgKCEkcm9vdFNjb3BlLiQkcGhhc2UpIHtcclxuICAgICAgb3BlblNjb3BlLiRhcHBseSgpO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIHRoaXMua2V5YmluZEZpbHRlciA9IGZ1bmN0aW9uKGV2dCkge1xyXG4gICAgdmFyIGRyb3Bkb3duRWxlbWVudCA9IG9wZW5TY29wZS5nZXREcm9wZG93bkVsZW1lbnQoKTtcclxuICAgIHZhciB0b2dnbGVFbGVtZW50ID0gb3BlblNjb3BlLmdldFRvZ2dsZUVsZW1lbnQoKTtcclxuICAgIHZhciBkcm9wZG93bkVsZW1lbnRUYXJnZXRlZCA9IGRyb3Bkb3duRWxlbWVudCAmJiBkcm9wZG93bkVsZW1lbnRbMF0uY29udGFpbnMoZXZ0LnRhcmdldCk7XHJcbiAgICB2YXIgdG9nZ2xlRWxlbWVudFRhcmdldGVkID0gdG9nZ2xlRWxlbWVudCAmJiB0b2dnbGVFbGVtZW50WzBdLmNvbnRhaW5zKGV2dC50YXJnZXQpO1xyXG4gICAgaWYgKGV2dC53aGljaCA9PT0gMjcpIHtcclxuICAgICAgZXZ0LnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICBvcGVuU2NvcGUuZm9jdXNUb2dnbGVFbGVtZW50KCk7XHJcbiAgICAgIGNsb3NlRHJvcGRvd24oKTtcclxuICAgIH0gZWxzZSBpZiAob3BlblNjb3BlLmlzS2V5bmF2RW5hYmxlZCgpICYmIFszOCwgNDBdLmluZGV4T2YoZXZ0LndoaWNoKSAhPT0gLTEgJiYgb3BlblNjb3BlLmlzT3BlbiAmJiAoZHJvcGRvd25FbGVtZW50VGFyZ2V0ZWQgfHwgdG9nZ2xlRWxlbWVudFRhcmdldGVkKSkge1xyXG4gICAgICBldnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgZXZ0LnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICBvcGVuU2NvcGUuZm9jdXNEcm9wZG93bkVudHJ5KGV2dC53aGljaCk7XHJcbiAgICB9XHJcbiAgfTtcclxufV0pXHJcblxyXG4uY29udHJvbGxlcignVWliRHJvcGRvd25Db250cm9sbGVyJywgWyckc2NvcGUnLCAnJGVsZW1lbnQnLCAnJGF0dHJzJywgJyRwYXJzZScsICd1aWJEcm9wZG93bkNvbmZpZycsICd1aWJEcm9wZG93blNlcnZpY2UnLCAnJGFuaW1hdGUnLCAnJHVpYlBvc2l0aW9uJywgJyRkb2N1bWVudCcsICckY29tcGlsZScsICckdGVtcGxhdGVSZXF1ZXN0JywgZnVuY3Rpb24oJHNjb3BlLCAkZWxlbWVudCwgJGF0dHJzLCAkcGFyc2UsIGRyb3Bkb3duQ29uZmlnLCB1aWJEcm9wZG93blNlcnZpY2UsICRhbmltYXRlLCAkcG9zaXRpb24sICRkb2N1bWVudCwgJGNvbXBpbGUsICR0ZW1wbGF0ZVJlcXVlc3QpIHtcclxuICB2YXIgc2VsZiA9IHRoaXMsXHJcbiAgICBzY29wZSA9ICRzY29wZS4kbmV3KCksIC8vIGNyZWF0ZSBhIGNoaWxkIHNjb3BlIHNvIHdlIGFyZSBub3QgcG9sbHV0aW5nIG9yaWdpbmFsIG9uZVxyXG4gICAgdGVtcGxhdGVTY29wZSxcclxuICAgIGFwcGVuZFRvT3BlbkNsYXNzID0gZHJvcGRvd25Db25maWcuYXBwZW5kVG9PcGVuQ2xhc3MsXHJcbiAgICBvcGVuQ2xhc3MgPSBkcm9wZG93bkNvbmZpZy5vcGVuQ2xhc3MsXHJcbiAgICBnZXRJc09wZW4sXHJcbiAgICBzZXRJc09wZW4gPSBhbmd1bGFyLm5vb3AsXHJcbiAgICB0b2dnbGVJbnZva2VyID0gJGF0dHJzLm9uVG9nZ2xlID8gJHBhcnNlKCRhdHRycy5vblRvZ2dsZSkgOiBhbmd1bGFyLm5vb3AsXHJcbiAgICBhcHBlbmRUb0JvZHkgPSBmYWxzZSxcclxuICAgIGFwcGVuZFRvID0gbnVsbCxcclxuICAgIGtleW5hdkVuYWJsZWQgPSBmYWxzZSxcclxuICAgIHNlbGVjdGVkT3B0aW9uID0gbnVsbCxcclxuICAgIGJvZHkgPSAkZG9jdW1lbnQuZmluZCgnYm9keScpO1xyXG5cclxuICAkZWxlbWVudC5hZGRDbGFzcygnZHJvcGRvd24nKTtcclxuXHJcbiAgdGhpcy5pbml0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICBpZiAoJGF0dHJzLmlzT3Blbikge1xyXG4gICAgICBnZXRJc09wZW4gPSAkcGFyc2UoJGF0dHJzLmlzT3Blbik7XHJcbiAgICAgIHNldElzT3BlbiA9IGdldElzT3Blbi5hc3NpZ247XHJcblxyXG4gICAgICAkc2NvcGUuJHdhdGNoKGdldElzT3BlbiwgZnVuY3Rpb24odmFsdWUpIHtcclxuICAgICAgICBzY29wZS5pc09wZW4gPSAhIXZhbHVlO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoYW5ndWxhci5pc0RlZmluZWQoJGF0dHJzLmRyb3Bkb3duQXBwZW5kVG8pKSB7XHJcbiAgICAgIHZhciBhcHBlbmRUb0VsID0gJHBhcnNlKCRhdHRycy5kcm9wZG93bkFwcGVuZFRvKShzY29wZSk7XHJcbiAgICAgIGlmIChhcHBlbmRUb0VsKSB7XHJcbiAgICAgICAgYXBwZW5kVG8gPSBhbmd1bGFyLmVsZW1lbnQoYXBwZW5kVG9FbCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBhcHBlbmRUb0JvZHkgPSBhbmd1bGFyLmlzRGVmaW5lZCgkYXR0cnMuZHJvcGRvd25BcHBlbmRUb0JvZHkpO1xyXG4gICAga2V5bmF2RW5hYmxlZCA9IGFuZ3VsYXIuaXNEZWZpbmVkKCRhdHRycy5rZXlib2FyZE5hdik7XHJcblxyXG4gICAgaWYgKGFwcGVuZFRvQm9keSAmJiAhYXBwZW5kVG8pIHtcclxuICAgICAgYXBwZW5kVG8gPSBib2R5O1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChhcHBlbmRUbyAmJiBzZWxmLmRyb3Bkb3duTWVudSkge1xyXG4gICAgICBhcHBlbmRUby5hcHBlbmQoc2VsZi5kcm9wZG93bk1lbnUpO1xyXG4gICAgICAkZWxlbWVudC5vbignJGRlc3Ryb3knLCBmdW5jdGlvbiBoYW5kbGVEZXN0cm95RXZlbnQoKSB7XHJcbiAgICAgICAgc2VsZi5kcm9wZG93bk1lbnUucmVtb3ZlKCk7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIHRoaXMudG9nZ2xlID0gZnVuY3Rpb24ob3Blbikge1xyXG4gICAgc2NvcGUuaXNPcGVuID0gYXJndW1lbnRzLmxlbmd0aCA/ICEhb3BlbiA6ICFzY29wZS5pc09wZW47XHJcbiAgICBpZiAoYW5ndWxhci5pc0Z1bmN0aW9uKHNldElzT3BlbikpIHtcclxuICAgICAgc2V0SXNPcGVuKHNjb3BlLCBzY29wZS5pc09wZW4pO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBzY29wZS5pc09wZW47XHJcbiAgfTtcclxuXHJcbiAgLy8gQWxsb3cgb3RoZXIgZGlyZWN0aXZlcyB0byB3YXRjaCBzdGF0dXNcclxuICB0aGlzLmlzT3BlbiA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIHNjb3BlLmlzT3BlbjtcclxuICB9O1xyXG5cclxuICBzY29wZS5nZXRUb2dnbGVFbGVtZW50ID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gc2VsZi50b2dnbGVFbGVtZW50O1xyXG4gIH07XHJcblxyXG4gIHNjb3BlLmdldEF1dG9DbG9zZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuICRhdHRycy5hdXRvQ2xvc2UgfHwgJ2Fsd2F5cyc7IC8vb3IgJ291dHNpZGVDbGljaycgb3IgJ2Rpc2FibGVkJ1xyXG4gIH07XHJcblxyXG4gIHNjb3BlLmdldEVsZW1lbnQgPSBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiAkZWxlbWVudDtcclxuICB9O1xyXG5cclxuICBzY29wZS5pc0tleW5hdkVuYWJsZWQgPSBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiBrZXluYXZFbmFibGVkO1xyXG4gIH07XHJcblxyXG4gIHNjb3BlLmZvY3VzRHJvcGRvd25FbnRyeSA9IGZ1bmN0aW9uKGtleUNvZGUpIHtcclxuICAgIHZhciBlbGVtcyA9IHNlbGYuZHJvcGRvd25NZW51ID8gLy9JZiBhcHBlbmQgdG8gYm9keSBpcyB1c2VkLlxyXG4gICAgICBhbmd1bGFyLmVsZW1lbnQoc2VsZi5kcm9wZG93bk1lbnUpLmZpbmQoJ2EnKSA6XHJcbiAgICAgICRlbGVtZW50LmZpbmQoJ3VsJykuZXEoMCkuZmluZCgnYScpO1xyXG5cclxuICAgIHN3aXRjaCAoa2V5Q29kZSkge1xyXG4gICAgICBjYXNlIDQwOiB7XHJcbiAgICAgICAgaWYgKCFhbmd1bGFyLmlzTnVtYmVyKHNlbGYuc2VsZWN0ZWRPcHRpb24pKSB7XHJcbiAgICAgICAgICBzZWxmLnNlbGVjdGVkT3B0aW9uID0gMDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgc2VsZi5zZWxlY3RlZE9wdGlvbiA9IHNlbGYuc2VsZWN0ZWRPcHRpb24gPT09IGVsZW1zLmxlbmd0aCAtIDEgP1xyXG4gICAgICAgICAgICBzZWxmLnNlbGVjdGVkT3B0aW9uIDpcclxuICAgICAgICAgICAgc2VsZi5zZWxlY3RlZE9wdGlvbiArIDE7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcbiAgICAgIGNhc2UgMzg6IHtcclxuICAgICAgICBpZiAoIWFuZ3VsYXIuaXNOdW1iZXIoc2VsZi5zZWxlY3RlZE9wdGlvbikpIHtcclxuICAgICAgICAgIHNlbGYuc2VsZWN0ZWRPcHRpb24gPSBlbGVtcy5sZW5ndGggLSAxO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBzZWxmLnNlbGVjdGVkT3B0aW9uID0gc2VsZi5zZWxlY3RlZE9wdGlvbiA9PT0gMCA/XHJcbiAgICAgICAgICAgIDAgOiBzZWxmLnNlbGVjdGVkT3B0aW9uIC0gMTtcclxuICAgICAgICB9XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGVsZW1zW3NlbGYuc2VsZWN0ZWRPcHRpb25dLmZvY3VzKCk7XHJcbiAgfTtcclxuXHJcbiAgc2NvcGUuZ2V0RHJvcGRvd25FbGVtZW50ID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gc2VsZi5kcm9wZG93bk1lbnU7XHJcbiAgfTtcclxuXHJcbiAgc2NvcGUuZm9jdXNUb2dnbGVFbGVtZW50ID0gZnVuY3Rpb24oKSB7XHJcbiAgICBpZiAoc2VsZi50b2dnbGVFbGVtZW50KSB7XHJcbiAgICAgIHNlbGYudG9nZ2xlRWxlbWVudFswXS5mb2N1cygpO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIHNjb3BlLiR3YXRjaCgnaXNPcGVuJywgZnVuY3Rpb24oaXNPcGVuLCB3YXNPcGVuKSB7XHJcbiAgICBpZiAoYXBwZW5kVG8gJiYgc2VsZi5kcm9wZG93bk1lbnUpIHtcclxuICAgICAgdmFyIHBvcyA9ICRwb3NpdGlvbi5wb3NpdGlvbkVsZW1lbnRzKCRlbGVtZW50LCBzZWxmLmRyb3Bkb3duTWVudSwgJ2JvdHRvbS1sZWZ0JywgdHJ1ZSksXHJcbiAgICAgICAgY3NzLFxyXG4gICAgICAgIHJpZ2h0YWxpZ24sXHJcbiAgICAgICAgc2Nyb2xsYmFyUGFkZGluZyxcclxuICAgICAgICBzY3JvbGxiYXJXaWR0aCA9IDA7XHJcblxyXG4gICAgICBjc3MgPSB7XHJcbiAgICAgICAgdG9wOiBwb3MudG9wICsgJ3B4JyxcclxuICAgICAgICBkaXNwbGF5OiBpc09wZW4gPyAnYmxvY2snIDogJ25vbmUnXHJcbiAgICAgIH07XHJcblxyXG4gICAgICByaWdodGFsaWduID0gc2VsZi5kcm9wZG93bk1lbnUuaGFzQ2xhc3MoJ2Ryb3Bkb3duLW1lbnUtcmlnaHQnKTtcclxuICAgICAgaWYgKCFyaWdodGFsaWduKSB7XHJcbiAgICAgICAgY3NzLmxlZnQgPSBwb3MubGVmdCArICdweCc7XHJcbiAgICAgICAgY3NzLnJpZ2h0ID0gJ2F1dG8nO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGNzcy5sZWZ0ID0gJ2F1dG8nO1xyXG4gICAgICAgIHNjcm9sbGJhclBhZGRpbmcgPSAkcG9zaXRpb24uc2Nyb2xsYmFyUGFkZGluZyhhcHBlbmRUbyk7XHJcblxyXG4gICAgICAgIGlmIChzY3JvbGxiYXJQYWRkaW5nLmhlaWdodE92ZXJmbG93ICYmIHNjcm9sbGJhclBhZGRpbmcuc2Nyb2xsYmFyV2lkdGgpIHtcclxuICAgICAgICAgIHNjcm9sbGJhcldpZHRoID0gc2Nyb2xsYmFyUGFkZGluZy5zY3JvbGxiYXJXaWR0aDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNzcy5yaWdodCA9IHdpbmRvdy5pbm5lcldpZHRoIC0gc2Nyb2xsYmFyV2lkdGggLVxyXG4gICAgICAgICAgKHBvcy5sZWZ0ICsgJGVsZW1lbnQucHJvcCgnb2Zmc2V0V2lkdGgnKSkgKyAncHgnO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBOZWVkIHRvIGFkanVzdCBvdXIgcG9zaXRpb25pbmcgdG8gYmUgcmVsYXRpdmUgdG8gdGhlIGFwcGVuZFRvIGNvbnRhaW5lclxyXG4gICAgICAvLyBpZiBpdCdzIG5vdCB0aGUgYm9keSBlbGVtZW50XHJcbiAgICAgIGlmICghYXBwZW5kVG9Cb2R5KSB7XHJcbiAgICAgICAgdmFyIGFwcGVuZE9mZnNldCA9ICRwb3NpdGlvbi5vZmZzZXQoYXBwZW5kVG8pO1xyXG5cclxuICAgICAgICBjc3MudG9wID0gcG9zLnRvcCAtIGFwcGVuZE9mZnNldC50b3AgKyAncHgnO1xyXG5cclxuICAgICAgICBpZiAoIXJpZ2h0YWxpZ24pIHtcclxuICAgICAgICAgIGNzcy5sZWZ0ID0gcG9zLmxlZnQgLSBhcHBlbmRPZmZzZXQubGVmdCArICdweCc7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGNzcy5yaWdodCA9IHdpbmRvdy5pbm5lcldpZHRoIC1cclxuICAgICAgICAgICAgKHBvcy5sZWZ0IC0gYXBwZW5kT2Zmc2V0LmxlZnQgKyAkZWxlbWVudC5wcm9wKCdvZmZzZXRXaWR0aCcpKSArICdweCc7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICBzZWxmLmRyb3Bkb3duTWVudS5jc3MoY3NzKTtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgb3BlbkNvbnRhaW5lciA9IGFwcGVuZFRvID8gYXBwZW5kVG8gOiAkZWxlbWVudDtcclxuICAgIHZhciBoYXNPcGVuQ2xhc3MgPSBvcGVuQ29udGFpbmVyLmhhc0NsYXNzKGFwcGVuZFRvID8gYXBwZW5kVG9PcGVuQ2xhc3MgOiBvcGVuQ2xhc3MpO1xyXG5cclxuICAgIGlmIChoYXNPcGVuQ2xhc3MgPT09ICFpc09wZW4pIHtcclxuICAgICAgJGFuaW1hdGVbaXNPcGVuID8gJ2FkZENsYXNzJyA6ICdyZW1vdmVDbGFzcyddKG9wZW5Db250YWluZXIsIGFwcGVuZFRvID8gYXBwZW5kVG9PcGVuQ2xhc3MgOiBvcGVuQ2xhc3MpLnRoZW4oZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgaWYgKGFuZ3VsYXIuaXNEZWZpbmVkKGlzT3BlbikgJiYgaXNPcGVuICE9PSB3YXNPcGVuKSB7XHJcbiAgICAgICAgICB0b2dnbGVJbnZva2VyKCRzY29wZSwgeyBvcGVuOiAhIWlzT3BlbiB9KTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChpc09wZW4pIHtcclxuICAgICAgaWYgKHNlbGYuZHJvcGRvd25NZW51VGVtcGxhdGVVcmwpIHtcclxuICAgICAgICAkdGVtcGxhdGVSZXF1ZXN0KHNlbGYuZHJvcGRvd25NZW51VGVtcGxhdGVVcmwpLnRoZW4oZnVuY3Rpb24odHBsQ29udGVudCkge1xyXG4gICAgICAgICAgdGVtcGxhdGVTY29wZSA9IHNjb3BlLiRuZXcoKTtcclxuICAgICAgICAgICRjb21waWxlKHRwbENvbnRlbnQudHJpbSgpKSh0ZW1wbGF0ZVNjb3BlLCBmdW5jdGlvbihkcm9wZG93bkVsZW1lbnQpIHtcclxuICAgICAgICAgICAgdmFyIG5ld0VsID0gZHJvcGRvd25FbGVtZW50O1xyXG4gICAgICAgICAgICBzZWxmLmRyb3Bkb3duTWVudS5yZXBsYWNlV2l0aChuZXdFbCk7XHJcbiAgICAgICAgICAgIHNlbGYuZHJvcGRvd25NZW51ID0gbmV3RWw7XHJcbiAgICAgICAgICAgICRkb2N1bWVudC5vbigna2V5ZG93bicsIHVpYkRyb3Bkb3duU2VydmljZS5rZXliaW5kRmlsdGVyKTtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgICRkb2N1bWVudC5vbigna2V5ZG93bicsIHVpYkRyb3Bkb3duU2VydmljZS5rZXliaW5kRmlsdGVyKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgc2NvcGUuZm9jdXNUb2dnbGVFbGVtZW50KCk7XHJcbiAgICAgIHVpYkRyb3Bkb3duU2VydmljZS5vcGVuKHNjb3BlLCAkZWxlbWVudCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB1aWJEcm9wZG93blNlcnZpY2UuY2xvc2Uoc2NvcGUsICRlbGVtZW50KTtcclxuICAgICAgaWYgKHNlbGYuZHJvcGRvd25NZW51VGVtcGxhdGVVcmwpIHtcclxuICAgICAgICBpZiAodGVtcGxhdGVTY29wZSkge1xyXG4gICAgICAgICAgdGVtcGxhdGVTY29wZS4kZGVzdHJveSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgbmV3RWwgPSBhbmd1bGFyLmVsZW1lbnQoJzx1bCBjbGFzcz1cImRyb3Bkb3duLW1lbnVcIj48L3VsPicpO1xyXG4gICAgICAgIHNlbGYuZHJvcGRvd25NZW51LnJlcGxhY2VXaXRoKG5ld0VsKTtcclxuICAgICAgICBzZWxmLmRyb3Bkb3duTWVudSA9IG5ld0VsO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBzZWxmLnNlbGVjdGVkT3B0aW9uID0gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoYW5ndWxhci5pc0Z1bmN0aW9uKHNldElzT3BlbikpIHtcclxuICAgICAgc2V0SXNPcGVuKCRzY29wZSwgaXNPcGVuKTtcclxuICAgIH1cclxuICB9KTtcclxufV0pXHJcblxyXG4uZGlyZWN0aXZlKCd1aWJEcm9wZG93bicsIGZ1bmN0aW9uKCkge1xyXG4gIHJldHVybiB7XHJcbiAgICBjb250cm9sbGVyOiAnVWliRHJvcGRvd25Db250cm9sbGVyJyxcclxuICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBlbGVtZW50LCBhdHRycywgZHJvcGRvd25DdHJsKSB7XHJcbiAgICAgIGRyb3Bkb3duQ3RybC5pbml0KCk7XHJcbiAgICB9XHJcbiAgfTtcclxufSlcclxuXHJcbi5kaXJlY3RpdmUoJ3VpYkRyb3Bkb3duTWVudScsIGZ1bmN0aW9uKCkge1xyXG4gIHJldHVybiB7XHJcbiAgICByZXN0cmljdDogJ0EnLFxyXG4gICAgcmVxdWlyZTogJz9edWliRHJvcGRvd24nLFxyXG4gICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCBkcm9wZG93bkN0cmwpIHtcclxuICAgICAgaWYgKCFkcm9wZG93bkN0cmwgfHwgYW5ndWxhci5pc0RlZmluZWQoYXR0cnMuZHJvcGRvd25OZXN0ZWQpKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBlbGVtZW50LmFkZENsYXNzKCdkcm9wZG93bi1tZW51Jyk7XHJcblxyXG4gICAgICB2YXIgdHBsVXJsID0gYXR0cnMudGVtcGxhdGVVcmw7XHJcbiAgICAgIGlmICh0cGxVcmwpIHtcclxuICAgICAgICBkcm9wZG93bkN0cmwuZHJvcGRvd25NZW51VGVtcGxhdGVVcmwgPSB0cGxVcmw7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmICghZHJvcGRvd25DdHJsLmRyb3Bkb3duTWVudSkge1xyXG4gICAgICAgIGRyb3Bkb3duQ3RybC5kcm9wZG93bk1lbnUgPSBlbGVtZW50O1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfTtcclxufSlcclxuXHJcbi5kaXJlY3RpdmUoJ3VpYkRyb3Bkb3duVG9nZ2xlJywgZnVuY3Rpb24oKSB7XHJcbiAgcmV0dXJuIHtcclxuICAgIHJlcXVpcmU6ICc/XnVpYkRyb3Bkb3duJyxcclxuICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBlbGVtZW50LCBhdHRycywgZHJvcGRvd25DdHJsKSB7XHJcbiAgICAgIGlmICghZHJvcGRvd25DdHJsKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBlbGVtZW50LmFkZENsYXNzKCdkcm9wZG93bi10b2dnbGUnKTtcclxuXHJcbiAgICAgIGRyb3Bkb3duQ3RybC50b2dnbGVFbGVtZW50ID0gZWxlbWVudDtcclxuXHJcbiAgICAgIHZhciB0b2dnbGVEcm9wZG93biA9IGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuXHJcbiAgICAgICAgaWYgKCFlbGVtZW50Lmhhc0NsYXNzKCdkaXNhYmxlZCcpICYmICFhdHRycy5kaXNhYmxlZCkge1xyXG4gICAgICAgICAgc2NvcGUuJGFwcGx5KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBkcm9wZG93bkN0cmwudG9nZ2xlKCk7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgIH07XHJcblxyXG4gICAgICBlbGVtZW50LmJpbmQoJ2NsaWNrJywgdG9nZ2xlRHJvcGRvd24pO1xyXG5cclxuICAgICAgLy8gV0FJLUFSSUFcclxuICAgICAgZWxlbWVudC5hdHRyKHsgJ2FyaWEtaGFzcG9wdXAnOiB0cnVlLCAnYXJpYS1leHBhbmRlZCc6IGZhbHNlIH0pO1xyXG4gICAgICBzY29wZS4kd2F0Y2goZHJvcGRvd25DdHJsLmlzT3BlbiwgZnVuY3Rpb24oaXNPcGVuKSB7XHJcbiAgICAgICAgZWxlbWVudC5hdHRyKCdhcmlhLWV4cGFuZGVkJywgISFpc09wZW4pO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIHNjb3BlLiRvbignJGRlc3Ryb3knLCBmdW5jdGlvbigpIHtcclxuICAgICAgICBlbGVtZW50LnVuYmluZCgnY2xpY2snLCB0b2dnbGVEcm9wZG93bik7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH07XHJcbn0pO1xyXG5cclxuYW5ndWxhci5tb2R1bGUoJ3VpLmJvb3RzdHJhcC5zdGFja2VkTWFwJywgW10pXHJcbi8qKlxyXG4gKiBBIGhlbHBlciwgaW50ZXJuYWwgZGF0YSBzdHJ1Y3R1cmUgdGhhdCBhY3RzIGFzIGEgbWFwIGJ1dCBhbHNvIGFsbG93cyBnZXR0aW5nIC8gcmVtb3ZpbmdcclxuICogZWxlbWVudHMgaW4gdGhlIExJRk8gb3JkZXJcclxuICovXHJcbiAgLmZhY3RvcnkoJyQkc3RhY2tlZE1hcCcsIGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgY3JlYXRlTmV3OiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgc3RhY2sgPSBbXTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIGFkZDogZnVuY3Rpb24oa2V5LCB2YWx1ZSkge1xyXG4gICAgICAgICAgICBzdGFjay5wdXNoKHtcclxuICAgICAgICAgICAgICBrZXk6IGtleSxcclxuICAgICAgICAgICAgICB2YWx1ZTogdmFsdWVcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgZ2V0OiBmdW5jdGlvbihrZXkpIHtcclxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdGFjay5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgIGlmIChrZXkgPT09IHN0YWNrW2ldLmtleSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHN0YWNrW2ldO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIGtleXM6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB2YXIga2V5cyA9IFtdO1xyXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHN0YWNrLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAga2V5cy5wdXNoKHN0YWNrW2ldLmtleSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGtleXM7XHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgdG9wOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHN0YWNrW3N0YWNrLmxlbmd0aCAtIDFdO1xyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHJlbW92ZTogZnVuY3Rpb24oa2V5KSB7XHJcbiAgICAgICAgICAgIHZhciBpZHggPSAtMTtcclxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdGFjay5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgIGlmIChrZXkgPT09IHN0YWNrW2ldLmtleSkge1xyXG4gICAgICAgICAgICAgICAgaWR4ID0gaTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gc3RhY2suc3BsaWNlKGlkeCwgMSlbMF07XHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgcmVtb3ZlVG9wOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHN0YWNrLnBvcCgpO1xyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIGxlbmd0aDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBzdGFjay5sZW5ndGg7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuICB9KTtcclxuYW5ndWxhci5tb2R1bGUoJ3VpLmJvb3RzdHJhcC5tb2RhbCcsIFsndWkuYm9vdHN0cmFwLnN0YWNrZWRNYXAnLCAndWkuYm9vdHN0cmFwLnBvc2l0aW9uJ10pXHJcbi8qKlxyXG4gKiBBIGhlbHBlciwgaW50ZXJuYWwgZGF0YSBzdHJ1Y3R1cmUgdGhhdCBzdG9yZXMgYWxsIHJlZmVyZW5jZXMgYXR0YWNoZWQgdG8ga2V5XHJcbiAqL1xyXG4gIC5mYWN0b3J5KCckJG11bHRpTWFwJywgZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBjcmVhdGVOZXc6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBtYXAgPSB7fTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIGVudHJpZXM6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gT2JqZWN0LmtleXMobWFwKS5tYXAoZnVuY3Rpb24oa2V5KSB7XHJcbiAgICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIGtleToga2V5LFxyXG4gICAgICAgICAgICAgICAgdmFsdWU6IG1hcFtrZXldXHJcbiAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgZ2V0OiBmdW5jdGlvbihrZXkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG1hcFtrZXldO1xyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIGhhc0tleTogZnVuY3Rpb24oa2V5KSB7XHJcbiAgICAgICAgICAgIHJldHVybiAhIW1hcFtrZXldO1xyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIGtleXM6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gT2JqZWN0LmtleXMobWFwKTtcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICBwdXQ6IGZ1bmN0aW9uKGtleSwgdmFsdWUpIHtcclxuICAgICAgICAgICAgaWYgKCFtYXBba2V5XSkge1xyXG4gICAgICAgICAgICAgIG1hcFtrZXldID0gW107XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIG1hcFtrZXldLnB1c2godmFsdWUpO1xyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHJlbW92ZTogZnVuY3Rpb24oa2V5LCB2YWx1ZSkge1xyXG4gICAgICAgICAgICB2YXIgdmFsdWVzID0gbWFwW2tleV07XHJcblxyXG4gICAgICAgICAgICBpZiAoIXZhbHVlcykge1xyXG4gICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdmFyIGlkeCA9IHZhbHVlcy5pbmRleE9mKHZhbHVlKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChpZHggIT09IC0xKSB7XHJcbiAgICAgICAgICAgICAgdmFsdWVzLnNwbGljZShpZHgsIDEpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoIXZhbHVlcy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICBkZWxldGUgbWFwW2tleV07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG4gIH0pXHJcblxyXG4vKipcclxuICogUGx1Z2dhYmxlIHJlc29sdmUgbWVjaGFuaXNtIGZvciB0aGUgbW9kYWwgcmVzb2x2ZSByZXNvbHV0aW9uXHJcbiAqIFN1cHBvcnRzIFVJIFJvdXRlcidzICRyZXNvbHZlIHNlcnZpY2VcclxuICovXHJcbiAgLnByb3ZpZGVyKCckdWliUmVzb2x2ZScsIGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIHJlc29sdmUgPSB0aGlzO1xyXG4gICAgdGhpcy5yZXNvbHZlciA9IG51bGw7XHJcblxyXG4gICAgdGhpcy5zZXRSZXNvbHZlciA9IGZ1bmN0aW9uKHJlc29sdmVyKSB7XHJcbiAgICAgIHRoaXMucmVzb2x2ZXIgPSByZXNvbHZlcjtcclxuICAgIH07XHJcblxyXG4gICAgdGhpcy4kZ2V0ID0gWyckaW5qZWN0b3InLCAnJHEnLCBmdW5jdGlvbigkaW5qZWN0b3IsICRxKSB7XHJcbiAgICAgIHZhciByZXNvbHZlciA9IHJlc29sdmUucmVzb2x2ZXIgPyAkaW5qZWN0b3IuZ2V0KHJlc29sdmUucmVzb2x2ZXIpIDogbnVsbDtcclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICByZXNvbHZlOiBmdW5jdGlvbihpbnZvY2FibGVzLCBsb2NhbHMsIHBhcmVudCwgc2VsZikge1xyXG4gICAgICAgICAgaWYgKHJlc29sdmVyKSB7XHJcbiAgICAgICAgICAgIHJldHVybiByZXNvbHZlci5yZXNvbHZlKGludm9jYWJsZXMsIGxvY2FscywgcGFyZW50LCBzZWxmKTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICB2YXIgcHJvbWlzZXMgPSBbXTtcclxuXHJcbiAgICAgICAgICBhbmd1bGFyLmZvckVhY2goaW52b2NhYmxlcywgZnVuY3Rpb24odmFsdWUpIHtcclxuICAgICAgICAgICAgaWYgKGFuZ3VsYXIuaXNGdW5jdGlvbih2YWx1ZSkgfHwgYW5ndWxhci5pc0FycmF5KHZhbHVlKSkge1xyXG4gICAgICAgICAgICAgIHByb21pc2VzLnB1c2goJHEucmVzb2x2ZSgkaW5qZWN0b3IuaW52b2tlKHZhbHVlKSkpO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGFuZ3VsYXIuaXNTdHJpbmcodmFsdWUpKSB7XHJcbiAgICAgICAgICAgICAgcHJvbWlzZXMucHVzaCgkcS5yZXNvbHZlKCRpbmplY3Rvci5nZXQodmFsdWUpKSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgcHJvbWlzZXMucHVzaCgkcS5yZXNvbHZlKHZhbHVlKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgIHJldHVybiAkcS5hbGwocHJvbWlzZXMpLnRoZW4oZnVuY3Rpb24ocmVzb2x2ZXMpIHtcclxuICAgICAgICAgICAgdmFyIHJlc29sdmVPYmogPSB7fTtcclxuICAgICAgICAgICAgdmFyIHJlc29sdmVJdGVyID0gMDtcclxuICAgICAgICAgICAgYW5ndWxhci5mb3JFYWNoKGludm9jYWJsZXMsIGZ1bmN0aW9uKHZhbHVlLCBrZXkpIHtcclxuICAgICAgICAgICAgICByZXNvbHZlT2JqW2tleV0gPSByZXNvbHZlc1tyZXNvbHZlSXRlcisrXTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gcmVzb2x2ZU9iajtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgfTtcclxuICAgIH1dO1xyXG4gIH0pXHJcblxyXG4vKipcclxuICogQSBoZWxwZXIgZGlyZWN0aXZlIGZvciB0aGUgJG1vZGFsIHNlcnZpY2UuIEl0IGNyZWF0ZXMgYSBiYWNrZHJvcCBlbGVtZW50LlxyXG4gKi9cclxuICAuZGlyZWN0aXZlKCd1aWJNb2RhbEJhY2tkcm9wJywgWyckYW5pbWF0ZScsICckaW5qZWN0b3InLCAnJHVpYk1vZGFsU3RhY2snLFxyXG4gIGZ1bmN0aW9uKCRhbmltYXRlLCAkaW5qZWN0b3IsICRtb2RhbFN0YWNrKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICByZXN0cmljdDogJ0EnLFxyXG4gICAgICBjb21waWxlOiBmdW5jdGlvbih0RWxlbWVudCwgdEF0dHJzKSB7XHJcbiAgICAgICAgdEVsZW1lbnQuYWRkQ2xhc3ModEF0dHJzLmJhY2tkcm9wQ2xhc3MpO1xyXG4gICAgICAgIHJldHVybiBsaW5rRm47XHJcbiAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgZnVuY3Rpb24gbGlua0ZuKHNjb3BlLCBlbGVtZW50LCBhdHRycykge1xyXG4gICAgICBpZiAoYXR0cnMubW9kYWxJbkNsYXNzKSB7XHJcbiAgICAgICAgJGFuaW1hdGUuYWRkQ2xhc3MoZWxlbWVudCwgYXR0cnMubW9kYWxJbkNsYXNzKTtcclxuXHJcbiAgICAgICAgc2NvcGUuJG9uKCRtb2RhbFN0YWNrLk5PV19DTE9TSU5HX0VWRU5ULCBmdW5jdGlvbihlLCBzZXRJc0FzeW5jKSB7XHJcbiAgICAgICAgICB2YXIgZG9uZSA9IHNldElzQXN5bmMoKTtcclxuICAgICAgICAgIGlmIChzY29wZS5tb2RhbE9wdGlvbnMuYW5pbWF0aW9uKSB7XHJcbiAgICAgICAgICAgICRhbmltYXRlLnJlbW92ZUNsYXNzKGVsZW1lbnQsIGF0dHJzLm1vZGFsSW5DbGFzcykudGhlbihkb25lKTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGRvbmUoKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1dKVxyXG5cclxuICAuZGlyZWN0aXZlKCd1aWJNb2RhbFdpbmRvdycsIFsnJHVpYk1vZGFsU3RhY2snLCAnJHEnLCAnJGFuaW1hdGVDc3MnLCAnJGRvY3VtZW50JyxcclxuICBmdW5jdGlvbigkbW9kYWxTdGFjaywgJHEsICRhbmltYXRlQ3NzLCAkZG9jdW1lbnQpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIHNjb3BlOiB7XHJcbiAgICAgICAgaW5kZXg6ICdAJ1xyXG4gICAgICB9LFxyXG4gICAgICByZXN0cmljdDogJ0EnLFxyXG4gICAgICB0cmFuc2NsdWRlOiB0cnVlLFxyXG4gICAgICB0ZW1wbGF0ZVVybDogZnVuY3Rpb24odEVsZW1lbnQsIHRBdHRycykge1xyXG4gICAgICAgIHJldHVybiB0QXR0cnMudGVtcGxhdGVVcmwgfHwgJ3VpYi90ZW1wbGF0ZS9tb2RhbC93aW5kb3cuaHRtbCc7XHJcbiAgICAgIH0sXHJcbiAgICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBlbGVtZW50LCBhdHRycykge1xyXG4gICAgICAgIGVsZW1lbnQuYWRkQ2xhc3MoYXR0cnMud2luZG93VG9wQ2xhc3MgfHwgJycpO1xyXG4gICAgICAgIHNjb3BlLnNpemUgPSBhdHRycy5zaXplO1xyXG5cclxuICAgICAgICBzY29wZS5jbG9zZSA9IGZ1bmN0aW9uKGV2dCkge1xyXG4gICAgICAgICAgdmFyIG1vZGFsID0gJG1vZGFsU3RhY2suZ2V0VG9wKCk7XHJcbiAgICAgICAgICBpZiAobW9kYWwgJiYgbW9kYWwudmFsdWUuYmFja2Ryb3AgJiZcclxuICAgICAgICAgICAgbW9kYWwudmFsdWUuYmFja2Ryb3AgIT09ICdzdGF0aWMnICYmXHJcbiAgICAgICAgICAgIGV2dC50YXJnZXQgPT09IGV2dC5jdXJyZW50VGFyZ2V0KSB7XHJcbiAgICAgICAgICAgIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICBldnQuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgICAgICRtb2RhbFN0YWNrLmRpc21pc3MobW9kYWwua2V5LCAnYmFja2Ryb3AgY2xpY2snKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvLyBtb3ZlZCBmcm9tIHRlbXBsYXRlIHRvIGZpeCBpc3N1ZSAjMjI4MFxyXG4gICAgICAgIGVsZW1lbnQub24oJ2NsaWNrJywgc2NvcGUuY2xvc2UpO1xyXG5cclxuICAgICAgICAvLyBUaGlzIHByb3BlcnR5IGlzIG9ubHkgYWRkZWQgdG8gdGhlIHNjb3BlIGZvciB0aGUgcHVycG9zZSBvZiBkZXRlY3Rpbmcgd2hlbiB0aGlzIGRpcmVjdGl2ZSBpcyByZW5kZXJlZC5cclxuICAgICAgICAvLyBXZSBjYW4gZGV0ZWN0IHRoYXQgYnkgdXNpbmcgdGhpcyBwcm9wZXJ0eSBpbiB0aGUgdGVtcGxhdGUgYXNzb2NpYXRlZCB3aXRoIHRoaXMgZGlyZWN0aXZlIGFuZCB0aGVuIHVzZVxyXG4gICAgICAgIC8vIHtAbGluayBBdHRyaWJ1dGUjJG9ic2VydmV9IG9uIGl0LiBGb3IgbW9yZSBkZXRhaWxzIHBsZWFzZSBzZWUge0BsaW5rIFRhYmxlQ29sdW1uUmVzaXplfS5cclxuICAgICAgICBzY29wZS4kaXNSZW5kZXJlZCA9IHRydWU7XHJcblxyXG4gICAgICAgIC8vIERlZmVycmVkIG9iamVjdCB0aGF0IHdpbGwgYmUgcmVzb2x2ZWQgd2hlbiB0aGlzIG1vZGFsIGlzIHJlbmRlci5cclxuICAgICAgICB2YXIgbW9kYWxSZW5kZXJEZWZlck9iaiA9ICRxLmRlZmVyKCk7XHJcbiAgICAgICAgLy8gUmVzb2x2ZSByZW5kZXIgcHJvbWlzZSBwb3N0LWRpZ2VzdFxyXG4gICAgICAgIHNjb3BlLiQkcG9zdERpZ2VzdChmdW5jdGlvbigpIHtcclxuICAgICAgICAgIG1vZGFsUmVuZGVyRGVmZXJPYmoucmVzb2x2ZSgpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBtb2RhbFJlbmRlckRlZmVyT2JqLnByb21pc2UudGhlbihmdW5jdGlvbigpIHtcclxuICAgICAgICAgIHZhciBhbmltYXRpb25Qcm9taXNlID0gbnVsbDtcclxuXHJcbiAgICAgICAgICBpZiAoYXR0cnMubW9kYWxJbkNsYXNzKSB7XHJcbiAgICAgICAgICAgIGFuaW1hdGlvblByb21pc2UgPSAkYW5pbWF0ZUNzcyhlbGVtZW50LCB7XHJcbiAgICAgICAgICAgICAgYWRkQ2xhc3M6IGF0dHJzLm1vZGFsSW5DbGFzc1xyXG4gICAgICAgICAgICB9KS5zdGFydCgpO1xyXG5cclxuICAgICAgICAgICAgc2NvcGUuJG9uKCRtb2RhbFN0YWNrLk5PV19DTE9TSU5HX0VWRU5ULCBmdW5jdGlvbihlLCBzZXRJc0FzeW5jKSB7XHJcbiAgICAgICAgICAgICAgdmFyIGRvbmUgPSBzZXRJc0FzeW5jKCk7XHJcbiAgICAgICAgICAgICAgJGFuaW1hdGVDc3MoZWxlbWVudCwge1xyXG4gICAgICAgICAgICAgICAgcmVtb3ZlQ2xhc3M6IGF0dHJzLm1vZGFsSW5DbGFzc1xyXG4gICAgICAgICAgICAgIH0pLnN0YXJ0KCkudGhlbihkb25lKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICAgICRxLndoZW4oYW5pbWF0aW9uUHJvbWlzZSkudGhlbihmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgLy8gTm90aWZ5IHtAbGluayAkbW9kYWxTdGFja30gdGhhdCBtb2RhbCBpcyByZW5kZXJlZC5cclxuICAgICAgICAgICAgdmFyIG1vZGFsID0gJG1vZGFsU3RhY2suZ2V0VG9wKCk7XHJcbiAgICAgICAgICAgIGlmIChtb2RhbCkge1xyXG4gICAgICAgICAgICAgICRtb2RhbFN0YWNrLm1vZGFsUmVuZGVyZWQobW9kYWwua2V5KTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLyoqXHJcbiAgICAgICAgICAgICAqIElmIHNvbWV0aGluZyB3aXRoaW4gdGhlIGZyZXNobHktb3BlbmVkIG1vZGFsIGFscmVhZHkgaGFzIGZvY3VzIChwZXJoYXBzIHZpYSBhXHJcbiAgICAgICAgICAgICAqIGRpcmVjdGl2ZSB0aGF0IGNhdXNlcyBmb2N1cykuIHRoZW4gbm8gbmVlZCB0byB0cnkgYW5kIGZvY3VzIGFueXRoaW5nLlxyXG4gICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgaWYgKCEoJGRvY3VtZW50WzBdLmFjdGl2ZUVsZW1lbnQgJiYgZWxlbWVudFswXS5jb250YWlucygkZG9jdW1lbnRbMF0uYWN0aXZlRWxlbWVudCkpKSB7XHJcbiAgICAgICAgICAgICAgdmFyIGlucHV0V2l0aEF1dG9mb2N1cyA9IGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignW2F1dG9mb2N1c10nKTtcclxuICAgICAgICAgICAgICAvKipcclxuICAgICAgICAgICAgICAgKiBBdXRvLWZvY3VzaW5nIG9mIGEgZnJlc2hseS1vcGVuZWQgbW9kYWwgZWxlbWVudCBjYXVzZXMgYW55IGNoaWxkIGVsZW1lbnRzXHJcbiAgICAgICAgICAgICAgICogd2l0aCB0aGUgYXV0b2ZvY3VzIGF0dHJpYnV0ZSB0byBsb3NlIGZvY3VzLiBUaGlzIGlzIGFuIGlzc3VlIG9uIHRvdWNoXHJcbiAgICAgICAgICAgICAgICogYmFzZWQgZGV2aWNlcyB3aGljaCB3aWxsIHNob3cgYW5kIHRoZW4gaGlkZSB0aGUgb25zY3JlZW4ga2V5Ym9hcmQuXHJcbiAgICAgICAgICAgICAgICogQXR0ZW1wdHMgdG8gcmVmb2N1cyB0aGUgYXV0b2ZvY3VzIGVsZW1lbnQgdmlhIEphdmFTY3JpcHQgd2lsbCBub3QgcmVvcGVuXHJcbiAgICAgICAgICAgICAgICogdGhlIG9uc2NyZWVuIGtleWJvYXJkLiBGaXhlZCBieSB1cGRhdGVkIHRoZSBmb2N1c2luZyBsb2dpYyB0byBvbmx5IGF1dG9mb2N1c1xyXG4gICAgICAgICAgICAgICAqIHRoZSBtb2RhbCBlbGVtZW50IGlmIHRoZSBtb2RhbCBkb2VzIG5vdCBjb250YWluIGFuIGF1dG9mb2N1cyBlbGVtZW50LlxyXG4gICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgIGlmIChpbnB1dFdpdGhBdXRvZm9jdXMpIHtcclxuICAgICAgICAgICAgICAgIGlucHV0V2l0aEF1dG9mb2N1cy5mb2N1cygpO1xyXG4gICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBlbGVtZW50WzBdLmZvY3VzKCk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuICB9XSlcclxuXHJcbiAgLmRpcmVjdGl2ZSgndWliTW9kYWxBbmltYXRpb25DbGFzcycsIGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgY29tcGlsZTogZnVuY3Rpb24odEVsZW1lbnQsIHRBdHRycykge1xyXG4gICAgICAgIGlmICh0QXR0cnMubW9kYWxBbmltYXRpb24pIHtcclxuICAgICAgICAgIHRFbGVtZW50LmFkZENsYXNzKHRBdHRycy51aWJNb2RhbEFuaW1hdGlvbkNsYXNzKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH07XHJcbiAgfSlcclxuXHJcbiAgLmRpcmVjdGl2ZSgndWliTW9kYWxUcmFuc2NsdWRlJywgWyckYW5pbWF0ZScsIGZ1bmN0aW9uKCRhbmltYXRlKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxlbWVudCwgYXR0cnMsIGNvbnRyb2xsZXIsIHRyYW5zY2x1ZGUpIHtcclxuICAgICAgICB0cmFuc2NsdWRlKHNjb3BlLiRwYXJlbnQsIGZ1bmN0aW9uKGNsb25lKSB7XHJcbiAgICAgICAgICBlbGVtZW50LmVtcHR5KCk7XHJcbiAgICAgICAgICAkYW5pbWF0ZS5lbnRlcihjbG9uZSwgZWxlbWVudCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgIH07XHJcbiAgfV0pXHJcblxyXG4gIC5mYWN0b3J5KCckdWliTW9kYWxTdGFjaycsIFsnJGFuaW1hdGUnLCAnJGFuaW1hdGVDc3MnLCAnJGRvY3VtZW50JyxcclxuICAgICckY29tcGlsZScsICckcm9vdFNjb3BlJywgJyRxJywgJyQkbXVsdGlNYXAnLCAnJCRzdGFja2VkTWFwJywgJyR1aWJQb3NpdGlvbicsXHJcbiAgICBmdW5jdGlvbigkYW5pbWF0ZSwgJGFuaW1hdGVDc3MsICRkb2N1bWVudCwgJGNvbXBpbGUsICRyb290U2NvcGUsICRxLCAkJG11bHRpTWFwLCAkJHN0YWNrZWRNYXAsICR1aWJQb3NpdGlvbikge1xyXG4gICAgICB2YXIgT1BFTkVEX01PREFMX0NMQVNTID0gJ21vZGFsLW9wZW4nO1xyXG5cclxuICAgICAgdmFyIGJhY2tkcm9wRG9tRWwsIGJhY2tkcm9wU2NvcGU7XHJcbiAgICAgIHZhciBvcGVuZWRXaW5kb3dzID0gJCRzdGFja2VkTWFwLmNyZWF0ZU5ldygpO1xyXG4gICAgICB2YXIgb3BlbmVkQ2xhc3NlcyA9ICQkbXVsdGlNYXAuY3JlYXRlTmV3KCk7XHJcbiAgICAgIHZhciAkbW9kYWxTdGFjayA9IHtcclxuICAgICAgICBOT1dfQ0xPU0lOR19FVkVOVDogJ21vZGFsLnN0YWNrLm5vdy1jbG9zaW5nJ1xyXG4gICAgICB9O1xyXG4gICAgICB2YXIgdG9wTW9kYWxJbmRleCA9IDA7XHJcbiAgICAgIHZhciBwcmV2aW91c1RvcE9wZW5lZE1vZGFsID0gbnVsbDtcclxuXHJcbiAgICAgIC8vTW9kYWwgZm9jdXMgYmVoYXZpb3JcclxuICAgICAgdmFyIHRhYmJhYmxlU2VsZWN0b3IgPSAnYVtocmVmXSwgYXJlYVtocmVmXSwgaW5wdXQ6bm90KFtkaXNhYmxlZF0pOm5vdChbdGFiaW5kZXg9XFwnLTFcXCddKSwgJyArXHJcbiAgICAgICAgJ2J1dHRvbjpub3QoW2Rpc2FibGVkXSk6bm90KFt0YWJpbmRleD1cXCctMVxcJ10pLHNlbGVjdDpub3QoW2Rpc2FibGVkXSk6bm90KFt0YWJpbmRleD1cXCctMVxcJ10pLCB0ZXh0YXJlYTpub3QoW2Rpc2FibGVkXSk6bm90KFt0YWJpbmRleD1cXCctMVxcJ10pLCAnICtcclxuICAgICAgICAnaWZyYW1lLCBvYmplY3QsIGVtYmVkLCAqW3RhYmluZGV4XTpub3QoW3RhYmluZGV4PVxcJy0xXFwnXSksICpbY29udGVudGVkaXRhYmxlPXRydWVdJztcclxuICAgICAgdmFyIHNjcm9sbGJhclBhZGRpbmc7XHJcbiAgICAgIHZhciBTTkFLRV9DQVNFX1JFR0VYUCA9IC9bQS1aXS9nO1xyXG5cclxuICAgICAgLy8gVE9ETzogZXh0cmFjdCBpbnRvIGNvbW1vbiBkZXBlbmRlbmN5IHdpdGggdG9vbHRpcFxyXG4gICAgICBmdW5jdGlvbiBzbmFrZV9jYXNlKG5hbWUpIHtcclxuICAgICAgICB2YXIgc2VwYXJhdG9yID0gJy0nO1xyXG4gICAgICAgIHJldHVybiBuYW1lLnJlcGxhY2UoU05BS0VfQ0FTRV9SRUdFWFAsIGZ1bmN0aW9uKGxldHRlciwgcG9zKSB7XHJcbiAgICAgICAgICByZXR1cm4gKHBvcyA/IHNlcGFyYXRvciA6ICcnKSArIGxldHRlci50b0xvd2VyQ2FzZSgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBmdW5jdGlvbiBpc1Zpc2libGUoZWxlbWVudCkge1xyXG4gICAgICAgIHJldHVybiAhIShlbGVtZW50Lm9mZnNldFdpZHRoIHx8XHJcbiAgICAgICAgICBlbGVtZW50Lm9mZnNldEhlaWdodCB8fFxyXG4gICAgICAgICAgZWxlbWVudC5nZXRDbGllbnRSZWN0cygpLmxlbmd0aCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGZ1bmN0aW9uIGJhY2tkcm9wSW5kZXgoKSB7XHJcbiAgICAgICAgdmFyIHRvcEJhY2tkcm9wSW5kZXggPSAtMTtcclxuICAgICAgICB2YXIgb3BlbmVkID0gb3BlbmVkV2luZG93cy5rZXlzKCk7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBvcGVuZWQubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgIGlmIChvcGVuZWRXaW5kb3dzLmdldChvcGVuZWRbaV0pLnZhbHVlLmJhY2tkcm9wKSB7XHJcbiAgICAgICAgICAgIHRvcEJhY2tkcm9wSW5kZXggPSBpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gSWYgYW55IGJhY2tkcm9wIGV4aXN0LCBlbnN1cmUgdGhhdCBpdCdzIGluZGV4IGlzIGFsd2F5c1xyXG4gICAgICAgIC8vIHJpZ2h0IGJlbG93IHRoZSB0b3AgbW9kYWxcclxuICAgICAgICBpZiAodG9wQmFja2Ryb3BJbmRleCA+IC0xICYmIHRvcEJhY2tkcm9wSW5kZXggPCB0b3BNb2RhbEluZGV4KSB7XHJcbiAgICAgICAgICB0b3BCYWNrZHJvcEluZGV4ID0gdG9wTW9kYWxJbmRleDtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRvcEJhY2tkcm9wSW5kZXg7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgICRyb290U2NvcGUuJHdhdGNoKGJhY2tkcm9wSW5kZXgsIGZ1bmN0aW9uKG5ld0JhY2tkcm9wSW5kZXgpIHtcclxuICAgICAgICBpZiAoYmFja2Ryb3BTY29wZSkge1xyXG4gICAgICAgICAgYmFja2Ryb3BTY29wZS5pbmRleCA9IG5ld0JhY2tkcm9wSW5kZXg7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIGZ1bmN0aW9uIHJlbW92ZU1vZGFsV2luZG93KG1vZGFsSW5zdGFuY2UsIGVsZW1lbnRUb1JlY2VpdmVGb2N1cykge1xyXG4gICAgICAgIHZhciBtb2RhbFdpbmRvdyA9IG9wZW5lZFdpbmRvd3MuZ2V0KG1vZGFsSW5zdGFuY2UpLnZhbHVlO1xyXG4gICAgICAgIHZhciBhcHBlbmRUb0VsZW1lbnQgPSBtb2RhbFdpbmRvdy5hcHBlbmRUbztcclxuXHJcbiAgICAgICAgLy9jbGVhbiB1cCB0aGUgc3RhY2tcclxuICAgICAgICBvcGVuZWRXaW5kb3dzLnJlbW92ZShtb2RhbEluc3RhbmNlKTtcclxuICAgICAgICBwcmV2aW91c1RvcE9wZW5lZE1vZGFsID0gb3BlbmVkV2luZG93cy50b3AoKTtcclxuICAgICAgICBpZiAocHJldmlvdXNUb3BPcGVuZWRNb2RhbCkge1xyXG4gICAgICAgICAgdG9wTW9kYWxJbmRleCA9IHBhcnNlSW50KHByZXZpb3VzVG9wT3BlbmVkTW9kYWwudmFsdWUubW9kYWxEb21FbC5hdHRyKCdpbmRleCcpLCAxMCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZW1vdmVBZnRlckFuaW1hdGUobW9kYWxXaW5kb3cubW9kYWxEb21FbCwgbW9kYWxXaW5kb3cubW9kYWxTY29wZSwgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICB2YXIgbW9kYWxCb2R5Q2xhc3MgPSBtb2RhbFdpbmRvdy5vcGVuZWRDbGFzcyB8fCBPUEVORURfTU9EQUxfQ0xBU1M7XHJcbiAgICAgICAgICBvcGVuZWRDbGFzc2VzLnJlbW92ZShtb2RhbEJvZHlDbGFzcywgbW9kYWxJbnN0YW5jZSk7XHJcbiAgICAgICAgICB2YXIgYXJlQW55T3BlbiA9IG9wZW5lZENsYXNzZXMuaGFzS2V5KG1vZGFsQm9keUNsYXNzKTtcclxuICAgICAgICAgIGFwcGVuZFRvRWxlbWVudC50b2dnbGVDbGFzcyhtb2RhbEJvZHlDbGFzcywgYXJlQW55T3Blbik7XHJcbiAgICAgICAgICBpZiAoIWFyZUFueU9wZW4gJiYgc2Nyb2xsYmFyUGFkZGluZyAmJiBzY3JvbGxiYXJQYWRkaW5nLmhlaWdodE92ZXJmbG93ICYmIHNjcm9sbGJhclBhZGRpbmcuc2Nyb2xsYmFyV2lkdGgpIHtcclxuICAgICAgICAgICAgaWYgKHNjcm9sbGJhclBhZGRpbmcub3JpZ2luYWxSaWdodCkge1xyXG4gICAgICAgICAgICAgIGFwcGVuZFRvRWxlbWVudC5jc3Moe3BhZGRpbmdSaWdodDogc2Nyb2xsYmFyUGFkZGluZy5vcmlnaW5hbFJpZ2h0ICsgJ3B4J30pO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIGFwcGVuZFRvRWxlbWVudC5jc3Moe3BhZGRpbmdSaWdodDogJyd9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBzY3JvbGxiYXJQYWRkaW5nID0gbnVsbDtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHRvZ2dsZVRvcFdpbmRvd0NsYXNzKHRydWUpO1xyXG4gICAgICAgIH0sIG1vZGFsV2luZG93LmNsb3NlZERlZmVycmVkKTtcclxuICAgICAgICBjaGVja1JlbW92ZUJhY2tkcm9wKCk7XHJcblxyXG4gICAgICAgIC8vbW92ZSBmb2N1cyB0byBzcGVjaWZpZWQgZWxlbWVudCBpZiBhdmFpbGFibGUsIG9yIGVsc2UgdG8gYm9keVxyXG4gICAgICAgIGlmIChlbGVtZW50VG9SZWNlaXZlRm9jdXMgJiYgZWxlbWVudFRvUmVjZWl2ZUZvY3VzLmZvY3VzKSB7XHJcbiAgICAgICAgICBlbGVtZW50VG9SZWNlaXZlRm9jdXMuZm9jdXMoKTtcclxuICAgICAgICB9IGVsc2UgaWYgKGFwcGVuZFRvRWxlbWVudC5mb2N1cykge1xyXG4gICAgICAgICAgYXBwZW5kVG9FbGVtZW50LmZvY3VzKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBBZGQgb3IgcmVtb3ZlIFwid2luZG93VG9wQ2xhc3NcIiBmcm9tIHRoZSB0b3Agd2luZG93IGluIHRoZSBzdGFja1xyXG4gICAgICBmdW5jdGlvbiB0b2dnbGVUb3BXaW5kb3dDbGFzcyh0b2dnbGVTd2l0Y2gpIHtcclxuICAgICAgICB2YXIgbW9kYWxXaW5kb3c7XHJcblxyXG4gICAgICAgIGlmIChvcGVuZWRXaW5kb3dzLmxlbmd0aCgpID4gMCkge1xyXG4gICAgICAgICAgbW9kYWxXaW5kb3cgPSBvcGVuZWRXaW5kb3dzLnRvcCgpLnZhbHVlO1xyXG4gICAgICAgICAgbW9kYWxXaW5kb3cubW9kYWxEb21FbC50b2dnbGVDbGFzcyhtb2RhbFdpbmRvdy53aW5kb3dUb3BDbGFzcyB8fCAnJywgdG9nZ2xlU3dpdGNoKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGZ1bmN0aW9uIGNoZWNrUmVtb3ZlQmFja2Ryb3AoKSB7XHJcbiAgICAgICAgLy9yZW1vdmUgYmFja2Ryb3AgaWYgbm8gbG9uZ2VyIG5lZWRlZFxyXG4gICAgICAgIGlmIChiYWNrZHJvcERvbUVsICYmIGJhY2tkcm9wSW5kZXgoKSA9PT0gLTEpIHtcclxuICAgICAgICAgIHZhciBiYWNrZHJvcFNjb3BlUmVmID0gYmFja2Ryb3BTY29wZTtcclxuICAgICAgICAgIHJlbW92ZUFmdGVyQW5pbWF0ZShiYWNrZHJvcERvbUVsLCBiYWNrZHJvcFNjb3BlLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgYmFja2Ryb3BTY29wZVJlZiA9IG51bGw7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICAgIGJhY2tkcm9wRG9tRWwgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgICBiYWNrZHJvcFNjb3BlID0gdW5kZWZpbmVkO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgZnVuY3Rpb24gcmVtb3ZlQWZ0ZXJBbmltYXRlKGRvbUVsLCBzY29wZSwgZG9uZSwgY2xvc2VkRGVmZXJyZWQpIHtcclxuICAgICAgICB2YXIgYXN5bmNEZWZlcnJlZDtcclxuICAgICAgICB2YXIgYXN5bmNQcm9taXNlID0gbnVsbDtcclxuICAgICAgICB2YXIgc2V0SXNBc3luYyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgaWYgKCFhc3luY0RlZmVycmVkKSB7XHJcbiAgICAgICAgICAgIGFzeW5jRGVmZXJyZWQgPSAkcS5kZWZlcigpO1xyXG4gICAgICAgICAgICBhc3luY1Byb21pc2UgPSBhc3luY0RlZmVycmVkLnByb21pc2U7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIGFzeW5jRG9uZSgpIHtcclxuICAgICAgICAgICAgYXN5bmNEZWZlcnJlZC5yZXNvbHZlKCk7XHJcbiAgICAgICAgICB9O1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgc2NvcGUuJGJyb2FkY2FzdCgkbW9kYWxTdGFjay5OT1dfQ0xPU0lOR19FVkVOVCwgc2V0SXNBc3luYyk7XHJcblxyXG4gICAgICAgIC8vIE5vdGUgdGhhdCBpdCdzIGludGVudGlvbmFsIHRoYXQgYXN5bmNQcm9taXNlIG1pZ2h0IGJlIG51bGwuXHJcbiAgICAgICAgLy8gVGhhdCdzIHdoZW4gc2V0SXNBc3luYyBoYXMgbm90IGJlZW4gY2FsbGVkIGR1cmluZyB0aGVcclxuICAgICAgICAvLyBOT1dfQ0xPU0lOR19FVkVOVCBicm9hZGNhc3QuXHJcbiAgICAgICAgcmV0dXJuICRxLndoZW4oYXN5bmNQcm9taXNlKS50aGVuKGFmdGVyQW5pbWF0aW5nKTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gYWZ0ZXJBbmltYXRpbmcoKSB7XHJcbiAgICAgICAgICBpZiAoYWZ0ZXJBbmltYXRpbmcuZG9uZSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBhZnRlckFuaW1hdGluZy5kb25lID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgICAkYW5pbWF0ZS5sZWF2ZShkb21FbCkudGhlbihmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgaWYgKGRvbmUpIHtcclxuICAgICAgICAgICAgICBkb25lKCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGRvbUVsLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICBpZiAoY2xvc2VkRGVmZXJyZWQpIHtcclxuICAgICAgICAgICAgICBjbG9zZWREZWZlcnJlZC5yZXNvbHZlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgIHNjb3BlLiRkZXN0cm95KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICAkZG9jdW1lbnQub24oJ2tleWRvd24nLCBrZXlkb3duTGlzdGVuZXIpO1xyXG5cclxuICAgICAgJHJvb3RTY29wZS4kb24oJyRkZXN0cm95JywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgJGRvY3VtZW50Lm9mZigna2V5ZG93bicsIGtleWRvd25MaXN0ZW5lcik7XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgZnVuY3Rpb24ga2V5ZG93bkxpc3RlbmVyKGV2dCkge1xyXG4gICAgICAgIGlmIChldnQuaXNEZWZhdWx0UHJldmVudGVkKCkpIHtcclxuICAgICAgICAgIHJldHVybiBldnQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2YXIgbW9kYWwgPSBvcGVuZWRXaW5kb3dzLnRvcCgpO1xyXG4gICAgICAgIGlmIChtb2RhbCkge1xyXG4gICAgICAgICAgc3dpdGNoIChldnQud2hpY2gpIHtcclxuICAgICAgICAgICAgY2FzZSAyNzoge1xyXG4gICAgICAgICAgICAgIGlmIChtb2RhbC52YWx1ZS5rZXlib2FyZCkge1xyXG4gICAgICAgICAgICAgICAgZXZ0LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRhcHBseShmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgJG1vZGFsU3RhY2suZGlzbWlzcyhtb2RhbC5rZXksICdlc2NhcGUga2V5IHByZXNzJyk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2FzZSA5OiB7XHJcbiAgICAgICAgICAgICAgdmFyIGxpc3QgPSAkbW9kYWxTdGFjay5sb2FkRm9jdXNFbGVtZW50TGlzdChtb2RhbCk7XHJcbiAgICAgICAgICAgICAgdmFyIGZvY3VzQ2hhbmdlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgIGlmIChldnQuc2hpZnRLZXkpIHtcclxuICAgICAgICAgICAgICAgIGlmICgkbW9kYWxTdGFjay5pc0ZvY3VzSW5GaXJzdEl0ZW0oZXZ0LCBsaXN0KSB8fCAkbW9kYWxTdGFjay5pc01vZGFsRm9jdXNlZChldnQsIG1vZGFsKSkge1xyXG4gICAgICAgICAgICAgICAgICBmb2N1c0NoYW5nZWQgPSAkbW9kYWxTdGFjay5mb2N1c0xhc3RGb2N1c2FibGVFbGVtZW50KGxpc3QpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoJG1vZGFsU3RhY2suaXNGb2N1c0luTGFzdEl0ZW0oZXZ0LCBsaXN0KSkge1xyXG4gICAgICAgICAgICAgICAgICBmb2N1c0NoYW5nZWQgPSAkbW9kYWxTdGFjay5mb2N1c0ZpcnN0Rm9jdXNhYmxlRWxlbWVudChsaXN0KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgIGlmIChmb2N1c0NoYW5nZWQpIHtcclxuICAgICAgICAgICAgICAgIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICAgICAgZXZ0LnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgICRtb2RhbFN0YWNrLm9wZW4gPSBmdW5jdGlvbihtb2RhbEluc3RhbmNlLCBtb2RhbCkge1xyXG4gICAgICAgIHZhciBtb2RhbE9wZW5lciA9ICRkb2N1bWVudFswXS5hY3RpdmVFbGVtZW50LFxyXG4gICAgICAgICAgbW9kYWxCb2R5Q2xhc3MgPSBtb2RhbC5vcGVuZWRDbGFzcyB8fCBPUEVORURfTU9EQUxfQ0xBU1M7XHJcblxyXG4gICAgICAgIHRvZ2dsZVRvcFdpbmRvd0NsYXNzKGZhbHNlKTtcclxuXHJcbiAgICAgICAgLy8gU3RvcmUgdGhlIGN1cnJlbnQgdG9wIGZpcnN0LCB0byBkZXRlcm1pbmUgd2hhdCBpbmRleCB3ZSBvdWdodCB0byB1c2VcclxuICAgICAgICAvLyBmb3IgdGhlIGN1cnJlbnQgdG9wIG1vZGFsXHJcbiAgICAgICAgcHJldmlvdXNUb3BPcGVuZWRNb2RhbCA9IG9wZW5lZFdpbmRvd3MudG9wKCk7XHJcblxyXG4gICAgICAgIG9wZW5lZFdpbmRvd3MuYWRkKG1vZGFsSW5zdGFuY2UsIHtcclxuICAgICAgICAgIGRlZmVycmVkOiBtb2RhbC5kZWZlcnJlZCxcclxuICAgICAgICAgIHJlbmRlckRlZmVycmVkOiBtb2RhbC5yZW5kZXJEZWZlcnJlZCxcclxuICAgICAgICAgIGNsb3NlZERlZmVycmVkOiBtb2RhbC5jbG9zZWREZWZlcnJlZCxcclxuICAgICAgICAgIG1vZGFsU2NvcGU6IG1vZGFsLnNjb3BlLFxyXG4gICAgICAgICAgYmFja2Ryb3A6IG1vZGFsLmJhY2tkcm9wLFxyXG4gICAgICAgICAga2V5Ym9hcmQ6IG1vZGFsLmtleWJvYXJkLFxyXG4gICAgICAgICAgb3BlbmVkQ2xhc3M6IG1vZGFsLm9wZW5lZENsYXNzLFxyXG4gICAgICAgICAgd2luZG93VG9wQ2xhc3M6IG1vZGFsLndpbmRvd1RvcENsYXNzLFxyXG4gICAgICAgICAgYW5pbWF0aW9uOiBtb2RhbC5hbmltYXRpb24sXHJcbiAgICAgICAgICBhcHBlbmRUbzogbW9kYWwuYXBwZW5kVG9cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgb3BlbmVkQ2xhc3Nlcy5wdXQobW9kYWxCb2R5Q2xhc3MsIG1vZGFsSW5zdGFuY2UpO1xyXG5cclxuICAgICAgICB2YXIgYXBwZW5kVG9FbGVtZW50ID0gbW9kYWwuYXBwZW5kVG8sXHJcbiAgICAgICAgICAgIGN1cnJCYWNrZHJvcEluZGV4ID0gYmFja2Ryb3BJbmRleCgpO1xyXG5cclxuICAgICAgICBpZiAoIWFwcGVuZFRvRWxlbWVudC5sZW5ndGgpIHtcclxuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignYXBwZW5kVG8gZWxlbWVudCBub3QgZm91bmQuIE1ha2Ugc3VyZSB0aGF0IHRoZSBlbGVtZW50IHBhc3NlZCBpcyBpbiBET00uJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoY3VyckJhY2tkcm9wSW5kZXggPj0gMCAmJiAhYmFja2Ryb3BEb21FbCkge1xyXG4gICAgICAgICAgYmFja2Ryb3BTY29wZSA9ICRyb290U2NvcGUuJG5ldyh0cnVlKTtcclxuICAgICAgICAgIGJhY2tkcm9wU2NvcGUubW9kYWxPcHRpb25zID0gbW9kYWw7XHJcbiAgICAgICAgICBiYWNrZHJvcFNjb3BlLmluZGV4ID0gY3VyckJhY2tkcm9wSW5kZXg7XHJcbiAgICAgICAgICBiYWNrZHJvcERvbUVsID0gYW5ndWxhci5lbGVtZW50KCc8ZGl2IHVpYi1tb2RhbC1iYWNrZHJvcD1cIm1vZGFsLWJhY2tkcm9wXCI+PC9kaXY+Jyk7XHJcbiAgICAgICAgICBiYWNrZHJvcERvbUVsLmF0dHIoe1xyXG4gICAgICAgICAgICAnY2xhc3MnOiAnbW9kYWwtYmFja2Ryb3AnLFxyXG4gICAgICAgICAgICAnbmctc3R5bGUnOiAne1xcJ3otaW5kZXhcXCc6IDEwNDAgKyAoaW5kZXggJiYgMSB8fCAwKSArIGluZGV4KjEwfScsXHJcbiAgICAgICAgICAgICd1aWItbW9kYWwtYW5pbWF0aW9uLWNsYXNzJzogJ2ZhZGUnLFxyXG4gICAgICAgICAgICAnbW9kYWwtaW4tY2xhc3MnOiAnaW4nXHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICAgIGlmIChtb2RhbC5iYWNrZHJvcENsYXNzKSB7XHJcbiAgICAgICAgICAgIGJhY2tkcm9wRG9tRWwuYWRkQ2xhc3MobW9kYWwuYmFja2Ryb3BDbGFzcyk7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgaWYgKG1vZGFsLmFuaW1hdGlvbikge1xyXG4gICAgICAgICAgICBiYWNrZHJvcERvbUVsLmF0dHIoJ21vZGFsLWFuaW1hdGlvbicsICd0cnVlJyk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICAkY29tcGlsZShiYWNrZHJvcERvbUVsKShiYWNrZHJvcFNjb3BlKTtcclxuICAgICAgICAgICRhbmltYXRlLmVudGVyKGJhY2tkcm9wRG9tRWwsIGFwcGVuZFRvRWxlbWVudCk7XHJcbiAgICAgICAgICBpZiAoJHVpYlBvc2l0aW9uLmlzU2Nyb2xsYWJsZShhcHBlbmRUb0VsZW1lbnQpKSB7XHJcbiAgICAgICAgICAgIHNjcm9sbGJhclBhZGRpbmcgPSAkdWliUG9zaXRpb24uc2Nyb2xsYmFyUGFkZGluZyhhcHBlbmRUb0VsZW1lbnQpO1xyXG4gICAgICAgICAgICBpZiAoc2Nyb2xsYmFyUGFkZGluZy5oZWlnaHRPdmVyZmxvdyAmJiBzY3JvbGxiYXJQYWRkaW5nLnNjcm9sbGJhcldpZHRoKSB7XHJcbiAgICAgICAgICAgICAgYXBwZW5kVG9FbGVtZW50LmNzcyh7cGFkZGluZ1JpZ2h0OiBzY3JvbGxiYXJQYWRkaW5nLnJpZ2h0ICsgJ3B4J30pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2YXIgY29udGVudDtcclxuICAgICAgICBpZiAobW9kYWwuY29tcG9uZW50KSB7XHJcbiAgICAgICAgICBjb250ZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChzbmFrZV9jYXNlKG1vZGFsLmNvbXBvbmVudC5uYW1lKSk7XHJcbiAgICAgICAgICBjb250ZW50ID0gYW5ndWxhci5lbGVtZW50KGNvbnRlbnQpO1xyXG4gICAgICAgICAgY29udGVudC5hdHRyKHtcclxuICAgICAgICAgICAgcmVzb2x2ZTogJyRyZXNvbHZlJyxcclxuICAgICAgICAgICAgJ21vZGFsLWluc3RhbmNlJzogJyR1aWJNb2RhbEluc3RhbmNlJyxcclxuICAgICAgICAgICAgY2xvc2U6ICckY2xvc2UoJHZhbHVlKScsXHJcbiAgICAgICAgICAgIGRpc21pc3M6ICckZGlzbWlzcygkdmFsdWUpJ1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGNvbnRlbnQgPSBtb2RhbC5jb250ZW50O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gU2V0IHRoZSB0b3AgbW9kYWwgaW5kZXggYmFzZWQgb24gdGhlIGluZGV4IG9mIHRoZSBwcmV2aW91cyB0b3AgbW9kYWxcclxuICAgICAgICB0b3BNb2RhbEluZGV4ID0gcHJldmlvdXNUb3BPcGVuZWRNb2RhbCA/IHBhcnNlSW50KHByZXZpb3VzVG9wT3BlbmVkTW9kYWwudmFsdWUubW9kYWxEb21FbC5hdHRyKCdpbmRleCcpLCAxMCkgKyAxIDogMDtcclxuICAgICAgICB2YXIgYW5ndWxhckRvbUVsID0gYW5ndWxhci5lbGVtZW50KCc8ZGl2IHVpYi1tb2RhbC13aW5kb3c9XCJtb2RhbC13aW5kb3dcIj48L2Rpdj4nKTtcclxuICAgICAgICBhbmd1bGFyRG9tRWwuYXR0cih7XHJcbiAgICAgICAgICAnY2xhc3MnOiAnbW9kYWwnLFxyXG4gICAgICAgICAgJ3RlbXBsYXRlLXVybCc6IG1vZGFsLndpbmRvd1RlbXBsYXRlVXJsLFxyXG4gICAgICAgICAgJ3dpbmRvdy10b3AtY2xhc3MnOiBtb2RhbC53aW5kb3dUb3BDbGFzcyxcclxuICAgICAgICAgICdyb2xlJzogJ2RpYWxvZycsXHJcbiAgICAgICAgICAnYXJpYS1sYWJlbGxlZGJ5JzogbW9kYWwuYXJpYUxhYmVsbGVkQnksXHJcbiAgICAgICAgICAnYXJpYS1kZXNjcmliZWRieSc6IG1vZGFsLmFyaWFEZXNjcmliZWRCeSxcclxuICAgICAgICAgICdzaXplJzogbW9kYWwuc2l6ZSxcclxuICAgICAgICAgICdpbmRleCc6IHRvcE1vZGFsSW5kZXgsXHJcbiAgICAgICAgICAnYW5pbWF0ZSc6ICdhbmltYXRlJyxcclxuICAgICAgICAgICduZy1zdHlsZSc6ICd7XFwnei1pbmRleFxcJzogMTA1MCArICQkdG9wTW9kYWxJbmRleCoxMCwgZGlzcGxheTogXFwnYmxvY2tcXCd9JyxcclxuICAgICAgICAgICd0YWJpbmRleCc6IC0xLFxyXG4gICAgICAgICAgJ3VpYi1tb2RhbC1hbmltYXRpb24tY2xhc3MnOiAnZmFkZScsXHJcbiAgICAgICAgICAnbW9kYWwtaW4tY2xhc3MnOiAnaW4nXHJcbiAgICAgICAgfSkuYXBwZW5kKGNvbnRlbnQpO1xyXG4gICAgICAgIGlmIChtb2RhbC53aW5kb3dDbGFzcykge1xyXG4gICAgICAgICAgYW5ndWxhckRvbUVsLmFkZENsYXNzKG1vZGFsLndpbmRvd0NsYXNzKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChtb2RhbC5hbmltYXRpb24pIHtcclxuICAgICAgICAgIGFuZ3VsYXJEb21FbC5hdHRyKCdtb2RhbC1hbmltYXRpb24nLCAndHJ1ZScpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgYXBwZW5kVG9FbGVtZW50LmFkZENsYXNzKG1vZGFsQm9keUNsYXNzKTtcclxuICAgICAgICBpZiAobW9kYWwuc2NvcGUpIHtcclxuICAgICAgICAgIC8vIHdlIG5lZWQgdG8gZXhwbGljaXRseSBhZGQgdGhlIG1vZGFsIGluZGV4IHRvIHRoZSBtb2RhbCBzY29wZVxyXG4gICAgICAgICAgLy8gYmVjYXVzZSBpdCBpcyBuZWVkZWQgYnkgbmdTdHlsZSB0byBjb21wdXRlIHRoZSB6SW5kZXggcHJvcGVydHkuXHJcbiAgICAgICAgICBtb2RhbC5zY29wZS4kJHRvcE1vZGFsSW5kZXggPSB0b3BNb2RhbEluZGV4O1xyXG4gICAgICAgIH1cclxuICAgICAgICAkYW5pbWF0ZS5lbnRlcigkY29tcGlsZShhbmd1bGFyRG9tRWwpKG1vZGFsLnNjb3BlKSwgYXBwZW5kVG9FbGVtZW50KTtcclxuXHJcbiAgICAgICAgb3BlbmVkV2luZG93cy50b3AoKS52YWx1ZS5tb2RhbERvbUVsID0gYW5ndWxhckRvbUVsO1xyXG4gICAgICAgIG9wZW5lZFdpbmRvd3MudG9wKCkudmFsdWUubW9kYWxPcGVuZXIgPSBtb2RhbE9wZW5lcjtcclxuICAgICAgfTtcclxuXHJcbiAgICAgIGZ1bmN0aW9uIGJyb2FkY2FzdENsb3NpbmcobW9kYWxXaW5kb3csIHJlc3VsdE9yUmVhc29uLCBjbG9zaW5nKSB7XHJcbiAgICAgICAgcmV0dXJuICFtb2RhbFdpbmRvdy52YWx1ZS5tb2RhbFNjb3BlLiRicm9hZGNhc3QoJ21vZGFsLmNsb3NpbmcnLCByZXN1bHRPclJlYXNvbiwgY2xvc2luZykuZGVmYXVsdFByZXZlbnRlZDtcclxuICAgICAgfVxyXG5cclxuICAgICAgJG1vZGFsU3RhY2suY2xvc2UgPSBmdW5jdGlvbihtb2RhbEluc3RhbmNlLCByZXN1bHQpIHtcclxuICAgICAgICB2YXIgbW9kYWxXaW5kb3cgPSBvcGVuZWRXaW5kb3dzLmdldChtb2RhbEluc3RhbmNlKTtcclxuICAgICAgICBpZiAobW9kYWxXaW5kb3cgJiYgYnJvYWRjYXN0Q2xvc2luZyhtb2RhbFdpbmRvdywgcmVzdWx0LCB0cnVlKSkge1xyXG4gICAgICAgICAgbW9kYWxXaW5kb3cudmFsdWUubW9kYWxTY29wZS4kJHVpYkRlc3RydWN0aW9uU2NoZWR1bGVkID0gdHJ1ZTtcclxuICAgICAgICAgIG1vZGFsV2luZG93LnZhbHVlLmRlZmVycmVkLnJlc29sdmUocmVzdWx0KTtcclxuICAgICAgICAgIHJlbW92ZU1vZGFsV2luZG93KG1vZGFsSW5zdGFuY2UsIG1vZGFsV2luZG93LnZhbHVlLm1vZGFsT3BlbmVyKTtcclxuICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gIW1vZGFsV2luZG93O1xyXG4gICAgICB9O1xyXG5cclxuICAgICAgJG1vZGFsU3RhY2suZGlzbWlzcyA9IGZ1bmN0aW9uKG1vZGFsSW5zdGFuY2UsIHJlYXNvbikge1xyXG4gICAgICAgIHZhciBtb2RhbFdpbmRvdyA9IG9wZW5lZFdpbmRvd3MuZ2V0KG1vZGFsSW5zdGFuY2UpO1xyXG4gICAgICAgIGlmIChtb2RhbFdpbmRvdyAmJiBicm9hZGNhc3RDbG9zaW5nKG1vZGFsV2luZG93LCByZWFzb24sIGZhbHNlKSkge1xyXG4gICAgICAgICAgbW9kYWxXaW5kb3cudmFsdWUubW9kYWxTY29wZS4kJHVpYkRlc3RydWN0aW9uU2NoZWR1bGVkID0gdHJ1ZTtcclxuICAgICAgICAgIG1vZGFsV2luZG93LnZhbHVlLmRlZmVycmVkLnJlamVjdChyZWFzb24pO1xyXG4gICAgICAgICAgcmVtb3ZlTW9kYWxXaW5kb3cobW9kYWxJbnN0YW5jZSwgbW9kYWxXaW5kb3cudmFsdWUubW9kYWxPcGVuZXIpO1xyXG4gICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiAhbW9kYWxXaW5kb3c7XHJcbiAgICAgIH07XHJcblxyXG4gICAgICAkbW9kYWxTdGFjay5kaXNtaXNzQWxsID0gZnVuY3Rpb24ocmVhc29uKSB7XHJcbiAgICAgICAgdmFyIHRvcE1vZGFsID0gdGhpcy5nZXRUb3AoKTtcclxuICAgICAgICB3aGlsZSAodG9wTW9kYWwgJiYgdGhpcy5kaXNtaXNzKHRvcE1vZGFsLmtleSwgcmVhc29uKSkge1xyXG4gICAgICAgICAgdG9wTW9kYWwgPSB0aGlzLmdldFRvcCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgfTtcclxuXHJcbiAgICAgICRtb2RhbFN0YWNrLmdldFRvcCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiBvcGVuZWRXaW5kb3dzLnRvcCgpO1xyXG4gICAgICB9O1xyXG5cclxuICAgICAgJG1vZGFsU3RhY2subW9kYWxSZW5kZXJlZCA9IGZ1bmN0aW9uKG1vZGFsSW5zdGFuY2UpIHtcclxuICAgICAgICB2YXIgbW9kYWxXaW5kb3cgPSBvcGVuZWRXaW5kb3dzLmdldChtb2RhbEluc3RhbmNlKTtcclxuICAgICAgICBpZiAobW9kYWxXaW5kb3cpIHtcclxuICAgICAgICAgIG1vZGFsV2luZG93LnZhbHVlLnJlbmRlckRlZmVycmVkLnJlc29sdmUoKTtcclxuICAgICAgICB9XHJcbiAgICAgIH07XHJcblxyXG4gICAgICAkbW9kYWxTdGFjay5mb2N1c0ZpcnN0Rm9jdXNhYmxlRWxlbWVudCA9IGZ1bmN0aW9uKGxpc3QpIHtcclxuICAgICAgICBpZiAobGlzdC5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICBsaXN0WzBdLmZvY3VzKCk7XHJcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICB9O1xyXG5cclxuICAgICAgJG1vZGFsU3RhY2suZm9jdXNMYXN0Rm9jdXNhYmxlRWxlbWVudCA9IGZ1bmN0aW9uKGxpc3QpIHtcclxuICAgICAgICBpZiAobGlzdC5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICBsaXN0W2xpc3QubGVuZ3RoIC0gMV0uZm9jdXMoKTtcclxuICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgIH07XHJcblxyXG4gICAgICAkbW9kYWxTdGFjay5pc01vZGFsRm9jdXNlZCA9IGZ1bmN0aW9uKGV2dCwgbW9kYWxXaW5kb3cpIHtcclxuICAgICAgICBpZiAoZXZ0ICYmIG1vZGFsV2luZG93KSB7XHJcbiAgICAgICAgICB2YXIgbW9kYWxEb21FbCA9IG1vZGFsV2luZG93LnZhbHVlLm1vZGFsRG9tRWw7XHJcbiAgICAgICAgICBpZiAobW9kYWxEb21FbCAmJiBtb2RhbERvbUVsLmxlbmd0aCkge1xyXG4gICAgICAgICAgICByZXR1cm4gKGV2dC50YXJnZXQgfHwgZXZ0LnNyY0VsZW1lbnQpID09PSBtb2RhbERvbUVsWzBdO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgIH07XHJcblxyXG4gICAgICAkbW9kYWxTdGFjay5pc0ZvY3VzSW5GaXJzdEl0ZW0gPSBmdW5jdGlvbihldnQsIGxpc3QpIHtcclxuICAgICAgICBpZiAobGlzdC5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICByZXR1cm4gKGV2dC50YXJnZXQgfHwgZXZ0LnNyY0VsZW1lbnQpID09PSBsaXN0WzBdO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgIH07XHJcblxyXG4gICAgICAkbW9kYWxTdGFjay5pc0ZvY3VzSW5MYXN0SXRlbSA9IGZ1bmN0aW9uKGV2dCwgbGlzdCkge1xyXG4gICAgICAgIGlmIChsaXN0Lmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgIHJldHVybiAoZXZ0LnRhcmdldCB8fCBldnQuc3JjRWxlbWVudCkgPT09IGxpc3RbbGlzdC5sZW5ndGggLSAxXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICB9O1xyXG5cclxuICAgICAgJG1vZGFsU3RhY2subG9hZEZvY3VzRWxlbWVudExpc3QgPSBmdW5jdGlvbihtb2RhbFdpbmRvdykge1xyXG4gICAgICAgIGlmIChtb2RhbFdpbmRvdykge1xyXG4gICAgICAgICAgdmFyIG1vZGFsRG9tRTEgPSBtb2RhbFdpbmRvdy52YWx1ZS5tb2RhbERvbUVsO1xyXG4gICAgICAgICAgaWYgKG1vZGFsRG9tRTEgJiYgbW9kYWxEb21FMS5sZW5ndGgpIHtcclxuICAgICAgICAgICAgdmFyIGVsZW1lbnRzID0gbW9kYWxEb21FMVswXS5xdWVyeVNlbGVjdG9yQWxsKHRhYmJhYmxlU2VsZWN0b3IpO1xyXG4gICAgICAgICAgICByZXR1cm4gZWxlbWVudHMgP1xyXG4gICAgICAgICAgICAgIEFycmF5LnByb3RvdHlwZS5maWx0ZXIuY2FsbChlbGVtZW50cywgZnVuY3Rpb24oZWxlbWVudCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGlzVmlzaWJsZShlbGVtZW50KTtcclxuICAgICAgICAgICAgICB9KSA6IGVsZW1lbnRzO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfTtcclxuXHJcbiAgICAgIHJldHVybiAkbW9kYWxTdGFjaztcclxuICAgIH1dKVxyXG5cclxuICAucHJvdmlkZXIoJyR1aWJNb2RhbCcsIGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyICRtb2RhbFByb3ZpZGVyID0ge1xyXG4gICAgICBvcHRpb25zOiB7XHJcbiAgICAgICAgYW5pbWF0aW9uOiB0cnVlLFxyXG4gICAgICAgIGJhY2tkcm9wOiB0cnVlLCAvL2NhbiBhbHNvIGJlIGZhbHNlIG9yICdzdGF0aWMnXHJcbiAgICAgICAga2V5Ym9hcmQ6IHRydWVcclxuICAgICAgfSxcclxuICAgICAgJGdldDogWyckcm9vdFNjb3BlJywgJyRxJywgJyRkb2N1bWVudCcsICckdGVtcGxhdGVSZXF1ZXN0JywgJyRjb250cm9sbGVyJywgJyR1aWJSZXNvbHZlJywgJyR1aWJNb2RhbFN0YWNrJyxcclxuICAgICAgICBmdW5jdGlvbiAoJHJvb3RTY29wZSwgJHEsICRkb2N1bWVudCwgJHRlbXBsYXRlUmVxdWVzdCwgJGNvbnRyb2xsZXIsICR1aWJSZXNvbHZlLCAkbW9kYWxTdGFjaykge1xyXG4gICAgICAgICAgdmFyICRtb2RhbCA9IHt9O1xyXG5cclxuICAgICAgICAgIGZ1bmN0aW9uIGdldFRlbXBsYXRlUHJvbWlzZShvcHRpb25zKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBvcHRpb25zLnRlbXBsYXRlID8gJHEud2hlbihvcHRpb25zLnRlbXBsYXRlKSA6XHJcbiAgICAgICAgICAgICAgJHRlbXBsYXRlUmVxdWVzdChhbmd1bGFyLmlzRnVuY3Rpb24ob3B0aW9ucy50ZW1wbGF0ZVVybCkgP1xyXG4gICAgICAgICAgICAgICAgb3B0aW9ucy50ZW1wbGF0ZVVybCgpIDogb3B0aW9ucy50ZW1wbGF0ZVVybCk7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgdmFyIHByb21pc2VDaGFpbiA9IG51bGw7XHJcbiAgICAgICAgICAkbW9kYWwuZ2V0UHJvbWlzZUNoYWluID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBwcm9taXNlQ2hhaW47XHJcbiAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICRtb2RhbC5vcGVuID0gZnVuY3Rpb24obW9kYWxPcHRpb25zKSB7XHJcbiAgICAgICAgICAgIHZhciBtb2RhbFJlc3VsdERlZmVycmVkID0gJHEuZGVmZXIoKTtcclxuICAgICAgICAgICAgdmFyIG1vZGFsT3BlbmVkRGVmZXJyZWQgPSAkcS5kZWZlcigpO1xyXG4gICAgICAgICAgICB2YXIgbW9kYWxDbG9zZWREZWZlcnJlZCA9ICRxLmRlZmVyKCk7XHJcbiAgICAgICAgICAgIHZhciBtb2RhbFJlbmRlckRlZmVycmVkID0gJHEuZGVmZXIoKTtcclxuXHJcbiAgICAgICAgICAgIC8vcHJlcGFyZSBhbiBpbnN0YW5jZSBvZiBhIG1vZGFsIHRvIGJlIGluamVjdGVkIGludG8gY29udHJvbGxlcnMgYW5kIHJldHVybmVkIHRvIGEgY2FsbGVyXHJcbiAgICAgICAgICAgIHZhciBtb2RhbEluc3RhbmNlID0ge1xyXG4gICAgICAgICAgICAgIHJlc3VsdDogbW9kYWxSZXN1bHREZWZlcnJlZC5wcm9taXNlLFxyXG4gICAgICAgICAgICAgIG9wZW5lZDogbW9kYWxPcGVuZWREZWZlcnJlZC5wcm9taXNlLFxyXG4gICAgICAgICAgICAgIGNsb3NlZDogbW9kYWxDbG9zZWREZWZlcnJlZC5wcm9taXNlLFxyXG4gICAgICAgICAgICAgIHJlbmRlcmVkOiBtb2RhbFJlbmRlckRlZmVycmVkLnByb21pc2UsXHJcbiAgICAgICAgICAgICAgY2xvc2U6IGZ1bmN0aW9uIChyZXN1bHQpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAkbW9kYWxTdGFjay5jbG9zZShtb2RhbEluc3RhbmNlLCByZXN1bHQpO1xyXG4gICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgZGlzbWlzczogZnVuY3Rpb24gKHJlYXNvbikge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuICRtb2RhbFN0YWNrLmRpc21pc3MobW9kYWxJbnN0YW5jZSwgcmVhc29uKTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAvL21lcmdlIGFuZCBjbGVhbiB1cCBvcHRpb25zXHJcbiAgICAgICAgICAgIG1vZGFsT3B0aW9ucyA9IGFuZ3VsYXIuZXh0ZW5kKHt9LCAkbW9kYWxQcm92aWRlci5vcHRpb25zLCBtb2RhbE9wdGlvbnMpO1xyXG4gICAgICAgICAgICBtb2RhbE9wdGlvbnMucmVzb2x2ZSA9IG1vZGFsT3B0aW9ucy5yZXNvbHZlIHx8IHt9O1xyXG4gICAgICAgICAgICBtb2RhbE9wdGlvbnMuYXBwZW5kVG8gPSBtb2RhbE9wdGlvbnMuYXBwZW5kVG8gfHwgJGRvY3VtZW50LmZpbmQoJ2JvZHknKS5lcSgwKTtcclxuXHJcbiAgICAgICAgICAgIC8vdmVyaWZ5IG9wdGlvbnNcclxuICAgICAgICAgICAgaWYgKCFtb2RhbE9wdGlvbnMuY29tcG9uZW50ICYmICFtb2RhbE9wdGlvbnMudGVtcGxhdGUgJiYgIW1vZGFsT3B0aW9ucy50ZW1wbGF0ZVVybCkge1xyXG4gICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignT25lIG9mIGNvbXBvbmVudCBvciB0ZW1wbGF0ZSBvciB0ZW1wbGF0ZVVybCBvcHRpb25zIGlzIHJlcXVpcmVkLicpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB2YXIgdGVtcGxhdGVBbmRSZXNvbHZlUHJvbWlzZTtcclxuICAgICAgICAgICAgaWYgKG1vZGFsT3B0aW9ucy5jb21wb25lbnQpIHtcclxuICAgICAgICAgICAgICB0ZW1wbGF0ZUFuZFJlc29sdmVQcm9taXNlID0gJHEud2hlbigkdWliUmVzb2x2ZS5yZXNvbHZlKG1vZGFsT3B0aW9ucy5yZXNvbHZlLCB7fSwgbnVsbCwgbnVsbCkpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIHRlbXBsYXRlQW5kUmVzb2x2ZVByb21pc2UgPVxyXG4gICAgICAgICAgICAgICAgJHEuYWxsKFtnZXRUZW1wbGF0ZVByb21pc2UobW9kYWxPcHRpb25zKSwgJHVpYlJlc29sdmUucmVzb2x2ZShtb2RhbE9wdGlvbnMucmVzb2x2ZSwge30sIG51bGwsIG51bGwpXSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIHJlc29sdmVXaXRoVGVtcGxhdGUoKSB7XHJcbiAgICAgICAgICAgICAgcmV0dXJuIHRlbXBsYXRlQW5kUmVzb2x2ZVByb21pc2U7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIFdhaXQgZm9yIHRoZSByZXNvbHV0aW9uIG9mIHRoZSBleGlzdGluZyBwcm9taXNlIGNoYWluLlxyXG4gICAgICAgICAgICAvLyBUaGVuIHN3aXRjaCB0byBvdXIgb3duIGNvbWJpbmVkIHByb21pc2UgZGVwZW5kZW5jeSAocmVnYXJkbGVzcyBvZiBob3cgdGhlIHByZXZpb3VzIG1vZGFsIGZhcmVkKS5cclxuICAgICAgICAgICAgLy8gVGhlbiBhZGQgdG8gJG1vZGFsU3RhY2sgYW5kIHJlc29sdmUgb3BlbmVkLlxyXG4gICAgICAgICAgICAvLyBGaW5hbGx5IGNsZWFuIHVwIHRoZSBjaGFpbiB2YXJpYWJsZSBpZiBubyBzdWJzZXF1ZW50IG1vZGFsIGhhcyBvdmVyd3JpdHRlbiBpdC5cclxuICAgICAgICAgICAgdmFyIHNhbWVQcm9taXNlO1xyXG4gICAgICAgICAgICBzYW1lUHJvbWlzZSA9IHByb21pc2VDaGFpbiA9ICRxLmFsbChbcHJvbWlzZUNoYWluXSlcclxuICAgICAgICAgICAgICAudGhlbihyZXNvbHZlV2l0aFRlbXBsYXRlLCByZXNvbHZlV2l0aFRlbXBsYXRlKVxyXG4gICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIHJlc29sdmVTdWNjZXNzKHRwbEFuZFZhcnMpIHtcclxuICAgICAgICAgICAgICAgIHZhciBwcm92aWRlZFNjb3BlID0gbW9kYWxPcHRpb25zLnNjb3BlIHx8ICRyb290U2NvcGU7XHJcblxyXG4gICAgICAgICAgICAgICAgdmFyIG1vZGFsU2NvcGUgPSBwcm92aWRlZFNjb3BlLiRuZXcoKTtcclxuICAgICAgICAgICAgICAgIG1vZGFsU2NvcGUuJGNsb3NlID0gbW9kYWxJbnN0YW5jZS5jbG9zZTtcclxuICAgICAgICAgICAgICAgIG1vZGFsU2NvcGUuJGRpc21pc3MgPSBtb2RhbEluc3RhbmNlLmRpc21pc3M7XHJcblxyXG4gICAgICAgICAgICAgICAgbW9kYWxTY29wZS4kb24oJyRkZXN0cm95JywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgIGlmICghbW9kYWxTY29wZS4kJHVpYkRlc3RydWN0aW9uU2NoZWR1bGVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbW9kYWxTY29wZS4kZGlzbWlzcygnJHVpYlVuc2NoZWR1bGVkRGVzdHJ1Y3Rpb24nKTtcclxuICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgdmFyIG1vZGFsID0ge1xyXG4gICAgICAgICAgICAgICAgICBzY29wZTogbW9kYWxTY29wZSxcclxuICAgICAgICAgICAgICAgICAgZGVmZXJyZWQ6IG1vZGFsUmVzdWx0RGVmZXJyZWQsXHJcbiAgICAgICAgICAgICAgICAgIHJlbmRlckRlZmVycmVkOiBtb2RhbFJlbmRlckRlZmVycmVkLFxyXG4gICAgICAgICAgICAgICAgICBjbG9zZWREZWZlcnJlZDogbW9kYWxDbG9zZWREZWZlcnJlZCxcclxuICAgICAgICAgICAgICAgICAgYW5pbWF0aW9uOiBtb2RhbE9wdGlvbnMuYW5pbWF0aW9uLFxyXG4gICAgICAgICAgICAgICAgICBiYWNrZHJvcDogbW9kYWxPcHRpb25zLmJhY2tkcm9wLFxyXG4gICAgICAgICAgICAgICAgICBrZXlib2FyZDogbW9kYWxPcHRpb25zLmtleWJvYXJkLFxyXG4gICAgICAgICAgICAgICAgICBiYWNrZHJvcENsYXNzOiBtb2RhbE9wdGlvbnMuYmFja2Ryb3BDbGFzcyxcclxuICAgICAgICAgICAgICAgICAgd2luZG93VG9wQ2xhc3M6IG1vZGFsT3B0aW9ucy53aW5kb3dUb3BDbGFzcyxcclxuICAgICAgICAgICAgICAgICAgd2luZG93Q2xhc3M6IG1vZGFsT3B0aW9ucy53aW5kb3dDbGFzcyxcclxuICAgICAgICAgICAgICAgICAgd2luZG93VGVtcGxhdGVVcmw6IG1vZGFsT3B0aW9ucy53aW5kb3dUZW1wbGF0ZVVybCxcclxuICAgICAgICAgICAgICAgICAgYXJpYUxhYmVsbGVkQnk6IG1vZGFsT3B0aW9ucy5hcmlhTGFiZWxsZWRCeSxcclxuICAgICAgICAgICAgICAgICAgYXJpYURlc2NyaWJlZEJ5OiBtb2RhbE9wdGlvbnMuYXJpYURlc2NyaWJlZEJ5LFxyXG4gICAgICAgICAgICAgICAgICBzaXplOiBtb2RhbE9wdGlvbnMuc2l6ZSxcclxuICAgICAgICAgICAgICAgICAgb3BlbmVkQ2xhc3M6IG1vZGFsT3B0aW9ucy5vcGVuZWRDbGFzcyxcclxuICAgICAgICAgICAgICAgICAgYXBwZW5kVG86IG1vZGFsT3B0aW9ucy5hcHBlbmRUb1xyXG4gICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICB2YXIgY29tcG9uZW50ID0ge307XHJcbiAgICAgICAgICAgICAgICB2YXIgY3RybEluc3RhbmNlLCBjdHJsSW5zdGFudGlhdGUsIGN0cmxMb2NhbHMgPSB7fTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAobW9kYWxPcHRpb25zLmNvbXBvbmVudCkge1xyXG4gICAgICAgICAgICAgICAgICBjb25zdHJ1Y3RMb2NhbHMoY29tcG9uZW50LCBmYWxzZSwgdHJ1ZSwgZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgICBjb21wb25lbnQubmFtZSA9IG1vZGFsT3B0aW9ucy5jb21wb25lbnQ7XHJcbiAgICAgICAgICAgICAgICAgIG1vZGFsLmNvbXBvbmVudCA9IGNvbXBvbmVudDtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAobW9kYWxPcHRpb25zLmNvbnRyb2xsZXIpIHtcclxuICAgICAgICAgICAgICAgICAgY29uc3RydWN0TG9jYWxzKGN0cmxMb2NhbHMsIHRydWUsIGZhbHNlLCB0cnVlKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgIC8vIHRoZSB0aGlyZCBwYXJhbSB3aWxsIG1ha2UgdGhlIGNvbnRyb2xsZXIgaW5zdGFudGlhdGUgbGF0ZXIscHJpdmF0ZSBhcGlcclxuICAgICAgICAgICAgICAgICAgLy8gQHNlZSBodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9hbmd1bGFyLmpzL2Jsb2IvbWFzdGVyL3NyYy9uZy9jb250cm9sbGVyLmpzI0wxMjZcclxuICAgICAgICAgICAgICAgICAgY3RybEluc3RhbnRpYXRlID0gJGNvbnRyb2xsZXIobW9kYWxPcHRpb25zLmNvbnRyb2xsZXIsIGN0cmxMb2NhbHMsIHRydWUsIG1vZGFsT3B0aW9ucy5jb250cm9sbGVyQXMpO1xyXG4gICAgICAgICAgICAgICAgICBpZiAobW9kYWxPcHRpb25zLmNvbnRyb2xsZXJBcyAmJiBtb2RhbE9wdGlvbnMuYmluZFRvQ29udHJvbGxlcikge1xyXG4gICAgICAgICAgICAgICAgICAgIGN0cmxJbnN0YW5jZSA9IGN0cmxJbnN0YW50aWF0ZS5pbnN0YW5jZTtcclxuICAgICAgICAgICAgICAgICAgICBjdHJsSW5zdGFuY2UuJGNsb3NlID0gbW9kYWxTY29wZS4kY2xvc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgY3RybEluc3RhbmNlLiRkaXNtaXNzID0gbW9kYWxTY29wZS4kZGlzbWlzcztcclxuICAgICAgICAgICAgICAgICAgICBhbmd1bGFyLmV4dGVuZChjdHJsSW5zdGFuY2UsIHtcclxuICAgICAgICAgICAgICAgICAgICAgICRyZXNvbHZlOiBjdHJsTG9jYWxzLiRzY29wZS4kcmVzb2x2ZVxyXG4gICAgICAgICAgICAgICAgICAgIH0sIHByb3ZpZGVkU2NvcGUpO1xyXG4gICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICBjdHJsSW5zdGFuY2UgPSBjdHJsSW5zdGFudGlhdGUoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgIGlmIChhbmd1bGFyLmlzRnVuY3Rpb24oY3RybEluc3RhbmNlLiRvbkluaXQpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY3RybEluc3RhbmNlLiRvbkluaXQoKTtcclxuICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGlmICghbW9kYWxPcHRpb25zLmNvbXBvbmVudCkge1xyXG4gICAgICAgICAgICAgICAgICBtb2RhbC5jb250ZW50ID0gdHBsQW5kVmFyc1swXTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAkbW9kYWxTdGFjay5vcGVuKG1vZGFsSW5zdGFuY2UsIG1vZGFsKTtcclxuICAgICAgICAgICAgICAgIG1vZGFsT3BlbmVkRGVmZXJyZWQucmVzb2x2ZSh0cnVlKTtcclxuXHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBjb25zdHJ1Y3RMb2NhbHMob2JqLCB0ZW1wbGF0ZSwgaW5zdGFuY2VPblNjb3BlLCBpbmplY3RhYmxlKSB7XHJcbiAgICAgICAgICAgICAgICAgIG9iai4kc2NvcGUgPSBtb2RhbFNjb3BlO1xyXG4gICAgICAgICAgICAgICAgICBvYmouJHNjb3BlLiRyZXNvbHZlID0ge307XHJcbiAgICAgICAgICAgICAgICAgIGlmIChpbnN0YW5jZU9uU2NvcGUpIHtcclxuICAgICAgICAgICAgICAgICAgICBvYmouJHNjb3BlLiR1aWJNb2RhbEluc3RhbmNlID0gbW9kYWxJbnN0YW5jZTtcclxuICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBvYmouJHVpYk1vZGFsSW5zdGFuY2UgPSBtb2RhbEluc3RhbmNlO1xyXG4gICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICB2YXIgcmVzb2x2ZXMgPSB0ZW1wbGF0ZSA/IHRwbEFuZFZhcnNbMV0gOiB0cGxBbmRWYXJzO1xyXG4gICAgICAgICAgICAgICAgICBhbmd1bGFyLmZvckVhY2gocmVzb2x2ZXMsIGZ1bmN0aW9uKHZhbHVlLCBrZXkpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoaW5qZWN0YWJsZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgb2JqW2tleV0gPSB2YWx1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIG9iai4kc2NvcGUuJHJlc29sdmVba2V5XSA9IHZhbHVlO1xyXG4gICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSwgZnVuY3Rpb24gcmVzb2x2ZUVycm9yKHJlYXNvbikge1xyXG4gICAgICAgICAgICAgIG1vZGFsT3BlbmVkRGVmZXJyZWQucmVqZWN0KHJlYXNvbik7XHJcbiAgICAgICAgICAgICAgbW9kYWxSZXN1bHREZWZlcnJlZC5yZWplY3QocmVhc29uKTtcclxuICAgICAgICAgICAgfSlbJ2ZpbmFsbHknXShmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICBpZiAocHJvbWlzZUNoYWluID09PSBzYW1lUHJvbWlzZSkge1xyXG4gICAgICAgICAgICAgICAgcHJvbWlzZUNoYWluID0gbnVsbDtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIG1vZGFsSW5zdGFuY2U7XHJcbiAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgIHJldHVybiAkbW9kYWw7XHJcbiAgICAgICAgfVxyXG4gICAgICBdXHJcbiAgICB9O1xyXG5cclxuICAgIHJldHVybiAkbW9kYWxQcm92aWRlcjtcclxuICB9KTtcclxuXHJcbmFuZ3VsYXIubW9kdWxlKCd1aS5ib290c3RyYXAucGFnaW5nJywgW10pXHJcbi8qKlxyXG4gKiBIZWxwZXIgaW50ZXJuYWwgc2VydmljZSBmb3IgZ2VuZXJhdGluZyBjb21tb24gY29udHJvbGxlciBjb2RlIGJldHdlZW4gdGhlXHJcbiAqIHBhZ2VyIGFuZCBwYWdpbmF0aW9uIGNvbXBvbmVudHNcclxuICovXHJcbi5mYWN0b3J5KCd1aWJQYWdpbmcnLCBbJyRwYXJzZScsIGZ1bmN0aW9uKCRwYXJzZSkge1xyXG4gIHJldHVybiB7XHJcbiAgICBjcmVhdGU6IGZ1bmN0aW9uKGN0cmwsICRzY29wZSwgJGF0dHJzKSB7XHJcbiAgICAgIGN0cmwuc2V0TnVtUGFnZXMgPSAkYXR0cnMubnVtUGFnZXMgPyAkcGFyc2UoJGF0dHJzLm51bVBhZ2VzKS5hc3NpZ24gOiBhbmd1bGFyLm5vb3A7XHJcbiAgICAgIGN0cmwubmdNb2RlbEN0cmwgPSB7ICRzZXRWaWV3VmFsdWU6IGFuZ3VsYXIubm9vcCB9OyAvLyBudWxsTW9kZWxDdHJsXHJcbiAgICAgIGN0cmwuX3dhdGNoZXJzID0gW107XHJcblxyXG4gICAgICBjdHJsLmluaXQgPSBmdW5jdGlvbihuZ01vZGVsQ3RybCwgY29uZmlnKSB7XHJcbiAgICAgICAgY3RybC5uZ01vZGVsQ3RybCA9IG5nTW9kZWxDdHJsO1xyXG4gICAgICAgIGN0cmwuY29uZmlnID0gY29uZmlnO1xyXG5cclxuICAgICAgICBuZ01vZGVsQ3RybC4kcmVuZGVyID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICBjdHJsLnJlbmRlcigpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGlmICgkYXR0cnMuaXRlbXNQZXJQYWdlKSB7XHJcbiAgICAgICAgICBjdHJsLl93YXRjaGVycy5wdXNoKCRzY29wZS4kcGFyZW50LiR3YXRjaCgkYXR0cnMuaXRlbXNQZXJQYWdlLCBmdW5jdGlvbih2YWx1ZSkge1xyXG4gICAgICAgICAgICBjdHJsLml0ZW1zUGVyUGFnZSA9IHBhcnNlSW50KHZhbHVlLCAxMCk7XHJcbiAgICAgICAgICAgICRzY29wZS50b3RhbFBhZ2VzID0gY3RybC5jYWxjdWxhdGVUb3RhbFBhZ2VzKCk7XHJcbiAgICAgICAgICAgIGN0cmwudXBkYXRlUGFnZSgpO1xyXG4gICAgICAgICAgfSkpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBjdHJsLml0ZW1zUGVyUGFnZSA9IGNvbmZpZy5pdGVtc1BlclBhZ2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAkc2NvcGUuJHdhdGNoKCd0b3RhbEl0ZW1zJywgZnVuY3Rpb24obmV3VG90YWwsIG9sZFRvdGFsKSB7XHJcbiAgICAgICAgICBpZiAoYW5ndWxhci5pc0RlZmluZWQobmV3VG90YWwpIHx8IG5ld1RvdGFsICE9PSBvbGRUb3RhbCkge1xyXG4gICAgICAgICAgICAkc2NvcGUudG90YWxQYWdlcyA9IGN0cmwuY2FsY3VsYXRlVG90YWxQYWdlcygpO1xyXG4gICAgICAgICAgICBjdHJsLnVwZGF0ZVBhZ2UoKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgfTtcclxuXHJcbiAgICAgIGN0cmwuY2FsY3VsYXRlVG90YWxQYWdlcyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciB0b3RhbFBhZ2VzID0gY3RybC5pdGVtc1BlclBhZ2UgPCAxID8gMSA6IE1hdGguY2VpbCgkc2NvcGUudG90YWxJdGVtcyAvIGN0cmwuaXRlbXNQZXJQYWdlKTtcclxuICAgICAgICByZXR1cm4gTWF0aC5tYXgodG90YWxQYWdlcyB8fCAwLCAxKTtcclxuICAgICAgfTtcclxuXHJcbiAgICAgIGN0cmwucmVuZGVyID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgJHNjb3BlLnBhZ2UgPSBwYXJzZUludChjdHJsLm5nTW9kZWxDdHJsLiR2aWV3VmFsdWUsIDEwKSB8fCAxO1xyXG4gICAgICB9O1xyXG5cclxuICAgICAgJHNjb3BlLnNlbGVjdFBhZ2UgPSBmdW5jdGlvbihwYWdlLCBldnQpIHtcclxuICAgICAgICBpZiAoZXZ0KSB7XHJcbiAgICAgICAgICBldnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhciBjbGlja0FsbG93ZWQgPSAhJHNjb3BlLm5nRGlzYWJsZWQgfHwgIWV2dDtcclxuICAgICAgICBpZiAoY2xpY2tBbGxvd2VkICYmICRzY29wZS5wYWdlICE9PSBwYWdlICYmIHBhZ2UgPiAwICYmIHBhZ2UgPD0gJHNjb3BlLnRvdGFsUGFnZXMpIHtcclxuICAgICAgICAgIGlmIChldnQgJiYgZXZ0LnRhcmdldCkge1xyXG4gICAgICAgICAgICBldnQudGFyZ2V0LmJsdXIoKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGN0cmwubmdNb2RlbEN0cmwuJHNldFZpZXdWYWx1ZShwYWdlKTtcclxuICAgICAgICAgIGN0cmwubmdNb2RlbEN0cmwuJHJlbmRlcigpO1xyXG4gICAgICAgIH1cclxuICAgICAgfTtcclxuXHJcbiAgICAgICRzY29wZS5nZXRUZXh0ID0gZnVuY3Rpb24oa2V5KSB7XHJcbiAgICAgICAgcmV0dXJuICRzY29wZVtrZXkgKyAnVGV4dCddIHx8IGN0cmwuY29uZmlnW2tleSArICdUZXh0J107XHJcbiAgICAgIH07XHJcblxyXG4gICAgICAkc2NvcGUubm9QcmV2aW91cyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiAkc2NvcGUucGFnZSA9PT0gMTtcclxuICAgICAgfTtcclxuXHJcbiAgICAgICRzY29wZS5ub05leHQgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICByZXR1cm4gJHNjb3BlLnBhZ2UgPT09ICRzY29wZS50b3RhbFBhZ2VzO1xyXG4gICAgICB9O1xyXG5cclxuICAgICAgY3RybC51cGRhdGVQYWdlID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgY3RybC5zZXROdW1QYWdlcygkc2NvcGUuJHBhcmVudCwgJHNjb3BlLnRvdGFsUGFnZXMpOyAvLyBSZWFkb25seSB2YXJpYWJsZVxyXG5cclxuICAgICAgICBpZiAoJHNjb3BlLnBhZ2UgPiAkc2NvcGUudG90YWxQYWdlcykge1xyXG4gICAgICAgICAgJHNjb3BlLnNlbGVjdFBhZ2UoJHNjb3BlLnRvdGFsUGFnZXMpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBjdHJsLm5nTW9kZWxDdHJsLiRyZW5kZXIoKTtcclxuICAgICAgICB9XHJcbiAgICAgIH07XHJcblxyXG4gICAgICAkc2NvcGUuJG9uKCckZGVzdHJveScsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHdoaWxlIChjdHJsLl93YXRjaGVycy5sZW5ndGgpIHtcclxuICAgICAgICAgIGN0cmwuX3dhdGNoZXJzLnNoaWZ0KCkoKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH07XHJcbn1dKTtcclxuXHJcbmFuZ3VsYXIubW9kdWxlKCd1aS5ib290c3RyYXAucGFnZXInLCBbJ3VpLmJvb3RzdHJhcC5wYWdpbmcnLCAndWkuYm9vdHN0cmFwLnRhYmluZGV4J10pXHJcblxyXG4uY29udHJvbGxlcignVWliUGFnZXJDb250cm9sbGVyJywgWyckc2NvcGUnLCAnJGF0dHJzJywgJ3VpYlBhZ2luZycsICd1aWJQYWdlckNvbmZpZycsIGZ1bmN0aW9uKCRzY29wZSwgJGF0dHJzLCB1aWJQYWdpbmcsIHVpYlBhZ2VyQ29uZmlnKSB7XHJcbiAgJHNjb3BlLmFsaWduID0gYW5ndWxhci5pc0RlZmluZWQoJGF0dHJzLmFsaWduKSA/ICRzY29wZS4kcGFyZW50LiRldmFsKCRhdHRycy5hbGlnbikgOiB1aWJQYWdlckNvbmZpZy5hbGlnbjtcclxuXHJcbiAgdWliUGFnaW5nLmNyZWF0ZSh0aGlzLCAkc2NvcGUsICRhdHRycyk7XHJcbn1dKVxyXG5cclxuLmNvbnN0YW50KCd1aWJQYWdlckNvbmZpZycsIHtcclxuICBpdGVtc1BlclBhZ2U6IDEwLFxyXG4gIHByZXZpb3VzVGV4dDogJ8KrIFByZXZpb3VzJyxcclxuICBuZXh0VGV4dDogJ05leHQgwrsnLFxyXG4gIGFsaWduOiB0cnVlXHJcbn0pXHJcblxyXG4uZGlyZWN0aXZlKCd1aWJQYWdlcicsIFsndWliUGFnZXJDb25maWcnLCBmdW5jdGlvbih1aWJQYWdlckNvbmZpZykge1xyXG4gIHJldHVybiB7XHJcbiAgICBzY29wZToge1xyXG4gICAgICB0b3RhbEl0ZW1zOiAnPScsXHJcbiAgICAgIHByZXZpb3VzVGV4dDogJ0AnLFxyXG4gICAgICBuZXh0VGV4dDogJ0AnLFxyXG4gICAgICBuZ0Rpc2FibGVkOiAnPSdcclxuICAgIH0sXHJcbiAgICByZXF1aXJlOiBbJ3VpYlBhZ2VyJywgJz9uZ01vZGVsJ10sXHJcbiAgICByZXN0cmljdDogJ0EnLFxyXG4gICAgY29udHJvbGxlcjogJ1VpYlBhZ2VyQ29udHJvbGxlcicsXHJcbiAgICBjb250cm9sbGVyQXM6ICdwYWdlcicsXHJcbiAgICB0ZW1wbGF0ZVVybDogZnVuY3Rpb24oZWxlbWVudCwgYXR0cnMpIHtcclxuICAgICAgcmV0dXJuIGF0dHJzLnRlbXBsYXRlVXJsIHx8ICd1aWIvdGVtcGxhdGUvcGFnZXIvcGFnZXIuaHRtbCc7XHJcbiAgICB9LFxyXG4gICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCBjdHJscykge1xyXG4gICAgICBlbGVtZW50LmFkZENsYXNzKCdwYWdlcicpO1xyXG4gICAgICB2YXIgcGFnaW5hdGlvbkN0cmwgPSBjdHJsc1swXSwgbmdNb2RlbEN0cmwgPSBjdHJsc1sxXTtcclxuXHJcbiAgICAgIGlmICghbmdNb2RlbEN0cmwpIHtcclxuICAgICAgICByZXR1cm47IC8vIGRvIG5vdGhpbmcgaWYgbm8gbmctbW9kZWxcclxuICAgICAgfVxyXG5cclxuICAgICAgcGFnaW5hdGlvbkN0cmwuaW5pdChuZ01vZGVsQ3RybCwgdWliUGFnZXJDb25maWcpO1xyXG4gICAgfVxyXG4gIH07XHJcbn1dKTtcclxuXHJcbmFuZ3VsYXIubW9kdWxlKCd1aS5ib290c3RyYXAucGFnaW5hdGlvbicsIFsndWkuYm9vdHN0cmFwLnBhZ2luZycsICd1aS5ib290c3RyYXAudGFiaW5kZXgnXSlcclxuLmNvbnRyb2xsZXIoJ1VpYlBhZ2luYXRpb25Db250cm9sbGVyJywgWyckc2NvcGUnLCAnJGF0dHJzJywgJyRwYXJzZScsICd1aWJQYWdpbmcnLCAndWliUGFnaW5hdGlvbkNvbmZpZycsIGZ1bmN0aW9uKCRzY29wZSwgJGF0dHJzLCAkcGFyc2UsIHVpYlBhZ2luZywgdWliUGFnaW5hdGlvbkNvbmZpZykge1xyXG4gIHZhciBjdHJsID0gdGhpcztcclxuICAvLyBTZXR1cCBjb25maWd1cmF0aW9uIHBhcmFtZXRlcnNcclxuICB2YXIgbWF4U2l6ZSA9IGFuZ3VsYXIuaXNEZWZpbmVkKCRhdHRycy5tYXhTaXplKSA/ICRzY29wZS4kcGFyZW50LiRldmFsKCRhdHRycy5tYXhTaXplKSA6IHVpYlBhZ2luYXRpb25Db25maWcubWF4U2l6ZSxcclxuICAgIHJvdGF0ZSA9IGFuZ3VsYXIuaXNEZWZpbmVkKCRhdHRycy5yb3RhdGUpID8gJHNjb3BlLiRwYXJlbnQuJGV2YWwoJGF0dHJzLnJvdGF0ZSkgOiB1aWJQYWdpbmF0aW9uQ29uZmlnLnJvdGF0ZSxcclxuICAgIGZvcmNlRWxsaXBzZXMgPSBhbmd1bGFyLmlzRGVmaW5lZCgkYXR0cnMuZm9yY2VFbGxpcHNlcykgPyAkc2NvcGUuJHBhcmVudC4kZXZhbCgkYXR0cnMuZm9yY2VFbGxpcHNlcykgOiB1aWJQYWdpbmF0aW9uQ29uZmlnLmZvcmNlRWxsaXBzZXMsXHJcbiAgICBib3VuZGFyeUxpbmtOdW1iZXJzID0gYW5ndWxhci5pc0RlZmluZWQoJGF0dHJzLmJvdW5kYXJ5TGlua051bWJlcnMpID8gJHNjb3BlLiRwYXJlbnQuJGV2YWwoJGF0dHJzLmJvdW5kYXJ5TGlua051bWJlcnMpIDogdWliUGFnaW5hdGlvbkNvbmZpZy5ib3VuZGFyeUxpbmtOdW1iZXJzLFxyXG4gICAgcGFnZUxhYmVsID0gYW5ndWxhci5pc0RlZmluZWQoJGF0dHJzLnBhZ2VMYWJlbCkgPyBmdW5jdGlvbihpZHgpIHsgcmV0dXJuICRzY29wZS4kcGFyZW50LiRldmFsKCRhdHRycy5wYWdlTGFiZWwsIHskcGFnZTogaWR4fSk7IH0gOiBhbmd1bGFyLmlkZW50aXR5O1xyXG4gICRzY29wZS5ib3VuZGFyeUxpbmtzID0gYW5ndWxhci5pc0RlZmluZWQoJGF0dHJzLmJvdW5kYXJ5TGlua3MpID8gJHNjb3BlLiRwYXJlbnQuJGV2YWwoJGF0dHJzLmJvdW5kYXJ5TGlua3MpIDogdWliUGFnaW5hdGlvbkNvbmZpZy5ib3VuZGFyeUxpbmtzO1xyXG4gICRzY29wZS5kaXJlY3Rpb25MaW5rcyA9IGFuZ3VsYXIuaXNEZWZpbmVkKCRhdHRycy5kaXJlY3Rpb25MaW5rcykgPyAkc2NvcGUuJHBhcmVudC4kZXZhbCgkYXR0cnMuZGlyZWN0aW9uTGlua3MpIDogdWliUGFnaW5hdGlvbkNvbmZpZy5kaXJlY3Rpb25MaW5rcztcclxuXHJcbiAgdWliUGFnaW5nLmNyZWF0ZSh0aGlzLCAkc2NvcGUsICRhdHRycyk7XHJcblxyXG4gIGlmICgkYXR0cnMubWF4U2l6ZSkge1xyXG4gICAgY3RybC5fd2F0Y2hlcnMucHVzaCgkc2NvcGUuJHBhcmVudC4kd2F0Y2goJHBhcnNlKCRhdHRycy5tYXhTaXplKSwgZnVuY3Rpb24odmFsdWUpIHtcclxuICAgICAgbWF4U2l6ZSA9IHBhcnNlSW50KHZhbHVlLCAxMCk7XHJcbiAgICAgIGN0cmwucmVuZGVyKCk7XHJcbiAgICB9KSk7XHJcbiAgfVxyXG5cclxuICAvLyBDcmVhdGUgcGFnZSBvYmplY3QgdXNlZCBpbiB0ZW1wbGF0ZVxyXG4gIGZ1bmN0aW9uIG1ha2VQYWdlKG51bWJlciwgdGV4dCwgaXNBY3RpdmUpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIG51bWJlcjogbnVtYmVyLFxyXG4gICAgICB0ZXh0OiB0ZXh0LFxyXG4gICAgICBhY3RpdmU6IGlzQWN0aXZlXHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gZ2V0UGFnZXMoY3VycmVudFBhZ2UsIHRvdGFsUGFnZXMpIHtcclxuICAgIHZhciBwYWdlcyA9IFtdO1xyXG5cclxuICAgIC8vIERlZmF1bHQgcGFnZSBsaW1pdHNcclxuICAgIHZhciBzdGFydFBhZ2UgPSAxLCBlbmRQYWdlID0gdG90YWxQYWdlcztcclxuICAgIHZhciBpc01heFNpemVkID0gYW5ndWxhci5pc0RlZmluZWQobWF4U2l6ZSkgJiYgbWF4U2l6ZSA8IHRvdGFsUGFnZXM7XHJcblxyXG4gICAgLy8gcmVjb21wdXRlIGlmIG1heFNpemVcclxuICAgIGlmIChpc01heFNpemVkKSB7XHJcbiAgICAgIGlmIChyb3RhdGUpIHtcclxuICAgICAgICAvLyBDdXJyZW50IHBhZ2UgaXMgZGlzcGxheWVkIGluIHRoZSBtaWRkbGUgb2YgdGhlIHZpc2libGUgb25lc1xyXG4gICAgICAgIHN0YXJ0UGFnZSA9IE1hdGgubWF4KGN1cnJlbnRQYWdlIC0gTWF0aC5mbG9vcihtYXhTaXplIC8gMiksIDEpO1xyXG4gICAgICAgIGVuZFBhZ2UgPSBzdGFydFBhZ2UgKyBtYXhTaXplIC0gMTtcclxuXHJcbiAgICAgICAgLy8gQWRqdXN0IGlmIGxpbWl0IGlzIGV4Y2VlZGVkXHJcbiAgICAgICAgaWYgKGVuZFBhZ2UgPiB0b3RhbFBhZ2VzKSB7XHJcbiAgICAgICAgICBlbmRQYWdlID0gdG90YWxQYWdlcztcclxuICAgICAgICAgIHN0YXJ0UGFnZSA9IGVuZFBhZ2UgLSBtYXhTaXplICsgMTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgLy8gVmlzaWJsZSBwYWdlcyBhcmUgcGFnaW5hdGVkIHdpdGggbWF4U2l6ZVxyXG4gICAgICAgIHN0YXJ0UGFnZSA9IChNYXRoLmNlaWwoY3VycmVudFBhZ2UgLyBtYXhTaXplKSAtIDEpICogbWF4U2l6ZSArIDE7XHJcblxyXG4gICAgICAgIC8vIEFkanVzdCBsYXN0IHBhZ2UgaWYgbGltaXQgaXMgZXhjZWVkZWRcclxuICAgICAgICBlbmRQYWdlID0gTWF0aC5taW4oc3RhcnRQYWdlICsgbWF4U2l6ZSAtIDEsIHRvdGFsUGFnZXMpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQWRkIHBhZ2UgbnVtYmVyIGxpbmtzXHJcbiAgICBmb3IgKHZhciBudW1iZXIgPSBzdGFydFBhZ2U7IG51bWJlciA8PSBlbmRQYWdlOyBudW1iZXIrKykge1xyXG4gICAgICB2YXIgcGFnZSA9IG1ha2VQYWdlKG51bWJlciwgcGFnZUxhYmVsKG51bWJlciksIG51bWJlciA9PT0gY3VycmVudFBhZ2UpO1xyXG4gICAgICBwYWdlcy5wdXNoKHBhZ2UpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEFkZCBsaW5rcyB0byBtb3ZlIGJldHdlZW4gcGFnZSBzZXRzXHJcbiAgICBpZiAoaXNNYXhTaXplZCAmJiBtYXhTaXplID4gMCAmJiAoIXJvdGF0ZSB8fCBmb3JjZUVsbGlwc2VzIHx8IGJvdW5kYXJ5TGlua051bWJlcnMpKSB7XHJcbiAgICAgIGlmIChzdGFydFBhZ2UgPiAxKSB7XHJcbiAgICAgICAgaWYgKCFib3VuZGFyeUxpbmtOdW1iZXJzIHx8IHN0YXJ0UGFnZSA+IDMpIHsgLy9uZWVkIGVsbGlwc2lzIGZvciBhbGwgb3B0aW9ucyB1bmxlc3MgcmFuZ2UgaXMgdG9vIGNsb3NlIHRvIGJlZ2lubmluZ1xyXG4gICAgICAgIHZhciBwcmV2aW91c1BhZ2VTZXQgPSBtYWtlUGFnZShzdGFydFBhZ2UgLSAxLCAnLi4uJywgZmFsc2UpO1xyXG4gICAgICAgIHBhZ2VzLnVuc2hpZnQocHJldmlvdXNQYWdlU2V0KTtcclxuICAgICAgfVxyXG4gICAgICAgIGlmIChib3VuZGFyeUxpbmtOdW1iZXJzKSB7XHJcbiAgICAgICAgICBpZiAoc3RhcnRQYWdlID09PSAzKSB7IC8vbmVlZCB0byByZXBsYWNlIGVsbGlwc2lzIHdoZW4gdGhlIGJ1dHRvbnMgd291bGQgYmUgc2VxdWVudGlhbFxyXG4gICAgICAgICAgICB2YXIgc2Vjb25kUGFnZUxpbmsgPSBtYWtlUGFnZSgyLCAnMicsIGZhbHNlKTtcclxuICAgICAgICAgICAgcGFnZXMudW5zaGlmdChzZWNvbmRQYWdlTGluayk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICAvL2FkZCB0aGUgZmlyc3QgcGFnZVxyXG4gICAgICAgICAgdmFyIGZpcnN0UGFnZUxpbmsgPSBtYWtlUGFnZSgxLCAnMScsIGZhbHNlKTtcclxuICAgICAgICAgIHBhZ2VzLnVuc2hpZnQoZmlyc3RQYWdlTGluayk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoZW5kUGFnZSA8IHRvdGFsUGFnZXMpIHtcclxuICAgICAgICBpZiAoIWJvdW5kYXJ5TGlua051bWJlcnMgfHwgZW5kUGFnZSA8IHRvdGFsUGFnZXMgLSAyKSB7IC8vbmVlZCBlbGxpcHNpcyBmb3IgYWxsIG9wdGlvbnMgdW5sZXNzIHJhbmdlIGlzIHRvbyBjbG9zZSB0byBlbmRcclxuICAgICAgICB2YXIgbmV4dFBhZ2VTZXQgPSBtYWtlUGFnZShlbmRQYWdlICsgMSwgJy4uLicsIGZhbHNlKTtcclxuICAgICAgICBwYWdlcy5wdXNoKG5leHRQYWdlU2V0KTtcclxuICAgICAgfVxyXG4gICAgICAgIGlmIChib3VuZGFyeUxpbmtOdW1iZXJzKSB7XHJcbiAgICAgICAgICBpZiAoZW5kUGFnZSA9PT0gdG90YWxQYWdlcyAtIDIpIHsgLy9uZWVkIHRvIHJlcGxhY2UgZWxsaXBzaXMgd2hlbiB0aGUgYnV0dG9ucyB3b3VsZCBiZSBzZXF1ZW50aWFsXHJcbiAgICAgICAgICAgIHZhciBzZWNvbmRUb0xhc3RQYWdlTGluayA9IG1ha2VQYWdlKHRvdGFsUGFnZXMgLSAxLCB0b3RhbFBhZ2VzIC0gMSwgZmFsc2UpO1xyXG4gICAgICAgICAgICBwYWdlcy5wdXNoKHNlY29uZFRvTGFzdFBhZ2VMaW5rKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIC8vYWRkIHRoZSBsYXN0IHBhZ2VcclxuICAgICAgICAgIHZhciBsYXN0UGFnZUxpbmsgPSBtYWtlUGFnZSh0b3RhbFBhZ2VzLCB0b3RhbFBhZ2VzLCBmYWxzZSk7XHJcbiAgICAgICAgICBwYWdlcy5wdXNoKGxhc3RQYWdlTGluayk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcGFnZXM7XHJcbiAgfVxyXG5cclxuICB2YXIgb3JpZ2luYWxSZW5kZXIgPSB0aGlzLnJlbmRlcjtcclxuICB0aGlzLnJlbmRlciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgb3JpZ2luYWxSZW5kZXIoKTtcclxuICAgIGlmICgkc2NvcGUucGFnZSA+IDAgJiYgJHNjb3BlLnBhZ2UgPD0gJHNjb3BlLnRvdGFsUGFnZXMpIHtcclxuICAgICAgJHNjb3BlLnBhZ2VzID0gZ2V0UGFnZXMoJHNjb3BlLnBhZ2UsICRzY29wZS50b3RhbFBhZ2VzKTtcclxuICAgIH1cclxuICB9O1xyXG59XSlcclxuXHJcbi5jb25zdGFudCgndWliUGFnaW5hdGlvbkNvbmZpZycsIHtcclxuICBpdGVtc1BlclBhZ2U6IDEwLFxyXG4gIGJvdW5kYXJ5TGlua3M6IGZhbHNlLFxyXG4gIGJvdW5kYXJ5TGlua051bWJlcnM6IGZhbHNlLFxyXG4gIGRpcmVjdGlvbkxpbmtzOiB0cnVlLFxyXG4gIGZpcnN0VGV4dDogJ0ZpcnN0JyxcclxuICBwcmV2aW91c1RleHQ6ICdQcmV2aW91cycsXHJcbiAgbmV4dFRleHQ6ICdOZXh0JyxcclxuICBsYXN0VGV4dDogJ0xhc3QnLFxyXG4gIHJvdGF0ZTogdHJ1ZSxcclxuICBmb3JjZUVsbGlwc2VzOiBmYWxzZVxyXG59KVxyXG5cclxuLmRpcmVjdGl2ZSgndWliUGFnaW5hdGlvbicsIFsnJHBhcnNlJywgJ3VpYlBhZ2luYXRpb25Db25maWcnLCBmdW5jdGlvbigkcGFyc2UsIHVpYlBhZ2luYXRpb25Db25maWcpIHtcclxuICByZXR1cm4ge1xyXG4gICAgc2NvcGU6IHtcclxuICAgICAgdG90YWxJdGVtczogJz0nLFxyXG4gICAgICBmaXJzdFRleHQ6ICdAJyxcclxuICAgICAgcHJldmlvdXNUZXh0OiAnQCcsXHJcbiAgICAgIG5leHRUZXh0OiAnQCcsXHJcbiAgICAgIGxhc3RUZXh0OiAnQCcsXHJcbiAgICAgIG5nRGlzYWJsZWQ6Jz0nXHJcbiAgICB9LFxyXG4gICAgcmVxdWlyZTogWyd1aWJQYWdpbmF0aW9uJywgJz9uZ01vZGVsJ10sXHJcbiAgICByZXN0cmljdDogJ0EnLFxyXG4gICAgY29udHJvbGxlcjogJ1VpYlBhZ2luYXRpb25Db250cm9sbGVyJyxcclxuICAgIGNvbnRyb2xsZXJBczogJ3BhZ2luYXRpb24nLFxyXG4gICAgdGVtcGxhdGVVcmw6IGZ1bmN0aW9uKGVsZW1lbnQsIGF0dHJzKSB7XHJcbiAgICAgIHJldHVybiBhdHRycy50ZW1wbGF0ZVVybCB8fCAndWliL3RlbXBsYXRlL3BhZ2luYXRpb24vcGFnaW5hdGlvbi5odG1sJztcclxuICAgIH0sXHJcbiAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxlbWVudCwgYXR0cnMsIGN0cmxzKSB7XHJcbiAgICAgIGVsZW1lbnQuYWRkQ2xhc3MoJ3BhZ2luYXRpb24nKTtcclxuICAgICAgdmFyIHBhZ2luYXRpb25DdHJsID0gY3RybHNbMF0sIG5nTW9kZWxDdHJsID0gY3RybHNbMV07XHJcblxyXG4gICAgICBpZiAoIW5nTW9kZWxDdHJsKSB7XHJcbiAgICAgICAgIHJldHVybjsgLy8gZG8gbm90aGluZyBpZiBubyBuZy1tb2RlbFxyXG4gICAgICB9XHJcblxyXG4gICAgICBwYWdpbmF0aW9uQ3RybC5pbml0KG5nTW9kZWxDdHJsLCB1aWJQYWdpbmF0aW9uQ29uZmlnKTtcclxuICAgIH1cclxuICB9O1xyXG59XSk7XHJcblxyXG4vKipcclxuICogVGhlIGZvbGxvd2luZyBmZWF0dXJlcyBhcmUgc3RpbGwgb3V0c3RhbmRpbmc6IGFuaW1hdGlvbiBhcyBhXHJcbiAqIGZ1bmN0aW9uLCBwbGFjZW1lbnQgYXMgYSBmdW5jdGlvbiwgaW5zaWRlLCBzdXBwb3J0IGZvciBtb3JlIHRyaWdnZXJzIHRoYW5cclxuICoganVzdCBtb3VzZSBlbnRlci9sZWF2ZSwgaHRtbCB0b29sdGlwcywgYW5kIHNlbGVjdG9yIGRlbGVnYXRpb24uXHJcbiAqL1xyXG5hbmd1bGFyLm1vZHVsZSgndWkuYm9vdHN0cmFwLnRvb2x0aXAnLCBbJ3VpLmJvb3RzdHJhcC5wb3NpdGlvbicsICd1aS5ib290c3RyYXAuc3RhY2tlZE1hcCddKVxyXG5cclxuLyoqXHJcbiAqIFRoZSAkdG9vbHRpcCBzZXJ2aWNlIGNyZWF0ZXMgdG9vbHRpcC0gYW5kIHBvcG92ZXItbGlrZSBkaXJlY3RpdmVzIGFzIHdlbGwgYXNcclxuICogaG91c2VzIGdsb2JhbCBvcHRpb25zIGZvciB0aGVtLlxyXG4gKi9cclxuLnByb3ZpZGVyKCckdWliVG9vbHRpcCcsIGZ1bmN0aW9uKCkge1xyXG4gIC8vIFRoZSBkZWZhdWx0IG9wdGlvbnMgdG9vbHRpcCBhbmQgcG9wb3Zlci5cclxuICB2YXIgZGVmYXVsdE9wdGlvbnMgPSB7XHJcbiAgICBwbGFjZW1lbnQ6ICd0b3AnLFxyXG4gICAgcGxhY2VtZW50Q2xhc3NQcmVmaXg6ICcnLFxyXG4gICAgYW5pbWF0aW9uOiB0cnVlLFxyXG4gICAgcG9wdXBEZWxheTogMCxcclxuICAgIHBvcHVwQ2xvc2VEZWxheTogMCxcclxuICAgIHVzZUNvbnRlbnRFeHA6IGZhbHNlXHJcbiAgfTtcclxuXHJcbiAgLy8gRGVmYXVsdCBoaWRlIHRyaWdnZXJzIGZvciBlYWNoIHNob3cgdHJpZ2dlclxyXG4gIHZhciB0cmlnZ2VyTWFwID0ge1xyXG4gICAgJ21vdXNlZW50ZXInOiAnbW91c2VsZWF2ZScsXHJcbiAgICAnY2xpY2snOiAnY2xpY2snLFxyXG4gICAgJ291dHNpZGVDbGljayc6ICdvdXRzaWRlQ2xpY2snLFxyXG4gICAgJ2ZvY3VzJzogJ2JsdXInLFxyXG4gICAgJ25vbmUnOiAnJ1xyXG4gIH07XHJcblxyXG4gIC8vIFRoZSBvcHRpb25zIHNwZWNpZmllZCB0byB0aGUgcHJvdmlkZXIgZ2xvYmFsbHkuXHJcbiAgdmFyIGdsb2JhbE9wdGlvbnMgPSB7fTtcclxuXHJcbiAgLyoqXHJcbiAgICogYG9wdGlvbnMoe30pYCBhbGxvd3MgZ2xvYmFsIGNvbmZpZ3VyYXRpb24gb2YgYWxsIHRvb2x0aXBzIGluIHRoZVxyXG4gICAqIGFwcGxpY2F0aW9uLlxyXG4gICAqXHJcbiAgICogICB2YXIgYXBwID0gYW5ndWxhci5tb2R1bGUoICdBcHAnLCBbJ3VpLmJvb3RzdHJhcC50b29sdGlwJ10sIGZ1bmN0aW9uKCAkdG9vbHRpcFByb3ZpZGVyICkge1xyXG4gICAqICAgICAvLyBwbGFjZSB0b29sdGlwcyBsZWZ0IGluc3RlYWQgb2YgdG9wIGJ5IGRlZmF1bHRcclxuICAgKiAgICAgJHRvb2x0aXBQcm92aWRlci5vcHRpb25zKCB7IHBsYWNlbWVudDogJ2xlZnQnIH0gKTtcclxuICAgKiAgIH0pO1xyXG4gICAqL1xyXG5cdHRoaXMub3B0aW9ucyA9IGZ1bmN0aW9uKHZhbHVlKSB7XHJcblx0XHRhbmd1bGFyLmV4dGVuZChnbG9iYWxPcHRpb25zLCB2YWx1ZSk7XHJcblx0fTtcclxuXHJcbiAgLyoqXHJcbiAgICogVGhpcyBhbGxvd3MgeW91IHRvIGV4dGVuZCB0aGUgc2V0IG9mIHRyaWdnZXIgbWFwcGluZ3MgYXZhaWxhYmxlLiBFLmcuOlxyXG4gICAqXHJcbiAgICogICAkdG9vbHRpcFByb3ZpZGVyLnNldFRyaWdnZXJzKCB7ICdvcGVuVHJpZ2dlcic6ICdjbG9zZVRyaWdnZXInIH0gKTtcclxuICAgKi9cclxuICB0aGlzLnNldFRyaWdnZXJzID0gZnVuY3Rpb24gc2V0VHJpZ2dlcnModHJpZ2dlcnMpIHtcclxuICAgIGFuZ3VsYXIuZXh0ZW5kKHRyaWdnZXJNYXAsIHRyaWdnZXJzKTtcclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiBUaGlzIGlzIGEgaGVscGVyIGZ1bmN0aW9uIGZvciB0cmFuc2xhdGluZyBjYW1lbC1jYXNlIHRvIHNuYWtlX2Nhc2UuXHJcbiAgICovXHJcbiAgZnVuY3Rpb24gc25ha2VfY2FzZShuYW1lKSB7XHJcbiAgICB2YXIgcmVnZXhwID0gL1tBLVpdL2c7XHJcbiAgICB2YXIgc2VwYXJhdG9yID0gJy0nO1xyXG4gICAgcmV0dXJuIG5hbWUucmVwbGFjZShyZWdleHAsIGZ1bmN0aW9uKGxldHRlciwgcG9zKSB7XHJcbiAgICAgIHJldHVybiAocG9zID8gc2VwYXJhdG9yIDogJycpICsgbGV0dGVyLnRvTG93ZXJDYXNlKCk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIGFjdHVhbCBpbnN0YW5jZSBvZiB0aGUgJHRvb2x0aXAgc2VydmljZS5cclxuICAgKiBUT0RPIHN1cHBvcnQgbXVsdGlwbGUgdHJpZ2dlcnNcclxuICAgKi9cclxuICB0aGlzLiRnZXQgPSBbJyR3aW5kb3cnLCAnJGNvbXBpbGUnLCAnJHRpbWVvdXQnLCAnJGRvY3VtZW50JywgJyR1aWJQb3NpdGlvbicsICckaW50ZXJwb2xhdGUnLCAnJHJvb3RTY29wZScsICckcGFyc2UnLCAnJCRzdGFja2VkTWFwJywgZnVuY3Rpb24oJHdpbmRvdywgJGNvbXBpbGUsICR0aW1lb3V0LCAkZG9jdW1lbnQsICRwb3NpdGlvbiwgJGludGVycG9sYXRlLCAkcm9vdFNjb3BlLCAkcGFyc2UsICQkc3RhY2tlZE1hcCkge1xyXG4gICAgdmFyIG9wZW5lZFRvb2x0aXBzID0gJCRzdGFja2VkTWFwLmNyZWF0ZU5ldygpO1xyXG4gICAgJGRvY3VtZW50Lm9uKCdrZXl1cCcsIGtleXByZXNzTGlzdGVuZXIpO1xyXG5cclxuICAgICRyb290U2NvcGUuJG9uKCckZGVzdHJveScsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAkZG9jdW1lbnQub2ZmKCdrZXl1cCcsIGtleXByZXNzTGlzdGVuZXIpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgZnVuY3Rpb24ga2V5cHJlc3NMaXN0ZW5lcihlKSB7XHJcbiAgICAgIGlmIChlLndoaWNoID09PSAyNykge1xyXG4gICAgICAgIHZhciBsYXN0ID0gb3BlbmVkVG9vbHRpcHMudG9wKCk7XHJcbiAgICAgICAgaWYgKGxhc3QpIHtcclxuICAgICAgICAgIGxhc3QudmFsdWUuY2xvc2UoKTtcclxuICAgICAgICAgIGxhc3QgPSBudWxsO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBmdW5jdGlvbiAkdG9vbHRpcCh0dFR5cGUsIHByZWZpeCwgZGVmYXVsdFRyaWdnZXJTaG93LCBvcHRpb25zKSB7XHJcbiAgICAgIG9wdGlvbnMgPSBhbmd1bGFyLmV4dGVuZCh7fSwgZGVmYXVsdE9wdGlvbnMsIGdsb2JhbE9wdGlvbnMsIG9wdGlvbnMpO1xyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIFJldHVybnMgYW4gb2JqZWN0IG9mIHNob3cgYW5kIGhpZGUgdHJpZ2dlcnMuXHJcbiAgICAgICAqXHJcbiAgICAgICAqIElmIGEgdHJpZ2dlciBpcyBzdXBwbGllZCxcclxuICAgICAgICogaXQgaXMgdXNlZCB0byBzaG93IHRoZSB0b29sdGlwOyBvdGhlcndpc2UsIGl0IHdpbGwgdXNlIHRoZSBgdHJpZ2dlcmBcclxuICAgICAgICogb3B0aW9uIHBhc3NlZCB0byB0aGUgYCR0b29sdGlwUHJvdmlkZXIub3B0aW9uc2AgbWV0aG9kOyBlbHNlIGl0IHdpbGxcclxuICAgICAgICogZGVmYXVsdCB0byB0aGUgdHJpZ2dlciBzdXBwbGllZCB0byB0aGlzIGRpcmVjdGl2ZSBmYWN0b3J5LlxyXG4gICAgICAgKlxyXG4gICAgICAgKiBUaGUgaGlkZSB0cmlnZ2VyIGlzIGJhc2VkIG9uIHRoZSBzaG93IHRyaWdnZXIuIElmIHRoZSBgdHJpZ2dlcmAgb3B0aW9uXHJcbiAgICAgICAqIHdhcyBwYXNzZWQgdG8gdGhlIGAkdG9vbHRpcFByb3ZpZGVyLm9wdGlvbnNgIG1ldGhvZCwgaXQgd2lsbCB1c2UgdGhlXHJcbiAgICAgICAqIG1hcHBlZCB0cmlnZ2VyIGZyb20gYHRyaWdnZXJNYXBgIG9yIHRoZSBwYXNzZWQgdHJpZ2dlciBpZiB0aGUgbWFwIGlzXHJcbiAgICAgICAqIHVuZGVmaW5lZDsgb3RoZXJ3aXNlLCBpdCB1c2VzIHRoZSBgdHJpZ2dlck1hcGAgdmFsdWUgb2YgdGhlIHNob3dcclxuICAgICAgICogdHJpZ2dlcjsgZWxzZSBpdCB3aWxsIGp1c3QgdXNlIHRoZSBzaG93IHRyaWdnZXIuXHJcbiAgICAgICAqL1xyXG4gICAgICBmdW5jdGlvbiBnZXRUcmlnZ2Vycyh0cmlnZ2VyKSB7XHJcbiAgICAgICAgdmFyIHNob3cgPSAodHJpZ2dlciB8fCBvcHRpb25zLnRyaWdnZXIgfHwgZGVmYXVsdFRyaWdnZXJTaG93KS5zcGxpdCgnICcpO1xyXG4gICAgICAgIHZhciBoaWRlID0gc2hvdy5tYXAoZnVuY3Rpb24odHJpZ2dlcikge1xyXG4gICAgICAgICAgcmV0dXJuIHRyaWdnZXJNYXBbdHJpZ2dlcl0gfHwgdHJpZ2dlcjtcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgc2hvdzogc2hvdyxcclxuICAgICAgICAgIGhpZGU6IGhpZGVcclxuICAgICAgICB9O1xyXG4gICAgICB9XHJcblxyXG4gICAgICB2YXIgZGlyZWN0aXZlTmFtZSA9IHNuYWtlX2Nhc2UodHRUeXBlKTtcclxuXHJcbiAgICAgIHZhciBzdGFydFN5bSA9ICRpbnRlcnBvbGF0ZS5zdGFydFN5bWJvbCgpO1xyXG4gICAgICB2YXIgZW5kU3ltID0gJGludGVycG9sYXRlLmVuZFN5bWJvbCgpO1xyXG4gICAgICB2YXIgdGVtcGxhdGUgPVxyXG4gICAgICAgICc8ZGl2ICcrIGRpcmVjdGl2ZU5hbWUgKyAnLXBvcHVwICcgK1xyXG4gICAgICAgICAgJ3VpYi10aXRsZT1cIicgKyBzdGFydFN5bSArICd0aXRsZScgKyBlbmRTeW0gKyAnXCIgJyArXHJcbiAgICAgICAgICAob3B0aW9ucy51c2VDb250ZW50RXhwID9cclxuICAgICAgICAgICAgJ2NvbnRlbnQtZXhwPVwiY29udGVudEV4cCgpXCIgJyA6XHJcbiAgICAgICAgICAgICdjb250ZW50PVwiJyArIHN0YXJ0U3ltICsgJ2NvbnRlbnQnICsgZW5kU3ltICsgJ1wiICcpICtcclxuICAgICAgICAgICdvcmlnaW4tc2NvcGU9XCJvcmlnU2NvcGVcIiAnICtcclxuICAgICAgICAgICdjbGFzcz1cInVpYi1wb3NpdGlvbi1tZWFzdXJlICcgKyBwcmVmaXggKyAnXCIgJyArXHJcbiAgICAgICAgICAndG9vbHRpcC1hbmltYXRpb24tY2xhc3M9XCJmYWRlXCInICtcclxuICAgICAgICAgICd1aWItdG9vbHRpcC1jbGFzc2VzICcgK1xyXG4gICAgICAgICAgJ25nLWNsYXNzPVwieyBpbjogaXNPcGVuIH1cIiAnICtcclxuICAgICAgICAgICc+JyArXHJcbiAgICAgICAgJzwvZGl2Pic7XHJcblxyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIGNvbXBpbGU6IGZ1bmN0aW9uKHRFbGVtLCB0QXR0cnMpIHtcclxuICAgICAgICAgIHZhciB0b29sdGlwTGlua2VyID0gJGNvbXBpbGUodGVtcGxhdGUpO1xyXG5cclxuICAgICAgICAgIHJldHVybiBmdW5jdGlvbiBsaW5rKHNjb3BlLCBlbGVtZW50LCBhdHRycywgdG9vbHRpcEN0cmwpIHtcclxuICAgICAgICAgICAgdmFyIHRvb2x0aXA7XHJcbiAgICAgICAgICAgIHZhciB0b29sdGlwTGlua2VkU2NvcGU7XHJcbiAgICAgICAgICAgIHZhciB0cmFuc2l0aW9uVGltZW91dDtcclxuICAgICAgICAgICAgdmFyIHNob3dUaW1lb3V0O1xyXG4gICAgICAgICAgICB2YXIgaGlkZVRpbWVvdXQ7XHJcbiAgICAgICAgICAgIHZhciBwb3NpdGlvblRpbWVvdXQ7XHJcbiAgICAgICAgICAgIHZhciBhcHBlbmRUb0JvZHkgPSBhbmd1bGFyLmlzRGVmaW5lZChvcHRpb25zLmFwcGVuZFRvQm9keSkgPyBvcHRpb25zLmFwcGVuZFRvQm9keSA6IGZhbHNlO1xyXG4gICAgICAgICAgICB2YXIgdHJpZ2dlcnMgPSBnZXRUcmlnZ2Vycyh1bmRlZmluZWQpO1xyXG4gICAgICAgICAgICB2YXIgaGFzRW5hYmxlRXhwID0gYW5ndWxhci5pc0RlZmluZWQoYXR0cnNbcHJlZml4ICsgJ0VuYWJsZSddKTtcclxuICAgICAgICAgICAgdmFyIHR0U2NvcGUgPSBzY29wZS4kbmV3KHRydWUpO1xyXG4gICAgICAgICAgICB2YXIgcmVwb3NpdGlvblNjaGVkdWxlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICB2YXIgaXNPcGVuUGFyc2UgPSBhbmd1bGFyLmlzRGVmaW5lZChhdHRyc1twcmVmaXggKyAnSXNPcGVuJ10pID8gJHBhcnNlKGF0dHJzW3ByZWZpeCArICdJc09wZW4nXSkgOiBmYWxzZTtcclxuICAgICAgICAgICAgdmFyIGNvbnRlbnRQYXJzZSA9IG9wdGlvbnMudXNlQ29udGVudEV4cCA/ICRwYXJzZShhdHRyc1t0dFR5cGVdKSA6IGZhbHNlO1xyXG4gICAgICAgICAgICB2YXIgb2JzZXJ2ZXJzID0gW107XHJcbiAgICAgICAgICAgIHZhciBsYXN0UGxhY2VtZW50O1xyXG5cclxuICAgICAgICAgICAgdmFyIHBvc2l0aW9uVG9vbHRpcCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgIC8vIGNoZWNrIGlmIHRvb2x0aXAgZXhpc3RzIGFuZCBpcyBub3QgZW1wdHlcclxuICAgICAgICAgICAgICBpZiAoIXRvb2x0aXAgfHwgIXRvb2x0aXAuaHRtbCgpKSB7IHJldHVybjsgfVxyXG5cclxuICAgICAgICAgICAgICBpZiAoIXBvc2l0aW9uVGltZW91dCkge1xyXG4gICAgICAgICAgICAgICAgcG9zaXRpb25UaW1lb3V0ID0gJHRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgIHZhciB0dFBvc2l0aW9uID0gJHBvc2l0aW9uLnBvc2l0aW9uRWxlbWVudHMoZWxlbWVudCwgdG9vbHRpcCwgdHRTY29wZS5wbGFjZW1lbnQsIGFwcGVuZFRvQm9keSk7XHJcbiAgICAgICAgICAgICAgICAgIHZhciBpbml0aWFsSGVpZ2h0ID0gYW5ndWxhci5pc0RlZmluZWQodG9vbHRpcC5vZmZzZXRIZWlnaHQpID8gdG9vbHRpcC5vZmZzZXRIZWlnaHQgOiB0b29sdGlwLnByb3AoJ29mZnNldEhlaWdodCcpO1xyXG4gICAgICAgICAgICAgICAgICB2YXIgZWxlbWVudFBvcyA9IGFwcGVuZFRvQm9keSA/ICRwb3NpdGlvbi5vZmZzZXQoZWxlbWVudCkgOiAkcG9zaXRpb24ucG9zaXRpb24oZWxlbWVudCk7XHJcbiAgICAgICAgICAgICAgICAgIHRvb2x0aXAuY3NzKHsgdG9wOiB0dFBvc2l0aW9uLnRvcCArICdweCcsIGxlZnQ6IHR0UG9zaXRpb24ubGVmdCArICdweCcgfSk7XHJcbiAgICAgICAgICAgICAgICAgIHZhciBwbGFjZW1lbnRDbGFzc2VzID0gdHRQb3NpdGlvbi5wbGFjZW1lbnQuc3BsaXQoJy0nKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgIGlmICghdG9vbHRpcC5oYXNDbGFzcyhwbGFjZW1lbnRDbGFzc2VzWzBdKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRvb2x0aXAucmVtb3ZlQ2xhc3MobGFzdFBsYWNlbWVudC5zcGxpdCgnLScpWzBdKTtcclxuICAgICAgICAgICAgICAgICAgICB0b29sdGlwLmFkZENsYXNzKHBsYWNlbWVudENsYXNzZXNbMF0pO1xyXG4gICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICBpZiAoIXRvb2x0aXAuaGFzQ2xhc3Mob3B0aW9ucy5wbGFjZW1lbnRDbGFzc1ByZWZpeCArIHR0UG9zaXRpb24ucGxhY2VtZW50KSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRvb2x0aXAucmVtb3ZlQ2xhc3Mob3B0aW9ucy5wbGFjZW1lbnRDbGFzc1ByZWZpeCArIGxhc3RQbGFjZW1lbnQpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRvb2x0aXAuYWRkQ2xhc3Mob3B0aW9ucy5wbGFjZW1lbnRDbGFzc1ByZWZpeCArIHR0UG9zaXRpb24ucGxhY2VtZW50KTtcclxuICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGN1cnJlbnRIZWlnaHQgPSBhbmd1bGFyLmlzRGVmaW5lZCh0b29sdGlwLm9mZnNldEhlaWdodCkgPyB0b29sdGlwLm9mZnNldEhlaWdodCA6IHRvb2x0aXAucHJvcCgnb2Zmc2V0SGVpZ2h0Jyk7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGFkanVzdG1lbnQgPSAkcG9zaXRpb24uYWRqdXN0VG9wKHBsYWNlbWVudENsYXNzZXMsIGVsZW1lbnRQb3MsIGluaXRpYWxIZWlnaHQsIGN1cnJlbnRIZWlnaHQpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChhZGp1c3RtZW50KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICB0b29sdGlwLmNzcyhhZGp1c3RtZW50KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgIH0sIDAsIGZhbHNlKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgIC8vIGZpcnN0IHRpbWUgdGhyb3VnaCB0dCBlbGVtZW50IHdpbGwgaGF2ZSB0aGVcclxuICAgICAgICAgICAgICAgICAgLy8gdWliLXBvc2l0aW9uLW1lYXN1cmUgY2xhc3Mgb3IgaWYgdGhlIHBsYWNlbWVudFxyXG4gICAgICAgICAgICAgICAgICAvLyBoYXMgY2hhbmdlZCB3ZSBuZWVkIHRvIHBvc2l0aW9uIHRoZSBhcnJvdy5cclxuICAgICAgICAgICAgICAgICAgaWYgKHRvb2x0aXAuaGFzQ2xhc3MoJ3VpYi1wb3NpdGlvbi1tZWFzdXJlJykpIHtcclxuICAgICAgICAgICAgICAgICAgICAkcG9zaXRpb24ucG9zaXRpb25BcnJvdyh0b29sdGlwLCB0dFBvc2l0aW9uLnBsYWNlbWVudCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdG9vbHRpcC5yZW1vdmVDbGFzcygndWliLXBvc2l0aW9uLW1lYXN1cmUnKTtcclxuICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChsYXN0UGxhY2VtZW50ICE9PSB0dFBvc2l0aW9uLnBsYWNlbWVudCkge1xyXG4gICAgICAgICAgICAgICAgICAgICRwb3NpdGlvbi5wb3NpdGlvbkFycm93KHRvb2x0aXAsIHR0UG9zaXRpb24ucGxhY2VtZW50KTtcclxuICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICBsYXN0UGxhY2VtZW50ID0gdHRQb3NpdGlvbi5wbGFjZW1lbnQ7XHJcblxyXG4gICAgICAgICAgICAgICAgICBwb3NpdGlvblRpbWVvdXQgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgfSwgMCwgZmFsc2UpO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIC8vIFNldCB1cCB0aGUgY29ycmVjdCBzY29wZSB0byBhbGxvdyB0cmFuc2NsdXNpb24gbGF0ZXJcclxuICAgICAgICAgICAgdHRTY29wZS5vcmlnU2NvcGUgPSBzY29wZTtcclxuXHJcbiAgICAgICAgICAgIC8vIEJ5IGRlZmF1bHQsIHRoZSB0b29sdGlwIGlzIG5vdCBvcGVuLlxyXG4gICAgICAgICAgICAvLyBUT0RPIGFkZCBhYmlsaXR5IHRvIHN0YXJ0IHRvb2x0aXAgb3BlbmVkXHJcbiAgICAgICAgICAgIHR0U2NvcGUuaXNPcGVuID0gZmFsc2U7XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiB0b2dnbGVUb29sdGlwQmluZCgpIHtcclxuICAgICAgICAgICAgICBpZiAoIXR0U2NvcGUuaXNPcGVuKSB7XHJcbiAgICAgICAgICAgICAgICBzaG93VG9vbHRpcEJpbmQoKTtcclxuICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgaGlkZVRvb2x0aXBCaW5kKCk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBTaG93IHRoZSB0b29sdGlwIHdpdGggZGVsYXkgaWYgc3BlY2lmaWVkLCBvdGhlcndpc2Ugc2hvdyBpdCBpbW1lZGlhdGVseVxyXG4gICAgICAgICAgICBmdW5jdGlvbiBzaG93VG9vbHRpcEJpbmQoKSB7XHJcbiAgICAgICAgICAgICAgaWYgKGhhc0VuYWJsZUV4cCAmJiAhc2NvcGUuJGV2YWwoYXR0cnNbcHJlZml4ICsgJ0VuYWJsZSddKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgY2FuY2VsSGlkZSgpO1xyXG4gICAgICAgICAgICAgIHByZXBhcmVUb29sdGlwKCk7XHJcblxyXG4gICAgICAgICAgICAgIGlmICh0dFNjb3BlLnBvcHVwRGVsYXkpIHtcclxuICAgICAgICAgICAgICAgIC8vIERvIG5vdGhpbmcgaWYgdGhlIHRvb2x0aXAgd2FzIGFscmVhZHkgc2NoZWR1bGVkIHRvIHBvcC11cC5cclxuICAgICAgICAgICAgICAgIC8vIFRoaXMgaGFwcGVucyBpZiBzaG93IGlzIHRyaWdnZXJlZCBtdWx0aXBsZSB0aW1lcyBiZWZvcmUgYW55IGhpZGUgaXMgdHJpZ2dlcmVkLlxyXG4gICAgICAgICAgICAgICAgaWYgKCFzaG93VGltZW91dCkge1xyXG4gICAgICAgICAgICAgICAgICBzaG93VGltZW91dCA9ICR0aW1lb3V0KHNob3csIHR0U2NvcGUucG9wdXBEZWxheSwgZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBzaG93KCk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBoaWRlVG9vbHRpcEJpbmQoKSB7XHJcbiAgICAgICAgICAgICAgY2FuY2VsU2hvdygpO1xyXG5cclxuICAgICAgICAgICAgICBpZiAodHRTY29wZS5wb3B1cENsb3NlRGVsYXkpIHtcclxuICAgICAgICAgICAgICAgIGlmICghaGlkZVRpbWVvdXQpIHtcclxuICAgICAgICAgICAgICAgICAgaGlkZVRpbWVvdXQgPSAkdGltZW91dChoaWRlLCB0dFNjb3BlLnBvcHVwQ2xvc2VEZWxheSwgZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBoaWRlKCk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBTaG93IHRoZSB0b29sdGlwIHBvcHVwIGVsZW1lbnQuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIHNob3coKSB7XHJcbiAgICAgICAgICAgICAgY2FuY2VsU2hvdygpO1xyXG4gICAgICAgICAgICAgIGNhbmNlbEhpZGUoKTtcclxuXHJcbiAgICAgICAgICAgICAgLy8gRG9uJ3Qgc2hvdyBlbXB0eSB0b29sdGlwcy5cclxuICAgICAgICAgICAgICBpZiAoIXR0U2NvcGUuY29udGVudCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGFuZ3VsYXIubm9vcDtcclxuICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgIGNyZWF0ZVRvb2x0aXAoKTtcclxuXHJcbiAgICAgICAgICAgICAgLy8gQW5kIHNob3cgdGhlIHRvb2x0aXAuXHJcbiAgICAgICAgICAgICAgdHRTY29wZS4kZXZhbEFzeW5jKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgdHRTY29wZS5pc09wZW4gPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgYXNzaWduSXNPcGVuKHRydWUpO1xyXG4gICAgICAgICAgICAgICAgcG9zaXRpb25Ub29sdGlwKCk7XHJcbiAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIGNhbmNlbFNob3coKSB7XHJcbiAgICAgICAgICAgICAgaWYgKHNob3dUaW1lb3V0KSB7XHJcbiAgICAgICAgICAgICAgICAkdGltZW91dC5jYW5jZWwoc2hvd1RpbWVvdXQpO1xyXG4gICAgICAgICAgICAgICAgc2hvd1RpbWVvdXQgPSBudWxsO1xyXG4gICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgaWYgKHBvc2l0aW9uVGltZW91dCkge1xyXG4gICAgICAgICAgICAgICAgJHRpbWVvdXQuY2FuY2VsKHBvc2l0aW9uVGltZW91dCk7XHJcbiAgICAgICAgICAgICAgICBwb3NpdGlvblRpbWVvdXQgPSBudWxsO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gSGlkZSB0aGUgdG9vbHRpcCBwb3B1cCBlbGVtZW50LlxyXG4gICAgICAgICAgICBmdW5jdGlvbiBoaWRlKCkge1xyXG4gICAgICAgICAgICAgIGlmICghdHRTY29wZSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgLy8gRmlyc3QgdGhpbmdzIGZpcnN0OiB3ZSBkb24ndCBzaG93IGl0IGFueW1vcmUuXHJcbiAgICAgICAgICAgICAgdHRTY29wZS4kZXZhbEFzeW5jKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHR0U2NvcGUpIHtcclxuICAgICAgICAgICAgICAgICAgdHRTY29wZS5pc09wZW4gPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgYXNzaWduSXNPcGVuKGZhbHNlKTtcclxuICAgICAgICAgICAgICAgICAgLy8gQW5kIG5vdyB3ZSByZW1vdmUgaXQgZnJvbSB0aGUgRE9NLiBIb3dldmVyLCBpZiB3ZSBoYXZlIGFuaW1hdGlvbiwgd2VcclxuICAgICAgICAgICAgICAgICAgLy8gbmVlZCB0byB3YWl0IGZvciBpdCB0byBleHBpcmUgYmVmb3JlaGFuZC5cclxuICAgICAgICAgICAgICAgICAgLy8gRklYTUU6IHRoaXMgaXMgYSBwbGFjZWhvbGRlciBmb3IgYSBwb3J0IG9mIHRoZSB0cmFuc2l0aW9ucyBsaWJyYXJ5LlxyXG4gICAgICAgICAgICAgICAgICAvLyBUaGUgZmFkZSB0cmFuc2l0aW9uIGluIFRXQlMgaXMgMTUwbXMuXHJcbiAgICAgICAgICAgICAgICAgIGlmICh0dFNjb3BlLmFuaW1hdGlvbikge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICghdHJhbnNpdGlvblRpbWVvdXQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgIHRyYW5zaXRpb25UaW1lb3V0ID0gJHRpbWVvdXQocmVtb3ZlVG9vbHRpcCwgMTUwLCBmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlbW92ZVRvb2x0aXAoKTtcclxuICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBjYW5jZWxIaWRlKCkge1xyXG4gICAgICAgICAgICAgIGlmIChoaWRlVGltZW91dCkge1xyXG4gICAgICAgICAgICAgICAgJHRpbWVvdXQuY2FuY2VsKGhpZGVUaW1lb3V0KTtcclxuICAgICAgICAgICAgICAgIGhpZGVUaW1lb3V0ID0gbnVsbDtcclxuICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgIGlmICh0cmFuc2l0aW9uVGltZW91dCkge1xyXG4gICAgICAgICAgICAgICAgJHRpbWVvdXQuY2FuY2VsKHRyYW5zaXRpb25UaW1lb3V0KTtcclxuICAgICAgICAgICAgICAgIHRyYW5zaXRpb25UaW1lb3V0ID0gbnVsbDtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIGNyZWF0ZVRvb2x0aXAoKSB7XHJcbiAgICAgICAgICAgICAgLy8gVGhlcmUgY2FuIG9ubHkgYmUgb25lIHRvb2x0aXAgZWxlbWVudCBwZXIgZGlyZWN0aXZlIHNob3duIGF0IG9uY2UuXHJcbiAgICAgICAgICAgICAgaWYgKHRvb2x0aXApIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgIHRvb2x0aXBMaW5rZWRTY29wZSA9IHR0U2NvcGUuJG5ldygpO1xyXG4gICAgICAgICAgICAgIHRvb2x0aXAgPSB0b29sdGlwTGlua2VyKHRvb2x0aXBMaW5rZWRTY29wZSwgZnVuY3Rpb24odG9vbHRpcCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGFwcGVuZFRvQm9keSkge1xyXG4gICAgICAgICAgICAgICAgICAkZG9jdW1lbnQuZmluZCgnYm9keScpLmFwcGVuZCh0b29sdGlwKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgIGVsZW1lbnQuYWZ0ZXIodG9vbHRpcCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgIG9wZW5lZFRvb2x0aXBzLmFkZCh0dFNjb3BlLCB7XHJcbiAgICAgICAgICAgICAgICBjbG9zZTogaGlkZVxyXG4gICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICBwcmVwT2JzZXJ2ZXJzKCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIHJlbW92ZVRvb2x0aXAoKSB7XHJcbiAgICAgICAgICAgICAgY2FuY2VsU2hvdygpO1xyXG4gICAgICAgICAgICAgIGNhbmNlbEhpZGUoKTtcclxuICAgICAgICAgICAgICB1bnJlZ2lzdGVyT2JzZXJ2ZXJzKCk7XHJcblxyXG4gICAgICAgICAgICAgIGlmICh0b29sdGlwKSB7XHJcbiAgICAgICAgICAgICAgICB0b29sdGlwLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICAgICAgdG9vbHRpcCA9IG51bGw7XHJcbiAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICBvcGVuZWRUb29sdGlwcy5yZW1vdmUodHRTY29wZSk7XHJcbiAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgaWYgKHRvb2x0aXBMaW5rZWRTY29wZSkge1xyXG4gICAgICAgICAgICAgICAgdG9vbHRpcExpbmtlZFNjb3BlLiRkZXN0cm95KCk7XHJcbiAgICAgICAgICAgICAgICB0b29sdGlwTGlua2VkU2NvcGUgPSBudWxsO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLyoqXHJcbiAgICAgICAgICAgICAqIFNldCB0aGUgaW5pdGlhbCBzY29wZSB2YWx1ZXMuIE9uY2VcclxuICAgICAgICAgICAgICogdGhlIHRvb2x0aXAgaXMgY3JlYXRlZCwgdGhlIG9ic2VydmVyc1xyXG4gICAgICAgICAgICAgKiB3aWxsIGJlIGFkZGVkIHRvIGtlZXAgdGhpbmdzIGluIHN5bmMuXHJcbiAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICBmdW5jdGlvbiBwcmVwYXJlVG9vbHRpcCgpIHtcclxuICAgICAgICAgICAgICB0dFNjb3BlLnRpdGxlID0gYXR0cnNbcHJlZml4ICsgJ1RpdGxlJ107XHJcbiAgICAgICAgICAgICAgaWYgKGNvbnRlbnRQYXJzZSkge1xyXG4gICAgICAgICAgICAgICAgdHRTY29wZS5jb250ZW50ID0gY29udGVudFBhcnNlKHNjb3BlKTtcclxuICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdHRTY29wZS5jb250ZW50ID0gYXR0cnNbdHRUeXBlXTtcclxuICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgIHR0U2NvcGUucG9wdXBDbGFzcyA9IGF0dHJzW3ByZWZpeCArICdDbGFzcyddO1xyXG4gICAgICAgICAgICAgIHR0U2NvcGUucGxhY2VtZW50ID0gYW5ndWxhci5pc0RlZmluZWQoYXR0cnNbcHJlZml4ICsgJ1BsYWNlbWVudCddKSA/IGF0dHJzW3ByZWZpeCArICdQbGFjZW1lbnQnXSA6IG9wdGlvbnMucGxhY2VtZW50O1xyXG4gICAgICAgICAgICAgIHZhciBwbGFjZW1lbnQgPSAkcG9zaXRpb24ucGFyc2VQbGFjZW1lbnQodHRTY29wZS5wbGFjZW1lbnQpO1xyXG4gICAgICAgICAgICAgIGxhc3RQbGFjZW1lbnQgPSBwbGFjZW1lbnRbMV0gPyBwbGFjZW1lbnRbMF0gKyAnLScgKyBwbGFjZW1lbnRbMV0gOiBwbGFjZW1lbnRbMF07XHJcblxyXG4gICAgICAgICAgICAgIHZhciBkZWxheSA9IHBhcnNlSW50KGF0dHJzW3ByZWZpeCArICdQb3B1cERlbGF5J10sIDEwKTtcclxuICAgICAgICAgICAgICB2YXIgY2xvc2VEZWxheSA9IHBhcnNlSW50KGF0dHJzW3ByZWZpeCArICdQb3B1cENsb3NlRGVsYXknXSwgMTApO1xyXG4gICAgICAgICAgICAgIHR0U2NvcGUucG9wdXBEZWxheSA9ICFpc05hTihkZWxheSkgPyBkZWxheSA6IG9wdGlvbnMucG9wdXBEZWxheTtcclxuICAgICAgICAgICAgICB0dFNjb3BlLnBvcHVwQ2xvc2VEZWxheSA9ICFpc05hTihjbG9zZURlbGF5KSA/IGNsb3NlRGVsYXkgOiBvcHRpb25zLnBvcHVwQ2xvc2VEZWxheTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gYXNzaWduSXNPcGVuKGlzT3Blbikge1xyXG4gICAgICAgICAgICAgIGlmIChpc09wZW5QYXJzZSAmJiBhbmd1bGFyLmlzRnVuY3Rpb24oaXNPcGVuUGFyc2UuYXNzaWduKSkge1xyXG4gICAgICAgICAgICAgICAgaXNPcGVuUGFyc2UuYXNzaWduKHNjb3BlLCBpc09wZW4pO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdHRTY29wZS5jb250ZW50RXhwID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgcmV0dXJuIHR0U2NvcGUuY29udGVudDtcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIC8qKlxyXG4gICAgICAgICAgICAgKiBPYnNlcnZlIHRoZSByZWxldmFudCBhdHRyaWJ1dGVzLlxyXG4gICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgYXR0cnMuJG9ic2VydmUoJ2Rpc2FibGVkJywgZnVuY3Rpb24odmFsKSB7XHJcbiAgICAgICAgICAgICAgaWYgKHZhbCkge1xyXG4gICAgICAgICAgICAgICAgY2FuY2VsU2hvdygpO1xyXG4gICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgaWYgKHZhbCAmJiB0dFNjb3BlLmlzT3Blbikge1xyXG4gICAgICAgICAgICAgICAgaGlkZSgpO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBpZiAoaXNPcGVuUGFyc2UpIHtcclxuICAgICAgICAgICAgICBzY29wZS4kd2F0Y2goaXNPcGVuUGFyc2UsIGZ1bmN0aW9uKHZhbCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHR0U2NvcGUgJiYgIXZhbCA9PT0gdHRTY29wZS5pc09wZW4pIHtcclxuICAgICAgICAgICAgICAgICAgdG9nZ2xlVG9vbHRpcEJpbmQoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gcHJlcE9ic2VydmVycygpIHtcclxuICAgICAgICAgICAgICBvYnNlcnZlcnMubGVuZ3RoID0gMDtcclxuXHJcbiAgICAgICAgICAgICAgaWYgKGNvbnRlbnRQYXJzZSkge1xyXG4gICAgICAgICAgICAgICAgb2JzZXJ2ZXJzLnB1c2goXHJcbiAgICAgICAgICAgICAgICAgIHNjb3BlLiR3YXRjaChjb250ZW50UGFyc2UsIGZ1bmN0aW9uKHZhbCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHR0U2NvcGUuY29udGVudCA9IHZhbDtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIXZhbCAmJiB0dFNjb3BlLmlzT3Blbikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgaGlkZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICAgICAgb2JzZXJ2ZXJzLnB1c2goXHJcbiAgICAgICAgICAgICAgICAgIHRvb2x0aXBMaW5rZWRTY29wZS4kd2F0Y2goZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFyZXBvc2l0aW9uU2NoZWR1bGVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICByZXBvc2l0aW9uU2NoZWR1bGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgIHRvb2x0aXBMaW5rZWRTY29wZS4kJHBvc3REaWdlc3QoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlcG9zaXRpb25TY2hlZHVsZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHR0U2NvcGUgJiYgdHRTY29wZS5pc09wZW4pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICBwb3NpdGlvblRvb2x0aXAoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgb2JzZXJ2ZXJzLnB1c2goXHJcbiAgICAgICAgICAgICAgICAgIGF0dHJzLiRvYnNlcnZlKHR0VHlwZSwgZnVuY3Rpb24odmFsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdHRTY29wZS5jb250ZW50ID0gdmFsO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICghdmFsICYmIHR0U2NvcGUuaXNPcGVuKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICBoaWRlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uVG9vbHRpcCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICBvYnNlcnZlcnMucHVzaChcclxuICAgICAgICAgICAgICAgIGF0dHJzLiRvYnNlcnZlKHByZWZpeCArICdUaXRsZScsIGZ1bmN0aW9uKHZhbCkge1xyXG4gICAgICAgICAgICAgICAgICB0dFNjb3BlLnRpdGxlID0gdmFsO1xyXG4gICAgICAgICAgICAgICAgICBpZiAodHRTY29wZS5pc09wZW4pIHtcclxuICAgICAgICAgICAgICAgICAgICBwb3NpdGlvblRvb2x0aXAoKTtcclxuICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgICBvYnNlcnZlcnMucHVzaChcclxuICAgICAgICAgICAgICAgIGF0dHJzLiRvYnNlcnZlKHByZWZpeCArICdQbGFjZW1lbnQnLCBmdW5jdGlvbih2YWwpIHtcclxuICAgICAgICAgICAgICAgICAgdHRTY29wZS5wbGFjZW1lbnQgPSB2YWwgPyB2YWwgOiBvcHRpb25zLnBsYWNlbWVudDtcclxuICAgICAgICAgICAgICAgICAgaWYgKHR0U2NvcGUuaXNPcGVuKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcG9zaXRpb25Ub29sdGlwKCk7XHJcbiAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gdW5yZWdpc3Rlck9ic2VydmVycygpIHtcclxuICAgICAgICAgICAgICBpZiAob2JzZXJ2ZXJzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgYW5ndWxhci5mb3JFYWNoKG9ic2VydmVycywgZnVuY3Rpb24ob2JzZXJ2ZXIpIHtcclxuICAgICAgICAgICAgICAgICAgb2JzZXJ2ZXIoKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgb2JzZXJ2ZXJzLmxlbmd0aCA9IDA7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBoaWRlIHRvb2x0aXBzL3BvcG92ZXJzIGZvciBvdXRzaWRlQ2xpY2sgdHJpZ2dlclxyXG4gICAgICAgICAgICBmdW5jdGlvbiBib2R5SGlkZVRvb2x0aXBCaW5kKGUpIHtcclxuICAgICAgICAgICAgICBpZiAoIXR0U2NvcGUgfHwgIXR0U2NvcGUuaXNPcGVuIHx8ICF0b29sdGlwKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIC8vIG1ha2Ugc3VyZSB0aGUgdG9vbHRpcC9wb3BvdmVyIGxpbmsgb3IgdG9vbCB0b29sdGlwL3BvcG92ZXIgaXRzZWxmIHdlcmUgbm90IGNsaWNrZWRcclxuICAgICAgICAgICAgICBpZiAoIWVsZW1lbnRbMF0uY29udGFpbnMoZS50YXJnZXQpICYmICF0b29sdGlwWzBdLmNvbnRhaW5zKGUudGFyZ2V0KSkge1xyXG4gICAgICAgICAgICAgICAgaGlkZVRvb2x0aXBCaW5kKCk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB2YXIgdW5yZWdpc3RlclRyaWdnZXJzID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgdHJpZ2dlcnMuc2hvdy5mb3JFYWNoKGZ1bmN0aW9uKHRyaWdnZXIpIHtcclxuICAgICAgICAgICAgICAgIGlmICh0cmlnZ2VyID09PSAnb3V0c2lkZUNsaWNrJykge1xyXG4gICAgICAgICAgICAgICAgICBlbGVtZW50Lm9mZignY2xpY2snLCB0b2dnbGVUb29sdGlwQmluZCk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICBlbGVtZW50Lm9mZih0cmlnZ2VyLCBzaG93VG9vbHRpcEJpbmQpO1xyXG4gICAgICAgICAgICAgICAgICBlbGVtZW50Lm9mZih0cmlnZ2VyLCB0b2dnbGVUb29sdGlwQmluZCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgdHJpZ2dlcnMuaGlkZS5mb3JFYWNoKGZ1bmN0aW9uKHRyaWdnZXIpIHtcclxuICAgICAgICAgICAgICAgIGlmICh0cmlnZ2VyID09PSAnb3V0c2lkZUNsaWNrJykge1xyXG4gICAgICAgICAgICAgICAgICAkZG9jdW1lbnQub2ZmKCdjbGljaycsIGJvZHlIaWRlVG9vbHRpcEJpbmQpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgZWxlbWVudC5vZmYodHJpZ2dlciwgaGlkZVRvb2x0aXBCaW5kKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIHByZXBUcmlnZ2VycygpIHtcclxuICAgICAgICAgICAgICB2YXIgc2hvd1RyaWdnZXJzID0gW10sIGhpZGVUcmlnZ2VycyA9IFtdO1xyXG4gICAgICAgICAgICAgIHZhciB2YWwgPSBzY29wZS4kZXZhbChhdHRyc1twcmVmaXggKyAnVHJpZ2dlciddKTtcclxuICAgICAgICAgICAgICB1bnJlZ2lzdGVyVHJpZ2dlcnMoKTtcclxuXHJcbiAgICAgICAgICAgICAgaWYgKGFuZ3VsYXIuaXNPYmplY3QodmFsKSkge1xyXG4gICAgICAgICAgICAgICAgT2JqZWN0LmtleXModmFsKS5mb3JFYWNoKGZ1bmN0aW9uKGtleSkge1xyXG4gICAgICAgICAgICAgICAgICBzaG93VHJpZ2dlcnMucHVzaChrZXkpO1xyXG4gICAgICAgICAgICAgICAgICBoaWRlVHJpZ2dlcnMucHVzaCh2YWxba2V5XSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIHRyaWdnZXJzID0ge1xyXG4gICAgICAgICAgICAgICAgICBzaG93OiBzaG93VHJpZ2dlcnMsXHJcbiAgICAgICAgICAgICAgICAgIGhpZGU6IGhpZGVUcmlnZ2Vyc1xyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdHJpZ2dlcnMgPSBnZXRUcmlnZ2Vycyh2YWwpO1xyXG4gICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgaWYgKHRyaWdnZXJzLnNob3cgIT09ICdub25lJykge1xyXG4gICAgICAgICAgICAgICAgdHJpZ2dlcnMuc2hvdy5mb3JFYWNoKGZ1bmN0aW9uKHRyaWdnZXIsIGlkeCkge1xyXG4gICAgICAgICAgICAgICAgICBpZiAodHJpZ2dlciA9PT0gJ291dHNpZGVDbGljaycpIHtcclxuICAgICAgICAgICAgICAgICAgICBlbGVtZW50Lm9uKCdjbGljaycsIHRvZ2dsZVRvb2x0aXBCaW5kKTtcclxuICAgICAgICAgICAgICAgICAgICAkZG9jdW1lbnQub24oJ2NsaWNrJywgYm9keUhpZGVUb29sdGlwQmluZCk7XHJcbiAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodHJpZ2dlciA9PT0gdHJpZ2dlcnMuaGlkZVtpZHhdKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5vbih0cmlnZ2VyLCB0b2dnbGVUb29sdGlwQmluZCk7XHJcbiAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodHJpZ2dlcikge1xyXG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQub24odHJpZ2dlciwgc2hvd1Rvb2x0aXBCaW5kKTtcclxuICAgICAgICAgICAgICAgICAgICBlbGVtZW50Lm9uKHRyaWdnZXJzLmhpZGVbaWR4XSwgaGlkZVRvb2x0aXBCaW5kKTtcclxuICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgZWxlbWVudC5vbigna2V5cHJlc3MnLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGUud2hpY2ggPT09IDI3KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICBoaWRlVG9vbHRpcEJpbmQoKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBwcmVwVHJpZ2dlcnMoKTtcclxuXHJcbiAgICAgICAgICAgIHZhciBhbmltYXRpb24gPSBzY29wZS4kZXZhbChhdHRyc1twcmVmaXggKyAnQW5pbWF0aW9uJ10pO1xyXG4gICAgICAgICAgICB0dFNjb3BlLmFuaW1hdGlvbiA9IGFuZ3VsYXIuaXNEZWZpbmVkKGFuaW1hdGlvbikgPyAhIWFuaW1hdGlvbiA6IG9wdGlvbnMuYW5pbWF0aW9uO1xyXG5cclxuICAgICAgICAgICAgdmFyIGFwcGVuZFRvQm9keVZhbDtcclxuICAgICAgICAgICAgdmFyIGFwcGVuZEtleSA9IHByZWZpeCArICdBcHBlbmRUb0JvZHknO1xyXG4gICAgICAgICAgICBpZiAoYXBwZW5kS2V5IGluIGF0dHJzICYmIGF0dHJzW2FwcGVuZEtleV0gPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgIGFwcGVuZFRvQm9keVZhbCA9IHRydWU7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgYXBwZW5kVG9Cb2R5VmFsID0gc2NvcGUuJGV2YWwoYXR0cnNbYXBwZW5kS2V5XSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGFwcGVuZFRvQm9keSA9IGFuZ3VsYXIuaXNEZWZpbmVkKGFwcGVuZFRvQm9keVZhbCkgPyBhcHBlbmRUb0JvZHlWYWwgOiBhcHBlbmRUb0JvZHk7XHJcblxyXG4gICAgICAgICAgICAvLyBNYWtlIHN1cmUgdG9vbHRpcCBpcyBkZXN0cm95ZWQgYW5kIHJlbW92ZWQuXHJcbiAgICAgICAgICAgIHNjb3BlLiRvbignJGRlc3Ryb3knLCBmdW5jdGlvbiBvbkRlc3Ryb3lUb29sdGlwKCkge1xyXG4gICAgICAgICAgICAgIHVucmVnaXN0ZXJUcmlnZ2VycygpO1xyXG4gICAgICAgICAgICAgIHJlbW92ZVRvb2x0aXAoKTtcclxuICAgICAgICAgICAgICB0dFNjb3BlID0gbnVsbDtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgICAgfTtcclxuICAgIH07XHJcbiAgfV07XHJcbn0pXHJcblxyXG4vLyBUaGlzIGlzIG1vc3RseSBuZ0luY2x1ZGUgY29kZSBidXQgd2l0aCBhIGN1c3RvbSBzY29wZVxyXG4uZGlyZWN0aXZlKCd1aWJUb29sdGlwVGVtcGxhdGVUcmFuc2NsdWRlJywgW1xyXG4gICAgICAgICAnJGFuaW1hdGUnLCAnJHNjZScsICckY29tcGlsZScsICckdGVtcGxhdGVSZXF1ZXN0JyxcclxuZnVuY3Rpb24gKCRhbmltYXRlLCAkc2NlLCAkY29tcGlsZSwgJHRlbXBsYXRlUmVxdWVzdCkge1xyXG4gIHJldHVybiB7XHJcbiAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxlbSwgYXR0cnMpIHtcclxuICAgICAgdmFyIG9yaWdTY29wZSA9IHNjb3BlLiRldmFsKGF0dHJzLnRvb2x0aXBUZW1wbGF0ZVRyYW5zY2x1ZGVTY29wZSk7XHJcblxyXG4gICAgICB2YXIgY2hhbmdlQ291bnRlciA9IDAsXHJcbiAgICAgICAgY3VycmVudFNjb3BlLFxyXG4gICAgICAgIHByZXZpb3VzRWxlbWVudCxcclxuICAgICAgICBjdXJyZW50RWxlbWVudDtcclxuXHJcbiAgICAgIHZhciBjbGVhbnVwTGFzdEluY2x1ZGVDb250ZW50ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgaWYgKHByZXZpb3VzRWxlbWVudCkge1xyXG4gICAgICAgICAgcHJldmlvdXNFbGVtZW50LnJlbW92ZSgpO1xyXG4gICAgICAgICAgcHJldmlvdXNFbGVtZW50ID0gbnVsbDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChjdXJyZW50U2NvcGUpIHtcclxuICAgICAgICAgIGN1cnJlbnRTY29wZS4kZGVzdHJveSgpO1xyXG4gICAgICAgICAgY3VycmVudFNjb3BlID0gbnVsbDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChjdXJyZW50RWxlbWVudCkge1xyXG4gICAgICAgICAgJGFuaW1hdGUubGVhdmUoY3VycmVudEVsZW1lbnQpLnRoZW4oZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHByZXZpb3VzRWxlbWVudCA9IG51bGw7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICAgIHByZXZpb3VzRWxlbWVudCA9IGN1cnJlbnRFbGVtZW50O1xyXG4gICAgICAgICAgY3VycmVudEVsZW1lbnQgPSBudWxsO1xyXG4gICAgICAgIH1cclxuICAgICAgfTtcclxuXHJcbiAgICAgIHNjb3BlLiR3YXRjaCgkc2NlLnBhcnNlQXNSZXNvdXJjZVVybChhdHRycy51aWJUb29sdGlwVGVtcGxhdGVUcmFuc2NsdWRlKSwgZnVuY3Rpb24oc3JjKSB7XHJcbiAgICAgICAgdmFyIHRoaXNDaGFuZ2VJZCA9ICsrY2hhbmdlQ291bnRlcjtcclxuXHJcbiAgICAgICAgaWYgKHNyYykge1xyXG4gICAgICAgICAgLy9zZXQgdGhlIDJuZCBwYXJhbSB0byB0cnVlIHRvIGlnbm9yZSB0aGUgdGVtcGxhdGUgcmVxdWVzdCBlcnJvciBzbyB0aGF0IHRoZSBpbm5lclxyXG4gICAgICAgICAgLy9jb250ZW50cyBhbmQgc2NvcGUgY2FuIGJlIGNsZWFuZWQgdXAuXHJcbiAgICAgICAgICAkdGVtcGxhdGVSZXF1ZXN0KHNyYywgdHJ1ZSkudGhlbihmdW5jdGlvbihyZXNwb25zZSkge1xyXG4gICAgICAgICAgICBpZiAodGhpc0NoYW5nZUlkICE9PSBjaGFuZ2VDb3VudGVyKSB7IHJldHVybjsgfVxyXG4gICAgICAgICAgICB2YXIgbmV3U2NvcGUgPSBvcmlnU2NvcGUuJG5ldygpO1xyXG4gICAgICAgICAgICB2YXIgdGVtcGxhdGUgPSByZXNwb25zZTtcclxuXHJcbiAgICAgICAgICAgIHZhciBjbG9uZSA9ICRjb21waWxlKHRlbXBsYXRlKShuZXdTY29wZSwgZnVuY3Rpb24oY2xvbmUpIHtcclxuICAgICAgICAgICAgICBjbGVhbnVwTGFzdEluY2x1ZGVDb250ZW50KCk7XHJcbiAgICAgICAgICAgICAgJGFuaW1hdGUuZW50ZXIoY2xvbmUsIGVsZW0pO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIGN1cnJlbnRTY29wZSA9IG5ld1Njb3BlO1xyXG4gICAgICAgICAgICBjdXJyZW50RWxlbWVudCA9IGNsb25lO1xyXG5cclxuICAgICAgICAgICAgY3VycmVudFNjb3BlLiRlbWl0KCckaW5jbHVkZUNvbnRlbnRMb2FkZWQnLCBzcmMpO1xyXG4gICAgICAgICAgfSwgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzQ2hhbmdlSWQgPT09IGNoYW5nZUNvdW50ZXIpIHtcclxuICAgICAgICAgICAgICBjbGVhbnVwTGFzdEluY2x1ZGVDb250ZW50KCk7XHJcbiAgICAgICAgICAgICAgc2NvcGUuJGVtaXQoJyRpbmNsdWRlQ29udGVudEVycm9yJywgc3JjKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgICBzY29wZS4kZW1pdCgnJGluY2x1ZGVDb250ZW50UmVxdWVzdGVkJywgc3JjKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgY2xlYW51cExhc3RJbmNsdWRlQ29udGVudCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcblxyXG4gICAgICBzY29wZS4kb24oJyRkZXN0cm95JywgY2xlYW51cExhc3RJbmNsdWRlQ29udGVudCk7XHJcbiAgICB9XHJcbiAgfTtcclxufV0pXHJcblxyXG4vKipcclxuICogTm90ZSB0aGF0IGl0J3MgaW50ZW50aW9uYWwgdGhhdCB0aGVzZSBjbGFzc2VzIGFyZSAqbm90KiBhcHBsaWVkIHRocm91Z2ggJGFuaW1hdGUuXHJcbiAqIFRoZXkgbXVzdCBub3QgYmUgYW5pbWF0ZWQgYXMgdGhleSdyZSBleHBlY3RlZCB0byBiZSBwcmVzZW50IG9uIHRoZSB0b29sdGlwIG9uXHJcbiAqIGluaXRpYWxpemF0aW9uLlxyXG4gKi9cclxuLmRpcmVjdGl2ZSgndWliVG9vbHRpcENsYXNzZXMnLCBbJyR1aWJQb3NpdGlvbicsIGZ1bmN0aW9uKCR1aWJQb3NpdGlvbikge1xyXG4gIHJldHVybiB7XHJcbiAgICByZXN0cmljdDogJ0EnLFxyXG4gICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsZW1lbnQsIGF0dHJzKSB7XHJcbiAgICAgIC8vIG5lZWQgdG8gc2V0IHRoZSBwcmltYXJ5IHBvc2l0aW9uIHNvIHRoZVxyXG4gICAgICAvLyBhcnJvdyBoYXMgc3BhY2UgZHVyaW5nIHBvc2l0aW9uIG1lYXN1cmUuXHJcbiAgICAgIC8vIHRvb2x0aXAucG9zaXRpb25Ub29sdGlwKClcclxuICAgICAgaWYgKHNjb3BlLnBsYWNlbWVudCkge1xyXG4gICAgICAgIC8vIC8vIFRoZXJlIGFyZSBubyB0b3AtbGVmdCBldGMuLi4gY2xhc3Nlc1xyXG4gICAgICAgIC8vIC8vIGluIFRXQlMsIHNvIHdlIG5lZWQgdGhlIHByaW1hcnkgcG9zaXRpb24uXHJcbiAgICAgICAgdmFyIHBvc2l0aW9uID0gJHVpYlBvc2l0aW9uLnBhcnNlUGxhY2VtZW50KHNjb3BlLnBsYWNlbWVudCk7XHJcbiAgICAgICAgZWxlbWVudC5hZGRDbGFzcyhwb3NpdGlvblswXSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChzY29wZS5wb3B1cENsYXNzKSB7XHJcbiAgICAgICAgZWxlbWVudC5hZGRDbGFzcyhzY29wZS5wb3B1cENsYXNzKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKHNjb3BlLmFuaW1hdGlvbikge1xyXG4gICAgICAgIGVsZW1lbnQuYWRkQ2xhc3MoYXR0cnMudG9vbHRpcEFuaW1hdGlvbkNsYXNzKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH07XHJcbn1dKVxyXG5cclxuLmRpcmVjdGl2ZSgndWliVG9vbHRpcFBvcHVwJywgZnVuY3Rpb24oKSB7XHJcbiAgcmV0dXJuIHtcclxuICAgIHJlc3RyaWN0OiAnQScsXHJcbiAgICBzY29wZTogeyBjb250ZW50OiAnQCcgfSxcclxuICAgIHRlbXBsYXRlVXJsOiAndWliL3RlbXBsYXRlL3Rvb2x0aXAvdG9vbHRpcC1wb3B1cC5odG1sJ1xyXG4gIH07XHJcbn0pXHJcblxyXG4uZGlyZWN0aXZlKCd1aWJUb29sdGlwJywgWyAnJHVpYlRvb2x0aXAnLCBmdW5jdGlvbigkdWliVG9vbHRpcCkge1xyXG4gIHJldHVybiAkdWliVG9vbHRpcCgndWliVG9vbHRpcCcsICd0b29sdGlwJywgJ21vdXNlZW50ZXInKTtcclxufV0pXHJcblxyXG4uZGlyZWN0aXZlKCd1aWJUb29sdGlwVGVtcGxhdGVQb3B1cCcsIGZ1bmN0aW9uKCkge1xyXG4gIHJldHVybiB7XHJcbiAgICByZXN0cmljdDogJ0EnLFxyXG4gICAgc2NvcGU6IHsgY29udGVudEV4cDogJyYnLCBvcmlnaW5TY29wZTogJyYnIH0sXHJcbiAgICB0ZW1wbGF0ZVVybDogJ3VpYi90ZW1wbGF0ZS90b29sdGlwL3Rvb2x0aXAtdGVtcGxhdGUtcG9wdXAuaHRtbCdcclxuICB9O1xyXG59KVxyXG5cclxuLmRpcmVjdGl2ZSgndWliVG9vbHRpcFRlbXBsYXRlJywgWyckdWliVG9vbHRpcCcsIGZ1bmN0aW9uKCR1aWJUb29sdGlwKSB7XHJcbiAgcmV0dXJuICR1aWJUb29sdGlwKCd1aWJUb29sdGlwVGVtcGxhdGUnLCAndG9vbHRpcCcsICdtb3VzZWVudGVyJywge1xyXG4gICAgdXNlQ29udGVudEV4cDogdHJ1ZVxyXG4gIH0pO1xyXG59XSlcclxuXHJcbi5kaXJlY3RpdmUoJ3VpYlRvb2x0aXBIdG1sUG9wdXAnLCBmdW5jdGlvbigpIHtcclxuICByZXR1cm4ge1xyXG4gICAgcmVzdHJpY3Q6ICdBJyxcclxuICAgIHNjb3BlOiB7IGNvbnRlbnRFeHA6ICcmJyB9LFxyXG4gICAgdGVtcGxhdGVVcmw6ICd1aWIvdGVtcGxhdGUvdG9vbHRpcC90b29sdGlwLWh0bWwtcG9wdXAuaHRtbCdcclxuICB9O1xyXG59KVxyXG5cclxuLmRpcmVjdGl2ZSgndWliVG9vbHRpcEh0bWwnLCBbJyR1aWJUb29sdGlwJywgZnVuY3Rpb24oJHVpYlRvb2x0aXApIHtcclxuICByZXR1cm4gJHVpYlRvb2x0aXAoJ3VpYlRvb2x0aXBIdG1sJywgJ3Rvb2x0aXAnLCAnbW91c2VlbnRlcicsIHtcclxuICAgIHVzZUNvbnRlbnRFeHA6IHRydWVcclxuICB9KTtcclxufV0pO1xyXG5cclxuLyoqXHJcbiAqIFRoZSBmb2xsb3dpbmcgZmVhdHVyZXMgYXJlIHN0aWxsIG91dHN0YW5kaW5nOiBwb3B1cCBkZWxheSwgYW5pbWF0aW9uIGFzIGFcclxuICogZnVuY3Rpb24sIHBsYWNlbWVudCBhcyBhIGZ1bmN0aW9uLCBpbnNpZGUsIHN1cHBvcnQgZm9yIG1vcmUgdHJpZ2dlcnMgdGhhblxyXG4gKiBqdXN0IG1vdXNlIGVudGVyL2xlYXZlLCBhbmQgc2VsZWN0b3IgZGVsZWdhdGF0aW9uLlxyXG4gKi9cclxuYW5ndWxhci5tb2R1bGUoJ3VpLmJvb3RzdHJhcC5wb3BvdmVyJywgWyd1aS5ib290c3RyYXAudG9vbHRpcCddKVxyXG5cclxuLmRpcmVjdGl2ZSgndWliUG9wb3ZlclRlbXBsYXRlUG9wdXAnLCBmdW5jdGlvbigpIHtcclxuICByZXR1cm4ge1xyXG4gICAgcmVzdHJpY3Q6ICdBJyxcclxuICAgIHNjb3BlOiB7IHVpYlRpdGxlOiAnQCcsIGNvbnRlbnRFeHA6ICcmJywgb3JpZ2luU2NvcGU6ICcmJyB9LFxyXG4gICAgdGVtcGxhdGVVcmw6ICd1aWIvdGVtcGxhdGUvcG9wb3Zlci9wb3BvdmVyLXRlbXBsYXRlLmh0bWwnXHJcbiAgfTtcclxufSlcclxuXHJcbi5kaXJlY3RpdmUoJ3VpYlBvcG92ZXJUZW1wbGF0ZScsIFsnJHVpYlRvb2x0aXAnLCBmdW5jdGlvbigkdWliVG9vbHRpcCkge1xyXG4gIHJldHVybiAkdWliVG9vbHRpcCgndWliUG9wb3ZlclRlbXBsYXRlJywgJ3BvcG92ZXInLCAnY2xpY2snLCB7XHJcbiAgICB1c2VDb250ZW50RXhwOiB0cnVlXHJcbiAgfSk7XHJcbn1dKVxyXG5cclxuLmRpcmVjdGl2ZSgndWliUG9wb3Zlckh0bWxQb3B1cCcsIGZ1bmN0aW9uKCkge1xyXG4gIHJldHVybiB7XHJcbiAgICByZXN0cmljdDogJ0EnLFxyXG4gICAgc2NvcGU6IHsgY29udGVudEV4cDogJyYnLCB1aWJUaXRsZTogJ0AnIH0sXHJcbiAgICB0ZW1wbGF0ZVVybDogJ3VpYi90ZW1wbGF0ZS9wb3BvdmVyL3BvcG92ZXItaHRtbC5odG1sJ1xyXG4gIH07XHJcbn0pXHJcblxyXG4uZGlyZWN0aXZlKCd1aWJQb3BvdmVySHRtbCcsIFsnJHVpYlRvb2x0aXAnLCBmdW5jdGlvbigkdWliVG9vbHRpcCkge1xyXG4gIHJldHVybiAkdWliVG9vbHRpcCgndWliUG9wb3Zlckh0bWwnLCAncG9wb3ZlcicsICdjbGljaycsIHtcclxuICAgIHVzZUNvbnRlbnRFeHA6IHRydWVcclxuICB9KTtcclxufV0pXHJcblxyXG4uZGlyZWN0aXZlKCd1aWJQb3BvdmVyUG9wdXAnLCBmdW5jdGlvbigpIHtcclxuICByZXR1cm4ge1xyXG4gICAgcmVzdHJpY3Q6ICdBJyxcclxuICAgIHNjb3BlOiB7IHVpYlRpdGxlOiAnQCcsIGNvbnRlbnQ6ICdAJyB9LFxyXG4gICAgdGVtcGxhdGVVcmw6ICd1aWIvdGVtcGxhdGUvcG9wb3Zlci9wb3BvdmVyLmh0bWwnXHJcbiAgfTtcclxufSlcclxuXHJcbi5kaXJlY3RpdmUoJ3VpYlBvcG92ZXInLCBbJyR1aWJUb29sdGlwJywgZnVuY3Rpb24oJHVpYlRvb2x0aXApIHtcclxuICByZXR1cm4gJHVpYlRvb2x0aXAoJ3VpYlBvcG92ZXInLCAncG9wb3ZlcicsICdjbGljaycpO1xyXG59XSk7XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgndWkuYm9vdHN0cmFwLnByb2dyZXNzYmFyJywgW10pXHJcblxyXG4uY29uc3RhbnQoJ3VpYlByb2dyZXNzQ29uZmlnJywge1xyXG4gIGFuaW1hdGU6IHRydWUsXHJcbiAgbWF4OiAxMDBcclxufSlcclxuXHJcbi5jb250cm9sbGVyKCdVaWJQcm9ncmVzc0NvbnRyb2xsZXInLCBbJyRzY29wZScsICckYXR0cnMnLCAndWliUHJvZ3Jlc3NDb25maWcnLCBmdW5jdGlvbigkc2NvcGUsICRhdHRycywgcHJvZ3Jlc3NDb25maWcpIHtcclxuICB2YXIgc2VsZiA9IHRoaXMsXHJcbiAgICAgIGFuaW1hdGUgPSBhbmd1bGFyLmlzRGVmaW5lZCgkYXR0cnMuYW5pbWF0ZSkgPyAkc2NvcGUuJHBhcmVudC4kZXZhbCgkYXR0cnMuYW5pbWF0ZSkgOiBwcm9ncmVzc0NvbmZpZy5hbmltYXRlO1xyXG5cclxuICB0aGlzLmJhcnMgPSBbXTtcclxuICAkc2NvcGUubWF4ID0gZ2V0TWF4T3JEZWZhdWx0KCk7XHJcblxyXG4gIHRoaXMuYWRkQmFyID0gZnVuY3Rpb24oYmFyLCBlbGVtZW50LCBhdHRycykge1xyXG4gICAgaWYgKCFhbmltYXRlKSB7XHJcbiAgICAgIGVsZW1lbnQuY3NzKHsndHJhbnNpdGlvbic6ICdub25lJ30pO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuYmFycy5wdXNoKGJhcik7XHJcblxyXG4gICAgYmFyLm1heCA9IGdldE1heE9yRGVmYXVsdCgpO1xyXG4gICAgYmFyLnRpdGxlID0gYXR0cnMgJiYgYW5ndWxhci5pc0RlZmluZWQoYXR0cnMudGl0bGUpID8gYXR0cnMudGl0bGUgOiAncHJvZ3Jlc3NiYXInO1xyXG5cclxuICAgIGJhci4kd2F0Y2goJ3ZhbHVlJywgZnVuY3Rpb24odmFsdWUpIHtcclxuICAgICAgYmFyLnJlY2FsY3VsYXRlUGVyY2VudGFnZSgpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgYmFyLnJlY2FsY3VsYXRlUGVyY2VudGFnZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICB2YXIgdG90YWxQZXJjZW50YWdlID0gc2VsZi5iYXJzLnJlZHVjZShmdW5jdGlvbih0b3RhbCwgYmFyKSB7XHJcbiAgICAgICAgYmFyLnBlcmNlbnQgPSArKDEwMCAqIGJhci52YWx1ZSAvIGJhci5tYXgpLnRvRml4ZWQoMik7XHJcbiAgICAgICAgcmV0dXJuIHRvdGFsICsgYmFyLnBlcmNlbnQ7XHJcbiAgICAgIH0sIDApO1xyXG5cclxuICAgICAgaWYgKHRvdGFsUGVyY2VudGFnZSA+IDEwMCkge1xyXG4gICAgICAgIGJhci5wZXJjZW50IC09IHRvdGFsUGVyY2VudGFnZSAtIDEwMDtcclxuICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICBiYXIuJG9uKCckZGVzdHJveScsIGZ1bmN0aW9uKCkge1xyXG4gICAgICBlbGVtZW50ID0gbnVsbDtcclxuICAgICAgc2VsZi5yZW1vdmVCYXIoYmFyKTtcclxuICAgIH0pO1xyXG4gIH07XHJcblxyXG4gIHRoaXMucmVtb3ZlQmFyID0gZnVuY3Rpb24oYmFyKSB7XHJcbiAgICB0aGlzLmJhcnMuc3BsaWNlKHRoaXMuYmFycy5pbmRleE9mKGJhciksIDEpO1xyXG4gICAgdGhpcy5iYXJzLmZvckVhY2goZnVuY3Rpb24gKGJhcikge1xyXG4gICAgICBiYXIucmVjYWxjdWxhdGVQZXJjZW50YWdlKCk7XHJcbiAgICB9KTtcclxuICB9O1xyXG5cclxuICAvLyRhdHRycy4kb2JzZXJ2ZSgnbWF4UGFyYW0nLCBmdW5jdGlvbihtYXhQYXJhbSkge1xyXG4gICRzY29wZS4kd2F0Y2goJ21heFBhcmFtJywgZnVuY3Rpb24obWF4UGFyYW0pIHtcclxuICAgIHNlbGYuYmFycy5mb3JFYWNoKGZ1bmN0aW9uKGJhcikge1xyXG4gICAgICBiYXIubWF4ID0gZ2V0TWF4T3JEZWZhdWx0KCk7XHJcbiAgICAgIGJhci5yZWNhbGN1bGF0ZVBlcmNlbnRhZ2UoKTtcclxuICAgIH0pO1xyXG4gIH0pO1xyXG5cclxuICBmdW5jdGlvbiBnZXRNYXhPckRlZmF1bHQgKCkge1xyXG4gICAgcmV0dXJuIGFuZ3VsYXIuaXNEZWZpbmVkKCRzY29wZS5tYXhQYXJhbSkgPyAkc2NvcGUubWF4UGFyYW0gOiBwcm9ncmVzc0NvbmZpZy5tYXg7XHJcbiAgfVxyXG59XSlcclxuXHJcbi5kaXJlY3RpdmUoJ3VpYlByb2dyZXNzJywgZnVuY3Rpb24oKSB7XHJcbiAgcmV0dXJuIHtcclxuICAgIHJlcGxhY2U6IHRydWUsXHJcbiAgICB0cmFuc2NsdWRlOiB0cnVlLFxyXG4gICAgY29udHJvbGxlcjogJ1VpYlByb2dyZXNzQ29udHJvbGxlcicsXHJcbiAgICByZXF1aXJlOiAndWliUHJvZ3Jlc3MnLFxyXG4gICAgc2NvcGU6IHtcclxuICAgICAgbWF4UGFyYW06ICc9P21heCdcclxuICAgIH0sXHJcbiAgICB0ZW1wbGF0ZVVybDogJ3VpYi90ZW1wbGF0ZS9wcm9ncmVzc2Jhci9wcm9ncmVzcy5odG1sJ1xyXG4gIH07XHJcbn0pXHJcblxyXG4uZGlyZWN0aXZlKCd1aWJCYXInLCBmdW5jdGlvbigpIHtcclxuICByZXR1cm4ge1xyXG4gICAgcmVwbGFjZTogdHJ1ZSxcclxuICAgIHRyYW5zY2x1ZGU6IHRydWUsXHJcbiAgICByZXF1aXJlOiAnXnVpYlByb2dyZXNzJyxcclxuICAgIHNjb3BlOiB7XHJcbiAgICAgIHZhbHVlOiAnPScsXHJcbiAgICAgIHR5cGU6ICdAJ1xyXG4gICAgfSxcclxuICAgIHRlbXBsYXRlVXJsOiAndWliL3RlbXBsYXRlL3Byb2dyZXNzYmFyL2Jhci5odG1sJyxcclxuICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBlbGVtZW50LCBhdHRycywgcHJvZ3Jlc3NDdHJsKSB7XHJcbiAgICAgIHByb2dyZXNzQ3RybC5hZGRCYXIoc2NvcGUsIGVsZW1lbnQsIGF0dHJzKTtcclxuICAgIH1cclxuICB9O1xyXG59KVxyXG5cclxuLmRpcmVjdGl2ZSgndWliUHJvZ3Jlc3NiYXInLCBmdW5jdGlvbigpIHtcclxuICByZXR1cm4ge1xyXG4gICAgcmVwbGFjZTogdHJ1ZSxcclxuICAgIHRyYW5zY2x1ZGU6IHRydWUsXHJcbiAgICBjb250cm9sbGVyOiAnVWliUHJvZ3Jlc3NDb250cm9sbGVyJyxcclxuICAgIHNjb3BlOiB7XHJcbiAgICAgIHZhbHVlOiAnPScsXHJcbiAgICAgIG1heFBhcmFtOiAnPT9tYXgnLFxyXG4gICAgICB0eXBlOiAnQCdcclxuICAgIH0sXHJcbiAgICB0ZW1wbGF0ZVVybDogJ3VpYi90ZW1wbGF0ZS9wcm9ncmVzc2Jhci9wcm9ncmVzc2Jhci5odG1sJyxcclxuICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBlbGVtZW50LCBhdHRycywgcHJvZ3Jlc3NDdHJsKSB7XHJcbiAgICAgIHByb2dyZXNzQ3RybC5hZGRCYXIoc2NvcGUsIGFuZ3VsYXIuZWxlbWVudChlbGVtZW50LmNoaWxkcmVuKClbMF0pLCB7dGl0bGU6IGF0dHJzLnRpdGxlfSk7XHJcbiAgICB9XHJcbiAgfTtcclxufSk7XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgndWkuYm9vdHN0cmFwLnJhdGluZycsIFtdKVxyXG5cclxuLmNvbnN0YW50KCd1aWJSYXRpbmdDb25maWcnLCB7XHJcbiAgbWF4OiA1LFxyXG4gIHN0YXRlT246IG51bGwsXHJcbiAgc3RhdGVPZmY6IG51bGwsXHJcbiAgZW5hYmxlUmVzZXQ6IHRydWUsXHJcbiAgdGl0bGVzOiBbJ29uZScsICd0d28nLCAndGhyZWUnLCAnZm91cicsICdmaXZlJ11cclxufSlcclxuXHJcbi5jb250cm9sbGVyKCdVaWJSYXRpbmdDb250cm9sbGVyJywgWyckc2NvcGUnLCAnJGF0dHJzJywgJ3VpYlJhdGluZ0NvbmZpZycsIGZ1bmN0aW9uKCRzY29wZSwgJGF0dHJzLCByYXRpbmdDb25maWcpIHtcclxuICB2YXIgbmdNb2RlbEN0cmwgPSB7ICRzZXRWaWV3VmFsdWU6IGFuZ3VsYXIubm9vcCB9LFxyXG4gICAgc2VsZiA9IHRoaXM7XHJcblxyXG4gIHRoaXMuaW5pdCA9IGZ1bmN0aW9uKG5nTW9kZWxDdHJsXykge1xyXG4gICAgbmdNb2RlbEN0cmwgPSBuZ01vZGVsQ3RybF87XHJcbiAgICBuZ01vZGVsQ3RybC4kcmVuZGVyID0gdGhpcy5yZW5kZXI7XHJcblxyXG4gICAgbmdNb2RlbEN0cmwuJGZvcm1hdHRlcnMucHVzaChmdW5jdGlvbih2YWx1ZSkge1xyXG4gICAgICBpZiAoYW5ndWxhci5pc051bWJlcih2YWx1ZSkgJiYgdmFsdWUgPDwgMCAhPT0gdmFsdWUpIHtcclxuICAgICAgICB2YWx1ZSA9IE1hdGgucm91bmQodmFsdWUpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4gdmFsdWU7XHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLnN0YXRlT24gPSBhbmd1bGFyLmlzRGVmaW5lZCgkYXR0cnMuc3RhdGVPbikgPyAkc2NvcGUuJHBhcmVudC4kZXZhbCgkYXR0cnMuc3RhdGVPbikgOiByYXRpbmdDb25maWcuc3RhdGVPbjtcclxuICAgIHRoaXMuc3RhdGVPZmYgPSBhbmd1bGFyLmlzRGVmaW5lZCgkYXR0cnMuc3RhdGVPZmYpID8gJHNjb3BlLiRwYXJlbnQuJGV2YWwoJGF0dHJzLnN0YXRlT2ZmKSA6IHJhdGluZ0NvbmZpZy5zdGF0ZU9mZjtcclxuICAgIHRoaXMuZW5hYmxlUmVzZXQgPSBhbmd1bGFyLmlzRGVmaW5lZCgkYXR0cnMuZW5hYmxlUmVzZXQpID9cclxuICAgICAgJHNjb3BlLiRwYXJlbnQuJGV2YWwoJGF0dHJzLmVuYWJsZVJlc2V0KSA6IHJhdGluZ0NvbmZpZy5lbmFibGVSZXNldDtcclxuICAgIHZhciB0bXBUaXRsZXMgPSBhbmd1bGFyLmlzRGVmaW5lZCgkYXR0cnMudGl0bGVzKSA/ICRzY29wZS4kcGFyZW50LiRldmFsKCRhdHRycy50aXRsZXMpIDogcmF0aW5nQ29uZmlnLnRpdGxlcztcclxuICAgIHRoaXMudGl0bGVzID0gYW5ndWxhci5pc0FycmF5KHRtcFRpdGxlcykgJiYgdG1wVGl0bGVzLmxlbmd0aCA+IDAgP1xyXG4gICAgICB0bXBUaXRsZXMgOiByYXRpbmdDb25maWcudGl0bGVzO1xyXG5cclxuICAgIHZhciByYXRpbmdTdGF0ZXMgPSBhbmd1bGFyLmlzRGVmaW5lZCgkYXR0cnMucmF0aW5nU3RhdGVzKSA/XHJcbiAgICAgICRzY29wZS4kcGFyZW50LiRldmFsKCRhdHRycy5yYXRpbmdTdGF0ZXMpIDpcclxuICAgICAgbmV3IEFycmF5KGFuZ3VsYXIuaXNEZWZpbmVkKCRhdHRycy5tYXgpID8gJHNjb3BlLiRwYXJlbnQuJGV2YWwoJGF0dHJzLm1heCkgOiByYXRpbmdDb25maWcubWF4KTtcclxuICAgICRzY29wZS5yYW5nZSA9IHRoaXMuYnVpbGRUZW1wbGF0ZU9iamVjdHMocmF0aW5nU3RhdGVzKTtcclxuICB9O1xyXG5cclxuICB0aGlzLmJ1aWxkVGVtcGxhdGVPYmplY3RzID0gZnVuY3Rpb24oc3RhdGVzKSB7XHJcbiAgICBmb3IgKHZhciBpID0gMCwgbiA9IHN0YXRlcy5sZW5ndGg7IGkgPCBuOyBpKyspIHtcclxuICAgICAgc3RhdGVzW2ldID0gYW5ndWxhci5leHRlbmQoeyBpbmRleDogaSB9LCB7IHN0YXRlT246IHRoaXMuc3RhdGVPbiwgc3RhdGVPZmY6IHRoaXMuc3RhdGVPZmYsIHRpdGxlOiB0aGlzLmdldFRpdGxlKGkpIH0sIHN0YXRlc1tpXSk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gc3RhdGVzO1xyXG4gIH07XHJcblxyXG4gIHRoaXMuZ2V0VGl0bGUgPSBmdW5jdGlvbihpbmRleCkge1xyXG4gICAgaWYgKGluZGV4ID49IHRoaXMudGl0bGVzLmxlbmd0aCkge1xyXG4gICAgICByZXR1cm4gaW5kZXggKyAxO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0aGlzLnRpdGxlc1tpbmRleF07XHJcbiAgfTtcclxuXHJcbiAgJHNjb3BlLnJhdGUgPSBmdW5jdGlvbih2YWx1ZSkge1xyXG4gICAgaWYgKCEkc2NvcGUucmVhZG9ubHkgJiYgdmFsdWUgPj0gMCAmJiB2YWx1ZSA8PSAkc2NvcGUucmFuZ2UubGVuZ3RoKSB7XHJcbiAgICAgIHZhciBuZXdWaWV3VmFsdWUgPSBzZWxmLmVuYWJsZVJlc2V0ICYmIG5nTW9kZWxDdHJsLiR2aWV3VmFsdWUgPT09IHZhbHVlID8gMCA6IHZhbHVlO1xyXG4gICAgICBuZ01vZGVsQ3RybC4kc2V0Vmlld1ZhbHVlKG5ld1ZpZXdWYWx1ZSk7XHJcbiAgICAgIG5nTW9kZWxDdHJsLiRyZW5kZXIoKTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICAkc2NvcGUuZW50ZXIgPSBmdW5jdGlvbih2YWx1ZSkge1xyXG4gICAgaWYgKCEkc2NvcGUucmVhZG9ubHkpIHtcclxuICAgICAgJHNjb3BlLnZhbHVlID0gdmFsdWU7XHJcbiAgICB9XHJcbiAgICAkc2NvcGUub25Ib3Zlcih7dmFsdWU6IHZhbHVlfSk7XHJcbiAgfTtcclxuXHJcbiAgJHNjb3BlLnJlc2V0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAkc2NvcGUudmFsdWUgPSBuZ01vZGVsQ3RybC4kdmlld1ZhbHVlO1xyXG4gICAgJHNjb3BlLm9uTGVhdmUoKTtcclxuICB9O1xyXG5cclxuICAkc2NvcGUub25LZXlkb3duID0gZnVuY3Rpb24oZXZ0KSB7XHJcbiAgICBpZiAoLygzN3wzOHwzOXw0MCkvLnRlc3QoZXZ0LndoaWNoKSkge1xyXG4gICAgICBldnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgZXZ0LnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAkc2NvcGUucmF0ZSgkc2NvcGUudmFsdWUgKyAoZXZ0LndoaWNoID09PSAzOCB8fCBldnQud2hpY2ggPT09IDM5ID8gMSA6IC0xKSk7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgdGhpcy5yZW5kZXIgPSBmdW5jdGlvbigpIHtcclxuICAgICRzY29wZS52YWx1ZSA9IG5nTW9kZWxDdHJsLiR2aWV3VmFsdWU7XHJcbiAgICAkc2NvcGUudGl0bGUgPSBzZWxmLmdldFRpdGxlKCRzY29wZS52YWx1ZSAtIDEpO1xyXG4gIH07XHJcbn1dKVxyXG5cclxuLmRpcmVjdGl2ZSgndWliUmF0aW5nJywgZnVuY3Rpb24oKSB7XHJcbiAgcmV0dXJuIHtcclxuICAgIHJlcXVpcmU6IFsndWliUmF0aW5nJywgJ25nTW9kZWwnXSxcclxuICAgIHJlc3RyaWN0OiAnQScsXHJcbiAgICBzY29wZToge1xyXG4gICAgICByZWFkb25seTogJz0/cmVhZE9ubHknLFxyXG4gICAgICBvbkhvdmVyOiAnJicsXHJcbiAgICAgIG9uTGVhdmU6ICcmJ1xyXG4gICAgfSxcclxuICAgIGNvbnRyb2xsZXI6ICdVaWJSYXRpbmdDb250cm9sbGVyJyxcclxuICAgIHRlbXBsYXRlVXJsOiAndWliL3RlbXBsYXRlL3JhdGluZy9yYXRpbmcuaHRtbCcsXHJcbiAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxlbWVudCwgYXR0cnMsIGN0cmxzKSB7XHJcbiAgICAgIHZhciByYXRpbmdDdHJsID0gY3RybHNbMF0sIG5nTW9kZWxDdHJsID0gY3RybHNbMV07XHJcbiAgICAgIHJhdGluZ0N0cmwuaW5pdChuZ01vZGVsQ3RybCk7XHJcbiAgICB9XHJcbiAgfTtcclxufSk7XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgndWkuYm9vdHN0cmFwLnRhYnMnLCBbXSlcclxuXHJcbi5jb250cm9sbGVyKCdVaWJUYWJzZXRDb250cm9sbGVyJywgWyckc2NvcGUnLCBmdW5jdGlvbiAoJHNjb3BlKSB7XHJcbiAgdmFyIGN0cmwgPSB0aGlzLFxyXG4gICAgb2xkSW5kZXg7XHJcbiAgY3RybC50YWJzID0gW107XHJcblxyXG4gIGN0cmwuc2VsZWN0ID0gZnVuY3Rpb24oaW5kZXgsIGV2dCkge1xyXG4gICAgaWYgKCFkZXN0cm95ZWQpIHtcclxuICAgICAgdmFyIHByZXZpb3VzSW5kZXggPSBmaW5kVGFiSW5kZXgob2xkSW5kZXgpO1xyXG4gICAgICB2YXIgcHJldmlvdXNTZWxlY3RlZCA9IGN0cmwudGFic1twcmV2aW91c0luZGV4XTtcclxuICAgICAgaWYgKHByZXZpb3VzU2VsZWN0ZWQpIHtcclxuICAgICAgICBwcmV2aW91c1NlbGVjdGVkLnRhYi5vbkRlc2VsZWN0KHtcclxuICAgICAgICAgICRldmVudDogZXZ0LFxyXG4gICAgICAgICAgJHNlbGVjdGVkSW5kZXg6IGluZGV4XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgaWYgKGV2dCAmJiBldnQuaXNEZWZhdWx0UHJldmVudGVkKCkpIHtcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgcHJldmlvdXNTZWxlY3RlZC50YWIuYWN0aXZlID0gZmFsc2U7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHZhciBzZWxlY3RlZCA9IGN0cmwudGFic1tpbmRleF07XHJcbiAgICAgIGlmIChzZWxlY3RlZCkge1xyXG4gICAgICAgIHNlbGVjdGVkLnRhYi5vblNlbGVjdCh7XHJcbiAgICAgICAgICAkZXZlbnQ6IGV2dFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHNlbGVjdGVkLnRhYi5hY3RpdmUgPSB0cnVlO1xyXG4gICAgICAgIGN0cmwuYWN0aXZlID0gc2VsZWN0ZWQuaW5kZXg7XHJcbiAgICAgICAgb2xkSW5kZXggPSBzZWxlY3RlZC5pbmRleDtcclxuICAgICAgfSBlbHNlIGlmICghc2VsZWN0ZWQgJiYgYW5ndWxhci5pc0RlZmluZWQob2xkSW5kZXgpKSB7XHJcbiAgICAgICAgY3RybC5hY3RpdmUgPSBudWxsO1xyXG4gICAgICAgIG9sZEluZGV4ID0gbnVsbDtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIGN0cmwuYWRkVGFiID0gZnVuY3Rpb24gYWRkVGFiKHRhYikge1xyXG4gICAgY3RybC50YWJzLnB1c2goe1xyXG4gICAgICB0YWI6IHRhYixcclxuICAgICAgaW5kZXg6IHRhYi5pbmRleFxyXG4gICAgfSk7XHJcbiAgICBjdHJsLnRhYnMuc29ydChmdW5jdGlvbih0MSwgdDIpIHtcclxuICAgICAgaWYgKHQxLmluZGV4ID4gdDIuaW5kZXgpIHtcclxuICAgICAgICByZXR1cm4gMTtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKHQxLmluZGV4IDwgdDIuaW5kZXgpIHtcclxuICAgICAgICByZXR1cm4gLTE7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiAwO1xyXG4gICAgfSk7XHJcblxyXG4gICAgaWYgKHRhYi5pbmRleCA9PT0gY3RybC5hY3RpdmUgfHwgIWFuZ3VsYXIuaXNEZWZpbmVkKGN0cmwuYWN0aXZlKSAmJiBjdHJsLnRhYnMubGVuZ3RoID09PSAxKSB7XHJcbiAgICAgIHZhciBuZXdBY3RpdmVJbmRleCA9IGZpbmRUYWJJbmRleCh0YWIuaW5kZXgpO1xyXG4gICAgICBjdHJsLnNlbGVjdChuZXdBY3RpdmVJbmRleCk7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgY3RybC5yZW1vdmVUYWIgPSBmdW5jdGlvbiByZW1vdmVUYWIodGFiKSB7XHJcbiAgICB2YXIgaW5kZXg7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGN0cmwudGFicy5sZW5ndGg7IGkrKykge1xyXG4gICAgICBpZiAoY3RybC50YWJzW2ldLnRhYiA9PT0gdGFiKSB7XHJcbiAgICAgICAgaW5kZXggPSBpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGN0cmwudGFic1tpbmRleF0uaW5kZXggPT09IGN0cmwuYWN0aXZlKSB7XHJcbiAgICAgIHZhciBuZXdBY3RpdmVUYWJJbmRleCA9IGluZGV4ID09PSBjdHJsLnRhYnMubGVuZ3RoIC0gMSA/XHJcbiAgICAgICAgaW5kZXggLSAxIDogaW5kZXggKyAxICUgY3RybC50YWJzLmxlbmd0aDtcclxuICAgICAgY3RybC5zZWxlY3QobmV3QWN0aXZlVGFiSW5kZXgpO1xyXG4gICAgfVxyXG5cclxuICAgIGN0cmwudGFicy5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gIH07XHJcblxyXG4gICRzY29wZS4kd2F0Y2goJ3RhYnNldC5hY3RpdmUnLCBmdW5jdGlvbih2YWwpIHtcclxuICAgIGlmIChhbmd1bGFyLmlzRGVmaW5lZCh2YWwpICYmIHZhbCAhPT0gb2xkSW5kZXgpIHtcclxuICAgICAgY3RybC5zZWxlY3QoZmluZFRhYkluZGV4KHZhbCkpO1xyXG4gICAgfVxyXG4gIH0pO1xyXG5cclxuICB2YXIgZGVzdHJveWVkO1xyXG4gICRzY29wZS4kb24oJyRkZXN0cm95JywgZnVuY3Rpb24oKSB7XHJcbiAgICBkZXN0cm95ZWQgPSB0cnVlO1xyXG4gIH0pO1xyXG5cclxuICBmdW5jdGlvbiBmaW5kVGFiSW5kZXgoaW5kZXgpIHtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY3RybC50YWJzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIGlmIChjdHJsLnRhYnNbaV0uaW5kZXggPT09IGluZGV4KSB7XHJcbiAgICAgICAgcmV0dXJuIGk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbn1dKVxyXG5cclxuLmRpcmVjdGl2ZSgndWliVGFic2V0JywgZnVuY3Rpb24oKSB7XHJcbiAgcmV0dXJuIHtcclxuICAgIHRyYW5zY2x1ZGU6IHRydWUsXHJcbiAgICByZXBsYWNlOiB0cnVlLFxyXG4gICAgc2NvcGU6IHt9LFxyXG4gICAgYmluZFRvQ29udHJvbGxlcjoge1xyXG4gICAgICBhY3RpdmU6ICc9PycsXHJcbiAgICAgIHR5cGU6ICdAJ1xyXG4gICAgfSxcclxuICAgIGNvbnRyb2xsZXI6ICdVaWJUYWJzZXRDb250cm9sbGVyJyxcclxuICAgIGNvbnRyb2xsZXJBczogJ3RhYnNldCcsXHJcbiAgICB0ZW1wbGF0ZVVybDogZnVuY3Rpb24oZWxlbWVudCwgYXR0cnMpIHtcclxuICAgICAgcmV0dXJuIGF0dHJzLnRlbXBsYXRlVXJsIHx8ICd1aWIvdGVtcGxhdGUvdGFicy90YWJzZXQuaHRtbCc7XHJcbiAgICB9LFxyXG4gICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsZW1lbnQsIGF0dHJzKSB7XHJcbiAgICAgIHNjb3BlLnZlcnRpY2FsID0gYW5ndWxhci5pc0RlZmluZWQoYXR0cnMudmVydGljYWwpID9cclxuICAgICAgICBzY29wZS4kcGFyZW50LiRldmFsKGF0dHJzLnZlcnRpY2FsKSA6IGZhbHNlO1xyXG4gICAgICBzY29wZS5qdXN0aWZpZWQgPSBhbmd1bGFyLmlzRGVmaW5lZChhdHRycy5qdXN0aWZpZWQpID9cclxuICAgICAgICBzY29wZS4kcGFyZW50LiRldmFsKGF0dHJzLmp1c3RpZmllZCkgOiBmYWxzZTtcclxuICAgIH1cclxuICB9O1xyXG59KVxyXG5cclxuLmRpcmVjdGl2ZSgndWliVGFiJywgWyckcGFyc2UnLCBmdW5jdGlvbigkcGFyc2UpIHtcclxuICByZXR1cm4ge1xyXG4gICAgcmVxdWlyZTogJ151aWJUYWJzZXQnLFxyXG4gICAgcmVwbGFjZTogdHJ1ZSxcclxuICAgIHRlbXBsYXRlVXJsOiBmdW5jdGlvbihlbGVtZW50LCBhdHRycykge1xyXG4gICAgICByZXR1cm4gYXR0cnMudGVtcGxhdGVVcmwgfHwgJ3VpYi90ZW1wbGF0ZS90YWJzL3RhYi5odG1sJztcclxuICAgIH0sXHJcbiAgICB0cmFuc2NsdWRlOiB0cnVlLFxyXG4gICAgc2NvcGU6IHtcclxuICAgICAgaGVhZGluZzogJ0AnLFxyXG4gICAgICBpbmRleDogJz0/JyxcclxuICAgICAgY2xhc3NlczogJ0A/JyxcclxuICAgICAgb25TZWxlY3Q6ICcmc2VsZWN0JywgLy9UaGlzIGNhbGxiYWNrIGlzIGNhbGxlZCBpbiBjb250ZW50SGVhZGluZ1RyYW5zY2x1ZGVcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAvL29uY2UgaXQgaW5zZXJ0cyB0aGUgdGFiJ3MgY29udGVudCBpbnRvIHRoZSBkb21cclxuICAgICAgb25EZXNlbGVjdDogJyZkZXNlbGVjdCdcclxuICAgIH0sXHJcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbigpIHtcclxuICAgICAgLy9FbXB0eSBjb250cm9sbGVyIHNvIG90aGVyIGRpcmVjdGl2ZXMgY2FuIHJlcXVpcmUgYmVpbmcgJ3VuZGVyJyBhIHRhYlxyXG4gICAgfSxcclxuICAgIGNvbnRyb2xsZXJBczogJ3RhYicsXHJcbiAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxtLCBhdHRycywgdGFic2V0Q3RybCwgdHJhbnNjbHVkZSkge1xyXG4gICAgICBzY29wZS5kaXNhYmxlZCA9IGZhbHNlO1xyXG4gICAgICBpZiAoYXR0cnMuZGlzYWJsZSkge1xyXG4gICAgICAgIHNjb3BlLiRwYXJlbnQuJHdhdGNoKCRwYXJzZShhdHRycy5kaXNhYmxlKSwgZnVuY3Rpb24odmFsdWUpIHtcclxuICAgICAgICAgIHNjb3BlLmRpc2FibGVkID0gISEgdmFsdWU7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChhbmd1bGFyLmlzVW5kZWZpbmVkKGF0dHJzLmluZGV4KSkge1xyXG4gICAgICAgIGlmICh0YWJzZXRDdHJsLnRhYnMgJiYgdGFic2V0Q3RybC50YWJzLmxlbmd0aCkge1xyXG4gICAgICAgICAgc2NvcGUuaW5kZXggPSBNYXRoLm1heC5hcHBseShudWxsLCB0YWJzZXRDdHJsLnRhYnMubWFwKGZ1bmN0aW9uKHQpIHsgcmV0dXJuIHQuaW5kZXg7IH0pKSArIDE7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHNjb3BlLmluZGV4ID0gMDtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChhbmd1bGFyLmlzVW5kZWZpbmVkKGF0dHJzLmNsYXNzZXMpKSB7XHJcbiAgICAgICAgc2NvcGUuY2xhc3NlcyA9ICcnO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBzY29wZS5zZWxlY3QgPSBmdW5jdGlvbihldnQpIHtcclxuICAgICAgICBpZiAoIXNjb3BlLmRpc2FibGVkKSB7XHJcbiAgICAgICAgICB2YXIgaW5kZXg7XHJcbiAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRhYnNldEN0cmwudGFicy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBpZiAodGFic2V0Q3RybC50YWJzW2ldLnRhYiA9PT0gc2NvcGUpIHtcclxuICAgICAgICAgICAgICBpbmRleCA9IGk7XHJcbiAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICB0YWJzZXRDdHJsLnNlbGVjdChpbmRleCwgZXZ0KTtcclxuICAgICAgICB9XHJcbiAgICAgIH07XHJcblxyXG4gICAgICB0YWJzZXRDdHJsLmFkZFRhYihzY29wZSk7XHJcbiAgICAgIHNjb3BlLiRvbignJGRlc3Ryb3knLCBmdW5jdGlvbigpIHtcclxuICAgICAgICB0YWJzZXRDdHJsLnJlbW92ZVRhYihzY29wZSk7XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgLy9XZSBuZWVkIHRvIHRyYW5zY2x1ZGUgbGF0ZXIsIG9uY2UgdGhlIGNvbnRlbnQgY29udGFpbmVyIGlzIHJlYWR5LlxyXG4gICAgICAvL3doZW4gdGhpcyBsaW5rIGhhcHBlbnMsIHdlJ3JlIGluc2lkZSBhIHRhYiBoZWFkaW5nLlxyXG4gICAgICBzY29wZS4kdHJhbnNjbHVkZUZuID0gdHJhbnNjbHVkZTtcclxuICAgIH1cclxuICB9O1xyXG59XSlcclxuXHJcbi5kaXJlY3RpdmUoJ3VpYlRhYkhlYWRpbmdUcmFuc2NsdWRlJywgZnVuY3Rpb24oKSB7XHJcbiAgcmV0dXJuIHtcclxuICAgIHJlc3RyaWN0OiAnQScsXHJcbiAgICByZXF1aXJlOiAnXnVpYlRhYicsXHJcbiAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxtKSB7XHJcbiAgICAgIHNjb3BlLiR3YXRjaCgnaGVhZGluZ0VsZW1lbnQnLCBmdW5jdGlvbiB1cGRhdGVIZWFkaW5nRWxlbWVudChoZWFkaW5nKSB7XHJcbiAgICAgICAgaWYgKGhlYWRpbmcpIHtcclxuICAgICAgICAgIGVsbS5odG1sKCcnKTtcclxuICAgICAgICAgIGVsbS5hcHBlbmQoaGVhZGluZyk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgIH1cclxuICB9O1xyXG59KVxyXG5cclxuLmRpcmVjdGl2ZSgndWliVGFiQ29udGVudFRyYW5zY2x1ZGUnLCBmdW5jdGlvbigpIHtcclxuICByZXR1cm4ge1xyXG4gICAgcmVzdHJpY3Q6ICdBJyxcclxuICAgIHJlcXVpcmU6ICdedWliVGFic2V0JyxcclxuICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBlbG0sIGF0dHJzKSB7XHJcbiAgICAgIHZhciB0YWIgPSBzY29wZS4kZXZhbChhdHRycy51aWJUYWJDb250ZW50VHJhbnNjbHVkZSkudGFiO1xyXG5cclxuICAgICAgLy9Ob3cgb3VyIHRhYiBpcyByZWFkeSB0byBiZSB0cmFuc2NsdWRlZDogYm90aCB0aGUgdGFiIGhlYWRpbmcgYXJlYVxyXG4gICAgICAvL2FuZCB0aGUgdGFiIGNvbnRlbnQgYXJlYSBhcmUgbG9hZGVkLiAgVHJhbnNjbHVkZSAnZW0gYm90aC5cclxuICAgICAgdGFiLiR0cmFuc2NsdWRlRm4odGFiLiRwYXJlbnQsIGZ1bmN0aW9uKGNvbnRlbnRzKSB7XHJcbiAgICAgICAgYW5ndWxhci5mb3JFYWNoKGNvbnRlbnRzLCBmdW5jdGlvbihub2RlKSB7XHJcbiAgICAgICAgICBpZiAoaXNUYWJIZWFkaW5nKG5vZGUpKSB7XHJcbiAgICAgICAgICAgIC8vTGV0IHRhYkhlYWRpbmdUcmFuc2NsdWRlIGtub3cuXHJcbiAgICAgICAgICAgIHRhYi5oZWFkaW5nRWxlbWVudCA9IG5vZGU7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBlbG0uYXBwZW5kKG5vZGUpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICBmdW5jdGlvbiBpc1RhYkhlYWRpbmcobm9kZSkge1xyXG4gICAgcmV0dXJuIG5vZGUudGFnTmFtZSAmJiAoXHJcbiAgICAgIG5vZGUuaGFzQXR0cmlidXRlKCd1aWItdGFiLWhlYWRpbmcnKSB8fFxyXG4gICAgICBub2RlLmhhc0F0dHJpYnV0ZSgnZGF0YS11aWItdGFiLWhlYWRpbmcnKSB8fFxyXG4gICAgICBub2RlLmhhc0F0dHJpYnV0ZSgneC11aWItdGFiLWhlYWRpbmcnKSB8fFxyXG4gICAgICBub2RlLnRhZ05hbWUudG9Mb3dlckNhc2UoKSA9PT0gJ3VpYi10YWItaGVhZGluZycgfHxcclxuICAgICAgbm9kZS50YWdOYW1lLnRvTG93ZXJDYXNlKCkgPT09ICdkYXRhLXVpYi10YWItaGVhZGluZycgfHxcclxuICAgICAgbm9kZS50YWdOYW1lLnRvTG93ZXJDYXNlKCkgPT09ICd4LXVpYi10YWItaGVhZGluZycgfHxcclxuICAgICAgbm9kZS50YWdOYW1lLnRvTG93ZXJDYXNlKCkgPT09ICd1aWI6dGFiLWhlYWRpbmcnXHJcbiAgICApO1xyXG4gIH1cclxufSk7XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgndWkuYm9vdHN0cmFwLnRpbWVwaWNrZXInLCBbXSlcclxuXHJcbi5jb25zdGFudCgndWliVGltZXBpY2tlckNvbmZpZycsIHtcclxuICBob3VyU3RlcDogMSxcclxuICBtaW51dGVTdGVwOiAxLFxyXG4gIHNlY29uZFN0ZXA6IDEsXHJcbiAgc2hvd01lcmlkaWFuOiB0cnVlLFxyXG4gIHNob3dTZWNvbmRzOiBmYWxzZSxcclxuICBtZXJpZGlhbnM6IG51bGwsXHJcbiAgcmVhZG9ubHlJbnB1dDogZmFsc2UsXHJcbiAgbW91c2V3aGVlbDogdHJ1ZSxcclxuICBhcnJvd2tleXM6IHRydWUsXHJcbiAgc2hvd1NwaW5uZXJzOiB0cnVlLFxyXG4gIHRlbXBsYXRlVXJsOiAndWliL3RlbXBsYXRlL3RpbWVwaWNrZXIvdGltZXBpY2tlci5odG1sJ1xyXG59KVxyXG5cclxuLmNvbnRyb2xsZXIoJ1VpYlRpbWVwaWNrZXJDb250cm9sbGVyJywgWyckc2NvcGUnLCAnJGVsZW1lbnQnLCAnJGF0dHJzJywgJyRwYXJzZScsICckbG9nJywgJyRsb2NhbGUnLCAndWliVGltZXBpY2tlckNvbmZpZycsIGZ1bmN0aW9uKCRzY29wZSwgJGVsZW1lbnQsICRhdHRycywgJHBhcnNlLCAkbG9nLCAkbG9jYWxlLCB0aW1lcGlja2VyQ29uZmlnKSB7XHJcbiAgdmFyIHNlbGVjdGVkID0gbmV3IERhdGUoKSxcclxuICAgIHdhdGNoZXJzID0gW10sXHJcbiAgICBuZ01vZGVsQ3RybCA9IHsgJHNldFZpZXdWYWx1ZTogYW5ndWxhci5ub29wIH0sIC8vIG51bGxNb2RlbEN0cmxcclxuICAgIG1lcmlkaWFucyA9IGFuZ3VsYXIuaXNEZWZpbmVkKCRhdHRycy5tZXJpZGlhbnMpID8gJHNjb3BlLiRwYXJlbnQuJGV2YWwoJGF0dHJzLm1lcmlkaWFucykgOiB0aW1lcGlja2VyQ29uZmlnLm1lcmlkaWFucyB8fCAkbG9jYWxlLkRBVEVUSU1FX0ZPUk1BVFMuQU1QTVMsXHJcbiAgICBwYWRIb3VycyA9IGFuZ3VsYXIuaXNEZWZpbmVkKCRhdHRycy5wYWRIb3VycykgPyAkc2NvcGUuJHBhcmVudC4kZXZhbCgkYXR0cnMucGFkSG91cnMpIDogdHJ1ZTtcclxuXHJcbiAgJHNjb3BlLnRhYmluZGV4ID0gYW5ndWxhci5pc0RlZmluZWQoJGF0dHJzLnRhYmluZGV4KSA/ICRhdHRycy50YWJpbmRleCA6IDA7XHJcbiAgJGVsZW1lbnQucmVtb3ZlQXR0cigndGFiaW5kZXgnKTtcclxuXHJcbiAgdGhpcy5pbml0ID0gZnVuY3Rpb24obmdNb2RlbEN0cmxfLCBpbnB1dHMpIHtcclxuICAgIG5nTW9kZWxDdHJsID0gbmdNb2RlbEN0cmxfO1xyXG4gICAgbmdNb2RlbEN0cmwuJHJlbmRlciA9IHRoaXMucmVuZGVyO1xyXG5cclxuICAgIG5nTW9kZWxDdHJsLiRmb3JtYXR0ZXJzLnVuc2hpZnQoZnVuY3Rpb24obW9kZWxWYWx1ZSkge1xyXG4gICAgICByZXR1cm4gbW9kZWxWYWx1ZSA/IG5ldyBEYXRlKG1vZGVsVmFsdWUpIDogbnVsbDtcclxuICAgIH0pO1xyXG5cclxuICAgIHZhciBob3Vyc0lucHV0RWwgPSBpbnB1dHMuZXEoMCksXHJcbiAgICAgICAgbWludXRlc0lucHV0RWwgPSBpbnB1dHMuZXEoMSksXHJcbiAgICAgICAgc2Vjb25kc0lucHV0RWwgPSBpbnB1dHMuZXEoMik7XHJcblxyXG4gICAgdmFyIG1vdXNld2hlZWwgPSBhbmd1bGFyLmlzRGVmaW5lZCgkYXR0cnMubW91c2V3aGVlbCkgPyAkc2NvcGUuJHBhcmVudC4kZXZhbCgkYXR0cnMubW91c2V3aGVlbCkgOiB0aW1lcGlja2VyQ29uZmlnLm1vdXNld2hlZWw7XHJcblxyXG4gICAgaWYgKG1vdXNld2hlZWwpIHtcclxuICAgICAgdGhpcy5zZXR1cE1vdXNld2hlZWxFdmVudHMoaG91cnNJbnB1dEVsLCBtaW51dGVzSW5wdXRFbCwgc2Vjb25kc0lucHV0RWwpO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBhcnJvd2tleXMgPSBhbmd1bGFyLmlzRGVmaW5lZCgkYXR0cnMuYXJyb3drZXlzKSA/ICRzY29wZS4kcGFyZW50LiRldmFsKCRhdHRycy5hcnJvd2tleXMpIDogdGltZXBpY2tlckNvbmZpZy5hcnJvd2tleXM7XHJcbiAgICBpZiAoYXJyb3drZXlzKSB7XHJcbiAgICAgIHRoaXMuc2V0dXBBcnJvd2tleUV2ZW50cyhob3Vyc0lucHV0RWwsIG1pbnV0ZXNJbnB1dEVsLCBzZWNvbmRzSW5wdXRFbCk7XHJcbiAgICB9XHJcblxyXG4gICAgJHNjb3BlLnJlYWRvbmx5SW5wdXQgPSBhbmd1bGFyLmlzRGVmaW5lZCgkYXR0cnMucmVhZG9ubHlJbnB1dCkgPyAkc2NvcGUuJHBhcmVudC4kZXZhbCgkYXR0cnMucmVhZG9ubHlJbnB1dCkgOiB0aW1lcGlja2VyQ29uZmlnLnJlYWRvbmx5SW5wdXQ7XHJcbiAgICB0aGlzLnNldHVwSW5wdXRFdmVudHMoaG91cnNJbnB1dEVsLCBtaW51dGVzSW5wdXRFbCwgc2Vjb25kc0lucHV0RWwpO1xyXG4gIH07XHJcblxyXG4gIHZhciBob3VyU3RlcCA9IHRpbWVwaWNrZXJDb25maWcuaG91clN0ZXA7XHJcbiAgaWYgKCRhdHRycy5ob3VyU3RlcCkge1xyXG4gICAgd2F0Y2hlcnMucHVzaCgkc2NvcGUuJHBhcmVudC4kd2F0Y2goJHBhcnNlKCRhdHRycy5ob3VyU3RlcCksIGZ1bmN0aW9uKHZhbHVlKSB7XHJcbiAgICAgIGhvdXJTdGVwID0gK3ZhbHVlO1xyXG4gICAgfSkpO1xyXG4gIH1cclxuXHJcbiAgdmFyIG1pbnV0ZVN0ZXAgPSB0aW1lcGlja2VyQ29uZmlnLm1pbnV0ZVN0ZXA7XHJcbiAgaWYgKCRhdHRycy5taW51dGVTdGVwKSB7XHJcbiAgICB3YXRjaGVycy5wdXNoKCRzY29wZS4kcGFyZW50LiR3YXRjaCgkcGFyc2UoJGF0dHJzLm1pbnV0ZVN0ZXApLCBmdW5jdGlvbih2YWx1ZSkge1xyXG4gICAgICBtaW51dGVTdGVwID0gK3ZhbHVlO1xyXG4gICAgfSkpO1xyXG4gIH1cclxuXHJcbiAgdmFyIG1pbjtcclxuICB3YXRjaGVycy5wdXNoKCRzY29wZS4kcGFyZW50LiR3YXRjaCgkcGFyc2UoJGF0dHJzLm1pbiksIGZ1bmN0aW9uKHZhbHVlKSB7XHJcbiAgICB2YXIgZHQgPSBuZXcgRGF0ZSh2YWx1ZSk7XHJcbiAgICBtaW4gPSBpc05hTihkdCkgPyB1bmRlZmluZWQgOiBkdDtcclxuICB9KSk7XHJcblxyXG4gIHZhciBtYXg7XHJcbiAgd2F0Y2hlcnMucHVzaCgkc2NvcGUuJHBhcmVudC4kd2F0Y2goJHBhcnNlKCRhdHRycy5tYXgpLCBmdW5jdGlvbih2YWx1ZSkge1xyXG4gICAgdmFyIGR0ID0gbmV3IERhdGUodmFsdWUpO1xyXG4gICAgbWF4ID0gaXNOYU4oZHQpID8gdW5kZWZpbmVkIDogZHQ7XHJcbiAgfSkpO1xyXG5cclxuICB2YXIgZGlzYWJsZWQgPSBmYWxzZTtcclxuICBpZiAoJGF0dHJzLm5nRGlzYWJsZWQpIHtcclxuICAgIHdhdGNoZXJzLnB1c2goJHNjb3BlLiRwYXJlbnQuJHdhdGNoKCRwYXJzZSgkYXR0cnMubmdEaXNhYmxlZCksIGZ1bmN0aW9uKHZhbHVlKSB7XHJcbiAgICAgIGRpc2FibGVkID0gdmFsdWU7XHJcbiAgICB9KSk7XHJcbiAgfVxyXG5cclxuICAkc2NvcGUubm9JbmNyZW1lbnRIb3VycyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGluY3JlbWVudGVkU2VsZWN0ZWQgPSBhZGRNaW51dGVzKHNlbGVjdGVkLCBob3VyU3RlcCAqIDYwKTtcclxuICAgIHJldHVybiBkaXNhYmxlZCB8fCBpbmNyZW1lbnRlZFNlbGVjdGVkID4gbWF4IHx8XHJcbiAgICAgIGluY3JlbWVudGVkU2VsZWN0ZWQgPCBzZWxlY3RlZCAmJiBpbmNyZW1lbnRlZFNlbGVjdGVkIDwgbWluO1xyXG4gIH07XHJcblxyXG4gICRzY29wZS5ub0RlY3JlbWVudEhvdXJzID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgZGVjcmVtZW50ZWRTZWxlY3RlZCA9IGFkZE1pbnV0ZXMoc2VsZWN0ZWQsIC1ob3VyU3RlcCAqIDYwKTtcclxuICAgIHJldHVybiBkaXNhYmxlZCB8fCBkZWNyZW1lbnRlZFNlbGVjdGVkIDwgbWluIHx8XHJcbiAgICAgIGRlY3JlbWVudGVkU2VsZWN0ZWQgPiBzZWxlY3RlZCAmJiBkZWNyZW1lbnRlZFNlbGVjdGVkID4gbWF4O1xyXG4gIH07XHJcblxyXG4gICRzY29wZS5ub0luY3JlbWVudE1pbnV0ZXMgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBpbmNyZW1lbnRlZFNlbGVjdGVkID0gYWRkTWludXRlcyhzZWxlY3RlZCwgbWludXRlU3RlcCk7XHJcbiAgICByZXR1cm4gZGlzYWJsZWQgfHwgaW5jcmVtZW50ZWRTZWxlY3RlZCA+IG1heCB8fFxyXG4gICAgICBpbmNyZW1lbnRlZFNlbGVjdGVkIDwgc2VsZWN0ZWQgJiYgaW5jcmVtZW50ZWRTZWxlY3RlZCA8IG1pbjtcclxuICB9O1xyXG5cclxuICAkc2NvcGUubm9EZWNyZW1lbnRNaW51dGVzID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgZGVjcmVtZW50ZWRTZWxlY3RlZCA9IGFkZE1pbnV0ZXMoc2VsZWN0ZWQsIC1taW51dGVTdGVwKTtcclxuICAgIHJldHVybiBkaXNhYmxlZCB8fCBkZWNyZW1lbnRlZFNlbGVjdGVkIDwgbWluIHx8XHJcbiAgICAgIGRlY3JlbWVudGVkU2VsZWN0ZWQgPiBzZWxlY3RlZCAmJiBkZWNyZW1lbnRlZFNlbGVjdGVkID4gbWF4O1xyXG4gIH07XHJcblxyXG4gICRzY29wZS5ub0luY3JlbWVudFNlY29uZHMgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBpbmNyZW1lbnRlZFNlbGVjdGVkID0gYWRkU2Vjb25kcyhzZWxlY3RlZCwgc2Vjb25kU3RlcCk7XHJcbiAgICByZXR1cm4gZGlzYWJsZWQgfHwgaW5jcmVtZW50ZWRTZWxlY3RlZCA+IG1heCB8fFxyXG4gICAgICBpbmNyZW1lbnRlZFNlbGVjdGVkIDwgc2VsZWN0ZWQgJiYgaW5jcmVtZW50ZWRTZWxlY3RlZCA8IG1pbjtcclxuICB9O1xyXG5cclxuICAkc2NvcGUubm9EZWNyZW1lbnRTZWNvbmRzID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgZGVjcmVtZW50ZWRTZWxlY3RlZCA9IGFkZFNlY29uZHMoc2VsZWN0ZWQsIC1zZWNvbmRTdGVwKTtcclxuICAgIHJldHVybiBkaXNhYmxlZCB8fCBkZWNyZW1lbnRlZFNlbGVjdGVkIDwgbWluIHx8XHJcbiAgICAgIGRlY3JlbWVudGVkU2VsZWN0ZWQgPiBzZWxlY3RlZCAmJiBkZWNyZW1lbnRlZFNlbGVjdGVkID4gbWF4O1xyXG4gIH07XHJcblxyXG4gICRzY29wZS5ub1RvZ2dsZU1lcmlkaWFuID0gZnVuY3Rpb24oKSB7XHJcbiAgICBpZiAoc2VsZWN0ZWQuZ2V0SG91cnMoKSA8IDEyKSB7XHJcbiAgICAgIHJldHVybiBkaXNhYmxlZCB8fCBhZGRNaW51dGVzKHNlbGVjdGVkLCAxMiAqIDYwKSA+IG1heDtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gZGlzYWJsZWQgfHwgYWRkTWludXRlcyhzZWxlY3RlZCwgLTEyICogNjApIDwgbWluO1xyXG4gIH07XHJcblxyXG4gIHZhciBzZWNvbmRTdGVwID0gdGltZXBpY2tlckNvbmZpZy5zZWNvbmRTdGVwO1xyXG4gIGlmICgkYXR0cnMuc2Vjb25kU3RlcCkge1xyXG4gICAgd2F0Y2hlcnMucHVzaCgkc2NvcGUuJHBhcmVudC4kd2F0Y2goJHBhcnNlKCRhdHRycy5zZWNvbmRTdGVwKSwgZnVuY3Rpb24odmFsdWUpIHtcclxuICAgICAgc2Vjb25kU3RlcCA9ICt2YWx1ZTtcclxuICAgIH0pKTtcclxuICB9XHJcblxyXG4gICRzY29wZS5zaG93U2Vjb25kcyA9IHRpbWVwaWNrZXJDb25maWcuc2hvd1NlY29uZHM7XHJcbiAgaWYgKCRhdHRycy5zaG93U2Vjb25kcykge1xyXG4gICAgd2F0Y2hlcnMucHVzaCgkc2NvcGUuJHBhcmVudC4kd2F0Y2goJHBhcnNlKCRhdHRycy5zaG93U2Vjb25kcyksIGZ1bmN0aW9uKHZhbHVlKSB7XHJcbiAgICAgICRzY29wZS5zaG93U2Vjb25kcyA9ICEhdmFsdWU7XHJcbiAgICB9KSk7XHJcbiAgfVxyXG5cclxuICAvLyAxMkggLyAyNEggbW9kZVxyXG4gICRzY29wZS5zaG93TWVyaWRpYW4gPSB0aW1lcGlja2VyQ29uZmlnLnNob3dNZXJpZGlhbjtcclxuICBpZiAoJGF0dHJzLnNob3dNZXJpZGlhbikge1xyXG4gICAgd2F0Y2hlcnMucHVzaCgkc2NvcGUuJHBhcmVudC4kd2F0Y2goJHBhcnNlKCRhdHRycy5zaG93TWVyaWRpYW4pLCBmdW5jdGlvbih2YWx1ZSkge1xyXG4gICAgICAkc2NvcGUuc2hvd01lcmlkaWFuID0gISF2YWx1ZTtcclxuXHJcbiAgICAgIGlmIChuZ01vZGVsQ3RybC4kZXJyb3IudGltZSkge1xyXG4gICAgICAgIC8vIEV2YWx1YXRlIGZyb20gdGVtcGxhdGVcclxuICAgICAgICB2YXIgaG91cnMgPSBnZXRIb3Vyc0Zyb21UZW1wbGF0ZSgpLCBtaW51dGVzID0gZ2V0TWludXRlc0Zyb21UZW1wbGF0ZSgpO1xyXG4gICAgICAgIGlmIChhbmd1bGFyLmlzRGVmaW5lZChob3VycykgJiYgYW5ndWxhci5pc0RlZmluZWQobWludXRlcykpIHtcclxuICAgICAgICAgIHNlbGVjdGVkLnNldEhvdXJzKGhvdXJzKTtcclxuICAgICAgICAgIHJlZnJlc2goKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdXBkYXRlVGVtcGxhdGUoKTtcclxuICAgICAgfVxyXG4gICAgfSkpO1xyXG4gIH1cclxuXHJcbiAgLy8gR2V0ICRzY29wZS5ob3VycyBpbiAyNEggbW9kZSBpZiB2YWxpZFxyXG4gIGZ1bmN0aW9uIGdldEhvdXJzRnJvbVRlbXBsYXRlKCkge1xyXG4gICAgdmFyIGhvdXJzID0gKyRzY29wZS5ob3VycztcclxuICAgIHZhciB2YWxpZCA9ICRzY29wZS5zaG93TWVyaWRpYW4gPyBob3VycyA+IDAgJiYgaG91cnMgPCAxMyA6XHJcbiAgICAgIGhvdXJzID49IDAgJiYgaG91cnMgPCAyNDtcclxuICAgIGlmICghdmFsaWQgfHwgJHNjb3BlLmhvdXJzID09PSAnJykge1xyXG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICgkc2NvcGUuc2hvd01lcmlkaWFuKSB7XHJcbiAgICAgIGlmIChob3VycyA9PT0gMTIpIHtcclxuICAgICAgICBob3VycyA9IDA7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKCRzY29wZS5tZXJpZGlhbiA9PT0gbWVyaWRpYW5zWzFdKSB7XHJcbiAgICAgICAgaG91cnMgPSBob3VycyArIDEyO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gaG91cnM7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBnZXRNaW51dGVzRnJvbVRlbXBsYXRlKCkge1xyXG4gICAgdmFyIG1pbnV0ZXMgPSArJHNjb3BlLm1pbnV0ZXM7XHJcbiAgICB2YXIgdmFsaWQgPSBtaW51dGVzID49IDAgJiYgbWludXRlcyA8IDYwO1xyXG4gICAgaWYgKCF2YWxpZCB8fCAkc2NvcGUubWludXRlcyA9PT0gJycpIHtcclxuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcclxuICAgIH1cclxuICAgIHJldHVybiBtaW51dGVzO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gZ2V0U2Vjb25kc0Zyb21UZW1wbGF0ZSgpIHtcclxuICAgIHZhciBzZWNvbmRzID0gKyRzY29wZS5zZWNvbmRzO1xyXG4gICAgcmV0dXJuIHNlY29uZHMgPj0gMCAmJiBzZWNvbmRzIDwgNjAgPyBzZWNvbmRzIDogdW5kZWZpbmVkO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gcGFkKHZhbHVlLCBub1BhZCkge1xyXG4gICAgaWYgKHZhbHVlID09PSBudWxsKSB7XHJcbiAgICAgIHJldHVybiAnJztcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gYW5ndWxhci5pc0RlZmluZWQodmFsdWUpICYmIHZhbHVlLnRvU3RyaW5nKCkubGVuZ3RoIDwgMiAmJiAhbm9QYWQgP1xyXG4gICAgICAnMCcgKyB2YWx1ZSA6IHZhbHVlLnRvU3RyaW5nKCk7XHJcbiAgfVxyXG5cclxuICAvLyBSZXNwb25kIG9uIG1vdXNld2hlZWwgc3BpblxyXG4gIHRoaXMuc2V0dXBNb3VzZXdoZWVsRXZlbnRzID0gZnVuY3Rpb24oaG91cnNJbnB1dEVsLCBtaW51dGVzSW5wdXRFbCwgc2Vjb25kc0lucHV0RWwpIHtcclxuICAgIHZhciBpc1Njcm9sbGluZ1VwID0gZnVuY3Rpb24oZSkge1xyXG4gICAgICBpZiAoZS5vcmlnaW5hbEV2ZW50KSB7XHJcbiAgICAgICAgZSA9IGUub3JpZ2luYWxFdmVudDtcclxuICAgICAgfVxyXG4gICAgICAvL3BpY2sgY29ycmVjdCBkZWx0YSB2YXJpYWJsZSBkZXBlbmRpbmcgb24gZXZlbnRcclxuICAgICAgdmFyIGRlbHRhID0gZS53aGVlbERlbHRhID8gZS53aGVlbERlbHRhIDogLWUuZGVsdGFZO1xyXG4gICAgICByZXR1cm4gZS5kZXRhaWwgfHwgZGVsdGEgPiAwO1xyXG4gICAgfTtcclxuXHJcbiAgICBob3Vyc0lucHV0RWwuYmluZCgnbW91c2V3aGVlbCB3aGVlbCcsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgaWYgKCFkaXNhYmxlZCkge1xyXG4gICAgICAgICRzY29wZS4kYXBwbHkoaXNTY3JvbGxpbmdVcChlKSA/ICRzY29wZS5pbmNyZW1lbnRIb3VycygpIDogJHNjb3BlLmRlY3JlbWVudEhvdXJzKCkpO1xyXG4gICAgICB9XHJcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgIH0pO1xyXG5cclxuICAgIG1pbnV0ZXNJbnB1dEVsLmJpbmQoJ21vdXNld2hlZWwgd2hlZWwnLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgIGlmICghZGlzYWJsZWQpIHtcclxuICAgICAgICAkc2NvcGUuJGFwcGx5KGlzU2Nyb2xsaW5nVXAoZSkgPyAkc2NvcGUuaW5jcmVtZW50TWludXRlcygpIDogJHNjb3BlLmRlY3JlbWVudE1pbnV0ZXMoKSk7XHJcbiAgICAgIH1cclxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgIHNlY29uZHNJbnB1dEVsLmJpbmQoJ21vdXNld2hlZWwgd2hlZWwnLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgIGlmICghZGlzYWJsZWQpIHtcclxuICAgICAgICAkc2NvcGUuJGFwcGx5KGlzU2Nyb2xsaW5nVXAoZSkgPyAkc2NvcGUuaW5jcmVtZW50U2Vjb25kcygpIDogJHNjb3BlLmRlY3JlbWVudFNlY29uZHMoKSk7XHJcbiAgICAgIH1cclxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgfSk7XHJcbiAgfTtcclxuXHJcbiAgLy8gUmVzcG9uZCBvbiB1cC9kb3duIGFycm93a2V5c1xyXG4gIHRoaXMuc2V0dXBBcnJvd2tleUV2ZW50cyA9IGZ1bmN0aW9uKGhvdXJzSW5wdXRFbCwgbWludXRlc0lucHV0RWwsIHNlY29uZHNJbnB1dEVsKSB7XHJcbiAgICBob3Vyc0lucHV0RWwuYmluZCgna2V5ZG93bicsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgaWYgKCFkaXNhYmxlZCkge1xyXG4gICAgICAgIGlmIChlLndoaWNoID09PSAzOCkgeyAvLyB1cFxyXG4gICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgJHNjb3BlLmluY3JlbWVudEhvdXJzKCk7XHJcbiAgICAgICAgICAkc2NvcGUuJGFwcGx5KCk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChlLndoaWNoID09PSA0MCkgeyAvLyBkb3duXHJcbiAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAkc2NvcGUuZGVjcmVtZW50SG91cnMoKTtcclxuICAgICAgICAgICRzY29wZS4kYXBwbHkoKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIG1pbnV0ZXNJbnB1dEVsLmJpbmQoJ2tleWRvd24nLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgIGlmICghZGlzYWJsZWQpIHtcclxuICAgICAgICBpZiAoZS53aGljaCA9PT0gMzgpIHsgLy8gdXBcclxuICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICRzY29wZS5pbmNyZW1lbnRNaW51dGVzKCk7XHJcbiAgICAgICAgICAkc2NvcGUuJGFwcGx5KCk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChlLndoaWNoID09PSA0MCkgeyAvLyBkb3duXHJcbiAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAkc2NvcGUuZGVjcmVtZW50TWludXRlcygpO1xyXG4gICAgICAgICAgJHNjb3BlLiRhcHBseSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgc2Vjb25kc0lucHV0RWwuYmluZCgna2V5ZG93bicsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgaWYgKCFkaXNhYmxlZCkge1xyXG4gICAgICAgIGlmIChlLndoaWNoID09PSAzOCkgeyAvLyB1cFxyXG4gICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgJHNjb3BlLmluY3JlbWVudFNlY29uZHMoKTtcclxuICAgICAgICAgICRzY29wZS4kYXBwbHkoKTtcclxuICAgICAgICB9IGVsc2UgaWYgKGUud2hpY2ggPT09IDQwKSB7IC8vIGRvd25cclxuICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICRzY29wZS5kZWNyZW1lbnRTZWNvbmRzKCk7XHJcbiAgICAgICAgICAkc2NvcGUuJGFwcGx5KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICB9O1xyXG5cclxuICB0aGlzLnNldHVwSW5wdXRFdmVudHMgPSBmdW5jdGlvbihob3Vyc0lucHV0RWwsIG1pbnV0ZXNJbnB1dEVsLCBzZWNvbmRzSW5wdXRFbCkge1xyXG4gICAgaWYgKCRzY29wZS5yZWFkb25seUlucHV0KSB7XHJcbiAgICAgICRzY29wZS51cGRhdGVIb3VycyA9IGFuZ3VsYXIubm9vcDtcclxuICAgICAgJHNjb3BlLnVwZGF0ZU1pbnV0ZXMgPSBhbmd1bGFyLm5vb3A7XHJcbiAgICAgICRzY29wZS51cGRhdGVTZWNvbmRzID0gYW5ndWxhci5ub29wO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGludmFsaWRhdGUgPSBmdW5jdGlvbihpbnZhbGlkSG91cnMsIGludmFsaWRNaW51dGVzLCBpbnZhbGlkU2Vjb25kcykge1xyXG4gICAgICBuZ01vZGVsQ3RybC4kc2V0Vmlld1ZhbHVlKG51bGwpO1xyXG4gICAgICBuZ01vZGVsQ3RybC4kc2V0VmFsaWRpdHkoJ3RpbWUnLCBmYWxzZSk7XHJcbiAgICAgIGlmIChhbmd1bGFyLmlzRGVmaW5lZChpbnZhbGlkSG91cnMpKSB7XHJcbiAgICAgICAgJHNjb3BlLmludmFsaWRIb3VycyA9IGludmFsaWRIb3VycztcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKGFuZ3VsYXIuaXNEZWZpbmVkKGludmFsaWRNaW51dGVzKSkge1xyXG4gICAgICAgICRzY29wZS5pbnZhbGlkTWludXRlcyA9IGludmFsaWRNaW51dGVzO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoYW5ndWxhci5pc0RlZmluZWQoaW52YWxpZFNlY29uZHMpKSB7XHJcbiAgICAgICAgJHNjb3BlLmludmFsaWRTZWNvbmRzID0gaW52YWxpZFNlY29uZHM7XHJcbiAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgJHNjb3BlLnVwZGF0ZUhvdXJzID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgIHZhciBob3VycyA9IGdldEhvdXJzRnJvbVRlbXBsYXRlKCksXHJcbiAgICAgICAgbWludXRlcyA9IGdldE1pbnV0ZXNGcm9tVGVtcGxhdGUoKTtcclxuXHJcbiAgICAgIG5nTW9kZWxDdHJsLiRzZXREaXJ0eSgpO1xyXG5cclxuICAgICAgaWYgKGFuZ3VsYXIuaXNEZWZpbmVkKGhvdXJzKSAmJiBhbmd1bGFyLmlzRGVmaW5lZChtaW51dGVzKSkge1xyXG4gICAgICAgIHNlbGVjdGVkLnNldEhvdXJzKGhvdXJzKTtcclxuICAgICAgICBzZWxlY3RlZC5zZXRNaW51dGVzKG1pbnV0ZXMpO1xyXG4gICAgICAgIGlmIChzZWxlY3RlZCA8IG1pbiB8fCBzZWxlY3RlZCA+IG1heCkge1xyXG4gICAgICAgICAgaW52YWxpZGF0ZSh0cnVlKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgcmVmcmVzaCgnaCcpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBpbnZhbGlkYXRlKHRydWUpO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIGhvdXJzSW5wdXRFbC5iaW5kKCdibHVyJywgZnVuY3Rpb24oZSkge1xyXG4gICAgICBuZ01vZGVsQ3RybC4kc2V0VG91Y2hlZCgpO1xyXG4gICAgICBpZiAobW9kZWxJc0VtcHR5KCkpIHtcclxuICAgICAgICBtYWtlVmFsaWQoKTtcclxuICAgICAgfSBlbHNlIGlmICgkc2NvcGUuaG91cnMgPT09IG51bGwgfHwgJHNjb3BlLmhvdXJzID09PSAnJykge1xyXG4gICAgICAgIGludmFsaWRhdGUodHJ1ZSk7XHJcbiAgICAgIH0gZWxzZSBpZiAoISRzY29wZS5pbnZhbGlkSG91cnMgJiYgJHNjb3BlLmhvdXJzIDwgMTApIHtcclxuICAgICAgICAkc2NvcGUuJGFwcGx5KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgJHNjb3BlLmhvdXJzID0gcGFkKCRzY29wZS5ob3VycywgIXBhZEhvdXJzKTtcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgJHNjb3BlLnVwZGF0ZU1pbnV0ZXMgPSBmdW5jdGlvbigpIHtcclxuICAgICAgdmFyIG1pbnV0ZXMgPSBnZXRNaW51dGVzRnJvbVRlbXBsYXRlKCksXHJcbiAgICAgICAgaG91cnMgPSBnZXRIb3Vyc0Zyb21UZW1wbGF0ZSgpO1xyXG5cclxuICAgICAgbmdNb2RlbEN0cmwuJHNldERpcnR5KCk7XHJcblxyXG4gICAgICBpZiAoYW5ndWxhci5pc0RlZmluZWQobWludXRlcykgJiYgYW5ndWxhci5pc0RlZmluZWQoaG91cnMpKSB7XHJcbiAgICAgICAgc2VsZWN0ZWQuc2V0SG91cnMoaG91cnMpO1xyXG4gICAgICAgIHNlbGVjdGVkLnNldE1pbnV0ZXMobWludXRlcyk7XHJcbiAgICAgICAgaWYgKHNlbGVjdGVkIDwgbWluIHx8IHNlbGVjdGVkID4gbWF4KSB7XHJcbiAgICAgICAgICBpbnZhbGlkYXRlKHVuZGVmaW5lZCwgdHJ1ZSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHJlZnJlc2goJ20nKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgaW52YWxpZGF0ZSh1bmRlZmluZWQsIHRydWUpO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIG1pbnV0ZXNJbnB1dEVsLmJpbmQoJ2JsdXInLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgIG5nTW9kZWxDdHJsLiRzZXRUb3VjaGVkKCk7XHJcbiAgICAgIGlmIChtb2RlbElzRW1wdHkoKSkge1xyXG4gICAgICAgIG1ha2VWYWxpZCgpO1xyXG4gICAgICB9IGVsc2UgaWYgKCRzY29wZS5taW51dGVzID09PSBudWxsKSB7XHJcbiAgICAgICAgaW52YWxpZGF0ZSh1bmRlZmluZWQsIHRydWUpO1xyXG4gICAgICB9IGVsc2UgaWYgKCEkc2NvcGUuaW52YWxpZE1pbnV0ZXMgJiYgJHNjb3BlLm1pbnV0ZXMgPCAxMCkge1xyXG4gICAgICAgICRzY29wZS4kYXBwbHkoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAkc2NvcGUubWludXRlcyA9IHBhZCgkc2NvcGUubWludXRlcyk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgICRzY29wZS51cGRhdGVTZWNvbmRzID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgIHZhciBzZWNvbmRzID0gZ2V0U2Vjb25kc0Zyb21UZW1wbGF0ZSgpO1xyXG5cclxuICAgICAgbmdNb2RlbEN0cmwuJHNldERpcnR5KCk7XHJcblxyXG4gICAgICBpZiAoYW5ndWxhci5pc0RlZmluZWQoc2Vjb25kcykpIHtcclxuICAgICAgICBzZWxlY3RlZC5zZXRTZWNvbmRzKHNlY29uZHMpO1xyXG4gICAgICAgIHJlZnJlc2goJ3MnKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBpbnZhbGlkYXRlKHVuZGVmaW5lZCwgdW5kZWZpbmVkLCB0cnVlKTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICBzZWNvbmRzSW5wdXRFbC5iaW5kKCdibHVyJywgZnVuY3Rpb24oZSkge1xyXG4gICAgICBpZiAobW9kZWxJc0VtcHR5KCkpIHtcclxuICAgICAgICBtYWtlVmFsaWQoKTtcclxuICAgICAgfSBlbHNlIGlmICghJHNjb3BlLmludmFsaWRTZWNvbmRzICYmICRzY29wZS5zZWNvbmRzIDwgMTApIHtcclxuICAgICAgICAkc2NvcGUuJGFwcGx5KCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICRzY29wZS5zZWNvbmRzID0gcGFkKCRzY29wZS5zZWNvbmRzKTtcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gIH07XHJcblxyXG4gIHRoaXMucmVuZGVyID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgZGF0ZSA9IG5nTW9kZWxDdHJsLiR2aWV3VmFsdWU7XHJcblxyXG4gICAgaWYgKGlzTmFOKGRhdGUpKSB7XHJcbiAgICAgIG5nTW9kZWxDdHJsLiRzZXRWYWxpZGl0eSgndGltZScsIGZhbHNlKTtcclxuICAgICAgJGxvZy5lcnJvcignVGltZXBpY2tlciBkaXJlY3RpdmU6IFwibmctbW9kZWxcIiB2YWx1ZSBtdXN0IGJlIGEgRGF0ZSBvYmplY3QsIGEgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyBzaW5jZSAwMS4wMS4xOTcwIG9yIGEgc3RyaW5nIHJlcHJlc2VudGluZyBhbiBSRkMyODIyIG9yIElTTyA4NjAxIGRhdGUuJyk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBpZiAoZGF0ZSkge1xyXG4gICAgICAgIHNlbGVjdGVkID0gZGF0ZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKHNlbGVjdGVkIDwgbWluIHx8IHNlbGVjdGVkID4gbWF4KSB7XHJcbiAgICAgICAgbmdNb2RlbEN0cmwuJHNldFZhbGlkaXR5KCd0aW1lJywgZmFsc2UpO1xyXG4gICAgICAgICRzY29wZS5pbnZhbGlkSG91cnMgPSB0cnVlO1xyXG4gICAgICAgICRzY29wZS5pbnZhbGlkTWludXRlcyA9IHRydWU7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgbWFrZVZhbGlkKCk7XHJcbiAgICAgIH1cclxuICAgICAgdXBkYXRlVGVtcGxhdGUoKTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICAvLyBDYWxsIGludGVybmFsbHkgd2hlbiB3ZSBrbm93IHRoYXQgbW9kZWwgaXMgdmFsaWQuXHJcbiAgZnVuY3Rpb24gcmVmcmVzaChrZXlib2FyZENoYW5nZSkge1xyXG4gICAgbWFrZVZhbGlkKCk7XHJcbiAgICBuZ01vZGVsQ3RybC4kc2V0Vmlld1ZhbHVlKG5ldyBEYXRlKHNlbGVjdGVkKSk7XHJcbiAgICB1cGRhdGVUZW1wbGF0ZShrZXlib2FyZENoYW5nZSk7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBtYWtlVmFsaWQoKSB7XHJcbiAgICBuZ01vZGVsQ3RybC4kc2V0VmFsaWRpdHkoJ3RpbWUnLCB0cnVlKTtcclxuICAgICRzY29wZS5pbnZhbGlkSG91cnMgPSBmYWxzZTtcclxuICAgICRzY29wZS5pbnZhbGlkTWludXRlcyA9IGZhbHNlO1xyXG4gICAgJHNjb3BlLmludmFsaWRTZWNvbmRzID0gZmFsc2U7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiB1cGRhdGVUZW1wbGF0ZShrZXlib2FyZENoYW5nZSkge1xyXG4gICAgaWYgKCFuZ01vZGVsQ3RybC4kbW9kZWxWYWx1ZSkge1xyXG4gICAgICAkc2NvcGUuaG91cnMgPSBudWxsO1xyXG4gICAgICAkc2NvcGUubWludXRlcyA9IG51bGw7XHJcbiAgICAgICRzY29wZS5zZWNvbmRzID0gbnVsbDtcclxuICAgICAgJHNjb3BlLm1lcmlkaWFuID0gbWVyaWRpYW5zWzBdO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdmFyIGhvdXJzID0gc2VsZWN0ZWQuZ2V0SG91cnMoKSxcclxuICAgICAgICBtaW51dGVzID0gc2VsZWN0ZWQuZ2V0TWludXRlcygpLFxyXG4gICAgICAgIHNlY29uZHMgPSBzZWxlY3RlZC5nZXRTZWNvbmRzKCk7XHJcblxyXG4gICAgICBpZiAoJHNjb3BlLnNob3dNZXJpZGlhbikge1xyXG4gICAgICAgIGhvdXJzID0gaG91cnMgPT09IDAgfHwgaG91cnMgPT09IDEyID8gMTIgOiBob3VycyAlIDEyOyAvLyBDb252ZXJ0IDI0IHRvIDEyIGhvdXIgc3lzdGVtXHJcbiAgICAgIH1cclxuXHJcbiAgICAgICRzY29wZS5ob3VycyA9IGtleWJvYXJkQ2hhbmdlID09PSAnaCcgPyBob3VycyA6IHBhZChob3VycywgIXBhZEhvdXJzKTtcclxuICAgICAgaWYgKGtleWJvYXJkQ2hhbmdlICE9PSAnbScpIHtcclxuICAgICAgICAkc2NvcGUubWludXRlcyA9IHBhZChtaW51dGVzKTtcclxuICAgICAgfVxyXG4gICAgICAkc2NvcGUubWVyaWRpYW4gPSBzZWxlY3RlZC5nZXRIb3VycygpIDwgMTIgPyBtZXJpZGlhbnNbMF0gOiBtZXJpZGlhbnNbMV07XHJcblxyXG4gICAgICBpZiAoa2V5Ym9hcmRDaGFuZ2UgIT09ICdzJykge1xyXG4gICAgICAgICRzY29wZS5zZWNvbmRzID0gcGFkKHNlY29uZHMpO1xyXG4gICAgICB9XHJcbiAgICAgICRzY29wZS5tZXJpZGlhbiA9IHNlbGVjdGVkLmdldEhvdXJzKCkgPCAxMiA/IG1lcmlkaWFuc1swXSA6IG1lcmlkaWFuc1sxXTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGFkZFNlY29uZHNUb1NlbGVjdGVkKHNlY29uZHMpIHtcclxuICAgIHNlbGVjdGVkID0gYWRkU2Vjb25kcyhzZWxlY3RlZCwgc2Vjb25kcyk7XHJcbiAgICByZWZyZXNoKCk7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBhZGRNaW51dGVzKHNlbGVjdGVkLCBtaW51dGVzKSB7XHJcbiAgICByZXR1cm4gYWRkU2Vjb25kcyhzZWxlY3RlZCwgbWludXRlcyo2MCk7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBhZGRTZWNvbmRzKGRhdGUsIHNlY29uZHMpIHtcclxuICAgIHZhciBkdCA9IG5ldyBEYXRlKGRhdGUuZ2V0VGltZSgpICsgc2Vjb25kcyAqIDEwMDApO1xyXG4gICAgdmFyIG5ld0RhdGUgPSBuZXcgRGF0ZShkYXRlKTtcclxuICAgIG5ld0RhdGUuc2V0SG91cnMoZHQuZ2V0SG91cnMoKSwgZHQuZ2V0TWludXRlcygpLCBkdC5nZXRTZWNvbmRzKCkpO1xyXG4gICAgcmV0dXJuIG5ld0RhdGU7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBtb2RlbElzRW1wdHkoKSB7XHJcbiAgICByZXR1cm4gKCRzY29wZS5ob3VycyA9PT0gbnVsbCB8fCAkc2NvcGUuaG91cnMgPT09ICcnKSAmJlxyXG4gICAgICAoJHNjb3BlLm1pbnV0ZXMgPT09IG51bGwgfHwgJHNjb3BlLm1pbnV0ZXMgPT09ICcnKSAmJlxyXG4gICAgICAoISRzY29wZS5zaG93U2Vjb25kcyB8fCAkc2NvcGUuc2hvd1NlY29uZHMgJiYgKCRzY29wZS5zZWNvbmRzID09PSBudWxsIHx8ICRzY29wZS5zZWNvbmRzID09PSAnJykpO1xyXG4gIH1cclxuXHJcbiAgJHNjb3BlLnNob3dTcGlubmVycyA9IGFuZ3VsYXIuaXNEZWZpbmVkKCRhdHRycy5zaG93U3Bpbm5lcnMpID9cclxuICAgICRzY29wZS4kcGFyZW50LiRldmFsKCRhdHRycy5zaG93U3Bpbm5lcnMpIDogdGltZXBpY2tlckNvbmZpZy5zaG93U3Bpbm5lcnM7XHJcblxyXG4gICRzY29wZS5pbmNyZW1lbnRIb3VycyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgaWYgKCEkc2NvcGUubm9JbmNyZW1lbnRIb3VycygpKSB7XHJcbiAgICAgIGFkZFNlY29uZHNUb1NlbGVjdGVkKGhvdXJTdGVwICogNjAgKiA2MCk7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgJHNjb3BlLmRlY3JlbWVudEhvdXJzID0gZnVuY3Rpb24oKSB7XHJcbiAgICBpZiAoISRzY29wZS5ub0RlY3JlbWVudEhvdXJzKCkpIHtcclxuICAgICAgYWRkU2Vjb25kc1RvU2VsZWN0ZWQoLWhvdXJTdGVwICogNjAgKiA2MCk7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgJHNjb3BlLmluY3JlbWVudE1pbnV0ZXMgPSBmdW5jdGlvbigpIHtcclxuICAgIGlmICghJHNjb3BlLm5vSW5jcmVtZW50TWludXRlcygpKSB7XHJcbiAgICAgIGFkZFNlY29uZHNUb1NlbGVjdGVkKG1pbnV0ZVN0ZXAgKiA2MCk7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgJHNjb3BlLmRlY3JlbWVudE1pbnV0ZXMgPSBmdW5jdGlvbigpIHtcclxuICAgIGlmICghJHNjb3BlLm5vRGVjcmVtZW50TWludXRlcygpKSB7XHJcbiAgICAgIGFkZFNlY29uZHNUb1NlbGVjdGVkKC1taW51dGVTdGVwICogNjApO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gICRzY29wZS5pbmNyZW1lbnRTZWNvbmRzID0gZnVuY3Rpb24oKSB7XHJcbiAgICBpZiAoISRzY29wZS5ub0luY3JlbWVudFNlY29uZHMoKSkge1xyXG4gICAgICBhZGRTZWNvbmRzVG9TZWxlY3RlZChzZWNvbmRTdGVwKTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICAkc2NvcGUuZGVjcmVtZW50U2Vjb25kcyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgaWYgKCEkc2NvcGUubm9EZWNyZW1lbnRTZWNvbmRzKCkpIHtcclxuICAgICAgYWRkU2Vjb25kc1RvU2VsZWN0ZWQoLXNlY29uZFN0ZXApO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gICRzY29wZS50b2dnbGVNZXJpZGlhbiA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIG1pbnV0ZXMgPSBnZXRNaW51dGVzRnJvbVRlbXBsYXRlKCksXHJcbiAgICAgICAgaG91cnMgPSBnZXRIb3Vyc0Zyb21UZW1wbGF0ZSgpO1xyXG5cclxuICAgIGlmICghJHNjb3BlLm5vVG9nZ2xlTWVyaWRpYW4oKSkge1xyXG4gICAgICBpZiAoYW5ndWxhci5pc0RlZmluZWQobWludXRlcykgJiYgYW5ndWxhci5pc0RlZmluZWQoaG91cnMpKSB7XHJcbiAgICAgICAgYWRkU2Vjb25kc1RvU2VsZWN0ZWQoMTIgKiA2MCAqIChzZWxlY3RlZC5nZXRIb3VycygpIDwgMTIgPyA2MCA6IC02MCkpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgICRzY29wZS5tZXJpZGlhbiA9ICRzY29wZS5tZXJpZGlhbiA9PT0gbWVyaWRpYW5zWzBdID8gbWVyaWRpYW5zWzFdIDogbWVyaWRpYW5zWzBdO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgJHNjb3BlLmJsdXIgPSBmdW5jdGlvbigpIHtcclxuICAgIG5nTW9kZWxDdHJsLiRzZXRUb3VjaGVkKCk7XHJcbiAgfTtcclxuXHJcbiAgJHNjb3BlLiRvbignJGRlc3Ryb3knLCBmdW5jdGlvbigpIHtcclxuICAgIHdoaWxlICh3YXRjaGVycy5sZW5ndGgpIHtcclxuICAgICAgd2F0Y2hlcnMuc2hpZnQoKSgpO1xyXG4gICAgfVxyXG4gIH0pO1xyXG59XSlcclxuXHJcbi5kaXJlY3RpdmUoJ3VpYlRpbWVwaWNrZXInLCBbJ3VpYlRpbWVwaWNrZXJDb25maWcnLCBmdW5jdGlvbih1aWJUaW1lcGlja2VyQ29uZmlnKSB7XHJcbiAgcmV0dXJuIHtcclxuICAgIHJlcXVpcmU6IFsndWliVGltZXBpY2tlcicsICc/Xm5nTW9kZWwnXSxcclxuICAgIHJlc3RyaWN0OiAnQScsXHJcbiAgICBjb250cm9sbGVyOiAnVWliVGltZXBpY2tlckNvbnRyb2xsZXInLFxyXG4gICAgY29udHJvbGxlckFzOiAndGltZXBpY2tlcicsXHJcbiAgICBzY29wZToge30sXHJcbiAgICB0ZW1wbGF0ZVVybDogZnVuY3Rpb24oZWxlbWVudCwgYXR0cnMpIHtcclxuICAgICAgcmV0dXJuIGF0dHJzLnRlbXBsYXRlVXJsIHx8IHVpYlRpbWVwaWNrZXJDb25maWcudGVtcGxhdGVVcmw7XHJcbiAgICB9LFxyXG4gICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCBjdHJscykge1xyXG4gICAgICB2YXIgdGltZXBpY2tlckN0cmwgPSBjdHJsc1swXSwgbmdNb2RlbEN0cmwgPSBjdHJsc1sxXTtcclxuXHJcbiAgICAgIGlmIChuZ01vZGVsQ3RybCkge1xyXG4gICAgICAgIHRpbWVwaWNrZXJDdHJsLmluaXQobmdNb2RlbEN0cmwsIGVsZW1lbnQuZmluZCgnaW5wdXQnKSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9O1xyXG59XSk7XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgndWkuYm9vdHN0cmFwLnR5cGVhaGVhZCcsIFsndWkuYm9vdHN0cmFwLmRlYm91bmNlJywgJ3VpLmJvb3RzdHJhcC5wb3NpdGlvbiddKVxyXG5cclxuLyoqXHJcbiAqIEEgaGVscGVyIHNlcnZpY2UgdGhhdCBjYW4gcGFyc2UgdHlwZWFoZWFkJ3Mgc3ludGF4IChzdHJpbmcgcHJvdmlkZWQgYnkgdXNlcnMpXHJcbiAqIEV4dHJhY3RlZCB0byBhIHNlcGFyYXRlIHNlcnZpY2UgZm9yIGVhc2Ugb2YgdW5pdCB0ZXN0aW5nXHJcbiAqL1xyXG4gIC5mYWN0b3J5KCd1aWJUeXBlYWhlYWRQYXJzZXInLCBbJyRwYXJzZScsIGZ1bmN0aW9uKCRwYXJzZSkge1xyXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgMDAwMDAxMTExMTExMTAwMDAwMDAwMDAwMDAyMjIyMjIyMjAwMDAwMDAwMDAwMDAwMDAzMzMzMzMzMzMzMzMzMzMwMDAwMDAwMDAwMDQ0NDQ0NDQ0MDAwXHJcbiAgICB2YXIgVFlQRUFIRUFEX1JFR0VYUCA9IC9eXFxzKihbXFxzXFxTXSs/KSg/Olxccythc1xccysoW1xcc1xcU10rPykpP1xccytmb3JcXHMrKD86KFtcXCRcXHddW1xcJFxcd1xcZF0qKSlcXHMraW5cXHMrKFtcXHNcXFNdKz8pJC87XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBwYXJzZTogZnVuY3Rpb24oaW5wdXQpIHtcclxuICAgICAgICB2YXIgbWF0Y2ggPSBpbnB1dC5tYXRjaChUWVBFQUhFQURfUkVHRVhQKTtcclxuICAgICAgICBpZiAoIW1hdGNoKSB7XHJcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXHJcbiAgICAgICAgICAgICdFeHBlY3RlZCB0eXBlYWhlYWQgc3BlY2lmaWNhdGlvbiBpbiBmb3JtIG9mIFwiX21vZGVsVmFsdWVfIChhcyBfbGFiZWxfKT8gZm9yIF9pdGVtXyBpbiBfY29sbGVjdGlvbl9cIicgK1xyXG4gICAgICAgICAgICAgICcgYnV0IGdvdCBcIicgKyBpbnB1dCArICdcIi4nKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICBpdGVtTmFtZTogbWF0Y2hbM10sXHJcbiAgICAgICAgICBzb3VyY2U6ICRwYXJzZShtYXRjaFs0XSksXHJcbiAgICAgICAgICB2aWV3TWFwcGVyOiAkcGFyc2UobWF0Y2hbMl0gfHwgbWF0Y2hbMV0pLFxyXG4gICAgICAgICAgbW9kZWxNYXBwZXI6ICRwYXJzZShtYXRjaFsxXSlcclxuICAgICAgICB9O1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG4gIH1dKVxyXG5cclxuICAuY29udHJvbGxlcignVWliVHlwZWFoZWFkQ29udHJvbGxlcicsIFsnJHNjb3BlJywgJyRlbGVtZW50JywgJyRhdHRycycsICckY29tcGlsZScsICckcGFyc2UnLCAnJHEnLCAnJHRpbWVvdXQnLCAnJGRvY3VtZW50JywgJyR3aW5kb3cnLCAnJHJvb3RTY29wZScsICckJGRlYm91bmNlJywgJyR1aWJQb3NpdGlvbicsICd1aWJUeXBlYWhlYWRQYXJzZXInLFxyXG4gICAgZnVuY3Rpb24ob3JpZ2luYWxTY29wZSwgZWxlbWVudCwgYXR0cnMsICRjb21waWxlLCAkcGFyc2UsICRxLCAkdGltZW91dCwgJGRvY3VtZW50LCAkd2luZG93LCAkcm9vdFNjb3BlLCAkJGRlYm91bmNlLCAkcG9zaXRpb24sIHR5cGVhaGVhZFBhcnNlcikge1xyXG4gICAgdmFyIEhPVF9LRVlTID0gWzksIDEzLCAyNywgMzgsIDQwXTtcclxuICAgIHZhciBldmVudERlYm91bmNlVGltZSA9IDIwMDtcclxuICAgIHZhciBtb2RlbEN0cmwsIG5nTW9kZWxPcHRpb25zO1xyXG4gICAgLy9TVVBQT1JURUQgQVRUUklCVVRFUyAoT1BUSU9OUylcclxuXHJcbiAgICAvL21pbmltYWwgbm8gb2YgY2hhcmFjdGVycyB0aGF0IG5lZWRzIHRvIGJlIGVudGVyZWQgYmVmb3JlIHR5cGVhaGVhZCBraWNrcy1pblxyXG4gICAgdmFyIG1pbkxlbmd0aCA9IG9yaWdpbmFsU2NvcGUuJGV2YWwoYXR0cnMudHlwZWFoZWFkTWluTGVuZ3RoKTtcclxuICAgIGlmICghbWluTGVuZ3RoICYmIG1pbkxlbmd0aCAhPT0gMCkge1xyXG4gICAgICBtaW5MZW5ndGggPSAxO1xyXG4gICAgfVxyXG5cclxuICAgIG9yaWdpbmFsU2NvcGUuJHdhdGNoKGF0dHJzLnR5cGVhaGVhZE1pbkxlbmd0aCwgZnVuY3Rpb24gKG5ld1ZhbCkge1xyXG4gICAgICAgIG1pbkxlbmd0aCA9ICFuZXdWYWwgJiYgbmV3VmFsICE9PSAwID8gMSA6IG5ld1ZhbDtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vbWluaW1hbCB3YWl0IHRpbWUgYWZ0ZXIgbGFzdCBjaGFyYWN0ZXIgdHlwZWQgYmVmb3JlIHR5cGVhaGVhZCBraWNrcy1pblxyXG4gICAgdmFyIHdhaXRUaW1lID0gb3JpZ2luYWxTY29wZS4kZXZhbChhdHRycy50eXBlYWhlYWRXYWl0TXMpIHx8IDA7XHJcblxyXG4gICAgLy9zaG91bGQgaXQgcmVzdHJpY3QgbW9kZWwgdmFsdWVzIHRvIHRoZSBvbmVzIHNlbGVjdGVkIGZyb20gdGhlIHBvcHVwIG9ubHk/XHJcbiAgICB2YXIgaXNFZGl0YWJsZSA9IG9yaWdpbmFsU2NvcGUuJGV2YWwoYXR0cnMudHlwZWFoZWFkRWRpdGFibGUpICE9PSBmYWxzZTtcclxuICAgIG9yaWdpbmFsU2NvcGUuJHdhdGNoKGF0dHJzLnR5cGVhaGVhZEVkaXRhYmxlLCBmdW5jdGlvbiAobmV3VmFsKSB7XHJcbiAgICAgIGlzRWRpdGFibGUgPSBuZXdWYWwgIT09IGZhbHNlO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy9iaW5kaW5nIHRvIGEgdmFyaWFibGUgdGhhdCBpbmRpY2F0ZXMgaWYgbWF0Y2hlcyBhcmUgYmVpbmcgcmV0cmlldmVkIGFzeW5jaHJvbm91c2x5XHJcbiAgICB2YXIgaXNMb2FkaW5nU2V0dGVyID0gJHBhcnNlKGF0dHJzLnR5cGVhaGVhZExvYWRpbmcpLmFzc2lnbiB8fCBhbmd1bGFyLm5vb3A7XHJcblxyXG4gICAgLy9hIGZ1bmN0aW9uIHRvIGRldGVybWluZSBpZiBhbiBldmVudCBzaG91bGQgY2F1c2Ugc2VsZWN0aW9uXHJcbiAgICB2YXIgaXNTZWxlY3RFdmVudCA9IGF0dHJzLnR5cGVhaGVhZFNob3VsZFNlbGVjdCA/ICRwYXJzZShhdHRycy50eXBlYWhlYWRTaG91bGRTZWxlY3QpIDogZnVuY3Rpb24oc2NvcGUsIHZhbHMpIHtcclxuICAgICAgdmFyIGV2dCA9IHZhbHMuJGV2ZW50O1xyXG4gICAgICByZXR1cm4gZXZ0LndoaWNoID09PSAxMyB8fCBldnQud2hpY2ggPT09IDk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8vYSBjYWxsYmFjayBleGVjdXRlZCB3aGVuIGEgbWF0Y2ggaXMgc2VsZWN0ZWRcclxuICAgIHZhciBvblNlbGVjdENhbGxiYWNrID0gJHBhcnNlKGF0dHJzLnR5cGVhaGVhZE9uU2VsZWN0KTtcclxuXHJcbiAgICAvL3Nob3VsZCBpdCBzZWxlY3QgaGlnaGxpZ2h0ZWQgcG9wdXAgdmFsdWUgd2hlbiBsb3NpbmcgZm9jdXM/XHJcbiAgICB2YXIgaXNTZWxlY3RPbkJsdXIgPSBhbmd1bGFyLmlzRGVmaW5lZChhdHRycy50eXBlYWhlYWRTZWxlY3RPbkJsdXIpID8gb3JpZ2luYWxTY29wZS4kZXZhbChhdHRycy50eXBlYWhlYWRTZWxlY3RPbkJsdXIpIDogZmFsc2U7XHJcblxyXG4gICAgLy9iaW5kaW5nIHRvIGEgdmFyaWFibGUgdGhhdCBpbmRpY2F0ZXMgaWYgdGhlcmUgd2VyZSBubyByZXN1bHRzIGFmdGVyIHRoZSBxdWVyeSBpcyBjb21wbGV0ZWRcclxuICAgIHZhciBpc05vUmVzdWx0c1NldHRlciA9ICRwYXJzZShhdHRycy50eXBlYWhlYWROb1Jlc3VsdHMpLmFzc2lnbiB8fCBhbmd1bGFyLm5vb3A7XHJcblxyXG4gICAgdmFyIGlucHV0Rm9ybWF0dGVyID0gYXR0cnMudHlwZWFoZWFkSW5wdXRGb3JtYXR0ZXIgPyAkcGFyc2UoYXR0cnMudHlwZWFoZWFkSW5wdXRGb3JtYXR0ZXIpIDogdW5kZWZpbmVkO1xyXG5cclxuICAgIHZhciBhcHBlbmRUb0JvZHkgPSBhdHRycy50eXBlYWhlYWRBcHBlbmRUb0JvZHkgPyBvcmlnaW5hbFNjb3BlLiRldmFsKGF0dHJzLnR5cGVhaGVhZEFwcGVuZFRvQm9keSkgOiBmYWxzZTtcclxuXHJcbiAgICB2YXIgYXBwZW5kVG8gPSBhdHRycy50eXBlYWhlYWRBcHBlbmRUbyA/XHJcbiAgICAgIG9yaWdpbmFsU2NvcGUuJGV2YWwoYXR0cnMudHlwZWFoZWFkQXBwZW5kVG8pIDogbnVsbDtcclxuXHJcbiAgICB2YXIgZm9jdXNGaXJzdCA9IG9yaWdpbmFsU2NvcGUuJGV2YWwoYXR0cnMudHlwZWFoZWFkRm9jdXNGaXJzdCkgIT09IGZhbHNlO1xyXG5cclxuICAgIC8vSWYgaW5wdXQgbWF0Y2hlcyBhbiBpdGVtIG9mIHRoZSBsaXN0IGV4YWN0bHksIHNlbGVjdCBpdCBhdXRvbWF0aWNhbGx5XHJcbiAgICB2YXIgc2VsZWN0T25FeGFjdCA9IGF0dHJzLnR5cGVhaGVhZFNlbGVjdE9uRXhhY3QgPyBvcmlnaW5hbFNjb3BlLiRldmFsKGF0dHJzLnR5cGVhaGVhZFNlbGVjdE9uRXhhY3QpIDogZmFsc2U7XHJcblxyXG4gICAgLy9iaW5kaW5nIHRvIGEgdmFyaWFibGUgdGhhdCBpbmRpY2F0ZXMgaWYgZHJvcGRvd24gaXMgb3BlblxyXG4gICAgdmFyIGlzT3BlblNldHRlciA9ICRwYXJzZShhdHRycy50eXBlYWhlYWRJc09wZW4pLmFzc2lnbiB8fCBhbmd1bGFyLm5vb3A7XHJcblxyXG4gICAgdmFyIHNob3dIaW50ID0gb3JpZ2luYWxTY29wZS4kZXZhbChhdHRycy50eXBlYWhlYWRTaG93SGludCkgfHwgZmFsc2U7XHJcblxyXG4gICAgLy9JTlRFUk5BTCBWQVJJQUJMRVNcclxuXHJcbiAgICAvL21vZGVsIHNldHRlciBleGVjdXRlZCB1cG9uIG1hdGNoIHNlbGVjdGlvblxyXG4gICAgdmFyIHBhcnNlZE1vZGVsID0gJHBhcnNlKGF0dHJzLm5nTW9kZWwpO1xyXG4gICAgdmFyIGludm9rZU1vZGVsU2V0dGVyID0gJHBhcnNlKGF0dHJzLm5nTW9kZWwgKyAnKCQkJHApJyk7XHJcbiAgICB2YXIgJHNldE1vZGVsVmFsdWUgPSBmdW5jdGlvbihzY29wZSwgbmV3VmFsdWUpIHtcclxuICAgICAgaWYgKGFuZ3VsYXIuaXNGdW5jdGlvbihwYXJzZWRNb2RlbChvcmlnaW5hbFNjb3BlKSkgJiZcclxuICAgICAgICBuZ01vZGVsT3B0aW9ucyAmJiBuZ01vZGVsT3B0aW9ucy4kb3B0aW9ucyAmJiBuZ01vZGVsT3B0aW9ucy4kb3B0aW9ucy5nZXR0ZXJTZXR0ZXIpIHtcclxuICAgICAgICByZXR1cm4gaW52b2tlTW9kZWxTZXR0ZXIoc2NvcGUsIHskJCRwOiBuZXdWYWx1ZX0pO1xyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4gcGFyc2VkTW9kZWwuYXNzaWduKHNjb3BlLCBuZXdWYWx1ZSk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8vZXhwcmVzc2lvbnMgdXNlZCBieSB0eXBlYWhlYWRcclxuICAgIHZhciBwYXJzZXJSZXN1bHQgPSB0eXBlYWhlYWRQYXJzZXIucGFyc2UoYXR0cnMudWliVHlwZWFoZWFkKTtcclxuXHJcbiAgICB2YXIgaGFzRm9jdXM7XHJcblxyXG4gICAgLy9Vc2VkIHRvIGF2b2lkIGJ1ZyBpbiBpT1Mgd2VidmlldyB3aGVyZSBpT1Mga2V5Ym9hcmQgZG9lcyBub3QgZmlyZVxyXG4gICAgLy9tb3VzZWRvd24gJiBtb3VzZXVwIGV2ZW50c1xyXG4gICAgLy9Jc3N1ZSAjMzY5OVxyXG4gICAgdmFyIHNlbGVjdGVkO1xyXG5cclxuICAgIC8vY3JlYXRlIGEgY2hpbGQgc2NvcGUgZm9yIHRoZSB0eXBlYWhlYWQgZGlyZWN0aXZlIHNvIHdlIGFyZSBub3QgcG9sbHV0aW5nIG9yaWdpbmFsIHNjb3BlXHJcbiAgICAvL3dpdGggdHlwZWFoZWFkLXNwZWNpZmljIGRhdGEgKG1hdGNoZXMsIHF1ZXJ5IGV0Yy4pXHJcbiAgICB2YXIgc2NvcGUgPSBvcmlnaW5hbFNjb3BlLiRuZXcoKTtcclxuICAgIHZhciBvZmZEZXN0cm95ID0gb3JpZ2luYWxTY29wZS4kb24oJyRkZXN0cm95JywgZnVuY3Rpb24oKSB7XHJcbiAgICAgIHNjb3BlLiRkZXN0cm95KCk7XHJcbiAgICB9KTtcclxuICAgIHNjb3BlLiRvbignJGRlc3Ryb3knLCBvZmZEZXN0cm95KTtcclxuXHJcbiAgICAvLyBXQUktQVJJQVxyXG4gICAgdmFyIHBvcHVwSWQgPSAndHlwZWFoZWFkLScgKyBzY29wZS4kaWQgKyAnLScgKyBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAxMDAwMCk7XHJcbiAgICBlbGVtZW50LmF0dHIoe1xyXG4gICAgICAnYXJpYS1hdXRvY29tcGxldGUnOiAnbGlzdCcsXHJcbiAgICAgICdhcmlhLWV4cGFuZGVkJzogZmFsc2UsXHJcbiAgICAgICdhcmlhLW93bnMnOiBwb3B1cElkXHJcbiAgICB9KTtcclxuXHJcbiAgICB2YXIgaW5wdXRzQ29udGFpbmVyLCBoaW50SW5wdXRFbGVtO1xyXG4gICAgLy9hZGQgcmVhZC1vbmx5IGlucHV0IHRvIHNob3cgaGludFxyXG4gICAgaWYgKHNob3dIaW50KSB7XHJcbiAgICAgIGlucHV0c0NvbnRhaW5lciA9IGFuZ3VsYXIuZWxlbWVudCgnPGRpdj48L2Rpdj4nKTtcclxuICAgICAgaW5wdXRzQ29udGFpbmVyLmNzcygncG9zaXRpb24nLCAncmVsYXRpdmUnKTtcclxuICAgICAgZWxlbWVudC5hZnRlcihpbnB1dHNDb250YWluZXIpO1xyXG4gICAgICBoaW50SW5wdXRFbGVtID0gZWxlbWVudC5jbG9uZSgpO1xyXG4gICAgICBoaW50SW5wdXRFbGVtLmF0dHIoJ3BsYWNlaG9sZGVyJywgJycpO1xyXG4gICAgICBoaW50SW5wdXRFbGVtLmF0dHIoJ3RhYmluZGV4JywgJy0xJyk7XHJcbiAgICAgIGhpbnRJbnB1dEVsZW0udmFsKCcnKTtcclxuICAgICAgaGludElucHV0RWxlbS5jc3Moe1xyXG4gICAgICAgICdwb3NpdGlvbic6ICdhYnNvbHV0ZScsXHJcbiAgICAgICAgJ3RvcCc6ICcwcHgnLFxyXG4gICAgICAgICdsZWZ0JzogJzBweCcsXHJcbiAgICAgICAgJ2JvcmRlci1jb2xvcic6ICd0cmFuc3BhcmVudCcsXHJcbiAgICAgICAgJ2JveC1zaGFkb3cnOiAnbm9uZScsXHJcbiAgICAgICAgJ29wYWNpdHknOiAxLFxyXG4gICAgICAgICdiYWNrZ3JvdW5kJzogJ25vbmUgMCUgMCUgLyBhdXRvIHJlcGVhdCBzY3JvbGwgcGFkZGluZy1ib3ggYm9yZGVyLWJveCByZ2IoMjU1LCAyNTUsIDI1NSknLFxyXG4gICAgICAgICdjb2xvcic6ICcjOTk5J1xyXG4gICAgICB9KTtcclxuICAgICAgZWxlbWVudC5jc3Moe1xyXG4gICAgICAgICdwb3NpdGlvbic6ICdyZWxhdGl2ZScsXHJcbiAgICAgICAgJ3ZlcnRpY2FsLWFsaWduJzogJ3RvcCcsXHJcbiAgICAgICAgJ2JhY2tncm91bmQtY29sb3InOiAndHJhbnNwYXJlbnQnXHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgaWYgKGhpbnRJbnB1dEVsZW0uYXR0cignaWQnKSkge1xyXG4gICAgICAgIGhpbnRJbnB1dEVsZW0ucmVtb3ZlQXR0cignaWQnKTsgLy8gcmVtb3ZlIGR1cGxpY2F0ZSBpZCBpZiBwcmVzZW50LlxyXG4gICAgICB9XHJcbiAgICAgIGlucHV0c0NvbnRhaW5lci5hcHBlbmQoaGludElucHV0RWxlbSk7XHJcbiAgICAgIGhpbnRJbnB1dEVsZW0uYWZ0ZXIoZWxlbWVudCk7XHJcbiAgICB9XHJcblxyXG4gICAgLy9wb3AtdXAgZWxlbWVudCB1c2VkIHRvIGRpc3BsYXkgbWF0Y2hlc1xyXG4gICAgdmFyIHBvcFVwRWwgPSBhbmd1bGFyLmVsZW1lbnQoJzxkaXYgdWliLXR5cGVhaGVhZC1wb3B1cD48L2Rpdj4nKTtcclxuICAgIHBvcFVwRWwuYXR0cih7XHJcbiAgICAgIGlkOiBwb3B1cElkLFxyXG4gICAgICBtYXRjaGVzOiAnbWF0Y2hlcycsXHJcbiAgICAgIGFjdGl2ZTogJ2FjdGl2ZUlkeCcsXHJcbiAgICAgIHNlbGVjdDogJ3NlbGVjdChhY3RpdmVJZHgsIGV2dCknLFxyXG4gICAgICAnbW92ZS1pbi1wcm9ncmVzcyc6ICdtb3ZlSW5Qcm9ncmVzcycsXHJcbiAgICAgIHF1ZXJ5OiAncXVlcnknLFxyXG4gICAgICBwb3NpdGlvbjogJ3Bvc2l0aW9uJyxcclxuICAgICAgJ2Fzc2lnbi1pcy1vcGVuJzogJ2Fzc2lnbklzT3Blbihpc09wZW4pJyxcclxuICAgICAgZGVib3VuY2U6ICdkZWJvdW5jZVVwZGF0ZSdcclxuICAgIH0pO1xyXG4gICAgLy9jdXN0b20gaXRlbSB0ZW1wbGF0ZVxyXG4gICAgaWYgKGFuZ3VsYXIuaXNEZWZpbmVkKGF0dHJzLnR5cGVhaGVhZFRlbXBsYXRlVXJsKSkge1xyXG4gICAgICBwb3BVcEVsLmF0dHIoJ3RlbXBsYXRlLXVybCcsIGF0dHJzLnR5cGVhaGVhZFRlbXBsYXRlVXJsKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoYW5ndWxhci5pc0RlZmluZWQoYXR0cnMudHlwZWFoZWFkUG9wdXBUZW1wbGF0ZVVybCkpIHtcclxuICAgICAgcG9wVXBFbC5hdHRyKCdwb3B1cC10ZW1wbGF0ZS11cmwnLCBhdHRycy50eXBlYWhlYWRQb3B1cFRlbXBsYXRlVXJsKTtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgcmVzZXRIaW50ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgIGlmIChzaG93SGludCkge1xyXG4gICAgICAgIGhpbnRJbnB1dEVsZW0udmFsKCcnKTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICB2YXIgcmVzZXRNYXRjaGVzID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgIHNjb3BlLm1hdGNoZXMgPSBbXTtcclxuICAgICAgc2NvcGUuYWN0aXZlSWR4ID0gLTE7XHJcbiAgICAgIGVsZW1lbnQuYXR0cignYXJpYS1leHBhbmRlZCcsIGZhbHNlKTtcclxuICAgICAgcmVzZXRIaW50KCk7XHJcbiAgICB9O1xyXG5cclxuICAgIHZhciBnZXRNYXRjaElkID0gZnVuY3Rpb24oaW5kZXgpIHtcclxuICAgICAgcmV0dXJuIHBvcHVwSWQgKyAnLW9wdGlvbi0nICsgaW5kZXg7XHJcbiAgICB9O1xyXG5cclxuICAgIC8vIEluZGljYXRlIHRoYXQgdGhlIHNwZWNpZmllZCBtYXRjaCBpcyB0aGUgYWN0aXZlIChwcmUtc2VsZWN0ZWQpIGl0ZW0gaW4gdGhlIGxpc3Qgb3duZWQgYnkgdGhpcyB0eXBlYWhlYWQuXHJcbiAgICAvLyBUaGlzIGF0dHJpYnV0ZSBpcyBhZGRlZCBvciByZW1vdmVkIGF1dG9tYXRpY2FsbHkgd2hlbiB0aGUgYGFjdGl2ZUlkeGAgY2hhbmdlcy5cclxuICAgIHNjb3BlLiR3YXRjaCgnYWN0aXZlSWR4JywgZnVuY3Rpb24oaW5kZXgpIHtcclxuICAgICAgaWYgKGluZGV4IDwgMCkge1xyXG4gICAgICAgIGVsZW1lbnQucmVtb3ZlQXR0cignYXJpYS1hY3RpdmVkZXNjZW5kYW50Jyk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgZWxlbWVudC5hdHRyKCdhcmlhLWFjdGl2ZWRlc2NlbmRhbnQnLCBnZXRNYXRjaElkKGluZGV4KSk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIHZhciBpbnB1dElzRXhhY3RNYXRjaCA9IGZ1bmN0aW9uKGlucHV0VmFsdWUsIGluZGV4KSB7XHJcbiAgICAgIGlmIChzY29wZS5tYXRjaGVzLmxlbmd0aCA+IGluZGV4ICYmIGlucHV0VmFsdWUpIHtcclxuICAgICAgICByZXR1cm4gaW5wdXRWYWx1ZS50b1VwcGVyQ2FzZSgpID09PSBzY29wZS5tYXRjaGVzW2luZGV4XS5sYWJlbC50b1VwcGVyQ2FzZSgpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9O1xyXG5cclxuICAgIHZhciBnZXRNYXRjaGVzQXN5bmMgPSBmdW5jdGlvbihpbnB1dFZhbHVlLCBldnQpIHtcclxuICAgICAgdmFyIGxvY2FscyA9IHskdmlld1ZhbHVlOiBpbnB1dFZhbHVlfTtcclxuICAgICAgaXNMb2FkaW5nU2V0dGVyKG9yaWdpbmFsU2NvcGUsIHRydWUpO1xyXG4gICAgICBpc05vUmVzdWx0c1NldHRlcihvcmlnaW5hbFNjb3BlLCBmYWxzZSk7XHJcbiAgICAgICRxLndoZW4ocGFyc2VyUmVzdWx0LnNvdXJjZShvcmlnaW5hbFNjb3BlLCBsb2NhbHMpKS50aGVuKGZ1bmN0aW9uKG1hdGNoZXMpIHtcclxuICAgICAgICAvL2l0IG1pZ2h0IGhhcHBlbiB0aGF0IHNldmVyYWwgYXN5bmMgcXVlcmllcyB3ZXJlIGluIHByb2dyZXNzIGlmIGEgdXNlciB3ZXJlIHR5cGluZyBmYXN0XHJcbiAgICAgICAgLy9idXQgd2UgYXJlIGludGVyZXN0ZWQgb25seSBpbiByZXNwb25zZXMgdGhhdCBjb3JyZXNwb25kIHRvIHRoZSBjdXJyZW50IHZpZXcgdmFsdWVcclxuICAgICAgICB2YXIgb25DdXJyZW50UmVxdWVzdCA9IGlucHV0VmFsdWUgPT09IG1vZGVsQ3RybC4kdmlld1ZhbHVlO1xyXG4gICAgICAgIGlmIChvbkN1cnJlbnRSZXF1ZXN0ICYmIGhhc0ZvY3VzKSB7XHJcbiAgICAgICAgICBpZiAobWF0Y2hlcyAmJiBtYXRjaGVzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgc2NvcGUuYWN0aXZlSWR4ID0gZm9jdXNGaXJzdCA/IDAgOiAtMTtcclxuICAgICAgICAgICAgaXNOb1Jlc3VsdHNTZXR0ZXIob3JpZ2luYWxTY29wZSwgZmFsc2UpO1xyXG4gICAgICAgICAgICBzY29wZS5tYXRjaGVzLmxlbmd0aCA9IDA7XHJcblxyXG4gICAgICAgICAgICAvL3RyYW5zZm9ybSBsYWJlbHNcclxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBtYXRjaGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgbG9jYWxzW3BhcnNlclJlc3VsdC5pdGVtTmFtZV0gPSBtYXRjaGVzW2ldO1xyXG4gICAgICAgICAgICAgIHNjb3BlLm1hdGNoZXMucHVzaCh7XHJcbiAgICAgICAgICAgICAgICBpZDogZ2V0TWF0Y2hJZChpKSxcclxuICAgICAgICAgICAgICAgIGxhYmVsOiBwYXJzZXJSZXN1bHQudmlld01hcHBlcihzY29wZSwgbG9jYWxzKSxcclxuICAgICAgICAgICAgICAgIG1vZGVsOiBtYXRjaGVzW2ldXHJcbiAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHNjb3BlLnF1ZXJ5ID0gaW5wdXRWYWx1ZTtcclxuICAgICAgICAgICAgLy9wb3NpdGlvbiBwb3AtdXAgd2l0aCBtYXRjaGVzIC0gd2UgbmVlZCB0byByZS1jYWxjdWxhdGUgaXRzIHBvc2l0aW9uIGVhY2ggdGltZSB3ZSBhcmUgb3BlbmluZyBhIHdpbmRvd1xyXG4gICAgICAgICAgICAvL3dpdGggbWF0Y2hlcyBhcyBhIHBvcC11cCBtaWdodCBiZSBhYnNvbHV0ZS1wb3NpdGlvbmVkIGFuZCBwb3NpdGlvbiBvZiBhbiBpbnB1dCBtaWdodCBoYXZlIGNoYW5nZWQgb24gYSBwYWdlXHJcbiAgICAgICAgICAgIC8vZHVlIHRvIG90aGVyIGVsZW1lbnRzIGJlaW5nIHJlbmRlcmVkXHJcbiAgICAgICAgICAgIHJlY2FsY3VsYXRlUG9zaXRpb24oKTtcclxuXHJcbiAgICAgICAgICAgIGVsZW1lbnQuYXR0cignYXJpYS1leHBhbmRlZCcsIHRydWUpO1xyXG5cclxuICAgICAgICAgICAgLy9TZWxlY3QgdGhlIHNpbmdsZSByZW1haW5pbmcgb3B0aW9uIGlmIHVzZXIgaW5wdXQgbWF0Y2hlc1xyXG4gICAgICAgICAgICBpZiAoc2VsZWN0T25FeGFjdCAmJiBzY29wZS5tYXRjaGVzLmxlbmd0aCA9PT0gMSAmJiBpbnB1dElzRXhhY3RNYXRjaChpbnB1dFZhbHVlLCAwKSkge1xyXG4gICAgICAgICAgICAgIGlmIChhbmd1bGFyLmlzTnVtYmVyKHNjb3BlLmRlYm91bmNlVXBkYXRlKSB8fCBhbmd1bGFyLmlzT2JqZWN0KHNjb3BlLmRlYm91bmNlVXBkYXRlKSkge1xyXG4gICAgICAgICAgICAgICAgJCRkZWJvdW5jZShmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgc2NvcGUuc2VsZWN0KDAsIGV2dCk7XHJcbiAgICAgICAgICAgICAgICB9LCBhbmd1bGFyLmlzTnVtYmVyKHNjb3BlLmRlYm91bmNlVXBkYXRlKSA/IHNjb3BlLmRlYm91bmNlVXBkYXRlIDogc2NvcGUuZGVib3VuY2VVcGRhdGVbJ2RlZmF1bHQnXSk7XHJcbiAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHNjb3BlLnNlbGVjdCgwLCBldnQpO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKHNob3dIaW50KSB7XHJcbiAgICAgICAgICAgICAgdmFyIGZpcnN0TGFiZWwgPSBzY29wZS5tYXRjaGVzWzBdLmxhYmVsO1xyXG4gICAgICAgICAgICAgIGlmIChhbmd1bGFyLmlzU3RyaW5nKGlucHV0VmFsdWUpICYmXHJcbiAgICAgICAgICAgICAgICBpbnB1dFZhbHVlLmxlbmd0aCA+IDAgJiZcclxuICAgICAgICAgICAgICAgIGZpcnN0TGFiZWwuc2xpY2UoMCwgaW5wdXRWYWx1ZS5sZW5ndGgpLnRvVXBwZXJDYXNlKCkgPT09IGlucHV0VmFsdWUudG9VcHBlckNhc2UoKSkge1xyXG4gICAgICAgICAgICAgICAgaGludElucHV0RWxlbS52YWwoaW5wdXRWYWx1ZSArIGZpcnN0TGFiZWwuc2xpY2UoaW5wdXRWYWx1ZS5sZW5ndGgpKTtcclxuICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgaGludElucHV0RWxlbS52YWwoJycpO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmVzZXRNYXRjaGVzKCk7XHJcbiAgICAgICAgICAgIGlzTm9SZXN1bHRzU2V0dGVyKG9yaWdpbmFsU2NvcGUsIHRydWUpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAob25DdXJyZW50UmVxdWVzdCkge1xyXG4gICAgICAgICAgaXNMb2FkaW5nU2V0dGVyKG9yaWdpbmFsU2NvcGUsIGZhbHNlKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0sIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHJlc2V0TWF0Y2hlcygpO1xyXG4gICAgICAgIGlzTG9hZGluZ1NldHRlcihvcmlnaW5hbFNjb3BlLCBmYWxzZSk7XHJcbiAgICAgICAgaXNOb1Jlc3VsdHNTZXR0ZXIob3JpZ2luYWxTY29wZSwgdHJ1ZSk7XHJcbiAgICAgIH0pO1xyXG4gICAgfTtcclxuXHJcbiAgICAvLyBiaW5kIGV2ZW50cyBvbmx5IGlmIGFwcGVuZFRvQm9keSBwYXJhbXMgZXhpc3QgLSBwZXJmb3JtYW5jZSBmZWF0dXJlXHJcbiAgICBpZiAoYXBwZW5kVG9Cb2R5KSB7XHJcbiAgICAgIGFuZ3VsYXIuZWxlbWVudCgkd2luZG93KS5vbigncmVzaXplJywgZmlyZVJlY2FsY3VsYXRpbmcpO1xyXG4gICAgICAkZG9jdW1lbnQuZmluZCgnYm9keScpLm9uKCdzY3JvbGwnLCBmaXJlUmVjYWxjdWxhdGluZyk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gRGVjbGFyZSB0aGUgZGVib3VuY2VkIGZ1bmN0aW9uIG91dHNpZGUgcmVjYWxjdWxhdGluZyBmb3JcclxuICAgIC8vIHByb3BlciBkZWJvdW5jaW5nXHJcbiAgICB2YXIgZGVib3VuY2VkUmVjYWxjdWxhdGUgPSAkJGRlYm91bmNlKGZ1bmN0aW9uKCkge1xyXG4gICAgICAvLyBpZiBwb3B1cCBpcyB2aXNpYmxlXHJcbiAgICAgIGlmIChzY29wZS5tYXRjaGVzLmxlbmd0aCkge1xyXG4gICAgICAgIHJlY2FsY3VsYXRlUG9zaXRpb24oKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgc2NvcGUubW92ZUluUHJvZ3Jlc3MgPSBmYWxzZTtcclxuICAgIH0sIGV2ZW50RGVib3VuY2VUaW1lKTtcclxuXHJcbiAgICAvLyBEZWZhdWx0IHByb2dyZXNzIHR5cGVcclxuICAgIHNjb3BlLm1vdmVJblByb2dyZXNzID0gZmFsc2U7XHJcblxyXG4gICAgZnVuY3Rpb24gZmlyZVJlY2FsY3VsYXRpbmcoKSB7XHJcbiAgICAgIGlmICghc2NvcGUubW92ZUluUHJvZ3Jlc3MpIHtcclxuICAgICAgICBzY29wZS5tb3ZlSW5Qcm9ncmVzcyA9IHRydWU7XHJcbiAgICAgICAgc2NvcGUuJGRpZ2VzdCgpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBkZWJvdW5jZWRSZWNhbGN1bGF0ZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIHJlY2FsY3VsYXRlIGFjdHVhbCBwb3NpdGlvbiBhbmQgc2V0IG5ldyB2YWx1ZXMgdG8gc2NvcGVcclxuICAgIC8vIGFmdGVyIGRpZ2VzdCBsb29wIGlzIHBvcHVwIGluIHJpZ2h0IHBvc2l0aW9uXHJcbiAgICBmdW5jdGlvbiByZWNhbGN1bGF0ZVBvc2l0aW9uKCkge1xyXG4gICAgICBzY29wZS5wb3NpdGlvbiA9IGFwcGVuZFRvQm9keSA/ICRwb3NpdGlvbi5vZmZzZXQoZWxlbWVudCkgOiAkcG9zaXRpb24ucG9zaXRpb24oZWxlbWVudCk7XHJcbiAgICAgIHNjb3BlLnBvc2l0aW9uLnRvcCArPSBlbGVtZW50LnByb3AoJ29mZnNldEhlaWdodCcpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vd2UgbmVlZCB0byBwcm9wYWdhdGUgdXNlcidzIHF1ZXJ5IHNvIHdlIGNhbiBoaWdsaWdodCBtYXRjaGVzXHJcbiAgICBzY29wZS5xdWVyeSA9IHVuZGVmaW5lZDtcclxuXHJcbiAgICAvL0RlY2xhcmUgdGhlIHRpbWVvdXQgcHJvbWlzZSB2YXIgb3V0c2lkZSB0aGUgZnVuY3Rpb24gc2NvcGUgc28gdGhhdCBzdGFja2VkIGNhbGxzIGNhbiBiZSBjYW5jZWxsZWQgbGF0ZXJcclxuICAgIHZhciB0aW1lb3V0UHJvbWlzZTtcclxuXHJcbiAgICB2YXIgc2NoZWR1bGVTZWFyY2hXaXRoVGltZW91dCA9IGZ1bmN0aW9uKGlucHV0VmFsdWUpIHtcclxuICAgICAgdGltZW91dFByb21pc2UgPSAkdGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgICBnZXRNYXRjaGVzQXN5bmMoaW5wdXRWYWx1ZSk7XHJcbiAgICAgIH0sIHdhaXRUaW1lKTtcclxuICAgIH07XHJcblxyXG4gICAgdmFyIGNhbmNlbFByZXZpb3VzVGltZW91dCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICBpZiAodGltZW91dFByb21pc2UpIHtcclxuICAgICAgICAkdGltZW91dC5jYW5jZWwodGltZW91dFByb21pc2UpO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIHJlc2V0TWF0Y2hlcygpO1xyXG5cclxuICAgIHNjb3BlLmFzc2lnbklzT3BlbiA9IGZ1bmN0aW9uIChpc09wZW4pIHtcclxuICAgICAgaXNPcGVuU2V0dGVyKG9yaWdpbmFsU2NvcGUsIGlzT3Blbik7XHJcbiAgICB9O1xyXG5cclxuICAgIHNjb3BlLnNlbGVjdCA9IGZ1bmN0aW9uKGFjdGl2ZUlkeCwgZXZ0KSB7XHJcbiAgICAgIC8vY2FsbGVkIGZyb20gd2l0aGluIHRoZSAkZGlnZXN0KCkgY3ljbGVcclxuICAgICAgdmFyIGxvY2FscyA9IHt9O1xyXG4gICAgICB2YXIgbW9kZWwsIGl0ZW07XHJcblxyXG4gICAgICBzZWxlY3RlZCA9IHRydWU7XHJcbiAgICAgIGxvY2Fsc1twYXJzZXJSZXN1bHQuaXRlbU5hbWVdID0gaXRlbSA9IHNjb3BlLm1hdGNoZXNbYWN0aXZlSWR4XS5tb2RlbDtcclxuICAgICAgbW9kZWwgPSBwYXJzZXJSZXN1bHQubW9kZWxNYXBwZXIob3JpZ2luYWxTY29wZSwgbG9jYWxzKTtcclxuICAgICAgJHNldE1vZGVsVmFsdWUob3JpZ2luYWxTY29wZSwgbW9kZWwpO1xyXG4gICAgICBtb2RlbEN0cmwuJHNldFZhbGlkaXR5KCdlZGl0YWJsZScsIHRydWUpO1xyXG4gICAgICBtb2RlbEN0cmwuJHNldFZhbGlkaXR5KCdwYXJzZScsIHRydWUpO1xyXG5cclxuICAgICAgb25TZWxlY3RDYWxsYmFjayhvcmlnaW5hbFNjb3BlLCB7XHJcbiAgICAgICAgJGl0ZW06IGl0ZW0sXHJcbiAgICAgICAgJG1vZGVsOiBtb2RlbCxcclxuICAgICAgICAkbGFiZWw6IHBhcnNlclJlc3VsdC52aWV3TWFwcGVyKG9yaWdpbmFsU2NvcGUsIGxvY2FscyksXHJcbiAgICAgICAgJGV2ZW50OiBldnRcclxuICAgICAgfSk7XHJcblxyXG4gICAgICByZXNldE1hdGNoZXMoKTtcclxuXHJcbiAgICAgIC8vcmV0dXJuIGZvY3VzIHRvIHRoZSBpbnB1dCBlbGVtZW50IGlmIGEgbWF0Y2ggd2FzIHNlbGVjdGVkIHZpYSBhIG1vdXNlIGNsaWNrIGV2ZW50XHJcbiAgICAgIC8vIHVzZSB0aW1lb3V0IHRvIGF2b2lkICRyb290U2NvcGU6aW5wcm9nIGVycm9yXHJcbiAgICAgIGlmIChzY29wZS4kZXZhbChhdHRycy50eXBlYWhlYWRGb2N1c09uU2VsZWN0KSAhPT0gZmFsc2UpIHtcclxuICAgICAgICAkdGltZW91dChmdW5jdGlvbigpIHsgZWxlbWVudFswXS5mb2N1cygpOyB9LCAwLCBmYWxzZSk7XHJcbiAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgLy9iaW5kIGtleWJvYXJkIGV2ZW50czogYXJyb3dzIHVwKDM4KSAvIGRvd24oNDApLCBlbnRlcigxMykgYW5kIHRhYig5KSwgZXNjKDI3KVxyXG4gICAgZWxlbWVudC5vbigna2V5ZG93bicsIGZ1bmN0aW9uKGV2dCkge1xyXG4gICAgICAvL3R5cGVhaGVhZCBpcyBvcGVuIGFuZCBhbiBcImludGVyZXN0aW5nXCIga2V5IHdhcyBwcmVzc2VkXHJcbiAgICAgIGlmIChzY29wZS5tYXRjaGVzLmxlbmd0aCA9PT0gMCB8fCBIT1RfS0VZUy5pbmRleE9mKGV2dC53aGljaCkgPT09IC0xKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB2YXIgc2hvdWxkU2VsZWN0ID0gaXNTZWxlY3RFdmVudChvcmlnaW5hbFNjb3BlLCB7JGV2ZW50OiBldnR9KTtcclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBpZiB0aGVyZSdzIG5vdGhpbmcgc2VsZWN0ZWQgKGkuZS4gZm9jdXNGaXJzdCkgYW5kIGVudGVyIG9yIHRhYiBpcyBoaXRcclxuICAgICAgICogb3JcclxuICAgICAgICogc2hpZnQgKyB0YWIgaXMgcHJlc3NlZCB0byBicmluZyBmb2N1cyB0byB0aGUgcHJldmlvdXMgZWxlbWVudFxyXG4gICAgICAgKiB0aGVuIGNsZWFyIHRoZSByZXN1bHRzXHJcbiAgICAgICAqL1xyXG4gICAgICBpZiAoc2NvcGUuYWN0aXZlSWR4ID09PSAtMSAmJiBzaG91bGRTZWxlY3QgfHwgZXZ0LndoaWNoID09PSA5ICYmICEhZXZ0LnNoaWZ0S2V5KSB7XHJcbiAgICAgICAgcmVzZXRNYXRjaGVzKCk7XHJcbiAgICAgICAgc2NvcGUuJGRpZ2VzdCgpO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG5cclxuICAgICAgZXZ0LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgIHZhciB0YXJnZXQ7XHJcbiAgICAgIHN3aXRjaCAoZXZ0LndoaWNoKSB7XHJcbiAgICAgICAgY2FzZSAyNzogLy8gZXNjYXBlXHJcbiAgICAgICAgICBldnQuc3RvcFByb3BhZ2F0aW9uKCk7XHJcblxyXG4gICAgICAgICAgcmVzZXRNYXRjaGVzKCk7XHJcbiAgICAgICAgICBvcmlnaW5hbFNjb3BlLiRkaWdlc3QoKTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgMzg6IC8vIHVwIGFycm93XHJcbiAgICAgICAgICBzY29wZS5hY3RpdmVJZHggPSAoc2NvcGUuYWN0aXZlSWR4ID4gMCA/IHNjb3BlLmFjdGl2ZUlkeCA6IHNjb3BlLm1hdGNoZXMubGVuZ3RoKSAtIDE7XHJcbiAgICAgICAgICBzY29wZS4kZGlnZXN0KCk7XHJcbiAgICAgICAgICB0YXJnZXQgPSBwb3BVcEVsWzBdLnF1ZXJ5U2VsZWN0b3JBbGwoJy51aWItdHlwZWFoZWFkLW1hdGNoJylbc2NvcGUuYWN0aXZlSWR4XTtcclxuICAgICAgICAgIHRhcmdldC5wYXJlbnROb2RlLnNjcm9sbFRvcCA9IHRhcmdldC5vZmZzZXRUb3A7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIDQwOiAvLyBkb3duIGFycm93XHJcbiAgICAgICAgICBzY29wZS5hY3RpdmVJZHggPSAoc2NvcGUuYWN0aXZlSWR4ICsgMSkgJSBzY29wZS5tYXRjaGVzLmxlbmd0aDtcclxuICAgICAgICAgIHNjb3BlLiRkaWdlc3QoKTtcclxuICAgICAgICAgIHRhcmdldCA9IHBvcFVwRWxbMF0ucXVlcnlTZWxlY3RvckFsbCgnLnVpYi10eXBlYWhlYWQtbWF0Y2gnKVtzY29wZS5hY3RpdmVJZHhdO1xyXG4gICAgICAgICAgdGFyZ2V0LnBhcmVudE5vZGUuc2Nyb2xsVG9wID0gdGFyZ2V0Lm9mZnNldFRvcDtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICBpZiAoc2hvdWxkU2VsZWN0KSB7XHJcbiAgICAgICAgICAgIHNjb3BlLiRhcHBseShmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICBpZiAoYW5ndWxhci5pc051bWJlcihzY29wZS5kZWJvdW5jZVVwZGF0ZSkgfHwgYW5ndWxhci5pc09iamVjdChzY29wZS5kZWJvdW5jZVVwZGF0ZSkpIHtcclxuICAgICAgICAgICAgICAgICQkZGVib3VuY2UoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgIHNjb3BlLnNlbGVjdChzY29wZS5hY3RpdmVJZHgsIGV2dCk7XHJcbiAgICAgICAgICAgICAgICB9LCBhbmd1bGFyLmlzTnVtYmVyKHNjb3BlLmRlYm91bmNlVXBkYXRlKSA/IHNjb3BlLmRlYm91bmNlVXBkYXRlIDogc2NvcGUuZGVib3VuY2VVcGRhdGVbJ2RlZmF1bHQnXSk7XHJcbiAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHNjb3BlLnNlbGVjdChzY29wZS5hY3RpdmVJZHgsIGV2dCk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgZWxlbWVudC5iaW5kKCdmb2N1cycsIGZ1bmN0aW9uIChldnQpIHtcclxuICAgICAgaGFzRm9jdXMgPSB0cnVlO1xyXG4gICAgICBpZiAobWluTGVuZ3RoID09PSAwICYmICFtb2RlbEN0cmwuJHZpZXdWYWx1ZSkge1xyXG4gICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgZ2V0TWF0Y2hlc0FzeW5jKG1vZGVsQ3RybC4kdmlld1ZhbHVlLCBldnQpO1xyXG4gICAgICAgIH0sIDApO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICBlbGVtZW50LmJpbmQoJ2JsdXInLCBmdW5jdGlvbihldnQpIHtcclxuICAgICAgaWYgKGlzU2VsZWN0T25CbHVyICYmIHNjb3BlLm1hdGNoZXMubGVuZ3RoICYmIHNjb3BlLmFjdGl2ZUlkeCAhPT0gLTEgJiYgIXNlbGVjdGVkKSB7XHJcbiAgICAgICAgc2VsZWN0ZWQgPSB0cnVlO1xyXG4gICAgICAgIHNjb3BlLiRhcHBseShmdW5jdGlvbigpIHtcclxuICAgICAgICAgIGlmIChhbmd1bGFyLmlzT2JqZWN0KHNjb3BlLmRlYm91bmNlVXBkYXRlKSAmJiBhbmd1bGFyLmlzTnVtYmVyKHNjb3BlLmRlYm91bmNlVXBkYXRlLmJsdXIpKSB7XHJcbiAgICAgICAgICAgICQkZGVib3VuY2UoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgc2NvcGUuc2VsZWN0KHNjb3BlLmFjdGl2ZUlkeCwgZXZ0KTtcclxuICAgICAgICAgICAgfSwgc2NvcGUuZGVib3VuY2VVcGRhdGUuYmx1cik7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBzY29wZS5zZWxlY3Qoc2NvcGUuYWN0aXZlSWR4LCBldnQpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICAgIGlmICghaXNFZGl0YWJsZSAmJiBtb2RlbEN0cmwuJGVycm9yLmVkaXRhYmxlKSB7XHJcbiAgICAgICAgbW9kZWxDdHJsLiRzZXRWaWV3VmFsdWUoKTtcclxuICAgICAgICBzY29wZS4kYXBwbHkoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAvLyBSZXNldCB2YWxpZGl0eSBhcyB3ZSBhcmUgY2xlYXJpbmdcclxuICAgICAgICAgIG1vZGVsQ3RybC4kc2V0VmFsaWRpdHkoJ2VkaXRhYmxlJywgdHJ1ZSk7XHJcbiAgICAgICAgICBtb2RlbEN0cmwuJHNldFZhbGlkaXR5KCdwYXJzZScsIHRydWUpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGVsZW1lbnQudmFsKCcnKTtcclxuICAgICAgfVxyXG4gICAgICBoYXNGb2N1cyA9IGZhbHNlO1xyXG4gICAgICBzZWxlY3RlZCA9IGZhbHNlO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gS2VlcCByZWZlcmVuY2UgdG8gY2xpY2sgaGFuZGxlciB0byB1bmJpbmQgaXQuXHJcbiAgICB2YXIgZGlzbWlzc0NsaWNrSGFuZGxlciA9IGZ1bmN0aW9uKGV2dCkge1xyXG4gICAgICAvLyBJc3N1ZSAjMzk3M1xyXG4gICAgICAvLyBGaXJlZm94IHRyZWF0cyByaWdodCBjbGljayBhcyBhIGNsaWNrIG9uIGRvY3VtZW50XHJcbiAgICAgIGlmIChlbGVtZW50WzBdICE9PSBldnQudGFyZ2V0ICYmIGV2dC53aGljaCAhPT0gMyAmJiBzY29wZS5tYXRjaGVzLmxlbmd0aCAhPT0gMCkge1xyXG4gICAgICAgIHJlc2V0TWF0Y2hlcygpO1xyXG4gICAgICAgIGlmICghJHJvb3RTY29wZS4kJHBoYXNlKSB7XHJcbiAgICAgICAgICBvcmlnaW5hbFNjb3BlLiRkaWdlc3QoKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgJGRvY3VtZW50Lm9uKCdjbGljaycsIGRpc21pc3NDbGlja0hhbmRsZXIpO1xyXG5cclxuICAgIG9yaWdpbmFsU2NvcGUuJG9uKCckZGVzdHJveScsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAkZG9jdW1lbnQub2ZmKCdjbGljaycsIGRpc21pc3NDbGlja0hhbmRsZXIpO1xyXG4gICAgICBpZiAoYXBwZW5kVG9Cb2R5IHx8IGFwcGVuZFRvKSB7XHJcbiAgICAgICAgJHBvcHVwLnJlbW92ZSgpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoYXBwZW5kVG9Cb2R5KSB7XHJcbiAgICAgICAgYW5ndWxhci5lbGVtZW50KCR3aW5kb3cpLm9mZigncmVzaXplJywgZmlyZVJlY2FsY3VsYXRpbmcpO1xyXG4gICAgICAgICRkb2N1bWVudC5maW5kKCdib2R5Jykub2ZmKCdzY3JvbGwnLCBmaXJlUmVjYWxjdWxhdGluZyk7XHJcbiAgICAgIH1cclxuICAgICAgLy8gUHJldmVudCBqUXVlcnkgY2FjaGUgbWVtb3J5IGxlYWtcclxuICAgICAgcG9wVXBFbC5yZW1vdmUoKTtcclxuXHJcbiAgICAgIGlmIChzaG93SGludCkge1xyXG4gICAgICAgICAgaW5wdXRzQ29udGFpbmVyLnJlbW92ZSgpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICB2YXIgJHBvcHVwID0gJGNvbXBpbGUocG9wVXBFbCkoc2NvcGUpO1xyXG5cclxuICAgIGlmIChhcHBlbmRUb0JvZHkpIHtcclxuICAgICAgJGRvY3VtZW50LmZpbmQoJ2JvZHknKS5hcHBlbmQoJHBvcHVwKTtcclxuICAgIH0gZWxzZSBpZiAoYXBwZW5kVG8pIHtcclxuICAgICAgYW5ndWxhci5lbGVtZW50KGFwcGVuZFRvKS5lcSgwKS5hcHBlbmQoJHBvcHVwKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGVsZW1lbnQuYWZ0ZXIoJHBvcHVwKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmluaXQgPSBmdW5jdGlvbihfbW9kZWxDdHJsLCBfbmdNb2RlbE9wdGlvbnMpIHtcclxuICAgICAgbW9kZWxDdHJsID0gX21vZGVsQ3RybDtcclxuICAgICAgbmdNb2RlbE9wdGlvbnMgPSBfbmdNb2RlbE9wdGlvbnM7XHJcblxyXG4gICAgICBzY29wZS5kZWJvdW5jZVVwZGF0ZSA9IG1vZGVsQ3RybC4kb3B0aW9ucyAmJiAkcGFyc2UobW9kZWxDdHJsLiRvcHRpb25zLmRlYm91bmNlKShvcmlnaW5hbFNjb3BlKTtcclxuXHJcbiAgICAgIC8vcGx1ZyBpbnRvICRwYXJzZXJzIHBpcGVsaW5lIHRvIG9wZW4gYSB0eXBlYWhlYWQgb24gdmlldyBjaGFuZ2VzIGluaXRpYXRlZCBmcm9tIERPTVxyXG4gICAgICAvLyRwYXJzZXJzIGtpY2staW4gb24gYWxsIHRoZSBjaGFuZ2VzIGNvbWluZyBmcm9tIHRoZSB2aWV3IGFzIHdlbGwgYXMgbWFudWFsbHkgdHJpZ2dlcmVkIGJ5ICRzZXRWaWV3VmFsdWVcclxuICAgICAgbW9kZWxDdHJsLiRwYXJzZXJzLnVuc2hpZnQoZnVuY3Rpb24oaW5wdXRWYWx1ZSkge1xyXG4gICAgICAgIGhhc0ZvY3VzID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgaWYgKG1pbkxlbmd0aCA9PT0gMCB8fCBpbnB1dFZhbHVlICYmIGlucHV0VmFsdWUubGVuZ3RoID49IG1pbkxlbmd0aCkge1xyXG4gICAgICAgICAgaWYgKHdhaXRUaW1lID4gMCkge1xyXG4gICAgICAgICAgICBjYW5jZWxQcmV2aW91c1RpbWVvdXQoKTtcclxuICAgICAgICAgICAgc2NoZWR1bGVTZWFyY2hXaXRoVGltZW91dChpbnB1dFZhbHVlKTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGdldE1hdGNoZXNBc3luYyhpbnB1dFZhbHVlKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgaXNMb2FkaW5nU2V0dGVyKG9yaWdpbmFsU2NvcGUsIGZhbHNlKTtcclxuICAgICAgICAgIGNhbmNlbFByZXZpb3VzVGltZW91dCgpO1xyXG4gICAgICAgICAgcmVzZXRNYXRjaGVzKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoaXNFZGl0YWJsZSkge1xyXG4gICAgICAgICAgcmV0dXJuIGlucHV0VmFsdWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIWlucHV0VmFsdWUpIHtcclxuICAgICAgICAgIC8vIFJlc2V0IGluIGNhc2UgdXNlciBoYWQgdHlwZWQgc29tZXRoaW5nIHByZXZpb3VzbHkuXHJcbiAgICAgICAgICBtb2RlbEN0cmwuJHNldFZhbGlkaXR5KCdlZGl0YWJsZScsIHRydWUpO1xyXG4gICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBtb2RlbEN0cmwuJHNldFZhbGlkaXR5KCdlZGl0YWJsZScsIGZhbHNlKTtcclxuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIG1vZGVsQ3RybC4kZm9ybWF0dGVycy5wdXNoKGZ1bmN0aW9uKG1vZGVsVmFsdWUpIHtcclxuICAgICAgICB2YXIgY2FuZGlkYXRlVmlld1ZhbHVlLCBlbXB0eVZpZXdWYWx1ZTtcclxuICAgICAgICB2YXIgbG9jYWxzID0ge307XHJcblxyXG4gICAgICAgIC8vIFRoZSB2YWxpZGl0eSBtYXkgYmUgc2V0IHRvIGZhbHNlIHZpYSAkcGFyc2VycyAoc2VlIGFib3ZlKSBpZlxyXG4gICAgICAgIC8vIHRoZSBtb2RlbCBpcyByZXN0cmljdGVkIHRvIHNlbGVjdGVkIHZhbHVlcy4gSWYgdGhlIG1vZGVsXHJcbiAgICAgICAgLy8gaXMgc2V0IG1hbnVhbGx5IGl0IGlzIGNvbnNpZGVyZWQgdG8gYmUgdmFsaWQuXHJcbiAgICAgICAgaWYgKCFpc0VkaXRhYmxlKSB7XHJcbiAgICAgICAgICBtb2RlbEN0cmwuJHNldFZhbGlkaXR5KCdlZGl0YWJsZScsIHRydWUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGlucHV0Rm9ybWF0dGVyKSB7XHJcbiAgICAgICAgICBsb2NhbHMuJG1vZGVsID0gbW9kZWxWYWx1ZTtcclxuICAgICAgICAgIHJldHVybiBpbnB1dEZvcm1hdHRlcihvcmlnaW5hbFNjb3BlLCBsb2NhbHMpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy9pdCBtaWdodCBoYXBwZW4gdGhhdCB3ZSBkb24ndCBoYXZlIGVub3VnaCBpbmZvIHRvIHByb3Blcmx5IHJlbmRlciBpbnB1dCB2YWx1ZVxyXG4gICAgICAgIC8vd2UgbmVlZCB0byBjaGVjayBmb3IgdGhpcyBzaXR1YXRpb24gYW5kIHNpbXBseSByZXR1cm4gbW9kZWwgdmFsdWUgaWYgd2UgY2FuJ3QgYXBwbHkgY3VzdG9tIGZvcm1hdHRpbmdcclxuICAgICAgICBsb2NhbHNbcGFyc2VyUmVzdWx0Lml0ZW1OYW1lXSA9IG1vZGVsVmFsdWU7XHJcbiAgICAgICAgY2FuZGlkYXRlVmlld1ZhbHVlID0gcGFyc2VyUmVzdWx0LnZpZXdNYXBwZXIob3JpZ2luYWxTY29wZSwgbG9jYWxzKTtcclxuICAgICAgICBsb2NhbHNbcGFyc2VyUmVzdWx0Lml0ZW1OYW1lXSA9IHVuZGVmaW5lZDtcclxuICAgICAgICBlbXB0eVZpZXdWYWx1ZSA9IHBhcnNlclJlc3VsdC52aWV3TWFwcGVyKG9yaWdpbmFsU2NvcGUsIGxvY2Fscyk7XHJcblxyXG4gICAgICAgIHJldHVybiBjYW5kaWRhdGVWaWV3VmFsdWUgIT09IGVtcHR5Vmlld1ZhbHVlID8gY2FuZGlkYXRlVmlld1ZhbHVlIDogbW9kZWxWYWx1ZTtcclxuICAgICAgfSk7XHJcbiAgICB9O1xyXG4gIH1dKVxyXG5cclxuICAuZGlyZWN0aXZlKCd1aWJUeXBlYWhlYWQnLCBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIGNvbnRyb2xsZXI6ICdVaWJUeXBlYWhlYWRDb250cm9sbGVyJyxcclxuICAgICAgcmVxdWlyZTogWyduZ01vZGVsJywgJ14/bmdNb2RlbE9wdGlvbnMnLCAndWliVHlwZWFoZWFkJ10sXHJcbiAgICAgIGxpbms6IGZ1bmN0aW9uKG9yaWdpbmFsU2NvcGUsIGVsZW1lbnQsIGF0dHJzLCBjdHJscykge1xyXG4gICAgICAgIGN0cmxzWzJdLmluaXQoY3RybHNbMF0sIGN0cmxzWzFdKTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuICB9KVxyXG5cclxuICAuZGlyZWN0aXZlKCd1aWJUeXBlYWhlYWRQb3B1cCcsIFsnJCRkZWJvdW5jZScsIGZ1bmN0aW9uKCQkZGVib3VuY2UpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIHNjb3BlOiB7XHJcbiAgICAgICAgbWF0Y2hlczogJz0nLFxyXG4gICAgICAgIHF1ZXJ5OiAnPScsXHJcbiAgICAgICAgYWN0aXZlOiAnPScsXHJcbiAgICAgICAgcG9zaXRpb246ICcmJyxcclxuICAgICAgICBtb3ZlSW5Qcm9ncmVzczogJz0nLFxyXG4gICAgICAgIHNlbGVjdDogJyYnLFxyXG4gICAgICAgIGFzc2lnbklzT3BlbjogJyYnLFxyXG4gICAgICAgIGRlYm91bmNlOiAnJidcclxuICAgICAgfSxcclxuICAgICAgcmVwbGFjZTogdHJ1ZSxcclxuICAgICAgdGVtcGxhdGVVcmw6IGZ1bmN0aW9uKGVsZW1lbnQsIGF0dHJzKSB7XHJcbiAgICAgICAgcmV0dXJuIGF0dHJzLnBvcHVwVGVtcGxhdGVVcmwgfHwgJ3VpYi90ZW1wbGF0ZS90eXBlYWhlYWQvdHlwZWFoZWFkLXBvcHVwLmh0bWwnO1xyXG4gICAgICB9LFxyXG4gICAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxlbWVudCwgYXR0cnMpIHtcclxuICAgICAgICBzY29wZS50ZW1wbGF0ZVVybCA9IGF0dHJzLnRlbXBsYXRlVXJsO1xyXG5cclxuICAgICAgICBzY29wZS5pc09wZW4gPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgIHZhciBpc0Ryb3Bkb3duT3BlbiA9IHNjb3BlLm1hdGNoZXMubGVuZ3RoID4gMDtcclxuICAgICAgICAgIHNjb3BlLmFzc2lnbklzT3Blbih7IGlzT3BlbjogaXNEcm9wZG93bk9wZW4gfSk7XHJcbiAgICAgICAgICByZXR1cm4gaXNEcm9wZG93bk9wZW47XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgc2NvcGUuaXNBY3RpdmUgPSBmdW5jdGlvbihtYXRjaElkeCkge1xyXG4gICAgICAgICAgcmV0dXJuIHNjb3BlLmFjdGl2ZSA9PT0gbWF0Y2hJZHg7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgc2NvcGUuc2VsZWN0QWN0aXZlID0gZnVuY3Rpb24obWF0Y2hJZHgpIHtcclxuICAgICAgICAgIHNjb3BlLmFjdGl2ZSA9IG1hdGNoSWR4O1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHNjb3BlLnNlbGVjdE1hdGNoID0gZnVuY3Rpb24oYWN0aXZlSWR4LCBldnQpIHtcclxuICAgICAgICAgIHZhciBkZWJvdW5jZSA9IHNjb3BlLmRlYm91bmNlKCk7XHJcbiAgICAgICAgICBpZiAoYW5ndWxhci5pc051bWJlcihkZWJvdW5jZSkgfHwgYW5ndWxhci5pc09iamVjdChkZWJvdW5jZSkpIHtcclxuICAgICAgICAgICAgJCRkZWJvdW5jZShmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICBzY29wZS5zZWxlY3Qoe2FjdGl2ZUlkeDogYWN0aXZlSWR4LCBldnQ6IGV2dH0pO1xyXG4gICAgICAgICAgICB9LCBhbmd1bGFyLmlzTnVtYmVyKGRlYm91bmNlKSA/IGRlYm91bmNlIDogZGVib3VuY2VbJ2RlZmF1bHQnXSk7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBzY29wZS5zZWxlY3Qoe2FjdGl2ZUlkeDogYWN0aXZlSWR4LCBldnQ6IGV2dH0pO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICAgIH1cclxuICAgIH07XHJcbiAgfV0pXHJcblxyXG4gIC5kaXJlY3RpdmUoJ3VpYlR5cGVhaGVhZE1hdGNoJywgWyckdGVtcGxhdGVSZXF1ZXN0JywgJyRjb21waWxlJywgJyRwYXJzZScsIGZ1bmN0aW9uKCR0ZW1wbGF0ZVJlcXVlc3QsICRjb21waWxlLCAkcGFyc2UpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIHNjb3BlOiB7XHJcbiAgICAgICAgaW5kZXg6ICc9JyxcclxuICAgICAgICBtYXRjaDogJz0nLFxyXG4gICAgICAgIHF1ZXJ5OiAnPSdcclxuICAgICAgfSxcclxuICAgICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsZW1lbnQsIGF0dHJzKSB7XHJcbiAgICAgICAgdmFyIHRwbFVybCA9ICRwYXJzZShhdHRycy50ZW1wbGF0ZVVybCkoc2NvcGUuJHBhcmVudCkgfHwgJ3VpYi90ZW1wbGF0ZS90eXBlYWhlYWQvdHlwZWFoZWFkLW1hdGNoLmh0bWwnO1xyXG4gICAgICAgICR0ZW1wbGF0ZVJlcXVlc3QodHBsVXJsKS50aGVuKGZ1bmN0aW9uKHRwbENvbnRlbnQpIHtcclxuICAgICAgICAgIHZhciB0cGxFbCA9IGFuZ3VsYXIuZWxlbWVudCh0cGxDb250ZW50LnRyaW0oKSk7XHJcbiAgICAgICAgICBlbGVtZW50LnJlcGxhY2VXaXRoKHRwbEVsKTtcclxuICAgICAgICAgICRjb21waWxlKHRwbEVsKShzY29wZSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgIH07XHJcbiAgfV0pXHJcblxyXG4gIC5maWx0ZXIoJ3VpYlR5cGVhaGVhZEhpZ2hsaWdodCcsIFsnJHNjZScsICckaW5qZWN0b3InLCAnJGxvZycsIGZ1bmN0aW9uKCRzY2UsICRpbmplY3RvciwgJGxvZykge1xyXG4gICAgdmFyIGlzU2FuaXRpemVQcmVzZW50O1xyXG4gICAgaXNTYW5pdGl6ZVByZXNlbnQgPSAkaW5qZWN0b3IuaGFzKCckc2FuaXRpemUnKTtcclxuXHJcbiAgICBmdW5jdGlvbiBlc2NhcGVSZWdleHAocXVlcnlUb0VzY2FwZSkge1xyXG4gICAgICAvLyBSZWdleDogY2FwdHVyZSB0aGUgd2hvbGUgcXVlcnkgc3RyaW5nIGFuZCByZXBsYWNlIGl0IHdpdGggdGhlIHN0cmluZyB0aGF0IHdpbGwgYmUgdXNlZCB0byBtYXRjaFxyXG4gICAgICAvLyB0aGUgcmVzdWx0cywgZm9yIGV4YW1wbGUgaWYgdGhlIGNhcHR1cmUgaXMgXCJhXCIgdGhlIHJlc3VsdCB3aWxsIGJlIFxcYVxyXG4gICAgICByZXR1cm4gcXVlcnlUb0VzY2FwZS5yZXBsYWNlKC8oWy4/KiteJFtcXF1cXFxcKCl7fXwtXSkvZywgJ1xcXFwkMScpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGNvbnRhaW5zSHRtbChtYXRjaEl0ZW0pIHtcclxuICAgICAgcmV0dXJuIC88Lio+L2cudGVzdChtYXRjaEl0ZW0pO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBmdW5jdGlvbihtYXRjaEl0ZW0sIHF1ZXJ5KSB7XHJcbiAgICAgIGlmICghaXNTYW5pdGl6ZVByZXNlbnQgJiYgY29udGFpbnNIdG1sKG1hdGNoSXRlbSkpIHtcclxuICAgICAgICAkbG9nLndhcm4oJ1Vuc2FmZSB1c2Ugb2YgdHlwZWFoZWFkIHBsZWFzZSB1c2UgbmdTYW5pdGl6ZScpOyAvLyBXYXJuIHRoZSB1c2VyIGFib3V0IHRoZSBkYW5nZXJcclxuICAgICAgfVxyXG4gICAgICBtYXRjaEl0ZW0gPSBxdWVyeSA/ICgnJyArIG1hdGNoSXRlbSkucmVwbGFjZShuZXcgUmVnRXhwKGVzY2FwZVJlZ2V4cChxdWVyeSksICdnaScpLCAnPHN0cm9uZz4kJjwvc3Ryb25nPicpIDogbWF0Y2hJdGVtOyAvLyBSZXBsYWNlcyB0aGUgY2FwdHVyZSBzdHJpbmcgd2l0aCBhIHRoZSBzYW1lIHN0cmluZyBpbnNpZGUgb2YgYSBcInN0cm9uZ1wiIHRhZ1xyXG4gICAgICBpZiAoIWlzU2FuaXRpemVQcmVzZW50KSB7XHJcbiAgICAgICAgbWF0Y2hJdGVtID0gJHNjZS50cnVzdEFzSHRtbChtYXRjaEl0ZW0pOyAvLyBJZiAkc2FuaXRpemUgaXMgbm90IHByZXNlbnQgd2UgcGFjayB0aGUgc3RyaW5nIGluIGEgJHNjZSBvYmplY3QgZm9yIHRoZSBuZy1iaW5kLWh0bWwgZGlyZWN0aXZlXHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIG1hdGNoSXRlbTtcclxuICAgIH07XHJcbiAgfV0pO1xyXG5cclxuYW5ndWxhci5tb2R1bGUoXCJ1aWIvdGVtcGxhdGUvYWNjb3JkaW9uL2FjY29yZGlvbi1ncm91cC5odG1sXCIsIFtdKS5ydW4oW1wiJHRlbXBsYXRlQ2FjaGVcIiwgZnVuY3Rpb24oJHRlbXBsYXRlQ2FjaGUpIHtcclxuICAkdGVtcGxhdGVDYWNoZS5wdXQoXCJ1aWIvdGVtcGxhdGUvYWNjb3JkaW9uL2FjY29yZGlvbi1ncm91cC5odG1sXCIsXHJcbiAgICBcIjxkaXYgcm9sZT1cXFwidGFiXFxcIiBpZD1cXFwie3s6OmhlYWRpbmdJZH19XFxcIiBhcmlhLXNlbGVjdGVkPVxcXCJ7e2lzT3Blbn19XFxcIiBjbGFzcz1cXFwicGFuZWwtaGVhZGluZ1xcXCIgbmcta2V5cHJlc3M9XFxcInRvZ2dsZU9wZW4oJGV2ZW50KVxcXCI+XFxuXCIgK1xyXG4gICAgXCIgIDxoNCBjbGFzcz1cXFwicGFuZWwtdGl0bGVcXFwiPlxcblwiICtcclxuICAgIFwiICAgIDxhIHJvbGU9XFxcImJ1dHRvblxcXCIgZGF0YS10b2dnbGU9XFxcImNvbGxhcHNlXFxcIiBocmVmIGFyaWEtZXhwYW5kZWQ9XFxcInt7aXNPcGVufX1cXFwiIGFyaWEtY29udHJvbHM9XFxcInt7OjpwYW5lbElkfX1cXFwiIHRhYmluZGV4PVxcXCIwXFxcIiBjbGFzcz1cXFwiYWNjb3JkaW9uLXRvZ2dsZVxcXCIgbmctY2xpY2s9XFxcInRvZ2dsZU9wZW4oKVxcXCIgdWliLWFjY29yZGlvbi10cmFuc2NsdWRlPVxcXCJoZWFkaW5nXFxcIiBuZy1kaXNhYmxlZD1cXFwiaXNEaXNhYmxlZFxcXCIgdWliLXRhYmluZGV4LXRvZ2dsZT48c3BhbiB1aWItYWNjb3JkaW9uLWhlYWRlciBuZy1jbGFzcz1cXFwieyd0ZXh0LW11dGVkJzogaXNEaXNhYmxlZH1cXFwiPnt7aGVhZGluZ319PC9zcGFuPjwvYT5cXG5cIiArXHJcbiAgICBcIiAgPC9oND5cXG5cIiArXHJcbiAgICBcIjwvZGl2PlxcblwiICtcclxuICAgIFwiPGRpdiBpZD1cXFwie3s6OnBhbmVsSWR9fVxcXCIgYXJpYS1sYWJlbGxlZGJ5PVxcXCJ7ezo6aGVhZGluZ0lkfX1cXFwiIGFyaWEtaGlkZGVuPVxcXCJ7eyFpc09wZW59fVxcXCIgcm9sZT1cXFwidGFicGFuZWxcXFwiIGNsYXNzPVxcXCJwYW5lbC1jb2xsYXBzZSBjb2xsYXBzZVxcXCIgdWliLWNvbGxhcHNlPVxcXCIhaXNPcGVuXFxcIj5cXG5cIiArXHJcbiAgICBcIiAgPGRpdiBjbGFzcz1cXFwicGFuZWwtYm9keVxcXCIgbmctdHJhbnNjbHVkZT48L2Rpdj5cXG5cIiArXHJcbiAgICBcIjwvZGl2PlxcblwiICtcclxuICAgIFwiXCIpO1xyXG59XSk7XHJcblxyXG5hbmd1bGFyLm1vZHVsZShcInVpYi90ZW1wbGF0ZS9hY2NvcmRpb24vYWNjb3JkaW9uLmh0bWxcIiwgW10pLnJ1bihbXCIkdGVtcGxhdGVDYWNoZVwiLCBmdW5jdGlvbigkdGVtcGxhdGVDYWNoZSkge1xyXG4gICR0ZW1wbGF0ZUNhY2hlLnB1dChcInVpYi90ZW1wbGF0ZS9hY2NvcmRpb24vYWNjb3JkaW9uLmh0bWxcIixcclxuICAgIFwiPGRpdiByb2xlPVxcXCJ0YWJsaXN0XFxcIiBjbGFzcz1cXFwicGFuZWwtZ3JvdXBcXFwiIG5nLXRyYW5zY2x1ZGU+PC9kaXY+XCIpO1xyXG59XSk7XHJcblxyXG5hbmd1bGFyLm1vZHVsZShcInVpYi90ZW1wbGF0ZS9hbGVydC9hbGVydC5odG1sXCIsIFtdKS5ydW4oW1wiJHRlbXBsYXRlQ2FjaGVcIiwgZnVuY3Rpb24oJHRlbXBsYXRlQ2FjaGUpIHtcclxuICAkdGVtcGxhdGVDYWNoZS5wdXQoXCJ1aWIvdGVtcGxhdGUvYWxlcnQvYWxlcnQuaHRtbFwiLFxyXG4gICAgXCI8YnV0dG9uIG5nLXNob3c9XFxcImNsb3NlYWJsZVxcXCIgdHlwZT1cXFwiYnV0dG9uXFxcIiBjbGFzcz1cXFwiY2xvc2VcXFwiIG5nLWNsaWNrPVxcXCJjbG9zZSh7JGV2ZW50OiAkZXZlbnR9KVxcXCI+XFxuXCIgK1xyXG4gICAgXCIgIDxzcGFuIGFyaWEtaGlkZGVuPVxcXCJ0cnVlXFxcIj4mdGltZXM7PC9zcGFuPlxcblwiICtcclxuICAgIFwiICA8c3BhbiBjbGFzcz1cXFwic3Itb25seVxcXCI+Q2xvc2U8L3NwYW4+XFxuXCIgK1xyXG4gICAgXCI8L2J1dHRvbj5cXG5cIiArXHJcbiAgICBcIjxkaXYgbmctdHJhbnNjbHVkZT48L2Rpdj5cXG5cIiArXHJcbiAgICBcIlwiKTtcclxufV0pO1xyXG5cclxuYW5ndWxhci5tb2R1bGUoXCJ1aWIvdGVtcGxhdGUvY2Fyb3VzZWwvY2Fyb3VzZWwuaHRtbFwiLCBbXSkucnVuKFtcIiR0ZW1wbGF0ZUNhY2hlXCIsIGZ1bmN0aW9uKCR0ZW1wbGF0ZUNhY2hlKSB7XHJcbiAgJHRlbXBsYXRlQ2FjaGUucHV0KFwidWliL3RlbXBsYXRlL2Nhcm91c2VsL2Nhcm91c2VsLmh0bWxcIixcclxuICAgIFwiPGRpdiBjbGFzcz1cXFwiY2Fyb3VzZWwtaW5uZXJcXFwiIG5nLXRyYW5zY2x1ZGU+PC9kaXY+XFxuXCIgK1xyXG4gICAgXCI8YSByb2xlPVxcXCJidXR0b25cXFwiIGhyZWYgY2xhc3M9XFxcImxlZnQgY2Fyb3VzZWwtY29udHJvbFxcXCIgbmctY2xpY2s9XFxcInByZXYoKVxcXCIgbmctY2xhc3M9XFxcInsgZGlzYWJsZWQ6IGlzUHJldkRpc2FibGVkKCkgfVxcXCIgbmctc2hvdz1cXFwic2xpZGVzLmxlbmd0aCA+IDFcXFwiPlxcblwiICtcclxuICAgIFwiICA8c3BhbiBhcmlhLWhpZGRlbj1cXFwidHJ1ZVxcXCIgY2xhc3M9XFxcImdseXBoaWNvbiBnbHlwaGljb24tY2hldnJvbi1sZWZ0XFxcIj48L3NwYW4+XFxuXCIgK1xyXG4gICAgXCIgIDxzcGFuIGNsYXNzPVxcXCJzci1vbmx5XFxcIj5wcmV2aW91czwvc3Bhbj5cXG5cIiArXHJcbiAgICBcIjwvYT5cXG5cIiArXHJcbiAgICBcIjxhIHJvbGU9XFxcImJ1dHRvblxcXCIgaHJlZiBjbGFzcz1cXFwicmlnaHQgY2Fyb3VzZWwtY29udHJvbFxcXCIgbmctY2xpY2s9XFxcIm5leHQoKVxcXCIgbmctY2xhc3M9XFxcInsgZGlzYWJsZWQ6IGlzTmV4dERpc2FibGVkKCkgfVxcXCIgbmctc2hvdz1cXFwic2xpZGVzLmxlbmd0aCA+IDFcXFwiPlxcblwiICtcclxuICAgIFwiICA8c3BhbiBhcmlhLWhpZGRlbj1cXFwidHJ1ZVxcXCIgY2xhc3M9XFxcImdseXBoaWNvbiBnbHlwaGljb24tY2hldnJvbi1yaWdodFxcXCI+PC9zcGFuPlxcblwiICtcclxuICAgIFwiICA8c3BhbiBjbGFzcz1cXFwic3Itb25seVxcXCI+bmV4dDwvc3Bhbj5cXG5cIiArXHJcbiAgICBcIjwvYT5cXG5cIiArXHJcbiAgICBcIjxvbCBjbGFzcz1cXFwiY2Fyb3VzZWwtaW5kaWNhdG9yc1xcXCIgbmctc2hvdz1cXFwic2xpZGVzLmxlbmd0aCA+IDFcXFwiPlxcblwiICtcclxuICAgIFwiICA8bGkgbmctcmVwZWF0PVxcXCJzbGlkZSBpbiBzbGlkZXMgfCBvcmRlckJ5OmluZGV4T2ZTbGlkZSB0cmFjayBieSAkaW5kZXhcXFwiIG5nLWNsYXNzPVxcXCJ7IGFjdGl2ZTogaXNBY3RpdmUoc2xpZGUpIH1cXFwiIG5nLWNsaWNrPVxcXCJzZWxlY3Qoc2xpZGUpXFxcIj5cXG5cIiArXHJcbiAgICBcIiAgICA8c3BhbiBjbGFzcz1cXFwic3Itb25seVxcXCI+c2xpZGUge3sgJGluZGV4ICsgMSB9fSBvZiB7eyBzbGlkZXMubGVuZ3RoIH19PHNwYW4gbmctaWY9XFxcImlzQWN0aXZlKHNsaWRlKVxcXCI+LCBjdXJyZW50bHkgYWN0aXZlPC9zcGFuPjwvc3Bhbj5cXG5cIiArXHJcbiAgICBcIiAgPC9saT5cXG5cIiArXHJcbiAgICBcIjwvb2w+XFxuXCIgK1xyXG4gICAgXCJcIik7XHJcbn1dKTtcclxuXHJcbmFuZ3VsYXIubW9kdWxlKFwidWliL3RlbXBsYXRlL2Nhcm91c2VsL3NsaWRlLmh0bWxcIiwgW10pLnJ1bihbXCIkdGVtcGxhdGVDYWNoZVwiLCBmdW5jdGlvbigkdGVtcGxhdGVDYWNoZSkge1xyXG4gICR0ZW1wbGF0ZUNhY2hlLnB1dChcInVpYi90ZW1wbGF0ZS9jYXJvdXNlbC9zbGlkZS5odG1sXCIsXHJcbiAgICBcIjxkaXYgY2xhc3M9XFxcInRleHQtY2VudGVyXFxcIiBuZy10cmFuc2NsdWRlPjwvZGl2PlxcblwiICtcclxuICAgIFwiXCIpO1xyXG59XSk7XHJcblxyXG5hbmd1bGFyLm1vZHVsZShcInVpYi90ZW1wbGF0ZS9kYXRlcGlja2VyL2RhdGVwaWNrZXIuaHRtbFwiLCBbXSkucnVuKFtcIiR0ZW1wbGF0ZUNhY2hlXCIsIGZ1bmN0aW9uKCR0ZW1wbGF0ZUNhY2hlKSB7XHJcbiAgJHRlbXBsYXRlQ2FjaGUucHV0KFwidWliL3RlbXBsYXRlL2RhdGVwaWNrZXIvZGF0ZXBpY2tlci5odG1sXCIsXHJcbiAgICBcIjxkaXYgbmctc3dpdGNoPVxcXCJkYXRlcGlja2VyTW9kZVxcXCI+XFxuXCIgK1xyXG4gICAgXCIgIDxkaXYgdWliLWRheXBpY2tlciBuZy1zd2l0Y2gtd2hlbj1cXFwiZGF5XFxcIiB0YWJpbmRleD1cXFwiMFxcXCIgY2xhc3M9XFxcInVpYi1kYXlwaWNrZXJcXFwiPjwvZGl2PlxcblwiICtcclxuICAgIFwiICA8ZGl2IHVpYi1tb250aHBpY2tlciBuZy1zd2l0Y2gtd2hlbj1cXFwibW9udGhcXFwiIHRhYmluZGV4PVxcXCIwXFxcIiBjbGFzcz1cXFwidWliLW1vbnRocGlja2VyXFxcIj48L2Rpdj5cXG5cIiArXHJcbiAgICBcIiAgPGRpdiB1aWIteWVhcnBpY2tlciBuZy1zd2l0Y2gtd2hlbj1cXFwieWVhclxcXCIgdGFiaW5kZXg9XFxcIjBcXFwiIGNsYXNzPVxcXCJ1aWIteWVhcnBpY2tlclxcXCI+PC9kaXY+XFxuXCIgK1xyXG4gICAgXCI8L2Rpdj5cXG5cIiArXHJcbiAgICBcIlwiKTtcclxufV0pO1xyXG5cclxuYW5ndWxhci5tb2R1bGUoXCJ1aWIvdGVtcGxhdGUvZGF0ZXBpY2tlci9kYXkuaHRtbFwiLCBbXSkucnVuKFtcIiR0ZW1wbGF0ZUNhY2hlXCIsIGZ1bmN0aW9uKCR0ZW1wbGF0ZUNhY2hlKSB7XHJcbiAgJHRlbXBsYXRlQ2FjaGUucHV0KFwidWliL3RlbXBsYXRlL2RhdGVwaWNrZXIvZGF5Lmh0bWxcIixcclxuICAgIFwiPHRhYmxlIHJvbGU9XFxcImdyaWRcXFwiIGFyaWEtbGFiZWxsZWRieT1cXFwie3s6OnVuaXF1ZUlkfX0tdGl0bGVcXFwiIGFyaWEtYWN0aXZlZGVzY2VuZGFudD1cXFwie3thY3RpdmVEYXRlSWR9fVxcXCI+XFxuXCIgK1xyXG4gICAgXCIgIDx0aGVhZD5cXG5cIiArXHJcbiAgICBcIiAgICA8dHI+XFxuXCIgK1xyXG4gICAgXCIgICAgICA8dGg+PGJ1dHRvbiB0eXBlPVxcXCJidXR0b25cXFwiIGNsYXNzPVxcXCJidG4gYnRuLWRlZmF1bHQgYnRuLXNtIHB1bGwtbGVmdCB1aWItbGVmdFxcXCIgbmctY2xpY2s9XFxcIm1vdmUoLTEpXFxcIiB0YWJpbmRleD1cXFwiLTFcXFwiPjxpIGNsYXNzPVxcXCJnbHlwaGljb24gZ2x5cGhpY29uLWNoZXZyb24tbGVmdFxcXCI+PC9pPjwvYnV0dG9uPjwvdGg+XFxuXCIgK1xyXG4gICAgXCIgICAgICA8dGggY29sc3Bhbj1cXFwie3s6OjUgKyBzaG93V2Vla3N9fVxcXCI+PGJ1dHRvbiBpZD1cXFwie3s6OnVuaXF1ZUlkfX0tdGl0bGVcXFwiIHJvbGU9XFxcImhlYWRpbmdcXFwiIGFyaWEtbGl2ZT1cXFwiYXNzZXJ0aXZlXFxcIiBhcmlhLWF0b21pYz1cXFwidHJ1ZVxcXCIgdHlwZT1cXFwiYnV0dG9uXFxcIiBjbGFzcz1cXFwiYnRuIGJ0bi1kZWZhdWx0IGJ0bi1zbSB1aWItdGl0bGVcXFwiIG5nLWNsaWNrPVxcXCJ0b2dnbGVNb2RlKClcXFwiIG5nLWRpc2FibGVkPVxcXCJkYXRlcGlja2VyTW9kZSA9PT0gbWF4TW9kZVxcXCIgdGFiaW5kZXg9XFxcIi0xXFxcIj48c3Ryb25nPnt7dGl0bGV9fTwvc3Ryb25nPjwvYnV0dG9uPjwvdGg+XFxuXCIgK1xyXG4gICAgXCIgICAgICA8dGg+PGJ1dHRvbiB0eXBlPVxcXCJidXR0b25cXFwiIGNsYXNzPVxcXCJidG4gYnRuLWRlZmF1bHQgYnRuLXNtIHB1bGwtcmlnaHQgdWliLXJpZ2h0XFxcIiBuZy1jbGljaz1cXFwibW92ZSgxKVxcXCIgdGFiaW5kZXg9XFxcIi0xXFxcIj48aSBjbGFzcz1cXFwiZ2x5cGhpY29uIGdseXBoaWNvbi1jaGV2cm9uLXJpZ2h0XFxcIj48L2k+PC9idXR0b24+PC90aD5cXG5cIiArXHJcbiAgICBcIiAgICA8L3RyPlxcblwiICtcclxuICAgIFwiICAgIDx0cj5cXG5cIiArXHJcbiAgICBcIiAgICAgIDx0aCBuZy1pZj1cXFwic2hvd1dlZWtzXFxcIiBjbGFzcz1cXFwidGV4dC1jZW50ZXJcXFwiPjwvdGg+XFxuXCIgK1xyXG4gICAgXCIgICAgICA8dGggbmctcmVwZWF0PVxcXCJsYWJlbCBpbiA6OmxhYmVscyB0cmFjayBieSAkaW5kZXhcXFwiIGNsYXNzPVxcXCJ0ZXh0LWNlbnRlclxcXCI+PHNtYWxsIGFyaWEtbGFiZWw9XFxcInt7OjpsYWJlbC5mdWxsfX1cXFwiPnt7OjpsYWJlbC5hYmJyfX08L3NtYWxsPjwvdGg+XFxuXCIgK1xyXG4gICAgXCIgICAgPC90cj5cXG5cIiArXHJcbiAgICBcIiAgPC90aGVhZD5cXG5cIiArXHJcbiAgICBcIiAgPHRib2R5PlxcblwiICtcclxuICAgIFwiICAgIDx0ciBjbGFzcz1cXFwidWliLXdlZWtzXFxcIiBuZy1yZXBlYXQ9XFxcInJvdyBpbiByb3dzIHRyYWNrIGJ5ICRpbmRleFxcXCIgcm9sZT1cXFwicm93XFxcIj5cXG5cIiArXHJcbiAgICBcIiAgICAgIDx0ZCBuZy1pZj1cXFwic2hvd1dlZWtzXFxcIiBjbGFzcz1cXFwidGV4dC1jZW50ZXIgaDZcXFwiPjxlbT57eyB3ZWVrTnVtYmVyc1skaW5kZXhdIH19PC9lbT48L3RkPlxcblwiICtcclxuICAgIFwiICAgICAgPHRkIG5nLXJlcGVhdD1cXFwiZHQgaW4gcm93XFxcIiBjbGFzcz1cXFwidWliLWRheSB0ZXh0LWNlbnRlclxcXCIgcm9sZT1cXFwiZ3JpZGNlbGxcXFwiXFxuXCIgK1xyXG4gICAgXCIgICAgICAgIGlkPVxcXCJ7ezo6ZHQudWlkfX1cXFwiXFxuXCIgK1xyXG4gICAgXCIgICAgICAgIG5nLWNsYXNzPVxcXCI6OmR0LmN1c3RvbUNsYXNzXFxcIj5cXG5cIiArXHJcbiAgICBcIiAgICAgICAgPGJ1dHRvbiB0eXBlPVxcXCJidXR0b25cXFwiIGNsYXNzPVxcXCJidG4gYnRuLWRlZmF1bHQgYnRuLXNtXFxcIlxcblwiICtcclxuICAgIFwiICAgICAgICAgIHVpYi1pcy1jbGFzcz1cXFwiXFxuXCIgK1xyXG4gICAgXCIgICAgICAgICAgICAnYnRuLWluZm8nIGZvciBzZWxlY3RlZER0LFxcblwiICtcclxuICAgIFwiICAgICAgICAgICAgJ2FjdGl2ZScgZm9yIGFjdGl2ZUR0XFxuXCIgK1xyXG4gICAgXCIgICAgICAgICAgICBvbiBkdFxcXCJcXG5cIiArXHJcbiAgICBcIiAgICAgICAgICBuZy1jbGljaz1cXFwic2VsZWN0KGR0LmRhdGUpXFxcIlxcblwiICtcclxuICAgIFwiICAgICAgICAgIG5nLWRpc2FibGVkPVxcXCI6OmR0LmRpc2FibGVkXFxcIlxcblwiICtcclxuICAgIFwiICAgICAgICAgIHRhYmluZGV4PVxcXCItMVxcXCI+PHNwYW4gbmctY2xhc3M9XFxcIjo6eyd0ZXh0LW11dGVkJzogZHQuc2Vjb25kYXJ5LCAndGV4dC1pbmZvJzogZHQuY3VycmVudH1cXFwiPnt7OjpkdC5sYWJlbH19PC9zcGFuPjwvYnV0dG9uPlxcblwiICtcclxuICAgIFwiICAgICAgPC90ZD5cXG5cIiArXHJcbiAgICBcIiAgICA8L3RyPlxcblwiICtcclxuICAgIFwiICA8L3Rib2R5PlxcblwiICtcclxuICAgIFwiPC90YWJsZT5cXG5cIiArXHJcbiAgICBcIlwiKTtcclxufV0pO1xyXG5cclxuYW5ndWxhci5tb2R1bGUoXCJ1aWIvdGVtcGxhdGUvZGF0ZXBpY2tlci9tb250aC5odG1sXCIsIFtdKS5ydW4oW1wiJHRlbXBsYXRlQ2FjaGVcIiwgZnVuY3Rpb24oJHRlbXBsYXRlQ2FjaGUpIHtcclxuICAkdGVtcGxhdGVDYWNoZS5wdXQoXCJ1aWIvdGVtcGxhdGUvZGF0ZXBpY2tlci9tb250aC5odG1sXCIsXHJcbiAgICBcIjx0YWJsZSByb2xlPVxcXCJncmlkXFxcIiBhcmlhLWxhYmVsbGVkYnk9XFxcInt7Ojp1bmlxdWVJZH19LXRpdGxlXFxcIiBhcmlhLWFjdGl2ZWRlc2NlbmRhbnQ9XFxcInt7YWN0aXZlRGF0ZUlkfX1cXFwiPlxcblwiICtcclxuICAgIFwiICA8dGhlYWQ+XFxuXCIgK1xyXG4gICAgXCIgICAgPHRyPlxcblwiICtcclxuICAgIFwiICAgICAgPHRoPjxidXR0b24gdHlwZT1cXFwiYnV0dG9uXFxcIiBjbGFzcz1cXFwiYnRuIGJ0bi1kZWZhdWx0IGJ0bi1zbSBwdWxsLWxlZnQgdWliLWxlZnRcXFwiIG5nLWNsaWNrPVxcXCJtb3ZlKC0xKVxcXCIgdGFiaW5kZXg9XFxcIi0xXFxcIj48aSBjbGFzcz1cXFwiZ2x5cGhpY29uIGdseXBoaWNvbi1jaGV2cm9uLWxlZnRcXFwiPjwvaT48L2J1dHRvbj48L3RoPlxcblwiICtcclxuICAgIFwiICAgICAgPHRoIGNvbHNwYW49XFxcInt7Ojp5ZWFySGVhZGVyQ29sc3Bhbn19XFxcIj48YnV0dG9uIGlkPVxcXCJ7ezo6dW5pcXVlSWR9fS10aXRsZVxcXCIgcm9sZT1cXFwiaGVhZGluZ1xcXCIgYXJpYS1saXZlPVxcXCJhc3NlcnRpdmVcXFwiIGFyaWEtYXRvbWljPVxcXCJ0cnVlXFxcIiB0eXBlPVxcXCJidXR0b25cXFwiIGNsYXNzPVxcXCJidG4gYnRuLWRlZmF1bHQgYnRuLXNtIHVpYi10aXRsZVxcXCIgbmctY2xpY2s9XFxcInRvZ2dsZU1vZGUoKVxcXCIgbmctZGlzYWJsZWQ9XFxcImRhdGVwaWNrZXJNb2RlID09PSBtYXhNb2RlXFxcIiB0YWJpbmRleD1cXFwiLTFcXFwiPjxzdHJvbmc+e3t0aXRsZX19PC9zdHJvbmc+PC9idXR0b24+PC90aD5cXG5cIiArXHJcbiAgICBcIiAgICAgIDx0aD48YnV0dG9uIHR5cGU9XFxcImJ1dHRvblxcXCIgY2xhc3M9XFxcImJ0biBidG4tZGVmYXVsdCBidG4tc20gcHVsbC1yaWdodCB1aWItcmlnaHRcXFwiIG5nLWNsaWNrPVxcXCJtb3ZlKDEpXFxcIiB0YWJpbmRleD1cXFwiLTFcXFwiPjxpIGNsYXNzPVxcXCJnbHlwaGljb24gZ2x5cGhpY29uLWNoZXZyb24tcmlnaHRcXFwiPjwvaT48L2J1dHRvbj48L3RoPlxcblwiICtcclxuICAgIFwiICAgIDwvdHI+XFxuXCIgK1xyXG4gICAgXCIgIDwvdGhlYWQ+XFxuXCIgK1xyXG4gICAgXCIgIDx0Ym9keT5cXG5cIiArXHJcbiAgICBcIiAgICA8dHIgY2xhc3M9XFxcInVpYi1tb250aHNcXFwiIG5nLXJlcGVhdD1cXFwicm93IGluIHJvd3MgdHJhY2sgYnkgJGluZGV4XFxcIiByb2xlPVxcXCJyb3dcXFwiPlxcblwiICtcclxuICAgIFwiICAgICAgPHRkIG5nLXJlcGVhdD1cXFwiZHQgaW4gcm93XFxcIiBjbGFzcz1cXFwidWliLW1vbnRoIHRleHQtY2VudGVyXFxcIiByb2xlPVxcXCJncmlkY2VsbFxcXCJcXG5cIiArXHJcbiAgICBcIiAgICAgICAgaWQ9XFxcInt7OjpkdC51aWR9fVxcXCJcXG5cIiArXHJcbiAgICBcIiAgICAgICAgbmctY2xhc3M9XFxcIjo6ZHQuY3VzdG9tQ2xhc3NcXFwiPlxcblwiICtcclxuICAgIFwiICAgICAgICA8YnV0dG9uIHR5cGU9XFxcImJ1dHRvblxcXCIgY2xhc3M9XFxcImJ0biBidG4tZGVmYXVsdFxcXCJcXG5cIiArXHJcbiAgICBcIiAgICAgICAgICB1aWItaXMtY2xhc3M9XFxcIlxcblwiICtcclxuICAgIFwiICAgICAgICAgICAgJ2J0bi1pbmZvJyBmb3Igc2VsZWN0ZWREdCxcXG5cIiArXHJcbiAgICBcIiAgICAgICAgICAgICdhY3RpdmUnIGZvciBhY3RpdmVEdFxcblwiICtcclxuICAgIFwiICAgICAgICAgICAgb24gZHRcXFwiXFxuXCIgK1xyXG4gICAgXCIgICAgICAgICAgbmctY2xpY2s9XFxcInNlbGVjdChkdC5kYXRlKVxcXCJcXG5cIiArXHJcbiAgICBcIiAgICAgICAgICBuZy1kaXNhYmxlZD1cXFwiOjpkdC5kaXNhYmxlZFxcXCJcXG5cIiArXHJcbiAgICBcIiAgICAgICAgICB0YWJpbmRleD1cXFwiLTFcXFwiPjxzcGFuIG5nLWNsYXNzPVxcXCI6OnsndGV4dC1pbmZvJzogZHQuY3VycmVudH1cXFwiPnt7OjpkdC5sYWJlbH19PC9zcGFuPjwvYnV0dG9uPlxcblwiICtcclxuICAgIFwiICAgICAgPC90ZD5cXG5cIiArXHJcbiAgICBcIiAgICA8L3RyPlxcblwiICtcclxuICAgIFwiICA8L3Rib2R5PlxcblwiICtcclxuICAgIFwiPC90YWJsZT5cXG5cIiArXHJcbiAgICBcIlwiKTtcclxufV0pO1xyXG5cclxuYW5ndWxhci5tb2R1bGUoXCJ1aWIvdGVtcGxhdGUvZGF0ZXBpY2tlci95ZWFyLmh0bWxcIiwgW10pLnJ1bihbXCIkdGVtcGxhdGVDYWNoZVwiLCBmdW5jdGlvbigkdGVtcGxhdGVDYWNoZSkge1xyXG4gICR0ZW1wbGF0ZUNhY2hlLnB1dChcInVpYi90ZW1wbGF0ZS9kYXRlcGlja2VyL3llYXIuaHRtbFwiLFxyXG4gICAgXCI8dGFibGUgcm9sZT1cXFwiZ3JpZFxcXCIgYXJpYS1sYWJlbGxlZGJ5PVxcXCJ7ezo6dW5pcXVlSWR9fS10aXRsZVxcXCIgYXJpYS1hY3RpdmVkZXNjZW5kYW50PVxcXCJ7e2FjdGl2ZURhdGVJZH19XFxcIj5cXG5cIiArXHJcbiAgICBcIiAgPHRoZWFkPlxcblwiICtcclxuICAgIFwiICAgIDx0cj5cXG5cIiArXHJcbiAgICBcIiAgICAgIDx0aD48YnV0dG9uIHR5cGU9XFxcImJ1dHRvblxcXCIgY2xhc3M9XFxcImJ0biBidG4tZGVmYXVsdCBidG4tc20gcHVsbC1sZWZ0IHVpYi1sZWZ0XFxcIiBuZy1jbGljaz1cXFwibW92ZSgtMSlcXFwiIHRhYmluZGV4PVxcXCItMVxcXCI+PGkgY2xhc3M9XFxcImdseXBoaWNvbiBnbHlwaGljb24tY2hldnJvbi1sZWZ0XFxcIj48L2k+PC9idXR0b24+PC90aD5cXG5cIiArXHJcbiAgICBcIiAgICAgIDx0aCBjb2xzcGFuPVxcXCJ7ezo6Y29sdW1ucyAtIDJ9fVxcXCI+PGJ1dHRvbiBpZD1cXFwie3s6OnVuaXF1ZUlkfX0tdGl0bGVcXFwiIHJvbGU9XFxcImhlYWRpbmdcXFwiIGFyaWEtbGl2ZT1cXFwiYXNzZXJ0aXZlXFxcIiBhcmlhLWF0b21pYz1cXFwidHJ1ZVxcXCIgdHlwZT1cXFwiYnV0dG9uXFxcIiBjbGFzcz1cXFwiYnRuIGJ0bi1kZWZhdWx0IGJ0bi1zbSB1aWItdGl0bGVcXFwiIG5nLWNsaWNrPVxcXCJ0b2dnbGVNb2RlKClcXFwiIG5nLWRpc2FibGVkPVxcXCJkYXRlcGlja2VyTW9kZSA9PT0gbWF4TW9kZVxcXCIgdGFiaW5kZXg9XFxcIi0xXFxcIj48c3Ryb25nPnt7dGl0bGV9fTwvc3Ryb25nPjwvYnV0dG9uPjwvdGg+XFxuXCIgK1xyXG4gICAgXCIgICAgICA8dGg+PGJ1dHRvbiB0eXBlPVxcXCJidXR0b25cXFwiIGNsYXNzPVxcXCJidG4gYnRuLWRlZmF1bHQgYnRuLXNtIHB1bGwtcmlnaHQgdWliLXJpZ2h0XFxcIiBuZy1jbGljaz1cXFwibW92ZSgxKVxcXCIgdGFiaW5kZXg9XFxcIi0xXFxcIj48aSBjbGFzcz1cXFwiZ2x5cGhpY29uIGdseXBoaWNvbi1jaGV2cm9uLXJpZ2h0XFxcIj48L2k+PC9idXR0b24+PC90aD5cXG5cIiArXHJcbiAgICBcIiAgICA8L3RyPlxcblwiICtcclxuICAgIFwiICA8L3RoZWFkPlxcblwiICtcclxuICAgIFwiICA8dGJvZHk+XFxuXCIgK1xyXG4gICAgXCIgICAgPHRyIGNsYXNzPVxcXCJ1aWIteWVhcnNcXFwiIG5nLXJlcGVhdD1cXFwicm93IGluIHJvd3MgdHJhY2sgYnkgJGluZGV4XFxcIiByb2xlPVxcXCJyb3dcXFwiPlxcblwiICtcclxuICAgIFwiICAgICAgPHRkIG5nLXJlcGVhdD1cXFwiZHQgaW4gcm93XFxcIiBjbGFzcz1cXFwidWliLXllYXIgdGV4dC1jZW50ZXJcXFwiIHJvbGU9XFxcImdyaWRjZWxsXFxcIlxcblwiICtcclxuICAgIFwiICAgICAgICBpZD1cXFwie3s6OmR0LnVpZH19XFxcIlxcblwiICtcclxuICAgIFwiICAgICAgICBuZy1jbGFzcz1cXFwiOjpkdC5jdXN0b21DbGFzc1xcXCI+XFxuXCIgK1xyXG4gICAgXCIgICAgICAgIDxidXR0b24gdHlwZT1cXFwiYnV0dG9uXFxcIiBjbGFzcz1cXFwiYnRuIGJ0bi1kZWZhdWx0XFxcIlxcblwiICtcclxuICAgIFwiICAgICAgICAgIHVpYi1pcy1jbGFzcz1cXFwiXFxuXCIgK1xyXG4gICAgXCIgICAgICAgICAgICAnYnRuLWluZm8nIGZvciBzZWxlY3RlZER0LFxcblwiICtcclxuICAgIFwiICAgICAgICAgICAgJ2FjdGl2ZScgZm9yIGFjdGl2ZUR0XFxuXCIgK1xyXG4gICAgXCIgICAgICAgICAgICBvbiBkdFxcXCJcXG5cIiArXHJcbiAgICBcIiAgICAgICAgICBuZy1jbGljaz1cXFwic2VsZWN0KGR0LmRhdGUpXFxcIlxcblwiICtcclxuICAgIFwiICAgICAgICAgIG5nLWRpc2FibGVkPVxcXCI6OmR0LmRpc2FibGVkXFxcIlxcblwiICtcclxuICAgIFwiICAgICAgICAgIHRhYmluZGV4PVxcXCItMVxcXCI+PHNwYW4gbmctY2xhc3M9XFxcIjo6eyd0ZXh0LWluZm8nOiBkdC5jdXJyZW50fVxcXCI+e3s6OmR0LmxhYmVsfX08L3NwYW4+PC9idXR0b24+XFxuXCIgK1xyXG4gICAgXCIgICAgICA8L3RkPlxcblwiICtcclxuICAgIFwiICAgIDwvdHI+XFxuXCIgK1xyXG4gICAgXCIgIDwvdGJvZHk+XFxuXCIgK1xyXG4gICAgXCI8L3RhYmxlPlxcblwiICtcclxuICAgIFwiXCIpO1xyXG59XSk7XHJcblxyXG5hbmd1bGFyLm1vZHVsZShcInVpYi90ZW1wbGF0ZS9kYXRlcGlja2VyUG9wdXAvcG9wdXAuaHRtbFwiLCBbXSkucnVuKFtcIiR0ZW1wbGF0ZUNhY2hlXCIsIGZ1bmN0aW9uKCR0ZW1wbGF0ZUNhY2hlKSB7XHJcbiAgJHRlbXBsYXRlQ2FjaGUucHV0KFwidWliL3RlbXBsYXRlL2RhdGVwaWNrZXJQb3B1cC9wb3B1cC5odG1sXCIsXHJcbiAgICBcIjx1bCBjbGFzcz1cXFwidWliLWRhdGVwaWNrZXItcG9wdXAgZHJvcGRvd24tbWVudSB1aWItcG9zaXRpb24tbWVhc3VyZVxcXCIgZHJvcGRvd24tbmVzdGVkIG5nLWlmPVxcXCJpc09wZW5cXFwiIG5nLWtleWRvd249XFxcImtleWRvd24oJGV2ZW50KVxcXCIgbmctY2xpY2s9XFxcIiRldmVudC5zdG9wUHJvcGFnYXRpb24oKVxcXCI+XFxuXCIgK1xyXG4gICAgXCIgIDxsaSBuZy10cmFuc2NsdWRlPjwvbGk+XFxuXCIgK1xyXG4gICAgXCIgIDxsaSBuZy1pZj1cXFwic2hvd0J1dHRvbkJhclxcXCIgY2xhc3M9XFxcInVpYi1idXR0b24tYmFyXFxcIj5cXG5cIiArXHJcbiAgICBcIiAgICA8c3BhbiBjbGFzcz1cXFwiYnRuLWdyb3VwIHB1bGwtbGVmdFxcXCI+XFxuXCIgK1xyXG4gICAgXCIgICAgICA8YnV0dG9uIHR5cGU9XFxcImJ1dHRvblxcXCIgY2xhc3M9XFxcImJ0biBidG4tc20gYnRuLWluZm8gdWliLWRhdGVwaWNrZXItY3VycmVudFxcXCIgbmctY2xpY2s9XFxcInNlbGVjdCgndG9kYXknLCAkZXZlbnQpXFxcIiBuZy1kaXNhYmxlZD1cXFwiaXNEaXNhYmxlZCgndG9kYXknKVxcXCI+e3sgZ2V0VGV4dCgnY3VycmVudCcpIH19PC9idXR0b24+XFxuXCIgK1xyXG4gICAgXCIgICAgICA8YnV0dG9uIHR5cGU9XFxcImJ1dHRvblxcXCIgY2xhc3M9XFxcImJ0biBidG4tc20gYnRuLWRhbmdlciB1aWItY2xlYXJcXFwiIG5nLWNsaWNrPVxcXCJzZWxlY3QobnVsbCwgJGV2ZW50KVxcXCI+e3sgZ2V0VGV4dCgnY2xlYXInKSB9fTwvYnV0dG9uPlxcblwiICtcclxuICAgIFwiICAgIDwvc3Bhbj5cXG5cIiArXHJcbiAgICBcIiAgICA8YnV0dG9uIHR5cGU9XFxcImJ1dHRvblxcXCIgY2xhc3M9XFxcImJ0biBidG4tc20gYnRuLXN1Y2Nlc3MgcHVsbC1yaWdodCB1aWItY2xvc2VcXFwiIG5nLWNsaWNrPVxcXCJjbG9zZSgkZXZlbnQpXFxcIj57eyBnZXRUZXh0KCdjbG9zZScpIH19PC9idXR0b24+XFxuXCIgK1xyXG4gICAgXCIgIDwvbGk+XFxuXCIgK1xyXG4gICAgXCI8L3VsPlxcblwiICtcclxuICAgIFwiXCIpO1xyXG59XSk7XHJcblxyXG5hbmd1bGFyLm1vZHVsZShcInVpYi90ZW1wbGF0ZS9tb2RhbC93aW5kb3cuaHRtbFwiLCBbXSkucnVuKFtcIiR0ZW1wbGF0ZUNhY2hlXCIsIGZ1bmN0aW9uKCR0ZW1wbGF0ZUNhY2hlKSB7XHJcbiAgJHRlbXBsYXRlQ2FjaGUucHV0KFwidWliL3RlbXBsYXRlL21vZGFsL3dpbmRvdy5odG1sXCIsXHJcbiAgICBcIjxkaXYgY2xhc3M9XFxcIm1vZGFsLWRpYWxvZyB7e3NpemUgPyAnbW9kYWwtJyArIHNpemUgOiAnJ319XFxcIj48ZGl2IGNsYXNzPVxcXCJtb2RhbC1jb250ZW50XFxcIiB1aWItbW9kYWwtdHJhbnNjbHVkZT48L2Rpdj48L2Rpdj5cXG5cIiArXHJcbiAgICBcIlwiKTtcclxufV0pO1xyXG5cclxuYW5ndWxhci5tb2R1bGUoXCJ1aWIvdGVtcGxhdGUvcGFnZXIvcGFnZXIuaHRtbFwiLCBbXSkucnVuKFtcIiR0ZW1wbGF0ZUNhY2hlXCIsIGZ1bmN0aW9uKCR0ZW1wbGF0ZUNhY2hlKSB7XHJcbiAgJHRlbXBsYXRlQ2FjaGUucHV0KFwidWliL3RlbXBsYXRlL3BhZ2VyL3BhZ2VyLmh0bWxcIixcclxuICAgIFwiPGxpIG5nLWNsYXNzPVxcXCJ7ZGlzYWJsZWQ6IG5vUHJldmlvdXMoKXx8bmdEaXNhYmxlZCwgcHJldmlvdXM6IGFsaWdufVxcXCI+PGEgaHJlZiBuZy1jbGljaz1cXFwic2VsZWN0UGFnZShwYWdlIC0gMSwgJGV2ZW50KVxcXCIgbmctZGlzYWJsZWQ9XFxcIm5vUHJldmlvdXMoKXx8bmdEaXNhYmxlZFxcXCIgdWliLXRhYmluZGV4LXRvZ2dsZT57ezo6Z2V0VGV4dCgncHJldmlvdXMnKX19PC9hPjwvbGk+XFxuXCIgK1xyXG4gICAgXCI8bGkgbmctY2xhc3M9XFxcIntkaXNhYmxlZDogbm9OZXh0KCl8fG5nRGlzYWJsZWQsIG5leHQ6IGFsaWdufVxcXCI+PGEgaHJlZiBuZy1jbGljaz1cXFwic2VsZWN0UGFnZShwYWdlICsgMSwgJGV2ZW50KVxcXCIgbmctZGlzYWJsZWQ9XFxcIm5vTmV4dCgpfHxuZ0Rpc2FibGVkXFxcIiB1aWItdGFiaW5kZXgtdG9nZ2xlPnt7OjpnZXRUZXh0KCduZXh0Jyl9fTwvYT48L2xpPlxcblwiICtcclxuICAgIFwiXCIpO1xyXG59XSk7XHJcblxyXG5hbmd1bGFyLm1vZHVsZShcInVpYi90ZW1wbGF0ZS9wYWdpbmF0aW9uL3BhZ2luYXRpb24uaHRtbFwiLCBbXSkucnVuKFtcIiR0ZW1wbGF0ZUNhY2hlXCIsIGZ1bmN0aW9uKCR0ZW1wbGF0ZUNhY2hlKSB7XHJcbiAgJHRlbXBsYXRlQ2FjaGUucHV0KFwidWliL3RlbXBsYXRlL3BhZ2luYXRpb24vcGFnaW5hdGlvbi5odG1sXCIsXHJcbiAgICBcIjxsaSBuZy1pZj1cXFwiOjpib3VuZGFyeUxpbmtzXFxcIiBuZy1jbGFzcz1cXFwie2Rpc2FibGVkOiBub1ByZXZpb3VzKCl8fG5nRGlzYWJsZWR9XFxcIiBjbGFzcz1cXFwicGFnaW5hdGlvbi1maXJzdFxcXCI+PGEgaHJlZiBuZy1jbGljaz1cXFwic2VsZWN0UGFnZSgxLCAkZXZlbnQpXFxcIiBuZy1kaXNhYmxlZD1cXFwibm9QcmV2aW91cygpfHxuZ0Rpc2FibGVkXFxcIiB1aWItdGFiaW5kZXgtdG9nZ2xlPnt7OjpnZXRUZXh0KCdmaXJzdCcpfX08L2E+PC9saT5cXG5cIiArXHJcbiAgICBcIjxsaSBuZy1pZj1cXFwiOjpkaXJlY3Rpb25MaW5rc1xcXCIgbmctY2xhc3M9XFxcIntkaXNhYmxlZDogbm9QcmV2aW91cygpfHxuZ0Rpc2FibGVkfVxcXCIgY2xhc3M9XFxcInBhZ2luYXRpb24tcHJldlxcXCI+PGEgaHJlZiBuZy1jbGljaz1cXFwic2VsZWN0UGFnZShwYWdlIC0gMSwgJGV2ZW50KVxcXCIgbmctZGlzYWJsZWQ9XFxcIm5vUHJldmlvdXMoKXx8bmdEaXNhYmxlZFxcXCIgdWliLXRhYmluZGV4LXRvZ2dsZT57ezo6Z2V0VGV4dCgncHJldmlvdXMnKX19PC9hPjwvbGk+XFxuXCIgK1xyXG4gICAgXCI8bGkgbmctcmVwZWF0PVxcXCJwYWdlIGluIHBhZ2VzIHRyYWNrIGJ5ICRpbmRleFxcXCIgbmctY2xhc3M9XFxcInthY3RpdmU6IHBhZ2UuYWN0aXZlLGRpc2FibGVkOiBuZ0Rpc2FibGVkJiYhcGFnZS5hY3RpdmV9XFxcIiBjbGFzcz1cXFwicGFnaW5hdGlvbi1wYWdlXFxcIj48YSBocmVmIG5nLWNsaWNrPVxcXCJzZWxlY3RQYWdlKHBhZ2UubnVtYmVyLCAkZXZlbnQpXFxcIiBuZy1kaXNhYmxlZD1cXFwibmdEaXNhYmxlZCYmIXBhZ2UuYWN0aXZlXFxcIiB1aWItdGFiaW5kZXgtdG9nZ2xlPnt7cGFnZS50ZXh0fX08L2E+PC9saT5cXG5cIiArXHJcbiAgICBcIjxsaSBuZy1pZj1cXFwiOjpkaXJlY3Rpb25MaW5rc1xcXCIgbmctY2xhc3M9XFxcIntkaXNhYmxlZDogbm9OZXh0KCl8fG5nRGlzYWJsZWR9XFxcIiBjbGFzcz1cXFwicGFnaW5hdGlvbi1uZXh0XFxcIj48YSBocmVmIG5nLWNsaWNrPVxcXCJzZWxlY3RQYWdlKHBhZ2UgKyAxLCAkZXZlbnQpXFxcIiBuZy1kaXNhYmxlZD1cXFwibm9OZXh0KCl8fG5nRGlzYWJsZWRcXFwiIHVpYi10YWJpbmRleC10b2dnbGU+e3s6OmdldFRleHQoJ25leHQnKX19PC9hPjwvbGk+XFxuXCIgK1xyXG4gICAgXCI8bGkgbmctaWY9XFxcIjo6Ym91bmRhcnlMaW5rc1xcXCIgbmctY2xhc3M9XFxcIntkaXNhYmxlZDogbm9OZXh0KCl8fG5nRGlzYWJsZWR9XFxcIiBjbGFzcz1cXFwicGFnaW5hdGlvbi1sYXN0XFxcIj48YSBocmVmIG5nLWNsaWNrPVxcXCJzZWxlY3RQYWdlKHRvdGFsUGFnZXMsICRldmVudClcXFwiIG5nLWRpc2FibGVkPVxcXCJub05leHQoKXx8bmdEaXNhYmxlZFxcXCIgdWliLXRhYmluZGV4LXRvZ2dsZT57ezo6Z2V0VGV4dCgnbGFzdCcpfX08L2E+PC9saT5cXG5cIiArXHJcbiAgICBcIlwiKTtcclxufV0pO1xyXG5cclxuYW5ndWxhci5tb2R1bGUoXCJ1aWIvdGVtcGxhdGUvdG9vbHRpcC90b29sdGlwLWh0bWwtcG9wdXAuaHRtbFwiLCBbXSkucnVuKFtcIiR0ZW1wbGF0ZUNhY2hlXCIsIGZ1bmN0aW9uKCR0ZW1wbGF0ZUNhY2hlKSB7XHJcbiAgJHRlbXBsYXRlQ2FjaGUucHV0KFwidWliL3RlbXBsYXRlL3Rvb2x0aXAvdG9vbHRpcC1odG1sLXBvcHVwLmh0bWxcIixcclxuICAgIFwiPGRpdiBjbGFzcz1cXFwidG9vbHRpcC1hcnJvd1xcXCI+PC9kaXY+XFxuXCIgK1xyXG4gICAgXCI8ZGl2IGNsYXNzPVxcXCJ0b29sdGlwLWlubmVyXFxcIiBuZy1iaW5kLWh0bWw9XFxcImNvbnRlbnRFeHAoKVxcXCI+PC9kaXY+XFxuXCIgK1xyXG4gICAgXCJcIik7XHJcbn1dKTtcclxuXHJcbmFuZ3VsYXIubW9kdWxlKFwidWliL3RlbXBsYXRlL3Rvb2x0aXAvdG9vbHRpcC1wb3B1cC5odG1sXCIsIFtdKS5ydW4oW1wiJHRlbXBsYXRlQ2FjaGVcIiwgZnVuY3Rpb24oJHRlbXBsYXRlQ2FjaGUpIHtcclxuICAkdGVtcGxhdGVDYWNoZS5wdXQoXCJ1aWIvdGVtcGxhdGUvdG9vbHRpcC90b29sdGlwLXBvcHVwLmh0bWxcIixcclxuICAgIFwiPGRpdiBjbGFzcz1cXFwidG9vbHRpcC1hcnJvd1xcXCI+PC9kaXY+XFxuXCIgK1xyXG4gICAgXCI8ZGl2IGNsYXNzPVxcXCJ0b29sdGlwLWlubmVyXFxcIiBuZy1iaW5kPVxcXCJjb250ZW50XFxcIj48L2Rpdj5cXG5cIiArXHJcbiAgICBcIlwiKTtcclxufV0pO1xyXG5cclxuYW5ndWxhci5tb2R1bGUoXCJ1aWIvdGVtcGxhdGUvdG9vbHRpcC90b29sdGlwLXRlbXBsYXRlLXBvcHVwLmh0bWxcIiwgW10pLnJ1bihbXCIkdGVtcGxhdGVDYWNoZVwiLCBmdW5jdGlvbigkdGVtcGxhdGVDYWNoZSkge1xyXG4gICR0ZW1wbGF0ZUNhY2hlLnB1dChcInVpYi90ZW1wbGF0ZS90b29sdGlwL3Rvb2x0aXAtdGVtcGxhdGUtcG9wdXAuaHRtbFwiLFxyXG4gICAgXCI8ZGl2IGNsYXNzPVxcXCJ0b29sdGlwLWFycm93XFxcIj48L2Rpdj5cXG5cIiArXHJcbiAgICBcIjxkaXYgY2xhc3M9XFxcInRvb2x0aXAtaW5uZXJcXFwiXFxuXCIgK1xyXG4gICAgXCIgIHVpYi10b29sdGlwLXRlbXBsYXRlLXRyYW5zY2x1ZGU9XFxcImNvbnRlbnRFeHAoKVxcXCJcXG5cIiArXHJcbiAgICBcIiAgdG9vbHRpcC10ZW1wbGF0ZS10cmFuc2NsdWRlLXNjb3BlPVxcXCJvcmlnaW5TY29wZSgpXFxcIj48L2Rpdj5cXG5cIiArXHJcbiAgICBcIlwiKTtcclxufV0pO1xyXG5cclxuYW5ndWxhci5tb2R1bGUoXCJ1aWIvdGVtcGxhdGUvcG9wb3Zlci9wb3BvdmVyLWh0bWwuaHRtbFwiLCBbXSkucnVuKFtcIiR0ZW1wbGF0ZUNhY2hlXCIsIGZ1bmN0aW9uKCR0ZW1wbGF0ZUNhY2hlKSB7XHJcbiAgJHRlbXBsYXRlQ2FjaGUucHV0KFwidWliL3RlbXBsYXRlL3BvcG92ZXIvcG9wb3Zlci1odG1sLmh0bWxcIixcclxuICAgIFwiPGRpdiBjbGFzcz1cXFwiYXJyb3dcXFwiPjwvZGl2PlxcblwiICtcclxuICAgIFwiXFxuXCIgK1xyXG4gICAgXCI8ZGl2IGNsYXNzPVxcXCJwb3BvdmVyLWlubmVyXFxcIj5cXG5cIiArXHJcbiAgICBcIiAgICA8aDMgY2xhc3M9XFxcInBvcG92ZXItdGl0bGVcXFwiIG5nLWJpbmQ9XFxcInVpYlRpdGxlXFxcIiBuZy1pZj1cXFwidWliVGl0bGVcXFwiPjwvaDM+XFxuXCIgK1xyXG4gICAgXCIgICAgPGRpdiBjbGFzcz1cXFwicG9wb3Zlci1jb250ZW50XFxcIiBuZy1iaW5kLWh0bWw9XFxcImNvbnRlbnRFeHAoKVxcXCI+PC9kaXY+XFxuXCIgK1xyXG4gICAgXCI8L2Rpdj5cXG5cIiArXHJcbiAgICBcIlwiKTtcclxufV0pO1xyXG5cclxuYW5ndWxhci5tb2R1bGUoXCJ1aWIvdGVtcGxhdGUvcG9wb3Zlci9wb3BvdmVyLXRlbXBsYXRlLmh0bWxcIiwgW10pLnJ1bihbXCIkdGVtcGxhdGVDYWNoZVwiLCBmdW5jdGlvbigkdGVtcGxhdGVDYWNoZSkge1xyXG4gICR0ZW1wbGF0ZUNhY2hlLnB1dChcInVpYi90ZW1wbGF0ZS9wb3BvdmVyL3BvcG92ZXItdGVtcGxhdGUuaHRtbFwiLFxyXG4gICAgXCI8ZGl2IGNsYXNzPVxcXCJhcnJvd1xcXCI+PC9kaXY+XFxuXCIgK1xyXG4gICAgXCJcXG5cIiArXHJcbiAgICBcIjxkaXYgY2xhc3M9XFxcInBvcG92ZXItaW5uZXJcXFwiPlxcblwiICtcclxuICAgIFwiICAgIDxoMyBjbGFzcz1cXFwicG9wb3Zlci10aXRsZVxcXCIgbmctYmluZD1cXFwidWliVGl0bGVcXFwiIG5nLWlmPVxcXCJ1aWJUaXRsZVxcXCI+PC9oMz5cXG5cIiArXHJcbiAgICBcIiAgICA8ZGl2IGNsYXNzPVxcXCJwb3BvdmVyLWNvbnRlbnRcXFwiXFxuXCIgK1xyXG4gICAgXCIgICAgICB1aWItdG9vbHRpcC10ZW1wbGF0ZS10cmFuc2NsdWRlPVxcXCJjb250ZW50RXhwKClcXFwiXFxuXCIgK1xyXG4gICAgXCIgICAgICB0b29sdGlwLXRlbXBsYXRlLXRyYW5zY2x1ZGUtc2NvcGU9XFxcIm9yaWdpblNjb3BlKClcXFwiPjwvZGl2PlxcblwiICtcclxuICAgIFwiPC9kaXY+XFxuXCIgK1xyXG4gICAgXCJcIik7XHJcbn1dKTtcclxuXHJcbmFuZ3VsYXIubW9kdWxlKFwidWliL3RlbXBsYXRlL3BvcG92ZXIvcG9wb3Zlci5odG1sXCIsIFtdKS5ydW4oW1wiJHRlbXBsYXRlQ2FjaGVcIiwgZnVuY3Rpb24oJHRlbXBsYXRlQ2FjaGUpIHtcclxuICAkdGVtcGxhdGVDYWNoZS5wdXQoXCJ1aWIvdGVtcGxhdGUvcG9wb3Zlci9wb3BvdmVyLmh0bWxcIixcclxuICAgIFwiPGRpdiBjbGFzcz1cXFwiYXJyb3dcXFwiPjwvZGl2PlxcblwiICtcclxuICAgIFwiXFxuXCIgK1xyXG4gICAgXCI8ZGl2IGNsYXNzPVxcXCJwb3BvdmVyLWlubmVyXFxcIj5cXG5cIiArXHJcbiAgICBcIiAgICA8aDMgY2xhc3M9XFxcInBvcG92ZXItdGl0bGVcXFwiIG5nLWJpbmQ9XFxcInVpYlRpdGxlXFxcIiBuZy1pZj1cXFwidWliVGl0bGVcXFwiPjwvaDM+XFxuXCIgK1xyXG4gICAgXCIgICAgPGRpdiBjbGFzcz1cXFwicG9wb3Zlci1jb250ZW50XFxcIiBuZy1iaW5kPVxcXCJjb250ZW50XFxcIj48L2Rpdj5cXG5cIiArXHJcbiAgICBcIjwvZGl2PlxcblwiICtcclxuICAgIFwiXCIpO1xyXG59XSk7XHJcblxyXG5hbmd1bGFyLm1vZHVsZShcInVpYi90ZW1wbGF0ZS9wcm9ncmVzc2Jhci9iYXIuaHRtbFwiLCBbXSkucnVuKFtcIiR0ZW1wbGF0ZUNhY2hlXCIsIGZ1bmN0aW9uKCR0ZW1wbGF0ZUNhY2hlKSB7XHJcbiAgJHRlbXBsYXRlQ2FjaGUucHV0KFwidWliL3RlbXBsYXRlL3Byb2dyZXNzYmFyL2Jhci5odG1sXCIsXHJcbiAgICBcIjxkaXYgY2xhc3M9XFxcInByb2dyZXNzLWJhclxcXCIgbmctY2xhc3M9XFxcInR5cGUgJiYgJ3Byb2dyZXNzLWJhci0nICsgdHlwZVxcXCIgcm9sZT1cXFwicHJvZ3Jlc3NiYXJcXFwiIGFyaWEtdmFsdWVub3c9XFxcInt7dmFsdWV9fVxcXCIgYXJpYS12YWx1ZW1pbj1cXFwiMFxcXCIgYXJpYS12YWx1ZW1heD1cXFwie3ttYXh9fVxcXCIgbmctc3R5bGU9XFxcInt3aWR0aDogKHBlcmNlbnQgPCAxMDAgPyBwZXJjZW50IDogMTAwKSArICclJ31cXFwiIGFyaWEtdmFsdWV0ZXh0PVxcXCJ7e3BlcmNlbnQgfCBudW1iZXI6MH19JVxcXCIgYXJpYS1sYWJlbGxlZGJ5PVxcXCJ7ezo6dGl0bGV9fVxcXCIgbmctdHJhbnNjbHVkZT48L2Rpdj5cXG5cIiArXHJcbiAgICBcIlwiKTtcclxufV0pO1xyXG5cclxuYW5ndWxhci5tb2R1bGUoXCJ1aWIvdGVtcGxhdGUvcHJvZ3Jlc3NiYXIvcHJvZ3Jlc3MuaHRtbFwiLCBbXSkucnVuKFtcIiR0ZW1wbGF0ZUNhY2hlXCIsIGZ1bmN0aW9uKCR0ZW1wbGF0ZUNhY2hlKSB7XHJcbiAgJHRlbXBsYXRlQ2FjaGUucHV0KFwidWliL3RlbXBsYXRlL3Byb2dyZXNzYmFyL3Byb2dyZXNzLmh0bWxcIixcclxuICAgIFwiPGRpdiBjbGFzcz1cXFwicHJvZ3Jlc3NcXFwiIG5nLXRyYW5zY2x1ZGUgYXJpYS1sYWJlbGxlZGJ5PVxcXCJ7ezo6dGl0bGV9fVxcXCI+PC9kaXY+XCIpO1xyXG59XSk7XHJcblxyXG5hbmd1bGFyLm1vZHVsZShcInVpYi90ZW1wbGF0ZS9wcm9ncmVzc2Jhci9wcm9ncmVzc2Jhci5odG1sXCIsIFtdKS5ydW4oW1wiJHRlbXBsYXRlQ2FjaGVcIiwgZnVuY3Rpb24oJHRlbXBsYXRlQ2FjaGUpIHtcclxuICAkdGVtcGxhdGVDYWNoZS5wdXQoXCJ1aWIvdGVtcGxhdGUvcHJvZ3Jlc3NiYXIvcHJvZ3Jlc3NiYXIuaHRtbFwiLFxyXG4gICAgXCI8ZGl2IGNsYXNzPVxcXCJwcm9ncmVzc1xcXCI+XFxuXCIgK1xyXG4gICAgXCIgIDxkaXYgY2xhc3M9XFxcInByb2dyZXNzLWJhclxcXCIgbmctY2xhc3M9XFxcInR5cGUgJiYgJ3Byb2dyZXNzLWJhci0nICsgdHlwZVxcXCIgcm9sZT1cXFwicHJvZ3Jlc3NiYXJcXFwiIGFyaWEtdmFsdWVub3c9XFxcInt7dmFsdWV9fVxcXCIgYXJpYS12YWx1ZW1pbj1cXFwiMFxcXCIgYXJpYS12YWx1ZW1heD1cXFwie3ttYXh9fVxcXCIgbmctc3R5bGU9XFxcInt3aWR0aDogKHBlcmNlbnQgPCAxMDAgPyBwZXJjZW50IDogMTAwKSArICclJ31cXFwiIGFyaWEtdmFsdWV0ZXh0PVxcXCJ7e3BlcmNlbnQgfCBudW1iZXI6MH19JVxcXCIgYXJpYS1sYWJlbGxlZGJ5PVxcXCJ7ezo6dGl0bGV9fVxcXCIgbmctdHJhbnNjbHVkZT48L2Rpdj5cXG5cIiArXHJcbiAgICBcIjwvZGl2PlxcblwiICtcclxuICAgIFwiXCIpO1xyXG59XSk7XHJcblxyXG5hbmd1bGFyLm1vZHVsZShcInVpYi90ZW1wbGF0ZS9yYXRpbmcvcmF0aW5nLmh0bWxcIiwgW10pLnJ1bihbXCIkdGVtcGxhdGVDYWNoZVwiLCBmdW5jdGlvbigkdGVtcGxhdGVDYWNoZSkge1xyXG4gICR0ZW1wbGF0ZUNhY2hlLnB1dChcInVpYi90ZW1wbGF0ZS9yYXRpbmcvcmF0aW5nLmh0bWxcIixcclxuICAgIFwiPHNwYW4gbmctbW91c2VsZWF2ZT1cXFwicmVzZXQoKVxcXCIgbmcta2V5ZG93bj1cXFwib25LZXlkb3duKCRldmVudClcXFwiIHRhYmluZGV4PVxcXCIwXFxcIiByb2xlPVxcXCJzbGlkZXJcXFwiIGFyaWEtdmFsdWVtaW49XFxcIjBcXFwiIGFyaWEtdmFsdWVtYXg9XFxcInt7cmFuZ2UubGVuZ3RofX1cXFwiIGFyaWEtdmFsdWVub3c9XFxcInt7dmFsdWV9fVxcXCIgYXJpYS12YWx1ZXRleHQ9XFxcInt7dGl0bGV9fVxcXCI+XFxuXCIgK1xyXG4gICAgXCIgICAgPHNwYW4gbmctcmVwZWF0LXN0YXJ0PVxcXCJyIGluIHJhbmdlIHRyYWNrIGJ5ICRpbmRleFxcXCIgY2xhc3M9XFxcInNyLW9ubHlcXFwiPih7eyAkaW5kZXggPCB2YWx1ZSA/ICcqJyA6ICcgJyB9fSk8L3NwYW4+XFxuXCIgK1xyXG4gICAgXCIgICAgPGkgbmctcmVwZWF0LWVuZCBuZy1tb3VzZWVudGVyPVxcXCJlbnRlcigkaW5kZXggKyAxKVxcXCIgbmctY2xpY2s9XFxcInJhdGUoJGluZGV4ICsgMSlcXFwiIGNsYXNzPVxcXCJnbHlwaGljb25cXFwiIG5nLWNsYXNzPVxcXCIkaW5kZXggPCB2YWx1ZSAmJiAoci5zdGF0ZU9uIHx8ICdnbHlwaGljb24tc3RhcicpIHx8IChyLnN0YXRlT2ZmIHx8ICdnbHlwaGljb24tc3Rhci1lbXB0eScpXFxcIiBuZy1hdHRyLXRpdGxlPVxcXCJ7e3IudGl0bGV9fVxcXCI+PC9pPlxcblwiICtcclxuICAgIFwiPC9zcGFuPlxcblwiICtcclxuICAgIFwiXCIpO1xyXG59XSk7XHJcblxyXG5hbmd1bGFyLm1vZHVsZShcInVpYi90ZW1wbGF0ZS90YWJzL3RhYi5odG1sXCIsIFtdKS5ydW4oW1wiJHRlbXBsYXRlQ2FjaGVcIiwgZnVuY3Rpb24oJHRlbXBsYXRlQ2FjaGUpIHtcclxuICAkdGVtcGxhdGVDYWNoZS5wdXQoXCJ1aWIvdGVtcGxhdGUvdGFicy90YWIuaHRtbFwiLFxyXG4gICAgXCI8bGkgbmctY2xhc3M9XFxcIlt7YWN0aXZlOiBhY3RpdmUsIGRpc2FibGVkOiBkaXNhYmxlZH0sIGNsYXNzZXNdXFxcIiBjbGFzcz1cXFwidWliLXRhYiBuYXYtaXRlbVxcXCI+XFxuXCIgK1xyXG4gICAgXCIgIDxhIGhyZWYgbmctY2xpY2s9XFxcInNlbGVjdCgkZXZlbnQpXFxcIiBjbGFzcz1cXFwibmF2LWxpbmtcXFwiIHVpYi10YWItaGVhZGluZy10cmFuc2NsdWRlPnt7aGVhZGluZ319PC9hPlxcblwiICtcclxuICAgIFwiPC9saT5cXG5cIiArXHJcbiAgICBcIlwiKTtcclxufV0pO1xyXG5cclxuYW5ndWxhci5tb2R1bGUoXCJ1aWIvdGVtcGxhdGUvdGFicy90YWJzZXQuaHRtbFwiLCBbXSkucnVuKFtcIiR0ZW1wbGF0ZUNhY2hlXCIsIGZ1bmN0aW9uKCR0ZW1wbGF0ZUNhY2hlKSB7XHJcbiAgJHRlbXBsYXRlQ2FjaGUucHV0KFwidWliL3RlbXBsYXRlL3RhYnMvdGFic2V0Lmh0bWxcIixcclxuICAgIFwiPGRpdj5cXG5cIiArXHJcbiAgICBcIiAgPHVsIGNsYXNzPVxcXCJuYXYgbmF2LXt7dGFic2V0LnR5cGUgfHwgJ3RhYnMnfX1cXFwiIG5nLWNsYXNzPVxcXCJ7J25hdi1zdGFja2VkJzogdmVydGljYWwsICduYXYtanVzdGlmaWVkJzoganVzdGlmaWVkfVxcXCIgbmctdHJhbnNjbHVkZT48L3VsPlxcblwiICtcclxuICAgIFwiICA8ZGl2IGNsYXNzPVxcXCJ0YWItY29udGVudFxcXCI+XFxuXCIgK1xyXG4gICAgXCIgICAgPGRpdiBjbGFzcz1cXFwidGFiLXBhbmVcXFwiXFxuXCIgK1xyXG4gICAgXCIgICAgICAgICBuZy1yZXBlYXQ9XFxcInRhYiBpbiB0YWJzZXQudGFic1xcXCJcXG5cIiArXHJcbiAgICBcIiAgICAgICAgIG5nLWNsYXNzPVxcXCJ7YWN0aXZlOiB0YWJzZXQuYWN0aXZlID09PSB0YWIuaW5kZXh9XFxcIlxcblwiICtcclxuICAgIFwiICAgICAgICAgdWliLXRhYi1jb250ZW50LXRyYW5zY2x1ZGU9XFxcInRhYlxcXCI+XFxuXCIgK1xyXG4gICAgXCIgICAgPC9kaXY+XFxuXCIgK1xyXG4gICAgXCIgIDwvZGl2PlxcblwiICtcclxuICAgIFwiPC9kaXY+XFxuXCIgK1xyXG4gICAgXCJcIik7XHJcbn1dKTtcclxuXHJcbmFuZ3VsYXIubW9kdWxlKFwidWliL3RlbXBsYXRlL3RpbWVwaWNrZXIvdGltZXBpY2tlci5odG1sXCIsIFtdKS5ydW4oW1wiJHRlbXBsYXRlQ2FjaGVcIiwgZnVuY3Rpb24oJHRlbXBsYXRlQ2FjaGUpIHtcclxuICAkdGVtcGxhdGVDYWNoZS5wdXQoXCJ1aWIvdGVtcGxhdGUvdGltZXBpY2tlci90aW1lcGlja2VyLmh0bWxcIixcclxuICAgIFwiPHRhYmxlIGNsYXNzPVxcXCJ1aWItdGltZXBpY2tlclxcXCI+XFxuXCIgK1xyXG4gICAgXCIgIDx0Ym9keT5cXG5cIiArXHJcbiAgICBcIiAgICA8dHIgY2xhc3M9XFxcInRleHQtY2VudGVyXFxcIiBuZy1zaG93PVxcXCI6OnNob3dTcGlubmVyc1xcXCI+XFxuXCIgK1xyXG4gICAgXCIgICAgICA8dGQgY2xhc3M9XFxcInVpYi1pbmNyZW1lbnQgaG91cnNcXFwiPjxhIG5nLWNsaWNrPVxcXCJpbmNyZW1lbnRIb3VycygpXFxcIiBuZy1jbGFzcz1cXFwie2Rpc2FibGVkOiBub0luY3JlbWVudEhvdXJzKCl9XFxcIiBjbGFzcz1cXFwiYnRuIGJ0bi1saW5rXFxcIiBuZy1kaXNhYmxlZD1cXFwibm9JbmNyZW1lbnRIb3VycygpXFxcIiB0YWJpbmRleD1cXFwiLTFcXFwiPjxzcGFuIGNsYXNzPVxcXCJnbHlwaGljb24gZ2x5cGhpY29uLWNoZXZyb24tdXBcXFwiPjwvc3Bhbj48L2E+PC90ZD5cXG5cIiArXHJcbiAgICBcIiAgICAgIDx0ZD4mbmJzcDs8L3RkPlxcblwiICtcclxuICAgIFwiICAgICAgPHRkIGNsYXNzPVxcXCJ1aWItaW5jcmVtZW50IG1pbnV0ZXNcXFwiPjxhIG5nLWNsaWNrPVxcXCJpbmNyZW1lbnRNaW51dGVzKClcXFwiIG5nLWNsYXNzPVxcXCJ7ZGlzYWJsZWQ6IG5vSW5jcmVtZW50TWludXRlcygpfVxcXCIgY2xhc3M9XFxcImJ0biBidG4tbGlua1xcXCIgbmctZGlzYWJsZWQ9XFxcIm5vSW5jcmVtZW50TWludXRlcygpXFxcIiB0YWJpbmRleD1cXFwiLTFcXFwiPjxzcGFuIGNsYXNzPVxcXCJnbHlwaGljb24gZ2x5cGhpY29uLWNoZXZyb24tdXBcXFwiPjwvc3Bhbj48L2E+PC90ZD5cXG5cIiArXHJcbiAgICBcIiAgICAgIDx0ZCBuZy1zaG93PVxcXCJzaG93U2Vjb25kc1xcXCI+Jm5ic3A7PC90ZD5cXG5cIiArXHJcbiAgICBcIiAgICAgIDx0ZCBuZy1zaG93PVxcXCJzaG93U2Vjb25kc1xcXCIgY2xhc3M9XFxcInVpYi1pbmNyZW1lbnQgc2Vjb25kc1xcXCI+PGEgbmctY2xpY2s9XFxcImluY3JlbWVudFNlY29uZHMoKVxcXCIgbmctY2xhc3M9XFxcIntkaXNhYmxlZDogbm9JbmNyZW1lbnRTZWNvbmRzKCl9XFxcIiBjbGFzcz1cXFwiYnRuIGJ0bi1saW5rXFxcIiBuZy1kaXNhYmxlZD1cXFwibm9JbmNyZW1lbnRTZWNvbmRzKClcXFwiIHRhYmluZGV4PVxcXCItMVxcXCI+PHNwYW4gY2xhc3M9XFxcImdseXBoaWNvbiBnbHlwaGljb24tY2hldnJvbi11cFxcXCI+PC9zcGFuPjwvYT48L3RkPlxcblwiICtcclxuICAgIFwiICAgICAgPHRkIG5nLXNob3c9XFxcInNob3dNZXJpZGlhblxcXCI+PC90ZD5cXG5cIiArXHJcbiAgICBcIiAgICA8L3RyPlxcblwiICtcclxuICAgIFwiICAgIDx0cj5cXG5cIiArXHJcbiAgICBcIiAgICAgIDx0ZCBjbGFzcz1cXFwiZm9ybS1ncm91cCB1aWItdGltZSBob3Vyc1xcXCIgbmctY2xhc3M9XFxcInsnaGFzLWVycm9yJzogaW52YWxpZEhvdXJzfVxcXCI+XFxuXCIgK1xyXG4gICAgXCIgICAgICAgIDxpbnB1dCB0eXBlPVxcXCJ0ZXh0XFxcIiBwbGFjZWhvbGRlcj1cXFwiSEhcXFwiIG5nLW1vZGVsPVxcXCJob3Vyc1xcXCIgbmctY2hhbmdlPVxcXCJ1cGRhdGVIb3VycygpXFxcIiBjbGFzcz1cXFwiZm9ybS1jb250cm9sIHRleHQtY2VudGVyXFxcIiBuZy1yZWFkb25seT1cXFwiOjpyZWFkb25seUlucHV0XFxcIiBtYXhsZW5ndGg9XFxcIjJcXFwiIHRhYmluZGV4PVxcXCJ7ezo6dGFiaW5kZXh9fVxcXCIgbmctZGlzYWJsZWQ9XFxcIm5vSW5jcmVtZW50SG91cnMoKVxcXCIgbmctYmx1cj1cXFwiYmx1cigpXFxcIj5cXG5cIiArXHJcbiAgICBcIiAgICAgIDwvdGQ+XFxuXCIgK1xyXG4gICAgXCIgICAgICA8dGQgY2xhc3M9XFxcInVpYi1zZXBhcmF0b3JcXFwiPjo8L3RkPlxcblwiICtcclxuICAgIFwiICAgICAgPHRkIGNsYXNzPVxcXCJmb3JtLWdyb3VwIHVpYi10aW1lIG1pbnV0ZXNcXFwiIG5nLWNsYXNzPVxcXCJ7J2hhcy1lcnJvcic6IGludmFsaWRNaW51dGVzfVxcXCI+XFxuXCIgK1xyXG4gICAgXCIgICAgICAgIDxpbnB1dCB0eXBlPVxcXCJ0ZXh0XFxcIiBwbGFjZWhvbGRlcj1cXFwiTU1cXFwiIG5nLW1vZGVsPVxcXCJtaW51dGVzXFxcIiBuZy1jaGFuZ2U9XFxcInVwZGF0ZU1pbnV0ZXMoKVxcXCIgY2xhc3M9XFxcImZvcm0tY29udHJvbCB0ZXh0LWNlbnRlclxcXCIgbmctcmVhZG9ubHk9XFxcIjo6cmVhZG9ubHlJbnB1dFxcXCIgbWF4bGVuZ3RoPVxcXCIyXFxcIiB0YWJpbmRleD1cXFwie3s6OnRhYmluZGV4fX1cXFwiIG5nLWRpc2FibGVkPVxcXCJub0luY3JlbWVudE1pbnV0ZXMoKVxcXCIgbmctYmx1cj1cXFwiYmx1cigpXFxcIj5cXG5cIiArXHJcbiAgICBcIiAgICAgIDwvdGQ+XFxuXCIgK1xyXG4gICAgXCIgICAgICA8dGQgbmctc2hvdz1cXFwic2hvd1NlY29uZHNcXFwiIGNsYXNzPVxcXCJ1aWItc2VwYXJhdG9yXFxcIj46PC90ZD5cXG5cIiArXHJcbiAgICBcIiAgICAgIDx0ZCBjbGFzcz1cXFwiZm9ybS1ncm91cCB1aWItdGltZSBzZWNvbmRzXFxcIiBuZy1jbGFzcz1cXFwieydoYXMtZXJyb3InOiBpbnZhbGlkU2Vjb25kc31cXFwiIG5nLXNob3c9XFxcInNob3dTZWNvbmRzXFxcIj5cXG5cIiArXHJcbiAgICBcIiAgICAgICAgPGlucHV0IHR5cGU9XFxcInRleHRcXFwiIHBsYWNlaG9sZGVyPVxcXCJTU1xcXCIgbmctbW9kZWw9XFxcInNlY29uZHNcXFwiIG5nLWNoYW5nZT1cXFwidXBkYXRlU2Vjb25kcygpXFxcIiBjbGFzcz1cXFwiZm9ybS1jb250cm9sIHRleHQtY2VudGVyXFxcIiBuZy1yZWFkb25seT1cXFwicmVhZG9ubHlJbnB1dFxcXCIgbWF4bGVuZ3RoPVxcXCIyXFxcIiB0YWJpbmRleD1cXFwie3s6OnRhYmluZGV4fX1cXFwiIG5nLWRpc2FibGVkPVxcXCJub0luY3JlbWVudFNlY29uZHMoKVxcXCIgbmctYmx1cj1cXFwiYmx1cigpXFxcIj5cXG5cIiArXHJcbiAgICBcIiAgICAgIDwvdGQ+XFxuXCIgK1xyXG4gICAgXCIgICAgICA8dGQgbmctc2hvdz1cXFwic2hvd01lcmlkaWFuXFxcIiBjbGFzcz1cXFwidWliLXRpbWUgYW0tcG1cXFwiPjxidXR0b24gdHlwZT1cXFwiYnV0dG9uXFxcIiBuZy1jbGFzcz1cXFwie2Rpc2FibGVkOiBub1RvZ2dsZU1lcmlkaWFuKCl9XFxcIiBjbGFzcz1cXFwiYnRuIGJ0bi1kZWZhdWx0IHRleHQtY2VudGVyXFxcIiBuZy1jbGljaz1cXFwidG9nZ2xlTWVyaWRpYW4oKVxcXCIgbmctZGlzYWJsZWQ9XFxcIm5vVG9nZ2xlTWVyaWRpYW4oKVxcXCIgdGFiaW5kZXg9XFxcInt7Ojp0YWJpbmRleH19XFxcIj57e21lcmlkaWFufX08L2J1dHRvbj48L3RkPlxcblwiICtcclxuICAgIFwiICAgIDwvdHI+XFxuXCIgK1xyXG4gICAgXCIgICAgPHRyIGNsYXNzPVxcXCJ0ZXh0LWNlbnRlclxcXCIgbmctc2hvdz1cXFwiOjpzaG93U3Bpbm5lcnNcXFwiPlxcblwiICtcclxuICAgIFwiICAgICAgPHRkIGNsYXNzPVxcXCJ1aWItZGVjcmVtZW50IGhvdXJzXFxcIj48YSBuZy1jbGljaz1cXFwiZGVjcmVtZW50SG91cnMoKVxcXCIgbmctY2xhc3M9XFxcIntkaXNhYmxlZDogbm9EZWNyZW1lbnRIb3VycygpfVxcXCIgY2xhc3M9XFxcImJ0biBidG4tbGlua1xcXCIgbmctZGlzYWJsZWQ9XFxcIm5vRGVjcmVtZW50SG91cnMoKVxcXCIgdGFiaW5kZXg9XFxcIi0xXFxcIj48c3BhbiBjbGFzcz1cXFwiZ2x5cGhpY29uIGdseXBoaWNvbi1jaGV2cm9uLWRvd25cXFwiPjwvc3Bhbj48L2E+PC90ZD5cXG5cIiArXHJcbiAgICBcIiAgICAgIDx0ZD4mbmJzcDs8L3RkPlxcblwiICtcclxuICAgIFwiICAgICAgPHRkIGNsYXNzPVxcXCJ1aWItZGVjcmVtZW50IG1pbnV0ZXNcXFwiPjxhIG5nLWNsaWNrPVxcXCJkZWNyZW1lbnRNaW51dGVzKClcXFwiIG5nLWNsYXNzPVxcXCJ7ZGlzYWJsZWQ6IG5vRGVjcmVtZW50TWludXRlcygpfVxcXCIgY2xhc3M9XFxcImJ0biBidG4tbGlua1xcXCIgbmctZGlzYWJsZWQ9XFxcIm5vRGVjcmVtZW50TWludXRlcygpXFxcIiB0YWJpbmRleD1cXFwiLTFcXFwiPjxzcGFuIGNsYXNzPVxcXCJnbHlwaGljb24gZ2x5cGhpY29uLWNoZXZyb24tZG93blxcXCI+PC9zcGFuPjwvYT48L3RkPlxcblwiICtcclxuICAgIFwiICAgICAgPHRkIG5nLXNob3c9XFxcInNob3dTZWNvbmRzXFxcIj4mbmJzcDs8L3RkPlxcblwiICtcclxuICAgIFwiICAgICAgPHRkIG5nLXNob3c9XFxcInNob3dTZWNvbmRzXFxcIiBjbGFzcz1cXFwidWliLWRlY3JlbWVudCBzZWNvbmRzXFxcIj48YSBuZy1jbGljaz1cXFwiZGVjcmVtZW50U2Vjb25kcygpXFxcIiBuZy1jbGFzcz1cXFwie2Rpc2FibGVkOiBub0RlY3JlbWVudFNlY29uZHMoKX1cXFwiIGNsYXNzPVxcXCJidG4gYnRuLWxpbmtcXFwiIG5nLWRpc2FibGVkPVxcXCJub0RlY3JlbWVudFNlY29uZHMoKVxcXCIgdGFiaW5kZXg9XFxcIi0xXFxcIj48c3BhbiBjbGFzcz1cXFwiZ2x5cGhpY29uIGdseXBoaWNvbi1jaGV2cm9uLWRvd25cXFwiPjwvc3Bhbj48L2E+PC90ZD5cXG5cIiArXHJcbiAgICBcIiAgICAgIDx0ZCBuZy1zaG93PVxcXCJzaG93TWVyaWRpYW5cXFwiPjwvdGQ+XFxuXCIgK1xyXG4gICAgXCIgICAgPC90cj5cXG5cIiArXHJcbiAgICBcIiAgPC90Ym9keT5cXG5cIiArXHJcbiAgICBcIjwvdGFibGU+XFxuXCIgK1xyXG4gICAgXCJcIik7XHJcbn1dKTtcclxuXHJcbmFuZ3VsYXIubW9kdWxlKFwidWliL3RlbXBsYXRlL3R5cGVhaGVhZC90eXBlYWhlYWQtbWF0Y2guaHRtbFwiLCBbXSkucnVuKFtcIiR0ZW1wbGF0ZUNhY2hlXCIsIGZ1bmN0aW9uKCR0ZW1wbGF0ZUNhY2hlKSB7XHJcbiAgJHRlbXBsYXRlQ2FjaGUucHV0KFwidWliL3RlbXBsYXRlL3R5cGVhaGVhZC90eXBlYWhlYWQtbWF0Y2guaHRtbFwiLFxyXG4gICAgXCI8YSBocmVmXFxuXCIgK1xyXG4gICAgXCIgICB0YWJpbmRleD1cXFwiLTFcXFwiXFxuXCIgK1xyXG4gICAgXCIgICBuZy1iaW5kLWh0bWw9XFxcIm1hdGNoLmxhYmVsIHwgdWliVHlwZWFoZWFkSGlnaGxpZ2h0OnF1ZXJ5XFxcIlxcblwiICtcclxuICAgIFwiICAgbmctYXR0ci10aXRsZT1cXFwie3ttYXRjaC5sYWJlbH19XFxcIj48L2E+XFxuXCIgK1xyXG4gICAgXCJcIik7XHJcbn1dKTtcclxuXHJcbmFuZ3VsYXIubW9kdWxlKFwidWliL3RlbXBsYXRlL3R5cGVhaGVhZC90eXBlYWhlYWQtcG9wdXAuaHRtbFwiLCBbXSkucnVuKFtcIiR0ZW1wbGF0ZUNhY2hlXCIsIGZ1bmN0aW9uKCR0ZW1wbGF0ZUNhY2hlKSB7XHJcbiAgJHRlbXBsYXRlQ2FjaGUucHV0KFwidWliL3RlbXBsYXRlL3R5cGVhaGVhZC90eXBlYWhlYWQtcG9wdXAuaHRtbFwiLFxyXG4gICAgXCI8dWwgY2xhc3M9XFxcImRyb3Bkb3duLW1lbnVcXFwiIG5nLXNob3c9XFxcImlzT3BlbigpICYmICFtb3ZlSW5Qcm9ncmVzc1xcXCIgbmctc3R5bGU9XFxcInt0b3A6IHBvc2l0aW9uKCkudG9wKydweCcsIGxlZnQ6IHBvc2l0aW9uKCkubGVmdCsncHgnfVxcXCIgcm9sZT1cXFwibGlzdGJveFxcXCIgYXJpYS1oaWRkZW49XFxcInt7IWlzT3BlbigpfX1cXFwiPlxcblwiICtcclxuICAgIFwiICAgIDxsaSBjbGFzcz1cXFwidWliLXR5cGVhaGVhZC1tYXRjaFxcXCIgbmctcmVwZWF0PVxcXCJtYXRjaCBpbiBtYXRjaGVzIHRyYWNrIGJ5ICRpbmRleFxcXCIgbmctY2xhc3M9XFxcInthY3RpdmU6IGlzQWN0aXZlKCRpbmRleCkgfVxcXCIgbmctbW91c2VlbnRlcj1cXFwic2VsZWN0QWN0aXZlKCRpbmRleClcXFwiIG5nLWNsaWNrPVxcXCJzZWxlY3RNYXRjaCgkaW5kZXgsICRldmVudClcXFwiIHJvbGU9XFxcIm9wdGlvblxcXCIgaWQ9XFxcInt7OjptYXRjaC5pZH19XFxcIj5cXG5cIiArXHJcbiAgICBcIiAgICAgICAgPGRpdiB1aWItdHlwZWFoZWFkLW1hdGNoIGluZGV4PVxcXCIkaW5kZXhcXFwiIG1hdGNoPVxcXCJtYXRjaFxcXCIgcXVlcnk9XFxcInF1ZXJ5XFxcIiB0ZW1wbGF0ZS11cmw9XFxcInRlbXBsYXRlVXJsXFxcIj48L2Rpdj5cXG5cIiArXHJcbiAgICBcIiAgICA8L2xpPlxcblwiICtcclxuICAgIFwiPC91bD5cXG5cIiArXHJcbiAgICBcIlwiKTtcclxufV0pO1xyXG5hbmd1bGFyLm1vZHVsZSgndWkuYm9vdHN0cmFwLmNhcm91c2VsJykucnVuKGZ1bmN0aW9uKCkgeyFhbmd1bGFyLiQkY3NwKCkubm9JbmxpbmVTdHlsZSAmJiAhYW5ndWxhci4kJHVpYkNhcm91c2VsQ3NzICYmIGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudCkuZmluZCgnaGVhZCcpLnByZXBlbmQoJzxzdHlsZSB0eXBlPVwidGV4dC9jc3NcIj4ubmctYW5pbWF0ZS5pdGVtOm5vdCgubGVmdCk6bm90KC5yaWdodCl7LXdlYmtpdC10cmFuc2l0aW9uOjBzIGVhc2UtaW4tb3V0IGxlZnQ7dHJhbnNpdGlvbjowcyBlYXNlLWluLW91dCBsZWZ0fTwvc3R5bGU+Jyk7IGFuZ3VsYXIuJCR1aWJDYXJvdXNlbENzcyA9IHRydWU7IH0pO1xyXG5hbmd1bGFyLm1vZHVsZSgndWkuYm9vdHN0cmFwLmRhdGVwaWNrZXInKS5ydW4oZnVuY3Rpb24oKSB7IWFuZ3VsYXIuJCRjc3AoKS5ub0lubGluZVN0eWxlICYmICFhbmd1bGFyLiQkdWliRGF0ZXBpY2tlckNzcyAmJiBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQpLmZpbmQoJ2hlYWQnKS5wcmVwZW5kKCc8c3R5bGUgdHlwZT1cInRleHQvY3NzXCI+LnVpYi1kYXRlcGlja2VyIC51aWItdGl0bGV7d2lkdGg6MTAwJTt9LnVpYi1kYXkgYnV0dG9uLC51aWItbW9udGggYnV0dG9uLC51aWIteWVhciBidXR0b257bWluLXdpZHRoOjEwMCU7fS51aWItbGVmdCwudWliLXJpZ2h0e3dpZHRoOjEwMCV9PC9zdHlsZT4nKTsgYW5ndWxhci4kJHVpYkRhdGVwaWNrZXJDc3MgPSB0cnVlOyB9KTtcclxuYW5ndWxhci5tb2R1bGUoJ3VpLmJvb3RzdHJhcC5wb3NpdGlvbicpLnJ1bihmdW5jdGlvbigpIHshYW5ndWxhci4kJGNzcCgpLm5vSW5saW5lU3R5bGUgJiYgIWFuZ3VsYXIuJCR1aWJQb3NpdGlvbkNzcyAmJiBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQpLmZpbmQoJ2hlYWQnKS5wcmVwZW5kKCc8c3R5bGUgdHlwZT1cInRleHQvY3NzXCI+LnVpYi1wb3NpdGlvbi1tZWFzdXJle2Rpc3BsYXk6YmxvY2sgIWltcG9ydGFudDt2aXNpYmlsaXR5OmhpZGRlbiAhaW1wb3J0YW50O3Bvc2l0aW9uOmFic29sdXRlICFpbXBvcnRhbnQ7dG9wOi05OTk5cHggIWltcG9ydGFudDtsZWZ0Oi05OTk5cHggIWltcG9ydGFudDt9LnVpYi1wb3NpdGlvbi1zY3JvbGxiYXItbWVhc3VyZXtwb3NpdGlvbjphYnNvbHV0ZSAhaW1wb3J0YW50O3RvcDotOTk5OXB4ICFpbXBvcnRhbnQ7d2lkdGg6NTBweCAhaW1wb3J0YW50O2hlaWdodDo1MHB4ICFpbXBvcnRhbnQ7b3ZlcmZsb3c6c2Nyb2xsICFpbXBvcnRhbnQ7fS51aWItcG9zaXRpb24tYm9keS1zY3JvbGxiYXItbWVhc3VyZXtvdmVyZmxvdzpzY3JvbGwgIWltcG9ydGFudDt9PC9zdHlsZT4nKTsgYW5ndWxhci4kJHVpYlBvc2l0aW9uQ3NzID0gdHJ1ZTsgfSk7XHJcbmFuZ3VsYXIubW9kdWxlKCd1aS5ib290c3RyYXAuZGF0ZXBpY2tlclBvcHVwJykucnVuKGZ1bmN0aW9uKCkgeyFhbmd1bGFyLiQkY3NwKCkubm9JbmxpbmVTdHlsZSAmJiAhYW5ndWxhci4kJHVpYkRhdGVwaWNrZXJwb3B1cENzcyAmJiBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQpLmZpbmQoJ2hlYWQnKS5wcmVwZW5kKCc8c3R5bGUgdHlwZT1cInRleHQvY3NzXCI+LnVpYi1kYXRlcGlja2VyLXBvcHVwLmRyb3Bkb3duLW1lbnV7ZGlzcGxheTpibG9jaztmbG9hdDpub25lO21hcmdpbjowO30udWliLWJ1dHRvbi1iYXJ7cGFkZGluZzoxMHB4IDlweCAycHg7fTwvc3R5bGU+Jyk7IGFuZ3VsYXIuJCR1aWJEYXRlcGlja2VycG9wdXBDc3MgPSB0cnVlOyB9KTtcclxuYW5ndWxhci5tb2R1bGUoJ3VpLmJvb3RzdHJhcC50b29sdGlwJykucnVuKGZ1bmN0aW9uKCkgeyFhbmd1bGFyLiQkY3NwKCkubm9JbmxpbmVTdHlsZSAmJiAhYW5ndWxhci4kJHVpYlRvb2x0aXBDc3MgJiYgYW5ndWxhci5lbGVtZW50KGRvY3VtZW50KS5maW5kKCdoZWFkJykucHJlcGVuZCgnPHN0eWxlIHR5cGU9XCJ0ZXh0L2Nzc1wiPlt1aWItdG9vbHRpcC1wb3B1cF0udG9vbHRpcC50b3AtbGVmdCA+IC50b29sdGlwLWFycm93LFt1aWItdG9vbHRpcC1wb3B1cF0udG9vbHRpcC50b3AtcmlnaHQgPiAudG9vbHRpcC1hcnJvdyxbdWliLXRvb2x0aXAtcG9wdXBdLnRvb2x0aXAuYm90dG9tLWxlZnQgPiAudG9vbHRpcC1hcnJvdyxbdWliLXRvb2x0aXAtcG9wdXBdLnRvb2x0aXAuYm90dG9tLXJpZ2h0ID4gLnRvb2x0aXAtYXJyb3csW3VpYi10b29sdGlwLXBvcHVwXS50b29sdGlwLmxlZnQtdG9wID4gLnRvb2x0aXAtYXJyb3csW3VpYi10b29sdGlwLXBvcHVwXS50b29sdGlwLmxlZnQtYm90dG9tID4gLnRvb2x0aXAtYXJyb3csW3VpYi10b29sdGlwLXBvcHVwXS50b29sdGlwLnJpZ2h0LXRvcCA+IC50b29sdGlwLWFycm93LFt1aWItdG9vbHRpcC1wb3B1cF0udG9vbHRpcC5yaWdodC1ib3R0b20gPiAudG9vbHRpcC1hcnJvdyxbdWliLXRvb2x0aXAtaHRtbC1wb3B1cF0udG9vbHRpcC50b3AtbGVmdCA+IC50b29sdGlwLWFycm93LFt1aWItdG9vbHRpcC1odG1sLXBvcHVwXS50b29sdGlwLnRvcC1yaWdodCA+IC50b29sdGlwLWFycm93LFt1aWItdG9vbHRpcC1odG1sLXBvcHVwXS50b29sdGlwLmJvdHRvbS1sZWZ0ID4gLnRvb2x0aXAtYXJyb3csW3VpYi10b29sdGlwLWh0bWwtcG9wdXBdLnRvb2x0aXAuYm90dG9tLXJpZ2h0ID4gLnRvb2x0aXAtYXJyb3csW3VpYi10b29sdGlwLWh0bWwtcG9wdXBdLnRvb2x0aXAubGVmdC10b3AgPiAudG9vbHRpcC1hcnJvdyxbdWliLXRvb2x0aXAtaHRtbC1wb3B1cF0udG9vbHRpcC5sZWZ0LWJvdHRvbSA+IC50b29sdGlwLWFycm93LFt1aWItdG9vbHRpcC1odG1sLXBvcHVwXS50b29sdGlwLnJpZ2h0LXRvcCA+IC50b29sdGlwLWFycm93LFt1aWItdG9vbHRpcC1odG1sLXBvcHVwXS50b29sdGlwLnJpZ2h0LWJvdHRvbSA+IC50b29sdGlwLWFycm93LFt1aWItdG9vbHRpcC10ZW1wbGF0ZS1wb3B1cF0udG9vbHRpcC50b3AtbGVmdCA+IC50b29sdGlwLWFycm93LFt1aWItdG9vbHRpcC10ZW1wbGF0ZS1wb3B1cF0udG9vbHRpcC50b3AtcmlnaHQgPiAudG9vbHRpcC1hcnJvdyxbdWliLXRvb2x0aXAtdGVtcGxhdGUtcG9wdXBdLnRvb2x0aXAuYm90dG9tLWxlZnQgPiAudG9vbHRpcC1hcnJvdyxbdWliLXRvb2x0aXAtdGVtcGxhdGUtcG9wdXBdLnRvb2x0aXAuYm90dG9tLXJpZ2h0ID4gLnRvb2x0aXAtYXJyb3csW3VpYi10b29sdGlwLXRlbXBsYXRlLXBvcHVwXS50b29sdGlwLmxlZnQtdG9wID4gLnRvb2x0aXAtYXJyb3csW3VpYi10b29sdGlwLXRlbXBsYXRlLXBvcHVwXS50b29sdGlwLmxlZnQtYm90dG9tID4gLnRvb2x0aXAtYXJyb3csW3VpYi10b29sdGlwLXRlbXBsYXRlLXBvcHVwXS50b29sdGlwLnJpZ2h0LXRvcCA+IC50b29sdGlwLWFycm93LFt1aWItdG9vbHRpcC10ZW1wbGF0ZS1wb3B1cF0udG9vbHRpcC5yaWdodC1ib3R0b20gPiAudG9vbHRpcC1hcnJvdyxbdWliLXBvcG92ZXItcG9wdXBdLnBvcG92ZXIudG9wLWxlZnQgPiAuYXJyb3csW3VpYi1wb3BvdmVyLXBvcHVwXS5wb3BvdmVyLnRvcC1yaWdodCA+IC5hcnJvdyxbdWliLXBvcG92ZXItcG9wdXBdLnBvcG92ZXIuYm90dG9tLWxlZnQgPiAuYXJyb3csW3VpYi1wb3BvdmVyLXBvcHVwXS5wb3BvdmVyLmJvdHRvbS1yaWdodCA+IC5hcnJvdyxbdWliLXBvcG92ZXItcG9wdXBdLnBvcG92ZXIubGVmdC10b3AgPiAuYXJyb3csW3VpYi1wb3BvdmVyLXBvcHVwXS5wb3BvdmVyLmxlZnQtYm90dG9tID4gLmFycm93LFt1aWItcG9wb3Zlci1wb3B1cF0ucG9wb3Zlci5yaWdodC10b3AgPiAuYXJyb3csW3VpYi1wb3BvdmVyLXBvcHVwXS5wb3BvdmVyLnJpZ2h0LWJvdHRvbSA+IC5hcnJvdyxbdWliLXBvcG92ZXItaHRtbC1wb3B1cF0ucG9wb3Zlci50b3AtbGVmdCA+IC5hcnJvdyxbdWliLXBvcG92ZXItaHRtbC1wb3B1cF0ucG9wb3Zlci50b3AtcmlnaHQgPiAuYXJyb3csW3VpYi1wb3BvdmVyLWh0bWwtcG9wdXBdLnBvcG92ZXIuYm90dG9tLWxlZnQgPiAuYXJyb3csW3VpYi1wb3BvdmVyLWh0bWwtcG9wdXBdLnBvcG92ZXIuYm90dG9tLXJpZ2h0ID4gLmFycm93LFt1aWItcG9wb3Zlci1odG1sLXBvcHVwXS5wb3BvdmVyLmxlZnQtdG9wID4gLmFycm93LFt1aWItcG9wb3Zlci1odG1sLXBvcHVwXS5wb3BvdmVyLmxlZnQtYm90dG9tID4gLmFycm93LFt1aWItcG9wb3Zlci1odG1sLXBvcHVwXS5wb3BvdmVyLnJpZ2h0LXRvcCA+IC5hcnJvdyxbdWliLXBvcG92ZXItaHRtbC1wb3B1cF0ucG9wb3Zlci5yaWdodC1ib3R0b20gPiAuYXJyb3csW3VpYi1wb3BvdmVyLXRlbXBsYXRlLXBvcHVwXS5wb3BvdmVyLnRvcC1sZWZ0ID4gLmFycm93LFt1aWItcG9wb3Zlci10ZW1wbGF0ZS1wb3B1cF0ucG9wb3Zlci50b3AtcmlnaHQgPiAuYXJyb3csW3VpYi1wb3BvdmVyLXRlbXBsYXRlLXBvcHVwXS5wb3BvdmVyLmJvdHRvbS1sZWZ0ID4gLmFycm93LFt1aWItcG9wb3Zlci10ZW1wbGF0ZS1wb3B1cF0ucG9wb3Zlci5ib3R0b20tcmlnaHQgPiAuYXJyb3csW3VpYi1wb3BvdmVyLXRlbXBsYXRlLXBvcHVwXS5wb3BvdmVyLmxlZnQtdG9wID4gLmFycm93LFt1aWItcG9wb3Zlci10ZW1wbGF0ZS1wb3B1cF0ucG9wb3Zlci5sZWZ0LWJvdHRvbSA+IC5hcnJvdyxbdWliLXBvcG92ZXItdGVtcGxhdGUtcG9wdXBdLnBvcG92ZXIucmlnaHQtdG9wID4gLmFycm93LFt1aWItcG9wb3Zlci10ZW1wbGF0ZS1wb3B1cF0ucG9wb3Zlci5yaWdodC1ib3R0b20gPiAuYXJyb3d7dG9wOmF1dG87Ym90dG9tOmF1dG87bGVmdDphdXRvO3JpZ2h0OmF1dG87bWFyZ2luOjA7fVt1aWItcG9wb3Zlci1wb3B1cF0ucG9wb3ZlcixbdWliLXBvcG92ZXItaHRtbC1wb3B1cF0ucG9wb3ZlcixbdWliLXBvcG92ZXItdGVtcGxhdGUtcG9wdXBdLnBvcG92ZXJ7ZGlzcGxheTpibG9jayAhaW1wb3J0YW50O308L3N0eWxlPicpOyBhbmd1bGFyLiQkdWliVG9vbHRpcENzcyA9IHRydWU7IH0pO1xyXG5hbmd1bGFyLm1vZHVsZSgndWkuYm9vdHN0cmFwLnRpbWVwaWNrZXInKS5ydW4oZnVuY3Rpb24oKSB7IWFuZ3VsYXIuJCRjc3AoKS5ub0lubGluZVN0eWxlICYmICFhbmd1bGFyLiQkdWliVGltZXBpY2tlckNzcyAmJiBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQpLmZpbmQoJ2hlYWQnKS5wcmVwZW5kKCc8c3R5bGUgdHlwZT1cInRleHQvY3NzXCI+LnVpYi10aW1lIGlucHV0e3dpZHRoOjUwcHg7fTwvc3R5bGU+Jyk7IGFuZ3VsYXIuJCR1aWJUaW1lcGlja2VyQ3NzID0gdHJ1ZTsgfSk7XHJcbmFuZ3VsYXIubW9kdWxlKCd1aS5ib290c3RyYXAudHlwZWFoZWFkJykucnVuKGZ1bmN0aW9uKCkgeyFhbmd1bGFyLiQkY3NwKCkubm9JbmxpbmVTdHlsZSAmJiAhYW5ndWxhci4kJHVpYlR5cGVhaGVhZENzcyAmJiBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQpLmZpbmQoJ2hlYWQnKS5wcmVwZW5kKCc8c3R5bGUgdHlwZT1cInRleHQvY3NzXCI+W3VpYi10eXBlYWhlYWQtcG9wdXBdLmRyb3Bkb3duLW1lbnV7ZGlzcGxheTpibG9jazt9PC9zdHlsZT4nKTsgYW5ndWxhci4kJHVpYlR5cGVhaGVhZENzcyA9IHRydWU7IH0pOyJdLCJmaWxlIjoidWktYm9vdHN0cmFwLXRwbHMuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
