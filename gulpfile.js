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
    extend = require('extend'),
    parseArgs = require('minimist'),
    fontmin = require('gulp-fontmin'),
    concat = require('gulp-concat'),
    reload = browserSync.reload;


var path = {
    build: { //building files
        js: 'frontend/build/js/',
        css: 'frontend/build/css/',
        img: 'frontend/build/img/',
        font: 'frontend/build/fonts/'
    },
    copy: { //building files
        js: 'src/js/'
    },
    src: { //source files
        js: ['src/js/**/*.js'], //we need all js files
        style: 'src/style/main.scss', //we need only main.css
        img: 'src/img/**/*.*', // img/**/*.* - get all files with all expansion from all nested folders
        font: ['src/font/**/*.*', 'src/lib/font-awesome/fonts/*.*'], // fonts/**/*.* - get all files with all expansion from all nested folders
        concatJS: ["frontend/app/app.js",
            "frontend/app/config/config.js",
            "frontend/app/config/run.js",
            "frontend/app/features/navbar/controllers/navnavbarController.js",
            "frontend/app/core/auth/services/mainApiService.js",
            "frontend/app/core/auth/services/user.service.js",
            "frontend/app/core/auth/controllers/navbar-controller.js",
            "frontend/app/core/auth/controllers/logout.js",
            "frontend/app/core/flash-service/flash.service.js",
            "frontend/app/features/register/services/authentication.service.js",
            "frontend/app/features/db/module.js",
            "frontend/app/core/**/*.js",
            "frontend/app/features/db/users.js",
            "frontend/app/features/main/module.js",
            "frontend/app/features/main/const/mock-news.js",
            "frontend/app/features/main/services/event-service-news.js",
            "frontend/app/features/main/controllers/mainController.js",
            "frontend/app/features/profile/module.js",
            "frontend/app/features/profile/const/mocked-values.js",
            "frontend/app/features/profile/controllers/profile-controller.js",
            "frontend/app/features/profile/services/profile-service.js",
            "frontend/app/features/users/module.js",
            "frontend/app/features/users/db/users.js",
            "frontend/app/features/users/controllers/users-controller.js",
            "frontend/app/features/users/services/users-service.js",

            "frontend/app/features/chat/module.js",
            "frontend/app/features/chat/controllers/chatController.js",
            "frontend/app/features/chat/services/chatService.js",
            "frontend/app/features/chat/directives/ng-textarea-enter.js",

            "frontend/app/features/events/module.js",
            "frontend/app/features/events/const/mock-event-list.js",
            "frontend/app/features/events/controllers/event-list-controller.js",
            "frontend/app/features/events/controllers/eventController.js",
            "frontend/app/features/events/services/eventService.js",
            "frontend/app/features/events/controllers/event-list-controller.js",
            "frontend/app/features/events/services/event-service.js",
            "frontend/app/features/events/services/event-list-service.js",
            "frontend/app/features/register/module.js",
            "frontend/app/features/register/controllers/registerController.js",
            "frontend/app/features/register/directives/compare-password.js",
            "frontend/app/features/register/directives/watch-change.js",
            "frontend/app/features/login/module.js",
            "frontend/app/features/login/controllers/loginController.js",
            "frontend/app/features/forgot/module.js",
            "frontend/app/features/forgot/controllers/forgotController.js",
            "frontend/app/features/reset/module.js",
            "frontend/app/features/reset/controllers/resetController.js",
            "frontend/app/features/register/directives/compare-password.js",
            "frontend/app/features/result-table/module.js",
            "frontend/app/features/result-table/controllers/result-table-controller.js",
            "frontend/app/features/result-table/const/usersarray.js",
            "frontend/app/features/result-table/services/result-table-service.js",
            "frontend/app/features/addEvent/module.js",
            "frontend/app/features/addEvent/services/uploadService.js",
            "frontend/app/features/addEvent/services/addEventService.js",
            "frontend/app/features/addEvent/controllers/addEventController.js",
            "frontend/app/core/directives.v02/datepicker.js",
            "frontend/app/core/directives.v02/map.js",
            "frontend/app/core/directives.v02/file-model.js"
        ]
    },
    lib: { //source files
        js: ['src/lib/angular/angular.js',
            'src/lib/angular-animate/angular-animate.js',
            'src/lib/satellizer/dist/satellizer.js',
            'src/lib/angular-bootstrap/ui-bootstrap.js',
            'src/lib/angular-bootstrap/ui-bootstrap-tpls.js',
            'src/lib/angular-route/angular-route.js',
            'src/lib/satellizer/dist/satellizer.js',
            'src/lib/angular-cookies/angular-cookies.js',
            'src/lib/angular-sanitize/angular-sanitize.js',
            'src/lib/angular-scroll-glue/src/scrollglue.js',
            'src/lib/angular-responsive-tables/release/angular-responsive-tables.js',
            'src/lib/textAngular/dist/textAngular-rangy.min.js',
            'src/lib/textAngular/dist/textAngular-sanitize.min.js',
            'src/lib/textAngular/dist/textAngular.min.js',
            'src/lib/moment/moment.js',
            'src/lib/angular-mocks/angular-mocks.js'
        ]
    },
    watch: { //watch changes form those files
        js: 'src/js/**/*.js',
        // lib: 'src/lib/**/*.js',
        style: 'src/style/**/*.scss',
        img: 'src/img/**/*.*',
        font: 'src/font/**/*.*',
        concatJS: 'frontend/app/**/*.*'
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

gulp.task('style:build', function() {
    gulp.src(path.src.style) //get main.scss
        .pipe(gulpif(config.env === 'development', sourcemaps.init())) //init sourcemap
        .pipe(sass()) //compile
        .pipe(prefixer()) //Add vendor prefixes
        .pipe(gulpif(config.env === 'production', cssmin())) //compressing css
        .pipe(gulpif(config.env === 'development', sourcemaps.write())) //write sourcemap
        .pipe(gulp.dest(path.build.css)) //put compressed files to the build
        .pipe(reload({
            stream: true
        })); //refresh server
});


gulp.task('js:build', function() {
    gulp.src(path.src.js) //get main.js
        .pipe(rigger()) //
        .pipe(gulpif(config.env === 'development', sourcemaps.init())) //init sourcemap
        .pipe(gulpif(config.env === 'production', uglify())) //compressing js
        .pipe(gulpif(config.env === 'development', sourcemaps.write())) //write sourcemap
        .pipe(gulp.dest(path.build.js)) //put compressed files to the build
        .pipe(reload({
            stream: true
        })); //refresh server
});

gulp.task('lib:copy', function() {
    gulp.src(path.lib.js) //get main.js
        .pipe(rigger()) //
        .pipe(gulpif(config.env === 'development', sourcemaps.init())) //init sourcemap
        .pipe(gulpif(config.env === 'production', uglify())) //compressing js
        .pipe(gulpif(config.env === 'development', sourcemaps.write())) //write sourcemap
        .pipe(gulp.dest(path.copy.js)) //put compressed files to the build
        .pipe(reload({
            stream: true
        })); //refresh server
});


gulp.task('lib:build', function() {
    gulp.src(path.lib.js) //get main.js
        .pipe(rigger()) //
        .pipe(gulpif(config.env === 'development', sourcemaps.init())) //init sourcemap
        .pipe(gulpif(config.env === 'production', uglify())) //compressing js
        .pipe(gulpif(config.env === 'development', sourcemaps.write())) //write sourcemap
        .pipe(gulp.dest(path.build.js)) //put compressed files to the build
        .pipe(reload({
            stream: true
        })); //refresh server
});

gulp.task('image:build', function() {
    gulp.src(path.src.img) //get all images
        .pipe(imagemin({ //compressing images
            progressive: true,
            svgoPlugins: [{
                removeViewBox: false
            }],
            use: [pngquant()],
            interlaced: true
        }))
        .pipe(gulp.dest(path.build.img)) ///put compressed files to the build
        .pipe(reload({
            stream: true
        }));
});

gulp.task('font:build', function() {
    gulp.src(path.src.font)
        .pipe(fontmin())
        .pipe(gulp.dest(path.build.font))
        .pipe(reload({
            stream: true
        }));
});

gulp.task('concat', function() {
    gulp.src(path.src.concatJS)
        .pipe(gulpif(config.env === 'development', sourcemaps.init())) //init sourcemap
        .pipe(uglify())
        .pipe(concat('all.js'))
        .pipe(gulpif(config.env === 'development', sourcemaps.write())) //write sourcemap
        .pipe(gulp.dest(path.build.js))
        .pipe(reload({
            stream: true
        }));
});

gulp.task('webserver', function() {
    browserSync(config);
});




gulp.task('watch', function() {
    watch([path.watch.style], function(event, cb) {
        gulp.start('style:build');
    });
    watch([path.watch.js], function(event, cb) {
        gulp.start('js:build');
    });
    watch([path.watch.img], function(event, cb) {
        gulp.start('image:build');
    });
    watch([path.watch.font], function(event, cb) {
        gulp.start('font:build');
    });
    // watch([path.watch.lib], function(event, cb) {
    //     gulp.start('lib:build');
    // });
    watch([path.watch.concatJS], function(event, cb) {
        gulp.start('concat');
    });
});

/*Run task*/

gulp.task('build', [
    'js:build',
    'lib:build',
    'style:build',
    'image:build',
    'lib:copy',
    'font:build',
    'concat'
]);

gulp.task('clean', function(cb) {
    rimraf(path.clean, cb);
});

//development is default
gulp.task('default', ['prod']);


gulp.task('dev', ['set-dev-node-env'], function() {
    return runSequence(
        'build',
        'watch'
    );
});

gulp.task('prod', ['set-prod-node-env'], function() {
    return runSequence(
        'build'
    );
});
