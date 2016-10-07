(function() {
  angular.module("em.chat").directive("ngTextareaEnter", function() {
  	return {
  		restrict: 'A',
  		link: function(scope, elem, attrs) {
  			// Detecting key down event
  			elem.bind('keydown', function(event) {
  		    	var code = event.keyCode || event.which;
  		    	// Detecting enter key press
  		       	if (code === 13) {
  		       		// Checking element to be textarea
  		       		if(elem[0].type == 'textarea') {
  		       			// Checking scope model to be valid
  		       			if(scope[attrs.ngModel] != undefined && scope[attrs.ngModel] != '') {
  		       				// Detecting shift/ctrl/alt key press
  				       		if (!event.shiftKey && !event.ctrlKey && !event.altKey) {
  				           		event.preventDefault();
  				               	scope.$apply(attrs.ngTextareaEnter);
  				            }
  		       			}
  		       		}
  		       	}
  		    });
  		}
  	}
})();
