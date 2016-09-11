var gulp = require("gulp");
var sass = require("gulp-sass");
var rename = require("gulp-rename");

gulp.task("default", ["sass:watch"]);

gulp.task("sass", function () {
  return gulp.src('frontend/core/layout-bootstrap/scss/layout.scss')
   .pipe(sass({outputStyle:"compressed"}).on('error', sass.logError))
   .pipe(rename(function (path){
     path.basename+=".min";
   }))
   .pipe(gulp.dest('frontend/core/layout-bootstrap/css/'));
});

gulp.task('sass:watch', function () {
  gulp.watch('frontend/core/layout-bootstrap/scss/*.scss', ['sass']);
});
