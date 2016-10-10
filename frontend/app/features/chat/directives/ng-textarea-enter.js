(function() {
  angular.module("em.chat").directive("ngTextareaEnter", function() {
  	return {
  		restrict: 'A',
  		link: function(scope, elem, attrs) {
  			elem.bind('keydown', function(event) {
  		    	var code = event.keyCode || event.which;
  		       	if (code === 13) {
  		       		if(elem[0].type == 'textarea') {
  		       			if(scope[attrs.ngModel] != undefined && scope[attrs.ngModel] != '') {
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
  })
})();
