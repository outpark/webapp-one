(function(){
    var gulp = require('gulp');

    var $ = require('gulp-load-plugins')();
    var del = require('del');
    var bower = require('gulp-bower');
    var inject = require('gulp-inject');
    var watch = require('gulp-watch');
    var glob = require('glob');
    var sourcemaps = require('gulp-sourcemaps');
    var less = require('gulp-less');
    var concatCss = require('gulp-concat-css');
    var jshint = require('gulp-jshint');
    var uglify = require('gulp-uglifyjs');
    var ngAnnotate = require('gulp-ng-annotate');
    var rename = require('gulp-rename');
    var minifyCSS = require('gulp-minify-css');
    var templateCache = require('gulp-angular-templatecache');
    var zip = require('gulp-zip');

    var rootDir = '.';

    var mainDir = rootDir + '/main';

    // Frontend Paths
    var publicDir = mainDir + '/public';
    var publicLibDir = publicDir + '/lib';
    var distDir = publicDir + '/dist';
    var modulesDir = publicDir + '/modules';

    // Backend paths
    var pyLibDir = mainDir + '/pylibs';

    var injectAssetsDir = mainDir + '/templates/bit/';
    var htmlViews = ['modules/**/*.html'];

    //clean cache
    gulp.task('clean-cache', function(callback) {
        del(['./**/*.pyc', './**/*.pyo', './**/.*~'], callback);
    });

    //bower install
    gulp.task('bower-install', function(){
        return bower();
    });

    //inject all script paths into template file
    var jsFiles = {
        lib: [
            'lib/jquery/dist/jquery.js',
            'lib/jquery.easing/js/jquery.easing.js',
            'lib/angular/angular.js',
            'lib/angular-animate/angular-animate.min.js',
            'lib/angular-messages/angular-messages.js',
            'lib/angular-flash-alert/dist/angular-flash.min.js',
            'lib/angular-sanitize/angular-sanitize.js',
            'lib/angular-scroll/angular-scroll.js',
            'lib/angular-truncate/src/truncate.js',
            'lib/angular-socialsharing/dist/angular-socialsharing.js',
            'lib/angular-unsavedChanges/dist/unsavedChanges.js',
            'lib/bootstrap/dist/js/bootstrap.js',
            'lib/angular-ui-router/release/angular-ui-router.js',
            'lib/restangular/dist/restangular.js',
            'lib/lodash/dist/lodash.js',
            'lib/angular-no-captcha/src/angular-no-captcha.js',
            'lib/angular-elastic/elastic.js'
        ],
        scripts:[
            'application.js',
            'modules/**/*.js',
            '!modules/**/tests/**/*.js'
        ]
    };

    //links all angular scripts and module scripts into a script.html file
    //this script.html file is injected into base.html via jinja2
    function injectScripts() {
        var target = gulp.src(injectAssetsDir + 'script.html');
        var sources = gulp.src(jsFiles.lib.concat(jsFiles.scripts), {
            read : false,
            cwd  : publicDir
        });
        return target.pipe(inject(sources, {
            addPrefix : '/p'
        })).pipe(gulp.dest(injectAssetsDir));
    }

    gulp.task('inject-scripts', injectScripts);


    //copy the fonts overs
    gulp.task('copy-fonts', function() {
        gulp.src('font-awesome/fonts/*', {
            cwd : publicLibDir
        }).pipe(gulp.dest(distDir + '/fonts'));
        gulp.src('modules/core/fonts/*', {
            cwd : publicDir
        }).pipe(gulp.dest(distDir + '/fonts'));
    });

    //css/less files
    var cssFiles = [
        'lib/bootstrap/dist/css/bootstrap.css',
        'lib/angular-flash-alert/dist/angular-flash.min.css',
        'lib/animate.css/animate.css',
        'modules/core/fonts/font-awesome/font-awesome.css',
        'modules/core/fonts/icomoon/style.css'
    ];
    var lessPaths = [
    ];
    var appLessPaths = publicDir + '/modules/**/less';
    lessPaths = lessPaths.concat(glob.sync(appLessPaths));

    var manifestLessFile = 'modules/core/less/manifest.less';

    //do the less stuff
    gulp.task('less', function() {
        return gulp.src(cssFiles.concat(manifestLessFile), {
            cwd : publicDir
        }).pipe(sourcemaps.init()).pipe(less({
            paths : lessPaths
        })).pipe(sourcemaps.write()).pipe(concatCss('style.css')).pipe(gulp.dest(distDir));
    });

    //live reloading
    gulp.task('reload', function() {
        $.livereload.listen();
        gulp.watch(jsFiles.scripts.concat(htmlViews), {
            cwd : publicDir
        }).on('change', $.livereload.changed);
    });

    gulp.task('watch-new-scripts', function() {
        watch([modulesDir + '/**/*.js', publicDir + '/*.js'], function(e) {
            if (e.event === 'add' || e.event === 'unlink') {
                injectScripts();
            }
        });
    });

    gulp.task('watch-style', function(){
        $.livereload.listen();
        gulp.watch(distDir + '/style.css')
            .on('change', $.livereload.changed);
    });

    gulp.task('watch-less', function() {
        gulp.watch(appLessPaths + '/*.less', ['less']);
    });

    gulp.task('watch-style', function(){
        $.livereload.listen();
        gulp.watch(distDir + '/style.css')
            .on('change', $.livereload.changed);
    });

    gulp.task('watch', ['reload', 'watch-style', 'watch-new-scripts', 'watch-less', 'watch-style']);

    gulp.task('run', [
        'clean-cache',
        'bower-install',
        'inject-scripts',
        'copy-fonts',
        'less',
        'watch'
    ]);



    gulp.task('uglify', ['less'], function() {
        gulp.src(jsFiles.lib, {
            cwd : publicDir
        }).pipe(ngAnnotate()).pipe(uglify('libs.min.js')).pipe(gulp.dest(distDir));
        gulp.src(jsFiles.scripts, {
            cwd : publicDir
        }).pipe(ngAnnotate()).pipe(uglify('scripts.min.js')).pipe(gulp.dest(distDir));
        gulp.src('style.css', {
            cwd : distDir
        }).pipe(minifyCSS()).pipe(rename({
            suffix : '.min'
        })).pipe(gulp.dest(distDir));
    });

    gulp.task('template-cache', function() {
        gulp.src('modules/**/*.html', {
            cwd : publicDir
        }).pipe(templateCache('templates.js', {
            standalone : false,
            root       : '/p/modules',
            module     : 'app'
        })).pipe(gulp.dest(distDir));
    });

    gulp.task('zip-lib', function() {
        gulp.src(pyLibDir + '/**/*')
            .pipe(zip('pylibs.zip'))
            .pipe(gulp.dest('./main/'));
    });

    gulp.task('build', [
        'zip-lib',
        'uglify',
        'inject-scripts',
        'template-cache',
        'copy-fonts'
    ]);

    gulp.task('default', ['run']);
}());