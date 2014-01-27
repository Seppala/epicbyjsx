module.exports = (grunt)->

  grunt.loadNpmTasks 'grunt-contrib-sass'
  grunt.loadNpmTasks 'grunt-extend-config'

  grunt.registerTask 'steroids-compile-sass', "Compile SASS files if they exist", ->

    grunt.extendConfig
      sass:
        dist:
          files: [
            {
              expand: true
              cwd: 'app/'
              src: ['**/*.scss', '**/*.sass']
              dest: 'dist/'
              ext: '.css'
            }
            {
              expand: true
              cwd: 'www/'
              src: ['**/*.scss', '**/*.sass']
              dest: 'dist/'
              ext: '.css'
            }
          ]

    sassFiles = grunt.file.expand(["www/**/*.scss", "www/**/*.sass", "app/**/*.scss", "app/**/*.sass"])

    if sassFiles.length > 0
      grunt.log.writeln("SASS files found, attempting to compile them to dist/...")
      grunt.task.run("sass:dist")

    else
      grunt.log.writeln("No .scss or .sass files found in app/ or www/, skipping SASS compile.")
