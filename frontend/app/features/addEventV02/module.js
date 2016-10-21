(function() {
    angular.module("em.addEvent.v02", ["textAngular"]).config(function($provide) {
        // this demonstrates how to register a new tool and add it to the default toolbar
        $provide.decorator('taOptions', ['$delegate', function(taOptions) {
            taOptions.toolbar = [
                ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'pre', 'quote'],
                ['bold', 'italics', 'underline', 'strikeThrough', 'ul', 'ol', 'redo', 'undo', 'clear'],
                ['justifyLeft', 'justifyCenter', 'justifyRight', 'indent', 'outdent'],
                ['html', 'insertImage', 'insertLink', 'insertVideo', 'wordcount', 'charcount']
            ];
            return taOptions;
        }]);
    });
})();
