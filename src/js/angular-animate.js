/**
 * @license AngularJS v1.5.8
 * (c) 2010-2016 Google, Inc. http://angularjs.org
 * License: MIT
 */
(function(window, angular) {'use strict';

var ELEMENT_NODE = 1;
var COMMENT_NODE = 8;

var ADD_CLASS_SUFFIX = '-add';
var REMOVE_CLASS_SUFFIX = '-remove';
var EVENT_CLASS_PREFIX = 'ng-';
var ACTIVE_CLASS_SUFFIX = '-active';
var PREPARE_CLASS_SUFFIX = '-prepare';

var NG_ANIMATE_CLASSNAME = 'ng-animate';
var NG_ANIMATE_CHILDREN_DATA = '$$ngAnimateChildren';

// Detect proper transitionend/animationend event names.
var CSS_PREFIX = '', TRANSITION_PROP, TRANSITIONEND_EVENT, ANIMATION_PROP, ANIMATIONEND_EVENT;

// If unprefixed events are not supported but webkit-prefixed are, use the latter.
// Otherwise, just use W3C names, browsers not supporting them at all will just ignore them.
// Note: Chrome implements `window.onwebkitanimationend` and doesn't implement `window.onanimationend`
// but at the same time dispatches the `animationend` event and not `webkitAnimationEnd`.
// Register both events in case `window.onanimationend` is not supported because of that,
// do the same for `transitionend` as Safari is likely to exhibit similar behavior.
// Also, the only modern browser that uses vendor prefixes for transitions/keyframes is webkit
// therefore there is no reason to test anymore for other vendor prefixes:
// http://caniuse.com/#search=transition
if ((window.ontransitionend === void 0) && (window.onwebkittransitionend !== void 0)) {
  CSS_PREFIX = '-webkit-';
  TRANSITION_PROP = 'WebkitTransition';
  TRANSITIONEND_EVENT = 'webkitTransitionEnd transitionend';
} else {
  TRANSITION_PROP = 'transition';
  TRANSITIONEND_EVENT = 'transitionend';
}

if ((window.onanimationend === void 0) && (window.onwebkitanimationend !== void 0)) {
  CSS_PREFIX = '-webkit-';
  ANIMATION_PROP = 'WebkitAnimation';
  ANIMATIONEND_EVENT = 'webkitAnimationEnd animationend';
} else {
  ANIMATION_PROP = 'animation';
  ANIMATIONEND_EVENT = 'animationend';
}

var DURATION_KEY = 'Duration';
var PROPERTY_KEY = 'Property';
var DELAY_KEY = 'Delay';
var TIMING_KEY = 'TimingFunction';
var ANIMATION_ITERATION_COUNT_KEY = 'IterationCount';
var ANIMATION_PLAYSTATE_KEY = 'PlayState';
var SAFE_FAST_FORWARD_DURATION_VALUE = 9999;

var ANIMATION_DELAY_PROP = ANIMATION_PROP + DELAY_KEY;
var ANIMATION_DURATION_PROP = ANIMATION_PROP + DURATION_KEY;
var TRANSITION_DELAY_PROP = TRANSITION_PROP + DELAY_KEY;
var TRANSITION_DURATION_PROP = TRANSITION_PROP + DURATION_KEY;

var ngMinErr = angular.$$minErr('ng');
function assertArg(arg, name, reason) {
  if (!arg) {
    throw ngMinErr('areq', "Argument '{0}' is {1}", (name || '?'), (reason || "required"));
  }
  return arg;
}

function mergeClasses(a,b) {
  if (!a && !b) return '';
  if (!a) return b;
  if (!b) return a;
  if (isArray(a)) a = a.join(' ');
  if (isArray(b)) b = b.join(' ');
  return a + ' ' + b;
}

function packageStyles(options) {
  var styles = {};
  if (options && (options.to || options.from)) {
    styles.to = options.to;
    styles.from = options.from;
  }
  return styles;
}

function pendClasses(classes, fix, isPrefix) {
  var className = '';
  classes = isArray(classes)
      ? classes
      : classes && isString(classes) && classes.length
          ? classes.split(/\s+/)
          : [];
  forEach(classes, function(klass, i) {
    if (klass && klass.length > 0) {
      className += (i > 0) ? ' ' : '';
      className += isPrefix ? fix + klass
                            : klass + fix;
    }
  });
  return className;
}

function removeFromArray(arr, val) {
  var index = arr.indexOf(val);
  if (val >= 0) {
    arr.splice(index, 1);
  }
}

function stripCommentsFromElement(element) {
  if (element instanceof jqLite) {
    switch (element.length) {
      case 0:
        return element;

      case 1:
        // there is no point of stripping anything if the element
        // is the only element within the jqLite wrapper.
        // (it's important that we retain the element instance.)
        if (element[0].nodeType === ELEMENT_NODE) {
          return element;
        }
        break;

      default:
        return jqLite(extractElementNode(element));
    }
  }

  if (element.nodeType === ELEMENT_NODE) {
    return jqLite(element);
  }
}

function extractElementNode(element) {
  if (!element[0]) return element;
  for (var i = 0; i < element.length; i++) {
    var elm = element[i];
    if (elm.nodeType == ELEMENT_NODE) {
      return elm;
    }
  }
}

function $$addClass($$jqLite, element, className) {
  forEach(element, function(elm) {
    $$jqLite.addClass(elm, className);
  });
}

function $$removeClass($$jqLite, element, className) {
  forEach(element, function(elm) {
    $$jqLite.removeClass(elm, className);
  });
}

function applyAnimationClassesFactory($$jqLite) {
  return function(element, options) {
    if (options.addClass) {
      $$addClass($$jqLite, element, options.addClass);
      options.addClass = null;
    }
    if (options.removeClass) {
      $$removeClass($$jqLite, element, options.removeClass);
      options.removeClass = null;
    }
  };
}

function prepareAnimationOptions(options) {
  options = options || {};
  if (!options.$$prepared) {
    var domOperation = options.domOperation || noop;
    options.domOperation = function() {
      options.$$domOperationFired = true;
      domOperation();
      domOperation = noop;
    };
    options.$$prepared = true;
  }
  return options;
}

function applyAnimationStyles(element, options) {
  applyAnimationFromStyles(element, options);
  applyAnimationToStyles(element, options);
}

function applyAnimationFromStyles(element, options) {
  if (options.from) {
    element.css(options.from);
    options.from = null;
  }
}

function applyAnimationToStyles(element, options) {
  if (options.to) {
    element.css(options.to);
    options.to = null;
  }
}

function mergeAnimationDetails(element, oldAnimation, newAnimation) {
  var target = oldAnimation.options || {};
  var newOptions = newAnimation.options || {};

  var toAdd = (target.addClass || '') + ' ' + (newOptions.addClass || '');
  var toRemove = (target.removeClass || '') + ' ' + (newOptions.removeClass || '');
  var classes = resolveElementClasses(element.attr('class'), toAdd, toRemove);

  if (newOptions.preparationClasses) {
    target.preparationClasses = concatWithSpace(newOptions.preparationClasses, target.preparationClasses);
    delete newOptions.preparationClasses;
  }

  // noop is basically when there is no callback; otherwise something has been set
  var realDomOperation = target.domOperation !== noop ? target.domOperation : null;

  extend(target, newOptions);

  // TODO(matsko or sreeramu): proper fix is to maintain all animation callback in array and call at last,but now only leave has the callback so no issue with this.
  if (realDomOperation) {
    target.domOperation = realDomOperation;
  }

  if (classes.addClass) {
    target.addClass = classes.addClass;
  } else {
    target.addClass = null;
  }

  if (classes.removeClass) {
    target.removeClass = classes.removeClass;
  } else {
    target.removeClass = null;
  }

  oldAnimation.addClass = target.addClass;
  oldAnimation.removeClass = target.removeClass;

  return target;
}

function resolveElementClasses(existing, toAdd, toRemove) {
  var ADD_CLASS = 1;
  var REMOVE_CLASS = -1;

  var flags = {};
  existing = splitClassesToLookup(existing);

  toAdd = splitClassesToLookup(toAdd);
  forEach(toAdd, function(value, key) {
    flags[key] = ADD_CLASS;
  });

  toRemove = splitClassesToLookup(toRemove);
  forEach(toRemove, function(value, key) {
    flags[key] = flags[key] === ADD_CLASS ? null : REMOVE_CLASS;
  });

  var classes = {
    addClass: '',
    removeClass: ''
  };

  forEach(flags, function(val, klass) {
    var prop, allow;
    if (val === ADD_CLASS) {
      prop = 'addClass';
      allow = !existing[klass] || existing[klass + REMOVE_CLASS_SUFFIX];
    } else if (val === REMOVE_CLASS) {
      prop = 'removeClass';
      allow = existing[klass] || existing[klass + ADD_CLASS_SUFFIX];
    }
    if (allow) {
      if (classes[prop].length) {
        classes[prop] += ' ';
      }
      classes[prop] += klass;
    }
  });

  function splitClassesToLookup(classes) {
    if (isString(classes)) {
      classes = classes.split(' ');
    }

    var obj = {};
    forEach(classes, function(klass) {
      // sometimes the split leaves empty string values
      // incase extra spaces were applied to the options
      if (klass.length) {
        obj[klass] = true;
      }
    });
    return obj;
  }

  return classes;
}

function getDomNode(element) {
  return (element instanceof jqLite) ? element[0] : element;
}

function applyGeneratedPreparationClasses(element, event, options) {
  var classes = '';
  if (event) {
    classes = pendClasses(event, EVENT_CLASS_PREFIX, true);
  }
  if (options.addClass) {
    classes = concatWithSpace(classes, pendClasses(options.addClass, ADD_CLASS_SUFFIX));
  }
  if (options.removeClass) {
    classes = concatWithSpace(classes, pendClasses(options.removeClass, REMOVE_CLASS_SUFFIX));
  }
  if (classes.length) {
    options.preparationClasses = classes;
    element.addClass(classes);
  }
}

function clearGeneratedClasses(element, options) {
  if (options.preparationClasses) {
    element.removeClass(options.preparationClasses);
    options.preparationClasses = null;
  }
  if (options.activeClasses) {
    element.removeClass(options.activeClasses);
    options.activeClasses = null;
  }
}

function blockTransitions(node, duration) {
  // we use a negative delay value since it performs blocking
  // yet it doesn't kill any existing transitions running on the
  // same element which makes this safe for class-based animations
  var value = duration ? '-' + duration + 's' : '';
  applyInlineStyle(node, [TRANSITION_DELAY_PROP, value]);
  return [TRANSITION_DELAY_PROP, value];
}

function blockKeyframeAnimations(node, applyBlock) {
  var value = applyBlock ? 'paused' : '';
  var key = ANIMATION_PROP + ANIMATION_PLAYSTATE_KEY;
  applyInlineStyle(node, [key, value]);
  return [key, value];
}

function applyInlineStyle(node, styleTuple) {
  var prop = styleTuple[0];
  var value = styleTuple[1];
  node.style[prop] = value;
}

function concatWithSpace(a,b) {
  if (!a) return b;
  if (!b) return a;
  return a + ' ' + b;
}

var $$rAFSchedulerFactory = ['$$rAF', function($$rAF) {
  var queue, cancelFn;

  function scheduler(tasks) {
    // we make a copy since RAFScheduler mutates the state
    // of the passed in array variable and this would be difficult
    // to track down on the outside code
    queue = queue.concat(tasks);
    nextTick();
  }

  queue = scheduler.queue = [];

  /* waitUntilQuiet does two things:
   * 1. It will run the FINAL `fn` value only when an uncanceled RAF has passed through
   * 2. It will delay the next wave of tasks from running until the quiet `fn` has run.
   *
   * The motivation here is that animation code can request more time from the scheduler
   * before the next wave runs. This allows for certain DOM properties such as classes to
   * be resolved in time for the next animation to run.
   */
  scheduler.waitUntilQuiet = function(fn) {
    if (cancelFn) cancelFn();

    cancelFn = $$rAF(function() {
      cancelFn = null;
      fn();
      nextTick();
    });
  };

  return scheduler;

  function nextTick() {
    if (!queue.length) return;

    var items = queue.shift();
    for (var i = 0; i < items.length; i++) {
      items[i]();
    }

    if (!cancelFn) {
      $$rAF(function() {
        if (!cancelFn) nextTick();
      });
    }
  }
}];

/**
 * @ngdoc directive
 * @name ngAnimateChildren
 * @restrict AE
 * @element ANY
 *
 * @description
 *
 * ngAnimateChildren allows you to specify that children of this element should animate even if any
 * of the children's parents are currently animating. By default, when an element has an active `enter`, `leave`, or `move`
 * (structural) animation, child elements that also have an active structural animation are not animated.
 *
 * Note that even if `ngAnimteChildren` is set, no child animations will run when the parent element is removed from the DOM (`leave` animation).
 *
 *
 * @param {string} ngAnimateChildren If the value is empty, `true` or `on`,
 *     then child animations are allowed. If the value is `false`, child animations are not allowed.
 *
 * @example
 * <example module="ngAnimateChildren" name="ngAnimateChildren" deps="angular-animate.js" animations="true">
     <file name="index.html">
       <div ng-controller="mainController as main">
         <label>Show container? <input type="checkbox" ng-model="main.enterElement" /></label>
         <label>Animate children? <input type="checkbox" ng-model="main.animateChildren" /></label>
         <hr>
         <div ng-animate-children="{{main.animateChildren}}">
           <div ng-if="main.enterElement" class="container">
             List of items:
             <div ng-repeat="item in [0, 1, 2, 3]" class="item">Item {{item}}</div>
           </div>
         </div>
       </div>
     </file>
     <file name="animations.css">

      .container.ng-enter,
      .container.ng-leave {
        transition: all ease 1.5s;
      }

      .container.ng-enter,
      .container.ng-leave-active {
        opacity: 0;
      }

      .container.ng-leave,
      .container.ng-enter-active {
        opacity: 1;
      }

      .item {
        background: firebrick;
        color: #FFF;
        margin-bottom: 10px;
      }

      .item.ng-enter,
      .item.ng-leave {
        transition: transform 1.5s ease;
      }

      .item.ng-enter {
        transform: translateX(50px);
      }

      .item.ng-enter-active {
        transform: translateX(0);
      }
    </file>
    <file name="script.js">
      angular.module('ngAnimateChildren', ['ngAnimate'])
        .controller('mainController', function() {
          this.animateChildren = false;
          this.enterElement = false;
        });
    </file>
  </example>
 */
var $$AnimateChildrenDirective = ['$interpolate', function($interpolate) {
  return {
    link: function(scope, element, attrs) {
      var val = attrs.ngAnimateChildren;
      if (isString(val) && val.length === 0) { //empty attribute
        element.data(NG_ANIMATE_CHILDREN_DATA, true);
      } else {
        // Interpolate and set the value, so that it is available to
        // animations that run right after compilation
        setData($interpolate(val)(scope));
        attrs.$observe('ngAnimateChildren', setData);
      }

      function setData(value) {
        value = value === 'on' || value === 'true';
        element.data(NG_ANIMATE_CHILDREN_DATA, value);
      }
    }
  };
}];

var ANIMATE_TIMER_KEY = '$$animateCss';

/**
 * @ngdoc service
 * @name $animateCss
 * @kind object
 *
 * @description
 * The `$animateCss` service is a useful utility to trigger customized CSS-based transitions/keyframes
 * from a JavaScript-based animation or directly from a directive. The purpose of `$animateCss` is NOT
 * to side-step how `$animate` and ngAnimate work, but the goal is to allow pre-existing animations or
 * directives to create more complex animations that can be purely driven using CSS code.
 *
 * Note that only browsers that support CSS transitions and/or keyframe animations are capable of
 * rendering animations triggered via `$animateCss` (bad news for IE9 and lower).
 *
 * ## Usage
 * Once again, `$animateCss` is designed to be used inside of a registered JavaScript animation that
 * is powered by ngAnimate. It is possible to use `$animateCss` directly inside of a directive, however,
 * any automatic control over cancelling animations and/or preventing animations from being run on
 * child elements will not be handled by Angular. For this to work as expected, please use `$animate` to
 * trigger the animation and then setup a JavaScript animation that injects `$animateCss` to trigger
 * the CSS animation.
 *
 * The example below shows how we can create a folding animation on an element using `ng-if`:
 *
 * ```html
 * <!-- notice the `fold-animation` CSS class -->
 * <div ng-if="onOff" class="fold-animation">
 *   This element will go BOOM
 * </div>
 * <button ng-click="onOff=true">Fold In</button>
 * ```
 *
 * Now we create the **JavaScript animation** that will trigger the CSS transition:
 *
 * ```js
 * ngModule.animation('.fold-animation', ['$animateCss', function($animateCss) {
 *   return {
 *     enter: function(element, doneFn) {
 *       var height = element[0].offsetHeight;
 *       return $animateCss(element, {
 *         from: { height:'0px' },
 *         to: { height:height + 'px' },
 *         duration: 1 // one second
 *       });
 *     }
 *   }
 * }]);
 * ```
 *
 * ## More Advanced Uses
 *
 * `$animateCss` is the underlying code that ngAnimate uses to power **CSS-based animations** behind the scenes. Therefore CSS hooks
 * like `.ng-EVENT`, `.ng-EVENT-active`, `.ng-EVENT-stagger` are all features that can be triggered using `$animateCss` via JavaScript code.
 *
 * This also means that just about any combination of adding classes, removing classes, setting styles, dynamically setting a keyframe animation,
 * applying a hardcoded duration or delay value, changing the animation easing or applying a stagger animation are all options that work with
 * `$animateCss`. The service itself is smart enough to figure out the combination of options and examine the element styling properties in order
 * to provide a working animation that will run in CSS.
 *
 * The example below showcases a more advanced version of the `.fold-animation` from the example above:
 *
 * ```js
 * ngModule.animation('.fold-animation', ['$animateCss', function($animateCss) {
 *   return {
 *     enter: function(element, doneFn) {
 *       var height = element[0].offsetHeight;
 *       return $animateCss(element, {
 *         addClass: 'red large-text pulse-twice',
 *         easing: 'ease-out',
 *         from: { height:'0px' },
 *         to: { height:height + 'px' },
 *         duration: 1 // one second
 *       });
 *     }
 *   }
 * }]);
 * ```
 *
 * Since we're adding/removing CSS classes then the CSS transition will also pick those up:
 *
 * ```css
 * /&#42; since a hardcoded duration value of 1 was provided in the JavaScript animation code,
 * the CSS classes below will be transitioned despite them being defined as regular CSS classes &#42;/
 * .red { background:red; }
 * .large-text { font-size:20px; }
 *
 * /&#42; we can also use a keyframe animation and $animateCss will make it work alongside the transition &#42;/
 * .pulse-twice {
 *   animation: 0.5s pulse linear 2;
 *   -webkit-animation: 0.5s pulse linear 2;
 * }
 *
 * @keyframes pulse {
 *   from { transform: scale(0.5); }
 *   to { transform: scale(1.5); }
 * }
 *
 * @-webkit-keyframes pulse {
 *   from { -webkit-transform: scale(0.5); }
 *   to { -webkit-transform: scale(1.5); }
 * }
 * ```
 *
 * Given this complex combination of CSS classes, styles and options, `$animateCss` will figure everything out and make the animation happen.
 *
 * ## How the Options are handled
 *
 * `$animateCss` is very versatile and intelligent when it comes to figuring out what configurations to apply to the element to ensure the animation
 * works with the options provided. Say for example we were adding a class that contained a keyframe value and we wanted to also animate some inline
 * styles using the `from` and `to` properties.
 *
 * ```js
 * var animator = $animateCss(element, {
 *   from: { background:'red' },
 *   to: { background:'blue' }
 * });
 * animator.start();
 * ```
 *
 * ```css
 * .rotating-animation {
 *   animation:0.5s rotate linear;
 *   -webkit-animation:0.5s rotate linear;
 * }
 *
 * @keyframes rotate {
 *   from { transform: rotate(0deg); }
 *   to { transform: rotate(360deg); }
 * }
 *
 * @-webkit-keyframes rotate {
 *   from { -webkit-transform: rotate(0deg); }
 *   to { -webkit-transform: rotate(360deg); }
 * }
 * ```
 *
 * The missing pieces here are that we do not have a transition set (within the CSS code nor within the `$animateCss` options) and the duration of the animation is
 * going to be detected from what the keyframe styles on the CSS class are. In this event, `$animateCss` will automatically create an inline transition
 * style matching the duration detected from the keyframe style (which is present in the CSS class that is being added) and then prepare both the transition
 * and keyframe animations to run in parallel on the element. Then when the animation is underway the provided `from` and `to` CSS styles will be applied
 * and spread across the transition and keyframe animation.
 *
 * ## What is returned
 *
 * `$animateCss` works in two stages: a preparation phase and an animation phase. Therefore when `$animateCss` is first called it will NOT actually
 * start the animation. All that is going on here is that the element is being prepared for the animation (which means that the generated CSS classes are
 * added and removed on the element). Once `$animateCss` is called it will return an object with the following properties:
 *
 * ```js
 * var animator = $animateCss(element, { ... });
 * ```
 *
 * Now what do the contents of our `animator` variable look like:
 *
 * ```js
 * {
 *   // starts the animation
 *   start: Function,
 *
 *   // ends (aborts) the animation
 *   end: Function
 * }
 * ```
 *
 * To actually start the animation we need to run `animation.start()` which will then return a promise that we can hook into to detect when the animation ends.
 * If we choose not to run the animation then we MUST run `animation.end()` to perform a cleanup on the element (since some CSS classes and styles may have been
 * applied to the element during the preparation phase). Note that all other properties such as duration, delay, transitions and keyframes are just properties
 * and that changing them will not reconfigure the parameters of the animation.
 *
 * ### runner.done() vs runner.then()
 * It is documented that `animation.start()` will return a promise object and this is true, however, there is also an additional method available on the
 * runner called `.done(callbackFn)`. The done method works the same as `.finally(callbackFn)`, however, it does **not trigger a digest to occur**.
 * Therefore, for performance reasons, it's always best to use `runner.done(callback)` instead of `runner.then()`, `runner.catch()` or `runner.finally()`
 * unless you really need a digest to kick off afterwards.
 *
 * Keep in mind that, to make this easier, ngAnimate has tweaked the JS animations API to recognize when a runner instance is returned from $animateCss
 * (so there is no need to call `runner.done(doneFn)` inside of your JavaScript animation code).
 * Check the {@link ngAnimate.$animateCss#usage animation code above} to see how this works.
 *
 * @param {DOMElement} element the element that will be animated
 * @param {object} options the animation-related options that will be applied during the animation
 *
 * * `event` - The DOM event (e.g. enter, leave, move). When used, a generated CSS class of `ng-EVENT` and `ng-EVENT-active` will be applied
 * to the element during the animation. Multiple events can be provided when spaces are used as a separator. (Note that this will not perform any DOM operation.)
 * * `structural` - Indicates that the `ng-` prefix will be added to the event class. Setting to `false` or omitting will turn `ng-EVENT` and
 * `ng-EVENT-active` in `EVENT` and `EVENT-active`. Unused if `event` is omitted.
 * * `easing` - The CSS easing value that will be applied to the transition or keyframe animation (or both).
 * * `transitionStyle` - The raw CSS transition style that will be used (e.g. `1s linear all`).
 * * `keyframeStyle` - The raw CSS keyframe animation style that will be used (e.g. `1s my_animation linear`).
 * * `from` - The starting CSS styles (a key/value object) that will be applied at the start of the animation.
 * * `to` - The ending CSS styles (a key/value object) that will be applied across the animation via a CSS transition.
 * * `addClass` - A space separated list of CSS classes that will be added to the element and spread across the animation.
 * * `removeClass` - A space separated list of CSS classes that will be removed from the element and spread across the animation.
 * * `duration` - A number value representing the total duration of the transition and/or keyframe (note that a value of 1 is 1000ms). If a value of `0`
 * is provided then the animation will be skipped entirely.
 * * `delay` - A number value representing the total delay of the transition and/or keyframe (note that a value of 1 is 1000ms). If a value of `true` is
 * used then whatever delay value is detected from the CSS classes will be mirrored on the elements styles (e.g. by setting delay true then the style value
 * of the element will be `transition-delay: DETECTED_VALUE`). Using `true` is useful when you want the CSS classes and inline styles to all share the same
 * CSS delay value.
 * * `stagger` - A numeric time value representing the delay between successively animated elements
 * ({@link ngAnimate#css-staggering-animations Click here to learn how CSS-based staggering works in ngAnimate.})
 * * `staggerIndex` - The numeric index representing the stagger item (e.g. a value of 5 is equal to the sixth item in the stagger; therefore when a
 *   `stagger` option value of `0.1` is used then there will be a stagger delay of `600ms`)
 * * `applyClassesEarly` - Whether or not the classes being added or removed will be used when detecting the animation. This is set by `$animate` when enter/leave/move animations are fired to ensure that the CSS classes are resolved in time. (Note that this will prevent any transitions from occurring on the classes being added and removed.)
 * * `cleanupStyles` - Whether or not the provided `from` and `to` styles will be removed once
 *    the animation is closed. This is useful for when the styles are used purely for the sake of
 *    the animation and do not have a lasting visual effect on the element (e.g. a collapse and open animation).
 *    By default this value is set to `false`.
 *
 * @return {object} an object with start and end methods and details about the animation.
 *
 * * `start` - The method to start the animation. This will return a `Promise` when called.
 * * `end` - This method will cancel the animation and remove all applied CSS classes and styles.
 */
var ONE_SECOND = 1000;
var BASE_TEN = 10;

var ELAPSED_TIME_MAX_DECIMAL_PLACES = 3;
var CLOSING_TIME_BUFFER = 1.5;

var DETECT_CSS_PROPERTIES = {
  transitionDuration:      TRANSITION_DURATION_PROP,
  transitionDelay:         TRANSITION_DELAY_PROP,
  transitionProperty:      TRANSITION_PROP + PROPERTY_KEY,
  animationDuration:       ANIMATION_DURATION_PROP,
  animationDelay:          ANIMATION_DELAY_PROP,
  animationIterationCount: ANIMATION_PROP + ANIMATION_ITERATION_COUNT_KEY
};

var DETECT_STAGGER_CSS_PROPERTIES = {
  transitionDuration:      TRANSITION_DURATION_PROP,
  transitionDelay:         TRANSITION_DELAY_PROP,
  animationDuration:       ANIMATION_DURATION_PROP,
  animationDelay:          ANIMATION_DELAY_PROP
};

function getCssKeyframeDurationStyle(duration) {
  return [ANIMATION_DURATION_PROP, duration + 's'];
}

function getCssDelayStyle(delay, isKeyframeAnimation) {
  var prop = isKeyframeAnimation ? ANIMATION_DELAY_PROP : TRANSITION_DELAY_PROP;
  return [prop, delay + 's'];
}

function computeCssStyles($window, element, properties) {
  var styles = Object.create(null);
  var detectedStyles = $window.getComputedStyle(element) || {};
  forEach(properties, function(formalStyleName, actualStyleName) {
    var val = detectedStyles[formalStyleName];
    if (val) {
      var c = val.charAt(0);

      // only numerical-based values have a negative sign or digit as the first value
      if (c === '-' || c === '+' || c >= 0) {
        val = parseMaxTime(val);
      }

      // by setting this to null in the event that the delay is not set or is set directly as 0
      // then we can still allow for negative values to be used later on and not mistake this
      // value for being greater than any other negative value.
      if (val === 0) {
        val = null;
      }
      styles[actualStyleName] = val;
    }
  });

  return styles;
}

function parseMaxTime(str) {
  var maxValue = 0;
  var values = str.split(/\s*,\s*/);
  forEach(values, function(value) {
    // it's always safe to consider only second values and omit `ms` values since
    // getComputedStyle will always handle the conversion for us
    if (value.charAt(value.length - 1) == 's') {
      value = value.substring(0, value.length - 1);
    }
    value = parseFloat(value) || 0;
    maxValue = maxValue ? Math.max(value, maxValue) : value;
  });
  return maxValue;
}

function truthyTimingValue(val) {
  return val === 0 || val != null;
}

function getCssTransitionDurationStyle(duration, applyOnlyDuration) {
  var style = TRANSITION_PROP;
  var value = duration + 's';
  if (applyOnlyDuration) {
    style += DURATION_KEY;
  } else {
    value += ' linear all';
  }
  return [style, value];
}

function createLocalCacheLookup() {
  var cache = Object.create(null);
  return {
    flush: function() {
      cache = Object.create(null);
    },

    count: function(key) {
      var entry = cache[key];
      return entry ? entry.total : 0;
    },

    get: function(key) {
      var entry = cache[key];
      return entry && entry.value;
    },

    put: function(key, value) {
      if (!cache[key]) {
        cache[key] = { total: 1, value: value };
      } else {
        cache[key].total++;
      }
    }
  };
}

// we do not reassign an already present style value since
// if we detect the style property value again we may be
// detecting styles that were added via the `from` styles.
// We make use of `isDefined` here since an empty string
// or null value (which is what getPropertyValue will return
// for a non-existing style) will still be marked as a valid
// value for the style (a falsy value implies that the style
// is to be removed at the end of the animation). If we had a simple
// "OR" statement then it would not be enough to catch that.
function registerRestorableStyles(backup, node, properties) {
  forEach(properties, function(prop) {
    backup[prop] = isDefined(backup[prop])
        ? backup[prop]
        : node.style.getPropertyValue(prop);
  });
}

var $AnimateCssProvider = ['$animateProvider', function($animateProvider) {
  var gcsLookup = createLocalCacheLookup();
  var gcsStaggerLookup = createLocalCacheLookup();

  this.$get = ['$window', '$$jqLite', '$$AnimateRunner', '$timeout',
               '$$forceReflow', '$sniffer', '$$rAFScheduler', '$$animateQueue',
       function($window,   $$jqLite,   $$AnimateRunner,   $timeout,
                $$forceReflow,   $sniffer,   $$rAFScheduler, $$animateQueue) {

    var applyAnimationClasses = applyAnimationClassesFactory($$jqLite);

    var parentCounter = 0;
    function gcsHashFn(node, extraClasses) {
      var KEY = "$$ngAnimateParentKey";
      var parentNode = node.parentNode;
      var parentID = parentNode[KEY] || (parentNode[KEY] = ++parentCounter);
      return parentID + '-' + node.getAttribute('class') + '-' + extraClasses;
    }

    function computeCachedCssStyles(node, className, cacheKey, properties) {
      var timings = gcsLookup.get(cacheKey);

      if (!timings) {
        timings = computeCssStyles($window, node, properties);
        if (timings.animationIterationCount === 'infinite') {
          timings.animationIterationCount = 1;
        }
      }

      // we keep putting this in multiple times even though the value and the cacheKey are the same
      // because we're keeping an internal tally of how many duplicate animations are detected.
      gcsLookup.put(cacheKey, timings);
      return timings;
    }

    function computeCachedCssStaggerStyles(node, className, cacheKey, properties) {
      var stagger;

      // if we have one or more existing matches of matching elements
      // containing the same parent + CSS styles (which is how cacheKey works)
      // then staggering is possible
      if (gcsLookup.count(cacheKey) > 0) {
        stagger = gcsStaggerLookup.get(cacheKey);

        if (!stagger) {
          var staggerClassName = pendClasses(className, '-stagger');

          $$jqLite.addClass(node, staggerClassName);

          stagger = computeCssStyles($window, node, properties);

          // force the conversion of a null value to zero incase not set
          stagger.animationDuration = Math.max(stagger.animationDuration, 0);
          stagger.transitionDuration = Math.max(stagger.transitionDuration, 0);

          $$jqLite.removeClass(node, staggerClassName);

          gcsStaggerLookup.put(cacheKey, stagger);
        }
      }

      return stagger || {};
    }

    var cancelLastRAFRequest;
    var rafWaitQueue = [];
    function waitUntilQuiet(callback) {
      rafWaitQueue.push(callback);
      $$rAFScheduler.waitUntilQuiet(function() {
        gcsLookup.flush();
        gcsStaggerLookup.flush();

        // DO NOT REMOVE THIS LINE OR REFACTOR OUT THE `pageWidth` variable.
        // PLEASE EXAMINE THE `$$forceReflow` service to understand why.
        var pageWidth = $$forceReflow();

        // we use a for loop to ensure that if the queue is changed
        // during this looping then it will consider new requests
        for (var i = 0; i < rafWaitQueue.length; i++) {
          rafWaitQueue[i](pageWidth);
        }
        rafWaitQueue.length = 0;
      });
    }

    function computeTimings(node, className, cacheKey) {
      var timings = computeCachedCssStyles(node, className, cacheKey, DETECT_CSS_PROPERTIES);
      var aD = timings.animationDelay;
      var tD = timings.transitionDelay;
      timings.maxDelay = aD && tD
          ? Math.max(aD, tD)
          : (aD || tD);
      timings.maxDuration = Math.max(
          timings.animationDuration * timings.animationIterationCount,
          timings.transitionDuration);

      return timings;
    }

    return function init(element, initialOptions) {
      // all of the animation functions should create
      // a copy of the options data, however, if a
      // parent service has already created a copy then
      // we should stick to using that
      var options = initialOptions || {};
      if (!options.$$prepared) {
        options = prepareAnimationOptions(copy(options));
      }

      var restoreStyles = {};
      var node = getDomNode(element);
      if (!node
          || !node.parentNode
          || !$$animateQueue.enabled()) {
        return closeAndReturnNoopAnimator();
      }

      var temporaryStyles = [];
      var classes = element.attr('class');
      var styles = packageStyles(options);
      var animationClosed;
      var animationPaused;
      var animationCompleted;
      var runner;
      var runnerHost;
      var maxDelay;
      var maxDelayTime;
      var maxDuration;
      var maxDurationTime;
      var startTime;
      var events = [];

      if (options.duration === 0 || (!$sniffer.animations && !$sniffer.transitions)) {
        return closeAndReturnNoopAnimator();
      }

      var method = options.event && isArray(options.event)
            ? options.event.join(' ')
            : options.event;

      var isStructural = method && options.structural;
      var structuralClassName = '';
      var addRemoveClassName = '';

      if (isStructural) {
        structuralClassName = pendClasses(method, EVENT_CLASS_PREFIX, true);
      } else if (method) {
        structuralClassName = method;
      }

      if (options.addClass) {
        addRemoveClassName += pendClasses(options.addClass, ADD_CLASS_SUFFIX);
      }

      if (options.removeClass) {
        if (addRemoveClassName.length) {
          addRemoveClassName += ' ';
        }
        addRemoveClassName += pendClasses(options.removeClass, REMOVE_CLASS_SUFFIX);
      }

      // there may be a situation where a structural animation is combined together
      // with CSS classes that need to resolve before the animation is computed.
      // However this means that there is no explicit CSS code to block the animation
      // from happening (by setting 0s none in the class name). If this is the case
      // we need to apply the classes before the first rAF so we know to continue if
      // there actually is a detected transition or keyframe animation
      if (options.applyClassesEarly && addRemoveClassName.length) {
        applyAnimationClasses(element, options);
      }

      var preparationClasses = [structuralClassName, addRemoveClassName].join(' ').trim();
      var fullClassName = classes + ' ' + preparationClasses;
      var activeClasses = pendClasses(preparationClasses, ACTIVE_CLASS_SUFFIX);
      var hasToStyles = styles.to && Object.keys(styles.to).length > 0;
      var containsKeyframeAnimation = (options.keyframeStyle || '').length > 0;

      // there is no way we can trigger an animation if no styles and
      // no classes are being applied which would then trigger a transition,
      // unless there a is raw keyframe value that is applied to the element.
      if (!containsKeyframeAnimation
           && !hasToStyles
           && !preparationClasses) {
        return closeAndReturnNoopAnimator();
      }

      var cacheKey, stagger;
      if (options.stagger > 0) {
        var staggerVal = parseFloat(options.stagger);
        stagger = {
          transitionDelay: staggerVal,
          animationDelay: staggerVal,
          transitionDuration: 0,
          animationDuration: 0
        };
      } else {
        cacheKey = gcsHashFn(node, fullClassName);
        stagger = computeCachedCssStaggerStyles(node, preparationClasses, cacheKey, DETECT_STAGGER_CSS_PROPERTIES);
      }

      if (!options.$$skipPreparationClasses) {
        $$jqLite.addClass(element, preparationClasses);
      }

      var applyOnlyDuration;

      if (options.transitionStyle) {
        var transitionStyle = [TRANSITION_PROP, options.transitionStyle];
        applyInlineStyle(node, transitionStyle);
        temporaryStyles.push(transitionStyle);
      }

      if (options.duration >= 0) {
        applyOnlyDuration = node.style[TRANSITION_PROP].length > 0;
        var durationStyle = getCssTransitionDurationStyle(options.duration, applyOnlyDuration);

        // we set the duration so that it will be picked up by getComputedStyle later
        applyInlineStyle(node, durationStyle);
        temporaryStyles.push(durationStyle);
      }

      if (options.keyframeStyle) {
        var keyframeStyle = [ANIMATION_PROP, options.keyframeStyle];
        applyInlineStyle(node, keyframeStyle);
        temporaryStyles.push(keyframeStyle);
      }

      var itemIndex = stagger
          ? options.staggerIndex >= 0
              ? options.staggerIndex
              : gcsLookup.count(cacheKey)
          : 0;

      var isFirst = itemIndex === 0;

      // this is a pre-emptive way of forcing the setup classes to be added and applied INSTANTLY
      // without causing any combination of transitions to kick in. By adding a negative delay value
      // it forces the setup class' transition to end immediately. We later then remove the negative
      // transition delay to allow for the transition to naturally do it's thing. The beauty here is
      // that if there is no transition defined then nothing will happen and this will also allow
      // other transitions to be stacked on top of each other without any chopping them out.
      if (isFirst && !options.skipBlocking) {
        blockTransitions(node, SAFE_FAST_FORWARD_DURATION_VALUE);
      }

      var timings = computeTimings(node, fullClassName, cacheKey);
      var relativeDelay = timings.maxDelay;
      maxDelay = Math.max(relativeDelay, 0);
      maxDuration = timings.maxDuration;

      var flags = {};
      flags.hasTransitions          = timings.transitionDuration > 0;
      flags.hasAnimations           = timings.animationDuration > 0;
      flags.hasTransitionAll        = flags.hasTransitions && timings.transitionProperty == 'all';
      flags.applyTransitionDuration = hasToStyles && (
                                        (flags.hasTransitions && !flags.hasTransitionAll)
                                         || (flags.hasAnimations && !flags.hasTransitions));
      flags.applyAnimationDuration  = options.duration && flags.hasAnimations;
      flags.applyTransitionDelay    = truthyTimingValue(options.delay) && (flags.applyTransitionDuration || flags.hasTransitions);
      flags.applyAnimationDelay     = truthyTimingValue(options.delay) && flags.hasAnimations;
      flags.recalculateTimingStyles = addRemoveClassName.length > 0;

      if (flags.applyTransitionDuration || flags.applyAnimationDuration) {
        maxDuration = options.duration ? parseFloat(options.duration) : maxDuration;

        if (flags.applyTransitionDuration) {
          flags.hasTransitions = true;
          timings.transitionDuration = maxDuration;
          applyOnlyDuration = node.style[TRANSITION_PROP + PROPERTY_KEY].length > 0;
          temporaryStyles.push(getCssTransitionDurationStyle(maxDuration, applyOnlyDuration));
        }

        if (flags.applyAnimationDuration) {
          flags.hasAnimations = true;
          timings.animationDuration = maxDuration;
          temporaryStyles.push(getCssKeyframeDurationStyle(maxDuration));
        }
      }

      if (maxDuration === 0 && !flags.recalculateTimingStyles) {
        return closeAndReturnNoopAnimator();
      }

      if (options.delay != null) {
        var delayStyle;
        if (typeof options.delay !== "boolean") {
          delayStyle = parseFloat(options.delay);
          // number in options.delay means we have to recalculate the delay for the closing timeout
          maxDelay = Math.max(delayStyle, 0);
        }

        if (flags.applyTransitionDelay) {
          temporaryStyles.push(getCssDelayStyle(delayStyle));
        }

        if (flags.applyAnimationDelay) {
          temporaryStyles.push(getCssDelayStyle(delayStyle, true));
        }
      }

      // we need to recalculate the delay value since we used a pre-emptive negative
      // delay value and the delay value is required for the final event checking. This
      // property will ensure that this will happen after the RAF phase has passed.
      if (options.duration == null && timings.transitionDuration > 0) {
        flags.recalculateTimingStyles = flags.recalculateTimingStyles || isFirst;
      }

      maxDelayTime = maxDelay * ONE_SECOND;
      maxDurationTime = maxDuration * ONE_SECOND;
      if (!options.skipBlocking) {
        flags.blockTransition = timings.transitionDuration > 0;
        flags.blockKeyframeAnimation = timings.animationDuration > 0 &&
                                       stagger.animationDelay > 0 &&
                                       stagger.animationDuration === 0;
      }

      if (options.from) {
        if (options.cleanupStyles) {
          registerRestorableStyles(restoreStyles, node, Object.keys(options.from));
        }
        applyAnimationFromStyles(element, options);
      }

      if (flags.blockTransition || flags.blockKeyframeAnimation) {
        applyBlocking(maxDuration);
      } else if (!options.skipBlocking) {
        blockTransitions(node, false);
      }

      // TODO(matsko): for 1.5 change this code to have an animator object for better debugging
      return {
        $$willAnimate: true,
        end: endFn,
        start: function() {
          if (animationClosed) return;

          runnerHost = {
            end: endFn,
            cancel: cancelFn,
            resume: null, //this will be set during the start() phase
            pause: null
          };

          runner = new $$AnimateRunner(runnerHost);

          waitUntilQuiet(start);

          // we don't have access to pause/resume the animation
          // since it hasn't run yet. AnimateRunner will therefore
          // set noop functions for resume and pause and they will
          // later be overridden once the animation is triggered
          return runner;
        }
      };

      function endFn() {
        close();
      }

      function cancelFn() {
        close(true);
      }

      function close(rejected) { // jshint ignore:line
        // if the promise has been called already then we shouldn't close
        // the animation again
        if (animationClosed || (animationCompleted && animationPaused)) return;
        animationClosed = true;
        animationPaused = false;

        if (!options.$$skipPreparationClasses) {
          $$jqLite.removeClass(element, preparationClasses);
        }
        $$jqLite.removeClass(element, activeClasses);

        blockKeyframeAnimations(node, false);
        blockTransitions(node, false);

        forEach(temporaryStyles, function(entry) {
          // There is only one way to remove inline style properties entirely from elements.
          // By using `removeProperty` this works, but we need to convert camel-cased CSS
          // styles down to hyphenated values.
          node.style[entry[0]] = '';
        });

        applyAnimationClasses(element, options);
        applyAnimationStyles(element, options);

        if (Object.keys(restoreStyles).length) {
          forEach(restoreStyles, function(value, prop) {
            value ? node.style.setProperty(prop, value)
                  : node.style.removeProperty(prop);
          });
        }

        // the reason why we have this option is to allow a synchronous closing callback
        // that is fired as SOON as the animation ends (when the CSS is removed) or if
        // the animation never takes off at all. A good example is a leave animation since
        // the element must be removed just after the animation is over or else the element
        // will appear on screen for one animation frame causing an overbearing flicker.
        if (options.onDone) {
          options.onDone();
        }

        if (events && events.length) {
          // Remove the transitionend / animationend listener(s)
          element.off(events.join(' '), onAnimationProgress);
        }

        //Cancel the fallback closing timeout and remove the timer data
        var animationTimerData = element.data(ANIMATE_TIMER_KEY);
        if (animationTimerData) {
          $timeout.cancel(animationTimerData[0].timer);
          element.removeData(ANIMATE_TIMER_KEY);
        }

        // if the preparation function fails then the promise is not setup
        if (runner) {
          runner.complete(!rejected);
        }
      }

      function applyBlocking(duration) {
        if (flags.blockTransition) {
          blockTransitions(node, duration);
        }

        if (flags.blockKeyframeAnimation) {
          blockKeyframeAnimations(node, !!duration);
        }
      }

      function closeAndReturnNoopAnimator() {
        runner = new $$AnimateRunner({
          end: endFn,
          cancel: cancelFn
        });

        // should flush the cache animation
        waitUntilQuiet(noop);
        close();

        return {
          $$willAnimate: false,
          start: function() {
            return runner;
          },
          end: endFn
        };
      }

      function onAnimationProgress(event) {
        event.stopPropagation();
        var ev = event.originalEvent || event;

        // we now always use `Date.now()` due to the recent changes with
        // event.timeStamp in Firefox, Webkit and Chrome (see #13494 for more info)
        var timeStamp = ev.$manualTimeStamp || Date.now();

        /* Firefox (or possibly just Gecko) likes to not round values up
         * when a ms measurement is used for the animation */
        var elapsedTime = parseFloat(ev.elapsedTime.toFixed(ELAPSED_TIME_MAX_DECIMAL_PLACES));

        /* $manualTimeStamp is a mocked timeStamp value which is set
         * within browserTrigger(). This is only here so that tests can
         * mock animations properly. Real events fallback to event.timeStamp,
         * or, if they don't, then a timeStamp is automatically created for them.
         * We're checking to see if the timeStamp surpasses the expected delay,
         * but we're using elapsedTime instead of the timeStamp on the 2nd
         * pre-condition since animationPauseds sometimes close off early */
        if (Math.max(timeStamp - startTime, 0) >= maxDelayTime && elapsedTime >= maxDuration) {
          // we set this flag to ensure that if the transition is paused then, when resumed,
          // the animation will automatically close itself since transitions cannot be paused.
          animationCompleted = true;
          close();
        }
      }

      function start() {
        if (animationClosed) return;
        if (!node.parentNode) {
          close();
          return;
        }

        // even though we only pause keyframe animations here the pause flag
        // will still happen when transitions are used. Only the transition will
        // not be paused since that is not possible. If the animation ends when
        // paused then it will not complete until unpaused or cancelled.
        var playPause = function(playAnimation) {
          if (!animationCompleted) {
            animationPaused = !playAnimation;
            if (timings.animationDuration) {
              var value = blockKeyframeAnimations(node, animationPaused);
              animationPaused
                  ? temporaryStyles.push(value)
                  : removeFromArray(temporaryStyles, value);
            }
          } else if (animationPaused && playAnimation) {
            animationPaused = false;
            close();
          }
        };

        // checking the stagger duration prevents an accidentally cascade of the CSS delay style
        // being inherited from the parent. If the transition duration is zero then we can safely
        // rely that the delay value is an intentional stagger delay style.
        var maxStagger = itemIndex > 0
                         && ((timings.transitionDuration && stagger.transitionDuration === 0) ||
                            (timings.animationDuration && stagger.animationDuration === 0))
                         && Math.max(stagger.animationDelay, stagger.transitionDelay);
        if (maxStagger) {
          $timeout(triggerAnimationStart,
                   Math.floor(maxStagger * itemIndex * ONE_SECOND),
                   false);
        } else {
          triggerAnimationStart();
        }

        // this will decorate the existing promise runner with pause/resume methods
        runnerHost.resume = function() {
          playPause(true);
        };

        runnerHost.pause = function() {
          playPause(false);
        };

        function triggerAnimationStart() {
          // just incase a stagger animation kicks in when the animation
          // itself was cancelled entirely
          if (animationClosed) return;

          applyBlocking(false);

          forEach(temporaryStyles, function(entry) {
            var key = entry[0];
            var value = entry[1];
            node.style[key] = value;
          });

          applyAnimationClasses(element, options);
          $$jqLite.addClass(element, activeClasses);

          if (flags.recalculateTimingStyles) {
            fullClassName = node.className + ' ' + preparationClasses;
            cacheKey = gcsHashFn(node, fullClassName);

            timings = computeTimings(node, fullClassName, cacheKey);
            relativeDelay = timings.maxDelay;
            maxDelay = Math.max(relativeDelay, 0);
            maxDuration = timings.maxDuration;

            if (maxDuration === 0) {
              close();
              return;
            }

            flags.hasTransitions = timings.transitionDuration > 0;
            flags.hasAnimations = timings.animationDuration > 0;
          }

          if (flags.applyAnimationDelay) {
            relativeDelay = typeof options.delay !== "boolean" && truthyTimingValue(options.delay)
                  ? parseFloat(options.delay)
                  : relativeDelay;

            maxDelay = Math.max(relativeDelay, 0);
            timings.animationDelay = relativeDelay;
            delayStyle = getCssDelayStyle(relativeDelay, true);
            temporaryStyles.push(delayStyle);
            node.style[delayStyle[0]] = delayStyle[1];
          }

          maxDelayTime = maxDelay * ONE_SECOND;
          maxDurationTime = maxDuration * ONE_SECOND;

          if (options.easing) {
            var easeProp, easeVal = options.easing;
            if (flags.hasTransitions) {
              easeProp = TRANSITION_PROP + TIMING_KEY;
              temporaryStyles.push([easeProp, easeVal]);
              node.style[easeProp] = easeVal;
            }
            if (flags.hasAnimations) {
              easeProp = ANIMATION_PROP + TIMING_KEY;
              temporaryStyles.push([easeProp, easeVal]);
              node.style[easeProp] = easeVal;
            }
          }

          if (timings.transitionDuration) {
            events.push(TRANSITIONEND_EVENT);
          }

          if (timings.animationDuration) {
            events.push(ANIMATIONEND_EVENT);
          }

          startTime = Date.now();
          var timerTime = maxDelayTime + CLOSING_TIME_BUFFER * maxDurationTime;
          var endTime = startTime + timerTime;

          var animationsData = element.data(ANIMATE_TIMER_KEY) || [];
          var setupFallbackTimer = true;
          if (animationsData.length) {
            var currentTimerData = animationsData[0];
            setupFallbackTimer = endTime > currentTimerData.expectedEndTime;
            if (setupFallbackTimer) {
              $timeout.cancel(currentTimerData.timer);
            } else {
              animationsData.push(close);
            }
          }

          if (setupFallbackTimer) {
            var timer = $timeout(onAnimationExpired, timerTime, false);
            animationsData[0] = {
              timer: timer,
              expectedEndTime: endTime
            };
            animationsData.push(close);
            element.data(ANIMATE_TIMER_KEY, animationsData);
          }

          if (events.length) {
            element.on(events.join(' '), onAnimationProgress);
          }

          if (options.to) {
            if (options.cleanupStyles) {
              registerRestorableStyles(restoreStyles, node, Object.keys(options.to));
            }
            applyAnimationToStyles(element, options);
          }
        }

        function onAnimationExpired() {
          var animationsData = element.data(ANIMATE_TIMER_KEY);

          // this will be false in the event that the element was
          // removed from the DOM (via a leave animation or something
          // similar)
          if (animationsData) {
            for (var i = 1; i < animationsData.length; i++) {
              animationsData[i]();
            }
            element.removeData(ANIMATE_TIMER_KEY);
          }
        }
      }
    };
  }];
}];

var $$AnimateCssDriverProvider = ['$$animationProvider', function($$animationProvider) {
  $$animationProvider.drivers.push('$$animateCssDriver');

  var NG_ANIMATE_SHIM_CLASS_NAME = 'ng-animate-shim';
  var NG_ANIMATE_ANCHOR_CLASS_NAME = 'ng-anchor';

  var NG_OUT_ANCHOR_CLASS_NAME = 'ng-anchor-out';
  var NG_IN_ANCHOR_CLASS_NAME = 'ng-anchor-in';

  function isDocumentFragment(node) {
    return node.parentNode && node.parentNode.nodeType === 11;
  }

  this.$get = ['$animateCss', '$rootScope', '$$AnimateRunner', '$rootElement', '$sniffer', '$$jqLite', '$document',
       function($animateCss,   $rootScope,   $$AnimateRunner,   $rootElement,   $sniffer,   $$jqLite,   $document) {

    // only browsers that support these properties can render animations
    if (!$sniffer.animations && !$sniffer.transitions) return noop;

    var bodyNode = $document[0].body;
    var rootNode = getDomNode($rootElement);

    var rootBodyElement = jqLite(
      // this is to avoid using something that exists outside of the body
      // we also special case the doc fragment case because our unit test code
      // appends the $rootElement to the body after the app has been bootstrapped
      isDocumentFragment(rootNode) || bodyNode.contains(rootNode) ? rootNode : bodyNode
    );

    var applyAnimationClasses = applyAnimationClassesFactory($$jqLite);

    return function initDriverFn(animationDetails) {
      return animationDetails.from && animationDetails.to
          ? prepareFromToAnchorAnimation(animationDetails.from,
                                         animationDetails.to,
                                         animationDetails.classes,
                                         animationDetails.anchors)
          : prepareRegularAnimation(animationDetails);
    };

    function filterCssClasses(classes) {
      //remove all the `ng-` stuff
      return classes.replace(/\bng-\S+\b/g, '');
    }

    function getUniqueValues(a, b) {
      if (isString(a)) a = a.split(' ');
      if (isString(b)) b = b.split(' ');
      return a.filter(function(val) {
        return b.indexOf(val) === -1;
      }).join(' ');
    }

    function prepareAnchoredAnimation(classes, outAnchor, inAnchor) {
      var clone = jqLite(getDomNode(outAnchor).cloneNode(true));
      var startingClasses = filterCssClasses(getClassVal(clone));

      outAnchor.addClass(NG_ANIMATE_SHIM_CLASS_NAME);
      inAnchor.addClass(NG_ANIMATE_SHIM_CLASS_NAME);

      clone.addClass(NG_ANIMATE_ANCHOR_CLASS_NAME);

      rootBodyElement.append(clone);

      var animatorIn, animatorOut = prepareOutAnimation();

      // the user may not end up using the `out` animation and
      // only making use of the `in` animation or vice-versa.
      // In either case we should allow this and not assume the
      // animation is over unless both animations are not used.
      if (!animatorOut) {
        animatorIn = prepareInAnimation();
        if (!animatorIn) {
          return end();
        }
      }

      var startingAnimator = animatorOut || animatorIn;

      return {
        start: function() {
          var runner;

          var currentAnimation = startingAnimator.start();
          currentAnimation.done(function() {
            currentAnimation = null;
            if (!animatorIn) {
              animatorIn = prepareInAnimation();
              if (animatorIn) {
                currentAnimation = animatorIn.start();
                currentAnimation.done(function() {
                  currentAnimation = null;
                  end();
                  runner.complete();
                });
                return currentAnimation;
              }
            }
            // in the event that there is no `in` animation
            end();
            runner.complete();
          });

          runner = new $$AnimateRunner({
            end: endFn,
            cancel: endFn
          });

          return runner;

          function endFn() {
            if (currentAnimation) {
              currentAnimation.end();
            }
          }
        }
      };

      function calculateAnchorStyles(anchor) {
        var styles = {};

        var coords = getDomNode(anchor).getBoundingClientRect();

        // we iterate directly since safari messes up and doesn't return
        // all the keys for the coords object when iterated
        forEach(['width','height','top','left'], function(key) {
          var value = coords[key];
          switch (key) {
            case 'top':
              value += bodyNode.scrollTop;
              break;
            case 'left':
              value += bodyNode.scrollLeft;
              break;
          }
          styles[key] = Math.floor(value) + 'px';
        });
        return styles;
      }

      function prepareOutAnimation() {
        var animator = $animateCss(clone, {
          addClass: NG_OUT_ANCHOR_CLASS_NAME,
          delay: true,
          from: calculateAnchorStyles(outAnchor)
        });

        // read the comment within `prepareRegularAnimation` to understand
        // why this check is necessary
        return animator.$$willAnimate ? animator : null;
      }

      function getClassVal(element) {
        return element.attr('class') || '';
      }

      function prepareInAnimation() {
        var endingClasses = filterCssClasses(getClassVal(inAnchor));
        var toAdd = getUniqueValues(endingClasses, startingClasses);
        var toRemove = getUniqueValues(startingClasses, endingClasses);

        var animator = $animateCss(clone, {
          to: calculateAnchorStyles(inAnchor),
          addClass: NG_IN_ANCHOR_CLASS_NAME + ' ' + toAdd,
          removeClass: NG_OUT_ANCHOR_CLASS_NAME + ' ' + toRemove,
          delay: true
        });

        // read the comment within `prepareRegularAnimation` to understand
        // why this check is necessary
        return animator.$$willAnimate ? animator : null;
      }

      function end() {
        clone.remove();
        outAnchor.removeClass(NG_ANIMATE_SHIM_CLASS_NAME);
        inAnchor.removeClass(NG_ANIMATE_SHIM_CLASS_NAME);
      }
    }

    function prepareFromToAnchorAnimation(from, to, classes, anchors) {
      var fromAnimation = prepareRegularAnimation(from, noop);
      var toAnimation = prepareRegularAnimation(to, noop);

      var anchorAnimations = [];
      forEach(anchors, function(anchor) {
        var outElement = anchor['out'];
        var inElement = anchor['in'];
        var animator = prepareAnchoredAnimation(classes, outElement, inElement);
        if (animator) {
          anchorAnimations.push(animator);
        }
      });

      // no point in doing anything when there are no elements to animate
      if (!fromAnimation && !toAnimation && anchorAnimations.length === 0) return;

      return {
        start: function() {
          var animationRunners = [];

          if (fromAnimation) {
            animationRunners.push(fromAnimation.start());
          }

          if (toAnimation) {
            animationRunners.push(toAnimation.start());
          }

          forEach(anchorAnimations, function(animation) {
            animationRunners.push(animation.start());
          });

          var runner = new $$AnimateRunner({
            end: endFn,
            cancel: endFn // CSS-driven animations cannot be cancelled, only ended
          });

          $$AnimateRunner.all(animationRunners, function(status) {
            runner.complete(status);
          });

          return runner;

          function endFn() {
            forEach(animationRunners, function(runner) {
              runner.end();
            });
          }
        }
      };
    }

    function prepareRegularAnimation(animationDetails) {
      var element = animationDetails.element;
      var options = animationDetails.options || {};

      if (animationDetails.structural) {
        options.event = animationDetails.event;
        options.structural = true;
        options.applyClassesEarly = true;

        // we special case the leave animation since we want to ensure that
        // the element is removed as soon as the animation is over. Otherwise
        // a flicker might appear or the element may not be removed at all
        if (animationDetails.event === 'leave') {
          options.onDone = options.domOperation;
        }
      }

      // We assign the preparationClasses as the actual animation event since
      // the internals of $animateCss will just suffix the event token values
      // with `-active` to trigger the animation.
      if (options.preparationClasses) {
        options.event = concatWithSpace(options.event, options.preparationClasses);
      }

      var animator = $animateCss(element, options);

      // the driver lookup code inside of $$animation attempts to spawn a
      // driver one by one until a driver returns a.$$willAnimate animator object.
      // $animateCss will always return an object, however, it will pass in
      // a flag as a hint as to whether an animation was detected or not
      return animator.$$willAnimate ? animator : null;
    }
  }];
}];

// TODO(matsko): use caching here to speed things up for detection
// TODO(matsko): add documentation
//  by the time...

var $$AnimateJsProvider = ['$animateProvider', function($animateProvider) {
  this.$get = ['$injector', '$$AnimateRunner', '$$jqLite',
       function($injector,   $$AnimateRunner,   $$jqLite) {

    var applyAnimationClasses = applyAnimationClassesFactory($$jqLite);
         // $animateJs(element, 'enter');
    return function(element, event, classes, options) {
      var animationClosed = false;

      // the `classes` argument is optional and if it is not used
      // then the classes will be resolved from the element's className
      // property as well as options.addClass/options.removeClass.
      if (arguments.length === 3 && isObject(classes)) {
        options = classes;
        classes = null;
      }

      options = prepareAnimationOptions(options);
      if (!classes) {
        classes = element.attr('class') || '';
        if (options.addClass) {
          classes += ' ' + options.addClass;
        }
        if (options.removeClass) {
          classes += ' ' + options.removeClass;
        }
      }

      var classesToAdd = options.addClass;
      var classesToRemove = options.removeClass;

      // the lookupAnimations function returns a series of animation objects that are
      // matched up with one or more of the CSS classes. These animation objects are
      // defined via the module.animation factory function. If nothing is detected then
      // we don't return anything which then makes $animation query the next driver.
      var animations = lookupAnimations(classes);
      var before, after;
      if (animations.length) {
        var afterFn, beforeFn;
        if (event == 'leave') {
          beforeFn = 'leave';
          afterFn = 'afterLeave'; // TODO(matsko): get rid of this
        } else {
          beforeFn = 'before' + event.charAt(0).toUpperCase() + event.substr(1);
          afterFn = event;
        }

        if (event !== 'enter' && event !== 'move') {
          before = packageAnimations(element, event, options, animations, beforeFn);
        }
        after  = packageAnimations(element, event, options, animations, afterFn);
      }

      // no matching animations
      if (!before && !after) return;

      function applyOptions() {
        options.domOperation();
        applyAnimationClasses(element, options);
      }

      function close() {
        animationClosed = true;
        applyOptions();
        applyAnimationStyles(element, options);
      }

      var runner;

      return {
        $$willAnimate: true,
        end: function() {
          if (runner) {
            runner.end();
          } else {
            close();
            runner = new $$AnimateRunner();
            runner.complete(true);
          }
          return runner;
        },
        start: function() {
          if (runner) {
            return runner;
          }

          runner = new $$AnimateRunner();
          var closeActiveAnimations;
          var chain = [];

          if (before) {
            chain.push(function(fn) {
              closeActiveAnimations = before(fn);
            });
          }

          if (chain.length) {
            chain.push(function(fn) {
              applyOptions();
              fn(true);
            });
          } else {
            applyOptions();
          }

          if (after) {
            chain.push(function(fn) {
              closeActiveAnimations = after(fn);
            });
          }

          runner.setHost({
            end: function() {
              endAnimations();
            },
            cancel: function() {
              endAnimations(true);
            }
          });

          $$AnimateRunner.chain(chain, onComplete);
          return runner;

          function onComplete(success) {
            close(success);
            runner.complete(success);
          }

          function endAnimations(cancelled) {
            if (!animationClosed) {
              (closeActiveAnimations || noop)(cancelled);
              onComplete(cancelled);
            }
          }
        }
      };

      function executeAnimationFn(fn, element, event, options, onDone) {
        var args;
        switch (event) {
          case 'animate':
            args = [element, options.from, options.to, onDone];
            break;

          case 'setClass':
            args = [element, classesToAdd, classesToRemove, onDone];
            break;

          case 'addClass':
            args = [element, classesToAdd, onDone];
            break;

          case 'removeClass':
            args = [element, classesToRemove, onDone];
            break;

          default:
            args = [element, onDone];
            break;
        }

        args.push(options);

        var value = fn.apply(fn, args);
        if (value) {
          if (isFunction(value.start)) {
            value = value.start();
          }

          if (value instanceof $$AnimateRunner) {
            value.done(onDone);
          } else if (isFunction(value)) {
            // optional onEnd / onCancel callback
            return value;
          }
        }

        return noop;
      }

      function groupEventedAnimations(element, event, options, animations, fnName) {
        var operations = [];
        forEach(animations, function(ani) {
          var animation = ani[fnName];
          if (!animation) return;

          // note that all of these animations will run in parallel
          operations.push(function() {
            var runner;
            var endProgressCb;

            var resolved = false;
            var onAnimationComplete = function(rejected) {
              if (!resolved) {
                resolved = true;
                (endProgressCb || noop)(rejected);
                runner.complete(!rejected);
              }
            };

            runner = new $$AnimateRunner({
              end: function() {
                onAnimationComplete();
              },
              cancel: function() {
                onAnimationComplete(true);
              }
            });

            endProgressCb = executeAnimationFn(animation, element, event, options, function(result) {
              var cancelled = result === false;
              onAnimationComplete(cancelled);
            });

            return runner;
          });
        });

        return operations;
      }

      function packageAnimations(element, event, options, animations, fnName) {
        var operations = groupEventedAnimations(element, event, options, animations, fnName);
        if (operations.length === 0) {
          var a,b;
          if (fnName === 'beforeSetClass') {
            a = groupEventedAnimations(element, 'removeClass', options, animations, 'beforeRemoveClass');
            b = groupEventedAnimations(element, 'addClass', options, animations, 'beforeAddClass');
          } else if (fnName === 'setClass') {
            a = groupEventedAnimations(element, 'removeClass', options, animations, 'removeClass');
            b = groupEventedAnimations(element, 'addClass', options, animations, 'addClass');
          }

          if (a) {
            operations = operations.concat(a);
          }
          if (b) {
            operations = operations.concat(b);
          }
        }

        if (operations.length === 0) return;

        // TODO(matsko): add documentation
        return function startAnimation(callback) {
          var runners = [];
          if (operations.length) {
            forEach(operations, function(animateFn) {
              runners.push(animateFn());
            });
          }

          runners.length ? $$AnimateRunner.all(runners, callback) : callback();

          return function endFn(reject) {
            forEach(runners, function(runner) {
              reject ? runner.cancel() : runner.end();
            });
          };
        };
      }
    };

    function lookupAnimations(classes) {
      classes = isArray(classes) ? classes : classes.split(' ');
      var matches = [], flagMap = {};
      for (var i=0; i < classes.length; i++) {
        var klass = classes[i],
            animationFactory = $animateProvider.$$registeredAnimations[klass];
        if (animationFactory && !flagMap[klass]) {
          matches.push($injector.get(animationFactory));
          flagMap[klass] = true;
        }
      }
      return matches;
    }
  }];
}];

var $$AnimateJsDriverProvider = ['$$animationProvider', function($$animationProvider) {
  $$animationProvider.drivers.push('$$animateJsDriver');
  this.$get = ['$$animateJs', '$$AnimateRunner', function($$animateJs, $$AnimateRunner) {
    return function initDriverFn(animationDetails) {
      if (animationDetails.from && animationDetails.to) {
        var fromAnimation = prepareAnimation(animationDetails.from);
        var toAnimation = prepareAnimation(animationDetails.to);
        if (!fromAnimation && !toAnimation) return;

        return {
          start: function() {
            var animationRunners = [];

            if (fromAnimation) {
              animationRunners.push(fromAnimation.start());
            }

            if (toAnimation) {
              animationRunners.push(toAnimation.start());
            }

            $$AnimateRunner.all(animationRunners, done);

            var runner = new $$AnimateRunner({
              end: endFnFactory(),
              cancel: endFnFactory()
            });

            return runner;

            function endFnFactory() {
              return function() {
                forEach(animationRunners, function(runner) {
                  // at this point we cannot cancel animations for groups just yet. 1.5+
                  runner.end();
                });
              };
            }

            function done(status) {
              runner.complete(status);
            }
          }
        };
      } else {
        return prepareAnimation(animationDetails);
      }
    };

    function prepareAnimation(animationDetails) {
      // TODO(matsko): make sure to check for grouped animations and delegate down to normal animations
      var element = animationDetails.element;
      var event = animationDetails.event;
      var options = animationDetails.options;
      var classes = animationDetails.classes;
      return $$animateJs(element, event, classes, options);
    }
  }];
}];

var NG_ANIMATE_ATTR_NAME = 'data-ng-animate';
var NG_ANIMATE_PIN_DATA = '$ngAnimatePin';
var $$AnimateQueueProvider = ['$animateProvider', function($animateProvider) {
  var PRE_DIGEST_STATE = 1;
  var RUNNING_STATE = 2;
  var ONE_SPACE = ' ';

  var rules = this.rules = {
    skip: [],
    cancel: [],
    join: []
  };

  function makeTruthyCssClassMap(classString) {
    if (!classString) {
      return null;
    }

    var keys = classString.split(ONE_SPACE);
    var map = Object.create(null);

    forEach(keys, function(key) {
      map[key] = true;
    });
    return map;
  }

  function hasMatchingClasses(newClassString, currentClassString) {
    if (newClassString && currentClassString) {
      var currentClassMap = makeTruthyCssClassMap(currentClassString);
      return newClassString.split(ONE_SPACE).some(function(className) {
        return currentClassMap[className];
      });
    }
  }

  function isAllowed(ruleType, element, currentAnimation, previousAnimation) {
    return rules[ruleType].some(function(fn) {
      return fn(element, currentAnimation, previousAnimation);
    });
  }

  function hasAnimationClasses(animation, and) {
    var a = (animation.addClass || '').length > 0;
    var b = (animation.removeClass || '').length > 0;
    return and ? a && b : a || b;
  }

  rules.join.push(function(element, newAnimation, currentAnimation) {
    // if the new animation is class-based then we can just tack that on
    return !newAnimation.structural && hasAnimationClasses(newAnimation);
  });

  rules.skip.push(function(element, newAnimation, currentAnimation) {
    // there is no need to animate anything if no classes are being added and
    // there is no structural animation that will be triggered
    return !newAnimation.structural && !hasAnimationClasses(newAnimation);
  });

  rules.skip.push(function(element, newAnimation, currentAnimation) {
    // why should we trigger a new structural animation if the element will
    // be removed from the DOM anyway?
    return currentAnimation.event == 'leave' && newAnimation.structural;
  });

  rules.skip.push(function(element, newAnimation, currentAnimation) {
    // if there is an ongoing current animation then don't even bother running the class-based animation
    return currentAnimation.structural && currentAnimation.state === RUNNING_STATE && !newAnimation.structural;
  });

  rules.cancel.push(function(element, newAnimation, currentAnimation) {
    // there can never be two structural animations running at the same time
    return currentAnimation.structural && newAnimation.structural;
  });

  rules.cancel.push(function(element, newAnimation, currentAnimation) {
    // if the previous animation is already running, but the new animation will
    // be triggered, but the new animation is structural
    return currentAnimation.state === RUNNING_STATE && newAnimation.structural;
  });

  rules.cancel.push(function(element, newAnimation, currentAnimation) {
    // cancel the animation if classes added / removed in both animation cancel each other out,
    // but only if the current animation isn't structural

    if (currentAnimation.structural) return false;

    var nA = newAnimation.addClass;
    var nR = newAnimation.removeClass;
    var cA = currentAnimation.addClass;
    var cR = currentAnimation.removeClass;

    // early detection to save the global CPU shortage :)
    if ((isUndefined(nA) && isUndefined(nR)) || (isUndefined(cA) && isUndefined(cR))) {
      return false;
    }

    return hasMatchingClasses(nA, cR) || hasMatchingClasses(nR, cA);
  });

  this.$get = ['$$rAF', '$rootScope', '$rootElement', '$document', '$$HashMap',
               '$$animation', '$$AnimateRunner', '$templateRequest', '$$jqLite', '$$forceReflow',
       function($$rAF,   $rootScope,   $rootElement,   $document,   $$HashMap,
                $$animation,   $$AnimateRunner,   $templateRequest,   $$jqLite,   $$forceReflow) {

    var activeAnimationsLookup = new $$HashMap();
    var disabledElementsLookup = new $$HashMap();
    var animationsEnabled = null;

    function postDigestTaskFactory() {
      var postDigestCalled = false;
      return function(fn) {
        // we only issue a call to postDigest before
        // it has first passed. This prevents any callbacks
        // from not firing once the animation has completed
        // since it will be out of the digest cycle.
        if (postDigestCalled) {
          fn();
        } else {
          $rootScope.$$postDigest(function() {
            postDigestCalled = true;
            fn();
          });
        }
      };
    }

    // Wait until all directive and route-related templates are downloaded and
    // compiled. The $templateRequest.totalPendingRequests variable keeps track of
    // all of the remote templates being currently downloaded. If there are no
    // templates currently downloading then the watcher will still fire anyway.
    var deregisterWatch = $rootScope.$watch(
      function() { return $templateRequest.totalPendingRequests === 0; },
      function(isEmpty) {
        if (!isEmpty) return;
        deregisterWatch();

        // Now that all templates have been downloaded, $animate will wait until
        // the post digest queue is empty before enabling animations. By having two
        // calls to $postDigest calls we can ensure that the flag is enabled at the
        // very end of the post digest queue. Since all of the animations in $animate
        // use $postDigest, it's important that the code below executes at the end.
        // This basically means that the page is fully downloaded and compiled before
        // any animations are triggered.
        $rootScope.$$postDigest(function() {
          $rootScope.$$postDigest(function() {
            // we check for null directly in the event that the application already called
            // .enabled() with whatever arguments that it provided it with
            if (animationsEnabled === null) {
              animationsEnabled = true;
            }
          });
        });
      }
    );

    var callbackRegistry = Object.create(null);

    // remember that the classNameFilter is set during the provider/config
    // stage therefore we can optimize here and setup a helper function
    var classNameFilter = $animateProvider.classNameFilter();
    var isAnimatableClassName = !classNameFilter
              ? function() { return true; }
              : function(className) {
                return classNameFilter.test(className);
              };

    var applyAnimationClasses = applyAnimationClassesFactory($$jqLite);

    function normalizeAnimationDetails(element, animation) {
      return mergeAnimationDetails(element, animation, {});
    }

    // IE9-11 has no method "contains" in SVG element and in Node.prototype. Bug #10259.
    var contains = window.Node.prototype.contains || function(arg) {
      // jshint bitwise: false
      return this === arg || !!(this.compareDocumentPosition(arg) & 16);
      // jshint bitwise: true
    };

    function findCallbacks(parent, element, event) {
      var targetNode = getDomNode(element);
      var targetParentNode = getDomNode(parent);

      var matches = [];
      var entries = callbackRegistry[event];
      if (entries) {
        forEach(entries, function(entry) {
          if (contains.call(entry.node, targetNode)) {
            matches.push(entry.callback);
          } else if (event === 'leave' && contains.call(entry.node, targetParentNode)) {
            matches.push(entry.callback);
          }
        });
      }

      return matches;
    }

    function filterFromRegistry(list, matchContainer, matchCallback) {
      var containerNode = extractElementNode(matchContainer);
      return list.filter(function(entry) {
        var isMatch = entry.node === containerNode &&
                        (!matchCallback || entry.callback === matchCallback);
        return !isMatch;
      });
    }

    function cleanupEventListeners(phase, element) {
      if (phase === 'close' && !element[0].parentNode) {
        // If the element is not attached to a parentNode, it has been removed by
        // the domOperation, and we can safely remove the event callbacks
        $animate.off(element);
      }
    }

    var $animate = {
      on: function(event, container, callback) {
        var node = extractElementNode(container);
        callbackRegistry[event] = callbackRegistry[event] || [];
        callbackRegistry[event].push({
          node: node,
          callback: callback
        });

        // Remove the callback when the element is removed from the DOM
        jqLite(container).on('$destroy', function() {
          var animationDetails = activeAnimationsLookup.get(node);

          if (!animationDetails) {
            // If there's an animation ongoing, the callback calling code will remove
            // the event listeners. If we'd remove here, the callbacks would be removed
            // before the animation ends
            $animate.off(event, container, callback);
          }
        });
      },

      off: function(event, container, callback) {
        if (arguments.length === 1 && !isString(arguments[0])) {
          container = arguments[0];
          for (var eventType in callbackRegistry) {
            callbackRegistry[eventType] = filterFromRegistry(callbackRegistry[eventType], container);
          }

          return;
        }

        var entries = callbackRegistry[event];
        if (!entries) return;

        callbackRegistry[event] = arguments.length === 1
            ? null
            : filterFromRegistry(entries, container, callback);
      },

      pin: function(element, parentElement) {
        assertArg(isElement(element), 'element', 'not an element');
        assertArg(isElement(parentElement), 'parentElement', 'not an element');
        element.data(NG_ANIMATE_PIN_DATA, parentElement);
      },

      push: function(element, event, options, domOperation) {
        options = options || {};
        options.domOperation = domOperation;
        return queueAnimation(element, event, options);
      },

      // this method has four signatures:
      //  () - global getter
      //  (bool) - global setter
      //  (element) - element getter
      //  (element, bool) - element setter<F37>
      enabled: function(element, bool) {
        var argCount = arguments.length;

        if (argCount === 0) {
          // () - Global getter
          bool = !!animationsEnabled;
        } else {
          var hasElement = isElement(element);

          if (!hasElement) {
            // (bool) - Global setter
            bool = animationsEnabled = !!element;
          } else {
            var node = getDomNode(element);

            if (argCount === 1) {
              // (element) - Element getter
              bool = !disabledElementsLookup.get(node);
            } else {
              // (element, bool) - Element setter
              disabledElementsLookup.put(node, !bool);
            }
          }
        }

        return bool;
      }
    };

    return $animate;

    function queueAnimation(element, event, initialOptions) {
      // we always make a copy of the options since
      // there should never be any side effects on
      // the input data when running `$animateCss`.
      var options = copy(initialOptions);

      var node, parent;
      element = stripCommentsFromElement(element);
      if (element) {
        node = getDomNode(element);
        parent = element.parent();
      }

      options = prepareAnimationOptions(options);

      // we create a fake runner with a working promise.
      // These methods will become available after the digest has passed
      var runner = new $$AnimateRunner();

      // this is used to trigger callbacks in postDigest mode
      var runInNextPostDigestOrNow = postDigestTaskFactory();

      if (isArray(options.addClass)) {
        options.addClass = options.addClass.join(' ');
      }

      if (options.addClass && !isString(options.addClass)) {
        options.addClass = null;
      }

      if (isArray(options.removeClass)) {
        options.removeClass = options.removeClass.join(' ');
      }

      if (options.removeClass && !isString(options.removeClass)) {
        options.removeClass = null;
      }

      if (options.from && !isObject(options.from)) {
        options.from = null;
      }

      if (options.to && !isObject(options.to)) {
        options.to = null;
      }

      // there are situations where a directive issues an animation for
      // a jqLite wrapper that contains only comment nodes... If this
      // happens then there is no way we can perform an animation
      if (!node) {
        close();
        return runner;
      }

      var className = [node.className, options.addClass, options.removeClass].join(' ');
      if (!isAnimatableClassName(className)) {
        close();
        return runner;
      }

      var isStructural = ['enter', 'move', 'leave'].indexOf(event) >= 0;

      var documentHidden = $document[0].hidden;

      // this is a hard disable of all animations for the application or on
      // the element itself, therefore  there is no need to continue further
      // past this point if not enabled
      // Animations are also disabled if the document is currently hidden (page is not visible
      // to the user), because browsers slow down or do not flush calls to requestAnimationFrame
      var skipAnimations = !animationsEnabled || documentHidden || disabledElementsLookup.get(node);
      var existingAnimation = (!skipAnimations && activeAnimationsLookup.get(node)) || {};
      var hasExistingAnimation = !!existingAnimation.state;

      // there is no point in traversing the same collection of parent ancestors if a followup
      // animation will be run on the same element that already did all that checking work
      if (!skipAnimations && (!hasExistingAnimation || existingAnimation.state != PRE_DIGEST_STATE)) {
        skipAnimations = !areAnimationsAllowed(element, parent, event);
      }

      if (skipAnimations) {
        // Callbacks should fire even if the document is hidden (regression fix for issue #14120)
        if (documentHidden) notifyProgress(runner, event, 'start');
        close();
        if (documentHidden) notifyProgress(runner, event, 'close');
        return runner;
      }

      if (isStructural) {
        closeChildAnimations(element);
      }

      var newAnimation = {
        structural: isStructural,
        element: element,
        event: event,
        addClass: options.addClass,
        removeClass: options.removeClass,
        close: close,
        options: options,
        runner: runner
      };

      if (hasExistingAnimation) {
        var skipAnimationFlag = isAllowed('skip', element, newAnimation, existingAnimation);
        if (skipAnimationFlag) {
          if (existingAnimation.state === RUNNING_STATE) {
            close();
            return runner;
          } else {
            mergeAnimationDetails(element, existingAnimation, newAnimation);
            return existingAnimation.runner;
          }
        }
        var cancelAnimationFlag = isAllowed('cancel', element, newAnimation, existingAnimation);
        if (cancelAnimationFlag) {
          if (existingAnimation.state === RUNNING_STATE) {
            // this will end the animation right away and it is safe
            // to do so since the animation is already running and the
            // runner callback code will run in async
            existingAnimation.runner.end();
          } else if (existingAnimation.structural) {
            // this means that the animation is queued into a digest, but
            // hasn't started yet. Therefore it is safe to run the close
            // method which will call the runner methods in async.
            existingAnimation.close();
          } else {
            // this will merge the new animation options into existing animation options
            mergeAnimationDetails(element, existingAnimation, newAnimation);

            return existingAnimation.runner;
          }
        } else {
          // a joined animation means that this animation will take over the existing one
          // so an example would involve a leave animation taking over an enter. Then when
          // the postDigest kicks in the enter will be ignored.
          var joinAnimationFlag = isAllowed('join', element, newAnimation, existingAnimation);
          if (joinAnimationFlag) {
            if (existingAnimation.state === RUNNING_STATE) {
              normalizeAnimationDetails(element, newAnimation);
            } else {
              applyGeneratedPreparationClasses(element, isStructural ? event : null, options);

              event = newAnimation.event = existingAnimation.event;
              options = mergeAnimationDetails(element, existingAnimation, newAnimation);

              //we return the same runner since only the option values of this animation will
              //be fed into the `existingAnimation`.
              return existingAnimation.runner;
            }
          }
        }
      } else {
        // normalization in this case means that it removes redundant CSS classes that
        // already exist (addClass) or do not exist (removeClass) on the element
        normalizeAnimationDetails(element, newAnimation);
      }

      // when the options are merged and cleaned up we may end up not having to do
      // an animation at all, therefore we should check this before issuing a post
      // digest callback. Structural animations will always run no matter what.
      var isValidAnimation = newAnimation.structural;
      if (!isValidAnimation) {
        // animate (from/to) can be quickly checked first, otherwise we check if any classes are present
        isValidAnimation = (newAnimation.event === 'animate' && Object.keys(newAnimation.options.to || {}).length > 0)
                            || hasAnimationClasses(newAnimation);
      }

      if (!isValidAnimation) {
        close();
        clearElementAnimationState(element);
        return runner;
      }

      // the counter keeps track of cancelled animations
      var counter = (existingAnimation.counter || 0) + 1;
      newAnimation.counter = counter;

      markElementAnimationState(element, PRE_DIGEST_STATE, newAnimation);

      $rootScope.$$postDigest(function() {
        var animationDetails = activeAnimationsLookup.get(node);
        var animationCancelled = !animationDetails;
        animationDetails = animationDetails || {};

        // if addClass/removeClass is called before something like enter then the
        // registered parent element may not be present. The code below will ensure
        // that a final value for parent element is obtained
        var parentElement = element.parent() || [];

        // animate/structural/class-based animations all have requirements. Otherwise there
        // is no point in performing an animation. The parent node must also be set.
        var isValidAnimation = parentElement.length > 0
                                && (animationDetails.event === 'animate'
                                    || animationDetails.structural
                                    || hasAnimationClasses(animationDetails));

        // this means that the previous animation was cancelled
        // even if the follow-up animation is the same event
        if (animationCancelled || animationDetails.counter !== counter || !isValidAnimation) {
          // if another animation did not take over then we need
          // to make sure that the domOperation and options are
          // handled accordingly
          if (animationCancelled) {
            applyAnimationClasses(element, options);
            applyAnimationStyles(element, options);
          }

          // if the event changed from something like enter to leave then we do
          // it, otherwise if it's the same then the end result will be the same too
          if (animationCancelled || (isStructural && animationDetails.event !== event)) {
            options.domOperation();
            runner.end();
          }

          // in the event that the element animation was not cancelled or a follow-up animation
          // isn't allowed to animate from here then we need to clear the state of the element
          // so that any future animations won't read the expired animation data.
          if (!isValidAnimation) {
            clearElementAnimationState(element);
          }

          return;
        }

        // this combined multiple class to addClass / removeClass into a setClass event
        // so long as a structural event did not take over the animation
        event = !animationDetails.structural && hasAnimationClasses(animationDetails, true)
            ? 'setClass'
            : animationDetails.event;

        markElementAnimationState(element, RUNNING_STATE);
        var realRunner = $$animation(element, event, animationDetails.options);

        // this will update the runner's flow-control events based on
        // the `realRunner` object.
        runner.setHost(realRunner);
        notifyProgress(runner, event, 'start', {});

        realRunner.done(function(status) {
          close(!status);
          var animationDetails = activeAnimationsLookup.get(node);
          if (animationDetails && animationDetails.counter === counter) {
            clearElementAnimationState(getDomNode(element));
          }
          notifyProgress(runner, event, 'close', {});
        });
      });

      return runner;

      function notifyProgress(runner, event, phase, data) {
        runInNextPostDigestOrNow(function() {
          var callbacks = findCallbacks(parent, element, event);
          if (callbacks.length) {
            // do not optimize this call here to RAF because
            // we don't know how heavy the callback code here will
            // be and if this code is buffered then this can
            // lead to a performance regression.
            $$rAF(function() {
              forEach(callbacks, function(callback) {
                callback(element, phase, data);
              });
              cleanupEventListeners(phase, element);
            });
          } else {
            cleanupEventListeners(phase, element);
          }
        });
        runner.progress(event, phase, data);
      }

      function close(reject) { // jshint ignore:line
        clearGeneratedClasses(element, options);
        applyAnimationClasses(element, options);
        applyAnimationStyles(element, options);
        options.domOperation();
        runner.complete(!reject);
      }
    }

    function closeChildAnimations(element) {
      var node = getDomNode(element);
      var children = node.querySelectorAll('[' + NG_ANIMATE_ATTR_NAME + ']');
      forEach(children, function(child) {
        var state = parseInt(child.getAttribute(NG_ANIMATE_ATTR_NAME));
        var animationDetails = activeAnimationsLookup.get(child);
        if (animationDetails) {
          switch (state) {
            case RUNNING_STATE:
              animationDetails.runner.end();
              /* falls through */
            case PRE_DIGEST_STATE:
              activeAnimationsLookup.remove(child);
              break;
          }
        }
      });
    }

    function clearElementAnimationState(element) {
      var node = getDomNode(element);
      node.removeAttribute(NG_ANIMATE_ATTR_NAME);
      activeAnimationsLookup.remove(node);
    }

    function isMatchingElement(nodeOrElmA, nodeOrElmB) {
      return getDomNode(nodeOrElmA) === getDomNode(nodeOrElmB);
    }

    /**
     * This fn returns false if any of the following is true:
     * a) animations on any parent element are disabled, and animations on the element aren't explicitly allowed
     * b) a parent element has an ongoing structural animation, and animateChildren is false
     * c) the element is not a child of the body
     * d) the element is not a child of the $rootElement
     */
    function areAnimationsAllowed(element, parentElement, event) {
      var bodyElement = jqLite($document[0].body);
      var bodyElementDetected = isMatchingElement(element, bodyElement) || element[0].nodeName === 'HTML';
      var rootElementDetected = isMatchingElement(element, $rootElement);
      var parentAnimationDetected = false;
      var animateChildren;
      var elementDisabled = disabledElementsLookup.get(getDomNode(element));

      var parentHost = jqLite.data(element[0], NG_ANIMATE_PIN_DATA);
      if (parentHost) {
        parentElement = parentHost;
      }

      parentElement = getDomNode(parentElement);

      while (parentElement) {
        if (!rootElementDetected) {
          // angular doesn't want to attempt to animate elements outside of the application
          // therefore we need to ensure that the rootElement is an ancestor of the current element
          rootElementDetected = isMatchingElement(parentElement, $rootElement);
        }

        if (parentElement.nodeType !== ELEMENT_NODE) {
          // no point in inspecting the #document element
          break;
        }

        var details = activeAnimationsLookup.get(parentElement) || {};
        // either an enter, leave or move animation will commence
        // therefore we can't allow any animations to take place
        // but if a parent animation is class-based then that's ok
        if (!parentAnimationDetected) {
          var parentElementDisabled = disabledElementsLookup.get(parentElement);

          if (parentElementDisabled === true && elementDisabled !== false) {
            // disable animations if the user hasn't explicitly enabled animations on the
            // current element
            elementDisabled = true;
            // element is disabled via parent element, no need to check anything else
            break;
          } else if (parentElementDisabled === false) {
            elementDisabled = false;
          }
          parentAnimationDetected = details.structural;
        }

        if (isUndefined(animateChildren) || animateChildren === true) {
          var value = jqLite.data(parentElement, NG_ANIMATE_CHILDREN_DATA);
          if (isDefined(value)) {
            animateChildren = value;
          }
        }

        // there is no need to continue traversing at this point
        if (parentAnimationDetected && animateChildren === false) break;

        if (!bodyElementDetected) {
          // we also need to ensure that the element is or will be a part of the body element
          // otherwise it is pointless to even issue an animation to be rendered
          bodyElementDetected = isMatchingElement(parentElement, bodyElement);
        }

        if (bodyElementDetected && rootElementDetected) {
          // If both body and root have been found, any other checks are pointless,
          // as no animation data should live outside the application
          break;
        }

        if (!rootElementDetected) {
          // If no rootElement is detected, check if the parentElement is pinned to another element
          parentHost = jqLite.data(parentElement, NG_ANIMATE_PIN_DATA);
          if (parentHost) {
            // The pin target element becomes the next parent element
            parentElement = getDomNode(parentHost);
            continue;
          }
        }

        parentElement = parentElement.parentNode;
      }

      var allowAnimation = (!parentAnimationDetected || animateChildren) && elementDisabled !== true;
      return allowAnimation && rootElementDetected && bodyElementDetected;
    }

    function markElementAnimationState(element, state, details) {
      details = details || {};
      details.state = state;

      var node = getDomNode(element);
      node.setAttribute(NG_ANIMATE_ATTR_NAME, state);

      var oldValue = activeAnimationsLookup.get(node);
      var newValue = oldValue
          ? extend(oldValue, details)
          : details;
      activeAnimationsLookup.put(node, newValue);
    }
  }];
}];

var $$AnimationProvider = ['$animateProvider', function($animateProvider) {
  var NG_ANIMATE_REF_ATTR = 'ng-animate-ref';

  var drivers = this.drivers = [];

  var RUNNER_STORAGE_KEY = '$$animationRunner';

  function setRunner(element, runner) {
    element.data(RUNNER_STORAGE_KEY, runner);
  }

  function removeRunner(element) {
    element.removeData(RUNNER_STORAGE_KEY);
  }

  function getRunner(element) {
    return element.data(RUNNER_STORAGE_KEY);
  }

  this.$get = ['$$jqLite', '$rootScope', '$injector', '$$AnimateRunner', '$$HashMap', '$$rAFScheduler',
       function($$jqLite,   $rootScope,   $injector,   $$AnimateRunner,   $$HashMap,   $$rAFScheduler) {

    var animationQueue = [];
    var applyAnimationClasses = applyAnimationClassesFactory($$jqLite);

    function sortAnimations(animations) {
      var tree = { children: [] };
      var i, lookup = new $$HashMap();

      // this is done first beforehand so that the hashmap
      // is filled with a list of the elements that will be animated
      for (i = 0; i < animations.length; i++) {
        var animation = animations[i];
        lookup.put(animation.domNode, animations[i] = {
          domNode: animation.domNode,
          fn: animation.fn,
          children: []
        });
      }

      for (i = 0; i < animations.length; i++) {
        processNode(animations[i]);
      }

      return flatten(tree);

      function processNode(entry) {
        if (entry.processed) return entry;
        entry.processed = true;

        var elementNode = entry.domNode;
        var parentNode = elementNode.parentNode;
        lookup.put(elementNode, entry);

        var parentEntry;
        while (parentNode) {
          parentEntry = lookup.get(parentNode);
          if (parentEntry) {
            if (!parentEntry.processed) {
              parentEntry = processNode(parentEntry);
            }
            break;
          }
          parentNode = parentNode.parentNode;
        }

        (parentEntry || tree).children.push(entry);
        return entry;
      }

      function flatten(tree) {
        var result = [];
        var queue = [];
        var i;

        for (i = 0; i < tree.children.length; i++) {
          queue.push(tree.children[i]);
        }

        var remainingLevelEntries = queue.length;
        var nextLevelEntries = 0;
        var row = [];

        for (i = 0; i < queue.length; i++) {
          var entry = queue[i];
          if (remainingLevelEntries <= 0) {
            remainingLevelEntries = nextLevelEntries;
            nextLevelEntries = 0;
            result.push(row);
            row = [];
          }
          row.push(entry.fn);
          entry.children.forEach(function(childEntry) {
            nextLevelEntries++;
            queue.push(childEntry);
          });
          remainingLevelEntries--;
        }

        if (row.length) {
          result.push(row);
        }

        return result;
      }
    }

    // TODO(matsko): document the signature in a better way
    return function(element, event, options) {
      options = prepareAnimationOptions(options);
      var isStructural = ['enter', 'move', 'leave'].indexOf(event) >= 0;

      // there is no animation at the current moment, however
      // these runner methods will get later updated with the
      // methods leading into the driver's end/cancel methods
      // for now they just stop the animation from starting
      var runner = new $$AnimateRunner({
        end: function() { close(); },
        cancel: function() { close(true); }
      });

      if (!drivers.length) {
        close();
        return runner;
      }

      setRunner(element, runner);

      var classes = mergeClasses(element.attr('class'), mergeClasses(options.addClass, options.removeClass));
      var tempClasses = options.tempClasses;
      if (tempClasses) {
        classes += ' ' + tempClasses;
        options.tempClasses = null;
      }

      var prepareClassName;
      if (isStructural) {
        prepareClassName = 'ng-' + event + PREPARE_CLASS_SUFFIX;
        $$jqLite.addClass(element, prepareClassName);
      }

      animationQueue.push({
        // this data is used by the postDigest code and passed into
        // the driver step function
        element: element,
        classes: classes,
        event: event,
        structural: isStructural,
        options: options,
        beforeStart: beforeStart,
        close: close
      });

      element.on('$destroy', handleDestroyedElement);

      // we only want there to be one function called within the post digest
      // block. This way we can group animations for all the animations that
      // were apart of the same postDigest flush call.
      if (animationQueue.length > 1) return runner;

      $rootScope.$$postDigest(function() {
        var animations = [];
        forEach(animationQueue, function(entry) {
          // the element was destroyed early on which removed the runner
          // form its storage. This means we can't animate this element
          // at all and it already has been closed due to destruction.
          if (getRunner(entry.element)) {
            animations.push(entry);
          } else {
            entry.close();
          }
        });

        // now any future animations will be in another postDigest
        animationQueue.length = 0;

        var groupedAnimations = groupAnimations(animations);
        var toBeSortedAnimations = [];

        forEach(groupedAnimations, function(animationEntry) {
          toBeSortedAnimations.push({
            domNode: getDomNode(animationEntry.from ? animationEntry.from.element : animationEntry.element),
            fn: function triggerAnimationStart() {
              // it's important that we apply the `ng-animate` CSS class and the
              // temporary classes before we do any driver invoking since these
              // CSS classes may be required for proper CSS detection.
              animationEntry.beforeStart();

              var startAnimationFn, closeFn = animationEntry.close;

              // in the event that the element was removed before the digest runs or
              // during the RAF sequencing then we should not trigger the animation.
              var targetElement = animationEntry.anchors
                  ? (animationEntry.from.element || animationEntry.to.element)
                  : animationEntry.element;

              if (getRunner(targetElement)) {
                var operation = invokeFirstDriver(animationEntry);
                if (operation) {
                  startAnimationFn = operation.start;
                }
              }

              if (!startAnimationFn) {
                closeFn();
              } else {
                var animationRunner = startAnimationFn();
                animationRunner.done(function(status) {
                  closeFn(!status);
                });
                updateAnimationRunners(animationEntry, animationRunner);
              }
            }
          });
        });

        // we need to sort each of the animations in order of parent to child
        // relationships. This ensures that the child classes are applied at the
        // right time.
        $$rAFScheduler(sortAnimations(toBeSortedAnimations));
      });

      return runner;

      // TODO(matsko): change to reference nodes
      function getAnchorNodes(node) {
        var SELECTOR = '[' + NG_ANIMATE_REF_ATTR + ']';
        var items = node.hasAttribute(NG_ANIMATE_REF_ATTR)
              ? [node]
              : node.querySelectorAll(SELECTOR);
        var anchors = [];
        forEach(items, function(node) {
          var attr = node.getAttribute(NG_ANIMATE_REF_ATTR);
          if (attr && attr.length) {
            anchors.push(node);
          }
        });
        return anchors;
      }

      function groupAnimations(animations) {
        var preparedAnimations = [];
        var refLookup = {};
        forEach(animations, function(animation, index) {
          var element = animation.element;
          var node = getDomNode(element);
          var event = animation.event;
          var enterOrMove = ['enter', 'move'].indexOf(event) >= 0;
          var anchorNodes = animation.structural ? getAnchorNodes(node) : [];

          if (anchorNodes.length) {
            var direction = enterOrMove ? 'to' : 'from';

            forEach(anchorNodes, function(anchor) {
              var key = anchor.getAttribute(NG_ANIMATE_REF_ATTR);
              refLookup[key] = refLookup[key] || {};
              refLookup[key][direction] = {
                animationID: index,
                element: jqLite(anchor)
              };
            });
          } else {
            preparedAnimations.push(animation);
          }
        });

        var usedIndicesLookup = {};
        var anchorGroups = {};
        forEach(refLookup, function(operations, key) {
          var from = operations.from;
          var to = operations.to;

          if (!from || !to) {
            // only one of these is set therefore we can't have an
            // anchor animation since all three pieces are required
            var index = from ? from.animationID : to.animationID;
            var indexKey = index.toString();
            if (!usedIndicesLookup[indexKey]) {
              usedIndicesLookup[indexKey] = true;
              preparedAnimations.push(animations[index]);
            }
            return;
          }

          var fromAnimation = animations[from.animationID];
          var toAnimation = animations[to.animationID];
          var lookupKey = from.animationID.toString();
          if (!anchorGroups[lookupKey]) {
            var group = anchorGroups[lookupKey] = {
              structural: true,
              beforeStart: function() {
                fromAnimation.beforeStart();
                toAnimation.beforeStart();
              },
              close: function() {
                fromAnimation.close();
                toAnimation.close();
              },
              classes: cssClassesIntersection(fromAnimation.classes, toAnimation.classes),
              from: fromAnimation,
              to: toAnimation,
              anchors: [] // TODO(matsko): change to reference nodes
            };

            // the anchor animations require that the from and to elements both have at least
            // one shared CSS class which effectively marries the two elements together to use
            // the same animation driver and to properly sequence the anchor animation.
            if (group.classes.length) {
              preparedAnimations.push(group);
            } else {
              preparedAnimations.push(fromAnimation);
              preparedAnimations.push(toAnimation);
            }
          }

          anchorGroups[lookupKey].anchors.push({
            'out': from.element, 'in': to.element
          });
        });

        return preparedAnimations;
      }

      function cssClassesIntersection(a,b) {
        a = a.split(' ');
        b = b.split(' ');
        var matches = [];

        for (var i = 0; i < a.length; i++) {
          var aa = a[i];
          if (aa.substring(0,3) === 'ng-') continue;

          for (var j = 0; j < b.length; j++) {
            if (aa === b[j]) {
              matches.push(aa);
              break;
            }
          }
        }

        return matches.join(' ');
      }

      function invokeFirstDriver(animationDetails) {
        // we loop in reverse order since the more general drivers (like CSS and JS)
        // may attempt more elements, but custom drivers are more particular
        for (var i = drivers.length - 1; i >= 0; i--) {
          var driverName = drivers[i];
          var factory = $injector.get(driverName);
          var driver = factory(animationDetails);
          if (driver) {
            return driver;
          }
        }
      }

      function beforeStart() {
        element.addClass(NG_ANIMATE_CLASSNAME);
        if (tempClasses) {
          $$jqLite.addClass(element, tempClasses);
        }
        if (prepareClassName) {
          $$jqLite.removeClass(element, prepareClassName);
          prepareClassName = null;
        }
      }

      function updateAnimationRunners(animation, newRunner) {
        if (animation.from && animation.to) {
          update(animation.from.element);
          update(animation.to.element);
        } else {
          update(animation.element);
        }

        function update(element) {
          var runner = getRunner(element);
          if (runner) runner.setHost(newRunner);
        }
      }

      function handleDestroyedElement() {
        var runner = getRunner(element);
        if (runner && (event !== 'leave' || !options.$$domOperationFired)) {
          runner.end();
        }
      }

      function close(rejected) { // jshint ignore:line
        element.off('$destroy', handleDestroyedElement);
        removeRunner(element);

        applyAnimationClasses(element, options);
        applyAnimationStyles(element, options);
        options.domOperation();

        if (tempClasses) {
          $$jqLite.removeClass(element, tempClasses);
        }

        element.removeClass(NG_ANIMATE_CLASSNAME);
        runner.complete(!rejected);
      }
    };
  }];
}];

/**
 * @ngdoc directive
 * @name ngAnimateSwap
 * @restrict A
 * @scope
 *
 * @description
 *
 * ngAnimateSwap is a animation-oriented directive that allows for the container to
 * be removed and entered in whenever the associated expression changes. A
 * common usecase for this directive is a rotating banner or slider component which
 * contains one image being present at a time. When the active image changes
 * then the old image will perform a `leave` animation and the new element
 * will be inserted via an `enter` animation.
 *
 * @animations
 * | Animation                        | Occurs                               |
 * |----------------------------------|--------------------------------------|
 * | {@link ng.$animate#enter enter}  | when the new element is inserted to the DOM  |
 * | {@link ng.$animate#leave leave}  | when the old element is removed from the DOM |
 *
 * @example
 * <example name="ngAnimateSwap-directive" module="ngAnimateSwapExample"
 *          deps="angular-animate.js"
 *          animations="true" fixBase="true">
 *   <file name="index.html">
 *     <div class="container" ng-controller="AppCtrl">
 *       <div ng-animate-swap="number" class="cell swap-animation" ng-class="colorClass(number)">
 *         {{ number }}
 *       </div>
 *     </div>
 *   </file>
 *   <file name="script.js">
 *     angular.module('ngAnimateSwapExample', ['ngAnimate'])
 *       .controller('AppCtrl', ['$scope', '$interval', function($scope, $interval) {
 *         $scope.number = 0;
 *         $interval(function() {
 *           $scope.number++;
 *         }, 1000);
 *
 *         var colors = ['red','blue','green','yellow','orange'];
 *         $scope.colorClass = function(number) {
 *           return colors[number % colors.length];
 *         };
 *       }]);
 *   </file>
 *  <file name="animations.css">
 *  .container {
 *    height:250px;
 *    width:250px;
 *    position:relative;
 *    overflow:hidden;
 *    border:2px solid black;
 *  }
 *  .container .cell {
 *    font-size:150px;
 *    text-align:center;
 *    line-height:250px;
 *    position:absolute;
 *    top:0;
 *    left:0;
 *    right:0;
 *    border-bottom:2px solid black;
 *  }
 *  .swap-animation.ng-enter, .swap-animation.ng-leave {
 *    transition:0.5s linear all;
 *  }
 *  .swap-animation.ng-enter {
 *    top:-250px;
 *  }
 *  .swap-animation.ng-enter-active {
 *    top:0px;
 *  }
 *  .swap-animation.ng-leave {
 *    top:0px;
 *  }
 *  .swap-animation.ng-leave-active {
 *    top:250px;
 *  }
 *  .red { background:red; }
 *  .green { background:green; }
 *  .blue { background:blue; }
 *  .yellow { background:yellow; }
 *  .orange { background:orange; }
 *  </file>
 * </example>
 */
var ngAnimateSwapDirective = ['$animate', '$rootScope', function($animate, $rootScope) {
  return {
    restrict: 'A',
    transclude: 'element',
    terminal: true,
    priority: 600, // we use 600 here to ensure that the directive is caught before others
    link: function(scope, $element, attrs, ctrl, $transclude) {
      var previousElement, previousScope;
      scope.$watchCollection(attrs.ngAnimateSwap || attrs['for'], function(value) {
        if (previousElement) {
          $animate.leave(previousElement);
        }
        if (previousScope) {
          previousScope.$destroy();
          previousScope = null;
        }
        if (value || value === 0) {
          previousScope = scope.$new();
          $transclude(previousScope, function(element) {
            previousElement = element;
            $animate.enter(element, null, $element);
          });
        }
      });
    }
  };
}];

/**
 * @ngdoc module
 * @name ngAnimate
 * @description
 *
 * The `ngAnimate` module provides support for CSS-based animations (keyframes and transitions) as well as JavaScript-based animations via
 * callback hooks. Animations are not enabled by default, however, by including `ngAnimate` the animation hooks are enabled for an Angular app.
 *
 * <div doc-module-components="ngAnimate"></div>
 *
 * # Usage
 * Simply put, there are two ways to make use of animations when ngAnimate is used: by using **CSS** and **JavaScript**. The former works purely based
 * using CSS (by using matching CSS selectors/styles) and the latter triggers animations that are registered via `module.animation()`. For
 * both CSS and JS animations the sole requirement is to have a matching `CSS class` that exists both in the registered animation and within
 * the HTML element that the animation will be triggered on.
 *
 * ## Directive Support
 * The following directives are "animation aware":
 *
 * | Directive                                                                                                | Supported Animations                                                     |
 * |----------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------|
 * | {@link ng.directive:ngRepeat#animations ngRepeat}                                                        | enter, leave and move                                                    |
 * | {@link ngRoute.directive:ngView#animations ngView}                                                       | enter and leave                                                          |
 * | {@link ng.directive:ngInclude#animations ngInclude}                                                      | enter and leave                                                          |
 * | {@link ng.directive:ngSwitch#animations ngSwitch}                                                        | enter and leave                                                          |
 * | {@link ng.directive:ngIf#animations ngIf}                                                                | enter and leave                                                          |
 * | {@link ng.directive:ngClass#animations ngClass}                                                          | add and remove (the CSS class(es) present)                               |
 * | {@link ng.directive:ngShow#animations ngShow} & {@link ng.directive:ngHide#animations ngHide}            | add and remove (the ng-hide class value)                                 |
 * | {@link ng.directive:form#animation-hooks form} & {@link ng.directive:ngModel#animation-hooks ngModel}    | add and remove (dirty, pristine, valid, invalid & all other validations) |
 * | {@link module:ngMessages#animations ngMessages}                                                          | add and remove (ng-active & ng-inactive)                                 |
 * | {@link module:ngMessages#animations ngMessage}                                                           | enter and leave                                                          |
 *
 * (More information can be found by visiting each the documentation associated with each directive.)
 *
 * ## CSS-based Animations
 *
 * CSS-based animations with ngAnimate are unique since they require no JavaScript code at all. By using a CSS class that we reference between our HTML
 * and CSS code we can create an animation that will be picked up by Angular when an the underlying directive performs an operation.
 *
 * The example below shows how an `enter` animation can be made possible on an element using `ng-if`:
 *
 * ```html
 * <div ng-if="bool" class="fade">
 *    Fade me in out
 * </div>
 * <button ng-click="bool=true">Fade In!</button>
 * <button ng-click="bool=false">Fade Out!</button>
 * ```
 *
 * Notice the CSS class **fade**? We can now create the CSS transition code that references this class:
 *
 * ```css
 * /&#42; The starting CSS styles for the enter animation &#42;/
 * .fade.ng-enter {
 *   transition:0.5s linear all;
 *   opacity:0;
 * }
 *
 * /&#42; The finishing CSS styles for the enter animation &#42;/
 * .fade.ng-enter.ng-enter-active {
 *   opacity:1;
 * }
 * ```
 *
 * The key thing to remember here is that, depending on the animation event (which each of the directives above trigger depending on what's going on) two
 * generated CSS classes will be applied to the element; in the example above we have `.ng-enter` and `.ng-enter-active`. For CSS transitions, the transition
 * code **must** be defined within the starting CSS class (in this case `.ng-enter`). The destination class is what the transition will animate towards.
 *
 * If for example we wanted to create animations for `leave` and `move` (ngRepeat triggers move) then we can do so using the same CSS naming conventions:
 *
 * ```css
 * /&#42; now the element will fade out before it is removed from the DOM &#42;/
 * .fade.ng-leave {
 *   transition:0.5s linear all;
 *   opacity:1;
 * }
 * .fade.ng-leave.ng-leave-active {
 *   opacity:0;
 * }
 * ```
 *
 * We can also make use of **CSS Keyframes** by referencing the keyframe animation within the starting CSS class:
 *
 * ```css
 * /&#42; there is no need to define anything inside of the destination
 * CSS class since the keyframe will take charge of the animation &#42;/
 * .fade.ng-leave {
 *   animation: my_fade_animation 0.5s linear;
 *   -webkit-animation: my_fade_animation 0.5s linear;
 * }
 *
 * @keyframes my_fade_animation {
 *   from { opacity:1; }
 *   to { opacity:0; }
 * }
 *
 * @-webkit-keyframes my_fade_animation {
 *   from { opacity:1; }
 *   to { opacity:0; }
 * }
 * ```
 *
 * Feel free also mix transitions and keyframes together as well as any other CSS classes on the same element.
 *
 * ### CSS Class-based Animations
 *
 * Class-based animations (animations that are triggered via `ngClass`, `ngShow`, `ngHide` and some other directives) have a slightly different
 * naming convention. Class-based animations are basic enough that a standard transition or keyframe can be referenced on the class being added
 * and removed.
 *
 * For example if we wanted to do a CSS animation for `ngHide` then we place an animation on the `.ng-hide` CSS class:
 *
 * ```html
 * <div ng-show="bool" class="fade">
 *   Show and hide me
 * </div>
 * <button ng-click="bool=!bool">Toggle</button>
 *
 * <style>
 * .fade.ng-hide {
 *   transition:0.5s linear all;
 *   opacity:0;
 * }
 * </style>
 * ```
 *
 * All that is going on here with ngShow/ngHide behind the scenes is the `.ng-hide` class is added/removed (when the hidden state is valid). Since
 * ngShow and ngHide are animation aware then we can match up a transition and ngAnimate handles the rest.
 *
 * In addition the addition and removal of the CSS class, ngAnimate also provides two helper methods that we can use to further decorate the animation
 * with CSS styles.
 *
 * ```html
 * <div ng-class="{on:onOff}" class="highlight">
 *   Highlight this box
 * </div>
 * <button ng-click="onOff=!onOff">Toggle</button>
 *
 * <style>
 * .highlight {
 *   transition:0.5s linear all;
 * }
 * .highlight.on-add {
 *   background:white;
 * }
 * .highlight.on {
 *   background:yellow;
 * }
 * .highlight.on-remove {
 *   background:black;
 * }
 * </style>
 * ```
 *
 * We can also make use of CSS keyframes by placing them within the CSS classes.
 *
 *
 * ### CSS Staggering Animations
 * A Staggering animation is a collection of animations that are issued with a slight delay in between each successive operation resulting in a
 * curtain-like effect. The ngAnimate module (versions >=1.2) supports staggering animations and the stagger effect can be
 * performed by creating a **ng-EVENT-stagger** CSS class and attaching that class to the base CSS class used for
 * the animation. The style property expected within the stagger class can either be a **transition-delay** or an
 * **animation-delay** property (or both if your animation contains both transitions and keyframe animations).
 *
 * ```css
 * .my-animation.ng-enter {
 *   /&#42; standard transition code &#42;/
 *   transition: 1s linear all;
 *   opacity:0;
 * }
 * .my-animation.ng-enter-stagger {
 *   /&#42; this will have a 100ms delay between each successive leave animation &#42;/
 *   transition-delay: 0.1s;
 *
 *   /&#42; As of 1.4.4, this must always be set: it signals ngAnimate
 *     to not accidentally inherit a delay property from another CSS class &#42;/
 *   transition-duration: 0s;
 * }
 * .my-animation.ng-enter.ng-enter-active {
 *   /&#42; standard transition styles &#42;/
 *   opacity:1;
 * }
 * ```
 *
 * Staggering animations work by default in ngRepeat (so long as the CSS class is defined). Outside of ngRepeat, to use staggering animations
 * on your own, they can be triggered by firing multiple calls to the same event on $animate. However, the restrictions surrounding this
 * are that each of the elements must have the same CSS className value as well as the same parent element. A stagger operation
 * will also be reset if one or more animation frames have passed since the multiple calls to `$animate` were fired.
 *
 * The following code will issue the **ng-leave-stagger** event on the element provided:
 *
 * ```js
 * var kids = parent.children();
 *
 * $animate.leave(kids[0]); //stagger index=0
 * $animate.leave(kids[1]); //stagger index=1
 * $animate.leave(kids[2]); //stagger index=2
 * $animate.leave(kids[3]); //stagger index=3
 * $animate.leave(kids[4]); //stagger index=4
 *
 * window.requestAnimationFrame(function() {
 *   //stagger has reset itself
 *   $animate.leave(kids[5]); //stagger index=0
 *   $animate.leave(kids[6]); //stagger index=1
 *
 *   $scope.$digest();
 * });
 * ```
 *
 * Stagger animations are currently only supported within CSS-defined animations.
 *
 * ### The `ng-animate` CSS class
 *
 * When ngAnimate is animating an element it will apply the `ng-animate` CSS class to the element for the duration of the animation.
 * This is a temporary CSS class and it will be removed once the animation is over (for both JavaScript and CSS-based animations).
 *
 * Therefore, animations can be applied to an element using this temporary class directly via CSS.
 *
 * ```css
 * .zipper.ng-animate {
 *   transition:0.5s linear all;
 * }
 * .zipper.ng-enter {
 *   opacity:0;
 * }
 * .zipper.ng-enter.ng-enter-active {
 *   opacity:1;
 * }
 * .zipper.ng-leave {
 *   opacity:1;
 * }
 * .zipper.ng-leave.ng-leave-active {
 *   opacity:0;
 * }
 * ```
 *
 * (Note that the `ng-animate` CSS class is reserved and it cannot be applied on an element directly since ngAnimate will always remove
 * the CSS class once an animation has completed.)
 *
 *
 * ### The `ng-[event]-prepare` class
 *
 * This is a special class that can be used to prevent unwanted flickering / flash of content before
 * the actual animation starts. The class is added as soon as an animation is initialized, but removed
 * before the actual animation starts (after waiting for a $digest).
 * It is also only added for *structural* animations (`enter`, `move`, and `leave`).
 *
 * In practice, flickering can appear when nesting elements with structural animations such as `ngIf`
 * into elements that have class-based animations such as `ngClass`.
 *
 * ```html
 * <div ng-class="{red: myProp}">
 *   <div ng-class="{blue: myProp}">
 *     <div class="message" ng-if="myProp"></div>
 *   </div>
 * </div>
 * ```
 *
 * It is possible that during the `enter` animation, the `.message` div will be briefly visible before it starts animating.
 * In that case, you can add styles to the CSS that make sure the element stays hidden before the animation starts:
 *
 * ```css
 * .message.ng-enter-prepare {
 *   opacity: 0;
 * }
 *
 * ```
 *
 * ## JavaScript-based Animations
 *
 * ngAnimate also allows for animations to be consumed by JavaScript code. The approach is similar to CSS-based animations (where there is a shared
 * CSS class that is referenced in our HTML code) but in addition we need to register the JavaScript animation on the module. By making use of the
 * `module.animation()` module function we can register the animation.
 *
 * Let's see an example of a enter/leave animation using `ngRepeat`:
 *
 * ```html
 * <div ng-repeat="item in items" class="slide">
 *   {{ item }}
 * </div>
 * ```
 *
 * See the **slide** CSS class? Let's use that class to define an animation that we'll structure in our module code by using `module.animation`:
 *
 * ```js
 * myModule.animation('.slide', [function() {
 *   return {
 *     // make note that other events (like addClass/removeClass)
 *     // have different function input parameters
 *     enter: function(element, doneFn) {
 *       jQuery(element).fadeIn(1000, doneFn);
 *
 *       // remember to call doneFn so that angular
 *       // knows that the animation has concluded
 *     },
 *
 *     move: function(element, doneFn) {
 *       jQuery(element).fadeIn(1000, doneFn);
 *     },
 *
 *     leave: function(element, doneFn) {
 *       jQuery(element).fadeOut(1000, doneFn);
 *     }
 *   }
 * }]);
 * ```
 *
 * The nice thing about JS-based animations is that we can inject other services and make use of advanced animation libraries such as
 * greensock.js and velocity.js.
 *
 * If our animation code class-based (meaning that something like `ngClass`, `ngHide` and `ngShow` triggers it) then we can still define
 * our animations inside of the same registered animation, however, the function input arguments are a bit different:
 *
 * ```html
 * <div ng-class="color" class="colorful">
 *   this box is moody
 * </div>
 * <button ng-click="color='red'">Change to red</button>
 * <button ng-click="color='blue'">Change to blue</button>
 * <button ng-click="color='green'">Change to green</button>
 * ```
 *
 * ```js
 * myModule.animation('.colorful', [function() {
 *   return {
 *     addClass: function(element, className, doneFn) {
 *       // do some cool animation and call the doneFn
 *     },
 *     removeClass: function(element, className, doneFn) {
 *       // do some cool animation and call the doneFn
 *     },
 *     setClass: function(element, addedClass, removedClass, doneFn) {
 *       // do some cool animation and call the doneFn
 *     }
 *   }
 * }]);
 * ```
 *
 * ## CSS + JS Animations Together
 *
 * AngularJS 1.4 and higher has taken steps to make the amalgamation of CSS and JS animations more flexible. However, unlike earlier versions of Angular,
 * defining CSS and JS animations to work off of the same CSS class will not work anymore. Therefore the example below will only result in **JS animations taking
 * charge of the animation**:
 *
 * ```html
 * <div ng-if="bool" class="slide">
 *   Slide in and out
 * </div>
 * ```
 *
 * ```js
 * myModule.animation('.slide', [function() {
 *   return {
 *     enter: function(element, doneFn) {
 *       jQuery(element).slideIn(1000, doneFn);
 *     }
 *   }
 * }]);
 * ```
 *
 * ```css
 * .slide.ng-enter {
 *   transition:0.5s linear all;
 *   transform:translateY(-100px);
 * }
 * .slide.ng-enter.ng-enter-active {
 *   transform:translateY(0);
 * }
 * ```
 *
 * Does this mean that CSS and JS animations cannot be used together? Do JS-based animations always have higher priority? We can make up for the
 * lack of CSS animations by using the `$animateCss` service to trigger our own tweaked-out, CSS-based animations directly from
 * our own JS-based animation code:
 *
 * ```js
 * myModule.animation('.slide', ['$animateCss', function($animateCss) {
 *   return {
 *     enter: function(element) {
*        // this will trigger `.slide.ng-enter` and `.slide.ng-enter-active`.
 *       return $animateCss(element, {
 *         event: 'enter',
 *         structural: true
 *       });
 *     }
 *   }
 * }]);
 * ```
 *
 * The nice thing here is that we can save bandwidth by sticking to our CSS-based animation code and we don't need to rely on a 3rd-party animation framework.
 *
 * The `$animateCss` service is very powerful since we can feed in all kinds of extra properties that will be evaluated and fed into a CSS transition or
 * keyframe animation. For example if we wanted to animate the height of an element while adding and removing classes then we can do so by providing that
 * data into `$animateCss` directly:
 *
 * ```js
 * myModule.animation('.slide', ['$animateCss', function($animateCss) {
 *   return {
 *     enter: function(element) {
 *       return $animateCss(element, {
 *         event: 'enter',
 *         structural: true,
 *         addClass: 'maroon-setting',
 *         from: { height:0 },
 *         to: { height: 200 }
 *       });
 *     }
 *   }
 * }]);
 * ```
 *
 * Now we can fill in the rest via our transition CSS code:
 *
 * ```css
 * /&#42; the transition tells ngAnimate to make the animation happen &#42;/
 * .slide.ng-enter { transition:0.5s linear all; }
 *
 * /&#42; this extra CSS class will be absorbed into the transition
 * since the $animateCss code is adding the class &#42;/
 * .maroon-setting { background:red; }
 * ```
 *
 * And `$animateCss` will figure out the rest. Just make sure to have the `done()` callback fire the `doneFn` function to signal when the animation is over.
 *
 * To learn more about what's possible be sure to visit the {@link ngAnimate.$animateCss $animateCss service}.
 *
 * ## Animation Anchoring (via `ng-animate-ref`)
 *
 * ngAnimate in AngularJS 1.4 comes packed with the ability to cross-animate elements between
 * structural areas of an application (like views) by pairing up elements using an attribute
 * called `ng-animate-ref`.
 *
 * Let's say for example we have two views that are managed by `ng-view` and we want to show
 * that there is a relationship between two components situated in within these views. By using the
 * `ng-animate-ref` attribute we can identify that the two components are paired together and we
 * can then attach an animation, which is triggered when the view changes.
 *
 * Say for example we have the following template code:
 *
 * ```html
 * <!-- index.html -->
 * <div ng-view class="view-animation">
 * </div>
 *
 * <!-- home.html -->
 * <a href="#/banner-page">
 *   <img src="./banner.jpg" class="banner" ng-animate-ref="banner">
 * </a>
 *
 * <!-- banner-page.html -->
 * <img src="./banner.jpg" class="banner" ng-animate-ref="banner">
 * ```
 *
 * Now, when the view changes (once the link is clicked), ngAnimate will examine the
 * HTML contents to see if there is a match reference between any components in the view
 * that is leaving and the view that is entering. It will scan both the view which is being
 * removed (leave) and inserted (enter) to see if there are any paired DOM elements that
 * contain a matching ref value.
 *
 * The two images match since they share the same ref value. ngAnimate will now create a
 * transport element (which is a clone of the first image element) and it will then attempt
 * to animate to the position of the second image element in the next view. For the animation to
 * work a special CSS class called `ng-anchor` will be added to the transported element.
 *
 * We can now attach a transition onto the `.banner.ng-anchor` CSS class and then
 * ngAnimate will handle the entire transition for us as well as the addition and removal of
 * any changes of CSS classes between the elements:
 *
 * ```css
 * .banner.ng-anchor {
 *   /&#42; this animation will last for 1 second since there are
 *          two phases to the animation (an `in` and an `out` phase) &#42;/
 *   transition:0.5s linear all;
 * }
 * ```
 *
 * We also **must** include animations for the views that are being entered and removed
 * (otherwise anchoring wouldn't be possible since the new view would be inserted right away).
 *
 * ```css
 * .view-animation.ng-enter, .view-animation.ng-leave {
 *   transition:0.5s linear all;
 *   position:fixed;
 *   left:0;
 *   top:0;
 *   width:100%;
 * }
 * .view-animation.ng-enter {
 *   transform:translateX(100%);
 * }
 * .view-animation.ng-leave,
 * .view-animation.ng-enter.ng-enter-active {
 *   transform:translateX(0%);
 * }
 * .view-animation.ng-leave.ng-leave-active {
 *   transform:translateX(-100%);
 * }
 * ```
 *
 * Now we can jump back to the anchor animation. When the animation happens, there are two stages that occur:
 * an `out` and an `in` stage. The `out` stage happens first and that is when the element is animated away
 * from its origin. Once that animation is over then the `in` stage occurs which animates the
 * element to its destination. The reason why there are two animations is to give enough time
 * for the enter animation on the new element to be ready.
 *
 * The example above sets up a transition for both the in and out phases, but we can also target the out or
 * in phases directly via `ng-anchor-out` and `ng-anchor-in`.
 *
 * ```css
 * .banner.ng-anchor-out {
 *   transition: 0.5s linear all;
 *
 *   /&#42; the scale will be applied during the out animation,
 *          but will be animated away when the in animation runs &#42;/
 *   transform: scale(1.2);
 * }
 *
 * .banner.ng-anchor-in {
 *   transition: 1s linear all;
 * }
 * ```
 *
 *
 *
 *
 * ### Anchoring Demo
 *
  <example module="anchoringExample"
           name="anchoringExample"
           id="anchoringExample"
           deps="angular-animate.js;angular-route.js"
           animations="true">
    <file name="index.html">
      <a href="#/">Home</a>
      <hr />
      <div class="view-container">
        <div ng-view class="view"></div>
      </div>
    </file>
    <file name="script.js">
      angular.module('anchoringExample', ['ngAnimate', 'ngRoute'])
        .config(['$routeProvider', function($routeProvider) {
          $routeProvider.when('/', {
            templateUrl: 'home.html',
            controller: 'HomeController as home'
          });
          $routeProvider.when('/profile/:id', {
            templateUrl: 'profile.html',
            controller: 'ProfileController as profile'
          });
        }])
        .run(['$rootScope', function($rootScope) {
          $rootScope.records = [
            { id:1, title: "Miss Beulah Roob" },
            { id:2, title: "Trent Morissette" },
            { id:3, title: "Miss Ava Pouros" },
            { id:4, title: "Rod Pouros" },
            { id:5, title: "Abdul Rice" },
            { id:6, title: "Laurie Rutherford Sr." },
            { id:7, title: "Nakia McLaughlin" },
            { id:8, title: "Jordon Blanda DVM" },
            { id:9, title: "Rhoda Hand" },
            { id:10, title: "Alexandrea Sauer" }
          ];
        }])
        .controller('HomeController', [function() {
          //empty
        }])
        .controller('ProfileController', ['$rootScope', '$routeParams', function($rootScope, $routeParams) {
          var index = parseInt($routeParams.id, 10);
          var record = $rootScope.records[index - 1];

          this.title = record.title;
          this.id = record.id;
        }]);
    </file>
    <file name="home.html">
      <h2>Welcome to the home page</h1>
      <p>Please click on an element</p>
      <a class="record"
         ng-href="#/profile/{{ record.id }}"
         ng-animate-ref="{{ record.id }}"
         ng-repeat="record in records">
        {{ record.title }}
      </a>
    </file>
    <file name="profile.html">
      <div class="profile record" ng-animate-ref="{{ profile.id }}">
        {{ profile.title }}
      </div>
    </file>
    <file name="animations.css">
      .record {
        display:block;
        font-size:20px;
      }
      .profile {
        background:black;
        color:white;
        font-size:100px;
      }
      .view-container {
        position:relative;
      }
      .view-container > .view.ng-animate {
        position:absolute;
        top:0;
        left:0;
        width:100%;
        min-height:500px;
      }
      .view.ng-enter, .view.ng-leave,
      .record.ng-anchor {
        transition:0.5s linear all;
      }
      .view.ng-enter {
        transform:translateX(100%);
      }
      .view.ng-enter.ng-enter-active, .view.ng-leave {
        transform:translateX(0%);
      }
      .view.ng-leave.ng-leave-active {
        transform:translateX(-100%);
      }
      .record.ng-anchor-out {
        background:red;
      }
    </file>
  </example>
 *
 * ### How is the element transported?
 *
 * When an anchor animation occurs, ngAnimate will clone the starting element and position it exactly where the starting
 * element is located on screen via absolute positioning. The cloned element will be placed inside of the root element
 * of the application (where ng-app was defined) and all of the CSS classes of the starting element will be applied. The
 * element will then animate into the `out` and `in` animations and will eventually reach the coordinates and match
 * the dimensions of the destination element. During the entire animation a CSS class of `.ng-animate-shim` will be applied
 * to both the starting and destination elements in order to hide them from being visible (the CSS styling for the class
 * is: `visibility:hidden`). Once the anchor reaches its destination then it will be removed and the destination element
 * will become visible since the shim class will be removed.
 *
 * ### How is the morphing handled?
 *
 * CSS Anchoring relies on transitions and keyframes and the internal code is intelligent enough to figure out
 * what CSS classes differ between the starting element and the destination element. These different CSS classes
 * will be added/removed on the anchor element and a transition will be applied (the transition that is provided
 * in the anchor class). Long story short, ngAnimate will figure out what classes to add and remove which will
 * make the transition of the element as smooth and automatic as possible. Be sure to use simple CSS classes that
 * do not rely on DOM nesting structure so that the anchor element appears the same as the starting element (since
 * the cloned element is placed inside of root element which is likely close to the body element).
 *
 * Note that if the root element is on the `<html>` element then the cloned node will be placed inside of body.
 *
 *
 * ## Using $animate in your directive code
 *
 * So far we've explored how to feed in animations into an Angular application, but how do we trigger animations within our own directives in our application?
 * By injecting the `$animate` service into our directive code, we can trigger structural and class-based hooks which can then be consumed by animations. Let's
 * imagine we have a greeting box that shows and hides itself when the data changes
 *
 * ```html
 * <greeting-box active="onOrOff">Hi there</greeting-box>
 * ```
 *
 * ```js
 * ngModule.directive('greetingBox', ['$animate', function($animate) {
 *   return function(scope, element, attrs) {
 *     attrs.$observe('active', function(value) {
 *       value ? $animate.addClass(element, 'on') : $animate.removeClass(element, 'on');
 *     });
 *   });
 * }]);
 * ```
 *
 * Now the `on` CSS class is added and removed on the greeting box component. Now if we add a CSS class on top of the greeting box element
 * in our HTML code then we can trigger a CSS or JS animation to happen.
 *
 * ```css
 * /&#42; normally we would create a CSS class to reference on the element &#42;/
 * greeting-box.on { transition:0.5s linear all; background:green; color:white; }
 * ```
 *
 * The `$animate` service contains a variety of other methods like `enter`, `leave`, `animate` and `setClass`. To learn more about what's
 * possible be sure to visit the {@link ng.$animate $animate service API page}.
 *
 *
 * ## Callbacks and Promises
 *
 * When `$animate` is called it returns a promise that can be used to capture when the animation has ended. Therefore if we were to trigger
 * an animation (within our directive code) then we can continue performing directive and scope related activities after the animation has
 * ended by chaining onto the returned promise that animation method returns.
 *
 * ```js
 * // somewhere within the depths of the directive
 * $animate.enter(element, parent).then(function() {
 *   //the animation has completed
 * });
 * ```
 *
 * (Note that earlier versions of Angular prior to v1.4 required the promise code to be wrapped using `$scope.$apply(...)`. This is not the case
 * anymore.)
 *
 * In addition to the animation promise, we can also make use of animation-related callbacks within our directives and controller code by registering
 * an event listener using the `$animate` service. Let's say for example that an animation was triggered on our view
 * routing controller to hook into that:
 *
 * ```js
 * ngModule.controller('HomePageController', ['$animate', function($animate) {
 *   $animate.on('enter', ngViewElement, function(element) {
 *     // the animation for this route has completed
 *   }]);
 * }])
 * ```
 *
 * (Note that you will need to trigger a digest within the callback to get angular to notice any scope-related changes.)
 */

var copy;
var extend;
var forEach;
var isArray;
var isDefined;
var isElement;
var isFunction;
var isObject;
var isString;
var isUndefined;
var jqLite;
var noop;

/**
 * @ngdoc service
 * @name $animate
 * @kind object
 *
 * @description
 * The ngAnimate `$animate` service documentation is the same for the core `$animate` service.
 *
 * Click here {@link ng.$animate to learn more about animations with `$animate`}.
 */
angular.module('ngAnimate', [], function initAngularHelpers() {
  // Access helpers from angular core.
  // Do it inside a `config` block to ensure `window.angular` is available.
  noop        = angular.noop;
  copy        = angular.copy;
  extend      = angular.extend;
  jqLite      = angular.element;
  forEach     = angular.forEach;
  isArray     = angular.isArray;
  isString    = angular.isString;
  isObject    = angular.isObject;
  isUndefined = angular.isUndefined;
  isDefined   = angular.isDefined;
  isFunction  = angular.isFunction;
  isElement   = angular.isElement;
})
  .directive('ngAnimateSwap', ngAnimateSwapDirective)

  .directive('ngAnimateChildren', $$AnimateChildrenDirective)
  .factory('$$rAFScheduler', $$rAFSchedulerFactory)

  .provider('$$animateQueue', $$AnimateQueueProvider)
  .provider('$$animation', $$AnimationProvider)

  .provider('$animateCss', $AnimateCssProvider)
  .provider('$$animateCssDriver', $$AnimateCssDriverProvider)

  .provider('$$animateJs', $$AnimateJsProvider)
  .provider('$$animateJsDriver', $$AnimateJsDriverProvider);


})(window, window.angular);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJhbmd1bGFyLWFuaW1hdGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIEBsaWNlbnNlIEFuZ3VsYXJKUyB2MS41LjhcclxuICogKGMpIDIwMTAtMjAxNiBHb29nbGUsIEluYy4gaHR0cDovL2FuZ3VsYXJqcy5vcmdcclxuICogTGljZW5zZTogTUlUXHJcbiAqL1xyXG4oZnVuY3Rpb24od2luZG93LCBhbmd1bGFyKSB7J3VzZSBzdHJpY3QnO1xyXG5cclxudmFyIEVMRU1FTlRfTk9ERSA9IDE7XHJcbnZhciBDT01NRU5UX05PREUgPSA4O1xyXG5cclxudmFyIEFERF9DTEFTU19TVUZGSVggPSAnLWFkZCc7XHJcbnZhciBSRU1PVkVfQ0xBU1NfU1VGRklYID0gJy1yZW1vdmUnO1xyXG52YXIgRVZFTlRfQ0xBU1NfUFJFRklYID0gJ25nLSc7XHJcbnZhciBBQ1RJVkVfQ0xBU1NfU1VGRklYID0gJy1hY3RpdmUnO1xyXG52YXIgUFJFUEFSRV9DTEFTU19TVUZGSVggPSAnLXByZXBhcmUnO1xyXG5cclxudmFyIE5HX0FOSU1BVEVfQ0xBU1NOQU1FID0gJ25nLWFuaW1hdGUnO1xyXG52YXIgTkdfQU5JTUFURV9DSElMRFJFTl9EQVRBID0gJyQkbmdBbmltYXRlQ2hpbGRyZW4nO1xyXG5cclxuLy8gRGV0ZWN0IHByb3BlciB0cmFuc2l0aW9uZW5kL2FuaW1hdGlvbmVuZCBldmVudCBuYW1lcy5cclxudmFyIENTU19QUkVGSVggPSAnJywgVFJBTlNJVElPTl9QUk9QLCBUUkFOU0lUSU9ORU5EX0VWRU5ULCBBTklNQVRJT05fUFJPUCwgQU5JTUFUSU9ORU5EX0VWRU5UO1xyXG5cclxuLy8gSWYgdW5wcmVmaXhlZCBldmVudHMgYXJlIG5vdCBzdXBwb3J0ZWQgYnV0IHdlYmtpdC1wcmVmaXhlZCBhcmUsIHVzZSB0aGUgbGF0dGVyLlxyXG4vLyBPdGhlcndpc2UsIGp1c3QgdXNlIFczQyBuYW1lcywgYnJvd3NlcnMgbm90IHN1cHBvcnRpbmcgdGhlbSBhdCBhbGwgd2lsbCBqdXN0IGlnbm9yZSB0aGVtLlxyXG4vLyBOb3RlOiBDaHJvbWUgaW1wbGVtZW50cyBgd2luZG93Lm9ud2Via2l0YW5pbWF0aW9uZW5kYCBhbmQgZG9lc24ndCBpbXBsZW1lbnQgYHdpbmRvdy5vbmFuaW1hdGlvbmVuZGBcclxuLy8gYnV0IGF0IHRoZSBzYW1lIHRpbWUgZGlzcGF0Y2hlcyB0aGUgYGFuaW1hdGlvbmVuZGAgZXZlbnQgYW5kIG5vdCBgd2Via2l0QW5pbWF0aW9uRW5kYC5cclxuLy8gUmVnaXN0ZXIgYm90aCBldmVudHMgaW4gY2FzZSBgd2luZG93Lm9uYW5pbWF0aW9uZW5kYCBpcyBub3Qgc3VwcG9ydGVkIGJlY2F1c2Ugb2YgdGhhdCxcclxuLy8gZG8gdGhlIHNhbWUgZm9yIGB0cmFuc2l0aW9uZW5kYCBhcyBTYWZhcmkgaXMgbGlrZWx5IHRvIGV4aGliaXQgc2ltaWxhciBiZWhhdmlvci5cclxuLy8gQWxzbywgdGhlIG9ubHkgbW9kZXJuIGJyb3dzZXIgdGhhdCB1c2VzIHZlbmRvciBwcmVmaXhlcyBmb3IgdHJhbnNpdGlvbnMva2V5ZnJhbWVzIGlzIHdlYmtpdFxyXG4vLyB0aGVyZWZvcmUgdGhlcmUgaXMgbm8gcmVhc29uIHRvIHRlc3QgYW55bW9yZSBmb3Igb3RoZXIgdmVuZG9yIHByZWZpeGVzOlxyXG4vLyBodHRwOi8vY2FuaXVzZS5jb20vI3NlYXJjaD10cmFuc2l0aW9uXHJcbmlmICgod2luZG93Lm9udHJhbnNpdGlvbmVuZCA9PT0gdm9pZCAwKSAmJiAod2luZG93Lm9ud2Via2l0dHJhbnNpdGlvbmVuZCAhPT0gdm9pZCAwKSkge1xyXG4gIENTU19QUkVGSVggPSAnLXdlYmtpdC0nO1xyXG4gIFRSQU5TSVRJT05fUFJPUCA9ICdXZWJraXRUcmFuc2l0aW9uJztcclxuICBUUkFOU0lUSU9ORU5EX0VWRU5UID0gJ3dlYmtpdFRyYW5zaXRpb25FbmQgdHJhbnNpdGlvbmVuZCc7XHJcbn0gZWxzZSB7XHJcbiAgVFJBTlNJVElPTl9QUk9QID0gJ3RyYW5zaXRpb24nO1xyXG4gIFRSQU5TSVRJT05FTkRfRVZFTlQgPSAndHJhbnNpdGlvbmVuZCc7XHJcbn1cclxuXHJcbmlmICgod2luZG93Lm9uYW5pbWF0aW9uZW5kID09PSB2b2lkIDApICYmICh3aW5kb3cub253ZWJraXRhbmltYXRpb25lbmQgIT09IHZvaWQgMCkpIHtcclxuICBDU1NfUFJFRklYID0gJy13ZWJraXQtJztcclxuICBBTklNQVRJT05fUFJPUCA9ICdXZWJraXRBbmltYXRpb24nO1xyXG4gIEFOSU1BVElPTkVORF9FVkVOVCA9ICd3ZWJraXRBbmltYXRpb25FbmQgYW5pbWF0aW9uZW5kJztcclxufSBlbHNlIHtcclxuICBBTklNQVRJT05fUFJPUCA9ICdhbmltYXRpb24nO1xyXG4gIEFOSU1BVElPTkVORF9FVkVOVCA9ICdhbmltYXRpb25lbmQnO1xyXG59XHJcblxyXG52YXIgRFVSQVRJT05fS0VZID0gJ0R1cmF0aW9uJztcclxudmFyIFBST1BFUlRZX0tFWSA9ICdQcm9wZXJ0eSc7XHJcbnZhciBERUxBWV9LRVkgPSAnRGVsYXknO1xyXG52YXIgVElNSU5HX0tFWSA9ICdUaW1pbmdGdW5jdGlvbic7XHJcbnZhciBBTklNQVRJT05fSVRFUkFUSU9OX0NPVU5UX0tFWSA9ICdJdGVyYXRpb25Db3VudCc7XHJcbnZhciBBTklNQVRJT05fUExBWVNUQVRFX0tFWSA9ICdQbGF5U3RhdGUnO1xyXG52YXIgU0FGRV9GQVNUX0ZPUldBUkRfRFVSQVRJT05fVkFMVUUgPSA5OTk5O1xyXG5cclxudmFyIEFOSU1BVElPTl9ERUxBWV9QUk9QID0gQU5JTUFUSU9OX1BST1AgKyBERUxBWV9LRVk7XHJcbnZhciBBTklNQVRJT05fRFVSQVRJT05fUFJPUCA9IEFOSU1BVElPTl9QUk9QICsgRFVSQVRJT05fS0VZO1xyXG52YXIgVFJBTlNJVElPTl9ERUxBWV9QUk9QID0gVFJBTlNJVElPTl9QUk9QICsgREVMQVlfS0VZO1xyXG52YXIgVFJBTlNJVElPTl9EVVJBVElPTl9QUk9QID0gVFJBTlNJVElPTl9QUk9QICsgRFVSQVRJT05fS0VZO1xyXG5cclxudmFyIG5nTWluRXJyID0gYW5ndWxhci4kJG1pbkVycignbmcnKTtcclxuZnVuY3Rpb24gYXNzZXJ0QXJnKGFyZywgbmFtZSwgcmVhc29uKSB7XHJcbiAgaWYgKCFhcmcpIHtcclxuICAgIHRocm93IG5nTWluRXJyKCdhcmVxJywgXCJBcmd1bWVudCAnezB9JyBpcyB7MX1cIiwgKG5hbWUgfHwgJz8nKSwgKHJlYXNvbiB8fCBcInJlcXVpcmVkXCIpKTtcclxuICB9XHJcbiAgcmV0dXJuIGFyZztcclxufVxyXG5cclxuZnVuY3Rpb24gbWVyZ2VDbGFzc2VzKGEsYikge1xyXG4gIGlmICghYSAmJiAhYikgcmV0dXJuICcnO1xyXG4gIGlmICghYSkgcmV0dXJuIGI7XHJcbiAgaWYgKCFiKSByZXR1cm4gYTtcclxuICBpZiAoaXNBcnJheShhKSkgYSA9IGEuam9pbignICcpO1xyXG4gIGlmIChpc0FycmF5KGIpKSBiID0gYi5qb2luKCcgJyk7XHJcbiAgcmV0dXJuIGEgKyAnICcgKyBiO1xyXG59XHJcblxyXG5mdW5jdGlvbiBwYWNrYWdlU3R5bGVzKG9wdGlvbnMpIHtcclxuICB2YXIgc3R5bGVzID0ge307XHJcbiAgaWYgKG9wdGlvbnMgJiYgKG9wdGlvbnMudG8gfHwgb3B0aW9ucy5mcm9tKSkge1xyXG4gICAgc3R5bGVzLnRvID0gb3B0aW9ucy50bztcclxuICAgIHN0eWxlcy5mcm9tID0gb3B0aW9ucy5mcm9tO1xyXG4gIH1cclxuICByZXR1cm4gc3R5bGVzO1xyXG59XHJcblxyXG5mdW5jdGlvbiBwZW5kQ2xhc3NlcyhjbGFzc2VzLCBmaXgsIGlzUHJlZml4KSB7XHJcbiAgdmFyIGNsYXNzTmFtZSA9ICcnO1xyXG4gIGNsYXNzZXMgPSBpc0FycmF5KGNsYXNzZXMpXHJcbiAgICAgID8gY2xhc3Nlc1xyXG4gICAgICA6IGNsYXNzZXMgJiYgaXNTdHJpbmcoY2xhc3NlcykgJiYgY2xhc3Nlcy5sZW5ndGhcclxuICAgICAgICAgID8gY2xhc3Nlcy5zcGxpdCgvXFxzKy8pXHJcbiAgICAgICAgICA6IFtdO1xyXG4gIGZvckVhY2goY2xhc3NlcywgZnVuY3Rpb24oa2xhc3MsIGkpIHtcclxuICAgIGlmIChrbGFzcyAmJiBrbGFzcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgIGNsYXNzTmFtZSArPSAoaSA+IDApID8gJyAnIDogJyc7XHJcbiAgICAgIGNsYXNzTmFtZSArPSBpc1ByZWZpeCA/IGZpeCArIGtsYXNzXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IGtsYXNzICsgZml4O1xyXG4gICAgfVxyXG4gIH0pO1xyXG4gIHJldHVybiBjbGFzc05hbWU7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHJlbW92ZUZyb21BcnJheShhcnIsIHZhbCkge1xyXG4gIHZhciBpbmRleCA9IGFyci5pbmRleE9mKHZhbCk7XHJcbiAgaWYgKHZhbCA+PSAwKSB7XHJcbiAgICBhcnIuc3BsaWNlKGluZGV4LCAxKTtcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHN0cmlwQ29tbWVudHNGcm9tRWxlbWVudChlbGVtZW50KSB7XHJcbiAgaWYgKGVsZW1lbnQgaW5zdGFuY2VvZiBqcUxpdGUpIHtcclxuICAgIHN3aXRjaCAoZWxlbWVudC5sZW5ndGgpIHtcclxuICAgICAgY2FzZSAwOlxyXG4gICAgICAgIHJldHVybiBlbGVtZW50O1xyXG5cclxuICAgICAgY2FzZSAxOlxyXG4gICAgICAgIC8vIHRoZXJlIGlzIG5vIHBvaW50IG9mIHN0cmlwcGluZyBhbnl0aGluZyBpZiB0aGUgZWxlbWVudFxyXG4gICAgICAgIC8vIGlzIHRoZSBvbmx5IGVsZW1lbnQgd2l0aGluIHRoZSBqcUxpdGUgd3JhcHBlci5cclxuICAgICAgICAvLyAoaXQncyBpbXBvcnRhbnQgdGhhdCB3ZSByZXRhaW4gdGhlIGVsZW1lbnQgaW5zdGFuY2UuKVxyXG4gICAgICAgIGlmIChlbGVtZW50WzBdLm5vZGVUeXBlID09PSBFTEVNRU5UX05PREUpIHtcclxuICAgICAgICAgIHJldHVybiBlbGVtZW50O1xyXG4gICAgICAgIH1cclxuICAgICAgICBicmVhaztcclxuXHJcbiAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgcmV0dXJuIGpxTGl0ZShleHRyYWN0RWxlbWVudE5vZGUoZWxlbWVudCkpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgaWYgKGVsZW1lbnQubm9kZVR5cGUgPT09IEVMRU1FTlRfTk9ERSkge1xyXG4gICAgcmV0dXJuIGpxTGl0ZShlbGVtZW50KTtcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGV4dHJhY3RFbGVtZW50Tm9kZShlbGVtZW50KSB7XHJcbiAgaWYgKCFlbGVtZW50WzBdKSByZXR1cm4gZWxlbWVudDtcclxuICBmb3IgKHZhciBpID0gMDsgaSA8IGVsZW1lbnQubGVuZ3RoOyBpKyspIHtcclxuICAgIHZhciBlbG0gPSBlbGVtZW50W2ldO1xyXG4gICAgaWYgKGVsbS5ub2RlVHlwZSA9PSBFTEVNRU5UX05PREUpIHtcclxuICAgICAgcmV0dXJuIGVsbTtcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uICQkYWRkQ2xhc3MoJCRqcUxpdGUsIGVsZW1lbnQsIGNsYXNzTmFtZSkge1xyXG4gIGZvckVhY2goZWxlbWVudCwgZnVuY3Rpb24oZWxtKSB7XHJcbiAgICAkJGpxTGl0ZS5hZGRDbGFzcyhlbG0sIGNsYXNzTmFtZSk7XHJcbiAgfSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uICQkcmVtb3ZlQ2xhc3MoJCRqcUxpdGUsIGVsZW1lbnQsIGNsYXNzTmFtZSkge1xyXG4gIGZvckVhY2goZWxlbWVudCwgZnVuY3Rpb24oZWxtKSB7XHJcbiAgICAkJGpxTGl0ZS5yZW1vdmVDbGFzcyhlbG0sIGNsYXNzTmFtZSk7XHJcbiAgfSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGFwcGx5QW5pbWF0aW9uQ2xhc3Nlc0ZhY3RvcnkoJCRqcUxpdGUpIHtcclxuICByZXR1cm4gZnVuY3Rpb24oZWxlbWVudCwgb3B0aW9ucykge1xyXG4gICAgaWYgKG9wdGlvbnMuYWRkQ2xhc3MpIHtcclxuICAgICAgJCRhZGRDbGFzcygkJGpxTGl0ZSwgZWxlbWVudCwgb3B0aW9ucy5hZGRDbGFzcyk7XHJcbiAgICAgIG9wdGlvbnMuYWRkQ2xhc3MgPSBudWxsO1xyXG4gICAgfVxyXG4gICAgaWYgKG9wdGlvbnMucmVtb3ZlQ2xhc3MpIHtcclxuICAgICAgJCRyZW1vdmVDbGFzcygkJGpxTGl0ZSwgZWxlbWVudCwgb3B0aW9ucy5yZW1vdmVDbGFzcyk7XHJcbiAgICAgIG9wdGlvbnMucmVtb3ZlQ2xhc3MgPSBudWxsO1xyXG4gICAgfVxyXG4gIH07XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHByZXBhcmVBbmltYXRpb25PcHRpb25zKG9wdGlvbnMpIHtcclxuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcclxuICBpZiAoIW9wdGlvbnMuJCRwcmVwYXJlZCkge1xyXG4gICAgdmFyIGRvbU9wZXJhdGlvbiA9IG9wdGlvbnMuZG9tT3BlcmF0aW9uIHx8IG5vb3A7XHJcbiAgICBvcHRpb25zLmRvbU9wZXJhdGlvbiA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICBvcHRpb25zLiQkZG9tT3BlcmF0aW9uRmlyZWQgPSB0cnVlO1xyXG4gICAgICBkb21PcGVyYXRpb24oKTtcclxuICAgICAgZG9tT3BlcmF0aW9uID0gbm9vcDtcclxuICAgIH07XHJcbiAgICBvcHRpb25zLiQkcHJlcGFyZWQgPSB0cnVlO1xyXG4gIH1cclxuICByZXR1cm4gb3B0aW9ucztcclxufVxyXG5cclxuZnVuY3Rpb24gYXBwbHlBbmltYXRpb25TdHlsZXMoZWxlbWVudCwgb3B0aW9ucykge1xyXG4gIGFwcGx5QW5pbWF0aW9uRnJvbVN0eWxlcyhlbGVtZW50LCBvcHRpb25zKTtcclxuICBhcHBseUFuaW1hdGlvblRvU3R5bGVzKGVsZW1lbnQsIG9wdGlvbnMpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBhcHBseUFuaW1hdGlvbkZyb21TdHlsZXMoZWxlbWVudCwgb3B0aW9ucykge1xyXG4gIGlmIChvcHRpb25zLmZyb20pIHtcclxuICAgIGVsZW1lbnQuY3NzKG9wdGlvbnMuZnJvbSk7XHJcbiAgICBvcHRpb25zLmZyb20gPSBudWxsO1xyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gYXBwbHlBbmltYXRpb25Ub1N0eWxlcyhlbGVtZW50LCBvcHRpb25zKSB7XHJcbiAgaWYgKG9wdGlvbnMudG8pIHtcclxuICAgIGVsZW1lbnQuY3NzKG9wdGlvbnMudG8pO1xyXG4gICAgb3B0aW9ucy50byA9IG51bGw7XHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBtZXJnZUFuaW1hdGlvbkRldGFpbHMoZWxlbWVudCwgb2xkQW5pbWF0aW9uLCBuZXdBbmltYXRpb24pIHtcclxuICB2YXIgdGFyZ2V0ID0gb2xkQW5pbWF0aW9uLm9wdGlvbnMgfHwge307XHJcbiAgdmFyIG5ld09wdGlvbnMgPSBuZXdBbmltYXRpb24ub3B0aW9ucyB8fCB7fTtcclxuXHJcbiAgdmFyIHRvQWRkID0gKHRhcmdldC5hZGRDbGFzcyB8fCAnJykgKyAnICcgKyAobmV3T3B0aW9ucy5hZGRDbGFzcyB8fCAnJyk7XHJcbiAgdmFyIHRvUmVtb3ZlID0gKHRhcmdldC5yZW1vdmVDbGFzcyB8fCAnJykgKyAnICcgKyAobmV3T3B0aW9ucy5yZW1vdmVDbGFzcyB8fCAnJyk7XHJcbiAgdmFyIGNsYXNzZXMgPSByZXNvbHZlRWxlbWVudENsYXNzZXMoZWxlbWVudC5hdHRyKCdjbGFzcycpLCB0b0FkZCwgdG9SZW1vdmUpO1xyXG5cclxuICBpZiAobmV3T3B0aW9ucy5wcmVwYXJhdGlvbkNsYXNzZXMpIHtcclxuICAgIHRhcmdldC5wcmVwYXJhdGlvbkNsYXNzZXMgPSBjb25jYXRXaXRoU3BhY2UobmV3T3B0aW9ucy5wcmVwYXJhdGlvbkNsYXNzZXMsIHRhcmdldC5wcmVwYXJhdGlvbkNsYXNzZXMpO1xyXG4gICAgZGVsZXRlIG5ld09wdGlvbnMucHJlcGFyYXRpb25DbGFzc2VzO1xyXG4gIH1cclxuXHJcbiAgLy8gbm9vcCBpcyBiYXNpY2FsbHkgd2hlbiB0aGVyZSBpcyBubyBjYWxsYmFjazsgb3RoZXJ3aXNlIHNvbWV0aGluZyBoYXMgYmVlbiBzZXRcclxuICB2YXIgcmVhbERvbU9wZXJhdGlvbiA9IHRhcmdldC5kb21PcGVyYXRpb24gIT09IG5vb3AgPyB0YXJnZXQuZG9tT3BlcmF0aW9uIDogbnVsbDtcclxuXHJcbiAgZXh0ZW5kKHRhcmdldCwgbmV3T3B0aW9ucyk7XHJcblxyXG4gIC8vIFRPRE8obWF0c2tvIG9yIHNyZWVyYW11KTogcHJvcGVyIGZpeCBpcyB0byBtYWludGFpbiBhbGwgYW5pbWF0aW9uIGNhbGxiYWNrIGluIGFycmF5IGFuZCBjYWxsIGF0IGxhc3QsYnV0IG5vdyBvbmx5IGxlYXZlIGhhcyB0aGUgY2FsbGJhY2sgc28gbm8gaXNzdWUgd2l0aCB0aGlzLlxyXG4gIGlmIChyZWFsRG9tT3BlcmF0aW9uKSB7XHJcbiAgICB0YXJnZXQuZG9tT3BlcmF0aW9uID0gcmVhbERvbU9wZXJhdGlvbjtcclxuICB9XHJcblxyXG4gIGlmIChjbGFzc2VzLmFkZENsYXNzKSB7XHJcbiAgICB0YXJnZXQuYWRkQ2xhc3MgPSBjbGFzc2VzLmFkZENsYXNzO1xyXG4gIH0gZWxzZSB7XHJcbiAgICB0YXJnZXQuYWRkQ2xhc3MgPSBudWxsO1xyXG4gIH1cclxuXHJcbiAgaWYgKGNsYXNzZXMucmVtb3ZlQ2xhc3MpIHtcclxuICAgIHRhcmdldC5yZW1vdmVDbGFzcyA9IGNsYXNzZXMucmVtb3ZlQ2xhc3M7XHJcbiAgfSBlbHNlIHtcclxuICAgIHRhcmdldC5yZW1vdmVDbGFzcyA9IG51bGw7XHJcbiAgfVxyXG5cclxuICBvbGRBbmltYXRpb24uYWRkQ2xhc3MgPSB0YXJnZXQuYWRkQ2xhc3M7XHJcbiAgb2xkQW5pbWF0aW9uLnJlbW92ZUNsYXNzID0gdGFyZ2V0LnJlbW92ZUNsYXNzO1xyXG5cclxuICByZXR1cm4gdGFyZ2V0O1xyXG59XHJcblxyXG5mdW5jdGlvbiByZXNvbHZlRWxlbWVudENsYXNzZXMoZXhpc3RpbmcsIHRvQWRkLCB0b1JlbW92ZSkge1xyXG4gIHZhciBBRERfQ0xBU1MgPSAxO1xyXG4gIHZhciBSRU1PVkVfQ0xBU1MgPSAtMTtcclxuXHJcbiAgdmFyIGZsYWdzID0ge307XHJcbiAgZXhpc3RpbmcgPSBzcGxpdENsYXNzZXNUb0xvb2t1cChleGlzdGluZyk7XHJcblxyXG4gIHRvQWRkID0gc3BsaXRDbGFzc2VzVG9Mb29rdXAodG9BZGQpO1xyXG4gIGZvckVhY2godG9BZGQsIGZ1bmN0aW9uKHZhbHVlLCBrZXkpIHtcclxuICAgIGZsYWdzW2tleV0gPSBBRERfQ0xBU1M7XHJcbiAgfSk7XHJcblxyXG4gIHRvUmVtb3ZlID0gc3BsaXRDbGFzc2VzVG9Mb29rdXAodG9SZW1vdmUpO1xyXG4gIGZvckVhY2godG9SZW1vdmUsIGZ1bmN0aW9uKHZhbHVlLCBrZXkpIHtcclxuICAgIGZsYWdzW2tleV0gPSBmbGFnc1trZXldID09PSBBRERfQ0xBU1MgPyBudWxsIDogUkVNT1ZFX0NMQVNTO1xyXG4gIH0pO1xyXG5cclxuICB2YXIgY2xhc3NlcyA9IHtcclxuICAgIGFkZENsYXNzOiAnJyxcclxuICAgIHJlbW92ZUNsYXNzOiAnJ1xyXG4gIH07XHJcblxyXG4gIGZvckVhY2goZmxhZ3MsIGZ1bmN0aW9uKHZhbCwga2xhc3MpIHtcclxuICAgIHZhciBwcm9wLCBhbGxvdztcclxuICAgIGlmICh2YWwgPT09IEFERF9DTEFTUykge1xyXG4gICAgICBwcm9wID0gJ2FkZENsYXNzJztcclxuICAgICAgYWxsb3cgPSAhZXhpc3Rpbmdba2xhc3NdIHx8IGV4aXN0aW5nW2tsYXNzICsgUkVNT1ZFX0NMQVNTX1NVRkZJWF07XHJcbiAgICB9IGVsc2UgaWYgKHZhbCA9PT0gUkVNT1ZFX0NMQVNTKSB7XHJcbiAgICAgIHByb3AgPSAncmVtb3ZlQ2xhc3MnO1xyXG4gICAgICBhbGxvdyA9IGV4aXN0aW5nW2tsYXNzXSB8fCBleGlzdGluZ1trbGFzcyArIEFERF9DTEFTU19TVUZGSVhdO1xyXG4gICAgfVxyXG4gICAgaWYgKGFsbG93KSB7XHJcbiAgICAgIGlmIChjbGFzc2VzW3Byb3BdLmxlbmd0aCkge1xyXG4gICAgICAgIGNsYXNzZXNbcHJvcF0gKz0gJyAnO1xyXG4gICAgICB9XHJcbiAgICAgIGNsYXNzZXNbcHJvcF0gKz0ga2xhc3M7XHJcbiAgICB9XHJcbiAgfSk7XHJcblxyXG4gIGZ1bmN0aW9uIHNwbGl0Q2xhc3Nlc1RvTG9va3VwKGNsYXNzZXMpIHtcclxuICAgIGlmIChpc1N0cmluZyhjbGFzc2VzKSkge1xyXG4gICAgICBjbGFzc2VzID0gY2xhc3Nlcy5zcGxpdCgnICcpO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBvYmogPSB7fTtcclxuICAgIGZvckVhY2goY2xhc3NlcywgZnVuY3Rpb24oa2xhc3MpIHtcclxuICAgICAgLy8gc29tZXRpbWVzIHRoZSBzcGxpdCBsZWF2ZXMgZW1wdHkgc3RyaW5nIHZhbHVlc1xyXG4gICAgICAvLyBpbmNhc2UgZXh0cmEgc3BhY2VzIHdlcmUgYXBwbGllZCB0byB0aGUgb3B0aW9uc1xyXG4gICAgICBpZiAoa2xhc3MubGVuZ3RoKSB7XHJcbiAgICAgICAgb2JqW2tsYXNzXSA9IHRydWU7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIG9iajtcclxuICB9XHJcblxyXG4gIHJldHVybiBjbGFzc2VzO1xyXG59XHJcblxyXG5mdW5jdGlvbiBnZXREb21Ob2RlKGVsZW1lbnQpIHtcclxuICByZXR1cm4gKGVsZW1lbnQgaW5zdGFuY2VvZiBqcUxpdGUpID8gZWxlbWVudFswXSA6IGVsZW1lbnQ7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGFwcGx5R2VuZXJhdGVkUHJlcGFyYXRpb25DbGFzc2VzKGVsZW1lbnQsIGV2ZW50LCBvcHRpb25zKSB7XHJcbiAgdmFyIGNsYXNzZXMgPSAnJztcclxuICBpZiAoZXZlbnQpIHtcclxuICAgIGNsYXNzZXMgPSBwZW5kQ2xhc3NlcyhldmVudCwgRVZFTlRfQ0xBU1NfUFJFRklYLCB0cnVlKTtcclxuICB9XHJcbiAgaWYgKG9wdGlvbnMuYWRkQ2xhc3MpIHtcclxuICAgIGNsYXNzZXMgPSBjb25jYXRXaXRoU3BhY2UoY2xhc3NlcywgcGVuZENsYXNzZXMob3B0aW9ucy5hZGRDbGFzcywgQUREX0NMQVNTX1NVRkZJWCkpO1xyXG4gIH1cclxuICBpZiAob3B0aW9ucy5yZW1vdmVDbGFzcykge1xyXG4gICAgY2xhc3NlcyA9IGNvbmNhdFdpdGhTcGFjZShjbGFzc2VzLCBwZW5kQ2xhc3NlcyhvcHRpb25zLnJlbW92ZUNsYXNzLCBSRU1PVkVfQ0xBU1NfU1VGRklYKSk7XHJcbiAgfVxyXG4gIGlmIChjbGFzc2VzLmxlbmd0aCkge1xyXG4gICAgb3B0aW9ucy5wcmVwYXJhdGlvbkNsYXNzZXMgPSBjbGFzc2VzO1xyXG4gICAgZWxlbWVudC5hZGRDbGFzcyhjbGFzc2VzKTtcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNsZWFyR2VuZXJhdGVkQ2xhc3NlcyhlbGVtZW50LCBvcHRpb25zKSB7XHJcbiAgaWYgKG9wdGlvbnMucHJlcGFyYXRpb25DbGFzc2VzKSB7XHJcbiAgICBlbGVtZW50LnJlbW92ZUNsYXNzKG9wdGlvbnMucHJlcGFyYXRpb25DbGFzc2VzKTtcclxuICAgIG9wdGlvbnMucHJlcGFyYXRpb25DbGFzc2VzID0gbnVsbDtcclxuICB9XHJcbiAgaWYgKG9wdGlvbnMuYWN0aXZlQ2xhc3Nlcykge1xyXG4gICAgZWxlbWVudC5yZW1vdmVDbGFzcyhvcHRpb25zLmFjdGl2ZUNsYXNzZXMpO1xyXG4gICAgb3B0aW9ucy5hY3RpdmVDbGFzc2VzID0gbnVsbDtcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGJsb2NrVHJhbnNpdGlvbnMobm9kZSwgZHVyYXRpb24pIHtcclxuICAvLyB3ZSB1c2UgYSBuZWdhdGl2ZSBkZWxheSB2YWx1ZSBzaW5jZSBpdCBwZXJmb3JtcyBibG9ja2luZ1xyXG4gIC8vIHlldCBpdCBkb2Vzbid0IGtpbGwgYW55IGV4aXN0aW5nIHRyYW5zaXRpb25zIHJ1bm5pbmcgb24gdGhlXHJcbiAgLy8gc2FtZSBlbGVtZW50IHdoaWNoIG1ha2VzIHRoaXMgc2FmZSBmb3IgY2xhc3MtYmFzZWQgYW5pbWF0aW9uc1xyXG4gIHZhciB2YWx1ZSA9IGR1cmF0aW9uID8gJy0nICsgZHVyYXRpb24gKyAncycgOiAnJztcclxuICBhcHBseUlubGluZVN0eWxlKG5vZGUsIFtUUkFOU0lUSU9OX0RFTEFZX1BST1AsIHZhbHVlXSk7XHJcbiAgcmV0dXJuIFtUUkFOU0lUSU9OX0RFTEFZX1BST1AsIHZhbHVlXTtcclxufVxyXG5cclxuZnVuY3Rpb24gYmxvY2tLZXlmcmFtZUFuaW1hdGlvbnMobm9kZSwgYXBwbHlCbG9jaykge1xyXG4gIHZhciB2YWx1ZSA9IGFwcGx5QmxvY2sgPyAncGF1c2VkJyA6ICcnO1xyXG4gIHZhciBrZXkgPSBBTklNQVRJT05fUFJPUCArIEFOSU1BVElPTl9QTEFZU1RBVEVfS0VZO1xyXG4gIGFwcGx5SW5saW5lU3R5bGUobm9kZSwgW2tleSwgdmFsdWVdKTtcclxuICByZXR1cm4gW2tleSwgdmFsdWVdO1xyXG59XHJcblxyXG5mdW5jdGlvbiBhcHBseUlubGluZVN0eWxlKG5vZGUsIHN0eWxlVHVwbGUpIHtcclxuICB2YXIgcHJvcCA9IHN0eWxlVHVwbGVbMF07XHJcbiAgdmFyIHZhbHVlID0gc3R5bGVUdXBsZVsxXTtcclxuICBub2RlLnN0eWxlW3Byb3BdID0gdmFsdWU7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNvbmNhdFdpdGhTcGFjZShhLGIpIHtcclxuICBpZiAoIWEpIHJldHVybiBiO1xyXG4gIGlmICghYikgcmV0dXJuIGE7XHJcbiAgcmV0dXJuIGEgKyAnICcgKyBiO1xyXG59XHJcblxyXG52YXIgJCRyQUZTY2hlZHVsZXJGYWN0b3J5ID0gWyckJHJBRicsIGZ1bmN0aW9uKCQkckFGKSB7XHJcbiAgdmFyIHF1ZXVlLCBjYW5jZWxGbjtcclxuXHJcbiAgZnVuY3Rpb24gc2NoZWR1bGVyKHRhc2tzKSB7XHJcbiAgICAvLyB3ZSBtYWtlIGEgY29weSBzaW5jZSBSQUZTY2hlZHVsZXIgbXV0YXRlcyB0aGUgc3RhdGVcclxuICAgIC8vIG9mIHRoZSBwYXNzZWQgaW4gYXJyYXkgdmFyaWFibGUgYW5kIHRoaXMgd291bGQgYmUgZGlmZmljdWx0XHJcbiAgICAvLyB0byB0cmFjayBkb3duIG9uIHRoZSBvdXRzaWRlIGNvZGVcclxuICAgIHF1ZXVlID0gcXVldWUuY29uY2F0KHRhc2tzKTtcclxuICAgIG5leHRUaWNrKCk7XHJcbiAgfVxyXG5cclxuICBxdWV1ZSA9IHNjaGVkdWxlci5xdWV1ZSA9IFtdO1xyXG5cclxuICAvKiB3YWl0VW50aWxRdWlldCBkb2VzIHR3byB0aGluZ3M6XHJcbiAgICogMS4gSXQgd2lsbCBydW4gdGhlIEZJTkFMIGBmbmAgdmFsdWUgb25seSB3aGVuIGFuIHVuY2FuY2VsZWQgUkFGIGhhcyBwYXNzZWQgdGhyb3VnaFxyXG4gICAqIDIuIEl0IHdpbGwgZGVsYXkgdGhlIG5leHQgd2F2ZSBvZiB0YXNrcyBmcm9tIHJ1bm5pbmcgdW50aWwgdGhlIHF1aWV0IGBmbmAgaGFzIHJ1bi5cclxuICAgKlxyXG4gICAqIFRoZSBtb3RpdmF0aW9uIGhlcmUgaXMgdGhhdCBhbmltYXRpb24gY29kZSBjYW4gcmVxdWVzdCBtb3JlIHRpbWUgZnJvbSB0aGUgc2NoZWR1bGVyXHJcbiAgICogYmVmb3JlIHRoZSBuZXh0IHdhdmUgcnVucy4gVGhpcyBhbGxvd3MgZm9yIGNlcnRhaW4gRE9NIHByb3BlcnRpZXMgc3VjaCBhcyBjbGFzc2VzIHRvXHJcbiAgICogYmUgcmVzb2x2ZWQgaW4gdGltZSBmb3IgdGhlIG5leHQgYW5pbWF0aW9uIHRvIHJ1bi5cclxuICAgKi9cclxuICBzY2hlZHVsZXIud2FpdFVudGlsUXVpZXQgPSBmdW5jdGlvbihmbikge1xyXG4gICAgaWYgKGNhbmNlbEZuKSBjYW5jZWxGbigpO1xyXG5cclxuICAgIGNhbmNlbEZuID0gJCRyQUYoZnVuY3Rpb24oKSB7XHJcbiAgICAgIGNhbmNlbEZuID0gbnVsbDtcclxuICAgICAgZm4oKTtcclxuICAgICAgbmV4dFRpY2soKTtcclxuICAgIH0pO1xyXG4gIH07XHJcblxyXG4gIHJldHVybiBzY2hlZHVsZXI7XHJcblxyXG4gIGZ1bmN0aW9uIG5leHRUaWNrKCkge1xyXG4gICAgaWYgKCFxdWV1ZS5sZW5ndGgpIHJldHVybjtcclxuXHJcbiAgICB2YXIgaXRlbXMgPSBxdWV1ZS5zaGlmdCgpO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBpdGVtcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICBpdGVtc1tpXSgpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICghY2FuY2VsRm4pIHtcclxuICAgICAgJCRyQUYoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgaWYgKCFjYW5jZWxGbikgbmV4dFRpY2soKTtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfVxyXG59XTtcclxuXHJcbi8qKlxyXG4gKiBAbmdkb2MgZGlyZWN0aXZlXHJcbiAqIEBuYW1lIG5nQW5pbWF0ZUNoaWxkcmVuXHJcbiAqIEByZXN0cmljdCBBRVxyXG4gKiBAZWxlbWVudCBBTllcclxuICpcclxuICogQGRlc2NyaXB0aW9uXHJcbiAqXHJcbiAqIG5nQW5pbWF0ZUNoaWxkcmVuIGFsbG93cyB5b3UgdG8gc3BlY2lmeSB0aGF0IGNoaWxkcmVuIG9mIHRoaXMgZWxlbWVudCBzaG91bGQgYW5pbWF0ZSBldmVuIGlmIGFueVxyXG4gKiBvZiB0aGUgY2hpbGRyZW4ncyBwYXJlbnRzIGFyZSBjdXJyZW50bHkgYW5pbWF0aW5nLiBCeSBkZWZhdWx0LCB3aGVuIGFuIGVsZW1lbnQgaGFzIGFuIGFjdGl2ZSBgZW50ZXJgLCBgbGVhdmVgLCBvciBgbW92ZWBcclxuICogKHN0cnVjdHVyYWwpIGFuaW1hdGlvbiwgY2hpbGQgZWxlbWVudHMgdGhhdCBhbHNvIGhhdmUgYW4gYWN0aXZlIHN0cnVjdHVyYWwgYW5pbWF0aW9uIGFyZSBub3QgYW5pbWF0ZWQuXHJcbiAqXHJcbiAqIE5vdGUgdGhhdCBldmVuIGlmIGBuZ0FuaW10ZUNoaWxkcmVuYCBpcyBzZXQsIG5vIGNoaWxkIGFuaW1hdGlvbnMgd2lsbCBydW4gd2hlbiB0aGUgcGFyZW50IGVsZW1lbnQgaXMgcmVtb3ZlZCBmcm9tIHRoZSBET00gKGBsZWF2ZWAgYW5pbWF0aW9uKS5cclxuICpcclxuICpcclxuICogQHBhcmFtIHtzdHJpbmd9IG5nQW5pbWF0ZUNoaWxkcmVuIElmIHRoZSB2YWx1ZSBpcyBlbXB0eSwgYHRydWVgIG9yIGBvbmAsXHJcbiAqICAgICB0aGVuIGNoaWxkIGFuaW1hdGlvbnMgYXJlIGFsbG93ZWQuIElmIHRoZSB2YWx1ZSBpcyBgZmFsc2VgLCBjaGlsZCBhbmltYXRpb25zIGFyZSBub3QgYWxsb3dlZC5cclxuICpcclxuICogQGV4YW1wbGVcclxuICogPGV4YW1wbGUgbW9kdWxlPVwibmdBbmltYXRlQ2hpbGRyZW5cIiBuYW1lPVwibmdBbmltYXRlQ2hpbGRyZW5cIiBkZXBzPVwiYW5ndWxhci1hbmltYXRlLmpzXCIgYW5pbWF0aW9ucz1cInRydWVcIj5cclxuICAgICA8ZmlsZSBuYW1lPVwiaW5kZXguaHRtbFwiPlxyXG4gICAgICAgPGRpdiBuZy1jb250cm9sbGVyPVwibWFpbkNvbnRyb2xsZXIgYXMgbWFpblwiPlxyXG4gICAgICAgICA8bGFiZWw+U2hvdyBjb250YWluZXI/IDxpbnB1dCB0eXBlPVwiY2hlY2tib3hcIiBuZy1tb2RlbD1cIm1haW4uZW50ZXJFbGVtZW50XCIgLz48L2xhYmVsPlxyXG4gICAgICAgICA8bGFiZWw+QW5pbWF0ZSBjaGlsZHJlbj8gPGlucHV0IHR5cGU9XCJjaGVja2JveFwiIG5nLW1vZGVsPVwibWFpbi5hbmltYXRlQ2hpbGRyZW5cIiAvPjwvbGFiZWw+XHJcbiAgICAgICAgIDxocj5cclxuICAgICAgICAgPGRpdiBuZy1hbmltYXRlLWNoaWxkcmVuPVwie3ttYWluLmFuaW1hdGVDaGlsZHJlbn19XCI+XHJcbiAgICAgICAgICAgPGRpdiBuZy1pZj1cIm1haW4uZW50ZXJFbGVtZW50XCIgY2xhc3M9XCJjb250YWluZXJcIj5cclxuICAgICAgICAgICAgIExpc3Qgb2YgaXRlbXM6XHJcbiAgICAgICAgICAgICA8ZGl2IG5nLXJlcGVhdD1cIml0ZW0gaW4gWzAsIDEsIDIsIDNdXCIgY2xhc3M9XCJpdGVtXCI+SXRlbSB7e2l0ZW19fTwvZGl2PlxyXG4gICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICA8L2Rpdj5cclxuICAgICAgIDwvZGl2PlxyXG4gICAgIDwvZmlsZT5cclxuICAgICA8ZmlsZSBuYW1lPVwiYW5pbWF0aW9ucy5jc3NcIj5cclxuXHJcbiAgICAgIC5jb250YWluZXIubmctZW50ZXIsXHJcbiAgICAgIC5jb250YWluZXIubmctbGVhdmUge1xyXG4gICAgICAgIHRyYW5zaXRpb246IGFsbCBlYXNlIDEuNXM7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC5jb250YWluZXIubmctZW50ZXIsXHJcbiAgICAgIC5jb250YWluZXIubmctbGVhdmUtYWN0aXZlIHtcclxuICAgICAgICBvcGFjaXR5OiAwO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAuY29udGFpbmVyLm5nLWxlYXZlLFxyXG4gICAgICAuY29udGFpbmVyLm5nLWVudGVyLWFjdGl2ZSB7XHJcbiAgICAgICAgb3BhY2l0eTogMTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLml0ZW0ge1xyXG4gICAgICAgIGJhY2tncm91bmQ6IGZpcmVicmljaztcclxuICAgICAgICBjb2xvcjogI0ZGRjtcclxuICAgICAgICBtYXJnaW4tYm90dG9tOiAxMHB4O1xyXG4gICAgICB9XHJcblxyXG4gICAgICAuaXRlbS5uZy1lbnRlcixcclxuICAgICAgLml0ZW0ubmctbGVhdmUge1xyXG4gICAgICAgIHRyYW5zaXRpb246IHRyYW5zZm9ybSAxLjVzIGVhc2U7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC5pdGVtLm5nLWVudGVyIHtcclxuICAgICAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoNTBweCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC5pdGVtLm5nLWVudGVyLWFjdGl2ZSB7XHJcbiAgICAgICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKDApO1xyXG4gICAgICB9XHJcbiAgICA8L2ZpbGU+XHJcbiAgICA8ZmlsZSBuYW1lPVwic2NyaXB0LmpzXCI+XHJcbiAgICAgIGFuZ3VsYXIubW9kdWxlKCduZ0FuaW1hdGVDaGlsZHJlbicsIFsnbmdBbmltYXRlJ10pXHJcbiAgICAgICAgLmNvbnRyb2xsZXIoJ21haW5Db250cm9sbGVyJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICB0aGlzLmFuaW1hdGVDaGlsZHJlbiA9IGZhbHNlO1xyXG4gICAgICAgICAgdGhpcy5lbnRlckVsZW1lbnQgPSBmYWxzZTtcclxuICAgICAgICB9KTtcclxuICAgIDwvZmlsZT5cclxuICA8L2V4YW1wbGU+XHJcbiAqL1xyXG52YXIgJCRBbmltYXRlQ2hpbGRyZW5EaXJlY3RpdmUgPSBbJyRpbnRlcnBvbGF0ZScsIGZ1bmN0aW9uKCRpbnRlcnBvbGF0ZSkge1xyXG4gIHJldHVybiB7XHJcbiAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxlbWVudCwgYXR0cnMpIHtcclxuICAgICAgdmFyIHZhbCA9IGF0dHJzLm5nQW5pbWF0ZUNoaWxkcmVuO1xyXG4gICAgICBpZiAoaXNTdHJpbmcodmFsKSAmJiB2YWwubGVuZ3RoID09PSAwKSB7IC8vZW1wdHkgYXR0cmlidXRlXHJcbiAgICAgICAgZWxlbWVudC5kYXRhKE5HX0FOSU1BVEVfQ0hJTERSRU5fREFUQSwgdHJ1ZSk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgLy8gSW50ZXJwb2xhdGUgYW5kIHNldCB0aGUgdmFsdWUsIHNvIHRoYXQgaXQgaXMgYXZhaWxhYmxlIHRvXHJcbiAgICAgICAgLy8gYW5pbWF0aW9ucyB0aGF0IHJ1biByaWdodCBhZnRlciBjb21waWxhdGlvblxyXG4gICAgICAgIHNldERhdGEoJGludGVycG9sYXRlKHZhbCkoc2NvcGUpKTtcclxuICAgICAgICBhdHRycy4kb2JzZXJ2ZSgnbmdBbmltYXRlQ2hpbGRyZW4nLCBzZXREYXRhKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgZnVuY3Rpb24gc2V0RGF0YSh2YWx1ZSkge1xyXG4gICAgICAgIHZhbHVlID0gdmFsdWUgPT09ICdvbicgfHwgdmFsdWUgPT09ICd0cnVlJztcclxuICAgICAgICBlbGVtZW50LmRhdGEoTkdfQU5JTUFURV9DSElMRFJFTl9EQVRBLCB2YWx1ZSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9O1xyXG59XTtcclxuXHJcbnZhciBBTklNQVRFX1RJTUVSX0tFWSA9ICckJGFuaW1hdGVDc3MnO1xyXG5cclxuLyoqXHJcbiAqIEBuZ2RvYyBzZXJ2aWNlXHJcbiAqIEBuYW1lICRhbmltYXRlQ3NzXHJcbiAqIEBraW5kIG9iamVjdFxyXG4gKlxyXG4gKiBAZGVzY3JpcHRpb25cclxuICogVGhlIGAkYW5pbWF0ZUNzc2Agc2VydmljZSBpcyBhIHVzZWZ1bCB1dGlsaXR5IHRvIHRyaWdnZXIgY3VzdG9taXplZCBDU1MtYmFzZWQgdHJhbnNpdGlvbnMva2V5ZnJhbWVzXHJcbiAqIGZyb20gYSBKYXZhU2NyaXB0LWJhc2VkIGFuaW1hdGlvbiBvciBkaXJlY3RseSBmcm9tIGEgZGlyZWN0aXZlLiBUaGUgcHVycG9zZSBvZiBgJGFuaW1hdGVDc3NgIGlzIE5PVFxyXG4gKiB0byBzaWRlLXN0ZXAgaG93IGAkYW5pbWF0ZWAgYW5kIG5nQW5pbWF0ZSB3b3JrLCBidXQgdGhlIGdvYWwgaXMgdG8gYWxsb3cgcHJlLWV4aXN0aW5nIGFuaW1hdGlvbnMgb3JcclxuICogZGlyZWN0aXZlcyB0byBjcmVhdGUgbW9yZSBjb21wbGV4IGFuaW1hdGlvbnMgdGhhdCBjYW4gYmUgcHVyZWx5IGRyaXZlbiB1c2luZyBDU1MgY29kZS5cclxuICpcclxuICogTm90ZSB0aGF0IG9ubHkgYnJvd3NlcnMgdGhhdCBzdXBwb3J0IENTUyB0cmFuc2l0aW9ucyBhbmQvb3Iga2V5ZnJhbWUgYW5pbWF0aW9ucyBhcmUgY2FwYWJsZSBvZlxyXG4gKiByZW5kZXJpbmcgYW5pbWF0aW9ucyB0cmlnZ2VyZWQgdmlhIGAkYW5pbWF0ZUNzc2AgKGJhZCBuZXdzIGZvciBJRTkgYW5kIGxvd2VyKS5cclxuICpcclxuICogIyMgVXNhZ2VcclxuICogT25jZSBhZ2FpbiwgYCRhbmltYXRlQ3NzYCBpcyBkZXNpZ25lZCB0byBiZSB1c2VkIGluc2lkZSBvZiBhIHJlZ2lzdGVyZWQgSmF2YVNjcmlwdCBhbmltYXRpb24gdGhhdFxyXG4gKiBpcyBwb3dlcmVkIGJ5IG5nQW5pbWF0ZS4gSXQgaXMgcG9zc2libGUgdG8gdXNlIGAkYW5pbWF0ZUNzc2AgZGlyZWN0bHkgaW5zaWRlIG9mIGEgZGlyZWN0aXZlLCBob3dldmVyLFxyXG4gKiBhbnkgYXV0b21hdGljIGNvbnRyb2wgb3ZlciBjYW5jZWxsaW5nIGFuaW1hdGlvbnMgYW5kL29yIHByZXZlbnRpbmcgYW5pbWF0aW9ucyBmcm9tIGJlaW5nIHJ1biBvblxyXG4gKiBjaGlsZCBlbGVtZW50cyB3aWxsIG5vdCBiZSBoYW5kbGVkIGJ5IEFuZ3VsYXIuIEZvciB0aGlzIHRvIHdvcmsgYXMgZXhwZWN0ZWQsIHBsZWFzZSB1c2UgYCRhbmltYXRlYCB0b1xyXG4gKiB0cmlnZ2VyIHRoZSBhbmltYXRpb24gYW5kIHRoZW4gc2V0dXAgYSBKYXZhU2NyaXB0IGFuaW1hdGlvbiB0aGF0IGluamVjdHMgYCRhbmltYXRlQ3NzYCB0byB0cmlnZ2VyXHJcbiAqIHRoZSBDU1MgYW5pbWF0aW9uLlxyXG4gKlxyXG4gKiBUaGUgZXhhbXBsZSBiZWxvdyBzaG93cyBob3cgd2UgY2FuIGNyZWF0ZSBhIGZvbGRpbmcgYW5pbWF0aW9uIG9uIGFuIGVsZW1lbnQgdXNpbmcgYG5nLWlmYDpcclxuICpcclxuICogYGBgaHRtbFxyXG4gKiA8IS0tIG5vdGljZSB0aGUgYGZvbGQtYW5pbWF0aW9uYCBDU1MgY2xhc3MgLS0+XHJcbiAqIDxkaXYgbmctaWY9XCJvbk9mZlwiIGNsYXNzPVwiZm9sZC1hbmltYXRpb25cIj5cclxuICogICBUaGlzIGVsZW1lbnQgd2lsbCBnbyBCT09NXHJcbiAqIDwvZGl2PlxyXG4gKiA8YnV0dG9uIG5nLWNsaWNrPVwib25PZmY9dHJ1ZVwiPkZvbGQgSW48L2J1dHRvbj5cclxuICogYGBgXHJcbiAqXHJcbiAqIE5vdyB3ZSBjcmVhdGUgdGhlICoqSmF2YVNjcmlwdCBhbmltYXRpb24qKiB0aGF0IHdpbGwgdHJpZ2dlciB0aGUgQ1NTIHRyYW5zaXRpb246XHJcbiAqXHJcbiAqIGBgYGpzXHJcbiAqIG5nTW9kdWxlLmFuaW1hdGlvbignLmZvbGQtYW5pbWF0aW9uJywgWyckYW5pbWF0ZUNzcycsIGZ1bmN0aW9uKCRhbmltYXRlQ3NzKSB7XHJcbiAqICAgcmV0dXJuIHtcclxuICogICAgIGVudGVyOiBmdW5jdGlvbihlbGVtZW50LCBkb25lRm4pIHtcclxuICogICAgICAgdmFyIGhlaWdodCA9IGVsZW1lbnRbMF0ub2Zmc2V0SGVpZ2h0O1xyXG4gKiAgICAgICByZXR1cm4gJGFuaW1hdGVDc3MoZWxlbWVudCwge1xyXG4gKiAgICAgICAgIGZyb206IHsgaGVpZ2h0OicwcHgnIH0sXHJcbiAqICAgICAgICAgdG86IHsgaGVpZ2h0OmhlaWdodCArICdweCcgfSxcclxuICogICAgICAgICBkdXJhdGlvbjogMSAvLyBvbmUgc2Vjb25kXHJcbiAqICAgICAgIH0pO1xyXG4gKiAgICAgfVxyXG4gKiAgIH1cclxuICogfV0pO1xyXG4gKiBgYGBcclxuICpcclxuICogIyMgTW9yZSBBZHZhbmNlZCBVc2VzXHJcbiAqXHJcbiAqIGAkYW5pbWF0ZUNzc2AgaXMgdGhlIHVuZGVybHlpbmcgY29kZSB0aGF0IG5nQW5pbWF0ZSB1c2VzIHRvIHBvd2VyICoqQ1NTLWJhc2VkIGFuaW1hdGlvbnMqKiBiZWhpbmQgdGhlIHNjZW5lcy4gVGhlcmVmb3JlIENTUyBob29rc1xyXG4gKiBsaWtlIGAubmctRVZFTlRgLCBgLm5nLUVWRU5ULWFjdGl2ZWAsIGAubmctRVZFTlQtc3RhZ2dlcmAgYXJlIGFsbCBmZWF0dXJlcyB0aGF0IGNhbiBiZSB0cmlnZ2VyZWQgdXNpbmcgYCRhbmltYXRlQ3NzYCB2aWEgSmF2YVNjcmlwdCBjb2RlLlxyXG4gKlxyXG4gKiBUaGlzIGFsc28gbWVhbnMgdGhhdCBqdXN0IGFib3V0IGFueSBjb21iaW5hdGlvbiBvZiBhZGRpbmcgY2xhc3NlcywgcmVtb3ZpbmcgY2xhc3Nlcywgc2V0dGluZyBzdHlsZXMsIGR5bmFtaWNhbGx5IHNldHRpbmcgYSBrZXlmcmFtZSBhbmltYXRpb24sXHJcbiAqIGFwcGx5aW5nIGEgaGFyZGNvZGVkIGR1cmF0aW9uIG9yIGRlbGF5IHZhbHVlLCBjaGFuZ2luZyB0aGUgYW5pbWF0aW9uIGVhc2luZyBvciBhcHBseWluZyBhIHN0YWdnZXIgYW5pbWF0aW9uIGFyZSBhbGwgb3B0aW9ucyB0aGF0IHdvcmsgd2l0aFxyXG4gKiBgJGFuaW1hdGVDc3NgLiBUaGUgc2VydmljZSBpdHNlbGYgaXMgc21hcnQgZW5vdWdoIHRvIGZpZ3VyZSBvdXQgdGhlIGNvbWJpbmF0aW9uIG9mIG9wdGlvbnMgYW5kIGV4YW1pbmUgdGhlIGVsZW1lbnQgc3R5bGluZyBwcm9wZXJ0aWVzIGluIG9yZGVyXHJcbiAqIHRvIHByb3ZpZGUgYSB3b3JraW5nIGFuaW1hdGlvbiB0aGF0IHdpbGwgcnVuIGluIENTUy5cclxuICpcclxuICogVGhlIGV4YW1wbGUgYmVsb3cgc2hvd2Nhc2VzIGEgbW9yZSBhZHZhbmNlZCB2ZXJzaW9uIG9mIHRoZSBgLmZvbGQtYW5pbWF0aW9uYCBmcm9tIHRoZSBleGFtcGxlIGFib3ZlOlxyXG4gKlxyXG4gKiBgYGBqc1xyXG4gKiBuZ01vZHVsZS5hbmltYXRpb24oJy5mb2xkLWFuaW1hdGlvbicsIFsnJGFuaW1hdGVDc3MnLCBmdW5jdGlvbigkYW5pbWF0ZUNzcykge1xyXG4gKiAgIHJldHVybiB7XHJcbiAqICAgICBlbnRlcjogZnVuY3Rpb24oZWxlbWVudCwgZG9uZUZuKSB7XHJcbiAqICAgICAgIHZhciBoZWlnaHQgPSBlbGVtZW50WzBdLm9mZnNldEhlaWdodDtcclxuICogICAgICAgcmV0dXJuICRhbmltYXRlQ3NzKGVsZW1lbnQsIHtcclxuICogICAgICAgICBhZGRDbGFzczogJ3JlZCBsYXJnZS10ZXh0IHB1bHNlLXR3aWNlJyxcclxuICogICAgICAgICBlYXNpbmc6ICdlYXNlLW91dCcsXHJcbiAqICAgICAgICAgZnJvbTogeyBoZWlnaHQ6JzBweCcgfSxcclxuICogICAgICAgICB0bzogeyBoZWlnaHQ6aGVpZ2h0ICsgJ3B4JyB9LFxyXG4gKiAgICAgICAgIGR1cmF0aW9uOiAxIC8vIG9uZSBzZWNvbmRcclxuICogICAgICAgfSk7XHJcbiAqICAgICB9XHJcbiAqICAgfVxyXG4gKiB9XSk7XHJcbiAqIGBgYFxyXG4gKlxyXG4gKiBTaW5jZSB3ZSdyZSBhZGRpbmcvcmVtb3ZpbmcgQ1NTIGNsYXNzZXMgdGhlbiB0aGUgQ1NTIHRyYW5zaXRpb24gd2lsbCBhbHNvIHBpY2sgdGhvc2UgdXA6XHJcbiAqXHJcbiAqIGBgYGNzc1xyXG4gKiAvJiM0Mjsgc2luY2UgYSBoYXJkY29kZWQgZHVyYXRpb24gdmFsdWUgb2YgMSB3YXMgcHJvdmlkZWQgaW4gdGhlIEphdmFTY3JpcHQgYW5pbWF0aW9uIGNvZGUsXHJcbiAqIHRoZSBDU1MgY2xhc3NlcyBiZWxvdyB3aWxsIGJlIHRyYW5zaXRpb25lZCBkZXNwaXRlIHRoZW0gYmVpbmcgZGVmaW5lZCBhcyByZWd1bGFyIENTUyBjbGFzc2VzICYjNDI7L1xyXG4gKiAucmVkIHsgYmFja2dyb3VuZDpyZWQ7IH1cclxuICogLmxhcmdlLXRleHQgeyBmb250LXNpemU6MjBweDsgfVxyXG4gKlxyXG4gKiAvJiM0Mjsgd2UgY2FuIGFsc28gdXNlIGEga2V5ZnJhbWUgYW5pbWF0aW9uIGFuZCAkYW5pbWF0ZUNzcyB3aWxsIG1ha2UgaXQgd29yayBhbG9uZ3NpZGUgdGhlIHRyYW5zaXRpb24gJiM0MjsvXHJcbiAqIC5wdWxzZS10d2ljZSB7XHJcbiAqICAgYW5pbWF0aW9uOiAwLjVzIHB1bHNlIGxpbmVhciAyO1xyXG4gKiAgIC13ZWJraXQtYW5pbWF0aW9uOiAwLjVzIHB1bHNlIGxpbmVhciAyO1xyXG4gKiB9XHJcbiAqXHJcbiAqIEBrZXlmcmFtZXMgcHVsc2Uge1xyXG4gKiAgIGZyb20geyB0cmFuc2Zvcm06IHNjYWxlKDAuNSk7IH1cclxuICogICB0byB7IHRyYW5zZm9ybTogc2NhbGUoMS41KTsgfVxyXG4gKiB9XHJcbiAqXHJcbiAqIEAtd2Via2l0LWtleWZyYW1lcyBwdWxzZSB7XHJcbiAqICAgZnJvbSB7IC13ZWJraXQtdHJhbnNmb3JtOiBzY2FsZSgwLjUpOyB9XHJcbiAqICAgdG8geyAtd2Via2l0LXRyYW5zZm9ybTogc2NhbGUoMS41KTsgfVxyXG4gKiB9XHJcbiAqIGBgYFxyXG4gKlxyXG4gKiBHaXZlbiB0aGlzIGNvbXBsZXggY29tYmluYXRpb24gb2YgQ1NTIGNsYXNzZXMsIHN0eWxlcyBhbmQgb3B0aW9ucywgYCRhbmltYXRlQ3NzYCB3aWxsIGZpZ3VyZSBldmVyeXRoaW5nIG91dCBhbmQgbWFrZSB0aGUgYW5pbWF0aW9uIGhhcHBlbi5cclxuICpcclxuICogIyMgSG93IHRoZSBPcHRpb25zIGFyZSBoYW5kbGVkXHJcbiAqXHJcbiAqIGAkYW5pbWF0ZUNzc2AgaXMgdmVyeSB2ZXJzYXRpbGUgYW5kIGludGVsbGlnZW50IHdoZW4gaXQgY29tZXMgdG8gZmlndXJpbmcgb3V0IHdoYXQgY29uZmlndXJhdGlvbnMgdG8gYXBwbHkgdG8gdGhlIGVsZW1lbnQgdG8gZW5zdXJlIHRoZSBhbmltYXRpb25cclxuICogd29ya3Mgd2l0aCB0aGUgb3B0aW9ucyBwcm92aWRlZC4gU2F5IGZvciBleGFtcGxlIHdlIHdlcmUgYWRkaW5nIGEgY2xhc3MgdGhhdCBjb250YWluZWQgYSBrZXlmcmFtZSB2YWx1ZSBhbmQgd2Ugd2FudGVkIHRvIGFsc28gYW5pbWF0ZSBzb21lIGlubGluZVxyXG4gKiBzdHlsZXMgdXNpbmcgdGhlIGBmcm9tYCBhbmQgYHRvYCBwcm9wZXJ0aWVzLlxyXG4gKlxyXG4gKiBgYGBqc1xyXG4gKiB2YXIgYW5pbWF0b3IgPSAkYW5pbWF0ZUNzcyhlbGVtZW50LCB7XHJcbiAqICAgZnJvbTogeyBiYWNrZ3JvdW5kOidyZWQnIH0sXHJcbiAqICAgdG86IHsgYmFja2dyb3VuZDonYmx1ZScgfVxyXG4gKiB9KTtcclxuICogYW5pbWF0b3Iuc3RhcnQoKTtcclxuICogYGBgXHJcbiAqXHJcbiAqIGBgYGNzc1xyXG4gKiAucm90YXRpbmctYW5pbWF0aW9uIHtcclxuICogICBhbmltYXRpb246MC41cyByb3RhdGUgbGluZWFyO1xyXG4gKiAgIC13ZWJraXQtYW5pbWF0aW9uOjAuNXMgcm90YXRlIGxpbmVhcjtcclxuICogfVxyXG4gKlxyXG4gKiBAa2V5ZnJhbWVzIHJvdGF0ZSB7XHJcbiAqICAgZnJvbSB7IHRyYW5zZm9ybTogcm90YXRlKDBkZWcpOyB9XHJcbiAqICAgdG8geyB0cmFuc2Zvcm06IHJvdGF0ZSgzNjBkZWcpOyB9XHJcbiAqIH1cclxuICpcclxuICogQC13ZWJraXQta2V5ZnJhbWVzIHJvdGF0ZSB7XHJcbiAqICAgZnJvbSB7IC13ZWJraXQtdHJhbnNmb3JtOiByb3RhdGUoMGRlZyk7IH1cclxuICogICB0byB7IC13ZWJraXQtdHJhbnNmb3JtOiByb3RhdGUoMzYwZGVnKTsgfVxyXG4gKiB9XHJcbiAqIGBgYFxyXG4gKlxyXG4gKiBUaGUgbWlzc2luZyBwaWVjZXMgaGVyZSBhcmUgdGhhdCB3ZSBkbyBub3QgaGF2ZSBhIHRyYW5zaXRpb24gc2V0ICh3aXRoaW4gdGhlIENTUyBjb2RlIG5vciB3aXRoaW4gdGhlIGAkYW5pbWF0ZUNzc2Agb3B0aW9ucykgYW5kIHRoZSBkdXJhdGlvbiBvZiB0aGUgYW5pbWF0aW9uIGlzXHJcbiAqIGdvaW5nIHRvIGJlIGRldGVjdGVkIGZyb20gd2hhdCB0aGUga2V5ZnJhbWUgc3R5bGVzIG9uIHRoZSBDU1MgY2xhc3MgYXJlLiBJbiB0aGlzIGV2ZW50LCBgJGFuaW1hdGVDc3NgIHdpbGwgYXV0b21hdGljYWxseSBjcmVhdGUgYW4gaW5saW5lIHRyYW5zaXRpb25cclxuICogc3R5bGUgbWF0Y2hpbmcgdGhlIGR1cmF0aW9uIGRldGVjdGVkIGZyb20gdGhlIGtleWZyYW1lIHN0eWxlICh3aGljaCBpcyBwcmVzZW50IGluIHRoZSBDU1MgY2xhc3MgdGhhdCBpcyBiZWluZyBhZGRlZCkgYW5kIHRoZW4gcHJlcGFyZSBib3RoIHRoZSB0cmFuc2l0aW9uXHJcbiAqIGFuZCBrZXlmcmFtZSBhbmltYXRpb25zIHRvIHJ1biBpbiBwYXJhbGxlbCBvbiB0aGUgZWxlbWVudC4gVGhlbiB3aGVuIHRoZSBhbmltYXRpb24gaXMgdW5kZXJ3YXkgdGhlIHByb3ZpZGVkIGBmcm9tYCBhbmQgYHRvYCBDU1Mgc3R5bGVzIHdpbGwgYmUgYXBwbGllZFxyXG4gKiBhbmQgc3ByZWFkIGFjcm9zcyB0aGUgdHJhbnNpdGlvbiBhbmQga2V5ZnJhbWUgYW5pbWF0aW9uLlxyXG4gKlxyXG4gKiAjIyBXaGF0IGlzIHJldHVybmVkXHJcbiAqXHJcbiAqIGAkYW5pbWF0ZUNzc2Agd29ya3MgaW4gdHdvIHN0YWdlczogYSBwcmVwYXJhdGlvbiBwaGFzZSBhbmQgYW4gYW5pbWF0aW9uIHBoYXNlLiBUaGVyZWZvcmUgd2hlbiBgJGFuaW1hdGVDc3NgIGlzIGZpcnN0IGNhbGxlZCBpdCB3aWxsIE5PVCBhY3R1YWxseVxyXG4gKiBzdGFydCB0aGUgYW5pbWF0aW9uLiBBbGwgdGhhdCBpcyBnb2luZyBvbiBoZXJlIGlzIHRoYXQgdGhlIGVsZW1lbnQgaXMgYmVpbmcgcHJlcGFyZWQgZm9yIHRoZSBhbmltYXRpb24gKHdoaWNoIG1lYW5zIHRoYXQgdGhlIGdlbmVyYXRlZCBDU1MgY2xhc3NlcyBhcmVcclxuICogYWRkZWQgYW5kIHJlbW92ZWQgb24gdGhlIGVsZW1lbnQpLiBPbmNlIGAkYW5pbWF0ZUNzc2AgaXMgY2FsbGVkIGl0IHdpbGwgcmV0dXJuIGFuIG9iamVjdCB3aXRoIHRoZSBmb2xsb3dpbmcgcHJvcGVydGllczpcclxuICpcclxuICogYGBganNcclxuICogdmFyIGFuaW1hdG9yID0gJGFuaW1hdGVDc3MoZWxlbWVudCwgeyAuLi4gfSk7XHJcbiAqIGBgYFxyXG4gKlxyXG4gKiBOb3cgd2hhdCBkbyB0aGUgY29udGVudHMgb2Ygb3VyIGBhbmltYXRvcmAgdmFyaWFibGUgbG9vayBsaWtlOlxyXG4gKlxyXG4gKiBgYGBqc1xyXG4gKiB7XHJcbiAqICAgLy8gc3RhcnRzIHRoZSBhbmltYXRpb25cclxuICogICBzdGFydDogRnVuY3Rpb24sXHJcbiAqXHJcbiAqICAgLy8gZW5kcyAoYWJvcnRzKSB0aGUgYW5pbWF0aW9uXHJcbiAqICAgZW5kOiBGdW5jdGlvblxyXG4gKiB9XHJcbiAqIGBgYFxyXG4gKlxyXG4gKiBUbyBhY3R1YWxseSBzdGFydCB0aGUgYW5pbWF0aW9uIHdlIG5lZWQgdG8gcnVuIGBhbmltYXRpb24uc3RhcnQoKWAgd2hpY2ggd2lsbCB0aGVuIHJldHVybiBhIHByb21pc2UgdGhhdCB3ZSBjYW4gaG9vayBpbnRvIHRvIGRldGVjdCB3aGVuIHRoZSBhbmltYXRpb24gZW5kcy5cclxuICogSWYgd2UgY2hvb3NlIG5vdCB0byBydW4gdGhlIGFuaW1hdGlvbiB0aGVuIHdlIE1VU1QgcnVuIGBhbmltYXRpb24uZW5kKClgIHRvIHBlcmZvcm0gYSBjbGVhbnVwIG9uIHRoZSBlbGVtZW50IChzaW5jZSBzb21lIENTUyBjbGFzc2VzIGFuZCBzdHlsZXMgbWF5IGhhdmUgYmVlblxyXG4gKiBhcHBsaWVkIHRvIHRoZSBlbGVtZW50IGR1cmluZyB0aGUgcHJlcGFyYXRpb24gcGhhc2UpLiBOb3RlIHRoYXQgYWxsIG90aGVyIHByb3BlcnRpZXMgc3VjaCBhcyBkdXJhdGlvbiwgZGVsYXksIHRyYW5zaXRpb25zIGFuZCBrZXlmcmFtZXMgYXJlIGp1c3QgcHJvcGVydGllc1xyXG4gKiBhbmQgdGhhdCBjaGFuZ2luZyB0aGVtIHdpbGwgbm90IHJlY29uZmlndXJlIHRoZSBwYXJhbWV0ZXJzIG9mIHRoZSBhbmltYXRpb24uXHJcbiAqXHJcbiAqICMjIyBydW5uZXIuZG9uZSgpIHZzIHJ1bm5lci50aGVuKClcclxuICogSXQgaXMgZG9jdW1lbnRlZCB0aGF0IGBhbmltYXRpb24uc3RhcnQoKWAgd2lsbCByZXR1cm4gYSBwcm9taXNlIG9iamVjdCBhbmQgdGhpcyBpcyB0cnVlLCBob3dldmVyLCB0aGVyZSBpcyBhbHNvIGFuIGFkZGl0aW9uYWwgbWV0aG9kIGF2YWlsYWJsZSBvbiB0aGVcclxuICogcnVubmVyIGNhbGxlZCBgLmRvbmUoY2FsbGJhY2tGbilgLiBUaGUgZG9uZSBtZXRob2Qgd29ya3MgdGhlIHNhbWUgYXMgYC5maW5hbGx5KGNhbGxiYWNrRm4pYCwgaG93ZXZlciwgaXQgZG9lcyAqKm5vdCB0cmlnZ2VyIGEgZGlnZXN0IHRvIG9jY3VyKiouXHJcbiAqIFRoZXJlZm9yZSwgZm9yIHBlcmZvcm1hbmNlIHJlYXNvbnMsIGl0J3MgYWx3YXlzIGJlc3QgdG8gdXNlIGBydW5uZXIuZG9uZShjYWxsYmFjaylgIGluc3RlYWQgb2YgYHJ1bm5lci50aGVuKClgLCBgcnVubmVyLmNhdGNoKClgIG9yIGBydW5uZXIuZmluYWxseSgpYFxyXG4gKiB1bmxlc3MgeW91IHJlYWxseSBuZWVkIGEgZGlnZXN0IHRvIGtpY2sgb2ZmIGFmdGVyd2FyZHMuXHJcbiAqXHJcbiAqIEtlZXAgaW4gbWluZCB0aGF0LCB0byBtYWtlIHRoaXMgZWFzaWVyLCBuZ0FuaW1hdGUgaGFzIHR3ZWFrZWQgdGhlIEpTIGFuaW1hdGlvbnMgQVBJIHRvIHJlY29nbml6ZSB3aGVuIGEgcnVubmVyIGluc3RhbmNlIGlzIHJldHVybmVkIGZyb20gJGFuaW1hdGVDc3NcclxuICogKHNvIHRoZXJlIGlzIG5vIG5lZWQgdG8gY2FsbCBgcnVubmVyLmRvbmUoZG9uZUZuKWAgaW5zaWRlIG9mIHlvdXIgSmF2YVNjcmlwdCBhbmltYXRpb24gY29kZSkuXHJcbiAqIENoZWNrIHRoZSB7QGxpbmsgbmdBbmltYXRlLiRhbmltYXRlQ3NzI3VzYWdlIGFuaW1hdGlvbiBjb2RlIGFib3ZlfSB0byBzZWUgaG93IHRoaXMgd29ya3MuXHJcbiAqXHJcbiAqIEBwYXJhbSB7RE9NRWxlbWVudH0gZWxlbWVudCB0aGUgZWxlbWVudCB0aGF0IHdpbGwgYmUgYW5pbWF0ZWRcclxuICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMgdGhlIGFuaW1hdGlvbi1yZWxhdGVkIG9wdGlvbnMgdGhhdCB3aWxsIGJlIGFwcGxpZWQgZHVyaW5nIHRoZSBhbmltYXRpb25cclxuICpcclxuICogKiBgZXZlbnRgIC0gVGhlIERPTSBldmVudCAoZS5nLiBlbnRlciwgbGVhdmUsIG1vdmUpLiBXaGVuIHVzZWQsIGEgZ2VuZXJhdGVkIENTUyBjbGFzcyBvZiBgbmctRVZFTlRgIGFuZCBgbmctRVZFTlQtYWN0aXZlYCB3aWxsIGJlIGFwcGxpZWRcclxuICogdG8gdGhlIGVsZW1lbnQgZHVyaW5nIHRoZSBhbmltYXRpb24uIE11bHRpcGxlIGV2ZW50cyBjYW4gYmUgcHJvdmlkZWQgd2hlbiBzcGFjZXMgYXJlIHVzZWQgYXMgYSBzZXBhcmF0b3IuIChOb3RlIHRoYXQgdGhpcyB3aWxsIG5vdCBwZXJmb3JtIGFueSBET00gb3BlcmF0aW9uLilcclxuICogKiBgc3RydWN0dXJhbGAgLSBJbmRpY2F0ZXMgdGhhdCB0aGUgYG5nLWAgcHJlZml4IHdpbGwgYmUgYWRkZWQgdG8gdGhlIGV2ZW50IGNsYXNzLiBTZXR0aW5nIHRvIGBmYWxzZWAgb3Igb21pdHRpbmcgd2lsbCB0dXJuIGBuZy1FVkVOVGAgYW5kXHJcbiAqIGBuZy1FVkVOVC1hY3RpdmVgIGluIGBFVkVOVGAgYW5kIGBFVkVOVC1hY3RpdmVgLiBVbnVzZWQgaWYgYGV2ZW50YCBpcyBvbWl0dGVkLlxyXG4gKiAqIGBlYXNpbmdgIC0gVGhlIENTUyBlYXNpbmcgdmFsdWUgdGhhdCB3aWxsIGJlIGFwcGxpZWQgdG8gdGhlIHRyYW5zaXRpb24gb3Iga2V5ZnJhbWUgYW5pbWF0aW9uIChvciBib3RoKS5cclxuICogKiBgdHJhbnNpdGlvblN0eWxlYCAtIFRoZSByYXcgQ1NTIHRyYW5zaXRpb24gc3R5bGUgdGhhdCB3aWxsIGJlIHVzZWQgKGUuZy4gYDFzIGxpbmVhciBhbGxgKS5cclxuICogKiBga2V5ZnJhbWVTdHlsZWAgLSBUaGUgcmF3IENTUyBrZXlmcmFtZSBhbmltYXRpb24gc3R5bGUgdGhhdCB3aWxsIGJlIHVzZWQgKGUuZy4gYDFzIG15X2FuaW1hdGlvbiBsaW5lYXJgKS5cclxuICogKiBgZnJvbWAgLSBUaGUgc3RhcnRpbmcgQ1NTIHN0eWxlcyAoYSBrZXkvdmFsdWUgb2JqZWN0KSB0aGF0IHdpbGwgYmUgYXBwbGllZCBhdCB0aGUgc3RhcnQgb2YgdGhlIGFuaW1hdGlvbi5cclxuICogKiBgdG9gIC0gVGhlIGVuZGluZyBDU1Mgc3R5bGVzIChhIGtleS92YWx1ZSBvYmplY3QpIHRoYXQgd2lsbCBiZSBhcHBsaWVkIGFjcm9zcyB0aGUgYW5pbWF0aW9uIHZpYSBhIENTUyB0cmFuc2l0aW9uLlxyXG4gKiAqIGBhZGRDbGFzc2AgLSBBIHNwYWNlIHNlcGFyYXRlZCBsaXN0IG9mIENTUyBjbGFzc2VzIHRoYXQgd2lsbCBiZSBhZGRlZCB0byB0aGUgZWxlbWVudCBhbmQgc3ByZWFkIGFjcm9zcyB0aGUgYW5pbWF0aW9uLlxyXG4gKiAqIGByZW1vdmVDbGFzc2AgLSBBIHNwYWNlIHNlcGFyYXRlZCBsaXN0IG9mIENTUyBjbGFzc2VzIHRoYXQgd2lsbCBiZSByZW1vdmVkIGZyb20gdGhlIGVsZW1lbnQgYW5kIHNwcmVhZCBhY3Jvc3MgdGhlIGFuaW1hdGlvbi5cclxuICogKiBgZHVyYXRpb25gIC0gQSBudW1iZXIgdmFsdWUgcmVwcmVzZW50aW5nIHRoZSB0b3RhbCBkdXJhdGlvbiBvZiB0aGUgdHJhbnNpdGlvbiBhbmQvb3Iga2V5ZnJhbWUgKG5vdGUgdGhhdCBhIHZhbHVlIG9mIDEgaXMgMTAwMG1zKS4gSWYgYSB2YWx1ZSBvZiBgMGBcclxuICogaXMgcHJvdmlkZWQgdGhlbiB0aGUgYW5pbWF0aW9uIHdpbGwgYmUgc2tpcHBlZCBlbnRpcmVseS5cclxuICogKiBgZGVsYXlgIC0gQSBudW1iZXIgdmFsdWUgcmVwcmVzZW50aW5nIHRoZSB0b3RhbCBkZWxheSBvZiB0aGUgdHJhbnNpdGlvbiBhbmQvb3Iga2V5ZnJhbWUgKG5vdGUgdGhhdCBhIHZhbHVlIG9mIDEgaXMgMTAwMG1zKS4gSWYgYSB2YWx1ZSBvZiBgdHJ1ZWAgaXNcclxuICogdXNlZCB0aGVuIHdoYXRldmVyIGRlbGF5IHZhbHVlIGlzIGRldGVjdGVkIGZyb20gdGhlIENTUyBjbGFzc2VzIHdpbGwgYmUgbWlycm9yZWQgb24gdGhlIGVsZW1lbnRzIHN0eWxlcyAoZS5nLiBieSBzZXR0aW5nIGRlbGF5IHRydWUgdGhlbiB0aGUgc3R5bGUgdmFsdWVcclxuICogb2YgdGhlIGVsZW1lbnQgd2lsbCBiZSBgdHJhbnNpdGlvbi1kZWxheTogREVURUNURURfVkFMVUVgKS4gVXNpbmcgYHRydWVgIGlzIHVzZWZ1bCB3aGVuIHlvdSB3YW50IHRoZSBDU1MgY2xhc3NlcyBhbmQgaW5saW5lIHN0eWxlcyB0byBhbGwgc2hhcmUgdGhlIHNhbWVcclxuICogQ1NTIGRlbGF5IHZhbHVlLlxyXG4gKiAqIGBzdGFnZ2VyYCAtIEEgbnVtZXJpYyB0aW1lIHZhbHVlIHJlcHJlc2VudGluZyB0aGUgZGVsYXkgYmV0d2VlbiBzdWNjZXNzaXZlbHkgYW5pbWF0ZWQgZWxlbWVudHNcclxuICogKHtAbGluayBuZ0FuaW1hdGUjY3NzLXN0YWdnZXJpbmctYW5pbWF0aW9ucyBDbGljayBoZXJlIHRvIGxlYXJuIGhvdyBDU1MtYmFzZWQgc3RhZ2dlcmluZyB3b3JrcyBpbiBuZ0FuaW1hdGUufSlcclxuICogKiBgc3RhZ2dlckluZGV4YCAtIFRoZSBudW1lcmljIGluZGV4IHJlcHJlc2VudGluZyB0aGUgc3RhZ2dlciBpdGVtIChlLmcuIGEgdmFsdWUgb2YgNSBpcyBlcXVhbCB0byB0aGUgc2l4dGggaXRlbSBpbiB0aGUgc3RhZ2dlcjsgdGhlcmVmb3JlIHdoZW4gYVxyXG4gKiAgIGBzdGFnZ2VyYCBvcHRpb24gdmFsdWUgb2YgYDAuMWAgaXMgdXNlZCB0aGVuIHRoZXJlIHdpbGwgYmUgYSBzdGFnZ2VyIGRlbGF5IG9mIGA2MDBtc2ApXHJcbiAqICogYGFwcGx5Q2xhc3Nlc0Vhcmx5YCAtIFdoZXRoZXIgb3Igbm90IHRoZSBjbGFzc2VzIGJlaW5nIGFkZGVkIG9yIHJlbW92ZWQgd2lsbCBiZSB1c2VkIHdoZW4gZGV0ZWN0aW5nIHRoZSBhbmltYXRpb24uIFRoaXMgaXMgc2V0IGJ5IGAkYW5pbWF0ZWAgd2hlbiBlbnRlci9sZWF2ZS9tb3ZlIGFuaW1hdGlvbnMgYXJlIGZpcmVkIHRvIGVuc3VyZSB0aGF0IHRoZSBDU1MgY2xhc3NlcyBhcmUgcmVzb2x2ZWQgaW4gdGltZS4gKE5vdGUgdGhhdCB0aGlzIHdpbGwgcHJldmVudCBhbnkgdHJhbnNpdGlvbnMgZnJvbSBvY2N1cnJpbmcgb24gdGhlIGNsYXNzZXMgYmVpbmcgYWRkZWQgYW5kIHJlbW92ZWQuKVxyXG4gKiAqIGBjbGVhbnVwU3R5bGVzYCAtIFdoZXRoZXIgb3Igbm90IHRoZSBwcm92aWRlZCBgZnJvbWAgYW5kIGB0b2Agc3R5bGVzIHdpbGwgYmUgcmVtb3ZlZCBvbmNlXHJcbiAqICAgIHRoZSBhbmltYXRpb24gaXMgY2xvc2VkLiBUaGlzIGlzIHVzZWZ1bCBmb3Igd2hlbiB0aGUgc3R5bGVzIGFyZSB1c2VkIHB1cmVseSBmb3IgdGhlIHNha2Ugb2ZcclxuICogICAgdGhlIGFuaW1hdGlvbiBhbmQgZG8gbm90IGhhdmUgYSBsYXN0aW5nIHZpc3VhbCBlZmZlY3Qgb24gdGhlIGVsZW1lbnQgKGUuZy4gYSBjb2xsYXBzZSBhbmQgb3BlbiBhbmltYXRpb24pLlxyXG4gKiAgICBCeSBkZWZhdWx0IHRoaXMgdmFsdWUgaXMgc2V0IHRvIGBmYWxzZWAuXHJcbiAqXHJcbiAqIEByZXR1cm4ge29iamVjdH0gYW4gb2JqZWN0IHdpdGggc3RhcnQgYW5kIGVuZCBtZXRob2RzIGFuZCBkZXRhaWxzIGFib3V0IHRoZSBhbmltYXRpb24uXHJcbiAqXHJcbiAqICogYHN0YXJ0YCAtIFRoZSBtZXRob2QgdG8gc3RhcnQgdGhlIGFuaW1hdGlvbi4gVGhpcyB3aWxsIHJldHVybiBhIGBQcm9taXNlYCB3aGVuIGNhbGxlZC5cclxuICogKiBgZW5kYCAtIFRoaXMgbWV0aG9kIHdpbGwgY2FuY2VsIHRoZSBhbmltYXRpb24gYW5kIHJlbW92ZSBhbGwgYXBwbGllZCBDU1MgY2xhc3NlcyBhbmQgc3R5bGVzLlxyXG4gKi9cclxudmFyIE9ORV9TRUNPTkQgPSAxMDAwO1xyXG52YXIgQkFTRV9URU4gPSAxMDtcclxuXHJcbnZhciBFTEFQU0VEX1RJTUVfTUFYX0RFQ0lNQUxfUExBQ0VTID0gMztcclxudmFyIENMT1NJTkdfVElNRV9CVUZGRVIgPSAxLjU7XHJcblxyXG52YXIgREVURUNUX0NTU19QUk9QRVJUSUVTID0ge1xyXG4gIHRyYW5zaXRpb25EdXJhdGlvbjogICAgICBUUkFOU0lUSU9OX0RVUkFUSU9OX1BST1AsXHJcbiAgdHJhbnNpdGlvbkRlbGF5OiAgICAgICAgIFRSQU5TSVRJT05fREVMQVlfUFJPUCxcclxuICB0cmFuc2l0aW9uUHJvcGVydHk6ICAgICAgVFJBTlNJVElPTl9QUk9QICsgUFJPUEVSVFlfS0VZLFxyXG4gIGFuaW1hdGlvbkR1cmF0aW9uOiAgICAgICBBTklNQVRJT05fRFVSQVRJT05fUFJPUCxcclxuICBhbmltYXRpb25EZWxheTogICAgICAgICAgQU5JTUFUSU9OX0RFTEFZX1BST1AsXHJcbiAgYW5pbWF0aW9uSXRlcmF0aW9uQ291bnQ6IEFOSU1BVElPTl9QUk9QICsgQU5JTUFUSU9OX0lURVJBVElPTl9DT1VOVF9LRVlcclxufTtcclxuXHJcbnZhciBERVRFQ1RfU1RBR0dFUl9DU1NfUFJPUEVSVElFUyA9IHtcclxuICB0cmFuc2l0aW9uRHVyYXRpb246ICAgICAgVFJBTlNJVElPTl9EVVJBVElPTl9QUk9QLFxyXG4gIHRyYW5zaXRpb25EZWxheTogICAgICAgICBUUkFOU0lUSU9OX0RFTEFZX1BST1AsXHJcbiAgYW5pbWF0aW9uRHVyYXRpb246ICAgICAgIEFOSU1BVElPTl9EVVJBVElPTl9QUk9QLFxyXG4gIGFuaW1hdGlvbkRlbGF5OiAgICAgICAgICBBTklNQVRJT05fREVMQVlfUFJPUFxyXG59O1xyXG5cclxuZnVuY3Rpb24gZ2V0Q3NzS2V5ZnJhbWVEdXJhdGlvblN0eWxlKGR1cmF0aW9uKSB7XHJcbiAgcmV0dXJuIFtBTklNQVRJT05fRFVSQVRJT05fUFJPUCwgZHVyYXRpb24gKyAncyddO1xyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRDc3NEZWxheVN0eWxlKGRlbGF5LCBpc0tleWZyYW1lQW5pbWF0aW9uKSB7XHJcbiAgdmFyIHByb3AgPSBpc0tleWZyYW1lQW5pbWF0aW9uID8gQU5JTUFUSU9OX0RFTEFZX1BST1AgOiBUUkFOU0lUSU9OX0RFTEFZX1BST1A7XHJcbiAgcmV0dXJuIFtwcm9wLCBkZWxheSArICdzJ107XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNvbXB1dGVDc3NTdHlsZXMoJHdpbmRvdywgZWxlbWVudCwgcHJvcGVydGllcykge1xyXG4gIHZhciBzdHlsZXMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xyXG4gIHZhciBkZXRlY3RlZFN0eWxlcyA9ICR3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShlbGVtZW50KSB8fCB7fTtcclxuICBmb3JFYWNoKHByb3BlcnRpZXMsIGZ1bmN0aW9uKGZvcm1hbFN0eWxlTmFtZSwgYWN0dWFsU3R5bGVOYW1lKSB7XHJcbiAgICB2YXIgdmFsID0gZGV0ZWN0ZWRTdHlsZXNbZm9ybWFsU3R5bGVOYW1lXTtcclxuICAgIGlmICh2YWwpIHtcclxuICAgICAgdmFyIGMgPSB2YWwuY2hhckF0KDApO1xyXG5cclxuICAgICAgLy8gb25seSBudW1lcmljYWwtYmFzZWQgdmFsdWVzIGhhdmUgYSBuZWdhdGl2ZSBzaWduIG9yIGRpZ2l0IGFzIHRoZSBmaXJzdCB2YWx1ZVxyXG4gICAgICBpZiAoYyA9PT0gJy0nIHx8IGMgPT09ICcrJyB8fCBjID49IDApIHtcclxuICAgICAgICB2YWwgPSBwYXJzZU1heFRpbWUodmFsKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gYnkgc2V0dGluZyB0aGlzIHRvIG51bGwgaW4gdGhlIGV2ZW50IHRoYXQgdGhlIGRlbGF5IGlzIG5vdCBzZXQgb3IgaXMgc2V0IGRpcmVjdGx5IGFzIDBcclxuICAgICAgLy8gdGhlbiB3ZSBjYW4gc3RpbGwgYWxsb3cgZm9yIG5lZ2F0aXZlIHZhbHVlcyB0byBiZSB1c2VkIGxhdGVyIG9uIGFuZCBub3QgbWlzdGFrZSB0aGlzXHJcbiAgICAgIC8vIHZhbHVlIGZvciBiZWluZyBncmVhdGVyIHRoYW4gYW55IG90aGVyIG5lZ2F0aXZlIHZhbHVlLlxyXG4gICAgICBpZiAodmFsID09PSAwKSB7XHJcbiAgICAgICAgdmFsID0gbnVsbDtcclxuICAgICAgfVxyXG4gICAgICBzdHlsZXNbYWN0dWFsU3R5bGVOYW1lXSA9IHZhbDtcclxuICAgIH1cclxuICB9KTtcclxuXHJcbiAgcmV0dXJuIHN0eWxlcztcclxufVxyXG5cclxuZnVuY3Rpb24gcGFyc2VNYXhUaW1lKHN0cikge1xyXG4gIHZhciBtYXhWYWx1ZSA9IDA7XHJcbiAgdmFyIHZhbHVlcyA9IHN0ci5zcGxpdCgvXFxzKixcXHMqLyk7XHJcbiAgZm9yRWFjaCh2YWx1ZXMsIGZ1bmN0aW9uKHZhbHVlKSB7XHJcbiAgICAvLyBpdCdzIGFsd2F5cyBzYWZlIHRvIGNvbnNpZGVyIG9ubHkgc2Vjb25kIHZhbHVlcyBhbmQgb21pdCBgbXNgIHZhbHVlcyBzaW5jZVxyXG4gICAgLy8gZ2V0Q29tcHV0ZWRTdHlsZSB3aWxsIGFsd2F5cyBoYW5kbGUgdGhlIGNvbnZlcnNpb24gZm9yIHVzXHJcbiAgICBpZiAodmFsdWUuY2hhckF0KHZhbHVlLmxlbmd0aCAtIDEpID09ICdzJykge1xyXG4gICAgICB2YWx1ZSA9IHZhbHVlLnN1YnN0cmluZygwLCB2YWx1ZS5sZW5ndGggLSAxKTtcclxuICAgIH1cclxuICAgIHZhbHVlID0gcGFyc2VGbG9hdCh2YWx1ZSkgfHwgMDtcclxuICAgIG1heFZhbHVlID0gbWF4VmFsdWUgPyBNYXRoLm1heCh2YWx1ZSwgbWF4VmFsdWUpIDogdmFsdWU7XHJcbiAgfSk7XHJcbiAgcmV0dXJuIG1heFZhbHVlO1xyXG59XHJcblxyXG5mdW5jdGlvbiB0cnV0aHlUaW1pbmdWYWx1ZSh2YWwpIHtcclxuICByZXR1cm4gdmFsID09PSAwIHx8IHZhbCAhPSBudWxsO1xyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRDc3NUcmFuc2l0aW9uRHVyYXRpb25TdHlsZShkdXJhdGlvbiwgYXBwbHlPbmx5RHVyYXRpb24pIHtcclxuICB2YXIgc3R5bGUgPSBUUkFOU0lUSU9OX1BST1A7XHJcbiAgdmFyIHZhbHVlID0gZHVyYXRpb24gKyAncyc7XHJcbiAgaWYgKGFwcGx5T25seUR1cmF0aW9uKSB7XHJcbiAgICBzdHlsZSArPSBEVVJBVElPTl9LRVk7XHJcbiAgfSBlbHNlIHtcclxuICAgIHZhbHVlICs9ICcgbGluZWFyIGFsbCc7XHJcbiAgfVxyXG4gIHJldHVybiBbc3R5bGUsIHZhbHVlXTtcclxufVxyXG5cclxuZnVuY3Rpb24gY3JlYXRlTG9jYWxDYWNoZUxvb2t1cCgpIHtcclxuICB2YXIgY2FjaGUgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xyXG4gIHJldHVybiB7XHJcbiAgICBmbHVzaDogZnVuY3Rpb24oKSB7XHJcbiAgICAgIGNhY2hlID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcclxuICAgIH0sXHJcblxyXG4gICAgY291bnQ6IGZ1bmN0aW9uKGtleSkge1xyXG4gICAgICB2YXIgZW50cnkgPSBjYWNoZVtrZXldO1xyXG4gICAgICByZXR1cm4gZW50cnkgPyBlbnRyeS50b3RhbCA6IDA7XHJcbiAgICB9LFxyXG5cclxuICAgIGdldDogZnVuY3Rpb24oa2V5KSB7XHJcbiAgICAgIHZhciBlbnRyeSA9IGNhY2hlW2tleV07XHJcbiAgICAgIHJldHVybiBlbnRyeSAmJiBlbnRyeS52YWx1ZTtcclxuICAgIH0sXHJcblxyXG4gICAgcHV0OiBmdW5jdGlvbihrZXksIHZhbHVlKSB7XHJcbiAgICAgIGlmICghY2FjaGVba2V5XSkge1xyXG4gICAgICAgIGNhY2hlW2tleV0gPSB7IHRvdGFsOiAxLCB2YWx1ZTogdmFsdWUgfTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBjYWNoZVtrZXldLnRvdGFsKys7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9O1xyXG59XHJcblxyXG4vLyB3ZSBkbyBub3QgcmVhc3NpZ24gYW4gYWxyZWFkeSBwcmVzZW50IHN0eWxlIHZhbHVlIHNpbmNlXHJcbi8vIGlmIHdlIGRldGVjdCB0aGUgc3R5bGUgcHJvcGVydHkgdmFsdWUgYWdhaW4gd2UgbWF5IGJlXHJcbi8vIGRldGVjdGluZyBzdHlsZXMgdGhhdCB3ZXJlIGFkZGVkIHZpYSB0aGUgYGZyb21gIHN0eWxlcy5cclxuLy8gV2UgbWFrZSB1c2Ugb2YgYGlzRGVmaW5lZGAgaGVyZSBzaW5jZSBhbiBlbXB0eSBzdHJpbmdcclxuLy8gb3IgbnVsbCB2YWx1ZSAod2hpY2ggaXMgd2hhdCBnZXRQcm9wZXJ0eVZhbHVlIHdpbGwgcmV0dXJuXHJcbi8vIGZvciBhIG5vbi1leGlzdGluZyBzdHlsZSkgd2lsbCBzdGlsbCBiZSBtYXJrZWQgYXMgYSB2YWxpZFxyXG4vLyB2YWx1ZSBmb3IgdGhlIHN0eWxlIChhIGZhbHN5IHZhbHVlIGltcGxpZXMgdGhhdCB0aGUgc3R5bGVcclxuLy8gaXMgdG8gYmUgcmVtb3ZlZCBhdCB0aGUgZW5kIG9mIHRoZSBhbmltYXRpb24pLiBJZiB3ZSBoYWQgYSBzaW1wbGVcclxuLy8gXCJPUlwiIHN0YXRlbWVudCB0aGVuIGl0IHdvdWxkIG5vdCBiZSBlbm91Z2ggdG8gY2F0Y2ggdGhhdC5cclxuZnVuY3Rpb24gcmVnaXN0ZXJSZXN0b3JhYmxlU3R5bGVzKGJhY2t1cCwgbm9kZSwgcHJvcGVydGllcykge1xyXG4gIGZvckVhY2gocHJvcGVydGllcywgZnVuY3Rpb24ocHJvcCkge1xyXG4gICAgYmFja3VwW3Byb3BdID0gaXNEZWZpbmVkKGJhY2t1cFtwcm9wXSlcclxuICAgICAgICA/IGJhY2t1cFtwcm9wXVxyXG4gICAgICAgIDogbm9kZS5zdHlsZS5nZXRQcm9wZXJ0eVZhbHVlKHByb3ApO1xyXG4gIH0pO1xyXG59XHJcblxyXG52YXIgJEFuaW1hdGVDc3NQcm92aWRlciA9IFsnJGFuaW1hdGVQcm92aWRlcicsIGZ1bmN0aW9uKCRhbmltYXRlUHJvdmlkZXIpIHtcclxuICB2YXIgZ2NzTG9va3VwID0gY3JlYXRlTG9jYWxDYWNoZUxvb2t1cCgpO1xyXG4gIHZhciBnY3NTdGFnZ2VyTG9va3VwID0gY3JlYXRlTG9jYWxDYWNoZUxvb2t1cCgpO1xyXG5cclxuICB0aGlzLiRnZXQgPSBbJyR3aW5kb3cnLCAnJCRqcUxpdGUnLCAnJCRBbmltYXRlUnVubmVyJywgJyR0aW1lb3V0JyxcclxuICAgICAgICAgICAgICAgJyQkZm9yY2VSZWZsb3cnLCAnJHNuaWZmZXInLCAnJCRyQUZTY2hlZHVsZXInLCAnJCRhbmltYXRlUXVldWUnLFxyXG4gICAgICAgZnVuY3Rpb24oJHdpbmRvdywgICAkJGpxTGl0ZSwgICAkJEFuaW1hdGVSdW5uZXIsICAgJHRpbWVvdXQsXHJcbiAgICAgICAgICAgICAgICAkJGZvcmNlUmVmbG93LCAgICRzbmlmZmVyLCAgICQkckFGU2NoZWR1bGVyLCAkJGFuaW1hdGVRdWV1ZSkge1xyXG5cclxuICAgIHZhciBhcHBseUFuaW1hdGlvbkNsYXNzZXMgPSBhcHBseUFuaW1hdGlvbkNsYXNzZXNGYWN0b3J5KCQkanFMaXRlKTtcclxuXHJcbiAgICB2YXIgcGFyZW50Q291bnRlciA9IDA7XHJcbiAgICBmdW5jdGlvbiBnY3NIYXNoRm4obm9kZSwgZXh0cmFDbGFzc2VzKSB7XHJcbiAgICAgIHZhciBLRVkgPSBcIiQkbmdBbmltYXRlUGFyZW50S2V5XCI7XHJcbiAgICAgIHZhciBwYXJlbnROb2RlID0gbm9kZS5wYXJlbnROb2RlO1xyXG4gICAgICB2YXIgcGFyZW50SUQgPSBwYXJlbnROb2RlW0tFWV0gfHwgKHBhcmVudE5vZGVbS0VZXSA9ICsrcGFyZW50Q291bnRlcik7XHJcbiAgICAgIHJldHVybiBwYXJlbnRJRCArICctJyArIG5vZGUuZ2V0QXR0cmlidXRlKCdjbGFzcycpICsgJy0nICsgZXh0cmFDbGFzc2VzO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGNvbXB1dGVDYWNoZWRDc3NTdHlsZXMobm9kZSwgY2xhc3NOYW1lLCBjYWNoZUtleSwgcHJvcGVydGllcykge1xyXG4gICAgICB2YXIgdGltaW5ncyA9IGdjc0xvb2t1cC5nZXQoY2FjaGVLZXkpO1xyXG5cclxuICAgICAgaWYgKCF0aW1pbmdzKSB7XHJcbiAgICAgICAgdGltaW5ncyA9IGNvbXB1dGVDc3NTdHlsZXMoJHdpbmRvdywgbm9kZSwgcHJvcGVydGllcyk7XHJcbiAgICAgICAgaWYgKHRpbWluZ3MuYW5pbWF0aW9uSXRlcmF0aW9uQ291bnQgPT09ICdpbmZpbml0ZScpIHtcclxuICAgICAgICAgIHRpbWluZ3MuYW5pbWF0aW9uSXRlcmF0aW9uQ291bnQgPSAxO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gd2Uga2VlcCBwdXR0aW5nIHRoaXMgaW4gbXVsdGlwbGUgdGltZXMgZXZlbiB0aG91Z2ggdGhlIHZhbHVlIGFuZCB0aGUgY2FjaGVLZXkgYXJlIHRoZSBzYW1lXHJcbiAgICAgIC8vIGJlY2F1c2Ugd2UncmUga2VlcGluZyBhbiBpbnRlcm5hbCB0YWxseSBvZiBob3cgbWFueSBkdXBsaWNhdGUgYW5pbWF0aW9ucyBhcmUgZGV0ZWN0ZWQuXHJcbiAgICAgIGdjc0xvb2t1cC5wdXQoY2FjaGVLZXksIHRpbWluZ3MpO1xyXG4gICAgICByZXR1cm4gdGltaW5ncztcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBjb21wdXRlQ2FjaGVkQ3NzU3RhZ2dlclN0eWxlcyhub2RlLCBjbGFzc05hbWUsIGNhY2hlS2V5LCBwcm9wZXJ0aWVzKSB7XHJcbiAgICAgIHZhciBzdGFnZ2VyO1xyXG5cclxuICAgICAgLy8gaWYgd2UgaGF2ZSBvbmUgb3IgbW9yZSBleGlzdGluZyBtYXRjaGVzIG9mIG1hdGNoaW5nIGVsZW1lbnRzXHJcbiAgICAgIC8vIGNvbnRhaW5pbmcgdGhlIHNhbWUgcGFyZW50ICsgQ1NTIHN0eWxlcyAod2hpY2ggaXMgaG93IGNhY2hlS2V5IHdvcmtzKVxyXG4gICAgICAvLyB0aGVuIHN0YWdnZXJpbmcgaXMgcG9zc2libGVcclxuICAgICAgaWYgKGdjc0xvb2t1cC5jb3VudChjYWNoZUtleSkgPiAwKSB7XHJcbiAgICAgICAgc3RhZ2dlciA9IGdjc1N0YWdnZXJMb29rdXAuZ2V0KGNhY2hlS2V5KTtcclxuXHJcbiAgICAgICAgaWYgKCFzdGFnZ2VyKSB7XHJcbiAgICAgICAgICB2YXIgc3RhZ2dlckNsYXNzTmFtZSA9IHBlbmRDbGFzc2VzKGNsYXNzTmFtZSwgJy1zdGFnZ2VyJyk7XHJcblxyXG4gICAgICAgICAgJCRqcUxpdGUuYWRkQ2xhc3Mobm9kZSwgc3RhZ2dlckNsYXNzTmFtZSk7XHJcblxyXG4gICAgICAgICAgc3RhZ2dlciA9IGNvbXB1dGVDc3NTdHlsZXMoJHdpbmRvdywgbm9kZSwgcHJvcGVydGllcyk7XHJcblxyXG4gICAgICAgICAgLy8gZm9yY2UgdGhlIGNvbnZlcnNpb24gb2YgYSBudWxsIHZhbHVlIHRvIHplcm8gaW5jYXNlIG5vdCBzZXRcclxuICAgICAgICAgIHN0YWdnZXIuYW5pbWF0aW9uRHVyYXRpb24gPSBNYXRoLm1heChzdGFnZ2VyLmFuaW1hdGlvbkR1cmF0aW9uLCAwKTtcclxuICAgICAgICAgIHN0YWdnZXIudHJhbnNpdGlvbkR1cmF0aW9uID0gTWF0aC5tYXgoc3RhZ2dlci50cmFuc2l0aW9uRHVyYXRpb24sIDApO1xyXG5cclxuICAgICAgICAgICQkanFMaXRlLnJlbW92ZUNsYXNzKG5vZGUsIHN0YWdnZXJDbGFzc05hbWUpO1xyXG5cclxuICAgICAgICAgIGdjc1N0YWdnZXJMb29rdXAucHV0KGNhY2hlS2V5LCBzdGFnZ2VyKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiBzdGFnZ2VyIHx8IHt9O1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBjYW5jZWxMYXN0UkFGUmVxdWVzdDtcclxuICAgIHZhciByYWZXYWl0UXVldWUgPSBbXTtcclxuICAgIGZ1bmN0aW9uIHdhaXRVbnRpbFF1aWV0KGNhbGxiYWNrKSB7XHJcbiAgICAgIHJhZldhaXRRdWV1ZS5wdXNoKGNhbGxiYWNrKTtcclxuICAgICAgJCRyQUZTY2hlZHVsZXIud2FpdFVudGlsUXVpZXQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgZ2NzTG9va3VwLmZsdXNoKCk7XHJcbiAgICAgICAgZ2NzU3RhZ2dlckxvb2t1cC5mbHVzaCgpO1xyXG5cclxuICAgICAgICAvLyBETyBOT1QgUkVNT1ZFIFRISVMgTElORSBPUiBSRUZBQ1RPUiBPVVQgVEhFIGBwYWdlV2lkdGhgIHZhcmlhYmxlLlxyXG4gICAgICAgIC8vIFBMRUFTRSBFWEFNSU5FIFRIRSBgJCRmb3JjZVJlZmxvd2Agc2VydmljZSB0byB1bmRlcnN0YW5kIHdoeS5cclxuICAgICAgICB2YXIgcGFnZVdpZHRoID0gJCRmb3JjZVJlZmxvdygpO1xyXG5cclxuICAgICAgICAvLyB3ZSB1c2UgYSBmb3IgbG9vcCB0byBlbnN1cmUgdGhhdCBpZiB0aGUgcXVldWUgaXMgY2hhbmdlZFxyXG4gICAgICAgIC8vIGR1cmluZyB0aGlzIGxvb3BpbmcgdGhlbiBpdCB3aWxsIGNvbnNpZGVyIG5ldyByZXF1ZXN0c1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmFmV2FpdFF1ZXVlLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICByYWZXYWl0UXVldWVbaV0ocGFnZVdpZHRoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmFmV2FpdFF1ZXVlLmxlbmd0aCA9IDA7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGNvbXB1dGVUaW1pbmdzKG5vZGUsIGNsYXNzTmFtZSwgY2FjaGVLZXkpIHtcclxuICAgICAgdmFyIHRpbWluZ3MgPSBjb21wdXRlQ2FjaGVkQ3NzU3R5bGVzKG5vZGUsIGNsYXNzTmFtZSwgY2FjaGVLZXksIERFVEVDVF9DU1NfUFJPUEVSVElFUyk7XHJcbiAgICAgIHZhciBhRCA9IHRpbWluZ3MuYW5pbWF0aW9uRGVsYXk7XHJcbiAgICAgIHZhciB0RCA9IHRpbWluZ3MudHJhbnNpdGlvbkRlbGF5O1xyXG4gICAgICB0aW1pbmdzLm1heERlbGF5ID0gYUQgJiYgdERcclxuICAgICAgICAgID8gTWF0aC5tYXgoYUQsIHREKVxyXG4gICAgICAgICAgOiAoYUQgfHwgdEQpO1xyXG4gICAgICB0aW1pbmdzLm1heER1cmF0aW9uID0gTWF0aC5tYXgoXHJcbiAgICAgICAgICB0aW1pbmdzLmFuaW1hdGlvbkR1cmF0aW9uICogdGltaW5ncy5hbmltYXRpb25JdGVyYXRpb25Db3VudCxcclxuICAgICAgICAgIHRpbWluZ3MudHJhbnNpdGlvbkR1cmF0aW9uKTtcclxuXHJcbiAgICAgIHJldHVybiB0aW1pbmdzO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBmdW5jdGlvbiBpbml0KGVsZW1lbnQsIGluaXRpYWxPcHRpb25zKSB7XHJcbiAgICAgIC8vIGFsbCBvZiB0aGUgYW5pbWF0aW9uIGZ1bmN0aW9ucyBzaG91bGQgY3JlYXRlXHJcbiAgICAgIC8vIGEgY29weSBvZiB0aGUgb3B0aW9ucyBkYXRhLCBob3dldmVyLCBpZiBhXHJcbiAgICAgIC8vIHBhcmVudCBzZXJ2aWNlIGhhcyBhbHJlYWR5IGNyZWF0ZWQgYSBjb3B5IHRoZW5cclxuICAgICAgLy8gd2Ugc2hvdWxkIHN0aWNrIHRvIHVzaW5nIHRoYXRcclxuICAgICAgdmFyIG9wdGlvbnMgPSBpbml0aWFsT3B0aW9ucyB8fCB7fTtcclxuICAgICAgaWYgKCFvcHRpb25zLiQkcHJlcGFyZWQpIHtcclxuICAgICAgICBvcHRpb25zID0gcHJlcGFyZUFuaW1hdGlvbk9wdGlvbnMoY29weShvcHRpb25zKSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHZhciByZXN0b3JlU3R5bGVzID0ge307XHJcbiAgICAgIHZhciBub2RlID0gZ2V0RG9tTm9kZShlbGVtZW50KTtcclxuICAgICAgaWYgKCFub2RlXHJcbiAgICAgICAgICB8fCAhbm9kZS5wYXJlbnROb2RlXHJcbiAgICAgICAgICB8fCAhJCRhbmltYXRlUXVldWUuZW5hYmxlZCgpKSB7XHJcbiAgICAgICAgcmV0dXJuIGNsb3NlQW5kUmV0dXJuTm9vcEFuaW1hdG9yKCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHZhciB0ZW1wb3JhcnlTdHlsZXMgPSBbXTtcclxuICAgICAgdmFyIGNsYXNzZXMgPSBlbGVtZW50LmF0dHIoJ2NsYXNzJyk7XHJcbiAgICAgIHZhciBzdHlsZXMgPSBwYWNrYWdlU3R5bGVzKG9wdGlvbnMpO1xyXG4gICAgICB2YXIgYW5pbWF0aW9uQ2xvc2VkO1xyXG4gICAgICB2YXIgYW5pbWF0aW9uUGF1c2VkO1xyXG4gICAgICB2YXIgYW5pbWF0aW9uQ29tcGxldGVkO1xyXG4gICAgICB2YXIgcnVubmVyO1xyXG4gICAgICB2YXIgcnVubmVySG9zdDtcclxuICAgICAgdmFyIG1heERlbGF5O1xyXG4gICAgICB2YXIgbWF4RGVsYXlUaW1lO1xyXG4gICAgICB2YXIgbWF4RHVyYXRpb247XHJcbiAgICAgIHZhciBtYXhEdXJhdGlvblRpbWU7XHJcbiAgICAgIHZhciBzdGFydFRpbWU7XHJcbiAgICAgIHZhciBldmVudHMgPSBbXTtcclxuXHJcbiAgICAgIGlmIChvcHRpb25zLmR1cmF0aW9uID09PSAwIHx8ICghJHNuaWZmZXIuYW5pbWF0aW9ucyAmJiAhJHNuaWZmZXIudHJhbnNpdGlvbnMpKSB7XHJcbiAgICAgICAgcmV0dXJuIGNsb3NlQW5kUmV0dXJuTm9vcEFuaW1hdG9yKCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHZhciBtZXRob2QgPSBvcHRpb25zLmV2ZW50ICYmIGlzQXJyYXkob3B0aW9ucy5ldmVudClcclxuICAgICAgICAgICAgPyBvcHRpb25zLmV2ZW50LmpvaW4oJyAnKVxyXG4gICAgICAgICAgICA6IG9wdGlvbnMuZXZlbnQ7XHJcblxyXG4gICAgICB2YXIgaXNTdHJ1Y3R1cmFsID0gbWV0aG9kICYmIG9wdGlvbnMuc3RydWN0dXJhbDtcclxuICAgICAgdmFyIHN0cnVjdHVyYWxDbGFzc05hbWUgPSAnJztcclxuICAgICAgdmFyIGFkZFJlbW92ZUNsYXNzTmFtZSA9ICcnO1xyXG5cclxuICAgICAgaWYgKGlzU3RydWN0dXJhbCkge1xyXG4gICAgICAgIHN0cnVjdHVyYWxDbGFzc05hbWUgPSBwZW5kQ2xhc3NlcyhtZXRob2QsIEVWRU5UX0NMQVNTX1BSRUZJWCwgdHJ1ZSk7XHJcbiAgICAgIH0gZWxzZSBpZiAobWV0aG9kKSB7XHJcbiAgICAgICAgc3RydWN0dXJhbENsYXNzTmFtZSA9IG1ldGhvZDtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKG9wdGlvbnMuYWRkQ2xhc3MpIHtcclxuICAgICAgICBhZGRSZW1vdmVDbGFzc05hbWUgKz0gcGVuZENsYXNzZXMob3B0aW9ucy5hZGRDbGFzcywgQUREX0NMQVNTX1NVRkZJWCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChvcHRpb25zLnJlbW92ZUNsYXNzKSB7XHJcbiAgICAgICAgaWYgKGFkZFJlbW92ZUNsYXNzTmFtZS5sZW5ndGgpIHtcclxuICAgICAgICAgIGFkZFJlbW92ZUNsYXNzTmFtZSArPSAnICc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGFkZFJlbW92ZUNsYXNzTmFtZSArPSBwZW5kQ2xhc3NlcyhvcHRpb25zLnJlbW92ZUNsYXNzLCBSRU1PVkVfQ0xBU1NfU1VGRklYKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gdGhlcmUgbWF5IGJlIGEgc2l0dWF0aW9uIHdoZXJlIGEgc3RydWN0dXJhbCBhbmltYXRpb24gaXMgY29tYmluZWQgdG9nZXRoZXJcclxuICAgICAgLy8gd2l0aCBDU1MgY2xhc3NlcyB0aGF0IG5lZWQgdG8gcmVzb2x2ZSBiZWZvcmUgdGhlIGFuaW1hdGlvbiBpcyBjb21wdXRlZC5cclxuICAgICAgLy8gSG93ZXZlciB0aGlzIG1lYW5zIHRoYXQgdGhlcmUgaXMgbm8gZXhwbGljaXQgQ1NTIGNvZGUgdG8gYmxvY2sgdGhlIGFuaW1hdGlvblxyXG4gICAgICAvLyBmcm9tIGhhcHBlbmluZyAoYnkgc2V0dGluZyAwcyBub25lIGluIHRoZSBjbGFzcyBuYW1lKS4gSWYgdGhpcyBpcyB0aGUgY2FzZVxyXG4gICAgICAvLyB3ZSBuZWVkIHRvIGFwcGx5IHRoZSBjbGFzc2VzIGJlZm9yZSB0aGUgZmlyc3QgckFGIHNvIHdlIGtub3cgdG8gY29udGludWUgaWZcclxuICAgICAgLy8gdGhlcmUgYWN0dWFsbHkgaXMgYSBkZXRlY3RlZCB0cmFuc2l0aW9uIG9yIGtleWZyYW1lIGFuaW1hdGlvblxyXG4gICAgICBpZiAob3B0aW9ucy5hcHBseUNsYXNzZXNFYXJseSAmJiBhZGRSZW1vdmVDbGFzc05hbWUubGVuZ3RoKSB7XHJcbiAgICAgICAgYXBwbHlBbmltYXRpb25DbGFzc2VzKGVsZW1lbnQsIG9wdGlvbnMpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB2YXIgcHJlcGFyYXRpb25DbGFzc2VzID0gW3N0cnVjdHVyYWxDbGFzc05hbWUsIGFkZFJlbW92ZUNsYXNzTmFtZV0uam9pbignICcpLnRyaW0oKTtcclxuICAgICAgdmFyIGZ1bGxDbGFzc05hbWUgPSBjbGFzc2VzICsgJyAnICsgcHJlcGFyYXRpb25DbGFzc2VzO1xyXG4gICAgICB2YXIgYWN0aXZlQ2xhc3NlcyA9IHBlbmRDbGFzc2VzKHByZXBhcmF0aW9uQ2xhc3NlcywgQUNUSVZFX0NMQVNTX1NVRkZJWCk7XHJcbiAgICAgIHZhciBoYXNUb1N0eWxlcyA9IHN0eWxlcy50byAmJiBPYmplY3Qua2V5cyhzdHlsZXMudG8pLmxlbmd0aCA+IDA7XHJcbiAgICAgIHZhciBjb250YWluc0tleWZyYW1lQW5pbWF0aW9uID0gKG9wdGlvbnMua2V5ZnJhbWVTdHlsZSB8fCAnJykubGVuZ3RoID4gMDtcclxuXHJcbiAgICAgIC8vIHRoZXJlIGlzIG5vIHdheSB3ZSBjYW4gdHJpZ2dlciBhbiBhbmltYXRpb24gaWYgbm8gc3R5bGVzIGFuZFxyXG4gICAgICAvLyBubyBjbGFzc2VzIGFyZSBiZWluZyBhcHBsaWVkIHdoaWNoIHdvdWxkIHRoZW4gdHJpZ2dlciBhIHRyYW5zaXRpb24sXHJcbiAgICAgIC8vIHVubGVzcyB0aGVyZSBhIGlzIHJhdyBrZXlmcmFtZSB2YWx1ZSB0aGF0IGlzIGFwcGxpZWQgdG8gdGhlIGVsZW1lbnQuXHJcbiAgICAgIGlmICghY29udGFpbnNLZXlmcmFtZUFuaW1hdGlvblxyXG4gICAgICAgICAgICYmICFoYXNUb1N0eWxlc1xyXG4gICAgICAgICAgICYmICFwcmVwYXJhdGlvbkNsYXNzZXMpIHtcclxuICAgICAgICByZXR1cm4gY2xvc2VBbmRSZXR1cm5Ob29wQW5pbWF0b3IoKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgdmFyIGNhY2hlS2V5LCBzdGFnZ2VyO1xyXG4gICAgICBpZiAob3B0aW9ucy5zdGFnZ2VyID4gMCkge1xyXG4gICAgICAgIHZhciBzdGFnZ2VyVmFsID0gcGFyc2VGbG9hdChvcHRpb25zLnN0YWdnZXIpO1xyXG4gICAgICAgIHN0YWdnZXIgPSB7XHJcbiAgICAgICAgICB0cmFuc2l0aW9uRGVsYXk6IHN0YWdnZXJWYWwsXHJcbiAgICAgICAgICBhbmltYXRpb25EZWxheTogc3RhZ2dlclZhbCxcclxuICAgICAgICAgIHRyYW5zaXRpb25EdXJhdGlvbjogMCxcclxuICAgICAgICAgIGFuaW1hdGlvbkR1cmF0aW9uOiAwXHJcbiAgICAgICAgfTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBjYWNoZUtleSA9IGdjc0hhc2hGbihub2RlLCBmdWxsQ2xhc3NOYW1lKTtcclxuICAgICAgICBzdGFnZ2VyID0gY29tcHV0ZUNhY2hlZENzc1N0YWdnZXJTdHlsZXMobm9kZSwgcHJlcGFyYXRpb25DbGFzc2VzLCBjYWNoZUtleSwgREVURUNUX1NUQUdHRVJfQ1NTX1BST1BFUlRJRVMpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoIW9wdGlvbnMuJCRza2lwUHJlcGFyYXRpb25DbGFzc2VzKSB7XHJcbiAgICAgICAgJCRqcUxpdGUuYWRkQ2xhc3MoZWxlbWVudCwgcHJlcGFyYXRpb25DbGFzc2VzKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgdmFyIGFwcGx5T25seUR1cmF0aW9uO1xyXG5cclxuICAgICAgaWYgKG9wdGlvbnMudHJhbnNpdGlvblN0eWxlKSB7XHJcbiAgICAgICAgdmFyIHRyYW5zaXRpb25TdHlsZSA9IFtUUkFOU0lUSU9OX1BST1AsIG9wdGlvbnMudHJhbnNpdGlvblN0eWxlXTtcclxuICAgICAgICBhcHBseUlubGluZVN0eWxlKG5vZGUsIHRyYW5zaXRpb25TdHlsZSk7XHJcbiAgICAgICAgdGVtcG9yYXJ5U3R5bGVzLnB1c2godHJhbnNpdGlvblN0eWxlKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKG9wdGlvbnMuZHVyYXRpb24gPj0gMCkge1xyXG4gICAgICAgIGFwcGx5T25seUR1cmF0aW9uID0gbm9kZS5zdHlsZVtUUkFOU0lUSU9OX1BST1BdLmxlbmd0aCA+IDA7XHJcbiAgICAgICAgdmFyIGR1cmF0aW9uU3R5bGUgPSBnZXRDc3NUcmFuc2l0aW9uRHVyYXRpb25TdHlsZShvcHRpb25zLmR1cmF0aW9uLCBhcHBseU9ubHlEdXJhdGlvbik7XHJcblxyXG4gICAgICAgIC8vIHdlIHNldCB0aGUgZHVyYXRpb24gc28gdGhhdCBpdCB3aWxsIGJlIHBpY2tlZCB1cCBieSBnZXRDb21wdXRlZFN0eWxlIGxhdGVyXHJcbiAgICAgICAgYXBwbHlJbmxpbmVTdHlsZShub2RlLCBkdXJhdGlvblN0eWxlKTtcclxuICAgICAgICB0ZW1wb3JhcnlTdHlsZXMucHVzaChkdXJhdGlvblN0eWxlKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKG9wdGlvbnMua2V5ZnJhbWVTdHlsZSkge1xyXG4gICAgICAgIHZhciBrZXlmcmFtZVN0eWxlID0gW0FOSU1BVElPTl9QUk9QLCBvcHRpb25zLmtleWZyYW1lU3R5bGVdO1xyXG4gICAgICAgIGFwcGx5SW5saW5lU3R5bGUobm9kZSwga2V5ZnJhbWVTdHlsZSk7XHJcbiAgICAgICAgdGVtcG9yYXJ5U3R5bGVzLnB1c2goa2V5ZnJhbWVTdHlsZSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHZhciBpdGVtSW5kZXggPSBzdGFnZ2VyXHJcbiAgICAgICAgICA/IG9wdGlvbnMuc3RhZ2dlckluZGV4ID49IDBcclxuICAgICAgICAgICAgICA/IG9wdGlvbnMuc3RhZ2dlckluZGV4XHJcbiAgICAgICAgICAgICAgOiBnY3NMb29rdXAuY291bnQoY2FjaGVLZXkpXHJcbiAgICAgICAgICA6IDA7XHJcblxyXG4gICAgICB2YXIgaXNGaXJzdCA9IGl0ZW1JbmRleCA9PT0gMDtcclxuXHJcbiAgICAgIC8vIHRoaXMgaXMgYSBwcmUtZW1wdGl2ZSB3YXkgb2YgZm9yY2luZyB0aGUgc2V0dXAgY2xhc3NlcyB0byBiZSBhZGRlZCBhbmQgYXBwbGllZCBJTlNUQU5UTFlcclxuICAgICAgLy8gd2l0aG91dCBjYXVzaW5nIGFueSBjb21iaW5hdGlvbiBvZiB0cmFuc2l0aW9ucyB0byBraWNrIGluLiBCeSBhZGRpbmcgYSBuZWdhdGl2ZSBkZWxheSB2YWx1ZVxyXG4gICAgICAvLyBpdCBmb3JjZXMgdGhlIHNldHVwIGNsYXNzJyB0cmFuc2l0aW9uIHRvIGVuZCBpbW1lZGlhdGVseS4gV2UgbGF0ZXIgdGhlbiByZW1vdmUgdGhlIG5lZ2F0aXZlXHJcbiAgICAgIC8vIHRyYW5zaXRpb24gZGVsYXkgdG8gYWxsb3cgZm9yIHRoZSB0cmFuc2l0aW9uIHRvIG5hdHVyYWxseSBkbyBpdCdzIHRoaW5nLiBUaGUgYmVhdXR5IGhlcmUgaXNcclxuICAgICAgLy8gdGhhdCBpZiB0aGVyZSBpcyBubyB0cmFuc2l0aW9uIGRlZmluZWQgdGhlbiBub3RoaW5nIHdpbGwgaGFwcGVuIGFuZCB0aGlzIHdpbGwgYWxzbyBhbGxvd1xyXG4gICAgICAvLyBvdGhlciB0cmFuc2l0aW9ucyB0byBiZSBzdGFja2VkIG9uIHRvcCBvZiBlYWNoIG90aGVyIHdpdGhvdXQgYW55IGNob3BwaW5nIHRoZW0gb3V0LlxyXG4gICAgICBpZiAoaXNGaXJzdCAmJiAhb3B0aW9ucy5za2lwQmxvY2tpbmcpIHtcclxuICAgICAgICBibG9ja1RyYW5zaXRpb25zKG5vZGUsIFNBRkVfRkFTVF9GT1JXQVJEX0RVUkFUSU9OX1ZBTFVFKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgdmFyIHRpbWluZ3MgPSBjb21wdXRlVGltaW5ncyhub2RlLCBmdWxsQ2xhc3NOYW1lLCBjYWNoZUtleSk7XHJcbiAgICAgIHZhciByZWxhdGl2ZURlbGF5ID0gdGltaW5ncy5tYXhEZWxheTtcclxuICAgICAgbWF4RGVsYXkgPSBNYXRoLm1heChyZWxhdGl2ZURlbGF5LCAwKTtcclxuICAgICAgbWF4RHVyYXRpb24gPSB0aW1pbmdzLm1heER1cmF0aW9uO1xyXG5cclxuICAgICAgdmFyIGZsYWdzID0ge307XHJcbiAgICAgIGZsYWdzLmhhc1RyYW5zaXRpb25zICAgICAgICAgID0gdGltaW5ncy50cmFuc2l0aW9uRHVyYXRpb24gPiAwO1xyXG4gICAgICBmbGFncy5oYXNBbmltYXRpb25zICAgICAgICAgICA9IHRpbWluZ3MuYW5pbWF0aW9uRHVyYXRpb24gPiAwO1xyXG4gICAgICBmbGFncy5oYXNUcmFuc2l0aW9uQWxsICAgICAgICA9IGZsYWdzLmhhc1RyYW5zaXRpb25zICYmIHRpbWluZ3MudHJhbnNpdGlvblByb3BlcnR5ID09ICdhbGwnO1xyXG4gICAgICBmbGFncy5hcHBseVRyYW5zaXRpb25EdXJhdGlvbiA9IGhhc1RvU3R5bGVzICYmIChcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIChmbGFncy5oYXNUcmFuc2l0aW9ucyAmJiAhZmxhZ3MuaGFzVHJhbnNpdGlvbkFsbClcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8fCAoZmxhZ3MuaGFzQW5pbWF0aW9ucyAmJiAhZmxhZ3MuaGFzVHJhbnNpdGlvbnMpKTtcclxuICAgICAgZmxhZ3MuYXBwbHlBbmltYXRpb25EdXJhdGlvbiAgPSBvcHRpb25zLmR1cmF0aW9uICYmIGZsYWdzLmhhc0FuaW1hdGlvbnM7XHJcbiAgICAgIGZsYWdzLmFwcGx5VHJhbnNpdGlvbkRlbGF5ICAgID0gdHJ1dGh5VGltaW5nVmFsdWUob3B0aW9ucy5kZWxheSkgJiYgKGZsYWdzLmFwcGx5VHJhbnNpdGlvbkR1cmF0aW9uIHx8IGZsYWdzLmhhc1RyYW5zaXRpb25zKTtcclxuICAgICAgZmxhZ3MuYXBwbHlBbmltYXRpb25EZWxheSAgICAgPSB0cnV0aHlUaW1pbmdWYWx1ZShvcHRpb25zLmRlbGF5KSAmJiBmbGFncy5oYXNBbmltYXRpb25zO1xyXG4gICAgICBmbGFncy5yZWNhbGN1bGF0ZVRpbWluZ1N0eWxlcyA9IGFkZFJlbW92ZUNsYXNzTmFtZS5sZW5ndGggPiAwO1xyXG5cclxuICAgICAgaWYgKGZsYWdzLmFwcGx5VHJhbnNpdGlvbkR1cmF0aW9uIHx8IGZsYWdzLmFwcGx5QW5pbWF0aW9uRHVyYXRpb24pIHtcclxuICAgICAgICBtYXhEdXJhdGlvbiA9IG9wdGlvbnMuZHVyYXRpb24gPyBwYXJzZUZsb2F0KG9wdGlvbnMuZHVyYXRpb24pIDogbWF4RHVyYXRpb247XHJcblxyXG4gICAgICAgIGlmIChmbGFncy5hcHBseVRyYW5zaXRpb25EdXJhdGlvbikge1xyXG4gICAgICAgICAgZmxhZ3MuaGFzVHJhbnNpdGlvbnMgPSB0cnVlO1xyXG4gICAgICAgICAgdGltaW5ncy50cmFuc2l0aW9uRHVyYXRpb24gPSBtYXhEdXJhdGlvbjtcclxuICAgICAgICAgIGFwcGx5T25seUR1cmF0aW9uID0gbm9kZS5zdHlsZVtUUkFOU0lUSU9OX1BST1AgKyBQUk9QRVJUWV9LRVldLmxlbmd0aCA+IDA7XHJcbiAgICAgICAgICB0ZW1wb3JhcnlTdHlsZXMucHVzaChnZXRDc3NUcmFuc2l0aW9uRHVyYXRpb25TdHlsZShtYXhEdXJhdGlvbiwgYXBwbHlPbmx5RHVyYXRpb24pKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChmbGFncy5hcHBseUFuaW1hdGlvbkR1cmF0aW9uKSB7XHJcbiAgICAgICAgICBmbGFncy5oYXNBbmltYXRpb25zID0gdHJ1ZTtcclxuICAgICAgICAgIHRpbWluZ3MuYW5pbWF0aW9uRHVyYXRpb24gPSBtYXhEdXJhdGlvbjtcclxuICAgICAgICAgIHRlbXBvcmFyeVN0eWxlcy5wdXNoKGdldENzc0tleWZyYW1lRHVyYXRpb25TdHlsZShtYXhEdXJhdGlvbikpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKG1heER1cmF0aW9uID09PSAwICYmICFmbGFncy5yZWNhbGN1bGF0ZVRpbWluZ1N0eWxlcykge1xyXG4gICAgICAgIHJldHVybiBjbG9zZUFuZFJldHVybk5vb3BBbmltYXRvcigpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAob3B0aW9ucy5kZWxheSAhPSBudWxsKSB7XHJcbiAgICAgICAgdmFyIGRlbGF5U3R5bGU7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBvcHRpb25zLmRlbGF5ICE9PSBcImJvb2xlYW5cIikge1xyXG4gICAgICAgICAgZGVsYXlTdHlsZSA9IHBhcnNlRmxvYXQob3B0aW9ucy5kZWxheSk7XHJcbiAgICAgICAgICAvLyBudW1iZXIgaW4gb3B0aW9ucy5kZWxheSBtZWFucyB3ZSBoYXZlIHRvIHJlY2FsY3VsYXRlIHRoZSBkZWxheSBmb3IgdGhlIGNsb3NpbmcgdGltZW91dFxyXG4gICAgICAgICAgbWF4RGVsYXkgPSBNYXRoLm1heChkZWxheVN0eWxlLCAwKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChmbGFncy5hcHBseVRyYW5zaXRpb25EZWxheSkge1xyXG4gICAgICAgICAgdGVtcG9yYXJ5U3R5bGVzLnB1c2goZ2V0Q3NzRGVsYXlTdHlsZShkZWxheVN0eWxlKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoZmxhZ3MuYXBwbHlBbmltYXRpb25EZWxheSkge1xyXG4gICAgICAgICAgdGVtcG9yYXJ5U3R5bGVzLnB1c2goZ2V0Q3NzRGVsYXlTdHlsZShkZWxheVN0eWxlLCB0cnVlKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyB3ZSBuZWVkIHRvIHJlY2FsY3VsYXRlIHRoZSBkZWxheSB2YWx1ZSBzaW5jZSB3ZSB1c2VkIGEgcHJlLWVtcHRpdmUgbmVnYXRpdmVcclxuICAgICAgLy8gZGVsYXkgdmFsdWUgYW5kIHRoZSBkZWxheSB2YWx1ZSBpcyByZXF1aXJlZCBmb3IgdGhlIGZpbmFsIGV2ZW50IGNoZWNraW5nLiBUaGlzXHJcbiAgICAgIC8vIHByb3BlcnR5IHdpbGwgZW5zdXJlIHRoYXQgdGhpcyB3aWxsIGhhcHBlbiBhZnRlciB0aGUgUkFGIHBoYXNlIGhhcyBwYXNzZWQuXHJcbiAgICAgIGlmIChvcHRpb25zLmR1cmF0aW9uID09IG51bGwgJiYgdGltaW5ncy50cmFuc2l0aW9uRHVyYXRpb24gPiAwKSB7XHJcbiAgICAgICAgZmxhZ3MucmVjYWxjdWxhdGVUaW1pbmdTdHlsZXMgPSBmbGFncy5yZWNhbGN1bGF0ZVRpbWluZ1N0eWxlcyB8fCBpc0ZpcnN0O1xyXG4gICAgICB9XHJcblxyXG4gICAgICBtYXhEZWxheVRpbWUgPSBtYXhEZWxheSAqIE9ORV9TRUNPTkQ7XHJcbiAgICAgIG1heER1cmF0aW9uVGltZSA9IG1heER1cmF0aW9uICogT05FX1NFQ09ORDtcclxuICAgICAgaWYgKCFvcHRpb25zLnNraXBCbG9ja2luZykge1xyXG4gICAgICAgIGZsYWdzLmJsb2NrVHJhbnNpdGlvbiA9IHRpbWluZ3MudHJhbnNpdGlvbkR1cmF0aW9uID4gMDtcclxuICAgICAgICBmbGFncy5ibG9ja0tleWZyYW1lQW5pbWF0aW9uID0gdGltaW5ncy5hbmltYXRpb25EdXJhdGlvbiA+IDAgJiZcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhZ2dlci5hbmltYXRpb25EZWxheSA+IDAgJiZcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhZ2dlci5hbmltYXRpb25EdXJhdGlvbiA9PT0gMDtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKG9wdGlvbnMuZnJvbSkge1xyXG4gICAgICAgIGlmIChvcHRpb25zLmNsZWFudXBTdHlsZXMpIHtcclxuICAgICAgICAgIHJlZ2lzdGVyUmVzdG9yYWJsZVN0eWxlcyhyZXN0b3JlU3R5bGVzLCBub2RlLCBPYmplY3Qua2V5cyhvcHRpb25zLmZyb20pKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgYXBwbHlBbmltYXRpb25Gcm9tU3R5bGVzKGVsZW1lbnQsIG9wdGlvbnMpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoZmxhZ3MuYmxvY2tUcmFuc2l0aW9uIHx8IGZsYWdzLmJsb2NrS2V5ZnJhbWVBbmltYXRpb24pIHtcclxuICAgICAgICBhcHBseUJsb2NraW5nKG1heER1cmF0aW9uKTtcclxuICAgICAgfSBlbHNlIGlmICghb3B0aW9ucy5za2lwQmxvY2tpbmcpIHtcclxuICAgICAgICBibG9ja1RyYW5zaXRpb25zKG5vZGUsIGZhbHNlKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gVE9ETyhtYXRza28pOiBmb3IgMS41IGNoYW5nZSB0aGlzIGNvZGUgdG8gaGF2ZSBhbiBhbmltYXRvciBvYmplY3QgZm9yIGJldHRlciBkZWJ1Z2dpbmdcclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICAkJHdpbGxBbmltYXRlOiB0cnVlLFxyXG4gICAgICAgIGVuZDogZW5kRm4sXHJcbiAgICAgICAgc3RhcnQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgaWYgKGFuaW1hdGlvbkNsb3NlZCkgcmV0dXJuO1xyXG5cclxuICAgICAgICAgIHJ1bm5lckhvc3QgPSB7XHJcbiAgICAgICAgICAgIGVuZDogZW5kRm4sXHJcbiAgICAgICAgICAgIGNhbmNlbDogY2FuY2VsRm4sXHJcbiAgICAgICAgICAgIHJlc3VtZTogbnVsbCwgLy90aGlzIHdpbGwgYmUgc2V0IGR1cmluZyB0aGUgc3RhcnQoKSBwaGFzZVxyXG4gICAgICAgICAgICBwYXVzZTogbnVsbFxyXG4gICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICBydW5uZXIgPSBuZXcgJCRBbmltYXRlUnVubmVyKHJ1bm5lckhvc3QpO1xyXG5cclxuICAgICAgICAgIHdhaXRVbnRpbFF1aWV0KHN0YXJ0KTtcclxuXHJcbiAgICAgICAgICAvLyB3ZSBkb24ndCBoYXZlIGFjY2VzcyB0byBwYXVzZS9yZXN1bWUgdGhlIGFuaW1hdGlvblxyXG4gICAgICAgICAgLy8gc2luY2UgaXQgaGFzbid0IHJ1biB5ZXQuIEFuaW1hdGVSdW5uZXIgd2lsbCB0aGVyZWZvcmVcclxuICAgICAgICAgIC8vIHNldCBub29wIGZ1bmN0aW9ucyBmb3IgcmVzdW1lIGFuZCBwYXVzZSBhbmQgdGhleSB3aWxsXHJcbiAgICAgICAgICAvLyBsYXRlciBiZSBvdmVycmlkZGVuIG9uY2UgdGhlIGFuaW1hdGlvbiBpcyB0cmlnZ2VyZWRcclxuICAgICAgICAgIHJldHVybiBydW5uZXI7XHJcbiAgICAgICAgfVxyXG4gICAgICB9O1xyXG5cclxuICAgICAgZnVuY3Rpb24gZW5kRm4oKSB7XHJcbiAgICAgICAgY2xvc2UoKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgZnVuY3Rpb24gY2FuY2VsRm4oKSB7XHJcbiAgICAgICAgY2xvc2UodHJ1ZSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGZ1bmN0aW9uIGNsb3NlKHJlamVjdGVkKSB7IC8vIGpzaGludCBpZ25vcmU6bGluZVxyXG4gICAgICAgIC8vIGlmIHRoZSBwcm9taXNlIGhhcyBiZWVuIGNhbGxlZCBhbHJlYWR5IHRoZW4gd2Ugc2hvdWxkbid0IGNsb3NlXHJcbiAgICAgICAgLy8gdGhlIGFuaW1hdGlvbiBhZ2FpblxyXG4gICAgICAgIGlmIChhbmltYXRpb25DbG9zZWQgfHwgKGFuaW1hdGlvbkNvbXBsZXRlZCAmJiBhbmltYXRpb25QYXVzZWQpKSByZXR1cm47XHJcbiAgICAgICAgYW5pbWF0aW9uQ2xvc2VkID0gdHJ1ZTtcclxuICAgICAgICBhbmltYXRpb25QYXVzZWQgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgaWYgKCFvcHRpb25zLiQkc2tpcFByZXBhcmF0aW9uQ2xhc3Nlcykge1xyXG4gICAgICAgICAgJCRqcUxpdGUucmVtb3ZlQ2xhc3MoZWxlbWVudCwgcHJlcGFyYXRpb25DbGFzc2VzKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgJCRqcUxpdGUucmVtb3ZlQ2xhc3MoZWxlbWVudCwgYWN0aXZlQ2xhc3Nlcyk7XHJcblxyXG4gICAgICAgIGJsb2NrS2V5ZnJhbWVBbmltYXRpb25zKG5vZGUsIGZhbHNlKTtcclxuICAgICAgICBibG9ja1RyYW5zaXRpb25zKG5vZGUsIGZhbHNlKTtcclxuXHJcbiAgICAgICAgZm9yRWFjaCh0ZW1wb3JhcnlTdHlsZXMsIGZ1bmN0aW9uKGVudHJ5KSB7XHJcbiAgICAgICAgICAvLyBUaGVyZSBpcyBvbmx5IG9uZSB3YXkgdG8gcmVtb3ZlIGlubGluZSBzdHlsZSBwcm9wZXJ0aWVzIGVudGlyZWx5IGZyb20gZWxlbWVudHMuXHJcbiAgICAgICAgICAvLyBCeSB1c2luZyBgcmVtb3ZlUHJvcGVydHlgIHRoaXMgd29ya3MsIGJ1dCB3ZSBuZWVkIHRvIGNvbnZlcnQgY2FtZWwtY2FzZWQgQ1NTXHJcbiAgICAgICAgICAvLyBzdHlsZXMgZG93biB0byBoeXBoZW5hdGVkIHZhbHVlcy5cclxuICAgICAgICAgIG5vZGUuc3R5bGVbZW50cnlbMF1dID0gJyc7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGFwcGx5QW5pbWF0aW9uQ2xhc3NlcyhlbGVtZW50LCBvcHRpb25zKTtcclxuICAgICAgICBhcHBseUFuaW1hdGlvblN0eWxlcyhlbGVtZW50LCBvcHRpb25zKTtcclxuXHJcbiAgICAgICAgaWYgKE9iamVjdC5rZXlzKHJlc3RvcmVTdHlsZXMpLmxlbmd0aCkge1xyXG4gICAgICAgICAgZm9yRWFjaChyZXN0b3JlU3R5bGVzLCBmdW5jdGlvbih2YWx1ZSwgcHJvcCkge1xyXG4gICAgICAgICAgICB2YWx1ZSA/IG5vZGUuc3R5bGUuc2V0UHJvcGVydHkocHJvcCwgdmFsdWUpXHJcbiAgICAgICAgICAgICAgICAgIDogbm9kZS5zdHlsZS5yZW1vdmVQcm9wZXJ0eShwcm9wKTtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gdGhlIHJlYXNvbiB3aHkgd2UgaGF2ZSB0aGlzIG9wdGlvbiBpcyB0byBhbGxvdyBhIHN5bmNocm9ub3VzIGNsb3NpbmcgY2FsbGJhY2tcclxuICAgICAgICAvLyB0aGF0IGlzIGZpcmVkIGFzIFNPT04gYXMgdGhlIGFuaW1hdGlvbiBlbmRzICh3aGVuIHRoZSBDU1MgaXMgcmVtb3ZlZCkgb3IgaWZcclxuICAgICAgICAvLyB0aGUgYW5pbWF0aW9uIG5ldmVyIHRha2VzIG9mZiBhdCBhbGwuIEEgZ29vZCBleGFtcGxlIGlzIGEgbGVhdmUgYW5pbWF0aW9uIHNpbmNlXHJcbiAgICAgICAgLy8gdGhlIGVsZW1lbnQgbXVzdCBiZSByZW1vdmVkIGp1c3QgYWZ0ZXIgdGhlIGFuaW1hdGlvbiBpcyBvdmVyIG9yIGVsc2UgdGhlIGVsZW1lbnRcclxuICAgICAgICAvLyB3aWxsIGFwcGVhciBvbiBzY3JlZW4gZm9yIG9uZSBhbmltYXRpb24gZnJhbWUgY2F1c2luZyBhbiBvdmVyYmVhcmluZyBmbGlja2VyLlxyXG4gICAgICAgIGlmIChvcHRpb25zLm9uRG9uZSkge1xyXG4gICAgICAgICAgb3B0aW9ucy5vbkRvbmUoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChldmVudHMgJiYgZXZlbnRzLmxlbmd0aCkge1xyXG4gICAgICAgICAgLy8gUmVtb3ZlIHRoZSB0cmFuc2l0aW9uZW5kIC8gYW5pbWF0aW9uZW5kIGxpc3RlbmVyKHMpXHJcbiAgICAgICAgICBlbGVtZW50Lm9mZihldmVudHMuam9pbignICcpLCBvbkFuaW1hdGlvblByb2dyZXNzKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vQ2FuY2VsIHRoZSBmYWxsYmFjayBjbG9zaW5nIHRpbWVvdXQgYW5kIHJlbW92ZSB0aGUgdGltZXIgZGF0YVxyXG4gICAgICAgIHZhciBhbmltYXRpb25UaW1lckRhdGEgPSBlbGVtZW50LmRhdGEoQU5JTUFURV9USU1FUl9LRVkpO1xyXG4gICAgICAgIGlmIChhbmltYXRpb25UaW1lckRhdGEpIHtcclxuICAgICAgICAgICR0aW1lb3V0LmNhbmNlbChhbmltYXRpb25UaW1lckRhdGFbMF0udGltZXIpO1xyXG4gICAgICAgICAgZWxlbWVudC5yZW1vdmVEYXRhKEFOSU1BVEVfVElNRVJfS0VZKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIGlmIHRoZSBwcmVwYXJhdGlvbiBmdW5jdGlvbiBmYWlscyB0aGVuIHRoZSBwcm9taXNlIGlzIG5vdCBzZXR1cFxyXG4gICAgICAgIGlmIChydW5uZXIpIHtcclxuICAgICAgICAgIHJ1bm5lci5jb21wbGV0ZSghcmVqZWN0ZWQpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgZnVuY3Rpb24gYXBwbHlCbG9ja2luZyhkdXJhdGlvbikge1xyXG4gICAgICAgIGlmIChmbGFncy5ibG9ja1RyYW5zaXRpb24pIHtcclxuICAgICAgICAgIGJsb2NrVHJhbnNpdGlvbnMobm9kZSwgZHVyYXRpb24pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGZsYWdzLmJsb2NrS2V5ZnJhbWVBbmltYXRpb24pIHtcclxuICAgICAgICAgIGJsb2NrS2V5ZnJhbWVBbmltYXRpb25zKG5vZGUsICEhZHVyYXRpb24pO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgZnVuY3Rpb24gY2xvc2VBbmRSZXR1cm5Ob29wQW5pbWF0b3IoKSB7XHJcbiAgICAgICAgcnVubmVyID0gbmV3ICQkQW5pbWF0ZVJ1bm5lcih7XHJcbiAgICAgICAgICBlbmQ6IGVuZEZuLFxyXG4gICAgICAgICAgY2FuY2VsOiBjYW5jZWxGblxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBzaG91bGQgZmx1c2ggdGhlIGNhY2hlIGFuaW1hdGlvblxyXG4gICAgICAgIHdhaXRVbnRpbFF1aWV0KG5vb3ApO1xyXG4gICAgICAgIGNsb3NlKCk7XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAkJHdpbGxBbmltYXRlOiBmYWxzZSxcclxuICAgICAgICAgIHN0YXJ0OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHJ1bm5lcjtcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICBlbmQ6IGVuZEZuXHJcbiAgICAgICAgfTtcclxuICAgICAgfVxyXG5cclxuICAgICAgZnVuY3Rpb24gb25BbmltYXRpb25Qcm9ncmVzcyhldmVudCkge1xyXG4gICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgIHZhciBldiA9IGV2ZW50Lm9yaWdpbmFsRXZlbnQgfHwgZXZlbnQ7XHJcblxyXG4gICAgICAgIC8vIHdlIG5vdyBhbHdheXMgdXNlIGBEYXRlLm5vdygpYCBkdWUgdG8gdGhlIHJlY2VudCBjaGFuZ2VzIHdpdGhcclxuICAgICAgICAvLyBldmVudC50aW1lU3RhbXAgaW4gRmlyZWZveCwgV2Via2l0IGFuZCBDaHJvbWUgKHNlZSAjMTM0OTQgZm9yIG1vcmUgaW5mbylcclxuICAgICAgICB2YXIgdGltZVN0YW1wID0gZXYuJG1hbnVhbFRpbWVTdGFtcCB8fCBEYXRlLm5vdygpO1xyXG5cclxuICAgICAgICAvKiBGaXJlZm94IChvciBwb3NzaWJseSBqdXN0IEdlY2tvKSBsaWtlcyB0byBub3Qgcm91bmQgdmFsdWVzIHVwXHJcbiAgICAgICAgICogd2hlbiBhIG1zIG1lYXN1cmVtZW50IGlzIHVzZWQgZm9yIHRoZSBhbmltYXRpb24gKi9cclxuICAgICAgICB2YXIgZWxhcHNlZFRpbWUgPSBwYXJzZUZsb2F0KGV2LmVsYXBzZWRUaW1lLnRvRml4ZWQoRUxBUFNFRF9USU1FX01BWF9ERUNJTUFMX1BMQUNFUykpO1xyXG5cclxuICAgICAgICAvKiAkbWFudWFsVGltZVN0YW1wIGlzIGEgbW9ja2VkIHRpbWVTdGFtcCB2YWx1ZSB3aGljaCBpcyBzZXRcclxuICAgICAgICAgKiB3aXRoaW4gYnJvd3NlclRyaWdnZXIoKS4gVGhpcyBpcyBvbmx5IGhlcmUgc28gdGhhdCB0ZXN0cyBjYW5cclxuICAgICAgICAgKiBtb2NrIGFuaW1hdGlvbnMgcHJvcGVybHkuIFJlYWwgZXZlbnRzIGZhbGxiYWNrIHRvIGV2ZW50LnRpbWVTdGFtcCxcclxuICAgICAgICAgKiBvciwgaWYgdGhleSBkb24ndCwgdGhlbiBhIHRpbWVTdGFtcCBpcyBhdXRvbWF0aWNhbGx5IGNyZWF0ZWQgZm9yIHRoZW0uXHJcbiAgICAgICAgICogV2UncmUgY2hlY2tpbmcgdG8gc2VlIGlmIHRoZSB0aW1lU3RhbXAgc3VycGFzc2VzIHRoZSBleHBlY3RlZCBkZWxheSxcclxuICAgICAgICAgKiBidXQgd2UncmUgdXNpbmcgZWxhcHNlZFRpbWUgaW5zdGVhZCBvZiB0aGUgdGltZVN0YW1wIG9uIHRoZSAybmRcclxuICAgICAgICAgKiBwcmUtY29uZGl0aW9uIHNpbmNlIGFuaW1hdGlvblBhdXNlZHMgc29tZXRpbWVzIGNsb3NlIG9mZiBlYXJseSAqL1xyXG4gICAgICAgIGlmIChNYXRoLm1heCh0aW1lU3RhbXAgLSBzdGFydFRpbWUsIDApID49IG1heERlbGF5VGltZSAmJiBlbGFwc2VkVGltZSA+PSBtYXhEdXJhdGlvbikge1xyXG4gICAgICAgICAgLy8gd2Ugc2V0IHRoaXMgZmxhZyB0byBlbnN1cmUgdGhhdCBpZiB0aGUgdHJhbnNpdGlvbiBpcyBwYXVzZWQgdGhlbiwgd2hlbiByZXN1bWVkLFxyXG4gICAgICAgICAgLy8gdGhlIGFuaW1hdGlvbiB3aWxsIGF1dG9tYXRpY2FsbHkgY2xvc2UgaXRzZWxmIHNpbmNlIHRyYW5zaXRpb25zIGNhbm5vdCBiZSBwYXVzZWQuXHJcbiAgICAgICAgICBhbmltYXRpb25Db21wbGV0ZWQgPSB0cnVlO1xyXG4gICAgICAgICAgY2xvc2UoKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGZ1bmN0aW9uIHN0YXJ0KCkge1xyXG4gICAgICAgIGlmIChhbmltYXRpb25DbG9zZWQpIHJldHVybjtcclxuICAgICAgICBpZiAoIW5vZGUucGFyZW50Tm9kZSkge1xyXG4gICAgICAgICAgY2xvc2UoKTtcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIGV2ZW4gdGhvdWdoIHdlIG9ubHkgcGF1c2Uga2V5ZnJhbWUgYW5pbWF0aW9ucyBoZXJlIHRoZSBwYXVzZSBmbGFnXHJcbiAgICAgICAgLy8gd2lsbCBzdGlsbCBoYXBwZW4gd2hlbiB0cmFuc2l0aW9ucyBhcmUgdXNlZC4gT25seSB0aGUgdHJhbnNpdGlvbiB3aWxsXHJcbiAgICAgICAgLy8gbm90IGJlIHBhdXNlZCBzaW5jZSB0aGF0IGlzIG5vdCBwb3NzaWJsZS4gSWYgdGhlIGFuaW1hdGlvbiBlbmRzIHdoZW5cclxuICAgICAgICAvLyBwYXVzZWQgdGhlbiBpdCB3aWxsIG5vdCBjb21wbGV0ZSB1bnRpbCB1bnBhdXNlZCBvciBjYW5jZWxsZWQuXHJcbiAgICAgICAgdmFyIHBsYXlQYXVzZSA9IGZ1bmN0aW9uKHBsYXlBbmltYXRpb24pIHtcclxuICAgICAgICAgIGlmICghYW5pbWF0aW9uQ29tcGxldGVkKSB7XHJcbiAgICAgICAgICAgIGFuaW1hdGlvblBhdXNlZCA9ICFwbGF5QW5pbWF0aW9uO1xyXG4gICAgICAgICAgICBpZiAodGltaW5ncy5hbmltYXRpb25EdXJhdGlvbikge1xyXG4gICAgICAgICAgICAgIHZhciB2YWx1ZSA9IGJsb2NrS2V5ZnJhbWVBbmltYXRpb25zKG5vZGUsIGFuaW1hdGlvblBhdXNlZCk7XHJcbiAgICAgICAgICAgICAgYW5pbWF0aW9uUGF1c2VkXHJcbiAgICAgICAgICAgICAgICAgID8gdGVtcG9yYXJ5U3R5bGVzLnB1c2godmFsdWUpXHJcbiAgICAgICAgICAgICAgICAgIDogcmVtb3ZlRnJvbUFycmF5KHRlbXBvcmFyeVN0eWxlcywgdmFsdWUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9IGVsc2UgaWYgKGFuaW1hdGlvblBhdXNlZCAmJiBwbGF5QW5pbWF0aW9uKSB7XHJcbiAgICAgICAgICAgIGFuaW1hdGlvblBhdXNlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICBjbG9zZSgpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8vIGNoZWNraW5nIHRoZSBzdGFnZ2VyIGR1cmF0aW9uIHByZXZlbnRzIGFuIGFjY2lkZW50YWxseSBjYXNjYWRlIG9mIHRoZSBDU1MgZGVsYXkgc3R5bGVcclxuICAgICAgICAvLyBiZWluZyBpbmhlcml0ZWQgZnJvbSB0aGUgcGFyZW50LiBJZiB0aGUgdHJhbnNpdGlvbiBkdXJhdGlvbiBpcyB6ZXJvIHRoZW4gd2UgY2FuIHNhZmVseVxyXG4gICAgICAgIC8vIHJlbHkgdGhhdCB0aGUgZGVsYXkgdmFsdWUgaXMgYW4gaW50ZW50aW9uYWwgc3RhZ2dlciBkZWxheSBzdHlsZS5cclxuICAgICAgICB2YXIgbWF4U3RhZ2dlciA9IGl0ZW1JbmRleCA+IDBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICYmICgodGltaW5ncy50cmFuc2l0aW9uRHVyYXRpb24gJiYgc3RhZ2dlci50cmFuc2l0aW9uRHVyYXRpb24gPT09IDApIHx8XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAodGltaW5ncy5hbmltYXRpb25EdXJhdGlvbiAmJiBzdGFnZ2VyLmFuaW1hdGlvbkR1cmF0aW9uID09PSAwKSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICYmIE1hdGgubWF4KHN0YWdnZXIuYW5pbWF0aW9uRGVsYXksIHN0YWdnZXIudHJhbnNpdGlvbkRlbGF5KTtcclxuICAgICAgICBpZiAobWF4U3RhZ2dlcikge1xyXG4gICAgICAgICAgJHRpbWVvdXQodHJpZ2dlckFuaW1hdGlvblN0YXJ0LFxyXG4gICAgICAgICAgICAgICAgICAgTWF0aC5mbG9vcihtYXhTdGFnZ2VyICogaXRlbUluZGV4ICogT05FX1NFQ09ORCksXHJcbiAgICAgICAgICAgICAgICAgICBmYWxzZSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHRyaWdnZXJBbmltYXRpb25TdGFydCgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gdGhpcyB3aWxsIGRlY29yYXRlIHRoZSBleGlzdGluZyBwcm9taXNlIHJ1bm5lciB3aXRoIHBhdXNlL3Jlc3VtZSBtZXRob2RzXHJcbiAgICAgICAgcnVubmVySG9zdC5yZXN1bWUgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgIHBsYXlQYXVzZSh0cnVlKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBydW5uZXJIb3N0LnBhdXNlID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICBwbGF5UGF1c2UoZmFsc2UpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHRyaWdnZXJBbmltYXRpb25TdGFydCgpIHtcclxuICAgICAgICAgIC8vIGp1c3QgaW5jYXNlIGEgc3RhZ2dlciBhbmltYXRpb24ga2lja3MgaW4gd2hlbiB0aGUgYW5pbWF0aW9uXHJcbiAgICAgICAgICAvLyBpdHNlbGYgd2FzIGNhbmNlbGxlZCBlbnRpcmVseVxyXG4gICAgICAgICAgaWYgKGFuaW1hdGlvbkNsb3NlZCkgcmV0dXJuO1xyXG5cclxuICAgICAgICAgIGFwcGx5QmxvY2tpbmcoZmFsc2UpO1xyXG5cclxuICAgICAgICAgIGZvckVhY2godGVtcG9yYXJ5U3R5bGVzLCBmdW5jdGlvbihlbnRyeSkge1xyXG4gICAgICAgICAgICB2YXIga2V5ID0gZW50cnlbMF07XHJcbiAgICAgICAgICAgIHZhciB2YWx1ZSA9IGVudHJ5WzFdO1xyXG4gICAgICAgICAgICBub2RlLnN0eWxlW2tleV0gPSB2YWx1ZTtcclxuICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgIGFwcGx5QW5pbWF0aW9uQ2xhc3NlcyhlbGVtZW50LCBvcHRpb25zKTtcclxuICAgICAgICAgICQkanFMaXRlLmFkZENsYXNzKGVsZW1lbnQsIGFjdGl2ZUNsYXNzZXMpO1xyXG5cclxuICAgICAgICAgIGlmIChmbGFncy5yZWNhbGN1bGF0ZVRpbWluZ1N0eWxlcykge1xyXG4gICAgICAgICAgICBmdWxsQ2xhc3NOYW1lID0gbm9kZS5jbGFzc05hbWUgKyAnICcgKyBwcmVwYXJhdGlvbkNsYXNzZXM7XHJcbiAgICAgICAgICAgIGNhY2hlS2V5ID0gZ2NzSGFzaEZuKG5vZGUsIGZ1bGxDbGFzc05hbWUpO1xyXG5cclxuICAgICAgICAgICAgdGltaW5ncyA9IGNvbXB1dGVUaW1pbmdzKG5vZGUsIGZ1bGxDbGFzc05hbWUsIGNhY2hlS2V5KTtcclxuICAgICAgICAgICAgcmVsYXRpdmVEZWxheSA9IHRpbWluZ3MubWF4RGVsYXk7XHJcbiAgICAgICAgICAgIG1heERlbGF5ID0gTWF0aC5tYXgocmVsYXRpdmVEZWxheSwgMCk7XHJcbiAgICAgICAgICAgIG1heER1cmF0aW9uID0gdGltaW5ncy5tYXhEdXJhdGlvbjtcclxuXHJcbiAgICAgICAgICAgIGlmIChtYXhEdXJhdGlvbiA9PT0gMCkge1xyXG4gICAgICAgICAgICAgIGNsb3NlKCk7XHJcbiAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBmbGFncy5oYXNUcmFuc2l0aW9ucyA9IHRpbWluZ3MudHJhbnNpdGlvbkR1cmF0aW9uID4gMDtcclxuICAgICAgICAgICAgZmxhZ3MuaGFzQW5pbWF0aW9ucyA9IHRpbWluZ3MuYW5pbWF0aW9uRHVyYXRpb24gPiAwO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIGlmIChmbGFncy5hcHBseUFuaW1hdGlvbkRlbGF5KSB7XHJcbiAgICAgICAgICAgIHJlbGF0aXZlRGVsYXkgPSB0eXBlb2Ygb3B0aW9ucy5kZWxheSAhPT0gXCJib29sZWFuXCIgJiYgdHJ1dGh5VGltaW5nVmFsdWUob3B0aW9ucy5kZWxheSlcclxuICAgICAgICAgICAgICAgICAgPyBwYXJzZUZsb2F0KG9wdGlvbnMuZGVsYXkpXHJcbiAgICAgICAgICAgICAgICAgIDogcmVsYXRpdmVEZWxheTtcclxuXHJcbiAgICAgICAgICAgIG1heERlbGF5ID0gTWF0aC5tYXgocmVsYXRpdmVEZWxheSwgMCk7XHJcbiAgICAgICAgICAgIHRpbWluZ3MuYW5pbWF0aW9uRGVsYXkgPSByZWxhdGl2ZURlbGF5O1xyXG4gICAgICAgICAgICBkZWxheVN0eWxlID0gZ2V0Q3NzRGVsYXlTdHlsZShyZWxhdGl2ZURlbGF5LCB0cnVlKTtcclxuICAgICAgICAgICAgdGVtcG9yYXJ5U3R5bGVzLnB1c2goZGVsYXlTdHlsZSk7XHJcbiAgICAgICAgICAgIG5vZGUuc3R5bGVbZGVsYXlTdHlsZVswXV0gPSBkZWxheVN0eWxlWzFdO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIG1heERlbGF5VGltZSA9IG1heERlbGF5ICogT05FX1NFQ09ORDtcclxuICAgICAgICAgIG1heER1cmF0aW9uVGltZSA9IG1heER1cmF0aW9uICogT05FX1NFQ09ORDtcclxuXHJcbiAgICAgICAgICBpZiAob3B0aW9ucy5lYXNpbmcpIHtcclxuICAgICAgICAgICAgdmFyIGVhc2VQcm9wLCBlYXNlVmFsID0gb3B0aW9ucy5lYXNpbmc7XHJcbiAgICAgICAgICAgIGlmIChmbGFncy5oYXNUcmFuc2l0aW9ucykge1xyXG4gICAgICAgICAgICAgIGVhc2VQcm9wID0gVFJBTlNJVElPTl9QUk9QICsgVElNSU5HX0tFWTtcclxuICAgICAgICAgICAgICB0ZW1wb3JhcnlTdHlsZXMucHVzaChbZWFzZVByb3AsIGVhc2VWYWxdKTtcclxuICAgICAgICAgICAgICBub2RlLnN0eWxlW2Vhc2VQcm9wXSA9IGVhc2VWYWw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGZsYWdzLmhhc0FuaW1hdGlvbnMpIHtcclxuICAgICAgICAgICAgICBlYXNlUHJvcCA9IEFOSU1BVElPTl9QUk9QICsgVElNSU5HX0tFWTtcclxuICAgICAgICAgICAgICB0ZW1wb3JhcnlTdHlsZXMucHVzaChbZWFzZVByb3AsIGVhc2VWYWxdKTtcclxuICAgICAgICAgICAgICBub2RlLnN0eWxlW2Vhc2VQcm9wXSA9IGVhc2VWYWw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBpZiAodGltaW5ncy50cmFuc2l0aW9uRHVyYXRpb24pIHtcclxuICAgICAgICAgICAgZXZlbnRzLnB1c2goVFJBTlNJVElPTkVORF9FVkVOVCk7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgaWYgKHRpbWluZ3MuYW5pbWF0aW9uRHVyYXRpb24pIHtcclxuICAgICAgICAgICAgZXZlbnRzLnB1c2goQU5JTUFUSU9ORU5EX0VWRU5UKTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBzdGFydFRpbWUgPSBEYXRlLm5vdygpO1xyXG4gICAgICAgICAgdmFyIHRpbWVyVGltZSA9IG1heERlbGF5VGltZSArIENMT1NJTkdfVElNRV9CVUZGRVIgKiBtYXhEdXJhdGlvblRpbWU7XHJcbiAgICAgICAgICB2YXIgZW5kVGltZSA9IHN0YXJ0VGltZSArIHRpbWVyVGltZTtcclxuXHJcbiAgICAgICAgICB2YXIgYW5pbWF0aW9uc0RhdGEgPSBlbGVtZW50LmRhdGEoQU5JTUFURV9USU1FUl9LRVkpIHx8IFtdO1xyXG4gICAgICAgICAgdmFyIHNldHVwRmFsbGJhY2tUaW1lciA9IHRydWU7XHJcbiAgICAgICAgICBpZiAoYW5pbWF0aW9uc0RhdGEubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIHZhciBjdXJyZW50VGltZXJEYXRhID0gYW5pbWF0aW9uc0RhdGFbMF07XHJcbiAgICAgICAgICAgIHNldHVwRmFsbGJhY2tUaW1lciA9IGVuZFRpbWUgPiBjdXJyZW50VGltZXJEYXRhLmV4cGVjdGVkRW5kVGltZTtcclxuICAgICAgICAgICAgaWYgKHNldHVwRmFsbGJhY2tUaW1lcikge1xyXG4gICAgICAgICAgICAgICR0aW1lb3V0LmNhbmNlbChjdXJyZW50VGltZXJEYXRhLnRpbWVyKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICBhbmltYXRpb25zRGF0YS5wdXNoKGNsb3NlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIGlmIChzZXR1cEZhbGxiYWNrVGltZXIpIHtcclxuICAgICAgICAgICAgdmFyIHRpbWVyID0gJHRpbWVvdXQob25BbmltYXRpb25FeHBpcmVkLCB0aW1lclRpbWUsIGZhbHNlKTtcclxuICAgICAgICAgICAgYW5pbWF0aW9uc0RhdGFbMF0gPSB7XHJcbiAgICAgICAgICAgICAgdGltZXI6IHRpbWVyLFxyXG4gICAgICAgICAgICAgIGV4cGVjdGVkRW5kVGltZTogZW5kVGltZVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBhbmltYXRpb25zRGF0YS5wdXNoKGNsb3NlKTtcclxuICAgICAgICAgICAgZWxlbWVudC5kYXRhKEFOSU1BVEVfVElNRVJfS0VZLCBhbmltYXRpb25zRGF0YSk7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgaWYgKGV2ZW50cy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgZWxlbWVudC5vbihldmVudHMuam9pbignICcpLCBvbkFuaW1hdGlvblByb2dyZXNzKTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBpZiAob3B0aW9ucy50bykge1xyXG4gICAgICAgICAgICBpZiAob3B0aW9ucy5jbGVhbnVwU3R5bGVzKSB7XHJcbiAgICAgICAgICAgICAgcmVnaXN0ZXJSZXN0b3JhYmxlU3R5bGVzKHJlc3RvcmVTdHlsZXMsIG5vZGUsIE9iamVjdC5rZXlzKG9wdGlvbnMudG8pKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBhcHBseUFuaW1hdGlvblRvU3R5bGVzKGVsZW1lbnQsIG9wdGlvbnMpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gb25BbmltYXRpb25FeHBpcmVkKCkge1xyXG4gICAgICAgICAgdmFyIGFuaW1hdGlvbnNEYXRhID0gZWxlbWVudC5kYXRhKEFOSU1BVEVfVElNRVJfS0VZKTtcclxuXHJcbiAgICAgICAgICAvLyB0aGlzIHdpbGwgYmUgZmFsc2UgaW4gdGhlIGV2ZW50IHRoYXQgdGhlIGVsZW1lbnQgd2FzXHJcbiAgICAgICAgICAvLyByZW1vdmVkIGZyb20gdGhlIERPTSAodmlhIGEgbGVhdmUgYW5pbWF0aW9uIG9yIHNvbWV0aGluZ1xyXG4gICAgICAgICAgLy8gc2ltaWxhcilcclxuICAgICAgICAgIGlmIChhbmltYXRpb25zRGF0YSkge1xyXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMTsgaSA8IGFuaW1hdGlvbnNEYXRhLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgYW5pbWF0aW9uc0RhdGFbaV0oKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbGVtZW50LnJlbW92ZURhdGEoQU5JTUFURV9USU1FUl9LRVkpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfTtcclxuICB9XTtcclxufV07XHJcblxyXG52YXIgJCRBbmltYXRlQ3NzRHJpdmVyUHJvdmlkZXIgPSBbJyQkYW5pbWF0aW9uUHJvdmlkZXInLCBmdW5jdGlvbigkJGFuaW1hdGlvblByb3ZpZGVyKSB7XHJcbiAgJCRhbmltYXRpb25Qcm92aWRlci5kcml2ZXJzLnB1c2goJyQkYW5pbWF0ZUNzc0RyaXZlcicpO1xyXG5cclxuICB2YXIgTkdfQU5JTUFURV9TSElNX0NMQVNTX05BTUUgPSAnbmctYW5pbWF0ZS1zaGltJztcclxuICB2YXIgTkdfQU5JTUFURV9BTkNIT1JfQ0xBU1NfTkFNRSA9ICduZy1hbmNob3InO1xyXG5cclxuICB2YXIgTkdfT1VUX0FOQ0hPUl9DTEFTU19OQU1FID0gJ25nLWFuY2hvci1vdXQnO1xyXG4gIHZhciBOR19JTl9BTkNIT1JfQ0xBU1NfTkFNRSA9ICduZy1hbmNob3ItaW4nO1xyXG5cclxuICBmdW5jdGlvbiBpc0RvY3VtZW50RnJhZ21lbnQobm9kZSkge1xyXG4gICAgcmV0dXJuIG5vZGUucGFyZW50Tm9kZSAmJiBub2RlLnBhcmVudE5vZGUubm9kZVR5cGUgPT09IDExO1xyXG4gIH1cclxuXHJcbiAgdGhpcy4kZ2V0ID0gWyckYW5pbWF0ZUNzcycsICckcm9vdFNjb3BlJywgJyQkQW5pbWF0ZVJ1bm5lcicsICckcm9vdEVsZW1lbnQnLCAnJHNuaWZmZXInLCAnJCRqcUxpdGUnLCAnJGRvY3VtZW50JyxcclxuICAgICAgIGZ1bmN0aW9uKCRhbmltYXRlQ3NzLCAgICRyb290U2NvcGUsICAgJCRBbmltYXRlUnVubmVyLCAgICRyb290RWxlbWVudCwgICAkc25pZmZlciwgICAkJGpxTGl0ZSwgICAkZG9jdW1lbnQpIHtcclxuXHJcbiAgICAvLyBvbmx5IGJyb3dzZXJzIHRoYXQgc3VwcG9ydCB0aGVzZSBwcm9wZXJ0aWVzIGNhbiByZW5kZXIgYW5pbWF0aW9uc1xyXG4gICAgaWYgKCEkc25pZmZlci5hbmltYXRpb25zICYmICEkc25pZmZlci50cmFuc2l0aW9ucykgcmV0dXJuIG5vb3A7XHJcblxyXG4gICAgdmFyIGJvZHlOb2RlID0gJGRvY3VtZW50WzBdLmJvZHk7XHJcbiAgICB2YXIgcm9vdE5vZGUgPSBnZXREb21Ob2RlKCRyb290RWxlbWVudCk7XHJcblxyXG4gICAgdmFyIHJvb3RCb2R5RWxlbWVudCA9IGpxTGl0ZShcclxuICAgICAgLy8gdGhpcyBpcyB0byBhdm9pZCB1c2luZyBzb21ldGhpbmcgdGhhdCBleGlzdHMgb3V0c2lkZSBvZiB0aGUgYm9keVxyXG4gICAgICAvLyB3ZSBhbHNvIHNwZWNpYWwgY2FzZSB0aGUgZG9jIGZyYWdtZW50IGNhc2UgYmVjYXVzZSBvdXIgdW5pdCB0ZXN0IGNvZGVcclxuICAgICAgLy8gYXBwZW5kcyB0aGUgJHJvb3RFbGVtZW50IHRvIHRoZSBib2R5IGFmdGVyIHRoZSBhcHAgaGFzIGJlZW4gYm9vdHN0cmFwcGVkXHJcbiAgICAgIGlzRG9jdW1lbnRGcmFnbWVudChyb290Tm9kZSkgfHwgYm9keU5vZGUuY29udGFpbnMocm9vdE5vZGUpID8gcm9vdE5vZGUgOiBib2R5Tm9kZVxyXG4gICAgKTtcclxuXHJcbiAgICB2YXIgYXBwbHlBbmltYXRpb25DbGFzc2VzID0gYXBwbHlBbmltYXRpb25DbGFzc2VzRmFjdG9yeSgkJGpxTGl0ZSk7XHJcblxyXG4gICAgcmV0dXJuIGZ1bmN0aW9uIGluaXREcml2ZXJGbihhbmltYXRpb25EZXRhaWxzKSB7XHJcbiAgICAgIHJldHVybiBhbmltYXRpb25EZXRhaWxzLmZyb20gJiYgYW5pbWF0aW9uRGV0YWlscy50b1xyXG4gICAgICAgICAgPyBwcmVwYXJlRnJvbVRvQW5jaG9yQW5pbWF0aW9uKGFuaW1hdGlvbkRldGFpbHMuZnJvbSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbmltYXRpb25EZXRhaWxzLnRvLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFuaW1hdGlvbkRldGFpbHMuY2xhc3NlcyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbmltYXRpb25EZXRhaWxzLmFuY2hvcnMpXHJcbiAgICAgICAgICA6IHByZXBhcmVSZWd1bGFyQW5pbWF0aW9uKGFuaW1hdGlvbkRldGFpbHMpO1xyXG4gICAgfTtcclxuXHJcbiAgICBmdW5jdGlvbiBmaWx0ZXJDc3NDbGFzc2VzKGNsYXNzZXMpIHtcclxuICAgICAgLy9yZW1vdmUgYWxsIHRoZSBgbmctYCBzdHVmZlxyXG4gICAgICByZXR1cm4gY2xhc3Nlcy5yZXBsYWNlKC9cXGJuZy1cXFMrXFxiL2csICcnKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBnZXRVbmlxdWVWYWx1ZXMoYSwgYikge1xyXG4gICAgICBpZiAoaXNTdHJpbmcoYSkpIGEgPSBhLnNwbGl0KCcgJyk7XHJcbiAgICAgIGlmIChpc1N0cmluZyhiKSkgYiA9IGIuc3BsaXQoJyAnKTtcclxuICAgICAgcmV0dXJuIGEuZmlsdGVyKGZ1bmN0aW9uKHZhbCkge1xyXG4gICAgICAgIHJldHVybiBiLmluZGV4T2YodmFsKSA9PT0gLTE7XHJcbiAgICAgIH0pLmpvaW4oJyAnKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBwcmVwYXJlQW5jaG9yZWRBbmltYXRpb24oY2xhc3Nlcywgb3V0QW5jaG9yLCBpbkFuY2hvcikge1xyXG4gICAgICB2YXIgY2xvbmUgPSBqcUxpdGUoZ2V0RG9tTm9kZShvdXRBbmNob3IpLmNsb25lTm9kZSh0cnVlKSk7XHJcbiAgICAgIHZhciBzdGFydGluZ0NsYXNzZXMgPSBmaWx0ZXJDc3NDbGFzc2VzKGdldENsYXNzVmFsKGNsb25lKSk7XHJcblxyXG4gICAgICBvdXRBbmNob3IuYWRkQ2xhc3MoTkdfQU5JTUFURV9TSElNX0NMQVNTX05BTUUpO1xyXG4gICAgICBpbkFuY2hvci5hZGRDbGFzcyhOR19BTklNQVRFX1NISU1fQ0xBU1NfTkFNRSk7XHJcblxyXG4gICAgICBjbG9uZS5hZGRDbGFzcyhOR19BTklNQVRFX0FOQ0hPUl9DTEFTU19OQU1FKTtcclxuXHJcbiAgICAgIHJvb3RCb2R5RWxlbWVudC5hcHBlbmQoY2xvbmUpO1xyXG5cclxuICAgICAgdmFyIGFuaW1hdG9ySW4sIGFuaW1hdG9yT3V0ID0gcHJlcGFyZU91dEFuaW1hdGlvbigpO1xyXG5cclxuICAgICAgLy8gdGhlIHVzZXIgbWF5IG5vdCBlbmQgdXAgdXNpbmcgdGhlIGBvdXRgIGFuaW1hdGlvbiBhbmRcclxuICAgICAgLy8gb25seSBtYWtpbmcgdXNlIG9mIHRoZSBgaW5gIGFuaW1hdGlvbiBvciB2aWNlLXZlcnNhLlxyXG4gICAgICAvLyBJbiBlaXRoZXIgY2FzZSB3ZSBzaG91bGQgYWxsb3cgdGhpcyBhbmQgbm90IGFzc3VtZSB0aGVcclxuICAgICAgLy8gYW5pbWF0aW9uIGlzIG92ZXIgdW5sZXNzIGJvdGggYW5pbWF0aW9ucyBhcmUgbm90IHVzZWQuXHJcbiAgICAgIGlmICghYW5pbWF0b3JPdXQpIHtcclxuICAgICAgICBhbmltYXRvckluID0gcHJlcGFyZUluQW5pbWF0aW9uKCk7XHJcbiAgICAgICAgaWYgKCFhbmltYXRvckluKSB7XHJcbiAgICAgICAgICByZXR1cm4gZW5kKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICB2YXIgc3RhcnRpbmdBbmltYXRvciA9IGFuaW1hdG9yT3V0IHx8IGFuaW1hdG9ySW47XHJcblxyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIHN0YXJ0OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgIHZhciBydW5uZXI7XHJcblxyXG4gICAgICAgICAgdmFyIGN1cnJlbnRBbmltYXRpb24gPSBzdGFydGluZ0FuaW1hdG9yLnN0YXJ0KCk7XHJcbiAgICAgICAgICBjdXJyZW50QW5pbWF0aW9uLmRvbmUoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGN1cnJlbnRBbmltYXRpb24gPSBudWxsO1xyXG4gICAgICAgICAgICBpZiAoIWFuaW1hdG9ySW4pIHtcclxuICAgICAgICAgICAgICBhbmltYXRvckluID0gcHJlcGFyZUluQW5pbWF0aW9uKCk7XHJcbiAgICAgICAgICAgICAgaWYgKGFuaW1hdG9ySW4pIHtcclxuICAgICAgICAgICAgICAgIGN1cnJlbnRBbmltYXRpb24gPSBhbmltYXRvckluLnN0YXJ0KCk7XHJcbiAgICAgICAgICAgICAgICBjdXJyZW50QW5pbWF0aW9uLmRvbmUoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgIGN1cnJlbnRBbmltYXRpb24gPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgICBlbmQoKTtcclxuICAgICAgICAgICAgICAgICAgcnVubmVyLmNvbXBsZXRlKCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBjdXJyZW50QW5pbWF0aW9uO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyBpbiB0aGUgZXZlbnQgdGhhdCB0aGVyZSBpcyBubyBgaW5gIGFuaW1hdGlvblxyXG4gICAgICAgICAgICBlbmQoKTtcclxuICAgICAgICAgICAgcnVubmVyLmNvbXBsZXRlKCk7XHJcbiAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICBydW5uZXIgPSBuZXcgJCRBbmltYXRlUnVubmVyKHtcclxuICAgICAgICAgICAgZW5kOiBlbmRGbixcclxuICAgICAgICAgICAgY2FuY2VsOiBlbmRGblxyXG4gICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgcmV0dXJuIHJ1bm5lcjtcclxuXHJcbiAgICAgICAgICBmdW5jdGlvbiBlbmRGbigpIHtcclxuICAgICAgICAgICAgaWYgKGN1cnJlbnRBbmltYXRpb24pIHtcclxuICAgICAgICAgICAgICBjdXJyZW50QW5pbWF0aW9uLmVuZCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9O1xyXG5cclxuICAgICAgZnVuY3Rpb24gY2FsY3VsYXRlQW5jaG9yU3R5bGVzKGFuY2hvcikge1xyXG4gICAgICAgIHZhciBzdHlsZXMgPSB7fTtcclxuXHJcbiAgICAgICAgdmFyIGNvb3JkcyA9IGdldERvbU5vZGUoYW5jaG9yKS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcclxuXHJcbiAgICAgICAgLy8gd2UgaXRlcmF0ZSBkaXJlY3RseSBzaW5jZSBzYWZhcmkgbWVzc2VzIHVwIGFuZCBkb2Vzbid0IHJldHVyblxyXG4gICAgICAgIC8vIGFsbCB0aGUga2V5cyBmb3IgdGhlIGNvb3JkcyBvYmplY3Qgd2hlbiBpdGVyYXRlZFxyXG4gICAgICAgIGZvckVhY2goWyd3aWR0aCcsJ2hlaWdodCcsJ3RvcCcsJ2xlZnQnXSwgZnVuY3Rpb24oa2V5KSB7XHJcbiAgICAgICAgICB2YXIgdmFsdWUgPSBjb29yZHNba2V5XTtcclxuICAgICAgICAgIHN3aXRjaCAoa2V5KSB7XHJcbiAgICAgICAgICAgIGNhc2UgJ3RvcCc6XHJcbiAgICAgICAgICAgICAgdmFsdWUgKz0gYm9keU5vZGUuc2Nyb2xsVG9wO1xyXG4gICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlICdsZWZ0JzpcclxuICAgICAgICAgICAgICB2YWx1ZSArPSBib2R5Tm9kZS5zY3JvbGxMZWZ0O1xyXG4gICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgc3R5bGVzW2tleV0gPSBNYXRoLmZsb29yKHZhbHVlKSArICdweCc7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIHN0eWxlcztcclxuICAgICAgfVxyXG5cclxuICAgICAgZnVuY3Rpb24gcHJlcGFyZU91dEFuaW1hdGlvbigpIHtcclxuICAgICAgICB2YXIgYW5pbWF0b3IgPSAkYW5pbWF0ZUNzcyhjbG9uZSwge1xyXG4gICAgICAgICAgYWRkQ2xhc3M6IE5HX09VVF9BTkNIT1JfQ0xBU1NfTkFNRSxcclxuICAgICAgICAgIGRlbGF5OiB0cnVlLFxyXG4gICAgICAgICAgZnJvbTogY2FsY3VsYXRlQW5jaG9yU3R5bGVzKG91dEFuY2hvcilcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gcmVhZCB0aGUgY29tbWVudCB3aXRoaW4gYHByZXBhcmVSZWd1bGFyQW5pbWF0aW9uYCB0byB1bmRlcnN0YW5kXHJcbiAgICAgICAgLy8gd2h5IHRoaXMgY2hlY2sgaXMgbmVjZXNzYXJ5XHJcbiAgICAgICAgcmV0dXJuIGFuaW1hdG9yLiQkd2lsbEFuaW1hdGUgPyBhbmltYXRvciA6IG51bGw7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGZ1bmN0aW9uIGdldENsYXNzVmFsKGVsZW1lbnQpIHtcclxuICAgICAgICByZXR1cm4gZWxlbWVudC5hdHRyKCdjbGFzcycpIHx8ICcnO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBmdW5jdGlvbiBwcmVwYXJlSW5BbmltYXRpb24oKSB7XHJcbiAgICAgICAgdmFyIGVuZGluZ0NsYXNzZXMgPSBmaWx0ZXJDc3NDbGFzc2VzKGdldENsYXNzVmFsKGluQW5jaG9yKSk7XHJcbiAgICAgICAgdmFyIHRvQWRkID0gZ2V0VW5pcXVlVmFsdWVzKGVuZGluZ0NsYXNzZXMsIHN0YXJ0aW5nQ2xhc3Nlcyk7XHJcbiAgICAgICAgdmFyIHRvUmVtb3ZlID0gZ2V0VW5pcXVlVmFsdWVzKHN0YXJ0aW5nQ2xhc3NlcywgZW5kaW5nQ2xhc3Nlcyk7XHJcblxyXG4gICAgICAgIHZhciBhbmltYXRvciA9ICRhbmltYXRlQ3NzKGNsb25lLCB7XHJcbiAgICAgICAgICB0bzogY2FsY3VsYXRlQW5jaG9yU3R5bGVzKGluQW5jaG9yKSxcclxuICAgICAgICAgIGFkZENsYXNzOiBOR19JTl9BTkNIT1JfQ0xBU1NfTkFNRSArICcgJyArIHRvQWRkLFxyXG4gICAgICAgICAgcmVtb3ZlQ2xhc3M6IE5HX09VVF9BTkNIT1JfQ0xBU1NfTkFNRSArICcgJyArIHRvUmVtb3ZlLFxyXG4gICAgICAgICAgZGVsYXk6IHRydWVcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gcmVhZCB0aGUgY29tbWVudCB3aXRoaW4gYHByZXBhcmVSZWd1bGFyQW5pbWF0aW9uYCB0byB1bmRlcnN0YW5kXHJcbiAgICAgICAgLy8gd2h5IHRoaXMgY2hlY2sgaXMgbmVjZXNzYXJ5XHJcbiAgICAgICAgcmV0dXJuIGFuaW1hdG9yLiQkd2lsbEFuaW1hdGUgPyBhbmltYXRvciA6IG51bGw7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGZ1bmN0aW9uIGVuZCgpIHtcclxuICAgICAgICBjbG9uZS5yZW1vdmUoKTtcclxuICAgICAgICBvdXRBbmNob3IucmVtb3ZlQ2xhc3MoTkdfQU5JTUFURV9TSElNX0NMQVNTX05BTUUpO1xyXG4gICAgICAgIGluQW5jaG9yLnJlbW92ZUNsYXNzKE5HX0FOSU1BVEVfU0hJTV9DTEFTU19OQU1FKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHByZXBhcmVGcm9tVG9BbmNob3JBbmltYXRpb24oZnJvbSwgdG8sIGNsYXNzZXMsIGFuY2hvcnMpIHtcclxuICAgICAgdmFyIGZyb21BbmltYXRpb24gPSBwcmVwYXJlUmVndWxhckFuaW1hdGlvbihmcm9tLCBub29wKTtcclxuICAgICAgdmFyIHRvQW5pbWF0aW9uID0gcHJlcGFyZVJlZ3VsYXJBbmltYXRpb24odG8sIG5vb3ApO1xyXG5cclxuICAgICAgdmFyIGFuY2hvckFuaW1hdGlvbnMgPSBbXTtcclxuICAgICAgZm9yRWFjaChhbmNob3JzLCBmdW5jdGlvbihhbmNob3IpIHtcclxuICAgICAgICB2YXIgb3V0RWxlbWVudCA9IGFuY2hvclsnb3V0J107XHJcbiAgICAgICAgdmFyIGluRWxlbWVudCA9IGFuY2hvclsnaW4nXTtcclxuICAgICAgICB2YXIgYW5pbWF0b3IgPSBwcmVwYXJlQW5jaG9yZWRBbmltYXRpb24oY2xhc3Nlcywgb3V0RWxlbWVudCwgaW5FbGVtZW50KTtcclxuICAgICAgICBpZiAoYW5pbWF0b3IpIHtcclxuICAgICAgICAgIGFuY2hvckFuaW1hdGlvbnMucHVzaChhbmltYXRvcik7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIC8vIG5vIHBvaW50IGluIGRvaW5nIGFueXRoaW5nIHdoZW4gdGhlcmUgYXJlIG5vIGVsZW1lbnRzIHRvIGFuaW1hdGVcclxuICAgICAgaWYgKCFmcm9tQW5pbWF0aW9uICYmICF0b0FuaW1hdGlvbiAmJiBhbmNob3JBbmltYXRpb25zLmxlbmd0aCA9PT0gMCkgcmV0dXJuO1xyXG5cclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICBzdGFydDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICB2YXIgYW5pbWF0aW9uUnVubmVycyA9IFtdO1xyXG5cclxuICAgICAgICAgIGlmIChmcm9tQW5pbWF0aW9uKSB7XHJcbiAgICAgICAgICAgIGFuaW1hdGlvblJ1bm5lcnMucHVzaChmcm9tQW5pbWF0aW9uLnN0YXJ0KCkpO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIGlmICh0b0FuaW1hdGlvbikge1xyXG4gICAgICAgICAgICBhbmltYXRpb25SdW5uZXJzLnB1c2godG9BbmltYXRpb24uc3RhcnQoKSk7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgZm9yRWFjaChhbmNob3JBbmltYXRpb25zLCBmdW5jdGlvbihhbmltYXRpb24pIHtcclxuICAgICAgICAgICAgYW5pbWF0aW9uUnVubmVycy5wdXNoKGFuaW1hdGlvbi5zdGFydCgpKTtcclxuICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgIHZhciBydW5uZXIgPSBuZXcgJCRBbmltYXRlUnVubmVyKHtcclxuICAgICAgICAgICAgZW5kOiBlbmRGbixcclxuICAgICAgICAgICAgY2FuY2VsOiBlbmRGbiAvLyBDU1MtZHJpdmVuIGFuaW1hdGlvbnMgY2Fubm90IGJlIGNhbmNlbGxlZCwgb25seSBlbmRlZFxyXG4gICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgJCRBbmltYXRlUnVubmVyLmFsbChhbmltYXRpb25SdW5uZXJzLCBmdW5jdGlvbihzdGF0dXMpIHtcclxuICAgICAgICAgICAgcnVubmVyLmNvbXBsZXRlKHN0YXR1cyk7XHJcbiAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICByZXR1cm4gcnVubmVyO1xyXG5cclxuICAgICAgICAgIGZ1bmN0aW9uIGVuZEZuKCkge1xyXG4gICAgICAgICAgICBmb3JFYWNoKGFuaW1hdGlvblJ1bm5lcnMsIGZ1bmN0aW9uKHJ1bm5lcikge1xyXG4gICAgICAgICAgICAgIHJ1bm5lci5lbmQoKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9O1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHByZXBhcmVSZWd1bGFyQW5pbWF0aW9uKGFuaW1hdGlvbkRldGFpbHMpIHtcclxuICAgICAgdmFyIGVsZW1lbnQgPSBhbmltYXRpb25EZXRhaWxzLmVsZW1lbnQ7XHJcbiAgICAgIHZhciBvcHRpb25zID0gYW5pbWF0aW9uRGV0YWlscy5vcHRpb25zIHx8IHt9O1xyXG5cclxuICAgICAgaWYgKGFuaW1hdGlvbkRldGFpbHMuc3RydWN0dXJhbCkge1xyXG4gICAgICAgIG9wdGlvbnMuZXZlbnQgPSBhbmltYXRpb25EZXRhaWxzLmV2ZW50O1xyXG4gICAgICAgIG9wdGlvbnMuc3RydWN0dXJhbCA9IHRydWU7XHJcbiAgICAgICAgb3B0aW9ucy5hcHBseUNsYXNzZXNFYXJseSA9IHRydWU7XHJcblxyXG4gICAgICAgIC8vIHdlIHNwZWNpYWwgY2FzZSB0aGUgbGVhdmUgYW5pbWF0aW9uIHNpbmNlIHdlIHdhbnQgdG8gZW5zdXJlIHRoYXRcclxuICAgICAgICAvLyB0aGUgZWxlbWVudCBpcyByZW1vdmVkIGFzIHNvb24gYXMgdGhlIGFuaW1hdGlvbiBpcyBvdmVyLiBPdGhlcndpc2VcclxuICAgICAgICAvLyBhIGZsaWNrZXIgbWlnaHQgYXBwZWFyIG9yIHRoZSBlbGVtZW50IG1heSBub3QgYmUgcmVtb3ZlZCBhdCBhbGxcclxuICAgICAgICBpZiAoYW5pbWF0aW9uRGV0YWlscy5ldmVudCA9PT0gJ2xlYXZlJykge1xyXG4gICAgICAgICAgb3B0aW9ucy5vbkRvbmUgPSBvcHRpb25zLmRvbU9wZXJhdGlvbjtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIFdlIGFzc2lnbiB0aGUgcHJlcGFyYXRpb25DbGFzc2VzIGFzIHRoZSBhY3R1YWwgYW5pbWF0aW9uIGV2ZW50IHNpbmNlXHJcbiAgICAgIC8vIHRoZSBpbnRlcm5hbHMgb2YgJGFuaW1hdGVDc3Mgd2lsbCBqdXN0IHN1ZmZpeCB0aGUgZXZlbnQgdG9rZW4gdmFsdWVzXHJcbiAgICAgIC8vIHdpdGggYC1hY3RpdmVgIHRvIHRyaWdnZXIgdGhlIGFuaW1hdGlvbi5cclxuICAgICAgaWYgKG9wdGlvbnMucHJlcGFyYXRpb25DbGFzc2VzKSB7XHJcbiAgICAgICAgb3B0aW9ucy5ldmVudCA9IGNvbmNhdFdpdGhTcGFjZShvcHRpb25zLmV2ZW50LCBvcHRpb25zLnByZXBhcmF0aW9uQ2xhc3Nlcyk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHZhciBhbmltYXRvciA9ICRhbmltYXRlQ3NzKGVsZW1lbnQsIG9wdGlvbnMpO1xyXG5cclxuICAgICAgLy8gdGhlIGRyaXZlciBsb29rdXAgY29kZSBpbnNpZGUgb2YgJCRhbmltYXRpb24gYXR0ZW1wdHMgdG8gc3Bhd24gYVxyXG4gICAgICAvLyBkcml2ZXIgb25lIGJ5IG9uZSB1bnRpbCBhIGRyaXZlciByZXR1cm5zIGEuJCR3aWxsQW5pbWF0ZSBhbmltYXRvciBvYmplY3QuXHJcbiAgICAgIC8vICRhbmltYXRlQ3NzIHdpbGwgYWx3YXlzIHJldHVybiBhbiBvYmplY3QsIGhvd2V2ZXIsIGl0IHdpbGwgcGFzcyBpblxyXG4gICAgICAvLyBhIGZsYWcgYXMgYSBoaW50IGFzIHRvIHdoZXRoZXIgYW4gYW5pbWF0aW9uIHdhcyBkZXRlY3RlZCBvciBub3RcclxuICAgICAgcmV0dXJuIGFuaW1hdG9yLiQkd2lsbEFuaW1hdGUgPyBhbmltYXRvciA6IG51bGw7XHJcbiAgICB9XHJcbiAgfV07XHJcbn1dO1xyXG5cclxuLy8gVE9ETyhtYXRza28pOiB1c2UgY2FjaGluZyBoZXJlIHRvIHNwZWVkIHRoaW5ncyB1cCBmb3IgZGV0ZWN0aW9uXHJcbi8vIFRPRE8obWF0c2tvKTogYWRkIGRvY3VtZW50YXRpb25cclxuLy8gIGJ5IHRoZSB0aW1lLi4uXHJcblxyXG52YXIgJCRBbmltYXRlSnNQcm92aWRlciA9IFsnJGFuaW1hdGVQcm92aWRlcicsIGZ1bmN0aW9uKCRhbmltYXRlUHJvdmlkZXIpIHtcclxuICB0aGlzLiRnZXQgPSBbJyRpbmplY3RvcicsICckJEFuaW1hdGVSdW5uZXInLCAnJCRqcUxpdGUnLFxyXG4gICAgICAgZnVuY3Rpb24oJGluamVjdG9yLCAgICQkQW5pbWF0ZVJ1bm5lciwgICAkJGpxTGl0ZSkge1xyXG5cclxuICAgIHZhciBhcHBseUFuaW1hdGlvbkNsYXNzZXMgPSBhcHBseUFuaW1hdGlvbkNsYXNzZXNGYWN0b3J5KCQkanFMaXRlKTtcclxuICAgICAgICAgLy8gJGFuaW1hdGVKcyhlbGVtZW50LCAnZW50ZXInKTtcclxuICAgIHJldHVybiBmdW5jdGlvbihlbGVtZW50LCBldmVudCwgY2xhc3Nlcywgb3B0aW9ucykge1xyXG4gICAgICB2YXIgYW5pbWF0aW9uQ2xvc2VkID0gZmFsc2U7XHJcblxyXG4gICAgICAvLyB0aGUgYGNsYXNzZXNgIGFyZ3VtZW50IGlzIG9wdGlvbmFsIGFuZCBpZiBpdCBpcyBub3QgdXNlZFxyXG4gICAgICAvLyB0aGVuIHRoZSBjbGFzc2VzIHdpbGwgYmUgcmVzb2x2ZWQgZnJvbSB0aGUgZWxlbWVudCdzIGNsYXNzTmFtZVxyXG4gICAgICAvLyBwcm9wZXJ0eSBhcyB3ZWxsIGFzIG9wdGlvbnMuYWRkQ2xhc3Mvb3B0aW9ucy5yZW1vdmVDbGFzcy5cclxuICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDMgJiYgaXNPYmplY3QoY2xhc3NlcykpIHtcclxuICAgICAgICBvcHRpb25zID0gY2xhc3NlcztcclxuICAgICAgICBjbGFzc2VzID0gbnVsbDtcclxuICAgICAgfVxyXG5cclxuICAgICAgb3B0aW9ucyA9IHByZXBhcmVBbmltYXRpb25PcHRpb25zKG9wdGlvbnMpO1xyXG4gICAgICBpZiAoIWNsYXNzZXMpIHtcclxuICAgICAgICBjbGFzc2VzID0gZWxlbWVudC5hdHRyKCdjbGFzcycpIHx8ICcnO1xyXG4gICAgICAgIGlmIChvcHRpb25zLmFkZENsYXNzKSB7XHJcbiAgICAgICAgICBjbGFzc2VzICs9ICcgJyArIG9wdGlvbnMuYWRkQ2xhc3M7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChvcHRpb25zLnJlbW92ZUNsYXNzKSB7XHJcbiAgICAgICAgICBjbGFzc2VzICs9ICcgJyArIG9wdGlvbnMucmVtb3ZlQ2xhc3M7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICB2YXIgY2xhc3Nlc1RvQWRkID0gb3B0aW9ucy5hZGRDbGFzcztcclxuICAgICAgdmFyIGNsYXNzZXNUb1JlbW92ZSA9IG9wdGlvbnMucmVtb3ZlQ2xhc3M7XHJcblxyXG4gICAgICAvLyB0aGUgbG9va3VwQW5pbWF0aW9ucyBmdW5jdGlvbiByZXR1cm5zIGEgc2VyaWVzIG9mIGFuaW1hdGlvbiBvYmplY3RzIHRoYXQgYXJlXHJcbiAgICAgIC8vIG1hdGNoZWQgdXAgd2l0aCBvbmUgb3IgbW9yZSBvZiB0aGUgQ1NTIGNsYXNzZXMuIFRoZXNlIGFuaW1hdGlvbiBvYmplY3RzIGFyZVxyXG4gICAgICAvLyBkZWZpbmVkIHZpYSB0aGUgbW9kdWxlLmFuaW1hdGlvbiBmYWN0b3J5IGZ1bmN0aW9uLiBJZiBub3RoaW5nIGlzIGRldGVjdGVkIHRoZW5cclxuICAgICAgLy8gd2UgZG9uJ3QgcmV0dXJuIGFueXRoaW5nIHdoaWNoIHRoZW4gbWFrZXMgJGFuaW1hdGlvbiBxdWVyeSB0aGUgbmV4dCBkcml2ZXIuXHJcbiAgICAgIHZhciBhbmltYXRpb25zID0gbG9va3VwQW5pbWF0aW9ucyhjbGFzc2VzKTtcclxuICAgICAgdmFyIGJlZm9yZSwgYWZ0ZXI7XHJcbiAgICAgIGlmIChhbmltYXRpb25zLmxlbmd0aCkge1xyXG4gICAgICAgIHZhciBhZnRlckZuLCBiZWZvcmVGbjtcclxuICAgICAgICBpZiAoZXZlbnQgPT0gJ2xlYXZlJykge1xyXG4gICAgICAgICAgYmVmb3JlRm4gPSAnbGVhdmUnO1xyXG4gICAgICAgICAgYWZ0ZXJGbiA9ICdhZnRlckxlYXZlJzsgLy8gVE9ETyhtYXRza28pOiBnZXQgcmlkIG9mIHRoaXNcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgYmVmb3JlRm4gPSAnYmVmb3JlJyArIGV2ZW50LmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgZXZlbnQuc3Vic3RyKDEpO1xyXG4gICAgICAgICAgYWZ0ZXJGbiA9IGV2ZW50O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGV2ZW50ICE9PSAnZW50ZXInICYmIGV2ZW50ICE9PSAnbW92ZScpIHtcclxuICAgICAgICAgIGJlZm9yZSA9IHBhY2thZ2VBbmltYXRpb25zKGVsZW1lbnQsIGV2ZW50LCBvcHRpb25zLCBhbmltYXRpb25zLCBiZWZvcmVGbik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGFmdGVyICA9IHBhY2thZ2VBbmltYXRpb25zKGVsZW1lbnQsIGV2ZW50LCBvcHRpb25zLCBhbmltYXRpb25zLCBhZnRlckZuKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gbm8gbWF0Y2hpbmcgYW5pbWF0aW9uc1xyXG4gICAgICBpZiAoIWJlZm9yZSAmJiAhYWZ0ZXIpIHJldHVybjtcclxuXHJcbiAgICAgIGZ1bmN0aW9uIGFwcGx5T3B0aW9ucygpIHtcclxuICAgICAgICBvcHRpb25zLmRvbU9wZXJhdGlvbigpO1xyXG4gICAgICAgIGFwcGx5QW5pbWF0aW9uQ2xhc3NlcyhlbGVtZW50LCBvcHRpb25zKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgZnVuY3Rpb24gY2xvc2UoKSB7XHJcbiAgICAgICAgYW5pbWF0aW9uQ2xvc2VkID0gdHJ1ZTtcclxuICAgICAgICBhcHBseU9wdGlvbnMoKTtcclxuICAgICAgICBhcHBseUFuaW1hdGlvblN0eWxlcyhlbGVtZW50LCBvcHRpb25zKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgdmFyIHJ1bm5lcjtcclxuXHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgJCR3aWxsQW5pbWF0ZTogdHJ1ZSxcclxuICAgICAgICBlbmQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgaWYgKHJ1bm5lcikge1xyXG4gICAgICAgICAgICBydW5uZXIuZW5kKCk7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjbG9zZSgpO1xyXG4gICAgICAgICAgICBydW5uZXIgPSBuZXcgJCRBbmltYXRlUnVubmVyKCk7XHJcbiAgICAgICAgICAgIHJ1bm5lci5jb21wbGV0ZSh0cnVlKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHJldHVybiBydW5uZXI7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBzdGFydDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICBpZiAocnVubmVyKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBydW5uZXI7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgcnVubmVyID0gbmV3ICQkQW5pbWF0ZVJ1bm5lcigpO1xyXG4gICAgICAgICAgdmFyIGNsb3NlQWN0aXZlQW5pbWF0aW9ucztcclxuICAgICAgICAgIHZhciBjaGFpbiA9IFtdO1xyXG5cclxuICAgICAgICAgIGlmIChiZWZvcmUpIHtcclxuICAgICAgICAgICAgY2hhaW4ucHVzaChmdW5jdGlvbihmbikge1xyXG4gICAgICAgICAgICAgIGNsb3NlQWN0aXZlQW5pbWF0aW9ucyA9IGJlZm9yZShmbik7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIGlmIChjaGFpbi5sZW5ndGgpIHtcclxuICAgICAgICAgICAgY2hhaW4ucHVzaChmdW5jdGlvbihmbikge1xyXG4gICAgICAgICAgICAgIGFwcGx5T3B0aW9ucygpO1xyXG4gICAgICAgICAgICAgIGZuKHRydWUpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGFwcGx5T3B0aW9ucygpO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIGlmIChhZnRlcikge1xyXG4gICAgICAgICAgICBjaGFpbi5wdXNoKGZ1bmN0aW9uKGZuKSB7XHJcbiAgICAgICAgICAgICAgY2xvc2VBY3RpdmVBbmltYXRpb25zID0gYWZ0ZXIoZm4pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBydW5uZXIuc2V0SG9zdCh7XHJcbiAgICAgICAgICAgIGVuZDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgZW5kQW5pbWF0aW9ucygpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBjYW5jZWw6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgIGVuZEFuaW1hdGlvbnModHJ1ZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICQkQW5pbWF0ZVJ1bm5lci5jaGFpbihjaGFpbiwgb25Db21wbGV0ZSk7XHJcbiAgICAgICAgICByZXR1cm4gcnVubmVyO1xyXG5cclxuICAgICAgICAgIGZ1bmN0aW9uIG9uQ29tcGxldGUoc3VjY2Vzcykge1xyXG4gICAgICAgICAgICBjbG9zZShzdWNjZXNzKTtcclxuICAgICAgICAgICAgcnVubmVyLmNvbXBsZXRlKHN1Y2Nlc3MpO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIGZ1bmN0aW9uIGVuZEFuaW1hdGlvbnMoY2FuY2VsbGVkKSB7XHJcbiAgICAgICAgICAgIGlmICghYW5pbWF0aW9uQ2xvc2VkKSB7XHJcbiAgICAgICAgICAgICAgKGNsb3NlQWN0aXZlQW5pbWF0aW9ucyB8fCBub29wKShjYW5jZWxsZWQpO1xyXG4gICAgICAgICAgICAgIG9uQ29tcGxldGUoY2FuY2VsbGVkKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfTtcclxuXHJcbiAgICAgIGZ1bmN0aW9uIGV4ZWN1dGVBbmltYXRpb25GbihmbiwgZWxlbWVudCwgZXZlbnQsIG9wdGlvbnMsIG9uRG9uZSkge1xyXG4gICAgICAgIHZhciBhcmdzO1xyXG4gICAgICAgIHN3aXRjaCAoZXZlbnQpIHtcclxuICAgICAgICAgIGNhc2UgJ2FuaW1hdGUnOlxyXG4gICAgICAgICAgICBhcmdzID0gW2VsZW1lbnQsIG9wdGlvbnMuZnJvbSwgb3B0aW9ucy50bywgb25Eb25lXTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgICAgY2FzZSAnc2V0Q2xhc3MnOlxyXG4gICAgICAgICAgICBhcmdzID0gW2VsZW1lbnQsIGNsYXNzZXNUb0FkZCwgY2xhc3Nlc1RvUmVtb3ZlLCBvbkRvbmVdO1xyXG4gICAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgICBjYXNlICdhZGRDbGFzcyc6XHJcbiAgICAgICAgICAgIGFyZ3MgPSBbZWxlbWVudCwgY2xhc3Nlc1RvQWRkLCBvbkRvbmVdO1xyXG4gICAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgICBjYXNlICdyZW1vdmVDbGFzcyc6XHJcbiAgICAgICAgICAgIGFyZ3MgPSBbZWxlbWVudCwgY2xhc3Nlc1RvUmVtb3ZlLCBvbkRvbmVdO1xyXG4gICAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICBhcmdzID0gW2VsZW1lbnQsIG9uRG9uZV07XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgYXJncy5wdXNoKG9wdGlvbnMpO1xyXG5cclxuICAgICAgICB2YXIgdmFsdWUgPSBmbi5hcHBseShmbiwgYXJncyk7XHJcbiAgICAgICAgaWYgKHZhbHVlKSB7XHJcbiAgICAgICAgICBpZiAoaXNGdW5jdGlvbih2YWx1ZS5zdGFydCkpIHtcclxuICAgICAgICAgICAgdmFsdWUgPSB2YWx1ZS5zdGFydCgpO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIGlmICh2YWx1ZSBpbnN0YW5jZW9mICQkQW5pbWF0ZVJ1bm5lcikge1xyXG4gICAgICAgICAgICB2YWx1ZS5kb25lKG9uRG9uZSk7XHJcbiAgICAgICAgICB9IGVsc2UgaWYgKGlzRnVuY3Rpb24odmFsdWUpKSB7XHJcbiAgICAgICAgICAgIC8vIG9wdGlvbmFsIG9uRW5kIC8gb25DYW5jZWwgY2FsbGJhY2tcclxuICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIG5vb3A7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGZ1bmN0aW9uIGdyb3VwRXZlbnRlZEFuaW1hdGlvbnMoZWxlbWVudCwgZXZlbnQsIG9wdGlvbnMsIGFuaW1hdGlvbnMsIGZuTmFtZSkge1xyXG4gICAgICAgIHZhciBvcGVyYXRpb25zID0gW107XHJcbiAgICAgICAgZm9yRWFjaChhbmltYXRpb25zLCBmdW5jdGlvbihhbmkpIHtcclxuICAgICAgICAgIHZhciBhbmltYXRpb24gPSBhbmlbZm5OYW1lXTtcclxuICAgICAgICAgIGlmICghYW5pbWF0aW9uKSByZXR1cm47XHJcblxyXG4gICAgICAgICAgLy8gbm90ZSB0aGF0IGFsbCBvZiB0aGVzZSBhbmltYXRpb25zIHdpbGwgcnVuIGluIHBhcmFsbGVsXHJcbiAgICAgICAgICBvcGVyYXRpb25zLnB1c2goZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHZhciBydW5uZXI7XHJcbiAgICAgICAgICAgIHZhciBlbmRQcm9ncmVzc0NiO1xyXG5cclxuICAgICAgICAgICAgdmFyIHJlc29sdmVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHZhciBvbkFuaW1hdGlvbkNvbXBsZXRlID0gZnVuY3Rpb24ocmVqZWN0ZWQpIHtcclxuICAgICAgICAgICAgICBpZiAoIXJlc29sdmVkKSB7XHJcbiAgICAgICAgICAgICAgICByZXNvbHZlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAoZW5kUHJvZ3Jlc3NDYiB8fCBub29wKShyZWplY3RlZCk7XHJcbiAgICAgICAgICAgICAgICBydW5uZXIuY29tcGxldGUoIXJlamVjdGVkKTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBydW5uZXIgPSBuZXcgJCRBbmltYXRlUnVubmVyKHtcclxuICAgICAgICAgICAgICBlbmQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgb25BbmltYXRpb25Db21wbGV0ZSgpO1xyXG4gICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgY2FuY2VsOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIG9uQW5pbWF0aW9uQ29tcGxldGUodHJ1ZSk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIGVuZFByb2dyZXNzQ2IgPSBleGVjdXRlQW5pbWF0aW9uRm4oYW5pbWF0aW9uLCBlbGVtZW50LCBldmVudCwgb3B0aW9ucywgZnVuY3Rpb24ocmVzdWx0KSB7XHJcbiAgICAgICAgICAgICAgdmFyIGNhbmNlbGxlZCA9IHJlc3VsdCA9PT0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgb25BbmltYXRpb25Db21wbGV0ZShjYW5jZWxsZWQpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBydW5uZXI7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIG9wZXJhdGlvbnM7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGZ1bmN0aW9uIHBhY2thZ2VBbmltYXRpb25zKGVsZW1lbnQsIGV2ZW50LCBvcHRpb25zLCBhbmltYXRpb25zLCBmbk5hbWUpIHtcclxuICAgICAgICB2YXIgb3BlcmF0aW9ucyA9IGdyb3VwRXZlbnRlZEFuaW1hdGlvbnMoZWxlbWVudCwgZXZlbnQsIG9wdGlvbnMsIGFuaW1hdGlvbnMsIGZuTmFtZSk7XHJcbiAgICAgICAgaWYgKG9wZXJhdGlvbnMubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICB2YXIgYSxiO1xyXG4gICAgICAgICAgaWYgKGZuTmFtZSA9PT0gJ2JlZm9yZVNldENsYXNzJykge1xyXG4gICAgICAgICAgICBhID0gZ3JvdXBFdmVudGVkQW5pbWF0aW9ucyhlbGVtZW50LCAncmVtb3ZlQ2xhc3MnLCBvcHRpb25zLCBhbmltYXRpb25zLCAnYmVmb3JlUmVtb3ZlQ2xhc3MnKTtcclxuICAgICAgICAgICAgYiA9IGdyb3VwRXZlbnRlZEFuaW1hdGlvbnMoZWxlbWVudCwgJ2FkZENsYXNzJywgb3B0aW9ucywgYW5pbWF0aW9ucywgJ2JlZm9yZUFkZENsYXNzJyk7XHJcbiAgICAgICAgICB9IGVsc2UgaWYgKGZuTmFtZSA9PT0gJ3NldENsYXNzJykge1xyXG4gICAgICAgICAgICBhID0gZ3JvdXBFdmVudGVkQW5pbWF0aW9ucyhlbGVtZW50LCAncmVtb3ZlQ2xhc3MnLCBvcHRpb25zLCBhbmltYXRpb25zLCAncmVtb3ZlQ2xhc3MnKTtcclxuICAgICAgICAgICAgYiA9IGdyb3VwRXZlbnRlZEFuaW1hdGlvbnMoZWxlbWVudCwgJ2FkZENsYXNzJywgb3B0aW9ucywgYW5pbWF0aW9ucywgJ2FkZENsYXNzJyk7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgaWYgKGEpIHtcclxuICAgICAgICAgICAgb3BlcmF0aW9ucyA9IG9wZXJhdGlvbnMuY29uY2F0KGEpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgaWYgKGIpIHtcclxuICAgICAgICAgICAgb3BlcmF0aW9ucyA9IG9wZXJhdGlvbnMuY29uY2F0KGIpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKG9wZXJhdGlvbnMubGVuZ3RoID09PSAwKSByZXR1cm47XHJcblxyXG4gICAgICAgIC8vIFRPRE8obWF0c2tvKTogYWRkIGRvY3VtZW50YXRpb25cclxuICAgICAgICByZXR1cm4gZnVuY3Rpb24gc3RhcnRBbmltYXRpb24oY2FsbGJhY2spIHtcclxuICAgICAgICAgIHZhciBydW5uZXJzID0gW107XHJcbiAgICAgICAgICBpZiAob3BlcmF0aW9ucy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgZm9yRWFjaChvcGVyYXRpb25zLCBmdW5jdGlvbihhbmltYXRlRm4pIHtcclxuICAgICAgICAgICAgICBydW5uZXJzLnB1c2goYW5pbWF0ZUZuKCkpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBydW5uZXJzLmxlbmd0aCA/ICQkQW5pbWF0ZVJ1bm5lci5hbGwocnVubmVycywgY2FsbGJhY2spIDogY2FsbGJhY2soKTtcclxuXHJcbiAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gZW5kRm4ocmVqZWN0KSB7XHJcbiAgICAgICAgICAgIGZvckVhY2gocnVubmVycywgZnVuY3Rpb24ocnVubmVyKSB7XHJcbiAgICAgICAgICAgICAgcmVqZWN0ID8gcnVubmVyLmNhbmNlbCgpIDogcnVubmVyLmVuZCgpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgIH07XHJcbiAgICAgICAgfTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICBmdW5jdGlvbiBsb29rdXBBbmltYXRpb25zKGNsYXNzZXMpIHtcclxuICAgICAgY2xhc3NlcyA9IGlzQXJyYXkoY2xhc3NlcykgPyBjbGFzc2VzIDogY2xhc3Nlcy5zcGxpdCgnICcpO1xyXG4gICAgICB2YXIgbWF0Y2hlcyA9IFtdLCBmbGFnTWFwID0ge307XHJcbiAgICAgIGZvciAodmFyIGk9MDsgaSA8IGNsYXNzZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICB2YXIga2xhc3MgPSBjbGFzc2VzW2ldLFxyXG4gICAgICAgICAgICBhbmltYXRpb25GYWN0b3J5ID0gJGFuaW1hdGVQcm92aWRlci4kJHJlZ2lzdGVyZWRBbmltYXRpb25zW2tsYXNzXTtcclxuICAgICAgICBpZiAoYW5pbWF0aW9uRmFjdG9yeSAmJiAhZmxhZ01hcFtrbGFzc10pIHtcclxuICAgICAgICAgIG1hdGNoZXMucHVzaCgkaW5qZWN0b3IuZ2V0KGFuaW1hdGlvbkZhY3RvcnkpKTtcclxuICAgICAgICAgIGZsYWdNYXBba2xhc3NdID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIG1hdGNoZXM7XHJcbiAgICB9XHJcbiAgfV07XHJcbn1dO1xyXG5cclxudmFyICQkQW5pbWF0ZUpzRHJpdmVyUHJvdmlkZXIgPSBbJyQkYW5pbWF0aW9uUHJvdmlkZXInLCBmdW5jdGlvbigkJGFuaW1hdGlvblByb3ZpZGVyKSB7XHJcbiAgJCRhbmltYXRpb25Qcm92aWRlci5kcml2ZXJzLnB1c2goJyQkYW5pbWF0ZUpzRHJpdmVyJyk7XHJcbiAgdGhpcy4kZ2V0ID0gWyckJGFuaW1hdGVKcycsICckJEFuaW1hdGVSdW5uZXInLCBmdW5jdGlvbigkJGFuaW1hdGVKcywgJCRBbmltYXRlUnVubmVyKSB7XHJcbiAgICByZXR1cm4gZnVuY3Rpb24gaW5pdERyaXZlckZuKGFuaW1hdGlvbkRldGFpbHMpIHtcclxuICAgICAgaWYgKGFuaW1hdGlvbkRldGFpbHMuZnJvbSAmJiBhbmltYXRpb25EZXRhaWxzLnRvKSB7XHJcbiAgICAgICAgdmFyIGZyb21BbmltYXRpb24gPSBwcmVwYXJlQW5pbWF0aW9uKGFuaW1hdGlvbkRldGFpbHMuZnJvbSk7XHJcbiAgICAgICAgdmFyIHRvQW5pbWF0aW9uID0gcHJlcGFyZUFuaW1hdGlvbihhbmltYXRpb25EZXRhaWxzLnRvKTtcclxuICAgICAgICBpZiAoIWZyb21BbmltYXRpb24gJiYgIXRvQW5pbWF0aW9uKSByZXR1cm47XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICBzdGFydDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHZhciBhbmltYXRpb25SdW5uZXJzID0gW107XHJcblxyXG4gICAgICAgICAgICBpZiAoZnJvbUFuaW1hdGlvbikge1xyXG4gICAgICAgICAgICAgIGFuaW1hdGlvblJ1bm5lcnMucHVzaChmcm9tQW5pbWF0aW9uLnN0YXJ0KCkpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAodG9BbmltYXRpb24pIHtcclxuICAgICAgICAgICAgICBhbmltYXRpb25SdW5uZXJzLnB1c2godG9BbmltYXRpb24uc3RhcnQoKSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICQkQW5pbWF0ZVJ1bm5lci5hbGwoYW5pbWF0aW9uUnVubmVycywgZG9uZSk7XHJcblxyXG4gICAgICAgICAgICB2YXIgcnVubmVyID0gbmV3ICQkQW5pbWF0ZVJ1bm5lcih7XHJcbiAgICAgICAgICAgICAgZW5kOiBlbmRGbkZhY3RvcnkoKSxcclxuICAgICAgICAgICAgICBjYW5jZWw6IGVuZEZuRmFjdG9yeSgpXHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHJ1bm5lcjtcclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIGVuZEZuRmFjdG9yeSgpIHtcclxuICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBmb3JFYWNoKGFuaW1hdGlvblJ1bm5lcnMsIGZ1bmN0aW9uKHJ1bm5lcikge1xyXG4gICAgICAgICAgICAgICAgICAvLyBhdCB0aGlzIHBvaW50IHdlIGNhbm5vdCBjYW5jZWwgYW5pbWF0aW9ucyBmb3IgZ3JvdXBzIGp1c3QgeWV0LiAxLjUrXHJcbiAgICAgICAgICAgICAgICAgIHJ1bm5lci5lbmQoKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIGRvbmUoc3RhdHVzKSB7XHJcbiAgICAgICAgICAgICAgcnVubmVyLmNvbXBsZXRlKHN0YXR1cyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHJldHVybiBwcmVwYXJlQW5pbWF0aW9uKGFuaW1hdGlvbkRldGFpbHMpO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIGZ1bmN0aW9uIHByZXBhcmVBbmltYXRpb24oYW5pbWF0aW9uRGV0YWlscykge1xyXG4gICAgICAvLyBUT0RPKG1hdHNrbyk6IG1ha2Ugc3VyZSB0byBjaGVjayBmb3IgZ3JvdXBlZCBhbmltYXRpb25zIGFuZCBkZWxlZ2F0ZSBkb3duIHRvIG5vcm1hbCBhbmltYXRpb25zXHJcbiAgICAgIHZhciBlbGVtZW50ID0gYW5pbWF0aW9uRGV0YWlscy5lbGVtZW50O1xyXG4gICAgICB2YXIgZXZlbnQgPSBhbmltYXRpb25EZXRhaWxzLmV2ZW50O1xyXG4gICAgICB2YXIgb3B0aW9ucyA9IGFuaW1hdGlvbkRldGFpbHMub3B0aW9ucztcclxuICAgICAgdmFyIGNsYXNzZXMgPSBhbmltYXRpb25EZXRhaWxzLmNsYXNzZXM7XHJcbiAgICAgIHJldHVybiAkJGFuaW1hdGVKcyhlbGVtZW50LCBldmVudCwgY2xhc3Nlcywgb3B0aW9ucyk7XHJcbiAgICB9XHJcbiAgfV07XHJcbn1dO1xyXG5cclxudmFyIE5HX0FOSU1BVEVfQVRUUl9OQU1FID0gJ2RhdGEtbmctYW5pbWF0ZSc7XHJcbnZhciBOR19BTklNQVRFX1BJTl9EQVRBID0gJyRuZ0FuaW1hdGVQaW4nO1xyXG52YXIgJCRBbmltYXRlUXVldWVQcm92aWRlciA9IFsnJGFuaW1hdGVQcm92aWRlcicsIGZ1bmN0aW9uKCRhbmltYXRlUHJvdmlkZXIpIHtcclxuICB2YXIgUFJFX0RJR0VTVF9TVEFURSA9IDE7XHJcbiAgdmFyIFJVTk5JTkdfU1RBVEUgPSAyO1xyXG4gIHZhciBPTkVfU1BBQ0UgPSAnICc7XHJcblxyXG4gIHZhciBydWxlcyA9IHRoaXMucnVsZXMgPSB7XHJcbiAgICBza2lwOiBbXSxcclxuICAgIGNhbmNlbDogW10sXHJcbiAgICBqb2luOiBbXVxyXG4gIH07XHJcblxyXG4gIGZ1bmN0aW9uIG1ha2VUcnV0aHlDc3NDbGFzc01hcChjbGFzc1N0cmluZykge1xyXG4gICAgaWYgKCFjbGFzc1N0cmluZykge1xyXG4gICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICB2YXIga2V5cyA9IGNsYXNzU3RyaW5nLnNwbGl0KE9ORV9TUEFDRSk7XHJcbiAgICB2YXIgbWFwID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcclxuXHJcbiAgICBmb3JFYWNoKGtleXMsIGZ1bmN0aW9uKGtleSkge1xyXG4gICAgICBtYXBba2V5XSA9IHRydWU7XHJcbiAgICB9KTtcclxuICAgIHJldHVybiBtYXA7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBoYXNNYXRjaGluZ0NsYXNzZXMobmV3Q2xhc3NTdHJpbmcsIGN1cnJlbnRDbGFzc1N0cmluZykge1xyXG4gICAgaWYgKG5ld0NsYXNzU3RyaW5nICYmIGN1cnJlbnRDbGFzc1N0cmluZykge1xyXG4gICAgICB2YXIgY3VycmVudENsYXNzTWFwID0gbWFrZVRydXRoeUNzc0NsYXNzTWFwKGN1cnJlbnRDbGFzc1N0cmluZyk7XHJcbiAgICAgIHJldHVybiBuZXdDbGFzc1N0cmluZy5zcGxpdChPTkVfU1BBQ0UpLnNvbWUoZnVuY3Rpb24oY2xhc3NOYW1lKSB7XHJcbiAgICAgICAgcmV0dXJuIGN1cnJlbnRDbGFzc01hcFtjbGFzc05hbWVdO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGlzQWxsb3dlZChydWxlVHlwZSwgZWxlbWVudCwgY3VycmVudEFuaW1hdGlvbiwgcHJldmlvdXNBbmltYXRpb24pIHtcclxuICAgIHJldHVybiBydWxlc1tydWxlVHlwZV0uc29tZShmdW5jdGlvbihmbikge1xyXG4gICAgICByZXR1cm4gZm4oZWxlbWVudCwgY3VycmVudEFuaW1hdGlvbiwgcHJldmlvdXNBbmltYXRpb24pO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBoYXNBbmltYXRpb25DbGFzc2VzKGFuaW1hdGlvbiwgYW5kKSB7XHJcbiAgICB2YXIgYSA9IChhbmltYXRpb24uYWRkQ2xhc3MgfHwgJycpLmxlbmd0aCA+IDA7XHJcbiAgICB2YXIgYiA9IChhbmltYXRpb24ucmVtb3ZlQ2xhc3MgfHwgJycpLmxlbmd0aCA+IDA7XHJcbiAgICByZXR1cm4gYW5kID8gYSAmJiBiIDogYSB8fCBiO1xyXG4gIH1cclxuXHJcbiAgcnVsZXMuam9pbi5wdXNoKGZ1bmN0aW9uKGVsZW1lbnQsIG5ld0FuaW1hdGlvbiwgY3VycmVudEFuaW1hdGlvbikge1xyXG4gICAgLy8gaWYgdGhlIG5ldyBhbmltYXRpb24gaXMgY2xhc3MtYmFzZWQgdGhlbiB3ZSBjYW4ganVzdCB0YWNrIHRoYXQgb25cclxuICAgIHJldHVybiAhbmV3QW5pbWF0aW9uLnN0cnVjdHVyYWwgJiYgaGFzQW5pbWF0aW9uQ2xhc3NlcyhuZXdBbmltYXRpb24pO1xyXG4gIH0pO1xyXG5cclxuICBydWxlcy5za2lwLnB1c2goZnVuY3Rpb24oZWxlbWVudCwgbmV3QW5pbWF0aW9uLCBjdXJyZW50QW5pbWF0aW9uKSB7XHJcbiAgICAvLyB0aGVyZSBpcyBubyBuZWVkIHRvIGFuaW1hdGUgYW55dGhpbmcgaWYgbm8gY2xhc3NlcyBhcmUgYmVpbmcgYWRkZWQgYW5kXHJcbiAgICAvLyB0aGVyZSBpcyBubyBzdHJ1Y3R1cmFsIGFuaW1hdGlvbiB0aGF0IHdpbGwgYmUgdHJpZ2dlcmVkXHJcbiAgICByZXR1cm4gIW5ld0FuaW1hdGlvbi5zdHJ1Y3R1cmFsICYmICFoYXNBbmltYXRpb25DbGFzc2VzKG5ld0FuaW1hdGlvbik7XHJcbiAgfSk7XHJcblxyXG4gIHJ1bGVzLnNraXAucHVzaChmdW5jdGlvbihlbGVtZW50LCBuZXdBbmltYXRpb24sIGN1cnJlbnRBbmltYXRpb24pIHtcclxuICAgIC8vIHdoeSBzaG91bGQgd2UgdHJpZ2dlciBhIG5ldyBzdHJ1Y3R1cmFsIGFuaW1hdGlvbiBpZiB0aGUgZWxlbWVudCB3aWxsXHJcbiAgICAvLyBiZSByZW1vdmVkIGZyb20gdGhlIERPTSBhbnl3YXk/XHJcbiAgICByZXR1cm4gY3VycmVudEFuaW1hdGlvbi5ldmVudCA9PSAnbGVhdmUnICYmIG5ld0FuaW1hdGlvbi5zdHJ1Y3R1cmFsO1xyXG4gIH0pO1xyXG5cclxuICBydWxlcy5za2lwLnB1c2goZnVuY3Rpb24oZWxlbWVudCwgbmV3QW5pbWF0aW9uLCBjdXJyZW50QW5pbWF0aW9uKSB7XHJcbiAgICAvLyBpZiB0aGVyZSBpcyBhbiBvbmdvaW5nIGN1cnJlbnQgYW5pbWF0aW9uIHRoZW4gZG9uJ3QgZXZlbiBib3RoZXIgcnVubmluZyB0aGUgY2xhc3MtYmFzZWQgYW5pbWF0aW9uXHJcbiAgICByZXR1cm4gY3VycmVudEFuaW1hdGlvbi5zdHJ1Y3R1cmFsICYmIGN1cnJlbnRBbmltYXRpb24uc3RhdGUgPT09IFJVTk5JTkdfU1RBVEUgJiYgIW5ld0FuaW1hdGlvbi5zdHJ1Y3R1cmFsO1xyXG4gIH0pO1xyXG5cclxuICBydWxlcy5jYW5jZWwucHVzaChmdW5jdGlvbihlbGVtZW50LCBuZXdBbmltYXRpb24sIGN1cnJlbnRBbmltYXRpb24pIHtcclxuICAgIC8vIHRoZXJlIGNhbiBuZXZlciBiZSB0d28gc3RydWN0dXJhbCBhbmltYXRpb25zIHJ1bm5pbmcgYXQgdGhlIHNhbWUgdGltZVxyXG4gICAgcmV0dXJuIGN1cnJlbnRBbmltYXRpb24uc3RydWN0dXJhbCAmJiBuZXdBbmltYXRpb24uc3RydWN0dXJhbDtcclxuICB9KTtcclxuXHJcbiAgcnVsZXMuY2FuY2VsLnB1c2goZnVuY3Rpb24oZWxlbWVudCwgbmV3QW5pbWF0aW9uLCBjdXJyZW50QW5pbWF0aW9uKSB7XHJcbiAgICAvLyBpZiB0aGUgcHJldmlvdXMgYW5pbWF0aW9uIGlzIGFscmVhZHkgcnVubmluZywgYnV0IHRoZSBuZXcgYW5pbWF0aW9uIHdpbGxcclxuICAgIC8vIGJlIHRyaWdnZXJlZCwgYnV0IHRoZSBuZXcgYW5pbWF0aW9uIGlzIHN0cnVjdHVyYWxcclxuICAgIHJldHVybiBjdXJyZW50QW5pbWF0aW9uLnN0YXRlID09PSBSVU5OSU5HX1NUQVRFICYmIG5ld0FuaW1hdGlvbi5zdHJ1Y3R1cmFsO1xyXG4gIH0pO1xyXG5cclxuICBydWxlcy5jYW5jZWwucHVzaChmdW5jdGlvbihlbGVtZW50LCBuZXdBbmltYXRpb24sIGN1cnJlbnRBbmltYXRpb24pIHtcclxuICAgIC8vIGNhbmNlbCB0aGUgYW5pbWF0aW9uIGlmIGNsYXNzZXMgYWRkZWQgLyByZW1vdmVkIGluIGJvdGggYW5pbWF0aW9uIGNhbmNlbCBlYWNoIG90aGVyIG91dCxcclxuICAgIC8vIGJ1dCBvbmx5IGlmIHRoZSBjdXJyZW50IGFuaW1hdGlvbiBpc24ndCBzdHJ1Y3R1cmFsXHJcblxyXG4gICAgaWYgKGN1cnJlbnRBbmltYXRpb24uc3RydWN0dXJhbCkgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgIHZhciBuQSA9IG5ld0FuaW1hdGlvbi5hZGRDbGFzcztcclxuICAgIHZhciBuUiA9IG5ld0FuaW1hdGlvbi5yZW1vdmVDbGFzcztcclxuICAgIHZhciBjQSA9IGN1cnJlbnRBbmltYXRpb24uYWRkQ2xhc3M7XHJcbiAgICB2YXIgY1IgPSBjdXJyZW50QW5pbWF0aW9uLnJlbW92ZUNsYXNzO1xyXG5cclxuICAgIC8vIGVhcmx5IGRldGVjdGlvbiB0byBzYXZlIHRoZSBnbG9iYWwgQ1BVIHNob3J0YWdlIDopXHJcbiAgICBpZiAoKGlzVW5kZWZpbmVkKG5BKSAmJiBpc1VuZGVmaW5lZChuUikpIHx8IChpc1VuZGVmaW5lZChjQSkgJiYgaXNVbmRlZmluZWQoY1IpKSkge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGhhc01hdGNoaW5nQ2xhc3NlcyhuQSwgY1IpIHx8IGhhc01hdGNoaW5nQ2xhc3NlcyhuUiwgY0EpO1xyXG4gIH0pO1xyXG5cclxuICB0aGlzLiRnZXQgPSBbJyQkckFGJywgJyRyb290U2NvcGUnLCAnJHJvb3RFbGVtZW50JywgJyRkb2N1bWVudCcsICckJEhhc2hNYXAnLFxyXG4gICAgICAgICAgICAgICAnJCRhbmltYXRpb24nLCAnJCRBbmltYXRlUnVubmVyJywgJyR0ZW1wbGF0ZVJlcXVlc3QnLCAnJCRqcUxpdGUnLCAnJCRmb3JjZVJlZmxvdycsXHJcbiAgICAgICBmdW5jdGlvbigkJHJBRiwgICAkcm9vdFNjb3BlLCAgICRyb290RWxlbWVudCwgICAkZG9jdW1lbnQsICAgJCRIYXNoTWFwLFxyXG4gICAgICAgICAgICAgICAgJCRhbmltYXRpb24sICAgJCRBbmltYXRlUnVubmVyLCAgICR0ZW1wbGF0ZVJlcXVlc3QsICAgJCRqcUxpdGUsICAgJCRmb3JjZVJlZmxvdykge1xyXG5cclxuICAgIHZhciBhY3RpdmVBbmltYXRpb25zTG9va3VwID0gbmV3ICQkSGFzaE1hcCgpO1xyXG4gICAgdmFyIGRpc2FibGVkRWxlbWVudHNMb29rdXAgPSBuZXcgJCRIYXNoTWFwKCk7XHJcbiAgICB2YXIgYW5pbWF0aW9uc0VuYWJsZWQgPSBudWxsO1xyXG5cclxuICAgIGZ1bmN0aW9uIHBvc3REaWdlc3RUYXNrRmFjdG9yeSgpIHtcclxuICAgICAgdmFyIHBvc3REaWdlc3RDYWxsZWQgPSBmYWxzZTtcclxuICAgICAgcmV0dXJuIGZ1bmN0aW9uKGZuKSB7XHJcbiAgICAgICAgLy8gd2Ugb25seSBpc3N1ZSBhIGNhbGwgdG8gcG9zdERpZ2VzdCBiZWZvcmVcclxuICAgICAgICAvLyBpdCBoYXMgZmlyc3QgcGFzc2VkLiBUaGlzIHByZXZlbnRzIGFueSBjYWxsYmFja3NcclxuICAgICAgICAvLyBmcm9tIG5vdCBmaXJpbmcgb25jZSB0aGUgYW5pbWF0aW9uIGhhcyBjb21wbGV0ZWRcclxuICAgICAgICAvLyBzaW5jZSBpdCB3aWxsIGJlIG91dCBvZiB0aGUgZGlnZXN0IGN5Y2xlLlxyXG4gICAgICAgIGlmIChwb3N0RGlnZXN0Q2FsbGVkKSB7XHJcbiAgICAgICAgICBmbigpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAkcm9vdFNjb3BlLiQkcG9zdERpZ2VzdChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcG9zdERpZ2VzdENhbGxlZCA9IHRydWU7XHJcbiAgICAgICAgICAgIGZuKCk7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgLy8gV2FpdCB1bnRpbCBhbGwgZGlyZWN0aXZlIGFuZCByb3V0ZS1yZWxhdGVkIHRlbXBsYXRlcyBhcmUgZG93bmxvYWRlZCBhbmRcclxuICAgIC8vIGNvbXBpbGVkLiBUaGUgJHRlbXBsYXRlUmVxdWVzdC50b3RhbFBlbmRpbmdSZXF1ZXN0cyB2YXJpYWJsZSBrZWVwcyB0cmFjayBvZlxyXG4gICAgLy8gYWxsIG9mIHRoZSByZW1vdGUgdGVtcGxhdGVzIGJlaW5nIGN1cnJlbnRseSBkb3dubG9hZGVkLiBJZiB0aGVyZSBhcmUgbm9cclxuICAgIC8vIHRlbXBsYXRlcyBjdXJyZW50bHkgZG93bmxvYWRpbmcgdGhlbiB0aGUgd2F0Y2hlciB3aWxsIHN0aWxsIGZpcmUgYW55d2F5LlxyXG4gICAgdmFyIGRlcmVnaXN0ZXJXYXRjaCA9ICRyb290U2NvcGUuJHdhdGNoKFxyXG4gICAgICBmdW5jdGlvbigpIHsgcmV0dXJuICR0ZW1wbGF0ZVJlcXVlc3QudG90YWxQZW5kaW5nUmVxdWVzdHMgPT09IDA7IH0sXHJcbiAgICAgIGZ1bmN0aW9uKGlzRW1wdHkpIHtcclxuICAgICAgICBpZiAoIWlzRW1wdHkpIHJldHVybjtcclxuICAgICAgICBkZXJlZ2lzdGVyV2F0Y2goKTtcclxuXHJcbiAgICAgICAgLy8gTm93IHRoYXQgYWxsIHRlbXBsYXRlcyBoYXZlIGJlZW4gZG93bmxvYWRlZCwgJGFuaW1hdGUgd2lsbCB3YWl0IHVudGlsXHJcbiAgICAgICAgLy8gdGhlIHBvc3QgZGlnZXN0IHF1ZXVlIGlzIGVtcHR5IGJlZm9yZSBlbmFibGluZyBhbmltYXRpb25zLiBCeSBoYXZpbmcgdHdvXHJcbiAgICAgICAgLy8gY2FsbHMgdG8gJHBvc3REaWdlc3QgY2FsbHMgd2UgY2FuIGVuc3VyZSB0aGF0IHRoZSBmbGFnIGlzIGVuYWJsZWQgYXQgdGhlXHJcbiAgICAgICAgLy8gdmVyeSBlbmQgb2YgdGhlIHBvc3QgZGlnZXN0IHF1ZXVlLiBTaW5jZSBhbGwgb2YgdGhlIGFuaW1hdGlvbnMgaW4gJGFuaW1hdGVcclxuICAgICAgICAvLyB1c2UgJHBvc3REaWdlc3QsIGl0J3MgaW1wb3J0YW50IHRoYXQgdGhlIGNvZGUgYmVsb3cgZXhlY3V0ZXMgYXQgdGhlIGVuZC5cclxuICAgICAgICAvLyBUaGlzIGJhc2ljYWxseSBtZWFucyB0aGF0IHRoZSBwYWdlIGlzIGZ1bGx5IGRvd25sb2FkZWQgYW5kIGNvbXBpbGVkIGJlZm9yZVxyXG4gICAgICAgIC8vIGFueSBhbmltYXRpb25zIGFyZSB0cmlnZ2VyZWQuXHJcbiAgICAgICAgJHJvb3RTY29wZS4kJHBvc3REaWdlc3QoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAkcm9vdFNjb3BlLiQkcG9zdERpZ2VzdChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgLy8gd2UgY2hlY2sgZm9yIG51bGwgZGlyZWN0bHkgaW4gdGhlIGV2ZW50IHRoYXQgdGhlIGFwcGxpY2F0aW9uIGFscmVhZHkgY2FsbGVkXHJcbiAgICAgICAgICAgIC8vIC5lbmFibGVkKCkgd2l0aCB3aGF0ZXZlciBhcmd1bWVudHMgdGhhdCBpdCBwcm92aWRlZCBpdCB3aXRoXHJcbiAgICAgICAgICAgIGlmIChhbmltYXRpb25zRW5hYmxlZCA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgIGFuaW1hdGlvbnNFbmFibGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgICk7XHJcblxyXG4gICAgdmFyIGNhbGxiYWNrUmVnaXN0cnkgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xyXG5cclxuICAgIC8vIHJlbWVtYmVyIHRoYXQgdGhlIGNsYXNzTmFtZUZpbHRlciBpcyBzZXQgZHVyaW5nIHRoZSBwcm92aWRlci9jb25maWdcclxuICAgIC8vIHN0YWdlIHRoZXJlZm9yZSB3ZSBjYW4gb3B0aW1pemUgaGVyZSBhbmQgc2V0dXAgYSBoZWxwZXIgZnVuY3Rpb25cclxuICAgIHZhciBjbGFzc05hbWVGaWx0ZXIgPSAkYW5pbWF0ZVByb3ZpZGVyLmNsYXNzTmFtZUZpbHRlcigpO1xyXG4gICAgdmFyIGlzQW5pbWF0YWJsZUNsYXNzTmFtZSA9ICFjbGFzc05hbWVGaWx0ZXJcclxuICAgICAgICAgICAgICA/IGZ1bmN0aW9uKCkgeyByZXR1cm4gdHJ1ZTsgfVxyXG4gICAgICAgICAgICAgIDogZnVuY3Rpb24oY2xhc3NOYW1lKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gY2xhc3NOYW1lRmlsdGVyLnRlc3QoY2xhc3NOYW1lKTtcclxuICAgICAgICAgICAgICB9O1xyXG5cclxuICAgIHZhciBhcHBseUFuaW1hdGlvbkNsYXNzZXMgPSBhcHBseUFuaW1hdGlvbkNsYXNzZXNGYWN0b3J5KCQkanFMaXRlKTtcclxuXHJcbiAgICBmdW5jdGlvbiBub3JtYWxpemVBbmltYXRpb25EZXRhaWxzKGVsZW1lbnQsIGFuaW1hdGlvbikge1xyXG4gICAgICByZXR1cm4gbWVyZ2VBbmltYXRpb25EZXRhaWxzKGVsZW1lbnQsIGFuaW1hdGlvbiwge30pO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIElFOS0xMSBoYXMgbm8gbWV0aG9kIFwiY29udGFpbnNcIiBpbiBTVkcgZWxlbWVudCBhbmQgaW4gTm9kZS5wcm90b3R5cGUuIEJ1ZyAjMTAyNTkuXHJcbiAgICB2YXIgY29udGFpbnMgPSB3aW5kb3cuTm9kZS5wcm90b3R5cGUuY29udGFpbnMgfHwgZnVuY3Rpb24oYXJnKSB7XHJcbiAgICAgIC8vIGpzaGludCBiaXR3aXNlOiBmYWxzZVxyXG4gICAgICByZXR1cm4gdGhpcyA9PT0gYXJnIHx8ICEhKHRoaXMuY29tcGFyZURvY3VtZW50UG9zaXRpb24oYXJnKSAmIDE2KTtcclxuICAgICAgLy8ganNoaW50IGJpdHdpc2U6IHRydWVcclxuICAgIH07XHJcblxyXG4gICAgZnVuY3Rpb24gZmluZENhbGxiYWNrcyhwYXJlbnQsIGVsZW1lbnQsIGV2ZW50KSB7XHJcbiAgICAgIHZhciB0YXJnZXROb2RlID0gZ2V0RG9tTm9kZShlbGVtZW50KTtcclxuICAgICAgdmFyIHRhcmdldFBhcmVudE5vZGUgPSBnZXREb21Ob2RlKHBhcmVudCk7XHJcblxyXG4gICAgICB2YXIgbWF0Y2hlcyA9IFtdO1xyXG4gICAgICB2YXIgZW50cmllcyA9IGNhbGxiYWNrUmVnaXN0cnlbZXZlbnRdO1xyXG4gICAgICBpZiAoZW50cmllcykge1xyXG4gICAgICAgIGZvckVhY2goZW50cmllcywgZnVuY3Rpb24oZW50cnkpIHtcclxuICAgICAgICAgIGlmIChjb250YWlucy5jYWxsKGVudHJ5Lm5vZGUsIHRhcmdldE5vZGUpKSB7XHJcbiAgICAgICAgICAgIG1hdGNoZXMucHVzaChlbnRyeS5jYWxsYmFjayk7XHJcbiAgICAgICAgICB9IGVsc2UgaWYgKGV2ZW50ID09PSAnbGVhdmUnICYmIGNvbnRhaW5zLmNhbGwoZW50cnkubm9kZSwgdGFyZ2V0UGFyZW50Tm9kZSkpIHtcclxuICAgICAgICAgICAgbWF0Y2hlcy5wdXNoKGVudHJ5LmNhbGxiYWNrKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIG1hdGNoZXM7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gZmlsdGVyRnJvbVJlZ2lzdHJ5KGxpc3QsIG1hdGNoQ29udGFpbmVyLCBtYXRjaENhbGxiYWNrKSB7XHJcbiAgICAgIHZhciBjb250YWluZXJOb2RlID0gZXh0cmFjdEVsZW1lbnROb2RlKG1hdGNoQ29udGFpbmVyKTtcclxuICAgICAgcmV0dXJuIGxpc3QuZmlsdGVyKGZ1bmN0aW9uKGVudHJ5KSB7XHJcbiAgICAgICAgdmFyIGlzTWF0Y2ggPSBlbnRyeS5ub2RlID09PSBjb250YWluZXJOb2RlICYmXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICghbWF0Y2hDYWxsYmFjayB8fCBlbnRyeS5jYWxsYmFjayA9PT0gbWF0Y2hDYWxsYmFjayk7XHJcbiAgICAgICAgcmV0dXJuICFpc01hdGNoO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBjbGVhbnVwRXZlbnRMaXN0ZW5lcnMocGhhc2UsIGVsZW1lbnQpIHtcclxuICAgICAgaWYgKHBoYXNlID09PSAnY2xvc2UnICYmICFlbGVtZW50WzBdLnBhcmVudE5vZGUpIHtcclxuICAgICAgICAvLyBJZiB0aGUgZWxlbWVudCBpcyBub3QgYXR0YWNoZWQgdG8gYSBwYXJlbnROb2RlLCBpdCBoYXMgYmVlbiByZW1vdmVkIGJ5XHJcbiAgICAgICAgLy8gdGhlIGRvbU9wZXJhdGlvbiwgYW5kIHdlIGNhbiBzYWZlbHkgcmVtb3ZlIHRoZSBldmVudCBjYWxsYmFja3NcclxuICAgICAgICAkYW5pbWF0ZS5vZmYoZWxlbWVudCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB2YXIgJGFuaW1hdGUgPSB7XHJcbiAgICAgIG9uOiBmdW5jdGlvbihldmVudCwgY29udGFpbmVyLCBjYWxsYmFjaykge1xyXG4gICAgICAgIHZhciBub2RlID0gZXh0cmFjdEVsZW1lbnROb2RlKGNvbnRhaW5lcik7XHJcbiAgICAgICAgY2FsbGJhY2tSZWdpc3RyeVtldmVudF0gPSBjYWxsYmFja1JlZ2lzdHJ5W2V2ZW50XSB8fCBbXTtcclxuICAgICAgICBjYWxsYmFja1JlZ2lzdHJ5W2V2ZW50XS5wdXNoKHtcclxuICAgICAgICAgIG5vZGU6IG5vZGUsXHJcbiAgICAgICAgICBjYWxsYmFjazogY2FsbGJhY2tcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gUmVtb3ZlIHRoZSBjYWxsYmFjayB3aGVuIHRoZSBlbGVtZW50IGlzIHJlbW92ZWQgZnJvbSB0aGUgRE9NXHJcbiAgICAgICAganFMaXRlKGNvbnRhaW5lcikub24oJyRkZXN0cm95JywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICB2YXIgYW5pbWF0aW9uRGV0YWlscyA9IGFjdGl2ZUFuaW1hdGlvbnNMb29rdXAuZ2V0KG5vZGUpO1xyXG5cclxuICAgICAgICAgIGlmICghYW5pbWF0aW9uRGV0YWlscykge1xyXG4gICAgICAgICAgICAvLyBJZiB0aGVyZSdzIGFuIGFuaW1hdGlvbiBvbmdvaW5nLCB0aGUgY2FsbGJhY2sgY2FsbGluZyBjb2RlIHdpbGwgcmVtb3ZlXHJcbiAgICAgICAgICAgIC8vIHRoZSBldmVudCBsaXN0ZW5lcnMuIElmIHdlJ2QgcmVtb3ZlIGhlcmUsIHRoZSBjYWxsYmFja3Mgd291bGQgYmUgcmVtb3ZlZFxyXG4gICAgICAgICAgICAvLyBiZWZvcmUgdGhlIGFuaW1hdGlvbiBlbmRzXHJcbiAgICAgICAgICAgICRhbmltYXRlLm9mZihldmVudCwgY29udGFpbmVyLCBjYWxsYmFjayk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH0sXHJcblxyXG4gICAgICBvZmY6IGZ1bmN0aW9uKGV2ZW50LCBjb250YWluZXIsIGNhbGxiYWNrKSB7XHJcbiAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDEgJiYgIWlzU3RyaW5nKGFyZ3VtZW50c1swXSkpIHtcclxuICAgICAgICAgIGNvbnRhaW5lciA9IGFyZ3VtZW50c1swXTtcclxuICAgICAgICAgIGZvciAodmFyIGV2ZW50VHlwZSBpbiBjYWxsYmFja1JlZ2lzdHJ5KSB7XHJcbiAgICAgICAgICAgIGNhbGxiYWNrUmVnaXN0cnlbZXZlbnRUeXBlXSA9IGZpbHRlckZyb21SZWdpc3RyeShjYWxsYmFja1JlZ2lzdHJ5W2V2ZW50VHlwZV0sIGNvbnRhaW5lcik7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdmFyIGVudHJpZXMgPSBjYWxsYmFja1JlZ2lzdHJ5W2V2ZW50XTtcclxuICAgICAgICBpZiAoIWVudHJpZXMpIHJldHVybjtcclxuXHJcbiAgICAgICAgY2FsbGJhY2tSZWdpc3RyeVtldmVudF0gPSBhcmd1bWVudHMubGVuZ3RoID09PSAxXHJcbiAgICAgICAgICAgID8gbnVsbFxyXG4gICAgICAgICAgICA6IGZpbHRlckZyb21SZWdpc3RyeShlbnRyaWVzLCBjb250YWluZXIsIGNhbGxiYWNrKTtcclxuICAgICAgfSxcclxuXHJcbiAgICAgIHBpbjogZnVuY3Rpb24oZWxlbWVudCwgcGFyZW50RWxlbWVudCkge1xyXG4gICAgICAgIGFzc2VydEFyZyhpc0VsZW1lbnQoZWxlbWVudCksICdlbGVtZW50JywgJ25vdCBhbiBlbGVtZW50Jyk7XHJcbiAgICAgICAgYXNzZXJ0QXJnKGlzRWxlbWVudChwYXJlbnRFbGVtZW50KSwgJ3BhcmVudEVsZW1lbnQnLCAnbm90IGFuIGVsZW1lbnQnKTtcclxuICAgICAgICBlbGVtZW50LmRhdGEoTkdfQU5JTUFURV9QSU5fREFUQSwgcGFyZW50RWxlbWVudCk7XHJcbiAgICAgIH0sXHJcblxyXG4gICAgICBwdXNoOiBmdW5jdGlvbihlbGVtZW50LCBldmVudCwgb3B0aW9ucywgZG9tT3BlcmF0aW9uKSB7XHJcbiAgICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XHJcbiAgICAgICAgb3B0aW9ucy5kb21PcGVyYXRpb24gPSBkb21PcGVyYXRpb247XHJcbiAgICAgICAgcmV0dXJuIHF1ZXVlQW5pbWF0aW9uKGVsZW1lbnQsIGV2ZW50LCBvcHRpb25zKTtcclxuICAgICAgfSxcclxuXHJcbiAgICAgIC8vIHRoaXMgbWV0aG9kIGhhcyBmb3VyIHNpZ25hdHVyZXM6XHJcbiAgICAgIC8vICAoKSAtIGdsb2JhbCBnZXR0ZXJcclxuICAgICAgLy8gIChib29sKSAtIGdsb2JhbCBzZXR0ZXJcclxuICAgICAgLy8gIChlbGVtZW50KSAtIGVsZW1lbnQgZ2V0dGVyXHJcbiAgICAgIC8vICAoZWxlbWVudCwgYm9vbCkgLSBlbGVtZW50IHNldHRlcjxGMzc+XHJcbiAgICAgIGVuYWJsZWQ6IGZ1bmN0aW9uKGVsZW1lbnQsIGJvb2wpIHtcclxuICAgICAgICB2YXIgYXJnQ291bnQgPSBhcmd1bWVudHMubGVuZ3RoO1xyXG5cclxuICAgICAgICBpZiAoYXJnQ291bnQgPT09IDApIHtcclxuICAgICAgICAgIC8vICgpIC0gR2xvYmFsIGdldHRlclxyXG4gICAgICAgICAgYm9vbCA9ICEhYW5pbWF0aW9uc0VuYWJsZWQ7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHZhciBoYXNFbGVtZW50ID0gaXNFbGVtZW50KGVsZW1lbnQpO1xyXG5cclxuICAgICAgICAgIGlmICghaGFzRWxlbWVudCkge1xyXG4gICAgICAgICAgICAvLyAoYm9vbCkgLSBHbG9iYWwgc2V0dGVyXHJcbiAgICAgICAgICAgIGJvb2wgPSBhbmltYXRpb25zRW5hYmxlZCA9ICEhZWxlbWVudDtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHZhciBub2RlID0gZ2V0RG9tTm9kZShlbGVtZW50KTtcclxuXHJcbiAgICAgICAgICAgIGlmIChhcmdDb3VudCA9PT0gMSkge1xyXG4gICAgICAgICAgICAgIC8vIChlbGVtZW50KSAtIEVsZW1lbnQgZ2V0dGVyXHJcbiAgICAgICAgICAgICAgYm9vbCA9ICFkaXNhYmxlZEVsZW1lbnRzTG9va3VwLmdldChub2RlKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAvLyAoZWxlbWVudCwgYm9vbCkgLSBFbGVtZW50IHNldHRlclxyXG4gICAgICAgICAgICAgIGRpc2FibGVkRWxlbWVudHNMb29rdXAucHV0KG5vZGUsICFib29sKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGJvb2w7XHJcbiAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgcmV0dXJuICRhbmltYXRlO1xyXG5cclxuICAgIGZ1bmN0aW9uIHF1ZXVlQW5pbWF0aW9uKGVsZW1lbnQsIGV2ZW50LCBpbml0aWFsT3B0aW9ucykge1xyXG4gICAgICAvLyB3ZSBhbHdheXMgbWFrZSBhIGNvcHkgb2YgdGhlIG9wdGlvbnMgc2luY2VcclxuICAgICAgLy8gdGhlcmUgc2hvdWxkIG5ldmVyIGJlIGFueSBzaWRlIGVmZmVjdHMgb25cclxuICAgICAgLy8gdGhlIGlucHV0IGRhdGEgd2hlbiBydW5uaW5nIGAkYW5pbWF0ZUNzc2AuXHJcbiAgICAgIHZhciBvcHRpb25zID0gY29weShpbml0aWFsT3B0aW9ucyk7XHJcblxyXG4gICAgICB2YXIgbm9kZSwgcGFyZW50O1xyXG4gICAgICBlbGVtZW50ID0gc3RyaXBDb21tZW50c0Zyb21FbGVtZW50KGVsZW1lbnQpO1xyXG4gICAgICBpZiAoZWxlbWVudCkge1xyXG4gICAgICAgIG5vZGUgPSBnZXREb21Ob2RlKGVsZW1lbnQpO1xyXG4gICAgICAgIHBhcmVudCA9IGVsZW1lbnQucGFyZW50KCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIG9wdGlvbnMgPSBwcmVwYXJlQW5pbWF0aW9uT3B0aW9ucyhvcHRpb25zKTtcclxuXHJcbiAgICAgIC8vIHdlIGNyZWF0ZSBhIGZha2UgcnVubmVyIHdpdGggYSB3b3JraW5nIHByb21pc2UuXHJcbiAgICAgIC8vIFRoZXNlIG1ldGhvZHMgd2lsbCBiZWNvbWUgYXZhaWxhYmxlIGFmdGVyIHRoZSBkaWdlc3QgaGFzIHBhc3NlZFxyXG4gICAgICB2YXIgcnVubmVyID0gbmV3ICQkQW5pbWF0ZVJ1bm5lcigpO1xyXG5cclxuICAgICAgLy8gdGhpcyBpcyB1c2VkIHRvIHRyaWdnZXIgY2FsbGJhY2tzIGluIHBvc3REaWdlc3QgbW9kZVxyXG4gICAgICB2YXIgcnVuSW5OZXh0UG9zdERpZ2VzdE9yTm93ID0gcG9zdERpZ2VzdFRhc2tGYWN0b3J5KCk7XHJcblxyXG4gICAgICBpZiAoaXNBcnJheShvcHRpb25zLmFkZENsYXNzKSkge1xyXG4gICAgICAgIG9wdGlvbnMuYWRkQ2xhc3MgPSBvcHRpb25zLmFkZENsYXNzLmpvaW4oJyAnKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKG9wdGlvbnMuYWRkQ2xhc3MgJiYgIWlzU3RyaW5nKG9wdGlvbnMuYWRkQ2xhc3MpKSB7XHJcbiAgICAgICAgb3B0aW9ucy5hZGRDbGFzcyA9IG51bGw7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChpc0FycmF5KG9wdGlvbnMucmVtb3ZlQ2xhc3MpKSB7XHJcbiAgICAgICAgb3B0aW9ucy5yZW1vdmVDbGFzcyA9IG9wdGlvbnMucmVtb3ZlQ2xhc3Muam9pbignICcpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAob3B0aW9ucy5yZW1vdmVDbGFzcyAmJiAhaXNTdHJpbmcob3B0aW9ucy5yZW1vdmVDbGFzcykpIHtcclxuICAgICAgICBvcHRpb25zLnJlbW92ZUNsYXNzID0gbnVsbDtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKG9wdGlvbnMuZnJvbSAmJiAhaXNPYmplY3Qob3B0aW9ucy5mcm9tKSkge1xyXG4gICAgICAgIG9wdGlvbnMuZnJvbSA9IG51bGw7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChvcHRpb25zLnRvICYmICFpc09iamVjdChvcHRpb25zLnRvKSkge1xyXG4gICAgICAgIG9wdGlvbnMudG8gPSBudWxsO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyB0aGVyZSBhcmUgc2l0dWF0aW9ucyB3aGVyZSBhIGRpcmVjdGl2ZSBpc3N1ZXMgYW4gYW5pbWF0aW9uIGZvclxyXG4gICAgICAvLyBhIGpxTGl0ZSB3cmFwcGVyIHRoYXQgY29udGFpbnMgb25seSBjb21tZW50IG5vZGVzLi4uIElmIHRoaXNcclxuICAgICAgLy8gaGFwcGVucyB0aGVuIHRoZXJlIGlzIG5vIHdheSB3ZSBjYW4gcGVyZm9ybSBhbiBhbmltYXRpb25cclxuICAgICAgaWYgKCFub2RlKSB7XHJcbiAgICAgICAgY2xvc2UoKTtcclxuICAgICAgICByZXR1cm4gcnVubmVyO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB2YXIgY2xhc3NOYW1lID0gW25vZGUuY2xhc3NOYW1lLCBvcHRpb25zLmFkZENsYXNzLCBvcHRpb25zLnJlbW92ZUNsYXNzXS5qb2luKCcgJyk7XHJcbiAgICAgIGlmICghaXNBbmltYXRhYmxlQ2xhc3NOYW1lKGNsYXNzTmFtZSkpIHtcclxuICAgICAgICBjbG9zZSgpO1xyXG4gICAgICAgIHJldHVybiBydW5uZXI7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHZhciBpc1N0cnVjdHVyYWwgPSBbJ2VudGVyJywgJ21vdmUnLCAnbGVhdmUnXS5pbmRleE9mKGV2ZW50KSA+PSAwO1xyXG5cclxuICAgICAgdmFyIGRvY3VtZW50SGlkZGVuID0gJGRvY3VtZW50WzBdLmhpZGRlbjtcclxuXHJcbiAgICAgIC8vIHRoaXMgaXMgYSBoYXJkIGRpc2FibGUgb2YgYWxsIGFuaW1hdGlvbnMgZm9yIHRoZSBhcHBsaWNhdGlvbiBvciBvblxyXG4gICAgICAvLyB0aGUgZWxlbWVudCBpdHNlbGYsIHRoZXJlZm9yZSAgdGhlcmUgaXMgbm8gbmVlZCB0byBjb250aW51ZSBmdXJ0aGVyXHJcbiAgICAgIC8vIHBhc3QgdGhpcyBwb2ludCBpZiBub3QgZW5hYmxlZFxyXG4gICAgICAvLyBBbmltYXRpb25zIGFyZSBhbHNvIGRpc2FibGVkIGlmIHRoZSBkb2N1bWVudCBpcyBjdXJyZW50bHkgaGlkZGVuIChwYWdlIGlzIG5vdCB2aXNpYmxlXHJcbiAgICAgIC8vIHRvIHRoZSB1c2VyKSwgYmVjYXVzZSBicm93c2VycyBzbG93IGRvd24gb3IgZG8gbm90IGZsdXNoIGNhbGxzIHRvIHJlcXVlc3RBbmltYXRpb25GcmFtZVxyXG4gICAgICB2YXIgc2tpcEFuaW1hdGlvbnMgPSAhYW5pbWF0aW9uc0VuYWJsZWQgfHwgZG9jdW1lbnRIaWRkZW4gfHwgZGlzYWJsZWRFbGVtZW50c0xvb2t1cC5nZXQobm9kZSk7XHJcbiAgICAgIHZhciBleGlzdGluZ0FuaW1hdGlvbiA9ICghc2tpcEFuaW1hdGlvbnMgJiYgYWN0aXZlQW5pbWF0aW9uc0xvb2t1cC5nZXQobm9kZSkpIHx8IHt9O1xyXG4gICAgICB2YXIgaGFzRXhpc3RpbmdBbmltYXRpb24gPSAhIWV4aXN0aW5nQW5pbWF0aW9uLnN0YXRlO1xyXG5cclxuICAgICAgLy8gdGhlcmUgaXMgbm8gcG9pbnQgaW4gdHJhdmVyc2luZyB0aGUgc2FtZSBjb2xsZWN0aW9uIG9mIHBhcmVudCBhbmNlc3RvcnMgaWYgYSBmb2xsb3d1cFxyXG4gICAgICAvLyBhbmltYXRpb24gd2lsbCBiZSBydW4gb24gdGhlIHNhbWUgZWxlbWVudCB0aGF0IGFscmVhZHkgZGlkIGFsbCB0aGF0IGNoZWNraW5nIHdvcmtcclxuICAgICAgaWYgKCFza2lwQW5pbWF0aW9ucyAmJiAoIWhhc0V4aXN0aW5nQW5pbWF0aW9uIHx8IGV4aXN0aW5nQW5pbWF0aW9uLnN0YXRlICE9IFBSRV9ESUdFU1RfU1RBVEUpKSB7XHJcbiAgICAgICAgc2tpcEFuaW1hdGlvbnMgPSAhYXJlQW5pbWF0aW9uc0FsbG93ZWQoZWxlbWVudCwgcGFyZW50LCBldmVudCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChza2lwQW5pbWF0aW9ucykge1xyXG4gICAgICAgIC8vIENhbGxiYWNrcyBzaG91bGQgZmlyZSBldmVuIGlmIHRoZSBkb2N1bWVudCBpcyBoaWRkZW4gKHJlZ3Jlc3Npb24gZml4IGZvciBpc3N1ZSAjMTQxMjApXHJcbiAgICAgICAgaWYgKGRvY3VtZW50SGlkZGVuKSBub3RpZnlQcm9ncmVzcyhydW5uZXIsIGV2ZW50LCAnc3RhcnQnKTtcclxuICAgICAgICBjbG9zZSgpO1xyXG4gICAgICAgIGlmIChkb2N1bWVudEhpZGRlbikgbm90aWZ5UHJvZ3Jlc3MocnVubmVyLCBldmVudCwgJ2Nsb3NlJyk7XHJcbiAgICAgICAgcmV0dXJuIHJ1bm5lcjtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKGlzU3RydWN0dXJhbCkge1xyXG4gICAgICAgIGNsb3NlQ2hpbGRBbmltYXRpb25zKGVsZW1lbnQpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB2YXIgbmV3QW5pbWF0aW9uID0ge1xyXG4gICAgICAgIHN0cnVjdHVyYWw6IGlzU3RydWN0dXJhbCxcclxuICAgICAgICBlbGVtZW50OiBlbGVtZW50LFxyXG4gICAgICAgIGV2ZW50OiBldmVudCxcclxuICAgICAgICBhZGRDbGFzczogb3B0aW9ucy5hZGRDbGFzcyxcclxuICAgICAgICByZW1vdmVDbGFzczogb3B0aW9ucy5yZW1vdmVDbGFzcyxcclxuICAgICAgICBjbG9zZTogY2xvc2UsXHJcbiAgICAgICAgb3B0aW9uczogb3B0aW9ucyxcclxuICAgICAgICBydW5uZXI6IHJ1bm5lclxyXG4gICAgICB9O1xyXG5cclxuICAgICAgaWYgKGhhc0V4aXN0aW5nQW5pbWF0aW9uKSB7XHJcbiAgICAgICAgdmFyIHNraXBBbmltYXRpb25GbGFnID0gaXNBbGxvd2VkKCdza2lwJywgZWxlbWVudCwgbmV3QW5pbWF0aW9uLCBleGlzdGluZ0FuaW1hdGlvbik7XHJcbiAgICAgICAgaWYgKHNraXBBbmltYXRpb25GbGFnKSB7XHJcbiAgICAgICAgICBpZiAoZXhpc3RpbmdBbmltYXRpb24uc3RhdGUgPT09IFJVTk5JTkdfU1RBVEUpIHtcclxuICAgICAgICAgICAgY2xvc2UoKTtcclxuICAgICAgICAgICAgcmV0dXJuIHJ1bm5lcjtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIG1lcmdlQW5pbWF0aW9uRGV0YWlscyhlbGVtZW50LCBleGlzdGluZ0FuaW1hdGlvbiwgbmV3QW5pbWF0aW9uKTtcclxuICAgICAgICAgICAgcmV0dXJuIGV4aXN0aW5nQW5pbWF0aW9uLnJ1bm5lcjtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIGNhbmNlbEFuaW1hdGlvbkZsYWcgPSBpc0FsbG93ZWQoJ2NhbmNlbCcsIGVsZW1lbnQsIG5ld0FuaW1hdGlvbiwgZXhpc3RpbmdBbmltYXRpb24pO1xyXG4gICAgICAgIGlmIChjYW5jZWxBbmltYXRpb25GbGFnKSB7XHJcbiAgICAgICAgICBpZiAoZXhpc3RpbmdBbmltYXRpb24uc3RhdGUgPT09IFJVTk5JTkdfU1RBVEUpIHtcclxuICAgICAgICAgICAgLy8gdGhpcyB3aWxsIGVuZCB0aGUgYW5pbWF0aW9uIHJpZ2h0IGF3YXkgYW5kIGl0IGlzIHNhZmVcclxuICAgICAgICAgICAgLy8gdG8gZG8gc28gc2luY2UgdGhlIGFuaW1hdGlvbiBpcyBhbHJlYWR5IHJ1bm5pbmcgYW5kIHRoZVxyXG4gICAgICAgICAgICAvLyBydW5uZXIgY2FsbGJhY2sgY29kZSB3aWxsIHJ1biBpbiBhc3luY1xyXG4gICAgICAgICAgICBleGlzdGluZ0FuaW1hdGlvbi5ydW5uZXIuZW5kKCk7XHJcbiAgICAgICAgICB9IGVsc2UgaWYgKGV4aXN0aW5nQW5pbWF0aW9uLnN0cnVjdHVyYWwpIHtcclxuICAgICAgICAgICAgLy8gdGhpcyBtZWFucyB0aGF0IHRoZSBhbmltYXRpb24gaXMgcXVldWVkIGludG8gYSBkaWdlc3QsIGJ1dFxyXG4gICAgICAgICAgICAvLyBoYXNuJ3Qgc3RhcnRlZCB5ZXQuIFRoZXJlZm9yZSBpdCBpcyBzYWZlIHRvIHJ1biB0aGUgY2xvc2VcclxuICAgICAgICAgICAgLy8gbWV0aG9kIHdoaWNoIHdpbGwgY2FsbCB0aGUgcnVubmVyIG1ldGhvZHMgaW4gYXN5bmMuXHJcbiAgICAgICAgICAgIGV4aXN0aW5nQW5pbWF0aW9uLmNsb3NlKCk7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAvLyB0aGlzIHdpbGwgbWVyZ2UgdGhlIG5ldyBhbmltYXRpb24gb3B0aW9ucyBpbnRvIGV4aXN0aW5nIGFuaW1hdGlvbiBvcHRpb25zXHJcbiAgICAgICAgICAgIG1lcmdlQW5pbWF0aW9uRGV0YWlscyhlbGVtZW50LCBleGlzdGluZ0FuaW1hdGlvbiwgbmV3QW5pbWF0aW9uKTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBleGlzdGluZ0FuaW1hdGlvbi5ydW5uZXI7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIC8vIGEgam9pbmVkIGFuaW1hdGlvbiBtZWFucyB0aGF0IHRoaXMgYW5pbWF0aW9uIHdpbGwgdGFrZSBvdmVyIHRoZSBleGlzdGluZyBvbmVcclxuICAgICAgICAgIC8vIHNvIGFuIGV4YW1wbGUgd291bGQgaW52b2x2ZSBhIGxlYXZlIGFuaW1hdGlvbiB0YWtpbmcgb3ZlciBhbiBlbnRlci4gVGhlbiB3aGVuXHJcbiAgICAgICAgICAvLyB0aGUgcG9zdERpZ2VzdCBraWNrcyBpbiB0aGUgZW50ZXIgd2lsbCBiZSBpZ25vcmVkLlxyXG4gICAgICAgICAgdmFyIGpvaW5BbmltYXRpb25GbGFnID0gaXNBbGxvd2VkKCdqb2luJywgZWxlbWVudCwgbmV3QW5pbWF0aW9uLCBleGlzdGluZ0FuaW1hdGlvbik7XHJcbiAgICAgICAgICBpZiAoam9pbkFuaW1hdGlvbkZsYWcpIHtcclxuICAgICAgICAgICAgaWYgKGV4aXN0aW5nQW5pbWF0aW9uLnN0YXRlID09PSBSVU5OSU5HX1NUQVRFKSB7XHJcbiAgICAgICAgICAgICAgbm9ybWFsaXplQW5pbWF0aW9uRGV0YWlscyhlbGVtZW50LCBuZXdBbmltYXRpb24pO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIGFwcGx5R2VuZXJhdGVkUHJlcGFyYXRpb25DbGFzc2VzKGVsZW1lbnQsIGlzU3RydWN0dXJhbCA/IGV2ZW50IDogbnVsbCwgb3B0aW9ucyk7XHJcblxyXG4gICAgICAgICAgICAgIGV2ZW50ID0gbmV3QW5pbWF0aW9uLmV2ZW50ID0gZXhpc3RpbmdBbmltYXRpb24uZXZlbnQ7XHJcbiAgICAgICAgICAgICAgb3B0aW9ucyA9IG1lcmdlQW5pbWF0aW9uRGV0YWlscyhlbGVtZW50LCBleGlzdGluZ0FuaW1hdGlvbiwgbmV3QW5pbWF0aW9uKTtcclxuXHJcbiAgICAgICAgICAgICAgLy93ZSByZXR1cm4gdGhlIHNhbWUgcnVubmVyIHNpbmNlIG9ubHkgdGhlIG9wdGlvbiB2YWx1ZXMgb2YgdGhpcyBhbmltYXRpb24gd2lsbFxyXG4gICAgICAgICAgICAgIC8vYmUgZmVkIGludG8gdGhlIGBleGlzdGluZ0FuaW1hdGlvbmAuXHJcbiAgICAgICAgICAgICAgcmV0dXJuIGV4aXN0aW5nQW5pbWF0aW9uLnJ1bm5lcjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICAvLyBub3JtYWxpemF0aW9uIGluIHRoaXMgY2FzZSBtZWFucyB0aGF0IGl0IHJlbW92ZXMgcmVkdW5kYW50IENTUyBjbGFzc2VzIHRoYXRcclxuICAgICAgICAvLyBhbHJlYWR5IGV4aXN0IChhZGRDbGFzcykgb3IgZG8gbm90IGV4aXN0IChyZW1vdmVDbGFzcykgb24gdGhlIGVsZW1lbnRcclxuICAgICAgICBub3JtYWxpemVBbmltYXRpb25EZXRhaWxzKGVsZW1lbnQsIG5ld0FuaW1hdGlvbik7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIHdoZW4gdGhlIG9wdGlvbnMgYXJlIG1lcmdlZCBhbmQgY2xlYW5lZCB1cCB3ZSBtYXkgZW5kIHVwIG5vdCBoYXZpbmcgdG8gZG9cclxuICAgICAgLy8gYW4gYW5pbWF0aW9uIGF0IGFsbCwgdGhlcmVmb3JlIHdlIHNob3VsZCBjaGVjayB0aGlzIGJlZm9yZSBpc3N1aW5nIGEgcG9zdFxyXG4gICAgICAvLyBkaWdlc3QgY2FsbGJhY2suIFN0cnVjdHVyYWwgYW5pbWF0aW9ucyB3aWxsIGFsd2F5cyBydW4gbm8gbWF0dGVyIHdoYXQuXHJcbiAgICAgIHZhciBpc1ZhbGlkQW5pbWF0aW9uID0gbmV3QW5pbWF0aW9uLnN0cnVjdHVyYWw7XHJcbiAgICAgIGlmICghaXNWYWxpZEFuaW1hdGlvbikge1xyXG4gICAgICAgIC8vIGFuaW1hdGUgKGZyb20vdG8pIGNhbiBiZSBxdWlja2x5IGNoZWNrZWQgZmlyc3QsIG90aGVyd2lzZSB3ZSBjaGVjayBpZiBhbnkgY2xhc3NlcyBhcmUgcHJlc2VudFxyXG4gICAgICAgIGlzVmFsaWRBbmltYXRpb24gPSAobmV3QW5pbWF0aW9uLmV2ZW50ID09PSAnYW5pbWF0ZScgJiYgT2JqZWN0LmtleXMobmV3QW5pbWF0aW9uLm9wdGlvbnMudG8gfHwge30pLmxlbmd0aCA+IDApXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB8fCBoYXNBbmltYXRpb25DbGFzc2VzKG5ld0FuaW1hdGlvbik7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmICghaXNWYWxpZEFuaW1hdGlvbikge1xyXG4gICAgICAgIGNsb3NlKCk7XHJcbiAgICAgICAgY2xlYXJFbGVtZW50QW5pbWF0aW9uU3RhdGUoZWxlbWVudCk7XHJcbiAgICAgICAgcmV0dXJuIHJ1bm5lcjtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gdGhlIGNvdW50ZXIga2VlcHMgdHJhY2sgb2YgY2FuY2VsbGVkIGFuaW1hdGlvbnNcclxuICAgICAgdmFyIGNvdW50ZXIgPSAoZXhpc3RpbmdBbmltYXRpb24uY291bnRlciB8fCAwKSArIDE7XHJcbiAgICAgIG5ld0FuaW1hdGlvbi5jb3VudGVyID0gY291bnRlcjtcclxuXHJcbiAgICAgIG1hcmtFbGVtZW50QW5pbWF0aW9uU3RhdGUoZWxlbWVudCwgUFJFX0RJR0VTVF9TVEFURSwgbmV3QW5pbWF0aW9uKTtcclxuXHJcbiAgICAgICRyb290U2NvcGUuJCRwb3N0RGlnZXN0KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBhbmltYXRpb25EZXRhaWxzID0gYWN0aXZlQW5pbWF0aW9uc0xvb2t1cC5nZXQobm9kZSk7XHJcbiAgICAgICAgdmFyIGFuaW1hdGlvbkNhbmNlbGxlZCA9ICFhbmltYXRpb25EZXRhaWxzO1xyXG4gICAgICAgIGFuaW1hdGlvbkRldGFpbHMgPSBhbmltYXRpb25EZXRhaWxzIHx8IHt9O1xyXG5cclxuICAgICAgICAvLyBpZiBhZGRDbGFzcy9yZW1vdmVDbGFzcyBpcyBjYWxsZWQgYmVmb3JlIHNvbWV0aGluZyBsaWtlIGVudGVyIHRoZW4gdGhlXHJcbiAgICAgICAgLy8gcmVnaXN0ZXJlZCBwYXJlbnQgZWxlbWVudCBtYXkgbm90IGJlIHByZXNlbnQuIFRoZSBjb2RlIGJlbG93IHdpbGwgZW5zdXJlXHJcbiAgICAgICAgLy8gdGhhdCBhIGZpbmFsIHZhbHVlIGZvciBwYXJlbnQgZWxlbWVudCBpcyBvYnRhaW5lZFxyXG4gICAgICAgIHZhciBwYXJlbnRFbGVtZW50ID0gZWxlbWVudC5wYXJlbnQoKSB8fCBbXTtcclxuXHJcbiAgICAgICAgLy8gYW5pbWF0ZS9zdHJ1Y3R1cmFsL2NsYXNzLWJhc2VkIGFuaW1hdGlvbnMgYWxsIGhhdmUgcmVxdWlyZW1lbnRzLiBPdGhlcndpc2UgdGhlcmVcclxuICAgICAgICAvLyBpcyBubyBwb2ludCBpbiBwZXJmb3JtaW5nIGFuIGFuaW1hdGlvbi4gVGhlIHBhcmVudCBub2RlIG11c3QgYWxzbyBiZSBzZXQuXHJcbiAgICAgICAgdmFyIGlzVmFsaWRBbmltYXRpb24gPSBwYXJlbnRFbGVtZW50Lmxlbmd0aCA+IDBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAmJiAoYW5pbWF0aW9uRGV0YWlscy5ldmVudCA9PT0gJ2FuaW1hdGUnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHx8IGFuaW1hdGlvbkRldGFpbHMuc3RydWN0dXJhbFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8fCBoYXNBbmltYXRpb25DbGFzc2VzKGFuaW1hdGlvbkRldGFpbHMpKTtcclxuXHJcbiAgICAgICAgLy8gdGhpcyBtZWFucyB0aGF0IHRoZSBwcmV2aW91cyBhbmltYXRpb24gd2FzIGNhbmNlbGxlZFxyXG4gICAgICAgIC8vIGV2ZW4gaWYgdGhlIGZvbGxvdy11cCBhbmltYXRpb24gaXMgdGhlIHNhbWUgZXZlbnRcclxuICAgICAgICBpZiAoYW5pbWF0aW9uQ2FuY2VsbGVkIHx8IGFuaW1hdGlvbkRldGFpbHMuY291bnRlciAhPT0gY291bnRlciB8fCAhaXNWYWxpZEFuaW1hdGlvbikge1xyXG4gICAgICAgICAgLy8gaWYgYW5vdGhlciBhbmltYXRpb24gZGlkIG5vdCB0YWtlIG92ZXIgdGhlbiB3ZSBuZWVkXHJcbiAgICAgICAgICAvLyB0byBtYWtlIHN1cmUgdGhhdCB0aGUgZG9tT3BlcmF0aW9uIGFuZCBvcHRpb25zIGFyZVxyXG4gICAgICAgICAgLy8gaGFuZGxlZCBhY2NvcmRpbmdseVxyXG4gICAgICAgICAgaWYgKGFuaW1hdGlvbkNhbmNlbGxlZCkge1xyXG4gICAgICAgICAgICBhcHBseUFuaW1hdGlvbkNsYXNzZXMoZWxlbWVudCwgb3B0aW9ucyk7XHJcbiAgICAgICAgICAgIGFwcGx5QW5pbWF0aW9uU3R5bGVzKGVsZW1lbnQsIG9wdGlvbnMpO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIC8vIGlmIHRoZSBldmVudCBjaGFuZ2VkIGZyb20gc29tZXRoaW5nIGxpa2UgZW50ZXIgdG8gbGVhdmUgdGhlbiB3ZSBkb1xyXG4gICAgICAgICAgLy8gaXQsIG90aGVyd2lzZSBpZiBpdCdzIHRoZSBzYW1lIHRoZW4gdGhlIGVuZCByZXN1bHQgd2lsbCBiZSB0aGUgc2FtZSB0b29cclxuICAgICAgICAgIGlmIChhbmltYXRpb25DYW5jZWxsZWQgfHwgKGlzU3RydWN0dXJhbCAmJiBhbmltYXRpb25EZXRhaWxzLmV2ZW50ICE9PSBldmVudCkpIHtcclxuICAgICAgICAgICAgb3B0aW9ucy5kb21PcGVyYXRpb24oKTtcclxuICAgICAgICAgICAgcnVubmVyLmVuZCgpO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIC8vIGluIHRoZSBldmVudCB0aGF0IHRoZSBlbGVtZW50IGFuaW1hdGlvbiB3YXMgbm90IGNhbmNlbGxlZCBvciBhIGZvbGxvdy11cCBhbmltYXRpb25cclxuICAgICAgICAgIC8vIGlzbid0IGFsbG93ZWQgdG8gYW5pbWF0ZSBmcm9tIGhlcmUgdGhlbiB3ZSBuZWVkIHRvIGNsZWFyIHRoZSBzdGF0ZSBvZiB0aGUgZWxlbWVudFxyXG4gICAgICAgICAgLy8gc28gdGhhdCBhbnkgZnV0dXJlIGFuaW1hdGlvbnMgd29uJ3QgcmVhZCB0aGUgZXhwaXJlZCBhbmltYXRpb24gZGF0YS5cclxuICAgICAgICAgIGlmICghaXNWYWxpZEFuaW1hdGlvbikge1xyXG4gICAgICAgICAgICBjbGVhckVsZW1lbnRBbmltYXRpb25TdGF0ZShlbGVtZW50KTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyB0aGlzIGNvbWJpbmVkIG11bHRpcGxlIGNsYXNzIHRvIGFkZENsYXNzIC8gcmVtb3ZlQ2xhc3MgaW50byBhIHNldENsYXNzIGV2ZW50XHJcbiAgICAgICAgLy8gc28gbG9uZyBhcyBhIHN0cnVjdHVyYWwgZXZlbnQgZGlkIG5vdCB0YWtlIG92ZXIgdGhlIGFuaW1hdGlvblxyXG4gICAgICAgIGV2ZW50ID0gIWFuaW1hdGlvbkRldGFpbHMuc3RydWN0dXJhbCAmJiBoYXNBbmltYXRpb25DbGFzc2VzKGFuaW1hdGlvbkRldGFpbHMsIHRydWUpXHJcbiAgICAgICAgICAgID8gJ3NldENsYXNzJ1xyXG4gICAgICAgICAgICA6IGFuaW1hdGlvbkRldGFpbHMuZXZlbnQ7XHJcblxyXG4gICAgICAgIG1hcmtFbGVtZW50QW5pbWF0aW9uU3RhdGUoZWxlbWVudCwgUlVOTklOR19TVEFURSk7XHJcbiAgICAgICAgdmFyIHJlYWxSdW5uZXIgPSAkJGFuaW1hdGlvbihlbGVtZW50LCBldmVudCwgYW5pbWF0aW9uRGV0YWlscy5vcHRpb25zKTtcclxuXHJcbiAgICAgICAgLy8gdGhpcyB3aWxsIHVwZGF0ZSB0aGUgcnVubmVyJ3MgZmxvdy1jb250cm9sIGV2ZW50cyBiYXNlZCBvblxyXG4gICAgICAgIC8vIHRoZSBgcmVhbFJ1bm5lcmAgb2JqZWN0LlxyXG4gICAgICAgIHJ1bm5lci5zZXRIb3N0KHJlYWxSdW5uZXIpO1xyXG4gICAgICAgIG5vdGlmeVByb2dyZXNzKHJ1bm5lciwgZXZlbnQsICdzdGFydCcsIHt9KTtcclxuXHJcbiAgICAgICAgcmVhbFJ1bm5lci5kb25lKGZ1bmN0aW9uKHN0YXR1cykge1xyXG4gICAgICAgICAgY2xvc2UoIXN0YXR1cyk7XHJcbiAgICAgICAgICB2YXIgYW5pbWF0aW9uRGV0YWlscyA9IGFjdGl2ZUFuaW1hdGlvbnNMb29rdXAuZ2V0KG5vZGUpO1xyXG4gICAgICAgICAgaWYgKGFuaW1hdGlvbkRldGFpbHMgJiYgYW5pbWF0aW9uRGV0YWlscy5jb3VudGVyID09PSBjb3VudGVyKSB7XHJcbiAgICAgICAgICAgIGNsZWFyRWxlbWVudEFuaW1hdGlvblN0YXRlKGdldERvbU5vZGUoZWxlbWVudCkpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgbm90aWZ5UHJvZ3Jlc3MocnVubmVyLCBldmVudCwgJ2Nsb3NlJywge30pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIHJldHVybiBydW5uZXI7XHJcblxyXG4gICAgICBmdW5jdGlvbiBub3RpZnlQcm9ncmVzcyhydW5uZXIsIGV2ZW50LCBwaGFzZSwgZGF0YSkge1xyXG4gICAgICAgIHJ1bkluTmV4dFBvc3REaWdlc3RPck5vdyhmdW5jdGlvbigpIHtcclxuICAgICAgICAgIHZhciBjYWxsYmFja3MgPSBmaW5kQ2FsbGJhY2tzKHBhcmVudCwgZWxlbWVudCwgZXZlbnQpO1xyXG4gICAgICAgICAgaWYgKGNhbGxiYWNrcy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgLy8gZG8gbm90IG9wdGltaXplIHRoaXMgY2FsbCBoZXJlIHRvIFJBRiBiZWNhdXNlXHJcbiAgICAgICAgICAgIC8vIHdlIGRvbid0IGtub3cgaG93IGhlYXZ5IHRoZSBjYWxsYmFjayBjb2RlIGhlcmUgd2lsbFxyXG4gICAgICAgICAgICAvLyBiZSBhbmQgaWYgdGhpcyBjb2RlIGlzIGJ1ZmZlcmVkIHRoZW4gdGhpcyBjYW5cclxuICAgICAgICAgICAgLy8gbGVhZCB0byBhIHBlcmZvcm1hbmNlIHJlZ3Jlc3Npb24uXHJcbiAgICAgICAgICAgICQkckFGKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgIGZvckVhY2goY2FsbGJhY2tzLCBmdW5jdGlvbihjYWxsYmFjaykge1xyXG4gICAgICAgICAgICAgICAgY2FsbGJhY2soZWxlbWVudCwgcGhhc2UsIGRhdGEpO1xyXG4gICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgIGNsZWFudXBFdmVudExpc3RlbmVycyhwaGFzZSwgZWxlbWVudCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY2xlYW51cEV2ZW50TGlzdGVuZXJzKHBoYXNlLCBlbGVtZW50KTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICBydW5uZXIucHJvZ3Jlc3MoZXZlbnQsIHBoYXNlLCBkYXRhKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgZnVuY3Rpb24gY2xvc2UocmVqZWN0KSB7IC8vIGpzaGludCBpZ25vcmU6bGluZVxyXG4gICAgICAgIGNsZWFyR2VuZXJhdGVkQ2xhc3NlcyhlbGVtZW50LCBvcHRpb25zKTtcclxuICAgICAgICBhcHBseUFuaW1hdGlvbkNsYXNzZXMoZWxlbWVudCwgb3B0aW9ucyk7XHJcbiAgICAgICAgYXBwbHlBbmltYXRpb25TdHlsZXMoZWxlbWVudCwgb3B0aW9ucyk7XHJcbiAgICAgICAgb3B0aW9ucy5kb21PcGVyYXRpb24oKTtcclxuICAgICAgICBydW5uZXIuY29tcGxldGUoIXJlamVjdCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBjbG9zZUNoaWxkQW5pbWF0aW9ucyhlbGVtZW50KSB7XHJcbiAgICAgIHZhciBub2RlID0gZ2V0RG9tTm9kZShlbGVtZW50KTtcclxuICAgICAgdmFyIGNoaWxkcmVuID0gbm9kZS5xdWVyeVNlbGVjdG9yQWxsKCdbJyArIE5HX0FOSU1BVEVfQVRUUl9OQU1FICsgJ10nKTtcclxuICAgICAgZm9yRWFjaChjaGlsZHJlbiwgZnVuY3Rpb24oY2hpbGQpIHtcclxuICAgICAgICB2YXIgc3RhdGUgPSBwYXJzZUludChjaGlsZC5nZXRBdHRyaWJ1dGUoTkdfQU5JTUFURV9BVFRSX05BTUUpKTtcclxuICAgICAgICB2YXIgYW5pbWF0aW9uRGV0YWlscyA9IGFjdGl2ZUFuaW1hdGlvbnNMb29rdXAuZ2V0KGNoaWxkKTtcclxuICAgICAgICBpZiAoYW5pbWF0aW9uRGV0YWlscykge1xyXG4gICAgICAgICAgc3dpdGNoIChzdGF0ZSkge1xyXG4gICAgICAgICAgICBjYXNlIFJVTk5JTkdfU1RBVEU6XHJcbiAgICAgICAgICAgICAgYW5pbWF0aW9uRGV0YWlscy5ydW5uZXIuZW5kKCk7XHJcbiAgICAgICAgICAgICAgLyogZmFsbHMgdGhyb3VnaCAqL1xyXG4gICAgICAgICAgICBjYXNlIFBSRV9ESUdFU1RfU1RBVEU6XHJcbiAgICAgICAgICAgICAgYWN0aXZlQW5pbWF0aW9uc0xvb2t1cC5yZW1vdmUoY2hpbGQpO1xyXG4gICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gY2xlYXJFbGVtZW50QW5pbWF0aW9uU3RhdGUoZWxlbWVudCkge1xyXG4gICAgICB2YXIgbm9kZSA9IGdldERvbU5vZGUoZWxlbWVudCk7XHJcbiAgICAgIG5vZGUucmVtb3ZlQXR0cmlidXRlKE5HX0FOSU1BVEVfQVRUUl9OQU1FKTtcclxuICAgICAgYWN0aXZlQW5pbWF0aW9uc0xvb2t1cC5yZW1vdmUobm9kZSk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gaXNNYXRjaGluZ0VsZW1lbnQobm9kZU9yRWxtQSwgbm9kZU9yRWxtQikge1xyXG4gICAgICByZXR1cm4gZ2V0RG9tTm9kZShub2RlT3JFbG1BKSA9PT0gZ2V0RG9tTm9kZShub2RlT3JFbG1CKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFRoaXMgZm4gcmV0dXJucyBmYWxzZSBpZiBhbnkgb2YgdGhlIGZvbGxvd2luZyBpcyB0cnVlOlxyXG4gICAgICogYSkgYW5pbWF0aW9ucyBvbiBhbnkgcGFyZW50IGVsZW1lbnQgYXJlIGRpc2FibGVkLCBhbmQgYW5pbWF0aW9ucyBvbiB0aGUgZWxlbWVudCBhcmVuJ3QgZXhwbGljaXRseSBhbGxvd2VkXHJcbiAgICAgKiBiKSBhIHBhcmVudCBlbGVtZW50IGhhcyBhbiBvbmdvaW5nIHN0cnVjdHVyYWwgYW5pbWF0aW9uLCBhbmQgYW5pbWF0ZUNoaWxkcmVuIGlzIGZhbHNlXHJcbiAgICAgKiBjKSB0aGUgZWxlbWVudCBpcyBub3QgYSBjaGlsZCBvZiB0aGUgYm9keVxyXG4gICAgICogZCkgdGhlIGVsZW1lbnQgaXMgbm90IGEgY2hpbGQgb2YgdGhlICRyb290RWxlbWVudFxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBhcmVBbmltYXRpb25zQWxsb3dlZChlbGVtZW50LCBwYXJlbnRFbGVtZW50LCBldmVudCkge1xyXG4gICAgICB2YXIgYm9keUVsZW1lbnQgPSBqcUxpdGUoJGRvY3VtZW50WzBdLmJvZHkpO1xyXG4gICAgICB2YXIgYm9keUVsZW1lbnREZXRlY3RlZCA9IGlzTWF0Y2hpbmdFbGVtZW50KGVsZW1lbnQsIGJvZHlFbGVtZW50KSB8fCBlbGVtZW50WzBdLm5vZGVOYW1lID09PSAnSFRNTCc7XHJcbiAgICAgIHZhciByb290RWxlbWVudERldGVjdGVkID0gaXNNYXRjaGluZ0VsZW1lbnQoZWxlbWVudCwgJHJvb3RFbGVtZW50KTtcclxuICAgICAgdmFyIHBhcmVudEFuaW1hdGlvbkRldGVjdGVkID0gZmFsc2U7XHJcbiAgICAgIHZhciBhbmltYXRlQ2hpbGRyZW47XHJcbiAgICAgIHZhciBlbGVtZW50RGlzYWJsZWQgPSBkaXNhYmxlZEVsZW1lbnRzTG9va3VwLmdldChnZXREb21Ob2RlKGVsZW1lbnQpKTtcclxuXHJcbiAgICAgIHZhciBwYXJlbnRIb3N0ID0ganFMaXRlLmRhdGEoZWxlbWVudFswXSwgTkdfQU5JTUFURV9QSU5fREFUQSk7XHJcbiAgICAgIGlmIChwYXJlbnRIb3N0KSB7XHJcbiAgICAgICAgcGFyZW50RWxlbWVudCA9IHBhcmVudEhvc3Q7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHBhcmVudEVsZW1lbnQgPSBnZXREb21Ob2RlKHBhcmVudEVsZW1lbnQpO1xyXG5cclxuICAgICAgd2hpbGUgKHBhcmVudEVsZW1lbnQpIHtcclxuICAgICAgICBpZiAoIXJvb3RFbGVtZW50RGV0ZWN0ZWQpIHtcclxuICAgICAgICAgIC8vIGFuZ3VsYXIgZG9lc24ndCB3YW50IHRvIGF0dGVtcHQgdG8gYW5pbWF0ZSBlbGVtZW50cyBvdXRzaWRlIG9mIHRoZSBhcHBsaWNhdGlvblxyXG4gICAgICAgICAgLy8gdGhlcmVmb3JlIHdlIG5lZWQgdG8gZW5zdXJlIHRoYXQgdGhlIHJvb3RFbGVtZW50IGlzIGFuIGFuY2VzdG9yIG9mIHRoZSBjdXJyZW50IGVsZW1lbnRcclxuICAgICAgICAgIHJvb3RFbGVtZW50RGV0ZWN0ZWQgPSBpc01hdGNoaW5nRWxlbWVudChwYXJlbnRFbGVtZW50LCAkcm9vdEVsZW1lbnQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHBhcmVudEVsZW1lbnQubm9kZVR5cGUgIT09IEVMRU1FTlRfTk9ERSkge1xyXG4gICAgICAgICAgLy8gbm8gcG9pbnQgaW4gaW5zcGVjdGluZyB0aGUgI2RvY3VtZW50IGVsZW1lbnRcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdmFyIGRldGFpbHMgPSBhY3RpdmVBbmltYXRpb25zTG9va3VwLmdldChwYXJlbnRFbGVtZW50KSB8fCB7fTtcclxuICAgICAgICAvLyBlaXRoZXIgYW4gZW50ZXIsIGxlYXZlIG9yIG1vdmUgYW5pbWF0aW9uIHdpbGwgY29tbWVuY2VcclxuICAgICAgICAvLyB0aGVyZWZvcmUgd2UgY2FuJ3QgYWxsb3cgYW55IGFuaW1hdGlvbnMgdG8gdGFrZSBwbGFjZVxyXG4gICAgICAgIC8vIGJ1dCBpZiBhIHBhcmVudCBhbmltYXRpb24gaXMgY2xhc3MtYmFzZWQgdGhlbiB0aGF0J3Mgb2tcclxuICAgICAgICBpZiAoIXBhcmVudEFuaW1hdGlvbkRldGVjdGVkKSB7XHJcbiAgICAgICAgICB2YXIgcGFyZW50RWxlbWVudERpc2FibGVkID0gZGlzYWJsZWRFbGVtZW50c0xvb2t1cC5nZXQocGFyZW50RWxlbWVudCk7XHJcblxyXG4gICAgICAgICAgaWYgKHBhcmVudEVsZW1lbnREaXNhYmxlZCA9PT0gdHJ1ZSAmJiBlbGVtZW50RGlzYWJsZWQgIT09IGZhbHNlKSB7XHJcbiAgICAgICAgICAgIC8vIGRpc2FibGUgYW5pbWF0aW9ucyBpZiB0aGUgdXNlciBoYXNuJ3QgZXhwbGljaXRseSBlbmFibGVkIGFuaW1hdGlvbnMgb24gdGhlXHJcbiAgICAgICAgICAgIC8vIGN1cnJlbnQgZWxlbWVudFxyXG4gICAgICAgICAgICBlbGVtZW50RGlzYWJsZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAvLyBlbGVtZW50IGlzIGRpc2FibGVkIHZpYSBwYXJlbnQgZWxlbWVudCwgbm8gbmVlZCB0byBjaGVjayBhbnl0aGluZyBlbHNlXHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgfSBlbHNlIGlmIChwYXJlbnRFbGVtZW50RGlzYWJsZWQgPT09IGZhbHNlKSB7XHJcbiAgICAgICAgICAgIGVsZW1lbnREaXNhYmxlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgcGFyZW50QW5pbWF0aW9uRGV0ZWN0ZWQgPSBkZXRhaWxzLnN0cnVjdHVyYWw7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoaXNVbmRlZmluZWQoYW5pbWF0ZUNoaWxkcmVuKSB8fCBhbmltYXRlQ2hpbGRyZW4gPT09IHRydWUpIHtcclxuICAgICAgICAgIHZhciB2YWx1ZSA9IGpxTGl0ZS5kYXRhKHBhcmVudEVsZW1lbnQsIE5HX0FOSU1BVEVfQ0hJTERSRU5fREFUQSk7XHJcbiAgICAgICAgICBpZiAoaXNEZWZpbmVkKHZhbHVlKSkge1xyXG4gICAgICAgICAgICBhbmltYXRlQ2hpbGRyZW4gPSB2YWx1ZTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIHRoZXJlIGlzIG5vIG5lZWQgdG8gY29udGludWUgdHJhdmVyc2luZyBhdCB0aGlzIHBvaW50XHJcbiAgICAgICAgaWYgKHBhcmVudEFuaW1hdGlvbkRldGVjdGVkICYmIGFuaW1hdGVDaGlsZHJlbiA9PT0gZmFsc2UpIGJyZWFrO1xyXG5cclxuICAgICAgICBpZiAoIWJvZHlFbGVtZW50RGV0ZWN0ZWQpIHtcclxuICAgICAgICAgIC8vIHdlIGFsc28gbmVlZCB0byBlbnN1cmUgdGhhdCB0aGUgZWxlbWVudCBpcyBvciB3aWxsIGJlIGEgcGFydCBvZiB0aGUgYm9keSBlbGVtZW50XHJcbiAgICAgICAgICAvLyBvdGhlcndpc2UgaXQgaXMgcG9pbnRsZXNzIHRvIGV2ZW4gaXNzdWUgYW4gYW5pbWF0aW9uIHRvIGJlIHJlbmRlcmVkXHJcbiAgICAgICAgICBib2R5RWxlbWVudERldGVjdGVkID0gaXNNYXRjaGluZ0VsZW1lbnQocGFyZW50RWxlbWVudCwgYm9keUVsZW1lbnQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGJvZHlFbGVtZW50RGV0ZWN0ZWQgJiYgcm9vdEVsZW1lbnREZXRlY3RlZCkge1xyXG4gICAgICAgICAgLy8gSWYgYm90aCBib2R5IGFuZCByb290IGhhdmUgYmVlbiBmb3VuZCwgYW55IG90aGVyIGNoZWNrcyBhcmUgcG9pbnRsZXNzLFxyXG4gICAgICAgICAgLy8gYXMgbm8gYW5pbWF0aW9uIGRhdGEgc2hvdWxkIGxpdmUgb3V0c2lkZSB0aGUgYXBwbGljYXRpb25cclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCFyb290RWxlbWVudERldGVjdGVkKSB7XHJcbiAgICAgICAgICAvLyBJZiBubyByb290RWxlbWVudCBpcyBkZXRlY3RlZCwgY2hlY2sgaWYgdGhlIHBhcmVudEVsZW1lbnQgaXMgcGlubmVkIHRvIGFub3RoZXIgZWxlbWVudFxyXG4gICAgICAgICAgcGFyZW50SG9zdCA9IGpxTGl0ZS5kYXRhKHBhcmVudEVsZW1lbnQsIE5HX0FOSU1BVEVfUElOX0RBVEEpO1xyXG4gICAgICAgICAgaWYgKHBhcmVudEhvc3QpIHtcclxuICAgICAgICAgICAgLy8gVGhlIHBpbiB0YXJnZXQgZWxlbWVudCBiZWNvbWVzIHRoZSBuZXh0IHBhcmVudCBlbGVtZW50XHJcbiAgICAgICAgICAgIHBhcmVudEVsZW1lbnQgPSBnZXREb21Ob2RlKHBhcmVudEhvc3QpO1xyXG4gICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHBhcmVudEVsZW1lbnQgPSBwYXJlbnRFbGVtZW50LnBhcmVudE5vZGU7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHZhciBhbGxvd0FuaW1hdGlvbiA9ICghcGFyZW50QW5pbWF0aW9uRGV0ZWN0ZWQgfHwgYW5pbWF0ZUNoaWxkcmVuKSAmJiBlbGVtZW50RGlzYWJsZWQgIT09IHRydWU7XHJcbiAgICAgIHJldHVybiBhbGxvd0FuaW1hdGlvbiAmJiByb290RWxlbWVudERldGVjdGVkICYmIGJvZHlFbGVtZW50RGV0ZWN0ZWQ7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gbWFya0VsZW1lbnRBbmltYXRpb25TdGF0ZShlbGVtZW50LCBzdGF0ZSwgZGV0YWlscykge1xyXG4gICAgICBkZXRhaWxzID0gZGV0YWlscyB8fCB7fTtcclxuICAgICAgZGV0YWlscy5zdGF0ZSA9IHN0YXRlO1xyXG5cclxuICAgICAgdmFyIG5vZGUgPSBnZXREb21Ob2RlKGVsZW1lbnQpO1xyXG4gICAgICBub2RlLnNldEF0dHJpYnV0ZShOR19BTklNQVRFX0FUVFJfTkFNRSwgc3RhdGUpO1xyXG5cclxuICAgICAgdmFyIG9sZFZhbHVlID0gYWN0aXZlQW5pbWF0aW9uc0xvb2t1cC5nZXQobm9kZSk7XHJcbiAgICAgIHZhciBuZXdWYWx1ZSA9IG9sZFZhbHVlXHJcbiAgICAgICAgICA/IGV4dGVuZChvbGRWYWx1ZSwgZGV0YWlscylcclxuICAgICAgICAgIDogZGV0YWlscztcclxuICAgICAgYWN0aXZlQW5pbWF0aW9uc0xvb2t1cC5wdXQobm9kZSwgbmV3VmFsdWUpO1xyXG4gICAgfVxyXG4gIH1dO1xyXG59XTtcclxuXHJcbnZhciAkJEFuaW1hdGlvblByb3ZpZGVyID0gWyckYW5pbWF0ZVByb3ZpZGVyJywgZnVuY3Rpb24oJGFuaW1hdGVQcm92aWRlcikge1xyXG4gIHZhciBOR19BTklNQVRFX1JFRl9BVFRSID0gJ25nLWFuaW1hdGUtcmVmJztcclxuXHJcbiAgdmFyIGRyaXZlcnMgPSB0aGlzLmRyaXZlcnMgPSBbXTtcclxuXHJcbiAgdmFyIFJVTk5FUl9TVE9SQUdFX0tFWSA9ICckJGFuaW1hdGlvblJ1bm5lcic7XHJcblxyXG4gIGZ1bmN0aW9uIHNldFJ1bm5lcihlbGVtZW50LCBydW5uZXIpIHtcclxuICAgIGVsZW1lbnQuZGF0YShSVU5ORVJfU1RPUkFHRV9LRVksIHJ1bm5lcik7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiByZW1vdmVSdW5uZXIoZWxlbWVudCkge1xyXG4gICAgZWxlbWVudC5yZW1vdmVEYXRhKFJVTk5FUl9TVE9SQUdFX0tFWSk7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBnZXRSdW5uZXIoZWxlbWVudCkge1xyXG4gICAgcmV0dXJuIGVsZW1lbnQuZGF0YShSVU5ORVJfU1RPUkFHRV9LRVkpO1xyXG4gIH1cclxuXHJcbiAgdGhpcy4kZ2V0ID0gWyckJGpxTGl0ZScsICckcm9vdFNjb3BlJywgJyRpbmplY3RvcicsICckJEFuaW1hdGVSdW5uZXInLCAnJCRIYXNoTWFwJywgJyQkckFGU2NoZWR1bGVyJyxcclxuICAgICAgIGZ1bmN0aW9uKCQkanFMaXRlLCAgICRyb290U2NvcGUsICAgJGluamVjdG9yLCAgICQkQW5pbWF0ZVJ1bm5lciwgICAkJEhhc2hNYXAsICAgJCRyQUZTY2hlZHVsZXIpIHtcclxuXHJcbiAgICB2YXIgYW5pbWF0aW9uUXVldWUgPSBbXTtcclxuICAgIHZhciBhcHBseUFuaW1hdGlvbkNsYXNzZXMgPSBhcHBseUFuaW1hdGlvbkNsYXNzZXNGYWN0b3J5KCQkanFMaXRlKTtcclxuXHJcbiAgICBmdW5jdGlvbiBzb3J0QW5pbWF0aW9ucyhhbmltYXRpb25zKSB7XHJcbiAgICAgIHZhciB0cmVlID0geyBjaGlsZHJlbjogW10gfTtcclxuICAgICAgdmFyIGksIGxvb2t1cCA9IG5ldyAkJEhhc2hNYXAoKTtcclxuXHJcbiAgICAgIC8vIHRoaXMgaXMgZG9uZSBmaXJzdCBiZWZvcmVoYW5kIHNvIHRoYXQgdGhlIGhhc2htYXBcclxuICAgICAgLy8gaXMgZmlsbGVkIHdpdGggYSBsaXN0IG9mIHRoZSBlbGVtZW50cyB0aGF0IHdpbGwgYmUgYW5pbWF0ZWRcclxuICAgICAgZm9yIChpID0gMDsgaSA8IGFuaW1hdGlvbnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICB2YXIgYW5pbWF0aW9uID0gYW5pbWF0aW9uc1tpXTtcclxuICAgICAgICBsb29rdXAucHV0KGFuaW1hdGlvbi5kb21Ob2RlLCBhbmltYXRpb25zW2ldID0ge1xyXG4gICAgICAgICAgZG9tTm9kZTogYW5pbWF0aW9uLmRvbU5vZGUsXHJcbiAgICAgICAgICBmbjogYW5pbWF0aW9uLmZuLFxyXG4gICAgICAgICAgY2hpbGRyZW46IFtdXHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGZvciAoaSA9IDA7IGkgPCBhbmltYXRpb25zLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgcHJvY2Vzc05vZGUoYW5pbWF0aW9uc1tpXSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiBmbGF0dGVuKHRyZWUpO1xyXG5cclxuICAgICAgZnVuY3Rpb24gcHJvY2Vzc05vZGUoZW50cnkpIHtcclxuICAgICAgICBpZiAoZW50cnkucHJvY2Vzc2VkKSByZXR1cm4gZW50cnk7XHJcbiAgICAgICAgZW50cnkucHJvY2Vzc2VkID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgdmFyIGVsZW1lbnROb2RlID0gZW50cnkuZG9tTm9kZTtcclxuICAgICAgICB2YXIgcGFyZW50Tm9kZSA9IGVsZW1lbnROb2RlLnBhcmVudE5vZGU7XHJcbiAgICAgICAgbG9va3VwLnB1dChlbGVtZW50Tm9kZSwgZW50cnkpO1xyXG5cclxuICAgICAgICB2YXIgcGFyZW50RW50cnk7XHJcbiAgICAgICAgd2hpbGUgKHBhcmVudE5vZGUpIHtcclxuICAgICAgICAgIHBhcmVudEVudHJ5ID0gbG9va3VwLmdldChwYXJlbnROb2RlKTtcclxuICAgICAgICAgIGlmIChwYXJlbnRFbnRyeSkge1xyXG4gICAgICAgICAgICBpZiAoIXBhcmVudEVudHJ5LnByb2Nlc3NlZCkge1xyXG4gICAgICAgICAgICAgIHBhcmVudEVudHJ5ID0gcHJvY2Vzc05vZGUocGFyZW50RW50cnkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgcGFyZW50Tm9kZSA9IHBhcmVudE5vZGUucGFyZW50Tm9kZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIChwYXJlbnRFbnRyeSB8fCB0cmVlKS5jaGlsZHJlbi5wdXNoKGVudHJ5KTtcclxuICAgICAgICByZXR1cm4gZW50cnk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGZ1bmN0aW9uIGZsYXR0ZW4odHJlZSkge1xyXG4gICAgICAgIHZhciByZXN1bHQgPSBbXTtcclxuICAgICAgICB2YXIgcXVldWUgPSBbXTtcclxuICAgICAgICB2YXIgaTtcclxuXHJcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IHRyZWUuY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgIHF1ZXVlLnB1c2godHJlZS5jaGlsZHJlbltpXSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2YXIgcmVtYWluaW5nTGV2ZWxFbnRyaWVzID0gcXVldWUubGVuZ3RoO1xyXG4gICAgICAgIHZhciBuZXh0TGV2ZWxFbnRyaWVzID0gMDtcclxuICAgICAgICB2YXIgcm93ID0gW107XHJcblxyXG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBxdWV1ZS5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgdmFyIGVudHJ5ID0gcXVldWVbaV07XHJcbiAgICAgICAgICBpZiAocmVtYWluaW5nTGV2ZWxFbnRyaWVzIDw9IDApIHtcclxuICAgICAgICAgICAgcmVtYWluaW5nTGV2ZWxFbnRyaWVzID0gbmV4dExldmVsRW50cmllcztcclxuICAgICAgICAgICAgbmV4dExldmVsRW50cmllcyA9IDA7XHJcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoKHJvdyk7XHJcbiAgICAgICAgICAgIHJvdyA9IFtdO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgcm93LnB1c2goZW50cnkuZm4pO1xyXG4gICAgICAgICAgZW50cnkuY2hpbGRyZW4uZm9yRWFjaChmdW5jdGlvbihjaGlsZEVudHJ5KSB7XHJcbiAgICAgICAgICAgIG5leHRMZXZlbEVudHJpZXMrKztcclxuICAgICAgICAgICAgcXVldWUucHVzaChjaGlsZEVudHJ5KTtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgcmVtYWluaW5nTGV2ZWxFbnRyaWVzLS07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAocm93Lmxlbmd0aCkge1xyXG4gICAgICAgICAgcmVzdWx0LnB1c2gocm93KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBUT0RPKG1hdHNrbyk6IGRvY3VtZW50IHRoZSBzaWduYXR1cmUgaW4gYSBiZXR0ZXIgd2F5XHJcbiAgICByZXR1cm4gZnVuY3Rpb24oZWxlbWVudCwgZXZlbnQsIG9wdGlvbnMpIHtcclxuICAgICAgb3B0aW9ucyA9IHByZXBhcmVBbmltYXRpb25PcHRpb25zKG9wdGlvbnMpO1xyXG4gICAgICB2YXIgaXNTdHJ1Y3R1cmFsID0gWydlbnRlcicsICdtb3ZlJywgJ2xlYXZlJ10uaW5kZXhPZihldmVudCkgPj0gMDtcclxuXHJcbiAgICAgIC8vIHRoZXJlIGlzIG5vIGFuaW1hdGlvbiBhdCB0aGUgY3VycmVudCBtb21lbnQsIGhvd2V2ZXJcclxuICAgICAgLy8gdGhlc2UgcnVubmVyIG1ldGhvZHMgd2lsbCBnZXQgbGF0ZXIgdXBkYXRlZCB3aXRoIHRoZVxyXG4gICAgICAvLyBtZXRob2RzIGxlYWRpbmcgaW50byB0aGUgZHJpdmVyJ3MgZW5kL2NhbmNlbCBtZXRob2RzXHJcbiAgICAgIC8vIGZvciBub3cgdGhleSBqdXN0IHN0b3AgdGhlIGFuaW1hdGlvbiBmcm9tIHN0YXJ0aW5nXHJcbiAgICAgIHZhciBydW5uZXIgPSBuZXcgJCRBbmltYXRlUnVubmVyKHtcclxuICAgICAgICBlbmQ6IGZ1bmN0aW9uKCkgeyBjbG9zZSgpOyB9LFxyXG4gICAgICAgIGNhbmNlbDogZnVuY3Rpb24oKSB7IGNsb3NlKHRydWUpOyB9XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgaWYgKCFkcml2ZXJzLmxlbmd0aCkge1xyXG4gICAgICAgIGNsb3NlKCk7XHJcbiAgICAgICAgcmV0dXJuIHJ1bm5lcjtcclxuICAgICAgfVxyXG5cclxuICAgICAgc2V0UnVubmVyKGVsZW1lbnQsIHJ1bm5lcik7XHJcblxyXG4gICAgICB2YXIgY2xhc3NlcyA9IG1lcmdlQ2xhc3NlcyhlbGVtZW50LmF0dHIoJ2NsYXNzJyksIG1lcmdlQ2xhc3NlcyhvcHRpb25zLmFkZENsYXNzLCBvcHRpb25zLnJlbW92ZUNsYXNzKSk7XHJcbiAgICAgIHZhciB0ZW1wQ2xhc3NlcyA9IG9wdGlvbnMudGVtcENsYXNzZXM7XHJcbiAgICAgIGlmICh0ZW1wQ2xhc3Nlcykge1xyXG4gICAgICAgIGNsYXNzZXMgKz0gJyAnICsgdGVtcENsYXNzZXM7XHJcbiAgICAgICAgb3B0aW9ucy50ZW1wQ2xhc3NlcyA9IG51bGw7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHZhciBwcmVwYXJlQ2xhc3NOYW1lO1xyXG4gICAgICBpZiAoaXNTdHJ1Y3R1cmFsKSB7XHJcbiAgICAgICAgcHJlcGFyZUNsYXNzTmFtZSA9ICduZy0nICsgZXZlbnQgKyBQUkVQQVJFX0NMQVNTX1NVRkZJWDtcclxuICAgICAgICAkJGpxTGl0ZS5hZGRDbGFzcyhlbGVtZW50LCBwcmVwYXJlQ2xhc3NOYW1lKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgYW5pbWF0aW9uUXVldWUucHVzaCh7XHJcbiAgICAgICAgLy8gdGhpcyBkYXRhIGlzIHVzZWQgYnkgdGhlIHBvc3REaWdlc3QgY29kZSBhbmQgcGFzc2VkIGludG9cclxuICAgICAgICAvLyB0aGUgZHJpdmVyIHN0ZXAgZnVuY3Rpb25cclxuICAgICAgICBlbGVtZW50OiBlbGVtZW50LFxyXG4gICAgICAgIGNsYXNzZXM6IGNsYXNzZXMsXHJcbiAgICAgICAgZXZlbnQ6IGV2ZW50LFxyXG4gICAgICAgIHN0cnVjdHVyYWw6IGlzU3RydWN0dXJhbCxcclxuICAgICAgICBvcHRpb25zOiBvcHRpb25zLFxyXG4gICAgICAgIGJlZm9yZVN0YXJ0OiBiZWZvcmVTdGFydCxcclxuICAgICAgICBjbG9zZTogY2xvc2VcclxuICAgICAgfSk7XHJcblxyXG4gICAgICBlbGVtZW50Lm9uKCckZGVzdHJveScsIGhhbmRsZURlc3Ryb3llZEVsZW1lbnQpO1xyXG5cclxuICAgICAgLy8gd2Ugb25seSB3YW50IHRoZXJlIHRvIGJlIG9uZSBmdW5jdGlvbiBjYWxsZWQgd2l0aGluIHRoZSBwb3N0IGRpZ2VzdFxyXG4gICAgICAvLyBibG9jay4gVGhpcyB3YXkgd2UgY2FuIGdyb3VwIGFuaW1hdGlvbnMgZm9yIGFsbCB0aGUgYW5pbWF0aW9ucyB0aGF0XHJcbiAgICAgIC8vIHdlcmUgYXBhcnQgb2YgdGhlIHNhbWUgcG9zdERpZ2VzdCBmbHVzaCBjYWxsLlxyXG4gICAgICBpZiAoYW5pbWF0aW9uUXVldWUubGVuZ3RoID4gMSkgcmV0dXJuIHJ1bm5lcjtcclxuXHJcbiAgICAgICRyb290U2NvcGUuJCRwb3N0RGlnZXN0KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBhbmltYXRpb25zID0gW107XHJcbiAgICAgICAgZm9yRWFjaChhbmltYXRpb25RdWV1ZSwgZnVuY3Rpb24oZW50cnkpIHtcclxuICAgICAgICAgIC8vIHRoZSBlbGVtZW50IHdhcyBkZXN0cm95ZWQgZWFybHkgb24gd2hpY2ggcmVtb3ZlZCB0aGUgcnVubmVyXHJcbiAgICAgICAgICAvLyBmb3JtIGl0cyBzdG9yYWdlLiBUaGlzIG1lYW5zIHdlIGNhbid0IGFuaW1hdGUgdGhpcyBlbGVtZW50XHJcbiAgICAgICAgICAvLyBhdCBhbGwgYW5kIGl0IGFscmVhZHkgaGFzIGJlZW4gY2xvc2VkIGR1ZSB0byBkZXN0cnVjdGlvbi5cclxuICAgICAgICAgIGlmIChnZXRSdW5uZXIoZW50cnkuZWxlbWVudCkpIHtcclxuICAgICAgICAgICAgYW5pbWF0aW9ucy5wdXNoKGVudHJ5KTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGVudHJ5LmNsb3NlKCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIG5vdyBhbnkgZnV0dXJlIGFuaW1hdGlvbnMgd2lsbCBiZSBpbiBhbm90aGVyIHBvc3REaWdlc3RcclxuICAgICAgICBhbmltYXRpb25RdWV1ZS5sZW5ndGggPSAwO1xyXG5cclxuICAgICAgICB2YXIgZ3JvdXBlZEFuaW1hdGlvbnMgPSBncm91cEFuaW1hdGlvbnMoYW5pbWF0aW9ucyk7XHJcbiAgICAgICAgdmFyIHRvQmVTb3J0ZWRBbmltYXRpb25zID0gW107XHJcblxyXG4gICAgICAgIGZvckVhY2goZ3JvdXBlZEFuaW1hdGlvbnMsIGZ1bmN0aW9uKGFuaW1hdGlvbkVudHJ5KSB7XHJcbiAgICAgICAgICB0b0JlU29ydGVkQW5pbWF0aW9ucy5wdXNoKHtcclxuICAgICAgICAgICAgZG9tTm9kZTogZ2V0RG9tTm9kZShhbmltYXRpb25FbnRyeS5mcm9tID8gYW5pbWF0aW9uRW50cnkuZnJvbS5lbGVtZW50IDogYW5pbWF0aW9uRW50cnkuZWxlbWVudCksXHJcbiAgICAgICAgICAgIGZuOiBmdW5jdGlvbiB0cmlnZ2VyQW5pbWF0aW9uU3RhcnQoKSB7XHJcbiAgICAgICAgICAgICAgLy8gaXQncyBpbXBvcnRhbnQgdGhhdCB3ZSBhcHBseSB0aGUgYG5nLWFuaW1hdGVgIENTUyBjbGFzcyBhbmQgdGhlXHJcbiAgICAgICAgICAgICAgLy8gdGVtcG9yYXJ5IGNsYXNzZXMgYmVmb3JlIHdlIGRvIGFueSBkcml2ZXIgaW52b2tpbmcgc2luY2UgdGhlc2VcclxuICAgICAgICAgICAgICAvLyBDU1MgY2xhc3NlcyBtYXkgYmUgcmVxdWlyZWQgZm9yIHByb3BlciBDU1MgZGV0ZWN0aW9uLlxyXG4gICAgICAgICAgICAgIGFuaW1hdGlvbkVudHJ5LmJlZm9yZVN0YXJ0KCk7XHJcblxyXG4gICAgICAgICAgICAgIHZhciBzdGFydEFuaW1hdGlvbkZuLCBjbG9zZUZuID0gYW5pbWF0aW9uRW50cnkuY2xvc2U7XHJcblxyXG4gICAgICAgICAgICAgIC8vIGluIHRoZSBldmVudCB0aGF0IHRoZSBlbGVtZW50IHdhcyByZW1vdmVkIGJlZm9yZSB0aGUgZGlnZXN0IHJ1bnMgb3JcclxuICAgICAgICAgICAgICAvLyBkdXJpbmcgdGhlIFJBRiBzZXF1ZW5jaW5nIHRoZW4gd2Ugc2hvdWxkIG5vdCB0cmlnZ2VyIHRoZSBhbmltYXRpb24uXHJcbiAgICAgICAgICAgICAgdmFyIHRhcmdldEVsZW1lbnQgPSBhbmltYXRpb25FbnRyeS5hbmNob3JzXHJcbiAgICAgICAgICAgICAgICAgID8gKGFuaW1hdGlvbkVudHJ5LmZyb20uZWxlbWVudCB8fCBhbmltYXRpb25FbnRyeS50by5lbGVtZW50KVxyXG4gICAgICAgICAgICAgICAgICA6IGFuaW1hdGlvbkVudHJ5LmVsZW1lbnQ7XHJcblxyXG4gICAgICAgICAgICAgIGlmIChnZXRSdW5uZXIodGFyZ2V0RWxlbWVudCkpIHtcclxuICAgICAgICAgICAgICAgIHZhciBvcGVyYXRpb24gPSBpbnZva2VGaXJzdERyaXZlcihhbmltYXRpb25FbnRyeSk7XHJcbiAgICAgICAgICAgICAgICBpZiAob3BlcmF0aW9uKSB7XHJcbiAgICAgICAgICAgICAgICAgIHN0YXJ0QW5pbWF0aW9uRm4gPSBvcGVyYXRpb24uc3RhcnQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICBpZiAoIXN0YXJ0QW5pbWF0aW9uRm4pIHtcclxuICAgICAgICAgICAgICAgIGNsb3NlRm4oKTtcclxuICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdmFyIGFuaW1hdGlvblJ1bm5lciA9IHN0YXJ0QW5pbWF0aW9uRm4oKTtcclxuICAgICAgICAgICAgICAgIGFuaW1hdGlvblJ1bm5lci5kb25lKGZ1bmN0aW9uKHN0YXR1cykge1xyXG4gICAgICAgICAgICAgICAgICBjbG9zZUZuKCFzdGF0dXMpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB1cGRhdGVBbmltYXRpb25SdW5uZXJzKGFuaW1hdGlvbkVudHJ5LCBhbmltYXRpb25SdW5uZXIpO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIHdlIG5lZWQgdG8gc29ydCBlYWNoIG9mIHRoZSBhbmltYXRpb25zIGluIG9yZGVyIG9mIHBhcmVudCB0byBjaGlsZFxyXG4gICAgICAgIC8vIHJlbGF0aW9uc2hpcHMuIFRoaXMgZW5zdXJlcyB0aGF0IHRoZSBjaGlsZCBjbGFzc2VzIGFyZSBhcHBsaWVkIGF0IHRoZVxyXG4gICAgICAgIC8vIHJpZ2h0IHRpbWUuXHJcbiAgICAgICAgJCRyQUZTY2hlZHVsZXIoc29ydEFuaW1hdGlvbnModG9CZVNvcnRlZEFuaW1hdGlvbnMpKTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICByZXR1cm4gcnVubmVyO1xyXG5cclxuICAgICAgLy8gVE9ETyhtYXRza28pOiBjaGFuZ2UgdG8gcmVmZXJlbmNlIG5vZGVzXHJcbiAgICAgIGZ1bmN0aW9uIGdldEFuY2hvck5vZGVzKG5vZGUpIHtcclxuICAgICAgICB2YXIgU0VMRUNUT1IgPSAnWycgKyBOR19BTklNQVRFX1JFRl9BVFRSICsgJ10nO1xyXG4gICAgICAgIHZhciBpdGVtcyA9IG5vZGUuaGFzQXR0cmlidXRlKE5HX0FOSU1BVEVfUkVGX0FUVFIpXHJcbiAgICAgICAgICAgICAgPyBbbm9kZV1cclxuICAgICAgICAgICAgICA6IG5vZGUucXVlcnlTZWxlY3RvckFsbChTRUxFQ1RPUik7XHJcbiAgICAgICAgdmFyIGFuY2hvcnMgPSBbXTtcclxuICAgICAgICBmb3JFYWNoKGl0ZW1zLCBmdW5jdGlvbihub2RlKSB7XHJcbiAgICAgICAgICB2YXIgYXR0ciA9IG5vZGUuZ2V0QXR0cmlidXRlKE5HX0FOSU1BVEVfUkVGX0FUVFIpO1xyXG4gICAgICAgICAgaWYgKGF0dHIgJiYgYXR0ci5sZW5ndGgpIHtcclxuICAgICAgICAgICAgYW5jaG9ycy5wdXNoKG5vZGUpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiBhbmNob3JzO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBmdW5jdGlvbiBncm91cEFuaW1hdGlvbnMoYW5pbWF0aW9ucykge1xyXG4gICAgICAgIHZhciBwcmVwYXJlZEFuaW1hdGlvbnMgPSBbXTtcclxuICAgICAgICB2YXIgcmVmTG9va3VwID0ge307XHJcbiAgICAgICAgZm9yRWFjaChhbmltYXRpb25zLCBmdW5jdGlvbihhbmltYXRpb24sIGluZGV4KSB7XHJcbiAgICAgICAgICB2YXIgZWxlbWVudCA9IGFuaW1hdGlvbi5lbGVtZW50O1xyXG4gICAgICAgICAgdmFyIG5vZGUgPSBnZXREb21Ob2RlKGVsZW1lbnQpO1xyXG4gICAgICAgICAgdmFyIGV2ZW50ID0gYW5pbWF0aW9uLmV2ZW50O1xyXG4gICAgICAgICAgdmFyIGVudGVyT3JNb3ZlID0gWydlbnRlcicsICdtb3ZlJ10uaW5kZXhPZihldmVudCkgPj0gMDtcclxuICAgICAgICAgIHZhciBhbmNob3JOb2RlcyA9IGFuaW1hdGlvbi5zdHJ1Y3R1cmFsID8gZ2V0QW5jaG9yTm9kZXMobm9kZSkgOiBbXTtcclxuXHJcbiAgICAgICAgICBpZiAoYW5jaG9yTm9kZXMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIHZhciBkaXJlY3Rpb24gPSBlbnRlck9yTW92ZSA/ICd0bycgOiAnZnJvbSc7XHJcblxyXG4gICAgICAgICAgICBmb3JFYWNoKGFuY2hvck5vZGVzLCBmdW5jdGlvbihhbmNob3IpIHtcclxuICAgICAgICAgICAgICB2YXIga2V5ID0gYW5jaG9yLmdldEF0dHJpYnV0ZShOR19BTklNQVRFX1JFRl9BVFRSKTtcclxuICAgICAgICAgICAgICByZWZMb29rdXBba2V5XSA9IHJlZkxvb2t1cFtrZXldIHx8IHt9O1xyXG4gICAgICAgICAgICAgIHJlZkxvb2t1cFtrZXldW2RpcmVjdGlvbl0gPSB7XHJcbiAgICAgICAgICAgICAgICBhbmltYXRpb25JRDogaW5kZXgsXHJcbiAgICAgICAgICAgICAgICBlbGVtZW50OiBqcUxpdGUoYW5jaG9yKVxyXG4gICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcHJlcGFyZWRBbmltYXRpb25zLnB1c2goYW5pbWF0aW9uKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdmFyIHVzZWRJbmRpY2VzTG9va3VwID0ge307XHJcbiAgICAgICAgdmFyIGFuY2hvckdyb3VwcyA9IHt9O1xyXG4gICAgICAgIGZvckVhY2gocmVmTG9va3VwLCBmdW5jdGlvbihvcGVyYXRpb25zLCBrZXkpIHtcclxuICAgICAgICAgIHZhciBmcm9tID0gb3BlcmF0aW9ucy5mcm9tO1xyXG4gICAgICAgICAgdmFyIHRvID0gb3BlcmF0aW9ucy50bztcclxuXHJcbiAgICAgICAgICBpZiAoIWZyb20gfHwgIXRvKSB7XHJcbiAgICAgICAgICAgIC8vIG9ubHkgb25lIG9mIHRoZXNlIGlzIHNldCB0aGVyZWZvcmUgd2UgY2FuJ3QgaGF2ZSBhblxyXG4gICAgICAgICAgICAvLyBhbmNob3IgYW5pbWF0aW9uIHNpbmNlIGFsbCB0aHJlZSBwaWVjZXMgYXJlIHJlcXVpcmVkXHJcbiAgICAgICAgICAgIHZhciBpbmRleCA9IGZyb20gPyBmcm9tLmFuaW1hdGlvbklEIDogdG8uYW5pbWF0aW9uSUQ7XHJcbiAgICAgICAgICAgIHZhciBpbmRleEtleSA9IGluZGV4LnRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgIGlmICghdXNlZEluZGljZXNMb29rdXBbaW5kZXhLZXldKSB7XHJcbiAgICAgICAgICAgICAgdXNlZEluZGljZXNMb29rdXBbaW5kZXhLZXldID0gdHJ1ZTtcclxuICAgICAgICAgICAgICBwcmVwYXJlZEFuaW1hdGlvbnMucHVzaChhbmltYXRpb25zW2luZGV4XSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIHZhciBmcm9tQW5pbWF0aW9uID0gYW5pbWF0aW9uc1tmcm9tLmFuaW1hdGlvbklEXTtcclxuICAgICAgICAgIHZhciB0b0FuaW1hdGlvbiA9IGFuaW1hdGlvbnNbdG8uYW5pbWF0aW9uSURdO1xyXG4gICAgICAgICAgdmFyIGxvb2t1cEtleSA9IGZyb20uYW5pbWF0aW9uSUQudG9TdHJpbmcoKTtcclxuICAgICAgICAgIGlmICghYW5jaG9yR3JvdXBzW2xvb2t1cEtleV0pIHtcclxuICAgICAgICAgICAgdmFyIGdyb3VwID0gYW5jaG9yR3JvdXBzW2xvb2t1cEtleV0gPSB7XHJcbiAgICAgICAgICAgICAgc3RydWN0dXJhbDogdHJ1ZSxcclxuICAgICAgICAgICAgICBiZWZvcmVTdGFydDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBmcm9tQW5pbWF0aW9uLmJlZm9yZVN0YXJ0KCk7XHJcbiAgICAgICAgICAgICAgICB0b0FuaW1hdGlvbi5iZWZvcmVTdGFydCgpO1xyXG4gICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgY2xvc2U6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgZnJvbUFuaW1hdGlvbi5jbG9zZSgpO1xyXG4gICAgICAgICAgICAgICAgdG9BbmltYXRpb24uY2xvc2UoKTtcclxuICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgIGNsYXNzZXM6IGNzc0NsYXNzZXNJbnRlcnNlY3Rpb24oZnJvbUFuaW1hdGlvbi5jbGFzc2VzLCB0b0FuaW1hdGlvbi5jbGFzc2VzKSxcclxuICAgICAgICAgICAgICBmcm9tOiBmcm9tQW5pbWF0aW9uLFxyXG4gICAgICAgICAgICAgIHRvOiB0b0FuaW1hdGlvbixcclxuICAgICAgICAgICAgICBhbmNob3JzOiBbXSAvLyBUT0RPKG1hdHNrbyk6IGNoYW5nZSB0byByZWZlcmVuY2Ugbm9kZXNcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIC8vIHRoZSBhbmNob3IgYW5pbWF0aW9ucyByZXF1aXJlIHRoYXQgdGhlIGZyb20gYW5kIHRvIGVsZW1lbnRzIGJvdGggaGF2ZSBhdCBsZWFzdFxyXG4gICAgICAgICAgICAvLyBvbmUgc2hhcmVkIENTUyBjbGFzcyB3aGljaCBlZmZlY3RpdmVseSBtYXJyaWVzIHRoZSB0d28gZWxlbWVudHMgdG9nZXRoZXIgdG8gdXNlXHJcbiAgICAgICAgICAgIC8vIHRoZSBzYW1lIGFuaW1hdGlvbiBkcml2ZXIgYW5kIHRvIHByb3Blcmx5IHNlcXVlbmNlIHRoZSBhbmNob3IgYW5pbWF0aW9uLlxyXG4gICAgICAgICAgICBpZiAoZ3JvdXAuY2xhc3Nlcy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICBwcmVwYXJlZEFuaW1hdGlvbnMucHVzaChncm91cCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgcHJlcGFyZWRBbmltYXRpb25zLnB1c2goZnJvbUFuaW1hdGlvbik7XHJcbiAgICAgICAgICAgICAgcHJlcGFyZWRBbmltYXRpb25zLnB1c2godG9BbmltYXRpb24pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgYW5jaG9yR3JvdXBzW2xvb2t1cEtleV0uYW5jaG9ycy5wdXNoKHtcclxuICAgICAgICAgICAgJ291dCc6IGZyb20uZWxlbWVudCwgJ2luJzogdG8uZWxlbWVudFxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJldHVybiBwcmVwYXJlZEFuaW1hdGlvbnM7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGZ1bmN0aW9uIGNzc0NsYXNzZXNJbnRlcnNlY3Rpb24oYSxiKSB7XHJcbiAgICAgICAgYSA9IGEuc3BsaXQoJyAnKTtcclxuICAgICAgICBiID0gYi5zcGxpdCgnICcpO1xyXG4gICAgICAgIHZhciBtYXRjaGVzID0gW107XHJcblxyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYS5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgdmFyIGFhID0gYVtpXTtcclxuICAgICAgICAgIGlmIChhYS5zdWJzdHJpbmcoMCwzKSA9PT0gJ25nLScpIGNvbnRpbnVlO1xyXG5cclxuICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgYi5sZW5ndGg7IGorKykge1xyXG4gICAgICAgICAgICBpZiAoYWEgPT09IGJbal0pIHtcclxuICAgICAgICAgICAgICBtYXRjaGVzLnB1c2goYWEpO1xyXG4gICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gbWF0Y2hlcy5qb2luKCcgJyk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGZ1bmN0aW9uIGludm9rZUZpcnN0RHJpdmVyKGFuaW1hdGlvbkRldGFpbHMpIHtcclxuICAgICAgICAvLyB3ZSBsb29wIGluIHJldmVyc2Ugb3JkZXIgc2luY2UgdGhlIG1vcmUgZ2VuZXJhbCBkcml2ZXJzIChsaWtlIENTUyBhbmQgSlMpXHJcbiAgICAgICAgLy8gbWF5IGF0dGVtcHQgbW9yZSBlbGVtZW50cywgYnV0IGN1c3RvbSBkcml2ZXJzIGFyZSBtb3JlIHBhcnRpY3VsYXJcclxuICAgICAgICBmb3IgKHZhciBpID0gZHJpdmVycy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xyXG4gICAgICAgICAgdmFyIGRyaXZlck5hbWUgPSBkcml2ZXJzW2ldO1xyXG4gICAgICAgICAgdmFyIGZhY3RvcnkgPSAkaW5qZWN0b3IuZ2V0KGRyaXZlck5hbWUpO1xyXG4gICAgICAgICAgdmFyIGRyaXZlciA9IGZhY3RvcnkoYW5pbWF0aW9uRGV0YWlscyk7XHJcbiAgICAgICAgICBpZiAoZHJpdmVyKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBkcml2ZXI7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICBmdW5jdGlvbiBiZWZvcmVTdGFydCgpIHtcclxuICAgICAgICBlbGVtZW50LmFkZENsYXNzKE5HX0FOSU1BVEVfQ0xBU1NOQU1FKTtcclxuICAgICAgICBpZiAodGVtcENsYXNzZXMpIHtcclxuICAgICAgICAgICQkanFMaXRlLmFkZENsYXNzKGVsZW1lbnQsIHRlbXBDbGFzc2VzKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHByZXBhcmVDbGFzc05hbWUpIHtcclxuICAgICAgICAgICQkanFMaXRlLnJlbW92ZUNsYXNzKGVsZW1lbnQsIHByZXBhcmVDbGFzc05hbWUpO1xyXG4gICAgICAgICAgcHJlcGFyZUNsYXNzTmFtZSA9IG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICBmdW5jdGlvbiB1cGRhdGVBbmltYXRpb25SdW5uZXJzKGFuaW1hdGlvbiwgbmV3UnVubmVyKSB7XHJcbiAgICAgICAgaWYgKGFuaW1hdGlvbi5mcm9tICYmIGFuaW1hdGlvbi50bykge1xyXG4gICAgICAgICAgdXBkYXRlKGFuaW1hdGlvbi5mcm9tLmVsZW1lbnQpO1xyXG4gICAgICAgICAgdXBkYXRlKGFuaW1hdGlvbi50by5lbGVtZW50KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgdXBkYXRlKGFuaW1hdGlvbi5lbGVtZW50KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHVwZGF0ZShlbGVtZW50KSB7XHJcbiAgICAgICAgICB2YXIgcnVubmVyID0gZ2V0UnVubmVyKGVsZW1lbnQpO1xyXG4gICAgICAgICAgaWYgKHJ1bm5lcikgcnVubmVyLnNldEhvc3QobmV3UnVubmVyKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGZ1bmN0aW9uIGhhbmRsZURlc3Ryb3llZEVsZW1lbnQoKSB7XHJcbiAgICAgICAgdmFyIHJ1bm5lciA9IGdldFJ1bm5lcihlbGVtZW50KTtcclxuICAgICAgICBpZiAocnVubmVyICYmIChldmVudCAhPT0gJ2xlYXZlJyB8fCAhb3B0aW9ucy4kJGRvbU9wZXJhdGlvbkZpcmVkKSkge1xyXG4gICAgICAgICAgcnVubmVyLmVuZCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgZnVuY3Rpb24gY2xvc2UocmVqZWN0ZWQpIHsgLy8ganNoaW50IGlnbm9yZTpsaW5lXHJcbiAgICAgICAgZWxlbWVudC5vZmYoJyRkZXN0cm95JywgaGFuZGxlRGVzdHJveWVkRWxlbWVudCk7XHJcbiAgICAgICAgcmVtb3ZlUnVubmVyKGVsZW1lbnQpO1xyXG5cclxuICAgICAgICBhcHBseUFuaW1hdGlvbkNsYXNzZXMoZWxlbWVudCwgb3B0aW9ucyk7XHJcbiAgICAgICAgYXBwbHlBbmltYXRpb25TdHlsZXMoZWxlbWVudCwgb3B0aW9ucyk7XHJcbiAgICAgICAgb3B0aW9ucy5kb21PcGVyYXRpb24oKTtcclxuXHJcbiAgICAgICAgaWYgKHRlbXBDbGFzc2VzKSB7XHJcbiAgICAgICAgICAkJGpxTGl0ZS5yZW1vdmVDbGFzcyhlbGVtZW50LCB0ZW1wQ2xhc3Nlcyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBlbGVtZW50LnJlbW92ZUNsYXNzKE5HX0FOSU1BVEVfQ0xBU1NOQU1FKTtcclxuICAgICAgICBydW5uZXIuY29tcGxldGUoIXJlamVjdGVkKTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuICB9XTtcclxufV07XHJcblxyXG4vKipcclxuICogQG5nZG9jIGRpcmVjdGl2ZVxyXG4gKiBAbmFtZSBuZ0FuaW1hdGVTd2FwXHJcbiAqIEByZXN0cmljdCBBXHJcbiAqIEBzY29wZVxyXG4gKlxyXG4gKiBAZGVzY3JpcHRpb25cclxuICpcclxuICogbmdBbmltYXRlU3dhcCBpcyBhIGFuaW1hdGlvbi1vcmllbnRlZCBkaXJlY3RpdmUgdGhhdCBhbGxvd3MgZm9yIHRoZSBjb250YWluZXIgdG9cclxuICogYmUgcmVtb3ZlZCBhbmQgZW50ZXJlZCBpbiB3aGVuZXZlciB0aGUgYXNzb2NpYXRlZCBleHByZXNzaW9uIGNoYW5nZXMuIEFcclxuICogY29tbW9uIHVzZWNhc2UgZm9yIHRoaXMgZGlyZWN0aXZlIGlzIGEgcm90YXRpbmcgYmFubmVyIG9yIHNsaWRlciBjb21wb25lbnQgd2hpY2hcclxuICogY29udGFpbnMgb25lIGltYWdlIGJlaW5nIHByZXNlbnQgYXQgYSB0aW1lLiBXaGVuIHRoZSBhY3RpdmUgaW1hZ2UgY2hhbmdlc1xyXG4gKiB0aGVuIHRoZSBvbGQgaW1hZ2Ugd2lsbCBwZXJmb3JtIGEgYGxlYXZlYCBhbmltYXRpb24gYW5kIHRoZSBuZXcgZWxlbWVudFxyXG4gKiB3aWxsIGJlIGluc2VydGVkIHZpYSBhbiBgZW50ZXJgIGFuaW1hdGlvbi5cclxuICpcclxuICogQGFuaW1hdGlvbnNcclxuICogfCBBbmltYXRpb24gICAgICAgICAgICAgICAgICAgICAgICB8IE9jY3VycyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XHJcbiAqIHwtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tfC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tfFxyXG4gKiB8IHtAbGluayBuZy4kYW5pbWF0ZSNlbnRlciBlbnRlcn0gIHwgd2hlbiB0aGUgbmV3IGVsZW1lbnQgaXMgaW5zZXJ0ZWQgdG8gdGhlIERPTSAgfFxyXG4gKiB8IHtAbGluayBuZy4kYW5pbWF0ZSNsZWF2ZSBsZWF2ZX0gIHwgd2hlbiB0aGUgb2xkIGVsZW1lbnQgaXMgcmVtb3ZlZCBmcm9tIHRoZSBET00gfFxyXG4gKlxyXG4gKiBAZXhhbXBsZVxyXG4gKiA8ZXhhbXBsZSBuYW1lPVwibmdBbmltYXRlU3dhcC1kaXJlY3RpdmVcIiBtb2R1bGU9XCJuZ0FuaW1hdGVTd2FwRXhhbXBsZVwiXHJcbiAqICAgICAgICAgIGRlcHM9XCJhbmd1bGFyLWFuaW1hdGUuanNcIlxyXG4gKiAgICAgICAgICBhbmltYXRpb25zPVwidHJ1ZVwiIGZpeEJhc2U9XCJ0cnVlXCI+XHJcbiAqICAgPGZpbGUgbmFtZT1cImluZGV4Lmh0bWxcIj5cclxuICogICAgIDxkaXYgY2xhc3M9XCJjb250YWluZXJcIiBuZy1jb250cm9sbGVyPVwiQXBwQ3RybFwiPlxyXG4gKiAgICAgICA8ZGl2IG5nLWFuaW1hdGUtc3dhcD1cIm51bWJlclwiIGNsYXNzPVwiY2VsbCBzd2FwLWFuaW1hdGlvblwiIG5nLWNsYXNzPVwiY29sb3JDbGFzcyhudW1iZXIpXCI+XHJcbiAqICAgICAgICAge3sgbnVtYmVyIH19XHJcbiAqICAgICAgIDwvZGl2PlxyXG4gKiAgICAgPC9kaXY+XHJcbiAqICAgPC9maWxlPlxyXG4gKiAgIDxmaWxlIG5hbWU9XCJzY3JpcHQuanNcIj5cclxuICogICAgIGFuZ3VsYXIubW9kdWxlKCduZ0FuaW1hdGVTd2FwRXhhbXBsZScsIFsnbmdBbmltYXRlJ10pXHJcbiAqICAgICAgIC5jb250cm9sbGVyKCdBcHBDdHJsJywgWyckc2NvcGUnLCAnJGludGVydmFsJywgZnVuY3Rpb24oJHNjb3BlLCAkaW50ZXJ2YWwpIHtcclxuICogICAgICAgICAkc2NvcGUubnVtYmVyID0gMDtcclxuICogICAgICAgICAkaW50ZXJ2YWwoZnVuY3Rpb24oKSB7XHJcbiAqICAgICAgICAgICAkc2NvcGUubnVtYmVyKys7XHJcbiAqICAgICAgICAgfSwgMTAwMCk7XHJcbiAqXHJcbiAqICAgICAgICAgdmFyIGNvbG9ycyA9IFsncmVkJywnYmx1ZScsJ2dyZWVuJywneWVsbG93Jywnb3JhbmdlJ107XHJcbiAqICAgICAgICAgJHNjb3BlLmNvbG9yQ2xhc3MgPSBmdW5jdGlvbihudW1iZXIpIHtcclxuICogICAgICAgICAgIHJldHVybiBjb2xvcnNbbnVtYmVyICUgY29sb3JzLmxlbmd0aF07XHJcbiAqICAgICAgICAgfTtcclxuICogICAgICAgfV0pO1xyXG4gKiAgIDwvZmlsZT5cclxuICogIDxmaWxlIG5hbWU9XCJhbmltYXRpb25zLmNzc1wiPlxyXG4gKiAgLmNvbnRhaW5lciB7XHJcbiAqICAgIGhlaWdodDoyNTBweDtcclxuICogICAgd2lkdGg6MjUwcHg7XHJcbiAqICAgIHBvc2l0aW9uOnJlbGF0aXZlO1xyXG4gKiAgICBvdmVyZmxvdzpoaWRkZW47XHJcbiAqICAgIGJvcmRlcjoycHggc29saWQgYmxhY2s7XHJcbiAqICB9XHJcbiAqICAuY29udGFpbmVyIC5jZWxsIHtcclxuICogICAgZm9udC1zaXplOjE1MHB4O1xyXG4gKiAgICB0ZXh0LWFsaWduOmNlbnRlcjtcclxuICogICAgbGluZS1oZWlnaHQ6MjUwcHg7XHJcbiAqICAgIHBvc2l0aW9uOmFic29sdXRlO1xyXG4gKiAgICB0b3A6MDtcclxuICogICAgbGVmdDowO1xyXG4gKiAgICByaWdodDowO1xyXG4gKiAgICBib3JkZXItYm90dG9tOjJweCBzb2xpZCBibGFjaztcclxuICogIH1cclxuICogIC5zd2FwLWFuaW1hdGlvbi5uZy1lbnRlciwgLnN3YXAtYW5pbWF0aW9uLm5nLWxlYXZlIHtcclxuICogICAgdHJhbnNpdGlvbjowLjVzIGxpbmVhciBhbGw7XHJcbiAqICB9XHJcbiAqICAuc3dhcC1hbmltYXRpb24ubmctZW50ZXIge1xyXG4gKiAgICB0b3A6LTI1MHB4O1xyXG4gKiAgfVxyXG4gKiAgLnN3YXAtYW5pbWF0aW9uLm5nLWVudGVyLWFjdGl2ZSB7XHJcbiAqICAgIHRvcDowcHg7XHJcbiAqICB9XHJcbiAqICAuc3dhcC1hbmltYXRpb24ubmctbGVhdmUge1xyXG4gKiAgICB0b3A6MHB4O1xyXG4gKiAgfVxyXG4gKiAgLnN3YXAtYW5pbWF0aW9uLm5nLWxlYXZlLWFjdGl2ZSB7XHJcbiAqICAgIHRvcDoyNTBweDtcclxuICogIH1cclxuICogIC5yZWQgeyBiYWNrZ3JvdW5kOnJlZDsgfVxyXG4gKiAgLmdyZWVuIHsgYmFja2dyb3VuZDpncmVlbjsgfVxyXG4gKiAgLmJsdWUgeyBiYWNrZ3JvdW5kOmJsdWU7IH1cclxuICogIC55ZWxsb3cgeyBiYWNrZ3JvdW5kOnllbGxvdzsgfVxyXG4gKiAgLm9yYW5nZSB7IGJhY2tncm91bmQ6b3JhbmdlOyB9XHJcbiAqICA8L2ZpbGU+XHJcbiAqIDwvZXhhbXBsZT5cclxuICovXHJcbnZhciBuZ0FuaW1hdGVTd2FwRGlyZWN0aXZlID0gWyckYW5pbWF0ZScsICckcm9vdFNjb3BlJywgZnVuY3Rpb24oJGFuaW1hdGUsICRyb290U2NvcGUpIHtcclxuICByZXR1cm4ge1xyXG4gICAgcmVzdHJpY3Q6ICdBJyxcclxuICAgIHRyYW5zY2x1ZGU6ICdlbGVtZW50JyxcclxuICAgIHRlcm1pbmFsOiB0cnVlLFxyXG4gICAgcHJpb3JpdHk6IDYwMCwgLy8gd2UgdXNlIDYwMCBoZXJlIHRvIGVuc3VyZSB0aGF0IHRoZSBkaXJlY3RpdmUgaXMgY2F1Z2h0IGJlZm9yZSBvdGhlcnNcclxuICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCAkZWxlbWVudCwgYXR0cnMsIGN0cmwsICR0cmFuc2NsdWRlKSB7XHJcbiAgICAgIHZhciBwcmV2aW91c0VsZW1lbnQsIHByZXZpb3VzU2NvcGU7XHJcbiAgICAgIHNjb3BlLiR3YXRjaENvbGxlY3Rpb24oYXR0cnMubmdBbmltYXRlU3dhcCB8fCBhdHRyc1snZm9yJ10sIGZ1bmN0aW9uKHZhbHVlKSB7XHJcbiAgICAgICAgaWYgKHByZXZpb3VzRWxlbWVudCkge1xyXG4gICAgICAgICAgJGFuaW1hdGUubGVhdmUocHJldmlvdXNFbGVtZW50KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHByZXZpb3VzU2NvcGUpIHtcclxuICAgICAgICAgIHByZXZpb3VzU2NvcGUuJGRlc3Ryb3koKTtcclxuICAgICAgICAgIHByZXZpb3VzU2NvcGUgPSBudWxsO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodmFsdWUgfHwgdmFsdWUgPT09IDApIHtcclxuICAgICAgICAgIHByZXZpb3VzU2NvcGUgPSBzY29wZS4kbmV3KCk7XHJcbiAgICAgICAgICAkdHJhbnNjbHVkZShwcmV2aW91c1Njb3BlLCBmdW5jdGlvbihlbGVtZW50KSB7XHJcbiAgICAgICAgICAgIHByZXZpb3VzRWxlbWVudCA9IGVsZW1lbnQ7XHJcbiAgICAgICAgICAgICRhbmltYXRlLmVudGVyKGVsZW1lbnQsIG51bGwsICRlbGVtZW50KTtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfTtcclxufV07XHJcblxyXG4vKipcclxuICogQG5nZG9jIG1vZHVsZVxyXG4gKiBAbmFtZSBuZ0FuaW1hdGVcclxuICogQGRlc2NyaXB0aW9uXHJcbiAqXHJcbiAqIFRoZSBgbmdBbmltYXRlYCBtb2R1bGUgcHJvdmlkZXMgc3VwcG9ydCBmb3IgQ1NTLWJhc2VkIGFuaW1hdGlvbnMgKGtleWZyYW1lcyBhbmQgdHJhbnNpdGlvbnMpIGFzIHdlbGwgYXMgSmF2YVNjcmlwdC1iYXNlZCBhbmltYXRpb25zIHZpYVxyXG4gKiBjYWxsYmFjayBob29rcy4gQW5pbWF0aW9ucyBhcmUgbm90IGVuYWJsZWQgYnkgZGVmYXVsdCwgaG93ZXZlciwgYnkgaW5jbHVkaW5nIGBuZ0FuaW1hdGVgIHRoZSBhbmltYXRpb24gaG9va3MgYXJlIGVuYWJsZWQgZm9yIGFuIEFuZ3VsYXIgYXBwLlxyXG4gKlxyXG4gKiA8ZGl2IGRvYy1tb2R1bGUtY29tcG9uZW50cz1cIm5nQW5pbWF0ZVwiPjwvZGl2PlxyXG4gKlxyXG4gKiAjIFVzYWdlXHJcbiAqIFNpbXBseSBwdXQsIHRoZXJlIGFyZSB0d28gd2F5cyB0byBtYWtlIHVzZSBvZiBhbmltYXRpb25zIHdoZW4gbmdBbmltYXRlIGlzIHVzZWQ6IGJ5IHVzaW5nICoqQ1NTKiogYW5kICoqSmF2YVNjcmlwdCoqLiBUaGUgZm9ybWVyIHdvcmtzIHB1cmVseSBiYXNlZFxyXG4gKiB1c2luZyBDU1MgKGJ5IHVzaW5nIG1hdGNoaW5nIENTUyBzZWxlY3RvcnMvc3R5bGVzKSBhbmQgdGhlIGxhdHRlciB0cmlnZ2VycyBhbmltYXRpb25zIHRoYXQgYXJlIHJlZ2lzdGVyZWQgdmlhIGBtb2R1bGUuYW5pbWF0aW9uKClgLiBGb3JcclxuICogYm90aCBDU1MgYW5kIEpTIGFuaW1hdGlvbnMgdGhlIHNvbGUgcmVxdWlyZW1lbnQgaXMgdG8gaGF2ZSBhIG1hdGNoaW5nIGBDU1MgY2xhc3NgIHRoYXQgZXhpc3RzIGJvdGggaW4gdGhlIHJlZ2lzdGVyZWQgYW5pbWF0aW9uIGFuZCB3aXRoaW5cclxuICogdGhlIEhUTUwgZWxlbWVudCB0aGF0IHRoZSBhbmltYXRpb24gd2lsbCBiZSB0cmlnZ2VyZWQgb24uXHJcbiAqXHJcbiAqICMjIERpcmVjdGl2ZSBTdXBwb3J0XHJcbiAqIFRoZSBmb2xsb3dpbmcgZGlyZWN0aXZlcyBhcmUgXCJhbmltYXRpb24gYXdhcmVcIjpcclxuICpcclxuICogfCBEaXJlY3RpdmUgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IFN1cHBvcnRlZCBBbmltYXRpb25zICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XHJcbiAqIHwtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tfC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tfFxyXG4gKiB8IHtAbGluayBuZy5kaXJlY3RpdmU6bmdSZXBlYXQjYW5pbWF0aW9ucyBuZ1JlcGVhdH0gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgZW50ZXIsIGxlYXZlIGFuZCBtb3ZlICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcclxuICogfCB7QGxpbmsgbmdSb3V0ZS5kaXJlY3RpdmU6bmdWaWV3I2FuaW1hdGlvbnMgbmdWaWV3fSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IGVudGVyIGFuZCBsZWF2ZSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XHJcbiAqIHwge0BsaW5rIG5nLmRpcmVjdGl2ZTpuZ0luY2x1ZGUjYW5pbWF0aW9ucyBuZ0luY2x1ZGV9ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCBlbnRlciBhbmQgbGVhdmUgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxyXG4gKiB8IHtAbGluayBuZy5kaXJlY3RpdmU6bmdTd2l0Y2gjYW5pbWF0aW9ucyBuZ1N3aXRjaH0gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgZW50ZXIgYW5kIGxlYXZlICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcclxuICogfCB7QGxpbmsgbmcuZGlyZWN0aXZlOm5nSWYjYW5pbWF0aW9ucyBuZ0lmfSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IGVudGVyIGFuZCBsZWF2ZSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XHJcbiAqIHwge0BsaW5rIG5nLmRpcmVjdGl2ZTpuZ0NsYXNzI2FuaW1hdGlvbnMgbmdDbGFzc30gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCBhZGQgYW5kIHJlbW92ZSAodGhlIENTUyBjbGFzcyhlcykgcHJlc2VudCkgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxyXG4gKiB8IHtAbGluayBuZy5kaXJlY3RpdmU6bmdTaG93I2FuaW1hdGlvbnMgbmdTaG93fSAmIHtAbGluayBuZy5kaXJlY3RpdmU6bmdIaWRlI2FuaW1hdGlvbnMgbmdIaWRlfSAgICAgICAgICAgIHwgYWRkIGFuZCByZW1vdmUgKHRoZSBuZy1oaWRlIGNsYXNzIHZhbHVlKSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcclxuICogfCB7QGxpbmsgbmcuZGlyZWN0aXZlOmZvcm0jYW5pbWF0aW9uLWhvb2tzIGZvcm19ICYge0BsaW5rIG5nLmRpcmVjdGl2ZTpuZ01vZGVsI2FuaW1hdGlvbi1ob29rcyBuZ01vZGVsfSAgICB8IGFkZCBhbmQgcmVtb3ZlIChkaXJ0eSwgcHJpc3RpbmUsIHZhbGlkLCBpbnZhbGlkICYgYWxsIG90aGVyIHZhbGlkYXRpb25zKSB8XHJcbiAqIHwge0BsaW5rIG1vZHVsZTpuZ01lc3NhZ2VzI2FuaW1hdGlvbnMgbmdNZXNzYWdlc30gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCBhZGQgYW5kIHJlbW92ZSAobmctYWN0aXZlICYgbmctaW5hY3RpdmUpICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxyXG4gKiB8IHtAbGluayBtb2R1bGU6bmdNZXNzYWdlcyNhbmltYXRpb25zIG5nTWVzc2FnZX0gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgZW50ZXIgYW5kIGxlYXZlICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcclxuICpcclxuICogKE1vcmUgaW5mb3JtYXRpb24gY2FuIGJlIGZvdW5kIGJ5IHZpc2l0aW5nIGVhY2ggdGhlIGRvY3VtZW50YXRpb24gYXNzb2NpYXRlZCB3aXRoIGVhY2ggZGlyZWN0aXZlLilcclxuICpcclxuICogIyMgQ1NTLWJhc2VkIEFuaW1hdGlvbnNcclxuICpcclxuICogQ1NTLWJhc2VkIGFuaW1hdGlvbnMgd2l0aCBuZ0FuaW1hdGUgYXJlIHVuaXF1ZSBzaW5jZSB0aGV5IHJlcXVpcmUgbm8gSmF2YVNjcmlwdCBjb2RlIGF0IGFsbC4gQnkgdXNpbmcgYSBDU1MgY2xhc3MgdGhhdCB3ZSByZWZlcmVuY2UgYmV0d2VlbiBvdXIgSFRNTFxyXG4gKiBhbmQgQ1NTIGNvZGUgd2UgY2FuIGNyZWF0ZSBhbiBhbmltYXRpb24gdGhhdCB3aWxsIGJlIHBpY2tlZCB1cCBieSBBbmd1bGFyIHdoZW4gYW4gdGhlIHVuZGVybHlpbmcgZGlyZWN0aXZlIHBlcmZvcm1zIGFuIG9wZXJhdGlvbi5cclxuICpcclxuICogVGhlIGV4YW1wbGUgYmVsb3cgc2hvd3MgaG93IGFuIGBlbnRlcmAgYW5pbWF0aW9uIGNhbiBiZSBtYWRlIHBvc3NpYmxlIG9uIGFuIGVsZW1lbnQgdXNpbmcgYG5nLWlmYDpcclxuICpcclxuICogYGBgaHRtbFxyXG4gKiA8ZGl2IG5nLWlmPVwiYm9vbFwiIGNsYXNzPVwiZmFkZVwiPlxyXG4gKiAgICBGYWRlIG1lIGluIG91dFxyXG4gKiA8L2Rpdj5cclxuICogPGJ1dHRvbiBuZy1jbGljaz1cImJvb2w9dHJ1ZVwiPkZhZGUgSW4hPC9idXR0b24+XHJcbiAqIDxidXR0b24gbmctY2xpY2s9XCJib29sPWZhbHNlXCI+RmFkZSBPdXQhPC9idXR0b24+XHJcbiAqIGBgYFxyXG4gKlxyXG4gKiBOb3RpY2UgdGhlIENTUyBjbGFzcyAqKmZhZGUqKj8gV2UgY2FuIG5vdyBjcmVhdGUgdGhlIENTUyB0cmFuc2l0aW9uIGNvZGUgdGhhdCByZWZlcmVuY2VzIHRoaXMgY2xhc3M6XHJcbiAqXHJcbiAqIGBgYGNzc1xyXG4gKiAvJiM0MjsgVGhlIHN0YXJ0aW5nIENTUyBzdHlsZXMgZm9yIHRoZSBlbnRlciBhbmltYXRpb24gJiM0MjsvXHJcbiAqIC5mYWRlLm5nLWVudGVyIHtcclxuICogICB0cmFuc2l0aW9uOjAuNXMgbGluZWFyIGFsbDtcclxuICogICBvcGFjaXR5OjA7XHJcbiAqIH1cclxuICpcclxuICogLyYjNDI7IFRoZSBmaW5pc2hpbmcgQ1NTIHN0eWxlcyBmb3IgdGhlIGVudGVyIGFuaW1hdGlvbiAmIzQyOy9cclxuICogLmZhZGUubmctZW50ZXIubmctZW50ZXItYWN0aXZlIHtcclxuICogICBvcGFjaXR5OjE7XHJcbiAqIH1cclxuICogYGBgXHJcbiAqXHJcbiAqIFRoZSBrZXkgdGhpbmcgdG8gcmVtZW1iZXIgaGVyZSBpcyB0aGF0LCBkZXBlbmRpbmcgb24gdGhlIGFuaW1hdGlvbiBldmVudCAod2hpY2ggZWFjaCBvZiB0aGUgZGlyZWN0aXZlcyBhYm92ZSB0cmlnZ2VyIGRlcGVuZGluZyBvbiB3aGF0J3MgZ29pbmcgb24pIHR3b1xyXG4gKiBnZW5lcmF0ZWQgQ1NTIGNsYXNzZXMgd2lsbCBiZSBhcHBsaWVkIHRvIHRoZSBlbGVtZW50OyBpbiB0aGUgZXhhbXBsZSBhYm92ZSB3ZSBoYXZlIGAubmctZW50ZXJgIGFuZCBgLm5nLWVudGVyLWFjdGl2ZWAuIEZvciBDU1MgdHJhbnNpdGlvbnMsIHRoZSB0cmFuc2l0aW9uXHJcbiAqIGNvZGUgKiptdXN0KiogYmUgZGVmaW5lZCB3aXRoaW4gdGhlIHN0YXJ0aW5nIENTUyBjbGFzcyAoaW4gdGhpcyBjYXNlIGAubmctZW50ZXJgKS4gVGhlIGRlc3RpbmF0aW9uIGNsYXNzIGlzIHdoYXQgdGhlIHRyYW5zaXRpb24gd2lsbCBhbmltYXRlIHRvd2FyZHMuXHJcbiAqXHJcbiAqIElmIGZvciBleGFtcGxlIHdlIHdhbnRlZCB0byBjcmVhdGUgYW5pbWF0aW9ucyBmb3IgYGxlYXZlYCBhbmQgYG1vdmVgIChuZ1JlcGVhdCB0cmlnZ2VycyBtb3ZlKSB0aGVuIHdlIGNhbiBkbyBzbyB1c2luZyB0aGUgc2FtZSBDU1MgbmFtaW5nIGNvbnZlbnRpb25zOlxyXG4gKlxyXG4gKiBgYGBjc3NcclxuICogLyYjNDI7IG5vdyB0aGUgZWxlbWVudCB3aWxsIGZhZGUgb3V0IGJlZm9yZSBpdCBpcyByZW1vdmVkIGZyb20gdGhlIERPTSAmIzQyOy9cclxuICogLmZhZGUubmctbGVhdmUge1xyXG4gKiAgIHRyYW5zaXRpb246MC41cyBsaW5lYXIgYWxsO1xyXG4gKiAgIG9wYWNpdHk6MTtcclxuICogfVxyXG4gKiAuZmFkZS5uZy1sZWF2ZS5uZy1sZWF2ZS1hY3RpdmUge1xyXG4gKiAgIG9wYWNpdHk6MDtcclxuICogfVxyXG4gKiBgYGBcclxuICpcclxuICogV2UgY2FuIGFsc28gbWFrZSB1c2Ugb2YgKipDU1MgS2V5ZnJhbWVzKiogYnkgcmVmZXJlbmNpbmcgdGhlIGtleWZyYW1lIGFuaW1hdGlvbiB3aXRoaW4gdGhlIHN0YXJ0aW5nIENTUyBjbGFzczpcclxuICpcclxuICogYGBgY3NzXHJcbiAqIC8mIzQyOyB0aGVyZSBpcyBubyBuZWVkIHRvIGRlZmluZSBhbnl0aGluZyBpbnNpZGUgb2YgdGhlIGRlc3RpbmF0aW9uXHJcbiAqIENTUyBjbGFzcyBzaW5jZSB0aGUga2V5ZnJhbWUgd2lsbCB0YWtlIGNoYXJnZSBvZiB0aGUgYW5pbWF0aW9uICYjNDI7L1xyXG4gKiAuZmFkZS5uZy1sZWF2ZSB7XHJcbiAqICAgYW5pbWF0aW9uOiBteV9mYWRlX2FuaW1hdGlvbiAwLjVzIGxpbmVhcjtcclxuICogICAtd2Via2l0LWFuaW1hdGlvbjogbXlfZmFkZV9hbmltYXRpb24gMC41cyBsaW5lYXI7XHJcbiAqIH1cclxuICpcclxuICogQGtleWZyYW1lcyBteV9mYWRlX2FuaW1hdGlvbiB7XHJcbiAqICAgZnJvbSB7IG9wYWNpdHk6MTsgfVxyXG4gKiAgIHRvIHsgb3BhY2l0eTowOyB9XHJcbiAqIH1cclxuICpcclxuICogQC13ZWJraXQta2V5ZnJhbWVzIG15X2ZhZGVfYW5pbWF0aW9uIHtcclxuICogICBmcm9tIHsgb3BhY2l0eToxOyB9XHJcbiAqICAgdG8geyBvcGFjaXR5OjA7IH1cclxuICogfVxyXG4gKiBgYGBcclxuICpcclxuICogRmVlbCBmcmVlIGFsc28gbWl4IHRyYW5zaXRpb25zIGFuZCBrZXlmcmFtZXMgdG9nZXRoZXIgYXMgd2VsbCBhcyBhbnkgb3RoZXIgQ1NTIGNsYXNzZXMgb24gdGhlIHNhbWUgZWxlbWVudC5cclxuICpcclxuICogIyMjIENTUyBDbGFzcy1iYXNlZCBBbmltYXRpb25zXHJcbiAqXHJcbiAqIENsYXNzLWJhc2VkIGFuaW1hdGlvbnMgKGFuaW1hdGlvbnMgdGhhdCBhcmUgdHJpZ2dlcmVkIHZpYSBgbmdDbGFzc2AsIGBuZ1Nob3dgLCBgbmdIaWRlYCBhbmQgc29tZSBvdGhlciBkaXJlY3RpdmVzKSBoYXZlIGEgc2xpZ2h0bHkgZGlmZmVyZW50XHJcbiAqIG5hbWluZyBjb252ZW50aW9uLiBDbGFzcy1iYXNlZCBhbmltYXRpb25zIGFyZSBiYXNpYyBlbm91Z2ggdGhhdCBhIHN0YW5kYXJkIHRyYW5zaXRpb24gb3Iga2V5ZnJhbWUgY2FuIGJlIHJlZmVyZW5jZWQgb24gdGhlIGNsYXNzIGJlaW5nIGFkZGVkXHJcbiAqIGFuZCByZW1vdmVkLlxyXG4gKlxyXG4gKiBGb3IgZXhhbXBsZSBpZiB3ZSB3YW50ZWQgdG8gZG8gYSBDU1MgYW5pbWF0aW9uIGZvciBgbmdIaWRlYCB0aGVuIHdlIHBsYWNlIGFuIGFuaW1hdGlvbiBvbiB0aGUgYC5uZy1oaWRlYCBDU1MgY2xhc3M6XHJcbiAqXHJcbiAqIGBgYGh0bWxcclxuICogPGRpdiBuZy1zaG93PVwiYm9vbFwiIGNsYXNzPVwiZmFkZVwiPlxyXG4gKiAgIFNob3cgYW5kIGhpZGUgbWVcclxuICogPC9kaXY+XHJcbiAqIDxidXR0b24gbmctY2xpY2s9XCJib29sPSFib29sXCI+VG9nZ2xlPC9idXR0b24+XHJcbiAqXHJcbiAqIDxzdHlsZT5cclxuICogLmZhZGUubmctaGlkZSB7XHJcbiAqICAgdHJhbnNpdGlvbjowLjVzIGxpbmVhciBhbGw7XHJcbiAqICAgb3BhY2l0eTowO1xyXG4gKiB9XHJcbiAqIDwvc3R5bGU+XHJcbiAqIGBgYFxyXG4gKlxyXG4gKiBBbGwgdGhhdCBpcyBnb2luZyBvbiBoZXJlIHdpdGggbmdTaG93L25nSGlkZSBiZWhpbmQgdGhlIHNjZW5lcyBpcyB0aGUgYC5uZy1oaWRlYCBjbGFzcyBpcyBhZGRlZC9yZW1vdmVkICh3aGVuIHRoZSBoaWRkZW4gc3RhdGUgaXMgdmFsaWQpLiBTaW5jZVxyXG4gKiBuZ1Nob3cgYW5kIG5nSGlkZSBhcmUgYW5pbWF0aW9uIGF3YXJlIHRoZW4gd2UgY2FuIG1hdGNoIHVwIGEgdHJhbnNpdGlvbiBhbmQgbmdBbmltYXRlIGhhbmRsZXMgdGhlIHJlc3QuXHJcbiAqXHJcbiAqIEluIGFkZGl0aW9uIHRoZSBhZGRpdGlvbiBhbmQgcmVtb3ZhbCBvZiB0aGUgQ1NTIGNsYXNzLCBuZ0FuaW1hdGUgYWxzbyBwcm92aWRlcyB0d28gaGVscGVyIG1ldGhvZHMgdGhhdCB3ZSBjYW4gdXNlIHRvIGZ1cnRoZXIgZGVjb3JhdGUgdGhlIGFuaW1hdGlvblxyXG4gKiB3aXRoIENTUyBzdHlsZXMuXHJcbiAqXHJcbiAqIGBgYGh0bWxcclxuICogPGRpdiBuZy1jbGFzcz1cIntvbjpvbk9mZn1cIiBjbGFzcz1cImhpZ2hsaWdodFwiPlxyXG4gKiAgIEhpZ2hsaWdodCB0aGlzIGJveFxyXG4gKiA8L2Rpdj5cclxuICogPGJ1dHRvbiBuZy1jbGljaz1cIm9uT2ZmPSFvbk9mZlwiPlRvZ2dsZTwvYnV0dG9uPlxyXG4gKlxyXG4gKiA8c3R5bGU+XHJcbiAqIC5oaWdobGlnaHQge1xyXG4gKiAgIHRyYW5zaXRpb246MC41cyBsaW5lYXIgYWxsO1xyXG4gKiB9XHJcbiAqIC5oaWdobGlnaHQub24tYWRkIHtcclxuICogICBiYWNrZ3JvdW5kOndoaXRlO1xyXG4gKiB9XHJcbiAqIC5oaWdobGlnaHQub24ge1xyXG4gKiAgIGJhY2tncm91bmQ6eWVsbG93O1xyXG4gKiB9XHJcbiAqIC5oaWdobGlnaHQub24tcmVtb3ZlIHtcclxuICogICBiYWNrZ3JvdW5kOmJsYWNrO1xyXG4gKiB9XHJcbiAqIDwvc3R5bGU+XHJcbiAqIGBgYFxyXG4gKlxyXG4gKiBXZSBjYW4gYWxzbyBtYWtlIHVzZSBvZiBDU1Mga2V5ZnJhbWVzIGJ5IHBsYWNpbmcgdGhlbSB3aXRoaW4gdGhlIENTUyBjbGFzc2VzLlxyXG4gKlxyXG4gKlxyXG4gKiAjIyMgQ1NTIFN0YWdnZXJpbmcgQW5pbWF0aW9uc1xyXG4gKiBBIFN0YWdnZXJpbmcgYW5pbWF0aW9uIGlzIGEgY29sbGVjdGlvbiBvZiBhbmltYXRpb25zIHRoYXQgYXJlIGlzc3VlZCB3aXRoIGEgc2xpZ2h0IGRlbGF5IGluIGJldHdlZW4gZWFjaCBzdWNjZXNzaXZlIG9wZXJhdGlvbiByZXN1bHRpbmcgaW4gYVxyXG4gKiBjdXJ0YWluLWxpa2UgZWZmZWN0LiBUaGUgbmdBbmltYXRlIG1vZHVsZSAodmVyc2lvbnMgPj0xLjIpIHN1cHBvcnRzIHN0YWdnZXJpbmcgYW5pbWF0aW9ucyBhbmQgdGhlIHN0YWdnZXIgZWZmZWN0IGNhbiBiZVxyXG4gKiBwZXJmb3JtZWQgYnkgY3JlYXRpbmcgYSAqKm5nLUVWRU5ULXN0YWdnZXIqKiBDU1MgY2xhc3MgYW5kIGF0dGFjaGluZyB0aGF0IGNsYXNzIHRvIHRoZSBiYXNlIENTUyBjbGFzcyB1c2VkIGZvclxyXG4gKiB0aGUgYW5pbWF0aW9uLiBUaGUgc3R5bGUgcHJvcGVydHkgZXhwZWN0ZWQgd2l0aGluIHRoZSBzdGFnZ2VyIGNsYXNzIGNhbiBlaXRoZXIgYmUgYSAqKnRyYW5zaXRpb24tZGVsYXkqKiBvciBhblxyXG4gKiAqKmFuaW1hdGlvbi1kZWxheSoqIHByb3BlcnR5IChvciBib3RoIGlmIHlvdXIgYW5pbWF0aW9uIGNvbnRhaW5zIGJvdGggdHJhbnNpdGlvbnMgYW5kIGtleWZyYW1lIGFuaW1hdGlvbnMpLlxyXG4gKlxyXG4gKiBgYGBjc3NcclxuICogLm15LWFuaW1hdGlvbi5uZy1lbnRlciB7XHJcbiAqICAgLyYjNDI7IHN0YW5kYXJkIHRyYW5zaXRpb24gY29kZSAmIzQyOy9cclxuICogICB0cmFuc2l0aW9uOiAxcyBsaW5lYXIgYWxsO1xyXG4gKiAgIG9wYWNpdHk6MDtcclxuICogfVxyXG4gKiAubXktYW5pbWF0aW9uLm5nLWVudGVyLXN0YWdnZXIge1xyXG4gKiAgIC8mIzQyOyB0aGlzIHdpbGwgaGF2ZSBhIDEwMG1zIGRlbGF5IGJldHdlZW4gZWFjaCBzdWNjZXNzaXZlIGxlYXZlIGFuaW1hdGlvbiAmIzQyOy9cclxuICogICB0cmFuc2l0aW9uLWRlbGF5OiAwLjFzO1xyXG4gKlxyXG4gKiAgIC8mIzQyOyBBcyBvZiAxLjQuNCwgdGhpcyBtdXN0IGFsd2F5cyBiZSBzZXQ6IGl0IHNpZ25hbHMgbmdBbmltYXRlXHJcbiAqICAgICB0byBub3QgYWNjaWRlbnRhbGx5IGluaGVyaXQgYSBkZWxheSBwcm9wZXJ0eSBmcm9tIGFub3RoZXIgQ1NTIGNsYXNzICYjNDI7L1xyXG4gKiAgIHRyYW5zaXRpb24tZHVyYXRpb246IDBzO1xyXG4gKiB9XHJcbiAqIC5teS1hbmltYXRpb24ubmctZW50ZXIubmctZW50ZXItYWN0aXZlIHtcclxuICogICAvJiM0Mjsgc3RhbmRhcmQgdHJhbnNpdGlvbiBzdHlsZXMgJiM0MjsvXHJcbiAqICAgb3BhY2l0eToxO1xyXG4gKiB9XHJcbiAqIGBgYFxyXG4gKlxyXG4gKiBTdGFnZ2VyaW5nIGFuaW1hdGlvbnMgd29yayBieSBkZWZhdWx0IGluIG5nUmVwZWF0IChzbyBsb25nIGFzIHRoZSBDU1MgY2xhc3MgaXMgZGVmaW5lZCkuIE91dHNpZGUgb2YgbmdSZXBlYXQsIHRvIHVzZSBzdGFnZ2VyaW5nIGFuaW1hdGlvbnNcclxuICogb24geW91ciBvd24sIHRoZXkgY2FuIGJlIHRyaWdnZXJlZCBieSBmaXJpbmcgbXVsdGlwbGUgY2FsbHMgdG8gdGhlIHNhbWUgZXZlbnQgb24gJGFuaW1hdGUuIEhvd2V2ZXIsIHRoZSByZXN0cmljdGlvbnMgc3Vycm91bmRpbmcgdGhpc1xyXG4gKiBhcmUgdGhhdCBlYWNoIG9mIHRoZSBlbGVtZW50cyBtdXN0IGhhdmUgdGhlIHNhbWUgQ1NTIGNsYXNzTmFtZSB2YWx1ZSBhcyB3ZWxsIGFzIHRoZSBzYW1lIHBhcmVudCBlbGVtZW50LiBBIHN0YWdnZXIgb3BlcmF0aW9uXHJcbiAqIHdpbGwgYWxzbyBiZSByZXNldCBpZiBvbmUgb3IgbW9yZSBhbmltYXRpb24gZnJhbWVzIGhhdmUgcGFzc2VkIHNpbmNlIHRoZSBtdWx0aXBsZSBjYWxscyB0byBgJGFuaW1hdGVgIHdlcmUgZmlyZWQuXHJcbiAqXHJcbiAqIFRoZSBmb2xsb3dpbmcgY29kZSB3aWxsIGlzc3VlIHRoZSAqKm5nLWxlYXZlLXN0YWdnZXIqKiBldmVudCBvbiB0aGUgZWxlbWVudCBwcm92aWRlZDpcclxuICpcclxuICogYGBganNcclxuICogdmFyIGtpZHMgPSBwYXJlbnQuY2hpbGRyZW4oKTtcclxuICpcclxuICogJGFuaW1hdGUubGVhdmUoa2lkc1swXSk7IC8vc3RhZ2dlciBpbmRleD0wXHJcbiAqICRhbmltYXRlLmxlYXZlKGtpZHNbMV0pOyAvL3N0YWdnZXIgaW5kZXg9MVxyXG4gKiAkYW5pbWF0ZS5sZWF2ZShraWRzWzJdKTsgLy9zdGFnZ2VyIGluZGV4PTJcclxuICogJGFuaW1hdGUubGVhdmUoa2lkc1szXSk7IC8vc3RhZ2dlciBpbmRleD0zXHJcbiAqICRhbmltYXRlLmxlYXZlKGtpZHNbNF0pOyAvL3N0YWdnZXIgaW5kZXg9NFxyXG4gKlxyXG4gKiB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZ1bmN0aW9uKCkge1xyXG4gKiAgIC8vc3RhZ2dlciBoYXMgcmVzZXQgaXRzZWxmXHJcbiAqICAgJGFuaW1hdGUubGVhdmUoa2lkc1s1XSk7IC8vc3RhZ2dlciBpbmRleD0wXHJcbiAqICAgJGFuaW1hdGUubGVhdmUoa2lkc1s2XSk7IC8vc3RhZ2dlciBpbmRleD0xXHJcbiAqXHJcbiAqICAgJHNjb3BlLiRkaWdlc3QoKTtcclxuICogfSk7XHJcbiAqIGBgYFxyXG4gKlxyXG4gKiBTdGFnZ2VyIGFuaW1hdGlvbnMgYXJlIGN1cnJlbnRseSBvbmx5IHN1cHBvcnRlZCB3aXRoaW4gQ1NTLWRlZmluZWQgYW5pbWF0aW9ucy5cclxuICpcclxuICogIyMjIFRoZSBgbmctYW5pbWF0ZWAgQ1NTIGNsYXNzXHJcbiAqXHJcbiAqIFdoZW4gbmdBbmltYXRlIGlzIGFuaW1hdGluZyBhbiBlbGVtZW50IGl0IHdpbGwgYXBwbHkgdGhlIGBuZy1hbmltYXRlYCBDU1MgY2xhc3MgdG8gdGhlIGVsZW1lbnQgZm9yIHRoZSBkdXJhdGlvbiBvZiB0aGUgYW5pbWF0aW9uLlxyXG4gKiBUaGlzIGlzIGEgdGVtcG9yYXJ5IENTUyBjbGFzcyBhbmQgaXQgd2lsbCBiZSByZW1vdmVkIG9uY2UgdGhlIGFuaW1hdGlvbiBpcyBvdmVyIChmb3IgYm90aCBKYXZhU2NyaXB0IGFuZCBDU1MtYmFzZWQgYW5pbWF0aW9ucykuXHJcbiAqXHJcbiAqIFRoZXJlZm9yZSwgYW5pbWF0aW9ucyBjYW4gYmUgYXBwbGllZCB0byBhbiBlbGVtZW50IHVzaW5nIHRoaXMgdGVtcG9yYXJ5IGNsYXNzIGRpcmVjdGx5IHZpYSBDU1MuXHJcbiAqXHJcbiAqIGBgYGNzc1xyXG4gKiAuemlwcGVyLm5nLWFuaW1hdGUge1xyXG4gKiAgIHRyYW5zaXRpb246MC41cyBsaW5lYXIgYWxsO1xyXG4gKiB9XHJcbiAqIC56aXBwZXIubmctZW50ZXIge1xyXG4gKiAgIG9wYWNpdHk6MDtcclxuICogfVxyXG4gKiAuemlwcGVyLm5nLWVudGVyLm5nLWVudGVyLWFjdGl2ZSB7XHJcbiAqICAgb3BhY2l0eToxO1xyXG4gKiB9XHJcbiAqIC56aXBwZXIubmctbGVhdmUge1xyXG4gKiAgIG9wYWNpdHk6MTtcclxuICogfVxyXG4gKiAuemlwcGVyLm5nLWxlYXZlLm5nLWxlYXZlLWFjdGl2ZSB7XHJcbiAqICAgb3BhY2l0eTowO1xyXG4gKiB9XHJcbiAqIGBgYFxyXG4gKlxyXG4gKiAoTm90ZSB0aGF0IHRoZSBgbmctYW5pbWF0ZWAgQ1NTIGNsYXNzIGlzIHJlc2VydmVkIGFuZCBpdCBjYW5ub3QgYmUgYXBwbGllZCBvbiBhbiBlbGVtZW50IGRpcmVjdGx5IHNpbmNlIG5nQW5pbWF0ZSB3aWxsIGFsd2F5cyByZW1vdmVcclxuICogdGhlIENTUyBjbGFzcyBvbmNlIGFuIGFuaW1hdGlvbiBoYXMgY29tcGxldGVkLilcclxuICpcclxuICpcclxuICogIyMjIFRoZSBgbmctW2V2ZW50XS1wcmVwYXJlYCBjbGFzc1xyXG4gKlxyXG4gKiBUaGlzIGlzIGEgc3BlY2lhbCBjbGFzcyB0aGF0IGNhbiBiZSB1c2VkIHRvIHByZXZlbnQgdW53YW50ZWQgZmxpY2tlcmluZyAvIGZsYXNoIG9mIGNvbnRlbnQgYmVmb3JlXHJcbiAqIHRoZSBhY3R1YWwgYW5pbWF0aW9uIHN0YXJ0cy4gVGhlIGNsYXNzIGlzIGFkZGVkIGFzIHNvb24gYXMgYW4gYW5pbWF0aW9uIGlzIGluaXRpYWxpemVkLCBidXQgcmVtb3ZlZFxyXG4gKiBiZWZvcmUgdGhlIGFjdHVhbCBhbmltYXRpb24gc3RhcnRzIChhZnRlciB3YWl0aW5nIGZvciBhICRkaWdlc3QpLlxyXG4gKiBJdCBpcyBhbHNvIG9ubHkgYWRkZWQgZm9yICpzdHJ1Y3R1cmFsKiBhbmltYXRpb25zIChgZW50ZXJgLCBgbW92ZWAsIGFuZCBgbGVhdmVgKS5cclxuICpcclxuICogSW4gcHJhY3RpY2UsIGZsaWNrZXJpbmcgY2FuIGFwcGVhciB3aGVuIG5lc3RpbmcgZWxlbWVudHMgd2l0aCBzdHJ1Y3R1cmFsIGFuaW1hdGlvbnMgc3VjaCBhcyBgbmdJZmBcclxuICogaW50byBlbGVtZW50cyB0aGF0IGhhdmUgY2xhc3MtYmFzZWQgYW5pbWF0aW9ucyBzdWNoIGFzIGBuZ0NsYXNzYC5cclxuICpcclxuICogYGBgaHRtbFxyXG4gKiA8ZGl2IG5nLWNsYXNzPVwie3JlZDogbXlQcm9wfVwiPlxyXG4gKiAgIDxkaXYgbmctY2xhc3M9XCJ7Ymx1ZTogbXlQcm9wfVwiPlxyXG4gKiAgICAgPGRpdiBjbGFzcz1cIm1lc3NhZ2VcIiBuZy1pZj1cIm15UHJvcFwiPjwvZGl2PlxyXG4gKiAgIDwvZGl2PlxyXG4gKiA8L2Rpdj5cclxuICogYGBgXHJcbiAqXHJcbiAqIEl0IGlzIHBvc3NpYmxlIHRoYXQgZHVyaW5nIHRoZSBgZW50ZXJgIGFuaW1hdGlvbiwgdGhlIGAubWVzc2FnZWAgZGl2IHdpbGwgYmUgYnJpZWZseSB2aXNpYmxlIGJlZm9yZSBpdCBzdGFydHMgYW5pbWF0aW5nLlxyXG4gKiBJbiB0aGF0IGNhc2UsIHlvdSBjYW4gYWRkIHN0eWxlcyB0byB0aGUgQ1NTIHRoYXQgbWFrZSBzdXJlIHRoZSBlbGVtZW50IHN0YXlzIGhpZGRlbiBiZWZvcmUgdGhlIGFuaW1hdGlvbiBzdGFydHM6XHJcbiAqXHJcbiAqIGBgYGNzc1xyXG4gKiAubWVzc2FnZS5uZy1lbnRlci1wcmVwYXJlIHtcclxuICogICBvcGFjaXR5OiAwO1xyXG4gKiB9XHJcbiAqXHJcbiAqIGBgYFxyXG4gKlxyXG4gKiAjIyBKYXZhU2NyaXB0LWJhc2VkIEFuaW1hdGlvbnNcclxuICpcclxuICogbmdBbmltYXRlIGFsc28gYWxsb3dzIGZvciBhbmltYXRpb25zIHRvIGJlIGNvbnN1bWVkIGJ5IEphdmFTY3JpcHQgY29kZS4gVGhlIGFwcHJvYWNoIGlzIHNpbWlsYXIgdG8gQ1NTLWJhc2VkIGFuaW1hdGlvbnMgKHdoZXJlIHRoZXJlIGlzIGEgc2hhcmVkXHJcbiAqIENTUyBjbGFzcyB0aGF0IGlzIHJlZmVyZW5jZWQgaW4gb3VyIEhUTUwgY29kZSkgYnV0IGluIGFkZGl0aW9uIHdlIG5lZWQgdG8gcmVnaXN0ZXIgdGhlIEphdmFTY3JpcHQgYW5pbWF0aW9uIG9uIHRoZSBtb2R1bGUuIEJ5IG1ha2luZyB1c2Ugb2YgdGhlXHJcbiAqIGBtb2R1bGUuYW5pbWF0aW9uKClgIG1vZHVsZSBmdW5jdGlvbiB3ZSBjYW4gcmVnaXN0ZXIgdGhlIGFuaW1hdGlvbi5cclxuICpcclxuICogTGV0J3Mgc2VlIGFuIGV4YW1wbGUgb2YgYSBlbnRlci9sZWF2ZSBhbmltYXRpb24gdXNpbmcgYG5nUmVwZWF0YDpcclxuICpcclxuICogYGBgaHRtbFxyXG4gKiA8ZGl2IG5nLXJlcGVhdD1cIml0ZW0gaW4gaXRlbXNcIiBjbGFzcz1cInNsaWRlXCI+XHJcbiAqICAge3sgaXRlbSB9fVxyXG4gKiA8L2Rpdj5cclxuICogYGBgXHJcbiAqXHJcbiAqIFNlZSB0aGUgKipzbGlkZSoqIENTUyBjbGFzcz8gTGV0J3MgdXNlIHRoYXQgY2xhc3MgdG8gZGVmaW5lIGFuIGFuaW1hdGlvbiB0aGF0IHdlJ2xsIHN0cnVjdHVyZSBpbiBvdXIgbW9kdWxlIGNvZGUgYnkgdXNpbmcgYG1vZHVsZS5hbmltYXRpb25gOlxyXG4gKlxyXG4gKiBgYGBqc1xyXG4gKiBteU1vZHVsZS5hbmltYXRpb24oJy5zbGlkZScsIFtmdW5jdGlvbigpIHtcclxuICogICByZXR1cm4ge1xyXG4gKiAgICAgLy8gbWFrZSBub3RlIHRoYXQgb3RoZXIgZXZlbnRzIChsaWtlIGFkZENsYXNzL3JlbW92ZUNsYXNzKVxyXG4gKiAgICAgLy8gaGF2ZSBkaWZmZXJlbnQgZnVuY3Rpb24gaW5wdXQgcGFyYW1ldGVyc1xyXG4gKiAgICAgZW50ZXI6IGZ1bmN0aW9uKGVsZW1lbnQsIGRvbmVGbikge1xyXG4gKiAgICAgICBqUXVlcnkoZWxlbWVudCkuZmFkZUluKDEwMDAsIGRvbmVGbik7XHJcbiAqXHJcbiAqICAgICAgIC8vIHJlbWVtYmVyIHRvIGNhbGwgZG9uZUZuIHNvIHRoYXQgYW5ndWxhclxyXG4gKiAgICAgICAvLyBrbm93cyB0aGF0IHRoZSBhbmltYXRpb24gaGFzIGNvbmNsdWRlZFxyXG4gKiAgICAgfSxcclxuICpcclxuICogICAgIG1vdmU6IGZ1bmN0aW9uKGVsZW1lbnQsIGRvbmVGbikge1xyXG4gKiAgICAgICBqUXVlcnkoZWxlbWVudCkuZmFkZUluKDEwMDAsIGRvbmVGbik7XHJcbiAqICAgICB9LFxyXG4gKlxyXG4gKiAgICAgbGVhdmU6IGZ1bmN0aW9uKGVsZW1lbnQsIGRvbmVGbikge1xyXG4gKiAgICAgICBqUXVlcnkoZWxlbWVudCkuZmFkZU91dCgxMDAwLCBkb25lRm4pO1xyXG4gKiAgICAgfVxyXG4gKiAgIH1cclxuICogfV0pO1xyXG4gKiBgYGBcclxuICpcclxuICogVGhlIG5pY2UgdGhpbmcgYWJvdXQgSlMtYmFzZWQgYW5pbWF0aW9ucyBpcyB0aGF0IHdlIGNhbiBpbmplY3Qgb3RoZXIgc2VydmljZXMgYW5kIG1ha2UgdXNlIG9mIGFkdmFuY2VkIGFuaW1hdGlvbiBsaWJyYXJpZXMgc3VjaCBhc1xyXG4gKiBncmVlbnNvY2suanMgYW5kIHZlbG9jaXR5LmpzLlxyXG4gKlxyXG4gKiBJZiBvdXIgYW5pbWF0aW9uIGNvZGUgY2xhc3MtYmFzZWQgKG1lYW5pbmcgdGhhdCBzb21ldGhpbmcgbGlrZSBgbmdDbGFzc2AsIGBuZ0hpZGVgIGFuZCBgbmdTaG93YCB0cmlnZ2VycyBpdCkgdGhlbiB3ZSBjYW4gc3RpbGwgZGVmaW5lXHJcbiAqIG91ciBhbmltYXRpb25zIGluc2lkZSBvZiB0aGUgc2FtZSByZWdpc3RlcmVkIGFuaW1hdGlvbiwgaG93ZXZlciwgdGhlIGZ1bmN0aW9uIGlucHV0IGFyZ3VtZW50cyBhcmUgYSBiaXQgZGlmZmVyZW50OlxyXG4gKlxyXG4gKiBgYGBodG1sXHJcbiAqIDxkaXYgbmctY2xhc3M9XCJjb2xvclwiIGNsYXNzPVwiY29sb3JmdWxcIj5cclxuICogICB0aGlzIGJveCBpcyBtb29keVxyXG4gKiA8L2Rpdj5cclxuICogPGJ1dHRvbiBuZy1jbGljaz1cImNvbG9yPSdyZWQnXCI+Q2hhbmdlIHRvIHJlZDwvYnV0dG9uPlxyXG4gKiA8YnV0dG9uIG5nLWNsaWNrPVwiY29sb3I9J2JsdWUnXCI+Q2hhbmdlIHRvIGJsdWU8L2J1dHRvbj5cclxuICogPGJ1dHRvbiBuZy1jbGljaz1cImNvbG9yPSdncmVlbidcIj5DaGFuZ2UgdG8gZ3JlZW48L2J1dHRvbj5cclxuICogYGBgXHJcbiAqXHJcbiAqIGBgYGpzXHJcbiAqIG15TW9kdWxlLmFuaW1hdGlvbignLmNvbG9yZnVsJywgW2Z1bmN0aW9uKCkge1xyXG4gKiAgIHJldHVybiB7XHJcbiAqICAgICBhZGRDbGFzczogZnVuY3Rpb24oZWxlbWVudCwgY2xhc3NOYW1lLCBkb25lRm4pIHtcclxuICogICAgICAgLy8gZG8gc29tZSBjb29sIGFuaW1hdGlvbiBhbmQgY2FsbCB0aGUgZG9uZUZuXHJcbiAqICAgICB9LFxyXG4gKiAgICAgcmVtb3ZlQ2xhc3M6IGZ1bmN0aW9uKGVsZW1lbnQsIGNsYXNzTmFtZSwgZG9uZUZuKSB7XHJcbiAqICAgICAgIC8vIGRvIHNvbWUgY29vbCBhbmltYXRpb24gYW5kIGNhbGwgdGhlIGRvbmVGblxyXG4gKiAgICAgfSxcclxuICogICAgIHNldENsYXNzOiBmdW5jdGlvbihlbGVtZW50LCBhZGRlZENsYXNzLCByZW1vdmVkQ2xhc3MsIGRvbmVGbikge1xyXG4gKiAgICAgICAvLyBkbyBzb21lIGNvb2wgYW5pbWF0aW9uIGFuZCBjYWxsIHRoZSBkb25lRm5cclxuICogICAgIH1cclxuICogICB9XHJcbiAqIH1dKTtcclxuICogYGBgXHJcbiAqXHJcbiAqICMjIENTUyArIEpTIEFuaW1hdGlvbnMgVG9nZXRoZXJcclxuICpcclxuICogQW5ndWxhckpTIDEuNCBhbmQgaGlnaGVyIGhhcyB0YWtlbiBzdGVwcyB0byBtYWtlIHRoZSBhbWFsZ2FtYXRpb24gb2YgQ1NTIGFuZCBKUyBhbmltYXRpb25zIG1vcmUgZmxleGlibGUuIEhvd2V2ZXIsIHVubGlrZSBlYXJsaWVyIHZlcnNpb25zIG9mIEFuZ3VsYXIsXHJcbiAqIGRlZmluaW5nIENTUyBhbmQgSlMgYW5pbWF0aW9ucyB0byB3b3JrIG9mZiBvZiB0aGUgc2FtZSBDU1MgY2xhc3Mgd2lsbCBub3Qgd29yayBhbnltb3JlLiBUaGVyZWZvcmUgdGhlIGV4YW1wbGUgYmVsb3cgd2lsbCBvbmx5IHJlc3VsdCBpbiAqKkpTIGFuaW1hdGlvbnMgdGFraW5nXHJcbiAqIGNoYXJnZSBvZiB0aGUgYW5pbWF0aW9uKio6XHJcbiAqXHJcbiAqIGBgYGh0bWxcclxuICogPGRpdiBuZy1pZj1cImJvb2xcIiBjbGFzcz1cInNsaWRlXCI+XHJcbiAqICAgU2xpZGUgaW4gYW5kIG91dFxyXG4gKiA8L2Rpdj5cclxuICogYGBgXHJcbiAqXHJcbiAqIGBgYGpzXHJcbiAqIG15TW9kdWxlLmFuaW1hdGlvbignLnNsaWRlJywgW2Z1bmN0aW9uKCkge1xyXG4gKiAgIHJldHVybiB7XHJcbiAqICAgICBlbnRlcjogZnVuY3Rpb24oZWxlbWVudCwgZG9uZUZuKSB7XHJcbiAqICAgICAgIGpRdWVyeShlbGVtZW50KS5zbGlkZUluKDEwMDAsIGRvbmVGbik7XHJcbiAqICAgICB9XHJcbiAqICAgfVxyXG4gKiB9XSk7XHJcbiAqIGBgYFxyXG4gKlxyXG4gKiBgYGBjc3NcclxuICogLnNsaWRlLm5nLWVudGVyIHtcclxuICogICB0cmFuc2l0aW9uOjAuNXMgbGluZWFyIGFsbDtcclxuICogICB0cmFuc2Zvcm06dHJhbnNsYXRlWSgtMTAwcHgpO1xyXG4gKiB9XHJcbiAqIC5zbGlkZS5uZy1lbnRlci5uZy1lbnRlci1hY3RpdmUge1xyXG4gKiAgIHRyYW5zZm9ybTp0cmFuc2xhdGVZKDApO1xyXG4gKiB9XHJcbiAqIGBgYFxyXG4gKlxyXG4gKiBEb2VzIHRoaXMgbWVhbiB0aGF0IENTUyBhbmQgSlMgYW5pbWF0aW9ucyBjYW5ub3QgYmUgdXNlZCB0b2dldGhlcj8gRG8gSlMtYmFzZWQgYW5pbWF0aW9ucyBhbHdheXMgaGF2ZSBoaWdoZXIgcHJpb3JpdHk/IFdlIGNhbiBtYWtlIHVwIGZvciB0aGVcclxuICogbGFjayBvZiBDU1MgYW5pbWF0aW9ucyBieSB1c2luZyB0aGUgYCRhbmltYXRlQ3NzYCBzZXJ2aWNlIHRvIHRyaWdnZXIgb3VyIG93biB0d2Vha2VkLW91dCwgQ1NTLWJhc2VkIGFuaW1hdGlvbnMgZGlyZWN0bHkgZnJvbVxyXG4gKiBvdXIgb3duIEpTLWJhc2VkIGFuaW1hdGlvbiBjb2RlOlxyXG4gKlxyXG4gKiBgYGBqc1xyXG4gKiBteU1vZHVsZS5hbmltYXRpb24oJy5zbGlkZScsIFsnJGFuaW1hdGVDc3MnLCBmdW5jdGlvbigkYW5pbWF0ZUNzcykge1xyXG4gKiAgIHJldHVybiB7XHJcbiAqICAgICBlbnRlcjogZnVuY3Rpb24oZWxlbWVudCkge1xyXG4qICAgICAgICAvLyB0aGlzIHdpbGwgdHJpZ2dlciBgLnNsaWRlLm5nLWVudGVyYCBhbmQgYC5zbGlkZS5uZy1lbnRlci1hY3RpdmVgLlxyXG4gKiAgICAgICByZXR1cm4gJGFuaW1hdGVDc3MoZWxlbWVudCwge1xyXG4gKiAgICAgICAgIGV2ZW50OiAnZW50ZXInLFxyXG4gKiAgICAgICAgIHN0cnVjdHVyYWw6IHRydWVcclxuICogICAgICAgfSk7XHJcbiAqICAgICB9XHJcbiAqICAgfVxyXG4gKiB9XSk7XHJcbiAqIGBgYFxyXG4gKlxyXG4gKiBUaGUgbmljZSB0aGluZyBoZXJlIGlzIHRoYXQgd2UgY2FuIHNhdmUgYmFuZHdpZHRoIGJ5IHN0aWNraW5nIHRvIG91ciBDU1MtYmFzZWQgYW5pbWF0aW9uIGNvZGUgYW5kIHdlIGRvbid0IG5lZWQgdG8gcmVseSBvbiBhIDNyZC1wYXJ0eSBhbmltYXRpb24gZnJhbWV3b3JrLlxyXG4gKlxyXG4gKiBUaGUgYCRhbmltYXRlQ3NzYCBzZXJ2aWNlIGlzIHZlcnkgcG93ZXJmdWwgc2luY2Ugd2UgY2FuIGZlZWQgaW4gYWxsIGtpbmRzIG9mIGV4dHJhIHByb3BlcnRpZXMgdGhhdCB3aWxsIGJlIGV2YWx1YXRlZCBhbmQgZmVkIGludG8gYSBDU1MgdHJhbnNpdGlvbiBvclxyXG4gKiBrZXlmcmFtZSBhbmltYXRpb24uIEZvciBleGFtcGxlIGlmIHdlIHdhbnRlZCB0byBhbmltYXRlIHRoZSBoZWlnaHQgb2YgYW4gZWxlbWVudCB3aGlsZSBhZGRpbmcgYW5kIHJlbW92aW5nIGNsYXNzZXMgdGhlbiB3ZSBjYW4gZG8gc28gYnkgcHJvdmlkaW5nIHRoYXRcclxuICogZGF0YSBpbnRvIGAkYW5pbWF0ZUNzc2AgZGlyZWN0bHk6XHJcbiAqXHJcbiAqIGBgYGpzXHJcbiAqIG15TW9kdWxlLmFuaW1hdGlvbignLnNsaWRlJywgWyckYW5pbWF0ZUNzcycsIGZ1bmN0aW9uKCRhbmltYXRlQ3NzKSB7XHJcbiAqICAgcmV0dXJuIHtcclxuICogICAgIGVudGVyOiBmdW5jdGlvbihlbGVtZW50KSB7XHJcbiAqICAgICAgIHJldHVybiAkYW5pbWF0ZUNzcyhlbGVtZW50LCB7XHJcbiAqICAgICAgICAgZXZlbnQ6ICdlbnRlcicsXHJcbiAqICAgICAgICAgc3RydWN0dXJhbDogdHJ1ZSxcclxuICogICAgICAgICBhZGRDbGFzczogJ21hcm9vbi1zZXR0aW5nJyxcclxuICogICAgICAgICBmcm9tOiB7IGhlaWdodDowIH0sXHJcbiAqICAgICAgICAgdG86IHsgaGVpZ2h0OiAyMDAgfVxyXG4gKiAgICAgICB9KTtcclxuICogICAgIH1cclxuICogICB9XHJcbiAqIH1dKTtcclxuICogYGBgXHJcbiAqXHJcbiAqIE5vdyB3ZSBjYW4gZmlsbCBpbiB0aGUgcmVzdCB2aWEgb3VyIHRyYW5zaXRpb24gQ1NTIGNvZGU6XHJcbiAqXHJcbiAqIGBgYGNzc1xyXG4gKiAvJiM0MjsgdGhlIHRyYW5zaXRpb24gdGVsbHMgbmdBbmltYXRlIHRvIG1ha2UgdGhlIGFuaW1hdGlvbiBoYXBwZW4gJiM0MjsvXHJcbiAqIC5zbGlkZS5uZy1lbnRlciB7IHRyYW5zaXRpb246MC41cyBsaW5lYXIgYWxsOyB9XHJcbiAqXHJcbiAqIC8mIzQyOyB0aGlzIGV4dHJhIENTUyBjbGFzcyB3aWxsIGJlIGFic29yYmVkIGludG8gdGhlIHRyYW5zaXRpb25cclxuICogc2luY2UgdGhlICRhbmltYXRlQ3NzIGNvZGUgaXMgYWRkaW5nIHRoZSBjbGFzcyAmIzQyOy9cclxuICogLm1hcm9vbi1zZXR0aW5nIHsgYmFja2dyb3VuZDpyZWQ7IH1cclxuICogYGBgXHJcbiAqXHJcbiAqIEFuZCBgJGFuaW1hdGVDc3NgIHdpbGwgZmlndXJlIG91dCB0aGUgcmVzdC4gSnVzdCBtYWtlIHN1cmUgdG8gaGF2ZSB0aGUgYGRvbmUoKWAgY2FsbGJhY2sgZmlyZSB0aGUgYGRvbmVGbmAgZnVuY3Rpb24gdG8gc2lnbmFsIHdoZW4gdGhlIGFuaW1hdGlvbiBpcyBvdmVyLlxyXG4gKlxyXG4gKiBUbyBsZWFybiBtb3JlIGFib3V0IHdoYXQncyBwb3NzaWJsZSBiZSBzdXJlIHRvIHZpc2l0IHRoZSB7QGxpbmsgbmdBbmltYXRlLiRhbmltYXRlQ3NzICRhbmltYXRlQ3NzIHNlcnZpY2V9LlxyXG4gKlxyXG4gKiAjIyBBbmltYXRpb24gQW5jaG9yaW5nICh2aWEgYG5nLWFuaW1hdGUtcmVmYClcclxuICpcclxuICogbmdBbmltYXRlIGluIEFuZ3VsYXJKUyAxLjQgY29tZXMgcGFja2VkIHdpdGggdGhlIGFiaWxpdHkgdG8gY3Jvc3MtYW5pbWF0ZSBlbGVtZW50cyBiZXR3ZWVuXHJcbiAqIHN0cnVjdHVyYWwgYXJlYXMgb2YgYW4gYXBwbGljYXRpb24gKGxpa2Ugdmlld3MpIGJ5IHBhaXJpbmcgdXAgZWxlbWVudHMgdXNpbmcgYW4gYXR0cmlidXRlXHJcbiAqIGNhbGxlZCBgbmctYW5pbWF0ZS1yZWZgLlxyXG4gKlxyXG4gKiBMZXQncyBzYXkgZm9yIGV4YW1wbGUgd2UgaGF2ZSB0d28gdmlld3MgdGhhdCBhcmUgbWFuYWdlZCBieSBgbmctdmlld2AgYW5kIHdlIHdhbnQgdG8gc2hvd1xyXG4gKiB0aGF0IHRoZXJlIGlzIGEgcmVsYXRpb25zaGlwIGJldHdlZW4gdHdvIGNvbXBvbmVudHMgc2l0dWF0ZWQgaW4gd2l0aGluIHRoZXNlIHZpZXdzLiBCeSB1c2luZyB0aGVcclxuICogYG5nLWFuaW1hdGUtcmVmYCBhdHRyaWJ1dGUgd2UgY2FuIGlkZW50aWZ5IHRoYXQgdGhlIHR3byBjb21wb25lbnRzIGFyZSBwYWlyZWQgdG9nZXRoZXIgYW5kIHdlXHJcbiAqIGNhbiB0aGVuIGF0dGFjaCBhbiBhbmltYXRpb24sIHdoaWNoIGlzIHRyaWdnZXJlZCB3aGVuIHRoZSB2aWV3IGNoYW5nZXMuXHJcbiAqXHJcbiAqIFNheSBmb3IgZXhhbXBsZSB3ZSBoYXZlIHRoZSBmb2xsb3dpbmcgdGVtcGxhdGUgY29kZTpcclxuICpcclxuICogYGBgaHRtbFxyXG4gKiA8IS0tIGluZGV4Lmh0bWwgLS0+XHJcbiAqIDxkaXYgbmctdmlldyBjbGFzcz1cInZpZXctYW5pbWF0aW9uXCI+XHJcbiAqIDwvZGl2PlxyXG4gKlxyXG4gKiA8IS0tIGhvbWUuaHRtbCAtLT5cclxuICogPGEgaHJlZj1cIiMvYmFubmVyLXBhZ2VcIj5cclxuICogICA8aW1nIHNyYz1cIi4vYmFubmVyLmpwZ1wiIGNsYXNzPVwiYmFubmVyXCIgbmctYW5pbWF0ZS1yZWY9XCJiYW5uZXJcIj5cclxuICogPC9hPlxyXG4gKlxyXG4gKiA8IS0tIGJhbm5lci1wYWdlLmh0bWwgLS0+XHJcbiAqIDxpbWcgc3JjPVwiLi9iYW5uZXIuanBnXCIgY2xhc3M9XCJiYW5uZXJcIiBuZy1hbmltYXRlLXJlZj1cImJhbm5lclwiPlxyXG4gKiBgYGBcclxuICpcclxuICogTm93LCB3aGVuIHRoZSB2aWV3IGNoYW5nZXMgKG9uY2UgdGhlIGxpbmsgaXMgY2xpY2tlZCksIG5nQW5pbWF0ZSB3aWxsIGV4YW1pbmUgdGhlXHJcbiAqIEhUTUwgY29udGVudHMgdG8gc2VlIGlmIHRoZXJlIGlzIGEgbWF0Y2ggcmVmZXJlbmNlIGJldHdlZW4gYW55IGNvbXBvbmVudHMgaW4gdGhlIHZpZXdcclxuICogdGhhdCBpcyBsZWF2aW5nIGFuZCB0aGUgdmlldyB0aGF0IGlzIGVudGVyaW5nLiBJdCB3aWxsIHNjYW4gYm90aCB0aGUgdmlldyB3aGljaCBpcyBiZWluZ1xyXG4gKiByZW1vdmVkIChsZWF2ZSkgYW5kIGluc2VydGVkIChlbnRlcikgdG8gc2VlIGlmIHRoZXJlIGFyZSBhbnkgcGFpcmVkIERPTSBlbGVtZW50cyB0aGF0XHJcbiAqIGNvbnRhaW4gYSBtYXRjaGluZyByZWYgdmFsdWUuXHJcbiAqXHJcbiAqIFRoZSB0d28gaW1hZ2VzIG1hdGNoIHNpbmNlIHRoZXkgc2hhcmUgdGhlIHNhbWUgcmVmIHZhbHVlLiBuZ0FuaW1hdGUgd2lsbCBub3cgY3JlYXRlIGFcclxuICogdHJhbnNwb3J0IGVsZW1lbnQgKHdoaWNoIGlzIGEgY2xvbmUgb2YgdGhlIGZpcnN0IGltYWdlIGVsZW1lbnQpIGFuZCBpdCB3aWxsIHRoZW4gYXR0ZW1wdFxyXG4gKiB0byBhbmltYXRlIHRvIHRoZSBwb3NpdGlvbiBvZiB0aGUgc2Vjb25kIGltYWdlIGVsZW1lbnQgaW4gdGhlIG5leHQgdmlldy4gRm9yIHRoZSBhbmltYXRpb24gdG9cclxuICogd29yayBhIHNwZWNpYWwgQ1NTIGNsYXNzIGNhbGxlZCBgbmctYW5jaG9yYCB3aWxsIGJlIGFkZGVkIHRvIHRoZSB0cmFuc3BvcnRlZCBlbGVtZW50LlxyXG4gKlxyXG4gKiBXZSBjYW4gbm93IGF0dGFjaCBhIHRyYW5zaXRpb24gb250byB0aGUgYC5iYW5uZXIubmctYW5jaG9yYCBDU1MgY2xhc3MgYW5kIHRoZW5cclxuICogbmdBbmltYXRlIHdpbGwgaGFuZGxlIHRoZSBlbnRpcmUgdHJhbnNpdGlvbiBmb3IgdXMgYXMgd2VsbCBhcyB0aGUgYWRkaXRpb24gYW5kIHJlbW92YWwgb2ZcclxuICogYW55IGNoYW5nZXMgb2YgQ1NTIGNsYXNzZXMgYmV0d2VlbiB0aGUgZWxlbWVudHM6XHJcbiAqXHJcbiAqIGBgYGNzc1xyXG4gKiAuYmFubmVyLm5nLWFuY2hvciB7XHJcbiAqICAgLyYjNDI7IHRoaXMgYW5pbWF0aW9uIHdpbGwgbGFzdCBmb3IgMSBzZWNvbmQgc2luY2UgdGhlcmUgYXJlXHJcbiAqICAgICAgICAgIHR3byBwaGFzZXMgdG8gdGhlIGFuaW1hdGlvbiAoYW4gYGluYCBhbmQgYW4gYG91dGAgcGhhc2UpICYjNDI7L1xyXG4gKiAgIHRyYW5zaXRpb246MC41cyBsaW5lYXIgYWxsO1xyXG4gKiB9XHJcbiAqIGBgYFxyXG4gKlxyXG4gKiBXZSBhbHNvICoqbXVzdCoqIGluY2x1ZGUgYW5pbWF0aW9ucyBmb3IgdGhlIHZpZXdzIHRoYXQgYXJlIGJlaW5nIGVudGVyZWQgYW5kIHJlbW92ZWRcclxuICogKG90aGVyd2lzZSBhbmNob3Jpbmcgd291bGRuJ3QgYmUgcG9zc2libGUgc2luY2UgdGhlIG5ldyB2aWV3IHdvdWxkIGJlIGluc2VydGVkIHJpZ2h0IGF3YXkpLlxyXG4gKlxyXG4gKiBgYGBjc3NcclxuICogLnZpZXctYW5pbWF0aW9uLm5nLWVudGVyLCAudmlldy1hbmltYXRpb24ubmctbGVhdmUge1xyXG4gKiAgIHRyYW5zaXRpb246MC41cyBsaW5lYXIgYWxsO1xyXG4gKiAgIHBvc2l0aW9uOmZpeGVkO1xyXG4gKiAgIGxlZnQ6MDtcclxuICogICB0b3A6MDtcclxuICogICB3aWR0aDoxMDAlO1xyXG4gKiB9XHJcbiAqIC52aWV3LWFuaW1hdGlvbi5uZy1lbnRlciB7XHJcbiAqICAgdHJhbnNmb3JtOnRyYW5zbGF0ZVgoMTAwJSk7XHJcbiAqIH1cclxuICogLnZpZXctYW5pbWF0aW9uLm5nLWxlYXZlLFxyXG4gKiAudmlldy1hbmltYXRpb24ubmctZW50ZXIubmctZW50ZXItYWN0aXZlIHtcclxuICogICB0cmFuc2Zvcm06dHJhbnNsYXRlWCgwJSk7XHJcbiAqIH1cclxuICogLnZpZXctYW5pbWF0aW9uLm5nLWxlYXZlLm5nLWxlYXZlLWFjdGl2ZSB7XHJcbiAqICAgdHJhbnNmb3JtOnRyYW5zbGF0ZVgoLTEwMCUpO1xyXG4gKiB9XHJcbiAqIGBgYFxyXG4gKlxyXG4gKiBOb3cgd2UgY2FuIGp1bXAgYmFjayB0byB0aGUgYW5jaG9yIGFuaW1hdGlvbi4gV2hlbiB0aGUgYW5pbWF0aW9uIGhhcHBlbnMsIHRoZXJlIGFyZSB0d28gc3RhZ2VzIHRoYXQgb2NjdXI6XHJcbiAqIGFuIGBvdXRgIGFuZCBhbiBgaW5gIHN0YWdlLiBUaGUgYG91dGAgc3RhZ2UgaGFwcGVucyBmaXJzdCBhbmQgdGhhdCBpcyB3aGVuIHRoZSBlbGVtZW50IGlzIGFuaW1hdGVkIGF3YXlcclxuICogZnJvbSBpdHMgb3JpZ2luLiBPbmNlIHRoYXQgYW5pbWF0aW9uIGlzIG92ZXIgdGhlbiB0aGUgYGluYCBzdGFnZSBvY2N1cnMgd2hpY2ggYW5pbWF0ZXMgdGhlXHJcbiAqIGVsZW1lbnQgdG8gaXRzIGRlc3RpbmF0aW9uLiBUaGUgcmVhc29uIHdoeSB0aGVyZSBhcmUgdHdvIGFuaW1hdGlvbnMgaXMgdG8gZ2l2ZSBlbm91Z2ggdGltZVxyXG4gKiBmb3IgdGhlIGVudGVyIGFuaW1hdGlvbiBvbiB0aGUgbmV3IGVsZW1lbnQgdG8gYmUgcmVhZHkuXHJcbiAqXHJcbiAqIFRoZSBleGFtcGxlIGFib3ZlIHNldHMgdXAgYSB0cmFuc2l0aW9uIGZvciBib3RoIHRoZSBpbiBhbmQgb3V0IHBoYXNlcywgYnV0IHdlIGNhbiBhbHNvIHRhcmdldCB0aGUgb3V0IG9yXHJcbiAqIGluIHBoYXNlcyBkaXJlY3RseSB2aWEgYG5nLWFuY2hvci1vdXRgIGFuZCBgbmctYW5jaG9yLWluYC5cclxuICpcclxuICogYGBgY3NzXHJcbiAqIC5iYW5uZXIubmctYW5jaG9yLW91dCB7XHJcbiAqICAgdHJhbnNpdGlvbjogMC41cyBsaW5lYXIgYWxsO1xyXG4gKlxyXG4gKiAgIC8mIzQyOyB0aGUgc2NhbGUgd2lsbCBiZSBhcHBsaWVkIGR1cmluZyB0aGUgb3V0IGFuaW1hdGlvbixcclxuICogICAgICAgICAgYnV0IHdpbGwgYmUgYW5pbWF0ZWQgYXdheSB3aGVuIHRoZSBpbiBhbmltYXRpb24gcnVucyAmIzQyOy9cclxuICogICB0cmFuc2Zvcm06IHNjYWxlKDEuMik7XHJcbiAqIH1cclxuICpcclxuICogLmJhbm5lci5uZy1hbmNob3ItaW4ge1xyXG4gKiAgIHRyYW5zaXRpb246IDFzIGxpbmVhciBhbGw7XHJcbiAqIH1cclxuICogYGBgXHJcbiAqXHJcbiAqXHJcbiAqXHJcbiAqXHJcbiAqICMjIyBBbmNob3JpbmcgRGVtb1xyXG4gKlxyXG4gIDxleGFtcGxlIG1vZHVsZT1cImFuY2hvcmluZ0V4YW1wbGVcIlxyXG4gICAgICAgICAgIG5hbWU9XCJhbmNob3JpbmdFeGFtcGxlXCJcclxuICAgICAgICAgICBpZD1cImFuY2hvcmluZ0V4YW1wbGVcIlxyXG4gICAgICAgICAgIGRlcHM9XCJhbmd1bGFyLWFuaW1hdGUuanM7YW5ndWxhci1yb3V0ZS5qc1wiXHJcbiAgICAgICAgICAgYW5pbWF0aW9ucz1cInRydWVcIj5cclxuICAgIDxmaWxlIG5hbWU9XCJpbmRleC5odG1sXCI+XHJcbiAgICAgIDxhIGhyZWY9XCIjL1wiPkhvbWU8L2E+XHJcbiAgICAgIDxociAvPlxyXG4gICAgICA8ZGl2IGNsYXNzPVwidmlldy1jb250YWluZXJcIj5cclxuICAgICAgICA8ZGl2IG5nLXZpZXcgY2xhc3M9XCJ2aWV3XCI+PC9kaXY+XHJcbiAgICAgIDwvZGl2PlxyXG4gICAgPC9maWxlPlxyXG4gICAgPGZpbGUgbmFtZT1cInNjcmlwdC5qc1wiPlxyXG4gICAgICBhbmd1bGFyLm1vZHVsZSgnYW5jaG9yaW5nRXhhbXBsZScsIFsnbmdBbmltYXRlJywgJ25nUm91dGUnXSlcclxuICAgICAgICAuY29uZmlnKFsnJHJvdXRlUHJvdmlkZXInLCBmdW5jdGlvbigkcm91dGVQcm92aWRlcikge1xyXG4gICAgICAgICAgJHJvdXRlUHJvdmlkZXIud2hlbignLycsIHtcclxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICdob21lLmh0bWwnLFxyXG4gICAgICAgICAgICBjb250cm9sbGVyOiAnSG9tZUNvbnRyb2xsZXIgYXMgaG9tZSdcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgJHJvdXRlUHJvdmlkZXIud2hlbignL3Byb2ZpbGUvOmlkJywge1xyXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3Byb2ZpbGUuaHRtbCcsXHJcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdQcm9maWxlQ29udHJvbGxlciBhcyBwcm9maWxlJ1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfV0pXHJcbiAgICAgICAgLnJ1bihbJyRyb290U2NvcGUnLCBmdW5jdGlvbigkcm9vdFNjb3BlKSB7XHJcbiAgICAgICAgICAkcm9vdFNjb3BlLnJlY29yZHMgPSBbXHJcbiAgICAgICAgICAgIHsgaWQ6MSwgdGl0bGU6IFwiTWlzcyBCZXVsYWggUm9vYlwiIH0sXHJcbiAgICAgICAgICAgIHsgaWQ6MiwgdGl0bGU6IFwiVHJlbnQgTW9yaXNzZXR0ZVwiIH0sXHJcbiAgICAgICAgICAgIHsgaWQ6MywgdGl0bGU6IFwiTWlzcyBBdmEgUG91cm9zXCIgfSxcclxuICAgICAgICAgICAgeyBpZDo0LCB0aXRsZTogXCJSb2QgUG91cm9zXCIgfSxcclxuICAgICAgICAgICAgeyBpZDo1LCB0aXRsZTogXCJBYmR1bCBSaWNlXCIgfSxcclxuICAgICAgICAgICAgeyBpZDo2LCB0aXRsZTogXCJMYXVyaWUgUnV0aGVyZm9yZCBTci5cIiB9LFxyXG4gICAgICAgICAgICB7IGlkOjcsIHRpdGxlOiBcIk5ha2lhIE1jTGF1Z2hsaW5cIiB9LFxyXG4gICAgICAgICAgICB7IGlkOjgsIHRpdGxlOiBcIkpvcmRvbiBCbGFuZGEgRFZNXCIgfSxcclxuICAgICAgICAgICAgeyBpZDo5LCB0aXRsZTogXCJSaG9kYSBIYW5kXCIgfSxcclxuICAgICAgICAgICAgeyBpZDoxMCwgdGl0bGU6IFwiQWxleGFuZHJlYSBTYXVlclwiIH1cclxuICAgICAgICAgIF07XHJcbiAgICAgICAgfV0pXHJcbiAgICAgICAgLmNvbnRyb2xsZXIoJ0hvbWVDb250cm9sbGVyJywgW2Z1bmN0aW9uKCkge1xyXG4gICAgICAgICAgLy9lbXB0eVxyXG4gICAgICAgIH1dKVxyXG4gICAgICAgIC5jb250cm9sbGVyKCdQcm9maWxlQ29udHJvbGxlcicsIFsnJHJvb3RTY29wZScsICckcm91dGVQYXJhbXMnLCBmdW5jdGlvbigkcm9vdFNjb3BlLCAkcm91dGVQYXJhbXMpIHtcclxuICAgICAgICAgIHZhciBpbmRleCA9IHBhcnNlSW50KCRyb3V0ZVBhcmFtcy5pZCwgMTApO1xyXG4gICAgICAgICAgdmFyIHJlY29yZCA9ICRyb290U2NvcGUucmVjb3Jkc1tpbmRleCAtIDFdO1xyXG5cclxuICAgICAgICAgIHRoaXMudGl0bGUgPSByZWNvcmQudGl0bGU7XHJcbiAgICAgICAgICB0aGlzLmlkID0gcmVjb3JkLmlkO1xyXG4gICAgICAgIH1dKTtcclxuICAgIDwvZmlsZT5cclxuICAgIDxmaWxlIG5hbWU9XCJob21lLmh0bWxcIj5cclxuICAgICAgPGgyPldlbGNvbWUgdG8gdGhlIGhvbWUgcGFnZTwvaDE+XHJcbiAgICAgIDxwPlBsZWFzZSBjbGljayBvbiBhbiBlbGVtZW50PC9wPlxyXG4gICAgICA8YSBjbGFzcz1cInJlY29yZFwiXHJcbiAgICAgICAgIG5nLWhyZWY9XCIjL3Byb2ZpbGUve3sgcmVjb3JkLmlkIH19XCJcclxuICAgICAgICAgbmctYW5pbWF0ZS1yZWY9XCJ7eyByZWNvcmQuaWQgfX1cIlxyXG4gICAgICAgICBuZy1yZXBlYXQ9XCJyZWNvcmQgaW4gcmVjb3Jkc1wiPlxyXG4gICAgICAgIHt7IHJlY29yZC50aXRsZSB9fVxyXG4gICAgICA8L2E+XHJcbiAgICA8L2ZpbGU+XHJcbiAgICA8ZmlsZSBuYW1lPVwicHJvZmlsZS5odG1sXCI+XHJcbiAgICAgIDxkaXYgY2xhc3M9XCJwcm9maWxlIHJlY29yZFwiIG5nLWFuaW1hdGUtcmVmPVwie3sgcHJvZmlsZS5pZCB9fVwiPlxyXG4gICAgICAgIHt7IHByb2ZpbGUudGl0bGUgfX1cclxuICAgICAgPC9kaXY+XHJcbiAgICA8L2ZpbGU+XHJcbiAgICA8ZmlsZSBuYW1lPVwiYW5pbWF0aW9ucy5jc3NcIj5cclxuICAgICAgLnJlY29yZCB7XHJcbiAgICAgICAgZGlzcGxheTpibG9jaztcclxuICAgICAgICBmb250LXNpemU6MjBweDtcclxuICAgICAgfVxyXG4gICAgICAucHJvZmlsZSB7XHJcbiAgICAgICAgYmFja2dyb3VuZDpibGFjaztcclxuICAgICAgICBjb2xvcjp3aGl0ZTtcclxuICAgICAgICBmb250LXNpemU6MTAwcHg7XHJcbiAgICAgIH1cclxuICAgICAgLnZpZXctY29udGFpbmVyIHtcclxuICAgICAgICBwb3NpdGlvbjpyZWxhdGl2ZTtcclxuICAgICAgfVxyXG4gICAgICAudmlldy1jb250YWluZXIgPiAudmlldy5uZy1hbmltYXRlIHtcclxuICAgICAgICBwb3NpdGlvbjphYnNvbHV0ZTtcclxuICAgICAgICB0b3A6MDtcclxuICAgICAgICBsZWZ0OjA7XHJcbiAgICAgICAgd2lkdGg6MTAwJTtcclxuICAgICAgICBtaW4taGVpZ2h0OjUwMHB4O1xyXG4gICAgICB9XHJcbiAgICAgIC52aWV3Lm5nLWVudGVyLCAudmlldy5uZy1sZWF2ZSxcclxuICAgICAgLnJlY29yZC5uZy1hbmNob3Ige1xyXG4gICAgICAgIHRyYW5zaXRpb246MC41cyBsaW5lYXIgYWxsO1xyXG4gICAgICB9XHJcbiAgICAgIC52aWV3Lm5nLWVudGVyIHtcclxuICAgICAgICB0cmFuc2Zvcm06dHJhbnNsYXRlWCgxMDAlKTtcclxuICAgICAgfVxyXG4gICAgICAudmlldy5uZy1lbnRlci5uZy1lbnRlci1hY3RpdmUsIC52aWV3Lm5nLWxlYXZlIHtcclxuICAgICAgICB0cmFuc2Zvcm06dHJhbnNsYXRlWCgwJSk7XHJcbiAgICAgIH1cclxuICAgICAgLnZpZXcubmctbGVhdmUubmctbGVhdmUtYWN0aXZlIHtcclxuICAgICAgICB0cmFuc2Zvcm06dHJhbnNsYXRlWCgtMTAwJSk7XHJcbiAgICAgIH1cclxuICAgICAgLnJlY29yZC5uZy1hbmNob3Itb3V0IHtcclxuICAgICAgICBiYWNrZ3JvdW5kOnJlZDtcclxuICAgICAgfVxyXG4gICAgPC9maWxlPlxyXG4gIDwvZXhhbXBsZT5cclxuICpcclxuICogIyMjIEhvdyBpcyB0aGUgZWxlbWVudCB0cmFuc3BvcnRlZD9cclxuICpcclxuICogV2hlbiBhbiBhbmNob3IgYW5pbWF0aW9uIG9jY3VycywgbmdBbmltYXRlIHdpbGwgY2xvbmUgdGhlIHN0YXJ0aW5nIGVsZW1lbnQgYW5kIHBvc2l0aW9uIGl0IGV4YWN0bHkgd2hlcmUgdGhlIHN0YXJ0aW5nXHJcbiAqIGVsZW1lbnQgaXMgbG9jYXRlZCBvbiBzY3JlZW4gdmlhIGFic29sdXRlIHBvc2l0aW9uaW5nLiBUaGUgY2xvbmVkIGVsZW1lbnQgd2lsbCBiZSBwbGFjZWQgaW5zaWRlIG9mIHRoZSByb290IGVsZW1lbnRcclxuICogb2YgdGhlIGFwcGxpY2F0aW9uICh3aGVyZSBuZy1hcHAgd2FzIGRlZmluZWQpIGFuZCBhbGwgb2YgdGhlIENTUyBjbGFzc2VzIG9mIHRoZSBzdGFydGluZyBlbGVtZW50IHdpbGwgYmUgYXBwbGllZC4gVGhlXHJcbiAqIGVsZW1lbnQgd2lsbCB0aGVuIGFuaW1hdGUgaW50byB0aGUgYG91dGAgYW5kIGBpbmAgYW5pbWF0aW9ucyBhbmQgd2lsbCBldmVudHVhbGx5IHJlYWNoIHRoZSBjb29yZGluYXRlcyBhbmQgbWF0Y2hcclxuICogdGhlIGRpbWVuc2lvbnMgb2YgdGhlIGRlc3RpbmF0aW9uIGVsZW1lbnQuIER1cmluZyB0aGUgZW50aXJlIGFuaW1hdGlvbiBhIENTUyBjbGFzcyBvZiBgLm5nLWFuaW1hdGUtc2hpbWAgd2lsbCBiZSBhcHBsaWVkXHJcbiAqIHRvIGJvdGggdGhlIHN0YXJ0aW5nIGFuZCBkZXN0aW5hdGlvbiBlbGVtZW50cyBpbiBvcmRlciB0byBoaWRlIHRoZW0gZnJvbSBiZWluZyB2aXNpYmxlICh0aGUgQ1NTIHN0eWxpbmcgZm9yIHRoZSBjbGFzc1xyXG4gKiBpczogYHZpc2liaWxpdHk6aGlkZGVuYCkuIE9uY2UgdGhlIGFuY2hvciByZWFjaGVzIGl0cyBkZXN0aW5hdGlvbiB0aGVuIGl0IHdpbGwgYmUgcmVtb3ZlZCBhbmQgdGhlIGRlc3RpbmF0aW9uIGVsZW1lbnRcclxuICogd2lsbCBiZWNvbWUgdmlzaWJsZSBzaW5jZSB0aGUgc2hpbSBjbGFzcyB3aWxsIGJlIHJlbW92ZWQuXHJcbiAqXHJcbiAqICMjIyBIb3cgaXMgdGhlIG1vcnBoaW5nIGhhbmRsZWQ/XHJcbiAqXHJcbiAqIENTUyBBbmNob3JpbmcgcmVsaWVzIG9uIHRyYW5zaXRpb25zIGFuZCBrZXlmcmFtZXMgYW5kIHRoZSBpbnRlcm5hbCBjb2RlIGlzIGludGVsbGlnZW50IGVub3VnaCB0byBmaWd1cmUgb3V0XHJcbiAqIHdoYXQgQ1NTIGNsYXNzZXMgZGlmZmVyIGJldHdlZW4gdGhlIHN0YXJ0aW5nIGVsZW1lbnQgYW5kIHRoZSBkZXN0aW5hdGlvbiBlbGVtZW50LiBUaGVzZSBkaWZmZXJlbnQgQ1NTIGNsYXNzZXNcclxuICogd2lsbCBiZSBhZGRlZC9yZW1vdmVkIG9uIHRoZSBhbmNob3IgZWxlbWVudCBhbmQgYSB0cmFuc2l0aW9uIHdpbGwgYmUgYXBwbGllZCAodGhlIHRyYW5zaXRpb24gdGhhdCBpcyBwcm92aWRlZFxyXG4gKiBpbiB0aGUgYW5jaG9yIGNsYXNzKS4gTG9uZyBzdG9yeSBzaG9ydCwgbmdBbmltYXRlIHdpbGwgZmlndXJlIG91dCB3aGF0IGNsYXNzZXMgdG8gYWRkIGFuZCByZW1vdmUgd2hpY2ggd2lsbFxyXG4gKiBtYWtlIHRoZSB0cmFuc2l0aW9uIG9mIHRoZSBlbGVtZW50IGFzIHNtb290aCBhbmQgYXV0b21hdGljIGFzIHBvc3NpYmxlLiBCZSBzdXJlIHRvIHVzZSBzaW1wbGUgQ1NTIGNsYXNzZXMgdGhhdFxyXG4gKiBkbyBub3QgcmVseSBvbiBET00gbmVzdGluZyBzdHJ1Y3R1cmUgc28gdGhhdCB0aGUgYW5jaG9yIGVsZW1lbnQgYXBwZWFycyB0aGUgc2FtZSBhcyB0aGUgc3RhcnRpbmcgZWxlbWVudCAoc2luY2VcclxuICogdGhlIGNsb25lZCBlbGVtZW50IGlzIHBsYWNlZCBpbnNpZGUgb2Ygcm9vdCBlbGVtZW50IHdoaWNoIGlzIGxpa2VseSBjbG9zZSB0byB0aGUgYm9keSBlbGVtZW50KS5cclxuICpcclxuICogTm90ZSB0aGF0IGlmIHRoZSByb290IGVsZW1lbnQgaXMgb24gdGhlIGA8aHRtbD5gIGVsZW1lbnQgdGhlbiB0aGUgY2xvbmVkIG5vZGUgd2lsbCBiZSBwbGFjZWQgaW5zaWRlIG9mIGJvZHkuXHJcbiAqXHJcbiAqXHJcbiAqICMjIFVzaW5nICRhbmltYXRlIGluIHlvdXIgZGlyZWN0aXZlIGNvZGVcclxuICpcclxuICogU28gZmFyIHdlJ3ZlIGV4cGxvcmVkIGhvdyB0byBmZWVkIGluIGFuaW1hdGlvbnMgaW50byBhbiBBbmd1bGFyIGFwcGxpY2F0aW9uLCBidXQgaG93IGRvIHdlIHRyaWdnZXIgYW5pbWF0aW9ucyB3aXRoaW4gb3VyIG93biBkaXJlY3RpdmVzIGluIG91ciBhcHBsaWNhdGlvbj9cclxuICogQnkgaW5qZWN0aW5nIHRoZSBgJGFuaW1hdGVgIHNlcnZpY2UgaW50byBvdXIgZGlyZWN0aXZlIGNvZGUsIHdlIGNhbiB0cmlnZ2VyIHN0cnVjdHVyYWwgYW5kIGNsYXNzLWJhc2VkIGhvb2tzIHdoaWNoIGNhbiB0aGVuIGJlIGNvbnN1bWVkIGJ5IGFuaW1hdGlvbnMuIExldCdzXHJcbiAqIGltYWdpbmUgd2UgaGF2ZSBhIGdyZWV0aW5nIGJveCB0aGF0IHNob3dzIGFuZCBoaWRlcyBpdHNlbGYgd2hlbiB0aGUgZGF0YSBjaGFuZ2VzXHJcbiAqXHJcbiAqIGBgYGh0bWxcclxuICogPGdyZWV0aW5nLWJveCBhY3RpdmU9XCJvbk9yT2ZmXCI+SGkgdGhlcmU8L2dyZWV0aW5nLWJveD5cclxuICogYGBgXHJcbiAqXHJcbiAqIGBgYGpzXHJcbiAqIG5nTW9kdWxlLmRpcmVjdGl2ZSgnZ3JlZXRpbmdCb3gnLCBbJyRhbmltYXRlJywgZnVuY3Rpb24oJGFuaW1hdGUpIHtcclxuICogICByZXR1cm4gZnVuY3Rpb24oc2NvcGUsIGVsZW1lbnQsIGF0dHJzKSB7XHJcbiAqICAgICBhdHRycy4kb2JzZXJ2ZSgnYWN0aXZlJywgZnVuY3Rpb24odmFsdWUpIHtcclxuICogICAgICAgdmFsdWUgPyAkYW5pbWF0ZS5hZGRDbGFzcyhlbGVtZW50LCAnb24nKSA6ICRhbmltYXRlLnJlbW92ZUNsYXNzKGVsZW1lbnQsICdvbicpO1xyXG4gKiAgICAgfSk7XHJcbiAqICAgfSk7XHJcbiAqIH1dKTtcclxuICogYGBgXHJcbiAqXHJcbiAqIE5vdyB0aGUgYG9uYCBDU1MgY2xhc3MgaXMgYWRkZWQgYW5kIHJlbW92ZWQgb24gdGhlIGdyZWV0aW5nIGJveCBjb21wb25lbnQuIE5vdyBpZiB3ZSBhZGQgYSBDU1MgY2xhc3Mgb24gdG9wIG9mIHRoZSBncmVldGluZyBib3ggZWxlbWVudFxyXG4gKiBpbiBvdXIgSFRNTCBjb2RlIHRoZW4gd2UgY2FuIHRyaWdnZXIgYSBDU1Mgb3IgSlMgYW5pbWF0aW9uIHRvIGhhcHBlbi5cclxuICpcclxuICogYGBgY3NzXHJcbiAqIC8mIzQyOyBub3JtYWxseSB3ZSB3b3VsZCBjcmVhdGUgYSBDU1MgY2xhc3MgdG8gcmVmZXJlbmNlIG9uIHRoZSBlbGVtZW50ICYjNDI7L1xyXG4gKiBncmVldGluZy1ib3gub24geyB0cmFuc2l0aW9uOjAuNXMgbGluZWFyIGFsbDsgYmFja2dyb3VuZDpncmVlbjsgY29sb3I6d2hpdGU7IH1cclxuICogYGBgXHJcbiAqXHJcbiAqIFRoZSBgJGFuaW1hdGVgIHNlcnZpY2UgY29udGFpbnMgYSB2YXJpZXR5IG9mIG90aGVyIG1ldGhvZHMgbGlrZSBgZW50ZXJgLCBgbGVhdmVgLCBgYW5pbWF0ZWAgYW5kIGBzZXRDbGFzc2AuIFRvIGxlYXJuIG1vcmUgYWJvdXQgd2hhdCdzXHJcbiAqIHBvc3NpYmxlIGJlIHN1cmUgdG8gdmlzaXQgdGhlIHtAbGluayBuZy4kYW5pbWF0ZSAkYW5pbWF0ZSBzZXJ2aWNlIEFQSSBwYWdlfS5cclxuICpcclxuICpcclxuICogIyMgQ2FsbGJhY2tzIGFuZCBQcm9taXNlc1xyXG4gKlxyXG4gKiBXaGVuIGAkYW5pbWF0ZWAgaXMgY2FsbGVkIGl0IHJldHVybnMgYSBwcm9taXNlIHRoYXQgY2FuIGJlIHVzZWQgdG8gY2FwdHVyZSB3aGVuIHRoZSBhbmltYXRpb24gaGFzIGVuZGVkLiBUaGVyZWZvcmUgaWYgd2Ugd2VyZSB0byB0cmlnZ2VyXHJcbiAqIGFuIGFuaW1hdGlvbiAod2l0aGluIG91ciBkaXJlY3RpdmUgY29kZSkgdGhlbiB3ZSBjYW4gY29udGludWUgcGVyZm9ybWluZyBkaXJlY3RpdmUgYW5kIHNjb3BlIHJlbGF0ZWQgYWN0aXZpdGllcyBhZnRlciB0aGUgYW5pbWF0aW9uIGhhc1xyXG4gKiBlbmRlZCBieSBjaGFpbmluZyBvbnRvIHRoZSByZXR1cm5lZCBwcm9taXNlIHRoYXQgYW5pbWF0aW9uIG1ldGhvZCByZXR1cm5zLlxyXG4gKlxyXG4gKiBgYGBqc1xyXG4gKiAvLyBzb21ld2hlcmUgd2l0aGluIHRoZSBkZXB0aHMgb2YgdGhlIGRpcmVjdGl2ZVxyXG4gKiAkYW5pbWF0ZS5lbnRlcihlbGVtZW50LCBwYXJlbnQpLnRoZW4oZnVuY3Rpb24oKSB7XHJcbiAqICAgLy90aGUgYW5pbWF0aW9uIGhhcyBjb21wbGV0ZWRcclxuICogfSk7XHJcbiAqIGBgYFxyXG4gKlxyXG4gKiAoTm90ZSB0aGF0IGVhcmxpZXIgdmVyc2lvbnMgb2YgQW5ndWxhciBwcmlvciB0byB2MS40IHJlcXVpcmVkIHRoZSBwcm9taXNlIGNvZGUgdG8gYmUgd3JhcHBlZCB1c2luZyBgJHNjb3BlLiRhcHBseSguLi4pYC4gVGhpcyBpcyBub3QgdGhlIGNhc2VcclxuICogYW55bW9yZS4pXHJcbiAqXHJcbiAqIEluIGFkZGl0aW9uIHRvIHRoZSBhbmltYXRpb24gcHJvbWlzZSwgd2UgY2FuIGFsc28gbWFrZSB1c2Ugb2YgYW5pbWF0aW9uLXJlbGF0ZWQgY2FsbGJhY2tzIHdpdGhpbiBvdXIgZGlyZWN0aXZlcyBhbmQgY29udHJvbGxlciBjb2RlIGJ5IHJlZ2lzdGVyaW5nXHJcbiAqIGFuIGV2ZW50IGxpc3RlbmVyIHVzaW5nIHRoZSBgJGFuaW1hdGVgIHNlcnZpY2UuIExldCdzIHNheSBmb3IgZXhhbXBsZSB0aGF0IGFuIGFuaW1hdGlvbiB3YXMgdHJpZ2dlcmVkIG9uIG91ciB2aWV3XHJcbiAqIHJvdXRpbmcgY29udHJvbGxlciB0byBob29rIGludG8gdGhhdDpcclxuICpcclxuICogYGBganNcclxuICogbmdNb2R1bGUuY29udHJvbGxlcignSG9tZVBhZ2VDb250cm9sbGVyJywgWyckYW5pbWF0ZScsIGZ1bmN0aW9uKCRhbmltYXRlKSB7XHJcbiAqICAgJGFuaW1hdGUub24oJ2VudGVyJywgbmdWaWV3RWxlbWVudCwgZnVuY3Rpb24oZWxlbWVudCkge1xyXG4gKiAgICAgLy8gdGhlIGFuaW1hdGlvbiBmb3IgdGhpcyByb3V0ZSBoYXMgY29tcGxldGVkXHJcbiAqICAgfV0pO1xyXG4gKiB9XSlcclxuICogYGBgXHJcbiAqXHJcbiAqIChOb3RlIHRoYXQgeW91IHdpbGwgbmVlZCB0byB0cmlnZ2VyIGEgZGlnZXN0IHdpdGhpbiB0aGUgY2FsbGJhY2sgdG8gZ2V0IGFuZ3VsYXIgdG8gbm90aWNlIGFueSBzY29wZS1yZWxhdGVkIGNoYW5nZXMuKVxyXG4gKi9cclxuXHJcbnZhciBjb3B5O1xyXG52YXIgZXh0ZW5kO1xyXG52YXIgZm9yRWFjaDtcclxudmFyIGlzQXJyYXk7XHJcbnZhciBpc0RlZmluZWQ7XHJcbnZhciBpc0VsZW1lbnQ7XHJcbnZhciBpc0Z1bmN0aW9uO1xyXG52YXIgaXNPYmplY3Q7XHJcbnZhciBpc1N0cmluZztcclxudmFyIGlzVW5kZWZpbmVkO1xyXG52YXIganFMaXRlO1xyXG52YXIgbm9vcDtcclxuXHJcbi8qKlxyXG4gKiBAbmdkb2Mgc2VydmljZVxyXG4gKiBAbmFtZSAkYW5pbWF0ZVxyXG4gKiBAa2luZCBvYmplY3RcclxuICpcclxuICogQGRlc2NyaXB0aW9uXHJcbiAqIFRoZSBuZ0FuaW1hdGUgYCRhbmltYXRlYCBzZXJ2aWNlIGRvY3VtZW50YXRpb24gaXMgdGhlIHNhbWUgZm9yIHRoZSBjb3JlIGAkYW5pbWF0ZWAgc2VydmljZS5cclxuICpcclxuICogQ2xpY2sgaGVyZSB7QGxpbmsgbmcuJGFuaW1hdGUgdG8gbGVhcm4gbW9yZSBhYm91dCBhbmltYXRpb25zIHdpdGggYCRhbmltYXRlYH0uXHJcbiAqL1xyXG5hbmd1bGFyLm1vZHVsZSgnbmdBbmltYXRlJywgW10sIGZ1bmN0aW9uIGluaXRBbmd1bGFySGVscGVycygpIHtcclxuICAvLyBBY2Nlc3MgaGVscGVycyBmcm9tIGFuZ3VsYXIgY29yZS5cclxuICAvLyBEbyBpdCBpbnNpZGUgYSBgY29uZmlnYCBibG9jayB0byBlbnN1cmUgYHdpbmRvdy5hbmd1bGFyYCBpcyBhdmFpbGFibGUuXHJcbiAgbm9vcCAgICAgICAgPSBhbmd1bGFyLm5vb3A7XHJcbiAgY29weSAgICAgICAgPSBhbmd1bGFyLmNvcHk7XHJcbiAgZXh0ZW5kICAgICAgPSBhbmd1bGFyLmV4dGVuZDtcclxuICBqcUxpdGUgICAgICA9IGFuZ3VsYXIuZWxlbWVudDtcclxuICBmb3JFYWNoICAgICA9IGFuZ3VsYXIuZm9yRWFjaDtcclxuICBpc0FycmF5ICAgICA9IGFuZ3VsYXIuaXNBcnJheTtcclxuICBpc1N0cmluZyAgICA9IGFuZ3VsYXIuaXNTdHJpbmc7XHJcbiAgaXNPYmplY3QgICAgPSBhbmd1bGFyLmlzT2JqZWN0O1xyXG4gIGlzVW5kZWZpbmVkID0gYW5ndWxhci5pc1VuZGVmaW5lZDtcclxuICBpc0RlZmluZWQgICA9IGFuZ3VsYXIuaXNEZWZpbmVkO1xyXG4gIGlzRnVuY3Rpb24gID0gYW5ndWxhci5pc0Z1bmN0aW9uO1xyXG4gIGlzRWxlbWVudCAgID0gYW5ndWxhci5pc0VsZW1lbnQ7XHJcbn0pXHJcbiAgLmRpcmVjdGl2ZSgnbmdBbmltYXRlU3dhcCcsIG5nQW5pbWF0ZVN3YXBEaXJlY3RpdmUpXHJcblxyXG4gIC5kaXJlY3RpdmUoJ25nQW5pbWF0ZUNoaWxkcmVuJywgJCRBbmltYXRlQ2hpbGRyZW5EaXJlY3RpdmUpXHJcbiAgLmZhY3RvcnkoJyQkckFGU2NoZWR1bGVyJywgJCRyQUZTY2hlZHVsZXJGYWN0b3J5KVxyXG5cclxuICAucHJvdmlkZXIoJyQkYW5pbWF0ZVF1ZXVlJywgJCRBbmltYXRlUXVldWVQcm92aWRlcilcclxuICAucHJvdmlkZXIoJyQkYW5pbWF0aW9uJywgJCRBbmltYXRpb25Qcm92aWRlcilcclxuXHJcbiAgLnByb3ZpZGVyKCckYW5pbWF0ZUNzcycsICRBbmltYXRlQ3NzUHJvdmlkZXIpXHJcbiAgLnByb3ZpZGVyKCckJGFuaW1hdGVDc3NEcml2ZXInLCAkJEFuaW1hdGVDc3NEcml2ZXJQcm92aWRlcilcclxuXHJcbiAgLnByb3ZpZGVyKCckJGFuaW1hdGVKcycsICQkQW5pbWF0ZUpzUHJvdmlkZXIpXHJcbiAgLnByb3ZpZGVyKCckJGFuaW1hdGVKc0RyaXZlcicsICQkQW5pbWF0ZUpzRHJpdmVyUHJvdmlkZXIpO1xyXG5cclxuXHJcbn0pKHdpbmRvdywgd2luZG93LmFuZ3VsYXIpOyJdLCJmaWxlIjoiYW5ndWxhci1hbmltYXRlLmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
