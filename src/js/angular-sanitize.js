/**
 * @license AngularJS v1.5.8
 * (c) 2010-2016 Google, Inc. http://angularjs.org
 * License: MIT
 */
(function(window, angular) {'use strict';

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *     Any commits to this file should be reviewed with security in mind.  *
 *   Changes to this file can potentially create security vulnerabilities. *
 *          An approval from 2 Core members with history of modifying      *
 *                         this file is required.                          *
 *                                                                         *
 *  Does the change somehow allow for arbitrary javascript to be executed? *
 *    Or allows for someone to change the prototype of built-in objects?   *
 *     Or gives undesired access to variables likes document or window?    *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

var $sanitizeMinErr = angular.$$minErr('$sanitize');
var bind;
var extend;
var forEach;
var isDefined;
var lowercase;
var noop;
var htmlParser;
var htmlSanitizeWriter;

/**
 * @ngdoc module
 * @name ngSanitize
 * @description
 *
 * # ngSanitize
 *
 * The `ngSanitize` module provides functionality to sanitize HTML.
 *
 *
 * <div doc-module-components="ngSanitize"></div>
 *
 * See {@link ngSanitize.$sanitize `$sanitize`} for usage.
 */

/**
 * @ngdoc service
 * @name $sanitize
 * @kind function
 *
 * @description
 *   Sanitizes an html string by stripping all potentially dangerous tokens.
 *
 *   The input is sanitized by parsing the HTML into tokens. All safe tokens (from a whitelist) are
 *   then serialized back to properly escaped html string. This means that no unsafe input can make
 *   it into the returned string.
 *
 *   The whitelist for URL sanitization of attribute values is configured using the functions
 *   `aHrefSanitizationWhitelist` and `imgSrcSanitizationWhitelist` of {@link ng.$compileProvider
 *   `$compileProvider`}.
 *
 *   The input may also contain SVG markup if this is enabled via {@link $sanitizeProvider}.
 *
 * @param {string} html HTML input.
 * @returns {string} Sanitized HTML.
 *
 * @example
   <example module="sanitizeExample" deps="angular-sanitize.js">
   <file name="index.html">
     <script>
         angular.module('sanitizeExample', ['ngSanitize'])
           .controller('ExampleController', ['$scope', '$sce', function($scope, $sce) {
             $scope.snippet =
               '<p style="color:blue">an html\n' +
               '<em onmouseover="this.textContent=\'PWN3D!\'">click here</em>\n' +
               'snippet</p>';
             $scope.deliberatelyTrustDangerousSnippet = function() {
               return $sce.trustAsHtml($scope.snippet);
             };
           }]);
     </script>
     <div ng-controller="ExampleController">
        Snippet: <textarea ng-model="snippet" cols="60" rows="3"></textarea>
       <table>
         <tr>
           <td>Directive</td>
           <td>How</td>
           <td>Source</td>
           <td>Rendered</td>
         </tr>
         <tr id="bind-html-with-sanitize">
           <td>ng-bind-html</td>
           <td>Automatically uses $sanitize</td>
           <td><pre>&lt;div ng-bind-html="snippet"&gt;<br/>&lt;/div&gt;</pre></td>
           <td><div ng-bind-html="snippet"></div></td>
         </tr>
         <tr id="bind-html-with-trust">
           <td>ng-bind-html</td>
           <td>Bypass $sanitize by explicitly trusting the dangerous value</td>
           <td>
           <pre>&lt;div ng-bind-html="deliberatelyTrustDangerousSnippet()"&gt;
&lt;/div&gt;</pre>
           </td>
           <td><div ng-bind-html="deliberatelyTrustDangerousSnippet()"></div></td>
         </tr>
         <tr id="bind-default">
           <td>ng-bind</td>
           <td>Automatically escapes</td>
           <td><pre>&lt;div ng-bind="snippet"&gt;<br/>&lt;/div&gt;</pre></td>
           <td><div ng-bind="snippet"></div></td>
         </tr>
       </table>
       </div>
   </file>
   <file name="protractor.js" type="protractor">
     it('should sanitize the html snippet by default', function() {
       expect(element(by.css('#bind-html-with-sanitize div')).getInnerHtml()).
         toBe('<p>an html\n<em>click here</em>\nsnippet</p>');
     });

     it('should inline raw snippet if bound to a trusted value', function() {
       expect(element(by.css('#bind-html-with-trust div')).getInnerHtml()).
         toBe("<p style=\"color:blue\">an html\n" +
              "<em onmouseover=\"this.textContent='PWN3D!'\">click here</em>\n" +
              "snippet</p>");
     });

     it('should escape snippet without any filter', function() {
       expect(element(by.css('#bind-default div')).getInnerHtml()).
         toBe("&lt;p style=\"color:blue\"&gt;an html\n" +
              "&lt;em onmouseover=\"this.textContent='PWN3D!'\"&gt;click here&lt;/em&gt;\n" +
              "snippet&lt;/p&gt;");
     });

     it('should update', function() {
       element(by.model('snippet')).clear();
       element(by.model('snippet')).sendKeys('new <b onclick="alert(1)">text</b>');
       expect(element(by.css('#bind-html-with-sanitize div')).getInnerHtml()).
         toBe('new <b>text</b>');
       expect(element(by.css('#bind-html-with-trust div')).getInnerHtml()).toBe(
         'new <b onclick="alert(1)">text</b>');
       expect(element(by.css('#bind-default div')).getInnerHtml()).toBe(
         "new &lt;b onclick=\"alert(1)\"&gt;text&lt;/b&gt;");
     });
   </file>
   </example>
 */


/**
 * @ngdoc provider
 * @name $sanitizeProvider
 *
 * @description
 * Creates and configures {@link $sanitize} instance.
 */
function $SanitizeProvider() {
  var svgEnabled = false;

  this.$get = ['$$sanitizeUri', function($$sanitizeUri) {
    if (svgEnabled) {
      extend(validElements, svgElements);
    }
    return function(html) {
      var buf = [];
      htmlParser(html, htmlSanitizeWriter(buf, function(uri, isImage) {
        return !/^unsafe:/.test($$sanitizeUri(uri, isImage));
      }));
      return buf.join('');
    };
  }];


  /**
   * @ngdoc method
   * @name $sanitizeProvider#enableSvg
   * @kind function
   *
   * @description
   * Enables a subset of svg to be supported by the sanitizer.
   *
   * <div class="alert alert-warning">
   *   <p>By enabling this setting without taking other precautions, you might expose your
   *   application to click-hijacking attacks. In these attacks, sanitized svg elements could be positioned
   *   outside of the containing element and be rendered over other elements on the page (e.g. a login
   *   link). Such behavior can then result in phishing incidents.</p>
   *
   *   <p>To protect against these, explicitly setup `overflow: hidden` css rule for all potential svg
   *   tags within the sanitized content:</p>
   *
   *   <br>
   *
   *   <pre><code>
   *   .rootOfTheIncludedContent svg {
   *     overflow: hidden !important;
   *   }
   *   </code></pre>
   * </div>
   *
   * @param {boolean=} flag Enable or disable SVG support in the sanitizer.
   * @returns {boolean|ng.$sanitizeProvider} Returns the currently configured value if called
   *    without an argument or self for chaining otherwise.
   */
  this.enableSvg = function(enableSvg) {
    if (isDefined(enableSvg)) {
      svgEnabled = enableSvg;
      return this;
    } else {
      return svgEnabled;
    }
  };

  //////////////////////////////////////////////////////////////////////////////////////////////////
  // Private stuff
  //////////////////////////////////////////////////////////////////////////////////////////////////

  bind = angular.bind;
  extend = angular.extend;
  forEach = angular.forEach;
  isDefined = angular.isDefined;
  lowercase = angular.lowercase;
  noop = angular.noop;

  htmlParser = htmlParserImpl;
  htmlSanitizeWriter = htmlSanitizeWriterImpl;

  // Regular Expressions for parsing tags and attributes
  var SURROGATE_PAIR_REGEXP = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g,
    // Match everything outside of normal chars and " (quote character)
    NON_ALPHANUMERIC_REGEXP = /([^\#-~ |!])/g;


  // Good source of info about elements and attributes
  // http://dev.w3.org/html5/spec/Overview.html#semantics
  // http://simon.html5.org/html-elements

  // Safe Void Elements - HTML5
  // http://dev.w3.org/html5/spec/Overview.html#void-elements
  var voidElements = toMap("area,br,col,hr,img,wbr");

  // Elements that you can, intentionally, leave open (and which close themselves)
  // http://dev.w3.org/html5/spec/Overview.html#optional-tags
  var optionalEndTagBlockElements = toMap("colgroup,dd,dt,li,p,tbody,td,tfoot,th,thead,tr"),
      optionalEndTagInlineElements = toMap("rp,rt"),
      optionalEndTagElements = extend({},
                                              optionalEndTagInlineElements,
                                              optionalEndTagBlockElements);

  // Safe Block Elements - HTML5
  var blockElements = extend({}, optionalEndTagBlockElements, toMap("address,article," +
          "aside,blockquote,caption,center,del,dir,div,dl,figure,figcaption,footer,h1,h2,h3,h4,h5," +
          "h6,header,hgroup,hr,ins,map,menu,nav,ol,pre,section,table,ul"));

  // Inline Elements - HTML5
  var inlineElements = extend({}, optionalEndTagInlineElements, toMap("a,abbr,acronym,b," +
          "bdi,bdo,big,br,cite,code,del,dfn,em,font,i,img,ins,kbd,label,map,mark,q,ruby,rp,rt,s," +
          "samp,small,span,strike,strong,sub,sup,time,tt,u,var"));

  // SVG Elements
  // https://wiki.whatwg.org/wiki/Sanitization_rules#svg_Elements
  // Note: the elements animate,animateColor,animateMotion,animateTransform,set are intentionally omitted.
  // They can potentially allow for arbitrary javascript to be executed. See #11290
  var svgElements = toMap("circle,defs,desc,ellipse,font-face,font-face-name,font-face-src,g,glyph," +
          "hkern,image,linearGradient,line,marker,metadata,missing-glyph,mpath,path,polygon,polyline," +
          "radialGradient,rect,stop,svg,switch,text,title,tspan");

  // Blocked Elements (will be stripped)
  var blockedElements = toMap("script,style");

  var validElements = extend({},
                                     voidElements,
                                     blockElements,
                                     inlineElements,
                                     optionalEndTagElements);

  //Attributes that have href and hence need to be sanitized
  var uriAttrs = toMap("background,cite,href,longdesc,src,xlink:href");

  var htmlAttrs = toMap('abbr,align,alt,axis,bgcolor,border,cellpadding,cellspacing,class,clear,' +
      'color,cols,colspan,compact,coords,dir,face,headers,height,hreflang,hspace,' +
      'ismap,lang,language,nohref,nowrap,rel,rev,rows,rowspan,rules,' +
      'scope,scrolling,shape,size,span,start,summary,tabindex,target,title,type,' +
      'valign,value,vspace,width');

  // SVG attributes (without "id" and "name" attributes)
  // https://wiki.whatwg.org/wiki/Sanitization_rules#svg_Attributes
  var svgAttrs = toMap('accent-height,accumulate,additive,alphabetic,arabic-form,ascent,' +
      'baseProfile,bbox,begin,by,calcMode,cap-height,class,color,color-rendering,content,' +
      'cx,cy,d,dx,dy,descent,display,dur,end,fill,fill-rule,font-family,font-size,font-stretch,' +
      'font-style,font-variant,font-weight,from,fx,fy,g1,g2,glyph-name,gradientUnits,hanging,' +
      'height,horiz-adv-x,horiz-origin-x,ideographic,k,keyPoints,keySplines,keyTimes,lang,' +
      'marker-end,marker-mid,marker-start,markerHeight,markerUnits,markerWidth,mathematical,' +
      'max,min,offset,opacity,orient,origin,overline-position,overline-thickness,panose-1,' +
      'path,pathLength,points,preserveAspectRatio,r,refX,refY,repeatCount,repeatDur,' +
      'requiredExtensions,requiredFeatures,restart,rotate,rx,ry,slope,stemh,stemv,stop-color,' +
      'stop-opacity,strikethrough-position,strikethrough-thickness,stroke,stroke-dasharray,' +
      'stroke-dashoffset,stroke-linecap,stroke-linejoin,stroke-miterlimit,stroke-opacity,' +
      'stroke-width,systemLanguage,target,text-anchor,to,transform,type,u1,u2,underline-position,' +
      'underline-thickness,unicode,unicode-range,units-per-em,values,version,viewBox,visibility,' +
      'width,widths,x,x-height,x1,x2,xlink:actuate,xlink:arcrole,xlink:role,xlink:show,xlink:title,' +
      'xlink:type,xml:base,xml:lang,xml:space,xmlns,xmlns:xlink,y,y1,y2,zoomAndPan', true);

  var validAttrs = extend({},
                                  uriAttrs,
                                  svgAttrs,
                                  htmlAttrs);

  function toMap(str, lowercaseKeys) {
    var obj = {}, items = str.split(','), i;
    for (i = 0; i < items.length; i++) {
      obj[lowercaseKeys ? lowercase(items[i]) : items[i]] = true;
    }
    return obj;
  }

  var inertBodyElement;
  (function(window) {
    var doc;
    if (window.document && window.document.implementation) {
      doc = window.document.implementation.createHTMLDocument("inert");
    } else {
      throw $sanitizeMinErr('noinert', "Can't create an inert html document");
    }
    var docElement = doc.documentElement || doc.getDocumentElement();
    var bodyElements = docElement.getElementsByTagName('body');

    // usually there should be only one body element in the document, but IE doesn't have any, so we need to create one
    if (bodyElements.length === 1) {
      inertBodyElement = bodyElements[0];
    } else {
      var html = doc.createElement('html');
      inertBodyElement = doc.createElement('body');
      html.appendChild(inertBodyElement);
      doc.appendChild(html);
    }
  })(window);

  /**
   * @example
   * htmlParser(htmlString, {
   *     start: function(tag, attrs) {},
   *     end: function(tag) {},
   *     chars: function(text) {},
   *     comment: function(text) {}
   * });
   *
   * @param {string} html string
   * @param {object} handler
   */
  function htmlParserImpl(html, handler) {
    if (html === null || html === undefined) {
      html = '';
    } else if (typeof html !== 'string') {
      html = '' + html;
    }
    inertBodyElement.innerHTML = html;

    //mXSS protection
    var mXSSAttempts = 5;
    do {
      if (mXSSAttempts === 0) {
        throw $sanitizeMinErr('uinput', "Failed to sanitize html because the input is unstable");
      }
      mXSSAttempts--;

      // strip custom-namespaced attributes on IE<=11
      if (window.document.documentMode) {
        stripCustomNsAttrs(inertBodyElement);
      }
      html = inertBodyElement.innerHTML; //trigger mXSS
      inertBodyElement.innerHTML = html;
    } while (html !== inertBodyElement.innerHTML);

    var node = inertBodyElement.firstChild;
    while (node) {
      switch (node.nodeType) {
        case 1: // ELEMENT_NODE
          handler.start(node.nodeName.toLowerCase(), attrToMap(node.attributes));
          break;
        case 3: // TEXT NODE
          handler.chars(node.textContent);
          break;
      }

      var nextNode;
      if (!(nextNode = node.firstChild)) {
      if (node.nodeType == 1) {
          handler.end(node.nodeName.toLowerCase());
        }
        nextNode = node.nextSibling;
        if (!nextNode) {
          while (nextNode == null) {
            node = node.parentNode;
            if (node === inertBodyElement) break;
            nextNode = node.nextSibling;
          if (node.nodeType == 1) {
              handler.end(node.nodeName.toLowerCase());
            }
          }
        }
      }
      node = nextNode;
    }

    while (node = inertBodyElement.firstChild) {
      inertBodyElement.removeChild(node);
    }
  }

  function attrToMap(attrs) {
    var map = {};
    for (var i = 0, ii = attrs.length; i < ii; i++) {
      var attr = attrs[i];
      map[attr.name] = attr.value;
    }
    return map;
  }


  /**
   * Escapes all potentially dangerous characters, so that the
   * resulting string can be safely inserted into attribute or
   * element text.
   * @param value
   * @returns {string} escaped text
   */
  function encodeEntities(value) {
    return value.
      replace(/&/g, '&amp;').
      replace(SURROGATE_PAIR_REGEXP, function(value) {
        var hi = value.charCodeAt(0);
        var low = value.charCodeAt(1);
        return '&#' + (((hi - 0xD800) * 0x400) + (low - 0xDC00) + 0x10000) + ';';
      }).
      replace(NON_ALPHANUMERIC_REGEXP, function(value) {
        return '&#' + value.charCodeAt(0) + ';';
      }).
      replace(/</g, '&lt;').
      replace(/>/g, '&gt;');
  }

  /**
   * create an HTML/XML writer which writes to buffer
   * @param {Array} buf use buf.join('') to get out sanitized html string
   * @returns {object} in the form of {
   *     start: function(tag, attrs) {},
   *     end: function(tag) {},
   *     chars: function(text) {},
   *     comment: function(text) {}
   * }
   */
  function htmlSanitizeWriterImpl(buf, uriValidator) {
    var ignoreCurrentElement = false;
    var out = bind(buf, buf.push);
    return {
      start: function(tag, attrs) {
        tag = lowercase(tag);
        if (!ignoreCurrentElement && blockedElements[tag]) {
          ignoreCurrentElement = tag;
        }
        if (!ignoreCurrentElement && validElements[tag] === true) {
          out('<');
          out(tag);
          forEach(attrs, function(value, key) {
            var lkey = lowercase(key);
            var isImage = (tag === 'img' && lkey === 'src') || (lkey === 'background');
            if (validAttrs[lkey] === true &&
              (uriAttrs[lkey] !== true || uriValidator(value, isImage))) {
              out(' ');
              out(key);
              out('="');
              out(encodeEntities(value));
              out('"');
            }
          });
          out('>');
        }
      },
      end: function(tag) {
        tag = lowercase(tag);
        if (!ignoreCurrentElement && validElements[tag] === true && voidElements[tag] !== true) {
          out('</');
          out(tag);
          out('>');
        }
        if (tag == ignoreCurrentElement) {
          ignoreCurrentElement = false;
        }
      },
      chars: function(chars) {
        if (!ignoreCurrentElement) {
          out(encodeEntities(chars));
        }
      }
    };
  }


  /**
   * When IE9-11 comes across an unknown namespaced attribute e.g. 'xlink:foo' it adds 'xmlns:ns1' attribute to declare
   * ns1 namespace and prefixes the attribute with 'ns1' (e.g. 'ns1:xlink:foo'). This is undesirable since we don't want
   * to allow any of these custom attributes. This method strips them all.
   *
   * @param node Root element to process
   */
  function stripCustomNsAttrs(node) {
    if (node.nodeType === window.Node.ELEMENT_NODE) {
      var attrs = node.attributes;
      for (var i = 0, l = attrs.length; i < l; i++) {
        var attrNode = attrs[i];
        var attrName = attrNode.name.toLowerCase();
        if (attrName === 'xmlns:ns1' || attrName.lastIndexOf('ns1:', 0) === 0) {
          node.removeAttributeNode(attrNode);
          i--;
          l--;
        }
      }
    }

    var nextNode = node.firstChild;
    if (nextNode) {
      stripCustomNsAttrs(nextNode);
    }

    nextNode = node.nextSibling;
    if (nextNode) {
      stripCustomNsAttrs(nextNode);
    }
  }
}

function sanitizeText(chars) {
  var buf = [];
  var writer = htmlSanitizeWriter(buf, noop);
  writer.chars(chars);
  return buf.join('');
}


// define ngSanitize module and register $sanitize service
angular.module('ngSanitize', []).provider('$sanitize', $SanitizeProvider);

/**
 * @ngdoc filter
 * @name linky
 * @kind function
 *
 * @description
 * Finds links in text input and turns them into html links. Supports `http/https/ftp/mailto` and
 * plain email address links.
 *
 * Requires the {@link ngSanitize `ngSanitize`} module to be installed.
 *
 * @param {string} text Input text.
 * @param {string} target Window (`_blank|_self|_parent|_top`) or named frame to open links in.
 * @param {object|function(url)} [attributes] Add custom attributes to the link element.
 *
 *    Can be one of:
 *
 *    - `object`: A map of attributes
 *    - `function`: Takes the url as a parameter and returns a map of attributes
 *
 *    If the map of attributes contains a value for `target`, it overrides the value of
 *    the target parameter.
 *
 *
 * @returns {string} Html-linkified and {@link $sanitize sanitized} text.
 *
 * @usage
   <span ng-bind-html="linky_expression | linky"></span>
 *
 * @example
   <example module="linkyExample" deps="angular-sanitize.js">
     <file name="index.html">
       <div ng-controller="ExampleController">
       Snippet: <textarea ng-model="snippet" cols="60" rows="3"></textarea>
       <table>
         <tr>
           <th>Filter</th>
           <th>Source</th>
           <th>Rendered</th>
         </tr>
         <tr id="linky-filter">
           <td>linky filter</td>
           <td>
             <pre>&lt;div ng-bind-html="snippet | linky"&gt;<br>&lt;/div&gt;</pre>
           </td>
           <td>
             <div ng-bind-html="snippet | linky"></div>
           </td>
         </tr>
         <tr id="linky-target">
          <td>linky target</td>
          <td>
            <pre>&lt;div ng-bind-html="snippetWithSingleURL | linky:'_blank'"&gt;<br>&lt;/div&gt;</pre>
          </td>
          <td>
            <div ng-bind-html="snippetWithSingleURL | linky:'_blank'"></div>
          </td>
         </tr>
         <tr id="linky-custom-attributes">
          <td>linky custom attributes</td>
          <td>
            <pre>&lt;div ng-bind-html="snippetWithSingleURL | linky:'_self':{rel: 'nofollow'}"&gt;<br>&lt;/div&gt;</pre>
          </td>
          <td>
            <div ng-bind-html="snippetWithSingleURL | linky:'_self':{rel: 'nofollow'}"></div>
          </td>
         </tr>
         <tr id="escaped-html">
           <td>no filter</td>
           <td><pre>&lt;div ng-bind="snippet"&gt;<br>&lt;/div&gt;</pre></td>
           <td><div ng-bind="snippet"></div></td>
         </tr>
       </table>
     </file>
     <file name="script.js">
       angular.module('linkyExample', ['ngSanitize'])
         .controller('ExampleController', ['$scope', function($scope) {
           $scope.snippet =
             'Pretty text with some links:\n'+
             'http://angularjs.org/,\n'+
             'mailto:us@somewhere.org,\n'+
             'another@somewhere.org,\n'+
             'and one more: ftp://127.0.0.1/.';
           $scope.snippetWithSingleURL = 'http://angularjs.org/';
         }]);
     </file>
     <file name="protractor.js" type="protractor">
       it('should linkify the snippet with urls', function() {
         expect(element(by.id('linky-filter')).element(by.binding('snippet | linky')).getText()).
             toBe('Pretty text with some links: http://angularjs.org/, us@somewhere.org, ' +
                  'another@somewhere.org, and one more: ftp://127.0.0.1/.');
         expect(element.all(by.css('#linky-filter a')).count()).toEqual(4);
       });

       it('should not linkify snippet without the linky filter', function() {
         expect(element(by.id('escaped-html')).element(by.binding('snippet')).getText()).
             toBe('Pretty text with some links: http://angularjs.org/, mailto:us@somewhere.org, ' +
                  'another@somewhere.org, and one more: ftp://127.0.0.1/.');
         expect(element.all(by.css('#escaped-html a')).count()).toEqual(0);
       });

       it('should update', function() {
         element(by.model('snippet')).clear();
         element(by.model('snippet')).sendKeys('new http://link.');
         expect(element(by.id('linky-filter')).element(by.binding('snippet | linky')).getText()).
             toBe('new http://link.');
         expect(element.all(by.css('#linky-filter a')).count()).toEqual(1);
         expect(element(by.id('escaped-html')).element(by.binding('snippet')).getText())
             .toBe('new http://link.');
       });

       it('should work with the target property', function() {
        expect(element(by.id('linky-target')).
            element(by.binding("snippetWithSingleURL | linky:'_blank'")).getText()).
            toBe('http://angularjs.org/');
        expect(element(by.css('#linky-target a')).getAttribute('target')).toEqual('_blank');
       });

       it('should optionally add custom attributes', function() {
        expect(element(by.id('linky-custom-attributes')).
            element(by.binding("snippetWithSingleURL | linky:'_self':{rel: 'nofollow'}")).getText()).
            toBe('http://angularjs.org/');
        expect(element(by.css('#linky-custom-attributes a')).getAttribute('rel')).toEqual('nofollow');
       });
     </file>
   </example>
 */
angular.module('ngSanitize').filter('linky', ['$sanitize', function($sanitize) {
  var LINKY_URL_REGEXP =
        /((ftp|https?):\/\/|(www\.)|(mailto:)?[A-Za-z0-9._%+-]+@)\S*[^\s.;,(){}<>"\u201d\u2019]/i,
      MAILTO_REGEXP = /^mailto:/i;

  var linkyMinErr = angular.$$minErr('linky');
  var isDefined = angular.isDefined;
  var isFunction = angular.isFunction;
  var isObject = angular.isObject;
  var isString = angular.isString;

  return function(text, target, attributes) {
    if (text == null || text === '') return text;
    if (!isString(text)) throw linkyMinErr('notstring', 'Expected string but received: {0}', text);

    var attributesFn =
      isFunction(attributes) ? attributes :
      isObject(attributes) ? function getAttributesObject() {return attributes;} :
      function getEmptyAttributesObject() {return {};};

    var match;
    var raw = text;
    var html = [];
    var url;
    var i;
    while ((match = raw.match(LINKY_URL_REGEXP))) {
      // We can not end in these as they are sometimes found at the end of the sentence
      url = match[0];
      // if we did not match ftp/http/www/mailto then assume mailto
      if (!match[2] && !match[4]) {
        url = (match[3] ? 'http://' : 'mailto:') + url;
      }
      i = match.index;
      addText(raw.substr(0, i));
      addLink(url, match[0].replace(MAILTO_REGEXP, ''));
      raw = raw.substring(i + match[0].length);
    }
    addText(raw);
    return $sanitize(html.join(''));

    function addText(text) {
      if (!text) {
        return;
      }
      html.push(sanitizeText(text));
    }

    function addLink(url, text) {
      var key, linkAttributes = attributesFn(url);
      html.push('<a ');

      for (key in linkAttributes) {
        html.push(key + '="' + linkAttributes[key] + '" ');
      }

      if (isDefined(target) && !('target' in linkAttributes)) {
        html.push('target="',
                  target,
                  '" ');
      }
      html.push('href="',
                url.replace(/"/g, '&quot;'),
                '">');
      addText(text);
      html.push('</a>');
    }
  };
}]);


})(window, window.angular);
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJhbmd1bGFyLXNhbml0aXplLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBAbGljZW5zZSBBbmd1bGFySlMgdjEuNS44XHJcbiAqIChjKSAyMDEwLTIwMTYgR29vZ2xlLCBJbmMuIGh0dHA6Ly9hbmd1bGFyanMub3JnXHJcbiAqIExpY2Vuc2U6IE1JVFxyXG4gKi9cclxuKGZ1bmN0aW9uKHdpbmRvdywgYW5ndWxhcikgeyd1c2Ugc3RyaWN0JztcclxuXHJcbi8qICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICpcclxuICogICAgIEFueSBjb21taXRzIHRvIHRoaXMgZmlsZSBzaG91bGQgYmUgcmV2aWV3ZWQgd2l0aCBzZWN1cml0eSBpbiBtaW5kLiAgKlxyXG4gKiAgIENoYW5nZXMgdG8gdGhpcyBmaWxlIGNhbiBwb3RlbnRpYWxseSBjcmVhdGUgc2VjdXJpdHkgdnVsbmVyYWJpbGl0aWVzLiAqXHJcbiAqICAgICAgICAgIEFuIGFwcHJvdmFsIGZyb20gMiBDb3JlIG1lbWJlcnMgd2l0aCBoaXN0b3J5IG9mIG1vZGlmeWluZyAgICAgICpcclxuICogICAgICAgICAgICAgICAgICAgICAgICAgdGhpcyBmaWxlIGlzIHJlcXVpcmVkLiAgICAgICAgICAgICAgICAgICAgICAgICAgKlxyXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXHJcbiAqICBEb2VzIHRoZSBjaGFuZ2Ugc29tZWhvdyBhbGxvdyBmb3IgYXJiaXRyYXJ5IGphdmFzY3JpcHQgdG8gYmUgZXhlY3V0ZWQ/ICpcclxuICogICAgT3IgYWxsb3dzIGZvciBzb21lb25lIHRvIGNoYW5nZSB0aGUgcHJvdG90eXBlIG9mIGJ1aWx0LWluIG9iamVjdHM/ICAgKlxyXG4gKiAgICAgT3IgZ2l2ZXMgdW5kZXNpcmVkIGFjY2VzcyB0byB2YXJpYWJsZXMgbGlrZXMgZG9jdW1lbnQgb3Igd2luZG93PyAgICAqXHJcbiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICovXHJcblxyXG52YXIgJHNhbml0aXplTWluRXJyID0gYW5ndWxhci4kJG1pbkVycignJHNhbml0aXplJyk7XHJcbnZhciBiaW5kO1xyXG52YXIgZXh0ZW5kO1xyXG52YXIgZm9yRWFjaDtcclxudmFyIGlzRGVmaW5lZDtcclxudmFyIGxvd2VyY2FzZTtcclxudmFyIG5vb3A7XHJcbnZhciBodG1sUGFyc2VyO1xyXG52YXIgaHRtbFNhbml0aXplV3JpdGVyO1xyXG5cclxuLyoqXHJcbiAqIEBuZ2RvYyBtb2R1bGVcclxuICogQG5hbWUgbmdTYW5pdGl6ZVxyXG4gKiBAZGVzY3JpcHRpb25cclxuICpcclxuICogIyBuZ1Nhbml0aXplXHJcbiAqXHJcbiAqIFRoZSBgbmdTYW5pdGl6ZWAgbW9kdWxlIHByb3ZpZGVzIGZ1bmN0aW9uYWxpdHkgdG8gc2FuaXRpemUgSFRNTC5cclxuICpcclxuICpcclxuICogPGRpdiBkb2MtbW9kdWxlLWNvbXBvbmVudHM9XCJuZ1Nhbml0aXplXCI+PC9kaXY+XHJcbiAqXHJcbiAqIFNlZSB7QGxpbmsgbmdTYW5pdGl6ZS4kc2FuaXRpemUgYCRzYW5pdGl6ZWB9IGZvciB1c2FnZS5cclxuICovXHJcblxyXG4vKipcclxuICogQG5nZG9jIHNlcnZpY2VcclxuICogQG5hbWUgJHNhbml0aXplXHJcbiAqIEBraW5kIGZ1bmN0aW9uXHJcbiAqXHJcbiAqIEBkZXNjcmlwdGlvblxyXG4gKiAgIFNhbml0aXplcyBhbiBodG1sIHN0cmluZyBieSBzdHJpcHBpbmcgYWxsIHBvdGVudGlhbGx5IGRhbmdlcm91cyB0b2tlbnMuXHJcbiAqXHJcbiAqICAgVGhlIGlucHV0IGlzIHNhbml0aXplZCBieSBwYXJzaW5nIHRoZSBIVE1MIGludG8gdG9rZW5zLiBBbGwgc2FmZSB0b2tlbnMgKGZyb20gYSB3aGl0ZWxpc3QpIGFyZVxyXG4gKiAgIHRoZW4gc2VyaWFsaXplZCBiYWNrIHRvIHByb3Blcmx5IGVzY2FwZWQgaHRtbCBzdHJpbmcuIFRoaXMgbWVhbnMgdGhhdCBubyB1bnNhZmUgaW5wdXQgY2FuIG1ha2VcclxuICogICBpdCBpbnRvIHRoZSByZXR1cm5lZCBzdHJpbmcuXHJcbiAqXHJcbiAqICAgVGhlIHdoaXRlbGlzdCBmb3IgVVJMIHNhbml0aXphdGlvbiBvZiBhdHRyaWJ1dGUgdmFsdWVzIGlzIGNvbmZpZ3VyZWQgdXNpbmcgdGhlIGZ1bmN0aW9uc1xyXG4gKiAgIGBhSHJlZlNhbml0aXphdGlvbldoaXRlbGlzdGAgYW5kIGBpbWdTcmNTYW5pdGl6YXRpb25XaGl0ZWxpc3RgIG9mIHtAbGluayBuZy4kY29tcGlsZVByb3ZpZGVyXHJcbiAqICAgYCRjb21waWxlUHJvdmlkZXJgfS5cclxuICpcclxuICogICBUaGUgaW5wdXQgbWF5IGFsc28gY29udGFpbiBTVkcgbWFya3VwIGlmIHRoaXMgaXMgZW5hYmxlZCB2aWEge0BsaW5rICRzYW5pdGl6ZVByb3ZpZGVyfS5cclxuICpcclxuICogQHBhcmFtIHtzdHJpbmd9IGh0bWwgSFRNTCBpbnB1dC5cclxuICogQHJldHVybnMge3N0cmluZ30gU2FuaXRpemVkIEhUTUwuXHJcbiAqXHJcbiAqIEBleGFtcGxlXHJcbiAgIDxleGFtcGxlIG1vZHVsZT1cInNhbml0aXplRXhhbXBsZVwiIGRlcHM9XCJhbmd1bGFyLXNhbml0aXplLmpzXCI+XHJcbiAgIDxmaWxlIG5hbWU9XCJpbmRleC5odG1sXCI+XHJcbiAgICAgPHNjcmlwdD5cclxuICAgICAgICAgYW5ndWxhci5tb2R1bGUoJ3Nhbml0aXplRXhhbXBsZScsIFsnbmdTYW5pdGl6ZSddKVxyXG4gICAgICAgICAgIC5jb250cm9sbGVyKCdFeGFtcGxlQ29udHJvbGxlcicsIFsnJHNjb3BlJywgJyRzY2UnLCBmdW5jdGlvbigkc2NvcGUsICRzY2UpIHtcclxuICAgICAgICAgICAgICRzY29wZS5zbmlwcGV0ID1cclxuICAgICAgICAgICAgICAgJzxwIHN0eWxlPVwiY29sb3I6Ymx1ZVwiPmFuIGh0bWxcXG4nICtcclxuICAgICAgICAgICAgICAgJzxlbSBvbm1vdXNlb3Zlcj1cInRoaXMudGV4dENvbnRlbnQ9XFwnUFdOM0QhXFwnXCI+Y2xpY2sgaGVyZTwvZW0+XFxuJyArXHJcbiAgICAgICAgICAgICAgICdzbmlwcGV0PC9wPic7XHJcbiAgICAgICAgICAgICAkc2NvcGUuZGVsaWJlcmF0ZWx5VHJ1c3REYW5nZXJvdXNTbmlwcGV0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgIHJldHVybiAkc2NlLnRydXN0QXNIdG1sKCRzY29wZS5zbmlwcGV0KTtcclxuICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgfV0pO1xyXG4gICAgIDwvc2NyaXB0PlxyXG4gICAgIDxkaXYgbmctY29udHJvbGxlcj1cIkV4YW1wbGVDb250cm9sbGVyXCI+XHJcbiAgICAgICAgU25pcHBldDogPHRleHRhcmVhIG5nLW1vZGVsPVwic25pcHBldFwiIGNvbHM9XCI2MFwiIHJvd3M9XCIzXCI+PC90ZXh0YXJlYT5cclxuICAgICAgIDx0YWJsZT5cclxuICAgICAgICAgPHRyPlxyXG4gICAgICAgICAgIDx0ZD5EaXJlY3RpdmU8L3RkPlxyXG4gICAgICAgICAgIDx0ZD5Ib3c8L3RkPlxyXG4gICAgICAgICAgIDx0ZD5Tb3VyY2U8L3RkPlxyXG4gICAgICAgICAgIDx0ZD5SZW5kZXJlZDwvdGQ+XHJcbiAgICAgICAgIDwvdHI+XHJcbiAgICAgICAgIDx0ciBpZD1cImJpbmQtaHRtbC13aXRoLXNhbml0aXplXCI+XHJcbiAgICAgICAgICAgPHRkPm5nLWJpbmQtaHRtbDwvdGQ+XHJcbiAgICAgICAgICAgPHRkPkF1dG9tYXRpY2FsbHkgdXNlcyAkc2FuaXRpemU8L3RkPlxyXG4gICAgICAgICAgIDx0ZD48cHJlPiZsdDtkaXYgbmctYmluZC1odG1sPVwic25pcHBldFwiJmd0Ozxici8+Jmx0Oy9kaXYmZ3Q7PC9wcmU+PC90ZD5cclxuICAgICAgICAgICA8dGQ+PGRpdiBuZy1iaW5kLWh0bWw9XCJzbmlwcGV0XCI+PC9kaXY+PC90ZD5cclxuICAgICAgICAgPC90cj5cclxuICAgICAgICAgPHRyIGlkPVwiYmluZC1odG1sLXdpdGgtdHJ1c3RcIj5cclxuICAgICAgICAgICA8dGQ+bmctYmluZC1odG1sPC90ZD5cclxuICAgICAgICAgICA8dGQ+QnlwYXNzICRzYW5pdGl6ZSBieSBleHBsaWNpdGx5IHRydXN0aW5nIHRoZSBkYW5nZXJvdXMgdmFsdWU8L3RkPlxyXG4gICAgICAgICAgIDx0ZD5cclxuICAgICAgICAgICA8cHJlPiZsdDtkaXYgbmctYmluZC1odG1sPVwiZGVsaWJlcmF0ZWx5VHJ1c3REYW5nZXJvdXNTbmlwcGV0KClcIiZndDtcclxuJmx0Oy9kaXYmZ3Q7PC9wcmU+XHJcbiAgICAgICAgICAgPC90ZD5cclxuICAgICAgICAgICA8dGQ+PGRpdiBuZy1iaW5kLWh0bWw9XCJkZWxpYmVyYXRlbHlUcnVzdERhbmdlcm91c1NuaXBwZXQoKVwiPjwvZGl2PjwvdGQ+XHJcbiAgICAgICAgIDwvdHI+XHJcbiAgICAgICAgIDx0ciBpZD1cImJpbmQtZGVmYXVsdFwiPlxyXG4gICAgICAgICAgIDx0ZD5uZy1iaW5kPC90ZD5cclxuICAgICAgICAgICA8dGQ+QXV0b21hdGljYWxseSBlc2NhcGVzPC90ZD5cclxuICAgICAgICAgICA8dGQ+PHByZT4mbHQ7ZGl2IG5nLWJpbmQ9XCJzbmlwcGV0XCImZ3Q7PGJyLz4mbHQ7L2RpdiZndDs8L3ByZT48L3RkPlxyXG4gICAgICAgICAgIDx0ZD48ZGl2IG5nLWJpbmQ9XCJzbmlwcGV0XCI+PC9kaXY+PC90ZD5cclxuICAgICAgICAgPC90cj5cclxuICAgICAgIDwvdGFibGU+XHJcbiAgICAgICA8L2Rpdj5cclxuICAgPC9maWxlPlxyXG4gICA8ZmlsZSBuYW1lPVwicHJvdHJhY3Rvci5qc1wiIHR5cGU9XCJwcm90cmFjdG9yXCI+XHJcbiAgICAgaXQoJ3Nob3VsZCBzYW5pdGl6ZSB0aGUgaHRtbCBzbmlwcGV0IGJ5IGRlZmF1bHQnLCBmdW5jdGlvbigpIHtcclxuICAgICAgIGV4cGVjdChlbGVtZW50KGJ5LmNzcygnI2JpbmQtaHRtbC13aXRoLXNhbml0aXplIGRpdicpKS5nZXRJbm5lckh0bWwoKSkuXHJcbiAgICAgICAgIHRvQmUoJzxwPmFuIGh0bWxcXG48ZW0+Y2xpY2sgaGVyZTwvZW0+XFxuc25pcHBldDwvcD4nKTtcclxuICAgICB9KTtcclxuXHJcbiAgICAgaXQoJ3Nob3VsZCBpbmxpbmUgcmF3IHNuaXBwZXQgaWYgYm91bmQgdG8gYSB0cnVzdGVkIHZhbHVlJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICBleHBlY3QoZWxlbWVudChieS5jc3MoJyNiaW5kLWh0bWwtd2l0aC10cnVzdCBkaXYnKSkuZ2V0SW5uZXJIdG1sKCkpLlxyXG4gICAgICAgICB0b0JlKFwiPHAgc3R5bGU9XFxcImNvbG9yOmJsdWVcXFwiPmFuIGh0bWxcXG5cIiArXHJcbiAgICAgICAgICAgICAgXCI8ZW0gb25tb3VzZW92ZXI9XFxcInRoaXMudGV4dENvbnRlbnQ9J1BXTjNEISdcXFwiPmNsaWNrIGhlcmU8L2VtPlxcblwiICtcclxuICAgICAgICAgICAgICBcInNuaXBwZXQ8L3A+XCIpO1xyXG4gICAgIH0pO1xyXG5cclxuICAgICBpdCgnc2hvdWxkIGVzY2FwZSBzbmlwcGV0IHdpdGhvdXQgYW55IGZpbHRlcicsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgZXhwZWN0KGVsZW1lbnQoYnkuY3NzKCcjYmluZC1kZWZhdWx0IGRpdicpKS5nZXRJbm5lckh0bWwoKSkuXHJcbiAgICAgICAgIHRvQmUoXCImbHQ7cCBzdHlsZT1cXFwiY29sb3I6Ymx1ZVxcXCImZ3Q7YW4gaHRtbFxcblwiICtcclxuICAgICAgICAgICAgICBcIiZsdDtlbSBvbm1vdXNlb3Zlcj1cXFwidGhpcy50ZXh0Q29udGVudD0nUFdOM0QhJ1xcXCImZ3Q7Y2xpY2sgaGVyZSZsdDsvZW0mZ3Q7XFxuXCIgK1xyXG4gICAgICAgICAgICAgIFwic25pcHBldCZsdDsvcCZndDtcIik7XHJcbiAgICAgfSk7XHJcblxyXG4gICAgIGl0KCdzaG91bGQgdXBkYXRlJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICBlbGVtZW50KGJ5Lm1vZGVsKCdzbmlwcGV0JykpLmNsZWFyKCk7XHJcbiAgICAgICBlbGVtZW50KGJ5Lm1vZGVsKCdzbmlwcGV0JykpLnNlbmRLZXlzKCduZXcgPGIgb25jbGljaz1cImFsZXJ0KDEpXCI+dGV4dDwvYj4nKTtcclxuICAgICAgIGV4cGVjdChlbGVtZW50KGJ5LmNzcygnI2JpbmQtaHRtbC13aXRoLXNhbml0aXplIGRpdicpKS5nZXRJbm5lckh0bWwoKSkuXHJcbiAgICAgICAgIHRvQmUoJ25ldyA8Yj50ZXh0PC9iPicpO1xyXG4gICAgICAgZXhwZWN0KGVsZW1lbnQoYnkuY3NzKCcjYmluZC1odG1sLXdpdGgtdHJ1c3QgZGl2JykpLmdldElubmVySHRtbCgpKS50b0JlKFxyXG4gICAgICAgICAnbmV3IDxiIG9uY2xpY2s9XCJhbGVydCgxKVwiPnRleHQ8L2I+Jyk7XHJcbiAgICAgICBleHBlY3QoZWxlbWVudChieS5jc3MoJyNiaW5kLWRlZmF1bHQgZGl2JykpLmdldElubmVySHRtbCgpKS50b0JlKFxyXG4gICAgICAgICBcIm5ldyAmbHQ7YiBvbmNsaWNrPVxcXCJhbGVydCgxKVxcXCImZ3Q7dGV4dCZsdDsvYiZndDtcIik7XHJcbiAgICAgfSk7XHJcbiAgIDwvZmlsZT5cclxuICAgPC9leGFtcGxlPlxyXG4gKi9cclxuXHJcblxyXG4vKipcclxuICogQG5nZG9jIHByb3ZpZGVyXHJcbiAqIEBuYW1lICRzYW5pdGl6ZVByb3ZpZGVyXHJcbiAqXHJcbiAqIEBkZXNjcmlwdGlvblxyXG4gKiBDcmVhdGVzIGFuZCBjb25maWd1cmVzIHtAbGluayAkc2FuaXRpemV9IGluc3RhbmNlLlxyXG4gKi9cclxuZnVuY3Rpb24gJFNhbml0aXplUHJvdmlkZXIoKSB7XHJcbiAgdmFyIHN2Z0VuYWJsZWQgPSBmYWxzZTtcclxuXHJcbiAgdGhpcy4kZ2V0ID0gWyckJHNhbml0aXplVXJpJywgZnVuY3Rpb24oJCRzYW5pdGl6ZVVyaSkge1xyXG4gICAgaWYgKHN2Z0VuYWJsZWQpIHtcclxuICAgICAgZXh0ZW5kKHZhbGlkRWxlbWVudHMsIHN2Z0VsZW1lbnRzKTtcclxuICAgIH1cclxuICAgIHJldHVybiBmdW5jdGlvbihodG1sKSB7XHJcbiAgICAgIHZhciBidWYgPSBbXTtcclxuICAgICAgaHRtbFBhcnNlcihodG1sLCBodG1sU2FuaXRpemVXcml0ZXIoYnVmLCBmdW5jdGlvbih1cmksIGlzSW1hZ2UpIHtcclxuICAgICAgICByZXR1cm4gIS9edW5zYWZlOi8udGVzdCgkJHNhbml0aXplVXJpKHVyaSwgaXNJbWFnZSkpO1xyXG4gICAgICB9KSk7XHJcbiAgICAgIHJldHVybiBidWYuam9pbignJyk7XHJcbiAgICB9O1xyXG4gIH1dO1xyXG5cclxuXHJcbiAgLyoqXHJcbiAgICogQG5nZG9jIG1ldGhvZFxyXG4gICAqIEBuYW1lICRzYW5pdGl6ZVByb3ZpZGVyI2VuYWJsZVN2Z1xyXG4gICAqIEBraW5kIGZ1bmN0aW9uXHJcbiAgICpcclxuICAgKiBAZGVzY3JpcHRpb25cclxuICAgKiBFbmFibGVzIGEgc3Vic2V0IG9mIHN2ZyB0byBiZSBzdXBwb3J0ZWQgYnkgdGhlIHNhbml0aXplci5cclxuICAgKlxyXG4gICAqIDxkaXYgY2xhc3M9XCJhbGVydCBhbGVydC13YXJuaW5nXCI+XHJcbiAgICogICA8cD5CeSBlbmFibGluZyB0aGlzIHNldHRpbmcgd2l0aG91dCB0YWtpbmcgb3RoZXIgcHJlY2F1dGlvbnMsIHlvdSBtaWdodCBleHBvc2UgeW91clxyXG4gICAqICAgYXBwbGljYXRpb24gdG8gY2xpY2staGlqYWNraW5nIGF0dGFja3MuIEluIHRoZXNlIGF0dGFja3MsIHNhbml0aXplZCBzdmcgZWxlbWVudHMgY291bGQgYmUgcG9zaXRpb25lZFxyXG4gICAqICAgb3V0c2lkZSBvZiB0aGUgY29udGFpbmluZyBlbGVtZW50IGFuZCBiZSByZW5kZXJlZCBvdmVyIG90aGVyIGVsZW1lbnRzIG9uIHRoZSBwYWdlIChlLmcuIGEgbG9naW5cclxuICAgKiAgIGxpbmspLiBTdWNoIGJlaGF2aW9yIGNhbiB0aGVuIHJlc3VsdCBpbiBwaGlzaGluZyBpbmNpZGVudHMuPC9wPlxyXG4gICAqXHJcbiAgICogICA8cD5UbyBwcm90ZWN0IGFnYWluc3QgdGhlc2UsIGV4cGxpY2l0bHkgc2V0dXAgYG92ZXJmbG93OiBoaWRkZW5gIGNzcyBydWxlIGZvciBhbGwgcG90ZW50aWFsIHN2Z1xyXG4gICAqICAgdGFncyB3aXRoaW4gdGhlIHNhbml0aXplZCBjb250ZW50OjwvcD5cclxuICAgKlxyXG4gICAqICAgPGJyPlxyXG4gICAqXHJcbiAgICogICA8cHJlPjxjb2RlPlxyXG4gICAqICAgLnJvb3RPZlRoZUluY2x1ZGVkQ29udGVudCBzdmcge1xyXG4gICAqICAgICBvdmVyZmxvdzogaGlkZGVuICFpbXBvcnRhbnQ7XHJcbiAgICogICB9XHJcbiAgICogICA8L2NvZGU+PC9wcmU+XHJcbiAgICogPC9kaXY+XHJcbiAgICpcclxuICAgKiBAcGFyYW0ge2Jvb2xlYW49fSBmbGFnIEVuYWJsZSBvciBkaXNhYmxlIFNWRyBzdXBwb3J0IGluIHRoZSBzYW5pdGl6ZXIuXHJcbiAgICogQHJldHVybnMge2Jvb2xlYW58bmcuJHNhbml0aXplUHJvdmlkZXJ9IFJldHVybnMgdGhlIGN1cnJlbnRseSBjb25maWd1cmVkIHZhbHVlIGlmIGNhbGxlZFxyXG4gICAqICAgIHdpdGhvdXQgYW4gYXJndW1lbnQgb3Igc2VsZiBmb3IgY2hhaW5pbmcgb3RoZXJ3aXNlLlxyXG4gICAqL1xyXG4gIHRoaXMuZW5hYmxlU3ZnID0gZnVuY3Rpb24oZW5hYmxlU3ZnKSB7XHJcbiAgICBpZiAoaXNEZWZpbmVkKGVuYWJsZVN2ZykpIHtcclxuICAgICAgc3ZnRW5hYmxlZCA9IGVuYWJsZVN2ZztcclxuICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICByZXR1cm4gc3ZnRW5hYmxlZDtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xyXG4gIC8vIFByaXZhdGUgc3R1ZmZcclxuICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xyXG5cclxuICBiaW5kID0gYW5ndWxhci5iaW5kO1xyXG4gIGV4dGVuZCA9IGFuZ3VsYXIuZXh0ZW5kO1xyXG4gIGZvckVhY2ggPSBhbmd1bGFyLmZvckVhY2g7XHJcbiAgaXNEZWZpbmVkID0gYW5ndWxhci5pc0RlZmluZWQ7XHJcbiAgbG93ZXJjYXNlID0gYW5ndWxhci5sb3dlcmNhc2U7XHJcbiAgbm9vcCA9IGFuZ3VsYXIubm9vcDtcclxuXHJcbiAgaHRtbFBhcnNlciA9IGh0bWxQYXJzZXJJbXBsO1xyXG4gIGh0bWxTYW5pdGl6ZVdyaXRlciA9IGh0bWxTYW5pdGl6ZVdyaXRlckltcGw7XHJcblxyXG4gIC8vIFJlZ3VsYXIgRXhwcmVzc2lvbnMgZm9yIHBhcnNpbmcgdGFncyBhbmQgYXR0cmlidXRlc1xyXG4gIHZhciBTVVJST0dBVEVfUEFJUl9SRUdFWFAgPSAvW1xcdUQ4MDAtXFx1REJGRl1bXFx1REMwMC1cXHVERkZGXS9nLFxyXG4gICAgLy8gTWF0Y2ggZXZlcnl0aGluZyBvdXRzaWRlIG9mIG5vcm1hbCBjaGFycyBhbmQgXCIgKHF1b3RlIGNoYXJhY3RlcilcclxuICAgIE5PTl9BTFBIQU5VTUVSSUNfUkVHRVhQID0gLyhbXlxcIy1+IHwhXSkvZztcclxuXHJcblxyXG4gIC8vIEdvb2Qgc291cmNlIG9mIGluZm8gYWJvdXQgZWxlbWVudHMgYW5kIGF0dHJpYnV0ZXNcclxuICAvLyBodHRwOi8vZGV2LnczLm9yZy9odG1sNS9zcGVjL092ZXJ2aWV3Lmh0bWwjc2VtYW50aWNzXHJcbiAgLy8gaHR0cDovL3NpbW9uLmh0bWw1Lm9yZy9odG1sLWVsZW1lbnRzXHJcblxyXG4gIC8vIFNhZmUgVm9pZCBFbGVtZW50cyAtIEhUTUw1XHJcbiAgLy8gaHR0cDovL2Rldi53My5vcmcvaHRtbDUvc3BlYy9PdmVydmlldy5odG1sI3ZvaWQtZWxlbWVudHNcclxuICB2YXIgdm9pZEVsZW1lbnRzID0gdG9NYXAoXCJhcmVhLGJyLGNvbCxocixpbWcsd2JyXCIpO1xyXG5cclxuICAvLyBFbGVtZW50cyB0aGF0IHlvdSBjYW4sIGludGVudGlvbmFsbHksIGxlYXZlIG9wZW4gKGFuZCB3aGljaCBjbG9zZSB0aGVtc2VsdmVzKVxyXG4gIC8vIGh0dHA6Ly9kZXYudzMub3JnL2h0bWw1L3NwZWMvT3ZlcnZpZXcuaHRtbCNvcHRpb25hbC10YWdzXHJcbiAgdmFyIG9wdGlvbmFsRW5kVGFnQmxvY2tFbGVtZW50cyA9IHRvTWFwKFwiY29sZ3JvdXAsZGQsZHQsbGkscCx0Ym9keSx0ZCx0Zm9vdCx0aCx0aGVhZCx0clwiKSxcclxuICAgICAgb3B0aW9uYWxFbmRUYWdJbmxpbmVFbGVtZW50cyA9IHRvTWFwKFwicnAscnRcIiksXHJcbiAgICAgIG9wdGlvbmFsRW5kVGFnRWxlbWVudHMgPSBleHRlbmQoe30sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcHRpb25hbEVuZFRhZ0lubGluZUVsZW1lbnRzLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uYWxFbmRUYWdCbG9ja0VsZW1lbnRzKTtcclxuXHJcbiAgLy8gU2FmZSBCbG9jayBFbGVtZW50cyAtIEhUTUw1XHJcbiAgdmFyIGJsb2NrRWxlbWVudHMgPSBleHRlbmQoe30sIG9wdGlvbmFsRW5kVGFnQmxvY2tFbGVtZW50cywgdG9NYXAoXCJhZGRyZXNzLGFydGljbGUsXCIgK1xyXG4gICAgICAgICAgXCJhc2lkZSxibG9ja3F1b3RlLGNhcHRpb24sY2VudGVyLGRlbCxkaXIsZGl2LGRsLGZpZ3VyZSxmaWdjYXB0aW9uLGZvb3RlcixoMSxoMixoMyxoNCxoNSxcIiArXHJcbiAgICAgICAgICBcImg2LGhlYWRlcixoZ3JvdXAsaHIsaW5zLG1hcCxtZW51LG5hdixvbCxwcmUsc2VjdGlvbix0YWJsZSx1bFwiKSk7XHJcblxyXG4gIC8vIElubGluZSBFbGVtZW50cyAtIEhUTUw1XHJcbiAgdmFyIGlubGluZUVsZW1lbnRzID0gZXh0ZW5kKHt9LCBvcHRpb25hbEVuZFRhZ0lubGluZUVsZW1lbnRzLCB0b01hcChcImEsYWJicixhY3JvbnltLGIsXCIgK1xyXG4gICAgICAgICAgXCJiZGksYmRvLGJpZyxicixjaXRlLGNvZGUsZGVsLGRmbixlbSxmb250LGksaW1nLGlucyxrYmQsbGFiZWwsbWFwLG1hcmsscSxydWJ5LHJwLHJ0LHMsXCIgK1xyXG4gICAgICAgICAgXCJzYW1wLHNtYWxsLHNwYW4sc3RyaWtlLHN0cm9uZyxzdWIsc3VwLHRpbWUsdHQsdSx2YXJcIikpO1xyXG5cclxuICAvLyBTVkcgRWxlbWVudHNcclxuICAvLyBodHRwczovL3dpa2kud2hhdHdnLm9yZy93aWtpL1Nhbml0aXphdGlvbl9ydWxlcyNzdmdfRWxlbWVudHNcclxuICAvLyBOb3RlOiB0aGUgZWxlbWVudHMgYW5pbWF0ZSxhbmltYXRlQ29sb3IsYW5pbWF0ZU1vdGlvbixhbmltYXRlVHJhbnNmb3JtLHNldCBhcmUgaW50ZW50aW9uYWxseSBvbWl0dGVkLlxyXG4gIC8vIFRoZXkgY2FuIHBvdGVudGlhbGx5IGFsbG93IGZvciBhcmJpdHJhcnkgamF2YXNjcmlwdCB0byBiZSBleGVjdXRlZC4gU2VlICMxMTI5MFxyXG4gIHZhciBzdmdFbGVtZW50cyA9IHRvTWFwKFwiY2lyY2xlLGRlZnMsZGVzYyxlbGxpcHNlLGZvbnQtZmFjZSxmb250LWZhY2UtbmFtZSxmb250LWZhY2Utc3JjLGcsZ2x5cGgsXCIgK1xyXG4gICAgICAgICAgXCJoa2VybixpbWFnZSxsaW5lYXJHcmFkaWVudCxsaW5lLG1hcmtlcixtZXRhZGF0YSxtaXNzaW5nLWdseXBoLG1wYXRoLHBhdGgscG9seWdvbixwb2x5bGluZSxcIiArXHJcbiAgICAgICAgICBcInJhZGlhbEdyYWRpZW50LHJlY3Qsc3RvcCxzdmcsc3dpdGNoLHRleHQsdGl0bGUsdHNwYW5cIik7XHJcblxyXG4gIC8vIEJsb2NrZWQgRWxlbWVudHMgKHdpbGwgYmUgc3RyaXBwZWQpXHJcbiAgdmFyIGJsb2NrZWRFbGVtZW50cyA9IHRvTWFwKFwic2NyaXB0LHN0eWxlXCIpO1xyXG5cclxuICB2YXIgdmFsaWRFbGVtZW50cyA9IGV4dGVuZCh7fSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZvaWRFbGVtZW50cyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJsb2NrRWxlbWVudHMsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmxpbmVFbGVtZW50cyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbmFsRW5kVGFnRWxlbWVudHMpO1xyXG5cclxuICAvL0F0dHJpYnV0ZXMgdGhhdCBoYXZlIGhyZWYgYW5kIGhlbmNlIG5lZWQgdG8gYmUgc2FuaXRpemVkXHJcbiAgdmFyIHVyaUF0dHJzID0gdG9NYXAoXCJiYWNrZ3JvdW5kLGNpdGUsaHJlZixsb25nZGVzYyxzcmMseGxpbms6aHJlZlwiKTtcclxuXHJcbiAgdmFyIGh0bWxBdHRycyA9IHRvTWFwKCdhYmJyLGFsaWduLGFsdCxheGlzLGJnY29sb3IsYm9yZGVyLGNlbGxwYWRkaW5nLGNlbGxzcGFjaW5nLGNsYXNzLGNsZWFyLCcgK1xyXG4gICAgICAnY29sb3IsY29scyxjb2xzcGFuLGNvbXBhY3QsY29vcmRzLGRpcixmYWNlLGhlYWRlcnMsaGVpZ2h0LGhyZWZsYW5nLGhzcGFjZSwnICtcclxuICAgICAgJ2lzbWFwLGxhbmcsbGFuZ3VhZ2Usbm9ocmVmLG5vd3JhcCxyZWwscmV2LHJvd3Mscm93c3BhbixydWxlcywnICtcclxuICAgICAgJ3Njb3BlLHNjcm9sbGluZyxzaGFwZSxzaXplLHNwYW4sc3RhcnQsc3VtbWFyeSx0YWJpbmRleCx0YXJnZXQsdGl0bGUsdHlwZSwnICtcclxuICAgICAgJ3ZhbGlnbix2YWx1ZSx2c3BhY2Usd2lkdGgnKTtcclxuXHJcbiAgLy8gU1ZHIGF0dHJpYnV0ZXMgKHdpdGhvdXQgXCJpZFwiIGFuZCBcIm5hbWVcIiBhdHRyaWJ1dGVzKVxyXG4gIC8vIGh0dHBzOi8vd2lraS53aGF0d2cub3JnL3dpa2kvU2FuaXRpemF0aW9uX3J1bGVzI3N2Z19BdHRyaWJ1dGVzXHJcbiAgdmFyIHN2Z0F0dHJzID0gdG9NYXAoJ2FjY2VudC1oZWlnaHQsYWNjdW11bGF0ZSxhZGRpdGl2ZSxhbHBoYWJldGljLGFyYWJpYy1mb3JtLGFzY2VudCwnICtcclxuICAgICAgJ2Jhc2VQcm9maWxlLGJib3gsYmVnaW4sYnksY2FsY01vZGUsY2FwLWhlaWdodCxjbGFzcyxjb2xvcixjb2xvci1yZW5kZXJpbmcsY29udGVudCwnICtcclxuICAgICAgJ2N4LGN5LGQsZHgsZHksZGVzY2VudCxkaXNwbGF5LGR1cixlbmQsZmlsbCxmaWxsLXJ1bGUsZm9udC1mYW1pbHksZm9udC1zaXplLGZvbnQtc3RyZXRjaCwnICtcclxuICAgICAgJ2ZvbnQtc3R5bGUsZm9udC12YXJpYW50LGZvbnQtd2VpZ2h0LGZyb20sZngsZnksZzEsZzIsZ2x5cGgtbmFtZSxncmFkaWVudFVuaXRzLGhhbmdpbmcsJyArXHJcbiAgICAgICdoZWlnaHQsaG9yaXotYWR2LXgsaG9yaXotb3JpZ2luLXgsaWRlb2dyYXBoaWMsayxrZXlQb2ludHMsa2V5U3BsaW5lcyxrZXlUaW1lcyxsYW5nLCcgK1xyXG4gICAgICAnbWFya2VyLWVuZCxtYXJrZXItbWlkLG1hcmtlci1zdGFydCxtYXJrZXJIZWlnaHQsbWFya2VyVW5pdHMsbWFya2VyV2lkdGgsbWF0aGVtYXRpY2FsLCcgK1xyXG4gICAgICAnbWF4LG1pbixvZmZzZXQsb3BhY2l0eSxvcmllbnQsb3JpZ2luLG92ZXJsaW5lLXBvc2l0aW9uLG92ZXJsaW5lLXRoaWNrbmVzcyxwYW5vc2UtMSwnICtcclxuICAgICAgJ3BhdGgscGF0aExlbmd0aCxwb2ludHMscHJlc2VydmVBc3BlY3RSYXRpbyxyLHJlZlgscmVmWSxyZXBlYXRDb3VudCxyZXBlYXREdXIsJyArXHJcbiAgICAgICdyZXF1aXJlZEV4dGVuc2lvbnMscmVxdWlyZWRGZWF0dXJlcyxyZXN0YXJ0LHJvdGF0ZSxyeCxyeSxzbG9wZSxzdGVtaCxzdGVtdixzdG9wLWNvbG9yLCcgK1xyXG4gICAgICAnc3RvcC1vcGFjaXR5LHN0cmlrZXRocm91Z2gtcG9zaXRpb24sc3RyaWtldGhyb3VnaC10aGlja25lc3Msc3Ryb2tlLHN0cm9rZS1kYXNoYXJyYXksJyArXHJcbiAgICAgICdzdHJva2UtZGFzaG9mZnNldCxzdHJva2UtbGluZWNhcCxzdHJva2UtbGluZWpvaW4sc3Ryb2tlLW1pdGVybGltaXQsc3Ryb2tlLW9wYWNpdHksJyArXHJcbiAgICAgICdzdHJva2Utd2lkdGgsc3lzdGVtTGFuZ3VhZ2UsdGFyZ2V0LHRleHQtYW5jaG9yLHRvLHRyYW5zZm9ybSx0eXBlLHUxLHUyLHVuZGVybGluZS1wb3NpdGlvbiwnICtcclxuICAgICAgJ3VuZGVybGluZS10aGlja25lc3MsdW5pY29kZSx1bmljb2RlLXJhbmdlLHVuaXRzLXBlci1lbSx2YWx1ZXMsdmVyc2lvbix2aWV3Qm94LHZpc2liaWxpdHksJyArXHJcbiAgICAgICd3aWR0aCx3aWR0aHMseCx4LWhlaWdodCx4MSx4Mix4bGluazphY3R1YXRlLHhsaW5rOmFyY3JvbGUseGxpbms6cm9sZSx4bGluazpzaG93LHhsaW5rOnRpdGxlLCcgK1xyXG4gICAgICAneGxpbms6dHlwZSx4bWw6YmFzZSx4bWw6bGFuZyx4bWw6c3BhY2UseG1sbnMseG1sbnM6eGxpbmsseSx5MSx5Mix6b29tQW5kUGFuJywgdHJ1ZSk7XHJcblxyXG4gIHZhciB2YWxpZEF0dHJzID0gZXh0ZW5kKHt9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXJpQXR0cnMsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdmdBdHRycyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGh0bWxBdHRycyk7XHJcblxyXG4gIGZ1bmN0aW9uIHRvTWFwKHN0ciwgbG93ZXJjYXNlS2V5cykge1xyXG4gICAgdmFyIG9iaiA9IHt9LCBpdGVtcyA9IHN0ci5zcGxpdCgnLCcpLCBpO1xyXG4gICAgZm9yIChpID0gMDsgaSA8IGl0ZW1zLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIG9ialtsb3dlcmNhc2VLZXlzID8gbG93ZXJjYXNlKGl0ZW1zW2ldKSA6IGl0ZW1zW2ldXSA9IHRydWU7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gb2JqO1xyXG4gIH1cclxuXHJcbiAgdmFyIGluZXJ0Qm9keUVsZW1lbnQ7XHJcbiAgKGZ1bmN0aW9uKHdpbmRvdykge1xyXG4gICAgdmFyIGRvYztcclxuICAgIGlmICh3aW5kb3cuZG9jdW1lbnQgJiYgd2luZG93LmRvY3VtZW50LmltcGxlbWVudGF0aW9uKSB7XHJcbiAgICAgIGRvYyA9IHdpbmRvdy5kb2N1bWVudC5pbXBsZW1lbnRhdGlvbi5jcmVhdGVIVE1MRG9jdW1lbnQoXCJpbmVydFwiKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRocm93ICRzYW5pdGl6ZU1pbkVycignbm9pbmVydCcsIFwiQ2FuJ3QgY3JlYXRlIGFuIGluZXJ0IGh0bWwgZG9jdW1lbnRcIik7XHJcbiAgICB9XHJcbiAgICB2YXIgZG9jRWxlbWVudCA9IGRvYy5kb2N1bWVudEVsZW1lbnQgfHwgZG9jLmdldERvY3VtZW50RWxlbWVudCgpO1xyXG4gICAgdmFyIGJvZHlFbGVtZW50cyA9IGRvY0VsZW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2JvZHknKTtcclxuXHJcbiAgICAvLyB1c3VhbGx5IHRoZXJlIHNob3VsZCBiZSBvbmx5IG9uZSBib2R5IGVsZW1lbnQgaW4gdGhlIGRvY3VtZW50LCBidXQgSUUgZG9lc24ndCBoYXZlIGFueSwgc28gd2UgbmVlZCB0byBjcmVhdGUgb25lXHJcbiAgICBpZiAoYm9keUVsZW1lbnRzLmxlbmd0aCA9PT0gMSkge1xyXG4gICAgICBpbmVydEJvZHlFbGVtZW50ID0gYm9keUVsZW1lbnRzWzBdO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdmFyIGh0bWwgPSBkb2MuY3JlYXRlRWxlbWVudCgnaHRtbCcpO1xyXG4gICAgICBpbmVydEJvZHlFbGVtZW50ID0gZG9jLmNyZWF0ZUVsZW1lbnQoJ2JvZHknKTtcclxuICAgICAgaHRtbC5hcHBlbmRDaGlsZChpbmVydEJvZHlFbGVtZW50KTtcclxuICAgICAgZG9jLmFwcGVuZENoaWxkKGh0bWwpO1xyXG4gICAgfVxyXG4gIH0pKHdpbmRvdyk7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBleGFtcGxlXHJcbiAgICogaHRtbFBhcnNlcihodG1sU3RyaW5nLCB7XHJcbiAgICogICAgIHN0YXJ0OiBmdW5jdGlvbih0YWcsIGF0dHJzKSB7fSxcclxuICAgKiAgICAgZW5kOiBmdW5jdGlvbih0YWcpIHt9LFxyXG4gICAqICAgICBjaGFyczogZnVuY3Rpb24odGV4dCkge30sXHJcbiAgICogICAgIGNvbW1lbnQ6IGZ1bmN0aW9uKHRleHQpIHt9XHJcbiAgICogfSk7XHJcbiAgICpcclxuICAgKiBAcGFyYW0ge3N0cmluZ30gaHRtbCBzdHJpbmdcclxuICAgKiBAcGFyYW0ge29iamVjdH0gaGFuZGxlclxyXG4gICAqL1xyXG4gIGZ1bmN0aW9uIGh0bWxQYXJzZXJJbXBsKGh0bWwsIGhhbmRsZXIpIHtcclxuICAgIGlmIChodG1sID09PSBudWxsIHx8IGh0bWwgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICBodG1sID0gJyc7XHJcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBodG1sICE9PSAnc3RyaW5nJykge1xyXG4gICAgICBodG1sID0gJycgKyBodG1sO1xyXG4gICAgfVxyXG4gICAgaW5lcnRCb2R5RWxlbWVudC5pbm5lckhUTUwgPSBodG1sO1xyXG5cclxuICAgIC8vbVhTUyBwcm90ZWN0aW9uXHJcbiAgICB2YXIgbVhTU0F0dGVtcHRzID0gNTtcclxuICAgIGRvIHtcclxuICAgICAgaWYgKG1YU1NBdHRlbXB0cyA9PT0gMCkge1xyXG4gICAgICAgIHRocm93ICRzYW5pdGl6ZU1pbkVycigndWlucHV0JywgXCJGYWlsZWQgdG8gc2FuaXRpemUgaHRtbCBiZWNhdXNlIHRoZSBpbnB1dCBpcyB1bnN0YWJsZVwiKTtcclxuICAgICAgfVxyXG4gICAgICBtWFNTQXR0ZW1wdHMtLTtcclxuXHJcbiAgICAgIC8vIHN0cmlwIGN1c3RvbS1uYW1lc3BhY2VkIGF0dHJpYnV0ZXMgb24gSUU8PTExXHJcbiAgICAgIGlmICh3aW5kb3cuZG9jdW1lbnQuZG9jdW1lbnRNb2RlKSB7XHJcbiAgICAgICAgc3RyaXBDdXN0b21Oc0F0dHJzKGluZXJ0Qm9keUVsZW1lbnQpO1xyXG4gICAgICB9XHJcbiAgICAgIGh0bWwgPSBpbmVydEJvZHlFbGVtZW50LmlubmVySFRNTDsgLy90cmlnZ2VyIG1YU1NcclxuICAgICAgaW5lcnRCb2R5RWxlbWVudC5pbm5lckhUTUwgPSBodG1sO1xyXG4gICAgfSB3aGlsZSAoaHRtbCAhPT0gaW5lcnRCb2R5RWxlbWVudC5pbm5lckhUTUwpO1xyXG5cclxuICAgIHZhciBub2RlID0gaW5lcnRCb2R5RWxlbWVudC5maXJzdENoaWxkO1xyXG4gICAgd2hpbGUgKG5vZGUpIHtcclxuICAgICAgc3dpdGNoIChub2RlLm5vZGVUeXBlKSB7XHJcbiAgICAgICAgY2FzZSAxOiAvLyBFTEVNRU5UX05PREVcclxuICAgICAgICAgIGhhbmRsZXIuc3RhcnQobm9kZS5ub2RlTmFtZS50b0xvd2VyQ2FzZSgpLCBhdHRyVG9NYXAobm9kZS5hdHRyaWJ1dGVzKSk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIDM6IC8vIFRFWFQgTk9ERVxyXG4gICAgICAgICAgaGFuZGxlci5jaGFycyhub2RlLnRleHRDb250ZW50KTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB2YXIgbmV4dE5vZGU7XHJcbiAgICAgIGlmICghKG5leHROb2RlID0gbm9kZS5maXJzdENoaWxkKSkge1xyXG4gICAgICBpZiAobm9kZS5ub2RlVHlwZSA9PSAxKSB7XHJcbiAgICAgICAgICBoYW5kbGVyLmVuZChub2RlLm5vZGVOYW1lLnRvTG93ZXJDYXNlKCkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBuZXh0Tm9kZSA9IG5vZGUubmV4dFNpYmxpbmc7XHJcbiAgICAgICAgaWYgKCFuZXh0Tm9kZSkge1xyXG4gICAgICAgICAgd2hpbGUgKG5leHROb2RlID09IG51bGwpIHtcclxuICAgICAgICAgICAgbm9kZSA9IG5vZGUucGFyZW50Tm9kZTtcclxuICAgICAgICAgICAgaWYgKG5vZGUgPT09IGluZXJ0Qm9keUVsZW1lbnQpIGJyZWFrO1xyXG4gICAgICAgICAgICBuZXh0Tm9kZSA9IG5vZGUubmV4dFNpYmxpbmc7XHJcbiAgICAgICAgICBpZiAobm9kZS5ub2RlVHlwZSA9PSAxKSB7XHJcbiAgICAgICAgICAgICAgaGFuZGxlci5lbmQobm9kZS5ub2RlTmFtZS50b0xvd2VyQ2FzZSgpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBub2RlID0gbmV4dE5vZGU7XHJcbiAgICB9XHJcblxyXG4gICAgd2hpbGUgKG5vZGUgPSBpbmVydEJvZHlFbGVtZW50LmZpcnN0Q2hpbGQpIHtcclxuICAgICAgaW5lcnRCb2R5RWxlbWVudC5yZW1vdmVDaGlsZChub2RlKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGF0dHJUb01hcChhdHRycykge1xyXG4gICAgdmFyIG1hcCA9IHt9O1xyXG4gICAgZm9yICh2YXIgaSA9IDAsIGlpID0gYXR0cnMubGVuZ3RoOyBpIDwgaWk7IGkrKykge1xyXG4gICAgICB2YXIgYXR0ciA9IGF0dHJzW2ldO1xyXG4gICAgICBtYXBbYXR0ci5uYW1lXSA9IGF0dHIudmFsdWU7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gbWFwO1xyXG4gIH1cclxuXHJcblxyXG4gIC8qKlxyXG4gICAqIEVzY2FwZXMgYWxsIHBvdGVudGlhbGx5IGRhbmdlcm91cyBjaGFyYWN0ZXJzLCBzbyB0aGF0IHRoZVxyXG4gICAqIHJlc3VsdGluZyBzdHJpbmcgY2FuIGJlIHNhZmVseSBpbnNlcnRlZCBpbnRvIGF0dHJpYnV0ZSBvclxyXG4gICAqIGVsZW1lbnQgdGV4dC5cclxuICAgKiBAcGFyYW0gdmFsdWVcclxuICAgKiBAcmV0dXJucyB7c3RyaW5nfSBlc2NhcGVkIHRleHRcclxuICAgKi9cclxuICBmdW5jdGlvbiBlbmNvZGVFbnRpdGllcyh2YWx1ZSkge1xyXG4gICAgcmV0dXJuIHZhbHVlLlxyXG4gICAgICByZXBsYWNlKC8mL2csICcmYW1wOycpLlxyXG4gICAgICByZXBsYWNlKFNVUlJPR0FURV9QQUlSX1JFR0VYUCwgZnVuY3Rpb24odmFsdWUpIHtcclxuICAgICAgICB2YXIgaGkgPSB2YWx1ZS5jaGFyQ29kZUF0KDApO1xyXG4gICAgICAgIHZhciBsb3cgPSB2YWx1ZS5jaGFyQ29kZUF0KDEpO1xyXG4gICAgICAgIHJldHVybiAnJiMnICsgKCgoaGkgLSAweEQ4MDApICogMHg0MDApICsgKGxvdyAtIDB4REMwMCkgKyAweDEwMDAwKSArICc7JztcclxuICAgICAgfSkuXHJcbiAgICAgIHJlcGxhY2UoTk9OX0FMUEhBTlVNRVJJQ19SRUdFWFAsIGZ1bmN0aW9uKHZhbHVlKSB7XHJcbiAgICAgICAgcmV0dXJuICcmIycgKyB2YWx1ZS5jaGFyQ29kZUF0KDApICsgJzsnO1xyXG4gICAgICB9KS5cclxuICAgICAgcmVwbGFjZSgvPC9nLCAnJmx0OycpLlxyXG4gICAgICByZXBsYWNlKC8+L2csICcmZ3Q7Jyk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBjcmVhdGUgYW4gSFRNTC9YTUwgd3JpdGVyIHdoaWNoIHdyaXRlcyB0byBidWZmZXJcclxuICAgKiBAcGFyYW0ge0FycmF5fSBidWYgdXNlIGJ1Zi5qb2luKCcnKSB0byBnZXQgb3V0IHNhbml0aXplZCBodG1sIHN0cmluZ1xyXG4gICAqIEByZXR1cm5zIHtvYmplY3R9IGluIHRoZSBmb3JtIG9mIHtcclxuICAgKiAgICAgc3RhcnQ6IGZ1bmN0aW9uKHRhZywgYXR0cnMpIHt9LFxyXG4gICAqICAgICBlbmQ6IGZ1bmN0aW9uKHRhZykge30sXHJcbiAgICogICAgIGNoYXJzOiBmdW5jdGlvbih0ZXh0KSB7fSxcclxuICAgKiAgICAgY29tbWVudDogZnVuY3Rpb24odGV4dCkge31cclxuICAgKiB9XHJcbiAgICovXHJcbiAgZnVuY3Rpb24gaHRtbFNhbml0aXplV3JpdGVySW1wbChidWYsIHVyaVZhbGlkYXRvcikge1xyXG4gICAgdmFyIGlnbm9yZUN1cnJlbnRFbGVtZW50ID0gZmFsc2U7XHJcbiAgICB2YXIgb3V0ID0gYmluZChidWYsIGJ1Zi5wdXNoKTtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIHN0YXJ0OiBmdW5jdGlvbih0YWcsIGF0dHJzKSB7XHJcbiAgICAgICAgdGFnID0gbG93ZXJjYXNlKHRhZyk7XHJcbiAgICAgICAgaWYgKCFpZ25vcmVDdXJyZW50RWxlbWVudCAmJiBibG9ja2VkRWxlbWVudHNbdGFnXSkge1xyXG4gICAgICAgICAgaWdub3JlQ3VycmVudEVsZW1lbnQgPSB0YWc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghaWdub3JlQ3VycmVudEVsZW1lbnQgJiYgdmFsaWRFbGVtZW50c1t0YWddID09PSB0cnVlKSB7XHJcbiAgICAgICAgICBvdXQoJzwnKTtcclxuICAgICAgICAgIG91dCh0YWcpO1xyXG4gICAgICAgICAgZm9yRWFjaChhdHRycywgZnVuY3Rpb24odmFsdWUsIGtleSkge1xyXG4gICAgICAgICAgICB2YXIgbGtleSA9IGxvd2VyY2FzZShrZXkpO1xyXG4gICAgICAgICAgICB2YXIgaXNJbWFnZSA9ICh0YWcgPT09ICdpbWcnICYmIGxrZXkgPT09ICdzcmMnKSB8fCAobGtleSA9PT0gJ2JhY2tncm91bmQnKTtcclxuICAgICAgICAgICAgaWYgKHZhbGlkQXR0cnNbbGtleV0gPT09IHRydWUgJiZcclxuICAgICAgICAgICAgICAodXJpQXR0cnNbbGtleV0gIT09IHRydWUgfHwgdXJpVmFsaWRhdG9yKHZhbHVlLCBpc0ltYWdlKSkpIHtcclxuICAgICAgICAgICAgICBvdXQoJyAnKTtcclxuICAgICAgICAgICAgICBvdXQoa2V5KTtcclxuICAgICAgICAgICAgICBvdXQoJz1cIicpO1xyXG4gICAgICAgICAgICAgIG91dChlbmNvZGVFbnRpdGllcyh2YWx1ZSkpO1xyXG4gICAgICAgICAgICAgIG91dCgnXCInKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgICBvdXQoJz4nKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIGVuZDogZnVuY3Rpb24odGFnKSB7XHJcbiAgICAgICAgdGFnID0gbG93ZXJjYXNlKHRhZyk7XHJcbiAgICAgICAgaWYgKCFpZ25vcmVDdXJyZW50RWxlbWVudCAmJiB2YWxpZEVsZW1lbnRzW3RhZ10gPT09IHRydWUgJiYgdm9pZEVsZW1lbnRzW3RhZ10gIT09IHRydWUpIHtcclxuICAgICAgICAgIG91dCgnPC8nKTtcclxuICAgICAgICAgIG91dCh0YWcpO1xyXG4gICAgICAgICAgb3V0KCc+Jyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0YWcgPT0gaWdub3JlQ3VycmVudEVsZW1lbnQpIHtcclxuICAgICAgICAgIGlnbm9yZUN1cnJlbnRFbGVtZW50ID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICBjaGFyczogZnVuY3Rpb24oY2hhcnMpIHtcclxuICAgICAgICBpZiAoIWlnbm9yZUN1cnJlbnRFbGVtZW50KSB7XHJcbiAgICAgICAgICBvdXQoZW5jb2RlRW50aXRpZXMoY2hhcnMpKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH07XHJcbiAgfVxyXG5cclxuXHJcbiAgLyoqXHJcbiAgICogV2hlbiBJRTktMTEgY29tZXMgYWNyb3NzIGFuIHVua25vd24gbmFtZXNwYWNlZCBhdHRyaWJ1dGUgZS5nLiAneGxpbms6Zm9vJyBpdCBhZGRzICd4bWxuczpuczEnIGF0dHJpYnV0ZSB0byBkZWNsYXJlXHJcbiAgICogbnMxIG5hbWVzcGFjZSBhbmQgcHJlZml4ZXMgdGhlIGF0dHJpYnV0ZSB3aXRoICduczEnIChlLmcuICduczE6eGxpbms6Zm9vJykuIFRoaXMgaXMgdW5kZXNpcmFibGUgc2luY2Ugd2UgZG9uJ3Qgd2FudFxyXG4gICAqIHRvIGFsbG93IGFueSBvZiB0aGVzZSBjdXN0b20gYXR0cmlidXRlcy4gVGhpcyBtZXRob2Qgc3RyaXBzIHRoZW0gYWxsLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIG5vZGUgUm9vdCBlbGVtZW50IHRvIHByb2Nlc3NcclxuICAgKi9cclxuICBmdW5jdGlvbiBzdHJpcEN1c3RvbU5zQXR0cnMobm9kZSkge1xyXG4gICAgaWYgKG5vZGUubm9kZVR5cGUgPT09IHdpbmRvdy5Ob2RlLkVMRU1FTlRfTk9ERSkge1xyXG4gICAgICB2YXIgYXR0cnMgPSBub2RlLmF0dHJpYnV0ZXM7XHJcbiAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gYXR0cnMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XHJcbiAgICAgICAgdmFyIGF0dHJOb2RlID0gYXR0cnNbaV07XHJcbiAgICAgICAgdmFyIGF0dHJOYW1lID0gYXR0ck5vZGUubmFtZS50b0xvd2VyQ2FzZSgpO1xyXG4gICAgICAgIGlmIChhdHRyTmFtZSA9PT0gJ3htbG5zOm5zMScgfHwgYXR0ck5hbWUubGFzdEluZGV4T2YoJ25zMTonLCAwKSA9PT0gMCkge1xyXG4gICAgICAgICAgbm9kZS5yZW1vdmVBdHRyaWJ1dGVOb2RlKGF0dHJOb2RlKTtcclxuICAgICAgICAgIGktLTtcclxuICAgICAgICAgIGwtLTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB2YXIgbmV4dE5vZGUgPSBub2RlLmZpcnN0Q2hpbGQ7XHJcbiAgICBpZiAobmV4dE5vZGUpIHtcclxuICAgICAgc3RyaXBDdXN0b21Oc0F0dHJzKG5leHROb2RlKTtcclxuICAgIH1cclxuXHJcbiAgICBuZXh0Tm9kZSA9IG5vZGUubmV4dFNpYmxpbmc7XHJcbiAgICBpZiAobmV4dE5vZGUpIHtcclxuICAgICAgc3RyaXBDdXN0b21Oc0F0dHJzKG5leHROb2RlKTtcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHNhbml0aXplVGV4dChjaGFycykge1xyXG4gIHZhciBidWYgPSBbXTtcclxuICB2YXIgd3JpdGVyID0gaHRtbFNhbml0aXplV3JpdGVyKGJ1Ziwgbm9vcCk7XHJcbiAgd3JpdGVyLmNoYXJzKGNoYXJzKTtcclxuICByZXR1cm4gYnVmLmpvaW4oJycpO1xyXG59XHJcblxyXG5cclxuLy8gZGVmaW5lIG5nU2FuaXRpemUgbW9kdWxlIGFuZCByZWdpc3RlciAkc2FuaXRpemUgc2VydmljZVxyXG5hbmd1bGFyLm1vZHVsZSgnbmdTYW5pdGl6ZScsIFtdKS5wcm92aWRlcignJHNhbml0aXplJywgJFNhbml0aXplUHJvdmlkZXIpO1xyXG5cclxuLyoqXHJcbiAqIEBuZ2RvYyBmaWx0ZXJcclxuICogQG5hbWUgbGlua3lcclxuICogQGtpbmQgZnVuY3Rpb25cclxuICpcclxuICogQGRlc2NyaXB0aW9uXHJcbiAqIEZpbmRzIGxpbmtzIGluIHRleHQgaW5wdXQgYW5kIHR1cm5zIHRoZW0gaW50byBodG1sIGxpbmtzLiBTdXBwb3J0cyBgaHR0cC9odHRwcy9mdHAvbWFpbHRvYCBhbmRcclxuICogcGxhaW4gZW1haWwgYWRkcmVzcyBsaW5rcy5cclxuICpcclxuICogUmVxdWlyZXMgdGhlIHtAbGluayBuZ1Nhbml0aXplIGBuZ1Nhbml0aXplYH0gbW9kdWxlIHRvIGJlIGluc3RhbGxlZC5cclxuICpcclxuICogQHBhcmFtIHtzdHJpbmd9IHRleHQgSW5wdXQgdGV4dC5cclxuICogQHBhcmFtIHtzdHJpbmd9IHRhcmdldCBXaW5kb3cgKGBfYmxhbmt8X3NlbGZ8X3BhcmVudHxfdG9wYCkgb3IgbmFtZWQgZnJhbWUgdG8gb3BlbiBsaW5rcyBpbi5cclxuICogQHBhcmFtIHtvYmplY3R8ZnVuY3Rpb24odXJsKX0gW2F0dHJpYnV0ZXNdIEFkZCBjdXN0b20gYXR0cmlidXRlcyB0byB0aGUgbGluayBlbGVtZW50LlxyXG4gKlxyXG4gKiAgICBDYW4gYmUgb25lIG9mOlxyXG4gKlxyXG4gKiAgICAtIGBvYmplY3RgOiBBIG1hcCBvZiBhdHRyaWJ1dGVzXHJcbiAqICAgIC0gYGZ1bmN0aW9uYDogVGFrZXMgdGhlIHVybCBhcyBhIHBhcmFtZXRlciBhbmQgcmV0dXJucyBhIG1hcCBvZiBhdHRyaWJ1dGVzXHJcbiAqXHJcbiAqICAgIElmIHRoZSBtYXAgb2YgYXR0cmlidXRlcyBjb250YWlucyBhIHZhbHVlIGZvciBgdGFyZ2V0YCwgaXQgb3ZlcnJpZGVzIHRoZSB2YWx1ZSBvZlxyXG4gKiAgICB0aGUgdGFyZ2V0IHBhcmFtZXRlci5cclxuICpcclxuICpcclxuICogQHJldHVybnMge3N0cmluZ30gSHRtbC1saW5raWZpZWQgYW5kIHtAbGluayAkc2FuaXRpemUgc2FuaXRpemVkfSB0ZXh0LlxyXG4gKlxyXG4gKiBAdXNhZ2VcclxuICAgPHNwYW4gbmctYmluZC1odG1sPVwibGlua3lfZXhwcmVzc2lvbiB8IGxpbmt5XCI+PC9zcGFuPlxyXG4gKlxyXG4gKiBAZXhhbXBsZVxyXG4gICA8ZXhhbXBsZSBtb2R1bGU9XCJsaW5reUV4YW1wbGVcIiBkZXBzPVwiYW5ndWxhci1zYW5pdGl6ZS5qc1wiPlxyXG4gICAgIDxmaWxlIG5hbWU9XCJpbmRleC5odG1sXCI+XHJcbiAgICAgICA8ZGl2IG5nLWNvbnRyb2xsZXI9XCJFeGFtcGxlQ29udHJvbGxlclwiPlxyXG4gICAgICAgU25pcHBldDogPHRleHRhcmVhIG5nLW1vZGVsPVwic25pcHBldFwiIGNvbHM9XCI2MFwiIHJvd3M9XCIzXCI+PC90ZXh0YXJlYT5cclxuICAgICAgIDx0YWJsZT5cclxuICAgICAgICAgPHRyPlxyXG4gICAgICAgICAgIDx0aD5GaWx0ZXI8L3RoPlxyXG4gICAgICAgICAgIDx0aD5Tb3VyY2U8L3RoPlxyXG4gICAgICAgICAgIDx0aD5SZW5kZXJlZDwvdGg+XHJcbiAgICAgICAgIDwvdHI+XHJcbiAgICAgICAgIDx0ciBpZD1cImxpbmt5LWZpbHRlclwiPlxyXG4gICAgICAgICAgIDx0ZD5saW5reSBmaWx0ZXI8L3RkPlxyXG4gICAgICAgICAgIDx0ZD5cclxuICAgICAgICAgICAgIDxwcmU+Jmx0O2RpdiBuZy1iaW5kLWh0bWw9XCJzbmlwcGV0IHwgbGlua3lcIiZndDs8YnI+Jmx0Oy9kaXYmZ3Q7PC9wcmU+XHJcbiAgICAgICAgICAgPC90ZD5cclxuICAgICAgICAgICA8dGQ+XHJcbiAgICAgICAgICAgICA8ZGl2IG5nLWJpbmQtaHRtbD1cInNuaXBwZXQgfCBsaW5reVwiPjwvZGl2PlxyXG4gICAgICAgICAgIDwvdGQ+XHJcbiAgICAgICAgIDwvdHI+XHJcbiAgICAgICAgIDx0ciBpZD1cImxpbmt5LXRhcmdldFwiPlxyXG4gICAgICAgICAgPHRkPmxpbmt5IHRhcmdldDwvdGQ+XHJcbiAgICAgICAgICA8dGQ+XHJcbiAgICAgICAgICAgIDxwcmU+Jmx0O2RpdiBuZy1iaW5kLWh0bWw9XCJzbmlwcGV0V2l0aFNpbmdsZVVSTCB8IGxpbmt5OidfYmxhbmsnXCImZ3Q7PGJyPiZsdDsvZGl2Jmd0OzwvcHJlPlxyXG4gICAgICAgICAgPC90ZD5cclxuICAgICAgICAgIDx0ZD5cclxuICAgICAgICAgICAgPGRpdiBuZy1iaW5kLWh0bWw9XCJzbmlwcGV0V2l0aFNpbmdsZVVSTCB8IGxpbmt5OidfYmxhbmsnXCI+PC9kaXY+XHJcbiAgICAgICAgICA8L3RkPlxyXG4gICAgICAgICA8L3RyPlxyXG4gICAgICAgICA8dHIgaWQ9XCJsaW5reS1jdXN0b20tYXR0cmlidXRlc1wiPlxyXG4gICAgICAgICAgPHRkPmxpbmt5IGN1c3RvbSBhdHRyaWJ1dGVzPC90ZD5cclxuICAgICAgICAgIDx0ZD5cclxuICAgICAgICAgICAgPHByZT4mbHQ7ZGl2IG5nLWJpbmQtaHRtbD1cInNuaXBwZXRXaXRoU2luZ2xlVVJMIHwgbGlua3k6J19zZWxmJzp7cmVsOiAnbm9mb2xsb3cnfVwiJmd0Ozxicj4mbHQ7L2RpdiZndDs8L3ByZT5cclxuICAgICAgICAgIDwvdGQ+XHJcbiAgICAgICAgICA8dGQ+XHJcbiAgICAgICAgICAgIDxkaXYgbmctYmluZC1odG1sPVwic25pcHBldFdpdGhTaW5nbGVVUkwgfCBsaW5reTonX3NlbGYnOntyZWw6ICdub2ZvbGxvdyd9XCI+PC9kaXY+XHJcbiAgICAgICAgICA8L3RkPlxyXG4gICAgICAgICA8L3RyPlxyXG4gICAgICAgICA8dHIgaWQ9XCJlc2NhcGVkLWh0bWxcIj5cclxuICAgICAgICAgICA8dGQ+bm8gZmlsdGVyPC90ZD5cclxuICAgICAgICAgICA8dGQ+PHByZT4mbHQ7ZGl2IG5nLWJpbmQ9XCJzbmlwcGV0XCImZ3Q7PGJyPiZsdDsvZGl2Jmd0OzwvcHJlPjwvdGQ+XHJcbiAgICAgICAgICAgPHRkPjxkaXYgbmctYmluZD1cInNuaXBwZXRcIj48L2Rpdj48L3RkPlxyXG4gICAgICAgICA8L3RyPlxyXG4gICAgICAgPC90YWJsZT5cclxuICAgICA8L2ZpbGU+XHJcbiAgICAgPGZpbGUgbmFtZT1cInNjcmlwdC5qc1wiPlxyXG4gICAgICAgYW5ndWxhci5tb2R1bGUoJ2xpbmt5RXhhbXBsZScsIFsnbmdTYW5pdGl6ZSddKVxyXG4gICAgICAgICAuY29udHJvbGxlcignRXhhbXBsZUNvbnRyb2xsZXInLCBbJyRzY29wZScsIGZ1bmN0aW9uKCRzY29wZSkge1xyXG4gICAgICAgICAgICRzY29wZS5zbmlwcGV0ID1cclxuICAgICAgICAgICAgICdQcmV0dHkgdGV4dCB3aXRoIHNvbWUgbGlua3M6XFxuJytcclxuICAgICAgICAgICAgICdodHRwOi8vYW5ndWxhcmpzLm9yZy8sXFxuJytcclxuICAgICAgICAgICAgICdtYWlsdG86dXNAc29tZXdoZXJlLm9yZyxcXG4nK1xyXG4gICAgICAgICAgICAgJ2Fub3RoZXJAc29tZXdoZXJlLm9yZyxcXG4nK1xyXG4gICAgICAgICAgICAgJ2FuZCBvbmUgbW9yZTogZnRwOi8vMTI3LjAuMC4xLy4nO1xyXG4gICAgICAgICAgICRzY29wZS5zbmlwcGV0V2l0aFNpbmdsZVVSTCA9ICdodHRwOi8vYW5ndWxhcmpzLm9yZy8nO1xyXG4gICAgICAgICB9XSk7XHJcbiAgICAgPC9maWxlPlxyXG4gICAgIDxmaWxlIG5hbWU9XCJwcm90cmFjdG9yLmpzXCIgdHlwZT1cInByb3RyYWN0b3JcIj5cclxuICAgICAgIGl0KCdzaG91bGQgbGlua2lmeSB0aGUgc25pcHBldCB3aXRoIHVybHMnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgZXhwZWN0KGVsZW1lbnQoYnkuaWQoJ2xpbmt5LWZpbHRlcicpKS5lbGVtZW50KGJ5LmJpbmRpbmcoJ3NuaXBwZXQgfCBsaW5reScpKS5nZXRUZXh0KCkpLlxyXG4gICAgICAgICAgICAgdG9CZSgnUHJldHR5IHRleHQgd2l0aCBzb21lIGxpbmtzOiBodHRwOi8vYW5ndWxhcmpzLm9yZy8sIHVzQHNvbWV3aGVyZS5vcmcsICcgK1xyXG4gICAgICAgICAgICAgICAgICAnYW5vdGhlckBzb21ld2hlcmUub3JnLCBhbmQgb25lIG1vcmU6IGZ0cDovLzEyNy4wLjAuMS8uJyk7XHJcbiAgICAgICAgIGV4cGVjdChlbGVtZW50LmFsbChieS5jc3MoJyNsaW5reS1maWx0ZXIgYScpKS5jb3VudCgpKS50b0VxdWFsKDQpO1xyXG4gICAgICAgfSk7XHJcblxyXG4gICAgICAgaXQoJ3Nob3VsZCBub3QgbGlua2lmeSBzbmlwcGV0IHdpdGhvdXQgdGhlIGxpbmt5IGZpbHRlcicsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICBleHBlY3QoZWxlbWVudChieS5pZCgnZXNjYXBlZC1odG1sJykpLmVsZW1lbnQoYnkuYmluZGluZygnc25pcHBldCcpKS5nZXRUZXh0KCkpLlxyXG4gICAgICAgICAgICAgdG9CZSgnUHJldHR5IHRleHQgd2l0aCBzb21lIGxpbmtzOiBodHRwOi8vYW5ndWxhcmpzLm9yZy8sIG1haWx0bzp1c0Bzb21ld2hlcmUub3JnLCAnICtcclxuICAgICAgICAgICAgICAgICAgJ2Fub3RoZXJAc29tZXdoZXJlLm9yZywgYW5kIG9uZSBtb3JlOiBmdHA6Ly8xMjcuMC4wLjEvLicpO1xyXG4gICAgICAgICBleHBlY3QoZWxlbWVudC5hbGwoYnkuY3NzKCcjZXNjYXBlZC1odG1sIGEnKSkuY291bnQoKSkudG9FcXVhbCgwKTtcclxuICAgICAgIH0pO1xyXG5cclxuICAgICAgIGl0KCdzaG91bGQgdXBkYXRlJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgIGVsZW1lbnQoYnkubW9kZWwoJ3NuaXBwZXQnKSkuY2xlYXIoKTtcclxuICAgICAgICAgZWxlbWVudChieS5tb2RlbCgnc25pcHBldCcpKS5zZW5kS2V5cygnbmV3IGh0dHA6Ly9saW5rLicpO1xyXG4gICAgICAgICBleHBlY3QoZWxlbWVudChieS5pZCgnbGlua3ktZmlsdGVyJykpLmVsZW1lbnQoYnkuYmluZGluZygnc25pcHBldCB8IGxpbmt5JykpLmdldFRleHQoKSkuXHJcbiAgICAgICAgICAgICB0b0JlKCduZXcgaHR0cDovL2xpbmsuJyk7XHJcbiAgICAgICAgIGV4cGVjdChlbGVtZW50LmFsbChieS5jc3MoJyNsaW5reS1maWx0ZXIgYScpKS5jb3VudCgpKS50b0VxdWFsKDEpO1xyXG4gICAgICAgICBleHBlY3QoZWxlbWVudChieS5pZCgnZXNjYXBlZC1odG1sJykpLmVsZW1lbnQoYnkuYmluZGluZygnc25pcHBldCcpKS5nZXRUZXh0KCkpXHJcbiAgICAgICAgICAgICAudG9CZSgnbmV3IGh0dHA6Ly9saW5rLicpO1xyXG4gICAgICAgfSk7XHJcblxyXG4gICAgICAgaXQoJ3Nob3VsZCB3b3JrIHdpdGggdGhlIHRhcmdldCBwcm9wZXJ0eScsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGV4cGVjdChlbGVtZW50KGJ5LmlkKCdsaW5reS10YXJnZXQnKSkuXHJcbiAgICAgICAgICAgIGVsZW1lbnQoYnkuYmluZGluZyhcInNuaXBwZXRXaXRoU2luZ2xlVVJMIHwgbGlua3k6J19ibGFuaydcIikpLmdldFRleHQoKSkuXHJcbiAgICAgICAgICAgIHRvQmUoJ2h0dHA6Ly9hbmd1bGFyanMub3JnLycpO1xyXG4gICAgICAgIGV4cGVjdChlbGVtZW50KGJ5LmNzcygnI2xpbmt5LXRhcmdldCBhJykpLmdldEF0dHJpYnV0ZSgndGFyZ2V0JykpLnRvRXF1YWwoJ19ibGFuaycpO1xyXG4gICAgICAgfSk7XHJcblxyXG4gICAgICAgaXQoJ3Nob3VsZCBvcHRpb25hbGx5IGFkZCBjdXN0b20gYXR0cmlidXRlcycsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGV4cGVjdChlbGVtZW50KGJ5LmlkKCdsaW5reS1jdXN0b20tYXR0cmlidXRlcycpKS5cclxuICAgICAgICAgICAgZWxlbWVudChieS5iaW5kaW5nKFwic25pcHBldFdpdGhTaW5nbGVVUkwgfCBsaW5reTonX3NlbGYnOntyZWw6ICdub2ZvbGxvdyd9XCIpKS5nZXRUZXh0KCkpLlxyXG4gICAgICAgICAgICB0b0JlKCdodHRwOi8vYW5ndWxhcmpzLm9yZy8nKTtcclxuICAgICAgICBleHBlY3QoZWxlbWVudChieS5jc3MoJyNsaW5reS1jdXN0b20tYXR0cmlidXRlcyBhJykpLmdldEF0dHJpYnV0ZSgncmVsJykpLnRvRXF1YWwoJ25vZm9sbG93Jyk7XHJcbiAgICAgICB9KTtcclxuICAgICA8L2ZpbGU+XHJcbiAgIDwvZXhhbXBsZT5cclxuICovXHJcbmFuZ3VsYXIubW9kdWxlKCduZ1Nhbml0aXplJykuZmlsdGVyKCdsaW5reScsIFsnJHNhbml0aXplJywgZnVuY3Rpb24oJHNhbml0aXplKSB7XHJcbiAgdmFyIExJTktZX1VSTF9SRUdFWFAgPVxyXG4gICAgICAgIC8oKGZ0cHxodHRwcz8pOlxcL1xcL3wod3d3XFwuKXwobWFpbHRvOik/W0EtWmEtejAtOS5fJSstXStAKVxcUypbXlxccy47LCgpe308PlwiXFx1MjAxZFxcdTIwMTldL2ksXHJcbiAgICAgIE1BSUxUT19SRUdFWFAgPSAvXm1haWx0bzovaTtcclxuXHJcbiAgdmFyIGxpbmt5TWluRXJyID0gYW5ndWxhci4kJG1pbkVycignbGlua3knKTtcclxuICB2YXIgaXNEZWZpbmVkID0gYW5ndWxhci5pc0RlZmluZWQ7XHJcbiAgdmFyIGlzRnVuY3Rpb24gPSBhbmd1bGFyLmlzRnVuY3Rpb247XHJcbiAgdmFyIGlzT2JqZWN0ID0gYW5ndWxhci5pc09iamVjdDtcclxuICB2YXIgaXNTdHJpbmcgPSBhbmd1bGFyLmlzU3RyaW5nO1xyXG5cclxuICByZXR1cm4gZnVuY3Rpb24odGV4dCwgdGFyZ2V0LCBhdHRyaWJ1dGVzKSB7XHJcbiAgICBpZiAodGV4dCA9PSBudWxsIHx8IHRleHQgPT09ICcnKSByZXR1cm4gdGV4dDtcclxuICAgIGlmICghaXNTdHJpbmcodGV4dCkpIHRocm93IGxpbmt5TWluRXJyKCdub3RzdHJpbmcnLCAnRXhwZWN0ZWQgc3RyaW5nIGJ1dCByZWNlaXZlZDogezB9JywgdGV4dCk7XHJcblxyXG4gICAgdmFyIGF0dHJpYnV0ZXNGbiA9XHJcbiAgICAgIGlzRnVuY3Rpb24oYXR0cmlidXRlcykgPyBhdHRyaWJ1dGVzIDpcclxuICAgICAgaXNPYmplY3QoYXR0cmlidXRlcykgPyBmdW5jdGlvbiBnZXRBdHRyaWJ1dGVzT2JqZWN0KCkge3JldHVybiBhdHRyaWJ1dGVzO30gOlxyXG4gICAgICBmdW5jdGlvbiBnZXRFbXB0eUF0dHJpYnV0ZXNPYmplY3QoKSB7cmV0dXJuIHt9O307XHJcblxyXG4gICAgdmFyIG1hdGNoO1xyXG4gICAgdmFyIHJhdyA9IHRleHQ7XHJcbiAgICB2YXIgaHRtbCA9IFtdO1xyXG4gICAgdmFyIHVybDtcclxuICAgIHZhciBpO1xyXG4gICAgd2hpbGUgKChtYXRjaCA9IHJhdy5tYXRjaChMSU5LWV9VUkxfUkVHRVhQKSkpIHtcclxuICAgICAgLy8gV2UgY2FuIG5vdCBlbmQgaW4gdGhlc2UgYXMgdGhleSBhcmUgc29tZXRpbWVzIGZvdW5kIGF0IHRoZSBlbmQgb2YgdGhlIHNlbnRlbmNlXHJcbiAgICAgIHVybCA9IG1hdGNoWzBdO1xyXG4gICAgICAvLyBpZiB3ZSBkaWQgbm90IG1hdGNoIGZ0cC9odHRwL3d3dy9tYWlsdG8gdGhlbiBhc3N1bWUgbWFpbHRvXHJcbiAgICAgIGlmICghbWF0Y2hbMl0gJiYgIW1hdGNoWzRdKSB7XHJcbiAgICAgICAgdXJsID0gKG1hdGNoWzNdID8gJ2h0dHA6Ly8nIDogJ21haWx0bzonKSArIHVybDtcclxuICAgICAgfVxyXG4gICAgICBpID0gbWF0Y2guaW5kZXg7XHJcbiAgICAgIGFkZFRleHQocmF3LnN1YnN0cigwLCBpKSk7XHJcbiAgICAgIGFkZExpbmsodXJsLCBtYXRjaFswXS5yZXBsYWNlKE1BSUxUT19SRUdFWFAsICcnKSk7XHJcbiAgICAgIHJhdyA9IHJhdy5zdWJzdHJpbmcoaSArIG1hdGNoWzBdLmxlbmd0aCk7XHJcbiAgICB9XHJcbiAgICBhZGRUZXh0KHJhdyk7XHJcbiAgICByZXR1cm4gJHNhbml0aXplKGh0bWwuam9pbignJykpO1xyXG5cclxuICAgIGZ1bmN0aW9uIGFkZFRleHQodGV4dCkge1xyXG4gICAgICBpZiAoIXRleHQpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuICAgICAgaHRtbC5wdXNoKHNhbml0aXplVGV4dCh0ZXh0KSk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gYWRkTGluayh1cmwsIHRleHQpIHtcclxuICAgICAgdmFyIGtleSwgbGlua0F0dHJpYnV0ZXMgPSBhdHRyaWJ1dGVzRm4odXJsKTtcclxuICAgICAgaHRtbC5wdXNoKCc8YSAnKTtcclxuXHJcbiAgICAgIGZvciAoa2V5IGluIGxpbmtBdHRyaWJ1dGVzKSB7XHJcbiAgICAgICAgaHRtbC5wdXNoKGtleSArICc9XCInICsgbGlua0F0dHJpYnV0ZXNba2V5XSArICdcIiAnKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKGlzRGVmaW5lZCh0YXJnZXQpICYmICEoJ3RhcmdldCcgaW4gbGlua0F0dHJpYnV0ZXMpKSB7XHJcbiAgICAgICAgaHRtbC5wdXNoKCd0YXJnZXQ9XCInLFxyXG4gICAgICAgICAgICAgICAgICB0YXJnZXQsXHJcbiAgICAgICAgICAgICAgICAgICdcIiAnKTtcclxuICAgICAgfVxyXG4gICAgICBodG1sLnB1c2goJ2hyZWY9XCInLFxyXG4gICAgICAgICAgICAgICAgdXJsLnJlcGxhY2UoL1wiL2csICcmcXVvdDsnKSxcclxuICAgICAgICAgICAgICAgICdcIj4nKTtcclxuICAgICAgYWRkVGV4dCh0ZXh0KTtcclxuICAgICAgaHRtbC5wdXNoKCc8L2E+Jyk7XHJcbiAgICB9XHJcbiAgfTtcclxufV0pO1xyXG5cclxuXHJcbn0pKHdpbmRvdywgd2luZG93LmFuZ3VsYXIpOyJdLCJmaWxlIjoiYW5ndWxhci1zYW5pdGl6ZS5qcyJ9
