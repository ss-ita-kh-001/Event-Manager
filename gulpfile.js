var gulp = require("gulp");
var sass = require("gulp-sass");
var rename = require("gulp-rename");

gulp.task("default", ["sass:watch"]);

gulp.task("sass", function () {
  return gulp.src('frontend/core/layout/scss/layout.scss')
   .pipe(sass({outputStyle:"compressed"}).on('error', sass.logError))
   .pipe(rename(function (path){
     path.basename+=".min";
   }))
   .pipe(gulp.dest('frontend/core/layout/css/'));
});

gulp.task('sass:watch', function () {
  gulp.watch('frontend/core/layout/scss/*.scss', ['sass']);
});
