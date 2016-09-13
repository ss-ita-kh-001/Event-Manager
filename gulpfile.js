<<<<<<< HEAD
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
=======
'use strict';

var gulp = require('gulp'),
    watch = require('gulp-watch'),
    prefixer = require('gulp-autoprefixer'),
    uglify = require('gulp-uglify'),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    rigger = require('gulp-rigger'),
    cssmin = require('gulp-cssmin'),
    imagemin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant'),
    rimraf = require('rimraf'),
    browserSync = require("browser-sync"),
    reload = browserSync.reload;


    var path = {
        build: { //building files
            js: 'frontend/build/js/',
            css: 'frontend/build/css/',
            img: 'frontend/build/img/',
        },
        src: { //source files
            js: 'src/js/main.js',//we need only main.css and main.js
            style: 'src/style/main.scss',
            img: 'src/img/**/*.*' // img/**/*.* - get all files with all expansion from all nested folders
          },
        watch: { //watch changes form those files
            js: 'src/js/**/*.js',
            style: 'src/style/**/*.scss',
            img: 'src/img/**/*.*'
        },
        clean: 'frontend/build'
    };

    var config = {
    server: {
        baseDir: "frontend/build"
    },
    tunnel: true,
    host: 'localhost',
    port: 5000,
    logPrefix: "Frontend_Devil"
};

gulp.task('style:build', function () {
    gulp.src(path.src.style) //get main.scss
        .pipe(sourcemaps.init()) //init sourcemap
        .pipe(sass()) //compile
        .pipe(prefixer()) //Add vendor prefixes
        .pipe(cssmin()) //compressing css
        .pipe(sourcemaps.write())//write sourcemap
        .pipe(gulp.dest(path.build.css)) //put compressed files to the build
        .pipe(reload({stream: true}));//refresh server
});


gulp.task('js:build', function () {
    gulp.src(path.src.js) //get main.js
        .pipe(rigger()) //
        .pipe(sourcemaps.init()) //init sourcemap
        .pipe(uglify()) //compressing js
        .pipe(sourcemaps.write()) //write sourcemap
        .pipe(gulp.dest(path.build.js)) //put compressed files to the build
        .pipe(reload({stream: true})); //refresh server
});

gulp.task('image:build', function () {
    gulp.src(path.src.img) //get all images
        .pipe(imagemin({ //compressing images
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()],
            interlaced: true
        }))
        .pipe(gulp.dest(path.build.img)) ///put compressed files to the build
        .pipe(reload({stream: true}));
});

gulp.task('webserver', function () {
    browserSync(config);
});

gulp.task('build', [
    'js:build',
    'style:build',
    'image:build'
]);


gulp.task('watch', function(){
    watch([path.watch.style], function(event, cb) {
        gulp.start('style:build');
    });
    watch([path.watch.js], function(event, cb) {
        gulp.start('js:build');
    });
    watch([path.watch.img], function(event, cb) {
        gulp.start('image:build');
    });
});


gulp.task('clean', function (cb) {
    rimraf(path.clean, cb);
});

gulp.task('default', ['build', 'watch']);
>>>>>>> refs/remotes/origin/master
