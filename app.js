
/**
 * Module dependencies.
 */
var express = require('express')
  //, routes = require('./routes')
  , http = require('http')
  , path = require('path');
  //, api = require('./routes/api');
var request = require('request');
var app = express();
var mongoose = require('mongoose');
var passport = require('passport'),
  	FacebookStrategy = require('passport-facebook').Strategy;
var util = require('util');
var expressValidator = require('express-validator');
//Dependencies on our files
var config = require('./config');
var ensureAuthenticated = require('./routes/routehelpers').ensureAuthenticated;
var sort = require('./helpers/sort').sort_by;

//Require redis 
//Authenticate with redis to go if we're on Heroku and the REDISTOGO_URL exists.
var RedisStore = require('connect-redis')(express);
if (process.env.REDISTOGO_URL) {
  console.log("Running RedisToGo in production...");
  var rtg   = require("url").parse(process.env.REDISTOGO_URL);
	var redis = require("redis").createClient(rtg.port, rtg.hostname);
	redis.auth(rtg.auth.split(":")[1]);
} else {
//if we're not in production, no need for that.
  console.log("Running Redis in development...");
  var redis = require("redis").createClient();
}


//DB CONNECTION

mongoose.connect(config.dbUrl);

// Configuration of the app

app.configure(function(){
  app.set('port', process.env.PORT || 5000);
  //app.set('views', __dirname + '/views');
  //app.set('view engine', 'ejs');
  //app.use
  //app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.session({ store: new RedisStore({client: redis}), secret: 'asdfkkdkdkdkdasddnng1234553x' }));
  app.use(passport.initialize());
  app.use(passport.session());  
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(expressValidator());
  app.use(app.router);
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

//ROUTES

require('./routes/auth')(app);
require('./routes/user')(app);
//require('./routes/upfo')(app);

//MODELS

var UserModel = require('./models/user').UserModel;

app.get('/api/users', function (req, res){
  return UserModel.find(function (err, users) {
    if (!err) {
	  //console.log(req.session);
      return res.send(users);
    } else {
      return console.log(err);
    }
  });
});

//SERVER

// Creating the actual server
http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});


