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
    rename = require('gulp-rename'),
    gulpif = require('gulp-if'),
    runSequence = require('run-sequence'),
    extend  = require('extend'),
    parseArgs   = require('minimist'),
    reload = browserSync.reload;


    var path = {
        build: { //building files
            js: 'frontend/build/js/',
            css: 'frontend/build/css/',
            img: 'frontend/build/img/',
        },
        src: { //source files
            js: 'src/js/**/*.js',//we need only main.css and main.js
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


// Configuration
//
var config = extend({
   env: process.env.NODE_ENV
}, parseArgs(process.argv.slice(2)));

// Getters / Setters
//
gulp.task('set-dev-node-env', function() {
   return process.env.NODE_ENV = config.env = 'development';
});
gulp.task('set-prod-node-env', function() {
   return process.env.NODE_ENV = config.env = 'production';
});

/*Tasks*/

gulp.task('style:build', function () {
    gulp.src(path.src.style) //get main.scss
        .pipe(gulpif(config.env === 'development', sourcemaps.init()))  //init sourcemap
        .pipe(sass()) //compile
        .pipe(prefixer()) //Add vendor prefixes
        .pipe(gulpif(config.env === 'production', cssmin())) //compressing css
        .pipe(gulpif(config.env === 'development', sourcemaps.write()))//write sourcemap
        .pipe(gulp.dest(path.build.css)) //put compressed files to the build
        .pipe(reload({stream: true}));//refresh server
});


gulp.task('js:build', function () {
    gulp.src(path.src.js) //get main.js
        .pipe(rigger()) //
        .pipe(gulpif(config.env === 'development', sourcemaps.init())) //init sourcemap
        .pipe(gulpif(config.env === 'production', uglify())) //compressing js
        .pipe(gulpif(config.env === 'development', sourcemaps.write())) //write sourcemap
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


/*Run task*/

gulp.task('build', [
    'js:build',
    'style:build',
    'image:build'
]);

gulp.task('clean', function (cb) {
    rimraf(path.clean, cb);
});

//development is default
 gulp.task('default', ['dev', 'watch']);


gulp.task('dev', ['set-dev-node-env'], function() {
   return runSequence(
      'build'
   );
});

gulp.task('prod', ['set-prod-node-env'], function() {
   return runSequence(
      'build'
   );
});
