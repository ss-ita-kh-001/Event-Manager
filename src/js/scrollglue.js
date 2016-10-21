/* angularjs Scroll Glue
 * version 2.0.6
 * https://github.com/Luegg/angularjs-scroll-glue
 * An AngularJs directive that automatically scrolls to the bottom of an element on changes in it's scope.
*/

(function(angular, undefined){
    'use strict';

    function createActivationState($parse, attr, scope){
        function unboundState(initValue){
            var activated = initValue;
            return {
                getValue: function(){
                    return activated;
                },
                setValue: function(value){
                    activated = value;
                }
            };
        }

        function oneWayBindingState(getter, scope){
            return {
                getValue: function(){
                    return getter(scope);
                },
                setValue: function(){}
            }
        }

        function twoWayBindingState(getter, setter, scope){
            return {
                getValue: function(){
                    return getter(scope);
                },
                setValue: function(value){
                    if(value !== getter(scope)){
                        scope.$apply(function(){
                            setter(scope, value);
                        });
                    }
                }
            };
        }

        if(attr !== ""){
            var getter = $parse(attr);
            if(getter.assign !== undefined){
                return twoWayBindingState(getter, getter.assign, scope);
            } else {
                return oneWayBindingState(getter, scope);
            }
        } else {
            return unboundState(true);
        }
    }

    function createDirective(module, attrName, direction){
        module.directive(attrName, ['$parse', '$window', '$timeout', function($parse, $window, $timeout){
            return {
                priority: 1,
                restrict: 'A',
                link: function(scope, $el, attrs){
                    var el = $el[0],
                        activationState = createActivationState($parse, attrs[attrName], scope);

                    function scrollIfGlued() {
                        if(activationState.getValue() && !direction.isAttached(el)){
                            direction.scroll(el);
                        }
                    }

                    function onScroll() {
                        activationState.setValue(direction.isAttached(el));
                    }

                    scope.$watch(scrollIfGlued);

                    $timeout(scrollIfGlued, 0, false);

                    $window.addEventListener('resize', scrollIfGlued, false);

                    $el.bind('scroll', onScroll);


                    // Remove listeners on directive destroy
                    $el.on('$destroy', function() {
                        $el.unbind('scroll', onScroll);
                    });

                    scope.$on('$destroy', function() {
                        $window.removeEventListener('resize',scrollIfGlued, false);
                    });
                }
            };
        }]);
    }

    var bottom = {
        isAttached: function(el){
            // + 1 catches off by one errors in chrome
            return el.scrollTop + el.clientHeight + 1 >= el.scrollHeight;
        },
        scroll: function(el){
            el.scrollTop = el.scrollHeight;
        }
    };

    var top = {
        isAttached: function(el){
            return el.scrollTop <= 1;
        },
        scroll: function(el){
            el.scrollTop = 0;
        }
    };

    var right = {
        isAttached: function(el){
            return el.scrollLeft + el.clientWidth + 1 >= el.scrollWidth;
        },
        scroll: function(el){
            el.scrollLeft = el.scrollWidth;
        }
    };

    var left = {
        isAttached: function(el){
            return el.scrollLeft <= 1;
        },
        scroll: function(el){
            el.scrollLeft = 0;
        }
    };

    var module = angular.module('luegg.directives', []);

    createDirective(module, 'scrollGlue', bottom);
    createDirective(module, 'scrollGlueTop', top);
    createDirective(module, 'scrollGlueBottom', bottom);
    createDirective(module, 'scrollGlueLeft', left);
    createDirective(module, 'scrollGlueRight', right);
}(angular));
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJzY3JvbGxnbHVlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qIGFuZ3VsYXJqcyBTY3JvbGwgR2x1ZVxyXG4gKiB2ZXJzaW9uIDIuMC42XHJcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9MdWVnZy9hbmd1bGFyanMtc2Nyb2xsLWdsdWVcclxuICogQW4gQW5ndWxhckpzIGRpcmVjdGl2ZSB0aGF0IGF1dG9tYXRpY2FsbHkgc2Nyb2xscyB0byB0aGUgYm90dG9tIG9mIGFuIGVsZW1lbnQgb24gY2hhbmdlcyBpbiBpdCdzIHNjb3BlLlxyXG4qL1xyXG5cclxuKGZ1bmN0aW9uKGFuZ3VsYXIsIHVuZGVmaW5lZCl7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgZnVuY3Rpb24gY3JlYXRlQWN0aXZhdGlvblN0YXRlKCRwYXJzZSwgYXR0ciwgc2NvcGUpe1xyXG4gICAgICAgIGZ1bmN0aW9uIHVuYm91bmRTdGF0ZShpbml0VmFsdWUpe1xyXG4gICAgICAgICAgICB2YXIgYWN0aXZhdGVkID0gaW5pdFZhbHVlO1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgZ2V0VmFsdWU6IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGFjdGl2YXRlZDtcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBzZXRWYWx1ZTogZnVuY3Rpb24odmFsdWUpe1xyXG4gICAgICAgICAgICAgICAgICAgIGFjdGl2YXRlZCA9IHZhbHVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gb25lV2F5QmluZGluZ1N0YXRlKGdldHRlciwgc2NvcGUpe1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgZ2V0VmFsdWU6IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGdldHRlcihzY29wZSk7XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgc2V0VmFsdWU6IGZ1bmN0aW9uKCl7fVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiB0d29XYXlCaW5kaW5nU3RhdGUoZ2V0dGVyLCBzZXR0ZXIsIHNjb3BlKXtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIGdldFZhbHVlOiBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBnZXR0ZXIoc2NvcGUpO1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHNldFZhbHVlOiBmdW5jdGlvbih2YWx1ZSl7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYodmFsdWUgIT09IGdldHRlcihzY29wZSkpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzY29wZS4kYXBwbHkoZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldHRlcihzY29wZSwgdmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZihhdHRyICE9PSBcIlwiKXtcclxuICAgICAgICAgICAgdmFyIGdldHRlciA9ICRwYXJzZShhdHRyKTtcclxuICAgICAgICAgICAgaWYoZ2V0dGVyLmFzc2lnbiAhPT0gdW5kZWZpbmVkKXtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0d29XYXlCaW5kaW5nU3RhdGUoZ2V0dGVyLCBnZXR0ZXIuYXNzaWduLCBzY29wZSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gb25lV2F5QmluZGluZ1N0YXRlKGdldHRlciwgc2NvcGUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIHVuYm91bmRTdGF0ZSh0cnVlKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gY3JlYXRlRGlyZWN0aXZlKG1vZHVsZSwgYXR0ck5hbWUsIGRpcmVjdGlvbil7XHJcbiAgICAgICAgbW9kdWxlLmRpcmVjdGl2ZShhdHRyTmFtZSwgWyckcGFyc2UnLCAnJHdpbmRvdycsICckdGltZW91dCcsIGZ1bmN0aW9uKCRwYXJzZSwgJHdpbmRvdywgJHRpbWVvdXQpe1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgcHJpb3JpdHk6IDEsXHJcbiAgICAgICAgICAgICAgICByZXN0cmljdDogJ0EnLFxyXG4gICAgICAgICAgICAgICAgbGluazogZnVuY3Rpb24oc2NvcGUsICRlbCwgYXR0cnMpe1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBlbCA9ICRlbFswXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgYWN0aXZhdGlvblN0YXRlID0gY3JlYXRlQWN0aXZhdGlvblN0YXRlKCRwYXJzZSwgYXR0cnNbYXR0ck5hbWVdLCBzY29wZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uIHNjcm9sbElmR2x1ZWQoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKGFjdGl2YXRpb25TdGF0ZS5nZXRWYWx1ZSgpICYmICFkaXJlY3Rpb24uaXNBdHRhY2hlZChlbCkpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlyZWN0aW9uLnNjcm9sbChlbCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uIG9uU2Nyb2xsKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhY3RpdmF0aW9uU3RhdGUuc2V0VmFsdWUoZGlyZWN0aW9uLmlzQXR0YWNoZWQoZWwpKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHNjb3BlLiR3YXRjaChzY3JvbGxJZkdsdWVkKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoc2Nyb2xsSWZHbHVlZCwgMCwgZmFsc2UpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAkd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHNjcm9sbElmR2x1ZWQsIGZhbHNlKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgJGVsLmJpbmQoJ3Njcm9sbCcsIG9uU2Nyb2xsKTtcclxuXHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIFJlbW92ZSBsaXN0ZW5lcnMgb24gZGlyZWN0aXZlIGRlc3Ryb3lcclxuICAgICAgICAgICAgICAgICAgICAkZWwub24oJyRkZXN0cm95JywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRlbC51bmJpbmQoJ3Njcm9sbCcsIG9uU2Nyb2xsKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgc2NvcGUuJG9uKCckZGVzdHJveScsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsc2Nyb2xsSWZHbHVlZCwgZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1dKTtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgYm90dG9tID0ge1xyXG4gICAgICAgIGlzQXR0YWNoZWQ6IGZ1bmN0aW9uKGVsKXtcclxuICAgICAgICAgICAgLy8gKyAxIGNhdGNoZXMgb2ZmIGJ5IG9uZSBlcnJvcnMgaW4gY2hyb21lXHJcbiAgICAgICAgICAgIHJldHVybiBlbC5zY3JvbGxUb3AgKyBlbC5jbGllbnRIZWlnaHQgKyAxID49IGVsLnNjcm9sbEhlaWdodDtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHNjcm9sbDogZnVuY3Rpb24oZWwpe1xyXG4gICAgICAgICAgICBlbC5zY3JvbGxUb3AgPSBlbC5zY3JvbGxIZWlnaHQ7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICB2YXIgdG9wID0ge1xyXG4gICAgICAgIGlzQXR0YWNoZWQ6IGZ1bmN0aW9uKGVsKXtcclxuICAgICAgICAgICAgcmV0dXJuIGVsLnNjcm9sbFRvcCA8PSAxO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc2Nyb2xsOiBmdW5jdGlvbihlbCl7XHJcbiAgICAgICAgICAgIGVsLnNjcm9sbFRvcCA9IDA7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICB2YXIgcmlnaHQgPSB7XHJcbiAgICAgICAgaXNBdHRhY2hlZDogZnVuY3Rpb24oZWwpe1xyXG4gICAgICAgICAgICByZXR1cm4gZWwuc2Nyb2xsTGVmdCArIGVsLmNsaWVudFdpZHRoICsgMSA+PSBlbC5zY3JvbGxXaWR0aDtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHNjcm9sbDogZnVuY3Rpb24oZWwpe1xyXG4gICAgICAgICAgICBlbC5zY3JvbGxMZWZ0ID0gZWwuc2Nyb2xsV2lkdGg7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICB2YXIgbGVmdCA9IHtcclxuICAgICAgICBpc0F0dGFjaGVkOiBmdW5jdGlvbihlbCl7XHJcbiAgICAgICAgICAgIHJldHVybiBlbC5zY3JvbGxMZWZ0IDw9IDE7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBzY3JvbGw6IGZ1bmN0aW9uKGVsKXtcclxuICAgICAgICAgICAgZWwuc2Nyb2xsTGVmdCA9IDA7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICB2YXIgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ2x1ZWdnLmRpcmVjdGl2ZXMnLCBbXSk7XHJcblxyXG4gICAgY3JlYXRlRGlyZWN0aXZlKG1vZHVsZSwgJ3Njcm9sbEdsdWUnLCBib3R0b20pO1xyXG4gICAgY3JlYXRlRGlyZWN0aXZlKG1vZHVsZSwgJ3Njcm9sbEdsdWVUb3AnLCB0b3ApO1xyXG4gICAgY3JlYXRlRGlyZWN0aXZlKG1vZHVsZSwgJ3Njcm9sbEdsdWVCb3R0b20nLCBib3R0b20pO1xyXG4gICAgY3JlYXRlRGlyZWN0aXZlKG1vZHVsZSwgJ3Njcm9sbEdsdWVMZWZ0JywgbGVmdCk7XHJcbiAgICBjcmVhdGVEaXJlY3RpdmUobW9kdWxlLCAnc2Nyb2xsR2x1ZVJpZ2h0JywgcmlnaHQpO1xyXG59KGFuZ3VsYXIpKTsiXSwiZmlsZSI6InNjcm9sbGdsdWUuanMifQ==
