(function() {
    var app = angular.module("em", ["ngRoute", "em.main", 'ngAnimate', "ngSanitize", "ui.bootstrap", "satellizer"]);
    
    app.controller('CarouselDemoCtrl', function($scope) {
        $scope.myInterval = 5000;
        $scope.noWrapSlides = false;
        $scope.active = 0;
        var slides = $scope.slides = [];
        var currIndex = 0;

        $scope.addSlide = function() {
            var newWidth = 600 + slides.length + 1;
            slides.push({
                image: '//unsplash.it/' + newWidth + '/300',
                text: ['Nice image', 'Awesome photograph', 'That is so cool', 'I love that'][slides.length % 4],
                id: currIndex++
            });
        };

        $scope.randomize = function() {
            var indexes = generateIndexesArray();
            assignNewIndexesToSlides(indexes);
        };

        for (var i = 0; i < 4; i++) {
            $scope.addSlide();
        }

        // Randomize logic below

        function assignNewIndexesToSlides(indexes) {
            for (var i = 0, l = slides.length; i < l; i++) {
                slides[i].id = indexes.pop();
            }
        }

        function generateIndexesArray() {
            var indexes = [];
            for (var i = 0; i < currIndex; ++i) {
                indexes[i] = i;
            }
            return shuffle(indexes);
        }

        // http://stackoverflow.com/questions/962802#962890
        function shuffle(array) {
            var tmp, current, top = array.length;

            if (top) {
                while (--top) {
                    current = Math.floor(Math.random() * (top + 1));
                    tmp = array[current];
                    array[current] = array[top];
                    array[top] = tmp;
                }
            }

            return array;
        }
    });
})();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJhcHAuanMiXSwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGFwcCA9IGFuZ3VsYXIubW9kdWxlKFwiZW1cIiwgW1wibmdSb3V0ZVwiLCBcImVtLm1haW5cIiwgJ25nQW5pbWF0ZScsIFwibmdTYW5pdGl6ZVwiLCBcInVpLmJvb3RzdHJhcFwiLCBcInNhdGVsbGl6ZXJcIl0pO1xyXG4gICAgXHJcbiAgICBhcHAuY29udHJvbGxlcignQ2Fyb3VzZWxEZW1vQ3RybCcsIGZ1bmN0aW9uKCRzY29wZSkge1xyXG4gICAgICAgICRzY29wZS5teUludGVydmFsID0gNTAwMDtcclxuICAgICAgICAkc2NvcGUubm9XcmFwU2xpZGVzID0gZmFsc2U7XHJcbiAgICAgICAgJHNjb3BlLmFjdGl2ZSA9IDA7XHJcbiAgICAgICAgdmFyIHNsaWRlcyA9ICRzY29wZS5zbGlkZXMgPSBbXTtcclxuICAgICAgICB2YXIgY3VyckluZGV4ID0gMDtcclxuXHJcbiAgICAgICAgJHNjb3BlLmFkZFNsaWRlID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHZhciBuZXdXaWR0aCA9IDYwMCArIHNsaWRlcy5sZW5ndGggKyAxO1xyXG4gICAgICAgICAgICBzbGlkZXMucHVzaCh7XHJcbiAgICAgICAgICAgICAgICBpbWFnZTogJy8vdW5zcGxhc2guaXQvJyArIG5ld1dpZHRoICsgJy8zMDAnLFxyXG4gICAgICAgICAgICAgICAgdGV4dDogWydOaWNlIGltYWdlJywgJ0F3ZXNvbWUgcGhvdG9ncmFwaCcsICdUaGF0IGlzIHNvIGNvb2wnLCAnSSBsb3ZlIHRoYXQnXVtzbGlkZXMubGVuZ3RoICUgNF0sXHJcbiAgICAgICAgICAgICAgICBpZDogY3VyckluZGV4KytcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgJHNjb3BlLnJhbmRvbWl6ZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB2YXIgaW5kZXhlcyA9IGdlbmVyYXRlSW5kZXhlc0FycmF5KCk7XHJcbiAgICAgICAgICAgIGFzc2lnbk5ld0luZGV4ZXNUb1NsaWRlcyhpbmRleGVzKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IDQ7IGkrKykge1xyXG4gICAgICAgICAgICAkc2NvcGUuYWRkU2xpZGUoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFJhbmRvbWl6ZSBsb2dpYyBiZWxvd1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBhc3NpZ25OZXdJbmRleGVzVG9TbGlkZXMoaW5kZXhlcykge1xyXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgbCA9IHNsaWRlcy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIHNsaWRlc1tpXS5pZCA9IGluZGV4ZXMucG9wKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGdlbmVyYXRlSW5kZXhlc0FycmF5KCkge1xyXG4gICAgICAgICAgICB2YXIgaW5kZXhlcyA9IFtdO1xyXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGN1cnJJbmRleDsgKytpKSB7XHJcbiAgICAgICAgICAgICAgICBpbmRleGVzW2ldID0gaTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gc2h1ZmZsZShpbmRleGVzKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvOTYyODAyIzk2Mjg5MFxyXG4gICAgICAgIGZ1bmN0aW9uIHNodWZmbGUoYXJyYXkpIHtcclxuICAgICAgICAgICAgdmFyIHRtcCwgY3VycmVudCwgdG9wID0gYXJyYXkubGVuZ3RoO1xyXG5cclxuICAgICAgICAgICAgaWYgKHRvcCkge1xyXG4gICAgICAgICAgICAgICAgd2hpbGUgKC0tdG9wKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqICh0b3AgKyAxKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgdG1wID0gYXJyYXlbY3VycmVudF07XHJcbiAgICAgICAgICAgICAgICAgICAgYXJyYXlbY3VycmVudF0gPSBhcnJheVt0b3BdO1xyXG4gICAgICAgICAgICAgICAgICAgIGFycmF5W3RvcF0gPSB0bXA7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiBhcnJheTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxufSkoKTsiXSwiZmlsZSI6ImFwcC5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
