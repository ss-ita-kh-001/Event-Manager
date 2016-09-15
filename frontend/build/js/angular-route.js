!function(e,r){"use strict";function t(e,r){if(c(e)){r=r||[];for(var t=0,n=e.length;t<n;t++)r[t]=e[t]}else if(u(e)){r=r||{};for(var a in e)"$"===a.charAt(0)&&"$"===a.charAt(1)||(r[a]=e[a])}return r||e}function n(){function e(e,t){return r.extend(Object.create(e),t)}function n(e,r){var t=r.caseInsensitiveMatch,n={originalPath:e,regexp:e},a=n.keys=[];return e=e.replace(/([().])/g,"\\$1").replace(/(\/)?:(\w+)(\*\?|[\?\*])?/g,function(e,r,t,n){var o="?"===n||"*?"===n?"?":null,i="*"===n||"*?"===n?"*":null;return a.push({name:t,optional:!!o}),r=r||"",""+(o?"":r)+"(?:"+(o?r:"")+(i&&"(.+?)"||"([^/]+)")+(o||"")+")"+(o||"")}).replace(/([\/$\*])/g,"\\$1"),n.regexp=new RegExp("^"+e+"$",t?"i":""),n}c=r.isArray,u=r.isObject;var a={};this.when=function(e,o){var i=t(o);if(r.isUndefined(i.reloadOnSearch)&&(i.reloadOnSearch=!0),r.isUndefined(i.caseInsensitiveMatch)&&(i.caseInsensitiveMatch=this.caseInsensitiveMatch),a[e]=r.extend(i,e&&n(e,i)),e){var c="/"==e[e.length-1]?e.substr(0,e.length-1):e+"/";a[c]=r.extend({redirectTo:e},n(c,i))}return this},this.caseInsensitiveMatch=!1,this.otherwise=function(e){return"string"==typeof e&&(e={redirectTo:e}),this.when(null,e),this},this.$get=["$rootScope","$location","$routeParams","$q","$injector","$templateRequest","$sce",function(t,n,o,i,c,u,l){function h(e,r){var t=r.keys,n={};if(!r.regexp)return null;var a=r.regexp.exec(e);if(!a)return null;for(var o=1,i=a.length;o<i;++o){var c=t[o-1],u=a[o];c&&u&&(n[c.name]=u)}return n}function f(e){var n=C.current;g=v(),w=g&&n&&g.$$route===n.$$route&&r.equals(g.pathParams,n.pathParams)&&!g.reloadOnSearch&&!P,w||!n&&!g||t.$broadcast("$routeChangeStart",g,n).defaultPrevented&&e&&e.preventDefault()}function $(){var e=C.current,a=g;w?(e.params=a.params,r.copy(e.params,o),t.$broadcast("$routeUpdate",e)):(a||e)&&(P=!1,C.current=a,a&&a.redirectTo&&(r.isString(a.redirectTo)?n.path(m(a.redirectTo,a.params)).search(a.params).replace():n.url(a.redirectTo(a.pathParams,n.path(),n.search())).replace()),i.when(a).then(d).then(function(n){a==C.current&&(a&&(a.locals=n,r.copy(a.params,o)),t.$broadcast("$routeChangeSuccess",a,e))},function(r){a==C.current&&t.$broadcast("$routeChangeError",a,e,r)}))}function d(e){if(e){var t=r.extend({},e.resolve);r.forEach(t,function(e,n){t[n]=r.isString(e)?c.get(e):c.invoke(e,null,null,n)});var n=p(e);return r.isDefined(n)&&(t.$template=n),i.all(t)}}function p(e){var t,n;return r.isDefined(t=e.template)?r.isFunction(t)&&(t=t(e.params)):r.isDefined(n=e.templateUrl)&&(r.isFunction(n)&&(n=n(e.params)),r.isDefined(n)&&(e.loadedTemplateUrl=l.valueOf(n),t=u(n))),t}function v(){var t,o;return r.forEach(a,function(a,i){!o&&(t=h(n.path(),a))&&(o=e(a,{params:r.extend({},n.search(),t),pathParams:t}),o.$$route=a)}),o||a[null]&&e(a[null],{params:{},pathParams:{}})}function m(e,t){var n=[];return r.forEach((e||"").split(":"),function(e,r){if(0===r)n.push(e);else{var a=e.match(/(\w+)(?:[?*])?(.*)/),o=a[1];n.push(t[o]),n.push(a[2]||""),delete t[o]}}),n.join("")}var g,w,P=!1,C={routes:a,reload:function(){P=!0;var e={defaultPrevented:!1,preventDefault:function(){this.defaultPrevented=!0,P=!1}};t.$evalAsync(function(){f(e),e.defaultPrevented||$()})},updateParams:function(e){if(!this.current||!this.current.$$route)throw s("norout","Tried updating route when with no current route");e=r.extend({},this.current.params,e),n.path(m(this.current.$$route.originalPath,e)),n.search(e)}};return t.$on("$locationChangeStart",f),t.$on("$locationChangeSuccess",$),C}]}function a(){this.$get=function(){return{}}}function o(e,t,n){return{restrict:"ECA",terminal:!0,priority:400,transclude:"element",link:function(a,o,i,c,u){function l(){$&&(n.cancel($),$=null),h&&(h.$destroy(),h=null),f&&($=n.leave(f),$.then(function(){$=null}),f=null)}function s(){var i=e.current&&e.current.locals,c=i&&i.$template;if(r.isDefined(c)){var s=a.$new(),$=e.current,v=u(s,function(e){n.enter(e,null,f||o).then(function(){!r.isDefined(d)||d&&!a.$eval(d)||t()}),l()});f=v,h=$.scope=s,h.$emit("$viewContentLoaded"),h.$eval(p)}else l()}var h,f,$,d=i.autoscroll,p=i.onload||"";a.$on("$routeChangeSuccess",s),s()}}}function i(e,r,t){return{restrict:"ECA",priority:-400,link:function(n,a){var o=t.current,i=o.locals;a.html(i.$template);var c=e(a.contents());if(o.controller){i.$scope=n;var u=r(o.controller,i);o.controllerAs&&(n[o.controllerAs]=u),a.data("$ngControllerController",u),a.children().data("$ngControllerController",u)}n[o.resolveAs||"$resolve"]=i,c(n)}}}var c,u,l=r.module("ngRoute",["ng"]).provider("$route",n),s=r.$$minErr("ngRoute");l.provider("$routeParams",a),l.directive("ngView",o),l.directive("ngView",i),o.$inject=["$route","$anchorScroll","$animate"],i.$inject=["$compile","$controller","$route"]}(window,window.angular);