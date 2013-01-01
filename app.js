
/**
 * Module dependencies.
 */

var express = require('express')
  //, routes = require('./routes')
  , http = require('http')
  , path = require('path');
  //, api = require('./routes/api');

var app = express();

var config = require('./config');

var User = require('./models/user');

var mongoose = require('mongoose');

//DB CONNECTION

mongoose.connect(config.development.dbUrl);

//PASSPORT STUFF

var passport = require('passport'),
  	FacebookStrategy = require('passport-facebook').Strategy;

// Passport seliarization and deserialization

passport.serializeUser(function(user, done){
	done(null, user.id)
});

passport.deserializeUser(function(id, done){
	User.findOne(id, function(err, user){
		done(err, user);
	});
});

//Setting up passport

passport.use(new FacebookStrategy({
	clientID: config.development.fb.appId,
	clientSecret: config.development.fb.appSecret,
	callbackURL: config.development.fb.url + 'fbauthed'
	},
	function(accessToken, refreshToken, profile, done) {
		process.nextTick( function(){
			var query = User.findOne({'fbId': profile.id });
			query.exec(function(err, oldUser){
				if (oldUser) {
					console.log('Existing User: ' + oldUser.name + ' found and logged in!');
					done(null, oldUser);
				} else {
					var newUser = new User();
					newUser.fbId = profile.id;
					newUser.name = profile.displayName;
					
					newUser.save(function(err){
						if (err) throw err;
						console.log('new user created: ' + newUser.name + ' and logged in...');
						done(null, newUser);
					});
				}
			});
		});
	}
));

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  //app.set('views', __dirname + '/views');
  //app.set('view engine', 'jade');
  //app.use
  //app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'asdfkkdkdkdkdasddnng'}));
  app.use(passport.initialize());
  app.use(passport.session());  
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});



// MODELS

var userSchema = new mongoose.Schema({
	fbId: String,
	name: String,
	friends_list: [Number],
	geo: {type: [Number], index: '2d'},
	upfo: Boolean
});

var User = mongoose.model('User', userSchema);
// export this model if done form another file: module.exports = mongoose.model('User', userSchema);

//ROUTES

api = function (req, res) {
	res.send({ upfo:req.params.upfo, success: "YesOrNo"});
}

upfo = function (req, res) {
	fbId
}


//URLs

// app.get('/', index);
app.get('/fbauth', passport.authenticate('facebook'));
app.get('/fbauthed', passport.authenticate('facebook', { successRedirect: '/', failureRedirect: '/'}));
app.get('/logout', function(req, res){
	req.logOut();
	res.redirect('/');
});

app.get('/api', api);
app.post('/api', upfo); 
app.get('/api/users', function (req, res){
  return User.find(function (err, users) {
    if (!err) {
      return res.send(users);
    } else {
      return console.log(err);
    }
  });
});

app.put('/api/users/:id', function (req, res){
  return User.findById(req.params.id, function (err, user) {
    if (req.body.upfo) {
		user.upfo = req.body.upfo; }
	user.friends_list = req.body.friends_list;
    return user.save(function (err) {
      if (!err) {
        console.log("updated");
      } else {
        console.log(err);
      }
      return res.send(user);
    });
  });
});

app.delete('/api/users/:id', function (req, res){
  return User.findById(req.params.id, function (err, user) {
    return user.remove(function (err) {
      if (!err) {
        console.log("removed");
        return res.send('');
      } else {
        console.log(err);
      }
    });
  });
});

app.post('/api/upfo', function (req, res){
  var user;
  console.log("POST: " + req);
  console.log(req.body); 
  return res.send(product);         
});
// app.get('/users', user.list);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
