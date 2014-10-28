'use strict';

var gulp = require('gulp');
var less = require('gulp-less');
var browserify = require('gulp-browserify');
var minifyJs = require('gulp-uglify');
var minifyCss = require('gulp-minify-css');

var isProduction = (process.env.NODE_ENV === 'production');

var paths = {
  js: {
    all: ['gruntfile.js', 'app.js', 'config/**/*.js', 'app/**/*.js', 'assets/js/**', 'test/**/*.js'],
    client: ['assets/js/**'],
    entryPoints: ['assets/js/main.js']
  },
  less: {
    watch: 'assets/less/**/*.less',
    entryPoints: ['assets/less/style.less', 'assets/less/full-view.less'],
  },
  libs: {
    entryPoints: [
      'bower_components/anyfetch-assets/dist/index.min.css',
      'bower_components/anyfetch-assets/dist/index-moment.min.js',
      'bower_components/anyfetch-assets/dist/images/*/*'
    ],
  },
  target: 'public/dist/',
  ignores: ['/lib/**', 'public/**']
};

// LESS compiling
// TODO: compile fontawesome to use a few glyphs only?
gulp.task('less', function() {
  var p = gulp.src(paths.less.entryPoints)
    .pipe(less());

  if(isProduction) {
    p = p.pipe(minifyCss());
  }

  return p.pipe(gulp.dest(paths.target));
});

// JS compiling
gulp.task('browserify', ['less'], function() {
  var p = gulp.src(paths.js.entryPoints)
    .pipe(browserify({
      debug: !isProduction,
      // No need for `__dirname`, `process`, etc in client JS
      insertGlobals: false,
      transform: ['brfs']
    }));

  if(isProduction) {
    p = p.pipe(minifyJs());
  }

  return p.pipe(gulp.dest(paths.target));
});

// Libs
gulp.task('libs', function() {
  var p = gulp.src(paths.libs.entryPoints);
  return p.pipe(gulp.dest(paths.target));
});

gulp.task('build', ['less', 'browserify', 'libs']);

// ----- Development only
if(!isProduction) {
  var nodemon = require('gulp-nodemon');
  var jshint = require('gulp-jshint');
  var livereload = require('gulp-livereload');

  var nodemonOptions = {
    script: 'bin/server',
    ext: 'js',
    env: {
      NODE_ENV: 'development',
      PORT: 3000
    },
    ignore: paths.ignores
  };

  // JS linting
  gulp.task('lint', function() {
    return gulp.src(paths.js.all)
      .pipe(jshint())
      .pipe(jshint.reporter('jshint-stylish'));
  });

  // Nodemon (auto-restart node-apps)
  gulp.task('nodemon', function() {
    nodemon(nodemonOptions);
  });

  // Auto-run tasks on file changes
  gulp.task('watch', function() {
    gulp.watch(paths.js.all, ['lint']);
    gulp.watch(paths.js.client, ['lint', 'browserify']);
    gulp.watch(paths.less.watch, ['less', livereload.changed]);
  });

  gulp.task('livereload', function() {
    livereload.listen();
    gulp.watch(paths.less.watch, []);
  });

  // Run main tasks on launch
  gulp.task('default', ['lint', 'build', 'nodemon', 'watch', 'livereload'], function() {
  });
}
