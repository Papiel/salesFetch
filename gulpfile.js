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
    publicEntryPoint: 'assets/js/main.js'
  },
  less: {
    watch: 'assets/less/**/*.less',
    source: 'assets/less/style.less',
  },
  target: 'public/dist/',
  ignores: ['/lib/**', 'public/**']
};

// LESS compiling
gulp.task('less', function() {
  var p = gulp.src(paths.less.source)
    .pipe(less());

  if(isProduction) {
    p = p.pipe(minifyCss());
  }

  return p.pipe(gulp.dest(paths.target));
});

// JS compiling
gulp.task('browserify', function() {
  var p = gulp.src(paths.js.publicEntryPoint)
    .pipe(browserify({
      debug: !isProduction,
      // No need for `__dirname`, `process`, etc in client JS
      insertGlobals: false
    }));

  if(isProduction) {
    p = p.pipe(minifyJs());
  }

  return p.pipe(gulp.dest(paths.target));
});

// ----- Development only
if(!isProduction) {
  var nodemon = require('gulp-nodemon');
  var jshint = require('gulp-jshint');


  var nodemonOptions = {
    script: 'bin/server',
    ext: 'js',
    env: {
      NODE_ENV: 'development',
      PORT: 3000
    },
    ignore: paths.ignores
  };

  // TODO: compile fontawesome to use a few glyphs only?
  // TODO: compile all lib JS & CSS to a single HTML base skeleton file using an HTML template, then uglify the HTML

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
    gulp.watch(paths.less.watch, ['less']);
  });

  // Run main tasks on launch
  gulp.task('default', ['lint', 'less', 'browserify', 'watch', 'nodemon'], function() {
  });
}
