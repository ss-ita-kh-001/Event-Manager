// https://github.com/awerlang/angular-responsive-tables
(function() {
    "use strict";
    function getFirstHeaderInRow(tr) {
        var th = tr.firstChild;
        while (th) {
            if (th.tagName === "TH") break;
            if (th.tagName === "TD") {
                th = null;
                break;
            }
            th = th.nextSibling;
        }
        return th;
    }
    function getHeaders(element) {
        return [].filter.call(element.children().children().children(), function(it) {
            return it.tagName === "TH";
        });
    }
    function updateTitle(td, th) {
        var title = th && th.textContent;
        if (title && (td.getAttributeNode("data-title-override") || !td.getAttributeNode("data-title"))) {
            td.setAttribute("data-title", title);
            td.setAttribute("data-title-override", title);
        }
    }
    function colspan(td) {
        var colspan = td.getAttributeNode("colspan");
        return colspan ? parseInt(colspan.value) : 1;
    }
    function wtResponsiveTable() {
        return {
            restrict: "A",
            controller: [ "$element", function($element) {
                return {
                    contains: function(td) {
                        var tableEl = $element[0];
                        var el = td;
                        do {
                            if (el === tableEl) return true;
                            if (el.tagName === "TABLE") return false;
                            el = el.parentElement;
                        } while (el);
                        throw new Error("Table element not found for " + td);
                    },
                    getHeader: function(td) {
                        var firstHeader = getFirstHeaderInRow(td.parentElement);
                        if (firstHeader) return firstHeader;
                        var headers = getHeaders($element);
                        if (headers.length) {
                            var row = td.parentElement;
                            var headerIndex = 0;
                            var found = Array.prototype.some.call(row.children, function(value, index) {
                                if (value.tagName !== "TD") return false;
                                if (value === td) {
                                    return true;
                                }
                                headerIndex += colspan(value);
                            });
                            return found ? headers[headerIndex] : null;
                        }
                    }
                };
            } ],
            compile: function(element, attrs) {
                attrs.$addClass("responsive");
                var headers = getHeaders(element);
                if (headers.length) {
                    var rows = [].filter.call(element.children(), function(it) {
                        return it.tagName === "TBODY";
                    })[0].children;
                    Array.prototype.forEach.call(rows, function(row) {
                        var headerIndex = 0;
                        [].forEach.call(row.children, function(value, index) {
                            if (value.tagName !== "TD") return;
                            var th = getFirstHeaderInRow(value.parentElement);
                            th = th || headers[headerIndex];
                            updateTitle(value, th);
                            headerIndex += colspan(value);
                        });
                    });
                }
            }
        };
    }
    function wtResponsiveDynamic() {
        return {
            restrict: "E",
            require: "?^^wtResponsiveTable",
            link: function(scope, element, attrs, tableCtrl) {
                if (!tableCtrl) return;
                if (!tableCtrl.contains(element[0])) return;
                setTimeout(function() {
                    [].forEach.call(element[0].parentElement.children, function(td) {
                        if (td.tagName !== "TD") return;
                        var th = tableCtrl.getHeader(td);
                        updateTitle(td, th);
                    });
                }, 0);
            }
        };
    }
    "use strict";
    angular.module("wt.responsive", []).directive("wtResponsiveTable", [ wtResponsiveTable ]).directive("td", [ wtResponsiveDynamic ]);
})();
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJhbmd1bGFyLXJlc3BvbnNpdmUtdGFibGVzLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9hd2VybGFuZy9hbmd1bGFyLXJlc3BvbnNpdmUtdGFibGVzXHJcbihmdW5jdGlvbigpIHtcclxuICAgIFwidXNlIHN0cmljdFwiO1xyXG4gICAgZnVuY3Rpb24gZ2V0Rmlyc3RIZWFkZXJJblJvdyh0cikge1xyXG4gICAgICAgIHZhciB0aCA9IHRyLmZpcnN0Q2hpbGQ7XHJcbiAgICAgICAgd2hpbGUgKHRoKSB7XHJcbiAgICAgICAgICAgIGlmICh0aC50YWdOYW1lID09PSBcIlRIXCIpIGJyZWFrO1xyXG4gICAgICAgICAgICBpZiAodGgudGFnTmFtZSA9PT0gXCJURFwiKSB7XHJcbiAgICAgICAgICAgICAgICB0aCA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aCA9IHRoLm5leHRTaWJsaW5nO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGg7XHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBnZXRIZWFkZXJzKGVsZW1lbnQpIHtcclxuICAgICAgICByZXR1cm4gW10uZmlsdGVyLmNhbGwoZWxlbWVudC5jaGlsZHJlbigpLmNoaWxkcmVuKCkuY2hpbGRyZW4oKSwgZnVuY3Rpb24oaXQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGl0LnRhZ05hbWUgPT09IFwiVEhcIjtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIHVwZGF0ZVRpdGxlKHRkLCB0aCkge1xyXG4gICAgICAgIHZhciB0aXRsZSA9IHRoICYmIHRoLnRleHRDb250ZW50O1xyXG4gICAgICAgIGlmICh0aXRsZSAmJiAodGQuZ2V0QXR0cmlidXRlTm9kZShcImRhdGEtdGl0bGUtb3ZlcnJpZGVcIikgfHwgIXRkLmdldEF0dHJpYnV0ZU5vZGUoXCJkYXRhLXRpdGxlXCIpKSkge1xyXG4gICAgICAgICAgICB0ZC5zZXRBdHRyaWJ1dGUoXCJkYXRhLXRpdGxlXCIsIHRpdGxlKTtcclxuICAgICAgICAgICAgdGQuc2V0QXR0cmlidXRlKFwiZGF0YS10aXRsZS1vdmVycmlkZVwiLCB0aXRsZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gY29sc3Bhbih0ZCkge1xyXG4gICAgICAgIHZhciBjb2xzcGFuID0gdGQuZ2V0QXR0cmlidXRlTm9kZShcImNvbHNwYW5cIik7XHJcbiAgICAgICAgcmV0dXJuIGNvbHNwYW4gPyBwYXJzZUludChjb2xzcGFuLnZhbHVlKSA6IDE7XHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiB3dFJlc3BvbnNpdmVUYWJsZSgpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICByZXN0cmljdDogXCJBXCIsXHJcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6IFsgXCIkZWxlbWVudFwiLCBmdW5jdGlvbigkZWxlbWVudCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgICAgICBjb250YWluczogZnVuY3Rpb24odGQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHRhYmxlRWwgPSAkZWxlbWVudFswXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGVsID0gdGQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRvIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlbCA9PT0gdGFibGVFbCkgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZWwudGFnTmFtZSA9PT0gXCJUQUJMRVwiKSByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbCA9IGVsLnBhcmVudEVsZW1lbnQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gd2hpbGUgKGVsKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVGFibGUgZWxlbWVudCBub3QgZm91bmQgZm9yIFwiICsgdGQpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgZ2V0SGVhZGVyOiBmdW5jdGlvbih0ZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZmlyc3RIZWFkZXIgPSBnZXRGaXJzdEhlYWRlckluUm93KHRkLnBhcmVudEVsZW1lbnQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZmlyc3RIZWFkZXIpIHJldHVybiBmaXJzdEhlYWRlcjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGhlYWRlcnMgPSBnZXRIZWFkZXJzKCRlbGVtZW50KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGhlYWRlcnMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgcm93ID0gdGQucGFyZW50RWxlbWVudDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBoZWFkZXJJbmRleCA9IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgZm91bmQgPSBBcnJheS5wcm90b3R5cGUuc29tZS5jYWxsKHJvdy5jaGlsZHJlbiwgZnVuY3Rpb24odmFsdWUsIGluZGV4KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHZhbHVlLnRhZ05hbWUgIT09IFwiVERcIikgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh2YWx1ZSA9PT0gdGQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhlYWRlckluZGV4ICs9IGNvbHNwYW4odmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZm91bmQgPyBoZWFkZXJzW2hlYWRlckluZGV4XSA6IG51bGw7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICB9IF0sXHJcbiAgICAgICAgICAgIGNvbXBpbGU6IGZ1bmN0aW9uKGVsZW1lbnQsIGF0dHJzKSB7XHJcbiAgICAgICAgICAgICAgICBhdHRycy4kYWRkQ2xhc3MoXCJyZXNwb25zaXZlXCIpO1xyXG4gICAgICAgICAgICAgICAgdmFyIGhlYWRlcnMgPSBnZXRIZWFkZXJzKGVsZW1lbnQpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGhlYWRlcnMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHJvd3MgPSBbXS5maWx0ZXIuY2FsbChlbGVtZW50LmNoaWxkcmVuKCksIGZ1bmN0aW9uKGl0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBpdC50YWdOYW1lID09PSBcIlRCT0RZXCI7XHJcbiAgICAgICAgICAgICAgICAgICAgfSlbMF0uY2hpbGRyZW47XHJcbiAgICAgICAgICAgICAgICAgICAgQXJyYXkucHJvdG90eXBlLmZvckVhY2guY2FsbChyb3dzLCBmdW5jdGlvbihyb3cpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGhlYWRlckluZGV4ID0gMDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgW10uZm9yRWFjaC5jYWxsKHJvdy5jaGlsZHJlbiwgZnVuY3Rpb24odmFsdWUsIGluZGV4KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodmFsdWUudGFnTmFtZSAhPT0gXCJURFwiKSByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgdGggPSBnZXRGaXJzdEhlYWRlckluUm93KHZhbHVlLnBhcmVudEVsZW1lbnQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGggPSB0aCB8fCBoZWFkZXJzW2hlYWRlckluZGV4XTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZVRpdGxlKHZhbHVlLCB0aCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoZWFkZXJJbmRleCArPSBjb2xzcGFuKHZhbHVlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gd3RSZXNwb25zaXZlRHluYW1pYygpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICByZXN0cmljdDogXCJFXCIsXHJcbiAgICAgICAgICAgIHJlcXVpcmU6IFwiP15ed3RSZXNwb25zaXZlVGFibGVcIixcclxuICAgICAgICAgICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCB0YWJsZUN0cmwpIHtcclxuICAgICAgICAgICAgICAgIGlmICghdGFibGVDdHJsKSByZXR1cm47XHJcbiAgICAgICAgICAgICAgICBpZiAoIXRhYmxlQ3RybC5jb250YWlucyhlbGVtZW50WzBdKSkgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICBbXS5mb3JFYWNoLmNhbGwoZWxlbWVudFswXS5wYXJlbnRFbGVtZW50LmNoaWxkcmVuLCBmdW5jdGlvbih0ZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGQudGFnTmFtZSAhPT0gXCJURFwiKSByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB0aCA9IHRhYmxlQ3RybC5nZXRIZWFkZXIodGQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVUaXRsZSh0ZCwgdGgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfSwgMCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgfVxyXG4gICAgXCJ1c2Ugc3RyaWN0XCI7XHJcbiAgICBhbmd1bGFyLm1vZHVsZShcInd0LnJlc3BvbnNpdmVcIiwgW10pLmRpcmVjdGl2ZShcInd0UmVzcG9uc2l2ZVRhYmxlXCIsIFsgd3RSZXNwb25zaXZlVGFibGUgXSkuZGlyZWN0aXZlKFwidGRcIiwgWyB3dFJlc3BvbnNpdmVEeW5hbWljIF0pO1xyXG59KSgpOyJdLCJmaWxlIjoiYW5ndWxhci1yZXNwb25zaXZlLXRhYmxlcy5qcyJ9
