module.exports = function (grunt) {
  var _pkg = grunt.file.readJSON('package.json');

  grunt.initConfig({
    pkg: _pkg,
    uglify: {
      options: {
        mangle: false
      },
      js: {
          files: {
              'dist/ng-d3matrix.min.js': ['src/ng-d3matrix.js']
          }
      }
    },
    cssmin: {
      options: {
        shorthandCompacting: false,
        roundingPrecision: -1
      },
      target: {
        files: {
            'dist/css/ng-d3matrix.min.css' : ['src/css/ng-d3matrix.css']
        }
      }
    }
  })

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.registerTask('default', ['cssmin', 'uglify']);
}
