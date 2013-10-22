# For a more robust explanation of the steroids.config properties, we strongly recommended you to read the relevant Steroids Guide at:
# http://guides.appgyver.com/steroids/guides/project_configuration/config-application-coffee/

# -- Required settings --
# Name of the application, used by AppGyver Cloud Services after you have used the command
#
#   $ steroids deploy
#
# to create a cloud-deployed build of your app.

steroids.config.name = "Piazzo"

# -- Location: steroids.config.location --
# Defines the location of the HTML document that Steroids will load when your app starts.
# Enabling the tab bar via 'steroids.config.tabBar.enabled = true' will override this value.
# Valid values are:
#   - "index.html" - served with File URL, like in PhoneGap.
#   - "http://localhost/index.html" - served from the device's web server.
#   - "http://www.google.com - any external URL.

steroids.config.location = "views/piazzo/index.html"

# -- Remote hosts: steroids.config.hosts --
# Defines the hostnames that the application will capture. Requests by the Steroids app to a captured hostname will be served from localhost. Using the example below, the file at www/index.html would be served equivalently from both http://localhost/index.html and http://mobileapp.example.com/index.html.
# Please see the Steroids Guide linked at the top of this document for a more elaborate explanation.
# Default: []
#
# steroids.config.hosts = ["mobileapp.example.com", "m.example.net"]

# -- Enabling tabs --
#
# A boolean to enable the native tab bar.
# Enabling tabs will override steroids.config.location (which is inteded for single WebView apps, i.e. PhoneGap's default behavior) and show the first tab of the tab array on startup.
# Default: false
#
# steroids.config.tabBar.enabled = true

# -- Defining tabs via the tab array --
# An array of tab objects that specify which tabs are shown on app startup.
#
# Tab object properties are:
# - title: text to show in the tab title
# - icon: path to the tab's icon file, relative to dist/, e.g. icons/pill@2x.png (iOS only)
# - location: defines the HTML document the tab will render , can be one of these:
#   - "index.html" - served with File URL, like in PhoneGap.
#   - "http://localhost/index.html" - served from the device's web server.
#   - "http://www.google.com - any external URL.
#
# steroids.config.tabBar.tabs = [
#   {
#     title: "Index"
#     icon: "icons/pill@2x.png"
#     location: "http://localhost/views/steroidsTutorial/index.html"
#   },
#   {
#     title: "Welcome"
#     icon: ""
#     location: "index.html"
#   },
#   {
#     title: "Internet"
#     icon: "icons/telescope@2x.png"
#     location: "http://www.google.com"
#   }
# ]

# -- Selected tab background image --
# Used to set an indicator image for the selected tab on iOS (can be bigger than the tab area).
# Default: ""
#
# steroids.config.tabBar.selectedTabBackgroundImage = ""

# -- Colors --
# Color values can be set in hex codes, eg. #ffbb20
# Setting these values will override the values set by the application theme defined by steroids.config.theme
# Default for all attributes: ""

# steroids.config.tabBar.tintColor = ""
# steroids.config.tabBar.tabTitleColor = ""
# steroids.config.tabBar.tabTitleShadowColor = ""
# steroids.config.tabBar.selectedTabTintColor = ""

steroids.config.navigationBar.tintColor = "#00aeef"
steroids.config.navigationBar.titleColor = "#ffffff"
steroids.config.navigationBar.titleShadowColor = "#000000"

steroids.config.navigationBar.buttonTintColor = "#363636"
steroids.config.navigationBar.buttonTitleColor = "#ffffff"
steroids.config.navigationBar.buttonShadowColor = "#000000"

#
# Loading screen color is used by Android only, on the background of loading.png

steroids.config.loadingScreen.tintColor = "#262626"

# -- iOS theme --
# Sets a built-in theme for the navigation bar and tab bar. Valid values are "black" and "default".
# Default: "default"
#
# steroids.config.theme = "default"

# -- Status bar --
# Sets the visibilty of the status bar on iOS (shows the carrier, clock and battery status)
# Default: false

steroids.config.statusBar.enabled = true

# -- Editor --
# The Steroids console (shown when "$ steroids connect" is running) commands 'editor' and 'e' run the given command with the given arguments. The arguments are always given as an array.
# Default command: "subl"
# Default arguments: ["."]
#
# steroids.config.editor.cmd = "subl"
# steroids.config.editor.args = ["."]

# -- Pre- and post-build hooks --
# Run your own build commands before and after Steroids builds your app. The arguments are always given as an array.
# Defaults: none
#
# The preMake command is run before `steroids make`, the process where `app/` and `www/` folders are processed into the `dist/` folder.
# steroids.config.hooks.preMake.cmd = "echo"
# steroids.config.hooks.preMake.args = ["running yeoman"]
#
# The postMake command is run right after `steroids make`, before running `steroids package`, the process that packages the app before sending it to client devices.
# steroids.config.hooks.postMake.cmd = "echo"
# steroids.config.hooks.postMake.args = ["cleaning up files"]
