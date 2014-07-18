'use strict';

var gulp = require('gulp');
var nodemon = require('gulp-nodemon');

var jshint = require('gulp-jshint');
var less = require('gulp-less');

var concat = require('gulp-concat');
var minifyCss = require('gulp-minify-css');
var minifyJs = require('gulp-uglify');


var paths = {
  js: ['gruntfile.js', 'app.js', 'config/**/*.js', 'app/**/*.js', 'public/js/**', 'test/**/*.js'],
  less: {
    watch: 'assets/less/**/*.less',
    source: 'assets/less/style.less',
    target: 'public/stylesheets'
  },
  minify: {
    css: 'public/stylesheets/style.css',
    js: 'public/js/**/*.js',
    target: 'public/dist/'
  },
  ignores: ['/lib/**', 'public/**']
};

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
  return gulp.src(paths.js)
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'));
});

// LESS compiling
gulp.task('less', function() {
  return gulp.src(paths.less.source)
    .pipe(less())
    .pipe(gulp.dest(paths.less.target));
});

gulp.task('minify', function() {
  gulp.src(paths.minify.css)
    .pipe(minifyCss())
    .pipe(gulp.dest(paths.minify.target));

  gulp.src(paths.minify.js)
    .pipe(concat('all.js'))
    .pipe(minifyJs())
    .pipe(gulp.dest(paths.minify.target));
});

// Nodemon (auto-restart node-apps)
gulp.task('nodemon', function() {
  nodemon(nodemonOptions);
});

// Auto-run tasks on file changes
gulp.task('watch', function() {
  gulp.watch(paths.js, ['lint']);
  gulp.watch(paths.less.watch, ['less']);
});

// Run main tasks on launch
gulp.task('default', ['lint', 'less', 'watch', 'nodemon'], function() {
});
