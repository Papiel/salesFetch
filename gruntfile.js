'use strict';
var paths = {
  js: ['gruntfile.js', 'app.js', 'config/**/*.js', 'app/**/*.js', 'public/js/**', 'test/**/*.js']
};

module.exports = function(grunt) {
  // Project Configuration
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    watch: {
      js: {
        files: paths.js,
        tasks: ['jshint']
      }
    },

    jshint: {
      options: {
        jshintrc: '.jshintrc',
        force: true
      },
      all: {
        src: paths.js
      }
    },

    nodemon: {
      dev: {
        script: 'app.js',
        options: {
          ignoredFiles: ['public/**'],
          watchedExtensions: ['js'],
          delayTime: 1,
          env: {
            PORT: 3000
          },
          cwd: __dirname
        }
      }
    },

    concurrent: {
      tasks: ['nodemon', 'watch'],
      options: {
        logConcurrentOutput: true
      }
    }
  });

  //Load NPM tasks
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-nodemon');
  grunt.loadNpmTasks('grunt-concurrent');
  grunt.loadNpmTasks('grunt-env');

  //Making grunt default to force in order not to break the project.
  grunt.option('force', true);

  //Default task(s).
  grunt.registerTask('default', ['jshint', 'concurrent']);
};