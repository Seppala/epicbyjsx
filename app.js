
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
//Dependencies on our files
var config = require('./config');
var ensureAuthenticated = require('./routes/routehelpers').ensureAuthenticated;

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
  app.use(express.session({ secret: 'asdfkkdkdkdkdasddnng' }));
  app.use(passport.initialize());
  app.use(passport.session());  
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(app.router);
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

//ROUTES

require('./routes/auth')(app);
require('./routes/user')(app);
require('./routes/upfo')(app);

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


