'use strict';

var paths = {
  js: ['gruntfile.js', 'app.js', 'config/**/*.js', 'app/**/*.js', 'public/js/**', 'test/**/*.js'],
  ignores: ['/lib/**'],
  less: ['assets/less/*.less']
};

module.exports = function(grunt) {
  // Project Configuration
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    // Watch for modifications in files
    watch: {
      js: {
        files: paths.js,
        tasks: ['jshint']
      },
      styles: {
        files: paths.less,
        tasks: ['less']
      }
    },

    // Lint JS source
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        force: true,
        ignores: paths.ignores
      },
      all: {
        src: paths.js
      }
    },

    // Compile LESS stylesheets
    less: {
      options: {
        paths: paths.less,
        ieCompat: true,
        cleancss: true
      },
      all: {
        files: {
          'public/stylesheets/style.css': 'assets/less/style.less'
        }
      }
    },

    // TODO: minify stylesheets & js

    // Restart app if it crashes
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

  // Load NPM tasks
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-nodemon');
  grunt.loadNpmTasks('grunt-concurrent');
  grunt.loadNpmTasks('grunt-env');

  // Making grunt default to force in order not to break the project
  grunt.option('force', true);

  // Default task(s)
  grunt.registerTask('default', ['jshint', 'less', 'concurrent']);
};
