'use strict';

var gulp = require('gulp');
var jshint = require('gulp-jshint');
var less = require('gulp-less');
var nodemon = require('gulp-nodemon');

var paths = {
  js: ['gruntfile.js', 'app.js', 'config/**/*.js', 'app/**/*.js', 'public/js/**', 'test/**/*.js'],
  less: {
    source: 'assets/less/style.less',
    target: 'public/stylesheets'
  },
  ignores: ['/lib/**', 'public/**']
};

var nodemonOptions = {
  script: 'app.js',
  ext: 'js',
  env: {
    NODE_ENV: 'development',
    PORT: 3000
  },
  ignore: paths.ignores
};

// JS linting
gulp.task('lint', function() {
  return gulp.src(paths.js)
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'));
});

// LESS compiling
// TODO: source maps?
gulp.task('less', function() {
  return gulp.src(paths.less.source)
    .pipe(less())
    .pipe(gulp.dest(paths.less.target));
});

// TODO: add a task to minify CSS & JS
// TODO: compile fontawesome to use a few glyphs only?
// TODO: compile all lib JS & CSS to a single HTML base skeleton file using an HTML template

// Nodemon (auto-restart node-apps)
gulp.task('nodemon', function() {
  nodemon(nodemonOptions)
    .on('change', ['lint']);
});


// Auto-run tasks on file changes
gulp.task('watch', function() {
  gulp.watch(paths.js, ['lint']);
  gulp.watch(paths.less.source, ['less']);
});

gulp.task('default', ['lint', 'less', 'nodemon'], function() {
  console.log('Hello gulp');
});
