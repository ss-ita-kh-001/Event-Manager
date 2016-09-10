var gulp = require("gulp");
var sass = require("gulp-sass");
gulp.task("default", ["sass:watch"]);
gulp.task("sass", function () {
  return gulp.src('frontend/core/layout/scss/layout.scss')
   .pipe(sass().on('error', sass.logError))
   .pipe(gulp.dest('frontend/core/layout/css'));
});

gulp.task('sass:watch', function () {
  gulp.watch('frontend/core/layout/scss/*.scss', ['sass']);
});
