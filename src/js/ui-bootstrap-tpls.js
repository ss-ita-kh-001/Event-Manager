/*
 * angular-ui-bootstrap
 * http://angular-ui.github.io/bootstrap/

 * Version: 2.2.0 - 2016-10-10
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
    "      <th><button type=\"button\" class=\"btn btn-default btn-sm pull-left uib-left\" ng-click=\"move(-1)\" tabindex=\"-1\"><i aria-hidden=\"true\" class=\"glyphicon glyphicon-chevron-left\"></i><span class=\"sr-only\">previous</span></button></th>\n" +
    "      <th colspan=\"{{::5 + showWeeks}}\"><button id=\"{{::uniqueId}}-title\" role=\"heading\" aria-live=\"assertive\" aria-atomic=\"true\" type=\"button\" class=\"btn btn-default btn-sm uib-title\" ng-click=\"toggleMode()\" ng-disabled=\"datepickerMode === maxMode\" tabindex=\"-1\"><strong>{{title}}</strong></button></th>\n" +
    "      <th><button type=\"button\" class=\"btn btn-default btn-sm pull-right uib-right\" ng-click=\"move(1)\" tabindex=\"-1\"><i aria-hidden=\"true\" class=\"glyphicon glyphicon-chevron-right\"></i><span class=\"sr-only\">next</span></button></th>\n" +
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
    "      <th><button type=\"button\" class=\"btn btn-default btn-sm pull-left uib-left\" ng-click=\"move(-1)\" tabindex=\"-1\"><i aria-hidden=\"true\" class=\"glyphicon glyphicon-chevron-left\"></i><span class=\"sr-only\">previous</span></button></th>\n" +
    "      <th colspan=\"{{::yearHeaderColspan}}\"><button id=\"{{::uniqueId}}-title\" role=\"heading\" aria-live=\"assertive\" aria-atomic=\"true\" type=\"button\" class=\"btn btn-default btn-sm uib-title\" ng-click=\"toggleMode()\" ng-disabled=\"datepickerMode === maxMode\" tabindex=\"-1\"><strong>{{title}}</strong></button></th>\n" +
    "      <th><button type=\"button\" class=\"btn btn-default btn-sm pull-right uib-right\" ng-click=\"move(1)\" tabindex=\"-1\"><i aria-hidden=\"true\" class=\"glyphicon glyphicon-chevron-right\"></i><span class=\"sr-only\">next</span></i></button></th>\n" +
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
    "      <th><button type=\"button\" class=\"btn btn-default btn-sm pull-left uib-left\" ng-click=\"move(-1)\" tabindex=\"-1\"><i aria-hidden=\"true\" class=\"glyphicon glyphicon-chevron-left\"></i><span class=\"sr-only\">previous</span></button></th>\n" +
    "      <th colspan=\"{{::columns - 2}}\"><button id=\"{{::uniqueId}}-title\" role=\"heading\" aria-live=\"assertive\" aria-atomic=\"true\" type=\"button\" class=\"btn btn-default btn-sm uib-title\" ng-click=\"toggleMode()\" ng-disabled=\"datepickerMode === maxMode\" tabindex=\"-1\"><strong>{{title}}</strong></button></th>\n" +
    "      <th><button type=\"button\" class=\"btn btn-default btn-sm pull-right uib-right\" ng-click=\"move(1)\" tabindex=\"-1\"><i aria-hidden=\"true\" class=\"glyphicon glyphicon-chevron-right\"></i><span class=\"sr-only\">next</span></button></th>\n" +
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
    "<ul role=\"presentation\" class=\"uib-datepicker-popup dropdown-menu uib-position-measure\" dropdown-nested ng-if=\"isOpen\" ng-keydown=\"keydown($event)\" ng-click=\"$event.stopPropagation()\">\n" +
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJ1aS1ib290c3RyYXAtdHBscy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxyXG4gKiBhbmd1bGFyLXVpLWJvb3RzdHJhcFxyXG4gKiBodHRwOi8vYW5ndWxhci11aS5naXRodWIuaW8vYm9vdHN0cmFwL1xyXG5cclxuICogVmVyc2lvbjogMi4yLjAgLSAyMDE2LTEwLTEwXHJcbiAqIExpY2Vuc2U6IE1JVFxyXG4gKi9hbmd1bGFyLm1vZHVsZShcInVpLmJvb3RzdHJhcFwiLCBbXCJ1aS5ib290c3RyYXAudHBsc1wiLCBcInVpLmJvb3RzdHJhcC5jb2xsYXBzZVwiLFwidWkuYm9vdHN0cmFwLnRhYmluZGV4XCIsXCJ1aS5ib290c3RyYXAuYWNjb3JkaW9uXCIsXCJ1aS5ib290c3RyYXAuYWxlcnRcIixcInVpLmJvb3RzdHJhcC5idXR0b25zXCIsXCJ1aS5ib290c3RyYXAuY2Fyb3VzZWxcIixcInVpLmJvb3RzdHJhcC5kYXRlcGFyc2VyXCIsXCJ1aS5ib290c3RyYXAuaXNDbGFzc1wiLFwidWkuYm9vdHN0cmFwLmRhdGVwaWNrZXJcIixcInVpLmJvb3RzdHJhcC5wb3NpdGlvblwiLFwidWkuYm9vdHN0cmFwLmRhdGVwaWNrZXJQb3B1cFwiLFwidWkuYm9vdHN0cmFwLmRlYm91bmNlXCIsXCJ1aS5ib290c3RyYXAuZHJvcGRvd25cIixcInVpLmJvb3RzdHJhcC5zdGFja2VkTWFwXCIsXCJ1aS5ib290c3RyYXAubW9kYWxcIixcInVpLmJvb3RzdHJhcC5wYWdpbmdcIixcInVpLmJvb3RzdHJhcC5wYWdlclwiLFwidWkuYm9vdHN0cmFwLnBhZ2luYXRpb25cIixcInVpLmJvb3RzdHJhcC50b29sdGlwXCIsXCJ1aS5ib290c3RyYXAucG9wb3ZlclwiLFwidWkuYm9vdHN0cmFwLnByb2dyZXNzYmFyXCIsXCJ1aS5ib290c3RyYXAucmF0aW5nXCIsXCJ1aS5ib290c3RyYXAudGFic1wiLFwidWkuYm9vdHN0cmFwLnRpbWVwaWNrZXJcIixcInVpLmJvb3RzdHJhcC50eXBlYWhlYWRcIl0pO1xyXG5hbmd1bGFyLm1vZHVsZShcInVpLmJvb3RzdHJhcC50cGxzXCIsIFtcInVpYi90ZW1wbGF0ZS9hY2NvcmRpb24vYWNjb3JkaW9uLWdyb3VwLmh0bWxcIixcInVpYi90ZW1wbGF0ZS9hY2NvcmRpb24vYWNjb3JkaW9uLmh0bWxcIixcInVpYi90ZW1wbGF0ZS9hbGVydC9hbGVydC5odG1sXCIsXCJ1aWIvdGVtcGxhdGUvY2Fyb3VzZWwvY2Fyb3VzZWwuaHRtbFwiLFwidWliL3RlbXBsYXRlL2Nhcm91c2VsL3NsaWRlLmh0bWxcIixcInVpYi90ZW1wbGF0ZS9kYXRlcGlja2VyL2RhdGVwaWNrZXIuaHRtbFwiLFwidWliL3RlbXBsYXRlL2RhdGVwaWNrZXIvZGF5Lmh0bWxcIixcInVpYi90ZW1wbGF0ZS9kYXRlcGlja2VyL21vbnRoLmh0bWxcIixcInVpYi90ZW1wbGF0ZS9kYXRlcGlja2VyL3llYXIuaHRtbFwiLFwidWliL3RlbXBsYXRlL2RhdGVwaWNrZXJQb3B1cC9wb3B1cC5odG1sXCIsXCJ1aWIvdGVtcGxhdGUvbW9kYWwvd2luZG93Lmh0bWxcIixcInVpYi90ZW1wbGF0ZS9wYWdlci9wYWdlci5odG1sXCIsXCJ1aWIvdGVtcGxhdGUvcGFnaW5hdGlvbi9wYWdpbmF0aW9uLmh0bWxcIixcInVpYi90ZW1wbGF0ZS90b29sdGlwL3Rvb2x0aXAtaHRtbC1wb3B1cC5odG1sXCIsXCJ1aWIvdGVtcGxhdGUvdG9vbHRpcC90b29sdGlwLXBvcHVwLmh0bWxcIixcInVpYi90ZW1wbGF0ZS90b29sdGlwL3Rvb2x0aXAtdGVtcGxhdGUtcG9wdXAuaHRtbFwiLFwidWliL3RlbXBsYXRlL3BvcG92ZXIvcG9wb3Zlci1odG1sLmh0bWxcIixcInVpYi90ZW1wbGF0ZS9wb3BvdmVyL3BvcG92ZXItdGVtcGxhdGUuaHRtbFwiLFwidWliL3RlbXBsYXRlL3BvcG92ZXIvcG9wb3Zlci5odG1sXCIsXCJ1aWIvdGVtcGxhdGUvcHJvZ3Jlc3NiYXIvYmFyLmh0bWxcIixcInVpYi90ZW1wbGF0ZS9wcm9ncmVzc2Jhci9wcm9ncmVzcy5odG1sXCIsXCJ1aWIvdGVtcGxhdGUvcHJvZ3Jlc3NiYXIvcHJvZ3Jlc3NiYXIuaHRtbFwiLFwidWliL3RlbXBsYXRlL3JhdGluZy9yYXRpbmcuaHRtbFwiLFwidWliL3RlbXBsYXRlL3RhYnMvdGFiLmh0bWxcIixcInVpYi90ZW1wbGF0ZS90YWJzL3RhYnNldC5odG1sXCIsXCJ1aWIvdGVtcGxhdGUvdGltZXBpY2tlci90aW1lcGlja2VyLmh0bWxcIixcInVpYi90ZW1wbGF0ZS90eXBlYWhlYWQvdHlwZWFoZWFkLW1hdGNoLmh0bWxcIixcInVpYi90ZW1wbGF0ZS90eXBlYWhlYWQvdHlwZWFoZWFkLXBvcHVwLmh0bWxcIl0pO1xyXG5hbmd1bGFyLm1vZHVsZSgndWkuYm9vdHN0cmFwLmNvbGxhcHNlJywgW10pXHJcblxyXG4gIC5kaXJlY3RpdmUoJ3VpYkNvbGxhcHNlJywgWyckYW5pbWF0ZScsICckcScsICckcGFyc2UnLCAnJGluamVjdG9yJywgZnVuY3Rpb24oJGFuaW1hdGUsICRxLCAkcGFyc2UsICRpbmplY3Rvcikge1xyXG4gICAgdmFyICRhbmltYXRlQ3NzID0gJGluamVjdG9yLmhhcygnJGFuaW1hdGVDc3MnKSA/ICRpbmplY3Rvci5nZXQoJyRhbmltYXRlQ3NzJykgOiBudWxsO1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsZW1lbnQsIGF0dHJzKSB7XHJcbiAgICAgICAgdmFyIGV4cGFuZGluZ0V4cHIgPSAkcGFyc2UoYXR0cnMuZXhwYW5kaW5nKSxcclxuICAgICAgICAgIGV4cGFuZGVkRXhwciA9ICRwYXJzZShhdHRycy5leHBhbmRlZCksXHJcbiAgICAgICAgICBjb2xsYXBzaW5nRXhwciA9ICRwYXJzZShhdHRycy5jb2xsYXBzaW5nKSxcclxuICAgICAgICAgIGNvbGxhcHNlZEV4cHIgPSAkcGFyc2UoYXR0cnMuY29sbGFwc2VkKSxcclxuICAgICAgICAgIGhvcml6b250YWwgPSBmYWxzZSxcclxuICAgICAgICAgIGNzcyA9IHt9LFxyXG4gICAgICAgICAgY3NzVG8gPSB7fTtcclxuXHJcbiAgICAgICAgaW5pdCgpO1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBpbml0KCkge1xyXG4gICAgICAgICAgaG9yaXpvbnRhbCA9ICEhKCdob3Jpem9udGFsJyBpbiBhdHRycyk7XHJcbiAgICAgICAgICBpZiAoaG9yaXpvbnRhbCkge1xyXG4gICAgICAgICAgICBjc3MgPSB7XHJcbiAgICAgICAgICAgICAgd2lkdGg6ICcnXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIGNzc1RvID0ge3dpZHRoOiAnMCd9O1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY3NzID0ge1xyXG4gICAgICAgICAgICAgIGhlaWdodDogJydcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgY3NzVG8gPSB7aGVpZ2h0OiAnMCd9O1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgaWYgKCFzY29wZS4kZXZhbChhdHRycy51aWJDb2xsYXBzZSkpIHtcclxuICAgICAgICAgICAgZWxlbWVudC5hZGRDbGFzcygnaW4nKVxyXG4gICAgICAgICAgICAgIC5hZGRDbGFzcygnY29sbGFwc2UnKVxyXG4gICAgICAgICAgICAgIC5hdHRyKCdhcmlhLWV4cGFuZGVkJywgdHJ1ZSlcclxuICAgICAgICAgICAgICAuYXR0cignYXJpYS1oaWRkZW4nLCBmYWxzZSlcclxuICAgICAgICAgICAgICAuY3NzKGNzcyk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBnZXRTY3JvbGxGcm9tRWxlbWVudChlbGVtZW50KSB7XHJcbiAgICAgICAgICBpZiAoaG9yaXpvbnRhbCkge1xyXG4gICAgICAgICAgICByZXR1cm4ge3dpZHRoOiBlbGVtZW50LnNjcm9sbFdpZHRoICsgJ3B4J307XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICByZXR1cm4ge2hlaWdodDogZWxlbWVudC5zY3JvbGxIZWlnaHQgKyAncHgnfTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGV4cGFuZCgpIHtcclxuICAgICAgICAgIGlmIChlbGVtZW50Lmhhc0NsYXNzKCdjb2xsYXBzZScpICYmIGVsZW1lbnQuaGFzQ2xhc3MoJ2luJykpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICRxLnJlc29sdmUoZXhwYW5kaW5nRXhwcihzY29wZSkpXHJcbiAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgIGVsZW1lbnQucmVtb3ZlQ2xhc3MoJ2NvbGxhcHNlJylcclxuICAgICAgICAgICAgICAgIC5hZGRDbGFzcygnY29sbGFwc2luZycpXHJcbiAgICAgICAgICAgICAgICAuYXR0cignYXJpYS1leHBhbmRlZCcsIHRydWUpXHJcbiAgICAgICAgICAgICAgICAuYXR0cignYXJpYS1oaWRkZW4nLCBmYWxzZSk7XHJcblxyXG4gICAgICAgICAgICAgIGlmICgkYW5pbWF0ZUNzcykge1xyXG4gICAgICAgICAgICAgICAgJGFuaW1hdGVDc3MoZWxlbWVudCwge1xyXG4gICAgICAgICAgICAgICAgICBhZGRDbGFzczogJ2luJyxcclxuICAgICAgICAgICAgICAgICAgZWFzaW5nOiAnZWFzZScsXHJcbiAgICAgICAgICAgICAgICAgIGNzczoge1xyXG4gICAgICAgICAgICAgICAgICAgIG92ZXJmbG93OiAnaGlkZGVuJ1xyXG4gICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICB0bzogZ2V0U2Nyb2xsRnJvbUVsZW1lbnQoZWxlbWVudFswXSlcclxuICAgICAgICAgICAgICAgIH0pLnN0YXJ0KClbJ2ZpbmFsbHknXShleHBhbmREb25lKTtcclxuICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgJGFuaW1hdGUuYWRkQ2xhc3MoZWxlbWVudCwgJ2luJywge1xyXG4gICAgICAgICAgICAgICAgICBjc3M6IHtcclxuICAgICAgICAgICAgICAgICAgICBvdmVyZmxvdzogJ2hpZGRlbidcclxuICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgdG86IGdldFNjcm9sbEZyb21FbGVtZW50KGVsZW1lbnRbMF0pXHJcbiAgICAgICAgICAgICAgICB9KS50aGVuKGV4cGFuZERvbmUpO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBleHBhbmREb25lKCkge1xyXG4gICAgICAgICAgZWxlbWVudC5yZW1vdmVDbGFzcygnY29sbGFwc2luZycpXHJcbiAgICAgICAgICAgIC5hZGRDbGFzcygnY29sbGFwc2UnKVxyXG4gICAgICAgICAgICAuY3NzKGNzcyk7XHJcbiAgICAgICAgICBleHBhbmRlZEV4cHIoc2NvcGUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gY29sbGFwc2UoKSB7XHJcbiAgICAgICAgICBpZiAoIWVsZW1lbnQuaGFzQ2xhc3MoJ2NvbGxhcHNlJykgJiYgIWVsZW1lbnQuaGFzQ2xhc3MoJ2luJykpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGNvbGxhcHNlRG9uZSgpO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICRxLnJlc29sdmUoY29sbGFwc2luZ0V4cHIoc2NvcGUpKVxyXG4gICAgICAgICAgICAudGhlbihmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICBlbGVtZW50XHJcbiAgICAgICAgICAgICAgLy8gSU1QT1JUQU5UOiBUaGUgd2lkdGggbXVzdCBiZSBzZXQgYmVmb3JlIGFkZGluZyBcImNvbGxhcHNpbmdcIiBjbGFzcy5cclxuICAgICAgICAgICAgICAvLyBPdGhlcndpc2UsIHRoZSBicm93c2VyIGF0dGVtcHRzIHRvIGFuaW1hdGUgZnJvbSB3aWR0aCAwIChpblxyXG4gICAgICAgICAgICAgIC8vIGNvbGxhcHNpbmcgY2xhc3MpIHRvIHRoZSBnaXZlbiB3aWR0aCBoZXJlLlxyXG4gICAgICAgICAgICAgICAgLmNzcyhnZXRTY3JvbGxGcm9tRWxlbWVudChlbGVtZW50WzBdKSlcclxuICAgICAgICAgICAgICAgIC8vIGluaXRpYWxseSBhbGwgcGFuZWwgY29sbGFwc2UgaGF2ZSB0aGUgY29sbGFwc2UgY2xhc3MsIHRoaXMgcmVtb3ZhbFxyXG4gICAgICAgICAgICAgICAgLy8gcHJldmVudHMgdGhlIGFuaW1hdGlvbiBmcm9tIGp1bXBpbmcgdG8gY29sbGFwc2VkIHN0YXRlXHJcbiAgICAgICAgICAgICAgICAucmVtb3ZlQ2xhc3MoJ2NvbGxhcHNlJylcclxuICAgICAgICAgICAgICAgIC5hZGRDbGFzcygnY29sbGFwc2luZycpXHJcbiAgICAgICAgICAgICAgICAuYXR0cignYXJpYS1leHBhbmRlZCcsIGZhbHNlKVxyXG4gICAgICAgICAgICAgICAgLmF0dHIoJ2FyaWEtaGlkZGVuJywgdHJ1ZSk7XHJcblxyXG4gICAgICAgICAgICAgIGlmICgkYW5pbWF0ZUNzcykge1xyXG4gICAgICAgICAgICAgICAgJGFuaW1hdGVDc3MoZWxlbWVudCwge1xyXG4gICAgICAgICAgICAgICAgICByZW1vdmVDbGFzczogJ2luJyxcclxuICAgICAgICAgICAgICAgICAgdG86IGNzc1RvXHJcbiAgICAgICAgICAgICAgICB9KS5zdGFydCgpWydmaW5hbGx5J10oY29sbGFwc2VEb25lKTtcclxuICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgJGFuaW1hdGUucmVtb3ZlQ2xhc3MoZWxlbWVudCwgJ2luJywge1xyXG4gICAgICAgICAgICAgICAgICB0bzogY3NzVG9cclxuICAgICAgICAgICAgICAgIH0pLnRoZW4oY29sbGFwc2VEb25lKTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gY29sbGFwc2VEb25lKCkge1xyXG4gICAgICAgICAgZWxlbWVudC5jc3MoY3NzVG8pOyAvLyBSZXF1aXJlZCBzbyB0aGF0IGNvbGxhcHNlIHdvcmtzIHdoZW4gYW5pbWF0aW9uIGlzIGRpc2FibGVkXHJcbiAgICAgICAgICBlbGVtZW50LnJlbW92ZUNsYXNzKCdjb2xsYXBzaW5nJylcclxuICAgICAgICAgICAgLmFkZENsYXNzKCdjb2xsYXBzZScpO1xyXG4gICAgICAgICAgY29sbGFwc2VkRXhwcihzY29wZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBzY29wZS4kd2F0Y2goYXR0cnMudWliQ29sbGFwc2UsIGZ1bmN0aW9uKHNob3VsZENvbGxhcHNlKSB7XHJcbiAgICAgICAgICBpZiAoc2hvdWxkQ29sbGFwc2UpIHtcclxuICAgICAgICAgICAgY29sbGFwc2UoKTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGV4cGFuZCgpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG4gIH1dKTtcclxuXHJcbmFuZ3VsYXIubW9kdWxlKCd1aS5ib290c3RyYXAudGFiaW5kZXgnLCBbXSlcclxuXHJcbi5kaXJlY3RpdmUoJ3VpYlRhYmluZGV4VG9nZ2xlJywgZnVuY3Rpb24oKSB7XHJcbiAgcmV0dXJuIHtcclxuICAgIHJlc3RyaWN0OiAnQScsXHJcbiAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxlbSwgYXR0cnMpIHtcclxuICAgICAgYXR0cnMuJG9ic2VydmUoJ2Rpc2FibGVkJywgZnVuY3Rpb24oZGlzYWJsZWQpIHtcclxuICAgICAgICBhdHRycy4kc2V0KCd0YWJpbmRleCcsIGRpc2FibGVkID8gLTEgOiBudWxsKTtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfTtcclxufSk7XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgndWkuYm9vdHN0cmFwLmFjY29yZGlvbicsIFsndWkuYm9vdHN0cmFwLmNvbGxhcHNlJywgJ3VpLmJvb3RzdHJhcC50YWJpbmRleCddKVxyXG5cclxuLmNvbnN0YW50KCd1aWJBY2NvcmRpb25Db25maWcnLCB7XHJcbiAgY2xvc2VPdGhlcnM6IHRydWVcclxufSlcclxuXHJcbi5jb250cm9sbGVyKCdVaWJBY2NvcmRpb25Db250cm9sbGVyJywgWyckc2NvcGUnLCAnJGF0dHJzJywgJ3VpYkFjY29yZGlvbkNvbmZpZycsIGZ1bmN0aW9uKCRzY29wZSwgJGF0dHJzLCBhY2NvcmRpb25Db25maWcpIHtcclxuICAvLyBUaGlzIGFycmF5IGtlZXBzIHRyYWNrIG9mIHRoZSBhY2NvcmRpb24gZ3JvdXBzXHJcbiAgdGhpcy5ncm91cHMgPSBbXTtcclxuXHJcbiAgLy8gRW5zdXJlIHRoYXQgYWxsIHRoZSBncm91cHMgaW4gdGhpcyBhY2NvcmRpb24gYXJlIGNsb3NlZCwgdW5sZXNzIGNsb3NlLW90aGVycyBleHBsaWNpdGx5IHNheXMgbm90IHRvXHJcbiAgdGhpcy5jbG9zZU90aGVycyA9IGZ1bmN0aW9uKG9wZW5Hcm91cCkge1xyXG4gICAgdmFyIGNsb3NlT3RoZXJzID0gYW5ndWxhci5pc0RlZmluZWQoJGF0dHJzLmNsb3NlT3RoZXJzKSA/XHJcbiAgICAgICRzY29wZS4kZXZhbCgkYXR0cnMuY2xvc2VPdGhlcnMpIDogYWNjb3JkaW9uQ29uZmlnLmNsb3NlT3RoZXJzO1xyXG4gICAgaWYgKGNsb3NlT3RoZXJzKSB7XHJcbiAgICAgIGFuZ3VsYXIuZm9yRWFjaCh0aGlzLmdyb3VwcywgZnVuY3Rpb24oZ3JvdXApIHtcclxuICAgICAgICBpZiAoZ3JvdXAgIT09IG9wZW5Hcm91cCkge1xyXG4gICAgICAgICAgZ3JvdXAuaXNPcGVuID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICAvLyBUaGlzIGlzIGNhbGxlZCBmcm9tIHRoZSBhY2NvcmRpb24tZ3JvdXAgZGlyZWN0aXZlIHRvIGFkZCBpdHNlbGYgdG8gdGhlIGFjY29yZGlvblxyXG4gIHRoaXMuYWRkR3JvdXAgPSBmdW5jdGlvbihncm91cFNjb3BlKSB7XHJcbiAgICB2YXIgdGhhdCA9IHRoaXM7XHJcbiAgICB0aGlzLmdyb3Vwcy5wdXNoKGdyb3VwU2NvcGUpO1xyXG5cclxuICAgIGdyb3VwU2NvcGUuJG9uKCckZGVzdHJveScsIGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICAgIHRoYXQucmVtb3ZlR3JvdXAoZ3JvdXBTY29wZSk7XHJcbiAgICB9KTtcclxuICB9O1xyXG5cclxuICAvLyBUaGlzIGlzIGNhbGxlZCBmcm9tIHRoZSBhY2NvcmRpb24tZ3JvdXAgZGlyZWN0aXZlIHdoZW4gdG8gcmVtb3ZlIGl0c2VsZlxyXG4gIHRoaXMucmVtb3ZlR3JvdXAgPSBmdW5jdGlvbihncm91cCkge1xyXG4gICAgdmFyIGluZGV4ID0gdGhpcy5ncm91cHMuaW5kZXhPZihncm91cCk7XHJcbiAgICBpZiAoaW5kZXggIT09IC0xKSB7XHJcbiAgICAgIHRoaXMuZ3JvdXBzLnNwbGljZShpbmRleCwgMSk7XHJcbiAgICB9XHJcbiAgfTtcclxufV0pXHJcblxyXG4vLyBUaGUgYWNjb3JkaW9uIGRpcmVjdGl2ZSBzaW1wbHkgc2V0cyB1cCB0aGUgZGlyZWN0aXZlIGNvbnRyb2xsZXJcclxuLy8gYW5kIGFkZHMgYW4gYWNjb3JkaW9uIENTUyBjbGFzcyB0byBpdHNlbGYgZWxlbWVudC5cclxuLmRpcmVjdGl2ZSgndWliQWNjb3JkaW9uJywgZnVuY3Rpb24oKSB7XHJcbiAgcmV0dXJuIHtcclxuICAgIGNvbnRyb2xsZXI6ICdVaWJBY2NvcmRpb25Db250cm9sbGVyJyxcclxuICAgIGNvbnRyb2xsZXJBczogJ2FjY29yZGlvbicsXHJcbiAgICB0cmFuc2NsdWRlOiB0cnVlLFxyXG4gICAgdGVtcGxhdGVVcmw6IGZ1bmN0aW9uKGVsZW1lbnQsIGF0dHJzKSB7XHJcbiAgICAgIHJldHVybiBhdHRycy50ZW1wbGF0ZVVybCB8fCAndWliL3RlbXBsYXRlL2FjY29yZGlvbi9hY2NvcmRpb24uaHRtbCc7XHJcbiAgICB9XHJcbiAgfTtcclxufSlcclxuXHJcbi8vIFRoZSBhY2NvcmRpb24tZ3JvdXAgZGlyZWN0aXZlIGluZGljYXRlcyBhIGJsb2NrIG9mIGh0bWwgdGhhdCB3aWxsIGV4cGFuZCBhbmQgY29sbGFwc2UgaW4gYW4gYWNjb3JkaW9uXHJcbi5kaXJlY3RpdmUoJ3VpYkFjY29yZGlvbkdyb3VwJywgZnVuY3Rpb24oKSB7XHJcbiAgcmV0dXJuIHtcclxuICAgIHJlcXVpcmU6ICdedWliQWNjb3JkaW9uJywgICAgICAgICAvLyBXZSBuZWVkIHRoaXMgZGlyZWN0aXZlIHRvIGJlIGluc2lkZSBhbiBhY2NvcmRpb25cclxuICAgIHRyYW5zY2x1ZGU6IHRydWUsICAgICAgICAgICAgICAvLyBJdCB0cmFuc2NsdWRlcyB0aGUgY29udGVudHMgb2YgdGhlIGRpcmVjdGl2ZSBpbnRvIHRoZSB0ZW1wbGF0ZVxyXG4gICAgcmVzdHJpY3Q6ICdBJyxcclxuICAgIHRlbXBsYXRlVXJsOiBmdW5jdGlvbihlbGVtZW50LCBhdHRycykge1xyXG4gICAgICByZXR1cm4gYXR0cnMudGVtcGxhdGVVcmwgfHwgJ3VpYi90ZW1wbGF0ZS9hY2NvcmRpb24vYWNjb3JkaW9uLWdyb3VwLmh0bWwnO1xyXG4gICAgfSxcclxuICAgIHNjb3BlOiB7XHJcbiAgICAgIGhlYWRpbmc6ICdAJywgICAgICAgICAgICAgICAvLyBJbnRlcnBvbGF0ZSB0aGUgaGVhZGluZyBhdHRyaWJ1dGUgb250byB0aGlzIHNjb3BlXHJcbiAgICAgIHBhbmVsQ2xhc3M6ICdAPycsICAgICAgICAgICAvLyBEaXR0byB3aXRoIHBhbmVsQ2xhc3NcclxuICAgICAgaXNPcGVuOiAnPT8nLFxyXG4gICAgICBpc0Rpc2FibGVkOiAnPT8nXHJcbiAgICB9LFxyXG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24oKSB7XHJcbiAgICAgIHRoaXMuc2V0SGVhZGluZyA9IGZ1bmN0aW9uKGVsZW1lbnQpIHtcclxuICAgICAgICB0aGlzLmhlYWRpbmcgPSBlbGVtZW50O1xyXG4gICAgICB9O1xyXG4gICAgfSxcclxuICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBlbGVtZW50LCBhdHRycywgYWNjb3JkaW9uQ3RybCkge1xyXG4gICAgICBlbGVtZW50LmFkZENsYXNzKCdwYW5lbCcpO1xyXG4gICAgICBhY2NvcmRpb25DdHJsLmFkZEdyb3VwKHNjb3BlKTtcclxuXHJcbiAgICAgIHNjb3BlLm9wZW5DbGFzcyA9IGF0dHJzLm9wZW5DbGFzcyB8fCAncGFuZWwtb3Blbic7XHJcbiAgICAgIHNjb3BlLnBhbmVsQ2xhc3MgPSBhdHRycy5wYW5lbENsYXNzIHx8ICdwYW5lbC1kZWZhdWx0JztcclxuICAgICAgc2NvcGUuJHdhdGNoKCdpc09wZW4nLCBmdW5jdGlvbih2YWx1ZSkge1xyXG4gICAgICAgIGVsZW1lbnQudG9nZ2xlQ2xhc3Moc2NvcGUub3BlbkNsYXNzLCAhIXZhbHVlKTtcclxuICAgICAgICBpZiAodmFsdWUpIHtcclxuICAgICAgICAgIGFjY29yZGlvbkN0cmwuY2xvc2VPdGhlcnMoc2NvcGUpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcblxyXG4gICAgICBzY29wZS50b2dnbGVPcGVuID0gZnVuY3Rpb24oJGV2ZW50KSB7XHJcbiAgICAgICAgaWYgKCFzY29wZS5pc0Rpc2FibGVkKSB7XHJcbiAgICAgICAgICBpZiAoISRldmVudCB8fCAkZXZlbnQud2hpY2ggPT09IDMyKSB7XHJcbiAgICAgICAgICAgIHNjb3BlLmlzT3BlbiA9ICFzY29wZS5pc09wZW47XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9O1xyXG5cclxuICAgICAgdmFyIGlkID0gJ2FjY29yZGlvbmdyb3VwLScgKyBzY29wZS4kaWQgKyAnLScgKyBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAxMDAwMCk7XHJcbiAgICAgIHNjb3BlLmhlYWRpbmdJZCA9IGlkICsgJy10YWInO1xyXG4gICAgICBzY29wZS5wYW5lbElkID0gaWQgKyAnLXBhbmVsJztcclxuICAgIH1cclxuICB9O1xyXG59KVxyXG5cclxuLy8gVXNlIGFjY29yZGlvbi1oZWFkaW5nIGJlbG93IGFuIGFjY29yZGlvbi1ncm91cCB0byBwcm92aWRlIGEgaGVhZGluZyBjb250YWluaW5nIEhUTUxcclxuLmRpcmVjdGl2ZSgndWliQWNjb3JkaW9uSGVhZGluZycsIGZ1bmN0aW9uKCkge1xyXG4gIHJldHVybiB7XHJcbiAgICB0cmFuc2NsdWRlOiB0cnVlLCAgIC8vIEdyYWIgdGhlIGNvbnRlbnRzIHRvIGJlIHVzZWQgYXMgdGhlIGhlYWRpbmdcclxuICAgIHRlbXBsYXRlOiAnJywgICAgICAgLy8gSW4gZWZmZWN0IHJlbW92ZSB0aGlzIGVsZW1lbnQhXHJcbiAgICByZXBsYWNlOiB0cnVlLFxyXG4gICAgcmVxdWlyZTogJ151aWJBY2NvcmRpb25Hcm91cCcsXHJcbiAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxlbWVudCwgYXR0cnMsIGFjY29yZGlvbkdyb3VwQ3RybCwgdHJhbnNjbHVkZSkge1xyXG4gICAgICAvLyBQYXNzIHRoZSBoZWFkaW5nIHRvIHRoZSBhY2NvcmRpb24tZ3JvdXAgY29udHJvbGxlclxyXG4gICAgICAvLyBzbyB0aGF0IGl0IGNhbiBiZSB0cmFuc2NsdWRlZCBpbnRvIHRoZSByaWdodCBwbGFjZSBpbiB0aGUgdGVtcGxhdGVcclxuICAgICAgLy8gW1RoZSBzZWNvbmQgcGFyYW1ldGVyIHRvIHRyYW5zY2x1ZGUgY2F1c2VzIHRoZSBlbGVtZW50cyB0byBiZSBjbG9uZWQgc28gdGhhdCB0aGV5IHdvcmsgaW4gbmctcmVwZWF0XVxyXG4gICAgICBhY2NvcmRpb25Hcm91cEN0cmwuc2V0SGVhZGluZyh0cmFuc2NsdWRlKHNjb3BlLCBhbmd1bGFyLm5vb3ApKTtcclxuICAgIH1cclxuICB9O1xyXG59KVxyXG5cclxuLy8gVXNlIGluIHRoZSBhY2NvcmRpb24tZ3JvdXAgdGVtcGxhdGUgdG8gaW5kaWNhdGUgd2hlcmUgeW91IHdhbnQgdGhlIGhlYWRpbmcgdG8gYmUgdHJhbnNjbHVkZWRcclxuLy8gWW91IG11c3QgcHJvdmlkZSB0aGUgcHJvcGVydHkgb24gdGhlIGFjY29yZGlvbi1ncm91cCBjb250cm9sbGVyIHRoYXQgd2lsbCBob2xkIHRoZSB0cmFuc2NsdWRlZCBlbGVtZW50XHJcbi5kaXJlY3RpdmUoJ3VpYkFjY29yZGlvblRyYW5zY2x1ZGUnLCBmdW5jdGlvbigpIHtcclxuICByZXR1cm4ge1xyXG4gICAgcmVxdWlyZTogJ151aWJBY2NvcmRpb25Hcm91cCcsXHJcbiAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxlbWVudCwgYXR0cnMsIGNvbnRyb2xsZXIpIHtcclxuICAgICAgc2NvcGUuJHdhdGNoKGZ1bmN0aW9uKCkgeyByZXR1cm4gY29udHJvbGxlclthdHRycy51aWJBY2NvcmRpb25UcmFuc2NsdWRlXTsgfSwgZnVuY3Rpb24oaGVhZGluZykge1xyXG4gICAgICAgIGlmIChoZWFkaW5nKSB7XHJcbiAgICAgICAgICB2YXIgZWxlbSA9IGFuZ3VsYXIuZWxlbWVudChlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3IoZ2V0SGVhZGVyU2VsZWN0b3JzKCkpKTtcclxuICAgICAgICAgIGVsZW0uaHRtbCgnJyk7XHJcbiAgICAgICAgICBlbGVtLmFwcGVuZChoZWFkaW5nKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIGZ1bmN0aW9uIGdldEhlYWRlclNlbGVjdG9ycygpIHtcclxuICAgICAgcmV0dXJuICd1aWItYWNjb3JkaW9uLWhlYWRlciwnICtcclxuICAgICAgICAgICdkYXRhLXVpYi1hY2NvcmRpb24taGVhZGVyLCcgK1xyXG4gICAgICAgICAgJ3gtdWliLWFjY29yZGlvbi1oZWFkZXIsJyArXHJcbiAgICAgICAgICAndWliXFxcXDphY2NvcmRpb24taGVhZGVyLCcgK1xyXG4gICAgICAgICAgJ1t1aWItYWNjb3JkaW9uLWhlYWRlcl0sJyArXHJcbiAgICAgICAgICAnW2RhdGEtdWliLWFjY29yZGlvbi1oZWFkZXJdLCcgK1xyXG4gICAgICAgICAgJ1t4LXVpYi1hY2NvcmRpb24taGVhZGVyXSc7XHJcbiAgfVxyXG59KTtcclxuXHJcbmFuZ3VsYXIubW9kdWxlKCd1aS5ib290c3RyYXAuYWxlcnQnLCBbXSlcclxuXHJcbi5jb250cm9sbGVyKCdVaWJBbGVydENvbnRyb2xsZXInLCBbJyRzY29wZScsICckZWxlbWVudCcsICckYXR0cnMnLCAnJGludGVycG9sYXRlJywgJyR0aW1lb3V0JywgZnVuY3Rpb24oJHNjb3BlLCAkZWxlbWVudCwgJGF0dHJzLCAkaW50ZXJwb2xhdGUsICR0aW1lb3V0KSB7XHJcbiAgJHNjb3BlLmNsb3NlYWJsZSA9ICEhJGF0dHJzLmNsb3NlO1xyXG4gICRlbGVtZW50LmFkZENsYXNzKCdhbGVydCcpO1xyXG4gICRhdHRycy4kc2V0KCdyb2xlJywgJ2FsZXJ0Jyk7XHJcbiAgaWYgKCRzY29wZS5jbG9zZWFibGUpIHtcclxuICAgICRlbGVtZW50LmFkZENsYXNzKCdhbGVydC1kaXNtaXNzaWJsZScpO1xyXG4gIH1cclxuXHJcbiAgdmFyIGRpc21pc3NPblRpbWVvdXQgPSBhbmd1bGFyLmlzRGVmaW5lZCgkYXR0cnMuZGlzbWlzc09uVGltZW91dCkgP1xyXG4gICAgJGludGVycG9sYXRlKCRhdHRycy5kaXNtaXNzT25UaW1lb3V0KSgkc2NvcGUuJHBhcmVudCkgOiBudWxsO1xyXG5cclxuICBpZiAoZGlzbWlzc09uVGltZW91dCkge1xyXG4gICAgJHRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICRzY29wZS5jbG9zZSgpO1xyXG4gICAgfSwgcGFyc2VJbnQoZGlzbWlzc09uVGltZW91dCwgMTApKTtcclxuICB9XHJcbn1dKVxyXG5cclxuLmRpcmVjdGl2ZSgndWliQWxlcnQnLCBmdW5jdGlvbigpIHtcclxuICByZXR1cm4ge1xyXG4gICAgY29udHJvbGxlcjogJ1VpYkFsZXJ0Q29udHJvbGxlcicsXHJcbiAgICBjb250cm9sbGVyQXM6ICdhbGVydCcsXHJcbiAgICByZXN0cmljdDogJ0EnLFxyXG4gICAgdGVtcGxhdGVVcmw6IGZ1bmN0aW9uKGVsZW1lbnQsIGF0dHJzKSB7XHJcbiAgICAgIHJldHVybiBhdHRycy50ZW1wbGF0ZVVybCB8fCAndWliL3RlbXBsYXRlL2FsZXJ0L2FsZXJ0Lmh0bWwnO1xyXG4gICAgfSxcclxuICAgIHRyYW5zY2x1ZGU6IHRydWUsXHJcbiAgICBzY29wZToge1xyXG4gICAgICBjbG9zZTogJyYnXHJcbiAgICB9XHJcbiAgfTtcclxufSk7XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgndWkuYm9vdHN0cmFwLmJ1dHRvbnMnLCBbXSlcclxuXHJcbi5jb25zdGFudCgndWliQnV0dG9uQ29uZmlnJywge1xyXG4gIGFjdGl2ZUNsYXNzOiAnYWN0aXZlJyxcclxuICB0b2dnbGVFdmVudDogJ2NsaWNrJ1xyXG59KVxyXG5cclxuLmNvbnRyb2xsZXIoJ1VpYkJ1dHRvbnNDb250cm9sbGVyJywgWyd1aWJCdXR0b25Db25maWcnLCBmdW5jdGlvbihidXR0b25Db25maWcpIHtcclxuICB0aGlzLmFjdGl2ZUNsYXNzID0gYnV0dG9uQ29uZmlnLmFjdGl2ZUNsYXNzIHx8ICdhY3RpdmUnO1xyXG4gIHRoaXMudG9nZ2xlRXZlbnQgPSBidXR0b25Db25maWcudG9nZ2xlRXZlbnQgfHwgJ2NsaWNrJztcclxufV0pXHJcblxyXG4uZGlyZWN0aXZlKCd1aWJCdG5SYWRpbycsIFsnJHBhcnNlJywgZnVuY3Rpb24oJHBhcnNlKSB7XHJcbiAgcmV0dXJuIHtcclxuICAgIHJlcXVpcmU6IFsndWliQnRuUmFkaW8nLCAnbmdNb2RlbCddLFxyXG4gICAgY29udHJvbGxlcjogJ1VpYkJ1dHRvbnNDb250cm9sbGVyJyxcclxuICAgIGNvbnRyb2xsZXJBczogJ2J1dHRvbnMnLFxyXG4gICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCBjdHJscykge1xyXG4gICAgICB2YXIgYnV0dG9uc0N0cmwgPSBjdHJsc1swXSwgbmdNb2RlbEN0cmwgPSBjdHJsc1sxXTtcclxuICAgICAgdmFyIHVuY2hlY2thYmxlRXhwciA9ICRwYXJzZShhdHRycy51aWJVbmNoZWNrYWJsZSk7XHJcblxyXG4gICAgICBlbGVtZW50LmZpbmQoJ2lucHV0JykuY3NzKHtkaXNwbGF5OiAnbm9uZSd9KTtcclxuXHJcbiAgICAgIC8vbW9kZWwgLT4gVUlcclxuICAgICAgbmdNb2RlbEN0cmwuJHJlbmRlciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGVsZW1lbnQudG9nZ2xlQ2xhc3MoYnV0dG9uc0N0cmwuYWN0aXZlQ2xhc3MsIGFuZ3VsYXIuZXF1YWxzKG5nTW9kZWxDdHJsLiRtb2RlbFZhbHVlLCBzY29wZS4kZXZhbChhdHRycy51aWJCdG5SYWRpbykpKTtcclxuICAgICAgfTtcclxuXHJcbiAgICAgIC8vdWktPm1vZGVsXHJcbiAgICAgIGVsZW1lbnQub24oYnV0dG9uc0N0cmwudG9nZ2xlRXZlbnQsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGlmIChhdHRycy5kaXNhYmxlZCkge1xyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdmFyIGlzQWN0aXZlID0gZWxlbWVudC5oYXNDbGFzcyhidXR0b25zQ3RybC5hY3RpdmVDbGFzcyk7XHJcblxyXG4gICAgICAgIGlmICghaXNBY3RpdmUgfHwgYW5ndWxhci5pc0RlZmluZWQoYXR0cnMudW5jaGVja2FibGUpKSB7XHJcbiAgICAgICAgICBzY29wZS4kYXBwbHkoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIG5nTW9kZWxDdHJsLiRzZXRWaWV3VmFsdWUoaXNBY3RpdmUgPyBudWxsIDogc2NvcGUuJGV2YWwoYXR0cnMudWliQnRuUmFkaW8pKTtcclxuICAgICAgICAgICAgbmdNb2RlbEN0cmwuJHJlbmRlcigpO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIGlmIChhdHRycy51aWJVbmNoZWNrYWJsZSkge1xyXG4gICAgICAgIHNjb3BlLiR3YXRjaCh1bmNoZWNrYWJsZUV4cHIsIGZ1bmN0aW9uKHVuY2hlY2thYmxlKSB7XHJcbiAgICAgICAgICBhdHRycy4kc2V0KCd1bmNoZWNrYWJsZScsIHVuY2hlY2thYmxlID8gJycgOiB1bmRlZmluZWQpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfTtcclxufV0pXHJcblxyXG4uZGlyZWN0aXZlKCd1aWJCdG5DaGVja2JveCcsIGZ1bmN0aW9uKCkge1xyXG4gIHJldHVybiB7XHJcbiAgICByZXF1aXJlOiBbJ3VpYkJ0bkNoZWNrYm94JywgJ25nTW9kZWwnXSxcclxuICAgIGNvbnRyb2xsZXI6ICdVaWJCdXR0b25zQ29udHJvbGxlcicsXHJcbiAgICBjb250cm9sbGVyQXM6ICdidXR0b24nLFxyXG4gICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCBjdHJscykge1xyXG4gICAgICB2YXIgYnV0dG9uc0N0cmwgPSBjdHJsc1swXSwgbmdNb2RlbEN0cmwgPSBjdHJsc1sxXTtcclxuXHJcbiAgICAgIGVsZW1lbnQuZmluZCgnaW5wdXQnKS5jc3Moe2Rpc3BsYXk6ICdub25lJ30pO1xyXG5cclxuICAgICAgZnVuY3Rpb24gZ2V0VHJ1ZVZhbHVlKCkge1xyXG4gICAgICAgIHJldHVybiBnZXRDaGVja2JveFZhbHVlKGF0dHJzLmJ0bkNoZWNrYm94VHJ1ZSwgdHJ1ZSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGZ1bmN0aW9uIGdldEZhbHNlVmFsdWUoKSB7XHJcbiAgICAgICAgcmV0dXJuIGdldENoZWNrYm94VmFsdWUoYXR0cnMuYnRuQ2hlY2tib3hGYWxzZSwgZmFsc2UpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBmdW5jdGlvbiBnZXRDaGVja2JveFZhbHVlKGF0dHJpYnV0ZSwgZGVmYXVsdFZhbHVlKSB7XHJcbiAgICAgICAgcmV0dXJuIGFuZ3VsYXIuaXNEZWZpbmVkKGF0dHJpYnV0ZSkgPyBzY29wZS4kZXZhbChhdHRyaWJ1dGUpIDogZGVmYXVsdFZhbHVlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvL21vZGVsIC0+IFVJXHJcbiAgICAgIG5nTW9kZWxDdHJsLiRyZW5kZXIgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICBlbGVtZW50LnRvZ2dsZUNsYXNzKGJ1dHRvbnNDdHJsLmFjdGl2ZUNsYXNzLCBhbmd1bGFyLmVxdWFscyhuZ01vZGVsQ3RybC4kbW9kZWxWYWx1ZSwgZ2V0VHJ1ZVZhbHVlKCkpKTtcclxuICAgICAgfTtcclxuXHJcbiAgICAgIC8vdWktPm1vZGVsXHJcbiAgICAgIGVsZW1lbnQub24oYnV0dG9uc0N0cmwudG9nZ2xlRXZlbnQsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGlmIChhdHRycy5kaXNhYmxlZCkge1xyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgc2NvcGUuJGFwcGx5KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgbmdNb2RlbEN0cmwuJHNldFZpZXdWYWx1ZShlbGVtZW50Lmhhc0NsYXNzKGJ1dHRvbnNDdHJsLmFjdGl2ZUNsYXNzKSA/IGdldEZhbHNlVmFsdWUoKSA6IGdldFRydWVWYWx1ZSgpKTtcclxuICAgICAgICAgIG5nTW9kZWxDdHJsLiRyZW5kZXIoKTtcclxuICAgICAgICB9KTtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfTtcclxufSk7XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgndWkuYm9vdHN0cmFwLmNhcm91c2VsJywgW10pXHJcblxyXG4uY29udHJvbGxlcignVWliQ2Fyb3VzZWxDb250cm9sbGVyJywgWyckc2NvcGUnLCAnJGVsZW1lbnQnLCAnJGludGVydmFsJywgJyR0aW1lb3V0JywgJyRhbmltYXRlJywgZnVuY3Rpb24oJHNjb3BlLCAkZWxlbWVudCwgJGludGVydmFsLCAkdGltZW91dCwgJGFuaW1hdGUpIHtcclxuICB2YXIgc2VsZiA9IHRoaXMsXHJcbiAgICBzbGlkZXMgPSBzZWxmLnNsaWRlcyA9ICRzY29wZS5zbGlkZXMgPSBbXSxcclxuICAgIFNMSURFX0RJUkVDVElPTiA9ICd1aWItc2xpZGVEaXJlY3Rpb24nLFxyXG4gICAgY3VycmVudEluZGV4ID0gJHNjb3BlLmFjdGl2ZSxcclxuICAgIGN1cnJlbnRJbnRlcnZhbCwgaXNQbGF5aW5nLCBidWZmZXJlZFRyYW5zaXRpb25zID0gW107XHJcblxyXG4gIHZhciBkZXN0cm95ZWQgPSBmYWxzZTtcclxuICAkZWxlbWVudC5hZGRDbGFzcygnY2Fyb3VzZWwnKTtcclxuXHJcbiAgc2VsZi5hZGRTbGlkZSA9IGZ1bmN0aW9uKHNsaWRlLCBlbGVtZW50KSB7XHJcbiAgICBzbGlkZXMucHVzaCh7XHJcbiAgICAgIHNsaWRlOiBzbGlkZSxcclxuICAgICAgZWxlbWVudDogZWxlbWVudFxyXG4gICAgfSk7XHJcbiAgICBzbGlkZXMuc29ydChmdW5jdGlvbihhLCBiKSB7XHJcbiAgICAgIHJldHVybiArYS5zbGlkZS5pbmRleCAtICtiLnNsaWRlLmluZGV4O1xyXG4gICAgfSk7XHJcbiAgICAvL2lmIHRoaXMgaXMgdGhlIGZpcnN0IHNsaWRlIG9yIHRoZSBzbGlkZSBpcyBzZXQgdG8gYWN0aXZlLCBzZWxlY3QgaXRcclxuICAgIGlmIChzbGlkZS5pbmRleCA9PT0gJHNjb3BlLmFjdGl2ZSB8fCBzbGlkZXMubGVuZ3RoID09PSAxICYmICFhbmd1bGFyLmlzTnVtYmVyKCRzY29wZS5hY3RpdmUpKSB7XHJcbiAgICAgIGlmICgkc2NvcGUuJGN1cnJlbnRUcmFuc2l0aW9uKSB7XHJcbiAgICAgICAgJHNjb3BlLiRjdXJyZW50VHJhbnNpdGlvbiA9IG51bGw7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGN1cnJlbnRJbmRleCA9IHNsaWRlLmluZGV4O1xyXG4gICAgICAkc2NvcGUuYWN0aXZlID0gc2xpZGUuaW5kZXg7XHJcbiAgICAgIHNldEFjdGl2ZShjdXJyZW50SW5kZXgpO1xyXG4gICAgICBzZWxmLnNlbGVjdChzbGlkZXNbZmluZFNsaWRlSW5kZXgoc2xpZGUpXSk7XHJcbiAgICAgIGlmIChzbGlkZXMubGVuZ3RoID09PSAxKSB7XHJcbiAgICAgICAgJHNjb3BlLnBsYXkoKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIHNlbGYuZ2V0Q3VycmVudEluZGV4ID0gZnVuY3Rpb24oKSB7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNsaWRlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICBpZiAoc2xpZGVzW2ldLnNsaWRlLmluZGV4ID09PSBjdXJyZW50SW5kZXgpIHtcclxuICAgICAgICByZXR1cm4gaTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIHNlbGYubmV4dCA9ICRzY29wZS5uZXh0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgbmV3SW5kZXggPSAoc2VsZi5nZXRDdXJyZW50SW5kZXgoKSArIDEpICUgc2xpZGVzLmxlbmd0aDtcclxuXHJcbiAgICBpZiAobmV3SW5kZXggPT09IDAgJiYgJHNjb3BlLm5vV3JhcCgpKSB7XHJcbiAgICAgICRzY29wZS5wYXVzZSgpO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHNlbGYuc2VsZWN0KHNsaWRlc1tuZXdJbmRleF0sICduZXh0Jyk7XHJcbiAgfTtcclxuXHJcbiAgc2VsZi5wcmV2ID0gJHNjb3BlLnByZXYgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBuZXdJbmRleCA9IHNlbGYuZ2V0Q3VycmVudEluZGV4KCkgLSAxIDwgMCA/IHNsaWRlcy5sZW5ndGggLSAxIDogc2VsZi5nZXRDdXJyZW50SW5kZXgoKSAtIDE7XHJcblxyXG4gICAgaWYgKCRzY29wZS5ub1dyYXAoKSAmJiBuZXdJbmRleCA9PT0gc2xpZGVzLmxlbmd0aCAtIDEpIHtcclxuICAgICAgJHNjb3BlLnBhdXNlKCk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gc2VsZi5zZWxlY3Qoc2xpZGVzW25ld0luZGV4XSwgJ3ByZXYnKTtcclxuICB9O1xyXG5cclxuICBzZWxmLnJlbW92ZVNsaWRlID0gZnVuY3Rpb24oc2xpZGUpIHtcclxuICAgIHZhciBpbmRleCA9IGZpbmRTbGlkZUluZGV4KHNsaWRlKTtcclxuXHJcbiAgICB2YXIgYnVmZmVyZWRJbmRleCA9IGJ1ZmZlcmVkVHJhbnNpdGlvbnMuaW5kZXhPZihzbGlkZXNbaW5kZXhdKTtcclxuICAgIGlmIChidWZmZXJlZEluZGV4ICE9PSAtMSkge1xyXG4gICAgICBidWZmZXJlZFRyYW5zaXRpb25zLnNwbGljZShidWZmZXJlZEluZGV4LCAxKTtcclxuICAgIH1cclxuXHJcbiAgICAvL2dldCB0aGUgaW5kZXggb2YgdGhlIHNsaWRlIGluc2lkZSB0aGUgY2Fyb3VzZWxcclxuICAgIHNsaWRlcy5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgaWYgKHNsaWRlcy5sZW5ndGggPiAwICYmIGN1cnJlbnRJbmRleCA9PT0gaW5kZXgpIHtcclxuICAgICAgaWYgKGluZGV4ID49IHNsaWRlcy5sZW5ndGgpIHtcclxuICAgICAgICBjdXJyZW50SW5kZXggPSBzbGlkZXMubGVuZ3RoIC0gMTtcclxuICAgICAgICAkc2NvcGUuYWN0aXZlID0gY3VycmVudEluZGV4O1xyXG4gICAgICAgIHNldEFjdGl2ZShjdXJyZW50SW5kZXgpO1xyXG4gICAgICAgIHNlbGYuc2VsZWN0KHNsaWRlc1tzbGlkZXMubGVuZ3RoIC0gMV0pO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGN1cnJlbnRJbmRleCA9IGluZGV4O1xyXG4gICAgICAgICRzY29wZS5hY3RpdmUgPSBjdXJyZW50SW5kZXg7XHJcbiAgICAgICAgc2V0QWN0aXZlKGN1cnJlbnRJbmRleCk7XHJcbiAgICAgICAgc2VsZi5zZWxlY3Qoc2xpZGVzW2luZGV4XSk7XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSBpZiAoY3VycmVudEluZGV4ID4gaW5kZXgpIHtcclxuICAgICAgY3VycmVudEluZGV4LS07XHJcbiAgICAgICRzY29wZS5hY3RpdmUgPSBjdXJyZW50SW5kZXg7XHJcbiAgICB9XHJcblxyXG4gICAgLy9jbGVhbiB0aGUgYWN0aXZlIHZhbHVlIHdoZW4gbm8gbW9yZSBzbGlkZVxyXG4gICAgaWYgKHNsaWRlcy5sZW5ndGggPT09IDApIHtcclxuICAgICAgY3VycmVudEluZGV4ID0gbnVsbDtcclxuICAgICAgJHNjb3BlLmFjdGl2ZSA9IG51bGw7XHJcbiAgICAgIGNsZWFyQnVmZmVyZWRUcmFuc2l0aW9ucygpO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIC8qIGRpcmVjdGlvbjogXCJwcmV2XCIgb3IgXCJuZXh0XCIgKi9cclxuICBzZWxmLnNlbGVjdCA9ICRzY29wZS5zZWxlY3QgPSBmdW5jdGlvbihuZXh0U2xpZGUsIGRpcmVjdGlvbikge1xyXG4gICAgdmFyIG5leHRJbmRleCA9IGZpbmRTbGlkZUluZGV4KG5leHRTbGlkZS5zbGlkZSk7XHJcbiAgICAvL0RlY2lkZSBkaXJlY3Rpb24gaWYgaXQncyBub3QgZ2l2ZW5cclxuICAgIGlmIChkaXJlY3Rpb24gPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICBkaXJlY3Rpb24gPSBuZXh0SW5kZXggPiBzZWxmLmdldEN1cnJlbnRJbmRleCgpID8gJ25leHQnIDogJ3ByZXYnO1xyXG4gICAgfVxyXG4gICAgLy9QcmV2ZW50IHRoaXMgdXNlci10cmlnZ2VyZWQgdHJhbnNpdGlvbiBmcm9tIG9jY3VycmluZyBpZiB0aGVyZSBpcyBhbHJlYWR5IG9uZSBpbiBwcm9ncmVzc1xyXG4gICAgaWYgKG5leHRTbGlkZS5zbGlkZS5pbmRleCAhPT0gY3VycmVudEluZGV4ICYmXHJcbiAgICAgICEkc2NvcGUuJGN1cnJlbnRUcmFuc2l0aW9uKSB7XHJcbiAgICAgIGdvTmV4dChuZXh0U2xpZGUuc2xpZGUsIG5leHRJbmRleCwgZGlyZWN0aW9uKTtcclxuICAgIH0gZWxzZSBpZiAobmV4dFNsaWRlICYmIG5leHRTbGlkZS5zbGlkZS5pbmRleCAhPT0gY3VycmVudEluZGV4ICYmICRzY29wZS4kY3VycmVudFRyYW5zaXRpb24pIHtcclxuICAgICAgYnVmZmVyZWRUcmFuc2l0aW9ucy5wdXNoKHNsaWRlc1tuZXh0SW5kZXhdKTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICAvKiBBbGxvdyBvdXRzaWRlIHBlb3BsZSB0byBjYWxsIGluZGV4T2Ygb24gc2xpZGVzIGFycmF5ICovXHJcbiAgJHNjb3BlLmluZGV4T2ZTbGlkZSA9IGZ1bmN0aW9uKHNsaWRlKSB7XHJcbiAgICByZXR1cm4gK3NsaWRlLnNsaWRlLmluZGV4O1xyXG4gIH07XHJcblxyXG4gICRzY29wZS5pc0FjdGl2ZSA9IGZ1bmN0aW9uKHNsaWRlKSB7XHJcbiAgICByZXR1cm4gJHNjb3BlLmFjdGl2ZSA9PT0gc2xpZGUuc2xpZGUuaW5kZXg7XHJcbiAgfTtcclxuXHJcbiAgJHNjb3BlLmlzUHJldkRpc2FibGVkID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gJHNjb3BlLmFjdGl2ZSA9PT0gMCAmJiAkc2NvcGUubm9XcmFwKCk7XHJcbiAgfTtcclxuXHJcbiAgJHNjb3BlLmlzTmV4dERpc2FibGVkID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gJHNjb3BlLmFjdGl2ZSA9PT0gc2xpZGVzLmxlbmd0aCAtIDEgJiYgJHNjb3BlLm5vV3JhcCgpO1xyXG4gIH07XHJcblxyXG4gICRzY29wZS5wYXVzZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgaWYgKCEkc2NvcGUubm9QYXVzZSkge1xyXG4gICAgICBpc1BsYXlpbmcgPSBmYWxzZTtcclxuICAgICAgcmVzZXRUaW1lcigpO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gICRzY29wZS5wbGF5ID0gZnVuY3Rpb24oKSB7XHJcbiAgICBpZiAoIWlzUGxheWluZykge1xyXG4gICAgICBpc1BsYXlpbmcgPSB0cnVlO1xyXG4gICAgICByZXN0YXJ0VGltZXIoKTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICAkZWxlbWVudC5vbignbW91c2VlbnRlcicsICRzY29wZS5wYXVzZSk7XHJcbiAgJGVsZW1lbnQub24oJ21vdXNlbGVhdmUnLCAkc2NvcGUucGxheSk7XHJcblxyXG4gICRzY29wZS4kb24oJyRkZXN0cm95JywgZnVuY3Rpb24oKSB7XHJcbiAgICBkZXN0cm95ZWQgPSB0cnVlO1xyXG4gICAgcmVzZXRUaW1lcigpO1xyXG4gIH0pO1xyXG5cclxuICAkc2NvcGUuJHdhdGNoKCdub1RyYW5zaXRpb24nLCBmdW5jdGlvbihub1RyYW5zaXRpb24pIHtcclxuICAgICRhbmltYXRlLmVuYWJsZWQoJGVsZW1lbnQsICFub1RyYW5zaXRpb24pO1xyXG4gIH0pO1xyXG5cclxuICAkc2NvcGUuJHdhdGNoKCdpbnRlcnZhbCcsIHJlc3RhcnRUaW1lcik7XHJcblxyXG4gICRzY29wZS4kd2F0Y2hDb2xsZWN0aW9uKCdzbGlkZXMnLCByZXNldFRyYW5zaXRpb24pO1xyXG5cclxuICAkc2NvcGUuJHdhdGNoKCdhY3RpdmUnLCBmdW5jdGlvbihpbmRleCkge1xyXG4gICAgaWYgKGFuZ3VsYXIuaXNOdW1iZXIoaW5kZXgpICYmIGN1cnJlbnRJbmRleCAhPT0gaW5kZXgpIHtcclxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzbGlkZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBpZiAoc2xpZGVzW2ldLnNsaWRlLmluZGV4ID09PSBpbmRleCkge1xyXG4gICAgICAgICAgaW5kZXggPSBpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICB2YXIgc2xpZGUgPSBzbGlkZXNbaW5kZXhdO1xyXG4gICAgICBpZiAoc2xpZGUpIHtcclxuICAgICAgICBzZXRBY3RpdmUoaW5kZXgpO1xyXG4gICAgICAgIHNlbGYuc2VsZWN0KHNsaWRlc1tpbmRleF0pO1xyXG4gICAgICAgIGN1cnJlbnRJbmRleCA9IGluZGV4O1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSk7XHJcblxyXG4gIGZ1bmN0aW9uIGNsZWFyQnVmZmVyZWRUcmFuc2l0aW9ucygpIHtcclxuICAgIHdoaWxlIChidWZmZXJlZFRyYW5zaXRpb25zLmxlbmd0aCkge1xyXG4gICAgICBidWZmZXJlZFRyYW5zaXRpb25zLnNoaWZ0KCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBnZXRTbGlkZUJ5SW5kZXgoaW5kZXgpIHtcclxuICAgIGZvciAodmFyIGkgPSAwLCBsID0gc2xpZGVzLmxlbmd0aDsgaSA8IGw7ICsraSkge1xyXG4gICAgICBpZiAoc2xpZGVzW2ldLmluZGV4ID09PSBpbmRleCkge1xyXG4gICAgICAgIHJldHVybiBzbGlkZXNbaV07XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHNldEFjdGl2ZShpbmRleCkge1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzbGlkZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgc2xpZGVzW2ldLnNsaWRlLmFjdGl2ZSA9IGkgPT09IGluZGV4O1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gZ29OZXh0KHNsaWRlLCBpbmRleCwgZGlyZWN0aW9uKSB7XHJcbiAgICBpZiAoZGVzdHJveWVkKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBhbmd1bGFyLmV4dGVuZChzbGlkZSwge2RpcmVjdGlvbjogZGlyZWN0aW9ufSk7XHJcbiAgICBhbmd1bGFyLmV4dGVuZChzbGlkZXNbY3VycmVudEluZGV4XS5zbGlkZSB8fCB7fSwge2RpcmVjdGlvbjogZGlyZWN0aW9ufSk7XHJcbiAgICBpZiAoJGFuaW1hdGUuZW5hYmxlZCgkZWxlbWVudCkgJiYgISRzY29wZS4kY3VycmVudFRyYW5zaXRpb24gJiZcclxuICAgICAgc2xpZGVzW2luZGV4XS5lbGVtZW50ICYmIHNlbGYuc2xpZGVzLmxlbmd0aCA+IDEpIHtcclxuICAgICAgc2xpZGVzW2luZGV4XS5lbGVtZW50LmRhdGEoU0xJREVfRElSRUNUSU9OLCBzbGlkZS5kaXJlY3Rpb24pO1xyXG4gICAgICB2YXIgY3VycmVudElkeCA9IHNlbGYuZ2V0Q3VycmVudEluZGV4KCk7XHJcblxyXG4gICAgICBpZiAoYW5ndWxhci5pc051bWJlcihjdXJyZW50SWR4KSAmJiBzbGlkZXNbY3VycmVudElkeF0uZWxlbWVudCkge1xyXG4gICAgICAgIHNsaWRlc1tjdXJyZW50SWR4XS5lbGVtZW50LmRhdGEoU0xJREVfRElSRUNUSU9OLCBzbGlkZS5kaXJlY3Rpb24pO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAkc2NvcGUuJGN1cnJlbnRUcmFuc2l0aW9uID0gdHJ1ZTtcclxuICAgICAgJGFuaW1hdGUub24oJ2FkZENsYXNzJywgc2xpZGVzW2luZGV4XS5lbGVtZW50LCBmdW5jdGlvbihlbGVtZW50LCBwaGFzZSkge1xyXG4gICAgICAgIGlmIChwaGFzZSA9PT0gJ2Nsb3NlJykge1xyXG4gICAgICAgICAgJHNjb3BlLiRjdXJyZW50VHJhbnNpdGlvbiA9IG51bGw7XHJcbiAgICAgICAgICAkYW5pbWF0ZS5vZmYoJ2FkZENsYXNzJywgZWxlbWVudCk7XHJcbiAgICAgICAgICBpZiAoYnVmZmVyZWRUcmFuc2l0aW9ucy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgdmFyIG5leHRTbGlkZSA9IGJ1ZmZlcmVkVHJhbnNpdGlvbnMucG9wKCkuc2xpZGU7XHJcbiAgICAgICAgICAgIHZhciBuZXh0SW5kZXggPSBuZXh0U2xpZGUuaW5kZXg7XHJcbiAgICAgICAgICAgIHZhciBuZXh0RGlyZWN0aW9uID0gbmV4dEluZGV4ID4gc2VsZi5nZXRDdXJyZW50SW5kZXgoKSA/ICduZXh0JyA6ICdwcmV2JztcclxuICAgICAgICAgICAgY2xlYXJCdWZmZXJlZFRyYW5zaXRpb25zKCk7XHJcblxyXG4gICAgICAgICAgICBnb05leHQobmV4dFNsaWRlLCBuZXh0SW5kZXgsIG5leHREaXJlY3Rpb24pO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgJHNjb3BlLmFjdGl2ZSA9IHNsaWRlLmluZGV4O1xyXG4gICAgY3VycmVudEluZGV4ID0gc2xpZGUuaW5kZXg7XHJcbiAgICBzZXRBY3RpdmUoaW5kZXgpO1xyXG5cclxuICAgIC8vZXZlcnkgdGltZSB5b3UgY2hhbmdlIHNsaWRlcywgcmVzZXQgdGhlIHRpbWVyXHJcbiAgICByZXN0YXJ0VGltZXIoKTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGZpbmRTbGlkZUluZGV4KHNsaWRlKSB7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNsaWRlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICBpZiAoc2xpZGVzW2ldLnNsaWRlID09PSBzbGlkZSkge1xyXG4gICAgICAgIHJldHVybiBpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiByZXNldFRpbWVyKCkge1xyXG4gICAgaWYgKGN1cnJlbnRJbnRlcnZhbCkge1xyXG4gICAgICAkaW50ZXJ2YWwuY2FuY2VsKGN1cnJlbnRJbnRlcnZhbCk7XHJcbiAgICAgIGN1cnJlbnRJbnRlcnZhbCA9IG51bGw7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiByZXNldFRyYW5zaXRpb24oc2xpZGVzKSB7XHJcbiAgICBpZiAoIXNsaWRlcy5sZW5ndGgpIHtcclxuICAgICAgJHNjb3BlLiRjdXJyZW50VHJhbnNpdGlvbiA9IG51bGw7XHJcbiAgICAgIGNsZWFyQnVmZmVyZWRUcmFuc2l0aW9ucygpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gcmVzdGFydFRpbWVyKCkge1xyXG4gICAgcmVzZXRUaW1lcigpO1xyXG4gICAgdmFyIGludGVydmFsID0gKyRzY29wZS5pbnRlcnZhbDtcclxuICAgIGlmICghaXNOYU4oaW50ZXJ2YWwpICYmIGludGVydmFsID4gMCkge1xyXG4gICAgICBjdXJyZW50SW50ZXJ2YWwgPSAkaW50ZXJ2YWwodGltZXJGbiwgaW50ZXJ2YWwpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gdGltZXJGbigpIHtcclxuICAgIHZhciBpbnRlcnZhbCA9ICskc2NvcGUuaW50ZXJ2YWw7XHJcbiAgICBpZiAoaXNQbGF5aW5nICYmICFpc05hTihpbnRlcnZhbCkgJiYgaW50ZXJ2YWwgPiAwICYmIHNsaWRlcy5sZW5ndGgpIHtcclxuICAgICAgJHNjb3BlLm5leHQoKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICRzY29wZS5wYXVzZSgpO1xyXG4gICAgfVxyXG4gIH1cclxufV0pXHJcblxyXG4uZGlyZWN0aXZlKCd1aWJDYXJvdXNlbCcsIGZ1bmN0aW9uKCkge1xyXG4gIHJldHVybiB7XHJcbiAgICB0cmFuc2NsdWRlOiB0cnVlLFxyXG4gICAgY29udHJvbGxlcjogJ1VpYkNhcm91c2VsQ29udHJvbGxlcicsXHJcbiAgICBjb250cm9sbGVyQXM6ICdjYXJvdXNlbCcsXHJcbiAgICByZXN0cmljdDogJ0EnLFxyXG4gICAgdGVtcGxhdGVVcmw6IGZ1bmN0aW9uKGVsZW1lbnQsIGF0dHJzKSB7XHJcbiAgICAgIHJldHVybiBhdHRycy50ZW1wbGF0ZVVybCB8fCAndWliL3RlbXBsYXRlL2Nhcm91c2VsL2Nhcm91c2VsLmh0bWwnO1xyXG4gICAgfSxcclxuICAgIHNjb3BlOiB7XHJcbiAgICAgIGFjdGl2ZTogJz0nLFxyXG4gICAgICBpbnRlcnZhbDogJz0nLFxyXG4gICAgICBub1RyYW5zaXRpb246ICc9JyxcclxuICAgICAgbm9QYXVzZTogJz0nLFxyXG4gICAgICBub1dyYXA6ICcmJ1xyXG4gICAgfVxyXG4gIH07XHJcbn0pXHJcblxyXG4uZGlyZWN0aXZlKCd1aWJTbGlkZScsIFsnJGFuaW1hdGUnLCBmdW5jdGlvbigkYW5pbWF0ZSkge1xyXG4gIHJldHVybiB7XHJcbiAgICByZXF1aXJlOiAnXnVpYkNhcm91c2VsJyxcclxuICAgIHJlc3RyaWN0OiAnQScsXHJcbiAgICB0cmFuc2NsdWRlOiB0cnVlLFxyXG4gICAgdGVtcGxhdGVVcmw6IGZ1bmN0aW9uKGVsZW1lbnQsIGF0dHJzKSB7XHJcbiAgICAgIHJldHVybiBhdHRycy50ZW1wbGF0ZVVybCB8fCAndWliL3RlbXBsYXRlL2Nhcm91c2VsL3NsaWRlLmh0bWwnO1xyXG4gICAgfSxcclxuICAgIHNjb3BlOiB7XHJcbiAgICAgIGFjdHVhbDogJz0/JyxcclxuICAgICAgaW5kZXg6ICc9PydcclxuICAgIH0sXHJcbiAgICBsaW5rOiBmdW5jdGlvbiAoc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCBjYXJvdXNlbEN0cmwpIHtcclxuICAgICAgZWxlbWVudC5hZGRDbGFzcygnaXRlbScpO1xyXG4gICAgICBjYXJvdXNlbEN0cmwuYWRkU2xpZGUoc2NvcGUsIGVsZW1lbnQpO1xyXG4gICAgICAvL3doZW4gdGhlIHNjb3BlIGlzIGRlc3Ryb3llZCB0aGVuIHJlbW92ZSB0aGUgc2xpZGUgZnJvbSB0aGUgY3VycmVudCBzbGlkZXMgYXJyYXlcclxuICAgICAgc2NvcGUuJG9uKCckZGVzdHJveScsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGNhcm91c2VsQ3RybC5yZW1vdmVTbGlkZShzY29wZSk7XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgc2NvcGUuJHdhdGNoKCdhY3RpdmUnLCBmdW5jdGlvbihhY3RpdmUpIHtcclxuICAgICAgICAkYW5pbWF0ZVthY3RpdmUgPyAnYWRkQ2xhc3MnIDogJ3JlbW92ZUNsYXNzJ10oZWxlbWVudCwgJ2FjdGl2ZScpO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuICB9O1xyXG59XSlcclxuXHJcbi5hbmltYXRpb24oJy5pdGVtJywgWyckYW5pbWF0ZUNzcycsXHJcbmZ1bmN0aW9uKCRhbmltYXRlQ3NzKSB7XHJcbiAgdmFyIFNMSURFX0RJUkVDVElPTiA9ICd1aWItc2xpZGVEaXJlY3Rpb24nO1xyXG5cclxuICBmdW5jdGlvbiByZW1vdmVDbGFzcyhlbGVtZW50LCBjbGFzc05hbWUsIGNhbGxiYWNrKSB7XHJcbiAgICBlbGVtZW50LnJlbW92ZUNsYXNzKGNsYXNzTmFtZSk7XHJcbiAgICBpZiAoY2FsbGJhY2spIHtcclxuICAgICAgY2FsbGJhY2soKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHJldHVybiB7XHJcbiAgICBiZWZvcmVBZGRDbGFzczogZnVuY3Rpb24oZWxlbWVudCwgY2xhc3NOYW1lLCBkb25lKSB7XHJcbiAgICAgIGlmIChjbGFzc05hbWUgPT09ICdhY3RpdmUnKSB7XHJcbiAgICAgICAgdmFyIHN0b3BwZWQgPSBmYWxzZTtcclxuICAgICAgICB2YXIgZGlyZWN0aW9uID0gZWxlbWVudC5kYXRhKFNMSURFX0RJUkVDVElPTik7XHJcbiAgICAgICAgdmFyIGRpcmVjdGlvbkNsYXNzID0gZGlyZWN0aW9uID09PSAnbmV4dCcgPyAnbGVmdCcgOiAncmlnaHQnO1xyXG4gICAgICAgIHZhciByZW1vdmVDbGFzc0ZuID0gcmVtb3ZlQ2xhc3MuYmluZCh0aGlzLCBlbGVtZW50LFxyXG4gICAgICAgICAgZGlyZWN0aW9uQ2xhc3MgKyAnICcgKyBkaXJlY3Rpb24sIGRvbmUpO1xyXG4gICAgICAgIGVsZW1lbnQuYWRkQ2xhc3MoZGlyZWN0aW9uKTtcclxuXHJcbiAgICAgICAgJGFuaW1hdGVDc3MoZWxlbWVudCwge2FkZENsYXNzOiBkaXJlY3Rpb25DbGFzc30pXHJcbiAgICAgICAgICAuc3RhcnQoKVxyXG4gICAgICAgICAgLmRvbmUocmVtb3ZlQ2xhc3NGbik7XHJcblxyXG4gICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgIHN0b3BwZWQgPSB0cnVlO1xyXG4gICAgICAgIH07XHJcbiAgICAgIH1cclxuICAgICAgZG9uZSgpO1xyXG4gICAgfSxcclxuICAgIGJlZm9yZVJlbW92ZUNsYXNzOiBmdW5jdGlvbiAoZWxlbWVudCwgY2xhc3NOYW1lLCBkb25lKSB7XHJcbiAgICAgIGlmIChjbGFzc05hbWUgPT09ICdhY3RpdmUnKSB7XHJcbiAgICAgICAgdmFyIHN0b3BwZWQgPSBmYWxzZTtcclxuICAgICAgICB2YXIgZGlyZWN0aW9uID0gZWxlbWVudC5kYXRhKFNMSURFX0RJUkVDVElPTik7XHJcbiAgICAgICAgdmFyIGRpcmVjdGlvbkNsYXNzID0gZGlyZWN0aW9uID09PSAnbmV4dCcgPyAnbGVmdCcgOiAncmlnaHQnO1xyXG4gICAgICAgIHZhciByZW1vdmVDbGFzc0ZuID0gcmVtb3ZlQ2xhc3MuYmluZCh0aGlzLCBlbGVtZW50LCBkaXJlY3Rpb25DbGFzcywgZG9uZSk7XHJcblxyXG4gICAgICAgICRhbmltYXRlQ3NzKGVsZW1lbnQsIHthZGRDbGFzczogZGlyZWN0aW9uQ2xhc3N9KVxyXG4gICAgICAgICAgLnN0YXJ0KClcclxuICAgICAgICAgIC5kb25lKHJlbW92ZUNsYXNzRm4pO1xyXG5cclxuICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICBzdG9wcGVkID0gdHJ1ZTtcclxuICAgICAgICB9O1xyXG4gICAgICB9XHJcbiAgICAgIGRvbmUoKTtcclxuICAgIH1cclxuICB9O1xyXG59XSk7XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgndWkuYm9vdHN0cmFwLmRhdGVwYXJzZXInLCBbXSlcclxuXHJcbi5zZXJ2aWNlKCd1aWJEYXRlUGFyc2VyJywgWyckbG9nJywgJyRsb2NhbGUnLCAnZGF0ZUZpbHRlcicsICdvcmRlckJ5RmlsdGVyJywgZnVuY3Rpb24oJGxvZywgJGxvY2FsZSwgZGF0ZUZpbHRlciwgb3JkZXJCeUZpbHRlcikge1xyXG4gIC8vIFB1bGxlZCBmcm9tIGh0dHBzOi8vZ2l0aHViLmNvbS9tYm9zdG9jay9kMy9ibG9iL21hc3Rlci9zcmMvZm9ybWF0L3JlcXVvdGUuanNcclxuICB2YXIgU1BFQ0lBTF9DSEFSQUNURVJTX1JFR0VYUCA9IC9bXFxcXFxcXlxcJFxcKlxcK1xcP1xcfFxcW1xcXVxcKFxcKVxcLlxce1xcfV0vZztcclxuXHJcbiAgdmFyIGxvY2FsZUlkO1xyXG4gIHZhciBmb3JtYXRDb2RlVG9SZWdleDtcclxuXHJcbiAgdGhpcy5pbml0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICBsb2NhbGVJZCA9ICRsb2NhbGUuaWQ7XHJcblxyXG4gICAgdGhpcy5wYXJzZXJzID0ge307XHJcbiAgICB0aGlzLmZvcm1hdHRlcnMgPSB7fTtcclxuXHJcbiAgICBmb3JtYXRDb2RlVG9SZWdleCA9IFtcclxuICAgICAge1xyXG4gICAgICAgIGtleTogJ3l5eXknLFxyXG4gICAgICAgIHJlZ2V4OiAnXFxcXGR7NH0nLFxyXG4gICAgICAgIGFwcGx5OiBmdW5jdGlvbih2YWx1ZSkgeyB0aGlzLnllYXIgPSArdmFsdWU7IH0sXHJcbiAgICAgICAgZm9ybWF0dGVyOiBmdW5jdGlvbihkYXRlKSB7XHJcbiAgICAgICAgICB2YXIgX2RhdGUgPSBuZXcgRGF0ZSgpO1xyXG4gICAgICAgICAgX2RhdGUuc2V0RnVsbFllYXIoTWF0aC5hYnMoZGF0ZS5nZXRGdWxsWWVhcigpKSk7XHJcbiAgICAgICAgICByZXR1cm4gZGF0ZUZpbHRlcihfZGF0ZSwgJ3l5eXknKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICBrZXk6ICd5eScsXHJcbiAgICAgICAgcmVnZXg6ICdcXFxcZHsyfScsXHJcbiAgICAgICAgYXBwbHk6IGZ1bmN0aW9uKHZhbHVlKSB7IHZhbHVlID0gK3ZhbHVlOyB0aGlzLnllYXIgPSB2YWx1ZSA8IDY5ID8gdmFsdWUgKyAyMDAwIDogdmFsdWUgKyAxOTAwOyB9LFxyXG4gICAgICAgIGZvcm1hdHRlcjogZnVuY3Rpb24oZGF0ZSkge1xyXG4gICAgICAgICAgdmFyIF9kYXRlID0gbmV3IERhdGUoKTtcclxuICAgICAgICAgIF9kYXRlLnNldEZ1bGxZZWFyKE1hdGguYWJzKGRhdGUuZ2V0RnVsbFllYXIoKSkpO1xyXG4gICAgICAgICAgcmV0dXJuIGRhdGVGaWx0ZXIoX2RhdGUsICd5eScpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIGtleTogJ3knLFxyXG4gICAgICAgIHJlZ2V4OiAnXFxcXGR7MSw0fScsXHJcbiAgICAgICAgYXBwbHk6IGZ1bmN0aW9uKHZhbHVlKSB7IHRoaXMueWVhciA9ICt2YWx1ZTsgfSxcclxuICAgICAgICBmb3JtYXR0ZXI6IGZ1bmN0aW9uKGRhdGUpIHtcclxuICAgICAgICAgIHZhciBfZGF0ZSA9IG5ldyBEYXRlKCk7XHJcbiAgICAgICAgICBfZGF0ZS5zZXRGdWxsWWVhcihNYXRoLmFicyhkYXRlLmdldEZ1bGxZZWFyKCkpKTtcclxuICAgICAgICAgIHJldHVybiBkYXRlRmlsdGVyKF9kYXRlLCAneScpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIGtleTogJ00hJyxcclxuICAgICAgICByZWdleDogJzA/WzEtOV18MVswLTJdJyxcclxuICAgICAgICBhcHBseTogZnVuY3Rpb24odmFsdWUpIHsgdGhpcy5tb250aCA9IHZhbHVlIC0gMTsgfSxcclxuICAgICAgICBmb3JtYXR0ZXI6IGZ1bmN0aW9uKGRhdGUpIHtcclxuICAgICAgICAgIHZhciB2YWx1ZSA9IGRhdGUuZ2V0TW9udGgoKTtcclxuICAgICAgICAgIGlmICgvXlswLTldJC8udGVzdCh2YWx1ZSkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGRhdGVGaWx0ZXIoZGF0ZSwgJ01NJyk7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgcmV0dXJuIGRhdGVGaWx0ZXIoZGF0ZSwgJ00nKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICBrZXk6ICdNTU1NJyxcclxuICAgICAgICByZWdleDogJGxvY2FsZS5EQVRFVElNRV9GT1JNQVRTLk1PTlRILmpvaW4oJ3wnKSxcclxuICAgICAgICBhcHBseTogZnVuY3Rpb24odmFsdWUpIHsgdGhpcy5tb250aCA9ICRsb2NhbGUuREFURVRJTUVfRk9STUFUUy5NT05USC5pbmRleE9mKHZhbHVlKTsgfSxcclxuICAgICAgICBmb3JtYXR0ZXI6IGZ1bmN0aW9uKGRhdGUpIHsgcmV0dXJuIGRhdGVGaWx0ZXIoZGF0ZSwgJ01NTU0nKTsgfVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAga2V5OiAnTU1NJyxcclxuICAgICAgICByZWdleDogJGxvY2FsZS5EQVRFVElNRV9GT1JNQVRTLlNIT1JUTU9OVEguam9pbignfCcpLFxyXG4gICAgICAgIGFwcGx5OiBmdW5jdGlvbih2YWx1ZSkgeyB0aGlzLm1vbnRoID0gJGxvY2FsZS5EQVRFVElNRV9GT1JNQVRTLlNIT1JUTU9OVEguaW5kZXhPZih2YWx1ZSk7IH0sXHJcbiAgICAgICAgZm9ybWF0dGVyOiBmdW5jdGlvbihkYXRlKSB7IHJldHVybiBkYXRlRmlsdGVyKGRhdGUsICdNTU0nKTsgfVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAga2V5OiAnTU0nLFxyXG4gICAgICAgIHJlZ2V4OiAnMFsxLTldfDFbMC0yXScsXHJcbiAgICAgICAgYXBwbHk6IGZ1bmN0aW9uKHZhbHVlKSB7IHRoaXMubW9udGggPSB2YWx1ZSAtIDE7IH0sXHJcbiAgICAgICAgZm9ybWF0dGVyOiBmdW5jdGlvbihkYXRlKSB7IHJldHVybiBkYXRlRmlsdGVyKGRhdGUsICdNTScpOyB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICBrZXk6ICdNJyxcclxuICAgICAgICByZWdleDogJ1sxLTldfDFbMC0yXScsXHJcbiAgICAgICAgYXBwbHk6IGZ1bmN0aW9uKHZhbHVlKSB7IHRoaXMubW9udGggPSB2YWx1ZSAtIDE7IH0sXHJcbiAgICAgICAgZm9ybWF0dGVyOiBmdW5jdGlvbihkYXRlKSB7IHJldHVybiBkYXRlRmlsdGVyKGRhdGUsICdNJyk7IH1cclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIGtleTogJ2QhJyxcclxuICAgICAgICByZWdleDogJ1swLTJdP1swLTldezF9fDNbMC0xXXsxfScsXHJcbiAgICAgICAgYXBwbHk6IGZ1bmN0aW9uKHZhbHVlKSB7IHRoaXMuZGF0ZSA9ICt2YWx1ZTsgfSxcclxuICAgICAgICBmb3JtYXR0ZXI6IGZ1bmN0aW9uKGRhdGUpIHtcclxuICAgICAgICAgIHZhciB2YWx1ZSA9IGRhdGUuZ2V0RGF0ZSgpO1xyXG4gICAgICAgICAgaWYgKC9eWzEtOV0kLy50ZXN0KHZhbHVlKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gZGF0ZUZpbHRlcihkYXRlLCAnZGQnKTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICByZXR1cm4gZGF0ZUZpbHRlcihkYXRlLCAnZCcpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIGtleTogJ2RkJyxcclxuICAgICAgICByZWdleDogJ1swLTJdWzAtOV17MX18M1swLTFdezF9JyxcclxuICAgICAgICBhcHBseTogZnVuY3Rpb24odmFsdWUpIHsgdGhpcy5kYXRlID0gK3ZhbHVlOyB9LFxyXG4gICAgICAgIGZvcm1hdHRlcjogZnVuY3Rpb24oZGF0ZSkgeyByZXR1cm4gZGF0ZUZpbHRlcihkYXRlLCAnZGQnKTsgfVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAga2V5OiAnZCcsXHJcbiAgICAgICAgcmVnZXg6ICdbMS0yXT9bMC05XXsxfXwzWzAtMV17MX0nLFxyXG4gICAgICAgIGFwcGx5OiBmdW5jdGlvbih2YWx1ZSkgeyB0aGlzLmRhdGUgPSArdmFsdWU7IH0sXHJcbiAgICAgICAgZm9ybWF0dGVyOiBmdW5jdGlvbihkYXRlKSB7IHJldHVybiBkYXRlRmlsdGVyKGRhdGUsICdkJyk7IH1cclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIGtleTogJ0VFRUUnLFxyXG4gICAgICAgIHJlZ2V4OiAkbG9jYWxlLkRBVEVUSU1FX0ZPUk1BVFMuREFZLmpvaW4oJ3wnKSxcclxuICAgICAgICBmb3JtYXR0ZXI6IGZ1bmN0aW9uKGRhdGUpIHsgcmV0dXJuIGRhdGVGaWx0ZXIoZGF0ZSwgJ0VFRUUnKTsgfVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAga2V5OiAnRUVFJyxcclxuICAgICAgICByZWdleDogJGxvY2FsZS5EQVRFVElNRV9GT1JNQVRTLlNIT1JUREFZLmpvaW4oJ3wnKSxcclxuICAgICAgICBmb3JtYXR0ZXI6IGZ1bmN0aW9uKGRhdGUpIHsgcmV0dXJuIGRhdGVGaWx0ZXIoZGF0ZSwgJ0VFRScpOyB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICBrZXk6ICdISCcsXHJcbiAgICAgICAgcmVnZXg6ICcoPzowfDEpWzAtOV18MlswLTNdJyxcclxuICAgICAgICBhcHBseTogZnVuY3Rpb24odmFsdWUpIHsgdGhpcy5ob3VycyA9ICt2YWx1ZTsgfSxcclxuICAgICAgICBmb3JtYXR0ZXI6IGZ1bmN0aW9uKGRhdGUpIHsgcmV0dXJuIGRhdGVGaWx0ZXIoZGF0ZSwgJ0hIJyk7IH1cclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIGtleTogJ2hoJyxcclxuICAgICAgICByZWdleDogJzBbMC05XXwxWzAtMl0nLFxyXG4gICAgICAgIGFwcGx5OiBmdW5jdGlvbih2YWx1ZSkgeyB0aGlzLmhvdXJzID0gK3ZhbHVlOyB9LFxyXG4gICAgICAgIGZvcm1hdHRlcjogZnVuY3Rpb24oZGF0ZSkgeyByZXR1cm4gZGF0ZUZpbHRlcihkYXRlLCAnaGgnKTsgfVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAga2V5OiAnSCcsXHJcbiAgICAgICAgcmVnZXg6ICcxP1swLTldfDJbMC0zXScsXHJcbiAgICAgICAgYXBwbHk6IGZ1bmN0aW9uKHZhbHVlKSB7IHRoaXMuaG91cnMgPSArdmFsdWU7IH0sXHJcbiAgICAgICAgZm9ybWF0dGVyOiBmdW5jdGlvbihkYXRlKSB7IHJldHVybiBkYXRlRmlsdGVyKGRhdGUsICdIJyk7IH1cclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIGtleTogJ2gnLFxyXG4gICAgICAgIHJlZ2V4OiAnWzAtOV18MVswLTJdJyxcclxuICAgICAgICBhcHBseTogZnVuY3Rpb24odmFsdWUpIHsgdGhpcy5ob3VycyA9ICt2YWx1ZTsgfSxcclxuICAgICAgICBmb3JtYXR0ZXI6IGZ1bmN0aW9uKGRhdGUpIHsgcmV0dXJuIGRhdGVGaWx0ZXIoZGF0ZSwgJ2gnKTsgfVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAga2V5OiAnbW0nLFxyXG4gICAgICAgIHJlZ2V4OiAnWzAtNV1bMC05XScsXHJcbiAgICAgICAgYXBwbHk6IGZ1bmN0aW9uKHZhbHVlKSB7IHRoaXMubWludXRlcyA9ICt2YWx1ZTsgfSxcclxuICAgICAgICBmb3JtYXR0ZXI6IGZ1bmN0aW9uKGRhdGUpIHsgcmV0dXJuIGRhdGVGaWx0ZXIoZGF0ZSwgJ21tJyk7IH1cclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIGtleTogJ20nLFxyXG4gICAgICAgIHJlZ2V4OiAnWzAtOV18WzEtNV1bMC05XScsXHJcbiAgICAgICAgYXBwbHk6IGZ1bmN0aW9uKHZhbHVlKSB7IHRoaXMubWludXRlcyA9ICt2YWx1ZTsgfSxcclxuICAgICAgICBmb3JtYXR0ZXI6IGZ1bmN0aW9uKGRhdGUpIHsgcmV0dXJuIGRhdGVGaWx0ZXIoZGF0ZSwgJ20nKTsgfVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAga2V5OiAnc3NzJyxcclxuICAgICAgICByZWdleDogJ1swLTldWzAtOV1bMC05XScsXHJcbiAgICAgICAgYXBwbHk6IGZ1bmN0aW9uKHZhbHVlKSB7IHRoaXMubWlsbGlzZWNvbmRzID0gK3ZhbHVlOyB9LFxyXG4gICAgICAgIGZvcm1hdHRlcjogZnVuY3Rpb24oZGF0ZSkgeyByZXR1cm4gZGF0ZUZpbHRlcihkYXRlLCAnc3NzJyk7IH1cclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIGtleTogJ3NzJyxcclxuICAgICAgICByZWdleDogJ1swLTVdWzAtOV0nLFxyXG4gICAgICAgIGFwcGx5OiBmdW5jdGlvbih2YWx1ZSkgeyB0aGlzLnNlY29uZHMgPSArdmFsdWU7IH0sXHJcbiAgICAgICAgZm9ybWF0dGVyOiBmdW5jdGlvbihkYXRlKSB7IHJldHVybiBkYXRlRmlsdGVyKGRhdGUsICdzcycpOyB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICBrZXk6ICdzJyxcclxuICAgICAgICByZWdleDogJ1swLTldfFsxLTVdWzAtOV0nLFxyXG4gICAgICAgIGFwcGx5OiBmdW5jdGlvbih2YWx1ZSkgeyB0aGlzLnNlY29uZHMgPSArdmFsdWU7IH0sXHJcbiAgICAgICAgZm9ybWF0dGVyOiBmdW5jdGlvbihkYXRlKSB7IHJldHVybiBkYXRlRmlsdGVyKGRhdGUsICdzJyk7IH1cclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIGtleTogJ2EnLFxyXG4gICAgICAgIHJlZ2V4OiAkbG9jYWxlLkRBVEVUSU1FX0ZPUk1BVFMuQU1QTVMuam9pbignfCcpLFxyXG4gICAgICAgIGFwcGx5OiBmdW5jdGlvbih2YWx1ZSkge1xyXG4gICAgICAgICAgaWYgKHRoaXMuaG91cnMgPT09IDEyKSB7XHJcbiAgICAgICAgICAgIHRoaXMuaG91cnMgPSAwO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIGlmICh2YWx1ZSA9PT0gJ1BNJykge1xyXG4gICAgICAgICAgICB0aGlzLmhvdXJzICs9IDEyO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZm9ybWF0dGVyOiBmdW5jdGlvbihkYXRlKSB7IHJldHVybiBkYXRlRmlsdGVyKGRhdGUsICdhJyk7IH1cclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIGtleTogJ1onLFxyXG4gICAgICAgIHJlZ2V4OiAnWystXVxcXFxkezR9JyxcclxuICAgICAgICBhcHBseTogZnVuY3Rpb24odmFsdWUpIHtcclxuICAgICAgICAgIHZhciBtYXRjaGVzID0gdmFsdWUubWF0Y2goLyhbKy1dKShcXGR7Mn0pKFxcZHsyfSkvKSxcclxuICAgICAgICAgICAgc2lnbiA9IG1hdGNoZXNbMV0sXHJcbiAgICAgICAgICAgIGhvdXJzID0gbWF0Y2hlc1syXSxcclxuICAgICAgICAgICAgbWludXRlcyA9IG1hdGNoZXNbM107XHJcbiAgICAgICAgICB0aGlzLmhvdXJzICs9IHRvSW50KHNpZ24gKyBob3Vycyk7XHJcbiAgICAgICAgICB0aGlzLm1pbnV0ZXMgKz0gdG9JbnQoc2lnbiArIG1pbnV0ZXMpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZm9ybWF0dGVyOiBmdW5jdGlvbihkYXRlKSB7XHJcbiAgICAgICAgICByZXR1cm4gZGF0ZUZpbHRlcihkYXRlLCAnWicpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIGtleTogJ3d3JyxcclxuICAgICAgICByZWdleDogJ1swLTRdWzAtOV18NVswLTNdJyxcclxuICAgICAgICBmb3JtYXR0ZXI6IGZ1bmN0aW9uKGRhdGUpIHsgcmV0dXJuIGRhdGVGaWx0ZXIoZGF0ZSwgJ3d3Jyk7IH1cclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIGtleTogJ3cnLFxyXG4gICAgICAgIHJlZ2V4OiAnWzAtOV18WzEtNF1bMC05XXw1WzAtM10nLFxyXG4gICAgICAgIGZvcm1hdHRlcjogZnVuY3Rpb24oZGF0ZSkgeyByZXR1cm4gZGF0ZUZpbHRlcihkYXRlLCAndycpOyB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICBrZXk6ICdHR0dHJyxcclxuICAgICAgICByZWdleDogJGxvY2FsZS5EQVRFVElNRV9GT1JNQVRTLkVSQU5BTUVTLmpvaW4oJ3wnKS5yZXBsYWNlKC9cXHMvZywgJ1xcXFxzJyksXHJcbiAgICAgICAgZm9ybWF0dGVyOiBmdW5jdGlvbihkYXRlKSB7IHJldHVybiBkYXRlRmlsdGVyKGRhdGUsICdHR0dHJyk7IH1cclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIGtleTogJ0dHRycsXHJcbiAgICAgICAgcmVnZXg6ICRsb2NhbGUuREFURVRJTUVfRk9STUFUUy5FUkFTLmpvaW4oJ3wnKSxcclxuICAgICAgICBmb3JtYXR0ZXI6IGZ1bmN0aW9uKGRhdGUpIHsgcmV0dXJuIGRhdGVGaWx0ZXIoZGF0ZSwgJ0dHRycpOyB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICBrZXk6ICdHRycsXHJcbiAgICAgICAgcmVnZXg6ICRsb2NhbGUuREFURVRJTUVfRk9STUFUUy5FUkFTLmpvaW4oJ3wnKSxcclxuICAgICAgICBmb3JtYXR0ZXI6IGZ1bmN0aW9uKGRhdGUpIHsgcmV0dXJuIGRhdGVGaWx0ZXIoZGF0ZSwgJ0dHJyk7IH1cclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIGtleTogJ0cnLFxyXG4gICAgICAgIHJlZ2V4OiAkbG9jYWxlLkRBVEVUSU1FX0ZPUk1BVFMuRVJBUy5qb2luKCd8JyksXHJcbiAgICAgICAgZm9ybWF0dGVyOiBmdW5jdGlvbihkYXRlKSB7IHJldHVybiBkYXRlRmlsdGVyKGRhdGUsICdHJyk7IH1cclxuICAgICAgfVxyXG4gICAgXTtcclxuICB9O1xyXG5cclxuICB0aGlzLmluaXQoKTtcclxuXHJcbiAgZnVuY3Rpb24gY3JlYXRlUGFyc2VyKGZvcm1hdCkge1xyXG4gICAgdmFyIG1hcCA9IFtdLCByZWdleCA9IGZvcm1hdC5zcGxpdCgnJyk7XHJcblxyXG4gICAgLy8gY2hlY2sgZm9yIGxpdGVyYWwgdmFsdWVzXHJcbiAgICB2YXIgcXVvdGVJbmRleCA9IGZvcm1hdC5pbmRleE9mKCdcXCcnKTtcclxuICAgIGlmIChxdW90ZUluZGV4ID4gLTEpIHtcclxuICAgICAgdmFyIGluTGl0ZXJhbCA9IGZhbHNlO1xyXG4gICAgICBmb3JtYXQgPSBmb3JtYXQuc3BsaXQoJycpO1xyXG4gICAgICBmb3IgKHZhciBpID0gcXVvdGVJbmRleDsgaSA8IGZvcm1hdC5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGlmIChpbkxpdGVyYWwpIHtcclxuICAgICAgICAgIGlmIChmb3JtYXRbaV0gPT09ICdcXCcnKSB7XHJcbiAgICAgICAgICAgIGlmIChpICsgMSA8IGZvcm1hdC5sZW5ndGggJiYgZm9ybWF0W2krMV0gPT09ICdcXCcnKSB7IC8vIGVzY2FwZWQgc2luZ2xlIHF1b3RlXHJcbiAgICAgICAgICAgICAgZm9ybWF0W2krMV0gPSAnJCc7XHJcbiAgICAgICAgICAgICAgcmVnZXhbaSsxXSA9ICcnO1xyXG4gICAgICAgICAgICB9IGVsc2UgeyAvLyBlbmQgb2YgbGl0ZXJhbFxyXG4gICAgICAgICAgICAgIHJlZ2V4W2ldID0gJyc7XHJcbiAgICAgICAgICAgICAgaW5MaXRlcmFsID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGZvcm1hdFtpXSA9ICckJztcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgaWYgKGZvcm1hdFtpXSA9PT0gJ1xcJycpIHsgLy8gc3RhcnQgb2YgbGl0ZXJhbFxyXG4gICAgICAgICAgICBmb3JtYXRbaV0gPSAnJCc7XHJcbiAgICAgICAgICAgIHJlZ2V4W2ldID0gJyc7XHJcbiAgICAgICAgICAgIGluTGl0ZXJhbCA9IHRydWU7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICBmb3JtYXQgPSBmb3JtYXQuam9pbignJyk7XHJcbiAgICB9XHJcblxyXG4gICAgYW5ndWxhci5mb3JFYWNoKGZvcm1hdENvZGVUb1JlZ2V4LCBmdW5jdGlvbihkYXRhKSB7XHJcbiAgICAgIHZhciBpbmRleCA9IGZvcm1hdC5pbmRleE9mKGRhdGEua2V5KTtcclxuXHJcbiAgICAgIGlmIChpbmRleCA+IC0xKSB7XHJcbiAgICAgICAgZm9ybWF0ID0gZm9ybWF0LnNwbGl0KCcnKTtcclxuXHJcbiAgICAgICAgcmVnZXhbaW5kZXhdID0gJygnICsgZGF0YS5yZWdleCArICcpJztcclxuICAgICAgICBmb3JtYXRbaW5kZXhdID0gJyQnOyAvLyBDdXN0b20gc3ltYm9sIHRvIGRlZmluZSBjb25zdW1lZCBwYXJ0IG9mIGZvcm1hdFxyXG4gICAgICAgIGZvciAodmFyIGkgPSBpbmRleCArIDEsIG4gPSBpbmRleCArIGRhdGEua2V5Lmxlbmd0aDsgaSA8IG47IGkrKykge1xyXG4gICAgICAgICAgcmVnZXhbaV0gPSAnJztcclxuICAgICAgICAgIGZvcm1hdFtpXSA9ICckJztcclxuICAgICAgICB9XHJcbiAgICAgICAgZm9ybWF0ID0gZm9ybWF0LmpvaW4oJycpO1xyXG5cclxuICAgICAgICBtYXAucHVzaCh7XHJcbiAgICAgICAgICBpbmRleDogaW5kZXgsXHJcbiAgICAgICAgICBrZXk6IGRhdGEua2V5LFxyXG4gICAgICAgICAgYXBwbHk6IGRhdGEuYXBwbHksXHJcbiAgICAgICAgICBtYXRjaGVyOiBkYXRhLnJlZ2V4XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgIHJlZ2V4OiBuZXcgUmVnRXhwKCdeJyArIHJlZ2V4LmpvaW4oJycpICsgJyQnKSxcclxuICAgICAgbWFwOiBvcmRlckJ5RmlsdGVyKG1hcCwgJ2luZGV4JylcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBjcmVhdGVGb3JtYXR0ZXIoZm9ybWF0KSB7XHJcbiAgICB2YXIgZm9ybWF0dGVycyA9IFtdO1xyXG4gICAgdmFyIGkgPSAwO1xyXG4gICAgdmFyIGZvcm1hdHRlciwgbGl0ZXJhbElkeDtcclxuICAgIHdoaWxlIChpIDwgZm9ybWF0Lmxlbmd0aCkge1xyXG4gICAgICBpZiAoYW5ndWxhci5pc051bWJlcihsaXRlcmFsSWR4KSkge1xyXG4gICAgICAgIGlmIChmb3JtYXQuY2hhckF0KGkpID09PSAnXFwnJykge1xyXG4gICAgICAgICAgaWYgKGkgKyAxID49IGZvcm1hdC5sZW5ndGggfHwgZm9ybWF0LmNoYXJBdChpICsgMSkgIT09ICdcXCcnKSB7XHJcbiAgICAgICAgICAgIGZvcm1hdHRlcnMucHVzaChjb25zdHJ1Y3RMaXRlcmFsRm9ybWF0dGVyKGZvcm1hdCwgbGl0ZXJhbElkeCwgaSkpO1xyXG4gICAgICAgICAgICBsaXRlcmFsSWR4ID0gbnVsbDtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2UgaWYgKGkgPT09IGZvcm1hdC5sZW5ndGgpIHtcclxuICAgICAgICAgIHdoaWxlIChsaXRlcmFsSWR4IDwgZm9ybWF0Lmxlbmd0aCkge1xyXG4gICAgICAgICAgICBmb3JtYXR0ZXIgPSBjb25zdHJ1Y3RGb3JtYXR0ZXJGcm9tSWR4KGZvcm1hdCwgbGl0ZXJhbElkeCk7XHJcbiAgICAgICAgICAgIGZvcm1hdHRlcnMucHVzaChmb3JtYXR0ZXIpO1xyXG4gICAgICAgICAgICBsaXRlcmFsSWR4ID0gZm9ybWF0dGVyLmVuZElkeDtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGkrKztcclxuICAgICAgICBjb250aW51ZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKGZvcm1hdC5jaGFyQXQoaSkgPT09ICdcXCcnKSB7XHJcbiAgICAgICAgbGl0ZXJhbElkeCA9IGk7XHJcbiAgICAgICAgaSsrO1xyXG4gICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBmb3JtYXR0ZXIgPSBjb25zdHJ1Y3RGb3JtYXR0ZXJGcm9tSWR4KGZvcm1hdCwgaSk7XHJcblxyXG4gICAgICBmb3JtYXR0ZXJzLnB1c2goZm9ybWF0dGVyLnBhcnNlcik7XHJcbiAgICAgIGkgPSBmb3JtYXR0ZXIuZW5kSWR4O1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBmb3JtYXR0ZXJzO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gY29uc3RydWN0TGl0ZXJhbEZvcm1hdHRlcihmb3JtYXQsIGxpdGVyYWxJZHgsIGVuZElkeCkge1xyXG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xyXG4gICAgICByZXR1cm4gZm9ybWF0LnN1YnN0cihsaXRlcmFsSWR4ICsgMSwgZW5kSWR4IC0gbGl0ZXJhbElkeCAtIDEpO1xyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGNvbnN0cnVjdEZvcm1hdHRlckZyb21JZHgoZm9ybWF0LCBpKSB7XHJcbiAgICB2YXIgY3VycmVudFBvc1N0ciA9IGZvcm1hdC5zdWJzdHIoaSk7XHJcbiAgICBmb3IgKHZhciBqID0gMDsgaiA8IGZvcm1hdENvZGVUb1JlZ2V4Lmxlbmd0aDsgaisrKSB7XHJcbiAgICAgIGlmIChuZXcgUmVnRXhwKCdeJyArIGZvcm1hdENvZGVUb1JlZ2V4W2pdLmtleSkudGVzdChjdXJyZW50UG9zU3RyKSkge1xyXG4gICAgICAgIHZhciBkYXRhID0gZm9ybWF0Q29kZVRvUmVnZXhbal07XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIGVuZElkeDogaSArIGRhdGEua2V5Lmxlbmd0aCxcclxuICAgICAgICAgIHBhcnNlcjogZGF0YS5mb3JtYXR0ZXJcclxuICAgICAgICB9O1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgZW5kSWR4OiBpICsgMSxcclxuICAgICAgcGFyc2VyOiBmdW5jdGlvbigpIHtcclxuICAgICAgICByZXR1cm4gY3VycmVudFBvc1N0ci5jaGFyQXQoMCk7XHJcbiAgICAgIH1cclxuICAgIH07XHJcbiAgfVxyXG5cclxuICB0aGlzLmZpbHRlciA9IGZ1bmN0aW9uKGRhdGUsIGZvcm1hdCkge1xyXG4gICAgaWYgKCFhbmd1bGFyLmlzRGF0ZShkYXRlKSB8fCBpc05hTihkYXRlKSB8fCAhZm9ybWF0KSB7XHJcbiAgICAgIHJldHVybiAnJztcclxuICAgIH1cclxuXHJcbiAgICBmb3JtYXQgPSAkbG9jYWxlLkRBVEVUSU1FX0ZPUk1BVFNbZm9ybWF0XSB8fCBmb3JtYXQ7XHJcblxyXG4gICAgaWYgKCRsb2NhbGUuaWQgIT09IGxvY2FsZUlkKSB7XHJcbiAgICAgIHRoaXMuaW5pdCgpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICghdGhpcy5mb3JtYXR0ZXJzW2Zvcm1hdF0pIHtcclxuICAgICAgdGhpcy5mb3JtYXR0ZXJzW2Zvcm1hdF0gPSBjcmVhdGVGb3JtYXR0ZXIoZm9ybWF0KTtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgZm9ybWF0dGVycyA9IHRoaXMuZm9ybWF0dGVyc1tmb3JtYXRdO1xyXG5cclxuICAgIHJldHVybiBmb3JtYXR0ZXJzLnJlZHVjZShmdW5jdGlvbihzdHIsIGZvcm1hdHRlcikge1xyXG4gICAgICByZXR1cm4gc3RyICsgZm9ybWF0dGVyKGRhdGUpO1xyXG4gICAgfSwgJycpO1xyXG4gIH07XHJcblxyXG4gIHRoaXMucGFyc2UgPSBmdW5jdGlvbihpbnB1dCwgZm9ybWF0LCBiYXNlRGF0ZSkge1xyXG4gICAgaWYgKCFhbmd1bGFyLmlzU3RyaW5nKGlucHV0KSB8fCAhZm9ybWF0KSB7XHJcbiAgICAgIHJldHVybiBpbnB1dDtcclxuICAgIH1cclxuXHJcbiAgICBmb3JtYXQgPSAkbG9jYWxlLkRBVEVUSU1FX0ZPUk1BVFNbZm9ybWF0XSB8fCBmb3JtYXQ7XHJcbiAgICBmb3JtYXQgPSBmb3JtYXQucmVwbGFjZShTUEVDSUFMX0NIQVJBQ1RFUlNfUkVHRVhQLCAnXFxcXCQmJyk7XHJcblxyXG4gICAgaWYgKCRsb2NhbGUuaWQgIT09IGxvY2FsZUlkKSB7XHJcbiAgICAgIHRoaXMuaW5pdCgpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICghdGhpcy5wYXJzZXJzW2Zvcm1hdF0pIHtcclxuICAgICAgdGhpcy5wYXJzZXJzW2Zvcm1hdF0gPSBjcmVhdGVQYXJzZXIoZm9ybWF0LCAnYXBwbHknKTtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgcGFyc2VyID0gdGhpcy5wYXJzZXJzW2Zvcm1hdF0sXHJcbiAgICAgICAgcmVnZXggPSBwYXJzZXIucmVnZXgsXHJcbiAgICAgICAgbWFwID0gcGFyc2VyLm1hcCxcclxuICAgICAgICByZXN1bHRzID0gaW5wdXQubWF0Y2gocmVnZXgpLFxyXG4gICAgICAgIHR6T2Zmc2V0ID0gZmFsc2U7XHJcbiAgICBpZiAocmVzdWx0cyAmJiByZXN1bHRzLmxlbmd0aCkge1xyXG4gICAgICB2YXIgZmllbGRzLCBkdDtcclxuICAgICAgaWYgKGFuZ3VsYXIuaXNEYXRlKGJhc2VEYXRlKSAmJiAhaXNOYU4oYmFzZURhdGUuZ2V0VGltZSgpKSkge1xyXG4gICAgICAgIGZpZWxkcyA9IHtcclxuICAgICAgICAgIHllYXI6IGJhc2VEYXRlLmdldEZ1bGxZZWFyKCksXHJcbiAgICAgICAgICBtb250aDogYmFzZURhdGUuZ2V0TW9udGgoKSxcclxuICAgICAgICAgIGRhdGU6IGJhc2VEYXRlLmdldERhdGUoKSxcclxuICAgICAgICAgIGhvdXJzOiBiYXNlRGF0ZS5nZXRIb3VycygpLFxyXG4gICAgICAgICAgbWludXRlczogYmFzZURhdGUuZ2V0TWludXRlcygpLFxyXG4gICAgICAgICAgc2Vjb25kczogYmFzZURhdGUuZ2V0U2Vjb25kcygpLFxyXG4gICAgICAgICAgbWlsbGlzZWNvbmRzOiBiYXNlRGF0ZS5nZXRNaWxsaXNlY29uZHMoKVxyXG4gICAgICAgIH07XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgaWYgKGJhc2VEYXRlKSB7XHJcbiAgICAgICAgICAkbG9nLndhcm4oJ2RhdGVwYXJzZXI6JywgJ2Jhc2VEYXRlIGlzIG5vdCBhIHZhbGlkIGRhdGUnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZmllbGRzID0geyB5ZWFyOiAxOTAwLCBtb250aDogMCwgZGF0ZTogMSwgaG91cnM6IDAsIG1pbnV0ZXM6IDAsIHNlY29uZHM6IDAsIG1pbGxpc2Vjb25kczogMCB9O1xyXG4gICAgICB9XHJcblxyXG4gICAgICBmb3IgKHZhciBpID0gMSwgbiA9IHJlc3VsdHMubGVuZ3RoOyBpIDwgbjsgaSsrKSB7XHJcbiAgICAgICAgdmFyIG1hcHBlciA9IG1hcFtpIC0gMV07XHJcbiAgICAgICAgaWYgKG1hcHBlci5tYXRjaGVyID09PSAnWicpIHtcclxuICAgICAgICAgIHR6T2Zmc2V0ID0gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChtYXBwZXIuYXBwbHkpIHtcclxuICAgICAgICAgIG1hcHBlci5hcHBseS5jYWxsKGZpZWxkcywgcmVzdWx0c1tpXSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICB2YXIgZGF0ZXNldHRlciA9IHR6T2Zmc2V0ID8gRGF0ZS5wcm90b3R5cGUuc2V0VVRDRnVsbFllYXIgOlxyXG4gICAgICAgIERhdGUucHJvdG90eXBlLnNldEZ1bGxZZWFyO1xyXG4gICAgICB2YXIgdGltZXNldHRlciA9IHR6T2Zmc2V0ID8gRGF0ZS5wcm90b3R5cGUuc2V0VVRDSG91cnMgOlxyXG4gICAgICAgIERhdGUucHJvdG90eXBlLnNldEhvdXJzO1xyXG5cclxuICAgICAgaWYgKGlzVmFsaWQoZmllbGRzLnllYXIsIGZpZWxkcy5tb250aCwgZmllbGRzLmRhdGUpKSB7XHJcbiAgICAgICAgaWYgKGFuZ3VsYXIuaXNEYXRlKGJhc2VEYXRlKSAmJiAhaXNOYU4oYmFzZURhdGUuZ2V0VGltZSgpKSAmJiAhdHpPZmZzZXQpIHtcclxuICAgICAgICAgIGR0ID0gbmV3IERhdGUoYmFzZURhdGUpO1xyXG4gICAgICAgICAgZGF0ZXNldHRlci5jYWxsKGR0LCBmaWVsZHMueWVhciwgZmllbGRzLm1vbnRoLCBmaWVsZHMuZGF0ZSk7XHJcbiAgICAgICAgICB0aW1lc2V0dGVyLmNhbGwoZHQsIGZpZWxkcy5ob3VycywgZmllbGRzLm1pbnV0ZXMsXHJcbiAgICAgICAgICAgIGZpZWxkcy5zZWNvbmRzLCBmaWVsZHMubWlsbGlzZWNvbmRzKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgZHQgPSBuZXcgRGF0ZSgwKTtcclxuICAgICAgICAgIGRhdGVzZXR0ZXIuY2FsbChkdCwgZmllbGRzLnllYXIsIGZpZWxkcy5tb250aCwgZmllbGRzLmRhdGUpO1xyXG4gICAgICAgICAgdGltZXNldHRlci5jYWxsKGR0LCBmaWVsZHMuaG91cnMgfHwgMCwgZmllbGRzLm1pbnV0ZXMgfHwgMCxcclxuICAgICAgICAgICAgZmllbGRzLnNlY29uZHMgfHwgMCwgZmllbGRzLm1pbGxpc2Vjb25kcyB8fCAwKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiBkdDtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICAvLyBDaGVjayBpZiBkYXRlIGlzIHZhbGlkIGZvciBzcGVjaWZpYyBtb250aCAoYW5kIHllYXIgZm9yIEZlYnJ1YXJ5KS5cclxuICAvLyBNb250aDogMCA9IEphbiwgMSA9IEZlYiwgZXRjXHJcbiAgZnVuY3Rpb24gaXNWYWxpZCh5ZWFyLCBtb250aCwgZGF0ZSkge1xyXG4gICAgaWYgKGRhdGUgPCAxKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAobW9udGggPT09IDEgJiYgZGF0ZSA+IDI4KSB7XHJcbiAgICAgIHJldHVybiBkYXRlID09PSAyOSAmJiAoeWVhciAlIDQgPT09IDAgJiYgeWVhciAlIDEwMCAhPT0gMCB8fCB5ZWFyICUgNDAwID09PSAwKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAobW9udGggPT09IDMgfHwgbW9udGggPT09IDUgfHwgbW9udGggPT09IDggfHwgbW9udGggPT09IDEwKSB7XHJcbiAgICAgIHJldHVybiBkYXRlIDwgMzE7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRydWU7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiB0b0ludChzdHIpIHtcclxuICAgIHJldHVybiBwYXJzZUludChzdHIsIDEwKTtcclxuICB9XHJcblxyXG4gIHRoaXMudG9UaW1lem9uZSA9IHRvVGltZXpvbmU7XHJcbiAgdGhpcy5mcm9tVGltZXpvbmUgPSBmcm9tVGltZXpvbmU7XHJcbiAgdGhpcy50aW1lem9uZVRvT2Zmc2V0ID0gdGltZXpvbmVUb09mZnNldDtcclxuICB0aGlzLmFkZERhdGVNaW51dGVzID0gYWRkRGF0ZU1pbnV0ZXM7XHJcbiAgdGhpcy5jb252ZXJ0VGltZXpvbmVUb0xvY2FsID0gY29udmVydFRpbWV6b25lVG9Mb2NhbDtcclxuXHJcbiAgZnVuY3Rpb24gdG9UaW1lem9uZShkYXRlLCB0aW1lem9uZSkge1xyXG4gICAgcmV0dXJuIGRhdGUgJiYgdGltZXpvbmUgPyBjb252ZXJ0VGltZXpvbmVUb0xvY2FsKGRhdGUsIHRpbWV6b25lKSA6IGRhdGU7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBmcm9tVGltZXpvbmUoZGF0ZSwgdGltZXpvbmUpIHtcclxuICAgIHJldHVybiBkYXRlICYmIHRpbWV6b25lID8gY29udmVydFRpbWV6b25lVG9Mb2NhbChkYXRlLCB0aW1lem9uZSwgdHJ1ZSkgOiBkYXRlO1xyXG4gIH1cclxuXHJcbiAgLy9odHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9hbmd1bGFyLmpzL2Jsb2IvNjIyYzQyMTY5Njk5ZWMwN2ZjNmRhYWExOWZlNmQyMjRlNWQyZjcwZS9zcmMvQW5ndWxhci5qcyNMMTIwN1xyXG4gIGZ1bmN0aW9uIHRpbWV6b25lVG9PZmZzZXQodGltZXpvbmUsIGZhbGxiYWNrKSB7XHJcbiAgICB0aW1lem9uZSA9IHRpbWV6b25lLnJlcGxhY2UoLzovZywgJycpO1xyXG4gICAgdmFyIHJlcXVlc3RlZFRpbWV6b25lT2Zmc2V0ID0gRGF0ZS5wYXJzZSgnSmFuIDAxLCAxOTcwIDAwOjAwOjAwICcgKyB0aW1lem9uZSkgLyA2MDAwMDtcclxuICAgIHJldHVybiBpc05hTihyZXF1ZXN0ZWRUaW1lem9uZU9mZnNldCkgPyBmYWxsYmFjayA6IHJlcXVlc3RlZFRpbWV6b25lT2Zmc2V0O1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gYWRkRGF0ZU1pbnV0ZXMoZGF0ZSwgbWludXRlcykge1xyXG4gICAgZGF0ZSA9IG5ldyBEYXRlKGRhdGUuZ2V0VGltZSgpKTtcclxuICAgIGRhdGUuc2V0TWludXRlcyhkYXRlLmdldE1pbnV0ZXMoKSArIG1pbnV0ZXMpO1xyXG4gICAgcmV0dXJuIGRhdGU7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBjb252ZXJ0VGltZXpvbmVUb0xvY2FsKGRhdGUsIHRpbWV6b25lLCByZXZlcnNlKSB7XHJcbiAgICByZXZlcnNlID0gcmV2ZXJzZSA/IC0xIDogMTtcclxuICAgIHZhciBkYXRlVGltZXpvbmVPZmZzZXQgPSBkYXRlLmdldFRpbWV6b25lT2Zmc2V0KCk7XHJcbiAgICB2YXIgdGltZXpvbmVPZmZzZXQgPSB0aW1lem9uZVRvT2Zmc2V0KHRpbWV6b25lLCBkYXRlVGltZXpvbmVPZmZzZXQpO1xyXG4gICAgcmV0dXJuIGFkZERhdGVNaW51dGVzKGRhdGUsIHJldmVyc2UgKiAodGltZXpvbmVPZmZzZXQgLSBkYXRlVGltZXpvbmVPZmZzZXQpKTtcclxuICB9XHJcbn1dKTtcclxuXHJcbi8vIEF2b2lkaW5nIHVzZSBvZiBuZy1jbGFzcyBhcyBpdCBjcmVhdGVzIGEgbG90IG9mIHdhdGNoZXJzIHdoZW4gYSBjbGFzcyBpcyB0byBiZSBhcHBsaWVkIHRvXHJcbi8vIGF0IG1vc3Qgb25lIGVsZW1lbnQuXHJcbmFuZ3VsYXIubW9kdWxlKCd1aS5ib290c3RyYXAuaXNDbGFzcycsIFtdKVxyXG4uZGlyZWN0aXZlKCd1aWJJc0NsYXNzJywgW1xyXG4gICAgICAgICAnJGFuaW1hdGUnLFxyXG5mdW5jdGlvbiAoJGFuaW1hdGUpIHtcclxuICAvLyAgICAgICAgICAgICAgICAgICAgMTExMTExMTEgICAgICAgICAgMjIyMjIyMjJcclxuICB2YXIgT05fUkVHRVhQID0gL15cXHMqKFtcXHNcXFNdKz8pXFxzK29uXFxzKyhbXFxzXFxTXSs/KVxccyokLztcclxuICAvLyAgICAgICAgICAgICAgICAgICAgMTExMTExMTEgICAgICAgICAgIDIyMjIyMjIyXHJcbiAgdmFyIElTX1JFR0VYUCA9IC9eXFxzKihbXFxzXFxTXSs/KVxccytmb3JcXHMrKFtcXHNcXFNdKz8pXFxzKiQvO1xyXG5cclxuICB2YXIgZGF0YVBlclRyYWNrZWQgPSB7fTtcclxuXHJcbiAgcmV0dXJuIHtcclxuICAgIHJlc3RyaWN0OiAnQScsXHJcbiAgICBjb21waWxlOiBmdW5jdGlvbih0RWxlbWVudCwgdEF0dHJzKSB7XHJcbiAgICAgIHZhciBsaW5rZWRTY29wZXMgPSBbXTtcclxuICAgICAgdmFyIGluc3RhbmNlcyA9IFtdO1xyXG4gICAgICB2YXIgZXhwVG9EYXRhID0ge307XHJcbiAgICAgIHZhciBsYXN0QWN0aXZhdGVkID0gbnVsbDtcclxuICAgICAgdmFyIG9uRXhwTWF0Y2hlcyA9IHRBdHRycy51aWJJc0NsYXNzLm1hdGNoKE9OX1JFR0VYUCk7XHJcbiAgICAgIHZhciBvbkV4cCA9IG9uRXhwTWF0Y2hlc1syXTtcclxuICAgICAgdmFyIGV4cHNTdHIgPSBvbkV4cE1hdGNoZXNbMV07XHJcbiAgICAgIHZhciBleHBzID0gZXhwc1N0ci5zcGxpdCgnLCcpO1xyXG5cclxuICAgICAgcmV0dXJuIGxpbmtGbjtcclxuXHJcbiAgICAgIGZ1bmN0aW9uIGxpbmtGbihzY29wZSwgZWxlbWVudCwgYXR0cnMpIHtcclxuICAgICAgICBsaW5rZWRTY29wZXMucHVzaChzY29wZSk7XHJcbiAgICAgICAgaW5zdGFuY2VzLnB1c2goe1xyXG4gICAgICAgICAgc2NvcGU6IHNjb3BlLFxyXG4gICAgICAgICAgZWxlbWVudDogZWxlbWVudFxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBleHBzLmZvckVhY2goZnVuY3Rpb24oZXhwLCBrKSB7XHJcbiAgICAgICAgICBhZGRGb3JFeHAoZXhwLCBzY29wZSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHNjb3BlLiRvbignJGRlc3Ryb3knLCByZW1vdmVTY29wZSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGZ1bmN0aW9uIGFkZEZvckV4cChleHAsIHNjb3BlKSB7XHJcbiAgICAgICAgdmFyIG1hdGNoZXMgPSBleHAubWF0Y2goSVNfUkVHRVhQKTtcclxuICAgICAgICB2YXIgY2xhenogPSBzY29wZS4kZXZhbChtYXRjaGVzWzFdKTtcclxuICAgICAgICB2YXIgY29tcGFyZVdpdGhFeHAgPSBtYXRjaGVzWzJdO1xyXG4gICAgICAgIHZhciBkYXRhID0gZXhwVG9EYXRhW2V4cF07XHJcbiAgICAgICAgaWYgKCFkYXRhKSB7XHJcbiAgICAgICAgICB2YXIgd2F0Y2hGbiA9IGZ1bmN0aW9uKGNvbXBhcmVXaXRoVmFsKSB7XHJcbiAgICAgICAgICAgIHZhciBuZXdBY3RpdmF0ZWQgPSBudWxsO1xyXG4gICAgICAgICAgICBpbnN0YW5jZXMuc29tZShmdW5jdGlvbihpbnN0YW5jZSkge1xyXG4gICAgICAgICAgICAgIHZhciB0aGlzVmFsID0gaW5zdGFuY2Uuc2NvcGUuJGV2YWwob25FeHApO1xyXG4gICAgICAgICAgICAgIGlmICh0aGlzVmFsID09PSBjb21wYXJlV2l0aFZhbCkge1xyXG4gICAgICAgICAgICAgICAgbmV3QWN0aXZhdGVkID0gaW5zdGFuY2U7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBpZiAoZGF0YS5sYXN0QWN0aXZhdGVkICE9PSBuZXdBY3RpdmF0ZWQpIHtcclxuICAgICAgICAgICAgICBpZiAoZGF0YS5sYXN0QWN0aXZhdGVkKSB7XHJcbiAgICAgICAgICAgICAgICAkYW5pbWF0ZS5yZW1vdmVDbGFzcyhkYXRhLmxhc3RBY3RpdmF0ZWQuZWxlbWVudCwgY2xhenopO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICBpZiAobmV3QWN0aXZhdGVkKSB7XHJcbiAgICAgICAgICAgICAgICAkYW5pbWF0ZS5hZGRDbGFzcyhuZXdBY3RpdmF0ZWQuZWxlbWVudCwgY2xhenopO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICBkYXRhLmxhc3RBY3RpdmF0ZWQgPSBuZXdBY3RpdmF0ZWQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH07XHJcbiAgICAgICAgICBleHBUb0RhdGFbZXhwXSA9IGRhdGEgPSB7XHJcbiAgICAgICAgICAgIGxhc3RBY3RpdmF0ZWQ6IG51bGwsXHJcbiAgICAgICAgICAgIHNjb3BlOiBzY29wZSxcclxuICAgICAgICAgICAgd2F0Y2hGbjogd2F0Y2hGbixcclxuICAgICAgICAgICAgY29tcGFyZVdpdGhFeHA6IGNvbXBhcmVXaXRoRXhwLFxyXG4gICAgICAgICAgICB3YXRjaGVyOiBzY29wZS4kd2F0Y2goY29tcGFyZVdpdGhFeHAsIHdhdGNoRm4pXHJcbiAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgICAgICBkYXRhLndhdGNoRm4oc2NvcGUuJGV2YWwoY29tcGFyZVdpdGhFeHApKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgZnVuY3Rpb24gcmVtb3ZlU2NvcGUoZSkge1xyXG4gICAgICAgIHZhciByZW1vdmVkU2NvcGUgPSBlLnRhcmdldFNjb3BlO1xyXG4gICAgICAgIHZhciBpbmRleCA9IGxpbmtlZFNjb3Blcy5pbmRleE9mKHJlbW92ZWRTY29wZSk7XHJcbiAgICAgICAgbGlua2VkU2NvcGVzLnNwbGljZShpbmRleCwgMSk7XHJcbiAgICAgICAgaW5zdGFuY2VzLnNwbGljZShpbmRleCwgMSk7XHJcbiAgICAgICAgaWYgKGxpbmtlZFNjb3Blcy5sZW5ndGgpIHtcclxuICAgICAgICAgIHZhciBuZXdXYXRjaFNjb3BlID0gbGlua2VkU2NvcGVzWzBdO1xyXG4gICAgICAgICAgYW5ndWxhci5mb3JFYWNoKGV4cFRvRGF0YSwgZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgICAgICAgICBpZiAoZGF0YS5zY29wZSA9PT0gcmVtb3ZlZFNjb3BlKSB7XHJcbiAgICAgICAgICAgICAgZGF0YS53YXRjaGVyID0gbmV3V2F0Y2hTY29wZS4kd2F0Y2goZGF0YS5jb21wYXJlV2l0aEV4cCwgZGF0YS53YXRjaEZuKTtcclxuICAgICAgICAgICAgICBkYXRhLnNjb3BlID0gbmV3V2F0Y2hTY29wZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGV4cFRvRGF0YSA9IHt9O1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH07XHJcbn1dKTtcclxuYW5ndWxhci5tb2R1bGUoJ3VpLmJvb3RzdHJhcC5kYXRlcGlja2VyJywgWyd1aS5ib290c3RyYXAuZGF0ZXBhcnNlcicsICd1aS5ib290c3RyYXAuaXNDbGFzcyddKVxyXG5cclxuLnZhbHVlKCckZGF0ZXBpY2tlclN1cHByZXNzRXJyb3InLCBmYWxzZSlcclxuXHJcbi52YWx1ZSgnJGRhdGVwaWNrZXJMaXRlcmFsV2FybmluZycsIHRydWUpXHJcblxyXG4uY29uc3RhbnQoJ3VpYkRhdGVwaWNrZXJDb25maWcnLCB7XHJcbiAgZGF0ZXBpY2tlck1vZGU6ICdkYXknLFxyXG4gIGZvcm1hdERheTogJ2RkJyxcclxuICBmb3JtYXRNb250aDogJ01NTU0nLFxyXG4gIGZvcm1hdFllYXI6ICd5eXl5JyxcclxuICBmb3JtYXREYXlIZWFkZXI6ICdFRUUnLFxyXG4gIGZvcm1hdERheVRpdGxlOiAnTU1NTSB5eXl5JyxcclxuICBmb3JtYXRNb250aFRpdGxlOiAneXl5eScsXHJcbiAgbWF4RGF0ZTogbnVsbCxcclxuICBtYXhNb2RlOiAneWVhcicsXHJcbiAgbWluRGF0ZTogbnVsbCxcclxuICBtaW5Nb2RlOiAnZGF5JyxcclxuICBtb250aENvbHVtbnM6IDMsXHJcbiAgbmdNb2RlbE9wdGlvbnM6IHt9LFxyXG4gIHNob3J0Y3V0UHJvcGFnYXRpb246IGZhbHNlLFxyXG4gIHNob3dXZWVrczogdHJ1ZSxcclxuICB5ZWFyQ29sdW1uczogNSxcclxuICB5ZWFyUm93czogNFxyXG59KVxyXG5cclxuLmNvbnRyb2xsZXIoJ1VpYkRhdGVwaWNrZXJDb250cm9sbGVyJywgWyckc2NvcGUnLCAnJGVsZW1lbnQnLCAnJGF0dHJzJywgJyRwYXJzZScsICckaW50ZXJwb2xhdGUnLCAnJGxvY2FsZScsICckbG9nJywgJ2RhdGVGaWx0ZXInLCAndWliRGF0ZXBpY2tlckNvbmZpZycsICckZGF0ZXBpY2tlckxpdGVyYWxXYXJuaW5nJywgJyRkYXRlcGlja2VyU3VwcHJlc3NFcnJvcicsICd1aWJEYXRlUGFyc2VyJyxcclxuICBmdW5jdGlvbigkc2NvcGUsICRlbGVtZW50LCAkYXR0cnMsICRwYXJzZSwgJGludGVycG9sYXRlLCAkbG9jYWxlLCAkbG9nLCBkYXRlRmlsdGVyLCBkYXRlcGlja2VyQ29uZmlnLCAkZGF0ZXBpY2tlckxpdGVyYWxXYXJuaW5nLCAkZGF0ZXBpY2tlclN1cHByZXNzRXJyb3IsIGRhdGVQYXJzZXIpIHtcclxuICB2YXIgc2VsZiA9IHRoaXMsXHJcbiAgICAgIG5nTW9kZWxDdHJsID0geyAkc2V0Vmlld1ZhbHVlOiBhbmd1bGFyLm5vb3AgfSwgLy8gbnVsbE1vZGVsQ3RybDtcclxuICAgICAgbmdNb2RlbE9wdGlvbnMgPSB7fSxcclxuICAgICAgd2F0Y2hMaXN0ZW5lcnMgPSBbXTtcclxuXHJcbiAgJGVsZW1lbnQuYWRkQ2xhc3MoJ3VpYi1kYXRlcGlja2VyJyk7XHJcbiAgJGF0dHJzLiRzZXQoJ3JvbGUnLCAnYXBwbGljYXRpb24nKTtcclxuXHJcbiAgaWYgKCEkc2NvcGUuZGF0ZXBpY2tlck9wdGlvbnMpIHtcclxuICAgICRzY29wZS5kYXRlcGlja2VyT3B0aW9ucyA9IHt9O1xyXG4gIH1cclxuXHJcbiAgLy8gTW9kZXMgY2hhaW5cclxuICB0aGlzLm1vZGVzID0gWydkYXknLCAnbW9udGgnLCAneWVhciddO1xyXG5cclxuICBbXHJcbiAgICAnY3VzdG9tQ2xhc3MnLFxyXG4gICAgJ2RhdGVEaXNhYmxlZCcsXHJcbiAgICAnZGF0ZXBpY2tlck1vZGUnLFxyXG4gICAgJ2Zvcm1hdERheScsXHJcbiAgICAnZm9ybWF0RGF5SGVhZGVyJyxcclxuICAgICdmb3JtYXREYXlUaXRsZScsXHJcbiAgICAnZm9ybWF0TW9udGgnLFxyXG4gICAgJ2Zvcm1hdE1vbnRoVGl0bGUnLFxyXG4gICAgJ2Zvcm1hdFllYXInLFxyXG4gICAgJ21heERhdGUnLFxyXG4gICAgJ21heE1vZGUnLFxyXG4gICAgJ21pbkRhdGUnLFxyXG4gICAgJ21pbk1vZGUnLFxyXG4gICAgJ21vbnRoQ29sdW1ucycsXHJcbiAgICAnc2hvd1dlZWtzJyxcclxuICAgICdzaG9ydGN1dFByb3BhZ2F0aW9uJyxcclxuICAgICdzdGFydGluZ0RheScsXHJcbiAgICAneWVhckNvbHVtbnMnLFxyXG4gICAgJ3llYXJSb3dzJ1xyXG4gIF0uZm9yRWFjaChmdW5jdGlvbihrZXkpIHtcclxuICAgIHN3aXRjaCAoa2V5KSB7XHJcbiAgICAgIGNhc2UgJ2N1c3RvbUNsYXNzJzpcclxuICAgICAgY2FzZSAnZGF0ZURpc2FibGVkJzpcclxuICAgICAgICAkc2NvcGVba2V5XSA9ICRzY29wZS5kYXRlcGlja2VyT3B0aW9uc1trZXldIHx8IGFuZ3VsYXIubm9vcDtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAnZGF0ZXBpY2tlck1vZGUnOlxyXG4gICAgICAgICRzY29wZS5kYXRlcGlja2VyTW9kZSA9IGFuZ3VsYXIuaXNEZWZpbmVkKCRzY29wZS5kYXRlcGlja2VyT3B0aW9ucy5kYXRlcGlja2VyTW9kZSkgP1xyXG4gICAgICAgICAgJHNjb3BlLmRhdGVwaWNrZXJPcHRpb25zLmRhdGVwaWNrZXJNb2RlIDogZGF0ZXBpY2tlckNvbmZpZy5kYXRlcGlja2VyTW9kZTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAnZm9ybWF0RGF5JzpcclxuICAgICAgY2FzZSAnZm9ybWF0RGF5SGVhZGVyJzpcclxuICAgICAgY2FzZSAnZm9ybWF0RGF5VGl0bGUnOlxyXG4gICAgICBjYXNlICdmb3JtYXRNb250aCc6XHJcbiAgICAgIGNhc2UgJ2Zvcm1hdE1vbnRoVGl0bGUnOlxyXG4gICAgICBjYXNlICdmb3JtYXRZZWFyJzpcclxuICAgICAgICBzZWxmW2tleV0gPSBhbmd1bGFyLmlzRGVmaW5lZCgkc2NvcGUuZGF0ZXBpY2tlck9wdGlvbnNba2V5XSkgP1xyXG4gICAgICAgICAgJGludGVycG9sYXRlKCRzY29wZS5kYXRlcGlja2VyT3B0aW9uc1trZXldKSgkc2NvcGUuJHBhcmVudCkgOlxyXG4gICAgICAgICAgZGF0ZXBpY2tlckNvbmZpZ1trZXldO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlICdtb250aENvbHVtbnMnOlxyXG4gICAgICBjYXNlICdzaG93V2Vla3MnOlxyXG4gICAgICBjYXNlICdzaG9ydGN1dFByb3BhZ2F0aW9uJzpcclxuICAgICAgY2FzZSAneWVhckNvbHVtbnMnOlxyXG4gICAgICBjYXNlICd5ZWFyUm93cyc6XHJcbiAgICAgICAgc2VsZltrZXldID0gYW5ndWxhci5pc0RlZmluZWQoJHNjb3BlLmRhdGVwaWNrZXJPcHRpb25zW2tleV0pID9cclxuICAgICAgICAgICRzY29wZS5kYXRlcGlja2VyT3B0aW9uc1trZXldIDogZGF0ZXBpY2tlckNvbmZpZ1trZXldO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlICdzdGFydGluZ0RheSc6XHJcbiAgICAgICAgaWYgKGFuZ3VsYXIuaXNEZWZpbmVkKCRzY29wZS5kYXRlcGlja2VyT3B0aW9ucy5zdGFydGluZ0RheSkpIHtcclxuICAgICAgICAgIHNlbGYuc3RhcnRpbmdEYXkgPSAkc2NvcGUuZGF0ZXBpY2tlck9wdGlvbnMuc3RhcnRpbmdEYXk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChhbmd1bGFyLmlzTnVtYmVyKGRhdGVwaWNrZXJDb25maWcuc3RhcnRpbmdEYXkpKSB7XHJcbiAgICAgICAgICBzZWxmLnN0YXJ0aW5nRGF5ID0gZGF0ZXBpY2tlckNvbmZpZy5zdGFydGluZ0RheTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgc2VsZi5zdGFydGluZ0RheSA9ICgkbG9jYWxlLkRBVEVUSU1FX0ZPUk1BVFMuRklSU1REQVlPRldFRUsgKyA4KSAlIDc7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAnbWF4RGF0ZSc6XHJcbiAgICAgIGNhc2UgJ21pbkRhdGUnOlxyXG4gICAgICAgICRzY29wZS4kd2F0Y2goJ2RhdGVwaWNrZXJPcHRpb25zLicgKyBrZXksIGZ1bmN0aW9uKHZhbHVlKSB7XHJcbiAgICAgICAgICBpZiAodmFsdWUpIHtcclxuICAgICAgICAgICAgaWYgKGFuZ3VsYXIuaXNEYXRlKHZhbHVlKSkge1xyXG4gICAgICAgICAgICAgIHNlbGZba2V5XSA9IGRhdGVQYXJzZXIuZnJvbVRpbWV6b25lKG5ldyBEYXRlKHZhbHVlKSwgbmdNb2RlbE9wdGlvbnMudGltZXpvbmUpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIGlmICgkZGF0ZXBpY2tlckxpdGVyYWxXYXJuaW5nKSB7XHJcbiAgICAgICAgICAgICAgICAkbG9nLndhcm4oJ0xpdGVyYWwgZGF0ZSBzdXBwb3J0IGhhcyBiZWVuIGRlcHJlY2F0ZWQsIHBsZWFzZSBzd2l0Y2ggdG8gZGF0ZSBvYmplY3QgdXNhZ2UnKTtcclxuICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgIHNlbGZba2V5XSA9IG5ldyBEYXRlKGRhdGVGaWx0ZXIodmFsdWUsICdtZWRpdW0nKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHNlbGZba2V5XSA9IGRhdGVwaWNrZXJDb25maWdba2V5XSA/XHJcbiAgICAgICAgICAgICAgZGF0ZVBhcnNlci5mcm9tVGltZXpvbmUobmV3IERhdGUoZGF0ZXBpY2tlckNvbmZpZ1trZXldKSwgbmdNb2RlbE9wdGlvbnMudGltZXpvbmUpIDpcclxuICAgICAgICAgICAgICBudWxsO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIHNlbGYucmVmcmVzaFZpZXcoKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgJ21heE1vZGUnOlxyXG4gICAgICBjYXNlICdtaW5Nb2RlJzpcclxuICAgICAgICBpZiAoJHNjb3BlLmRhdGVwaWNrZXJPcHRpb25zW2tleV0pIHtcclxuICAgICAgICAgICRzY29wZS4kd2F0Y2goZnVuY3Rpb24oKSB7IHJldHVybiAkc2NvcGUuZGF0ZXBpY2tlck9wdGlvbnNba2V5XTsgfSwgZnVuY3Rpb24odmFsdWUpIHtcclxuICAgICAgICAgICAgc2VsZltrZXldID0gJHNjb3BlW2tleV0gPSBhbmd1bGFyLmlzRGVmaW5lZCh2YWx1ZSkgPyB2YWx1ZSA6ICRzY29wZS5kYXRlcGlja2VyT3B0aW9uc1trZXldO1xyXG4gICAgICAgICAgICBpZiAoa2V5ID09PSAnbWluTW9kZScgJiYgc2VsZi5tb2Rlcy5pbmRleE9mKCRzY29wZS5kYXRlcGlja2VyT3B0aW9ucy5kYXRlcGlja2VyTW9kZSkgPCBzZWxmLm1vZGVzLmluZGV4T2Yoc2VsZltrZXldKSB8fFxyXG4gICAgICAgICAgICAgIGtleSA9PT0gJ21heE1vZGUnICYmIHNlbGYubW9kZXMuaW5kZXhPZigkc2NvcGUuZGF0ZXBpY2tlck9wdGlvbnMuZGF0ZXBpY2tlck1vZGUpID4gc2VsZi5tb2Rlcy5pbmRleE9mKHNlbGZba2V5XSkpIHtcclxuICAgICAgICAgICAgICAkc2NvcGUuZGF0ZXBpY2tlck1vZGUgPSBzZWxmW2tleV07XHJcbiAgICAgICAgICAgICAgJHNjb3BlLmRhdGVwaWNrZXJPcHRpb25zLmRhdGVwaWNrZXJNb2RlID0gc2VsZltrZXldO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgc2VsZltrZXldID0gJHNjb3BlW2tleV0gPSBkYXRlcGlja2VyQ29uZmlnW2tleV0gfHwgbnVsbDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG4gIH0pO1xyXG5cclxuICAkc2NvcGUudW5pcXVlSWQgPSAnZGF0ZXBpY2tlci0nICsgJHNjb3BlLiRpZCArICctJyArIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDEwMDAwKTtcclxuXHJcbiAgJHNjb3BlLmRpc2FibGVkID0gYW5ndWxhci5pc0RlZmluZWQoJGF0dHJzLmRpc2FibGVkKSB8fCBmYWxzZTtcclxuICBpZiAoYW5ndWxhci5pc0RlZmluZWQoJGF0dHJzLm5nRGlzYWJsZWQpKSB7XHJcbiAgICB3YXRjaExpc3RlbmVycy5wdXNoKCRzY29wZS4kcGFyZW50LiR3YXRjaCgkYXR0cnMubmdEaXNhYmxlZCwgZnVuY3Rpb24oZGlzYWJsZWQpIHtcclxuICAgICAgJHNjb3BlLmRpc2FibGVkID0gZGlzYWJsZWQ7XHJcbiAgICAgIHNlbGYucmVmcmVzaFZpZXcoKTtcclxuICAgIH0pKTtcclxuICB9XHJcblxyXG4gICRzY29wZS5pc0FjdGl2ZSA9IGZ1bmN0aW9uKGRhdGVPYmplY3QpIHtcclxuICAgIGlmIChzZWxmLmNvbXBhcmUoZGF0ZU9iamVjdC5kYXRlLCBzZWxmLmFjdGl2ZURhdGUpID09PSAwKSB7XHJcbiAgICAgICRzY29wZS5hY3RpdmVEYXRlSWQgPSBkYXRlT2JqZWN0LnVpZDtcclxuICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfTtcclxuXHJcbiAgdGhpcy5pbml0ID0gZnVuY3Rpb24obmdNb2RlbEN0cmxfKSB7XHJcbiAgICBuZ01vZGVsQ3RybCA9IG5nTW9kZWxDdHJsXztcclxuICAgIG5nTW9kZWxPcHRpb25zID0gbmdNb2RlbEN0cmxfLiRvcHRpb25zIHx8XHJcbiAgICAgICRzY29wZS5kYXRlcGlja2VyT3B0aW9ucy5uZ01vZGVsT3B0aW9ucyB8fFxyXG4gICAgICBkYXRlcGlja2VyQ29uZmlnLm5nTW9kZWxPcHRpb25zO1xyXG4gICAgaWYgKCRzY29wZS5kYXRlcGlja2VyT3B0aW9ucy5pbml0RGF0ZSkge1xyXG4gICAgICBzZWxmLmFjdGl2ZURhdGUgPSBkYXRlUGFyc2VyLmZyb21UaW1lem9uZSgkc2NvcGUuZGF0ZXBpY2tlck9wdGlvbnMuaW5pdERhdGUsIG5nTW9kZWxPcHRpb25zLnRpbWV6b25lKSB8fCBuZXcgRGF0ZSgpO1xyXG4gICAgICAkc2NvcGUuJHdhdGNoKCdkYXRlcGlja2VyT3B0aW9ucy5pbml0RGF0ZScsIGZ1bmN0aW9uKGluaXREYXRlKSB7XHJcbiAgICAgICAgaWYgKGluaXREYXRlICYmIChuZ01vZGVsQ3RybC4kaXNFbXB0eShuZ01vZGVsQ3RybC4kbW9kZWxWYWx1ZSkgfHwgbmdNb2RlbEN0cmwuJGludmFsaWQpKSB7XHJcbiAgICAgICAgICBzZWxmLmFjdGl2ZURhdGUgPSBkYXRlUGFyc2VyLmZyb21UaW1lem9uZShpbml0RGF0ZSwgbmdNb2RlbE9wdGlvbnMudGltZXpvbmUpO1xyXG4gICAgICAgICAgc2VsZi5yZWZyZXNoVmlldygpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBzZWxmLmFjdGl2ZURhdGUgPSBuZXcgRGF0ZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBkYXRlID0gbmdNb2RlbEN0cmwuJG1vZGVsVmFsdWUgPyBuZXcgRGF0ZShuZ01vZGVsQ3RybC4kbW9kZWxWYWx1ZSkgOiBuZXcgRGF0ZSgpO1xyXG4gICAgdGhpcy5hY3RpdmVEYXRlID0gIWlzTmFOKGRhdGUpID9cclxuICAgICAgZGF0ZVBhcnNlci5mcm9tVGltZXpvbmUoZGF0ZSwgbmdNb2RlbE9wdGlvbnMudGltZXpvbmUpIDpcclxuICAgICAgZGF0ZVBhcnNlci5mcm9tVGltZXpvbmUobmV3IERhdGUoKSwgbmdNb2RlbE9wdGlvbnMudGltZXpvbmUpO1xyXG5cclxuICAgIG5nTW9kZWxDdHJsLiRyZW5kZXIgPSBmdW5jdGlvbigpIHtcclxuICAgICAgc2VsZi5yZW5kZXIoKTtcclxuICAgIH07XHJcbiAgfTtcclxuXHJcbiAgdGhpcy5yZW5kZXIgPSBmdW5jdGlvbigpIHtcclxuICAgIGlmIChuZ01vZGVsQ3RybC4kdmlld1ZhbHVlKSB7XHJcbiAgICAgIHZhciBkYXRlID0gbmV3IERhdGUobmdNb2RlbEN0cmwuJHZpZXdWYWx1ZSksXHJcbiAgICAgICAgICBpc1ZhbGlkID0gIWlzTmFOKGRhdGUpO1xyXG5cclxuICAgICAgaWYgKGlzVmFsaWQpIHtcclxuICAgICAgICB0aGlzLmFjdGl2ZURhdGUgPSBkYXRlUGFyc2VyLmZyb21UaW1lem9uZShkYXRlLCBuZ01vZGVsT3B0aW9ucy50aW1lem9uZSk7XHJcbiAgICAgIH0gZWxzZSBpZiAoISRkYXRlcGlja2VyU3VwcHJlc3NFcnJvcikge1xyXG4gICAgICAgICRsb2cuZXJyb3IoJ0RhdGVwaWNrZXIgZGlyZWN0aXZlOiBcIm5nLW1vZGVsXCIgdmFsdWUgbXVzdCBiZSBhIERhdGUgb2JqZWN0Jyk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHRoaXMucmVmcmVzaFZpZXcoKTtcclxuICB9O1xyXG5cclxuICB0aGlzLnJlZnJlc2hWaWV3ID0gZnVuY3Rpb24oKSB7XHJcbiAgICBpZiAodGhpcy5lbGVtZW50KSB7XHJcbiAgICAgICRzY29wZS5zZWxlY3RlZER0ID0gbnVsbDtcclxuICAgICAgdGhpcy5fcmVmcmVzaFZpZXcoKTtcclxuICAgICAgaWYgKCRzY29wZS5hY3RpdmVEdCkge1xyXG4gICAgICAgICRzY29wZS5hY3RpdmVEYXRlSWQgPSAkc2NvcGUuYWN0aXZlRHQudWlkO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB2YXIgZGF0ZSA9IG5nTW9kZWxDdHJsLiR2aWV3VmFsdWUgPyBuZXcgRGF0ZShuZ01vZGVsQ3RybC4kdmlld1ZhbHVlKSA6IG51bGw7XHJcbiAgICAgIGRhdGUgPSBkYXRlUGFyc2VyLmZyb21UaW1lem9uZShkYXRlLCBuZ01vZGVsT3B0aW9ucy50aW1lem9uZSk7XHJcbiAgICAgIG5nTW9kZWxDdHJsLiRzZXRWYWxpZGl0eSgnZGF0ZURpc2FibGVkJywgIWRhdGUgfHxcclxuICAgICAgICB0aGlzLmVsZW1lbnQgJiYgIXRoaXMuaXNEaXNhYmxlZChkYXRlKSk7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgdGhpcy5jcmVhdGVEYXRlT2JqZWN0ID0gZnVuY3Rpb24oZGF0ZSwgZm9ybWF0KSB7XHJcbiAgICB2YXIgbW9kZWwgPSBuZ01vZGVsQ3RybC4kdmlld1ZhbHVlID8gbmV3IERhdGUobmdNb2RlbEN0cmwuJHZpZXdWYWx1ZSkgOiBudWxsO1xyXG4gICAgbW9kZWwgPSBkYXRlUGFyc2VyLmZyb21UaW1lem9uZShtb2RlbCwgbmdNb2RlbE9wdGlvbnMudGltZXpvbmUpO1xyXG4gICAgdmFyIHRvZGF5ID0gbmV3IERhdGUoKTtcclxuICAgIHRvZGF5ID0gZGF0ZVBhcnNlci5mcm9tVGltZXpvbmUodG9kYXksIG5nTW9kZWxPcHRpb25zLnRpbWV6b25lKTtcclxuICAgIHZhciB0aW1lID0gdGhpcy5jb21wYXJlKGRhdGUsIHRvZGF5KTtcclxuICAgIHZhciBkdCA9IHtcclxuICAgICAgZGF0ZTogZGF0ZSxcclxuICAgICAgbGFiZWw6IGRhdGVQYXJzZXIuZmlsdGVyKGRhdGUsIGZvcm1hdCksXHJcbiAgICAgIHNlbGVjdGVkOiBtb2RlbCAmJiB0aGlzLmNvbXBhcmUoZGF0ZSwgbW9kZWwpID09PSAwLFxyXG4gICAgICBkaXNhYmxlZDogdGhpcy5pc0Rpc2FibGVkKGRhdGUpLFxyXG4gICAgICBwYXN0OiB0aW1lIDwgMCxcclxuICAgICAgY3VycmVudDogdGltZSA9PT0gMCxcclxuICAgICAgZnV0dXJlOiB0aW1lID4gMCxcclxuICAgICAgY3VzdG9tQ2xhc3M6IHRoaXMuY3VzdG9tQ2xhc3MoZGF0ZSkgfHwgbnVsbFxyXG4gICAgfTtcclxuXHJcbiAgICBpZiAobW9kZWwgJiYgdGhpcy5jb21wYXJlKGRhdGUsIG1vZGVsKSA9PT0gMCkge1xyXG4gICAgICAkc2NvcGUuc2VsZWN0ZWREdCA9IGR0O1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChzZWxmLmFjdGl2ZURhdGUgJiYgdGhpcy5jb21wYXJlKGR0LmRhdGUsIHNlbGYuYWN0aXZlRGF0ZSkgPT09IDApIHtcclxuICAgICAgJHNjb3BlLmFjdGl2ZUR0ID0gZHQ7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGR0O1xyXG4gIH07XHJcblxyXG4gIHRoaXMuaXNEaXNhYmxlZCA9IGZ1bmN0aW9uKGRhdGUpIHtcclxuICAgIHJldHVybiAkc2NvcGUuZGlzYWJsZWQgfHxcclxuICAgICAgdGhpcy5taW5EYXRlICYmIHRoaXMuY29tcGFyZShkYXRlLCB0aGlzLm1pbkRhdGUpIDwgMCB8fFxyXG4gICAgICB0aGlzLm1heERhdGUgJiYgdGhpcy5jb21wYXJlKGRhdGUsIHRoaXMubWF4RGF0ZSkgPiAwIHx8XHJcbiAgICAgICRzY29wZS5kYXRlRGlzYWJsZWQgJiYgJHNjb3BlLmRhdGVEaXNhYmxlZCh7ZGF0ZTogZGF0ZSwgbW9kZTogJHNjb3BlLmRhdGVwaWNrZXJNb2RlfSk7XHJcbiAgfTtcclxuXHJcbiAgdGhpcy5jdXN0b21DbGFzcyA9IGZ1bmN0aW9uKGRhdGUpIHtcclxuICAgIHJldHVybiAkc2NvcGUuY3VzdG9tQ2xhc3Moe2RhdGU6IGRhdGUsIG1vZGU6ICRzY29wZS5kYXRlcGlja2VyTW9kZX0pO1xyXG4gIH07XHJcblxyXG4gIC8vIFNwbGl0IGFycmF5IGludG8gc21hbGxlciBhcnJheXNcclxuICB0aGlzLnNwbGl0ID0gZnVuY3Rpb24oYXJyLCBzaXplKSB7XHJcbiAgICB2YXIgYXJyYXlzID0gW107XHJcbiAgICB3aGlsZSAoYXJyLmxlbmd0aCA+IDApIHtcclxuICAgICAgYXJyYXlzLnB1c2goYXJyLnNwbGljZSgwLCBzaXplKSk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gYXJyYXlzO1xyXG4gIH07XHJcblxyXG4gICRzY29wZS5zZWxlY3QgPSBmdW5jdGlvbihkYXRlKSB7XHJcbiAgICBpZiAoJHNjb3BlLmRhdGVwaWNrZXJNb2RlID09PSBzZWxmLm1pbk1vZGUpIHtcclxuICAgICAgdmFyIGR0ID0gbmdNb2RlbEN0cmwuJHZpZXdWYWx1ZSA/IGRhdGVQYXJzZXIuZnJvbVRpbWV6b25lKG5ldyBEYXRlKG5nTW9kZWxDdHJsLiR2aWV3VmFsdWUpLCBuZ01vZGVsT3B0aW9ucy50aW1lem9uZSkgOiBuZXcgRGF0ZSgwLCAwLCAwLCAwLCAwLCAwLCAwKTtcclxuICAgICAgZHQuc2V0RnVsbFllYXIoZGF0ZS5nZXRGdWxsWWVhcigpLCBkYXRlLmdldE1vbnRoKCksIGRhdGUuZ2V0RGF0ZSgpKTtcclxuICAgICAgZHQgPSBkYXRlUGFyc2VyLnRvVGltZXpvbmUoZHQsIG5nTW9kZWxPcHRpb25zLnRpbWV6b25lKTtcclxuICAgICAgbmdNb2RlbEN0cmwuJHNldFZpZXdWYWx1ZShkdCk7XHJcbiAgICAgIG5nTW9kZWxDdHJsLiRyZW5kZXIoKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHNlbGYuYWN0aXZlRGF0ZSA9IGRhdGU7XHJcbiAgICAgIHNldE1vZGUoc2VsZi5tb2Rlc1tzZWxmLm1vZGVzLmluZGV4T2YoJHNjb3BlLmRhdGVwaWNrZXJNb2RlKSAtIDFdKTtcclxuXHJcbiAgICAgICRzY29wZS4kZW1pdCgndWliOmRhdGVwaWNrZXIubW9kZScpO1xyXG4gICAgfVxyXG5cclxuICAgICRzY29wZS4kYnJvYWRjYXN0KCd1aWI6ZGF0ZXBpY2tlci5mb2N1cycpO1xyXG4gIH07XHJcblxyXG4gICRzY29wZS5tb3ZlID0gZnVuY3Rpb24oZGlyZWN0aW9uKSB7XHJcbiAgICB2YXIgeWVhciA9IHNlbGYuYWN0aXZlRGF0ZS5nZXRGdWxsWWVhcigpICsgZGlyZWN0aW9uICogKHNlbGYuc3RlcC55ZWFycyB8fCAwKSxcclxuICAgICAgICBtb250aCA9IHNlbGYuYWN0aXZlRGF0ZS5nZXRNb250aCgpICsgZGlyZWN0aW9uICogKHNlbGYuc3RlcC5tb250aHMgfHwgMCk7XHJcbiAgICBzZWxmLmFjdGl2ZURhdGUuc2V0RnVsbFllYXIoeWVhciwgbW9udGgsIDEpO1xyXG4gICAgc2VsZi5yZWZyZXNoVmlldygpO1xyXG4gIH07XHJcblxyXG4gICRzY29wZS50b2dnbGVNb2RlID0gZnVuY3Rpb24oZGlyZWN0aW9uKSB7XHJcbiAgICBkaXJlY3Rpb24gPSBkaXJlY3Rpb24gfHwgMTtcclxuXHJcbiAgICBpZiAoJHNjb3BlLmRhdGVwaWNrZXJNb2RlID09PSBzZWxmLm1heE1vZGUgJiYgZGlyZWN0aW9uID09PSAxIHx8XHJcbiAgICAgICRzY29wZS5kYXRlcGlja2VyTW9kZSA9PT0gc2VsZi5taW5Nb2RlICYmIGRpcmVjdGlvbiA9PT0gLTEpIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIHNldE1vZGUoc2VsZi5tb2Rlc1tzZWxmLm1vZGVzLmluZGV4T2YoJHNjb3BlLmRhdGVwaWNrZXJNb2RlKSArIGRpcmVjdGlvbl0pO1xyXG5cclxuICAgICRzY29wZS4kZW1pdCgndWliOmRhdGVwaWNrZXIubW9kZScpO1xyXG4gIH07XHJcblxyXG4gIC8vIEtleSBldmVudCBtYXBwZXJcclxuICAkc2NvcGUua2V5cyA9IHsgMTM6ICdlbnRlcicsIDMyOiAnc3BhY2UnLCAzMzogJ3BhZ2V1cCcsIDM0OiAncGFnZWRvd24nLCAzNTogJ2VuZCcsIDM2OiAnaG9tZScsIDM3OiAnbGVmdCcsIDM4OiAndXAnLCAzOTogJ3JpZ2h0JywgNDA6ICdkb3duJyB9O1xyXG5cclxuICB2YXIgZm9jdXNFbGVtZW50ID0gZnVuY3Rpb24oKSB7XHJcbiAgICBzZWxmLmVsZW1lbnRbMF0uZm9jdXMoKTtcclxuICB9O1xyXG5cclxuICAvLyBMaXN0ZW4gZm9yIGZvY3VzIHJlcXVlc3RzIGZyb20gcG9wdXAgZGlyZWN0aXZlXHJcbiAgJHNjb3BlLiRvbigndWliOmRhdGVwaWNrZXIuZm9jdXMnLCBmb2N1c0VsZW1lbnQpO1xyXG5cclxuICAkc2NvcGUua2V5ZG93biA9IGZ1bmN0aW9uKGV2dCkge1xyXG4gICAgdmFyIGtleSA9ICRzY29wZS5rZXlzW2V2dC53aGljaF07XHJcblxyXG4gICAgaWYgKCFrZXkgfHwgZXZ0LnNoaWZ0S2V5IHx8IGV2dC5hbHRLZXkgfHwgJHNjb3BlLmRpc2FibGVkKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBldnQucHJldmVudERlZmF1bHQoKTtcclxuICAgIGlmICghc2VsZi5zaG9ydGN1dFByb3BhZ2F0aW9uKSB7XHJcbiAgICAgIGV2dC5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoa2V5ID09PSAnZW50ZXInIHx8IGtleSA9PT0gJ3NwYWNlJykge1xyXG4gICAgICBpZiAoc2VsZi5pc0Rpc2FibGVkKHNlbGYuYWN0aXZlRGF0ZSkpIHtcclxuICAgICAgICByZXR1cm47IC8vIGRvIG5vdGhpbmdcclxuICAgICAgfVxyXG4gICAgICAkc2NvcGUuc2VsZWN0KHNlbGYuYWN0aXZlRGF0ZSk7XHJcbiAgICB9IGVsc2UgaWYgKGV2dC5jdHJsS2V5ICYmIChrZXkgPT09ICd1cCcgfHwga2V5ID09PSAnZG93bicpKSB7XHJcbiAgICAgICRzY29wZS50b2dnbGVNb2RlKGtleSA9PT0gJ3VwJyA/IDEgOiAtMSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBzZWxmLmhhbmRsZUtleURvd24oa2V5LCBldnQpO1xyXG4gICAgICBzZWxmLnJlZnJlc2hWaWV3KCk7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgJGVsZW1lbnQub24oJ2tleWRvd24nLCBmdW5jdGlvbihldnQpIHtcclxuICAgICRzY29wZS4kYXBwbHkoZnVuY3Rpb24oKSB7XHJcbiAgICAgICRzY29wZS5rZXlkb3duKGV2dCk7XHJcbiAgICB9KTtcclxuICB9KTtcclxuXHJcbiAgJHNjb3BlLiRvbignJGRlc3Ryb3knLCBmdW5jdGlvbigpIHtcclxuICAgIC8vQ2xlYXIgYWxsIHdhdGNoIGxpc3RlbmVycyBvbiBkZXN0cm95XHJcbiAgICB3aGlsZSAod2F0Y2hMaXN0ZW5lcnMubGVuZ3RoKSB7XHJcbiAgICAgIHdhdGNoTGlzdGVuZXJzLnNoaWZ0KCkoKTtcclxuICAgIH1cclxuICB9KTtcclxuXHJcbiAgZnVuY3Rpb24gc2V0TW9kZShtb2RlKSB7XHJcbiAgICAkc2NvcGUuZGF0ZXBpY2tlck1vZGUgPSBtb2RlO1xyXG4gICAgJHNjb3BlLmRhdGVwaWNrZXJPcHRpb25zLmRhdGVwaWNrZXJNb2RlID0gbW9kZTtcclxuICB9XHJcbn1dKVxyXG5cclxuLmNvbnRyb2xsZXIoJ1VpYkRheXBpY2tlckNvbnRyb2xsZXInLCBbJyRzY29wZScsICckZWxlbWVudCcsICdkYXRlRmlsdGVyJywgZnVuY3Rpb24oc2NvcGUsICRlbGVtZW50LCBkYXRlRmlsdGVyKSB7XHJcbiAgdmFyIERBWVNfSU5fTU9OVEggPSBbMzEsIDI4LCAzMSwgMzAsIDMxLCAzMCwgMzEsIDMxLCAzMCwgMzEsIDMwLCAzMV07XHJcblxyXG4gIHRoaXMuc3RlcCA9IHsgbW9udGhzOiAxIH07XHJcbiAgdGhpcy5lbGVtZW50ID0gJGVsZW1lbnQ7XHJcbiAgZnVuY3Rpb24gZ2V0RGF5c0luTW9udGgoeWVhciwgbW9udGgpIHtcclxuICAgIHJldHVybiBtb250aCA9PT0gMSAmJiB5ZWFyICUgNCA9PT0gMCAmJlxyXG4gICAgICAoeWVhciAlIDEwMCAhPT0gMCB8fCB5ZWFyICUgNDAwID09PSAwKSA/IDI5IDogREFZU19JTl9NT05USFttb250aF07XHJcbiAgfVxyXG5cclxuICB0aGlzLmluaXQgPSBmdW5jdGlvbihjdHJsKSB7XHJcbiAgICBhbmd1bGFyLmV4dGVuZChjdHJsLCB0aGlzKTtcclxuICAgIHNjb3BlLnNob3dXZWVrcyA9IGN0cmwuc2hvd1dlZWtzO1xyXG4gICAgY3RybC5yZWZyZXNoVmlldygpO1xyXG4gIH07XHJcblxyXG4gIHRoaXMuZ2V0RGF0ZXMgPSBmdW5jdGlvbihzdGFydERhdGUsIG4pIHtcclxuICAgIHZhciBkYXRlcyA9IG5ldyBBcnJheShuKSwgY3VycmVudCA9IG5ldyBEYXRlKHN0YXJ0RGF0ZSksIGkgPSAwLCBkYXRlO1xyXG4gICAgd2hpbGUgKGkgPCBuKSB7XHJcbiAgICAgIGRhdGUgPSBuZXcgRGF0ZShjdXJyZW50KTtcclxuICAgICAgZGF0ZXNbaSsrXSA9IGRhdGU7XHJcbiAgICAgIGN1cnJlbnQuc2V0RGF0ZShjdXJyZW50LmdldERhdGUoKSArIDEpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGRhdGVzO1xyXG4gIH07XHJcblxyXG4gIHRoaXMuX3JlZnJlc2hWaWV3ID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgeWVhciA9IHRoaXMuYWN0aXZlRGF0ZS5nZXRGdWxsWWVhcigpLFxyXG4gICAgICBtb250aCA9IHRoaXMuYWN0aXZlRGF0ZS5nZXRNb250aCgpLFxyXG4gICAgICBmaXJzdERheU9mTW9udGggPSBuZXcgRGF0ZSh0aGlzLmFjdGl2ZURhdGUpO1xyXG5cclxuICAgIGZpcnN0RGF5T2ZNb250aC5zZXRGdWxsWWVhcih5ZWFyLCBtb250aCwgMSk7XHJcblxyXG4gICAgdmFyIGRpZmZlcmVuY2UgPSB0aGlzLnN0YXJ0aW5nRGF5IC0gZmlyc3REYXlPZk1vbnRoLmdldERheSgpLFxyXG4gICAgICBudW1EaXNwbGF5ZWRGcm9tUHJldmlvdXNNb250aCA9IGRpZmZlcmVuY2UgPiAwID9cclxuICAgICAgICA3IC0gZGlmZmVyZW5jZSA6IC0gZGlmZmVyZW5jZSxcclxuICAgICAgZmlyc3REYXRlID0gbmV3IERhdGUoZmlyc3REYXlPZk1vbnRoKTtcclxuXHJcbiAgICBpZiAobnVtRGlzcGxheWVkRnJvbVByZXZpb3VzTW9udGggPiAwKSB7XHJcbiAgICAgIGZpcnN0RGF0ZS5zZXREYXRlKC1udW1EaXNwbGF5ZWRGcm9tUHJldmlvdXNNb250aCArIDEpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIDQyIGlzIHRoZSBudW1iZXIgb2YgZGF5cyBvbiBhIHNpeC13ZWVrIGNhbGVuZGFyXHJcbiAgICB2YXIgZGF5cyA9IHRoaXMuZ2V0RGF0ZXMoZmlyc3REYXRlLCA0Mik7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDQyOyBpICsrKSB7XHJcbiAgICAgIGRheXNbaV0gPSBhbmd1bGFyLmV4dGVuZCh0aGlzLmNyZWF0ZURhdGVPYmplY3QoZGF5c1tpXSwgdGhpcy5mb3JtYXREYXkpLCB7XHJcbiAgICAgICAgc2Vjb25kYXJ5OiBkYXlzW2ldLmdldE1vbnRoKCkgIT09IG1vbnRoLFxyXG4gICAgICAgIHVpZDogc2NvcGUudW5pcXVlSWQgKyAnLScgKyBpXHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHNjb3BlLmxhYmVscyA9IG5ldyBBcnJheSg3KTtcclxuICAgIGZvciAodmFyIGogPSAwOyBqIDwgNzsgaisrKSB7XHJcbiAgICAgIHNjb3BlLmxhYmVsc1tqXSA9IHtcclxuICAgICAgICBhYmJyOiBkYXRlRmlsdGVyKGRheXNbal0uZGF0ZSwgdGhpcy5mb3JtYXREYXlIZWFkZXIpLFxyXG4gICAgICAgIGZ1bGw6IGRhdGVGaWx0ZXIoZGF5c1tqXS5kYXRlLCAnRUVFRScpXHJcbiAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgc2NvcGUudGl0bGUgPSBkYXRlRmlsdGVyKHRoaXMuYWN0aXZlRGF0ZSwgdGhpcy5mb3JtYXREYXlUaXRsZSk7XHJcbiAgICBzY29wZS5yb3dzID0gdGhpcy5zcGxpdChkYXlzLCA3KTtcclxuXHJcbiAgICBpZiAoc2NvcGUuc2hvd1dlZWtzKSB7XHJcbiAgICAgIHNjb3BlLndlZWtOdW1iZXJzID0gW107XHJcbiAgICAgIHZhciB0aHVyc2RheUluZGV4ID0gKDQgKyA3IC0gdGhpcy5zdGFydGluZ0RheSkgJSA3LFxyXG4gICAgICAgICAgbnVtV2Vla3MgPSBzY29wZS5yb3dzLmxlbmd0aDtcclxuICAgICAgZm9yICh2YXIgY3VyV2VlayA9IDA7IGN1cldlZWsgPCBudW1XZWVrczsgY3VyV2VlaysrKSB7XHJcbiAgICAgICAgc2NvcGUud2Vla051bWJlcnMucHVzaChcclxuICAgICAgICAgIGdldElTTzg2MDFXZWVrTnVtYmVyKHNjb3BlLnJvd3NbY3VyV2Vla11bdGh1cnNkYXlJbmRleF0uZGF0ZSkpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgdGhpcy5jb21wYXJlID0gZnVuY3Rpb24oZGF0ZTEsIGRhdGUyKSB7XHJcbiAgICB2YXIgX2RhdGUxID0gbmV3IERhdGUoZGF0ZTEuZ2V0RnVsbFllYXIoKSwgZGF0ZTEuZ2V0TW9udGgoKSwgZGF0ZTEuZ2V0RGF0ZSgpKTtcclxuICAgIHZhciBfZGF0ZTIgPSBuZXcgRGF0ZShkYXRlMi5nZXRGdWxsWWVhcigpLCBkYXRlMi5nZXRNb250aCgpLCBkYXRlMi5nZXREYXRlKCkpO1xyXG4gICAgX2RhdGUxLnNldEZ1bGxZZWFyKGRhdGUxLmdldEZ1bGxZZWFyKCkpO1xyXG4gICAgX2RhdGUyLnNldEZ1bGxZZWFyKGRhdGUyLmdldEZ1bGxZZWFyKCkpO1xyXG4gICAgcmV0dXJuIF9kYXRlMSAtIF9kYXRlMjtcclxuICB9O1xyXG5cclxuICBmdW5jdGlvbiBnZXRJU084NjAxV2Vla051bWJlcihkYXRlKSB7XHJcbiAgICB2YXIgY2hlY2tEYXRlID0gbmV3IERhdGUoZGF0ZSk7XHJcbiAgICBjaGVja0RhdGUuc2V0RGF0ZShjaGVja0RhdGUuZ2V0RGF0ZSgpICsgNCAtIChjaGVja0RhdGUuZ2V0RGF5KCkgfHwgNykpOyAvLyBUaHVyc2RheVxyXG4gICAgdmFyIHRpbWUgPSBjaGVja0RhdGUuZ2V0VGltZSgpO1xyXG4gICAgY2hlY2tEYXRlLnNldE1vbnRoKDApOyAvLyBDb21wYXJlIHdpdGggSmFuIDFcclxuICAgIGNoZWNrRGF0ZS5zZXREYXRlKDEpO1xyXG4gICAgcmV0dXJuIE1hdGguZmxvb3IoTWF0aC5yb3VuZCgodGltZSAtIGNoZWNrRGF0ZSkgLyA4NjQwMDAwMCkgLyA3KSArIDE7XHJcbiAgfVxyXG5cclxuICB0aGlzLmhhbmRsZUtleURvd24gPSBmdW5jdGlvbihrZXksIGV2dCkge1xyXG4gICAgdmFyIGRhdGUgPSB0aGlzLmFjdGl2ZURhdGUuZ2V0RGF0ZSgpO1xyXG5cclxuICAgIGlmIChrZXkgPT09ICdsZWZ0Jykge1xyXG4gICAgICBkYXRlID0gZGF0ZSAtIDE7XHJcbiAgICB9IGVsc2UgaWYgKGtleSA9PT0gJ3VwJykge1xyXG4gICAgICBkYXRlID0gZGF0ZSAtIDc7XHJcbiAgICB9IGVsc2UgaWYgKGtleSA9PT0gJ3JpZ2h0Jykge1xyXG4gICAgICBkYXRlID0gZGF0ZSArIDE7XHJcbiAgICB9IGVsc2UgaWYgKGtleSA9PT0gJ2Rvd24nKSB7XHJcbiAgICAgIGRhdGUgPSBkYXRlICsgNztcclxuICAgIH0gZWxzZSBpZiAoa2V5ID09PSAncGFnZXVwJyB8fCBrZXkgPT09ICdwYWdlZG93bicpIHtcclxuICAgICAgdmFyIG1vbnRoID0gdGhpcy5hY3RpdmVEYXRlLmdldE1vbnRoKCkgKyAoa2V5ID09PSAncGFnZXVwJyA/IC0gMSA6IDEpO1xyXG4gICAgICB0aGlzLmFjdGl2ZURhdGUuc2V0TW9udGgobW9udGgsIDEpO1xyXG4gICAgICBkYXRlID0gTWF0aC5taW4oZ2V0RGF5c0luTW9udGgodGhpcy5hY3RpdmVEYXRlLmdldEZ1bGxZZWFyKCksIHRoaXMuYWN0aXZlRGF0ZS5nZXRNb250aCgpKSwgZGF0ZSk7XHJcbiAgICB9IGVsc2UgaWYgKGtleSA9PT0gJ2hvbWUnKSB7XHJcbiAgICAgIGRhdGUgPSAxO1xyXG4gICAgfSBlbHNlIGlmIChrZXkgPT09ICdlbmQnKSB7XHJcbiAgICAgIGRhdGUgPSBnZXREYXlzSW5Nb250aCh0aGlzLmFjdGl2ZURhdGUuZ2V0RnVsbFllYXIoKSwgdGhpcy5hY3RpdmVEYXRlLmdldE1vbnRoKCkpO1xyXG4gICAgfVxyXG4gICAgdGhpcy5hY3RpdmVEYXRlLnNldERhdGUoZGF0ZSk7XHJcbiAgfTtcclxufV0pXHJcblxyXG4uY29udHJvbGxlcignVWliTW9udGhwaWNrZXJDb250cm9sbGVyJywgWyckc2NvcGUnLCAnJGVsZW1lbnQnLCAnZGF0ZUZpbHRlcicsIGZ1bmN0aW9uKHNjb3BlLCAkZWxlbWVudCwgZGF0ZUZpbHRlcikge1xyXG4gIHRoaXMuc3RlcCA9IHsgeWVhcnM6IDEgfTtcclxuICB0aGlzLmVsZW1lbnQgPSAkZWxlbWVudDtcclxuXHJcbiAgdGhpcy5pbml0ID0gZnVuY3Rpb24oY3RybCkge1xyXG4gICAgYW5ndWxhci5leHRlbmQoY3RybCwgdGhpcyk7XHJcbiAgICBjdHJsLnJlZnJlc2hWaWV3KCk7XHJcbiAgfTtcclxuXHJcbiAgdGhpcy5fcmVmcmVzaFZpZXcgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBtb250aHMgPSBuZXcgQXJyYXkoMTIpLFxyXG4gICAgICAgIHllYXIgPSB0aGlzLmFjdGl2ZURhdGUuZ2V0RnVsbFllYXIoKSxcclxuICAgICAgICBkYXRlO1xyXG5cclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgMTI7IGkrKykge1xyXG4gICAgICBkYXRlID0gbmV3IERhdGUodGhpcy5hY3RpdmVEYXRlKTtcclxuICAgICAgZGF0ZS5zZXRGdWxsWWVhcih5ZWFyLCBpLCAxKTtcclxuICAgICAgbW9udGhzW2ldID0gYW5ndWxhci5leHRlbmQodGhpcy5jcmVhdGVEYXRlT2JqZWN0KGRhdGUsIHRoaXMuZm9ybWF0TW9udGgpLCB7XHJcbiAgICAgICAgdWlkOiBzY29wZS51bmlxdWVJZCArICctJyArIGlcclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgc2NvcGUudGl0bGUgPSBkYXRlRmlsdGVyKHRoaXMuYWN0aXZlRGF0ZSwgdGhpcy5mb3JtYXRNb250aFRpdGxlKTtcclxuICAgIHNjb3BlLnJvd3MgPSB0aGlzLnNwbGl0KG1vbnRocywgdGhpcy5tb250aENvbHVtbnMpO1xyXG4gICAgc2NvcGUueWVhckhlYWRlckNvbHNwYW4gPSB0aGlzLm1vbnRoQ29sdW1ucyA+IDMgPyB0aGlzLm1vbnRoQ29sdW1ucyAtIDIgOiAxO1xyXG4gIH07XHJcblxyXG4gIHRoaXMuY29tcGFyZSA9IGZ1bmN0aW9uKGRhdGUxLCBkYXRlMikge1xyXG4gICAgdmFyIF9kYXRlMSA9IG5ldyBEYXRlKGRhdGUxLmdldEZ1bGxZZWFyKCksIGRhdGUxLmdldE1vbnRoKCkpO1xyXG4gICAgdmFyIF9kYXRlMiA9IG5ldyBEYXRlKGRhdGUyLmdldEZ1bGxZZWFyKCksIGRhdGUyLmdldE1vbnRoKCkpO1xyXG4gICAgX2RhdGUxLnNldEZ1bGxZZWFyKGRhdGUxLmdldEZ1bGxZZWFyKCkpO1xyXG4gICAgX2RhdGUyLnNldEZ1bGxZZWFyKGRhdGUyLmdldEZ1bGxZZWFyKCkpO1xyXG4gICAgcmV0dXJuIF9kYXRlMSAtIF9kYXRlMjtcclxuICB9O1xyXG5cclxuICB0aGlzLmhhbmRsZUtleURvd24gPSBmdW5jdGlvbihrZXksIGV2dCkge1xyXG4gICAgdmFyIGRhdGUgPSB0aGlzLmFjdGl2ZURhdGUuZ2V0TW9udGgoKTtcclxuXHJcbiAgICBpZiAoa2V5ID09PSAnbGVmdCcpIHtcclxuICAgICAgZGF0ZSA9IGRhdGUgLSAxO1xyXG4gICAgfSBlbHNlIGlmIChrZXkgPT09ICd1cCcpIHtcclxuICAgICAgZGF0ZSA9IGRhdGUgLSB0aGlzLm1vbnRoQ29sdW1ucztcclxuICAgIH0gZWxzZSBpZiAoa2V5ID09PSAncmlnaHQnKSB7XHJcbiAgICAgIGRhdGUgPSBkYXRlICsgMTtcclxuICAgIH0gZWxzZSBpZiAoa2V5ID09PSAnZG93bicpIHtcclxuICAgICAgZGF0ZSA9IGRhdGUgKyB0aGlzLm1vbnRoQ29sdW1ucztcclxuICAgIH0gZWxzZSBpZiAoa2V5ID09PSAncGFnZXVwJyB8fCBrZXkgPT09ICdwYWdlZG93bicpIHtcclxuICAgICAgdmFyIHllYXIgPSB0aGlzLmFjdGl2ZURhdGUuZ2V0RnVsbFllYXIoKSArIChrZXkgPT09ICdwYWdldXAnID8gLSAxIDogMSk7XHJcbiAgICAgIHRoaXMuYWN0aXZlRGF0ZS5zZXRGdWxsWWVhcih5ZWFyKTtcclxuICAgIH0gZWxzZSBpZiAoa2V5ID09PSAnaG9tZScpIHtcclxuICAgICAgZGF0ZSA9IDA7XHJcbiAgICB9IGVsc2UgaWYgKGtleSA9PT0gJ2VuZCcpIHtcclxuICAgICAgZGF0ZSA9IDExO1xyXG4gICAgfVxyXG4gICAgdGhpcy5hY3RpdmVEYXRlLnNldE1vbnRoKGRhdGUpO1xyXG4gIH07XHJcbn1dKVxyXG5cclxuLmNvbnRyb2xsZXIoJ1VpYlllYXJwaWNrZXJDb250cm9sbGVyJywgWyckc2NvcGUnLCAnJGVsZW1lbnQnLCAnZGF0ZUZpbHRlcicsIGZ1bmN0aW9uKHNjb3BlLCAkZWxlbWVudCwgZGF0ZUZpbHRlcikge1xyXG4gIHZhciBjb2x1bW5zLCByYW5nZTtcclxuICB0aGlzLmVsZW1lbnQgPSAkZWxlbWVudDtcclxuXHJcbiAgZnVuY3Rpb24gZ2V0U3RhcnRpbmdZZWFyKHllYXIpIHtcclxuICAgIHJldHVybiBwYXJzZUludCgoeWVhciAtIDEpIC8gcmFuZ2UsIDEwKSAqIHJhbmdlICsgMTtcclxuICB9XHJcblxyXG4gIHRoaXMueWVhcnBpY2tlckluaXQgPSBmdW5jdGlvbigpIHtcclxuICAgIGNvbHVtbnMgPSB0aGlzLnllYXJDb2x1bW5zO1xyXG4gICAgcmFuZ2UgPSB0aGlzLnllYXJSb3dzICogY29sdW1ucztcclxuICAgIHRoaXMuc3RlcCA9IHsgeWVhcnM6IHJhbmdlIH07XHJcbiAgfTtcclxuXHJcbiAgdGhpcy5fcmVmcmVzaFZpZXcgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciB5ZWFycyA9IG5ldyBBcnJheShyYW5nZSksIGRhdGU7XHJcblxyXG4gICAgZm9yICh2YXIgaSA9IDAsIHN0YXJ0ID0gZ2V0U3RhcnRpbmdZZWFyKHRoaXMuYWN0aXZlRGF0ZS5nZXRGdWxsWWVhcigpKTsgaSA8IHJhbmdlOyBpKyspIHtcclxuICAgICAgZGF0ZSA9IG5ldyBEYXRlKHRoaXMuYWN0aXZlRGF0ZSk7XHJcbiAgICAgIGRhdGUuc2V0RnVsbFllYXIoc3RhcnQgKyBpLCAwLCAxKTtcclxuICAgICAgeWVhcnNbaV0gPSBhbmd1bGFyLmV4dGVuZCh0aGlzLmNyZWF0ZURhdGVPYmplY3QoZGF0ZSwgdGhpcy5mb3JtYXRZZWFyKSwge1xyXG4gICAgICAgIHVpZDogc2NvcGUudW5pcXVlSWQgKyAnLScgKyBpXHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHNjb3BlLnRpdGxlID0gW3llYXJzWzBdLmxhYmVsLCB5ZWFyc1tyYW5nZSAtIDFdLmxhYmVsXS5qb2luKCcgLSAnKTtcclxuICAgIHNjb3BlLnJvd3MgPSB0aGlzLnNwbGl0KHllYXJzLCBjb2x1bW5zKTtcclxuICAgIHNjb3BlLmNvbHVtbnMgPSBjb2x1bW5zO1xyXG4gIH07XHJcblxyXG4gIHRoaXMuY29tcGFyZSA9IGZ1bmN0aW9uKGRhdGUxLCBkYXRlMikge1xyXG4gICAgcmV0dXJuIGRhdGUxLmdldEZ1bGxZZWFyKCkgLSBkYXRlMi5nZXRGdWxsWWVhcigpO1xyXG4gIH07XHJcblxyXG4gIHRoaXMuaGFuZGxlS2V5RG93biA9IGZ1bmN0aW9uKGtleSwgZXZ0KSB7XHJcbiAgICB2YXIgZGF0ZSA9IHRoaXMuYWN0aXZlRGF0ZS5nZXRGdWxsWWVhcigpO1xyXG5cclxuICAgIGlmIChrZXkgPT09ICdsZWZ0Jykge1xyXG4gICAgICBkYXRlID0gZGF0ZSAtIDE7XHJcbiAgICB9IGVsc2UgaWYgKGtleSA9PT0gJ3VwJykge1xyXG4gICAgICBkYXRlID0gZGF0ZSAtIGNvbHVtbnM7XHJcbiAgICB9IGVsc2UgaWYgKGtleSA9PT0gJ3JpZ2h0Jykge1xyXG4gICAgICBkYXRlID0gZGF0ZSArIDE7XHJcbiAgICB9IGVsc2UgaWYgKGtleSA9PT0gJ2Rvd24nKSB7XHJcbiAgICAgIGRhdGUgPSBkYXRlICsgY29sdW1ucztcclxuICAgIH0gZWxzZSBpZiAoa2V5ID09PSAncGFnZXVwJyB8fCBrZXkgPT09ICdwYWdlZG93bicpIHtcclxuICAgICAgZGF0ZSArPSAoa2V5ID09PSAncGFnZXVwJyA/IC0gMSA6IDEpICogcmFuZ2U7XHJcbiAgICB9IGVsc2UgaWYgKGtleSA9PT0gJ2hvbWUnKSB7XHJcbiAgICAgIGRhdGUgPSBnZXRTdGFydGluZ1llYXIodGhpcy5hY3RpdmVEYXRlLmdldEZ1bGxZZWFyKCkpO1xyXG4gICAgfSBlbHNlIGlmIChrZXkgPT09ICdlbmQnKSB7XHJcbiAgICAgIGRhdGUgPSBnZXRTdGFydGluZ1llYXIodGhpcy5hY3RpdmVEYXRlLmdldEZ1bGxZZWFyKCkpICsgcmFuZ2UgLSAxO1xyXG4gICAgfVxyXG4gICAgdGhpcy5hY3RpdmVEYXRlLnNldEZ1bGxZZWFyKGRhdGUpO1xyXG4gIH07XHJcbn1dKVxyXG5cclxuLmRpcmVjdGl2ZSgndWliRGF0ZXBpY2tlcicsIGZ1bmN0aW9uKCkge1xyXG4gIHJldHVybiB7XHJcbiAgICB0ZW1wbGF0ZVVybDogZnVuY3Rpb24oZWxlbWVudCwgYXR0cnMpIHtcclxuICAgICAgcmV0dXJuIGF0dHJzLnRlbXBsYXRlVXJsIHx8ICd1aWIvdGVtcGxhdGUvZGF0ZXBpY2tlci9kYXRlcGlja2VyLmh0bWwnO1xyXG4gICAgfSxcclxuICAgIHNjb3BlOiB7XHJcbiAgICAgIGRhdGVwaWNrZXJPcHRpb25zOiAnPT8nXHJcbiAgICB9LFxyXG4gICAgcmVxdWlyZTogWyd1aWJEYXRlcGlja2VyJywgJ15uZ01vZGVsJ10sXHJcbiAgICByZXN0cmljdDogJ0EnLFxyXG4gICAgY29udHJvbGxlcjogJ1VpYkRhdGVwaWNrZXJDb250cm9sbGVyJyxcclxuICAgIGNvbnRyb2xsZXJBczogJ2RhdGVwaWNrZXInLFxyXG4gICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCBjdHJscykge1xyXG4gICAgICB2YXIgZGF0ZXBpY2tlckN0cmwgPSBjdHJsc1swXSwgbmdNb2RlbEN0cmwgPSBjdHJsc1sxXTtcclxuXHJcbiAgICAgIGRhdGVwaWNrZXJDdHJsLmluaXQobmdNb2RlbEN0cmwpO1xyXG4gICAgfVxyXG4gIH07XHJcbn0pXHJcblxyXG4uZGlyZWN0aXZlKCd1aWJEYXlwaWNrZXInLCBmdW5jdGlvbigpIHtcclxuICByZXR1cm4ge1xyXG4gICAgdGVtcGxhdGVVcmw6IGZ1bmN0aW9uKGVsZW1lbnQsIGF0dHJzKSB7XHJcbiAgICAgIHJldHVybiBhdHRycy50ZW1wbGF0ZVVybCB8fCAndWliL3RlbXBsYXRlL2RhdGVwaWNrZXIvZGF5Lmh0bWwnO1xyXG4gICAgfSxcclxuICAgIHJlcXVpcmU6IFsnXnVpYkRhdGVwaWNrZXInLCAndWliRGF5cGlja2VyJ10sXHJcbiAgICByZXN0cmljdDogJ0EnLFxyXG4gICAgY29udHJvbGxlcjogJ1VpYkRheXBpY2tlckNvbnRyb2xsZXInLFxyXG4gICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCBjdHJscykge1xyXG4gICAgICB2YXIgZGF0ZXBpY2tlckN0cmwgPSBjdHJsc1swXSxcclxuICAgICAgICBkYXlwaWNrZXJDdHJsID0gY3RybHNbMV07XHJcblxyXG4gICAgICBkYXlwaWNrZXJDdHJsLmluaXQoZGF0ZXBpY2tlckN0cmwpO1xyXG4gICAgfVxyXG4gIH07XHJcbn0pXHJcblxyXG4uZGlyZWN0aXZlKCd1aWJNb250aHBpY2tlcicsIGZ1bmN0aW9uKCkge1xyXG4gIHJldHVybiB7XHJcbiAgICB0ZW1wbGF0ZVVybDogZnVuY3Rpb24oZWxlbWVudCwgYXR0cnMpIHtcclxuICAgICAgcmV0dXJuIGF0dHJzLnRlbXBsYXRlVXJsIHx8ICd1aWIvdGVtcGxhdGUvZGF0ZXBpY2tlci9tb250aC5odG1sJztcclxuICAgIH0sXHJcbiAgICByZXF1aXJlOiBbJ151aWJEYXRlcGlja2VyJywgJ3VpYk1vbnRocGlja2VyJ10sXHJcbiAgICByZXN0cmljdDogJ0EnLFxyXG4gICAgY29udHJvbGxlcjogJ1VpYk1vbnRocGlja2VyQ29udHJvbGxlcicsXHJcbiAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxlbWVudCwgYXR0cnMsIGN0cmxzKSB7XHJcbiAgICAgIHZhciBkYXRlcGlja2VyQ3RybCA9IGN0cmxzWzBdLFxyXG4gICAgICAgIG1vbnRocGlja2VyQ3RybCA9IGN0cmxzWzFdO1xyXG5cclxuICAgICAgbW9udGhwaWNrZXJDdHJsLmluaXQoZGF0ZXBpY2tlckN0cmwpO1xyXG4gICAgfVxyXG4gIH07XHJcbn0pXHJcblxyXG4uZGlyZWN0aXZlKCd1aWJZZWFycGlja2VyJywgZnVuY3Rpb24oKSB7XHJcbiAgcmV0dXJuIHtcclxuICAgIHRlbXBsYXRlVXJsOiBmdW5jdGlvbihlbGVtZW50LCBhdHRycykge1xyXG4gICAgICByZXR1cm4gYXR0cnMudGVtcGxhdGVVcmwgfHwgJ3VpYi90ZW1wbGF0ZS9kYXRlcGlja2VyL3llYXIuaHRtbCc7XHJcbiAgICB9LFxyXG4gICAgcmVxdWlyZTogWydedWliRGF0ZXBpY2tlcicsICd1aWJZZWFycGlja2VyJ10sXHJcbiAgICByZXN0cmljdDogJ0EnLFxyXG4gICAgY29udHJvbGxlcjogJ1VpYlllYXJwaWNrZXJDb250cm9sbGVyJyxcclxuICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBlbGVtZW50LCBhdHRycywgY3RybHMpIHtcclxuICAgICAgdmFyIGN0cmwgPSBjdHJsc1swXTtcclxuICAgICAgYW5ndWxhci5leHRlbmQoY3RybCwgY3RybHNbMV0pO1xyXG4gICAgICBjdHJsLnllYXJwaWNrZXJJbml0KCk7XHJcblxyXG4gICAgICBjdHJsLnJlZnJlc2hWaWV3KCk7XHJcbiAgICB9XHJcbiAgfTtcclxufSk7XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgndWkuYm9vdHN0cmFwLnBvc2l0aW9uJywgW10pXHJcblxyXG4vKipcclxuICogQSBzZXQgb2YgdXRpbGl0eSBtZXRob2RzIGZvciB3b3JraW5nIHdpdGggdGhlIERPTS5cclxuICogSXQgaXMgbWVhbnQgdG8gYmUgdXNlZCB3aGVyZSB3ZSBuZWVkIHRvIGFic29sdXRlLXBvc2l0aW9uIGVsZW1lbnRzIGluXHJcbiAqIHJlbGF0aW9uIHRvIGFub3RoZXIgZWxlbWVudCAodGhpcyBpcyB0aGUgY2FzZSBmb3IgdG9vbHRpcHMsIHBvcG92ZXJzLFxyXG4gKiB0eXBlYWhlYWQgc3VnZ2VzdGlvbnMgZXRjLikuXHJcbiAqL1xyXG4gIC5mYWN0b3J5KCckdWliUG9zaXRpb24nLCBbJyRkb2N1bWVudCcsICckd2luZG93JywgZnVuY3Rpb24oJGRvY3VtZW50LCAkd2luZG93KSB7XHJcbiAgICAvKipcclxuICAgICAqIFVzZWQgYnkgc2Nyb2xsYmFyV2lkdGgoKSBmdW5jdGlvbiB0byBjYWNoZSBzY3JvbGxiYXIncyB3aWR0aC5cclxuICAgICAqIERvIG5vdCBhY2Nlc3MgdGhpcyB2YXJpYWJsZSBkaXJlY3RseSwgdXNlIHNjcm9sbGJhcldpZHRoKCkgaW5zdGVhZC5cclxuICAgICAqL1xyXG4gICAgdmFyIFNDUk9MTEJBUl9XSURUSDtcclxuICAgIC8qKlxyXG4gICAgICogc2Nyb2xsYmFyIG9uIGJvZHkgYW5kIGh0bWwgZWxlbWVudCBpbiBJRSBhbmQgRWRnZSBvdmVybGF5XHJcbiAgICAgKiBjb250ZW50IGFuZCBzaG91bGQgYmUgY29uc2lkZXJlZCAwIHdpZHRoLlxyXG4gICAgICovXHJcbiAgICB2YXIgQk9EWV9TQ1JPTExCQVJfV0lEVEg7XHJcbiAgICB2YXIgT1ZFUkZMT1dfUkVHRVggPSB7XHJcbiAgICAgIG5vcm1hbDogLyhhdXRvfHNjcm9sbCkvLFxyXG4gICAgICBoaWRkZW46IC8oYXV0b3xzY3JvbGx8aGlkZGVuKS9cclxuICAgIH07XHJcbiAgICB2YXIgUExBQ0VNRU5UX1JFR0VYID0ge1xyXG4gICAgICBhdXRvOiAvXFxzP2F1dG8/XFxzPy9pLFxyXG4gICAgICBwcmltYXJ5OiAvXih0b3B8Ym90dG9tfGxlZnR8cmlnaHQpJC8sXHJcbiAgICAgIHNlY29uZGFyeTogL14odG9wfGJvdHRvbXxsZWZ0fHJpZ2h0fGNlbnRlcikkLyxcclxuICAgICAgdmVydGljYWw6IC9eKHRvcHxib3R0b20pJC9cclxuICAgIH07XHJcbiAgICB2YXIgQk9EWV9SRUdFWCA9IC8oSFRNTHxCT0RZKS87XHJcblxyXG4gICAgcmV0dXJuIHtcclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBQcm92aWRlcyBhIHJhdyBET00gZWxlbWVudCBmcm9tIGEgalF1ZXJ5L2pRTGl0ZSBlbGVtZW50LlxyXG4gICAgICAgKlxyXG4gICAgICAgKiBAcGFyYW0ge2VsZW1lbnR9IGVsZW0gLSBUaGUgZWxlbWVudCB0byBjb252ZXJ0LlxyXG4gICAgICAgKlxyXG4gICAgICAgKiBAcmV0dXJucyB7ZWxlbWVudH0gQSBIVE1MIGVsZW1lbnQuXHJcbiAgICAgICAqL1xyXG4gICAgICBnZXRSYXdOb2RlOiBmdW5jdGlvbihlbGVtKSB7XHJcbiAgICAgICAgcmV0dXJuIGVsZW0ubm9kZU5hbWUgPyBlbGVtIDogZWxlbVswXSB8fCBlbGVtO1xyXG4gICAgICB9LFxyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIFByb3ZpZGVzIGEgcGFyc2VkIG51bWJlciBmb3IgYSBzdHlsZSBwcm9wZXJ0eS4gIFN0cmlwc1xyXG4gICAgICAgKiB1bml0cyBhbmQgY2FzdHMgaW52YWxpZCBudW1iZXJzIHRvIDAuXHJcbiAgICAgICAqXHJcbiAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSB2YWx1ZSAtIFRoZSBzdHlsZSB2YWx1ZSB0byBwYXJzZS5cclxuICAgICAgICpcclxuICAgICAgICogQHJldHVybnMge251bWJlcn0gQSB2YWxpZCBudW1iZXIuXHJcbiAgICAgICAqL1xyXG4gICAgICBwYXJzZVN0eWxlOiBmdW5jdGlvbih2YWx1ZSkge1xyXG4gICAgICAgIHZhbHVlID0gcGFyc2VGbG9hdCh2YWx1ZSk7XHJcbiAgICAgICAgcmV0dXJuIGlzRmluaXRlKHZhbHVlKSA/IHZhbHVlIDogMDtcclxuICAgICAgfSxcclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBQcm92aWRlcyB0aGUgY2xvc2VzdCBwb3NpdGlvbmVkIGFuY2VzdG9yLlxyXG4gICAgICAgKlxyXG4gICAgICAgKiBAcGFyYW0ge2VsZW1lbnR9IGVsZW1lbnQgLSBUaGUgZWxlbWVudCB0byBnZXQgdGhlIG9mZmVzdCBwYXJlbnQgZm9yLlxyXG4gICAgICAgKlxyXG4gICAgICAgKiBAcmV0dXJucyB7ZWxlbWVudH0gVGhlIGNsb3Nlc3QgcG9zaXRpb25lZCBhbmNlc3Rvci5cclxuICAgICAgICovXHJcbiAgICAgIG9mZnNldFBhcmVudDogZnVuY3Rpb24oZWxlbSkge1xyXG4gICAgICAgIGVsZW0gPSB0aGlzLmdldFJhd05vZGUoZWxlbSk7XHJcblxyXG4gICAgICAgIHZhciBvZmZzZXRQYXJlbnQgPSBlbGVtLm9mZnNldFBhcmVudCB8fCAkZG9jdW1lbnRbMF0uZG9jdW1lbnRFbGVtZW50O1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBpc1N0YXRpY1Bvc2l0aW9uZWQoZWwpIHtcclxuICAgICAgICAgIHJldHVybiAoJHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKGVsKS5wb3NpdGlvbiB8fCAnc3RhdGljJykgPT09ICdzdGF0aWMnO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgd2hpbGUgKG9mZnNldFBhcmVudCAmJiBvZmZzZXRQYXJlbnQgIT09ICRkb2N1bWVudFswXS5kb2N1bWVudEVsZW1lbnQgJiYgaXNTdGF0aWNQb3NpdGlvbmVkKG9mZnNldFBhcmVudCkpIHtcclxuICAgICAgICAgIG9mZnNldFBhcmVudCA9IG9mZnNldFBhcmVudC5vZmZzZXRQYXJlbnQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gb2Zmc2V0UGFyZW50IHx8ICRkb2N1bWVudFswXS5kb2N1bWVudEVsZW1lbnQ7XHJcbiAgICAgIH0sXHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogUHJvdmlkZXMgdGhlIHNjcm9sbGJhciB3aWR0aCwgY29uY2VwdCBmcm9tIFRXQlMgbWVhc3VyZVNjcm9sbGJhcigpXHJcbiAgICAgICAqIGZ1bmN0aW9uIGluIGh0dHBzOi8vZ2l0aHViLmNvbS90d2JzL2Jvb3RzdHJhcC9ibG9iL21hc3Rlci9qcy9tb2RhbC5qc1xyXG4gICAgICAgKiBJbiBJRSBhbmQgRWRnZSwgc2NvbGxiYXIgb24gYm9keSBhbmQgaHRtbCBlbGVtZW50IG92ZXJsYXkgYW5kIHNob3VsZFxyXG4gICAgICAgKiByZXR1cm4gYSB3aWR0aCBvZiAwLlxyXG4gICAgICAgKlxyXG4gICAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBUaGUgd2lkdGggb2YgdGhlIGJyb3dzZXIgc2NvbGxiYXIuXHJcbiAgICAgICAqL1xyXG4gICAgICBzY3JvbGxiYXJXaWR0aDogZnVuY3Rpb24oaXNCb2R5KSB7XHJcbiAgICAgICAgaWYgKGlzQm9keSkge1xyXG4gICAgICAgICAgaWYgKGFuZ3VsYXIuaXNVbmRlZmluZWQoQk9EWV9TQ1JPTExCQVJfV0lEVEgpKSB7XHJcbiAgICAgICAgICAgIHZhciBib2R5RWxlbSA9ICRkb2N1bWVudC5maW5kKCdib2R5Jyk7XHJcbiAgICAgICAgICAgIGJvZHlFbGVtLmFkZENsYXNzKCd1aWItcG9zaXRpb24tYm9keS1zY3JvbGxiYXItbWVhc3VyZScpO1xyXG4gICAgICAgICAgICBCT0RZX1NDUk9MTEJBUl9XSURUSCA9ICR3aW5kb3cuaW5uZXJXaWR0aCAtIGJvZHlFbGVtWzBdLmNsaWVudFdpZHRoO1xyXG4gICAgICAgICAgICBCT0RZX1NDUk9MTEJBUl9XSURUSCA9IGlzRmluaXRlKEJPRFlfU0NST0xMQkFSX1dJRFRIKSA/IEJPRFlfU0NST0xMQkFSX1dJRFRIIDogMDtcclxuICAgICAgICAgICAgYm9keUVsZW0ucmVtb3ZlQ2xhc3MoJ3VpYi1wb3NpdGlvbi1ib2R5LXNjcm9sbGJhci1tZWFzdXJlJyk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICByZXR1cm4gQk9EWV9TQ1JPTExCQVJfV0lEVEg7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoYW5ndWxhci5pc1VuZGVmaW5lZChTQ1JPTExCQVJfV0lEVEgpKSB7XHJcbiAgICAgICAgICB2YXIgc2Nyb2xsRWxlbSA9IGFuZ3VsYXIuZWxlbWVudCgnPGRpdiBjbGFzcz1cInVpYi1wb3NpdGlvbi1zY3JvbGxiYXItbWVhc3VyZVwiPjwvZGl2PicpO1xyXG4gICAgICAgICAgJGRvY3VtZW50LmZpbmQoJ2JvZHknKS5hcHBlbmQoc2Nyb2xsRWxlbSk7XHJcbiAgICAgICAgICBTQ1JPTExCQVJfV0lEVEggPSBzY3JvbGxFbGVtWzBdLm9mZnNldFdpZHRoIC0gc2Nyb2xsRWxlbVswXS5jbGllbnRXaWR0aDtcclxuICAgICAgICAgIFNDUk9MTEJBUl9XSURUSCA9IGlzRmluaXRlKFNDUk9MTEJBUl9XSURUSCkgPyBTQ1JPTExCQVJfV0lEVEggOiAwO1xyXG4gICAgICAgICAgc2Nyb2xsRWxlbS5yZW1vdmUoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBTQ1JPTExCQVJfV0lEVEg7XHJcbiAgICAgIH0sXHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogUHJvdmlkZXMgdGhlIHBhZGRpbmcgcmVxdWlyZWQgb24gYW4gZWxlbWVudCB0byByZXBsYWNlIHRoZSBzY3JvbGxiYXIuXHJcbiAgICAgICAqXHJcbiAgICAgICAqIEByZXR1cm5zIHtvYmplY3R9IEFuIG9iamVjdCB3aXRoIHRoZSBmb2xsb3dpbmcgcHJvcGVydGllczpcclxuICAgICAgICogICA8dWw+XHJcbiAgICAgICAqICAgICA8bGk+KipzY3JvbGxiYXJXaWR0aCoqOiB0aGUgd2lkdGggb2YgdGhlIHNjcm9sbGJhcjwvbGk+XHJcbiAgICAgICAqICAgICA8bGk+Kip3aWR0aE92ZXJmbG93Kio6IHdoZXRoZXIgdGhlIHRoZSB3aWR0aCBpcyBvdmVyZmxvd2luZzwvbGk+XHJcbiAgICAgICAqICAgICA8bGk+KipyaWdodCoqOiB0aGUgYW1vdW50IG9mIHJpZ2h0IHBhZGRpbmcgb24gdGhlIGVsZW1lbnQgbmVlZGVkIHRvIHJlcGxhY2UgdGhlIHNjcm9sbGJhcjwvbGk+XHJcbiAgICAgICAqICAgICA8bGk+KipyaWdodE9yaWdpbmFsKio6IHRoZSBhbW91bnQgb2YgcmlnaHQgcGFkZGluZyBjdXJyZW50bHkgb24gdGhlIGVsZW1lbnQ8L2xpPlxyXG4gICAgICAgKiAgICAgPGxpPioqaGVpZ2h0T3ZlcmZsb3cqKjogd2hldGhlciB0aGUgdGhlIGhlaWdodCBpcyBvdmVyZmxvd2luZzwvbGk+XHJcbiAgICAgICAqICAgICA8bGk+Kipib3R0b20qKjogdGhlIGFtb3VudCBvZiBib3R0b20gcGFkZGluZyBvbiB0aGUgZWxlbWVudCBuZWVkZWQgdG8gcmVwbGFjZSB0aGUgc2Nyb2xsYmFyPC9saT5cclxuICAgICAgICogICAgIDxsaT4qKmJvdHRvbU9yaWdpbmFsKio6IHRoZSBhbW91bnQgb2YgYm90dG9tIHBhZGRpbmcgY3VycmVudGx5IG9uIHRoZSBlbGVtZW50PC9saT5cclxuICAgICAgICogICA8L3VsPlxyXG4gICAgICAgKi9cclxuICAgICAgc2Nyb2xsYmFyUGFkZGluZzogZnVuY3Rpb24oZWxlbSkge1xyXG4gICAgICAgIGVsZW0gPSB0aGlzLmdldFJhd05vZGUoZWxlbSk7XHJcblxyXG4gICAgICAgIHZhciBlbGVtU3R5bGUgPSAkd2luZG93LmdldENvbXB1dGVkU3R5bGUoZWxlbSk7XHJcbiAgICAgICAgdmFyIHBhZGRpbmdSaWdodCA9IHRoaXMucGFyc2VTdHlsZShlbGVtU3R5bGUucGFkZGluZ1JpZ2h0KTtcclxuICAgICAgICB2YXIgcGFkZGluZ0JvdHRvbSA9IHRoaXMucGFyc2VTdHlsZShlbGVtU3R5bGUucGFkZGluZ0JvdHRvbSk7XHJcbiAgICAgICAgdmFyIHNjcm9sbFBhcmVudCA9IHRoaXMuc2Nyb2xsUGFyZW50KGVsZW0sIGZhbHNlLCB0cnVlKTtcclxuICAgICAgICB2YXIgc2Nyb2xsYmFyV2lkdGggPSB0aGlzLnNjcm9sbGJhcldpZHRoKEJPRFlfUkVHRVgudGVzdChzY3JvbGxQYXJlbnQudGFnTmFtZSkpO1xyXG5cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgc2Nyb2xsYmFyV2lkdGg6IHNjcm9sbGJhcldpZHRoLFxyXG4gICAgICAgICAgd2lkdGhPdmVyZmxvdzogc2Nyb2xsUGFyZW50LnNjcm9sbFdpZHRoID4gc2Nyb2xsUGFyZW50LmNsaWVudFdpZHRoLFxyXG4gICAgICAgICAgcmlnaHQ6IHBhZGRpbmdSaWdodCArIHNjcm9sbGJhcldpZHRoLFxyXG4gICAgICAgICAgb3JpZ2luYWxSaWdodDogcGFkZGluZ1JpZ2h0LFxyXG4gICAgICAgICAgaGVpZ2h0T3ZlcmZsb3c6IHNjcm9sbFBhcmVudC5zY3JvbGxIZWlnaHQgPiBzY3JvbGxQYXJlbnQuY2xpZW50SGVpZ2h0LFxyXG4gICAgICAgICAgYm90dG9tOiBwYWRkaW5nQm90dG9tICsgc2Nyb2xsYmFyV2lkdGgsXHJcbiAgICAgICAgICBvcmlnaW5hbEJvdHRvbTogcGFkZGluZ0JvdHRvbVxyXG4gICAgICAgICB9O1xyXG4gICAgICB9LFxyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIENoZWNrcyB0byBzZWUgaWYgdGhlIGVsZW1lbnQgaXMgc2Nyb2xsYWJsZS5cclxuICAgICAgICpcclxuICAgICAgICogQHBhcmFtIHtlbGVtZW50fSBlbGVtIC0gVGhlIGVsZW1lbnQgdG8gY2hlY2suXHJcbiAgICAgICAqIEBwYXJhbSB7Ym9vbGVhbj19IFtpbmNsdWRlSGlkZGVuPWZhbHNlXSAtIFNob3VsZCBzY3JvbGwgc3R5bGUgb2YgJ2hpZGRlbicgYmUgY29uc2lkZXJlZCxcclxuICAgICAgICogICBkZWZhdWx0IGlzIGZhbHNlLlxyXG4gICAgICAgKlxyXG4gICAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gV2hldGhlciB0aGUgZWxlbWVudCBpcyBzY3JvbGxhYmxlLlxyXG4gICAgICAgKi9cclxuICAgICAgaXNTY3JvbGxhYmxlOiBmdW5jdGlvbihlbGVtLCBpbmNsdWRlSGlkZGVuKSB7XHJcbiAgICAgICAgZWxlbSA9IHRoaXMuZ2V0UmF3Tm9kZShlbGVtKTtcclxuXHJcbiAgICAgICAgdmFyIG92ZXJmbG93UmVnZXggPSBpbmNsdWRlSGlkZGVuID8gT1ZFUkZMT1dfUkVHRVguaGlkZGVuIDogT1ZFUkZMT1dfUkVHRVgubm9ybWFsO1xyXG4gICAgICAgIHZhciBlbGVtU3R5bGUgPSAkd2luZG93LmdldENvbXB1dGVkU3R5bGUoZWxlbSk7XHJcbiAgICAgICAgcmV0dXJuIG92ZXJmbG93UmVnZXgudGVzdChlbGVtU3R5bGUub3ZlcmZsb3cgKyBlbGVtU3R5bGUub3ZlcmZsb3dZICsgZWxlbVN0eWxlLm92ZXJmbG93WCk7XHJcbiAgICAgIH0sXHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogUHJvdmlkZXMgdGhlIGNsb3Nlc3Qgc2Nyb2xsYWJsZSBhbmNlc3Rvci5cclxuICAgICAgICogQSBwb3J0IG9mIHRoZSBqUXVlcnkgVUkgc2Nyb2xsUGFyZW50IG1ldGhvZDpcclxuICAgICAgICogaHR0cHM6Ly9naXRodWIuY29tL2pxdWVyeS9qcXVlcnktdWkvYmxvYi9tYXN0ZXIvdWkvc2Nyb2xsLXBhcmVudC5qc1xyXG4gICAgICAgKlxyXG4gICAgICAgKiBAcGFyYW0ge2VsZW1lbnR9IGVsZW0gLSBUaGUgZWxlbWVudCB0byBmaW5kIHRoZSBzY3JvbGwgcGFyZW50IG9mLlxyXG4gICAgICAgKiBAcGFyYW0ge2Jvb2xlYW49fSBbaW5jbHVkZUhpZGRlbj1mYWxzZV0gLSBTaG91bGQgc2Nyb2xsIHN0eWxlIG9mICdoaWRkZW4nIGJlIGNvbnNpZGVyZWQsXHJcbiAgICAgICAqICAgZGVmYXVsdCBpcyBmYWxzZS5cclxuICAgICAgICogQHBhcmFtIHtib29sZWFuPX0gW2luY2x1ZGVTZWxmPWZhbHNlXSAtIFNob3VsZCB0aGUgZWxlbWVudCBiZWluZyBwYXNzZWQgYmVcclxuICAgICAgICogaW5jbHVkZWQgaW4gdGhlIHNjcm9sbGFibGUgbGxva3VwLlxyXG4gICAgICAgKlxyXG4gICAgICAgKiBAcmV0dXJucyB7ZWxlbWVudH0gQSBIVE1MIGVsZW1lbnQuXHJcbiAgICAgICAqL1xyXG4gICAgICBzY3JvbGxQYXJlbnQ6IGZ1bmN0aW9uKGVsZW0sIGluY2x1ZGVIaWRkZW4sIGluY2x1ZGVTZWxmKSB7XHJcbiAgICAgICAgZWxlbSA9IHRoaXMuZ2V0UmF3Tm9kZShlbGVtKTtcclxuXHJcbiAgICAgICAgdmFyIG92ZXJmbG93UmVnZXggPSBpbmNsdWRlSGlkZGVuID8gT1ZFUkZMT1dfUkVHRVguaGlkZGVuIDogT1ZFUkZMT1dfUkVHRVgubm9ybWFsO1xyXG4gICAgICAgIHZhciBkb2N1bWVudEVsID0gJGRvY3VtZW50WzBdLmRvY3VtZW50RWxlbWVudDtcclxuICAgICAgICB2YXIgZWxlbVN0eWxlID0gJHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKGVsZW0pO1xyXG4gICAgICAgIGlmIChpbmNsdWRlU2VsZiAmJiBvdmVyZmxvd1JlZ2V4LnRlc3QoZWxlbVN0eWxlLm92ZXJmbG93ICsgZWxlbVN0eWxlLm92ZXJmbG93WSArIGVsZW1TdHlsZS5vdmVyZmxvd1gpKSB7XHJcbiAgICAgICAgICByZXR1cm4gZWxlbTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIGV4Y2x1ZGVTdGF0aWMgPSBlbGVtU3R5bGUucG9zaXRpb24gPT09ICdhYnNvbHV0ZSc7XHJcbiAgICAgICAgdmFyIHNjcm9sbFBhcmVudCA9IGVsZW0ucGFyZW50RWxlbWVudCB8fCBkb2N1bWVudEVsO1xyXG5cclxuICAgICAgICBpZiAoc2Nyb2xsUGFyZW50ID09PSBkb2N1bWVudEVsIHx8IGVsZW1TdHlsZS5wb3NpdGlvbiA9PT0gJ2ZpeGVkJykge1xyXG4gICAgICAgICAgcmV0dXJuIGRvY3VtZW50RWw7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB3aGlsZSAoc2Nyb2xsUGFyZW50LnBhcmVudEVsZW1lbnQgJiYgc2Nyb2xsUGFyZW50ICE9PSBkb2N1bWVudEVsKSB7XHJcbiAgICAgICAgICB2YXIgc3BTdHlsZSA9ICR3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShzY3JvbGxQYXJlbnQpO1xyXG4gICAgICAgICAgaWYgKGV4Y2x1ZGVTdGF0aWMgJiYgc3BTdHlsZS5wb3NpdGlvbiAhPT0gJ3N0YXRpYycpIHtcclxuICAgICAgICAgICAgZXhjbHVkZVN0YXRpYyA9IGZhbHNlO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIGlmICghZXhjbHVkZVN0YXRpYyAmJiBvdmVyZmxvd1JlZ2V4LnRlc3Qoc3BTdHlsZS5vdmVyZmxvdyArIHNwU3R5bGUub3ZlcmZsb3dZICsgc3BTdHlsZS5vdmVyZmxvd1gpKSB7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgc2Nyb2xsUGFyZW50ID0gc2Nyb2xsUGFyZW50LnBhcmVudEVsZW1lbnQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gc2Nyb2xsUGFyZW50O1xyXG4gICAgICB9LFxyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIFByb3ZpZGVzIHJlYWQtb25seSBlcXVpdmFsZW50IG9mIGpRdWVyeSdzIHBvc2l0aW9uIGZ1bmN0aW9uOlxyXG4gICAgICAgKiBodHRwOi8vYXBpLmpxdWVyeS5jb20vcG9zaXRpb24vIC0gZGlzdGFuY2UgdG8gY2xvc2VzdCBwb3NpdGlvbmVkXHJcbiAgICAgICAqIGFuY2VzdG9yLiAgRG9lcyBub3QgYWNjb3VudCBmb3IgbWFyZ2lucyBieSBkZWZhdWx0IGxpa2UgalF1ZXJ5IHBvc2l0aW9uLlxyXG4gICAgICAgKlxyXG4gICAgICAgKiBAcGFyYW0ge2VsZW1lbnR9IGVsZW0gLSBUaGUgZWxlbWVudCB0byBjYWNsdWxhdGUgdGhlIHBvc2l0aW9uIG9uLlxyXG4gICAgICAgKiBAcGFyYW0ge2Jvb2xlYW49fSBbaW5jbHVkZU1hcmdpbnM9ZmFsc2VdIC0gU2hvdWxkIG1hcmdpbnMgYmUgYWNjb3VudGVkXHJcbiAgICAgICAqIGZvciwgZGVmYXVsdCBpcyBmYWxzZS5cclxuICAgICAgICpcclxuICAgICAgICogQHJldHVybnMge29iamVjdH0gQW4gb2JqZWN0IHdpdGggdGhlIGZvbGxvd2luZyBwcm9wZXJ0aWVzOlxyXG4gICAgICAgKiAgIDx1bD5cclxuICAgICAgICogICAgIDxsaT4qKndpZHRoKio6IHRoZSB3aWR0aCBvZiB0aGUgZWxlbWVudDwvbGk+XHJcbiAgICAgICAqICAgICA8bGk+KipoZWlnaHQqKjogdGhlIGhlaWdodCBvZiB0aGUgZWxlbWVudDwvbGk+XHJcbiAgICAgICAqICAgICA8bGk+Kip0b3AqKjogZGlzdGFuY2UgdG8gdG9wIGVkZ2Ugb2Ygb2Zmc2V0IHBhcmVudDwvbGk+XHJcbiAgICAgICAqICAgICA8bGk+KipsZWZ0Kio6IGRpc3RhbmNlIHRvIGxlZnQgZWRnZSBvZiBvZmZzZXQgcGFyZW50PC9saT5cclxuICAgICAgICogICA8L3VsPlxyXG4gICAgICAgKi9cclxuICAgICAgcG9zaXRpb246IGZ1bmN0aW9uKGVsZW0sIGluY2x1ZGVNYWdpbnMpIHtcclxuICAgICAgICBlbGVtID0gdGhpcy5nZXRSYXdOb2RlKGVsZW0pO1xyXG5cclxuICAgICAgICB2YXIgZWxlbU9mZnNldCA9IHRoaXMub2Zmc2V0KGVsZW0pO1xyXG4gICAgICAgIGlmIChpbmNsdWRlTWFnaW5zKSB7XHJcbiAgICAgICAgICB2YXIgZWxlbVN0eWxlID0gJHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKGVsZW0pO1xyXG4gICAgICAgICAgZWxlbU9mZnNldC50b3AgLT0gdGhpcy5wYXJzZVN0eWxlKGVsZW1TdHlsZS5tYXJnaW5Ub3ApO1xyXG4gICAgICAgICAgZWxlbU9mZnNldC5sZWZ0IC09IHRoaXMucGFyc2VTdHlsZShlbGVtU3R5bGUubWFyZ2luTGVmdCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciBwYXJlbnQgPSB0aGlzLm9mZnNldFBhcmVudChlbGVtKTtcclxuICAgICAgICB2YXIgcGFyZW50T2Zmc2V0ID0ge3RvcDogMCwgbGVmdDogMH07XHJcblxyXG4gICAgICAgIGlmIChwYXJlbnQgIT09ICRkb2N1bWVudFswXS5kb2N1bWVudEVsZW1lbnQpIHtcclxuICAgICAgICAgIHBhcmVudE9mZnNldCA9IHRoaXMub2Zmc2V0KHBhcmVudCk7XHJcbiAgICAgICAgICBwYXJlbnRPZmZzZXQudG9wICs9IHBhcmVudC5jbGllbnRUb3AgLSBwYXJlbnQuc2Nyb2xsVG9wO1xyXG4gICAgICAgICAgcGFyZW50T2Zmc2V0LmxlZnQgKz0gcGFyZW50LmNsaWVudExlZnQgLSBwYXJlbnQuc2Nyb2xsTGVmdDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB3aWR0aDogTWF0aC5yb3VuZChhbmd1bGFyLmlzTnVtYmVyKGVsZW1PZmZzZXQud2lkdGgpID8gZWxlbU9mZnNldC53aWR0aCA6IGVsZW0ub2Zmc2V0V2lkdGgpLFxyXG4gICAgICAgICAgaGVpZ2h0OiBNYXRoLnJvdW5kKGFuZ3VsYXIuaXNOdW1iZXIoZWxlbU9mZnNldC5oZWlnaHQpID8gZWxlbU9mZnNldC5oZWlnaHQgOiBlbGVtLm9mZnNldEhlaWdodCksXHJcbiAgICAgICAgICB0b3A6IE1hdGgucm91bmQoZWxlbU9mZnNldC50b3AgLSBwYXJlbnRPZmZzZXQudG9wKSxcclxuICAgICAgICAgIGxlZnQ6IE1hdGgucm91bmQoZWxlbU9mZnNldC5sZWZ0IC0gcGFyZW50T2Zmc2V0LmxlZnQpXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBQcm92aWRlcyByZWFkLW9ubHkgZXF1aXZhbGVudCBvZiBqUXVlcnkncyBvZmZzZXQgZnVuY3Rpb246XHJcbiAgICAgICAqIGh0dHA6Ly9hcGkuanF1ZXJ5LmNvbS9vZmZzZXQvIC0gZGlzdGFuY2UgdG8gdmlld3BvcnQuICBEb2VzXHJcbiAgICAgICAqIG5vdCBhY2NvdW50IGZvciBib3JkZXJzLCBtYXJnaW5zLCBvciBwYWRkaW5nIG9uIHRoZSBib2R5XHJcbiAgICAgICAqIGVsZW1lbnQuXHJcbiAgICAgICAqXHJcbiAgICAgICAqIEBwYXJhbSB7ZWxlbWVudH0gZWxlbSAtIFRoZSBlbGVtZW50IHRvIGNhbGN1bGF0ZSB0aGUgb2Zmc2V0IG9uLlxyXG4gICAgICAgKlxyXG4gICAgICAgKiBAcmV0dXJucyB7b2JqZWN0fSBBbiBvYmplY3Qgd2l0aCB0aGUgZm9sbG93aW5nIHByb3BlcnRpZXM6XHJcbiAgICAgICAqICAgPHVsPlxyXG4gICAgICAgKiAgICAgPGxpPioqd2lkdGgqKjogdGhlIHdpZHRoIG9mIHRoZSBlbGVtZW50PC9saT5cclxuICAgICAgICogICAgIDxsaT4qKmhlaWdodCoqOiB0aGUgaGVpZ2h0IG9mIHRoZSBlbGVtZW50PC9saT5cclxuICAgICAgICogICAgIDxsaT4qKnRvcCoqOiBkaXN0YW5jZSB0byB0b3AgZWRnZSBvZiB2aWV3cG9ydDwvbGk+XHJcbiAgICAgICAqICAgICA8bGk+KipyaWdodCoqOiBkaXN0YW5jZSB0byBib3R0b20gZWRnZSBvZiB2aWV3cG9ydDwvbGk+XHJcbiAgICAgICAqICAgPC91bD5cclxuICAgICAgICovXHJcbiAgICAgIG9mZnNldDogZnVuY3Rpb24oZWxlbSkge1xyXG4gICAgICAgIGVsZW0gPSB0aGlzLmdldFJhd05vZGUoZWxlbSk7XHJcblxyXG4gICAgICAgIHZhciBlbGVtQkNSID0gZWxlbS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgd2lkdGg6IE1hdGgucm91bmQoYW5ndWxhci5pc051bWJlcihlbGVtQkNSLndpZHRoKSA/IGVsZW1CQ1Iud2lkdGggOiBlbGVtLm9mZnNldFdpZHRoKSxcclxuICAgICAgICAgIGhlaWdodDogTWF0aC5yb3VuZChhbmd1bGFyLmlzTnVtYmVyKGVsZW1CQ1IuaGVpZ2h0KSA/IGVsZW1CQ1IuaGVpZ2h0IDogZWxlbS5vZmZzZXRIZWlnaHQpLFxyXG4gICAgICAgICAgdG9wOiBNYXRoLnJvdW5kKGVsZW1CQ1IudG9wICsgKCR3aW5kb3cucGFnZVlPZmZzZXQgfHwgJGRvY3VtZW50WzBdLmRvY3VtZW50RWxlbWVudC5zY3JvbGxUb3ApKSxcclxuICAgICAgICAgIGxlZnQ6IE1hdGgucm91bmQoZWxlbUJDUi5sZWZ0ICsgKCR3aW5kb3cucGFnZVhPZmZzZXQgfHwgJGRvY3VtZW50WzBdLmRvY3VtZW50RWxlbWVudC5zY3JvbGxMZWZ0KSlcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIFByb3ZpZGVzIG9mZnNldCBkaXN0YW5jZSB0byB0aGUgY2xvc2VzdCBzY3JvbGxhYmxlIGFuY2VzdG9yXHJcbiAgICAgICAqIG9yIHZpZXdwb3J0LiAgQWNjb3VudHMgZm9yIGJvcmRlciBhbmQgc2Nyb2xsYmFyIHdpZHRoLlxyXG4gICAgICAgKlxyXG4gICAgICAgKiBSaWdodCBhbmQgYm90dG9tIGRpbWVuc2lvbnMgcmVwcmVzZW50IHRoZSBkaXN0YW5jZSB0byB0aGVcclxuICAgICAgICogcmVzcGVjdGl2ZSBlZGdlIG9mIHRoZSB2aWV3cG9ydCBlbGVtZW50LiAgSWYgdGhlIGVsZW1lbnRcclxuICAgICAgICogZWRnZSBleHRlbmRzIGJleW9uZCB0aGUgdmlld3BvcnQsIGEgbmVnYXRpdmUgdmFsdWUgd2lsbCBiZVxyXG4gICAgICAgKiByZXBvcnRlZC5cclxuICAgICAgICpcclxuICAgICAgICogQHBhcmFtIHtlbGVtZW50fSBlbGVtIC0gVGhlIGVsZW1lbnQgdG8gZ2V0IHRoZSB2aWV3cG9ydCBvZmZzZXQgZm9yLlxyXG4gICAgICAgKiBAcGFyYW0ge2Jvb2xlYW49fSBbdXNlRG9jdW1lbnQ9ZmFsc2VdIC0gU2hvdWxkIHRoZSB2aWV3cG9ydCBiZSB0aGUgZG9jdW1lbnQgZWxlbWVudCBpbnN0ZWFkXHJcbiAgICAgICAqIG9mIHRoZSBmaXJzdCBzY3JvbGxhYmxlIGVsZW1lbnQsIGRlZmF1bHQgaXMgZmFsc2UuXHJcbiAgICAgICAqIEBwYXJhbSB7Ym9vbGVhbj19IFtpbmNsdWRlUGFkZGluZz10cnVlXSAtIFNob3VsZCB0aGUgcGFkZGluZyBvbiB0aGUgb2Zmc2V0IHBhcmVudCBlbGVtZW50XHJcbiAgICAgICAqIGJlIGFjY291bnRlZCBmb3IsIGRlZmF1bHQgaXMgdHJ1ZS5cclxuICAgICAgICpcclxuICAgICAgICogQHJldHVybnMge29iamVjdH0gQW4gb2JqZWN0IHdpdGggdGhlIGZvbGxvd2luZyBwcm9wZXJ0aWVzOlxyXG4gICAgICAgKiAgIDx1bD5cclxuICAgICAgICogICAgIDxsaT4qKnRvcCoqOiBkaXN0YW5jZSB0byB0aGUgdG9wIGNvbnRlbnQgZWRnZSBvZiB2aWV3cG9ydCBlbGVtZW50PC9saT5cclxuICAgICAgICogICAgIDxsaT4qKmJvdHRvbSoqOiBkaXN0YW5jZSB0byB0aGUgYm90dG9tIGNvbnRlbnQgZWRnZSBvZiB2aWV3cG9ydCBlbGVtZW50PC9saT5cclxuICAgICAgICogICAgIDxsaT4qKmxlZnQqKjogZGlzdGFuY2UgdG8gdGhlIGxlZnQgY29udGVudCBlZGdlIG9mIHZpZXdwb3J0IGVsZW1lbnQ8L2xpPlxyXG4gICAgICAgKiAgICAgPGxpPioqcmlnaHQqKjogZGlzdGFuY2UgdG8gdGhlIHJpZ2h0IGNvbnRlbnQgZWRnZSBvZiB2aWV3cG9ydCBlbGVtZW50PC9saT5cclxuICAgICAgICogICA8L3VsPlxyXG4gICAgICAgKi9cclxuICAgICAgdmlld3BvcnRPZmZzZXQ6IGZ1bmN0aW9uKGVsZW0sIHVzZURvY3VtZW50LCBpbmNsdWRlUGFkZGluZykge1xyXG4gICAgICAgIGVsZW0gPSB0aGlzLmdldFJhd05vZGUoZWxlbSk7XHJcbiAgICAgICAgaW5jbHVkZVBhZGRpbmcgPSBpbmNsdWRlUGFkZGluZyAhPT0gZmFsc2UgPyB0cnVlIDogZmFsc2U7XHJcblxyXG4gICAgICAgIHZhciBlbGVtQkNSID0gZWxlbS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcclxuICAgICAgICB2YXIgb2Zmc2V0QkNSID0ge3RvcDogMCwgbGVmdDogMCwgYm90dG9tOiAwLCByaWdodDogMH07XHJcblxyXG4gICAgICAgIHZhciBvZmZzZXRQYXJlbnQgPSB1c2VEb2N1bWVudCA/ICRkb2N1bWVudFswXS5kb2N1bWVudEVsZW1lbnQgOiB0aGlzLnNjcm9sbFBhcmVudChlbGVtKTtcclxuICAgICAgICB2YXIgb2Zmc2V0UGFyZW50QkNSID0gb2Zmc2V0UGFyZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xyXG5cclxuICAgICAgICBvZmZzZXRCQ1IudG9wID0gb2Zmc2V0UGFyZW50QkNSLnRvcCArIG9mZnNldFBhcmVudC5jbGllbnRUb3A7XHJcbiAgICAgICAgb2Zmc2V0QkNSLmxlZnQgPSBvZmZzZXRQYXJlbnRCQ1IubGVmdCArIG9mZnNldFBhcmVudC5jbGllbnRMZWZ0O1xyXG4gICAgICAgIGlmIChvZmZzZXRQYXJlbnQgPT09ICRkb2N1bWVudFswXS5kb2N1bWVudEVsZW1lbnQpIHtcclxuICAgICAgICAgIG9mZnNldEJDUi50b3AgKz0gJHdpbmRvdy5wYWdlWU9mZnNldDtcclxuICAgICAgICAgIG9mZnNldEJDUi5sZWZ0ICs9ICR3aW5kb3cucGFnZVhPZmZzZXQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIG9mZnNldEJDUi5ib3R0b20gPSBvZmZzZXRCQ1IudG9wICsgb2Zmc2V0UGFyZW50LmNsaWVudEhlaWdodDtcclxuICAgICAgICBvZmZzZXRCQ1IucmlnaHQgPSBvZmZzZXRCQ1IubGVmdCArIG9mZnNldFBhcmVudC5jbGllbnRXaWR0aDtcclxuXHJcbiAgICAgICAgaWYgKGluY2x1ZGVQYWRkaW5nKSB7XHJcbiAgICAgICAgICB2YXIgb2Zmc2V0UGFyZW50U3R5bGUgPSAkd2luZG93LmdldENvbXB1dGVkU3R5bGUob2Zmc2V0UGFyZW50KTtcclxuICAgICAgICAgIG9mZnNldEJDUi50b3AgKz0gdGhpcy5wYXJzZVN0eWxlKG9mZnNldFBhcmVudFN0eWxlLnBhZGRpbmdUb3ApO1xyXG4gICAgICAgICAgb2Zmc2V0QkNSLmJvdHRvbSAtPSB0aGlzLnBhcnNlU3R5bGUob2Zmc2V0UGFyZW50U3R5bGUucGFkZGluZ0JvdHRvbSk7XHJcbiAgICAgICAgICBvZmZzZXRCQ1IubGVmdCArPSB0aGlzLnBhcnNlU3R5bGUob2Zmc2V0UGFyZW50U3R5bGUucGFkZGluZ0xlZnQpO1xyXG4gICAgICAgICAgb2Zmc2V0QkNSLnJpZ2h0IC09IHRoaXMucGFyc2VTdHlsZShvZmZzZXRQYXJlbnRTdHlsZS5wYWRkaW5nUmlnaHQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHRvcDogTWF0aC5yb3VuZChlbGVtQkNSLnRvcCAtIG9mZnNldEJDUi50b3ApLFxyXG4gICAgICAgICAgYm90dG9tOiBNYXRoLnJvdW5kKG9mZnNldEJDUi5ib3R0b20gLSBlbGVtQkNSLmJvdHRvbSksXHJcbiAgICAgICAgICBsZWZ0OiBNYXRoLnJvdW5kKGVsZW1CQ1IubGVmdCAtIG9mZnNldEJDUi5sZWZ0KSxcclxuICAgICAgICAgIHJpZ2h0OiBNYXRoLnJvdW5kKG9mZnNldEJDUi5yaWdodCAtIGVsZW1CQ1IucmlnaHQpXHJcbiAgICAgICAgfTtcclxuICAgICAgfSxcclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBQcm92aWRlcyBhbiBhcnJheSBvZiBwbGFjZW1lbnQgdmFsdWVzIHBhcnNlZCBmcm9tIGEgcGxhY2VtZW50IHN0cmluZy5cclxuICAgICAgICogQWxvbmcgd2l0aCB0aGUgJ2F1dG8nIGluZGljYXRvciwgc3VwcG9ydGVkIHBsYWNlbWVudCBzdHJpbmdzIGFyZTpcclxuICAgICAgICogICA8dWw+XHJcbiAgICAgICAqICAgICA8bGk+dG9wOiBlbGVtZW50IG9uIHRvcCwgaG9yaXpvbnRhbGx5IGNlbnRlcmVkIG9uIGhvc3QgZWxlbWVudC48L2xpPlxyXG4gICAgICAgKiAgICAgPGxpPnRvcC1sZWZ0OiBlbGVtZW50IG9uIHRvcCwgbGVmdCBlZGdlIGFsaWduZWQgd2l0aCBob3N0IGVsZW1lbnQgbGVmdCBlZGdlLjwvbGk+XHJcbiAgICAgICAqICAgICA8bGk+dG9wLXJpZ2h0OiBlbGVtZW50IG9uIHRvcCwgbGVyaWdodGZ0IGVkZ2UgYWxpZ25lZCB3aXRoIGhvc3QgZWxlbWVudCByaWdodCBlZGdlLjwvbGk+XHJcbiAgICAgICAqICAgICA8bGk+Ym90dG9tOiBlbGVtZW50IG9uIGJvdHRvbSwgaG9yaXpvbnRhbGx5IGNlbnRlcmVkIG9uIGhvc3QgZWxlbWVudC48L2xpPlxyXG4gICAgICAgKiAgICAgPGxpPmJvdHRvbS1sZWZ0OiBlbGVtZW50IG9uIGJvdHRvbSwgbGVmdCBlZGdlIGFsaWduZWQgd2l0aCBob3N0IGVsZW1lbnQgbGVmdCBlZGdlLjwvbGk+XHJcbiAgICAgICAqICAgICA8bGk+Ym90dG9tLXJpZ2h0OiBlbGVtZW50IG9uIGJvdHRvbSwgcmlnaHQgZWRnZSBhbGlnbmVkIHdpdGggaG9zdCBlbGVtZW50IHJpZ2h0IGVkZ2UuPC9saT5cclxuICAgICAgICogICAgIDxsaT5sZWZ0OiBlbGVtZW50IG9uIGxlZnQsIHZlcnRpY2FsbHkgY2VudGVyZWQgb24gaG9zdCBlbGVtZW50LjwvbGk+XHJcbiAgICAgICAqICAgICA8bGk+bGVmdC10b3A6IGVsZW1lbnQgb24gbGVmdCwgdG9wIGVkZ2UgYWxpZ25lZCB3aXRoIGhvc3QgZWxlbWVudCB0b3AgZWRnZS48L2xpPlxyXG4gICAgICAgKiAgICAgPGxpPmxlZnQtYm90dG9tOiBlbGVtZW50IG9uIGxlZnQsIGJvdHRvbSBlZGdlIGFsaWduZWQgd2l0aCBob3N0IGVsZW1lbnQgYm90dG9tIGVkZ2UuPC9saT5cclxuICAgICAgICogICAgIDxsaT5yaWdodDogZWxlbWVudCBvbiByaWdodCwgdmVydGljYWxseSBjZW50ZXJlZCBvbiBob3N0IGVsZW1lbnQuPC9saT5cclxuICAgICAgICogICAgIDxsaT5yaWdodC10b3A6IGVsZW1lbnQgb24gcmlnaHQsIHRvcCBlZGdlIGFsaWduZWQgd2l0aCBob3N0IGVsZW1lbnQgdG9wIGVkZ2UuPC9saT5cclxuICAgICAgICogICAgIDxsaT5yaWdodC1ib3R0b206IGVsZW1lbnQgb24gcmlnaHQsIGJvdHRvbSBlZGdlIGFsaWduZWQgd2l0aCBob3N0IGVsZW1lbnQgYm90dG9tIGVkZ2UuPC9saT5cclxuICAgICAgICogICA8L3VsPlxyXG4gICAgICAgKiBBIHBsYWNlbWVudCBzdHJpbmcgd2l0aCBhbiAnYXV0bycgaW5kaWNhdG9yIGlzIGV4cGVjdGVkIHRvIGJlXHJcbiAgICAgICAqIHNwYWNlIHNlcGFyYXRlZCBmcm9tIHRoZSBwbGFjZW1lbnQsIGkuZTogJ2F1dG8gYm90dG9tLWxlZnQnICBJZlxyXG4gICAgICAgKiB0aGUgcHJpbWFyeSBhbmQgc2Vjb25kYXJ5IHBsYWNlbWVudCB2YWx1ZXMgZG8gbm90IG1hdGNoICd0b3AsXHJcbiAgICAgICAqIGJvdHRvbSwgbGVmdCwgcmlnaHQnIHRoZW4gJ3RvcCcgd2lsbCBiZSB0aGUgcHJpbWFyeSBwbGFjZW1lbnQgYW5kXHJcbiAgICAgICAqICdjZW50ZXInIHdpbGwgYmUgdGhlIHNlY29uZGFyeSBwbGFjZW1lbnQuICBJZiAnYXV0bycgaXMgcGFzc2VkLCB0cnVlXHJcbiAgICAgICAqIHdpbGwgYmUgcmV0dXJuZWQgYXMgdGhlIDNyZCB2YWx1ZSBvZiB0aGUgYXJyYXkuXHJcbiAgICAgICAqXHJcbiAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBwbGFjZW1lbnQgLSBUaGUgcGxhY2VtZW50IHN0cmluZyB0byBwYXJzZS5cclxuICAgICAgICpcclxuICAgICAgICogQHJldHVybnMge2FycmF5fSBBbiBhcnJheSB3aXRoIHRoZSBmb2xsb3dpbmcgdmFsdWVzXHJcbiAgICAgICAqIDx1bD5cclxuICAgICAgICogICA8bGk+KipbMF0qKjogVGhlIHByaW1hcnkgcGxhY2VtZW50LjwvbGk+XHJcbiAgICAgICAqICAgPGxpPioqWzFdKio6IFRoZSBzZWNvbmRhcnkgcGxhY2VtZW50LjwvbGk+XHJcbiAgICAgICAqICAgPGxpPioqWzJdKio6IElmIGF1dG8gaXMgcGFzc2VkOiB0cnVlLCBlbHNlIHVuZGVmaW5lZC48L2xpPlxyXG4gICAgICAgKiA8L3VsPlxyXG4gICAgICAgKi9cclxuICAgICAgcGFyc2VQbGFjZW1lbnQ6IGZ1bmN0aW9uKHBsYWNlbWVudCkge1xyXG4gICAgICAgIHZhciBhdXRvUGxhY2UgPSBQTEFDRU1FTlRfUkVHRVguYXV0by50ZXN0KHBsYWNlbWVudCk7XHJcbiAgICAgICAgaWYgKGF1dG9QbGFjZSkge1xyXG4gICAgICAgICAgcGxhY2VtZW50ID0gcGxhY2VtZW50LnJlcGxhY2UoUExBQ0VNRU5UX1JFR0VYLmF1dG8sICcnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHBsYWNlbWVudCA9IHBsYWNlbWVudC5zcGxpdCgnLScpO1xyXG5cclxuICAgICAgICBwbGFjZW1lbnRbMF0gPSBwbGFjZW1lbnRbMF0gfHwgJ3RvcCc7XHJcbiAgICAgICAgaWYgKCFQTEFDRU1FTlRfUkVHRVgucHJpbWFyeS50ZXN0KHBsYWNlbWVudFswXSkpIHtcclxuICAgICAgICAgIHBsYWNlbWVudFswXSA9ICd0b3AnO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcGxhY2VtZW50WzFdID0gcGxhY2VtZW50WzFdIHx8ICdjZW50ZXInO1xyXG4gICAgICAgIGlmICghUExBQ0VNRU5UX1JFR0VYLnNlY29uZGFyeS50ZXN0KHBsYWNlbWVudFsxXSkpIHtcclxuICAgICAgICAgIHBsYWNlbWVudFsxXSA9ICdjZW50ZXInO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGF1dG9QbGFjZSkge1xyXG4gICAgICAgICAgcGxhY2VtZW50WzJdID0gdHJ1ZTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgcGxhY2VtZW50WzJdID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gcGxhY2VtZW50O1xyXG4gICAgICB9LFxyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIFByb3ZpZGVzIGNvb3JkaW5hdGVzIGZvciBhbiBlbGVtZW50IHRvIGJlIHBvc2l0aW9uZWQgcmVsYXRpdmUgdG9cclxuICAgICAgICogYW5vdGhlciBlbGVtZW50LiAgUGFzc2luZyAnYXV0bycgYXMgcGFydCBvZiB0aGUgcGxhY2VtZW50IHBhcmFtZXRlclxyXG4gICAgICAgKiB3aWxsIGVuYWJsZSBzbWFydCBwbGFjZW1lbnQgLSB3aGVyZSB0aGUgZWxlbWVudCBmaXRzLiBpLmU6XHJcbiAgICAgICAqICdhdXRvIGxlZnQtdG9wJyB3aWxsIGNoZWNrIHRvIHNlZSBpZiB0aGVyZSBpcyBlbm91Z2ggc3BhY2UgdG8gdGhlIGxlZnRcclxuICAgICAgICogb2YgdGhlIGhvc3RFbGVtIHRvIGZpdCB0aGUgdGFyZ2V0RWxlbSwgaWYgbm90IHBsYWNlIHJpZ2h0IChzYW1lIGZvciBzZWNvbmRhcnlcclxuICAgICAgICogdG9wIHBsYWNlbWVudCkuICBBdmFpbGFibGUgc3BhY2UgaXMgY2FsY3VsYXRlZCB1c2luZyB0aGUgdmlld3BvcnRPZmZzZXRcclxuICAgICAgICogZnVuY3Rpb24uXHJcbiAgICAgICAqXHJcbiAgICAgICAqIEBwYXJhbSB7ZWxlbWVudH0gaG9zdEVsZW0gLSBUaGUgZWxlbWVudCB0byBwb3NpdGlvbiBhZ2FpbnN0LlxyXG4gICAgICAgKiBAcGFyYW0ge2VsZW1lbnR9IHRhcmdldEVsZW0gLSBUaGUgZWxlbWVudCB0byBwb3NpdGlvbi5cclxuICAgICAgICogQHBhcmFtIHtzdHJpbmc9fSBbcGxhY2VtZW50PXRvcF0gLSBUaGUgcGxhY2VtZW50IGZvciB0aGUgdGFyZ2V0RWxlbSxcclxuICAgICAgICogICBkZWZhdWx0IGlzICd0b3AnLiAnY2VudGVyJyBpcyBhc3N1bWVkIGFzIHNlY29uZGFyeSBwbGFjZW1lbnQgZm9yXHJcbiAgICAgICAqICAgJ3RvcCcsICdsZWZ0JywgJ3JpZ2h0JywgYW5kICdib3R0b20nIHBsYWNlbWVudHMuICBBdmFpbGFibGUgcGxhY2VtZW50cyBhcmU6XHJcbiAgICAgICAqICAgPHVsPlxyXG4gICAgICAgKiAgICAgPGxpPnRvcDwvbGk+XHJcbiAgICAgICAqICAgICA8bGk+dG9wLXJpZ2h0PC9saT5cclxuICAgICAgICogICAgIDxsaT50b3AtbGVmdDwvbGk+XHJcbiAgICAgICAqICAgICA8bGk+Ym90dG9tPC9saT5cclxuICAgICAgICogICAgIDxsaT5ib3R0b20tbGVmdDwvbGk+XHJcbiAgICAgICAqICAgICA8bGk+Ym90dG9tLXJpZ2h0PC9saT5cclxuICAgICAgICogICAgIDxsaT5sZWZ0PC9saT5cclxuICAgICAgICogICAgIDxsaT5sZWZ0LXRvcDwvbGk+XHJcbiAgICAgICAqICAgICA8bGk+bGVmdC1ib3R0b208L2xpPlxyXG4gICAgICAgKiAgICAgPGxpPnJpZ2h0PC9saT5cclxuICAgICAgICogICAgIDxsaT5yaWdodC10b3A8L2xpPlxyXG4gICAgICAgKiAgICAgPGxpPnJpZ2h0LWJvdHRvbTwvbGk+XHJcbiAgICAgICAqICAgPC91bD5cclxuICAgICAgICogQHBhcmFtIHtib29sZWFuPX0gW2FwcGVuZFRvQm9keT1mYWxzZV0gLSBTaG91bGQgdGhlIHRvcCBhbmQgbGVmdCB2YWx1ZXMgcmV0dXJuZWRcclxuICAgICAgICogICBiZSBjYWxjdWxhdGVkIGZyb20gdGhlIGJvZHkgZWxlbWVudCwgZGVmYXVsdCBpcyBmYWxzZS5cclxuICAgICAgICpcclxuICAgICAgICogQHJldHVybnMge29iamVjdH0gQW4gb2JqZWN0IHdpdGggdGhlIGZvbGxvd2luZyBwcm9wZXJ0aWVzOlxyXG4gICAgICAgKiAgIDx1bD5cclxuICAgICAgICogICAgIDxsaT4qKnRvcCoqOiBWYWx1ZSBmb3IgdGFyZ2V0RWxlbSB0b3AuPC9saT5cclxuICAgICAgICogICAgIDxsaT4qKmxlZnQqKjogVmFsdWUgZm9yIHRhcmdldEVsZW0gbGVmdC48L2xpPlxyXG4gICAgICAgKiAgICAgPGxpPioqcGxhY2VtZW50Kio6IFRoZSByZXNvbHZlZCBwbGFjZW1lbnQuPC9saT5cclxuICAgICAgICogICA8L3VsPlxyXG4gICAgICAgKi9cclxuICAgICAgcG9zaXRpb25FbGVtZW50czogZnVuY3Rpb24oaG9zdEVsZW0sIHRhcmdldEVsZW0sIHBsYWNlbWVudCwgYXBwZW5kVG9Cb2R5KSB7XHJcbiAgICAgICAgaG9zdEVsZW0gPSB0aGlzLmdldFJhd05vZGUoaG9zdEVsZW0pO1xyXG4gICAgICAgIHRhcmdldEVsZW0gPSB0aGlzLmdldFJhd05vZGUodGFyZ2V0RWxlbSk7XHJcblxyXG4gICAgICAgIC8vIG5lZWQgdG8gcmVhZCBmcm9tIHByb3AgdG8gc3VwcG9ydCB0ZXN0cy5cclxuICAgICAgICB2YXIgdGFyZ2V0V2lkdGggPSBhbmd1bGFyLmlzRGVmaW5lZCh0YXJnZXRFbGVtLm9mZnNldFdpZHRoKSA/IHRhcmdldEVsZW0ub2Zmc2V0V2lkdGggOiB0YXJnZXRFbGVtLnByb3AoJ29mZnNldFdpZHRoJyk7XHJcbiAgICAgICAgdmFyIHRhcmdldEhlaWdodCA9IGFuZ3VsYXIuaXNEZWZpbmVkKHRhcmdldEVsZW0ub2Zmc2V0SGVpZ2h0KSA/IHRhcmdldEVsZW0ub2Zmc2V0SGVpZ2h0IDogdGFyZ2V0RWxlbS5wcm9wKCdvZmZzZXRIZWlnaHQnKTtcclxuXHJcbiAgICAgICAgcGxhY2VtZW50ID0gdGhpcy5wYXJzZVBsYWNlbWVudChwbGFjZW1lbnQpO1xyXG5cclxuICAgICAgICB2YXIgaG9zdEVsZW1Qb3MgPSBhcHBlbmRUb0JvZHkgPyB0aGlzLm9mZnNldChob3N0RWxlbSkgOiB0aGlzLnBvc2l0aW9uKGhvc3RFbGVtKTtcclxuICAgICAgICB2YXIgdGFyZ2V0RWxlbVBvcyA9IHt0b3A6IDAsIGxlZnQ6IDAsIHBsYWNlbWVudDogJyd9O1xyXG5cclxuICAgICAgICBpZiAocGxhY2VtZW50WzJdKSB7XHJcbiAgICAgICAgICB2YXIgdmlld3BvcnRPZmZzZXQgPSB0aGlzLnZpZXdwb3J0T2Zmc2V0KGhvc3RFbGVtLCBhcHBlbmRUb0JvZHkpO1xyXG5cclxuICAgICAgICAgIHZhciB0YXJnZXRFbGVtU3R5bGUgPSAkd2luZG93LmdldENvbXB1dGVkU3R5bGUodGFyZ2V0RWxlbSk7XHJcbiAgICAgICAgICB2YXIgYWRqdXN0ZWRTaXplID0ge1xyXG4gICAgICAgICAgICB3aWR0aDogdGFyZ2V0V2lkdGggKyBNYXRoLnJvdW5kKE1hdGguYWJzKHRoaXMucGFyc2VTdHlsZSh0YXJnZXRFbGVtU3R5bGUubWFyZ2luTGVmdCkgKyB0aGlzLnBhcnNlU3R5bGUodGFyZ2V0RWxlbVN0eWxlLm1hcmdpblJpZ2h0KSkpLFxyXG4gICAgICAgICAgICBoZWlnaHQ6IHRhcmdldEhlaWdodCArIE1hdGgucm91bmQoTWF0aC5hYnModGhpcy5wYXJzZVN0eWxlKHRhcmdldEVsZW1TdHlsZS5tYXJnaW5Ub3ApICsgdGhpcy5wYXJzZVN0eWxlKHRhcmdldEVsZW1TdHlsZS5tYXJnaW5Cb3R0b20pKSlcclxuICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgcGxhY2VtZW50WzBdID0gcGxhY2VtZW50WzBdID09PSAndG9wJyAmJiBhZGp1c3RlZFNpemUuaGVpZ2h0ID4gdmlld3BvcnRPZmZzZXQudG9wICYmIGFkanVzdGVkU2l6ZS5oZWlnaHQgPD0gdmlld3BvcnRPZmZzZXQuYm90dG9tID8gJ2JvdHRvbScgOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgcGxhY2VtZW50WzBdID09PSAnYm90dG9tJyAmJiBhZGp1c3RlZFNpemUuaGVpZ2h0ID4gdmlld3BvcnRPZmZzZXQuYm90dG9tICYmIGFkanVzdGVkU2l6ZS5oZWlnaHQgPD0gdmlld3BvcnRPZmZzZXQudG9wID8gJ3RvcCcgOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgcGxhY2VtZW50WzBdID09PSAnbGVmdCcgJiYgYWRqdXN0ZWRTaXplLndpZHRoID4gdmlld3BvcnRPZmZzZXQubGVmdCAmJiBhZGp1c3RlZFNpemUud2lkdGggPD0gdmlld3BvcnRPZmZzZXQucmlnaHQgPyAncmlnaHQnIDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgIHBsYWNlbWVudFswXSA9PT0gJ3JpZ2h0JyAmJiBhZGp1c3RlZFNpemUud2lkdGggPiB2aWV3cG9ydE9mZnNldC5yaWdodCAmJiBhZGp1c3RlZFNpemUud2lkdGggPD0gdmlld3BvcnRPZmZzZXQubGVmdCA/ICdsZWZ0JyA6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICBwbGFjZW1lbnRbMF07XHJcblxyXG4gICAgICAgICAgcGxhY2VtZW50WzFdID0gcGxhY2VtZW50WzFdID09PSAndG9wJyAmJiBhZGp1c3RlZFNpemUuaGVpZ2h0IC0gaG9zdEVsZW1Qb3MuaGVpZ2h0ID4gdmlld3BvcnRPZmZzZXQuYm90dG9tICYmIGFkanVzdGVkU2l6ZS5oZWlnaHQgLSBob3N0RWxlbVBvcy5oZWlnaHQgPD0gdmlld3BvcnRPZmZzZXQudG9wID8gJ2JvdHRvbScgOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgcGxhY2VtZW50WzFdID09PSAnYm90dG9tJyAmJiBhZGp1c3RlZFNpemUuaGVpZ2h0IC0gaG9zdEVsZW1Qb3MuaGVpZ2h0ID4gdmlld3BvcnRPZmZzZXQudG9wICYmIGFkanVzdGVkU2l6ZS5oZWlnaHQgLSBob3N0RWxlbVBvcy5oZWlnaHQgPD0gdmlld3BvcnRPZmZzZXQuYm90dG9tID8gJ3RvcCcgOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgcGxhY2VtZW50WzFdID09PSAnbGVmdCcgJiYgYWRqdXN0ZWRTaXplLndpZHRoIC0gaG9zdEVsZW1Qb3Mud2lkdGggPiB2aWV3cG9ydE9mZnNldC5yaWdodCAmJiBhZGp1c3RlZFNpemUud2lkdGggLSBob3N0RWxlbVBvcy53aWR0aCA8PSB2aWV3cG9ydE9mZnNldC5sZWZ0ID8gJ3JpZ2h0JyA6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICBwbGFjZW1lbnRbMV0gPT09ICdyaWdodCcgJiYgYWRqdXN0ZWRTaXplLndpZHRoIC0gaG9zdEVsZW1Qb3Mud2lkdGggPiB2aWV3cG9ydE9mZnNldC5sZWZ0ICYmIGFkanVzdGVkU2l6ZS53aWR0aCAtIGhvc3RFbGVtUG9zLndpZHRoIDw9IHZpZXdwb3J0T2Zmc2V0LnJpZ2h0ID8gJ2xlZnQnIDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgIHBsYWNlbWVudFsxXTtcclxuXHJcbiAgICAgICAgICBpZiAocGxhY2VtZW50WzFdID09PSAnY2VudGVyJykge1xyXG4gICAgICAgICAgICBpZiAoUExBQ0VNRU5UX1JFR0VYLnZlcnRpY2FsLnRlc3QocGxhY2VtZW50WzBdKSkge1xyXG4gICAgICAgICAgICAgIHZhciB4T3ZlcmZsb3cgPSBob3N0RWxlbVBvcy53aWR0aCAvIDIgLSB0YXJnZXRXaWR0aCAvIDI7XHJcbiAgICAgICAgICAgICAgaWYgKHZpZXdwb3J0T2Zmc2V0LmxlZnQgKyB4T3ZlcmZsb3cgPCAwICYmIGFkanVzdGVkU2l6ZS53aWR0aCAtIGhvc3RFbGVtUG9zLndpZHRoIDw9IHZpZXdwb3J0T2Zmc2V0LnJpZ2h0KSB7XHJcbiAgICAgICAgICAgICAgICBwbGFjZW1lbnRbMV0gPSAnbGVmdCc7XHJcbiAgICAgICAgICAgICAgfSBlbHNlIGlmICh2aWV3cG9ydE9mZnNldC5yaWdodCArIHhPdmVyZmxvdyA8IDAgJiYgYWRqdXN0ZWRTaXplLndpZHRoIC0gaG9zdEVsZW1Qb3Mud2lkdGggPD0gdmlld3BvcnRPZmZzZXQubGVmdCkge1xyXG4gICAgICAgICAgICAgICAgcGxhY2VtZW50WzFdID0gJ3JpZ2h0JztcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgdmFyIHlPdmVyZmxvdyA9IGhvc3RFbGVtUG9zLmhlaWdodCAvIDIgLSBhZGp1c3RlZFNpemUuaGVpZ2h0IC8gMjtcclxuICAgICAgICAgICAgICBpZiAodmlld3BvcnRPZmZzZXQudG9wICsgeU92ZXJmbG93IDwgMCAmJiBhZGp1c3RlZFNpemUuaGVpZ2h0IC0gaG9zdEVsZW1Qb3MuaGVpZ2h0IDw9IHZpZXdwb3J0T2Zmc2V0LmJvdHRvbSkge1xyXG4gICAgICAgICAgICAgICAgcGxhY2VtZW50WzFdID0gJ3RvcCc7XHJcbiAgICAgICAgICAgICAgfSBlbHNlIGlmICh2aWV3cG9ydE9mZnNldC5ib3R0b20gKyB5T3ZlcmZsb3cgPCAwICYmIGFkanVzdGVkU2l6ZS5oZWlnaHQgLSBob3N0RWxlbVBvcy5oZWlnaHQgPD0gdmlld3BvcnRPZmZzZXQudG9wKSB7XHJcbiAgICAgICAgICAgICAgICBwbGFjZW1lbnRbMV0gPSAnYm90dG9tJztcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHN3aXRjaCAocGxhY2VtZW50WzBdKSB7XHJcbiAgICAgICAgICBjYXNlICd0b3AnOlxyXG4gICAgICAgICAgICB0YXJnZXRFbGVtUG9zLnRvcCA9IGhvc3RFbGVtUG9zLnRvcCAtIHRhcmdldEhlaWdodDtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICBjYXNlICdib3R0b20nOlxyXG4gICAgICAgICAgICB0YXJnZXRFbGVtUG9zLnRvcCA9IGhvc3RFbGVtUG9zLnRvcCArIGhvc3RFbGVtUG9zLmhlaWdodDtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICBjYXNlICdsZWZ0JzpcclxuICAgICAgICAgICAgdGFyZ2V0RWxlbVBvcy5sZWZ0ID0gaG9zdEVsZW1Qb3MubGVmdCAtIHRhcmdldFdpZHRoO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgIGNhc2UgJ3JpZ2h0JzpcclxuICAgICAgICAgICAgdGFyZ2V0RWxlbVBvcy5sZWZ0ID0gaG9zdEVsZW1Qb3MubGVmdCArIGhvc3RFbGVtUG9zLndpZHRoO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHN3aXRjaCAocGxhY2VtZW50WzFdKSB7XHJcbiAgICAgICAgICBjYXNlICd0b3AnOlxyXG4gICAgICAgICAgICB0YXJnZXRFbGVtUG9zLnRvcCA9IGhvc3RFbGVtUG9zLnRvcDtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICBjYXNlICdib3R0b20nOlxyXG4gICAgICAgICAgICB0YXJnZXRFbGVtUG9zLnRvcCA9IGhvc3RFbGVtUG9zLnRvcCArIGhvc3RFbGVtUG9zLmhlaWdodCAtIHRhcmdldEhlaWdodDtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICBjYXNlICdsZWZ0JzpcclxuICAgICAgICAgICAgdGFyZ2V0RWxlbVBvcy5sZWZ0ID0gaG9zdEVsZW1Qb3MubGVmdDtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICBjYXNlICdyaWdodCc6XHJcbiAgICAgICAgICAgIHRhcmdldEVsZW1Qb3MubGVmdCA9IGhvc3RFbGVtUG9zLmxlZnQgKyBob3N0RWxlbVBvcy53aWR0aCAtIHRhcmdldFdpZHRoO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgIGNhc2UgJ2NlbnRlcic6XHJcbiAgICAgICAgICAgIGlmIChQTEFDRU1FTlRfUkVHRVgudmVydGljYWwudGVzdChwbGFjZW1lbnRbMF0pKSB7XHJcbiAgICAgICAgICAgICAgdGFyZ2V0RWxlbVBvcy5sZWZ0ID0gaG9zdEVsZW1Qb3MubGVmdCArIGhvc3RFbGVtUG9zLndpZHRoIC8gMiAtIHRhcmdldFdpZHRoIC8gMjtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICB0YXJnZXRFbGVtUG9zLnRvcCA9IGhvc3RFbGVtUG9zLnRvcCArIGhvc3RFbGVtUG9zLmhlaWdodCAvIDIgLSB0YXJnZXRIZWlnaHQgLyAyO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGFyZ2V0RWxlbVBvcy50b3AgPSBNYXRoLnJvdW5kKHRhcmdldEVsZW1Qb3MudG9wKTtcclxuICAgICAgICB0YXJnZXRFbGVtUG9zLmxlZnQgPSBNYXRoLnJvdW5kKHRhcmdldEVsZW1Qb3MubGVmdCk7XHJcbiAgICAgICAgdGFyZ2V0RWxlbVBvcy5wbGFjZW1lbnQgPSBwbGFjZW1lbnRbMV0gPT09ICdjZW50ZXInID8gcGxhY2VtZW50WzBdIDogcGxhY2VtZW50WzBdICsgJy0nICsgcGxhY2VtZW50WzFdO1xyXG5cclxuICAgICAgICByZXR1cm4gdGFyZ2V0RWxlbVBvcztcclxuICAgICAgfSxcclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBQcm92aWRlcyBhIHdheSB0byBhZGp1c3QgdGhlIHRvcCBwb3NpdGlvbmluZyBhZnRlciBmaXJzdFxyXG4gICAgICAgKiByZW5kZXIgdG8gY29ycmVjdGx5IGFsaWduIGVsZW1lbnQgdG8gdG9wIGFmdGVyIGNvbnRlbnRcclxuICAgICAgICogcmVuZGVyaW5nIGNhdXNlcyByZXNpemVkIGVsZW1lbnQgaGVpZ2h0XHJcbiAgICAgICAqXHJcbiAgICAgICAqIEBwYXJhbSB7YXJyYXl9IHBsYWNlbWVudENsYXNzZXMgLSBUaGUgYXJyYXkgb2Ygc3RyaW5ncyBvZiBjbGFzc2VzXHJcbiAgICAgICAqIGVsZW1lbnQgc2hvdWxkIGhhdmUuXHJcbiAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBjb250YWluZXJQb3NpdGlvbiAtIFRoZSBvYmplY3Qgd2l0aCBjb250YWluZXJcclxuICAgICAgICogcG9zaXRpb24gaW5mb3JtYXRpb25cclxuICAgICAgICogQHBhcmFtIHtudW1iZXJ9IGluaXRpYWxIZWlnaHQgLSBUaGUgaW5pdGlhbCBoZWlnaHQgZm9yIHRoZSBlbGVtLlxyXG4gICAgICAgKiBAcGFyYW0ge251bWJlcn0gY3VycmVudEhlaWdodCAtIFRoZSBjdXJyZW50IGhlaWdodCBmb3IgdGhlIGVsZW0uXHJcbiAgICAgICAqL1xyXG4gICAgICBhZGp1c3RUb3A6IGZ1bmN0aW9uKHBsYWNlbWVudENsYXNzZXMsIGNvbnRhaW5lclBvc2l0aW9uLCBpbml0aWFsSGVpZ2h0LCBjdXJyZW50SGVpZ2h0KSB7XHJcbiAgICAgICAgaWYgKHBsYWNlbWVudENsYXNzZXMuaW5kZXhPZigndG9wJykgIT09IC0xICYmIGluaXRpYWxIZWlnaHQgIT09IGN1cnJlbnRIZWlnaHQpIHtcclxuICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHRvcDogY29udGFpbmVyUG9zaXRpb24udG9wIC0gY3VycmVudEhlaWdodCArICdweCdcclxuICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIFByb3ZpZGVzIGEgd2F5IGZvciBwb3NpdGlvbmluZyB0b29sdGlwICYgZHJvcGRvd25cclxuICAgICAgICogYXJyb3dzIHdoZW4gdXNpbmcgcGxhY2VtZW50IG9wdGlvbnMgYmV5b25kIHRoZSBzdGFuZGFyZFxyXG4gICAgICAgKiBsZWZ0LCByaWdodCwgdG9wLCBvciBib3R0b20uXHJcbiAgICAgICAqXHJcbiAgICAgICAqIEBwYXJhbSB7ZWxlbWVudH0gZWxlbSAtIFRoZSB0b29sdGlwL2Ryb3Bkb3duIGVsZW1lbnQuXHJcbiAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBwbGFjZW1lbnQgLSBUaGUgcGxhY2VtZW50IGZvciB0aGUgZWxlbS5cclxuICAgICAgICovXHJcbiAgICAgIHBvc2l0aW9uQXJyb3c6IGZ1bmN0aW9uKGVsZW0sIHBsYWNlbWVudCkge1xyXG4gICAgICAgIGVsZW0gPSB0aGlzLmdldFJhd05vZGUoZWxlbSk7XHJcblxyXG4gICAgICAgIHZhciBpbm5lckVsZW0gPSBlbGVtLnF1ZXJ5U2VsZWN0b3IoJy50b29sdGlwLWlubmVyLCAucG9wb3Zlci1pbm5lcicpO1xyXG4gICAgICAgIGlmICghaW5uZXJFbGVtKSB7XHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2YXIgaXNUb29sdGlwID0gYW5ndWxhci5lbGVtZW50KGlubmVyRWxlbSkuaGFzQ2xhc3MoJ3Rvb2x0aXAtaW5uZXInKTtcclxuXHJcbiAgICAgICAgdmFyIGFycm93RWxlbSA9IGlzVG9vbHRpcCA/IGVsZW0ucXVlcnlTZWxlY3RvcignLnRvb2x0aXAtYXJyb3cnKSA6IGVsZW0ucXVlcnlTZWxlY3RvcignLmFycm93Jyk7XHJcbiAgICAgICAgaWYgKCFhcnJvd0VsZW0pIHtcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhciBhcnJvd0NzcyA9IHtcclxuICAgICAgICAgIHRvcDogJycsXHJcbiAgICAgICAgICBib3R0b206ICcnLFxyXG4gICAgICAgICAgbGVmdDogJycsXHJcbiAgICAgICAgICByaWdodDogJydcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBwbGFjZW1lbnQgPSB0aGlzLnBhcnNlUGxhY2VtZW50KHBsYWNlbWVudCk7XHJcbiAgICAgICAgaWYgKHBsYWNlbWVudFsxXSA9PT0gJ2NlbnRlcicpIHtcclxuICAgICAgICAgIC8vIG5vIGFkanVzdG1lbnQgbmVjZXNzYXJ5IC0ganVzdCByZXNldCBzdHlsZXNcclxuICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudChhcnJvd0VsZW0pLmNzcyhhcnJvd0Nzcyk7XHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2YXIgYm9yZGVyUHJvcCA9ICdib3JkZXItJyArIHBsYWNlbWVudFswXSArICctd2lkdGgnO1xyXG4gICAgICAgIHZhciBib3JkZXJXaWR0aCA9ICR3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShhcnJvd0VsZW0pW2JvcmRlclByb3BdO1xyXG5cclxuICAgICAgICB2YXIgYm9yZGVyUmFkaXVzUHJvcCA9ICdib3JkZXItJztcclxuICAgICAgICBpZiAoUExBQ0VNRU5UX1JFR0VYLnZlcnRpY2FsLnRlc3QocGxhY2VtZW50WzBdKSkge1xyXG4gICAgICAgICAgYm9yZGVyUmFkaXVzUHJvcCArPSBwbGFjZW1lbnRbMF0gKyAnLScgKyBwbGFjZW1lbnRbMV07XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGJvcmRlclJhZGl1c1Byb3AgKz0gcGxhY2VtZW50WzFdICsgJy0nICsgcGxhY2VtZW50WzBdO1xyXG4gICAgICAgIH1cclxuICAgICAgICBib3JkZXJSYWRpdXNQcm9wICs9ICctcmFkaXVzJztcclxuICAgICAgICB2YXIgYm9yZGVyUmFkaXVzID0gJHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKGlzVG9vbHRpcCA/IGlubmVyRWxlbSA6IGVsZW0pW2JvcmRlclJhZGl1c1Byb3BdO1xyXG5cclxuICAgICAgICBzd2l0Y2ggKHBsYWNlbWVudFswXSkge1xyXG4gICAgICAgICAgY2FzZSAndG9wJzpcclxuICAgICAgICAgICAgYXJyb3dDc3MuYm90dG9tID0gaXNUb29sdGlwID8gJzAnIDogJy0nICsgYm9yZGVyV2lkdGg7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgY2FzZSAnYm90dG9tJzpcclxuICAgICAgICAgICAgYXJyb3dDc3MudG9wID0gaXNUb29sdGlwID8gJzAnIDogJy0nICsgYm9yZGVyV2lkdGg7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgY2FzZSAnbGVmdCc6XHJcbiAgICAgICAgICAgIGFycm93Q3NzLnJpZ2h0ID0gaXNUb29sdGlwID8gJzAnIDogJy0nICsgYm9yZGVyV2lkdGg7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgY2FzZSAncmlnaHQnOlxyXG4gICAgICAgICAgICBhcnJvd0Nzcy5sZWZ0ID0gaXNUb29sdGlwID8gJzAnIDogJy0nICsgYm9yZGVyV2lkdGg7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgYXJyb3dDc3NbcGxhY2VtZW50WzFdXSA9IGJvcmRlclJhZGl1cztcclxuXHJcbiAgICAgICAgYW5ndWxhci5lbGVtZW50KGFycm93RWxlbSkuY3NzKGFycm93Q3NzKTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuICB9XSk7XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgndWkuYm9vdHN0cmFwLmRhdGVwaWNrZXJQb3B1cCcsIFsndWkuYm9vdHN0cmFwLmRhdGVwaWNrZXInLCAndWkuYm9vdHN0cmFwLnBvc2l0aW9uJ10pXHJcblxyXG4udmFsdWUoJyRkYXRlcGlja2VyUG9wdXBMaXRlcmFsV2FybmluZycsIHRydWUpXHJcblxyXG4uY29uc3RhbnQoJ3VpYkRhdGVwaWNrZXJQb3B1cENvbmZpZycsIHtcclxuICBhbHRJbnB1dEZvcm1hdHM6IFtdLFxyXG4gIGFwcGVuZFRvQm9keTogZmFsc2UsXHJcbiAgY2xlYXJUZXh0OiAnQ2xlYXInLFxyXG4gIGNsb3NlT25EYXRlU2VsZWN0aW9uOiB0cnVlLFxyXG4gIGNsb3NlVGV4dDogJ0RvbmUnLFxyXG4gIGN1cnJlbnRUZXh0OiAnVG9kYXknLFxyXG4gIGRhdGVwaWNrZXJQb3B1cDogJ3l5eXktTU0tZGQnLFxyXG4gIGRhdGVwaWNrZXJQb3B1cFRlbXBsYXRlVXJsOiAndWliL3RlbXBsYXRlL2RhdGVwaWNrZXJQb3B1cC9wb3B1cC5odG1sJyxcclxuICBkYXRlcGlja2VyVGVtcGxhdGVVcmw6ICd1aWIvdGVtcGxhdGUvZGF0ZXBpY2tlci9kYXRlcGlja2VyLmh0bWwnLFxyXG4gIGh0bWw1VHlwZXM6IHtcclxuICAgIGRhdGU6ICd5eXl5LU1NLWRkJyxcclxuICAgICdkYXRldGltZS1sb2NhbCc6ICd5eXl5LU1NLWRkVEhIOm1tOnNzLnNzcycsXHJcbiAgICAnbW9udGgnOiAneXl5eS1NTSdcclxuICB9LFxyXG4gIG9uT3BlbkZvY3VzOiB0cnVlLFxyXG4gIHNob3dCdXR0b25CYXI6IHRydWUsXHJcbiAgcGxhY2VtZW50OiAnYXV0byBib3R0b20tbGVmdCdcclxufSlcclxuXHJcbi5jb250cm9sbGVyKCdVaWJEYXRlcGlja2VyUG9wdXBDb250cm9sbGVyJywgWyckc2NvcGUnLCAnJGVsZW1lbnQnLCAnJGF0dHJzJywgJyRjb21waWxlJywgJyRsb2cnLCAnJHBhcnNlJywgJyR3aW5kb3cnLCAnJGRvY3VtZW50JywgJyRyb290U2NvcGUnLCAnJHVpYlBvc2l0aW9uJywgJ2RhdGVGaWx0ZXInLCAndWliRGF0ZVBhcnNlcicsICd1aWJEYXRlcGlja2VyUG9wdXBDb25maWcnLCAnJHRpbWVvdXQnLCAndWliRGF0ZXBpY2tlckNvbmZpZycsICckZGF0ZXBpY2tlclBvcHVwTGl0ZXJhbFdhcm5pbmcnLFxyXG5mdW5jdGlvbigkc2NvcGUsICRlbGVtZW50LCAkYXR0cnMsICRjb21waWxlLCAkbG9nLCAkcGFyc2UsICR3aW5kb3csICRkb2N1bWVudCwgJHJvb3RTY29wZSwgJHBvc2l0aW9uLCBkYXRlRmlsdGVyLCBkYXRlUGFyc2VyLCBkYXRlcGlja2VyUG9wdXBDb25maWcsICR0aW1lb3V0LCBkYXRlcGlja2VyQ29uZmlnLCAkZGF0ZXBpY2tlclBvcHVwTGl0ZXJhbFdhcm5pbmcpIHtcclxuICB2YXIgY2FjaGUgPSB7fSxcclxuICAgIGlzSHRtbDVEYXRlSW5wdXQgPSBmYWxzZTtcclxuICB2YXIgZGF0ZUZvcm1hdCwgY2xvc2VPbkRhdGVTZWxlY3Rpb24sIGFwcGVuZFRvQm9keSwgb25PcGVuRm9jdXMsXHJcbiAgICBkYXRlcGlja2VyUG9wdXBUZW1wbGF0ZVVybCwgZGF0ZXBpY2tlclRlbXBsYXRlVXJsLCBwb3B1cEVsLCBkYXRlcGlja2VyRWwsIHNjcm9sbFBhcmVudEVsLFxyXG4gICAgbmdNb2RlbCwgbmdNb2RlbE9wdGlvbnMsICRwb3B1cCwgYWx0SW5wdXRGb3JtYXRzLCB3YXRjaExpc3RlbmVycyA9IFtdO1xyXG5cclxuICB0aGlzLmluaXQgPSBmdW5jdGlvbihfbmdNb2RlbF8pIHtcclxuICAgIG5nTW9kZWwgPSBfbmdNb2RlbF87XHJcbiAgICBuZ01vZGVsT3B0aW9ucyA9IGFuZ3VsYXIuaXNPYmplY3QoX25nTW9kZWxfLiRvcHRpb25zKSA/XHJcbiAgICAgIF9uZ01vZGVsXy4kb3B0aW9ucyA6XHJcbiAgICAgIHtcclxuICAgICAgICB0aW1lem9uZTogbnVsbFxyXG4gICAgICB9O1xyXG4gICAgY2xvc2VPbkRhdGVTZWxlY3Rpb24gPSBhbmd1bGFyLmlzRGVmaW5lZCgkYXR0cnMuY2xvc2VPbkRhdGVTZWxlY3Rpb24pID9cclxuICAgICAgJHNjb3BlLiRwYXJlbnQuJGV2YWwoJGF0dHJzLmNsb3NlT25EYXRlU2VsZWN0aW9uKSA6XHJcbiAgICAgIGRhdGVwaWNrZXJQb3B1cENvbmZpZy5jbG9zZU9uRGF0ZVNlbGVjdGlvbjtcclxuICAgIGFwcGVuZFRvQm9keSA9IGFuZ3VsYXIuaXNEZWZpbmVkKCRhdHRycy5kYXRlcGlja2VyQXBwZW5kVG9Cb2R5KSA/XHJcbiAgICAgICRzY29wZS4kcGFyZW50LiRldmFsKCRhdHRycy5kYXRlcGlja2VyQXBwZW5kVG9Cb2R5KSA6XHJcbiAgICAgIGRhdGVwaWNrZXJQb3B1cENvbmZpZy5hcHBlbmRUb0JvZHk7XHJcbiAgICBvbk9wZW5Gb2N1cyA9IGFuZ3VsYXIuaXNEZWZpbmVkKCRhdHRycy5vbk9wZW5Gb2N1cykgP1xyXG4gICAgICAkc2NvcGUuJHBhcmVudC4kZXZhbCgkYXR0cnMub25PcGVuRm9jdXMpIDogZGF0ZXBpY2tlclBvcHVwQ29uZmlnLm9uT3BlbkZvY3VzO1xyXG4gICAgZGF0ZXBpY2tlclBvcHVwVGVtcGxhdGVVcmwgPSBhbmd1bGFyLmlzRGVmaW5lZCgkYXR0cnMuZGF0ZXBpY2tlclBvcHVwVGVtcGxhdGVVcmwpID9cclxuICAgICAgJGF0dHJzLmRhdGVwaWNrZXJQb3B1cFRlbXBsYXRlVXJsIDpcclxuICAgICAgZGF0ZXBpY2tlclBvcHVwQ29uZmlnLmRhdGVwaWNrZXJQb3B1cFRlbXBsYXRlVXJsO1xyXG4gICAgZGF0ZXBpY2tlclRlbXBsYXRlVXJsID0gYW5ndWxhci5pc0RlZmluZWQoJGF0dHJzLmRhdGVwaWNrZXJUZW1wbGF0ZVVybCkgP1xyXG4gICAgICAkYXR0cnMuZGF0ZXBpY2tlclRlbXBsYXRlVXJsIDogZGF0ZXBpY2tlclBvcHVwQ29uZmlnLmRhdGVwaWNrZXJUZW1wbGF0ZVVybDtcclxuICAgIGFsdElucHV0Rm9ybWF0cyA9IGFuZ3VsYXIuaXNEZWZpbmVkKCRhdHRycy5hbHRJbnB1dEZvcm1hdHMpID9cclxuICAgICAgJHNjb3BlLiRwYXJlbnQuJGV2YWwoJGF0dHJzLmFsdElucHV0Rm9ybWF0cykgOlxyXG4gICAgICBkYXRlcGlja2VyUG9wdXBDb25maWcuYWx0SW5wdXRGb3JtYXRzO1xyXG5cclxuICAgICRzY29wZS5zaG93QnV0dG9uQmFyID0gYW5ndWxhci5pc0RlZmluZWQoJGF0dHJzLnNob3dCdXR0b25CYXIpID9cclxuICAgICAgJHNjb3BlLiRwYXJlbnQuJGV2YWwoJGF0dHJzLnNob3dCdXR0b25CYXIpIDpcclxuICAgICAgZGF0ZXBpY2tlclBvcHVwQ29uZmlnLnNob3dCdXR0b25CYXI7XHJcblxyXG4gICAgaWYgKGRhdGVwaWNrZXJQb3B1cENvbmZpZy5odG1sNVR5cGVzWyRhdHRycy50eXBlXSkge1xyXG4gICAgICBkYXRlRm9ybWF0ID0gZGF0ZXBpY2tlclBvcHVwQ29uZmlnLmh0bWw1VHlwZXNbJGF0dHJzLnR5cGVdO1xyXG4gICAgICBpc0h0bWw1RGF0ZUlucHV0ID0gdHJ1ZTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGRhdGVGb3JtYXQgPSAkYXR0cnMudWliRGF0ZXBpY2tlclBvcHVwIHx8IGRhdGVwaWNrZXJQb3B1cENvbmZpZy5kYXRlcGlja2VyUG9wdXA7XHJcbiAgICAgICRhdHRycy4kb2JzZXJ2ZSgndWliRGF0ZXBpY2tlclBvcHVwJywgZnVuY3Rpb24odmFsdWUsIG9sZFZhbHVlKSB7XHJcbiAgICAgICAgdmFyIG5ld0RhdGVGb3JtYXQgPSB2YWx1ZSB8fCBkYXRlcGlja2VyUG9wdXBDb25maWcuZGF0ZXBpY2tlclBvcHVwO1xyXG4gICAgICAgIC8vIEludmFsaWRhdGUgdGhlICRtb2RlbFZhbHVlIHRvIGVuc3VyZSB0aGF0IGZvcm1hdHRlcnMgcmUtcnVuXHJcbiAgICAgICAgLy8gRklYTUU6IFJlZmFjdG9yIHdoZW4gUFIgaXMgbWVyZ2VkOiBodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9hbmd1bGFyLmpzL3B1bGwvMTA3NjRcclxuICAgICAgICBpZiAobmV3RGF0ZUZvcm1hdCAhPT0gZGF0ZUZvcm1hdCkge1xyXG4gICAgICAgICAgZGF0ZUZvcm1hdCA9IG5ld0RhdGVGb3JtYXQ7XHJcbiAgICAgICAgICBuZ01vZGVsLiRtb2RlbFZhbHVlID0gbnVsbDtcclxuXHJcbiAgICAgICAgICBpZiAoIWRhdGVGb3JtYXQpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCd1aWJEYXRlcGlja2VyUG9wdXAgbXVzdCBoYXZlIGEgZGF0ZSBmb3JtYXQgc3BlY2lmaWVkLicpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCFkYXRlRm9ybWF0KSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcigndWliRGF0ZXBpY2tlclBvcHVwIG11c3QgaGF2ZSBhIGRhdGUgZm9ybWF0IHNwZWNpZmllZC4nKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoaXNIdG1sNURhdGVJbnB1dCAmJiAkYXR0cnMudWliRGF0ZXBpY2tlclBvcHVwKSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcignSFRNTDUgZGF0ZSBpbnB1dCB0eXBlcyBkbyBub3Qgc3VwcG9ydCBjdXN0b20gZm9ybWF0cy4nKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBwb3B1cCBlbGVtZW50IHVzZWQgdG8gZGlzcGxheSBjYWxlbmRhclxyXG4gICAgcG9wdXBFbCA9IGFuZ3VsYXIuZWxlbWVudCgnPGRpdiB1aWItZGF0ZXBpY2tlci1wb3B1cC13cmFwPjxkaXYgdWliLWRhdGVwaWNrZXI+PC9kaXY+PC9kaXY+Jyk7XHJcblxyXG4gICAgcG9wdXBFbC5hdHRyKHtcclxuICAgICAgJ25nLW1vZGVsJzogJ2RhdGUnLFxyXG4gICAgICAnbmctY2hhbmdlJzogJ2RhdGVTZWxlY3Rpb24oZGF0ZSknLFxyXG4gICAgICAndGVtcGxhdGUtdXJsJzogZGF0ZXBpY2tlclBvcHVwVGVtcGxhdGVVcmxcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIGRhdGVwaWNrZXIgZWxlbWVudFxyXG4gICAgZGF0ZXBpY2tlckVsID0gYW5ndWxhci5lbGVtZW50KHBvcHVwRWwuY2hpbGRyZW4oKVswXSk7XHJcbiAgICBkYXRlcGlja2VyRWwuYXR0cigndGVtcGxhdGUtdXJsJywgZGF0ZXBpY2tlclRlbXBsYXRlVXJsKTtcclxuXHJcbiAgICBpZiAoISRzY29wZS5kYXRlcGlja2VyT3B0aW9ucykge1xyXG4gICAgICAkc2NvcGUuZGF0ZXBpY2tlck9wdGlvbnMgPSB7fTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoaXNIdG1sNURhdGVJbnB1dCkge1xyXG4gICAgICBpZiAoJGF0dHJzLnR5cGUgPT09ICdtb250aCcpIHtcclxuICAgICAgICAkc2NvcGUuZGF0ZXBpY2tlck9wdGlvbnMuZGF0ZXBpY2tlck1vZGUgPSAnbW9udGgnO1xyXG4gICAgICAgICRzY29wZS5kYXRlcGlja2VyT3B0aW9ucy5taW5Nb2RlID0gJ21vbnRoJztcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGRhdGVwaWNrZXJFbC5hdHRyKCdkYXRlcGlja2VyLW9wdGlvbnMnLCAnZGF0ZXBpY2tlck9wdGlvbnMnKTtcclxuXHJcbiAgICBpZiAoIWlzSHRtbDVEYXRlSW5wdXQpIHtcclxuICAgICAgLy8gSW50ZXJuYWwgQVBJIHRvIG1haW50YWluIHRoZSBjb3JyZWN0IG5nLWludmFsaWQtW2tleV0gY2xhc3NcclxuICAgICAgbmdNb2RlbC4kJHBhcnNlck5hbWUgPSAnZGF0ZSc7XHJcbiAgICAgIG5nTW9kZWwuJHZhbGlkYXRvcnMuZGF0ZSA9IHZhbGlkYXRvcjtcclxuICAgICAgbmdNb2RlbC4kcGFyc2Vycy51bnNoaWZ0KHBhcnNlRGF0ZSk7XHJcbiAgICAgIG5nTW9kZWwuJGZvcm1hdHRlcnMucHVzaChmdW5jdGlvbih2YWx1ZSkge1xyXG4gICAgICAgIGlmIChuZ01vZGVsLiRpc0VtcHR5KHZhbHVlKSkge1xyXG4gICAgICAgICAgJHNjb3BlLmRhdGUgPSB2YWx1ZTtcclxuICAgICAgICAgIHJldHVybiB2YWx1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChhbmd1bGFyLmlzTnVtYmVyKHZhbHVlKSkge1xyXG4gICAgICAgICAgdmFsdWUgPSBuZXcgRGF0ZSh2YWx1ZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAkc2NvcGUuZGF0ZSA9IGRhdGVQYXJzZXIuZnJvbVRpbWV6b25lKHZhbHVlLCBuZ01vZGVsT3B0aW9ucy50aW1lem9uZSk7XHJcblxyXG4gICAgICAgIHJldHVybiBkYXRlUGFyc2VyLmZpbHRlcigkc2NvcGUuZGF0ZSwgZGF0ZUZvcm1hdCk7XHJcbiAgICAgIH0pO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgbmdNb2RlbC4kZm9ybWF0dGVycy5wdXNoKGZ1bmN0aW9uKHZhbHVlKSB7XHJcbiAgICAgICAgJHNjb3BlLmRhdGUgPSBkYXRlUGFyc2VyLmZyb21UaW1lem9uZSh2YWx1ZSwgbmdNb2RlbE9wdGlvbnMudGltZXpvbmUpO1xyXG4gICAgICAgIHJldHVybiB2YWx1ZTtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gRGV0ZWN0IGNoYW5nZXMgaW4gdGhlIHZpZXcgZnJvbSB0aGUgdGV4dCBib3hcclxuICAgIG5nTW9kZWwuJHZpZXdDaGFuZ2VMaXN0ZW5lcnMucHVzaChmdW5jdGlvbigpIHtcclxuICAgICAgJHNjb3BlLmRhdGUgPSBwYXJzZURhdGVTdHJpbmcobmdNb2RlbC4kdmlld1ZhbHVlKTtcclxuICAgIH0pO1xyXG5cclxuICAgICRlbGVtZW50Lm9uKCdrZXlkb3duJywgaW5wdXRLZXlkb3duQmluZCk7XHJcblxyXG4gICAgJHBvcHVwID0gJGNvbXBpbGUocG9wdXBFbCkoJHNjb3BlKTtcclxuICAgIC8vIFByZXZlbnQgalF1ZXJ5IGNhY2hlIG1lbW9yeSBsZWFrICh0ZW1wbGF0ZSBpcyBub3cgcmVkdW5kYW50IGFmdGVyIGxpbmtpbmcpXHJcbiAgICBwb3B1cEVsLnJlbW92ZSgpO1xyXG5cclxuICAgIGlmIChhcHBlbmRUb0JvZHkpIHtcclxuICAgICAgJGRvY3VtZW50LmZpbmQoJ2JvZHknKS5hcHBlbmQoJHBvcHVwKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICRlbGVtZW50LmFmdGVyKCRwb3B1cCk7XHJcbiAgICB9XHJcblxyXG4gICAgJHNjb3BlLiRvbignJGRlc3Ryb3knLCBmdW5jdGlvbigpIHtcclxuICAgICAgaWYgKCRzY29wZS5pc09wZW4gPT09IHRydWUpIHtcclxuICAgICAgICBpZiAoISRyb290U2NvcGUuJCRwaGFzZSkge1xyXG4gICAgICAgICAgJHNjb3BlLiRhcHBseShmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgJHNjb3BlLmlzT3BlbiA9IGZhbHNlO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICAkcG9wdXAucmVtb3ZlKCk7XHJcbiAgICAgICRlbGVtZW50Lm9mZigna2V5ZG93bicsIGlucHV0S2V5ZG93bkJpbmQpO1xyXG4gICAgICAkZG9jdW1lbnQub2ZmKCdjbGljaycsIGRvY3VtZW50Q2xpY2tCaW5kKTtcclxuICAgICAgaWYgKHNjcm9sbFBhcmVudEVsKSB7XHJcbiAgICAgICAgc2Nyb2xsUGFyZW50RWwub2ZmKCdzY3JvbGwnLCBwb3NpdGlvblBvcHVwKTtcclxuICAgICAgfVxyXG4gICAgICBhbmd1bGFyLmVsZW1lbnQoJHdpbmRvdykub2ZmKCdyZXNpemUnLCBwb3NpdGlvblBvcHVwKTtcclxuXHJcbiAgICAgIC8vQ2xlYXIgYWxsIHdhdGNoIGxpc3RlbmVycyBvbiBkZXN0cm95XHJcbiAgICAgIHdoaWxlICh3YXRjaExpc3RlbmVycy5sZW5ndGgpIHtcclxuICAgICAgICB3YXRjaExpc3RlbmVycy5zaGlmdCgpKCk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gIH07XHJcblxyXG4gICRzY29wZS5nZXRUZXh0ID0gZnVuY3Rpb24oa2V5KSB7XHJcbiAgICByZXR1cm4gJHNjb3BlW2tleSArICdUZXh0J10gfHwgZGF0ZXBpY2tlclBvcHVwQ29uZmlnW2tleSArICdUZXh0J107XHJcbiAgfTtcclxuXHJcbiAgJHNjb3BlLmlzRGlzYWJsZWQgPSBmdW5jdGlvbihkYXRlKSB7XHJcbiAgICBpZiAoZGF0ZSA9PT0gJ3RvZGF5Jykge1xyXG4gICAgICBkYXRlID0gZGF0ZVBhcnNlci5mcm9tVGltZXpvbmUobmV3IERhdGUoKSwgbmdNb2RlbE9wdGlvbnMudGltZXpvbmUpO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBkYXRlcyA9IHt9O1xyXG4gICAgYW5ndWxhci5mb3JFYWNoKFsnbWluRGF0ZScsICdtYXhEYXRlJ10sIGZ1bmN0aW9uKGtleSkge1xyXG4gICAgICBpZiAoISRzY29wZS5kYXRlcGlja2VyT3B0aW9uc1trZXldKSB7XHJcbiAgICAgICAgZGF0ZXNba2V5XSA9IG51bGw7XHJcbiAgICAgIH0gZWxzZSBpZiAoYW5ndWxhci5pc0RhdGUoJHNjb3BlLmRhdGVwaWNrZXJPcHRpb25zW2tleV0pKSB7XHJcbiAgICAgICAgZGF0ZXNba2V5XSA9IG5ldyBEYXRlKCRzY29wZS5kYXRlcGlja2VyT3B0aW9uc1trZXldKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBpZiAoJGRhdGVwaWNrZXJQb3B1cExpdGVyYWxXYXJuaW5nKSB7XHJcbiAgICAgICAgICAkbG9nLndhcm4oJ0xpdGVyYWwgZGF0ZSBzdXBwb3J0IGhhcyBiZWVuIGRlcHJlY2F0ZWQsIHBsZWFzZSBzd2l0Y2ggdG8gZGF0ZSBvYmplY3QgdXNhZ2UnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGRhdGVzW2tleV0gPSBuZXcgRGF0ZShkYXRlRmlsdGVyKCRzY29wZS5kYXRlcGlja2VyT3B0aW9uc1trZXldLCAnbWVkaXVtJykpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICByZXR1cm4gJHNjb3BlLmRhdGVwaWNrZXJPcHRpb25zICYmXHJcbiAgICAgIGRhdGVzLm1pbkRhdGUgJiYgJHNjb3BlLmNvbXBhcmUoZGF0ZSwgZGF0ZXMubWluRGF0ZSkgPCAwIHx8XHJcbiAgICAgIGRhdGVzLm1heERhdGUgJiYgJHNjb3BlLmNvbXBhcmUoZGF0ZSwgZGF0ZXMubWF4RGF0ZSkgPiAwO1xyXG4gIH07XHJcblxyXG4gICRzY29wZS5jb21wYXJlID0gZnVuY3Rpb24oZGF0ZTEsIGRhdGUyKSB7XHJcbiAgICByZXR1cm4gbmV3IERhdGUoZGF0ZTEuZ2V0RnVsbFllYXIoKSwgZGF0ZTEuZ2V0TW9udGgoKSwgZGF0ZTEuZ2V0RGF0ZSgpKSAtIG5ldyBEYXRlKGRhdGUyLmdldEZ1bGxZZWFyKCksIGRhdGUyLmdldE1vbnRoKCksIGRhdGUyLmdldERhdGUoKSk7XHJcbiAgfTtcclxuXHJcbiAgLy8gSW5uZXIgY2hhbmdlXHJcbiAgJHNjb3BlLmRhdGVTZWxlY3Rpb24gPSBmdW5jdGlvbihkdCkge1xyXG4gICAgJHNjb3BlLmRhdGUgPSBkdDtcclxuICAgIHZhciBkYXRlID0gJHNjb3BlLmRhdGUgPyBkYXRlUGFyc2VyLmZpbHRlcigkc2NvcGUuZGF0ZSwgZGF0ZUZvcm1hdCkgOiBudWxsOyAvLyBTZXR0aW5nIHRvIE5VTEwgaXMgbmVjZXNzYXJ5IGZvciBmb3JtIHZhbGlkYXRvcnMgdG8gZnVuY3Rpb25cclxuICAgICRlbGVtZW50LnZhbChkYXRlKTtcclxuICAgIG5nTW9kZWwuJHNldFZpZXdWYWx1ZShkYXRlKTtcclxuXHJcbiAgICBpZiAoY2xvc2VPbkRhdGVTZWxlY3Rpb24pIHtcclxuICAgICAgJHNjb3BlLmlzT3BlbiA9IGZhbHNlO1xyXG4gICAgICAkZWxlbWVudFswXS5mb2N1cygpO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gICRzY29wZS5rZXlkb3duID0gZnVuY3Rpb24oZXZ0KSB7XHJcbiAgICBpZiAoZXZ0LndoaWNoID09PSAyNykge1xyXG4gICAgICBldnQuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICRzY29wZS5pc09wZW4gPSBmYWxzZTtcclxuICAgICAgJGVsZW1lbnRbMF0uZm9jdXMoKTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICAkc2NvcGUuc2VsZWN0ID0gZnVuY3Rpb24oZGF0ZSwgZXZ0KSB7XHJcbiAgICBldnQuc3RvcFByb3BhZ2F0aW9uKCk7XHJcblxyXG4gICAgaWYgKGRhdGUgPT09ICd0b2RheScpIHtcclxuICAgICAgdmFyIHRvZGF5ID0gbmV3IERhdGUoKTtcclxuICAgICAgaWYgKGFuZ3VsYXIuaXNEYXRlKCRzY29wZS5kYXRlKSkge1xyXG4gICAgICAgIGRhdGUgPSBuZXcgRGF0ZSgkc2NvcGUuZGF0ZSk7XHJcbiAgICAgICAgZGF0ZS5zZXRGdWxsWWVhcih0b2RheS5nZXRGdWxsWWVhcigpLCB0b2RheS5nZXRNb250aCgpLCB0b2RheS5nZXREYXRlKCkpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGRhdGUgPSBkYXRlUGFyc2VyLmZyb21UaW1lem9uZSh0b2RheSwgbmdNb2RlbE9wdGlvbnMudGltZXpvbmUpO1xyXG4gICAgICAgIGRhdGUuc2V0SG91cnMoMCwgMCwgMCwgMCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgICRzY29wZS5kYXRlU2VsZWN0aW9uKGRhdGUpO1xyXG4gIH07XHJcblxyXG4gICRzY29wZS5jbG9zZSA9IGZ1bmN0aW9uKGV2dCkge1xyXG4gICAgZXZ0LnN0b3BQcm9wYWdhdGlvbigpO1xyXG5cclxuICAgICRzY29wZS5pc09wZW4gPSBmYWxzZTtcclxuICAgICRlbGVtZW50WzBdLmZvY3VzKCk7XHJcbiAgfTtcclxuXHJcbiAgJHNjb3BlLmRpc2FibGVkID0gYW5ndWxhci5pc0RlZmluZWQoJGF0dHJzLmRpc2FibGVkKSB8fCBmYWxzZTtcclxuICBpZiAoJGF0dHJzLm5nRGlzYWJsZWQpIHtcclxuICAgIHdhdGNoTGlzdGVuZXJzLnB1c2goJHNjb3BlLiRwYXJlbnQuJHdhdGNoKCRwYXJzZSgkYXR0cnMubmdEaXNhYmxlZCksIGZ1bmN0aW9uKGRpc2FibGVkKSB7XHJcbiAgICAgICRzY29wZS5kaXNhYmxlZCA9IGRpc2FibGVkO1xyXG4gICAgfSkpO1xyXG4gIH1cclxuXHJcbiAgJHNjb3BlLiR3YXRjaCgnaXNPcGVuJywgZnVuY3Rpb24odmFsdWUpIHtcclxuICAgIGlmICh2YWx1ZSkge1xyXG4gICAgICBpZiAoISRzY29wZS5kaXNhYmxlZCkge1xyXG4gICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgcG9zaXRpb25Qb3B1cCgpO1xyXG5cclxuICAgICAgICAgIGlmIChvbk9wZW5Gb2N1cykge1xyXG4gICAgICAgICAgICAkc2NvcGUuJGJyb2FkY2FzdCgndWliOmRhdGVwaWNrZXIuZm9jdXMnKTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAkZG9jdW1lbnQub24oJ2NsaWNrJywgZG9jdW1lbnRDbGlja0JpbmQpO1xyXG5cclxuICAgICAgICAgIHZhciBwbGFjZW1lbnQgPSAkYXR0cnMucG9wdXBQbGFjZW1lbnQgPyAkYXR0cnMucG9wdXBQbGFjZW1lbnQgOiBkYXRlcGlja2VyUG9wdXBDb25maWcucGxhY2VtZW50O1xyXG4gICAgICAgICAgaWYgKGFwcGVuZFRvQm9keSB8fCAkcG9zaXRpb24ucGFyc2VQbGFjZW1lbnQocGxhY2VtZW50KVsyXSkge1xyXG4gICAgICAgICAgICBzY3JvbGxQYXJlbnRFbCA9IHNjcm9sbFBhcmVudEVsIHx8IGFuZ3VsYXIuZWxlbWVudCgkcG9zaXRpb24uc2Nyb2xsUGFyZW50KCRlbGVtZW50KSk7XHJcbiAgICAgICAgICAgIGlmIChzY3JvbGxQYXJlbnRFbCkge1xyXG4gICAgICAgICAgICAgIHNjcm9sbFBhcmVudEVsLm9uKCdzY3JvbGwnLCBwb3NpdGlvblBvcHVwKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgc2Nyb2xsUGFyZW50RWwgPSBudWxsO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudCgkd2luZG93KS5vbigncmVzaXplJywgcG9zaXRpb25Qb3B1cCk7XHJcbiAgICAgICAgfSwgMCwgZmFsc2UpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgICRzY29wZS5pc09wZW4gPSBmYWxzZTtcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgJGRvY3VtZW50Lm9mZignY2xpY2snLCBkb2N1bWVudENsaWNrQmluZCk7XHJcbiAgICAgIGlmIChzY3JvbGxQYXJlbnRFbCkge1xyXG4gICAgICAgIHNjcm9sbFBhcmVudEVsLm9mZignc2Nyb2xsJywgcG9zaXRpb25Qb3B1cCk7XHJcbiAgICAgIH1cclxuICAgICAgYW5ndWxhci5lbGVtZW50KCR3aW5kb3cpLm9mZigncmVzaXplJywgcG9zaXRpb25Qb3B1cCk7XHJcbiAgICB9XHJcbiAgfSk7XHJcblxyXG4gIGZ1bmN0aW9uIGNhbWVsdG9EYXNoKHN0cmluZykge1xyXG4gICAgcmV0dXJuIHN0cmluZy5yZXBsYWNlKC8oW0EtWl0pL2csIGZ1bmN0aW9uKCQxKSB7IHJldHVybiAnLScgKyAkMS50b0xvd2VyQ2FzZSgpOyB9KTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHBhcnNlRGF0ZVN0cmluZyh2aWV3VmFsdWUpIHtcclxuICAgIHZhciBkYXRlID0gZGF0ZVBhcnNlci5wYXJzZSh2aWV3VmFsdWUsIGRhdGVGb3JtYXQsICRzY29wZS5kYXRlKTtcclxuICAgIGlmIChpc05hTihkYXRlKSkge1xyXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFsdElucHV0Rm9ybWF0cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGRhdGUgPSBkYXRlUGFyc2VyLnBhcnNlKHZpZXdWYWx1ZSwgYWx0SW5wdXRGb3JtYXRzW2ldLCAkc2NvcGUuZGF0ZSk7XHJcbiAgICAgICAgaWYgKCFpc05hTihkYXRlKSkge1xyXG4gICAgICAgICAgcmV0dXJuIGRhdGU7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZGF0ZTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHBhcnNlRGF0ZSh2aWV3VmFsdWUpIHtcclxuICAgIGlmIChhbmd1bGFyLmlzTnVtYmVyKHZpZXdWYWx1ZSkpIHtcclxuICAgICAgLy8gcHJlc3VtYWJseSB0aW1lc3RhbXAgdG8gZGF0ZSBvYmplY3RcclxuICAgICAgdmlld1ZhbHVlID0gbmV3IERhdGUodmlld1ZhbHVlKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIXZpZXdWYWx1ZSkge1xyXG4gICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoYW5ndWxhci5pc0RhdGUodmlld1ZhbHVlKSAmJiAhaXNOYU4odmlld1ZhbHVlKSkge1xyXG4gICAgICByZXR1cm4gdmlld1ZhbHVlO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChhbmd1bGFyLmlzU3RyaW5nKHZpZXdWYWx1ZSkpIHtcclxuICAgICAgdmFyIGRhdGUgPSBwYXJzZURhdGVTdHJpbmcodmlld1ZhbHVlKTtcclxuICAgICAgaWYgKCFpc05hTihkYXRlKSkge1xyXG4gICAgICAgIHJldHVybiBkYXRlUGFyc2VyLmZyb21UaW1lem9uZShkYXRlLCBuZ01vZGVsT3B0aW9ucy50aW1lem9uZSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gbmdNb2RlbC4kb3B0aW9ucyAmJiBuZ01vZGVsLiRvcHRpb25zLmFsbG93SW52YWxpZCA/IHZpZXdWYWx1ZSA6IHVuZGVmaW5lZDtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHZhbGlkYXRvcihtb2RlbFZhbHVlLCB2aWV3VmFsdWUpIHtcclxuICAgIHZhciB2YWx1ZSA9IG1vZGVsVmFsdWUgfHwgdmlld1ZhbHVlO1xyXG5cclxuICAgIGlmICghJGF0dHJzLm5nUmVxdWlyZWQgJiYgIXZhbHVlKSB7XHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChhbmd1bGFyLmlzTnVtYmVyKHZhbHVlKSkge1xyXG4gICAgICB2YWx1ZSA9IG5ldyBEYXRlKHZhbHVlKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIXZhbHVlKSB7XHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChhbmd1bGFyLmlzRGF0ZSh2YWx1ZSkgJiYgIWlzTmFOKHZhbHVlKSkge1xyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoYW5ndWxhci5pc1N0cmluZyh2YWx1ZSkpIHtcclxuICAgICAgcmV0dXJuICFpc05hTihwYXJzZURhdGVTdHJpbmcodmFsdWUpKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBkb2N1bWVudENsaWNrQmluZChldmVudCkge1xyXG4gICAgaWYgKCEkc2NvcGUuaXNPcGVuICYmICRzY29wZS5kaXNhYmxlZCkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIHBvcHVwID0gJHBvcHVwWzBdO1xyXG4gICAgdmFyIGRwQ29udGFpbnNUYXJnZXQgPSAkZWxlbWVudFswXS5jb250YWlucyhldmVudC50YXJnZXQpO1xyXG4gICAgLy8gVGhlIHBvcHVwIG5vZGUgbWF5IG5vdCBiZSBhbiBlbGVtZW50IG5vZGVcclxuICAgIC8vIEluIHNvbWUgYnJvd3NlcnMgKElFKSBvbmx5IGVsZW1lbnQgbm9kZXMgaGF2ZSB0aGUgJ2NvbnRhaW5zJyBmdW5jdGlvblxyXG4gICAgdmFyIHBvcHVwQ29udGFpbnNUYXJnZXQgPSBwb3B1cC5jb250YWlucyAhPT0gdW5kZWZpbmVkICYmIHBvcHVwLmNvbnRhaW5zKGV2ZW50LnRhcmdldCk7XHJcbiAgICBpZiAoJHNjb3BlLmlzT3BlbiAmJiAhKGRwQ29udGFpbnNUYXJnZXQgfHwgcG9wdXBDb250YWluc1RhcmdldCkpIHtcclxuICAgICAgJHNjb3BlLiRhcHBseShmdW5jdGlvbigpIHtcclxuICAgICAgICAkc2NvcGUuaXNPcGVuID0gZmFsc2U7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gaW5wdXRLZXlkb3duQmluZChldnQpIHtcclxuICAgIGlmIChldnQud2hpY2ggPT09IDI3ICYmICRzY29wZS5pc09wZW4pIHtcclxuICAgICAgZXZ0LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgIGV2dC5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgJHNjb3BlLiRhcHBseShmdW5jdGlvbigpIHtcclxuICAgICAgICAkc2NvcGUuaXNPcGVuID0gZmFsc2U7XHJcbiAgICAgIH0pO1xyXG4gICAgICAkZWxlbWVudFswXS5mb2N1cygpO1xyXG4gICAgfSBlbHNlIGlmIChldnQud2hpY2ggPT09IDQwICYmICEkc2NvcGUuaXNPcGVuKSB7XHJcbiAgICAgIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICBldnQuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICRzY29wZS4kYXBwbHkoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgJHNjb3BlLmlzT3BlbiA9IHRydWU7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gcG9zaXRpb25Qb3B1cCgpIHtcclxuICAgIGlmICgkc2NvcGUuaXNPcGVuKSB7XHJcbiAgICAgIHZhciBkcEVsZW1lbnQgPSBhbmd1bGFyLmVsZW1lbnQoJHBvcHVwWzBdLnF1ZXJ5U2VsZWN0b3IoJy51aWItZGF0ZXBpY2tlci1wb3B1cCcpKTtcclxuICAgICAgdmFyIHBsYWNlbWVudCA9ICRhdHRycy5wb3B1cFBsYWNlbWVudCA/ICRhdHRycy5wb3B1cFBsYWNlbWVudCA6IGRhdGVwaWNrZXJQb3B1cENvbmZpZy5wbGFjZW1lbnQ7XHJcbiAgICAgIHZhciBwb3NpdGlvbiA9ICRwb3NpdGlvbi5wb3NpdGlvbkVsZW1lbnRzKCRlbGVtZW50LCBkcEVsZW1lbnQsIHBsYWNlbWVudCwgYXBwZW5kVG9Cb2R5KTtcclxuICAgICAgZHBFbGVtZW50LmNzcyh7dG9wOiBwb3NpdGlvbi50b3AgKyAncHgnLCBsZWZ0OiBwb3NpdGlvbi5sZWZ0ICsgJ3B4J30pO1xyXG4gICAgICBpZiAoZHBFbGVtZW50Lmhhc0NsYXNzKCd1aWItcG9zaXRpb24tbWVhc3VyZScpKSB7XHJcbiAgICAgICAgZHBFbGVtZW50LnJlbW92ZUNsYXNzKCd1aWItcG9zaXRpb24tbWVhc3VyZScpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAkc2NvcGUuJG9uKCd1aWI6ZGF0ZXBpY2tlci5tb2RlJywgZnVuY3Rpb24oKSB7XHJcbiAgICAkdGltZW91dChwb3NpdGlvblBvcHVwLCAwLCBmYWxzZSk7XHJcbiAgfSk7XHJcbn1dKVxyXG5cclxuLmRpcmVjdGl2ZSgndWliRGF0ZXBpY2tlclBvcHVwJywgZnVuY3Rpb24oKSB7XHJcbiAgcmV0dXJuIHtcclxuICAgIHJlcXVpcmU6IFsnbmdNb2RlbCcsICd1aWJEYXRlcGlja2VyUG9wdXAnXSxcclxuICAgIGNvbnRyb2xsZXI6ICdVaWJEYXRlcGlja2VyUG9wdXBDb250cm9sbGVyJyxcclxuICAgIHNjb3BlOiB7XHJcbiAgICAgIGRhdGVwaWNrZXJPcHRpb25zOiAnPT8nLFxyXG4gICAgICBpc09wZW46ICc9PycsXHJcbiAgICAgIGN1cnJlbnRUZXh0OiAnQCcsXHJcbiAgICAgIGNsZWFyVGV4dDogJ0AnLFxyXG4gICAgICBjbG9zZVRleHQ6ICdAJ1xyXG4gICAgfSxcclxuICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBlbGVtZW50LCBhdHRycywgY3RybHMpIHtcclxuICAgICAgdmFyIG5nTW9kZWwgPSBjdHJsc1swXSxcclxuICAgICAgICBjdHJsID0gY3RybHNbMV07XHJcblxyXG4gICAgICBjdHJsLmluaXQobmdNb2RlbCk7XHJcbiAgICB9XHJcbiAgfTtcclxufSlcclxuXHJcbi5kaXJlY3RpdmUoJ3VpYkRhdGVwaWNrZXJQb3B1cFdyYXAnLCBmdW5jdGlvbigpIHtcclxuICByZXR1cm4ge1xyXG4gICAgcmVzdHJpY3Q6ICdBJyxcclxuICAgIHRyYW5zY2x1ZGU6IHRydWUsXHJcbiAgICB0ZW1wbGF0ZVVybDogZnVuY3Rpb24oZWxlbWVudCwgYXR0cnMpIHtcclxuICAgICAgcmV0dXJuIGF0dHJzLnRlbXBsYXRlVXJsIHx8ICd1aWIvdGVtcGxhdGUvZGF0ZXBpY2tlclBvcHVwL3BvcHVwLmh0bWwnO1xyXG4gICAgfVxyXG4gIH07XHJcbn0pO1xyXG5cclxuYW5ndWxhci5tb2R1bGUoJ3VpLmJvb3RzdHJhcC5kZWJvdW5jZScsIFtdKVxyXG4vKipcclxuICogQSBoZWxwZXIsIGludGVybmFsIHNlcnZpY2UgdGhhdCBkZWJvdW5jZXMgYSBmdW5jdGlvblxyXG4gKi9cclxuICAuZmFjdG9yeSgnJCRkZWJvdW5jZScsIFsnJHRpbWVvdXQnLCBmdW5jdGlvbigkdGltZW91dCkge1xyXG4gICAgcmV0dXJuIGZ1bmN0aW9uKGNhbGxiYWNrLCBkZWJvdW5jZVRpbWUpIHtcclxuICAgICAgdmFyIHRpbWVvdXRQcm9taXNlO1xyXG5cclxuICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcclxuICAgICAgICB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cyk7XHJcbiAgICAgICAgaWYgKHRpbWVvdXRQcm9taXNlKSB7XHJcbiAgICAgICAgICAkdGltZW91dC5jYW5jZWwodGltZW91dFByb21pc2UpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGltZW91dFByb21pc2UgPSAkdGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgICAgIGNhbGxiYWNrLmFwcGx5KHNlbGYsIGFyZ3MpO1xyXG4gICAgICAgIH0sIGRlYm91bmNlVGltZSk7XHJcbiAgICAgIH07XHJcbiAgICB9O1xyXG4gIH1dKTtcclxuXHJcbmFuZ3VsYXIubW9kdWxlKCd1aS5ib290c3RyYXAuZHJvcGRvd24nLCBbJ3VpLmJvb3RzdHJhcC5wb3NpdGlvbiddKVxyXG5cclxuLmNvbnN0YW50KCd1aWJEcm9wZG93bkNvbmZpZycsIHtcclxuICBhcHBlbmRUb09wZW5DbGFzczogJ3VpYi1kcm9wZG93bi1vcGVuJyxcclxuICBvcGVuQ2xhc3M6ICdvcGVuJ1xyXG59KVxyXG5cclxuLnNlcnZpY2UoJ3VpYkRyb3Bkb3duU2VydmljZScsIFsnJGRvY3VtZW50JywgJyRyb290U2NvcGUnLCBmdW5jdGlvbigkZG9jdW1lbnQsICRyb290U2NvcGUpIHtcclxuICB2YXIgb3BlblNjb3BlID0gbnVsbDtcclxuXHJcbiAgdGhpcy5vcGVuID0gZnVuY3Rpb24oZHJvcGRvd25TY29wZSwgZWxlbWVudCkge1xyXG4gICAgaWYgKCFvcGVuU2NvcGUpIHtcclxuICAgICAgJGRvY3VtZW50Lm9uKCdjbGljaycsIGNsb3NlRHJvcGRvd24pO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChvcGVuU2NvcGUgJiYgb3BlblNjb3BlICE9PSBkcm9wZG93blNjb3BlKSB7XHJcbiAgICAgIG9wZW5TY29wZS5pc09wZW4gPSBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBvcGVuU2NvcGUgPSBkcm9wZG93blNjb3BlO1xyXG4gIH07XHJcblxyXG4gIHRoaXMuY2xvc2UgPSBmdW5jdGlvbihkcm9wZG93blNjb3BlLCBlbGVtZW50KSB7XHJcbiAgICBpZiAob3BlblNjb3BlID09PSBkcm9wZG93blNjb3BlKSB7XHJcbiAgICAgICRkb2N1bWVudC5vZmYoJ2NsaWNrJywgY2xvc2VEcm9wZG93bik7XHJcbiAgICAgICRkb2N1bWVudC5vZmYoJ2tleWRvd24nLCB0aGlzLmtleWJpbmRGaWx0ZXIpO1xyXG4gICAgICBvcGVuU2NvcGUgPSBudWxsO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIHZhciBjbG9zZURyb3Bkb3duID0gZnVuY3Rpb24oZXZ0KSB7XHJcbiAgICAvLyBUaGlzIG1ldGhvZCBtYXkgc3RpbGwgYmUgY2FsbGVkIGR1cmluZyB0aGUgc2FtZSBtb3VzZSBldmVudCB0aGF0XHJcbiAgICAvLyB1bmJvdW5kIHRoaXMgZXZlbnQgaGFuZGxlci4gU28gY2hlY2sgb3BlblNjb3BlIGJlZm9yZSBwcm9jZWVkaW5nLlxyXG4gICAgaWYgKCFvcGVuU2NvcGUpIHsgcmV0dXJuOyB9XHJcblxyXG4gICAgaWYgKGV2dCAmJiBvcGVuU2NvcGUuZ2V0QXV0b0Nsb3NlKCkgPT09ICdkaXNhYmxlZCcpIHsgcmV0dXJuOyB9XHJcblxyXG4gICAgaWYgKGV2dCAmJiBldnQud2hpY2ggPT09IDMpIHsgcmV0dXJuOyB9XHJcblxyXG4gICAgdmFyIHRvZ2dsZUVsZW1lbnQgPSBvcGVuU2NvcGUuZ2V0VG9nZ2xlRWxlbWVudCgpO1xyXG4gICAgaWYgKGV2dCAmJiB0b2dnbGVFbGVtZW50ICYmIHRvZ2dsZUVsZW1lbnRbMF0uY29udGFpbnMoZXZ0LnRhcmdldCkpIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBkcm9wZG93bkVsZW1lbnQgPSBvcGVuU2NvcGUuZ2V0RHJvcGRvd25FbGVtZW50KCk7XHJcbiAgICBpZiAoZXZ0ICYmIG9wZW5TY29wZS5nZXRBdXRvQ2xvc2UoKSA9PT0gJ291dHNpZGVDbGljaycgJiZcclxuICAgICAgZHJvcGRvd25FbGVtZW50ICYmIGRyb3Bkb3duRWxlbWVudFswXS5jb250YWlucyhldnQudGFyZ2V0KSkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgb3BlblNjb3BlLmZvY3VzVG9nZ2xlRWxlbWVudCgpO1xyXG4gICAgb3BlblNjb3BlLmlzT3BlbiA9IGZhbHNlO1xyXG5cclxuICAgIGlmICghJHJvb3RTY29wZS4kJHBoYXNlKSB7XHJcbiAgICAgIG9wZW5TY29wZS4kYXBwbHkoKTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICB0aGlzLmtleWJpbmRGaWx0ZXIgPSBmdW5jdGlvbihldnQpIHtcclxuICAgIGlmICghb3BlblNjb3BlKSB7XHJcbiAgICAgIC8vIHNlZSB0aGlzLmNsb3NlIGFzIEVTQyBjb3VsZCBoYXZlIGJlZW4gcHJlc3NlZCB3aGljaCBraWxscyB0aGUgc2NvcGUgc28gd2UgY2FuIG5vdCBwcm9jZWVkXHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgZHJvcGRvd25FbGVtZW50ID0gb3BlblNjb3BlLmdldERyb3Bkb3duRWxlbWVudCgpO1xyXG4gICAgdmFyIHRvZ2dsZUVsZW1lbnQgPSBvcGVuU2NvcGUuZ2V0VG9nZ2xlRWxlbWVudCgpO1xyXG4gICAgdmFyIGRyb3Bkb3duRWxlbWVudFRhcmdldGVkID0gZHJvcGRvd25FbGVtZW50ICYmIGRyb3Bkb3duRWxlbWVudFswXS5jb250YWlucyhldnQudGFyZ2V0KTtcclxuICAgIHZhciB0b2dnbGVFbGVtZW50VGFyZ2V0ZWQgPSB0b2dnbGVFbGVtZW50ICYmIHRvZ2dsZUVsZW1lbnRbMF0uY29udGFpbnMoZXZ0LnRhcmdldCk7XHJcbiAgICBpZiAoZXZ0LndoaWNoID09PSAyNykge1xyXG4gICAgICBldnQuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgIG9wZW5TY29wZS5mb2N1c1RvZ2dsZUVsZW1lbnQoKTtcclxuICAgICAgY2xvc2VEcm9wZG93bigpO1xyXG4gICAgfSBlbHNlIGlmIChvcGVuU2NvcGUuaXNLZXluYXZFbmFibGVkKCkgJiYgWzM4LCA0MF0uaW5kZXhPZihldnQud2hpY2gpICE9PSAtMSAmJiBvcGVuU2NvcGUuaXNPcGVuICYmIChkcm9wZG93bkVsZW1lbnRUYXJnZXRlZCB8fCB0b2dnbGVFbGVtZW50VGFyZ2V0ZWQpKSB7XHJcbiAgICAgIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICBldnQuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgIG9wZW5TY29wZS5mb2N1c0Ryb3Bkb3duRW50cnkoZXZ0LndoaWNoKTtcclxuICAgIH1cclxuICB9O1xyXG59XSlcclxuXHJcbi5jb250cm9sbGVyKCdVaWJEcm9wZG93bkNvbnRyb2xsZXInLCBbJyRzY29wZScsICckZWxlbWVudCcsICckYXR0cnMnLCAnJHBhcnNlJywgJ3VpYkRyb3Bkb3duQ29uZmlnJywgJ3VpYkRyb3Bkb3duU2VydmljZScsICckYW5pbWF0ZScsICckdWliUG9zaXRpb24nLCAnJGRvY3VtZW50JywgJyRjb21waWxlJywgJyR0ZW1wbGF0ZVJlcXVlc3QnLCBmdW5jdGlvbigkc2NvcGUsICRlbGVtZW50LCAkYXR0cnMsICRwYXJzZSwgZHJvcGRvd25Db25maWcsIHVpYkRyb3Bkb3duU2VydmljZSwgJGFuaW1hdGUsICRwb3NpdGlvbiwgJGRvY3VtZW50LCAkY29tcGlsZSwgJHRlbXBsYXRlUmVxdWVzdCkge1xyXG4gIHZhciBzZWxmID0gdGhpcyxcclxuICAgIHNjb3BlID0gJHNjb3BlLiRuZXcoKSwgLy8gY3JlYXRlIGEgY2hpbGQgc2NvcGUgc28gd2UgYXJlIG5vdCBwb2xsdXRpbmcgb3JpZ2luYWwgb25lXHJcbiAgICB0ZW1wbGF0ZVNjb3BlLFxyXG4gICAgYXBwZW5kVG9PcGVuQ2xhc3MgPSBkcm9wZG93bkNvbmZpZy5hcHBlbmRUb09wZW5DbGFzcyxcclxuICAgIG9wZW5DbGFzcyA9IGRyb3Bkb3duQ29uZmlnLm9wZW5DbGFzcyxcclxuICAgIGdldElzT3BlbixcclxuICAgIHNldElzT3BlbiA9IGFuZ3VsYXIubm9vcCxcclxuICAgIHRvZ2dsZUludm9rZXIgPSAkYXR0cnMub25Ub2dnbGUgPyAkcGFyc2UoJGF0dHJzLm9uVG9nZ2xlKSA6IGFuZ3VsYXIubm9vcCxcclxuICAgIGFwcGVuZFRvQm9keSA9IGZhbHNlLFxyXG4gICAgYXBwZW5kVG8gPSBudWxsLFxyXG4gICAga2V5bmF2RW5hYmxlZCA9IGZhbHNlLFxyXG4gICAgc2VsZWN0ZWRPcHRpb24gPSBudWxsLFxyXG4gICAgYm9keSA9ICRkb2N1bWVudC5maW5kKCdib2R5Jyk7XHJcblxyXG4gICRlbGVtZW50LmFkZENsYXNzKCdkcm9wZG93bicpO1xyXG5cclxuICB0aGlzLmluaXQgPSBmdW5jdGlvbigpIHtcclxuICAgIGlmICgkYXR0cnMuaXNPcGVuKSB7XHJcbiAgICAgIGdldElzT3BlbiA9ICRwYXJzZSgkYXR0cnMuaXNPcGVuKTtcclxuICAgICAgc2V0SXNPcGVuID0gZ2V0SXNPcGVuLmFzc2lnbjtcclxuXHJcbiAgICAgICRzY29wZS4kd2F0Y2goZ2V0SXNPcGVuLCBmdW5jdGlvbih2YWx1ZSkge1xyXG4gICAgICAgIHNjb3BlLmlzT3BlbiA9ICEhdmFsdWU7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChhbmd1bGFyLmlzRGVmaW5lZCgkYXR0cnMuZHJvcGRvd25BcHBlbmRUbykpIHtcclxuICAgICAgdmFyIGFwcGVuZFRvRWwgPSAkcGFyc2UoJGF0dHJzLmRyb3Bkb3duQXBwZW5kVG8pKHNjb3BlKTtcclxuICAgICAgaWYgKGFwcGVuZFRvRWwpIHtcclxuICAgICAgICBhcHBlbmRUbyA9IGFuZ3VsYXIuZWxlbWVudChhcHBlbmRUb0VsKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGFwcGVuZFRvQm9keSA9IGFuZ3VsYXIuaXNEZWZpbmVkKCRhdHRycy5kcm9wZG93bkFwcGVuZFRvQm9keSk7XHJcbiAgICBrZXluYXZFbmFibGVkID0gYW5ndWxhci5pc0RlZmluZWQoJGF0dHJzLmtleWJvYXJkTmF2KTtcclxuXHJcbiAgICBpZiAoYXBwZW5kVG9Cb2R5ICYmICFhcHBlbmRUbykge1xyXG4gICAgICBhcHBlbmRUbyA9IGJvZHk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGFwcGVuZFRvICYmIHNlbGYuZHJvcGRvd25NZW51KSB7XHJcbiAgICAgIGFwcGVuZFRvLmFwcGVuZChzZWxmLmRyb3Bkb3duTWVudSk7XHJcbiAgICAgICRlbGVtZW50Lm9uKCckZGVzdHJveScsIGZ1bmN0aW9uIGhhbmRsZURlc3Ryb3lFdmVudCgpIHtcclxuICAgICAgICBzZWxmLmRyb3Bkb3duTWVudS5yZW1vdmUoKTtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgdGhpcy50b2dnbGUgPSBmdW5jdGlvbihvcGVuKSB7XHJcbiAgICBzY29wZS5pc09wZW4gPSBhcmd1bWVudHMubGVuZ3RoID8gISFvcGVuIDogIXNjb3BlLmlzT3BlbjtcclxuICAgIGlmIChhbmd1bGFyLmlzRnVuY3Rpb24oc2V0SXNPcGVuKSkge1xyXG4gICAgICBzZXRJc09wZW4oc2NvcGUsIHNjb3BlLmlzT3Blbik7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHNjb3BlLmlzT3BlbjtcclxuICB9O1xyXG5cclxuICAvLyBBbGxvdyBvdGhlciBkaXJlY3RpdmVzIHRvIHdhdGNoIHN0YXR1c1xyXG4gIHRoaXMuaXNPcGVuID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gc2NvcGUuaXNPcGVuO1xyXG4gIH07XHJcblxyXG4gIHNjb3BlLmdldFRvZ2dsZUVsZW1lbnQgPSBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiBzZWxmLnRvZ2dsZUVsZW1lbnQ7XHJcbiAgfTtcclxuXHJcbiAgc2NvcGUuZ2V0QXV0b0Nsb3NlID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gJGF0dHJzLmF1dG9DbG9zZSB8fCAnYWx3YXlzJzsgLy9vciAnb3V0c2lkZUNsaWNrJyBvciAnZGlzYWJsZWQnXHJcbiAgfTtcclxuXHJcbiAgc2NvcGUuZ2V0RWxlbWVudCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuICRlbGVtZW50O1xyXG4gIH07XHJcblxyXG4gIHNjb3BlLmlzS2V5bmF2RW5hYmxlZCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIGtleW5hdkVuYWJsZWQ7XHJcbiAgfTtcclxuXHJcbiAgc2NvcGUuZm9jdXNEcm9wZG93bkVudHJ5ID0gZnVuY3Rpb24oa2V5Q29kZSkge1xyXG4gICAgdmFyIGVsZW1zID0gc2VsZi5kcm9wZG93bk1lbnUgPyAvL0lmIGFwcGVuZCB0byBib2R5IGlzIHVzZWQuXHJcbiAgICAgIGFuZ3VsYXIuZWxlbWVudChzZWxmLmRyb3Bkb3duTWVudSkuZmluZCgnYScpIDpcclxuICAgICAgJGVsZW1lbnQuZmluZCgndWwnKS5lcSgwKS5maW5kKCdhJyk7XHJcblxyXG4gICAgc3dpdGNoIChrZXlDb2RlKSB7XHJcbiAgICAgIGNhc2UgNDA6IHtcclxuICAgICAgICBpZiAoIWFuZ3VsYXIuaXNOdW1iZXIoc2VsZi5zZWxlY3RlZE9wdGlvbikpIHtcclxuICAgICAgICAgIHNlbGYuc2VsZWN0ZWRPcHRpb24gPSAwO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBzZWxmLnNlbGVjdGVkT3B0aW9uID0gc2VsZi5zZWxlY3RlZE9wdGlvbiA9PT0gZWxlbXMubGVuZ3RoIC0gMSA/XHJcbiAgICAgICAgICAgIHNlbGYuc2VsZWN0ZWRPcHRpb24gOlxyXG4gICAgICAgICAgICBzZWxmLnNlbGVjdGVkT3B0aW9uICsgMTtcclxuICAgICAgICB9XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgICAgY2FzZSAzODoge1xyXG4gICAgICAgIGlmICghYW5ndWxhci5pc051bWJlcihzZWxmLnNlbGVjdGVkT3B0aW9uKSkge1xyXG4gICAgICAgICAgc2VsZi5zZWxlY3RlZE9wdGlvbiA9IGVsZW1zLmxlbmd0aCAtIDE7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHNlbGYuc2VsZWN0ZWRPcHRpb24gPSBzZWxmLnNlbGVjdGVkT3B0aW9uID09PSAwID9cclxuICAgICAgICAgICAgMCA6IHNlbGYuc2VsZWN0ZWRPcHRpb24gLSAxO1xyXG4gICAgICAgIH1cclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgZWxlbXNbc2VsZi5zZWxlY3RlZE9wdGlvbl0uZm9jdXMoKTtcclxuICB9O1xyXG5cclxuICBzY29wZS5nZXREcm9wZG93bkVsZW1lbnQgPSBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiBzZWxmLmRyb3Bkb3duTWVudTtcclxuICB9O1xyXG5cclxuICBzY29wZS5mb2N1c1RvZ2dsZUVsZW1lbnQgPSBmdW5jdGlvbigpIHtcclxuICAgIGlmIChzZWxmLnRvZ2dsZUVsZW1lbnQpIHtcclxuICAgICAgc2VsZi50b2dnbGVFbGVtZW50WzBdLmZvY3VzKCk7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgc2NvcGUuJHdhdGNoKCdpc09wZW4nLCBmdW5jdGlvbihpc09wZW4sIHdhc09wZW4pIHtcclxuICAgIGlmIChhcHBlbmRUbyAmJiBzZWxmLmRyb3Bkb3duTWVudSkge1xyXG4gICAgICB2YXIgcG9zID0gJHBvc2l0aW9uLnBvc2l0aW9uRWxlbWVudHMoJGVsZW1lbnQsIHNlbGYuZHJvcGRvd25NZW51LCAnYm90dG9tLWxlZnQnLCB0cnVlKSxcclxuICAgICAgICBjc3MsXHJcbiAgICAgICAgcmlnaHRhbGlnbixcclxuICAgICAgICBzY3JvbGxiYXJQYWRkaW5nLFxyXG4gICAgICAgIHNjcm9sbGJhcldpZHRoID0gMDtcclxuXHJcbiAgICAgIGNzcyA9IHtcclxuICAgICAgICB0b3A6IHBvcy50b3AgKyAncHgnLFxyXG4gICAgICAgIGRpc3BsYXk6IGlzT3BlbiA/ICdibG9jaycgOiAnbm9uZSdcclxuICAgICAgfTtcclxuXHJcbiAgICAgIHJpZ2h0YWxpZ24gPSBzZWxmLmRyb3Bkb3duTWVudS5oYXNDbGFzcygnZHJvcGRvd24tbWVudS1yaWdodCcpO1xyXG4gICAgICBpZiAoIXJpZ2h0YWxpZ24pIHtcclxuICAgICAgICBjc3MubGVmdCA9IHBvcy5sZWZ0ICsgJ3B4JztcclxuICAgICAgICBjc3MucmlnaHQgPSAnYXV0byc7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgY3NzLmxlZnQgPSAnYXV0byc7XHJcbiAgICAgICAgc2Nyb2xsYmFyUGFkZGluZyA9ICRwb3NpdGlvbi5zY3JvbGxiYXJQYWRkaW5nKGFwcGVuZFRvKTtcclxuXHJcbiAgICAgICAgaWYgKHNjcm9sbGJhclBhZGRpbmcuaGVpZ2h0T3ZlcmZsb3cgJiYgc2Nyb2xsYmFyUGFkZGluZy5zY3JvbGxiYXJXaWR0aCkge1xyXG4gICAgICAgICAgc2Nyb2xsYmFyV2lkdGggPSBzY3JvbGxiYXJQYWRkaW5nLnNjcm9sbGJhcldpZHRoO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY3NzLnJpZ2h0ID0gd2luZG93LmlubmVyV2lkdGggLSBzY3JvbGxiYXJXaWR0aCAtXHJcbiAgICAgICAgICAocG9zLmxlZnQgKyAkZWxlbWVudC5wcm9wKCdvZmZzZXRXaWR0aCcpKSArICdweCc7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIE5lZWQgdG8gYWRqdXN0IG91ciBwb3NpdGlvbmluZyB0byBiZSByZWxhdGl2ZSB0byB0aGUgYXBwZW5kVG8gY29udGFpbmVyXHJcbiAgICAgIC8vIGlmIGl0J3Mgbm90IHRoZSBib2R5IGVsZW1lbnRcclxuICAgICAgaWYgKCFhcHBlbmRUb0JvZHkpIHtcclxuICAgICAgICB2YXIgYXBwZW5kT2Zmc2V0ID0gJHBvc2l0aW9uLm9mZnNldChhcHBlbmRUbyk7XHJcblxyXG4gICAgICAgIGNzcy50b3AgPSBwb3MudG9wIC0gYXBwZW5kT2Zmc2V0LnRvcCArICdweCc7XHJcblxyXG4gICAgICAgIGlmICghcmlnaHRhbGlnbikge1xyXG4gICAgICAgICAgY3NzLmxlZnQgPSBwb3MubGVmdCAtIGFwcGVuZE9mZnNldC5sZWZ0ICsgJ3B4JztcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgY3NzLnJpZ2h0ID0gd2luZG93LmlubmVyV2lkdGggLVxyXG4gICAgICAgICAgICAocG9zLmxlZnQgLSBhcHBlbmRPZmZzZXQubGVmdCArICRlbGVtZW50LnByb3AoJ29mZnNldFdpZHRoJykpICsgJ3B4JztcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHNlbGYuZHJvcGRvd25NZW51LmNzcyhjc3MpO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBvcGVuQ29udGFpbmVyID0gYXBwZW5kVG8gPyBhcHBlbmRUbyA6ICRlbGVtZW50O1xyXG4gICAgdmFyIGhhc09wZW5DbGFzcyA9IG9wZW5Db250YWluZXIuaGFzQ2xhc3MoYXBwZW5kVG8gPyBhcHBlbmRUb09wZW5DbGFzcyA6IG9wZW5DbGFzcyk7XHJcblxyXG4gICAgaWYgKGhhc09wZW5DbGFzcyA9PT0gIWlzT3Blbikge1xyXG4gICAgICAkYW5pbWF0ZVtpc09wZW4gPyAnYWRkQ2xhc3MnIDogJ3JlbW92ZUNsYXNzJ10ob3BlbkNvbnRhaW5lciwgYXBwZW5kVG8gPyBhcHBlbmRUb09wZW5DbGFzcyA6IG9wZW5DbGFzcykudGhlbihmdW5jdGlvbigpIHtcclxuICAgICAgICBpZiAoYW5ndWxhci5pc0RlZmluZWQoaXNPcGVuKSAmJiBpc09wZW4gIT09IHdhc09wZW4pIHtcclxuICAgICAgICAgIHRvZ2dsZUludm9rZXIoJHNjb3BlLCB7IG9wZW46ICEhaXNPcGVuIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGlzT3Blbikge1xyXG4gICAgICBpZiAoc2VsZi5kcm9wZG93bk1lbnVUZW1wbGF0ZVVybCkge1xyXG4gICAgICAgICR0ZW1wbGF0ZVJlcXVlc3Qoc2VsZi5kcm9wZG93bk1lbnVUZW1wbGF0ZVVybCkudGhlbihmdW5jdGlvbih0cGxDb250ZW50KSB7XHJcbiAgICAgICAgICB0ZW1wbGF0ZVNjb3BlID0gc2NvcGUuJG5ldygpO1xyXG4gICAgICAgICAgJGNvbXBpbGUodHBsQ29udGVudC50cmltKCkpKHRlbXBsYXRlU2NvcGUsIGZ1bmN0aW9uKGRyb3Bkb3duRWxlbWVudCkge1xyXG4gICAgICAgICAgICB2YXIgbmV3RWwgPSBkcm9wZG93bkVsZW1lbnQ7XHJcbiAgICAgICAgICAgIHNlbGYuZHJvcGRvd25NZW51LnJlcGxhY2VXaXRoKG5ld0VsKTtcclxuICAgICAgICAgICAgc2VsZi5kcm9wZG93bk1lbnUgPSBuZXdFbDtcclxuICAgICAgICAgICAgJGRvY3VtZW50Lm9uKCdrZXlkb3duJywgdWliRHJvcGRvd25TZXJ2aWNlLmtleWJpbmRGaWx0ZXIpO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgJGRvY3VtZW50Lm9uKCdrZXlkb3duJywgdWliRHJvcGRvd25TZXJ2aWNlLmtleWJpbmRGaWx0ZXIpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBzY29wZS5mb2N1c1RvZ2dsZUVsZW1lbnQoKTtcclxuICAgICAgdWliRHJvcGRvd25TZXJ2aWNlLm9wZW4oc2NvcGUsICRlbGVtZW50KTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHVpYkRyb3Bkb3duU2VydmljZS5jbG9zZShzY29wZSwgJGVsZW1lbnQpO1xyXG4gICAgICBpZiAoc2VsZi5kcm9wZG93bk1lbnVUZW1wbGF0ZVVybCkge1xyXG4gICAgICAgIGlmICh0ZW1wbGF0ZVNjb3BlKSB7XHJcbiAgICAgICAgICB0ZW1wbGF0ZVNjb3BlLiRkZXN0cm95KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciBuZXdFbCA9IGFuZ3VsYXIuZWxlbWVudCgnPHVsIGNsYXNzPVwiZHJvcGRvd24tbWVudVwiPjwvdWw+Jyk7XHJcbiAgICAgICAgc2VsZi5kcm9wZG93bk1lbnUucmVwbGFjZVdpdGgobmV3RWwpO1xyXG4gICAgICAgIHNlbGYuZHJvcGRvd25NZW51ID0gbmV3RWw7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHNlbGYuc2VsZWN0ZWRPcHRpb24gPSBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChhbmd1bGFyLmlzRnVuY3Rpb24oc2V0SXNPcGVuKSkge1xyXG4gICAgICBzZXRJc09wZW4oJHNjb3BlLCBpc09wZW4pO1xyXG4gICAgfVxyXG4gIH0pO1xyXG59XSlcclxuXHJcbi5kaXJlY3RpdmUoJ3VpYkRyb3Bkb3duJywgZnVuY3Rpb24oKSB7XHJcbiAgcmV0dXJuIHtcclxuICAgIGNvbnRyb2xsZXI6ICdVaWJEcm9wZG93bkNvbnRyb2xsZXInLFxyXG4gICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCBkcm9wZG93bkN0cmwpIHtcclxuICAgICAgZHJvcGRvd25DdHJsLmluaXQoKTtcclxuICAgIH1cclxuICB9O1xyXG59KVxyXG5cclxuLmRpcmVjdGl2ZSgndWliRHJvcGRvd25NZW51JywgZnVuY3Rpb24oKSB7XHJcbiAgcmV0dXJuIHtcclxuICAgIHJlc3RyaWN0OiAnQScsXHJcbiAgICByZXF1aXJlOiAnP151aWJEcm9wZG93bicsXHJcbiAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxlbWVudCwgYXR0cnMsIGRyb3Bkb3duQ3RybCkge1xyXG4gICAgICBpZiAoIWRyb3Bkb3duQ3RybCB8fCBhbmd1bGFyLmlzRGVmaW5lZChhdHRycy5kcm9wZG93bk5lc3RlZCkpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGVsZW1lbnQuYWRkQ2xhc3MoJ2Ryb3Bkb3duLW1lbnUnKTtcclxuXHJcbiAgICAgIHZhciB0cGxVcmwgPSBhdHRycy50ZW1wbGF0ZVVybDtcclxuICAgICAgaWYgKHRwbFVybCkge1xyXG4gICAgICAgIGRyb3Bkb3duQ3RybC5kcm9wZG93bk1lbnVUZW1wbGF0ZVVybCA9IHRwbFVybDtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKCFkcm9wZG93bkN0cmwuZHJvcGRvd25NZW51KSB7XHJcbiAgICAgICAgZHJvcGRvd25DdHJsLmRyb3Bkb3duTWVudSA9IGVsZW1lbnQ7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9O1xyXG59KVxyXG5cclxuLmRpcmVjdGl2ZSgndWliRHJvcGRvd25Ub2dnbGUnLCBmdW5jdGlvbigpIHtcclxuICByZXR1cm4ge1xyXG4gICAgcmVxdWlyZTogJz9edWliRHJvcGRvd24nLFxyXG4gICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCBkcm9wZG93bkN0cmwpIHtcclxuICAgICAgaWYgKCFkcm9wZG93bkN0cmwpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGVsZW1lbnQuYWRkQ2xhc3MoJ2Ryb3Bkb3duLXRvZ2dsZScpO1xyXG5cclxuICAgICAgZHJvcGRvd25DdHJsLnRvZ2dsZUVsZW1lbnQgPSBlbGVtZW50O1xyXG5cclxuICAgICAgdmFyIHRvZ2dsZURyb3Bkb3duID0gZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cclxuICAgICAgICBpZiAoIWVsZW1lbnQuaGFzQ2xhc3MoJ2Rpc2FibGVkJykgJiYgIWF0dHJzLmRpc2FibGVkKSB7XHJcbiAgICAgICAgICBzY29wZS4kYXBwbHkoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGRyb3Bkb3duQ3RybC50b2dnbGUoKTtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgfTtcclxuXHJcbiAgICAgIGVsZW1lbnQuYmluZCgnY2xpY2snLCB0b2dnbGVEcm9wZG93bik7XHJcblxyXG4gICAgICAvLyBXQUktQVJJQVxyXG4gICAgICBlbGVtZW50LmF0dHIoeyAnYXJpYS1oYXNwb3B1cCc6IHRydWUsICdhcmlhLWV4cGFuZGVkJzogZmFsc2UgfSk7XHJcbiAgICAgIHNjb3BlLiR3YXRjaChkcm9wZG93bkN0cmwuaXNPcGVuLCBmdW5jdGlvbihpc09wZW4pIHtcclxuICAgICAgICBlbGVtZW50LmF0dHIoJ2FyaWEtZXhwYW5kZWQnLCAhIWlzT3Blbik7XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgc2NvcGUuJG9uKCckZGVzdHJveScsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGVsZW1lbnQudW5iaW5kKCdjbGljaycsIHRvZ2dsZURyb3Bkb3duKTtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfTtcclxufSk7XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgndWkuYm9vdHN0cmFwLnN0YWNrZWRNYXAnLCBbXSlcclxuLyoqXHJcbiAqIEEgaGVscGVyLCBpbnRlcm5hbCBkYXRhIHN0cnVjdHVyZSB0aGF0IGFjdHMgYXMgYSBtYXAgYnV0IGFsc28gYWxsb3dzIGdldHRpbmcgLyByZW1vdmluZ1xyXG4gKiBlbGVtZW50cyBpbiB0aGUgTElGTyBvcmRlclxyXG4gKi9cclxuICAuZmFjdG9yeSgnJCRzdGFja2VkTWFwJywgZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBjcmVhdGVOZXc6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBzdGFjayA9IFtdO1xyXG5cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgYWRkOiBmdW5jdGlvbihrZXksIHZhbHVlKSB7XHJcbiAgICAgICAgICAgIHN0YWNrLnB1c2goe1xyXG4gICAgICAgICAgICAgIGtleToga2V5LFxyXG4gICAgICAgICAgICAgIHZhbHVlOiB2YWx1ZVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICBnZXQ6IGZ1bmN0aW9uKGtleSkge1xyXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHN0YWNrLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgaWYgKGtleSA9PT0gc3RhY2tbaV0ua2V5KSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gc3RhY2tbaV07XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAga2V5czogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHZhciBrZXlzID0gW107XHJcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc3RhY2subGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICBrZXlzLnB1c2goc3RhY2tbaV0ua2V5KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4ga2V5cztcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICB0b3A6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gc3RhY2tbc3RhY2subGVuZ3RoIC0gMV07XHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgcmVtb3ZlOiBmdW5jdGlvbihrZXkpIHtcclxuICAgICAgICAgICAgdmFyIGlkeCA9IC0xO1xyXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHN0YWNrLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgaWYgKGtleSA9PT0gc3RhY2tbaV0ua2V5KSB7XHJcbiAgICAgICAgICAgICAgICBpZHggPSBpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBzdGFjay5zcGxpY2UoaWR4LCAxKVswXTtcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICByZW1vdmVUb3A6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gc3RhY2sucG9wKCk7XHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgbGVuZ3RoOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHN0YWNrLmxlbmd0aDtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG4gIH0pO1xyXG5hbmd1bGFyLm1vZHVsZSgndWkuYm9vdHN0cmFwLm1vZGFsJywgWyd1aS5ib290c3RyYXAuc3RhY2tlZE1hcCcsICd1aS5ib290c3RyYXAucG9zaXRpb24nXSlcclxuLyoqXHJcbiAqIEEgaGVscGVyLCBpbnRlcm5hbCBkYXRhIHN0cnVjdHVyZSB0aGF0IHN0b3JlcyBhbGwgcmVmZXJlbmNlcyBhdHRhY2hlZCB0byBrZXlcclxuICovXHJcbiAgLmZhY3RvcnkoJyQkbXVsdGlNYXAnLCBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIGNyZWF0ZU5ldzogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIG1hcCA9IHt9O1xyXG5cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgZW50cmllczogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBPYmplY3Qua2V5cyhtYXApLm1hcChmdW5jdGlvbihrZXkpIHtcclxuICAgICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAga2V5OiBrZXksXHJcbiAgICAgICAgICAgICAgICB2YWx1ZTogbWFwW2tleV1cclxuICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICBnZXQ6IGZ1bmN0aW9uKGtleSkge1xyXG4gICAgICAgICAgICByZXR1cm4gbWFwW2tleV07XHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgaGFzS2V5OiBmdW5jdGlvbihrZXkpIHtcclxuICAgICAgICAgICAgcmV0dXJuICEhbWFwW2tleV07XHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAga2V5czogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBPYmplY3Qua2V5cyhtYXApO1xyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHB1dDogZnVuY3Rpb24oa2V5LCB2YWx1ZSkge1xyXG4gICAgICAgICAgICBpZiAoIW1hcFtrZXldKSB7XHJcbiAgICAgICAgICAgICAgbWFwW2tleV0gPSBbXTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbWFwW2tleV0ucHVzaCh2YWx1ZSk7XHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgcmVtb3ZlOiBmdW5jdGlvbihrZXksIHZhbHVlKSB7XHJcbiAgICAgICAgICAgIHZhciB2YWx1ZXMgPSBtYXBba2V5XTtcclxuXHJcbiAgICAgICAgICAgIGlmICghdmFsdWVzKSB7XHJcbiAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB2YXIgaWR4ID0gdmFsdWVzLmluZGV4T2YodmFsdWUpO1xyXG5cclxuICAgICAgICAgICAgaWYgKGlkeCAhPT0gLTEpIHtcclxuICAgICAgICAgICAgICB2YWx1ZXMuc3BsaWNlKGlkeCwgMSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICghdmFsdWVzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgIGRlbGV0ZSBtYXBba2V5XTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICAgIH1cclxuICAgIH07XHJcbiAgfSlcclxuXHJcbi8qKlxyXG4gKiBQbHVnZ2FibGUgcmVzb2x2ZSBtZWNoYW5pc20gZm9yIHRoZSBtb2RhbCByZXNvbHZlIHJlc29sdXRpb25cclxuICogU3VwcG9ydHMgVUkgUm91dGVyJ3MgJHJlc29sdmUgc2VydmljZVxyXG4gKi9cclxuICAucHJvdmlkZXIoJyR1aWJSZXNvbHZlJywgZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgcmVzb2x2ZSA9IHRoaXM7XHJcbiAgICB0aGlzLnJlc29sdmVyID0gbnVsbDtcclxuXHJcbiAgICB0aGlzLnNldFJlc29sdmVyID0gZnVuY3Rpb24ocmVzb2x2ZXIpIHtcclxuICAgICAgdGhpcy5yZXNvbHZlciA9IHJlc29sdmVyO1xyXG4gICAgfTtcclxuXHJcbiAgICB0aGlzLiRnZXQgPSBbJyRpbmplY3RvcicsICckcScsIGZ1bmN0aW9uKCRpbmplY3RvciwgJHEpIHtcclxuICAgICAgdmFyIHJlc29sdmVyID0gcmVzb2x2ZS5yZXNvbHZlciA/ICRpbmplY3Rvci5nZXQocmVzb2x2ZS5yZXNvbHZlcikgOiBudWxsO1xyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIHJlc29sdmU6IGZ1bmN0aW9uKGludm9jYWJsZXMsIGxvY2FscywgcGFyZW50LCBzZWxmKSB7XHJcbiAgICAgICAgICBpZiAocmVzb2x2ZXIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHJlc29sdmVyLnJlc29sdmUoaW52b2NhYmxlcywgbG9jYWxzLCBwYXJlbnQsIHNlbGYpO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIHZhciBwcm9taXNlcyA9IFtdO1xyXG5cclxuICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaChpbnZvY2FibGVzLCBmdW5jdGlvbih2YWx1ZSkge1xyXG4gICAgICAgICAgICBpZiAoYW5ndWxhci5pc0Z1bmN0aW9uKHZhbHVlKSB8fCBhbmd1bGFyLmlzQXJyYXkodmFsdWUpKSB7XHJcbiAgICAgICAgICAgICAgcHJvbWlzZXMucHVzaCgkcS5yZXNvbHZlKCRpbmplY3Rvci5pbnZva2UodmFsdWUpKSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoYW5ndWxhci5pc1N0cmluZyh2YWx1ZSkpIHtcclxuICAgICAgICAgICAgICBwcm9taXNlcy5wdXNoKCRxLnJlc29sdmUoJGluamVjdG9yLmdldCh2YWx1ZSkpKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICBwcm9taXNlcy5wdXNoKCRxLnJlc29sdmUodmFsdWUpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgcmV0dXJuICRxLmFsbChwcm9taXNlcykudGhlbihmdW5jdGlvbihyZXNvbHZlcykge1xyXG4gICAgICAgICAgICB2YXIgcmVzb2x2ZU9iaiA9IHt9O1xyXG4gICAgICAgICAgICB2YXIgcmVzb2x2ZUl0ZXIgPSAwO1xyXG4gICAgICAgICAgICBhbmd1bGFyLmZvckVhY2goaW52b2NhYmxlcywgZnVuY3Rpb24odmFsdWUsIGtleSkge1xyXG4gICAgICAgICAgICAgIHJlc29sdmVPYmpba2V5XSA9IHJlc29sdmVzW3Jlc29sdmVJdGVyKytdO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiByZXNvbHZlT2JqO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9O1xyXG4gICAgfV07XHJcbiAgfSlcclxuXHJcbi8qKlxyXG4gKiBBIGhlbHBlciBkaXJlY3RpdmUgZm9yIHRoZSAkbW9kYWwgc2VydmljZS4gSXQgY3JlYXRlcyBhIGJhY2tkcm9wIGVsZW1lbnQuXHJcbiAqL1xyXG4gIC5kaXJlY3RpdmUoJ3VpYk1vZGFsQmFja2Ryb3AnLCBbJyRhbmltYXRlJywgJyRpbmplY3RvcicsICckdWliTW9kYWxTdGFjaycsXHJcbiAgZnVuY3Rpb24oJGFuaW1hdGUsICRpbmplY3RvciwgJG1vZGFsU3RhY2spIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIHJlc3RyaWN0OiAnQScsXHJcbiAgICAgIGNvbXBpbGU6IGZ1bmN0aW9uKHRFbGVtZW50LCB0QXR0cnMpIHtcclxuICAgICAgICB0RWxlbWVudC5hZGRDbGFzcyh0QXR0cnMuYmFja2Ryb3BDbGFzcyk7XHJcbiAgICAgICAgcmV0dXJuIGxpbmtGbjtcclxuICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICBmdW5jdGlvbiBsaW5rRm4oc2NvcGUsIGVsZW1lbnQsIGF0dHJzKSB7XHJcbiAgICAgIGlmIChhdHRycy5tb2RhbEluQ2xhc3MpIHtcclxuICAgICAgICAkYW5pbWF0ZS5hZGRDbGFzcyhlbGVtZW50LCBhdHRycy5tb2RhbEluQ2xhc3MpO1xyXG5cclxuICAgICAgICBzY29wZS4kb24oJG1vZGFsU3RhY2suTk9XX0NMT1NJTkdfRVZFTlQsIGZ1bmN0aW9uKGUsIHNldElzQXN5bmMpIHtcclxuICAgICAgICAgIHZhciBkb25lID0gc2V0SXNBc3luYygpO1xyXG4gICAgICAgICAgaWYgKHNjb3BlLm1vZGFsT3B0aW9ucy5hbmltYXRpb24pIHtcclxuICAgICAgICAgICAgJGFuaW1hdGUucmVtb3ZlQ2xhc3MoZWxlbWVudCwgYXR0cnMubW9kYWxJbkNsYXNzKS50aGVuKGRvbmUpO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgZG9uZSgpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfV0pXHJcblxyXG4gIC5kaXJlY3RpdmUoJ3VpYk1vZGFsV2luZG93JywgWyckdWliTW9kYWxTdGFjaycsICckcScsICckYW5pbWF0ZUNzcycsICckZG9jdW1lbnQnLFxyXG4gIGZ1bmN0aW9uKCRtb2RhbFN0YWNrLCAkcSwgJGFuaW1hdGVDc3MsICRkb2N1bWVudCkge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgc2NvcGU6IHtcclxuICAgICAgICBpbmRleDogJ0AnXHJcbiAgICAgIH0sXHJcbiAgICAgIHJlc3RyaWN0OiAnQScsXHJcbiAgICAgIHRyYW5zY2x1ZGU6IHRydWUsXHJcbiAgICAgIHRlbXBsYXRlVXJsOiBmdW5jdGlvbih0RWxlbWVudCwgdEF0dHJzKSB7XHJcbiAgICAgICAgcmV0dXJuIHRBdHRycy50ZW1wbGF0ZVVybCB8fCAndWliL3RlbXBsYXRlL21vZGFsL3dpbmRvdy5odG1sJztcclxuICAgICAgfSxcclxuICAgICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsZW1lbnQsIGF0dHJzKSB7XHJcbiAgICAgICAgZWxlbWVudC5hZGRDbGFzcyhhdHRycy53aW5kb3dUb3BDbGFzcyB8fCAnJyk7XHJcbiAgICAgICAgc2NvcGUuc2l6ZSA9IGF0dHJzLnNpemU7XHJcblxyXG4gICAgICAgIHNjb3BlLmNsb3NlID0gZnVuY3Rpb24oZXZ0KSB7XHJcbiAgICAgICAgICB2YXIgbW9kYWwgPSAkbW9kYWxTdGFjay5nZXRUb3AoKTtcclxuICAgICAgICAgIGlmIChtb2RhbCAmJiBtb2RhbC52YWx1ZS5iYWNrZHJvcCAmJlxyXG4gICAgICAgICAgICBtb2RhbC52YWx1ZS5iYWNrZHJvcCAhPT0gJ3N0YXRpYycgJiZcclxuICAgICAgICAgICAgZXZ0LnRhcmdldCA9PT0gZXZ0LmN1cnJlbnRUYXJnZXQpIHtcclxuICAgICAgICAgICAgZXZ0LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgIGV2dC5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICAgICAgJG1vZGFsU3RhY2suZGlzbWlzcyhtb2RhbC5rZXksICdiYWNrZHJvcCBjbGljaycpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8vIG1vdmVkIGZyb20gdGVtcGxhdGUgdG8gZml4IGlzc3VlICMyMjgwXHJcbiAgICAgICAgZWxlbWVudC5vbignY2xpY2snLCBzY29wZS5jbG9zZSk7XHJcblxyXG4gICAgICAgIC8vIFRoaXMgcHJvcGVydHkgaXMgb25seSBhZGRlZCB0byB0aGUgc2NvcGUgZm9yIHRoZSBwdXJwb3NlIG9mIGRldGVjdGluZyB3aGVuIHRoaXMgZGlyZWN0aXZlIGlzIHJlbmRlcmVkLlxyXG4gICAgICAgIC8vIFdlIGNhbiBkZXRlY3QgdGhhdCBieSB1c2luZyB0aGlzIHByb3BlcnR5IGluIHRoZSB0ZW1wbGF0ZSBhc3NvY2lhdGVkIHdpdGggdGhpcyBkaXJlY3RpdmUgYW5kIHRoZW4gdXNlXHJcbiAgICAgICAgLy8ge0BsaW5rIEF0dHJpYnV0ZSMkb2JzZXJ2ZX0gb24gaXQuIEZvciBtb3JlIGRldGFpbHMgcGxlYXNlIHNlZSB7QGxpbmsgVGFibGVDb2x1bW5SZXNpemV9LlxyXG4gICAgICAgIHNjb3BlLiRpc1JlbmRlcmVkID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgLy8gRGVmZXJyZWQgb2JqZWN0IHRoYXQgd2lsbCBiZSByZXNvbHZlZCB3aGVuIHRoaXMgbW9kYWwgaXMgcmVuZGVyZWQuXHJcbiAgICAgICAgdmFyIG1vZGFsUmVuZGVyRGVmZXJPYmogPSAkcS5kZWZlcigpO1xyXG4gICAgICAgIC8vIFJlc29sdmUgcmVuZGVyIHByb21pc2UgcG9zdC1kaWdlc3RcclxuICAgICAgICBzY29wZS4kJHBvc3REaWdlc3QoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICBtb2RhbFJlbmRlckRlZmVyT2JqLnJlc29sdmUoKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgbW9kYWxSZW5kZXJEZWZlck9iai5wcm9taXNlLnRoZW4oZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICB2YXIgYW5pbWF0aW9uUHJvbWlzZSA9IG51bGw7XHJcblxyXG4gICAgICAgICAgaWYgKGF0dHJzLm1vZGFsSW5DbGFzcykge1xyXG4gICAgICAgICAgICBhbmltYXRpb25Qcm9taXNlID0gJGFuaW1hdGVDc3MoZWxlbWVudCwge1xyXG4gICAgICAgICAgICAgIGFkZENsYXNzOiBhdHRycy5tb2RhbEluQ2xhc3NcclxuICAgICAgICAgICAgfSkuc3RhcnQoKTtcclxuXHJcbiAgICAgICAgICAgIHNjb3BlLiRvbigkbW9kYWxTdGFjay5OT1dfQ0xPU0lOR19FVkVOVCwgZnVuY3Rpb24oZSwgc2V0SXNBc3luYykge1xyXG4gICAgICAgICAgICAgIHZhciBkb25lID0gc2V0SXNBc3luYygpO1xyXG4gICAgICAgICAgICAgICRhbmltYXRlQ3NzKGVsZW1lbnQsIHtcclxuICAgICAgICAgICAgICAgIHJlbW92ZUNsYXNzOiBhdHRycy5tb2RhbEluQ2xhc3NcclxuICAgICAgICAgICAgICB9KS5zdGFydCgpLnRoZW4oZG9uZSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgICAkcS53aGVuKGFuaW1hdGlvblByb21pc2UpLnRoZW4oZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIC8vIE5vdGlmeSB7QGxpbmsgJG1vZGFsU3RhY2t9IHRoYXQgbW9kYWwgaXMgcmVuZGVyZWQuXHJcbiAgICAgICAgICAgIHZhciBtb2RhbCA9ICRtb2RhbFN0YWNrLmdldFRvcCgpO1xyXG4gICAgICAgICAgICBpZiAobW9kYWwpIHtcclxuICAgICAgICAgICAgICAkbW9kYWxTdGFjay5tb2RhbFJlbmRlcmVkKG1vZGFsLmtleSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8qKlxyXG4gICAgICAgICAgICAgKiBJZiBzb21ldGhpbmcgd2l0aGluIHRoZSBmcmVzaGx5LW9wZW5lZCBtb2RhbCBhbHJlYWR5IGhhcyBmb2N1cyAocGVyaGFwcyB2aWEgYVxyXG4gICAgICAgICAgICAgKiBkaXJlY3RpdmUgdGhhdCBjYXVzZXMgZm9jdXMpIHRoZW4gdGhlcmUncyBubyBuZWVkIHRvIHRyeSB0byBmb2N1cyBhbnl0aGluZy5cclxuICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgIGlmICghKCRkb2N1bWVudFswXS5hY3RpdmVFbGVtZW50ICYmIGVsZW1lbnRbMF0uY29udGFpbnMoJGRvY3VtZW50WzBdLmFjdGl2ZUVsZW1lbnQpKSkge1xyXG4gICAgICAgICAgICAgIHZhciBpbnB1dFdpdGhBdXRvZm9jdXMgPSBlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3IoJ1thdXRvZm9jdXNdJyk7XHJcbiAgICAgICAgICAgICAgLyoqXHJcbiAgICAgICAgICAgICAgICogQXV0by1mb2N1c2luZyBvZiBhIGZyZXNobHktb3BlbmVkIG1vZGFsIGVsZW1lbnQgY2F1c2VzIGFueSBjaGlsZCBlbGVtZW50c1xyXG4gICAgICAgICAgICAgICAqIHdpdGggdGhlIGF1dG9mb2N1cyBhdHRyaWJ1dGUgdG8gbG9zZSBmb2N1cy4gVGhpcyBpcyBhbiBpc3N1ZSBvbiB0b3VjaFxyXG4gICAgICAgICAgICAgICAqIGJhc2VkIGRldmljZXMgd2hpY2ggd2lsbCBzaG93IGFuZCB0aGVuIGhpZGUgdGhlIG9uc2NyZWVuIGtleWJvYXJkLlxyXG4gICAgICAgICAgICAgICAqIEF0dGVtcHRzIHRvIHJlZm9jdXMgdGhlIGF1dG9mb2N1cyBlbGVtZW50IHZpYSBKYXZhU2NyaXB0IHdpbGwgbm90IHJlb3BlblxyXG4gICAgICAgICAgICAgICAqIHRoZSBvbnNjcmVlbiBrZXlib2FyZC4gRml4ZWQgYnkgdXBkYXRlZCB0aGUgZm9jdXNpbmcgbG9naWMgdG8gb25seSBhdXRvZm9jdXNcclxuICAgICAgICAgICAgICAgKiB0aGUgbW9kYWwgZWxlbWVudCBpZiB0aGUgbW9kYWwgZG9lcyBub3QgY29udGFpbiBhbiBhdXRvZm9jdXMgZWxlbWVudC5cclxuICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICBpZiAoaW5wdXRXaXRoQXV0b2ZvY3VzKSB7XHJcbiAgICAgICAgICAgICAgICBpbnB1dFdpdGhBdXRvZm9jdXMuZm9jdXMoKTtcclxuICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgZWxlbWVudFswXS5mb2N1cygpO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgIH07XHJcbiAgfV0pXHJcblxyXG4gIC5kaXJlY3RpdmUoJ3VpYk1vZGFsQW5pbWF0aW9uQ2xhc3MnLCBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIGNvbXBpbGU6IGZ1bmN0aW9uKHRFbGVtZW50LCB0QXR0cnMpIHtcclxuICAgICAgICBpZiAodEF0dHJzLm1vZGFsQW5pbWF0aW9uKSB7XHJcbiAgICAgICAgICB0RWxlbWVudC5hZGRDbGFzcyh0QXR0cnMudWliTW9kYWxBbmltYXRpb25DbGFzcyk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9O1xyXG4gIH0pXHJcblxyXG4gIC5kaXJlY3RpdmUoJ3VpYk1vZGFsVHJhbnNjbHVkZScsIFsnJGFuaW1hdGUnLCBmdW5jdGlvbigkYW5pbWF0ZSkge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCBjb250cm9sbGVyLCB0cmFuc2NsdWRlKSB7XHJcbiAgICAgICAgdHJhbnNjbHVkZShzY29wZS4kcGFyZW50LCBmdW5jdGlvbihjbG9uZSkge1xyXG4gICAgICAgICAgZWxlbWVudC5lbXB0eSgpO1xyXG4gICAgICAgICAgJGFuaW1hdGUuZW50ZXIoY2xvbmUsIGVsZW1lbnQpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG4gIH1dKVxyXG5cclxuICAuZmFjdG9yeSgnJHVpYk1vZGFsU3RhY2snLCBbJyRhbmltYXRlJywgJyRhbmltYXRlQ3NzJywgJyRkb2N1bWVudCcsXHJcbiAgICAnJGNvbXBpbGUnLCAnJHJvb3RTY29wZScsICckcScsICckJG11bHRpTWFwJywgJyQkc3RhY2tlZE1hcCcsICckdWliUG9zaXRpb24nLFxyXG4gICAgZnVuY3Rpb24oJGFuaW1hdGUsICRhbmltYXRlQ3NzLCAkZG9jdW1lbnQsICRjb21waWxlLCAkcm9vdFNjb3BlLCAkcSwgJCRtdWx0aU1hcCwgJCRzdGFja2VkTWFwLCAkdWliUG9zaXRpb24pIHtcclxuICAgICAgdmFyIE9QRU5FRF9NT0RBTF9DTEFTUyA9ICdtb2RhbC1vcGVuJztcclxuXHJcbiAgICAgIHZhciBiYWNrZHJvcERvbUVsLCBiYWNrZHJvcFNjb3BlO1xyXG4gICAgICB2YXIgb3BlbmVkV2luZG93cyA9ICQkc3RhY2tlZE1hcC5jcmVhdGVOZXcoKTtcclxuICAgICAgdmFyIG9wZW5lZENsYXNzZXMgPSAkJG11bHRpTWFwLmNyZWF0ZU5ldygpO1xyXG4gICAgICB2YXIgJG1vZGFsU3RhY2sgPSB7XHJcbiAgICAgICAgTk9XX0NMT1NJTkdfRVZFTlQ6ICdtb2RhbC5zdGFjay5ub3ctY2xvc2luZydcclxuICAgICAgfTtcclxuICAgICAgdmFyIHRvcE1vZGFsSW5kZXggPSAwO1xyXG4gICAgICB2YXIgcHJldmlvdXNUb3BPcGVuZWRNb2RhbCA9IG51bGw7XHJcbiAgICAgIHZhciBBUklBX0hJRERFTl9BVFRSSUJVVEVfTkFNRSA9ICdkYXRhLWJvb3RzdHJhcC1tb2RhbC1hcmlhLWhpZGRlbi1jb3VudCc7XHJcblxyXG4gICAgICAvL01vZGFsIGZvY3VzIGJlaGF2aW9yXHJcbiAgICAgIHZhciB0YWJiYWJsZVNlbGVjdG9yID0gJ2FbaHJlZl0sIGFyZWFbaHJlZl0sIGlucHV0Om5vdChbZGlzYWJsZWRdKTpub3QoW3RhYmluZGV4PVxcJy0xXFwnXSksICcgK1xyXG4gICAgICAgICdidXR0b246bm90KFtkaXNhYmxlZF0pOm5vdChbdGFiaW5kZXg9XFwnLTFcXCddKSxzZWxlY3Q6bm90KFtkaXNhYmxlZF0pOm5vdChbdGFiaW5kZXg9XFwnLTFcXCddKSwgdGV4dGFyZWE6bm90KFtkaXNhYmxlZF0pOm5vdChbdGFiaW5kZXg9XFwnLTFcXCddKSwgJyArXHJcbiAgICAgICAgJ2lmcmFtZSwgb2JqZWN0LCBlbWJlZCwgKlt0YWJpbmRleF06bm90KFt0YWJpbmRleD1cXCctMVxcJ10pLCAqW2NvbnRlbnRlZGl0YWJsZT10cnVlXSc7XHJcbiAgICAgIHZhciBzY3JvbGxiYXJQYWRkaW5nO1xyXG4gICAgICB2YXIgU05BS0VfQ0FTRV9SRUdFWFAgPSAvW0EtWl0vZztcclxuXHJcbiAgICAgIC8vIFRPRE86IGV4dHJhY3QgaW50byBjb21tb24gZGVwZW5kZW5jeSB3aXRoIHRvb2x0aXBcclxuICAgICAgZnVuY3Rpb24gc25ha2VfY2FzZShuYW1lKSB7XHJcbiAgICAgICAgdmFyIHNlcGFyYXRvciA9ICctJztcclxuICAgICAgICByZXR1cm4gbmFtZS5yZXBsYWNlKFNOQUtFX0NBU0VfUkVHRVhQLCBmdW5jdGlvbihsZXR0ZXIsIHBvcykge1xyXG4gICAgICAgICAgcmV0dXJuIChwb3MgPyBzZXBhcmF0b3IgOiAnJykgKyBsZXR0ZXIudG9Mb3dlckNhc2UoKTtcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG5cclxuICAgICAgZnVuY3Rpb24gaXNWaXNpYmxlKGVsZW1lbnQpIHtcclxuICAgICAgICByZXR1cm4gISEoZWxlbWVudC5vZmZzZXRXaWR0aCB8fFxyXG4gICAgICAgICAgZWxlbWVudC5vZmZzZXRIZWlnaHQgfHxcclxuICAgICAgICAgIGVsZW1lbnQuZ2V0Q2xpZW50UmVjdHMoKS5sZW5ndGgpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBmdW5jdGlvbiBiYWNrZHJvcEluZGV4KCkge1xyXG4gICAgICAgIHZhciB0b3BCYWNrZHJvcEluZGV4ID0gLTE7XHJcbiAgICAgICAgdmFyIG9wZW5lZCA9IG9wZW5lZFdpbmRvd3Mua2V5cygpO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgb3BlbmVkLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICBpZiAob3BlbmVkV2luZG93cy5nZXQob3BlbmVkW2ldKS52YWx1ZS5iYWNrZHJvcCkge1xyXG4gICAgICAgICAgICB0b3BCYWNrZHJvcEluZGV4ID0gaTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIElmIGFueSBiYWNrZHJvcCBleGlzdCwgZW5zdXJlIHRoYXQgaXQncyBpbmRleCBpcyBhbHdheXNcclxuICAgICAgICAvLyByaWdodCBiZWxvdyB0aGUgdG9wIG1vZGFsXHJcbiAgICAgICAgaWYgKHRvcEJhY2tkcm9wSW5kZXggPiAtMSAmJiB0b3BCYWNrZHJvcEluZGV4IDwgdG9wTW9kYWxJbmRleCkge1xyXG4gICAgICAgICAgdG9wQmFja2Ryb3BJbmRleCA9IHRvcE1vZGFsSW5kZXg7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0b3BCYWNrZHJvcEluZGV4O1xyXG4gICAgICB9XHJcblxyXG4gICAgICAkcm9vdFNjb3BlLiR3YXRjaChiYWNrZHJvcEluZGV4LCBmdW5jdGlvbihuZXdCYWNrZHJvcEluZGV4KSB7XHJcbiAgICAgICAgaWYgKGJhY2tkcm9wU2NvcGUpIHtcclxuICAgICAgICAgIGJhY2tkcm9wU2NvcGUuaW5kZXggPSBuZXdCYWNrZHJvcEluZGV4O1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcblxyXG4gICAgICBmdW5jdGlvbiByZW1vdmVNb2RhbFdpbmRvdyhtb2RhbEluc3RhbmNlLCBlbGVtZW50VG9SZWNlaXZlRm9jdXMpIHtcclxuICAgICAgICB2YXIgbW9kYWxXaW5kb3cgPSBvcGVuZWRXaW5kb3dzLmdldChtb2RhbEluc3RhbmNlKS52YWx1ZTtcclxuICAgICAgICB2YXIgYXBwZW5kVG9FbGVtZW50ID0gbW9kYWxXaW5kb3cuYXBwZW5kVG87XHJcblxyXG4gICAgICAgIC8vY2xlYW4gdXAgdGhlIHN0YWNrXHJcbiAgICAgICAgb3BlbmVkV2luZG93cy5yZW1vdmUobW9kYWxJbnN0YW5jZSk7XHJcbiAgICAgICAgcHJldmlvdXNUb3BPcGVuZWRNb2RhbCA9IG9wZW5lZFdpbmRvd3MudG9wKCk7XHJcbiAgICAgICAgaWYgKHByZXZpb3VzVG9wT3BlbmVkTW9kYWwpIHtcclxuICAgICAgICAgIHRvcE1vZGFsSW5kZXggPSBwYXJzZUludChwcmV2aW91c1RvcE9wZW5lZE1vZGFsLnZhbHVlLm1vZGFsRG9tRWwuYXR0cignaW5kZXgnKSwgMTApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmVtb3ZlQWZ0ZXJBbmltYXRlKG1vZGFsV2luZG93Lm1vZGFsRG9tRWwsIG1vZGFsV2luZG93Lm1vZGFsU2NvcGUsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgdmFyIG1vZGFsQm9keUNsYXNzID0gbW9kYWxXaW5kb3cub3BlbmVkQ2xhc3MgfHwgT1BFTkVEX01PREFMX0NMQVNTO1xyXG4gICAgICAgICAgb3BlbmVkQ2xhc3Nlcy5yZW1vdmUobW9kYWxCb2R5Q2xhc3MsIG1vZGFsSW5zdGFuY2UpO1xyXG4gICAgICAgICAgdmFyIGFyZUFueU9wZW4gPSBvcGVuZWRDbGFzc2VzLmhhc0tleShtb2RhbEJvZHlDbGFzcyk7XHJcbiAgICAgICAgICBhcHBlbmRUb0VsZW1lbnQudG9nZ2xlQ2xhc3MobW9kYWxCb2R5Q2xhc3MsIGFyZUFueU9wZW4pO1xyXG4gICAgICAgICAgaWYgKCFhcmVBbnlPcGVuICYmIHNjcm9sbGJhclBhZGRpbmcgJiYgc2Nyb2xsYmFyUGFkZGluZy5oZWlnaHRPdmVyZmxvdyAmJiBzY3JvbGxiYXJQYWRkaW5nLnNjcm9sbGJhcldpZHRoKSB7XHJcbiAgICAgICAgICAgIGlmIChzY3JvbGxiYXJQYWRkaW5nLm9yaWdpbmFsUmlnaHQpIHtcclxuICAgICAgICAgICAgICBhcHBlbmRUb0VsZW1lbnQuY3NzKHtwYWRkaW5nUmlnaHQ6IHNjcm9sbGJhclBhZGRpbmcub3JpZ2luYWxSaWdodCArICdweCd9KTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICBhcHBlbmRUb0VsZW1lbnQuY3NzKHtwYWRkaW5nUmlnaHQ6ICcnfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgc2Nyb2xsYmFyUGFkZGluZyA9IG51bGw7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICB0b2dnbGVUb3BXaW5kb3dDbGFzcyh0cnVlKTtcclxuICAgICAgICB9LCBtb2RhbFdpbmRvdy5jbG9zZWREZWZlcnJlZCk7XHJcbiAgICAgICAgY2hlY2tSZW1vdmVCYWNrZHJvcCgpO1xyXG5cclxuICAgICAgICAvL21vdmUgZm9jdXMgdG8gc3BlY2lmaWVkIGVsZW1lbnQgaWYgYXZhaWxhYmxlLCBvciBlbHNlIHRvIGJvZHlcclxuICAgICAgICBpZiAoZWxlbWVudFRvUmVjZWl2ZUZvY3VzICYmIGVsZW1lbnRUb1JlY2VpdmVGb2N1cy5mb2N1cykge1xyXG4gICAgICAgICAgZWxlbWVudFRvUmVjZWl2ZUZvY3VzLmZvY3VzKCk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChhcHBlbmRUb0VsZW1lbnQuZm9jdXMpIHtcclxuICAgICAgICAgIGFwcGVuZFRvRWxlbWVudC5mb2N1cygpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gQWRkIG9yIHJlbW92ZSBcIndpbmRvd1RvcENsYXNzXCIgZnJvbSB0aGUgdG9wIHdpbmRvdyBpbiB0aGUgc3RhY2tcclxuICAgICAgZnVuY3Rpb24gdG9nZ2xlVG9wV2luZG93Q2xhc3ModG9nZ2xlU3dpdGNoKSB7XHJcbiAgICAgICAgdmFyIG1vZGFsV2luZG93O1xyXG5cclxuICAgICAgICBpZiAob3BlbmVkV2luZG93cy5sZW5ndGgoKSA+IDApIHtcclxuICAgICAgICAgIG1vZGFsV2luZG93ID0gb3BlbmVkV2luZG93cy50b3AoKS52YWx1ZTtcclxuICAgICAgICAgIG1vZGFsV2luZG93Lm1vZGFsRG9tRWwudG9nZ2xlQ2xhc3MobW9kYWxXaW5kb3cud2luZG93VG9wQ2xhc3MgfHwgJycsIHRvZ2dsZVN3aXRjaCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICBmdW5jdGlvbiBjaGVja1JlbW92ZUJhY2tkcm9wKCkge1xyXG4gICAgICAgIC8vcmVtb3ZlIGJhY2tkcm9wIGlmIG5vIGxvbmdlciBuZWVkZWRcclxuICAgICAgICBpZiAoYmFja2Ryb3BEb21FbCAmJiBiYWNrZHJvcEluZGV4KCkgPT09IC0xKSB7XHJcbiAgICAgICAgICB2YXIgYmFja2Ryb3BTY29wZVJlZiA9IGJhY2tkcm9wU2NvcGU7XHJcbiAgICAgICAgICByZW1vdmVBZnRlckFuaW1hdGUoYmFja2Ryb3BEb21FbCwgYmFja2Ryb3BTY29wZSwgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGJhY2tkcm9wU2NvcGVSZWYgPSBudWxsO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgICBiYWNrZHJvcERvbUVsID0gdW5kZWZpbmVkO1xyXG4gICAgICAgICAgYmFja2Ryb3BTY29wZSA9IHVuZGVmaW5lZDtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGZ1bmN0aW9uIHJlbW92ZUFmdGVyQW5pbWF0ZShkb21FbCwgc2NvcGUsIGRvbmUsIGNsb3NlZERlZmVycmVkKSB7XHJcbiAgICAgICAgdmFyIGFzeW5jRGVmZXJyZWQ7XHJcbiAgICAgICAgdmFyIGFzeW5jUHJvbWlzZSA9IG51bGw7XHJcbiAgICAgICAgdmFyIHNldElzQXN5bmMgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgIGlmICghYXN5bmNEZWZlcnJlZCkge1xyXG4gICAgICAgICAgICBhc3luY0RlZmVycmVkID0gJHEuZGVmZXIoKTtcclxuICAgICAgICAgICAgYXN5bmNQcm9taXNlID0gYXN5bmNEZWZlcnJlZC5wcm9taXNlO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIHJldHVybiBmdW5jdGlvbiBhc3luY0RvbmUoKSB7XHJcbiAgICAgICAgICAgIGFzeW5jRGVmZXJyZWQucmVzb2x2ZSgpO1xyXG4gICAgICAgICAgfTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIHNjb3BlLiRicm9hZGNhc3QoJG1vZGFsU3RhY2suTk9XX0NMT1NJTkdfRVZFTlQsIHNldElzQXN5bmMpO1xyXG5cclxuICAgICAgICAvLyBOb3RlIHRoYXQgaXQncyBpbnRlbnRpb25hbCB0aGF0IGFzeW5jUHJvbWlzZSBtaWdodCBiZSBudWxsLlxyXG4gICAgICAgIC8vIFRoYXQncyB3aGVuIHNldElzQXN5bmMgaGFzIG5vdCBiZWVuIGNhbGxlZCBkdXJpbmcgdGhlXHJcbiAgICAgICAgLy8gTk9XX0NMT1NJTkdfRVZFTlQgYnJvYWRjYXN0LlxyXG4gICAgICAgIHJldHVybiAkcS53aGVuKGFzeW5jUHJvbWlzZSkudGhlbihhZnRlckFuaW1hdGluZyk7XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGFmdGVyQW5pbWF0aW5nKCkge1xyXG4gICAgICAgICAgaWYgKGFmdGVyQW5pbWF0aW5nLmRvbmUpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgYWZ0ZXJBbmltYXRpbmcuZG9uZSA9IHRydWU7XHJcblxyXG4gICAgICAgICAgJGFuaW1hdGUubGVhdmUoZG9tRWwpLnRoZW4oZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGlmIChkb25lKSB7XHJcbiAgICAgICAgICAgICAgZG9uZSgpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBkb21FbC5yZW1vdmUoKTtcclxuICAgICAgICAgICAgaWYgKGNsb3NlZERlZmVycmVkKSB7XHJcbiAgICAgICAgICAgICAgY2xvc2VkRGVmZXJyZWQucmVzb2x2ZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICBzY29wZS4kZGVzdHJveSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgJGRvY3VtZW50Lm9uKCdrZXlkb3duJywga2V5ZG93bkxpc3RlbmVyKTtcclxuXHJcbiAgICAgICRyb290U2NvcGUuJG9uKCckZGVzdHJveScsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICRkb2N1bWVudC5vZmYoJ2tleWRvd24nLCBrZXlkb3duTGlzdGVuZXIpO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIGZ1bmN0aW9uIGtleWRvd25MaXN0ZW5lcihldnQpIHtcclxuICAgICAgICBpZiAoZXZ0LmlzRGVmYXVsdFByZXZlbnRlZCgpKSB7XHJcbiAgICAgICAgICByZXR1cm4gZXZ0O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdmFyIG1vZGFsID0gb3BlbmVkV2luZG93cy50b3AoKTtcclxuICAgICAgICBpZiAobW9kYWwpIHtcclxuICAgICAgICAgIHN3aXRjaCAoZXZ0LndoaWNoKSB7XHJcbiAgICAgICAgICAgIGNhc2UgMjc6IHtcclxuICAgICAgICAgICAgICBpZiAobW9kYWwudmFsdWUua2V5Ym9hcmQpIHtcclxuICAgICAgICAgICAgICAgIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYXBwbHkoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICRtb2RhbFN0YWNrLmRpc21pc3MobW9kYWwua2V5LCAnZXNjYXBlIGtleSBwcmVzcycpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhc2UgOToge1xyXG4gICAgICAgICAgICAgIHZhciBsaXN0ID0gJG1vZGFsU3RhY2subG9hZEZvY3VzRWxlbWVudExpc3QobW9kYWwpO1xyXG4gICAgICAgICAgICAgIHZhciBmb2N1c0NoYW5nZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICBpZiAoZXZ0LnNoaWZ0S2V5KSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoJG1vZGFsU3RhY2suaXNGb2N1c0luRmlyc3RJdGVtKGV2dCwgbGlzdCkgfHwgJG1vZGFsU3RhY2suaXNNb2RhbEZvY3VzZWQoZXZ0LCBtb2RhbCkpIHtcclxuICAgICAgICAgICAgICAgICAgZm9jdXNDaGFuZ2VkID0gJG1vZGFsU3RhY2suZm9jdXNMYXN0Rm9jdXNhYmxlRWxlbWVudChsaXN0KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgaWYgKCRtb2RhbFN0YWNrLmlzRm9jdXNJbkxhc3RJdGVtKGV2dCwgbGlzdCkpIHtcclxuICAgICAgICAgICAgICAgICAgZm9jdXNDaGFuZ2VkID0gJG1vZGFsU3RhY2suZm9jdXNGaXJzdEZvY3VzYWJsZUVsZW1lbnQobGlzdCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICBpZiAoZm9jdXNDaGFuZ2VkKSB7XHJcbiAgICAgICAgICAgICAgICBldnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICAgIGV2dC5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICAkbW9kYWxTdGFjay5vcGVuID0gZnVuY3Rpb24obW9kYWxJbnN0YW5jZSwgbW9kYWwpIHtcclxuICAgICAgICB2YXIgbW9kYWxPcGVuZXIgPSAkZG9jdW1lbnRbMF0uYWN0aXZlRWxlbWVudCxcclxuICAgICAgICAgIG1vZGFsQm9keUNsYXNzID0gbW9kYWwub3BlbmVkQ2xhc3MgfHwgT1BFTkVEX01PREFMX0NMQVNTO1xyXG5cclxuICAgICAgICB0b2dnbGVUb3BXaW5kb3dDbGFzcyhmYWxzZSk7XHJcblxyXG4gICAgICAgIC8vIFN0b3JlIHRoZSBjdXJyZW50IHRvcCBmaXJzdCwgdG8gZGV0ZXJtaW5lIHdoYXQgaW5kZXggd2Ugb3VnaHQgdG8gdXNlXHJcbiAgICAgICAgLy8gZm9yIHRoZSBjdXJyZW50IHRvcCBtb2RhbFxyXG4gICAgICAgIHByZXZpb3VzVG9wT3BlbmVkTW9kYWwgPSBvcGVuZWRXaW5kb3dzLnRvcCgpO1xyXG5cclxuICAgICAgICBvcGVuZWRXaW5kb3dzLmFkZChtb2RhbEluc3RhbmNlLCB7XHJcbiAgICAgICAgICBkZWZlcnJlZDogbW9kYWwuZGVmZXJyZWQsXHJcbiAgICAgICAgICByZW5kZXJEZWZlcnJlZDogbW9kYWwucmVuZGVyRGVmZXJyZWQsXHJcbiAgICAgICAgICBjbG9zZWREZWZlcnJlZDogbW9kYWwuY2xvc2VkRGVmZXJyZWQsXHJcbiAgICAgICAgICBtb2RhbFNjb3BlOiBtb2RhbC5zY29wZSxcclxuICAgICAgICAgIGJhY2tkcm9wOiBtb2RhbC5iYWNrZHJvcCxcclxuICAgICAgICAgIGtleWJvYXJkOiBtb2RhbC5rZXlib2FyZCxcclxuICAgICAgICAgIG9wZW5lZENsYXNzOiBtb2RhbC5vcGVuZWRDbGFzcyxcclxuICAgICAgICAgIHdpbmRvd1RvcENsYXNzOiBtb2RhbC53aW5kb3dUb3BDbGFzcyxcclxuICAgICAgICAgIGFuaW1hdGlvbjogbW9kYWwuYW5pbWF0aW9uLFxyXG4gICAgICAgICAgYXBwZW5kVG86IG1vZGFsLmFwcGVuZFRvXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIG9wZW5lZENsYXNzZXMucHV0KG1vZGFsQm9keUNsYXNzLCBtb2RhbEluc3RhbmNlKTtcclxuXHJcbiAgICAgICAgdmFyIGFwcGVuZFRvRWxlbWVudCA9IG1vZGFsLmFwcGVuZFRvLFxyXG4gICAgICAgICAgICBjdXJyQmFja2Ryb3BJbmRleCA9IGJhY2tkcm9wSW5kZXgoKTtcclxuXHJcbiAgICAgICAgaWYgKCFhcHBlbmRUb0VsZW1lbnQubGVuZ3RoKSB7XHJcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2FwcGVuZFRvIGVsZW1lbnQgbm90IGZvdW5kLiBNYWtlIHN1cmUgdGhhdCB0aGUgZWxlbWVudCBwYXNzZWQgaXMgaW4gRE9NLicpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGN1cnJCYWNrZHJvcEluZGV4ID49IDAgJiYgIWJhY2tkcm9wRG9tRWwpIHtcclxuICAgICAgICAgIGJhY2tkcm9wU2NvcGUgPSAkcm9vdFNjb3BlLiRuZXcodHJ1ZSk7XHJcbiAgICAgICAgICBiYWNrZHJvcFNjb3BlLm1vZGFsT3B0aW9ucyA9IG1vZGFsO1xyXG4gICAgICAgICAgYmFja2Ryb3BTY29wZS5pbmRleCA9IGN1cnJCYWNrZHJvcEluZGV4O1xyXG4gICAgICAgICAgYmFja2Ryb3BEb21FbCA9IGFuZ3VsYXIuZWxlbWVudCgnPGRpdiB1aWItbW9kYWwtYmFja2Ryb3A9XCJtb2RhbC1iYWNrZHJvcFwiPjwvZGl2PicpO1xyXG4gICAgICAgICAgYmFja2Ryb3BEb21FbC5hdHRyKHtcclxuICAgICAgICAgICAgJ2NsYXNzJzogJ21vZGFsLWJhY2tkcm9wJyxcclxuICAgICAgICAgICAgJ25nLXN0eWxlJzogJ3tcXCd6LWluZGV4XFwnOiAxMDQwICsgKGluZGV4ICYmIDEgfHwgMCkgKyBpbmRleCoxMH0nLFxyXG4gICAgICAgICAgICAndWliLW1vZGFsLWFuaW1hdGlvbi1jbGFzcyc6ICdmYWRlJyxcclxuICAgICAgICAgICAgJ21vZGFsLWluLWNsYXNzJzogJ2luJ1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgICBpZiAobW9kYWwuYmFja2Ryb3BDbGFzcykge1xyXG4gICAgICAgICAgICBiYWNrZHJvcERvbUVsLmFkZENsYXNzKG1vZGFsLmJhY2tkcm9wQ2xhc3MpO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIGlmIChtb2RhbC5hbmltYXRpb24pIHtcclxuICAgICAgICAgICAgYmFja2Ryb3BEb21FbC5hdHRyKCdtb2RhbC1hbmltYXRpb24nLCAndHJ1ZScpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgJGNvbXBpbGUoYmFja2Ryb3BEb21FbCkoYmFja2Ryb3BTY29wZSk7XHJcbiAgICAgICAgICAkYW5pbWF0ZS5lbnRlcihiYWNrZHJvcERvbUVsLCBhcHBlbmRUb0VsZW1lbnQpO1xyXG4gICAgICAgICAgaWYgKCR1aWJQb3NpdGlvbi5pc1Njcm9sbGFibGUoYXBwZW5kVG9FbGVtZW50KSkge1xyXG4gICAgICAgICAgICBzY3JvbGxiYXJQYWRkaW5nID0gJHVpYlBvc2l0aW9uLnNjcm9sbGJhclBhZGRpbmcoYXBwZW5kVG9FbGVtZW50KTtcclxuICAgICAgICAgICAgaWYgKHNjcm9sbGJhclBhZGRpbmcuaGVpZ2h0T3ZlcmZsb3cgJiYgc2Nyb2xsYmFyUGFkZGluZy5zY3JvbGxiYXJXaWR0aCkge1xyXG4gICAgICAgICAgICAgIGFwcGVuZFRvRWxlbWVudC5jc3Moe3BhZGRpbmdSaWdodDogc2Nyb2xsYmFyUGFkZGluZy5yaWdodCArICdweCd9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdmFyIGNvbnRlbnQ7XHJcbiAgICAgICAgaWYgKG1vZGFsLmNvbXBvbmVudCkge1xyXG4gICAgICAgICAgY29udGVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoc25ha2VfY2FzZShtb2RhbC5jb21wb25lbnQubmFtZSkpO1xyXG4gICAgICAgICAgY29udGVudCA9IGFuZ3VsYXIuZWxlbWVudChjb250ZW50KTtcclxuICAgICAgICAgIGNvbnRlbnQuYXR0cih7XHJcbiAgICAgICAgICAgIHJlc29sdmU6ICckcmVzb2x2ZScsXHJcbiAgICAgICAgICAgICdtb2RhbC1pbnN0YW5jZSc6ICckdWliTW9kYWxJbnN0YW5jZScsXHJcbiAgICAgICAgICAgIGNsb3NlOiAnJGNsb3NlKCR2YWx1ZSknLFxyXG4gICAgICAgICAgICBkaXNtaXNzOiAnJGRpc21pc3MoJHZhbHVlKSdcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBjb250ZW50ID0gbW9kYWwuY29udGVudDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFNldCB0aGUgdG9wIG1vZGFsIGluZGV4IGJhc2VkIG9uIHRoZSBpbmRleCBvZiB0aGUgcHJldmlvdXMgdG9wIG1vZGFsXHJcbiAgICAgICAgdG9wTW9kYWxJbmRleCA9IHByZXZpb3VzVG9wT3BlbmVkTW9kYWwgPyBwYXJzZUludChwcmV2aW91c1RvcE9wZW5lZE1vZGFsLnZhbHVlLm1vZGFsRG9tRWwuYXR0cignaW5kZXgnKSwgMTApICsgMSA6IDA7XHJcbiAgICAgICAgdmFyIGFuZ3VsYXJEb21FbCA9IGFuZ3VsYXIuZWxlbWVudCgnPGRpdiB1aWItbW9kYWwtd2luZG93PVwibW9kYWwtd2luZG93XCI+PC9kaXY+Jyk7XHJcbiAgICAgICAgYW5ndWxhckRvbUVsLmF0dHIoe1xyXG4gICAgICAgICAgJ2NsYXNzJzogJ21vZGFsJyxcclxuICAgICAgICAgICd0ZW1wbGF0ZS11cmwnOiBtb2RhbC53aW5kb3dUZW1wbGF0ZVVybCxcclxuICAgICAgICAgICd3aW5kb3ctdG9wLWNsYXNzJzogbW9kYWwud2luZG93VG9wQ2xhc3MsXHJcbiAgICAgICAgICAncm9sZSc6ICdkaWFsb2cnLFxyXG4gICAgICAgICAgJ2FyaWEtbGFiZWxsZWRieSc6IG1vZGFsLmFyaWFMYWJlbGxlZEJ5LFxyXG4gICAgICAgICAgJ2FyaWEtZGVzY3JpYmVkYnknOiBtb2RhbC5hcmlhRGVzY3JpYmVkQnksXHJcbiAgICAgICAgICAnc2l6ZSc6IG1vZGFsLnNpemUsXHJcbiAgICAgICAgICAnaW5kZXgnOiB0b3BNb2RhbEluZGV4LFxyXG4gICAgICAgICAgJ2FuaW1hdGUnOiAnYW5pbWF0ZScsXHJcbiAgICAgICAgICAnbmctc3R5bGUnOiAne1xcJ3otaW5kZXhcXCc6IDEwNTAgKyAkJHRvcE1vZGFsSW5kZXgqMTAsIGRpc3BsYXk6IFxcJ2Jsb2NrXFwnfScsXHJcbiAgICAgICAgICAndGFiaW5kZXgnOiAtMSxcclxuICAgICAgICAgICd1aWItbW9kYWwtYW5pbWF0aW9uLWNsYXNzJzogJ2ZhZGUnLFxyXG4gICAgICAgICAgJ21vZGFsLWluLWNsYXNzJzogJ2luJ1xyXG4gICAgICAgIH0pLmFwcGVuZChjb250ZW50KTtcclxuICAgICAgICBpZiAobW9kYWwud2luZG93Q2xhc3MpIHtcclxuICAgICAgICAgIGFuZ3VsYXJEb21FbC5hZGRDbGFzcyhtb2RhbC53aW5kb3dDbGFzcyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAobW9kYWwuYW5pbWF0aW9uKSB7XHJcbiAgICAgICAgICBhbmd1bGFyRG9tRWwuYXR0cignbW9kYWwtYW5pbWF0aW9uJywgJ3RydWUnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGFwcGVuZFRvRWxlbWVudC5hZGRDbGFzcyhtb2RhbEJvZHlDbGFzcyk7XHJcbiAgICAgICAgaWYgKG1vZGFsLnNjb3BlKSB7XHJcbiAgICAgICAgICAvLyB3ZSBuZWVkIHRvIGV4cGxpY2l0bHkgYWRkIHRoZSBtb2RhbCBpbmRleCB0byB0aGUgbW9kYWwgc2NvcGVcclxuICAgICAgICAgIC8vIGJlY2F1c2UgaXQgaXMgbmVlZGVkIGJ5IG5nU3R5bGUgdG8gY29tcHV0ZSB0aGUgekluZGV4IHByb3BlcnR5LlxyXG4gICAgICAgICAgbW9kYWwuc2NvcGUuJCR0b3BNb2RhbEluZGV4ID0gdG9wTW9kYWxJbmRleDtcclxuICAgICAgICB9XHJcbiAgICAgICAgJGFuaW1hdGUuZW50ZXIoJGNvbXBpbGUoYW5ndWxhckRvbUVsKShtb2RhbC5zY29wZSksIGFwcGVuZFRvRWxlbWVudCk7XHJcblxyXG4gICAgICAgIG9wZW5lZFdpbmRvd3MudG9wKCkudmFsdWUubW9kYWxEb21FbCA9IGFuZ3VsYXJEb21FbDtcclxuICAgICAgICBvcGVuZWRXaW5kb3dzLnRvcCgpLnZhbHVlLm1vZGFsT3BlbmVyID0gbW9kYWxPcGVuZXI7XHJcblxyXG4gICAgICAgIGFwcGx5QXJpYUhpZGRlbihhbmd1bGFyRG9tRWwpO1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBhcHBseUFyaWFIaWRkZW4oZWwpIHtcclxuICAgICAgICAgIGlmICghZWwgfHwgZWxbMF0udGFnTmFtZSA9PT0gJ0JPRFknKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBnZXRTaWJsaW5ncyhlbCkuZm9yRWFjaChmdW5jdGlvbihzaWJsaW5nKSB7XHJcbiAgICAgICAgICAgIHZhciBlbGVtSXNBbHJlYWR5SGlkZGVuID0gc2libGluZy5nZXRBdHRyaWJ1dGUoJ2FyaWEtaGlkZGVuJykgPT09ICd0cnVlJyxcclxuICAgICAgICAgICAgICBhcmlhSGlkZGVuQ291bnQgPSBwYXJzZUludChzaWJsaW5nLmdldEF0dHJpYnV0ZShBUklBX0hJRERFTl9BVFRSSUJVVEVfTkFNRSksIDEwKTtcclxuXHJcbiAgICAgICAgICAgIGlmICghYXJpYUhpZGRlbkNvdW50KSB7XHJcbiAgICAgICAgICAgICAgYXJpYUhpZGRlbkNvdW50ID0gZWxlbUlzQWxyZWFkeUhpZGRlbiA/IDEgOiAwOyAgXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHNpYmxpbmcuc2V0QXR0cmlidXRlKEFSSUFfSElEREVOX0FUVFJJQlVURV9OQU1FLCBhcmlhSGlkZGVuQ291bnQgKyAxKTtcclxuICAgICAgICAgICAgc2libGluZy5zZXRBdHRyaWJ1dGUoJ2FyaWEtaGlkZGVuJywgJ3RydWUnKTtcclxuICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgIHJldHVybiBhcHBseUFyaWFIaWRkZW4oZWwucGFyZW50KCkpO1xyXG5cclxuICAgICAgICAgIGZ1bmN0aW9uIGdldFNpYmxpbmdzKGVsKSB7XHJcbiAgICAgICAgICAgIHZhciBjaGlsZHJlbiA9IGVsLnBhcmVudCgpID8gZWwucGFyZW50KCkuY2hpbGRyZW4oKSA6IFtdO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIEFycmF5LnByb3RvdHlwZS5maWx0ZXIuY2FsbChjaGlsZHJlbiwgZnVuY3Rpb24oY2hpbGQpIHtcclxuICAgICAgICAgICAgICByZXR1cm4gY2hpbGQgIT09IGVsWzBdO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH07XHJcblxyXG4gICAgICBmdW5jdGlvbiBicm9hZGNhc3RDbG9zaW5nKG1vZGFsV2luZG93LCByZXN1bHRPclJlYXNvbiwgY2xvc2luZykge1xyXG4gICAgICAgIHJldHVybiAhbW9kYWxXaW5kb3cudmFsdWUubW9kYWxTY29wZS4kYnJvYWRjYXN0KCdtb2RhbC5jbG9zaW5nJywgcmVzdWx0T3JSZWFzb24sIGNsb3NpbmcpLmRlZmF1bHRQcmV2ZW50ZWQ7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGZ1bmN0aW9uIHVuaGlkZUJhY2tncm91bmRFbGVtZW50cygpIHtcclxuICAgICAgICBBcnJheS5wcm90b3R5cGUuZm9yRWFjaC5jYWxsKFxyXG4gICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnWycgKyBBUklBX0hJRERFTl9BVFRSSUJVVEVfTkFNRSArICddJyksXHJcbiAgICAgICAgICBmdW5jdGlvbihoaWRkZW5FbCkge1xyXG4gICAgICAgICAgICB2YXIgYXJpYUhpZGRlbkNvdW50ID0gcGFyc2VJbnQoaGlkZGVuRWwuZ2V0QXR0cmlidXRlKEFSSUFfSElEREVOX0FUVFJJQlVURV9OQU1FKSwgMTApLFxyXG4gICAgICAgICAgICAgIG5ld0hpZGRlbkNvdW50ID0gYXJpYUhpZGRlbkNvdW50IC0gMTtcclxuICAgICAgICAgICAgaGlkZGVuRWwuc2V0QXR0cmlidXRlKEFSSUFfSElEREVOX0FUVFJJQlVURV9OQU1FLCBuZXdIaWRkZW5Db3VudCk7XHJcblxyXG4gICAgICAgICAgICBpZiAoIW5ld0hpZGRlbkNvdW50KSB7XHJcbiAgICAgICAgICAgICAgaGlkZGVuRWwucmVtb3ZlQXR0cmlidXRlKEFSSUFfSElEREVOX0FUVFJJQlVURV9OQU1FKTtcclxuICAgICAgICAgICAgICBoaWRkZW5FbC5yZW1vdmVBdHRyaWJ1dGUoJ2FyaWEtaGlkZGVuJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICApO1xyXG4gICAgICB9XHJcbiAgICAgIFxyXG4gICAgICAkbW9kYWxTdGFjay5jbG9zZSA9IGZ1bmN0aW9uKG1vZGFsSW5zdGFuY2UsIHJlc3VsdCkge1xyXG4gICAgICAgIHZhciBtb2RhbFdpbmRvdyA9IG9wZW5lZFdpbmRvd3MuZ2V0KG1vZGFsSW5zdGFuY2UpO1xyXG4gICAgICAgIHVuaGlkZUJhY2tncm91bmRFbGVtZW50cygpO1xyXG4gICAgICAgIGlmIChtb2RhbFdpbmRvdyAmJiBicm9hZGNhc3RDbG9zaW5nKG1vZGFsV2luZG93LCByZXN1bHQsIHRydWUpKSB7XHJcbiAgICAgICAgICBtb2RhbFdpbmRvdy52YWx1ZS5tb2RhbFNjb3BlLiQkdWliRGVzdHJ1Y3Rpb25TY2hlZHVsZWQgPSB0cnVlO1xyXG4gICAgICAgICAgbW9kYWxXaW5kb3cudmFsdWUuZGVmZXJyZWQucmVzb2x2ZShyZXN1bHQpO1xyXG4gICAgICAgICAgcmVtb3ZlTW9kYWxXaW5kb3cobW9kYWxJbnN0YW5jZSwgbW9kYWxXaW5kb3cudmFsdWUubW9kYWxPcGVuZXIpO1xyXG4gICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gIW1vZGFsV2luZG93O1xyXG4gICAgICB9O1xyXG5cclxuICAgICAgJG1vZGFsU3RhY2suZGlzbWlzcyA9IGZ1bmN0aW9uKG1vZGFsSW5zdGFuY2UsIHJlYXNvbikge1xyXG4gICAgICAgIHZhciBtb2RhbFdpbmRvdyA9IG9wZW5lZFdpbmRvd3MuZ2V0KG1vZGFsSW5zdGFuY2UpO1xyXG4gICAgICAgIHVuaGlkZUJhY2tncm91bmRFbGVtZW50cygpO1xyXG4gICAgICAgIGlmIChtb2RhbFdpbmRvdyAmJiBicm9hZGNhc3RDbG9zaW5nKG1vZGFsV2luZG93LCByZWFzb24sIGZhbHNlKSkge1xyXG4gICAgICAgICAgbW9kYWxXaW5kb3cudmFsdWUubW9kYWxTY29wZS4kJHVpYkRlc3RydWN0aW9uU2NoZWR1bGVkID0gdHJ1ZTtcclxuICAgICAgICAgIG1vZGFsV2luZG93LnZhbHVlLmRlZmVycmVkLnJlamVjdChyZWFzb24pO1xyXG4gICAgICAgICAgcmVtb3ZlTW9kYWxXaW5kb3cobW9kYWxJbnN0YW5jZSwgbW9kYWxXaW5kb3cudmFsdWUubW9kYWxPcGVuZXIpO1xyXG4gICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiAhbW9kYWxXaW5kb3c7XHJcbiAgICAgIH07XHJcblxyXG4gICAgICAkbW9kYWxTdGFjay5kaXNtaXNzQWxsID0gZnVuY3Rpb24ocmVhc29uKSB7XHJcbiAgICAgICAgdmFyIHRvcE1vZGFsID0gdGhpcy5nZXRUb3AoKTtcclxuICAgICAgICB3aGlsZSAodG9wTW9kYWwgJiYgdGhpcy5kaXNtaXNzKHRvcE1vZGFsLmtleSwgcmVhc29uKSkge1xyXG4gICAgICAgICAgdG9wTW9kYWwgPSB0aGlzLmdldFRvcCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgfTtcclxuXHJcbiAgICAgICRtb2RhbFN0YWNrLmdldFRvcCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiBvcGVuZWRXaW5kb3dzLnRvcCgpO1xyXG4gICAgICB9O1xyXG5cclxuICAgICAgJG1vZGFsU3RhY2subW9kYWxSZW5kZXJlZCA9IGZ1bmN0aW9uKG1vZGFsSW5zdGFuY2UpIHtcclxuICAgICAgICB2YXIgbW9kYWxXaW5kb3cgPSBvcGVuZWRXaW5kb3dzLmdldChtb2RhbEluc3RhbmNlKTtcclxuICAgICAgICAkbW9kYWxTdGFjay5mb2N1c0ZpcnN0Rm9jdXNhYmxlRWxlbWVudCgkbW9kYWxTdGFjay5sb2FkRm9jdXNFbGVtZW50TGlzdChtb2RhbFdpbmRvdykpO1xyXG4gICAgICAgIGlmIChtb2RhbFdpbmRvdykge1xyXG4gICAgICAgICAgbW9kYWxXaW5kb3cudmFsdWUucmVuZGVyRGVmZXJyZWQucmVzb2x2ZSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgfTtcclxuXHJcbiAgICAgICRtb2RhbFN0YWNrLmZvY3VzRmlyc3RGb2N1c2FibGVFbGVtZW50ID0gZnVuY3Rpb24obGlzdCkge1xyXG4gICAgICAgIGlmIChsaXN0Lmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgIGxpc3RbMF0uZm9jdXMoKTtcclxuICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgIH07XHJcblxyXG4gICAgICAkbW9kYWxTdGFjay5mb2N1c0xhc3RGb2N1c2FibGVFbGVtZW50ID0gZnVuY3Rpb24obGlzdCkge1xyXG4gICAgICAgIGlmIChsaXN0Lmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgIGxpc3RbbGlzdC5sZW5ndGggLSAxXS5mb2N1cygpO1xyXG4gICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgfTtcclxuXHJcbiAgICAgICRtb2RhbFN0YWNrLmlzTW9kYWxGb2N1c2VkID0gZnVuY3Rpb24oZXZ0LCBtb2RhbFdpbmRvdykge1xyXG4gICAgICAgIGlmIChldnQgJiYgbW9kYWxXaW5kb3cpIHtcclxuICAgICAgICAgIHZhciBtb2RhbERvbUVsID0gbW9kYWxXaW5kb3cudmFsdWUubW9kYWxEb21FbDtcclxuICAgICAgICAgIGlmIChtb2RhbERvbUVsICYmIG1vZGFsRG9tRWwubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAoZXZ0LnRhcmdldCB8fCBldnQuc3JjRWxlbWVudCkgPT09IG1vZGFsRG9tRWxbMF07XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgfTtcclxuXHJcbiAgICAgICRtb2RhbFN0YWNrLmlzRm9jdXNJbkZpcnN0SXRlbSA9IGZ1bmN0aW9uKGV2dCwgbGlzdCkge1xyXG4gICAgICAgIGlmIChsaXN0Lmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgIHJldHVybiAoZXZ0LnRhcmdldCB8fCBldnQuc3JjRWxlbWVudCkgPT09IGxpc3RbMF07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgfTtcclxuXHJcbiAgICAgICRtb2RhbFN0YWNrLmlzRm9jdXNJbkxhc3RJdGVtID0gZnVuY3Rpb24oZXZ0LCBsaXN0KSB7XHJcbiAgICAgICAgaWYgKGxpc3QubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgcmV0dXJuIChldnQudGFyZ2V0IHx8IGV2dC5zcmNFbGVtZW50KSA9PT0gbGlzdFtsaXN0Lmxlbmd0aCAtIDFdO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgIH07XHJcblxyXG4gICAgICAkbW9kYWxTdGFjay5sb2FkRm9jdXNFbGVtZW50TGlzdCA9IGZ1bmN0aW9uKG1vZGFsV2luZG93KSB7XHJcbiAgICAgICAgaWYgKG1vZGFsV2luZG93KSB7XHJcbiAgICAgICAgICB2YXIgbW9kYWxEb21FMSA9IG1vZGFsV2luZG93LnZhbHVlLm1vZGFsRG9tRWw7XHJcbiAgICAgICAgICBpZiAobW9kYWxEb21FMSAmJiBtb2RhbERvbUUxLmxlbmd0aCkge1xyXG4gICAgICAgICAgICB2YXIgZWxlbWVudHMgPSBtb2RhbERvbUUxWzBdLnF1ZXJ5U2VsZWN0b3JBbGwodGFiYmFibGVTZWxlY3Rvcik7XHJcbiAgICAgICAgICAgIHJldHVybiBlbGVtZW50cyA/XHJcbiAgICAgICAgICAgICAgQXJyYXkucHJvdG90eXBlLmZpbHRlci5jYWxsKGVsZW1lbnRzLCBmdW5jdGlvbihlbGVtZW50KSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gaXNWaXNpYmxlKGVsZW1lbnQpO1xyXG4gICAgICAgICAgICAgIH0pIDogZWxlbWVudHM7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9O1xyXG5cclxuICAgICAgcmV0dXJuICRtb2RhbFN0YWNrO1xyXG4gICAgfV0pXHJcblxyXG4gIC5wcm92aWRlcignJHVpYk1vZGFsJywgZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgJG1vZGFsUHJvdmlkZXIgPSB7XHJcbiAgICAgIG9wdGlvbnM6IHtcclxuICAgICAgICBhbmltYXRpb246IHRydWUsXHJcbiAgICAgICAgYmFja2Ryb3A6IHRydWUsIC8vY2FuIGFsc28gYmUgZmFsc2Ugb3IgJ3N0YXRpYydcclxuICAgICAgICBrZXlib2FyZDogdHJ1ZVxyXG4gICAgICB9LFxyXG4gICAgICAkZ2V0OiBbJyRyb290U2NvcGUnLCAnJHEnLCAnJGRvY3VtZW50JywgJyR0ZW1wbGF0ZVJlcXVlc3QnLCAnJGNvbnRyb2xsZXInLCAnJHVpYlJlc29sdmUnLCAnJHVpYk1vZGFsU3RhY2snLFxyXG4gICAgICAgIGZ1bmN0aW9uICgkcm9vdFNjb3BlLCAkcSwgJGRvY3VtZW50LCAkdGVtcGxhdGVSZXF1ZXN0LCAkY29udHJvbGxlciwgJHVpYlJlc29sdmUsICRtb2RhbFN0YWNrKSB7XHJcbiAgICAgICAgICB2YXIgJG1vZGFsID0ge307XHJcblxyXG4gICAgICAgICAgZnVuY3Rpb24gZ2V0VGVtcGxhdGVQcm9taXNlKG9wdGlvbnMpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG9wdGlvbnMudGVtcGxhdGUgPyAkcS53aGVuKG9wdGlvbnMudGVtcGxhdGUpIDpcclxuICAgICAgICAgICAgICAkdGVtcGxhdGVSZXF1ZXN0KGFuZ3VsYXIuaXNGdW5jdGlvbihvcHRpb25zLnRlbXBsYXRlVXJsKSA/XHJcbiAgICAgICAgICAgICAgICBvcHRpb25zLnRlbXBsYXRlVXJsKCkgOiBvcHRpb25zLnRlbXBsYXRlVXJsKTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICB2YXIgcHJvbWlzZUNoYWluID0gbnVsbDtcclxuICAgICAgICAgICRtb2RhbC5nZXRQcm9taXNlQ2hhaW4gPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2VDaGFpbjtcclxuICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgJG1vZGFsLm9wZW4gPSBmdW5jdGlvbihtb2RhbE9wdGlvbnMpIHtcclxuICAgICAgICAgICAgdmFyIG1vZGFsUmVzdWx0RGVmZXJyZWQgPSAkcS5kZWZlcigpO1xyXG4gICAgICAgICAgICB2YXIgbW9kYWxPcGVuZWREZWZlcnJlZCA9ICRxLmRlZmVyKCk7XHJcbiAgICAgICAgICAgIHZhciBtb2RhbENsb3NlZERlZmVycmVkID0gJHEuZGVmZXIoKTtcclxuICAgICAgICAgICAgdmFyIG1vZGFsUmVuZGVyRGVmZXJyZWQgPSAkcS5kZWZlcigpO1xyXG5cclxuICAgICAgICAgICAgLy9wcmVwYXJlIGFuIGluc3RhbmNlIG9mIGEgbW9kYWwgdG8gYmUgaW5qZWN0ZWQgaW50byBjb250cm9sbGVycyBhbmQgcmV0dXJuZWQgdG8gYSBjYWxsZXJcclxuICAgICAgICAgICAgdmFyIG1vZGFsSW5zdGFuY2UgPSB7XHJcbiAgICAgICAgICAgICAgcmVzdWx0OiBtb2RhbFJlc3VsdERlZmVycmVkLnByb21pc2UsXHJcbiAgICAgICAgICAgICAgb3BlbmVkOiBtb2RhbE9wZW5lZERlZmVycmVkLnByb21pc2UsXHJcbiAgICAgICAgICAgICAgY2xvc2VkOiBtb2RhbENsb3NlZERlZmVycmVkLnByb21pc2UsXHJcbiAgICAgICAgICAgICAgcmVuZGVyZWQ6IG1vZGFsUmVuZGVyRGVmZXJyZWQucHJvbWlzZSxcclxuICAgICAgICAgICAgICBjbG9zZTogZnVuY3Rpb24gKHJlc3VsdCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuICRtb2RhbFN0YWNrLmNsb3NlKG1vZGFsSW5zdGFuY2UsIHJlc3VsdCk7XHJcbiAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICBkaXNtaXNzOiBmdW5jdGlvbiAocmVhc29uKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJG1vZGFsU3RhY2suZGlzbWlzcyhtb2RhbEluc3RhbmNlLCByZWFzb24pO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIC8vbWVyZ2UgYW5kIGNsZWFuIHVwIG9wdGlvbnNcclxuICAgICAgICAgICAgbW9kYWxPcHRpb25zID0gYW5ndWxhci5leHRlbmQoe30sICRtb2RhbFByb3ZpZGVyLm9wdGlvbnMsIG1vZGFsT3B0aW9ucyk7XHJcbiAgICAgICAgICAgIG1vZGFsT3B0aW9ucy5yZXNvbHZlID0gbW9kYWxPcHRpb25zLnJlc29sdmUgfHwge307XHJcbiAgICAgICAgICAgIG1vZGFsT3B0aW9ucy5hcHBlbmRUbyA9IG1vZGFsT3B0aW9ucy5hcHBlbmRUbyB8fCAkZG9jdW1lbnQuZmluZCgnYm9keScpLmVxKDApO1xyXG5cclxuICAgICAgICAgICAgLy92ZXJpZnkgb3B0aW9uc1xyXG4gICAgICAgICAgICBpZiAoIW1vZGFsT3B0aW9ucy5jb21wb25lbnQgJiYgIW1vZGFsT3B0aW9ucy50ZW1wbGF0ZSAmJiAhbW9kYWxPcHRpb25zLnRlbXBsYXRlVXJsKSB7XHJcbiAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdPbmUgb2YgY29tcG9uZW50IG9yIHRlbXBsYXRlIG9yIHRlbXBsYXRlVXJsIG9wdGlvbnMgaXMgcmVxdWlyZWQuJyk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHZhciB0ZW1wbGF0ZUFuZFJlc29sdmVQcm9taXNlO1xyXG4gICAgICAgICAgICBpZiAobW9kYWxPcHRpb25zLmNvbXBvbmVudCkge1xyXG4gICAgICAgICAgICAgIHRlbXBsYXRlQW5kUmVzb2x2ZVByb21pc2UgPSAkcS53aGVuKCR1aWJSZXNvbHZlLnJlc29sdmUobW9kYWxPcHRpb25zLnJlc29sdmUsIHt9LCBudWxsLCBudWxsKSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgdGVtcGxhdGVBbmRSZXNvbHZlUHJvbWlzZSA9XHJcbiAgICAgICAgICAgICAgICAkcS5hbGwoW2dldFRlbXBsYXRlUHJvbWlzZShtb2RhbE9wdGlvbnMpLCAkdWliUmVzb2x2ZS5yZXNvbHZlKG1vZGFsT3B0aW9ucy5yZXNvbHZlLCB7fSwgbnVsbCwgbnVsbCldKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gcmVzb2x2ZVdpdGhUZW1wbGF0ZSgpIHtcclxuICAgICAgICAgICAgICByZXR1cm4gdGVtcGxhdGVBbmRSZXNvbHZlUHJvbWlzZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gV2FpdCBmb3IgdGhlIHJlc29sdXRpb24gb2YgdGhlIGV4aXN0aW5nIHByb21pc2UgY2hhaW4uXHJcbiAgICAgICAgICAgIC8vIFRoZW4gc3dpdGNoIHRvIG91ciBvd24gY29tYmluZWQgcHJvbWlzZSBkZXBlbmRlbmN5IChyZWdhcmRsZXNzIG9mIGhvdyB0aGUgcHJldmlvdXMgbW9kYWwgZmFyZWQpLlxyXG4gICAgICAgICAgICAvLyBUaGVuIGFkZCB0byAkbW9kYWxTdGFjayBhbmQgcmVzb2x2ZSBvcGVuZWQuXHJcbiAgICAgICAgICAgIC8vIEZpbmFsbHkgY2xlYW4gdXAgdGhlIGNoYWluIHZhcmlhYmxlIGlmIG5vIHN1YnNlcXVlbnQgbW9kYWwgaGFzIG92ZXJ3cml0dGVuIGl0LlxyXG4gICAgICAgICAgICB2YXIgc2FtZVByb21pc2U7XHJcbiAgICAgICAgICAgIHNhbWVQcm9taXNlID0gcHJvbWlzZUNoYWluID0gJHEuYWxsKFtwcm9taXNlQ2hhaW5dKVxyXG4gICAgICAgICAgICAgIC50aGVuKHJlc29sdmVXaXRoVGVtcGxhdGUsIHJlc29sdmVXaXRoVGVtcGxhdGUpXHJcbiAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gcmVzb2x2ZVN1Y2Nlc3ModHBsQW5kVmFycykge1xyXG4gICAgICAgICAgICAgICAgdmFyIHByb3ZpZGVkU2NvcGUgPSBtb2RhbE9wdGlvbnMuc2NvcGUgfHwgJHJvb3RTY29wZTtcclxuXHJcbiAgICAgICAgICAgICAgICB2YXIgbW9kYWxTY29wZSA9IHByb3ZpZGVkU2NvcGUuJG5ldygpO1xyXG4gICAgICAgICAgICAgICAgbW9kYWxTY29wZS4kY2xvc2UgPSBtb2RhbEluc3RhbmNlLmNsb3NlO1xyXG4gICAgICAgICAgICAgICAgbW9kYWxTY29wZS4kZGlzbWlzcyA9IG1vZGFsSW5zdGFuY2UuZGlzbWlzcztcclxuXHJcbiAgICAgICAgICAgICAgICBtb2RhbFNjb3BlLiRvbignJGRlc3Ryb3knLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgaWYgKCFtb2RhbFNjb3BlLiQkdWliRGVzdHJ1Y3Rpb25TY2hlZHVsZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICBtb2RhbFNjb3BlLiRkaXNtaXNzKCckdWliVW5zY2hlZHVsZWREZXN0cnVjdGlvbicpO1xyXG4gICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICB2YXIgbW9kYWwgPSB7XHJcbiAgICAgICAgICAgICAgICAgIHNjb3BlOiBtb2RhbFNjb3BlLFxyXG4gICAgICAgICAgICAgICAgICBkZWZlcnJlZDogbW9kYWxSZXN1bHREZWZlcnJlZCxcclxuICAgICAgICAgICAgICAgICAgcmVuZGVyRGVmZXJyZWQ6IG1vZGFsUmVuZGVyRGVmZXJyZWQsXHJcbiAgICAgICAgICAgICAgICAgIGNsb3NlZERlZmVycmVkOiBtb2RhbENsb3NlZERlZmVycmVkLFxyXG4gICAgICAgICAgICAgICAgICBhbmltYXRpb246IG1vZGFsT3B0aW9ucy5hbmltYXRpb24sXHJcbiAgICAgICAgICAgICAgICAgIGJhY2tkcm9wOiBtb2RhbE9wdGlvbnMuYmFja2Ryb3AsXHJcbiAgICAgICAgICAgICAgICAgIGtleWJvYXJkOiBtb2RhbE9wdGlvbnMua2V5Ym9hcmQsXHJcbiAgICAgICAgICAgICAgICAgIGJhY2tkcm9wQ2xhc3M6IG1vZGFsT3B0aW9ucy5iYWNrZHJvcENsYXNzLFxyXG4gICAgICAgICAgICAgICAgICB3aW5kb3dUb3BDbGFzczogbW9kYWxPcHRpb25zLndpbmRvd1RvcENsYXNzLFxyXG4gICAgICAgICAgICAgICAgICB3aW5kb3dDbGFzczogbW9kYWxPcHRpb25zLndpbmRvd0NsYXNzLFxyXG4gICAgICAgICAgICAgICAgICB3aW5kb3dUZW1wbGF0ZVVybDogbW9kYWxPcHRpb25zLndpbmRvd1RlbXBsYXRlVXJsLFxyXG4gICAgICAgICAgICAgICAgICBhcmlhTGFiZWxsZWRCeTogbW9kYWxPcHRpb25zLmFyaWFMYWJlbGxlZEJ5LFxyXG4gICAgICAgICAgICAgICAgICBhcmlhRGVzY3JpYmVkQnk6IG1vZGFsT3B0aW9ucy5hcmlhRGVzY3JpYmVkQnksXHJcbiAgICAgICAgICAgICAgICAgIHNpemU6IG1vZGFsT3B0aW9ucy5zaXplLFxyXG4gICAgICAgICAgICAgICAgICBvcGVuZWRDbGFzczogbW9kYWxPcHRpb25zLm9wZW5lZENsYXNzLFxyXG4gICAgICAgICAgICAgICAgICBhcHBlbmRUbzogbW9kYWxPcHRpb25zLmFwcGVuZFRvXHJcbiAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgIHZhciBjb21wb25lbnQgPSB7fTtcclxuICAgICAgICAgICAgICAgIHZhciBjdHJsSW5zdGFuY2UsIGN0cmxJbnN0YW50aWF0ZSwgY3RybExvY2FscyA9IHt9O1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChtb2RhbE9wdGlvbnMuY29tcG9uZW50KSB7XHJcbiAgICAgICAgICAgICAgICAgIGNvbnN0cnVjdExvY2Fscyhjb21wb25lbnQsIGZhbHNlLCB0cnVlLCBmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICAgIGNvbXBvbmVudC5uYW1lID0gbW9kYWxPcHRpb25zLmNvbXBvbmVudDtcclxuICAgICAgICAgICAgICAgICAgbW9kYWwuY29tcG9uZW50ID0gY29tcG9uZW50O1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChtb2RhbE9wdGlvbnMuY29udHJvbGxlcikge1xyXG4gICAgICAgICAgICAgICAgICBjb25zdHJ1Y3RMb2NhbHMoY3RybExvY2FscywgdHJ1ZSwgZmFsc2UsIHRydWUpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgLy8gdGhlIHRoaXJkIHBhcmFtIHdpbGwgbWFrZSB0aGUgY29udHJvbGxlciBpbnN0YW50aWF0ZSBsYXRlcixwcml2YXRlIGFwaVxyXG4gICAgICAgICAgICAgICAgICAvLyBAc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2FuZ3VsYXIuanMvYmxvYi9tYXN0ZXIvc3JjL25nL2NvbnRyb2xsZXIuanMjTDEyNlxyXG4gICAgICAgICAgICAgICAgICBjdHJsSW5zdGFudGlhdGUgPSAkY29udHJvbGxlcihtb2RhbE9wdGlvbnMuY29udHJvbGxlciwgY3RybExvY2FscywgdHJ1ZSwgbW9kYWxPcHRpb25zLmNvbnRyb2xsZXJBcyk7XHJcbiAgICAgICAgICAgICAgICAgIGlmIChtb2RhbE9wdGlvbnMuY29udHJvbGxlckFzICYmIG1vZGFsT3B0aW9ucy5iaW5kVG9Db250cm9sbGVyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY3RybEluc3RhbmNlID0gY3RybEluc3RhbnRpYXRlLmluc3RhbmNlO1xyXG4gICAgICAgICAgICAgICAgICAgIGN0cmxJbnN0YW5jZS4kY2xvc2UgPSBtb2RhbFNjb3BlLiRjbG9zZTtcclxuICAgICAgICAgICAgICAgICAgICBjdHJsSW5zdGFuY2UuJGRpc21pc3MgPSBtb2RhbFNjb3BlLiRkaXNtaXNzO1xyXG4gICAgICAgICAgICAgICAgICAgIGFuZ3VsYXIuZXh0ZW5kKGN0cmxJbnN0YW5jZSwge1xyXG4gICAgICAgICAgICAgICAgICAgICAgJHJlc29sdmU6IGN0cmxMb2NhbHMuJHNjb3BlLiRyZXNvbHZlXHJcbiAgICAgICAgICAgICAgICAgICAgfSwgcHJvdmlkZWRTY29wZSk7XHJcbiAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgIGN0cmxJbnN0YW5jZSA9IGN0cmxJbnN0YW50aWF0ZSgpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgaWYgKGFuZ3VsYXIuaXNGdW5jdGlvbihjdHJsSW5zdGFuY2UuJG9uSW5pdCkpIHtcclxuICAgICAgICAgICAgICAgICAgICBjdHJsSW5zdGFuY2UuJG9uSW5pdCgpO1xyXG4gICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKCFtb2RhbE9wdGlvbnMuY29tcG9uZW50KSB7XHJcbiAgICAgICAgICAgICAgICAgIG1vZGFsLmNvbnRlbnQgPSB0cGxBbmRWYXJzWzBdO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICRtb2RhbFN0YWNrLm9wZW4obW9kYWxJbnN0YW5jZSwgbW9kYWwpO1xyXG4gICAgICAgICAgICAgICAgbW9kYWxPcGVuZWREZWZlcnJlZC5yZXNvbHZlKHRydWUpO1xyXG5cclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIGNvbnN0cnVjdExvY2FscyhvYmosIHRlbXBsYXRlLCBpbnN0YW5jZU9uU2NvcGUsIGluamVjdGFibGUpIHtcclxuICAgICAgICAgICAgICAgICAgb2JqLiRzY29wZSA9IG1vZGFsU2NvcGU7XHJcbiAgICAgICAgICAgICAgICAgIG9iai4kc2NvcGUuJHJlc29sdmUgPSB7fTtcclxuICAgICAgICAgICAgICAgICAgaWYgKGluc3RhbmNlT25TY29wZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIG9iai4kc2NvcGUuJHVpYk1vZGFsSW5zdGFuY2UgPSBtb2RhbEluc3RhbmNlO1xyXG4gICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIG9iai4kdWliTW9kYWxJbnN0YW5jZSA9IG1vZGFsSW5zdGFuY2U7XHJcbiAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgIHZhciByZXNvbHZlcyA9IHRlbXBsYXRlID8gdHBsQW5kVmFyc1sxXSA6IHRwbEFuZFZhcnM7XHJcbiAgICAgICAgICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaChyZXNvbHZlcywgZnVuY3Rpb24odmFsdWUsIGtleSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChpbmplY3RhYmxlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICBvYmpba2V5XSA9IHZhbHVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgb2JqLiRzY29wZS4kcmVzb2x2ZVtrZXldID0gdmFsdWU7XHJcbiAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LCBmdW5jdGlvbiByZXNvbHZlRXJyb3IocmVhc29uKSB7XHJcbiAgICAgICAgICAgICAgbW9kYWxPcGVuZWREZWZlcnJlZC5yZWplY3QocmVhc29uKTtcclxuICAgICAgICAgICAgICBtb2RhbFJlc3VsdERlZmVycmVkLnJlamVjdChyZWFzb24pO1xyXG4gICAgICAgICAgICB9KVsnZmluYWxseSddKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgIGlmIChwcm9taXNlQ2hhaW4gPT09IHNhbWVQcm9taXNlKSB7XHJcbiAgICAgICAgICAgICAgICBwcm9taXNlQ2hhaW4gPSBudWxsO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gbW9kYWxJbnN0YW5jZTtcclxuICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgcmV0dXJuICRtb2RhbDtcclxuICAgICAgICB9XHJcbiAgICAgIF1cclxuICAgIH07XHJcblxyXG4gICAgcmV0dXJuICRtb2RhbFByb3ZpZGVyO1xyXG4gIH0pO1xyXG5cclxuYW5ndWxhci5tb2R1bGUoJ3VpLmJvb3RzdHJhcC5wYWdpbmcnLCBbXSlcclxuLyoqXHJcbiAqIEhlbHBlciBpbnRlcm5hbCBzZXJ2aWNlIGZvciBnZW5lcmF0aW5nIGNvbW1vbiBjb250cm9sbGVyIGNvZGUgYmV0d2VlbiB0aGVcclxuICogcGFnZXIgYW5kIHBhZ2luYXRpb24gY29tcG9uZW50c1xyXG4gKi9cclxuLmZhY3RvcnkoJ3VpYlBhZ2luZycsIFsnJHBhcnNlJywgZnVuY3Rpb24oJHBhcnNlKSB7XHJcbiAgcmV0dXJuIHtcclxuICAgIGNyZWF0ZTogZnVuY3Rpb24oY3RybCwgJHNjb3BlLCAkYXR0cnMpIHtcclxuICAgICAgY3RybC5zZXROdW1QYWdlcyA9ICRhdHRycy5udW1QYWdlcyA/ICRwYXJzZSgkYXR0cnMubnVtUGFnZXMpLmFzc2lnbiA6IGFuZ3VsYXIubm9vcDtcclxuICAgICAgY3RybC5uZ01vZGVsQ3RybCA9IHsgJHNldFZpZXdWYWx1ZTogYW5ndWxhci5ub29wIH07IC8vIG51bGxNb2RlbEN0cmxcclxuICAgICAgY3RybC5fd2F0Y2hlcnMgPSBbXTtcclxuXHJcbiAgICAgIGN0cmwuaW5pdCA9IGZ1bmN0aW9uKG5nTW9kZWxDdHJsLCBjb25maWcpIHtcclxuICAgICAgICBjdHJsLm5nTW9kZWxDdHJsID0gbmdNb2RlbEN0cmw7XHJcbiAgICAgICAgY3RybC5jb25maWcgPSBjb25maWc7XHJcblxyXG4gICAgICAgIG5nTW9kZWxDdHJsLiRyZW5kZXIgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgIGN0cmwucmVuZGVyKCk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgaWYgKCRhdHRycy5pdGVtc1BlclBhZ2UpIHtcclxuICAgICAgICAgIGN0cmwuX3dhdGNoZXJzLnB1c2goJHNjb3BlLiRwYXJlbnQuJHdhdGNoKCRhdHRycy5pdGVtc1BlclBhZ2UsIGZ1bmN0aW9uKHZhbHVlKSB7XHJcbiAgICAgICAgICAgIGN0cmwuaXRlbXNQZXJQYWdlID0gcGFyc2VJbnQodmFsdWUsIDEwKTtcclxuICAgICAgICAgICAgJHNjb3BlLnRvdGFsUGFnZXMgPSBjdHJsLmNhbGN1bGF0ZVRvdGFsUGFnZXMoKTtcclxuICAgICAgICAgICAgY3RybC51cGRhdGVQYWdlKCk7XHJcbiAgICAgICAgICB9KSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGN0cmwuaXRlbXNQZXJQYWdlID0gY29uZmlnLml0ZW1zUGVyUGFnZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgICRzY29wZS4kd2F0Y2goJ3RvdGFsSXRlbXMnLCBmdW5jdGlvbihuZXdUb3RhbCwgb2xkVG90YWwpIHtcclxuICAgICAgICAgIGlmIChhbmd1bGFyLmlzRGVmaW5lZChuZXdUb3RhbCkgfHwgbmV3VG90YWwgIT09IG9sZFRvdGFsKSB7XHJcbiAgICAgICAgICAgICRzY29wZS50b3RhbFBhZ2VzID0gY3RybC5jYWxjdWxhdGVUb3RhbFBhZ2VzKCk7XHJcbiAgICAgICAgICAgIGN0cmwudXBkYXRlUGFnZSgpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9O1xyXG5cclxuICAgICAgY3RybC5jYWxjdWxhdGVUb3RhbFBhZ2VzID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIHRvdGFsUGFnZXMgPSBjdHJsLml0ZW1zUGVyUGFnZSA8IDEgPyAxIDogTWF0aC5jZWlsKCRzY29wZS50b3RhbEl0ZW1zIC8gY3RybC5pdGVtc1BlclBhZ2UpO1xyXG4gICAgICAgIHJldHVybiBNYXRoLm1heCh0b3RhbFBhZ2VzIHx8IDAsIDEpO1xyXG4gICAgICB9O1xyXG5cclxuICAgICAgY3RybC5yZW5kZXIgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAkc2NvcGUucGFnZSA9IHBhcnNlSW50KGN0cmwubmdNb2RlbEN0cmwuJHZpZXdWYWx1ZSwgMTApIHx8IDE7XHJcbiAgICAgIH07XHJcblxyXG4gICAgICAkc2NvcGUuc2VsZWN0UGFnZSA9IGZ1bmN0aW9uKHBhZ2UsIGV2dCkge1xyXG4gICAgICAgIGlmIChldnQpIHtcclxuICAgICAgICAgIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdmFyIGNsaWNrQWxsb3dlZCA9ICEkc2NvcGUubmdEaXNhYmxlZCB8fCAhZXZ0O1xyXG4gICAgICAgIGlmIChjbGlja0FsbG93ZWQgJiYgJHNjb3BlLnBhZ2UgIT09IHBhZ2UgJiYgcGFnZSA+IDAgJiYgcGFnZSA8PSAkc2NvcGUudG90YWxQYWdlcykge1xyXG4gICAgICAgICAgaWYgKGV2dCAmJiBldnQudGFyZ2V0KSB7XHJcbiAgICAgICAgICAgIGV2dC50YXJnZXQuYmx1cigpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgY3RybC5uZ01vZGVsQ3RybC4kc2V0Vmlld1ZhbHVlKHBhZ2UpO1xyXG4gICAgICAgICAgY3RybC5uZ01vZGVsQ3RybC4kcmVuZGVyKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9O1xyXG5cclxuICAgICAgJHNjb3BlLmdldFRleHQgPSBmdW5jdGlvbihrZXkpIHtcclxuICAgICAgICByZXR1cm4gJHNjb3BlW2tleSArICdUZXh0J10gfHwgY3RybC5jb25maWdba2V5ICsgJ1RleHQnXTtcclxuICAgICAgfTtcclxuXHJcbiAgICAgICRzY29wZS5ub1ByZXZpb3VzID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuICRzY29wZS5wYWdlID09PSAxO1xyXG4gICAgICB9O1xyXG5cclxuICAgICAgJHNjb3BlLm5vTmV4dCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiAkc2NvcGUucGFnZSA9PT0gJHNjb3BlLnRvdGFsUGFnZXM7XHJcbiAgICAgIH07XHJcblxyXG4gICAgICBjdHJsLnVwZGF0ZVBhZ2UgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICBjdHJsLnNldE51bVBhZ2VzKCRzY29wZS4kcGFyZW50LCAkc2NvcGUudG90YWxQYWdlcyk7IC8vIFJlYWRvbmx5IHZhcmlhYmxlXHJcblxyXG4gICAgICAgIGlmICgkc2NvcGUucGFnZSA+ICRzY29wZS50b3RhbFBhZ2VzKSB7XHJcbiAgICAgICAgICAkc2NvcGUuc2VsZWN0UGFnZSgkc2NvcGUudG90YWxQYWdlcyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGN0cmwubmdNb2RlbEN0cmwuJHJlbmRlcigpO1xyXG4gICAgICAgIH1cclxuICAgICAgfTtcclxuXHJcbiAgICAgICRzY29wZS4kb24oJyRkZXN0cm95JywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgd2hpbGUgKGN0cmwuX3dhdGNoZXJzLmxlbmd0aCkge1xyXG4gICAgICAgICAgY3RybC5fd2F0Y2hlcnMuc2hpZnQoKSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfTtcclxufV0pO1xyXG5cclxuYW5ndWxhci5tb2R1bGUoJ3VpLmJvb3RzdHJhcC5wYWdlcicsIFsndWkuYm9vdHN0cmFwLnBhZ2luZycsICd1aS5ib290c3RyYXAudGFiaW5kZXgnXSlcclxuXHJcbi5jb250cm9sbGVyKCdVaWJQYWdlckNvbnRyb2xsZXInLCBbJyRzY29wZScsICckYXR0cnMnLCAndWliUGFnaW5nJywgJ3VpYlBhZ2VyQ29uZmlnJywgZnVuY3Rpb24oJHNjb3BlLCAkYXR0cnMsIHVpYlBhZ2luZywgdWliUGFnZXJDb25maWcpIHtcclxuICAkc2NvcGUuYWxpZ24gPSBhbmd1bGFyLmlzRGVmaW5lZCgkYXR0cnMuYWxpZ24pID8gJHNjb3BlLiRwYXJlbnQuJGV2YWwoJGF0dHJzLmFsaWduKSA6IHVpYlBhZ2VyQ29uZmlnLmFsaWduO1xyXG5cclxuICB1aWJQYWdpbmcuY3JlYXRlKHRoaXMsICRzY29wZSwgJGF0dHJzKTtcclxufV0pXHJcblxyXG4uY29uc3RhbnQoJ3VpYlBhZ2VyQ29uZmlnJywge1xyXG4gIGl0ZW1zUGVyUGFnZTogMTAsXHJcbiAgcHJldmlvdXNUZXh0OiAnwqsgUHJldmlvdXMnLFxyXG4gIG5leHRUZXh0OiAnTmV4dCDCuycsXHJcbiAgYWxpZ246IHRydWVcclxufSlcclxuXHJcbi5kaXJlY3RpdmUoJ3VpYlBhZ2VyJywgWyd1aWJQYWdlckNvbmZpZycsIGZ1bmN0aW9uKHVpYlBhZ2VyQ29uZmlnKSB7XHJcbiAgcmV0dXJuIHtcclxuICAgIHNjb3BlOiB7XHJcbiAgICAgIHRvdGFsSXRlbXM6ICc9JyxcclxuICAgICAgcHJldmlvdXNUZXh0OiAnQCcsXHJcbiAgICAgIG5leHRUZXh0OiAnQCcsXHJcbiAgICAgIG5nRGlzYWJsZWQ6ICc9J1xyXG4gICAgfSxcclxuICAgIHJlcXVpcmU6IFsndWliUGFnZXInLCAnP25nTW9kZWwnXSxcclxuICAgIHJlc3RyaWN0OiAnQScsXHJcbiAgICBjb250cm9sbGVyOiAnVWliUGFnZXJDb250cm9sbGVyJyxcclxuICAgIGNvbnRyb2xsZXJBczogJ3BhZ2VyJyxcclxuICAgIHRlbXBsYXRlVXJsOiBmdW5jdGlvbihlbGVtZW50LCBhdHRycykge1xyXG4gICAgICByZXR1cm4gYXR0cnMudGVtcGxhdGVVcmwgfHwgJ3VpYi90ZW1wbGF0ZS9wYWdlci9wYWdlci5odG1sJztcclxuICAgIH0sXHJcbiAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxlbWVudCwgYXR0cnMsIGN0cmxzKSB7XHJcbiAgICAgIGVsZW1lbnQuYWRkQ2xhc3MoJ3BhZ2VyJyk7XHJcbiAgICAgIHZhciBwYWdpbmF0aW9uQ3RybCA9IGN0cmxzWzBdLCBuZ01vZGVsQ3RybCA9IGN0cmxzWzFdO1xyXG5cclxuICAgICAgaWYgKCFuZ01vZGVsQ3RybCkge1xyXG4gICAgICAgIHJldHVybjsgLy8gZG8gbm90aGluZyBpZiBubyBuZy1tb2RlbFxyXG4gICAgICB9XHJcblxyXG4gICAgICBwYWdpbmF0aW9uQ3RybC5pbml0KG5nTW9kZWxDdHJsLCB1aWJQYWdlckNvbmZpZyk7XHJcbiAgICB9XHJcbiAgfTtcclxufV0pO1xyXG5cclxuYW5ndWxhci5tb2R1bGUoJ3VpLmJvb3RzdHJhcC5wYWdpbmF0aW9uJywgWyd1aS5ib290c3RyYXAucGFnaW5nJywgJ3VpLmJvb3RzdHJhcC50YWJpbmRleCddKVxyXG4uY29udHJvbGxlcignVWliUGFnaW5hdGlvbkNvbnRyb2xsZXInLCBbJyRzY29wZScsICckYXR0cnMnLCAnJHBhcnNlJywgJ3VpYlBhZ2luZycsICd1aWJQYWdpbmF0aW9uQ29uZmlnJywgZnVuY3Rpb24oJHNjb3BlLCAkYXR0cnMsICRwYXJzZSwgdWliUGFnaW5nLCB1aWJQYWdpbmF0aW9uQ29uZmlnKSB7XHJcbiAgdmFyIGN0cmwgPSB0aGlzO1xyXG4gIC8vIFNldHVwIGNvbmZpZ3VyYXRpb24gcGFyYW1ldGVyc1xyXG4gIHZhciBtYXhTaXplID0gYW5ndWxhci5pc0RlZmluZWQoJGF0dHJzLm1heFNpemUpID8gJHNjb3BlLiRwYXJlbnQuJGV2YWwoJGF0dHJzLm1heFNpemUpIDogdWliUGFnaW5hdGlvbkNvbmZpZy5tYXhTaXplLFxyXG4gICAgcm90YXRlID0gYW5ndWxhci5pc0RlZmluZWQoJGF0dHJzLnJvdGF0ZSkgPyAkc2NvcGUuJHBhcmVudC4kZXZhbCgkYXR0cnMucm90YXRlKSA6IHVpYlBhZ2luYXRpb25Db25maWcucm90YXRlLFxyXG4gICAgZm9yY2VFbGxpcHNlcyA9IGFuZ3VsYXIuaXNEZWZpbmVkKCRhdHRycy5mb3JjZUVsbGlwc2VzKSA/ICRzY29wZS4kcGFyZW50LiRldmFsKCRhdHRycy5mb3JjZUVsbGlwc2VzKSA6IHVpYlBhZ2luYXRpb25Db25maWcuZm9yY2VFbGxpcHNlcyxcclxuICAgIGJvdW5kYXJ5TGlua051bWJlcnMgPSBhbmd1bGFyLmlzRGVmaW5lZCgkYXR0cnMuYm91bmRhcnlMaW5rTnVtYmVycykgPyAkc2NvcGUuJHBhcmVudC4kZXZhbCgkYXR0cnMuYm91bmRhcnlMaW5rTnVtYmVycykgOiB1aWJQYWdpbmF0aW9uQ29uZmlnLmJvdW5kYXJ5TGlua051bWJlcnMsXHJcbiAgICBwYWdlTGFiZWwgPSBhbmd1bGFyLmlzRGVmaW5lZCgkYXR0cnMucGFnZUxhYmVsKSA/IGZ1bmN0aW9uKGlkeCkgeyByZXR1cm4gJHNjb3BlLiRwYXJlbnQuJGV2YWwoJGF0dHJzLnBhZ2VMYWJlbCwgeyRwYWdlOiBpZHh9KTsgfSA6IGFuZ3VsYXIuaWRlbnRpdHk7XHJcbiAgJHNjb3BlLmJvdW5kYXJ5TGlua3MgPSBhbmd1bGFyLmlzRGVmaW5lZCgkYXR0cnMuYm91bmRhcnlMaW5rcykgPyAkc2NvcGUuJHBhcmVudC4kZXZhbCgkYXR0cnMuYm91bmRhcnlMaW5rcykgOiB1aWJQYWdpbmF0aW9uQ29uZmlnLmJvdW5kYXJ5TGlua3M7XHJcbiAgJHNjb3BlLmRpcmVjdGlvbkxpbmtzID0gYW5ndWxhci5pc0RlZmluZWQoJGF0dHJzLmRpcmVjdGlvbkxpbmtzKSA/ICRzY29wZS4kcGFyZW50LiRldmFsKCRhdHRycy5kaXJlY3Rpb25MaW5rcykgOiB1aWJQYWdpbmF0aW9uQ29uZmlnLmRpcmVjdGlvbkxpbmtzO1xyXG5cclxuICB1aWJQYWdpbmcuY3JlYXRlKHRoaXMsICRzY29wZSwgJGF0dHJzKTtcclxuXHJcbiAgaWYgKCRhdHRycy5tYXhTaXplKSB7XHJcbiAgICBjdHJsLl93YXRjaGVycy5wdXNoKCRzY29wZS4kcGFyZW50LiR3YXRjaCgkcGFyc2UoJGF0dHJzLm1heFNpemUpLCBmdW5jdGlvbih2YWx1ZSkge1xyXG4gICAgICBtYXhTaXplID0gcGFyc2VJbnQodmFsdWUsIDEwKTtcclxuICAgICAgY3RybC5yZW5kZXIoKTtcclxuICAgIH0pKTtcclxuICB9XHJcblxyXG4gIC8vIENyZWF0ZSBwYWdlIG9iamVjdCB1c2VkIGluIHRlbXBsYXRlXHJcbiAgZnVuY3Rpb24gbWFrZVBhZ2UobnVtYmVyLCB0ZXh0LCBpc0FjdGl2ZSkge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgbnVtYmVyOiBudW1iZXIsXHJcbiAgICAgIHRleHQ6IHRleHQsXHJcbiAgICAgIGFjdGl2ZTogaXNBY3RpdmVcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBnZXRQYWdlcyhjdXJyZW50UGFnZSwgdG90YWxQYWdlcykge1xyXG4gICAgdmFyIHBhZ2VzID0gW107XHJcblxyXG4gICAgLy8gRGVmYXVsdCBwYWdlIGxpbWl0c1xyXG4gICAgdmFyIHN0YXJ0UGFnZSA9IDEsIGVuZFBhZ2UgPSB0b3RhbFBhZ2VzO1xyXG4gICAgdmFyIGlzTWF4U2l6ZWQgPSBhbmd1bGFyLmlzRGVmaW5lZChtYXhTaXplKSAmJiBtYXhTaXplIDwgdG90YWxQYWdlcztcclxuXHJcbiAgICAvLyByZWNvbXB1dGUgaWYgbWF4U2l6ZVxyXG4gICAgaWYgKGlzTWF4U2l6ZWQpIHtcclxuICAgICAgaWYgKHJvdGF0ZSkge1xyXG4gICAgICAgIC8vIEN1cnJlbnQgcGFnZSBpcyBkaXNwbGF5ZWQgaW4gdGhlIG1pZGRsZSBvZiB0aGUgdmlzaWJsZSBvbmVzXHJcbiAgICAgICAgc3RhcnRQYWdlID0gTWF0aC5tYXgoY3VycmVudFBhZ2UgLSBNYXRoLmZsb29yKG1heFNpemUgLyAyKSwgMSk7XHJcbiAgICAgICAgZW5kUGFnZSA9IHN0YXJ0UGFnZSArIG1heFNpemUgLSAxO1xyXG5cclxuICAgICAgICAvLyBBZGp1c3QgaWYgbGltaXQgaXMgZXhjZWVkZWRcclxuICAgICAgICBpZiAoZW5kUGFnZSA+IHRvdGFsUGFnZXMpIHtcclxuICAgICAgICAgIGVuZFBhZ2UgPSB0b3RhbFBhZ2VzO1xyXG4gICAgICAgICAgc3RhcnRQYWdlID0gZW5kUGFnZSAtIG1heFNpemUgKyAxO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICAvLyBWaXNpYmxlIHBhZ2VzIGFyZSBwYWdpbmF0ZWQgd2l0aCBtYXhTaXplXHJcbiAgICAgICAgc3RhcnRQYWdlID0gKE1hdGguY2VpbChjdXJyZW50UGFnZSAvIG1heFNpemUpIC0gMSkgKiBtYXhTaXplICsgMTtcclxuXHJcbiAgICAgICAgLy8gQWRqdXN0IGxhc3QgcGFnZSBpZiBsaW1pdCBpcyBleGNlZWRlZFxyXG4gICAgICAgIGVuZFBhZ2UgPSBNYXRoLm1pbihzdGFydFBhZ2UgKyBtYXhTaXplIC0gMSwgdG90YWxQYWdlcyk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBBZGQgcGFnZSBudW1iZXIgbGlua3NcclxuICAgIGZvciAodmFyIG51bWJlciA9IHN0YXJ0UGFnZTsgbnVtYmVyIDw9IGVuZFBhZ2U7IG51bWJlcisrKSB7XHJcbiAgICAgIHZhciBwYWdlID0gbWFrZVBhZ2UobnVtYmVyLCBwYWdlTGFiZWwobnVtYmVyKSwgbnVtYmVyID09PSBjdXJyZW50UGFnZSk7XHJcbiAgICAgIHBhZ2VzLnB1c2gocGFnZSk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQWRkIGxpbmtzIHRvIG1vdmUgYmV0d2VlbiBwYWdlIHNldHNcclxuICAgIGlmIChpc01heFNpemVkICYmIG1heFNpemUgPiAwICYmICghcm90YXRlIHx8IGZvcmNlRWxsaXBzZXMgfHwgYm91bmRhcnlMaW5rTnVtYmVycykpIHtcclxuICAgICAgaWYgKHN0YXJ0UGFnZSA+IDEpIHtcclxuICAgICAgICBpZiAoIWJvdW5kYXJ5TGlua051bWJlcnMgfHwgc3RhcnRQYWdlID4gMykgeyAvL25lZWQgZWxsaXBzaXMgZm9yIGFsbCBvcHRpb25zIHVubGVzcyByYW5nZSBpcyB0b28gY2xvc2UgdG8gYmVnaW5uaW5nXHJcbiAgICAgICAgdmFyIHByZXZpb3VzUGFnZVNldCA9IG1ha2VQYWdlKHN0YXJ0UGFnZSAtIDEsICcuLi4nLCBmYWxzZSk7XHJcbiAgICAgICAgcGFnZXMudW5zaGlmdChwcmV2aW91c1BhZ2VTZXQpO1xyXG4gICAgICB9XHJcbiAgICAgICAgaWYgKGJvdW5kYXJ5TGlua051bWJlcnMpIHtcclxuICAgICAgICAgIGlmIChzdGFydFBhZ2UgPT09IDMpIHsgLy9uZWVkIHRvIHJlcGxhY2UgZWxsaXBzaXMgd2hlbiB0aGUgYnV0dG9ucyB3b3VsZCBiZSBzZXF1ZW50aWFsXHJcbiAgICAgICAgICAgIHZhciBzZWNvbmRQYWdlTGluayA9IG1ha2VQYWdlKDIsICcyJywgZmFsc2UpO1xyXG4gICAgICAgICAgICBwYWdlcy51bnNoaWZ0KHNlY29uZFBhZ2VMaW5rKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIC8vYWRkIHRoZSBmaXJzdCBwYWdlXHJcbiAgICAgICAgICB2YXIgZmlyc3RQYWdlTGluayA9IG1ha2VQYWdlKDEsICcxJywgZmFsc2UpO1xyXG4gICAgICAgICAgcGFnZXMudW5zaGlmdChmaXJzdFBhZ2VMaW5rKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChlbmRQYWdlIDwgdG90YWxQYWdlcykge1xyXG4gICAgICAgIGlmICghYm91bmRhcnlMaW5rTnVtYmVycyB8fCBlbmRQYWdlIDwgdG90YWxQYWdlcyAtIDIpIHsgLy9uZWVkIGVsbGlwc2lzIGZvciBhbGwgb3B0aW9ucyB1bmxlc3MgcmFuZ2UgaXMgdG9vIGNsb3NlIHRvIGVuZFxyXG4gICAgICAgIHZhciBuZXh0UGFnZVNldCA9IG1ha2VQYWdlKGVuZFBhZ2UgKyAxLCAnLi4uJywgZmFsc2UpO1xyXG4gICAgICAgIHBhZ2VzLnB1c2gobmV4dFBhZ2VTZXQpO1xyXG4gICAgICB9XHJcbiAgICAgICAgaWYgKGJvdW5kYXJ5TGlua051bWJlcnMpIHtcclxuICAgICAgICAgIGlmIChlbmRQYWdlID09PSB0b3RhbFBhZ2VzIC0gMikgeyAvL25lZWQgdG8gcmVwbGFjZSBlbGxpcHNpcyB3aGVuIHRoZSBidXR0b25zIHdvdWxkIGJlIHNlcXVlbnRpYWxcclxuICAgICAgICAgICAgdmFyIHNlY29uZFRvTGFzdFBhZ2VMaW5rID0gbWFrZVBhZ2UodG90YWxQYWdlcyAtIDEsIHRvdGFsUGFnZXMgLSAxLCBmYWxzZSk7XHJcbiAgICAgICAgICAgIHBhZ2VzLnB1c2goc2Vjb25kVG9MYXN0UGFnZUxpbmspO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgLy9hZGQgdGhlIGxhc3QgcGFnZVxyXG4gICAgICAgICAgdmFyIGxhc3RQYWdlTGluayA9IG1ha2VQYWdlKHRvdGFsUGFnZXMsIHRvdGFsUGFnZXMsIGZhbHNlKTtcclxuICAgICAgICAgIHBhZ2VzLnB1c2gobGFzdFBhZ2VMaW5rKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBwYWdlcztcclxuICB9XHJcblxyXG4gIHZhciBvcmlnaW5hbFJlbmRlciA9IHRoaXMucmVuZGVyO1xyXG4gIHRoaXMucmVuZGVyID0gZnVuY3Rpb24oKSB7XHJcbiAgICBvcmlnaW5hbFJlbmRlcigpO1xyXG4gICAgaWYgKCRzY29wZS5wYWdlID4gMCAmJiAkc2NvcGUucGFnZSA8PSAkc2NvcGUudG90YWxQYWdlcykge1xyXG4gICAgICAkc2NvcGUucGFnZXMgPSBnZXRQYWdlcygkc2NvcGUucGFnZSwgJHNjb3BlLnRvdGFsUGFnZXMpO1xyXG4gICAgfVxyXG4gIH07XHJcbn1dKVxyXG5cclxuLmNvbnN0YW50KCd1aWJQYWdpbmF0aW9uQ29uZmlnJywge1xyXG4gIGl0ZW1zUGVyUGFnZTogMTAsXHJcbiAgYm91bmRhcnlMaW5rczogZmFsc2UsXHJcbiAgYm91bmRhcnlMaW5rTnVtYmVyczogZmFsc2UsXHJcbiAgZGlyZWN0aW9uTGlua3M6IHRydWUsXHJcbiAgZmlyc3RUZXh0OiAnRmlyc3QnLFxyXG4gIHByZXZpb3VzVGV4dDogJ1ByZXZpb3VzJyxcclxuICBuZXh0VGV4dDogJ05leHQnLFxyXG4gIGxhc3RUZXh0OiAnTGFzdCcsXHJcbiAgcm90YXRlOiB0cnVlLFxyXG4gIGZvcmNlRWxsaXBzZXM6IGZhbHNlXHJcbn0pXHJcblxyXG4uZGlyZWN0aXZlKCd1aWJQYWdpbmF0aW9uJywgWyckcGFyc2UnLCAndWliUGFnaW5hdGlvbkNvbmZpZycsIGZ1bmN0aW9uKCRwYXJzZSwgdWliUGFnaW5hdGlvbkNvbmZpZykge1xyXG4gIHJldHVybiB7XHJcbiAgICBzY29wZToge1xyXG4gICAgICB0b3RhbEl0ZW1zOiAnPScsXHJcbiAgICAgIGZpcnN0VGV4dDogJ0AnLFxyXG4gICAgICBwcmV2aW91c1RleHQ6ICdAJyxcclxuICAgICAgbmV4dFRleHQ6ICdAJyxcclxuICAgICAgbGFzdFRleHQ6ICdAJyxcclxuICAgICAgbmdEaXNhYmxlZDonPSdcclxuICAgIH0sXHJcbiAgICByZXF1aXJlOiBbJ3VpYlBhZ2luYXRpb24nLCAnP25nTW9kZWwnXSxcclxuICAgIHJlc3RyaWN0OiAnQScsXHJcbiAgICBjb250cm9sbGVyOiAnVWliUGFnaW5hdGlvbkNvbnRyb2xsZXInLFxyXG4gICAgY29udHJvbGxlckFzOiAncGFnaW5hdGlvbicsXHJcbiAgICB0ZW1wbGF0ZVVybDogZnVuY3Rpb24oZWxlbWVudCwgYXR0cnMpIHtcclxuICAgICAgcmV0dXJuIGF0dHJzLnRlbXBsYXRlVXJsIHx8ICd1aWIvdGVtcGxhdGUvcGFnaW5hdGlvbi9wYWdpbmF0aW9uLmh0bWwnO1xyXG4gICAgfSxcclxuICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBlbGVtZW50LCBhdHRycywgY3RybHMpIHtcclxuICAgICAgZWxlbWVudC5hZGRDbGFzcygncGFnaW5hdGlvbicpO1xyXG4gICAgICB2YXIgcGFnaW5hdGlvbkN0cmwgPSBjdHJsc1swXSwgbmdNb2RlbEN0cmwgPSBjdHJsc1sxXTtcclxuXHJcbiAgICAgIGlmICghbmdNb2RlbEN0cmwpIHtcclxuICAgICAgICAgcmV0dXJuOyAvLyBkbyBub3RoaW5nIGlmIG5vIG5nLW1vZGVsXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHBhZ2luYXRpb25DdHJsLmluaXQobmdNb2RlbEN0cmwsIHVpYlBhZ2luYXRpb25Db25maWcpO1xyXG4gICAgfVxyXG4gIH07XHJcbn1dKTtcclxuXHJcbi8qKlxyXG4gKiBUaGUgZm9sbG93aW5nIGZlYXR1cmVzIGFyZSBzdGlsbCBvdXRzdGFuZGluZzogYW5pbWF0aW9uIGFzIGFcclxuICogZnVuY3Rpb24sIHBsYWNlbWVudCBhcyBhIGZ1bmN0aW9uLCBpbnNpZGUsIHN1cHBvcnQgZm9yIG1vcmUgdHJpZ2dlcnMgdGhhblxyXG4gKiBqdXN0IG1vdXNlIGVudGVyL2xlYXZlLCBodG1sIHRvb2x0aXBzLCBhbmQgc2VsZWN0b3IgZGVsZWdhdGlvbi5cclxuICovXHJcbmFuZ3VsYXIubW9kdWxlKCd1aS5ib290c3RyYXAudG9vbHRpcCcsIFsndWkuYm9vdHN0cmFwLnBvc2l0aW9uJywgJ3VpLmJvb3RzdHJhcC5zdGFja2VkTWFwJ10pXHJcblxyXG4vKipcclxuICogVGhlICR0b29sdGlwIHNlcnZpY2UgY3JlYXRlcyB0b29sdGlwLSBhbmQgcG9wb3Zlci1saWtlIGRpcmVjdGl2ZXMgYXMgd2VsbCBhc1xyXG4gKiBob3VzZXMgZ2xvYmFsIG9wdGlvbnMgZm9yIHRoZW0uXHJcbiAqL1xyXG4ucHJvdmlkZXIoJyR1aWJUb29sdGlwJywgZnVuY3Rpb24oKSB7XHJcbiAgLy8gVGhlIGRlZmF1bHQgb3B0aW9ucyB0b29sdGlwIGFuZCBwb3BvdmVyLlxyXG4gIHZhciBkZWZhdWx0T3B0aW9ucyA9IHtcclxuICAgIHBsYWNlbWVudDogJ3RvcCcsXHJcbiAgICBwbGFjZW1lbnRDbGFzc1ByZWZpeDogJycsXHJcbiAgICBhbmltYXRpb246IHRydWUsXHJcbiAgICBwb3B1cERlbGF5OiAwLFxyXG4gICAgcG9wdXBDbG9zZURlbGF5OiAwLFxyXG4gICAgdXNlQ29udGVudEV4cDogZmFsc2VcclxuICB9O1xyXG5cclxuICAvLyBEZWZhdWx0IGhpZGUgdHJpZ2dlcnMgZm9yIGVhY2ggc2hvdyB0cmlnZ2VyXHJcbiAgdmFyIHRyaWdnZXJNYXAgPSB7XHJcbiAgICAnbW91c2VlbnRlcic6ICdtb3VzZWxlYXZlJyxcclxuICAgICdjbGljayc6ICdjbGljaycsXHJcbiAgICAnb3V0c2lkZUNsaWNrJzogJ291dHNpZGVDbGljaycsXHJcbiAgICAnZm9jdXMnOiAnYmx1cicsXHJcbiAgICAnbm9uZSc6ICcnXHJcbiAgfTtcclxuXHJcbiAgLy8gVGhlIG9wdGlvbnMgc3BlY2lmaWVkIHRvIHRoZSBwcm92aWRlciBnbG9iYWxseS5cclxuICB2YXIgZ2xvYmFsT3B0aW9ucyA9IHt9O1xyXG5cclxuICAvKipcclxuICAgKiBgb3B0aW9ucyh7fSlgIGFsbG93cyBnbG9iYWwgY29uZmlndXJhdGlvbiBvZiBhbGwgdG9vbHRpcHMgaW4gdGhlXHJcbiAgICogYXBwbGljYXRpb24uXHJcbiAgICpcclxuICAgKiAgIHZhciBhcHAgPSBhbmd1bGFyLm1vZHVsZSggJ0FwcCcsIFsndWkuYm9vdHN0cmFwLnRvb2x0aXAnXSwgZnVuY3Rpb24oICR0b29sdGlwUHJvdmlkZXIgKSB7XHJcbiAgICogICAgIC8vIHBsYWNlIHRvb2x0aXBzIGxlZnQgaW5zdGVhZCBvZiB0b3AgYnkgZGVmYXVsdFxyXG4gICAqICAgICAkdG9vbHRpcFByb3ZpZGVyLm9wdGlvbnMoIHsgcGxhY2VtZW50OiAnbGVmdCcgfSApO1xyXG4gICAqICAgfSk7XHJcbiAgICovXHJcblx0dGhpcy5vcHRpb25zID0gZnVuY3Rpb24odmFsdWUpIHtcclxuXHRcdGFuZ3VsYXIuZXh0ZW5kKGdsb2JhbE9wdGlvbnMsIHZhbHVlKTtcclxuXHR9O1xyXG5cclxuICAvKipcclxuICAgKiBUaGlzIGFsbG93cyB5b3UgdG8gZXh0ZW5kIHRoZSBzZXQgb2YgdHJpZ2dlciBtYXBwaW5ncyBhdmFpbGFibGUuIEUuZy46XHJcbiAgICpcclxuICAgKiAgICR0b29sdGlwUHJvdmlkZXIuc2V0VHJpZ2dlcnMoIHsgJ29wZW5UcmlnZ2VyJzogJ2Nsb3NlVHJpZ2dlcicgfSApO1xyXG4gICAqL1xyXG4gIHRoaXMuc2V0VHJpZ2dlcnMgPSBmdW5jdGlvbiBzZXRUcmlnZ2Vycyh0cmlnZ2Vycykge1xyXG4gICAgYW5ndWxhci5leHRlbmQodHJpZ2dlck1hcCwgdHJpZ2dlcnMpO1xyXG4gIH07XHJcblxyXG4gIC8qKlxyXG4gICAqIFRoaXMgaXMgYSBoZWxwZXIgZnVuY3Rpb24gZm9yIHRyYW5zbGF0aW5nIGNhbWVsLWNhc2UgdG8gc25ha2VfY2FzZS5cclxuICAgKi9cclxuICBmdW5jdGlvbiBzbmFrZV9jYXNlKG5hbWUpIHtcclxuICAgIHZhciByZWdleHAgPSAvW0EtWl0vZztcclxuICAgIHZhciBzZXBhcmF0b3IgPSAnLSc7XHJcbiAgICByZXR1cm4gbmFtZS5yZXBsYWNlKHJlZ2V4cCwgZnVuY3Rpb24obGV0dGVyLCBwb3MpIHtcclxuICAgICAgcmV0dXJuIChwb3MgPyBzZXBhcmF0b3IgOiAnJykgKyBsZXR0ZXIudG9Mb3dlckNhc2UoKTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgYWN0dWFsIGluc3RhbmNlIG9mIHRoZSAkdG9vbHRpcCBzZXJ2aWNlLlxyXG4gICAqIFRPRE8gc3VwcG9ydCBtdWx0aXBsZSB0cmlnZ2Vyc1xyXG4gICAqL1xyXG4gIHRoaXMuJGdldCA9IFsnJHdpbmRvdycsICckY29tcGlsZScsICckdGltZW91dCcsICckZG9jdW1lbnQnLCAnJHVpYlBvc2l0aW9uJywgJyRpbnRlcnBvbGF0ZScsICckcm9vdFNjb3BlJywgJyRwYXJzZScsICckJHN0YWNrZWRNYXAnLCBmdW5jdGlvbigkd2luZG93LCAkY29tcGlsZSwgJHRpbWVvdXQsICRkb2N1bWVudCwgJHBvc2l0aW9uLCAkaW50ZXJwb2xhdGUsICRyb290U2NvcGUsICRwYXJzZSwgJCRzdGFja2VkTWFwKSB7XHJcbiAgICB2YXIgb3BlbmVkVG9vbHRpcHMgPSAkJHN0YWNrZWRNYXAuY3JlYXRlTmV3KCk7XHJcbiAgICAkZG9jdW1lbnQub24oJ2tleXVwJywga2V5cHJlc3NMaXN0ZW5lcik7XHJcblxyXG4gICAgJHJvb3RTY29wZS4kb24oJyRkZXN0cm95JywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICRkb2N1bWVudC5vZmYoJ2tleXVwJywga2V5cHJlc3NMaXN0ZW5lcik7XHJcbiAgICB9KTtcclxuXHJcbiAgICBmdW5jdGlvbiBrZXlwcmVzc0xpc3RlbmVyKGUpIHtcclxuICAgICAgaWYgKGUud2hpY2ggPT09IDI3KSB7XHJcbiAgICAgICAgdmFyIGxhc3QgPSBvcGVuZWRUb29sdGlwcy50b3AoKTtcclxuICAgICAgICBpZiAobGFzdCkge1xyXG4gICAgICAgICAgbGFzdC52YWx1ZS5jbG9zZSgpO1xyXG4gICAgICAgICAgbGFzdCA9IG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGZ1bmN0aW9uICR0b29sdGlwKHR0VHlwZSwgcHJlZml4LCBkZWZhdWx0VHJpZ2dlclNob3csIG9wdGlvbnMpIHtcclxuICAgICAgb3B0aW9ucyA9IGFuZ3VsYXIuZXh0ZW5kKHt9LCBkZWZhdWx0T3B0aW9ucywgZ2xvYmFsT3B0aW9ucywgb3B0aW9ucyk7XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogUmV0dXJucyBhbiBvYmplY3Qgb2Ygc2hvdyBhbmQgaGlkZSB0cmlnZ2Vycy5cclxuICAgICAgICpcclxuICAgICAgICogSWYgYSB0cmlnZ2VyIGlzIHN1cHBsaWVkLFxyXG4gICAgICAgKiBpdCBpcyB1c2VkIHRvIHNob3cgdGhlIHRvb2x0aXA7IG90aGVyd2lzZSwgaXQgd2lsbCB1c2UgdGhlIGB0cmlnZ2VyYFxyXG4gICAgICAgKiBvcHRpb24gcGFzc2VkIHRvIHRoZSBgJHRvb2x0aXBQcm92aWRlci5vcHRpb25zYCBtZXRob2Q7IGVsc2UgaXQgd2lsbFxyXG4gICAgICAgKiBkZWZhdWx0IHRvIHRoZSB0cmlnZ2VyIHN1cHBsaWVkIHRvIHRoaXMgZGlyZWN0aXZlIGZhY3RvcnkuXHJcbiAgICAgICAqXHJcbiAgICAgICAqIFRoZSBoaWRlIHRyaWdnZXIgaXMgYmFzZWQgb24gdGhlIHNob3cgdHJpZ2dlci4gSWYgdGhlIGB0cmlnZ2VyYCBvcHRpb25cclxuICAgICAgICogd2FzIHBhc3NlZCB0byB0aGUgYCR0b29sdGlwUHJvdmlkZXIub3B0aW9uc2AgbWV0aG9kLCBpdCB3aWxsIHVzZSB0aGVcclxuICAgICAgICogbWFwcGVkIHRyaWdnZXIgZnJvbSBgdHJpZ2dlck1hcGAgb3IgdGhlIHBhc3NlZCB0cmlnZ2VyIGlmIHRoZSBtYXAgaXNcclxuICAgICAgICogdW5kZWZpbmVkOyBvdGhlcndpc2UsIGl0IHVzZXMgdGhlIGB0cmlnZ2VyTWFwYCB2YWx1ZSBvZiB0aGUgc2hvd1xyXG4gICAgICAgKiB0cmlnZ2VyOyBlbHNlIGl0IHdpbGwganVzdCB1c2UgdGhlIHNob3cgdHJpZ2dlci5cclxuICAgICAgICovXHJcbiAgICAgIGZ1bmN0aW9uIGdldFRyaWdnZXJzKHRyaWdnZXIpIHtcclxuICAgICAgICB2YXIgc2hvdyA9ICh0cmlnZ2VyIHx8IG9wdGlvbnMudHJpZ2dlciB8fCBkZWZhdWx0VHJpZ2dlclNob3cpLnNwbGl0KCcgJyk7XHJcbiAgICAgICAgdmFyIGhpZGUgPSBzaG93Lm1hcChmdW5jdGlvbih0cmlnZ2VyKSB7XHJcbiAgICAgICAgICByZXR1cm4gdHJpZ2dlck1hcFt0cmlnZ2VyXSB8fCB0cmlnZ2VyO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICBzaG93OiBzaG93LFxyXG4gICAgICAgICAgaGlkZTogaGlkZVxyXG4gICAgICAgIH07XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHZhciBkaXJlY3RpdmVOYW1lID0gc25ha2VfY2FzZSh0dFR5cGUpO1xyXG5cclxuICAgICAgdmFyIHN0YXJ0U3ltID0gJGludGVycG9sYXRlLnN0YXJ0U3ltYm9sKCk7XHJcbiAgICAgIHZhciBlbmRTeW0gPSAkaW50ZXJwb2xhdGUuZW5kU3ltYm9sKCk7XHJcbiAgICAgIHZhciB0ZW1wbGF0ZSA9XHJcbiAgICAgICAgJzxkaXYgJysgZGlyZWN0aXZlTmFtZSArICctcG9wdXAgJyArXHJcbiAgICAgICAgICAndWliLXRpdGxlPVwiJyArIHN0YXJ0U3ltICsgJ3RpdGxlJyArIGVuZFN5bSArICdcIiAnICtcclxuICAgICAgICAgIChvcHRpb25zLnVzZUNvbnRlbnRFeHAgP1xyXG4gICAgICAgICAgICAnY29udGVudC1leHA9XCJjb250ZW50RXhwKClcIiAnIDpcclxuICAgICAgICAgICAgJ2NvbnRlbnQ9XCInICsgc3RhcnRTeW0gKyAnY29udGVudCcgKyBlbmRTeW0gKyAnXCIgJykgK1xyXG4gICAgICAgICAgJ29yaWdpbi1zY29wZT1cIm9yaWdTY29wZVwiICcgK1xyXG4gICAgICAgICAgJ2NsYXNzPVwidWliLXBvc2l0aW9uLW1lYXN1cmUgJyArIHByZWZpeCArICdcIiAnICtcclxuICAgICAgICAgICd0b29sdGlwLWFuaW1hdGlvbi1jbGFzcz1cImZhZGVcIicgK1xyXG4gICAgICAgICAgJ3VpYi10b29sdGlwLWNsYXNzZXMgJyArXHJcbiAgICAgICAgICAnbmctY2xhc3M9XCJ7IGluOiBpc09wZW4gfVwiICcgK1xyXG4gICAgICAgICAgJz4nICtcclxuICAgICAgICAnPC9kaXY+JztcclxuXHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgY29tcGlsZTogZnVuY3Rpb24odEVsZW0sIHRBdHRycykge1xyXG4gICAgICAgICAgdmFyIHRvb2x0aXBMaW5rZXIgPSAkY29tcGlsZSh0ZW1wbGF0ZSk7XHJcblxyXG4gICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIGxpbmsoc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCB0b29sdGlwQ3RybCkge1xyXG4gICAgICAgICAgICB2YXIgdG9vbHRpcDtcclxuICAgICAgICAgICAgdmFyIHRvb2x0aXBMaW5rZWRTY29wZTtcclxuICAgICAgICAgICAgdmFyIHRyYW5zaXRpb25UaW1lb3V0O1xyXG4gICAgICAgICAgICB2YXIgc2hvd1RpbWVvdXQ7XHJcbiAgICAgICAgICAgIHZhciBoaWRlVGltZW91dDtcclxuICAgICAgICAgICAgdmFyIHBvc2l0aW9uVGltZW91dDtcclxuICAgICAgICAgICAgdmFyIGFkanVzdG1lbnRUaW1lb3V0O1xyXG4gICAgICAgICAgICB2YXIgYXBwZW5kVG9Cb2R5ID0gYW5ndWxhci5pc0RlZmluZWQob3B0aW9ucy5hcHBlbmRUb0JvZHkpID8gb3B0aW9ucy5hcHBlbmRUb0JvZHkgOiBmYWxzZTtcclxuICAgICAgICAgICAgdmFyIHRyaWdnZXJzID0gZ2V0VHJpZ2dlcnModW5kZWZpbmVkKTtcclxuICAgICAgICAgICAgdmFyIGhhc0VuYWJsZUV4cCA9IGFuZ3VsYXIuaXNEZWZpbmVkKGF0dHJzW3ByZWZpeCArICdFbmFibGUnXSk7XHJcbiAgICAgICAgICAgIHZhciB0dFNjb3BlID0gc2NvcGUuJG5ldyh0cnVlKTtcclxuICAgICAgICAgICAgdmFyIHJlcG9zaXRpb25TY2hlZHVsZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgdmFyIGlzT3BlblBhcnNlID0gYW5ndWxhci5pc0RlZmluZWQoYXR0cnNbcHJlZml4ICsgJ0lzT3BlbiddKSA/ICRwYXJzZShhdHRyc1twcmVmaXggKyAnSXNPcGVuJ10pIDogZmFsc2U7XHJcbiAgICAgICAgICAgIHZhciBjb250ZW50UGFyc2UgPSBvcHRpb25zLnVzZUNvbnRlbnRFeHAgPyAkcGFyc2UoYXR0cnNbdHRUeXBlXSkgOiBmYWxzZTtcclxuICAgICAgICAgICAgdmFyIG9ic2VydmVycyA9IFtdO1xyXG4gICAgICAgICAgICB2YXIgbGFzdFBsYWNlbWVudDtcclxuXHJcbiAgICAgICAgICAgIHZhciBwb3NpdGlvblRvb2x0aXAgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAvLyBjaGVjayBpZiB0b29sdGlwIGV4aXN0cyBhbmQgaXMgbm90IGVtcHR5XHJcbiAgICAgICAgICAgICAgaWYgKCF0b29sdGlwIHx8ICF0b29sdGlwLmh0bWwoKSkgeyByZXR1cm47IH1cclxuXHJcbiAgICAgICAgICAgICAgaWYgKCFwb3NpdGlvblRpbWVvdXQpIHtcclxuICAgICAgICAgICAgICAgIHBvc2l0aW9uVGltZW91dCA9ICR0aW1lb3V0KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICB2YXIgdHRQb3NpdGlvbiA9ICRwb3NpdGlvbi5wb3NpdGlvbkVsZW1lbnRzKGVsZW1lbnQsIHRvb2x0aXAsIHR0U2NvcGUucGxhY2VtZW50LCBhcHBlbmRUb0JvZHkpO1xyXG4gICAgICAgICAgICAgICAgICB2YXIgaW5pdGlhbEhlaWdodCA9IGFuZ3VsYXIuaXNEZWZpbmVkKHRvb2x0aXAub2Zmc2V0SGVpZ2h0KSA/IHRvb2x0aXAub2Zmc2V0SGVpZ2h0IDogdG9vbHRpcC5wcm9wKCdvZmZzZXRIZWlnaHQnKTtcclxuICAgICAgICAgICAgICAgICAgdmFyIGVsZW1lbnRQb3MgPSBhcHBlbmRUb0JvZHkgPyAkcG9zaXRpb24ub2Zmc2V0KGVsZW1lbnQpIDogJHBvc2l0aW9uLnBvc2l0aW9uKGVsZW1lbnQpO1xyXG4gICAgICAgICAgICAgICAgICB0b29sdGlwLmNzcyh7IHRvcDogdHRQb3NpdGlvbi50b3AgKyAncHgnLCBsZWZ0OiB0dFBvc2l0aW9uLmxlZnQgKyAncHgnIH0pO1xyXG4gICAgICAgICAgICAgICAgICB2YXIgcGxhY2VtZW50Q2xhc3NlcyA9IHR0UG9zaXRpb24ucGxhY2VtZW50LnNwbGl0KCctJyk7XHJcblxyXG4gICAgICAgICAgICAgICAgICBpZiAoIXRvb2x0aXAuaGFzQ2xhc3MocGxhY2VtZW50Q2xhc3Nlc1swXSkpIHtcclxuICAgICAgICAgICAgICAgICAgICB0b29sdGlwLnJlbW92ZUNsYXNzKGxhc3RQbGFjZW1lbnQuc3BsaXQoJy0nKVswXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgdG9vbHRpcC5hZGRDbGFzcyhwbGFjZW1lbnRDbGFzc2VzWzBdKTtcclxuICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgaWYgKCF0b29sdGlwLmhhc0NsYXNzKG9wdGlvbnMucGxhY2VtZW50Q2xhc3NQcmVmaXggKyB0dFBvc2l0aW9uLnBsYWNlbWVudCkpIHtcclxuICAgICAgICAgICAgICAgICAgICB0b29sdGlwLnJlbW92ZUNsYXNzKG9wdGlvbnMucGxhY2VtZW50Q2xhc3NQcmVmaXggKyBsYXN0UGxhY2VtZW50KTtcclxuICAgICAgICAgICAgICAgICAgICB0b29sdGlwLmFkZENsYXNzKG9wdGlvbnMucGxhY2VtZW50Q2xhc3NQcmVmaXggKyB0dFBvc2l0aW9uLnBsYWNlbWVudCk7XHJcbiAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgIGFkanVzdG1lbnRUaW1lb3V0ID0gJHRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGN1cnJlbnRIZWlnaHQgPSBhbmd1bGFyLmlzRGVmaW5lZCh0b29sdGlwLm9mZnNldEhlaWdodCkgPyB0b29sdGlwLm9mZnNldEhlaWdodCA6IHRvb2x0aXAucHJvcCgnb2Zmc2V0SGVpZ2h0Jyk7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGFkanVzdG1lbnQgPSAkcG9zaXRpb24uYWRqdXN0VG9wKHBsYWNlbWVudENsYXNzZXMsIGVsZW1lbnRQb3MsIGluaXRpYWxIZWlnaHQsIGN1cnJlbnRIZWlnaHQpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChhZGp1c3RtZW50KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICB0b29sdGlwLmNzcyhhZGp1c3RtZW50KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgYWRqdXN0bWVudFRpbWVvdXQgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgICB9LCAwLCBmYWxzZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAvLyBmaXJzdCB0aW1lIHRocm91Z2ggdHQgZWxlbWVudCB3aWxsIGhhdmUgdGhlXHJcbiAgICAgICAgICAgICAgICAgIC8vIHVpYi1wb3NpdGlvbi1tZWFzdXJlIGNsYXNzIG9yIGlmIHRoZSBwbGFjZW1lbnRcclxuICAgICAgICAgICAgICAgICAgLy8gaGFzIGNoYW5nZWQgd2UgbmVlZCB0byBwb3NpdGlvbiB0aGUgYXJyb3cuXHJcbiAgICAgICAgICAgICAgICAgIGlmICh0b29sdGlwLmhhc0NsYXNzKCd1aWItcG9zaXRpb24tbWVhc3VyZScpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJHBvc2l0aW9uLnBvc2l0aW9uQXJyb3codG9vbHRpcCwgdHRQb3NpdGlvbi5wbGFjZW1lbnQpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRvb2x0aXAucmVtb3ZlQ2xhc3MoJ3VpYi1wb3NpdGlvbi1tZWFzdXJlJyk7XHJcbiAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAobGFzdFBsYWNlbWVudCAhPT0gdHRQb3NpdGlvbi5wbGFjZW1lbnQpIHtcclxuICAgICAgICAgICAgICAgICAgICAkcG9zaXRpb24ucG9zaXRpb25BcnJvdyh0b29sdGlwLCB0dFBvc2l0aW9uLnBsYWNlbWVudCk7XHJcbiAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgbGFzdFBsYWNlbWVudCA9IHR0UG9zaXRpb24ucGxhY2VtZW50O1xyXG5cclxuICAgICAgICAgICAgICAgICAgcG9zaXRpb25UaW1lb3V0ID0gbnVsbDtcclxuICAgICAgICAgICAgICAgIH0sIDAsIGZhbHNlKTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAvLyBTZXQgdXAgdGhlIGNvcnJlY3Qgc2NvcGUgdG8gYWxsb3cgdHJhbnNjbHVzaW9uIGxhdGVyXHJcbiAgICAgICAgICAgIHR0U2NvcGUub3JpZ1Njb3BlID0gc2NvcGU7XHJcblxyXG4gICAgICAgICAgICAvLyBCeSBkZWZhdWx0LCB0aGUgdG9vbHRpcCBpcyBub3Qgb3Blbi5cclxuICAgICAgICAgICAgLy8gVE9ETyBhZGQgYWJpbGl0eSB0byBzdGFydCB0b29sdGlwIG9wZW5lZFxyXG4gICAgICAgICAgICB0dFNjb3BlLmlzT3BlbiA9IGZhbHNlO1xyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gdG9nZ2xlVG9vbHRpcEJpbmQoKSB7XHJcbiAgICAgICAgICAgICAgaWYgKCF0dFNjb3BlLmlzT3Blbikge1xyXG4gICAgICAgICAgICAgICAgc2hvd1Rvb2x0aXBCaW5kKCk7XHJcbiAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGhpZGVUb29sdGlwQmluZCgpO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gU2hvdyB0aGUgdG9vbHRpcCB3aXRoIGRlbGF5IGlmIHNwZWNpZmllZCwgb3RoZXJ3aXNlIHNob3cgaXQgaW1tZWRpYXRlbHlcclxuICAgICAgICAgICAgZnVuY3Rpb24gc2hvd1Rvb2x0aXBCaW5kKCkge1xyXG4gICAgICAgICAgICAgIGlmIChoYXNFbmFibGVFeHAgJiYgIXNjb3BlLiRldmFsKGF0dHJzW3ByZWZpeCArICdFbmFibGUnXSkpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgIGNhbmNlbEhpZGUoKTtcclxuICAgICAgICAgICAgICBwcmVwYXJlVG9vbHRpcCgpO1xyXG5cclxuICAgICAgICAgICAgICBpZiAodHRTY29wZS5wb3B1cERlbGF5KSB7XHJcbiAgICAgICAgICAgICAgICAvLyBEbyBub3RoaW5nIGlmIHRoZSB0b29sdGlwIHdhcyBhbHJlYWR5IHNjaGVkdWxlZCB0byBwb3AtdXAuXHJcbiAgICAgICAgICAgICAgICAvLyBUaGlzIGhhcHBlbnMgaWYgc2hvdyBpcyB0cmlnZ2VyZWQgbXVsdGlwbGUgdGltZXMgYmVmb3JlIGFueSBoaWRlIGlzIHRyaWdnZXJlZC5cclxuICAgICAgICAgICAgICAgIGlmICghc2hvd1RpbWVvdXQpIHtcclxuICAgICAgICAgICAgICAgICAgc2hvd1RpbWVvdXQgPSAkdGltZW91dChzaG93LCB0dFNjb3BlLnBvcHVwRGVsYXksIGZhbHNlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgc2hvdygpO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gaGlkZVRvb2x0aXBCaW5kKCkge1xyXG4gICAgICAgICAgICAgIGNhbmNlbFNob3coKTtcclxuXHJcbiAgICAgICAgICAgICAgaWYgKHR0U2NvcGUucG9wdXBDbG9zZURlbGF5KSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIWhpZGVUaW1lb3V0KSB7XHJcbiAgICAgICAgICAgICAgICAgIGhpZGVUaW1lb3V0ID0gJHRpbWVvdXQoaGlkZSwgdHRTY29wZS5wb3B1cENsb3NlRGVsYXksIGZhbHNlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgaGlkZSgpO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gU2hvdyB0aGUgdG9vbHRpcCBwb3B1cCBlbGVtZW50LlxyXG4gICAgICAgICAgICBmdW5jdGlvbiBzaG93KCkge1xyXG4gICAgICAgICAgICAgIGNhbmNlbFNob3coKTtcclxuICAgICAgICAgICAgICBjYW5jZWxIaWRlKCk7XHJcblxyXG4gICAgICAgICAgICAgIC8vIERvbid0IHNob3cgZW1wdHkgdG9vbHRpcHMuXHJcbiAgICAgICAgICAgICAgaWYgKCF0dFNjb3BlLmNvbnRlbnQpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBhbmd1bGFyLm5vb3A7XHJcbiAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICBjcmVhdGVUb29sdGlwKCk7XHJcblxyXG4gICAgICAgICAgICAgIC8vIEFuZCBzaG93IHRoZSB0b29sdGlwLlxyXG4gICAgICAgICAgICAgIHR0U2NvcGUuJGV2YWxBc3luYyhmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHR0U2NvcGUuaXNPcGVuID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIGFzc2lnbklzT3Blbih0cnVlKTtcclxuICAgICAgICAgICAgICAgIHBvc2l0aW9uVG9vbHRpcCgpO1xyXG4gICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBjYW5jZWxTaG93KCkge1xyXG4gICAgICAgICAgICAgIGlmIChzaG93VGltZW91dCkge1xyXG4gICAgICAgICAgICAgICAgJHRpbWVvdXQuY2FuY2VsKHNob3dUaW1lb3V0KTtcclxuICAgICAgICAgICAgICAgIHNob3dUaW1lb3V0ID0gbnVsbDtcclxuICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgIGlmIChwb3NpdGlvblRpbWVvdXQpIHtcclxuICAgICAgICAgICAgICAgICR0aW1lb3V0LmNhbmNlbChwb3NpdGlvblRpbWVvdXQpO1xyXG4gICAgICAgICAgICAgICAgcG9zaXRpb25UaW1lb3V0ID0gbnVsbDtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIEhpZGUgdGhlIHRvb2x0aXAgcG9wdXAgZWxlbWVudC5cclxuICAgICAgICAgICAgZnVuY3Rpb24gaGlkZSgpIHtcclxuICAgICAgICAgICAgICBpZiAoIXR0U2NvcGUpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgIC8vIEZpcnN0IHRoaW5ncyBmaXJzdDogd2UgZG9uJ3Qgc2hvdyBpdCBhbnltb3JlLlxyXG4gICAgICAgICAgICAgIHR0U2NvcGUuJGV2YWxBc3luYyhmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIGlmICh0dFNjb3BlKSB7XHJcbiAgICAgICAgICAgICAgICAgIHR0U2NvcGUuaXNPcGVuID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgIGFzc2lnbklzT3BlbihmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICAgIC8vIEFuZCBub3cgd2UgcmVtb3ZlIGl0IGZyb20gdGhlIERPTS4gSG93ZXZlciwgaWYgd2UgaGF2ZSBhbmltYXRpb24sIHdlXHJcbiAgICAgICAgICAgICAgICAgIC8vIG5lZWQgdG8gd2FpdCBmb3IgaXQgdG8gZXhwaXJlIGJlZm9yZWhhbmQuXHJcbiAgICAgICAgICAgICAgICAgIC8vIEZJWE1FOiB0aGlzIGlzIGEgcGxhY2Vob2xkZXIgZm9yIGEgcG9ydCBvZiB0aGUgdHJhbnNpdGlvbnMgbGlicmFyeS5cclxuICAgICAgICAgICAgICAgICAgLy8gVGhlIGZhZGUgdHJhbnNpdGlvbiBpbiBUV0JTIGlzIDE1MG1zLlxyXG4gICAgICAgICAgICAgICAgICBpZiAodHRTY29wZS5hbmltYXRpb24pIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIXRyYW5zaXRpb25UaW1lb3V0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICB0cmFuc2l0aW9uVGltZW91dCA9ICR0aW1lb3V0KHJlbW92ZVRvb2x0aXAsIDE1MCwgZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICByZW1vdmVUb29sdGlwKCk7XHJcbiAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gY2FuY2VsSGlkZSgpIHtcclxuICAgICAgICAgICAgICBpZiAoaGlkZVRpbWVvdXQpIHtcclxuICAgICAgICAgICAgICAgICR0aW1lb3V0LmNhbmNlbChoaWRlVGltZW91dCk7XHJcbiAgICAgICAgICAgICAgICBoaWRlVGltZW91dCA9IG51bGw7XHJcbiAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICBpZiAodHJhbnNpdGlvblRpbWVvdXQpIHtcclxuICAgICAgICAgICAgICAgICR0aW1lb3V0LmNhbmNlbCh0cmFuc2l0aW9uVGltZW91dCk7XHJcbiAgICAgICAgICAgICAgICB0cmFuc2l0aW9uVGltZW91dCA9IG51bGw7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBjcmVhdGVUb29sdGlwKCkge1xyXG4gICAgICAgICAgICAgIC8vIFRoZXJlIGNhbiBvbmx5IGJlIG9uZSB0b29sdGlwIGVsZW1lbnQgcGVyIGRpcmVjdGl2ZSBzaG93biBhdCBvbmNlLlxyXG4gICAgICAgICAgICAgIGlmICh0b29sdGlwKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICB0b29sdGlwTGlua2VkU2NvcGUgPSB0dFNjb3BlLiRuZXcoKTtcclxuICAgICAgICAgICAgICB0b29sdGlwID0gdG9vbHRpcExpbmtlcih0b29sdGlwTGlua2VkU2NvcGUsIGZ1bmN0aW9uKHRvb2x0aXApIHtcclxuICAgICAgICAgICAgICAgIGlmIChhcHBlbmRUb0JvZHkpIHtcclxuICAgICAgICAgICAgICAgICAgJGRvY3VtZW50LmZpbmQoJ2JvZHknKS5hcHBlbmQodG9vbHRpcCk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICBlbGVtZW50LmFmdGVyKHRvb2x0aXApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICBvcGVuZWRUb29sdGlwcy5hZGQodHRTY29wZSwge1xyXG4gICAgICAgICAgICAgICAgY2xvc2U6IGhpZGVcclxuICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgcHJlcE9ic2VydmVycygpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiByZW1vdmVUb29sdGlwKCkge1xyXG4gICAgICAgICAgICAgIGNhbmNlbFNob3coKTtcclxuICAgICAgICAgICAgICBjYW5jZWxIaWRlKCk7XHJcbiAgICAgICAgICAgICAgdW5yZWdpc3Rlck9ic2VydmVycygpO1xyXG5cclxuICAgICAgICAgICAgICBpZiAodG9vbHRpcCkge1xyXG4gICAgICAgICAgICAgICAgdG9vbHRpcC5yZW1vdmUoKTtcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgdG9vbHRpcCA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICBpZiAoYWRqdXN0bWVudFRpbWVvdXQpIHtcclxuICAgICAgICAgICAgICAgICAgJHRpbWVvdXQuY2FuY2VsKGFkanVzdG1lbnRUaW1lb3V0KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgIG9wZW5lZFRvb2x0aXBzLnJlbW92ZSh0dFNjb3BlKTtcclxuICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICBpZiAodG9vbHRpcExpbmtlZFNjb3BlKSB7XHJcbiAgICAgICAgICAgICAgICB0b29sdGlwTGlua2VkU2NvcGUuJGRlc3Ryb3koKTtcclxuICAgICAgICAgICAgICAgIHRvb2x0aXBMaW5rZWRTY29wZSA9IG51bGw7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvKipcclxuICAgICAgICAgICAgICogU2V0IHRoZSBpbml0aWFsIHNjb3BlIHZhbHVlcy4gT25jZVxyXG4gICAgICAgICAgICAgKiB0aGUgdG9vbHRpcCBpcyBjcmVhdGVkLCB0aGUgb2JzZXJ2ZXJzXHJcbiAgICAgICAgICAgICAqIHdpbGwgYmUgYWRkZWQgdG8ga2VlcCB0aGluZ3MgaW4gc3luYy5cclxuICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIHByZXBhcmVUb29sdGlwKCkge1xyXG4gICAgICAgICAgICAgIHR0U2NvcGUudGl0bGUgPSBhdHRyc1twcmVmaXggKyAnVGl0bGUnXTtcclxuICAgICAgICAgICAgICBpZiAoY29udGVudFBhcnNlKSB7XHJcbiAgICAgICAgICAgICAgICB0dFNjb3BlLmNvbnRlbnQgPSBjb250ZW50UGFyc2Uoc2NvcGUpO1xyXG4gICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0dFNjb3BlLmNvbnRlbnQgPSBhdHRyc1t0dFR5cGVdO1xyXG4gICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgdHRTY29wZS5wb3B1cENsYXNzID0gYXR0cnNbcHJlZml4ICsgJ0NsYXNzJ107XHJcbiAgICAgICAgICAgICAgdHRTY29wZS5wbGFjZW1lbnQgPSBhbmd1bGFyLmlzRGVmaW5lZChhdHRyc1twcmVmaXggKyAnUGxhY2VtZW50J10pID8gYXR0cnNbcHJlZml4ICsgJ1BsYWNlbWVudCddIDogb3B0aW9ucy5wbGFjZW1lbnQ7XHJcbiAgICAgICAgICAgICAgdmFyIHBsYWNlbWVudCA9ICRwb3NpdGlvbi5wYXJzZVBsYWNlbWVudCh0dFNjb3BlLnBsYWNlbWVudCk7XHJcbiAgICAgICAgICAgICAgbGFzdFBsYWNlbWVudCA9IHBsYWNlbWVudFsxXSA/IHBsYWNlbWVudFswXSArICctJyArIHBsYWNlbWVudFsxXSA6IHBsYWNlbWVudFswXTtcclxuXHJcbiAgICAgICAgICAgICAgdmFyIGRlbGF5ID0gcGFyc2VJbnQoYXR0cnNbcHJlZml4ICsgJ1BvcHVwRGVsYXknXSwgMTApO1xyXG4gICAgICAgICAgICAgIHZhciBjbG9zZURlbGF5ID0gcGFyc2VJbnQoYXR0cnNbcHJlZml4ICsgJ1BvcHVwQ2xvc2VEZWxheSddLCAxMCk7XHJcbiAgICAgICAgICAgICAgdHRTY29wZS5wb3B1cERlbGF5ID0gIWlzTmFOKGRlbGF5KSA/IGRlbGF5IDogb3B0aW9ucy5wb3B1cERlbGF5O1xyXG4gICAgICAgICAgICAgIHR0U2NvcGUucG9wdXBDbG9zZURlbGF5ID0gIWlzTmFOKGNsb3NlRGVsYXkpID8gY2xvc2VEZWxheSA6IG9wdGlvbnMucG9wdXBDbG9zZURlbGF5O1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBhc3NpZ25Jc09wZW4oaXNPcGVuKSB7XHJcbiAgICAgICAgICAgICAgaWYgKGlzT3BlblBhcnNlICYmIGFuZ3VsYXIuaXNGdW5jdGlvbihpc09wZW5QYXJzZS5hc3NpZ24pKSB7XHJcbiAgICAgICAgICAgICAgICBpc09wZW5QYXJzZS5hc3NpZ24oc2NvcGUsIGlzT3Blbik7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0dFNjb3BlLmNvbnRlbnRFeHAgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICByZXR1cm4gdHRTY29wZS5jb250ZW50O1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgLyoqXHJcbiAgICAgICAgICAgICAqIE9ic2VydmUgdGhlIHJlbGV2YW50IGF0dHJpYnV0ZXMuXHJcbiAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICBhdHRycy4kb2JzZXJ2ZSgnZGlzYWJsZWQnLCBmdW5jdGlvbih2YWwpIHtcclxuICAgICAgICAgICAgICBpZiAodmFsKSB7XHJcbiAgICAgICAgICAgICAgICBjYW5jZWxTaG93KCk7XHJcbiAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICBpZiAodmFsICYmIHR0U2NvcGUuaXNPcGVuKSB7XHJcbiAgICAgICAgICAgICAgICBoaWRlKCk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIGlmIChpc09wZW5QYXJzZSkge1xyXG4gICAgICAgICAgICAgIHNjb3BlLiR3YXRjaChpc09wZW5QYXJzZSwgZnVuY3Rpb24odmFsKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodHRTY29wZSAmJiAhdmFsID09PSB0dFNjb3BlLmlzT3Blbikge1xyXG4gICAgICAgICAgICAgICAgICB0b2dnbGVUb29sdGlwQmluZCgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBwcmVwT2JzZXJ2ZXJzKCkge1xyXG4gICAgICAgICAgICAgIG9ic2VydmVycy5sZW5ndGggPSAwO1xyXG5cclxuICAgICAgICAgICAgICBpZiAoY29udGVudFBhcnNlKSB7XHJcbiAgICAgICAgICAgICAgICBvYnNlcnZlcnMucHVzaChcclxuICAgICAgICAgICAgICAgICAgc2NvcGUuJHdhdGNoKGNvbnRlbnRQYXJzZSwgZnVuY3Rpb24odmFsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdHRTY29wZS5jb250ZW50ID0gdmFsO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICghdmFsICYmIHR0U2NvcGUuaXNPcGVuKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICBoaWRlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgICAgICBvYnNlcnZlcnMucHVzaChcclxuICAgICAgICAgICAgICAgICAgdG9vbHRpcExpbmtlZFNjb3BlLiR3YXRjaChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIXJlcG9zaXRpb25TY2hlZHVsZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgIHJlcG9zaXRpb25TY2hlZHVsZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgdG9vbHRpcExpbmtlZFNjb3BlLiQkcG9zdERpZ2VzdChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVwb3NpdGlvblNjaGVkdWxlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodHRTY29wZSAmJiB0dFNjb3BlLmlzT3Blbikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uVG9vbHRpcCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBvYnNlcnZlcnMucHVzaChcclxuICAgICAgICAgICAgICAgICAgYXR0cnMuJG9ic2VydmUodHRUeXBlLCBmdW5jdGlvbih2YWwpIHtcclxuICAgICAgICAgICAgICAgICAgICB0dFNjb3BlLmNvbnRlbnQgPSB2YWw7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCF2YWwgJiYgdHRTY29wZS5pc09wZW4pIHtcclxuICAgICAgICAgICAgICAgICAgICAgIGhpZGUoKTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgcG9zaXRpb25Ub29sdGlwKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgIG9ic2VydmVycy5wdXNoKFxyXG4gICAgICAgICAgICAgICAgYXR0cnMuJG9ic2VydmUocHJlZml4ICsgJ1RpdGxlJywgZnVuY3Rpb24odmFsKSB7XHJcbiAgICAgICAgICAgICAgICAgIHR0U2NvcGUudGl0bGUgPSB2YWw7XHJcbiAgICAgICAgICAgICAgICAgIGlmICh0dFNjb3BlLmlzT3Blbikge1xyXG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uVG9vbHRpcCgpO1xyXG4gICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICAgIG9ic2VydmVycy5wdXNoKFxyXG4gICAgICAgICAgICAgICAgYXR0cnMuJG9ic2VydmUocHJlZml4ICsgJ1BsYWNlbWVudCcsIGZ1bmN0aW9uKHZhbCkge1xyXG4gICAgICAgICAgICAgICAgICB0dFNjb3BlLnBsYWNlbWVudCA9IHZhbCA/IHZhbCA6IG9wdGlvbnMucGxhY2VtZW50O1xyXG4gICAgICAgICAgICAgICAgICBpZiAodHRTY29wZS5pc09wZW4pIHtcclxuICAgICAgICAgICAgICAgICAgICBwb3NpdGlvblRvb2x0aXAoKTtcclxuICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiB1bnJlZ2lzdGVyT2JzZXJ2ZXJzKCkge1xyXG4gICAgICAgICAgICAgIGlmIChvYnNlcnZlcnMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICBhbmd1bGFyLmZvckVhY2gob2JzZXJ2ZXJzLCBmdW5jdGlvbihvYnNlcnZlcikge1xyXG4gICAgICAgICAgICAgICAgICBvYnNlcnZlcigpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICBvYnNlcnZlcnMubGVuZ3RoID0gMDtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIGhpZGUgdG9vbHRpcHMvcG9wb3ZlcnMgZm9yIG91dHNpZGVDbGljayB0cmlnZ2VyXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIGJvZHlIaWRlVG9vbHRpcEJpbmQoZSkge1xyXG4gICAgICAgICAgICAgIGlmICghdHRTY29wZSB8fCAhdHRTY29wZS5pc09wZW4gfHwgIXRvb2x0aXApIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgLy8gbWFrZSBzdXJlIHRoZSB0b29sdGlwL3BvcG92ZXIgbGluayBvciB0b29sIHRvb2x0aXAvcG9wb3ZlciBpdHNlbGYgd2VyZSBub3QgY2xpY2tlZFxyXG4gICAgICAgICAgICAgIGlmICghZWxlbWVudFswXS5jb250YWlucyhlLnRhcmdldCkgJiYgIXRvb2x0aXBbMF0uY29udGFpbnMoZS50YXJnZXQpKSB7XHJcbiAgICAgICAgICAgICAgICBoaWRlVG9vbHRpcEJpbmQoKTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHZhciB1bnJlZ2lzdGVyVHJpZ2dlcnMgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICB0cmlnZ2Vycy5zaG93LmZvckVhY2goZnVuY3Rpb24odHJpZ2dlcikge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRyaWdnZXIgPT09ICdvdXRzaWRlQ2xpY2snKSB7XHJcbiAgICAgICAgICAgICAgICAgIGVsZW1lbnQub2ZmKCdjbGljaycsIHRvZ2dsZVRvb2x0aXBCaW5kKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgIGVsZW1lbnQub2ZmKHRyaWdnZXIsIHNob3dUb29sdGlwQmluZCk7XHJcbiAgICAgICAgICAgICAgICAgIGVsZW1lbnQub2ZmKHRyaWdnZXIsIHRvZ2dsZVRvb2x0aXBCaW5kKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICB0cmlnZ2Vycy5oaWRlLmZvckVhY2goZnVuY3Rpb24odHJpZ2dlcikge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRyaWdnZXIgPT09ICdvdXRzaWRlQ2xpY2snKSB7XHJcbiAgICAgICAgICAgICAgICAgICRkb2N1bWVudC5vZmYoJ2NsaWNrJywgYm9keUhpZGVUb29sdGlwQmluZCk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICBlbGVtZW50Lm9mZih0cmlnZ2VyLCBoaWRlVG9vbHRpcEJpbmQpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gcHJlcFRyaWdnZXJzKCkge1xyXG4gICAgICAgICAgICAgIHZhciBzaG93VHJpZ2dlcnMgPSBbXSwgaGlkZVRyaWdnZXJzID0gW107XHJcbiAgICAgICAgICAgICAgdmFyIHZhbCA9IHNjb3BlLiRldmFsKGF0dHJzW3ByZWZpeCArICdUcmlnZ2VyJ10pO1xyXG4gICAgICAgICAgICAgIHVucmVnaXN0ZXJUcmlnZ2VycygpO1xyXG5cclxuICAgICAgICAgICAgICBpZiAoYW5ndWxhci5pc09iamVjdCh2YWwpKSB7XHJcbiAgICAgICAgICAgICAgICBPYmplY3Qua2V5cyh2YWwpLmZvckVhY2goZnVuY3Rpb24oa2V5KSB7XHJcbiAgICAgICAgICAgICAgICAgIHNob3dUcmlnZ2Vycy5wdXNoKGtleSk7XHJcbiAgICAgICAgICAgICAgICAgIGhpZGVUcmlnZ2Vycy5wdXNoKHZhbFtrZXldKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgdHJpZ2dlcnMgPSB7XHJcbiAgICAgICAgICAgICAgICAgIHNob3c6IHNob3dUcmlnZ2VycyxcclxuICAgICAgICAgICAgICAgICAgaGlkZTogaGlkZVRyaWdnZXJzXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0cmlnZ2VycyA9IGdldFRyaWdnZXJzKHZhbCk7XHJcbiAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICBpZiAodHJpZ2dlcnMuc2hvdyAhPT0gJ25vbmUnKSB7XHJcbiAgICAgICAgICAgICAgICB0cmlnZ2Vycy5zaG93LmZvckVhY2goZnVuY3Rpb24odHJpZ2dlciwgaWR4KSB7XHJcbiAgICAgICAgICAgICAgICAgIGlmICh0cmlnZ2VyID09PSAnb3V0c2lkZUNsaWNrJykge1xyXG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQub24oJ2NsaWNrJywgdG9nZ2xlVG9vbHRpcEJpbmQpO1xyXG4gICAgICAgICAgICAgICAgICAgICRkb2N1bWVudC5vbignY2xpY2snLCBib2R5SGlkZVRvb2x0aXBCaW5kKTtcclxuICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0cmlnZ2VyID09PSB0cmlnZ2Vycy5oaWRlW2lkeF0pIHtcclxuICAgICAgICAgICAgICAgICAgICBlbGVtZW50Lm9uKHRyaWdnZXIsIHRvZ2dsZVRvb2x0aXBCaW5kKTtcclxuICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0cmlnZ2VyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5vbih0cmlnZ2VyLCBzaG93VG9vbHRpcEJpbmQpO1xyXG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQub24odHJpZ2dlcnMuaGlkZVtpZHhdLCBoaWRlVG9vbHRpcEJpbmQpO1xyXG4gICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICBlbGVtZW50Lm9uKCdrZXlwcmVzcycsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZS53aGljaCA9PT0gMjcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgIGhpZGVUb29sdGlwQmluZCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHByZXBUcmlnZ2VycygpO1xyXG5cclxuICAgICAgICAgICAgdmFyIGFuaW1hdGlvbiA9IHNjb3BlLiRldmFsKGF0dHJzW3ByZWZpeCArICdBbmltYXRpb24nXSk7XHJcbiAgICAgICAgICAgIHR0U2NvcGUuYW5pbWF0aW9uID0gYW5ndWxhci5pc0RlZmluZWQoYW5pbWF0aW9uKSA/ICEhYW5pbWF0aW9uIDogb3B0aW9ucy5hbmltYXRpb247XHJcblxyXG4gICAgICAgICAgICB2YXIgYXBwZW5kVG9Cb2R5VmFsO1xyXG4gICAgICAgICAgICB2YXIgYXBwZW5kS2V5ID0gcHJlZml4ICsgJ0FwcGVuZFRvQm9keSc7XHJcbiAgICAgICAgICAgIGlmIChhcHBlbmRLZXkgaW4gYXR0cnMgJiYgYXR0cnNbYXBwZW5kS2V5XSA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgYXBwZW5kVG9Cb2R5VmFsID0gdHJ1ZTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICBhcHBlbmRUb0JvZHlWYWwgPSBzY29wZS4kZXZhbChhdHRyc1thcHBlbmRLZXldKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgYXBwZW5kVG9Cb2R5ID0gYW5ndWxhci5pc0RlZmluZWQoYXBwZW5kVG9Cb2R5VmFsKSA/IGFwcGVuZFRvQm9keVZhbCA6IGFwcGVuZFRvQm9keTtcclxuXHJcbiAgICAgICAgICAgIC8vIE1ha2Ugc3VyZSB0b29sdGlwIGlzIGRlc3Ryb3llZCBhbmQgcmVtb3ZlZC5cclxuICAgICAgICAgICAgc2NvcGUuJG9uKCckZGVzdHJveScsIGZ1bmN0aW9uIG9uRGVzdHJveVRvb2x0aXAoKSB7XHJcbiAgICAgICAgICAgICAgdW5yZWdpc3RlclRyaWdnZXJzKCk7XHJcbiAgICAgICAgICAgICAgcmVtb3ZlVG9vbHRpcCgpO1xyXG4gICAgICAgICAgICAgIHR0U2NvcGUgPSBudWxsO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG4gICAgICB9O1xyXG4gICAgfTtcclxuICB9XTtcclxufSlcclxuXHJcbi8vIFRoaXMgaXMgbW9zdGx5IG5nSW5jbHVkZSBjb2RlIGJ1dCB3aXRoIGEgY3VzdG9tIHNjb3BlXHJcbi5kaXJlY3RpdmUoJ3VpYlRvb2x0aXBUZW1wbGF0ZVRyYW5zY2x1ZGUnLCBbXHJcbiAgICAgICAgICckYW5pbWF0ZScsICckc2NlJywgJyRjb21waWxlJywgJyR0ZW1wbGF0ZVJlcXVlc3QnLFxyXG5mdW5jdGlvbiAoJGFuaW1hdGUsICRzY2UsICRjb21waWxlLCAkdGVtcGxhdGVSZXF1ZXN0KSB7XHJcbiAgcmV0dXJuIHtcclxuICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBlbGVtLCBhdHRycykge1xyXG4gICAgICB2YXIgb3JpZ1Njb3BlID0gc2NvcGUuJGV2YWwoYXR0cnMudG9vbHRpcFRlbXBsYXRlVHJhbnNjbHVkZVNjb3BlKTtcclxuXHJcbiAgICAgIHZhciBjaGFuZ2VDb3VudGVyID0gMCxcclxuICAgICAgICBjdXJyZW50U2NvcGUsXHJcbiAgICAgICAgcHJldmlvdXNFbGVtZW50LFxyXG4gICAgICAgIGN1cnJlbnRFbGVtZW50O1xyXG5cclxuICAgICAgdmFyIGNsZWFudXBMYXN0SW5jbHVkZUNvbnRlbnQgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICBpZiAocHJldmlvdXNFbGVtZW50KSB7XHJcbiAgICAgICAgICBwcmV2aW91c0VsZW1lbnQucmVtb3ZlKCk7XHJcbiAgICAgICAgICBwcmV2aW91c0VsZW1lbnQgPSBudWxsO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGN1cnJlbnRTY29wZSkge1xyXG4gICAgICAgICAgY3VycmVudFNjb3BlLiRkZXN0cm95KCk7XHJcbiAgICAgICAgICBjdXJyZW50U2NvcGUgPSBudWxsO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGN1cnJlbnRFbGVtZW50KSB7XHJcbiAgICAgICAgICAkYW5pbWF0ZS5sZWF2ZShjdXJyZW50RWxlbWVudCkudGhlbihmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcHJldmlvdXNFbGVtZW50ID0gbnVsbDtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgcHJldmlvdXNFbGVtZW50ID0gY3VycmVudEVsZW1lbnQ7XHJcbiAgICAgICAgICBjdXJyZW50RWxlbWVudCA9IG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgICB9O1xyXG5cclxuICAgICAgc2NvcGUuJHdhdGNoKCRzY2UucGFyc2VBc1Jlc291cmNlVXJsKGF0dHJzLnVpYlRvb2x0aXBUZW1wbGF0ZVRyYW5zY2x1ZGUpLCBmdW5jdGlvbihzcmMpIHtcclxuICAgICAgICB2YXIgdGhpc0NoYW5nZUlkID0gKytjaGFuZ2VDb3VudGVyO1xyXG5cclxuICAgICAgICBpZiAoc3JjKSB7XHJcbiAgICAgICAgICAvL3NldCB0aGUgMm5kIHBhcmFtIHRvIHRydWUgdG8gaWdub3JlIHRoZSB0ZW1wbGF0ZSByZXF1ZXN0IGVycm9yIHNvIHRoYXQgdGhlIGlubmVyXHJcbiAgICAgICAgICAvL2NvbnRlbnRzIGFuZCBzY29wZSBjYW4gYmUgY2xlYW5lZCB1cC5cclxuICAgICAgICAgICR0ZW1wbGF0ZVJlcXVlc3Qoc3JjLCB0cnVlKS50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzQ2hhbmdlSWQgIT09IGNoYW5nZUNvdW50ZXIpIHsgcmV0dXJuOyB9XHJcbiAgICAgICAgICAgIHZhciBuZXdTY29wZSA9IG9yaWdTY29wZS4kbmV3KCk7XHJcbiAgICAgICAgICAgIHZhciB0ZW1wbGF0ZSA9IHJlc3BvbnNlO1xyXG5cclxuICAgICAgICAgICAgdmFyIGNsb25lID0gJGNvbXBpbGUodGVtcGxhdGUpKG5ld1Njb3BlLCBmdW5jdGlvbihjbG9uZSkge1xyXG4gICAgICAgICAgICAgIGNsZWFudXBMYXN0SW5jbHVkZUNvbnRlbnQoKTtcclxuICAgICAgICAgICAgICAkYW5pbWF0ZS5lbnRlcihjbG9uZSwgZWxlbSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgY3VycmVudFNjb3BlID0gbmV3U2NvcGU7XHJcbiAgICAgICAgICAgIGN1cnJlbnRFbGVtZW50ID0gY2xvbmU7XHJcblxyXG4gICAgICAgICAgICBjdXJyZW50U2NvcGUuJGVtaXQoJyRpbmNsdWRlQ29udGVudExvYWRlZCcsIHNyYyk7XHJcbiAgICAgICAgICB9LCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXNDaGFuZ2VJZCA9PT0gY2hhbmdlQ291bnRlcikge1xyXG4gICAgICAgICAgICAgIGNsZWFudXBMYXN0SW5jbHVkZUNvbnRlbnQoKTtcclxuICAgICAgICAgICAgICBzY29wZS4kZW1pdCgnJGluY2x1ZGVDb250ZW50RXJyb3InLCBzcmMpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICAgIHNjb3BlLiRlbWl0KCckaW5jbHVkZUNvbnRlbnRSZXF1ZXN0ZWQnLCBzcmMpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBjbGVhbnVwTGFzdEluY2x1ZGVDb250ZW50KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIHNjb3BlLiRvbignJGRlc3Ryb3knLCBjbGVhbnVwTGFzdEluY2x1ZGVDb250ZW50KTtcclxuICAgIH1cclxuICB9O1xyXG59XSlcclxuXHJcbi8qKlxyXG4gKiBOb3RlIHRoYXQgaXQncyBpbnRlbnRpb25hbCB0aGF0IHRoZXNlIGNsYXNzZXMgYXJlICpub3QqIGFwcGxpZWQgdGhyb3VnaCAkYW5pbWF0ZS5cclxuICogVGhleSBtdXN0IG5vdCBiZSBhbmltYXRlZCBhcyB0aGV5J3JlIGV4cGVjdGVkIHRvIGJlIHByZXNlbnQgb24gdGhlIHRvb2x0aXAgb25cclxuICogaW5pdGlhbGl6YXRpb24uXHJcbiAqL1xyXG4uZGlyZWN0aXZlKCd1aWJUb29sdGlwQ2xhc3NlcycsIFsnJHVpYlBvc2l0aW9uJywgZnVuY3Rpb24oJHVpYlBvc2l0aW9uKSB7XHJcbiAgcmV0dXJuIHtcclxuICAgIHJlc3RyaWN0OiAnQScsXHJcbiAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxlbWVudCwgYXR0cnMpIHtcclxuICAgICAgLy8gbmVlZCB0byBzZXQgdGhlIHByaW1hcnkgcG9zaXRpb24gc28gdGhlXHJcbiAgICAgIC8vIGFycm93IGhhcyBzcGFjZSBkdXJpbmcgcG9zaXRpb24gbWVhc3VyZS5cclxuICAgICAgLy8gdG9vbHRpcC5wb3NpdGlvblRvb2x0aXAoKVxyXG4gICAgICBpZiAoc2NvcGUucGxhY2VtZW50KSB7XHJcbiAgICAgICAgLy8gLy8gVGhlcmUgYXJlIG5vIHRvcC1sZWZ0IGV0Yy4uLiBjbGFzc2VzXHJcbiAgICAgICAgLy8gLy8gaW4gVFdCUywgc28gd2UgbmVlZCB0aGUgcHJpbWFyeSBwb3NpdGlvbi5cclxuICAgICAgICB2YXIgcG9zaXRpb24gPSAkdWliUG9zaXRpb24ucGFyc2VQbGFjZW1lbnQoc2NvcGUucGxhY2VtZW50KTtcclxuICAgICAgICBlbGVtZW50LmFkZENsYXNzKHBvc2l0aW9uWzBdKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKHNjb3BlLnBvcHVwQ2xhc3MpIHtcclxuICAgICAgICBlbGVtZW50LmFkZENsYXNzKHNjb3BlLnBvcHVwQ2xhc3MpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoc2NvcGUuYW5pbWF0aW9uKSB7XHJcbiAgICAgICAgZWxlbWVudC5hZGRDbGFzcyhhdHRycy50b29sdGlwQW5pbWF0aW9uQ2xhc3MpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfTtcclxufV0pXHJcblxyXG4uZGlyZWN0aXZlKCd1aWJUb29sdGlwUG9wdXAnLCBmdW5jdGlvbigpIHtcclxuICByZXR1cm4ge1xyXG4gICAgcmVzdHJpY3Q6ICdBJyxcclxuICAgIHNjb3BlOiB7IGNvbnRlbnQ6ICdAJyB9LFxyXG4gICAgdGVtcGxhdGVVcmw6ICd1aWIvdGVtcGxhdGUvdG9vbHRpcC90b29sdGlwLXBvcHVwLmh0bWwnXHJcbiAgfTtcclxufSlcclxuXHJcbi5kaXJlY3RpdmUoJ3VpYlRvb2x0aXAnLCBbICckdWliVG9vbHRpcCcsIGZ1bmN0aW9uKCR1aWJUb29sdGlwKSB7XHJcbiAgcmV0dXJuICR1aWJUb29sdGlwKCd1aWJUb29sdGlwJywgJ3Rvb2x0aXAnLCAnbW91c2VlbnRlcicpO1xyXG59XSlcclxuXHJcbi5kaXJlY3RpdmUoJ3VpYlRvb2x0aXBUZW1wbGF0ZVBvcHVwJywgZnVuY3Rpb24oKSB7XHJcbiAgcmV0dXJuIHtcclxuICAgIHJlc3RyaWN0OiAnQScsXHJcbiAgICBzY29wZTogeyBjb250ZW50RXhwOiAnJicsIG9yaWdpblNjb3BlOiAnJicgfSxcclxuICAgIHRlbXBsYXRlVXJsOiAndWliL3RlbXBsYXRlL3Rvb2x0aXAvdG9vbHRpcC10ZW1wbGF0ZS1wb3B1cC5odG1sJ1xyXG4gIH07XHJcbn0pXHJcblxyXG4uZGlyZWN0aXZlKCd1aWJUb29sdGlwVGVtcGxhdGUnLCBbJyR1aWJUb29sdGlwJywgZnVuY3Rpb24oJHVpYlRvb2x0aXApIHtcclxuICByZXR1cm4gJHVpYlRvb2x0aXAoJ3VpYlRvb2x0aXBUZW1wbGF0ZScsICd0b29sdGlwJywgJ21vdXNlZW50ZXInLCB7XHJcbiAgICB1c2VDb250ZW50RXhwOiB0cnVlXHJcbiAgfSk7XHJcbn1dKVxyXG5cclxuLmRpcmVjdGl2ZSgndWliVG9vbHRpcEh0bWxQb3B1cCcsIGZ1bmN0aW9uKCkge1xyXG4gIHJldHVybiB7XHJcbiAgICByZXN0cmljdDogJ0EnLFxyXG4gICAgc2NvcGU6IHsgY29udGVudEV4cDogJyYnIH0sXHJcbiAgICB0ZW1wbGF0ZVVybDogJ3VpYi90ZW1wbGF0ZS90b29sdGlwL3Rvb2x0aXAtaHRtbC1wb3B1cC5odG1sJ1xyXG4gIH07XHJcbn0pXHJcblxyXG4uZGlyZWN0aXZlKCd1aWJUb29sdGlwSHRtbCcsIFsnJHVpYlRvb2x0aXAnLCBmdW5jdGlvbigkdWliVG9vbHRpcCkge1xyXG4gIHJldHVybiAkdWliVG9vbHRpcCgndWliVG9vbHRpcEh0bWwnLCAndG9vbHRpcCcsICdtb3VzZWVudGVyJywge1xyXG4gICAgdXNlQ29udGVudEV4cDogdHJ1ZVxyXG4gIH0pO1xyXG59XSk7XHJcblxyXG4vKipcclxuICogVGhlIGZvbGxvd2luZyBmZWF0dXJlcyBhcmUgc3RpbGwgb3V0c3RhbmRpbmc6IHBvcHVwIGRlbGF5LCBhbmltYXRpb24gYXMgYVxyXG4gKiBmdW5jdGlvbiwgcGxhY2VtZW50IGFzIGEgZnVuY3Rpb24sIGluc2lkZSwgc3VwcG9ydCBmb3IgbW9yZSB0cmlnZ2VycyB0aGFuXHJcbiAqIGp1c3QgbW91c2UgZW50ZXIvbGVhdmUsIGFuZCBzZWxlY3RvciBkZWxlZ2F0YXRpb24uXHJcbiAqL1xyXG5hbmd1bGFyLm1vZHVsZSgndWkuYm9vdHN0cmFwLnBvcG92ZXInLCBbJ3VpLmJvb3RzdHJhcC50b29sdGlwJ10pXHJcblxyXG4uZGlyZWN0aXZlKCd1aWJQb3BvdmVyVGVtcGxhdGVQb3B1cCcsIGZ1bmN0aW9uKCkge1xyXG4gIHJldHVybiB7XHJcbiAgICByZXN0cmljdDogJ0EnLFxyXG4gICAgc2NvcGU6IHsgdWliVGl0bGU6ICdAJywgY29udGVudEV4cDogJyYnLCBvcmlnaW5TY29wZTogJyYnIH0sXHJcbiAgICB0ZW1wbGF0ZVVybDogJ3VpYi90ZW1wbGF0ZS9wb3BvdmVyL3BvcG92ZXItdGVtcGxhdGUuaHRtbCdcclxuICB9O1xyXG59KVxyXG5cclxuLmRpcmVjdGl2ZSgndWliUG9wb3ZlclRlbXBsYXRlJywgWyckdWliVG9vbHRpcCcsIGZ1bmN0aW9uKCR1aWJUb29sdGlwKSB7XHJcbiAgcmV0dXJuICR1aWJUb29sdGlwKCd1aWJQb3BvdmVyVGVtcGxhdGUnLCAncG9wb3ZlcicsICdjbGljaycsIHtcclxuICAgIHVzZUNvbnRlbnRFeHA6IHRydWVcclxuICB9KTtcclxufV0pXHJcblxyXG4uZGlyZWN0aXZlKCd1aWJQb3BvdmVySHRtbFBvcHVwJywgZnVuY3Rpb24oKSB7XHJcbiAgcmV0dXJuIHtcclxuICAgIHJlc3RyaWN0OiAnQScsXHJcbiAgICBzY29wZTogeyBjb250ZW50RXhwOiAnJicsIHVpYlRpdGxlOiAnQCcgfSxcclxuICAgIHRlbXBsYXRlVXJsOiAndWliL3RlbXBsYXRlL3BvcG92ZXIvcG9wb3Zlci1odG1sLmh0bWwnXHJcbiAgfTtcclxufSlcclxuXHJcbi5kaXJlY3RpdmUoJ3VpYlBvcG92ZXJIdG1sJywgWyckdWliVG9vbHRpcCcsIGZ1bmN0aW9uKCR1aWJUb29sdGlwKSB7XHJcbiAgcmV0dXJuICR1aWJUb29sdGlwKCd1aWJQb3BvdmVySHRtbCcsICdwb3BvdmVyJywgJ2NsaWNrJywge1xyXG4gICAgdXNlQ29udGVudEV4cDogdHJ1ZVxyXG4gIH0pO1xyXG59XSlcclxuXHJcbi5kaXJlY3RpdmUoJ3VpYlBvcG92ZXJQb3B1cCcsIGZ1bmN0aW9uKCkge1xyXG4gIHJldHVybiB7XHJcbiAgICByZXN0cmljdDogJ0EnLFxyXG4gICAgc2NvcGU6IHsgdWliVGl0bGU6ICdAJywgY29udGVudDogJ0AnIH0sXHJcbiAgICB0ZW1wbGF0ZVVybDogJ3VpYi90ZW1wbGF0ZS9wb3BvdmVyL3BvcG92ZXIuaHRtbCdcclxuICB9O1xyXG59KVxyXG5cclxuLmRpcmVjdGl2ZSgndWliUG9wb3ZlcicsIFsnJHVpYlRvb2x0aXAnLCBmdW5jdGlvbigkdWliVG9vbHRpcCkge1xyXG4gIHJldHVybiAkdWliVG9vbHRpcCgndWliUG9wb3ZlcicsICdwb3BvdmVyJywgJ2NsaWNrJyk7XHJcbn1dKTtcclxuXHJcbmFuZ3VsYXIubW9kdWxlKCd1aS5ib290c3RyYXAucHJvZ3Jlc3NiYXInLCBbXSlcclxuXHJcbi5jb25zdGFudCgndWliUHJvZ3Jlc3NDb25maWcnLCB7XHJcbiAgYW5pbWF0ZTogdHJ1ZSxcclxuICBtYXg6IDEwMFxyXG59KVxyXG5cclxuLmNvbnRyb2xsZXIoJ1VpYlByb2dyZXNzQ29udHJvbGxlcicsIFsnJHNjb3BlJywgJyRhdHRycycsICd1aWJQcm9ncmVzc0NvbmZpZycsIGZ1bmN0aW9uKCRzY29wZSwgJGF0dHJzLCBwcm9ncmVzc0NvbmZpZykge1xyXG4gIHZhciBzZWxmID0gdGhpcyxcclxuICAgICAgYW5pbWF0ZSA9IGFuZ3VsYXIuaXNEZWZpbmVkKCRhdHRycy5hbmltYXRlKSA/ICRzY29wZS4kcGFyZW50LiRldmFsKCRhdHRycy5hbmltYXRlKSA6IHByb2dyZXNzQ29uZmlnLmFuaW1hdGU7XHJcblxyXG4gIHRoaXMuYmFycyA9IFtdO1xyXG4gICRzY29wZS5tYXggPSBnZXRNYXhPckRlZmF1bHQoKTtcclxuXHJcbiAgdGhpcy5hZGRCYXIgPSBmdW5jdGlvbihiYXIsIGVsZW1lbnQsIGF0dHJzKSB7XHJcbiAgICBpZiAoIWFuaW1hdGUpIHtcclxuICAgICAgZWxlbWVudC5jc3Moeyd0cmFuc2l0aW9uJzogJ25vbmUnfSk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5iYXJzLnB1c2goYmFyKTtcclxuXHJcbiAgICBiYXIubWF4ID0gZ2V0TWF4T3JEZWZhdWx0KCk7XHJcbiAgICBiYXIudGl0bGUgPSBhdHRycyAmJiBhbmd1bGFyLmlzRGVmaW5lZChhdHRycy50aXRsZSkgPyBhdHRycy50aXRsZSA6ICdwcm9ncmVzc2Jhcic7XHJcblxyXG4gICAgYmFyLiR3YXRjaCgndmFsdWUnLCBmdW5jdGlvbih2YWx1ZSkge1xyXG4gICAgICBiYXIucmVjYWxjdWxhdGVQZXJjZW50YWdlKCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBiYXIucmVjYWxjdWxhdGVQZXJjZW50YWdlID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgIHZhciB0b3RhbFBlcmNlbnRhZ2UgPSBzZWxmLmJhcnMucmVkdWNlKGZ1bmN0aW9uKHRvdGFsLCBiYXIpIHtcclxuICAgICAgICBiYXIucGVyY2VudCA9ICsoMTAwICogYmFyLnZhbHVlIC8gYmFyLm1heCkudG9GaXhlZCgyKTtcclxuICAgICAgICByZXR1cm4gdG90YWwgKyBiYXIucGVyY2VudDtcclxuICAgICAgfSwgMCk7XHJcblxyXG4gICAgICBpZiAodG90YWxQZXJjZW50YWdlID4gMTAwKSB7XHJcbiAgICAgICAgYmFyLnBlcmNlbnQgLT0gdG90YWxQZXJjZW50YWdlIC0gMTAwO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIGJhci4kb24oJyRkZXN0cm95JywgZnVuY3Rpb24oKSB7XHJcbiAgICAgIGVsZW1lbnQgPSBudWxsO1xyXG4gICAgICBzZWxmLnJlbW92ZUJhcihiYXIpO1xyXG4gICAgfSk7XHJcbiAgfTtcclxuXHJcbiAgdGhpcy5yZW1vdmVCYXIgPSBmdW5jdGlvbihiYXIpIHtcclxuICAgIHRoaXMuYmFycy5zcGxpY2UodGhpcy5iYXJzLmluZGV4T2YoYmFyKSwgMSk7XHJcbiAgICB0aGlzLmJhcnMuZm9yRWFjaChmdW5jdGlvbiAoYmFyKSB7XHJcbiAgICAgIGJhci5yZWNhbGN1bGF0ZVBlcmNlbnRhZ2UoKTtcclxuICAgIH0pO1xyXG4gIH07XHJcblxyXG4gIC8vJGF0dHJzLiRvYnNlcnZlKCdtYXhQYXJhbScsIGZ1bmN0aW9uKG1heFBhcmFtKSB7XHJcbiAgJHNjb3BlLiR3YXRjaCgnbWF4UGFyYW0nLCBmdW5jdGlvbihtYXhQYXJhbSkge1xyXG4gICAgc2VsZi5iYXJzLmZvckVhY2goZnVuY3Rpb24oYmFyKSB7XHJcbiAgICAgIGJhci5tYXggPSBnZXRNYXhPckRlZmF1bHQoKTtcclxuICAgICAgYmFyLnJlY2FsY3VsYXRlUGVyY2VudGFnZSgpO1xyXG4gICAgfSk7XHJcbiAgfSk7XHJcblxyXG4gIGZ1bmN0aW9uIGdldE1heE9yRGVmYXVsdCAoKSB7XHJcbiAgICByZXR1cm4gYW5ndWxhci5pc0RlZmluZWQoJHNjb3BlLm1heFBhcmFtKSA/ICRzY29wZS5tYXhQYXJhbSA6IHByb2dyZXNzQ29uZmlnLm1heDtcclxuICB9XHJcbn1dKVxyXG5cclxuLmRpcmVjdGl2ZSgndWliUHJvZ3Jlc3MnLCBmdW5jdGlvbigpIHtcclxuICByZXR1cm4ge1xyXG4gICAgcmVwbGFjZTogdHJ1ZSxcclxuICAgIHRyYW5zY2x1ZGU6IHRydWUsXHJcbiAgICBjb250cm9sbGVyOiAnVWliUHJvZ3Jlc3NDb250cm9sbGVyJyxcclxuICAgIHJlcXVpcmU6ICd1aWJQcm9ncmVzcycsXHJcbiAgICBzY29wZToge1xyXG4gICAgICBtYXhQYXJhbTogJz0/bWF4J1xyXG4gICAgfSxcclxuICAgIHRlbXBsYXRlVXJsOiAndWliL3RlbXBsYXRlL3Byb2dyZXNzYmFyL3Byb2dyZXNzLmh0bWwnXHJcbiAgfTtcclxufSlcclxuXHJcbi5kaXJlY3RpdmUoJ3VpYkJhcicsIGZ1bmN0aW9uKCkge1xyXG4gIHJldHVybiB7XHJcbiAgICByZXBsYWNlOiB0cnVlLFxyXG4gICAgdHJhbnNjbHVkZTogdHJ1ZSxcclxuICAgIHJlcXVpcmU6ICdedWliUHJvZ3Jlc3MnLFxyXG4gICAgc2NvcGU6IHtcclxuICAgICAgdmFsdWU6ICc9JyxcclxuICAgICAgdHlwZTogJ0AnXHJcbiAgICB9LFxyXG4gICAgdGVtcGxhdGVVcmw6ICd1aWIvdGVtcGxhdGUvcHJvZ3Jlc3NiYXIvYmFyLmh0bWwnLFxyXG4gICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCBwcm9ncmVzc0N0cmwpIHtcclxuICAgICAgcHJvZ3Jlc3NDdHJsLmFkZEJhcihzY29wZSwgZWxlbWVudCwgYXR0cnMpO1xyXG4gICAgfVxyXG4gIH07XHJcbn0pXHJcblxyXG4uZGlyZWN0aXZlKCd1aWJQcm9ncmVzc2JhcicsIGZ1bmN0aW9uKCkge1xyXG4gIHJldHVybiB7XHJcbiAgICByZXBsYWNlOiB0cnVlLFxyXG4gICAgdHJhbnNjbHVkZTogdHJ1ZSxcclxuICAgIGNvbnRyb2xsZXI6ICdVaWJQcm9ncmVzc0NvbnRyb2xsZXInLFxyXG4gICAgc2NvcGU6IHtcclxuICAgICAgdmFsdWU6ICc9JyxcclxuICAgICAgbWF4UGFyYW06ICc9P21heCcsXHJcbiAgICAgIHR5cGU6ICdAJ1xyXG4gICAgfSxcclxuICAgIHRlbXBsYXRlVXJsOiAndWliL3RlbXBsYXRlL3Byb2dyZXNzYmFyL3Byb2dyZXNzYmFyLmh0bWwnLFxyXG4gICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCBwcm9ncmVzc0N0cmwpIHtcclxuICAgICAgcHJvZ3Jlc3NDdHJsLmFkZEJhcihzY29wZSwgYW5ndWxhci5lbGVtZW50KGVsZW1lbnQuY2hpbGRyZW4oKVswXSksIHt0aXRsZTogYXR0cnMudGl0bGV9KTtcclxuICAgIH1cclxuICB9O1xyXG59KTtcclxuXHJcbmFuZ3VsYXIubW9kdWxlKCd1aS5ib290c3RyYXAucmF0aW5nJywgW10pXHJcblxyXG4uY29uc3RhbnQoJ3VpYlJhdGluZ0NvbmZpZycsIHtcclxuICBtYXg6IDUsXHJcbiAgc3RhdGVPbjogbnVsbCxcclxuICBzdGF0ZU9mZjogbnVsbCxcclxuICBlbmFibGVSZXNldDogdHJ1ZSxcclxuICB0aXRsZXM6IFsnb25lJywgJ3R3bycsICd0aHJlZScsICdmb3VyJywgJ2ZpdmUnXVxyXG59KVxyXG5cclxuLmNvbnRyb2xsZXIoJ1VpYlJhdGluZ0NvbnRyb2xsZXInLCBbJyRzY29wZScsICckYXR0cnMnLCAndWliUmF0aW5nQ29uZmlnJywgZnVuY3Rpb24oJHNjb3BlLCAkYXR0cnMsIHJhdGluZ0NvbmZpZykge1xyXG4gIHZhciBuZ01vZGVsQ3RybCA9IHsgJHNldFZpZXdWYWx1ZTogYW5ndWxhci5ub29wIH0sXHJcbiAgICBzZWxmID0gdGhpcztcclxuXHJcbiAgdGhpcy5pbml0ID0gZnVuY3Rpb24obmdNb2RlbEN0cmxfKSB7XHJcbiAgICBuZ01vZGVsQ3RybCA9IG5nTW9kZWxDdHJsXztcclxuICAgIG5nTW9kZWxDdHJsLiRyZW5kZXIgPSB0aGlzLnJlbmRlcjtcclxuXHJcbiAgICBuZ01vZGVsQ3RybC4kZm9ybWF0dGVycy5wdXNoKGZ1bmN0aW9uKHZhbHVlKSB7XHJcbiAgICAgIGlmIChhbmd1bGFyLmlzTnVtYmVyKHZhbHVlKSAmJiB2YWx1ZSA8PCAwICE9PSB2YWx1ZSkge1xyXG4gICAgICAgIHZhbHVlID0gTWF0aC5yb3VuZCh2YWx1ZSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiB2YWx1ZTtcclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMuc3RhdGVPbiA9IGFuZ3VsYXIuaXNEZWZpbmVkKCRhdHRycy5zdGF0ZU9uKSA/ICRzY29wZS4kcGFyZW50LiRldmFsKCRhdHRycy5zdGF0ZU9uKSA6IHJhdGluZ0NvbmZpZy5zdGF0ZU9uO1xyXG4gICAgdGhpcy5zdGF0ZU9mZiA9IGFuZ3VsYXIuaXNEZWZpbmVkKCRhdHRycy5zdGF0ZU9mZikgPyAkc2NvcGUuJHBhcmVudC4kZXZhbCgkYXR0cnMuc3RhdGVPZmYpIDogcmF0aW5nQ29uZmlnLnN0YXRlT2ZmO1xyXG4gICAgdGhpcy5lbmFibGVSZXNldCA9IGFuZ3VsYXIuaXNEZWZpbmVkKCRhdHRycy5lbmFibGVSZXNldCkgP1xyXG4gICAgICAkc2NvcGUuJHBhcmVudC4kZXZhbCgkYXR0cnMuZW5hYmxlUmVzZXQpIDogcmF0aW5nQ29uZmlnLmVuYWJsZVJlc2V0O1xyXG4gICAgdmFyIHRtcFRpdGxlcyA9IGFuZ3VsYXIuaXNEZWZpbmVkKCRhdHRycy50aXRsZXMpID8gJHNjb3BlLiRwYXJlbnQuJGV2YWwoJGF0dHJzLnRpdGxlcykgOiByYXRpbmdDb25maWcudGl0bGVzO1xyXG4gICAgdGhpcy50aXRsZXMgPSBhbmd1bGFyLmlzQXJyYXkodG1wVGl0bGVzKSAmJiB0bXBUaXRsZXMubGVuZ3RoID4gMCA/XHJcbiAgICAgIHRtcFRpdGxlcyA6IHJhdGluZ0NvbmZpZy50aXRsZXM7XHJcblxyXG4gICAgdmFyIHJhdGluZ1N0YXRlcyA9IGFuZ3VsYXIuaXNEZWZpbmVkKCRhdHRycy5yYXRpbmdTdGF0ZXMpID9cclxuICAgICAgJHNjb3BlLiRwYXJlbnQuJGV2YWwoJGF0dHJzLnJhdGluZ1N0YXRlcykgOlxyXG4gICAgICBuZXcgQXJyYXkoYW5ndWxhci5pc0RlZmluZWQoJGF0dHJzLm1heCkgPyAkc2NvcGUuJHBhcmVudC4kZXZhbCgkYXR0cnMubWF4KSA6IHJhdGluZ0NvbmZpZy5tYXgpO1xyXG4gICAgJHNjb3BlLnJhbmdlID0gdGhpcy5idWlsZFRlbXBsYXRlT2JqZWN0cyhyYXRpbmdTdGF0ZXMpO1xyXG4gIH07XHJcblxyXG4gIHRoaXMuYnVpbGRUZW1wbGF0ZU9iamVjdHMgPSBmdW5jdGlvbihzdGF0ZXMpIHtcclxuICAgIGZvciAodmFyIGkgPSAwLCBuID0gc3RhdGVzLmxlbmd0aDsgaSA8IG47IGkrKykge1xyXG4gICAgICBzdGF0ZXNbaV0gPSBhbmd1bGFyLmV4dGVuZCh7IGluZGV4OiBpIH0sIHsgc3RhdGVPbjogdGhpcy5zdGF0ZU9uLCBzdGF0ZU9mZjogdGhpcy5zdGF0ZU9mZiwgdGl0bGU6IHRoaXMuZ2V0VGl0bGUoaSkgfSwgc3RhdGVzW2ldKTtcclxuICAgIH1cclxuICAgIHJldHVybiBzdGF0ZXM7XHJcbiAgfTtcclxuXHJcbiAgdGhpcy5nZXRUaXRsZSA9IGZ1bmN0aW9uKGluZGV4KSB7XHJcbiAgICBpZiAoaW5kZXggPj0gdGhpcy50aXRsZXMubGVuZ3RoKSB7XHJcbiAgICAgIHJldHVybiBpbmRleCArIDE7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRoaXMudGl0bGVzW2luZGV4XTtcclxuICB9O1xyXG5cclxuICAkc2NvcGUucmF0ZSA9IGZ1bmN0aW9uKHZhbHVlKSB7XHJcbiAgICBpZiAoISRzY29wZS5yZWFkb25seSAmJiB2YWx1ZSA+PSAwICYmIHZhbHVlIDw9ICRzY29wZS5yYW5nZS5sZW5ndGgpIHtcclxuICAgICAgdmFyIG5ld1ZpZXdWYWx1ZSA9IHNlbGYuZW5hYmxlUmVzZXQgJiYgbmdNb2RlbEN0cmwuJHZpZXdWYWx1ZSA9PT0gdmFsdWUgPyAwIDogdmFsdWU7XHJcbiAgICAgIG5nTW9kZWxDdHJsLiRzZXRWaWV3VmFsdWUobmV3Vmlld1ZhbHVlKTtcclxuICAgICAgbmdNb2RlbEN0cmwuJHJlbmRlcigpO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gICRzY29wZS5lbnRlciA9IGZ1bmN0aW9uKHZhbHVlKSB7XHJcbiAgICBpZiAoISRzY29wZS5yZWFkb25seSkge1xyXG4gICAgICAkc2NvcGUudmFsdWUgPSB2YWx1ZTtcclxuICAgIH1cclxuICAgICRzY29wZS5vbkhvdmVyKHt2YWx1ZTogdmFsdWV9KTtcclxuICB9O1xyXG5cclxuICAkc2NvcGUucmVzZXQgPSBmdW5jdGlvbigpIHtcclxuICAgICRzY29wZS52YWx1ZSA9IG5nTW9kZWxDdHJsLiR2aWV3VmFsdWU7XHJcbiAgICAkc2NvcGUub25MZWF2ZSgpO1xyXG4gIH07XHJcblxyXG4gICRzY29wZS5vbktleWRvd24gPSBmdW5jdGlvbihldnQpIHtcclxuICAgIGlmICgvKDM3fDM4fDM5fDQwKS8udGVzdChldnQud2hpY2gpKSB7XHJcbiAgICAgIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICBldnQuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICRzY29wZS5yYXRlKCRzY29wZS52YWx1ZSArIChldnQud2hpY2ggPT09IDM4IHx8IGV2dC53aGljaCA9PT0gMzkgPyAxIDogLTEpKTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICB0aGlzLnJlbmRlciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgJHNjb3BlLnZhbHVlID0gbmdNb2RlbEN0cmwuJHZpZXdWYWx1ZTtcclxuICAgICRzY29wZS50aXRsZSA9IHNlbGYuZ2V0VGl0bGUoJHNjb3BlLnZhbHVlIC0gMSk7XHJcbiAgfTtcclxufV0pXHJcblxyXG4uZGlyZWN0aXZlKCd1aWJSYXRpbmcnLCBmdW5jdGlvbigpIHtcclxuICByZXR1cm4ge1xyXG4gICAgcmVxdWlyZTogWyd1aWJSYXRpbmcnLCAnbmdNb2RlbCddLFxyXG4gICAgcmVzdHJpY3Q6ICdBJyxcclxuICAgIHNjb3BlOiB7XHJcbiAgICAgIHJlYWRvbmx5OiAnPT9yZWFkT25seScsXHJcbiAgICAgIG9uSG92ZXI6ICcmJyxcclxuICAgICAgb25MZWF2ZTogJyYnXHJcbiAgICB9LFxyXG4gICAgY29udHJvbGxlcjogJ1VpYlJhdGluZ0NvbnRyb2xsZXInLFxyXG4gICAgdGVtcGxhdGVVcmw6ICd1aWIvdGVtcGxhdGUvcmF0aW5nL3JhdGluZy5odG1sJyxcclxuICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBlbGVtZW50LCBhdHRycywgY3RybHMpIHtcclxuICAgICAgdmFyIHJhdGluZ0N0cmwgPSBjdHJsc1swXSwgbmdNb2RlbEN0cmwgPSBjdHJsc1sxXTtcclxuICAgICAgcmF0aW5nQ3RybC5pbml0KG5nTW9kZWxDdHJsKTtcclxuICAgIH1cclxuICB9O1xyXG59KTtcclxuXHJcbmFuZ3VsYXIubW9kdWxlKCd1aS5ib290c3RyYXAudGFicycsIFtdKVxyXG5cclxuLmNvbnRyb2xsZXIoJ1VpYlRhYnNldENvbnRyb2xsZXInLCBbJyRzY29wZScsIGZ1bmN0aW9uICgkc2NvcGUpIHtcclxuICB2YXIgY3RybCA9IHRoaXMsXHJcbiAgICBvbGRJbmRleDtcclxuICBjdHJsLnRhYnMgPSBbXTtcclxuXHJcbiAgY3RybC5zZWxlY3QgPSBmdW5jdGlvbihpbmRleCwgZXZ0KSB7XHJcbiAgICBpZiAoIWRlc3Ryb3llZCkge1xyXG4gICAgICB2YXIgcHJldmlvdXNJbmRleCA9IGZpbmRUYWJJbmRleChvbGRJbmRleCk7XHJcbiAgICAgIHZhciBwcmV2aW91c1NlbGVjdGVkID0gY3RybC50YWJzW3ByZXZpb3VzSW5kZXhdO1xyXG4gICAgICBpZiAocHJldmlvdXNTZWxlY3RlZCkge1xyXG4gICAgICAgIHByZXZpb3VzU2VsZWN0ZWQudGFiLm9uRGVzZWxlY3Qoe1xyXG4gICAgICAgICAgJGV2ZW50OiBldnQsXHJcbiAgICAgICAgICAkc2VsZWN0ZWRJbmRleDogaW5kZXhcclxuICAgICAgICB9KTtcclxuICAgICAgICBpZiAoZXZ0ICYmIGV2dC5pc0RlZmF1bHRQcmV2ZW50ZWQoKSkge1xyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBwcmV2aW91c1NlbGVjdGVkLnRhYi5hY3RpdmUgPSBmYWxzZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgdmFyIHNlbGVjdGVkID0gY3RybC50YWJzW2luZGV4XTtcclxuICAgICAgaWYgKHNlbGVjdGVkKSB7XHJcbiAgICAgICAgc2VsZWN0ZWQudGFiLm9uU2VsZWN0KHtcclxuICAgICAgICAgICRldmVudDogZXZ0XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgc2VsZWN0ZWQudGFiLmFjdGl2ZSA9IHRydWU7XHJcbiAgICAgICAgY3RybC5hY3RpdmUgPSBzZWxlY3RlZC5pbmRleDtcclxuICAgICAgICBvbGRJbmRleCA9IHNlbGVjdGVkLmluZGV4O1xyXG4gICAgICB9IGVsc2UgaWYgKCFzZWxlY3RlZCAmJiBhbmd1bGFyLmlzRGVmaW5lZChvbGRJbmRleCkpIHtcclxuICAgICAgICBjdHJsLmFjdGl2ZSA9IG51bGw7XHJcbiAgICAgICAgb2xkSW5kZXggPSBudWxsO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgY3RybC5hZGRUYWIgPSBmdW5jdGlvbiBhZGRUYWIodGFiKSB7XHJcbiAgICBjdHJsLnRhYnMucHVzaCh7XHJcbiAgICAgIHRhYjogdGFiLFxyXG4gICAgICBpbmRleDogdGFiLmluZGV4XHJcbiAgICB9KTtcclxuICAgIGN0cmwudGFicy5zb3J0KGZ1bmN0aW9uKHQxLCB0Mikge1xyXG4gICAgICBpZiAodDEuaW5kZXggPiB0Mi5pbmRleCkge1xyXG4gICAgICAgIHJldHVybiAxO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAodDEuaW5kZXggPCB0Mi5pbmRleCkge1xyXG4gICAgICAgIHJldHVybiAtMTtcclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIDA7XHJcbiAgICB9KTtcclxuXHJcbiAgICBpZiAodGFiLmluZGV4ID09PSBjdHJsLmFjdGl2ZSB8fCAhYW5ndWxhci5pc0RlZmluZWQoY3RybC5hY3RpdmUpICYmIGN0cmwudGFicy5sZW5ndGggPT09IDEpIHtcclxuICAgICAgdmFyIG5ld0FjdGl2ZUluZGV4ID0gZmluZFRhYkluZGV4KHRhYi5pbmRleCk7XHJcbiAgICAgIGN0cmwuc2VsZWN0KG5ld0FjdGl2ZUluZGV4KTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICBjdHJsLnJlbW92ZVRhYiA9IGZ1bmN0aW9uIHJlbW92ZVRhYih0YWIpIHtcclxuICAgIHZhciBpbmRleDtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY3RybC50YWJzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIGlmIChjdHJsLnRhYnNbaV0udGFiID09PSB0YWIpIHtcclxuICAgICAgICBpbmRleCA9IGk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpZiAoY3RybC50YWJzW2luZGV4XS5pbmRleCA9PT0gY3RybC5hY3RpdmUpIHtcclxuICAgICAgdmFyIG5ld0FjdGl2ZVRhYkluZGV4ID0gaW5kZXggPT09IGN0cmwudGFicy5sZW5ndGggLSAxID9cclxuICAgICAgICBpbmRleCAtIDEgOiBpbmRleCArIDEgJSBjdHJsLnRhYnMubGVuZ3RoO1xyXG4gICAgICBjdHJsLnNlbGVjdChuZXdBY3RpdmVUYWJJbmRleCk7XHJcbiAgICB9XHJcblxyXG4gICAgY3RybC50YWJzLnNwbGljZShpbmRleCwgMSk7XHJcbiAgfTtcclxuXHJcbiAgJHNjb3BlLiR3YXRjaCgndGFic2V0LmFjdGl2ZScsIGZ1bmN0aW9uKHZhbCkge1xyXG4gICAgaWYgKGFuZ3VsYXIuaXNEZWZpbmVkKHZhbCkgJiYgdmFsICE9PSBvbGRJbmRleCkge1xyXG4gICAgICBjdHJsLnNlbGVjdChmaW5kVGFiSW5kZXgodmFsKSk7XHJcbiAgICB9XHJcbiAgfSk7XHJcblxyXG4gIHZhciBkZXN0cm95ZWQ7XHJcbiAgJHNjb3BlLiRvbignJGRlc3Ryb3knLCBmdW5jdGlvbigpIHtcclxuICAgIGRlc3Ryb3llZCA9IHRydWU7XHJcbiAgfSk7XHJcblxyXG4gIGZ1bmN0aW9uIGZpbmRUYWJJbmRleChpbmRleCkge1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjdHJsLnRhYnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgaWYgKGN0cmwudGFic1tpXS5pbmRleCA9PT0gaW5kZXgpIHtcclxuICAgICAgICByZXR1cm4gaTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxufV0pXHJcblxyXG4uZGlyZWN0aXZlKCd1aWJUYWJzZXQnLCBmdW5jdGlvbigpIHtcclxuICByZXR1cm4ge1xyXG4gICAgdHJhbnNjbHVkZTogdHJ1ZSxcclxuICAgIHJlcGxhY2U6IHRydWUsXHJcbiAgICBzY29wZToge30sXHJcbiAgICBiaW5kVG9Db250cm9sbGVyOiB7XHJcbiAgICAgIGFjdGl2ZTogJz0/JyxcclxuICAgICAgdHlwZTogJ0AnXHJcbiAgICB9LFxyXG4gICAgY29udHJvbGxlcjogJ1VpYlRhYnNldENvbnRyb2xsZXInLFxyXG4gICAgY29udHJvbGxlckFzOiAndGFic2V0JyxcclxuICAgIHRlbXBsYXRlVXJsOiBmdW5jdGlvbihlbGVtZW50LCBhdHRycykge1xyXG4gICAgICByZXR1cm4gYXR0cnMudGVtcGxhdGVVcmwgfHwgJ3VpYi90ZW1wbGF0ZS90YWJzL3RhYnNldC5odG1sJztcclxuICAgIH0sXHJcbiAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxlbWVudCwgYXR0cnMpIHtcclxuICAgICAgc2NvcGUudmVydGljYWwgPSBhbmd1bGFyLmlzRGVmaW5lZChhdHRycy52ZXJ0aWNhbCkgP1xyXG4gICAgICAgIHNjb3BlLiRwYXJlbnQuJGV2YWwoYXR0cnMudmVydGljYWwpIDogZmFsc2U7XHJcbiAgICAgIHNjb3BlLmp1c3RpZmllZCA9IGFuZ3VsYXIuaXNEZWZpbmVkKGF0dHJzLmp1c3RpZmllZCkgP1xyXG4gICAgICAgIHNjb3BlLiRwYXJlbnQuJGV2YWwoYXR0cnMuanVzdGlmaWVkKSA6IGZhbHNlO1xyXG4gICAgfVxyXG4gIH07XHJcbn0pXHJcblxyXG4uZGlyZWN0aXZlKCd1aWJUYWInLCBbJyRwYXJzZScsIGZ1bmN0aW9uKCRwYXJzZSkge1xyXG4gIHJldHVybiB7XHJcbiAgICByZXF1aXJlOiAnXnVpYlRhYnNldCcsXHJcbiAgICByZXBsYWNlOiB0cnVlLFxyXG4gICAgdGVtcGxhdGVVcmw6IGZ1bmN0aW9uKGVsZW1lbnQsIGF0dHJzKSB7XHJcbiAgICAgIHJldHVybiBhdHRycy50ZW1wbGF0ZVVybCB8fCAndWliL3RlbXBsYXRlL3RhYnMvdGFiLmh0bWwnO1xyXG4gICAgfSxcclxuICAgIHRyYW5zY2x1ZGU6IHRydWUsXHJcbiAgICBzY29wZToge1xyXG4gICAgICBoZWFkaW5nOiAnQCcsXHJcbiAgICAgIGluZGV4OiAnPT8nLFxyXG4gICAgICBjbGFzc2VzOiAnQD8nLFxyXG4gICAgICBvblNlbGVjdDogJyZzZWxlY3QnLCAvL1RoaXMgY2FsbGJhY2sgaXMgY2FsbGVkIGluIGNvbnRlbnRIZWFkaW5nVHJhbnNjbHVkZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIC8vb25jZSBpdCBpbnNlcnRzIHRoZSB0YWIncyBjb250ZW50IGludG8gdGhlIGRvbVxyXG4gICAgICBvbkRlc2VsZWN0OiAnJmRlc2VsZWN0J1xyXG4gICAgfSxcclxuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAvL0VtcHR5IGNvbnRyb2xsZXIgc28gb3RoZXIgZGlyZWN0aXZlcyBjYW4gcmVxdWlyZSBiZWluZyAndW5kZXInIGEgdGFiXHJcbiAgICB9LFxyXG4gICAgY29udHJvbGxlckFzOiAndGFiJyxcclxuICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBlbG0sIGF0dHJzLCB0YWJzZXRDdHJsLCB0cmFuc2NsdWRlKSB7XHJcbiAgICAgIHNjb3BlLmRpc2FibGVkID0gZmFsc2U7XHJcbiAgICAgIGlmIChhdHRycy5kaXNhYmxlKSB7XHJcbiAgICAgICAgc2NvcGUuJHBhcmVudC4kd2F0Y2goJHBhcnNlKGF0dHJzLmRpc2FibGUpLCBmdW5jdGlvbih2YWx1ZSkge1xyXG4gICAgICAgICAgc2NvcGUuZGlzYWJsZWQgPSAhISB2YWx1ZTtcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKGFuZ3VsYXIuaXNVbmRlZmluZWQoYXR0cnMuaW5kZXgpKSB7XHJcbiAgICAgICAgaWYgKHRhYnNldEN0cmwudGFicyAmJiB0YWJzZXRDdHJsLnRhYnMubGVuZ3RoKSB7XHJcbiAgICAgICAgICBzY29wZS5pbmRleCA9IE1hdGgubWF4LmFwcGx5KG51bGwsIHRhYnNldEN0cmwudGFicy5tYXAoZnVuY3Rpb24odCkgeyByZXR1cm4gdC5pbmRleDsgfSkpICsgMTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgc2NvcGUuaW5kZXggPSAwO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKGFuZ3VsYXIuaXNVbmRlZmluZWQoYXR0cnMuY2xhc3NlcykpIHtcclxuICAgICAgICBzY29wZS5jbGFzc2VzID0gJyc7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHNjb3BlLnNlbGVjdCA9IGZ1bmN0aW9uKGV2dCkge1xyXG4gICAgICAgIGlmICghc2NvcGUuZGlzYWJsZWQpIHtcclxuICAgICAgICAgIHZhciBpbmRleDtcclxuICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGFic2V0Q3RybC50YWJzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGlmICh0YWJzZXRDdHJsLnRhYnNbaV0udGFiID09PSBzY29wZSkge1xyXG4gICAgICAgICAgICAgIGluZGV4ID0gaTtcclxuICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIHRhYnNldEN0cmwuc2VsZWN0KGluZGV4LCBldnQpO1xyXG4gICAgICAgIH1cclxuICAgICAgfTtcclxuXHJcbiAgICAgIHRhYnNldEN0cmwuYWRkVGFiKHNjb3BlKTtcclxuICAgICAgc2NvcGUuJG9uKCckZGVzdHJveScsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRhYnNldEN0cmwucmVtb3ZlVGFiKHNjb3BlKTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICAvL1dlIG5lZWQgdG8gdHJhbnNjbHVkZSBsYXRlciwgb25jZSB0aGUgY29udGVudCBjb250YWluZXIgaXMgcmVhZHkuXHJcbiAgICAgIC8vd2hlbiB0aGlzIGxpbmsgaGFwcGVucywgd2UncmUgaW5zaWRlIGEgdGFiIGhlYWRpbmcuXHJcbiAgICAgIHNjb3BlLiR0cmFuc2NsdWRlRm4gPSB0cmFuc2NsdWRlO1xyXG4gICAgfVxyXG4gIH07XHJcbn1dKVxyXG5cclxuLmRpcmVjdGl2ZSgndWliVGFiSGVhZGluZ1RyYW5zY2x1ZGUnLCBmdW5jdGlvbigpIHtcclxuICByZXR1cm4ge1xyXG4gICAgcmVzdHJpY3Q6ICdBJyxcclxuICAgIHJlcXVpcmU6ICdedWliVGFiJyxcclxuICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBlbG0pIHtcclxuICAgICAgc2NvcGUuJHdhdGNoKCdoZWFkaW5nRWxlbWVudCcsIGZ1bmN0aW9uIHVwZGF0ZUhlYWRpbmdFbGVtZW50KGhlYWRpbmcpIHtcclxuICAgICAgICBpZiAoaGVhZGluZykge1xyXG4gICAgICAgICAgZWxtLmh0bWwoJycpO1xyXG4gICAgICAgICAgZWxtLmFwcGVuZChoZWFkaW5nKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH07XHJcbn0pXHJcblxyXG4uZGlyZWN0aXZlKCd1aWJUYWJDb250ZW50VHJhbnNjbHVkZScsIGZ1bmN0aW9uKCkge1xyXG4gIHJldHVybiB7XHJcbiAgICByZXN0cmljdDogJ0EnLFxyXG4gICAgcmVxdWlyZTogJ151aWJUYWJzZXQnLFxyXG4gICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsbSwgYXR0cnMpIHtcclxuICAgICAgdmFyIHRhYiA9IHNjb3BlLiRldmFsKGF0dHJzLnVpYlRhYkNvbnRlbnRUcmFuc2NsdWRlKS50YWI7XHJcblxyXG4gICAgICAvL05vdyBvdXIgdGFiIGlzIHJlYWR5IHRvIGJlIHRyYW5zY2x1ZGVkOiBib3RoIHRoZSB0YWIgaGVhZGluZyBhcmVhXHJcbiAgICAgIC8vYW5kIHRoZSB0YWIgY29udGVudCBhcmVhIGFyZSBsb2FkZWQuICBUcmFuc2NsdWRlICdlbSBib3RoLlxyXG4gICAgICB0YWIuJHRyYW5zY2x1ZGVGbih0YWIuJHBhcmVudCwgZnVuY3Rpb24oY29udGVudHMpIHtcclxuICAgICAgICBhbmd1bGFyLmZvckVhY2goY29udGVudHMsIGZ1bmN0aW9uKG5vZGUpIHtcclxuICAgICAgICAgIGlmIChpc1RhYkhlYWRpbmcobm9kZSkpIHtcclxuICAgICAgICAgICAgLy9MZXQgdGFiSGVhZGluZ1RyYW5zY2x1ZGUga25vdy5cclxuICAgICAgICAgICAgdGFiLmhlYWRpbmdFbGVtZW50ID0gbm9kZTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGVsbS5hcHBlbmQobm9kZSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIGZ1bmN0aW9uIGlzVGFiSGVhZGluZyhub2RlKSB7XHJcbiAgICByZXR1cm4gbm9kZS50YWdOYW1lICYmIChcclxuICAgICAgbm9kZS5oYXNBdHRyaWJ1dGUoJ3VpYi10YWItaGVhZGluZycpIHx8XHJcbiAgICAgIG5vZGUuaGFzQXR0cmlidXRlKCdkYXRhLXVpYi10YWItaGVhZGluZycpIHx8XHJcbiAgICAgIG5vZGUuaGFzQXR0cmlidXRlKCd4LXVpYi10YWItaGVhZGluZycpIHx8XHJcbiAgICAgIG5vZGUudGFnTmFtZS50b0xvd2VyQ2FzZSgpID09PSAndWliLXRhYi1oZWFkaW5nJyB8fFxyXG4gICAgICBub2RlLnRhZ05hbWUudG9Mb3dlckNhc2UoKSA9PT0gJ2RhdGEtdWliLXRhYi1oZWFkaW5nJyB8fFxyXG4gICAgICBub2RlLnRhZ05hbWUudG9Mb3dlckNhc2UoKSA9PT0gJ3gtdWliLXRhYi1oZWFkaW5nJyB8fFxyXG4gICAgICBub2RlLnRhZ05hbWUudG9Mb3dlckNhc2UoKSA9PT0gJ3VpYjp0YWItaGVhZGluZydcclxuICAgICk7XHJcbiAgfVxyXG59KTtcclxuXHJcbmFuZ3VsYXIubW9kdWxlKCd1aS5ib290c3RyYXAudGltZXBpY2tlcicsIFtdKVxyXG5cclxuLmNvbnN0YW50KCd1aWJUaW1lcGlja2VyQ29uZmlnJywge1xyXG4gIGhvdXJTdGVwOiAxLFxyXG4gIG1pbnV0ZVN0ZXA6IDEsXHJcbiAgc2Vjb25kU3RlcDogMSxcclxuICBzaG93TWVyaWRpYW46IHRydWUsXHJcbiAgc2hvd1NlY29uZHM6IGZhbHNlLFxyXG4gIG1lcmlkaWFuczogbnVsbCxcclxuICByZWFkb25seUlucHV0OiBmYWxzZSxcclxuICBtb3VzZXdoZWVsOiB0cnVlLFxyXG4gIGFycm93a2V5czogdHJ1ZSxcclxuICBzaG93U3Bpbm5lcnM6IHRydWUsXHJcbiAgdGVtcGxhdGVVcmw6ICd1aWIvdGVtcGxhdGUvdGltZXBpY2tlci90aW1lcGlja2VyLmh0bWwnXHJcbn0pXHJcblxyXG4uY29udHJvbGxlcignVWliVGltZXBpY2tlckNvbnRyb2xsZXInLCBbJyRzY29wZScsICckZWxlbWVudCcsICckYXR0cnMnLCAnJHBhcnNlJywgJyRsb2cnLCAnJGxvY2FsZScsICd1aWJUaW1lcGlja2VyQ29uZmlnJywgZnVuY3Rpb24oJHNjb3BlLCAkZWxlbWVudCwgJGF0dHJzLCAkcGFyc2UsICRsb2csICRsb2NhbGUsIHRpbWVwaWNrZXJDb25maWcpIHtcclxuICB2YXIgaG91cnNNb2RlbEN0cmwsIG1pbnV0ZXNNb2RlbEN0cmwsIHNlY29uZHNNb2RlbEN0cmw7XHJcbiAgdmFyIHNlbGVjdGVkID0gbmV3IERhdGUoKSxcclxuICAgIHdhdGNoZXJzID0gW10sXHJcbiAgICBuZ01vZGVsQ3RybCA9IHsgJHNldFZpZXdWYWx1ZTogYW5ndWxhci5ub29wIH0sIC8vIG51bGxNb2RlbEN0cmxcclxuICAgIG1lcmlkaWFucyA9IGFuZ3VsYXIuaXNEZWZpbmVkKCRhdHRycy5tZXJpZGlhbnMpID8gJHNjb3BlLiRwYXJlbnQuJGV2YWwoJGF0dHJzLm1lcmlkaWFucykgOiB0aW1lcGlja2VyQ29uZmlnLm1lcmlkaWFucyB8fCAkbG9jYWxlLkRBVEVUSU1FX0ZPUk1BVFMuQU1QTVMsXHJcbiAgICBwYWRIb3VycyA9IGFuZ3VsYXIuaXNEZWZpbmVkKCRhdHRycy5wYWRIb3VycykgPyAkc2NvcGUuJHBhcmVudC4kZXZhbCgkYXR0cnMucGFkSG91cnMpIDogdHJ1ZTtcclxuXHJcbiAgJHNjb3BlLnRhYmluZGV4ID0gYW5ndWxhci5pc0RlZmluZWQoJGF0dHJzLnRhYmluZGV4KSA/ICRhdHRycy50YWJpbmRleCA6IDA7XHJcbiAgJGVsZW1lbnQucmVtb3ZlQXR0cigndGFiaW5kZXgnKTtcclxuXHJcbiAgdGhpcy5pbml0ID0gZnVuY3Rpb24obmdNb2RlbEN0cmxfLCBpbnB1dHMpIHtcclxuICAgIG5nTW9kZWxDdHJsID0gbmdNb2RlbEN0cmxfO1xyXG4gICAgbmdNb2RlbEN0cmwuJHJlbmRlciA9IHRoaXMucmVuZGVyO1xyXG5cclxuICAgIG5nTW9kZWxDdHJsLiRmb3JtYXR0ZXJzLnVuc2hpZnQoZnVuY3Rpb24obW9kZWxWYWx1ZSkge1xyXG4gICAgICByZXR1cm4gbW9kZWxWYWx1ZSA/IG5ldyBEYXRlKG1vZGVsVmFsdWUpIDogbnVsbDtcclxuICAgIH0pO1xyXG5cclxuICAgIHZhciBob3Vyc0lucHV0RWwgPSBpbnB1dHMuZXEoMCksXHJcbiAgICAgICAgbWludXRlc0lucHV0RWwgPSBpbnB1dHMuZXEoMSksXHJcbiAgICAgICAgc2Vjb25kc0lucHV0RWwgPSBpbnB1dHMuZXEoMik7XHJcblxyXG4gICAgaG91cnNNb2RlbEN0cmwgPSBob3Vyc0lucHV0RWwuY29udHJvbGxlcignbmdNb2RlbCcpO1xyXG4gICAgbWludXRlc01vZGVsQ3RybCA9IG1pbnV0ZXNJbnB1dEVsLmNvbnRyb2xsZXIoJ25nTW9kZWwnKTtcclxuICAgIHNlY29uZHNNb2RlbEN0cmwgPSBzZWNvbmRzSW5wdXRFbC5jb250cm9sbGVyKCduZ01vZGVsJyk7XHJcblxyXG4gICAgdmFyIG1vdXNld2hlZWwgPSBhbmd1bGFyLmlzRGVmaW5lZCgkYXR0cnMubW91c2V3aGVlbCkgPyAkc2NvcGUuJHBhcmVudC4kZXZhbCgkYXR0cnMubW91c2V3aGVlbCkgOiB0aW1lcGlja2VyQ29uZmlnLm1vdXNld2hlZWw7XHJcblxyXG4gICAgaWYgKG1vdXNld2hlZWwpIHtcclxuICAgICAgdGhpcy5zZXR1cE1vdXNld2hlZWxFdmVudHMoaG91cnNJbnB1dEVsLCBtaW51dGVzSW5wdXRFbCwgc2Vjb25kc0lucHV0RWwpO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBhcnJvd2tleXMgPSBhbmd1bGFyLmlzRGVmaW5lZCgkYXR0cnMuYXJyb3drZXlzKSA/ICRzY29wZS4kcGFyZW50LiRldmFsKCRhdHRycy5hcnJvd2tleXMpIDogdGltZXBpY2tlckNvbmZpZy5hcnJvd2tleXM7XHJcbiAgICBpZiAoYXJyb3drZXlzKSB7XHJcbiAgICAgIHRoaXMuc2V0dXBBcnJvd2tleUV2ZW50cyhob3Vyc0lucHV0RWwsIG1pbnV0ZXNJbnB1dEVsLCBzZWNvbmRzSW5wdXRFbCk7XHJcbiAgICB9XHJcblxyXG4gICAgJHNjb3BlLnJlYWRvbmx5SW5wdXQgPSBhbmd1bGFyLmlzRGVmaW5lZCgkYXR0cnMucmVhZG9ubHlJbnB1dCkgPyAkc2NvcGUuJHBhcmVudC4kZXZhbCgkYXR0cnMucmVhZG9ubHlJbnB1dCkgOiB0aW1lcGlja2VyQ29uZmlnLnJlYWRvbmx5SW5wdXQ7XHJcbiAgICB0aGlzLnNldHVwSW5wdXRFdmVudHMoaG91cnNJbnB1dEVsLCBtaW51dGVzSW5wdXRFbCwgc2Vjb25kc0lucHV0RWwpO1xyXG4gIH07XHJcblxyXG4gIHZhciBob3VyU3RlcCA9IHRpbWVwaWNrZXJDb25maWcuaG91clN0ZXA7XHJcbiAgaWYgKCRhdHRycy5ob3VyU3RlcCkge1xyXG4gICAgd2F0Y2hlcnMucHVzaCgkc2NvcGUuJHBhcmVudC4kd2F0Y2goJHBhcnNlKCRhdHRycy5ob3VyU3RlcCksIGZ1bmN0aW9uKHZhbHVlKSB7XHJcbiAgICAgIGhvdXJTdGVwID0gK3ZhbHVlO1xyXG4gICAgfSkpO1xyXG4gIH1cclxuXHJcbiAgdmFyIG1pbnV0ZVN0ZXAgPSB0aW1lcGlja2VyQ29uZmlnLm1pbnV0ZVN0ZXA7XHJcbiAgaWYgKCRhdHRycy5taW51dGVTdGVwKSB7XHJcbiAgICB3YXRjaGVycy5wdXNoKCRzY29wZS4kcGFyZW50LiR3YXRjaCgkcGFyc2UoJGF0dHJzLm1pbnV0ZVN0ZXApLCBmdW5jdGlvbih2YWx1ZSkge1xyXG4gICAgICBtaW51dGVTdGVwID0gK3ZhbHVlO1xyXG4gICAgfSkpO1xyXG4gIH1cclxuXHJcbiAgdmFyIG1pbjtcclxuICB3YXRjaGVycy5wdXNoKCRzY29wZS4kcGFyZW50LiR3YXRjaCgkcGFyc2UoJGF0dHJzLm1pbiksIGZ1bmN0aW9uKHZhbHVlKSB7XHJcbiAgICB2YXIgZHQgPSBuZXcgRGF0ZSh2YWx1ZSk7XHJcbiAgICBtaW4gPSBpc05hTihkdCkgPyB1bmRlZmluZWQgOiBkdDtcclxuICB9KSk7XHJcblxyXG4gIHZhciBtYXg7XHJcbiAgd2F0Y2hlcnMucHVzaCgkc2NvcGUuJHBhcmVudC4kd2F0Y2goJHBhcnNlKCRhdHRycy5tYXgpLCBmdW5jdGlvbih2YWx1ZSkge1xyXG4gICAgdmFyIGR0ID0gbmV3IERhdGUodmFsdWUpO1xyXG4gICAgbWF4ID0gaXNOYU4oZHQpID8gdW5kZWZpbmVkIDogZHQ7XHJcbiAgfSkpO1xyXG5cclxuICB2YXIgZGlzYWJsZWQgPSBmYWxzZTtcclxuICBpZiAoJGF0dHJzLm5nRGlzYWJsZWQpIHtcclxuICAgIHdhdGNoZXJzLnB1c2goJHNjb3BlLiRwYXJlbnQuJHdhdGNoKCRwYXJzZSgkYXR0cnMubmdEaXNhYmxlZCksIGZ1bmN0aW9uKHZhbHVlKSB7XHJcbiAgICAgIGRpc2FibGVkID0gdmFsdWU7XHJcbiAgICB9KSk7XHJcbiAgfVxyXG5cclxuICAkc2NvcGUubm9JbmNyZW1lbnRIb3VycyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGluY3JlbWVudGVkU2VsZWN0ZWQgPSBhZGRNaW51dGVzKHNlbGVjdGVkLCBob3VyU3RlcCAqIDYwKTtcclxuICAgIHJldHVybiBkaXNhYmxlZCB8fCBpbmNyZW1lbnRlZFNlbGVjdGVkID4gbWF4IHx8XHJcbiAgICAgIGluY3JlbWVudGVkU2VsZWN0ZWQgPCBzZWxlY3RlZCAmJiBpbmNyZW1lbnRlZFNlbGVjdGVkIDwgbWluO1xyXG4gIH07XHJcblxyXG4gICRzY29wZS5ub0RlY3JlbWVudEhvdXJzID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgZGVjcmVtZW50ZWRTZWxlY3RlZCA9IGFkZE1pbnV0ZXMoc2VsZWN0ZWQsIC1ob3VyU3RlcCAqIDYwKTtcclxuICAgIHJldHVybiBkaXNhYmxlZCB8fCBkZWNyZW1lbnRlZFNlbGVjdGVkIDwgbWluIHx8XHJcbiAgICAgIGRlY3JlbWVudGVkU2VsZWN0ZWQgPiBzZWxlY3RlZCAmJiBkZWNyZW1lbnRlZFNlbGVjdGVkID4gbWF4O1xyXG4gIH07XHJcblxyXG4gICRzY29wZS5ub0luY3JlbWVudE1pbnV0ZXMgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBpbmNyZW1lbnRlZFNlbGVjdGVkID0gYWRkTWludXRlcyhzZWxlY3RlZCwgbWludXRlU3RlcCk7XHJcbiAgICByZXR1cm4gZGlzYWJsZWQgfHwgaW5jcmVtZW50ZWRTZWxlY3RlZCA+IG1heCB8fFxyXG4gICAgICBpbmNyZW1lbnRlZFNlbGVjdGVkIDwgc2VsZWN0ZWQgJiYgaW5jcmVtZW50ZWRTZWxlY3RlZCA8IG1pbjtcclxuICB9O1xyXG5cclxuICAkc2NvcGUubm9EZWNyZW1lbnRNaW51dGVzID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgZGVjcmVtZW50ZWRTZWxlY3RlZCA9IGFkZE1pbnV0ZXMoc2VsZWN0ZWQsIC1taW51dGVTdGVwKTtcclxuICAgIHJldHVybiBkaXNhYmxlZCB8fCBkZWNyZW1lbnRlZFNlbGVjdGVkIDwgbWluIHx8XHJcbiAgICAgIGRlY3JlbWVudGVkU2VsZWN0ZWQgPiBzZWxlY3RlZCAmJiBkZWNyZW1lbnRlZFNlbGVjdGVkID4gbWF4O1xyXG4gIH07XHJcblxyXG4gICRzY29wZS5ub0luY3JlbWVudFNlY29uZHMgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBpbmNyZW1lbnRlZFNlbGVjdGVkID0gYWRkU2Vjb25kcyhzZWxlY3RlZCwgc2Vjb25kU3RlcCk7XHJcbiAgICByZXR1cm4gZGlzYWJsZWQgfHwgaW5jcmVtZW50ZWRTZWxlY3RlZCA+IG1heCB8fFxyXG4gICAgICBpbmNyZW1lbnRlZFNlbGVjdGVkIDwgc2VsZWN0ZWQgJiYgaW5jcmVtZW50ZWRTZWxlY3RlZCA8IG1pbjtcclxuICB9O1xyXG5cclxuICAkc2NvcGUubm9EZWNyZW1lbnRTZWNvbmRzID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgZGVjcmVtZW50ZWRTZWxlY3RlZCA9IGFkZFNlY29uZHMoc2VsZWN0ZWQsIC1zZWNvbmRTdGVwKTtcclxuICAgIHJldHVybiBkaXNhYmxlZCB8fCBkZWNyZW1lbnRlZFNlbGVjdGVkIDwgbWluIHx8XHJcbiAgICAgIGRlY3JlbWVudGVkU2VsZWN0ZWQgPiBzZWxlY3RlZCAmJiBkZWNyZW1lbnRlZFNlbGVjdGVkID4gbWF4O1xyXG4gIH07XHJcblxyXG4gICRzY29wZS5ub1RvZ2dsZU1lcmlkaWFuID0gZnVuY3Rpb24oKSB7XHJcbiAgICBpZiAoc2VsZWN0ZWQuZ2V0SG91cnMoKSA8IDEyKSB7XHJcbiAgICAgIHJldHVybiBkaXNhYmxlZCB8fCBhZGRNaW51dGVzKHNlbGVjdGVkLCAxMiAqIDYwKSA+IG1heDtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gZGlzYWJsZWQgfHwgYWRkTWludXRlcyhzZWxlY3RlZCwgLTEyICogNjApIDwgbWluO1xyXG4gIH07XHJcblxyXG4gIHZhciBzZWNvbmRTdGVwID0gdGltZXBpY2tlckNvbmZpZy5zZWNvbmRTdGVwO1xyXG4gIGlmICgkYXR0cnMuc2Vjb25kU3RlcCkge1xyXG4gICAgd2F0Y2hlcnMucHVzaCgkc2NvcGUuJHBhcmVudC4kd2F0Y2goJHBhcnNlKCRhdHRycy5zZWNvbmRTdGVwKSwgZnVuY3Rpb24odmFsdWUpIHtcclxuICAgICAgc2Vjb25kU3RlcCA9ICt2YWx1ZTtcclxuICAgIH0pKTtcclxuICB9XHJcblxyXG4gICRzY29wZS5zaG93U2Vjb25kcyA9IHRpbWVwaWNrZXJDb25maWcuc2hvd1NlY29uZHM7XHJcbiAgaWYgKCRhdHRycy5zaG93U2Vjb25kcykge1xyXG4gICAgd2F0Y2hlcnMucHVzaCgkc2NvcGUuJHBhcmVudC4kd2F0Y2goJHBhcnNlKCRhdHRycy5zaG93U2Vjb25kcyksIGZ1bmN0aW9uKHZhbHVlKSB7XHJcbiAgICAgICRzY29wZS5zaG93U2Vjb25kcyA9ICEhdmFsdWU7XHJcbiAgICB9KSk7XHJcbiAgfVxyXG5cclxuICAvLyAxMkggLyAyNEggbW9kZVxyXG4gICRzY29wZS5zaG93TWVyaWRpYW4gPSB0aW1lcGlja2VyQ29uZmlnLnNob3dNZXJpZGlhbjtcclxuICBpZiAoJGF0dHJzLnNob3dNZXJpZGlhbikge1xyXG4gICAgd2F0Y2hlcnMucHVzaCgkc2NvcGUuJHBhcmVudC4kd2F0Y2goJHBhcnNlKCRhdHRycy5zaG93TWVyaWRpYW4pLCBmdW5jdGlvbih2YWx1ZSkge1xyXG4gICAgICAkc2NvcGUuc2hvd01lcmlkaWFuID0gISF2YWx1ZTtcclxuXHJcbiAgICAgIGlmIChuZ01vZGVsQ3RybC4kZXJyb3IudGltZSkge1xyXG4gICAgICAgIC8vIEV2YWx1YXRlIGZyb20gdGVtcGxhdGVcclxuICAgICAgICB2YXIgaG91cnMgPSBnZXRIb3Vyc0Zyb21UZW1wbGF0ZSgpLCBtaW51dGVzID0gZ2V0TWludXRlc0Zyb21UZW1wbGF0ZSgpO1xyXG4gICAgICAgIGlmIChhbmd1bGFyLmlzRGVmaW5lZChob3VycykgJiYgYW5ndWxhci5pc0RlZmluZWQobWludXRlcykpIHtcclxuICAgICAgICAgIHNlbGVjdGVkLnNldEhvdXJzKGhvdXJzKTtcclxuICAgICAgICAgIHJlZnJlc2goKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdXBkYXRlVGVtcGxhdGUoKTtcclxuICAgICAgfVxyXG4gICAgfSkpO1xyXG4gIH1cclxuXHJcbiAgLy8gR2V0ICRzY29wZS5ob3VycyBpbiAyNEggbW9kZSBpZiB2YWxpZFxyXG4gIGZ1bmN0aW9uIGdldEhvdXJzRnJvbVRlbXBsYXRlKCkge1xyXG4gICAgdmFyIGhvdXJzID0gKyRzY29wZS5ob3VycztcclxuICAgIHZhciB2YWxpZCA9ICRzY29wZS5zaG93TWVyaWRpYW4gPyBob3VycyA+IDAgJiYgaG91cnMgPCAxMyA6XHJcbiAgICAgIGhvdXJzID49IDAgJiYgaG91cnMgPCAyNDtcclxuICAgIGlmICghdmFsaWQgfHwgJHNjb3BlLmhvdXJzID09PSAnJykge1xyXG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICgkc2NvcGUuc2hvd01lcmlkaWFuKSB7XHJcbiAgICAgIGlmIChob3VycyA9PT0gMTIpIHtcclxuICAgICAgICBob3VycyA9IDA7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKCRzY29wZS5tZXJpZGlhbiA9PT0gbWVyaWRpYW5zWzFdKSB7XHJcbiAgICAgICAgaG91cnMgPSBob3VycyArIDEyO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gaG91cnM7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBnZXRNaW51dGVzRnJvbVRlbXBsYXRlKCkge1xyXG4gICAgdmFyIG1pbnV0ZXMgPSArJHNjb3BlLm1pbnV0ZXM7XHJcbiAgICB2YXIgdmFsaWQgPSBtaW51dGVzID49IDAgJiYgbWludXRlcyA8IDYwO1xyXG4gICAgaWYgKCF2YWxpZCB8fCAkc2NvcGUubWludXRlcyA9PT0gJycpIHtcclxuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcclxuICAgIH1cclxuICAgIHJldHVybiBtaW51dGVzO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gZ2V0U2Vjb25kc0Zyb21UZW1wbGF0ZSgpIHtcclxuICAgIHZhciBzZWNvbmRzID0gKyRzY29wZS5zZWNvbmRzO1xyXG4gICAgcmV0dXJuIHNlY29uZHMgPj0gMCAmJiBzZWNvbmRzIDwgNjAgPyBzZWNvbmRzIDogdW5kZWZpbmVkO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gcGFkKHZhbHVlLCBub1BhZCkge1xyXG4gICAgaWYgKHZhbHVlID09PSBudWxsKSB7XHJcbiAgICAgIHJldHVybiAnJztcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gYW5ndWxhci5pc0RlZmluZWQodmFsdWUpICYmIHZhbHVlLnRvU3RyaW5nKCkubGVuZ3RoIDwgMiAmJiAhbm9QYWQgP1xyXG4gICAgICAnMCcgKyB2YWx1ZSA6IHZhbHVlLnRvU3RyaW5nKCk7XHJcbiAgfVxyXG5cclxuICAvLyBSZXNwb25kIG9uIG1vdXNld2hlZWwgc3BpblxyXG4gIHRoaXMuc2V0dXBNb3VzZXdoZWVsRXZlbnRzID0gZnVuY3Rpb24oaG91cnNJbnB1dEVsLCBtaW51dGVzSW5wdXRFbCwgc2Vjb25kc0lucHV0RWwpIHtcclxuICAgIHZhciBpc1Njcm9sbGluZ1VwID0gZnVuY3Rpb24oZSkge1xyXG4gICAgICBpZiAoZS5vcmlnaW5hbEV2ZW50KSB7XHJcbiAgICAgICAgZSA9IGUub3JpZ2luYWxFdmVudDtcclxuICAgICAgfVxyXG4gICAgICAvL3BpY2sgY29ycmVjdCBkZWx0YSB2YXJpYWJsZSBkZXBlbmRpbmcgb24gZXZlbnRcclxuICAgICAgdmFyIGRlbHRhID0gZS53aGVlbERlbHRhID8gZS53aGVlbERlbHRhIDogLWUuZGVsdGFZO1xyXG4gICAgICByZXR1cm4gZS5kZXRhaWwgfHwgZGVsdGEgPiAwO1xyXG4gICAgfTtcclxuXHJcbiAgICBob3Vyc0lucHV0RWwuYmluZCgnbW91c2V3aGVlbCB3aGVlbCcsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgaWYgKCFkaXNhYmxlZCkge1xyXG4gICAgICAgICRzY29wZS4kYXBwbHkoaXNTY3JvbGxpbmdVcChlKSA/ICRzY29wZS5pbmNyZW1lbnRIb3VycygpIDogJHNjb3BlLmRlY3JlbWVudEhvdXJzKCkpO1xyXG4gICAgICB9XHJcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgIH0pO1xyXG5cclxuICAgIG1pbnV0ZXNJbnB1dEVsLmJpbmQoJ21vdXNld2hlZWwgd2hlZWwnLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgIGlmICghZGlzYWJsZWQpIHtcclxuICAgICAgICAkc2NvcGUuJGFwcGx5KGlzU2Nyb2xsaW5nVXAoZSkgPyAkc2NvcGUuaW5jcmVtZW50TWludXRlcygpIDogJHNjb3BlLmRlY3JlbWVudE1pbnV0ZXMoKSk7XHJcbiAgICAgIH1cclxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgIHNlY29uZHNJbnB1dEVsLmJpbmQoJ21vdXNld2hlZWwgd2hlZWwnLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgIGlmICghZGlzYWJsZWQpIHtcclxuICAgICAgICAkc2NvcGUuJGFwcGx5KGlzU2Nyb2xsaW5nVXAoZSkgPyAkc2NvcGUuaW5jcmVtZW50U2Vjb25kcygpIDogJHNjb3BlLmRlY3JlbWVudFNlY29uZHMoKSk7XHJcbiAgICAgIH1cclxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgfSk7XHJcbiAgfTtcclxuXHJcbiAgLy8gUmVzcG9uZCBvbiB1cC9kb3duIGFycm93a2V5c1xyXG4gIHRoaXMuc2V0dXBBcnJvd2tleUV2ZW50cyA9IGZ1bmN0aW9uKGhvdXJzSW5wdXRFbCwgbWludXRlc0lucHV0RWwsIHNlY29uZHNJbnB1dEVsKSB7XHJcbiAgICBob3Vyc0lucHV0RWwuYmluZCgna2V5ZG93bicsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgaWYgKCFkaXNhYmxlZCkge1xyXG4gICAgICAgIGlmIChlLndoaWNoID09PSAzOCkgeyAvLyB1cFxyXG4gICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgJHNjb3BlLmluY3JlbWVudEhvdXJzKCk7XHJcbiAgICAgICAgICAkc2NvcGUuJGFwcGx5KCk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChlLndoaWNoID09PSA0MCkgeyAvLyBkb3duXHJcbiAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAkc2NvcGUuZGVjcmVtZW50SG91cnMoKTtcclxuICAgICAgICAgICRzY29wZS4kYXBwbHkoKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIG1pbnV0ZXNJbnB1dEVsLmJpbmQoJ2tleWRvd24nLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgIGlmICghZGlzYWJsZWQpIHtcclxuICAgICAgICBpZiAoZS53aGljaCA9PT0gMzgpIHsgLy8gdXBcclxuICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICRzY29wZS5pbmNyZW1lbnRNaW51dGVzKCk7XHJcbiAgICAgICAgICAkc2NvcGUuJGFwcGx5KCk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChlLndoaWNoID09PSA0MCkgeyAvLyBkb3duXHJcbiAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAkc2NvcGUuZGVjcmVtZW50TWludXRlcygpO1xyXG4gICAgICAgICAgJHNjb3BlLiRhcHBseSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgc2Vjb25kc0lucHV0RWwuYmluZCgna2V5ZG93bicsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgaWYgKCFkaXNhYmxlZCkge1xyXG4gICAgICAgIGlmIChlLndoaWNoID09PSAzOCkgeyAvLyB1cFxyXG4gICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgJHNjb3BlLmluY3JlbWVudFNlY29uZHMoKTtcclxuICAgICAgICAgICRzY29wZS4kYXBwbHkoKTtcclxuICAgICAgICB9IGVsc2UgaWYgKGUud2hpY2ggPT09IDQwKSB7IC8vIGRvd25cclxuICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICRzY29wZS5kZWNyZW1lbnRTZWNvbmRzKCk7XHJcbiAgICAgICAgICAkc2NvcGUuJGFwcGx5KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICB9O1xyXG5cclxuICB0aGlzLnNldHVwSW5wdXRFdmVudHMgPSBmdW5jdGlvbihob3Vyc0lucHV0RWwsIG1pbnV0ZXNJbnB1dEVsLCBzZWNvbmRzSW5wdXRFbCkge1xyXG4gICAgaWYgKCRzY29wZS5yZWFkb25seUlucHV0KSB7XHJcbiAgICAgICRzY29wZS51cGRhdGVIb3VycyA9IGFuZ3VsYXIubm9vcDtcclxuICAgICAgJHNjb3BlLnVwZGF0ZU1pbnV0ZXMgPSBhbmd1bGFyLm5vb3A7XHJcbiAgICAgICRzY29wZS51cGRhdGVTZWNvbmRzID0gYW5ndWxhci5ub29wO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGludmFsaWRhdGUgPSBmdW5jdGlvbihpbnZhbGlkSG91cnMsIGludmFsaWRNaW51dGVzLCBpbnZhbGlkU2Vjb25kcykge1xyXG4gICAgICBuZ01vZGVsQ3RybC4kc2V0Vmlld1ZhbHVlKG51bGwpO1xyXG4gICAgICBuZ01vZGVsQ3RybC4kc2V0VmFsaWRpdHkoJ3RpbWUnLCBmYWxzZSk7XHJcbiAgICAgIGlmIChhbmd1bGFyLmlzRGVmaW5lZChpbnZhbGlkSG91cnMpKSB7XHJcbiAgICAgICAgJHNjb3BlLmludmFsaWRIb3VycyA9IGludmFsaWRIb3VycztcclxuICAgICAgICBpZiAoaG91cnNNb2RlbEN0cmwpIHtcclxuICAgICAgICAgIGhvdXJzTW9kZWxDdHJsLiRzZXRWYWxpZGl0eSgnaG91cnMnLCBmYWxzZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoYW5ndWxhci5pc0RlZmluZWQoaW52YWxpZE1pbnV0ZXMpKSB7XHJcbiAgICAgICAgJHNjb3BlLmludmFsaWRNaW51dGVzID0gaW52YWxpZE1pbnV0ZXM7XHJcbiAgICAgICAgaWYgKG1pbnV0ZXNNb2RlbEN0cmwpIHtcclxuICAgICAgICAgIG1pbnV0ZXNNb2RlbEN0cmwuJHNldFZhbGlkaXR5KCdtaW51dGVzJywgZmFsc2UpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKGFuZ3VsYXIuaXNEZWZpbmVkKGludmFsaWRTZWNvbmRzKSkge1xyXG4gICAgICAgICRzY29wZS5pbnZhbGlkU2Vjb25kcyA9IGludmFsaWRTZWNvbmRzO1xyXG4gICAgICAgIGlmIChzZWNvbmRzTW9kZWxDdHJsKSB7XHJcbiAgICAgICAgICBzZWNvbmRzTW9kZWxDdHJsLiRzZXRWYWxpZGl0eSgnc2Vjb25kcycsIGZhbHNlKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgJHNjb3BlLnVwZGF0ZUhvdXJzID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgIHZhciBob3VycyA9IGdldEhvdXJzRnJvbVRlbXBsYXRlKCksXHJcbiAgICAgICAgbWludXRlcyA9IGdldE1pbnV0ZXNGcm9tVGVtcGxhdGUoKTtcclxuXHJcbiAgICAgIG5nTW9kZWxDdHJsLiRzZXREaXJ0eSgpO1xyXG5cclxuICAgICAgaWYgKGFuZ3VsYXIuaXNEZWZpbmVkKGhvdXJzKSAmJiBhbmd1bGFyLmlzRGVmaW5lZChtaW51dGVzKSkge1xyXG4gICAgICAgIHNlbGVjdGVkLnNldEhvdXJzKGhvdXJzKTtcclxuICAgICAgICBzZWxlY3RlZC5zZXRNaW51dGVzKG1pbnV0ZXMpO1xyXG4gICAgICAgIGlmIChzZWxlY3RlZCA8IG1pbiB8fCBzZWxlY3RlZCA+IG1heCkge1xyXG4gICAgICAgICAgaW52YWxpZGF0ZSh0cnVlKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgcmVmcmVzaCgnaCcpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBpbnZhbGlkYXRlKHRydWUpO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIGhvdXJzSW5wdXRFbC5iaW5kKCdibHVyJywgZnVuY3Rpb24oZSkge1xyXG4gICAgICBuZ01vZGVsQ3RybC4kc2V0VG91Y2hlZCgpO1xyXG4gICAgICBpZiAobW9kZWxJc0VtcHR5KCkpIHtcclxuICAgICAgICBtYWtlVmFsaWQoKTtcclxuICAgICAgfSBlbHNlIGlmICgkc2NvcGUuaG91cnMgPT09IG51bGwgfHwgJHNjb3BlLmhvdXJzID09PSAnJykge1xyXG4gICAgICAgIGludmFsaWRhdGUodHJ1ZSk7XHJcbiAgICAgIH0gZWxzZSBpZiAoISRzY29wZS5pbnZhbGlkSG91cnMgJiYgJHNjb3BlLmhvdXJzIDwgMTApIHtcclxuICAgICAgICAkc2NvcGUuJGFwcGx5KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgJHNjb3BlLmhvdXJzID0gcGFkKCRzY29wZS5ob3VycywgIXBhZEhvdXJzKTtcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgJHNjb3BlLnVwZGF0ZU1pbnV0ZXMgPSBmdW5jdGlvbigpIHtcclxuICAgICAgdmFyIG1pbnV0ZXMgPSBnZXRNaW51dGVzRnJvbVRlbXBsYXRlKCksXHJcbiAgICAgICAgaG91cnMgPSBnZXRIb3Vyc0Zyb21UZW1wbGF0ZSgpO1xyXG5cclxuICAgICAgbmdNb2RlbEN0cmwuJHNldERpcnR5KCk7XHJcblxyXG4gICAgICBpZiAoYW5ndWxhci5pc0RlZmluZWQobWludXRlcykgJiYgYW5ndWxhci5pc0RlZmluZWQoaG91cnMpKSB7XHJcbiAgICAgICAgc2VsZWN0ZWQuc2V0SG91cnMoaG91cnMpO1xyXG4gICAgICAgIHNlbGVjdGVkLnNldE1pbnV0ZXMobWludXRlcyk7XHJcbiAgICAgICAgaWYgKHNlbGVjdGVkIDwgbWluIHx8IHNlbGVjdGVkID4gbWF4KSB7XHJcbiAgICAgICAgICBpbnZhbGlkYXRlKHVuZGVmaW5lZCwgdHJ1ZSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHJlZnJlc2goJ20nKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgaW52YWxpZGF0ZSh1bmRlZmluZWQsIHRydWUpO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIG1pbnV0ZXNJbnB1dEVsLmJpbmQoJ2JsdXInLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgIG5nTW9kZWxDdHJsLiRzZXRUb3VjaGVkKCk7XHJcbiAgICAgIGlmIChtb2RlbElzRW1wdHkoKSkge1xyXG4gICAgICAgIG1ha2VWYWxpZCgpO1xyXG4gICAgICB9IGVsc2UgaWYgKCRzY29wZS5taW51dGVzID09PSBudWxsKSB7XHJcbiAgICAgICAgaW52YWxpZGF0ZSh1bmRlZmluZWQsIHRydWUpO1xyXG4gICAgICB9IGVsc2UgaWYgKCEkc2NvcGUuaW52YWxpZE1pbnV0ZXMgJiYgJHNjb3BlLm1pbnV0ZXMgPCAxMCkge1xyXG4gICAgICAgICRzY29wZS4kYXBwbHkoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAkc2NvcGUubWludXRlcyA9IHBhZCgkc2NvcGUubWludXRlcyk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgICRzY29wZS51cGRhdGVTZWNvbmRzID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgIHZhciBzZWNvbmRzID0gZ2V0U2Vjb25kc0Zyb21UZW1wbGF0ZSgpO1xyXG5cclxuICAgICAgbmdNb2RlbEN0cmwuJHNldERpcnR5KCk7XHJcblxyXG4gICAgICBpZiAoYW5ndWxhci5pc0RlZmluZWQoc2Vjb25kcykpIHtcclxuICAgICAgICBzZWxlY3RlZC5zZXRTZWNvbmRzKHNlY29uZHMpO1xyXG4gICAgICAgIHJlZnJlc2goJ3MnKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBpbnZhbGlkYXRlKHVuZGVmaW5lZCwgdW5kZWZpbmVkLCB0cnVlKTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICBzZWNvbmRzSW5wdXRFbC5iaW5kKCdibHVyJywgZnVuY3Rpb24oZSkge1xyXG4gICAgICBpZiAobW9kZWxJc0VtcHR5KCkpIHtcclxuICAgICAgICBtYWtlVmFsaWQoKTtcclxuICAgICAgfSBlbHNlIGlmICghJHNjb3BlLmludmFsaWRTZWNvbmRzICYmICRzY29wZS5zZWNvbmRzIDwgMTApIHtcclxuICAgICAgICAkc2NvcGUuJGFwcGx5KCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICRzY29wZS5zZWNvbmRzID0gcGFkKCRzY29wZS5zZWNvbmRzKTtcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gIH07XHJcblxyXG4gIHRoaXMucmVuZGVyID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgZGF0ZSA9IG5nTW9kZWxDdHJsLiR2aWV3VmFsdWU7XHJcblxyXG4gICAgaWYgKGlzTmFOKGRhdGUpKSB7XHJcbiAgICAgIG5nTW9kZWxDdHJsLiRzZXRWYWxpZGl0eSgndGltZScsIGZhbHNlKTtcclxuICAgICAgJGxvZy5lcnJvcignVGltZXBpY2tlciBkaXJlY3RpdmU6IFwibmctbW9kZWxcIiB2YWx1ZSBtdXN0IGJlIGEgRGF0ZSBvYmplY3QsIGEgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyBzaW5jZSAwMS4wMS4xOTcwIG9yIGEgc3RyaW5nIHJlcHJlc2VudGluZyBhbiBSRkMyODIyIG9yIElTTyA4NjAxIGRhdGUuJyk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBpZiAoZGF0ZSkge1xyXG4gICAgICAgIHNlbGVjdGVkID0gZGF0ZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKHNlbGVjdGVkIDwgbWluIHx8IHNlbGVjdGVkID4gbWF4KSB7XHJcbiAgICAgICAgbmdNb2RlbEN0cmwuJHNldFZhbGlkaXR5KCd0aW1lJywgZmFsc2UpO1xyXG4gICAgICAgICRzY29wZS5pbnZhbGlkSG91cnMgPSB0cnVlO1xyXG4gICAgICAgICRzY29wZS5pbnZhbGlkTWludXRlcyA9IHRydWU7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgbWFrZVZhbGlkKCk7XHJcbiAgICAgIH1cclxuICAgICAgdXBkYXRlVGVtcGxhdGUoKTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICAvLyBDYWxsIGludGVybmFsbHkgd2hlbiB3ZSBrbm93IHRoYXQgbW9kZWwgaXMgdmFsaWQuXHJcbiAgZnVuY3Rpb24gcmVmcmVzaChrZXlib2FyZENoYW5nZSkge1xyXG4gICAgbWFrZVZhbGlkKCk7XHJcbiAgICBuZ01vZGVsQ3RybC4kc2V0Vmlld1ZhbHVlKG5ldyBEYXRlKHNlbGVjdGVkKSk7XHJcbiAgICB1cGRhdGVUZW1wbGF0ZShrZXlib2FyZENoYW5nZSk7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBtYWtlVmFsaWQoKSB7XHJcbiAgICBpZiAoaG91cnNNb2RlbEN0cmwpIHtcclxuICAgICAgaG91cnNNb2RlbEN0cmwuJHNldFZhbGlkaXR5KCdob3VycycsIHRydWUpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChtaW51dGVzTW9kZWxDdHJsKSB7XHJcbiAgICAgIG1pbnV0ZXNNb2RlbEN0cmwuJHNldFZhbGlkaXR5KCdtaW51dGVzJywgdHJ1ZSk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHNlY29uZHNNb2RlbEN0cmwpIHtcclxuICAgICAgc2Vjb25kc01vZGVsQ3RybC4kc2V0VmFsaWRpdHkoJ3NlY29uZHMnLCB0cnVlKTtcclxuICAgIH1cclxuXHJcbiAgICBuZ01vZGVsQ3RybC4kc2V0VmFsaWRpdHkoJ3RpbWUnLCB0cnVlKTtcclxuICAgICRzY29wZS5pbnZhbGlkSG91cnMgPSBmYWxzZTtcclxuICAgICRzY29wZS5pbnZhbGlkTWludXRlcyA9IGZhbHNlO1xyXG4gICAgJHNjb3BlLmludmFsaWRTZWNvbmRzID0gZmFsc2U7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiB1cGRhdGVUZW1wbGF0ZShrZXlib2FyZENoYW5nZSkge1xyXG4gICAgaWYgKCFuZ01vZGVsQ3RybC4kbW9kZWxWYWx1ZSkge1xyXG4gICAgICAkc2NvcGUuaG91cnMgPSBudWxsO1xyXG4gICAgICAkc2NvcGUubWludXRlcyA9IG51bGw7XHJcbiAgICAgICRzY29wZS5zZWNvbmRzID0gbnVsbDtcclxuICAgICAgJHNjb3BlLm1lcmlkaWFuID0gbWVyaWRpYW5zWzBdO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdmFyIGhvdXJzID0gc2VsZWN0ZWQuZ2V0SG91cnMoKSxcclxuICAgICAgICBtaW51dGVzID0gc2VsZWN0ZWQuZ2V0TWludXRlcygpLFxyXG4gICAgICAgIHNlY29uZHMgPSBzZWxlY3RlZC5nZXRTZWNvbmRzKCk7XHJcblxyXG4gICAgICBpZiAoJHNjb3BlLnNob3dNZXJpZGlhbikge1xyXG4gICAgICAgIGhvdXJzID0gaG91cnMgPT09IDAgfHwgaG91cnMgPT09IDEyID8gMTIgOiBob3VycyAlIDEyOyAvLyBDb252ZXJ0IDI0IHRvIDEyIGhvdXIgc3lzdGVtXHJcbiAgICAgIH1cclxuXHJcbiAgICAgICRzY29wZS5ob3VycyA9IGtleWJvYXJkQ2hhbmdlID09PSAnaCcgPyBob3VycyA6IHBhZChob3VycywgIXBhZEhvdXJzKTtcclxuICAgICAgaWYgKGtleWJvYXJkQ2hhbmdlICE9PSAnbScpIHtcclxuICAgICAgICAkc2NvcGUubWludXRlcyA9IHBhZChtaW51dGVzKTtcclxuICAgICAgfVxyXG4gICAgICAkc2NvcGUubWVyaWRpYW4gPSBzZWxlY3RlZC5nZXRIb3VycygpIDwgMTIgPyBtZXJpZGlhbnNbMF0gOiBtZXJpZGlhbnNbMV07XHJcblxyXG4gICAgICBpZiAoa2V5Ym9hcmRDaGFuZ2UgIT09ICdzJykge1xyXG4gICAgICAgICRzY29wZS5zZWNvbmRzID0gcGFkKHNlY29uZHMpO1xyXG4gICAgICB9XHJcbiAgICAgICRzY29wZS5tZXJpZGlhbiA9IHNlbGVjdGVkLmdldEhvdXJzKCkgPCAxMiA/IG1lcmlkaWFuc1swXSA6IG1lcmlkaWFuc1sxXTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGFkZFNlY29uZHNUb1NlbGVjdGVkKHNlY29uZHMpIHtcclxuICAgIHNlbGVjdGVkID0gYWRkU2Vjb25kcyhzZWxlY3RlZCwgc2Vjb25kcyk7XHJcbiAgICByZWZyZXNoKCk7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBhZGRNaW51dGVzKHNlbGVjdGVkLCBtaW51dGVzKSB7XHJcbiAgICByZXR1cm4gYWRkU2Vjb25kcyhzZWxlY3RlZCwgbWludXRlcyo2MCk7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBhZGRTZWNvbmRzKGRhdGUsIHNlY29uZHMpIHtcclxuICAgIHZhciBkdCA9IG5ldyBEYXRlKGRhdGUuZ2V0VGltZSgpICsgc2Vjb25kcyAqIDEwMDApO1xyXG4gICAgdmFyIG5ld0RhdGUgPSBuZXcgRGF0ZShkYXRlKTtcclxuICAgIG5ld0RhdGUuc2V0SG91cnMoZHQuZ2V0SG91cnMoKSwgZHQuZ2V0TWludXRlcygpLCBkdC5nZXRTZWNvbmRzKCkpO1xyXG4gICAgcmV0dXJuIG5ld0RhdGU7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBtb2RlbElzRW1wdHkoKSB7XHJcbiAgICByZXR1cm4gKCRzY29wZS5ob3VycyA9PT0gbnVsbCB8fCAkc2NvcGUuaG91cnMgPT09ICcnKSAmJlxyXG4gICAgICAoJHNjb3BlLm1pbnV0ZXMgPT09IG51bGwgfHwgJHNjb3BlLm1pbnV0ZXMgPT09ICcnKSAmJlxyXG4gICAgICAoISRzY29wZS5zaG93U2Vjb25kcyB8fCAkc2NvcGUuc2hvd1NlY29uZHMgJiYgKCRzY29wZS5zZWNvbmRzID09PSBudWxsIHx8ICRzY29wZS5zZWNvbmRzID09PSAnJykpO1xyXG4gIH1cclxuXHJcbiAgJHNjb3BlLnNob3dTcGlubmVycyA9IGFuZ3VsYXIuaXNEZWZpbmVkKCRhdHRycy5zaG93U3Bpbm5lcnMpID9cclxuICAgICRzY29wZS4kcGFyZW50LiRldmFsKCRhdHRycy5zaG93U3Bpbm5lcnMpIDogdGltZXBpY2tlckNvbmZpZy5zaG93U3Bpbm5lcnM7XHJcblxyXG4gICRzY29wZS5pbmNyZW1lbnRIb3VycyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgaWYgKCEkc2NvcGUubm9JbmNyZW1lbnRIb3VycygpKSB7XHJcbiAgICAgIGFkZFNlY29uZHNUb1NlbGVjdGVkKGhvdXJTdGVwICogNjAgKiA2MCk7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgJHNjb3BlLmRlY3JlbWVudEhvdXJzID0gZnVuY3Rpb24oKSB7XHJcbiAgICBpZiAoISRzY29wZS5ub0RlY3JlbWVudEhvdXJzKCkpIHtcclxuICAgICAgYWRkU2Vjb25kc1RvU2VsZWN0ZWQoLWhvdXJTdGVwICogNjAgKiA2MCk7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgJHNjb3BlLmluY3JlbWVudE1pbnV0ZXMgPSBmdW5jdGlvbigpIHtcclxuICAgIGlmICghJHNjb3BlLm5vSW5jcmVtZW50TWludXRlcygpKSB7XHJcbiAgICAgIGFkZFNlY29uZHNUb1NlbGVjdGVkKG1pbnV0ZVN0ZXAgKiA2MCk7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgJHNjb3BlLmRlY3JlbWVudE1pbnV0ZXMgPSBmdW5jdGlvbigpIHtcclxuICAgIGlmICghJHNjb3BlLm5vRGVjcmVtZW50TWludXRlcygpKSB7XHJcbiAgICAgIGFkZFNlY29uZHNUb1NlbGVjdGVkKC1taW51dGVTdGVwICogNjApO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gICRzY29wZS5pbmNyZW1lbnRTZWNvbmRzID0gZnVuY3Rpb24oKSB7XHJcbiAgICBpZiAoISRzY29wZS5ub0luY3JlbWVudFNlY29uZHMoKSkge1xyXG4gICAgICBhZGRTZWNvbmRzVG9TZWxlY3RlZChzZWNvbmRTdGVwKTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICAkc2NvcGUuZGVjcmVtZW50U2Vjb25kcyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgaWYgKCEkc2NvcGUubm9EZWNyZW1lbnRTZWNvbmRzKCkpIHtcclxuICAgICAgYWRkU2Vjb25kc1RvU2VsZWN0ZWQoLXNlY29uZFN0ZXApO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gICRzY29wZS50b2dnbGVNZXJpZGlhbiA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIG1pbnV0ZXMgPSBnZXRNaW51dGVzRnJvbVRlbXBsYXRlKCksXHJcbiAgICAgICAgaG91cnMgPSBnZXRIb3Vyc0Zyb21UZW1wbGF0ZSgpO1xyXG5cclxuICAgIGlmICghJHNjb3BlLm5vVG9nZ2xlTWVyaWRpYW4oKSkge1xyXG4gICAgICBpZiAoYW5ndWxhci5pc0RlZmluZWQobWludXRlcykgJiYgYW5ndWxhci5pc0RlZmluZWQoaG91cnMpKSB7XHJcbiAgICAgICAgYWRkU2Vjb25kc1RvU2VsZWN0ZWQoMTIgKiA2MCAqIChzZWxlY3RlZC5nZXRIb3VycygpIDwgMTIgPyA2MCA6IC02MCkpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgICRzY29wZS5tZXJpZGlhbiA9ICRzY29wZS5tZXJpZGlhbiA9PT0gbWVyaWRpYW5zWzBdID8gbWVyaWRpYW5zWzFdIDogbWVyaWRpYW5zWzBdO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgJHNjb3BlLmJsdXIgPSBmdW5jdGlvbigpIHtcclxuICAgIG5nTW9kZWxDdHJsLiRzZXRUb3VjaGVkKCk7XHJcbiAgfTtcclxuXHJcbiAgJHNjb3BlLiRvbignJGRlc3Ryb3knLCBmdW5jdGlvbigpIHtcclxuICAgIHdoaWxlICh3YXRjaGVycy5sZW5ndGgpIHtcclxuICAgICAgd2F0Y2hlcnMuc2hpZnQoKSgpO1xyXG4gICAgfVxyXG4gIH0pO1xyXG59XSlcclxuXHJcbi5kaXJlY3RpdmUoJ3VpYlRpbWVwaWNrZXInLCBbJ3VpYlRpbWVwaWNrZXJDb25maWcnLCBmdW5jdGlvbih1aWJUaW1lcGlja2VyQ29uZmlnKSB7XHJcbiAgcmV0dXJuIHtcclxuICAgIHJlcXVpcmU6IFsndWliVGltZXBpY2tlcicsICc/Xm5nTW9kZWwnXSxcclxuICAgIHJlc3RyaWN0OiAnQScsXHJcbiAgICBjb250cm9sbGVyOiAnVWliVGltZXBpY2tlckNvbnRyb2xsZXInLFxyXG4gICAgY29udHJvbGxlckFzOiAndGltZXBpY2tlcicsXHJcbiAgICBzY29wZToge30sXHJcbiAgICB0ZW1wbGF0ZVVybDogZnVuY3Rpb24oZWxlbWVudCwgYXR0cnMpIHtcclxuICAgICAgcmV0dXJuIGF0dHJzLnRlbXBsYXRlVXJsIHx8IHVpYlRpbWVwaWNrZXJDb25maWcudGVtcGxhdGVVcmw7XHJcbiAgICB9LFxyXG4gICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCBjdHJscykge1xyXG4gICAgICB2YXIgdGltZXBpY2tlckN0cmwgPSBjdHJsc1swXSwgbmdNb2RlbEN0cmwgPSBjdHJsc1sxXTtcclxuXHJcbiAgICAgIGlmIChuZ01vZGVsQ3RybCkge1xyXG4gICAgICAgIHRpbWVwaWNrZXJDdHJsLmluaXQobmdNb2RlbEN0cmwsIGVsZW1lbnQuZmluZCgnaW5wdXQnKSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9O1xyXG59XSk7XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgndWkuYm9vdHN0cmFwLnR5cGVhaGVhZCcsIFsndWkuYm9vdHN0cmFwLmRlYm91bmNlJywgJ3VpLmJvb3RzdHJhcC5wb3NpdGlvbiddKVxyXG5cclxuLyoqXHJcbiAqIEEgaGVscGVyIHNlcnZpY2UgdGhhdCBjYW4gcGFyc2UgdHlwZWFoZWFkJ3Mgc3ludGF4IChzdHJpbmcgcHJvdmlkZWQgYnkgdXNlcnMpXHJcbiAqIEV4dHJhY3RlZCB0byBhIHNlcGFyYXRlIHNlcnZpY2UgZm9yIGVhc2Ugb2YgdW5pdCB0ZXN0aW5nXHJcbiAqL1xyXG4gIC5mYWN0b3J5KCd1aWJUeXBlYWhlYWRQYXJzZXInLCBbJyRwYXJzZScsIGZ1bmN0aW9uKCRwYXJzZSkge1xyXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgMDAwMDAxMTExMTExMTAwMDAwMDAwMDAwMDAyMjIyMjIyMjAwMDAwMDAwMDAwMDAwMDAzMzMzMzMzMzMzMzMzMzMwMDAwMDAwMDAwMDQ0NDQ0NDQ0MDAwXHJcbiAgICB2YXIgVFlQRUFIRUFEX1JFR0VYUCA9IC9eXFxzKihbXFxzXFxTXSs/KSg/Olxccythc1xccysoW1xcc1xcU10rPykpP1xccytmb3JcXHMrKD86KFtcXCRcXHddW1xcJFxcd1xcZF0qKSlcXHMraW5cXHMrKFtcXHNcXFNdKz8pJC87XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBwYXJzZTogZnVuY3Rpb24oaW5wdXQpIHtcclxuICAgICAgICB2YXIgbWF0Y2ggPSBpbnB1dC5tYXRjaChUWVBFQUhFQURfUkVHRVhQKTtcclxuICAgICAgICBpZiAoIW1hdGNoKSB7XHJcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXHJcbiAgICAgICAgICAgICdFeHBlY3RlZCB0eXBlYWhlYWQgc3BlY2lmaWNhdGlvbiBpbiBmb3JtIG9mIFwiX21vZGVsVmFsdWVfIChhcyBfbGFiZWxfKT8gZm9yIF9pdGVtXyBpbiBfY29sbGVjdGlvbl9cIicgK1xyXG4gICAgICAgICAgICAgICcgYnV0IGdvdCBcIicgKyBpbnB1dCArICdcIi4nKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICBpdGVtTmFtZTogbWF0Y2hbM10sXHJcbiAgICAgICAgICBzb3VyY2U6ICRwYXJzZShtYXRjaFs0XSksXHJcbiAgICAgICAgICB2aWV3TWFwcGVyOiAkcGFyc2UobWF0Y2hbMl0gfHwgbWF0Y2hbMV0pLFxyXG4gICAgICAgICAgbW9kZWxNYXBwZXI6ICRwYXJzZShtYXRjaFsxXSlcclxuICAgICAgICB9O1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG4gIH1dKVxyXG5cclxuICAuY29udHJvbGxlcignVWliVHlwZWFoZWFkQ29udHJvbGxlcicsIFsnJHNjb3BlJywgJyRlbGVtZW50JywgJyRhdHRycycsICckY29tcGlsZScsICckcGFyc2UnLCAnJHEnLCAnJHRpbWVvdXQnLCAnJGRvY3VtZW50JywgJyR3aW5kb3cnLCAnJHJvb3RTY29wZScsICckJGRlYm91bmNlJywgJyR1aWJQb3NpdGlvbicsICd1aWJUeXBlYWhlYWRQYXJzZXInLFxyXG4gICAgZnVuY3Rpb24ob3JpZ2luYWxTY29wZSwgZWxlbWVudCwgYXR0cnMsICRjb21waWxlLCAkcGFyc2UsICRxLCAkdGltZW91dCwgJGRvY3VtZW50LCAkd2luZG93LCAkcm9vdFNjb3BlLCAkJGRlYm91bmNlLCAkcG9zaXRpb24sIHR5cGVhaGVhZFBhcnNlcikge1xyXG4gICAgdmFyIEhPVF9LRVlTID0gWzksIDEzLCAyNywgMzgsIDQwXTtcclxuICAgIHZhciBldmVudERlYm91bmNlVGltZSA9IDIwMDtcclxuICAgIHZhciBtb2RlbEN0cmwsIG5nTW9kZWxPcHRpb25zO1xyXG4gICAgLy9TVVBQT1JURUQgQVRUUklCVVRFUyAoT1BUSU9OUylcclxuXHJcbiAgICAvL21pbmltYWwgbm8gb2YgY2hhcmFjdGVycyB0aGF0IG5lZWRzIHRvIGJlIGVudGVyZWQgYmVmb3JlIHR5cGVhaGVhZCBraWNrcy1pblxyXG4gICAgdmFyIG1pbkxlbmd0aCA9IG9yaWdpbmFsU2NvcGUuJGV2YWwoYXR0cnMudHlwZWFoZWFkTWluTGVuZ3RoKTtcclxuICAgIGlmICghbWluTGVuZ3RoICYmIG1pbkxlbmd0aCAhPT0gMCkge1xyXG4gICAgICBtaW5MZW5ndGggPSAxO1xyXG4gICAgfVxyXG5cclxuICAgIG9yaWdpbmFsU2NvcGUuJHdhdGNoKGF0dHJzLnR5cGVhaGVhZE1pbkxlbmd0aCwgZnVuY3Rpb24gKG5ld1ZhbCkge1xyXG4gICAgICAgIG1pbkxlbmd0aCA9ICFuZXdWYWwgJiYgbmV3VmFsICE9PSAwID8gMSA6IG5ld1ZhbDtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vbWluaW1hbCB3YWl0IHRpbWUgYWZ0ZXIgbGFzdCBjaGFyYWN0ZXIgdHlwZWQgYmVmb3JlIHR5cGVhaGVhZCBraWNrcy1pblxyXG4gICAgdmFyIHdhaXRUaW1lID0gb3JpZ2luYWxTY29wZS4kZXZhbChhdHRycy50eXBlYWhlYWRXYWl0TXMpIHx8IDA7XHJcblxyXG4gICAgLy9zaG91bGQgaXQgcmVzdHJpY3QgbW9kZWwgdmFsdWVzIHRvIHRoZSBvbmVzIHNlbGVjdGVkIGZyb20gdGhlIHBvcHVwIG9ubHk/XHJcbiAgICB2YXIgaXNFZGl0YWJsZSA9IG9yaWdpbmFsU2NvcGUuJGV2YWwoYXR0cnMudHlwZWFoZWFkRWRpdGFibGUpICE9PSBmYWxzZTtcclxuICAgIG9yaWdpbmFsU2NvcGUuJHdhdGNoKGF0dHJzLnR5cGVhaGVhZEVkaXRhYmxlLCBmdW5jdGlvbiAobmV3VmFsKSB7XHJcbiAgICAgIGlzRWRpdGFibGUgPSBuZXdWYWwgIT09IGZhbHNlO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy9iaW5kaW5nIHRvIGEgdmFyaWFibGUgdGhhdCBpbmRpY2F0ZXMgaWYgbWF0Y2hlcyBhcmUgYmVpbmcgcmV0cmlldmVkIGFzeW5jaHJvbm91c2x5XHJcbiAgICB2YXIgaXNMb2FkaW5nU2V0dGVyID0gJHBhcnNlKGF0dHJzLnR5cGVhaGVhZExvYWRpbmcpLmFzc2lnbiB8fCBhbmd1bGFyLm5vb3A7XHJcblxyXG4gICAgLy9hIGZ1bmN0aW9uIHRvIGRldGVybWluZSBpZiBhbiBldmVudCBzaG91bGQgY2F1c2Ugc2VsZWN0aW9uXHJcbiAgICB2YXIgaXNTZWxlY3RFdmVudCA9IGF0dHJzLnR5cGVhaGVhZFNob3VsZFNlbGVjdCA/ICRwYXJzZShhdHRycy50eXBlYWhlYWRTaG91bGRTZWxlY3QpIDogZnVuY3Rpb24oc2NvcGUsIHZhbHMpIHtcclxuICAgICAgdmFyIGV2dCA9IHZhbHMuJGV2ZW50O1xyXG4gICAgICByZXR1cm4gZXZ0LndoaWNoID09PSAxMyB8fCBldnQud2hpY2ggPT09IDk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8vYSBjYWxsYmFjayBleGVjdXRlZCB3aGVuIGEgbWF0Y2ggaXMgc2VsZWN0ZWRcclxuICAgIHZhciBvblNlbGVjdENhbGxiYWNrID0gJHBhcnNlKGF0dHJzLnR5cGVhaGVhZE9uU2VsZWN0KTtcclxuXHJcbiAgICAvL3Nob3VsZCBpdCBzZWxlY3QgaGlnaGxpZ2h0ZWQgcG9wdXAgdmFsdWUgd2hlbiBsb3NpbmcgZm9jdXM/XHJcbiAgICB2YXIgaXNTZWxlY3RPbkJsdXIgPSBhbmd1bGFyLmlzRGVmaW5lZChhdHRycy50eXBlYWhlYWRTZWxlY3RPbkJsdXIpID8gb3JpZ2luYWxTY29wZS4kZXZhbChhdHRycy50eXBlYWhlYWRTZWxlY3RPbkJsdXIpIDogZmFsc2U7XHJcblxyXG4gICAgLy9iaW5kaW5nIHRvIGEgdmFyaWFibGUgdGhhdCBpbmRpY2F0ZXMgaWYgdGhlcmUgd2VyZSBubyByZXN1bHRzIGFmdGVyIHRoZSBxdWVyeSBpcyBjb21wbGV0ZWRcclxuICAgIHZhciBpc05vUmVzdWx0c1NldHRlciA9ICRwYXJzZShhdHRycy50eXBlYWhlYWROb1Jlc3VsdHMpLmFzc2lnbiB8fCBhbmd1bGFyLm5vb3A7XHJcblxyXG4gICAgdmFyIGlucHV0Rm9ybWF0dGVyID0gYXR0cnMudHlwZWFoZWFkSW5wdXRGb3JtYXR0ZXIgPyAkcGFyc2UoYXR0cnMudHlwZWFoZWFkSW5wdXRGb3JtYXR0ZXIpIDogdW5kZWZpbmVkO1xyXG5cclxuICAgIHZhciBhcHBlbmRUb0JvZHkgPSBhdHRycy50eXBlYWhlYWRBcHBlbmRUb0JvZHkgPyBvcmlnaW5hbFNjb3BlLiRldmFsKGF0dHJzLnR5cGVhaGVhZEFwcGVuZFRvQm9keSkgOiBmYWxzZTtcclxuXHJcbiAgICB2YXIgYXBwZW5kVG8gPSBhdHRycy50eXBlYWhlYWRBcHBlbmRUbyA/XHJcbiAgICAgIG9yaWdpbmFsU2NvcGUuJGV2YWwoYXR0cnMudHlwZWFoZWFkQXBwZW5kVG8pIDogbnVsbDtcclxuXHJcbiAgICB2YXIgZm9jdXNGaXJzdCA9IG9yaWdpbmFsU2NvcGUuJGV2YWwoYXR0cnMudHlwZWFoZWFkRm9jdXNGaXJzdCkgIT09IGZhbHNlO1xyXG5cclxuICAgIC8vSWYgaW5wdXQgbWF0Y2hlcyBhbiBpdGVtIG9mIHRoZSBsaXN0IGV4YWN0bHksIHNlbGVjdCBpdCBhdXRvbWF0aWNhbGx5XHJcbiAgICB2YXIgc2VsZWN0T25FeGFjdCA9IGF0dHJzLnR5cGVhaGVhZFNlbGVjdE9uRXhhY3QgPyBvcmlnaW5hbFNjb3BlLiRldmFsKGF0dHJzLnR5cGVhaGVhZFNlbGVjdE9uRXhhY3QpIDogZmFsc2U7XHJcblxyXG4gICAgLy9iaW5kaW5nIHRvIGEgdmFyaWFibGUgdGhhdCBpbmRpY2F0ZXMgaWYgZHJvcGRvd24gaXMgb3BlblxyXG4gICAgdmFyIGlzT3BlblNldHRlciA9ICRwYXJzZShhdHRycy50eXBlYWhlYWRJc09wZW4pLmFzc2lnbiB8fCBhbmd1bGFyLm5vb3A7XHJcblxyXG4gICAgdmFyIHNob3dIaW50ID0gb3JpZ2luYWxTY29wZS4kZXZhbChhdHRycy50eXBlYWhlYWRTaG93SGludCkgfHwgZmFsc2U7XHJcblxyXG4gICAgLy9JTlRFUk5BTCBWQVJJQUJMRVNcclxuXHJcbiAgICAvL21vZGVsIHNldHRlciBleGVjdXRlZCB1cG9uIG1hdGNoIHNlbGVjdGlvblxyXG4gICAgdmFyIHBhcnNlZE1vZGVsID0gJHBhcnNlKGF0dHJzLm5nTW9kZWwpO1xyXG4gICAgdmFyIGludm9rZU1vZGVsU2V0dGVyID0gJHBhcnNlKGF0dHJzLm5nTW9kZWwgKyAnKCQkJHApJyk7XHJcbiAgICB2YXIgJHNldE1vZGVsVmFsdWUgPSBmdW5jdGlvbihzY29wZSwgbmV3VmFsdWUpIHtcclxuICAgICAgaWYgKGFuZ3VsYXIuaXNGdW5jdGlvbihwYXJzZWRNb2RlbChvcmlnaW5hbFNjb3BlKSkgJiZcclxuICAgICAgICBuZ01vZGVsT3B0aW9ucyAmJiBuZ01vZGVsT3B0aW9ucy4kb3B0aW9ucyAmJiBuZ01vZGVsT3B0aW9ucy4kb3B0aW9ucy5nZXR0ZXJTZXR0ZXIpIHtcclxuICAgICAgICByZXR1cm4gaW52b2tlTW9kZWxTZXR0ZXIoc2NvcGUsIHskJCRwOiBuZXdWYWx1ZX0pO1xyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4gcGFyc2VkTW9kZWwuYXNzaWduKHNjb3BlLCBuZXdWYWx1ZSk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8vZXhwcmVzc2lvbnMgdXNlZCBieSB0eXBlYWhlYWRcclxuICAgIHZhciBwYXJzZXJSZXN1bHQgPSB0eXBlYWhlYWRQYXJzZXIucGFyc2UoYXR0cnMudWliVHlwZWFoZWFkKTtcclxuXHJcbiAgICB2YXIgaGFzRm9jdXM7XHJcblxyXG4gICAgLy9Vc2VkIHRvIGF2b2lkIGJ1ZyBpbiBpT1Mgd2VidmlldyB3aGVyZSBpT1Mga2V5Ym9hcmQgZG9lcyBub3QgZmlyZVxyXG4gICAgLy9tb3VzZWRvd24gJiBtb3VzZXVwIGV2ZW50c1xyXG4gICAgLy9Jc3N1ZSAjMzY5OVxyXG4gICAgdmFyIHNlbGVjdGVkO1xyXG5cclxuICAgIC8vY3JlYXRlIGEgY2hpbGQgc2NvcGUgZm9yIHRoZSB0eXBlYWhlYWQgZGlyZWN0aXZlIHNvIHdlIGFyZSBub3QgcG9sbHV0aW5nIG9yaWdpbmFsIHNjb3BlXHJcbiAgICAvL3dpdGggdHlwZWFoZWFkLXNwZWNpZmljIGRhdGEgKG1hdGNoZXMsIHF1ZXJ5IGV0Yy4pXHJcbiAgICB2YXIgc2NvcGUgPSBvcmlnaW5hbFNjb3BlLiRuZXcoKTtcclxuICAgIHZhciBvZmZEZXN0cm95ID0gb3JpZ2luYWxTY29wZS4kb24oJyRkZXN0cm95JywgZnVuY3Rpb24oKSB7XHJcbiAgICAgIHNjb3BlLiRkZXN0cm95KCk7XHJcbiAgICB9KTtcclxuICAgIHNjb3BlLiRvbignJGRlc3Ryb3knLCBvZmZEZXN0cm95KTtcclxuXHJcbiAgICAvLyBXQUktQVJJQVxyXG4gICAgdmFyIHBvcHVwSWQgPSAndHlwZWFoZWFkLScgKyBzY29wZS4kaWQgKyAnLScgKyBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAxMDAwMCk7XHJcbiAgICBlbGVtZW50LmF0dHIoe1xyXG4gICAgICAnYXJpYS1hdXRvY29tcGxldGUnOiAnbGlzdCcsXHJcbiAgICAgICdhcmlhLWV4cGFuZGVkJzogZmFsc2UsXHJcbiAgICAgICdhcmlhLW93bnMnOiBwb3B1cElkXHJcbiAgICB9KTtcclxuXHJcbiAgICB2YXIgaW5wdXRzQ29udGFpbmVyLCBoaW50SW5wdXRFbGVtO1xyXG4gICAgLy9hZGQgcmVhZC1vbmx5IGlucHV0IHRvIHNob3cgaGludFxyXG4gICAgaWYgKHNob3dIaW50KSB7XHJcbiAgICAgIGlucHV0c0NvbnRhaW5lciA9IGFuZ3VsYXIuZWxlbWVudCgnPGRpdj48L2Rpdj4nKTtcclxuICAgICAgaW5wdXRzQ29udGFpbmVyLmNzcygncG9zaXRpb24nLCAncmVsYXRpdmUnKTtcclxuICAgICAgZWxlbWVudC5hZnRlcihpbnB1dHNDb250YWluZXIpO1xyXG4gICAgICBoaW50SW5wdXRFbGVtID0gZWxlbWVudC5jbG9uZSgpO1xyXG4gICAgICBoaW50SW5wdXRFbGVtLmF0dHIoJ3BsYWNlaG9sZGVyJywgJycpO1xyXG4gICAgICBoaW50SW5wdXRFbGVtLmF0dHIoJ3RhYmluZGV4JywgJy0xJyk7XHJcbiAgICAgIGhpbnRJbnB1dEVsZW0udmFsKCcnKTtcclxuICAgICAgaGludElucHV0RWxlbS5jc3Moe1xyXG4gICAgICAgICdwb3NpdGlvbic6ICdhYnNvbHV0ZScsXHJcbiAgICAgICAgJ3RvcCc6ICcwcHgnLFxyXG4gICAgICAgICdsZWZ0JzogJzBweCcsXHJcbiAgICAgICAgJ2JvcmRlci1jb2xvcic6ICd0cmFuc3BhcmVudCcsXHJcbiAgICAgICAgJ2JveC1zaGFkb3cnOiAnbm9uZScsXHJcbiAgICAgICAgJ29wYWNpdHknOiAxLFxyXG4gICAgICAgICdiYWNrZ3JvdW5kJzogJ25vbmUgMCUgMCUgLyBhdXRvIHJlcGVhdCBzY3JvbGwgcGFkZGluZy1ib3ggYm9yZGVyLWJveCByZ2IoMjU1LCAyNTUsIDI1NSknLFxyXG4gICAgICAgICdjb2xvcic6ICcjOTk5J1xyXG4gICAgICB9KTtcclxuICAgICAgZWxlbWVudC5jc3Moe1xyXG4gICAgICAgICdwb3NpdGlvbic6ICdyZWxhdGl2ZScsXHJcbiAgICAgICAgJ3ZlcnRpY2FsLWFsaWduJzogJ3RvcCcsXHJcbiAgICAgICAgJ2JhY2tncm91bmQtY29sb3InOiAndHJhbnNwYXJlbnQnXHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgaWYgKGhpbnRJbnB1dEVsZW0uYXR0cignaWQnKSkge1xyXG4gICAgICAgIGhpbnRJbnB1dEVsZW0ucmVtb3ZlQXR0cignaWQnKTsgLy8gcmVtb3ZlIGR1cGxpY2F0ZSBpZCBpZiBwcmVzZW50LlxyXG4gICAgICB9XHJcbiAgICAgIGlucHV0c0NvbnRhaW5lci5hcHBlbmQoaGludElucHV0RWxlbSk7XHJcbiAgICAgIGhpbnRJbnB1dEVsZW0uYWZ0ZXIoZWxlbWVudCk7XHJcbiAgICB9XHJcblxyXG4gICAgLy9wb3AtdXAgZWxlbWVudCB1c2VkIHRvIGRpc3BsYXkgbWF0Y2hlc1xyXG4gICAgdmFyIHBvcFVwRWwgPSBhbmd1bGFyLmVsZW1lbnQoJzxkaXYgdWliLXR5cGVhaGVhZC1wb3B1cD48L2Rpdj4nKTtcclxuICAgIHBvcFVwRWwuYXR0cih7XHJcbiAgICAgIGlkOiBwb3B1cElkLFxyXG4gICAgICBtYXRjaGVzOiAnbWF0Y2hlcycsXHJcbiAgICAgIGFjdGl2ZTogJ2FjdGl2ZUlkeCcsXHJcbiAgICAgIHNlbGVjdDogJ3NlbGVjdChhY3RpdmVJZHgsIGV2dCknLFxyXG4gICAgICAnbW92ZS1pbi1wcm9ncmVzcyc6ICdtb3ZlSW5Qcm9ncmVzcycsXHJcbiAgICAgIHF1ZXJ5OiAncXVlcnknLFxyXG4gICAgICBwb3NpdGlvbjogJ3Bvc2l0aW9uJyxcclxuICAgICAgJ2Fzc2lnbi1pcy1vcGVuJzogJ2Fzc2lnbklzT3Blbihpc09wZW4pJyxcclxuICAgICAgZGVib3VuY2U6ICdkZWJvdW5jZVVwZGF0ZSdcclxuICAgIH0pO1xyXG4gICAgLy9jdXN0b20gaXRlbSB0ZW1wbGF0ZVxyXG4gICAgaWYgKGFuZ3VsYXIuaXNEZWZpbmVkKGF0dHJzLnR5cGVhaGVhZFRlbXBsYXRlVXJsKSkge1xyXG4gICAgICBwb3BVcEVsLmF0dHIoJ3RlbXBsYXRlLXVybCcsIGF0dHJzLnR5cGVhaGVhZFRlbXBsYXRlVXJsKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoYW5ndWxhci5pc0RlZmluZWQoYXR0cnMudHlwZWFoZWFkUG9wdXBUZW1wbGF0ZVVybCkpIHtcclxuICAgICAgcG9wVXBFbC5hdHRyKCdwb3B1cC10ZW1wbGF0ZS11cmwnLCBhdHRycy50eXBlYWhlYWRQb3B1cFRlbXBsYXRlVXJsKTtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgcmVzZXRIaW50ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgIGlmIChzaG93SGludCkge1xyXG4gICAgICAgIGhpbnRJbnB1dEVsZW0udmFsKCcnKTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICB2YXIgcmVzZXRNYXRjaGVzID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgIHNjb3BlLm1hdGNoZXMgPSBbXTtcclxuICAgICAgc2NvcGUuYWN0aXZlSWR4ID0gLTE7XHJcbiAgICAgIGVsZW1lbnQuYXR0cignYXJpYS1leHBhbmRlZCcsIGZhbHNlKTtcclxuICAgICAgcmVzZXRIaW50KCk7XHJcbiAgICB9O1xyXG5cclxuICAgIHZhciBnZXRNYXRjaElkID0gZnVuY3Rpb24oaW5kZXgpIHtcclxuICAgICAgcmV0dXJuIHBvcHVwSWQgKyAnLW9wdGlvbi0nICsgaW5kZXg7XHJcbiAgICB9O1xyXG5cclxuICAgIC8vIEluZGljYXRlIHRoYXQgdGhlIHNwZWNpZmllZCBtYXRjaCBpcyB0aGUgYWN0aXZlIChwcmUtc2VsZWN0ZWQpIGl0ZW0gaW4gdGhlIGxpc3Qgb3duZWQgYnkgdGhpcyB0eXBlYWhlYWQuXHJcbiAgICAvLyBUaGlzIGF0dHJpYnV0ZSBpcyBhZGRlZCBvciByZW1vdmVkIGF1dG9tYXRpY2FsbHkgd2hlbiB0aGUgYGFjdGl2ZUlkeGAgY2hhbmdlcy5cclxuICAgIHNjb3BlLiR3YXRjaCgnYWN0aXZlSWR4JywgZnVuY3Rpb24oaW5kZXgpIHtcclxuICAgICAgaWYgKGluZGV4IDwgMCkge1xyXG4gICAgICAgIGVsZW1lbnQucmVtb3ZlQXR0cignYXJpYS1hY3RpdmVkZXNjZW5kYW50Jyk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgZWxlbWVudC5hdHRyKCdhcmlhLWFjdGl2ZWRlc2NlbmRhbnQnLCBnZXRNYXRjaElkKGluZGV4KSk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIHZhciBpbnB1dElzRXhhY3RNYXRjaCA9IGZ1bmN0aW9uKGlucHV0VmFsdWUsIGluZGV4KSB7XHJcbiAgICAgIGlmIChzY29wZS5tYXRjaGVzLmxlbmd0aCA+IGluZGV4ICYmIGlucHV0VmFsdWUpIHtcclxuICAgICAgICByZXR1cm4gaW5wdXRWYWx1ZS50b1VwcGVyQ2FzZSgpID09PSBzY29wZS5tYXRjaGVzW2luZGV4XS5sYWJlbC50b1VwcGVyQ2FzZSgpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9O1xyXG5cclxuICAgIHZhciBnZXRNYXRjaGVzQXN5bmMgPSBmdW5jdGlvbihpbnB1dFZhbHVlLCBldnQpIHtcclxuICAgICAgdmFyIGxvY2FscyA9IHskdmlld1ZhbHVlOiBpbnB1dFZhbHVlfTtcclxuICAgICAgaXNMb2FkaW5nU2V0dGVyKG9yaWdpbmFsU2NvcGUsIHRydWUpO1xyXG4gICAgICBpc05vUmVzdWx0c1NldHRlcihvcmlnaW5hbFNjb3BlLCBmYWxzZSk7XHJcbiAgICAgICRxLndoZW4ocGFyc2VyUmVzdWx0LnNvdXJjZShvcmlnaW5hbFNjb3BlLCBsb2NhbHMpKS50aGVuKGZ1bmN0aW9uKG1hdGNoZXMpIHtcclxuICAgICAgICAvL2l0IG1pZ2h0IGhhcHBlbiB0aGF0IHNldmVyYWwgYXN5bmMgcXVlcmllcyB3ZXJlIGluIHByb2dyZXNzIGlmIGEgdXNlciB3ZXJlIHR5cGluZyBmYXN0XHJcbiAgICAgICAgLy9idXQgd2UgYXJlIGludGVyZXN0ZWQgb25seSBpbiByZXNwb25zZXMgdGhhdCBjb3JyZXNwb25kIHRvIHRoZSBjdXJyZW50IHZpZXcgdmFsdWVcclxuICAgICAgICB2YXIgb25DdXJyZW50UmVxdWVzdCA9IGlucHV0VmFsdWUgPT09IG1vZGVsQ3RybC4kdmlld1ZhbHVlO1xyXG4gICAgICAgIGlmIChvbkN1cnJlbnRSZXF1ZXN0ICYmIGhhc0ZvY3VzKSB7XHJcbiAgICAgICAgICBpZiAobWF0Y2hlcyAmJiBtYXRjaGVzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgc2NvcGUuYWN0aXZlSWR4ID0gZm9jdXNGaXJzdCA/IDAgOiAtMTtcclxuICAgICAgICAgICAgaXNOb1Jlc3VsdHNTZXR0ZXIob3JpZ2luYWxTY29wZSwgZmFsc2UpO1xyXG4gICAgICAgICAgICBzY29wZS5tYXRjaGVzLmxlbmd0aCA9IDA7XHJcblxyXG4gICAgICAgICAgICAvL3RyYW5zZm9ybSBsYWJlbHNcclxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBtYXRjaGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgbG9jYWxzW3BhcnNlclJlc3VsdC5pdGVtTmFtZV0gPSBtYXRjaGVzW2ldO1xyXG4gICAgICAgICAgICAgIHNjb3BlLm1hdGNoZXMucHVzaCh7XHJcbiAgICAgICAgICAgICAgICBpZDogZ2V0TWF0Y2hJZChpKSxcclxuICAgICAgICAgICAgICAgIGxhYmVsOiBwYXJzZXJSZXN1bHQudmlld01hcHBlcihzY29wZSwgbG9jYWxzKSxcclxuICAgICAgICAgICAgICAgIG1vZGVsOiBtYXRjaGVzW2ldXHJcbiAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHNjb3BlLnF1ZXJ5ID0gaW5wdXRWYWx1ZTtcclxuICAgICAgICAgICAgLy9wb3NpdGlvbiBwb3AtdXAgd2l0aCBtYXRjaGVzIC0gd2UgbmVlZCB0byByZS1jYWxjdWxhdGUgaXRzIHBvc2l0aW9uIGVhY2ggdGltZSB3ZSBhcmUgb3BlbmluZyBhIHdpbmRvd1xyXG4gICAgICAgICAgICAvL3dpdGggbWF0Y2hlcyBhcyBhIHBvcC11cCBtaWdodCBiZSBhYnNvbHV0ZS1wb3NpdGlvbmVkIGFuZCBwb3NpdGlvbiBvZiBhbiBpbnB1dCBtaWdodCBoYXZlIGNoYW5nZWQgb24gYSBwYWdlXHJcbiAgICAgICAgICAgIC8vZHVlIHRvIG90aGVyIGVsZW1lbnRzIGJlaW5nIHJlbmRlcmVkXHJcbiAgICAgICAgICAgIHJlY2FsY3VsYXRlUG9zaXRpb24oKTtcclxuXHJcbiAgICAgICAgICAgIGVsZW1lbnQuYXR0cignYXJpYS1leHBhbmRlZCcsIHRydWUpO1xyXG5cclxuICAgICAgICAgICAgLy9TZWxlY3QgdGhlIHNpbmdsZSByZW1haW5pbmcgb3B0aW9uIGlmIHVzZXIgaW5wdXQgbWF0Y2hlc1xyXG4gICAgICAgICAgICBpZiAoc2VsZWN0T25FeGFjdCAmJiBzY29wZS5tYXRjaGVzLmxlbmd0aCA9PT0gMSAmJiBpbnB1dElzRXhhY3RNYXRjaChpbnB1dFZhbHVlLCAwKSkge1xyXG4gICAgICAgICAgICAgIGlmIChhbmd1bGFyLmlzTnVtYmVyKHNjb3BlLmRlYm91bmNlVXBkYXRlKSB8fCBhbmd1bGFyLmlzT2JqZWN0KHNjb3BlLmRlYm91bmNlVXBkYXRlKSkge1xyXG4gICAgICAgICAgICAgICAgJCRkZWJvdW5jZShmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgc2NvcGUuc2VsZWN0KDAsIGV2dCk7XHJcbiAgICAgICAgICAgICAgICB9LCBhbmd1bGFyLmlzTnVtYmVyKHNjb3BlLmRlYm91bmNlVXBkYXRlKSA/IHNjb3BlLmRlYm91bmNlVXBkYXRlIDogc2NvcGUuZGVib3VuY2VVcGRhdGVbJ2RlZmF1bHQnXSk7XHJcbiAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHNjb3BlLnNlbGVjdCgwLCBldnQpO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKHNob3dIaW50KSB7XHJcbiAgICAgICAgICAgICAgdmFyIGZpcnN0TGFiZWwgPSBzY29wZS5tYXRjaGVzWzBdLmxhYmVsO1xyXG4gICAgICAgICAgICAgIGlmIChhbmd1bGFyLmlzU3RyaW5nKGlucHV0VmFsdWUpICYmXHJcbiAgICAgICAgICAgICAgICBpbnB1dFZhbHVlLmxlbmd0aCA+IDAgJiZcclxuICAgICAgICAgICAgICAgIGZpcnN0TGFiZWwuc2xpY2UoMCwgaW5wdXRWYWx1ZS5sZW5ndGgpLnRvVXBwZXJDYXNlKCkgPT09IGlucHV0VmFsdWUudG9VcHBlckNhc2UoKSkge1xyXG4gICAgICAgICAgICAgICAgaGludElucHV0RWxlbS52YWwoaW5wdXRWYWx1ZSArIGZpcnN0TGFiZWwuc2xpY2UoaW5wdXRWYWx1ZS5sZW5ndGgpKTtcclxuICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgaGludElucHV0RWxlbS52YWwoJycpO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmVzZXRNYXRjaGVzKCk7XHJcbiAgICAgICAgICAgIGlzTm9SZXN1bHRzU2V0dGVyKG9yaWdpbmFsU2NvcGUsIHRydWUpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAob25DdXJyZW50UmVxdWVzdCkge1xyXG4gICAgICAgICAgaXNMb2FkaW5nU2V0dGVyKG9yaWdpbmFsU2NvcGUsIGZhbHNlKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0sIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHJlc2V0TWF0Y2hlcygpO1xyXG4gICAgICAgIGlzTG9hZGluZ1NldHRlcihvcmlnaW5hbFNjb3BlLCBmYWxzZSk7XHJcbiAgICAgICAgaXNOb1Jlc3VsdHNTZXR0ZXIob3JpZ2luYWxTY29wZSwgdHJ1ZSk7XHJcbiAgICAgIH0pO1xyXG4gICAgfTtcclxuXHJcbiAgICAvLyBiaW5kIGV2ZW50cyBvbmx5IGlmIGFwcGVuZFRvQm9keSBwYXJhbXMgZXhpc3QgLSBwZXJmb3JtYW5jZSBmZWF0dXJlXHJcbiAgICBpZiAoYXBwZW5kVG9Cb2R5KSB7XHJcbiAgICAgIGFuZ3VsYXIuZWxlbWVudCgkd2luZG93KS5vbigncmVzaXplJywgZmlyZVJlY2FsY3VsYXRpbmcpO1xyXG4gICAgICAkZG9jdW1lbnQuZmluZCgnYm9keScpLm9uKCdzY3JvbGwnLCBmaXJlUmVjYWxjdWxhdGluZyk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gRGVjbGFyZSB0aGUgZGVib3VuY2VkIGZ1bmN0aW9uIG91dHNpZGUgcmVjYWxjdWxhdGluZyBmb3JcclxuICAgIC8vIHByb3BlciBkZWJvdW5jaW5nXHJcbiAgICB2YXIgZGVib3VuY2VkUmVjYWxjdWxhdGUgPSAkJGRlYm91bmNlKGZ1bmN0aW9uKCkge1xyXG4gICAgICAvLyBpZiBwb3B1cCBpcyB2aXNpYmxlXHJcbiAgICAgIGlmIChzY29wZS5tYXRjaGVzLmxlbmd0aCkge1xyXG4gICAgICAgIHJlY2FsY3VsYXRlUG9zaXRpb24oKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgc2NvcGUubW92ZUluUHJvZ3Jlc3MgPSBmYWxzZTtcclxuICAgIH0sIGV2ZW50RGVib3VuY2VUaW1lKTtcclxuXHJcbiAgICAvLyBEZWZhdWx0IHByb2dyZXNzIHR5cGVcclxuICAgIHNjb3BlLm1vdmVJblByb2dyZXNzID0gZmFsc2U7XHJcblxyXG4gICAgZnVuY3Rpb24gZmlyZVJlY2FsY3VsYXRpbmcoKSB7XHJcbiAgICAgIGlmICghc2NvcGUubW92ZUluUHJvZ3Jlc3MpIHtcclxuICAgICAgICBzY29wZS5tb3ZlSW5Qcm9ncmVzcyA9IHRydWU7XHJcbiAgICAgICAgc2NvcGUuJGRpZ2VzdCgpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBkZWJvdW5jZWRSZWNhbGN1bGF0ZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIHJlY2FsY3VsYXRlIGFjdHVhbCBwb3NpdGlvbiBhbmQgc2V0IG5ldyB2YWx1ZXMgdG8gc2NvcGVcclxuICAgIC8vIGFmdGVyIGRpZ2VzdCBsb29wIGlzIHBvcHVwIGluIHJpZ2h0IHBvc2l0aW9uXHJcbiAgICBmdW5jdGlvbiByZWNhbGN1bGF0ZVBvc2l0aW9uKCkge1xyXG4gICAgICBzY29wZS5wb3NpdGlvbiA9IGFwcGVuZFRvQm9keSA/ICRwb3NpdGlvbi5vZmZzZXQoZWxlbWVudCkgOiAkcG9zaXRpb24ucG9zaXRpb24oZWxlbWVudCk7XHJcbiAgICAgIHNjb3BlLnBvc2l0aW9uLnRvcCArPSBlbGVtZW50LnByb3AoJ29mZnNldEhlaWdodCcpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vd2UgbmVlZCB0byBwcm9wYWdhdGUgdXNlcidzIHF1ZXJ5IHNvIHdlIGNhbiBoaWdsaWdodCBtYXRjaGVzXHJcbiAgICBzY29wZS5xdWVyeSA9IHVuZGVmaW5lZDtcclxuXHJcbiAgICAvL0RlY2xhcmUgdGhlIHRpbWVvdXQgcHJvbWlzZSB2YXIgb3V0c2lkZSB0aGUgZnVuY3Rpb24gc2NvcGUgc28gdGhhdCBzdGFja2VkIGNhbGxzIGNhbiBiZSBjYW5jZWxsZWQgbGF0ZXJcclxuICAgIHZhciB0aW1lb3V0UHJvbWlzZTtcclxuXHJcbiAgICB2YXIgc2NoZWR1bGVTZWFyY2hXaXRoVGltZW91dCA9IGZ1bmN0aW9uKGlucHV0VmFsdWUpIHtcclxuICAgICAgdGltZW91dFByb21pc2UgPSAkdGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgICBnZXRNYXRjaGVzQXN5bmMoaW5wdXRWYWx1ZSk7XHJcbiAgICAgIH0sIHdhaXRUaW1lKTtcclxuICAgIH07XHJcblxyXG4gICAgdmFyIGNhbmNlbFByZXZpb3VzVGltZW91dCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICBpZiAodGltZW91dFByb21pc2UpIHtcclxuICAgICAgICAkdGltZW91dC5jYW5jZWwodGltZW91dFByb21pc2UpO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIHJlc2V0TWF0Y2hlcygpO1xyXG5cclxuICAgIHNjb3BlLmFzc2lnbklzT3BlbiA9IGZ1bmN0aW9uIChpc09wZW4pIHtcclxuICAgICAgaXNPcGVuU2V0dGVyKG9yaWdpbmFsU2NvcGUsIGlzT3Blbik7XHJcbiAgICB9O1xyXG5cclxuICAgIHNjb3BlLnNlbGVjdCA9IGZ1bmN0aW9uKGFjdGl2ZUlkeCwgZXZ0KSB7XHJcbiAgICAgIC8vY2FsbGVkIGZyb20gd2l0aGluIHRoZSAkZGlnZXN0KCkgY3ljbGVcclxuICAgICAgdmFyIGxvY2FscyA9IHt9O1xyXG4gICAgICB2YXIgbW9kZWwsIGl0ZW07XHJcblxyXG4gICAgICBzZWxlY3RlZCA9IHRydWU7XHJcbiAgICAgIGxvY2Fsc1twYXJzZXJSZXN1bHQuaXRlbU5hbWVdID0gaXRlbSA9IHNjb3BlLm1hdGNoZXNbYWN0aXZlSWR4XS5tb2RlbDtcclxuICAgICAgbW9kZWwgPSBwYXJzZXJSZXN1bHQubW9kZWxNYXBwZXIob3JpZ2luYWxTY29wZSwgbG9jYWxzKTtcclxuICAgICAgJHNldE1vZGVsVmFsdWUob3JpZ2luYWxTY29wZSwgbW9kZWwpO1xyXG4gICAgICBtb2RlbEN0cmwuJHNldFZhbGlkaXR5KCdlZGl0YWJsZScsIHRydWUpO1xyXG4gICAgICBtb2RlbEN0cmwuJHNldFZhbGlkaXR5KCdwYXJzZScsIHRydWUpO1xyXG5cclxuICAgICAgb25TZWxlY3RDYWxsYmFjayhvcmlnaW5hbFNjb3BlLCB7XHJcbiAgICAgICAgJGl0ZW06IGl0ZW0sXHJcbiAgICAgICAgJG1vZGVsOiBtb2RlbCxcclxuICAgICAgICAkbGFiZWw6IHBhcnNlclJlc3VsdC52aWV3TWFwcGVyKG9yaWdpbmFsU2NvcGUsIGxvY2FscyksXHJcbiAgICAgICAgJGV2ZW50OiBldnRcclxuICAgICAgfSk7XHJcblxyXG4gICAgICByZXNldE1hdGNoZXMoKTtcclxuXHJcbiAgICAgIC8vcmV0dXJuIGZvY3VzIHRvIHRoZSBpbnB1dCBlbGVtZW50IGlmIGEgbWF0Y2ggd2FzIHNlbGVjdGVkIHZpYSBhIG1vdXNlIGNsaWNrIGV2ZW50XHJcbiAgICAgIC8vIHVzZSB0aW1lb3V0IHRvIGF2b2lkICRyb290U2NvcGU6aW5wcm9nIGVycm9yXHJcbiAgICAgIGlmIChzY29wZS4kZXZhbChhdHRycy50eXBlYWhlYWRGb2N1c09uU2VsZWN0KSAhPT0gZmFsc2UpIHtcclxuICAgICAgICAkdGltZW91dChmdW5jdGlvbigpIHsgZWxlbWVudFswXS5mb2N1cygpOyB9LCAwLCBmYWxzZSk7XHJcbiAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgLy9iaW5kIGtleWJvYXJkIGV2ZW50czogYXJyb3dzIHVwKDM4KSAvIGRvd24oNDApLCBlbnRlcigxMykgYW5kIHRhYig5KSwgZXNjKDI3KVxyXG4gICAgZWxlbWVudC5vbigna2V5ZG93bicsIGZ1bmN0aW9uKGV2dCkge1xyXG4gICAgICAvL3R5cGVhaGVhZCBpcyBvcGVuIGFuZCBhbiBcImludGVyZXN0aW5nXCIga2V5IHdhcyBwcmVzc2VkXHJcbiAgICAgIGlmIChzY29wZS5tYXRjaGVzLmxlbmd0aCA9PT0gMCB8fCBIT1RfS0VZUy5pbmRleE9mKGV2dC53aGljaCkgPT09IC0xKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB2YXIgc2hvdWxkU2VsZWN0ID0gaXNTZWxlY3RFdmVudChvcmlnaW5hbFNjb3BlLCB7JGV2ZW50OiBldnR9KTtcclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBpZiB0aGVyZSdzIG5vdGhpbmcgc2VsZWN0ZWQgKGkuZS4gZm9jdXNGaXJzdCkgYW5kIGVudGVyIG9yIHRhYiBpcyBoaXRcclxuICAgICAgICogb3JcclxuICAgICAgICogc2hpZnQgKyB0YWIgaXMgcHJlc3NlZCB0byBicmluZyBmb2N1cyB0byB0aGUgcHJldmlvdXMgZWxlbWVudFxyXG4gICAgICAgKiB0aGVuIGNsZWFyIHRoZSByZXN1bHRzXHJcbiAgICAgICAqL1xyXG4gICAgICBpZiAoc2NvcGUuYWN0aXZlSWR4ID09PSAtMSAmJiBzaG91bGRTZWxlY3QgfHwgZXZ0LndoaWNoID09PSA5ICYmICEhZXZ0LnNoaWZ0S2V5KSB7XHJcbiAgICAgICAgcmVzZXRNYXRjaGVzKCk7XHJcbiAgICAgICAgc2NvcGUuJGRpZ2VzdCgpO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG5cclxuICAgICAgZXZ0LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgIHZhciB0YXJnZXQ7XHJcbiAgICAgIHN3aXRjaCAoZXZ0LndoaWNoKSB7XHJcbiAgICAgICAgY2FzZSAyNzogLy8gZXNjYXBlXHJcbiAgICAgICAgICBldnQuc3RvcFByb3BhZ2F0aW9uKCk7XHJcblxyXG4gICAgICAgICAgcmVzZXRNYXRjaGVzKCk7XHJcbiAgICAgICAgICBvcmlnaW5hbFNjb3BlLiRkaWdlc3QoKTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgMzg6IC8vIHVwIGFycm93XHJcbiAgICAgICAgICBzY29wZS5hY3RpdmVJZHggPSAoc2NvcGUuYWN0aXZlSWR4ID4gMCA/IHNjb3BlLmFjdGl2ZUlkeCA6IHNjb3BlLm1hdGNoZXMubGVuZ3RoKSAtIDE7XHJcbiAgICAgICAgICBzY29wZS4kZGlnZXN0KCk7XHJcbiAgICAgICAgICB0YXJnZXQgPSBwb3BVcEVsWzBdLnF1ZXJ5U2VsZWN0b3JBbGwoJy51aWItdHlwZWFoZWFkLW1hdGNoJylbc2NvcGUuYWN0aXZlSWR4XTtcclxuICAgICAgICAgIHRhcmdldC5wYXJlbnROb2RlLnNjcm9sbFRvcCA9IHRhcmdldC5vZmZzZXRUb3A7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIDQwOiAvLyBkb3duIGFycm93XHJcbiAgICAgICAgICBzY29wZS5hY3RpdmVJZHggPSAoc2NvcGUuYWN0aXZlSWR4ICsgMSkgJSBzY29wZS5tYXRjaGVzLmxlbmd0aDtcclxuICAgICAgICAgIHNjb3BlLiRkaWdlc3QoKTtcclxuICAgICAgICAgIHRhcmdldCA9IHBvcFVwRWxbMF0ucXVlcnlTZWxlY3RvckFsbCgnLnVpYi10eXBlYWhlYWQtbWF0Y2gnKVtzY29wZS5hY3RpdmVJZHhdO1xyXG4gICAgICAgICAgdGFyZ2V0LnBhcmVudE5vZGUuc2Nyb2xsVG9wID0gdGFyZ2V0Lm9mZnNldFRvcDtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICBpZiAoc2hvdWxkU2VsZWN0KSB7XHJcbiAgICAgICAgICAgIHNjb3BlLiRhcHBseShmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICBpZiAoYW5ndWxhci5pc051bWJlcihzY29wZS5kZWJvdW5jZVVwZGF0ZSkgfHwgYW5ndWxhci5pc09iamVjdChzY29wZS5kZWJvdW5jZVVwZGF0ZSkpIHtcclxuICAgICAgICAgICAgICAgICQkZGVib3VuY2UoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgIHNjb3BlLnNlbGVjdChzY29wZS5hY3RpdmVJZHgsIGV2dCk7XHJcbiAgICAgICAgICAgICAgICB9LCBhbmd1bGFyLmlzTnVtYmVyKHNjb3BlLmRlYm91bmNlVXBkYXRlKSA/IHNjb3BlLmRlYm91bmNlVXBkYXRlIDogc2NvcGUuZGVib3VuY2VVcGRhdGVbJ2RlZmF1bHQnXSk7XHJcbiAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHNjb3BlLnNlbGVjdChzY29wZS5hY3RpdmVJZHgsIGV2dCk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgZWxlbWVudC5iaW5kKCdmb2N1cycsIGZ1bmN0aW9uIChldnQpIHtcclxuICAgICAgaGFzRm9jdXMgPSB0cnVlO1xyXG4gICAgICBpZiAobWluTGVuZ3RoID09PSAwICYmICFtb2RlbEN0cmwuJHZpZXdWYWx1ZSkge1xyXG4gICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgZ2V0TWF0Y2hlc0FzeW5jKG1vZGVsQ3RybC4kdmlld1ZhbHVlLCBldnQpO1xyXG4gICAgICAgIH0sIDApO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICBlbGVtZW50LmJpbmQoJ2JsdXInLCBmdW5jdGlvbihldnQpIHtcclxuICAgICAgaWYgKGlzU2VsZWN0T25CbHVyICYmIHNjb3BlLm1hdGNoZXMubGVuZ3RoICYmIHNjb3BlLmFjdGl2ZUlkeCAhPT0gLTEgJiYgIXNlbGVjdGVkKSB7XHJcbiAgICAgICAgc2VsZWN0ZWQgPSB0cnVlO1xyXG4gICAgICAgIHNjb3BlLiRhcHBseShmdW5jdGlvbigpIHtcclxuICAgICAgICAgIGlmIChhbmd1bGFyLmlzT2JqZWN0KHNjb3BlLmRlYm91bmNlVXBkYXRlKSAmJiBhbmd1bGFyLmlzTnVtYmVyKHNjb3BlLmRlYm91bmNlVXBkYXRlLmJsdXIpKSB7XHJcbiAgICAgICAgICAgICQkZGVib3VuY2UoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgc2NvcGUuc2VsZWN0KHNjb3BlLmFjdGl2ZUlkeCwgZXZ0KTtcclxuICAgICAgICAgICAgfSwgc2NvcGUuZGVib3VuY2VVcGRhdGUuYmx1cik7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBzY29wZS5zZWxlY3Qoc2NvcGUuYWN0aXZlSWR4LCBldnQpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICAgIGlmICghaXNFZGl0YWJsZSAmJiBtb2RlbEN0cmwuJGVycm9yLmVkaXRhYmxlKSB7XHJcbiAgICAgICAgbW9kZWxDdHJsLiRzZXRWaWV3VmFsdWUoKTtcclxuICAgICAgICBzY29wZS4kYXBwbHkoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAvLyBSZXNldCB2YWxpZGl0eSBhcyB3ZSBhcmUgY2xlYXJpbmdcclxuICAgICAgICAgIG1vZGVsQ3RybC4kc2V0VmFsaWRpdHkoJ2VkaXRhYmxlJywgdHJ1ZSk7XHJcbiAgICAgICAgICBtb2RlbEN0cmwuJHNldFZhbGlkaXR5KCdwYXJzZScsIHRydWUpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGVsZW1lbnQudmFsKCcnKTtcclxuICAgICAgfVxyXG4gICAgICBoYXNGb2N1cyA9IGZhbHNlO1xyXG4gICAgICBzZWxlY3RlZCA9IGZhbHNlO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gS2VlcCByZWZlcmVuY2UgdG8gY2xpY2sgaGFuZGxlciB0byB1bmJpbmQgaXQuXHJcbiAgICB2YXIgZGlzbWlzc0NsaWNrSGFuZGxlciA9IGZ1bmN0aW9uKGV2dCkge1xyXG4gICAgICAvLyBJc3N1ZSAjMzk3M1xyXG4gICAgICAvLyBGaXJlZm94IHRyZWF0cyByaWdodCBjbGljayBhcyBhIGNsaWNrIG9uIGRvY3VtZW50XHJcbiAgICAgIGlmIChlbGVtZW50WzBdICE9PSBldnQudGFyZ2V0ICYmIGV2dC53aGljaCAhPT0gMyAmJiBzY29wZS5tYXRjaGVzLmxlbmd0aCAhPT0gMCkge1xyXG4gICAgICAgIHJlc2V0TWF0Y2hlcygpO1xyXG4gICAgICAgIGlmICghJHJvb3RTY29wZS4kJHBoYXNlKSB7XHJcbiAgICAgICAgICBvcmlnaW5hbFNjb3BlLiRkaWdlc3QoKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgJGRvY3VtZW50Lm9uKCdjbGljaycsIGRpc21pc3NDbGlja0hhbmRsZXIpO1xyXG5cclxuICAgIG9yaWdpbmFsU2NvcGUuJG9uKCckZGVzdHJveScsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAkZG9jdW1lbnQub2ZmKCdjbGljaycsIGRpc21pc3NDbGlja0hhbmRsZXIpO1xyXG4gICAgICBpZiAoYXBwZW5kVG9Cb2R5IHx8IGFwcGVuZFRvKSB7XHJcbiAgICAgICAgJHBvcHVwLnJlbW92ZSgpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoYXBwZW5kVG9Cb2R5KSB7XHJcbiAgICAgICAgYW5ndWxhci5lbGVtZW50KCR3aW5kb3cpLm9mZigncmVzaXplJywgZmlyZVJlY2FsY3VsYXRpbmcpO1xyXG4gICAgICAgICRkb2N1bWVudC5maW5kKCdib2R5Jykub2ZmKCdzY3JvbGwnLCBmaXJlUmVjYWxjdWxhdGluZyk7XHJcbiAgICAgIH1cclxuICAgICAgLy8gUHJldmVudCBqUXVlcnkgY2FjaGUgbWVtb3J5IGxlYWtcclxuICAgICAgcG9wVXBFbC5yZW1vdmUoKTtcclxuXHJcbiAgICAgIGlmIChzaG93SGludCkge1xyXG4gICAgICAgICAgaW5wdXRzQ29udGFpbmVyLnJlbW92ZSgpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICB2YXIgJHBvcHVwID0gJGNvbXBpbGUocG9wVXBFbCkoc2NvcGUpO1xyXG5cclxuICAgIGlmIChhcHBlbmRUb0JvZHkpIHtcclxuICAgICAgJGRvY3VtZW50LmZpbmQoJ2JvZHknKS5hcHBlbmQoJHBvcHVwKTtcclxuICAgIH0gZWxzZSBpZiAoYXBwZW5kVG8pIHtcclxuICAgICAgYW5ndWxhci5lbGVtZW50KGFwcGVuZFRvKS5lcSgwKS5hcHBlbmQoJHBvcHVwKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGVsZW1lbnQuYWZ0ZXIoJHBvcHVwKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmluaXQgPSBmdW5jdGlvbihfbW9kZWxDdHJsLCBfbmdNb2RlbE9wdGlvbnMpIHtcclxuICAgICAgbW9kZWxDdHJsID0gX21vZGVsQ3RybDtcclxuICAgICAgbmdNb2RlbE9wdGlvbnMgPSBfbmdNb2RlbE9wdGlvbnM7XHJcblxyXG4gICAgICBzY29wZS5kZWJvdW5jZVVwZGF0ZSA9IG1vZGVsQ3RybC4kb3B0aW9ucyAmJiAkcGFyc2UobW9kZWxDdHJsLiRvcHRpb25zLmRlYm91bmNlKShvcmlnaW5hbFNjb3BlKTtcclxuXHJcbiAgICAgIC8vcGx1ZyBpbnRvICRwYXJzZXJzIHBpcGVsaW5lIHRvIG9wZW4gYSB0eXBlYWhlYWQgb24gdmlldyBjaGFuZ2VzIGluaXRpYXRlZCBmcm9tIERPTVxyXG4gICAgICAvLyRwYXJzZXJzIGtpY2staW4gb24gYWxsIHRoZSBjaGFuZ2VzIGNvbWluZyBmcm9tIHRoZSB2aWV3IGFzIHdlbGwgYXMgbWFudWFsbHkgdHJpZ2dlcmVkIGJ5ICRzZXRWaWV3VmFsdWVcclxuICAgICAgbW9kZWxDdHJsLiRwYXJzZXJzLnVuc2hpZnQoZnVuY3Rpb24oaW5wdXRWYWx1ZSkge1xyXG4gICAgICAgIGhhc0ZvY3VzID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgaWYgKG1pbkxlbmd0aCA9PT0gMCB8fCBpbnB1dFZhbHVlICYmIGlucHV0VmFsdWUubGVuZ3RoID49IG1pbkxlbmd0aCkge1xyXG4gICAgICAgICAgaWYgKHdhaXRUaW1lID4gMCkge1xyXG4gICAgICAgICAgICBjYW5jZWxQcmV2aW91c1RpbWVvdXQoKTtcclxuICAgICAgICAgICAgc2NoZWR1bGVTZWFyY2hXaXRoVGltZW91dChpbnB1dFZhbHVlKTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGdldE1hdGNoZXNBc3luYyhpbnB1dFZhbHVlKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgaXNMb2FkaW5nU2V0dGVyKG9yaWdpbmFsU2NvcGUsIGZhbHNlKTtcclxuICAgICAgICAgIGNhbmNlbFByZXZpb3VzVGltZW91dCgpO1xyXG4gICAgICAgICAgcmVzZXRNYXRjaGVzKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoaXNFZGl0YWJsZSkge1xyXG4gICAgICAgICAgcmV0dXJuIGlucHV0VmFsdWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIWlucHV0VmFsdWUpIHtcclxuICAgICAgICAgIC8vIFJlc2V0IGluIGNhc2UgdXNlciBoYWQgdHlwZWQgc29tZXRoaW5nIHByZXZpb3VzbHkuXHJcbiAgICAgICAgICBtb2RlbEN0cmwuJHNldFZhbGlkaXR5KCdlZGl0YWJsZScsIHRydWUpO1xyXG4gICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBtb2RlbEN0cmwuJHNldFZhbGlkaXR5KCdlZGl0YWJsZScsIGZhbHNlKTtcclxuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIG1vZGVsQ3RybC4kZm9ybWF0dGVycy5wdXNoKGZ1bmN0aW9uKG1vZGVsVmFsdWUpIHtcclxuICAgICAgICB2YXIgY2FuZGlkYXRlVmlld1ZhbHVlLCBlbXB0eVZpZXdWYWx1ZTtcclxuICAgICAgICB2YXIgbG9jYWxzID0ge307XHJcblxyXG4gICAgICAgIC8vIFRoZSB2YWxpZGl0eSBtYXkgYmUgc2V0IHRvIGZhbHNlIHZpYSAkcGFyc2VycyAoc2VlIGFib3ZlKSBpZlxyXG4gICAgICAgIC8vIHRoZSBtb2RlbCBpcyByZXN0cmljdGVkIHRvIHNlbGVjdGVkIHZhbHVlcy4gSWYgdGhlIG1vZGVsXHJcbiAgICAgICAgLy8gaXMgc2V0IG1hbnVhbGx5IGl0IGlzIGNvbnNpZGVyZWQgdG8gYmUgdmFsaWQuXHJcbiAgICAgICAgaWYgKCFpc0VkaXRhYmxlKSB7XHJcbiAgICAgICAgICBtb2RlbEN0cmwuJHNldFZhbGlkaXR5KCdlZGl0YWJsZScsIHRydWUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGlucHV0Rm9ybWF0dGVyKSB7XHJcbiAgICAgICAgICBsb2NhbHMuJG1vZGVsID0gbW9kZWxWYWx1ZTtcclxuICAgICAgICAgIHJldHVybiBpbnB1dEZvcm1hdHRlcihvcmlnaW5hbFNjb3BlLCBsb2NhbHMpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy9pdCBtaWdodCBoYXBwZW4gdGhhdCB3ZSBkb24ndCBoYXZlIGVub3VnaCBpbmZvIHRvIHByb3Blcmx5IHJlbmRlciBpbnB1dCB2YWx1ZVxyXG4gICAgICAgIC8vd2UgbmVlZCB0byBjaGVjayBmb3IgdGhpcyBzaXR1YXRpb24gYW5kIHNpbXBseSByZXR1cm4gbW9kZWwgdmFsdWUgaWYgd2UgY2FuJ3QgYXBwbHkgY3VzdG9tIGZvcm1hdHRpbmdcclxuICAgICAgICBsb2NhbHNbcGFyc2VyUmVzdWx0Lml0ZW1OYW1lXSA9IG1vZGVsVmFsdWU7XHJcbiAgICAgICAgY2FuZGlkYXRlVmlld1ZhbHVlID0gcGFyc2VyUmVzdWx0LnZpZXdNYXBwZXIob3JpZ2luYWxTY29wZSwgbG9jYWxzKTtcclxuICAgICAgICBsb2NhbHNbcGFyc2VyUmVzdWx0Lml0ZW1OYW1lXSA9IHVuZGVmaW5lZDtcclxuICAgICAgICBlbXB0eVZpZXdWYWx1ZSA9IHBhcnNlclJlc3VsdC52aWV3TWFwcGVyKG9yaWdpbmFsU2NvcGUsIGxvY2Fscyk7XHJcblxyXG4gICAgICAgIHJldHVybiBjYW5kaWRhdGVWaWV3VmFsdWUgIT09IGVtcHR5Vmlld1ZhbHVlID8gY2FuZGlkYXRlVmlld1ZhbHVlIDogbW9kZWxWYWx1ZTtcclxuICAgICAgfSk7XHJcbiAgICB9O1xyXG4gIH1dKVxyXG5cclxuICAuZGlyZWN0aXZlKCd1aWJUeXBlYWhlYWQnLCBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIGNvbnRyb2xsZXI6ICdVaWJUeXBlYWhlYWRDb250cm9sbGVyJyxcclxuICAgICAgcmVxdWlyZTogWyduZ01vZGVsJywgJ14/bmdNb2RlbE9wdGlvbnMnLCAndWliVHlwZWFoZWFkJ10sXHJcbiAgICAgIGxpbms6IGZ1bmN0aW9uKG9yaWdpbmFsU2NvcGUsIGVsZW1lbnQsIGF0dHJzLCBjdHJscykge1xyXG4gICAgICAgIGN0cmxzWzJdLmluaXQoY3RybHNbMF0sIGN0cmxzWzFdKTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuICB9KVxyXG5cclxuICAuZGlyZWN0aXZlKCd1aWJUeXBlYWhlYWRQb3B1cCcsIFsnJCRkZWJvdW5jZScsIGZ1bmN0aW9uKCQkZGVib3VuY2UpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIHNjb3BlOiB7XHJcbiAgICAgICAgbWF0Y2hlczogJz0nLFxyXG4gICAgICAgIHF1ZXJ5OiAnPScsXHJcbiAgICAgICAgYWN0aXZlOiAnPScsXHJcbiAgICAgICAgcG9zaXRpb246ICcmJyxcclxuICAgICAgICBtb3ZlSW5Qcm9ncmVzczogJz0nLFxyXG4gICAgICAgIHNlbGVjdDogJyYnLFxyXG4gICAgICAgIGFzc2lnbklzT3BlbjogJyYnLFxyXG4gICAgICAgIGRlYm91bmNlOiAnJidcclxuICAgICAgfSxcclxuICAgICAgcmVwbGFjZTogdHJ1ZSxcclxuICAgICAgdGVtcGxhdGVVcmw6IGZ1bmN0aW9uKGVsZW1lbnQsIGF0dHJzKSB7XHJcbiAgICAgICAgcmV0dXJuIGF0dHJzLnBvcHVwVGVtcGxhdGVVcmwgfHwgJ3VpYi90ZW1wbGF0ZS90eXBlYWhlYWQvdHlwZWFoZWFkLXBvcHVwLmh0bWwnO1xyXG4gICAgICB9LFxyXG4gICAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxlbWVudCwgYXR0cnMpIHtcclxuICAgICAgICBzY29wZS50ZW1wbGF0ZVVybCA9IGF0dHJzLnRlbXBsYXRlVXJsO1xyXG5cclxuICAgICAgICBzY29wZS5pc09wZW4gPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgIHZhciBpc0Ryb3Bkb3duT3BlbiA9IHNjb3BlLm1hdGNoZXMubGVuZ3RoID4gMDtcclxuICAgICAgICAgIHNjb3BlLmFzc2lnbklzT3Blbih7IGlzT3BlbjogaXNEcm9wZG93bk9wZW4gfSk7XHJcbiAgICAgICAgICByZXR1cm4gaXNEcm9wZG93bk9wZW47XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgc2NvcGUuaXNBY3RpdmUgPSBmdW5jdGlvbihtYXRjaElkeCkge1xyXG4gICAgICAgICAgcmV0dXJuIHNjb3BlLmFjdGl2ZSA9PT0gbWF0Y2hJZHg7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgc2NvcGUuc2VsZWN0QWN0aXZlID0gZnVuY3Rpb24obWF0Y2hJZHgpIHtcclxuICAgICAgICAgIHNjb3BlLmFjdGl2ZSA9IG1hdGNoSWR4O1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHNjb3BlLnNlbGVjdE1hdGNoID0gZnVuY3Rpb24oYWN0aXZlSWR4LCBldnQpIHtcclxuICAgICAgICAgIHZhciBkZWJvdW5jZSA9IHNjb3BlLmRlYm91bmNlKCk7XHJcbiAgICAgICAgICBpZiAoYW5ndWxhci5pc051bWJlcihkZWJvdW5jZSkgfHwgYW5ndWxhci5pc09iamVjdChkZWJvdW5jZSkpIHtcclxuICAgICAgICAgICAgJCRkZWJvdW5jZShmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICBzY29wZS5zZWxlY3Qoe2FjdGl2ZUlkeDogYWN0aXZlSWR4LCBldnQ6IGV2dH0pO1xyXG4gICAgICAgICAgICB9LCBhbmd1bGFyLmlzTnVtYmVyKGRlYm91bmNlKSA/IGRlYm91bmNlIDogZGVib3VuY2VbJ2RlZmF1bHQnXSk7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBzY29wZS5zZWxlY3Qoe2FjdGl2ZUlkeDogYWN0aXZlSWR4LCBldnQ6IGV2dH0pO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICAgIH1cclxuICAgIH07XHJcbiAgfV0pXHJcblxyXG4gIC5kaXJlY3RpdmUoJ3VpYlR5cGVhaGVhZE1hdGNoJywgWyckdGVtcGxhdGVSZXF1ZXN0JywgJyRjb21waWxlJywgJyRwYXJzZScsIGZ1bmN0aW9uKCR0ZW1wbGF0ZVJlcXVlc3QsICRjb21waWxlLCAkcGFyc2UpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIHNjb3BlOiB7XHJcbiAgICAgICAgaW5kZXg6ICc9JyxcclxuICAgICAgICBtYXRjaDogJz0nLFxyXG4gICAgICAgIHF1ZXJ5OiAnPSdcclxuICAgICAgfSxcclxuICAgICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsZW1lbnQsIGF0dHJzKSB7XHJcbiAgICAgICAgdmFyIHRwbFVybCA9ICRwYXJzZShhdHRycy50ZW1wbGF0ZVVybCkoc2NvcGUuJHBhcmVudCkgfHwgJ3VpYi90ZW1wbGF0ZS90eXBlYWhlYWQvdHlwZWFoZWFkLW1hdGNoLmh0bWwnO1xyXG4gICAgICAgICR0ZW1wbGF0ZVJlcXVlc3QodHBsVXJsKS50aGVuKGZ1bmN0aW9uKHRwbENvbnRlbnQpIHtcclxuICAgICAgICAgIHZhciB0cGxFbCA9IGFuZ3VsYXIuZWxlbWVudCh0cGxDb250ZW50LnRyaW0oKSk7XHJcbiAgICAgICAgICBlbGVtZW50LnJlcGxhY2VXaXRoKHRwbEVsKTtcclxuICAgICAgICAgICRjb21waWxlKHRwbEVsKShzY29wZSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgIH07XHJcbiAgfV0pXHJcblxyXG4gIC5maWx0ZXIoJ3VpYlR5cGVhaGVhZEhpZ2hsaWdodCcsIFsnJHNjZScsICckaW5qZWN0b3InLCAnJGxvZycsIGZ1bmN0aW9uKCRzY2UsICRpbmplY3RvciwgJGxvZykge1xyXG4gICAgdmFyIGlzU2FuaXRpemVQcmVzZW50O1xyXG4gICAgaXNTYW5pdGl6ZVByZXNlbnQgPSAkaW5qZWN0b3IuaGFzKCckc2FuaXRpemUnKTtcclxuXHJcbiAgICBmdW5jdGlvbiBlc2NhcGVSZWdleHAocXVlcnlUb0VzY2FwZSkge1xyXG4gICAgICAvLyBSZWdleDogY2FwdHVyZSB0aGUgd2hvbGUgcXVlcnkgc3RyaW5nIGFuZCByZXBsYWNlIGl0IHdpdGggdGhlIHN0cmluZyB0aGF0IHdpbGwgYmUgdXNlZCB0byBtYXRjaFxyXG4gICAgICAvLyB0aGUgcmVzdWx0cywgZm9yIGV4YW1wbGUgaWYgdGhlIGNhcHR1cmUgaXMgXCJhXCIgdGhlIHJlc3VsdCB3aWxsIGJlIFxcYVxyXG4gICAgICByZXR1cm4gcXVlcnlUb0VzY2FwZS5yZXBsYWNlKC8oWy4/KiteJFtcXF1cXFxcKCl7fXwtXSkvZywgJ1xcXFwkMScpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGNvbnRhaW5zSHRtbChtYXRjaEl0ZW0pIHtcclxuICAgICAgcmV0dXJuIC88Lio+L2cudGVzdChtYXRjaEl0ZW0pO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBmdW5jdGlvbihtYXRjaEl0ZW0sIHF1ZXJ5KSB7XHJcbiAgICAgIGlmICghaXNTYW5pdGl6ZVByZXNlbnQgJiYgY29udGFpbnNIdG1sKG1hdGNoSXRlbSkpIHtcclxuICAgICAgICAkbG9nLndhcm4oJ1Vuc2FmZSB1c2Ugb2YgdHlwZWFoZWFkIHBsZWFzZSB1c2UgbmdTYW5pdGl6ZScpOyAvLyBXYXJuIHRoZSB1c2VyIGFib3V0IHRoZSBkYW5nZXJcclxuICAgICAgfVxyXG4gICAgICBtYXRjaEl0ZW0gPSBxdWVyeSA/ICgnJyArIG1hdGNoSXRlbSkucmVwbGFjZShuZXcgUmVnRXhwKGVzY2FwZVJlZ2V4cChxdWVyeSksICdnaScpLCAnPHN0cm9uZz4kJjwvc3Ryb25nPicpIDogbWF0Y2hJdGVtOyAvLyBSZXBsYWNlcyB0aGUgY2FwdHVyZSBzdHJpbmcgd2l0aCBhIHRoZSBzYW1lIHN0cmluZyBpbnNpZGUgb2YgYSBcInN0cm9uZ1wiIHRhZ1xyXG4gICAgICBpZiAoIWlzU2FuaXRpemVQcmVzZW50KSB7XHJcbiAgICAgICAgbWF0Y2hJdGVtID0gJHNjZS50cnVzdEFzSHRtbChtYXRjaEl0ZW0pOyAvLyBJZiAkc2FuaXRpemUgaXMgbm90IHByZXNlbnQgd2UgcGFjayB0aGUgc3RyaW5nIGluIGEgJHNjZSBvYmplY3QgZm9yIHRoZSBuZy1iaW5kLWh0bWwgZGlyZWN0aXZlXHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIG1hdGNoSXRlbTtcclxuICAgIH07XHJcbiAgfV0pO1xyXG5cclxuYW5ndWxhci5tb2R1bGUoXCJ1aWIvdGVtcGxhdGUvYWNjb3JkaW9uL2FjY29yZGlvbi1ncm91cC5odG1sXCIsIFtdKS5ydW4oW1wiJHRlbXBsYXRlQ2FjaGVcIiwgZnVuY3Rpb24oJHRlbXBsYXRlQ2FjaGUpIHtcclxuICAkdGVtcGxhdGVDYWNoZS5wdXQoXCJ1aWIvdGVtcGxhdGUvYWNjb3JkaW9uL2FjY29yZGlvbi1ncm91cC5odG1sXCIsXHJcbiAgICBcIjxkaXYgcm9sZT1cXFwidGFiXFxcIiBpZD1cXFwie3s6OmhlYWRpbmdJZH19XFxcIiBhcmlhLXNlbGVjdGVkPVxcXCJ7e2lzT3Blbn19XFxcIiBjbGFzcz1cXFwicGFuZWwtaGVhZGluZ1xcXCIgbmcta2V5cHJlc3M9XFxcInRvZ2dsZU9wZW4oJGV2ZW50KVxcXCI+XFxuXCIgK1xyXG4gICAgXCIgIDxoNCBjbGFzcz1cXFwicGFuZWwtdGl0bGVcXFwiPlxcblwiICtcclxuICAgIFwiICAgIDxhIHJvbGU9XFxcImJ1dHRvblxcXCIgZGF0YS10b2dnbGU9XFxcImNvbGxhcHNlXFxcIiBocmVmIGFyaWEtZXhwYW5kZWQ9XFxcInt7aXNPcGVufX1cXFwiIGFyaWEtY29udHJvbHM9XFxcInt7OjpwYW5lbElkfX1cXFwiIHRhYmluZGV4PVxcXCIwXFxcIiBjbGFzcz1cXFwiYWNjb3JkaW9uLXRvZ2dsZVxcXCIgbmctY2xpY2s9XFxcInRvZ2dsZU9wZW4oKVxcXCIgdWliLWFjY29yZGlvbi10cmFuc2NsdWRlPVxcXCJoZWFkaW5nXFxcIiBuZy1kaXNhYmxlZD1cXFwiaXNEaXNhYmxlZFxcXCIgdWliLXRhYmluZGV4LXRvZ2dsZT48c3BhbiB1aWItYWNjb3JkaW9uLWhlYWRlciBuZy1jbGFzcz1cXFwieyd0ZXh0LW11dGVkJzogaXNEaXNhYmxlZH1cXFwiPnt7aGVhZGluZ319PC9zcGFuPjwvYT5cXG5cIiArXHJcbiAgICBcIiAgPC9oND5cXG5cIiArXHJcbiAgICBcIjwvZGl2PlxcblwiICtcclxuICAgIFwiPGRpdiBpZD1cXFwie3s6OnBhbmVsSWR9fVxcXCIgYXJpYS1sYWJlbGxlZGJ5PVxcXCJ7ezo6aGVhZGluZ0lkfX1cXFwiIGFyaWEtaGlkZGVuPVxcXCJ7eyFpc09wZW59fVxcXCIgcm9sZT1cXFwidGFicGFuZWxcXFwiIGNsYXNzPVxcXCJwYW5lbC1jb2xsYXBzZSBjb2xsYXBzZVxcXCIgdWliLWNvbGxhcHNlPVxcXCIhaXNPcGVuXFxcIj5cXG5cIiArXHJcbiAgICBcIiAgPGRpdiBjbGFzcz1cXFwicGFuZWwtYm9keVxcXCIgbmctdHJhbnNjbHVkZT48L2Rpdj5cXG5cIiArXHJcbiAgICBcIjwvZGl2PlxcblwiICtcclxuICAgIFwiXCIpO1xyXG59XSk7XHJcblxyXG5hbmd1bGFyLm1vZHVsZShcInVpYi90ZW1wbGF0ZS9hY2NvcmRpb24vYWNjb3JkaW9uLmh0bWxcIiwgW10pLnJ1bihbXCIkdGVtcGxhdGVDYWNoZVwiLCBmdW5jdGlvbigkdGVtcGxhdGVDYWNoZSkge1xyXG4gICR0ZW1wbGF0ZUNhY2hlLnB1dChcInVpYi90ZW1wbGF0ZS9hY2NvcmRpb24vYWNjb3JkaW9uLmh0bWxcIixcclxuICAgIFwiPGRpdiByb2xlPVxcXCJ0YWJsaXN0XFxcIiBjbGFzcz1cXFwicGFuZWwtZ3JvdXBcXFwiIG5nLXRyYW5zY2x1ZGU+PC9kaXY+XCIpO1xyXG59XSk7XHJcblxyXG5hbmd1bGFyLm1vZHVsZShcInVpYi90ZW1wbGF0ZS9hbGVydC9hbGVydC5odG1sXCIsIFtdKS5ydW4oW1wiJHRlbXBsYXRlQ2FjaGVcIiwgZnVuY3Rpb24oJHRlbXBsYXRlQ2FjaGUpIHtcclxuICAkdGVtcGxhdGVDYWNoZS5wdXQoXCJ1aWIvdGVtcGxhdGUvYWxlcnQvYWxlcnQuaHRtbFwiLFxyXG4gICAgXCI8YnV0dG9uIG5nLXNob3c9XFxcImNsb3NlYWJsZVxcXCIgdHlwZT1cXFwiYnV0dG9uXFxcIiBjbGFzcz1cXFwiY2xvc2VcXFwiIG5nLWNsaWNrPVxcXCJjbG9zZSh7JGV2ZW50OiAkZXZlbnR9KVxcXCI+XFxuXCIgK1xyXG4gICAgXCIgIDxzcGFuIGFyaWEtaGlkZGVuPVxcXCJ0cnVlXFxcIj4mdGltZXM7PC9zcGFuPlxcblwiICtcclxuICAgIFwiICA8c3BhbiBjbGFzcz1cXFwic3Itb25seVxcXCI+Q2xvc2U8L3NwYW4+XFxuXCIgK1xyXG4gICAgXCI8L2J1dHRvbj5cXG5cIiArXHJcbiAgICBcIjxkaXYgbmctdHJhbnNjbHVkZT48L2Rpdj5cXG5cIiArXHJcbiAgICBcIlwiKTtcclxufV0pO1xyXG5cclxuYW5ndWxhci5tb2R1bGUoXCJ1aWIvdGVtcGxhdGUvY2Fyb3VzZWwvY2Fyb3VzZWwuaHRtbFwiLCBbXSkucnVuKFtcIiR0ZW1wbGF0ZUNhY2hlXCIsIGZ1bmN0aW9uKCR0ZW1wbGF0ZUNhY2hlKSB7XHJcbiAgJHRlbXBsYXRlQ2FjaGUucHV0KFwidWliL3RlbXBsYXRlL2Nhcm91c2VsL2Nhcm91c2VsLmh0bWxcIixcclxuICAgIFwiPGRpdiBjbGFzcz1cXFwiY2Fyb3VzZWwtaW5uZXJcXFwiIG5nLXRyYW5zY2x1ZGU+PC9kaXY+XFxuXCIgK1xyXG4gICAgXCI8YSByb2xlPVxcXCJidXR0b25cXFwiIGhyZWYgY2xhc3M9XFxcImxlZnQgY2Fyb3VzZWwtY29udHJvbFxcXCIgbmctY2xpY2s9XFxcInByZXYoKVxcXCIgbmctY2xhc3M9XFxcInsgZGlzYWJsZWQ6IGlzUHJldkRpc2FibGVkKCkgfVxcXCIgbmctc2hvdz1cXFwic2xpZGVzLmxlbmd0aCA+IDFcXFwiPlxcblwiICtcclxuICAgIFwiICA8c3BhbiBhcmlhLWhpZGRlbj1cXFwidHJ1ZVxcXCIgY2xhc3M9XFxcImdseXBoaWNvbiBnbHlwaGljb24tY2hldnJvbi1sZWZ0XFxcIj48L3NwYW4+XFxuXCIgK1xyXG4gICAgXCIgIDxzcGFuIGNsYXNzPVxcXCJzci1vbmx5XFxcIj5wcmV2aW91czwvc3Bhbj5cXG5cIiArXHJcbiAgICBcIjwvYT5cXG5cIiArXHJcbiAgICBcIjxhIHJvbGU9XFxcImJ1dHRvblxcXCIgaHJlZiBjbGFzcz1cXFwicmlnaHQgY2Fyb3VzZWwtY29udHJvbFxcXCIgbmctY2xpY2s9XFxcIm5leHQoKVxcXCIgbmctY2xhc3M9XFxcInsgZGlzYWJsZWQ6IGlzTmV4dERpc2FibGVkKCkgfVxcXCIgbmctc2hvdz1cXFwic2xpZGVzLmxlbmd0aCA+IDFcXFwiPlxcblwiICtcclxuICAgIFwiICA8c3BhbiBhcmlhLWhpZGRlbj1cXFwidHJ1ZVxcXCIgY2xhc3M9XFxcImdseXBoaWNvbiBnbHlwaGljb24tY2hldnJvbi1yaWdodFxcXCI+PC9zcGFuPlxcblwiICtcclxuICAgIFwiICA8c3BhbiBjbGFzcz1cXFwic3Itb25seVxcXCI+bmV4dDwvc3Bhbj5cXG5cIiArXHJcbiAgICBcIjwvYT5cXG5cIiArXHJcbiAgICBcIjxvbCBjbGFzcz1cXFwiY2Fyb3VzZWwtaW5kaWNhdG9yc1xcXCIgbmctc2hvdz1cXFwic2xpZGVzLmxlbmd0aCA+IDFcXFwiPlxcblwiICtcclxuICAgIFwiICA8bGkgbmctcmVwZWF0PVxcXCJzbGlkZSBpbiBzbGlkZXMgfCBvcmRlckJ5OmluZGV4T2ZTbGlkZSB0cmFjayBieSAkaW5kZXhcXFwiIG5nLWNsYXNzPVxcXCJ7IGFjdGl2ZTogaXNBY3RpdmUoc2xpZGUpIH1cXFwiIG5nLWNsaWNrPVxcXCJzZWxlY3Qoc2xpZGUpXFxcIj5cXG5cIiArXHJcbiAgICBcIiAgICA8c3BhbiBjbGFzcz1cXFwic3Itb25seVxcXCI+c2xpZGUge3sgJGluZGV4ICsgMSB9fSBvZiB7eyBzbGlkZXMubGVuZ3RoIH19PHNwYW4gbmctaWY9XFxcImlzQWN0aXZlKHNsaWRlKVxcXCI+LCBjdXJyZW50bHkgYWN0aXZlPC9zcGFuPjwvc3Bhbj5cXG5cIiArXHJcbiAgICBcIiAgPC9saT5cXG5cIiArXHJcbiAgICBcIjwvb2w+XFxuXCIgK1xyXG4gICAgXCJcIik7XHJcbn1dKTtcclxuXHJcbmFuZ3VsYXIubW9kdWxlKFwidWliL3RlbXBsYXRlL2Nhcm91c2VsL3NsaWRlLmh0bWxcIiwgW10pLnJ1bihbXCIkdGVtcGxhdGVDYWNoZVwiLCBmdW5jdGlvbigkdGVtcGxhdGVDYWNoZSkge1xyXG4gICR0ZW1wbGF0ZUNhY2hlLnB1dChcInVpYi90ZW1wbGF0ZS9jYXJvdXNlbC9zbGlkZS5odG1sXCIsXHJcbiAgICBcIjxkaXYgY2xhc3M9XFxcInRleHQtY2VudGVyXFxcIiBuZy10cmFuc2NsdWRlPjwvZGl2PlxcblwiICtcclxuICAgIFwiXCIpO1xyXG59XSk7XHJcblxyXG5hbmd1bGFyLm1vZHVsZShcInVpYi90ZW1wbGF0ZS9kYXRlcGlja2VyL2RhdGVwaWNrZXIuaHRtbFwiLCBbXSkucnVuKFtcIiR0ZW1wbGF0ZUNhY2hlXCIsIGZ1bmN0aW9uKCR0ZW1wbGF0ZUNhY2hlKSB7XHJcbiAgJHRlbXBsYXRlQ2FjaGUucHV0KFwidWliL3RlbXBsYXRlL2RhdGVwaWNrZXIvZGF0ZXBpY2tlci5odG1sXCIsXHJcbiAgICBcIjxkaXYgbmctc3dpdGNoPVxcXCJkYXRlcGlja2VyTW9kZVxcXCI+XFxuXCIgK1xyXG4gICAgXCIgIDxkaXYgdWliLWRheXBpY2tlciBuZy1zd2l0Y2gtd2hlbj1cXFwiZGF5XFxcIiB0YWJpbmRleD1cXFwiMFxcXCIgY2xhc3M9XFxcInVpYi1kYXlwaWNrZXJcXFwiPjwvZGl2PlxcblwiICtcclxuICAgIFwiICA8ZGl2IHVpYi1tb250aHBpY2tlciBuZy1zd2l0Y2gtd2hlbj1cXFwibW9udGhcXFwiIHRhYmluZGV4PVxcXCIwXFxcIiBjbGFzcz1cXFwidWliLW1vbnRocGlja2VyXFxcIj48L2Rpdj5cXG5cIiArXHJcbiAgICBcIiAgPGRpdiB1aWIteWVhcnBpY2tlciBuZy1zd2l0Y2gtd2hlbj1cXFwieWVhclxcXCIgdGFiaW5kZXg9XFxcIjBcXFwiIGNsYXNzPVxcXCJ1aWIteWVhcnBpY2tlclxcXCI+PC9kaXY+XFxuXCIgK1xyXG4gICAgXCI8L2Rpdj5cXG5cIiArXHJcbiAgICBcIlwiKTtcclxufV0pO1xyXG5cclxuYW5ndWxhci5tb2R1bGUoXCJ1aWIvdGVtcGxhdGUvZGF0ZXBpY2tlci9kYXkuaHRtbFwiLCBbXSkucnVuKFtcIiR0ZW1wbGF0ZUNhY2hlXCIsIGZ1bmN0aW9uKCR0ZW1wbGF0ZUNhY2hlKSB7XHJcbiAgJHRlbXBsYXRlQ2FjaGUucHV0KFwidWliL3RlbXBsYXRlL2RhdGVwaWNrZXIvZGF5Lmh0bWxcIixcclxuICAgIFwiPHRhYmxlIHJvbGU9XFxcImdyaWRcXFwiIGFyaWEtbGFiZWxsZWRieT1cXFwie3s6OnVuaXF1ZUlkfX0tdGl0bGVcXFwiIGFyaWEtYWN0aXZlZGVzY2VuZGFudD1cXFwie3thY3RpdmVEYXRlSWR9fVxcXCI+XFxuXCIgK1xyXG4gICAgXCIgIDx0aGVhZD5cXG5cIiArXHJcbiAgICBcIiAgICA8dHI+XFxuXCIgK1xyXG4gICAgXCIgICAgICA8dGg+PGJ1dHRvbiB0eXBlPVxcXCJidXR0b25cXFwiIGNsYXNzPVxcXCJidG4gYnRuLWRlZmF1bHQgYnRuLXNtIHB1bGwtbGVmdCB1aWItbGVmdFxcXCIgbmctY2xpY2s9XFxcIm1vdmUoLTEpXFxcIiB0YWJpbmRleD1cXFwiLTFcXFwiPjxpIGFyaWEtaGlkZGVuPVxcXCJ0cnVlXFxcIiBjbGFzcz1cXFwiZ2x5cGhpY29uIGdseXBoaWNvbi1jaGV2cm9uLWxlZnRcXFwiPjwvaT48c3BhbiBjbGFzcz1cXFwic3Itb25seVxcXCI+cHJldmlvdXM8L3NwYW4+PC9idXR0b24+PC90aD5cXG5cIiArXHJcbiAgICBcIiAgICAgIDx0aCBjb2xzcGFuPVxcXCJ7ezo6NSArIHNob3dXZWVrc319XFxcIj48YnV0dG9uIGlkPVxcXCJ7ezo6dW5pcXVlSWR9fS10aXRsZVxcXCIgcm9sZT1cXFwiaGVhZGluZ1xcXCIgYXJpYS1saXZlPVxcXCJhc3NlcnRpdmVcXFwiIGFyaWEtYXRvbWljPVxcXCJ0cnVlXFxcIiB0eXBlPVxcXCJidXR0b25cXFwiIGNsYXNzPVxcXCJidG4gYnRuLWRlZmF1bHQgYnRuLXNtIHVpYi10aXRsZVxcXCIgbmctY2xpY2s9XFxcInRvZ2dsZU1vZGUoKVxcXCIgbmctZGlzYWJsZWQ9XFxcImRhdGVwaWNrZXJNb2RlID09PSBtYXhNb2RlXFxcIiB0YWJpbmRleD1cXFwiLTFcXFwiPjxzdHJvbmc+e3t0aXRsZX19PC9zdHJvbmc+PC9idXR0b24+PC90aD5cXG5cIiArXHJcbiAgICBcIiAgICAgIDx0aD48YnV0dG9uIHR5cGU9XFxcImJ1dHRvblxcXCIgY2xhc3M9XFxcImJ0biBidG4tZGVmYXVsdCBidG4tc20gcHVsbC1yaWdodCB1aWItcmlnaHRcXFwiIG5nLWNsaWNrPVxcXCJtb3ZlKDEpXFxcIiB0YWJpbmRleD1cXFwiLTFcXFwiPjxpIGFyaWEtaGlkZGVuPVxcXCJ0cnVlXFxcIiBjbGFzcz1cXFwiZ2x5cGhpY29uIGdseXBoaWNvbi1jaGV2cm9uLXJpZ2h0XFxcIj48L2k+PHNwYW4gY2xhc3M9XFxcInNyLW9ubHlcXFwiPm5leHQ8L3NwYW4+PC9idXR0b24+PC90aD5cXG5cIiArXHJcbiAgICBcIiAgICA8L3RyPlxcblwiICtcclxuICAgIFwiICAgIDx0cj5cXG5cIiArXHJcbiAgICBcIiAgICAgIDx0aCBuZy1pZj1cXFwic2hvd1dlZWtzXFxcIiBjbGFzcz1cXFwidGV4dC1jZW50ZXJcXFwiPjwvdGg+XFxuXCIgK1xyXG4gICAgXCIgICAgICA8dGggbmctcmVwZWF0PVxcXCJsYWJlbCBpbiA6OmxhYmVscyB0cmFjayBieSAkaW5kZXhcXFwiIGNsYXNzPVxcXCJ0ZXh0LWNlbnRlclxcXCI+PHNtYWxsIGFyaWEtbGFiZWw9XFxcInt7OjpsYWJlbC5mdWxsfX1cXFwiPnt7OjpsYWJlbC5hYmJyfX08L3NtYWxsPjwvdGg+XFxuXCIgK1xyXG4gICAgXCIgICAgPC90cj5cXG5cIiArXHJcbiAgICBcIiAgPC90aGVhZD5cXG5cIiArXHJcbiAgICBcIiAgPHRib2R5PlxcblwiICtcclxuICAgIFwiICAgIDx0ciBjbGFzcz1cXFwidWliLXdlZWtzXFxcIiBuZy1yZXBlYXQ9XFxcInJvdyBpbiByb3dzIHRyYWNrIGJ5ICRpbmRleFxcXCIgcm9sZT1cXFwicm93XFxcIj5cXG5cIiArXHJcbiAgICBcIiAgICAgIDx0ZCBuZy1pZj1cXFwic2hvd1dlZWtzXFxcIiBjbGFzcz1cXFwidGV4dC1jZW50ZXIgaDZcXFwiPjxlbT57eyB3ZWVrTnVtYmVyc1skaW5kZXhdIH19PC9lbT48L3RkPlxcblwiICtcclxuICAgIFwiICAgICAgPHRkIG5nLXJlcGVhdD1cXFwiZHQgaW4gcm93XFxcIiBjbGFzcz1cXFwidWliLWRheSB0ZXh0LWNlbnRlclxcXCIgcm9sZT1cXFwiZ3JpZGNlbGxcXFwiXFxuXCIgK1xyXG4gICAgXCIgICAgICAgIGlkPVxcXCJ7ezo6ZHQudWlkfX1cXFwiXFxuXCIgK1xyXG4gICAgXCIgICAgICAgIG5nLWNsYXNzPVxcXCI6OmR0LmN1c3RvbUNsYXNzXFxcIj5cXG5cIiArXHJcbiAgICBcIiAgICAgICAgPGJ1dHRvbiB0eXBlPVxcXCJidXR0b25cXFwiIGNsYXNzPVxcXCJidG4gYnRuLWRlZmF1bHQgYnRuLXNtXFxcIlxcblwiICtcclxuICAgIFwiICAgICAgICAgIHVpYi1pcy1jbGFzcz1cXFwiXFxuXCIgK1xyXG4gICAgXCIgICAgICAgICAgICAnYnRuLWluZm8nIGZvciBzZWxlY3RlZER0LFxcblwiICtcclxuICAgIFwiICAgICAgICAgICAgJ2FjdGl2ZScgZm9yIGFjdGl2ZUR0XFxuXCIgK1xyXG4gICAgXCIgICAgICAgICAgICBvbiBkdFxcXCJcXG5cIiArXHJcbiAgICBcIiAgICAgICAgICBuZy1jbGljaz1cXFwic2VsZWN0KGR0LmRhdGUpXFxcIlxcblwiICtcclxuICAgIFwiICAgICAgICAgIG5nLWRpc2FibGVkPVxcXCI6OmR0LmRpc2FibGVkXFxcIlxcblwiICtcclxuICAgIFwiICAgICAgICAgIHRhYmluZGV4PVxcXCItMVxcXCI+PHNwYW4gbmctY2xhc3M9XFxcIjo6eyd0ZXh0LW11dGVkJzogZHQuc2Vjb25kYXJ5LCAndGV4dC1pbmZvJzogZHQuY3VycmVudH1cXFwiPnt7OjpkdC5sYWJlbH19PC9zcGFuPjwvYnV0dG9uPlxcblwiICtcclxuICAgIFwiICAgICAgPC90ZD5cXG5cIiArXHJcbiAgICBcIiAgICA8L3RyPlxcblwiICtcclxuICAgIFwiICA8L3Rib2R5PlxcblwiICtcclxuICAgIFwiPC90YWJsZT5cXG5cIiArXHJcbiAgICBcIlwiKTtcclxufV0pO1xyXG5cclxuYW5ndWxhci5tb2R1bGUoXCJ1aWIvdGVtcGxhdGUvZGF0ZXBpY2tlci9tb250aC5odG1sXCIsIFtdKS5ydW4oW1wiJHRlbXBsYXRlQ2FjaGVcIiwgZnVuY3Rpb24oJHRlbXBsYXRlQ2FjaGUpIHtcclxuICAkdGVtcGxhdGVDYWNoZS5wdXQoXCJ1aWIvdGVtcGxhdGUvZGF0ZXBpY2tlci9tb250aC5odG1sXCIsXHJcbiAgICBcIjx0YWJsZSByb2xlPVxcXCJncmlkXFxcIiBhcmlhLWxhYmVsbGVkYnk9XFxcInt7Ojp1bmlxdWVJZH19LXRpdGxlXFxcIiBhcmlhLWFjdGl2ZWRlc2NlbmRhbnQ9XFxcInt7YWN0aXZlRGF0ZUlkfX1cXFwiPlxcblwiICtcclxuICAgIFwiICA8dGhlYWQ+XFxuXCIgK1xyXG4gICAgXCIgICAgPHRyPlxcblwiICtcclxuICAgIFwiICAgICAgPHRoPjxidXR0b24gdHlwZT1cXFwiYnV0dG9uXFxcIiBjbGFzcz1cXFwiYnRuIGJ0bi1kZWZhdWx0IGJ0bi1zbSBwdWxsLWxlZnQgdWliLWxlZnRcXFwiIG5nLWNsaWNrPVxcXCJtb3ZlKC0xKVxcXCIgdGFiaW5kZXg9XFxcIi0xXFxcIj48aSBhcmlhLWhpZGRlbj1cXFwidHJ1ZVxcXCIgY2xhc3M9XFxcImdseXBoaWNvbiBnbHlwaGljb24tY2hldnJvbi1sZWZ0XFxcIj48L2k+PHNwYW4gY2xhc3M9XFxcInNyLW9ubHlcXFwiPnByZXZpb3VzPC9zcGFuPjwvYnV0dG9uPjwvdGg+XFxuXCIgK1xyXG4gICAgXCIgICAgICA8dGggY29sc3Bhbj1cXFwie3s6OnllYXJIZWFkZXJDb2xzcGFufX1cXFwiPjxidXR0b24gaWQ9XFxcInt7Ojp1bmlxdWVJZH19LXRpdGxlXFxcIiByb2xlPVxcXCJoZWFkaW5nXFxcIiBhcmlhLWxpdmU9XFxcImFzc2VydGl2ZVxcXCIgYXJpYS1hdG9taWM9XFxcInRydWVcXFwiIHR5cGU9XFxcImJ1dHRvblxcXCIgY2xhc3M9XFxcImJ0biBidG4tZGVmYXVsdCBidG4tc20gdWliLXRpdGxlXFxcIiBuZy1jbGljaz1cXFwidG9nZ2xlTW9kZSgpXFxcIiBuZy1kaXNhYmxlZD1cXFwiZGF0ZXBpY2tlck1vZGUgPT09IG1heE1vZGVcXFwiIHRhYmluZGV4PVxcXCItMVxcXCI+PHN0cm9uZz57e3RpdGxlfX08L3N0cm9uZz48L2J1dHRvbj48L3RoPlxcblwiICtcclxuICAgIFwiICAgICAgPHRoPjxidXR0b24gdHlwZT1cXFwiYnV0dG9uXFxcIiBjbGFzcz1cXFwiYnRuIGJ0bi1kZWZhdWx0IGJ0bi1zbSBwdWxsLXJpZ2h0IHVpYi1yaWdodFxcXCIgbmctY2xpY2s9XFxcIm1vdmUoMSlcXFwiIHRhYmluZGV4PVxcXCItMVxcXCI+PGkgYXJpYS1oaWRkZW49XFxcInRydWVcXFwiIGNsYXNzPVxcXCJnbHlwaGljb24gZ2x5cGhpY29uLWNoZXZyb24tcmlnaHRcXFwiPjwvaT48c3BhbiBjbGFzcz1cXFwic3Itb25seVxcXCI+bmV4dDwvc3Bhbj48L2k+PC9idXR0b24+PC90aD5cXG5cIiArXHJcbiAgICBcIiAgICA8L3RyPlxcblwiICtcclxuICAgIFwiICA8L3RoZWFkPlxcblwiICtcclxuICAgIFwiICA8dGJvZHk+XFxuXCIgK1xyXG4gICAgXCIgICAgPHRyIGNsYXNzPVxcXCJ1aWItbW9udGhzXFxcIiBuZy1yZXBlYXQ9XFxcInJvdyBpbiByb3dzIHRyYWNrIGJ5ICRpbmRleFxcXCIgcm9sZT1cXFwicm93XFxcIj5cXG5cIiArXHJcbiAgICBcIiAgICAgIDx0ZCBuZy1yZXBlYXQ9XFxcImR0IGluIHJvd1xcXCIgY2xhc3M9XFxcInVpYi1tb250aCB0ZXh0LWNlbnRlclxcXCIgcm9sZT1cXFwiZ3JpZGNlbGxcXFwiXFxuXCIgK1xyXG4gICAgXCIgICAgICAgIGlkPVxcXCJ7ezo6ZHQudWlkfX1cXFwiXFxuXCIgK1xyXG4gICAgXCIgICAgICAgIG5nLWNsYXNzPVxcXCI6OmR0LmN1c3RvbUNsYXNzXFxcIj5cXG5cIiArXHJcbiAgICBcIiAgICAgICAgPGJ1dHRvbiB0eXBlPVxcXCJidXR0b25cXFwiIGNsYXNzPVxcXCJidG4gYnRuLWRlZmF1bHRcXFwiXFxuXCIgK1xyXG4gICAgXCIgICAgICAgICAgdWliLWlzLWNsYXNzPVxcXCJcXG5cIiArXHJcbiAgICBcIiAgICAgICAgICAgICdidG4taW5mbycgZm9yIHNlbGVjdGVkRHQsXFxuXCIgK1xyXG4gICAgXCIgICAgICAgICAgICAnYWN0aXZlJyBmb3IgYWN0aXZlRHRcXG5cIiArXHJcbiAgICBcIiAgICAgICAgICAgIG9uIGR0XFxcIlxcblwiICtcclxuICAgIFwiICAgICAgICAgIG5nLWNsaWNrPVxcXCJzZWxlY3QoZHQuZGF0ZSlcXFwiXFxuXCIgK1xyXG4gICAgXCIgICAgICAgICAgbmctZGlzYWJsZWQ9XFxcIjo6ZHQuZGlzYWJsZWRcXFwiXFxuXCIgK1xyXG4gICAgXCIgICAgICAgICAgdGFiaW5kZXg9XFxcIi0xXFxcIj48c3BhbiBuZy1jbGFzcz1cXFwiOjp7J3RleHQtaW5mbyc6IGR0LmN1cnJlbnR9XFxcIj57ezo6ZHQubGFiZWx9fTwvc3Bhbj48L2J1dHRvbj5cXG5cIiArXHJcbiAgICBcIiAgICAgIDwvdGQ+XFxuXCIgK1xyXG4gICAgXCIgICAgPC90cj5cXG5cIiArXHJcbiAgICBcIiAgPC90Ym9keT5cXG5cIiArXHJcbiAgICBcIjwvdGFibGU+XFxuXCIgK1xyXG4gICAgXCJcIik7XHJcbn1dKTtcclxuXHJcbmFuZ3VsYXIubW9kdWxlKFwidWliL3RlbXBsYXRlL2RhdGVwaWNrZXIveWVhci5odG1sXCIsIFtdKS5ydW4oW1wiJHRlbXBsYXRlQ2FjaGVcIiwgZnVuY3Rpb24oJHRlbXBsYXRlQ2FjaGUpIHtcclxuICAkdGVtcGxhdGVDYWNoZS5wdXQoXCJ1aWIvdGVtcGxhdGUvZGF0ZXBpY2tlci95ZWFyLmh0bWxcIixcclxuICAgIFwiPHRhYmxlIHJvbGU9XFxcImdyaWRcXFwiIGFyaWEtbGFiZWxsZWRieT1cXFwie3s6OnVuaXF1ZUlkfX0tdGl0bGVcXFwiIGFyaWEtYWN0aXZlZGVzY2VuZGFudD1cXFwie3thY3RpdmVEYXRlSWR9fVxcXCI+XFxuXCIgK1xyXG4gICAgXCIgIDx0aGVhZD5cXG5cIiArXHJcbiAgICBcIiAgICA8dHI+XFxuXCIgK1xyXG4gICAgXCIgICAgICA8dGg+PGJ1dHRvbiB0eXBlPVxcXCJidXR0b25cXFwiIGNsYXNzPVxcXCJidG4gYnRuLWRlZmF1bHQgYnRuLXNtIHB1bGwtbGVmdCB1aWItbGVmdFxcXCIgbmctY2xpY2s9XFxcIm1vdmUoLTEpXFxcIiB0YWJpbmRleD1cXFwiLTFcXFwiPjxpIGFyaWEtaGlkZGVuPVxcXCJ0cnVlXFxcIiBjbGFzcz1cXFwiZ2x5cGhpY29uIGdseXBoaWNvbi1jaGV2cm9uLWxlZnRcXFwiPjwvaT48c3BhbiBjbGFzcz1cXFwic3Itb25seVxcXCI+cHJldmlvdXM8L3NwYW4+PC9idXR0b24+PC90aD5cXG5cIiArXHJcbiAgICBcIiAgICAgIDx0aCBjb2xzcGFuPVxcXCJ7ezo6Y29sdW1ucyAtIDJ9fVxcXCI+PGJ1dHRvbiBpZD1cXFwie3s6OnVuaXF1ZUlkfX0tdGl0bGVcXFwiIHJvbGU9XFxcImhlYWRpbmdcXFwiIGFyaWEtbGl2ZT1cXFwiYXNzZXJ0aXZlXFxcIiBhcmlhLWF0b21pYz1cXFwidHJ1ZVxcXCIgdHlwZT1cXFwiYnV0dG9uXFxcIiBjbGFzcz1cXFwiYnRuIGJ0bi1kZWZhdWx0IGJ0bi1zbSB1aWItdGl0bGVcXFwiIG5nLWNsaWNrPVxcXCJ0b2dnbGVNb2RlKClcXFwiIG5nLWRpc2FibGVkPVxcXCJkYXRlcGlja2VyTW9kZSA9PT0gbWF4TW9kZVxcXCIgdGFiaW5kZXg9XFxcIi0xXFxcIj48c3Ryb25nPnt7dGl0bGV9fTwvc3Ryb25nPjwvYnV0dG9uPjwvdGg+XFxuXCIgK1xyXG4gICAgXCIgICAgICA8dGg+PGJ1dHRvbiB0eXBlPVxcXCJidXR0b25cXFwiIGNsYXNzPVxcXCJidG4gYnRuLWRlZmF1bHQgYnRuLXNtIHB1bGwtcmlnaHQgdWliLXJpZ2h0XFxcIiBuZy1jbGljaz1cXFwibW92ZSgxKVxcXCIgdGFiaW5kZXg9XFxcIi0xXFxcIj48aSBhcmlhLWhpZGRlbj1cXFwidHJ1ZVxcXCIgY2xhc3M9XFxcImdseXBoaWNvbiBnbHlwaGljb24tY2hldnJvbi1yaWdodFxcXCI+PC9pPjxzcGFuIGNsYXNzPVxcXCJzci1vbmx5XFxcIj5uZXh0PC9zcGFuPjwvYnV0dG9uPjwvdGg+XFxuXCIgK1xyXG4gICAgXCIgICAgPC90cj5cXG5cIiArXHJcbiAgICBcIiAgPC90aGVhZD5cXG5cIiArXHJcbiAgICBcIiAgPHRib2R5PlxcblwiICtcclxuICAgIFwiICAgIDx0ciBjbGFzcz1cXFwidWliLXllYXJzXFxcIiBuZy1yZXBlYXQ9XFxcInJvdyBpbiByb3dzIHRyYWNrIGJ5ICRpbmRleFxcXCIgcm9sZT1cXFwicm93XFxcIj5cXG5cIiArXHJcbiAgICBcIiAgICAgIDx0ZCBuZy1yZXBlYXQ9XFxcImR0IGluIHJvd1xcXCIgY2xhc3M9XFxcInVpYi15ZWFyIHRleHQtY2VudGVyXFxcIiByb2xlPVxcXCJncmlkY2VsbFxcXCJcXG5cIiArXHJcbiAgICBcIiAgICAgICAgaWQ9XFxcInt7OjpkdC51aWR9fVxcXCJcXG5cIiArXHJcbiAgICBcIiAgICAgICAgbmctY2xhc3M9XFxcIjo6ZHQuY3VzdG9tQ2xhc3NcXFwiPlxcblwiICtcclxuICAgIFwiICAgICAgICA8YnV0dG9uIHR5cGU9XFxcImJ1dHRvblxcXCIgY2xhc3M9XFxcImJ0biBidG4tZGVmYXVsdFxcXCJcXG5cIiArXHJcbiAgICBcIiAgICAgICAgICB1aWItaXMtY2xhc3M9XFxcIlxcblwiICtcclxuICAgIFwiICAgICAgICAgICAgJ2J0bi1pbmZvJyBmb3Igc2VsZWN0ZWREdCxcXG5cIiArXHJcbiAgICBcIiAgICAgICAgICAgICdhY3RpdmUnIGZvciBhY3RpdmVEdFxcblwiICtcclxuICAgIFwiICAgICAgICAgICAgb24gZHRcXFwiXFxuXCIgK1xyXG4gICAgXCIgICAgICAgICAgbmctY2xpY2s9XFxcInNlbGVjdChkdC5kYXRlKVxcXCJcXG5cIiArXHJcbiAgICBcIiAgICAgICAgICBuZy1kaXNhYmxlZD1cXFwiOjpkdC5kaXNhYmxlZFxcXCJcXG5cIiArXHJcbiAgICBcIiAgICAgICAgICB0YWJpbmRleD1cXFwiLTFcXFwiPjxzcGFuIG5nLWNsYXNzPVxcXCI6OnsndGV4dC1pbmZvJzogZHQuY3VycmVudH1cXFwiPnt7OjpkdC5sYWJlbH19PC9zcGFuPjwvYnV0dG9uPlxcblwiICtcclxuICAgIFwiICAgICAgPC90ZD5cXG5cIiArXHJcbiAgICBcIiAgICA8L3RyPlxcblwiICtcclxuICAgIFwiICA8L3Rib2R5PlxcblwiICtcclxuICAgIFwiPC90YWJsZT5cXG5cIiArXHJcbiAgICBcIlwiKTtcclxufV0pO1xyXG5cclxuYW5ndWxhci5tb2R1bGUoXCJ1aWIvdGVtcGxhdGUvZGF0ZXBpY2tlclBvcHVwL3BvcHVwLmh0bWxcIiwgW10pLnJ1bihbXCIkdGVtcGxhdGVDYWNoZVwiLCBmdW5jdGlvbigkdGVtcGxhdGVDYWNoZSkge1xyXG4gICR0ZW1wbGF0ZUNhY2hlLnB1dChcInVpYi90ZW1wbGF0ZS9kYXRlcGlja2VyUG9wdXAvcG9wdXAuaHRtbFwiLFxyXG4gICAgXCI8dWwgcm9sZT1cXFwicHJlc2VudGF0aW9uXFxcIiBjbGFzcz1cXFwidWliLWRhdGVwaWNrZXItcG9wdXAgZHJvcGRvd24tbWVudSB1aWItcG9zaXRpb24tbWVhc3VyZVxcXCIgZHJvcGRvd24tbmVzdGVkIG5nLWlmPVxcXCJpc09wZW5cXFwiIG5nLWtleWRvd249XFxcImtleWRvd24oJGV2ZW50KVxcXCIgbmctY2xpY2s9XFxcIiRldmVudC5zdG9wUHJvcGFnYXRpb24oKVxcXCI+XFxuXCIgK1xyXG4gICAgXCIgIDxsaSBuZy10cmFuc2NsdWRlPjwvbGk+XFxuXCIgK1xyXG4gICAgXCIgIDxsaSBuZy1pZj1cXFwic2hvd0J1dHRvbkJhclxcXCIgY2xhc3M9XFxcInVpYi1idXR0b24tYmFyXFxcIj5cXG5cIiArXHJcbiAgICBcIiAgICA8c3BhbiBjbGFzcz1cXFwiYnRuLWdyb3VwIHB1bGwtbGVmdFxcXCI+XFxuXCIgK1xyXG4gICAgXCIgICAgICA8YnV0dG9uIHR5cGU9XFxcImJ1dHRvblxcXCIgY2xhc3M9XFxcImJ0biBidG4tc20gYnRuLWluZm8gdWliLWRhdGVwaWNrZXItY3VycmVudFxcXCIgbmctY2xpY2s9XFxcInNlbGVjdCgndG9kYXknLCAkZXZlbnQpXFxcIiBuZy1kaXNhYmxlZD1cXFwiaXNEaXNhYmxlZCgndG9kYXknKVxcXCI+e3sgZ2V0VGV4dCgnY3VycmVudCcpIH19PC9idXR0b24+XFxuXCIgK1xyXG4gICAgXCIgICAgICA8YnV0dG9uIHR5cGU9XFxcImJ1dHRvblxcXCIgY2xhc3M9XFxcImJ0biBidG4tc20gYnRuLWRhbmdlciB1aWItY2xlYXJcXFwiIG5nLWNsaWNrPVxcXCJzZWxlY3QobnVsbCwgJGV2ZW50KVxcXCI+e3sgZ2V0VGV4dCgnY2xlYXInKSB9fTwvYnV0dG9uPlxcblwiICtcclxuICAgIFwiICAgIDwvc3Bhbj5cXG5cIiArXHJcbiAgICBcIiAgICA8YnV0dG9uIHR5cGU9XFxcImJ1dHRvblxcXCIgY2xhc3M9XFxcImJ0biBidG4tc20gYnRuLXN1Y2Nlc3MgcHVsbC1yaWdodCB1aWItY2xvc2VcXFwiIG5nLWNsaWNrPVxcXCJjbG9zZSgkZXZlbnQpXFxcIj57eyBnZXRUZXh0KCdjbG9zZScpIH19PC9idXR0b24+XFxuXCIgK1xyXG4gICAgXCIgIDwvbGk+XFxuXCIgK1xyXG4gICAgXCI8L3VsPlxcblwiICtcclxuICAgIFwiXCIpO1xyXG59XSk7XHJcblxyXG5hbmd1bGFyLm1vZHVsZShcInVpYi90ZW1wbGF0ZS9tb2RhbC93aW5kb3cuaHRtbFwiLCBbXSkucnVuKFtcIiR0ZW1wbGF0ZUNhY2hlXCIsIGZ1bmN0aW9uKCR0ZW1wbGF0ZUNhY2hlKSB7XHJcbiAgJHRlbXBsYXRlQ2FjaGUucHV0KFwidWliL3RlbXBsYXRlL21vZGFsL3dpbmRvdy5odG1sXCIsXHJcbiAgICBcIjxkaXYgY2xhc3M9XFxcIm1vZGFsLWRpYWxvZyB7e3NpemUgPyAnbW9kYWwtJyArIHNpemUgOiAnJ319XFxcIj48ZGl2IGNsYXNzPVxcXCJtb2RhbC1jb250ZW50XFxcIiB1aWItbW9kYWwtdHJhbnNjbHVkZT48L2Rpdj48L2Rpdj5cXG5cIiArXHJcbiAgICBcIlwiKTtcclxufV0pO1xyXG5cclxuYW5ndWxhci5tb2R1bGUoXCJ1aWIvdGVtcGxhdGUvcGFnZXIvcGFnZXIuaHRtbFwiLCBbXSkucnVuKFtcIiR0ZW1wbGF0ZUNhY2hlXCIsIGZ1bmN0aW9uKCR0ZW1wbGF0ZUNhY2hlKSB7XHJcbiAgJHRlbXBsYXRlQ2FjaGUucHV0KFwidWliL3RlbXBsYXRlL3BhZ2VyL3BhZ2VyLmh0bWxcIixcclxuICAgIFwiPGxpIG5nLWNsYXNzPVxcXCJ7ZGlzYWJsZWQ6IG5vUHJldmlvdXMoKXx8bmdEaXNhYmxlZCwgcHJldmlvdXM6IGFsaWdufVxcXCI+PGEgaHJlZiBuZy1jbGljaz1cXFwic2VsZWN0UGFnZShwYWdlIC0gMSwgJGV2ZW50KVxcXCIgbmctZGlzYWJsZWQ9XFxcIm5vUHJldmlvdXMoKXx8bmdEaXNhYmxlZFxcXCIgdWliLXRhYmluZGV4LXRvZ2dsZT57ezo6Z2V0VGV4dCgncHJldmlvdXMnKX19PC9hPjwvbGk+XFxuXCIgK1xyXG4gICAgXCI8bGkgbmctY2xhc3M9XFxcIntkaXNhYmxlZDogbm9OZXh0KCl8fG5nRGlzYWJsZWQsIG5leHQ6IGFsaWdufVxcXCI+PGEgaHJlZiBuZy1jbGljaz1cXFwic2VsZWN0UGFnZShwYWdlICsgMSwgJGV2ZW50KVxcXCIgbmctZGlzYWJsZWQ9XFxcIm5vTmV4dCgpfHxuZ0Rpc2FibGVkXFxcIiB1aWItdGFiaW5kZXgtdG9nZ2xlPnt7OjpnZXRUZXh0KCduZXh0Jyl9fTwvYT48L2xpPlxcblwiICtcclxuICAgIFwiXCIpO1xyXG59XSk7XHJcblxyXG5hbmd1bGFyLm1vZHVsZShcInVpYi90ZW1wbGF0ZS9wYWdpbmF0aW9uL3BhZ2luYXRpb24uaHRtbFwiLCBbXSkucnVuKFtcIiR0ZW1wbGF0ZUNhY2hlXCIsIGZ1bmN0aW9uKCR0ZW1wbGF0ZUNhY2hlKSB7XHJcbiAgJHRlbXBsYXRlQ2FjaGUucHV0KFwidWliL3RlbXBsYXRlL3BhZ2luYXRpb24vcGFnaW5hdGlvbi5odG1sXCIsXHJcbiAgICBcIjxsaSBuZy1pZj1cXFwiOjpib3VuZGFyeUxpbmtzXFxcIiBuZy1jbGFzcz1cXFwie2Rpc2FibGVkOiBub1ByZXZpb3VzKCl8fG5nRGlzYWJsZWR9XFxcIiBjbGFzcz1cXFwicGFnaW5hdGlvbi1maXJzdFxcXCI+PGEgaHJlZiBuZy1jbGljaz1cXFwic2VsZWN0UGFnZSgxLCAkZXZlbnQpXFxcIiBuZy1kaXNhYmxlZD1cXFwibm9QcmV2aW91cygpfHxuZ0Rpc2FibGVkXFxcIiB1aWItdGFiaW5kZXgtdG9nZ2xlPnt7OjpnZXRUZXh0KCdmaXJzdCcpfX08L2E+PC9saT5cXG5cIiArXHJcbiAgICBcIjxsaSBuZy1pZj1cXFwiOjpkaXJlY3Rpb25MaW5rc1xcXCIgbmctY2xhc3M9XFxcIntkaXNhYmxlZDogbm9QcmV2aW91cygpfHxuZ0Rpc2FibGVkfVxcXCIgY2xhc3M9XFxcInBhZ2luYXRpb24tcHJldlxcXCI+PGEgaHJlZiBuZy1jbGljaz1cXFwic2VsZWN0UGFnZShwYWdlIC0gMSwgJGV2ZW50KVxcXCIgbmctZGlzYWJsZWQ9XFxcIm5vUHJldmlvdXMoKXx8bmdEaXNhYmxlZFxcXCIgdWliLXRhYmluZGV4LXRvZ2dsZT57ezo6Z2V0VGV4dCgncHJldmlvdXMnKX19PC9hPjwvbGk+XFxuXCIgK1xyXG4gICAgXCI8bGkgbmctcmVwZWF0PVxcXCJwYWdlIGluIHBhZ2VzIHRyYWNrIGJ5ICRpbmRleFxcXCIgbmctY2xhc3M9XFxcInthY3RpdmU6IHBhZ2UuYWN0aXZlLGRpc2FibGVkOiBuZ0Rpc2FibGVkJiYhcGFnZS5hY3RpdmV9XFxcIiBjbGFzcz1cXFwicGFnaW5hdGlvbi1wYWdlXFxcIj48YSBocmVmIG5nLWNsaWNrPVxcXCJzZWxlY3RQYWdlKHBhZ2UubnVtYmVyLCAkZXZlbnQpXFxcIiBuZy1kaXNhYmxlZD1cXFwibmdEaXNhYmxlZCYmIXBhZ2UuYWN0aXZlXFxcIiB1aWItdGFiaW5kZXgtdG9nZ2xlPnt7cGFnZS50ZXh0fX08L2E+PC9saT5cXG5cIiArXHJcbiAgICBcIjxsaSBuZy1pZj1cXFwiOjpkaXJlY3Rpb25MaW5rc1xcXCIgbmctY2xhc3M9XFxcIntkaXNhYmxlZDogbm9OZXh0KCl8fG5nRGlzYWJsZWR9XFxcIiBjbGFzcz1cXFwicGFnaW5hdGlvbi1uZXh0XFxcIj48YSBocmVmIG5nLWNsaWNrPVxcXCJzZWxlY3RQYWdlKHBhZ2UgKyAxLCAkZXZlbnQpXFxcIiBuZy1kaXNhYmxlZD1cXFwibm9OZXh0KCl8fG5nRGlzYWJsZWRcXFwiIHVpYi10YWJpbmRleC10b2dnbGU+e3s6OmdldFRleHQoJ25leHQnKX19PC9hPjwvbGk+XFxuXCIgK1xyXG4gICAgXCI8bGkgbmctaWY9XFxcIjo6Ym91bmRhcnlMaW5rc1xcXCIgbmctY2xhc3M9XFxcIntkaXNhYmxlZDogbm9OZXh0KCl8fG5nRGlzYWJsZWR9XFxcIiBjbGFzcz1cXFwicGFnaW5hdGlvbi1sYXN0XFxcIj48YSBocmVmIG5nLWNsaWNrPVxcXCJzZWxlY3RQYWdlKHRvdGFsUGFnZXMsICRldmVudClcXFwiIG5nLWRpc2FibGVkPVxcXCJub05leHQoKXx8bmdEaXNhYmxlZFxcXCIgdWliLXRhYmluZGV4LXRvZ2dsZT57ezo6Z2V0VGV4dCgnbGFzdCcpfX08L2E+PC9saT5cXG5cIiArXHJcbiAgICBcIlwiKTtcclxufV0pO1xyXG5cclxuYW5ndWxhci5tb2R1bGUoXCJ1aWIvdGVtcGxhdGUvdG9vbHRpcC90b29sdGlwLWh0bWwtcG9wdXAuaHRtbFwiLCBbXSkucnVuKFtcIiR0ZW1wbGF0ZUNhY2hlXCIsIGZ1bmN0aW9uKCR0ZW1wbGF0ZUNhY2hlKSB7XHJcbiAgJHRlbXBsYXRlQ2FjaGUucHV0KFwidWliL3RlbXBsYXRlL3Rvb2x0aXAvdG9vbHRpcC1odG1sLXBvcHVwLmh0bWxcIixcclxuICAgIFwiPGRpdiBjbGFzcz1cXFwidG9vbHRpcC1hcnJvd1xcXCI+PC9kaXY+XFxuXCIgK1xyXG4gICAgXCI8ZGl2IGNsYXNzPVxcXCJ0b29sdGlwLWlubmVyXFxcIiBuZy1iaW5kLWh0bWw9XFxcImNvbnRlbnRFeHAoKVxcXCI+PC9kaXY+XFxuXCIgK1xyXG4gICAgXCJcIik7XHJcbn1dKTtcclxuXHJcbmFuZ3VsYXIubW9kdWxlKFwidWliL3RlbXBsYXRlL3Rvb2x0aXAvdG9vbHRpcC1wb3B1cC5odG1sXCIsIFtdKS5ydW4oW1wiJHRlbXBsYXRlQ2FjaGVcIiwgZnVuY3Rpb24oJHRlbXBsYXRlQ2FjaGUpIHtcclxuICAkdGVtcGxhdGVDYWNoZS5wdXQoXCJ1aWIvdGVtcGxhdGUvdG9vbHRpcC90b29sdGlwLXBvcHVwLmh0bWxcIixcclxuICAgIFwiPGRpdiBjbGFzcz1cXFwidG9vbHRpcC1hcnJvd1xcXCI+PC9kaXY+XFxuXCIgK1xyXG4gICAgXCI8ZGl2IGNsYXNzPVxcXCJ0b29sdGlwLWlubmVyXFxcIiBuZy1iaW5kPVxcXCJjb250ZW50XFxcIj48L2Rpdj5cXG5cIiArXHJcbiAgICBcIlwiKTtcclxufV0pO1xyXG5cclxuYW5ndWxhci5tb2R1bGUoXCJ1aWIvdGVtcGxhdGUvdG9vbHRpcC90b29sdGlwLXRlbXBsYXRlLXBvcHVwLmh0bWxcIiwgW10pLnJ1bihbXCIkdGVtcGxhdGVDYWNoZVwiLCBmdW5jdGlvbigkdGVtcGxhdGVDYWNoZSkge1xyXG4gICR0ZW1wbGF0ZUNhY2hlLnB1dChcInVpYi90ZW1wbGF0ZS90b29sdGlwL3Rvb2x0aXAtdGVtcGxhdGUtcG9wdXAuaHRtbFwiLFxyXG4gICAgXCI8ZGl2IGNsYXNzPVxcXCJ0b29sdGlwLWFycm93XFxcIj48L2Rpdj5cXG5cIiArXHJcbiAgICBcIjxkaXYgY2xhc3M9XFxcInRvb2x0aXAtaW5uZXJcXFwiXFxuXCIgK1xyXG4gICAgXCIgIHVpYi10b29sdGlwLXRlbXBsYXRlLXRyYW5zY2x1ZGU9XFxcImNvbnRlbnRFeHAoKVxcXCJcXG5cIiArXHJcbiAgICBcIiAgdG9vbHRpcC10ZW1wbGF0ZS10cmFuc2NsdWRlLXNjb3BlPVxcXCJvcmlnaW5TY29wZSgpXFxcIj48L2Rpdj5cXG5cIiArXHJcbiAgICBcIlwiKTtcclxufV0pO1xyXG5cclxuYW5ndWxhci5tb2R1bGUoXCJ1aWIvdGVtcGxhdGUvcG9wb3Zlci9wb3BvdmVyLWh0bWwuaHRtbFwiLCBbXSkucnVuKFtcIiR0ZW1wbGF0ZUNhY2hlXCIsIGZ1bmN0aW9uKCR0ZW1wbGF0ZUNhY2hlKSB7XHJcbiAgJHRlbXBsYXRlQ2FjaGUucHV0KFwidWliL3RlbXBsYXRlL3BvcG92ZXIvcG9wb3Zlci1odG1sLmh0bWxcIixcclxuICAgIFwiPGRpdiBjbGFzcz1cXFwiYXJyb3dcXFwiPjwvZGl2PlxcblwiICtcclxuICAgIFwiXFxuXCIgK1xyXG4gICAgXCI8ZGl2IGNsYXNzPVxcXCJwb3BvdmVyLWlubmVyXFxcIj5cXG5cIiArXHJcbiAgICBcIiAgICA8aDMgY2xhc3M9XFxcInBvcG92ZXItdGl0bGVcXFwiIG5nLWJpbmQ9XFxcInVpYlRpdGxlXFxcIiBuZy1pZj1cXFwidWliVGl0bGVcXFwiPjwvaDM+XFxuXCIgK1xyXG4gICAgXCIgICAgPGRpdiBjbGFzcz1cXFwicG9wb3Zlci1jb250ZW50XFxcIiBuZy1iaW5kLWh0bWw9XFxcImNvbnRlbnRFeHAoKVxcXCI+PC9kaXY+XFxuXCIgK1xyXG4gICAgXCI8L2Rpdj5cXG5cIiArXHJcbiAgICBcIlwiKTtcclxufV0pO1xyXG5cclxuYW5ndWxhci5tb2R1bGUoXCJ1aWIvdGVtcGxhdGUvcG9wb3Zlci9wb3BvdmVyLXRlbXBsYXRlLmh0bWxcIiwgW10pLnJ1bihbXCIkdGVtcGxhdGVDYWNoZVwiLCBmdW5jdGlvbigkdGVtcGxhdGVDYWNoZSkge1xyXG4gICR0ZW1wbGF0ZUNhY2hlLnB1dChcInVpYi90ZW1wbGF0ZS9wb3BvdmVyL3BvcG92ZXItdGVtcGxhdGUuaHRtbFwiLFxyXG4gICAgXCI8ZGl2IGNsYXNzPVxcXCJhcnJvd1xcXCI+PC9kaXY+XFxuXCIgK1xyXG4gICAgXCJcXG5cIiArXHJcbiAgICBcIjxkaXYgY2xhc3M9XFxcInBvcG92ZXItaW5uZXJcXFwiPlxcblwiICtcclxuICAgIFwiICAgIDxoMyBjbGFzcz1cXFwicG9wb3Zlci10aXRsZVxcXCIgbmctYmluZD1cXFwidWliVGl0bGVcXFwiIG5nLWlmPVxcXCJ1aWJUaXRsZVxcXCI+PC9oMz5cXG5cIiArXHJcbiAgICBcIiAgICA8ZGl2IGNsYXNzPVxcXCJwb3BvdmVyLWNvbnRlbnRcXFwiXFxuXCIgK1xyXG4gICAgXCIgICAgICB1aWItdG9vbHRpcC10ZW1wbGF0ZS10cmFuc2NsdWRlPVxcXCJjb250ZW50RXhwKClcXFwiXFxuXCIgK1xyXG4gICAgXCIgICAgICB0b29sdGlwLXRlbXBsYXRlLXRyYW5zY2x1ZGUtc2NvcGU9XFxcIm9yaWdpblNjb3BlKClcXFwiPjwvZGl2PlxcblwiICtcclxuICAgIFwiPC9kaXY+XFxuXCIgK1xyXG4gICAgXCJcIik7XHJcbn1dKTtcclxuXHJcbmFuZ3VsYXIubW9kdWxlKFwidWliL3RlbXBsYXRlL3BvcG92ZXIvcG9wb3Zlci5odG1sXCIsIFtdKS5ydW4oW1wiJHRlbXBsYXRlQ2FjaGVcIiwgZnVuY3Rpb24oJHRlbXBsYXRlQ2FjaGUpIHtcclxuICAkdGVtcGxhdGVDYWNoZS5wdXQoXCJ1aWIvdGVtcGxhdGUvcG9wb3Zlci9wb3BvdmVyLmh0bWxcIixcclxuICAgIFwiPGRpdiBjbGFzcz1cXFwiYXJyb3dcXFwiPjwvZGl2PlxcblwiICtcclxuICAgIFwiXFxuXCIgK1xyXG4gICAgXCI8ZGl2IGNsYXNzPVxcXCJwb3BvdmVyLWlubmVyXFxcIj5cXG5cIiArXHJcbiAgICBcIiAgICA8aDMgY2xhc3M9XFxcInBvcG92ZXItdGl0bGVcXFwiIG5nLWJpbmQ9XFxcInVpYlRpdGxlXFxcIiBuZy1pZj1cXFwidWliVGl0bGVcXFwiPjwvaDM+XFxuXCIgK1xyXG4gICAgXCIgICAgPGRpdiBjbGFzcz1cXFwicG9wb3Zlci1jb250ZW50XFxcIiBuZy1iaW5kPVxcXCJjb250ZW50XFxcIj48L2Rpdj5cXG5cIiArXHJcbiAgICBcIjwvZGl2PlxcblwiICtcclxuICAgIFwiXCIpO1xyXG59XSk7XHJcblxyXG5hbmd1bGFyLm1vZHVsZShcInVpYi90ZW1wbGF0ZS9wcm9ncmVzc2Jhci9iYXIuaHRtbFwiLCBbXSkucnVuKFtcIiR0ZW1wbGF0ZUNhY2hlXCIsIGZ1bmN0aW9uKCR0ZW1wbGF0ZUNhY2hlKSB7XHJcbiAgJHRlbXBsYXRlQ2FjaGUucHV0KFwidWliL3RlbXBsYXRlL3Byb2dyZXNzYmFyL2Jhci5odG1sXCIsXHJcbiAgICBcIjxkaXYgY2xhc3M9XFxcInByb2dyZXNzLWJhclxcXCIgbmctY2xhc3M9XFxcInR5cGUgJiYgJ3Byb2dyZXNzLWJhci0nICsgdHlwZVxcXCIgcm9sZT1cXFwicHJvZ3Jlc3NiYXJcXFwiIGFyaWEtdmFsdWVub3c9XFxcInt7dmFsdWV9fVxcXCIgYXJpYS12YWx1ZW1pbj1cXFwiMFxcXCIgYXJpYS12YWx1ZW1heD1cXFwie3ttYXh9fVxcXCIgbmctc3R5bGU9XFxcInt3aWR0aDogKHBlcmNlbnQgPCAxMDAgPyBwZXJjZW50IDogMTAwKSArICclJ31cXFwiIGFyaWEtdmFsdWV0ZXh0PVxcXCJ7e3BlcmNlbnQgfCBudW1iZXI6MH19JVxcXCIgYXJpYS1sYWJlbGxlZGJ5PVxcXCJ7ezo6dGl0bGV9fVxcXCIgbmctdHJhbnNjbHVkZT48L2Rpdj5cXG5cIiArXHJcbiAgICBcIlwiKTtcclxufV0pO1xyXG5cclxuYW5ndWxhci5tb2R1bGUoXCJ1aWIvdGVtcGxhdGUvcHJvZ3Jlc3NiYXIvcHJvZ3Jlc3MuaHRtbFwiLCBbXSkucnVuKFtcIiR0ZW1wbGF0ZUNhY2hlXCIsIGZ1bmN0aW9uKCR0ZW1wbGF0ZUNhY2hlKSB7XHJcbiAgJHRlbXBsYXRlQ2FjaGUucHV0KFwidWliL3RlbXBsYXRlL3Byb2dyZXNzYmFyL3Byb2dyZXNzLmh0bWxcIixcclxuICAgIFwiPGRpdiBjbGFzcz1cXFwicHJvZ3Jlc3NcXFwiIG5nLXRyYW5zY2x1ZGUgYXJpYS1sYWJlbGxlZGJ5PVxcXCJ7ezo6dGl0bGV9fVxcXCI+PC9kaXY+XCIpO1xyXG59XSk7XHJcblxyXG5hbmd1bGFyLm1vZHVsZShcInVpYi90ZW1wbGF0ZS9wcm9ncmVzc2Jhci9wcm9ncmVzc2Jhci5odG1sXCIsIFtdKS5ydW4oW1wiJHRlbXBsYXRlQ2FjaGVcIiwgZnVuY3Rpb24oJHRlbXBsYXRlQ2FjaGUpIHtcclxuICAkdGVtcGxhdGVDYWNoZS5wdXQoXCJ1aWIvdGVtcGxhdGUvcHJvZ3Jlc3NiYXIvcHJvZ3Jlc3NiYXIuaHRtbFwiLFxyXG4gICAgXCI8ZGl2IGNsYXNzPVxcXCJwcm9ncmVzc1xcXCI+XFxuXCIgK1xyXG4gICAgXCIgIDxkaXYgY2xhc3M9XFxcInByb2dyZXNzLWJhclxcXCIgbmctY2xhc3M9XFxcInR5cGUgJiYgJ3Byb2dyZXNzLWJhci0nICsgdHlwZVxcXCIgcm9sZT1cXFwicHJvZ3Jlc3NiYXJcXFwiIGFyaWEtdmFsdWVub3c9XFxcInt7dmFsdWV9fVxcXCIgYXJpYS12YWx1ZW1pbj1cXFwiMFxcXCIgYXJpYS12YWx1ZW1heD1cXFwie3ttYXh9fVxcXCIgbmctc3R5bGU9XFxcInt3aWR0aDogKHBlcmNlbnQgPCAxMDAgPyBwZXJjZW50IDogMTAwKSArICclJ31cXFwiIGFyaWEtdmFsdWV0ZXh0PVxcXCJ7e3BlcmNlbnQgfCBudW1iZXI6MH19JVxcXCIgYXJpYS1sYWJlbGxlZGJ5PVxcXCJ7ezo6dGl0bGV9fVxcXCIgbmctdHJhbnNjbHVkZT48L2Rpdj5cXG5cIiArXHJcbiAgICBcIjwvZGl2PlxcblwiICtcclxuICAgIFwiXCIpO1xyXG59XSk7XHJcblxyXG5hbmd1bGFyLm1vZHVsZShcInVpYi90ZW1wbGF0ZS9yYXRpbmcvcmF0aW5nLmh0bWxcIiwgW10pLnJ1bihbXCIkdGVtcGxhdGVDYWNoZVwiLCBmdW5jdGlvbigkdGVtcGxhdGVDYWNoZSkge1xyXG4gICR0ZW1wbGF0ZUNhY2hlLnB1dChcInVpYi90ZW1wbGF0ZS9yYXRpbmcvcmF0aW5nLmh0bWxcIixcclxuICAgIFwiPHNwYW4gbmctbW91c2VsZWF2ZT1cXFwicmVzZXQoKVxcXCIgbmcta2V5ZG93bj1cXFwib25LZXlkb3duKCRldmVudClcXFwiIHRhYmluZGV4PVxcXCIwXFxcIiByb2xlPVxcXCJzbGlkZXJcXFwiIGFyaWEtdmFsdWVtaW49XFxcIjBcXFwiIGFyaWEtdmFsdWVtYXg9XFxcInt7cmFuZ2UubGVuZ3RofX1cXFwiIGFyaWEtdmFsdWVub3c9XFxcInt7dmFsdWV9fVxcXCIgYXJpYS12YWx1ZXRleHQ9XFxcInt7dGl0bGV9fVxcXCI+XFxuXCIgK1xyXG4gICAgXCIgICAgPHNwYW4gbmctcmVwZWF0LXN0YXJ0PVxcXCJyIGluIHJhbmdlIHRyYWNrIGJ5ICRpbmRleFxcXCIgY2xhc3M9XFxcInNyLW9ubHlcXFwiPih7eyAkaW5kZXggPCB2YWx1ZSA/ICcqJyA6ICcgJyB9fSk8L3NwYW4+XFxuXCIgK1xyXG4gICAgXCIgICAgPGkgbmctcmVwZWF0LWVuZCBuZy1tb3VzZWVudGVyPVxcXCJlbnRlcigkaW5kZXggKyAxKVxcXCIgbmctY2xpY2s9XFxcInJhdGUoJGluZGV4ICsgMSlcXFwiIGNsYXNzPVxcXCJnbHlwaGljb25cXFwiIG5nLWNsYXNzPVxcXCIkaW5kZXggPCB2YWx1ZSAmJiAoci5zdGF0ZU9uIHx8ICdnbHlwaGljb24tc3RhcicpIHx8IChyLnN0YXRlT2ZmIHx8ICdnbHlwaGljb24tc3Rhci1lbXB0eScpXFxcIiBuZy1hdHRyLXRpdGxlPVxcXCJ7e3IudGl0bGV9fVxcXCI+PC9pPlxcblwiICtcclxuICAgIFwiPC9zcGFuPlxcblwiICtcclxuICAgIFwiXCIpO1xyXG59XSk7XHJcblxyXG5hbmd1bGFyLm1vZHVsZShcInVpYi90ZW1wbGF0ZS90YWJzL3RhYi5odG1sXCIsIFtdKS5ydW4oW1wiJHRlbXBsYXRlQ2FjaGVcIiwgZnVuY3Rpb24oJHRlbXBsYXRlQ2FjaGUpIHtcclxuICAkdGVtcGxhdGVDYWNoZS5wdXQoXCJ1aWIvdGVtcGxhdGUvdGFicy90YWIuaHRtbFwiLFxyXG4gICAgXCI8bGkgbmctY2xhc3M9XFxcIlt7YWN0aXZlOiBhY3RpdmUsIGRpc2FibGVkOiBkaXNhYmxlZH0sIGNsYXNzZXNdXFxcIiBjbGFzcz1cXFwidWliLXRhYiBuYXYtaXRlbVxcXCI+XFxuXCIgK1xyXG4gICAgXCIgIDxhIGhyZWYgbmctY2xpY2s9XFxcInNlbGVjdCgkZXZlbnQpXFxcIiBjbGFzcz1cXFwibmF2LWxpbmtcXFwiIHVpYi10YWItaGVhZGluZy10cmFuc2NsdWRlPnt7aGVhZGluZ319PC9hPlxcblwiICtcclxuICAgIFwiPC9saT5cXG5cIiArXHJcbiAgICBcIlwiKTtcclxufV0pO1xyXG5cclxuYW5ndWxhci5tb2R1bGUoXCJ1aWIvdGVtcGxhdGUvdGFicy90YWJzZXQuaHRtbFwiLCBbXSkucnVuKFtcIiR0ZW1wbGF0ZUNhY2hlXCIsIGZ1bmN0aW9uKCR0ZW1wbGF0ZUNhY2hlKSB7XHJcbiAgJHRlbXBsYXRlQ2FjaGUucHV0KFwidWliL3RlbXBsYXRlL3RhYnMvdGFic2V0Lmh0bWxcIixcclxuICAgIFwiPGRpdj5cXG5cIiArXHJcbiAgICBcIiAgPHVsIGNsYXNzPVxcXCJuYXYgbmF2LXt7dGFic2V0LnR5cGUgfHwgJ3RhYnMnfX1cXFwiIG5nLWNsYXNzPVxcXCJ7J25hdi1zdGFja2VkJzogdmVydGljYWwsICduYXYtanVzdGlmaWVkJzoganVzdGlmaWVkfVxcXCIgbmctdHJhbnNjbHVkZT48L3VsPlxcblwiICtcclxuICAgIFwiICA8ZGl2IGNsYXNzPVxcXCJ0YWItY29udGVudFxcXCI+XFxuXCIgK1xyXG4gICAgXCIgICAgPGRpdiBjbGFzcz1cXFwidGFiLXBhbmVcXFwiXFxuXCIgK1xyXG4gICAgXCIgICAgICAgICBuZy1yZXBlYXQ9XFxcInRhYiBpbiB0YWJzZXQudGFic1xcXCJcXG5cIiArXHJcbiAgICBcIiAgICAgICAgIG5nLWNsYXNzPVxcXCJ7YWN0aXZlOiB0YWJzZXQuYWN0aXZlID09PSB0YWIuaW5kZXh9XFxcIlxcblwiICtcclxuICAgIFwiICAgICAgICAgdWliLXRhYi1jb250ZW50LXRyYW5zY2x1ZGU9XFxcInRhYlxcXCI+XFxuXCIgK1xyXG4gICAgXCIgICAgPC9kaXY+XFxuXCIgK1xyXG4gICAgXCIgIDwvZGl2PlxcblwiICtcclxuICAgIFwiPC9kaXY+XFxuXCIgK1xyXG4gICAgXCJcIik7XHJcbn1dKTtcclxuXHJcbmFuZ3VsYXIubW9kdWxlKFwidWliL3RlbXBsYXRlL3RpbWVwaWNrZXIvdGltZXBpY2tlci5odG1sXCIsIFtdKS5ydW4oW1wiJHRlbXBsYXRlQ2FjaGVcIiwgZnVuY3Rpb24oJHRlbXBsYXRlQ2FjaGUpIHtcclxuICAkdGVtcGxhdGVDYWNoZS5wdXQoXCJ1aWIvdGVtcGxhdGUvdGltZXBpY2tlci90aW1lcGlja2VyLmh0bWxcIixcclxuICAgIFwiPHRhYmxlIGNsYXNzPVxcXCJ1aWItdGltZXBpY2tlclxcXCI+XFxuXCIgK1xyXG4gICAgXCIgIDx0Ym9keT5cXG5cIiArXHJcbiAgICBcIiAgICA8dHIgY2xhc3M9XFxcInRleHQtY2VudGVyXFxcIiBuZy1zaG93PVxcXCI6OnNob3dTcGlubmVyc1xcXCI+XFxuXCIgK1xyXG4gICAgXCIgICAgICA8dGQgY2xhc3M9XFxcInVpYi1pbmNyZW1lbnQgaG91cnNcXFwiPjxhIG5nLWNsaWNrPVxcXCJpbmNyZW1lbnRIb3VycygpXFxcIiBuZy1jbGFzcz1cXFwie2Rpc2FibGVkOiBub0luY3JlbWVudEhvdXJzKCl9XFxcIiBjbGFzcz1cXFwiYnRuIGJ0bi1saW5rXFxcIiBuZy1kaXNhYmxlZD1cXFwibm9JbmNyZW1lbnRIb3VycygpXFxcIiB0YWJpbmRleD1cXFwiLTFcXFwiPjxzcGFuIGNsYXNzPVxcXCJnbHlwaGljb24gZ2x5cGhpY29uLWNoZXZyb24tdXBcXFwiPjwvc3Bhbj48L2E+PC90ZD5cXG5cIiArXHJcbiAgICBcIiAgICAgIDx0ZD4mbmJzcDs8L3RkPlxcblwiICtcclxuICAgIFwiICAgICAgPHRkIGNsYXNzPVxcXCJ1aWItaW5jcmVtZW50IG1pbnV0ZXNcXFwiPjxhIG5nLWNsaWNrPVxcXCJpbmNyZW1lbnRNaW51dGVzKClcXFwiIG5nLWNsYXNzPVxcXCJ7ZGlzYWJsZWQ6IG5vSW5jcmVtZW50TWludXRlcygpfVxcXCIgY2xhc3M9XFxcImJ0biBidG4tbGlua1xcXCIgbmctZGlzYWJsZWQ9XFxcIm5vSW5jcmVtZW50TWludXRlcygpXFxcIiB0YWJpbmRleD1cXFwiLTFcXFwiPjxzcGFuIGNsYXNzPVxcXCJnbHlwaGljb24gZ2x5cGhpY29uLWNoZXZyb24tdXBcXFwiPjwvc3Bhbj48L2E+PC90ZD5cXG5cIiArXHJcbiAgICBcIiAgICAgIDx0ZCBuZy1zaG93PVxcXCJzaG93U2Vjb25kc1xcXCI+Jm5ic3A7PC90ZD5cXG5cIiArXHJcbiAgICBcIiAgICAgIDx0ZCBuZy1zaG93PVxcXCJzaG93U2Vjb25kc1xcXCIgY2xhc3M9XFxcInVpYi1pbmNyZW1lbnQgc2Vjb25kc1xcXCI+PGEgbmctY2xpY2s9XFxcImluY3JlbWVudFNlY29uZHMoKVxcXCIgbmctY2xhc3M9XFxcIntkaXNhYmxlZDogbm9JbmNyZW1lbnRTZWNvbmRzKCl9XFxcIiBjbGFzcz1cXFwiYnRuIGJ0bi1saW5rXFxcIiBuZy1kaXNhYmxlZD1cXFwibm9JbmNyZW1lbnRTZWNvbmRzKClcXFwiIHRhYmluZGV4PVxcXCItMVxcXCI+PHNwYW4gY2xhc3M9XFxcImdseXBoaWNvbiBnbHlwaGljb24tY2hldnJvbi11cFxcXCI+PC9zcGFuPjwvYT48L3RkPlxcblwiICtcclxuICAgIFwiICAgICAgPHRkIG5nLXNob3c9XFxcInNob3dNZXJpZGlhblxcXCI+PC90ZD5cXG5cIiArXHJcbiAgICBcIiAgICA8L3RyPlxcblwiICtcclxuICAgIFwiICAgIDx0cj5cXG5cIiArXHJcbiAgICBcIiAgICAgIDx0ZCBjbGFzcz1cXFwiZm9ybS1ncm91cCB1aWItdGltZSBob3Vyc1xcXCIgbmctY2xhc3M9XFxcInsnaGFzLWVycm9yJzogaW52YWxpZEhvdXJzfVxcXCI+XFxuXCIgK1xyXG4gICAgXCIgICAgICAgIDxpbnB1dCB0eXBlPVxcXCJ0ZXh0XFxcIiBwbGFjZWhvbGRlcj1cXFwiSEhcXFwiIG5nLW1vZGVsPVxcXCJob3Vyc1xcXCIgbmctY2hhbmdlPVxcXCJ1cGRhdGVIb3VycygpXFxcIiBjbGFzcz1cXFwiZm9ybS1jb250cm9sIHRleHQtY2VudGVyXFxcIiBuZy1yZWFkb25seT1cXFwiOjpyZWFkb25seUlucHV0XFxcIiBtYXhsZW5ndGg9XFxcIjJcXFwiIHRhYmluZGV4PVxcXCJ7ezo6dGFiaW5kZXh9fVxcXCIgbmctZGlzYWJsZWQ9XFxcIm5vSW5jcmVtZW50SG91cnMoKVxcXCIgbmctYmx1cj1cXFwiYmx1cigpXFxcIj5cXG5cIiArXHJcbiAgICBcIiAgICAgIDwvdGQ+XFxuXCIgK1xyXG4gICAgXCIgICAgICA8dGQgY2xhc3M9XFxcInVpYi1zZXBhcmF0b3JcXFwiPjo8L3RkPlxcblwiICtcclxuICAgIFwiICAgICAgPHRkIGNsYXNzPVxcXCJmb3JtLWdyb3VwIHVpYi10aW1lIG1pbnV0ZXNcXFwiIG5nLWNsYXNzPVxcXCJ7J2hhcy1lcnJvcic6IGludmFsaWRNaW51dGVzfVxcXCI+XFxuXCIgK1xyXG4gICAgXCIgICAgICAgIDxpbnB1dCB0eXBlPVxcXCJ0ZXh0XFxcIiBwbGFjZWhvbGRlcj1cXFwiTU1cXFwiIG5nLW1vZGVsPVxcXCJtaW51dGVzXFxcIiBuZy1jaGFuZ2U9XFxcInVwZGF0ZU1pbnV0ZXMoKVxcXCIgY2xhc3M9XFxcImZvcm0tY29udHJvbCB0ZXh0LWNlbnRlclxcXCIgbmctcmVhZG9ubHk9XFxcIjo6cmVhZG9ubHlJbnB1dFxcXCIgbWF4bGVuZ3RoPVxcXCIyXFxcIiB0YWJpbmRleD1cXFwie3s6OnRhYmluZGV4fX1cXFwiIG5nLWRpc2FibGVkPVxcXCJub0luY3JlbWVudE1pbnV0ZXMoKVxcXCIgbmctYmx1cj1cXFwiYmx1cigpXFxcIj5cXG5cIiArXHJcbiAgICBcIiAgICAgIDwvdGQ+XFxuXCIgK1xyXG4gICAgXCIgICAgICA8dGQgbmctc2hvdz1cXFwic2hvd1NlY29uZHNcXFwiIGNsYXNzPVxcXCJ1aWItc2VwYXJhdG9yXFxcIj46PC90ZD5cXG5cIiArXHJcbiAgICBcIiAgICAgIDx0ZCBjbGFzcz1cXFwiZm9ybS1ncm91cCB1aWItdGltZSBzZWNvbmRzXFxcIiBuZy1jbGFzcz1cXFwieydoYXMtZXJyb3InOiBpbnZhbGlkU2Vjb25kc31cXFwiIG5nLXNob3c9XFxcInNob3dTZWNvbmRzXFxcIj5cXG5cIiArXHJcbiAgICBcIiAgICAgICAgPGlucHV0IHR5cGU9XFxcInRleHRcXFwiIHBsYWNlaG9sZGVyPVxcXCJTU1xcXCIgbmctbW9kZWw9XFxcInNlY29uZHNcXFwiIG5nLWNoYW5nZT1cXFwidXBkYXRlU2Vjb25kcygpXFxcIiBjbGFzcz1cXFwiZm9ybS1jb250cm9sIHRleHQtY2VudGVyXFxcIiBuZy1yZWFkb25seT1cXFwicmVhZG9ubHlJbnB1dFxcXCIgbWF4bGVuZ3RoPVxcXCIyXFxcIiB0YWJpbmRleD1cXFwie3s6OnRhYmluZGV4fX1cXFwiIG5nLWRpc2FibGVkPVxcXCJub0luY3JlbWVudFNlY29uZHMoKVxcXCIgbmctYmx1cj1cXFwiYmx1cigpXFxcIj5cXG5cIiArXHJcbiAgICBcIiAgICAgIDwvdGQ+XFxuXCIgK1xyXG4gICAgXCIgICAgICA8dGQgbmctc2hvdz1cXFwic2hvd01lcmlkaWFuXFxcIiBjbGFzcz1cXFwidWliLXRpbWUgYW0tcG1cXFwiPjxidXR0b24gdHlwZT1cXFwiYnV0dG9uXFxcIiBuZy1jbGFzcz1cXFwie2Rpc2FibGVkOiBub1RvZ2dsZU1lcmlkaWFuKCl9XFxcIiBjbGFzcz1cXFwiYnRuIGJ0bi1kZWZhdWx0IHRleHQtY2VudGVyXFxcIiBuZy1jbGljaz1cXFwidG9nZ2xlTWVyaWRpYW4oKVxcXCIgbmctZGlzYWJsZWQ9XFxcIm5vVG9nZ2xlTWVyaWRpYW4oKVxcXCIgdGFiaW5kZXg9XFxcInt7Ojp0YWJpbmRleH19XFxcIj57e21lcmlkaWFufX08L2J1dHRvbj48L3RkPlxcblwiICtcclxuICAgIFwiICAgIDwvdHI+XFxuXCIgK1xyXG4gICAgXCIgICAgPHRyIGNsYXNzPVxcXCJ0ZXh0LWNlbnRlclxcXCIgbmctc2hvdz1cXFwiOjpzaG93U3Bpbm5lcnNcXFwiPlxcblwiICtcclxuICAgIFwiICAgICAgPHRkIGNsYXNzPVxcXCJ1aWItZGVjcmVtZW50IGhvdXJzXFxcIj48YSBuZy1jbGljaz1cXFwiZGVjcmVtZW50SG91cnMoKVxcXCIgbmctY2xhc3M9XFxcIntkaXNhYmxlZDogbm9EZWNyZW1lbnRIb3VycygpfVxcXCIgY2xhc3M9XFxcImJ0biBidG4tbGlua1xcXCIgbmctZGlzYWJsZWQ9XFxcIm5vRGVjcmVtZW50SG91cnMoKVxcXCIgdGFiaW5kZXg9XFxcIi0xXFxcIj48c3BhbiBjbGFzcz1cXFwiZ2x5cGhpY29uIGdseXBoaWNvbi1jaGV2cm9uLWRvd25cXFwiPjwvc3Bhbj48L2E+PC90ZD5cXG5cIiArXHJcbiAgICBcIiAgICAgIDx0ZD4mbmJzcDs8L3RkPlxcblwiICtcclxuICAgIFwiICAgICAgPHRkIGNsYXNzPVxcXCJ1aWItZGVjcmVtZW50IG1pbnV0ZXNcXFwiPjxhIG5nLWNsaWNrPVxcXCJkZWNyZW1lbnRNaW51dGVzKClcXFwiIG5nLWNsYXNzPVxcXCJ7ZGlzYWJsZWQ6IG5vRGVjcmVtZW50TWludXRlcygpfVxcXCIgY2xhc3M9XFxcImJ0biBidG4tbGlua1xcXCIgbmctZGlzYWJsZWQ9XFxcIm5vRGVjcmVtZW50TWludXRlcygpXFxcIiB0YWJpbmRleD1cXFwiLTFcXFwiPjxzcGFuIGNsYXNzPVxcXCJnbHlwaGljb24gZ2x5cGhpY29uLWNoZXZyb24tZG93blxcXCI+PC9zcGFuPjwvYT48L3RkPlxcblwiICtcclxuICAgIFwiICAgICAgPHRkIG5nLXNob3c9XFxcInNob3dTZWNvbmRzXFxcIj4mbmJzcDs8L3RkPlxcblwiICtcclxuICAgIFwiICAgICAgPHRkIG5nLXNob3c9XFxcInNob3dTZWNvbmRzXFxcIiBjbGFzcz1cXFwidWliLWRlY3JlbWVudCBzZWNvbmRzXFxcIj48YSBuZy1jbGljaz1cXFwiZGVjcmVtZW50U2Vjb25kcygpXFxcIiBuZy1jbGFzcz1cXFwie2Rpc2FibGVkOiBub0RlY3JlbWVudFNlY29uZHMoKX1cXFwiIGNsYXNzPVxcXCJidG4gYnRuLWxpbmtcXFwiIG5nLWRpc2FibGVkPVxcXCJub0RlY3JlbWVudFNlY29uZHMoKVxcXCIgdGFiaW5kZXg9XFxcIi0xXFxcIj48c3BhbiBjbGFzcz1cXFwiZ2x5cGhpY29uIGdseXBoaWNvbi1jaGV2cm9uLWRvd25cXFwiPjwvc3Bhbj48L2E+PC90ZD5cXG5cIiArXHJcbiAgICBcIiAgICAgIDx0ZCBuZy1zaG93PVxcXCJzaG93TWVyaWRpYW5cXFwiPjwvdGQ+XFxuXCIgK1xyXG4gICAgXCIgICAgPC90cj5cXG5cIiArXHJcbiAgICBcIiAgPC90Ym9keT5cXG5cIiArXHJcbiAgICBcIjwvdGFibGU+XFxuXCIgK1xyXG4gICAgXCJcIik7XHJcbn1dKTtcclxuXHJcbmFuZ3VsYXIubW9kdWxlKFwidWliL3RlbXBsYXRlL3R5cGVhaGVhZC90eXBlYWhlYWQtbWF0Y2guaHRtbFwiLCBbXSkucnVuKFtcIiR0ZW1wbGF0ZUNhY2hlXCIsIGZ1bmN0aW9uKCR0ZW1wbGF0ZUNhY2hlKSB7XHJcbiAgJHRlbXBsYXRlQ2FjaGUucHV0KFwidWliL3RlbXBsYXRlL3R5cGVhaGVhZC90eXBlYWhlYWQtbWF0Y2guaHRtbFwiLFxyXG4gICAgXCI8YSBocmVmXFxuXCIgK1xyXG4gICAgXCIgICB0YWJpbmRleD1cXFwiLTFcXFwiXFxuXCIgK1xyXG4gICAgXCIgICBuZy1iaW5kLWh0bWw9XFxcIm1hdGNoLmxhYmVsIHwgdWliVHlwZWFoZWFkSGlnaGxpZ2h0OnF1ZXJ5XFxcIlxcblwiICtcclxuICAgIFwiICAgbmctYXR0ci10aXRsZT1cXFwie3ttYXRjaC5sYWJlbH19XFxcIj48L2E+XFxuXCIgK1xyXG4gICAgXCJcIik7XHJcbn1dKTtcclxuXHJcbmFuZ3VsYXIubW9kdWxlKFwidWliL3RlbXBsYXRlL3R5cGVhaGVhZC90eXBlYWhlYWQtcG9wdXAuaHRtbFwiLCBbXSkucnVuKFtcIiR0ZW1wbGF0ZUNhY2hlXCIsIGZ1bmN0aW9uKCR0ZW1wbGF0ZUNhY2hlKSB7XHJcbiAgJHRlbXBsYXRlQ2FjaGUucHV0KFwidWliL3RlbXBsYXRlL3R5cGVhaGVhZC90eXBlYWhlYWQtcG9wdXAuaHRtbFwiLFxyXG4gICAgXCI8dWwgY2xhc3M9XFxcImRyb3Bkb3duLW1lbnVcXFwiIG5nLXNob3c9XFxcImlzT3BlbigpICYmICFtb3ZlSW5Qcm9ncmVzc1xcXCIgbmctc3R5bGU9XFxcInt0b3A6IHBvc2l0aW9uKCkudG9wKydweCcsIGxlZnQ6IHBvc2l0aW9uKCkubGVmdCsncHgnfVxcXCIgcm9sZT1cXFwibGlzdGJveFxcXCIgYXJpYS1oaWRkZW49XFxcInt7IWlzT3BlbigpfX1cXFwiPlxcblwiICtcclxuICAgIFwiICAgIDxsaSBjbGFzcz1cXFwidWliLXR5cGVhaGVhZC1tYXRjaFxcXCIgbmctcmVwZWF0PVxcXCJtYXRjaCBpbiBtYXRjaGVzIHRyYWNrIGJ5ICRpbmRleFxcXCIgbmctY2xhc3M9XFxcInthY3RpdmU6IGlzQWN0aXZlKCRpbmRleCkgfVxcXCIgbmctbW91c2VlbnRlcj1cXFwic2VsZWN0QWN0aXZlKCRpbmRleClcXFwiIG5nLWNsaWNrPVxcXCJzZWxlY3RNYXRjaCgkaW5kZXgsICRldmVudClcXFwiIHJvbGU9XFxcIm9wdGlvblxcXCIgaWQ9XFxcInt7OjptYXRjaC5pZH19XFxcIj5cXG5cIiArXHJcbiAgICBcIiAgICAgICAgPGRpdiB1aWItdHlwZWFoZWFkLW1hdGNoIGluZGV4PVxcXCIkaW5kZXhcXFwiIG1hdGNoPVxcXCJtYXRjaFxcXCIgcXVlcnk9XFxcInF1ZXJ5XFxcIiB0ZW1wbGF0ZS11cmw9XFxcInRlbXBsYXRlVXJsXFxcIj48L2Rpdj5cXG5cIiArXHJcbiAgICBcIiAgICA8L2xpPlxcblwiICtcclxuICAgIFwiPC91bD5cXG5cIiArXHJcbiAgICBcIlwiKTtcclxufV0pO1xyXG5hbmd1bGFyLm1vZHVsZSgndWkuYm9vdHN0cmFwLmNhcm91c2VsJykucnVuKGZ1bmN0aW9uKCkgeyFhbmd1bGFyLiQkY3NwKCkubm9JbmxpbmVTdHlsZSAmJiAhYW5ndWxhci4kJHVpYkNhcm91c2VsQ3NzICYmIGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudCkuZmluZCgnaGVhZCcpLnByZXBlbmQoJzxzdHlsZSB0eXBlPVwidGV4dC9jc3NcIj4ubmctYW5pbWF0ZS5pdGVtOm5vdCgubGVmdCk6bm90KC5yaWdodCl7LXdlYmtpdC10cmFuc2l0aW9uOjBzIGVhc2UtaW4tb3V0IGxlZnQ7dHJhbnNpdGlvbjowcyBlYXNlLWluLW91dCBsZWZ0fTwvc3R5bGU+Jyk7IGFuZ3VsYXIuJCR1aWJDYXJvdXNlbENzcyA9IHRydWU7IH0pO1xyXG5hbmd1bGFyLm1vZHVsZSgndWkuYm9vdHN0cmFwLmRhdGVwaWNrZXInKS5ydW4oZnVuY3Rpb24oKSB7IWFuZ3VsYXIuJCRjc3AoKS5ub0lubGluZVN0eWxlICYmICFhbmd1bGFyLiQkdWliRGF0ZXBpY2tlckNzcyAmJiBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQpLmZpbmQoJ2hlYWQnKS5wcmVwZW5kKCc8c3R5bGUgdHlwZT1cInRleHQvY3NzXCI+LnVpYi1kYXRlcGlja2VyIC51aWItdGl0bGV7d2lkdGg6MTAwJTt9LnVpYi1kYXkgYnV0dG9uLC51aWItbW9udGggYnV0dG9uLC51aWIteWVhciBidXR0b257bWluLXdpZHRoOjEwMCU7fS51aWItbGVmdCwudWliLXJpZ2h0e3dpZHRoOjEwMCV9PC9zdHlsZT4nKTsgYW5ndWxhci4kJHVpYkRhdGVwaWNrZXJDc3MgPSB0cnVlOyB9KTtcclxuYW5ndWxhci5tb2R1bGUoJ3VpLmJvb3RzdHJhcC5wb3NpdGlvbicpLnJ1bihmdW5jdGlvbigpIHshYW5ndWxhci4kJGNzcCgpLm5vSW5saW5lU3R5bGUgJiYgIWFuZ3VsYXIuJCR1aWJQb3NpdGlvbkNzcyAmJiBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQpLmZpbmQoJ2hlYWQnKS5wcmVwZW5kKCc8c3R5bGUgdHlwZT1cInRleHQvY3NzXCI+LnVpYi1wb3NpdGlvbi1tZWFzdXJle2Rpc3BsYXk6YmxvY2sgIWltcG9ydGFudDt2aXNpYmlsaXR5OmhpZGRlbiAhaW1wb3J0YW50O3Bvc2l0aW9uOmFic29sdXRlICFpbXBvcnRhbnQ7dG9wOi05OTk5cHggIWltcG9ydGFudDtsZWZ0Oi05OTk5cHggIWltcG9ydGFudDt9LnVpYi1wb3NpdGlvbi1zY3JvbGxiYXItbWVhc3VyZXtwb3NpdGlvbjphYnNvbHV0ZSAhaW1wb3J0YW50O3RvcDotOTk5OXB4ICFpbXBvcnRhbnQ7d2lkdGg6NTBweCAhaW1wb3J0YW50O2hlaWdodDo1MHB4ICFpbXBvcnRhbnQ7b3ZlcmZsb3c6c2Nyb2xsICFpbXBvcnRhbnQ7fS51aWItcG9zaXRpb24tYm9keS1zY3JvbGxiYXItbWVhc3VyZXtvdmVyZmxvdzpzY3JvbGwgIWltcG9ydGFudDt9PC9zdHlsZT4nKTsgYW5ndWxhci4kJHVpYlBvc2l0aW9uQ3NzID0gdHJ1ZTsgfSk7XHJcbmFuZ3VsYXIubW9kdWxlKCd1aS5ib290c3RyYXAuZGF0ZXBpY2tlclBvcHVwJykucnVuKGZ1bmN0aW9uKCkgeyFhbmd1bGFyLiQkY3NwKCkubm9JbmxpbmVTdHlsZSAmJiAhYW5ndWxhci4kJHVpYkRhdGVwaWNrZXJwb3B1cENzcyAmJiBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQpLmZpbmQoJ2hlYWQnKS5wcmVwZW5kKCc8c3R5bGUgdHlwZT1cInRleHQvY3NzXCI+LnVpYi1kYXRlcGlja2VyLXBvcHVwLmRyb3Bkb3duLW1lbnV7ZGlzcGxheTpibG9jaztmbG9hdDpub25lO21hcmdpbjowO30udWliLWJ1dHRvbi1iYXJ7cGFkZGluZzoxMHB4IDlweCAycHg7fTwvc3R5bGU+Jyk7IGFuZ3VsYXIuJCR1aWJEYXRlcGlja2VycG9wdXBDc3MgPSB0cnVlOyB9KTtcclxuYW5ndWxhci5tb2R1bGUoJ3VpLmJvb3RzdHJhcC50b29sdGlwJykucnVuKGZ1bmN0aW9uKCkgeyFhbmd1bGFyLiQkY3NwKCkubm9JbmxpbmVTdHlsZSAmJiAhYW5ndWxhci4kJHVpYlRvb2x0aXBDc3MgJiYgYW5ndWxhci5lbGVtZW50KGRvY3VtZW50KS5maW5kKCdoZWFkJykucHJlcGVuZCgnPHN0eWxlIHR5cGU9XCJ0ZXh0L2Nzc1wiPlt1aWItdG9vbHRpcC1wb3B1cF0udG9vbHRpcC50b3AtbGVmdCA+IC50b29sdGlwLWFycm93LFt1aWItdG9vbHRpcC1wb3B1cF0udG9vbHRpcC50b3AtcmlnaHQgPiAudG9vbHRpcC1hcnJvdyxbdWliLXRvb2x0aXAtcG9wdXBdLnRvb2x0aXAuYm90dG9tLWxlZnQgPiAudG9vbHRpcC1hcnJvdyxbdWliLXRvb2x0aXAtcG9wdXBdLnRvb2x0aXAuYm90dG9tLXJpZ2h0ID4gLnRvb2x0aXAtYXJyb3csW3VpYi10b29sdGlwLXBvcHVwXS50b29sdGlwLmxlZnQtdG9wID4gLnRvb2x0aXAtYXJyb3csW3VpYi10b29sdGlwLXBvcHVwXS50b29sdGlwLmxlZnQtYm90dG9tID4gLnRvb2x0aXAtYXJyb3csW3VpYi10b29sdGlwLXBvcHVwXS50b29sdGlwLnJpZ2h0LXRvcCA+IC50b29sdGlwLWFycm93LFt1aWItdG9vbHRpcC1wb3B1cF0udG9vbHRpcC5yaWdodC1ib3R0b20gPiAudG9vbHRpcC1hcnJvdyxbdWliLXRvb2x0aXAtaHRtbC1wb3B1cF0udG9vbHRpcC50b3AtbGVmdCA+IC50b29sdGlwLWFycm93LFt1aWItdG9vbHRpcC1odG1sLXBvcHVwXS50b29sdGlwLnRvcC1yaWdodCA+IC50b29sdGlwLWFycm93LFt1aWItdG9vbHRpcC1odG1sLXBvcHVwXS50b29sdGlwLmJvdHRvbS1sZWZ0ID4gLnRvb2x0aXAtYXJyb3csW3VpYi10b29sdGlwLWh0bWwtcG9wdXBdLnRvb2x0aXAuYm90dG9tLXJpZ2h0ID4gLnRvb2x0aXAtYXJyb3csW3VpYi10b29sdGlwLWh0bWwtcG9wdXBdLnRvb2x0aXAubGVmdC10b3AgPiAudG9vbHRpcC1hcnJvdyxbdWliLXRvb2x0aXAtaHRtbC1wb3B1cF0udG9vbHRpcC5sZWZ0LWJvdHRvbSA+IC50b29sdGlwLWFycm93LFt1aWItdG9vbHRpcC1odG1sLXBvcHVwXS50b29sdGlwLnJpZ2h0LXRvcCA+IC50b29sdGlwLWFycm93LFt1aWItdG9vbHRpcC1odG1sLXBvcHVwXS50b29sdGlwLnJpZ2h0LWJvdHRvbSA+IC50b29sdGlwLWFycm93LFt1aWItdG9vbHRpcC10ZW1wbGF0ZS1wb3B1cF0udG9vbHRpcC50b3AtbGVmdCA+IC50b29sdGlwLWFycm93LFt1aWItdG9vbHRpcC10ZW1wbGF0ZS1wb3B1cF0udG9vbHRpcC50b3AtcmlnaHQgPiAudG9vbHRpcC1hcnJvdyxbdWliLXRvb2x0aXAtdGVtcGxhdGUtcG9wdXBdLnRvb2x0aXAuYm90dG9tLWxlZnQgPiAudG9vbHRpcC1hcnJvdyxbdWliLXRvb2x0aXAtdGVtcGxhdGUtcG9wdXBdLnRvb2x0aXAuYm90dG9tLXJpZ2h0ID4gLnRvb2x0aXAtYXJyb3csW3VpYi10b29sdGlwLXRlbXBsYXRlLXBvcHVwXS50b29sdGlwLmxlZnQtdG9wID4gLnRvb2x0aXAtYXJyb3csW3VpYi10b29sdGlwLXRlbXBsYXRlLXBvcHVwXS50b29sdGlwLmxlZnQtYm90dG9tID4gLnRvb2x0aXAtYXJyb3csW3VpYi10b29sdGlwLXRlbXBsYXRlLXBvcHVwXS50b29sdGlwLnJpZ2h0LXRvcCA+IC50b29sdGlwLWFycm93LFt1aWItdG9vbHRpcC10ZW1wbGF0ZS1wb3B1cF0udG9vbHRpcC5yaWdodC1ib3R0b20gPiAudG9vbHRpcC1hcnJvdyxbdWliLXBvcG92ZXItcG9wdXBdLnBvcG92ZXIudG9wLWxlZnQgPiAuYXJyb3csW3VpYi1wb3BvdmVyLXBvcHVwXS5wb3BvdmVyLnRvcC1yaWdodCA+IC5hcnJvdyxbdWliLXBvcG92ZXItcG9wdXBdLnBvcG92ZXIuYm90dG9tLWxlZnQgPiAuYXJyb3csW3VpYi1wb3BvdmVyLXBvcHVwXS5wb3BvdmVyLmJvdHRvbS1yaWdodCA+IC5hcnJvdyxbdWliLXBvcG92ZXItcG9wdXBdLnBvcG92ZXIubGVmdC10b3AgPiAuYXJyb3csW3VpYi1wb3BvdmVyLXBvcHVwXS5wb3BvdmVyLmxlZnQtYm90dG9tID4gLmFycm93LFt1aWItcG9wb3Zlci1wb3B1cF0ucG9wb3Zlci5yaWdodC10b3AgPiAuYXJyb3csW3VpYi1wb3BvdmVyLXBvcHVwXS5wb3BvdmVyLnJpZ2h0LWJvdHRvbSA+IC5hcnJvdyxbdWliLXBvcG92ZXItaHRtbC1wb3B1cF0ucG9wb3Zlci50b3AtbGVmdCA+IC5hcnJvdyxbdWliLXBvcG92ZXItaHRtbC1wb3B1cF0ucG9wb3Zlci50b3AtcmlnaHQgPiAuYXJyb3csW3VpYi1wb3BvdmVyLWh0bWwtcG9wdXBdLnBvcG92ZXIuYm90dG9tLWxlZnQgPiAuYXJyb3csW3VpYi1wb3BvdmVyLWh0bWwtcG9wdXBdLnBvcG92ZXIuYm90dG9tLXJpZ2h0ID4gLmFycm93LFt1aWItcG9wb3Zlci1odG1sLXBvcHVwXS5wb3BvdmVyLmxlZnQtdG9wID4gLmFycm93LFt1aWItcG9wb3Zlci1odG1sLXBvcHVwXS5wb3BvdmVyLmxlZnQtYm90dG9tID4gLmFycm93LFt1aWItcG9wb3Zlci1odG1sLXBvcHVwXS5wb3BvdmVyLnJpZ2h0LXRvcCA+IC5hcnJvdyxbdWliLXBvcG92ZXItaHRtbC1wb3B1cF0ucG9wb3Zlci5yaWdodC1ib3R0b20gPiAuYXJyb3csW3VpYi1wb3BvdmVyLXRlbXBsYXRlLXBvcHVwXS5wb3BvdmVyLnRvcC1sZWZ0ID4gLmFycm93LFt1aWItcG9wb3Zlci10ZW1wbGF0ZS1wb3B1cF0ucG9wb3Zlci50b3AtcmlnaHQgPiAuYXJyb3csW3VpYi1wb3BvdmVyLXRlbXBsYXRlLXBvcHVwXS5wb3BvdmVyLmJvdHRvbS1sZWZ0ID4gLmFycm93LFt1aWItcG9wb3Zlci10ZW1wbGF0ZS1wb3B1cF0ucG9wb3Zlci5ib3R0b20tcmlnaHQgPiAuYXJyb3csW3VpYi1wb3BvdmVyLXRlbXBsYXRlLXBvcHVwXS5wb3BvdmVyLmxlZnQtdG9wID4gLmFycm93LFt1aWItcG9wb3Zlci10ZW1wbGF0ZS1wb3B1cF0ucG9wb3Zlci5sZWZ0LWJvdHRvbSA+IC5hcnJvdyxbdWliLXBvcG92ZXItdGVtcGxhdGUtcG9wdXBdLnBvcG92ZXIucmlnaHQtdG9wID4gLmFycm93LFt1aWItcG9wb3Zlci10ZW1wbGF0ZS1wb3B1cF0ucG9wb3Zlci5yaWdodC1ib3R0b20gPiAuYXJyb3d7dG9wOmF1dG87Ym90dG9tOmF1dG87bGVmdDphdXRvO3JpZ2h0OmF1dG87bWFyZ2luOjA7fVt1aWItcG9wb3Zlci1wb3B1cF0ucG9wb3ZlcixbdWliLXBvcG92ZXItaHRtbC1wb3B1cF0ucG9wb3ZlcixbdWliLXBvcG92ZXItdGVtcGxhdGUtcG9wdXBdLnBvcG92ZXJ7ZGlzcGxheTpibG9jayAhaW1wb3J0YW50O308L3N0eWxlPicpOyBhbmd1bGFyLiQkdWliVG9vbHRpcENzcyA9IHRydWU7IH0pO1xyXG5hbmd1bGFyLm1vZHVsZSgndWkuYm9vdHN0cmFwLnRpbWVwaWNrZXInKS5ydW4oZnVuY3Rpb24oKSB7IWFuZ3VsYXIuJCRjc3AoKS5ub0lubGluZVN0eWxlICYmICFhbmd1bGFyLiQkdWliVGltZXBpY2tlckNzcyAmJiBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQpLmZpbmQoJ2hlYWQnKS5wcmVwZW5kKCc8c3R5bGUgdHlwZT1cInRleHQvY3NzXCI+LnVpYi10aW1lIGlucHV0e3dpZHRoOjUwcHg7fTwvc3R5bGU+Jyk7IGFuZ3VsYXIuJCR1aWJUaW1lcGlja2VyQ3NzID0gdHJ1ZTsgfSk7XHJcbmFuZ3VsYXIubW9kdWxlKCd1aS5ib290c3RyYXAudHlwZWFoZWFkJykucnVuKGZ1bmN0aW9uKCkgeyFhbmd1bGFyLiQkY3NwKCkubm9JbmxpbmVTdHlsZSAmJiAhYW5ndWxhci4kJHVpYlR5cGVhaGVhZENzcyAmJiBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQpLmZpbmQoJ2hlYWQnKS5wcmVwZW5kKCc8c3R5bGUgdHlwZT1cInRleHQvY3NzXCI+W3VpYi10eXBlYWhlYWQtcG9wdXBdLmRyb3Bkb3duLW1lbnV7ZGlzcGxheTpibG9jazt9PC9zdHlsZT4nKTsgYW5ndWxhci4kJHVpYlR5cGVhaGVhZENzcyA9IHRydWU7IH0pOyJdLCJmaWxlIjoidWktYm9vdHN0cmFwLXRwbHMuanMifQ==
