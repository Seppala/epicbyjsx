chalk = require "chalk"

fs = require "fs"
wrench = require "wrench"
path = require "path"

module.exports = (grunt)->

  grunt.loadNpmTasks "grunt-contrib-clean"
  grunt.loadNpmTasks "grunt-contrib-copy"
  grunt.loadNpmTasks "grunt-contrib-concat"
  grunt.loadNpmTasks "grunt-contrib-coffee"
  grunt.loadNpmTasks "grunt-extend-config"


  grunt.registerTask "steroids-make", "Create the dist/ folder that is copied to the device.", [
    "steroids-clean-dist"
    "steroids-copy-js-from-app"
    "steroids-copy-www"
    "steroids-compile-coffee"
    "steroids-concat-models"
    "steroids-compile-views"
    "steroids-cordova-merges"
  ]

  grunt.registerTask "steroids-clean-dist", "Clean dist/", ->

    grunt.extendConfig
      clean:
        # Clean dist/ folder (delete and create again)
        dist:
          ["dist/"]

    grunt.task.run "clean:dist"


  grunt.registerTask "steroids-copy-js-from-app", "Copy JavaScript files from app/ to dist/", ->

    grunt.extendConfig
      copy:
        js_from_app:
          expand: true
          cwd: "app/"
          src: ["**/*.js"]
          dest: "dist/"

    grunt.task.run "copy:js_from_app"


  grunt.registerTask "steroids-copy-www", "Copy files from www/ to dist/ (except for .scss and .coffee)", ->

    grunt.extendConfig
      copy:
        www:
          expand:true
          cwd: 'www/'
          src: ['**/*.*', '!**/*.coffee', '!**/*.scss']
          dest: 'dist/'

    grunt.task.run "copy:www"


  grunt.registerTask "steroids-compile-coffee", "Compile CoffeeScript files from app/ and www/ to dist/", ->

    grunt.extendConfig
      coffee:
        compile_app:
          expand: true
          cwd: "app/"
          src: ["**/*.coffee"]
          dest: "dist/"
          ext: ".js"
        compile_www:
          expand: true
          cwd: "www/"
          src: ["**/*.coffee"]
          dest: "dist/"
          ext: ".js"

    grunt.task.run "coffee:compile_app"
    grunt.task.run "coffee:compile_www"

  grunt.registerTask "steroids-concat-models", "Concatenate all JS files in dist/model/ into dist/models/models.js", ->

    grunt.extendConfig
      concat:
        models:
          src: 'dist/models/*.js'
          dest: 'dist/models/models.js'

    grunt.task.run "concat:models"


  grunt.registerTask "steroids-compile-views", "Compile views", ->

    buildDirectory            = "dist"
    buildControllersDirectory = path.join "dist", "controllers"

    appLayoutsDirectory       = path.join "app", "views", "layouts"

    wwwDirectory              = "www"

    viewDirectories = []

    # get each view folder (except layout)
    for dirPath in grunt.file.expand "app/views/*" when fs.statSync(dirPath).isDirectory()
      basePath = path.basename(dirPath)
      unless basePath is "layouts" + path.sep or basePath is "layouts"
        viewDirectories.push dirPath


    for viewDir in viewDirectories
      # resolve layout file for these views
      layoutFileName = "";

      # Some machines report folder/ as basename while others do not
      viewBasename = path.basename viewDir

      unless viewBasename.indexOf(path.sep) is -1
        viewBasename = viewBasename.replace path.sep, ""

      layoutFileName = "#{viewBasename}.html"

      layoutFilePath = path.join appLayoutsDirectory, layoutFileName

      # If no resource-specific layout is found, use application.html
      unless fs.existsSync(layoutFilePath)
        layoutFilePath = path.join appLayoutsDirectory, "application.html"

      applicationLayoutFile = grunt.file.read layoutFilePath, "utf8"

      for filePathPart in grunt.file.expand(path.join(viewDir, "**", "*")) when fs.statSync(filePathPart).isFile()

        filePath = path.resolve filePathPart

        buildFilePath = path.resolve filePathPart.replace("app"+path.sep, "dist"+path.sep)

        resourceDirName = filePathPart.split("/").splice(-2,1)[0]

        buildFilePath = path.join(buildDirectory, "views", resourceDirName, path.basename(filePathPart))

        # skip "partial" files that begin with underscore
        if /^_/.test path.basename(filePath)
          yieldedFile = grunt.file.read(filePath, "utf8")
        else

          controllerName = path.basename(viewDir).replace(path.sep, "")
          controllerBasenameWithPath = path.join(buildControllersDirectory, "#{controllerName}")



          unless fs.existsSync "#{controllerBasenameWithPath}.js"
            warningMessage = "#{chalk.red("Warning:")} There is no controller for resource "#{controllerName}".  Add file app/controllers/#{controllerName}.{js|coffee}"
            grunt.log.writeln warningMessage

          yieldObj =
            view: grunt.file.read(filePath, "utf8")
            controller: controllerName

          # put layout+yields together
          yieldedFile = grunt.util._.template(
            applicationLayoutFile.toString()
          )({ yield: yieldObj })

        # write the file
        grunt.log.write "Creating file #{buildFilePath}..."
        grunt.file.mkdir path.dirname(buildFilePath)
        grunt.file.write buildFilePath, yieldedFile
        grunt.log.writeln "#{chalk.green("OK")}"


  grunt.registerTask "steroids-cordova-merges", "Handle Cordova merges", ->

    grunt.log.write("Moving platform-specific files from the merges/ directory to dist/...")

    distDirectory           = "dist"

    mergesDirectory         = "merges"
    androidMergesDirectory  = path.join mergesDirectory, "android"
    iosMergesDirectory      = path.join mergesDirectory, "ios"

    mergesExist = fs.existsSync mergesDirectory
    if mergesExist
      # Android
      for filePath in grunt.file.expand(path.join(androidMergesDirectory, "*")) when fs.statSync(filePath).isFile()
        filePath = path.normalize(filePath) # fix windows path syntax
        grunt.log.writeln chalk.yellow("Copying Android Merges:")

        # setup proper paths and filenames to steroids android comptible syntax: index.html to index.android.html
        origFileName  = path.basename filePath
        origFileExtension = path.extname origFileName
        androidPrefixedExtension = ".android#{origFileExtension}"
        androidFileName = origFileName.replace origFileExtension, androidPrefixedExtension
        filePathInDist = filePath.replace(androidMergesDirectory, distDirectory)
        filePathInDistWithAndroidExtensionPrefix = filePathInDist.replace(origFileName, androidFileName)

        grunt.log.writeln "#{filePath.replace(androidMergesDirectory+"/", "")} -> dist#{filePathInDistWithAndroidExtensionPrefix.replace(distDirectory, "")}"

        if fs.existsSync filePathInDistWithAndroidExtensionPrefix
          grunt.log.writeln "#{chalk.red("Overwriting:")} dist#{filePathInDistWithAndroidExtensionPrefix.replace(distDirectory, "")}"

        fs.writeFileSync filePathInDistWithAndroidExtensionPrefix, fs.readFileSync(filePath)

      # iOS
      for filePath in grunt.file.expand(path.join(iosMergesDirectory, "*")) when fs.statSync(filePath).isFile()
        filePath = path.normalize(filePath) # fix windows path syntax
        grunt.log.writeln chalk.yellow("Copying iOS Merges:")

        # setup proper paths for file copy
        filePathInDist = filePath.replace(iosMergesDirectory, distDirectory)

        grunt.log.writeln "#{filePath.replace(iosMergesDirectory+"/", "")} -> dist#{filePathInDist.replace(distDirectory, "")}"

        if fs.existsSync filePathInDist
          grunt.log.writeln "#{chalk.red("Overwriting:")} dist#{filePathInDist.replace(distDirectory, "")}"

        fs.writeFileSync filePathInDist, fs.readFileSync(filePath)

    grunt.log.writeln "#{chalk.green("OK")}"
