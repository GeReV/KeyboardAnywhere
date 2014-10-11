module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    clean: {
      src: ['build/']
    },
    jshint: {
      "default": {
        src: ['src/*.js']
      }
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      "default": {
        files: [{
          expand: true,
          cwd: 'js',
          src: 'src/*.js',
          dest: 'build'
        }]
      }
    },
    sass: {
      "default": {
        options: {
          style: 'compressed'
        },
        files: {
          'build/keyboard.css': 'assets/keyboard.scss'
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-autoprefixer');

  // Default task(s).
  grunt.registerTask('default', ['jshint', 'clean', 'uglify', 'sass']);

};